# Little Demo: the eastern desert at 1:1

The first piece of the open world (`biomes/WORLD.md`, `GODOT-PLAN.md` milestone M7): the region the owner marked
"little demo" on the **Krator Scale Model** (https://claude.ai/artifact/N76KxfMXL5C7hfRGHKJK5q), at full scale, with
the biome kits' own flora placed by climate and streamed by distance.

- **The region:** map pixels x 623 to 1164, y 207 to 893 (2 km a pixel): about **1,080 x 1,370 km, 1.3 million
  km²**. The data is from scale model **4.19** (`tools/scale-model/README.md`: the abyss's escarpment, the valley of
  Yuni and its river, the lakes fixed, rain and climate recomputed). It holds the eastern high desert, the eastern abyss, the hyperjungle's eastern half, the eastern badlands
  up to the outer rim, the eastern highlands, part of Korona and the Ring Sea's eastern shore.
- **Built output:** `dist/little-demo.html` (one page, about 1.3 MB; three.js r128 from the CDN).
- **Build:** `python3 build.py`. **Verify:** `python3 verify.py dist/little-demo.html --assert --views 2,4,8`
  (`--list` prints the views).

## Where the data comes from

`data/` is written by `tools/scale-model/extract_region.py` from the scale model page and its two database
collections. `source/regions.json` and `source/settlements.json` are the collections as they were read on 2026-10-05
(58 regions, 100 settlements). To refresh after the owner edits the scale model:

1. Read the artifact (`Artifact` read) and save its page; export the `regions` and `settlements` collections
   (`ArtifactData` list with `out_dir`) into `source/` as one JSON list each (each document with its `id`).
2. `python3 tools/scale-model/extract_region.py <page.html> source/regions.json source/settlements.json "little demo" data`
3. `python3 build.py`

What the extractor does: crops every raster to the polygon's box plus 20 km; rasterizes the **biome** overlays (the
`biome` layer, plus `e highlands` from the geographic layer, which the owner names as a biome to make); where overlays
overlap the smaller one wins; every pixel no overlay covers takes **the nearest overlay** (pixel distance, as asked);
traces the **drainage network** on the heights (priority-flood, D8, accumulated rain with a 150 mm floor, 444
channels); lists the **settlements** inside the polygon; and finds each ruin's **canyon candidates** (troughs in the
heights at least 120 m deep one cell out and 150 m two cells out). Veladiga's nearest is 5.9 km south of its marker:
an east-west canyon about 860 m deep (1,130 m at 8 km) cut into the plateau's edge.

## How the world is made

