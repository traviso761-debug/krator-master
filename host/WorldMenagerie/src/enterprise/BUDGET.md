# Enterprise: the performance budget

What `/enterprise` costs in its busiest places, measured on 2026-11-14, and the ceilings it is held to. The numbers
and ceilings are in `tests/budget/enterprise.json`; `tools/enterprise-budget.py` measures them again and fails when
any is over. It takes about five minutes and its numbers belong to the machine they were measured on, so it is not
part of `tools/test-pages.py`. Run it after a change to anything drawn every frame, and `--save` only after a change
that is meant to move them.

## The machine

The probe ran on a **Snapdragon X1 laptop** (8 Oryon cores, aarch64, Linux 6.17). WebGL said its GPU was
**"Adreno (TM) X1-45, or similar"**. It is not the Intel Arc 140T or the RTX 5060 named in the Krator harness's GPU
lanes: those are another machine's, and this probe (`tools/probe.py`, headless Firefox) does not go through those
lanes. Run the script on that machine and `--save` there to get a budget for it.

- Headless Firefox, the window asked for at 1600 x 900, a **1366 x 682** canvas at a device pixel ratio of 1.
- Frames **uncapped** (`probe.py --uncapped`, `layout.frame_rate=0`). With the display's 60 Hz in the way every view
  reads 17 ms and nothing can be compared. Uncapped, the time between frames is what a frame costs: the scripts, the
  render and the wait for the GPU.
- Firefox gives `performance.now()` to the millisecond, so the frame times are whole milliseconds.
- One probe at a time. Probes side by side share the GPU and the cores and slow each other down.
- Each view three times, and the median of the three runs' p50 and p95 kept (each run's p50 and p95 are over its
  last 120 frames).

**A phone could not be measured here.** No phone is attached, and headless Firefox on a laptop is not a phone: its
GPU, its thermal limits and its pixel ratio (2 to 3, so four to nine times the pixels) are all different. The views
most likely to miss 60 Hz on one are those where the planets fill the screen (see below). That is still to be done.
Measure it with remote debugging, a page at these hashes, and the frame counter.

## The views and the numbers

| View | Hash | p50 ms | p95 ms | Draw calls | Ceilings (p50 / p95 / calls) |
|---|---|---|---|---|---|
| The ship alone, the turntable (the floor) | `v=0.85,0.2,760` | 5 | 6 | 90 | 7.2 / 9.0 / 108 |
| Home starbase close, with its traffic, workbees and berthed ships, the planet behind | `v=2.6,0.2,2200,9500,0,4900` | 12 | 14 | 259 | 16.0 / 16.7 / 302 |
| The home world filling half the view, the starbase in front | `v=2.6,0.2,9000,9500,0,4900` | 11 | 14 | 237 | 14.8 / 16.7 / 277 |
| The swarm fight at the ring, the test captain fighting (12 s in) | `at=relic&mission=swarm&mauto&mseed=1` | 6 | 10 | 148 | 8.5 / 14.0 / 175 |
| At warp 9 on the way to the black hole (12 s in) | `fly&course=hole&warpf=9&dbg` | 6 | 8 | 108 | 8.5 / 11.5 / 129 |

Triangles: 504,000 with the ship and her effects in view, 320,000 at the starbase (the ship is out of the frustum).
About 15 to 23 shader programs.

How the views are checked: the fight run must be on the swarm orders' fighting step when it is measured, and the warp
run at warp. A run that is somewhere else counts as a failure, not as a number.

**What costs the most.** Not the fight, and not the hull. The worst views are those where a **planet** fills much of
the screen. Its surface and cloud deck are worked out per pixel from several octaves of 3D noise (`planets.js`), and
at 11 to 12 ms they take about twice what the swarm fight does. The starbase's 259 draw calls come second. A phone
at three times the pixels will feel this first, so it is the place to work if one misses: fewer octaves with
distance, or the planet baked to a cube map once and only the terminator, the lights and the clouds kept live.

## The budget to hold

- **Every view's p95 under 16.7 ms**, a 60 Hz display's frame, on this machine (`ceilingP95`; checked on every view
  whatever its own ceilings say).
- **Each view's own ceilings**: p50 and p95 at most 1.25 times what was measured plus 1 ms (p50) or 1.5 ms (p95),
  and draw calls at most 1.15 times plus 5. Frame times move by a millisecond or two between runs. A draw-call count
  moves only when something is added, so a breach of it is worth a look even when the frame times are fine.
- **Loads** (ms until the loading screen is gone, median of two pairs on fresh profiles): a first visit 2,722 ms
  (ceiling 3,840), a second visit 1,732 ms (ceiling 2,550). The second visit must also read every hull texture back
  from IndexedDB (`window._details.skins.from`), or it fails whatever the time.

## Loading (Q6), measured the same way

| | First visit | Second visit |
|---|---|---|
| Before (painted on the main thread) | 4,300 to 4,520 ms | 3,700 to 3,800 ms |
| After (workers, then IndexedDB) | 2,700 to 2,770 ms | 1,470 to 1,780 ms |

Before, the `hull` stage took 2,700 ms, 2,200 to 2,350 of them painting the textures: the saucer's top 2048
square and underside 1536 square together 1,200 ms, the engineering hull 500, the neck and the nacelle 250 each, the
pylon and the rim 50 each. Now seven workers paint in parallel (the slowest, the saucer's top, 720 ms) while the page
reads its config and hangs the stars, and the `hull` stage is 450 to 550 ms. A second visit reads the 88 MB back in
about 380 ms. What is left is the first frame, about 400 ms of compiling shaders and uploading textures (the
browser's own shader cache is the only help for that), and the boot.
