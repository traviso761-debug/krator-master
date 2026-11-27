# F. What the sessions that fed the line found (2026-11-23)

The owner asked each session merging into the line to send its tips, pitfalls and bugs before Stage 8. This file keeps the
ones Stage 8 must act on or will trip over, in the step they belong to. Already in another appendix: noted by its row, not
repeated. The sessions' full notes are in the coordinator's shared notes folder (`biome-graphics-b1-b5.md`,
`kit-graphics-k1k5-tips.md`).

Sources: **B** biome graphics (B1-B6, S4, S6, M4), **K** kit graphics (K1-K5, room light), **X** Xanadu plans (lake towns,
XS0), **V** `tools/verify_all.py`.

## Bugs to fix or carry (with the step that meets them)

| # | From | Bug | Stage 8 action |
|---|---|---|---|
| F1 | X | Every lake town's fit is stale against the regions' land after the stack merges (`python3 tools/fit_lake_town.py mouth --check`). One town's refit stales every town's bake (the whole fit file is hashed: KNOWN_ISSUES) | With the core/world wave: refit all 19, then `bake_towns` every town, then `bake_sites` both lake regions, then rebuild both regions and `settlements/xanadu-lake`. That order (towns before sites) matters |
| F2 | X | `core/world/bake_towns.py pher --check` needs `settlements/pher/gen/89zf-ph-far.js` | Build Pher before baking its towns (also E "dependencies run one way": Pher's gen/) |
| F3 | X | `bake_towns` mouth and pottery print "its bed at most nan m" for their stream | Small: find the NaN in the stream bed's depth |
| F4 | X | xanadu-lake-shore's GPU verify: the renderer dies inside `run_universal` (the texPending wait, `sample('final')`, `UNIVERSAL_JS`). The JS heap is only 339 MB of 4.4 GB, so it isn't V8's heap limit | One cause with E "Still to land" item 4 (the universal-assert stall). Stop such a run when it dies rather than holding a lane 25 min |
| F5 | X | north-shore's baked plan against the browser's: lands, `siteFor` and the six Pher-ring villages are identical; only road `spher0north1/road/2` differs. Reproduce in the pane with `_sites.checks()`; it still differs with `WORLD.clearHook=()=>false` | E's known-failure row; this narrows it to the road planner |
| F6 | X | test-xan-economy fails one check of 74: only the time ("a year in under four minutes", line 89: 680 s against 240 s under load). People 393,159 (bound 300k-400k) and actors 1,299 (bound 3,000) are within bounds | E's timing row with test-east-rift (425 s): run alone, or relax as the owner says |
| F7 | K | The furnish fingerprint baseline has Highlands placing 1126 and 1265; its committed page places 981 and 1120. Highlands doesn't take the room light, so either the page is behind or the baseline is ahead | Rebuild Highlands, then read the fingerprint before writing its baseline |
| F8 | K | Locus and abyss-kit interiors-on read DIFFERS on the furnish fingerprint (same counts, a moved geometry hash). It was the same before dd16e4f2b | Find the cause before rewriting that baseline |
| F9 | K | The furnish fingerprint crashed once on its first page and passed on a rerun | Rerun once before reading a crash as a failure |
| F10 | K | Tungang's committed page is behind the line: 123 records against 170 | The rebuild |
| F11 | K | Locus's `wirePage` hooks 15 materials outside its night hook, water among them, costing 5 more programs | Small follow-up: leave water and glow out of the room light |
| F12 | B | A white box on a page in two cases: on WebGL1, and on a non-power-of-two card sheet now that B4 makes sheets ImageData (three r128 cannot resize ImageData, so the texture samples black) | Every page is WebGL2 today; one check in step 29's verify that no sheet is non-power-of-two |
| F13 | B | `godot/tests/shaders/season_gpu_check.gd` fails its flush check under Forward+, with or without B1 | Run it with `--rendering-method gl_compatibility --rendering-driver opengl3` (its header), where it passes 6/6; otherwise it reads as a regression |
| F14 | B | godshearth: `BIO.init` appears only in its `build.py` | Find its real host before V7's LOD line (B-ridealongs V7) |
| F15 | V | `lfs_needs.py --test core/simulation/ride/test-ride.js` reports 0 pointers, but the test reads `kits/motor-vehicles/dist/krator-vehicles.js` through `lab/kv-node.js`: lfs_needs misses inputs read through a helper | Pull that file explicitly; fix lfs_needs to follow the helper |
| F16 | V | `core/simulation/ride/lab/verify.py` prints a failing node test as "FAIL <test> (?)" because it drops the child's stderr | Print the first stderr line |
| F17 | V | Verifies that end in a generic FAILED line (kits/post-apoc's sockets-example and others) | Add each one's pattern to `verify_all.json` "generic_failed" as it is met |
| F18 | V | No verify at all: `core/atmos/demo`, `core/materials/demo`, `tools/scale-model/model`; `openworld/network-proposal/testbed` isn't built in a fresh checkout (`not-built`); `kits/sw-arcology` (skipped with its reason) | Carry, or write the verifies |
| F19 | V | Stale docs: A-runbook step 28 says there is no verify driver; PERF-PLAN 4 item 2's `harness.py cloud prewarm` does not exist, so a build's first run on a cloud lane pays its LFS upload (about 3.6 MB/s) | Fix the runbook line; budget the first-run upload |
| F20 | V | Erewhon's gate: its README says `--views "Overview,The palace precinct"`, KNOWN_ISSUES and the runbook say `--interiors`; the driver uses `--assert --interiors` only. Roketstad takes `--interiors` from its KNOWN_ISSUES | Settle Erewhon's gate in its README |

Also met by these sessions and already on the list: test-world-styles' four overlays, Marr's core use, the view names with
apostrophes or colons (loom-chasms, kits/ancients strongbow "The Order's crown", kits/marr), the Labyrinth's botany census,
core/hamlet's harvest.wood tags (E's rows). X adds to the last: batteredisle "fertiliser"; compasshills "padding", "bast";
crook "fiber/padding". X also saw `test_kit_pack` fail on Locus's bundle in the node VM, pack.py's cavity and mip-variance
tests, and `kits/interiors/tests/test-fixtures.js` throwing at line 11 (it needs the built `dist/interiors-core.js`).

## What to rebuild together

- **Room light (K):** girder, locus (all three pages), yuni (all three), mavs-refuge. And all 36 builds `core/engine/91i`
  reaches: 91i now passes `{width: RT.width}` to KRLHOST, so rebuild the whole set, never part of it.
- **Masonry packs (K):** committed; pages pick them up when rebuilt; `core/materials/record/test-masonry-packs.js` checks them.
  Islanders' larger pack writes a third sidecar, `islanders.tex.islanders-3.js`.
- **Any land change (X):** stales a region's `plan/sites.json`: run `bake_sites.py <region> --check` after any core/world change.
- **Region sidecar packs are shared (B):** `dist/<page>.tex.<kit>.js` is written by every variant of the page, so a
  before-and-after build overwrites it. Build "after" last.

## Verify (step 29)

- **Verify only after Phase D (V):** 7 of 12 pages verified on dd2c2e591 came back STALE PASS (built before their sources
  moved); the driver doesn't count those. PORT-BASELINE is already behind the committed pages (`--dry-run` selects 359 of
  484); after the rebuild expect nearly all.