| Fragment | What |
|---|---|
| `41-world-fields.js` | **[G data]** the land, the water, the climate and the biome blend as plain maths of (x,z) |
| `45-world-host.js` | the renderer, the light, and the biome core's binding (field sources: world, tile grid, nursery) |
| `47-world-kits.js` | **the kit registry**: which kits grow here, on which overlay, their LOD reach, their floor profiles |
| kits | `biomes/sedesert`, `biomes/eastabyss`, `biomes/hyperjungle`, read in place, each as one block |
| `core/atmos` | the shared wave field (`89-atmos-0-core`, `0p-presets`, `a-waves`) the water reads |
| `80-world-sky.js` | the standard Krator sky (from sedesert's), riding with the camera, its painted horizon removed |
| `81-world-terrain.js` | the quadtree terrain: 64 x 64 chunks from 2,000 km down to 128 m (2 m vertices) |
| `83-world-water.js` | the sea and the lakes as sheets per chunk, drawn with the shared wave field |
| `84-world-nursery.js` | each species' variants grown by its kit, harvested into instanceable prototypes |
| `85-world-flora.js` | placement records per 512 m tile (cell-seeded, from the kits' pass tables), drawn as instances |
| `86-world-floor.js` | the kits' floor plants and rocks, tiled from 32 m patches onto the near chunks |
| `87-world-places.js` | the scale model's settlements and canyon candidates, marked |
| `90-world-camera.js` | fly and walk, Go to, the minimap, the inspector and the polygon tool |
| `91-world-probe.js` | `window._api` for `verify.py` |

**The land.** The scale model's heights are a 4 km grid. `WORLD.H` interpolates them (Catmull-Rom) and adds detail by
the overlay's *style* (`STYLES` in `41-world-fields.js`): hills and ridges scaled by the local relief, terraces where
the relief allows mesas (desert, badlands, Korona), dune seas where it is dry and flat, badland rills, roughness. Then
the drainage network is carved in: each channel's bed follows the scale model's own flow line, never above the local
ground less its depth, so where the detail raises a hill across a channel the channel cuts a gorge through it. That
gives the desert its wadis and canyons, and the kits their canyon, rim, bank and wet ground. The cut is the deepest of
all nearby channels' cuts, so the land stays continuous where channels meet (the probe checks it).

**The escarpments.** Where the extractor marks one (the eastern abyss's rim, where the scale model itself is steep:
`scarpl/u/w.png`), `WORLD.H` gathers the model's rise from the floor's level to the plateau's into a cliff a few hundred
metres wide, its line wandering with noise (promontories, embayments), a little talus at its foot. A channel's bed is
sharpened by the same rule, so a river leaves the plateau as a cataract: the big one 6 km south of Verge falls about
1.7 km. The owner's gentle rims (scale model 4.17: 'east rim', the valley of Yuni's mouth) are not steep in the model
and get no cliff, and no cliff is drawn along a named river's corridor (the extractor keeps it off within 12 km).

**The rivers.** A river the scale model names (`DATA.rivers`, so far the Yuni river: from the valley's head past Yuni
and down the mouth to the lake at Locus) comes in as region.json `rivers` and joins the channels at its own width (60 m),
so it is carved like them; inside its bed `WORLD.water` gives a surface 4 m over the carved floor at the centre line
(`WORLD.riverWater`), which falls with the bed. The water sheet treats a river's banks apart from a lake's shore: a dry
vertex next to a river always sinks (its level carried sideways would stand over the lower ground downstream). The
probe checks every station down each river has water in its channel, and that one with its water taken away fails.

**The fields** the kits read come from the rasters: `wet` from rain (halved for the dry classes, B, XW and XS), the
channels and the water; `salt` from the abyssal salt classes on low ground; `cold` from the mean temperature; `upland`
from height and relief (the abyss kit reads its own: the height above the abyss floor); `canyon`, `rim` and `flow`
from the carved channels; `rock` from slope and style; `dune` from the dune seas. So the flora follows the climate
through each kit's own zones: the abyss's XW floor is salt flat, with jade and Calamophyton along its channels; the
desert's scrub thickens where the steppe classes are wetter.

**The flora.** Each kit keeps its ecology: its pass table (species, cell, acceptance from its zones) and its builders.
The world adds what an open world needs (`biomes/WORLD.md`, "The contract it needs"): placement seeded by cell
(`KRAND.hash` of the kit, pass and cell; a tile built alone equals the same tile built in any order), a kit's weight
from the overlay blend (two kits' trees interpenetrate across a border a few km wide), level-free records, and trees
as **variants**: four per species, each grown once by the kit's own builder at each level (`SEDESERT.grow`,
`EASTABYSS.grow`, `HYPERJUNGLE.grow`, new in each kit's `55-*-trees.js`), then instanced.

**Spacing.** A tree yields to a stronger one (taller; a tie to the larger hash) standing within the stronger one's
keep-clear radius (the kits' `rb*1.4+1`) plus its own pass's pad. Every candidate is a pure function of its cell and a
tile places a 64 m margin round itself, so the decision is the same whatever order tiles are built in (the probe checks
it across tile edges, with a negative).

**Level of detail.** Nothing is loaded for the whole region. The terrain refines round the camera (about 300 chunks
drawn); flora records exist only for tiles within reach (7 km for the hypertrees' impostors, 3 km for the desert and
the abyss); each tree takes its level by distance (hero within ~14x its height, mid within ~50x, the kit's far
impostor beyond, nothing past reach); the floor exists only on the 128 m chunks within ~380 m. Prototypes are grown
lazily, nearest first, a few milliseconds a frame.

**The biomes without a kit** (e badlands, e highlands, Korona, the Throne,
the crater drylands) are bare ground in their own style and palette for now, as asked. A new kit joins as "Adding a
kit" says.

## Adding a kit

A kit built to the contract (`HANDOFF-EBADLANDS.md` spells it out: `KIT.SPECIES`, `KIT.zones`, `KIT.PASSES` as data,
`KIT.make`, `KIT.grow`, `KIT.buildFloor`) joins the world in two places: its fragments as one block in `build.py`'s
`KITS`, and one entry in `src/47-world-kits.js` (its overlay, its LOD reach, its floor profiles and their pick). Nothing
else names a kit. A field it reads its own way goes in its entry's `fields` (the abyss kit reads `abyssUp` as `upland`).

## Map overlays

The "overlay" switch tints the ground with the scale model's Köppen classes or its biome overlays (each vertex carries
both colours) and turns the minimap and its legend to the same; the legend lists the classes in the region by area.

## Settlements and highways (the trial run, Oct 2026)

`PLACES.list` (from the scale model's settlement layer) marks every settlement. Six built ones now **stand** in the
world as tiles baked from their own builds (`source/towns.json`): **Yuni**, **Locus**, **Verge**, **Mungo**,
**Veladiga** (the breached dam, turned 90 degrees into its canyon candidate) and **Arcbeam** (the living bridge-city).
Exteriors and streets only: no flora, life, fauna, furniture or interiors.

**A town tile** (`python3 bake.py towns [Name ...]`, `bake/bake_town.js`): the town's build page is opened headless
and its scene cut out: the kit's buckets and merged families, the Ancients sites' meshes, named kit items, water
surfaces, all clipped to the footprint (R round its centre); left out by tag are the biome flora, the 'leafy' and
'bark' families, figures, life and fauna, interiors, furniture, the build's own highways and terrain mesh. Its ground
is the build's `terrainH` on a 4 m grid with the terrain photographed from straight above (its own shader: streets,
plazas, fields), or the build's own ground mesh (Verge, vertex-coloured), or nothing (an Ancients site brings its
landform as meshes). Geometry is quantised (Int16 positions and uvs, Uint8 colours), instances keep their matrices,
the file is gzip: `dist/towns/<name>.ktile`, 1 to 14 MB. `88-world-towns.js` fetches a tile when the camera comes
within 30 km and frees it beyond 38.

**The land under a town** (`WORLD.H`, `data/towns.json`): inside R the land is the town's own ground (3 m under the
tile's ground mesh, which covers it), easing back to the land over a band (400 m; Verge 2.5 km, its 934 m drop being
less than the scale model's). The town is lifted so its ground meets the land at its centre or a named anchor (Verge:
its plateau), or set on the lake's surface (Mungo floats on its salt lake). No flora or ground cover inside R + 60 m.

