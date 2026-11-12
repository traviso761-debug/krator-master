# The Oidong Valley and the High Rift: the plan

`openworld/PLAN-SITES.md` is the plan for every site; `core/simulation/PROPOSAL-LONGSONG-PINNACLE.md` (the owner's answers
of 2026-11-11, its section 6) is why this region exists. This file says what the region takes, what it plans, and what is
left.

**The owner's decisions (2026-11-11):**
- Longsong moves onto the open world's ground, in a region cut from the Oidong Valley and the High Rift out of the
  1,740 km `openworld/xanadu-oidong-highrift`.
- Longsong is fed by its own valley: its ring grows from 3 to 15 hamlets (12 farming, 2 herding, 1 silk and paper).
  Caravans carry only salt, iron, tea and gold in, and books, paper, silk, saffron and lenses out.
- The Order's house at the Singing Gjár: ~350, with two monastic work camps (the Beck Fields, the Vein Camp).
- The grant of fealty to the Sultan, answered by the grants of esteem: a fixed yearly exchange, never priced.
- The Order does light crafting for its own upkeep and very specialised relic crafting, but **no heavy industry**
  (the owner, 2026-11-11).
- **One or two accessory monasteries** where the ground is strategic or very productive (the owner, 2026-11-11). This
  plan proposes two (section 3).

## Core adoption

