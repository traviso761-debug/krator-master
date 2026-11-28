# `kits/painted-men` — Rework Design Plan: The Painted Men (`Payntja-Mana`) of the Northeast Danxia & Badland Cliffs

*Status: Build-ready rework plan (`2026-11-27`), aligned with [LORE.md](../../LORE.md) §6.5, [tongues-of-krator.html](../../lore/tongues-of-krator.html) `#painted` (`Payntja-Tuka`), and the verified ecological/geological inventory of [biomes/paintedhighlands](../../biomes/paintedhighlands/PLAN.md) & [biomes/korona](../../biomes/korona/PLAN.md).*

The **`Painted Men`** (*Payntja-Mana*, speaking **Payntja-Tuka**, "Paint-Talk") are independent cliff-dwelling raider tribes holding `80%` of the `3,000–4,000 m` **Painted Highlands** (`rmvkam8s13kwu`: banded bentonite clay hills, `danxia` sandstone hogbacks, spring superbloom playas, and the `580 m`-deep `Painted Canyon` between Korona, Shade, and Pinnacle Rock).

Following the `2026-11-27` lore revamp, their legacy **Tlingit / Pacific-Northwest** formlines, totem poles, and bamboo-stilt huts migrate out (`83-pm-tlingit.js` moves to [`kits/timpar-kuran`](../timpar-kuran/PLAN.md) in the Veiled Mountains), and `kits/painted-men` is rebuilt onto **`core/engine`** around an **Australian Aboriginal (Arnhem Land / Kimberley) + Amazonian (Xingu / Kayapó)** synthesis **strictly dictated by the actual rocks, woods, fibres, and trade links of `biomes/paintedhighlands`**.

---

## 0. Plateau Material Audit: Why Zero Bamboo & Zero Fired Brick

| Resource Category | What Actually Exists in `biomes/paintedhighlands` | Architectural & Craft Consequence in `kits/painted-men` |
|---|---|---|
| **Bamboo & Tall Timber** | **`0` bamboo** on the `231 mm/yr` cold-steppe plateau (`BSk`/`Dsb`, winter `-3..-9 °C`) and **`0` bamboo** in neighbouring `biomes/korona`. Plateau rims grow gnarled **`paintedjuniper`** & **`paintedpinyon`** (`4–7 m` crooked trunks); wet seep-alcoves & lower canyon/moat walls (`800–1,113 mm` `Cfa`) grow **`paintedoak`**, **`paintedmaple`**, **willow**, & dense **mountain mahogany** (`70-biome-painted.js`). | **Eliminates all bamboo stilts and long straight log halls.** Roof spans are governed by `2.8–4.2 m` peeled juniper/oak ***viga* joists** (cellular Mesa Verde / Dogon room widths!), bent oak/juniper crucks for oval *malocas*, single-trunk **notched Dogon ladders**, and solid/hollow canyon-oak ***Pukamani* poles**. |
| **Bedrock & Clay (`clay = 0` for pottery)** | Thick hard **`danxia` sandstones** (`2–30 m` red, orange, yellow, cream beds) over soft **`badland` bentonite/ash clays** (`KSTRATA`). `CONTINENTAL-SCOPE.md` §2.3 confirms **`clay = 0` kiln-brick/pottery clay** within `20 km` of `Painted Canyon` (smectite/bentonite swells and shatters in a kiln!). | **Dry-laid & mud-mortared tabular `danxia` sandstone slabs** coated in **sun-baked polychrome `badland` clay plaster** (durable under dry cliff overhangs!). Pottery and bamboo tubes are replaced by **pinyon-pitch-sealed coiled willow water-baskets (*tus*)**, **carved oak/juniper-burl *coolamon* troughs**, pronghorn-hide bags, and raided iron pots. |
| **Thatch, Bark & Cordage** | **`Stripe bunchgrass`** (`phgrass`: `harvest: 'thatch and bedding'`), riparian **willow withes**, **`rope-puff`** fibre, peeled slabs of **canyon-oak & juniper bark**, plus **braided wild-silk** & knapped **`obsidian-pancake` glass** traded up from `biomes/korona` Station 7 (`Silkhead Gorge`). | Shaggy golden **`Stripe bunchgrass` thatch** roofs communal *malocas* and pointed Dogon talus granaries; flattened **cured bark slabs** form painted Arnhem *rarrk* screens; willow *latilla* mats ceiling stone rooms; braided willow/wild-silk cables span cliff clefts. |
| **Mineral & Plant Pigments** | Iron-oxide **`danxia` red ochre**, **`rabbitbrush` yellow/gold**, pipeclay **cream-white**, `badland` **lignite-parting / pinyon-soot black**, and rare **`celadonite-teal` clay** (`PLAN.md` §4). | Every plastered alcove facade, rock hood, bark screen, *Pukamani* pole, shield, and warrior's skin is painted in shimmering **5-colour *rarrk* cross-hatching, X-ray beasts, stencilled open hands, and concentric track-rings**. |

