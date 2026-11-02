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

A program is the shape the Beast Riders' kit writes (`kits/beast-riders/src/79-br-camp.js`, `BR_CAMP[tribe].grounds`):
`{tents: [{key, n, v}], pens: [...], hedge: {key, v, gate}, pasture: {fence, ha}}`. The hedge and the rails come back as
closed loops with gate distances; the host cuts them into the kit's pieces with `BR_RUN`.

## Tests

`node core/camp/test-camp.js`: 15 checks, each with a negative. They cover the census (40 to 70 people at 60 seeds,
households in dwellings, every workshop staffed) and the pitch on the Raptor band's real program and the kit's
declared boxes. The pitch checks are: no overlap, inside the hedge, the chief opposite the way in, the doors facing the
hearth, the pens downwind, the pasture's hectares, a hole in the ground kept off, the horseshoe's mouth, ids stable
across sites, and the same camp from the same input.

## For a host

- Register every record in core/tags before drawing it (88k does: the camp a landmark, its tents and pens children).
- Keep the flora off the camp's ground (88k chains `WORLD.clearHook`). Note that `WORLD.townW` counts what the clear
  hook keeps clear, so a check of the camp's ground has to read it without the camp's own clearing.
- The camp on core/simulation is the host's for now (48k `ISLE_CAMPS.simDeclare`): a settlement of kind `camp`, its
  own walking layer, its places and one actor for each of the census's people. PLAN.md section 7 moves this into
  core/camp with the world tick.
