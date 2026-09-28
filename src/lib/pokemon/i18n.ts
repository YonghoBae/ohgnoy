import { Name, Pokemon, PokemonForm, PokemonSpecies } from "pokenode-ts";
import { koPokemon } from "@/lib/battle/koNames";

export function getKoreanName(species: PokemonSpecies): string {
  const ko = species.names.find((n) => n.language.name === "ko");
  return ko?.name ?? species.name;
}

export function getKoreanGenus(species: PokemonSpecies): string {
  const ko = species.genera.find((g) => g.language.name === "ko");
  const en = species.genera.find((g) => g.language.name === "en");
  return ko?.genus ?? en?.genus ?? "";
}

export function getKoreanFlavorText(species: PokemonSpecies): string {
  const entries = species.flavor_text_entries.filter(
    (e) => e.language.name === "ko"
  );
  if (entries.length > 0) {
    return entries[entries.length - 1].flavor_text.replace(/\f|\n/g, " ");
  }
  return "";
}

export function getEnglishFlavorText(species: PokemonSpecies): string {
  const entries = species.flavor_text_entries.filter(
    (e) => e.language.name === "en"
  );
  if (entries.length === 0) return "No description available.";
  return entries[entries.length - 1].flavor_text.replace(/\f|\n/g, " ");
}

export function getLocalizedMoveName(
  names: { name: string; language: { name: string } }[],
  lang: "ko" | "en" = "ko"
): string {
  const found = names.find((n) => n.language.name === lang);
  if (found) return found.name;
  if (lang === "ko") {
    const en = names.find((n) => n.language.name === "en");
    return en?.name ?? "";
  }
  return "";
}

export interface PokemonNames {
  ko: string;
  en: string;
}

const nameIn = (list: Name[], lang: string) =>
  list.find((n) => n.language.name === lang)?.name;

// Species names for the default variety, the form's own names otherwise
// ("메가리자몽X" / "Mega Charizard X"). Server only: koNames.json first, and
// the pokemon-form request only for slugs newer than the last JSON build.
export async function getPokemonNames(
  pokemon: Pokemon,
  species: PokemonSpecies
): Promise<PokemonNames> {
  const known = koPokemon(pokemon.name);
  if (known?.slug === pokemon.name) return { ko: known.ko, en: known.en };

  const base = {
    ko: getKoreanName(species),
    en: nameIn(species.names, "en") ?? pokemon.name,
  };
  if (pokemon.is_default) return base;
  const fallback = { ko: `${base.ko} (${pokemon.name})`, en: pokemon.name };
  try {
    const res = await fetch(pokemon.forms[0].url, {
      next: { revalidate: false },
    });
    if (!res.ok) return fallback;
    const form = (await res.json()) as PokemonForm;
    // ko form_names is often already the full name ("메가리자몽X").
    const part = nameIn(form.form_names, "ko");
    const ko =
      nameIn(form.names, "ko") ||
      (part && (part.includes(base.ko) ? part : `${base.ko} (${part})`)) ||
      fallback.ko;
    const partEn = nameIn(form.form_names, "en");
    const en =
      nameIn(form.names, "en") ||
      (partEn ? `${base.en} (${partEn})` : fallback.en);
    return { ko, en };
  } catch {
    return fallback;
  }
}
