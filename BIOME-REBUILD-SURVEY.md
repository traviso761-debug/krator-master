# Biome Kits — Individualized Survey for the Stage 8 All-Builds Rebuild

**Branch:** `claude/vertical-stack`  
**Companion Docs:** `GRAPHICS-TERRAIN-PROPOSAL.md` (§3–7, §11, §12c–12d), `TODO.md` (*"Ride along with the next all-builds rebuild"*), `KIT-REBUILD-SURVEY.md`, `STAGE-3-4-REPORT.md`, `STAGE-5-REPORT.md`, `STAGE-6-7-REPORT.md`  
**Scope:** All **64** directories under `biomes/`: **48** active/built biome folders (`47` standalone/station page builds producing **196** `dist/*.html` pages + **1** headless companion flora sub-kit `biomes/gills`) and **16** unbuilt `PLAN.md` biome folders.

---

## 0. Mandatory Rebuild Order, Page-Cap Watch & Cross-Biome Rules

### 0.1 Dependency Order Inside Stage 8
1. **Land shared core terrain, shadow, water & biome changes first:**
   - `core/terrain/35-core-strata.js`: add `obsidian` (`biomes/twins`, `TODO.md:95`) and `opal-rhyolite` / `opal-firetuff` (`biomes/opalvalley`, `TODO.md:196`).
   - `core/terrain/39c-core-karst.js`: deduplicate multi-level sink/shaft/doline ids (`sink:<lv>:<si>,<sj>`, `TODO.md:140`) -> reaches `hearths`, `swhighlands`, `nwbay`.
   - `core/terrain/43-core-ground.js`: deduplicate inline `kEye()` via `K.EYE` (`TODO.md:133`) and apply `S6` chromatic crease/lift/aspect tinting (`B5`).
   - `core/shadow/host/12-core-shadow-host.js`: replace declared-sampler count with Throne's linked-sampler `samplersOf` capped at `min(16, GL)` (`TODO.md:204`).
   - `core/water/51-core-water-kinds.js` & `ext/57-core-water-audit.js`: land gradient-noise `drawFlow` foam breakup (`TODO.md:155`, `149` build commands) and `KDRAWN.h` water audit (`B5`).
   - `core/biome/*` (`20-core-kit.js`, `30-core-foliage.js`, `40-core-place.js`, `44-core-stage.js`) + `godot/shaders/foliage.gdshader`: land **`B1`–`B5`** (`GRAPHICS-TERRAIN-PROPOSAL.md` §12d).
2. **Rebuild companion & producer biome kits before hosts that borrow them in place:**
   - `biomes/gills` (`pack.py` if touched) before `biomes/xanadu --station gills` and `biomes/godthrone --station gills` / `gills-ladder`.
   - Borrowed kin kits (`sedesert`, `hyperjungle`, `nwlowlands`, `swlowlands`, `swbay`, `nsemiarid`, `ehighlands`, `crater-drylands`, `hearths`) before composite hosts (`ringisles`, `throne`, `scablands`, `swhighlands`, `godshearth`).
