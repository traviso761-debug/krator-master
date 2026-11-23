# Handoff: the stage 0 vertical stack (terrain fixes tested in Godot before the all-builds rebuild)

**For:** the next agent (Gemini). **Written:** 2026-11-17. **Repo:** `traviso761-debug/krator-master` (public on GitHub).
Read `CLAUDE.md` (the working rules: builds, harness, GPU lanes, encoding, no copied infrastructure) and
`GRAPHICS-TERRAIN-PROPOSAL.md` sections 3, 4 (T0), 12 and **12b** before starting. This file is the task; 12b is its spec.

## Where things stand

| Branch | Tip | What |
|---|---|---|
| `claude/exciting-curie-1c0022` | e85a8a069 (this file on top) | the micro-relief module, the proposal, section 12b (the vertical stack) |
| `claude/zen-dirac-ewtd9p` | 0121c3df3 | **WMICRO version 2** and the gas giant's ring (from 67dff4945) |
| `claude/dazzling-brahmagupta-i0thml` | e1768f973 | **KGROUND zero-weight guard** (from 67dff4945) |

Both stage 0 branches are code only: no page rebuilt, no region re-baked, no GPU verify, no baseline change. That was
deliberate (owner: keep things small until the all-builds rebuild next week).

**WMICRO version 2** (`core/world/43m-world-micro.js`, twin `core/world/wmicro.gd`):
- `WMICRO.init({..., version})`; `41-world-fields.js` passes 2 only when `region.json` has `relief.micro: 2`. No
  committed region has it, so every page is bit-identical on version 1.
- v2 `erode`: the masked target is mean-compensated (`tgt - YMEAN`); the 3 x 3 kernel's jitter is [0.25, 0.75], radius
  1.25. Measured by its session: mean bias -20.1 % of rms (v1) against -3.4 % (v2); least kernel weight 0.000 against 0.53.
- Goldens `mhills2`, `merode2`, `mgrain2` added (v1 keys unchanged); `wrelief_test.gd` checks both. Whether that
  session ran the Godot test is not recorded in its commit: **run it** (below).
- `core/world/landshade.py --steepest`: the three steepest 4 km windows' measures.
- `80-world-sky.js`: the ring is added to the scene again (it was swallowed by a trailing `//`).

**KGROUND guard** (`core/terrain/43-core-ground.js`): map layers skip their fetches where the weight is 0, inside the same
`if(kgA0>0.0)` the layer kinds use; pixels unchanged (`kgHL(0, ...)` is 0). `test-ground.js`'s frozen shader-text hashes
were re-frozen. 138 build commands / 274 pages take this file.

## The task: section 12b, step by step

1. **One test branch.** From `claude/exciting-curie-1c0022`, merge `origin/claude/zen-dirac-ewtd9p` and
   `origin/claude/dazzling-brahmagupta-i0thml` into a new branch (e.g. `vertical-stack`). Do not push to `main`.
   Run every `node core/world/test-*.js`, `node core/terrain/test-ground.js`, `node core/rand/test-rand.js`.
2. **Godot twin.** `python godot/tools/sync_core.py --check` must be clean. Then (Godot 4.7.2; the binary path is in the
   owner's notes, `C:/Users/travi/Downloads/Godot_v4.7.2-stable_win64_console.exe`):
   `godot --headless --path godot --import` once, then
   `godot --headless --path godot --script res://tests/relief/wrelief_test.gd` must pass the v1 **and** v2 keys.
3. **The place, on version 2, as a test copy.** `openworld/oidong-highrift` (Godot streams it: `godot/krator/world_stream.gd`,
   and walks it: `walk.tscn`). Do not commit its `region.json` with `relief.micro: 2`: work on a copy (or a throwaway
   commit on the test branch only, clearly labelled, never merged). On that copy:
   - `python core/world/bake_streams.py oidong-highrift`, then `python core/world/bake_sites.py oidong-highrift` and
     `--resources` (each check must read `ok`);
   - record tarns, junctions and lines against version 1's (the bake prints them).
4. **Measure the land, v1 against v2.** `python core/world/landshade.py oidong-highrift <out.png> --steepest` on each,
   plus `--at oidong-highrift --texture --fixed` hillshades. Report mean bias, band relief (20-60 / 60-180 / 180-540 m),
   alignment, slope p99, and `--bench` (µs a `WORLD.H` call).
   - Check the town's edge: where `reliefMask` fades the erosion (a town's band), v1 left a shelf of up to the bias
     (several metres on slopes). Take a height profile across one town edge in both versions.
5. **Godot export and shots.** Export the region's data for Godot as its pipeline does (`godot/tools/export_spike.py` and
   the open-world stream data; read `godot/README.md` and `GODOT-PLAN.md`'s M7/M8 notes first). Three cameras: a High Rift
   flank, a valley floor, a town's edge; hour 15:30. Forward+ on the RTX lane: wrap the Godot run in
   `python tools/harness.py lock --lane rtx -- <godot command>`. Never take a GPU lock by hand.
   One web shot of the same views for reference: `python verify.py dist/oidong-highrift.html --views <n> --out <dir>` with
   `KRATOR_GL=gpu` (rebuild the page on the test copy first: `python tools/build.py openworld/oidong-highrift`; do not
   commit that page).
6. **The KGROUND guard on one page.** Rebuild one throne station on the test branch (`cd biomes/throne && python build.py
   --station savanna`), `KRATOR_GL=gpu python verify.py dist/throne-savanna.html --assert`, and a before/after shot of
   one view. Expect identical pixels. Godot has no map-layer KGROUND twin; nothing to change there.
7. **Report** (a markdown file on the test branch, `VERTICAL-STACK-REPORT.md`): every number from 3 to 6 in a v1/v2
   table, the shots side by side (paths), what failed, and a recommendation.

## Pass criteria (from 12b)

- v2's mean bias under 5 % of its amplitude (the unit test says -3.4 %; confirm on the real region);
- no seam or step at a town's band;
- stream, site and resource checks `ok`;
- the Godot twin passes v1 and v2 goldens;
- the throne station's pixels unchanged with the guard;
- the owner's eye on the Godot shots.

If it passes, the all-builds rebuild turns `relief.micro: 2` on everywhere and takes both branches. If it fails, report
the numbers; do not tune constants without saying so.

## Rules that bite (from `CLAUDE.md` and the owner's notes)

- Commands for the owner are PowerShell. Windows `Set-Content -Encoding utf8` adds a BOM: write files another way.
- Every text `open()` in Python names `encoding='utf-8'`. Paths written into pages use `/`.
- No trailing `//` comments in the packed JS fragments: an inserted `//` swallows the rest of the line (the ring bug).
- `verify.py` is SwiftShader unless `KRATOR_GL=gpu`; check its output says it ran on a GPU lane.
- Do not push without the owner's yes, once per push. Do not touch `PORT-BASELINE.json` in this task.
- Do not open generated files (`dist/`, `*.html`, `three.min.js`, `godot/data/`); search `src/` and `core/`.