---

## 1. Build Identity & Core Adoption (`README.md`, "Core modules are not optional")

Upgrades `kits/painted-men` from its legacy `ksheet` wrapper to **`core/engine` (`engine.py`)** (`zero` external builds currently depend on `kits/painted-men/painted_men.py` per `tools/reach.py`), taking all `2026-11-11` `SURVEY` checks (`items 22–31` in `tools/checks_optin.json`).

| Field | Specification |
|---|---|
| **Folder & Output** | `kits/painted-men/` (`src/`, `tests/`, `build.py`, `verify.py`, `kit_bundle.py`, `painted_men.py`, `materials.json`, `mip-variance.json`, `tex/`, `API.md`, `PORT.md`, `INDEX.md`, `KNOWN_ISSUES.md`, `README.md`) -> `dist/painted-men.html` (+ sidecar `.tex.js`) |
| **Culture & Identifiers** | `KIT_ID = 'painted-men'`, `culture: 'painted'` (already registered in `core/tags/52-core-tags-vocab.js`!), building key prefix **`pm_`**, fragment prefix **`// prefix: pm`**, sealed world bundle **`PMK`** (`kit_bundle.py`) |
| **Reserved Seed Block** | **`36001–36499`** (`36001–36099` alcove/talus/hung dwellings, `36101–36199` *maloca* halls, stone circles & *Pukamani* shrines, `36201–36299` cliff eyries, retractable ladders & defence, `36301–36399` pigment pits, pitch-basketry, ledge gardens & salvage, `36401–36499` tiered seep-alcove cliff showcase) |

### 1.1 Modules Taken

