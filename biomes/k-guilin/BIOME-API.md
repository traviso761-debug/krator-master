# k-guilin — the contract

The Hykkousoi hinterlands (`PLAN.md`, `NOTES.md`): the inland tower karst behind the NW bay, on the lakeshore by Trigon.
One kit on the shared biome core (`core/biome`, as `biomes/hyperjungle/BIOME-API.md` says), its rock on
`core/terrain/37-core-stacks.js` (`KSTACKS`), its spatial lookups on `core/space` (`KSPACE`). It places **biomes/nwbay's
species read in place** (`build.py` `KITS`: nwbay's 50, 55 and 56 in their own registry, opened and closed by this kit's
`48n0` and `48n9`). The page reads the hyperjungle's globals in place; its sky is the shared sky (`core/atmos/sky`).

## What the host provides

The usual `BIO.init({...})` (its fields: `wet`, `flow`, `rock`, `upland`, `mist`, and `karst`, nwbay's field, which the
borrowed cliff fig reads), and, before the kit's species fragment, its rock as KSTACKS records, its floor and its water's
shapes:

```js
KGUILIN.lay({
  bodies: [KSTACKS.tower({...}), ...],  // towers (KSTACKS.tower, tower:true), the fengcong's base (a butte), the blades
  floor:  (x,z)=>y,                     // the plain's height (the ground between the rocks; the lake's bed under it)
  R:      1600,                         // the showcase's radius (the zone grid covers R + 200)
  cell:   5,                            // the zone grid's cell (m)
  riverD: (x,z)=>m, riverW: 40, riverWW: 9,   // metres from the wadi's line; its bed's half-width; its channel's
  lakeD:  (x,z)=>m, lakeLevel: 0,       // metres from the lake's shore line (> 0 on land); the lake's level
  sfD:    (x,z)=>m, sfR: 330,           // metres from the stone forest's middle; its radius
  pondE:  (x,z)=>e, pondLevel: y,       // the pond's ellipse distance (1 at its edge); its level
  paddy:  {cell:[34,22], bund:.7, seed:77}
});
```

The host's `terrainH` is then `KGUILIN.top(x,z)` over the rock (a cap's `KSTACKS.topH`, or the height on a tapering
wall) and the plain elsewhere, so a plant's foot is on the drawn rock. The host draws the rock (47: four meshes on the
library's `rock.limestone.karst`, nwbay's waterline notch on the towers in the lake), the paddies' bunds, the horizon, and
the water (89w: the lake, the wadi, the pond, the wet paddies on core/water). `KGUILIN.build` takes the pond as
`{level, at}` and the lake as `{level}` for the lotus.

## What the kit gives

```js
KGUILIN.lay(o)              // above: the zone grid, the cliff points, the drapes, the paddies
KGUILIN.at(x,z)             // {zone, rock, top, d, footD, B, b, small, grove, river, lake, paddy, up, steep}
                            //   zone: crown, slope, cliff, ledge, rim, blade, wall, foot, water, shallows, shore, bank,
                            //   paddy, grove, plain
KGUILIN.top(x,z)            // the rock's height, or -Infinity off it;  KGUILIN.rockAt(x,z) the body, bed, wall and steepness
KGUILIN.footD(x,z)          // metres to the nearest wall's foot (34 when far)
KGUILIN.wall(B,b,a,u)       // a point on a bed's face (its taper and lean followed) and its outward normal
KGUILIN.CLIFF               // [{id, body, bed, a, x, y, z, nx, nz, up, kind:'scrub'|'fig'|'orchid'|'vine', s}]
KGUILIN.DRAPES              // creepers off the base's lip: [{id, body, bed, x, y, z, nx, nz, len}]
KGUILIN.PADDIES             // [{id, x, z, w, d, ang, poly, level, state:'flooded'|'young'|'green'|'ripe', crop:'rice', bund}]
KGUILIN.paddyAt(x,z), KGUILIN.paddyWater(x,z), KGUILIN.paddyDist(x,z,r)
KGUILIN.records()           // the layout as data: {rock (a krator-stacks export), cliff, drapes, paddies}
KGUILIN.build({R, quality, pond, lake})   -> {trees, heroes, far, bySpecies, borrowed:{...}, cliffs:{...}, under:{...}}
KGUILIN.place(cell, salt, accept(x,z,Z), fn(x,y,z,Z,i,j), {R, box, lodMax, wet})   the kit's grid: each cell's stream
                            // reseeded from a hash of (the kit's seed, the pass, the cell); wet skips the water mask
KGUILIN.SPECIES, KGUILIN.PLANTS, KGUILIN.HARVEST, KGUILIN.TREES, KGUILIN.canopyH(x,z), KGUILIN.nearestTree(sp,x,z)
KGUILIN.BPASSES             // nwbay's species this kit places: [{key, cell, accept(x,z,Z), pad, edge, water}]
KGUILIN.BTREES              // the borrowed trees placed: nwbay's tree records (NWBAY.make) with key, water, lv and,
                            // (a cliff fig stands at a tower's foot, its reach on the ground)
KGUILIN.reachOf(key, rb)    // a tree's root spread (the cliff fig 6.3 x its bole, this kit's 3 x)
KGUILIN.rootsFit(x,z,y0,reach,B), KGUILIN.groundFit(x,z,y0,reach)   // its spread all on body B's top / all on the ground
```

Every own species and plant carries the project's tags (climate, aridity, abyssal, riparian, koppen) plus `zone` and
`harvest` (`biomes/FRUIT.md`); rice carries `crop:'rice'` (`kits/crops`). The borrowed species carry nwbay's tags
(`biomes/nwbay/BIOME-API.md`).
