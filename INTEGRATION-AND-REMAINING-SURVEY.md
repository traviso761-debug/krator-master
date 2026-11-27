# Remaining Repo Survey & End-to-End Integration Plan (Stage 8 All-Builds Rebuild)

**Branch:** `claude/vertical-stack` (`343` commits ahead of `origin/main`, `69` commits behind `origin/main` at `74d9815b`)  
**Companion Surveys:** `KIT-REBUILD-SURVEY.md` (`36` kits), `BIOME-REBUILD-SURVEY.md` (`64` biomes), `GRAPHICS-TERRAIN-PROPOSAL.md` (§11, §12c–12d), `TODO.md`, `HANDOFF-REBUILD.md`  
**Scope:**
1. **Part I — Remaining Repo Survey:** Every buildable folder and script outside `kits/` and `biomes/` — **44** `settlements/*` directories (`29` built -> `48` HTML pages, `3` blueprint-in-progress, `12` `PLAN.md` stubs), **11** `openworld/*` entries (`7` streamed regions + `1` testbed + `3` data/registry dirs), **9** `core/*` standalone/demo builds + `core/audio`, **29** `godot/data/*` exported datasets (`25` Godot test suites), `tools/scale-model/model`, and `gallery/*` / `host/*` (**including 13 build scripts skipped by `tools/build.py --all`**).
2. **Part II — Integration & Rebuild Plan:** Exact conflict-resolution and execution runbook grounded in an in-memory `git merge-tree --write-tree origin/main HEAD` audit.

---

# Part I — Survey of Remaining Targets Outside `kits/` & `biomes/`

## 1. Critical Operational Discovery: What `tools/build.py --all` Skips

`tools/buildlib.py` (`build_dirs()`, line 194) **only** walks `('settlements', 'kits', 'biomes', 'openworld')` top-level children, and `tools/test_all.py` (`extra_builds()`) **only** enumerates `biomes/*/stations/*/` without `--preview`. The following **14 targets are NOT rebuilt by `python3 tools/build.py --all`** and must be run explicitly during Stage 8:

| Target / Script | Why `tools/build.py --all` Skips It | When to Rebuild in Stage 8 |
|---|---|---|
| `biomes/swhighlands/build.py --station pillars --preview span` | `extra_builds()` omits `--preview` flags | Always (writes `dist/swhighlands-pillars-span.html`; re-run `freeze_span.py` first if `settlements/span` moves). |
| `core/charactermodels/build.py` | Under `core/` (`CORE_BUILDS`) | Whenever character/garment/material/host code moves; sync `godot/krator/character/` & `godot/data/characters`. |
| `core/materials/demo/build.py` | Nested under `core/materials/demo/` | **Mandatory in Stage 8** — directly exercises `KMAT` uniform dedup (`K1`) and `M1`–`M4` surfaces. |
| `core/atmos/demo/build.py` & `core/atmos/fxdemo/build.py` | Nested under `core/atmos/` | Whenever `core/atmos`, `KHORIZON`, or `core/host` moves. |
| `core/cavelight/demo/build.py` | Nested under `core/cavelight/` | Whenever `core/cavelight`, `core/terrain`, or `core/host` moves. |
| `core/host/example/build.py` & `core/host/underground/build.py` | Nested under `core/host/` | Whenever `core/host` or `core/terrain` moves. |
| `core/simulation/example/build.py` | Nested under `core/simulation/` | Whenever `core/simulation` or `core/host` moves. |
| `openworld/network-proposal/testbed/build.py` | Nested two levels deep under `openworld/` | Whenever `core/world` or road/tunnel modules move. |
| `tools/scale-model/model/build.py` | Under `tools/scale-model/` | **Mandatory after Phase 1 merge** — re-bakes scale-model viewer after re-running `edit_519*.py`. |
| `godot/tools/sync_core.py` & `godot/tools/export_spike.py` | Native Godot twin & `29` `godot/data/*` exports | **Mandatory in Stage 8** — exports `packFormat: 2` (`v4`/`v2` `hemi-oct8`), `relief.micro: 2`, `horizon0/1.webp`, `interiors.json` v2. |
| `gallery/build_gallery.py`, `build_ancients.py`, `build_throne.py`, `krator-system/build.py` | Gallery publish scripts (owner-gated) | Final post-verification step (`HANDOFF-REBUILD.md:140` — ask owner before republishing gallery). |

