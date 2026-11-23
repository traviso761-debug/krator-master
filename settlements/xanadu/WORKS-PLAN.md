# Xanadu's works, mines and camps: Kōlḍ-Lōḍ, Opal Valley Mines, the Golden Tears' camp, the Great Caravan's halts (plan, 2026-11-22)

The Sultanate's work places no session owns yet, on the Xanadu kit's opt-in works (`kits/xanadu/extra/88g-xa-works.js`, the
build-out's wave 0.1), core/hamlet's Xanadu row in its camp form (`KHAMLET.xanaduRow({camp: true})`) and core/camp. The
order across Xanadu is `settlements/xanadu/BUILD-PLAN.md`. Plans only. Everything not from the owner, the lore or the tune is
*proposed*.

Owned elsewhere, listed only:
- **the Geomancers' oil field and Yuni's mission** (`geo.oilfield`, `yuni.mission`, 925,1598): built on Qiblai's page
  (`settlements/qiblai/targets/city/89zr-qc-oil-site.js`, `90v-qc-oilfield.js`); on the open world with Qiblai's
  Qāṭarāq region after the stack;
- **the Rare Devisers' camp at Godshearth** (`exp.godshearth`, 839,1398): `settlements/devisers-camp/PLAN.md`, a site of
  `xanadu-oidong-highrift` (`sdevcamp0001`);
- **the Dalab mission's party at the Grove** (`exp.dalab`, 836,1388, 40): the same plan, section 3 (its question 6, a
  settlement of its own or a tent ring on the Grove's station page, is open there);
- **the Thalaba road's hans, the Qol ford and the Qol head**: `openworld/xanadu-north-shore` (built);
- **Strongbow's foot** (`sstrongbowft`, where the Catch caravans land): `xanadu-oidong-highrift` (built) and Strongbow's
  own session.

## 0. The owner's answers this plan rests on

- 2026-11-22: **the gold mines are named Kōlḍ-Lōḍ** (the Cold Lode); **Opal Valley Mines keeps its name**.
- 2026-11-22: **the six province regions wait for the vertical stack**. Kōlḍ-Lōḍ (Gōlḍ-Mārch) and Opal Valley Mines
  (Ōpal-Bhālī) are planned and their records and sheet built now; they go on the ground when their regions are cut.
- 2026-11-16 (Lāiṭwāl's L1): the opal mines are Lāiṭwāl's works village across the lake, the opal ferried to it.
- 2026-11-11 (TODO.md, "a work camp"): a mining camp is "mostly miners".

## 1. Kōlḍ-Lōḍ, the Cold Lode (`smgxtultfq`)

| | |
|---|---|
| Record | `XAN_TUNE` `mine('smgxtultfq', ..., 911, 1665, 950, 'sxan7r1sln', 'goldore', T.mine.goldore)`: 950 people, a work camp (diet `camp`), its works `smgxtultfq.works` (kind `adit`, crew 760), 6,400 kg of ore a year (about 210 kg of gold), on a lode field of `T.fieldYears` (210) years; its ore to Strongwall by `mine.gold` (50 km, 2 carriers), the Fifth taken at Strongwall's assay; its grain, salt, tea and tools up `road.sw-gold` |
| Pin | `smgxtultfq`, "Xanadu gold mines (to be named)", type `village`, 911,1665: **renamed "Kōlḍ-Lōḍ"** in the queue's next records-only batch (the owner, 2026-11-22). The tune's name follows in the same commit as the page (*proposed*: `'Kōlḍ-Lōḍ (the Cold Lode: the gold mines on the lode)'`), `test-xan-economy.js` passing unchanged |
| Ground | the model's cell 4,812 m, 3 % slope, relief 511 m within 7 km, the highest ground at 5,133 m; tundra, about -6 °C mean (BUILD-OUT 1e); no water within 12 km on the model (the camp melts snow and draws from a tarn: the region's streams at 1:1 decide). Strongwall's plan: blocked from the fort by the scarp, 1,400 m short of line of sight |
| Province | P4, Gōlḍ-Mārch (seat Strongwall) |

**The camp** (*proposed*). 950 is over core/hamlet's 500 (`KHAMLET.POP_MAX`), and a work camp is "mostly miners", so it
is laid as **two camps on the one record**:
- **the adit camp** (500) on the lode: the adits along the vein's outcrop (`xa_mine_head` at each, the winding frame and
  the ore shed), the miners' bunkhouses and cookhouse in the lee of the ridge, the tally house where the ore is weighed for
  the Fifth's first count, the miners' shrine;
