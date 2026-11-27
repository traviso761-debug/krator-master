# Building & Object Kits — Individualized Survey for the Stage 8 All-Builds Rebuild

**Branch:** `claude/vertical-stack`  
**Companion Docs:** `GRAPHICS-TERRAIN-PROPOSAL.md` (§6, §8, §11, §12c–12d), `TODO.md` (*"Ride along with the next all-builds rebuild"*), `STAGE-5-REPORT.md`, `STAGE-6-7-REPORT.md`  
**Scope:** All **36** active building, interior, vehicle, watercraft, creature, and world-content kits under `kits/` (excluding `kits/furniture`, which is `SPEC.md` scaffolding only).

---

## 0. Mandatory Rebuild Order Across Kit Dependencies

Before running `python3 tools/build.py --all`, rebuild producer kits/bundles before their downstream consumers:
1. **`kits/catalog`** (`furniture_bundle.py`) -> feeds every furnished kit & settlement (`53` builds / `263` pages).
2. **`kits/interiors`** (`dist/interiors-core.js`) -> **must** build before **`kits/ancients-interiors`** and before every kit using `kengine.interiors(...)` (`eternian`, `tents`, `zeijani`, `post-apoc`, `xanadu`, `highlands`, etc.).
3. **Bundled kits (`kit_bundle.py` / `*_bundle.py`):**
   - `kits/ancients-interiors` (`KratorAncientsInteriors`)
   - `kits/xanadu` (`XAK` via `kit_bundle.py` -> `settlements/longsong`, `settlements/pher`, `settlements/kirstabal`)
   - `kits/iziz-vernacular` (`IZV` -> `settlements/verge`, `settlements/isle-demo`; read in place by `iziz`, `pylon`, `talia`; checked against copies in `highlands`, `dalab`, `ys`)
   - `kits/highlands` (`highlands.py` -> `settlements/highlands`, checked against `reed-lake`, `dalab`, `ys`)
   - `kits/islanders` + `core/engine` (`ISK` in `settlements/isle-demo/bundles.py`)
   - `kits/post-apoc` (`apoc_bundle.py` -> `settlements/span`, `dalab`), `kits/tungang` (`tungang_bundle.py`), `kits/ancient-transit` (`transit_bundle.py` -> `biomes/ancientsvalley`), `kits/motor-vehicles` (`KratorVehicles`), `kits/mechs` (`KratorMechs`), `kits/fauna` (`KratorFauna`), `kits/extraplanar` (`KratorExtraplanar`).
4. **Verification Fingerprints:** Run `python3 core/engine/fingerprint.py` and `python3 core/furnish/fingerprint.py` after rebuilding engine and furnished kits (`--write` on `core/engine/fingerprint.json` only after visual inspection of the intentional `K2` base-AO / `KROOMLIGHT` additions).

---

## 1. `core/engine` Building Kits (10 Canonical + 2 Forks)

Shared upgrades landing automatically via `K1` + `K2` + `K5`: uniform-keyed `KMAT` shader deduplication (`30–45 -> 1–2` Standard programs), sine-free breakup noise, `30-geo.js` `0.30 m` plot-base contact AO, opt-in `boxBevel()` hero chamfers, and strictly opaque Godot `library.gdshader`.

### 1.1 `kits/scyvoi` *(Canonical `core/engine` reference — 60 materials, `.tex` split: `1.57 MB` HTML + `21.1 MB` sidecars)*
- **`M1`/`M2` Smooth Promotion:** `lacq` / `f_lacquer` (`wood.lacquer.crimson`), `iron` / `f_metal` (`metal.iron.pitted`), `f_bronze` (`metal.bronze`), `f_gold` (`metal.gold`), `patStep`, `patQuatre` -> `8-bit` `xy8` (Web) / `hemi-oct8` + `mipVariance` (Godot).
- **`M3`/`M4` Planar Masonry:** `stone` (`rock.rock_boulder_dry`), `paving` (`paving.flagstone`) -> concave mortar cavity (`M4`); planar POM (`M3`) on `paving` only (keep off boulder rubble).
- **Interiors:** No `kits/interiors/sets/scyvoi.js` yet; uses `core/furnish` (`91f-furnish.js`) + `KDOOR` (`36o-open.js`).

