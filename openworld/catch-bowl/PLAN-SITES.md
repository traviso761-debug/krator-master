# The site plans across the four provinces (plan, revised 2026-11-24)

Item 3 of the owner's brief: *"Make site plans for Jabal, Mantis, Stair, white gill monastery, minor settlements and the
oases and get them on the Simulation. Mantis can use a combo of the Dasri kit and Iziz vernacular."* Revised for the
owner's second ask (*"Include se outer wall and stalker range in the Sim as well"*): **the sites gain Bāb al-Hawa and
Ranger HQ, Hub 01 as a marker, and the five highland tarns as finds.** The simulation half of item 3 has moved to
`PLAN-SIM.md`. Everything is
*proposed* unless it quotes the owner or a settled plan. Pixels are scale model 5.1; every height and slope is measured
(`tools/survey.py`, and the per-site samples quoted below).

## 0. The sixteen sites, and what each is waiting on

| Site | Px | Pin elev | Ground within 12-20 km | Kit | Page or laid? | Blocked by |
|---|---|---|---|---|---|---|
| **Jabal** | 1225,1149 | -1,206 m | -1,223 to +15 m, slope p95 85 m/km, lake 17 km | `kits/dasri` urban (16 defs) | its own page, laid | - |
| **Mantis** | 1113,1164 | -978 m | 470 m of relief, **lake 2 km**, 1,553 mm | `kits/dasri` + `IZV` | its own page, laid | - |
| **Stair** | 1106,1442 | 1,379 m | 723-2,601 m, slope med 59 m/km | `kits/ancients` (hill) + `kits/dasri` + `IZV` | its own page, laid | - |
| **The White Gills Hermitage** | 1015,1430 | 3,746 m | 1,099-4,861 m, **slope med 102 m/km** | `kits/xanadu` (`XAK`) | laid on a `bench` | `biomes/gills` (P10) |
| **Arcbeam** | 1016,1058 | 2,119 m | 1,832-2,599 m, slope med 11 m/km | `kits/ancients` (arcbeam) | marker + massing | question 5 |
| **Parabola** | 970,1186 | 1,716 m | -714 to 4,713 m, **slope med 169 m/km** | `kits/ancients` (parabola) | marker + massing, on a `bench` | - |
| **The Izani-Dasri village** | 1042,1083 | 895 m | 1,390 m of relief | `kits/dasri` + `IZV` | `core/hamlet` row | its name (question 6) |
| **Kolli** | 1058,1367 | 1,446 m | 381-3,371 m (the fan's toe) | `kits/dasri` + `IZV` | `core/hamlet` row | - |
| **Arfwai** | 1090,1387 | 1,074 m | 465-3,334 m (the fan's toe) | `kits/dasri` | `core/hamlet` row | - |
| **Bitta** | 1088,1455 | 1,576 m | 716-2,041 m | `kits/dasri` | `core/hamlet` row | - |
| **Lasso** | 1083,1474 | 1,509 m | 845-2,122 m | `kits/dasri` + `kits/yuni` | `core/hamlet` row | the seam (`PLAN.md` 3) |
| **Ṣalṭ al-Bān** | 1080,1428 | 458 m | 329-585 m, **slope med 9 m/km**, a pan 11 km | `kits/dasri` pan sheds | `core/hamlet` row | the pin (P5) |
| **Solta** | 1169,1150 | -1,115 m | -1,230 to -920 m, the lake 7 km | `kits/dasri` pan sheds | `core/hamlet` row | the pin (P5) |
| **Bāb al-Hawa** | 1028,1246 (wants the thalweg) | 3,661 m at the pin; **+3,590 m** in its plan | the Godsgate's floor at px 1027, 1,205 m below the plan's own shaft pixel | `kits/ancients` + salvage | a fixture set, not a village | question 4; P14 |
| **Ranger HQ** | 1420,1242 | **1,982 m** | a river valley, water 2 km, the one habitable spot in 255,000 km² | `kits/yuni` (the Emirate's) | `core/hamlet` row or its own page | question 4 |
| **Hub 01** | 1344,1409 | 4,351 m | 4.4-6 km valley ringed by 12-15 km peaks | `kits/ancients` | **a marker and a far silhouette only** | nothing: by design |
| **The five tarns** | 1016,1236 / 1064,1272 / 1134,1218 / 1208,1254 / 1288,1184 | 3,680-4,380 m | each carved and filled **to the metre** | `biomes/seouterwall` + `kits/ancients` | fixtures (section 11) | - |

**"Laid", not planned here.** `openworld/PLAN-SITES.md` step 3 (the generic town steps lifted out of `ISLE`) is not done,
so no region plans a town of its own yet. The pattern that *does* work is **Gihon's**: the town's own page lays it on
`core/city`, a bake writes its records and lanes, and `core/world`'s `48s laidVillage` puts it on the world as it is
(turned, shifted, and whatever the ground will not take listed as `dropped`). The three towns here follow it. The oases,
the works and the village are small enough to be `core/hamlet` rows, laid by the region itself.

## 1. The two new `core/hamlet` rows (*proposed*)

| Row | For | Buildings |
|---|---|---|
| **`dasri`** | the four oases, the Izani-Dasri village | from `kits/dasri`'s `ds_vil_*` register (12 defs): battered `zabur` mudbrick walls on rubble plinths, flat earth roofs on tamarisk poles, the way-shade *sablah* loggia, the beehive granary, the `saqiya` well shed, the round `burj` watchtower, and the fortified oasis `qasr` for a keeper's house |
| **`dasri-salt`** | Ṣalṭ al-Bān, Solta | the same plinths and walls, plus the register's **halite salt-pan sheds** and lime kilns, the pans themselves as `core/city` primitives, the Train's barracks and a water cistern. Its pattern is `xanadu-sulfur` (`openworld/xanadu-oidong-highrift/src/48-world-site.js`), which does the same for Salphar's adits |

Each row names its `kit` so `88s`'s `VK` picks the drawing; `kits/dasri`'s bundle (`dasri_bundle.py`) gives the region
one `DSK`-style bundle, as `IZV` and `XAK` do, and the bake reads the kit's declared boxes from `ASSET`/`def` records.

## 2. Stair

**What it is** (the owner, 2026-10-23 and 2026-11-16): the closest thing to a settlement in the Catch and more of a
glorified campground — **about 750 people** in the **Hill arcology**'s ruin at the biggest of the five oases: the caravan
groups' factors and pens, a handful of merchants selling water, fodder, repairs and news "at the prices the Catch
allows", the **Brotherhood of the Two Horns'** guild house (~60 of the 750), and bands of arcology divers working the
ruin. Its people and traders are Yuni, Izani, Dasrī and Xanadui, and its merchants answer to all four tongues.

**The ground.** The pin stands at 1,379 m in a hollow through the interior hills, with 1,878 m of relief within 16 km and
a median slope of 59 m/km. The Hill wants ~560 m of slope from foot to summit deck over about a kilometre of plan
(`kits/ancients/targets/hill`: 111 garden terraces climbing sinuously along the contour) and the ground gives it. The
spring is where the groundwater under the fans is dammed by the interior hills and rises in the gap, which is Turpan's
arrangement and the reason the biggest oasis is here (`biomes/catch/PLAN.md` section 6b).

**The plan.**
1. **The ruin is the setting, not the town.** The Hill's terraces are drawn from `kits/ancients`'s hill target as a
   landform-plus-kit, dead: no glass, no light, the garden terraces gone to gravel and salt. `core/ruins`
   (`KRUINS.watch`) takes every wreck, as CLAUDE.md requires, so nothing floats and each piece lies on its lowest points.
2. **The town lives in and under it.** A mixed street, on the contract `settlements/iziz/VASSAL-KITS.md` wrote for
   Pylon and Talia: the Dasri oasis register for the pens, corrals, well sheds and the cheap lodging; the **Iziz
   Vernacular** (`IZV`) for the two houses' factories and the Getmastarz compound; `kits/yuni` for the Guild's and the
   Geomancers' factors; the Brotherhood's guild house its own piece, horned (the Dasri horn sign is in the kit's
   `shurfat` pinnacles and the Brotherhood is the Two Horns').
3. **The campground** is `KWCAMPS` (`core/world/48w`): a `halt` formation at the spring, pitched the year round, with
   the caravan groups' lines beside each other and the pens downwind. This is the thing the town actually is.
4. **The spring, the pool, the reed bed and the tugai** come from `biomes/catch` read in place (the Euphrates poplar, the
   salt cedar on its nebkha, the reeds, and the eastern desert's palms and mesquite).
5. **The Theodiga bore's Stair mouth** (the owner, 2026-11-16: the bore stays): the portal open by the spring, the seal a
   rubble plug deep inside and not drawn, the **divers' camp** at its mouth — fire rings, spoil heaps, a windlass, crates
   of bright alloy that came out of a dry ruin unrusted. A setpiece (`PLAN-SETPIECES.md`), not a village.

**On the simulation:** already declared (`CATCH_TUNE`, 690 people plus the Brotherhood's house). What B9 adds is only the
Bowl behind it.

## 3. Jabal

**What it is** (the owner, 2026-11-16): the Dasri's city, capital of the **Jabal Sheikhdom** and home of the **Train of
Jabal**, their great salt caravan company, which works **both** salt works — Ṣalṭ al-Bān in the Catch and Solta in the
Bowl. It is the Dasri's gateway *toward* the Catch; it stands **on the Bowl floor at -1,206 m** (pitfall P8), 227 km from
Mantis by way of Solta and 516 km from Parabola.

**The ground.** The pin is at -1,206 m with the land rising to +15 m within 20 km (1,238 m of relief, slope p95 85 m/km)
and the Bowl's salt lake 17 km off. A city at the foot of a rise, under a rock — which is exactly what `kits/dasri` was
written for.

**The plan.** `kits/dasri`'s urban `ds_jabal_*` register is already Jabal's, designed from Sana'a, Shibam Hadramawt and
Dar al-Hajar, and it holds nearly the whole programme: poor, mid and rich tower-houses of 4-7 storeys, the street-corner
tower, the stepped *Dar al-Hajar* merchant mansion, the 3-arch souq arcade, the **Train of Jabal salt warehouse**
(*wakala*), the **Train of Jabal Salt Caravanserai** (*funduq*), the **Sheikh's Rock-Palace / Mafraj Citadel**, the domed
*hammam* and *birka* cistern, the **Bab al-Jabal bazaar gate**, the call tower, the *nahhas* brazier, the *tannur*
bakery, the weaver-dyer and the coffee-spice *samsarah*. The kit's `o.cliff` mode (rear-high stepped massing, a battered
retaining skirt) puts the citadel and the upper quarter on the rise.

A city page on `core/city`: the citadel and the Rock-Palace on the rock, the souq and the two caravanserais on the salt
road, the tower-house quarters downhill, the cisterns and the *birka* at the bottom of the catchment, the pens and the
Train's yards outside the Bab al-Jabal. `settlements/jabal` (*proposed*), laid on the world as Gihon's Landing is.

**On the simulation (new):** Jabal becomes a town with a census instead of the off-map pool `gate.dasri`. The Train's
round starts here (`PLAN.md` section 6).

## 4. Mantis

**What it is** (the owner, 2026-10-23): an **oasis town** on the south-west shore of the Bowl's great salt lake, in the
one green pocket of monsoon forest and savanna on a hot-desert shore, an **Iziz holding**; it grew under **Yuni's**
influence and was later **taken over by Izani merchant houses**; named after the Bowl mantis. The owner, 2026-11-24:
**a combination of the Dasri kit and the Iziz Vernacular.**

**The ground.** -978 m, **1,553 mm of rain**, +28 °C, the lake 2 km north-east, only 470 m of relief within 20 km. The
green pocket is real on the map, not a conceit.

**What already exists to build from.** `biomes/sedesert`'s **station 2b** (`dist/sedesert-mantis.html`) drew the town's
edge faithfully in 2026-10-26: outlying mud-brick houses, a merchant house's tower with its wind-catcher, a domed shrine,
walled gardens (date groves in rows, fig gardens, kitchen beds), and the Socotran monsoon forest round it (the Mantis
fig, frankincense, the cucumber tree, the Socotran pomegranate, sterculia, dragon's blood groves). The station's "left"
list names exactly this work: *"the town's own build (core/city; its look: Yuni's under the Izani merchants')"*.

**The plan: three fabrics in one town**, read as the owner's history rather than as a style choice.
1. **The old town, Dasri.** The oasis and village register (`ds_vil_*`): battered mudbrick on rubble plinths, flat
   roofs, the *sablah* loggia, the beehive granary, the walled gardens. This is the town the springs made, before anyone
   came for the frankincense.
2. **Yuni's layer.** `kits/yuni` read in place for the caravanserai, the Caravan Gate and the older merchant houses:
   Yuni's Sahel-and-Gaudi fabric is what "grew under Yuni's influence" means, and the kit already exists.
3. **The Izani merchant houses on top.** `IZV` (`kits/iziz-vernacular`) for the houses that took the town over: timber
   and plaster and orange ashlar, copper where they can afford it, the merchant towers with their wind-catchers, the
   Empire's civic hand. A mixed street on the `VASSAL-KITS.md` contract, with the overlap audit its `verify.py` uses.
4. **The forest and the springs** from `biomes/sedesert` read in place (the pocket's four springs, the reed shore, the
   savanna thinning to saltbush and reg to the south-east).
5. **The lake** from `WORLD.waterBodies()` at -1,158 m, with its banded pink, teal and ochre shallows and the springs'
   plumes in them.

`settlements/mantis` (*proposed*), laid. **Whether Mantis wants a vassal kit of its own** is an open lore question
(`LORE.md`, Mantis: "it may want a vassal kit of its own"); the owner's answer today — Dasri plus the Vernacular — makes
one unnecessary, and this plan takes that as the ruling.

**On the simulation (new):** Mantis as a town of the Empire of Iziz with its merchant houses, its frankincense and resin,
its date and fig gardens, its fish-and-shrimp take off the lake's margin, and its grievance: it buys its salt from the
Train at Solta, which the owner's 2026-11-16 answer gave the Dasri over `TRADE-SCOPE.md`'s earlier gift of Solta to
Mantis's houses. That grievance is the Iziz houses' motive on the Catch road, so it belongs in the books.

## 5. The White Gills Hermitage

**What it is** (the owner, 2026-11-02 and 2026-11-16): **fifteen monks** of the History Monks keep a house in the
**White pipe field**, from Longsong. Besides counting the pipes' daily brucite-carbonate rings for the date of the
Cataclysm, they pass the news and rumours of travellers to Longsong — the Order's ear on the Catch crossing — and the
house doubles as a caravan stop. The caravans come for water at the saltcups, from the out-breath's mist, and for **lung
salt** (*Lãg Solṭ*), cut against thin-air sickness on the pass.

**Where.** px 1015,1430, 3,746 m, below the live ring fissure at 1015,1438. The move landed on 5.1 (`SETT_MOVED`), so the
map, the lore and `CATCH_TUNE` now agree. It lies **inside the `the catch` polygon**, so it is this region's site, not
region 2's (`PLAN.md` section 3).

**The ground is the problem.** Median slope 102 m/km and 3,762 m of relief within 12 km: there is no flat ground at the
pin. *Proposed:* a **`bench` landform record** (`core/world/41l-world-landforms.js` already has one: a level terrace cut
into a slope, `w_m` by `l_m` at a rotation, the uphill side cut and the downhill filled within a batter, the toe blended
over a skirt, with `WLAND.check()` to prove the cut and fill). The monks cut their own bench; so does the plan.

**The plan.** `kits/xanadu` (`XAK`) in the Order's manner, as Longsong's monastery is (`LORE.md` 6.15): cells for
fifteen, the counting room with the ring cores in their racks, a store of saltcup water, a guest court and a corral for
the caravans, a chapel, and the path down to the nearer route. Round it, the pipe field: `KSTACKS.chimney` breath pipes
of 15-35 m in bone-white brucite, the saltcups, the candles.

**Blocked on `biomes/gills`** (pitfall P10): the kit is a plan, one source fragment and a texture pack, with no
`build.py` and no station. The *buildings* can go up today with `XAK`; the *pipe field* cannot be read in place until
the kit builds. *Proposed:* build the house and the bench in B6, and leave the pipes as a pending set until the gills kit
lands — and say so in `KNOWN_ISSUES.md` rather than papering it with a procedural stand-in (CLAUDE.md's texture rule
applies to flora too).

## 6. The four oases

The owner, 2026-11-16: each is kept by one caravan group's hands at its well, about 100 people or less, and each sells
water and fodder to all comers, its own group's caravans first. **No oasis waters fields** (the owner, 2026-10-23). Each
carries a name in Yuni, Izani, Dasrī and Xanadui (`CATCH.OASES`), and a caravaneer says whichever his master's tongue is.

| Oasis | Px | Elev | People | Keeper | What stands there |
|---|---|---|---|---|---|
| **Kolli**, "the cold one" | 1058,1367 | 1,446 m | ~80 | **both Iziz houses** (one more ground for their rivalry) | the first water down from the Godsgate: snowmelt seeping at the north fan's toe, a pool, a reed bed, a well. Two keepers means **two compounds**, deliberately apart, each its own `qasr` and pens, sharing one well and resenting it |
| **Arfwai**, "halfway" | 1090,1387 | 1,074 m | ~60 | **the Train of Jabal**, by the salt pans | a lined well in a hollow of the reg, a trough, three poplars. The driest of the four (31 mm) and the one whose well runs to 30 % in late summer (`CATCH_TUNE`, C5) |
| **Bitta**, "bitter water" | 1088,1455 | 1,576 m | ~40 | **whoever holds Stair's pens** | brackish: good for beasts, for people only boiled with ash. The smallest: a well head, an ash hearth big enough to boil for a caravan, a shelter |
| **Lasso**, "the last water" | 1083,1474 | 1,509 m | ~100 | **Yuni's Merchants' Guild and the Geomancers** | the best water on the crossing, 4 km from the perennial Rīfar al-Layl, and the last before the Twins. Two compounds again: the Guild's and the Geomancers', `kits/yuni` for both |

All four stand at a fan's toe, which the ground confirms: Kolli and Arfwai have 2,900 m of relief and a median slope over
100 m/km within 12 km, so each village's flat ground has to be **searched**, not assumed (`KSITES.groundOk`), and each
is drawn with the `dasri` row plus its keeper's own kit. Each gets a **`KWCAMPS` `halt`** beside it, in season, from the
simulation's own carriers.

**On the simulation:** all four are declared already, Kolli and Lasso each split between their two keepers
(`CATCH_TUNE.places`).

## 7. The minor settlements

| Site | What it is | The plan |
|---|---|---|
| **Arcbeam** (`skz25tuq0w`, pin 1016,1058, **its site open**) | **the bridge city**: an arcology of the Empire of Iziz of **10,000 with 6,000 in its hinterland** (the owner, 2026-11-24: *"arcbeam can be 10k + hinterlands"*), on the Iziz road to the Catch. **Not** the Bowl arcology, and no tunnel runs from it. So it is **not a marker to pass** but the largest place on the north road after Jabal, and a market the caravans trade at | `kits/ancients`'s **arcbeam** target exists and **brings its own site: a 3,400 m gorge with a plateau on both rims**. There is no such canyon inside this region's cut — **section 7a** has the survey, the three ways out and why the gorge must wait on B3's road before it is carved. Its present pin is 2,119 m of gentle upland, the opposite of its own site |
| **Parabola** (`scyeauyek7`, 970,1186, 1,716 m) | **the Bowl arcology** (the owner, 2026-11-11: *"the Bowl arcology goes at 970,1186: the Bowl's most temperate ground near the Godsgate"*, and 2026-11-24: *"parabola is the arcology now"*) — the end of the Ancient rail line's possible extension from Strongbow by Theodiga and Stair, **the north portal of the ruined Parabola-Stair bore**, an inhabited ruin of the Empire of Iziz, and the north road's gateway and mustering ground | `kits/ancients`'s **parabola** target exists. The ground is severe (slope **median 169 m/km**, -714 to 4,713 m within 16 km): it stands on the wall's flank and wants a `bench` as the Hermitage does. Its reach grows to 20 km now that it is the arcology. A marker, massing, the rail head and the Ancient highway's start as setpieces, the caravanserai as a `KWCAMPS` halt |
| **Esper** (`sq11desertw7`, 1042,1083, 895 m) | a **village** of the Empire of Iziz, **named by the owner 2026-11-24**; the map still reads "Izani-Dasri village (to be named)" (a map edit, `PLAN.md` section 11) | the `dasri` row with `IZV` beside it — the fabric says the mix the old label described |

## 7a. Arcbeam's canyon: the siting survey, and why the model has no site for it (2026-11-24)

The owner, 2026-11-24: *"arcbeam can be 10k + hinterlands - we need to site it in an actual canyon that fits the
arcology model, preferably someplace it is actually helpful as a bridge. we may need to tweak its dimensions in order to
do this."*

**What the model asks for.** `kits/ancients/targets/arcbeam/89z-rows.js` says it in its first lines: Arcbeam *"brings
its own site: a 3,400 m gorge, a plateau on both rims and a graded skirt down to the plain"*, with **gorge floor y = 0
and rim y = 400** — so a **3.4 km span across a 400 m trench**, the built work reaching ±600 m from its axis and the
plateau skirt running to 1,600 m. It is a 700,000-triangle megastructure, and **the gorge is the larger part of the
site**: the city itself is only 1.2 km across.

**The first thing the survey settled: the scale model cannot carry that gorge at all.** At 2 km a pixel a 3,400 m gorge
is **1.7 cells**. Sub-cell trenches are not the model's job — they are the open world's, where `extract_region.py`
carves river channels below the cell (`carve_subcell_rivers`) and `WORLD.H` hands the kits a `canyon` field. So the
question is not "where is a 3.4 km gorge on the model" but **"where does a named river cross a road in a trench the
open world will carve, with level ground on both rims"**.

**Asked that way, the answer inside this region's cut is: nowhere.** Measured
(`openworld/catch-bowl/tools/survey.py` and the scans of 2026-11-24):

| Test | Result |
|---|---|
| Named rivers crossing the Iziz–Arcbeam–Parabola–Godsgate corridor | twelve, including Rrivar Cistal, Goulda, Loña and pina |
| Any of them running **two consecutive cells** in a trench ≥250 m below level rims | **none** |
| Cross-sections anywhere on those rivers with rims within 50 m of each other **and** ≥150 m of depth | four, all **single cells** |
| The best of them (Rrivar Cistal, px 936,1061: 4.0 km wide, rims 43 m apart) | an **artefact**: the river is plunging off an escarpment, and two cells on its "rims" read 300–800 m apart. It also lies in `godstep valley`, **outside this region's cut**, 160 km from Arcbeam's pin |
| V-notches on the roads where a span would save real climbing | **one**, at px 990,1227 — 329 m deep, 5.0 km wide, rims 15 m apart. Also an artefact: it is on the *straight line* Parabola–Kolli at 5.3 km altitude, i.e. across the wall, where no road goes. The carved Godsgate corridor beside it runs at 2,284–3,739 m |
| Dips on Iziz–Arcbeam, Arcbeam–Parabola, Iziz–Parabola or Mantis–Jabal | **none at all**: those roads are monotonic climbs and descents |

**Why there is nothing, and it is not an accident.** The Bowl is a basin ringed by escarpments and the Catch is a sealed
floor: their roads climb out of an abyss (Iziz stands at **-1,428 m**) and over walls. A bridge city belongs to
**dissected plateau** — country cut into blocks by trenches — and there is none of that here. Arcbeam's present pin
(1016,1058) is the opposite of its own site: 2,119 m of **gentle upland**, median slope 11 m/km.

### The three ways out

| | What it means | Cost |
|---|---|---|
| **1. Carve the gorge** *(recommended, with 3)* | The repo's established move: the Godsgate's 100 km corridor and all five highland tarns were carved into the model by edit scripts and landed to the metre. A gorge for Arcbeam is the same kind of edit, and it should be carved **where a bridge earns its keep** — a tributary trench the north road has to cross, so the highway *is* the bridge | a scale-model edit, and it must wait on the road: see below |
| **2. Move Arcbeam to real canyon country** | The planet has plenty — `Loom Chasms` (warp chasms), `greatchasm`, `labyrinth`, `necanyons`, `the Cut`, `outlandgate`. All are far from the Bowl, and Arcbeam stops being the Iziz road's arcology, which is the whole of its present role | it leaves this region, and the north road loses its only Imperial place between Iziz and Parabola |
| **3. Tweak its dimensions** *(the owner's own suggestion; recommended with 1)* | The **city** is 1.2 km across; only the **gorge** is 3.4 km. Dropping the span to about **2 km** and the rims to **250 m** halves the carve and leaves the megastructure's own geometry untouched — `AB_SITE`'s builders derive every face from the gorge's numbers, so the city rescales with it rather than being redrawn | the target's `89z-rows.js` numbers change, and its comparison shot's camera distances with them |

### What this means for the order of work

**The gorge cannot be sited until the north road is routed.** A bridge is only useful where the road crosses it, and the
road's line is `PLAN.md` B3's (`ROADS` on the `trail` kind, routed along the Godsgate's thalweg). So:

1. **B3 lays the north road** — Parabola, the Godsgate, Kolli — and reports where it crosses tributary ground.
2. **Then the gorge is carved** at the best of those crossings, to the dimensions of option 3, and Arcbeam's pin moves
   onto its rim. That is a scale-model edit, queued in `MAP-EDITS.md`.
3. **Until then Arcbeam keeps its present pin** and its census (10,000 plus 6,000 in its ring), which do not depend on
   where it stands: `core/region/data/bowl-tune.js` marks it `site: 'open'` so nobody mistakes the pin for a decision.

**One thing worth the owner's eye.** A bridge city that *creates* its route is a stronger piece of world than one that
happens to stand by a road: if the gorge is carved across the north road's line, then Arcbeam is **why the road goes
that way**, and the Ancients' 30 m highway over the Godsgate has a reason to pass through it. That is the version worth
building, and it is the reason to wait for B3 rather than pick a pixel now.

## 8. The two salt works

The owner, 2026-11-16: the Train of Jabal works **both**. They are the reason the Catch matters to anyone.

| Works | Px | Ground | What stands there |
|---|---|---|---|
| **Ṣalṭ al-Bān** (`svhmyhf33w`) | 1080,1428 | 458 m, slope **9 m/km**, a pan 11 km off at 368 m, 16 mm of rain | the Catch's: a field of pans on the floor, raked in the cool months (`CATCH_TUNE.calendar` `pans: [300, 90]`), ~100-150 seasonal. The map's richest unclaimed evaporites lie within 20 km: halite 239, gypsum 194, potash, soda, saltpeter. The halite sheds, the lime kilns, the Train's barracks, the cistern, the loading yard and the trail to Stair |
| **Solta** (`s0zgu7u6yb`) | 1169,1150 | -1,115 m, slope 10 m/km, the salt lake 7 km off at -1,158 | the Bowl's: rock salt 234 and gypsum 253 by the salt lake, 112 km from Jabal by road. The same sheds and kilns in the Bowl's dress, a quarry face in the rock salt, and the grievance of section 4 |

**Both are off the map** (pitfall P5): their ids are absent from `model/src/60-settlements.js`, held in batch 5.1e10.
*Proposed:* `SITES.json` rows with `"model": false` and their own `px`, `py` now (as Lāiṭwāl, Gihon and Strongbow's foot
are carried), the map edit queued. `CATCH_TUNE` already declares Ṣalṭ al-Bān, so the simulation is ahead of the map.

## 9. Bāb al-Hawa, the Vent-Shaft Caravanserai (the SE outer wall)

**What it is** (`biomes/seouterwall/PLAN.md` section 3.3, with **Parabola in place of Arcbeam**: the owner, 2026-11-24,
*"there can be a (ruined) tunnel from stair to parabola, but not to arcbeam"*): just south of the Godsgate's 3,620 m
saddle divide stands a colossal **40 m Ancient ventilation and access shaft collar** of seamed white metal and bronze
ring-bands, sunk **1,400 m to the summit section of the Parabola-Stair bore**. The shaft is plugged by fallen
megabreccia 180 m down, *but warm dry air at +16 °C still drafts gently upward through the rubble from the
geothermally heated bore below.* Yuni, Izani,
Dasrī and Xanadui caravaneers have turned the sunken concrete apron inside its **cyclopean wind-baffle crescent** into
**the pass's only safe overnight camp**: a roofless stone-and-salvage caravanserai where beasts are tethered out of the
100 km/h nocturnal God-Bore, prayer wheels spin beside Izani milestones and Yuni stencil signs, and desperate arcology
divers now and then winch down the choked shaft toward the sealed mid-tunnel wreck.

**Why the pass exists at all, and the shaft with it.** The Ancients bored a base tunnel from **Parabola** (970,1186) to
**Stair** (1106,1442) — 580 km, of which **115 km lies under the SE outer wall with 4,506 to 8,154 m of rock over it** —
and the line of it runs **straight down the Godsgate corridor** (at 45 % and 50 % of its length it stands at px
1031,1301 and 1038,1314, inside the carved trench). Above it they graded a **30 m surface highway** at a 4 % ruling
grade, board-formed cyclopean cuttings and monolithic parabolic wind-baffle walls, for what would not fit the bore and
for when the bore was shut. Beside the divide they sank this shaft to the bore's summit section — **1,400 m exactly,
from the 3,590 m apron to a bore standing near +2,190 m under the pass**.

The bore is **ruined** (the owner's word) and the surface highway is what survived. **There is no Arcbeam-Stair tunnel**:
Arcbeam is an Iziz arcology on the road and nothing runs beneath it (`PLAN.md` answers J and M, pitfall P17).

**The plan.** Not a village: a **fixture set** (`PLAN-SETPIECES.md` section 1), because everything here is one authored
thing in one authored place —
1. the **shaft collar** (`kits/ancients`: seamed white metal, bronze ring-bands, 40 m across), its mouth fenced, warm
   air visible as a shimmer in the cold — *what it is a shaft to* is question M;
2. the **wind-baffle crescent**, parabolic, cyclopean, the only thing standing between a train and the God-Bore;
3. the **sunken apron** inside it: tether rings worn bright, a thousand fire scars, salvage walls built up course by
   course by whoever wintered here;
4. the **shrines in four tongues**: prayer wheels, Izani milestones, Yuni stencils, a Dasri horn sign;
5. the **divers' winch** over the shaft, and the tally of who went down.

**Where exactly**: its plan puts the collar at **+3,590 m**; the map's pin (1033,1258) reads 4,795 m, 1,205 m up the
corridor's east wall, while the thalweg at that row is at px 1027 (P14). *Proposed:* **move the pin onto the thalweg** —
the plan describes a *sunken* apron on the pass floor, not a perch.

**On the simulation**: `PLAN-SIM.md` section 2a. It sells **nights**, not water, and that asymmetry is the economy of
the whole pass.

## 10. Ranger HQ, and Hub 01 (the Stalker Range)

### Ranger HQ

**What it is**: `sz85a8i5js` at px 1420,1242, a *"fortified Yuni Stalker-watch outpost supporting caravans through the
Stalker Gate"*, polity **Yuni Emirate**, Gemini's population 350. It is Gemini's pin of 2026-11-14 and has never been
put to the owner (question 4).

**The ground makes the case for it.** It stands at **1,982 m with water 2 km away** in a province whose median is
7,794 m with 0 mm of rain: a river valley on the eastern edge, where the Stalker Range meets the Stalker Gate. It is the
**one habitable spot in 255,000 km²**, and it happens to sit astride the only pass network between Yuni and the east.

**The plan.** A fort, not a town: `kits/yuni` read in place (the Emirate's own fabric, and the kit exists) —
1. a **walled compound** on the valley's shoulder, with a gate facing the Stalker Gate road;
2. the **watch towers** with sightlines east and south, which is the whole point of the place;
3. the **rangers' hall**, a smithy, a surgeon's room, a charcoal store, the families' quarters;
4. the **bounty board** at the gate, and the **salvage yard** — the one place in the world where a Stalker hull, a
   harpoon mechanism or a power cell comes to market with a provenance;
5. the **caravan yard** outside the wall, where a train waits for an escort (`KWCAMPS` halt).

**On the simulation**: `PLAN-SIM.md` section 4a. It farms nothing and eats everything carried up from the Yuni valley;
it sells **escort** (on the Brotherhood's Split-Tally pattern) and **Stalker salvage**; it buys arms, explosives, grain,
charcoal and medicine; and it posts the only standing bounty on Stalkers in the world.

### Hub 01

`sodpa02bfv` at px 1344,1409, **4,351 m** (its plan's figure to the metre): a ruined arcology in a 4.4-6 km high valley
ringed by 12-15 km peaks, run by a mad AI, with **no polity, no people, no goods and no trade**.

**The plan is restraint, and the owner's 2026-11-24 ruling sharpens it.** *"There is no trail towards hub 01. People who
go that way tend not to come back. Foolhardy rangers have brought back reports of an ancient facility there, but its
function as stalker HQ is surmised, not confirmed for them."* So:

- **No road, no trail, no waystation, no spur.** The Stalker Gate's network stops at its westernmost waystation; beyond
  it the region draws nothing but land (`PLAN.md` section 2b).
- **A marker in "Go to" and a far silhouette** on the horizon from the Catch floor and the SE outer wall's eastern
  benches — which is what the rangers' reports describe: *a tower that is not rock*.
- **One built thing, and it is not at Hub 01**: the **Rangers' last cairn**, far out on unmarked ground, with other
  people's gear piled on it, where the foolhardy turned back (`PLAN-SETPIECES.md` section 4). It is reached only by
  someone who goes without a road.
- **No site plan, no streets, no interior, no approach.** If a later session builds it, it is the object of the
  expedition in `PLAN-SIM.md` 4b, and it needs the owner's word on what is inside.

Drawing it at a distance, letting the Rangers be wrong about it in a way that happens to be right, and never confirming
it until somebody goes — that is the design working (*"the game shows it, never says it"*).

## 11. The five highland tarns: finds, not settlements

`biomes/seouterwall/PLAN.md` section 4 gives five hidden highland lake oases as *"rewards for off-road exploration"*,
each in a distinct structural trap that shields it from the katabatic wind and buffers it **+5 to +14 °C** above the
surrounding fellfield. **All five are carved and filled on 5.1 to the metre** (`PLAN-TERRAIN.md` 6a). The region draws
them; none carries a census (`PLAN-SIM.md` section 5).

| Tarn | Px | Level | Its trap | Its exploration hook, as a fixture |
|---|---|---|---|---|
| **Gate-Bell** (*Kolli-Tarn*, *Birkat al-Jaras*) | 1016,1236 | 3,680 m | a hanging glacial cirque 260 m above the Godsgate's west wall, dammed by black Ti-basalt moraine | a toppled **Ancient acoustic fog-horn** that once guided blind crawlers through the pass, with a hermit Historian's observation cache in its dry bronze housing, overlooking the whole Godsgate |
| **Amber-Sinter** (*Chashma-yi Zard*) | 1064,1272 | 3,940 m | a fault-wedge canyon where a Godthrone feeder dike intrudes the megabreccia; a 25 m travertine sinter terrace dams it; subaqueous fumaroles 55-72 °C keep it ice-free | a band of **free Talovolci prospectors and Dalab runaway mods** wintering in the warm sinter caves behind the waterfall, mining orange titanium glass and alkali sinter *without descending into the Catch*; dwarf Hearth-trees spreading 10 m black radiator umbrellas |
| **Mirror-Slump** (*Lago de Specula*) | 1134,1218 | 4,120 m | a back-tilted listric slump sag pond 2,400 m above the Bowl, behind a 300 m **pseudotachylite friction-glass** mirror wall that focuses noon sun onto the lake | an intact **Ancient geodetic survey and laser-relay bunker** cantilevered into the black mirror-scarp, still holding unplundered optical lenses, with a panoramic sightline across the Bowl to Mantis |
| **Jade-Karst Polje** (*Birkat al-Zumurrud*) | 1208,1254 | 4,380 m | a rafted reef-limestone megablock dissolved into an alpine karst polje 450 m below the felsenmeer; a sub-permafrost karst spring at +9 °C | a karst cavern (`KCAVERN`, `cav_sewall_jade`) connecting at depth to a fractured **Ancient seismographic vault** with alloy stock and **a sealed records cylinder detailing the Cataclysm-era seismic wave that collapsed the Stair tunnel and drove Hub 01 mad** |
| **Copper-Vein** (*Waita-Kopa*, *The Stalker's Mirror*) | 1288,1184 | 3,820 m | a glacial rock basin cut through a malachite-azurite-chalcopyrite skarn vein, staining the shallows peacock-blue | the **Geomancers' abandoned high copper-and-rare-earth mine**, given up to Stalker incursions from Hub 01 225 km SSE; a **wrecked Harpooner frozen in the aufeis** beside an unlooted battery-charging winch — and a live Stalker pair on the upper moraine at dusk |

The Jade-Karst records cylinder is worth flagging on its own: it is the one object in the region that **answers the
author's open question** (what drove Hub 01 mad), and the owner has deliberately left that open to all three causes
(contamination, a virus, reprogramming). So the cylinder should say what the *wave* did and not what it *caused* — or
the plan loses the owner's ambiguity.

## 12. Checks (`verify.py --assert`, each with a negative)

- **Each site at its pixel**, on dry land, inside its overlay, within a band of the height this plan quotes; the negative
  reads a point 14 km off.
- **Each village whole**: its buildings apart and on good ground, tagged, cleared of flora, its lane end on a way; the
  negative drops one building's ground.
- **Kolli's and Lasso's two compounds** apart by more than their own width, sharing one well record.
- **Stair**: the Hill's terraces on the slope with nothing floating (`KRUINS.watch`), the spring and its reed bed drawn,
  the bore's portal open and the camp at its mouth, the campground's halt pitched; the negative reads the hollow without
  the spring.
- **The Hermitage**: the house level on its bench (`WLAND.check()`: the cut, the fill, the batter and the toe), the path
  joining a way; the negative puts it on the 102 m/km slope and must fail.
- **Mantis**: three fabrics on one street with no overlap (the `VASSAL-KITS.md` audit), the lake within 3 km, the
  pocket's forest round it and saltbush to the south-east.
- **Jabal**: the citadel on the rock in `o.cliff` mode with its skirt on the ground, the two caravanserais on the salt
  road, the *birka* at the bottom of the catchment.
- **The works**: the pans flat (under 20 m/km), the sheds beside them, the trail to Stair at its grade.
- **Bāb al-Hawa**: the collar on the thalweg (not 1,205 m above it), the crescent upwind of the apron, the apron below
  the crescent's lip, the winch over the shaft; a walker on the apron in the God-Bore takes less `cold` than one outside
  it. Negative: the apron placed outside the crescent must fail that comparison.
- **Ranger HQ**: the compound walled and gated toward the Stalker Gate, each tower's sightline clear east and south
  (ray-marched, as `KCAMP.lookout` scores), the caravan yard's halt pitched outside the wall. Negative: a tower with the
  valley wall across its line must fail.
- **Hub 01**: a marker and a silhouette, and **nothing enterable** — no lanes, no lots, no interior. The check is an
  inverse: the registry holds no building records at Hub 01's site.
- **The five tarns**: each water body at its planned level to within a metre (3,680 / 3,940 / 4,120 / 4,380 / 3,820 m),
  each fixture on its own ground, the Amber-Sinter grove warmer than the fellfield round it. Negative: each level read
  2 km off its pixel.
- **The baked plan is the plan made again in the browser** (the region's standing check), and `bake_sites.py --check`
  fails on a stale bake.