**Highways** (`source/highways.json`, the owner's list; `python3 bake.py roads`, `src/42-world-roads.js`): each pair
routed once, by least cost over the land with the towns' ground in it: a 2 km pass over the whole region (a step's
cost rises with the fourth power of its grade, and a cliff's far more, so the route hunts for ramps), then a 200 m
pass in a 6 km corridor where the grade's cost rises steeply past 8 % (so a slope too steep zigzags). The line is
smoothed, stopped 30 m outside each town's footprint (150 m short of an unbuilt settlement's marker), given a finished
height (the land smoothed, held to 8 % both ways, both ends pinned to the land, 2 m over any water) and simplified
(Douglas-Peucker, 0.25 m across, 5 cm in height) into `data/roads.json`. `WORLD.H` holds the ground between two
envelopes round every road (a cut bank no steeper than 0.8 m a metre above it, a fill bank below), so the 8 m
carriageway is level and exact; the terrain draws its packed gravel from a per-vertex coverage prefiltered for the
chunk's spacing (a far road is a faint band, not lost); flora and ground cover keep off it. Rebake the roads after a
town moves: `python3 bake.py roads`.

The probe checks that each road lies on the land within 0.3 m and keeps its grade (junctions, within 12 m of another
road, are counted apart), and that nothing grows on a road or in a town, each with a negative control.

**Publishing with the towns**: the Artifact service serves no binary type, so `python3 publish.py <dir>` stages the
page with each tile as base64 text in parts under 15 MB (`towns/<name>.ktile.<i>.txt`); `88-world-towns.js` fetches
the plain tile first and falls back to the parts. Publish the staged page with its `towns/*.txt` as supporting files.

## Controls

Drag to look; the wheel zooms toward the ground under the cursor, down to eye height (Shift+wheel sets the flying
speed); WASD fly, Q/E down and up, Shift faster (the speed follows the height above the ground); F drops to eye height
where you are; G walks; I inspects (the ground's sample and the nearest plant's species, kit and tags); P collects
polygon points. Click the minimap to go there. Trees draw at the kit's hero level within ~14 times their height
(90 to 240 m for the desert and the abyss, 300 to 420 m for the hypertrees).

## Acceptance frames (VISUAL-BAR.md)

- Ground level: Go to "Biome: sedesert (ground level)".
- Vista: Go to "The eastern desert from 40 km up, looking east".
