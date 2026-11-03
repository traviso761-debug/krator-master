# Handoff: the Spindle shell's distortion at its base and top

For a fresh session (Gemini), 2026-11-03. Diagnose first, with evidence; then propose or make the fix. The work so far is on branch
`claude/metropolis-testbed-2b4995` (worktree `.claude/worktrees/metropolis-testbed-2b4995`), last commit `303ea76fa` or later. Read the repo's
`CLAUDE.md` for the working rules (edit only `src/`, build with `python3 tools/build.py kits/metropolis`, never touch `tools/scale-model/`, do not
push or merge, commit on your own branch). Then `kits/metropolis/README.md` (what a shell is and what the spike found) and `PLAN.md` section 3.

## The symptom (the owner's words)

"The base and top of the shell still have this distortion/dithering issue." Best seen **from above at medium distance**: 300 to 700 m away, 30 to
60 degrees down. The middle of the shaft looks right; the **skirt** (the flared foot, y 0 to 25 m: the lobby's sloping glass, its portals'
canopies, the root fins) and the **lamp** (the disc at y 222 to 234 m, the dome and needle over it) break up: ragged, speckled, smeared,
changing as the camera moves. Compare with the real building (the hero) from the same camera: the difference is the bug.

## What a shell is

A **baked shell** (`KSHELL`, a prototype of `core/shell`) stands for a tower past 300 m. It is a low cage (56 triangles for the Spindle: an
octagonal stack of frustums) whose fragment shader ray-marches heightfield maps baked from the real building at load:

- **side map** (polar mode, the Spindle): for each (angle, height) the radius of the outermost surface. Box mode (the Ledger): depth in from each face.
- **top map**: seen from straight above, for each (x, z) the height of the highest surface (a roof is a real surface).
- **bottom map**: seen from below, colour only, clipped at the lamp's neck (`rec.soffit`); used for soffits.

Each map is three RGBA8 2048 atlases: **A** colour (sRGB) + coverage; **B** normal (xyz) + the height or radius in **alpha**; **C** roughness,
metalness, window mask. In B's alpha: the side map stores `r / frame.a` (polar); the top and bottom maps store `0.1 + 0.9 * y / H` (0 = empty).
These are **8 bits**: on the Spindle (H = 262 m) one level of the top map is about 1.14 m; one level of the side map is about 0.22 m.
Texel: 0.33 m (intact and gutted), 0.5 m for the five ruin states past gutted.

## The code

- `src/43-mp-shell.js` [G data]: `KSHELL.record` (cage, map sizes, frame), `KSHELL.slots`, `KSHELL.pack` (shelf packing, 8 px gutters).
- `src/60-mp-shell-host.js` [draw]: the bake (`BV`, `BF` shaders: polar unwrap in three wrap passes with a seam discard; orthographic faces;
  the hull passes) and the draw (`DM` vertex, `DF` fragment: `mpGap`, `mpIn`, `mpFlat`, `mpTrace`), `KSHELL.material` (a patched
  MeshStandardMaterial), `KSHELL.draw` (instanced cages with per-instance slot, frame, top and bottom slot attributes).
- The trace (`mpTrace`): from the cage surface toward the eye's ray, relaxed sphere tracing by the side gap (`max(g*.85, mn)`), limited over a roof by
  the top map's height, 32 steps (`MP_STEPS`); a hit is bisected back to the surface (5 halvings); then the colour branch: the top map's
  colour on a real roof (normal up, and air 1.2 m above in the side map or the top map flat 1.5 m all round), the bottom map's on a soffit, else
  the side map's. `mpLod` is the distance's mip level; `mpGeo = mpLod - 1` is used for the shape reads; colour reads at `mpLod - .75` plus up to
  1.25 more on faces seen edge-on.
- `src/70-mp-stage.js` [web]: what stands where; `MPS.tiersTick` (heroes under 300 m, shells to 1.4 km and to 3.2 km when seen steeply, impostors
  past that). `src/52-mp-hero-spindle.js` is the real building the bake is made from.

## How to see it

1. `python3 tools/build.py kits/metropolis`, then serve `kits/metropolis/dist` (the launch config `metropolis` in `.claude/launch.json` serves it
   on port 8796) and open `metropolis.html?pitch=140`. If the page was loaded in a hidden tab it may not boot: run `MPS.boot()` in the console.
2. In the console: `window._api.go('Shell alone at 300 m'); camera.fov=20; camera.updateProjectionMatrix(); window._api.setView(260,420,260, 0,30,0)`
   (the skirt), or `setView(260,420,260, 0,225,0)` (the lamp). `camera.fov=8` magnifies; the trace's pixel size follows it every frame.