- **the mill camp** (450), 2-3 km down the valley where water can be had: the stamp mill and the ore yard (a watermill and
  workshops stand in: the kit has no stamp mill), the smithy for the picks and drills, the stores, the muleteers' corral
  for the ore train to Strongwall, the overseer's house and a small watch (`xa_fort_post`) of the Golden Tears, who escort the
  ore and the Fifth (`T.tears`).

Both on `KHAMLET.xanaduRow({camp: true, mineHead: true, shrine: true})` (`focus: 'mine'`), each `popMax` its share; the
census splits the record's 950 across the two by `spec.share` (*proposed*: core/hamlet's camp census is TODO.md's
"`camp` option": the row carries `row.camp` already and the census ignores it today, so this step adds the census side).

**Kit pieces.** `xa_mine_head`, `xa_placer_sluice` (the stream below the mill camp washes the tailings), `xa_smithy`,
`xa_workshop`, `xa_watermill`, `xa_corral`, `xa_granary`, `xa_fort_post`, `xa_wayside_shrine`, the row's bunkhouses.
**Missing, named**: a **stamp mill** (`xa_stamp_mill`: the batteries of stamps on a water wheel, the ore bins above, the
tables below; *proposed* for `kits/xanadu/extra/`), and **tailings heaps** (KRUBBLE heaps in a crushed-ore dress, not a
piece). The resources kit's gold node (`kits/resources`, `44s-res-nodes-metal.js`) marks the lode on the region's
resource layer; the camp reads the field's veins from the tune (`T.field('lode', ...)`), never a second copy.

**The road.** `road.sw-gold`, 50 km to Strongwall: a mule track down the scarp's flank (the tune's 50 km is the road's
length). The region's `ROADS` lays it when the Gōlḍ-Mārch region is cut; Strongwall's W0 watch posts (G1-G3) stand on its
lower half.

## 2. Opal Valley Mines (`sjuarjbku0`)

| | |
|---|---|
| Record | `mine('sjuarjbku0', 'Opal Valley Mines (the Sultan\'s factor)', 1038, 1662, 850, 'slaitwal0001', 'opal', T.mine.opal)`: 850, a work camp, crew 680, 180 kg of opal a year, its opal ferried to Lāiṭwāl (`mine.opal`, 27 km, the Fifth to the citadel by `fifth.opal`), its grain and salt from Lāiṭwāl |
| Pin | `sjuarjbku0`, "Opal Valley Mines", type `village`, 1038,1662: the name stays (the owner, 2026-11-22) |
| Ground | the model's cell 1,340 m, flat (0.3 %), relief 303 m within 7 km; the Sitār Ḍrāi (`r682`, perennial, 115 m³/s) 6 km off; the middle terrace's great lake (level 1,315 m) north-west, the ferry's water: Lāiṭwāl (1028,1653) faces it 27 km across |
| Province | P6, Ōpal-Bhālī (seat Lāiṭwāl) |

**The camp** (*proposed*): over 500 again, so two camps on the record:
- **the diggings** (500) on the potch line's southern outcrop: open cuts and short adits (`xa_mine_head` small), the
  sorting sheds where the potch is broken for colour, the bunkhouses, the miners' shrine. **Where Glaziers work the potch**
  (Lāiṭwāl's plan: half Glaziers in the wall), a share of the diggers' houses are the Glaziers' set (`gz-*`, `kits/tungang`
  1.4), as Lāiṭwāl mixes them (*proposed*: a fifth);
- **the factor's landing** (350) on the lake shore: the Sultan's factor's strong house (`xa_warehouse` with `xa_watch`),
  the assay room where the Fifth is counted, the ferry quay (`xa_quay`, `xa_launch` and a ferry barge `xa_lake_barge`),
  the stores, the boatmen's houses.

**Kit pieces.** `xa_mine_head`, `xa_workshop`, `xa_warehouse`, `xa_watch`, `xa_quay`, `xa_launch`, `xa_lake_barge`,
`xa_wayside_shrine`; the Glaziers' houses. **Missing**: a **sorting shed** (`xa_sorting_shed`, long and open-sided, the
benches under it: *proposed*, or `xa_workshop` stands in).

