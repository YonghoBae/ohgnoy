"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/select";

interface Props {
  generations: string[];
  current: number;
  onChange: (generation: number) => void;
}

// "generation-i".."generation-ix" -> "1세대".."9세대"
const ROMAN_NUMERALS = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix"];

function generationLabel(slug: string): string {
  const suffix = slug.replace("generation-", "").toLowerCase();
  const num = ROMAN_NUMERALS.indexOf(suffix) + 1;
  return num > 0 ? `${num}세대` : slug;
}

export default function GenerationFilter({ generations, current, onChange }: Props) {
  if (!generations.length) return null;

  return (
    <Select
      onValueChange={(value) => onChange(generations.indexOf(value) + 1)}
      value={generations[current - 1]}
    >
      <SelectTrigger className="absolute right-0 w-auto border-0" aria-label="세대 선택">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="center">
        {generations.map((gen) => (
          <SelectItem
            key={gen}
            value={gen}
            className="text-center"
          >
            {generationLabel(gen)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
