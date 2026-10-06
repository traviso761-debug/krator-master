# kits/motor-vehicles: API

One global, `KratorVehicles`, from the bundle (`vehicle_bundle.bundle()`, or `dist/krator-vehicles.js`). It needs
only a global `THREE` (r128). Nothing else leaks (verify.py `bundle-alone` checks it in a blank page).

## The frame

Origin at the footprint centre on the ground. **+z is forward** (the front), y up, x across: +x is the driver's
left (the driver sits on the +x side). Wheels touch y = 0 (a tracked vehicle's belt does; its road wheels ride
the belt, `lift` above). Headings follow three.js yaw: a host that drives a
vehicle along heading `ry` sets `group.rotation.y = ry` and moves it by `(sin ry, 0, cos ry) * metres`; a positive
`steer()` turns toward +x, i.e. increases `ry`.

## Calls

```js
KratorVehicles.list()
  // -> [{ key, name, culture, tags, variants, variantNames, w, d, h, data, budget }]   (data of variant 0; copies)
  //    budget: { meshes, tris } verify.py holds the vehicle to (two body meshes + one per wheel; 6 000 or its own)
KratorVehicles.dataOf(key, variant)        // that variant's data (variantData merged over data)
KratorVehicles.build(key, { variant, seed, linear }) -> THREE.Group | null
  // variant 0..variants-1 (clamped), seed (default 1) varies small things (jerry cans, tarp colour, a pack),
  // linear (default true): vertex colours converted sRGB -> linear for a renderer with outputEncoding = sRGBEncoding.
KratorVehicles.roll(group, metres)         // spins every wheel by metres / r (+ = forward); call with the distance moved
KratorVehicles.steer(group, radians)       // turns the steered wheels; clamped to data.maxSteer; returns the angle used
                                           // (each steered wheel turns by angle x its steerRatio; maxSteer 0: skid steer, nothing turns)
KratorVehicles.lights(group, on)           // lamps on/off (the body:metal material's emissive); userData.lightsOn
KratorVehicles.dispose(group)              // frees its geometry and its own material (the shared ones stay)
KratorVehicles.setTextures(on)             // the library detail maps for vehicles built after the call (default: on when
                                           // the bundle carries them); build(key, { textures:false }) for one vehicle
KratorVehicles.textures()                  // { on, pending (maps still decoding), slots: [{ slot, family, lib, tile }] }
KratorVehicles.has(key), .get(key), .cultures(), .palette(culture), .setDetail(k)
KratorVehicles.CLASSES, .TYPES, .DRIVES, .FUELS, .TERRAIN    // the tag vocabularies
```

## The group

| Child | What | Animate |
|---|---|---|
| `body:matte` | painted plate, seats, canvas, the spare's tyre: one mesh, vertex colours, a shared material | |
| `body:metal` | tube, brass, the engine, lamp lenses: one mesh, vertex colours, **its own material** (the lamps) | `lights()` |
| `steer_<w>` | a pivot at each steered wheel's hub (x, r + lift, z), holding `wheel_<w>` (`steer_fl` holds `wheel_fl`) | `rotation.y` (`steer()`) |
| `wheel_<w>` | one mesh per wheel, origin at its hub, axle along x | `rotation.x` (`roll()`) |
| `belts` | a tracked vehicle's belts, every loop in one mesh (body:metal's material) | its vertices, by `roll()` |

Two body meshes plus one per wheel: six draw calls for a four-wheeler, eight for the six-wheeler, ten for the
eight-wheeled crawler, fifteen for the tracked hab (its twelve road wheels and the belts). `castShadow` and
`receiveShadow` are on. Every mesh carries `aDetS`, the detail slot of each vertex (-1 none); with textures on, every
material samples the kit atlas by it (`vehicles-detail.js`), so the textures add no draw call.
Wheel names: `wheel_fl/fr/rl/rr` on a four-wheeler; more axles add `wheel_l2/r2`, `wheel_l3/r3`; the hab's are
`wheel_<bogie><n>` (`lf1..3`, `rf1..3`, `lr1..3`, `rr1..3`). A host should read `userData.wheels`, not assume names.

`group.userData`:

```js
{ key, name, culture, tags, kind: 'vehicle', variant, variantName, seed, w, d, h, tris, lightsOn, textured,
  wheels: [{ name, r, x, y, z, front, steer, drive, lift?, steerRatio? }],   // y = r + lift: the hub
  lamps:  [{ x, y, z, dx, dy, dz, kind }],                  // lens centres and facing; kind head | bar | tail | cell
  data }                                                    // dataOf(key, variant)
```

