# Stage 8, the all-builds rebuild: the ordered procedure (report A)

Written 2026-11-23, read-only, against the line `claude/integration-4` at `cf7e849a2` and the refs named below. Nothing was
built, run or changed. Every command and flag below was checked against the tool's code on the ref named; where a plan's
command does not match the code, the step says so.

**Sources reconciled**

| Short name | Where | What |
|---|---|---|
| STACK-INT | `git show freeze/vertical-stack-1123:INTEGRATION-AND-REMAINING-SURVEY.md` | Part I (what `--all` skips, settlements, caps, regions, core builds, Godot); Part II Phases 0-5 (lines 105-235) |
| STACK-KIT | `freeze/vertical-stack-1123:KIT-REBUILD-SURVEY.md` section 0 (lines 9-21) | producer kit order |
| STACK-BIO | `freeze/vertical-stack-1123:BIOME-REBUILD-SURVEY.md` section 0.1 | biome order |
| STACK-GTP | `freeze/vertical-stack-1123:GRAPHICS-TERRAIN-PROPOSAL.md` sections 11 (531-545), 12c (591-607), 12d (615-650) | the Stage 8 design |
| STACK-TODO | `freeze/vertical-stack-1123:TODO.md` lines 83-87 | the stack's Stage 8 ride-along entry |
| ABRP | `settlements/ALL-BUILDS-REBUILD-PLAN.md` (line) | continental-scope's 51-settlement audit; queues at lines 877-900 |
| TODO | `TODO.md` (line), "Ride along with the next all-builds rebuild", lines 76-463 | the parked items |
| XPACKS | `claude/xanadu-packs` (a8d7e7c18): `tools/textures/page_pack.py`, `settlements/xanadu/build.py`, its `TODO.md` lines 80-81, `settlements/xanadu/STACK-PLAN.md` | per-page packs, M1 classes |
| HR | `HANDOFF-REBUILD.md` lines 3-143 (line) | how the last all-builds rebuild ran, its numbers |
| PERF | `PERF-PLAN.md` (line), sections 3-6 | the plan written for this rebuild's verify |

**Other Stage-8 docs on the stack ref** (`git diff --name-only cf7e849a2...freeze/vertical-stack-1123 -- '*.md'`):
`BIOME-REBUILD-SURVEY.md`, `GRAPHICS-TERRAIN-PROPOSAL.md`, `HANDOFF-VERTICAL-STACK.md`, `INTEGRATION-AND-REMAINING-SURVEY.md`,
`KIT-REBUILD-SURVEY.md`, `STAGE-1-ROUTE-REPORT.md`, `STAGE-2-TERRAIN-REPORT.md`, `STAGE-3-4-REPORT.md`, `STAGE-5-REPORT.md`,
`STAGE-6-7-REPORT.md`, `VERTICAL-STACK-REPORT.md`, `TODO.md`, `core/world/PLAN-MICRO.md`, `PLAN-RELIEF.md`, the `README.md`s of
`core`, `core/water`, `core/world`, `godot`, `openworld/oidong-highrift`, `openworld/pinnacle`. Also relevant and not on the stack:
`settlements/xanadu/BUILD-PLAN.md` "Phase C" (lines 115-121) and `settlements/xanadu/STACK-PLAN.md` (on `claude/xanadu-packs`,
"Stage 8" section 9).

Commands are PowerShell (the owner's rule) with `python` (this machine's interpreter; the docs write `python3`). Set once per shell:

```powershell
$env:GODOT = 'C:\Users\travi\Downloads\Godot_v4.7.2-stable_win64_console.exe'
```

---

## 1. The conflicts and stale instructions found (read before the steps)

