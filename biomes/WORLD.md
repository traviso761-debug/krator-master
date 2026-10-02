# Biomes in one open world

Every biome kit today is its own page: one kit, one host, built whole at load. Krator is
meant to become one open-world map, crossed without a load screen, **in Godot** (Travis,
Oct 2026). The three.js kits stay what generates the flora and previews it; Godot runs the
world: streaming, LOD, culling, physics. So several kits must run together **when the world
is baked**, hand over to each other at their borders, and write what they placed as data a
Godot project loads tile by tile. This file is the plan and the contract changes it needs.

## The regions (Travis, Oct 2026)

The formal regions are not drawn anywhere yet; this is the adjacency as given. There is a
scale Krator map for rough placement, not in this repo.

| region | kit | neighbours (transition) |
|---|---|---|
| central hyperjungle | `hyperjungle` | nhighlands (steep), shighlands (steep) |
| eastern abyss | `eastabyss` | sedesert (steep) |
| eastern high desert | `sedesert` | eastabyss (steep), ebadlands, shighlands (gentle) |
| the Rift | `rift` | xanadu |
| southwest bay | `swbay` | shighlands (steep) |
| southwestern lowlands | `swlowlands` | nwlowlands, shighlands (gentle) |
| East Rift Highlands | `xanadu` | rift |
| northwestern lowlands | `nwlowlands` | swlowlands, nhighlands, korona |
| northern highlands | `nhighlands` | nwlowlands, hyperjungle (steep), nwbay (steep), korona |
| *in progress* northwest bay | `nwbay` | nhighlands (steep) |
| *planned* eastern badlands | `ebadlands` | sedesert |
| *planned* Korona | `korona` | nwlowlands, nhighlands |
| *planned* southern highlands | `shighlands` | swbay (steep), hyperjungle (steep), swlowlands, sedesert |
| *possible* | `ehighlands`, `sbadlands`, micro-biomes | |

A new kit starts on the shared core: list the core in `CORE_BIOME` in its `build.py`
(`core/biome/`, `core/README.md`) rather than copying a core into its `src/`.

## The terrain and the fields: the scale model (Travis, Oct 2026)

The world's terrain comes from the **Krator Scale Model** artifact's heightmap
(https://claude.ai/artifact/N76KxfMXL5C7hfRGHKJK5q, version 4.13), with a couple of polishing
passes before it goes to Godot. 4.10 and 4.11 softened the Inner Wall's outer flank (the ledge down to the
highland shelf and basin floor is now a slope reaching about 50 km either side of the 'Inner
Crater' region's outline; the crater-facing rim is unchanged); 4.12 weathered the four mesas in regions 37 and 38, carved the Bay of Voth off the
Ring Sea and raised geyser islands over a fifth of the West Ring isles; 4.13 turned region 42 to shallow sea, lowered region 41's plateaus, eased the
cliff along Crag Men's northern border and joined Spice isle into one landmass. Textures are re-shaded
and temperatures lapse-corrected to match: the scripts are in `tools/scale-model/`. The regions
collection now carries a `kind` (political, geographic or biome), one map layer each. What the artifact holds, as PNG rasters on one grid
(`fullW` x `fullH` = 1549 x 1393 at 2 km a pixel: 3,098 x 2,786 km):

- `h`: elevation, 16 bits (R,G) from -2,600 to +17,100 m, plus a water flag (B); `wl` water level;
- `z`: zones (basin, highland, outer rim, arctic, lake/sea, salt basin);
- `p`: rain (mm/yr); `tm`/`th`/`tl`/`tw`/`tc`: temperatures; `wd`: wind power;
- `c`: climate class, Köppen plus Krator's own (X abyssal above 1.9 atm, H hyperalpine
  below 0.6 atm), with the class table (code, name, colour, group) in the page;
- a `regions` collection in its database: named polygons drawn on the map. The 35 there now
  are cultural and political (Inner Crater, Empire of Iziz, The Rift, Vale of Xanadu...); a
  biome region could be a second kind of the same thing.

What follows for the kits:

- **The fields come from the rasters.** `wet` from rain, `cold` from temperature and
  altitude, `salt` from the salt-basin zone, `upland` from elevation, and the Köppen weights
  from `c` (blurred where Travis blurs them). One world, one set of fields, read by every kit.
- **Scale.** A kit's showcase covers about 6 km: three pixels of the model. The polishing
  passes have to make, procedurally, the landforms the kits plant on today (mesas, canyons,
  ridges, river beds at 10 to 30 m), and every kit's demo host is a reference for what its
  region's ground looks like close up.
- **The flora cannot be baked for the whole map.** At a showcase's density (~10k instances a
  km²) the continent is about 10^11 instances. Godot will have to grow the flora tile by
  tile at run time from the same rules, so the generators must stay deterministic per cell
  and driven by data (species tables, zone thresholds) to be portable, and what the three.js
  kits export becomes the reference a Godot generator is tested against, tile for tile.