A host that wants real light at night puts a SpotLight at each `head`/`bar` lamp facing (dx, dy, dz), or one per
vehicle at their mean; the kit adds no light objects.

## The geo_dune_buggy

Key `geo_dune_buggy`, name `Geomancer dune buggy`, culture `geomancer`. Box 2.1 x 3.6 m (w x d), 3.05 m to the
aerial's tip (the cage top is 1.8 m: `data.cageH`). Built size 2.05 x 3.02 x 3.56. 5 626 / 5 678 / 5 982 triangles.

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

## The rep_crawler

Key `rep_crawler`, name `Republic salvage crawler`, culture `republic` (the Iron Republic; its palette: hullCream,
hullOchre, red ...). Box 6.0 x 11.4 m, 9.2 m to the spire's lamp (the lid's raised edge 8.4). Built size 5.97 x 11.32
x 9.07 (Hauler 10.75 long). 13 676 / 14 056 triangles, ten meshes; `budget.tris` 15 500.

| # | Variant | Cargo | Look |
|---|---|---|---|
| 0 | Survey | 4 000 kg | cream bowl, the solar lid open 25 degrees on an A-frame and two rams |
| 1 | Hauler | 9 000 kg | ochre bowl, the lid shut, crates, drums and a lashed canvas roped on it |

`tags`: `{ class:'motor vehicle', type:['vehicle','transport','survey'], drive:'wheeled', seats:6, fuel:'battery',
terrain:['sand','salt flat','rock'], setting:'outdoor', guild:'Salvagers' }`. `data`: `speed 4.5, accel 0.3,
turnRadius 12, maxSteer 0.3, seats 6, cargo 4000, mass 38000, tank 0, battery 900 (kWh), solar, range 400, wheelbase
7.8, track 5.0, clearance 1.0`. Wheels r 1.2, w 0.66, x +-2.5, axles z 3.9, 1.3, -1.3, -3.9: `wheel_fl/fr` steer
(ratio 1), `wheel_rl/rr` steer the other way (steerRatio -1), `wheel_l2/r2`, `wheel_l3/r3` do not; all driven.

## The iz_six_wheeler

Key `iz_six_wheeler`, name `Izani armoured six-wheeler`, culture `iziz` (vehicle keys only: ochreOrange, creamPaint,
tealGlass ...). Box 2.8 x 6.7 m, 3.6 m to the rockets' tips (the cab roof 2.6). Built size 2.75 x 6.63 x 3.54 (Courier
3.33 high). 5 454 / 5 456 triangles, eight meshes.

| # | Variant | Seats | Look |
|---|---|---|---|
| 0 | Lancer | 4 | orange, a four-tube rocket rack on a turntable, reload crates in the bay |
| 1 | Courier | 6 | cream with an orange stripe, a striped awning over the bay, the palace orb on a mast, crates |

`tags`: `{ class:'motor vehicle', type:['vehicle','patrol','transport'], drive:'wheeled', seats:4, fuel:'refined oil',
terrain:['road','track','sand','rock'], setting:'outdoor', guild:'Forgemasters' }`. `data`: `speed 20, accel 1.6,
turnRadius 7.5, maxSteer 0.5, cargo 600, mass 11200, tank 300, range 600, wheelbase 4.3, track 2.24, clearance 0.5,
armament 'four-tube rocket rack'` (Courier: seats 6, cargo 1400, armament 'none'). Wheels r 0.62, w 0.46, x +-1.12,
axles z 2.1 (steered), -0.85, -2.2; all driven.

## The ab_caravan_truck

Key `ab_caravan_truck`, name `Abyssal caravan truck`, culture `eastabyss`. Box 3.2 x 7.5 m, 4.9 m to the tin-mirror
shades (the cab roof 3.05). Built size 3.06 x 7.28 x 4.88. 6 544 / 6 928 triangles, six meshes; `budget.tris` 7 200.

| # | Variant | Look |
|---|---|---|
| 0 | Caravan | sand paint, tarps in teal, mint, pink, peach and yellow bands, an orange canopy with a red drape, a yellow parasol |
| 1 | Headman's | teal paint, lacquer-red and gold tarps, a lacquer canopy with gilded horns, tin-mirror cladding on the cab, gold rims |

`tags`: `{ class:'motor vehicle', type:['vehicle','transport','cargo'], drive:'wheeled', seats:3, fuel:'crude oil',
terrain:['sand','salt flat','mud','track'], setting:'outdoor' }`. `data`: `speed 14, accel 1.0, turnRadius 8, maxSteer
0.5, seats 3, berths 4, cargo 2500, mass 7800, tank 240, range 500, wheelbase 4.2, track 2.44, clearance 0.55, lamps
'oil lanterns'`. Wheels r 0.78, w 0.62, x +-1.22, z 2.15 (steered) and -2.05; all driven.

