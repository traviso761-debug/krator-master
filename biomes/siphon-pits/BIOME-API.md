# biomes/siphon-pits: the kit's API

Region 98 on scale model 5.1: the Ostrukh Terraces (NW) and the Siphon Pits (SE). Four ideal-type stations, one kit (`SIPHON`), on the shared
biome core. `PLAN.md` is the plan (section 0 the survey and its corrections, section 6 the core adoption, section 7 the order of work).

```
cd biomes/siphon-pits && python3 build.py --all        # dist/siphon-pits.html (station 3) and dist/siphon-pits-<terraces|scarp|arete>.html
python3 verify.py dist/siphon-pits.html --assert        # the invariants, the host's checks and their negatives, the plan table
node tests/test-land.js                                 # the four lands headless, and the records against the air law
```

## The pages

| Page | Station | What it shows |
|---|---|---|
| `dist/siphon-pits-terraces.html` | 1, Ostrukh Terraces (2,157 m, 1.22 atm, +15 degC, Cwb) | the braided meltwater on its cobble bed (`KRELIEF.wadi`), loess terraces (`KRELIEF.terraces`) with the crops `kits/crops` gives, dwarf blue willow by the braids (`KMASK.distance`), farmstead sites |
| `dist/siphon-pits-scarp.html` | 2, the Scarp Pass (3,289 m, 1.06 atm, +4 degC, Dsc) | the Ostrukh Wall (`KRELIEF.scarp`) with its ravine and scree fan, the caravan road's switchbacks, frost polygons and lobes (`KFROST`), cushion moss, lichen, sedge; the tollhouse and beacon sites. No trees |
| `dist/siphon-pits.html` | 3, the Siphon Maar Floor (2,277 m, 1.20 atm, +18 degC, Cfa) | a 420 m maar (`KRELIEF.stepcut`) in the sink, the amber deck (the height fog's mist and its lid), the woolly siphon groves (cap 250), siphon felt, suture galls, the vent well's geyser, mud pots, the roper camp's site |
| `dist/siphon-pits-arete.html` | 4, the Arete Way (4,269 m, 0.94 atm, -5 degC, ET) | a 6 m knife-edge between two 420 m pits (a 0.5 m `KFIELD` inset), the blizzard (opens in it: `?weather=clear`), iron stanchions and chains, the gantry, the flensers' lairs. No trees |

## Data (plain, `[G data]`)

- `SIPHON_STATIONS` (inlined by `build.py` from `stations/*/station.json`): each station's surveyed record: `px`, `py`, `base`, `atm`, `mean`,
  `warm`, `cold`, `high`, `low`, `rain`, `cls`, `wind`, `fog`, `water`, `crops`. The survey's one copy.
- `SIPHON_SITES[key]` (`40`): the record plus each station's layout (the braids, the wall, the maar, the pits, the vents, the sites).
- `SIPHON_TREECAP`: `{terraces: null, scarp: 0, pitfloor: 250, arete: 0}`. `SIPHON.treeRule(station, trees)` -> `{ok, detail}`.
- `SIPHON_SOUND[key]`: sound sources for core/audio (records only).
- `SIPHON.SPECIES`, `SIPHON.byKey`, `SIPHON.HARVEST`: seven species, tagged (climate, aridity, riparian, Koppen, `heat`, `native`, `tree`,
  `stations`, harvest). `SIPHON.TREES`: every tree stood, `{key, kin, x, z, y0, H, rb}`.

## Builders

- `SIPHON.build({station, R, quality, ...})` runs the station's pass:
  - `SIPHON.buildPit(R, q, {heat, keep, cap, galls})`: the woolly siphon (`BIO.kin('throne.siphon')`, the Throne's builder read in place;
    its pelt and fleece this kit's), the felt, the galls. Candidates scored by `KRAND.hash` per cell; the best `cap` stand.
  - `SIPHON.buildCold(R, q, {slope, normal, shelter, keep, grass})`: cushion moss, rock lichen, scree sedge.
  - `SIPHON.buildTerraces(R, q, {fieldAt, braid, willow, keep})`: the crops on the treads, the willow, the sedge.
  Each returns its counts. Every cell is `KRAND.cell(seed, ix, iz)`.

## The page's API (`window._api`, core/host)

`hostChecks()` and `hostNegatives()` (the air against the air law and the page's fields; the station's own life; the tree rule; the felt off
the hot ground; nothing drowned; the people's sites; the cameras), `site()`, `station()`, `trees()`, `air(y)` (`{atm, temp}` by the air law and
the lapse from the record), `at(x, z)` (height, water, heat, the fields). Exporters: `biome`, `sound`, `field` (the `KFIELD` round the centre),
`plan` (the mask's hashes, the crops, the sites).