3. **Run station & preview commands (`tools/build.py --all` + 1 explicit preview command):**
   - `python3 tools/build.py --all` automatically runs plain `build.py` plus every `stations/<name>/` entry in `test_all.extra_builds()` (including all **13** extra Throne stations, **9** Rift Rim stations, **9** Godthrone stations, etc., and newly records `opalvalley`'s 4 station pages in `build-inputs.json`).
   - **CRITICAL EXTRA COMMAND:** `test_all.extra_builds()` does **not** run `--preview` flags. Explicitly run:
     ```bash
     python3 tools/build.py biomes/swhighlands --station pillars --preview span
     ```
     so `dist/swhighlands-pillars-span.html` does not go stale.
4. **Rebuild downstream biome consumers after `biomes/*`:**
   - **Open-world regions (`openworld/*`):** `isle-demo`, `iziz-cluster`, `network-proposal`, `north-basin`, `oidong-highrift`, `pinnacle`, `xanadu-lake-shore`, `xanadu-north-shore`, `xanadu-oidong-highrift`.
   - **Settlements (`settlements/*`):** `azure-dream`, `dalab`, `dhelv`, `girder`, `highlands`, `iziz`, `kirstabal`, `lightwall`, `locus`, `longsong`, `mungo`, `pher`, `pinnacle-rock`, `qiblai`, `shade`, `span`, `thalaba`, `verge`, `voth`, `xanadu`, `ys`, `yuni`.
   - **Kits & Godot exporters:** `kits/crops`, `kits/fauna`, `kits/metropolis`, `kits/qiblai`, `kits/eternian`, `kits/yeti`, `kits/resources`, `godot/tools/export_spike.py`.

### 0.2 Inline HTML Page-Cap Watch (`16.0 MB` Cap, `14.4 MB` `90%` Warning)
`17` biomes already split textures into `.tex.<biome>.js` sidecars (`~1.0–5.1 MB` HTML). The remaining `30` page-producing biomes inline their WebP packs (`tex=inline`). Watch or split these **11 largest inline biomes** before promoting smooth surfaces to `8-bit` `xy8` normals or adding species/packs:
1. **`biomes/xanadu`** — `xanadu-floor.html` is **`12.07 MB`** (`75%` of cap; `47` mats, `32` cards). **Split into `.tex.xanadu.js` sidecars before the post-merge Xanadu graphics expansion.**
2. **`biomes/greenstep`** — `4` of `6` pages are **`11.42–11.47 MB`** (`72%` of cap).
3. **`biomes/abyssal-savannah`** — `bench` **`11.46 MB`**, `belt` **`10.92 MB`**, main **`10.70 MB`** (`36` mats).
4. **`biomes/nwlowlands`** — both pages **`10.09 MB`** (`54` mats, `28` cards).
5. **`biomes/greatchasm`** — `deep` **`10.06 MB`**, `3` pages `8.71–8.72 MB`.
6. **`biomes/nhighlands`** — `foothills` **`10.01 MB`**, `4` pages `8.16–8.76 MB` (`61` mats — largest inline `materials.json` in `biomes/`).
7. **`biomes/crater-drylands`** — `s` **`9.88 MB`**, `salt` **`9.56 MB`**, `edge` **`9.39 MB`**.
8. **`biomes/sedesert`** — `steppe` **`9.85 MB`**, `mantis` **`8.78 MB`** (`58` mats).
9. **`biomes/scablands`** — `highline-nw` **`9.80 MB`**.
10. **`biomes/nwbay`** (`caverns` **`9.22 MB`**, `49` mats) & **`biomes/catch`** (`4` pages at **`9.21 MB`**).

### 0.3 Cross-Biome Feature Gap Summary
- **`KDRAWN` (`B5`):** `0 / 48` biomes load `core/drawn/10-core-drawn.js` today. Wiring `KDRAWN.h` in `44-core-stage.js` + `BIO.attachAudit` + `cliffOld` + `57-core-water-audit.js` upgrades plant-float and water-surface auditing across all `41` `44-core-stage` biomes at once (`7` older/custom hosts need direct registration: `dambasins`, `ehighlands`, `korona`, `nsemiarid`, `outlands`, `scablands`, `shighlands`, `throne`).
- **Missing `INDEX_ITEMS` / `LOD.merge` / `LOD.cull` (`B4`):** `15` built biomes lack `INDEX_ITEMS` (`catch`, `crater-drylands`, `cut`, `dambasins`, `ehighlands`, `farside`, `geyser`, `godshearth`, `guilin`, `hearths`, `k-guilin`, `korona`, `neouterwall`, `nwouterwall`, `throne`, `wouterwall` — `16` total; `throne` has `LOD.merge` only). Turning `BIO.INDEX_ITEMS = true` and `BIO.setA2C` on in `44-core-stage.js` immediately converts triangle-soup items to indexed buffers across `12` of those `16`.
- **Missing `KSHADOW` (`11` biomes):** `dambasins`, `eastabyss`, `ebadlands`, `guilin`, `hyperjungle`, `necanyons`, `nwlowlands`, `rift`, `sedesert`, `swbay`, `swlowlands`. Several omitted `KSHADOW` because ground shaders were at `15/16` WebGL2 texture units (`sedesert`, `highrift-mirror`, `swhighlands` st. 1); moving ground sets onto `v3_arrays_three_maps` (`3` samplers total) frees `10+` fragment samplers so `KSHADOW` + `KHORIZON` fit cleanly under `min(16, GL)`.

---

## 1. Xanadu, Oidong, High Rift & Inner Rift Rim (7 Biomes)

### 1.1 `biomes/xanadu` *(6 stations, 47 fragments, 47 materials / 32 cards, **INLINE `7.33–12.07 MB`**)*
- **Build Commands:** `build.py` + `--station cloud|descent|floor|gills|ranges` (`xanadu-floor.html` = `12.07 MB`).
- **Rebuild & Post-Merge Priority:** Split textures into `xanadu.tex.*.js` sidecars so `xanadu-floor.html` drops from `12.07 MB` to `~1.8 MB` ahead of the post-merge Xanadu graphics expansion (`TODO.md:71-77`, `GRAPHICS-TERRAIN-PROPOSAL.md` §12c).
- **`B1`–`B5` & `M1`/`M2` Notes:** Uses `iridBark` (`B3` uniform dedup saves programs across prism gum & kin), `32` cut-out cards (`B4` `libSwap` fringe dilation + Gate 1 alpha guard), and smooth `bark1` (`wood.petrified`), `ice.glacier`, `ice.clear` (`stations/ranges` & `gills`, `8-bit`/`hemi-oct8` + `mipVariance`). Complete owed Arc GPU verify (`KNOWN_ISSUES.md`).
- **Downstream Reach (11):** `openworld/xanadu-lake-shore`, `xanadu-north-shore`, `xanadu-oidong-highrift`, `settlements/xanadu`, `pher`, `kirstabal`, `lightwall`, `qiblai`, `thalaba`, `azure-dream`, `kits/qiblai`.

### 1.2 `biomes/gills` *(Headless companion flora sub-kit — `src/44-gills-life.js`, 4 materials / 2 cards, `tests/test-gills.js`)*
- **Role:** No standalone HTML page; supplies gill-slot collars, fringes, dew mats, and pipe laminae to `biomes/xanadu --station gills` and `biomes/godthrone --station gills` / `gills-ladder`.
- **Rebuild Notes:** Keep `collar.albedo` and `fringe.albedo` under Gate 1 cut-out protection + `B4` `libSwap` fringe dilation; run `node biomes/gills/tests/test-gills.js` and GPU-verify `xanadu-gills.html` (only SwiftShader-checked so far per `KNOWN_ISSUES.md`).

### 1.3 `biomes/oidong` *(3 stations, 24 fragments, 24 materials / 10 cards, inline `3.48–3.53 MB`)*
- **Build Commands:** `build.py` + `--station hearths|passes`.
- **Vertical-Stack Reference:** Already served as our Stage 3/4 canyon benchmark (`shots/18`, `20a`, `20b`). Fully adopts `44-stage`, `KGROUND`, `KSTRATA`, `KSHADOW`, `KHORIZON`, `setA2C`, `INDEX_ITEMS`, `LOD.merge`/`cull`, `iridBark`.
- **`B1`–`B5` & `M1`/`M2` Notes:** Gains `B3` `iridBark` + foliage program dedup, `B2` crown/bole AO, `B4` `libSwap` card-fringe dilation (`10` cards), and `8-bit` smooth normals on `bark.bamboo` (`bark.bamboo.jade`) and `organic.cap` (`organic.chalicecap`).
- **Downstream Reach (4):** `openworld/oidong-highrift`, `xanadu-oidong-highrift`, `settlements/longsong`, `qiblai`.

### 1.4 `biomes/highrift` *(5 stations, 20 fragments, 11 materials / 2 cards, inline `4.93–5.94 MB`)*
- **Build Commands:** `build.py` + `--station coulee|gjar|mirror|wedge`.
- **Sampler Headroom Fix (`mirror`):** `highrift-mirror.html` (`84-host-ground.js`) previously hit the 16-sampler limit on real GPUs (`KNOWN_ISSUES.md`). Adopting `v3` ground texture arrays (`3` samplers) + linked `KSHADOW.units` (`TODO.md:204`) resolves `mirror`'s sampler pressure permanently.
- **`M1`/`M2` Smooth Promotion:** Prime smooth geological set: `rock.hematite.mirror` (fault mirror scarp!), `ground.sinter`, `ground.travertine.white`, `ground.travertine.acid` -> `8-bit`/`hemi-oct8` + `mipVariance`. Complete owed GPU verify on all 5 pages.
- **Downstream Reach (2):** `openworld/oidong-highrift`, `openworld/SITES.json`.

### 1.5 `biomes/opalvalley` *(5 stations, 22 fragments, 13 materials / 2 cards, inline `6.05–8.15 MB`)*
- **Build Commands:** `build.py` + `--station glacier|lowerbed|riftmouth|upperbed` (running via `tools/build.py --all` also records the 4 currently untracked station HTMLs in `build-inputs.json`).
- **Parked `TODO.md` Item (`TODO.md:196-198`):** Move `opal-rhyolite` and `opal-firetuff` from `biomes/opalvalley/src/40-biome-opal-sites.js` (`OPAL_STRATA`) into `core/terrain/35-core-strata.js`'s `RECIPES`, then drop `KSTRATA.add` from Opal Valley.
- **`M1`/`M2` Smooth Promotion:** High-value specular surfaces: `ice.clear` (`KGLACIER` seracs & ice caves), `ice.glacier`, `ice.debris`, `ground.sinter` (opaline sheen `aOp`), `rock.lichen.iris`, `rock.basalt.titanium` (walk-in adit), plus `B3` `iridBark`. Complete real-GPU verify (`KNOWN_ISSUES.md`).
- **Downstream Reach (3):** `settlements/lightwall`, `settlements/qiblai`, `kits/resources`.

### 1.6 `biomes/riftrim` *(9 stations, 27 fragments, 42 materials / 23 cards, inline `6.98–8.72 MB`)*
- **Build Commands:** `build.py` + `--station barrens|fowlers|gorge|hearths|ice|icecut|lakes|ledge|pass` (`ledge` writes `riftrim.html`).
- **`B1`–`B5` Notes:** Uses both `backlit` (`B1` normal-gated leaf transmittance) and `iridBark` (`B3` shader dedup across 9 stations), plus `23` cards (`B4` `libSwap` fringe dilation fixes pale/fringed mist-frill & fog-drip cards noted in `KNOWN_ISSUES.md`).
- **Downstream Reach (14):** Almost every northern/Xanadu `openworld/*` region (`9` builds), `settlements/longsong`, `qiblai`, `azure-dream`, `kits/catalog`.

### 1.7 `biomes/rift` *(6 stations, 49 fragments, 42 materials / 27 cards, inline `1.33–7.80 MB`)*
- **Build Commands:** `build.py` + `--station highland|jungle|maze|plateau|savannah` (**nightly critical build**: `dist/rift.html`).
- **Core Gaps to Wire:** Currently lacks `KSHADOW` and `KHORIZON`. Uses `iridBark` and `farMat` (`irid`) -> benefits directly from `B3` uniform dedup, `B2` crown/bole AO, and `B4` `libSwap` dilation across `27` cards.
- **`M1`/`M2` Smooth Promotion:** `ground.salt`, `towerConcrete`, `towerRust`.
- **Downstream Reach (`godot/tools` + `settlements/kirstabal`, `qiblai`, `9` `openworld/*` regions):** Re-export Godot data if exported recipes change.

---

## 2. Volcanic Steps, Calderas, Thermal & Hearth Provinces (9 Biomes)

### 2.1 `biomes/throne` *(14 stations, 144 fragments, 131 materials / 51 cards, `.tex` split: `0.91–1.33 MB` HTML + `21.5 MB` sidecars)*
- **Build Commands:** `build.py` + `--station ashdesert|blast|caldera|cloudforest|delta|frontier|glacier|isle|kipuka|penitentes|savanna|tube|vents` (`14` pages).
- **Parked `TODO.md` Item (`TODO.md:204-208`):** Promote Throne's `samplersOf` (`biomes/throne/src/89zz-host-core.js`) into `core/shadow/host/12-core-shadow-host.js` (`KSHADOW.units`, capped at `min(16, GL)`), then drop Throne's local copy! Also verify `KGROUND`'s `relief.micro: 2` guard here (`GRAPHICS-TERRAIN-PROPOSAL.md:586`).
- **Core Gaps to Wire:** Custom host (`89zz-host-core.js`, no `44-core-stage.js`) lacks `BIO.INDEX_ITEMS = true`, `BIO.LOD.cull = true`, and `KDRAWN.h` registration — add all three directly in `89zz-host-core.js`!
- **`M1`/`M2` Smooth Promotion (`13` slots, `51` cut-out cards):** `ground.iceclear`, `ground.ice`, `ground.sinter`, `ground.rim` (`travertine.acid`), `ground.tufa`, `ground.mud`, `ground.rockwet`, `bark.shingle` (`organic.chitin.shingle`); Gate 1 guard on all `51` cards.
- **Downstream Reach (3):** `openworld/isle-demo`, `network-proposal`, `settlements/dhelv` (`settlements/girder`).

### 2.2 `biomes/godthrone` *(10 stations, 49 fragments, 25 materials / 1 card, inline `2.55–3.68 MB`)*
- **Build Commands:** `build.py` + `--station blood|flank|gills-ladder|gills|orange|rim|scarp|tube|wall`.
- **`B1`–`B5` & `M1`/`M2` Notes:** Complete modern adoption (`KGROUND`, `KSTRATA`, `KSHADOW`, `KHORIZON`, `setA2C`, `INDEX_ITEMS`, `LOD.merge`/`cull`). Promote smooth volcanic/glacial slots (`glass` -> `ground.obsidian`, `iceGlacier`, `iceRust`, `iceDebris`, `rock.basalt.titanium`) to `8-bit`/`hemi-oct8` + `mipVariance`. Reads `biomes/gills` on `gills` and `gills-ladder`.

### 2.3 `biomes/godstep` *(5 stations, 57 fragments, 19 materials / 0 cards, inline `2.39–3.78 MB`)*
- **Build Commands:** `build.py` + `--station hearths|redlands|rille|wall`.
- **Rebuild Notes:** Full modern stage stack (`MISSING: []`). Promote `rock.basalt.titanium` and `ground.salt`; run owed real-GPU verify across stations 2–5 and station 1 (`15` sampler units, `KNOWN_ISSUES.md`).

### 2.4 `biomes/greenstep` *(6 stations, 21 fragments, 14 materials / 6 cards, **INLINE `6.00–11.47 MB`**)*
- **Build Commands:** `build.py` + `--station cloudstep|gatestep|headvent|loamstep|rilleforge|tallwalls` (`tallwalls` writes `greenstep.html`).
- **Page-Cap Watch:** `rilleforge` (`11.47 MB`), main (`11.43 MB`), `gatestep` (`11.42 MB`), `loamstep` (`11.42 MB`) — split into `.tex.greenstep.js` if adding `site.tallwalls` settlement preview or new textures.
- **`B1`–`B5` Notes:** Uses `backlit` (`B1` leaf normal gate), `6` cards (`B4` `libSwap` dilation), and `rock.basalt.titanium`. Run owed GPU verify on all 6 pages (`KNOWN_ISSUES.md`).
- **Downstream Reach (10):** `7` `openworld/*` regions + `settlements/longsong`, `azure-dream`.

### 2.5 `biomes/twins` *(6 stations, 44 fragments, 13 materials / 2 cards, inline `2.20–2.74 MB`)*
- **Build Commands:** `build.py` + `--station brazier|catchlookout|erebustwin|lavasump|pyroduct|shroudvale` (`pyroduct` writes `twins.html`).
- **Parked `TODO.md` Item (`TODO.md:95-97`):** Add `obsidian` recipe to `core/terrain/35-core-strata.js` (`scoria` already landed), then switch station 1's coulee/spatter-cone faces from `tibasalt` stand-in to `obsidian`!
- **`M1`/`M2` Smooth Promotion:** Signature glassy volcanic set: `obsidian` (`stone.obsidian`), `sinter`, `travertine`, `ice` (`ice.glacier`), `rock.basalt.titanium` -> prime `8-bit`/`hemi-oct8` + `mipVariance` beneficiaries.
- **Downstream Reach (1):** `openworld/xanadu-oidong-highrift` (+ `7` regions referencing Twins).

### 2.6 `biomes/firebliss` *(4 stations, 19 fragments, 26 materials / 6 cards, `.tex` split: `1.78 MB` HTML + `16.1 MB` sidecars)*
- **Build Commands:** `build.py` + `--station east|glen|mons`.
- **`M1`/`M2` Smooth Promotion:** Already `.tex`-split! Promote `stone.obsidian` (`specular: 0.6, roughLift: 0.0`), `ice.glacier` (`specular: 0.5`), `ground.sinter`, and `rock.basalt.flowbanded` to `8-bit`/`hemi-oct8` + `mipVariance` with zero HTML size impact.
- **Downstream Reach (3):** `openworld/xanadu-lake-shore`, `xanadu-north-shore`, `xanadu-oidong-highrift`.

### 2.7 `biomes/geyser` *(6 stations, 33 fragments, 37 materials / 14 cards, `.tex` split: `1.27–1.43 MB` HTML + `48.4 MB` sidecars)*
- **Build Commands:** `build.py` + `--station basin|corona|ice|puna|stills`.
- **Core Gaps to Wire:** Uses `44-core-stage` (so `B4` defaults automatically give it `setA2C` and `INDEX_ITEMS`), plus wire `BIO.LOD.merge` / `LOD.cull` on its multi-pass host.
- **`M1`/`M2` Smooth Promotion:** Wet/geothermal showcase (`rock.wet.dark`, `ground.sinter` 1024px, `ground.tufa` 1024px, `stone.geyserite`, `glass.frosted`, `ice.aufeis`, `ground.mud` `specular: 0.4`, `ground.salt`) — already sidecar-split so `8-bit` normals cost zero HTML bytes!
- **Downstream Reach (1):** `openworld/isle-demo`.

### 2.8 `biomes/godshearth` *(1 built station in `stations/prismbasin/`, 7 fragments, `.tex` split: `1.43 MB` HTML + `6.2 MB` sidecar)*
- **Build Commands:** `build.py` / `--station prismbasin` -> `dist/godshearth.html`.
- **Core Gaps to Wire:** Uses `44-core-stage` (`KGROUND`, `KSTRATA`, `KSHADOW`, `KHORIZON`); receives `setA2C`, `INDEX_ITEMS`, and `KDRAWN.h` automatically via `B4`/`B5`; add `LOD.merge`/`cull` when caldera dress expands from `biomes/hearths`.
- **Downstream Reach (11):** `openworld/*` (`7` regions) + `settlements/longsong`, `azure-dream`.

### 2.9 `biomes/hearths` *(3 subterranean karst stations, 19 fragments, 4 materials / 0 cards, inline `1.26–1.32 MB`)*
- **Build Commands:** `--station camera|crystals|hold` (subterranean loj/feeder chambers; `KHORIZON` intentionally omitted underground).
- **Parked `TODO.md` Tie-In (`TODO.md:140`):** Inherits `39c-core-karst.js` multi-level sink/shaft/doline ID deduplication (`sink:<lv>:<si>,<sj>`).
- **`B4` & `M1`/`M2` Notes:** Gains `setA2C` + `INDEX_ITEMS` via `44-core-stage`; promote `crystal.selenite` (`mineral.selenite`, `specular: 0.5, roughLift: 0.0`) to `8-bit`/`hemi-oct8` + `mipVariance` so giant selenite prisms gleam cleanly without normal stepping!

---

## 3. Ring Sea Coasts, Lowlands, Jungles & Bays (8 Biomes)

### 3.1 `biomes/ringisles` *(3 stations, 27 fragments, 51 materials / 30 cards, `.tex` split: `3.32–3.35 MB` HTML + `28.1 MB` sidecars)*
- **Build Commands:** `build.py` + `--station high|lagoon`.
- **Composite Kit Note:** Pulls fragments in place from five sibling kits (`swbay`, `sedesert`, `hyperjungle`, etc., `KNOWN_ISSUES.md`) — rebuild after those five! Already `.tex`-split with full modern core stack (`MISSING: []`).
- **`B4` & `M1`/`M2` Notes:** `30` cut-out cards benefit heavily from `B4` `libSwap` fringe dilation + Gate 1 guard; promote `ground.wetsand`, `ground.salt`, `ground.mud`.
- **Downstream Reach (1):** `openworld/isle-demo`.

### 3.2 `biomes/hyperjungle` *(5 stations, 30 fragments, 38 materials / 17 cards, inline `5.17–8.35 MB`)*
- **Build Commands:** `build.py` + `--station lake|north|savage|savanna` (**nightly critical build**: `dist/hyperjungle.html`).
- **Core Gaps & Upgrades:** Lacks `KSHADOW` and `KSTRATA`. Heavy `backlit` canopy user (`B1` leaf-normal transmittance gate + `B2` volumetric crown self-occlusion `_COLOR` + `B3` foliage shader dedup across 150–305 m hypertrees). Promote `howlculm` (`bark.bamboo.jade`), `towerConcrete`, `towerRust`; run GPU verify on `J2`–`J6` land stations (`KNOWN_ISSUES.md`).
- **Downstream Reach (12):** `7` `openworld/*` regions, `settlements/iziz`, `dhelv`, `pinnacle-rock`, `kits/fauna`, `godot/tools`.

### 3.3 `biomes/eastabyss` *(2 stations, 21 fragments, 43 materials / 29 cards, inline `7.98 MB`)*
- **Build Commands:** `build.py` + `--station lakes`.
- **Core Gaps & Upgrades:** Lacks `KSHADOW` (enable once ground array samplers free headroom). Uses both `backlit` (`B1`) and `iridBark` (`B3`), plus `29` cut-out cards (`B4` `libSwap` fringe dilation). Smooth promotion on `bark4` (`wood.bamboo001c`), `towerConcrete`, `towerRust`.
- **Downstream Reach (8):** `openworld/isle-demo`, `iziz-cluster`, `pinnacle`, `settlements/locus`, `mungo`, `verge`, `kits/catalog`, `kits/fauna`.

### 3.4 `biomes/abyssal-savannah` *(6 stations, 41 fragments, 36 materials / 19 cards, **INLINE `4.87–11.46 MB`**)*
- **Build Commands:** `build.py` + `--station belt|bench|erim|north|serim`.
- **Page-Cap Watch:** `bench` (`11.46 MB`), `belt` (`10.92 MB`), main (`10.70 MB`) — candidate for `.tex.abyssal-savannah.js` split if `eastabyss` exchange or new packs are added. Full modern feature stack (`MISSING: []`); `19` cards gain `B4` fringe dilation.
- **Downstream Reach (3):** `openworld/iziz-cluster`, `pinnacle`, `kits/crops`.

### 3.5 `biomes/nwbay` *(2 stations, 20 fragments, 49 materials / 26 cards, **INLINE `8.99–9.22 MB`**)*
- **Build Commands:** `build.py` + `--station caverns`.
- **Rebuild Notes:** Full modern feature stack (`MISSING: []`). Uses `backlit` (`B1`), `26` cards (`B4` `libSwap` dilation), and karst caverns (`39c-core-karst.js` sink ID fix). Smooth promotion on `groundTrav` (`ground.travertine.white`), `bark4` (`wood.bamboo001c`), `jettyStone`. Complete owed Arc GPU verify (`KNOWN_ISSUES.md`).
- **Downstream Reach (2):** `settlements/ys`, `kits/fauna`.

### 3.6 `biomes/swbay` *(1 station, 16 fragments, 39 materials / 19 cards, inline `8.51 MB`)*
- **Build Commands:** `build.py` (`dist/swbay.html`).
- **Core Gaps & Upgrades:** Lacks `KSHADOW`. Uses `backlit` (`B1`), `BIO.fung` caps/brackets (`B2` base grounding), and `19` cards (`B4` `libSwap` dilation).
- **Downstream Reach (4):** `openworld/isle-demo`, `settlements/voth`, `kits/fauna`, `godot/tools`.

### 3.7 `biomes/nwlowlands` *(2 stations, 21 fragments, 54 materials / 28 cards, **INLINE `10.09 MB`**)*
- **Build Commands:** `build.py` + `--station margins` (**rebuild after `biomes/swlowlands`**, whose `SWLOW.make`/`grow` `87k-host-kin.js` reads per `KNOWN_ISSUES.md`!).
- **Page-Cap & Triangle Budget Watch:** Both pages are `10.09 MB` inline (`54` mats) and peak at `7.49M / 7.50M` drawn triangles (`KNOWN_ISSUES.md`). Split `.tex` sidecars before promoting smooth normals; do **not** increase geometry density here.
- **`B1`–`B5` Notes:** Lacks `KSHADOW`; uses `backlit` (`B1`) and `glossBark` (`B3` shader dedup + `M2` specular AA), plus `28` cards (`B4`).
- **Downstream Reach (1):** `kits/metropolis`.

### 3.8 `biomes/swlowlands` *(3 stations, 18 fragments, 47 materials / 25 cards, `.tex` split: `1.80 MB` HTML + `27.9 MB` sidecars)*
- **Build Commands:** `build.py` + `--station delta|gorge` (build **before** `nwlowlands`, `swhighlands`, `wouterwall`).
- **Core Gaps & Upgrades:** Already `.tex`-split! Lacks `KSHADOW`. Uses `backlit` (`B1`), `glossBark` + `farMat('gloss')` (`B3` uniform dedup), and `25` cards (`B4`). Note `11.6M / 12.0M` triangle ceiling (`KNOWN_ISSUES.md`). Promote `bk.cane` (`wood.bamboo001c`) and `ground.bayoumud`.
- **Downstream Reach (2):** `settlements/dalab`, `kits/metropolis` (+ kin readers `nwlowlands`, `swhighlands`, `wouterwall`).

---

## 4. Highlands, Karst Showcases & Glaciers (8 Biomes)

### 4.1 `biomes/nhighlands` *(5 stations, 40 fragments, 61 materials / 28 cards, **INLINE `8.16–10.01 MB`**)*
- **Build Commands:** `build.py` + `--station alpine|bogs|foothills|montane` (`foothills` = `10.01 MB`).
- **Page-Cap Watch:** Largest inline `materials.json` (`61` slots) in `biomes/`; split `.tex.nhighlands.js` before `8-bit` normal promotions. Full modern feature stack (`MISSING: []`); uses both `backlit` (`B1`) and `iridBark` (`B3`), `28` cards (`B4`), and `ground.slickrock`. Complete owed GPU verify on stations 1–4 (`KNOWN_ISSUES.md`).
- **Downstream Reach (1):** `settlements/highlands`.

### 4.2 `biomes/ehighlands` *(6 stations, 28 fragments, 28 materials / 13 cards, inline `2.75–4.00 MB`)*
- **Build Commands:** `build.py` + `--station face|lesser|mixed|montane|treeline`.
- **Core Gaps to Wire:** Custom host (no `44-core-stage.js`) lacks `BIO.INDEX_ITEMS`, `LOD.merge`, `LOD.cull`, and `KDRAWN.h` — wire directly in its host build fragment (`B4`/`B5`). Uses `backlit` (`B1`), `13` cards (`B4`), and smooth `ground.sinter` + `stone.basalt`.

### 4.3 `biomes/shighlands` *(3 stations, 24 fragments, 33 materials / 12 cards, inline `3.57–4.79 MB`)*
- **Build Commands:** `build.py` + `--station conifers|fellfield`.
- **Core Gaps & Upgrades:** Custom host lacks `44-core-stage` (register `KDRAWN.h` directly for `B5`; already wires `INDEX_ITEMS`, `LOD.merge`/`cull`, `KSHADOW`, `KHORIZON`). Uses `iridBark` (`B3` dedup on coilbark) and smooth `ice.glacier` (`specular: 0.5, roughLift: 0.0`) + `ground.wetmoss`.

### 4.4 `biomes/swhighlands` *(7 stations + 1 Span preview = 8 pages, 66 fragments, 32 materials / 8 cards, inline `4.48–8.43 MB`)*
- **Build Commands:** `build.py` + `--station caverns|coast|pillars|rainwall|span|treeline` **PLUS explicit preview:** `python3 tools/build.py biomes/swhighlands --station pillars --preview span` (`dist/swhighlands-pillars-span.html`).
- **Rebuild Notes:** Full modern feature stack (`MISSING: []`), plus `39c-core-karst.js` (`caverns`, inherits sink ID fix `TODO.md:140`) and `backlit` (`B1`). Moving station 1's ground onto `v3` texture arrays (`3` samplers) allows `89zz-host-shadow.js` (`KSHADOW`) to enable on station 1 as well as `rainwall`/`span`/`caverns`/`coast` (`build.py:161`).
- **Downstream Reach (1):** `settlements/span`.

### 4.5 `biomes/guilin` *(1 showcase page, 12 fragments, 31 materials / 19 cards, `.tex` split: `0.99 MB` HTML + `4.8 MB` sidecar)*
- **Build Commands:** `build.py` (`dist/guilin.html` — unplaced South China karst reference showcase).
- **Core Gaps to Wire:** Uses `44-core-stage` (so `B4`/`B5` automatically add `setA2C`, `INDEX_ITEMS`, `KDRAWN.h`), but lacks `KGROUND`, `KSTRATA`, `KSHADOW`, `KHORIZON`, `LOD.merge`/`cull`. Promote `bark.bamboo.jade` and `ground.mud`; `19` cards get `B4` fringe dilation.

### 4.6 `biomes/k-guilin` *(1 scale-model karst page, 15 fragments, 31 materials / 19 cards, `.tex` split: `1.43 MB` HTML + `11.3 MB` sidecars)*
- **Build Commands:** `build.py` (`dist/k-guilin.html`).
- **Core Gaps & Upgrades:** Already wires `KGROUND`, `KSTRATA`, `KSHADOW`, `KHORIZON`, `backlit` (`B1`), and `.tex` sidecars; `B4` defaults in `44-core-stage` add `INDEX_ITEMS`, plus wire `LOD.merge`/`cull`. Smooth promotion on `bark.bamboo.jade` and `ground.mud`.

### 4.7 `biomes/copperglacier` *(3 stations, 15 fragments, 18 materials / 4 cards, inline `4.92 MB`)*
- **Build Commands:** `build.py` + `--station icefield|pass`.
- **`M1`/`M2` Smooth Promotion Showcase:** Full modern feature stack (`MISSING: []`), `backlit` (`B1`), `iridBark` (`B3`), and four high-specular glacier ice materials (`ice.clear` `specular: 0.6, roughLift: 0.05`, `ice.glacier.verdigris` `0.5`, `ice.glacier` `0.5`, `ice.debris`) — top beneficiary of `8-bit`/`hemi-oct8` + `mipVariance` specular AA!

### 4.8 `biomes/korona` *(6 stations, 30 fragments, 35 materials / 17 cards, `.tex` split: `1.47–1.80 MB` HTML + `39.9 MB` sidecars)*
- **Build Commands:** `build.py` + `--station basin|gorge|hoar|hollow|trench`.
- **Core Gaps to Wire:** Custom host (no `44-core-stage.js`) lacks `BIO.INDEX_ITEMS`, `LOD.merge`, `LOD.cull`, and `KDRAWN.h` — wire directly in Korona's host build fragment (`B4`/`B5`). Already `.tex`-split; promote `ice` (`ice.glacier`, `specular: 0.5`) to `8-bit`/`hemi-oct8` + `mipVariance`, and dilate `17` cards (`B4`).

---

## 5. Arid Basins, Deserts, Canyons & Badlands (9 Biomes)

### 5.1 `biomes/sedesert` *(4 stations, 45 fragments, 58 materials / 25 cards, **INLINE `5.87–9.85 MB`**)*
- **Build Commands:** `build.py` + `--station bowl|mantis|steppe` (**nightly critical build**: `dist/sedesert.html`).
- **Page-Cap & Sampler Fix:** `steppe` is `9.85 MB` inline (`58` mats) and its ground shader holds `15/16` texture units (`KNOWN_ISSUES.md`, blocking wet ground and `KSHADOW`). Splitting `.tex.sedesert.js` + adopting `v3` ground texture arrays (`3` samplers) unlocks both `KSHADOW` and wet playa ground while shrinking `sedesert-steppe.html` below `~2 MB`!
- **Shared File Caution:** Keep `biomes/sedesert/src/35-core-strata.js` intact until its readers (`ringisles`, `verge`, `shade`, `isle-demo`) point at `core/terrain/35-core-strata.js` (`KNOWN_ISSUES.md`).
- **Downstream Reach (14):** `9` `openworld/*` regions, `settlements/shade`, `verge`, `kits/crops`, `kits/fauna`, `godot/tools`.

### 5.2 `biomes/crater-drylands` *(4 station builds -> 5 HTML pages, 29 fragments, 27 materials / 14 cards, **INLINE `5.25–9.88 MB`**)*
- **Build Commands:** `build.py` (writes **both** `crater-drylands.html` and `crater-drylands-n.html`) + `--station edge|salt|south` (`crater-drylands-s.html` = `9.88 MB`, `salt` = `9.56 MB`, `edge` = `9.39 MB`).
- **Core Gaps & Page-Cap Watch:** Uses `44-core-stage` (so `B4` defaults automatically turn on `setA2C` and `INDEX_ITEMS`!); also wire `LOD.merge`/`cull` and plan `.tex` sidecar split before adding Godstep/Savannarim packs to `south`.

### 5.3 `biomes/catch` *(4 stations, 22 fragments, 20 materials / 5 cards, **INLINE `9.21 MB`**)*
- **Build Commands:** `build.py` + `--station fan|lake|oasis`.
- **Core Gaps & Page-Cap Watch:** All 4 pages are `9.21 MB` inline. Uses `44-core-stage` (automatically gains `INDEX_ITEMS` via `B4`); wire `LOD.merge`/`cull` on host passes. Smooth promotion on `ground.ochre` (`ground.salt.ochre`), `ground.mud`. Also benefits when `kits/mechs` Stalkers rebuild (`K1`/`K3`).
- **Downstream Reach (11):** `6` `openworld/*` regions, `kits/crops`, `kits/mechs`, `kits/resources`.

### 5.4 `biomes/ebadlands` *(5 stations, 21 fragments, 32 materials / 12 cards, inline `5.61–5.79 MB`)*
- **Build Commands:** `build.py` + `--station canyons|montane|tundra|waste`.
- **Core Gaps & Upgrades:** Lacks `KSHADOW`. Promote `ground.travertine` (`ground.travertine.acid`), dilate `12` cards (`B4`), and apply `B2` base AO to column trees & `BIO.fung.crust` dressings.
- **Downstream Reach (1):** `settlements/yuni`.

### 5.5 `biomes/nsemiarid` *(2 stations, 21 fragments, 39 materials / 14 cards, inline `5.46–8.84 MB`)*
- **Build Commands:** `build.py` + `--station high` (`nsemiarid-high.html` = `8.84 MB`).
- **Core Gaps & Upgrades:** Custom host lacks `44-core-stage` (register `KDRAWN.h` directly for `B5`; already wires `KGROUND`, `KSHADOW`, `KHORIZON`, `setA2C`, `INDEX_ITEMS`, `LOD.merge`/`cull`). Smooth promotion on `organic.chitin` (`roughLift: 0.1`), `ground.slickrock`, `ground.lakebed.shells`.

### 5.6 `biomes/scablands` *(3 stations, 19 fragments, 9 materials / 4 cards, **INLINE `7.15–9.80 MB`**)*
- **Build Commands:** `build.py` (`coulee.html`) + `--station highline|highline-nw` (`highline-nw.html` = `9.80 MB`).
- **Core Gaps & Upgrades:** Custom host lacks `44-core-stage` (wire `KDRAWN.h` directly for `B5`); uses `backlit` (`B1`) and smooth `agate` (`stone.onyx`, `roughLift: 0.0`) + `rust` (`metal.rust.plate`) -> promote `agate` to `8-bit`/`hemi-oct8` + `mipVariance`, and watch `highline-nw.html`'s `9.80 MB` inline size (borrows `nwlowlands` & `nsemiarid`).

### 5.7 `biomes/dambasins` *(3 pages from 1 `build.py`, 12 fragments, `.tex` split: `1.13–1.49 MB` HTML + `25.7 MB` sidecars)*
- **Build Commands:** `build.py` writes `east.html`, `graveyard.html`, and `port.html` in one pass.
- **Legacy Host Debt (`TODO.md:453`, `KNOWN_ISSUES.md`):** Oldest unported biome host — lacks `44-core-stage`, `KGROUND`, `KSTRATA`, `KSHADOW`, `KHORIZON`, `setA2C`, `INDEX_ITEMS`, `LOD.merge`/`cull`, and still copies `settlements/port`'s pre-`core/atmos` sky (going black below the horizon). At minimum wire `BIO.INDEX_ITEMS = true` and `BIO.setA2C` at the rebuild; full `core/host` + `core/atmos` port is tracked in `TODO.md:453`.

### 5.8 `biomes/necanyons` *(3 stations, 21 fragments, 34 materials / 17 cards, `.tex` split: `1.57–1.58 MB` HTML + `39.4 MB` sidecars)*
- **Build Commands:** `build.py` + `--station benches|savanna`.
- **Core Gaps & Upgrades:** Already `.tex`-split! Lacks `KSHADOW`. Promote `rock.top` (`ground.slickrock`, `specular: 0.3`), dilate `17` cards (`B4`), and apply `B2` crown/bole AO to canyon-floor hypertrees & hanging gardens.
- **Downstream Reach (2):** `settlements/pinnacle-rock`, `kits/crops`.

### 5.9 `biomes/greatchasm` *(5 stations, 25 fragments, 21 materials / 10 cards, **INLINE `4.57–10.06 MB`**)*
- **Build Commands:** `build.py` + `--station bench|deep|eastrim|headwall|sill` (`sill` writes `greatchasm.html`; `deep` = `10.06 MB`).
- **Rebuild Notes:** Full modern feature stack (`MISSING: []`). Watch `greatchasm-deep.html` (`10.06 MB` inline) and verify `16`-sampler headroom on real GPUs (`KNOWN_ISSUES.md` — currently SwiftShader-checked). Promote `ground.obsidian` (`roughLift: 0.15`) and `ground.salt` to `8-bit`/`hemi-oct8` + `mipVariance`.

---

## 6. Outer Walls, Megascars, Farside & Outlands (6 Biomes)

### 6.1 `biomes/neouterwall` *(7 stations, 32 fragments, 15 materials / 2 cards, `.tex` split: `1.26–1.51 MB` HTML + `9.9 MB` sidecars)*
- **Build Commands:** `build.py` + `--station badlands|cave|garnet|portal|shoulder|steam`.
- **CRITICAL RED ITEMS IN `TODO.md` (`TODO.md:38-45`):**
  1. **`test_smodel.py` station heights:** `station-garnet` states `2,810 m` vs scale model `3,352 m`; `station-vitreous` states `2,950 m` vs `4,004 m` — reconcile heights or model carves.
  2. **`core/hamlet/test-hamlet.js` harvest phrase:** `HV('thatch, mats, arrow shafts', ...)` — add `'arrow shafts'` to `core/hamlet/10-hamlet-wood.js` during the rebuild (`54` pages) or rename to `poles`.
- **Core Gaps & Smooth Promotion:** Uses `44-core-stage` (gains `INDEX_ITEMS` via `B4`); wire `LOD.merge`/`cull`. Promote `crystal.gypsum` (`stone.alabaster`, `specular: 0.5, roughLift: 0.0`), `ground.sinter`, `rock.basalt.polygonal`; complete real-GPU verify (`KNOWN_ISSUES.md`).

### 6.2 `biomes/nwouterwall` *(3 stations, 16 fragments, 36 materials / 22 cards, `.tex` split: `1.30–1.59 MB` HTML + `31.2 MB` sidecars)*
- **Build Commands:** `build.py` + `--station taiga|yeti`.
- **Core Gaps & Smooth Promotion:** Uses `44-core-stage` (gains `INDEX_ITEMS` via `B4`); add `LOD.merge`/`cull`. Already `.tex`-split — promote `ice.aufeis` and `ice.lake` (`ice.clear`, both `specular: 0.6, roughLift: 0.05`) to `8-bit`/`hemi-oct8` + `mipVariance`, and dilate `22` cards (`B4`).
- **Downstream Reach (2):** `kits/yeti`, `kits/crops`.

### 6.3 `biomes/wouterwall` *(4 stations, 17 fragments, 17 materials / 7 cards, `.tex` split: `1.46–1.63 MB` HTML + `12.8 MB` sidecars)*
- **Build Commands:** `build.py` + `--station edge|slumps|sturzstrom`.
- **Core Gaps & Upgrades:** Uses `44-core-stage` (gains `INDEX_ITEMS` via `B4`); add `LOD.merge`/`cull` and `B4` card dilation (`7` cards). Rebuild after `swlowlands` / `nwlowlands`.
- **Downstream Reach (1):** `kits/crops`.

### 6.4 `biomes/cut` *(3 stations, 20 fragments, 13 materials / 4 cards, `.tex` split: `1.35–1.52 MB` HTML + `13.0 MB` sidecars)*
- **Build Commands:** `build.py` + `--station face|wall`.
- **Core Gaps & Smooth Promotion:** Uses `44-core-stage` (gains `setA2C` + `INDEX_ITEMS` via `B4`); add `LOD.merge`/`cull`. Already `.tex`-split — promote `rock.cut.polished`, `rock.megabreccia.polished`, `bark.bamboo.jade`, `ground.salt`, `ground.lakebed.shells` to `8-bit`/`hemi-oct8` + `mipVariance`. Complete real-GPU verify (`KNOWN_ISSUES.md` — check `KHORIZON` crest darkening on `face`).

### 6.5 `biomes/farside` *(4 stations, 19 fragments, 29 materials / 11 cards, `.tex` split: `1.15–1.16 MB` HTML + `10.5 MB` sidecars)*
- **Build Commands:** `build.py` + `--station cloud|front|strand`.
- **Core Gaps & Smooth Promotion:** Uses `44-core-stage` (gains `INDEX_ITEMS` via `B4`); add `LOD.merge`/`cull`. Already `.tex`-split — promote `ground.rock` (`rock.wet.dark`, `specular: 0.35, roughLift: 0.2`) and dilate `11` cards (`B4`).
- **Downstream Reach (1):** `kits/eternian`.

### 6.6 `biomes/outlands` *(1 station, 13 fragments, 6 materials / 1 card, inline `1.77 MB`)*
- **Build Commands:** `build.py` (`dist/outlands.html`).
- **Core Gaps & Upgrades:** Custom host lacks `44-core-stage` (wire `KDRAWN.h` directly for `B5`; already adopts `KGROUND`, `KSTRATA`, `KSHADOW`, `KHORIZON`, `setA2C`, `INDEX_ITEMS`, `LOD.merge`/`cull`). Gains `B2` base grounding on fungal veil colonies (`BIO.fung`).
- **Downstream Reach (3):** `openworld/isle-demo`, `network-proposal`, `north-basin`.

---

## 7. Metropolis & Overgrown Showcase (1 Biome — Stage 6 Baseline)

### 7.1 `biomes/ancientsvalley` *(3 stations, 44 fragments, 10 own materials / 2 cards + `kits/ancients` & `kits/metropolis`, `.tex` split: `4.85–5.07 MB` HTML + `25.7 MB` sidecars)*
- **Build Commands:** `build.py` + `--station terraces|yards` (`BUDGETS.json`: `20M` tris, `1,200` calls on main & `yards`).
- **Stage 6 Already Completed on `claude/vertical-stack` (`8a4d69ff`, `STAGE-6-7-REPORT.md`):**
  - Landed `A0.1`–`A0.5` (`KDRAWN` plant-on-mesh `plant_err = 0.000 m`, indexed items/foliage/shells saving `-500.7 MB` VRAM down to `1,111.5 MB`, `12 <= 16` samplers) and `A2.1`–`A2.5` (hourly sky-lit tower impostor atlas + lowland `BIO.bakeImpostors`, `S1`/`S2` valley-wall penumbrae, `M4` roof/ledge humus, creeper stem contact AO, feral backlit foliage).
- **Stage 8 Rebuild Role:** Rebuild after `kits/ancients`, `kits/metropolis`, `kits/ancient-transit`, `kits/ancients-interiors`, and `kits/mechs`, then re-verify `tools/route_harness.py --route ancientsvalley` (`71/71` `test-av.js`, `40/40` `hostChecks`, `44/44` `hostNegatives`).

---

## 8. Unbuilt / `PLAN.md`-Only Biome Directories (16 Folders)

None of these `16` folders contain a `build.py` or `dist/*.html` page yet (`test_all.py` skips them cleanly). When any of them starts implementation, require its `PLAN.md` **`Core adoption`** table to adopt `44-core-stage` + `KDRAWN.h` (`B5`), `KGROUND` (`v3`/`v4` arrays) + `KSTRATA` + `KSHADOW` + `KHORIZON`, `B1`–`B4` defaults, and `.tex.<biome>.js` sidecars from day one:

| Biome Directory | Pre-Staged Files Beyond `PLAN.md` | Province / Key Material & Terrain Hooks When Built |
|---|---|---|
| `biomes/arachnoids` | — | Arachnoid Canyons (`rmvarachnoids`, Scale Model `5.1`): radial canyon scarps (`KSTRATA`, `KHORIZON`). |
| `biomes/arch` | — | The Arch & Steaming Seamounts (`rmvthearch`): bare mantle ultramafics/serpentinite (`8-bit` waxy stone) + hydrothermal plumes. |
| `biomes/clifflung` | — | Southern Inner Wall Cliff Lungs: living vertical flue colonies on `KCARVE` / `KSTRATA` scarps above `hyperjungle` cloud belt. |
| `biomes/deeps` | — | Ring Sea Abyssal Floor: underwater/hadal lighting, hydrothermal chimneys, `core/water` deep-column attenuation. |
| `biomes/galvanic` | `tools/` | The Rift Battery: oxidising acid-iron mudflats & electro-trophic mats (`8-bit` wet metallic/ochre mud specular). |
| `biomes/labyrinth` | — | SW Glaciated Dome Canyon Maze (`rmw8bqrn3dnx4`): narrow glacial-walled slot canyons (`S1` `KHORIZON` + `8-bit` `ice.glacier`). |
| `biomes/leucoxene` | — | White titanium-dioxide crystalline life on black basalt (`stone.obsidian` / `rock.basalt.titanium` + `8-bit` crystal skins). |
| `biomes/loom-chasms` | `region98_99.json`, `stations/` | Region 99 terraced rift basin (corrected with Scale Model `5.1` edit 3/4, `TODO.md:48`); station JSONs already staged. |
| `biomes/midbasin` | — | Mid Basin (`rmvmidbasin101`) between `loom-chasms` and `siphon-pits` below Stalker Gate passes. |
| `biomes/outlandgate` | — | NE Outer Wall Trough (`rmvoutlandpass`, Hau-Gèl river): deep cordillera pass (`S1` `40 km` `KHORIZON` showcase). |
| `biomes/paintedhighlands` | — | Banded clay/badland hills west of Korona (`rmvkam8s13kwu`): multi-bed `KSTRATA` + `S6` chromatic shape tinting. |
| `biomes/riavalley` | — | Ria Valley, Neo-Ozarks & Double Delta (`rmvriavalley`): drowned dendritic valleys (`KCOAST` + `core/water` estuaries). |
| `biomes/seouterwall` | — | SE Outer Wall Alpine Cordillera & Godsgate Pass: high tarns, glaciers (`8-bit` ice), `40 km` `KHORIZON`. |
| `biomes/siphon-pits` | `PLAN-STATIONS.md`, `stations/` | Region 98 Siphon Pits & Lake Ostrukh travertine terraces (`5.1` edit 4 travertine sill, `8-bit` `travertine`/`sinter`); `station.json`s staged. |
| `biomes/spiderlake` | — | *Parked for Expansion Pack* (`rmvspiderlake`): caldera/lake province. |
| `biomes/tiers` | — | NE Tierhounds' Staircase (`rmvp5il0uz1yf`): `8 km` stepped bench descent (`KSTRATA` + `KHORIZON`). |
