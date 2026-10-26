# biomes/k-guilin: index

*Written by hand in `tools/make_index.py`'s shape (2026-10-26); rerun the tool after adding or splitting fragments.*

Docs: `PLAN.md`, `NOTES.md`, `BIOME-API.md`, `KNOWN_ISSUES.md`, `PORT.md`, `SKILL-LESSONS.md`

Built output (never open it; edit `src/` and rebuild): `dist/k-guilin.html` (its maps in `dist/k-guilin.tex.kguilin.js` and `dist/k-guilin.tex.nwbay.js`)

Build: `cd biomes/k-guilin && python3 build.py`. Fragments are concatenated in filename order.

From `core/terrain/`: `37-core-stacks.js`. From `core/biome/`: `10-core-head.js`, `20-core-kit.js`, `30-core-foliage.js`, `40-core-place.js`, `42-core-export.js`, `43-core-export-host.js`, `44-core-stage.js`. From `core/rand`, `core/tags`, `core/export`, `core/space`, `core/water`, `core/clock`, `core/edits`, `core/minimap`, `core/materials/record` and `core/host` (`khost.FULL`), as guilin. From `core/atmos/`: `89-atmos-0-core.js`, `89-atmos-0p-presets.js`, `89-atmos-4-weather.js`, `89-atmos-8-export.js`, `89-atmos-9-host.js`, `89-atmos-a-waves.js`, `89-atmos-b-skylight.js`; `host/89-atmos-c-hostbind.js`, `host/89-atmos-e-weatherhost.js`, `host/89-atmos-h-skyhost.js`; `sky/89-atmos-e-skymodel.js`, `sky/89-atmos-f-skypresets.js`, `sky/89-atmos-g-sky.js`.

Read in place from other kits: `biomes/hyperjungle/src/41-hyperjungle-globals.js`; `biomes/nwbay/src/50-biome-nwbay-species.js`, `55-biome-nwbay-trees.js` (**big**), `56-biome-nwbay-variants.js` as `48n1`..`48n3`, and nwbay's `tex/` pack.

## src/

| Fragment | KB | Sections (line) |
|---|---|---|
| `00-head.html` | 1 |  |
| `45-host-stage.js` | 12 | the lake, the plain, the wadi, the stone forest' (47); the rock (KSTACKS records: core/terrain/37-core- (83) |
| `46-biome-kguilin-layout.js` | 17 | lay: the grid of beds and wall distances (25); the height of the rock (77); the zone of a point (90); the wall: a point on a bed's face, and its outwa (116); the cliffs' dressing (data: where the scrub hold (120); the paddies (data: fields by the wadi and the la (148) |
| `47-host-land.js` | 19 | the fields (biomes/WORLD.md): wet, flow, rock, u (17); the host binding (before the meshes: their paint (29); the library layers (or procedural without the pa (41); the ground (one mesh: grass, litter at the tower (61); the paddies' bunds: low earth walls round every  (86); the rock (KSTACKS meshes): four meshes, by mater (102); the horizon: the karst going on into the mist, t (144); the water: the lake, the wadi, the pond, the pad (165) |
| `48n0-kguilin-nwbay-open.js` | <1 |  |
| `48n9-kguilin-nwbay-close.js` | <1 |  |
| `50-biome-kguilin-species.js` | 24 | palettes (sRGB; a library card carries its own c (20); the tree-scale species (37); harvest (biomes/FRUIT.md; kits/crops) (61); the small plants, tagged (76); leaf textures (procedural, greyscale: the fallba (92); bark textures (grey, mean ~.6) (130); geometries (kit-local), and cell mapping (139); materials (165); instanced items (195) |
| `55-biome-kguilin-trees.js` | 21 | the placement grid (15); keep-clear between trees (core/space) (28); the builders: (T, st, lv) with lv 2 near, 1 mid (49); impostors (the far trees) (127); the passes (data: species, cell, acceptance by z (141); nwbay's species, read in place (PLAN.md section  (156) |
| `57-biome-kguilin-cliffs.js` | 5 |  |
| `60-biome-kguilin-floor.js` | 5 |  |
| `70-biome-kguilin.js` | 1 |  |
| `88-host-build.js` | 1 |  |
| `89a-host-atmos.js` | <1 |  |
| `89s-host-sky.js` | 4 |  |
| `89w-host-water.js` | 3 |  |
| `99-host-take.js` | 16 | the inspector's words: a plant names its species (35); the probe's budgets and the kit's own checks (ve (49); the page, handed to the host (131) |
| `99-tail.html` | <1 |  |
