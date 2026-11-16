# settlements/azure-dream: Grēṭ-Āil, the Azure Dream's head monastery

The head monastery of the Order of the Azure Dream, Qiblai's blue monastery (`LORE.md` §6.13), on the long isle in
Erehwon's lake. It has a fishermonks' wharf in a cove facing Erehwon, a lower ward of pilgrims' hostels under a scarp, the
Stair of Lowered Eyes up the scarp, and a walled precinct on four terraces climbing the slope. At the top is the Hall of
Dreaming, where 256 sleepers wait for a dream. A second page, `dist/azure-dream-summit.html`, is the isle's summit 9 km up the
Dream Road: the Summit Chorten, the great wheel, the Station Watch and the High Kora with its sixteen wheel houses. Both pages
share `src/` and stand on the same 1:1 ground. `PLAN.md` is the design and the owner's answers; `BLUEPRINT.md` explains the
sheets in `floors/`; `FURNITURE.md` is the manifest; `KNOWN_ISSUES.md` lists what is still owed.

## Build and verify

```
python3 build.py                                   # dist/azure-dream.html and dist/azure-dream-summit.html (gen/39ad-world-data.js first)
KRATOR_GL=gpu python3 verify.py dist/azure-dream.html --assert --views "Overview,From the barge,Inside the Hall - down the Keepers Walk"
KRATOR_GL=gpu python3 verify.py dist/azure-dream-summit.html --assert --views "Overview,On the High Kora"
python3 ../../tools/build.py settlements/azure-dream   # the same through the repo's build wrapper
```

`build.py` decodes the region cut into `gen/39ad-world-data.js` (Pinnacle Rock's `tools/world_data.py`, read in place). It
then runs `settlements/xanadu/build.py --kit settlements/azure-dream`, so the page is a target on Xanadu's page, as Qiblai's
city and Erewhon are, with these read in place:
- the Qiblai kit's fragments (`kit.json` `externalDirs`) and its texture pack (`packFrom`);
- the open world's fields (`openworld/isle-demo/src/world/41-world-fields.js`) and core/terrain's `KRELIEF`;
- core/atmos and core/water (`kit.json` `files`).

The page reads the Qiblai and Xanadu texture packs and the Vale of Xanadu's (`biomes/xanadu/tex`): in a fresh worktree,
`git lfs pull --include="kits/qiblai/tex/*,settlements/xanadu/tex/*,biomes/xanadu/tex/*"` first, or the surfaces build black.

## How the page is made

| Fragment | What |
|---|---|
| `src/89qa-ad-hall.js` | the Order's buildings on the Qiblai kit's contract (`QB.def`, seeds 34001-34021): the Hall of Dreaming (the pillared hall, 136 columns, 256 cots in eight turnings, the women's side east and the men's west, the Keepers' Walk with its azure lamps and censers, the Lulling dais, the Damsel's shrine and the Wheel, the Porlock Screen, the Foot Gallery, the painted night ceiling, the clerestory, the gilt lantern, the covered kora with 96 wheels and the great wheel); the waking range; the cup house. `MAT.adAzure`, the blue glass lit by night; `AD_LAMPREC`, the lamps a builder hangs |
| `src/89qb-ad-wharf.js` | the wharf (seeds 34041-34121): the dugout, the mole and its wave-wheel shrine, a jetty, the boathouse, the net and fish racks, the smokehouse, the ropewalk, the fishermonks' house, the Order's barge |
| `src/89qc-ad-summit.js` | the summit's new buildings: the Station Watch (seed 34131), a blue-dressed court range with a stair tower whose roof platform carries the signal lamp in its gilt cage; the relay lamp (34132), a slender tower by the Dream Road's first chorten, its lamp 23 m up, the keeper's hut at its foot |
| `src/89zaa-ad-ground.js` | every target's ground and placement: the region's frame (`AD_SITE`, set by the target's `89z-rows.js`: its origin, near box and flora's origins), the ground at 1:1 (`WORLD.H` on the region cut), the cove's two headlands (the records of `tools/scale-model/edit_517_azure.py`, through `WORLD.landHook`), the pads (`AD_PADS`, cut and filled, blended by `terrainH`), `adPut` (a place by the plan's u and v, on a pad of its own), `adZigzag` (a stair in runs and landings), `AD_SIGNAL` (the Station's signal line: the Watch's lamp, the relay, the Hall's lantern roof, and `adSight` to test a sight line over the 1:1 ground), the flora's mask and fields |
| `src/90ad-world.js` | the Krator sky; the near ground (6 m cells, the Qiblai pack's sets blended by a zone mask painted from the records and by the shore's band); the far ground (the whole cut, 400 m cells, the world's colours); the lake on core/water (`WATER.open`, `WATER.draw`, the sky in it from core/atmos's skylight) |
| `src/90ae-build.js` | the retaining faces where a pad or terrace stands off the ground; every place through `VERN.place`, chunk by chunk, baked; the lamps turned into the world (`AD_LAMPS`); the Vale of Xanadu's flora grown over the mask and baked |
| `src/90af-night.js` | the night: the azure glass's glow, a fixed pool of point lights taken by the lamps nearest the eye (the summit's signal lamp among them) |
| `src/91zz-ad-api.js` | `_api.setHour`, `_api.lamps` (the krator-lamps export) |
| `targets/isle/89z-rows.js` | the isle's page: `window.CITY` (Xanadu's showcase skipped), the title, no sheet rows, `AD_SITE` (the origin the cove's head at the scarp's toe; the near ground 2 km up the slope, to take in the relay) |
| `targets/isle/89zad-site.js` | the isle's places: the precinct's four terraces, every place (`AD_PLACE`), the zigzag Stair of Lowered Eyes and the terraces' stairs, the precinct's walls, the Dream Road's first 1.5 km with its first chorten and the relay lamp, the ways and courts |
| `targets/isle/90ag-ad-walk.js` | the Hall of Dreaming in core/walk (floors, walls, columns, the lattice, screens and cots; its two drawn doors unlocked, every door a walk block through `KDOOR.walk`), `_adWalk.walkIn()` (shut, the walker stays out; open, it reaches the kora and both sides); the Lotus Garden's four ponds on core/water (`WATER.still`, `drawStill`) |
| `targets/isle/91z-views.js` | the isle's views and budgets |
| `targets/summit/89z-rows.js` | the summit's page (`dist/azure-dream-summit.html`): `AD_SITE` the crest of the isle's dome, +308 m, 9 km up the Dream Road |
| `targets/summit/89zad-site.js` | the summit's places: the Summit Chorten on the crest, the great wheel's house, the Station Watch, the pilgrims' shelter, the High Kora (a ring 260 m out with sixteen wheel houses), the Dream Road toward the monastery's back gate and its chorten at the kora |
| `targets/summit/91z-views.js` | the summit's views and budgets |
| `verify.py` | Xanadu's verify plus each page's invariants: the isle's `azure-laid`, `dream-cots`, `cove-water`, `terraces-climb`, `stair-climbs`, `hall-walk-in`, `lotus-ponds`, `lamps`; `signal-relay`; the summit's `summit-laid`, `high-kora`, `summit-crest`, `signal-lamp` |
| `region/` | the scale model's cut round the cove (`data/`, by `tools/scale-model/extract_region.py` on the scale-model line with edit 517 and the cove applied; `source/` its inputs) |
