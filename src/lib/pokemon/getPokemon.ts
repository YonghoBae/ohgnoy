"use client";

import {PokemonClient} from 'pokenode-ts';
import { useEffect, useState } from 'react';

const getPokemon = () => {
    const [pokemon, setPokemon] = useState<string[]>([]);

    useEffect(()=>{
        async function getPoke(): Promise<void>{
            const api = new PokemonClient();
            const pokemon = await api.listPokemons(0,100_000);
            setPokemon(pokemon.results.map((pokemon) => pokemon.name));
        }

        void getPoke();
    }, []);

    return pokemon;
}

export default getPokemon;