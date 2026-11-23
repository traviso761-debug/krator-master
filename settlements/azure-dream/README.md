# settlements/azure-dream: Grēṭ-Āil, the Azure Dream's head monastery

The head monastery of the Order of the Azure Dream, Qiblai's blue monastery (`LORE.md` §6.13), on the long isle in
Erehwon's lake. It has a fishermonks' wharf in a cove facing Erehwon, a lower ward of pilgrims' hostels under a scarp, the
Stair of Lowered Eyes up the scarp, and a walled precinct on four terraces climbing the slope. At the top is the Hall of
Dreaming, where 256 sleepers wait for a dream. A second page, `dist/azure-dream-summit.html`, is the isle's summit 9 km up the
Dream Road: the Summit Chorten, the great wheel, the Station Watch and the High Kora with its sixteen wheel houses. Three more are the isle's fishing villages, West End, North Shore and East End
(`dist/azure-dream-west-end.html` and so on), laid out by core/hamlet. All five pages share `src/` and stand on the same 1:1
ground. `PLAN.md` is the design and the owner's answers; `BLUEPRINT.md` explains the
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
| `src/89qb-ad-wharf.js` | the wharf (seeds 34041-34121): the dugout, the mole and its wave-wheel shrine, a jetty, the boathouse, the net and fish racks, the smokehouse, the ropewalk, the fishermonks' house, the Order's barge; the terraced orchards (`qb_ad_orchard`, 34181-: the Vale apricot and the Frost persimmon, their names from `kits/crops`) and the bee walls (`qb_ad_hives`, 34191-) |
| `src/89qc-ad-summit.js` | the summit's new buildings: the Station Watch (seed 34131), a blue-dressed court range with a stair tower whose roof platform carries the signal lamp in its gilt cage; the relay lamp (34132), a slender tower by the Dream Road's first chorten, its lamp 23 m up, the keeper's hut at its foot |
| `src/89zaa-ad-ground.js` | every target's ground and placement: the region's frame (`AD_SITE`, set by the target's `89z-rows.js`: its origin, near box and flora's origins), the ground at 1:1 (`WORLD.H` on the region cut), the cove's two headlands (the records of `tools/scale-model/edit_517_azure.py`, through `WORLD.landHook`), the pads (`AD_PADS`, cut and filled, blended by `terrainH`), `adPut` (a place by the plan's u and v, on a pad of its own), `adZigzag` (a stair in runs and landings), `AD_SIGNAL` (the Station's signal line: the Watch's lamp, the relay, the Hall's lantern roof, and `adSight` to test a sight line over the 1:1 ground), the flora's mask and fields |
| `src/89zac-ad-village.js` | the fishing villages on core/hamlet (`KHAMLET.village`, sealed with core/space and core/city in `gen/69ad-kcity-bundle.js`, which `build.py` writes at every build as Qiblai's does): `AD_VILLAGE_ROW` (the page's culture row: Xanadu's poor and middle houses, shops, teahouse, warehouse, the Farmers' Guild as the fishers' hall, Qiblai's wayside shrine; the fishing works the boat shed and the wharf's racks and smokehouse), `adVillage` (the shore found from the village point, the village laid out with its main lane along the coast toward the monastery, each building on its own pad; the landing: a jetty run out to 1.2 m of water, dugouts on the beach and moored), `adVillageViews`; with `herds`, the Order's meadow inland (a corral and two pens: East End) |
| `src/90ad-world.js` | the Krator sky; the near ground (6 m cells, the Qiblai pack's sets blended by a zone mask painted from the records and by the shore's band); the far ground (the whole cut, 400 m cells, the world's colours); the lake on core/water (`WATER.open`, `WATER.draw`, the sky in it from core/atmos's skylight) |
| `src/90ae-build.js` | the retaining faces where a pad or terrace stands off the ground; every place through `VERN.place`, chunk by chunk, baked; the lamps turned into the world (`AD_LAMPS`); the Vale of Xanadu's flora grown over the mask and baked |
| `src/90af-night.js` | the night: the azure glass's glow, a fixed pool of point lights taken by the lamps nearest the eye (the summit's signal lamp among them) |
| `src/91zz-ad-api.js` | `_api.setHour`, `_api.lamps` (the krator-lamps export) |
| `targets/isle/89z-rows.js` | the isle's page: `window.CITY` (Xanadu's showcase skipped), the title, no sheet rows, `AD_SITE` (the origin the cove's head at the scarp's toe; the near ground 2 km up the slope, to take in the relay) |
| `targets/isle/89zad-site.js` | the isle's places: the precinct's four terraces, every place (`AD_PLACE`), the zigzag Stair of Lowered Eyes and the terraces' stairs, the precinct's walls, the Dream Road's first 1.5 km with its first chorten and the relay lamp, the ways and courts |
| `targets/isle/90ag-ad-walk.js` | the Hall of Dreaming in core/walk (floors, walls, columns, the lattice, screens and cots; its two drawn doors unlocked, every door a walk block through `KDOOR.walk`), `_adWalk.walkIn()` (shut, the walker stays out; open, it reaches the kora and both sides); the Lotus Garden's four ponds on core/water (`WATER.still`, `drawStill`) |
| `targets/isle/90ah-ad-night.js` | the Hall's night on core/sched (`KSCHED.timeline`, period 24 h, the sky's hour): the Lulling, the door shut 19.5-6.0 (core/door), the azure lamps and the censers, the three watches with a keeper's hooded lamp walking the Keepers' Walk; the Station's passes from core/atmos's sky model (`ATMOS.skyState` at the isle's site: a Station's night when its best lit pass peaks at 66.3 degrees or more, the shutters open while it stands over 40; `?day=N`, `?station=1`); the kora's 96 wheels and the great wheel turning as the kit's prayer-wheel item and braked one by one at the Lulling (`AD_WHEELS`); `AD_LAMPON` tells the light pool (90af) which lamps burn |
| `targets/isle/90ai-ad-interiors.js` | every other building's ground storey walked into, on demand: Qiblai's lot-interiors host (its 90u) over this page's places, the kit's `qnShellOf`, `qnIxProgram`, `qnIxType` (kits/interiors' plans, the catalog's textured pieces: `kit.json` `interiors`, `furniture`, `interiorSets`), `qnIxWalk`; the great monastery's cell ranges on the monks' programme; `_adIx.walkIn()` |
| `targets/isle/90aj-ad-great-rooms.js` | the great monastery's great rooms (Qiblai's 90t, its monastery part): the court and the flight to its gate in core/walk, the assembly hall (`qb_ix_assembly`) and the gate hall (`qb_ix_gatehall`) drawn, furnished and lit on demand, their doors unlocked; `_adGreat.walkIn()` |
| `targets/isle/91z-views.js` | the isle's views and budgets |
| `targets/summit/89z-rows.js` | the summit's page (`dist/azure-dream-summit.html`): `AD_SITE` the crest of the isle's dome, +308 m, 9 km up the Dream Road |
| `targets/summit/89zad-site.js` | the summit's places: the Summit Chorten on the crest, the great wheel's house, the Station Watch, the pilgrims' shelter, the High Kora (a ring 260 m out with sixteen wheel houses), the Dream Road toward the monastery's back gate and its chorten at the kora |
| `targets/summit/91z-views.js` | the summit's views and budgets |
| `targets/west-end/`, `north-shore/`, `east-end/` | the three fishing villages (`dist/azure-dream-<name>.html`): each its site (probed on the 1:1 shore) and its people (250, 200, 150), its id and name the economy's record (`lk.great-isle-west` Wesṭ-Ēn, `-north` Nōṛ-Shōr, `-east` Īsṭ-Ēn), the village placed by `adVillage` |
| `verify.py` | Xanadu's verify plus each page's invariants: the isle's `azure-laid`, `dream-cots`, `cove-water`, `terraces-climb`, `stair-climbs`, `hall-walk-in`, `lotus-ponds`, `lamps`, `signal-relay`, `night-schedule`, `orchards`, `interiors`, `walk-in-rooms`, `great-rooms`; the summit's `summit-laid`, `high-kora`, `summit-crest`, `signal-lamp`; each village's `village-laid`, `village-dry`, `village-clear`, `landing` (and East End's `herds`) |
| `region/` | the scale model's cut round the cove (`data/`, by `tools/scale-model/extract_region.py` on the scale-model line with edit 517 and the cove applied; `source/` its inputs) |
| `export_records.py` | the built pages' records, terraces, ways, lake and axis profile to `floors/page-isle.json` and `floors/page-summit.json` (the shared harness); `azure_blueprint.py` draws sheets G, W, S and the section from them |
