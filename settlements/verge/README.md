# Verge

Twin cities at the far southeast of the crater, where the high desert's river falls about 860 m down seven cataracts
into the Eastern Abyss, at the easiest descent from the western trade routes to the abyssal floor. **Upper Verge**
fills the canyon floor at the top: it is run by a governor sent from Iziz and built in the Iziz Vernacular. **Lower
Verge** spreads round the plunge pool and the river at the bottom: it is run by a mayor its residents elect and is
built in the Yuni and Eastern Abyssal styles, like Locus. The two cities are joined by a switchback trail of 26 legs and
about 7 km, with a toll house and a small palisade at each end and four rest stops at the 200, 400, 600 and 800 m marks
of the descent. The rusted, broken remnants of an Ancient funicular run down the same spur. Salt lakes lie far to the
east.

`DESIGN.md` reads the brief back as decisions. `API.md` is the contract every fragment keeps. `KNOWN_ISSUES.md` lists
what is still open. `PORT.md` says how each fragment reaches Godot.

## What Verge owns, and what it reads from home

Verge's `src/` holds only its host: the layout, the stage, the placement, the life layer, the camera and the probe.
Every kit, biome and core module is **read from its own folder at build time**, never copied. A building added for Verge
went into its culture's kit and interior set, so it is there for every other build:

| From | What | Added for Verge |
|---|---|---|
| `settlements/iziz/src` (the IZV bundle) | the Iziz Vernacular kit with its Ancients core | `74b-vern-frontier.js`: the governor's palace, the guard tower and barracks, the watch house, the toll house, the palisade and its gate, the mustering ground, the **rest stop** (cut into the rock, or built out on a cliff) |
| `kits/ancients/src` (in the IZV bundle) | the Ancients kit | `8ap-funicular.js`: the funicular ruin (plan as data, draw through the kit) |
| `settlements/locus/src` (the YKIT bundle) | the Yuni base assets, the Locus kit, the Eastern Abyssal kit, the Yuni engine's night light | `65-abyss-75-verge.js`: the **Mayor's compound**, the guard tower, the toll house, the palisade and its gate |
| `kits/interiors/sets` | the interiors of every building | `iziz.js` (all 36 vernacular keys), `yuni.js` (the Yuni assets Verge places), additions to `abyss.js` |
| `kits/catalog` | the furniture, through `core/furnish` | none |
| `biomes/sedesert`, `biomes/eastabyss` | the flora and fauna: the plateau and canyon, the abyss floor | deer and coyotes (sedesert), flamingos and frilled lizards (eastabyss) |
| `core/` | rand, walk, sched, clock, mask, tags, furnish, biome | none |
| `settlements/locus/src/21-sky.js`, `82-daynight.js` | the lighting system (vendored copies `81`, `82`) | none |

## Build and verify

```
cd settlements/verge
python3 build.py                                   # dist/verge.html; port lint, syntax check
python3 verify.py dist/verge.html --assert         # the error panel, the counters, the checks and their negatives
python3 verify.py dist/verge.html --views "On the trail,The plunge pool" --hour 21 --out shots
python3 verify.py dist/verge.html --export ../../godot/data/verge   # the Godot export (below)
node tests/test-layout.js                          # the layout in node: no browser, no THREE
```

`?flora=0` skips the biomes and `?interiors=0` skips the furnishing, for a quick look.
`?hour=21` sets the clock and `?time=run` starts it.
`?furnishR=500` furnishes interiors out to 500 m from the camera; the default is 320 m.

A headless load takes about 2 minutes under SwiftShader, and each screenshot about 30 s.

## Godot

The page's world is data before it is drawn, and `verify.py --export` writes these files:

- `terrain.json` (krator-heightfield)
- `place.json` (every building, street, bridge, plaza, the trail and the funicular's plan)
- `tags.json` (core/tags)
- `walk.json` (core/walk)
- `sim.json` (krator-sim: the factions, places and slots, roles, the nav graph, and every timetabled group)
- `golden.json` (the members' poses at five motion times)

The spike's `verge` case (`godot/spike.gd`, key 6) builds stand-ins from these files. `godot/krator/verge_sim.gd` is
`SIM.memberPose` in GDScript, and the following test replays the timetable against the golden trace:

```
godot --headless --path godot --script res://tests/verge/verge_sim_test.gd
```

## Compass

x east, z south, north is -z; metres; y up.
The origin is the lower trailhead. Upper Verge spans x -2780..-1404, and the lip of the escarpment is at x ≈ -1400.
