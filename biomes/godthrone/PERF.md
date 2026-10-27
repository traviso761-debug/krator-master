# godthrone: frame time, calls and triangles (station 1, the summit vent)

Measured 2026-10-26 on the owner's laptop, **in headless Chrome on the integrated Intel Arc 140T** (ANGLE, Direct3D 11:
`WEBGL_debug_renderer_info`), 1024x768, with `KRATOR_GL=gpu` under the GPU lock. The script is `perf.py` (beside this file):

```
KRATOR_GL=gpu python3 perf.py dist/godthrone.html --frames 16 [--query ?lodcull=0]
```

Per view it draws the page as the page does (the shared sky's pass, then the world) and times it two ways: the GPU timer
(`EXT_disjoint_timer_query_webgl2`) and the SYNC time (the draw plus a one-pixel readback, which waits for the GPU). Headless
Chrome often returns no timer result (blank below), so the sync time is the number to read. Other sessions were running:
the times swing 25-50%, so each figure is the **minimum over two runs of 16 frames**.

| View | Draw calls | Triangles | Sync ms (min) | GPU ms (min) |
|---|---:|---:|---:|---:|
| The summit vent | 34 | 2.88 M | 19.6 | |
| The throat | 24 | 2.73 M | 13.7 | 13.8 |
| The pit from its rim | 24 | 2.30 M | 24.0 | |
| The caldera wall | 28 | 2.30 M | 13.8 | 11.5 |
| The terraces | 21 | 2.34 M | 14.3 | 12.7 |
| The sealed portal | 18 | 2.16 M | 12.4 | 10.9 |
| From the rim | 19 | 2.24 M | 13.4 | 11.6 |
| The halo | 30 | 2.72 M | 15.0 | 13.1 |
| Pele's hair | 18 | 2.65 M | 11.6 | 10.6 |
| Night, the vent | 33 | 2.87 M | 19.8 | 23.2 |
| Dawn, the wall | 28 | 2.23 M | 15.4 | 21.3 |
| Overview | 16 | 2.06 M | 25.6 | |
| The black sky | 31 | 2.25 M | 14.6 | 13.6 |

(The night view was moved higher after these runs, to see into the crater; its numbers are from the lower camera.)

## Where the frame goes

- **The ground is most of it.** The field's mesh is 961 x 961 vertices (10 m) less the inset's hole, 1.84 M triangles, plus
  the vent's inset (2.5 m, 68 k) and the far country's lattice (~0.1 M): about 2.0 M of the 2.1-2.9 M triangles every view
  draws. Its material is the heaviest on the page (standard, KGROUND's two `sand` layers and two plain layers, KSTRATA's
  `strataColor` on every steep pixel, KHORIZON, the cloud shade).
- **The loose stuff is small.** 194 k instances (talus 29 k, stones 114 k, hair 45 k, bombs and spatter 5 k), welded
  (`BIO.INDEX_ITEMS`), merged per chunk (147 LOD meshes, `minTris` 1500), faded and culled at their ranges (320-3200 m):
  0.1-0.9 M triangles a view. **The per-instance cull** (`?lodcull=0` to compare) **moved nothing measurable here** (A/B,
  two runs each, within the noise): the instanced share is too small for it to show; it is on as GRAPHIC-LOAD.md says.
- **Draw calls are not the limit**: 16-35 a view.
- **The overview and the pit's rim** (25 ms) look across the whole map at once: the ground's every pixel takes the full
  material.

## Levers not taken (for the owner or the next pass)

- A coarser ground away from the views' places: the field's mesh at 20 m beyond ~2 km of the spine (a quarter of its
  triangles), the far lattice taking the rest; or chunked ground with the LOD of the biome core. Not taken: the walls need
  the 10 m lattice wherever they are seen from, and the page is at 12-26 ms on the integrated GPU.
- KGROUND's distance scale (`far`) already halves the layers' detail past 60 m; the `sand` kind's ripples and glints fade
  out past ~70 m on their own.
- Impostors: nothing tall stands at the summit (GRAPHIC-LOAD.md).

## Build time

On the same machine: the field (the closure on 0.92 M points, the ledge pass, the vent's inset) ~2.6 s, the fields' 20 m cache
and the kit ~0.9 s, the bake 0.1 s, the ground (paint, meshes, KHORIZON) ~1.6 s: about 5 s before the first frame
(`window._phases`).