### 1.2 `kits/ash-nomads` *(Canonical `core/engine` — 45 materials, **INLINE `18.21 MB` HTML, 95% of `19.0 MB` cap!**)*
- **CRITICAL REBUILD STEP (Split Textures First):** `check_budgets.py` warns at `95%` (`18.21 / 19.00 MB`). Split into `ash-nomads.tex.ash-nomads.js` sidecar(s) (matching `scyvoi`) **before** promoting smooth normals to `8-bit`, dropping `ash-nomads.html` to `~1.6 MB`.
- **`M1`/`M2` Smooth Promotion:** `chitin` (`organic.chitin` — curved glossy carapace plates, prime `hemi-oct8` + `mipVariance` target!), `lacq` / `f_lacquer`, `iron` / `f_metal`, `f_bronze`, `f_gold`.
- **Interiors:** Tent-based structures share patterns with `kits/interiors/sets/tents.js` if opted into `kengine.interiors(['tents'])`.

### 1.3 `kits/desert-nomads` *(Canonical `core/engine` — 39 materials, **INLINE `16.18 MB` HTML, 98% of `16.5 MB` cap!**)*
- **CRITICAL REBUILD STEP (Split Textures First):** `check_budgets.py` warns at `98%` (`16.18 / 16.50 MB`). Split into `desert-nomads.tex.desert-nomads.js` sidecar(s) at the rebuild (`~1.5 MB` HTML) so `8-bit` smooth normals never trip the hard budget gate.
- **`M1`/`M2` Smooth Promotion:** `lacq` / `f_lacquer`, `iron` / `f_metal`, `f_bronze`, `f_gold`.
- **Walkability Note:** Round cloth tents built from `lathe()`/`psurf()`cones register no `KWALKBOX` walls by design (`core/engine/README.md:49`).

### 1.4 `kits/eternian` *(Canonical `core/engine` + `interiors-wired` — 50 materials, `.tex` split: `1.35 MB` HTML)*
- **Pilot `core/engine` Interior Kit (`K2`):** Already wires `kits/interiors/sets/eternian.js` via `91i-interiors.js`! First `core/engine` kit to receive automatic `KROOMLIGHT` (`I1` sun/sky mask, `I2` BFS doorway-portal daylight, `I3` room-gated lights, `I4` dihedral corner AO) when `?interiors=1` is active or exported to Godot.
- **`M1`/`M2` Smooth Promotion:** `celadon` (`roof.tile.celadon` — curved glazed eaves, exact match to our Stage 5 `glazed_ceramic` benchmark!), `tile` (`roof.tile`), `shutter` (`wood.painted`), `iron`, `bronze`, `verdigris`, `gold`, `screen` / `screenB`.
- **`M3`/`M4` Hero Masonry & Bevels:** `block` (`concrete.block.relief`), `brick` (`brick.buff`), `stone` (`stone.cut.b`), `paving` (`paving.flagstone`).
- **Gate 1 Cut-Out Guard:** `f_thatch` (`reed.mat.woven`).
- **Parked `TODO.md` Tie-In:** Lacquer workshop (`TODO.md:66`) to be added alongside Xanadu's when the lacquer crop lands.

### 1.5 `kits/islanders` *(Canonical `core/engine` — 67 materials, `.tex` split: `1.72 MB` HTML; bundled as `ISK` in `isle-demo`)*
- **`M1`/`M2` Smooth Promotion:** `corr` / `corrW` / `tin` (corrugated/patchwork roofs on poor scrap houses), `hull` (`wood.siding`), `iron`, `f_lacquer`, `f_metal`, `f_bronze`, `ceramic`.
- **`M3`/`M4` Masonry:** `coral` (`rock.coral_stone_wall` — high concave pore cavity `M4`!), `clayBlock` (`plaster.clay_block_wall`).
- **Gate 1 Cut-Out Guard:** `thatch` (`roof.thatch.neutral`), `thatchR` (`roof.thatch.reed`).
- **Downstream Rebuild + Bug Fix:** Rebuild `settlements/isle-demo` (`bundles.py` `isk_files`), and include the parked **ISK `reportErr` recursion fix** (`TODO.md:126-128`, `settlements/isle-demo/bundles.py:101,173` + re-entry guard in `core/engine/10-core.js:11`).

