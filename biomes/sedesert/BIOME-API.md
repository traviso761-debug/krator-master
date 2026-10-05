# Krator biome kits — the contract (eastern high desert edition)

One biome = one self-contained set of fragments (`5x..7x-biome-<name>.js`) sitting on one
shared, engine-independent core (`1x..4x core`). A world that wants the biome copies the
core fragments and the biome fragments into its `src/`, gives the core a `host` object,
and calls `build()`. Nothing in the core or a biome fragment names a world's kit
(`kdef/kput`, `BUCKET/MBK`, `PLATS`, `RIVER`…): `build.py` greps for those and fails the
build if one appears. The flora of a biome must move between worlds without a
re-implementation.

The core here is the eastern abyss kit's core (itself the hyperjungle's plus the origin
list, the fields and the grid window) plus two additive, backward-compatible things this
biome needed (an abyss or a hyperjungle fragment runs unchanged on it):

- `waterH(x,z)`: the LOCAL water surface. The earlier kits keep their water at y=0; a
  river that descends, or a pond in a hollow, hands its own level in. `BIO.waterH(x,z)`
  and `BIO.depth(x,z)` (= waterH − terrainH, positive under water) are what a fragment
  reads; the default is 0, so the old kits' `terrainH<0` and `depth>0` agree.
- A field a world does not bind reads 0 (`wet`, `salt` and `upland` keep their old
  defaults); `BIO.hasField(name)` says whether it was bound.
- `register(o)`: the world's inspector / probe hook; a biome calls `BIO.register({name,x,z,y,r,h})`
  for every volume worth naming. A world without one leaves it out.
- `lod`: the detail radii from the spine (`hero`, `mid`, `far`, `floor:[near,mid]`), a property
  of the world's spine that every pass reads through `BIO.LOD()`; `BIO.originBox(pad)` is the
  spine's bounding box, which the floor bands use as their window.
- `windows`: named rectangles a biome may ask for (`BIO.window('water')`): the desert's
  water-bound passes (palms, candles, reeds, swifts) look nowhere else.
- `BIO.grid(..., {depth:[lo,hi]})`: a window on `BIO.depth`; a species that stands in water
  carries its own (`SPECIES[i].depth`), the default keeps everything .3 m above it.
- The default `mask` is depth-based (nothing roots under the local water).
- `BIO.col = {shade, bright, vary, texMean, tint}`: the sRGB-aware colour maths.
- `BIO.strata(opt)` (35-core-strata): the bedded-rock shader every host and kit shares. A
  seeded column of beds (sandstone, shale, mudstone, bleached bands) of irregular thickness
  that dip and warp, with laminae, cross-bedding and varnish streaks. `S.inject(shader)` in
  an `onBeforeCompile`, then `strataColor(vSWP, vSWN)` in the fragment. The ideal host's
  ground uses it; a settlement can hand the same object to its building kit. Each bed's
  colour drifts along it (iron staining), varnish hangs from the bed tops, sand lies on
  ledges; `cap:[y0,y1]` bleaches the top of the column and `foot:y` banks dust at a floor.