| Module | Fragments / Path | How `kits/painted-men` Takes It |
|---|---|---|
| **`core/engine`** | `engine.py` (`10-core.js` ... `99-host-take.js`, `99-tail.html`), read in place | Merged PBR material buckets, `defBuilding`, `place`, openings (`36o-open.js`), walkable rooftop terraces & notched trunk-ladders (`36s-stair.js`), walk boxes (`37-wk-rec.js`), furnish pass (`91f-furnish.js`), night hearth/torch glow (`91n-night.js`), smoke/clock (`93-anim.js`), host hand-over |
| **`core/pueblo`** *(opt-in layout helper)* | `core/pueblo/10-pueblo-plan.js` (`[G data]`, read in place if multi-cell stepping is used) | Pure-data cellular setback & rooftop-access geometry for multi-storey Mesa Verde / Bandiagara alcove roomblocks (`pm_alcove_cluster`, `pm_cliff_village`) |
| **`core/shader` & `core/rand`** | `06/06b/07-core-k*.js`, `08-core-rand.js` (`KHOOK`, `KRAND`) | PBR detail/strata hooks, cut-away planes, `core/water` seep springs, `atmos-pm-wind` feather/bark-cord sway, and `KRAND` deterministic seeding (`0` `Math.random` / `Math.sin`) |
| **`core/drawn`** | `10-core-drawn.js` (`KDRAWN`) | Registers the kit sheet's sculpted ground + stepped `danxia` cliff-alcove backdrop and sunken *kiva*/stone-circle floor pits (`SURVEY` item 28) |
| **`core/materials`** | `23/24/25-mat*.js` (`KMAT`) + `materials.json` -> `tex/` | Own packed `512 px` `tex/` pack (`danxiaSlab`, `bentonitePlaster`, `juniperWood`, `willowLatilla`, `bunchgrassThatch`, `curedBark`, `rarrkMural`, `ochreRed`, `celadoniteTeal`, `obsidian`, `salvageRust`, and `f_*` furniture maps; `< 15` samplers) |
| **`core/tags`** | `50/52/53-core-tags*.js` (`KTAGS`) | Pre-draw registration of every placed `pm_*` building, *Pukamani* pole, stone-circle monolith, resource node, and furniture item under `culture: 'painted'` |
| **`core/furnish` + `core/catalog`** | `50/52/53-core-furnish*.js` (`KFURN`) + `furniture_bundle.py` (`indexed: true`) | Bundles `generic`, `generic-goods`, `jobs`, `arms`, and `scrap` sets (deliberately omitting legacy Tlingit `krator-master-furniture-painted.js`, which is queued in `TODO.md` to re-key to `timpar-kuran` on the next all-builds rebuild) alongside `14` bespoke `painted_*` plateau pieces (`39-pm-furn.js`) |
| **`core/host` & `core/atmos`** | `khost.SHELL + kengine.HOST`, `89-atmos-*.js` + `KratorSky` | Camera, clock, inspector, polygon tool, skylight PBR reflections, and live canyon-updraught wind sway on Korona-feather *Pukamani* crests, hide door-curtains, and drying `paintbrush` herb bundles |
| **`core/door` & `core/walk`** | `10/20/90-core-door*.js`, `20/24-core-walk*.js` | Operable T-shaped / keyhole Mesa Verde cured-bark & rawhide-lashed juniper slab doors (`svLeaf`), translucent selenite / oiled pronghorn-parchment smoke-slits (`svPane`), and full `reachAudit` across ledges, rooftop terraces, and notched Dogon trunk-ladders |
| **`core/water`** | `20/22/50/51-core-water*.js` (`WATER`) | Live `WATER.still` seep-contact spring basins at the back of cliff-alcove dwellings (`biomes/paintedhighlands` §5a geology!) and seasonal wash irrigation cisterns |
| **`kits/resources` & `kits/fauna`** | `42r/44r-res-*.js` + `fauna_bundle.py` | Places `iron` (red ochre), `copper` (`verdigris`/teal), and `coal` (`lignite-black`) pigment/mineral nodes (`resSource`) + plateau pronghorn grazers / cliff-ledge pens |

### 1.2 Modules Deliberately Not Taken

| Module | Why Not Taken |
|---|---|
| `core/world`, `core/terrain`, `core/biome` | Standalone building-kit sheet; open-world / settlement builds on `biomes/paintedhighlands` read `KCARVE` alcoves and `PAINTED_SITES` site records (`cliff-alcove`, `cliff-ledge`, `talus-bench`) and place `PMK` |
| `core/space`, `core/mask`, `core/city`, `core/hamlet`, `core/camp` | Settlement/camp layout modules; `kits/painted-men` exposes `pmDims()`, `PM_TRADES`, and `PMK` (`kit_bundle.py`) for cliff towns (`core/city`), ledge villages (`core/hamlet`), and seasonal pigment camps (`core/camp`) |
| `core/simulation`, `core/sched`, `core/coast`, `core/ruins` | Kit viewer sheet; landlocked `3,000–4,000 m` plateau; reclaimed Ancient pieces (`state: 'reclaimed'`) are active inhabited structures |

