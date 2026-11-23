# The lake towns of Erewhon's lake: one shared target for twenty towns (plan, 2026-11-22)

The owner, 2026-11-16: *"Lake towns over 500 can be laid out in full."* The owner, 2026-11-22 (this plan's questions):
the twenty are drawn by **one shared target and by the regions** ("Shared target + regions"): one build makes each town's
records from its tune row, one page shows any town, and the province regions draw the same records at 1:1.

This file is the target's design: what is common to every town. Each town has its own plan beside it
(`settlements/xanadu-lake/<key>/PLAN.md`, the key is its `XAN_TUNE.lake` key): its site and ground, its people and
trades, its layout, its pieces, its pins. The order the towns are built in is `settlements/xanadu/BUILD-PLAN.md`.
Step L0 is built (2026-11-23: the target and Māuṭh, `README.md`; verified on SwiftShader, the GPU lane's run owed). Everything not from the owner, the lore or the tune is *proposed*.

## 1. The twenty towns

Every row is a `XAN_TUNE.lake` record (`core/region/data/xan-tune.js`, `T.lake`, id `lk.<key>`), on the lake as edit 7
re-made it (5f659c054: 66 x 25 px round 845,1504, the level -520 m). The ground columns are the scale model's (2 km cells,
`tools/scale-model/model/data`, read 2026-11-22): the cell's height, its slope, the relief within 7 km and where the lake
is. Phēr (6,000) is built (`settlements/pher`) and is not one of the twenty.

| Key | Town | px | People | Trade (a year) | Prov. | Hub | Ground (m) | Lake | Region site | Plan |
|---|---|---|---|---|---|---|---|---|---|---|
| `alph-head` | Ālph-Hēḍ | 876,1503 | 4,000 | grain 900 t | P1 | Erehwon | -500, 5 % | W | `sxanlkalph01` | [alph-head](alph-head/PLAN.md) |
| `hot-bath` | Hoṭ-Bāṭh | 876,1513 | 1,800 | sulfur 40 t | P1 | Erehwon | -447, 8 % | NW | `sxanlkhotbath01` | [hot-bath](hot-bath/PLAN.md) |
| `tea-terraces` | Ṭī-Ṭeras | 872,1517 | 2,000 | tea 45 t | P1 | Erehwon | -440, 11 % | N | `sxanlktea01` | [tea-terraces](tea-terraces/PLAN.md) |
| `pottery` | Pāṭari | 865,1518 | 1,500 | pottery 120 t | P1 | Erehwon | -316, 9 % | NW | `sxanlkpottery01` | [pottery](pottery/PLAN.md) |
| `saffron` | Saphran | 857,1519 | 1,800 | saffron 900 kg | P1 | Erehwon | -440, 12 % | N | `sxanlksaffron01` | [saffron](saffron/PLAN.md) |
| `weaver` | Wībhar | 852,1519 | 2,500 | brocade (the looms) | P1 | Erehwon | -440, 11 % | N | `sxanlkweaver01` | [weaver](weaver/PLAN.md) |
| `boatyard` | Boṭ-Yārḍ | 846,1519 | 2,000 | the hulls | P1 | Erehwon | -456, 10 % | N | `sxanlkboatyard01` | [boatyard](boatyard/PLAN.md) |
| `garden` | Gārḍan | 836,1517 | 1,800 | fruit 300 t | P1 | Erehwon | -460, 8 % | N | `sxanlkgarden01` | [garden](garden/PLAN.md) |
| `quarry` | Qorī | 832,1516 | 1,500 | stone | P1 | Erehwon | -440, 12 % | N | `sxanlkquarry01` | [quarry](quarry/PLAN.md) |
| `orchard` | Ōrcharḍ | 827,1512 | 1,600 | fruit 420 t | P1 | Erehwon | -440, 8 % | N | `sxanlkorchard01` | [orchard](orchard/PLAN.md) |
| `lotus` | Lōṭas | 822,1507 | 1,500 | mats 60 t, fruit 120 t | P1 | Erehwon | -316, 10 % | NE | `sxanlklotus01` | [lotus](lotus/PLAN.md) |
| `fish-market` | Phish-Mārkiṭ | 815,1501 | 4,000 | fish | P1 | Erehwon | -500, 5 % | N | `sxanlkfish01` | [fish-market](fish-market/PLAN.md) |
| `stack` | Siṭāq | 812,1495 | 900 | fish | P1 | Erehwon | -447, 10 % | NE | `sxanlkstack01` | [stack](stack/PLAN.md) |
| `hive` | Hāibh | 817,1490 | 1,200 | honey 24 t | P7 | Phēr | -500, 8 % | S | *none yet* | [hive](hive/PLAN.md) |
| `mulberry` | Malbari | 825,1488 | 2,200 | silk 16 t | P7 | Phēr | -500, 4 % | S | *none yet* | [mulberry](mulberry/PLAN.md) |
| `net` | Nēṭ | 833,1488 | 1,400 | fish | P7 | Phēr | -500, 5 % | W/S | *none yet* | [net](net/PLAN.md) |
| `cocoa` | Qōqō | 838,1489 | 1,800 | cacao 50 t | P7 | Phēr | -500, 8 % | S | *none yet* | [cocoa](cocoa/PLAN.md) |
| `mouth` | Māuṭh | 852,1494 | 1,500 | fish | P7 | Phēr | -500, 8 % | S | `sxanmouth01` | [mouth](mouth/PLAN.md) |
| `old-thalaba` | Ōlḍ-Thalaba | 860,1496 | 600 | fish | P7 | Phēr | -500, 9 % | S | `soldthalaba1` | [old-thalaba](old-thalaba/PLAN.md) |
| `dyer` | Ḍāiyar | 870,1500 | 1,400 | fish (the dyers) | P7 | Phēr | -500, 8 % | S | `sxandyer01` | [dyer](dyer/PLAN.md) |

Together: **37,000 people**. The south and west shore (P1, thirteen towns) are sites of `openworld/xanadu-lake-shore`; the
north shore's three east of Phēr are sites of `openworld/xanadu-north-shore`; **the four west of Phēr (Hāibh, Malbari, Nēṭ,
Qōqō) are in that region's box but are not sites yet** (step L2 adds them).

