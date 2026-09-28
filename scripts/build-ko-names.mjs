// Korean names for Smogon/pkmn battle data -> src/lib/battle/koNames.json
//
// Regenerate: node scripts/build-ko-names.mjs   (Node >= 18, no deps)
//
// Keys are Smogon ids: toID("Choice Specs") === "choicespecs".
import { writeFileSync } from "node:fs";

const GQL = "https://beta.pokeapi.co/graphql/v1beta";
const OUT = new URL("../src/lib/battle/koNames.json", import.meta.url);
const REST = "https://pokeapi.co/api/v2";
const KO = "(where: {language_id: {_eq: 3}}) { name }";

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

// PokeAPI slug -> ko, for tables shaped { name, <namesTable> { name } }.
// The GraphQL beta lags REST (no ko for Gen 9 moves/items/abilities), so rows
// without ko fall back to REST /api/v2/<rest>/<slug> when `rest` is given.
async function names(table, namesTable, rest) {
  const rows = (await gql(`{ ${table} { name ${namesTable}${KO} } }`))[table];
  const out = {};
  const missing = [];
  for (const r of rows) {
    const ko = r[namesTable][0]?.name.trim(); // some have leading spaces
    if (ko) out[toID(r.name)] = ko;
    else missing.push(r.name);
  }
  if (!rest) return out;
  let filled = 0;
  const queue = [...missing];
  const worker = async () => {
    for (let slug; (slug = queue.shift()); ) {
      const json = await getJSON(`${REST}/${rest}/${slug}`).catch(() => null);
      const ko = json?.names.find((n) => n.language.name === "ko")?.name.trim();
      if (ko) (out[toID(slug)] = ko), filled++;
    }
  };
  await Promise.all(Array.from({ length: 10 }, worker));
  console.log(`${rest}: ${filled}/${missing.length} filled from REST`);
  return out;
}

// PokeAPI has no ko form names for most Gen 8+ regional forms.
const REGION = { alola: "알로라", galar: "가라르", hisui: "히스이", paldea: "팔데아" };

async function pokemonNames() {
  const { pokemon_v2_pokemon: rows } = await gql(`{ pokemon_v2_pokemon {
    name is_default
    pokemon_v2_pokemonspecy { name pokemon_v2_pokemonspeciesnames${KO} }
    pokemon_v2_pokemonforms { pokemon_v2_pokemonformnames${KO} }
  } }`);

  const out = {};
  const add = (key, entry) => {
    const id = toID(key);
    if (id && !out[id]) out[id] = entry;
  };

  const entries = rows.map((p) => {
    const species = p.pokemon_v2_pokemonspecy;
    const sp = species.pokemon_v2_pokemonspeciesnames[0]?.name.trim() ?? p.name;
    const form =
      p.pokemon_v2_pokemonforms[0]?.pokemon_v2_pokemonformnames[0]?.name.trim();
    const region = p.name.split("-").find((w) => REGION[w]);
    let ko = sp;
    // The default variety is what Smogon calls by the bare species name
    // ("Landorus"), so it keeps the plain species name.
    if (!p.is_default) {
      if (form?.includes(sp)) ko = form; // own name: 메가리자몽X, 워시로토무
      else if (form) ko = `${sp} (${form})`;
      else if (region) ko = `${sp} (${REGION[region]}의 모습)`;
    }
    return { p, species: species.name, entry: { slug: p.name, ko } };
  });

  for (const { p, entry } of entries) add(p.name, entry);
  // "Landorus" -> landorus-incarnate, before the trimmed aliases below can
  // hand it to landorus-therian.
  for (const { p, species, entry } of entries) if (p.is_default) add(species, entry);
  for (const { p, entry } of entries) {
    // "Ogerpon-Wellspring" -> ogerpon-wellspring-mask
    if (p.name.includes("-")) add(p.name.replace(/-[^-]+$/, ""), entry);
    // "Indeedee-F" -> indeedee-female
    if (p.name.endsWith("-female")) add(p.name.replace(/female$/, "f"), entry);
  }
  return out;
}

function latestMonth() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const data = {
  items: await names("pokemon_v2_item", "pokemon_v2_itemnames", "item"),
  moves: await names("pokemon_v2_move", "pokemon_v2_movenames", "move"),
  abilities: await names("pokemon_v2_ability", "pokemon_v2_abilitynames", "ability"),
  natures: await names("pokemon_v2_nature", "pokemon_v2_naturenames"),
  types: await names("pokemon_v2_type", "pokemon_v2_typenames"),
  pokemon: await pokemonNames(),
};
writeFileSync(OUT, JSON.stringify(data));
for (const [k, v] of Object.entries(data)) {
  console.log(`${k}: ${Object.keys(v).length}`);
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