*(Note: `settlements/girder/build_hero.py` mentioned in older `AGENTS.md` notes was retired to `archive/girder-hero` on `2026-11-10` per `HANDOFF-REBUILD.md:76` and no longer runs.)*

---

## 2. Settlements Survey (`settlements/*` — 44 Directories)

### 2.1 Page-Cap Watch Across `settlements/` (`16.0 MB` Default Cap, `90%` Warning)
1. **`settlements/voth` (`dist/voth-city.html` = `18.84 MB`, `94%` of raised `20.00 MB` cap — LIVE `check_budgets.py` WARNING!):** Inline (`tex=0`). **Split `voth-city` into `.tex.voth.js` sidecars before `8-bit` catalog/kit normal promotions**, dropping `voth-city.html` well under `10 MB`. **Rule (`AGENTS.md`):** Do **not** modify `core/city` layout fragments (`15`, `30`–`35`) or alter Voth's stocks proof (`test-sim.js`).
2. **`settlements/screamers` (`dist/screamers.html` = `13.97 MB` inline, `87%` of `16.0 MB` cap):** `tex=0`, `75` fragments + `interiors`. Already has `settlements/screamers/split.py` in its folder — switch it to `.tex` sidecars at the rebuild before `8-bit` normal promotion pushes it past `90%` (`14.4 MB`).
3. **`settlements/thalaba` (`thalaba.html` = `13.56 MB`, `thalaba-pieces.html` = `13.36 MB`, `85%` of cap):** Already has `2` `.tex` sidecars (`19.0 MB`), so HTML weight is embedded geometry/data (`XAK` / `biomes/xanadu`). Watch size when `kits/xanadu` opt-in `extra/88c–88e` pieces move into `src/` (`TODO.md:92`).
4. **`settlements/kirstabal` (`12.21 MB`)**, **`settlements/highlands` (`roketstad.html` `12.10 MB`)**, **`settlements/noahs-regret` (`11.74 MB` inline `tex=0`!)**, **`settlements/pher` (`10.46 MB`)**, **`settlements/azure-dream` (`10.20 MB`)**, **`settlements/qiblai` (`10.02 MB`)**, **`settlements/locus` (`9.55 MB` x3)**, **`settlements/mavs-refuge` (`8.80 MB` inline `tex=0`)**.

### 2.2 `core/city` & `core/world` Map-Seated Settlements (12 Active + 3 Blueprint-in-Progress)
- **`settlements/longsong`** (`8.63 MB` HTML + `4` sidecars `27.0 MB`): **Stage 7 Interior Benchmark** — already running `KROOMLIGHT` (`I1`–`I4`, `13/13` Gate 5 `0.00000` sun leak, `STAGE-6-7-REPORT.md`). Re-bake site on `relief.micro: 2` (`oidong-highrift`); note garment-pack rebuild dependency (`HANDOFF-REBUILD.md:138`).
- **`settlements/isle-demo`** (`isle-city.html` `6.37 MB`, `isle-site.html` `1.26 MB` + `8` sidecars `59.9 MB`; runs `build.py` & `build.py --accept`): Economy & `ISLE_ATLAS` (`v3` array) pioneer. Fix **ISK `reportErr` infinite recursion** (`bundles.py:101,173` + `core/engine/10-core.js:11`, `TODO.md:142`); fold `41t-world-town-water.js` into `41` (`TODO.md:150`); verify all `10` `NODE_AFTER_BUILD` `test-isle-*.js` suites pass!
- **`settlements/voth`** (`voth-city.html` `18.84 MB`, `voth-site.html` `3.48 MB`): Split `.tex` sidecars (`94%` cap warning); inherits `K1`/`K3`/`B1`–`B5`; leave layout & embassy/Arena walk issues to city-layout work (`HANDOFF-REBUILD.md:122`).
- **`settlements/verge`** (`3.60 MB` HTML + `5` sidecars `40.5 MB`): Two-level `core/city` + `IZV` + `YKIT` + `KGROUND` + Godot `verge_sim.gd` twin. Re-export `godot/data/verge` on `packFormat: 2`.
- **`settlements/pinnacle-rock`** (`4.69 MB` HTML + `6` sidecars `24.5 MB`): `core/city` + `core/world` + `core/furnish`. Wiring `KDRAWN.h` (`B5`) directly addresses its `1.87%` attach-audit float note (`HANDOFF-REBUILD.md:121`).
- **Declarative `kit.json` Sultanate, Rift & Port Towns (`7` builds):**
  - **`settlements/kirstabal`** (`12.21 MB`): Move `KS_RING.fishingRow` into `core/hamlet/20-hamlet-cultures.js` (`KHAMLET.CULTURES.xanadu`) and `87k-xa-lake-trades.js` into `xanadu.py` (`TODO.md:98-102`); verify `test-ks-ring-checks.js` & `test-ks-town.js`.
  - **`settlements/pher`** (`10.46 MB`): Drop `"external"` from `settlements/pher/kit.json` once `extra/88c-xa-caravanserai.js`, `88d-xa-lakecraft.js`, and `88e-xa-stall.js` move into `kits/xanadu/src/` (`TODO.md:92-94`).
  - **`settlements/qiblai`** (`10.02 MB`): Inherits `'qiblai'` vocab in `core/tags/52-core-tags-vocab.js` (`TODO.md:192`) + re-export `godot/data/qiblai`.
  - **`settlements/thalaba`** (`13.56 MB` / `13.36 MB`), **`settlements/lightwall`** (`5.60 MB`), **`settlements/azure-dream`** (`10.20 MB`): Rebuild after `kits/xanadu` (`XAK`), `kits/qiblai`, `biomes/xanadu`, and `biomes/opalvalley`.
  - **`settlements/hook`** (`0.98 MB` + `5.85 MB` sidecar): Built from `kits/port` (`targets/`); leave `claude/hook-p1` out until owner decides (`HANDOFF-REBUILD.md:36`).
