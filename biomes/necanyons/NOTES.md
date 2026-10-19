# necanyons — notes (2026-10-19)

## What this is

The north-eastern canyons: the hyperjungle's transition to Korona's coronae and tepuis (`PLAN.md`; the owner's brief,
2026-10-19). Red sandstone mesas, benches and towers rise out of the jungle; the forest fills the canyons between them
and thins northward; the high tops are bare and dry. The first large carnivorous plants grow here, none able to hold a
person. Pinnacle Rock (`settlements/pinnacle-rock`) stands on the first of these mesas. On the scale model the kit
overlies the hyperjungle's polygon for now (the owner, 2026-10-19: the model's move-vertex tool is not working).

The showcase is ~3.2 km: the Bench (a two-tier mesa at Pinnacle Rock's height, a row of fins on its southern rim and a
garden of spires and balanced rocks on it; its cap 150 m higher), the High Cap (the tallest mesa, hoodoos on its top),
a butte, five towers out of the jungle, six stacks on the floor where the canopy thins by the creek, and the creek.

## The two core modules it began

- **`core/terrain/37-core-stacks.js` (KSTACKS)**: rock bodies as piles of BEDS (mesas, buttes, spires, fins, balanced
  rocks), grown from nwbay's karst stacks (`biomes/nwbay/NOTES.md`, "A karst stack is three things that must agree"):
  one footprint function and one top function make the height, the ledges and the mesh. Node-tested
  (`test-stacks.js`): the mesh's tops lie on the height the field reports, the walls face out, a balanced rock has an
  underside, fins share their strike. Pinnacle Rock's P1 needs it unchanged.
- **`core/biome/37-core-traps.js` (KTRAPS)**: the carnivores' trap record, its cycle by a hash of the trap's id, what it
  catches (by the fauna kit's mass classes), and `KTRAPS.GLSL`, the shader's twin of `state()` (`test-traps.js` proves
  they agree). `core/tags` took two keys for it: `zone` and `trap`.

## Why the carnivores are here, and why the tops are dry

Quartz sandstone weathers to sand with almost nothing in it and 3,000 mm of rain a year leaches the rest away: what
grows on the rock eats what it catches. The tops are dry under jungle rain because jointed sandstone drains at once and
holds no soil; rain comes in pulses, the pans and potholes fill and dry within days. So the zones (46) are read off the
rock, not a climate map: floor, foot, wall, ledge, rim, bench, cap, stack, with a seep (north faces wetter, patches round
each body) and pans on the tops.

## Lessons

- **One sheet, many cells: put the cell in the item's uv.** The library hands every slot of one sheet the same cached
  texture, so two items showing two cells of the owner's 3 x 3 sheet through the pack's `cell` (texture offset) fight
  over one offset. Each item here maps its own uv into its cell (`cellUV` in 50) and its procedural fallback is painted
  3 x 3 too, so either way the item reads a plant.
- **The host must bind before it paints.** `BIO.canvasTex` needs `BIO.host`: the land fragment binds (BIO.init) before it
  makes its ground and rock textures, and before the rock's volumes are registered (core/tags records).
- **Placement by cell.** `NECANYONS.place` reseeds the kit's stream per cell from `KRAND.hash(seed, pass, i, j)`, and each
  tree is drawn from its own seed after all are placed: a pass that changes moves nothing else.
- **A grey card takes its procedural colour, a full-colour card a near-white**: `libCol` checks the pack's `tint.keep`.
