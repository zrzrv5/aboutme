# Rui Zhou · materials & software

A personal portfolio in two forms: **Margins**, a readable page with a few handwritten notes, and an interactive low-poly island. The homepage opens Margins; “Explore in 3D” carries the current reading position into the island. Built with GPT-6 Astra :)

## Run

Use Node 22 or newer.

```sh
npm ci
npm run dev
```

- `npm run lint` checks the active source, excluding archived files and nested worktrees.
- `npm test` checks routes, content consistency, input handling and scene geometry.
- `npm run build` creates a static, readable homepage and the lazily loaded island.
- `npm run preview` serves the production output locally.

## Routes

| Address | Content |
| --- | --- |
| `/` | Margins portfolio |
| `/world/` | Interactive island |
| `/?at=naiive` | A portfolio entry |
| `/world/?at=isu` | A place on the island |
| `/world/?at=item%3Apython` | A skill's history |

`/about/`, the old professional-view paths, and earlier query links remain compatible. The portfolio remains readable without JavaScript. The island provides a portfolio link if WebGL is unavailable.

## Content and assets

- `src/redesign/content.js` holds shared contact links, career dates, app records and verified patent grant records.
- `src/redesign/worlds/data.js` adds island descriptions and project context.
- `src/redesign/worlds/skills.js` records where skills were acquired and applied. Levels appear only in the game.
- `public/publications.json` supplies the paper list and first-author counts.
- `public/ZHOU_Rui_CV.pdf` and `public/ZHOU_Rui_Resume.pdf` are the current downloads. Replace them in place so shared links keep working; the build also serves the older dated CV address.
- `public/images/projects/` contains compressed screenshots from the real apps. Projects without public screenshots or links have none; do not invent substitute diagrams.
- `public/fonts/` contains local fonts and their licenses.
- `archive/` preserves older designs and original assets outside the deployed site.

The writing supplements the CV with research findings, concrete work and project context. Keep notes sparse, retain the broad openness to roles and collaborations, and distinguish team research from individual contributions. Describe internal workplace tools by purpose, not internal product names.

## Deployment

`main` is the production branch. The Pages workflow publishes on a push to `main`, or a manual dispatch from `main`; other branches cannot deploy. Domain configuration lives in `public/CNAME`. The `pre-margins-2026-10-11` tag preserves the previous production version for rollback.

Before a public release, verify the production preview and check the site on a physical phone, including first paint, gestures, image viewing and view switching. Browser device emulation does not establish real iPhone performance.

See [architecture notes](ARCHITECTURE_NOTES.md) for rendering and maintenance details.