- **Blueprint-in-Progress Folders (`3` folders, no `build.py` yet):** `settlements/beacon` (`beacon_blueprint.py`), `settlements/theodiga` (`theodiga_blueprint.py`, `19` `src/` fragments), `settlements/viridian` (`survey_site.py`).

### 2.3 Sultanate, Highlands, Iziz & Vernacular Settlements (6 Active Builds)
- **`settlements/xanadu`** (`erewhon.html` `8.55 MB`, `xanadu.html` `8.39 MB`, `xanadu-scrap.html` `8.14 MB` + `2` sidecars `19.0 MB`): **Primary shader-dedup benchmark** (`TODO.md:178-190`: `97` WebGL programs -> `~25` via `B3` + `K1` uniform keys; drop vendored `86-bio-30-core-foliage.js` drift once `core/biome/30-core-foliage.js` adopts uniform keys!) and centerpiece of the **post-merge Xanadu graphics expansion** (`GRAPHICS-TERRAIN-PROPOSAL.md` §12c).
- **`settlements/highlands`** (`highlands.html` `3.23 MB`, `roketstad.html` `12.10 MB` + `19.2 MB` sidecars): Gains `KROOMLIGHT` (`K2`/`K4`), `8-bit` smooth metal/slate normals, and `M3`/`M4` ashlar POM/cavity from `kits/highlands`.
- **`settlements/iziz`** (`7` pages: `iziz.html` `6.62 MB`, `iziz-palace.html` `3.78 MB`, `iziz-vernacular.html` `2.11 MB`, `iziz-ixtest.html` `2.11 MB`, `w-a/b/c.html` `1.38 MB` + `33.1 MB` sidecars; also drives `--kit` for `kits/pylon` and `kits/talia`): Rebuild after `kits/ancients` and `kits/iziz-vernacular`; re-export `godot/data/iziz` and `godot/data/world-iziz`.
- **`settlements/ys`** (`ys.html` `2.64 MB`, `kit.html` `1.64 MB`, `mock.html` `1.65 MB` + `31.6 MB` sidecars): Checks copies against `iziz-vernacular` & `highlands` (`check_vendor.py`); rebuild after both kits and `biomes/nwbay`.
- **`settlements/dalab`** (`dalab.html` `6.50 MB`, `dalab-set.html` `6.41 MB` + `21.9 MB` sidecars):Rebuild after `kits/post-apoc` (`apoc_bundle.py`), `iziz-vernacular`, `highlands`, and `biomes/swlowlands`.
- **`settlements/reedlake`** (`reedlake.html` & `reedlake-village.html` `0.81 MB` + `18.4 MB` sidecars): Checks copies against `highlands`; gains `KROOMLIGHT` via `kits/interiors`.