The small isles (Wesṭ-Āil 400, Bē-Āil 300, Lāiṭ-Hāus 200) are under 500 and are core/hamlet villages:
`settlements/xanadu/HAMLETS-PLAN.md`. Grēṭ-Āil and its three villages are `settlements/azure-dream`'s.

## 2. What every lake town is (the lore and the tune)

- **The lake on Lake Atitlán's pattern** (the owner, 2026-11-15: PROPOSAL-XANADU section 2a). The towns stand where the
  caldera wall meets the water: a quay and a landing stair at the water, the town packed up the slope behind, and the
  terraces above it climbing the wall. A boat is the road: most towns are a launch ride from their neighbours and a long
  walk round. The south shore's wall is the steepest (the model rises 700-800 m within 7 km behind Saphran, Wībhar,
  Boṭ-Yārḍ, Gārḍan and Qorī); the north shore sits on the rim plain's foot and is gentler (Phēr's plain rises 6-7 m a km).
- **Every town eats the lake's table** (`T.diet.lake`: 125 kg of grain, 45 of fish, 8 of fruit a head a year, salt, tea,
  tools, the market's pots, mats and honey). **Its terraces grow three fifths of its grain** (`T.lakeTerraces`), the hub
  sends the rest by its market boat round (`T.rounds`), and it sends its own make back.
- **Sixteen towns fish** (`lk.<key>.fishing`, the dugouts: three fifths of 260 kg a head a year, `T.fishKgPerson` x .6,
  far more than the town eats at 45 kg a head; the road to the hub carries the surplus). **Four do not**: Pāṭari, Wībhar, Boṭ-Yārḍ and Qorī have a landing (`lk.<key>.store`) and
  live by their trade.
