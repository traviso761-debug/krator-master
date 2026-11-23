# Gihon: the garrison town at the Opal River's mouth (site plan, 2026-11-22)

The owner's brief of 2026-11-17 (below) designates Ōpal-Māuṭh, a fishing village of 1,200 on the Lower Xanadu Lake's south
shore, as **Gihon**: a town of 8,500, the Lower Lake's garrison town and the Golden Tears' home, with a walled forbidden city
inside it. This file is the site plan (G0) and the record of the steps G1-G3. Everything not from the owner, the lore or the
tune is *proposed*.

## The owner's words (2026-11-17)

> i want to designate opal-mouth as a proper town, Gihon, 8.5k, home of the Golden Tears and the main garrison-town on the
> lower lake. it will use the irregular-square city builder Kirstabal did but will be much larger and have a second, walled
> 'forbidden city' inside it: the garrison fortress, which doubles as the headquarters of the Sultan's Mint and tax
> assessors. Both gold and opals, along with the rich produce of the land, flow through it, and its temple is spectacularly
> decorated with both. the White and Violet orders have monasteries here.
>
> the Landing, at the mouth of the Alph, will also be a little bigger, a village of 2.5k, built along monumental stone piers
> on either side of the river mouth.
>
> there probably ought to be at least a few hamlets or something along the river going towards theodiga

Answers to the two clashes with what was already decided:
- **The Golden Tears:** "Move HQ, keep a court". The head house moves from Strongwall to Gihon's fortress; Strongwall keeps the
  Tears' court as their forward post for the Lizard-country expeditions.
- **The Mint:** "Assay at Strongwall, mint at Gihon". Strongwall assays and smelts the ore to bullion; the bullion and the
  opals go down to Gihon, where the Mint strikes the qud and the assessors value the tax.

And from the session that started this build (2026-11-22, relaying the owner): **the currency is the qud**.

## What it replaces and touches

