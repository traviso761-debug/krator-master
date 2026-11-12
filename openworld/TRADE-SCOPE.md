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
**Tungangs** extract rare earths too. **The Geomancers work other polities' oil fields under licence**: the oil is sold as
Yuni's and the host takes a cut (its own burning is met first). Nobody else's rare earths are worked.

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
| `hyperjungle` | jungle indigo, sunseed annatto (and bloodwood red, 5a) | the Screamers | `native` on indigo and annatto |
| `nwlowlands` (the Eternians) | **an Eternian tea** and **an Eternian wine grape** | the Eternians | two new records; Eternian wine also a specialty in the trade model ("famed for their wine") |
| `swlowlands` (Dalab), and where Dalab spread it | **hashish** | Dalab | a new record (the resin of a hemp), `native`, home `swlowlands`; **transplanted by polity**: wherever Dalab holds ground its climate fits, the rift rim first (`riftrim`: Ledge, Nulab). The owner: "for dalab, Sw lowlands and places they spread their crops to like the rift rim" |
| `swbay`, `swhighlands` | **four valuable natives** (2.5a, a proposal) | Voth (the bay); the Republic's north and Dalab's Span (the highlands) | four new records |
| `sedesert`, `ebadlands` | incense: myrrh (sedesert) and an ebadlands incense | the Bowl's and the badlands' holders | dragon's blood resin's home trimmed toward `sedesert`; a new ebadlands incense record; Oidong's temple-cedar incense and monk's sage stay (the owner's "mostly") |
| the inner crater | tobacco | the inner crater's polities | tobacco (`src: 'proposed'`, no home today) made `native`, home: `crater-drylands`, `nwbay`, `swbay`, `hyperjungle`, `ringisles`, `geyser` (the Steampits' field), `abyssal-savannah` (its rim) and `throne`, wherever its climate fits there (warmth 3-4, aridity 2-3). The owner: "any appropriate koppen within" those biomes |

**Homes outside `CROPS.BIOMES`.** `riftrim`, `abyssal-savannah` and `swhighlands` are biome kits but not crop zones yet
(`kits/crops/src/10-crop-core.js` `CROPS.BIOMES`). A `home` can name one (laterite ochre's home is `abyssal-savannah`), but
`CROPS.at` cannot place it on the axes until the zone is added: three zones to add, from each kit's `PLAN.md`.
"The hyperjungle biomes" is read as `hyperjungle`; say if more of the jungle kits belong.

**Today's producers these cut** (the published tables): cacao's top five are Voth, Jimjam, Dalab, Fulcrum, Erehwon; coffee's
Voth, Jimjam, Dalab, Erehwon, Fulcrum; tea's the Republic (27%), Dalab, Iziz, the Free Giants, the Talovolci; tobacco's
Voth 2,396 t, Xanadu 1,658, the Eternians 1,493, Dalab 1,445. Under the rule most of these fall to their homes'; the
trade model must place each settlement in a biome (the scale model's biome polygons) before it can say how much.

**The isle demo meets this first.** Its plantations (`settlements/isle-demo/src/15-isle-tune.js`: Nephtos's cacao, indigo,
annatto and tobacco, worked by hired Islanders, `:663`) grow crops that would no longer be native to the Ring Isles. Either
they are recorded as transplants (the colony brought them) or they change; either way the economy's test case moves.

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
| 2.4 extraction, concessions, oil demand | the trade model: who may work a family; the licence as a record (host, operator, cut) | none | none | **no oil good or use in the sim yet**: an oil good, the derrick under licence (operator Yuni, the host's cut: a contract record in `core/simulation/SCHEMA.md`), and the uses (generators, vehicles, lamps) when a region needs them; the isle demo has none of these today |
| 2.4 Locus lode | `kits/resources/data/lodes.json`, the stamp, the digest | the Resources kit (`verify.py --assert`); every page that reads `geology.json` (`python3 tools/reach.py kits/resources/data/geology.json`); Godot via `sync_core.py` | none | the oil node field round Locus (the derrick is Locus's pumpjack) |
| 2.4 the delta rule (later) | `tools/scale-model/geology.py`, `kits/resources/GEOLOGY.md` | a full rebake: every page that reads the geology, the ledger, the hash baseline | none | as the lode |
| 2.5 native crops | `kits/crops` (`native`, `transplanted` by settlement or by polity, new records: Eternian tea, Eternian wine grape, hashish, an ebadlands incense, the four SW natives; dragon's blood's and tobacco's homes; three new zones in `CROPS.BIOMES`: `riftrim`, `abyssal-savannah`, `swhighlands`); the trade model's biome per settlement | `kits/crops` (`build.py`, `tests/test-crops.js`, `verify.py --assert`) and every build that reads it (`tools/reach.py kits/crops/src/20-crop-records.js`) | none | **the isle demo's plantations** (cacao, indigo, annatto, tobacco) and every `CROPS.pick`/`palette` call: the hamlets' fields (`core/hamlet`) and the farms' palettes change; the stocks proof and `test-sim.js` move on purpose, re-baselined |
| 2.6 craft-only | gypsum a trade good in the trade model | none | two SETT_ADDED | none |
| 2.7 scrap to iron | the trade model (smelting before buying) | the geology's ruin bit for lived-in Ancient cities (Iziz, Pylon, Roketstad, Yuni, Hook): a rebake item | none | phase S2's goods row (`scrap`) and recipe (smelter: scrap 1 + fuel 1 = iron 1, 2 h); a `SIM.site` salvage kind on ruin ground whose yield falls as it is stripped; the breakers' floor (`pyl_breakers_floor`), smelter (`pyl_smelter`, `hl_rep_smelter`) and salvage yards (`pyl_scrap_yard`, `vern_salvage_yard`, `hl_rep_salvage_forge`) mapped to them; the isle demo has scrap huts but no ruin ground |

And the documents: `TRADE-GOODS.md`'s tables are rerun and rewritten once the rules are in; the Resource Atlas
(`https://claude.ai/artifact/9En1tFuRjgMMWorwbWDMkT`) is republished only if the owner asks.

## 6. Still open (the owner's calls)

Settled 2026-11-12: hashish's home (`swlowlands`, spread by Dalab to the rift rim), tobacco's inner crater (2.5); the SW
natives are proposed in 2.5a.

1. **The SW natives:** take the four in 2.5a, change them, or add torch-spike red?
2. **"The hyperjungle biomes":** `hyperjungle` alone, or more of the jungle kits?
3. **Incense:** trim dragon's blood resin to the sedesert (it is also home in the NW bay, the Rift and the SW bay today), and
   what the ebadlands' incense is (a pinyon or juniper resin fits the kit's flora).
4. **The Tungangs' rare earths:** may they work Dalab's rare earths (Nulab and Ledge: 15.5 t of the old 22%) under a bargain like
   the Geomancers' licence? Today they work only their own (0.9 t).
5. **The licence's cut:** how much of a concession's oil or its price the host keeps (the model needs a number).
6. **The isle demo's plantations:** transplants (they stay, recorded) or changed to native crops?
7. **Eternian wine:** a crop the farms grow (a wine grape record) and also a specialty the model sells, or only the specialty?
