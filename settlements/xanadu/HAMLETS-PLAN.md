# Xanadu's villages and hamlets on core/hamlet: the isles, Theodiga's ring and the countryside (plan, 2026-11-22)

The Sultanate's places under 500 people that no session owns yet, as rows of one shared plan on core/hamlet's Xanadu row
(`core/hamlet/xanadu/23-hamlet-xanadu-row.js`, `KHAMLET.xanaduRow(opts)`, passed by name until the all-builds rebuild folds
it into `20-hamlet-cultures.js`). The order across Xanadu is `settlements/xanadu/BUILD-PLAN.md`. Plans only: nothing here
is built. Everything not from the owner, the lore or the tune is *proposed*.

Owned elsewhere and not planned here: the rings of Erehwon, Qiblai (with its 128 temple estates), Phēr, Kirstabal, Thalaba
and Lāiṭwāl (built in their regions); Kirstabal's seven Lower Lake villages (built, `xanadu-oidong-highrift`, Kirstabal's
K6); Grēṭ-Āil's three villages (`settlements/azure-dream`); the hamlets along the Ālph to Theodiga (`settlements/gihon`,
G3); Strongwall's six watch posts (`settlements/strongwall`, W0).

## 0. The owner's answers this plan rests on

- 2026-11-16: "Lake towns over 500 can be laid out in full" (so the three small isles, under 500, are hamlets).
- 2026-11-22: **Theodiga's ring is four villages** ("Theodiga ring: 4 villages": three farming villages and one salvagers'
  hamlet on the Vale floor, in scrap Xanadu's poor tier with the normal kit's farm set; the tune's records added when its
  region bakes them).
- 2026-11-22: **the countryside is sampled** ("Countryside sample": each province region draws seeded sample villages of its
  countryside near the camera; the sim never counts them).
- 2026-11-22: **the six province regions without a region wait for the vertical stack** ("Wait for the stack"). So
  Theodiga's ring (in Bhēl) and the countryside samples of those six provinces are planned now and placed then; the isles
  and the Lake Shore's and North Shore's samples go on the regions that exist.

## 1. The three small isles (`xanadu-lake-shore`, now)

Each is a `XAN_TUNE.islands` record (the tune runs each as a lake town: `lk.<key>.fishing`, `.terraces`, its hub Erehwon) and
a cut site of `openworld/xanadu-lake-shore` with no hamlet yet. The region's site spec (`src/48-world-site.js`) gets one
hamlet each, laid by `KHAMLET.village` on `KHAMLET.xanaduRow(...)` with `spec.landing` (the quay), as the Lower Lake's
villages are. The ground columns are the scale model's cell (read 2026-11-22).

| Key | Isle | px | People | Ground | Focus and row options | Its own pieces |
|---|---|---|---|---|---|---|
| `west-isle` | Wesṭ-Āil (the fishermen's isle) | 831,1499 | 400 | -420 m, flat; the lake on every side | `fishing`, `shallows: true` (the fishponds and the mat shed among the works) | the landing; boat sheds and fish racks; a wayside shrine |
| `bay-isle` | Bē-Āil (the Sultan's fishponds) | 844.1,1511.5 | 300 | -470 m, 5 %; in Erehwon's bay, 3 km off the citadel | `fishing`, `shallows: true`, *proposed* the fishponds' share raised (a `works` override passed with the row: the ponds are the isle's purpose) | `xa_fishponds` (six, stone-walled pens round the shore); the keepers' houses; *proposed* a garden for the Sultan's visits (`xa_garden`) |
| `east-isle` | Lāiṭ-Hāus (the light and the customs) | 864,1503 | 200 | -475 m, flat | `fishing` | `xa_lighthouse` (the lake's light, on the isle's high point), `xa_customs_house` (the lake's customs on what the market boats carry: *proposed*, no customs in the tune yet) |

**People.** core/hamlet lays every one in full (all three under `KHAMLET.POP_MAX`); its census at 240 a village (44
households) is the shared row's: an isle of 400 is laid as **two villages** at its two landings (240 and 160, *proposed*),
an isle of 300 as one village at `popMax: 300`, Lāiṭ-Hāus at `popMax: 200`. `test-hamlet.js`'s census check holds each to
the tune's people.

**Built and held (2026-11-23, step H1).** Wesṭ-Āil's two villages stand in `xanadu-lake-shore`'s spec on the region's fishers'
row. **Lāiṭ-Hāus and Bē-Āil are held**: at 1:1 each isle is too small for core/hamlet's village at its people (the bake could
not place 18 and 23 of their houses). Owed: a denser isle layout (core/hamlet's lanes packed to the shore, or the isle laid on
core/city as the lake towns are), then their villages; the light, the customs house and the fishponds with them.

**Pins and landforms** (the queue, listed only): three records-only village pins (`sxanlkwestisle01`, `sxanlkbayisle01`,
`sxanlkeastisle01`, their SITES.json ids), type `village`. **Lāiṭ-Hāus's reef**: *proposed* an `islet` landform record on the
region (`core/world/41l-world-landforms.js`), the light's rock 600 m north of the isle; a region record, not a model edit.

**Textures.** The shared lake set (`settlements/xanadu-lake/PLAN.md` section 8); `rock.wet.dark` for the ponds' walls (in the
library, wired at the rebuild with 88g).