## Two kinds of border

- **Gradual (an ecotone).** Most borders. Both kits plant across a band a few hundred
  metres wide, each at a density that falls off toward the other's side, so their species
  interpenetrate. The band's line is warped by noise so it never reads as a straight edge.
- **Steep (an altitude and pressure drop).** sedesert to eastabyss (the cataract over the
  Abyss), nhighlands to hyperjungle and "nw bay", shighlands to swbay and hyperjungle. The
  border follows the terrain: the high kit owns the ground above the scarp's crest, the low
  kit the ground below its foot, and the face between is rock with each kit's cliff flora
  on its own side. Weight comes from height (and slope) rather than from distance in plan.
  The air changes with it: haze, fog density and the sky's colour blend by altitude, so
  the atmosphere is the world's, not a kit's.

## Regions and climate: the biome tool (planned, Travis)

The full map will be built from two painted layers, marked with a biome tool (the polygon
and path tool in `nhighlands/src/93-host-polytool.js` is the nearest thing in the repo):

- **Regions.** Which kit owns the ground. A kit's weight `w(x,z)` is its region blurred:
  wide at a gradual border, narrow and keyed to height at a steep one.
- **Köppen climate classes inside a region.** Flora is placed by Köppen type (Af, Aw, BWh,
  Csb, Cfb, Dfc, ET...): each species carries the classes it grows in, and the world hands
  the kit the class at a point. Some classes are blurred in some areas, so a point carries
  soft weights over several classes, not one label.

What that asks of the kits and the core:

- **Every species tagged with its Köppen classes.** The inspector tags exist; this is one
  more tag per species, and can be done kit by kit before the tool exists.
- **Köppen as fields.** The core takes the classes as soft weights (`BIO.field('koppen:Cfb')`
  or a weight vector), the same way it takes `wet` or `cold` now. A kit's own zone thresholds
  stay as the fallback when the world binds no classes (every demo host today).
- **The weight is one function the core multiplies in,** so whether it comes from a hand
  border, a height band or a blurred painted raster does not matter to a kit.

## The air: `core/atmos`

The atmosphere belongs to the world, not to a kit, and `core/atmos/` (`ATMOS`) is where it
lives: one clock (`ATMOS.clock`: scaled, pausable, pinned for repeatable shots), one wind
(a veering base vector times the weather's scale, gust fronts travelling downwind:
`atmGust`/`atmWind` in GLSL, `ATMOS.windAt` in JS), the weather (rain, fog, storm, easing
in and out; the host applies fog density and sun in `apply(W)`), haze and night.

The biome core keeps a second clock today: `BIO.WIND.t` (30-core-foliage), advanced by the
host's ticks, swaying every leaf with no direction and no gusts. Iziz already loads both, so
its trees sway on their own clock while the banners and the smoke beside them ride ATMOS's
wind. For one world:

