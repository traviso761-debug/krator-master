# kits/motor-vehicles: API

One global, `KratorVehicles`, from the bundle (`vehicle_bundle.bundle()`, or `dist/krator-vehicles.js`). It needs
only a global `THREE` (r128). Nothing else leaks (verify.py `bundle-alone` checks it in a blank page).

## The frame

Origin at the footprint centre on the ground. **+z is forward** (the front), y up, x across: +x is the driver's
left (the driver sits on the +x side). Wheels touch y = 0. Headings follow three.js yaw: a host that drives a
vehicle along heading `ry` sets `group.rotation.y = ry` and moves it by `(sin ry, 0, cos ry) * metres`; a positive
`steer()` turns toward +x, i.e. increases `ry`.

## Calls

```js
KratorVehicles.list()
  // -> [{ key, name, culture, tags, variants, variantNames, w, d, h, data }]   (data of variant 0; copies)
KratorVehicles.dataOf(key, variant)        // that variant's data (variantData merged over data)
KratorVehicles.build(key, { variant, seed, linear }) -> THREE.Group | null
  // variant 0..variants-1 (clamped), seed (default 1) varies small things (jerry cans, tarp colour, a pack),
  // linear (default true): vertex colours converted sRGB -> linear for a renderer with outputEncoding = sRGBEncoding.
KratorVehicles.roll(group, metres)         // spins every wheel by metres / r (+ = forward); call with the distance moved
KratorVehicles.steer(group, radians)       // turns the steered wheels; clamped to data.maxSteer; returns the angle used
KratorVehicles.lights(group, on)           // lamps on/off (the body:metal material's emissive); userData.lightsOn
KratorVehicles.dispose(group)              // frees its geometry and its own material (the shared ones stay)
KratorVehicles.has(key), .get(key), .cultures(), .palette(culture), .setDetail(k)
KratorVehicles.CLASSES, .TYPES, .DRIVES, .FUELS, .TERRAIN    // the tag vocabularies
```

## The group

| Child | What | Animate |
|---|---|---|
| `body:matte` | painted plate, seats, canvas, the spare's tyre: one mesh, vertex colours, a shared material | |
| `body:metal` | tube, brass, the engine, lamp lenses: one mesh, vertex colours, **its own material** (the lamps) | `lights()` |
| `steer_fl`, `steer_fr` | pivots at the front hubs (x, r, z), each holding `wheel_fl` / `wheel_fr` | `rotation.y` (`steer()`) |
| `wheel_fl` .. `wheel_rr` | one mesh per wheel, origin at its hub, axle along x | `rotation.x` (`roll()`) |

Six meshes: six draw calls. `castShadow` and `receiveShadow` are on.

`group.userData`:

```js
{ key, name, culture, tags, kind: 'vehicle', variant, variantName, seed, w, d, h, tris, lightsOn,
  wheels: [{ name, r, x, y, z, front, steer, drive }],     // y = r: the hub
  lamps:  [{ x, y, z, dx, dy, dz, kind }],                  // lens centres and facing; kind head | bar | tail | cell
  data }                                                    // dataOf(key, variant)
```

A host that wants real light at night puts a SpotLight at each `head`/`bar` lamp facing (dx, dy, dz), or one per
vehicle at their mean; the kit adds no light objects.

## The geo_dune_buggy

Key `geo_dune_buggy`, name `Geomancer dune buggy`, culture `geomancer`. Box 2.1 x 3.6 m (w x d), 3.05 m to the
aerial's tip (the cage top is 1.8 m: `data.cageH`). Built size 2.05 x 3.02 x 3.56. 5 618 / 5 670 / 5 974 triangles.

| # | Variant | Seats | Cargo | Look |
|---|---|---|---|---|
| 0 | Scout | 2 | 150 kg | earth brown, black cage, brass rims, rolled tarp, crate and rope behind the seats |
| 1 | Crew | 4 | 60 kg | oil black with a brass stripe, brown cage, a second seat row under a longer cage, tarp and packs |
| 2 | Drill rig | 2 | 320 kg | sand and brown, a folded auger mast on the rack (gear head on a rear A-frame, brass ram), a bed of drill pipe |

`tags`: `{ class:'motor vehicle', type:['vehicle','transport'], drive:'wheeled', seats:2, fuel:'refined oil',
terrain:['sand','salt flat','track'], setting:'outdoor', guild:'Geomancers' }`.

`data` (variant 0; units m, m/s, m/s^2, kg, L, km, rad): `speed 22, accel 2.8, turnRadius 5.2, maxSteer 0.45,
seats 2, cargo 150, mass 880, fuel 'refined oil', tank 55, range 260, drive 'rear', wheelbase 2.44, track 1.68,
clearance 0.3, cageH 1.8, engine 'Ancient-salvage flat-four, air-cooled'`, and `wheels`:
`wheel_fl (0.84, 1.22)`, `wheel_fr (-0.84, 1.22)` front and steered; `wheel_rl (0.84, -1.22)`, `wheel_rr
(-0.84, -1.22)` driven; all r 0.425, w 0.36. Variant 1: seats 4, cargo 60, mass 960, accel 2.5. Variant 2: cargo
320, mass 1120, speed 17, accel 2.0, rig.

## Adding a vehicle

A culture file `krator-vehicles-<culture>.js`: `VEHICLE_CULTURE(key, { name, sign, lore, palette })` once, then
`VEHICLE({ key, name, culture, tags, variants, variantNames, w, d, h, data: { ..., wheels: [...] }, variantData,
wheel(F, W), build(F) })`. `build` draws the body with the catalog frame (`F.box/cyl/cone/beam/rod/frustum`, `F.col`
over the culture's palette, `F.rnd/F.pick/F.chance` from the seed) plus the vehicle helpers (`vehicles-core.js`):
`F.disc`, `F.face`, `F.taper`, `F.ring`, `F.tube`, `F.tri`, `F.knob`, `F.lamp(x, y, z, dx, dy, dz, r, kind, housing,
bezel)` (records the lamp), `F.spareWheel(x, y, z, axisX, axisY, axisZ, W)`. `wheel` draws ONE wheel at the origin,
axle along x (`vehicleBalloonTyre()` for a sand tyre). Families `metal/brass/steel/rust/gold/bronze` and the lamp
families go to `body:metal`; everything else to `body:matte`. Keep it to six meshes and about 6 000 triangles.
