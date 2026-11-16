# The West Rift: a preliminary population and economy scope (2026-11-16)

Read-only research in the `claude/openworld-sites-24defd` worktree, plus two files read from the branch
`claude/loj-twenny-059a5e` with `git show` (`biomes/line/PLAN.md` and `settlements/loj-twenny/PLAN.md`; neither is on `main`).
Revised the same day with the owner's figures (section 3d). Pixels are on scale model 5.1 (1821x1723 px at 2 km a pixel). **Every figure marked
(est.) is my estimate; the basis is given beside it.** "Census" means `openworld/RESOURCES-SETTLEMENTS.md` and
`TRADE-GOODS.md` (this line's census, populations by type). "Gemini" means `openworld/populations-gemini.json` and
`TRADE-GEMINI.md` (a draft, not canon, as `PROPOSAL-XANADU.md` treats it).

## 0. The shape copied from the East Rift

The East Rift economy (`core/region`) is a valley spec run on `50-region-valley.js`:
- **Settlements:** `{id, name, faction, people, x, z, scale, eats, start, works: [{kind, crew, out, rate, batch, season, site}]}`.
  The countrysides are bulk districts at 200 people an actor. Towns run at 50 and drawn villages at 10.
- **Roads:** `{from, to | stops, minutes | legs, carriers, cap, want, goods, expect, share (tithe), cut (toll or margin), halts,
  provision, closed}`.
- **Transfers:** fealty and esteem.
- **Gateways:** off-map markets.

It was built in steps:
- Longsong S0-S3 (`PROPOSAL-LONGSONG-PINNACLE.md`).
- Xanadu X0 data, X1 sites and multi-stop roads, X2 the join with Longsong plus the lodes, oil and merchant houses, X3 priced
  gateways, X4 estates, X5 the Marches and raids (`PROPOSAL-XANADU.md` section 7).
- The Catch, C1-C5 (`PROPOSAL-CATCH.md`).
- The join itself is `core/region/data/east-rift.js`.

**The West Rift is already in the East Rift sim, as stand-ins.** In `XAN_TUNE` (`core/region/data/xan-tune.js:162-177`), Dalab's
Annual Great Caravan is the gateway `gate.dalab`: one carrier on a seven-stop round of about 52 days a leg. Three of its stops
are **off-map stand-ins**: `gate.dalab.blakhed`, `gate.dalab.nulab` and `gate.dalab.shelf`.
- Blakhed takes Xanadu's exports: cacao, cacao cake, saffron, opium, tea, brocade, silk, sulfur, wax, rarities and hearthseed.
- Shelf supplies salt, iron, wine and pearls.

A West Rift tune would replace those stand-ins with real settlements. That is exactly what `EAST_RIFT` did to Longsong's off-map
"Xanadu market".

## 1. What the West Rift is

**The name.** It comes from the owner's trade rule of 2026-11-12 (`openworld/TRADE-SCOPE.md:19, 37`): "because of the
lizardmen there is barely any trade between the eastern and western rift". TRADE-SCOPE lists **Ledge, Nulab, Loj Twenny,
Wildcat, Tallwalls, Tallhouse** as the West Rift. No other doc defines it. LORE.md's only geography is the Rift as a whole
(LORE.md section 3.1, l.75), with "the Rift's western head" at the great lake (l.236).

**Extent (proposed).** The Rift (polygon `The Rift`, 318-1029 x 1228-1689) **west of the Lizardmen's western cluster**. Gila is
at 653,1485 and The Tubes at 608,1547; the `Lizardmen` polygon starts at x 565.
- **Core box: px ~310-650 x ~1150-1620.** That is about 680 x 940 km, roughly 300,000 km² of mostly airless crest, fell and rim.
- It holds these polygons, from `tools/scale-model/model/src/51-region-store.js`:
  - `w rift highland` (308-517 x 1221-1419);
  - `Tungang Union` (399-517 x 1140-1345, 68,000 km²);
  - `Fellgangs` (339-596 x 1242-1573, 133,000 km²);
  - the western part of `rift` and `rift rim S`;
  - the southern half of `Realm of Dalab` (332-630 x 996-1417).
- **The north shoulder:** `Vrivolci`/`Greenstep` (578-695 x 1184-1349), with Tallwalls on it. TRADE-SCOPE counts it, though
  Greenstep drains north to the Lake of Shim and lies outside `The Rift` polygon.
- **Western neighbours:** `Kimr`/`Labyrinth` (90-398 x 1348-1640: the Hall of Heroes), `copper glacier` and `Firebliss Range`.
- **North of the Wall:** the gateway. That is Dalab and its heartland (the SW lowlands) and Shelf, the Line's north mouth.
- **Shumar** (681-826 x 1109-1226) is a neighbour above Tallhouse (TRADE-SCOPE:603).

**The ground** (`biomes/riftrim/PLAN.md`, 5.1 survey):
- The Outer Wall's crest is airless: 9,645 m at 483,1236.
- **The great lake** (Ledge's) at 438,1344 lies at 297 m: 2,336 km², with a Csa shore at +16.6 °C. Ledge stands 1.3 km
  above it on the cliff.
- The Chimes gorge falls 1.9 km in 12 km to the hot Rift floor.
- The rims carry fifteen lakes from 1.9 to 5.8 km up, under Dsb/Dsc/ET fells.
- The Line's rift fill holds copper (120) and rare earths (190).

**Polities and peoples:**

| Polity | People | Where | Lore |
|---|---|---|---|
| **Realm of Dalab** (`Dalab Council` in the census) | Dalabites: green-skinned, gene-modded for cold and altitude; genepriests; Giant guards | Ledge, Nulab, Chimes, Blakhed's ground, the skarn; the road | LORE 6.1 l.236: "the only real power on the rift rim"; the hold is "tenuous"; every supply train is an expedition |
| **Tungang Union** | Tungangs: the Line's feral crews, "friendly Morlocks", about 0.94 of a human's height, nocturnal | the Line's tunnels and caverns: Loj Fower (Ledge's lifts), Loj Twenny (20), the Hearth hold | LORE 6.1 l.236-263; `kits/tungang/PLAN.md` 1.2 |
| **Fellgangs** (no state) | the Tungangs' day-bearing highland branch: bands (wildcats), fell villages, and the Travellers on the road | Wildcat, Blakhed, the Fowlers, the Ice-cutters, the drovers, pass-keepers and coppersmiths | LORE l.264-284; tungang plan 1.3-1.3.4 |
| **Free Giants (Vrivolci)** | Giants escaped from Dalab, plus escaped slaves of Voth and Dalab | Tallwalls (Greenstep), Tallhouse | LORE 6.17, 6.21; `biomes/greenstep/PLAN.md` |
| **Kimr** (neighbour) | megafauna hunters in raised pueblos, half of Wildcat's descent | the Labyrinth, the Hall of Heroes (365,1474) | `biomes/labyrinth/PLAN.md` section 5 |
| **Lizardmen** (out of trade) | | the floor east of ~x 600 (Gila, The Tubes) | LORE 6.20: "never trade or treat" |
| **Loj Nahn** (sealed) | about 1,000 Tungangs in the Pile's upper levels (720,1567), unknown to all | Lizardmen country | LORE l.236, 967 |

## 2. The Line

**What it is.** The Ancients' **Rift line** (LORE section 4, l.168; `biomes/line/PLAN.md` on `claude/loj-twenny-059a5e`;
`openworld/ANCIENT-NETWORK.md` section 8). It is a four-track gallery, 37 m wide, with a two-lane service road along its west
wall. Above ground an Ancient highway runs beside it, on Louisiana-style elevated decks over bog and water. Its trains draw
power from the guideway. **The power plant at the hot doors** runs on the deep rock's heat (60-130 °C), and its generator
magnets are rewound with the rift fill's rare earths. It is a `line` kind in `KTRANSIT`; its cars are the `tungang` culture in
`kits/motor-vehicles`.

