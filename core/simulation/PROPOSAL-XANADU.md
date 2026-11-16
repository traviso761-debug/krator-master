# Proposal: the Xanadu Sultanate on the sim layer (Erehwon, the Vale, the provinces), beside Oidong and the High Rift

The owner, 2026-11-15: "using these maps and trade info, let's scope Erehwon (and the Vale, and the Sultanate's) trades and
economy for the sim layer. let's plan out the minor villages, hamlets, and other special districts of the country in
preparation to put it in a larger sim fragment with Oidong/High Rift."

Status: **proposed**. Section 9 lists the open questions. Nothing here is built.

This is the sequel to `PROPOSAL-LONGSONG-PINNACLE.md`, which put Longsong and its ring on the valley host
(`core/region/50-region-valley.js`) with a test (`settlements/longsong/tests/test-ls-economy.js`). Xanadu goes on the
same host. Its stand-in "Xanadu market" (`settlements/longsong/src/15-ls-tune.js:128`: an off-map pool with 0 people)
is replaced by the real towns. The fealty and esteem bills then run between real treasuries.

## Sources

- **Gemini's model.** These files set the scale and the goods. Read them as a draft, not as canon (section 1 lists where they disagree with the repo):
  - `openworld/TRADE-GEMINI.md`, `trade-gemini.json` and `populations-gemini.json`;
  - `trade-fleets-gemini.json`, `roads-supplement-gemini.json` and `net51-gemini.json`;
  - the method is in `tools/scale-model/gemini_trade_model.py`.
- **This line's census:** `openworld/RESOURCES-SETTLEMENTS.md`, `TRADE-GOODS.md` and `TRADE-SCOPE.md` (the gateway rule, the native crops, the salt split, the oil licence).
- **The map:**
  - scale model 5.1 edit 7, Erewhon's caldera: `tools/scale-model/edit_517.report.json`;
  - the pins in `tools/scale-model/model/src/60-settlements.js`;
  - `openworld/xanadu-oidong-highrift/plan/sites.json` and `plan/resources.json`.
- **Lore:**
  - LORE.md 6.13: the Sultan, the Vizier, the six guilds, the faith of the Decree, and Xanadu's lack of iron;
  - Erewhon's districts: `settlements/xanadu/targets/erewhon/87-er-layout.js` and `settlements/xanadu/citadel/BLUEPRINT.md`;
  - Qiblai: `kits/qiblai/PLAN.md`;
  - Theodiga: `settlements/theodiga/BLUEPRINT.md`.

## 1. The numbers to reconcile first

The sources disagree on the country's scale by a factor of ten. Every rate below depends on which figure is taken (section 9, Q1).

| | This line's census (`TRADE-GOODS.md`) | Gemini (`populations-gemini.json`) | Lore |
|---|---|---|---|
| The Sultanate | 45,650 (35,500 named) | **465,300**: towns 103,400; rural 361,900 (rural ratio 3.5) | "a rich hilly valley" |
| Erehwon | 20,000 | sim 55,000 (pin 20,000) | **20,000** (LORE.md:479) |
| Qiblai | 12,000 | 24,000 | ~12,000; its hinterland needs ~30,000 (`kits/qiblai/PLAN.md:261`) |
| Theodiga | 10,000 (estimate) | 6,000 | ~5,000: 900 in the arcology, 4,100 in the town (blueprint) |
| Strongbow | n/a | 7,000 | 3,500 |
| Kirstabal | none | 3,750 (a sugar and opium plantation town) | none |
| Thalaba | none | 4,500 (pin 750) | none |
| Gold mines, Opal Valley, Strongwall | none | 1,400 / 1,500 / 250 | none |

**The proposal: lore sizes for the towns, Gemini's rural share for the land.**

| Group | People |
|---|---|
| Towns: Erehwon 20,000, Qiblai 12,000, Theodiga 5,000, Strongbow 3,500, Kirstabal 2,200, the mines and forts ~3,000 | ~46,000 |
| Rural: about 4x the towns, Gemini's ratio held, which also feeds Qiblai's 30,000-person hinterland | ~185,000 |
| **The Sultanate** | **~230,000** |