| Thing | Before | Now |
|---|---|---|
| Ōpal-Māuṭh | `ll.opal-mouth`, 955,1607, 1,200, a fishing village of the Lower Lake (`XAN_TUNE.lowerLake`, `round.lower-south`; `KS_RING.lake`; the region's `opal-mouth`, laid at 500) | **Gihon** (`xan.gihon`), 8,500, a town of the Scarp (P5): the town, its forbidden city and its houses (section 2). Kirstabal stays the lake's hub and the Scarp's seat |
| The Golden Tears | head house `tears.strongwall` inside Strongwall (912,1640), 80 | head house `tears.gihon` in Gihon's forbidden city; `tears.strongwall` becomes **the Tears' court**, their forward post (40); the camp's ore still sold to Strongwall's assay |
| The Mint | `cit.mint` in the capital's citadel; `road.sw-er` takes Strongwall's gold to the capital; the Fifth in gold from Strongwall straight to the citadel | **the Mint at Gihon** (`gh.mint`, in the forbidden city): Strongwall's bullion down to Gihon (`road.sw-gh`); the assessors take the Fifth there; the Mint strikes it into qud; the coin to the Treasury in the capital's citadel; the rest of the gold on to the goldsmiths of Qiblai and Erehwon |
| Opal | Lāiṭwāl's and the mines' opal to Kirstabal (`road.lw-ks`, 150 km); the Fifth in opals straight to the citadel from the bench and the mines | down the Opal River's gorge to Gihon (`road.lw-gh`, 185 km); the assessors take the Fifth at Gihon; the rest on to Qiblai |
| The Landing | `ll.landing`, 932,1600, 600 | 2,500, on monumental stone piers either side of the river (section 6); laid in full on core/city |
| The Alph | nothing on it between the Lower Lake and Theodiga | five hamlets on core/hamlet (section 7) |
| The orders | the White Monastery's house at Kirstabal; the Violet Storm's head house, the Tempest (886,1619) | a White and a Violet daughter house in Gihon |

## 1. The site

**Gihon stands on the Lower Xanadu Lake's south shore, on the west bank of the Opal River's mouth** (Sitār Ḍrāi, `r682`,
115 m³/s, entering the lake at **955,1606**). The tune's place (955,1607) is a lake cell on the model; the town's square is
centred about 1.5 km south-west of it, on the shore apron west of the river.

| | |
|---|---|
| Ground | the model at 2 km a pixel (heights above the lake's -1,685 m): the shore at +20-30 m; behind it a gentle rise, **+33 to +94 m at y 1608** (x 946-954), **+100 to +150 m at y 1609**, +160-230 m at y 1610-1611: about **30 m a km** west of the river, steeper east of it (+109 to +182 m at y 1608, x 957-960). The river's bed is the model's low line at x 955-957 |
| The lake | the Lower Xanadu Lake, water at **-1,685 m** (Kirstabal's PLAN.md section 1); the shore here faces north up the lake's width (about 40 km to the north shore at Kāko-Bāgh) |
| The river | **the Opal River** (Sitār Ḍrāi), down its gorge from Opal Valley's mouth (972,1636, the Sultan's toll-quay, `biomes/opalvalley` station 5) by 964,1629, 958,1621 and 960,1613 to the lake. The town's river front faces it; its road comes down beside it |
| Climate | **30-31 °C** mean, **1,020-1,100 mm**, `Af` (the model's 952,1608 to 956,1611); about 1.98 atm, as at Kirstabal |
| Neighbours | **Rāis-Ṭeras** (the rice terraces, 967,1606) 24 km east along the shore; **Ṭimbar** (938,1606) 34 km west; **Kirstabal** 69 km east by the lake; **the Landing** 48 km west by the lake; **Strongwall** (912,1640) 108 km south-west straight, about **130 km by the road** under the Rift's inner wall; **Lāiṭwāl** (1028,1653) about **185 km** up the gorge and Opal Valley |

The model's south shore rises to the Rift's inner wall (+300 to +750 m at y 1613-1615, then the wall at 2-3 km). The flats
at exactly -1,530 m (+155 m) on the Alph's last 15 km (933-941, 1579-1592), and the pit at 942,1592 (-340 m below the lake),
look like carve floors, not ground, as the flats Kirstabal reported south of the lake do: **for the scale-model session** (a
note in its queue, not edited here).

## 2. Who lives there: 8,500

**8,500** (the owner). Gihon is **the Lower Lake's garrison town**, **the Sultan's Mint**, **the assessors' seat** (the Fifth
in gold and opals), **the Golden Tears' home** and the market where the gorge's and the south shore's produce meet the lake.
*Proposed*, by record in the tune (G1):

| Record | Who | People |
|---|---|---|
| `xan.gihon` (the town) | the harbour and river people (bargemen, fishers, the boatyard), the warehouses and the bazaar, the crafts (goldsmiths' and lapidaries' row, smiths, potters, rope makers), the caravan trade from the gorge and the Strongwall road, the temple's priests, households, servants, the poor | **7,060** |
| `xan.gihon.fort` (the forbidden city) | **the garrison** of the Lower Lake (about 600: the Sultan's regulars and **60 hired musketeers**, paid as Strongwall's are), **the Mint** (the Master of the Mint's moneyers, the die cutters, the weighers: about 60), **the assessors** (the Fifth's valuers and clerks: about 60), **the treasury's** keepers and guard, the commandant's household, servants | **1,000** |
| `tears.gihon` | **the Golden Tears' head house** inside the forbidden city: the house's masters, its counting rooms, its armoury for the expeditions | **160** |
| `qb.white.gihon` | **the White Monastery's daughter house** (Qiblai's white) | **140** |
| `xan.gihon.violet` | **the Violet Storm's daughter house** (the Tempest's: monks of sword and bow) | **140** |
| | | **8,500** |

The fort eats the `fort` diet (its powder and arms with it). The town is a `town`; the houses eat as houses do.

## 3. The layout (*proposed*)

Gihon is built as Kirstabal is, on **core/city's irregular square** (`KCITY.grid`, the walled square after Chiang Mai), but
about **1.6 times its side and 2.7 times its area**, and with a **second walled square inside it**: the forbidden city, after
Beijing's, with its own wall, moat and gates.

