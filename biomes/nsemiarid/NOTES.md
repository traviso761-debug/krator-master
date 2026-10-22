# Krator biome kit — the northern semiarid country (Oct 2026)

## What this is

The biome kit of the scale model's "n semiarid" region (`PLAN.md`): the north basin round the drained dam lakes. Hot
steppe over most of it (BSh 47%), lowland desert on the old lake beds (BWh), Mediterranean foothills (Csa), rainy
humid-subtropical uplands (Cfa) and tropical lake margins (Af, Am, Aw) where today's remnant lakes lie low in dense, hot
air. Built 2026-10-22 on the eastern badlands kit's structure (`biomes/ebadlands`: the zones, the broadleaf builder, the
impostors, the passes, trees as variants), open-world ready from the start.

**Earth basis:** Central Asia (the Aral Sea, Turkestan, Iran, Anatolia, the Tian Shan). **The Krator twist: the walking
steppe** (the owner, 2026-10-20): everything here travels. Whole plants walk, creep or roll; their seeds fly. 1.42 atm
and 0.75 g: a parachute carries about 1.9 times an Earth seed's mass at the same fall, and the wind pushes 40% harder at
a given speed; and the land has been drying for centuries behind retreating shores (`PLAN.md` section 2).

## The showcase (`src/45-host-stage.js`)

6.8 km, north to south: the OLD LAKE BED (a basin falling to a remnant salt lake at 380 m; its marks are core/terrain's
`KBASIN`: the full level at 640 m with its beach ridge and the 30 m bathtub ring, the fast drain to the sill at 560 m,
the strandlines of the slow recession, salt rising toward the water, a dune field on the lee shore), THE STEPPE
(680-760 m), THE FOOTHILLS (780-1,150 m, basalt ridges, a spring pool), THE UPLAND (1,200-1,450 m). A stream runs down
the transect into the lake. The sky: the outer rim iced in the north, the Inner Wall's highlands blue in the south, the
giant in the north-east. The water is core/water's: the lake and the pool still water, the stream a flow (records in
`45-host-stage.js`, which `waterH` answers from; drawn in `89b-host-atmos.js`). The wind is core/atmos's: the prevailing
wind veering slowly, its gust fronts running downwind, scaled by the wind setting (the panel's select or `?wind=calm|breeze|high`).
It turns the helicopter trumpets (`86-host-variants.js`, the spin materials), drives the seed weather and tears the seeds
off the trees round the camera when it passes each one's hold (`89c-host-seeds.js`; `window._seeds` counts them).

## The flora

17 tree-scale species (`50-biome-nsemiarid-species.js`), each with its travel:

| zone | trees | the floor |
|---|---|---|
| desert (BWh) | crescent saxaul (groves in barchan crescents, horns downwind, the dead trunks upwind inside the arc), helicopter trumpets, giant dandelions | crawlers (green heads downslope, grey trails behind), resurrection balls, wormwood, windows, step cones, striders, horn pipes, balloon pods |
| pan (salt) | dead golden poplars | salt fingers, windows, step cones |
| steppe (BSh) | pistachio parkland, dandelion frills (green, ripe, half shed downwind, bare), helicopter trumpets, foxtail spires, giant dandelions | drill grass (the cover), tumblers (and their drifts on the windward faces), tulips, and the small and weird: hitchers, censer caps, sail candelabra, mace heads, bead chains, horn pipes, furlers (shut in gust bands), roll-eggs, star drifters, in dew gardens round the boulders |
| med (Csa) | Judas trees (magenta flowers out of the bark), almonds, pomegranates, drift lanterns, foxtails | grass, drill grass, tulips, furlers, star drifters, glider gourds scrambling over shrubs |
| forest (Cfa) | wild apple, apricot, pear, walnut, kite ash (half-metre samaras), drift lanterns | grass, litter, ferns, windfall fruit |
| tugai (Af/Am/Aw margins) | golden poplar (cotton drifting), pomegranate | reeds, sedge, cotton drifts, roll-eggs |
| rip (stream, spring) | spring planes, walnut | reeds, grass, flowers |

Krator's own: the dandelion frill (the frill-tree line), the helicopter trumpet (the trumpet-tree line), the drift
lantern (nhighlands' bell-bulbs). The seeds aloft (plumes, samaras, helicopters, gliders, lanterns) are placed downwind
of their trees as the seed weather's still frame.

## The fields

It reads the world's `wet`, `flow`, `upland`, `rock`, `slope`, `salt`, `dune`, `cold` and the overlays' `bed`, `silt`,
`scour`, `dry` (0 where none is bound): `BIOME-API.md`.

## Lessons this build cost

- A stage fragment runs before the kit: anything it hands the kit (the wind) goes through `88-host-build.js`.
- With trees as variants, fruit on the trees is prototype geometry, not instances: the floor drops windfall fruit so the
  fruit check (and a player) has something to pick up.
- With trees as variants nothing on the floor wrote a bucket, so the export's `buckets` section was empty: the crescent
  groves' dead trunks (tubes in the `wood` bucket) are both the plan's and the export's.
- Count the passes before looking: the first build placed 78,000 trees (foxtails and dandelions at 11-12 m cells over the
  whole map); 34,000 after thinning.