| # | Plan says | What is true | Where checked |
|---|---|---|---|
| C1 | STACK-INT Phase 1 bucket 1 (lines 122-128) and STACK-TODO 87: renumber the stack's `edit_517*.py` to `edit_519*.py` on top of main's edit-8 rasters. | **Already resolved the other way on the line.** The line carries the stack's `edit_517*.py` names (Erewhon's edit 7 kept `edit_517.py`); the Slabfields edit became `edit_519.py` (its header: "renumbered 9 ... already run: do not run it again"). The stack has not touched `tools/scale-model/` since its merge base `52f478695`. Drop this step. | `tools/scale-model/edit_519.py:1-3`; `git diff --name-only 52f478695..freeze/vertical-stack-1123` |
| C2 | ABRP line 18: edits `edit_520_republic_alps.py` and `edit_521_wave0_hygiene.py` "are already live in h.png - do NOT re-run them". | **False on the line.** The continental-scope merge (`3b6e9b285`) kept the line's `tools/scale-model/**`; edits 520_republic_alps, 521_wave0_hygiene, 522_ria_hydrology, 523_canals_and_settlements (continental-scope) and 520_crook, 521_farside (crook-ria, merge `cf7e849a2`), plus Shumar's 519_slabfields/520_amaro_gorge (merge `73464222b`) are **not** in `h.png`: the single scale-model re-run replays them, renumbered. `h.png` last changed in `3c1a918b7` (Voth). ABRP's audit was made on the continental-scope ref. | merge messages of `3b6e9b285`, `cf7e849a2`, `73464222b`; `git log -- tools/scale-model/model/data/h.png` |
| C3 | TODO.md lines 51-53: edits `5.1e22`/`5.1e23` "Done ... 2026-11-23". | Done on `freeze/continental-scope-1123`, not on the line (C2). ABRP Queue 1 names the script `edit_522_settlement_fit.py`; the freeze ref's scripts are `edit_522_ria_hydrology.py` and `edit_523_canals_and_settlements.py`. The re-run renumbers them anyway. | `git ls-tree freeze/continental-scope-1123 tools/scale-model/` |
| C4 | STACK-INT Phase 2.2, STACK-GTP 12c.1, STACK-TODO 84: set `"relief": {"micro": 2}` in **every** `openworld/*/data/region.json`, including the six whose relief is null. | **Wrong for the null regions.** `core/world/41-world-fields.js` (stack) turns the whole relief pipeline on for any truthy `relief` (`RELIEF=!!M.relief`, line 209) and calls `WRELIEF.init({seed:M.relief.seed})` (212): a `{micro:2}` with no seed, on a raster cut **without** `extract_region.py --relief` (which leaves the ledges and P6 detail in the raster: `extract_region.py` stack lines 522-530), draws the detail twice. Turning relief on for a region is a re-cut with `SITES.json` `"relief": 1` (cut_site.py adds `--relief`), an owner call (Q3). For `oidong-highrift` and `pinnacle` (relief v1 on the stack), add `"micro": 2` to their existing dict. | stack `core/world/41-world-fields.js:186-215`; stack `tools/scale-model/cut_site.py:102-103`, `extract_region.py:1525-1526` |
| C5 | Same plans: write `relief.micro: 2` into `region.json`. | **It does not survive a re-cut.** `extract_region.py --relief` rewrites `meta['relief'] = {'version': 1, 'phase': 6, ...}` with no `micro` (stack line 1526); `cut_site.py` re-runs it. Either the re-cut learns `micro` (from the `SITES.json` row) or `micro: 2` is written after the last cut (step 14). Same for `world_tiles: true`, read by `bake_streams.py` and by `cut_site.py`'s own stream bake. | stack `extract_region.py:1525`, `bake_streams.py:428` |
| C6 | Line `SITES.json`: no region has `relief`; the stack's `SITES.json` has `relief: 1, smooth: true` on `pinnacle`, `oidong-highrift`, **`xanadu-oidong-highrift`**. | The stack's `xanadu-oidong-highrift/data/region.json` has **no** relief and no streams, so a re-cut on the stack's tools turns relief on for it (a look change). The line's `SITES.json` also adds `lizardmen-west`/`lizardmen-east` (not cut yet, no folder). Both sides edited `SITES.json` since the merge base: a conflict to resolve by row. | `openworld/SITES.json` both refs (scratchpad `stack-SITES.json`) |
| C7 | Order of the merges before Stage 8 is not stated by any plan. | **The stack must merge before the scale-model re-run's region cuts.** The line's `extract_region.py` has no `--relief`/`--smooth` and there is no `core/world/bake_streams.py` on the line: a re-cut made on the line drops the relief and smoothing the stack's `oidong-highrift` and `pinnacle` data carry (their `data/*.png` and `region.json` are in the stack's diff), and binary conflicts follow. Re-cut on top of the stack. | `grep relief tools/scale-model/extract_region.py` (none); stack diff list |
| C8 | STACK-INT Phase 3 step 3 (lines 178-182): `bake_sites.py "$r" --resources` for seven regions. | `--resources` writes **only** `plan/resources.json` and returns (stack `bake_sites.py:177-187`); `plan/sites.json` needs a second run without it. `openworld/isle-demo` has no `plan/sites.json` (only `resources.json`): leave it to `--resources`. | stack `core/world/bake_sites.py:173-200`; `ls openworld/*/plan` |
| C9 | STACK-INT Phase 3 step 3: `bake_streams.py "$r"` for every region. | `bake_streams.py` exits with an error on a region without relief ("its land keeps no streams", stack line 426-427): only relief regions. The world-tile trace needs `--world-tiles` or `relief.world_tiles: true` (line 428), which the loop omits; STACK-TODO 84 asks for "the world-tile stream bake". | stack `core/world/bake_streams.py:420-447` |
| C10 | STACK-INT Phase 3 step 6 (line 204) and STACK-GTP 12c.1: `python3 core/world/bake_horizon.py "$d"` / `<godot_export_dir>`. | **The flag does not exist.** `bake_horizon.py` takes `--region` (default `openworld/oidong-highrift`) and `--case` (default `godot/data/world-oidong-highrift`), no positional; the loop as written exits with an argparse error. It also only makes sense for streamed cases with an `index.json`. | stack `core/world/bake_horizon.py:150-157` |
| C11 | STACK-INT Phase 3 step 7: `python3 tools/dep_graph.py` "refresh dependency graph". | Without `--write` it only checks; `DEPS.json` is written by `--write`. | `tools/dep_graph.py:33-39` |
| C12 | STACK-INT Phase 3 step 6: `python3 godot/tools/export_spike.py` re-exports "29 godot/data/* datasets" with `packFormat: 2`. | `export_spike.py` has **7** cases (hyperjungle, rift, sedesert, girder, iziz, yuni, qiblai) and no pack-format option; it was not changed on the stack. The `world-*` cases come from `tools/harness.py export ... --box`, the verifies' `--export` (verge, dhelv), `openworld/*/tools/godot_case.py`, `node .../export-sim.js`. `packFormat: 2` is a `pack.py` option on the stack (`--format 2`, `--normal-enc`), not an export option. No script re-exports everything (Q9). | `godot/tools/export_spike.py:44-237`; `godot/README.md:255-285`; stack `tools/textures/pack.py` `--format`, `--normal-enc` |
| C13 | STACK-INT Phase 2.1 and STACK-KIT 1.x: split `settlements/screamers` "via `split.py`". | `settlements/screamers/split.py` is the one-shot fragment cutter (".origin.html into src/"), not a texture-sidecar tool. A sidecar split is a code change in `build.py` (port Scyvoi's `SIDE` / `matlib_pack.write_sidecar` pattern, `kits/scyvoi/build.py:92-116,191`). Same for `desert-nomads`, `ash-nomads`, `beast-riders`, `voth`. | `settlements/screamers/split.py:1-14` |
| C14 | STACK-KIT section 0 (lines 9-21): build 14 producer kits/bundles in order before `--all`. | **Mostly unneeded.** `XAK`, `IZV`, `ISK`, `apoc_bundle`, `tungang_bundle`, `transit_bundle`, `KratorVehicles`, etc. are generated **inside the consumer's build** from the kit's sources (read in place), not read from the kit's `dist/`. The only build-to-build `dist/` reads found: `kits/ancients-interiors` <- `kits/interiors/dist/interiors-core.js` (`tools/build.py --all` already runs `kits/interiors` first: `tools/build.py:127`, `test_all.py:83`), `settlements/longsong` <- `core/charactermodels/dist/pieces/` (step 18), and the Span preview <- `settlements/span/dist/span.html` through `freeze_span.py` (step 21). Building them first costs a duplicate build each. STACK-BIO 0.1.2's "kin kits before composite hosts" is the same: biomes read each other's `src/` in place. | grep of every `build*.py` for another build's `dist/` |
| C15 | STACK-INT Part I section 1: "14 targets" skipped by `--all` (lists 13 + gallery). | It misses `kits/post-apoc/sockets-example/build.py` (its page `sockets-example.html` is in `PORT-BASELINE.json`: `port_baseline.py:14`), `core/simulation/ride/lab/build.py` (new: `dist/ride-lab.html`) and `gallery/krator-globe/build.py`. Full list in step 21. | `git ls-files` of every `build*.py` |
| C16 | STACK-INT Part I 2.5 (line 72): 12 settlements are "`PLAN.md`-only" (incl. blakhed, flashing-eye, ledge, nulab, strongwall) and 29 are built. | Stale: the line has **58** settlements with a `build.py` (blakhed, flashing-eye, ledge, nulab, strongwall, gihon, marches, thalaba, viridian ... among them); plan-only now: almua, ardent, battered-port, beacon, dalab-camp, devisers-camp, iridescent, iron-millstream, qoold-lheek, shim, strongbow, theodiga, tubes, xanadu-lake (until lake-towns A1), zeydanin. `--all` today = 176 builds + 230 station commands. | `ls settlements/*/build.py`; `test_all.builds()`, `extra_builds()` |
| C17 | STACK-INT Phase 4.4 and STACK-GTP 12c.3: `port_baseline.py --write --prune` for verified pages. | `--write` rewrites **every** entry and refuses while any page is an LFS pointer or `git status` shows other changes (`port_baseline.py:23-26`); `--prune` drops pages not built here. In a skip-smudge worktree pages not rebuilt stay pointers. The verified-only path is `--update <pages>`; `--write --prune` only once every page is real and the tree is clean (HR line 97-98: 35 retired rows to prune). | `tools/port_baseline.py:1-27` |
| C18 | TODO.md lines 386-406 list "the fauna runtime", "a `dalab` culture pack", "water breakup on by default" as still owed. | Done: TODO line 90-92 says the second integration pass took them; `core/sockets/80-cultures.js:136` has the `dalab` culture; `core/water/ext/56-core-water-breakup.js:62` sets `W.BREAKUP_AUTO=true`. Delete the three entries. Also gone: `rec.scale || 1` (`core/furnish/50-core-furnish.js`) and `d.y||0` (`settlements/yuni/src/76-doors.js`), still listed at TODO 374-378 and in STACK-KIT 3.1 / STACK-INT 2.4. | greps on the line |
| C19 | STACK-INT Phase 1 (whole) "merge origin/main". | That merge happened (the line contains `74d9815b`); what is left is merging the stack itself into the line. Real overlaps since the merge base `52f478695` (both sides edited): `tools/test_all.py` (line +186), `tools/harness.py` (+221), `tools/textures/pack.py` (+74; stack +247), `godot/tools/sync_core.py`, `openworld/SITES.json`, `tools/scale-model/cut_site.py`, `extract_region.py`, `TODO.md`, `PORT-BASELINE.json`, `build-inputs.json`s, region data of `oidong-highrift`/`pinnacle`/`xanadu-oidong-highrift`, `settlements/longsong/*`. `claude/lake-towns-a1` edits `cut_site.py`/`extract_region.py` too (`--origin`). | `git diff --stat 52f478695 cf7e849a2 -- <files>` |
| C20 | STACK-INT 2.1 / STACK-KIT 4.5: `krator-fauna.js` 28.25 of 30 MB; `qiblai.html` 13.46 MB. | Now `kits/fauna/dist/krator-fauna.js` is 31.56 MB of a cap raised to 34 MB (2026-11-22, coyote birds); `qiblai.html` is under 80 % (not in the scan). New near-cap page the plans miss: `settlements/loj-twenny/dist/loj-twenny.html` 14.16 MB (88 %). | section 4 below |
| C21 | XPACKS: "`tools/build.py --page-packs`" (the brief's wording). | The flag is `settlements/xanadu/build.py --page-packs` (and `pack.py --page`), passed through `tools/build.py <build> --page-packs`; Stage 8 turns it on by making it the default in `settlements/xanadu/build.py` (its `'--page-packs' in sys.argv` test), after re-recording the lists on a GPU lane. Only 4 pages have lists today (azure-dream, flashing-eye, kirstabal, thalaba). | XPACKS `settlements/xanadu/build.py` diff, `page_pack.py:1-35`, its `TODO.md:80` |
| C22 | XPACKS `tools/textures/mclass.py` docstring: "Stage 8's `tools/textures/pack.py` reads" the M1 classes. | No `pack.py` on any ref reads `"class"` yet (the stack's has `packFormat`/`normalEncoding` per build, not per class). Wiring `mclass.settings(fc)` into `pack.py` is a Stage 8 code change (step 10). | stack `tools/textures/pack.py:234,398`; XPACKS `mclass.py:1-25` |
| C23 | STACK-GTP 12d (B1-B5, K1-K5) and STACK-INT Phase 2.2 present the shared-core upgrades as steps of the rebuild. | They are **not written**: e.g. `foliageHook` backlight gate, `KMAT` uniform keys, `boxBevel`, `20-core-roomlight-host.js`, `library_cutout.gdshader` exist on no ref. They are development sessions with their own tests and looks (PERF section 2: "look changes go to the owner"), not rebuild steps (Q1). `core/interiors/10-core-roomlight.js` itself does exist (stack; fixed on `roomlight-fixes`). | greps on the stack ref |
| C24 | STACK-INT Part I section 3 lists 7 regions + 4 aux; Phase 3 loops seven. | Also `openworld/north-basin` has `data/region.json` (no build); `SITES.json` names `lizardmen-west/east` (not cut). Settlement-local cuts (`region/` in azure-dream, flashing-eye, longsong, pinnacle-rock, viridian) and town bakes (`openworld/towns/pher`, `voth`: `core/world/bake_towns.py`) are not in any plan's re-bake list. | `ls openworld`, `ls settlements/*/region`, `core/world/bake_towns.py:1-15` |
| C25 | ABRP (the whole plan, and TODO line 93 "Execute the All-51-Settlements Rebuild ... port remaining bespoke layouts onto KCITY, re-anchor stale cuts, frame turns, place the systemic buildings"). | A content programme (layouts, pins, buildings), not a rebuild step. STACK-PLAN section 1 ("each thing built once": layouts before Stage 8, looks after) puts its layout parts **before** Stage 8 or after it, never inside (Q2). Its Queue 1 pin moves/surgeries belong to the scale-model re-run; its Queue 2 re-anchors (Erewhon 841,1517; Pinnacle Rock 1007,686; Longsong 1228.88,1621.23) are re-cuts that must precede step 14. | ABRP 877-900; XPACKS `settlements/xanadu/STACK-PLAN.md` section 1 |
| C26 | KIT-REBUILD and TODO 119-122: move `kits/xanadu/extra/88*` into `src/`. | `extra/` now holds **two files with prefix `88h`** (`88h-xa-gihon.js`, `88h-xa-mine-works.js`) plus `88f`, `88g`: rename one before the move, since a page's order is by file name. | `ls kits/xanadu/extra` |
| C27 | STACK-INT 4.3: `route_harness.py --route openworld/ancientsvalley/interiors`; STACK-KIT 4.3: `--track interiors`. | The flag is `--track`; the interiors track is named `interior`. | stack `tools/route_harness.py:33-56,520` |

---

## 2. Preconditions: the merges Stage 8 assumes, in this order

Not Stage 8's own work (each is its session's), but the order matters (C7):

| # | Merge | Why here | Expected conflicts |
|---|---|---|---|
| P1 | `freeze/vertical-stack-1123` (d636c78c4), **with** its Phase 0 fix: `core/world/landshade.py` takes `--osm-json <file>` instead of naming `host/WorldMenagerie/...` (lines 20 and 194; still unfixed on the freeze ref) so `python tools/check_insulation.py` passes | brings relief P0-P15, WMICRO v2, KGROUND guard, `bake_streams.py`, `bake_horizon.py`, `check_godot_exports.py`, `route_harness.py`, `m1_slice.py`, `pack.py --format/--normal-enc`, Godot stages 3-7 | C19's list. `PORT-BASELINE.json` and ratchet baselines: three-way from refs, rewritten at the rebuild (as the last three merges did); generated pages: either side, rebuilt in step 19 |
| P2 | `origin/claude/roomlight-fixes` (02b9afc2e) | = the stack's line without its three doc commits, plus the room-light fixes (`core/interiors/10-core-roomlight.js` -> blob 98e581ec) and a Longsong baseline row | none beyond P1's (same history) |
| P3 | `origin/claude/citadel-room-graph` (4067d5d3c) | XS2: the citadel's room graph; carries the same fixed `10-core-roomlight.js` blob, so after P2 it does not conflict | `settlements/xanadu/STACK-PLAN.md` |
| P4 | `claude/citadel-furnishing-cb5e01` (f348edf53) | contains P3; lamps for the citadel's dark rooms; rebuilt `erewhon.html`, `xanadu.html`, `xanadu-scrap.html` (stale on the line: take either, step 19 rebuilds) | pages, `build-inputs.json` |
| P5 | `claude/xanadu-packs` (a8d7e7c18) | data and tools only (classes, `page_pack.py`, `mclass.py`, `pack.py --page`, Xanadu S4 set) | `tools/textures/pack.py` (stack's +247 and this +20: union), `TODO.md` |
| P6 | `claude/lake-towns-a1` (e15d66e4f) | `settlements/xanadu-lake` (a new build), `tools/fit_lake_town.py`, `cut_site.py`/`extract_region.py` `--origin` | `extract_region.py`'s argument loop and `cut_site.py`'s command (stack's `--relief`/`--smooth` and this `--origin`: union) |
| P7 | the single scale-model re-run (`claude/scale-rerun-1123`, empty at `cf7e849a2` today) | replays, renumbered from the freeze refs: 519_slabfields/520_amaro_gorge (Shumar), 520_republic_alps, 521_wave0_hygiene, 522_ria_hydrology, 523_canals_and_settlements (+ `canals.json`, trade v5), 520_crook, 521_farside; `geology.py` (-> `kits/resources/data/geology.json`); `tools/scale-model/model/build.py`; **after P1**, so its region re-cuts carry relief/smoothing and run `bake_streams.py` | binaries only if run before P1 (C7) |

Stage 8 starts from the tip after P1-P7, on a fresh worktree (memory: "Skip-smudge worktree").

---

## 3. The procedure

Each step: **command**, then *source* and *agreement*. "Line" = `claude/integration-4` + P1-P7.

### Phase A: the checkout (no page changes)

**1. Worktree and LFS.**
```powershell
$env:GIT_LFS_SKIP_SMUDGE = '1'; git worktree add ..\krator-stage8 <integrated tip>; Remove-Item Env:GIT_LFS_SKIP_SMUDGE
cd ..\krator-stage8
git lfs pull --include="core/materials/library/**,core/materials/patterns/**"
foreach ($b in (python -c "import sys; sys.path.insert(0,'tools'); import buildlib; print('\n'.join(buildlib.build_dirs()))")) { python tools/lfs_needs.py $b --pull --no-list }
git lfs pull --include="settlements/longsong/dist/kchar/**,kits/interiors/dist/**,kits/motor-vehicles/dist/**,settlements/isle-demo/dist/**"
```
*Source:* CLAUDE.md "In a fresh worktree run `python3 tools/lfs_needs.py <build> --pull` first"; `tools/lfs_needs.py:1-22`. *Agreement:* STACK-INT Phase 3 says only "`git lfs pull`". `--no-list` because the gen/ builds' `--list-sources` fails until they have built once (step 19; `settlements/pher/build.py:100-102`); the manifests still name their inputs. Pull `longsong/dist/kchar/*` explicitly: when `core/charactermodels/dist/pieces/` is absent, Longsong keeps the committed sidecars **without reading them** (`settlements/longsong/build.py:209-222`), so a pointer would ship silently.

**2. Character pieces.** Copy `core/charactermodels/pieces/` (gitignored, about 200 MB: `godot/tools/sync_core.py:33-35`) from the main checkout (`..\krator-master\core\charactermodels\pieces`, which has `mpfb_female`, `mpfb_giant`, `mpfb_male`), or run steps 18 and 23 there. *Source:* `core/charactermodels/.gitignore`, its `README.md` lines 27-61. *Agreement:* not in any plan; the facts ("Longsong needs the kchar sidecars built first").

**3. Godot import, once.** `& $env:GODOT --headless --path godot --import` *Source:* CLAUDE.md; STACK-INT Phase 4.2. *Agree.*

**4. Record what is red before any edit.** `python tools/test_all.py --no-build` (save the log). Expected red today: `dep_graph` (`--list-sources` fails for the gen/ builds: azure-dream, blakhed, flashing-eye, kirstabal, lightwall, nulab, pher; TODO 345 adds qiblai, thalaba), `check_stale` (Longsong, azure-dream, lightwall: TODO 339-341), `test_bridges.py`, `openworld/outposts/tests/test-outposts.js` (TODO 345-347), `core/audio/test-audio.js` (TODO 31-34), `scale-model tests/test_smodel.py` garnet/vitreous (TODO 38-41) unless P7 settled it. *Source:* `tools/test_all.py:9`. *Agreement:* STACK-INT runs it only at the end (Phase 4.1).

### Phase B: source changes, all before the first build (each moves pages; land them together so every page builds once)

**5. Pre-build fixes that block builds.**
- `settlements/lightwall`: "BUILD RULES FAILED: `kits/qiblai/src/89q5s-qb-shells.js` is generative with no builder": list it in `settlements/xanadu/build.py` `DETERMINISTIC` (line 197) or give it a builder (TODO 340-341).
- `settlements/azure-dream`: "external fragment 20-core-walk.js clashes with a fragment already in the order" (TODO 339).
- `kits/xanadu/extra/`: rename one of the two `88h-*` files (C26) before step 7 moves them.
- `tools/tests/test_bridges.py`, `openworld/outposts/tests/test-outposts.js` (eight places moved since the cut): fix after P7 re-pins.
*Agreement:* in TODO only; no stack plan names them.

**6. Page-cap splits (code), before anything adds bytes.** Port Scyvoi's sidecar pattern (`kits/scyvoi/build.py:92-116,191`: `SIDE`, `matlib_pack.write_sidecar(..., '<build>.tex.js')`) into `kits/desert-nomads/build.py` (98 % of 16.5 MB), `kits/ash-nomads/build.py` (96 % of 19 MB), `kits/beast-riders/build.py` (82 %); Voth's `voth-city.html` (94 % of 20 MB) through its own build; then lower their raised `BUDGETS.json` caps back to 16 MB with a why. `kits/fauna` `krator-fauna.js` (93 % of 34 MB) splits its texture chunks as `fauna.html` does (`kits/fauna/build.py:123-147`). *Source:* STACK-INT Phase 2.1, STACK-KIT 1.2, 1.3, 4.4, 4.5. *Agreement:* both plans want it; C13 (screamers' `split.py` is not the tool) and C20 (fauna numbers moved).

**7. The ride-along source items (TODO lines 76-463, as they stand after C18).** One commit each, node test with it:
- core/world: fold `41t-world-town-water.js` into `41` (`node core/world/test-town-water.js` unchanged; TODO 223-227); `overlay` as a list, drop `openworld/iziz-cluster/src/47-world-kits.js`'s shim (248-252); the `xanadu` style, drop `openworld/xanadu-oidong-highrift/src/43-world-xoh.js`'s `WORLD.ground` wrapper (284-288; moves `WORLD.H`, so step 14 re-bakes); optionally the tent camp in 48s (239-243).
- core/hamlet: fold `core/hamlet/xanadu/23-hamlet-xanadu-row.js` into `20-hamlet-cultures.js` and `camp/26-hamlet-camp.js` into `30-hamlet-village.js`, pass `camp` through `core/world/48s-world-sites.js`, drop `oidong-highrift`'s `xanadu-camp` row and Kirstabal's `fishingRow` (140-152, 228-238; Q6 on the shrine and mine head); "arrow shafts" in `10-hamlet-wood.js` (43-44).
- core/tags `52-core-tags-vocab.js`: cultures `qiblai`, `kimr`, `coyote`, `glazier` (delete `core/tags/glazier/`, drop it from `kits/tungang/build.py`) (123-125, 303-325). The `vessel`/`vehicle` classes are in already (lines 74-121 of the vocab); the rebuild clears the stale pages (126-136).
- core/terrain: rename `kgTri`'s `v1 v2 v3`/`r1 r2 r3` in `43-core-ground.js`, drop the `#undef` guard in `host/39i-core-cavern-rock.js` (96-99); `K.EYE`/`kEye()` (186-187); KSTRATA `obsidian` and Opal Valley's `opal-rhyolite`/`opal-firetuff` (137-139, 319-321); KKARST sink ids (193-194).
- core/shader KHOOK clone guard (182-185); `KSHADOW.units` from the Throne's `samplersOf` (368-372); `WATER.drawFlow` cache key with its colours (326-330); ice `levelAt` (363-366); core/atmos mist colour (353-358); `BIO.alphaTex` `willReadFrequently` (188-189); `BIO.libSwap` fringe fill (190-192, = STACK-GTP B4's second half); the in-page audits on `KDRAWN.h` (198-200, = B5's first half); `BIO.attachAudit` per segment (307).
- core/host walker and pick underground (203-222): every page that takes `core/host/90-host-camera.js` grows about 7 KB.
- kits/xanadu: `extra/88c..88h` into `src/`, `69dz`'s item into `kits/interiors/sets/xanadu.js`, `87k1-xa-lake-rooms.js` into `kits/interiors/sets/xanadu-lake.js` (153-155), drop `"external"` from `settlements/pher/kit.json` (119-122).
- the ISK error loop (`settlements/isle-demo/bundles.py:101,173`, re-entry guard in `core/engine/10-core.js:11`; 195-197); `kits/fauna/krator-fauna-xeno.js:26` `o.stock || 1` (348-350); Köppen `Cwb`/`Dsc` (360-362); `check_source`'s 19 kit keys (177-178) and core/audio's 147 (24-30, the audio session's unless swept here).
- `core/charactermodels/data/peoples.json`: `cflit_qbon`, `yonni`, `hush_kin`; `node core/charactermodels/test-rig.js` (95).
- multi-kit: `core/kits/10-core-kits.js`, `core/city/42-city-multikit.js`, `core/city/53-city-host-multikit.js`, `core/region/47s-region-styles.js` into the settlement `CITY_JS`/`CITY_DATA_JS`/`REGION_JS` lists (94; which settlements: Q7). core/city is the city-layout work's (CLAUDE.md "keep out of its files, or ask").
- the catalog hem rule and decals are on the line already (`core/catalog/test-hangings.js`, `FURN_HEM`); "not built yet" (100-118): the rebuild builds them; read the fingerprints (step 27).
*Agreement:* STACK-INT Phase 2.2 "Parked TODO.md ride-alongs" names a subset; STACK-BIO 0.1.1 the terrain/water/shadow subset. They agree on the items both name; C18's items are already done.

**8. The checks 22-31 switch, part 1 (before the build).** TODO 158-179: rename the 99 view names with an apostrophe and 40 with a colon (`python tools/check_views.py --list`); add `buildlib.through_tools_build(__file__)` to every `build.py` (template `tools/new_build/`). The `"*"` switches themselves go in step 32, after the pages exist. *Agreement:* TODO only; STACK-INT 4.3 mentions "checks 22-31" for `verify_ratchet.json`.

**9. Graphics-stack code (Q1).** If the owner keeps STACK-GTP 12d in Stage 8: B1-B5 (`core/biome`, `godot/shaders/foliage.gdshader`), K1 (`KMAT` uniforms, `69a-world-uv.js`), K2 (`core/engine/30-geo.js` base AO, `boxBevel`, `KROOMLIGHT` in `core/engine/91i-interiors.js` and `kits/interiors/src/49-exports.js`, `50-shell.js`), K3 (catalog 8-bit, `KF.batch` foot AO), K4 (`core/interiors/20-core-roomlight-host.js` replacing `nlvTex` in girder, yuni, locus, mavs-refuge), K5 (`godot/shaders/library_cutout.gdshader`), TODO 289-302's program keys. Each with its node test and before/after shots. *Source:* STACK-GTP 12d (615-650), STACK-TODO 86. *Agreement:* conflict C23 with PERF section 2.2-2.3 and STACK-PLAN's "looks after Stage 8".

**10. The packer reads the M1 classes (code).** Wire `tools/textures/mclass.py` `settings(fc)` into `tools/textures/pack.py`'s `process()` (web: `xy8` normals for `class: glazed`, `xy6` for the rest; Godot packs per STACK-PLAN answer 4); glaze the five pattern sheets (`xMosC`, `xMosD`, `xBandC`, `xGiltC`, `xBandR`: roughness under 0.35 in both `materials.json`, class them `glazed`, drop them from `core/materials/classes/m1-classes.json` "pending"; XPACKS `TODO.md:81`). `python tools/textures/mclass.py --prove` must still pass for everything else. *Agreement:* C22. STACK-GTP 12c.2 states the web rule as `specular >= 0.45, roughness < 0.35`; the owner's later answer is "glazed families only" (STACK-PLAN section 0 item 4), which the classes encode.

**11. Wire the delivered texture sets.** TODO 78-88: the 2026-11-12 Codex sets (63), the 11-16/11-17 batches, the 11-23 batch's 13: each build's `materials.json` slot, judged in the demo kit first (memory: "demo before commit"). *Agreement:* TODO only.

**12. Node tests for every touched module.** At least `node core/world/test-town-water.js`, `core/world/test-*.js`, `core/hamlet/test-hamlet.js`, `test-hamlet-xanadu-row.js`, `test-hamlet-camp.js`, `core/tags/test-tags.js`, `core/terrain/test-ground.js`, `core/water/test-breakup.js`, `test-gaps.js`, `core/furnish/test-furnish.js`, `core/catalog/test-hangings.js`, `core/interiors/test-roomlight.js`, `core/materials/classes/test-class.js`, `test-page-pack.js`, `core/charactermodels/test-rig.js`, `core/city/test-city.js`, `node core/rand/test-rand.js`. *Source:* CLAUDE.md "Node tests: tools/ktest.js".

**13. Reach, to know what will move.** `python tools/reach.py <every file changed in 5-11> --commands` (`tools/reach.py:1-12`). Anything it names outside `--all` goes into step 21.

### Phase C: data re-bakes on the re-run model (after P7, before the pages)

**14. Regions.** For the relief regions (`oidong-highrift`, `pinnacle`; `xanadu-oidong-highrift` if the owner keeps the stack's `SITES.json` relief there, C6; others only by Q3):
```powershell
# micro 2 (and world tiles) into the relief dict, after the LAST cut (C5), e.g.:
python -c "import json,io;p='openworld/oidong-highrift/data/region.json';m=json.load(io.open(p,encoding='utf-8'));m['relief'].update(micro=2,world_tiles=True);io.open(p,'w',encoding='utf-8',newline='\n').write(json.dumps(m,ensure_ascii=False,indent=1))"
foreach ($r in 'oidong-highrift','pinnacle') {
  python core/world/bake_streams.py $r --world-tiles
  python core/world/bake_sites.py $r
  python core/world/bake_sites.py $r --resources
  python core/world/bake_streams.py $r --check; python core/world/bake_sites.py $r --check
}
foreach ($r in 'iziz-cluster','xanadu-lake-shore','xanadu-north-shore','xanadu-oidong-highrift') { python core/world/bake_sites.py $r; python core/world/bake_sites.py $r --resources }
python core/world/bake_sites.py isle-demo --resources
```
Each bake prints its counts; the checks must read `same`/`fresh`. *Source:* STACK-INT Phase 3.3, STACK-GTP 12c.1, HANDOFF-VERTICAL-STACK steps 3-4. *Agreement:* corrected per C4, C5, C8, C9. Record tarns, junctions and lines against v1 (the bake prints them; HANDOFF-VERTICAL-STACK step 3).

**15. Towns and lake towns on the new ground.** `python core/world/bake_towns.py pher`, `python core/world/bake_towns.py voth` (then `--check`; `core/world/bake_towns.py:1-15`), and `python tools/fit_lake_town.py` (P6; STACK-PLAN section 1: "the lake towns' grounds are closed-form fits: `tools/fit_lake_town.py` re-runs"). *Agreement:* in no Stage 8 plan (C24).

**16. Settlement-local region cuts.** `settlements/{azure-dream,flashing-eye,longsong,pinnacle-rock,viridian}/region/` were cut from the model; if P7 did not re-cut them, re-cut on the new model (and ABRP Queue 2's re-anchors for Longsong and Pinnacle Rock, if the owner takes them now: Q2). Their builds decode `region/data` into `gen/` (`settlements/azure-dream/build.py:10`). The gen/ grounds of thalaba, strongwall, pher (far grid), blakhed, nulab, gihon and the Lizardmen towns read `tools/scale-model/model/data/h.png` at build time: nothing to do but build after P7. *Agreement:* not in any plan (C24).

**17. Texture packs.** For every build whose `materials.json` step 10 or 11 changed (and the classes' builds: `kits/xanadu`, `settlements/xanadu`, `kits/qiblai`, `kits/tungang`, `kits/catalog`, `kits/ancient-transit`, `biomes/oidong`, `settlements/{dalab,flashing-eye,kirstabal,thalaba}`):
```powershell
python tools/textures/pack.py <build>; python tools/textures/pack.py <build> --check
python tools/textures/mclass.py --measure
python tools/textures/m1_class_gates.py
python tools/textures/m1_slice.py --web      # Gates 1 and 3 (stack)
python godot/tools/pack_ground_layers.py      # Godot S4 layers (stack; takes no arguments, reads no Xanadu set yet)
```
*Source:* STACK-INT Phase 3.1, XPACKS `TODO.md:81`. *Agreement:* agree; STACK-INT names only `m1_slice.py --web`.

**18. The kit manifest, then the character labs.**
```powershell
python tools/kit_pack.py --manifest; python tools/kit_pack.py --check-manifest
python tools/build.py core/charactermodels        # writes dist/pieces/*.txt (needs step 2); else --pages-only
```
`kits/kits-manifest.json` is copied into `godot/data/kits/` by `sync_core.py` (`godot/tools/sync_core.py:32`), so after any kit change and before step 23. *Agreement:* `kit_pack` is in no plan; `core/charactermodels` is in STACK-INT's skipped list (C14/C15 order: before Longsong).

### Phase D: the build

**19. Every build and station.** `python tools/build.py --all -j 2`
- 406 commands on the line today (176 builds + 230 stations; + `settlements/xanadu-lake` after P6), `kits/interiors` first, one worker per build folder (`tools/build.py:123-154`). It writes every `gen/`, `build-inputs.json`, page cap warnings and fails, fragment-needs fails.
- `-j 2` and not STACK-INT's `-j 4`: the machine is short on memory (a dying renderer can be V8's 4 GB limit; memory "Renderer OOM").
- Failures print their last 15 lines; rerun one with `python tools/build.py <build> [--station <s>]`.
*Source:* STACK-INT Phase 3.4; HR 79-86. *Agreement:* agree, except C14 (no separate producer pass).

**20. Xanadu per-page packs on (two-pass).** After step 19's Xanadu-page builds exist and step 17's packs are re-packed:
```powershell
$env:KRATOR_GL = 'gpu'
foreach ($p in <each page built on Xanadu's page>) { python tools/harness.py lock -- python tools/textures/page_pack.py record $p --queries "?interiors=1" }
# make --page-packs the default in settlements/xanadu/build.py (its "'--page-packs' in sys.argv" test), then rebuild:
foreach ($b in 'settlements/xanadu','kits/qiblai','settlements/qiblai','settlements/pher','settlements/kirstabal','settlements/thalaba','settlements/lightwall','settlements/azure-dream','settlements/flashing-eye','settlements/viridian','settlements/strongwall','settlements/gihon','settlements/blakhed','settlements/nulab','settlements/marches','settlements/xanadu-works','settlements/xanadu-lake') { python tools/build.py $b }
```
Sidecars become `<page>.tex.<key>.js`; the old shared `xanadu.tex.xanadu*.js` in each `dist/` are written with `prune=False` and must be deleted by hand where no page reads them. *Source:* XPACKS `TODO.md:80`, `page_pack.py:1-35`. *Agreement:* C21. The page list: the builds that hand over to `settlements/xanadu/build.py --kit` (grep) plus Xanadu's own targets.

**21. Every target `--all` skips.**
```powershell
python biomes/swhighlands/stations/pillars/preview/freeze_span.py settlements/span/dist/span.html
python tools/build.py biomes/swhighlands --station pillars --preview span
python tools/build.py kits/post-apoc/sockets-example
python tools/build.py core/materials/demo
python tools/build.py core/atmos/demo
python tools/build.py core/atmos/fxdemo
python tools/build.py core/cavelight/demo
python tools/build.py core/host/example
python tools/build.py core/host/underground
python tools/build.py core/simulation/example
python tools/build.py core/simulation/ride/lab
python tools/build.py openworld/network-proposal/testbed
# P7's, unless the re-run already did it on the final model:
python tools/build.py tools/scale-model/model
# owner-gated (step 34): gallery/build_gallery.py, build_ancients.py, build_throne.py, krator-system/build.py, krator-globe/build.py
```
`core/charactermodels` was step 18. *Source:* STACK-INT Part I section 1 and Phase 3.5; HR 105. *Agreement:* C15 adds `sockets-example`, `ride/lab`, `krator-globe`; `freeze_span.py` re-run is STACK-INT's note ("re-run first if span moves"), and Span moves in this rebuild.

**22. Stations not in `extra_builds()`.** None found beyond the preview: `extra_builds()` lists every `biomes/*/stations/*` folder with a `station.json` or its own fragments, minus `common` and `baseOnly` (`tools/test_all.py:104-131`). Throne stations and every station kit are in it. Multi-target builds (`kits/ancients`, `settlements/xanadu`, `settlements/iziz`) build every target with no `--target` (`kits/ancients/build.py:821-836`, `settlements/xanadu/build.py:500-503`, `settlements/iziz/build.py:628-631`). `settlements/iziz/build.py --kit ../../kits/pylon` and `--kit ../../kits/talia` are run by those kits' own `build.py` (in `--all`).

### Phase E: Godot and generated indexes

**23. Godot twins and data.**
```powershell
python godot/tools/sync_core.py; python godot/tools/sync_core.py --check
python godot/tools/export_spike.py                                    # 7 cases, about 10 min under software GL (godot/README.md:258)
python tools/harness.py export biomes/sedesert/dist/sedesert.html --out godot/data/world-sedesert --box 80,490,380,790
python tools/harness.py export settlements/iziz/dist/iziz.html --out godot/data/world-iziz --box=-120,292,120,532
python tools/harness.py export settlements/yuni/yuni.html --out godot/data/world-yuni --box 140,-80,340,90 --profile registry,fixtures,interiors
python tools/harness.py export settlements/isle-demo/dist/isle-city.html --query "?town=Kautoa&simAt=362" --out godot/data/world-isle-kautoa --box=320,780,820,1220
cd settlements/verge; python verify.py dist/verge.html --export ../../godot/data/verge; cd ../..
cd settlements/dhelv; python verify.py dist/dhelv.html --export ../../godot/data/dhelv; cd ../..
node settlements/isle-demo/tools/export-sim.js
python tools/harness.py lock -- python openworld/oidong-highrift/tools/godot_case.py
node openworld/oidong-highrift/tools/export-sim.js
python tools/harness.py lock -- python openworld/pinnacle/tools/godot_case.py       # stack: writes godot/data/world-pinnacle
python core/world/bake_horizon.py --region openworld/oidong-highrift --case godot/data/world-oidong-highrift
python core/world/bake_horizon.py --region openworld/pinnacle --case godot/data/world-pinnacle
python tools/check_godot_exports.py
python tools/export_report.py --compare godot/data/export-report.json --tolerance 10
```
The other cases (`world-eternian`, `world-lod`, `world-longsong`, `world-nhighlands`, `world-pylon`, `world-talia`, `world-sedesert-falls`, `world-isle-valapo`, `strongbow`, `sky`, `characters`, `kits`) have no documented command in `godot/README.md` (Q9); `characters` and `kits` come from `sync_core.py`. *Source:* STACK-INT Phase 3.6, `godot/README.md:255-285`. *Agreement:* C10, C12 (the plans' commands do not run as written). Pack format 2 for Godot is a `pack.py --format 2 --normal-enc oct8` decision per pack (Q4).

**24. Dependency graph.** `python tools/dep_graph.py --write` (after step 19: the gen/ folders now exist, so `--list-sources` works for pher, kirstabal, blakhed, flashing-eye, lightwall, nulab, azure-dream). *Source:* CLAUDE.md. *Agreement:* C11. The gen/ files are never committed (`settlements/<b>/.gitignore: gen/`); each build writes them in `write_gen()` except under `--list-sources` (`settlements/pher/build.py:87-102`, and the same pattern in the other 18 gen builds). So their order is: a real build once, then `dep_graph.py`, `lfs_needs.py` (with its list) and `check_core_use.py`. `test_all.py` runs `dep_graph.py` as step 4, before its rebuild (`tools/test_all.py:267`): in a fresh checkout that step stays red until a build has run (worth a fix: `write_gen()` in listing mode too, Q10).

**25. Indexes.** `python tools/make_index.py --all` (every `INDEX.md` and the root one; `tools/make_index.py:9-12`). *Agreement:* agree.

### Phase F: checks, verify, baselines

**26. Lints and node tests on the new pages.** `python tools/test_all.py --no-build` (the push checks without a second rebuild). Expected after the fixes: green, `core/audio/test-audio.js` aside unless swept. *Source:* STACK-INT Phase 4.1 ("~2 min" there; HR 100-101: 210 steps, `check_insulation` alone 34 s).

**27. Fingerprints.** `python core/engine/fingerprint.py`; `python core/furnish/fingerprint.py`. Expected moves on purpose: the hem rule (Islanders, Scyvoi, Lizardmen; TODO 107-113), Eternian (TODO 379-381), K2/K3 if step 9 ran. Look at the named pages, then `--write` each. *Agreement:* STACK-INT 4.1 and STACK-KIT 0.4 agree.

**28. GPU verify of every rebuilt page.** Per page `KRATOR_GL=gpu`, `verify.py <page> --assert`; biome and station pages `--all-views`; Erewhon `--interiors` (882 s on the Arc, HR 112); `kits/interiors` sets page `--sets` (TODO 155); the Xanadu pages' own `--views` lists (their docstrings). Lane `auto` (unset `KRATOR_GL_LANE`: CLAUDE.md), so both local lanes queue; the cloud lanes `vast0`/`vast1` only if the owner starts them (memory: all stopped 2026-11-16; they bill hourly: tell the owner when the queue is empty). Order long jobs first: `voth-city` (about 40 min alone: `tools/test_all.py:51-52`), the isle demo, Erewhon `--interiors`, the biggest `--all-views` (PERF 102-103). Use the verify cache (`tools/verify_cache.py`); a `STALE PASS` or a run without the renderer line does not count (CLAUDE.md "the survey's checks"). There is no verify driver in the repo yet (`tools/verify_all.py`, PERF 96-98, is planned only: Q8). *Source:* STACK-INT Phase 4.3; HR 117-127. *Agreement:* agree; known failures carried from HR 120-126 (guilin, Dalab's instance cap, Mav's walk, Locus x3 and Yuni x3 on the key map, yuni-plants' doors, Pinnacle Rock's attach audit 1.87 %, Voth city's embassies and Arena flight, `sockets-example`'s door) are not regressions.

**29. Route harness, both lanes (timing: never `auto`).**
```powershell
$env:KRATOR_GL = 'gpu'
foreach ($lane in 'arc','rtx') { foreach ($t in 'openworld','ancientsvalley','interior') {
  python tools/harness.py lock --lane $lane -- python tools/route_harness.py --track $t --out "route-$t-$lane.json" --md "route-$t-$lane.md" } }
python tools/route_harness.py --compare <stage-1 baseline>.json route-openworld-arc.json
```
Add the `xanadu` track (`tools/route_tracks/xanadu.json`, P5) when its baselines are wanted (STACK-PLAN XP1 says after Stage 8). *Source:* STACK-INT Phase 4.3, STACK-GTP 12c.3; `route_harness.py` usage (stack lines 18-26). *Agreement:* STACK-INT 4.3 (line 225) writes `--route openworld ... --route interiors` and STACK-KIT 4.3 `--track interiors`; the flag is `--track` and its choices are `openworld`, `ancientsvalley`, `interior` (singular: stack `tools/route_harness.py:33-56,520`). Both plans' commands fail as written.

**30. Godot tests.**
```powershell
& $env:GODOT --headless --path godot --script res://tests/relief/wrelief_test.gd       # v1 and v2 goldens
& $env:GODOT --headless --path godot --script res://tests/materials/m1_slice_test.gd    # Gate 3
python tools/harness.py lock --lane rtx -- $env:GODOT --path godot --rendering-driver opengl3 --script res://tests/interiors/stage7_interiors_test.gd   # 13/13, Gate 5 sun leak 0
python tools/harness.py lock --lane rtx -- $env:GODOT --path godot --script res://tests/perf/route_harness.gd
```
plus every `GODOT_TESTS` entry (run by step 33's `--nightly`). *Source:* STACK-INT Phase 4.2. *Agree.*

**31. The hash baseline, only for what passed.** `python tools/port_baseline.py --update <each page that passed in 28>`; then, once every page is real (no pointer) and the tree is clean but for pages and manifests, `python tools/port_baseline.py --write --prune` to drop the 35 retired rows (HR 97-98). *Agreement:* C17.

**32. Ratchets and checks 22-31, part 2.** In this order (TODO 160-179): `python tools/check_stale.py --write-baseline` (expect `{}`); `tools/checks_optin.json` `"names"`, `"recorded"`, `"minset"`: `"*"`, then `python tools/check_assembly.py` (extend each page's MINSET list rather than baselining); `"samplers"`, `"drawn-ground"`: `"*"`, then per rebuilt page `$env:KRATOR_GL='gpu'; python tools/harness.py ratchet --write <page>` (`tools/verify_ratchet.json`); `python tools/check_source.py --write-baseline`, `check_views.py --write-baseline`, `check_vendor.py --write-baseline`, `check_assembly.py --write-baseline` only for pages rebuilt and read in this pass; `python tools/textures/check_cells.py --strict` replaces its ratchet "at the rebuild's close-out" (`tools/test_all.py:28-29`). *Agreement:* TODO only; STACK-INT 4.3 names `verify_ratchet.json` for samplers/drawn-ground.

**33. The full gate.** `python tools/test_all.py --nightly` (it rebuilds everything again: the hash baseline must then hold; the 7 nightly verifies; Godot's 37+ headless tests; export sizes; the compare shots, a report). *Source:* STACK-INT 4.4, STACK-GTP 12c.3, BUILD-PLAN Phase C. *Agree.*

**34. Sign-off.** Commit with `python tools/commit.py -F msg.txt` (staged files: pages, `build-inputs.json`, `tex/`, `gen/` never; `godot/data` LFS); the owner's yes before each push (`http.postBuffer` raised: memory "Push timeouts"); the gallery republish is a wide change: ask (CLAUDE.md "Publishing"; HR 140). Update `TODO.md` (delete every ride-along done), `HANDOFF-REBUILD.md` (this pass's numbers), `core/materials/PROMPTS-NEEDED.md` (delivered sets out).

**Step count: 34** (plus the 7 precondition merges).

---

## 4. Page caps (scan of the line's committed pages and pointer sizes, over 80 % of their cap)

Script: scratchpad `stage8/caps.py` (reads real sizes, or the `size` line of an LFS pointer; caps from each `BUDGETS.json`).

| Page | Now | Cap | % | Note |
|---|---|---|---|---|
| `kits/desert-nomads/dist/desert-nomads.html` | 16.18 MB | 16.50 | 98 | inline; split (step 6) |
| `kits/ash-nomads/dist/ash-nomads.html` | 18.21 | 19.00 | 96 | inline; split |
| `settlements/voth/dist/voth-city.html` | 18.84 | 20.00 | 94 | split; layout files are the city-layout work's |
| `kits/fauna/dist/krator-fauna.js` | 31.56 | 34.00 | 93 | cap raised 2026-11-22 (C20) |
| `settlements/loj-twenny/dist/loj-twenny.html` | 14.16 | 16.00 | 88 | **in no plan** |
| `settlements/screamers/dist/screamers.html` | 13.97 | 16.00 | 87 | inline; C13 |
| `settlements/thalaba/dist/thalaba.html`, `thalaba-pieces.html` | 13.60, 13.28 | 16.00 | 85, 83 | per-page packs (step 20) cut these |
| `settlements/gihon/dist/gihon.html` | 13.41 | 16.00 | 84 | Xanadu page |
| `settlements/kirstabal/dist/kirstabal.html` | 13.25 | 16.00 | 83 | Xanadu page |
| `kits/beast-riders/dist/beast-riders.html` | 13.10 | 16.00 | 82 | inline; split |
| `settlements/flashing-eye/dist/flashing-eye.html` | 12.84 | 16.00 | 80 | Xanadu page |

Texture sidecars (`*.tex.*.js`) sit at 85-89 % by design (the packer cuts a pack into files under the cap: `xanadu.tex.xanadu.js` 13.86 MB + `-2.js`); a glazed family's 8-bit normal adds +119 to +198 KB (XPACKS `TODO.md:81`), which the packer absorbs by a new chunk, not a page fail. Biomes inline near the cap (STACK-BIO 0.2): `biomes/xanadu` `xanadu-floor.html` 12.07 MB (79 %), greenstep's four at 11.4 MB, abyssal-savannah's `bench` 11.46 MB. The page cap is a hard fail in `tools/build.py` (`tools/build.py:80-85`), so a page that grows past it stops step 19.

## 5. Time and memory (from the docs; nothing measured here)

- Build: HR 79-96: the last sweep, 262 commands; per-command build time summed over 208 commands fell from 659 s to 446 s between its two rebuilds. This one is 406+ commands, with every gen/ and every region page.
- GPU verify: about 350 runs took about 9 h on the two local lanes (PERF 90; HR 117-119); 290 runs took about 2.25 h with six cloud lanes added (HR 88-96). Expect 400-500 runs here (every page moves). Voth city about 40 min alone (`test_all.py:51-52`); Erewhon `--interiors` 882 s on the Arc (HR 112). Cloud: about $1 an hour a machine (PERF 101).
- Godot: `export_spike.py` about 10 min under software GL (`godot/README.md:258`); klava 114 s alone, timed out once under verify load (HR 99-100).
- Memory: no figure in the docs. The machine is short on memory: `-j 2` for the build, one local verify per lane, no build while a verify runs, playwright exports (`export_spike`, `harness.py export`, `godot_case.py`, `page_pack.py record`, fingerprints) one at a time. The renderer dies at V8's 4 GB on the heaviest pages (memory "Renderer OOM").
- LFS: about 570 MB of library images (CLAUDE.md) plus every pack and page pulled in step 1; the character pieces about 200 MB (step 2).

## 6. Open questions only the owner can answer

- **Q1. The 12d upgrades inside Stage 8?** B1-B5 and K1-K5 are unwritten code that changes looks on 540-758 pages. Keep them in the rebuild (STACK-GTP 12d, STACK-TODO 86), or land them first as their own sessions, each verified, so Stage 8 only rebuilds (PERF section 2, STACK-PLAN "looks after")? Same question for PERF Phase 0/1 (PERF 6.1-6.2).
- **Q2. The 51-settlement pass (ABRP, TODO 93).** Before Stage 8 (layouts, re-anchors of Erewhon, Pinnacle Rock and Longsong, frame turns, systemic buildings), or after it? Inside it, it doubles the rebuild.
- **Q3. Relief for the six regions without it** (`isle-demo`, `iziz-cluster`, `xanadu-lake-shore`, `xanadu-north-shore`, `xanadu-oidong-highrift`, `north-basin`): re-cut them on relief (and smoothing) now, or only `micro: 2` where relief already is? And the stack's `SITES.json` turns relief on for `xanadu-oidong-highrift`: keep? (C4, C6)
- **Q4. The packing.** Web: glazed families to `xy8` only (STACK-PLAN answer 4) for **every** build, or only Xanadu's? Godot: `packFormat: 2` (`v4_arrays_two_maps` ground, `v2_two_maps_oct8` kits) for every exported pack now? (STACK-GTP 12c.2; STACK-INT 12 left "the owner picks the packing", section 11 stage 5.)
- **Q5. World-tile streams** on for the relief regions (`relief.world_tiles: true`), and the T2 residual `D` (STACK-GTP 12c.1 "plus `D` residual rasters where T2 passed": did T2 pass? `STAGE-2-TERRAIN-REPORT.md`).
- **Q6. core/hamlet's shared Xanadu row:** take the wayside shrine and the mine head (they move every Xanadu village; TODO 149-150)?
- **Q7. Multi-kit wiring (TODO 94):** which settlements' `CITY_JS` take `core/kits` and the multikit host now, and may Stage 8 edit core/city's lists (the city-layout work owns core/city)?
- **Q8. Verify budget:** start the cloud lanes for step 28 (and a bigger machine: PERF 6.4)? Accept tiering (main view only for pages moved only by proven no-look-change core items: PERF 6.5)? Promote `tools/verify_all.py` before the run (PERF 4.1)?
- **Q9. Godot exports:** which of the 28 `godot/data` cases are re-exported in Stage 8, and where are the writers of the undocumented ones (`world-eternian`, `world-lod`, `world-longsong`, `world-nhighlands`, `world-pylon`, `world-talia`, `world-sedesert-falls`, `world-isle-valapo`, `strongbow`, `sky`)? STACK-PLAN puts Xanadu's exports after Stage 8 (XP1).
- **Q10. Small tool fixes worth making first:** gen/ written under `--list-sources` too (so `dep_graph`, `lfs_needs` and test_all's step 4 work in a fresh checkout); `extract_region.py --relief` keeping `micro`/`world_tiles` from the `SITES.json` row (C5); `test_all.extra_builds()` taking nested builds (`sockets-example`, the core demos) so `--all` stops skipping them.
- **Q11. Hook and review-round-3** stay out again (HR 36-40)? `claude/hook-p1`'s KLAND lifts the land rule out of `41-world-fields.js`, which step 7 also edits.
- **Q12. The garnet/vitreous station heights** (`test_smodel.py`, TODO 38-41): restate from the model or carve the model (the NE wall's call, before P7 closes).