- **The sim's crews** (`crewOf`: 45 % of the people, at most 400): half of it at the dugouts, half at each trade, two
  fifths at the terraces in the harvest. The crews are the sim's working actors, not every worker: each town's plan gives
  the *proposed* households by trade beside them.
- **The market boats** (`T.rounds`): Erehwon's south-east round (Boṭ-Yārḍ, Wībhar, Saphran, Pāṭari, Ṭī-Ṭeras, Hoṭ-Bāṭh,
  Ālph-Hēḍ) and west round (Gārḍan, Qorī, Ōrcharḍ, Lōṭas, Phish-Mārkiṭ, Siṭāq); Phēr's north-west round (Qōqō, Nēṭ,
  Malbari, Hāibh) and north-east round (Māuṭh, Ōlḍ-Thalaba, Ḍāiyar). **The fair's launches** (`T.loops`, two days a
  week) loop the north shore's towns to Phēr and back.
- **The faith**: every town has a temple of the Decree (LORE.md 6.13, the Broken Wheel) by its landing and a wayside
  shrine on each terrace stair (`xa_wayside_shrine`, the kit's gap closed in wave 0.1).
- **Electric light** (the owner, 2026-11-16): "elsewhere in Xanadu only the major avenues of large settlements, for
  defense, and in the richest of homes". **No lake town is lit** (`T.lit` lists none of them): lamps are oil and candle.
  *Proposed:* Ālph-Hēḍ and Phish-Mārkiṭ, the two of 4,000, are left unlit too until the owner says otherwise.

## 3. The target (`settlements/xanadu-lake`, on Xanadu's page)

Built as Phēr and Qiblai are: `settlements/xanadu/build.py --kit settlements/xanadu-lake`, with core/city sealed in one
closure (`gen/69p-kcity-bundle.js`, generated at every build as `settlements/pher/build.py` does). **One page**,
`dist/xanadu-lake.html`, holds the twenty towns' records and draws the town its query names: `?town=<key>` (the default
`mouth`, the first built). The records are small; the page's size is the kit's, as Phēr's is.

