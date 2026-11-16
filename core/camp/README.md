# core/camp: bands and their camps (KCAMP)

The bands that move, and the camps they pitch. Read `PLAN.md` first: it is the whole design (the bands' wander cycle,
the leaders' camps, raids, caravans, expeditions, the world tick), most of which is not built yet.

**Built (2026-10-26):** the census and the pitch, the first of PLAN.md's phase C1, and their first consumer, a band of
the Beast Riders' Raptor tribe camped in the isle demo's east jungle (`openworld/isle-demo`, 48k and 88k).

Everything here is `[G data]`: no three.js, no DOM, records keyed by stable ids. Read in place, never copied: `KRAND`
(core/rand) and `KSPACE` (core/space). A host passes the band's program and the kit's boxes in, so core/camp reads no
kit's globals.

## The API

| Fragment | What |
|---|---|
| `10-camp-cultures.js` | `KCAMP.CULTURES[culture]`: which of a kit's keys is a dwelling, a sleeping tent, the chief's, the council's, a workshop or a pen; household sizes; who works where; the wind (the pens go downwind); the default formation. One row so far: `beast-rider` |
| `20-camp-census.js` | `KCAMP.census({id, world, culture, program})` deals the program's dwellings to households and the work to the band's adults: `{pop, adults, children, elders, riders, mounts, households, people}`. `KCAMP.tentIds(id, program)` gives every tent and pen its id, `<band>:<key>:<i>`, the same at every site. `KCAMP.seedOf(world, id)` |
| `30-camp-pitch.js` | `KCAMP.pitch({id, world, culture, program, site, dims(key, v), ground: {ok}, way, wind?, formation?, gap?, common?})` lays the camp out as records: the tents in a ring (or a horseshoe) round the hearth, doors in, the chief's pavilion opposite the way in and the trades by it; the pens downwind beyond the ring; the pasture beyond them; the hedge round it all with its two gates and the pasture's rails with one. `KCAMP.check(camp, ground)` counts overlaps, boxes off the ground and boxes outside the hedge. `KCAMP.box`, `KCAMP.overlaps`, `KCAMP.inPoly` |
| `40-camp-work.js` | **Work camps** (PLAN.md 6.5, 2026-11-02): a crew from a fixed yard that migrates through a range of stands. `KCAMP.stands` (the range on a world grid, stable ids), `KCAMP.workCamp`, `workStart`, `workMove` (strike, march, pitch: the op log), `workNext` (the move rule), `workDue` (down to the seed trees), `workLeft` (a stand's timber: what its last visit took, regrown since), `workAt` (the camp at any hour), `workTree` (a tree's stump, sapling or standing state from what the sim took), `workYield` (what the range gives back a day for ever), `workReplay` (the state from the log). First consumer: the isle demo's lumber crew (`settlements/isle-demo` 47h, `openworld/isle-demo` 88h) |
| `50-camp-tents.js` | **Tents by role and culture** (2026-11-09): the plain-data side of the Tents kit (`kits/tents`: culture-neutral defs `tn-<form>-<size>` and a dress per people). `KCAMP.TENTS` (eleven culture rows: each its dress and the def each role takes; trades by trade; aliases), `KCAMP.tentFor(role, {culture, trade, size})`, `tentKey`/`tentParse` (program keys `tn-yurt-m@workshop:smith`), `tentProgram(o)` (a band's program and its culture row, registered for `pitch` and `census`), `tentDims(dims)` (the kit's boxes grown by each role's yard) and `KCAMP.halt(o)`, a caravan's night halt (PLAN.md 4 and 6.2): a `laager` of wagons round the house's pavilion with the gate on the road, or a `line` along it. First consumer: the Tents kit's sheet (a Scyvoi band's ring, an Iziz caravan's laager); its node test is `kits/tents/tests/test-tents.js` |
| `50-camp-outlaw.js` | **Outlaw bands** (2026-11-09, opt-in; no build lists it yet; Mid Basin's Yuni outlaws, the north-western bandits). `KCAMP.CULTURES.outlaw`: a generic war-camp row, every key pending with a box, its default `program`. A row's `band: [min, max]` sizes the census (10-30 here); `KCAMP.census` is wrapped only for such a row, every other row goes to the old census (`KCAMP.census.base`) bit for bit; `empty` lists the tents no one sleeps in; `idle` names what the adults with no workshop do. `KCAMP.lookout` (ranked lookout records: `sees` the road over the heightfield, `seen` from it, against the sky or by its cover), `KCAMP.lookoutAt`, `KCAMP.outlawCamp` (the census, the lookouts, a hidden site near the best one, the pitch with no pasture or hedge, two of the band on each lookout), `KCAMP.dimsOf` |

A program is the shape the Beast Riders' kit writes (`kits/beast-riders/src/79-br-camp.js`, `BR_CAMP[tribe].grounds`):
`{tents: [{key, n, v}], pens: [...], hedge: {key, v, gate}, pasture: {fence, ha}}`. The hedge and the rails come back as
closed loops with gate distances; the host cuts them into the kit's pieces with `BR_RUN`.

## Tests

`node kits/tents/tests/test-tents.js` covers `50-camp-tents.js`: every culture row names the Tents kit's defs and dresses, a band of every row pitched whole on the kit's boxes, both halts (laager and line) for every row, each with a negative.

`node core/camp/test-work.js`: the work camp, 10 checks with negatives: stable stand ids, five years of a crew always fed, every pitch at a stand grown back, no stand under its seed trees, the range sustainable, the camp at any hour, replay and determinism, the trees following what was taken.


`node core/camp/test-camp.js`: 15 checks, each with a negative. They cover the census (40 to 70 people at 60 seeds,
households in dwellings, every workshop staffed) and the pitch on the Raptor band's real program and the kit's
declared boxes. The pitch checks are: no overlap, inside the hedge, the chief opposite the way in, the doors facing the
hearth, the pens downwind, the pasture's hectares, a hole in the ground kept off, the horseshoe's mouth, ids stable
across sites, and the same camp from the same input.

`node core/camp/test-camp-outlaw.js`: 13 checks with negatives: the Beast Riders' census and pitch unmoved by loading
50, bands within their row's size at 200 seeds (crowded in a small program, tents empty in a big one), on a synthetic
valley a skylined crest scored below a point with ground behind it, a covered point unseen, the chosen lookout seeing
the road unseen, and the camp hidden from the road near its lookout.

## For a host

- **An outlaw band** (adopting 50): list `50-camp-outlaw.js` after `40`; call `KCAMP.outlawCamp({id, world, road,
  ground: {h, ok}, cover, box, water})` with the band's road and the ground it may use; register the lookouts (each
  carries its band's id) and the camp's records in core/tags, stand-ins for every `pending` record until a Yuni camp kit
  lands. A kit's own row names the same kinds and sets its own `band`; the bandits of the dam basins take `outlaw` with
  their own band until they have one.

- Register every record in core/tags before drawing it (88k does: the camp a landmark, its tents and pens children).
- Keep the flora off the camp's ground (88k chains `WORLD.clearHook`). Note that `WORLD.townW` counts what the clear
  hook keeps clear, so a check of the camp's ground has to read it without the camp's own clearing.
- The camp on core/simulation is the host's for now (48k `ISLE_CAMPS.simDeclare`): a settlement of kind `camp`, its
  own walking layer, its places and one actor for each of the census's people. PLAN.md section 7 moves this into
  core/camp with the world tick.