| Module | Use here |
|---|---|
| `core/world` | the runtime; `KSITES` (`48s`) plans the sites, `bake_sites.py` bakes them, `88s` draws them; the resources census and panel (`49r`, `89r`); the propose-a-site tool (`93`) |
| `core/rand` | every seed: the flora by cell; each village and house seeded from the world and its id (`KHAMLET`) |
| `core/space` | the villages' and houses' boxes (`KHAMLET.village`) |
| `core/tags` | every village, house and building registered before it is drawn |
| `core/hamlet` | the 15 villages of Longsong's ring and the work camps (the `xanadu` row); the Order's houses (a new `order` row) |
| `core/city` | its primitives only (`KCITY.prim`: a village's search for its ground and its frontage runs) |
| `core/biome` | the kits' plants and their placement |
| `core/terrain` | the relief noise under `WORLD.H` |
| `core/atmos` | the sky and air |
| `core/water` | the rivers and lakes (Verdigris Beck, Lake Verdigris, the Caldron) |
| `core/materials` | the kits' library packs; the Xanadu building kit's (settlements/xanadu's pack, the village families) |
| `core/clock`, `core/shader` | the world's clock; the shader hooks |
| `core/simulation` | through `core/region` (section 6): Longsong's valley economy, the outpost's, the fixed fealty |

Not taken, each with its reason:

| Module | Reason |
|---|---|
| `core/camp` | no bands planned here yet (the Fellgangs' summer camps are a later pass: `biomes/highrift/PLAN.md` section 7) |
| `core/mask` | nothing is placed from a mask |
| `core/host` | the world has its own camera and probe (`core/world` 90, 91) |

## 1. The cut

`openworld/SITES.json` region `oidong-highrift`: two model regions (the Oidong Valley `rmuklrcae6jb5`, the High Rift
`rmvhighrift100`) and four sites' squares, cut on map 5.1 by `tools/scale-model/cut_site.py oidong-highrift`.

- The box is px 986..1636 x 1554..1714: **1,302 x 322 km** at the model's 500 m cells (4x upsampled), the frame's
  origin at px 1311,1634.
- It holds the Mirror Graben, Verdigris Beck from its source to Oidong's lakes, and the graben staircase whole, so the
  outpost's grain trade stays inside it. No corridor is needed: the two polygons meet at px 1294..1307.
- Three of the sites are not on the scale model's list yet. `cut_site.py` takes a SITES.json row with `"model": false`
  and its own pixel. They go on `tools/scale-model/model/src/60-settlements.js` once the open-world sites session's
  Qiblai move has landed (that file is being edited there).
- Inside the cut but not planned here: Strongbow (an arcology on the model's list, px 1026,1594, in the Oidong Valley).

## 2. Longsong and its ring

Longsong (`sq80bzd7ep`, px 1226,1626; 2,076 m, Csa, 988 mm, +11 °C) stays `settlements/longsong`'s page. The region
plans its countryside: **15 villages on core/hamlet's `xanadu` row**, 3 to 12 km out, a day's walk, so the harvest
labour the house calls on can come in and go home.

| Village | Focus | Ceiling | Where |
|---|---|---|---|
| Shar, the east village | farming | 220 | the page's own spot (760, 60 m) |
| Nub, the west village | farming | 220 | the page's own spot (-880, 60 m) |
| Dzo-ling, the herders' village | ranch | 160 | the page's own spot (480, 650 m) |
| Lho, Jang, Dongkar, Serpo, Tsomo, Chumig, Ngonpo, Ribo, Shingkha, Nyima | farming | 240 each | a ring 3.5 to 9 km out (bearings in `src/48-world-site.js`) |
| Drok-ri, the high pastures | ranch | 160 | 12 km up the valley side |
| Dar-ling, the silk and paper village | silk (new focus) | 160 | 5 km down the valley, by water: mulberry, the silk house, the paper mill |

About 3,250 people in the ring; with the house (1,344), the valley holds about 4,600. A road from each village's lane end
to Longsong (`road.join`: they share trunks).

**The page reads the plan** (step 4): `settlements/longsong/build.py` takes the region's baked ring (census, focus,
distance, bearing) as data. The page still draws only its three near villages (its ground is 1.6 km round); the ring's
census, the tithe and the caravan read the whole ring. `F.HOUSE.residents` becomes 1,344 (it was 550, the old "about
200 monks" blueprint).

## 3. The Order's houses in the High Rift

Each house is a village on a new core/hamlet row, **`order`**: the History Monks' house in the Xanadu building kit's
pieces. It has a chapter house (`xa_monastery`), a chapel (`xa_temple`), dormitories, a refectory and granaries. Its
works are the Order's: the scriptorium and the listening hall, the lens house, the relic works, and a smithy for upkeep.
There is no mill, furnace or foundry: the Order has no heavy industry.

### 3a. The Singing Gjár (`ssinggjar01`, px 1572,1643; 3,683 m, Dsb, 220 mm, +2 °C)

The house of ~350 beside the faith's pilgrimage site (LORE.md 6.13: the Gjár is the Decree's holiest place outside
Qiblai). Its purpose, confirmed by the owner (2026-11-11: "keep as proposed"):
- a **listening house**: the singing heard and recorded;
- the **crystal works** for Longsong's lens house;
- the peace of the vugs (the Fellgangs' offerings are not taken; the Vein Camp works only fissures that no longer sing).

| Part | Row, focus | Ceiling | Where |
|---|---|---|---|
| The house | `order`, monastery | 350 | on the plateau's lee at the gjá's lip |
| The Beck Fields | `xanadu`, farming | 90 | down the beck below the plateau (barley terraces on the beck's water, the vent's warm ground, the yaks) |
| The Vein Camp | `xanadu`, mine | 50 | the dead fissures north-east of the gjá (optical quartz, chalcedony, sulfur, copper salts, trace gold and silver) |

### 3b. The Mirror Grange (`smirrorgrange01`, px 1430,1644; 2,952 m, Dfb, 439 mm, +10 °C): the productive house

On the fans south of Lake Verdigris, where the beck leaves the lake: the High Rift's mildest ground, the one place up
here a barley crop is sure. The proposal sent the outpost's last ~23 t of grain up from the Mirror's growers, paid in
sulfur, copper salts and crystal. **A grange of the Order makes that supply the Order's own**:
- a house of ~80 (`order`, monastery);
- one farming village of lay growers (~200);
- a herders' village (~150) on the graben's meadows.

It is the outpost's granary and its seed store against a bad year on the plateau.

### 3c. The Caldron House (`scaldronhouse01`, px 1366,1668; 2,614 m, Cfb, 439 mm, +9 °C): the strategic house

By the Caldron at the foot of the graben staircase, where the beck road from Longsong climbs into the High Rift past the
Opaline Cataract. Every traveller between the valley and the rift passes it.
- a hospice house of ~60 (`order`, monastery): the road's inn, its wardens and its relay of letters;
- one farming village (~150) on the Cfb shelf to feed it.

### 3d. The road

Links laid on the ground (`keep: true`, inside the cut, never along a river's bed), with the Order's rest houses every
25 km:
- Longsong to the Caldron House (~280 km);
- the Caldron House to the Mirror Grange (~130 km);
- the Mirror Grange to the Singing Gjár (~285 km).

It is a pack road for crystal, lenses, books and people (twice a summer), never for grain.

## 4. The kits

| Kit | Overlay | How |
|---|---|---|
| Oidong (`biomes/oidong`) | Oidong Valley (17,257 px of the cut) | its own `OIDONG.PASSES`, as in the Xanadu region |
| High Rift (`biomes/highrift`) | High Rift (21,261 px) | a world adapter, `src/49-world-highrift.js` (as `openworld/pinnacle/src/49-world-absav.js`). The kit has no pass table: its placement is a station function (`HRIFT.buildRift`). The adapter presents its species as floor passes on the world's fields: tussock on the cold ground, steam heath on wet and warm margins, Verdigris wort and opal cane where the world's vents and springs warm the ground. The bladed quartz (`HRIFT.combs`) needs fissure walls the world does not model, so it is not grown here |

## 5. The censuses (what the bake must show)

| Site | People (proposal) | Planned |
|---|---|---|
| Longsong's ring | ~3,250 | 15 villages |
| The Singing Gjár | ~490 (350 + 90 + 50) | 3 |
| The Mirror Grange | ~430 | 3 |
| The Caldron House | ~210 | 2 |

## 6. The simulation (phases S0 to S3; the owner, 2026-11-11: "make sure S0-S3 are implemented")

- **S0: `core/region`.** The region host is lifted out of `settlements/isle-demo/src/40-49`: places, roles, the hamlet
  wiring, herders, the money hooks and the week checks, driven by a culture tune table. The isle demo reads it in place
  and its tests come out the same; Voth's stocks proof and `test-sim.js` are unchanged.
- **S1: seasons.** Recipes, yields and herd moves read the season: one harvest at the end of summer at this height,
  stores carried through winter, the herds up to summer pasture. There is a year test at the abstract level.
- **S2: the Xanadu highland culture table.**
  - Crops: frost oat, barley, emmer, frostroot, beans and flax, from `kits/crops` `forBiome`.
  - From the herds: dzo and yak dairy, wool and dung fuel.
  - Tea, salt, paper and silk.
  - The Order's crafts: upkeep (tools mended from caravan iron, binding, the lens grinding) and relic work (gilt
    reliquaries, crystal lenses). There is no smelting and no mill heavier than the paper mill.
- **S3: Longsong on the sim.**
  - The 15-village ring, each farming village's OUT road carrying a tithe share of its grain.
  - The Order as a house that grows nothing and feeds from its mess.
  - The monthly caravan.
  - The grant of fealty and the grants of esteem: a scheduled, fixed yearly transfer both ways, never priced.
  - The outpost and the two accessory houses as dependent settlements (`parent`: Longsong), the crystal sent to
    Longsong's lens house.
  - A year's balance test.

**Built (2026-11-11):**
- S0: `core/region`.
- S1: `77-sim-6-season.js`.
- S2: `settlements/longsong/src/15-ls-tune.js`.
- S3: the tithe share and `77-sim-6-transfer.js`; `core/region/50-region-valley.js`; the year test
  `settlements/longsong/tests/test-ls-economy.js`.

The test reads this region's `plan/sites.json`, so a rebake moves it. See `core/simulation/PROPOSAL-LONGSONG-PINNACLE.md`
section 4, "Done".

## Open

- Settled (the owner, 2026-11-11: "keep as proposed"): the Singing Gjár's purpose (the listening house, the crystal
  works) and the two accessory houses (3b, 3c).
- The three off-model sites onto the scale model's list, after the Qiblai move lands.
- The xanadu-oidong-highrift region still plans Longsong's first three villages. When that region is recut, drop
  Longsong from it.
