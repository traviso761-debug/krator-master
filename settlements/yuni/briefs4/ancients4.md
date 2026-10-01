# Ancients — round 4b: furniture

Your working copy `/home/claude/w_ancients` has been refreshed from the merged main tree (your round-4
work is already in it, plus the civic library and the planner's new catalogue plumbing).

There are two new catalogue targets and two new registries. Read the contract at the top of
`src/53-assets.js` (sections 13b-ii and 13b-iii) before writing any of this.

- `FURN({key,name,culture,room,w,d,h,variants,build})`. Culture must be one of `FURN_CULTURES`:
  `ancient`, `yuni-court`, `yuni-common`, `yuni-poor`, `sahelian`, `order`, `nomad`, `ancients-salvage`.
  Two of those are yours: **`ancient`** (as the Ancients themselves made it — white metal, moulded
  organic forms, blue glass, integral lighting, no visible fasteners where it can be avoided) and
  **`ancients-salvage`** (Ancient parts cut up and re-made by Yuni hands — a panel on masonry legs,
  a strut bent into a stand, a light fitting rewired, rust where the coating was cut).
- The frame is the same `F` as an ASSET: origin at the footprint centre on the FLOOR, +z is the FRONT.
- The planner has seeded 14 pieces in `src/63-furniture.js`, including one salvage piece. Read it for
  the house style and the level of detail; do NOT edit it. Put yours in `src/61-ancients.js` (or in the
  generator `tools/gen_ancients.py` if that is where it belongs — keep the two consistent as always).

## What to build

**`ancient` — the Ancients' own furnishing**, the things still standing inside a worn or reclaimed
interior, the reason a Yuni family moves into an Ancient shell rather than building new:

- a moulded bench or seating pod that grows out of the floor,
- a console or work surface with a blue glass top and a dead indicator strip,
- a wall of storage cells or lockers, some open, some sealed,
- a berth / sleeping shell,
- a lighting element — a luminous ring, panel or stem that the antechamber's electric supply would
  still drive (use `F.lantern`/`F.lamp` so it lights on the night schedule),
- a fixed table or refectory run for a communal hall,
- something specialised and strange: an instrument frame, a rack of sockets, a machine seat.

Give each piece a worn variant and, where it makes sense, a second variant that has been repaired or
re-used by the current occupants (a cushion thrown on a moulded bench, a cell with a cloth curtain).
Rust and tarnish follow the same rule as round 4: rust dominant, moss and vines absent indoors.

**`ancients-salvage` — four or five pieces** made by Yuni hands out of Ancient stock: a bed frame from
strut stock, a screen or room divider of cut panel, a storage press from a locker bank on a mud plinth,
a hearth hood from ducting, a lamp stand from a light stem.

## Verify
`python3 build.py`, then `./run.sh LOG yuni-furniture.html --assert` (there is a
`furniture-culture-tagged` invariant), plus the usual `yuni-assets.html` and `yuni.html` runs to prove
you broke nothing. Shoot the catalogue with `python3 shoot_sheet.py --page=yuni-furniture.html qa 0 1 …`
and look at every piece before reporting. Sizes are in METRES and small — a bench is 0.45 m to the seat,
not 4.5 — so check them against the 1.75 m scale figure standing beside each piece.
