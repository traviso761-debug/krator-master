# Brief for anyone adding sounds (Gemini, other agents, people)

You are finding sound recordings for Krator, a game that will be **sold**. Every sound must be public domain, or free
for commercial use, and we credit everyone whose license asks for it. This page says what to look for and how to hand
your finds over. The full plan is `core/audio/PLAN.md`.

## What may come in

| Take | License text you will see |
|---|---|
| yes | CC0, "public domain dedication", "No Rights Reserved" |
| yes | US federal government work (NPS, USFWS, USGS, NOAA, USDA): public domain |
| yes | US recording published before 1923 |
| yes, credit required | CC BY 3.0 or 4.0 ("Attribution", with nothing after it) |
| yes, stays private (never published) | royalty-free licenses that allow commercial use but forbid re-sharing the file: Sonniss GDC, Free To Use Sounds, Mixkit, Pixabay |
| **no** | anything **NonCommercial** (BY-NC), **NoDerivatives** (BY-ND), **ShareAlike** (BY-SA) |
| **no** | Xeno-canto (almost all BY-NC); BBC Sound Effects (personal use only); Macaulay Library (permission needed) |
| **no** | a re-upload or compilation where the uploader is not the recordist and the original source is not named |

**Check the license on the item's own page**, not on a search result or a compilation's front page. If you cannot
find it there, the sound does not come in.

## What we want (2026-10-28)

Short SFX (combat, tools, footsteps), creature calls (birds, frogs, insects, bats: anything that could become an alien
animal when slowed or pitched), ambient elements (rain, surf, waterfalls, wind, fire, insect choruses), long beds
(forest, jungle, savannah, desert, cave, by day and night), and anything that could become a **giant insect**.

## How to hand it over

Audio never goes into the Krator repo. Make a folder for your batch in the **audio folder's intake**, named
`<date>-<you>`: `C:\Users\travi\Documents\krator-audio\intake\2026-10-29-gemini\`, with:

- `audio/<id>.<ext>`: the file (MP3, OGG, WAV or FLAC; under 6 MB; real audio, not an HTML error page)
- `clips.json`: a list, one record per file:

```json
[
 {
  "id": "fs-486390",
  "file": "audio/fs-486390.mp3",
  "title": "Barred Owl Calling",
  "creator": "danielmcadams",
  "source": "https://freesound.org/s/486390/",
  "license": "cc0",
  "licenseText": "Creative Commons 0 (copied from the item's page)",
  "attribution": "",
  "category": "sfx.creature",
  "tags": ["bird", "owl", "night", "temperate"],
  "duration": 44.2,
  "notes": "who-cooks-for-you call; slowed to 0.5x it becomes a laughing beast"
 }
]
```

| Field | Rule |
|---|---|
| `id` | lower case; a source prefix plus the source's own id: `fs-` Freesound, `nps-` National Park Service, `wmc-` Wikimedia Commons, `usgs-`, `usda-`, `noaa-`, `ia-` Internet Archive, `pixabay-`, `mixkit-`, `sonniss-` |
| `title`, `creator` | the work's title and its **recordist** |
| `source` | the item's own page, where the license is stated |
| `license` | one id from `core/audio/data/licenses.json`: `cc0`, `pd-usgov`, `pd-age`, `pd-author`, `cc-by-3.0`, `cc-by-4.0`, `rf-sonniss`, `rf-ftus`, `rf-mixkit`, `rf-pixabay` |
| `licenseText` | the license words exactly as the page shows them |
| `attribution` | for CC BY: the credit line the license asks for (title, creator, source, license). Else empty |
| `category` | one of: `sfx.combat`, `sfx.tool`, `sfx.move`, `sfx.creature`, `sfx.ui`, `amb.element`, `amb.bed`, `music.ambient`, `music.combat`, `raw` |
| `tags` | free words: biome, creature kind, time of day, weather, mood |
| `duration` | seconds |
| `notes` | what it sounds like, and what it could be used for |

Then run, or ask Claude to run:

```
node core/audio/tools/catalog.js intake <your batch folder name>
```

It checks every record, moves what passes into the catalogue, and writes `report.md` in your folder listing every
rejection and why. Accepted files move to `krator-audio\library\`. Do not write into `core/audio/data/` or
`krator-audio\sound-board\` directly.
