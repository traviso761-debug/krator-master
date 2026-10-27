# biomes/swhighlands: performance (station 1, 2026-10-26)

**GPU: the integrated Intel Arc 140T** (Chrome's ANGLE, Direct3D 11), the app's built-in browser, a 1100 x 700 canvas at pixel
ratio 1. Other sessions were running: timings swing about 25%.

**How.** A GPU timer query (`EXT_disjoint_timer_query_webgl2`) around each `renderer.render(scene, camera)` of the host's own
frame loop (the shared sky's pass not included), for ~1.4 s at each preset view after a 0.7 s settle; the **minimum** of the frames
is kept (`n` frames read). Calls and triangles are `renderer.info` of the same frames. The page as committed: `BIO.INDEX_ITEMS`,
`BIO.LOD.merge` (minTris 1500), the dithered fade (.15) and the per-instance cull on; heroes to 800 m (full to 450 m), octahedral
impostors beyond; the floor to 420 m, the bald's plants to 700 m.

| View | GPU ms (min) | Calls | Triangles | Frames |
|---|---|---|---|---|
| Overview from the arch ridge | 27.2 | 69 | 8.57 M | 12 |
| The arch | 33.8 | 56 | 8.29 M | 9 |
| The bald and its pillar cap | 14.1 | 55 | 7.31 M | 23 |
| Under the pillar cap | 1.4* | 46 | 4.66 M | 20 |
| The last farm from the bald | 17.5 | 63 | 8.22 M | 16 |
| In the cove | 13.0 | 49 | 7.25 M | 15 |
| Night: the cove | 13.4 | 49 | 7.25 M | 21 |
| A lattice oak | 8.1 | 42 | 4.49 M | 13 |
| Bead cones | 13.3 | 46 | 6.55 M | 12 |
| The river cave | 15.3 | 49 | 6.30 M | 22 |
| The gorge and its bridges | 2.0* | 58 | 6.58 M | 9 |
| The water gap | 12.5 | 44 | 4.49 M | 23 |
| The fold river | 17.0 | 54 | 8.10 M | 11 |
| Dawn: mist in the valley | 24.7 | 52 | 6.31 M | 5 |

\* Too low for the triangles drawn: most likely a frame read while the view was still settling (the minimum of a short window),
not a real cost. Remeasure those two with a longer window before quoting them.

**Held in memory** (verify.py `--assert`): 11.8 M scene triangles (budget 30 M), the trees' pass 10.8 M, the floor 0.98 M; 264 k
baked instances, 140 bake calls, 139 LOD chunk meshes. Build ~10 s in the browser on this laptop (the field's bake 0.7-0.9 s,
trees 1-2.3 s, floor 2.2 s, bake 1.3-2.6 s, ground 1.6 s).

**The impostors' gain** (`SWHI_IMP_GAIN`, 88-host-build.js): the overview, fog off, a black background, the mean colour of the
hero crowns' pixels against the impostor stand-ins' at the same places: heroes (64, 101, 39); impostors at gain 1 (25, 89, 24), 1.4
(41, 105, 35), 1.7 (51, 115, 42), 2.0 (60, 123, 48), 3.6 (98, 150, 76, nhighlands' value). 1.6 matches the heroes' luminance; the
impostors cover about a tenth of the pixels the heroes do (they read thinner, as on nhighlands: HANDOFF-REBUILD.md).

**Where the cost is.** The views are vertex-bound like nhighlands': the lattice oaks' cords (tubes in the `swcord` bucket) and the
floor's cards. The levers not taken yet: the oaks' light form (lv 1, 450-800 m) could drop to impostors from 600 m; the parasol
fruit (58 k instances) could stop at 250 m; the moss and turf bands could end at 300 m.

## Station 6, the treeline (2026-10-27)

**GPU: the integrated Intel Arc 140T**, the app's built-in browser, a 1177 x 1026 canvas, other sessions running. The same GPU timer
query around the host loop's scene render, ~2.5 s at each view after a 0.9 s settle: the **minimum** and the **median** of the frames.

| View | GPU ms min | median | Calls | Triangles | Frames |
|---|---|---|---|---|---|
| Overview up the ramp | 18.1 | 35.0 | 37 | 3.08 M | 27 |
| A whorl column | 8.1 | 8.6 | 31 | 3.04 M | 35 |
| Bottle brushes on a sunny spur | 6.5 | 6.8 | 23 | 2.32 M | 37 |
| The treeline | 16.6 | 35.5 | 33 | 6.22 M | 28 |
| Glass towers on the scree | 12.4 | 29.6 | 16 | 5.50 M | 27 |
| The cirque | 18.5 | 52.3 | 31 | 8.41 M | 23 |
| Dawn over the woods | 11.3 | 25.1 | 33 | 3.37 M | 31 |
| Night: the treeline | 20.7 | 38.3 | 43 | 9.25 M | 16 |

Held: ~14 M scene triangles, 515 k instances (most of them the floor: 139 k turf, 95 k glass leaf, 65 k stones, 52 k moss). The
cirque and the night view are the heaviest (the fellfield's stones and glass leaf to 700 m). The impostor gain is station 1's (1.6),
not measured here.
