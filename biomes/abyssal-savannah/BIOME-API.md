# Krator biome kits — the abyssal savannah: the contract

The kit is on the biome contract of `biomes/eastabyss/BIOME-API.md` (the shared core in `core/biome`, a host object
through `BIO.init`, `build()`, one `BIO.bake()`). What is particular to this kit:

## What the host provides

```js
BIO.init({
  THREE, scene, terrainH, waterH, mask, obstacles, ticks, seed, origin, center, register, eye, err,
  lod:{hero:900, mid:1700, far:3200, floor:[480,1200]},   // the floor's three bands of cell size are cut at floor[0], floor[1]
  fields:{
    upland:(x,z)=>0..1,   // 0 the slope's foot (the jungle's last terrace) .. 1 the bench
    wet:   (x,z)=>0..1,   // the rain: ~.9 at the foot (Am), ~.2 on the bench (BSh), up in the gullies and the pan
    flow:  (x,z)=>0..1,   // a gully's floor and banks
    rock:  (x,z)=>0..1,   // bare rock: the risers' faces, the caprock rim, the kopjes
    salt:  (x,z)=>0..1 },  // the pan
  tags:'abyssal-savannah'});
```

## What the kit exports

```js
ABSAV.build({box:[x0,z0,x1,z1], quality:1, seed, kopjes:[{id,x,z,r,h,seed}], rim:{lip:[[x,z],...], c, r, y0, h}})
   -> {trees, heroes, mids, fars, ea, byKey, floor:{thatch, bunch, vain, rosettes, lilies, charred, forbs, boulders, figs, slabs, ...}}
ABSAV.zones(x,z)          // {foot, gallery, parkland, scarp, steppe, pan, grass, and the fields}: the weights a world can reuse
ABSAV.ZONEBANDS, setZoneBands(o)   // the zones' smooth() bands as data
ABSAV.burn(x,z)           // years since the patch last burned, 0..12 (12: the gallery and bare rock, which do not burn)
ABSAV.BURN                // the mosaic's cell, warp and the share of each young age
ABSAV.cells(salt, cell, box, accept, fn, opt)   // the placement grid: each cell reseeds the core stream from KRAND.hash(seed, salt, ix, iz)
ABSAV.SPECIES, ABSAV.PLANTS, ABSAV.HARVEST, ABSAV.PAL, ABSAV.PASSES
ABSAV.make(sp,x,y,z) -> T ; ABSAV.grow(T,lv)    // one tree alone (an open world's variants; the kopje fig)
ABSAV.TREES               // after build: every tree record (this kit's and the eastern abyss's read in place, T.ea)
```

`opt.kopjes` are the host's granite tors: the host raises their hills in its ground, the kit draws their boulder piles and
a kopje fig on some, and registers each (`kind:'feature'`). `opt.rim.lip` is the caprock's lip line: the kit lays blocks
along it and fallen ones on the talus below (downslope is -x on this host; a world with another orientation hands its own
lip and is to pass the downslope direction too: `KNOWN_ISSUES.md`).

## The eastern abyss, read in place

When `EASTABYSS` is on the page (its `50` species and `55` trees fragments, its registry closed by the host: `47c`), the
passes with `ea:` grow its species by `EASTABYSS.make` / `grow` at the slope's foot and up the gullies, scaled down a little
for the thinner air (`P.scale(Z)`). Without it those passes are skipped and the savannah stands alone.

## Tags (project rule)

Every species and ground plant: `tags:{climate, aridity, abyssal, riparian, harvest}` (`50-biome-absav-species.js`).
Placement honours them: the arid plants (stub lycopsid, rosette, pan-grass, saltbush) read the steppe, scarp and pan
weights, the subhumid tongue tree the gallery and the damp parkland.

## File layout

```
50-biome-absav-species.js   palettes, the species and plants (tagged), harvest, procedural fallbacks, materials, items (data + kit items)
55-biome-absav-trees.js     the cell grid (KRAND), the burn mosaic, the zones, keep-clear (KSPACE), far impostors, the builders, the passes
60-biome-absav-floor.js     the ground plants by zone and burn age, the kopjes' boulder piles and figs, the caprock
70-biome-absav.js           ABSAV.build; BIO.kitEnd
45-host-stage.js (host)     renderer, the rim slope's terrain (KRAND noise baked to a 12.5 m grid), the fields, the kopjes, the water levels, BIO.init, the ground and far meshes
47c-host-eastabyss-end.js   closes the eastern abyss's registry
88, 89a, 89s, 89w, 99       build order, core/atmos bind, the shared sky, core/water, the page handed to core/host
```
