# Verge: the contract each fragment keeps

Compass: x east, z south (north is -z), y up, metres. The origin is the lower trailhead. Yaw is three's
`rotation.y`: the front (+z) turns to (sin yaw, cos yaw). Motion time `t` is seconds (`CLOCK.t`); world time is
`CLOCK.hour`. Everything placed is a core/tags record. Port tags are in `PORT.md`.

## 41-verge-layout.js: `VG`, `terrainH`, `waterH` ([G data])

The whole terrain as functions of (x, z), seeded from `VG.SEED`. No THREE and no DOM: `tests/test-layout.js` runs it in
node.

| Name | What |
|---|---|
| `VG.E` | the levels: `PLAT` 938 (the plateau), `CAN_LIP` 862 (the canyon floor at the lip), `FLOOR` 4, `POOL_Y` 3; `LIP_X` -1400 |
| `VG.canZ(x)`, `canHW(x)`, `canFloor`, `canFloorH(x,z)`, `upperH(x,z)` | the canyon: its centreline, its half-width, its floor |
| `VG.rivUZ(x)`, `WLU(x)` | the upper river: its centreline and water level |
| `VG.lipX(z)`, `escW(z,x)`, `kSpur(z,x)` | the escarpment's lip, its width (the spur's is `SPUR_W` 900, ragged at the toe), and how much of it is the spur (0 cliff .. 1 spur, z -190 to about 600) |
| `VG.cliffP(u)`, `spurP(u)` | the profiles down the cliff (benched, with a talus apron) and down the spur (stepped by low ledges) |
| `VG.FALLS` | seven cataracts `{id, x, top, bot}`, from the lip down to the pool |
| `VG.POOL` | `{x, z, r, y, depth}` |
| `VG.gorgeZ(x)`, `gorgeHW(x)`, `WLG(x)` | the slot the falls drop through, and its water level |
| `VG.RIVL`, `WLL(s)`, `rivLNear(x,z)` | the lower river (Catmull-Rom), its level by arc length, the nearest point |
| `VG.SALT_LAKES`, `SALT_Y`, `lakeD(x,z)` | four salt lakes 7.4 to 14.6 km east, below the floor |
| `VG.TRAIL` | `{pts:[[x,z,y,s]], len, legs, hairpins, rest, grade, half, bank, yTop, yBot}`: about 16 legs on the contours, each hairpin `{id, k, x, z, side, r, y, s}` at its own seeded spot; about 7 km at 12.1% |
| `VG.trailAt(s)`, `trailNear(x,z)` | a point on the trail by arc length; the nearest `{s, d}` |
| `VG.TRAIL.rest` | the four rest stops `{id, km, mark, s, gate, side: 'out'|'in', variant, x, z, y, yaw}` on the legs at the 200, 400, 600 and 800 m marks of the descent; `gate` is where the stop meets the trail. They alternate: variant 1 built out below the trail, variant 0 cut into the rock above it; both face +z toward the drop |
| `VG.RAMPS`, `rampNear` | the north and south ramps up the canyon walls (about 12%) |
| `VG.PADS`, `padAt(x,z)` | level pads (rest stops, spilt houses); 70 adds to them |
| `VG.CARVE` | `{fn, box}`: the funicular's cuttings, set by 70 from `IZV.FUNICULAR.plan` |
| `VG.groundH0(x,z)` | the ground before the funicular, the pads and the trail |
| `VG.groundH(x,z)` | the ground: `groundH0`, the carve, the pads, then the trail |
| `VG.waterAt(x,z)`, `zoneAt(x,z)` | the water level there (or none); 'plateau', 'canyon', 'canyon-wall', 'cliff', 'spur', 'floor' or 'salt' |
| `VG.FUNI` | `{z, a, b, rec}`: the funicular's line; `rec` is its plan |
| `VG.HWY_U`, `HWY_L`, `PORTS` | the highway's two halves; the map-edge ports (west, plateau_n/s, east, floor_n/s) |
| `VG.CITY.upper`, `.lower` | `{id, box, head, edge, rings: [[r0, r1, district]]}` |
| `terrainH(x,z)`, `waterH(x,z)` | globals with a one-entry cache; every other fragment reads the ground through these |

