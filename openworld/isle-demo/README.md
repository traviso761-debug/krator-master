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

## The hamlets (core/hamlet, 2026-10-19)

Four resource villages stand in the world, sited and laid out at load from `src/48-world-hamlets.js` (`[G data]`: the
specs, the resource found in each patch, the ground rule) and drawn by `src/88h-world-hamlets.js` (`[web]`): the salt
village on the north-west pan, the iron mine in Valapo's mountains, the lumber village east of Kautoa, the ranch to its
north (`core/hamlet/PLAN.md` section 4).
- **The buildings** are the Islanders' and the Beast Riders' own pieces, from the city page's bundles
  (`settlements/isle-demo/bundles.py`) and its shared instancer (`settlements/isle-demo/src/58-isle-protos.js`): full
  pieces within 3.5 km of the camera, massing out to 30 km.
- **The lanes and greens** are ribbons on the ground. The flora and the floor keep off them (`WORLD.clearHook`).
- **The world clock:** `core/clock`, the 72-minute day, as every settlement runs (`HOST.clock`; `?hour=`, `?day=`,
  `?time=run`). The lumber village's felling reads it: stumps, saplings and grown trees by the day.
- **`window._hamlets`** holds the villages, resources, counts and the tag audit. `verify.py` checks them, with a negative.

## The towns (M7, 2026-10-20)

Kautoa and Valapo are planned on this page at load, exactly as the city page plans them (`src/48t-world-towns.js`,
`[G data]`: `settlements/isle-demo/src` 15-50 read in place, the same site file and kits' boxes, the same ground; their
lots and records hash the same as the city page's), then the world's land takes each town's ground inside its square
(`WORLD.landHook`, easing back over 150 m) and both towns are declared on core/simulation. `src/88t-world-towns.js`
(`[web]`) draws them with the city page's own drawing (`60-isle-draw.js`, read in place as a factory over each town's
group, at the town's frame): every lot as massing out to 30 km, the lots near the camera in full once it is over a
town's square, the streets, orchards, footings, compound walls and vessels; the flora and floor keep off the lots,
streets, fields and paved squares (`WORLD.clearHook`, after the hamlets'). The town under the camera runs presented,
the other abstract (`ISLE.simWatch`); the sim is declared and held, not yet run on the world's clock.

- **The export profile is kept here now** (moved from the city page): `verify.py --assert` checks Kautoa's ceremonial
  centre (box 320,780,820,1220 in the town's frame) under the isle profile. The export is one town at a time, in that
  town's frame: `?town=Kautoa` (the default) or `Valapo` picks it and starts the camera over it, `?simAt=minute` runs the
  sim first. The city page's contributors (`62-isle-export-scene.js`, read in place as a factory) read the town's group
  moved to the origin; the city section is that town's plan alone; the stage is the world's (its ground's look moved
  into the town's frame). At minute 362 the case equals the city page's section by section (registry, fixtures,
  terrain, the plan, every sim key; items and buckets but for the Islanders' UV scale: `KNOWN_ISSUES.md`), so
  `godot/data/world-isle-kautoa` stays valid.
- **`window._isleTowns`** holds the towns' census, plan checks, draw counts and errors; `exportTown(name)` switches the
  export. `verify.py` checks the plans, the ground and the keep-clear, each with a negative.
- Load: planning adds about 7 s (Kautoa 4.7, Valapo 2.0) and the sim's declare 2.3 s.

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