- **Run it detached:** `python tools/verify_all.py --detach`; `--report` rewrites the report mid-run; `--resume` after a crash.
  Overrides go in `tools/verify_all.json` with a "why", never in the script. Page filters are substrings (`throne-tube` matched
  `godthrone-tube`): use full paths.
- **Pull LFS first:** `python tools/lfs_needs.py <build> --pages --pull` per build, before the run, not during it.
- **Stage 8 needs the machine to itself (V):** measured durations (`%LOCALAPPDATA%/krator-verify-all/durations.json`) include
  time spent waiting for a lane; the estimate was 16.5 h for 359 jobs, about 8 h on two lanes, while other sessions held arc.
- **Tiering is wired but empty:** add an item to `no_look.items` only with its proof (node test or fingerprint) passed on the
  Stage 8 tip. The known-failure regexes are loose by design (HR-1 guilin matches `.*`; D30-2 Longsong
  `interiors|bake|draw|budget`; D30-3 also covers kits/xanadu): read each known run's items in the report.
- **82 pages take plain `--assert`** because nothing documents a gate for them (51 kits/ancients targets, iziz w-a/w-b/w-c/
  ixtest, ys kit and mock, Locus's sheets, Yuni's pages, azure-dream's stations): add views in `verify_all.json` "pages" if any
  needs them.
- **Open-world shots (B):** after `CAM.setView`, wait for `TERRAIN.pending()===0 && NURSERY.queued()===0` (and `START.ready`
  before the first move), or the shot is the loading overlay and fps reads 5-10.
- **A hung verify's log is empty (X):** verify.py's output is buffered when piped; look at the timestamps of the files in `--out`
  (resources.png) to see where it stopped.
- **The graphics opt-outs to compare (B):** `?sward=0` (open world), `BIO.SWARD_AUTO=false` or `BIO.sward(false)`, `?s4=0`,
  `?lodmerge=0` / `?lodfade=0`. `BIO.swardStats()` and `BIO.lastBake` (`crownAO`, `baseAO`, `grounded`, `a2cAuto`, `sward`) say
  on any page whether B2, B4, B6 and M4 ran. Program counts at load (`renderer.info.programs.length`) check B3 still holds:
  hyperjungle 36, nhighlands 46, labyrinth 37, eastabyss 50.

## Measuring cost (K, B)

- Capped 60 fps hides cost: measure uncapped, interleaved with a copy of the line's page (`git show | git lfs smudge`) on the
  same lane. Mav's and Locus swing about 6 fps between runs. A 2 s rAF count is noise on the Arc: use ground_shots' GPU ms
  (the timer query's minimum over frames).
- Pixel diffs need a noise floor: Mav's at 13:00 differs 14.7 % from itself across two runs.
- XS0's numbers (X): Gihon links 9 samplers and is estimated at 943 MB of video memory; Opal-Phord's page is at 87.6 % of the
  16 MiB cap (the near-cap list); the lake towns' `?interiors=1` more than doubles a page's video memory (280 to 666 MB).

## Writing code in Stage 8 (pitfalls)

- **Shaders (K):** hooking a material after its first compile adds a program (Girder 188 to 259): put shader work in the page's
  existing hook from the first compile, keyed by kind, data in uniforms or attributes. A vertex attribute costs every frame on
  every mesh that carries it even when the shader skips the work (Girder lost 4-8 fps on 13.4 M vertices): set it only where
  used, packed small. WebGL allows 16 attributes per program (Girder's instanced flyers failed to link): hooks that add
  attributes skip instancing, skinning and morph programs. A mesh without the attribute reads the generic value, which can be
  1: range-check it.
- **GLSL (B):** take derivatives outside branches (GLSL ES 3.00); world-space UVs at about 150 km lose float precision (the
  open world's ground uses the chunk-local `aDUV`, a 4096 m frame).
- **Lints:** write `(x==null?d:x)`, never `x || d` (ORNUM catches every new `x||0` and `||.4`). RAWTEX cannot tell a data
  table from a colour map: raise that one key by hand, never `--write-baseline`. `tools/check_assembly_baseline.json` is not
  strictly sorted: insert keys in place, do not re-sort.
- **Packs:** `m4` and `pom` do nothing on mapOnly families (Highlands cobble and ashlarP; Beast Riders stone, sandstone,
  navajo). On Windows a repack also settles drifted unflagged families and re-encodes images: diff it and keep only what was
  meant to change (seen again at the Tungang merge here).
- **Modules (B, X):** KGROUND (`43-core-ground.js`) sets the global and has no `module.exports`: in node, require it, then read
  `globalThis.KGROUND`. `BIO.solidMat` carries `userData.bioSolid` (kind `'solid'` would change the Godot record).
  core/simulation's `places()` must be idempotent (called before `init()` it added every door node twice and every actor fell
  back to REST); slot counts (MARKET, FARM) silently cap a crowd: size them to the roles. A station host may set the mask to 0
  where it places its own plants: a pass gated on `BIO.mask` draws nothing there.
- **Yuni (K):** groups fragments by numeric prefix; its rooms are building-local (`intToWorld`).
- **Shell (B, K, X):** PowerShell variables are case-insensitive (`foreach($b in $B)` overwrites the list); PS 5.1 drops `""`
  arguments (use `--queries=` and a placeholder); `bash` under `harness.py lock` resolved to WSL's (use `powershell -File`);
  Bash heredocs eat backslash escapes in JS strings (use Edit or a patch script, then `node --check`). `commit.py` on a merge
  with thousands of staged files takes over 5 minutes: run it in the background.
- **Before-and-after builds (B):** `git checkout <ref> -- <paths>` to build a "before", then `git checkout HEAD -- <paths>`;
  finish with `git checkout -- biomes openworld` (dist/ and build-inputs.json stay dirty otherwise).

## New ride-alongs (X)

- `kits/xanadu/extra/69dy-ix-lake-works.js` and `src/87k1` into `kits/interiors/sets/xanadu.js`.
- `WORLD_SAMPLE` (the countryside sample, 48v/88r) for the other Xanadu province regions.

Deferred, not Stage 8: B's S3 (worker-built sub-grid normal textures, about 47 MB of video memory, mostly an aerial gain).