**Textures.** Opal Valley's section 55 (owed: `core/materials/PROMPTS-NEEDED.md`); `rock.opal.matrix`,
`ground.sinter.opaline`, `rock.limestone.opal` from the library; the tailings `ground.tailings.ore` (section 59, new).

## 3. The Golden Tears' prospecting camp in Lizard country (`exp.rift-gold`, now)

| | |
|---|---|
| Record | `T.tears.camp`: `exp.rift-gold`, "The Golden Tears' armed prospecting camp in Lizard country (the Rift floor; approximate)", px 850,1628, 110 km from their house, 120 people, 70 kg of gold a year in its ore (30 kg of ore a kg) on a 30-year field; worked in the cool months (`T.calendar` `rift-season`, year days 300-60) |
| Ground | the model's cell -1,210 m on the Rift floor, 6 % slope, relief 1,391 m within 7 km; the Tyan Gill (`r773`, a wadi, 7.6 m³/s) 2 km off, its mouth 13 km on |
| Region | outside the Sultanate's provinces, on the Rift floor inside `xanadu-oidong-highrift`'s High Rift polygon: **it can be a site now**, as the Devisers' camp is (`model: false` row in `openworld/SITES.json`, *proposed* id `stearscamp01`, reach 6 km) |

**The camp** on `core/camp` (`KCAMP`): a pitched camp struck at the season's end, not a village.
- **Formation.** *Proposed* a fortified ring: the Tears are "a bit more militaristic" (the owner, 2026-11-16). The tents
  (`kits/tents`, the Xanadu silk dress, `KCAMP.tentFor(role, {culture: 'xanadu'})`: the bell tents for the sleeping and
  workshop roles) in a ring inside a thorn zariba and a ditch, one gate on the track up to the Gold March; the captain's
  marquee, the gold room (a guarded tent), the cook fire, the mule lines.
- **The works**: placer sluices (`xa_placer_sluice`) on the Tyan Gill's bed in the season the wadi runs, the short
  prospect pits on the lodes, the tailings heaps (KRUBBLE).
- **The Lizardmen**: the camp stands in Tuatara's and Sauropolis's country (`kits/lizardmen`; the Lizardmen sim on the
  integration line). *Proposed*: the Lizardmen's villages and the camp are 25 km and more apart; any contact belongs to the
  Lizardmen sim's raids (`core/camp`'s ventures), not to this plan.
- **Season.** Drawn pitched in the rift season, struck (a cleared ground, the zariba's ring and the pits left) the rest of
  the year: `KCAMP`'s strike, from the world clock.

**Pins.** None on the model (approximate, seasonal): the SITES.json row only.

## 4. The Great Caravan's winter halts (`gate.dalab`, the Annual Great Caravan)

The owner, 2026-11-16: the Great Caravan "will ... return in the fall, spending the winter in Xanadu visiting Erewhon,
Theodiga, and Qiblai" (`T.gateways` `gate.dalab`, `round: true`, one carrier, 900 t). Each visit is a halt: `KCAMP.halt(o)`
(`core/camp/50-camp-tents.js`), *proposed* the `laager` form (the wagons and beasts in a square round the caravan master's
pavilion, the gate on the road), the Dalab dress for the caravan's own tents and the Golden Tears' escort's ring beside
it (`T.tears.escort`).

| Halt | Where (*proposed*) | When (year day, the tune's round) | Region | Now? |
|---|---|---|---|---|
| Erehwon | outside the land gate on the Vale road, by the caravanserais | ~311, the winter's start; again ~107 in spring to load | `xanadu-lake-shore` (Erehwon's square) | **yes**: a camp of the Erehwon site's spec |
| Theodiga | on the Ālph's flat below the town | ~3 | Bhēl (after the stack) | with Theodiga's ring |
| Qiblai | outside the south gate, beside the Geomancers' caravans' fuel station | ~55 | Qāṭarāq (after the stack) | with Qiblai's region |

The halt is drawn when the clock's day falls in its window (the caravan's legs are ~52 days: it stays as long as the round
says), struck otherwise. The caravan's people are Dalab's (off the map); the sim counts them in the carrier, not as a place.

## 5. Core adoption

