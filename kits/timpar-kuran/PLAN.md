# `kits/timpar-kuran` — Design Plan: The Timpar-Kuran ("Timber-Clans") of the Veiled Mountains

*Status: Build-ready design plan (`2026-11-27`), aligned with [LORE.md](../../LORE.md) §6.19 & §6.25, [tongues-of-krator.html](../../lore/tongues-of-krator.html) `#et-hl-h`, [biomes/veiledmountains/PLAN.md](../../biomes/veiledmountains/PLAN.md), `edit_535_veiled_mountains.py`, [kits/hayrant/PLAN.md](../hayrant/PLAN.md), and [kits/hueru-kuran/PLAN.md](../hueru-kuran/PLAN.md).*

The **`Timpar-Kuran`** ("Timber-Clans", mountain pronunciation *Timpar-K'uran*; political polygon **`rmwzqi9dwnd31`**, px `126–281 × 612–961`) are the unconquered, raiding third branch of the **`Utari-Kuran`** cultural and linguistic complex. When the Ancient mountain-forest arcology **`Kanopi`** (*Canopy*) shattered in the **Veiled Mountains** (`rmwzq1pa88m7q` / `rmwx28eysqk2e`, px `123–336 × 609–979`; [biomes/veiledmountains](../../biomes/veiledmountains/PLAN.md)), the **`Hayrant`** migrated east onto the Outer Wall benches and fell under the Eternal State, the **`Hueru-Kuran`** descended west to `Crookshore`'s tsunami calderas, and the **`Timpar-Kuran` stayed** in the omnipresent-mist Hoh-scale temperate-boreal rainforest U-valleys (`Veilpass`, `mist valley 2`, `mist valley`, `Region 177`, floors `2,100–2,750 m`) beneath `5,000+ m` tilted impact-`megabreccia` crags.

Less "civilized" and far less politically organized than either cousin (or than the Yeti Kingdom `Khaay Qantïr`), they fuse the shared **Jōmon / Ainu** substrate (*irori* sunken hearths, sculptural cord-marked *kaen-doki* flame-ware, stepped *cise* bark/reed thatch, *pu* rat-baffled stilt storehouses, shaved-wood *inau* spirit-wands, *nusa* skull-fences, *attus* bark-cloth) with **Pacific-Northwest / Tlingit** monumental woodcraft (split red-cypress & cloud-cedar clan plank-houses, edge-to-edge black-red-teal formline gable fronts, oval totem-mouth doorways, stacked house-frontal & mortuary crest-poles, *chasi-noow* log-crib ridge forts, wooden slat-armour, and open-eyed beast war-visors).

---

## 0. Build Identity & Key Specifications

| Field | Specification |
|---|---|
| **Folder & Output** | `kits/timpar-kuran/` (`src/`, `tests/`, `build.py`, `verify.py`, `kit_bundle.py`, `materials.json`, `mip-variance.json`, `tex/`, `API.md`, `PORT.md`, `INDEX.md`, `KNOWN_ISSUES.md`, `README.md`) -> `dist/timpar-kuran.html` (+ sidecar `.tex.js`) |
| **Culture & Identifiers** | `KIT_ID = 'timpar-kuran'`, `culture: 'timpar-kuran'` (zero-shared-rebuild alias during `TK0–TK4` or canonical `52-core-tags-vocab.js` entry at `TK5`), building key prefix **`tk_`**, fragment prefix **`// prefix: tk`**, sealed world bundle **`TKK`** (`kit_bundle.py`) |
| **Reserved Seed Block** | **`35001–35499`** (`35001–35099` dwellings & plank-halls, `35101–35199` clan/sacred/`Kanopi` shrines & totem courts, `35201–35299` *chasi-noow* forts & raid works, `35301–35399` forest crafts, salmon weirs & `Kanopi` delves, `35401–35499` valley-spur showcase) — **zero collision** with `kits/hayrant` (`34001–34499`), `kits/hueru-kuran` (`8101–8409`), or `kits/painted-men` (`36001–36499`) |
| **PNW + Jōmon/Ainu Fusion** | **Poor & Outlying (`style: 'jomon'`):** Semi-sunken Jōmon timber-crib pit-houses & stepped Ainu bark/reed *cise* lodges with sculptural *kaen-doki* smoke-pot crowns, *inau* doorway wands, and raw split-cedar gables.<br>**Middle & Trades (`style: 'plank'`):** Post-and-beam split red-cypress Tlingit plank-houses with black-red-teal **formline frieze boards**, kerfed cedar storage chests, elevated *pu* stilt caches, and cord-marked hearth-hoods.<br>**Rich, Clan & Sacred (`style: 'crest'`):** Monumental `16–22 m` wide clan great-halls (*Timpar-Cise*) with full-facade **Storm-Bird / Bear / Sea-Eagle / *Hueru* formline screens**, `9–14 m` carved **totem-mouth entrance poles**, interior stepped `daak` clan platforms around twin sunken *irori* fire-pits, *nusa* skull-altars, `Kanopi` arcology-rib reliquaries, and captured Eternian ancestor-head war trophies |

---

## 1. Core Adoption (`README.md`, "Core modules are not optional")

Modelled directly on [kits/hayrant/build.py](../hayrant/build.py) and [kits/hueru-kuran/build.py](../hueru-kuran/build.py), taking all `2026-11-11` `SURVEY` checks (`items 22–31` in `tools/checks_optin.json`) from its first commit.

### 1.1 Modules Taken

| Module | Fragments / Path | How `kits/timpar-kuran` Takes It |
|---|---|---|
| **`core/engine`** | `engine.py` (`10-core.js` ... `99-host-take.js`, `99-tail.html`), read in place | Merged PBR geometry buckets, `defBuilding`, `place`, openings (`36o-open.js`), walkable stepped `daak` & ridge-fort stairs (`36s-stair.js`), walk boxes (`37-wk-rec.js`), furnish pass (`91f-furnish.js`), night smoke-hole/hearth glow (`91n-night.js`), smoke/clock (`93-anim.js`), host hand-over |
| **`core/shader`** | `06-core-khook.js`, `06b-core-kcolor.js`, `07-core-kwarp.js` (`KHOOK`, `KCOLOR`) | Library PBR detail hooks, cut-away planes, `core/water` mountain-stream shaders, and `atmos-tk-wind` mist-draft vertex sway on Chilkat/attus banners, *inau* shavings, and smoked-fish lines |
| **`core/rand`** | `08-core-rand.js` (`KRAND`) | Every `core/tags` uid, formline crest variant, totem animal stack, `etHeadParams` loot-head seed, and plank/shingle jitter seeded from `KRAND` hashes of `(world, cell, index, salt)` |
| **`core/drawn`** | `10-core-drawn.js` (`KDRAWN`) | Registers the kit sheet's sculpted ground grid (rainforest valley bench + megabreccia spur + salmon stream cut) so `SURVEY` eye-clearance audits test drawn triangles (item 28) |
| **`core/materials`** | `23-mat-record.js`, `24-tex-def.js`, `25-matlib-host.js` (`KMAT`) + `materials.json` -> `tex/` | Packed `512 px` library albedo, lossless normal, and roughness maps across split `redCypress`, `weatheredCedar`, `cypressBark`, `reedThatch`, `megabreccia`, `kaenClay`, `formline` procedural-to-packed crest canvases, `copper`, `kanopiAlloy`, `inauWood`, and `f_*` furniture surfaces (`< 15` samplers) |
| **`core/tags`** | `50-core-tags.js`, `52-core-tags-vocab.js`, `53-core-tags-host.js` (`KTAGS`) | Pre-draw registration of every placed `tk_*` building, totem pole, `Kanopi` relic, war-loot head, resource node, animal, and furniture piece |
| **`core/furnish` + `core/catalog`** | `50/52/53-core-furnish*.js` (`KFURN`) + `furniture_bundle.py` (`indexed: true`) | Reuses the existing Tlingit red-cedar furniture definitions (`painted` set during `TK0–TK4`, slated to rename to `timpar-kuran` on the next all-builds ride-along) + `generic`, `generic-goods`, `jobs`, `arms`, `scrap`, plus `14` bespoke Jōmon/Ainu-PNW `timpar_*` pieces (`39-tk-furn.js`) |
| **`core/host`** | `khost.SHELL + kengine.HOST` | Orbit/WASD/walk camera, frame clock (`core/clock`), hover inspector, polygon tool, standard keys (`X` cut-away, `N` night, `E` door, `F` walk), `window._api` |
| **`core/atmos` + `placeholder`** | `89-atmos-*.js` (`ATMOS`, `ATMOS.skylight`, `ATMOS.U`, `ATMOS.GLSL_WIND`) + `KratorSky` | Wet rainforest valley haze/skylight reflections + live wind sway on woven *attus*/Chilkat hangings, *inau* willow curls, and salmon-drying racks |
| **`core/door`** | `10-core-door.js`, `20-core-glass.js`, `90-core-door-host.js` (`KDOOR`, `KGLASS`, `KDOORHOST`) | Operable heavy adzed cedar plank doors AND oval **totem-mouth pivoting plug-doors** (`svLeaf`), plus oiled gutskin / thin horn smoke-lantern panes (`svPane`) |
| **`core/walk` + `walk/box`** | `20-core-walk.js`, `24-core-walk-box.js` (`KWALK`, `KWALKBOX`) | Floor/wall boxes, sunken Jōmon pit steps, stepped plank-hall `daak` tiers, *pu* notched ladders, and *chasi-noow* fighting-walkways (`reachAudit`) |
| **`core/water`** | `20-core-water.js`, `22-core-water-flow.js`, `50-core-water-draw.js`, `51-core-water-kinds.js` (`WATER`) | Live `WATER.flow` mountain salmon torrent through `tk_salmon_weir` and `tk_canoe_landing`, plus `WATER.still` rainforest spring cistern in `tk_chasi_noow_fort` |
| **`kits/resources` & `kits/fauna`** | `42r-res-ore.js`, `44r-res-nodes.js` + `fauna_bundle.py` | Places Veiled-Mountain `copper`, `iron`, `gold` placer, and `jade` boulder nodes (`resSource`) + caged sacred mountain bear (`tk_iomante_bear_court`), pack ponies, and drying salmon |
| **`kits/eternian` (War-Loot Heads)** | `kits/eternian/src/42-et-head.js` (`[G data]`, read in place, as `kits/yeti` does) | Generates deterministic Eternian closed-eyed bronze/stone/terracotta ancestor heads mounted inverted or war-painted on `Timpar-Kuran` trophy racks and *chasi* gates (`0` lines copied) |

### 1.2 Modules Deliberately Not Taken

| Module | Why Not Taken |
|---|---|
| `core/world`, `core/terrain`, `core/biome` | Standalone building-kit sheet on an analytic `KDRAWN` spur/stream ground; Veiled Mountains open-world / biome builds (`Region 174`, `Region 175`, `Veilpass`) take these and load `TKK` |
| `core/space`, `core/mask`, `core/city`, `core/hamlet`, `core/camp` | Settlement/raid-camp layout modules; `kits/timpar-kuran` exposes `tkDims()`, `TK_TRADES`, and `TKK` (`kit_bundle.py`) for `core/hamlet` valley villages and `core/camp` raiding war-bands |
| `core/simulation`, `core/sched` | Schedules and raid/ransom economies run on settlement/open-world pages |
| `core/ruins`, `core/coast` | Active clan structures (`state: 'intact'`; `Kanopi` arcology shards are integrated architectural shrines, not `core/ruins` rubble passes); inland mountain valleys (`2,100–2,750 m`) |

---

## 2. Geography, Available Materials & Cousin Links

1. **Forest & Stone of the Veiled Mountains (`edit_535_veiled_mountains.py`):**
   - **Giant Temperate-Boreal Conifers (`2,100–2,750 m` valley floors, `Cfb`/`Dfb`, `2,000–3,000+ mm/yr` in Tsunami-Coast draft funnels):** Straight-grained **`red-cypress`** and **`cloud-cedar`** (`1.5–3.0 m` trunk diameters) split cleanly with antler/copper wedges into `6–14 m` structural planks and full-height carved totem logs; **`fur-larch`**, **mountain-elm** (retted inner bark for Ainu *attus* cloth), and **valley-willow** (shaved white *inau* ceremonial curls).
   - **Shattered Impact-`Megabreccia` & River Clay:** Angular dark-grey `megabreccia` talus blocks and river cobbles form sunken Jōmon pit-kerbs, *irori* fire-boxes, and *chasi* trench revetments; valley-mouth glacial clays fire at `850–1,000 °C` in open pit-clamps into thick, cord-impressed **Jōmon *kaen-doki* earthenware** (unlike `Hayrant`'s clay-starved high loess bench, the wet rainforest valley floors hold glacial silt-clay pockets, though the clans lack high-fire brick or glaze kilns!).
   - **Pigments, Metals & Salvage:** **Charcoal/lignite black** (`#141619`), **cinnabar/iron-ochre red** (`#b63124`), and **copper-verdigris / celadonite teal** (`#1f6e6c`) bound in salmon-egg tempera (the classic Tlingit binder — waterproof in `2,800 mm` rain!); cold-hammered native **copper** (`tin` scarce locally) for repoussé *tináa* wealth-shields, plus **salvaged `Kanopi` alloy plates** and **looted Eternian steel, bronze, and celadon porcelain** taken in lowland raids.
2. **Visible Kinship with `Hueru-Kuran` and `Hayrant`:**
   - All three cousins share **cord-marked *kaen-doki* flame-rimmed hearth/chimney ceramics**, ***cise* timber-rib framing**, **shaved *inau* spirit-wands**, and **`Utari-Tuka` speech**.
   - Where `Hueru-Kuran` replaced forest trunks with whale-ribs and Sardinian basalt *nuraghi* against megatsunamis, and `Hayrant` bent under Eternian limewashed Deco-Gothic brick and paper, `Timpar-Kuran` maximized **monumental rainforest timber, Tlingit formlines, and totem poles** — remaining non-literate, clan-fractured, and fiercely predatory.

---

## 3. Four-Part Architectural & Cultural Synthesis (`TK1`–`TK4`)

### 3.1 `TK1` — Split-Cedar Tlingit Plank-Houses (*Timpar-Cise*) & Formline Screens
- **Structural System:** Massive adzed red-cypress corner and ridge posts (`60–85 cm` diameter, fluted with adze marks), twin longitudinal roof-beams (*taas*), wide vertical or horizontal split-cedar wall planks slotted into sill/head grooves (zero nails), and low-pitched (`18°–24°`) overlapping split-plank roofs weighted against valley gales with megabreccia cobble poles, crowned by a sliding **Jōmon/Tlingit smoke-hole shutter** (*ganook*) flanked by *kaen-doki* terracotta finials.
- **Procedural Formline & Totem Engine (`src/41-tk-formline.js`, ported & expanded from `kits/painted-men/src/83-pm-tlingit.js`):**
  - Renders crisp salmon-egg-tempera **primary black ovoids, inner red U-forms, celadonite-teal split-Us and trigons, and copper-eye inlays** onto `KMAT`-packed / procedural house-front screens;
  - **Five Clan Crests** (keyed deterministically by `KRAND` seed): **`Kuma` (Mountain Bear)**, **`K'apac` ( Storm-Eagle / Thunderbird)**, **`Rapan` (Mist-Raven)**, **`Hueru` (Ancestral Whale — remembered from coastal kin!)**, and **`Wurup` (Cloud-Wolf)**;
  - **Totem-Mouth Entrance Poles (`tkTotemPortal`):** `7–14 m` stacked cedar house-frontal poles carved in high 3D relief (beaks, ears, dorsal fins, bear paws) with a `1.1 × 1.9 m` **oval belly/mouth doorway** fitted with an operable `KDOOR` cedar plank-door.

### 3.2 `TK2` — Jōmon Pit-Lodges, Stepped Ainu *Cise* Thatch & *Pu* Stilt Caches
- **Jōmon Semi-Sunken Pit-Lodges (`tk_jomon_pit_poor`, `tk_hunter_pit_poor`):** Circular/rounded-square `0.8 m` sunken earth-and-`megabreccia` kerbs (`KDRAWN` pit cutout on the sheet!) roofed by conical four-post rafters clad in layered cypress bark and mountain reed, vented through an oversized **sculptural Jōmon *kaen-doki* flame-pot roof collar**.
- **Ainu Stepped-Thatch *Cise* (`tk_bark_cise_poor`, `tk_attus_weaver`):** East-facing sacred *rorun-puyar* spirit-window (never walked through; hung with *inau* shavings) opposite a west entry vestibule (*sem*), stepped horizontal courses of dark reed/bark thatch lashed over poles, and a Tlingit-painted gable board.
- **Elevated *Pu* Clan Granaries (`tk_pu_granary`, `tk_salmon_cache`):** Raised `1.8 m` on `4–6` cedar posts collared with wide **disc rat-baffles (*nezumi-gaeshi*)**, notched single-log access ladder, steep bark roof, and kerfed cedar walls painted with clan ownership crests.

### 3.3 `TK3` — *Nusa* Skull-Fences, *Iomante* Bear-Shrine, `Kanopi` Relics & Eternian War-Loot
- ***Nusa* & Mortuary Pole Precinct (`tk_nusa_mortuary_shrine`):** Pairs a curved Ainu ***nusa* sacred fence** (clustered pale shaved-willow ***inau* curl-wands** crowned with weathered bear and eagle skulls) with **Tlingit mortuary crest-poles** holding kerfed shamanic bone-chests in high mortises.
- ***Iomante* Sacred Bear-Court (`tk_iomante_bear_court`):** Heavy notched-log raised bear-cage (`heper-set`) flanked by four *inau*-festooned corner posts, feast-hearth, and carved Bear-Clan plank screen for the winter spirit-sending feast.
- **`Kanopi` Canopy-Rib Relic Hall (`tk_kanopi_shrine`):** Incorporates a salvaged **`9 m` curved titanium-ceramic `Kanopi` arcology canopy rib** (`kanopiAlloy` with faint dead conduit grooves) as the central ridge-arch of a shamanic clan lodge, hung with copper *tináa* shields and *kaen-doki* incense burners.
- **Anti-Eternian Trophy Rules (`tkLoot`):** Unlike the `Hayrant` (who must hang reverent closed-eyed ancestor masks over every door), the `Timpar-Kuran` mount **looted Eternian bronze and stone ancestor heads** (`42-et-head.js`) **inverted or cross-slashed with red-ochre/teal war-paint** on *chasi* gate-posts and feast-hall screens, contrasted against **wide-eyed Tlingit carved wooden beast war-helmets**.

### 3.4 `TK4` — *Chasi-Noow* Ridge Forts, Caravan Ambushes & Contraband Economy (`TK_TRADES`)
- ***Chasi-Noow* Promontory Fort (`tk_chasi_noow_fort`):** Dry-cut defensive ditch + battered `megabreccia` earthwork bank topped by a **double-walled Tlingit *noow* heavy red-cypress log-crib palisade** (`4.5 m` high, notched corner bastions, baffled sally-port tunnel forcing attackers to stoop under club-blows, interior walkable firing catwalk, and `WATER.still` rain cistern).
- **Caravan-Ambush & Cousin-Contraband Infrastructure:** Finding fortified Eternian towns hard to storm, `Timpar-Kuran` war-bands specialize in **ambushing Eternian highway and mountain-pass caravans** (`tk_rockfall_trap_crib` boulder-deadfall cradles, `tk_signal_pyre_tower` lookout drums, `tk_ransom_stockade`) and channeling hijacked porcelain, silk, iron, and tea into a **healthy illicit trade with their `Hayrant` cousins** (`tk_cousin_truce_lodge`, `tk_barter_crest_post`, `tk_pony_hound_corral`) despite relentless Eternian Censorate crackdowns. On the west and south, they are the **only outsiders ever fought by the `Hush-Kin` of `Silent Vales`** (whom they rarely raid out of dread of *The Great Hush*) **and the `Dzagh-Vardzi` gorge-kingdoms** (whose **free-roaming, chivalric hero-troubadours** rally `K1–K7` when `Timpar-Kuran` war-bands raid cliff-*aul* settlements).

---

## 4. Complete Building Roster (`38` Definitions, Seeds `35001–35316`)

| Group | Defs (`tk_*`) | Count | Wealth / Role |
|---|---|---:|---|
| **Poor Dwellings (`style: 'jomon'`)** | `tk_jomon_pit_poor`, `tk_bark_cise_poor`, `tk_twin_pit_kin_poor` | `3` | `poor` single & multi-family Jōmon pit & stepped Ainu bark *cise* lodges |
| **Middle Dwellings (`style: 'plank'`)** | `tk_plank_cise_mid`, `tk_cedar_plank_mid`, `tk_spur_stilt_mid`, `tk_lineage_longhouse_mid` | `4` | `middle` single & multi-family split-cypress plank & valley-spur stilt lodges |
| **Rich Clan Halls (`style: 'crest'`)** | `tk_timpar_cise_rich`, `tk_chieftain_totem_hall`, `tk_twin_hearth_clan_rich` | `3` | `rich` single & multi-lineage great plank-houses w/ totem-mouth portals & `daak` tiers (`6/6` residential matrix!) |
| **Civic, Sacred & `Kanopi` Cult** | `tk_kanopi_shrine`, `tk_iomante_bear_court`, `tk_nusa_mortuary_row`, `tk_potlatch_feast_hall`, `tk_shaman_sweat_lodge`, `tk_cousin_truce_lodge` | `6` | `Kanopi` rib-arch hall, *iomante* bear-sending court, *nusa* + mortuary poles, potlatch hall, sweat-lodge, cousin truce-lodge |
| **Defence & Raiding (`Chasi-Noow`)** | `tk_chasi_noow_fort`, `tk_trophy_stockade_gate`, `tk_rockfall_trap_crib`, `tk_raid_mustering_ground`, `tk_ransom_stockade`, `tk_signal_pyre_tower` | `6` | Promontory log-crib fort, Eternian trophy gate, boulder-deadfall crib, mustering ground, ransom stockade, signal pyre |
| **Forest Crafts, Grease-Trails, Works & Food** | `tk_salmon_weir_smokehouse`, `tk_dugout_armour_yard`, `tk_kaen_firing_court`, `tk_attus_chilkat_loom`, `tk_copper_cold_forge`, `tk_jade_adze_grinder`, `tk_spore_flash_apothecary`, `tk_kanopi_salvage_yard`, `tk_pu_clan_granary`, `tk_berry_mead_tavern`, `tk_goat_pelt_byre`, `tk_barter_crest_post`, `tk_camas_earth_oven`, `tk_grease_tryworks`, `tk_totem_carving_shed`, `tk_pony_hound_corral` | `16` | Covers all `41` active Voth census trades (`coast guard`, `beetle herders`, `elephant bug handlers` explicitly marked inland/boreal `na` in `TK_TRADES`) |

### Bespoke Furniture (`src/39-tk-furn.js` — `14` `timpar_*` Pieces)
1. `timpar_irori_kaen_hearth` — sunken cobble-kerbed *irori* fire-pit with suspended wooden *jizai-kagi* fish-hook & sculptural *kaen-doki* flame-rimmed stewpot
2. `timpar_kerfed_bentwood_chest` — kerfed red-cedar Tlingit storage box painted in black-red-teal ovoids (`poor`/`common`)
3. `timpar_inau_nusa_rack` — indoor/outdoor shrine stand with pale shaved-wood *inau* curls and bear skull
4. `timpar_slat_cuirass_stand` — lashed hardwood rod-and-slat cuirass armour stand
5. `timpar_visor_war_helm` — open-eyed carved wooden Bear/Storm-Bird war-visor helmet stand
6. `timpar_eternian_trophy_rack` — raided Eternian war-loot rack with inverted/war-painted closed-eyed bronze ancestor masks
7. `timpar_chilkat_loom` — upright cedar loom weaving mountain-goat-wool & bark *Chilkat/moreu* crest blankets
8. `timpar_totem_house_post` — carved interior red-cypress clan crest house-post
9. `timpar_smoked_salmon_frame` — split-cedar drying frame hung with red fillets of smoked mountain salmon
10. `timpar_kanopi_alloy_lamp` — salvaged `Kanopi` titanium-ceramic dish burning rendered candlefish/salmon grease
11. `timpar_bear_feast_trough` — carved Bear/Whale-prow grease-and-berry potlatch feast trough
12. `timpar_attus_bale_bench` — adzed cedar bench stacked with folded mountain-elm *attus* bark-cloth bales
13. `timpar_copper_shield_crest` — cold-hammered native Veiled-Mountain copper *tináa* wealth-shield on stand
14. `timpar_dugout_paddle_rack` — rack of painted red-cypress river dugout paddles & salmon harpoons

---

## 5. Fragment Layout & Phased Verification Gates (`TK0`–`TK5`)

| Fragment | `[G]` Tag | Responsibility |
|---|---|---|
| `00-head.html` | `[web]` | Page title & HUD header |
| `26k-kit.js`, `52z-tk-vocab.js` | `[G data]` | `KIT` identity, `TK_STYLES` (`jomon`, `plank`, `crest`), `TK_CRESTS` (5 clan crests), `SV_LIB`, `SV_CLOTH`, `SV_CUT`, `SVPAL`, `KTAGS.VOCAB` registration |
| `27v-tk-vstack.js`, `27z-tk-matfix.js` | `[G shader]` / `[draw]` | K1 uniform dedup, M2 specular AA, M3 POM, M4 base AO, salmon-egg tempera sheen & nephrite glow |
| `34-tk-trades.js` | `[G data]` | `TK_TRADES` (`44` Voth census rows, `41` active, `0` gaps) + `tkRigMath` (plank-pitch, *kaen* crown profile, *pu* rat-guard, formline z-steps, wind pin weights) |
| `39-tk-furn.js` | `[draw]` | `14` bespoke `timpar_*` `KratorFurniture` defs w/ triplanar library detail |
| `40-tk-kit.js` | `[draw]` | `// prefix: tk` — split-cedar plank walls, *irori* pits, *kaen-doki* smoke-pots, *pu* stilt posts, *inau*/*nusa* builders, `Kanopi` rib-arches, `42-et-head.js` war-loot wrapper |
| `41-tk-formline.js` | `[draw]` | `// prefix: tk` — z-stepped Tlingit ovoid/U-form/split-U/trigon screen & 3D stacked totem-pole / oval mouth-portal builder |
| `50-tk-dwell.js` | `[draw]` | `// prefix: tk` — all `10` poor, middle & rich dwellings (`35001–35010`) |
| `54-tk-sacred.js`, `58-tk-fort.js` | `[draw]` | `// prefix: tk` — `6` clan/sacred/`Kanopi` shrines (`35101–35106`) + `6` *chasi-noow* ridge forts, trophy gate & ambush works (`35201–35206`) |
| `62-tk-trades.js`, `64-tk-crafts.js` | `[draw]` | `// prefix: tk` — `16` salmon weir, grease try-works, dugout canoe, totem carver, camas earth-oven, *pu* granary, pony-hound corral, copper forge & barter works (`35301–35316`) |
| `89-rows.js`, `90z-tk-atmos.js`, `91z-tk-world.js`, `99-host-tz-tk.js` | `[G data]` / `[G shader]` / `[web]` | Sheet rows, `ATMOS` wind/mist hook, `KDRAWN` spur/pit/stream ground, `WATER.flow`/`still`, `kits/resources` lodes, `TKK` `tkDims()`, clean preset views & `_api` audits |

### Verification Gates (`verify.py --assert`)
- **TK0 (Data & Math):** `node kits/timpar-kuran/tests/test-timpar-kuran.js` (`tools/ktest.js`) + `python3 tools/check_trades.py kits/timpar-kuran` (`0` gaps).
- **TK1–TK3 (Kit & Audits):** `100%` packed PBR textures (`0` untextured lit meshes), `zfightAudit` (`0` coplanar overlaps), `totemPortalAudit` (every totem-mouth doorway operable via `KDOOR` & walkable via `reachAudit`), `lootHeadAudit` (captured Eternian heads present on fort/feast halls via `42-et-head.js`, zero reverent door-masks).
- **TK4–TK5 (Bundle & GPU Survey):** `kit_bundle.py` (`TKK` sealed world bundle tested in Node), `check_core_use.py`, and `KRATOR_GL=gpu python3 kits/timpar-kuran/verify.py kits/timpar-kuran/dist/timpar-kuran.html --assert --cut --night` passing `100%` of `harness.SURVEY`.
