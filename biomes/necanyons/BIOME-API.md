# necanyons — the contract

The north-eastern canyons: the hyperjungle's transition to Korona (`PLAN.md`). One kit on the shared biome core
(`core/biome`, as `biomes/hyperjungle/BIOME-API.md` says), plus two core modules it is the first user of:
`core/terrain/37-core-stacks.js` (`KSTACKS`: the rock) and `core/biome/37-core-traps.js` (`KTRAPS`: the carnivores'
trap rules). The page reads the hyperjungle kit and its sky in place (`build.py`) for the canyon floor.

## What the host provides

The usual `BIO.init({...})` (`biomes/hyperjungle/BIOME-API.md`), and, before the kit's species fragment, its ROCK as
KSTACKS records and its floor:

```js
NECANYONS.lay({
  bodies: [KSTACKS.make({...}), ...],   // mesas, buttes, spires, fins, balanced rocks (core/terrain/37-core-stacks.js)
  floor:  (x,z)=>y,                     // the canyon floor's height (the ground between the rocks)
  R:      1600,                         // the showcase's radius (the zone grid covers R + 200)
  capY:   330,                          // a top this high is a cap (bare, dry); lower, a bench
  cell:   5                             // the zone grid's cell (m)
});
```

The host's `terrainH` is then `NECANYONS.top(x,z)` over the rock and the floor elsewhere: the same KSTACKS functions the
rock's mesh is made from (`KSTACKS.mesh`), so a plant's foot is on the drawn rock. The host draws the rock (47: three
meshes, the library's varnish, cross-bedded and slickrock sets) and its water (the creek, `NECANYONS.POTHOLES`).

## What the kit gives

```js
NECANYONS.lay(o)            // above: the zone grid, the seep lines, the rain pools
NECANYONS.at(x,z)           // {zone, rock, top, d, seep, pan, dry, footD, B, b, small}
                            //   zone: floor, foot, wall, ledge, rim, bench, cap, stack (PLAN.md section 1)
NECANYONS.top(x,z)          // the rock's top, or -Infinity on the floor;  NECANYONS.rockAt(x,z) the body and bed
NECANYONS.footD(x,z)        // metres to the nearest wall's foot (60 when far)
NECANYONS.wall(B,b,a,u)     // a point on a bed's face and its outward normal
NECANYONS.SEEPS             // the seep lines under each cap rock: [{id, body, bed, a, x, y, z, seep, nx, nz}]
NECANYONS.POTHOLES          // rain pools on the caps and stack tops: [{id, body, x, z, r, y}]
NECANYONS.records()         // the layout as data: {rock (a krator-stacks export), capY, potholes, seeps}
NECANYONS.build({R, quality})   -> {trees, heroes, far, bySpecies, carnivores:{...}, under:{...}}
NECANYONS.place(cell, salt, accept(x,z,Z), fn(x,y,z,Z,i,j), {R, box, lodMax})   the kit's grid: each cell's stream
                            //   reseeded from KRAND.hash(seed, pass, cell) (CLAUDE.md: placement by cell)
NECANYONS.SPECIES           // six trees: fanpalm, stackfig, flametip, emberplum, treelily, rockbottle
NECANYONS.PLANTS            // fonio, ringgrass, seepfern and the seven carnivores; each tagged (harvest, zone, trap)
NECANYONS.TRAPS             // the carnivores' trap records (KTRAPS.make): kind, mouth, preyMax, cycle, lure, danger 0
NECANYONS.TRAPPED           // after build: the registered patches [{id, key, x, y, z, r, zone, trap}]
NECANYONS.TREES, .canopyH(x,z), .nearestTree(sp,x,z)
```

## The carnivores (PLAN.md section 4)

Flora with a trap record. Drawn and placed like any plant (57); every item set a carnivore draws is a core/tags set
whose tags carry the plant's `trap` and `zone` (the vocabulary's keys since 2026-10-19), and each hero patch is a
registered `flora` record with the same. The clapjaw's lobes move in the shader: `KTRAPS.GLSL` on the wind clock, each
trap's phase `KTRAPS.phase(id)`, the slow phases of its cycle divided by `NECANYONS.SPEED`. `KTRAPS.state` and
`KTRAPS.catches` are what a game asks. The `carnivores` layer on the bar shows or hides them.

## Tags

The project's flora tags (climate, aridity, abyssal, riparian, koppen) plus `zone` and, on a carnivore, `trap`;
`harvest` in the `HV()` shape (`biomes/FRUIT.md`).

## File layout

```
45-host-stage.js      HOST: renderer, light, the floor, the creek, the rock as KSTACKS records (the showcase's layout)
46-biome-necanyons-layout.js   THE KIT's layout [G data]: zones, seeps, pans, potholes
47-host-land.js       HOST: terrainH, waterH, fields, BIO.init, the ground and rock meshes, the water (core/water records:
                      WATER_RECS {creek, pools}, when the page has core/water; else a plain ribbon)
48a..48f              the hyperjungle, read in place (build.py)
50-biome-necanyons-species.js  species, plants, traps, harvest, textures, materials, items
55-biome-necanyons-trees.js    the placement grid, the six trees, impostors
57-biome-necanyons-carnivores.js  the seep lines' hanging gardens, bogs, walls' feet, vines, caps, pools
60-biome-necanyons-floor.js    fonio, ringgrass, seep ferns
70-biome-necanyons.js          build / canopyH
82-host-sky.js        the hyperjungle's sky, read in place
88-host-build.js      HOST: this kit, then the hyperjungle on the floor, then one bake
89-atmos-*            core/atmos: the core, presets, export, wave clock and sky light (the water's)
89n-host-night.js     HOST: the night: the lights, the fog, the dome by the world hour (KHOST's sky.hour; N); read in
                      place by Pinnacle Rock
89w-host-water.js     HOST: the creek and the rain pools drawn on core/water
99-host-take.js       HOST: views, inspector, checks, KHOST.take
```
