# Known Issues / Follow-ups

Things discovered while working on this codebase that are real but out of scope for whatever task surfaced them. Check this file before assuming a data source or file is production-ready.

## `/studys/list` renders Next.js blog-starter demo content, not real posts

`src/app/studys/list/page.tsx` calls `getAllPosts()` (`src/lib/api.ts`), which reads markdown files from `_posts/`. Those files (`hello-world.md`, `dynamic-routing.md`, `preview.md`, `test.md`) are leftover **Next.js blog-starter template demo content** — Lorem Ipsum excerpts, a fake author ("Tim Neutkens"), not the site owner's real study notes. `getAllPosts`/`getPostSlugs` aren't imported anywhere else in `src/`, so this looks like orphaned starter scaffolding that was never replaced.

**Do not** wire any new feature (a homepage "recent posts" panel, a search index, anything) to `getAllPosts()`/`_posts/` without first checking whether this has been fixed — as of this writing it hasn't. A real fix means either replacing `_posts/*.md` with real content, or pointing `/studys` at a real source (the external Obsidian digital garden linked via `DIGITAL_GARDEN_URL`, or a backend API — `/studys/create` exists as a route, implying a real backend was intended).

## `src/app/_components/pokemonCard.tsx` (lowercase) is dead code

Not imported anywhere. The actual card used on `/pokemon/list` is `src/app/pokemon/list/_components/PokemonCard.tsx`. The two diverged over time — the unused one still points at `official-artwork` sprites, the live one was updated to pixel sprites. Safe to delete; nothing depends on it. Left in place only because deleting unrelated files was out of scope for the task that found it.
