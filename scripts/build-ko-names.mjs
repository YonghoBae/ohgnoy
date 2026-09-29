// Korean names for Smogon/pkmn battle data -> src/lib/battle/koNames.json
//
// Regenerate: node scripts/build-ko-names.mjs   (Node >= 18, no deps)
// After regenerating, bump CACHE_VERSION in src/lib/battle/fetchers/
// fetchBattleData.ts: cached lookups may hold null for names that now resolve.
//
// Keys are Smogon ids: toID("Choice Specs") === "choicespecs".
// pokemon: { [toID]: { slug, ko, en } } — en is PokeAPI's English display name.
// en: { items, moves, abilities: { [toID]: English name } }.
import { writeFileSync } from "node:fs";

const GQL = "https://beta.pokeapi.co/graphql/v1beta";
const OUT = new URL("../src/lib/battle/koNames.json", import.meta.url);
const REST = "https://pokeapi.co/api/v2";

const toID = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

async function getJSON(url, init) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, init);
      if (!res.ok) throw new Error(`${url} responded ${res.status}`);
      return await res.json();
    } catch (e) {
      if (attempt >= 4) throw e;
      console.warn(`retry ${attempt}: ${e.message}`);
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
}

async function gql(query) {
  const json = await getJSON(GQL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

// slug -> pick(json) from REST /api/v2/<rest>/<slug>, 10 requests at a time.
async function fromRest(rest, slugs, pick) {
  const out = {};
  const queue = [...slugs];
  const worker = async () => {
    for (let slug; (slug = queue.shift()); ) {
      const json = await getJSON(`${REST}/${rest}/${slug}`).catch(() => null);
      const value = json && pick(json);
      if (value) out[slug] = value;
    }
  };
  await Promise.all(Array.from({ length: 10 }, worker));
  console.log(`${rest}: ${Object.keys(out).length}/${slugs.length} filled from REST`);
  return out;
}

const koIn = (list = []) => list.find((n) => n.language.name === "ko")?.name;

const enIn = (list = []) => list.find((n) => n.language.name === "en")?.name;

// PokeAPI slug -> { ko, en } maps, for tables shaped { name, <namesTable> { name } }.
// The GraphQL beta lags REST (no ko for Gen 9 moves/items/abilities), so rows
// without ko/en fall back to REST /api/v2/<rest>/<slug> when `rest` is given.
async function names(table, namesTable, rest) {
  const rows = (
    await gql(`{ ${table} { name ${namesTable}${KO_EN} { name language_id } } }`)
  )[table];
  const ko = {};
  const en = {};
  const missing = [];
  for (const r of rows) {
    const k = byLang(r[namesTable], 3)?.name.trim(); // some have leading spaces
    const e = byLang(r[namesTable], 9)?.name.trim();
    if (k) ko[toID(r.name)] = k;
    if (e) en[toID(r.name)] = e;
    if (!k || !e) missing.push(r.name);
  }
  if (!rest) return { ko, en };
  const filled = await fromRest(rest, missing, (json) => {
    const k = koIn(json.names)?.trim();
    const e = enIn(json.names)?.trim();
    return k || e ? { k, e } : undefined;
  });
  for (const [slug, { k, e }] of Object.entries(filled)) {
    ko[toID(slug)] ??= k;
    en[toID(slug)] ??= e;
  }
  return { ko, en };
}

// PokeAPI has no ko form names for most Gen 8+ regional forms.
const REGION = { alola: "알로라", galar: "가라르", hisui: "히스이", paldea: "팔데아" };

// ko (3) and en (9): en is the display name shown under the Korean one.
const KO_EN = "(where: {language_id: {_in: [3, 9]}})";
const byLang = (list = [], id) => list.find((n) => n.language_id === id);

// Smogon names PokeAPI has no slug for.
const ALIASES = {
  "necrozma-dusk-mane": "necrozma-dusk",
  "necrozma-dawn-wings": "necrozma-dawn",
};
// Arceus-Ground etc. are forms of the one "arceus" Pokémon, not Pokémon.
const TYPES = [
  "normal", "fire", "water", "grass", "electric", "ice", "fighting", "poison",
  "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark",
  "steel", "fairy",
];

async function pokemonNames(types) {
  const { pokemon_v2_pokemon: rows } = await gql(`{ pokemon_v2_pokemon {
    id name
    pokemon_v2_pokemonspecy { name pokemon_v2_pokemonspeciesnames${KO_EN} { name language_id } }
    pokemon_v2_pokemonforms { pokemon_v2_pokemonformnames${KO_EN} { name pokemon_name language_id } }
  } }`);

  const out = {};
  const add = (key, entry) => {
    const id = toID(key);
    if (id && !out[id]) out[id] = entry;
  };

  // GraphQL marks ursaluna-bloodmoon is_default (REST doesn't); default
  // varieties are the ones whose id is the species' dex number.
  const isDefault = (p) => p.id < 10000;
  const formNamesOf = (p) => p.pokemon_v2_pokemonforms[0]?.pokemon_v2_pokemonformnames;
  // GraphQL lags REST here too ("붉은 달" for ursaluna-bloodmoon).
  const restForms = await fromRest(
    "pokemon-form",
    rows.filter((p) => !isDefault(p) && !byLang(formNamesOf(p), 3)).map((p) => p.name),
    (json) => (koIn(json.names) || koIn(json.form_names))?.trim()
  );

  const entries = rows.map((p) => {
    const species = p.pokemon_v2_pokemonspecy;
    const spNames = species.pokemon_v2_pokemonspeciesnames;
    const formNames = formNamesOf(p);
    const sp = byLang(spNames, 3)?.name.trim() ?? p.name;
    const form = byLang(formNames, 3)?.name.trim() ?? restForms[p.name];
    const spEn = byLang(spNames, 9)?.name.trim() ?? p.name;
    const formEn = byLang(formNames, 9);
    const region = p.name.split("-").find((w) => REGION[w]);
    let ko = sp;
    let en = spEn;
    // The default variety is what Smogon calls by the bare species name
    // ("Landorus"), so it keeps the plain species name.
    if (!isDefault(p)) {
      if (form?.includes(sp)) ko = form; // own name: 메가리자몽X, 워시로토무
      else if (form) ko = `${sp} (${form})`;
      else if (region) ko = `${sp} (${REGION[region]}의 모습)`;
      // "Mega Charizard X", "Galarian Slowking", "Wellspring Mask Ogerpon"
      if (formEn?.pokemon_name) en = formEn.pokemon_name.trim();
      else if (formEn?.name) en = `${spEn} (${formEn.name.trim()})`;
    }
    return { p, species: species.name, entry: { slug: p.name, ko, en } };
  });

  for (const { p, entry } of entries) add(p.name, entry);
  // "Landorus" -> landorus-incarnate, before the trimmed aliases below can
  // hand it to landorus-therian.
  for (const { p, species, entry } of entries) if (isDefault(p)) add(species, entry);
  for (const { p, entry } of entries) {
    // "Ogerpon-Wellspring" -> ogerpon-wellspring-mask
    if (p.name.includes("-")) add(p.name.replace(/-[^-]+$/, ""), entry);
    // "Indeedee-F" -> indeedee-female
    if (p.name.endsWith("-female")) add(p.name.replace(/female$/, "f"), entry);
  }
  for (const [alias, slug] of Object.entries(ALIASES)) add(alias, out[toID(slug)]);
  for (const type of TYPES) {
    const Type = type[0].toUpperCase() + type.slice(1);
    add(`arceus${type}`, {
      slug: "arceus",
      ko: `아르세우스 (${types[type]})`,
      en: `Arceus-${Type}`,
    });
  }
  return out;
}

function latestMonth() {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - 1, 1); // day 1: no Oct 31 skip
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const types = (await names("pokemon_v2_type", "pokemon_v2_typenames")).ko;
const items = await names("pokemon_v2_item", "pokemon_v2_itemnames", "item");
const moves = await names("pokemon_v2_move", "pokemon_v2_movenames", "move");
const abilities = await names("pokemon_v2_ability", "pokemon_v2_abilitynames", "ability");
const data = {
  items: items.ko,
  moves: moves.ko,
  abilities: abilities.ko,
  natures: (await names("pokemon_v2_nature", "pokemon_v2_naturenames")).ko,
  types,
  pokemon: await pokemonNames(types),
  // English display names, for sets built from usage ids ("focussash").
  en: { items: items.en, moves: moves.en, abilities: abilities.en },
};
writeFileSync(OUT, JSON.stringify(data));
for (const [k, v] of Object.entries(data)) {
  console.log(`${k}: ${Object.keys(v).length}`);
}
for (const [k, v] of Object.entries(data.en)) {
  console.log(`en.${k}: ${Object.keys(v).length}`);
}

// Resolve rate against the current gen9ou usage file.
const month = latestMonth();
const chaos = await getJSON(
  `https://www.smogon.com/stats/${month}/chaos/gen9ou-1695.json`
);
const report = (label, ids, table) => {
  const miss = [...ids].filter((id) => !table[toID(id)]);
  console.log(
    `gen9ou ${month} ${label}: ${ids.size - miss.length}/${ids.size} resolve` +
      (miss.length ? ` — missing: ${miss.join(", ")}` : "")
  );
};
const mons = Object.values(chaos.data);
const keysOf = (field) =>
  new Set(mons.flatMap((m) => Object.keys(m[field] ?? {})).filter((k) => k && k !== "nothing"));
report("Pokémon", new Set(Object.keys(chaos.data)), data.pokemon);
report("moves", keysOf("Moves"), data.moves);
report("items", keysOf("Items"), data.items);
report("abilities", keysOf("Abilities"), data.abilities);
report("tera types", keysOf("Tera Types"), data.types);
