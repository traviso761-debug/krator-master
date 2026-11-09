# Godshearth

The caldera let down into the Godthrone's south flank, above the Vale of Xanadu: a Yellowstone-like geothermal basin at 3.6-4.1 km with sea-level air
(1.0 atm), where the Hearths grow as a whole country. **Read `PLAN.md` first** (the map's carving, the geology, the owner's climate, the life, the
stations, the core adoption in section 8). `KNOWN_ISSUES.md` lists what station 1 does not do yet.

## How it is built

Godshearth draws no engine of its own. A station is **a geyser field on Godshearth's ground**: `build.py` reads the geyser kit in place
(`biomes/geyser/src/` and its shared field stage, `biomes/geyser/stations/field/`, whose contract is `STATION_SITE` and `STATION_GROUND`) and the
Hearths (`biomes/hearths/src/50`, `55`, as a neighbour's kit in its own registry: station.json `"kin"`), then this kit's station fragments, which win on a
shared name. The core modules are the geyser kit's list plus the station's `"core"` (KTHERM, the lean).

```
python3 tools/build.py biomes/godshearth                   # dist/godshearth.html: station 1, the Hot Lake (stations/prismbasin)
python3 verify.py dist/godshearth.html --assert --all-views
```

A change to the geyser kit's `src/` or field stage, or to the Hearths' `src/50` and `55`, reaches this page: rebuild it (`python3 tools/reach.py <file>`).

## Station 1, the Hot Lake (`stations/prismbasin`)

The hot lake's east shore at 5.1 px 842,1394 (3,642 m; the page's datum is the lake's level): the lake in the west of the page (WATER.open, still), a
geyser field on its sinter shore (the geyser kit: geysers, a great prismatic spring, hot pools, an acid field, the run-off's mats), and 500 m inland a
vent line (KTHERM) with the Hearths' grove along it (`HEARTH.layout`, rim dress): hearth trees on 25-60 degC ground, the ember mat, coal moss, stokers,
tallow, and rings of dead stalks round a dead spring. The fans open at night (`HEARTH.work`; try `#hour=22`).

| Fragment | What |
|---|---|
| `44s-host-site.js` | the site: the land (`ghLand`, the shore), the lake's record, the vent line, the field's spec, the air, the take (views, checks), the ground's paint |
| `47b-host-heat.js` | KTHERM: the floor's soil (+7 degC) and the vent line, baked once; the fumaroles and their heat hazards |
| `87-host-hearths.js` | the grove and the ghost rings (`HEARTH.layout`), the checks (`GHC`) |
| `89w-host-water.js` | the hot lake (WATER.open, WATER.draw) |
| `89x-host-air.js` | the vent line's steam, the engine's state each frame |

Stations 2-4 (the Grove, the North Wall, the Spillway: PLAN.md section 7) are not written.
