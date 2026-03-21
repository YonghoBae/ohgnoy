"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/app/_components/select";

interface Props {
  generations: string[];
  current: number;
  onChange: (generation: number) => void;
}

export default function GenerationFilter({ generations, current, onChange }: Props) {
  if (!generations.length) return null;

  return (
    <Select
      onValueChange={(value) => onChange(generations.indexOf(value) + 1)}
      value={generations[current - 1]}
    >
      <SelectTrigger className="absolute right-0 w-auto border-0 outline-none ring-0" />
      <SelectContent align="center">
        {generations.map((gen) => (
          <SelectItem
            key={gen}
            value={gen}
            className="text-center text-neutral-900 dark:text-neutral-100"
          >
            {gen.toLocaleUpperCase()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
