# kits/motor-vehicles: the Motor Vehicles kit

Procedural motor vehicles that any Krator world can take as ONE bundle, the way the catalog's furniture reaches
other worlds. Each vehicle is tagged by culture, carries the data a simulation reads (top speed, seats, cargo, fuel,
wheel layout), and is built as six meshes: two merged body meshes and four wheels a host can spin and steer, with
lamps it can switch at night.

| Key | Name | Culture | Variants |
|---|---|---|---|
| `geo_dune_buggy` | Geomancer dune buggy | `geomancer` | Scout (2 seats, tarp), Crew (4 seats, longer cage), Drill rig (auger mast, drill pipe) |

The buggy: a welded tube roll cage, a low tub of salvaged plate, two bucket seats, a big exposed Ancient-salvage
flat-four at the rear with twin exhaust stacks and an upright radiator, four 0.85 m balloon sand tyres with chunky
chevron lugs, long-travel arms and coilovers, a jerry can rack on each step, the spare on the hood, a roof rack with a
rolled tarp, a whip aerial with a pennant, two headlamps and a four-lamp bar (emissive: `lights()`), tail lamps, and a
blue window on the Ancient cell. Livery: earth brown, oil black, brass; the Geomancers' sign (a brass flame on a brown
disc with a brass rim, as on the Locus fuel-station pole) on both flanks and the nose. Lore: `LORE.md` 6.9,
`settlements/locus/LOCUS-KIT-NOTES.md`.

## Files

| File | What |
|---|---|
| `vehicles-core.js` | the `VEHICLE({...})` registry, its vocabularies, `VEHICLE_CULTURE()` (palette into the core's FPAL), the vehicle frame (catalog `makeFrame()` plus disc, face, taper, ring, tube, tri, knob, lamp, spareWheel) and `vehicleBalloonTyre()` |
| `krator-vehicles-<culture>.js` | one file per culture (as the catalog does): its palette and its vehicles. Now: `geomancer` |
| `krator-vehicles-runtime.js` | the API (`KratorVehicles`): assembly, the per-material merge, wheels, roll, steer, lights |
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
```

`--assert` checks: builds, no NaN, wheels on y = 0, fits the declared box, at most 6 meshes and 6 000 triangles,
moving parts (wheel origins at their hubs, steer pivots, roll/steer/lights do what they say), tags and data from the
vocabularies, the paint's LINEAR value in the vertex colours, determinism, and `bundle-alone` (a blank page with only
three.min.js: the bundle adds exactly one global, `KratorVehicles`, and builds every vehicle).

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
    return {'65y-vehicles-bundle.js': vehicle_bundle.bundle(['geomancer'])}   # or None: every culture
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
Data first: everything a simulation reads goes in `tags`, `data` and `variantData`, not in `build`.
