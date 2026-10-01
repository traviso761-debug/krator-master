# kits/interiors — known issues

`verify.py --assert` passes (23 rooms, about 100 pieces a seed, seeds 0–2; seeds 0–7 also pass)
with nothing deferred. What follows is what the checks do not cover, or what the kit does not do yet.

## Open

- [ ] **The catalog is thin indoors, so many rooms run on fallbacks.** 12 required pieces in the demo
  come from another culture, and 15 of 23 rooms are `thin` (fewer than 3 own-culture pieces for
  their kind). The gaps: no bed and no hearth for any Yuni culture, no stove except
  `yuni_salvage_hearth_hood`, no tavern furniture for Voth (a Voth tavern is all Beast Rider), no
  workstation for the Ancients, no table for `yuni-court`, an altar but nothing else for shrines.
  Yuni's own interior pieces (`64-interiors.js` "NEW PIECES": `common_rope_bed`,
  `court_canopy_bed`, `common_cooking_hearth`, `common_wall_shelves`, `common_shop_counter`,
  `common_tavern_table`, `common_workbench`, `common_grain_sacks`, `court_carpet`,
  `poor_clay_pots`, `nomad_rug_pile`) were never harvested into the catalog; harvesting them
  closes most Yuni gaps. That is catalog work, not placer work.
- [ ] **No `surface` piece in the catalog.** The surface path (a piece on a table, counter, shelf or
  desk top) is exercised only by `tests/core_test.js` with a fake catalog, not in the demo.
- [ ] **Rooms are given, not planned.** Yuni's planner also finds rooms (fits them inside a
  building's captured bodies, splits zones, adds partitions, stairs and a walk graph). That part is
  not ported: this kit furnishes rooms a build registers. One level per room; no stairs.
- [ ] **Not yet joined to a life layer** (SPEC "What to build first" 3). The grid, the door cells and
  the BFS are exposed for it (API.md "Reading the grid"); nothing walks in yet.
- [ ] **Many point lights.** Catalog lamps and braziers carry their own `PointLight` (`F.lamp`): 29 in
  the demo. three.js r128 compiles every light into every lit material; a city with hundreds of
  furnished rooms must strip or budget them (Yuni exports them as data and lights rooms uniformly).
- [ ] **Clearance `left` / `right`** are not defined by `kits/furniture/SPEC.md`. The kit takes `left` =
  local `-x`, `right` = local `+x` (as seen standing in front of the piece). Only
  `yuni_salvage_strut_bed` (`left`) and symmetric tables use them today.
- [ ] **A seat may stand in its table's clearance.** That is what the zone is for; the placer and the
  audit both except a seat from the clearance of the table or desk it is drawn up to (`host`), and
  nothing else.
- [ ] **Greedy placement.** Each piece takes the first slot that passes; when a required piece then
  has no room, the whole room is furnished again with that requirement first (3 passes at most).
  A very tight room can still report `no-fit` (it is reported, and `--assert` fails on it for the
  demo rooms).
- [ ] **The walk grid is coarse**: 0.2 m cells, 4-neighbour, walker radius 0.2 m, so a gap narrower
  than about 0.6 m counts as closed. A door's swing zone is a rectangle (w + 0.2) x (max(w, 0.9) +
  0.1) that covers the arc; an outward or open (`none`) door keeps 0.7 m clear inside.
- [ ] **Windows** keep clear only what is taller than the sill (a 0.35 m deep band); a low chest
  may sit under a window, a shelf may not.
- [ ] **Shells are demo stand-ins**: flat roofs, no partitions, a shared wall drawn once from each
  side. The cut-away decides per wall by its outer face; a real building registers its own
  `{ roof, walls }` (API.md "Views").
- [ ] **`voth_lantern_fixture`** variant 1 is a wall bracket under a `floor` anchor
  (kits/catalog KNOWN_ISSUES); the adapter offers only variant 0.

## Limits of the checks

- **Measured-inside** takes every built vertex into the piece's own frame and tests the four corners
  of that box, shrunk by max(6 cm, 4 %), the catalog's own declared-size tolerance plus a
  centimetre. Within that a piece's real geometry may graze a wall.
- **Declared footprints** drive overlap, door and clearance checks. The catalog verifies that every
  piece fits its declared box (kits/catalog `verify.py`), so declared overlap-free means built
  overlap-free within that tolerance.
- **Reach** uses the kit's own grid code on a fresh grid built from the plan's data. It is an
  independent re-run, not an independent implementation.
- **Seeds**: `--assert` audits seeds 0–2 (`--seeds N` for more); room seeds are hashes of room ids,
  so renaming a room re-furnishes it.