### 1.6 `kits/lizardmen` *(Canonical `core/engine` — 53 materials, `.tex` split: `1.68 MB` HTML)*
- **`M1`/`M2` Smooth Promotion:** `bronze` / `bronzeC`, `jade` (carved temple jade — smooth curved specular!), `f_lacquer`, `f_metal`, `f_bronze`.
- **`M3`/`M4` Masonry & Bevels:** `stoneP` (stepped pyramid ashlar — prime candidate for `boxBevel()` plinth steps + `M3` planar POM!), `brick`.
- **Gate 1 Cut-Out Guard:** `thatch`.

### 1.7 `kits/yeti` *(Canonical `core/engine` + Ancients — 53 materials, `.tex` split: `1.40 MB` HTML)*
- **Shadowed Engine File (`src/10-core.js`):** Yeti shadows `core/engine/10-core.js` solely so `h3`/noise sit on `KRAND` (`KNOWN_ISSUES.md`). At the all-builds rebuild, consider moving `core/engine/10-core.js` itself onto `KRAND` (since all pages rebuild anyway) or verify the shadow stays clean under `check_vendor.py`.
- **`M1`/`M2` Smooth Promotion:** `soap` (`stone.soapstone` — waxy low-roughness stone), `f_lacquer`, `f_metal`, `f_bronze`, `f_gold`.
- **`M3`/`M4` Masonry:** `course` (`masonry.pycrete.course`), `slab` (`stone.corbel.slab`), `flag` (`paving.flagstone`) -> planar POM + mortar cavity.

### 1.8 `kits/tents` *(Canonical `core/engine` + `interiors-wired` — 55 materials, `.tex` split: `1.82 MB` HTML)*
- **Interiors (`K2`):** Wires `kits/interiors/sets/tents.js` (`tnRoom` octagonal/round tent interiors across nomad/rider cultures). Receives `KROOMLIGHT` (`I1`–`I4`) automatically via `91i-interiors.js`; note `cut: true` near-half discard (`SV_CUT`) must mask `uIndoorMask = 1` on interior cloth faces even when closed (`uCut = 0`).
- **`M1`/`M2` Smooth Promotion:** `bamboo` (`bark.bamboo.jade` — smooth cylindrical culms!), `lacq`, `iron`, `scrapm`, `f_lacquer`, `f_metal`, `f_bronze`, `f_gold`.

### 1.9 `kits/tungang` *(Canonical `core/engine` — 38 materials, `.tex` split: `1.24 MB` HTML; `tungang_bundle.py`)*
- **Parked `TODO.md` Cleanup (`TODO.md:183-186`):** Move `'glazier': 'Glaziers'` into `CULTURE_NAMES` (and `NO_CATALOG`) in `core/tags/52-core-tags-vocab.js`, delete `core/tags/glazier/`, and drop it from `kits/tungang/build.py`.
- **`M1`/`M2` Smooth Promotion:** `ice` (`ice.clear`), `potch` (`rock.limestone.opal` — opalescent Glazier rock!), `gilt` (`metal.gold`), `enamel`, `plate` (`metal.ancient.white`), `paint`, `tin`, `scrap`, `iron`.
- **`M3`/`M4` Masonry:** `stone` (`rock.old_stone_wall`), `wash` (`plaster.white_stucco_02`).

### 1.10 `kits/zeijani` *(Fork of `core/engine` + `interiors-wired` — 58 materials, `.tex` split: `1.45 MB` HTML)*
- **Fork Note:** Runs its own fork of `core/engine` (sharing `36o-open.js` by path) and wires `kits/interiors/sets/zeijani.js`. Mirror `K2`'s `KROOMLIGHT` hook into Zeijani's `91i` fragment (or complete its port onto `core/engine` after the rebuild).
- **`M1`/`M2` Smooth Promotion:** Signature glazed ceramic reliefs (`glaze:ceramic.glaze`, `ceramic:ceramic.terracotta`, `patGlazed`, `patGlazedDfly`, `patGlazedBeetle`, `tuffPol:stone.tuff.polished`, `basaltPol:stone.basalt.polished`, `f_metal:metal.bronze`) -> major visual win from `8-bit`/`hemi-oct8` + `mipVariance` AA!
- **Gate 1 Cut-Out Guard:** `thatch`, `cardYam` (`card.crop.yam`), `cardAlecap` (`card.mushroom.alecap`), `cardCrop` (`card.crop`) — height must **never** pack into alpha on these 4 cut-out entries!

