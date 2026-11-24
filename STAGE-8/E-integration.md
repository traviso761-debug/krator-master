# E. What the integration line itself knows (claude/integration-4 at cf7e849a2, 2026-11-23)

## Still to land before Stage 8 (in order)
1. **Done 2026-11-23:** the re-run and the six regions' cuts are on the line (eba6fe089, claude/region-cuts-1123 at 8b1a48af0;
   Gihon's pier-light re-fit on top, b28186237). What it carried is in the known failures below. The original item: The single scale-model re-run (scale-model session, its worktree off cf7e849a2). It replays: from freeze/continental-scope-1123
   edits 520_republic_alps, 521_wave0_hygiene, 522_ria_hydrology, 523_canals_and_settlements (+ canals.json, trade v5); from
   freeze/crook-ria-1123 edits 520_crook, 521_farside; on the line already: Shumar's edit_519_slabfields.py and
   edit_520_amaro_gorge.py, edit_517_vale_ring (63769fb09), Pher's rim (3c3139b33), edit_517_pher_rim.py, Azure Dream's
   edit_517_azure.py; claude/gemini-trade-reconcile (5.1e14-e18: pins, Tabist into Sfenops, Strongwall W0/V0, Marches forts,
   Kold-Lod rename); the Qol bridge (Malbari, drawn by xanadu-north-shore); region recuts for xanadu-oidong-highrift:
   lf_pleasure_dome_isle, stearscamp01 (High Rift mask at 879,1635), sdevcamp0001, xanaduspill, the gorge corridor.
   It re-bakes model/data, kits/resources/data (geology, ledger, lodes), the godot golden-field copies, the regions' data/plan,
   openworld/*-gemini.* (trade, populations, roads).
2. 6a: freeze/vertical-stack-1123 d636c78c4 (Phase 0 first: core/world/landshade.py --osm-json, check_insulation), then
   claude/roomlight-fixes 02b9afc2, claude/citadel-room-graph 4067d5d3, claude/citadel-furnishing-cb5e01 f348edf53.
3. Before Stage 8: claude/xanadu-packs a8d7e7c18 (--page-packs off by default); XS0 files only from claude/xs0-measure-local
   02716be9b (settlements/xanadu/XS0-MEASURE.md, .json, xs0/); lake towns A1 e15d66e4f (or claude/xanadu-plans-ad6ef4 if done).
4. **Done 2026-11-24 (ab4eb8f07, claude/agitated-lalande-bbb361):** the stall was two universal asserts, leaf-stems walking every
   far-terrain triangle and water-mouths reading vertices 26-52 km off; both fixed, the five heavy pages' universal asserts now 0.2-4.5 s.
   Now that water-mouths reads the right vertices it reports streams unfaded into the Ring Sea (lake-shore 1726 m and 1140 m,
   north-shore 1126 m, oidong-highrift 1840 m): reports today, failures once D28 turns water-mouths on everywhere. The original item: **Before step 29's verify (the scale-model session, via the coordinator, 2026-11-23):** on every heavy open-world page the GPU
   verify stalls in the harness's universal asserts after the region's own checks have printed. Pinnacle took 24.8 min on the rtx
   lane, at the edge of the 25-min watchdog; xanadu-lake-shore and xanadu-oidong-highrift were killed there (the lake-shore
   death after its resources panel, in the known failures below, may be the same thing). Left alone, the 484-job verify loses its
   open-world pages to the watchdog. Do one of these, in this order of preference: find which universal assert is slow on a
   large scene (time each in `tools/harness.py` on pinnacle) and fix it; or tier it in `verify_all.py` (main view only, or that
   assert off, for the heavy pages); or have `verify_all.py` give the heavy pages `KRATOR_GPU_STALL_MIN=60`. The scale-model
   session is re-running the three with `KRATOR_GPU_STALL_MIN=60`: its times say how much headroom the third option needs.
5. **The Godot look (merged 456bc3250, claude/krator-graphics-quality-k24ni6):** `GODOT-LOOK-HANDOFF.md` says what this rebuild
   must do for it (the export form's readers, `?form=1`, the pages that take the export additions); read it before the core wave.
   Its Godot side changed how library surfaces draw: `library.gdshader` now culls back faces, and `KratorKmat.fit()` moves
   mirrored or inside-out meshes to the two-sided twin, so a Godot export that shows holes after Stage 8 is that rule's first suspect.

## The line's known test failures (test_all --no-build) and what Stage 8 does with each
| Step | Failure | Cause | Stage 8 action |
|---|---|---|---|
| dependencies run one way | kits/marr/dist an LFS pointer; --list-sources fails for pher, kirstabal, blakhed, flashing-eye, lightwall, nulab, azure-dream (gen/ intermediates not committed: e.g. settlements/pher/gen/69p-kcity-bundle.js, azure-dream/gen/39ad-world-data.js), basilisk/gila/iguana/komodo/ledge/tiers (tex pointers in a skip-smudge tree) | missing generated files, LFS | lfs_needs --pull in the rebuild tree; run each gen/ generator before its build; commit gen/ if its build expects it committed |
| builds take the core modules | kits/marr + settlements/marr: MISSING core/rand, core/tags; OWN getImageData (targets/city/85-city-paint.js x3, 90a-city-world.js), OWN sin-hash (90a) | a rule break from the Marr merge | code fix in kits/marr (KRAND, core/tags, KMASK.canvas) before Marr builds |
| botany census | labyrinth: 21 species added without the census | census not updated | python tools/check_botany.py --update |
| stations have views | loom-chasms 5 view names with apostrophes, kits/marr 1 (em dash and apostrophe) | names rule (no apostrophe or colon) | rename the views |
| test_bridges | "a region with no bridges asked plans as before: xanadu-oidong-highrift" | the region's plan hash moved | after the re-run's recut, refresh the expected hash |
| test-audio | 2 checks: clips without a source page and creator, unknown category | catalogue data | fix core/audio's catalogue records |
| test-hamlet | harvest.wood unparseable: labyrinth "a bitter", "the berries" | biome species tags | fix biomes/labyrinth's harvest.wood strings |
| test-slab (seen at step 4) | golden-slab.json is not the module's output | not stale: cross-machine floats (2026-11-23: the parsed values are equal, a few floats differ in the last digit, about 1 ulp, and the test fails at the golden's own commit ec642bf43 on this machine's node v24.20.0) | a `--write` here would only move the failure to the machine that wrote it: round the golden's floats (or compare within a tolerance) in test-slab.js, then rewrite it; check test-lava and test-scarp for the same cause |
| drum, torus, sw-arcology tests | dist/*.html 0 KB | pages never built here | build them in the rebuild |
| test-outposts | 8 places moved since the cut | model 5.1 moved pins | update after the re-run |
| nwbay test-geology | page's nodes not the field's | page older than the geology re-bake | rebuild after the re-run |
| check_stale | viridian and others behind their sources | expected | the rebuild |
| test-east-rift, test-xan-economy | only the "under four minutes" timing (309-979 s under load) | machine load | owner: relax or run alone |
| xanadu-lake-shore GPU verify (xanadu-plans session, 2026-11-23) | **narrowed by the region cuts (eba6fe089):** lf_pleasure_dome_isle passes on the re-cut; every region check prints and passes, then the page hangs in `run_universal` (after view 6 where views run, else after the resources panel). The JS heap is 339 MB of 4.4 GB, so not V8's limit | the same stall as "Still to land" item 4 | item 4 (find the slow universal assert, tier it, or raise the stall limit; `harness.py` now passes `KRATOR_GPU_STALL_MIN` to cloud jobs, d07ff9bd5) |
| xanadu-north-shore "baked plan is the plan made here" | **fixed by the region cuts (eba6fe089):** a stale bake; the rebake matches the browser. The cuts also laid the Malbari-Haibh shore road and moved Pher's farm-2 off the Thalaba climb | - | none |
| iziz-cluster highways (region cuts, 2026-11-23) | 0.42 m and 31.4 % at -37000,-50606: the Mav's Refuge-Girder link crosses newly standing water, and `ROADS.route`'s 2 m water floor (`42-world-roads.js` lb, e=max(hi,lb)) beats the grade (a 1.8 m step in 5.7 m). Passed before b8ae0593e | core/world roads with the stack's water | ease the floor into the grade (or bridge the crossing) in 42-world-roads.js; re-bake iziz-cluster |
| oidong-highrift trees (same) | 3 of 4737 trees inside a stronger tree's keep-clear | core/world flora | the flora placement's keep-clear pass |
| xanadu-oidong-highrift (same) | **all fixed:** Erehwon's pin and the Pleasure Dome isle (the Erewhon re-seat, 43199acbd), the A-feeder tube and the walker (4c3910794), Gihon's pier light (b28186237). The page is 14.6 MB, 91% of its cap | - | plan the page's split before it grows |
| settlements/opal-ford, settlements/lightwall (the Erewhon session, 2026-11-24) | opal-ford's rebuild is 16.10 MB, over its 16 MB cap; lightwall's bake stops because `core/hamlet/xanadu/23-hamlet-xanadu-row.js` is not loaded. Both left unbuilt on the line | opal-ford: past its cap; lightwall: the Xanadu hamlet row not in its build | opal-ford: its per-page pack (step 22) or a split before Phase D (B10); lightwall: B8 folds the row into `20-hamlet-cultures.js`, which fixes it, else list the file in its build |
| godot pinnacle_world_test (2026-11-23) | fails on Windows: it writes into "/tmp" (no such directory), then an index out of bounds at line 160; the same on both sides of the graphics-quality merge | a Linux path in the test | write to `user://` or `OS.get_cache_dir()` |
| water-mouths on the open world (the verify session, 2026-11-24, after ab4eb8f07) | with the check now reading the right vertices, streams run unfaded into the Ring Sea: xanadu-lake-shore 1726 m and 1140 m, xanadu-north-shore 1126 m, oidong-highrift 1840 m. Reports today (those pages do not opt in); failures once D28 turns water-mouths on everywhere in step 33 | the regions' stream mouths do not fade into the sea | fade each mouth into the sea in the region's stream bake (core/world bake_streams / 83-world-water) before step 33, or carry them on purpose in verify_all.json's known list with the D28 switch |

**The red baseline** (Stage 8 step 2: `python tools/test_all.py` in `C:\Users\travi\Documents\krator-stage8` at 8336b72b5, the line
before Phase B; 2026-11-24, 15789 s): 369 steps, 347 passed, **22 failed**. Against the table above:
- Since fixed in Phase B (expect them green in Phase F): builds take the core modules (Marr, 6826528f1), botany census
  (c30779e81), stations have views (44b077379), test-hamlet (8ddd11502).
- As the table says: dependencies run one way (kits/marr's page an LFS pointer), test_bridges, test-audio, test-slab, drum, torus,
  sw-arcology (pages 0 KB), test-outposts, nwbay test-geology, check_stale, test-east-rift and test-xan-economy (timing only: 582 s,
  665 s).
- **Not in the table before:** "godot vendored core in step" (core changed since `godot/tools/sync_core.py` last ran: rerun it in
  Phase E with the Godot exports); `tools/tests/test_kit_pack.py` (the kit manifest: Phase C step 20's `kit_pack.py --manifest`);
  `core/city/test-host-multikit.js` (D8's multi-kit host: its agent is on it); `core/materials/classes/test-class.js` (7 known
  drifts in PLAN.md 318, plus B11's four until Phase C re-packs); `kits/interiors/tests/test-fixtures.js` (needs the built
  `interiors-core.js`: the rebuild); `kits/shumari/tests/test-sm-kit.js` (it builds the kit, which stops on `kits/shumari/tex/*` LFS pointers in a skip-smudge
  tree: `lfs_needs.py kits/shumari --pull` in the rebuild tree).

Fixed on the line this session (do not redo): Tungang bundle replay (94ff6cf69), 16 ORNUM defaults (94ff6cf69, fccf87423).

## Known page and build facts
- Stale committed pages: xanadu-oidong-highrift (coast's page, without Gihon), strongwall (pad 738.6 m -> ~755 m on the edited
  model), viridian, erewhon, xanadu, xanadu-scrap (kits/xanadu 72, 78b, 78m, 78n, 84, 85b), longsong (baseline recorded 5,304,086 bytes
  against 9,050,548 committed), every page inlining core/tags (vessel/vehicle classes), the fauna page (Coyote birds).
- Longsong's "people dressed" check needs core/charactermodels dist/kchar sidecars for 113 kit.json pieces: build the pieces first.
- Memory: the machine runs out of commit space (WinError 1455 "paging file too small") with other sessions' headless Chromes open;
  one headless Chrome at a time; long runs detached (Start-Process) so a session restart does not kill them.
- Ride-alongs gathered here: .codex/hooks.json absolute worktree path -> repo-relative; Codex sets' wiring (TODO.md); Xanadu packs:
  --page-packs on, glaze xMosC xMosD xBandC xGiltC xBandR, no height in the cut-out class's alpha (Gate 1); Blakhed v3 arrays.
- Accepted known verify failures to carry, not fix: xanadu-oidong-highrift "the lake's small islands" until the recut lands;
  isle-demo "each coastal village's sea leg carries its goods" (hamlet-clay-k ships 0 by sea: an economy item).
- PROMPTS-NEEDED owes 13 (Rift battery 2, Gihon 2, Xanadu lake towns 3, stack 2, Shumar 4); 13 Codex sets of 11-23 delivered unwired.