| Need | Module | How |
|---|---|---|
| The two mining camps | `core/hamlet` (`KHAMLET.village`, `KHAMLET.xanaduRow({camp: true, mineHead: true})`) | Two camps a record; the census's `camp` option added (TODO.md) |
| The pitched camps and halts | `core/camp` (`KCAMP.pitch`, `KCAMP.halt`, `KCAMP.tentFor`) | The Tears' ring; the Great Caravan's laager |
| The tents | `kits/tents` | The Xanadu silk dress; Dalab's for the caravan |
| The ground | `core/world` (sites, `ROADS`, `bake_sites.py`) | The camps as sites; the ore road, the ferry |
| The lode and the potch | `kits/resources` (the nodes), `XAN_TUNE` `T.field` | The node marks the field on the resource layer; the veins are the tune's |
| The tailings | `core/ruins` (`KRUBBLE`) | Heaps, seated by their rotated extents |
| Placement | `core/rand`, `core/tags`, `core/mask` | As everywhere |
| The economy | `core/region` | The records as they stand (the rename only) |

## 6. Textures

`ground.tailings.ore` (section 59, new: Kōlḍ-Lōḍ's and the opal diggings' spoil); `ground.tundra`, `ground.fellfield.fines`
(Kōlḍ-Lōḍ's ground), `rock.hewn.drillmarked` (the adits' mouths); Opal Valley's section 55 (owed). The tents are the Tents
kit's.

## 7. Steps

| Step | What | When |
|---|---|---|
| **W1** | The camp census option in core/hamlet (`spec.camp`, `row.camp`), opt-in, with `test-hamlet.js` negatives; the stamp mill and sorting shed in `kits/xanadu/extra/` | now |
| **W2** | The Golden Tears' camp as a `xanadu-oidong-highrift` site (`stearscamp01`), pitched by the season; Erehwon's caravan halt in `xanadu-lake-shore` | now |
| **W3** | Kōlḍ-Lōḍ's two camps and Opal Valley Mines' two camps drawn on a sheet (a target on Xanadu's page, *proposed* `--kit settlements/xanadu` target `works`), verified (footprints, census, the works present) | now (no ground needed) |
| **W4** | Both mines on their regions' ground; the ore road and the ferry; Theodiga's and Qiblai's caravan halts | after the stack cuts Gōlḍ-Mārch, Ōpal-Bhālī, Bhēl and Qāṭarāq |
| **W5** | The rename in the tune and the pin (the queue) | with W3 |

## 8. Done (2026-11-23, branch `claude/xanadu-works-a7`)

- **W1**: `core/hamlet/camp/26-hamlet-camp.js` (opt-in: `spec.camp`, `spec.share`; `core/hamlet/test-hamlet-camp.js`, 15 checks
  with negatives, run by `test-hamlet.js`); the Xanadu row's `mill`, `diggings` and `landing` foci (`core/hamlet/xanadu/23`);
  `kits/xanadu/extra/88h-xa-mine-works.js` (`xa_stamp_mill`, `xa_sorting_shed`, inside their lots by `test-footprints.js`).
- **W3**: `settlements/xanadu-works` (a target on Xanadu's page): the four camps from the tune's records, 950 = 500 + 450 and
  850 = 500 + 350; a fifth of the diggings' houses the Glaziers' (`gz-front`, `gz-cell`); the heaps on `KRUBBLE`. Its verify:
  `works-laid`, `census`, `works-present`, `footprints`.
- **W5**: the tune's name for `smgxtultfq` is Kōlḍ-Lōḍ. **The pin's rename is the scale model's queue's** (not edited here).
- **W2, in part**: the camps' planner and drawer are region-local (`openworld/xanadu-oidong-highrift/src/48t`, `88t`; core/world's
  site planner takes only the Beast Riders' camps: TODO.md). **Erehwon's caravan halt is drawn** in `openworld/xanadu-lake-shore`
  (a laager of 40 wagons, the Tears' escort's ring, its windows from year days 311 and 107). **The Golden Tears' camp is not on
  the ground yet**: its point (px 850,1628) is 60 km outside the region's cut (section 3's "inside the High Rift polygon" did not
  hold), so `stearscamp01` is a SITES.json row for the region's next recut (with the Spillway's and the Devisers' squares already
  listed) and its ring is proven on synthetic ground (`openworld/xanadu-oidong-highrift/tests/test-world-camps.js`).
- The tents are their forms' massing (the Tents kit is not sealed for another world yet; it has no Dalab dress): TODO.md.