---

## 2. Four-Part Architectural & Cultural Synthesis (`PM1`–`PM4`)

### 2.1 `PM1` — Mesa Verde & Dogon Sandstone-and-Daub Seep-Alcove Roomblocks (`style: 'alcove'`)
- **Seep-Contact Structural Logic:** Coursed **tabular red-and-buff `danxia` sandstone slabs** chinked with spalls and coated in **warm cream, pink, or ochre `badland` bentonite plaster**; flat mud-and-ash roofs carried on **projecting peeled `paintedjuniper` *vigas*** (`18–22 cm` diameter) and cross-laid **willow *latilla* mats**, forming stepped rooftop plazas accessed by **single-trunk notched Dogon juniper ladders**.
- **Mesa Verde Keyhole / T-Shaped Doorways:** Narrow at the sill and wider at the shoulders (so a person carrying a coiled pitch-basket steps through easily, while an attacker must stoop and cannot swing a club), fitted with operable `KDOOR` rawhide-lashed juniper/bark doors.
- **Back-Wall Seep Cistern (`WATER.still`):** Alcove compounds (`pm_alcove_house_rich`, `pm_alcove_spring_court`) catch the sandstone-clay contact spring in a dressed sandstone basin lined with celadonite-teal and red-ochre waterhole rings.

### 2.2 `PM2` — Arnhem Land *Rarrk*, X-Ray Rock Art & Feathered *Pukamani* Poles (`src/41-pm-rarrk.js`)
- **Procedural *Rarrk* & Rock-Art Painter (`PMRARRK`, replacing `PMFORM`):**
  - Renders authentic mineral-pigment panels onto plastered alcove walls, sandstone hoods, and hung **cured oak/juniper bark screens**:
    1. **Polychrome *Rarrk* Cross-Hatching:** Fine parallel reed-brush bands in red ochre (`#b53324`), rabbitbrush yellow (`#c98724`), pipeclay white (`#f4ede0`), lignite black (`#181614`), and `celadonite-teal` (`#267974`);
    2. **X-Ray Fauna Panels:** Pronghorn grazers, cliff raptors, and Korona creatures drawn with internal spine, ribs, heart, and lungs visible inside a pipeclay silhouette;
    3. **Stencilled Open Hands & Concentric Track-Rings:** Negative-blown pipeclay/teal/ochre hand stencils (`Yanta-Rringka`, the canonical `LORE.md` §10 emblem!) and concentric waterhole-and-trail maps;
    4. **Wandjina / Gwion Spirit Silhouettes:** Tall mouthless halo-headed rain/melt spirits painted high under alcove brows.
- ***Pukamani* & *Lorrkon* Clan/Mortuary Poles (`pmPukamaniPole`):** Solid and hollow canyon-oak / juniper trunks (`2.8–5.5 m`, realistic canyon tree height!) carved with deep hourglass neck-waists, geometric dot-and-*rarrk* bands, and crowned with **wind-swaying bursts of iridescent Korona-trench bird feathers** (`SV_CLOTH`).

### 2.3 `PM3` — Canyon-Fan *Maloca* Halls, Pointed Bunchgrass Granaries & Hung Moat-Ledges (`style: 'maloca'` / `'hung'`)
- **Amazonian-Inspired Communal *Maloca* Halls (`pm_maloca_warrior_hall`, `pm_feast_maloca`, `pm_house_maloca_mid`):** Sited on wider canyon-floor fans and talus benches (`Site 2`), framed with arched **bent `paintedoak` and `paintedjuniper` cruck-ribs** over a low `1.1 m` dry-laid `danxia` wind-wall, thatched in thick stepped **`Stripe bunchgrass`** with an arched entry hood flanked by painted *rarrk* bark boards and a central **Xingu-style warrior wrestling/dance ring**.
- **Dogon-Style Talus & Cliff-Niche Granaries (`pm_talus_granary`, `pm_niche_granary`):** Square-rounded bentonite-daubed sandstone towers raised on boulder pads and capped with removable **conical `Stripe bunchgrass` thatch hats**, plus small shuttered masonry storage lockers mortared high into sheer cliff pockets.
- **Hung Moat-Wall Houses (`pm_hung_ledge_house`, `pm_silk_winch_landing`):** Built for `Site 3` (`Korona` moat lip): compact plastered stone-and-wattle shelters riding **heavy canyon-oak cantilever beams** socketed into `danxia` wall pockets with raking struts, notched ladders, and a **braided Korona wild-silk cargo winch**.

