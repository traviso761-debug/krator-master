# Xanadu: building the rest of the Sultanate's settlements (draft, 2026-11-16)

The owner, 2026-11-16: *"Make draft for building remaining settlements across Xanadu"*.

This is a draft programme for the owner to approve. No code or page comes from it. It lists every settlement of the
Sultanate, says what state each is in, groups the ones still to build by how they would be built, and proposes an order
in waves of sessions. Everything not from the owner, the lore or the sim's tune is *proposed*. Every session count and size
is an estimate (est.).

Sources:
- the sim's tune, `core/region/data/xan-tune.js` (`XAN_TUNE`), and `core/region/data/east-rift.js` (Longsong's valley joined);
- `core/simulation/PROPOSAL-XANADU.md` sections 2a, 3 and 3e;
- the scale model 5.1 pins (`tools/scale-model/model/src/60-settlements.js`) inside the political polygon `rmufcgvtxatfx`;
- `openworld/SITES.json` and the two regions' `plan/sites.json` (`xanadu-oidong-highrift`, `xanadu-north-shore`);
- each `settlements/<x>/PLAN.md`, its `dist/` and `git log`, and the branches still ahead of this one (`git branch -a`);
- `kits/xanadu` (its README, `extra/`, `87k-xa-lake-trades.js`, `89-xa-trades.js`), `kits/qiblai`, `core/hamlet/20-hamlet-cultures.js`;
- `LORE.md` 6.13 and 6.15; `TODO.md`, "Ride along with the next all-builds rebuild".

## 0. Summary

| State | Settlements | Ring hamlets (counted apart) |
|---|---|---|
| **Built** (a page or region draws it, it passes, no session open on it) | 0 | 16: Erehwon's 6 and Qiblai's 6 (the `xanadu-oidong-highrift` region), Kirstabal's 4 (its page) |
| **In progress** (a session or an unmerged branch on it) | 13 | 14: Phēr's 6 (the north-shore region), Thalaba's 4 and Lāiṭwāl's 4 (baked in the region's plan, not in the tune) |
| **Planned** (a plan names it, nothing built) | 16 rows (one is six watch posts, one the Thalaba road's halts) | |
| **Unplanned** (a sim record or a pin only) | 27 | Theodiga's ring (3-4, not even records) |

The large unplanned group is **Erewhon's lake**: 17 shore towns and 3 small isles, every one a sim record with people and a
trade, none with a plan or a pin. Then the two Marches forts, the two mine camps, the oil field, the three seasonal camps and
Theodiga's ring.

The programme proposed here is about 22 sessions (est.) in nine waves, with Erewhon's re-seat and port to `core/city` as a
long parallel track.

## 1. Inventory

The Sultanate's settlements as the tune holds them (people are the tune's), with the pins and plans beside them. px are the
5.1 canvas (2 km a pixel). "Region" is the open-world region that holds the site, if any.

### 1a. The seats and towns

