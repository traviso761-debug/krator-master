# The isle demo: the site planner

Roadmap stage 6's example: two Islander towns, Kautoa (a city) and Valapo (a village), on the scale model's Ring Sea
isles. `PLAN.md` holds the assay and the plan (P0-P8). This folder is P4, **the site planner**, where the owner lays
out the two towns (P5). Both are drawn (2026-10-18, `site/isle-site.json`); `PLAN.md` section 8 is their programme.

```
python3 build.py                       # writes dist/isle-site.html
python3 serve.py                       # http://127.0.0.1:8817/dist/isle-site.html  (?town=Valapo for Valapo)
python3 verify.py dist/isle-site.html --assert [--shots DIR]
```

## What it is

**Voth's site editor, read in place** (`settlements/voth/targets/voth-site`, never copied or edited):
- its page shell, with this page's words swapped in;
- the site model (`10-site-model.js`): districts, markers, avenues, causeways, stops and lines, and ground edits;
- the scene (`50-site-scene.js`): the ground mesh, water, shoreline, overlay, labels and minimap;
- the tools (`55-site-tools.js`): drawing, editing, undo and redo, ground brushes, import and export.

**On the open world's ground.** The page carries:
- the region (`openworld/isle-demo/data`);
- the world's own height and colour fragments: little-demo's `41-world-fields.js` and `42-world-roads.js`, and
  isle-demo's `43-world-isles.js` (the coast as terrain, the climate classes' colours).

So the planner's ground is the world's, to the centimetre (a verify check). What the owner draws here will stand where
the world draws it.

**One town at a time, each in its own frame** (`src/10-isle-frame.js`):
- metres, x east, z south;
- the origin at the town's settlement point in the open world (Valapo's moved 3.7 km toward its coast: `ISLE.SHIFT`);
- heights above the Ring Sea (0 m here, -1500.09 m in the world);
- the planning square is 7.8 km across.