## The pa_crawler_hab

Key `pa_crawler_hab`, name `Post-Apoc crawler hab`, culture `post-apoc`. Box 4.6 x 11.6 m, 8.5 m to the tallest aerial
(the container roofs 5.7 and 5.9). Built size 4.51 x 11.57 x 8.42. 13 868 / 13 940 triangles, fifteen meshes;
`budget.tris` 15 500.

| # | Variant | Look |
|---|---|---|
| 0 | Hab | khaki cab, rust hab with patch plates, rust-brown and rust containers, spare drums on the roof |
| 1 | Trader | faded-teal cab and hab, teal and mustard containers, a mustard and red awning over the balcony, crates on the cab deck |

`tags`: `{ class:'motor vehicle', type:['vehicle','transport','cargo'], drive:'tracked', seats:4, fuel:'crude oil',
terrain:['sand','salt flat','mud','rock','snow'], setting:'outdoor' }`. `data`: `speed 6, accel 0.4, turnRadius 0,
maxSteer 0, steering 'skid', seats 4, berths 8, cargo 6000, mass 34000, tank 1800, range 900, wheelbase 6.3 (bogie
centres), track 3.4, clearance 0.55, belt 0.08`. Four bogies at x +-1.7, z 3.2 and -3.1, three road wheels each
(r 0.36, offsets -0.8, 0, 0.8, `lift` 0.08); none steers. A host turns it on the spot by yaw alone and calls
`roll()` with the distance its centre moved: the road wheels turn and the belts run (the sprockets do not).

## Adding a vehicle

A culture file `krator-vehicles-<culture>.js`: `VEHICLE_CULTURE(key, { name, sign, lore, detail, palette })` once, then
`VEHICLE({ key, name, culture, tags, variants, variantNames, w, d, h, data: { ..., wheels: [...] }, variantData,
wheel(F, W), build(F) })`. `build` draws the body with the catalog frame (`F.box/cyl/cone/beam/rod/frustum`, `F.col`
over the culture's palette, `F.rnd/F.pick/F.chance` from the seed) plus the vehicle helpers (`vehicles-core.js`):
`F.disc`, `F.face`, `F.taper`, `F.ring`, `F.tube`, `F.tri`, `F.knob`, `F.lamp(x, y, z, dx, dy, dz, r, kind, housing,
bezel)` (records the lamp), `F.spareWheel(x, y, z, axisX, axisY, axisZ, W)`, and for bigger bodies:

- `F.slab(pts, color, family)`: a solid from a side profile, `pts` `[[z, y, hx], ...]` (any winding, may be concave),
  each vertex extruded to x = +hx and -hx; give a band's bottom and top vertices one hx each and its flanks are planar
  (the six-wheeler's hull, the cabs, the hab's wedge nose).
- `F.tub(sections, segs, color, family, caps)`: horizontal superellipse sections `[{ y, a, b, n, z }]` bottom to top
  (half-width a, half-length b, exponent n: 2 an ellipse, 3 to 4 a rounded rectangle), smooth sides, flat caps
  `'top' | 'bottom' | 'both'` (the crawler's bowl, rim and deck).
- `F.track(x, w, t, circles, pitch, color, family)`: a belt of shoes round the convex hull of `circles` `[[z, y, r]]`;
  with the road wheels' hubs at r + t (`lift: t` in their records) its bottom run sits on y = 0. It is recorded
  (`F.belts`) and drawn by the runtime as the `belts` mesh, which `roll()` runs.

**Textures:** a culture's `detail` table maps palette keys to `materials.json` families (`canvas: 'canvas'`,
`glass: null` for none); a primitive can name a family as its family (`F.box(..., col, 'tarp')`) when one colour
covers two surfaces. Unmapped keys take `metal` on the metal families and `paint` otherwise; lamps never take one.
A new family: add it to `materials.json` (append to `slots`), pack, rebuild.

`wheel` draws ONE wheel at the origin, axle along x (`vehicleBalloonTyre()` for a sand tyre; the crawler's wire wheel
and the hab's road wheel are in their culture files). A wheel record may add `lift` (the hub at r + lift: a road
wheel on a belt) and, if it steers, `steerRatio` (default 1; negative for a rear axle that steers against the front).
Families `metal/brass/steel/rust/gold/bronze` and the lamp families go to `body:metal`; everything else to
`body:matte`. Keep it to about 6 000 triangles; a big vehicle (one to a world, not a fleet) may declare
`budget: { tris }` up to 20 000.
