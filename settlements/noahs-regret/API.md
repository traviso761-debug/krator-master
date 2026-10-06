# Noah's Regret: the contract

Units are metres; **x east, y up, z south (north is -z)**. A person is 1.75 m. All fragments share one `<script>`
(build.py concatenates `src/` and the core modules in filename order); world fragments 4x-7x declare only names starting
with `nr` (build.py checks it), every `defBuilding` has its own `seed`.

## The two frames

| Frame | What |
|---|---|
| **World** | sea level y = 0; the ground (`terrainH`), the sea, the camera, the records' `x y z ry` |
| **Hull** | the grounded arcology: origin on the keel line at the ring's centre, **+x the bow** (a little north of east), **+z starboard** (the beach side), y up from the keel. Every deck, room, piece of furniture and deck building is laid out level here |

`NR_HULL` (12-nr-world.js) carries hull to world: `T(0, -NR_SEA_H, 0) . Ry(NR_YAW) . Rz(NR_TRIM) . Rx(NR_LIST)` (heading
0.10 rad, trim 0.4 degrees by the bow, list 0.8 degrees to port; the sea stands at hull y 4.4 at the ring's centre).
`nrH2W(x, y, z)`, `nrW2H(x, y, z)`, `nrHeadingW(hry)`, `nrSeaHullY(x, z)` (the sea in the hull frame: the holds' water).
`NR_HULL.m16` is the matrix for three.js (`Matrix4.fromArray`). The arcology def pushes it; the furniture groups carry it.

## The plan (`14-nr-plan.js`, `NR`): positions first, drawing after

The ring is a ship's plan: a closed centreline `NR.curve(th)` = (A cos th, +-B sqrt(1 - |cos th|^m) (1 - 0.3 cos+^3)), `NR.A`
226.6 along x and `NR.B` 121.9 along z, fine at the bow (m 2.4, the tightest bend 38.6 m), full and round at the stern
(m 3.4), its sides near straight. It is tabulated (8,192 samples: positions, arc length, normals, curvature) and is the
old ellipse's length (1,135 m), so every t in the plan kept its place when the shape changed. **t** is arc length along the
centreline (t 0 the bow, increasing to starboard: the stern at `NR.PH`, the mouth at `NR.TM`); **s** is the offset
across it along the outward normal (+s outboard). The ring runs `t` in `[NR.T0, NR.T1]` (a 76 m mouth on the port beam).

| | |
|---|---|
| `NR.at(t, s)` | hull (x, z) |
| `NR.nrm(t)`, `NR.tan(t)` | the outward normal, the tangent (increasing t) |
| `NR.rho(t)` | the centreline's radius of curvature |
| `NR.ringST(x, z)` | the nearest centreline point: `{t, s, inRing}` (a coarse pass over every 32nd sample, a fine pass, the foot on the tangent) |
| `NR.L` | `KEEL 0, HOLD 0.6, MEZZ 4.8, D [9, 12.6, 16.2, 19.8], TOP 23.4, SLAB 0.35, DH 3.6, CLEAR 3.25, PARAPET 1.15` |
| `NR.W` | `PONT 26` (the pontoon's skin), `SKIN 25.3` (the hold's), `MAIN 20` (the main block), `GLASS 18.5` (D3-D4 cabins' glass), `CAB 11` (the cabin wall), `COR 8.5` (the core's wall), `MEZZ 19.2`, `LOT 15` |
| `NR.ZONES` | `{id, kind, name, t0, t1, decks, s0, s1}`: bridge (D4, the bow), atrium (all decks, starboard midships), dining (D3-D4, the stern), engine (D1-D2, the stern). `NR.blocked(d, t0, t1, s0, s1)` |
| `NR.CORES` | eleven stair cores `{id, t, t0, t1, down}` (two go down to the holds' mezzanine) |
| `NR.cabins` | every cabin `{id, deck, side, i, t0, t1, tm, sIn, sOut, depth, wMin, cls, doorEnd, inhabited, kind, wealth}`; `NR.CABIN_CLASSES` the template widths |
| `NR.LOTS` | the deck buildings' lots `{id, key, t, face, use, x, z, ry, y}`; use `hq`, `barracks`, `mess` |
| `NR.FORE`, `NR.foreY(t)` | the forecastle: round the bow (\|t\| < 64) the outboard promenade climbs as a deck from D1 to the D3 floor at the stem under a bulwark (the sheer) |
| `NR.PIERS` | the Ancients' piers `{id, kind, name, t, side, o, d, q, len, w, poly, head}`: two breakwater `arm`s out to sea at the mouth, the liner `mole` down the basin from the stern quay, four `finger` piers off the inner quay; decks at D1. `NR.pierAt(x, z)` the pier under a hull point; `NR.BEACONS` the beacons on the arms' heads |
| `NR.PARKS`, `NR.TOWERS`, `NR.STEPS`, `NR.FLOATS`, `NR.ATRIUM` | the parks' t ranges; the pirates' stair towers, beach steps and floats; the atrium's layout |

Nothing in 12 or 14 touches THREE or the DOM (PORT.md tags them `[G data]`).

## Ring primitives (`40-nr-hull.js`)

`nrBand(mk, t0, t1, s0, s1, y0, y1, col, faces)` a band of the ring (faces `o i t b s e`), `nrLoft(mk, t0, t1, profile, col,
face)` a wall through a section, `nrRadial(...)` a box across the ring, `nrBox`, `nrCyl`, `nrWallT(mk, t0, t1, s, th, y0, y1,
col, openings)` a wall along the ring with doors, `nrSlab(mk, tA, tB, sA, sB, y, th, col, holes, faces, under)` a slab with
rectangular holes (t, s). `nrForecastle()` the bow (bulwark, sheer deck, cutwater, anchors), `nrEndCap(t, dir)` the pontoon's
ends at the mouth, `nrBeacon(x, y, z)`. The piers draw in `41-nr-piers.js` (`nrPierArm`, `nrPierMole`, `nrPierFinger`; a pier's
own frame `nrPierPt(pier, l, k, y)`: l metres out along it, k across). `nrPart(name, fn)` registers a hull pass, `nrAfter(name, fn)` a pass that places child defs after
the lots. The geometry engine is `30-geo.js` (vendored from kits/scyvoi: buckets per material key, world-unit UVs).

## Defs

`defBuilding({key, name, seed, cls, kind, tags, w, d, h, budget, front, note, build(o)})` and `place(key, x, z, ry, o)`
(36-def.js, forked from kits/scyvoi). Placed: `nr-arcology` (the world; it pushes the hull frame), the deck buildings
`nr-anc-reliquary`, `nr-anc-apt-ribbon`, `nr-anc-apt-drum`, `nr-anc-office-lens` on their lots (child records), the
features `nr-pirate-tower`, `nr-pirate-steps`, `nr-pirate-float`, `nr-pirate-awning`, the placeholder flora
`nr-flora-shade-tree`, `nr-flora-fan-palm`. Every placement is a record in `REG` and in core/tags (`KTAGS.page`): buildings
culture `ancient`, state `reclaimed`, types from the vocabulary (the lots add `military`), role (`Ruephus's headquarters`,
`barracks`, `mess hall`); the pirates' timber culture `post-apoc` (their salvage style); flora tagged by biome and use.

## The deck buildings and their interiors

A deck building's def names an item of `kits/interiors/sets/noahs-regret.js`; `nrPlanOf(itemKey)` plans it at the
origin (`IX.sets.instantiate`, cached). The builder draws the outside and calls `nrDrawPlan(inst, o)` for the planner's
floors (stair wells cut), partitions (door openings), stairs and door leaves, so the rooms the furnishing pass fills are
the rooms the walls enclose. `nrBuilt(o, key, item, w, d)` registers the building for the walk floors and the furnishing
pass (`NR_BUILT`). Storey heights: apartments `NR_STOREY` 3.35, offices 3.65, the Reliquary 3.65.

## Furniture (`91f-furnish.js`, `70-nr-interiors.js`)

core/furnish records (`KFURN`): `x y z ry` world, **`lx ly lz lry` the hull frame** (exact pose = `NR_HULL` applied),
`building` (a core/tags id), `room`, `seed`, `variant`. Placing: `FURNISH(key, lx, ly, lz, lry, o)` in a builder's frame,
`FURNISH_H(key, hx, hy, hz, hry, o, ctx)` in the hull frame, `nrPut(key, t, s, y, face)` on the ring (face `in out fwd aft`),
`nrHang` (a ceiling piece by its top). The pass:

- cabins: `nrTemplate(key, roomDef)` furnishes one template room (`furnishRoom` through `IX.runtimeAdapter`), audited
  (`IX.audit`); `nrInstRecords` writes its placements as records in each cabin; `nrCabinDoor(C)` puts each real door
  where its template has it;
- deck buildings: every room of an item furnished once, records per building; `IX.sets.auditResidence` per item;
- public rooms: `nrFurnishPublic` (bridge, dining, engine, atrium, corridors, holds, quay, top).

Drawing: templates are InstancedMeshes in `NR_FURNG` (carrying `NR_HULL`); `nrStreamTick` writes the instances within
`NR_STREAM.R` of the camera (and, while cut, on the cut deck) every 0.4 s. The rest of the furniture is one batch
(`SVF.batch`, merged per render family) in `HULLG`.

`window._interiors`: `rooms, byKind, missingRequired, auditFails, audited, templates, cabinsFurnished, cabinsBare,
cabinsEmpty, residences, residenceFails, publicRooms, cabins (each cabin as data: its trapezoid, door, kind, template),
buildingRooms, items, ms`.

## The deck cut (27-mat.js, 92-camera.js)

`nrCutHook(material, solid)` adds the cut to a material: `ANIMU.uCutOn`, `ANIMU.uCutY` (a hull-frame height), `ANIMU.uHullInv`.
`cutSet(y | levelName | null)`; `NR_LEVELS` (89-nr-views.js) names the levels. A view is `[cx, cy, cz, tx, ty, tz, {cut,
night}]`. Every hull material, the furniture's and the halos take the hook; the ground, the sea and the sky do not.

## Probe (`window._api`)

`footprints() nanSweep(list) doors() kitCoverage() furniture(all) interiors() tags() tagExport() materials() faction()
setNight(v) setCut(v) setView(...)`, and `REG DEFS SITES NR`. `window._build`: build time, triangles, records, furniture.
`NR_FACTION` (36-def.js) is the pirates' faction data for the life layer to come; no agent exists yet.
