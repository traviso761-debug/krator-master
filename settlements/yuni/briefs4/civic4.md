# Civic — round 4

Your working copy is `/home/claude/w_civic`, refreshed from the merged main tree (your round-3 library, the
ancients' round-3/4 rust and planting changes, and the planner's new catalogue plumbing). You own
`src/59-civic.js`. You may ALSO add to the two new catalogue fragments' vocabulary by registering pieces
(see item 3) — put your furniture registrations in `src/59-civic.js` itself, not in the planner's files.

## 1. The school — continue where you left off

From your own round-3 note: the school's windows still have no reveal. Fix that, and take the building
the rest of the way. It is the Order's school, heavy Gaudí, and it should hold its own beside the
library that now stands next to it on the sheet:

- Windows get proper reveals (`F.window` without `noReveal`), and the openings want the parabolic
  head the rest of Yuni uses rather than plain rectangles where the wall can carry it.
- The roofline is the weakest part — it reads as a shed with decoration on it. Give it something the
  eye can land on: an undulating or scalloped ridge, a stair turret, a gable with a tile mosaic.
- A yard: this is a school, so a walled play/teaching yard with a shade tree, a well or standpipe,
  and benches along one side, in the same idiom as the library's cloister.
- Keep all three variants distinct.

## 2. The watch-and-bell tower

From your own round-3 note: the bell still reads as an empty arcade beyond about 20 m. So:

- Make the belfry read at distance. That usually means a darker recess behind the bell, a visible
  bell mass with enough contrast against the sky, and a headstock/beam so it is legibly a bell and
  not a hole.
- Give the shaft some relief — a string course, a change of batter, bands of mosaic or relief — so
  it does not read as one extruded lump.
- A stair: an external or half-external stair turret, or at least visible openings climbing the shaft.

## 3. Register your interior furniture

There are two new catalogue targets and two new registries. Read the contract at the top of
`src/53-assets.js` (sections 13b-ii and 13b-iii) before you write any of this.

- `FURN({key,name,culture,room,w,d,h,variants,build})` — culture must be one of
  `FURN_CULTURES` (`ancient`, `yuni-court`, `yuni-common`, `yuni-poor`, `sahelian`, `order`,
  `nomad`, `ancients-salvage`). Build frame is the same `F` as an ASSET: origin at the footprint
  centre on the FLOOR, +z is the front.
- Build it with `python3 build.py`, then verify the catalogue target with
  `./run.sh LOG yuni-furniture.html --assert` and shoot it with
  `python3 shoot_sheet.py --page=yuni-furniture.html qa 0 1 2 ...`.
- The planner has already seeded 14 pieces in `src/63-furniture.js` — read it for the house style
  and the level of detail, and do NOT edit that file.

What I want from you: the library's own furniture, which you built inline last round, pulled out into
registered `FURN()` pieces tagged `order` — the bookcase, the reading table with benches, the lectern,
the ladder, the globe on its pedestal — plus whatever the school needs (a bench-desk for pupils, a
master's chair, a slate or writing board, a mat rack). Then have the library and the school BUILD from
the registered pieces via `buildFurn(key, lx, lz, ry, {y:..., seed:..., variant:...})` where that is
practical, so the catalogue and the building can never drift apart. If pulling a piece out would cost
you more than it is worth, register the piece anyway and leave the inline copy — say so in your report.

## Rules unchanged
Own only `src/59-civic.js`. One `reseed(N)` at the head, colours from `PAL` only, everything inside the
declared `w x d`. Build, verify both the building sheet and the furniture catalogue, shoot the things
you changed and actually look at them before reporting.
