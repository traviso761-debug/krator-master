# The north basin: data for the open world (2026-10-20)

The scale model's north basin, cut out for the open world that will test overlays over two biomes
(`biomes/nsemiarid/PLAN.md`, section 9, step 6). **Not a build yet:** `data/` is ready for one; no `src/` or `build.py`.

- **The cut:** the biome region "n semiarid" plus three added areas (`source/added-areas.json`): the owner's `floodzone`
  region, and the convex hulls of the east dam lake at 1,050 m (half its bed is in Korona) and of the flood lake at ~834 m
  round the trough (most of it in the NW lowlands). Box px 244..716 x 36..316, 2 km a pixel.
- **The source:** scale model **4.21**; `source/regions.json` and `source/settlements.json` are the artifact's two
  collections read on 2026-10-20 (68 regions, 90 settlements). Jimjam is a settlement there now (px 474, 220).
- **What `data/` holds:** what `tools/scale-model/extract_region.py` writes for every cut (`openworld/little-demo/README.md`),
  plus the two layers of the north basin:
  - `overlay.png` and `region.json` `overlays`: `dam`, `dam 2` (the dam basins overlay) and `floodzone` (the scablands),
    one bit each, as drawn. They are not in `biome.png`.
  - `palaeo.png` and `region.json` `palaeo`: the east dam lake (1,050 m, sill 850 m), the west dam lake (900 m, sill 700 m)
    and the flood lake (833.6 m, from the trough's 429.8 m), one bit each on the height grid; their remnant lakes today;
    the water over and under each sill; the dams; the two breach courses with their beds.

To refresh: read the scale model page (`Artifact` read), list its `regions` and `settlements` collections into
`source/` (one JSON list each, each document with its `id`), then

```
python3 tools/scale-model/extract_region.py <page.html> openworld/north-basin/source/regions.json \
  openworld/north-basin/source/settlements.json "n semiarid" openworld/north-basin/data \
  --add openworld/north-basin/source/added-areas.json
```
