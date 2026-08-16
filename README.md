# Family Geography Quiz 🌍

One shared geography question a day for the family. Everyone answers privately; once all
4 people have answered, everyone's answers, correctness, and a fun fact are revealed.
A dashboard tracks history, accuracy, and streaks over time.

## How it works

- **4 fixed people** (edit names in [`lib/people.ts`](lib/people.ts)) — no login, just pick your name (remembered via `localStorage`).
- **One question a day**, deterministically chosen from [`data/questions.json`](data/questions.json) based on the calendar date in `America/Los_Angeles` (change the timezone in [`lib/date.ts`](lib/date.ts) if your family isn't on the West Coast). The choice is persisted the first time anyone loads the app that day, so it never changes retroactively.
- **Reveal-once-everyone-answers**: before all 4 have answered, you only see "N of 4 answered — waiting on: …". The page polls every 45s while open so it updates live.
- **Learn more links**: every revealed answer (daily quiz, dashboard history, and practice mode) links out to a Wikipedia article for further reading — set per-question via `sourceUrl` in [`data/questions.json`](data/questions.json).
- **"Where it is" map**: for non-map (trivia) questions, the reveal also shows a small map highlighting the answer's country (or countries, for things like rivers or mountain ranges that cross borders) — set via `locationCountryIds`/`locationRegion` per question. Omitted for questions with no single sensible location (e.g. "how many countries are in Africa?"). Every map (the puzzle map and the "where it is" reveal map alike) offers a World tab and a continent-focused tab side by side, defaulting to the continent tab when one applies — the continent tab is skipped only when an answer genuinely spans several continents (e.g. the UN Security Council's permanent members).
- **Map styles and zoom**: 4 color themes (Classic, Terrain, Dark, High Contrast) are selectable via the small swatches above any map — the choice is remembered across questions and sessions via `localStorage`. Every map also supports pinch/scroll/drag zoom (with on-screen +/− and reset buttons) for a closer look at small countries.
- **Dashboard** (`/dashboard`, visible to everyone) shows full history and per-person accuracy / current streak / longest streak. Today's entry on the dashboard respects the same reveal lock as the quiz page; every past day is always shown in full.
- **Practice mode** (`/practice`) lets anyone pull extra random questions one at a time, any time, with an immediate right/wrong + explanation. It never shows today's not-yet-revealed shared question (no spoilers) and isn't tied to a person or saved anywhere — no login needed, no effect on stats or history.
- **Question bank**: 379 questions (167 map-highlight, 212 trivia) spanning easy/medium/hard in [`data/questions.json`](data/questions.json). The map questions cover essentially every country recognized in the map data — every sovereign country that appears in `world-atlas`'s `countries-110m.json`, except Antarctica. (A handful of non-sovereign territories too small to matter for a "name the country" quiz — Greenland, Puerto Rico, New Caledonia, the Falklands, French Southern & Antarctic Lands, Western Sahara — are intentionally left out.) There's also a "capital of X?" trivia question for every one of those 167 countries. Add more any time — just append objects matching the existing shape and run `npm run questions:check` to validate.

## Local development

```bash
npm install
npm run questions:check   # sanity-checks data/questions.json
npm run dev
```

Open http://localhost:3000. Data is stored via [Turso](https://turso.tech) (a hosted, network-accessible SQLite-compatible database, via `@libsql/client`) — but locally, with no Turso account and no env vars set, it transparently falls back to a plain SQLite file at `./data/geoquiz.db` (configurable via `DATABASE_PATH`, see `.env.example`), so `npm run dev` works with zero external accounts. `data/questions.json` is the only file in `data/` that's committed to git — the `.db` file is gitignored and regenerates itself.

### Tests

```bash
npm test              # vitest: timezone rollover + streak/accuracy math
npm run questions:check
npm run lint
npm run build
```

## Deployment

The app talks to the database over the network (via `@libsql/client`/Turso), not through a local
file, so it deploys cleanly to serverless platforms like Vercel — no persistent volume needed.

### Option A: Vercel + Turso (recommended)

1. **Create a Turso database** — install the [Turso CLI](https://docs.turso.tech/cli/installation), then:
   ```bash
   turso auth login
   turso db create geoquiz
   turso db show geoquiz --url          # -> TURSO_DATABASE_URL
   turso db tokens create geoquiz       # -> TURSO_AUTH_TOKEN
   ```
2. **Deploy to Vercel** — import this repo at [vercel.com/new](https://vercel.com/new) (or `vercel deploy` via the CLI). Next.js is auto-detected, no config needed.
3. **Set environment variables** in the Vercel project's Settings → Environment Variables:
   - `TURSO_DATABASE_URL` — from step 1
   - `TURSO_AUTH_TOKEN` — from step 1
4. Redeploy (or it'll pick up the env vars on the next deploy automatically). The schema is created automatically on first request — no manual migration step.

For lowest latency, create the Turso database in a region close to where your Vercel functions run (Vercel's default region is `iad1`, US East — `turso db create geoquiz --location iad` matches that), though for a low-traffic family app this barely matters either way.

### Option B: Fly.io or Railway (still supported)

These platforms support persistent volumes, so you can either point them at the same Turso database as above (simplest — just set the same two env vars), or skip Turso entirely and fall back to a local SQLite file on a mounted volume by setting `DATABASE_PATH=/data/geoquiz.db` instead (leaving `TURSO_DATABASE_URL` unset). The included `Dockerfile`/`fly.toml` work either way.

```bash
fly launch --no-deploy        # creates/edits fly.toml — reuse the one in this repo, pick your own app name/region
fly volumes create geoquiz_data --size 1 --region sea   # only needed if using the local-file fallback
fly deploy
```

Railway: create a project from this repo (auto-detects the `Dockerfile`), set the same environment variables in **Variables**, and deploy.

### Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `TURSO_DATABASE_URL` | _(unset)_ | A `libsql://...` database URL. When set, this is used instead of a local file — required for Vercel. |
| `TURSO_AUTH_TOKEN` | _(unset)_ | Auth token for the Turso database above. |
| `DATABASE_PATH` | `./data/geoquiz.db` | Local SQLite file path, used only when `TURSO_DATABASE_URL` is unset (local dev, or Fly/Railway with a volume). |

## Customizing

- **Rename the players**: edit the `name` fields in [`lib/people.ts`](lib/people.ts) (keep the `id`s stable — they're the history's foreign key).
- **Add questions**: append to [`data/questions.json`](data/questions.json), then `npm run questions:check`. Every question needs a `sourceUrl` (an `https://` link, shown as "Learn more" after reveal — Wikipedia works well). Map questions also need a `countryId` matching a numeric ISO 3166-1 code present in `world-atlas`'s `countries-50m.json` (the file is copied to `public/` by the `postinstall` script) — if unsure, check to see whether your target country appears in that file's `objects.countries` before adding it, since very small countries are dropped at this map resolution. Trivia questions can optionally add `locationCountryIds`/`locationRegion` (to show a "where it is" map on reveal) and `capitalCoordinates` (`[longitude, latitude]`, to also drop a pin — used for capital-city questions) — leave these off if the answer has no single sensible location.
- **Change the timezone**: edit `APP_TIMEZONE` in [`lib/date.ts`](lib/date.ts).