The site file keeps each town's frame with its drawing: `{site, version, towns: {Kautoa: {frame: {x, z, sea},
districts, markers, avenues, causeways, stations, routes, terrain}, Valapo: {...}}}`. P6 (the city plan) and P8 (the
bake) put a drawing back in the world with its frame.

**This page's own fragments:**
- `10-isle-frame.js` [G data]: the frame, and the `VOTH` object Voth's fragments read, made from the world's fields.
  Voth's cantons, docks and districts are empty lists. `CANT` stands in for the canton plan, which is not on this page.
- `56-isle-tools.js` [web]:
  - saving each town into its own entry of `site/isle-site.json` (serve.py merges it in);
  - a draft per town;
  - the town buttons;
  - the views centred on the town;
  - the isles' words for Voth's ferries and elephant bugs: canoe landings and land stops.
- `98-isle-start.js` [web]: decode the region, raise the town's ground, load its site.

**Voth's files are hashed** in `voth-sources.json`. A build that finds one changed says so. Re-check the planner against
it, then run `build.py --accept`, or vendor the file and track its drift.

## Using it

- **The buttons and keys are Voth's** (the hint line explains each tool). 1-6 draw districts, 7 places a marker, 8 an
  avenue, 9 a causeway or jetty, R/L/M edit the ground, B places a canoe landing, N a land stop, K makes a line.
- **Kautoa / Valapo** switch towns. The page reloads on the other town; unsaved changes stay as that town's draft.
- **save** writes this town into `site/isle-site.json` (serve.py must be running), else downloads it.
  **export JSON** / **copy JSON** give this town's site with its frame. **import** takes a town's site or the whole file.

## Checks (2026-10-15)

`verify.py --assert`: both towns load clean (about 0.7 s headless). The checks:
- each frame is its settlement point, on land;
- the ground equals `WORLD.H` at 24 samples, and the frame's sea is the world's water level;
- the editor adds, undoes and redoes, and the save payload carries the frame;
- serve.py merges one town and keeps the other, and refuses a site with no frame or no such town;
- the Voth files read are the ones recorded.

There are two negative controls, a moved frame and a payload with no frame; both are caught.

## The city page (P6): `dist/isle-city.html`

```
python3 build.py                                          # writes both pages; the city's [G data] half as dist/isle-city.plan.js
python3 -m http.server 8829 --directory .                 # http://127.0.0.1:8829/dist/isle-city.html (?town=Valapo)
python3 verify.py dist/isle-city.html --assert [--shots DIR]
node tests/test-isle-city.js                              # the plan without a browser (about a minute)
node tests/test-isle-sim.js [minutes]                    # both towns on core/simulation without a browser: declared, a day run (~20 s)
node tools/scale-site.js                                  # (superseded: the owner's drawings are at size; --write needs --force)
```

**Both towns on core/city,** one `KCITY` instance each (`src/32-isle-city.js`): `rand: 'krand'`, `index: 'insertion'`, the
exact-streets rule and the "high" stance (a house's floor at its highest corner, its footing down the slope). Steps 0-5
come from the owner's site file and the programme (`src/30-isle-programme.js`, PLAN.md section 8); steps 6-12 are
core/city's builder. A new layout, not a hash-identical port.
- **The owner's drawings at the towns' size** (2026-10-18; `site/isle-site.full.json` keeps the first, full-size
  drawing). The owner's ground edits from the planner (raise, lower, smooth) are replayed onto each town's ground exactly
  as the planner keeps them (`ISLE.terrainDelta`), so Valapo's raised beaches stand where they were drawn.
- **Kautoa** (about 6,000 people, at least two thirds of the build area built): every frontage built, each house in a
  walled compound (a yard behind and beside it, drawn as a low wall), single-family houses; the palace, the ceremonial
  square and the Governor's House at their markers facing the ceremonial park, five envoy houses, a council hall, a
  school, a healer and two chiefs' houses round its ring; the harbour in thirds (fishing west, trade middle, the naval
  base east); a works quarter inland of it; a caravanserai in Ridertown by the west gate; the wall round the build area
  with a gate wherever an avenue reaches it. Each landmark on the slope stands on a terrace cut into the town's ground
  (`KCITY.ground.levelPad`).
- **Valapo** (about a third of Kautoa): no build area drawn, so it grows from the village hall: built ground within a
  radius of it or near the shore, the avenues and the markers (`grow`, the dial for its size); its parks are white sand
  beaches; two harbours (the fishing fleet, the garrison and the trade landing west; the smelter by Market 2 south); a
  caravanserai at the owner's marker A. What open ground is left is farmland by PLAN 8c's crops.
- **The built share** (`_city.cur.R.cover`, a check for Kautoa): every cell of the build area on land counted as built
  (a house's compound, a street or its 2.5 m verge, a landmark, market or plaza) or open (free ground, parks, too steep).
  The census also gives the share the roofs alone cover.
- **Sizes** at five a household: Kautoa about 1,700 buildings and 6,200 people; Valapo about 570 and 2,150.
- **Beyond the square** (the farm ring, the fishing villages, the highways past the gates, Valapo's iron mine camp and
  its cart road) are world records in the probe (`_city.world`), placed later by the open world.

**Placement needs no drawing code.** build.py reads every kit piece's declared box from the kits' sources (`ISLE_DIMS`,
`ISLE_VDIMS`); the plan places by those, so node, the browser and Godot plan alike. The region's rasters arrive as
integers decoded by build.py (`WORLD_RAW`): the page reads no canvas.

**Drawing** (`src/60-isle-draw.js`): the kits read in place and sealed in closures (`bundles.py`): `ISK` (the Islanders,
with kits/resources and the farm animals), `IZV` (the Iziz Vernacular), `CAT` (the Beast Riders kit's buildings: its own,
and its ports of Mav's Refuge's shrine and roost drawn by the town's sealed engine, `kits/beast-riders/towns.py`, whose
maps are the sidecar `isle-city.tex.brtowns.js`), `RINGSEA` (through `settlements/voth/ringsea.py`). Each piece is built
once and drawn instanced: in full within 520 m of the camera's target (2,600 at most), as massing beyond. A port keeps its
town's materials, the towns' shader hooks put on their plain-mesh branch (`DRAW.portMats`). No furniture on this page (the
export profile, P6b, brings it), but what a port's town drew into it.

**Checks** (`src/34-isle-census.js`, run by verify and the node test): exact footprint overlap, nothing on a street, in
the sea or on the wall, the vessels afloat, the programme's landmarks and districts, both harbours' vessels and the six
origins, the wall's named gates, the landing, the size in citizens, the hug, the farmland; that the declared boxes are
the bundles' own. Negatives: a building pushed onto another, one pushed into the sea, the palace taken away.

## The towns on core/simulation (P7b, 2026-10-19)

**Both towns are declared on core/simulation** (`src/15-isle-tune.js`, `40`-`46`, `57`; PLAN.md section 9), each from its
plan's records alone, in Dhelv's order (`settlements/dhelv/src/74-dhelv-sim.js`), and keyed as a settlement
(core/simulation/SCHEMA.md, "Settlements and their economies"): Valapo (2,155 people) and Kautoa (6,235). The page
declares both once they are planned, in one order whichever town it draws, and holds the clock until "run the sim".
- **Places** (`40`): every lot whose key `ISLE.TUNE.sim.kinds` names, as `[kind, {ACTIVITY: slots per 100 m2}, opts]`
  (Dhelv's table shape; the footprint is the capacity, there being no interiors yet); a dwelling's beds its households at
  five a household, so the sim holds the census's 2,155 people exactly; every farm parcel by its crop. Each carries the
  census trade its key works (kits/islanders `IS_TRADES`, read in place by build.py as `ISLE_TRADES`). In world metres
  (the town's frame added), so Kautoa's places and a sea line between the towns share one frame.
- **The walking graph** (`41`): the plan's ways thinned to a node every 12 m, their ends joined to the street they meet,
  the avenues split where they cross, stray pieces bridged; every door a split of its nearest street. One body, about
  2,300 nodes.
- **People** (`42`): a role for each kind of work (farmhands, fishers, dockers, traders, bakers, keepers, craftsmen,
  soldiers, officials), its count the posts its places offer; by age (the owner, 2026-10-19), the children (36% of the
  town), as many at school as the schools', temples' and shrines' STUDY places hold and the rest at housework, the
  elders (8%) at housework, and the adults at home who fill the beds left; dealt by
  `SIM.populate({settlement, prefix})`, then each person's age drawn in its band and the people of each 150 m square
  dealt round its houses again so a house holds a family. `ISLE.simDemography(s)` is the breakdown (verify prints it):

  | | Valapo | Kautoa |
  |---|---|---|
  | people | 2,155 | 6,235 |
  | children (9-15, pupils 6-12) | 776: 245 at school, 531 at housework | 2,245: 530 at school, 1,715 at housework |
  | adults (16-59) | 1,207: 811 employed, 396 at home | 3,491: 2,478 employed, 1,013 at home |
  | elders (60-82) | 172 at housework | 499 at housework |
  | employed | 38% of the people, 67% of the adults | 40%, 71% |
  | households | 429, 19 without an earner | 1,227, 34 without an earner |
- **Company in the free hours:** the plan's pocket parks and plazas (Kautoa 739, Valapo 103), its park and beach districts,
  and more room at the markets, taverns, hall and square: at 10:30 every one of those who want company finds it (Kautoa
  about 5,200 places, Valapo 1,700).
- **Food** (`43`, `44`): the foods are items and goods (Valapo: sweet potato, banana, coconut, fish, meat, bread;
  Kautoa: taro, rice, banana, coconut, fish, meat, bread; the land animals' food is one good, meat, the sea's fish);
  the market, chandlers, traders, butchers, bakehouses and fish docks each sell every food the town makes, the kava
  houses and the guest house serve meals; every house keeps a food store, the barracks eat at their mess. Valapo's own
  economy: the parcels grow their crops, the docks land fish, the pens raise meat, the bakehouses bake bread from sweet
  potato, the windmill crushes cane to sugar, the weavers and potters make cloth and pots; 39 warehouses and
  granaries, 20 carts. A town opens with three days of food (the governor's cover), each in its share of what the town makes.
- **The economy governed** (the owner, 2026-10-19, after two research passes on balancing an economy and on
  inventory control). No hand-set factors: every hour each producer's rate is its full rate times a multiplier from an
  **order-up-to rule with its supply line** (`src/49-isle-govern.js`, `economy.govern`): what is wanted of a good a day
  is its demand plus three tenths of the gap between three days of demand and its supply line, closed over a day and a
  half, over
  what the town makes of it at the full rate (learnt as it runs), clamped to 0.3-1.5. The demand is the good's use and
  unmet draws, its exports or the other town's want where the canoe line carries it, what the ships are set to buy, and
  what the goods made from it want, averaged over the last three whole days (the households restock on a three-day
  round); the supply line is the warehouses, the sites, the carts' loads and the loads at sea.
  **Perishables spoil** at midnight (`economy.spoil`: bread 6% a day, fish, meat and bananas 4%, cane 3%, roots 1.5%,
  coconuts 1%, rice and the dry goods less), booked as used. Cloves, cacao and cane grow at a tenth (`economy.cropRate`).
  **Ships from beyond the isles** call on their own days (`trade.buyers`: Voth traders every 3 days, Izani merchants 4,
  Hykkousoi traders 5, the Ancients' salvagers 6, Islanders of the outer isles 2) and buy what a town makes above a
  floor. **Clothes and armour:** Valapo's weavers make cloth from cotton and garments from cloth (place by place in
  turn), Kautoa's Vernacular workshops sandals and its smithies leather armour from its tannery's leather; everyone wears
  a shirt, a wrap and sandals (two sets, worn out in 90 to 120 days and bought again), the soldiers a cuirass; the
  lakatoi carries garments to Kautoa and sandals and armour to Valapo. The governor's gain was compared at 0.3, 0.5 and
  1.0 over 21 days (after 0.2 to 1.0 on a one-day demand window, which swung with the restocking round): 0.3 holds each
  town's food closest, with the same stock swing and no shortfall; 1.0 drifts most.
- **Pots, tools and salt; the evening market** (the owner, 2026-10-19). Each home with a store keeps a cooking pot (its
  houseworker, else its first resident: `items.household`), cracked in 60 days and bought again from the potters, the
  market or the shops; the bakers and the innkeepers cook with a pot that wears by the worked hour (1,500 hours). The
  farmhands, craftsmen and labourers own a stone tool (adze, harvest knife, maul, scraper; 1,000 worked hours), made in
  Kautoa's workshops from four stones (an inefficient use of the quarry, as the owner asked), whichever of sandals and
  tools the town has fewer days of, and carried to Valapo by the lakatoi; worn through at work it is bought at once in
  work time, and without one a worker works at half pace (the page asks again each hour of work if the town was out:
  `ISLE.simToolRetry`). **Salt** keeps three quarters of the fish and meat that would spoil in the warehouses (a salt for
  four servings), and while a town holds salt its households season their food (Kautoa's own salt now used too), so every
  meal at home counts as a better one (`fine`). The staples shops and the market stay open until 21:00: the farmhands,
  in from the far fields at 17:00, reached a shop as it closed, and from day 13 about 370 of Kautoa's meals a day were
  eaten from an empty store; now none.
- **Tools by trade, injuries, arms, clothes by class** (the wear plan's steps 1, 2, 4 and 5; PLAN.md 9b; owner,
  2026-10-19). Every worker of a tooled trade owns its tool: stone (the orchards' harvest knives, the smiths',
  carpenters' and tanners' adzes and scrapers, the labourers' mauls; Kautoa's workshops, four stones each), wood (the
  field hands' digging sticks, the herders' and grooms' goads, the weavers' shuttles, the potters' paddles, the officials'
  styluses; Kautoa's dockyard, by lakatoi to Valapo), a net (the fishers; the weavers, two cotton each) or a cooking pot
  (the bakers and innkeepers); the dockers and the soldiers draw theirs from the workplace's rack. A worked day carries
  a 0.6% chance of a hurt, healed by a healer's poultice (the healers' herb gardens) or in three days. A quarter of the
  rich adults keep a war club (the dockyard). Each person keeps its class's sets of clothes (poor 2, middle 3, rich 4),
  half wear a sarong in place of the wrap, and the outdoor trades and two fifths of the rest a pandanus sun hat (the
  weavers). Three weeks: 2,240 tooled, 446 on racks; 145 wooden tools, 103 stone, 40 cooking pots and 4 nets worn out
  and replaced in work time; 404 hurt, 369 healed (265 by poultice), none past three days; 948 sarongs and 732 sun hats
  bought; 105 clubs. The weavers' places take cloth three in eight, garments two, mats, hats and nets one each.
- **Needs** (the owner, 2026-10-19): core/simulation's needs run in the isles (`ISLE.TUNE.sim.needs`, Voth's table on the
  isles' activities): seven meters (eat, drink, socialize, relax, contemplate, sleep, material), happiness, its band's
  efficiency at work, loyalty; in the free hours a person does what its meters ask among company, rest, idling and
  worship. With no wells, drink comes with meals, rest, company and a water gourd at work. Material rises 3.6 a day (not
  in children); clothes and pots bought fill it (8 and 20), a set of clothes short raises it 4 a day, and at 55 a person
  buys a **treat** on its time off (Voth's `items.treat`, by wealth, spread a little within each class): the poor a bowl
  of kava (25) at the kava houses and taverns, the middle a pandanus mat (40, the weavers) or a coconut-oil lamp (45,
  the potters, a coconut a lamp), the rich a lamp or shell-and-bead jewellery (70, Kautoa's workshops, a stone a piece,
  by lakatoi to Valapo). Three weeks, the mean meter at the day's end (both towns alike within two points):

  | | day 1 | day 7 | day 14 | day 21 | day 21 without treats |
  |---|---|---|---|---|---|
  | eat | 29 | 28 | 27 | 27 | 27 |
  | drink | 5 | 1 | 1 | 1 | 1 |
  | socialize | 27 | 32-33 | 33-35 | 34-35 | 33-34 |
  | relax | 24 | 33-35 | 35-37 | 35-37 | 35-37 |
  | contemplate | 12 | 49-50 | 59-61 | 60-62 | 60-61 |
  | sleep | 22 | 23 | 24 | 24 | 23-24 |
  | material | 19 | 32 | 31 | 33-34 | 100 |
  | happiness | 89 | 81 | 79 | 79 (68-70% content, 25-27% uneasy, 5% unhappy) | 70 (57-59% content, 12-13% unhappy) |
  | efficiency at work | 1.00 | 0.98 | 0.97 | 0.97 | 0.95 |

  Food, sleep, drink and company hold; contemplation settles near 60 (few choose worship in their free hours). Without
  treats material climbed and pinned at 100 by day 14, taking happiness to 70; with them it settles near 33. Treats
  bought over three weeks: 5,076 bowls of kava, 1,159 lamps, 1,143 mats, 300 necklaces. The seasoning lowers the eat
  meter about a point (happiness +0.5); the pots and the clothes' material under half a point (a pot or a garment every
  few weeks a person). The economy holds at 97% efficiency (the governor makes up the difference).
- **Three weeks' books** (the daily average over days 12-21, three whole restocking rounds; the gain at 0.3):

  | | Valapo | Kautoa |
  |---|---|---|
  | food made over eaten (and spoiled) | +25 a day (of 10,300) | -347 a day (of 28,600) |
  | food supply line | within 15% of its target (three days of demand), up and down with the restocking round | the same |
  | spoiled a day | bananas 244, bread 176, sweet potato 147, fish 62 | bread 429, taro 341, bananas 197, fish 66 |
  | salted instead a day (salt drawn) | fish and meat 157 (50 salt) | fish and meat 34 (14 salt) |
  | meals at home | 4,071 a day, all seasoned; none from an empty store | 11,820, all seasoned; none from an empty store |
  | cloves, cacao | (imported by the oruwa) | made 628 and 462 a day, 575 and 406 bought by the ships; stocks +53, +56 |
  | sugar, cane | sugar 195 a day, 182 to Kautoa; cane +38 | sugar 125 imported and used |
  | cotton, cloth, garments | +122, +34, -1 a day (134 garments to Kautoa) | garments -1 (136 imported, 137 worn out) |
  | leather, sandals, armour | (imported) | -5, +9, 0 a day |
  | pots, stone, tools, salt | pots 5 made, 7 bought; tools 3 bought (by lakatoi), its stock drawn toward six days; salt 92 used (imported) | pots 19 made, 20 bought; stone 53 quarried, 45 into tools (+7); tools 11 made and used; salt 210 made, 132 used and 85 to Valapo (-7) |
  | treats (made, bought a day) | kava 42, 105 (drawing its opening stock down); mats 6, 17; lamps 17, 16; jewellery 7 by lakatoi, 6 | kava 310, 298; mats 23, 54; lamps 67, 47; jewellery 14, 10 |
  | wear goods (made, used a day) | wood tools 2 (by lakatoi), nets 2, 0; poultices 5, 4; hats 2, 10 (drawing down) | wood tools 9, 6; stone tools 6, 4; poultices 10, 8; hats 8, 26 (drawing down) |
  | still piling up | cotton +119 a day | (nothing over +60 but the ships' cloves and cacao) |

  Nothing runs short after the second day (the towns open with lots of what the canoes bring them).
- **Checks** (`45`, verify's Valapo page and `tests/test-isle-sim.js`, for each town; and on the page, the citizens
  drawn near the camera where their poses are, with a figure moved 50 m as the negative): every lot of a census trade is a place; every
  resident has a home and every worker a job in the town; after a world day run minute by minute, every food made and
  hauled, the food eaten, nothing short (draws, purchases, kitchens; a day's stock left) and the food made covering
  what was eaten; the stocks map finding every place from its lot. Each has a negative, for each town. Five days run
  clean too (`node tests/test-isle-sim.js 7200`).
- **Kautoa** takes the same table with rows for its own buildings (the palace, the envoys' and chiefs' houses as
  residences, Ridertown's stables, roosts and shrines, Izanitown's houses, shops, tavern and workshops, the works, the
  dairy). It grows nothing inside its wall: the programme's **farm ring** beyond it (40 sites, a world record) is declared
  as its holdings (rice, taro, banana and coconut to eat, cloves and cacao to sell), a stand-in until core/hamlet's
  farming villages, each with a track from the highways out of the gates. Its bread is taro. 2,472 workers (40%),
  40 carts. A town sells and stores only the foods it makes.
- **The run loop** (`57`): a world minute a `SIM.step`, at the 72-minute day times x1, x20 or x120, held when the page
  opens; the HUD shows the day and hour and the drawn town's food in days. **The stocks id map** (`46`): `ISLE.simIdOf`
  (a lot, its core/tags id or a place id to the town's places) and `ISLE.simHolds(town)` (the `extra` for core/host's
  `KHOST.simHolds`, its stocks the town's own), ready for when the page takes core/host.
- Jobs are dealt nearest first (`work.near`), each town's meals booked by town, and nobody walks farther than 6 km
  (`SIM.REACH`: a town and its farm ring).
- **The citizens near the camera** (`59`): up to 120 of the drawn town's people within 260 m of the camera's target,
  where `SIM.pose` puts them (nobody indoors, no carts), chosen every half second and posed each frame the clock moves;
  stand-ins (an instanced body and head, coloured by their work), core/charactermodels' bodies later.
- **The canoe line** (P7c; the owner's timetable, 2026-10-19; `47`, `61`). Each town's trade landing has a **canoe stop**
  (on the plan: a berth for the lakatoi and one for the oruwa, the nearest water deep and clear enough; in the sim: a place
  with a site store the carts empty). Two **SIM.trade** routes on the timer: the **lakatoi**, the towns' bulk carrier,
  two a day, one each way (they start at opposite stops: a 20-hour passage and a 4-hour stay make a day), carrying
  Kautoa's salt and rice and Valapo's sugar; the **oruwa**, one canoe round a day, carrying only what the receiver is low
  on of the light, dear goods (Kautoa's cloves and cacao; Valapo's coffee when its upland farms are in the sim). The
  want is each town's hourly use of the other's goods (`ISLE.TUNE.sim.trade.uses`). The docked vessel is drawn at its
  berth (`61`). Checks: the berths afloat and clear; the lakatoi both ways with loads; a load traced from Valapo's
  warehouses to Kautoa's and one back; each town's books showing the other's goods imported; what is at sea counted
  inbound and outbound; the books balancing in both towns; the vessels drawn exactly while docked. Each has a negative.
- **The levels and the week test** (P7d; `48`; core/simulation 77-sim-7-lod.js). The town the page draws runs
  presented, the other abstract (`ISLE.simWatch`): its people neither decide nor move, its economy makes by the workers
  its schedule has at work, its carts make timed trips, its households eat and restock by the hour, and the canoe line
  ticks as ever. The week test (verify's Valapo page and `node tests/test-isle-week.js`): a week with Valapo watched,
  then a week with Kautoa watched; each town's books balance over each week at either level, every load shipped landed
  or is at sea, the loads to the abstract town landed and are booked there, each town's food a worker a day abstract is
  within 0.6-1.6 of the same town watched (about 1.1), and nobody in the abstract town decided (0 decisions against
  about 110,000 and 320,000 in the watched town). Each has a negative. A week with Valapo watched takes about 12-16 s
  in node (12.2 s in Chromium), with Kautoa watched 28-33 s (23.5 s); both presented about 38 s (the same run, a loaded machine).
- **P7e, the `sim` export section** (2026-10-20; `50`): the page registers core/export's `sim` section (`by: 'isle-sim'`,
  queued when core/export loads later, as in node) until core/simulation registers it itself, as core/city does `city`.
  `ISLE.simExport()` is a `krator-sim` object: core/simulation's records (`SIM.export`: the clock, activities, factions,
  orgs, 2,839 places, roles, 8,450 actors each with its settlement, events, ports, transports; no nav, no log) and the
  isles' own: per settlement its level, people, warehouses, sites and carts by id, each good's stock (warehouses, sites,
  carts, all holdings) and books (made, used, imported, exported, short), its producers (place, outputs, the governor's
  rate and the full rate), meals, spoilage and salting; the canoe routes (stops, carriers and cargo, shipped, landed and
  at sea by leg and good); what the ships bought. About 3.1 MB as JSON. `sim` is now in the page's profile
  (`EXPORT_PROFILE`): `EXPORT.check` fails on a stubbed or empty section and passes filled (verify's Kautoa page, and
  on the Valapo page after the week; `node tests/test-isle-export.js`). `ISLE.simExportChecks`: every warehouse, site,
  home and workplace a place of its own settlement; each good's warehouse stock what the place records hold; every load
  shipped landed or at sea; every stock and book a count; each with a negative. Godot reading the books after a
  replayed week is P8.

See `KNOWN_ISSUES.md`.
