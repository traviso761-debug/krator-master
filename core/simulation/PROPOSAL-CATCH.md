# Proposal: the Catch, its oases and the Twins on the sim layer (2026-11-16)

The owner, 2026-11-16:
- *"make proposal for integrating the Catch and its oases to the simulation. major northern caravaneer groups will be the
  Geomancers, the Yuni Merchants' Guild, two rival Iziz merchant noble houses, and the Train of Jabal, who operate the Catch
  salt works. Stair will have a pop of 750. other oases will be ~100 or less."*
- *"also integrate the Twins"*.

Everything else here is *proposed*. The facts come from a survey of the repo the same day, written up with its sources in
`core/simulation/CATCH-SURVEY.md`. Pixels are scale model 5.1 (2 km a pixel).

## 0. What this changes, and what it contradicts

Today the sim has no Catch.
- `core/region/data/xan-tune.js` reaches Iziz, the Dasri, Yuni and the Geomancers by four off-map pools (`gate.*`). Each
  pool is joined to its entry town by one long road of 22-64 days.
- Nothing in between is a settlement: not Stair, not the oases, not the salt works, not the Twins.
- This proposal puts the crossing on the map. The caravans then go stop by stop, and the people of the crossing live off
  them.

The owner's numbers change three records. Each is to be brought in line when this is accepted:

| Record | Says | Now |
|---|---|---|
| `biomes/catch/PLAN.md:161`, `LORE.md:84` | Stair is "a couple of hundred" | **about 750** |
| `biomes/catch/PLAN.md:118-119`, `LORE.md:86` | "none is lived in but Stair's" | **the other oases ~100 or less** |
| Gemini's model (`gemini_trade_model.py`) | Kolli 550, Arfwai 650, Stair 250 | superseded by the owner's numbers |

Stale records the build must not trust, fixed with it or before it:
- **The northern Stair tunnel is dropped** (`LORE.md:82-83`, 2026-11-11). **The Theodiga tunnel stays** (the owner,
  2026-11-16: "we can leave in the stair to theodiga tunnel"): the Ancients' dead bore from Theodiga to Stair under the
  Twins (`rift.bowl.theodiga-stair`, 438 km, no trains). It is a third, hard way across for the sim's caravans: dark,
  with little food or water. Station 2's portal at Stair is its mouth. The plans now say so.
- **The Twins plan's distances are about half** what its own 5.1 points measure. Route A is "~93 km" in the plan but 228 km
  on its waypoints.
- **Strongbow** stands at 1001,1596. The Twins plan and `kits/resources/data/ledger.json` still use 1026,1594.
- **The Catch salt works** (Ṣalṭ al-Bān `svhmyhf33w`, 1080,1428) and the Bowl's (Solta `s0zgu7u6yb`) are pins held in
  batch 5.1e10, not yet on the map.
- **Yuni's caravans.** `xan-tune.js` says they come "by the Geomancers' road from the north-east" to Qiblai. The only
  recorded road from Yuni to Xanadu crosses the Catch (Mantis, Parabola, the Godsgate, Stair, the Twins, Strongbow). So
  the Geomancers' and Yuni's caravans both cross the Catch, then go on from Strongbow to Qiblai.

## 1. The places

### 1a. The Catch

