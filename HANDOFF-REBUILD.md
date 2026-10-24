# Handoff: the all-builds rebuild (written 2026-10-23)

For the next session. The sources are merged and pushed (`origin/main` e1d57696e, which contains the branch
`claude/water-migration-merge`: 5 work commits, the merge of 415 upstream commits, the core-use check). **Almost nothing has
been rebuilt since the merge**, so the committed pages and `PORT-BASELINE.json` are upstream's, stale against the merged
sources. The job is to rebuild in this order, verifying as you go:

1. **Biomes** (every `biomes/*`, then the Throne stations).
2. **Settlement kits and object kits** (`kits/*`, `core/charactermodels`, the settlements that are not placed on the map).
3. **Settlements placed on the open world**: Pinnacle Rock, the isle demo (settlement and open-world page), Hook, Longsong.

The audits behind this plan are in `AUDITS.md` (an index of every audit in the repo, the KNOWN_ISSUES batches and what is
left, and the per-biome water and atmos scope).

Do not start with a blanket `python3 tools/test_all.py` rebuild: build one stage, verify it, rewrite the baseline for the pages
of that stage, commit, then the next stage.

## What is in main now

| Area | State |
|---|---|
| `core/water` gap closers | Written, node tests pass (`test-water.js`, `test-gaps.js`, `geyser/test-geyser.js`; `godot/tests/water/gaps_test.gd` added, **not run**). **No taker has been rebuilt against them and none of the biome workarounds is retired.** The agent that was finishing this died on the weekly limit (resets Oct 25, 8 pm Chicago) before the rebuild. |
| `core/water` options (all default to today's output) | per-flow `rapids`; per-point flow width; depth bias for a flow at an open surface's level; `surf:false`/`surfDepth`; per-body tint (tint, mask-region blend, still-pool gradient); `pick:true` (raycast and probe); `fallsOf` returns the chute foot, merged-falls draw; `WATER.terraces` (stepped river: `core/water/ext/53-*`); `seeds:'edge'` and a windowed shore bake; order-independent `WATER.wetGround`; `drawFlow({spray})`. API and the closed gaps are in `core/water/README.md`. |
| geyser and spring kind | `core/water/geyser/` (opt-in subfolder): `WATER.spring`, `WATER.geyser`, `WATER.drawSpring/drawGeyser`. `biomes/geyser` is on it; `openworld/isle-demo/build.py` lists it. Throne 4 and 8, station 1's pools and the isle demo's vents still use their own. |
| atmos host binding | `core/atmos/host/89-atmos-c-hostbind.js` (`ATMOS.bindHost`) and a `src/89a-host-atmos.js` in every older biome and Throne station (hour 13, nhighlands follows `LIGHT_MODE`). Throne station 1's triangle ceiling is 22M (was 20M; draw calls still over 140). |
| water on `core/water` (phases 2 and 3) | hyperjungle, nhighlands, ebadlands, sedesert, swbay, swlowlands, nwlowlands, rift, eastabyss, Throne kipuka, savanna and frontier, geyser, ringisles. Each has `src/89w-host-*.js`. |
| `core/tags` | 24 cultures (Jimjam and Dalab are `VOCAB.noCatalog`; Eternians upstream). |
| catalog | 12 new fruit pieces (62 in all with the north-east canyons'), bundler adds `generic-goods` with `generic-fruit`. |
| Girder | nav graph walkable (`nav-walkable` assert), furniture budget 78 calls, trades table pulled in (`tools/check_trades.py`). |
| little-demo | deprecated; its 17 world fragments live in `openworld/isle-demo/src/world/` (see `openworld/little-demo/DEPRECATED.md`). |
| `tools/check_core_use.py` | a `test_all.py` step; see "The core-use check" below. |

## Stage 1: biomes

Order: core first, then the biomes, then Throne.

1. **Finish `core/water`.** `node core/water/test-water.js`, `test-gaps.js`, `geyser/test-geyser.js`, `godot/tools/water_gaps_golden.js`,
   and the Godot test `res://tests/water/gaps_test.gd` (Godot 4.7.2: `C:/Users/travi/Downloads/Godot_v4.7.2-stable_win64_console.exe`,
   `--headless --path godot --import` once first). Editing a top-level `core/water` fragment changes **every** build that pools the
   folder (settlements and kits take all numbered files): rebuild them all, compare calls and triangles per named camera with the
   pre-change numbers (record them first), and rewrite only the baseline entries you verified.
2. **Adopt the options** in the pages already migrated, removing the workarounds recorded in each `KNOWN_ISSUES.md` and under
   "Open gaps" in `core/water/README.md`: the global rapids preset set by hyperjungle/nhighlands/kipuka/frontier/swbay/swlowlands;
   the second masked open surface used for tint in swlowlands/nwlowlands/rift/eastabyss; flat 10 m flows in frontier; invisible pick
   discs in savanna/ringisles; the white surf band clamp at 1.4 m in rift/eastabyss; falls re-deriving the chute foot in swbay.
3. **Phase 4 water** (hard ones, now with the options): nwbay (stepped river: `WATER.terraces`; 276 of 300 draw calls, add at
   most 24), Throne 4 (isle: sea, lagoon, creek, fall, springs, geysers), 5 (falls), 8 (vents, mud pots), 9 (glacier lake and
   braids), 1 (hot pools and acid lake as `WATER.spring`/`still` only: it is at its triangle ceiling, no CDLOD), geyser's creek and
   terrace pools, shighlands streams (a stream line must be derived from the ravine records), oidong (70 m cataract, the drop is
   untested in `drawFall`), xanadu (lake, fall, fountain jet), ehighlands (bog pools; the frozen tarn stays local: no ice kind),
   crater-drylands (the seep; the fire lift waits for a fire design). Keep `waterH` and `terrainH` unchanged in every biome.
4. **New upstream biomes**: korona (6 stations), necanyons, nsemiarid, guilin, dambasins, scablands. Korona, necanyons, nsemiarid and
   guilin already list `CORE_ATMOS` and `CORE_WATER`; dambasins lists one of each; scablands lists neither. None has the host
   binding or the new options. `tools/check_core_use.py --list` shows their gaps (necanyons has a `MAT_WATER`, nsemiarid its own sky
   dome, korona a `fract(sin())` hash). Scablands and dambasins are overlays on the n semiarid and Ancient Port kits read in
   place: check whether the modules arrive through the kit before treating "MISSING" as real.
5. **Biome-side ride-alongs** (`TODO.md`, "Card sheets shown whole", 2026-10-23): give the eight inline `matlib_pack()` writers
   (crater-drylands, ebadlands, ehighlands, shighlands, oidong, Throne, Zeijani, Girder) the `cell` key or move them onto
   `tools/textures/matlib_pack.py`; audit the 215 sheet slots (`python3 tools/textures/cell_audit.py`; biggest: Throne 39, Crops
   44, Korona 15, Necanyons 15, Longsong 14, crater-drylands 12, ebadlands 10); mark sheets in the library meta. Put the
   `core/host` fixes in the same rebuild (below).
6. **Planned shaders** (`TODO.md`: Rendering ideas, Lava, Geothermal, Effects). Not part of the rebuild; sequence after it:
   one shared flame and heat-haze effect (crater-drylands, Throne caldera), a lava field shader (Throne caldera and tube), cloud
   shadows through one shared chunk, the `jet`/`dustburst`/`burst` fx kinds. Hot-spring ramps are already `WATER.spring`.

## Stage 2: kits and the unplaced settlements

- Rebuild every kit and settlement that bundles the catalog, `core/water`, `core/atmos`, `core/tags` or `core/host`: the pooled-folder
  builds are listed by `grep -l "os.listdir(d)" settlements/*/build.py kits/*/build.py` (dhelv, girder, highlands, locus, mavs-refuge,
  mungo, noahs-regret, shade, yuni, ash-nomads, crops, desert-nomads, islanders, lizardmen, post-apoc, resources, scyvoi, zeijani, plus
  others that list the fragments by name: iziz, pylon, talia, verge, ys, port, reedlake, xanadu, jimjam, dalab).
  `kits/interiors` builds before `kits/ancients-interiors`, which loads its `dist/interiors-core.js` (CLAUDE.md).
- **The ride-along fixes** (`TODO.md`, "Ride along with the next all-builds rebuild": do them in this change, rebuild once, rewrite the
  baseline once):
  - the probes read `userData.probePoints` (`core/host/95-host-probe.js` `_probePoints`, 24 builds, and the Ancient Port kit's
    `settlements/port/src/91-probe.js`: port, Hook, Ys, the dam bed); then the dam bed's flotsam markers
    (`biomes/dambasins/src/52-db-flotsam.js`) and the scablands' erratics (`biomes/scablands/src/87-host-erratics.js`) set it and
    drop their hidden markers;
  - guard `setPointerCapture` in `core/host/90-host-camera.js` (138 builds); remove the Iziz palace page-only guard
    (`settlements/iziz/targets/palace/95q-palace-cutlabels.js`);
  - re-vendor the catalog symbols (`kits/catalog/krator-symbols.js` from `core/sockets/38-symbols.js`: lotus, scroll);
  - reword the `core/hamlet` `xanadu` row comment;
  - doors as a core module and real doors and glass across the kits are later (a design task), do not fold them in.
- **Settlements not placed on the map are left alone** apart from that rebuild: no biome-file updates, no water or sky work, until they
  are built on the map. Mungo and Shade take `core/simulation` but not `core/city`; the owner says both could take `core/city`
  (do it when they are placed or when convenient). Dhelv (split into caves) cannot yet: `core/city` needs a **cavern setting**
  (the Tungang holds will need it too). Longsong ties into the sim already (`40d-ls-sim.js`, `SIM.pose`) and takes only one
  `core/city` fragment (33) and the relief fragment of `core/terrain`: it needs a **single-complex mode** in `core/city` (a
  pre-planned footprint as the one lot) and then moves onto the module. Both are core/city features, not started.
- Open from the nightly: `settlements/girder` and `walk settlements/girder` end on SwiftShader's `reading 'trim'` error panel only
  (all invariants pass); the same page fails on a clean HEAD build and is clean on a real GPU. Run it on the Linux CI image
  before spending time on it. Iziz, pylon and talia end FAILED on `CONTEXT_LOST_WEBGL` only. `world-yuni` json grew 12% in the
  export report (over the 10% tolerance). `interiors` pages are about 4 KB smaller than their baseline entries
  (another session's `kits/interiors` edits: find out before rewriting them).

## Stage 3: the placed settlements

Pinnacle Rock, the isle demo, Hook and Longsong have sites on the world map with their biome data and are **rebuilt whenever the
biome files change**; this stage comes last, after the biomes and kits they read are settled.

- **Isle demo** (both pages): `openworld/isle-demo` lists the geyser fragments by explicit path; the open-world verify fails here on a
  known SwiftShader error (`ATMOS.skylight` `reading 'trim'`, identical before and after), so check on a real GPU (the in-app
  browser: `preview_start`, GPU loads in ~15 s). Fix its `check_core_use` findings: `getImageData` in `88a-world-atlas.js`,
  `88t-world-towns.js`, `world/98-world-start.js` (use `core/mask`), a PRNG in `world/91-world-probe.js` and its own sky dome in
  `world/80-world-sky.js` (the `core/atmos` host binding); settlement page: `getImageData` in `98-isle-start.js`. One dry spring
  pool at vent 1's spouter showed no spout in the browser check: look at it. Another session (Isle demo P7b, worktree
  `.claude/worktrees/inspiring-swanson-212800`, unpushed) edits the same files: replay the 17 `git mv` renames of
  `little-demo` -> `openworld/isle-demo/src/world/` there first, then its content edits.
- **Hook**: missing `core/rand` and `core/tags` in `build.py` (`check_core_use`); it reads the Port kit's fragments and the scale
  model (`KLAND`); rebuild with `settlements/port` and Ys's vendored copy.
- **Pinnacle Rock**: no findings; rebuild and verify.
- **Longsong**: no findings; its biome is the Oidong valley. Rebuild and verify; the core/city single-complex mode is separate.
- The gallery: `gallery/build_gallery.py` labels little-demo deprecated; republish only after the owner's yes (the Throne, Korona and
  the north basin's three biomes were published 2026-10-20 and 2026-10-23).

## The core-use check

`python3 tools/check_core_use.py` (a `test_all.py` step; README "CORE MODULES ARE NOT OPTIONAL"). It reads each `build.py`'s code (not
comments) for the core modules its kind needs (biomes: biome, rand, tags, host, atmos, water; settlements and kits: rand, tags; a
settlement that takes `core/simulation` must take `core/city`) and each build's own fragments for a PRNG, a `fract(sin())` hash,
a value noise, `getImageData`, `MAT_WATER =` or a sky dome. It compares with `tools/core_use_baseline.json` (252 findings today:
debt, not a pass). Exceptions in the script: `NOT_APPLICABLE`, `PLACED` (the four above: the sky and water rules apply), `SINGLE_COMPLEX`
(Longsong) and `CAVERN` (Dhelv). `--list` shows everything; `--write-baseline` accepts today's findings (only to shrink the file after
fixing, or for a deliberate exception: say why). Aim: the baseline reaches `{}`.

