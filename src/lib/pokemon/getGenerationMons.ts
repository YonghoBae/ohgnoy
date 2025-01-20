"use client";

import {GameClient} from "pokenode-ts";
import {useEffect, useState} from "react";

const getGenerationMonsts = (id:number) => {
    const [pokemon, setPokemon] = useState<number[]>([]);

    useEffect(()=>{
        async function getPoke(): Promise<void> {
            const api = new GameClient();
            const generation = await api.getGenerationById(id);
            const _mons = generation.pokemon_species.sort((a,b)=>{
                const aNum = parseInt(a.url.split("/")[6]);
                const bNum = parseInt(b.url.split("/")[6]);
                return aNum-bNum;
            });
            setPokemon(_mons.map((pokemon)=>Number(pokemon.url.split("/")[6])));
        }

        void getPoke();
    },[])

    return pokemon;
}

export default getGenerationMonsts;