## 2. Theodiga's ring (Bhēl, the Vale: placed when its region is cut after the stack)

Four villages round Theodiga (`s4zvgepuru`, 908,1535, 6,000, the seat of P2) on the Vale floor, tithing to it as Erehwon's
and Qiblai's rings do (PROPOSAL-XANADU section 3e: "3-4 to add at Theodiga"). The town is the Ancient arcology and its
scrap Xanadu streets (`kits/ancients --target theodiga-today`); its ring wears **scrap Xanadu's poor tier**
(`xa_scrap_house`, `xa_scrap_shacks`, `xa_scrap_farm`, `xa_scrap_granary`, `xa_scrap_store`: `kits/xanadu` 87s-87v,
`kit_bundle.bundle(scrap=True)`) beside the normal kit's farm set (`xa_farm`, `xa_farmhouse`, `xa_pens`), the salvage
dressed and on show as everywhere in scrap Xanadu ("nothing ramshackle").

| Id (*proposed*) | Village | Focus | People | Where (*proposed*) |
|---|---|---|---|---|
| `s4zvgepuru/hamlet/farm-1` | a rice village on the Ālph's flat | `farming` | 240 | 5-8 km north-west, on the Ālph's flood plain (the Ālph, `r070`, passes 4 km from the pin) |
| `s4zvgepuru/hamlet/farm-2` | a grain village | `farming` | 240 | 5-8 km south |
| `s4zvgepuru/hamlet/farm-3` | a cacao and saffron village (the Vale's crops) | `orchard` | 240 | 5-8 km east, on the first bench |
| `s4zvgepuru/hamlet/salvage-1` | the salvagers' hamlet | `mine` with `mineHead: false`, *proposed* a `salvage` focus instead (open point 1) | 145 | at the foot of the Salvage Road, 3-4 km from the bore's portal (`T.bore`), where the Salvagers who haul for the Rare Devisers live |

**Placement** as the other rings: `core/world/bake_sites.py` lays them on the region's ground from the site spec (bearing and
km, or `near`), the farm mask for the fields; `KRAND` seeds from (world, site, index, salt). The spec reaches the bake only
when the Bhēl region exists (after the stack).

