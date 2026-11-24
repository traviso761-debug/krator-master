# G. Atmospheric clouds and dynamic weather (2026-11-23; decided, D33)

The owner: "can we plan to add in atmospheric cloud and dynamic weather effects with this all build rebuild?" This file says
what exists, what each piece would cost, and how it fits Stage 8. **Decided (section 4):** tier 1 rides Stage 8 as V8-V11;
tier 2 comes after Stage 8, with true volumetric clouds (W6), and the settlements' skies move onto the shared sky with it (W7).

## 1. What exists (core/atmos and core/water, on the line)

| Piece | Where | State |
|---|---|---|
| Weather state `W` (rain, fog, wet, wind, flash; snow and ash opt-in), eased by a pure step; modes auto, clear, rain, storm, fog, snowfall, blizzard, ashfall, ash; rain streaks and a bolt | `89-atmos-4-weather.js` | built. `auto` follows only the hour (dawn fog, an evening shower), and it rains everywhere on the page at once |
| `ATMOS.bindWeather`: a biome names its climate and gets its modes, fog, sun and sky dimming, wet ground and snow cover | `host/89-atmos-e-weatherhost.js` | built; on about 66 biome kits and 6 settlements (girder, iziz, locus, longsong, voth, marr). Each page starts `clear`, so its preset views don't change |
| The shared sky: a cumulus and a cirrus layer on sky planes, world-anchored, riding the wind, lit by the sun and giantshine; cloud moods (dark, tint, turbulence, glow episodes) | `sky/89-atmos-g-sky.js`, `sky/89-atmos-k-cloudmood.js` | built; on every biome kit (`ATMOS.skyBiome`, 155 callers). The clouds are flat layers, not volumes |
| A sea of cloud seen from above (billowed, drifting, bit-exact in JS, GLSL and Godot) | `89-atmos-d-clouddeck.js`, `fx/89-atmos-fx-deckday.js` | built; on the pages that look down on a deck |
| Cloud shadows on the ground and rain darkening, from the sky's own cloud field | `atmos_cloudshade`, `ATMOS.cloudShade` | built; wired on only 14 kits (swbay, the outer walls, catch, cut, farside, k-guilin, sedesert, shroudhills, abyssal-savannah, ancientsvalley, batteredisle). The biome core's material makers never call it |
| Rain cover (dry under canopies, roofs, overhangs), snow that lies and melts, the rain wall, height fog, lightning, gales, slope winds, ash plumes | `fx/`, `host/89-atmos-j-heightfog.js` | built, opt-in per page |
| Puddles and wet ground | `core/water` (`wetGround`, `21-core-water-shore.js`) | partly built |
| **The open world** (`core/world`, every `openworld/*` region) | `45-world-host.js` | **no weather at all**: it reads the sky, not `ATMOS.weather` or `cloudShade` |
| The settlements on their own sky (girder, locus, mavs-refuge, iziz, screamers, dalab, jimjam, dilihan, drum, ledge, Voth...) | each `*-sky.js` | not on the shared sky (SKY-PLAN section 9, "later"), so shared clouds cannot reach them yet |

