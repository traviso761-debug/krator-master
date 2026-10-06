# Crater drylands — known issues

Read before changing this kit. Open items are `- [ ]`; `build.py` counts them.

## The region and the open world

- [ ] **The Koppen classes are an estimate** (BSh .6, BWh .25, Aw .15). The scale model's climate rasters were not
  read for this kit; take the two regions' real class shares (and their pressure and rain) from the scale model with
  `tools/scale-model/extract_region.py` before the kit goes into an open world.
- [ ] **Not slotted into an open world.** `openworld/little-demo` is the eastern desert. A world that takes this kit
  calls `CRATERDRY.fireHistory` over its region once (a 20 m grid) or binds an age field of its own.
- [ ] **No catalog fruit.** The kit names edible parts (frill-tree seed, parasol-pine nuts, yucca pods, nectar) but the
  catalog (`kits/catalog/krator-master-furniture-generic-fruit.js`, `biomes/FRUIT.md`) has no drylands fruit yet, and the
  kit draws none as fruit. Every `HARVEST` entry's `fruit` is null.
- [ ] **No fauna, no Scyvoi.** The owner's plan puts all fauna in one fauna kit (`biomes/README.md`); the Scyvoi's
  theropod mounts, fire-chasing birds and the beetles that breed in fresh char belong there. A Scyvoi camp on a kopje
  is a settlement, not part of a biome.

## The fire

- **The live fire** (89, `NOTES.md`): one fire at a time; lighting another replaces it. The burnt plants stay burnt
  only while the fire is lit ("Put it out" restores them): the trail is the shader reading the map, not a change to
  the world. A live fire does not feed back into the history (`CRATERDRY.FIRE.last`), so the ground it burns does not
  turn to bloom on a later visit, and a second fire can run through the first one's char.
- The flames are camera-facing quads (cylindrical: upright); seen from straight above they are thin. The smoke is
  sprites, not a volume. The fire's light is one point light at the head.
- Not yet lifted into `core/atmos` (`NOTES.md`, "The live fire").
- The fire model's grid is 20 m. A burn's edge is the cell edge warped by noise (sharp, not a staircase), but a
  plant within about 10 m of an edge may read the neighbour's age.
- No smoke rises from the static three-week-old burn yet (the live fire's smoke pool could seed it).

## Textures

- **The ground's library layers** (`ground.burn`, `ground.redsoil`; 84) are blended per vertex (12 m) by the burn's
  stage: char and ash on the fresh burns, fading through the bloom's first year; red soil, half mixed with the painted
  colour, under the bloom, the regrowth and the old scrub. A burn's edge is therefore soft over about 12 m on the ground,
  while the plants change at the 20 m fire grid's warped cell edge.
- **Anti-tiling** (2026-10-05, the owner: "the charred texture looks a bit samey"): each ground layer is sampled on its
  own tile and on a larger one turned 37 degrees, blended by a macro noise (the carpet map's B channel at ~58 and ~164 m),
  and the char varies at that scale: deeper black, grey-white ash drifts, less of the soil's warmth. The charred shrubs
  draw from four cells of `card.charred` (`twigs`..`twigs3`), not one.
- The library sets in use (`materials.json`, `tex/`, 2.3 MB): two grounds, 13 cards (the pine, prism-gum, sage and ember cards from
  earlier kits; the charred shrub, dry grass, flower spike, cup flower, fire lily, pillar frond, prism fern, jade and broom
  cards delivered for this kit), five barks (`bark.pine.scale`, `bark.pillar`, `bark.prismgum`, `bark.bark_bluegum`,
  `bark.char` for the dead and charred wood) and the granite. `?mat=proc` shows the procedural textures.
- Cards on a tuft, a bloom or a frond strip are one cell cut from the sheet of nine (50, `libCell`); the pillar's diagonal
  frond is turned onto the strip and the prism fern's onto a broad leaf quad (`G.leafquad`, library only). The flower
  spikes, cups and the lily are white or full colour cards: the drift's colour tints the petals and darkens the leaves.
- The living trunks' char band is the species' own bark darkened, not `bark.char` (that is the dead and charred wood).

## The showcase

- The showcase is a 5.2 km disc; the regions are 53,000 and 8,000 km². The kopjes, washes and the seep are the
  showcase's own.
- **Budget**: 17.9M triangles at q=1 (trees ~13.5M, floor ~4.4M; 17.0M before the frill-tree was rebuilt as a frill tree, 2026-10-06), ~35k trees, 40 draw calls (`91-host-probe.js` BUDGET:
  18.5M, measured, not a target). The first build measured 30.1M: the LOD spine covered the whole map, so 50k of 51k trees
  were heroes. The spine is now the kopjes, three points on wash A, the seep and the recent burns' real centres (84 adds
  them after the fire model runs). `?q=0.5` builds at half density; `?nobake=1` measures without drawing.
- **The bloom's carpet is a ground-shader layer** (`84-host-ground.js`, `TEX_CARPET`): flower dots in the drift's colour
  and grass blades, weighted by burn age. The instanced flowers are on top of it. It is flat: close to the ground at a
  low angle the dots read as paint.
