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
KratorVehicles.build(key, { variant, seed, linear, state }) -> THREE.Group | null
  // variant 0..variants-1 (clamped), seed (default 1) varies small things (jerry cans, tarp colour, a pack),
  // linear (default true): vertex colours converted sRGB -> linear for a renderer with outputEncoding = sRGBEncoding,
  // state (default 'intact'): 'weathered' | 'burnt' | 'wreck', the ruin states (below): the same vehicle, ruined.
KratorVehicles.STATES                      // ['intact', 'weathered', 'burnt', 'wreck']
KratorVehicles.WRECK_FORMS                 // ['crushed', 'overturned', 'torn', 'crashed', 'tboned', 'exploded', 'onside',
                                           //  'skidded', 'nosedived', 'broken', 'piled', 'gutted' (the last five, and overturned: the airframes')
KratorVehicles.ruinOf(state, seed, key)    // the ruin record a build(key, { state, seed }) takes (a copy; data, no drawing)
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
  wheels: [{ name, r, x, y, z, front, steer, drive, lift?, steerRatio?, tyre? }],   // y = r + lift: the hub (intact)
  lamps:  [{ x, y, z, dx, dy, dz, kind }],                  // lens centres and facing; kind head | bar | tail | cell
  data,                                                     // dataOf(key, variant)
  state, ruin }                                             // 'intact' and ruinOf('intact'), or the ruin (below)
```

A host that wants real light at night puts a SpotLight at each `head`/`bar` lamp facing (dx, dy, dz), or one per
vehicle at their mean; the kit adds no light objects.

## Ruin states

`build(key, { state })` builds the same vehicle (its seed and variant decide the body as they always did) and runs the
kit's ruin pass over it before the meshes are made, so a ruin costs the same draw calls and fewer triangles. The pass
is general: every culture's vehicles take it. What each state does:

| State | Rust | Soot | Glass | Tyres | Body | Lamps |
|---|---|---|---|---|---|---|
| `intact` | | | kept | | as designed | work |
| `weathered` | blooms over 30-60 % of the paint, grime over the rest | | gone | flat (the hub drops) | a little trim sprung, a small roll | dead |
| `burnt` | 35-60 % under the char | charred black nearly all over, on the `char` detail (blistered, cracked; `metal.scorched` when it lands) | gone | burnt off the rims | the roof and upper panels caved, trim sprung | dead |
| `wreck` | 80-100 % | by seed (an exploded one is charred) | gone | flat or gone, **one wheel missing** | one of seven forms by seed (`KratorVehicles.WRECK_FORMS`): `crushed` (pressed down and sheared), `overturned` (on its roof, askew), `torn` (cut across, the halves parted and yawed), `crashed` (the nose or tail crumpled to half its length, buckled, pitched onto it), `tboned` (one flank caved in round the blow, the roof lifted over it), `exploded` (holes blown through the upper body, the rest bulged, nearly every trim piece flung, burnt out), `onside` (lying on one flank). An airframe (`data.airframe`) draws from `VEHICLE_AIR_FORMS` instead and lies on the ground, its gear gone (`ruin.gearGone`, no wheels built): `skidded` (the nose crumpled, flat on its belly at the end of the furrow it ploughed, a trail of wreckage behind it: the build's `ancFurrow`, a vehicle's length back from the tail), `nosedived` (pitched into the ground about its nose, what is under the ground cut away, the tail in the air), `broken` (torn in two, holed, both halves belly down, a heap at the break), `piled` (the nose crumpled to a quarter into a heap of torn panels and earth), `overturned` (on its roof, the helicopter's rotor sheared off, the gear up), `gutted` (burnt to a heap: the helicopter's build draws the collapsed remains with the rotor head and a bent blade standing out of them; the jet is holed and charred over a heap); trim sprung and some fallen | dead |

A collision is two wrecks placed by the host: a `crashed` one nose-on to a `tboned` one's flank (`ruin.end` says which end
crumpled, `ruin.side` which flank caved and `ruin.cut` where along it), the pair yawed a quarter turn to each other.

The ruin is a record first (`vehicles-core.js` `vehicleRuin(state, seed, key)`; `KratorVehicles.ruinOf`), a copy of
which is `group.userData.ruin`:

```js
{ state, rust, soot, grime,          // 0..1 shares
  glass,                             // false: the panes were left out
  tyres: 'ok' | 'flat' | 'gone',
  sag, sprung,                       // 0..1: how far the body caved, the share of small trim knocked askew
  lamps,                             // false: lights() leaves them dark and returns false
  tilt,                              // the roll about z, radians
  form: null | 'crushed' | 'overturned' | 'torn' | 'crashed' | 'tboned' | 'exploded' | 'onside'
        | 'skidded' | 'nosedived' | 'broken' | 'piled' | 'gutted',
  missing, missingWheel, gearGone,   // a wreck's missing wheel: its index draw, and the wheel's name (null if none);
                                     // gearGone (airframes): every wheel left out, missingWheel 'all'
  cut, side, end, seed }             // torn: where it tore, tboned: where the blow landed (fractions of the length);
                                     // side +-1 (tboned, onside), end +-1 (crashed: nose or tail); the record's seed