**Where it runs.** Dalab (477,1108) north to south under the Outer Wall to Ledge (437,1330): **439 km**.
- About 35 km of climbing spirals under Shelf.
- The bore, 304 km from the north portal (458,1159) to the south portal (439.5,1309.5).
- 42 km on the surface across the wet tableland to Ledge's cliff.
- The lifts down 1.3 km to the lake.

Beyond Ledge the network session routes it on by Nulab, Chimes, Cthonos, The Tubes and the Pile to Theodiga and Strongbow
(ANCIENT-NETWORK.md l.468-481). **East of Chimes it is unworked**: the Tungangs there died in the tunnel wars, and Chimes to
the Pile crosses Lizardmen country.

**Stations** (the owner, 2026-11-11, numbered north to south):

| # | Station | Px | What is there |
|---|---|---|---|
| 1 | Dalab | 477,1108 | the capital: the Line meets Dalab's plain |
| 2 | Shelf | 461,1161 | arcology, the north mouth at the top of the spirals; Dalab's |
| 2a-2g | halts: the valley adit (km 24), the fault junction (45), **the north door** (55: the hot doors, the power plant, tin granite), three sealed ghost stations (89, 124, 160), the south door (203) | | the long run's hot section, km 55-203 |
| 3 | **the Twenny junction** (km 218) | 445,1266 | **Loj Twenny (20)**, under the great shaft (the owner, PLAN-SETTLEMENTS q16). The pin is still 457,1269 on this branch |
| 3a-3c | the km 250 loj, the shallow station (285), the south mouth (304) | | |
| 4 | **Ledge's lifts: Loj Fower** | 437,1330 | the Dalab-held arcology, its lifts run by the Tungangs |
| 5 | Nulab | 443,1359 | the city on the great lake's south shore: the Line's lake station |
| 6 | Chimes | 468,1392 | ruined arcology at the gorge's foot, a site only |
| 7 | Cthonos | 526,1503 | ruined arcology |
| 8 | The Tubes | 608,1547 | cavern, at the Lizardmen's edge |
| 9 | the Pile (Cube): **Loj Nahn** | 720,1567 | sealed, in Lizardmen country |
| 10-13 | Theodiga, Strongbow, Stair, a Bowl arcology | | *proposed* extensions, dead or sealed |

**How it works today** (Line plan section 2, *proposed* but accepted by the owner):
- **Four segments between three gaps.** At a gap every track has fallen:
  - N: km 0-33, one train;
  - **M, the long run:** km 36-236, three sealed trains through the hot section;
  - S1: km 239-262;
  - S2: km 264 to Ledge.
- **Gaps:** G1 is the block caves (2-3 h walk), G2 a chamber and sump (3-4 h), G3 a bypass (1 h).
- **Timing:** trains keep 15 m/s, about one departure each way per 8-hour turn on the long run. **Dalab to Ledge takes about two days.**
- **Portering:** Travellers carry across the near-surface gaps, Tungangs alone go deeper in.
- **Shafts:** hidden shafts are the Union's second way out. Within 15 km of Dalab's road (the north end, and the last stretch
  to Ledge) they double as **strike raid points**.

**Who lives on and along it:**
- the Tungang lojes: about forty proposed (`kits/tungang/PLAN.md` 1.2, *proposed*), the Fixers who keep the far stretches, and
  the Tpresden;
