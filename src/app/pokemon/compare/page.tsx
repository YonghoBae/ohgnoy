import type { Metadata } from "next";
import Link from "next/link";
import { ReactNode } from "react";
import { Pokemon } from "pokenode-ts";

import { fetchPokemon } from "@/lib/pokemon/fetchers/fetchPokemon";
import { fetchSpecies } from "@/lib/pokemon/fetchers/fetchSpecies";
import { getPokemonNames } from "@/lib/pokemon/i18n";
import { PokemonTypeName } from "@/types/pokemon/domain";
import PixelCard from "@/app/_components/ui/pixel/PixelCard";
import PixelSprite from "@/app/_components/ui/pixel/PixelSprite";
import TypeBadge from "@/app/_components/TypeBadge";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "포켓몬 비교 | Ohgnoy" };

interface Props {
  searchParams: Promise<{ a?: string | string[]; b?: string | string[] }>;
}

interface Side {
  pokemon: Pokemon;
  name: string;
  /** Species id: 6 for charizard-mega-x (pokemon.id 10034). */
  dexNumber: number;
}

const STATS = [
  ["hp", "HP"],
  ["attack", "공격"],
  ["defense", "방어"],
  ["special-attack", "특공"],
  ["special-defense", "특방"],
  ["speed", "스피드"],
] as const;

const MAX_STAT = 255;

const numberFormat = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 1 });

function parseId(value: string | string[] | undefined): number | null {
  return typeof value === "string" && /^[1-9]\d{0,5}$/.test(value)
    ? Number(value)
    : null;
}

// Species id comes from species.url: form Pokémon (e.g. 10034 charizard-mega-x)
// have no species of their own. No species → fall back to the English name.
// Forms get their own name ("메가리자몽X") so the two columns stay distinct.
async function loadSide(id: number): Promise<Side | null> {
  let pokemon: Pokemon;
  try {
    pokemon = await fetchPokemon(id);
  } catch {
    return null;
  }
  const speciesId = Number(pokemon.species.url.match(/\/(\d+)\/?$/)?.[1]);
  try {
    const species = await fetchSpecies(speciesId);
    const { ko } = await getPokemonNames(pokemon, species);
    return { pokemon, name: ko, dexNumber: speciesId };
  } catch {
    return { pokemon, name: pokemon.name, dexNumber: speciesId };
  }
}

function baseStat(pokemon: Pokemon, key: string): number {
  return pokemon.stats.find((s) => s.stat.name === key)?.base_stat ?? 0;
}

function BackLink() {
  return (
    <Link
      href="/pokemon/list"
      className="w-fit text-sm font-semibold text-primary underline-offset-4 hover:underline"
    >
      <span aria-hidden>← </span>포켓몬 목록으로
    </Link>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-extrabold">포켓몬 비교</h1>
      {children}
    </div>
  );
}

function Message({ children }: { children: ReactNode }) {
  return (
    <Shell>
      <PixelCard className="flex flex-col gap-4 p-5">
        <p className="text-sm">{children}</p>
        <BackLink />
      </PixelCard>
    </Shell>
  );
}

function Value({
  value,
  higher,
  className,
}: {
  value: number;
  higher: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block w-12 shrink-0 text-sm tabular-nums",
        higher && "font-bold",
        className,
      )}
    >
      {higher && <span aria-hidden>▲</span>}
      {value}
      {higher && <span className="sr-only"> (더 높음)</span>}
    </span>
  );
}

function Bar({ value, alignEnd }: { value: number; alignEnd?: boolean }) {
  return (
    <div
      className={cn(
        "flex h-2 flex-1 bg-neutral-300 dark:bg-neutral-600",
        alignEnd && "justify-end",
      )}
    >
      <div
        className="h-2 bg-primary"
        style={{ width: `${Math.min((value / MAX_STAT) * 100, 100)}%` }}
      />
    </div>
  );
}

