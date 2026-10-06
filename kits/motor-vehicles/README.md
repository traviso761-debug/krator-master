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
family named on the primitive (`'corrugated'`, `'tarp'`); glass, lenses, hoses and ropes take none. Tyres wait on a
rubber set (`KNOWN_ISSUES.md`). `?mat=proc` on the sheet shows the old vertex-colour look.

| Key | Name | Culture | Wheels | Variants |
|---|---|---|---|---|
| `geo_dune_buggy` | Geomancer dune buggy | `geomancer` | 4 | Scout (2 seats, tarp), Crew (4 seats, longer cage), Drill rig (auger mast, drill pipe) |
| `rep_crawler` | Republic salvage crawler | `republic` | 8 wire-mesh, front and rear axles steer | Survey (cream, solar lid open), Hauler (ochre, lid shut under crates and drums) |
| `iz_six_wheeler` | Izani armoured six-wheeler | `iziz` | 6, front axle steers | Lancer (orange, four-tube rocket rack), Courier (cream, striped awning, the palace orb) |
| `ab_caravan_truck` | Abyssal caravan truck | `eastabyss` | 4 big sand tyres | Caravan (sand, pastel tarps), Headman's (teal, lacquer and gold, tin-mirror cladding) |
| `pa_crawler_hab` | Post-Apoc crawler hab | `post-apoc` | tracked: 12 road wheels on four bogies, skid steer | Hab (rust and olive), Trader (faded teal, mustard, awning, crates) |

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
| `vehicles-core.js` | the `VEHICLE({...})` registry, its vocabularies, `VEHICLE_CULTURE()` (palette into the core's FPAL), the vehicle frame (catalog `makeFrame()` plus disc, face, taper, ring, tube, tri, knob, lamp, spareWheel) and `vehicleBalloonTyre()` |
| `krator-vehicles-<culture>.js` | one file per culture (as the catalog does): its palette and its vehicles. Now: `eastabyss`, `geomancer`, `iziz`, `post-apoc`, `republic` |
| `vehicles-detail.js` | the detail maps: the slot each vertex takes, the kit atlas (colour, normal, roughness) composed from the packed maps, the triplanar shader hook |
| `materials.json`, `tex/` | the families and their library sets (Girder's adapter shape); `tex/` is what `tools/textures/pack.py kits/motor-vehicles` wrote from them (commit it). `vehicle_bundle.py` inlines the families the bundled cultures name |
| `krator-vehicles-runtime.js` | the API (`KratorVehicles`): assembly, the per-material merge (with the detail slot per vertex), wheels, belts, roll, steer, lights, textures |
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
python3 build.py --vendor-check                             # 80-sky-hash.js, 81-sky.js against their upstreams
python3 ../../tools/textures/pack.py kits/motor-vehicles     # after materials.json changes (numpy, Pillow; the sets via git lfs pull)
```

`--assert` checks: builds, no NaN, wheels on y = 0 (a road wheel on its belt), fits the declared box, at most two
meshes plus one per wheel and 6 000 triangles (or the entry's own `budget.tris`, never over 20 000),
moving parts (wheel origins at their hubs, steer pivots, roll/steer/lights do what they say, a tracked vehicle's belts
run and stay on the ground), tags and data from the vocabularies, the paint's LINEAR value in the vertex colours,
textures (a detail slot per vertex, the atlas hook on every material), clearance (no steered wheel inside the body at
full lock either way), determinism, and `bundle-alone` (a blank page with only
three.min.js: the bundle adds exactly one global, `KratorVehicles`, and builds every vehicle). verify.py serves
`three.min.js` from this folder: copy `kits/catalog/three.min.js` here first in a fresh checkout (without it the
page never loads and the run waits out its timeout).

The sheet: one row per vehicle, every variant, a 1.75 m figure for scale. Drive (R) rolls and steers; Lights (L);
Night (N); the hover inspector (T) shows name, culture, tags and data; the polygon tool (P). The page engine is
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
Data first: everything a simulation reads goes in `tags`, `data` and `variantData`, not in `build`.
