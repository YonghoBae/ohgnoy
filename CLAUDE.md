# Project Notes

Personal site: Pokémon toolset + study notes + blog + portfolio + chat, on Next.js App Router. Full architecture: `docs/architecture.md`. Known gaps/dead code before you build on top of something: `docs/known-issues.md`.

## Home page (`src/app/page.tsx`) — hard rules

This page is a deliberately different dark "Pokédex screen," not the site's normal Nord theme. Full spec: `docs/design/pixel-pokedex-home.md`. Do not touch this page's styling without reading it first. The two rules that get violated first if skipped:

- **Never use `border-radius` or a CSS `clip-path` staircase for "pixel" corners.** Both are vector shapes the browser anti-aliases — they render clean/modern, not pixel-art, no matter how they're tuned. The corners use a real pixel-art PNG (`public/frames/panel-frame.png`) as a `border-image` with `image-rendering: pixelated`. Reuse that asset (varying `border-image-width`) rather than drawing new corners in CSS.
- **Verify visual changes with an actual screenshot, not by re-reading a reference image from memory.** Every purely-reasoned CSS "fix" on this page went in the wrong direction at least once; screenshotting the live page converged in one or two tries. If Chrome DevTools MCP / browser-use is connected, use it before making another visual call here.

## Elsewhere in the app

- `next-auth` is a dependency but not wired up — real auth is a custom `localStorage` token, checked per-page.
- `socket.io-client` is dead (unused); chat is STOMP over SockJS.
- `/studys` and `/posts` currently serve demo Lorem Ipsum content from `_posts/`, not real posts — see `docs/known-issues.md` before adding anything that reads from it.
- Pixel-styled shared components for the Pokémon section live in `src/app/_components/ui/pixel/` (`PixelCard`, `PixelButton`, `PixelIconBox`, `PixelSprite`) — reuse them instead of hand-rolling similar styling on a new pokemon page.
