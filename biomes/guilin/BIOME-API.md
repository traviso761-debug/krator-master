# guilin — the contract

The South China karst (`NOTES.md`): Guilin's towers on the Li River and the stone forest. One kit on the shared biome core
(`core/biome`, as `biomes/hyperjungle/BIOME-API.md` says), its rock on `core/terrain/37-core-stacks.js` (`KSTACKS`),
its spatial lookups on `core/space` (`KSPACE`). The page reads the hyperjungle's globals and sky and the necanyons' night
in place (`build.py`).

## What the host provides

The usual `BIO.init({...})`, and, before the kit's species fragment, its rock as KSTACKS records, its floor and its
water's shapes:

```js
GUILIN.lay({
  bodies: [KSTACKS.make({...}), ...],   // towers (spires re-profiled, tower:true), the fengcong's base (a butte), the blades
  floor:  (x,z)=>y,                     // the plain's height (the ground between the rocks)
  R:      1600,                         // the showcase's radius (the zone grid covers R + 200)
  cell:   5,                            // the zone grid's cell (m)
  riverD: (x,z)=>m, riverW: 55,         // metres from the river's line; its half-width
  sfD:    (x,z)=>m, sfR: 330,           // metres from the stone forest's middle; its radius
  pondE:  (x,z)=>e, pondLevel: y,       // the pond's ellipse distance (1 at its edge); its level
  paddy:  {cell:[34,22], bund:.7, seed:77}
});
```

The host's `terrainH` is then `GUILIN.top(x,z)` over the rock (a cap's `KSTACKS.topH`, or the height on a tapering
wall) and the plain elsewhere, so a plant's foot is on the drawn rock. The host draws the rock (47: four meshes on the
library's `rock.limestone.karst`), the paddies' bunds, the horizon, and the water (89w: the river, the pond, the wet
paddies on core/water). `GUILIN.build` takes the pond as `{level, at}` for the lotus.

## What the kit gives

```js
GUILIN.lay(o)               // above: the zone grid, the cliff points, the drapes, the paddies
GUILIN.at(x,z)              // {zone, rock, top, d, footD, B, b, small, grove, river, paddy, up, steep}
                            //   zone: crown, slope, cliff, ledge, rim, blade, wall, foot, water, bank, paddy, grove, plain
GUILIN.top(x,z)             // the rock's height, or -Infinity off it;  GUILIN.rockAt(x,z) the body, bed, wall and steepness
GUILIN.footD(x,z)           // metres to the nearest wall's foot (34 when far)
GUILIN.wall(B,b,a,u)        // a point on a bed's face (its taper and lean followed) and its outward normal
GUILIN.CLIFF                // [{id, body, bed, a, x, y, z, nx, nz, up, kind:'scrub'|'fig'|'orchid'|'vine', s}]
GUILIN.DRAPES               // creepers off the base's lip: [{id, body, bed, x, y, z, nx, nz, len}]
GUILIN.PADDIES              // [{id, x, z, w, d, ang, poly, level, state:'flooded'|'young'|'green'|'ripe', crop:'rice', bund}]
GUILIN.paddyAt(x,z), GUILIN.paddyWater(x,z)
GUILIN.records()            // the layout as data: {rock (a krator-stacks export), cliff, drapes, paddies}
GUILIN.build({R, quality, pond})   -> {trees, heroes, far, bySpecies, cliffs:{...}, under:{...}}
GUILIN.place(cell, salt, accept(x,z,Z), fn(x,y,z,Z,i,j), {R, box, lodMax, wet})   the kit's grid: each cell's stream
                            // reseeded from a hash of (the kit's seed, the pass, the cell); wet skips the water mask
GUILIN.SPECIES, GUILIN.PLANTS, GUILIN.HARVEST, GUILIN.TREES, GUILIN.canopyH(x,z), GUILIN.nearestTree(sp,x,z)
```

Every species and plant carries the project's tags (climate, aridity, abyssal, riparian, koppen) plus `zone` and
`harvest` (`biomes/FRUIT.md`); rice carries `crop:'rice'` (`kits/crops`).