## 70-verge-place.js: `PLACE`, `VERGE_PAINT`, `placeAt` ([G data])

Placement as records, before anything is drawn. Each city is a core/mask raster at 1.5 m. Its codes are free 0,
street 40, plaza 80, yard 120, building 160, blocked 200.

- `PLACE.buildings`: `{id, key, kit: 'izv'|'ykit', name, city, district, x, z, y, ry, w, d, h, v, wealth, culture,
  types, door, landmark, seed, tag, uid}`. `y` is the floor; `v` is the kit's variant.
- `PLACE.streets`: `{id, city, cls: 'highway'|'lane'|'alley', w, pts: [[x, z, y]], len, bridge, join}`.
- `PLACE.bridges`, `PLACE.plazas`, `PLACE.pads`.
- `PLACE.cities.upper`, `PLACE.cities.lower`: each has `code(x,z)` and `h(x,z)`, plus its buildings, streets and
  `landmarks`.
- `PLACE.failed`: the landmarks no spot was found for, by city.
- `PLACE.obb(x, z, hx, hz, ry)`: the corners of a rotated box.
- `window._place`: the counts, `rejected` (why each try failed) and the masks' hashes.

The order is the priority:

1. the funicular's plan;
2. the highway and the trailhead plazas;
3. the toll gates, palisades and toll houses;
4. the landmarks, hunted near their anchors;
5. the warehouses round each trailhead;
6. the lanes, sub-lanes and alleys;
7. the frontage plots (a back row behind most of them);
8. the back lots;
9. the houses spilt onto pads beside the trail's first and last legs;
10. the rest stops.

A lane checks the ground every 1.5 m of each step, so it never jumps an alley.

## 71-verge-furnish.js: `VFURN`, `FURNISH`, `furnishAt`

`VFURN = KFURN.create(...)` (core/furnish) on the master catalog and kits/interiors.

- `VFURN.itemOf(key, v)`: the set's item: `<key>` for variant 0, `<key>#<n>` for another. An Iziz Vernacular variant
  without its own item takes variant 0's rooms (`VFURN.sharesRooms(key)`: those variants change only their seed). A
  Yuni or Abyssal variant without one is not furnished.
- `VFURN.item(key, v)`: the item, or null when there is none or it is a skip.
- `VFURN.why(key, v)`: 'skip', 'noItem' or 'none'.
- Interiors are planned after load, nearest the camera first, within `?furnishR` (default 320 m). Each frame spends at
  most `?furnishMs` (default 28). `window._interiors` counts them.

## 72-verge-buildings.js: `VERGE_STRUCTURES()`, `VERGE_AFTER_BAKE()`

Draws every record through its own kit: `IZV.VERN.place` and `IZV.FUNICULAR.draw`, or `YKIT.buildAsset`. Each
building gets an obstacle, a walk block and its interior item. After the bake, the furniture lamps and the
Vernacular's bulbs go into the Yuni engine's night light, and `VERGE_GLOW` is that engine's glow.

## 74-verge-sim.js: `SIM` ([G data])

