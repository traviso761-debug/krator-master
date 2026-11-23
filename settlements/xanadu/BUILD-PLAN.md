# Xanadu: the build plan to built, and Xanadu as the next region on the vertical stack (2026-11-22)

The owner, 2026-11-22: *"get the xanadu region and its built structures to close to completion then extend the framework
i've been building with Gemini (branch vertical-stack) prior to an all builds rebuild"*. This plan orders every piece of
Xanadu work left into sessions, in that order: **A** Xanadu close to complete, **B** the vertical stack extended with
Xanadu as its next region, **C** the one all-builds rebuild (the owner's; no Xanadu session runs it). It replaces
`BUILD-OUT.md` section 3's waves (that file keeps the inventory's history and the owner's answers of 2026-11-16).

Plans only: no page is built from this file. Every session count is an estimate (est.). Everything not from the owner, the
lore or the tune is *proposed*.

## 0. The owner's answers (2026-11-22, this plan's batch)

1. **The lake towns** are drawn by **one shared target and by the regions** ("Shared target + regions"):
   `settlements/xanadu-lake`, one page showing any town (`?town=<key>`), the regions drawing the same records at 1:1.
2. **The six provinces without a region** (Bhēl, Qāṭarāq, Gōlḍ-Mārch, Siqārp, Ōpal-Bhālī, Mārchiz) **wait for the
   vertical stack** ("Wait for the stack"): they are cut on the stack's terrain, and what stands on them is placed then.
3. **The stack's Xanadu slice is the Lake Shore with Erehwon** ("Lake Shore + Erehwon"): `openworld/xanadu-lake-shore`,
   the lake, the shore towns' band edges, Erehwon and its ring, in Godot.
4. **Four defaults taken**: the gold mines are **Kōlḍ-Lōḍ** (Opal Valley Mines keeps its name); **Theodiga's ring is four
   villages** in scrap Xanadu's poor tier; **the Marches' two forts are one plan**; **the countryside is sampled** near the
   camera in every province region. (The fourth question's text said the forts at size `march`; the fort asset's size for
   the Marches is `watch`, and the plan uses it: `settlements/marches/PLAN.md`, the top.)

Earlier answers that still bind (BUILD-OUT section 5, 2026-11-16): lake towns over 500 laid out in full; one open-world
region per province; the Lake Shore region cut (done); the tune's missing records added (done: the rings of Thalaba and
Lāiṭwāl, Grēṭ-Āil's villages, the Flashing Eye).

## 1. The inventory (this line, `claude/openworld-sites-24defd` at 793e280e2, 2026-11-22)

Every place `XAN_TUNE` holds and BUILD-OUT section 1 lists. **Owned**: a session or plan of its own keeps it (listed, not
planned here). **New here**: planned by this plan's files.

### 1a. Owned by their own sessions (listed only)

| Place | Id | People | State | Its plan or session |
|---|---|---|---|---|
| Erehwon (Erewhon) with the Citadel and the Pleasure Dome | `s57bkv9741`, `xan.citadel`, `xan.dome` | 25,000 (+1,200, 260) | built at the old site; the re-seat to 841,1517 and the port to core/city owed | `settlements/xanadu` (`erewhon`), `citadel/`; the Erewhon session |
| Qiblai, with its ring and 128 temple estates, the oil field and Yuni's mission | `skm4jjo2vl`, `geo.oilfield`, `yuni.mission` | 14,700 + 300 + 340 | built (page; region ring) | `settlements/qiblai`; the Qiblai session |
| Theodiga | `s4zvgepuru` | 6,000 | built (`kits/ancients --target theodiga-today`); redesign open | `settlements/theodiga`; the Theodiga session |
| Strongbow | `sfgtxw10kr` | 4,000 | in progress: `claude/keen-swanson-68a311`, 37 ahead, unmerged | its session |
| Kirstabal, with its ring and the Lower Lake's seven villages | `sl758m2396`, `ks.ring.*`, `ll.*` | 3,000 + 865 + 6,700 | built (page; the villages as hamlets in `xanadu-oidong-highrift`, K6) | `settlements/kirstabal` |
| Phēr, with its ring | `xan.pher` | 6,000 + 1,440 | built (page; ring in `xanadu-north-shore`) | `settlements/pher` |
| Lāiṭwāl, with its ring | `slaitwal0001` | 5,000 + 845 | built (page; ring in the region) | `settlements/lightwall` |
| Thalaba, with its ring, the Thalaba road's hans and the Qol halts | `xan.thalaba` | 2,400 + 654 | built | `settlements/thalaba` |
| The Rare Devisers' camp; the Dalab party | `exp.godshearth`, `exp.dalab` | 150; 40 | planned (the camp a region site) | `settlements/devisers-camp` |
| Strongwall and its six watch posts | `sxan7r1sln` | 250 | in progress: the fort asset and its sheet merged, 1 ahead; the fort on the world (S1) open | `settlements/strongwall` |
| Gihon (was Ōpal-Māuṭh), the Landing, the Ālph hamlets | `ll.opal-mouth`, `ll.landing` | 8,500, 2,500 (designated) | in progress: the Gihon session, started 2026-11-22 | `settlements/gihon` |
| The House of the Tempest | `xan.tempest` | 600 | planned: blueprint merged, no page | `settlements/strongwall/tempest` |
| The Beacon and the beacon fort | `xan.beacon`, `march.e` | 300 + 150 | planned: plan and blueprint merged, no page | `settlements/beacon` |
| Viridian (the Order of Viridian Thought) | `qb.viridian` | 400 | built (page); 3 ahead on `claude/viridian-plan-134f8b` | `settlements/viridian` |
| The Azure Dream (Grēṭ-Āil) and its three villages | `lk.great-isle*` | 304 + 600 | built (pages) | `settlements/azure-dream` |
| The Flashing Eye | `xan.flashingeye` | 320 | built (page) | `settlements/flashing-eye` |
| Nulab, Blakhed, Ledge | | | owned (Dalab's, off the map; Ledge its own) | their plans |

### 1b. New here (planned by this plan's files)

| Group | Places | People | Plan | Ground |
|---|---|---|---|---|
| **The lake towns** | 20: Ālph-Hēḍ, Hoṭ-Bāṭh, Ṭī-Ṭeras, Pāṭari, Saphran, Wībhar, Boṭ-Yārḍ, Gārḍan, Qorī, Ōrcharḍ, Lōṭas, Phish-Mārkiṭ, Siṭāq (P1); Hāibh, Malbari, Nēṭ, Qōqō, Māuṭh, Ōlḍ-Thalaba, Ḍāiyar (P7) | 37,000 | `settlements/xanadu-lake/PLAN.md` and one `PLAN.md` a town | the two lake regions (now) |
| **The small isles** | Wesṭ-Āil, Bē-Āil, Lāiṭ-Hāus | 900 | `HAMLETS-PLAN.md` section 1 | `xanadu-lake-shore` (now) |
| **Theodiga's ring** | four villages | 865 | `HAMLETS-PLAN.md` section 2 | Bhēl (after the stack) |
| **The countryside sample** | seeded villages in every province region, never counted | (bulk) | `HAMLETS-PLAN.md` section 3 | each region |
| **The Marches' forts** | the west and south watch forts | 300 | `settlements/marches/PLAN.md` | Mārchiz (after the stack) |
| **The mines** | Kōlḍ-Lōḍ, Opal Valley Mines (two camps each) | 1,800 | `WORKS-PLAN.md` sections 1-2 | Gōlḍ-Mārch, Ōpal-Bhālī (after the stack) |
| **The Golden Tears' camp** | `exp.rift-gold` | 120 | `WORKS-PLAN.md` section 3 | `xanadu-oidong-highrift` (now) |
| **The Great Caravan's halts** | Erehwon's, Theodiga's, Qiblai's | (the caravan's) | `WORKS-PLAN.md` section 4 | Erehwon's now; the other two after the stack |
| **New, the owner 2026-11-23** | NE of Theodiga: **Klāuḍ-Ṭī** (tea, ~500, 935,1546) and **Skāi-Pāpi** (sky poppy, ~400, 967,1526); south of Gihon: **Ōpal-Phōrḍ** (the opal road's river town, ~1,500, 969,1634); S/SE of Theodiga: **Ṭeras-Hil** (~400, 902,1556) and **Gōṭ-Mesā** (~150, 900,1544); west of Phīsh-Mārkiṭ: **Wesṭ-Rōḍ** (~400, 778,1479) and **Rim-Phārm** (~400, 795,1482) | ~3,750 | `HAMLETS-PLAN.md` sections 3b-3d; `settlements/opal-ford/PLAN.md` | Bhēl and Siqārp (after the stack); Ōpal-Phōrḍ's page and the two west villages (Lake Shore) now |

**Counts.** In scope here: **35 places** (20 lake towns, 3 isles, 4 ring villages, 2 forts, 2 mines, the Tears' camp, 3
caravan halts) and the countryside sample. Before this plan: **0 planned** (3 lake towns, the 3 isles and the mines had a
cut site or a pin only), **3 sited**, **32 with a tune record or nothing**. Now: **35 planned**, 0 built. Owned elsewhere
(1a, 17 rows): **10 built** (Erehwon's re-seat still owed), **3 in progress** (Strongbow, Strongwall on the world, Gihon),
**3 planned** (the Tempest, the Beacon, the Devisers' camp with the Dalab party), and Nulab, Blakhed and Ledge.

## 2. The order

### Phase A: Xanadu close to complete (now)

| # | Session | Brief | Waits on | Est. |
|---|---|---|---|---|
| **A0** | (the owner's merges) | Land what is in flight (branches ahead of this line on 2026-11-22): Strongbow `claude/keen-swanson-68a311` 37, Ledge `claude/ledge-70af2f` 5, Viridian 3, Phēr `claude/pher-plan-55d3f2` 3, scrap Xanadu `claude/scrap-xanadu` 3, the Azure Dream 1, Thalaba 1, Strongwall 1, Gihon as it lands; every owned session carries on with its next step (1a) | the owner | |
| **A1** (**built** 2026-11-23, cloud, `claude/festive-johnson-lp780f`; GPU verify owed) | Lake towns L0 | The shared target `settlements/xanadu-lake` (fragments, `tools/fit_lake_town.py`, the tests, the `bake_towns.py` generator, `?town=`) and **Māuṭh** in full, on the north shore's region; `xa_ghat` and `xa_governor` in `kits/xanadu/extra/` | nothing | 1-2 |
| **A2** (**built** 2026-11-23, the same branch; GPU verify owed) | Lake towns L1 | Ōlḍ-Thalaba (with `core/ruins` on its old town) and Ḍāiyar | A1 | 1 |
| **A3** (**built** 2026-11-23, the same branch; GPU verify owed) | Lake towns L2 | The north-west round: Qōqō, Nēṭ, Malbari, Hāibh; their four sites and corridors in `openworld/SITES.json`, `xanadu-north-shore` re-cut and re-baked; `xa_net_loft` and the orchard plot | A1 | 1 |
| **A4** (**built** 2026-11-23, locally: six of the seven on the GPU lanes, the region drawing them; **Hoṭ-Bāṭh held**: the fit's rest grid cannot carry the inlet west of it, `settlements/xanadu-lake/KNOWN_ISSUES.md`) | Lake towns L3 | Erehwon's south-east round: Boṭ-Yārḍ, Wībhar, Saphran, Pāṭari, Ṭī-Ṭeras, Hoṭ-Bāṭh, Ālph-Hēḍ; `xa_timber_yard`, `xa_clay_pit`; the region's `towns` | A1 | 2 |
| **A5** (**built** 2026-11-23, locally: the six on the Lake Shore and Wesṭ-Āil's villages; Lāiṭ-Hāus and Bē-Āil held, too small for core/hamlet at 1:1) | Lake towns L4 and the isles | Erehwon's west round: Gārḍan, Qorī, Ōrcharḍ, Lōṭas, Phish-Mārkiṭ, Siṭāq (Siṭāq's stack a landform); the three isles (H1) | A1 | 2 |
| **A6** | Lake towns L5 | Life and interiors: the crowds by the census, the fair and market days, the trades' rooms | A2-A5 | 1 |
| **A7** (**built** 2026-11-23, cloud, `claude/xanadu-works-a7`; W2 in part; GPU verify owed) | Works W1-W3, W5 | The camp census option in core/hamlet (opt-in, negatives); `xa_stamp_mill`, `xa_sorting_shed`; both mines' camps on a sheet; the Tears' camp as a `xanadu-oidong-highrift` site; Erehwon's caravan halt; the Kōlḍ-Lōḍ rename in the tune and pin | nothing | 1-2 |
| **A8** (**built** 2026-11-23: `settlements/marches`, its verify passed on SwiftShader, the GPU run owed) | Marches M1, M3 | Both watch forts on a sheet (a build of its own, `settlements/marches`, on Xanadu's page), the three states; the pins listed | nothing | 1 |
| **A9** | Countryside H2 | The sample module (`core/world/48v`, `88v`), opt-in, on `xanadu-lake-shore` and `xanadu-north-shore` | A5 (the regions settled) | 1 |
| **A10** | (the scale-model queue) | The records-only batch of section 4 | its turn in the queue | |
| **A11** (**built** 2026-11-23: `settlements/opal-ford`, the town on its own ground, its tune record `T.opalford` and `road.ks-opalford` (hub Kirstabal until Gihon's record lands); the Iridescent Order's precinct kept clear) | Ōpal-Phōrḍ OF1 | The river town's page on Xanadu's page (`--kit`), on its own ground; its tune record and the road (the owner: records with the build) | A5 | 1 |
| **A11b** | Ōpal-Phōrḍ OF1b | The Iridescent Order's second great house at the cataract's foot (the owner, 2026-11-23: "Both are big houses", ~450, Qiblai Turquoise): its blueprint, then its records in the page's precinct (`settlements/opal-ford/PLAN.md` section 2b) | A11 | 1 |
| **A12** (**built** 2026-11-23: the sites, the cut and both villages; the ground was good, the villages' lanes wanted a link) | West villages H6 | Wesṭ-Rōḍ and Rim-Phārm on the Lake Shore region (`HAMLETS-PLAN.md` 3d, H6): two sites, the cut widened west, their hamlets | A5 | 1 |

About **11-13 sessions** (est.). **Merged on this branch 2026-11-23** (local, 2e0516bf3): A1-A3, A7, A8 and STACK-PLAN XS0 (partial), XS1, XS2, from their cloud branches. A1 first; then A2-A5 one at a time (they share the target's fragments: two writers never
touch the same files), A7 and A8 beside them (their own files), A9 after A5. **Phase A is done** when every lake town and
isle passes its verify and stands in its region, the works and forts pass on their sheets, and the owned sessions have
landed what they can without the stack (Erehwon's re-seat, Gihon G0-G3, Strongbow, the Tempest's and the Beacon's pages
as sheets).

### Phase B: the vertical stack, extended with Xanadu (section 3)

**Superseded 2026-11-22 by `STACK-PLAN.md`** (the owner: "vertical stack is done"; the stack's section 12c puts Xanadu after
Stage 8): XS0-XS2 before Stage 8 (data only), XP1-XP6 after it. The rows below are kept as first written.

| # | Session | Brief | Waits on | Est. |
|---|---|---|---|---|
| **B0** | Sync | A test branch joining `claude/vertical-stack` and the integration line; the three Xanadu region pages the stack rebuilt (its stage 3) reconciled with phase A's; the stack's tests and the Xanadu tests green on it; nothing pushed to `main` | A; the owner's word on the relief bias (section 3.3) | 1 |
| **B1** | The Xanadu slice | `xanadu-lake-shore` with Erehwon through every layer (section 3.2), web and Godot, version 1 against version 2; the report | B0 | 2 |
| **B2** | The other two lake regions | `xanadu-north-shore` and `xanadu-oidong-highrift` through the same layers, lighter (no new numbers unless they differ) | B1 | 1 |
| **B3** | The six province regions | Cut on the stack's world tiles and relief version 2: Bhēl, Qāṭarāq, Gōlḍ-Mārch, Siqārp, Ōpal-Bhālī, Mārchiz; each with its sites from `openworld/SITES.json` | B1 | 2 |
| **B4** | The held sites | On those regions: Theodiga's ring (H3) and the countryside samples (H4), the mines and their roads (W4), the Marches' forts and relay posts (M2), Theodiga's and Qiblai's caravan halts; the owned places' turns on the same regions (the Tempest, the Beacon, Viridian, Strongwall, the Flashing Eye, Gihon, Qiblai's oil field) by their sessions | B3 | 2 + the owned sessions' |
| **B5** | Interiors on the stack (*proposed*) | The stack's stage 7 (interiors I1-I4) on a Xanadu building: *proposed* a lake town's temple or the citadel's hall | B1; the stack's stage 7 | 1 |

About **9 sessions** (est.), and the owned sessions' turns in B4.

### Phase C: the all-builds rebuild (the owner's)

Not run by any Xanadu session. It takes with it, for Xanadu (TODO.md, "Ride along with the next all-builds rebuild"):
`kits/xanadu/extra/` into `src/` (69dz, 88c-88g and the new pieces of phase A); core/hamlet's Xanadu row folded from
`xanadu/23` into `20-hamlet-cultures.js`, with the camp census option; `core/tags`' culture `qiblai`; core/world's `xanadu`
style; the countryside sample module out of opt-in; `relief.micro: 2` on every Xanadu region (B's re-bakes made final);
the packing the owner picks from the stack's M1; every Xanadu page rebuilt and verified (`test_all.py --nightly`).

## 3. Xanadu on the vertical stack

### 3.1 What the stack is (on `claude/vertical-stack`, read 2026-11-22)

Gemini's stages on `GRAPHICS-TERRAIN-PROPOSAL.md` section 11, the place `openworld/oidong-highrift`:
- **0** WMICRO version 2 and the KGROUND guard (`VERTICAL-STACK-REPORT.md`): the twins, the bakes and the guard pass;
  **version 2's mean bias fails its gate** (-14.9 % of its amplitude against < 5 %; the root cause found, the constants
  not tuned);
- **1** the route harness, sampler and video-memory budgets (`STAGE-1-ROUTE-REPORT.md`);
- **2** the stream bake on 64 km world tiles (passes); the 250 m residual (T2) shelved, opt-in, inactive;
- **3** open-world light: `KHORIZON` 40 km horizon bake, `KSHADOW` on, the sky and fog by the hour; **already rebuilt on
  the branch for all seven open-world pages, the three Xanadu regions among them**;
- **4** Godot's ground: chunk normal-and-crease textures, layered ground in arrays, the 3D grass sward;
- **5** the M1 material slice (`STAGE-5-REPORT.md`): the packing recommended (Godot two maps, hemi-octahedral normals;
  the web keeps three maps) and **waiting on the owner's pick**.

Left on its plan: **6** Ancient's Valley, **7** interiors, **8** the all-builds rebuild. "Extend the framework" (the owner)
is, for Xanadu, a second place through the same layers, then the province regions cut on it.

### 3.2 The Xanadu slice (B1): `xanadu-lake-shore` with Erehwon

Why this place (the owner's pick): the lake is the stack's first large still water in Godot; fourteen settlements (Erehwon,
thirteen shore towns) give fourteen town-edge bands where version 1 left a shelf; Erehwon's citadel has the glazed tiles
whose normals band at 6 bits (stage 5's `glazed_ceramic`, the case `hemi-oct8` fixes).

| Layer | What is done on the slice | Exit |
|---|---|---|
| Relief | a test copy of the region on `relief.micro: 2`; streams on world tiles; sites and resources re-baked | bakes `ok`; band relief and bias measured against version 1 |
| Towns | every lake town's closed-form ground (`bake_towns.py`) against the region's version-2 ground at its band | no step over 0.5 m at any band; `bake_towns.py --check` per town |
| Water | the lake (-520 m) and its shore in Godot (floating-origin water, stage 3); core/water's flow foam ported to `KWater` (TODO.md, the stack's own note) for the Ālph's outflow and the Qol's mouth | the shore line agrees in both engines within a cell |
| Light | `KHORIZON` baked for the region (the caldera wall shades the south shore's towns at dawn); `KSHADOW`; the hour | the route's frame time holds |
| Godot export | the region's stream data, Erehwon's page and one lake-town tile (*proposed* Phish-Mārkiṭ: the largest, the harbour) through `core/world/94-world-export.js` (the sealed-kit-town fix of 82ca2f515 applies: XAK is a sealed bundle) | the export checks (`tools/check_godot_exports.py`) clean |
| Materials | the Xanadu kit's glazed tile families through the M1 packing the owner picks | no specular banding on the citadel's domes |
| Route | four stops for the route harness: `city_block` Erehwon's citadel, `water_ground` Phish-Mārkiṭ's quay, `forest_edge` Gārḍan's walled orchards, `door_transition` a lake town's temple door; three hours | baselines on the Arc, the RTX and in Godot |
| Shots | three cameras at 15:30 (a south-shore town under the wall, the lake from Erehwon's citadel, a town's band edge), Forward+ on the RTX lane, one web shot each | the owner's eye |

Pass: as stage 0's criteria (bakes `ok`, no seam at a band, the twins), the route inside its budgets, the owner's eye. The
report goes on the test branch (`XANADU-SLICE-REPORT.md`, *proposed*), as the stack's reports do.

### 3.3 What the stack must give first

1. **A decision on version 2's bias.** It failed its gate on oidong-highrift. Xanadu's slice measures it again on a
   second place, but no Xanadu region is re-baked for keeps until the owner (with Gemini) settles it: tune the constants
   (and say so) or accept the number.
2. **The stack joined to the integration line** (B0). The stack's branch was cut before the lake towns, Gihon and phase A;
   the Xanadu pages it rebuilt (stage 3) are stale against them.
3. **The world tiles** (stage 2) for the cuts: the province regions are cut on them so two regions over one place agree
   (the lake is shared by two regions already).
4. **The Godot exporter for a region with town tiles and a lake** (`onWater` towns): oidong-highrift's towns are not on a
   lake.
5. **The owner's M1 pick** before any Xanadu texture is re-packed.
6. **Room in the budgets**: the route harness's ceilings on a region with fourteen town tiles in view across the water.

### 3.4 What waits for the stack (held until phase B)

- the six province regions and everything placed on them (the owner): Theodiga's ring, the mines on the ground, the
  Marches' forts on the ground, the samples there, the owned places on those regions;
- any re-bake of an Xanadu region on `relief.micro: 2` other than a test copy;
- re-packing any Xanadu texture (new sets land in today's three-map packing: section 59's, 58's, 54's, 55's);
- Godot exports of Xanadu pages beyond the slice's;
- T2's residual on Xanadu (shelved on the stack).

### 3.5 What goes ahead in phase A without the stack, and stays cheap to move

The lake towns' grounds are closed-form functions fitted to the region's ground at their px: B1's re-fit on version 2
re-runs `tools/fit_lake_town.py`, not a hand edit. The sheets (mines, forts) need no ground. The two lake regions are
re-baked once more at the rebuild anyway. Nothing in phase A adds a core/world feature that is not opt-in.

## 4. The pins (one batch for the scale-model queue; listed, not edited)

Records-only, through the queue's owner (the scale-model session), on the integration line's model:
- **7 new pins** (the owner, 2026-11-23): Ōpal-Phōrḍ (`sopalford01`, town, 969,1634), Klāuḍ-Ṭī (`steabench01`, village, 935,1546), Skāi-Pāpi (`sskypoppy01`, village, 967,1526), Ṭeras-Hil (`sterrhill01`, 902,1556), Gōṭ-Mesā (`sgoatmesa01`, 900,1544), Wesṭ-Rōḍ (`sxanwestroad01`, 778,1479), Rim-Phārm (`sxanrimfarm01`, 795,1482);
- **22 lake pins**: nineteen towns (`settlements/xanadu-lake/PLAN.md` section 9: every lake town but Ōlḍ-Thalaba, which is
  `soldthalaba1`), three isle villages (`HAMLETS-PLAN.md` section 1), ids their SITES.json ids;
- **the rename** of `smgxtultfq` to "Kōlḍ-Lōḍ" (the owner);
- **two fort pins**, `march.w` and `march.s` (`settlements/marches/PLAN.md` section 7);
- **a hot spring vent** at Hoṭ-Bāṭh (*proposed*, records-only, if the queue's vents take one).

Region records, not model edits: Siṭāq's stack and Lāiṭ-Hāus's reef (`41l` landforms); the Tears' camp as a `model: false`
site; the four north-west towns' sites (A3).

## 5. Textures

New: `core/materials/PROMPTS-NEEDED.md` section 59 (`stone.ghat.wet`, `ground.sherds`, `ground.tailings.ore`). Owed already
and wanted by these plans: section 58 (`ground.dyeworks`, `ground.sulfur.crust`), 54 (the fort), 55 (Opal Valley), 41 (the
citadel). Each lands in the library in today's packing (section 3.4).

## 6. Open, for the owner later (each with the default the sessions take)

- The proposed names of the Marches' forts (Wesṭ-Wāch, Sāuth-Wāch): *default* the tune's names.
- A `stone`, `dye` and `nets` good in the tune (Qorī, Ḍāiyar, Nēṭ): *default* none; the pages show the trades.
- One caravanserai or two (BUILD-OUT question 12): *default* the lake towns use `xa_caravanserai` only.
- The Twins pass fort and the White Gills Hermitage (BUILD-OUT question 9): *default* neighbours, left to their own plans.
- The turquoise Order's name and head house (BUILD-OUT question 4): *default* none yet.
