# The next round of resource and trade changes: scope (the owner, 2026-11-12)

The owner's choices for the round after `TRADE-GOODS.md` section 5a ("Apply both"). **Nothing here is built yet**: this file
says what was chosen, the numbers behind each choice, the new lodes, the scale-model queue's edits and what each change
reaches. Implementation waits for the owner's go-ahead.

**Where the numbers come from.** The census (`RESOURCES-SETTLEMENTS.md`) and the trade model (`TRADE-GOODS.md`, the 5.1e8
scan), rerun with the rules below that need no new pin: the gateway rule, the extraction rule with concessions, oil demand
by use, Tallwalls a town. The rerun is the parent session's `trade.py` with these patches (scratchpad `trade2.py`); "before"
is the published table, "after" the rerun. **Not in the rerun:** the 5.1e9 pins (the Xanadu gold mines, the Tungang
saltpeter works, the Fellgang gold camp, the Coyote salt works), the new pins proposed here, native crops (they need each
settlement's biome) and scrap smelting. Tallwalls as a town is approximated: its 30 km reach's sums scaled by (20/30)²,
not rescanned. Every figure is notional, as in `TRADE-GOODS.md` section 1.

## 1. What the owner chose

| # | Change | The owner's words (2026-11-12) |
|---|---|---|
| 1 | **The East Rift trades through gateways** | "because of the lizardmen there is barely any trade between the eastern and western rift; so xanadu's main suppliers will be iziz, yuni, the dasri, plus indirectly, their own trade partners" |
| 2 | **Xanadu's salt from the Dasri, the Bowl and the north** | "dasri salt works, but also salt from the Bowl and other points further north. the catch itself is so remote and hostile it's hard to get enough workforce there to meet demand" |
| 3 | **Tallwalls a town** | "make it poorer; also, it should not be the main supplier of the xanadu for anything"; "Smaller: a town" |
| 4 | **Only some peoples can extract oil and rare earths** | "no one but Yuni, the Eternians, and the Order has the tech to actually extract oil or rare earths, although Tungangs can extract rare earths as well" |
| 5 | **Geomancer concessions** | the Geomancers may work other polities' oil fields under licence: "Yes, under licence" |
| 6 | **Oil demand by use** | "rebase; ... Eternians would also have high demand for oil since their tech is as modern as Yuni's is (though they use vehicles much less); they have widespread electrification, though they also have access to some ancient power sources similar to yuni" |
| 7 | **Locus gets its oil** | "Lode now, rule later" |
| 8 | **Native crops** | the four sets (the Vale, the Isles, Oidong, the jungle dyes), and: "eternal state should have its own tea as well. Dalab ... will have hashish. SW bay/sw highlands will have some valuable native plants. xanadu can also have tea and poppy. incense-bearing plants should be mostly limited to the sedesert/ebadlands regions ... tobacco tends to be limited to the inner crater. the eternians are also famed for their wine"; hashish: "Dalab's lands" |
| 9 | **Natural exports for the craft-only polities** | the Republic's Lipp tin, the Zeijani's Dhelv gold and silver, Jimjam's gypsum |
| 10 | **Scrap to iron** | "Model + scope the sim" |

## 2. Each change, with the numbers

### 2.1 The East Rift trades through gateways

**The rule.** The East Rift (the Xanadu Sultanate, the Order of Historians at Longsong, the Singing Gjar outpost) trades
direct only with **the Empire of Iziz, the Yuni Emirate and the Dasri** (Nomad Country in the model: Shade's people, LORE 6.8),
over the Catch (by Stair) and the high passes north (LORE.md:500). Everyone else's goods reach it **re-exported** by those
three, and its exports leave the same way. The West Rift (Ledge, Nulab, Loj Twenny, Wildcat, Tallwalls, Tallhouse) has no
route east: the Lizardmen's floor lies between (LORE 6.20). The Lizardmen stay outside trade, as before.

**What it moves** (the East Rift's imports, before and after; a year):

| Good | East Rift need | Before: from | After (direct only): from |
|---|---|---|---|
| pearls (kg) | 577 | League 294, Kautoa 84 | **none direct**: re-exported through Iziz (Hook's 166 kg, LORE.md:259) or not at all |
| salt (t) | 293 | Free Giants 90, Iziz 48, Voth 47, League 17 | Iziz 201, Yuni 68, Dasri 15 (before the new salt works, 2.2) |
| gold (kg) | 241 | Voth 70, Yuni 43, Free Giants 40, Dalab 18 | Yuni 189, Dasri 31, Iziz 13 (before the 5.1e9 gold mines) |
| scrap (t) | 177 | Iziz 79, Beast Riders 20, Republic 11 | Iziz 124, Yuni 7 (131 of 177, as before) |
| mounts (head) | 171 | Beast Riders 54, Dasri 20, Free Clans 8 | Dasri 90 (camels) |
| coal (t) | 363 | Iziz 162, Voth 79, Beast Riders 67 | Iziz 363 |
| oil (t) | 85 | (60, almost none met) | Yuni 85, from Qiblai's own field under licence (2.4) |
| arms, electrics, scrap goods, books | 11.5, 5.2, 5.8, 1.2 | Iziz, Yuni, the Dasri, the Order | the same |
| almanacs, porcelain, plaid, rockets, Spice Isles spice, gene-craft, fungal distillates, relics, lenses | 0.6 to 29 each | their makers | **none direct**: re-exported through the gateways |

So the gateways already carry Xanadu's salt, gold, scrap, coal, arms and oil; what is cut is the luxuries made elsewhere
(pearls first: Xanadu's pearl demand is x5) and the crafts of the north and west. **The model needs a re-export leg**:
a gateway buys a good it does not make from its own partners (the routes it already has) and sells it on to the East Rift at
a markup, so Ys's pearls reach Erewhon through Iziz and Fulcrum's porcelain through Yuni. Without it those goods show as
unmet need.

### 2.2 Xanadu's salt

Xanadu's five pins are short **~290 t** a year (Erehwon 172, Theodiga 83 ...): the Vale has no salt in reach
(`RESOURCES-SETTLEMENTS.md` section 4). Today Tallwalls sends the most (58 t to Erehwon over 585 km); under 2.1 it sends none.
Three sources, as the owner put it, the Catch the smallest because it is hard to man:

| Source | Ground (census) | Who works it | Share of Xanadu's salt (proposed) |
|---|---|---|---|
| **The Catch: a Dasri salt works** | rock salt at 1080,1428: node-yield 61.6, peak 243, 352 km² rich, beside gypsum (52.9), potash (32.3 at 1069,1415), soda (44.6) and saltpeter (32.0 at 1068,1409); 59 km from Stair, ~370 km from Strongbow and Theodiga; no polity polygon; ET, 457 m | a seasonal Dasri camp (an outpost of ~150): the crossing is too hostile for more (LORE.md:80-86) | about a third (~100 t) |
| **The Bowl: an Izani salt works** | rock salt at 1169,1150: node-yield 33.4, peak 234, 152 km² rich, with gypsum 35.3 at 1163,1157; the Bowl's salt lake (`basin:3`, 1147,1141, -1,158 m); 115 km from Mantis, which has 300 people and so only 60 t of salt | Mantis's Izani merchant houses (LORE.md:254): a works village of the Empire | about a third |
| **The north** | Iziz's net salt surplus 1,680 t (Hook 595), Yuni's 751 (Verge 554) | Izani and Yuni caravans over the Catch | the rest; the rerun already sends Iziz 201 t and Yuni 68 t |

The Dasri's salt is their first **natural** unique (today they sell only scrap goods and camels): the Catch is "Krator's one
great salt field" (LORE.md:86). Both works are pins for the queue (section 4).

### 2.3 Tallwalls a town

Tallwalls (the Free Giants' haven, 650,1268) from a city (30 km reach, ~8,000 estimated) to a **town** (20 km reach,
~2,500). Approximate effect (reach scaled, not rescanned):

| Good | Supply before | after | The Free Giants' share of the map's surplus |
|---|---|---|---|
| salt (t) | 1,490 | 500 | 13% to ~5% (no longer in the top five) |
| saltpeter (t) | 189 | 70 | 63% to **38%**: still the largest saltpeter exporter, now with Iziz 16%, Yuni 9% and the 5.1e9 Tungang works beside it |
| tin (t) | 35 | 13 | 12% to under 6% |
| gold (kg), silver (kg) | 110, 589 | 41, 219 | out of the top five in both |
| tea, silk, reagents (t) | 434, 91, 45 | 125, 26, 13 | out of the top five in all three |
| farmland in reach (km²-eq) | 2,466 | ~1,100 | still rich ground, worked by fewer hands |

With 2.1, Tallwalls supplies Xanadu with nothing. Its ground stays the best in the south-west: a town of Free Giants on it,
not a city. **The queue edit is a type change** (section 4); the census should rescan it at 20 km after.

### 2.4 Oil and rare earths: who can extract them, concessions, demand, Locus

**The extraction rule.** Only **Yuni (the Geomancers), the Eternians and the Order** extract oil and rare earths; the
**Tungangs** extract rare earths too, but **only the deposits they reach from the tunnels**. **The Geomancers work other
polities' oil fields under licence**: the oil is sold as Yuni's. **The licence's terms** (the owner, 2026-11-12): the host
gets **10% of the profits** and **20% off the oil from that site only**. **The Geomancers may also work rare earths in Yuni's
lands and nearby.** Nobody else's rare earths are worked.

**The Tungangs' tunnels.** The Rift line's bore (`openworld/ANCIENT-TUNNELS.md` section 1: 439 km, px 464,1112 to 437,1330,
Dalab to Ledge, Loj Twenny on it) runs through rich rare-earth ground: within 5 km of the bore, 3,056 km² are over 100
(max 190, mean 111); within 10 km, 6,160 km². So the Tungangs' rare earths are limited by hands, not ground: Loj Twenny's
500 people work 0.9 t today. The model counts a Tungang settlement's rare earths only within a few km of a bore or its
caverns (5 km proposed), so the Line has to go into the model as a polyline. Ledge, where the line comes out (Ledge's lifts
are Loj Fower, LORE.md:221), reaches the bore's southern end; Dalab's own rare earths there stay unworked.

**"Yuni's lands and nearby."** Yuni's pins stand on granite with rare earths at 160 almost everywhere: within 50 km of a
Yuni pin 12,500 km² are over 100, within 200 km 126,800 km². "Nearby" is proposed as **200 km of a Yuni pin**. That takes
in no other polity's pin today (the nearest are Mungo, 265 km from Verge, and Talia, 391 km), so in practice the
concession is Yuni's own ground, worked as far as its hands reach.

**Oil, before and after** (net exports, t a year):

| | Before | After |
|---|---|---|
| Exporters | Beast Riders 42% (520), Iziz 27% (340), Xanadu 21% (254), Screamers 9% (111) | **Yuni 100% (1,506)**, from its licensed fields: Mav's Refuge, Iziz, Qiblai, Pinnacle Rock, Hexahedron, Fridon ... |
| Importers | Yuni 247, Republic 105, Eternians 64, League 50, Voth 29 | **Eternians 151**, Xanadu 85, Republic 68, Voth 67, Iziz 57 (buying back its own ground's oil) |

The Eternians can extract but stand on almost none (32 t: Lux 26, Fulcrum 6): they become the largest oil customer.

**Oil demand by use** (replaces the flat 1 kg a head x wealth x culture; kg a head x wealth): lamp oil 0.3 everywhere, plus

| Polity | Generators | Vehicles and mechs | Total | Demand before, after (t) |
|---|---|---|---|---|
| Eternal State | 3.0 (widespread electrification, part of it on Ancient sources) | 0.5 (few vehicles) | 3.8 | 96, **183** |
| Empire of Iziz | 1.5 (hilltop generators, LORE.md:165) | 1.5 (the mechs) | 3.3 | 305, 252 |
| Xanadu Sultanate | 1.0 (the Sultan's generators on salvaged engines, LORE.md:148, 168); Erehwon +1.5 (the Pleasure Dome) | - | 1.3 | 115, 123 |
| Vothic Kingdom | 0.5 (the nobility's light and defence, LORE.md:170) | - | 0.8 | 130, 104 |
| Yuni Emirate | 0.5 (the Grand Vault, geothermal, lights Yuni, LORE.md:146); Locus +6 (the Geomancers' generator and still-house) | 2.0 (the buggies, LORE.md:187) | 2.8 | 250, **75** |
| Iron Republic | 2.0 (industry, the rich's light) | 0.3 | 2.6 | 105, 68 |
| everyone else | - | - | 0.3 | 5 to 60 each, now a third |
| **Total** | | | | **1,277, 884** |

**Locus's oil.** Locus has never had oil in any bake: on 4.23 (995,713) the best within 10 km was 2 of 255, on 5.1
(1267,1043) 7, and the nearest good oil (100+) is 98 km north at 1268,994. The bake makes oil only from coal basins
(0.9 x coal smoothed over ~44 km, + 110 on low rift floors), and Locus stands on granite by the lake; LORE 6.9's "delta at the
red salt lake" never reached the bake. **This round: a lode** (section 3). **Later: a bake rule** for oil under river deltas
into salt-lake basins (salt domes trap oil, as on the Gulf Coast and the Caspian), map-wide, with a rebake; it is listed in
section 5 and goes to `kits/resources/GEOLOGY.md` when scoped.

**Rare earths, before and after** (net exports, t a year):

| | Before | After |
|---|---|---|
| Exporters | Xanadu 36% (25.5), Dalab 22% (15.5), Voth 10%, Yuni 10%, Eternians 7% | **Yuni 54% (6.7)**, **Eternians 38% (4.7)**, Tungangs 7% (0.9), the Order (0.02) |
| Importers | Iziz 1.1, Republic 0.2 | Iziz 2.0, Dalab 0.5, Xanadu 0.5, Republic 0.4 |

Net exports (12.2) still cover net imports (3.3). **Xanadu loses its rare earths and its oil** as exports (its two largest natural
ones after copper); the native crops (2.5) give it cacao, saffron, tea and poppy instead.

### 2.5 Native crops

**The rule.** A prized crop grows only in its **home** biomes, plus where a polity has **transplanted** it (a recorded
exception, by settlement). `kits/crops` already gives each crop a `home`; today `CROPS.at` returns it anywhere its climate fits,
so cacao, coffee, clove, sugar and cotton grow in every warm belt and barely trade (`TRADE-GOODS.md` section 1). The change: a
`native: true` flag (for climate crops; `homeOnly` stays for dyes and resins that are not climate crops) and a
`transplanted: [settlement ids]` list.

| Home | Crops native there | Who gains | Change in `kits/crops` |
|---|---|---|---|
| `xanadu` (the Vale) | cacao, Vale saffron, mist tea, sky poppy | Xanadu | `native` on cacao, saffron, tea; `xanadu` added to sky poppy's home |
| `ringisles` | clove, coffee, kava, sugar cane | the League, Kautoa (and Voth's Spice Isles' re-export) | `native` on the four |
| `oidong` | mist tea, lotus silk, camphor, sky poppy | the Order | `native` on the four (tea and poppy shared with the Vale) |
| the hyperjungle biomes, `ringisles`, `nwbay`, `swbay`, `throne` | jungle indigo, sunseed annatto (bloodwood red stays the hyperjungle's alone, 5a) | the Screamers, the League and Kautoa, Voth, the NW bay's holders | `native` on indigo and annatto; their homes widened (the owner, 2026-11-12: "indigo and anatto can be in the ring isles, nw/sw bay and throne as well") |
| `nwlowlands` (the Eternians) | **an Eternian tea** and **an Eternian wine grape** | the Eternians | two new records; the grape is a crop the farms grow, and **Eternian wine** is a specialty in the trade model made from it ("famed for their wine"; the owner: "wine has a grape crop to go with it") |
| `swlowlands` (Dalab), and where Dalab spread it | **hashish** | Dalab | a new record (the resin of a hemp), `native`, home `swlowlands`; **transplanted by polity**: wherever Dalab holds ground its climate fits, the rift rim first (`riftrim`: Ledge, Nulab). The owner: "for dalab, Sw lowlands and places they spread their crops to like the rift rim" |
| `swbay`, `swhighlands` | **four valuable natives** (2.5a, a proposal) | Voth (the bay); the Republic's north and Dalab's Span (the highlands) | four new records |
| `sedesert`, `ebadlands` | incense: myrrh and dragon's blood (sedesert), and a badlands incense (2.5b) | the south-east desert's holders; Yuni (the badlands) | dragon's blood resin's home **trimmed to `sedesert`** (from `nwbay`, `rift`, `sedesert`, `swbay`; the owner, 2026-11-12); a new ebadlands record; Oidong's temple-cedar incense and monk's sage stay (the owner's "mostly") |
| the inner crater | tobacco | the inner crater's polities | tobacco (`src: 'proposed'`, no home today) made `native`, home: `crater-drylands`, `nwbay`, `swbay`, `hyperjungle`, `ringisles`, `geyser` (the Steampits' field), `abyssal-savannah` (its rim) and `throne`, wherever its climate fits there (warmth 3-4, aridity 2-3). The owner: "any appropriate koppen within" those biomes |

**Homes outside `CROPS.BIOMES`.** `riftrim`, `abyssal-savannah` and `swhighlands` are biome kits but not crop zones yet
(`kits/crops/src/10-crop-core.js` `CROPS.BIOMES`). A `home` can name one (laterite ochre's home is `abyssal-savannah`), but
`CROPS.at` cannot place it on the axes until the zone is added: three zones to add, from each kit's `PLAN.md`.
**"The hyperjungle biomes"** (the owner, 2026-11-12: "the jungle biomes that take parts of its kit", then "ring isles and
k-guilin can count as hyperjungle biomes. dambasins should not count, and only hyperjungle geysers should count. throne
stations that are damp enough to support the flora should count"):
- `hyperjungle` itself;
- `ringisles` and `k-guilin`;
- `korona` (the gorge floor's and the rim's forest);
- `necanyons` (the canyon floor's forest);
- `abyssal-savannah` (the savannah rims, from the hyperjungle's northern savannah);
- `geyser`'s showcase only: station 1, the Steampits' basin walled by the hyperjungle. Not the stations on other ground
  (`puna`, `ice`, `corona`, `field`, `stills`);
- `throne`'s damp stations: the kipuka (2, "islands of old hyperjungle"), the spice frontier (3, the windward jungle), the
  geyser isle (4) and the cloud forest (5). Not the dry ones: the savanna, the ash desert, vent country, the caldera, the
  penitentes, the glacier, the tube, the lava delta, the blast zone.

Not counted: `dambasins`, `guilin` (helper globals and sky only), `crater-drylands` (fauna only). A home that names "the
hyperjungle" means this list. Because the Throne and the geyser kit count by station, `CROPS.at` needs the station's zone
(the Throne's `windward`), not the whole kit.

**Today's producers these cut** (the published tables): cacao's top five are Voth, Jimjam, Dalab, Fulcrum, Erehwon; coffee's
Voth, Jimjam, Dalab, Erehwon, Fulcrum; tea's the Republic (27%), Dalab, Iziz, the Free Giants, the Talovolci; tobacco's
Voth 2,396 t, Xanadu 1,658, the Eternians 1,493, Dalab 1,445. Under the rule most of these fall to their homes'; the
trade model must place each settlement in a biome (the scale model's biome polygons) before it can say how much.

**The isle demo must be reworked** (the owner, 2026-11-12; a to-do in `TODO.md`). Its plantations
(`settlements/isle-demo/src/15-isle-tune.js`: Nephtos's cacao, indigo, annatto and tobacco, worked by hired Islanders,
`:663`) and the traders' buy lists (`:335`, `:346`, `:347`) carry one crop these rules take off the Ring Isles: **cacao**
(the Vale's). Indigo and annatto stay (`ringisles` is in their homes), and so does tobacco (`ringisles` is in its inner
crater). The cacao plantings and buy-list entries change to a crop native to the isles or to cacao bought in through the
gateways, and the stocks proof and `test-sim.js` move on purpose.

### 2.5a The SW natives (a proposal; the owner: "make me a proposal")

Two for each biome. Each comes from a plant its kit already draws, so the crop and the drawn species are the same thing.
Each is a luxury that travels: dried, light and dear.

| Record (proposed id) | Bucket | Home | From the drawn species | What it is | Who sells it |
|---|---|---|---|---|---|
| **Rosette vanilla** (`rosette-vanilla`) | spice | `swbay` | the red and purple epiphyte rosettes on every bole, with their flower spikes (`biomes/swbay/NOTES.md`, "The flora") | the seed pods of the rosettes, hand-pollinated and cured for months: vanilla is an epiphytic orchid, and among the dearest spices | Voth (the bay) |
| **Capgill** (`capgill`) | medicine | `swbay` | the cap-tree, the bay's giant mushroom, its gills under the cap | the gills scraped, dried and pressed into cakes: a painkiller and fever cure. The bay's fungoid theme as a drug trade, apart from Dalab's hashish and the Oidong poppy's sleep | Voth |
| **Bead-cone gold silk** (`beadcone-silk`) | spinning | `swhighlands` (the bead cone grows in the bay's understorey too: `swbay` as a second home) | the bead cone, "hung with strings of gold eggs (an insect's nursery)" (`biomes/swhighlands/PLAN.md`, "Trees") | the nursery's cocoons reeled into a wild gold silk, like tussah or golden orb-weaver silk: a silk none of the mulberry or lotus silks match | the Republic's north, Dalab's Span; Voth from the bay |
| **Brush oil** (`brush-oil`) | medicine | `swhighlands` | the bottle brush of the dry-summer woods, 3.5-5 km (Dsb, Dsc) | oil steamed from the bristle crowns: an antiseptic and liniment, like tea-tree oil | the Republic's north, Dalab's Span |

A fifth if you want one: **torch-spike red**, the tableland's red flower spikes picked for their stigmas, a red dye and
spice. It would compete with the Vale's saffron, so I left it out.

### 2.5b The badlands incense (a proposal; the owner: "make me a proposal")

The badlands (`biomes/ebadlands`) are pinyon-juniper country: pinyon and Utah juniper in stands on the steppe and the
canyon benches, sagebrush between, bristlecones up high (`BIOME-API.md`, the zone table). Station 2, the canyons, is at
px 1279,1111, beside Yuni, so the badlands' incense is Yuni's.

| Record (proposed id) | Bucket | Home | From the drawn species | What it is |
|---|---|---|---|---|
| **Pinyon copal** (`pinyon-copal`) | fuel (also medicine) | `ebadlands` | the pinyon pine (species 0) | the pitch that beads on the pinyon's wounds, gathered in tears and aged: a clear amber incense with a sweet pine smoke, and a salve for cuts. Pinyon pitch was burned and used as a medicine in the American south-west |

One for the trade model to carry; **juniper smoke** (the Utah juniper's shavings and sagebrush, burned together) could be its
cheaper partner, but juniper berries are already the badlands' spice, so I would keep it to the copal.

### 2.5c Yuni's goods from the south-east basins (a proposal; the owner: "yuni should also export machine wax and other products from the SE basin biomes")

The SE basins are three biome regions on the Yuni Emirate's side of the Stalker Peaks: the **Siphon Pits** (Region 98,
`biomes/siphon-pits/PLAN.md`, `PLAN-STATIONS.md`), the **Loom-Chasms** (Region 99, `biomes/loom-chasms/PLAN.md`) and **Mid
Basin** between them (`biomes/midbasin/PLAN.md`). Yuni holds them on paper, with two villages at their edges: Spindle Fan
(1561,1140) and Ostrukh-on-Water (1516,1471). None of them has a kit yet. `LORE.md` says nothing of their goods, so
everything below comes from the three plans, and the trade model has none of it.

| Good | Where (5.1 px) | From | What it is and who buys it | Status |
|---|---|---|---|---|
| **Machine-wax** | the Siphon Pits' maar floors: station 3 at 1687,1555, the Ropers' camp Pit-Head 04 | the woolly siphon's "shaggy hydrocarbon fleece", 15 cm lanolin-wax pelts, rendered in copper kettles into amber ingots (`PLAN.md` section 3; `machine_wax` is a planned material slot) | a lubricant and grease for every machine: generators, buggies, Iziz's mechs, the Republic's firearms and rockets, Xanadu's salvaged engines; also a candle and sealing wax. Only the Siphon Pits grow it, so it is **Yuni's natural unique**. Buyers by machine count: Iziz, the Republic, the Eternians, Xanadu (through the gateways) | the owner named it: **chosen** |
| **Suture-gall wax** | the same pits, on damp basalt column fractures | the suture-galls, "fleshy, wax-storing bulbs" | a second, softer wax: folded into machine-wax as its low grade, not a good of its own | **chosen** |
| **Spinner cord** | the Loom-Chasms' slots, the parent colony on Mount Caelum (summit ~1622,1166) | the cable spinner's lines: "iron-silica fibre" grown into cables 15-40 cm thick | the young shoots' lines stripped and laid into cord and rope stronger than any fibre crop: lift cables, winch lines, ship rigging. A grown cable is tens of tonnes, so only the cord travels | **chosen** |
| **Ghaunt-ox** (beasts, wool and hides) | the Ostrukh Terraces (station 1, 1519,1453), the Siphon Pits' arable north-west | the woolly ghaunt-ox: a 1,800 kg six-limbed draft beast, domesticated on the terraces, wild on the scarps | draft teams and wool for the cold uplands; the trade model's "mounts and hides" class, with Yuni as a seller beside the Beast Riders and the Dasri | **chosen** |
| **Amethyst** | geodes on the Siphon Pits' rims (`biomes/CRYSTAL-CAVES-5.1.md`, site 3) | walk-in amethyst geodes in the basalt flows | gemstones, a luxury. The Zeijani revere thundereggs and vugs as shrines (`kits/zeijani/PLAN.md`), so they are a natural buyer | **chosen** |
| **White Loom salt** | Lake Nim's playa, ~1697,1176 | the Loom-Chasms' halite crust | salt for the Emirate's own east: Spindle Fan, the expeditions, the Cradle's farms. Too far from any customer to export | **chosen**, local only |

**What it needs.**
- **A works pin for the wax.** No pin reaches the maar floors: Ostrukh-on-Water is ~380 km off (the queue's check; the ~170 km in `biomes/midbasin/PLAN.md` is to Region 98's edge). The queue confirmed the site: 2,277 m on the maar floor, inside Region 98, the plan's px on the 5.1 canvas (`biomes/STATIONS-MAP-5.1.md` is wrong to call them old-canvas). The model counts a good only
  in a settlement's reach, so machine-wax needs **the Ropers' camp, Pit-Head 04, as an outpost pin** at ~1687,1555 (Yuni).
  That is a queue row (section 4), sent on the owner's go (2026-11-12: "yes to the taking the se basin goods and the pin").
- **A goods row each** in the trade model: machine-wax as a natural good, with demand by machine use like oil (2.4); the
  others as their classes.
- **Records:** machine-wax and spinner cord as `homeOnly` material records in `kits/crops`, home `siphon-pits` and
  `loom-chasms` (two more homes outside `CROPS.BIOMES`). The ghaunt-ox is fauna (`kits/fauna`); amethyst is a stone (`kits/resources`).

### 2.5d The eastern highlands' harvesters (the owner, 2026-11-12: "someone on the eastern highland harvesting the cushion wool and other native products"; culture and lore to come)

**The ground.** The eastern highlands kit (`biomes/ehighlands`) stands on the polygon `e inner wall` (5.1 px 946-1201 by
691-1085, 104,700 km²; `PLAN-STATIONS.md` section 0). Its cushion plateau is the high, dry ground: 48,900 km² are over
3.4 km with under 700 mm of rain. **What it yields** (`NOTES.md`, "How the ideas became species" and "The chemistry"):
- **cushion wool** from the woolbacks (the vegetable sheep's woolly lobes);
- **thorn gum** tapped from the thorn cushions (tragacanth);
- **wormwick**, the fungus-cured tonic from the glass towers' roots, "worth its weight in silver in the lowland cities";
- **tower honey**, the wild bees' pallidine honey;
- cushion turf for fuel, as the llareta is burned on the puna.

**The site: 1095,911.** I searched the polygon for the best village reach (10 km), at least 30 km from any pin, with cushion
ground within 20 km:

| | **1095,911 (chosen)** | 1024,1042 (the most fertile with no cushions near) |
|---|---|---|
| Farmland in a 10 km reach | 223 km²-eq (288 km² over .5) | 298 km²-eq (308 km² over .5) |
| Height, climate | 3,502 m, Dsb, 862 mm (920 mean over the reach), +7 °C | 2,581 m, Cfa, 784 mm, +12 °C |
| Air | ~1.03 atm | ~1.16 atm |
| Ground | a flat high basin (slope .02, 3,270-3,666 m over the reach), sedimentary; pasture .75, woods .56 | a flat bench, sedimentary |
| Cushion ground within 20 km | **380 km²** (the nearest 6 km off) | none (32 km off) |
| Polity | none (no polygon) | Empire of Iziz |
| Nearest pin | Talia, 71 km | Arcbeam, 36 km |

1024,1042 has the most farmland in the polygon (the wet face's benches, all Iziz's), but no cushions within reach.
**1095,911 is the best place to farm and harvest at once**: a high basin on the wet face just under the plateau's edge,
wet enough to farm (Dsb) and 6 km from the woolbacks, on ground no polity claims. The reach has no river (the model's
rivers start lower), so its water is rain and springs.

**The marker:** a village pin "Eastern highlands harvesters (to be named)" at 1095,911, no polity, sent to the queue on the
owner's word ("place a marker"); culture, lore and polity to come.

### 2.6 The craft-only polities' natural exports

| Polity | Today | The natural export | Ground (census) | How |
|---|---|---|---|---|
| Iron Republic | rockets, lenses (craft only) | **tin** | 706,628: 25 node-yield, 34 km from Lipp | a Lipp tin mine (queue) |
| Zeijani | fungal distillates (craft only) | **gold and silver** | 851,774: gold 10.5, silver 11.3 node-yield, 22 km from Dhelv | a works pin (queue); the Zeijani then sell beside the Vothic Kingdom (gold 29%, silver 31%) and Yuni |
| Jimjam | almanacs, brick (craft only) | **gypsum** (plaster and alabaster) | Jimjam leads the census: 22.4 good-ground node-yield | no pin: the trade model counts gypsum as a long-range good |

The Order stays craft-only (books), and gains the Oidong natives (2.5).

### 2.7 Scrap to iron

The design is `core/simulation/PROPOSAL-LONGSONG-PINNACLE.md` section 7 (scrap 1 + charcoal or coal 1 = iron 1 in 2 h). **In
the trade model:** a town short of iron smelts its own spare scrap with its own or bought coal before it buys iron.

| Town | Iron short (t) | Its scrap (spare) | Coal in reach | Covered by its scrap |
|---|---|---|---|---|
| Iziz | 86 | 600 (568) | 11,000 | all: the map's largest iron customer no longer buys |
| Drum (Voth) | 32 | 50 (40) | 4,800 | all |
| Almua (Voth) | 26 | 162 (154) | 1,250 | all |
| Fridon (Iziz) | 21 | 212 (204) | 5,780 | all |
| Tethis (League) | 14 | 208 (198) | 2 | with bought coal |
| Theodiga (Xanadu) | 12 | 50 (10) | 0 | 10 t, with bought coal |
| Ys, Zey'danin, Trigon, Shim | 37, 24, 20, 10 | 0 to 50 | various | little or none: they still buy |

Smelted scrap is spent: the Xanadu, Voth and Iziz demand for scrap rises against the ruins' fixed salvage, which is the
lore's pressure (Xanadu "deficient in iron ore and scrap", LORE.md:501). The model's scrap already credits the lived-in
Ancient hosts (Iziz 300, Pylon 150, Roketstad 150, Yuni 80, Hook 60); the geology's ruin bit does not (section 5).

## 3. New `lodes.json` entries

| id | family | px, py | r_km | peak | Why |
|---|---|---|---|---|---|
| `lode:locus-oil` | oil | 1267, 1043 | 14 | 200 | The owner, 2026-11-12: Locus is the Geomancers' oil town on "a delta at the red salt lake" (LORE 6.9), but the bake gives oil only on coal basins and never had oil at Locus (best within 10 km: 2 on 4.23, 7 on 5.1). Stamped, its reach holds 7 land cells, mean 175, max 195; 240 km² over 100. A stopgap for the delta rule (2.4, section 5). |

Before stamping, check the centre against the Yuni river's mouth (`core/world/83-world-water.js:9`, "the lake at Locus"):
half of the disc is lake, and the stamp raises land cells only. r 16 and peak 225 (the gold field's) would give 336 km²
over 100, mean 204 in the reach. Then, as `kits/resources/GEOLOGY.md` says: `python3 tools/scale-model/geology.py --lodes
kits/resources/data/geology.json kits/resources/data/lodes.json`, `node kits/resources/tests/test-res.js --ledger`,
`python3 godot/tools/sync_core.py`.

No other lode: the Catch's and the Bowl's salt, Lipp's tin and Dhelv's gold and silver are already in the geology.

## 4. The scale-model queue's edits

For the scale-model session's queue (`local_bf163a02`), not edited here. A proposed batch **5.1e10**:

| Edit | Name | px | Type | Polity, culture | Why |
|---|---|---|---|---|---|
| SETT_ADDED | **Ṣalṭ al-Bān** (Dasrī, "salt of the pan"), the Dasri salt works on the Catch | 1080,1428 | outpost | Nomad Country (the Dasri) | rock salt 243 (2.2); a seasonal camp, the Catch too hostile for more |
| SETT_ADDED | **Solta** (Izani, "salt", said solt'a), the Bowl salt works | 1169,1150 | village | Empire of Iziz (Mantis's merchant houses) | rock salt 234, gypsum 253 by the Bowl's salt lake (2.2) |
| SETT_ADDED | the Lipp tin mine (to be named) | 706,628 | village | Iron Republic | tin, 25 node-yield (2.6) |
| SETT_ADDED | **Ṣilbaru** (Zeijani, "silver"), the Dhelv silver works | 851,774 | village | Zeijani | gold 10.5 and silver 11.3 node-yield (2.6) |
| type change | Tallwalls | 650,1268 (unchanged) | city to **town** | Free Giants | the owner: poorer (2.3) |
| SETT_ADDED (**sent, the owner's go**) | Eastern highlands harvesters (to be named) | 1095,911 | village | none yet | the cushion plateau's harvesters (2.5d); culture and lore to come |
| SETT_ADDED (**sent, the owner's go**) | Pit-Head 04, the Ropers' camp (the Siphon Pits' plan names it) | ~1687,1555 | outpost | Yuni Emirate | the machine-wax works on the maar floor (2.5c) |
| page code | a **town** settlement type | - | - | - | the page's `SETT_TYPES` has no town (city, outpost, village, cavern, arcology, the ruins); the owner chose to add one, a glyph and a key entry, rather than make Tallwalls a village. The Tabist town takes it too |

The names are the owner's picks (2026-11-12) from proposals in each tongue (`LORE.md` 6.8 for Dasrī, `tools/names/izani.py`,
LORE.md:585 for Zeijani). The queue session checked the four points: none collides with a pin; the nearest is the Catch's
oasis Bitta (1088,1455), ~28 px from Ṣalṭ al-Bān.

Each pin wants the census's rescan and the trade model's rerun after it lands (`res_scan.py`, `crops_pass.js`, `trade.py`).

## 5. What each change reaches

| Change | Data and code | Rebuilds | The queue | The sim (`core/simulation`; region host the isle demo) |
|---|---|---|---|---|
| 2.1 gateways | the trade model: a side per settlement, blocked routes, the re-export leg | none | none | `SIM.trade`'s land carriers (core/camp's caravans) and the sea lanes need a route rule: no route across the Lizardmen's floor; the Catch by Stair |
| 2.2 salt | the trade model | none | two SETT_ADDED | a salt good exists; the works are new hamlets (`KHAMLET.village`, salt kind) when a region with them is built |
| 2.3 Tallwalls | the census rescan | none | a type change | none until the south-west is a region |
| 2.4 extraction, concessions, oil demand | the trade model: who may work a family; the licence's terms; rare earths within 200 km of a Yuni pin; the Rift line as a polyline for the Tungangs | none | none | **no oil good or use in the sim yet**: an oil good, the derrick under licence (a contract record in `core/simulation/SCHEMA.md`: site, host, operator Yuni, the host's 10% of the profits and 20% off that site's oil); the same record for the Geomancers' rare-earth works, and the uses (generators, vehicles, lamps) when a region needs them; the isle demo has none of these today |
| 2.4 Locus lode | `kits/resources/data/lodes.json`, the stamp, the digest | the Resources kit (`verify.py --assert`); every page that reads `geology.json` (`python3 tools/reach.py kits/resources/data/geology.json`); Godot via `sync_core.py` | none | the oil node field round Locus (the derrick is Locus's pumpjack) |
| 2.4 the delta rule (later) | `tools/scale-model/geology.py`, `kits/resources/GEOLOGY.md` | a full rebake: every page that reads the geology, the ledger, the hash baseline | none | as the lode |
| 2.5 native crops | `kits/crops` (`native`, `transplanted` by settlement or by polity, new records: Eternian tea, Eternian wine grape, hashish, pinyon copal, the four SW natives; dragon's blood's and tobacco's homes; three new zones in `CROPS.BIOMES`: `riftrim`, `abyssal-savannah`, `swhighlands`); the trade model's biome per settlement | `kits/crops` (`build.py`, `tests/test-crops.js`, `verify.py --assert`) and every build that reads it (`tools/reach.py kits/crops/src/20-crop-records.js`) | none | **the isle demo's plantations** (cacao, indigo, annatto, tobacco) and every `CROPS.pick`/`palette` call: the hamlets' fields (`core/hamlet`) and the farms' palettes change; the stocks proof and `test-sim.js` move on purpose, re-baselined |
| 2.6 craft-only | gypsum a trade good in the trade model | none | two SETT_ADDED | none |
| 2.7 scrap to iron | the trade model (smelting before buying) | the geology's ruin bit for lived-in Ancient cities (Iziz, Pylon, Roketstad, Yuni, Hook): a rebake item | none | phase S2's goods row (`scrap`) and recipe (smelter: scrap 1 + fuel 1 = iron 1, 2 h); a `SIM.site` salvage kind on ruin ground whose yield falls as it is stripped; the breakers' floor (`pyl_breakers_floor`), smelter (`pyl_smelter`, `hl_rep_smelter`) and salvage yards (`pyl_scrap_yard`, `vern_salvage_yard`, `hl_rep_salvage_forge`) mapped to them; the isle demo has scrap huts but no ruin ground |

And the documents: `TRADE-GOODS.md`'s tables are rerun and rewritten once the rules are in; the Resource Atlas
(`https://claude.ai/artifact/9En1tFuRjgMMWorwbWDMkT`) is republished only if the owner asks.

## 6. Still open (the owner's calls)

**Settled 2026-11-12:**
- hashish's home: `swlowlands`, spread by Dalab to the rift rim (2.5);
- tobacco's inner crater (2.5);
- dragon's blood trimmed to the sedesert (2.5);
- the Tungangs work only the deposits their tunnels reach (2.4);
- the licence: 10% of the profits and 20% off that site's oil (2.4);
- the Geomancers' rare earths in Yuni's lands and nearby (2.4);
- the isle demo reworked for these crops, a to-do (2.5);
- Eternian wine comes with its grape crop (2.5);
- indigo and annatto also in the Ring Isles, the NW and SW bays and the Throne; the isle demo's conflict is now cacao alone (2.5);
- "the hyperjungle biomes" listed by kit and by station (2.5);
- the proposals accepted ("i like the proposals"): the four SW natives (2.5a), pinyon copal (2.5b), 200 km of a Yuni pin
  for the Geomancers' rare earths and 5 km of a bore for the Tungangs (2.4);
- machine-wax and the SE basins' other goods taken, and Pit-Head 04 sent to the queue (2.5c);
- the eastern highlands' harvesters placed at 1095,911 (2.5d).

**Nothing else is open.** Section 7 is the sweep of every biome plan for goods this round missed, for the owner to pick from.

## 7. Goods the biome plans name that this round missed (the sweep, 2026-11-12)

The owner: "look over all biome plans for valuable goods we may have missed". Three read-only sweeps read the `.md` files of
every folder under `biomes/` (61 kits), plus `biomes/CRYSTAL-CAVES-5.1.md` and `KARST-SITES-5.1.md`, for goods worth carrying
far. Each find was checked against `kits/crops`. The strongest rows were spot-checked at their cited lines.

**The owner's picks (2026-11-12):** all fourteen goods of 7.1 are **chosen** ("agree with the above"). Of the incenses, the
Outlands' comb-mast drip gum and the north highlands' table-cedar resin stay. The abyssal savannah's incense tree is
**trimmed** (the owner: "trim abyssal savannah tree"). One incense is added to the east abyss's coal-swamp flora (7.6). The Painted Men's dyes are taken as a small trade (7.6). The
owner's additions (lacquerware, the Ancient's Valley, Korona's guided route) are in 7.6.

### 7.1 The strongest finds: long-range goods with a seller

| Good | Biome, where | What it is, why it travels | Who sells it | Record | Evidence |
|---|---|---|---|---|---|
| **Ranj** | `throne`: wild at the seam, the rift edges, the shoulders, the geyser isle (station 4); Zey'danin's plantations fail | a red resin that "closes wounds and knits bone in days"; chewed raw, a stimulant like coca. Strategic and fought over. **It may be what the trade model's "Spice Isles spice (re-export)" really is** | the Throne's natives (resin camps); Voth and the Hykkousoi want it | none (`biomes/FRUIT.md:210` says so) | `throne/NOTES.md:121-129` |
| **Precious opal** (Rift black, harlequin, fire, crystal) | `opalvalley`: the Middle Terrace mines (station 3), near Strongbow | "the single most valuable gemstone per carat"; also photonic opal and spicule glass for the Geomancers' optics, opal-dust pigment for the monks | **Xanadu**: its factors take the Sultan's Fifth; prospectors, Tungangs | none (a stone) | `opalvalley/PLAN.md:65, 113, 120` |
| **Spider Lake silk** (three grades: Golden Cable, Cloud-Fleece, Lake-Sheen Gossamer) | `spiderlake`, the NW lowlands' edge (stations 1, 2, 4) | "Spider Lake's famous export": rigging, bowstrings and armour backing; parkas and dressings; court cloth | the silk-wrights (no pin or polity in the trade model yet) | none | `spiderlake/PLAN.md:116-122` |
| **Lung salt** (*Lãg Solṭ*) | `gills`: the White Gills (the one sold; the Red is stronger), on the Catch-to-Xanadu road | an oxygen-carrying salt chewed against thin-air sickness on the 7.3 km pass; Dalab's genepriests want it | the gateway caravans (Yuni, Izani, Dasri, Xanadui): fits the gateway rule (2.1) | none (the plan names zone `gills`) | `gills/PLAN.md:454-455` |
| **Emeralds, turquoise; ostrich and runner-bird feathers; comb-mast drip gum** | `outlands` (the Gem Hills, S4; the plains; the fog belt), sold at the Great Chasm's Sill post (1697,1028) | gems; luxury feathers (the runner bird's sacred and dearest); the caravans' incense | **the Coyote Men** (the Peak tribe mines, the herders, the tappers); Izani caravans carry them | none | `outlands/PLAN.md:7, 113, 223-224`; `greatchasm/PLAN.md:206` |
| **Hearth wax and stoke** | `hearths`: the hearth discs over the holds (and Oidong's cold hearths) | a clean lamp wax and food fat; stoke, a cold remedy (an overdose kills) | **the Tungangs**, "their trade good to Dalab at Ledge"; the monks | none (the plan promises `kits/crops` records: `hearths/PLAN.md:410, 552`) | `hearths/PLAN.md:412-415` |
| **Ivory, glyptodont shell, aurochs horn** | `labyrinth` (pit chains, graben floors); `firebliss` (the summer hunt) | mammoth and pachyderm ivory and bone; shell roofs and shields; horn vessels | the Kimr; the Fellgangs hunt Firebliss | none (fauna) | `labyrinth/PLAN.md:143-151`; `firebliss/PLAN.md:76` |
| **Orange titanium glass** ("Pele's amber") | `godthrone` (the glass-bead halos, 7.5-9 km), `godshearth`, `seouterwall` (the Amber-Sinter Tarn, 1064,1272) | "a pigment and a trade good", gathered on bottled air | climbing parties; the Talovolci (who hold the mountain sacred); Dalab's runaway mods | none | `godthrone/PLAN.md:209`; `seouterwall/PLAN.md:188` |
| **Lung-skin rope** | `clifflung`: the paramo crest | rope that does not rot, from the lung rings' shed skin | the Talovolci, *proposed* as their trade good to Voth | none | `clifflung/PLAN.md:377` |
| **Rimroot; iris-lichen violet** | `riftrim`: the south (black) rim | a purgative and fever remedy; a violet dye, a rare colour | the Tungangs and Dalab, at the lifts | rimroot is a catalog fruit only | `riftrim/PLAN.md:254-255` |
| **Madder red, weld yellow** | `greenstep`, at Tallwalls | the dyes of the checked wool | the Free Giants (Vrivolci): they would supply the Talovolci's checked cloth (`TRADE-GOODS.md` section 2) | woad only | `greenstep/PLAN.md:133` |
| **Orchil and the stone dyes** | `korona`: the hoar tables over 3,500 m | lichen dyes traded down to the warm rings | the winter tribes, to the Painted Men | partly (`slickrock-orchil` is necanyons') | `korona/NOTES.md:215-216` |
| **Stone orchid** (*Dendrobium*) | `guilin`, `k-guilin`: the tower cliffs | a medicine | not stated | none | `guilin/NOTES.md:96`; `k-guilin/PLAN.md:107` |
| **Goldroot, qiviut** | `nwouterwall`: the fellfield, the High Country | a remedy for fatigue and thin air ("the Yeti's trade good"); the finest wool | the Yeti | `goldroot`, `qiviut` | `nwouterwall/PLAN.md:186, 280` |

**Three incenses outside the owner's incense rule** (2.5: "mostly limited to the sedesert/ebadlands"): the Outlands'
comb-mast drip gum, the north highlands' table-cedar resin (`nhighlands/HANDOFF-FLORA.md:281`) and the abyssal savannah's
south-east-rim incense tree (`abyssal-savannah/PLAN.md:286`). Keep them as the "mostly" exceptions, or trim them?

### 7.2 Gems and crystals (stones for `kits/resources`, not crops)

Precious opal and the Outlands' emeralds and turquoise (7.1) are the ones with sellers. Also named: garnet and epidote as gem
rough in the north-east wall's skarns (`neouterwall/PLAN.md:189`); chalcedony and opal crusts in the high rift's veins
(`highrift/PLAN.md:109`); aura quartz on the Godstep (`godstep/PLAN.md:233`); the basalt geodes' agate, chalcedony, tourmaline
and celestine (the scablands, the Siphon Pits, the Loom-Chasms: `CRYSTAL-CAVES-5.1.md:94`, `scablands/PLAN.md:96-101`);
opal-shell limestone, "Krator's ammolite" (`swhighlands/PLAN.md:110`); selenite, bismuth, celestine and cave onyx as
specimens. The Zeijani's thundereggs are shrine stones, not trade (`CRYSTAL-CAVES-5.1.md:103-104`). Galena in the
Neo-Ozarks is silver ore, so it is geology's.

### 7.3 Already records in `kits/crops`, not yet goods in the trade model

Umbrella gum and laterite ochre (the abyssal savannah); circle lichen (the Cut: an antiseptic and an orange dye); wine weed
(Farside: agar and a red dye); goldroot, qiviut, ivan-chai, silverthorn, birch tar (the Yeti's country); rimdew, rock-bottle
sap (an arrow poison) and ember-plum powder (the necanyons, carried by Pinnacle Rock's Wings); tamarisk manna, glasswort and
brine lamp (the Bowl); Oidong's peyote, snow lotus, valley ginseng, moon caps, rainbow brackets ("the long-life tea") and
bell-pod. These need only a goods row each.

### 7.4 Weak or inferred: not recommended

- Farside's fog sponges, kelp-fed goat meat and iodine. Firebliss's spring minerals. The geyser kit's glass-cane silica.
- The still trees' wax: the hearths plan proposes it as "the isles' lamp oil", so it is the strongest of these.
- Nwbay's prism-gum nectar. The north highlands' serpentwood (bows). Greenstep's cork. Nsemiarid's balloon-pod floss.
- The rift rim's sailwort parchment, prism-heath honey, frost-frill varnish and spiral aloe. The Throne's maleo eggs.
- Larch gum. The Labyrinth's wild melon.
- The Throne's other drugs and poisons: Ranj arrow poison, pyre-thistle anaesthetic ("an anaesthetic the ash nomads trade"),
  Korona's numb thorn.
- ~~The Painted Men's proposed paints and paintbrush medicine~~: taken as a small trade (7.6).
- The SW highlands' genepriest curiosities (shelf coral as ore-finder, fishing-bridge venom, cell-lamp spheres).
- **Contraband:** the Outlands' golden bird feathers. The Sill post refuses them, and every Coyote tribe attacks whoever
  carries them (`greatchasm/PLAN.md:208`): a story hook, not a good.
- ~~Xanadu's lacquerware~~: the owner gives it to Xanadu and the Eternians both (7.6, a to-do).

### 7.6 The owner's additions (2026-11-12)

**Lacquerware: Xanadu and the Eternians.** "Xanadu and Eternia should both produce lacquerware". The twins plan names
Xanadui lacquerware as caravan cargo (`twins/PLAN.md:90`), but nothing makes it: there is no lacquer tree in `kits/crops` but
the abyss's lac insect (`abyss-lac`), no lacquer workshop in either kit, and no good or recipe in the sim. **A to-do**
(`TODO.md`): a lacquer source for each (a lacquer tree, *Toxicodendron vernicifluum*'s kind, native to the Vale and to the
NW lowlands, or each its own), the workshops in `kits/xanadu` and the Eternian kit, and the goods row and recipe in the
sim. In the trade model it is a craft, a specialty of both, made where the trees grow.

**The Painted Men's dyes.** "the painted men could trade dyes to the occasional trader that comes their way". Their paints
are proposed in `paintedhighlands/PLAN.md:186-194`: black, red and teal (celadonite-teal clay, lignite black), with a
paintbrush medicine. They sell them in small amounts, through Korona's winter tribes, whose lichen dyes they already buy
(7.1), and to the rare trader. In the model they are a small export with a low route weight.

**An incense for the east abyss** (the owner: "we can add one incense to the carboniferous east abyss flora as well"; a
proposal). The kit's coal-swamp pass drew the **strap cordaite** "at the shore and up the rivers" (`eastabyss/NOTES.md:46-48`).
Cordaites are conifer kin, and their kind left Carboniferous amber in the coal swamps. The proposal is **swamp copal**
(`swamp-copal`, bucket fuel, `homeOnly`, home `eastabyss`): the strap cordaite's resin, tapped fresh from the trunks, and older
semi-fossil lumps dug from the peat of the coal swamps, as kauri gum was dug from New Zealand's swamps. It burns with a dark,
smoky sweetness. The abyssal people gather it, so it is the Tabisti's (Nomad Country) and Locus's to sell. The rope araucaria
of the upper slopes would give a similar gum. One incense was asked for, so the cordaite's is the proposal.

**The Ancient's Valley: ruin ground, and a barrier.** "the ancient's valley should be ruin ground on the model. however, it is
extremely dangerous and a barrier to trade."
- **Ruin ground.** The geology's ruin bit (`kits/resources/GEOLOGY.md` table, "+128 ruin ground") marks only cells within 12 km of
  a ruin pin and the region Ruins of Nazar (`tools/scale-model/geology.py:66`, `RUIN_REGIONS = ('ruins of nazar',)`). Adding
  `"ancient's valley"` there marks the whole Valley (its two polygons: `rmucbbtytfxy1` and the biome polygon `rmvowuvfa6urs`,
  px ~330-540 by 846-1036). That is a rebake: it reaches every page that reads the geology, the ledger and the hash baseline, so
  it rides with the delta-oil rule (2.4) and the scrap-to-iron ruin bit for lived-in cities (2.7).
- **Salvage there is rich but hard to reach.** The trade model's scrap shares each ruin's salvage among the living within 80
  km. For the Valley that share is cut by its danger, proposed at a tenth: only Dalab's outpost at Span and the Eternians'
  Veil stand at its edge, and the Valley is "home only to mutants, killer robots, and the rare bandit" (`LORE.md` section 4).
- **No route crosses it.** Like the Lizardmen's floor (2.1), the trade model blocks any route whose straight line crosses the
  Valley's polygon; goods go round.

**Korona: dangerous, but guided.** "only moderately less dangerous, with both flora and fauna known to be aggressive, and native
tribes suspicious of outsiders. there is still a trade route to the arachnoid river where silk from spider lake is received;
one human and one therian tribe (the toad men) are known to guide merchants through the maze."
- **A costly corridor, not a wall.** Routes through Korona (`Korona / NE`, `rmuqm3urh0mo6`, px ~867-1343 by 339-682) count at
  several times their length (proposed x4), except on the one guided route.
- **The guided silk route.** Spider Lake (`spider lake`, `rmvyj4v2ozgb1`, px ~1225-1417 by 154-291) to the Arachnoid River,
  where the silk is received, with the guides through the maze: a human tribe and **the toad men**, a therian tribe. Their
  names, homes and fees are to come. The Arachnoid River is probably the model's **Hām-Tsēk (Web-Cleaver River)** (`rivers.json`
  id 9102: "890 km canyon river carving through the Northern Korona & Arachnoid Scenic Gorge into the Ria River", mouth at px
  898,174). To confirm.
- **Spider Lake's silk (7.1) travels this way.** It reaches the crater through the receiving post on the river; the guides
  take a fee. The silk-wrights, the guides and the post have no pins yet: settlement work for later, through the queue.

### 7.5 Gaps the sweep turned up

- The hearths plan promises `kits/crops` records for hearth wax and stoke. Neither exists.
- Korona's notes promise "rare herbs and reagents" and spice buckets, but name none (`korona/NOTES.md:15, 280`).
- `biomes/STATIONS-MAP-5.1.md` calls the Siphon Pits plan's px old-canvas. The scale-model queue checked them, and they are
  5.1 (2.5c).
- If Ranj is the Spice Isles' spice, the trade model's re-export through Temora and Zey'danin (`TRADE-GOODS.md` section 2)
  should become Ranj, gathered wild on the Throne and fought over: Zey'danin's failing plantations are the story.

## 8. The lore and the settlement docs against this scope (2026-11-12)

The owner: "read thru the lore and settlement docs and note any additions or conflicts". Three read-only reads covered
`LORE.md` whole and the `.md` files of all 30 folders under `settlements/` (plus `openworld/PLAN-SETTLEMENTS.md`). Each was
checked against sections 1-7. The rows that change a decision were spot-checked at their lines.

### 8.1 Settled by the owner

- **Xanadu has no Ring Sea access** (the owner: "xanadu doesn't have ring sea access but does have boats in its lakes"). `LORE.md:1069`
  lists Xanadu among the Ring Sea's peoples, and `:1014` gives it "swan barge, dragon boat, bullion carrack". Those boats are
  the Vale's lake craft. **Lore fix owed:** take Xanadu out of the Ring Sea line and put its boats on its lakes (8.4). The
  gateway rule (2.1) stands.
- **Shim grows something else** (the owner: "shim can grow something else"). Shim's plantations grow the Blïtrit (the
  blood-reed, Voth's purple) "and sugar cane second" (`settlements/shim/PLAN.md:106-107`, `LORE.md:442`), but sugar cane is now
  the Ring Isles'. **Proposed second crop: Sunboll cotton**, native to the SW lowlands (`kits/crops` `cotton`, home `swlowlands`,
  `nwlowlands`, `swbay`). Shim would then grow the cloth and its purple together: the robes and banners of Voth. The other native
  of its ground, rattle coffee (`rattlepod`), is the alternative.

### 8.2 Conflicts still to settle

| # | Scope decision | What the docs say | Proposed resolution |
|---|---|---|---|
| 1 | **The Dasri are a gateway over the Catch** (2.1, 2.2) | Shade, the Dasri's oasis and the trade model's only Dasri pin, moved in batch 5.1e6 from 1229,885 to **1085,683**, under a 2,400 m wet wall 156 km from Pinnacle Rock (`openworld/PLAN-SETTLEMENTS.md:755`). That is ~1,500 km north of the Catch. Shade's own `DESIGN.md:8` still says the sedesert | **The owner's call:** where are the Dasri's home grounds now? Either the Dasri stay the Catch's caravaneers (their camps roam, `core/camp`; Ṣalṭ al-Bān is their one pin near it), or a Dasri pin is wanted nearer the Catch |
| 2 | Coffee and sugar cane are the Ring Isles' (2.5) | Zey'danin's failed Ranj plantations went to coffee and sugar (`settlements/zeydanin/PLAN.md:17, 54`; `LORE.md:460`) | Record Zey'danin as `transplanted` for coffee and sugar cane: the rule allows it, and it is the Ranj story (7.1) |
| 3 | Cacao is the Vale's (2.5) | **Kautoa** grows and exports cacao too (`settlements/isle-demo/PLAN.md:515` "Kautoa exports cloves, rice and cacao"; `:990`), not only Nephtos | Widen the isle demo to-do to Kautoa's plantation, the advantage table and the buyers' lists (done in `TODO.md`) |
| 4 | Saffron is the Vale's (2.5) | Longsong has "a saffron terrace" and saffron in its dye garden (`settlements/longsong/README.md:76-79`) | Record Longsong as `transplanted` for saffron (the Order's garden), or add `oidong` to saffron's home |
| 5 | The East Rift trades direct only through the gateways (2.1) | The Order keeps chapterhouses at Dalab, Ys, Verge, Iziz, Locus and Keepwell at Talia; its copies go to them (`longsong/BLUEPRINT.md:34, 94`; `LORE.md:555, 1053`) | Count a transfer inside the Order as not trade (books, letters, the Order's own goods), so the rule holds for merchants |
| 6 | The Geomancers license the Hexahedron's oil (2.4) | The Screamers kidnap outsiders; "most caravans give the Hexahedron a wide berth" (`LORE.md:357`) | Strike the Hexahedron (127 t) from the licensed fields |
| 7 | The Eternians are widely electrified (2.4, the owner) | "Yuni and Locus: The only fully electrified cities in the world" (`LORE.md:166`) | Lore fix (8.4): the Eternians beside them, partly on Ancient power |
| 8 | The Order extracts its own oil (2.4) | A Geomancers' walled lodge stands in Longsong's ward (`longsong/BLUEPRINT.md:95`) | Minor: friendship (`LORE.md:559`, "Friendly with the Geomancers of Yuni") and the Vault; not oil work |
| 9 | No route crosses the Ancient's Valley (7.6) | Dalab reaches Span by the Basin Tunnel (`settlements/span/PLAN.md:174-178`), a line that may clip the Valley's corner | Test the line against the polygon. If it crosses, exempt the tunnel: it runs under the Valley's edge |
| 10 | Eternian tea and the wine grape are native to `nwlowlands` (2.5) | Roketstad's country and Dilihan's floor use the nwlowlands kit (`settlements/highlands/NOTES.md:150`; `dilihan/PLAN.md:31`) | Place crops by the scale model's biome polygons and the Eternian ground, never by which kit a page reads |
| 11 | Who gains the jungle dyes and tobacco (2.5) | Mav's Refuge and Girder stand in hyperjungle (`mavs-refuge/NOTES.md:3`) | Add the Beast Riders to who gains indigo, annatto and tobacco |
| 12 | Lacquerware is Xanadu's and the Eternians' (7.6) | Lacquer appears as decor of the Lizardmen's Tenders, the abyssal people and the Shumari (`LORE.md:875, 883, 1040, 1047`) and at Longsong (`BLUEPRINT.md:122`) | Minor: colour words or bought work. The Lizardmen never trade |

### 8.3 Additions worth taking (proposed)

**Goods**
- **Shim's Blïtrit purple**: the blood-reed, "every purple robe and banner in Voth" (`LORE.md:442`). A Vothic natural dye, `homeOnly`
  at Shim. The swbay's snail `bay-purple` is the other Vothic purple.
- **Ys's murex purple, nacre inlay** and the Pearlmonger's Guild (`settlements/ys/DESIGN.md:234`): the League's crafts beside
  pearls.
- **Fridon's wormwick** (`LORE.md:1004`, "the source of Fridon's wormwick trade"): Iziz sells wormwick too, from the
  savannah rim's glass wands. The eastern highlands' harvesters (2.5d) are a second source, not the only one.
- **The Free Clans' bronze** (Ardent's copper and tin: `LORE.md:310`; `settlements/ardent/PLAN.md:10`): already their
  natural unique (`TRADE-GOODS.md`). Lipp's tin (2.6) competes with it, which explains the Republic's interest in Ardent
  (`LORE.md:1064`).
- **The Order's paper and its own lenses** (Longsong's printing house, paper mill and lens workshop: `BLUEPRINT.md:94`). Paper is
  a good the model lacks. Lenses need not be re-exported to the East Rift.
- **Locus's and Mungo's salt-rice** (`LORE.md:401`; `settlements/mungo/DESIGN.md:25`): a crop record and a local staple.
- **The Ring Isles' manufactures** (the isle demo): Valapo's iron ingots from a charcoal smelter (`PLAN.md:493, 519`);
  Kautoa's soda ash, glass and indigo-dyed cloth (`:528`); Nephtos's copper and hulls (`:1230`).
- **The Catch's salvage** (proposed in the lore): Ancient alloys and energy cells that "keep as nowhere else" (`LORE.md:91`).
  The Stair divers' good, sold to Yuni.
- **Relics and medicines** as goods rows: the caravans' list is "spice, gold, petrol, relics, scrap, and medicines"
  (`LORE.md:184`).
- **Korona's marble**, Jimjam's white marble's likely source (`LORE.md:515`). It travels the guided Korona route (7.6).
- **Beast Rider spider silk**: Pinnacle Rock's Spider tribe's silk house (`settlements/pinnacle-rock/PLAN.md:83`) and Mav's
  Refuge's Silk Loft (`mavs-refuge/API.md:95`). A second spider silk, beside Spider Lake's.
- **Shade's goat-hair weaving, camel and goat dairy** (`settlements/shade/DESIGN.md:45`, `KNOWN_ISSUES.md:122`).
- **Almua's chitin** (`settlements/almua/PLAN.md:45`), the beetle livestock's shells. Minor.

**Places and powers in the trade**
- **Talia, Iziz's eastern gateway**, "rich on the caravan trade", with its caravan customs (`LORE.md:252`;
  `settlements/iziz/VASSAL-KITS.md:92`). It is the natural customs post for the re-export leg (2.1).
- **Pylon's salvage tithe and assay** (`iziz/VASSAL-KITS.md`) and **Roketstad's smelter and scrap-iron market**
  (`settlements/highlands/NOTES.md:251, 280`): both already smelt scrap. Add Roketstad to 2.7's table.
- **The Eternians license the Ancient's Valley's salvage** (`LORE.md:723-725`, "quarantines the Valley and licenses its salvage")
  and hold the over-sea goods "under State monopoly" (`:741`). The Valley's scrap (7.6) is the Eternians' to license.
- **Mungo, the Geomancers' depot** in the abyss: a salt-and-goods warehouse for Locus and a fuel station
  (`settlements/mungo/DESIGN.md:26`).
- **Port Tobin** trades with Hook (`settlements/hook/PLAN.md:225`). **Pontus** sends ships to the isles (`isle-demo/README.md:175`).

**Route costs, tolls and barriers**
- **Tolls:** at Verge, a toll at each trailhead turns half the caravans back (`settlements/verge/DESIGN.md:114`). Span's customs
  take tolls and "the priests' cut" (`span/PLAN.md:373`). The Matok keep toll-gates (`LORE.md:719`). The Yeti take "winter
  gifts" that "everyone knows are tribute" (`:729`).
- **Hostility:** Republican goods "may be seized, taxed or quietly copied" at Dilihan (`LORE.md:542`). The Screamers' country
  is avoided (`:357`). The Order is banned from Voth (`:436`): no Order goods to Voth.
- **The sea:** the Islanders are "lately, pirates" (`LORE.md:575`), the Pirate Emperors' heirs are about (`:262`), and Noah's
  Regret is a pirate base (`settlements/noahs-regret/README.md:7-8`). Iziz retook Hook, and Voth's fleet is gone from the strait
  (`LORE.md:461-462`): Voth's Spice Isles routes are at risk.
- **The Beast Riders' raids** on Shell and the Port Goto road (`LORE.md:346`).
- **The Ancient roads' state:** kept by Iziz, the Eternians and Yuni; elsewhere "most of it is in very bad condition"
  (`LORE.md:154`). A route cost by road state.

**Not modelled, for the owner to rule in or out:** the slave and labour trade (Shim's slave plantations, `LORE.md:442`; Hook's
closed slave market, `:263`; Dalab taking people, `:199`; Talovolci recruits for the Legion, `:276`); currencies (the Izani Talent,
`:270`; Kautoan shell money, `:576`); the Shumari plateau above Tallhouse, a West Rift neighbour where Free Giants go
(`:952-953`); the Frogmen of the SW highlands, Dalab's clients (`:940`), who could be the 2.5a natives' gatherers.

### 8.4 Lore fixes owed (the owner's word against the text)

- `LORE.md:1069` and `:1014`: Xanadu off the Ring Sea; its swan barges, dragon boats and bullion carracks on the Vale's lakes.
- `LORE.md:166` (section 5, "Electric light is power"): the Eternians widely electrified beside Yuni and Locus, partly on
  Ancient power.
- `LORE.md:442` and `settlements/shim/PLAN.md:106-107`: Shim's second crop, sugar cane, replaced (8.1).
- `LORE.md:86-87`: the Catch's resources are "potash and alkali salts"; this round adds rock salt (2.2), as the geology has.
- `settlements/shade/DESIGN.md:8`: Shade's biome (sedesert) after its move (8.2, 1).

These are edits to shared lore and settlement docs, so they wait for the owner's go-ahead; none is made here.

## 9. The Dasri's settlements (a proposal, 2026-11-12)

**Shade's move was the owner's** (batch 5.1e6, `openworld/PLAN-SETTLEMENTS.md:732`, answer 5: "Move it to an oasis in the north,
closer to Pinnacle Rock"), so Shade stays at 1085,683, and 8.2's first conflict is answered here. The owner: "the dasri are
mostly nomadic. they should have 4 village and 1 town size settlements that arent drawn in yet, maybe do a survey of sedesert
and ebadlands and propose me a few. they could potentially lie in yuni or iziz territory, but shouldn't be close to other
settlements".

**The survey.** The biome polygons `sedesert` (`rmuqlrsc52nhl`) and `e badlands` (`rmuqm20f95x4v`): 558,000 km² together.
- **Kept:** cells on land, under 4 km, not ice or tundra, on gentle ground, with water: a river of 3 m³/s or more, a fresh
  lake, or wadis within 10 km.
- **Scored** on farmland, half the pasture, and the water. The town over a 20 km reach, a village over 10 km.
- **Spacing:** the town 80 km or more from any pin, a village 60 km or more, and the five at least 100 km apart.
- **Pins counted:** every pin on the model, plus this round's queued and held ones (Solta, Ṣalṭ al-Bān, the eastern highlands
  harvesters, Pit-Head 04, the Lipp tin mine, Ṣilbaru).
- **The river names** on several sites are already Dasrī: *Rīfar al-Qaṣr*, *Rīfar al-Bālm*, *Rīfar al-Sarāb*. The model's
  namers took this as Dasri country.

| | Site (5.1 px) | Ground | In reach | Water | Polity | Nearest pins |
|---|---|---|---|---|---|---|
| **Town** | **1219,1148**, the Bowl's east shore | -1,056 m, BSh, 658 mm, +29 °C, ~1.8 atm | 874 km²-eq farmland, 994 pasture (20 km) | the Rvr Ḥmm, 119 m³/s | none | Solta (queued) 100 km, Yuni 147 km |
| **Village 1** | **1200,1071**, the sedesert's wadi country north of the Bowl | 231 m, Csa, 580 mm, +24 °C | 218 farmland, 237 pasture (10 km) | wadis and springs (9 wadi px), no river | Yuni Emirate | Yuni 131 km, Locus 145 km |
| **Village 2** (revised) | **1333,886**, the eastern badlands, on the Rīfar al-Dhahab ("the gold river") | 1,715 m, BSk, 423 mm, +16 °C | 90 farmland, **275 pasture** (the most of any site here) | the Rīfar al-Dhahab, 18 m³/s | Nomad Country | Mungo 118 km |
| **Village 3** | **1319,676**, the badlands by the east rim, on the Rīfar al-Qaṣr | 908 m, BSh, 564 mm, +22 °C | 207 farmland, 251 pasture | the Rīfar al-Qaṣr, 64 m³/s | Nomad Country | Reed 78 km, the Tabist town 100 km, Furrow 113 km |
| **Village 4** | **1220,644**, the northern sedesert, on the Rīfar al-Bālm | -83 m, Aw, 800 mm, +28 °C | 159 farmland, 234 pasture | the Rīfar al-Bālm, 11 m³/s | Nomad Country | the Tabist town 109 km, Furrow 112 km; Shade 281 km |

**Why this set.**
- **The town is the Dasri's gateway to the Catch.** It stands on the Bowl's east shore, on its biggest river, ~160 km north of
  the Catch's rim, with the most farmland and pasture in either region. Caravans for Xanadu muster there, and the Dasri's salt
  from Ṣalṭ al-Bān and the Bowl's from Solta pass through it. That answers the gateway question (2.1, 8.2): the Dasri reach
  the Catch from their own town, while Shade sits north by the owner's choice.
- **The villages spread along the caravan country:**
  - one north of the Bowl in the wadis, the oasis kind of the lore's Dasri;
  - two in the badlands on rivers, in Yuni's land, as the owner allowed;
  - one in the northern sedesert, on the way to Shade and the Tabist town.
- The five are 159-1,008 km apart. None is within 60 km of another pin.

**Revised 2026-11-12** (the owner: "v2 would more likely be a yuni settlement. furrow is a dasri town fyi. are there any promising
sites in the eastern portion river valleys? we should also add one more tabisti town in the middle east abyss somewhere between
mungo and reed"):
- **The first village 2 (1311,982, on the Sista Riba) becomes a Yuni village** (proposed): Csa, 1,048 m, 768 mm, 264 km²-eq farmland,
  in the Emirate's land, 108 km from Verge. It is a Yuni farming village, not a Dasri one.
- **The Dasri's village 2 is now the Rīfar al-Dhahab site** (1333,886, the table above): a herders' valley, the richest pasture
  surveyed, in Nomad Country.
- **Furrow is a Dasri town** (the owner). Its pin is an `outpost` on the model (1276,639), so with the new `town` type it could
  become a town: a type change for the queue if the owner wants it. The trade model's estimate would rise from 150 to 2,500
  people. Village 4 and the Rīfar al-Sarāb site lie ~110-125 km from it.

**The eastern river valleys.** The e badlands east of px 1330 drain east off the abyss's far rim in long valleys. Most carry Dasrī
names. The best village sites there, 60 km or more from any pin and 80 km from the sites above:

| Site | River | Ground | Pasture, farmland (10 km) | Polity | Note |
|---|---|---|---|---|---|
| **1333,886** | Rīfar al-Dhahab, 18 m³/s | 1,715 m, BSk, 423 mm, +16 °C | 275, 90 | Nomad Country | **taken as Dasri village 2** |
| 1334,949 | Braita Riba, 30 m³/s, a fresh lake | 1,553 m, BSh, 439 mm, +17 °C | 235, 108 | Yuni Emirate | the one fresh lake on the east side; Yuni-named, 132 km from Verge |
| 1353,732 | Rīfar al-Ṣakhr, 15 m³/s, wadis | 2,357 m, Cfa, 533 mm, +15 °C | 232, 186 | Nomad Country | high and cool; 182 km from Reed |
| 1359,671 | Rīfar al-Qaṣr (upper), 33 m³/s | 2,436 m, Cfa, 580 mm, +15 °C | 224, 202 | Nomad Country | 80 km up the same river from village 3 |
| 1338,1012 | Solt Riba, 55 m³/s | 2,442 m, Dsb, 549 mm, +12 °C | 230, 181 | Yuni Emirate | Yuni-named; 81 km from the Yuni village at 1311,982 |
| 1372,773 | Rīfar al-Kawkab, 12 m³/s | 3,063 m, Cfa, 470 mm, +10 °C | 234, 122 | Nomad Country | the highest; summer grazing |

The valleys are pasture country at 1.5-3 km, cooler and wetter than the sedesert: summer grounds for herds, rather than towns.

**They are the Dasri's seasonal camp sites** (the owner, 2026-11-12: "we can designate those eastern river valley sites as
seasonal camp sites"). Five sites: the Braita Riba (1334,949), the Rīfar al-Ṣakhr (1353,732), the upper Rīfar al-Qaṣr (1359,671),
the Solt Riba (1338,1012) and the Rīfar al-Kawkab (1372,773). Village 2 on the Rīfar al-Dhahab stays a village, the bands' fixed
point in the valleys; say if it should be a camp too.
- **Not pins.** They are `core/camp` records: a band's summer pitch on a named site, struck and moved with the season (`KCAMP`,
  `core/camp/PLAN.md`). The sim's world tick moves the bands between them and the villages.
- **In the trade model** their pasture counts toward the Dasri's mounts and hides (camels, goats), not a settlement's reach.

**The western oases** (the owner: "check western region of the map too for other good oases"). The sedesert west of px 1210 is
80% arid ground. The search kept cells with water (a river, a fresh lake, or wadis and springs) where at least half the ground
within 10 km is arid. They are 60 km or more from any pin and 80 km from every site above:

| Oasis | Water | Ground | Pasture, farmland (10 km) | Arid around | Polity | Nearest |
|---|---|---|---|---|---|---|
| **1204,829** | wadis and springs (9 wadi px) | 732 m, BSh, 439 mm, +22 °C | 252, 78 | 100% | Nomad Country | Mungo 236 km: the most isolated, mid-desert |
| **1180,941** | the Rrivar Blaca (Verge's river) crossing the desert, 10 m³/s, and wadis | 446 m, BSh, 564 mm, +23 °C | 226, 110 | 64% | Empire of Iziz | Verge 177 km |
| **1190,671** | wadis and springs (10 wadi px) | 502 m, BSh, 596 mm, +23 °C | 243, 156 | 91% | Nomad Country | the Tabist town 160 km; village 4 81 km |
| **1119,1113** | wadis on the Bowl's north side | -1,012 m, BSh, 392 mm, +28 °C | 245, 89 | 100% | Empire of Iziz | Mantis 103 km |
| 1172,1042 | the Winda Riba, 11 m³/s | 465 m, BSh, 423 mm, +22 °C | 235, 50 | 100% | Empire of Iziz | village 1 81 km |
| 1042,1083 | the Bruk cedra, 10 m³/s | 895 m, BSh, 345 mm, +19 °C | 186, 52 | 100% | Empire of Iziz | Arcbeam 72 km |
| 1203,974 | the Bruk Loña, 10 m³/s | 1,065 m, BSh, 282 mm, +20 °C | 178, 38 | 100% | Empire of Iziz | Verge 139 km |
| 1132,1048 | wadis | 835 m, BSh, 423 mm, +20 °C | 236, 79 | 99% | Empire of Iziz | Solta 217 km |

These are true oases: a spring line or a small river in open desert, with pasture round them and little farmland. Uses:
- **Caravan stages:** the first four (bold) mark a line down the desert's west side from the Tabist country to the Bowl,
  140-260 km apart, a day or more by camel each.
- **Winter camps:** they pair with the eastern valleys' summer grounds. The Dasri winter in the low desert at the oases and
  summer in the high valleys.
- **Village alternatives:** 1204,829 or 1190,671 could replace a village above if the owner wants the Dasri's villages further west.

The four bold ones, if taken, are `core/camp` sites like the valleys, or caravanserai pins (the lore's khans) for the queue:
the owner's call.

**A Tabisti town in the middle of the east abyss** (the owner: "between mungo and reed"). The Tabisti live "on the salt marshes and
river deltas at the edge of the eastern abyss" (`LORE.md` section 6.9). So the search kept the abyss floor (under -800 m), on a
lake shore, between Mungo (1322,828) and Reed (1280,678), 55 km or more from any pin. It scored lake area, an inflowing river,
farmland and pasture:

| | Site | Ground | Water | Farmland, pasture (10 km) | Distances |
|---|---|---|---|---|---|
| **Proposed** | **1311,761**, the Rīfar al-Rīḥ's mouth into a salt lake | -1,707 m, XA, 1,741 mm, +33 °C | 40 km² of salt lake in 10 km; the Rīfar al-Rīḥ, 27 m³/s | 84, 92 | Mungo 136 km, Reed 177 km, the Tabist town 218 km: the middle of the stretch |
| Alternative | 1290,735, the Rīfar al-Ṣakhr's mouth | -1,946 m, XV, 1,003 mm, +35 °C | 44 km² of salt lake; 21 m³/s | 58, 190 | Reed 116 km, Mungo 197 km |

1311,761 is a river delta on a salt lake, the lore's Tabisti ground. It is cooler (+33 °C) than Reed and the Tabist town (+39 °C,
too hot to farm), so it can farm a little. Nomad Country; a `town`.

**Alternatives** if a site will not do:
- **1325,609** on the Rīfar al-Sarāb ("the mirage river"): Csa, 872 m, 12 wadi px, 115 km from Furrow. In place of village 4,
  drier and more Dasri in climate.
- **1301,1085** on the Bigga: BSk, 1,787 m, 116 m³/s, 76 km from Yuni. A southern badlands village nearer the Stalker Range.

**What it reaches.**
- **The queue:** five Dasri SETT_ADDED rows (one town, four villages), named in Dasrī when the owner picks names; a Tabisti town
  (1311,761, named in Tabist); a Yuni village (1311,982); and, if wanted, Furrow's type from `outpost` to `town`. The towns take
  the new `town` type (section 4).
- **The trade model:** the five as Nomad Country members; their reaches scanned by the census.
- **The sim:** `core/camp`'s nomad bands range between them.
- **Shade's `DESIGN.md:8`** still says the sedesert: a lore fix (8.4).

Not sent to the queue: the owner picks first.

## 10. The northern abyss: lifted, and given heat-tolerant crops (the owner, 2026-11-12)

**The question.** The owner: "can we move reed and the northern tabisti town somewhere on the lake but not too hot to farm?", then
"can we do something to the terrain to make the northern abyss a bit less hot?".

**Why it is hot.** The northern abyss is a pit: 21,220 km² under -1,000 m in px ~1215-1310 by 615-752, 1,956 km² of it lakes, its
floor's median at -1,651 m. Reed's lake (836 km² at ~-2,230 m) has a shore averaging 41 °C, 36 °C at its coolest. Reed and the
Tabist town stand at 39 °C, with almost no farmland in reach (3 and 0 km²-eq). 11,684 km² of the pit's land is over 33 °C. The
model lapses temperature at 6.5 °C per km (`tools/scale-model/README.md`, step 7), and 4.21 lowered Region 65 "down to the abyss's
level" on the owner's word (`README.md:270`). No cool, farmable shore exists in the pit: only the dry step lakes on its west edge
reach 33 °C, with 22-34 km²-eq of farmland.

**The owner's choice: lift the pit ~900 m, and add heat-tolerant abyss crops.** Reed and the Tabist town stay on their lake.

**The lift** (a scale-model terrain edit, for the queue):
- **The pit:** the ground under -1,000 m in px ~1215-1310 by 615-752, north of the sill to the middle abyss at about py 752. The
  middle lakes (Mungo's, and the new Tabisti town at 1311,761) are left alone.
- **The rule:** compress the pit's depth below -1,000 m to 30%: new height = -1,000 - 0.3 x (-1,000 - h). So -2,333 m (Reed)
  rises to -1,400 m (+933 m), -1,651 m (the median) to -1,195 m (+456 m), and -1,000 m does not move. The rim stays where it is,
  with no step. The climate re-lapses (`reclimate`), with rain and class recomputed.
- **The lakes** (the queue's plan, 2026-11-12): `ABYSS_LAKES` lays its winding lakes out only on ground under -1,400 m, and after the
  compression the deepest floor is about -1,370 m. So the queue does not re-lay them. It **lifts the existing lakes with the
  ground**: each lake's level and bed by the same rule, outlines and relative depths kept. Then it re-routes the water. Laying the
  lakes out afresh on the new floor is the alternative, the owner's to ask for before the edit runs. Furrow (-593 m) and Reed's
  upriver fields (-780 m) are above -1,000 m and do not move.
- **The effect, at 6.5 °C per km:** Reed's spot from 39 °C to ~33 °C. Land over 33 °C in the pit from 11,684 km² to about 860; over
  36 °C from 2,028 km² to about 260. (These are the lapse alone, before the lakes and rain re-settle.)
- **What it reaches:**
  - the scale model's build and its history entry;
  - the census rescan (`res_scan.py`) and the trade model;
  - the geology rebake: the pit's coal and oil follow lowland flat ground, so they may move;
  - Reed's and the Tabist town's notes; Furrow (1276,639) at the pit's north end;
  - Reed's upriver fields (1297,683, batch 5.1e8), which may no longer be needed;
  - no open-world region is built there yet.

**The abyss crops** (`kits/crops`):
- **The gap:** the crop kit already has a hottest warmth band (29 °C and up, warmth 5), but the east abyss's `marsh` zone stops at
  warmth 4 (`10-crop-core.js:45`). The 38 °C cutoff that leaves Reed no farmland is the census's farm index (the scale model's
  `49r`), not `kits/crops`.
- **A record:** a heat-tolerant paddy grain, **salt-rice**, the lore's crop at Locus and Mungo (`LORE.md:401`; `settlements/mungo/DESIGN.md:25`):
  grain, warmth 4-5, wet, salt-tolerant, home `eastabyss`.
- **A zone:** the `marsh` zone widened to warmth 5.
- **The census:** its farm index lets abyss marsh farm to ~40 °C for these crops.
- **What it reaches:** `kits/crops` (`build.py`, `tests/test-crops.js`, `verify.py --assert`) and every build that reads it.

Sent to the queue on the owner's choice (2026-11-12) as a terrain edit, to run in its turn; the crops wait for implementation.

**A Coyote village on the northern fresh lake** (the owner: "we can add a coyote village at C"). The survey for Reed turned up the
big fresh lake north of the abyss (~1227,546, 3,428 km², its shore's median ~-287 m). The site at **1220,564** is on the south shore,
at the water's edge: the next cell NE (1221,563) is the lake itself, by the queue's check. Its ground value (+132 m) does not
match the lake's surface, as often near the model's lakes. It is Aw, ~1,270 mm, +26 °C,
with ~148 km²-eq of farmland within 10 km, inside the Coyote Kingdom's polygon, ~156 km from Coyote Canyon. A village, to be named,
sent to the queue on the owner's word.

## 11. The Scyvoi's Baelu (a proposal, 2026-11-12)

The owner: "let's scope the scyvoi lands for baelu sites". **A Baelu** is the Scyvoi's fire-season redoubt: "round fortresses of
fitted stone on the rocky outcrops of the western drylands" (`kits/scyvoi/README.md:5-6`), r 30 m, with a cistern well ("the water
lies below the surface") and raised platforms where the bands pitch their tents (`:35-42`). The bands go "to the kopjes and the
baelu before the fire season, then down to reap after the burn" (`core/camp/PLAN.md:284`): the Baelu is their seat
(`kind: 'seat'`), with the grazing and the burn mosaic round it.

**The ground.** The Scyvoi's polygon (px 618-729 by 674-950, 38,352 km²) is the low strip between the Inner Wall's scarp and the
League's lakes: mostly BSh (21,800 km²), with Csa (7,500) and Aw (7,200). Ys, Trigon, Pontus, Tethis, Almua, Tzunfort and Drum stand
round it.
- **No granite on the model.** The geology has the whole polygon as sedimentary. The lore's granite kopjes (`LORE.md:581`) are
  finer than the model's 2 km cells: the crater drylands kit draws them as stations' local relief. So the search took **outcrops in
  the heights**: a local top 30 m or more over the median of the ground within 6 km.
- **The other tests:** water within 10 km for the well (a river, a fresh lake or wadis), pasture round it for the bands, 25 km or
  more from any pin, and the sites 50 km or more apart.
- **Outside the polygon:** the rest of the northern drylands is Shell Province's, the Beast Riders' and the Screamers', so no Baelu
  goes there. One site at 912,642 sits on a river with a Boruntun-sounding name (the Kumun Buruku), but it is Shell's.

| | Site | Outcrop | Ground | Water | Pasture (10 km) | Nearest pin |
|---|---|---|---|---|---|---|
| **B1** | **651,857**, the south | 103 m over its surroundings, -305 m | Aw, 752 mm, +26 °C | the Cakmak Riviri, 22 m³/s | 276 km²-eq | Tzunfort 69 km |
| **B2** | **669,831** | 91 m, -651 m | Aw, 800 mm, +29 °C | the Stahr Rhyver, 19 m³/s | 285 | Pontus 68 km |
| **B3** | **683,802**, the middle | 183 m, -563 m | BSh, 564 mm, +28 °C | wadis (6 wadi px) | 259 | the ruin Fort Ebon (695,782) 47 km; Pontus 83 km |
| **B4** | **703,733**, the north | **238 m** (the queue's reading), the highest outcrop, -897 m | BSh, 564 mm, +30 °C | wadis (7 wadi px) | 185 | Trigon 40 km |
| **B5** | **725,706**, the far north, on the polygon's edge by Trigon's lake | 84 m, -1,096 m | BSh, 658 mm, +31 °C | wadis (13 wadi px), the lake 8-10 km off | 198 | Trigon 68 km |

They run the length of the Scyvoi's land, 63-336 km apart: two pairs (B1-B2, B4-B5) and B3 between. That reads as five tribes'
seats, or three seats and two outliers.
- **Hot ground:** all lie under sea level (-300 to -1,100 m), as the strip does. The Scyvoi "do not overheat easily" (`LORE.md:581`).
- **Trigon is close:** B4 is 40 km from Trigon (the League). A Baelu there faces the Hykkousoi, the Scyvoi's enemies: a border fort.
  Move it inland if that is too close.
- **The south is short:** from B1 down to Drum (-950) no site passes the tests. A sixth Baelu in the south would need a softer
  outcrop rule.

**The owner's decisions (2026-11-12):** "pin as forts"; "let's add a fort type to the settlements in the scale model"; "can we make
a terrain edit to put a plausible site between b3 and b4 and put one nw of drum?".
- **A `fort` settlement type** goes on the scale model (`model/src/60-settlements.js` `SETT_TYPES`: a glyph and a key entry), as the
  town type does.
- **B1-B5 are fort pins**, polity Scyvoi, "Baelu (to be named)".
- **Two more by a terrain edit.** No ground between B3 and B4, or north-west of Drum, passes the outcrop test, so the edit raises
  an outcrop at each:
  - **B6, 684,749** (between B3 and B4): ~-773 m, BSh, wadis within 10 km, 254 km²-eq pasture. It is 50 km from B4, 106 from B3
    and 78 from Trigon. The true midpoint (~693,767) has no water within 10 km, so this is the nearest watered ground.
  - **B7, 652,907** (north-west of Drum): ~-400 m, Csa, wadis, 236 km²-eq pasture. It is 65 km from Drum and 55 km from Tzunfort.
  - **The stamp:** a smooth inselberg dome on the ground at each, peak +180 m, radius ~5 km, cosine profile, never lowering a
    cell. That puts each 60 m or more over its ~6 km median, as B1-B5 are. The climate re-lapses on the raised cells. Optional: the
    domes marked granite in the geology bake, as the lore's kopjes are (`LORE.md:581`).
  - B6 and B7 then become fort pins too.
- All of it was sent to the scale-model queue on the owner's word. **Queued** (2026-11-12): the fort type, the seven forts and the
  two-dome edit, all collision-checked, none run yet.
  - **The domes:** B6 and B7 today stand 60 and 55 m *under* their medians; the +180 m dome should put them ~+120 m over, checked
    after the stamp. The queue will mark the two domes granite in the geology provinces.
  - **Spacing:** the closest pair is B4 and B6, 50 km apart. B6's nearest pin is the ruin Fort Ebon, 70 km off.
  - **The survey's miss:** it counted only living pins, so it missed the ruin Fort Ebon, 47 km from B3.

**What it reaches:**
- **The queue:** the fort type, seven fort pins, and the outcrop edit (above).
- **The Baelu building (B1-B7):** `kits/scyvoi` (`54-bl-baelu.js`); its interiors and its quarry are open items (`kits/scyvoi/KNOWN_ISSUES.md:26, 98`).
- **The trade model:** a Baelu is seasonal, so its people are the bands', counted once (a camp, not a town).

## 12. Korona's villages (a proposal, 2026-11-12)

The owner: "let's scope korona for plausible village sites. nothing here should be above 1k; really most of the population will be
semi-nomadic or live in hamlet-size settlements". Korona's tribes are humans and therian mutants on the tepuis, apart for centuries,
speaking the Hum (`biomes/korona/NOTES.md:16`). The flora and fauna are aggressive and the tribes suspicious of outsiders. One human
tribe and the toad men guide merchants through the maze (7.6).

**The ground.** The polygon `Korona / NE` (px ~867-1343 by 339-682, 430,000 km²) is a bull's-eye of rings round a trench country
(`NOTES.md`, "The corona").
- **The trenches:** under -1,200 m, abyss-hot (35-40 °C), unlivable.
- **The ring crests:** flat-topped tepuis, 1,500-2,600 m.
- **The rain:** the north-west wind drops it on each ring's windward west face.
- **The hoar tables:** above 3,500 m, where the owner's winter gene-modded tribes live (`NOTES.md:206-216`).
- **Coyote land:** the Coyote Kingdom's polygon overlaps the north-east; its sites are left out here.

**The search.** Inside the polygon, outside the Coyote Kingdom:
- **Kept:** land under 4,300 m, under 30 °C (no trenches), gentle ground, with water (a river, a fresh lake, wadis, or 900 mm of
  rain).
- **Scored:** farmland, half the pasture, the river, a lake beside it.
- **Spacing:** 40 km or more from any pin, the sites 60 km apart.
- **Hum names:** the rivers at several sites carry them already (Tōng-Hām, Sīng-Hām, Hau-Kē).

| | Site | Zone | Ground | Water | Farmland, pasture (10 km) |
|---|---|---|---|---|---|
| **K1** | 952,423 | a lake basin on the north-west rings | 147 m, Aw, 690 mm, +27 °C | the Tōng-Hām (39 m³/s), a fresh lake | 169, 234 |
| **K2** | 909,499 | the western rings | 516 m, Cfa, 737 mm, +24 °C | the Sīng-Hām (89 m³/s), a fresh lake | 147, 176 |
| **K3** | 942,521 | the western rings | -30 m, Cfa, 941 mm, +27 °C | the Àirn Rìv (25), a fresh lake | 167, 236 |
| **K4** | 978,540 | an inner ring's lake | -429 m, Aw, 1,223 mm, +28 °C, ~1.7 atm | the Ràv Rìv (18), a fresh lake | 147, 223 |
| **K5** | 964,462 | an inner ring's lake | -381 m, Aw, 909 mm, +29 °C | the Hau-Kē (55), a fresh lake | 104, 188 |
| **K6** | 1006,340 | the northern rim's table | 2,961 m, Cfa, 988 mm, +14 °C, ~1.1 atm | rain | 300, 217 |
| **K7** | 1033,354 | **a hoar table**, 3,824 m | Dfc, 1,019 mm, +8 °C, ~1.0 atm | rain | 265, 146 |
| **K8** | 1040,564 | the southern rings | 272 m, Csa, 1,019 mm, +27 °C | rain | 233, 201 |
| **K9** | 907,586 | a south-west ring crest | 1,787 m, Cfa, 1,035 mm, +15 °C | rain | 206, 199 |
| **K10** | 912,556 | the south-west rings | 625 m, Csa, 690 mm, +24 °C | the Sīng-Hām (upper, 10) | 225, 240 |

**Reading it.**
- **The west is livable:** the villages cluster on the western rings and the north rim, the windward wet side. The eastern rings
  are the dry lee, and the north-east is the Coyote Kingdom's.
- **The hoar table's people:** K7 is the one high site, a village of the winter-modded tribe, selling lichen dyes and snow lotus
  down to the warm rings and the Painted Men (7.1).
- **Possibly the guides' villages:** K6 and K7 stand on the northern rim, toward the arachnoid canyons and the Hām-Tsēk (the
  Arachnoid River's likely course, 7.6), on the silk route. One could be the human guides', one the toad men's. The toad men,
  as a therian tribe of the wet, might rather hold a lake village (K1, K4 or K5). The owner's call.
- **K4 and K5** are the hottest and densest-aired sites (+28-29 °C, ~1.7 atm), on lakes in the inner rings, at the edge of the
  livable.

**Size, as the owner said.**
- **Villages:** each 200-1,000 people, none above 1,000 (the trade model's village estimate is 300).
- **Hamlets:** most of the people live in hamlets round them: `core/hamlet` records, not pins.
- **Bands:** the semi-nomadic bands range between them (`core/camp`), as the Dasri's do.

**What it reaches:**
- **The queue:** village pins for the sites the owner takes, named in the Hum when names come.
- **The trade model:** Korona's polity, perhaps "the Korona tribes": its villages, its dyes, the guides' fee on the silk route.
- **`core/charactermodels`:** the winter mods (`NOTES.md:210`).
- **The sim:** the hamlets and bands.

**Sent** (the owner, 2026-11-12: "send them"): K1-K10 as village pins, no polity, to the queue. **Queued:** collision-checked with
ruins included, and none collides. The nearest pin to any of them is Ardent, 115 km from K9; the closest pairs, K6-K7 and K9-K10,
are 61 km apart. The queue re-checks against the pins of waves 3-4 and the live database when the edit runs.

**The east side's microclimates** (the owner: "see if we can find any microclimates on the east side that would be livable"). East
of px 1050 (outside the Coyote Kingdom), Korona is 155,000 km² of mostly dry ground: BSk, BSh, BWh and BWk lead; the mean is 638 mm
and +19 °C. Two kinds of livable pocket show:

| | Site | Kind | Ground | Against its surroundings (20 km) | Farmland, pasture (10 km) |
|---|---|---|---|---|---|
| **E1** | **1143,596** | a lakeside lowland pocket | 29 m, **Cfa**, 831 mm, +26 °C, a fresh lake | wetter (777 mm around) | 132, 165: the best farmland on the east side |
| **E2** | **1096,572** | a ring crest over the trenches | 1,395 m, Cfa, 1,396 mm, +20 °C | **3 °C cooler** | 69, 112 |
| **E3** | **1146,546** | a ring crest | 1,880 m, Cfa, 956 mm, +18 °C | **4 °C cooler** | 63, 107 |
| **E4** | **1094,501** | a ring crest, north | 1,403 m, Cfa, 815 mm, +20 °C | 3 °C cooler | 56, 99 |

- **The crests are the true microclimates.** Mild (17-22 °C) and wet (800-1,400 mm) Cfa tops, 3-8 °C cooler than the trenches beside
  them, but narrow, with little flat ground: hamlets and a small village each.
- **E1 is a village.** A lakeside pocket with real farmland.
- **Also passing, not proposed:**
  - the inner trenches' lake margins at -800 to -1,000 m: +31 °C, hot and dense-aired (1135,492; 1160,479; 1163,504);
  - 1090,602: an Am pocket with 1,568 mm of rain, but at +31 °C;
  - 1196,606 on the Rīfar al-Bālm: Nomad Country, the Dasri's ground, 90 km from their village 4.
- **Spacing:** the four are 100-140 km apart, and 100 km or more from the K sites.

**Sent** (the owner, 2026-11-12: "Send all nine"): E1-E4 as village pins, no polity, to the queue.

**The north and north-east** (the owner: "any microclimates in the north/northeast portion?"). North of py 480 and east of px 990,
Korona is 125,000 km² (36,500 of it in the Coyote Kingdom's polygon). It is a cold, dry high plateau: median height 3,816 m, mean
+12 °C, 294 mm; Dsc, BWk, BSk, BWh and ET lead. **The plateau itself holds no village site.** Every pocket that passes (water,
+2 to +27 °C, under 4,800 m, gentle ground) lies on its southern edge, where it falls to the inner rings, or on the northern rim's
lower tables:

| | Site | Kind | Ground | Against its surroundings (20 km) | Farmland, pasture (10 km) |
|---|---|---|---|---|---|
| **N1** | **1063,468** | a wet windward pocket | 451 m, **Cfa, 1,929 mm**, +26 °C | **wetter** (1,413 mm around) | 149, 148: the best here |
| **N2** | **1117,421** | a lowland pocket | 6 m, Aw, 800 mm, +27 °C | wetter (542 around) | 50, 132 |
| **N3** | **1063,345** | a table on the northern rim, east of K6 and K7 | 2,328 m, Cfa, 862 mm, +17 °C, ~1.2 atm | 2 °C cooler | 13, 165: herders' ground, summer pasture |
| **N4** | **1026,456** | a ring crest | 1,745 m, Cfa, 752 mm, +19 °C | 2 °C cooler | 53, 142 |
| **N5** | **1158,472** | a lowland in the north-east, outside the Coyote polygon | -291 m, Aw, 721 mm, +27 °C | wetter (622 around) | 78, 221 |

- **The best:** N1 is a village site, a pocket the wind wrings 1,900 mm of rain out on. N2 and N5 are small lowland villages.
- **Highland:** N3 and N4 are hamlets and herders' camps; N3 could be a second winter-modded tribe's ground beside K7.
- **Also passing, not proposed:** a lake shore at 1039,434 (Aw, +27 °C, 102 km²-eq farmland), 83 km from N1; and 998,431 (2,320 m,
  Csa), a near twin of N4.
- **The high north-east** (east of px 1150, north of py 420) has nothing livable: a summer range for bands at most.

**Sent** (the owner, 2026-11-12: "Send all nine"): N1-N5 as village pins, no polity, to the queue.