### 1.11 `kits/post-apoc` *(Fork/Origin of `30-geo.js` + `interiors-wired` — 15 materials, inline `7.81 MB` HTML; `apoc_bundle.py`)*
- **Parked `TODO.md` Tie-In (`TODO.md:206-210`):** Land the `dalab` sockets culture pack in `core/sockets/80-cultures.js` + `38-symbols.js`, rebuild `post-apoc` and `apoc_bundle.py` consumers (`settlements/span`, `dalab`).
- **Interiors:** Wires `kits/interiors/sets/post-apoc.js`; inherits `KROOMLIGHT` once `kits/interiors` adds `I1`–`I4`.
- **`M1`/`M2` Smooth Promotion:** `bottle` (`glass.bottle.wall`), `steel` (`metal.steel.brushed`), `corr` / `cont` (`metal.corrugated.rusty`), `sheet` / `sheetP` / `sheetF`.

---

## 2. Ancients-Core & Vernacular Lineage Building Kits (10 Kits)

### 2.1 `kits/ancients` *(140 fragments, 22 materials, `.tex` split via `split.py`, per-site targets)*
- **`M1`/`M2` Smooth Promotion:** `white` (`metal.ancient.white`), `snTitan` (`metal.titanium`), `verdigris` (`metal.bronze.verdigris`), `corrugate`, `whiteWorn`, `snOnyx` (`stone.onyx`), `snAlab` (`stone.alabaster`), `snScreen` / `snScreenB`.
- **`M3`/`M4` Monolithic Concrete & Brick:** `concrete` / `concreteR` (`concrete.ancient`), `paving` (`concrete.ancient.b`), `brick` (`brick.red`) -> concave joint cavity (`M4`) + planar POM on `brick`/`paving`.
- **Downstream Consumers:** Reached by `iziz`, `iziz-vernacular`, `pylon`, `talia`, `highlands`, `xanadu`, `port`, `metropolis`, `ringsea`, `ancientsvalley`, `throne`, `noahs-regret` — `K1` program deduplication cuts shader compile cost across all of them.

### 2.2 `kits/port` *(Ancient Port kit — 52 fragments, 14 materials, `.tex` split; builds Hook & coastal segments)*
- **`M1`/`M2` Smooth Promotion:** `white` (`metal.ancient.white`), `verdigris`, `corrugate`, `whiteWorn`, `pkCont` (`metal.container`).
- **`M3`/`M4` Quay Masonry & Wet Margins (`M4`):** `concrete` / `concreteR`, `paving`, `brick` (`brick.red`), `pkPave` (`concrete.slab`) — ideal candidate for `M4` local-water-body horizontal wet-margin darkening (`WORLD.water` / harbour level) on quay walls and breakwaters!

### 2.3 `kits/ancient-transit` *(21 fragments, 10 materials, `.tex` split; `transit_bundle.py`)*
- **`M1`/`M2` Smooth Promotion:** `steel` (`metal.steel.brushed`), `white` (`metal.ancient.white`), `paint` (`metal.painted.chipped`), `rust`, `corrugated`.
- **`M4` Grounding:** Viaduct piers, subway portals, and highway decks (`concrete:concrete.board`, `pave:concrete.slab`); rebuild `biomes/ancientsvalley` (`--station terraces`, `--station yards`) after any bundle update.

### 2.4 `kits/metropolis` *(36 fragments, 8 materials, `.tex` split: `4.11 MB` HTML)*
- **Already Landed in Stage 6 (`8a4d69ff`):** `KSHELL` `EXT_conservative_depth`, distance-adaptive `MP_STEPS` (`28 -> 10`), and 4-neighbour heightfield sky/cavity occlusion in `at.C.a` (`60-mp-shell-host.js`).
- **At All-Builds Rebuild:** Promote `white` (`metal.ancient.white.macro`), `bronze` (`metal.bronze`), and `adobe` (`stone.adobe.ceramic`) to `8-bit`/`hemi-oct8` + `mipVariance`; wire `KROOMLIGHT` (`I1`–`I4`) into its two audited tower interiors.