### 2.4 `PM4` — Pigment Quarries, Pitch-Basketry, Bullroarer Circles & Reclaimed Salvage (`PM_TRADES`)
- **Shamanic Stone Circle & Sunken *Kiva* (`pm_stone_circle_shrine`):** Ring of ochre-stencilled `danxia` monoliths and *Pukamani* poles round a sunken circular stone-lined chamber (`KDRAWN` cut), `phsage` smudge-hearth, and bullroarer rack.
- **Plateau Crafts (`0` Pottery, `0` Bamboo):** `pm_pigment_quarry` (stepped bench cutting red-ochre, lignite, and `celadonite-teal` beds, bound to `kits/resources`), `pm_pitch_basket_shed` (heating `paintedpinyon` resin over stones to waterproof coiled willow *tus* water-jugs and carving burl *coolamons*), `pm_woomera_obsidian_shop` (knapping traded Korona `obsidian-pancake` dart-points & shaping mountain-mahogany woomeras and bullroarers), `pm_ledge_garden` (terraced seep-irrigated `basin amaranth`, `murnong` & `paintbrush` beds), `pm_pronghorn_corral`, and `3` *rarrk*-painted reclaimed Ancient salvage structures (`pm_salvage_tank_round`, `pm_salvage_cont_ledge`, `pm_salvage_scrap_forge`).

---

## 3. Complete Building Roster (`34` Standalone Definitions + `pm_cliff_village`, Seeds `36001–36405`)

| Group | Defs (`pm_*`) | Count | Wealth / Site Mode |
|---|---|---:|---|
| **Poor Dwellings** | `pm_alcove_cell_poor`, `pm_talus_hut_poor`, `pm_bark_shelter_poor` | `3` | `poor` single-room alcove cell, bunchgrass-capped talus hut, seasonal hogback eyrie shelter |
| **Middle Dwellings** | `pm_alcove_house_mid`, `pm_hung_ledge_mid`, `pm_house_maloca_mid`, `pm_terrace_duplex_mid` | `4` | `middle` 2-storey seep-alcove house, cantilevered ledge house, family *maloca*, stepped duplex |
| **Rich Clan Compounds** | `pm_alcove_compound_rich`, `pm_spring_palace_rich`, `pm_chief_maloca_rich` | `3` | `rich` 3-tier Mesa Verde alcove compound w/ round tower & `WATER.still` seep spring (`6/6` residential matrix!) |
| **Civic, Sacred & Raider Halls** | `pm_maloca_warrior_hall`, `pm_stone_circle_shrine`, `pm_songline_gallery`, `pm_lorrkon_ossuary`, `pm_truce_ring_pavilion` | `5` | Communal *maloca* w/ sparring ring, sunken shamanic stone circle, overhang Wandjina/songline rock-art & drone-pipe gallery, hollow-log *Lorrkon* cliff ossuary, playa truce-moot |
| **Cliff Defence & Vertical Access** | `pm_eyrie_watchtower`, `pm_ladder_gatehouse`, `pm_ledge_parapet`, `pm_silk_winch_post` | `4` | Round `danxia` scarp tower, draw-up Dogon ladder bastion, loophole ledge wall, Korona wild-silk cliff hoist |
| **Plateau Works, Trades & Salvage** | `pm_pigment_quarry`, `pm_pitch_basket_shed`, `pm_ochre_cake_press`, `pm_woomera_obsidian_shop`, `pm_salvage_scrap_forge`, `pm_talus_granary`, `pm_niche_granary_wall`, `pm_amaranth_roast_oven`, `pm_smokehouse_jerky`, `pm_rattlepod_brew_hut`, `pm_bark_dye_court`, `pm_paintbrush_healer`, `pm_ledge_seep_garden`, `pm_pronghorn_corral`, `pm_salvage_tank_round` | `15` | Covers every non-literate plateau/canyon Voth census trade & `TRADE-SCOPE.md` §7.1/§7.6 mineral-dye / Korona `orchil` / `paintbrush` trade (`potters`, `glassmakers`, `shipwrights`, `bankers`, `scribes`, `printers` explicitly annotated cultural/ecological `na` in `PM_TRADES`) |

