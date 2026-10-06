# Brief B: start the Motor Vehicles kit, with a Geomancer dune buggy

Read `settlements/mungo/briefs/00-common.md` first.

## Why
In Mungo the Geomancers (an oil-drilling guild with electricity and salvaged Ancient engines; brown uniforms and
canvas packs; their town is Locus, see `LORE.md` §6.9 and `settlements/locus/LOCUS-KIT-NOTES.md`) keep **dune buggies**
in a small parking lot by their chapterhouse, maintain them, and periodically one drives off the map and back. The
owner: "Near the chapterhouse is a small parking lot for dune buggies (make a new model and start a Motor Vehicles
kit)." So: a new kit, `kits/motor-vehicles/`, whose first vehicle is the buggy, built so ANY world can take it.

## The engine: reuse, do not invent
Build on the master catalog's engine-neutral core, the way furniture reaches other worlds:
- Read `kits/catalog/README.md` (top table, "Furniture in a kit build"), the header of
  `kits/catalog/krator-furniture-core.js` (the frame `makeFrame()`, `F.box/cyl/cone/dome/blob/ball/beam/rod/frustum`,
  `F.col`, registries, `buildAsset`, `measureInstance`) and `kits/catalog/furniture_bundle.py` (how the catalog wraps
  core + data + runtime in ONE closure exposing ONE global, escaping `<script` in the text).
- The kit's own files: `kits/motor-vehicles/vehicles-core.js` (a `VEHICLE({...})` registry on top of the catalog core,
  or `ASSET` with a vehicle family: your call, say why in the README), `kits/motor-vehicles/krator-vehicles-geomancer.js`
  (the buggy; one file per culture, as the catalog does), `kits/motor-vehicles/vehicle_bundle.py`
  (`bundle(cultures=None) -> str`: one closure exposing only `KratorVehicles`, needing only global `THREE` r128),
  `build.py` -> `dist/motor-vehicles.html` (the kit sheet: the catalog's page shell is the model: `kits/catalog/src/`
  and its `build.py`; standard sky, ground, orbit/WASD camera, hover inspector showing name/culture/tags, the polygon
  tool), and `verify.py` (`--assert` and `--out shots`; copy the catalog's verify and cut it down).
- Read the file the catalog's core reads for `THREE` and anything global it needs; the bundle must run inside another
  build's page (Mungo is a fork of Locus: one big `function BUILD(){...}` scope with its own `TAU`, `PAL`, `rnd` etc.),
  so nothing may leak but `KratorVehicles`.

## The buggy
- Key `geo_dune_buggy`, name `Geomancer dune buggy`, culture `geomancer`, tags: `class:'motor vehicle'`,
  `type:['vehicle','transport']`, `drive:'wheeled'`, `seats:2`, `fuel:'refined oil'`, `terrain:['sand','salt flat','track']`.
  Data, not code, for anything a simulation reads: top speed (m/s), seats, cargo, fuel, wheel layout.
- Look: a rugged desert buggy of the Geomancer guild, built from refinery-workshop parts: a welded tube roll cage
  (`F.rod`), a low tub chassis of salvaged plate, two seats, a big exposed engine at the rear (an Ancient-salvage block
  with exhaust stacks and a radiator), four oversized balloon sand tyres with chunky tread, long-travel suspension arms,
  a jerry can rack and a spare wheel, a roof rack with a rolled tarp, a whip aerial with a pennant, a pair of headlamps
  and a lamp bar (the Geomancers have electricity: headlamps get an emissive so a host can switch them at night),
  guild livery: earth brown, oil black, brass, with the Geomancers' sign if `core/sockets/38-symbols.js` has one (read
  `kits/catalog/krator-symbols.js`). 2-3 variants (paint scheme, a cargo bed vs a second seat row, a drill-rig mount).
  Real scale: about 3.6 m long, 2.1 m wide, 1.8 m to the cage top, wheels ~0.85 m diameter.
- Frame: origin at the footprint centre on the ground, **+z forward (the front)**, y up; the wheels touch y = 0.
- Moving parts: each wheel a separate named child (`wheel_fl`, `wheel_fr`, `wheel_rl`, `wheel_rr`) whose origin is its
  hub, so a host can spin it (rotation.x) and steer the front pair (a `steer_fl/fr` pivot above the hub, rotation.y).
  The rest merged per material into as few meshes as possible (target <= 6 draw calls, <= 6k triangles).

## The API the planner (Mungo) will call
```js
KratorVehicles.list()                              // -> [{key, name, culture, tags, variants, w, d, h, data:{speed, seats, ...}}]
KratorVehicles.build(key, {variant, seed}) -> THREE.Group
   // group.userData = {key, name, culture, tags, kind:'vehicle', wheels:[{name, r, x, z, front:bool}], lamps:[{x,y,z}], data}
KratorVehicles.roll(group, metres)               // spins the wheels for distance travelled
KratorVehicles.steer(group, radians)             // turns the front wheels
KratorVehicles.lights(group, on)                 // headlamps on/off (emissive)
```
Colours converted sRGB -> linear as the catalog's runtime does (check one known-colour part in a screenshot).

## Docs (in the kit folder)
`README.md` (what, how to build/verify, the API, how a world takes the bundle: Python `sys.path` + `bundle()` in its
`build.py`, as Locus does with `furniture_bundle`), `API.md`, `KNOWN_ISSUES.md` (build.py prints open `- [ ]` lines:
copy that tail from another build.py), `PORT.md` (tag each file `[G data]`/`[G builder]`/`[web]`: read
`GODOT-PLAN.md` §2 "The four tags" and copy the table shape of `kits/catalog/PORT.md`), `INDEX.md` (hand-written in
the generated style; do NOT run `tools/make_index.py`). Give the planner the root INDEX row and a gallery note in your
report.

## Files you own
Everything under `kits/motor-vehicles/` (new). Nothing else. (Copy `three.min.js` from `kits/catalog/` beside your
page if the verify needs it offline.)

## Done when
`python kits/motor-vehicles/build.py` writes the sheet; `verify.py --assert` passes (builds, no NaN, wheels on y=0,
fits declared size, tags present, the bundle loads alone in a blank page with only THREE and exposes only
`KratorVehicles`); you have LOOKED at a 3/4 front and a side shot of each variant and they read as a desert buggy at
human scale. Report per `00-common.md`.