### 2.5 `kits/iziz-vernacular` *(23 fragments, 19 materials, `.tex` split: `0.74 MB` HTML; bundled as `IZV`)*
- **`M1`/`M2` Smooth Promotion:** `white`, `verdigris`, `corrugate`, `whiteWorn`.
- **`M3`/`M4` Masonry & Gate 1 Guard:** `stone` (`stone.cut`), `brick` (`brick.red`), `plaster`; Gate 1 guard on `thatch`.
- **Interiors & Downstream:** Interior set exists at `kits/interiors/sets/iziz.js` (`iziz-ancient.js`); rebuild `settlements/iziz` (`--kit`), `pylon`, `talia`, `verge` (`IZV`), `isle-demo` (`IZV`), and verify copy parity in `highlands`, `dalab`, `ys`. Also clean parked `||` numeric defaults in `69e6-vern-autobody.js` (`TODO.md:198`).

### 2.6 `kits/pylon` *(10 fragments, 7 materials, `.tex` split: `2.95 MB` HTML; Iziz vassal kit)*
- **`M1`/`M2` Smooth Promotion:** All 6 ceramic/lattice/grille families (`pyHexTile:tile.hex.ceramic`, `pyGrille`, `pyTileLR`, `pyTileLS`, `pyTileLB`, `pyTileLC`) benefit directly from `8-bit`/`hemi-oct8` + `mipVariance` AA on post-Cataclysm white-and-orange arcology facades.
- **Interiors:** `kits/interiors/sets/pylon.js` ready for `KROOMLIGHT`; rebuild `settlements/iziz/build.py --kit`.

### 2.7 `kits/talia` *(10 fragments, 9 materials, `.tex` split: `2.47 MB` HTML; Iziz vassal kit)*
- **`M1`/`M2` Smooth & Ashlar Promotion:** `taGilt` (`metal.gold`), `taTile` (`roof.clay_roof_tiles`), and `taMarble` (`stone.marble.ashlar` — planar POM + polished specular AA!).
- **Interiors:** `kits/interiors/sets/talia.js` ready for `KROOMLIGHT`; rebuild alongside `iziz` / `pylon`.

### 2.8 `kits/highlands` *(31 fragments, 51 materials, `.tex` split: `1.88 MB` HTML; `highlands.py` for Republican/Rustic/Tribal)*
- **`M1`/`M2` Smooth Promotion:** `hTileD` / `hTileS` / `hTileT` / `hTileW`, `white`, `verdigris`, `corrugate`.
- **`M3`/`M4` Masonry & Gate 1 Guard:** `stone` (`stone.cut`), `ashlarP`, `brick` (`brick.red`), `cobble` -> planar POM + concave mortar cavity; Gate 1 guard on `thatch`.
- **Interiors & Parked Cleanup:** Wires `kits/interiors/sets/highlands.js` (and `reedlake.js`) + `core/furnish`; clean parked `||` defaults in `settlements/highlands/src/89y-hl-furnish.js` (`TODO.md:197`), rebuild Roketstad, and verify copy parity in `reed-lake`, `dalab`, `ys`.

### 2.9 `kits/xanadu` *(37 fragments, 48 materials, `.tex` split: `1.10 MB` HTML; sealed as `XAK` by `kit_bundle.py`)*
- **Parked All-Builds Rebuild Mergers (`TODO.md:76-78, 82-86, 198`):**
  1. Move `extra/88c-xa-caravanserai.js`, `extra/88d-xa-lakecraft.js`, and `extra/88e-xa-stall.js` into `kits/xanadu/src/`, move `extra/69dz-ix-xanadu-extra.js` into `kits/interiors/sets/xanadu.js`, add sheet rows, and drop `"external"` from `settlements/pher/kit.json`.
  2. Move `87k-xa-lake-trades.js` into `xanadu.py` `FILES` and fold `works.fishing` into `core/hamlet/20-hamlet-cultures.js` (`xanadu` row) for `settlements/kirstabal`.
  3. Clean `||` numeric defaults in `89y-xa-interiors.js`.
- **`M1`–`M4` & `I1`–`I4` Lead Expansion Target:** Promote `xTiles`, `xBTile` (`tile.bath.lens`), `xMuqT` (`tile.muqarnas.turquoise`), `xGiltC`, `verdigris`, `white` to `8-bit`/`hemi-oct8` + `mipVariance` AA; planar POM on `stone:stone.cut` and `brick:brick.red`; Gate 1 guard on `thatch`; wire `KROOMLIGHT` across `xanadu.js`, `xanadu-citadel.js`, and `xanadu-scrap.js` -> rebuild `XAK` consumers (`longsong`, `pher`, `kirstabal`, `erewhon`).