### 2.4 Yuni-Lineage Settlements With Pasted `nlvTex` (5 Active Builds — Prime `K4` Targets)
- **`settlements/yuni`** (`yuni.html`, `yuni-assets.html`, `yuni-plants.html` `1.77 MB` + `11.8 MB` sidecar): **Parked `TODO.md` fix (`TODO.md:211-213`):** Rewrite `d.y||0`, `d.yaw||0`, `d.w||0.9`, `d.h||2.05` in `settlements/yuni/src/76-doors.js:180` as `x == null ? d : x`. Replace pasted `nlvTex` indoor shader hook with shared `20-core-roomlight-host.js` (`K4`), and re-export `godot/data/yuni` + `world-yuni`.
- **`settlements/girder`** (`1.93 MB` + `15.4 MB` sidecars), **`settlements/locus`** (`locus.html`, `locus-kit.html`, `abyss-kit.html` `9.55 MB` + `11.2 MB` sidecar), **`settlements/mavs-refuge`** (`8.80 MB` inline `tex=0`): Replace pasted `nlvTex` copies with `20-core-roomlight-host.js` (`K4`); re-export `godot/data/girder`.
- **`settlements/mungo`** (`4.91 MB` + `34.9 MB` sidecars): Rebuild after `settlements/locus` (`kits/locus` + `kits/eastern-abyssal`) and `biomes/eastabyss`.

### 2.5 Standalone & Engine-Fork Settlements (6 Active Builds) + 12 `PLAN.md` Stubs
- **`settlements/screamers`** (`13.97 MB` inline — split via `split.py`!), **`settlements/noahs-regret`** (`11.74 MB` inline — `core/engine` fork + ship interiors), **`settlements/dhelv`** (`2.56 MB` + `36.6 MB` sidecars; re-export `godot/data/dhelv` & verify `dhelv_nav_test.gd`), **`settlements/span`** (`2.14 MB` + `27.2 MB` sidecars; run `test-span.js` + rebuild `swhighlands --station pillars --preview span`), **`settlements/jimjam`** (`8.64 MB` inline `jimjam-kit.html`), **`settlements/shade`** (`5.46 MB` inline).
- **12 Unbuilt `PLAN.md`-Only Settlement Folders:** `almua`, `ardent`, `blakhed`, `dilihan`, `drum`, `flashing-eye`, `ledge`, `nulab`, `shim`, `strongwall`, `torus`, `zeydanin` (no `build.py` or `src/`; skipped by `test_all.py`).

---

## 3. Open-World Regions Survey (`openworld/*` — 7 Active Regions + 4 Aux Folders)

In `openworld/*/data/region.json`, **only 2 of 8 `region.json` files currently carry a `"relief"` object** (`oidong-highrift` and `pinnacle`, both at `version: 1, phase: 6`), while the other 6 have `"relief": null` (`None`):

| Region Build | Current `data/region.json` `relief` | HTML & Sidecar Size | Stage 8 Action Checklist |
|---|---|---|---|
| `openworld/oidong-highrift` | `{"version": 1, "phase": 6, ...}` | `11.84 MB` + `10.6 MB` | Add `"micro": 2` into `relief`; re-bake streams, `plan/sites.json`, resources & `bake_horizon.py`; add `camp` option to `KHAMLET.census` (`TODO.md:162`) and drop `xanadu-camp` row in `src/48-world-site.js`; re-export `godot/data/world-oidong-highrift`. |
| `openworld/pinnacle` | `{"version": 1, "phase": 6, ...}` | `5.94 MB` + `20.5 MB` | Add `"micro": 2` into `relief`; re-bake streams, sites, resources & `bake_horizon.py`. |
| `openworld/isle-demo` | `None` | `8.45 MB` (x2: `.html` & `.artifact.html`) + `99.3 MB` | Set `"relief": {"micro": 2}`; fold `41t-world-town-water.js` into `41-world-fields.js` (`TODO.md:150`, verify `node core/world/test-town-water.js`); re-bake & re-export `world-isle-kautoa` / `world-isle-valapo`. |
| `openworld/iziz-cluster` | `None` | `5.62 MB` + `40.7 MB` | Set `"relief": {"micro": 2}`; support array `overlay` in `41-world-fields.js` (`TODO.md:168`) and drop `findIndex` shim in `src/47-world-kits.js`; re-export `world-iziz`. |
| `openworld/xanadu-oidong-highrift` | `None` | `8.60 MB` + `10.2 MB` | Set `"relief": {"micro": 2}`; add lush `xanadu` style in `41-world-fields.js` (`TODO.md:173`), drop `WORLD.ground` wrapper in `src/43-world-xoh.js`, re-bake `plan/sites.json`! |
| `openworld/xanadu-lake-shore` | `None` | `2.46 MB` + `8.1 MB` | Set `"relief": {"micro": 2}` + `xanadu` style; re-bake `plan/sites.json` & streams. |
| `openworld/xanadu-north-shore` | `None` | `2.59 MB` + `8.1 MB` | Set `"relief": {"micro": 2}` + `xanadu` style; re-bake `plan/sites.json` & streams. |
| *Aux:* `network-proposal/testbed`, `north-basin`, `outposts`, `towns` | `north-basin` has `data/region.json` (`None`) | — | Rebuild `openworld/network-proposal/testbed/build.py` explicitly if `core/world` roads/tunnels change; verify `openworld/outposts` node test. |

