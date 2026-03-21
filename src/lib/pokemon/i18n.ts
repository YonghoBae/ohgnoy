import { PokemonSpecies } from "pokenode-ts";

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