function SideCard({ side }: { side: Side }) {
  const { pokemon, name, dexNumber } = side;
  return (
    <PixelCard className="flex flex-col items-center gap-3 p-5">
      <Link
        href={`/pokemon/${pokemon.id}`}
        className="flex flex-col items-center gap-1 hover:text-primary"
      >
        <PixelSprite pokemon={pokemon} alt="" size={120} priority />
        <span className="text-xs tabular-nums text-text-muted">
          #{String(dexNumber).padStart(4, "0")}
        </span>
        <h2 className="font-mono-pixel text-lg font-bold">{name}</h2>
      </Link>
      <div className="flex gap-2">
        {pokemon.types.map(({ type }) => (
          <TypeBadge key={type.name} type={type.name as PokemonTypeName} />
        ))}
      </div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
        <dt className="text-xs text-text-muted">키</dt>
        <dt className="text-xs text-text-muted">몸무게</dt>
        <dd className="font-semibold tabular-nums">
          {numberFormat.format(pokemon.height / 10)}&nbsp;m
        </dd>
        <dd className="font-semibold tabular-nums">
          {numberFormat.format(pokemon.weight / 10)}&nbsp;kg
        </dd>
      </dl>
    </PixelCard>
  );
}

export default async function PokemonComparePage({ searchParams }: Props) {
  const params = await searchParams;
  const idA = parseId(params.a);
  const idB = parseId(params.b);

  if (idA === null || idB === null) {
    return (
      <Message>
        비교할 포켓몬 번호가 올바르지 않습니다. 목록에서 두 마리를 골라
        주세요.
      </Message>
    );
  }

  const [a, b] = await Promise.all([loadSide(idA), loadSide(idB)]);
  if (!a || !b) {
    const missing = [!a && idA, !b && idB].filter(Boolean).join(", ");
    return (
      <Message>
        No.<span className="tabular-nums">{missing}</span> 포켓몬을 불러올 수
        없습니다.
      </Message>
    );
  }

  const rows = STATS.map(([key, label]) => ({
    label,
    a: baseStat(a.pokemon, key),
    b: baseStat(b.pokemon, key),
  }));
  const totalA = rows.reduce((sum, r) => sum + r.a, 0);
  const totalB = rows.reduce((sum, r) => sum + r.b, 0);

  return (
    <Shell>
      <BackLink />
      <div className="grid gap-4 sm:grid-cols-2">
        <SideCard side={a} />
        <SideCard side={b} />
      </div>
      <PixelCard className="p-4 sm:p-5">
        <table className="w-full table-fixed border-collapse text-sm">
          <caption className="font-pixel mb-3 text-left text-xs">
            기본 스탯
          </caption>
          <thead>
            <tr className="text-xs">
              <th scope="col" className="truncate pb-2 text-left font-semibold">
                {a.name}
              </th>
              <th scope="col" className="w-20 pb-2">
                <span className="sr-only">스탯</span>
              </th>
              <th scope="col" className="truncate pb-2 text-right font-semibold">
                {b.name}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label}>
                <td className="py-1">
                  <div className="flex items-center gap-2">
                    <Value value={r.a} higher={r.a > r.b} />
                    <Bar value={r.a} alignEnd />
                  </div>
                </td>
                <th
                  scope="row"
                  className="px-2 py-1 text-center text-xs font-semibold text-text-muted"
                >
                  {r.label}
                </th>
                <td className="py-1">
                  <div className="flex items-center gap-2">
                    <Bar value={r.b} />
                    <Value
                      value={r.b}
                      higher={r.b > r.a}
                      className="text-right"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-neutral-300 dark:border-neutral-600">
              <td className="pt-2">
                <Value value={totalA} higher={totalA > totalB} />
              </td>
              <th
                scope="row"
                className="px-2 pt-2 text-center text-xs font-semibold text-text-muted"
              >
                합계
              </th>
              <td className="pt-2 text-right">
                <Value
                  value={totalB}
                  higher={totalB > totalA}
                  className="text-right"
                />
              </td>
            </tr>
          </tfoot>
        </table>
      </PixelCard>
    </Shell>
  );
}
