# core/city/cavern: the cavern setting (plan, 2026-11-11)

The owner (2026-11-10, `kits/tungang/PLAN.md` section 5.6): a cavern layout in `core/city` that serves the Tungang holds,
**Dhelv and future Zeijani settlements**. This folder is that setting. It is a new folder no existing page lists, so it
changes no `core/city` file, no page and no golden (the city-layout session, `core-city-nested-squares`, was told before it
landed). Loj Twenny (`settlements/loj-twenny`) is its first user; Dhelv's port is its proof, later (below).

## The rules it keeps (`core/city/README.md`, "Porting a settlement"; CLAUDE.md)

- **Plain records keyed by stable ids**, no three.js and no DOM (`[G data]`): it must run in Godot. `test-cavern.js` checks the
  source for `THREE`, `document`, `window` and `Math.random`.
- **Edits are deltas by id** (`set`, `remove`, `add`), kept in the plan and exported, replayed on a fresh plan from the same
  input to the same digest.
- **Rules are plain functions on records**, each returning its problems: rock between voids, headroom, frontage, grades and
  the step rule, deck alignment, daylight. `audit(H)` runs them all.
- **Occupancy is `KSPACE`** (2D, so every test adds y: "every lookup takes y", Dhelv's lesson).
- **Draws are `KRAND`**, seeded by (world, way, side, slot, salt) through `KRAND.child(world, 'cavern:' + id)`: a slot draws
  the same whatever was placed before it on other ways.

## The frame

Three-dimensional: x east, z south, y up, metres (Dhelv's and the Line's frame). `core/city`'s 2D raster is not used: a
cavern plans a **graph of ways with heights**.

## The records

| Record | Fields | Notes |
|---|---|---|
| node | `id, kind (end, junction, door, mouth, stop), x, y, z, space, on {way, s}` | `on`: a node lying along another way (a siding's junction on the spine), joined to that way's two ends at its distance |
| way | `id, kind (gallery, siding, passage, tube, stair, ramp, shaft, bypass, ledge), a, b, pts [[x,y,z]], w, h, prim, state, deck, band, district, joins` | `prim` is the KCAVERN primitive it carves to; `none` when the host already carved it (the Line's station). `state` kept, worn, abandoned, fallen (a fallen way leaves the graph) |
| space | `id, kind (hall, well, deck, face, platform, chamber), x, y, z, w, d, h, ry, deck, prim, joins` | a hall's box; a well with `prim: 'none'` is open to the sky (daylight) |
| deck | `id, i, y, h (4.5), clear (2.6), name, light` | the Tungangs' bands (PLAN.md 5.2) |
| site | `id, at (wall, floor, shelf, in-void, sunk), key, way, side, s, x, y, z, ry, w, d, h, deck, district, wealth, tier, phase, state, needs, joins` | a `wall` site's origin is the foot of its front on its way's wall, facing into the way (+z local), its box `d` deep into the rock: Dhelv's and the Fellgang kit's frame |
| edit | `{id, op: set \| remove \| add, fields \| rec}` | applied in order; exported |

## The functions

`create`, `addNode`, `addWay`, `addSpace`, `addDeck`, `addSite`, `get`; `wayLen`, `wayAt`, `nearestOn`, `door`, `siteCentre`;
`voids` (every carved box), `index` (KSPACE over them); the rules `rock`, `headroom`, `frontage`, `grade`, `decks`,
`daylight`, `audit`; `graph`, `dist` (Dijkstra, ties by id), `siteDist`, `wealth` (1 at the hub to 0 at `reach`: Dhelv's
rule), `age` (the far end from the heart worn, then abandoned: "a hold moves when its heat moves", PLAN.md 5.3);
`frontageRun` (the step that cuts sites along a way's walls), `nav` (the walk graph: every site's door joined to its way),
`edit`, `applyEdits`, `carve` (KCAVERN's own records: `room {poly, y, h}`, `stair {a, b, w, h}` for ramps and stairs, `tube
{pts, w, h}`, `shaft {c, y0, y1, r0}`; a def's void plan through `o.plan(site)` in the site's frame), `exportPlan`
(`krator-cavern` v1 with the nav graph and the digest), `digest`.

**The strategy: `lineHold(o)`.** A hold is a station on a line (PLAN.md 5.1): a spine (the platform or the way off the Line),
decks 4.5 m apart, sidings off the spine (or off another siding) as streets, a ramp (1 in 9) or a stair (0.7) down or up to a
siding's deck, civic sites placed by hand, frontage runs along the sidings, wealth from the hub, ages from the heart, edits
last. The kit's content (which defs on which siding) is the settlement's data, not the strategy's.

## What the cases need, and where each stands

| Case | How it maps | State |
|---|---|---|
| A Tungang line hold (Loj Twenny) | the spine its platform, sidings as streets, sets as wall sites, decks | built: `lineHold`, Loj Twenny's page |
| A cavern hold (the Hearth hold) | `CAVE.HOLD`'s chambers as `space` records with `prim: 'none'` (the biome carved them), galleries as ways, shelves as `shelf` sites | the records serve; a `cavernHold` strategy to write with that page |
| The Glaziers' scarp | ledges and stairs as ways on an open face (`space` kind `face`), fronts as `wall` sites facing out | the records serve; no strategy yet |
| Dhelv | below | the port is its own task (PLAN.md T2) |

## Dhelv's port (what it will need; not this task)

`settlements/dhelv/src/41-dhelv-layout.js` (`DH`) maps onto the records almost one to one:

- `DH.NODES` -> nodes (`place`, `level`, `exit` kept as extra fields); `DH.EDGES` -> ways (`street`, `tube`, `braid`, `ramp`,
  `stair`, `ledge`, `square`, `door`, `secret`: add `braid`, `street`, `square`, `door` and `secret` to the way kinds, or carry
  Dhelv's kind in `district`/`zone`). `zone` (outer, inner, secret) and `door: 'stonedoor'` are extra fields; the outer-zone
  check reads them.
- `DH.HALL` -> a `space` kind `hall` (its `throat` as a `well` with `prim: 'none'`); `DH.PITS` -> `well` spaces.
- `DH.SITES` -> sites: `at: 'floor' | 'wall'` as here; Dhelv's `ground` (a front standing on the open apron) is a `floor`
  site on a `face` space. `DH.FOOT` is the kit's `w, d` and origin (`front` = a wall site's origin, `centre` = the others').
- `DH.DISTRICTS` -> `H.districts` (anchor node, `needs`, `wealth`); `wealthAt` is `CV.wealth` with Dhelv's reach.
- **What Dhelv adds that this lacks**: KCAVERN `hall` (the bottle hall with its throat and belly) and `pipe` as carve outputs
  (`prim: 'hall'` and `'pipe'` beside room, stair, tube, shaft); the rock-over-tunnel rule (4 m over an 8 m passage) as a
  `cover` rule; the braid's crossing rule (6 m apart vertically: `rock` already finds two crossing tubes, but Dhelv wants 6 m);
  the square's free share; outpost spacing and the palisade's facing (rules on its open apron).
- **Its proof**: Dhelv's placement and layout digest (`tests/golden.json`) unchanged with `DH` built as a cavern plan whose
  sites are placed by hand (`addSite`, as `lineHold`'s civic sites are), its twelve checks moved onto the setting's rules,
  then `CAVERN` removed from `tools/check_core_use.py`.

## Tests

`node core/city/cavern/test-cavern.js` (`--write` rewrites `golden.json` after a meant change), picked up by
`tools/test_all.py`: a synthetic line hold (a 120 m platform, three decks, five sidings including a ramp, a stair and a branch
off a siding, civic sites, frontage runs); every rule, each with its negative; the KSPACE index against an overlap; the walk
graph reaching every door, a fallen siding cutting off only its own; wealth falling along the graph; ages; determinism, the
golden digest and another world's; edits replayed; the export through JSON; the carve as KCAVERN records, **built in KCAVERN**
(every site open at its middle, rock between neighbours, the ramp open under rock); Dhelv's shapes (a hall, a well, a tube,
floor and wall sites, daylight with its negative); the source free of THREE, DOM and `Math.random`.
