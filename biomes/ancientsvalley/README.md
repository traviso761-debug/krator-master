# biomes/ancientsvalley: the Ancient's Valley

The overlay on the two lowlands where the Ancients' war left the land weird and hazardous, and the Ancients' capital stands as a megalopolis in
ruin (`PLAN.md`: the owner's brief, the valley on the model, the city's zones, the scars, the feral forest, the people; `PLAN-ANOMALIES.md`: the
basins where physics fails, and the metropolis's drawing tiers). **Station 0, the Overlook, is built: the city on a normal day, no anomaly**, the
test of the brief's rule (the hand of man in every view) and of the budget.

```
python3 tools/build.py biomes/ancientsvalley                         # dist/ancientsvalley.html (+ dist/ancientsvalley.tex.<pack>.js, the packs' sidecars)
node biomes/ancientsvalley/tests/test-av.js                          # the data side: the model's ground, the fields, the plan, the viaduct, each with a negative
python3 biomes/ancientsvalley/verify.py biomes/ancientsvalley/dist/ancientsvalley.html --assert --all-views --out shots
python3 biomes/ancientsvalley/region/site.py                         # after the model moves: region/station-<name>.json from tools/scale-model/model/data
python3 tools/textures/pack.py biomes/ancientsvalley                 # after a change to materials.json
```

## What the page is

- **The site** (`region/site.py`, `region/station-overlook.json`): px 457,907 on the 5.1 model, the ridge east of city1 over its drowned inlet: 84 m,
  1.58 atm, Af, +24 degC, 2,980 mm. The record holds the model's heights on its 2 km cells round the pixel, the lake's level (17.4 m, y -66.4 on
  the page), the horizon's ridges for the shared sky, and the cities and basins by NUMBER: the names live in that one table (`PLAN.md` section 3).
- **The ground** (`46z-host-stage.js`, `47-host-land.js`): the model's heights by bicubic plus the page's own relief, every tower on a level plinth
  (a disc or a slab, turned with it); core/terrain's KGROUND lays seven library layers (pavement, asphalt streets, rubble, the scar's glass, the
  two lowlands' soils, the shore's mud) over a paint that is also the canopy seen from afar.
- **The fields** (`41-av-field.js`, [G data]): the zone by the model's height (option B: the floor is the core, the shelf the residential rings),
  the density, the parks, the scar (one dead lobe on the ridge's east end), the feral depth, the taint; `tests/test-av.js`.
- **The city** (`41-av-field.js` AV.plan, `70-host-city.js`): about 830 towers on a lattice turned 17 degrees, records before anything is drawn, their
  states by the ruin shares (the owner, 2026-11-04: far too intact at first; now 9% intact, 11% gutted, 12% crown gone, 20% broken, 18% stumps,
  12% skeletons, 18% fallen). Sixteen families: the Spindle and the Ledger, which have baked shells (the nearest 16 as heroes with the dither at
  300 m, to 1.4 km as shells, beyond as impostors, the ruins' rubble to 1 km), and the fourteen designs, which have none (kits/metropolis
  `KNOWN_ISSUES.md`): heroes to 800 m, the nearest 30, then impostors in two looks (intact, broken). A thousand years of rust and grime on every
  hero's colours before the shells and impostors are baked from them (`avRust`). The viaduct (AV.viaduct) runs the ridge's north flank and
  out over the inlet.
- **The Engines** (`70-host-city.js` AVC.engines; kits/ancients `8ah-engines.js`, `8ai-engines2.js` read in place with the kit's runtime, as
  kits/metropolis reads its buildings): the owner, 2026-11-04: massive objects placed sparingly for the sense of scale. The Gyre (a 430 m ring on
  edge) on the floor to the north-west, the Strider (a walker halted mid-stride, its hull 170 m up) on the shelf to the south-east, each at decay 1
  on a pad of its own, the kit's volumes as the page's records. `AV.ENGINES` lists all ten for a station to pick from.
- **The forest** (`46-av-feral.js`, `88-host-build.js`): swlowlands and nwlowlands read in place under the stage's masks, their rainforest zones on
  everywhere (wet .8-.98, tropic .92), every tree grown by the feral field (1.3-2 x), and the taint's tint on the baked foliage (a KHOOK layer:
  green turns toward red-purple and blue-purple by a field of the world position).
- **The air and the water** (`89s`, `89w`): the shared sky at the pixel with the model's ridges; the lake and the inlets as one open surface, the far
  lake to 30 km where the model has water.

## Numbers (2026-11-04, `verify.py --assert --all-views` on the GPU, 1280 x 800)

814 towers (3% intact, 22% standing tall), two Engines, fourteen craters, 2,764 read-in trees, 7.7 M triangles in the registry; every assert
passes. Per view: the Overlook 3.07 M triangles in 465 calls, the dead lobe 5.23 M in 559, the park 4.58 M in 665 (the worst calls), a crater
4.07 M in 531, the Strider 3.69 M in 456, from the air 2.45 M in 451. The shells bake in about 3 s, the heroes and shells together in 4 s, then
42 impostors one a frame. Run on the RTX 5060 lane (the first cut, 2 families and no engines, measured on the Arc 140T: the dead lobe 5.67 M in
522 calls).

**The war damage (the owner, 2026-11-07, "really fuck it up"):** the ruin shares (`AV.RUIN_CUTS`: 4% intact, 8% gutted, 10% crown gone, 22%
broken, 22% stumps, 14% skeletons, 20% fallen); `avRust` (`70-host-city.js`): rust over everything with streaks to full rust, soot in patches
and smeared upward from the burnt storeys, two or three laser cuts through each tower (planes in its frame, scorched black along a band), and
every colour drawn half way to a rust-brown of its own brightness, so the city reads as one rust-shaded palette; `AV.craters` (`41-av-field.js`):
fourteen strikes on the dry land, bowls with raised rims, each a scar of melt glass with nothing standing in it; the viaduct with a deck in
fourteen down and lying tilted at the foot. Ruined vehicles in the streets are a kit's work (`kits/motor-vehicles`, an Ancients culture with
ruin states: in its own session) and come to the valley when it exists.

## Read next

`PLAN.md` (the brief and the decisions), `PLAN-ANOMALIES.md`, `INDEX.md`, `KNOWN_ISSUES.md`, `PORT.md`; `kits/metropolis/README.md` for the towers.