---

## 4. `core/*` Standalone Builds, Audio Lab & `godot/*` Exports

1. **`core/charactermodels`** (`build.py` -> Cosmetic Lab & Animation Lab; `godot/krator/character/` + `godot/data/characters`): Rebuild explicitly, verify `--list-sources`, and sync Godot character kits (`HANDOFF-REBUILD.md:84`). Leave `claude/review-round-3` posture/mask merge to the dedicated Blender garment session (`HANDOFF-REBUILD.md:38`).
2. **`core/audio`** (`TODO.md:24-35`): Headless audio library (`5` `test-*.js` suites). Note `147` ratcheted `|| <number>` findings in `check_source_baseline.json` and `2` known `test-audio.js` category/source checks left by `claude/water-migration-merge` (owned by the Audio Lab turn unless swept separately).
3. **`godot/*` (`29` Exported Worlds/Kits in `godot/data/*` + `25` Test Folders in `godot/tests/*`):**
   - Run `python3 godot/tools/sync_core.py --check` after merging `core/*` changes.
   - Re-export active datasets in `godot/data/*` (`dhelv`, `girder`, `hyperjungle`, `isle`, `iziz`, `qiblai`, `rift`, `sedesert`, `verge`, `yuni`, `world-eternian`, `world-isle-kautoa`, `world-isle-valapo`, `world-iziz`, `world-lod`, `world-longsong`, `world-nhighlands`, `world-oidong-highrift`, `world-pylon`, `world-sedesert`, `world-sedesert-falls`, `world-talia`, `world-yuni`) with `packFormat: 2` (`v4_arrays_two_maps` / `v2_two_maps_oct8`) + `bake_horizon.py` (`40 km` `S1` maps) + `interiors.json` v2 where interiors exist, then verify `python3 tools/check_godot_exports.py`.

---

# Part II — End-to-End Integration Plan

## Phase 0 — Pre-Merge Hygiene on `claude/vertical-stack`

Before merging `claude/vertical-stack` into the integration worktree:
1. **Fix `check_insulation.py` failure in `core/world/landshade.py` (`2` lines):**
   - `core/world/landshade.py:20` (docstring) and `:194` currently hardcode `host/WorldMenagerie/data/cities/<city>-osm.json`, causing `python3 tools/check_insulation.py` to fail with `2 reference(s) from Krator core to host/ or the Menagerie`.
   - Replace the hardcoded `host/WorldMenagerie/...` lookup with an explicit `--osm-json <file>` CLI flag (and neutral docstring text) so `python3 tools/check_insulation.py` exits `0`.
2. **Account for the `7` Biomes Newly Built/Renamed on `origin/main` (`69` commits since branch-off):**
   - Since `claude/vertical-stack` branched, `origin/main` (`74d9815b`) merged and built:
     - `biomes/tiers` (`4` stations), `biomes/arch` (`5` stations), `biomes/paintedhighlands` (`4` stations), `biomes/siphon-pits` (`4` stations + `3` hexapods in `kits/fauna` + `maar yam`/`fumewort` in `kits/crops`), `biomes/galvanic` (station 1), `biomes/clivobredos` (renamed from `biomes/clifflung`, `3` stations), and `biomes/slabfields` (renamed from `biomes/midbasin`, scale-model edit 7), plus `zinc` (`sphalerite`) in `kits/resources`.
   - Include these `7` newly built biomes in the Phase 3 `B1`–`B5` / `M1`–`M2` pass (`arch` ultramafics/water, `galvanic` wet gossan mud, `siphon-pits` travertine/sinter terraces, `paintedhighlands` `S6` banded clay, `tiers` benches, `clivobredos` scarp collars).

---

## Phase 1 — Merge `origin/main` (+ Collected Ready Branches) & Resolve Exact Conflicts

