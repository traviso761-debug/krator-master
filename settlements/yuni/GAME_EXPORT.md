# Yuni: doors, windows, lights and interiors for a game engine

Yuni is a procedural Three.js world now, but it is meant to become a game. Everything a game
engine has to *know* about a building is kept as plain, tagged data with stable ids, separate
from the code that draws it. You can lift it into Blender or Godot without reading any geometry
code. This file is the contract for that data.

| Fragment | What it holds |
|---|---|
| `src/51-fixtures.js` | the registries: `FIX.buildings`, `FIX.doors`, `FIX.windows`, `FIX.lights`, the building tags, `KRATOR_EXPORT` |
| `src/53-assets.js` | `F.door`, `F.opening`, `F.window`, `F.lamp`, `F.mass`: the frame calls that register fixtures |
| `src/64-interiors.js` | the interior modules and the planner that makes rooms, walls, doors, stairs, furniture and a walk graph |
| `src/76-doors.js` | the runtime: swinging doors, see-through doorways, interior streaming, walk mode, export buttons |

## Getting the data out

- In the page, **Export building** downloads the building nearest the camera (or the one you are
  standing in). The file holds its tags, its fixtures and its whole interior.
- **Export fixtures** downloads every building, door, window and light in the world, flat.
- From script or a headless run, call `KRATOR_EXPORT.building('bld_00098')` or
  `KRATOR_EXPORT.fixtures()`.
- `python3 verify_walk.py <html> --asset <key> --variant <n>` writes
  `shots/export-<key>-<n>.json` for one building as part of its walk-through.

## Coordinates

Every value is in **metres, +Y up, right-handed**, which is glTF's own convention:

- x points east and z points south. `yaw` is in radians about +Y.
- A fixture's **local +Z is its outward normal**: the street side of a door, the outside of a
  window. In Godot that is the node's `basis.z`.
- Blender's glTF importer converts Y-up to Z-up by itself, so you never convert by hand.
- World fixtures (`doors`, `windows`, `lights` at the top level) are in **world** coordinates.
- Everything under `interior` is **building-local**: parent it under the building node
  (position `x,y,z`, rotation `yaw` about Y) and nothing moves.

## Ids and node names

Ids are given out in build order, which is deterministic, so the same id names the same door
on every load: `bld_00042`, `door_00301`, `window_01025`, `light_00410`. Interior parts are
named after their building: `bld_00098.room.4`, `bld_00098.wall.10`, `bld_00098.stair.0`.

Each record also carries a `node`, a suggested scene-tree name: `Building.bld_00098`,
`Door.bld_00098.0`, `Window.bld_00098.3`, `Light.bld_00098.0`, `Room.bld_00098.4`,
`Furniture.bld_00098.f10`, `InteriorDoor.bld_00098.wall_2_door_0`. Walls and stairs end in
Godot's import hint `-col` (`Wall.bld_00098.10-col`), so Godot gives them trimesh collision
when they come in as meshes. Doors, windows and lights carry no collision hint: in a game a
door is an `AnimatableBody3D` you script, not static collision.

To carry the tags through glTF, put each record's fields in the node's **extras**. Blender
shows them as custom properties, and Godot 4 keeps them as node metadata when the importer's
"import extras as metadata" option is on.

## Records

**Building**: `id asset name family culture types[] variant seed wealth x y z yaw w d h`.
- `culture` uses the furniture vocabulary: `yuni-poor yuni-common yuni-court sahelian order nomad ancient ancients-salvage`.
- `types` is one or more of: `civic shop tavern inn industry farm dwelling-single dwelling-multi infrastructure religious funerary park`.

**Door**: `id building x y z yaw w h style leaves hinge swing to`.
- `style` is one of `plank double carved studded mat hatch gate open`. An `open` door has no leaf: an archway or a hut mouth.
- `hinge` is `left` or `right` as seen from outside, or `both` for a double door.
- `swing` is `in` or `out`. `to` is `interior`, `court` (the building's own yard) or `street`.
- `y` is the sill, and `x,z` is the centre of the threshold on the outer face of the wall.

**Window**: `id building x y z yaw w h sill`. `y` is the centre of the pane, and `sill` is the
local sill height.

**Light**: `id building x y z kind amp radius electric`.
- `kind` is one of `oil-lantern electric-lantern arc-standard hearth brazier electric flame`.
- Street lights have `building: null`.

**Interior** (building-local), following Mav's Refuge's level vocabulary:

| Field | Shape |
|---|---|
| `levels[]` | `{ k, y, H }`: `y` is the floor top and `H` the clear height |
| `rooms[]` | `{ id, lvl, kind, poly[[x,z]…], y, h, finish, layout }`. kind: `hall living hut bedroom kitchen store shop tavern workshop study` |
| `walls[]` | `{ id, kind: shell or partition, module, a, b, out?, lvl, y, h, thick, openings[] }`. An opening is `{ u, w, y0, y1, depth?, door?, window? }`, where `u` runs along the wall from `a` |
| `doors[]` | `{ id, kind: exterior or interior, fixture?, style, at, y, w, h, rooms: [a, b or 'outside'] }` |
| `stairs[]` | `{ id, module, kind: stair or ladder, lvl0, lvl1, w, rise, run, foot, top }` |
| `furniture[]` | `{ id, furn, variant, seed, room, at, y, yaw, culture, type, setting }`. `furn` is a key in the furniture catalogue (`yuni-furniture.html`) |
| `lights[]` | `{ id, kind, at, y, amp, radius }`: the hearths and braziers the furniture carries |
| `nav` | `{ nodes[{ id, x, y, z, lvl, tag, room?, door? }], edges[{ a, b, kind, len }] }` |

The walk graph's tags are `door doorway room stairfoot stairtop`, and its edge kinds are
`door room stair ladder`. Each `door` node carries `links: 'street'`: it is where the
interior's graph joins the city's walk graph. In Godot, build one `NavigationRegion3D` per
level from the room polygons, and turn each `stair`, `ladder` and `door` edge into a
`NavigationLink3D`.

## Swapping parts

Everything in an interior comes from a registry in `64-interiors.js`, so you can swap a
culture's interiors without touching any building:

| To change | Edit |
|---|---|
| wall, floor and ceiling materials | `FINISH({ key, cultures, wealth, wall, floor, ceil, beams })` |
| interior walls and their doors | `PARTITION({ key, cultures, thick, fam, door:{ style, w, h } })` |
| how levels connect | `STAIR({ key, cultures, kind, w, tread, build })` |
| what is in a room | `LAYOUT({ key, room, cultures, wealth, items:[{ furn, at, opt, variant }] })` |
| which rooms a building type gets | `ROOM_PROGRAM(type, fn)` |
| one building by hand | `INTERIOR_PLANS[assetKey] = function(plan, ctx){ ... }` |

A layout item's `at` is an anchor, never a coordinate: `back left right front centre corner
grid run-back run-left run-right`. The placer keeps door swings, door approaches and stair
landings clear.
