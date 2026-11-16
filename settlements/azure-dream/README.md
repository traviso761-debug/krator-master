# settlements/azure-dream: Grēṭ-Āil, the Azure Dream's head monastery

The head monastery of the Order of the Azure Dream, Qiblai's blue monastery (`LORE.md` §6.13), on the long isle in
Erehwon's lake. It has a fishermonks' wharf in a cove facing Erehwon, a lower ward of pilgrims' hostels under a scarp, the
Stair of Lowered Eyes up the scarp, and a walled precinct on four terraces climbing the slope. At the top is the Hall of
Dreaming, where 256 sleepers wait for a dream. `PLAN.md` is the design and the owner's answers; `BLUEPRINT.md` explains the
sheets in `floors/`; `FURNITURE.md` is the manifest; `KNOWN_ISSUES.md` lists what is still owed.

## Build and verify

```
python3 build.py                                   # dist/azure-dream.html (gen/39ad-world-data.js from region/data first)
KRATOR_GL=gpu python3 verify.py dist/azure-dream.html --assert --views "Overview,From the barge,Inside the Hall - down the Keepers Walk"
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
| `targets/isle/89z-rows.js` | `window.CITY` (Xanadu's showcase skipped), the title, no sheet rows |
| `targets/isle/89zad-site.js` | the site as records: the ground at 1:1 (`WORLD.H` on the region cut, the page's origin the cove's head at the scarp's toe), the cove's two headlands (the records of `tools/scale-model/edit_517_azure.py`, through `WORLD.landHook`), the precinct's four terraces and a pad under every building (`terrainH`), every place (`AD_PLACE`), the zigzag stair, the precinct's walls, the ways, the flora's mask and fields |
| `targets/isle/90ad-world.js` | the Krator sky; the near ground (6 m cells, the Qiblai pack's sets blended by a zone mask painted from the records and by the shore's band); the far ground (the whole cut, 400 m cells, the world's colours); the lake on core/water (`WATER.open`, `WATER.draw`, the sky in it from core/atmos's skylight) |
| `targets/isle/90ae-build.js` | the retaining faces where a pad or terrace stands off the ground; every place through `VERN.place`, chunk by chunk, baked; the lamps turned into the world (`AD_LAMPS`); the Vale of Xanadu's flora grown over the mask and baked |
| `targets/isle/90af-hall-night.js` | the night: the azure glass's glow, a fixed pool of point lights taken by the lamps nearest the eye |
| `targets/isle/91z-views.js` | the views; the budgets; `_api.setHour`, `_api.lamps` (the krator-lamps export) |
| `verify.py` | Xanadu's verify plus the page's invariants: `azure-laid`, `dream-cots`, `cove-water`, `terraces-climb`, `stair-climbs`, `lamps` |
| `region/` | the scale model's cut round the cove (`data/`, by `tools/scale-model/extract_region.py` on the scale-model line with edit 517 and the cove applied; `source/` its inputs) |