Not built (`biomes/WEATHER-RESEARCH.md`'s ranked proposals): **one wind field** for foliage, grass, water and particles
(5); **weather cells**, fronts that drift across the map (6); distant rain shafts and virga (7); splashes and ground mist
(9); rain rings on water (2). **Volumetric clouds**: none, anywhere.

## 2. The work, in two tiers

### Tier 1: wiring what exists (can ride Stage 8; no new systems)

| # | Item | Files | Cost | Look change |
|---|---|---|---|---|
| W1 | Cloud shadows and rain darkening on every biome kit: the biome core's ground and foliage makers call `ATMOS.cloudShade` once each (SKY-PLAN 11.1, step 3, written for "a later step that wants every kit at once") | `core/biome` makers; the 14 kits' own hooks removed | one 3-octave fbm per ground fragment, per vertex on Lambert flora | yes: cloud shadows sweep the ground on every biome page. One before-and-after pair per sky family for the owner |
| W2 | The open world takes the weather: `bindWeather` in core/world's host with each region's climate, `cloudShade` on its ground (81) and the world's flora, rain cover on the camera | `core/world/45-world-host.js`, `81-world-terrain.js` | as W1, plus the rain-cover pass every 20 m of camera movement | starts `clear`: none until the weather changes; cloud shadows yes |
| W3 | One wind field: `BIO.WIND` reads ATMOS's travelling gusts, so a gust visibly rolls across grass and canopy (research proposal 5) | `core/biome/30-core-foliage.js` (`_tickWind`), `core/atmos/89-atmos-0-core.js` | shader ALU only | yes: sway follows gusts instead of a sine |
| W4 | The open weather bugs: `cloudShade` recursing after `WATER.wetGround` (CORE-IMPROVEMENTS 468); the impostor bake compiling before the snow and weather hooks (293); the sky overwriting the weather's fog | as named | none | fixes |

Each tier 1 item changes a shared core file that Stage 8 rebuilds anyway, so every page is verified once, in step 29. The
weather still starts `clear` on every page, so verify views and their asserts stay deterministic.

### Tier 2: new systems (real development, a session or two each, before or after Stage 8)

| # | Item | What it adds | Cost and risk | Effort |
|---|---|---|---|---|
| W5 | **Dynamic weather: weather cells** (research proposal 6, with 7, 8 and 9): a seeded set of cells (rain, storm, fog, snow, dust, ash) drifting on the wind, pure data (`ATMOS.weatherAt(x, z, t)`; the camera's sample becomes `W`); per-biome climate weights (from each kit's `climate` and the crops kit's warmth, pressure and aridity axes) and a season; the sky's cloud cover drawn from the cells (a 64 px coverage map); rain shafts and virga under storm cells; branched lightning placed in the cell, thunder delayed by distance (an event for core/audio); splashes on the rain cover. The open world gets fronts you can watch arrive; core/simulation can read the same `weatherAt` (crops, travel, trade) | CPU trivial; 1-4 draws for shafts, 1-2 for splashes. Every engine must agree (KRAND seeds, a pure step; Godot ports it line for line). Verify needs a fixed weather: the cells keyed on a seed and the page's clock, `?weather=clear` for the asserts | M |
| W6 | **Volumetric clouds**: a raymarched cloudscape in the sky pass (the Nubis approach: the W5 coverage map gives each cell's cover and type; shapes from the existing 64^3 noise volume plus a detail volume; a short light march for self-shadow and silver lining; quarter resolution with temporal reprojection; flying through and under cloud on the high pages: shighlands' cloud sea, the Throne, the Outer Walls) | the biggest look change on offer | **cost risk on the Arc 140T** (the timing reference): expect 2-4 ms at quarter resolution, more on the near-cap pages (Throne station 1 is at 19.8 M of its 22 M triangles). three r128 has no built-in temporal pass: a render target and reprojection of our own. The sky shader once took 16.8 s to compile (cut to 2.2 s by the noise volume): a raymarch must stay on the volume and be measured after each pass. Godot 4 has no volumetric clouds built in: a sky-shader raymarch twin of the same field. A per-preset quality tier (off, layers only, volumes) keeps the integrated GPU in budget | L |
| W7 | The settlements' skies onto the shared sky (SKY-PLAN section 9, "later"): Girder, Locus, Mav's Refuge, Iziz, Screamers, Dalab, Jimjam, Dilihan, Drum, Ledge, then Voth (its city work owns its files) | without it, W1, W5 and W6 stop at the biome and open-world pages | each sky is a look change judged on its page | M-L |

## 3. How it could fit Stage 8

- **Tier 1 rides Stage 8 as ride-alongs V8 to V11.** It goes in with the core wave (B-ridealongs "Suggested order", step 1: the
  `30-core-foliage.js` edit already has T18, T19, T22, T29d and T31), so no page rebuilds twice. Before the core wave: one
  W1 pair per sky family (about 8 pages) and one open-world pair, for the owner.
- **Tier 2 is development, not a rebuild.** Stage 8 rebuilds and verifies; it doesn't design. So W5 to W7 either:
  - **(a) land before Stage 8**: Stage 8 waits for them (about a week for W5 and W6 with their Godot twins and cost passes),
    and every page is verified once with the full weather; or
  - **(b) come after Stage 8** in their own pass: only the pages that take core/atmos rebuild then (about 70 biome pages
    with their stations, the open-world regions, the settlements W7 moves), verified then; Stage 8 isn't delayed.
- Either way, tier 2 starts with W5 (W6 reads W5's coverage map), then W6, then W7.

## 4. The owner's answers (2026-11-23)

1. **Tier 1 rides Stage 8.** W1-W4 are ride-alongs V8-V11 (B-ridealongs.md), in the core wave with the other
   `30-core-foliage.js` edits. Before the core wave: one W1 pair per sky family (about 8 pages) and one open-world pair for
   the owner.
2. **Tier 2 comes after Stage 8**, in its own pass: the pages that take core/atmos (about 70 biome pages with their stations,
   the open-world regions) and the settlements W7 moves rebuild and verify then. Stage 8 isn't delayed. Its development can
   run beside Stage 8 on its own branch and merge after Phase F is green.
3. **True volumetric clouds (W6)**, not the layered clouds made deeper. W6 reads W5's coverage map, so W5 comes first. Its
   cost passes are measured on the Arc 140T against the 1 ms rule (SKY-PLAN section 10), with a per-preset quality tier
   (off, layers, volumes) so a page over budget steps down. Which pages take volumes at which tier is settled on the pairs.
4. **The settlements move onto the shared sky with tier 2 (W7)**, Voth last, each sky judged on its page.

## 5. The owner's answers on the W6 pairs (2026-11-24)

The pairs (`core/atmos/pairs/pairs.py`; shots of the outer wall, shighlands and Throne station 1 at layers and volumes, cover
0.6 on both, on the Arc) were judged on their page. "These look mostly good", with one defect to fix first:

1. **The pixelated look** (a diagonal dither on thin cloud edges at the march's texel size, worst on the outer wall's sky):
   fixed. The march's jitter pattern now moves each frame (interleaved gradient noise at the pixel offset by 5.588238 a
   frame), and the resolve filters the new frame with a 3x3 tent and clips the history to its neighbourhood's mean +- 1.25
   sigma, instead of blending the raw texel into a min-max box.
2. **The outer walls take volumes**: `89-atmos-m-volclouds.js` and `89-atmos-m-volhost.js` are listed in wouterwall,
   nwouterwall, neouterwall and seouterwall (every station). The budget's step-down holds them on the Arc.
3. **Shighlands takes volumes with the layer above the cloud sea**: listed, and its cloud base raised from the sky's 1600 m
   to 2600 m (`clouds.height`), 1350 m clear of the deck's top (`CLOUD_Y`, 1250 m), so the cumulus stands round the rim's
   eye level instead of sitting on the sea. The flat layer and the cloud shadows move with it.
4. **The Throne keeps layers**: station 1 and its stations do not list the volumes (no triangles to spare at its ceiling,
   and its eye at 2.8 km puts the whole layer below it).

The pages rebuild in tier 2's own pass after Stage 8 (section 4, answer 2); their committed pages are unchanged here.