```

Its draws come from a generator of their own on (seed, state, key), never from the body's `F.rnd`, so the intact and
the ruined builds of one seed are one vehicle, and two vehicles of one seed do not share one fate. The group keeps
its shape: `body:matte`, `body:metal`, `steer_*`, `wheel_*` (the missing one absent from the children and from
`userData.wheels`; a flat or burnt wheel's record says `tyre: 'flat' | 'gone'` and its `y` is where the hub settled),
`belts`; every mesh carries its detail slot and the atlas hook; the body materials are double-sided (the insides show
through the empty windows). **A ruin is a prop:** it is grounded (its lowest point on y = 0 after the settle), its
lamps are dead, `roll()` still spins what wheels there are but after a tilt or an overturn the spin axis is no longer
the axle, `steer()` turns the pivots the same way, and a tracked vehicle's belts no longer run. Place it, turn it,
leave it. The bounding box grows with the settle: up to 0.6 m + 0.13 h across, 0.8 m along, 0.3 m + 0.25 w up (an
overturned body lies on its roof, askew), which `verify.py`'s `ruin` check holds every vehicle to.

Which surfaces rust: the paint and plate families (`paint`, `paintWorn`, `paintFlake`, `whitePaint`,
`ancientWhite`, `plate`, `foil`, `metal`, `corrugated`, `bluePlate`) take the `rustHeavy` slot (or `rust`) and the
rust's colour where a value noise on the body's own position falls under the state's share (soft edges); the copper
alloys (`brass`, `gilt`, `bronze`) go `verdigris`; canvas, tarp, wood, rubber, solar and concrete only take grime and
soot; lenses and the cyan strips go dark. The ruin families ride in every bundle (`vehicle_bundle.py` `RUIN_SLOTS`).

A culture's `build(F)` may read `F.ruin` and `F.state` to draw its own damage on top (the Ancients leave their glass
out and draw charred seat frames when burnt or wrecked) as long as it draws from `F.rnd` the same way in every state.

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

## The Ancients' ten (`krator-vehicles-ancient.js`, culture `ancient`)

The metropolis kit's house style on the road (`kits/metropolis/PLAN.md` 2): white seamed panel (`white`,
`whiteDark`, `whiteShade` on `ancientWhite`), a bronze belt band and posts (`bronze`, `bronzeDark` on `bronze`), a
blue-glass canopy (`blueGlass`, left out of every ruin), cyan strips (`cyan`, the `lampBlue` family: they glow with
`lights()`), board-formed composite (`concrete`), shrouded slick wheels (`ancWheel`: a white dish, a bronze hub). All
`fuel: 'battery'` (Ancient cells, hub motors), all `terrain: ['road']` but the utility and the tram. Every `build`
reads `F.ruin`: no glass when `F.ruin.glass` is false, charred seat frames when burnt or wrecked, nothing from `F.rnd`.
The shared pieces (`ancSkin`, `ancBand`, `ancPosts`, `ancGlass`, `ancStrip`, `ancSeat`, `ancDash`, `ancWheel`,
`ancPod`) are the file's own.

| Key | Box (w x d x h) | Seats | Wheels | Variants | Triangles (intact; weathered / burnt / wreck) |
|---|---|---|---|---|---|
| `anc_pod` | 2.3 x 3.3 x 1.68 | 2 | 4, r 0.32, x +-0.64 (front, steer 0.38) and +-0.68, z +-0.95 | Civic, Hire (bronze roof, cyan sign; `trade: 'hire'`) | 3 744 / 3 756; 3 624 / 2 536 / 2 158 |
| `anc_saloon` | 2.6 x 6.0 x 1.56 | 4 | 4, r 0.36, x +-0.7, z +-1.95 (front steer 0.32) | Saloon, Statesman (bronze roof, dishes and bonnet spine) | 3 816 / 3 828; 3 696 / 2 640 / 3 055 |
| `anc_police` | 2.6 x 6.1 x 1.72 | 4 | the saloon's | Patrol (white, a lamp bar of three blue cells and two amber lamps, a bull bar, a belt stripe, a searchlight), Pursuit (darker, bronze roof; `speed` 50) | 4 240 / 4 252; 4 120 / 3 064 / 2 758 |
| `anc_van` | 2.7 x 6.0 x 2.8 | 2 | 4, r 0.42, x +-0.72, z +-1.75 (front steer 0.35) | Van (crates; `cargo` 1600), Courier (a roof pod) | 4 440 / 4 496; 4 320 / 3 232 / 3 754 |
| `anc_utility` | 2.8 x 6.2 x 2.6 | 3 | 6, r 0.48, x +-0.8, z 1.95 (steer 0.3), -0.3, -1.9 | Works (two tanks, a locker), Patrol (an amber lamp bar, a dish) | 5 608 / 5 802; 5 536 / 3 904 / 3 676 |
| `anc_hauler` | 2.75 x 9.2 x 2.8, `budget.tris` 7 500 | 2 | 6: front r 0.5, x +-0.95, z 3.3 (steer 0.38); rear r 0.55, x +-1.05, z -1.5 and -2.8 | Flatbed; Pods (four cargo pods, a crate; `cargo` 2400); Crates (two tiers of lashed crates, four drums; `cargo` 3000); Container (one sealed container with bronze corner posts; `cargo` 1200) | 5 128 / 6 292 / 5 868 / 5 376; 5 056 / 3 408 / 2 776 |
| `anc_tram` | 3.1 x 13.4 x 3.5, `budget.tris` 9 000 | 40 (+30 standing) | 8, r 0.5, x +-1.0, z +-5.6 and +-4.0, none steers, `maxSteer` 0 (guided) | Tram-car | 7 428; 7 484 / 5 564 / 5 138 |
| `anc_tank` | 3.6 x 11.6 x 2.7, `budget.tris` 9 000 | 3 | tracked: 10 road wheels (r 0.34, `lift` 0.08) on two belts, a sprocket and an idler each side; `maxSteer` 0 (skid) | Line, Command (a dish, a second aerial) | 4 304 / 4 360; 4 304 / 3 664 / 4 066 |
| `anc_heli` | 10.6 x 14.2 x 4.2, `budget.tris` 7 500 | 6 | 3 (landing gear): a nose wheel r 0.3, two mains r 0.36; none steers | Transport, Patrol (a searchlight, blue cells) | 3 792 / 4 000; 3 720 / 2 976 / 2 250 |
| `anc_jet` | 26 x 32 x 7.6, `budget.tris` 7 500 | 120 | 3 (landing gear): a nose wheel r 0.45, two mains r 0.55; none steers | Liner | 3 934; 3 874 / 3 034 / 2 744 |

**The tank** is the kit's second tracked vehicle (after the hab): a low hull between the belts, sponsons over them
under skirts, a turret on a bronze ring with the energy lance (its emitter a cyan cell) and a hatch; `data.belt` 0.08.
In a wreck the turret is knocked round and the lance droops; exploded, the turret is gone and the open well shows.
**The aircraft** stand on their gear (the wheels are real wheels for the kit's checks; `data.airframe: true`, `rotor`
or `span`): the helicopter a glazed nose, a cabin, a tail boom with a fin and tail rotor, a four-blade rotor on a
mast; the jet a tube with a nose cone, an upswept tail, swept wings with a ducted fan under each (a cyan glow at
the back), a T-tail, a cockpit visor band and cabin window bands. In a ruin the rotor droops (one blade gone in a
wreck) and the boom kinks; a wrecked jet has one wing torn off, lying beside it when the body is upright, the stub
dark. Their wrecks lie on the ground (`VEHICLE_AIR_FORMS`, above): skidded at the end of a furrow (a dark trough,
berms of thrown earth) with wheels, a fan or a blade, panels and seats strewn along it, 30 m behind the jet, 12 m
behind the helicopter; nosedived with the nose in the ground and the tail up; broken in two; piled into a heap at the
nose; overturned; gutted to a charred heap. The furrows and heaps are geometry, not the host's terrain. Neither steers
(`maxSteer` 0): a host places them, nose down a street, on a roof, across a square.

**The cabins are hollow.** A hull tub is open at the belt; an inward-facing liner (`F.tub`'s `inside`, the
`interior` key) gives the cabin its walls, a low floor sits between shelves over the wheels (the pod and the saloon:
you sit at knee height, as in a car), and the seats, dash and yoke stand on it under the canopy. A cab pod on a deck
(the van, the utility, the hauler) is the same without the shelves; the tram's liner is two bands, below and above
its window ribbon, so the car is open through its windows. **The wheels hang from running gear** (`ancGear`): an axle
beam between each pair (ending 6 cm short of the wheels' inner faces, clear of a steered wheel's swing), a knuckle and
an upright from each wheel to the shelf, pan or chassis above it, and a trailing link (a single nose wheel gets a
fork); a flared wheel well on the skin round every shrouded wheel (`ancFlare`: a short shell straddling the skin with a
bronze arch on its lip), and a mudguard shell with arch trim over the exposed wheels of the cab-over pods and the
aircraft (`ancFender`). The glazing is a canopy on bronze posts, never a flat pane (the van's cab is a pod before its
box). The sheet lays every vehicle in at least three slots (seeds 1, 2, 3), so a ruin state shows three fates of it.
When the glass is gone (every ruin state), the frames stay and `ancGlass` / `ancPaneShards` leave shards of dark glass
(`shard`, a key the ruin pass neither rusts nor drops) standing in them.

`tags`: all `class: 'motor vehicle'`, `drive: 'wheeled'`, `fuel: 'battery'`, `setting: 'outdoor'`; `type`
`['vehicle', 'transport']` (pod, saloon, tram), `['vehicle', 'cargo', 'transport']` (van, hauler), `['vehicle',
'utility', 'patrol']` (utility). `data` (variant 0; m, m/s, m/s^2, kg, kWh, km, rad): pod `speed 25, accel 3.0,
turnRadius 4.2, maxSteer 0.38, cargo 80, mass 760, battery 40, range 300, wheelbase 1.9, track 1.32`; saloon `38, 3.5,
7.5, 0.32, 220, 1650, 110, 600, 3.9, 1.4`; van `28, 2.0, 7.2, 0.35, 1600, 2600, 160, 450, 3.5, 1.44`; utility `24, 1.8,
8.5, 0.3, 1800, 4200, 260, 500, 3.85, 1.6`; hauler `22, 1.2, 9.5, 0.38, 9000, 9800, 420, 420, 5.45, 2.1`; tram `20,
1.0, 0, 0, 0, 18000, 600, 0 (the guideway feeds it), 9.6, 2.0, standing 30`. `tank` is 0 on all six.

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
- `F.tub(sections, segs, color, family, caps, inside)`: horizontal superellipse sections `[{ y, a, b, n, z }]` bottom
  to top (half-width a, half-length b, exponent n: 2 an ellipse, 3 to 4 a rounded rectangle), smooth sides, flat caps
  `'top' | 'bottom' | 'both'` (the crawler's bowl, rim and deck); `inside` turns the faces inward (a cabin's liner
  inside a single-sided hull, so the interior has walls: the Ancients' cabins).
- `F.track(x, w, t, circles, pitch, color, family)`: a belt of shoes round the convex hull of `circles` `[[z, y, r]]`;
  with the road wheels' hubs at r + t (`lift: t` in their records) its bottom run sits on y = 0. It is recorded
  (`F.belts`) and drawn by the runtime as the `belts` mesh, which `roll()` runs.

**Textures:** a culture's `detail` table maps palette keys to `materials.json` families (`canvas: 'canvas'`,
`glass: null` for none); a primitive can name a family as its family (`F.box(..., col, 'tarp')`) when one colour
covers two surfaces. Unmapped keys take `metal` on the metal families and `paint` otherwise; lamps never take one.
A new family: add it to `materials.json` (append to `slots`; the atlas takes 32), pack, rebuild.

**Ruin states come free.** The runtime's pass finds the glass by palette key (any key matching /glass/i, or the
catalog family `glass`) and the tyres by family `rubber` (or a key `rubber`, `tyre`, `tire`): name them so. Read
`F.ruin` in `build` only to leave things out or swap a piece for its charred twin; never draw from `F.rnd` in one
state and not another.

`wheel` draws ONE wheel at the origin, axle along x (`vehicleBalloonTyre()` for a sand tyre; the crawler's wire wheel
and the hab's road wheel are in their culture files). A wheel record may add `lift` (the hub at r + lift: a road
wheel on a belt) and, if it steers, `steerRatio` (default 1; negative for a rear axle that steers against the front).
Families `metal/brass/steel/rust/gold/bronze` and the lamp families go to `body:metal`; everything else to
`body:matte`. Keep it to about 6 000 triangles; a big vehicle (one to a world, not a fleet) may declare
`budget: { tris }` up to 20 000.
