# rift: the stations (plan, draft, 2026-10-27)

**The Rift rebuilt as stations.** The owner (2026-10-27): stop the single-page rebuild; the Rift is to be stations:

1. **the rift savannah**;
2. **the rift jungle**;
3. **the temperate highlands / cloud forest**, with at least three divergent families of upland plants, reflecting their
   status as **air-pressure and temperature islands**;
4. **Cube's plateau** (added by the owner with the answers, 2026-10-27).

For station 3 the owner adds: draw the upland plants from `biomes/riftrim/PLAN.md` section 3 (its three rims' flora) and from
this kit's own highland sketch (the cloud forest and ridgetop species in `src/`, `KNOWN_ISSUES.md`'s highland note), as
**ancestors or cousins, not copies**: each sky-island family is its own lineage that diverged from them, with its own form,
colour and habit, shaped by its altitude and pressure band; `BIO.kin` where a cousin is close; each species' relative named.

**Status: plan, answered by the owner (2026-10-27); nothing built.** The answers: retire the old page; the transect (the map:
`PLAN-STATIONS-map.png`); station 2 at the Lizardmen river 3's mouth; station 3 below riftrim (section 5, A); **a station 4, Cube's
plateau**; the four families, with the sketch's understorey kept under them and diversified island by island; sister records for
**three islands now, west, central and east**, the east one being station 4's plateau; the abyssal-savannah cousins taken; the feral
three as placed. Wherever this file still says *proposed*, the owner has not decided.
The single-page rebuild that was under way is parked, unmerged, on `claude/rift-single-page-experiment` (commit 6f229841f,
"ABANDONED EXPERIMENT"; section 9 says what in it the stations can lift).

## 0. What the kit becomes