| Fragment | Tag | What |
|---|---|---|
| `targets/town/89zl-xl-specs.js` | `[G data]` | `XL.SPECS[key]`: each town's design row (section 4), keyed by its tune key. It never copies a tune number: people, px, trade, hub and province are read from `XAN_TUNE.lake` in place; the node test holds every key to a tune record |
| `targets/town/89zp-xl-site.js` | `[G data]` | The ground in closed form, as Phēr's `89zp-ph-site.js`: `xlH(key, x, z)` (the shore on the town's bearing, the beach or shelf, the terrace benches up the wall, the streams' ravines), `xlWorldFrame(key)`, `xlShoreZ(key, x)`, `xlStream(key)`. Each town's parameters (its shore bearing, its wall's rise, its benches) are fitted to its region's `WORLD.H` at its px by `tools/fit_lake_town.py` (*proposed*, written in L0), so the page's ground and the world's agree at the band |
| `targets/town/89zq-xl-plan.js` | `[G data]` | One `KCITY.create` instance a town (`rand:'krand'`, `index:{order:'insertion'}`): steps 0-5 from the spec (the landing, the quay and the market as the civic set; the temple; the governor's house; the shore road as the main street; the terrace stairs as side streets on the slope rule), steps 6-12 the defaults with the Xanadu `TUNE`; the trade's works on lots its rules ask for (section 5) |
| `targets/town/90q-xl-world.js` | `[web]` | The town's world frame and the lake's surface (core/water) at -520 m in its frame |
| `targets/town/90r-xl-build.js` | `[web]` | Draws the plan's records with the kit (`XAK` through the page), the terraces' fields, the quays and stairs |
| `targets/town/90s-xl-boats.js` | `[web]` | The dugouts at the landing and on the water, the launch, the market boat, from `extra/88d-xa-lakecraft.js` |
| `targets/town/91z-views.js` | `[web]` | Each town's views (the overview, from the water, the market, the terraces) |
| `tests/test-xl-towns.js` | node | Every spec key a `XAN_TUNE.lake` record and every lake record but Phēr a spec; the census of the plan's houses against the tune's people (section 6); `tools/ktest.js` (`T.ok`, `T.neg` with a fault and a fix) |
| `tests/test-xl-site.js` | node | The ground: dry above the level, the shore within 50 m of the region's, the benches level, no step at the band |

`kit.json` lists, as Phēr's does, the opt-in pieces read in place until the all-builds rebuild folds them into the kit's
`src/`: `kits/xanadu/extra/69dz-ix-xanadu-extra.js`, `88c-xa-caravanserai.js`, `88d-xa-lakecraft.js`, `88e-xa-stall.js`,
`88f-xa-harbour.js`, `88g-xa-works.js`, and `kits/xanadu/src/87k-xa-lake-trades.js`. **One caravanserai**: the lake
towns that want one take `xa_caravanserai` (`extra/`), not 87k's `xa_serai` (BUILD-OUT question 12 is still the owner's;
until then the lake towns use only the one).

**In the open world.** `core/world/bake_towns.py` gets one `closed` entry a town (generated from `XAN_TUNE.lake` and the
specs, not written by hand: *proposed*, the entry's `args: [key]` passed to `xlH`), and the town tile bake reads the page
with `?town=<key>`. `openworld/xanadu-lake-shore` and `openworld/xanadu-north-shore` list their towns under `towns`, as
the north shore lists Phēr: inside a town's footprint the world takes the town's ground, the band eases back to the
world's, and the tile draws the streets and buildings (`core/world/88-world-towns.js`).

## 4. A town's spec (the design row)

```
XL.SPECS[key] = {
  key,                      // the tune key; the town's id is 'lk.' + key
  bearing,                  // degrees: the direction from the town to open water (the region's shore, fitted in L0)
  shore,                    // core/coast class at the landing: 'sand' | 'shingle' | 'shelf' | 'cliff' | 'marsh'
  wall: {rise, benches},    // the caldera wall behind: metres to the rim within 7 km, and the terrace benches' count
  quarters: [{id, role, share, at}],   // the town's districts (each town's plan, section 3): role from core/city's
                                       // roles; share of the houses; at: 'shore' | 'slope' | 'bench' | 'stream'
  landmarks: [{id, key, at}],          // the temple, the governor's house, the market hall, the trade's great works
  works: [{key, n, at}],               // the trade's pieces (section 5) and how many
  craft: {dugouts, launches, barges},  // at the landing
  wealth: [poor, mid, rich],           // shares of the houses (the default .55, .35, .10)
  andean: share,            // the share of the houses in the Andean set (87b), as Phēr takes (default .25)
  ruins: null | {...},      // Ōlḍ-Thalaba's old town (core/ruins)
  notes
}
```

The houses are one a household (5.5 people, `T.farm.hh`): a town of 1,800 has about 330. The wealth shares, the Andean
share and the quarters are *proposed* in each town's plan.

## 5. The kit pieces a lake town draws

From the kit (`kits/xanadu/src`):
- **Houses**: `xa_poor_a/b/c`, `xa_mid_a/b/c`, `xa_rich_a/b/c`; the Andean set `xa_andean_poor/mid/rich` (87b, the
  Palopó shop-house among them); the Turkish houses and shops (`xa_house_turk_a/b`, `xa_shop_turk_a/b`) for the market
  street.
- **The water**: `xa_quay`, `xa_boatshed`, `xa_warehouse`, `xa_lighthouse`, `xa_bridge` (87c); `xa_fish_racks` (87k).
- **The town**: `xa_temple` (77), `xa_shops` (75), `xa_teahouse`, `xa_bath`, `xa_watch`, `xa_granary`, `xa_workshop`,
  `xa_smithy`, `xa_farm`, `xa_farmhouse`, `xa_watermill`, `xa_windmill`, `xa_lane`, `xa_garden`.

From `extra/` (opt-in, read in place): `xa_dugout`, `xa_launch`, `xa_lake_barge` (88d); `xa_stall` (88e);
`xa_harbour_quay`, `xa_mole_run`, `xa_river_span`, `xa_slip`, `xa_harbour_warehouse`, `xa_drydock`, `xa_garden_wall`
(88f); the works (88g): `xa_kiln_yard`, `xa_dye_works`, `xa_loom_house`, `xa_saffron_house`, `xa_apiary`,
`xa_reeling_house`, `xa_mat_shed`, `xa_quarry_yard`, `xa_sulfur_works`, `xa_customs_house`, `xa_fishponds`, `xa_slipway`,
`xa_mine_head`, `xa_placer_sluice`, `xa_wayside_shrine`; `xa_caravanserai` (88c). From 87k: `xa_tea_factory`,
`xa_fermentary`, `xa_latex_house`.

**Missing, named** (each town's plan says which it wants; none blocks a town, each draws a stand-in until it lands, in
`kits/xanadu/extra/` as wave 0.1's pieces did):
- **a landing stair** (`xa_ghat`, *proposed*): the broad stone stair from the quay into the water, its steps under the
  level, where the dugouts are drawn up and the washing is done. Every town has one; today the quay's edge stands in;
- **a net loft and net frames** (`xa_net_loft`): Nēṭ, and one in every fishing town's lane;
- **a timber yard and saw pit** (`xa_timber_yard`): Boṭ-Yārḍ;
- **an orchard plot** (`89-xa-trades.js` lists it as a gap): the trees are land (core/hamlet's `14-hamlet-farmland.js`
  lays them on a hamlet; a town's terraces need the same on its benches): Gārḍan, Ōrcharḍ, Qōqō, Malbari's mulberry;
- **a clay pit** (`xa_clay_pit`): Pāṭari (`kits/islanders` has one: its shape, not its dress);
- **the governor's house** (`xa_governor`): a lake town's head is the Sultan's man; today `xa_rich_c` with the watch beside
  it stands in.

## 6. What the verify checks (every town, `verify.py --assert ?town=<key>`)

- the page's own (core/verify's universal checks, the GPU lane, the budgets);
- **the footprints**: exact overlap none, nothing on a street, in the lake or on a stair; every lot on its quarter;
- **the shore**: the quay and the landing stair at the water's edge (within 2 m of the level), every dugout afloat or
  drawn up on the stair, no building below the level;
- **the terraces**: each bench level within 0.5 m, its fields on it, the stairs joining them;
- **the trade**: the town's works present in the numbers its spec asks;
- **the census**: houses x 5.5 within 10 % of the tune's people; the crews' works present (`lk.<key>.fishing` has its
  boats, `.terraces` its benches, `.<good>` its works);
- **the world**: the page's ground against the region's at the band (the bake's check, `bake_towns.py --check`);
- `core/ruins` on Ōlḍ-Thalaba's old quarter (nothing floats, every wreck on its lowest points).

## 7. Core adoption (write in full before the first fragment; `tools/check_core_use.py` before calling a step done)

| Need | Module | How |
|---|---|---|
| The ground at 1:1 | `core/world` (`WORLD.H`) | The region's ground fits each town's closed-form ground (`tools/fit_lake_town.py`, L0); `bake_towns.py` carries it back |
| The shore | `core/coast` (`KCOAST`) | The town's coast class at its landing (`coast:<class>`), read from the region's field when L0 fits the town |
| The lake and streams | `core/water` | The lake at -520 m; the streams' beds from `rivers.json` (the Qol Siṭrīm at Malbari, the Ālph at Hoṭ-Bāṭh, the Swīṭ Siṭrīm by Qōqō, the two wadis at Siṭāq) |
| The streets and lots | `core/city` (`KCITY`), `core/space` (`KSPACE`) | One instance a town, sealed as Phēr's; no spatial hash or occupancy grid of the town's own |
| Placement | `core/rand` (`KRAND`), `core/tags` | Every lot, boat and stall seeded from (world, town key, cell, index, salt) with `KRAND.child`; registered before it is drawn |
| Masks | `core/mask` (`KMASK`) | The terraces' and the reed beds' masks; never `getImageData` |
| The buildings | `kits/xanadu` | Section 5, through the page |
| The ruins | `core/ruins` (`KRUINS`), `KRUBBLE` | Ōlḍ-Thalaba's old quarter: `KRUINS.watch` on each wreck, the rubble as KRUBBLE heaps |
| Interiors | `kits/interiors`, `kits/catalog` | The Xanadu culture's rooms (`87k1-xa-lake-rooms.js` for the trades); furnished as Phēr is |
| The sky and hour | `core/atmos`, `core/host`, `core/door` | Through Xanadu's build |
| Life | `core/charactermodels` | The lake Xanadui, the boats' crews; numbers from the tune's census |
| The economy | `core/region` | `XAN_TUNE` read in place, never a copy |

## 8. Textures

From the library and the kit: the Xanadu kit's own families (`xanadu.tex.*`), `roof.thatch.reed`, `ground.reedbed`,
`card.reed`, `rock.wet.dark`, `stone.cut`, `ground.shingle`, `ground.lakebed.algal`, `ground.sinter.opaline`,
`rock.hewn.drillmarked`, `ceramic.terracotta`. Owed already: `ground.dyeworks` and `ground.sulfur.crust`
(`core/materials/PROMPTS-NEEDED.md` section 58). **New, added to PROMPTS-NEEDED.md section 59**: `stone.ghat.wet` (the
landing stairs' wet band, every town), `ground.sherds` (Pāṭari's kiln yards). Until each lands the town draws the stand-in
its row names, and says so in its `KNOWN_ISSUES.md`.

## 9. Pins (the scale-model queue: listed here, not edited on the model)

The towns are `model: false` sites in `openworld/SITES.json` (or none yet): the region cuts them from their own px. *Proposed*
for the queue's next records-only batch, so the scale model shows them: **nineteen town pins** (every town above but
Ōlḍ-Thalaba, which is `soldthalaba1` already), type `town`, at the tune's px, polity the Sultanate, with their SITES.json
ids reused as the pins' ids (`sxanlk*`, `sxanmouth01`, `sxandyer01`, and four new: `sxanlkhive01`, `sxanlkmulberry01`,
`sxanlknet01`, `sxanlkcocoa01`). No town needs a terrain edit: every shore cell is dry with the lake beside it on the re-run
model. Two want a landform record on the region (`core/world/41l-world-landforms.js`, not a model edit): Siṭāq's stack and
Lāiṭ-Hāus's reef (the isles' plan).

## 10. Steps (sessions; the order across Xanadu is BUILD-PLAN.md)

| Step | What | Done when |
|---|---|---|
| **L0** | The target: the build, the fragments of section 3, `tools/fit_lake_town.py`, the tests; **Māuṭh** as the first town (the plan's whole round, its region tile) | `verify.py --assert ?town=mouth` on the GPU lane; `bake_towns.py mouth --check`; the north-shore region draws it |
| **L1** | The north-east round: Ōlḍ-Thalaba (with its ruins), Ḍāiyar | each verified; the region draws all three |
| **L2** | The north-west round: Qōqō, Nēṭ, Malbari, Hāibh; their four sites and corridors added to `openworld/SITES.json` (region `xanadu-north-shore`) and the region re-cut | the region holds seven lake towns and Phēr |
| **L3** | Erehwon's south-east round: Boṭ-Yārḍ, Wībhar, Saphran, Pāṭari, Ṭī-Ṭeras, Hoṭ-Bāṭh, Ālph-Hēḍ | each verified; `xanadu-lake-shore` draws them |
| **L4** | Erehwon's west round: Gārḍan, Qorī, Ōrcharḍ, Lōṭas, Phish-Mārkiṭ, Siṭāq | each verified; the region draws all thirteen |
| **L5** | Life and interiors: the crowds by the tune's census, the market days, the trades' rooms | the life checks as Phēr's |

L1 to L4 are a session each (est.); each town's plan says what is its own. The missing pieces (section 5) land in L0 to
L4 where their first town needs them.