- **One clock and one wind** (in the core since Oct 2026). A host binds
  `BIO.init({clock:()=>ATMOS.clock.t, wind:()=>[w.x/b, w.y/b]})` (w the atmosphere's wind,
  `ATMOS.U.wind.value`; b the calm wind's length, `ATMOS.windBase.length()`): the foliage then
  sways on the world's clock (a pinned shot freezes the leaves too), harder as the wind rises
  (a storm's 2.4x), and leans downwind. A host that binds neither keeps the core's own clock
  and exactly the old sway. No world binds them yet: Iziz, the one world with both, vendors an
  older core (its `KNOWN_ISSUES.md`); the gust fronts (`atmGust`) are not in the leaves yet.
- **Altitude in the air.** A steep border is also a pressure drop: haze and fog density
  should follow height (thicker below the scarp), which is the weather's business.
- **In Godot** the clock and the wind are global shader parameters (`atm_time`, `atm_wind`,
  `atm_gust_amp`, `core/atmos/GODOT.md`), so the ported foliage shader reads them and the
  world has one wind by construction. The three.js change above is for the previews (Iziz).

## What blocks it today (checked in the code, Oct 2026)

1. **One global `BIO`, five versions of its core.** Whichever kit loads last replaces the
   other's core functions; hyperjungle declares `const BIO`, a syntax error beside any other
   kit's `var BIO`. Every kit must run on one core.
2. **Item and bucket names collide.** 59 item names are used by more than one kit (`trunk`,
   `rod`, `boulder`, `grass`, `frond`...). `BIO.def` runs at load, reports a repeat as an
   error and keeps the second kit's definition, so the first kit plants with the second's
   geometry and material. Bucket families (`bark0`...) collide the same way.
3. **Shader cache keys collide, silently.** `leafMat(tex,'grass')` caches as `biofol|grass`
   in four kits, and the hook bakes each kit's options (sway amplitude and more) into the
   shader source. three.js reuses the first program it compiled for the key, so the second
   kit's foliage sways and shades with the first kit's settings, with no error.
4. **One host binding.** One mask, one set of fields, one LOD spine. Every kit's
   `KNOWN_ISSUES.md` warns that its zone thresholds are tuned to its own fields' scale.
5. **Whole-map builds, all held.** nhighlands holds ~26M triangles, rift ~24M. Runtime LOD
   (xanadu, nhighlands) hides far chunks; it does not free them or skip building them.
6. **Placement depends on build order, not on place.** Each pass reseeds once and walks its
   whole grid, so a chunk built alone gets different plants from the same chunk in a full
   build, and a border changes with which side built first.
7. **Water at y=0** in eastabyss, rift and swlowlands (their in-water bands and floating
   pads). An open world has many water levels; `BIO.waterH` exists in the newer kits.

## The contract it needs

- **One core, `core/biome/`,** read by every kit's `build.py` by name (as `core/terrain/`
  is), with every kit's additions merged in.
- **A namespace per kit.** The core prefixes item names, bucket families and material cache
  keys with the kit's name, set where the kit loads and where it builds.
- **Biome weights.** The world hands each kit a weight `w(x,z)` in 0..1 (plan distance for a
  gradual border, height and slope for a steep one). The core multiplies the kit's mask by
  it; `BIO.grid` already accepts a cell with probability proportional to the mask, so the
  density cross-fade comes from the existing acceptance test. A shared occupancy index keeps
  two kits' trees apart in the band. The world's ground shader blends the kits' ground
  palettes by the same weights.
- **World fields, per-kit remap.** One set of climate fields for the world, and a per-kit
  adapter where a kit was tuned to a differently scaled field.
- **Placement seeded by cell.** A grid cell's draws seeded from its coordinates and the
  pass, so any region builds the same whatever was built before it. This moves every
  plant in every kit once: baselines and gallery shots change with it.
- **Export by tile, for Godot.** Godot streams, culls and fades; the kits only have to say
  what is where, tile by tile, as data (the conventions of `settlements/yuni/GAME_EXPORT.md`
  and `core/atmos/GODOT.md`: metres, +Y up, x east, z south; stable ids; tags in glTF extras):
  - **items** as one MultiMesh per item per tile: a Transform3D, the colour, and the foliage
    extras (`aN`, `aC2`). Those are nine floats and a MultiMesh carries eight (`COLOR`,
    `INSTANCE_CUSTOM`), so the normal goes octahedron-packed into two;
  - **buckets** as one glTF mesh per family per tile (indexed, vertex colours);
  - **materials as data**: each leaf, bark and fauna material's texture (the procedural
    canvases, as PNG) and its hook's options (sway, two-tone, iridescence), so the Godot
    side writes a handful of shaders once (foliage card, bark, iridescent bark, glow, animated
    fauna) instead of porting every kit's;
  - **LOD as data**: the hero tree and its stand-in (xanadu's runtime LOD already pairs them)
    become LOD levels with Godot visibility ranges; a far impostor is one more level;
  - **tags**: species, class, harvest and Köppen per instance group, for the inspector's
    successor in the game.
- **A bake pipeline.** A headless run (the `verify.py` harness already loads a kit in
  Chromium) builds each tile with every kit whose weight reaches it and writes the files. One
  terrain: the heightfield the kits plant on must be the one Godot draws, so the world's
  terrain and its ground paint need one source both read.

## Order

1. `core/biome/`, kits switched one at a time and proven unchanged (mesh fingerprints).
2. Namespaces and the cache-key fix in the core.
3. `waterH` in every kit; the shared fields contract.
4. Cell seeding (moves every plant once), then weights and the occupancy index.
5. The export contract (`biomes/GODOT.md`) and `BIO.export(tile)`, proven on one kit by
   loading a tile in Godot; then the bake pipeline over a gradual pair and a steep pair.

The Godot port comes later (Travis, Oct 2026). Until then the three.js previews keep being
optimised (runtime LOD, far impostors, impostor colour: items 2, 3 and 8 of the Oct 2026
review), and the Godot side gets SCAFFOLDING only: the contract (`biomes/GODOT.md`) and
`BIO.export()` in the core, so what a page places can already be written out as data in
the contract's shape, and nothing built now has to be torn up for the port.

Prototype pairs, proposed: **nwlowlands and swlowlands** (gradual; one kit was cloned from
the other, so the core work is tested without species surprises) and **sedesert and
eastabyss** (steep; the same cliff already exists from both sides: sedesert's cataract
falls to the Abyss floor, and eastabyss paints the shelf on an overlay dome). rift and
xanadu add one problem of their own: eight of xanadu's species are altered copies of the
Rift ridge's, so a world with both should carry one of each.
