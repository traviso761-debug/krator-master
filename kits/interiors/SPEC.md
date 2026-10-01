# kits/interiors/ — spec

**Status (2026-10): implemented here.** `ROOM()` registration, the placer (`furnishRoom`, SPEC
"Placement" 1–4), the occupancy grid that keeps every door connected to every usable piece, the
room-outline debug view (build-first #1), a placer for every room kind in `IX.PROGRAMS`, not just
hall and bedroom (#2), and the cut-away (#4) are built and verified: see `README.md`, `API.md`
and `KNOWN_ISSUES.md`. The placer is engine-neutral and reads furniture through an adapter; the
demo furnishes from the master catalog (`kits/catalog`, which replaces `kits/furniture/` below
until that kit exists). Still open: #3 (doors joined to a life layer; the grid is exposed for
it), and the part of Yuni's planner that FINDS rooms inside a building (here a build registers
them). Additions to the contract below: door `swing`, `hinge`, `h`, `leaf`; window `h`; room
`id` and `seed` (API.md "Registering rooms").

**Implemented first in Yuni** (`settlements/yuni/src/64-interiors.js`, runtime in `76-doors.js`, data contract in
`settlements/yuni/GAME_EXPORT.md`). Start there before building interiors for another settlement: the planner
fits rooms inside an asset's captured bodies, so it should port to any build that uses the same asset frame.

The goal is to place furniture inside buildings, and later to let people walk in. Right now people stop at the door. Yuni's
`KNOWN_ISSUES.md` calls this out: "no interiors — people stand at the door, not
inside".

## What a building exposes

A building that can have an interior registers **rooms** alongside its geometry:

```js
ROOM({
  building: 'voth_tavern_01',   // the placed building's registry name
  kind: 'tavern',               // hall bedroom kitchen store workshop shrine tavern
                                // library school study barracks court yard rooftop …
  poly: [[x,z], …],             // floor outline in world units (the polygon tool's format)
  y: 0.0,                       // floor height
  h: 3.2,                       // clear height to the ceiling
  doors: [{ at: [x,z], w: 1.1, to: 'street' | '<room id>' }],
  windows: [{ at: [x,z], w: 0.9, sill: 0.9 }],
  culture: 'voth',
  wealth: 0.6                   // 0–1, picks furniture variants
});
```

## Placement

A placer fills each room from `kits/furniture/` in a fixed order:
1. Filter by `culture`, `setting ∈ {indoor, both}`, and `rooms ∋ kind`.
2. Place the pieces the room kind requires first (a tavern gets a hearth and a
   counter), against walls and in the anchor the piece asks for.
3. Keep every door's swing and every piece's `clearance` free, and keep a path
   from each door to each seat. The life layer's nav grid (Voth's `78b-life-nav.js`)
   will need that path.
4. Everything is seeded per room, so a room looks the same on every load.

## What to build first, when the time comes

1. `ROOM()` registration and a room-outline debug view, in one settlement.
   Yuni is the best candidate: it already has the `FURN` catalogue and `room` tags.
2. A placer for two room kinds, `hall` and `bedroom`.
3. Doors connected to the life layer, so agents can enter.
4. Cut-away rendering (hide the roof and upper floors) so interiors can be seen.
