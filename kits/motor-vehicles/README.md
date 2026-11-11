# kits/motor-vehicles: the Motor Vehicles kit

Procedural motor vehicles that any Krator world can take as ONE bundle, the way the catalog's furniture reaches
other worlds. Each vehicle is tagged by culture, carries the data a simulation reads (top speed, seats, cargo, fuel,
wheel layout), and is built as two merged body meshes plus one mesh per wheel (a host spins them and steers the
steered ones), with lamps it can switch at night, and textured from the shared material library (detail maps
from one kit atlas: no extra draw calls).

**Textures.** The vehicles have no UVs (merged vertex-coloured meshes), so the library reaches them as DETAIL maps,
as on Girder's catalog furniture: the shader samples each set by triplanar projection of the mesh's own position and
divides the set's mean brightness back out, so every palette keeps its colour and gains the set's grain. Eight
families from `core/materials/library` in one atlas: `paint` (Metal003, clean paint: the Izani hull, lacquer),
`paintWorn` (Metal062C, chipped paint: the buggy, the crawler's cream, the caravan truck, the hab's cab and drums),
`metal` (Metal038: tube, engine, frames), `rust` (rusty_metal_04: the hab), `corrugated` (worn_corrugated_iron: the
hab's containers), `canvas` (canvas.tent), `tarp` (cloth.tarp: the caravan tarps, canopy, awnings) and `wood`
(weathered planks: crates). Which surface takes which is each culture's `detail` table (palette key -> family) or a
family named on the primitive (`'corrugated'`, `'tarp'`); glass, lenses, hoses and ropes take none. Tyres take
`rubber` (`rubber.tyre`). `?mat=proc` on the sheet shows the old vertex-colour look. Since 2026-11-08 the atlas holds
up to 32 families (eight rows of four; `vehicle_bundle.py` packs the rows the bundled cultures need) and the Ancients
add `ancientWhite` (`metal.ancient.white`: their seamed white panel), `bronze` (`metal.bronze`), `concrete`
(`concrete.ancient`: the hauler's deck) and the ruin pass's `rustHeavy` (`metal.rust.heavy`); `scorched`
(`metal.scorched`, burnt paint) is wired but owed (`core/materials/PROMPTS-NEEDED.md`).

**Ruin states (2026-11-08).** Every vehicle of every culture builds in one of four states,
`KratorVehicles.build(key, { state: 'intact' | 'weathered' | 'burnt' | 'wreck' })`: the same vehicle (same seed,
same variant) rusted over, grimed, its glass gone and its tyres flat; burnt out, sooted, sagging, the interior open;
or a wreck in one of seven forms by seed (crushed, overturned, torn in two, crashed nose-first, t-boned, exploded,
on its side; an airframe has its own six, all on the ground with its gear gone: skidded at the end of a furrow with a
wreckage trail, nosedived with the tail in the air, broken in two, piled into a heap at the nose, overturned, gutted
to a charred heap), a wheel missing, trim sprung and fallen. The ruin is a record
(`vehicles-core.js` `vehicleRuin`, `KratorVehicles.ruinOf(state, seed, key)`) that the runtime's general pass draws
onto the merged body of any culture, so a ruined vehicle costs the same draw calls and fewer triangles; a culture's
`build(F)` may read `F.ruin` to draw its own damage (the Ancients skip their glass and char their seats). The sheet's
State select (S) rebuilds every vehicle in a state; `?state=wreck` opens it so. Built for the Ancient's Valley's
streets (`biomes/ancientsvalley`), where every vehicle is a thousand years dead.

| Key | Name | Culture | Wheels | Variants |
|---|---|---|---|---|
| `anc_pod` | Ancient pod car | `ancient` | 4 in flared wells, front steers | Civic (white), Hire (bronze roof, a cyan sign) |
| `anc_saloon` | Ancient saloon | `ancient` | 4 in flared wells, front steers | Saloon (white), Statesman (bronze roof and dishes, a bonnet spine) |
| `anc_police` | Ancient watch car | `ancient` | the saloon's | Patrol (lamp bar, bull bar, belt stripe, searchlight), Pursuit (darker, bronze roof) |
| `anc_van` | Ancient delivery van | `ancient` | 4: the cab-over fronts under mudguards, the rears in wells | Van (crates aboard), Courier (a roof pod) |
| `anc_utility` | Ancient six-wheeled utility | `ancient` | 6, front axle steers | Works (two tanks in a bronze cage), Patrol (a lamp bar and a dish) |
| `anc_hauler` | Ancient flatbed hauler | `ancient` | 6, front axle steers | Flatbed, Pods, Crates (and drums), Container |
| `anc_tram` | Ancient guideway tram-car | `ancient` | 8 in wells, none steers (guided) | Tram-car |
| `anc_tank` | Ancient lance tank | `ancient` | tracked: 10 road wheels, two belts, skid steer | Line, Command (a dish) |
| `anc_heli` | Ancient helicopter | `ancient` | 3 (landing gear), none steers | Transport, Patrol (searchlight, blue cells) |
| `anc_jet` | Ancient passenger jet | `ancient` | 3 (landing gear), none steers | Liner |
| `geo_dune_buggy` | Geomancer dune buggy | `geomancer` | 4 | Scout (2 seats, tarp), Crew (4 seats, longer cage), Drill rig (auger mast, drill pipe) |
| `rep_crawler` | Republic salvage crawler | `republic` | 8 wire-mesh, front and rear axles steer | Survey (cream, solar lid open), Hauler (ochre, lid shut under crates and drums) |
| `iz_six_wheeler` | Izani armoured six-wheeler | `iziz` | 6, front axle steers | Lancer (orange, four-tube rocket rack), Courier (cream, striped awning, the palace orb) |
| `ab_caravan_truck` | Abyssal caravan truck | `eastabyss` | 4 big sand tyres | Caravan (sand, pastel tarps), Headman's (teal, lacquer and gold, tin-mirror cladding) |
| `pa_crawler_hab` | Post-Apoc crawler hab | `post-apoc` | tracked: 12 road wheels on four bogies, skid steer | Hab (rust and olive), Trader (faded teal, mustard, awning, crates) |

**The Ancients' ten** (2026-11-08, for the Ancient's Valley; `krator-vehicles-ancient.js`) are in the metropolis
kit's house style (`kits/metropolis/PLAN.md` 2, "The family": Cyclopean, Modernist, Organic): smooth monocoque
bodies of stacked superellipse sections (`F.tub`), white seamed panel, a bronze belt band at the waist, a blue-glass
canopy on bronze posts, cyan strips along the sills and across the nose (a lamp family: they glow with `lights()`
and are dead in a ruin), the wheels under boxy sills behind bronze arches (the steered pair clears the skin at full
lock) on real running gear (a beam axle between each pair, a knuckle and an upright from each wheel to the body, a
mudguard shell over the cab-over wheels), hollow cabins (an open belt, an inward-facing liner, a low floor between
shelves over the wheels, the seats and dash inside the canopy), no engine (Ancient cells, hub motors: `fuel:
'battery'`). The pod car (2 seats, 2.1 x 3.3 m),
the long low saloon (4 seats, 6.0 m, bronze fins), the delivery van (a cab pod before a box with a bronze roller door),
the six-wheeled utility (a cab pod and an open bay under a bronze cage, two tanks), the flatbed hauler (a cab pod over
the front wheels, a board-formed composite deck with bronze rails and stakes) and the guideway tram-car (13.4 m, forty
seats, a window ribbon all round on bronze mullions, a bronze hoop every 3.6 m where the structure transfers, two doors
a side, guide skids under the floor; `maxSteer` 0: the viaduct guides it). Then the watch's car (the saloon with a
lamp bar, a bull bar and a searchlight), the lance tank (tracked: a low hull, sponsons and skirts, a turret with an
energy lance that a wreck knocks round and an explosion takes off), a helicopter (a glazed nose, a tail boom, a
four-blade rotor that droops in a ruin) and a passenger jet (swept wings with ducted fans, a T-tail, a cockpit visor;
a wreck's wing lies torn off beside it), both standing on their landing gear for a host to place. 3 700 to 7 400
triangles intact, fewer ruined. In a ruin the glass is gone but its frames stay and shards of dark glass stand in them.

The buggy: a welded tube roll cage, a low tub of salvaged plate, two bucket seats, a big exposed Ancient-salvage
flat-four at the rear with twin exhaust stacks and an upright radiator, four 0.85 m balloon sand tyres with chunky
chevron lugs, long-travel arms and coilovers, a jerry can rack on each step, the spare on the hood, a roof rack with a
rolled tarp, a whip aerial with a pennant, two headlamps and a four-lamp bar (emissive: `lights()`), tail lamps, and a
blue window on the Ancient cell. Livery: earth brown, oil black, brass; the Geomancers' sign (a brass flame on a brown
disc with a brass rim, as on the Locus fuel-station pole) on both flanks and the nose. Lore: `LORE.md` 6.9,
`settlements/locus/LOCUS-KIT-NOTES.md`.