**The outer square.** The inner street **1,060 m a side**, centred about 900 m behind the shore; the wall 16 m outside it with
a bastion at each corner and a buttress about every 90 m; **eight cells a side**; Chiang Mai's moat (16 m wide, its middle
15 m outside the wall) fed from the Opal River; four gates where the two avenues cross the wall: **the Lake Gate** on the
harbour (north), **the Gorge Gate** (south, the Opal River road up to Lāiṭwāl), **the River Gate** (east, onto the river front
and its bridge), **the Strongwall Gate** (west, the bullion road). The wall is the kit's slate wall (Kirstabal's), the same
stand-in stone.

**The forbidden city (the garrison fortress).** A second `KCITY.grid` square, about **300 m a side**, filling 2 x 2 cells of
the outer grid in its **south-east quarter, on the rise above the river** where the gorge road and the Strongwall road come in
(*proposed*; question 2). Its wall is the **Xanadui fort asset**'s (`kits/xanadu/src/80f-xa-fort-data.js`, `80g-xa-fort.js`:
taller curtains, flanking towers, a gate works at each of its two gates), and its own moat. Inside, on an axis from its north
gate (onto the town's east-west avenue) to its south gate (onto the river road):
- the **Hall of the Mint** (the striking floor, the furnaces, the die room), its yard walled;
- the **assessors' hall** (the Fifth's valuers: the gold weighed, the opals graded), facing the Mint across the yard;
- the **treasury** (strong rooms, the coin and the opal Fifth kept until the convoy to the capital);
- the **Golden Tears' head house** (their counting rooms, their armoury and the expedition yard);
- the **barracks** and the parade ground, the **commandant's house**, the **magazine** (the powder, apart), the granary.

**The temple of the Decree**, at the avenues' crossing beside the bazaar, as Kirstabal's: Gihon's is **dressed spectacularly in
gold and opal**: gilt crowns and finials, a gilt roof, the walls set with opal inlay that flashes in the low sun (section 8,
textures). Its garden of the Decree faces it.

**The quarters** (inside the outer wall):
- **the harbour quarter** on the lakefront, either side of the Lake Gate: the rich courtyard houses where the breeze is;
- **the river quarter** along the east wall: the river front's warehouses, the opal and gold dealers, the goldsmiths' and
  lapidaries' row;
