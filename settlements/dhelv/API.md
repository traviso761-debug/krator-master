# Dhelv: the page's programmatic surface

What a script, a headless check or a port can read from `dist/dhelv.html`. The prose (what each part is, why, what was
fixed) is in `README.md`; this file lists names. The kit's own surface (defs, `place()`, the cavern hooks, the walk map,
halos) is `kits/zeijani/API.md`.

x east, z south, y up, metres; the hub's square is y 0.

## Globals

| Name | Fragment | What |
|---|---|---|
| `DH` | `41-dhelv-layout.js` `[G data]` | the layout: the land, the hall, the wells, the ways, the sites, the districts. No THREE, no DOM; `module.exports` under node |
| `DHN` | `72-dhelv-nav.js` `[G data]` | the nav graph the ramblers walk, built from what was built, and its checks |
| `DHS` | `74-dhelv-sim.js` `[G data]` | Dhelv declared into core/simulation (`SIM`): layers, places, roles, the population, the stone door's hours, and the checks |
| `DHL` | `95-dhelv-life.js` | the ramblers drawn: the clock (`DHL.clock`, core/clock), the instanced bodies, the followed walker |
| `SITES` | `90-dhelv-scene.js` | `DH.SITES` as the page places them: `{key, x, z, ry, o, district, at}` (`o` holds `v`, `y` and the site's options) |
| `REG`, `DEFS` | the kit's `36-def.js` | every placement record; every def |
| `KWALK`, `CVC` | core/walk; the kit's `40-zj-cave.js` | the walk floors and blocks; the page's cavern |
| `HALOS` | the kit's `30-geo.js` | the lamps the buildings recorded |
| `DH_STREAM` | `90-dhelv-scene.js` | the rock's chunks meshed near the camera (`R` 120 m, dropped past 170 m) |
| `DH_CELLS` | `90-dhelv-scene.js` | the buildings and plants drawn in cells; what the camera shows (`dhSeen`) |
| `DH_LIGHT` | `94-dhelv-light.js` | the cave's light: the openings' daylight, the pool of 14 lamps |
| `DHMAP` | `93-dhelv-map.js` | the minimap |
| `VIEWS`, `setView(cx, cy, cz, tx, ty, tz)` | the kit's `92-camera.js` | the named views and the camera |

## `DH` (the layout)

Its header lists the API; `README.md`, "`DH`", explains each part. Members:

| Member | What |
|---|---|
| `groundY(x, z)`, `surfaceY(x, z)` | the land's height (the page lays the young lava on it: `48-dhelv-flows.js`) |
| `flankY`, `topY`, `plainY`, `shelfY(x, z, d)`, `lipR(x, z)`, `plateauD(x, z)`, `cliffX(z)` | the land's parts: the volcano's flank, the shelf's top, its weathered lip, the signed distance to its edge, the straight west face |
| `FLANK`, `PLAT`, `LIP`, `APRON` | the land's numbers: the flank, the shelf (outline, top, tilt), the lip, the outpost's level ground |
| `HALL`, `hallK(y)`, `onHall(th, inset)`, `onLedge(th)`, `hallNormal(x, z)` | the hub: a bottle-shaped hall, its square an ellipse 280 by 200 m, the light well its throat, a ledge 10 m up |
| `PITS`, `onPit(P, th)` | the three satellite wells: `{id, name, c, r, floor, depth}` |
| `NODES`, `EDGES`, `byId`, `adj`, `len(e)`, `grade(e)`, `dist(from, ok)` | the public ways. An edge: `{a, b, kind, w, zone ('outer', 'inner', 'secret'), door ('stonedoor')}` |
| `SITES` | every placed def: `{key, district, x, z, ry, y, at ('floor', 'wall', 'ground')}`; a `'wall'` site's origin is the foot of its front on the wall, facing in |
| `FOOT` | each key's declared footprint `[w, d, origin]` (`'front'` or `'centre'`), as the kit declares it |
| `DISTRICTS`, `wealthAt(d)` | `hub`, `s1` to `s3`, `cistern`, `catacombs`, `outpost`: anchor node, `dist` from the square, `wealth`, what each must hold |
| `HILLS`, `hillAt(x, z)` | the wells' floors' hills and the buildings' level pads; `hillAt` gives `{H, y}` or null |
| `PASTURE`, `STREAM`, `PAL` | the outpost's pasture, the stream's line, the palisade's circle |
| `MIRRORS`, `SHAFTS`, `DECOY` | PLAN.md section 13's extras the page carves and lights |
| `RULES` | the numbers `tests/test-layout.js` holds the layout to |
| `faceIn(x, z, cx, cz)` | the turn whose front (+z) points from (x, z) to (cx, cz) |

## `DHN` (the nav graph)

| Member | What |
|---|---|
| `get()` | the graph, built on first use after the world: `{nodes, edges, byId, doors, grids, realized, ms}` |
| `build()`, `areas()` | build it; the open floors gridded (the hall at 3 m, each pit at 3 m, the apron at 5 m) |
| `nearest(x, y, z)` | the node for a point, by the floor under it, never the nearest in plan |
| `segOk(a, b, o)` | can a walker go straight from a to b (a floor within a step every 0.5 m, no block; `o.head`: 2 m headroom) |
| `reach(B, from, ok)`, `crossings(B)` | the nodes reachable over the edges `ok` allows; where layout ways cross in plan |
| `chkNodes`, `chkEdges`, `chkReach`, `chkStacked` | PLAN.md 8.3 checks 1 to 4 (the probe runs them) |
| `R`, `H`, `STEP`, `HEAD`, `NOPLACE` | the walker (0.3 m radius, 1.7 m tall, 0.6 m step, 2 m headroom); keys that are no one's place |

## `DHS` (the ramblers, as data)

| Member | What |
|---|---|
| `init(clock, {pop})` | declares the world into `SIM` once, after the nav graph |
| `KINDS`, `kindOf(key)` | what each def offers: `[kind, {ACTIVITY: slots}, opts]` (a shop's is generated) |
| `WORLD` | the records `SIM.load` takes: `activities`, `factions`, `orgs`, `relations`, `events`, `roles` |
| `DOOR_SHUT`, `doors(hour)`, `doorEdges` | the stone door shut from 22:00 to 5:00; its passage costs Infinity then |
| `run(clock, minutes, each)` | steps the world a minute at a time |
| `day(clock, minutes)` | a day's run and what it saw (poses, decisions, stairs, districts, foreigners, the shut door, groups) |
| `poseOk(s)`, `foreignOk(task)`, `crossesDoor(task)` | PLAN.md 8.3 checks 5 and 6 |
| `groupsIn(log)`, `groupRun(clock, E)` | the groups (patrols, funerals, porters, the guard's change, children) in a log; one group fired and followed |

## `window._api`

Set by `91-dhelv-probe.js`; `exportParts` and `export` by `92-dhelv-export.js`.

| Member | Returns |
|---|---|
| `REG`, `DEFS`, `SITES`, `ZJ_LIFE`, `DH` | the registries and the layout |
| `footprints()` | each top-level site's measured box against its declared one, turned with the site |
| `nanSweep()`, `doors()`, `furniture()`, `tags()`, `materials()` | as the kit's probe (`kits/zeijani/API.md`) |
| `stream()` | the rock's streaming: chunks meshed, triangles, chunks in all, pending |
| `meshAround(x, y, z)` | meshes every chunk near a point now (verify does it before each shot) |
| `setNight(v)`, `setCut(v)`, `setView(...)` | the switches |
| `exportParts()` | the export's part names |
| `export(k)` | one part as an object |

`window.hostChecks()` and `window.hostNegatives()` are the page's checks; `README.md`, "The page", lists each with its
negative. `window._build` holds the last build's counters.

## The export (`92-dhelv-export.js`)

Nine parts, one JSON each:

| Part | Format | What |
|---|---|---|
| `terrain` | `krator-heightfield` | `DH.groundY` on a 4 m grid over the sites' box and 120 m round it (Float32, base64) |
| `place` | `krator-dhelv-place` | every site (key, district, `at`, x, y, z, ry, w, d, origin, h) and the cavern's openings |
| `cavern` | `krator-cavern` | the cavern's plan: prims, openings, fixtures (not the meshes) |
| `tags` | core/tags export | every record |
| `walk` | `krator-walk` | the walk floors and blocks (the navmesh's source) |
| `nav` | `krator-dhelv-nav` | DHN's nodes, edges (kind, zone, layout, w) and doors |
| `sim` | core/simulation export | the world's records, plus `motion`: every actor's baked task (legs, routes, speeds, durations) as `SIM.pose` reads it |
| `golden` | `krator-dhelv-golden` | `SIM.pose` of every actor at six motion times, from the same snapshot as `motion` |
| `lights` | `krator-lights` | `HALOS`: position, colour, `big` |

```
cd settlements/dhelv && python3 verify.py dist/dhelv.html --export ../../godot/data/dhelv
```

writes `<part>.json` for each and a `meta.json` (the files' sizes, the page's errors, the date). Godot reads them in the
`dhelv` case (`godot/README.md`): `godot/tests/dhelv/dhelv_sim_test.gd` replays the golden trace with `KSim`;
`dhelv_nav_test.gd` bakes the walk floors into a navmesh and walks the gate to the temple. Not exported yet: the cavern's
meshes, the furniture, the materials (PLAN.md progress log, P7).

## URL parameters

| Parameter | Fragment | Effect |
|---|---|---|
| `?only=key,key` | `90-dhelv-scene.js` | places only those defs (the ways are carved still) |
| `?hour=H` | `90-dhelv-scene.js`, `95-dhelv-life.js` | the sky's hour and the life clock's |
| `?seeall` | `90-dhelv-scene.js` | draws everything (the switch that draws only what is seen, off) |
| `?noforest`, `?nothrone` | `45-dhelv-bio.js` | leaves out the hyperjungle's forest; the Throne kit's flora |
| `?q=`, `?tq=` | `45-dhelv-bio.js` | scales the hyperjungle's floor (1); the Throne kit's flora (0.7) |
| `?time=run`, `?scale=N` | `95-dhelv-life.js` | runs the day; N times fast |
| `?walkers=N` | `95-dhelv-life.js` | draws at most N ramblers (700) |
| `?pop=N` | `95-dhelv-life.js` | scales the homes' people |
| `?nolife`, `?nav` | `95-dhelv-life.js` | leaves the ramblers out; shows the nav graph |
| `?t=S` | the kit's `93-anim.js` | pins the shader clock (verify uses `?t=4`) |
| `?mat=proc`, `?furniture=0`, `?interiors=0` | core | vertex colours only; no furniture drawn; no interiors |

## Keys

**T** inspector, **C** cut-away, **N** night, **P** polygon tool, **F** walk, **R** run, **G** go to the marker
(double-click drops it), **M** the minimap, **V** the nav graph, **[** and **]** the hour, **Esc** stops following a walker.
`README.md`, "Getting about".

## Build and verify

```
cd settlements/dhelv && python3 build.py
python3 verify.py dist/dhelv.html --assert --out <scratch>/shots      # also --views, --all-views, --cut, --night, --cam, --eval, --only
python3 tools/node_in_chromium.py settlements/dhelv/tests/test-layout.js   # the layout's checks (no node here)
```