## Practical notes for whoever runs this

- **Agents**: the weekly limit stopped subagents on 2026-10-21; it resets Oct 25, 8 pm Chicago. Subagents of this session's kind
  (Sonnet, general-purpose) did the water migration well when each had one biome set and a written brief; give each the pooled-folder
  rule, the verify lock and the baseline rule below.
- **Pooled folders**: builds in `settlements/` and `kits/` take **every numbered `*.js`** at the top of `core/water`, `core/atmos`,
  `core/tags`, `core/walk`, `core/lod`, `core/rand`, `core/furnish`. A new top-level fragment there changes all of them and fails their
  "generative fragment does not open with reseed(N)" rule. Put opt-in code in a subfolder (`core/water/geyser`, `core/water/ext`,
  `core/atmos/host`) and list it by explicit path from the builds that want it.
- **Verify lock**: headless Chromium crashes if two `verify.py` run at once. Take it with `mkdir C:/Users/travi/AppData/Local/Temp/claude/krator-verify.lock`
  (retry every 20 s) and `rmdir` after; never hold it while building. A SwiftShader `reading 'trim'` error panel and
  `CONTEXT_LOST_WEBGL` are known flakes: rerun once alone.
- **Baseline**: never `tools/port_baseline.py --write` while other sessions have uncommitted work; edit only the entries of pages you
  rebuilt and verified (text replacement of bytes and sha256 with the tool's `read_lf`/`sha`). After a full rebuild of a stage,
  `--write` is fine **if the tree holds only your work**. As of this note 36 pages differ.
- **Do not run `tools/audit_port.py` or `make_index.py` for one build**: they ignore the argument and rewrite every `PORT.md`/`INDEX.md`
  (three sessions did it by accident; the `PORT.md` churn in the merge came from this). Restore with `git checkout` the ones you did not mean.
- **Windows**: `README.md`/`.js` mix CRLF and LF; `open(..., encoding='utf-8', newline='')` and edit single lines. Heredoc backslashes
  break regexes: use the Edit tool or `chr(92)`. The auto-mode classifier denied one long chained `git add`/`commit` command; single
  steps went through. `git lfs` is needed for built pages; `http.postBuffer` is 500 MB here.
- **Godot** 4.7.2 at `C:/Users/travi/Downloads/Godot_v4.7.2-stable_win64_console.exe`; `tools/test_all.py` skips Godot unless `GODOT` is set.
  `atmos_test.gd` fails on two EOL-only differences in `godot/shaders/atmos_{waves,clouddeck}.gdshaderinc` on this Windows checkout (a
  regenerate changes only line endings: `node godot/tools/atmos_waves.js`).
- **Local files**: `.claude/launch.json` holds 16 local preview servers (many point at deleted sibling worktrees) as an uncommitted
  edit; three untracked originals (`CORE-ADOPTION.md`, `biomes/korona/NOTES.md`, `core/charactermodels/HANDOFF-CLOTHING.md`) were moved
  to the 2026-10-23 session's scratchpad because upstream had its own; `.agents/`, `.codex/`, `AGENTS.md`, `head_readme.md`
  are untracked tool leftovers, not part of this.

## Decisions waiting for the owner

- Gallery: republish for the water/atmos changes? (CLAUDE.md: a shared change is the owner's call.)
- Mungo and Shade onto `core/city`; the core/city **single-complex** and **cavern** modes (Longsong, Dhelv, the Tungang holds).
- Mud pots as a water kind; extending `extentOf` in the shared export adapter with a geyser branch; widening Geyser's verify box so
  the sea is required too.
- Girder: the `furn.calls` ceiling is re-baselined to 78 (a catalog low-detail variant could bring it back down).
- The brown ground squares through swlowlands' water (KI:43) need ground work, not water work.
