import { fetchAllPokemonNames } from "@/lib/pokemon/fetchers/fetchPokemon";
import TeamBuilder from "./_components/TeamBuilder";

export default async function BuilderPage() {
  const allNames = await fetchAllPokemonNames();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold">팀 빌더</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          포켓몬 6마리로 팀을 구성하고 Showdown으로 내보내세요.
        </p>
      </div>
      <TeamBuilder allNames={allNames} />
    </div>
  );
}