The other four came from reference pictures (2026-10-06), each given to the culture whose look and lore it fits:

- **The Republic salvage crawler** (`LORE.md` 6.3): an Ancient planetary rover the Iron Republic's Salvagers dug out
  of Roketstad's spaceport aprons. A cream superellipse bowl about 11 m long on eight 2.4 m wire-mesh wheels (two hoops,
  a diagonal lattice, cleats, a hub motor each), a clam-shell solar lid on struts (open in Survey, shut and loaded in
  Hauler), an instrument head with two camera-eye headlamps, a lamp spire with a blue tip, a tiered mast on a dome, a
  ladder and railings. The Ancients' mark is scraped off except a red star on the nose; the Republic's red band and its
  triskelion (three bent arms, each fist holding a sword at 90 degrees) are painted on the bowl. Solar and an Ancient
  cell: `fuel:'battery'`, 4.5 m/s.
- **The Izani armoured six-wheeler** (6.2): an Ancient patrol car the Forgemasters keep running beside the mechs.
  A faceted hull in three bands (a dark belt flaring over the wheels, the upper hull leaning in, a glasshouse cab of
  teal panes), running-gear housings between the wheels, a roll bar over the open rear bay, the gold sun on both flanks.
  Lancer carries a four-tube rocket rack (the Empire's rockets from its Roketstad years); Courier an orange-and-cream
  striped awning, the palace orb on a mast and crates.
- **The Abyssal caravan truck** (6.9): a salvaged Ancient expedition truck a caravan family runs on the Geomancers'
  crude. A high glazed cab over big sand tyres, corrugated snorkels up its cheeks, a box body under dripping tarps in
  colour bands, slung packs and lockers, an observation cupola under a tent canopy with a swagged drape, a parasol,
  two salvaged dishes and a mast of tin-mirror shades (the abyssal people have nothing electric: the reference's sun
  panels became the tin-mirror their culture prizes, its drones were left out, and the lamps are oil lanterns).
  The red-lacquer star on a gold disc on both doors.
- **The Post-Apoc crawler hab** (6.17): a moving house on four track bogies. An armoured cab with a wedge nose and a
  railed roof deck lined with red jerry cans, a rust-plated hab with corrugation, patch plates and grille windows, two
  containers stacked on top (one cantilevered on struts), a ribbed glass dome, a dish, three TV aerials, a big exhaust
  run with a U-bend, a balcony and a ladder at the back, the mustard gear on both flanks. Tracked: the twelve road
  wheels turn (they ride the belt: `lift` 0.08) and the belts run round their loops (`roll()`); skid steer, `maxSteer` 0.

## Files

| File | What |
|---|---|
| `vehicles-core.js` | the `VEHICLE({...})` registry, its vocabularies, `VEHICLE_CULTURE()` (palette into the core's FPAL), the ruin states (`VEHICLE_STATES`, `vehicleRuin(state, seed, key)`: the record), the vehicle frame (catalog `makeFrame()` plus disc, face, taper, ring, tube, tri, knob, lamp, spareWheel) and `vehicleBalloonTyre()` |
| `krator-vehicles-<culture>.js` | one file per culture (as the catalog does): its palette and its vehicles. Now: `ancient`, `eastabyss`, `geomancer`, `iziz`, `post-apoc`, `republic` |
| `vehicles-detail.js` | the detail maps: the slot each vertex takes, the kit atlas (colour, normal, roughness) composed from the packed maps, the triplanar shader hook |
| `materials.json`, `tex/` | the families and their library sets (Girder's adapter shape); `tex/` is what `tools/textures/pack.py kits/motor-vehicles` wrote from them (commit it). `vehicle_bundle.py` inlines the families the bundled cultures name |
| `krator-vehicles-runtime.js` | the API (`KratorVehicles`): assembly, the per-material merge (with the detail slot per vertex), the ruin pass (recolour, sprung trim, sag, crush, tear, overturn, flat and burnt tyres, the settle), wheels, belts, roll, steer, lights, textures |
| `vehicle_bundle.py` | `bundle(cultures=None) -> str`: one closure, one global |
| `build.py`, `src/` | the kit sheet `dist/motor-vehicles.html`, and `dist/krator-vehicles.js` (the bundle alone) |
| `verify.py` | headless checks and screenshots |

**Why a registry of its own, not the catalog's `ASSET`.** An `ASSET` is a building: its culture must be one of
`ASSET_CULTURES`, it has districts and building types, and it is drawn as one static group. A vehicle has moving
parts (wheels to spin and steer, lamps to switch) and simulation data a host reads without drawing anything. So the
kit reuses the catalog core for everything a body needs (the frame, the primitives, the palettes, `mat()`), and adds
the entry shape, the wheel records and the assembly. The catalog core is read from `kits/catalog/` at bundle time,
never copied.

## Build and verify

```
cd kits/motor-vehicles && python3 build.py                 # -> dist/motor-vehicles.html, dist/krator-vehicles.js
python3 verify.py dist/motor-vehicles.html --assert         # every vehicle x variant x seeds 1..3, plus the bundle alone
python3 verify.py dist/motor-vehicles.html --out shots --views front34,side,rear34,top --night
python3 verify.py dist/motor-vehicles.html --out shots-wreck --views front34 --state wreck    # every vehicle in a ruin state
python3 build.py --vendor-check                             # no src/ copy of the placeholder sky (core/atmos/placeholder)
python3 ../../tools/textures/pack.py kits/motor-vehicles     # after materials.json changes (numpy, Pillow; the sets via git lfs pull)
```

`--assert` checks: builds, no NaN, wheels on y = 0 (a road wheel on its belt), fits the declared box, at most two
meshes plus one per wheel and 6 000 triangles (or the entry's own `budget.tris`, never over 20 000),
moving parts (wheel origins at their hubs, steer pivots, roll/steer/lights do what they say, a tracked vehicle's belts
run and stay on the ground), tags and data from the vocabularies, the paint's LINEAR value in the vertex colours,
textures (a detail slot per vertex, the atlas hook on every material), clearance (no steered wheel inside the body at
full lock either way), determinism, `ruin` (every vehicle in every ruin state: grounded, within the settled box, under
budget, the glass gone, the lamps dead, a wreck's wheel missing, deterministic, unlike the intact build), and
`bundle-alone` (a blank page with only
three.min.js: the bundle adds exactly one global, `KratorVehicles`, and builds every vehicle). verify.py serves
`three.min.js` from this folder: copy `kits/catalog/three.min.js` here first in a fresh checkout (without it the
page never loads and the run waits out its timeout).

The sheet: one row per vehicle, every variant, a 1.75 m figure for scale. Drive (R) rolls and steers; Lights (L);
Night (N); State (S, or the select) rebuilds every vehicle in a ruin state; the hover inspector (T) shows name,
culture, tags, data and the ruin; the polygon tool (P). The page engine is
`kits/catalog/krator-asset-engine.js`, read by path; the sky is the standard KratorSky (vendored).

## Taking the bundle into a world

Like Locus takes `furniture_bundle`: a GENERATED fragment from `build.py`, never written to `src/`.

```python
ROOT = os.path.dirname(os.path.dirname(HERE))
def virtual_bodies():
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'motor-vehicles'))
    import vehicle_bundle
    return {'65y-vehicles-bundle.js': vehicle_bundle.bundle(['geomancer'])}   # only the cultures it uses; None: all
```

The text is `var KratorVehicles = (function () { ... })();` with `<script` escaped. Inside a Locus-lineage
`function BUILD(){...}` the `var` is local to BUILD, which is what the glue there wants; nothing else is declared, so
the host's own `TAU`, `PAL`, `rnd`, `shade` are untouched. Then, in the world's glue:

```js
const g = KratorVehicles.build('geo_dune_buggy', { variant: 0, seed: 7 });
g.position.set(x, groundY, z); g.rotation.y = heading; scene.add(g);
KratorVehicles.lights(g, isNight);
// a ruin on a dead street (the Ancient's Valley: bundle(['ancient'])): a static prop, its lowest point on y = 0
const w = KratorVehicles.build('anc_pod', { variant: 1, seed: 7, state: 'burnt' });   // or 'weathered', 'wreck'
w.position.set(x, groundY, z); w.rotation.y = heading; scene.add(w);
w.userData.ruin   // { state, form: null | 'crushed' | 'overturned' | 'torn', rust, soot, tyres, missingWheel ... }
// driving: each frame, move by v*dt along (sin h, 0, cos h), then
KratorVehicles.roll(g, v * dt); KratorVehicles.steer(g, steerAngle);
```

Vertex colours are converted to linear by default (every Krator page renders with `outputEncoding = sRGBEncoding`);
pass `{ linear: false }` for a renderer without it. `KratorVehicles.setDetail(0.5)` halves the round parts' segments
for a crowded world. Full API: `API.md`.

## Adding a vehicle or a culture

A new culture is a new file `krator-vehicles-<culture>.js` (it drops into the bundle by filename); a new vehicle is
one more `VEHICLE({...})` in its culture's file. `API.md` "Adding a vehicle" gives the entry shape and the helpers.
Locus and Mungo take `bundle(['geomancer'])`: a new culture reaches a world only when its `build.py` asks for it.
Data first: everything a simulation reads goes in `tags`, `data` and `variantData`, not in `build`. A `build(F)` gets
the ruin states for free (the runtime's pass); it may read `F.ruin` (`F.ruin.glass`, `F.ruin.state`) to skip its
glass or draw charred furniture, but must not draw from `F.rnd` only in some states, or the intact and the ruined
builds of one seed stop being one vehicle.
