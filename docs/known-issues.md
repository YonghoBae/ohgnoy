# Known Issues / Follow-ups

Things discovered while working on this codebase that are real but out of scope for whatever task surfaced them. Check this file before assuming a data source or file is production-ready.

## `/posts` and `/studys` both render Next.js blog-starter demo content, not real posts

`src/lib/api.ts` (`getAllPosts()`, `getPostBySlug()`) reads markdown files from `_posts/`. Those files (`hello-world.md`, `dynamic-routing.md`, `preview.md`, `test.md`) are leftover **Next.js blog-starter template demo content** — Lorem Ipsum excerpts, a fake author ("Tim Neutkens"), not the site owner's real content. This isn't an orphaned/unused function — it's actively imported by four pages: `src/app/posts/[slug]/page.tsx`, `src/app/studys/list/page.tsx`, and `src/app/studys/[slug]/page.tsx` (the last two both use it despite `/studys` being conceptually a separate "study notes" section from `/posts` — they currently show the same demo data).

**Do not** wire any new feature (a homepage "recent posts" panel, a search index, anything) to `getAllPosts()`/`_posts/` without first checking whether this has been fixed — as of this writing it hasn't. A real fix means either replacing `_posts/*.md` with real content, or pointing `/studys` at a different real source (the external Obsidian digital garden linked via `DIGITAL_GARDEN_URL`, or a backend API — `/studys/create` exists as a route, implying a real backend was intended for studys specifically).

## `src/app/_components/pokemonCard.tsx` (lowercase) is dead code

Not imported anywhere. The actual card used on `/pokemon/list` is `src/app/pokemon/list/_components/PokemonCard.tsx`. The two diverged over time — the unused one still points at `official-artwork` sprites, the live one was updated to pixel sprites. Safe to delete; nothing depends on it. Left in place only because deleting unrelated files was out of scope for the task that found it.