| Name | What |
|---|---|
| `SIM.T` | 10800: one cycle of the timetable (s) |
| `SIM.FACTIONS`, `ROLES`, `ACTIVITIES` | who is who, and each role's 24-hour schedule |
| `SIM.PLACES`, `PBY` | places by id (buildings, plazas, ports, rest stops). Caravanserais and rest stops have `slots: [{x, z, y, ry, kind: 'person'|'animal', busy: [[t0, t1]]}]` |
| `SIM.NAV`, `route(a, b, {minW, noLayer, budget})`, `pathOf` | the walk graph (streets, highways, the trail, the ramps, doors) and A* over it |
| `SIM.PATH(pts)`, `pathAt(P, s, out)`, `densify` | paths: `[x, z, y, heading]` by arc length. The heading looks one point ahead, past any point within 5 cm |
| `SIM.GROUPS` | `{id, kind, subkind, name, faction, org, path, tl, v, duration, phase, copies, stops, members}` |
| `SIM.memberPose(G, M, tau, o)` | **pure**. Fills `o` with `{vis, x, y, z, yaw, speed, phase, pitch, pose, dispersed, load}` at run time `tau`. Following members trail the leader along the path by their lag; at a dispersing stop each walks to its own slot and back |
| `SIM.CITIZENS`, `decide(C, t)`, `LOG` | the pedestrians: each decision is taken from the citizen's seeded stream and logged |
| `SIM.golden(times)`, `export()` | the trace Godot is checked against, and the krator-sim export |

The groups are:

- **Caravans:** `caravan:through` (8) crosses the trail and leaves by the far edge. `caravan:turnaround` (8)
  unloads at a caravanserai and goes home. A caravan is a guard, 3 to 5 camels each with its driver, and a guard,
  spaced 4.2 m apart.
- **Porters** (10): 1 or 2 camels from a warehouse on one level to one on the other.
- **Nomads** (4): from a random map edge, through a caravanserai, out by another edge of the same level. They ride
  camels above and lizards below.
- **Patrols** (6): the guards of each level, out of its guard tower.

Each group's run time is `((t - phase) mod T) + c·T` for copy c. Slots are reserved in the cycle's order, so no slot
is held twice at once (the `one-body-one-slot` check).

## 77-verge-rigs.js: `RIGS` ([draw])

`RIGS.person(n)`, `RIGS.camel(n)` and `RIGS.lizard(n)` are instanced pools. Each has `set(i, x, y, z, yaw, {phase,
speed, pitch, look, pose})`, `hide(i)`, `label(i, text)`, `flush()` and `meshes`. The poses are 'walk', 'stand',
'couch' (a camel) and 'rest' (a lizard). `RIGS.SADDLE` gives the rider's seat height, `RIGS.HEIGHT` the rigs'
heights. This API is the contract a Godot rig keeps.

## 78-verge-life.js ([draw])

Poses the rigs every frame from `SIM.memberPose` and the citizens from `SIM.decide`, at most 14 decisions a frame. A
rider sits on its mount unless dispersed. `window._life` is refreshed every 30 frames.

## 80, 81, 82: the sky and the day

80 is Verge's sky host: its palette and haze, and its horizon (the Inner Wall to the west, the far shelf to the
east). 81 and 82 are vendored, unchanged, from `settlements/locus/src/21-sky.js` and `82-daynight.js`; do not edit
them here. `skySetHour(CLOCK.hour)` each frame keeps one clock.

## 87-verge-views.js: `VIEWS`, `VIEW_CLEAR`, `INITIAL_VIEW`

Each view is `[cx, cy, cz, tx, ty, tz]`, derived from the layout. 'A caravan on the trail' and 'A caravanserai yard'
are getters: they find their subject in the sim when picked. `?view=<name>` opens on a view.

## 91-verge-probe.js: `window._api`

- `checks()`: `[{name, ok, detail}]`. Each check is fed a broken input as its negative control, and a check whose
  negative passes fails the run.
- `export(part)`, `exportParts()`: terrain (a heightfield, step 6), tags, walk, sim, place, golden.

## Query parameters

| Parameter | Effect |
|---|---|
| `flora=0` | skips the biomes |
| `interiors=0` | skips the furnishing |
| `furnishR=<m>` | the furnishing range (default 320 m) |
| `furnishMs=<ms>` | the furnishing time budget per frame (default 28 ms) |
| `hour=<h>` | sets the clock |
| `time=run` | starts the clock |
| `view=<name>` | opens on that view |
| `lifeR=<m>` | the range of the life layer (default 2200 m) |