This is half Gemini's total. Its rural density is 2.5 people per km² over Gemini's 73,808 km² of habitable land, which a hilly valley can carry.

Gemini scales supply and demand by a polity multiplier (about 4.82 for Xanadu) and then rewrites each town's population as 4.5x its sim figure. The sim must not do either. Its people are counted once, as residents of settlements.

## 2. The country as the sim sees it: provinces

The Chancellor of Seals and Provinces is already a great officer of the court (`citadel/BLUEPRINT.md:14`), so the provinces are canon in all but name.

Each province is three things:
- **One rural district:** an abstract settlement holding many villages. It eats, farms, herds and tithes to its town. It is never drawn.
- **A few named villages and works**, drawn from the map's pins or the region's `KHAMLET` sites.
- **A seat:** a town that takes its tithe.

Names are working names (section 9, Q5); the px coordinates are on the 5.1 canvas.

| # | Province (seat) | Ground | Rural people | Named places | What it makes |
|---|---|---|---|---|---|
| P1 | **The Lake Shore** (Erehwon) | The caldera rim round the lake at -520 m, 121 x 66 km: the south-shore bench, the terraces under the three volcanoes, the four islands | 30,000 | Erehwon's ring of 5 farming villages and 1 ranch (`sites.json`, 1,345 people); 2-3 fishing villages; the Pleasure island | Lake fish (the census gives 1,212 fish-eq km²), terrace grain and fruit, the Vale apricot and strawberry-tree, mulberry silk, volcanic sulfur, pumice |
| P2 | **The Vale of Xanadu** (Theodiga) | The old basin between the lake and the dam: 1,591 cells, Cfa, ~913 mm, the Ālph across it | 55,000 | Theodiga's silt-flat temple fields, hives and dairies; 3-4 named Vale villages on the Ālph | The country's granary and its native crops: cacao, Vale saffron, mist tea, the sky poppy; mulberry and silk reeling; lotus root and wild rice |
| P3 | **Shalālāt** (Qiblai) | The lowlands on the cataracts of Nahr ash-Shalālāt, ~-1,900 m, Af | 60,000 | Qiblai's ring (5 farming villages and 1 ranch, 1,345 people); the temple-estate farms; the ghats; a caravanserai on the Erehwon road; the salt pan at 922,1580 | Timber (42,000 t, third on the map), cacao, fruit, potash; honey and milk for the sacraments. The oil field is worked by Yuni under licence (`TRADE-SCOPE.md:94-98`) |
| P4 | **The Gold March** (the Master of Mines' seat at Strongwall) | South of Qiblai: `lode:xanadu-gold` (911,1665, r 16 km), the copper band beside Strongwall (923,1650), placer gold down the rivers | 8,000 | The gold mines (`smgxtultfq`, ~950), Strongwall (a fort of 150-250), 2 placer camps | Gold ore to gold, copper; saltpeter (Gemini: 70 t). The mines eat food from P3 |
| P5 | **The Scarp** (Kirstabal) | The foot of the Oidong–Xanadu scarp, where Kirstabal and Strongbow stand (989-1001,1596-1600) | 20,000 | Kirstabal (2,200), plantation hamlets on the slopes, the foot of the Strongbow lift | Mist tea, cacao and saffron on the slopes, the sky poppy. Not sugar or coffee: the native rule (`TRADE-SCOPE.md:161`) gives those to the Ring Isles and the SW lowlands, so Gemini's sugar, coffee and cotton are dropped |
| P6 | **Opal Valley** (the Sultan's factor) | 1038,1662: terraces of opal diggings, east of the Gold March | 3,000 | Opal Valley Mines (~850) | Precious opal and photonic opal; the Sultan's Fifth |
| P7 | **The North Shore** (Thalaba) | The north shore of the lake and the summer road to Godshearth (217 km) | 6,000 | Thalaba (750 to ~1,000) | Fish; sulfur and machine-wax from the summer expeditions; the vent fields |
| P8 | **The Marches** (the Military quarter of Erehwon) | The south and west rim facing the Lizardmen's floor, lowered to 0.8 km by edit 7 (Tuatara 818,1554, Komodo 865,1617) | 3,000 | 3-4 watch forts and a beacon line | No goods. It is fed and paid; Lizardman raids are its events (section 7, X5) |
| **Total** | | | **~185,000** | | |

The Order of Historians' valley (Longsong, the Singing Gjár, the Mirror Grange, the Caldron House: 4,904 people
simulated today) and the Order's White Gills Hermitage stay the Order's. **Strongbow** sits on the line: in Xanadu's polygon and
in the Oidong Valley's (section 9, Q4).

## 3. Settlements: towns, villages, hamlets and special districts

The sim has one settlement per row. A town's **special districts** are works inside its settlement, or a sub-settlement
where a district eats or holds stock on its own account.

### 3a. Erehwon (20,000; the capital)

The districts come from `87-er-layout.js` and the citadel's blueprint. For each: what it does on the sim, and the records it needs.

| District | On the sim | Takes, makes |
|---|---|---|
| **The Citadel**: the Sultan's Palace, the Vizier's Divan and chancery, the great officers' houses, the gate company of 80 | Sub-settlement `xan:citadel`. It holds **the Sultan's Treasury**, the one store the provinces' dues land in (section 5) | Takes the provinces' dues, the Sultan's Fifth, the oil licence's share and the fealty grants. Pays the garrison, the court and the grants of esteem |
| **The Pleasure Dome** (the citadel's harem, ~200 people) and **the Dome of the Bay** (the feasting dome on Pleasure island) | Sub-settlement `xan:dome`: a luxury sink | Cacao, silk, saffron, pearls, wine, lamp oil (`TRADE-SCOPE.md:127`: 1.5 oil for the Dome), ice from the Caves |
| **The Mint and assay** (the Master of Mines and Mints) | A work in the citadel | Gold, from the mines, to **coin** (the Xanadu currency against the Izani Talent: PLAN-MONEY) |
| **The Goldsmiths' quarter** (the richest guild: LORE.md:477) | A work in the town | Gold to **goldwork**: Gemini puts Xanadu at 99.5% of the world's, and this line's census gives it 100% of goldwork and prayer wheels |
| **The three industry districts** (west, east, south) | Works | Copper smithing, silk weaving and dyeing (saffron yellow, agate-wood maroon), lacquerware once it has a source (section 9, Q7), prayer-wheel drums, the masons' yards |
| **Mines and quarries** (east) | A work with a site | Marble (Gemini gives Xanadu 48.5% of the world's marble, unsold: an export to look at) and building stone |
| **The Caves of Ice** (Ancient, kept cold) | A work and a holy place | Ice for the Dome and the markets; a **keeping** store that lowers spoilage for what is kept there |
| **The Dockyard and waterfront** | A work | Lake barges and dragon boats (the lake carries the Thalaba and island trade). No sea ships: the owner ruled Xanadu has none |
| **Three markets** (garden, main, temple) | One store for the town; the temple market takes the offerings | Where the gateway caravans load and unload |
| **The Temple district, temple garden and baths, monastery** | Places; offerings come in as a wanted sink (PLAN-MONEY.md:231) | Honey, milk, incense, lamp oil |
| **The Military quarter, prison, arena and amphitheatres** | Eaters with posts | The Marches' garrison is paid from here |
| **The garden district, wealthy, middle and slum quarters** | Households by class (where the city host's needs and unrest would go) | No goods of their own |
| **The terrace farms outside the walls** | Part of the Lake Shore's rural district | |

### 3b. Qiblai (12,000; the holy city under the Prismarchy)

The places come from `kits/qiblai/PLAN.md:146-152, 204-212`.

| Place | On the sim |
|---|---|
| **The Temple Mountain and the Hall of the Decree**: the treasury of the Decree, the great wheel house | Sub-settlement `qib:hall`. The **Prismarchy's treasury** sends Qiblai's grant of fealty to the Sultan and receives his grants of esteem (section 5) |
| **The eight monasteries** (ring 1; one colour each; unnamed) | Eight works, or eight sub-settlements if each keeps its own estate's yield (section 9, Q6). Their colleges copy the Song |
| **The kora's arcades**: the prayer wheels and chortens | The prayer-wheel works: copper and goldwork into wheels (an export, 100% of the map's) |
| **Pilgrims' hostels and the four gate markets** | A pilgrim flow: pilgrims come with the festivals' season and eat and give |
| **The Goldsmiths', Masons' and Spicers' halls** | Works (the guilds' Qiblai houses) |
| **Temple estates outside the walls**: hives, dairies, chahar-bagh gardens | Rural villages that tithe to `qib:hall`, not to the town: the first case of an estate (section 6) |
| **The ghats at the cataracts, the caravanserai on the Erehwon road, the ranch** | A caravanserai is a stop of the Erehwon–Qiblai road; the ranch is a ring village |

### 3c. Theodiga (5,000: 900 in the arcology, 4,100 in the town)

From its blueprint:

| Part | On the sim |
|---|---|
| Arcology, 900: priests, monks, grammarians, and the History Monks' fin of 25 | Sub-settlement `theo:arc`, which eats from stores. The Order's fin stays the Order's (its relation record) |
| The town's pilgrim trade, 1,300 | The pilgrim flow, which doubles at festival (the season) |
| **The Salvagers' guild**, 800 | **Scrap to iron**, as `PROPOSAL-LONGSONG-PINNACLE.md` section 7 designed it: only what the Dome has let fall, so it is a site that does not regrow, metered by the Register of Descents. The smelter needs bought coal or charcoal (`TRADE-SCOPE.md:312`). This is Xanadu's answer to its want of iron |
| Farming and herding, 900 | Part of the Vale's rural district |
| The Sultanate's office, 100 | The Vale's tax post |

### 3d. The smaller seats

- **Strongbow** (3,500): the Royal Opal Gate (Gemini), the lift up the 3,100 m scarp, and the end of Xanadu's Ancient road. On the sim it is a toll: every load on the Longsong road and the Twins pass pays a share at the lift (section 5). It makes tea, silk, lotus root and wild rice (census).
- **Kirstabal** (2,200): the Scarp's market town. Gemini made it a sea port and a sugar town; neither holds (no sea, the native rule). Its trade is the scarp's tea, cacao and poppy down to Qiblai by the 108 km barge route (Gemini's busiest internal link, 3,686 t).
- **Thalaba** (750): the north-shore village. In summer it stages the Godshearth expeditions, which bring back sulfur, machine-wax and vent goods. Its winter is fishing.
- **The gold mines, Strongwall, Opal Valley:** work camps on sites (section 4). They eat what P3 sends them.

### 3e. The villages and hamlets

The census engine (`KHAMLET.census`) fixes a village at 240 people (44 households) on the `xanadu` row and a ranch at 145. So the ~185,000 rural people are **~770 villages**. The sim does not draw them one by one:

- **Drawn and declared one by one**, about 40 villages:
  - each town's ring (the region's `sites.json`: 6 at Erehwon and 6 at Qiblai today, 3-4 to add at Theodiga and Kirstabal);
  - the named villages of section 2;
  - the work camps.
- **Declared in bulk**, one rural district per province:
  - one abstract settlement holding the rest (`people`, `works` per focus);
  - it eats its own harvest and tithes its surplus to its seat on a road with `share`, as Longsong's ring does;
  - the region page can still draw a sample of its villages near the camera from the province's land (`KHAMLET.village` on the farm mask), seeded by `KRAND` from (province, cell). The sim never counts those villages.
- **New foci on the `xanadu` row** (`core/hamlet/20-hamlet-cultures.js`), beside farming, ranch, mine and silk:
  - **fishing**, for the lake;
  - **orchard**: cacao, apricot, the strawberry-tree;
  - **tea garden**;
  - **saffron**;
  - **estate**: a temple estate's village, tithing to a temple;
  - **placer**: gold washing.

  Each needs its works in the Xanadu kit. The kit's own gaps list (`kits/xanadu/src/89-xa-trades.js:15`) already names the caravanserai, fishing dock, orchard, mine head and quarry.

## 4. Goods and chains

**Goods the sim carries for Xanadu:** grain, dairy, fish, fruit, cacao, saffron, tea, poppy (section 9, Q3), silk (raw and cloth), timber, potash, copper, gold ore, gold, goldwork, prayer wheels, coin, opal, marble, scrap, iron, coal, salt, pearls, wine, oil, arms, paper, books, lenses, honey, milk, ice.

The chains, each a batch recipe on the valley host:

| Chain | Where | What goes in and out |
|---|---|---|
| **Gold** | The gold mines (site `lode:xanadu-gold`, finite with a slow regen; a grade from the lode's byte) | Ore. Then **assay** at Strongwall or the Mint: ore to gold. The **Sultan's Fifth** comes off the top. Then the **Goldsmiths** of Erehwon and Qiblai: gold to goldwork. Then the **Mint**: gold to coin |
| **Copper** | Strongwall's band, Erehwon's east mines | Copper, used by the prayer wheels, the bronze, the copper smiths |
| **Silk** | Vale mulberry (P2, P3), Qiblai's reeling suburbs, Erehwon's weavers | Cocoons, then raw silk, then cloth dyed with saffron and maroon |
| **Cacao, saffron, tea, poppy** | The orchards and gardens of P2, P3 and P5 | Each dried and kept. Cacao and saffron are the Dome's and the gateway caravans' |
| **Iron** | **The import**, plus **scrap to iron** at Theodiga (Salvagers: the Dome's fall, bought coal) | Xanadu's want of iron is canon (LORE.md:508); the import comes from Iziz and Yuni through the gateways |
| **Salt** | **The import**: the shortfall of ~290 t (this line's figure; Gemini's is 1,543 t) | A third from the Dasri works on the Catch (Ṣalṭ al-Bān, batch 5.1e10, held), a third from the Izani works at the Bowl (Solta), the rest from Iziz and Yuni. Plus Qiblai's small pan (`TRADE-SCOPE.md:60-73`) |
| **Oil** | Qiblai's field, worked by Yuni | 20% of the oil and 10% of the profit to the host: a fixed transfer to the Treasury. The Dome and the lamps take it |
| **Opal** | Opal Valley | Opal and photonic opal; the Fifth to the Treasury, the rest to the gateway caravans |
| **Lacquerware** | Owed | The owner gives it to Xanadu and the Eternians, but it has no source tree or workshop yet (Q7) |

## 5. The polity: the Sultan's treasury, dues and transfers

The sim today owns stock only by settlement (SCHEMA.md:201-203). The polity level is one settlement that holds the
Sultan's account: `xan:citadel`, the Treasury. Every polity flow is a road or a transfer into or out of it.

| Flow | Kind | Rule |
|---|---|---|
| **The provinces' dues** | A road with `share` from each seat to the Treasury | A fraction of each seat's tithe intake: the Chancellor's provinces |
| **The Sultan's Fifth** | A road with `share` 0.2 | Gold, from the gold mines' assay; opal, from Opal Valley |
| **The oil licence** | `SIM.transfer`, every 30 days | Yuni's 20% of the oil to the Treasury (the 10% of profits waits on money M5) |
| **The Strongbow lift** | A road with `share`, on loads passing the lift | The Royal Opal Gate's toll |
| **Longsong's grant of fealty and the Sultan's grants of esteem** | The two `SIM.transfer`s already coded (`15-ls-tune.js:48`) | Now between the Order's house and **the Treasury**, not the off-map market |
| **Qiblai's grant of fealty and esteem** | Two `SIM.transfer`s on the same pattern, between `qib:hall` and the Treasury (`kits/qiblai/PLAN.md:128-132`) | The bills are to be set: a token of goldwork, wheels and books against grain and silk? (Q6) |
| **The court, the Dome, the garrison and the Marches** | Roads out of the Treasury, by `want` | The spendthrift Sultan (LORE.md:508): the Treasury should run short in a bad year, and the Marches' forts go short first. That is the lore's crisis, made by the sim |

## 6. Trade with the world: the gateways

**The rule** (the owner, 2026-11-12; `TRADE-SCOPE.md:19, 32-58`): the East Rift trades directly only with **Iziz, Yuni and
the Dasri**, over the Catch by Stair and the northern passes. Everyone else's goods come re-exported through them.

On the sim this is three off-map markets, one per gateway, each like today's "Xanadu market": a store with a price pool, reached by a caravan road with its days, carriers, `want` and `goods`.

| Road | From the East Rift side | To the gateway side | Out | In |
|---|---|---|---|---|
| **The Catch road** | Erehwon, via Thalaba or Strongbow, the Twins, Stair and the Catch oases (Lasso, Bitta, Arfwai, Kolli) | **Iziz** | Goldwork, cacao, saffron, tea, silk, opal | Iron, arms, salt, scrap |
| **The Catch road** | Same route | **The Dasri** | Same goods | The Catch's salt, alkali, lung salt |
| **The Yuni road** | By the northern passes, or by Strongbow and the Order's road | **Yuni** | Same goods | Electrics, firearms; the oil licence's people |

Gemini's **Annual Great Caravan** (Nulab to Erehwon, 831 km, 45.9% Dalab-run) breaks the rule: Dalab is not a gateway (Q2).

The fleets: Gemini gives Xanadu 12 inland barges, 69 wagon convoys and 43 pack caravans, with 2,910 beasts. On the valley host these become the roads' `carriers`.

**The internal roads** (`net51-gemini.json` class `xanadu`; Gemini's barge links):

| Road | Length | Mode |
|---|---|---|
| Erehwon–Qiblai | 321 km (56 km tunnel) | Ancient road |
| Erehwon–Theodiga | 228 km | Road |
| Qiblai–Strongwall | 83 km | Road |
| Qiblai–Strongbow | 160 km | Road |
| Strongbow–Longsong | 469 km | Partly decayed |
| Kirstabal–Qiblai | 108 km | Barge |
| Qiblai–Theodiga | 155 km | River barge |
| Erehwon–Thalaba | 69 km | Lake barge |

The region's baked link is 313.8 km (`sites.json`). Longsong's caravan still assumes 568 km and 23 days; it is to be reset to the baked 657 km.

## 7. The build, in steps

Each step ends in a node test on the valley host, with a negative for each check, as Longsong's test does.

- **X0. Data, no new mechanism.**
  - Write `XAN_TUNE`: a region tune like `LS_TUNE`, in a new `openworld/xanadu-oidong-highrift/src/15-xan-tune.js` or a shared `core/region` data file (Q8). It holds the settlement table of sections 2-3, the provinces' rural districts, the goods, the diets, the calendar (the Vale's harvest, the tea flush, the saffron's autumn, the festival seasons) and the roads of section 6.
  - Take the region's `sites.json` for the drawn villages.
  - **Test:** a year runs; every town is fed; the ledger closes; the Treasury gets its dues; the gold, silk and goldwork chains run.
- **X1. The valley host grows sites and multi-stop roads.**
  - `50-region-valley.js` passes `site` through to `SIM.recipe`, so the gold, opal, copper and the Dome's scrap deplete or regrow.
  - It allows a road of more than two stops (the Catch road's stages) and the toll's `share` on a passing road.
  - This is a small change to core/region, which Longsong's test must pass unchanged.
- **X2. The joint fragment, Xanadu with Oidong and the High Rift.**
  - Both tunes go into one valley run: one calendar, one ledger, 25 Order settlements plus about 60 Xanadu ones.
  - Longsong's caravan goes to Qiblai or the Strongbow lift, not the off-map market.
  - The fealty and esteem bills run between real treasuries.
  - **Test:** Longsong's ten checks still pass, plus Xanadu's.
- **X3. The gateways.**
  - The three gateway markets as off-map stores priced by PLAN-MONEY's M2 scarcity prices.
  - The caravans carry by want.
  - **Test:** iron, salt and arms arrive; goldwork and cacao go.
- **X4. The estates.**
  - A temple estate's village tithes to its temple, not to its town. Today that is a road with `share` to `qib:hall`; later it is an owner on the ledger (SCHEMA.md:201).
  - The Prismarchy's eight monasteries as eight such holders, if Q6 says so.
- **X5. The Marches and the Sultan's bad years.**
  - Lizardman raids as events on the Marches' forts and the Vale's southern villages: stock taken, a village's harvest cut.
  - The Treasury's shortfall reaching the garrison first.
  - These want core/simulation's events and the needs and unrest levels (the city host has them; the valley host does not yet).

**Sizes:** at the valley host's scale of 10 people per actor, 230,000 people would be 23,000 actors. The bulk rural districts therefore use a scale of 200 (about 925 actors over all eight districts). The towns use 50 (about 900); the drawn villages and the Order keep 10. The valley host takes a `scale` per settlement (an X1 change).

## 8. What this does not do

- It does not draw anything: the region's page draws its sites as it does now.
- It does not move pins. The only map changes it relies on are already queued: Thalaba to 825,1488 (edit 7), and the 5.1e10 salt works, which the queue holds.
- It does not touch core/simulation's contract. The changes are in core/region's valley host (X1) and the tunes.

## 9. Open questions for the owner

1. **The scale of the country.**
   - (a) About 230,000: lore-sized towns plus Gemini's rural share (recommended).
   - (b) Gemini's 465,300 with Erehwon at 55,000.
   - (c) This line's census, 45,650.
2. **The Annual Great Caravan with Dalab** (Gemini's Nulab–Erehwon run). Drop it under the gateway rule, or make Dalab a fourth gateway?
3. **Opium.**
   - Gemini makes Xanadu the world's opium source (94%). Is that the **sky poppy**, the Vale's native crop?
   - If so, its crop record needs `xanadu` among its homes; today its only home is `oidong`.
4. **Strongbow** is in both polygons. Is it the Sultan's (a royal lift and toll) or the Order's?
5. **Province names and seats** (section 2). The Chancellor's provinces want names: Xanadui names in the language's style, or English working names?
6. **Qiblai's economy.**
   - Do the eight monasteries each hold their own temple estates (eight holders), or does the Hall of the Decree hold them all?
   - What does Qiblai's grant of fealty carry, and the Sultan's esteem back?
7. **Lacquerware.** Which tree gives Xanadu's lacquer (a new crop record), and where is the workshop: Erehwon's industry, or Qiblai?
8. **Where the tune lives:** in the region (`openworld/xanadu-oidong-highrift/src`), or in a shared `core/region/data` that the Oidong region also reads?

## 10. Found on the way (to fix with or before X0)

1. **Gemini's ids.**
   - The gold mines have three ids (`sxangold01`, `ssrnk21ybu` and `gem_xanadu_goldfields`) against the page's `smgxtultfq`; Gemini's files are to be re-keyed to the page's.
   - The trade files report towns at 4.5x their sim population.
2. **Gemini's Kirstabal** is a sea port (3,819 t of sea tonnage) in a country with no sea, and grows sugar, coffee and cotton against the native rule.
3. **The crops kit.**
   - Cacao's and the violet plantain's warmth (4) is above the `xanadu` zones' (to 3), so `CROPS.at` cannot grow them at home.
   - The `xanadu` biome's air is 1 atm; the Vale is at 1.55-1.70.
4. **Thalaba.** The page holds 825,1481; edit 7's report has 825,1488, and no SETT_MOVED entry exists for it.
5. **The lake.** Edit 7's report gives the lake a mean of 37 °C and a high of 46 °C, against the Vale floor's 25 °C. That is either a hot caldera, or a fault to check.
6. **Erewhon or Erehwon:** the lore and the region docs say Erewhon; the pin and Gemini's files say Erehwon.
7. **The Vale biome kit** (`biomes/xanadu/PLAN-STATIONS.md`) still describes the lake before edit 7: -717 m, its outlet a cataract, the Ālph's head at the White Gills.
8. **Longsong's caravan** assumes 568 km; the baked link is 657 km.