**The tune.** `T.ringSites` gets `'s4zvgepuru': {site: 's4zvgepuru', prov: 'p2', y: 2.2}` when the region's `plan/sites.json`
holds the four (the owner's 2026-11-22 answer: "tune records added when its region bakes them"), as Thalaba's and Lāiṭwāl's
rings went (their people come out of P2's bulk district). `node core/region/tests/test-xan-economy.js` passes before and
after. Not added now: no region bakes them yet.

**Pins.** None (rings are baked by the region, not pinned).

**Textures.** Scrap Xanadu's own (`kits/xanadu/materials.json`, its 87s families); nothing new.

## 3. The countryside sample (every province region)

The provinces' countryside (`prov.p1`..`prov.p8`, about 290,000 people in bulk) is one record each and never drawn singly
(PROPOSAL-XANADU 3e). **Each province region draws a seeded sample of its villages near the camera** (the owner,
2026-11-22), so the land between the named places is lived in.

- **Where.** On the region's farm mask (`core/mask`), outside every site's square and corridor, at least 2 km from any
  drawn place and from each other. *Proposed* density: the province's bulk villages at its real density (people per
  km² of farm mask / 240), thinned to one in four for the frame budget.
- **What.** `KHAMLET.village` on `KHAMLET.xanaduRow({shrine: true})`, each village's focus drawn from its province's
  land (`T.provinces[p].extra`, weighted by the make): P1 `farming`, `orchard`, `silk`; P2 `farming`, `orchard` (cacao),
  `saffron`, `tea`; P3 `farming`, `orchard`, `ranch` (dairy), and the lumber camps of the Cataracts' timber (the shared row's
  lumber focus is not Xanadu's: open point 2); P4 `ranch`, `mine` (the copper band); P5 `tea`, `orchard`, `farming`; P6
  `farming`, `ranch`; P7 `farming`, `silk`, `orchard`, and `farming` with the apiary; P8 `ranch`, `farming`.
- **Seeds.** `KRAND.child(world, 'prov.' + p, cell)`: a village's existence, focus and layout from (province, cell), never
  from how many came before it. The same camera at the same place draws the same villages in both engines.
- **Streaming.** A village is laid when its cell comes within *proposed* 6 km and freed beyond 9 km (as the towns' tiles
  load, `core/world/88-world-towns.js`, but laid live, not baked). The plan stays `[G data]`: a pure function of (province,
  cell) Godot can run.
- **The sim never counts them** (the owner). The verify checks that no sample village stands on a site's square, a road
  or water, and that the sample's people near a seat stay under the province's bulk.

**Code** (*proposed*): `core/world/48v-world-sample.js` `[G data]` (the cells, the seeds, the focus by province) and
`88v-world-sample.js` `[web]` (laying and drawing near the camera); a region opts in with `region.json` `sample: {prov,
culture: 'xanadu'}`. A core/world change reaches every open-world page: it lands with the all-builds rebuild (opt-in until
then, `TODO.md` "Ride along"), first on the two regions that exist (`xanadu-lake-shore` P1, `xanadu-north-shore` P7).

## 3b. The new villages NE of Theodiga (the owner, 2026-11-23; placed when Bhēl is cut after the stack)

The owner, 2026-11-23: *"we could also stand to put a settlement or two NE of theodiga (in the empty region near the viridian
monastery)"*; asked the same day, the owner chose **"Tea + poppy villages"**, their economy records added **with their build**.
The country between Theodiga (908,1535, the Vale floor at -500 m) and Viridian's estate (962,1562, 813 m) climbs east into
the scarp and a high plateau (2,200-4,000 m) with almost no perennial water off the Ālph: rain-fed, as Viridian's tea is.

| Id (*proposed*) | Village (*proposed* name) | px | Ground (the model) | Focus | People | Tithes to |
|---|---|---|---|---|---|---|
| `s4zvgepuru/hamlet/tea-bench` | **Klāuḍ-Ṭī** (Cloud Tea): a tea-terrace village on the bench | 935,1546 | 1,658 m, 3 % over its cell, a level bench; 26 km east of Theodiga, 40 km from Viridian; mist and rain like Viridian's (no river within 12 km: cisterns and the springs at the bench's foot) | `tea` (`KHAMLET.xanaduRow`: farmsteads and the tea factory) | ~500 (two villages' census, or one at `popMax` 500) | Theodiga (P2, Bhēl); its tea down to Theodiga's market and on to the lake by Ṭī-Ṭeras's road |
| `s4zvgepuru/hamlet/sky-poppy` | **Skāi-Pāpi** (Sky Poppy): a poppy-growers' and herders' village on the plateau | 967,1526 | 3,583 m, 3 %; a wadi (the Kilīā Ḍrāi, `r770`) 1 km off | `farming`, its fields sown with the sky poppy (`T.goods.opium.crop`, `sky-poppy`), and a latex shed (`xa_workshop` stands in); *proposed*: a `poppy` focus on the Xanadu row at the rebuild | ~400 | Theodiga; its latex down to the Vale's opium (P2's `extra.opium`), lanced in the dry season's end (`T.calendar` `lancing`) |

