# kits/interiors — known issues

`verify.py --assert` passes (37 rooms: 21 single rooms and 16 in 4 planned buildings, about 200
pieces a seed, 16 walkers; seeds 0–2, and seeds 0–7 with `--seeds 8`) with nothing deferred.
What follows is what the checks do not cover, or what the kit does not do yet.

## Open

- [ ] **The catalog is thin indoors, so many rooms run on fallbacks.** At seed 0, 10 required pieces
  come from another culture and 14 of 37 rooms are `thin` (fewer than 3 own-culture pieces for
  their kind): no hearth and no tavern furniture for Voth (the inn's kitchen and store borrow
  from salvage and Yuni), no workstation, study or bedroom set for the Ancients, an altar but
  nothing else for shrines. Yuni's own interior pieces (`64-interiors.js` "NEW PIECES") close
  most Yuni gaps once harvested. That is catalog work (kits/catalog), not placer work.
- [ ] **Surface pieces depend on the catalog.** The placer's surface path is ON in the demo: every
  room kind's programme ends with an optional `{ anchor: 'surface', max: 2 }` group, filtered by
  anchor, not by key, so whatever surface pieces the catalog has go on tables, counters, shelves
  and desks (37 pieces of 7 keys at seed 0 with the catalog as it stands). Which pieces, and how
  many, is up to the catalog; `tests/core_test.js` also covers the path with a fake catalog.
- [ ] **The planner cuts straight.** `planBuilding` splits each storey with cuts parallel to the
  building frame's axes (the street door's wall and its normal): rooms are rectangles, or Ls
  where the footprint is one; a footprint with slanted walls gets slanted rooms only along those
  walls. No corridors (rooms open into each other: one door per cut), no round bodies (Yuni's
  huts and domes), no setbacks unless a storey is given its own `poly`. A stair is a straight
  flight against an exterior wall with landings in line at both ends (about 6 m of wall for a
  3 m storey), else a ladder; when neither fits, the storey above is unreachable and the plan
  says so (`report.warnings`, failed by `auditBuilding`). When no cut fits, a storey gets fewer
  rooms than its programme (`report.dropped`).
- [ ] **The demo furnishes seven cultures.** The catalog now carries 24 (the interiors furniture pass:
  `kits/catalog/README.md` "Furniture by culture"), with a wealth band per piece (`tier`, `wealth`) that the
  placer honours: a room tries its culture's in-band pieces, then its other tiers, then the chain in
  `IX.CULTURE_FAMILY` (which ends in the generic poor sets). The demo rooms do not yet show a poor room
  falling back to `generic`, a court room with a tapestry, or any of the new cultures; add rooms to
  `70-demo.js` when those sets are placed in a world. `art` is a wall type with no walk-up access.
- [ ] **Walkers do not see each other.** Each walker's route is planned alone on the room grids, so
  two walkers can pass through each other or share a seat; doors stand open (the leaves are
  drawn at 75 degrees) and nobody opens them; a seated walker is a figure lowered onto the seat,
  a walker at a bed stands beside it. A stair is walked as a straight line from its foot to its
  top. Timing is deterministic (a pose is a pure function of t), so a host can add avoidance or
  scheduling on top without changing the routes.
- [ ] **The light pool lights rooms, not lamps.** With the catalog's lights stripped (the default),
  the demo moves a fixed pool of 6 point lights to the room centroids nearest the orbit target,
  every 15 frames, brighter where the room has lamps; the rooms beyond the pool have sun and
  ambient light only. The lamps' own positions are in the plans as data (`plan.lights`) for a
  host with a better scheme (light probes, baked light, a per-room budget).
- [ ] **Backtracking is exercised by the tests, not by the demo.** Every demo room furnishes in one
  greedy run (runs = rooms in the verify report); the bounded search is proven on a tight room in
  `tests/core_test.js` (greedy and three reorders leave it a piece short; the search fits it).
  The search refuses a piece's slot and everything within 0.6 m of it, at most 48 runs: a room
  that needs a piece moved less than 0.6 m, or more than 3 discrepancies, still reports `no-fit`.
- [ ] **`src/46-planner.js` is over 30 KB**: read it by section (its header lists the steps).

## By design

- **A seat may stand in its table's clearance.** That is what the zone is for; the placer and the
  audit both except a seat from the clearance of the table or desk it is drawn up to (`host`), and
  nothing else.
- **Windows** keep clear only what is taller than the sill (a 0.35 m deep band); a low chest may
  sit under a window, a shelf may not.
- **In the `cut` mode partitions drop to stubs** with the camera-facing exterior walls of the
  storey on show, so a planned building reads as a floor plan; the storeys below it stay whole.

## Limits of the checks

- **Measured-inside** takes every built vertex into the piece's own frame and tests the four corners
  of that box, shrunk by max(6 cm, 4 %), the catalog's own declared-size tolerance plus a
  centimetre. Within that a piece's real geometry may graze a wall.
- **Declared footprints** drive overlap, door and clearance checks. The catalog verifies that every
  piece fits its declared box (kits/catalog `verify.py`), so declared overlap-free means built
  overlap-free within that tolerance.
- **A door's swing zone** is a polygon that circumscribes the leaf's quarter disc (6 segments,
  radius leaf + 5 cm, pushed out by under 1 %), plus a 0.45 m threshold band: a piece may stand
  just outside the arc, nowhere inside it.
- **Reach** uses the kit's own grid code on a fresh grid built from the plan's data. It is an
  independent re-run, not an independent implementation. The ways into a room are its doors and
  the landings of its stair fixtures; every one must reach every other and every usable piece.
- **Walkers** are checked on their own routes: each walk segment is sampled every third of a cell
  on the room's grid, the door thresholds and stair flights between rooms are not (they are the
  links the planner made). The building's grid reach (`reach-grid`) routes from the first street
  door into every room.
- **Lights**: the budget check counts the point lights in the scene; with `?lights=keep` it checks
  instead that the real lights equal the lights the plans carry as data (53 at seed 0).
- **Seeds**: `--assert` audits seeds 0–2 (`--seeds N` for more); room seeds are hashes of room ids,
  so renaming a room re-furnishes it. Planned buildings do not depend on the furnishing seed.