An in-memory `git merge-tree --write-tree origin/main HEAD` audit confirms **zero conflicts in any Stages 0–7 shader, `core/world`, `core/terrain`, `core/biome`, `core/interiors`, `pack.py`, `kits/metropolis`, `biomes/ancientsvalley/src/*`, or `godot/krator/*` & `godot/shaders/*` files**. Every conflict falls into four deterministic buckets:

1. **Bucket 1 — Scale Model `5.1` Binary Rasters & `edit_517.py` Name Collision:**
   - *Conflicting paths:* `tools/scale-model/edit_517.py`, `edit_517.report.json`, `tools/scale-model/model/data/{basins.json, climate.json, model.json, c.png, ct.jpg, h.png, p.png, rt.jpg, st.jpg, t.jpg, tc.png, th.png, tl.png, tm.png, tw.png, wl.png, z.png}`, `model/src/51-region-store.js`, `tests/test_smodel.py`, `kits/resources/data/geology.json`, `kits/resources/src/89-rows.js`, `godot/tests/resources/geology.json`.
   - *Why:* `origin/main` assigned `edit_517.py` to Slabfields and `edit_518.py` to Firebliss/Korona pancake domes, and added `zinc` to `geology.json`.
   - *Resolution:*
     1. Take `origin/main` (`--ours` when merging into an integration branch off `origin/main`) for `edit_517.py` (Slabfields), `edit_518.py`, and all binary `model/data/*` rasters.
     2. Renumber `claude/vertical-stack`'s `edit_517*.py` scripts (`edit_517.py`, `edit_517_alph.py`, `edit_517_azure.py`, `edit_517_crease.py`, `edit_517_gorge.py`, `edit_517_paint.py`, `edit_517_pher.py`) to **`edit_519*.py`** and run them cleanly on top of `origin/main`'s edit-8 rasters.
     3. Union `model/src/51-region-store.js`, `tests/test_smodel.py` (reconciling `neouterwall`'s `garnet`/`vitreous` height check per `TODO.md:38`), and `kits/resources/src/89-rows.js` (keeping `zinc`), then re-run `tools/scale-model/geology.py` -> updates `kits/resources/data/geology.json` & `godot/tests/resources/geology.json`, and run `python3 tools/scale-model/model/build.py`.
2. **Bucket 2 — Additive Tool & Twin Lists (`godot/tools/sync_core.py`, `tools/test_all.py`):**
   - *Resolution:* Union both sides' synced GDScript pairs in `sync_core.py` and test steps (`test_godot_exports.py`, `test_route_and_budgets.py`, biome `test-*.js` discovery from `883eb39b`) in `tools/test_all.py`. Run `python3 godot/tools/sync_core.py --check`.
3. **Bucket 3 — Documentation & Texture Prompt Numbering (`TODO.md`, `core/materials/PROMPTS-NEEDED.md`, `biomes/{korona,opalvalley,siphon-pits}/PLAN.md` & `KNOWN_ISSUES.md`):**
   - *Resolution:* Keep `origin/main`'s post-build `PLAN.md` / `KNOWN_ISSUES.md` updates in `korona`, `opalvalley`, and `siphon-pits`; keep both sides' entries in `TODO.md`; renumber new sections at the tail of `core/materials/PROMPTS-NEEDED.md` sequentially (matching `HANDOFF-REBUILD.md:26`).
4. **Bucket 4 — Generated LFS Pages, Manifests, Indexes & Ratchet Baselines (`PORT-BASELINE.json`, `INDEX.md`, `biomes/ancientsvalley/dist/ancientsvalley-terraces.html`, `kits/construction/*`, `settlements/isle-demo/*`, `tools/check_source_baseline.json`, `tools/checks_optin.json`):**
   - *Resolution:* Take `origin/main`'s `PORT-BASELINE.json` at merge time (never hand-merge hashes), union `checks_optin.json` and `check_source_baseline.json`, and overwrite all generated `dist/*`, `build-inputs.json`, `DEPS.json`, and `INDEX.md` during Phase 3 & Phase 4.

---

## Phase 2 — Pre-Rebuild Sidecar Splits & Shared Core Wave (Single Pass Before Building)

Land all high-reach changes together **before** triggering the rebuild so every page is built once:

1. **Split Page-Cap-Critical Inline Builds Into `.tex` Sidecars First (`check_budgets.py` `>= 85%`):**
   - `kits/desert-nomads` (`16.18 / 16.50 MB`, `98%`), `kits/ash-nomads` (`18.21 / 19.00 MB`, `95%`), `settlements/voth` (`voth-city.html` `18.84 / 20.00 MB`, `94%`), `kits/fauna` (`krator-fauna.js` `28.25 / 30.00 MB`, `94%`), `settlements/screamers` (`13.97 / 16.00 MB`, `87%`, via `split.py`), `kits/beast-riders` (`13.68 MB`, `85%`), and `biomes/xanadu` (`xanadu-floor.html` `12.07 MB`).
2. **Apply Stage 8 Graphics, Terrain, Biome & Kit Core Steps (`GRAPHICS-TERRAIN-PROPOSAL.md` §12c–12d):**
   - **Terrain (`T0`/`S1`):** Set `relief.micro: 2` across all `8` `openworld/*/data/region.json` files; fold `41t` into `41`; add `core/world` `xanadu` style & array `overlay` matching (`TODO.md:150-177`).
   - **Materials (`M1`–`M4`, `K1`, `K3`):** Enable `packFormat: 2` (`v4_arrays_two_maps` / `v2_two_maps_oct8` + `mipVariance`) in `export_spike.py`, `8-bit` `xy8` smooth-surface promotion + `mipVariance` + `M4` `cavity`/`wear` in `pack.py` & `krator-furniture-detail.js`, and uniform-keyed `KMAT` / `69a-world-uv.js` shader dedup.
   - **Biomes (`B1`–`B5`):** Normal-gated `backlit` (`B1`), baked crown & `0.35 m` trunk/rock base AO (`B2`), uniform-keyed `leafMat` / `iridBarkMat` dedup (`B3`), default `INDEX_ITEMS` + `setA2C` + `libSwap` `willReadFrequently` card-fringe dilation (`B4`), and `KDRAWN.h` audits + `S6` chromatic shape tint (`B5`).
   - **Kits & Interiors (`K2`, `K4`, `K5`):** `core/engine` plot-base AO + `boxBevel()` + universal `KROOMLIGHT` (`I1`–`I4`) in `91i-interiors.js` & `kits/interiors`, shared `20-core-roomlight-host.js` replacing `nlvTex`, and split strictly-opaque `godot/shaders/library.gdshader` from `library_cutout.gdshader`.
   - **Parked `TODO.md` Ride-Alongs:** `kits/xanadu` `extra/88c–88e` into `src/`, `KSTRATA` `obsidian` + `opal-rhyolite`/`opal-firetuff`, `KKARST` sink IDs, `KHOOK` clone guard, `KSHADOW.units` (`samplersOf`), `'qiblai'` & `'glazier'` in `52-core-tags-vocab.js`, `'arrow shafts'` in `10-hamlet-wood.js`, `KHAMLET` Xanadu fishing row & work-camp option, ISK `reportErr` guard, `50-core-furnish.js:65` & `yuni/src/76-doors.js:180` `||` fixes, and checks 22–31 opt-ins.

---

## Phase 3 — Topological All-Builds Rebuild & Godot Export Wave

Run in strict dependency order (fetching LFS inputs first in a fresh checkout via `git lfs pull`):

```bash
# 1. Re-pack modified material sets (smooth 8-bit promotions, M4 cavity, mipVariance)
#    Run tools/textures/pack.py on touched kits/biomes, then verify Gate 1 & Gate 3:
python3 tools/textures/m1_slice.py --web

# 2. Build foundational producer kits & bundles in dependency order (KIT-REBUILD-SURVEY.md §0)
python3 tools/build.py kits/catalog
python3 tools/build.py kits/interiors
python3 tools/build.py kits/ancients-interiors
python3 tools/build.py kits/xanadu
python3 tools/build.py kits/iziz-vernacular
python3 tools/build.py kits/highlands
python3 tools/build.py kits/islanders
python3 tools/build.py kits/post-apoc
python3 tools/build.py kits/tungang
python3 tools/build.py kits/ancient-transit
python3 tools/build.py kits/motor-vehicles
python3 tools/build.py kits/mechs
python3 tools/build.py kits/fauna
python3 tools/build.py kits/extraplanar

# 3. Re-bake open-world streams, sites & resources on relief.micro: 2 (before world/town pages build)
for r in oidong-highrift pinnacle isle-demo iziz-cluster xanadu-oidong-highrift xanadu-lake-shore xanadu-north-shore; do
  python3 core/world/bake_streams.py "$r"
  python3 core/world/bake_sites.py "$r" --resources
done

# 4. Run full repo build + every station in extra_builds() (parallelized)
python3 tools/build.py --all -j 4

# 5. Explicitly build the 10 targets skipped by tools/build.py --all (Part I §1)
python3 tools/build.py biomes/swhighlands --station pillars --preview span
python3 tools/build.py core/charactermodels
python3 tools/build.py core/materials/demo
python3 tools/build.py core/atmos/demo
python3 tools/build.py core/atmos/fxdemo
python3 tools/build.py core/cavelight/demo
python3 tools/build.py core/host/example
python3 tools/build.py core/host/underground
python3 tools/build.py core/simulation/example
python3 tools/build.py openworld/network-proposal/testbed
python3 tools/scale-model/model/build.py

# 6. Sync Godot GDScript twins, re-export godot/data/* (packFormat: 2) & bake 40 km S1 horizons
python3 godot/tools/sync_core.py
python3 godot/tools/export_spike.py
for d in godot/data/world-*; do
  [ -d "$d" ] && python3 core/world/bake_horizon.py "$d"
done
python3 tools/check_godot_exports.py

# 7. Refresh dependency graph and repository indexes
python3 tools/dep_graph.py
python3 tools/make_index.py
```

---

## Phase 4 — Verification, Fingerprints, GPU Lanes & Baseline Sign-Off

1. **Fast CPU Lints, Node Suites & Fingerprints (`~2 min`):**
   - `python3 tools/test_all.py --no-build` (all port, insulation, encoding, `check_core_use`, `check_budgets`, `check_assembly`, `check_source`, `check_vendor`, `check_views`, `check_cells`, `check_stale`, and every `core/*/test-*.js` + `NODE_AFTER_BUILD` suite must be green).
   - `python3 core/engine/fingerprint.py` and `python3 core/furnish/fingerprint.py` (`--write` only after visual inspection of the intentional `K2` plot-base AO / `K3` foot-contact AO / `KROOMLIGHT` additions).
2. **Godot 4.7.2 Headless & GPU Verification (`rtx` lane via `harness.py lock`):**
   - `godot --headless --path godot --import` (once).
   - Run all headless suites (`wrelief_test.gd` v1 & v2 goldens, `m1_slice_test.gd` Gate 3, `stage7_interiors_test.gd`, `dhelv_nav_test.gd`, `krand_test.gd`, `kmask_test.gd`, `ktags_test.gd`, `kseason_test.gd`).
   - Run GPU-rendered Godot verification via `python3 tools/harness.py lock --lane rtx -- godot --path godot --rendering-driver opengl3 --script res://tests/interiors/stage7_interiors_test.gd` (`13/13`, Gate 5 `sun_leak_probe == 0.00000`) and Forward+ `route_harness.gd`.
3. **Web Multi-Lane GPU Verification (`arc`, `rtx`, and `vast*` cloud lanes if active):**
   - Run deterministic route ratchets first: `KRATOR_GL=gpu python3 tools/route_harness.py --route openworld`, `--route ancientsvalley`, `--route interiors`.
   - Run `KRATOR_GL=gpu` `verify.py --assert` (`--all-views` on biome station pages; `--interiors` on `erewhon.html`) across rebuilt pages; update `tools/verify_ratchet.json` (`samplers`, `drawn-ground`) for checks 22–31 (`TODO.md:118`).
4. **Baseline & Nightly Gate:**
   - Rewrite `PORT-BASELINE.json` via `python3 tools/port_baseline.py --write --prune` **strictly for rebuilt pages that passed GPU verification** (pruning the `35` retired rows noted in `HANDOFF-REBUILD.md:97`).
   - Finish with `python3 tools/test_all.py --nightly` green across Web and Godot 4.7.2, then request owner sign-off to push to `main` and republish `gallery/` (`gallery/build_gallery.py`).

---

## Phase 5 — Post-Merge Next Step: Xanadu Graphics Expansion

Immediately after Stage 8 lands on `main`, start a clean branch from `main` to build out **Xanadu** (`settlements/xanadu` / Erewhon, `kits/xanadu` & `XAK`, `biomes/xanadu`, `openworld/xanadu-lake-shore`, `openworld/xanadu-north-shore`, `openworld/xanadu-oidong-highrift`, `settlements/pher`, `settlements/kirstabal`, `settlements/thalaba`) on the full Stages 3–7 stack (`GRAPHICS-TERRAIN-PROPOSAL.md` §12c, `TODO.md:71-77`).