**Why these two:** P2's land already makes tea (60 t) and opium (150 t) in bulk (`T.provinces` p2 `extra`); these are the
named villages of that make on the ground the region shows empty. **Their records** (with their build): two rows of a
Theodiga ring entry (`T.ringSites['s4zvgepuru']`, section 2's), their people out of P2's bulk district; the sky-poppy
village's latex a road share to Theodiga. `test-xan-economy.js` passes before and after.

**Pins** (the queue, records-only): two village pins, "Klāuḍ-Ṭī" 935,1546 and "Skāi-Pāpi" 967,1526 (*proposed* ids
`steabench01`, `sskypoppy01`). **Textures**: nothing new (the tea gardens are `kits/crops` `tea` rows; the poppy fields
`kits/crops` `sky-poppy` if it is a record, else the field pass's own).

## 3c. The uplands S/SE of Theodiga (the owner, 2026-11-23; placed when Bhēl is cut after the stack)

The owner, 2026-11-23: *"we should also scope settlements S/SE of theodiga"*; asked, the owner chose **"Bench village + mesa
herders"**. The Ālph's gorge falls south of Theodiga from -500 to -1,500 m toward Qiblai's lake; its floor down to the Landing
is the Gihon session's (its hamlets on the portage road, `settlements/gihon/PLAN.md` G3), so these two stand on the uplands
west of the gorge. Records with their build, as section 3b's.

| Id (*proposed*) | Village (*proposed* name) | px | Ground (the model) | Focus | People | Tithes to |
|---|---|---|---|---|---|---|
| `s4zvgepuru/hamlet/terrace-bench` | **Ṭeras-Hil** (Terrace Hill): a terraced farm village | 902,1556 | 1,011 m, 1 % over its cell, a level bench west of the gorge, 23 km south of Theodiga; relief 150 m round it; no river within 12 km (the gorge's springs, cisterns) | `saffron` (`KHAMLET.xanaduRow`: farmsteads and the saffron house: the Vale's 2.2 t of saffron, `T.provinces` p2) and grain terraces | ~400 | Theodiga (P2) |
| `s4zvgepuru/hamlet/goat-mesa` | **Gōṭ-Mesā** (Goat Mesa): a herders' hamlet | 900,1544 | 1,914 m, 2 %, the mesa's top; relief 318 m | `ranch` (the shared row's: pens, corral, dairy) | ~150 | Theodiga |

## 3d. West of Phīsh-Mārkiṭ (the owner, 2026-11-23; on the Lake Shore region now)

The owner, 2026-11-23: *"... and west of phish-markit in the hills"*; asked, the owner chose **"Both"**: a hill village where the
west road climbs out of the caldera and a farm village on the rim plain below it. Beyond the caldera's west lip a rim plain of
100-300 m runs out about 40 km to foothills at 1,100-1,600 m and the western highlands (3,000-5,800 m) behind them. Both are
P1 (Lēk-Shor), tithing to Erehwon through Phīsh-Mārkiṭ's market, and both can stand on `openworld/xanadu-lake-shore` now: two
new sites (`model: false` rows in `openworld/SITES.json`) with corridors from Phīsh-Mārkiṭ, and the region's cut widened west
(its frame's origin pinned, as the north shore's was for Hāibh, so the land already baked does not move). Records with their
build.

| Site (*proposed*) | Village (*proposed* name) | px | Ground (the model) | Focus | People |
|---|---|---|---|---|---|
| `sxanwestroad01` | **Wesṭ-Rōḍ** (West Road): the road's hill village and halt | 778,1479 | 1,593 m, 0.5 %, a level bench in the foothills; the Girīn Ḍrāi (a wadi, 7.2 m³/s) 9 km off | `orchard` (the hill orchards; laid as `farming` until the rebuild brings the Xanadu row's orchard focus) with a han's halt on the road (the road's stop, `KCAMP.halt` or a `xa_caravanserai` in its works) | 400 |
| `sxanrimfarm01` | **Rim-Phārm** (Rim Farm): the plain's farm village | 795,1482 | 105 m, flat; the Barāiṭ Ḍrāi (a wadi, 4.9 m³/s) 1 km off | `farming` (grain on the rim plain, watered from the wadi in the wet season) | 240 |

**Built (2026-11-23, step H6).** The two sites and the Lake Shore cut widened west to them are in (`openworld/SITES.json`,
origin pinned; Siṭāq's and Phīsh-Mārkiṭ's fits redone on it), and both villages stand whole at their sites' points. The survey of
the 1:1 ground found it good over both 6 km squares (KSITES.groundOk at 40 m: nothing wet, nothing out, 3 and 4 steep points of
22,801; slope 0.05 at the median, 0.11 at the 90th centile). The refusals were the village's frame, not the ground: a village set
at its site's own point (`near: [0, 0]`) has its link (the site) on its own green, so core/hamlet's lanes had no direction and
no house could front one. Each now takes `link`, its main lane pointed down the corridor road toward Phīsh-Mārkiṭ. Owed: Wesṭ-Rōḍ's
orchard focus and its han's halt (with the rebuild); the guard in core/hamlet for a link on the green (TODO.md).

**Pins** (the queue, records-only): four village pins, Ṭeras-Hil 902,1556, Gōṭ-Mesā 900,1544, Wesṭ-Rōḍ 778,1479, Rim-Phārm
795,1482 (*proposed* ids `sterrhill01`, `sgoatmesa01`, `sxanwestroad01`, `sxanrimfarm01`).

## 4. Core adoption

| Need | Module | How |
|---|---|---|
| The villages | `core/hamlet` (`KHAMLET.village`, `KHAMLET.xanaduRow`) | Every village here; no village laid by hand |
| The ground | `core/world` (`bake_sites.py`, `48-world-site.js`) | The isles' and the ring's sites; the sample live |
| Placement | `core/rand` (`KRAND.child`), `core/tags`, `core/mask` | Seeds from (world, site or province, cell, index, salt); fields on the farm mask, never `getImageData` |
| The buildings | `kits/xanadu` (with `extra/88g` and scrap Xanadu by `kit_bundle.bundle(scrap=True)`) | The row's keys |
| The economy | `core/region` (`XAN_TUNE`) | The isles' records as they stand; Theodiga's ring by `T.ringSites` when baked |

## 5. Steps

| Step | What | When |
|---|---|---|
| **H1** | The three isles in `xanadu-lake-shore`'s site spec; re-bake; Lāiṭ-Hāus's reef record | with the lake towns' L3 or L4 (the same region) |
| **H2** | The countryside sample's module, opt-in; on `xanadu-lake-shore` and `xanadu-north-shore` | after L4; before the stack's Xanadu slice, so the slice's numbers include it |
| **H3** | Theodiga's ring in the Bhēl region's spec; the tune's `T.ringSites` row | after the stack cuts Bhēl (BUILD-PLAN.md phase B) |
| **H4** | The samples on the six province regions | with H3 |
| **H5** | Klāuḍ-Ṭī and Skāi-Pāpi (section 3b), Ṭeras-Hil and Gōṭ-Mesā (3c) in the Bhēl region's spec, with Theodiga's ring; their tune rows | with H3 |
| **H6** | Wesṭ-Rōḍ and Rim-Phārm (3d): their two sites in `openworld/SITES.json`, the Lake Shore region's cut widened west (origin pinned), their hamlets in its spec, re-baked; their tune rows | now (after A5) |

## 6. Open points (each with its default)

1. **The salvagers' hamlet.** The row has no `salvage` focus. *Default:* `mine` with the mine head off, its works the
   salvagers' stores and the haul yard (`xa_scrap_store`, `xa_scrap_guild_salvage`), passed as a `works` override.
2. **The Cataracts' timber.** P3 makes 4,000 t of timber a year; the Xanadu row has no lumber focus. *Default:* the sample
   draws P3's lumber villages as `farming` until a `lumber` focus is added to the row at the rebuild.
