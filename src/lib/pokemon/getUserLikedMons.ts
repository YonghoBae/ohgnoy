"use client";

import { useSession } from "next-auth/react";
import React from "react";
import { LikedMon, UserSession } from "@/interfaces/pokemon";

export default function useUserLikedMons(): number[] {
	const { data: session } = useSession() as { data: UserSession | undefined };
	const [userLikedMons, setUserLikedMons] = React.useState<number[]>([]);

	React.useEffect(() => {
		const userId = session?.token?.sub;
		if (!userId) {
			return;
		}

		const fetchLikedMons = async () => {
			try {
				const response = await fetch(`/api/users/${userId}/likedMons`);
				if (response.ok) {
					const likedMons: LikedMon[] = await response.json();
					setUserLikedMons(likedMons.map((likedMon) => likedMon.pokemon_id));
				} else {
					console.error('Failed to fetch liked mons:', response.statusText);
				}
			} catch (error) {
				console.error('Error fetching liked mons:', error);
			}
		};

		fetchLikedMons();
	}, [session?.token?.sub]);

	return userLikedMons;
}