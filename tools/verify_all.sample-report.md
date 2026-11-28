<!-- A sample: tools/verify_all.py's report of its local test run (2026-11-23, claude/integration-4 at dd2c2e591, 12 pages, --workers 1). The seven STALE PASS pages are committed pages older than their sources on this line (the Stage 8 rebuild clears them); ride-lab first failed on an LFS pointer in a skip-smudge checkout and passed on --resume --retry-failed after the pull. -->
# Stage 8 verify: local-12

Written by `tools/verify_all.py` at 2026-11-23 07:24 from `%LOCALAPPDATA%/krator-verify-all/runs/local-12` (plan of 2026-11-23T07:16:39 at `dd2c2e591`, every page holding core/cavelight/demo/, core/atmos/fxdemo/, ride/lab/, core/host/example/, kits/ancients/dist/spire.html, kits/yuni/dist/yuni.html, reedlake-village, screamers/dist/furniture, biomes/throne/dist/throne-tube, biomes/guilin/, sockets-example.html, hook/dist/hook.html). KRATOR_GL=gpu; tier auto; lanes at the start arc, rtx; lanes that ran a job arc, rtx.

**12 jobs: 3 verified on these bytes (3 run, 0 cached), 2 known failures, 0 failures**; 7 stale.

| Status | Count | Counts as verified |
|---|---|---|
| stale | 7 | no |
| known | 2 | no |
| pass | 3 | yes |

## Against the owner's list (D30, STAGE-8/PLAN.md section 5) and the carried list (HANDOFF-REBUILD.md:120-126)

| Id | What | Pages run | Failing on it | Passing now | Note |
|---|---|---|---|---|---|
| D30-1 | Voth city: the embassies drawn short and the Arena canton's flight | 0 | 0 | 0 |  |
| D30-2 | Longsong: draw-call OVER and the stale interiors bake | 0 | 0 | 0 |  |
| D30-3 | the Xanadu sheet's triangle budget and Iziz Overview's 923 draw calls (warnings) | 0 | 0 | 0 |  |
| D30-4 | Dalab's instance-cap (swlowlands/glossy) | 0 | 0 | 0 |  |
| D30-5 | crater-drylands' instance-cap (craterdry/bloom) | 0 | 0 | 0 |  |
| D30-6 | Mav's Refuge walk-and-reach (86 floors) | 0 | 0 | 0 |  |
| D30-7 | Ys's kit sheet: the conch house hall spots | 0 | 0 | 0 |  |
| D30-8 | Locus's sheets: one-key-map (unless B14 takes the small fix) | 0 | 0 | 0 |  |
| D30-9 | Ancient's Valley: the shell bake on software GL (GPU lanes pass) | 0 | 0 | 0 | software GL only: not looked for on the GPU |
| D30-10 | the isle demo on SwiftShader here | 0 | 0 | 0 | software GL only: not looked for on the GPU |
| D30-11 | xanadu-oidong-highrift's small islands until P8 lands | 0 | 0 | 0 |  |
| D30-12 | kits/interiors --sets: the residences (the tents WIP set) and the xa_workshop counter | 0 | 0 | 0 |  |
| D30-13 | kchar_test.gd's giant on the ladder (Godot) | | | | not a page verify (a node, Python or Godot test): see test_all |
| D30-14 | test_smodel.py's NE wall bases (unless D23 restates them) | | | | not a page verify (a node, Python or Godot test): see test_all |
| D30-15 | test-lava.js, test-scarp.js goldens; test-gaps.js 'neutral by default' (B14 fixes them, D30) | | | | not a page verify (a node, Python or Godot test): see test_all |
| D30-16 | Godthrone's card negative on a page with no cards (a check gap) | 0 | 0 | 0 |  |
| D30-17 | the isle demo's hamlet-clay-k ships nothing by sea (an economy item) | 0 | 0 | 0 |  |
| D30-18 | test-east-rift.js and test-xan-economy.js timing under load (node) | | | | not a page verify (a node, Python or Godot test): see test_all |
| HR-1 | guilin (frozen) | 1 | 1 | 0 | outside D30: the owner rules on it |
| HR-2 | Yuni's three pages on the one key map (the not-yet-adopted list) | 0 | 0 | 0 | outside D30: the owner rules on it |
| HR-3 | yuni-plants' streamed doors | 0 | 0 | 0 | outside D30: the owner rules on it |
| HR-4 | Pinnacle Rock's attach audit (1.87%, limit 1%) | 0 | 0 | 0 | outside D30: the owner rules on it |
| HR-5 | sockets-example's demo def has no declared door | 1 | 1 | 0 | outside D30: the owner rules on it |

## Passed but does not count (STALE PASS, no renderer line) (7)

| Page | Status | Log |
|---|---|---|
| `biomes/throne/dist/throne-tube.html` | stale | logs/002-biomes_throne_dist_throne-tube.html.log |
| `settlements/hook/dist/hook.html` | stale | logs/004-settlements_hook_dist_hook.html.log |
| `settlements/screamers/dist/furniture.html` | stale | logs/005-settlements_screamers_dist_furniture.html.log |
| `settlements/reedlake/dist/reedlake-village.html` | stale | logs/007-settlements_reedlake_dist_reedlake-village.html.log |
| `kits/yuni/dist/yuni.html` | stale | logs/008-kits_yuni_dist_yuni.html.log |
| `kits/ancients/dist/spire.html` | stale | logs/009-kits_ancients_dist_spire.html.log |
| `core/cavelight/demo/dist/cavelight-demo.html` | stale | logs/010-core_cavelight_demo_dist_cavelight-demo.html.log |

## Known failures (2)

| Page | Known | Items | Log |
|---|---|---|---|
| `biomes/guilin/dist/guilin.html` | HR-1 | assert fruit tagged, catalogued and drawn; assert foliage held by its structure (core attach audit) | logs/000-biomes_guilin_dist_guilin.html.log |
| `kits/post-apoc/sockets-example/sockets-example.html` | HR-5 | front-door-not-default - on the default (+z edge centre): sock-demo, sock-demo, sock-demo, sock-demo, sock-demo, sock-demo, sock-demo, sock-demo, sock-demo, sock-demo | logs/011-kits_post-apoc_sockets-example_sockets-example.html.log |

## Verified (3)

| Page | Tier | Command | Status | Lane | Renderer | Secs |
|---|---|---|---|---|---|---|
| `core/host/example/check.py` | full | `` | pass |  |  | 4 |
| `core/simulation/ride/lab/dist/ride-lab.html` | full | `--assert` | pass | arc | ANGLE (Intel, Intel(R) Arc(TM) 140T GPU (8GB) (0x00007D51) D | 24 |
| `core/atmos/fxdemo/dist/fx-demo.html` | full | `--assert` | pass | arc | ANGLE (Intel, Intel(R) Arc(TM) 140T GPU (8GB) (0x00007D51) D | 42 |