| | |
|---|---|
| Folder | `biomes/rift/` as now, plus `stations/` (the Throne's way: `python3 build.py --station <name>`) |
| Pages | `dist/rift-savannah.html`, `dist/rift-jungle.html`, `dist/rift-highland.html`, `dist/rift-plateau.html` (*proposed* names). The old ideal-type page (`dist/rift.html`) is **retired** (the owner) when station 2 lands |
| Object | `RIFT` on the `BIOME-API.md` contract, unchanged for its readers: `RIFT.build`, `RIFT.make`, `RIFT.grow`, `RIFT.SPECIES`, the species **indices 0-33 kept** (ringisles plants the Rift's species by `RIFT.make(sp, ...)`; Hook and the open-world pages read the kit in place, `HANDOFF-REBUILD.md` section 5). New species are appended (34 on) |
| Zones | the five climate fields stay the kit's interface (wet, salt, upland, flow, mist); each station binds them from the model's ground at its site instead of the ideal-type map, and adds two: **`air`** (the pressure, atm, from height) and **`island`** (which massif a point stands on, for the sky-island lineages: section 4) |
| Read in place | `biomes/abyssal-savannah` (station 1's cousins, by `BIO.kin`), `biomes/riftrim` once it is built (station 3's ancestors; until then the Rift's own sketch species stand in: section 5) |

## 1. The ground (scale model 4.23, surveyed 2026-10-27)

The map, `PLAN-STATIONS-map.png`: the `rift` polygon coloured by the model's climate classes over its relief, the 0 / 1,000 /
2,000 m lines, rivers and seas, the settlements, the three islands, Cube's plateau (pink) and the four sites; below, the central
island and the plateau at seven times the scale.

Read from the live Krator Scale Model (4.23; its `DATA` and `regions` / `settlements` collections) with
`tools/scale-model/extract_region.py <page> <regions> <settlements> "rift" <out>`. Air is `1.6 * exp(-h / 8000)` atm, the
extract's own rule (`region.json` `pressure`), as the earlier surveys used.

**The `rift` biome polygon** (px 163-615 by 1054-1314): 204,600 km², of it 49,700 km² water (the terminal seas at
-2,600 m, Cleft Lake's chain), 154,800 km² land.

| Band | km² | Air | Rain (median) | Mean | Classes |
|---|---|---|---|---|---|
| under -2,000 m | 20.4k | 2.33 atm | 1,616 mm | +35 °C | XA 66%, XV 32% |
| -2,000 to -1,500 | 24.0k | 1.99 | 1,239 | +30 | XV 58%, XA 39% |
| -1,500 to -1,000 | 25.7k | 1.87 | 1,176 | +28 | XV 43%, XA 27%, Aw 17%, Af 6% |
| -1,000 to -500 | 20.4k | 1.76 | 1,145 | +25 | Aw 33%, Csa 28%, Af 18%, Cfa 10% |
| -500 to 0 | 19.3k | 1.65 | 1,176 | +23 | Csa 52%, Cfa 38% |
| 0 to 1,000 | 17.1k | 1.50 | 925 | +19 | Csa 75%, Cfa 23% |
| 1,000 to 2,000 | 12.7k | 1.33 | 894 | +15 | Csa 64%, Csb 16%, Cfa 13% |
| 2,000 to 3,000 | 9.9k | 1.17 | 847 | +10 | Csb 67%, Csa 12%, Cfb 10%, Dsb 7% |
| 3,000 to 4,000 | 5.3k | 1.03 | 847 | +5 | Dsc 43%, Dsb 35% |

- **The floor is two biomes on the model's own classes**: **XA** (abyssal jungle, 38,800 km², median -1,683 m, 2,086 mm,
  +30 °C, centred about px 457,1230) and **XV** (abyssal savannah, 45,300 km², median -1,457 m, 1,019 mm, +29 °C, centred
  about px 390,1188). They interleave on the floor: XA round the seas and up the wet north-west faces, XV on the drier
  benches and the lee sides.
- **The highlands are islands.** Above 1,000 m the land breaks into **31 separate massifs** that rise out of the floor, besides
  the walls (which run up into `rift rim N` and `rift rim S`, riftrim's ground). The largest: px 529,1309 (6,136 km² above
  1 km, peak 3,773 m), px 264,1175 (5,008 km², 3,464 m; its summit cap above 3 km 576 km², Dsc 79%, 1.07 atm), px 292,1091
  (4,972 km², 3,521 m), px 207,1111 (2,108 km², 3,880 m); and many small ones of 300-500 km² at 2-2.7 km. Between them the
  floor lies 3-5.5 km lower at 1.9-2.3 atm and +28-36 °C.
- **Settlements in the polygon**: Sauropolis (city, px 493,1266, on the terminal sea), the villages Gila (381,1155), Tuatara
  (546,1224), Komodo (593,1287); the ruined arcologies Cube (448,1237), Cthonos (254,1173), Chimes (196,1062); The Tubes
  (cavern, 336,1217). Rivers: Chimes Riba and the Rift rivers from the west head, the Lizardmen rivers (1-5) into the
  terminal seas.

### The four sites (settled 2026-10-27; the map is `PLAN-STATIONS-map.png`)

Stations 1 and 3 stand on **the central island**, the savannah on its dry lee and the cloud forest on its face; station 2 is at the
**Lizardmen river 3's mouth** on the terminal sea (the owner), at the western foot of **Cube's plateau**, which is station 4. The
wind is the north-westerlies (the model's).

| Station | Site (px) | Height | Air | Rain | Mean | Class | What is round it |
|---|---|---|---|---|---|---|---|
| **1. The rift savannah** | **368,1166** | -1,523 m | 1.94 atm | 784 mm | +28 °C | XV | the central island's dry south-east lee foot; relief -2,000 to -190 m within 7 km; water 6 km off; Gila's lake (Lizardmen river 5 ends in it at -1,752 m, px 372,1144) to the north |
| **2. The rift jungle** | **420,1248** | -1,436 m | 1.91 | 4,000 (the model's ceiling) | +29 | XA | the Lizardmen river 3's mouth on the terminal sea (-2,600 m, 2 km off): the old page's algal shore and stream mouth on the model's own sea; relief 1.4 km within 7 km; the scarp of Cube's plateau to the east, 56 km on to Sauropolis |
| **3. The cloud forest** | **356,1163**, the face from ~1.2 km to the summit | 1,000-2,058 m | 1.37-1.24 | 1,765 (1-1.5 km), 1,545 + fog (1.5-2 km), 1,961 at the top | +16 to +12 | Cfa, Cfb | **the central island** ("the cloud island"): 400 km² above 1 km, Cfb 72% from 1.5 km; its lee (px 362,1168, 459 m) is Csa at 471 mm: a wet face and a dry back |
| **4. Cube's plateau** | **448,1240**, round the ruin | -263 m (median; -700 to -60) | 1.65 | 1,396 | +22 | Cfa 69%, Csa 28% | a table of 3,600-5,000 km² (px 427-464 by 1197-1271) standing 1.2-2.3 km over the jungle floor round it; **Cube** (ruined arcology, px 448,1237) on its middle; its west scarp falls to station 2's river mouth |

**The three islands** (the owner: "east, central and western for now"):

| Island | Where | Height, air | Climate | Station |
|---|---|---|---|---|
| **West** | the western massif, px 264,1175 (Cthonos on its flank) | 1-3.5 km (5,008 km² above 1 km; a 576 km² cap above 3 km), 1.37-1.07 atm | ~850 mm, Csb, Dsc on the cap: the tallest and coldest | none yet: records only, seen on the horizon from station 3 |
| **Central** | the cloud island, px 356,1163 | 1-2.06 km (400 km²), 1.37-1.24 atm | wet face (Cfb, ~1,800 mm and fog), dry back (Csa, 471 mm) | **3** (and 1 at its foot) |
| **East** | Cube's plateau, px 448,1240 | -0.7 to -0.06 km (3,600-5,000 km²), ~1.65 atm | Cfa, ~1,400 mm, +22 °C: the lowest and warmest, an island of milder air rather than of cloud | **4** |

The other massifs (the dry twin at px 392,1189, the north wall's spurs, the 28 more over 1 km) wait for the open world.

## 2. What each station shows, and how they differ

| | 1. The rift savannah | 2. The rift jungle | 3. The cloud forest | 4. Cube's plateau |
|---|---|---|---|---|
| **Air** | 1.94 atm, +28 °C, hot and still | 1.91 atm, +29 °C, saturated | 1.24-1.37 atm, +12-16 °C, cloud most days | 1.65 atm, +22 °C, humid, breezy at the rim |
| **Ground** | a lee bench under the island's dry back: grass plains, a dry wash, kopje-like tors of the island's rock, the salt rim of Gila's lake | the river's mouth on the terminal sea: the algal shore, the delta's channels, the plateau's scarp rising to the east | the face: benches and buttresses from 1.2 km to the summit, gullies and falls, the crest | a rolling table, its streams going over the scarp's edge in falls; Cube's ruin in the middle; the jungle floor 1-2 km below at the rim |
| **The look** | **gold and violet, open**: wide grass, scattered giants, the island standing over it in its own cloud cap | **teal and violet, closed**: the frill trees' columns, the sea's yellow water, the scarp disappearing into haze overhead | **green, grey and white, small**: elfin forest dripping in fog, cushions and rosettes on the crest, the hot floor seen through gaps far below | **green and copper, middling**: a warm temperate forest of the families' low forms and the old stock, the ruin's towers over it, the hot floor a blue gulf off every edge |
| **Scale** | giants spaced out (baobabs, monkey-puzzles); the island's 3.6 km rise in the background | the tallest trees on the map (frill trees to 140 m) | nothing over 25 m; the crest's heath knee-high | trees 20-40 m: between the floor's giants and the cloud forest's elfin wood |
| **The kit's species** | the savannah's (section 3) | the jungle's and the shore's (section 3) | the central island's families (section 4) | the east island's families and old stock (section 4), the jungle's upper fringe |
| **What links them** | the central island seen from its floor; station 2's river climbs to station 4's plateau by the scarp's falls; the jungle species reach up every face to ~1 km, and a few upland species come down the gullies (section 4, ranges) |||

## 3. The flora of the floor (stations 1 and 2)

Mostly the Rift's existing species, sorted to where they belong, with the feral three (the owner's earlier ask, 2026-10-27:
"flora inspiration can also pull from xanadu but it must become an angrier, more feral version", built on the experiment branch).

**Station 1, the rift savannah** (XV, ~800-1,200 mm):
- **The Rift's**: baobab, monkey-puzzle, Rift acacia, dragon tree, tree aloe, purple fan shrub, candle stalk, Rift croton,
  pinecone succulent; the floor's dry grass, Vain fronds, purple and orange heath, termite spires; the dry wash.
- **Feral, from Xanadu**: the **blade pear** (Xanadu's prickly pear and pitaya: pads on pads, every rim bristling with hooked
  spines), on the benches and the tors.
- **Cousins from the abyssal savannah** (`biomes/abyssal-savannah`, the eastern abyss's XV, the same class and air), by
  `BIO.kin` (taken: the owner, 2026-10-27): its **thatch grass** (the dense air's tall grass, here in the Rift's gold-violet), its **ember lily**
  after a burn, its **burn mosaic** (`ABSAV.burn`) for the grass's ages. The two abyssal savannahs then read as one class
  with two floras, as the model has them.
- The kopje-like tors take the dragon trees and the tree aloes; Gila's lake rim the glasswort and the salt crust.

**Station 2, the rift jungle** (XA, 4,000 mm):
- **The Rift's**: frill tree, bell palm, lobe tree, trumpet tree, pagoda tree, curl succulent, prism bush, carrot frill,
  violet dome tree, parasol tree, anemone stalk, Rift croton; the floor's iridescent rosettes, zebra bromeliads, prism ferns,
  tongue succulents, honeycomb barrels, ball vines, scale-moss, anemones, urchin blooms, fallen frills; the shore's glasswort,
  algal mats, stromatolite domes and scum; the lake's yellow (`RIFT_LAKE.hue`).
- **Feral, from Xanadu**: the **maw trumpet** (Xanadu's lotus trumpet: cups with saw-tooth rims curled in like a jaw, hooked
  claws, barbed hanging tendrils) on the shore and in the stands; the **thornwhip** (Xanadu's serpent stalk: writhing black
  stalks studded with hooked thorns, forked hooks over red spined heads) in the wet understorey.
- **Up the plateau's scarp** (to ~-700 m, 1.75 atm, the jungle's upper edge): the jungle species thin out and shrink; the frill
  tree stops first (its 140 m column needs the floor's air: section 4).

The feral three as placed here are agreed (the owner, 2026-10-27).

**Station 4, Cube's plateau** (Cfa, 1,400 mm, 1.65 atm, +22 °C): the **east island's** forms of the four families and of the old
stock (section 4: the low end of each lineage, in air too thick and warm for cloud), with the jungle's species climbing the scarp
to its rim and stopping there; the ruin's ground (the arcology's site is the settlement work's: the station draws its
surroundings and the ruin as it stands, its own build is not this kit's).

## 4. Sky-island lineages (stations 3 and 4)

### Why the islands are islands

Each massif is cut off from the next by 50-200 km of floor at 1.9-2.3 atm and +28-36 °C. For an upland plant that floor is a
sea: its seeds land in heat that kills them, its pollinators (small, cool-adapted fliers) do not cross it, and its spores are
washed down by the floor's rains. So each island's upland flora has been alone since the islands' climates parted from the
floor's, and has diverged in place: **sky-island endemism**, as on the Madrean sky islands of Mexico and Arizona (each range
its own pines, oaks and snails), the tepuis (each table its own pitcher plants and bromeliads) and Kinabalu (its own
pitcher plants and rhododendrons in each band of the mountain). On Krator the barrier is **pressure as well as heat**, and so
are the bands up each island.

### How pressure and height set range and form (*proposed* rules, for the builders and the zones)

| Band (on the cloud island) | Air | Mean | What the air does | What it makes |
|---|---|---|---|---|
| **The floor** (under 0 m) | 1.6-2.3 atm | +23 to +36 | dense, hot, CO₂-rich (its partial pressure ~1.9 times Earth's); still | the giants: fast growth on rich CO₂, huge thin leaves, columns 100 m+ (the frill tree) |
| **A. The cloud foot** (1.0-1.5 km) | 1.37 atm | +16 | the lifting air cools to its dew point: the cloud's base; CO₂ ~1.35 times Earth's | trees to 25 m, the floor's forms half-sized; broad leaves, drip tips |
| **B. The cloud core** (1.5-1.9 km) | 1.29 | +13 | immersed in cloud most days, fog-drip doubles the rain; little sun | elfin forest 6-15 m: crowded, leaning, everything mossed; leaves and fins that **comb the fog** |
| **C. The crest** (1.9-2.06 km) | 1.21-1.24 | +12, frost on clear nights | above the cloud on clear days: strong sun, UV, wind, big day-night swings (thin air holds less heat) | knee-high cushions and rosettes, dark and furred against the cold nights and the UV; pressed to the ground against the wind |
| **The lee** (the island's south-east back) | 1.3-1.5 | +15-18 | dry: the cloud never reaches it (471 mm) | the dry face's scrub and pines |

The rule a builder reads (*proposed*): a species' record carries its **band** (`air:[lo, hi]` atm) and the zones weight it by the
station's `air` field, so a species grows only in its band; with height its **size** falls by the band's factor (the air's CO₂ and
warmth), and its **form** is the family's answer to that band's problem: fog (B), cold nights and UV (C), drought (the lee).

### The families (four: settled, the owner 2026-10-27)

Each family is one lineage, diverged on the islands from an ancestor that still grows on the floor or on the rims. On the
station (the cloud island) each holds its own band; on every other island each family has a **sister species** of its own
(the islands' vicariance: section 4, last table), drawn when those islands are drawn (the open world, or later stations).

**Family 1: the mantle palms** (band A, the cloud foot). *Ancestor*: the **bell palm** (the floor's; `rift.bellpalm`), whose
upland cousin the sketch already had (the cloud bell palm, `rift.cloudbell`). On the islands the bells of pleated fans have
**closed into hoods**: each tip a hood of overlapping pleats that sheds the drip outward and keeps the bud dry; the pleats furred
with fine hairs; light sage green with the old teal only under the hood.

| Key | Name | Relative | Form, colour, habit | How |
|---|---|---|---|---|
| `mantlepalm` | **Mantle palm** | bell palm (ancestor), cloud bell palm (cousin) | 12-22 m, a pale ringed trunk forking twice, each tip a **hooded bell** of furred pleats that droops after rain; sage green, teal inside; the band's canopy | **`BIO.kin('rift.cloudbell')`** for the size and colours, with a new habit field read by the bell builder (`hood`: the fans' tilt past the vertical and a closing fan on top), a few lines in `B[1]` |
| `hoodlet` | **Hoodlet** | mantle palm (sister, the shrub form) | 2-5 m, one hood on an unforked stem, in the gullies' drip | `BIO.kin('rift.cloudbell', {scale:.2, forks:0, hood:...})` |
| `cloudlobe2` *(name open)* | **Drip lobe** | cloud lobe tree (cousin), lobe tree (ancestor) | 10-16 m, the lobe pads gone long-tipped and drooping (drip tips) in a fresher yellow-green, plum bark furred with moss | **`BIO.kin('rift.cloudlobe')`** (colour, scale, a `droop` field) |

**Family 2: the glass frills** (band B, the cloud core). *Ancestors*: the **frill tree** (the floor's) through the sketch's **cloud
frill** (`rift.cloudfrill`), and the **frost frill** and **mist frill** of riftrim's N and W rims (`riftrim` `frostfrill`, `mistfrill`).
A frill's fins, on the islands, became the forest's **fog combs**: translucent, water-filled, edged with fine hairs that catch the
cloud's droplets and run them down to the column. In the band's dim light the fins glow green-white when the sun breaks through.

| Key | Name | Relative | Form, colour, habit | How |
|---|---|---|---|---|
| `combfrill` | **Comb frill** | cloud frill (cousin), riftrim's mist frill (cousin), frill tree (ancestor) | 8-16 m, a short leaning ribbed column, its fins **long, translucent and fringed**, held level in whorls like a stack of combs; grey-teal column, glass-green fins; hung with fog thread | the frill builder (`B[0]`) through **`BIO.kin('rift.cloudfrill')`**: shorter, leaning (`lean`), level fins (`finTilt`), the fin item a **translucent fringed card** (a new fin material: transmission by back-light, `leafMat({backlit})`) |
| `glasspole` | **Glass pole** | comb frill (sister), riftrim's frost frill (cousin) | 4-9 m, an unbranched pole of fused fins like a stack of glass saucers, dripping; in the gullies | its own small builder (a lathe of stacked discs: the frill builder's fins fused) |
| `fogthread` | **Fog thread** | riftrim's veil thread (cousin), the sketch's beard moss (ancestor) | grey-green filaments 1-4 m hung from every frill and bough, combing the cloud; the band's signature | the beard item recoloured and lengthened, placed by the band, not the wet field |

**Family 3: the cushion crowns** (band C, the crest). *Ancestors*: the ridgetop's **barrel frill** and **silver scrub** (the sketch's
Mediterranean crest), the **giant groundsel**'s rosette, and riftrim's S rim (the **sun rosette**, the **cushion anemone**, the
**prism heath**). Above the cloud, in thin air and frost, a frill's fins have **fused into a cushion**: a dome of short, furred,
overlapping fin-tips that traps the day's heat; dark violet and rust on top, silver hairs, flowering pink at the rim in the dry season.

| Key | Name | Relative | Form, colour, habit | How |
|---|---|---|---|---|
| `crownbarrel` | **Crown barrel** | barrel frill (cousin), riftrim's cushion anemone (cousin) | 0.6-1.6 m domes, a fused cushion of fin-tips, violet-black with silver hair, a rim of pink blooms; in colonies on the crest | `BIO.kin('rift.barrelfrill')` (scale .3, colours) with a `fused` field the barrel builder reads (fins shortened to a dome) |
| `nightrosette` | **Night rosette** | giant groundsel (cousin), riftrim's sun rosette (cousin) | 1-2 m furred rosettes that **close at night** into a ball (the frost), open by day; black-violet, red-veined; on the crest's ledges | its own builder from the groundsel's rosette (two states: open, closed by the host clock) |
| `crestheath` | **Crest heath** | riftrim's prism heath (cousin), the sketch's silver scrub (ancestor) | low mats, silver-green going copper and magenta with the season; the crest's floor | a floor planter (the silver scrub's tufts recoloured, the season through the leaf material's `season` option and `BIO.bindSeason`) |

**Family 4: the dry-back pines** (the lee: 1.3-1.5 atm, 471 mm). *Ancestors*: the ridgetop's **Rift stone pine** and
**fan tree**, and riftrim's W rim (its borrowed stone pine). On the island's dry back the umbrella crowns have **flattened and
gone silver**, needles short and waxed against the drought; the fans of the fan tree have closed into stiff grey blades.

| Key | Name | Relative | Form, colour, habit | How |
|---|---|---|---|---|
| `tablepine` | **Table pine** | Rift stone pine (cousin) | 6-12 m, a flat silver table of short needles on a leaning grey trunk | **`BIO.kin('rift.stonepine')`** (scale .6, colours, `flat`) |
| `bladefan` | **Blade fan** | fan tree (cousin) | 3-6 m, a forked trunk with grey-blue blade fans held edge-on to the sun | **`BIO.kin('rift.fantree')`** (scale, colours, the fan's tilt) |

**Where each sketch species goes.** The sketch's highland species stay in the kit (their indices are read), as the families'
ancestors and the floor's upward fringe; the cloud forest station draws the families, not the sketch:

| Sketch species | Becomes |
|---|---|
| cloud frill, cloud bell palm, cloud lobe tree | the cousins the comb frill, the mantle palm and the drip lobe are kin of; drawn on the jungle station's upper edge (~0.5-1 km), not on station 3 |
| cloud parasol, cloud tree-fern, lantern tree, beard tree | **kept under the families** (the owner): the old stock every island kept, and diversified island by island like the families (each island's forms in the table below) |
| barrel frill, silver scrub | the cushion crowns' and crest heath's ancestors; drawn on station 1's tors (dry, warm) |
| giant groundsel, Rift cycad, peak pine | the groundsel the night rosette's cousin; the cycad on station 1; the peak pine riftrim's (the rims) |
| Rift stone pine, fan tree | the dry-back pines' cousins; drawn on station 1's upper benches |

### The three islands' forms (vicariance; records now: the owner, 2026-10-27)

Every family **and the old stock** has its own form on each of the three islands (west, central, east: section 1). Each is a
record (`BIO.kin` of the central island's species with its colour, size, band and one habit change), keyed by `island`. The
central island's are drawn on station 3, the east island's on **station 4**; the west island's are records only for now (the
open world, or a later station). Where a family's band does not exist on an island, its form there is the one the island's air
allows: the east island has no cloud and no crest, so its glass frill combs nothing and its cushion crown has become a rim plant.

| | **West** (the western massif: 1-3.5 km, 1.37-1.07 atm, Csb to Dsc; records) | **Central** (the cloud island: 1-2.06 km, 1.37-1.24 atm, wet face, dry back; station 3) | **East** (Cube's plateau: ~-250 m, 1.65 atm, Cfa, +22 °C; station 4) |
|---|---|---|---|
| **Mantle palms** | **frost hood**: closes its hood every night against the frost; grey-green, 8-14 m | mantle palm (and the hoodlet) | **open bell**: the hood never closed: a wide bell of pleats the size of the floor's, pale gold-green, 25-35 m: the lineage's lowest form, nearest its ancestor |
| **Glass frills** | **frost frill's island form**: a translucent ribbed column 15-25 m (riftrim's frost frill its nearest kin) | comb frill (and the glass pole) | **plate frill**: fins broad, opaque, held level as shade plates (no fog to comb); a 20-35 m column, copper-teal |
| **Cushion crowns** | **giant night rosette**: 3-4 m rosettes on the cap (the Rift's only near-alpine ground) | crown barrel, night rosette | **rim cushion**: low violet domes on the scarp's bare edge, where the plateau's wind and the floor's updraught dry the rock |
| **Dry-back pines** | **krummholz pine** at its treeline, flagged by the wind | table pine, blade fan | **copper pine**: a tall straight-boled pine of the plateau's drier south-west (Csa 28%), copper bark, an open crown |
| **Old stock**: cloud parasol | **frost parasol**: flat and small, 8-12 m, the dome of leaves dense | cloud parasol (as now) | **plateau parasol**: 30-40 m, the floor's size again, teal |
| **Old stock**: cloud tree-fern | **tussock fern**: a short trunk under a skirt of dead fronds | cloud tree-fern (as now) | **ribbon fern**: a slender trunk, fronds long and drooping |
| **Old stock**: lantern tree | **ember lantern**: red pods that glow at dusk | lantern tree (as now) | **gold lantern**: big gold pods, fruiting all year (a fruit for the catalog) |
| **Old stock**: beard tree | **ice beard**: the beard pale and stiff | beard tree, hung with fog thread | **vine beard**: the beard turned to hanging vines |

## 5. Station 3 and `biomes/riftrim` (settled: A, the owner 2026-10-27)

riftrim (`biomes/riftrim/PLAN.md`, a draft awaiting the owner) is the **rims**: the trough's walls and the W rift highland, 3-6 km,
0.8-1.0 atm, Dsc, ET and EF; six stations; its own three-rim flora. This kit's `NOTES.md` meant its highland sketch "to become its
own kit (the highlands)": that is what riftrim took on. Station 3's islands are a different ground: **1-4 km inside the trough**,
1.0-1.4 atm, Cfb, Csb, Dsb, surrounded by the floor rather than backed by the rim. Three ways to relate them:

| | What it means | For | Against |
|---|---|---|---|
| **A. Station 3 sits below riftrim's bands** (**chosen**, the owner 2026-10-27) | the islands are this kit's; riftrim is the rims. The families are **cousins** of riftrim's species (kin, not copies), and riftrim's rim species are kin of the Rift's floor ones: one tree of lineages across the two kits. Until riftrim is built, its ancestors are drawn as this kit's own builders, written so riftrim can take them over | clean ground split (the polygons already split: `rift` holds the islands, `rift rim N/S` the walls); station 3 can be built now | two kits own uplands; the western massif's cap (3-3.5 km) overlaps riftrim's montane band |
| **B. Fold riftrim in** | the Rift kit owns both; riftrim's six stations become the Rift's stations 4-9 | one kit, one lineage tree, one field set | a very large kit; riftrim's plan (lakes, Ledge, the Tungangs) is its own work |
| **C. Station 3 goes to riftrim** | the islands are riftrim's (its "island" rim); the Rift keeps the floor | the uplands in one kit | riftrim's flora is alpine and rim-backed; the islands are temperate and floor-bound: a fourth flora inside riftrim |

With A, the only shared ground is the **western massif's cap** (above 3 km, 576 km²): *proposed* that it holds riftrim's N-rim
species as relics (the frost frill's kin), the one place the two kits meet on an island.

## 6. Core adoption

Every station takes the scheme `GRAPHIC-LOAD.md` chose and the modules nhighlands took (its `45`, `55`, `88`, `89a`, `89w` the
worked example), each with its `?…=0` switch for the owner's A/B:

| Module | What it does on the stations |
|---|---|
| `core/biome` (kit, foliage) | welded items (`BIO.INDEX_ITEMS`; `?index=0`), the LOD merge, `minTris` 1500, the dithered cross-fade, **per-instance cull** (`BIO.LOD.cull`; `?lodmerge=0`, `?lodfade=0`, `?lodcull=0`); R5 the floor from the ground (`BIO.setGround`), R7 alpha-to-coverage, R8 one wind field (`BIO.bindAtmosWind`), back-light on the thin leaves and the glass fins, B3 two-tone bark, seasons (the crest heath, the dry grass) |
| `core/biome` 34 impostors | **the far band's diet**: heroes to 800 m, octahedral impostors beyond (one set of the station's tall species, 64 px cells), the far floor band to ~1.1-1.6 km, `BIO.impostorLook` matched to the near crowns **by measuring** (the bake is ~4x dark: HANDOFF "Owed in core") |
| `core/biome` cells | the card cells right (`tools/textures/check_cells.py` reads zero; the four crown sheets on `BIO.geo.cells`: done on the experiment branch) |
| `core/biome` 33 `BIO.fung` | the anemone stalk's and the thornwhip's stalks (`BIO.fung.stalk`), the hooked claws (a bowed stalk), the crown barrel's cushion parts |
| `core/biome` kin, reach | `BIO.kin` for the cousins (sections 3 and 4); `BIO.reachW` for the few jungle species that climb the face and the highland ones that come down the gullies |
| `core/biome` fire, lean | `KFIRE` and the burn mosaic on station 1 (with abyssal-savannah's `ABSAV.burn` read in place, or its own); the lean toward the giant where a kit takes it |
| `core/terrain` | each station's ground from the model at its pixel (the Hook way, `KLAND`, when it is on this branch; until then an analytic height on the survey's profile); **strata**: the `rift` recipe (`KSTRATA`, STRATA-PLAN section 3) on the island's faces and the tors (done for the old ridge on the experiment branch); `KRELIEF` tors on station 1, talus under the faces; `KGROUND` (clast, sand), `KHORIZON` shadows, `KFAR` the far field (the other islands and the walls on the horizon) |
| `core/atmos` | the shared sky at each station's pixel (the air at 1.94 and 1.24-1.37 atm); **height fog** with a cloud band on station 3 (its base at the island's dew point, ~1.4 km: the band the page sits in) and seen from below on stations 1 and 2; weather (`bindWeather`); **rain cover** (R10); lightning; the air's load (the floor's haze) |
| `core/water` | W1/W2/W4: falls down station 3's gullies with `margin`, `lipK`, spray by drop; the jungle's stream mouths and the terminal sea's algal shore (`WATER.open` with its tint, as now); Gila's lake and its salt rim on station 1 (`WATER.still`, the `ext/54` brine and pan kinds); **wet ground and puddles** (`WATER.wetGround`, `WATER.hollows`); rain rings |
| `core/hazard` | the floor's heat (the 1.9 atm, +29 °C air) as a walk-zone note, the shore's brine; taboo areas if the owner places Lizardmen sites |
| `core/tags`, `core/rand`, `core/space`, `core/host`, `core/export`, `core/materials` | as now (`BIO.init({tags})`, `KRAND` seeding by cell, `KSPACE` keep-clear, `KHOST.take`, the export profile with atmos and water, `KMAT` and the pack) |

**The baseline the stations are measured against** (taken 2026-10-26 on the old single page, `dist/rift.html` as built from
`claude/biome-rebuild`'s sources, before any change; three.js, **Intel Arc 140T**, ANGLE D3D11, 1024x768, the world pass alone by
`tools/perf_views.py`). Held: **25.67 M triangles**. Per view (calls, triangles drawn, instances drawn; the GPU timer reported a
disjoint on most frames that run, so only three views have a time; the timer now drops disjoint frames one by one):

| View | Calls | Triangles | Instances | GPU ms |
|---|---:|---:|---:|---:|
| The algal shore | 520 | 13.49 M | 0.81 M | 42.3 |
| Under the bell palms | 545 | 14.51 M | 0.87 M | |
| The frill trees | 504 | 12.99 M | 0.77 M | 39.7 |
| A stream to the lake | 173 | 4.61 M | 0.28 M | |
| The tower | 493 | 10.12 M | 0.59 M | |
| Under the tower | 362 | 12.36 M | 0.81 M | |
| The cloud forest | 474 | 13.70 M | 0.92 M | 39.4 |
| The mesas | 536 | 9.86 M | 0.57 M | 29.9 |
| The peak | 526 | 14.84 M | 1.03 M | |
| Down to the savannah | 504 | 15.00 M | 1.07 M | |
| The savannah | 343 | 7.80 M | 0.63 M | |
| Baobabs | 227 | 4.56 M | 0.33 M | |
| From the north | 374 | 7.02 M | 0.36 M | |
| From afar | 322 | 3.26 M | 0.02 M | |
| Krator rising | 475 | 13.74 M | 0.84 M | |

Each station's `PERF.md` gives the same table on the same GPU and method (A/B inside one page by its switches, the minimum of
the frames), for the scheme's second measurement (`HANDOFF-REBUILD.md`: the Rift was to confirm or tune nhighlands' gains). A
station holds about a third of the old page's ground, so a station's numbers are not the old page's; the switches are the A/B.

## 7. Textures

**In the library and the kit's pack already**: the barks (`bark.lepido`, `bark.palm`, `bark.smooth`, `bark.juniper`,
`skin.cactus`), `wood.silver`, `rock.rock035`, the cards (`card.spruce`, `card.pine`, `card.sword`, `card.acacia`,
`card.treefern`, `card.fern`, `card.palm`, `card.reed`, `card.samphire`, `card.grass.dry`, `card.moss`, `card.jungle.clump.0`,
`card.beard`, `card.vine.hanging.0`/`.8`, `card.broadleaf`, `card.flower.bloom`, `card.frond.fractal`, `card.reef`,
`card.leaf.wave`, `card.leaf.redvein`), the ground (`ground.gravelly_sand`, `ground.playa.red`, `ground.ground093c`,
`ground.ground080`), `organic.fungus.bracket`. **For the islands, from the library**: `ground.sphagnum` (band B's moss floor),
`ground.lichen.crust` (the crest), `card.epiphyte.garden` and `card.broadleaf.cloud` (the eastern highlands' cloud forest sets,
`meta.json` "reuse"), `organic.pleat.skin` (the hoods' pleats), `organic.cap.glossy` (the cushions); abyssal-savannah's thatch and
litter sets (station 1).

**To generate** (prompts added to `core/materials/PROMPTS-NEEDED.md` on approval, *proposed*; cut-outs on magenta, tint written in):

| Id | For | Prompt (short form) |
|---|---|---|
| `card.fin.comb` | the comb frill's fins | a single translucent fin-leaf, long and narrow, glass-green and water-filled, its edges fringed with fine white hairs holding droplets, back-lit, on magenta |
| `card.hood.pleat` | the mantle palm's hoods | one hooded fan of overlapping pleated leaves, sage green, furred, drip beads on the pleat edges, seen from the side, on magenta |
| `card.fogthread` | fog thread | hanging grey-green filaments 1-4 m, fine and tangled, beaded with fog, a 3x3 sheet of strands, on magenta |
| `organic.cushion.fur` | the crown barrel's cushion | a tileable dome surface of short overlapping fin-tips, violet-black with silver hairs, macro, even light |
| `card.rosette.night` | the night rosette | a furred rosette from above, black-violet leaves with red veins, silver hair at the edges, open, on magenta (and a closed ball: a second cell) |
| `ground.cloudforest.litter` | band B's floor | tileable wet leaf litter and moss in a cloud forest, grey-green, small fallen glass-green fins, drops |
| `rock.island.wet` | the island's faces | tileable wet dark basalt and red sandstone, moss in the joints, running water films (strata: the `rift` recipe colours it) |

## 8. The order of work

- **S0.** Done: the owner's answers (2026-10-27). Left: the prompts (section 7) into `PROMPTS-NEEDED.md`; section 10's two questions.
- **S1.** The station frame: `build.py --station`, the shared kit and per-station hosts (`stations/<name>/`), the fields bound
  from the model's ground at each pixel (`air` and `island` added), the readers' API kept (`RIFT.make/grow`, indices).
- **S2.** **Station 2, the rift jungle** first: the old page's content is mostly the jungle's, so it carries the graphic-load
  scheme's second measurement (`PERF.md`, the scheme's A/B switches). Take the experiment branch's parts (section 9).
- **S3.** **Station 1, the rift savannah**: the savannah species, the blade pear, the abyssal-savannah cousins, the burn mosaic,
  Gila's lake.
- **S4.** **Station 3, the cloud forest**: the bands, the four families and the old stock (central forms), the island's face,
  the fog band, the falls.
- **S5.** **Station 4, Cube's plateau**: the east island's forms of the families and the old stock, the scarp and its falls to
  the jungle, the ruin's surroundings.
- **S6.** The west island's records (section 4) and `island` for the open world; the old `dist/rift.html` retired (its readers
  checked: ringisles, Hook, the open-world pages are rebuilt at their own turns).
- **S7.** `verify.py --assert --all-views` per station on the GPU lock; `check_core_use.py`; `PORT.md`, `INDEX.md`,
  `KNOWN_ISSUES.md`; the before/after shot sheet; the gallery (a station set is new pages: ask the owner).

## 9. What the abandoned single-page rebuild leaves to lift

`claude/rift-single-page-experiment` (6f229841f), built and smoke-tested (SwiftShader, clean panel), **not** measured or verified on
the GPU: the scheme's switches in `45-host-stage.js`; the far band's diet and the impostor set in `55`/`88` (each tree reseeding
from its own seed, so a quad in place of a blob moves nothing); the 12 card-cell fixes (`materials.json`, `SHEET` in `50`);
the anemone stalk on `BIO.fung.stalk`; R7/R8, wet ground and puddles, height fog, rain cover in `89a`; W1/W2 and rain rings in
`89w`; the `rift` strata on the cliff faces (`45`, `aRock`); the feral three (`B[34]`-`B[36]`, the `claw` and `bpad` items,
their harvest tags). `tools/perf_views.py` (on this branch) is the measuring tool.

## 10. The owner's answers (2026-10-27), and what is still open

| Question | Answer |
|---|---|
| The old page | **retired** when station 2 lands |
| The sites | the transect is fine (the map: `PLAN-STATIONS-map.png`) |
| Station 2's site | **the Lizardmen river 3's mouth** (px 420,1248) |
| Station 3 and riftrim | **A: below riftrim's bands**, the families riftrim's cousins |
| More stations | **station 4, Cube's plateau** (px 448,1240) |
| The families | the four are fine; **the old stock stays under them, diversified island by island** |
| The sisters | **records for three islands now: west, central, east** (the names for now); the east one is station 4's |
| The abyssal-savannah cousins | **taken** on station 1 |
| The feral three | **agreed** as placed (maw trumpet and thornwhip in the jungle, blade pear on the savannah) |

Still open:

1. **Cube's ruin on station 4**: drawn as a standing ruin from an existing kit (the Ancients kit's arcology pieces, as Girder's
   tower dresses the old page) with the plateau's growth on it, or left as a footprint until its settlement plan? And whether
   anyone lives in it (the Lizardmen of Sauropolis, 60 km on, or Dalab's field stations as on the rim).
2. **The gallery**: four new station pages replace one; publish each as it lands, or the set when station 4 is done?
