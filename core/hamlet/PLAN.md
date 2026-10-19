# core/hamlet: the hinterland settlements module (plan, 2026-10-18)

A core module that makes the small settlements round a town: **resource villages** (salt, mining, lumber, ranching)
and, by the same machinery, **fishing and farming villages**. Placing a village also places what it works, on the map.
The first case is the isle demo (`settlements/isle-demo/PLAN.md` section 8): four villages in the hinterland of
Kautoa and Valapo. Nothing is built yet; this is the plan for the owner to settle.

**Why a core module.** `core/city/README.md` ("Debts") lists the country (lanes, villages, farmsteads, fields) as an
add-on still inside Voth (`VC.village`, `VC.farmstead` in `settlements/voth/targets/voth-city/33-vc-country.js`). Every
settlement will want a hinterland, so it is written once. It reads core/city's primitives in place (`KCITY.prim`:
`frontageRun`, `packPolygon`, `clearSpot`, `faceNearestStreet`) and does not edit `core/city`. **It is its own
module, `core/hamlet`** (owner, 2026-10-18), not part of `core/city`.

**Small settlements in general.** The name is `hamlet`, not `hinterland`, because the same machinery is to make
other small settlements later. **Nomadic camps** are the first named: a camp is a village spec with tents for houses,
no warehouse but a cache or the herd itself, and a site that moves with the season (the nomad kits,
`kits/desert-nomads`, `kits/ash-nomads`). So the spec's parts are kept separate: what it needs (the required
buildings), how big it is (the census), how it is laid out (green and lanes, or a ring of tents), and where it sits
(fixed, or a route of sites). A camp swaps the layout and the siting and keeps the rest.

**The Godot rule** (as `core/city`'s): the data side is free of three.js and the DOM, `[G data]`. Records are keyed
by stable ids, edits are deltas by id, and the rules are plain functions on records. Placement draws from `core/rand`
(`KRAND`, a hash of world, village, index and salt), and overlap goes through `core/space` (`KSPACE`). Everything
placed is registered in `core/tags` before it is drawn.

## 1. A village

```
KHAMLET.village({
  id, world, seed,
  culture,        // a culture row (section 3): which kit's buildings, which religious and civic building
  focus,          // 'salt' | 'mine' | 'lumber' | 'ranch' | 'fishing' | 'farming'
  site,           // {x, z} the village point, or a polygon to choose it in (section 4)
  resource,       // the resource record it works (placed with it, section 2), or a polygon to place one in
  parent,         // the town it sells to (a settlement id): its goods go there
  link,           // the road or landing it joins (a highway point, a jetty)
  popMax          // default and ceiling 500
}) -> {id, records: [buildings, lanes, works, fields], resource, census: {pop, workers, households}, sim}
```

**Every village has:**
- **1 religious building** and **1 civic building**, chosen for its culture (section 3);
- **a general store and a food store;**
- **at least one warehouse**, by the road or the landing (the goods leave from it);
- **the works for its focus** (section 3), sized to the resource;
- **housing for the people who staff all of it**, and their households.

**Sizing (population at most 500).** People follow the work, not the other way round:
1. The works' jobs come from the resource: its capacity (section 2) divided by a worker's output (`RES_ORE.works`'
   0.05 lots a worker-hour at grade x1 for a mine; a table per focus for the others), within the works' own cap.
2. The services' jobs are fixed: a priest, two storekeepers, warehousemen per warehouse, a headman or clerk at the
   civic building (about 8 to 12 jobs).
3. Population = jobs / the working share (a tunable, about 0.45 for the isles), in households of the culture's size
   (about 4.5). Above 500, the works' jobs are cut until it fits; the resource is then worked below its capacity, and
   the books say so.
4. Houses are drawn from the culture's house list by wealth (most poor or middling, the headman's a cut above),
   enough for every household.

**Layout:** the green and its buildings first, then lanes out, then houses, then the works.
- A **green** (or square) holds the civic and religious buildings facing each other. A well stands on it, as
  `VC.village` has it.