| Id | Name | px | People | Kind | State | Where it stands |
|---|---|---|---|---|---|---|
| `s57bkv9741` | **Erehwon** (Erewhon, Pearl of Xanadu), seat of P1 and P8 | 841,1517 | 25,000 | capital | **in progress** | `settlements/xanadu` (`dist/erewhon.html`, target `erewhon`): built at the old site (805,1516) on its own layout (`87-er-layout.js`, not `core/city`); "half built ... hill placement is broken" (LORE.md 6.13). The page's world coordinates are owed since edit 7's re-run (`tools/scale-model/README.md`, 5.1e12, "Left for later"); the pin still reads 805,1516 |
| `xan.citadel` | The Citadel (Treasury, court, gate company) | 840,1518 | 1,200 | district of Erehwon | in progress | `settlements/xanadu/citadel` blueprint; built in `erewhon.html` (KNOWN_ISSUES: textures not yet rebuilt) |
| `xan.dome` | The Pleasure Dome (harem, the Dome of the Bay) | 840.9,1516.8 | 260 | district of Erehwon | in progress | `citadel/PLEASURE-DOME.md`; in `erewhon.html` |
| `skm4jjo2vl` | **Qiblai**, seat of P3 (the Prismarchy) | 922,1595 | 14,700 + the Order's 300 | city | **in progress** | `settlements/qiblai` (Q7, target `city` on Xanadu's page, merged); Q7e (the city's life) on `claude/zealous-allen-0cd44d`, 1 ahead |
| `s4zvgepuru` | **Theodiga**, seat of P2 | 908,1535 | 6,000 | town (Ancient arcology and town) | **in progress** | `kits/ancients --target theodiga-today` (merged); T-econ-2 on `claude/theodiga-floorplan`, 1 ahead |
| `sfgtxw10kr` | **Strongbow** (the Royal Opal Gate) | 1001,1596 | 4,000 | town (Ancient cliff arcology, the lift) | **in progress** | `settlements/strongbow` on `claude/keen-swanson-68a311`, 34 ahead, unmerged |
| `sl758m2396` | **Kirstabal**, seat of P5 | 989,1600 | 3,000 | town (barge port) | **in progress** | page merged (`dist/kirstabal.html`); K5 on `claude/kirstabal-plan-3bc37d`, 1 ahead; K6 (the lake's villages on the open world) open |
| `xan.pher` | **Phēr**, seat of P7 (the heir) | 843,1491 | 6,000 | town (lake hub) | **in progress** | page merged; P6-P7 on `claude/pher-plan-55d3f2`, 1 ahead |
| `slaitwal0001` | **Lāiṭwāl** (the Light Wall), seat of P6 | 1028,1653 | 5,000 | town (half Glaziers) | **in progress** | page merged; 3 ahead on `claude/lightwall-50feb4` |
| `xan.thalaba` | **Thalaba** | 840,1463 | 2,400 | town | **in progress** | page merged; T6 (the expedition road) on `claude/thalaba-plan-a99fd7`, 4 ahead |
| `sxan7r1sln` | **Strongwall** (the Master of Mines' fort), seat of P4 | 912,1640 | 250 | fort | **in progress** | `PLAN.md` merged; the fort asset F1-F4 on `claude/strongwall-plan-c1ee33`, 1 ahead; no page (S1 open) |

The merchant and Order houses (`horns.*`, `tears.*`, `devisers.*`, `dalab.thalaba`, `qb.order`, `qb.white.kirstabal`) stand
inside these towns. Each is a lot of its town's plan, not a settlement of its own. They are not counted.

### 1b. The monasteries and forts

| Id | Name | px | People | Kind | State | Where it stands |
|---|---|---|---|---|---|---|
| `xan.tempest` | The House of the Tempest (violet, the Violet Storm) | 886,1619 | 600 | monastery (martial) | **in progress** | `settlements/strongwall/tempest` blueprint (merged); sheet U on `claude/tempest-blueprint-139453`, 1 ahead; no page; V0 pin queued |
| `xan.beacon` + `march.e` | The Beacon (gold, the Yellow Monastery) and the beacon fort over the Rift | 853,1540 | 300 + 150 | monastery and fort | **in progress** | `settlements/beacon` plan and blueprint (merged); no page; B0 (the knoll) in the scale-model queue |
| `qb.viridian` | The Order of Viridian Thought's head house and tea estate (green) | 962,1562 | 400 | monastery (estate) | **in progress** | plan merged; V3-V4 (the sheet, GPU pass) on `claude/viridian-plan-134f8b`, 2 ahead |
| `lk.great-isle` | Grēṭ-Āil (blue, the Azure Dream) and its three fishing villages | 845,1504 (house in the cove 846,1508.7) | 900 (300 + 600) | monastery and villages | **in progress** | page merged (`dist/azure-dream.html`); 4 ahead on `claude/azure-dream-24b1cf`; the tune holds the isle as one record |
| *none yet* | The Order of the Flashing Eye's head house (crimson) | 881,1527 | about 320 (*proposed*) | monastery | **planned** | `settlements/flashing-eye/PLAN.md` (plan only); its vent in the scale-model queue; not in the tune |
| `march.w` | The west watch fort | 818,1531 | 150 | fort | **unplanned** | tune only; named in Strongwall's S2 ("each by its own plan") |
| `march.s` | The south watch fort | 847,1549 | 150 | fort | **unplanned** | tune only; Strongwall's S2 |
| *W0 pins* | Strongwall's six watch posts (G1 917,1648; G2 911,1653; G3 915,1664; R1 906,1635; R2 905,1626; R3 894,1624) | | a few each (*proposed*) | outposts | **planned** | Strongwall `PLAN.md` W0 (pins queued), S1 |

The eight colours: saffron (the History Monks: their house is a spoke of Qiblai), white (the White Lily: its head house is
its Qiblai complex), and **turquoise, still unnamed** (LORE.md 6.13). None of those three needs a head house outside Qiblai
today.

### 1c. Erewhon's lake: the shore towns and the isles

Every one is a tune record (`lk.<key>`, `T.lake`, `T.islands`) on the re-run lake (5f659c054). None has a pin. Phēr is in 1a,
Grēṭ-Āil in 1b. The hub is Erehwon for P1 and Phēr for P7.

| Id | Name | px | People | Trade (a year) | Prov. | State |
|---|---|---|---|---|---|---|
| `lk.alph-head` | Ālph-Hēḍ | 876,1503 | 4,000 | grain 900 t | P1 | unplanned |
| `lk.hot-bath` | Hoṭ-Bāṭh | 876,1513 | 1,800 | sulfur 40 t | P1 | unplanned |
| `lk.tea-terraces` | Ṭī-Ṭeras | 872,1517 | 2,000 | tea 45 t | P1 | unplanned |
| `lk.pottery` | Pāṭari | 865,1518 | 1,500 | pottery 120 t (no dugouts) | P1 | unplanned |
| `lk.saffron` | Saphran | 857,1519 | 1,800 | saffron 900 kg | P1 | unplanned |
| `lk.weaver` | Wībhar | 852,1519 | 2,500 | the looms (brocade; no dugouts) | P1 | unplanned |
| `lk.boatyard` | Boṭ-Yārḍ | 846,1519 | 2,000 | the hulls (no dugouts) | P1 | unplanned |
| `lk.garden` | Gārḍan | 836,1517 | 1,800 | fruit 300 t | P1 | unplanned |
| `lk.quarry` | Qorī | 832,1516 | 1,500 | stone (no dugouts) | P1 | unplanned |
| `lk.orchard` | Ōrcharḍ | 827,1512 | 1,600 | fruit 420 t | P1 | unplanned |
| `lk.lotus` | Lōṭas | 822,1507 | 1,500 | mats 60 t, fruit 120 t | P1 | unplanned |
| `lk.fish-market` | Phish-Mārkiṭ | 815,1501 | 4,000 | fish | P1 | unplanned |
| `lk.stack` | Siṭāq | 812,1495 | 900 | fish | P1 | unplanned |
| `lk.hive` | Hāibh | 817,1490 | 1,200 | honey 24 t | P7 | unplanned |
| `lk.mulberry` | Malbari | 825,1488 | 2,200 | silk 16 t | P7 | unplanned |
| `lk.net` | Nēṭ | 833,1488 | 1,400 | fish | P7 | unplanned |
| `lk.cocoa` | Qōqō | 838,1489 | 1,800 | cacao 50 t | P7 | unplanned |
| `lk.mouth` | Māuṭh | 852,1494 | 1,500 | fish | P7 | planned (a cut square in `xanadu-north-shore`, `sxanmouth01`) |
| `lk.old-thalaba` | Ōlḍ-Thalaba | 860,1496 | 600 | fish | P7 | planned (pin `soldthalaba1`, cut square) |
| `lk.dyer` | Ḍāiyar | 870,1500 | 1,400 | fish (the dyers, by its name) | P7 | planned (cut square `sxandyer01`) |
| `lk.bay-isle` | Bē-Āil (the Sultan's fishponds) | 844.1,1511.5 | 300 | fish | P1 | unplanned |
| `lk.west-isle` | Wesṭ-Āil (the fishermen's isle) | 831,1499 | 400 | fish | P1 | unplanned |
| `lk.east-isle` | Lāiṭ-Hāus (the light and the customs) | 864,1503 | 200 | fish | P1 | unplanned |

### 1d. Kirstabal's lake (the Lower Xanadu Lake)

Eight villages (Ōpal-Māuṭh became Gihon, 2026-11-22), all P5, hub Kirstabal (`ll.<key>`, `T.lowerLake`). Their records and layouts exist in Kirstabal's
`src/42-ks-ring.js` (`KS_RING.lake`, held equal to the tune by its node test), but they are not drawn: they stand 25-115 km
off the page (Kirstabal's K6). State: **planned** for all nine.

| Id | Name | px | People | Trade |
|---|---|---|---|---|
| `ll.sekrid` | Sekriḍ (the Flashing Eye's village) | 986,1588 | 800 | shrine, fish |
| `ll.phishari` | Phisharī | 975,1587 | 1,400 | fish |
| `ll.kako-bagh` | Kāko-Bāgh | 963,1586 | 1,200 | cacao 30 t, fruit 120 t |
| `ll.rid` | Rīḍ | 948,1589 | 700 | mats 30 t |
| `ll.landing` | The Landing (the barges' stop, the portage road's head, on its stone piers) | 932,1600 | 2,500 | portage (no dugouts) |
| `ll.timbar` | Ṭimbar | 938,1606 | 700 | timber 600 t |
| `ll.rais-teras` | Rāis-Ṭeras | 967,1606 | 1,000 | grain 300 t |
| `ll.kattal` | Kaṭal | 979,1605 | 700 | dairy 60 t |

**Gihon (built 2026-11-22, `settlements/gihon`, PLAN.md G0-G3):** Ōpal-Māuṭh is now **Gihon** (`xan.gihon`, px 955.7,1607.9),
8,500: the Lower Lake's garrison town, the Sultan's Mint and the assessors, the Golden Tears' head house, a walled forbidden city
in its river corner; a target on Xanadu's page (`dist/gihon.html`). In the tune: the town (7,060), its forbidden city
(`xan.gihon.fort`, 1,000, 60 hired musketeers), the Tears' head house (`tears.gihon`, 160; Strongwall keeps their court), the
White's and the Violet's daughter houses (140 each), its ring (`gh.ring.*`: four farming villages and a ranch); **the Landing**
grows to 2,500 on its stone piers at the outlet (records on core/city, `src/43-gh-landing.js`, for the region to draw); five
**hamlets on the Alph** (`alph.*`: Wēyar, Mēḍō, Gōrj-Phuṭ in the Scarp tithing to the Landing; Hil-Ṭī and Phērī in the Vale
tithing to Theodiga). State: Gihon **built** (its page); the Landing and the Alph's hamlets **planned** (records, not drawn in the
region yet).

### 1e. The works, mines and camps

| Id | Name | px | People | Kind | State |
|---|---|---|---|---|---|
| `smgxtultfq` | The gold mines on the lode ("Xanadu gold mines (to be named)" on the pin) | 911,1665 | 950 | mine (work camp; 4,812 m, -6 C tundra) | unplanned |
| `sjuarjbku0` | Opal Valley Mines (the Sultan's factor; Lāiṭwāl's works village across the lake) | 1038,1662 | 850 | mine (work camp) | unplanned (Lāiṭwāl's plan names it as a neighbour) |
| `geo.oilfield` + `yuni.mission` | The Geomancers' concession (Qiblai's oil field) and Yuni's mission | 925,1598 / 926,1597 | 300 + 40 | works | unplanned |
| `exp.godshearth` | The Rare Devisers' expedition camp at Godshearth (summer) | 828,1380 | 150 | camp (seasonal) | planned (Thalaba's T6 road; Godshearth station 4, the Spillway, `xanaduspill`) |
| `exp.dalab` | The Dalab mission's party at the Grove (summer) | 836,1388 | 40 | camp (seasonal) | unplanned |
| `exp.rift-gold` | The Golden Tears' prospecting camp in Lizard country (cool months; approximate) | 850,1628 | 120 | camp (seasonal) | unplanned |
| *region sites* | The Thalaba road's hans (every 25 km), the Qol ford (822.7,1480), the Qol head (826.7,1464) | | | caravan halts | planned (`xanadu-north-shore`) |

No settlement of the Sultanate is an oasis. The Catch's oases (Kolli, Arfwai, Bitta, Stair) are outside the polygon.

### 1f. The rings (core/hamlet villages round a town)

| Ring | Ids | People | State |
|---|---|---|---|
| Erehwon's | `s57bkv9741.hamlet.farm-1..5`, `ranch-1` | 5 x 240, 145 | built in `xanadu-oidong-highrift`, but round the old site: the tune shifts them with the town (`ringFix` for farm-1), the region waits for its recut |
| Qiblai's | `skm4jjo2vl.hamlet.farm-1..5`, `ranch-1` | 5 x 240, 145 | built in `xanadu-oidong-highrift` |
| Phēr's | `xan.pher.hamlet.farm-1..6` | 6 x 240 | in progress (`xanadu-north-shore`, the region's site still `planned`) |
| Kirstabal's | `ks.ring.mil`, `kanal`, `grenz`, `baiyar` | 3 x 240, 145 | built (Kirstabal's page) |
| Thalaba's | `shvo49k0y2/hamlet/bridj` (ranch), `salphar` (sulfur), `bench-1`, `bench-2` | 120, 94, 220, 220 | in progress: in the region's `plan/sites.json`, **not in the tune** |
| Lāiṭwāl's | `slaitwal0001/hamlet/farm-1..3`, `ranch-1` | 240, 240, 220, 145 | in progress: in the region's plan, **not in the tune** |
| Theodiga's | none | 3-4 villages (PROPOSAL-XANADU 3e) | unplanned |

The provinces' countrysides (`prov.p1`..`prov.p8`, about 290,000 people in bulk) are one record each and never drawn
singly (PROPOSAL-XANADU 3e). A region page may draw a seeded sample near the camera; that is wave 8 below.

### 1g. Outside the programme

- **Longsong** (`sq80bzd7ep`, 1228.88,1621.23) and its valley (the Singing Gjar, the Mirror Grange, the Caldron House): the
  History Monks' (LORE.md 6.15), outside the polygon, joined to the economy by `east-rift.js`. Its own sessions keep it.
- **The Twins** (`gem_twins_pass`, 1042,1525, "Twins Pass Wardenry") and **the White Gills Hermitage** (moved to 1015,1430, the
  Order of Historians'): border neighbours, outside the polygon (question 9).
- **Tuatara, Sauropolis, Komodo**: Lizardmen villages in the Rift floor, not the Sultanate's.
- **Blakhed, Nulab, Shelf**: Dalab's, off the map; the Great Caravan's summer stops.

## 2. The ones still to build, grouped

### 2a. By how each would be built

| Way | What it is | Who goes this way |
|---|---|---|
| **A target on Xanadu's page** (`settlements/xanadu/build.py --kit settlements/<x>`, as Kirstabal, Thalaba, Phēr and Qiblai are) | a town on `core/city` with its own ground, drawn by the Xanadu kit | the lake towns of 1,500 and over, through **one shared lake-town target** (*proposed*, section 3, wave 3); Strongwall's page (S1) |
| **core/hamlet villages** (`KHAMLET.village`, the `xanadu` row) | at most 500 laid (`KHAMLET.POP_MAX`); a bigger village is laid as its first 500, its census by the row (as Kirstabal's lake villages are) | the three small isles; Theodiga's ring; the lake villages under 1,500 if the owner prefers hamlets to small towns (question 1) |
| **core/hamlet work camps** (the `xanadu-camp` row, now local to `openworld/oidong-highrift`; TODO.md wants a `camp` option) | miners without families | the gold mines, Opal Valley Mines |
| **core/city towns** (`core/city/README.md`, "Porting a settlement") | one `KCITY.create` instance a town | every lake town of 1,500 and over; Erehwon's port |
| **Blueprints** (the shared generator; the Beacon's, the Tempest's and the Azure Dream's pattern) | sheets first, then a page | the Flashing Eye; the Tempest's and the Beacon's pages; the Marches' two forts (from the fort asset) |
| **Open-world sites only** (core/world `SITE_SPEC`, in `openworld/xanadu-oidong-highrift` or `xanadu-north-shore`) | records drawn by `48s` / `88s` on the region's ground, no page of their own | every row above once built; and alone: the seasonal camps, the oil field, the caravan halts, the countryside sample |
| **core/camp** (`KCAMP`, `50-camp-tents.js` has a `xanadu` row) | a pitched camp, struck and moved | the Godshearth camp, the Dalab party, the Golden Tears' camp, the caravan halts (the Great Caravan at Erehwon, the Catch caravans at Strongbow's foot) |

### 2b. Which kits draw each

| Group | Kits |
|---|---|
| The lake towns and isles | **the Xanadu kit** (the normal set; a share of the Andean houses, as Phēr takes); `extra/` (the lake craft, the stall, the caravanserai) and `87k-xa-lake-trades.js` (the fish racks, the tea factory, the fermentary) read in place until the all-builds rebuild; the new pieces of section 4a |
| Kirstabal's lake villages | the Xanadu kit only (the owner, for Kirstabal: "just the normal xanadu kit"); Sekriḍ adds **Qiblai's** crimson shrine (`qb_monastery`'s dress) |
| Theodiga's ring | **scrap Xanadu** (`xa_scrap_farm`, `xa_scrap_house`, the poor tier), as Theodiga's town (*proposed*) |
| Opal Valley Mines, Lāiṭwāl's hamlets | the Xanadu kit, with **the Glaziers' set** (`gz-*`, `kits/tungang`) where Glaziers work the potch (*proposed*) |
| The gold mines | the Xanadu kit (`xa_adit` is a pending box in the hamlet row today; a mine head is owed), the resources kit's lode node |
| The Marches' forts, the watch posts | **the Xanadui fort asset** (`kits/xanadu` F1-F4 on the Strongwall branch); the beacon's lamp head is `kits/ancients`' |
| The Tempest, the Beacon, the Flashing Eye | **the Qiblai kit**'s great monastery in its colour, on the fort asset where it is walled (the Tempest's `size:'monastery'`) |
| The oil field and Yuni's mission | the Geomancers' pumpjack (`kits/locus`, the resources kit's oil derrick); the mission in **the Yuni kit** (*proposed*) |
| The camps and halts | `core/camp` and `kits/tents` (the Xanadu silk dress; the Iziz caravaners' for the Catch caravans) |
| All of them | the Xanadu kit draws through **the Iziz Vernacular**'s materials, helpers and openings, so that kit is read by every page above |

## 3. The order: waves and sessions

**Superseded 2026-11-22 by `BUILD-PLAN.md`** (the owner's order of that day: Xanadu close to complete, then the vertical
stack extended with Xanadu, then the all-builds rebuild). Waves 0.1 and 0.2 are done (`kits/xanadu/extra/88g-xa-works.js`,
`core/hamlet/xanadu/23-hamlet-xanadu-row.js`) and 0.3 too (the tune's rings, villages and the Flashing Eye); wave 1's
merges mostly landed. The table below is kept as it was written.

Each wave is a few sessions; each session a task with a brief. A session starts a new build from `tools/new_build/`, lists
it in `tools/checks_optin.json`, writes its `Core adoption` section first and runs `tools/check_core_use.py` before calling it
done (CLAUDE.md). No session copies camera, PRNG, noise, terrainH, sky or harness into a build. Every new page reads
`XAN_TUNE` in place for its ids, places and people (section 4c), never a copy.

The map's dependencies:
- **The recut of `openworld/xanadu-oidong-highrift` north to the Catch** is cut on the first lake; the south and west shore,
  Erehwon's ring and the Lower Lake have no 1:1 ground on the re-run model until it lands (its PLAN.md items 7 and 8).
- **The scale-model queue** (one queue, re-run on the integration line): Gemini's reshaping, the Twins sculpt, the Beacon
  knoll (B0), the Flashing Eye's vent, Strongwall's W0 pins and the Tempest's V0 pins. A site on ground still in the queue waits.
- **The all-builds rebuild still owed** (`TODO.md`): the kit's `extra/` into `src/`, core/hamlet's Xanadu fishing works,
  `core/tags`' culture `qiblai`, core/world's `xanadu` style. Until it runs, new pages take the opt-in files by name, as
  Phēr and Kirstabal do.

| Wave | Session | Brief | Waits on |
|---|---|---|---|
| **0. Shared groundwork** | 0.1 Kit pieces | The pieces section 4a lists, in `kits/xanadu/extra/` (opt-in); one caravanserai, not two (`xa_serai` in 87k and `xa_caravanserai` in `extra/`: question 12); rows on the kit's sheet; `verify.py --assert` | nothing |
| | 0.2 The hamlet row | core/hamlet's `xanadu` row passed by name (as `KS_RING.fishingRow` is): fishing in the row, the foci of PROPOSAL-XANADU 3e (orchard, tea garden, saffron, estate, placer) and a pottery and a quarry focus (*proposed*); the camp option; `test-hamlet.js` with negatives. Folded into the row at the rebuild | 0.1 for the keys |
| | 0.3 The tune | Records for what pages and regions already hold but the tune lacks (Thalaba's 4 and Lāiṭwāl's 4 hamlets, Grēṭ-Āil's three villages, the Flashing Eye's house, the watch posts), on the owner's answer (question 5); `test-xan-economy.js` unchanged unless meant to move | the owner |
| **1. Land what is in flight** | (the owner's merges) | Kirstabal K5, Phēr P6-P7, Thalaba T6, Lāiṭwāl, Grēṭ-Āil, Viridian, the Tempest's sheet, the fort asset F1-F4, Qiblai Q7e, Theodiga T-econ-2, Strongbow; then the all-builds rebuild with the ride-along items | the owner |
| **2. The map** | 2.1 The queue | The pins and landforms queued (B0, the vent, the Twins, W0, V0), plus *proposed* pins for the 20 lake towns and 3 isles and the mines' names (questions 4 and 11) | the queue's turn |
| | 2.2 The recut | `xanadu-oidong-highrift` recut on the re-run model north to the Catch, with the gorge corridor to the Spillway; Erehwon's ring re-baked round 841,1517; site squares for the south and west shore and the Lower Lake | 2.1 |
| **3. The lake towns, north** | 3.1 The lake-town target | One shared target (*proposed* `settlements/xanadu-lake`, `--kit` on Xanadu's page, `?town=<id>`): a lake town on `core/city` from its tune record (the quay street, the terrace stair, the temple, its trade's works), records free of three.js so the region's `48s` can draw the same plan; first town Māuṭh | 0.1, 0.2 |
| | 3.2 The north shore | Ḍāiyar, Ōlḍ-Thalaba (a hamlet), Qōqō, Nēṭ, Malbari, Hāibh on the north-shore region, which is already cut on the re-run model | 3.1 |
| **4. The lake towns, south and west** | 4.1 The south-east round | Boṭ-Yārḍ, Wībhar, Saphran, Pāṭari, Ṭī-Ṭeras, Hoṭ-Bāṭh, Ālph-Hēḍ | 2.2, 3.1 |
| | 4.2 The west round and the isles | Gārḍan, Qorī, Ōrcharḍ, Lōṭas, Phish-Mārkiṭ, Siṭāq; Wesṭ-Āil, Bē-Āil, Lāiṭ-Hāus (hamlets) | 2.2, 3.1 |
| **5. The Lower Lake** | 5.1 Kirstabal K6 | The nine villages on the open world from `KS_RING.lake`, the Landing's portage road, Sekriḍ's crimson shrine; by Kirstabal's session if it is still open | 2.2 |
| **6. The forts** | 6.1 Strongwall on the world | S1: the gorge wall, the two wards with the Tears' court, the slot, the six posts and their lines of sight | 1 (F1-F4), 2.1 (W0) |
| | 6.2 The Marches | S2: the west and south watch forts from the fort asset, one session for both (*proposed*; question 7) | 1, 2.2 |
| **7. The monasteries** | 7.1 The Tempest's page | V2-V3: the fort asset's monastery size round the Qiblai kit's violet house; the lookout | 1, 2.1 (V0) |
| | 7.2 The Beacon's page | Its blueprint drawn: the head house beside the beacon fort, the lamp on its generator | 2.1 (B0), 6.2 for the fort's dress |
| | 7.3 The Flashing Eye | Its blueprint on the shared generator, then its page, as the Azure Dream went | 2.1 (the vent), the owner's answers |
| | 7.4 Viridian on the world | The estate's records on the region's ground (its step after V4) | 2.2 |
| **8. Works, camps, countryside** | 8.1 The mines | The gold mines and Opal Valley Mines as work camps; the ore road to Strongwall, the opal ferry to Lāiṭwāl | 0.2 (camp), 2.1 (names) |
| | 8.2 The oil field and the camps | The concession's wells and still-house, Yuni's mission; the three seasonal camps and the caravan halts on `core/camp` | 2.2 |
| | 8.3 The countryside | Theodiga's ring (scrap Xanadu); the provinces' sample villages near the camera (`KHAMLET.village` on the farm mask, seeded from (province, cell)); the rings checked against the tune | 0.2, 2.2, question 6 and 10 |
| **E. Erehwon (parallel)** | E.1-E.3 (est. three sessions) | The page's world coordinates moved to 841,1517 on the re-run lake; the hill placement fixed; the city ported to `core/city` (its districts as the site's steps 0-5, the citadel and the Dome as landmarks); the citadel's textures rebuilt | 2.2; question 2 |

About 22 sessions (est.): wave 0 three, wave 2 two, wave 3 two, wave 4 two, wave 5 one, wave 6 two, wave 7 four, wave 8
three, track E three. Wave 1 is merges and the rebuild, not new work. Waves 3 and 0 can start now; the rest wait on the map.

## 4. Shared work the build-out needs first

### 4a. Kit pieces (*proposed*; `kits/xanadu/extra/` until the rebuild)

The kit has the quay, boat shed, lighthouse, dugout, launch, barge, fish racks, tea factory, fermentary, latex house,
watermill, windmill, granary, workshop, smithy, temple, the farm set and a caravanserai (two). The lake towns' trades want:

| Piece | For |
|---|---|
| a kiln yard (the potters') | Pāṭari |
| a dye works (vats, drying lines) | Ḍāiyar, Wībhar; `XA_TRADES` lists the weaver's and dyer's workshop as a gap |
| a loom house | Wībhar's 300 looms, Erehwon's weavers |
| a saffron house (the drying loft) | Saphran |
| an apiary (hive walls, the honey house) | Hāibh |
| a reeling house (silk; the watermill serves today) | Malbari |
| a mat shed and reed racks | Lōṭas, Rīḍ |
| a quarry face and the masons' yard | Qorī |
| a sulfur works (the spring's crust) beside the bath | Hoṭ-Bāṭh (the Grand Baths exist) |
| a customs house | Lāiṭ-Hāus |
| fishponds (stone-walled pens in the shallows) | Bē-Āil |
| a slipway (hulls laid down) | Boṭ-Yārḍ |
| a mine head and a placer sluice (the adit is a pending box) | the gold mines, the opal mines, the placer focus |
| a wayside shrine (a `XA_TRADES` gap) | every village |

`XA_TRADES` also lists a bakery, a butcher's, a brewhouse, a tannery, a school and a works as gaps; the lake towns can
stand without them. The lacquer workshop (TODO.md, "Lacquerware") lands where the owner places it.

### 4b. core/hamlet's `xanadu` row

The row has farming, ranch, mine and silk. It lacks fishing (passed by Kirstabal today; a ride-along item), and the foci
PROPOSAL-XANADU 3e names: orchard, tea garden, saffron, estate, placer. The `xanadu-camp` row lives in
`openworld/oidong-highrift`'s site file; TODO.md asks for a `camp` option in `KHAMLET.census`. core/hamlet reaches 56 pages,
so the row changes ride with the all-builds rebuild; a session before it passes its row by name.

### 4c. The tune records each new page must match

| Page or site | Records it reads (ids, px, people, works) |
|---|---|
| a lake town | `XAN_TUNE.lake[key]` (`lk.<key>`), its works in `valley()` (`lk.<key>.fishing`, `.terraces`, `.<good>`); its hub's round (`T.rounds`) for the quay |
| an isle | `XAN_TUNE.islands[key]` (`lk.<key>`) |
| a Lower Lake village | `XAN_TUNE.lowerLake` (`ll.<key>`), `T.lowerRounds`; Kirstabal's `KS_RING.lake` is held equal by its test |
| a fort | `march.w`, `march.s`, `march.e` (150 each, `state`), `T.muskets.men`, `T.lit['march.e']` |
| a monastery | `T.tempest`, `T.beacon`, `T.viridian`, `T.islands` great-isle; the Flashing Eye has none yet |
| a mine | `smgxtultfq`, `sjuarjbku0`, `T.mine`, `T.field` |
| the oil field | `T.oil`, `T.mission` |
| a camp | `T.expedition`, `T.dalab.party`, `T.tears.camp` |
| a ring | the region's `plan/sites.json`; `T.pherRing`, `T.ksRing` |

The node test of each page checks its list against `XAN_TUNE` by id, as `test-ks-town.js` does.

### 4d. Textures

`core/materials/PROMPTS-NEEDED.md` holds what is owed already: section 54 (the Xanadui fort: `wall.rubble.limewash` and two
more), 41 (the citadel), 43 (the Qiblai kit), 55 (Opal Valley), 56 (the Hall of Dreaming), the Tungang kit's section.
The lake towns may want a lake-shore set (wet stone steps, a reed-thatch for the mat sheds, dye-stained ground): none is
asked yet. A session that finds a gap names it there with its prompt, and does not paper over it.

## 5. Questions for the owner

**The owner's answers (2026-11-16):** "Lake towns over 500 can be laid out in full. One region per province. Can go ahead and
cut region and give economy Sim records."
- **Question 1:** every lake town over 500 is laid out in full, a `core/city` town.
- **Questions 2 and 3:** one open-world region per province (`XAN_TUNE.provinces`, p1-p8). The North Shore (p7) has
  `openworld/xanadu-north-shore` already; the Lake Shore (p1, Lēk-Shor: Erehwon, its ring, the thirteen shore towns from
  Ālph-Hēḍ round to Siṭāq and the two small isles) is cut now as `openworld/xanadu-lake-shore`. The other provinces follow,
  one region each.
- **Question 5:** the tune gets the records it lacked: Thalaba's 4 and Lāiṭwāl's 4 ring hamlets, Grēṭ-Āil's villages, and the
  Flashing Eye.

**The owner's answers (2026-11-22)** (`BUILD-PLAN.md` section 0):
- **Question 2:** one shared lake page and the regions ("Shared target + regions": `settlements/xanadu-lake`).
- **The six province regions not yet cut wait for the vertical stack.** The stack's Xanadu slice is the Lake Shore with
  Erehwon.
- **Question 4:** the gold mines are **Kōlḍ-Lōḍ**; Opal Valley Mines keeps its name. The turquoise Order: still open.
- **Question 6:** Theodiga's ring is four villages in scrap Xanadu's poor tier.
- **Question 7:** one plan for the Marches' two forts (`settlements/marches/PLAN.md`).
- **Question 10:** the countryside is sampled near the camera in every province region.
- **Question 8:** settled by wave 0.1 (the pieces were built). **Questions 9, 11, 12:** taken as the defaults in
  `BUILD-PLAN.md` section 6 (neighbours left to their plans; the pins through the queue; one caravanserai for the lake towns).

1. **The lake towns over 500 people.** Each a small `core/city` town from one shared lake-town target (*proposed*), or
   core/hamlet laying the first 500 as Kirstabal's lake villages are? Where is the line (1,500 is *proposed*)?
2. **Pages.** One shared lake page (`?town=<id>`) for the 20 towns, a page each, or only the open world draws them? And
   Erehwon: re-seat and port it to `core/city` now, in parallel, or after the lake towns?
3. **The south and west shore's ground.** Wait for the recut north to the Catch, or cut a lake region now on the re-run
   model (the north-shore region widened round the whole lake, *proposed*)?
4. **Names.** The gold mines ("to be named"), and Opal Valley Mines (keep it?). Does the turquoise Order get a name or a
   head house?
5. **The tune and the region plans disagree.** Add Thalaba's 4 and Lāiṭwāl's 4 hamlets, Grēṭ-Āil's three villages and the
   Flashing Eye's house to the tune?
6. **Theodiga's ring.** Three or four villages, in scrap Xanadu?
7. **The Marches' two forts.** One plan for both from the fort asset, or each its own (Strongwall's S2)?
8. **The kit pieces** in section 4a: approve the list, and which come first.
9. **The Twins pass fort and the White Gills Hermitage**: in this programme, or neighbours left to their own plans?
10. **The countryside.** Draw a seeded sample of each province's villages near the camera in the region pages?
11. **Pins.** Do the 20 lake towns and 3 isles get scale-model pins through the one queue?
12. **Two caravanserais.** `xa_serai` (87k, Kirstabal) and `xa_caravanserai` (`extra/`, Phēr): keep one, or both as two
    sizes?
13. **Kirstabal's lake.** Leave K6 to Kirstabal's session, or fold it into this programme's wave 5? *(As of 2026-11-16
    Kirstabal's session has been told to carry on with K6, from the owner's "Have daughter sessions continue next step of
    build"; wave 5 takes what it leaves.)*