### 2.10 `kits/qiblai` *(13 fragments, 10 materials, `.tex` split with `xanadu` packs; **INLINE `13.46 MB` HTML — watch cap!**)*
- **Parked `TODO.md` Cleanup (`TODO.md:176-179`):** Add `'qiblai': 'Qiblai'` to `CULTURE_NAMES` and `'qiblai'` to `NO_CATALOG` in `core/tags/52-core-tags-vocab.js` so `T.audit()` reports `0` unknown cultures.
- **Page-Size Watch:** `qiblai.html` is `13.46 MB` even with `xanadu.tex.*.js` sidecars — verify why inline assets remain in `qiblai.html` before enabling `8-bit` maps.
- **`M1`–`M3` Materials:** `qGilt` (`metal.gold`), `qLacq` (`wood.lacquer`), `qMarble` (`paving.marble_mosaic_tiles`) -> `8-bit`/`hemi-oct8` + `mipVariance`; `qAshlar` (`stone.sandstone.ashlar`), `qCobble`, `qFlag` -> planar POM + mortar cavity. Interiors draw from Xanadu's catalog pieces.

---

## 3. Yuni-Frame Lineage Building Kits (3 Kits)

All three draw through the Yuni frame (`F` / `ASSET`) rather than `core/engine`. At the all-builds rebuild, their host settlements (`settlements/yuni`, `settlements/locus`, `settlements/girder`, `settlements/mavs-refuge`) should retire pasted `nlvTex` copies onto `core/interiors/20-core-roomlight-host.js` (`K4`).

### 3.1 `kits/yuni` *(8 fragments, 24 materials via `settlements/yuni/materials.json`, `.tex` split: `0.61 MB` HTML)*
- **`M1`/`M2` Smooth Promotion:** Curved Gaudi ceramic roofs & painted facades (`tile:roof.tile`, `clay` / `fl-tile:ceramic.terracotta`, `paintbw`, `paintcol`, `metal`, `rust`) -> prime `hemi-oct8` + `mipVariance` beneficiaries!
- **`M4` Banco/Adobe Cavity:** `adobe` (`earth.banco`), `plaster`, `concrete:concrete.board`, `fl-adobe`; Gate 1 guard on `thatch`.
- **Interiors:** `kits/interiors/sets/yuni.js` & `yuni-town.js` ready for `KROOMLIGHT` (`I1`–`I4`); also fix parked `||` defaults in `settlements/yuni/src/76-doors.js:180` (`TODO.md:196`). Rebuild `locus`, `mungo`, and `verge` (`YKIT`).

### 3.2 `kits/locus` *(8 fragments, 24 materials via `settlements/locus/materials.json`, `.tex` split: `1.74 MB` HTML)*
- **`M1`/`M2` Industrial Metal & Oil-Town Surfaces:** `rust`, `corrugate`, `tinmirror` (`metal.tin.patchwork`), `metal`, `tile` -> `8-bit`/`hemi-oct8` + `mipVariance` AA on tanks, pipes, and pumpjacks.
- **Interiors:** `kits/interiors/sets/locus.js` + `core/furnish` (`KFURN`); replace Locus's `nlvTex` with `KROOMLIGHT` (`K4`). Rebuild `mungo` and `verge` (`YKIT`).

### 3.3 `kits/eastern-abyssal` *(10 fragments, 24 materials via `settlements/locus/materials.json`, `.tex` split: `1.74 MB` HTML; `abysskit.py`)*
- **`M1`–`M4` Materials:** Shares Locus's pack (`rubble:rock.old_stone_wall`, `concreteB`, `concreteW`, `tinmirror`, `corrugate`; Gate 1 guard on `thatch`).
- **Interiors:** `kits/interiors/sets/abyss.js` ready for `KROOMLIGHT`; rebuild `locus` (`abyss-kit.html`), `mungo`, and `verge`.

---

## 4. Catalog-Engine Building, Interior, Furniture & Creature Kits (5 Kits)