- **Lanes** run out from the green: two to four, toward the works, the road and the landing.
- **Houses** front the lanes (`frontageRun`), with gardens behind. The infill uses `packPolygon` when a lane fills up.
- **The works** stand at the resource's edge. **The stores** stand on the green or the road lane, and **the
  warehouse** at the road or landing end.
- The village is turned to face its link and squared to the slope. It refuses ground steeper than the culture's
  limit (the stilt-house cultures take more) and keeps off cliff faces.

## 2. Resources on the map

Generating a village places the resource it works if the map has none in reach. A resource is one of four shapes,
all `[G data]` records in `kits/resources`, which already holds the ore nodes:

| Shape | Kinds | Record | Placed where |
|---|---|---|---|
| **node** (a point) | iron, copper, gold, tin, silver, rare earth, coal, sulfur, saltpeter, oil (`RES_ORE`, built) | `{id, kind, grade, x, z}` | uplands and scarps for ores; geyser fields for sulfur; owner-placed nodes win over seeded ones |
| **field** (an area) | salt pan, pasture, fishing ground, farmland | `{id, kind, grade, poly, capacity}` | by climate class and zone (below) |
| **stand** (the trees) | timber, fuel wood, poles | no new record: the biome's own tree records, read by their `harvest.wood` tag | wherever the biome grows them |
| **water** | fresh water (a well's or a spring's) | `{id, x, z, yield}` | every village has one; a later pass |

**Fields come from the biome kits: one `gather` tag** (owner, 2026-10-18). The biome code that makes a piece of
ground says what can be gathered from it, as the trees' `harvest.wood` says what their wood is good for:

```
gather: {pasture: 0..1, fish: 0..1, salt: true}     /* on a zone, or on the code that draws a feature */
```

- **Pasture goes on every zone with a decent understory** (owner, 2026-10-18): ground cover that stock can graze.
  - The weight follows the zone's floor: grass, herbs and low shrub cover. Closed canopy, bare sand, rock, salt crust
    and the strand score little or nothing.
  - Examples on the isles: Aw and XV savanna high, BSh steppe middling, the open edges of the forest some, closed
    rainforest none.
  - A floor plant that is good forage carries a matching `forage` harvest tag, so the weight can be checked against
    what the floor actually grows.
- **Fishing grounds are zones of their own** (owner, 2026-10-18), designated where real fishing is good: **reefs,
  estuaries and river mouths, lakes**, and the like (lagoons, mangrove channels, kelp beds, shoals and banks, the
  shelf edge).
  - Each is a `fish` zone in the kit that draws that water, with `gather.fish` its catch: what a canoe can take in a
    day.
  - On the isles: the reef crest and lagoon, the mangal, the river mouths of the open world's drainage, and the shelf.
  - Lakes and rivers inland count too, in the kits that draw them.
- **Salt** goes on the salt pan code itself (`gather.salt: true`) in every biome that draws pans. That is ringisles'
  XS pans, eastabyss and rift for certain; H1 audits the other kits that mention salt (sedesert, crater-drylands and
  others), so a pan is tagged wherever it is drawn.
- **The module reads the tag, never a kit's zone names.** A field's capacity is the tag's weight at each cell, through
  the kit's own `zones()` (`RINGISLES.zones` for the isles), so any kit that tags its ground can host a village.
- **For salt, the grade comes from the rain:** drier is better. The scale model's XS class marks where the isles'
  pans are.
- **Wiring is an edit to each kit:** ringisles first, then swbay, the Throne's savanna, eastabyss and rift. A kit with
  no tag simply offers no field of that kind.
- **Timber: the trees' `harvest.wood` tag**, which every biome species already carries as free text. Examples:
  `timber`, `light timber`, `timber, pitch`, `fuel`, `fuel, posts`, `poles`, `thatch`, `fibre`, and `none` on 304 of
  them.
  - The module reads that text through one fixed list of uses (`KHAMLET.woodUse(text) -> {timber, fuel, poles,
    thatch, fibre}`), so the books count a good, not a phrase.
  - A word the list does not know fails `verify` (the tags-vocabulary check's pattern) rather than being dropped.
  - A lumber village's stand is the trees within its felling radius whose use includes `timber` (a sawpit and log
    yard); `fuel` trees go to a charcoal kiln.
