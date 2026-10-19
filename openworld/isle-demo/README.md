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
- **On the map:** two towns, **Kautoa** (the city, Af) and **Valapo** (the village, XA), sixteen geyser vents and one
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
| `43-world-isles.js` | **[G data]** the fields the Ring Sea isles kit reads that the world does not make, the ground's colour and the coast as terrain. **The climate classes as weights:** `koppen:XA` to `koppen:XS`, five map pixels round a warped point. **The coast:** `beach`, `dune`, `mangal`, `lagoon`, `reef`, `bench` and `pan`, from the height over the water, the depth and the slope. **The rest:** `garden`, 0 until the towns are laid out, and `floor`, the thermal ground round each vent. It wraps `WORLD.at` and `WORLD.fieldsFrom`, so every sample carries them. **The ground's colour** (`WORLD.ground`, wrapped): on land by climate class (forest loam, savanna, steppe, salt, beach sand, mangrove mud); under the sea by depth (turquoise to blue), so the sea reads as sea at any height. **The coast** (`WORLD.landHook`): a lagoon, a reef crest with passes and a fore reef reshaped from the shelf's depth, and mangrove flats on the wet classes' low shores. `WORLD.kitW` is 1 for every kit entry. |
| `46-world-config.js` | **[G data]** the region's settings the world reads: the towns built here, the "Go to" order, the archipelago's views and one per geyser vent. little-demo has its own (`46-world-config.js`). |
| `47-world-kits.js` | **[G data]** the kit registry. One kit grows here, the Ring Sea isles (`biomes/ringisles`), but it grows its borrowed trees in their lenders' registries, so it has one entry per registry (`RINGISLES.world()`): ringisles, throne, swbay, eastabyss, sedesert. Only the isles kit lays a floor (`RINGISLES.WORLD_FLOOR`). The nursery's field profile defaults the isle fields to 0. |

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

**P3b is done (2026-10-15):**
- **The isles' flora grows in the world:** about 245,000 records near Kautoa, with the borrowed trees grown in their own registries. The world's own checks pass: order-free seeding, nothing rooted in water, spacing across tiles.
- **The sea at every height:** the ground under the sea is coloured by its depth.
- **The ground by climate class**, and **the coast as terrain:** a lagoon, a reef crest and mangrove flats, with a fourth isle check and its negative.

- **The water's flora:** seagrass meadows in the lagoon and coral heads in the lagoon and on the reef. They are two more species in the isles kit's own entry, placed by `inWater` passes with depth windows and grown by `RINGISLES.waterPlant`.
- **The texture packs:** the six kits' library packs ride beside the page as `isle-demo.tex.<kit>.js` sidecars (`dist/`, about 21 MB), so the flora is textured, not white.
- **The geyser fields** (`src/89-world-geysers.js`):
  - **At start:** the 14 geyser vents' clusters (`GEYSER.cluster`, r 380 m) are merged and laid once. Their relief joins the height through `WORLD.landHook`, after the coast's. The ground is painted from `GEYSER.at`: sinter, the mats' bands by temperature, acid clay, mud and the dead fringe.
  - **When the camera comes within 2.6 km of a vent:** the sinter and the show are built (once), then that site's trees and floor, harvested into one group. One site is built a frame, about 0.9 M triangles and 2 s.
  - The scale model's two vents without a kind (radius 1.6) are not geyser vents. The fields and "Go to" skip them.

**P3b's checks (2026-10-15, browser pane):**
- **Every applicable world check passes at Kautoa** (184,306 records): order-free seeding, the land continuous, nothing rooted in water, spacing across tiles, the river, nothing on a road or in a town, and no NaN.
- **The highway check is n/a:** the region has no roads.
- **The isle's four checks pass**, and each negative is caught.
- **Geyser site 1 builds without an error.**

See `KNOWN_ISSUES.md`.