### 4.1 `kits/catalog` *(Master Catalog — 1,696 pieces, 63 materials, `2.11 MB` HTML; `furniture_bundle.py`)*
- **`K3` Smooth Detail Promotion:** Promote `bronze`, `ceramic`, `tile` (`ceramic.glaze`), `glass`, `gold`, `jade` (`stone.amazonite`), `lacquer` (`wood.lacquer`), `nacre`, and `obsidian` (`stone.obsidian`) to `8-bit` (`xy8` Web / `hemi-oct8` + `mipVariance` Godot), eliminating curved specular banding across every furnished interior in Krator.
- **`K3` Batched Foot Grounding:** Bake `0.76 .. 1.00` base AO (`y = 0 .. 0.18 m`) in `KF.batch({indexed: true})`.
- **Gate 1 Guard & Source Lint:** Keep `leafy` (`leaf.understorey`) and `thatch` (`roof.thatch`) out of alpha-height packing; clean parked `check_source` findings on top-level catalog files (`TODO.md:108`) and shrink `check_source_baseline.json`.

### 4.2 `kits/interiors` *(`ROOM()` & Engine-Neutral Placer — 22 fragments, `dist/interiors-core.js`, `21` cultural sets)*
- **Universal `I1`–`I4` Hub (`K2`):** Wire `core/interiors/10-core-roomlight.js` (`KROOMLIGHT.buildTable`, `vertexCornerAO`, `pickPool`) into `50-shell.js` (baking `I4` dihedral/trihedral `COLOR.a` corner AO + `UV2.x` room index onto every `ROOM()` shell) and `49-exports.js` (emitting `interiors.json` v2 with BFS `room_table` and doorway `portals`).
- **Build-Order Rule:** Always rebuild `kits/interiors` **before** `kits/ancients-interiors` and any `kengine.interiors` consumer.

### 4.3 `kits/ancients-interiors` *(13 fragments, 14 audited ship halls in 2 dresses; bundled as `KratorAncientsInteriors`)*
- **Stage 7 / Gate 5 Benchmark Partner:** Already registered on `tools/route_harness.py --track interiors` (`hall_entry`, `corridor_door`, `cabin_room`, `bridge_deck`). Once `kits/interiors` wires `KROOMLIGHT`, rebuild `ancients-interiors` and run both `route_harness.py --track interiors` and the Gate 5 Sun-Leak Probe across its 4 preset stops.

### 4.4 `kits/beast-riders` *(18 fragments, 28 materials, **INLINE `12.91 MB` HTML, `texSplit=False`**; `towns.py`)*
- **Page-Cap Recommendation:** Split `.tex.beast-riders.js` sidecar (`12.91 MB -> ~1.5 MB` HTML) at the rebuild so future rock-cut / mount additions stay well clear of the `16 MB` cap.
- **`M3`/`M4` Rock-Cut & Sandstone Surfaces:** `stone` (`rock.rock_face`), `sandstone` (`rock.sandstone.bedded.red`), `navajo` (`rock.sandstone.navajo`) -> concave cavity (`M4`) + triplanar-safe normal variance (`M3` POM off on triplanar rock!). Gate 1 guard on `thatch`.
- **Interiors:** `kits/interiors/sets/beast-rider.js` & `beast-rider-rock.js` ready for `KROOMLIGHT`; note `KNOWN_ISSUES.md` tracks replacing the lossy catalog copies of Girder/Mav's Refuge buildings in a later faithful port.

### 4.5 `kits/fauna` *(14 model-pack entries, `1.16 MB` HTML + sidecars, **`krator-fauna.js` = `28.25 MB`, 94% of `30.0 MB` cap!**)*
- **CRITICAL REBUILD STEP (Bundle Cap):** `check_budgets.py` warns that `dist/krator-fauna.js` is at `94%` (`28.25 / 30.00 MB`). Split `krator-fauna.js` textures into sidecar chunks (as `fauna.html` already does with `fauna.tex.models*.js`) before adding new fauna or higher-bit-depth maps, and clean parked `check_source` findings (`TODO.md:108`).

---

## 5. Vehicles, Mechs & Watercraft Kits (3 Kits)

### 5.1 `kits/motor-vehicles` *(5 culture files, 26 materials, `2.28 MB` HTML; `KratorVehicles` via `vehicle_bundle.py`)*
- **Top `M1`/`M2` Specular-AA Beneficiary:** Almost all 26 families are curved painted/metallic bodywork (`paint:metal.metal003`, `paintWorn`, `paintFlake`, `whitePaint`, `metal`, `brass`, `plate`, `corrugated`, `rust`). Promoting painted/metallic families to `8-bit` (`xy8` Web / `hemi-oct8` + `mipVariance` Godot) removes 6-bit specular facet bands on curved buggy hoods, truck cabs, and crawler fenders.
- **At Rebuild:** Clean parked `check_source` findings (`TODO.md:108`), rebuild `vehicle_bundle.py`, and rebuild downstream consumers (`ancientsvalley` wrecks, `locus`, `verge`).