| Place | Pin | 5.1 px | Ground | People | What it is |
|---|---|---|---|---|---|
| **Stair** | `s2o8f4p123` | 1106,1442 | 1,379 m, 16 °C, 47 mm, BWk | **~750** (the owner) | the crossing's entrepôt, in the Hill arcology's springs' hollow at the biggest oasis: the merchants who "sell water, fodder, repairs and news at the prices the Catch allows" (`catch/PLAN.md:159-167`); the arcology divers (salvaged alloys and energy cells that keep in the dry); each caravan group's factor and pens; the Brotherhood of the Two Horns' guild house (in the tune today but "off the map") |
| **Kolli**, "the cold one" | `scatchkolli01` | 1058,1367 | 1,446 m, 15 °C, BWk | ~80 | first water down from the Godsgate: snowmelt at the north fan's toe, a pool, a reed bed, a well |
| **Arfwai**, "halfway" | `scatcharfwai01` | 1090,1387 | 1,074 m, 18 °C, BWk | ~60 | a lined well in a hollow of the reg, a trough, three poplars |
| **Bitta**, "bitter water" | `scatchbitta01` | 1088,1455 | 1,576 m, 14 °C | ~40 | brackish water: good for the beasts, and for people only when boiled with ash |
| **Lasso**, "the last water" | `scatchlasso01` | 1083,1474 | 1,509 m, 14 °C | ~100 | the last stop before the Twins, 4 km from the perennial Rīfar al-Layl (12.5 m³/s): the best water on the crossing |
| ~~The Godsgate caravanserai~~ (Bab al-Hawa) | `gem_godsgate` (Gemini's) | 1028,1246 | 3,661 m, 4 °C, Dsc | - | **Dropped (the owner, 2026-11-16).** Gemini's pin, with no lore; the north road's first stop is Kolli |
| **Ṣalṭ al-Bān, the Catch salt works** | `svhmyhf33w` (held) | 1080,1428 | 458 m, 19 °C | ~100-150, seasonal | **the Train of Jabal's** (the owner). The map's richest unclaimed evaporites lie within 20 km: halite 239, gypsum 194, potash, soda, saltpeter. The Catch holds most of the planet's alkali (soda) |

The oases do not farm: the owner's 2026-10-23 ruling "no oasis waters fields" stands. They sell water, fodder (reed,
tamarisk) and shelter, and buy everything else from the caravans.

### 1b. The Twins

The range between the Catch and Xanadu, with its two volcanoes, has two routes (`biomes/twins/PLAN.md` section 3):
- **Route A, the Dark-Tube Road:** four drained lava tubes and three open sprints. It takes pack mules and yaks; the
  overnight camp is the Hall of the Tally-Marks.
- **Route B, the Steaming-Stone Dash:** a day each between five geothermal oases. It takes wagons and big herds that cannot
  pass the tubes' 3.5 m chokes.

