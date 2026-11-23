# E. What the integration line itself knows (claude/integration-4 at cf7e849a2, 2026-11-23)

## Still to land before Stage 8 (in order)
1. The single scale-model re-run (scale-model session, its worktree off cf7e849a2). It replays: from freeze/continental-scope-1123
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