- **the bazaar and the temple** at the centre, the Two Horns' factor house (*proposed*, not in the tune) left for later;
- **the middle quarters** filling the grid;
- **the poor quarters** at the south-west, toward the Strongwall Gate and the works;
- **the White Monastery's house** (a cell on the west, its white compound) and **the Violet Storm's house** (a cell by the
  forbidden city, a walled court for drill), both drawn with the Xanadu kit's monastery in their orders' dress (the White's
  is 88f's white dress, as at Kirstabal; the violet a dress of the same kind);
- **garden squares**, about a tenth of the zone, as Kirstabal's (the Governor's garden becomes the Commandant's, beside the
  forbidden city's north gate).

**Outside the walls:**
- **the harbour** on the lake (the quays, the mole against the swell up the lake, the lighthouse, the boat sheds, the barge
  quays for the run to the Landing and to Kirstabal) and the fish landing;
- **the river front** along the Opal River's west bank below the River Gate: the river quays where the gorge's boats and rafts
  land, the customs house (`kits/xanadu/extra/88g`'s), warehouses, and **the bridge** over the river to the east bank;
- **the quarters outside the walls** along the Strongwall road and the gorge road, with empty lots (kits/construction), as
  Kirstabal's;
- **the works** downwind to the west (the fish racks, a tannery's place).

The streets: core/city's steps 6-11 in the blocks (civic pieces by `near`, lots, side streets), as Kirstabal's.

## 4. The economy (G1, for `XAN_TUNE`)

**Gihon** (`xan.gihon`, 7,060, `town`), in the Scarp (P5), parent Kirstabal (the seat):
- its works: the dugouts (`gh.fishing`, the old village's fishing ground), the harbour and the river quays (`gh.quays`, a
  store), the serai by the Strongwall road (`gh.serai`, a store);
- **its grain**: the town's own ring on the floor south and west of it (question 3: *proposed* four farming villages and a
  ranch, `T.ghRing`, tithing to Gihon) and the Scarp's tithe through Kirstabal; what they cannot feed comes from Qiblai by
  the barges through the Landing (the seats' pass-on rule, `passTo`);
- **its roads**:

| Road | Where | Down | Up |
|---|---|---|---|
| `road.sw-gh` (new) | Strongwall to Gihon, **130 km**, the bullion road | **all the assay's gold** (the bullion), the copper's share for the lake | grain, salt, tea, tools, arms, powder for the fort and its camps |
| `road.lw-gh` (was `road.lw-ks`) | Lāiṭwāl to Gihon, **185 km**, down Opal Valley and the gorge | **the opal** (the town's and the mines') and moonglass | grain, salt, tea, tools |
| `road.gh-qb` (new) | Gihon to Qiblai: the barges to the Landing (**48 km**), then the portage road (22 km) | **the gold** (four fifths) and **the opal** (four fifths) on to the goldsmiths and Yuni's caravans | grain, salt, tools, arms, powder |
| `road.gh-ks` (new) | Gihon to Kirstabal by the lake, **70 km**, barge | fish, opal and moonglass for the Strongbow gate | the Scarp's tithe's grain, salt, tea, tools |
| `treasury.gihon` (new) | the forbidden city to the capital's citadel (the Treasury), by the Landing, the portage and Qiblai's road: **48 + 22 + 321 km** | **the coin** (the qud the Mint struck from the Fifth) and **the opal Fifth** | nothing |

- **The Fifth** (`T.fifth`, a fifth): the assessors take it at Gihon as a cut on what lands there: of the bullion on
  `road.sw-gh` and of the opal on `road.lw-gh`, to the forbidden city. The old Fifth roads (`fifth`, `fifth.opal`,
  `fifth.opal.lw`) are retired; the mines' opal crosses to Lāiṭwāl whole.
- **The Mint** (`gh.mint`, `T.chain.mint`: a kg of gold to 250 qud) in the forbidden city strikes the gold Fifth into coin;
  the coin and the opal Fifth go to the Treasury (`treasury.gihon`). The capital's citadel keeps the Treasury and a court mint
  (`cit.mint`, question 4: the court's own coin from the gold the capital's market sends it). `T.goods.coin` counts in **qud**.
- **The garrison**: `T.muskets.men['xan.gihon.fort'] = 60`, paid by the Treasury as the forts' are. The fort is fed by the
  town (its feeder), its arms and powder up `road.gh-qb`.
- **The Golden Tears**: `T.tears.houses[0]` is `tears.gihon` (the head house, 160, in the forbidden city); `tears.strongwall`
  stays (40) as **the court**, the camp's home: the camp's road (`tears.rift`) still lands at the court and its ore is still
  sold to Strongwall's assay (the owner's "keep a court"). The head house buys its stores in Gihon.
- **The orders**: the White's and the Violet's daughter houses as houses (`house('xanadu')`), fed from Gihon's market.
- **The lake**: Gihon replaces Ōpal-Māuṭh on the south round (`round.lower-south`: Kaṭal, Rāis-Ṭeras, **Gihon**, Ṭimbar);
  `T.lowerLake` keeps eight villages; **the Landing** grows to **2,500**; the hub stays Kirstabal.
- **Kirstabal**: no longer the opal's road (its opal and moonglass now come from Gihon by the lake, for the Strongbow gate).
- **The census**: P5's countryside gives up the Landing's 1,900 more and the Alph's hamlets; Gihon's 8,500 are town people
  (the Sultanate grows by about 7,300).

`core/region/tests/test-xan-economy.js` moves on purpose: check 4 (coin at the Mint) reads Gihon's Mint; check 29 (the Tears
inside the fort) reads the court at Strongwall and the head house at Gihon; check 30 (Lāiṭwāl's Fifth) reads the cut at
Gihon; check 26's counts (eight villages); and **check 33, new**: Gihon fed, the bullion landed from Strongwall, the Fifth cut
at Gihon (a fifth of the gold and of the opal), the qud struck and sent to the Treasury, the garrison paid, the Tears' head
house at Gihon and their court at Strongwall, the Landing at 2,500, the Alph's hamlets tithing.

## 5. Core adoption (before the first fragment)

Following `README.md`, "CORE MODULES ARE NOT OPTIONAL":

| Need | Take |
|---|---|
| The town's streets, lots and infill | **`core/city`** (`KCITY`): the outer square on `KCITY.grid` (`core/city/37-city-grid.js`), core/city's steps 6-11 in the blocks, the garden squares as greens, the quarters outside the walls as a second instance (Kirstabal's pattern) |
| The forbidden city | **`core/city`**'s `KCITY.grid` for its square (its cells HARD in the outer instance) and the **Xanadui fort asset** (`kits/xanadu/src/80f-xa-fort-data.js` `XFORT.plan`, `80g-xa-fort.js`) for its wall, towers and gates |
| The buildings | **`kits/xanadu`** (the normal kit, as Kirstabal), its opt-in pieces read in place: `87k` (the lake trades), `87k2` (the slate wall), `extra/88d` (the lake craft), `extra/88f` (the harbour, the garden walls, the white dress, the wind-catchers), `extra/88g` (the customs house, the wayside shrines); the empty lots by **`kits/construction`** |
| The page | **a target on Xanadu's page**, as Kirstabal is: `settlements/gihon/build.py` writes `gen/69g-kcity-bundle.js` (core/space, core/city, core/hamlet sealed in one closure) and runs `settlements/xanadu/build.py --kit settlements/gihon`. Listed under every check in `tools/checks_optin.json` |
| The ground | the scale model round the lake, read in place from Kirstabal's bake (`settlements/kirstabal/src/39k-ks-model.js`, px 925..1009 x 1580..1619: Gihon and the Landing are inside it); the town's own designed ground (shore, apron, the river's bed) in `src/40-gh-ground.js` |
| The lake, the river, the moat | **`core/water`** (open for the lake; flow for the Opal River and the moat), **`core/drawn`** for the ground meshes |
| Sky, heat, haze | **`core/atmos`** (the standard skybox) |
| The villages and hamlets | **`core/hamlet`** (`KHAMLET.village`) on the Xanadu row passed by name (`core/hamlet/xanadu/23-hamlet-xanadu-row.js`, `KHAMLET.xanaduRow`) |
| Flora | the Rift kit (`biomes/rift`) on today's **`core/biome`**, sealed as Kirstabal's (`gen/69g2-gh-flora-bundle.js`) |
| Placement | **`core/rand`** (`KRAND`), **`core/tags`** (everything registered before it is drawn), **`core/space`** (through core/city) |
| The economy | **`core/region`**'s valley host with the tune (`core/region/data/xan-tune.js`), **`core/simulation`** |
| Viewer and tools | **`core/host`** through Xanadu's page (inspector, polygon tool, probe), the shared verify harness (`tools/harness.py`) |
| Not taken | **`core/ruins`**: nothing in Gihon is ruined. **`core/coast`**: the shore near the town is designed ground, as at Kirstabal; the open world takes core/coast. **`core/engine`**: the Xanadu kit draws through its own engine |

## 6. The Landing: 2,500 on the piers (G3)

**Where** (question 1): the Landing stays at the lake's outlet (932,1600, *proposed*), where the barges stop before the
cataracts and the portage road starts for Qiblai: the river that leaves the lake there is the one Gemini's map names with the
Alph (`rivers.json` lists Qiblai and Theodiga on the Alph: the Alph comes down from Theodiga into the lake at 942,1593 and leaves
it by the cataracts past Qiblai), so the Landing's piers stand **either side of the outlet**, the river's first 300 m.

**The piers**: two monumental stone piers, one on each bank, running out about 220 m into the lake along the outlet's mouth, each
a wide stone deck on arches with bollards and cranes, the barge berths on their inner (river) faces and the lake boats on their
outer faces; the Landing's houses on the land behind each pier and along the river's first stretch. A ferry joins the banks.

**On core/city** (over core/hamlet's 500: BUILD-OUT question 1): one `KCITY.create` instance a bank, their lots along a quay
street behind each pier, the transfer sheds and the ox-cart yards at the portage road's head (south bank). As records the region
can draw (`openworld/xanadu-oidong-highrift`'s site), plain and free of three.js: `src/43-gh-landing.js`, `GH_LANDING.make`.

## 7. The Alph's hamlets (G3)

The Alph comes down **138 km** from Ālph-Hēḍ by **Theodiga** (908,1535, -556 m) through a long valley and gorge (-832 m at
916,1544, -1,055 m at 915,1555, -1,243 m at 918,1566, -1,479 m at 931,1574) into the lake at 942,1593. (The brief's "about
28 km" between the Landing and Theodiga is 139 km straight on the model: 69 px at 2 km.) *Proposed:* **five hamlets** on the
valley's track at 20-30 km spacing, on core/hamlet's Xanadu row by name, the lower three in the Scarp tithing to the Landing,
the upper two in the Vale (P2) tithing to Theodiga (the beginning of Theodiga's ring):

| Id | Name (gloss) | Focus | People | Where (*proposed*, snapped to dry gentle ground by core/hamlet) |
|---|---|---|---|---|
| `alph.weyar` | Wēyar (the weir) | farming (rice behind the weir) | 240 | near the Alph's mouth, 936,1586 |
| `alph.medo` | Mēḍō (the meadow) | ranch | 145 | the lower valley, 929,1573 |
| `alph.gorj` | Gōrj-Phuṭ (the gorge's foot) | orchard | 240 | 918,1564 (Cfa, 1,500 mm) |
| `alph.hil-ti` | Hil-Ṭī (the hill tea) | tea | 240 | 916,1552, in the Vale |
| `alph.pheri` | Phērī (the ferry) | farming | 240 | 912,1541, below Theodiga, in the Vale |

## 8. Textures

The temple's gold-and-opal dress wants two sets the library lacks (`core/materials/PROMPTS-NEEDED.md`, section 58): a **gilt
roof and finial** metal (beaten gold leaf over copper, worn) and an **opal inlay** wall (precious opal set in dark stone, its play
of colour). Until they are delivered the temple draws the kit's gold and a tinted stone, and says so (`KNOWN_ISSUES.md`).

## 9. Steps

| Step | What | Test |
|---|---|---|
| **G0** | This plan; the owner's questions (section 10) | |
| **G1** | The tune (section 4); Kirstabal's ring (`KS_RING.lake`) and its test in step; the region's site (`opal-mouth` to Gihon) | `test-xan-economy.js` (moved on purpose), `test-east-rift.js`, `test-catch.js`, Kirstabal's tests |
| **G2** | The town on core/city with the forbidden city on the fort asset, a target on Xanadu's page | `test-gh-town.js`; `tools/check_core_use.py`; `KRATOR_GL=gpu verify.py --assert` |
| **G3** | The Landing on its piers and the Alph's hamlets, as records for the region | their node tests |

## 10. Questions for the owner

**The owner's answers (2026-11-22):** "Keep at the outlet", "River corner", "A ring of its own", "Keeps a court mint".

1. ~~**The Landing's place.**~~ **Answered: at the lake's outlet** (932,1600), the piers either side of the outlet (section 6).
2. ~~**The forbidden city's place.**~~ **Answered: the river corner**, the south-east quarter on the rise above the Opal River
   where the gorge road and the Strongwall road come in (section 3).
3. ~~**Gihon's grain.**~~ **Answered: a ring of its own**: four farming villages and a ranch on the floor round the town
   (`T.ghRing`), plus the Scarp's tithe; Qiblai makes up the rest by the barges.
4. ~~**The capital's citadel after the Mint moves.**~~ **Answered: it keeps a court mint.** The citadel keeps the Treasury and a
   small mint for the court's own coin (`cit.mint`, renamed the court mint), striking the gold the capital's market sends it;
   the Sultan's Mint at Gihon strikes the Fifth, and its qud goes to the Treasury.