### Bespoke Furniture (`src/39-pm-furn.js` — `15` `painted_*` Pieces)
1. `painted_pitch_tus_rack` — juniper rack of pinyon-pitch-sealed coiled willow water-jugs (*tus*, replacing clay amphorae & bamboo tubes!)
2. `painted_burl_coolamon_set` — nested carved canyon-oak & juniper-burl *coolamon* carrying/winnowing troughs painted with dot-rings
3. `painted_rarrk_bark_screen` — cured canyon-oak bark room divider painted in 5-colour *rarrk* cross-hatching & X-ray pronghorn
4. `painted_ochre_grinding_slab` — hollowed `danxia` sandstone metate with red-ochre, yellow-ochre, pipeclay & `celadonite-teal` pigment cakes
5. `painted_woomera_dart_rack` — mountain-mahogany *woomera* spear-throwers, obsidian-tipped willow darts & flat hardwood war-clubs
6. `painted_bark_shield_stand` — oval *rarrk*-and-hand-stencilled bark shields + whirling hardwood bullroarers on sinew cords
7. `painted_pukamani_indoor_post` — compact carved & Korona-feathered *Pukamani* clan post (`common`/`court`)
8. `painted_feather_diadem_perch` — ceremonial Korona-bird iridescent feather headdress & body-paint stamp stand (`court`)
9. `painted_sage_smudge_pit` — circular `danxia`-slab hearth burning `phsage` & `paintedjuniper` incense bundles
10. `painted_pronghorn_pelt_bed` — low juniper-pole & rawhide-webbing sleeping frame piled with pronghorn pelts & bunchgrass mats
11. `painted_hotstone_boiling_basket` — watertight coiled willow cooking basket beside heated river cobbles & wooden tongs
12. `painted_amaranth_mano_metate` — basin-amaranth & pinyon-nut stone grinding trough
13. `painted_raided_iron_kettle` — soot-blackened lowland iron cauldron suspended on a juniper tripod (raid trophy!)
14. `painted_dogon_notched_ladder` — portable single-trunk notched juniper interior/ledge ladder
15. `painted_drone_pipe_rack` — ochre-painted hollow canyon-hardwood drone-pipes (didgeridoos) & corded wooden bullroarer rack

---

## 4. Fragment Layout & Phased Verification Gates (`PM0`–`PM5`)

