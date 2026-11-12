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
far. Each find was checked against `kits/crops`. The strongest rows were spot-checked at their cited lines. **Nothing here is
chosen yet**: the owner picks.

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
- The Painted Men's proposed paints and paintbrush medicine (`paintedhighlands/PLAN.md:186-194`).
- The SW highlands' genepriest curiosities (shelf coral as ore-finder, fishing-bridge venom, cell-lamp spheres).
- **Contraband:** the Outlands' golden bird feathers. The Sill post refuses them, and every Coyote tribe attacks whoever
  carries them (`greatchasm/PLAN.md:208`): a story hook, not a good.
- **Xanadu's lacquerware** is named only as caravan cargo (`twins/PLAN.md:90`, with Xanadui silk and tea), and nothing makes
  it. A Vale lacquer would need a source tree.

### 7.5 Gaps the sweep turned up

- The hearths plan promises `kits/crops` records for hearth wax and stoke. Neither exists.
- Korona's notes promise "rare herbs and reagents" and spice buckets, but name none (`korona/NOTES.md:15, 280`).
- `biomes/STATIONS-MAP-5.1.md` calls the Siphon Pits plan's px old-canvas. The scale-model queue checked them, and they are
  5.1 (2.5c).
- If Ranj is the Spice Isles' spice, the trade model's re-export through Temora and Zey'danin (`TRADE-GOODS.md` section 2)
  should become Ranj, gathered wild on the Throne and fought over: Zey'danin's failing plantations are the story.