- the Kradz, the Travellers' dark clan, who service the shafts;
- Dalab at its ends: Dalab, Shelf, Ledge, Nulab.

**What it moves:**
- the Tungangs' own cargo: iron from the valley (km 17-32, 180), tin from the north door's granite (200), nickel from the
  breccia, and copper and rare earths from the rift fill;
- Dalab's grain;
- passage.

Gold and silver lie in the gneiss behind the hot doors and are not worked.

**Dalab's road is separate.** It runs 528 km by Shelf, through its own ~60 km road tunnel under the crest (portals 488,1220 and
477,1245), 59 km east of the bore. It goes over the surface where Fellgangs raid, and past the shafts where a striking Union can
raid.

**Name clash:** Span's salvage barricade is also called "the Line" (ANCIENT-NETWORK.md G17, q11). "Rename the local ones" was
answered but is not yet done.

## 3. Settlements

People are given first by the census (by type) and Gemini (`cur_pop`) where they exist; the working figure is the last column.
The census types are: city 8,000, arcology 10,000, town 2,500, village 300, outpost 150, cavern 500, large capitals 20,000.

### 3a. Pinned on the scale model

| Id | Name | Px | Type | People / polity | Census / Gemini | Working figure | Makes | Needs |
|---|---|---|---|---|---|---|---|---|
| `sxyznayzgc` | **Ledge** | 437,1330 | arcology | Dalab, plus Tungang Loj Fower at the lifts | 10,000 / 2,200 (Gemini calls it Tungang) | **10,000** (the owner, 2026-11-16: "Ledge is about 10k"): Dalabites (genepriests at the gene bank, garrison, the road's terminus, the arcology's trades); Loj Fower's Tungangs at the lifts are counted with the Union's 20,000 (about 1,500; its plan: `settlements/ledge/PLAN.md`) | lake fish (745 fish-eq), lotus root and wild rice, lotus silk, mist tea; **bronze** (census top producer, 27 t); copper (24), rare earths (18, unworkable by Dalab under the extraction rule); gene-craft (50 units); passage by the lifts | **salt** (census customer 88 t; no salt within 169 km), timber, iron, grain in a bad year, the Union's goodwill |
| `ssk1wsnjjd` | **Nulab** | 443,1359 | city | Dalab | 8,000 / 8,000 | **10,000** in the city (the owner, 2026-11-16: "as is Nulab"), plus the basin's rural people (3c) | the West Rift's **breadbasket**: farmland 1,654 km²-eq (helix bean, ashroot, lotus root, rice, mist tea, lotus silk, sea-linen flax, mulberry, woad, camphor); fresh water 318 (the Chimes Riba, 973 m³/s); **copper 53** (census top-3 on the map), rare earths 41 (best on the map, but Dalab may not extract them); iron 32 km off (443,1375); gene-craft (80) | salt (77 t), timber, metals worked |
| `spbzmhdqqd` | **Loj Twenny** (20) | 457,1269 (pin); 445,1266 planned | cavern | Tungang | 500 / 650; **its own sim draws 165** | **2,000 (est.)**: the junction, the biggest loj (its drawn hold seats 165: the page's core, not the whole loj). One share of the Union's 20,000 (3d) | dark-bed fungus (mash), ore (copper, rare earths: 0.9 t a year, TRADE-SCOPE:103), power upkeep, ice down the great shaft | grain from Dalab, timber (census: Loj Twenny is the map's only big timber customer, 220 t), wax, plate, ice, medicine |
| `s4i2tk5zvf` | Tungang saltpeter works | 492,1255 | outpost | Tungang (inside Dalab's polygon too) | 150 / - | **150** | cave saltpeter (rich, 200) 75 km from Loj Twenny: the Union's natural export (TRADE-GOODS 5) | food |
| `syz1ps04fa` | **Wildcat** | 427,1453 | village | Fellgang band, about half Kimr | 300 / 300 | **400 (est.)**: a raiding band's scrap pueblo | raids (Dalab's supply trains, the Ice-cutters' ice road, Firebliss camps); megafauna hides | grain, salvage |
| `s08nld4zx3` | Fellgang gold camp | 438,1448 | outpost | Fellgang (summer) | 150 / - | **150, seasonal** | gold (140, 10.5 node-yield): the only gold seller on the SW rim | food, tools |
| `stallwalls01` | **Tallwalls** | 650,1268 | city, to become a town | Free Giants and escaped slaves | 8,000, then **~2,500** (the owner: "Smaller: a town", TRADE-SCOPE 2.3) / 2,500 | **2,500** | richest ground on the map: farmland 2,466 (rice, coffee, mist tea, lotus silk), **saltpeter** (38% of the map's surplus after the cut), salt (~500 t), tin (13 t), iron, gold, silver, livestock 1,943 | sugar, cacao, coal (census); arms? |
| `smqy5z5eek` | Tallhouse | 683,1184 | fort | Free Giants' outer watch-post | 150 / 150 | **150** | watch over the Clodosriba's mouth to the Lake of Shim | supplied from Tallwalls (170 km) |

### 3b. In plans and lore, not pinned

| Name | Px | People | Source | Working figure | Role | Needs |
|---|---|---|---|---|---|---|
| **Blakhed** | 441,1400 (the Blak Riba head; site settled) | Fellgang (Fowler and Ice-cutter kin), pays Dalab a toll | LORE l.270; tungang plan 1.3.3: "1,000-2,000", 150-300 households | **5,000** (the owner, 2026-11-16: "upscale a bit to 5k"; its plan: `settlements/blakhed/PLAN.md`) | the rim's market and meeting town: ice houses (for the basin and Nulab), the egg and honey store, the rope walk (the gorge stair), beast pens; the Travellers' Fair ground; **a Great Caravan stop** (XAN_TUNE) | grain, salt, metal |
| The Fowlers | 571,1397 | Fellgang village (riftrim station 8) | riftrim 6; "a tenth of Blakhed" | **150 (est.)** | eggs and young of the cliff flyers, wall honey, herbs; to the Hearth hold (~80 km) | grain |
| The Ice-cutters | 470,1521 | Fellgang village (station 9) | riftrim 6 | **150 (est.)** | lake ice cut in an eight-week winter, carried down the south wall to "the hot floor (Cthonos' country)"; ice to Blakhed and the hot holds | grain, cloth, metal |
| The drovers | 393,1338 | western Fellgangs | tungang plan 1.3.4 | **300 (est.)**, plus summer shielings and the salt camps | **salt** (the owner, 2026-11-16: "We'll have the drovers be a major salt source"), felt, hides, meat, wool, driven to Blakhed (157 km) and Dalab's basin; Ledge 89 km | grain |
| The pass-keepers | 352,1262 | western Fellgangs | 1.3.4 | **150 (est.)** | guides and porters over Copper Glacier's pass west (to Firebliss); carry the coppersmiths' copper | food |
| The coppersmiths | ~320,1248 (site unsurveyed) | western Fellgangs | 1.3.4 | **200 (est.)** | the glacier's copper as wire, sheet and fittings for the Tungangs' windings (through the Fixers) | food, fuel |
| The Travellers (incl. the **Kradz**) | mobile: halting places, winter at Blakhed | Fellgang road families | LORE l.277-284 | **750 (est.)** | hauling, beast dealing, salvage-smithing, guiding, portering at the Line's near-surface gaps; the Kradz service the shafts | they are the carriers |
| **The Hearth hold** | 525,1400 (hypogene, under the Hearth field) | Tungang: one of "the two big holds the plans name" | tungang plan 1.2; `biomes/hearths` | **2,000 (est.)**: one of the two big holds, at the top of the plan's 300-2,500 a hold, within the Union's 20,000 | hearth wax (the staple and the light), dark crops, cavern leapers; buys the Fowlers' eggs and honey | ice, grain |
| km 250 loj (3a) and the G2 porters' hold | on the bore south of Twenny | Tungang | Line plan 2; Loj Twenny's sim `g2` | **350 (est.)** | segment trains, gap portering | as Loj Twenny |
| Dalab skarn mining hamlet | 416,1377 (65 km WSW of Nulab) | Dalab | the owner, 2026-11-11 (tungang plan 1.3.4) | **400 (est.)**: core/hamlet's mining village, under its 500 cap | copper (240) and iron (210): the best in the West Rift | food from Nulab |
| Dalab's posts on the road and at Blakhed's toll | road tunnel portals; the gorge stair head | Dalab | lore, *proposed* | **100 (est.)** | toll in kind (ice, eggs, rope) | supply |
| Chimes (6) | 468,1392 | site only | riftrim q3 | 0 | a halt, a ruin | |
| Cthonos (7) | 526,1503 | ruin | | 0 | the Ice-cutters' buyers are said to be here, but no one lives here | |

### 3c. Bulk districts (the X0 pattern: never drawn)

| District | Working figure | Basis |
|---|---|---|
| **The great lake basin** (Nulab's and Ledge's countryside: shore farms, fishing hamlets, Dalab's gene farms) | **50,000 (est.)** | The owner, 2026-11-16: "account for rural pop too", then "a slightly higher rural ratio" than 2x. Rural at **2.5x** the two cities' 20,000: the breadbasket (1,654 km²-eq of farmland) must feed the cities, Blakhed and the Union's grain. Range 20,000 (1x) to 72,000 (Gemini's 3.6x for Dalab); Xanadu runs 5x |
| **The Union's other lojes** (Loj Fower at Ledge's lifts 1,500; about thirty more on the Line's stations, the rift fill's caverns and the vents' holds, ~450 each, 14,000) | **15,500 (est.)** | The owner, 2026-11-16: the Tungangs are **~20,000** across all the lojes. Close to Gemini's 18,760; the census 500 and the tungang plan's 25,000-40,000 are retired |
| **The Kimr** (the Labyrinth's pueblos and great houses, and the Hall of Heroes' keepers) | **6,000 (est.)** | The owner, 2026-11-16: "We'll also account for the Kimr". Nothing gives a figure; three great houses of ~500 (*greidhaws*: "several hundred", KIMR.md) and ~25 knob villages of ~150, and ~750 round the Hall. Range 3,000 to Gemini's 11,600 (10,000 pueblos, 1,600 Hall). Wildcat's Kimr half stays in Wildcat's 400 |
| **The Fellgang fells** (shielings, hunters, small bands; and Blakhed's hamlet network) | **5,000 (est.)** | Gemini 9,000 (its rural ratio 5x on 300); a third of it, 3,000, plus Blakhed's hamlets, ~2,000 (the owner, 2026-11-16: "a healthy hamlet network around it"; about a dozen of ~150, *proposed*) |
| **Greenstep's terraces** (Tallwalls' farms and towers) | **3,000 (est.)** | Gemini 8,750 rural; with the owner's "poorer, smaller" Tallwalls, about a third |

### 3d. Totals (all estimates)

| Group | Named | Bulk | Total |
|---|---|---|---|
**Revised with the owner's figures (2026-11-16):** Ledge ~10,000, Nulab ~10,000, the rural people counted, the Tungangs ~20,000
across all the lojes, the Kimr in the count.

| Group | Named | Rural / bulk | Total |
|---|---|---|---|
| Dalab in the Rift (Ledge 10,000, Nulab 10,000, the skarn 400, posts 100; the basin) | 20,500 | 50,000 | **70,500** |
| Tungang Union, all the lojes (Loj Twenny 2,000, the Hearth hold 2,000, the saltpeter works 150, G2 350; Loj Fower 1,500 and ~30 more lojes 14,000) | 4,500 | 15,500 | **20,000** |
| Fellgangs (Wildcat, the gold camp, Blakhed, the Fowlers, the Ice-cutters, the drovers, pass-keepers and coppersmiths, the Travellers; the fells and Blakhed's hamlets) | 7,250 | 5,000 | **12,250** |
| Free Giants (Tallwalls, Tallhouse; Greenstep's terraces) | 2,650 | 3,000 | **5,650** |
| Kimr (the great houses, the knob villages, the Hall of Heroes) | - | 6,000 | **6,000** |
| **The West Rift** | **~34,900** | **~79,500** | **~114,500 (est.)** |
| *Outside the count:* Loj Nahn ~1,000 (sealed in the Pile, Lizardmen country); Dalab's heartland (Dalab 20,000, Shelf 10,000 by type) as the north gateway; the Shumari (Gemini 7,600 town) | | | |

That is **about a third of the Sultanate's ~350,000** (32 %). The basin's rural ratio moves it most: 1x gives ~84,500,
2x ~104,500, Gemini's 3.6x ~136,500. **What the owner's figures change in section 4:** the Union is large (20,000, about twice the
old working figure), so its grain by the Line is the Line's biggest southbound cargo: if a third of its bread is Dalab's grain,
~3 t a day (~1,200 t a year), which the basin's surplus must cover alongside the two cities and Blakhed. That makes the Union's
grain the Realm's lever over it, as the lifts and tunnels are the Union's lever over the Realm. Ledge at 10,000 makes
its salt (88 t a year on the old 3,000: ~290 t now) and timber the Rift's biggest shortfalls, and Nulab's basin (50,000 rural)
the one surplus that has to feed both cities and Blakhed.

## 4. The economy, sketched

### 4.1 Routes

| Route | Mode | Length and time | Carries | Risk |
|---|---|---|---|---|
| **The Line**: Dalab, Shelf, the Twenny junction, Ledge | rail in four segments, three portered gaps | 439 km, **~2 days** | Dalab's grain, cloth and timber south; ore, rare earths, salvage and power cells north; passengers | **the Union's strike** (the lifts stopped, the trains held); a collapse in the long run would cut north from south |
| **Dalab's road** (Dalab, Shelf, the road tunnel under the crest, Ledge's cliff top) | cold-modded porters and beasts | 528 km, ~3 weeks (est., at 25 km a day) | Dalab's supply trains; gene-craft; Ledge's garrison | Fellgang raids on the surface stretches; Tungang shaft raids near Shelf (km 4-24) and on the last ~15 km to Ledge |
| Ledge's lifts, then the lake, then Nulab | lifts down 1.3 km (Loj Fower), then boats | 59 km | everything between the highland and the basin | the lifts are the Union's lever |
| Nulab, the Chimes gorge stair, Blakhed | the gorge stair (ropes, Blakhed's) | 82 km | ice to Nulab; grain and salt up | |
| Blakhed to Wildcat, the Fowlers and the Ice-cutters | sledge, pack | 110 / ~250 / ~250 km | ice, eggs, honey, rope | Wildcat raids the ice road |
| The Fowlers to the Hearth hold | pack | ~80 km | eggs, honey, herbs for wax and fungus | |
| The Ice-cutters to Cthonos' floor | night carry down the south wall | ~120 km | ice | Lizardmen? (no buyer is named) |
| Drovers to Ledge and Blakhed; pass-keepers to the copper pass and west | droves, packs | 89 / 157 km; west to Firebliss | meat, hides, felt; copper | |
| The great shaft (km 218) to the fells above Loj Twenny | hoist, porters (the Kradz) | 2.2 km vertical | ice down, ore up | hidden |
| Loj Twenny to the saltpeter works | caverns (est.) | 75 km | saltpeter | |
| **The Great Caravan**: Erehwon, Blakhed, Nulab, Shelf | one annual caravan (Dalab 46%, Xanadu 40%, Tungang Union 10%: Gemini) | 52-day legs in XAN_TUNE; Gemini "831 km, 90 days" | Xanadu's cacao, saffron, opium, tea, silk and Godshearth goods west; salt, iron, wine and pearls east | Lizardmen; its path across the Rift is unsettled (Q6) |
| Tallwalls, Tallhouse, the Clodosriba, the Lake of Shim | river and road north | 170 km to Tallhouse | saltpeter, tin, tea, silk to the north (Voth's lake, Shumar) | Voth hunts escaped slaves; Dalab its Giants |

### 4.2 The big flows

- **Food.**
  - The Nulab basin feeds Ledge, Blakhed and the Union's southern lojes.
  - The Tungangs live on dark-bed mash and hearth wax, and buy **grain from Dalab by the Line** (Loj Twenny's sim does exactly this).
  - The Fellgangs eat herd meat, bell seed, eggs and honey, and buy grain with ice.
  - Tallwalls feeds itself and more: the best farm ground on the map.
- **Water.** Plentiful at the lake (the Chimes Riba) and on the wet south tableland. The hot holds need cisterns and **ice**.
- **Cold (ice).** The Ice-cutters' and the shaft heads' ice goes to the hot holds, Blakhed's ice houses, the basin and Nulab. It
  is the Fellgangs' currency for grain.
- **Fuel and light.**
  - Hearth wax: the Tungangs' staple and the lamps.
  - Peat (moor sponge), dung, tallow.
  - **Timber is scarce below.** Loj Twenny is the census's one large timber customer.
  - No oil: no one here may extract it.
  - The Line's power is the hot-door plant.
- **Metals.**
  - Copper: Nulab 53, Ledge 24, the skarn 240, the coppersmiths' glacier.
  - Bronze: Ledge and Nulab are the census's top bronze producers. With Tallwalls' tin, the Realm holds 62% of the map's bronze.
  - Iron: the Line's north valley, Nulab's near ore, the skarn.
  - Tin: the north door's granite, Tallwalls.
  - Nickel: the breccia, the only nickel on the Line.
  - Gold: the Fellgang camp.
  - **Rare earths:** the rift fill's 190, but **only Tungangs may extract them, within ~5 km of a bore** (TRADE-SCOPE 2.4). So
    Nulab's and Ledge's rare earths are Dalab's ground and the Union's work.
- **Saltpeter.** Tallwalls (the map's largest) and the Tungang cave works.
- **Salvage.** Line cable, rail and tunnel parts (the Union's); **recharged Ancient power cells** ("the rarest thing they
  sell", wanted by the Geomancers and Eternians); Ledge's and Chimes' arcology scrap; Wildcat's scrap.
- **Luxury.**
  - Dalab's gene-craft and healing at Ledge (50) and Nulab (80).
  - Ledge's gene bank of rim flora.
  - Mist tea, lotus silk and camphor from the basin.
  - Kimr mammoth ivory, aurochs hides and Firebliss obsidian (through Wildcat).
  - Fellgang gold.
  - Moonglass, rarely, "from the east" (the Glaziers' Lāiṭwāl).

### 4.3 Polities' revenue (proposed)

- **Dalab:**
  - the Nulab basin's tithe;
  - **Blakhed's toll in kind** (ice, eggs, rope);
  - gene-craft sales;
  - its share of the Great Caravan (46% of the operation, Gemini).
  
  It pays the Union for passage, the lifts and guides.
- **Tungang Union:**
  - passage (trains through the hot middle, Ledge's lifts, guides);
  - metals, rare earths and power cells;
  - saltpeter;
  - labour on the Line;
  - a tenth of the Great Caravan (Gemini).
  
  No taxes: the lojes are communes, and the Tpresden is an honour.
- **Fellgangs:** carriage (the Travellers), ice, eggs and honey, hides, gold, copper; raiding, which takes value rather than
  making it.
- **Free Giants:** saltpeter, tin, farm surplus, livestock. Their customers are uncertain (Q13).

### 4.4 Shortfalls and dependencies

1. **Salt.** None in reach of any West Rift town (census: the nearest good rock salt is at 354,1347, 169-258 km west in the fells).
   Ledge needs 88 t and Nulab 77 t (census customers). The only big source nearby is Tallwalls, held by the Free Giants, Dalab's
   runaways. *Yet the Great Caravan brings salt to Xanadu from Shelf.* The two cannot both stand without a Dalab salt source north
   of the Wall (Q5).

   **The map's answer (2026-11-16, asked by the owner: "the closest salt source in the west that is least vulnerable to the
   lizardmen").** The geology layer (`kits/resources/data/geology.json`, halite and gypsum) has **no salt and no gypsum within
   120 km of Nulab, Ledge or Blakhed**. The nearest salt is **the western fells' high salt basins**: two closed basins drying
   to salt, `basin:104` at 344,1347 (level 5,896 m, 45 cells) and the larger `basin:32` at 322,1341 (5,924 m, 308 cells), with
   halite in about 20 cells at 327-355 x 1335-1359 (strongest 151 of 255; the census's "good rock salt at 354,1347" is its
   east edge). It is the Changthang's pattern: salt lakes on a 6 km plateau, harvested in summer and carried down by drove.
   - **Distances (straight):** the drovers (393,1338) 98 km; Ledge's head on the table-land 189 km; Nulab 197 km; Blakhed
     219 km. The straight lines cross 6.1-6.3 km ground; a drove road would find the valleys.
   - **The Lizardmen:** the basins are **~460 km from the Lizardmen's polygon** (565-882 x 1417-1675), the farthest salt in the
     West from them, and every road from them runs west and north, away from it. Nulab and Blakhed are themselves 250-270 km
     from the polygon. The West's strongest halite (205-254) lies **inside** the Lizardmen's country (641-715 x 1483-1525,
     the salt lakes at -1,700 m), 430-470 km from the towns; Tallwalls' salt (~500 t) is the Free Giants'.
   - **Who works it: the drovers** (the owner, 2026-11-16: "We'll have the drovers be a major salt source"). *Proposed:* the
     drovers and their kin cut it in summer camps on the basins, 98 km above their own shielings; salt down by
     drove to Blakhed's market and to Ledge's head for grain and metal, as the Changthang's salt went for barley. At 5.9 km
     (~0.77 atm) only the cold-hardy can work it: the Fellgangs, or Dalab's cold-modded.
   - **What it must cover** (est.): about 7.5 kg a person a year (Nulab's plan) across ~112,500 people is **~850 t a year**,
     the Tungangs' share included. A works of a few hundred summer hands on two basins can make that.
2. **Ledge rests on the Union.** Its lifts and the road's tunnels are Tungang ground; Dalab's cold mods came from Tungang genes.
   The bargain is grain, medicine and cloth for passage and guides; the strike is the Union's weapon.
3. **The Union rests on Dalab's grain and timber**, and on the long run staying whole. The north end's iron and tin reach the
   south only through the hot section.
4. **The hot holds rest on Fellgang ice.**
5. **Rare earths are locked:** Dalab owns the ground, the Union owns the right to work it.
6. **Raids.** Fellgangs against southern Dalab (PLAN-POLITICS raid zone 4); Wildcat against the ice road; a Fellgang rising
   to take Nulab (PLAN-POLITICS rising 8); "Dalab against the Tungangs (if desperate enough to try to break a strike)"; "the Free
   Giants against Dalab" (contests 3). The west and Nulab are also refugee destinations "when the Tungangers are cooperative"
   (PLAN-POLITICS:203).

### 4.5 Links to the East Rift sim

- **The Great Caravan** is the one legal link: XAN_TUNE's `gate.dalab` stand-ins at Blakhed, Nulab and Shelf become real stops.
  Its cuts stay where they are: the Golden Tears' 4% escort and the Two Horns' margin at the capital.
- **The Dalab mission at Thalaba** (`dalab.thalaba`, about 30 people) and its hearthseed expedition. The seed goes home to Dalab
  with the Great Caravan.
- **The Union's other ends:**
  - the Glaziers of Lāiṭwāl (the eastern loj, ~2,500 at 1028,1653, in the Xanadu sim's province), half a legend to the western
    lojes;
  - Loj Nahn in the Pile (no contact);
  - the dead extension of the Line to Theodiga and Strongbow.
- **Otherwise, nothing:** "barely any trade" across the Lizardmen's floor (TRADE-SCOPE 2.1). The West Rift's other trade goes
  north over the Wall to Dalab and on through Dalab's port at Dapor and the Lake of Shim (Gemini routes everything West Rift
  "Dapor -> Shim").

## 5. Open questions for the owner

1. **Extent.** Is the West Rift the Rift west of the Lizardmen plus the rim (Dalab's south, the Union, the Fellgangs)? Do
   Tallwalls, Tallhouse and Greenstep belong (TRADE-SCOPE says yes; Greenstep drains north to Shim, outside `The Rift` polygon)?
   Are the Kimr and Hall of Heroes in it or neighbours? Are Shelf and Dalab members or the gateway?
2. **Populations.** There is no stated figure for any West Rift place but Blakhed (1,000-2,000) and Loj Nahn (~1,000). The open ones:
   - **Ledge:** 10,000 by type, against Gemini's 2,200 and the lore's "tenuous".
   - **Nulab:** 8,000 by type.
   - **The Tungang Union:** census 500, Gemini 18,760, the kit's 25-40k.
   - **The Fellgangs, the Travellers, the Kimr, Greenstep's countryside.**
   - **A rural ratio** for a frontier (1x proposed here).
3. **Ledge's polity.** The repo says Dalab, with Loj Fower at the lifts; Gemini says Tungang. How does Ledge split between Dalab
   and the loj?
4. **Loj Twenny.** The pin move to 445,1266 (station 3) is on its branch, not the map; its size is 165 drawn against 500 by type.
5. **Salt.** Where does the West Rift's salt come from? Tallwalls (hostile), a new works on the unclaimed rock salt at 354,1347
   (a Fellgang works, beside the drovers and pass-keepers?), or Dalab's own? **Settled (the owner, 2026-11-16): the drovers are a
   major salt source**, from the western fells' high salt basins. *The map's answer (4.4, item 1): the western
   fells' high salt basins, 327-355 x 1335-1359, the nearest salt and the farthest from the Lizardmen; the owner to confirm.* And how does Shelf ship salt to Xanadu with the
   Great Caravan if south Dalab is short?
6. **The Great Caravan's path across the Rift.** riftrim's 2026-11-13 note (Gemini, "for the owner to review") runs it by the S-rim
   footwall ramps past Cthonos and the Opal Valley relay. XAN_TUNE's legs are 52 days each; Gemini says 831 km in 90 days. Does it
   cross Lizardmen country, and how does that square with "barely any trade"? Is the Union's 10% share canon?
7. **Rare earths.** Dalab's ground, the Union's right. Does the Union work Nulab's and Ledge's under a Geomancer-style licence for
   Dalab, or are they unworked?
8. **The Ice-cutters' buyers.** "The Rift floor's towns" below the south wall are Cthonos (a ruin) and Lizardmen country. Who buys
   the ice there?
9. **The Union's shape.** How many lojes (the kit proposed about forty)? The Hearth hold's name, number and size? Which lojes keep
   which segment?
10. **The bargain.** Does Dalab ship by the Line (Tungang trains, Tungang passage fees) or only by its own road? What are the
    terms: grain and medicine for passage?
11. **Money.** Dalab's currency, Tungang barter or Izani Talents? (PLAN-MONEY.)
12. **The Free Giants' trade.** They are escaped slaves of Voth and Dalab. Who buys their saltpeter (Gemini sends it to Roketstad,
    Iziz and Cascade by Shim, which is Voth's lake), and do they trade into the Rift at all?
13. **Sites still to place:** the Dalab skarn hamlet (416,1377), the coppersmiths' exact site, and the pins for Blakhed, the
    Fowlers, the Ice-cutters, the drovers, the pass-keepers and the Hearth hold (none is on the model).
14. **Names.** Every Rift name but Ledge, Arccube and Pluton is tentative. Span's barricade is also "the Line" (rename owed,
    ANCIENT-NETWORK q11).
15. **Stale lore coordinates.** LORE 6.20 l.948-950 and section 4 l.168 still give the Lizardmen and the Pile on the 4.2x canvas
    (Sauropolis 493,1266; the Pile 448,1237); on 5.1 they are 765,1596 and 720,1567.
16. **Kimr numbers** (the labyrinth plan: "the floors could feed a few tens of thousands").

## 6. Proposed build order (W steps, on the East Rift's pattern)

Each step ends in a node test on the valley host, with a negative for each check, as Longsong's and Xanadu's do.

- **W0. Settle the numbers and the map** (no code):
  - the owner's answers to Q1-Q5;
  - the pin batch queued with the scale-model session: Blakhed, the Fowlers, the Ice-cutters, the drovers, the pass-keepers, the
    coppersmiths, the Dalab skarn hamlet, the Hearth hold, Loj Twenny's move, perhaps a salt works;
  - `PROPOSAL-WEST-RIFT.md` in `core/simulation/`, like PROPOSAL-XANADU.
- **W1. `WR_TUNE` (`core/region/data/wr-tune.js`, `[G data]`)**, data only, X0's pattern:
  - **Settlements:** sections 3a-3c, at their own `scale` (the districts 200, the towns 50, the lojes and villages 10); Loj
    Twenny's LTS numbers folded in.
  - **Goods:** mash, wax, ice, eggs, honey, ore, rare earths, copper, bronze, saltpeter, salvage, power cells, gene-craft and so on.
  - **Diets and the calendar:** the Ice-cutters' winter cut, the Fowlers' egg season, the gold camp's summer, the drovers'
    shielings, the Fair, the Big Meeting.
  - **Roads:** the Dalab road, the lifts and lake, the gorge stair, the ice and egg roads, the great shaft.
  - **Dalab's heartland:** an off-map gateway market (`gate.dalab.north`), as Iziz is for Xanadu.
  - **Test:** a year runs; everyone is fed; the books close; the Union gets its grain; the hot holds get their ice; Ledge's salt
    gap shows.
- **W2. The Line as a carrier** (C1-C5's fields, no new mechanism if they suffice):
  - each segment a road with `legs` and its own trains (`carriers`), the gaps as `halts` portered by the Travellers (`provision`);
  - the hot section's doors as `closed`;
  - the rift fill's rare earths as X2's fields of veins within 5 km of the bore;
  - the Fixers' upkeep as a work that eats metal and wax.
  - **Test:** iron and tin reach the south only while the long run is whole; a negative cuts it.
- **W3. Join the East Rift** (`RIFTS.valley(...)`, or extend `EAST_RIFT`):
  - replace `gate.dalab.blakhed`, `.nulab` and `.shelf` with WR_TUNE's settlements;
  - give the Great Caravan's round its true leg lengths (`legs`);
  - keep the Golden Tears' and Two Horns' cuts;
  - add the Union's 10% if canon.
  - **Test:** `test-east-rift.js` and `test-xan-economy.js` pass unchanged; the caravan lands Xanadu's goods at Blakhed and Nulab
    and loads Shelf's.
- **W4. The polities' books:**
  - Dalab's treasury: the Nulab tithe, Blakhed's toll in kind, gene-craft;
  - the bargain as transfers: Dalab's grain and medicine against the Union's passage at the lifts and the Line;
  - the Union's books per loj, with the Tpresden;
  - Tallwalls as its own polity.
  - **Test:** dues and the bargain balance a year.
- **W5. Strikes, raids and risings.** These need the city host's needs and unrest on the valley host, as X5 does:
  - the Union's strike: the lifts stopped and the shafts as raid points on the Dalab road;
  - Fellgang raids on supply trains and on the ice road;
  - a Fellgang rising at Nulab;
  - the Free Giants against Dalab.
  - **Test:** a strike starves Ledge before Dalab breaks; the books hold.
- **W6, later:**
  - the Kimr and the Hall of Heroes as a market through Wildcat;
  - Tallwalls' trade north by Shim and Shumar;
  - Loj Nahn and the Pile (no trade: the reward);
  - the refugees' "west rim and Nulab" destination.

**Size.** About 42,000 people at those scales is roughly 110 actors in the districts, 250 in the towns and 1,000 in the villages
and lojes: about 1,400 actors (est.). Joined to the East Rift's 472, it should still run a year in about two minutes (est.).

## Sources read

- `openworld/TRADE-SCOPE.md`, `TRADE-GOODS.md`, `RESOURCES-SETTLEMENTS.md`, `PLAN-SETTLEMENTS.md`, `ANCIENT-NETWORK.md`
- `openworld/populations-gemini.json` (by script), `TRADE-GEMINI.md` (grep)
- `LORE.md` 3.1, 4 (l.168), 6.1, 6.17, 6.20-6.23
- `kits/tungang/PLAN.md` 1.2-1.4
- `biomes/riftrim/PLAN.md` (5.1 survey, sections 5-6), `biomes/hearths/PLAN.md`, `biomes/labyrinth/PLAN.md`, `biomes/greenstep/PLAN.md`
- `core/region/README.md`, `data/east-rift.js`, `data/xan-tune.js` (the gateways), `50-region-valley.js` (the spec)
- `core/simulation/PROPOSAL-XANADU.md`, `PLAN-POLITICS.md`, `PROPOSAL-LIZARDMEN.md`, `LIZARDMEN-SURVEY.md`
- Scale model: `tools/scale-model/model/src/60-settlements.js` and `51-region-store.js` (parsed by script: pins and polygons)
- From `claude/loj-twenny-059a5e`: `biomes/line/PLAN.md`, `settlements/loj-twenny/PLAN.md`