| Place | 5.1 px | Ground | People (*proposed*) | What it is |
|---|---|---|---|---|
| Oasis 1, Sinter-Gate (*Bāb al-Bukhār*) | 996,1504 | 3,777 m, 10 °C | ~20 | Route B's south gate: the Brotherhood's south-west toll house; heated stone corrals |
| Oasis 2, Mud-Kettle Hollow | 1005,1489 | 4,327 m | ~10 | a maar crater with mud pots |
| Oasis 3, the Brazier (*Al-Miǧmarah*) | 1016,1479 | 4,680 m, 5 °C | ~30 | the mid-pass crossroads and **the Shrine of the Split Horn**, where the guide's second half falls due |
| Oasis 4, Brimstone-Tarn | 1031,1473 | 4,418 m | ~10 | a sulfur tarn: the Twins' sulfur runs to 255 |
| Oasis 5, Catch-Lookout Spring | 1056,1462 | 3,690 m, 11 °C | ~20 | where caravans wash the alkali from their eyes before the descent to Stair |
| **The Hall of the Tally-Marks** | 1014,1464 | 4,114 m | ~15 | Route A's overnight cistern in tube A3, and its mid-col pay point |
| **The Brotherhood's guild houses** | Strongbow 1001,1597; Stair 1106,1442 | | 300 / ~60 | the guides' two homes (the Stair house becomes real, inside Stair's 750) |
| **The White Gills Hermitage** | `sttkxo9ndy`, 1035,1535 | 3,438 m | ~15 monks | the Order's hermitage, which "doubles as a caravan stop", passing travellers' news to Longsong |
| *The Twins fort* (Gemini's "Twins Pass Wardenry") | `gem_twins_pass`, 1042,1525 | 4,449 m | - | **Dropped (the owner, 2026-11-16).** Gemini's pin, with no lore; the Brotherhood's oases hold the pass |

The Twins' oases are kept by the Brotherhood: these are its waystations, not towns.

### 1c. The distances (straight-line on 5.1; the routes run longer)

- **The north road:** the Godsgate to Kolli 249 km; Kolli to Arfwai 75; Arfwai to Stair 115.
- **South of Stair:** Stair to Bitta 44; Bitta to Lasso 39; Lasso to Oasis 5, 59.
- **Over the Twins:** by Route B, Oasis 5 to Oasis 1 is 152 km, then 184 km to Strongbow. Stair to Strongbow is about 410-450 km
  by either route.
- **To the homes:** Iziz to Stair about 1,232 km by Arcbeam, Parabola and the Godsgate; Yuni to Stair about 1,415 km by
  Mantis. Locus is 92 km from Yuni.
- **The pace:** at a pack caravan's 24-40 km a day, Stair to Strongbow is 10-16 days, and Iziz to Stair 31-50 days.

## 2. The northern caravaneers

The owner names five groups. Each becomes a **faction with its own caravans**, its factors at Stair and at its Xanadu
terminus, and its relations: the gateway pools stay where each group's home is.

| Group | Home | Lore so far | Its caravans (*proposed*) | Terminus in Xanadu |
|---|---|---|---|---|
| **The Geomancers** | Locus (1267,1043), and the Cloisters in Yuni | the oil guild, "mostly Yuni"; lizard riders patrol in sixes (`LORE.md:400-408`) | oil, power cells, electrics south; iron and tools back. On the sim already: `gate.geomancers`, 40 days, 4 carriers, to Qiblai | **Qiblai**, at their oil concession, which is beside Yuni's mission (X2) |
| **The Yuni Merchants' Guild** | Yuni (1263,1089) | **new**: the lore has only Yuni's "prominent families" who choose the Emir, the caravanserai and the Caravan Gate (`LORE.md:419-435`). **Independent of the Geomancers** (the owner, 2026-11-16): it trades on its own account, though the Geomancers run Yuni in practice. *Proposed:* chartered by the Emir | salt, iron, arms, wine, oil and electrics south; goldwork, saffron, brocade, opal and silk north. On the sim: `gate.yuni`, 48 days, 10 carriers, to Qiblai | **Qiblai** (the owner, 2026-11-16) |
| **Two rival Iziz merchant noble houses** | Iziz (963,985) | `core/camp/PLAN.md:426-449` has the Empire's five merchant houses; two fit. **Getmastarz**, the Gatemasters: the owner's "treks past the Godsgate, south to Xanadu". **Goldanda**, "gold hand": *proposed* as bankers on the eastern road. **The two rivals are Getmastarz and Goldanda** (the owner, 2026-11-16) | iron, arms, pearls, oil and salt south; cacao, opium, tea, silk, goldwork and wheels north. On the sim: `gate.iziz`, split between the two houses | **Strongbow**, up the lift (the Sultan's toll) |
| **The Train of Jabal** | Jabal (`sa5o6dvjdv`, 1225,1149) | **The Dasri's** (the owner, 2026-11-16). Jabal is the town the owner placed 2026-11-13 at the site `TRADE-SCOPE.md` gave the Dasri, "the Dasri's gateway to the Catch" (Gemini's "Jabal Shiekdom"). The Train is the Dasri's great salt caravan company, out of Jabal, and works both salt works: Ṣalṭ al-Bān in the Catch and Solta on the Bowl (the owner: "Solta too") | the Catch's salt, soda, potash and saltpeter, south to Xanadu and north to the Bowl and Jabal. On the sim it takes over `gate.dasri` (22 days, 6 carriers, salt only) | **Strongbow** |

**The rivalries.**
- **The two Iziz houses** compete for the same south-bound loads and for Stair's pens. In the sim they are wary of each other
  (as X2's merchant houses are). In the game, a feud is an event that can shut one house's caravans out for a season.
- **The Train of Jabal** sells salt to all comers at Stair and at Solta. With both works it holds the region's salt: Iziz's
  houses, who once had the Bowl's salt at Solta, resent a Dasri monopoly.
- **The Yuni Merchants' Guild and the Geomancers** both come from Yuni's side and both end at Qiblai, but the Guild is its
  own master (the owner): they compete for Qiblai's market and Stair's pens, and the Guild cannot lean on the Geomancers'
  oil concession.
- **The Brotherhood** guides everyone over the Twins, and is already a merchant house in the sim. It takes the Split Tally:
  4 % at the gate, 4 % at the mid-col shrine (the tally is already on the sim at Strongbow and Stair).

## 3. On the sim

**3a. The crossing as stops.**
- Each group's caravan becomes a **round of stops** through the crossing: its home pool, the Godsgate, Kolli, Arfwai,
  Stair, Bitta, Lasso, a Twins route, Strongbow, and on to its terminus.
- The round replaces its `gate.*` road. `SIM.trade` rounds already exist (X1's lake boats, X2's Great Caravan).
- Two things the current rounds lack:
  - **legs of their own length.** Today a round has one leg time, which would put Lasso to Oasis 5 at the same length as the
    Godsgate to Kolli.
  - **provisioning**: a caravan draws water and fodder for its beasts at each stop. The oases make those and sell them.
    This is what the oases live on.

**3b. The places as settlements.**
- Stair, the oases and the salt works, plus the Twins' stations and the Brotherhood's Stair house.
- Stair imports its food from the caravans and sells them water, fodder, repairs and salvage. The oases sell water and
  fodder.
- The salt works are a field of pans on `SIM.site` that refill slowly, worked by the Train in the cool months.

**3c. The Twins.**
- The **route a caravan takes** depends on its cargo and the season: Route A for packs, Route B for wagons and herds.
- The **Split Tally's two halves** are cut where they fall due: at the gate, and at the Brazier or the Hall of the
  Tally-Marks.
- **A caravan that refuses the guides** loses part of its pack train: by the plan, under a one-in-three chance of crossing
  whole. In the sim, an unguided crossing's loss is an event.

**3d. Hazards as events** (with Xanadu's X5 and the Lizardmen's raids):
- the Stalkers taking stragglers on the Catch floor (a caravan with explosives drives them off);
- the spring black storms of caustic dust close the Catch floor's crossing (the owner, 2026-11-16; about six weeks,
  *proposed*), and winter closes the Twins' col (the owner: Route B shut, Route A's tubes open, *proposed*);
- an oasis found dry: its water site run down;
- the cold and gales on the Twins' col;
- the guides' traps, for a caravan that stiffs them.

**3e. The joint run.**
- The crossing gets a tune of its own (`core/region/data/catch-tune.js`, `CATCH_TUNE`), joined to Xanadu's and Longsong's
  by `EAST_RIFT` (`core/region/data/east-rift.js`), as Longsong's was.
- The gateway pools stay off the map, at the groups' homes.

## 4. Steps

| Step | What | Test |
|---|---|---|
| **C0** | `CATCH_TUNE` data: Stair, the four oases, the salt works, the Twins' stations, the Brotherhood's Stair house, the White Gills; the five groups as factions; goods (water, fodder, the salts, soda, saltpeter, salvaged alloys and cells) | the places declared, fed and in balance on their own make and a stocked start |
| **C1** | **Legs of their own length** in a `SIM.trade` round (a change to `core/simulation`'s trade: a leg time per stop pair), with `test-sim.js`, the isle demo and every tune unchanged where it is not used | the Great Caravan and the lake rounds give the same books as before |
| **C2** | **Provisioning**: a carrier draws water and fodder for its beasts at each stop, by the beasts' number and the leg's days. A caravan that cannot water loses beasts | the oases' water and fodder are bought; a dry oasis costs a caravan |
| **C3** | Each group's caravan as a round through the crossing, replacing `gate.iziz`, `gate.dasri`, `gate.yuni` and `gate.geomancers`; the two Iziz houses splitting Iziz's trade; the Train working the salt works | salt, iron and arms reach Strongbow and Qiblai; Xanadu's exports reach the homes; Stair lives on the trade |
| **C4** | The Twins: route choice, the Split Tally's two halves, the unguided crossing's loss | the Brotherhood's take lands at both points |
| **C5** | Hazards as events: the Stalkers, the spring storms, the dry oasis, the col | a storm season holds the caravans at Stair and Kolli |
| **C6** | Joined into `EAST_RIFT` with Xanadu and Longsong | one ledger; the salt shortfall Xanadu has carried since X1 narrows |

## 5. Questions for the owner

1. **The Train of Jabal.** ~~Is it the Dasri's salt caravan company out of Jabal?~~ **Answered (the owner, 2026-11-16): yes,
   the Dasri's.** It is the Dasri's salt caravan company, out of Jabal, their town at the Catch's north-east (pin
   `sa5o6dvjdv`, 1225,1149).
   - **Answered: Solta too.** The Train works both of the region's salt works: the Catch's (Ṣalṭ al-Bān, 1080,1428) and
     the Bowl's (Solta, `s0zgu7u6yb`, 1169,1150, rock salt 234 and gypsum 253 by the Bowl's salt lake, 112 km from Jabal by
     road). This overrides `TRADE-SCOPE.md`'s gift of Solta to Mantis's Izani merchant houses. *Proposed:* those houses
     buy their salt from the Train at Solta, a grievance the Iziz houses carry into the Catch (section 2).
2. **The two Iziz noble houses.** **Answered (the owner, 2026-11-16): Getmastarz and Goldanda.** Getmastarz, the
   Gatemasters, are already the owner's "south to Xanadu" house; Goldanda, "gold hand", are the bankers of the eastern road.
3. **The Yuni Merchants' Guild.** **Answered (the owner, 2026-11-16): independent of the Geomancers.** It is not their arm:
   the Geomancers run Yuni in practice, but the Guild trades on its own account, a rival as much as a partner on the Catch
   road. *Still open:* its name in Yuni's tongue, and whether it is the prominent families' (who choose the Emir) or a
   body of its own.
4. **The oases' people.** Kolli ~80, Arfwai ~60, Bitta ~40, Lasso ~100. **Answered (the owner, 2026-11-16): as proposed.**
   Each caravan group keeps hands at its own well:
   - the Train of Jabal at Arfwai, by the salt pans;
   - the two Iziz houses at Kolli, the first water down from the Godsgate (one more ground for their rivalry);
   - Yuni's Merchants' Guild and the Geomancers at Lasso, the last water before the Twins;
   - Stair's merchants between them, and Bitta's brackish well kept by whoever holds Stair's pens.
   
   In the sim each oasis is a settlement of its keepers' faction; it sells water and fodder to all, and its own group's
   caravans first.
5. **Seasons.** **Answered (the owner, 2026-11-16): both close.**
   - The Catch floor closes in the spring black storms, about six weeks (*proposed*): caravans wait them out at Stair and
     Kolli.
   - The Twins' col closes in winter. *Proposed:* Route B's open dash shuts, and only Route A's tubes stay passable, for
     packs, not wagons.
   - The sim's calendar windows, and the caravans' timetables round them, follow from this (step C5).
6. **Gemini's two pins.** **Answered (the owner, 2026-11-16): drop both**, the Godsgate caravanserai (Bab al-Hawa,
   `gem_godsgate`) and the Twins fort (the Twins Pass Wardenry, `gem_twins_pass`). Their removal from the map goes through
   the scale-model session's queue.
7. **The records.** **Answered (the owner, 2026-11-16): yes; done the same day.** `LORE.md` (the Catch), `biomes/catch/PLAN.md`
   and its README, and `biomes/twins/PLAN.md` now carry Stair's 750, the peopled oases, the caravaneers, the seasons, the
   dropped northern tunnel, the kept Theodiga tunnel (station 2's portal is its Stair mouth), Strongbow's 5.1 point and the Twins' measured distances.
   The question was: bring `LORE.md` and the Catch and Twins plans in line with Stair's 750, the peopled oases and 5.1's
   distances, once you agree?