- **Fishing grounds:** the `gather.fish` water within a canoe's day of the village's landing.
- **Farmland:** the crops the place can grow (`CROPS.at` with the climate, rain and height at the site), in fields
  round the village. These are the farm ring that P6 left outside the planner square.

**Timber regrows (owner, 2026-10-18).** For now timber is effectively infinite: a felled tree regrows after **one game
year**, so the owner can watch how it behaves and adjust.
- The open world's trees are records made from a hash of their tile, so felling one is **a delta by id**:
  `{tree id, felledAt}`, kept in the village's edits (`core/edits`).
- **The deltas live only while the game runs** (owner, 2026-10-18). They are not written to the world or the export
  until a save system exists, so a reload starts every forest whole. Godot keeps them the same way.
- While the delta is under a year old, the drawing shows a stump, then a sapling (the kits' immature level). Past a
  year the delta is dropped and the tree is whole again.
- **The regrowth time is a tunable** (`TUNE.hamlet.regrowDays: 365`). Setting it per species later (fast bamboo,
  slow hardwood) changes nothing else.
- **Nothing runs out for now** (owner, 2026-10-18). Nodes never run out (kits/resources, as now), and **pasture and
  fish are effectively infinite** too: a field's `gather` weight sets how many can work it, not a stock that drains.
  Salt pans the same. Depletion, if it comes, is a tunable added later, as timber's regrowth is.

## 3. Cultures and the works

A **culture row** is plain data, one per building kit, so a Voth or Iziz hinterland takes another row and the same
code:

```
KHAMLET.CULTURES.islander_east = {
  kit: 'islanders', household: 4.5, workShare: .45, slopeMax: .35,
  religious: 'ip-shrine',  civic: 'ie-hall',       /* village scale: section 6 */
  general: 'ie-trader',    food: '(new: ie-store-food)', warehouse: 'ie-warehouse',
  houses: {poor: ['ie-hut-garden', 'ie-house-shared'], middling: ['ie-house-cross', 'ie-house-long'], head: ['ie-house-chief']},
  works: {
    salt:    ['ie-saltworks'],
    mine:    ['ie-mine', 'ie-sulphur'],
    lumber:  ['(new: sawpit and log yard)', '(new: charcoal kiln)'],
    ranch:   ['ie-byre', 'ie-pens', '(new: corral)', '(beast rider: stable, rookery)'],
    fishing: ['ie-fishdock', 'ie-canoeshed'],
    farming: ['ie-farm', 'ie-granary']
  }
}
```

**The Islanders kit has most of this.** It lacks:
- a sawpit and log yard;
- a charcoal kiln;
- a corral; and for the riders' mounts a **stable and a rookery**. These are the Beast Rider set's, `kits/beast-riders` (planned with P6, after the owner's three textures), lent to the Islander village as Ridertown borrows them;
- a small food store;
- village-scale variants of the hall and the temple, if `ie-hall` and `ie-temple` are too big for 500 people;
- a bloomery or smelter, which Valapo's harbour needs anyway (section 8b).

**The owner wants the texture list before a build**, so H3 starts with that list in `core/materials/PROMPTS-NEEDED.md`.
Most of these should take the kit's own wood, thatch and earth sets.

## 4. The isle demo's four villages

Taken from the region survey (`settlements/isle-demo/PLAN.md` 8c). World coordinates are metres, x east, z south.
The climate grid is 2 km a cell, so a site is placed exactly at generation, within its patch.

| Focus | Patch | Centre (world) | From its town | Parent | Notes |
|---|---|---|---|---|---|
| **salt** | XS salt steppe, the big north-west pan, 268 km2, ~700 mm | (-14,800, -107,800) | 71 km north-west of Kautoa | Kautoa | the owner's choice (2026-10-18): the bigger and drier pan, so the better salt. Salt and soda ash become Kautoa's; Valapo's southern pans (136 and 64 km2) stay unworked for now |
| **mine** (iron) | Valapo's mountains, 700-1,130 m | about (-18,000, 66,000) | 12-18 km south-west of Valapo | Valapo | the iron node (`kits/resources`) placed with it; ore carted down to the smelter at Valapo's harbour |
| **lumber** | the wettest jungle (XA), 596 km2, ~2,750 mm | (74,700, -43,000) | 41 km east of Kautoa | Kautoa | hardwood for Kautoa's shipyards. Valapo's charcoal comes from its own upland forest |
| **ranch** | savanna (Aw), 428 km2, ~890 mm | (20,100, -117,100) | 61 km north of Kautoa | Kautoa | on the north highway toward beast rider territory; buffalo, pigs and hides, and **some beast rider mounts** (owner, 2026-10-18), with their stable and rookery, and perhaps mounts |

**Later, by the same calls:**
- **fishing villages** along Kautoa's east and west coast highways (8a);
- **farming villages** round Kautoa's peninsula, where the farm ring needs more land than the city's edge.

Each one is a spec row, with no new code.

**Populations.** Kautoa is about **6,300** and Valapo about **2,150** (the owner's figures, 2026-10-18; P6's census
has 4,900 and 1,540, and is to be re-tuned to these). Each village is at most 500, so the four come to about 1,000 to
2,000 people.

## 5. The village in the sim

Each village is a **settlement** in `core/simulation`, with its parent named. The settlement key is P7a in the isle
demo's plan (section 9).
- Its works are producers, its warehouse a store, its people actors with homes and jobs in the village.
- **Its goods go to the parent** by cart on the road, or by canoe from the landing. They are the same stop-to-stop
  carrier as the towns' trade (P7a item 6), so nothing new is needed for it.
- A village is far from the camera nearly always, so it runs at **the abstract level**: books and carts tick, nobody
  is posed. That makes it a cheap, early case for the abstract-level week test.
- Felling, mining and salt-raking write to the resource's record: a stand's deltas, and a node's or field's worked
  share, so the books and the map agree.

## 6. Order of work

| Step | What | Proof |
|---|---|---|
| H0 | This plan; the owner's answers (section 7) | — |
| H1 | **Resources:** the field shape in `kits/resources` (`[G data]`); the `gather` tag (pasture, fish, salt) wired into ringisles, then swbay, the Throne, eastabyss and rift, with an audit of every kit that draws pans or fishing water; `KHAMLET.woodUse` over every biome's `harvest.wood` | `node` test: every `harvest.wood` text parses and every `gather` key is known, each with a negative; a field's capacity from known tag weights; kits' `verify.py --assert` unchanged except the new tag |
| H2 | **The village generator** (`core/hamlet`, `[G data]`): spec to census, siting, green, lanes, houses, works and stores, on `KCITY.prim`, `KSPACE`, `KRAND`, `core/tags` | `node core/hamlet/test-hamlet.js`: every village has its required buildings; population ≤ 500 and staffed (every job a worker, every household a house); no overlap; deterministic (same spec, same hash); refuses a cliff site; each with a negative |
| H3 | **The Islanders' missing buildings** (section 3), after the owner's textures | islanders `verify.py --assert`; a sheet shot per new building |
| H4 | **The four isle villages** placed on the open world from their specs, with their resources; timber regrowth as deltas | the isle world's checks in the browser pane; a felled tree is a stump, then a sapling, then whole after the tunable |
| H5 | **The villages in the sim** once P7a lands: settlements with a parent; goods to the parent's books | a load traced from a village's warehouse to its town's; the abstract-level week balances for each village |
| H6 | **Fishing and farming villages** round Kautoa from spec rows | the same tests; the farm ring's crops match `CROPS.at` at each site |

## 7. Questions for the owner

Settled (owner, 2026-10-18):
- **The salt flats:** the big north-west pan near Kautoa (section 4).
- **Where the module lives:** its own core module, `core/hamlet`, kept general enough for nomadic camps later.
- **The ranch** keeps buffalo, pigs and some beast rider mounts, with a stable and a rookery (section 3).
- **Pasture** goes on every zone with a decent understory; **fishing grounds** are zones of their own where real
  fishing is good (reefs, estuaries, lakes and the like). Both are effectively infinite for now (section 2).
- **Felled trees** are kept only while the game runs, until a save system exists (section 2).

Still open: the starting `gather` weights per kit and zone, proposed in H1 for the owner to adjust.