- `BIO.carve` (`core/terrain/36-core-carve.js`, shared, not vendored: listed in
  `CORE_TERRAIN` in build.py): overhangs on a heightfield. `add({id, kind:'alcove'|'niche'|
  'undercut', c, n, hw, depth, h, floorY, base})` declares a patch, `kind(name,{plan,ceil})`
  registers a new shape; the host folds `recessD(x,z)` into its wall function (the floor
  runs in under the hood) and meshes the rock back above the void with
  `mesh(material, {sun})` (surface nets, `aOcc`/`aSun` per vertex). Queries: `covered` (the
  ceiling over a point), `topAt` (the rock's top over a patch), `rockAt(x,y,z)`, `floorOcc`,
  `floorSun`. With no patches every query is a no-op, so the ideal host loads it and
  declares none (the ideal host declares one: the undercut under the cataract's lip,
  `LIP` and `UNDERCUT` in 45, the worked example on a coarse world). Any other biome adds
  it by listing it in its own `CORE_TERRAIN` (`core/README.md` has the four steps).
- A host may give `window._api` `hostChecks()` and `hostNegatives()`; `verify.py --assert`
  runs them (each negative must fail) after the kit's invariants.
- `BIO.dynamic(name, geo, mat, count, {label})` and `BIO.tick(fn)`: the moving things
  (fauna) are InstancedMeshes the biome updates itself every frame.
- The merged buckets and the instance stores are growable Float32 stores (`BIO.Store`)
  with `push(...)` and `length`, so a fragment that writes `K.pos.push(...)` still works;
  bake copies nothing it does not need to.

## What the host provides (`BIO.host`)

```js
BIO.init({
  THREE,                        // r128
  scene,
  terrainH: (x,z)=>y,           // ground height, world space
  waterH:   (x,z)=>y,           // the water surface there (-1e9 where there is none)
  mask:     (x,z)=>0..1,        // density multiplier: 0 where nothing roots (water, footprints)
  obstacles:[{x,z,r,y0,y1}],    // cylinders nothing may grow inside
  ticks:    fn=>void,           // per-frame fn(dt,t) for the wind
  seed:     11,
  origin:   [[x,z],...],        // LOD spine (or one [x,z])
  center:   [0,0],              // the grids' disc
  register: o=>REG.push(o),     // the inspector's volumes (optional)
  lod:      {hero:800,mid:1500,far:2200,floor:[500,1250]},   // optional, these are the defaults
  windows:  {water:[x0,z0,x1,z1]},   // where the water is (optional)
  fields:{                      // THE CLIMATE. This is how a world zones the biome.
    wet:    (x,z)=>0..1,        //   0 bare crust .. 1 the water table at the surface
    flow:   (x,z)=>0..1,        //   0 dry .. 1 a bank of the river or the pond
    upland: (x,z)=>0..1,        //   0 the plateau .. 1 the top of the Inner Wall's slope
    canyon: (x,z)=>0..1,        //   1 the canyon floor, .5 a bench, 0 the rim and beyond
    rim:    (x,z)=>0..1,        //   the band just outside the canyon's lip
    rock:   (x,z)=>0..1,        //   badland, talus, mesa walls: exposed rock
    dune:   (x,z)=>0..1,        //   the trackless desert's sand
    oasis:  (x,z)=>0..1,        //   the pond's hollow
    slope:  (x,z)=>0..1,        //   the ground's gradient
    abyss:  (x,z)=>0..1 },      //   the cliff and everything past it (nothing grows)
  err, stat });
```

How the biome zones itself from those (55-trees, `SEDESERT.zones`):

| zone   | reads                              | flora                                                            |
|--------|------------------------------------|------------------------------------------------------------------|
| rip    | canyon, wet>.5, gentle slope       | mesquites (tall), wadi palms, reeds and sedge, dry grass, creosote, fallen mesquites |
| bank   | canyon × flow                      | tall mesquites, palms, twist-candles in the shallows, reeds        |
| bench  | canyon .15..95                     | desert roses, bottle trees, small mesquites, dragon trees          |
| rim    | rim                                | DRAGON TREES, cardons, desert roses, creosote, agaves              |
| oasis  | oasis (outside the canyon)         | palms, mesquites, dragon trees, reeds, blooms, candles at the margin |
| scrub  | open ground, low rock, low upland  | candelabra / cardon / Joshua-tree stands, mesquite shrubs (by wet), spinifex hummocks, tower-of-jewels stands, creosote, saltbush, hoodia, barrel, prickly pear, cholla |
| bad    | rock, open ground                  | hoodoos, bottle trees, boojums, rubble, agaves                     |
| mtn    | upland .06..95                     | quiver trees, puyas, agaves, dragon trees at the seeps, grey scree |
| desert | dune                               | the odd tuft, a boojum at the dune edge                           |

An `arid`-tagged species only reads dry weights (scrub / bad / mtn / rim / bench); a
`humid` one only bank / oasis; `semiarid` and `subhumid` read the floor and the rim as
well. The mesquite is one species whose size reads `wet`: 16 m on the bank, a 4 m shrub
500 m out in the scrub.

## The water colour

The host sets `var SEDESERT_WATER={hue:.42}` before fragment 50 loads (or calls
`SEDESERT.setWater(hue)` / `SEDESERT.build({waterHue})`). The river, the pond and the
cataract (host side, `WATER_*`, `MAT_FALL`) derive from it, and in the biome the reed
accents, the twist-candles' tint and their mint feet (`PAL.accent`, `PAL.candleTip`), and
every bloom (`PAL.comp`, the complement: for a teal pool, the desert rose's own pink).
The red desert stays red.

## What the biome exports

```js
SEDESERT.build({R:3250, quality:1, waterHue:.42}) -> {trees, heroes, far, bySpecies, ..., under, tris}
SEDESERT.dress(geometries, opt)     // growth on a structure (lichen, ledge plants, a rose or a young dragon tree)
SEDESERT.canopyH(x,z)               // approximate canopy top
SEDESERT.SPECIES                    // the 13 tree-scale species (tagged), SEDESERT.PAL the palettes
SEDESERT.zones(x,z)                 // the zone weights a world can reuse for its own placement
SEDESERT.PASSES                     // the species passes as data: {sp, cell, accept(Z,x,z), opt}
SEDESERT.standOf(x,z)               // which big succulent's stand this is (0 candelabra, 1 cardon, 2 Joshua tree)
SEDESERT.nearestTree(sp,x,z,minH)   // the nearest built hero of a species (a camera preset wants one)
SEDESERT.spiresOf(T)                // a twist-candle clump's far impostor as data: [{x,z,foot,top,...}] per spire
                                    //   (any clump, hero or not: a host checks the footing against its drawn water)
SEDESERT.FAUNA                      // the six fauna kinds (tagged); SEDESERT.ROCKS the basking places the floor left
SEDESERT.FAUNA_LAYOUT               // after build: thermals, flocks, bands, herds, packs, and the deer and coyote walkers (data)
SEDESERT.blooms / leafCol / small   // the shared plant helpers the floor and the dressing use
```

## The fauna (75)

Four kinds on the same contract, placed from the same fields: desert kites circling in
thermals over the mesas, the butte and the canyon (a few per thermal, banked into the turn);
wadi swifts in flocks over the pond and the river's water; sand striders, long-legged walkers
in bands pacing the canyon floor and the pond; rock lizards basking on the floor's boulders.
The static kind is put like any item; the moving kinds are dynamic instanced meshes driven
by one `BIO.tick`. Thermals and bands are registered volumes, so the inspector names them.

Two more kinds (2026-10): **canyon mule deer** (1 m at the shoulder; bucks carry forked antlers) in
herds of 3-8 in the riparian strip and at the pond (`rip`, `oasis`, `bank`), each deer walking its
own loop between the herd's browse points in the bosque and the scrub beside it, head down to browse
and up for a glance; and **coyotes** (0.6 m), singly or in pairs travelling in file, trotting long
loops (140-1000 m) through the `scrub`, the canyon floor and the badland, pausing to sniff or look
round. Both are WALKERS: a closed polyline, a trapezoid speed and stops at its vertices, and the pose
is a pure function of the BIO clock (`BIO.WIND.t`: the host's `clock()` when it binds one), so a port
replays it from the clock and the layout (`FAUNA_LAYOUT.deer`, `.coyotes`: `W.pts`, `W.tl`, `W.gy`).
Their ground is dry (`BIO.depth < -.3`), gentle (`slope < .45`), unmasked (`BIO.mask > .5`), clear of
the obstacles and the tree trunks; every 3 m of a path is tested, so a host's `mask` keeps them out of
its footprints. `build({fauna})`: `false` builds no fauna; a function `(kind,x,z)->bool` ('deer',
'coyote') is a host's own filter on top. Legs are their own instances swinging on the hips (this kit
does not load `35-core-anim.js`: its walk hook would need per-instance attributes the dynamic meshes
do not carry, and a CPU pose exports as plain matrices). Herds and loops are registered volumes
(`kind:'fauna'`, with the kind's `tags`). The presets 'Mule deer' and 'Coyotes' frame one where it is.

Then `BIO.bake()` once. Draw calls: one per instanced item + one per merged family (~45).

## Tags (project rule)

Every species record carries `tags:{climate:'hypertropic'|'tropic'|'temperate'|'cold',
aridity:'arid'|'semiarid'|'subhumid'|'humid', abyssal:true|false, riparian:'yes'|'no'|'both'}`.
This kit is `tropic`, `abyssal:false` throughout. A plant is never part of a building:
`dress()` places plants ON geometry the host hands it.

## File layout

```
10-core-head.js     BIO object, PRNG, noise, host binding (+ origin list, fields, waterH/depth), stats
35-core-strata.js   the bedded-rock shader (BIO.strata), shared by the host's ground and any kit
36-core-carve.js    (read from core/terrain) carve patches: overhangs on a heightfield (BIO.carve)
20-core-kit.js      instanced items (def/put), merged vertex-coloured buckets
30-core-foliage.js  leaf cards, alpha textures, Lambert foliage hook, wind
40-core-place.js    stands, jittered grids (+ box, noMask), keep-clear, face sampling
50-biome-sedesert-species.js   water-hue palettes, 13 species, textures, geometries (columns, candles, hoodoos, agaves), items (data only)
55-biome-sedesert-trees.js     zones from the fields; one builder per species (fork trees, column trees, the rest); impostors
60-biome-sedesert-floor.js     the floor by zone; reeds in the shallows; hoodoos; fallen mesquites
65-biome-sedesert-dress.js     growth on structures (lichen, ledge plants, a hanging succulent)
70-biome-sedesert.js           SEDESERT.build / dress / canopyH
75-biome-sedesert-fauna.js     the fauna: kites, swifts, striders, lizards; deer and coyotes (walkers); BIO.kitEnd
45-host-stage.js (ideal type only): renderer, the desert terrain (mountains, canyon, butte, mesas,
                                    badland, dunes, the Abyss), the fields (cached), the river ribbon,
                                    the pond, the cataract with its mist, the painted ground, BIO.init
80+ host (ideal type only): sky with the Inner Wall in the west and the Abyss haze in the east,
                            one Girder tower on the north rim, build order, camera + inspector, probe
```

To port: copy 10–75 (and 00-head/99-tail if starting fresh), write `BIO.init({...fields, waterH})`,
set `SEDESERT_WATER`, call `SEDESERT.build`, then `BIO.bake()`. Read KNOWN_ISSUES.md first.