3. The hero for comparison: `window._api.go('Hero alone at 300 m')` and the same `setView`.
4. Both at once, the shell painted red, so any red that shows is where the shell differs from the hero:
   ```js
   window.__patch=function(pairs){const m=MPS.mat;if(!m.__ob)m.__ob=m.onBeforeCompile;m.onBeforeCompile=function(sh,r){m.__ob.call(this,sh,r);
    for(const [a,b] of pairs)sh.fragmentShader=sh.fragmentShader.split(a).join(b);};const key='kp'+Math.random();m.customProgramCacheKey=()=>key;m.needsUpdate=true;};
   __patch([['gl_FragColor=vec4(mpBr==1.0?1.0:0.0,mpBr==2.0?1.0:0.0,mpBr==0.0?0.6:0.0,1.0);','gl_FragColor=vec4(1.0,0.0,0.0,1.0);']]);
   MPS.mat.userData.U.uDbg.value=4; mpClear(); mpHero('spindle.intact',0,0,0); mpShells([['spindle.intact',0,0,0]]);
   ```
   (The shell writes the cage's depth, not the hit's, so it hides the hero inside its cage; the outline comparison is what counts.)
5. Debug views: `MPS.mat.userData.U.uDbg.value` = 1 albedo, 2 normal, 3 roughness/metal/window, 4 the branch (red top map, green bottom map,
   blue side map), 0 off. `__patch` above swaps the branch view for anything else (the hit's height, radius, `mpLod`...).
6. Reading the maps: `renderer.readRenderTargetPixels(MPS.atlas.B, px, py, 1, 1, buf)`; slots in `MPS.slot['spindle.intact']`,
   `['spindle.intact.top']`, `['spindle.intact.bot']`; frame in `MPS.rec['spindle.intact'].frame` (`a` the radius scale, `H` the height).

## What has been found and fixed (do not undo)

- A side map was read up to its slot's edge, where the filter blended in the empty gutter: at the foot the radius fell from 46 m to a third.
  Reads now stay half a texel (at their mip) inside the slot (`hv` in `mpGap`). The overlay test above now covers the skirt.
- A descending ray steps no further than 5 cm over the ground; the step's limit over a roof also reads the top map's sharp texel (at an edge
  the blurred one read empty and the ray stepped by the side gap past a curb).
- The lobby's reveal floor is a 0.45 m curb (a floor at the ground has no height in a side map).
- The top map's height encoding moved from `0.02 + 0.98 y/H` to `0.1 + 0.9 y/H` (the ground sat on the empty threshold).
- Tried and reverted: treating anything just under a top-map surface as solid, whatever the side map says. Up the shaft the top map holds every
  window sill, so it painted sills everywhere; limited to the ground, it changed nothing visible, and a debug view of its hits was contradictory.

## Hypotheses to test (none confirmed)

1. **8-bit heights.** The top map's 1.14 m levels make `ty` jump between neighbouring texels, so the roof test (`p.y > ty - 1.5 ey`) and the
   step limit flip pixel to pixel on sloped tops (the skirt's flare, the lamp's dome). A 16-bit height (two channels, or a float target) would show it.
2. **Several roots in one bisection.** On thin horizontal plates (the lamp's disc, 12 m; the skirt's tiers and reveals) a step can cross a
   surface and back; bisection between the last outside point and the first inside one can land on the wrong one.
3. **One-row ledges.** A ledge (a reveal, a hoop, the disc's rim) is one row of the side map; with linear filtering between rows the radius
   slopes across it, so grazing rays from above see a smeared band. The bake already gives a side map's ledges the wall's normal (`BF`).
4. **Mips at the slot.** `mpGeo` reads the shape one mip under the colour; at the top and bottom of a slot the mips still blend the gutter.
5. **The branch switch.** The top map's colour applies only where the side map shows air 1.2 m above (3.5 m until 2026-11-03) or the top map is flat 1.5 m round; on the
   skirt's narrow tiers and the lamp's sloped dome that test may flip pixel to pixel (view 4 shows it).
6. **The fins** (three radial blades, 2.2 m thick) are three texels wide in angle: the filter draws each as a wedge. Known; may be part of the "spines".

## What to deliver

A short diagnosis (the cause, with the debug views or numbers that show it) in this file under a new heading, and either the fix in `src/`
(rebuilt, `node kits/metropolis/tests/test-metropolis.js` passing, `python3 tools/test_all.py --no-build` clean for this build) or a proposal
the owner can choose from. Pictures of before and after from the same camera. GPU work on this machine takes the lock
(`tools/harness.py`); see `CLAUDE.md` for the heartbeat rule.
