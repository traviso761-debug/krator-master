# Stage 8, the all-builds rebuild: the plan

Written 2026-11-23 on `claude/integration-4` at cf7e849a2, read-only, from five surveys (the appendices in this folder). Every
item was checked against the line's code, not taken from the docs it came from; a done item is marked done and dropped.

| Appendix | What | Size |
|---|---|---|
| [A-runbook.md](A-runbook.md) | The ordered procedure reconciled from the stack's runbook (`INTEGRATION-AND-REMAINING-SURVEY.md`, `KIT-REBUILD-SURVEY.md`, `BIOME-REBUILD-SURVEY.md`, `GRAPHICS-TERRAIN-PROPOSAL.md`), `settlements/ALL-BUILDS-REBUILD-PLAN.md`, `HANDOFF-REBUILD.md`, `PERF-PLAN.md`; every command checked against the tool's code; 27 conflicts (C1-C27) | 34 steps, 12 questions |
| [B-ridealongs.md](B-ridealongs.md) | TODO.md's ride-alongs (T1-T52), the other rebuild-bound TODO items (O1-O7), checks 22-31 (C1-C7), HANDOFF-REBUILD's open items (H1-H11), the stack's additions (V1-V6), and the texture wiring list | 55 + 7 + 11 rows |
| [C-bugs.md](C-bugs.md) | Survey 3's 91 bugs and survey 2's, deduplicated and verified, grouped by the file they touch | ~100 open |
| [D-perbuild.md](D-perbuild.md) | What every build's own docs ask of the rebuild, per build; Godot; the known failures to carry | ~160 builds |
| [E-integration.md](E-integration.md) | What the integration line knows: what still lands first, the line's test failures and what to do with each | |

Ids below (T5, S3-54, C4 ...) point into those appendices, where each has its file, lines, reach and evidence.

**The shape of it.** Stage 8 is one rebuild of everything, so every shared change goes in **before** the first build and every
page is built **once**. Five phases: land what is still owed (section 2), make every source change (Phase B), re-bake the data on
the new model (C), build (D), Godot and indexes (E), then check, verify and write the baselines (F). Nothing is pushed or merged
to main without the owner's word.

---

## 0. The owner's answers (2026-11-23, one by one)

Taken as recommended: D1, D2, D3, D4, D5, D6, D9, D10, D11, D12, D14, D16, D18, D19, D20, D21, D23, D25, D28, D29 (both parts),
D32. Where the answer differs from the recommendation, this plan now does what the owner chose:

| # | The owner's answer | What it adds to Stage 8 |
|---|---|---|
| D7 | **Hook and the SE wall in** (review-round-3 and dreamy-davinci stay out) | P7c: merge `claude/hook-p1` (Hook P1-P3) and `origin/claude/seouterwall-s1` before Stage 8; Hook's KLAND reconciled with `core/world/41-world-fields.js` before B7's edits to it |
| D8 | **Wire the multi-kit host now, in every core/city settlement; fix the alleys** | B7b: `core/kits/10-core-kits.js`, `core/city/42-city-multikit.js`, `53-city-host-multikit.js`, `core/region/47s-region-styles.js` into every core/city settlement's `CITY_JS`/`CITY_DATA_JS`/`REGION_JS`; `tools/kit_pack.py --sidecars`; core/city's step-12 alley graze fixed (S3-86a, 47 commands; the owner's word covers core/city's files) |
| D13 | **Fold every kit's strata recipes** into core | B3: arch, compasshills, doubledelta, drownlands, cut and Opal Valley's `KSTRATA.add` recipes into `35-core-strata.js` `RECIPES`; each kit's load-time add dropped |
| D15 | **Draw the landforms at 1:1** | B7: `pancake_dome`, `secondary_crater_bay` and the SE Tharn crater as kinds in `core/world/41l-world-landforms.js` (KINDS, the draw, a node test); the regions that hold them re-bake in Phase C |
| D17 | **Raise the Xanadu sheet's budget to 7 M** | B14: the sheet's `BUDGETS.json` triangle budget to 7 M with a why |
| D22 | **Tungang's `f_wood` stays `wood.carved`** | nothing (S3-71 closed as intended) |
| D24 | **Yuni's doors open to 1.75 rad** | B14: Yuni's door swing 1.4 -> 1.75 (`settlements/yuni/src/76-doors.js`; Locus, Mungo and Verge's YKIT read it) |
| D26 | **WebGL context-loss recovery in Stage 8** | B7: a `webglcontextlost`/`webglcontextrestored` handler in core/host (388 commands): prevent default, pause the loop, on restore rebuild the renderer's programs and textures (S3-76a) |
| D27 | **Both passes**: fungoid and arms | B14: the fungoid pass on BIO.fung, and the arms: `'arms'` in each garrison build's `FURN_CULTURES`, military rooms in `kits/interiors/sets/highlands.js`, `iziz.js`, `zeijani.js`, the Iziz palace, `kits/eternian/src/61-et-defence.js` (O5) |
| D30 | **Fix the small known failures** | B14: Locus's `one-key-map` (the small fix that exists), the golden files (`core/terrain/test-slab.js`, `test-lava.js`, `test-scarp.js` after reading each diff; `core/water/test-gaps.js` "neutral by default"); carry the rest of section 5 |
| D31 | **The garment branch's 112 outfit pieces are published: use them** | Phase C step 20: pull the published pieces before `tools/build.py core/charactermodels`, so Longsong's "people dressed" check can pass |
| Q5 | **World-tile streams on** the relief regions | step 16: `relief.world_tiles: true` and `bake_streams.py <r> --world-tiles` on pinnacle, oidong-highrift, xanadu-oidong-highrift |

---

## 1. Decisions the owner makes before Stage 8 starts

Each has a recommendation; a "yes to the recommendations" settles all of them. They are grouped by how much they change the plan.

### 1a. Scope: these decide how big Stage 8 is

| # | Question | Recommendation | Source |
|---|---|---|---|
| D1 | The graphics-stack upgrades (B1-B5 all-biome, K1-K5 all-kit: backlight, crown AO, foliage dedup, `boxBevel`, `KROOMLIGHT` host, 8-bit catalog families, Godot library split) are **designed but not written**, and change looks on 540-758 pages. Inside Stage 8, or each as its own verified session first? | **Before Stage 8, as their own sessions** (PERF-PLAN section 2: looks go to the owner; STACK-PLAN: "looks after"). Stage 8 then only rebuilds. Three of them overlap ride-alongs (B3/K1 = T31, B4 = T19, B5 = T22): do each once, there. | A Q1, C23; B V3 |
| D2 | The 51-settlement pass (`settlements/ALL-BUILDS-REBUILD-PLAN.md`: layouts onto core/city, re-anchors, frame turns, systemic buildings) | **Not inside Stage 8.** Its pin moves belong to the scale-model re-run; its re-anchors (Erewhon 841,1517; Pinnacle Rock 1007,686; Longsong 1228.88,1621.23) go into the region-cut pass if wanted now; the layout work after Stage 8. | A Q2, C25; B T2 |
| D3 | Relief for the regions that have none (isle-demo, iziz-cluster, xanadu-lake-shore, xanadu-north-shore, north-basin), and the stack's `SITES.json` turning relief on for xanadu-oidong-highrift | Relief on **xanadu-oidong-highrift** (the stack's choice; it is being recut anyway); the others **keep none** in Stage 8. `micro: 2` only where relief is on, written after the last cut. | A Q3, C4-C6 |
| D4 | Texture packing: web glazed families to `xy8` for every build or only Xanadu's; Godot `packFormat: 2` for every exported pack now | Web: **glazed families only, every build** (the class table encodes it). Godot: **format 2 only for the cases re-exported in Stage 8** (D9). | A Q4; B V2 |
| D5 | The verify budget: cloud lanes for the GPU verify; tiering (main view only for pages moved only by proven no-look core items); write `tools/verify_all.py` first | **Write `verify_all.py` first; tiering yes; cloud lanes for the 2-3 days of verify** (about $1 an hour a machine; told when the queue is empty). Local only means about 12-15 h of verify for 400-500 runs. | A Q8; PERF-PLAN 4.1, 6.4-6.5 |
| D6 | The six core/simulation economy fixes (S3-80a-d, S2-C13, S2-C14) move the tuned results that must stay fixed unless meant to move | **Defer to an economy session on the isle demo** (they need re-tuning, not a rebuild). | C section 6.1 |
| D7 | Hook P1-P3 (`claude/hook-p1`), `claude/review-round-3`, `origin/claude/seouterwall-s1`, `claude/dreamy-davinci-30f3c1` | **Out again** (dreamy-davinci is superseded; Hook's KLAND edits the same `41-world-fields.js` Phase B edits). | A Q11; B H5 |
| D8 | Multi-kit wiring (`core/kits`, the multikit host into settlement `CITY_JS`): which settlements, and may Stage 8 edit core/city's lists (the city-layout work owns core/city) | **Not in Stage 8**: no settlement uses it yet; wire it with the cosmopolitan towns' own work. Likewise the core/city alley fix (S3-86a). | A Q7; B T3; C 6.2 |
| D9 | Godot exports: which of the 27 `godot/data` cases are re-exported; the writers of the undocumented ones (`world-eternian`, `world-lod`, `world-longsong`, `world-nhighlands`, `world-pylon`, `world-talia`, `world-sedesert-falls`, `world-isle-valapo`, `strongbow`, `sky`) | **The must-pass set** (sedesert tile, Iziz district, isle-demo towns) **plus every case with a documented command** (E23); the undocumented ten wait for their writers; Xanadu's XP1-XP6 after Stage 8. | A Q9, C12; D godot |
| D10 | Two new foliage guards (albedo under soot; a packed texture nothing samples) will fail pages the first time they run | **Yes, write them, and let them fail**: the rebuild fixes what they find or baselines it. | B T29d |

### 1b. Content calls (each touches one area)

| # | Question | Recommendation |
|---|---|---|
| D11 | core/hamlet's shared Xanadu row takes the wayside shrine and the mine head (moves every Xanadu village) | Yes, in the fold (T12) |
| D12 | Is `obsidian-pancake` the Twins' `obsidian`, or a separate recipe? | Use `obsidian-pancake` for the Twins (T10) |
| D13 | Fold every kit's own `KSTRATA.add` recipes (arch, compasshills, doubledelta, drownlands, cut, opal) into core? | Only Opal Valley's two now (T35); the rest when each kit next changes |
| D14 | Display names and catalog status for `dasri`, `ria`, `yonni` (with `coyote`, `qiblai`, `kimr`, `glazier`, `shumari`, `hueru-kuran`, `spider-lake`, `dzagh-vardzi`, `marr`) | "Dasri", "Ria Dynasty", "Yonni Spear-Queens"; `NO_CATALOG` for any without a catalog culture file |
| D15 | Landform kinds `pancake_dome` and the crater bays: draw at 1:1, or raster-only? | Raster-only in Stage 8 (S3-77) |
| D16 | Pages over the cap: desert-nomads, ash-nomads, voth-city, beast-riders, `krator-fauna.js` | Split them (sidecar packs, B10); bring the raised caps back to 16 MB |
| D17 | Xanadu sheet budget: raise to 7 M, or split rows (S3-35) | Split rows |
| D18 | Texture class table vs the roughness rule (xMosC, xMosD, xBandC, xGiltC, xBandR; xSun, xValance) | The class table wins; glaze the five (B11) |
| D19 | xnFolk static figures on pages with a life layer (S3-79a) | Skip them where a life layer runs |
| D20 | FAUNALANDS' plan-only names (S2-K9) | Map to draught-millipede, giant-archaeopteryx, giant-bat |
| D21 | core/hazard duplicates (rockburst, inrush, seal in both `22-core-hazard-tunnel.js` and `-bore.js`) | Keep the tunnel file's; the bore file names them |
| D22 | Tungang `f_wood` = `wood.carved`: intended? | Owner |
| D23 | Garnet/vitreous station heights (`test_smodel.py`): restate from the model, or carve the model? | Restate from the model (no re-run change) |
| D24 | Yuni's door swing: 1.4 rad or 1.75? | Owner |
| D25 | Economy data: arms and powder to Erehwon, march.w's sightline, Gila's 275 t salt plan; lore and data gaps (S3-36, 47, 90, 65, 66) | With D6's economy session |
| D26 | WebGL context-loss recovery in core/host (388 commands) | Defer (its own session; not a rebuild item) |
| D27 | The arms pass (`'arms'` in `FURN_CULTURES` + military rooms) and the fungoid pass (`BIO.fung`) in Stage 8? | Fungoid yes (5 biomes, with their builds); arms after |
| D28 | `checks_optin.json`'s `water-mouths` and `leaf-stems` reuse item numbers 32 and 33: renumber; switch them to `"*"` too? | Renumber 62, 63; `"*"` with the others |
| D29 | Texture judging: the owner judges each newly wired set in the demo kit, or the rebuild session does and flags doubts? Also wire `rock.gypsum.bedded` in the rift maze and `rock.hewn.drillmarked` in Tungang (they went to Ledge)? | The session judges and lists every set for a look; yes to both |
| D30 | Which known verify failures may stay failing (section 5) | All 16 listed in section 5 |
| D31 | Longsong: are the garment branch's 112 outfit pieces published? | Owner (Longsong builds without them otherwise) |
| D32 | The gallery republish after Stage 8 (a wide change) | Yes, once Phase F is green |

---

## 2. What lands before Stage 8 (in this order; the coordinator's sequence, 2026-11-23)

| # | What | Notes |
|---|---|---|
| P0 | **The scale-model re-run, model-level only** (scale-model session): the edits replayed and renumbered (continental-scope's 520_republic_alps, 521_wave0_hygiene, 522_ria_hydrology, 523_canals_and_settlements with `canals.json` and the trade v5; Crook/Ria's 520_crook, 521_farside; Shumar's 519_slabfields, 520_amaro_gorge; 517_vale_ring, Pher's rim, Azure Dream's 517_azure; `claude/gemini-trade-reconcile`'s 5.1e14-e18; the Qol bridge), then `geology.py`, the trade model, `model/build.py` | **No region cuts** (A C7): the line's `extract_region.py` has no `--relief`/`--smooth` |
| P1 | `freeze/vertical-stack-1123` d636c78c4, its Phase 0 first: `core/world/landshade.py --osm-json` (check_insulation) | Merge file by file where both sides edited: `core/world/48s`, `41`, `85`, `tools/test_all.py`, `tools/harness.py`, `tools/textures/pack.py`, `godot/tools/sync_core.py`, `openworld/SITES.json` (by row), `cut_site.py`, `extract_region.py`, Longsong (A C19; C section 9) |
| P2 | `claude/roomlight-fixes` 02b9afc2 | KROOMLIGHT's fixes (S3-XS2f); the Godot `pick_pool` twin (S3-XS2c) |
| P3 | `claude/citadel-room-graph` 4067d5d3 | data only |
| P4 | `claude/citadel-furnishing-cb5e01` f348edf53 | contains P3 |
| P5 | `claude/xanadu-packs` a8d7e7c18 | `--page-packs` off (byte-neutral); `pack.py`: union with the stack's |
| P6 | XS0's files only from `claude/xs0-measure-local` 02716be9b (`settlements/xanadu/XS0-MEASURE.md`, its `.json`, `xs0/`) | a path checkout, not a merge |
| P7 | **The Xanadu settlement and monastery work in flight** (the owner, 2026-11-23: "don't forget ... a few things are in flight"), each at its tip when its session reports done: `claude/xanadu-plans-ad6ef4` (c03333612 at the survey, 18 new: the lake towns A1-A5 and A12 with Māuṭh, Ōlḍ-Thalaba, Ḍāiyar, Qōqō, Nēṭ, Malbari, Hāibh, Erehwon's south-east and west rounds, Wesṭ-Āil, Wesṭ-Rōḍ, Rim-Phārm, the Qol bridge L6; it carries P3, XS1 and A1 e15d66e4f, so it replaces the separate A1 merge); `claude/beacon-monastery-d509f5` (eeece0db5, 17: the Beacon P0-P6, the beacon fort `beacon:'ancient'`, `anc_beacon_lamp`, the Chapel); `claude/tempest-blueprint-139453` (edb860e31, 11: the House of the Tempest steps 0-4c); `claude/strongwall-plan-c1ee33` a7c180af3 (the kit pieces both use); `claude/openworld-sites-24defd` 8d834cac1; `claude/flashing-eye-b4a480` and Lightwall-on-core (`claude/gallant-saha-9b8a59`) once they commit | xanadu-plans adds `--origin` to `extract_region.py`/`cut_site.py`: union with the stack's flags. The lake towns re-bake on the new ground in Phase C (`fit_lake_town.py`) |
| P7b | **Eight more branches** (the owner, 2026-11-23: "Yes, all eight"): `claude/ancientsvalley-7f521c` 824f451fb and `claude/mystifying-wescoff-d88527` aee00660b (the climbable towers; contains the former), `claude/sim-s4-s7-fdaeba` b9dc01f11 (Pinnacle Rock on the sim), `claude/ancient-network-9cc3e7` 76e2f8539, `claude/ancient-transit-2600a6` ffacfbe74, `claude/nice-wing-075b3c` 7e6ecb822 (Parabola), `claude/agitated-meitner-15ed1a` 865301d3d (an interiors fix), `claude/gifted-faraday-7125ed` d9c56527a (the bench landform; its map edit is in P0) | the sim branch touches core/simulation: Voth's stocks proof, `test-sim.js` and the baseline after it. Ancient's Valley S1 still waits for the owner's look |
| P7g | **The graphics upgrades (D1), as their sessions finish**: B1-B5 on `claude/biome-graphics-b1-b5` (aa5d72d4c at hand-over, cut from the stack; its session merges the line after 6a, retests and reshoots first). It does T31's foliage half, T19's core/biome half and T22, so B4 keeps only T31's KMAT/world-UV half, T19's `25-matlib-host.js` half and T18. K1-K5 on `claude/kit-graphics-k1k5` (bad878656 at hand-over; base the stack + roomlight-fixes; its session merges the line after 6a, reruns tests and fingerprints, takes GPU shots, sends a new hash): K1, K4 bytes only; K2 moves the engine pages; K3 grounds every indexed furniture batch (+4-33 % batch triangles: the owner's cost decision, its `KIT-GRAPHICS-K1-K5.md`); K5 Godot only; step 28's fingerprints then move on purpose | look changes on 700 pages (core/biome) and 400 (the water audit); A2C turns on for 47 builds that never called `setA2C`: the owner sees the shots before it merges. Godot `season_gpu_check.gd` passes 6/6 on the line and on B1-B5 when run as its header says (`--rendering-method gl_compatibility --rendering-driver opengl3`); under Godot's default Forward+ its flush check fails, with or without B1: run it with the flags in step 31, and the test's owner may make it hold under Forward+ |
| P7c | **Hook and the SE outer wall** (D7): `claude/hook-p1` (Hook P1-P3) and `origin/claude/seouterwall-s1` | Hook's KLAND lifts the land rule out of `core/world/41-world-fields.js`: reconcile it with the stack's 41 first; the SE wall brings its own katabatic file `89-atmos-fx-gale.js` |
| P8 | **The region-cut pass** on the merged line with the stack's tools: `extract_region.py --relief --smooth` (pinnacle, oidong-highrift, xanadu-oidong-highrift per D3), the xanadu-oidong-highrift recut (lf_pleasure_dome_isle, stearscamp01 with the High Rift mask at 879,1635, sdevcamp0001, xanaduspill, the gorge corridor), D2's re-anchors if taken | the cuts Stage 8's Phase C bakes on |
| P9 | **Tool fixes worth making first** (A Q10; C section 3): `write_gen()` under `--list-sources` too (so `dep_graph`, `lfs_needs` and test_all step 4 work in a fresh checkout); `extract_region.py --relief` keeping `micro`/`world_tiles` from the `SITES.json` row (A C5); `test_all.extra_builds()` taking the nested builds `--all` skips; `bake_sites.py` reading `kits/xanadu/xanadu.py` FILES, not every `src/*.js` (S3-43); `bake_towns.py` hashing inputs plus a `BAKE_VERSION` (S3-A1a); the tools and tests bugs of C section 3 (31), so the rebuild's checks are honest | each its own small commit, no page moves |

Stage 8 starts from the tip after P0-P9, in a fresh skip-smudge worktree.

---

## 3. The procedure

The steps are A's 34, regrouped with every ride-along (B) and bug fix (C) placed in the step that does it. Commands are
PowerShell; flags are checked against each tool (A section 3 has every command in full).

### Phase A: the checkout (no page changes)

1. **Worktree and LFS.** `GIT_LFS_SKIP_SMUDGE=1 git worktree add ..\krator-stage8 <tip>`; `git lfs pull` the library and
   patterns; `tools/lfs_needs.py <build> --pull --no-list` for every build; pull `settlements/longsong/dist/kchar/**`,
   `kits/interiors/dist/**`, `kits/motor-vehicles/dist/**`, `settlements/isle-demo/dist/**` explicitly (A step 1: Longsong ships a
   pointer silently otherwise).
2. **Character pieces**: copy `core/charactermodels/pieces/` (gitignored, ~200 MB) from the main checkout (A step 2).
3. **Godot import** once: `godot --headless --path godot --import`.
4. **Record what is red** before any edit: `python tools/test_all.py --no-build` to a log (expected red: E's table).

### Phase B: every source change, before the first build

One commit per shared file where possible, its node test with it; `tools/reach.py <file> --commands` before and after (A step 13).
Order: shared core, then shared kits, then per-build, so each page moves once.

**B1. Build blockers.**
- `settlements/lightwall`: `kits/qiblai/src/89q5s-qb-shells.js` "generative with no builder": list it in `settlements/xanadu/build.py` `DETERMINISTIC` or give it a builder (T38).
- `kits/xanadu/extra/`: two files numbered `88h` (`88h-xa-gihon.js`, `88h-xa-mine-works.js`): renumber one before B9 moves them (A C26).
- `kits/marr` and `settlements/marr`: take `core/rand` and `core/tags`; replace the own `getImageData` (`targets/city/85-city-paint.js` x3, `90a-city-world.js`) with `KMASK.canvas` and the sin-hash (`90a`) with `KRAND` (check_core_use; new since the surveys).
- View names: rename the 139 with an apostrophe or a colon (`python tools/check_views.py --list`), loom-chasms' five and Marr's first (C1-C2 of B; 7 over the baseline now).
- The botany census: `python tools/check_botany.py --update` (labyrinth's 21 species).
- `core/hamlet/10-hamlet-wood.js`: rules for labyrinth ("a bitter", "the berries"), compasshills (padding, bast), crook (fiber/padding, instrument), or retag those biomes (S3-2; test-hamlet).
- `core/audio`: the catalogue's clips without source or category (O1; the audio session's call whether here).

**B2. core/tags vocabulary** (`52-core-tags-vocab.js`, 407 commands, every page): the cultures `coyote`, `qiblai`, `kimr`,
`glazier`, `shumari`, `dasri`, `hueru-kuran`, `spider-lake`, `ria`, `yonni`, `dzagh-vardzi`, `marr` (D14), `NO_CATALOG` where no
catalog file; then drop the load-time patches (`kits/kimr/src/89-rows.js:7-9`, `core/tags/glazier/` and its line in
`kits/tungang/build.py`, `kits/dasri/src/52d-ds-tags.js`, `kits/ria/src/70-ra-vocab.js`, `kits/yonni/src/53a-yn-vocab.js`);
`node core/tags/test-tags.js` with its digest (T8, T32, T34, T36; S2-C18).

**B3. core/terrain.**
- `43-core-ground.js` **after the stack's edit to it**: rename `kgTri`'s and the hex sampler's `v1 v2 v3`/`r1 r2 r3` (they clash with r128's env-map defines: the mesh vanishes); drop the `#undef` guard in `host/39i-core-cavern-rock.js:29-30`; one `kEye()` instead of two inline eyes (T5, T17; S3-54).
- `35-core-strata.js`: the Twins on `obsidian-pancake` (D12); Opal Valley's `opal-rhyolite`/`opal-firetuff` into `RECIPES`, drop its `KSTRATA.add` (T10, T35).
- `37c-core-rubble.js:116`: KRUBBLE returns a plain index array (S3-88b); `39b-core-speleo.js:60`: `len: Math.min(t, L0)` (S2-C20); `39c-core-karst.js:184,207`: sink ids carry the level (T20); the `39h` header comment (S3-17).

**B4. core/shader, core/biome, core/materials** (334-1017 pages each).
- `06-core-khook.js`: tag the composed hook, copy layers by name on clone (T16).
- `30-core-foliage.js:475`: `willReadFrequently` (T18).
- `34-core-impostor.js`: read the lights again on the first frame when there are no host ticks; default `impostorLook({gain:3.6,wrap:1})` (S3-46: far trees black).
- `20-core-kit.js` `BIO.libSwap` and `25-matlib-host.js`: fill texels under alpha 48 with the mean opaque colour (T19 = stack B4, if D1 leaves it here).
- The in-page audits on `KDRAWN.h` (water audit, cliff gate, attach audit; T22 = B5).
- Foliage program keys on the hook's options, `KMAT.libKey` and world-UV numbers as uniforms (T31 = B3/K1, if D1 leaves it here).
- The two new guards (T29d; D10).

**B5. core/water, core/atmos, core/shadow.**
- `51-core-water-kinds.js` **after the stack's foam change** (T52): `WATER.drawFlow`'s program key takes `o.shallow`, `o.deep`, `o.color`; drop arch's workaround `biomes/arch/src/89w-host-water.js:19` (T37).
- Ice `levelAt` (`ext/54`), drop the polynya's line (T43).
- `atmFogMistC` and `heightFog.mist.colour`; drop siphon-pits' per-frame tint (T41).
- `50-core-water-draw.js:3`: a clear error when `ATMOS.init` has not run (S3-A1e).
- `KSHADOW` core is done; the pasted `samplersOf` copies in about 15 biomes go with each biome's turn (T44).

**B6. core/engine, core/catalog, core/furnish.**
- `27-mat.js:45`: rename the engine's `ANIMU.uWind` to `uAnimWind` (it clashes with the sky's `vec2 uWind`) (S2-C23).
- `30-geo.js:153` `lathe()`: the pole ring's normal, or a ring near the axis (S3-84a: black caps).
- `krator-furniture-runtime.js`: the nearest-24 lamp cap in core; drop the sheet's and beast-riders' local copies (S3-72).
- `10-core.js:11` re-entry guard and `settlements/isle-demo/bundles.py:102`: the ISK error loop (T21).
- `91f-furnish.js:24` dry FURNISH queued and flushed (S2-C24) **only if** wanted now; else defer.
- core/host's README: kit host files `98x-`, never `99-host-<kit>` (S3-84b).

**B7. core/minimap, core/host, core/world (the world items after P1).**
- `core/minimap/88-core-minimap.js:52-55`: draw `kind==='poly'` floors; drop 88b's walkBands workaround (S2-C19: KCAVERN rooms throw).
- core/host walker and pick underground: source in; the pages take it (T23).
- `41-world-fields.js`: `W.at` returns a copy, `W.atShared` for hot loops, callers audited (S3-55); fold `41t-world-town-water.js` (T24); `overlay` as a list, drop iziz-cluster's shim (T28); the `xanadu` style's region wrapper (`43-world-xoh.js:27-28`) dropped (T30).
- `85-world-flora.js:18`: the tile margin from `claude/pinnacle-corridors` 67b3ac12e (S3-59).
- `88s-world-sites.js:70-77`: a hamlet key its kit lacks goes to `S.missing` (S3-60); the generic tent camp (`KWCAMPS`, `kind: 'ring'|'halt'`), drop xanadu-oidong-highrift's `48t`/`88t` (T26).
- Each region's `verify.py` calls `hostNegatives()` and needs every negative to fail (S3-26).

**B8. core/hamlet, core/region.**
- Fold `core/hamlet/xanadu/23-hamlet-xanadu-row.js` into `20-hamlet-cultures.js` with the shrine and the mine head (D11), the fishing works into the row, drop Kirstabal's `fishingRow` (`settlements/kirstabal/src/42-ks-ring.js:30`) (T11, T12).
- Fold `camp/26-hamlet-camp.js` into `30-hamlet-village.js`, pass `camp` through 48s, drop oidong-highrift's `xanadu-camp` row (T25).
- `core/region/50-region-valley.js:124`: `every > 0 ? every : 1` (S3-87a); `:152-156` `S.roadRaids` (S3-87b); `40-region-sim.js:87,172` guard `ISLE_DIMS` and `simTrade` (S2-C15).

**B9. Shared kits** (C section 2 has the 25 kit bugs).
- kits/xanadu: `extra/88c-88h` and `88g` into `src/`; `69dz`'s item into `kits/interiors/sets/xanadu.js`; `87k1-xa-lake-rooms.js` into a new `kits/interiors/sets/xanadu-lake.js`, Kirstabal through `kit.json` "interiorSets"; `87k-xa-lake-trades.js` into `xanadu.py` FILES; drop `"external"` from `settlements/pher/kit.json`; xnFolk off where a life layer runs (D19) (T7, T11, T13).
- kits/fauna: `krator-fauna-xeno.js:26` `o.stock == null ? 1 : o.stock`; Köppen `Cwb`, `Dsc` in `fauna-core.js:76`, then the Ghaunt-Ox and the Flenser-Hound (T39, T42); FAUNALANDS (D20).
- `vessel`/`vehicle` registration through core/tags: Ring Sea, Xanadu lake craft (with the move above), Motor Vehicles (drop `class:'motor vehicle'`), Mechs; the engine's walkable-deck hooks (T9).
- `kits/tents/tents_bundle.py` (T27); `core/charactermodels/data/peoples.json`: `cflit_qbon`, `yonni`, `hush_kin` (T4).
- check_source's kit top-level keys (catalog, fauna, mechs, motor-vehicles) (C7 of B).

**B10. Page-cap splits** (before anything adds bytes; D16). Port Scyvoi's sidecar (`kits/scyvoi/build.py:92-116,191`) into
`kits/desert-nomads`, `kits/ash-nomads`, `kits/beast-riders` and Voth's `voth-city`; `kits/fauna`'s `krator-fauna.js` splits its
texture chunks as `fauna.html` does; then the raised caps back to 16 MB. Watch `settlements/loj-twenny` (88 %, in no plan) and
`screamers` (87 %; its `split.py` is the fragment cutter, not a sidecar tool: A C13).

**B11. The packer reads the classes.** Wire `tools/textures/mclass.py` `settings(fc)` into `pack.py`'s `process()` (`xy8` for
`glazed`, `xy6` the rest; Godot per D4); glaze `xMosC`, `xMosD`, `xBandC`, `xGiltC`, `xBandR` (roughness under 0.35 in both
`materials.json`, class `glazed`, out of `m1-classes.json` "pending") (D18); `mclass.py --prove` still passes; Gate 1: no height
in the cut-out class's alpha.

**B12. Wire the delivered texture sets** (T1; B's "Texture wiring" lists each set, build and family): the 2026-11-12 batch (59 of
63 unwired), 11-16/11-17 (21), 11-23 (13), plus older strays; `kits/kimr` and `settlements/azure-dream` need a `materials.json`
first. Judged in the demo kit (D29). `metal.gilt.leaf`, `inlay.opal`, `ground.paddy.wet` are not delivered: their stand-ins stay.

**B13. `buildlib.through_tools_build(__file__)`** at the top of the 150 `build.py` files without it (template `tools/new_build/`;
no page moves) (C3 of B).

**B14. Per-build fixes** that are code (C section 4's 20; D's code items): Locus's sheet key, Mav's interiors bake rerun, the
Strongwall pad (738.6 m to about 755 m on the edited model), Blakhed's v3 arrays (sampler risk), the fungoid pass on eastabyss,
hyperjungle, nwlowlands, rift, swlowlands, oidong, the Throne, ringisles (D27), `.codex/hooks.json` repo-relative (after checking
Codex resolves hook commands from the repo root). Each in its build's turn of Phase D if it touches only that build.

**B15. Node tests** for every module touched (A step 12's list), then `python tools/reach.py <every changed file> --commands`.

### Phase C: data on the new model (after P0 and P8)

16. **Regions** (relief ones per D3): write `micro: 2` (and `world_tiles` per Q5 below) after the last cut; per relief region
    `bake_streams.py <r> --world-tiles`, `bake_sites.py <r>` **and** `bake_sites.py <r> --resources` (one writes `sites.json`, the
    other `resources.json`: A C8), each `--check`; the other regions `bake_sites.py` twice; isle-demo `--resources` only.
    `bake_streams.py` only on relief regions (it stops on the others: A C9).
17. **Towns and lake towns**: `bake_towns.py pher`, `bake_towns.py voth` (then `--check`); `tools/fit_lake_town.py` (A step 15).
18. **Settlement-local cuts** (azure-dream, flashing-eye, longsong, pinnacle-rock, viridian `region/`): re-cut on the new model if
    P8 did not (A step 16).
19. **Texture packs** for every build whose `materials.json` changed in B11-B12 and the classed builds: `pack.py <build>` and
    `--check`; `mclass.py --measure`; `m1_class_gates.py`; `m1_slice.py --web` (Gates 1 and 3); `godot/tools/pack_ground_layers.py`;
    the 12 biome packs without `plants` (T29: catch, crater-drylands, eastabyss, ebadlands, guilin, korona, necanyons, nwouterwall,
    rift, sedesert and its stations, swbay, swhighlands); `pack.py kits/catalog` for the ten decals (T6).
20. **Kit manifest and the character pieces**: `tools/kit_pack.py --manifest` and `--check-manifest`; `tools/build.py
    core/charactermodels` (writes `dist/pieces/`, which Longsong needs).

### Phase D: the build

21. **Every build and station**: `python tools/build.py --all -j 2` (406 commands: 176 builds + 230 stations, + xanadu-lake;
    `-j 2`, not the stack plan's `-j 4`, for memory). No separate producer-kit pass: the bundles are built inside each consumer (A
    C14); the three real orderings are `kits/interiors` first (built in), charactermodels before Longsong (step 20), Span before
    its preview (step 23). Failures: rerun one with `tools/build.py <build> [--station <s>]`.
22. **Xanadu per-page packs** (two pass): record each Xanadu-family page's list on a GPU lane (`page_pack.py record`), make
    `--page-packs` the default in `settlements/xanadu/build.py`, rebuild the 17 Xanadu-family builds, delete the shared
    `xanadu.tex.xanadu*.js` no page reads (A step 20).
23. **What `--all` skips**: `freeze_span.py` then `biomes/swhighlands --station pillars --preview span`; `kits/post-apoc/sockets-example`;
    `core/materials/demo`, `core/atmos/demo`, `core/atmos/fxdemo`, `core/cavelight/demo`, `core/host/example`, `core/host/underground`,
    `core/simulation/example`, `core/simulation/ride/lab`, `openworld/network-proposal/testbed`, `tools/scale-model/model` (unless P0
    built it on the final model). The gallery builds wait for D32 (A step 21, C15).

### Phase E: Godot and indexes

24. `godot/tools/sync_core.py` and `--check`; the exports per D9 (A step 23 has each command: `export_spike.py`'s 7 cases,
    `harness.py export ... --box` for the world cases, verge's and dhelv's `--export`, the isle and oidong-highrift sim exports,
    `godot_case.py` for oidong-highrift and pinnacle, `bake_horizon.py --region <r> --case <dir>` (not a folder argument: A C10));
    re-pack geyser, fauna and islanders before theirs; `tools/check_godot_exports.py`; `tools/export_report.py --compare`.
25. `python tools/dep_graph.py --write` (writes `DEPS.json` only with `--write`: A C11; works now that every `gen/` exists).
26. `python tools/make_index.py --all`.

### Phase F: checks, verify, baselines

27. `python tools/test_all.py --no-build`: green but for section 5's carried failures.
28. Fingerprints: `core/engine/fingerprint.py`, `core/furnish/fingerprint.py`; the moves on purpose (the hem rule: Islanders,
    Scyvoi, Lizardmen; Eternian; the vessel hooks) read and then `--write` (T6, T46).
29. **GPU verify** of every rebuilt page, driven by `tools/verify_all.py` (D5; merged 3b8dc2b83: `--all` takes every
    `port_baseline` page plus the 14 targets `--all` skips, 484 jobs; `--dry-run` shows each command and its source; `--resume`,
    `--retry-failed`, `--detach`; its report checks D30's carried rows one by one; fill `verify_all.json` "no_look" once a no-look
    item's proof has run, to turn tiering on; `kits/sw-arcology` has no `verify.py`: write one or keep it skipped). Each page: `KRATOR_GL=gpu verify.py <page> --assert` (biomes and stations `--all-views`; Erewhon
    `--interiors`; `kits/interiors --sets`; the Xanadu pages' own `--views`), lane `auto`, longest first (voth-city about 40 min,
    the isle demo, Erewhon `--interiors` 882 s, the biggest `--all-views`), one local verify per lane, no build while a verify
    runs, through the verify cache; per D5. A `STALE PASS` or a run without the renderer line does not count.
30. Route harness on both lanes (timing: never `auto`): `--track openworld|ancientsvalley|interior` (A C27).
31. Godot tests: `wrelief_test.gd`, `m1_slice_test.gd`, `stage7_interiors_test.gd` (rtx), `route_harness.gd`, then every
    `GODOT_TESTS` entry.
32. The hash baseline: `port_baseline.py --update <each page that passed>`; once no page is a pointer and the tree is clean,
    `--write --prune` (37 retired rows) (A C17; H8).
33. **Checks 22-31 switched on**, in order: `check_stale.py --write-baseline` (expect `{}`); `names`, `recorded`, `minset` to
    `"*"` then `check_assembly.py`; `samplers`, `drawn-ground` (and the renumbered `water-mouths`, `leaf-stems`: D28) to `"*"`,
    then `harness.py ratchet --write <page>` per rebuilt page on a GPU lane; the ratchets' `--write-baseline` only for pages
    rebuilt and read; `check_cells.py --strict` replaces its ratchet (B C1-C5). Greatchasm and neouterwall may fail `samplers` at 16.
34. `python tools/test_all.py --nightly`: the second rebuild must hold the baseline; the nightly verifies; Godot's headless tests;
    export sizes; the compare shots.
35. Sign-off: commit with `tools/commit.py -F` (pages, `build-inputs.json`, `tex/`; never `gen/`); delete the done TODO entries
    (T45, T47, T48, T49, O2, and every ride-along done here); update `HANDOFF-REBUILD.md` with this pass's numbers and
    `PROMPTS-NEEDED.md`; the owner's yes before any push (raise `http.postBuffer`); the gallery per D32.

---

## 4. Time, memory and risk

- **Build**: 406+ commands; the last sweep summed 446 s of build time over 208 commands, so expect several hours at `-j 2`.
- **GPU verify**: 400-500 runs; about 9 h for 350 runs on the two local lanes last time, about 2.25 h for 290 with six cloud
  lanes (HANDOFF-REBUILD). Voth city 40 min alone.
- **Memory** is the binding limit: commits failed with "paging file too small" while other sessions' headless Chromes held about
  3 GB. Stage 8 needs the machine to itself for Phase D and F: one headless Chrome at a time, `-j 2`, long runs detached
  (`Start-Process`) so a session restart does not kill them, the renderer dying at V8's 4 GB on the heaviest pages.
- **Page caps** (A section 4): desert-nomads 98 %, ash-nomads 96 %, voth-city 94 %, `krator-fauna.js` 93 %, loj-twenny 88 %,
  screamers 87 %, thalaba 85 %, gihon 84 %, kirstabal 83 %, beast-riders 82 %, flashing-eye 80 %. The cap is a hard fail in
  `tools/build.py`: B10 first, and the per-page packs (step 22) cut the Xanadu ones.
- **Stale plans**: the stack's runbook has commands that fail as written (A C8-C12, C17, C27) and instructions already done the
  other way (A C1-C3, C18); this plan uses the corrected ones.

## 5. Known failures to carry, not fix (D30; D's list)

The owner (D30): fix the small ones; Locus's `one-key-map` and the golden-file tests (`test-slab`, `test-lava`, `test-scarp`,
`test-gaps`) are fixed in B14, so they drop off this list. Added 2026-11-23, to be fixed or carried on purpose in step 29 (verify_all's report): the SE outer wall, merged back by
the owner's D7, failed two pages before its revert (d5fccd6f8): `seouterwall-ambertarn` fails `export-profile` (box
[-150,-150,150,150]); `seouterwall-gatetarn` puts nwouterwall's stipa past the instance cap with no `capWhy` (293,954 > 250,000);
its other pages were never verified (coppertarn passed). And for B11: `core/materials/classes/test-class.js` fails 7 until the class
table takes Nulab's, Blakhed's, Flashing Eye's `feRoof` and the catalog's `tg*` families.

The rest are carried:

Voth city's embassies and Arena flight; Longsong's draw-call OVER and stale interiors bake; the Xanadu sheet's triangle budget and
Iziz Overview's 923 draw calls (warnings); Dalab's and crater-drylands' `instance-cap`; Mav's Refuge `walk-and-reach`; Ys's conch
house hall spots; Locus's `one-key-map` (unless taken); Ancient's Valley's shell bake on software GL; the isle demo on SwiftShader
here; xanadu-oidong-highrift's small islands until P8 lands; `kits/interiors --sets` residences (the tents WIP set) and the
`xa_workshop` counter; `kchar_test.gd`'s giant on the ladder; `test_smodel.py`'s NE wall bases (unless D23 restates them);
`test-lava.js`, `test-scarp.js` goldens and `test-gaps.js` "neutral by default"; Godthrone's card negative with no cards; the isle
demo's `hamlet-clay-k` shipping nothing by sea (an economy item); `test-east-rift.js` and `test-xan-economy.js` timing under load.

## 6. Deferred (not Stage 8)

The graphics-stack upgrades (their own sessions before Stage 8: D1); the 51-settlement pass (D2); the economy fixes and data (D6,
D25); review round 3 and dreamy-davinci (D7); Xanadu in Godot XP1-XP6 and the
Xanadu graphics expansion (after Stage 8 is green); C section 7's 26 big items (far-river LOD, KRAND's hash, the pueblo hatches,
the engine's two-renderer dispose, the Line's car doors, Tungang's round walls, fauna rigs in Godot, Pinnacle's recut stall,
Strongbow's walk gaps, garments ...); the exports owed outside Stage 8 (loj-twenny, Tungang T10, Qiblai Q7g, thalaba, blakhed,
azure-dream AD8, viridian V8, jimjam P5, shumar, yeti Y7, coyote C9, line L6, outlands O9, tiers T6, the Ancients' Sanctum and Heirs).

## 7. Open questions left after D1-D32

- Q5 is answered (world tiles on); the T2 residual rasters still depend on whether T2 passed (`STAGE-2-TERRAIN-REPORT.md` on the stack): the session reads it.
- C section 8's 29 "cannot tell" items need a built page or a GPU run: check them in Phase F's verify, not before.
