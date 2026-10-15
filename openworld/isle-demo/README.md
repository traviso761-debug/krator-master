# Isle Demo: the Ring Sea isles at 1:1

The isle demo's region (`settlements/isle-demo/PLAN.md`, P3) is the archipelago the owner marked "isle demo" on the
**Krator Scale Model** (https://claude.ai/artifact/N76KxfMXL5C7hfRGHKJK5q). The page shows it at full scale, on the open
world's machinery.
- **The region:** the owner's "isle demo" polygon, plus two more areas the owner drew on 2026-10-15: the west isles and
  the north-east isles (`source/added-areas.json`). Their union is about **31,800 km2**, of which about **11,800 km2** is
  land. The box is map pixels x 616 to 732, y 352 to 498 (2 km a pixel), about 234 x 294 km. The data is from scale model
  **4.21**.
- **The isles:** they lie in the Ring Sea at -1,500 m, about 1.9 atm. The land is hypertropic jungle, rainforest,
  monsoon forest, savanna, hot steppe and salt steppe.
- **On the map:** two towns, **Kautoa** (the city, Af) and **Walapo** (the village, XA), sixteen geyser vents and one
  short named river (Są Baatar).
- **Built output:** `dist/isle-demo.html`.
- **Build:** `python3 build.py`.
- **Verify:** `python3 verify.py dist/isle-demo.html --assert --views 0,1,14`. Use `--list` to print the views.

## How it is made

The world is **openworld/little-demo's, read in place** (its `src/`, not copied): the fields, terrain, water, sky,
nursery, flora, floor, places, towns, camera and probe, and its head with this region's title swapped in. This build adds
only what is the region's own:

| Fragment | What |
|---|---|
| `43-world-isles.js` | **[G data]** the fields the Ring Sea isles kit reads that the world does not make. **The climate classes as weights:** `koppen:XA` to `koppen:XS`, five map pixels round a warped point. **The coast:** `beach`, `dune`, `mangal`, `lagoon`, `reef`, `bench` and `pan`, from the height over the water, the depth and the slope. **The rest:** `garden`, 0 until the towns are laid out, and `floor`, the thermal ground round each vent. It wraps `WORLD.at` and `WORLD.fieldsFrom`, so every sample carries them. |
| `46-world-config.js` | **[G data]** the region's settings the world reads: the towns built here, the "Go to" order, the archipelago's views and one per geyser vent. little-demo has its own (`46-world-config.js`). |
| `47-world-kits.js` | **[G data]** the kit registry: empty until the flora step |

Its data comes from `tools/scale-model/extract_region.py`. The scale model's two collections were read on 2026-10-15
and saved in `source/` (64 regions, 97 settlements). To refresh:

```
python3 tools/scale-model/extract_region.py <page.html> openworld/isle-demo/source/regions.json openworld/isle-demo/source/settlements.json "isle demo" openworld/isle-demo/data --add openworld/isle-demo/source/added-areas.json
```

`--add` takes the extra polygons (map pixels, as the world's polygon tool copies them) and cuts the union. The owner's
"isle demo" polygon on the scale model is unchanged; redrawing it there to take them in would make `--add` unneeded.

## Where it stands (2026-10-15)

**P3a is done.**
- **What the page shows:** the land and the sea at 1:1, the two towns marked, the vents in "Go to", and the isle fields
  on every sample.
- **The world's checks:** the land is continuous, and the drawn terrain has no NaN.
- **The isle's checks:** the fields at both towns, the class weights summing to 1 on land and 0 at sea, the towns on land
  in the climate the assay found, and the thermal ground at every vent. Each check has a negative control.
- **Not applicable yet:** the world's flora, river and highway checks. The region has no kit, river or highway yet.

**Next, P3b:**
- **The flora.** The Ring Sea isles kit joins the world, with the kits it borrows from.
  - Every species it places, the borrowed ones too, has to become a growable prototype with a pass table.
  - The world's mask has to admit shallow water for the lagoon's and the reef's passes.
- **The coast as terrain.** A fringing reef, lagoons and mangrove bays have to be drawn into the shore: the scale
  model's 4 km grid only gives the shore's slope.
- **The geyser fields.** The geyser kit builds one at each vent, through `GEYSER.cluster`.

See `KNOWN_ISSUES.md`.