| Fragment | `[G]` Tag | Responsibility |
|---|---|---|
| `00-head.html` | `[B]` | Page title & HUD header |
| `26k-kit.js` | `[G data]` | `KIT` identity (`culture: 'painted'`), `PM_STYLES` (`alcove`, `maloca`, `hung`, `salvage`), `SV_LIB`, `SV_CLOTH`, `SV_CUT`, `SVPAL` |
| `34-pm-trades.js` | `[G data]` | `PM_TRADES` (`44` Voth census rows, `0` gaps; `potters` explicit `na` w/ pitch-basket/coolamon note) + `pmRigMath` (*viga* span cap `<= 4.2 m`, *maloca* cruck arc, notched-ladder step pitch, feather wind pin weights) |
| `39-pm-furn.js` | `[B]` | `15` bespoke `painted_*` `KratorFurniture` defs (`0` Tlingit cedar/bamboo pieces) |
| `40-pm-kit.js` | `[B]` | `// prefix: pm` — tabular `danxia` slab walls, bentonite plaster, projecting juniper *vigas* & willow *latillas*, T-shaped Mesa Verde doors, bent-oak *maloca* crucks, `Stripe bunchgrass` thatch, Dogon notched ladders, cantilever wall-sockets |
| `41-pm-rarrk.js` | `[B]` | `// prefix: pm` — procedural Arnhem *rarrk* cross-hatching, X-ray beast, stencilled-hand (`Yanta-Rringka`), concentric track-ring & Wandjina mural painter + carved/feathered *Pukamani*/*Lorrkon* poles |
| `50-pm-dwell.js` | `[B]` | `// prefix: pm` — all `10` poor, middle & rich alcove, hung, and *maloca* dwellings (`36001–36010`) |
| `54-pm-sacred-def.js` | `[B]` | `// prefix: pm` — warrior *maloca*, sunken shamanic stone circle, overhang songline rock-art & drone-pipe gallery (`36109`), *Lorrkon* cliff ossuary, truce pavilion, scarp watchtower, draw-ladder gatehouse, silk-winch post (`36101–36204`) |
| `62-pm-works-salvage.js` | `[B]` | `// prefix: pm` — pigment quarry, pitch-basket shed, mineral paint-cake & Korona `orchil` press (`36315`), woomera/obsidian shop, talus & cliff-niche granaries, ledge seep-garden, pronghorn corral & *rarrk*-painted reclaimed salvage (`36301–36315`) |
| `70-pm-cliff-alcove.js` | `[B]` | `// prefix: pm` — composite **Tiered Seep-Alcove & Talus-Fan Cliff Settlement** (`pm_cliff_village`: `danxia` overhang + `WATER.still` seep + 3-tier roomblocks + notched ladders + *Pukamani* lip poles + talus *maloca* below) |
| `89-rows.js`, `90z-pm-atmos.js`, `91z-pm-world.js`, `99-host-tz-pm.js` | `[G data]` / `[B]` | Sheet rows, `ATMOS` canyon-wind hook, `KDRAWN` cliff/pit ground, `WATER.still` seeps, `kits/resources` pigment lodes, `PMK` `pmDims()`, clean preset views & `_api` audits |

### Verification Gates (`verify.py --assert`)
- **PM0 (Material & Trade Audit):** `node kits/painted-men/tests/test-painted-men.js` (`tools/ktest.js` — asserts `0` bamboo materials/geometries, *viga* spans `<= 4.2 m`, and `PM_TRADES` `0` gaps) + `python3 tools/check_trades.py kits/painted-men`.
- **PM1–PM3 (Kit & Audits):** `100%` packed library textures (`0` untextured lit meshes), `zfightAudit` (`0` overlaps), `seepWaterAudit` (`WATER.still` springs active in rich alcove & cliff village), `ladderReachAudit` (rooftop terraces & alcove tiers reachable via `KWALK` notched ladders, `KDOOR` T-doors operable).
- **PM4–PM5 (Bundle & GPU Survey):** Update `painted_men.py` & `kit_bundle.py` (`PMK`), queue re-keying `kits/catalog/krator-master-furniture-painted.js` -> `timpar-kuran` in `TODO.md` ("Ride along with the next all-builds rebuild"), pass `check_core_use.py`, and pass `KRATOR_GL=gpu python3 kits/painted-men/verify.py kits/painted-men/dist/painted-men.html --assert --cut --night` (`100%` of `harness.SURVEY`).
