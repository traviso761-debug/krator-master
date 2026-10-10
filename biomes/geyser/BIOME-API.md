# The geyser kit — the contract

The kit sits on the shared biome core (`core/biome`, `CORE_BIOME` in `build.py`) like every kit: the host gives the core
its `BIO.init({...})` (THREE, scene, terrainH, waterH, mask, fields, ticks, register...: see
`biomes/hyperjungle/BIOME-API.md`), and nothing in the kit names a world's engine. What is particular to this kit is that
its ground comes first: **a host lays the thermal ground out before it has a terrain**, then builds its terrain with the
kit's relief.

## 1. Lay out (`46-biome-geyser-layout.js`, data only)

```js
GEYSER.lay({
  seed: 631, amb: 33,              // the air's temperature (degC): the run-off cools toward it
  ground: (x,z)=>y,                // the host's ground BEFORE the thermal relief (the run-off is traced on it)
  wind: [x,z],                     // where the steam leans (unit-ish)
  sink: (x,z)=>bool,               // where run-off ends: the host's river, the sea, a terrace flight
  runLen: 520,                     // the longest run-off (m); each source's own is shorter by its size
  geysers: [{key, name, kind:'cone'|'fountain'|'spouter', x, z, H /* the column, m */,
             period, pre, dur, steam, off /* s: the cycle, its preplay, column, steam phase, the clock's phase */,
             cone:{r,h,spire}, mound:{r,h}, pool /* a fountain's or spouter's pool radius */, twin:[dx,dz]}],
  springs: [{key, name, kind:'prismatic'|'pool'|'funnel', x, z, r, temp /* 0..1: 1 boils */, out /* run-off channels */,
            outW /* their width, x */, spread /* their fan, rad */, shield, milky /* a travertine spring: no mats */}],
  acid:    [{key, name, x, z, r, mud /* pots */, fumaroles}],
  fumaroles: [{x, z, r, n}],       // steam vents in the sinter
  flats:   [{key, name, x, z, rx, rz, a}],   // the sinter flats (ellipses, ragged)
  dead:    [{key, name, x, z, r}],           // the dead forest
  terraces:[{key, name, S2 /* the tiers' step, m */, cu, cv /* a pool's cell across and down the slope */, drop,
             lip, depth, dry /* share of dry pools */, minL /* the lowest pool's level */, seaB /* under it, a seed is the sea */,
             outfalls, temp:[top,bottom], across:[x,z], mask:(x,z)=>0..1, box:[x0,z0,x1,z1]}]
}) -> GEYSER.R   // the records: geysers (vents, top, cycle), springs (level, apron, Tc), mud (level), fumaroles, runoff, ...
GEYSER.cluster({x, z, r, seed}) -> spec   // a site the scale model marks only as a point: geysers, springs, an acid
                                           // field, a flat, a dead fringe; add ground, sink, terraces, hand to lay()
```

## 2. The host's terrain and water

```js
terrainH(x,z) = ground(x,z) + GEYSER.relief(x,z, ground(x,z))   // then the host's own cuts (a river: the min of it)
waterH(x,z)   = max(the host's water, GEYSER.waterAt(x,z, ground(x,z)))   // springs, pools, pots, the terraces' pools
```

The springs' levels are measured on exactly that terrain (each brims at its rim's lowest point), so a host must add the
relief as above. The relief: the sinter shields and the geysers' mounds, the ground levelled under each spring's rim,
the springs' bowls and funnels, the pools, the mud pots, the acid field's slump, the run-off's shallow beds, and a
terrace flight's steps (it replaces the ground inside its mask).

## 3. Reading it

```js
GEYSER.at(x,z[,b]) -> {T /* degC */, heat /* 0..1 of amb..100 */, sinter, film, acid, dead, spray, terr,
                       pl /* a terrace pool's water level (or -100) */, dx, dz /* the flow */, mud, vent, spring, level}
GEYSER.fields      -> {heat, sinter, film, acid, dead, spray, terr}: (x,z)->0..1, for BIO.init's fields
GEYSER.cycle(g,t)  -> {phase:'rest'|'pre'|'column'|'steam'|'spout', water /* 0..1 of H */, steam, next /* s to the next column */, u}
GEYSER.erupt(key,t)   // move a geyser's clock so its column starts at t (the preplay skipped)
GEYSER.records()      // the records as plain JSON (Godot: run the same cycles; the run-off with its temperatures)
GEYSER.chT(ch,s), GEYSER.chW(ch,s)   // a run-off channel's temperature and half-width s metres down it
GEYSER.poolAt(t,x,z) -> {A, B, db}   // a terrace flight's two nearest pools ({L: its level, ...}) and the distance to their edge
GEYSER.GLSL_LAY       // the stochastic layer sampler for a host's ground shader (needs uMacro)
```

## 4. Build

```js
GEYSER.build({R, quality, show:true}) -> {sinter, trees, bySpecies, ..., under, show}
//   57 the cones and the geyserite  ·  55 the trees and the dead forest  ·  60 the floor  ·  65 the show
GEYSER.SHOW = {t, U, setScale(px), setLight(k)}   // the show's clock (seconds) and uniforms; a host sets the point
                                                   // scale each frame (innerHeight*pixelRatio / (2 tan(fov/2))) and
                                                   // dims it at night; it ticks through BIO.tick
GEYSER.TREES, GEYSER.SPECIES, GEYSER.PLANTS, GEYSER.zones(x,z), GEYSER.make / grow, GEYSER.nearestTree
GEYSER.canopyH(x,z)
```

The show draws through `BIO.host.THREE` and `BIO.host.scene` (it is the one fragment of the kit that makes meshes of its
own: the springs' discs, the mud pots, the steam, a Points per geyser). A world with its own water or particles can
build with `show:false` and read `GEYSER.R` and `GEYSER.cycle` instead.

## Tags (project rule)

Every species and plant: `climate`, `aridity`, `abyssal`, `riparian`, `koppen` (`GEYSER.KOPPEN`: XA and XV, the scale
model's abyssal classes, and Af), `origin` (earth, native, dead), `heat` (splash, hot, warm, margin, acid, water,
dead), `harvest` (biomes/FRUIT.md; the pandan's keys are the catalog's `generic_fruit_pandan_keys`).
