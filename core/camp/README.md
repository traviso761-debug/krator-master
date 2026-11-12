# core/camp: bands and their camps (KCAMP)

The bands that move, and the camps they pitch. Read `PLAN.md` first: it is the whole design (the bands' wander cycle,
the leaders' camps, raids, caravans, expeditions, the world tick), most of which is not built yet.

**Built (2026-10-26):** the census and the pitch, the first of PLAN.md's phase C1, and their first consumer, a band of
the Beast Riders' Raptor tribe camped in the isle demo's east jungle (`openworld/isle-demo`, 48k and 88k).
**2026-11-11 (S4, S6 of `core/simulation/PROPOSAL-LONGSONG-PINNACLE.md`):** the beasts as consumers and capacity (50), the
world tick and the hand-over to the sim (C3, C4: 60), caravans (C6: 65) and raids with their balance caps (C7: 66). Their
first consumer is Pinnacle Rock's year (`settlements/pinnacle-rock/tests/test-pr-economy.js`). Not built: the sites from
the rasters (`extract_sites.py`; a culture's host lays a band's range for now), splits and merges, the leaders' camps,
canopy camps, the march as a `SIM.group` in the window, expeditions (C8).

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
| `50-camp-beasts.js` | **Beasts as consumers and capacity** (S4 of `core/simulation/PROPOSAL-LONGSONG-PINNACLE.md`, 2026-11-11): from a culture's beast table (the Beast Riders': `settlements/pinnacle-rock/src/15-pr-tune.js` `PR_TUNE.beasts`, a row per `BR_CAMP` mount and the kept herd), `KCAMP.appetite` (kg a day: by diet x mass^0.75 x the table's `lowG`, the owner's low-gravity payoff of 2/3), `beastNeeds`, `packCap`, `pace` (the slowest beast's), `bandBeasts` (the mounts and a kept herd sized for its share of the meat), `meatPlan` (the hunt's and the herd's shares: the owner's 'both') |

| `60-camp-world.js` | **The world tick and the hand-over** (C3, C4; S6, 2026-11-11): `KCAMP.world(o)` holds the bands, their range sites and the op log; `KCAMP.tick(W, day)` / `run`: each band not handed over eats (its people by the rules' diet, any food for another; its beasts by 50), forages where it is (its hunters, gatherers and kept herd; its grazers' fodder off the ground; its meat-eating mounts hunting beside their riders), strikes a spent site for the best of its range (`nextSite`, a hash for ties), marches home to be there when the home season opens, and at home is handed over (`load`: its stock lands in its settlement's books; `unload`: it comes back out) through the host (`core/region` `H.valleyHost`). `KCAMP.at` (a band's place, pure of the minute), `books` (made + imported - exported - consumed - lost = closing - opening, across the hand-overs), `travel` (by `core/world` `KTRAVEL`'s links, else across country, marked planned), `plan` (the culture's `assign` names a venture), `fits`, `returnTo`, `siteHas` (regrowth, pure of the day), `hashOf` / `u` (a hash with strings named: `KRAND.hash` floors its arguments) |
| `65-camp-trade.js` | **Caravans on land** (C6): `KCAMP.caravan(spec)` a venture kind: to a market and back, a barter there at its prices (`KCAMP.barter`: sell what it offers, buy what it wants, wanted goods first, within its beasts' load and the market's stock), both ends booked |
| `66-camp-raid.js` | **Raids and their balance caps** (C7): `KCAMP.raids(spec)` a venture kind: parties of bands muster at the target and strike together (`KCAMP.resolve`: strength over defence and a hash pick repulsed, skirmish, success or, only for a broken target, sack); the caps (`KCAMP.RAID_CAPS`: 15 % of a good, staples kept above 14 days, 2 % killed, a budget a season, a 30-day cooldown, standing recovering by the week, fatigue, retaliation logged); the loot booked out of the target through the host and into the bands |

A program is the shape the Beast Riders' kit writes (`kits/beast-riders/src/79-br-camp.js`, `BR_CAMP[tribe].grounds`):
`{tents: [{key, n, v}], pens: [...], hedge: {key, v, gate}, pasture: {fence, ha}}`. The hedge and the rails come back as
closed loops with gate distances; the host cuts them into the kit's pieces with `BR_RUN`.

## Tests

`node core/camp/test-world.js`: the world tick, the hand-over and the caravans (S6), 8 checks with negatives on
`world-fixture.js` (six bands of Pinnacle Rock, two years, a plain host for the sim): every band home every day of the wet
season and out every day of the dry, each in its own range, none starving, the sites regrowing, the books balancing across
every hand-over, a replay from a save writing the same log, a band's place pure of the minute, every barter booked at both
ends within its beasts' load.

`node core/camp/test-raids.js`: the raids' balance proof (C7), 6 checks: ten years from three seeds, no target sacked or
broken, every target's people within 10 %, raided goods under 2 % of what was made, every raid within its caps, the
budgets and the cooldown kept, the raiders paying for a repulse; the negatives the same decade with the caps off.

`node core/camp/test-beasts.js`: the beasts (S4), 7 checks with negatives: a row for every mount, the raptor's ~2.7 kg of meat a day (a third under a full ~4), the one cut on every kind, the diets, the floor's ~90-110 t of meat a year and the grazers outeating their pens, the kept herd sized for its share, a train's pack and pace.

`node core/camp/test-work.js`: the work camp, 10 checks with negatives: stable stand ids, five years of a crew always fed, every pitch at a stand grown back, no stand under its seed trees, the range sustainable, the camp at any hour, replay and determinism, the trees following what was taken.


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