### 5.2 `kits/mechs` *(19 skinned & IK-animated walkers, 8 materials, `1.75 MB` HTML; `KratorMechs` via `mech_bundle.py`)*
- **`M1`/`M2` Smooth Armour Promotion:** Promote `plate` (`metal.scrap`), `livery` (`metal.painted.chipped`), `metal` (`metal.joint.greasy`), and `bronze` (`metal.bronze`) to `8-bit`/`hemi-oct8` + `mipVariance` AA on curved Castra/Stalker carapace plates (note: **no `M3` POM** on skinned meshes!).
- **At Rebuild:** Clean parked `check_source` findings (`TODO.md:108`) and rebuild `mech_bundle.py` + consumers.

### 5.3 `kits/ringsea` *(31 watercraft, 48 fragments, 9 materials, `4.81 MB` HTML)*
- **`M1`/`M2` Hull & Deck Promotion:** `hullpaint` (`patterns/common/hull-paint`), `ancient` (`metal.ancient.white`), `hex` (`plate.hex`), `bronze` (`metal.bronze.verdigris`), `tile` (`roof.tile`) -> `8-bit`/`hemi-oct8` + `mipVariance`; `M4` waterline wet-margin darkening along hull freeboards; Gate 1 guard on `thatch` (`roof.thatch.reed`).
- **Parked `KNOWN_ISSUES.md` Visual Fix:** Switch Xanadu watercraft sails to **rose and the lotus** (owner, 2026-10-20), aligning directly with the post-merge Xanadu graphics buildout! Rebuild `isle-demo` / harbour consumers.

---

## 6. World-Content & Generic Infrastructure Kits (4 Kits)

### 6.1 `kits/construction` *(`KCONS` generic building sites — 5 fragments, 11 materials, `.tex` split: `2.13 MB` HTML)*
- **`M3`/`M4` Material Piles & Grounding:** `block` (`stone.cut`) and `brick` (`brick.red`) take `M4` concave cavity + `0.25 m` cleared-plot base grounding; refresh sidecar `.tex.{islanders,iziz,xanadu}.js` packs after rebuilding those three kits, and rebuild `settlements/isle-demo` (empty lots).

### 6.2 `kits/resources` *(10 mineral/oil nodes x 3 grades on `core/engine` — 13 fragments, 22 materials, `.tex` split: `5.34 MB` HTML)*
- **`M1`/`M2` Crystal & Ore Specular Promotion:** Promote `druze` (`stone.geode.druze`), `alabaster` (`stone.alabaster`), and native metallic ore veins (gold, silver, copper, rare earth) to `8-bit`/`hemi-oct8` + `mipVariance` AA so high-grade nodes glint cleanly without normal-quantisation stepping; `stone` (`rock.rock_boulder_dry`) takes `M4` cavity + `0.35 m` terrain-collar grounding.

### 6.3 `kits/crops` *(123 `[G data]` crops in 25 buckets — 7 fragments, 50 `card.*` materials, `2.46 MB` HTML)*
- **Strict Gate 1 Alpha Cut-Out Guard & `B4` Fringe Dilation:** All 50 entries in `kits/crops/materials.json` are `card.*` cut-out sheets! `pack.py` Gate 1 must keep 100% of them on RGBA albedo+alpha (zero height-in-alpha), and `B4`'s `BIO.libSwap` mean-RGB transparent-texel dilation eliminates dark mipmap fringes on distant crop rows across every farming village (`core/hamlet`) and Xanadu/Highlands terrace.
- **Parked `TODO.md` Data Additions (`TODO.md:50-69`):** Land the native-crop rule (moving Ring Isles cacao in `settlements/isle-demo` to native island crops or imported cacao) and add the Vale / NW-lowlands **lacquer crop** for Xanadu & Eternian lacquerware.

### 6.4 `kits/extraplanar` *(8 fragments, 0 library textures, `0.79 MB` HTML; `KratorExtraplanar` via `extraplanar_bundle.py`)*
- **Procedural Shader / Tag Kit:** Uses procedural GLSL phenomena/portals with no packed library textures; no `M1` material changes needed. Rebuild `extraplanar_bundle.py` before `biomes/ancientsvalley` whenever `core/tags` or `core/host` changes.
