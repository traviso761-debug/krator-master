# The Catch and the Bowl: the site plans, and the simulation (plan, 2026-11-24)

Item 3 of the owner's brief: *"Make site plans for Jabal, Mantis, Stair, white gill monastery, minor settlements and the
oases and get them on the Simulation. Mantis can use a combo of the Dasri kit and Iziz vernacular."* Everything is
*proposed* unless it quotes the owner or a settled plan. Pixels are scale model 5.1; every height and slope is measured
(`tools/survey.py`, and the per-site samples quoted below).

## 0. The thirteen sites, and what each is waiting on

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
| **Arcbeam** (`skz25tuq0w`, 1016,1058, 2,119 m) | an **arcology** of the Empire of Iziz on gentle upland (slope med 11 m/km); on the Iziz road to the Catch (`PROPOSAL-CATCH.md`: Iziz to Stair "by Arcbeam, Parabola and the Godsgate"), and the Ancients' road to Stair ran from it (`ANCIENT-ROADS.md`) | `kits/ancients`'s **arcbeam** target already exists. *Proposed:* a marker, massing out to 30 km, the Ancient road's head as a setpiece, and its own page left for later. **Question 5** asks whether Arcbeam is the Bowl arcology the owner's rail line was to reach |
| **Parabola** (`scyeauyek7`, 970,1186, 1,716 m) | an **inhabited ruin** of the Empire of Iziz, the north road's gateway; the last Izani place before the Godsgate | `kits/ancients`'s **parabola** target exists. The ground is severe (slope **median 169 m/km**, -714 to 4,713 m within 16 km): it stands on the wall's flank and wants a `bench` as the Hermitage does. A marker, massing, the trail's head, the caravanserai as a `KWCAMPS` halt |
| **The Izani-Dasri village** (`sq11desertw7`, 1042,1083, 895 m) | a **village** of the Empire of Iziz the map calls "(to be named)" | the `dasri` row with `IZV` beside it — the name says the mix. **Question 6**: the session can propose names on the tongues' sound rules, as it did for the oases |

## 8. The two salt works

The owner, 2026-11-16: the Train of Jabal works **both**. They are the reason the Catch matters to anyone.

| Works | Px | Ground | What stands there |
|---|---|---|---|
| **Ṣalṭ al-Bān** (`svhmyhf33w`) | 1080,1428 | 458 m, slope **9 m/km**, a pan 11 km off at 368 m, 16 mm of rain | the Catch's: a field of pans on the floor, raked in the cool months (`CATCH_TUNE.calendar` `pans: [300, 90]`), ~100-150 seasonal. The map's richest unclaimed evaporites lie within 20 km: halite 239, gypsum 194, potash, soda, saltpeter. The halite sheds, the lime kilns, the Train's barracks, the cistern, the loading yard and the trail to Stair |
| **Solta** (`s0zgu7u6yb`) | 1169,1150 | -1,115 m, slope 10 m/km, the salt lake 7 km off at -1,158 | the Bowl's: rock salt 234 and gypsum 253 by the salt lake, 112 km from Jabal by road. The same sheds and kilns in the Bowl's dress, a quarry face in the rock salt, and the grievance of section 4 |

**Both are off the map** (pitfall P5): their ids are absent from `model/src/60-settlements.js`, held in batch 5.1e10.
*Proposed:* `SITES.json` rows with `"model": false` and their own `px`, `py` now (as Lāiṭwāl, Gihon and Strongbow's foot
are carried), the map edit queued. `CATCH_TUNE` already declares Ṣalṭ al-Bān, so the simulation is ahead of the map.

## 9. What item 3 adds to the simulation

The crossing is already on it (`PROPOSAL-CATCH.md` C0-C5 done: 16 places, 7 factions, the rounds with per-leg times and
provisioning, the Split Tally, the seasons; `test-catch.js`, 29 checks). What these site plans add:

| Addition | Where |
|---|---|
| **Jabal** as a town with a census, in place of the off-map pool `gate.dasri`; the Train's round starting there | `BOWL_TUNE` (new) |
| **Mantis** as an Iziz town: its merchant houses, frankincense, resin, dates, figs, the lake's take, and its salt grievance | `BOWL_TUNE` |
| **Solta** as a second works of the Train, with Mantis buying its salt there | `BOWL_TUNE`, and a road to Jabal |
| **Arcbeam**, **Parabola** and the Izani-Dasri village as stops on the north road, so the Iziz houses' round goes stop by stop instead of by one long leg | `BOWL_TUNE` + `CATCH_TUNE` legs |
| The **`dasri-salt`** villages' make (salt, soda, potash, saltpeter, gypsum) feeding `CATCH_TUNE`'s existing goods | the rows |
| The **White Gills** already declared (~15 monks); the lung salt as a good the monks sell and the caravans need | `CATCH_TUNE` (a good to add) |
| Everything joined to Xanadu and Longsong in **`EAST_RIFT`** | `PLAN.md` section 6, C6 |

**The rule:** every one of these is additive. `test-sim.js`, Voth's stocks proof and the baseline must come out
unchanged (CLAUDE.md), and `test-catch.js`'s 29 checks must still pass before the Bowl's are added to them.

## 10. Checks (`verify.py --assert`, each with a negative)

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
- **The baked plan is the plan made again in the browser** (the region's standing check), and `bake_sites.py --check`
  fails on a stale bake.
