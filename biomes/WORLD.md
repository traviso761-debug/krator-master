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
| *candidate* the scablands (in "n semiarid") | `scablands` | its basin's long lake to the south |
| *candidate* tuff country (in "The Catch") | `tuff` | the Catch's walls |

**Korona** lies in the north-east, under the gas giant (Travis, Oct 2026): a corona, a volcanic
structure with no Earth analogue, making a crazy quilt of small plateaus, depressions and
microclimates. Its neighbours above are as first given; with Korona in the NE, its border with
the NW lowlands needs checking against the scale model.

**Two candidates read off the scale model (4.19, Travis, Oct 2026).** Both are Earth landforms that are rare
because their conditions are rare, and Krator has the conditions.
- **Megaflood scablands in "n semiarid"** (biome region `rmuqm5qn5ek5g`): its west lobe is a closed basin that holds
  water to 1,160 m (68,000 km^2, ~36,000 km^3 over a 0 m lake level: three Bonnevilles). It spills at map pixel
  (409,144) and falls 1,160 m south in 95 km into the basin of the long lake on the region's southern edge; the
  joined basin would spill again SW at (262,292) toward the western lowland sea. The scablands (dry falls, coulees,
  potholes, giant current ripples, bare basalt channels) go on that 95 km stretch. It is steeper than Washington's
  (14 m/km), so cataracts and coulees more than braided plains. The basin is semiarid now (~420 mm, BSh), so the
  flood lake needs a wetter past: a breach in the Ancients' time is a story. The east lobe also closes (at 369 m)
  and spills into Korona's trenches.
- **Tuff country in "The Catch"** (geographic region `rmuf346nvpktx`): a dry floor below 1.5 km (31,600 km^2, BSh/BWh,
  ~300 mm, strong wind) walled by high ground, downwind (SE) of the Godthrone. Distance argues against it: the
  floor is 300-600 km from the summit, against ~50-100 km for the flows that laid Cappadocia's tuff. An
  Olympus-Mons shield is also a lava volcano, not an ash one, and its summit is near airless. It works if the
  Godthrone has had an explosive phase (a lore decision). The two vents just outside the Catch's SW notch, px
  (716,1128) and (770,1168), are ~180 km off but crosswind of the floor.

A new kit starts on the shared core: list the core in `CORE_BIOME` in its `build.py`
(`core/biome/`, `core/README.md`) rather than copying a core into its `src/`.

## The terrain and the fields: the scale model (Travis, Oct 2026)

The world's terrain comes from the **Krator Scale Model** artifact's heightmap
(https://claude.ai/artifact/N76KxfMXL5C7hfRGHKJK5q, version 4.19), with a couple of polishing
passes before it goes to Godot. 4.10 and 4.11 softened the Inner Wall's outer flank (the ledge down to the
highland shelf and basin floor is now a slope reaching about 50 km either side of the 'Inner
Crater' region's outline; the crater-facing rim is unchanged); 4.12 weathered the four mesas in regions 37 and 38, carved the Bay of Voth off the
Ring Sea and raised geyser islands over a fifth of the West Ring isles; 4.13 turned region 42 to shallow sea, lowered region 41's plateaus, eased the
cliff along Crag Men's northern border and joined Spice isle into one landmass; 4.14 bridged Spice isle to the central volcano and added five
geysers on the western crater floor; 4.15 made the eastern abyss's rim an escarpment like the Inner Wall's inner rim,
raised the ranges of the valley of Yuni (4.16 filled its south-eastern head), lowered five lakes that stood above their shores, and (4.17) kept the east rim gentle, raised a saddle across the abyss's floor and cut a
salt basin east of Verge; 4.18 levelled 'passage' and recomputed rain and climate where the heights changed; 4.19
set each recomputed cell's class from its own climate, ran the Yuni river from the valley's head into the lake at
Locus (`DATA.rivers`) and fixed the region tool's point dragging (`tools/scale-model/edit_heights.py`). Textures are re-shaded
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

## The first open world: `openworld/little-demo` (Oct 2026)

The owner's "little demo" region of the scale model (the eastern desert, ~1,080 x 1,370 km) at 1:1, in three.js as
the preview of what Godot will stream. What it settles of the plan above:

- **One host binding** for three kits (sedesert, eastabyss, hyperjungle) on one core: one set of world fields from the
  rasters (`openworld/little-demo/src/41-world-fields.js`), one per-kit remap (the abyss kit's `upland`), the kit's
  weight from the biome overlays blended over a few km (the gradual border).
- **Placement seeded by cell** (blocker 6), **level-free records** (blocker 8) and **trees as variants** (blocker 10):
  the world reads each kit's pass table and zones, seeds each cell with `KRAND.hash`, and draws each species as four
  variants the kit grew alone (`KIT.make`, `KIT.grow`, new in each kit's trees fragment), at the kit's own levels.
  The probe proves a tile is the same built alone or in any order.
- **The floor as patches**: each kit's `buildFloor` run on a 32 m patch under a zone's field profile, tiled on the
  near ground by the zones there.
- **Not yet:** a keep-clear that is order-free, the steep border (it has none: the abyss's edge is soft at 4 km),
  hero zones, rivers with water, the shared ground shader. `openworld/little-demo/KNOWN_ISSUES.md` has the list.

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

Items 1, 2, 3 and 7 are done (Oct 2026); 8 to 11 came from reading the kits against `GODOT-PLAN.md`.

1. **One global `BIO`, five versions of its core.** Whichever kit loads last replaces the
   other's core functions; hyperjungle declares `const BIO`, a syntax error beside any other
   kit's `var BIO`. Every kit must run on one core. *Done: all nine kits read `core/biome/`.*
2. **Item and bucket names collide.** 59 item names are used by more than one kit (`trunk`,
   `rod`, `boulder`, `grass`, `frond`...). `BIO.def` runs at load, reports a repeat as an
   error and keeps the second kit's definition, so the first kit plants with the second's
   geometry and material. Bucket families (`bark0`...) collide the same way. *Done: `BIO.kit(name)`
   gives each kit its own registry.*
3. **Shader cache keys collide, silently.** `leafMat(tex,'grass')` caches as `biofol|grass`
   in four kits, and the hook bakes each kit's options (sway amplitude and more) into the
   shader source. three.js reuses the first program it compiled for the key, so the second
   kit's foliage sways and shades with the first kit's settings, with no error. *Done: cache keys carry
   the kit (`BIO.kitKey`).* Item 11 is the same bug one level up.
4. **One host binding.** One mask, one set of fields, one LOD spine. Every kit's
   `KNOWN_ISSUES.md` warns that its zone thresholds are tuned to its own fields' scale.
5. **Whole-map builds, all held.** rift holds ~25.7M triangles, nhighlands ~24.4M. Runtime LOD
   (now in xanadu, nhighlands, rift, swlowlands, swbay and nwlowlands) hides far chunks; it does not
   free them or skip building them.
6. **Placement depends on build order, not on place.** Each pass reseeds once and walks its
   whole grid, so a chunk built alone gets different plants from the same chunk in a full
   build, and a border changes with which side built first.
7. **Water at y=0** in eastabyss, rift and swlowlands (their in-water bands and floating
   pads). An open world has many water levels; `BIO.waterH` exists in the newer kits. *Done: every
   kit plants against `BIO.waterH`.*
8. **The LOD level is decided at placement.** A tree's level (hero, stand-in, far impostor:
   `T.lv`) comes from its distance to the showcase's LOD spine (`BIO.lodD`), so the preview's
   camera is baked into the data. Godot needs every tree at every level.
9. **Every field rests on a `Math.sin` hash.** `rng` is mulberry32 and ports bit for bit; `h3`,
   and the `vnoise` and `fbm` built on it, do not, so a GDScript generator cannot reproduce a
   zone or a field.
10. **Hero trees are unique meshes.** Trunks and branches are built per tree and merged into
    buckets. A tile can be exported as meshes, but the continent's flora is grown at run time, and
    `GODOT-PLAN.md` ports no builder code. *Decided: variants by default, hero trees opt-in
    ("Hero trees: an opt-in", below).*
11. **Kit shader hooks on the shared `BIO`.** `BIO.iridBarkMat` is written in four kits;
    eastabyss and rift assign it unguarded with different signatures, so the last kit loaded
    replaces the others'. The gloss bark (nwlowlands, swlowlands), the impostor materials (rift,
    swlowlands) and swbay's fauna material are kit copies too.

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
  plant in every kit once: baselines and gallery shots change with it. Do it in the same
  event as the integer hash, the level-free records and the heightmap terrain (Order, step 6),
  so the plants move once, not four times.
  Three rules make cell seeding actually hold (from the procedural-world skill, n1ckyb/skills, MIT):
  - **Key on positions only.** A seed key that mentions a side, a direction, a winding, an ordering or a
    loop counter is not global, however global the rest looks: a lamp keyed on `(segment, side)`, bank
    planting keyed on a river segment's index, a window keyed on which way a wall was drawn. Describe the
    same road from its other end and the draw changes, so features flip at exactly one tile seam with no
    error anywhere. Key on the feature's own world position (a lamp post's point, a cell's coordinates).
  - **One owner per feature, never split at a seam.** A feature that crosses a tile edge (a road, a river,
    a wall, a hero tree's crown) belongs to the tile holding its anchor (the lower-index endpoint, the trunk's
    base) and overhangs its neighbour. Splitting it at the edge puts a joint in the middle of it; emitting it
    from both tiles doubles it.
  - **Repairs only add, never remove.** Rejecting, deleting or pushing things apart in visit order (the
    occupancy check in the ecotone, settlement lot relaxation, a "too close, drop it" pass) makes the result
    depend on which side was built first: blocker 6 again, through the back door, even with the right seeds.
    A repair either decides from position alone (the lower id keeps the spot), stays inside one owner tile,
    or adds. Never delete elsewhere to fix here.
  **Test it against the global functions, not against itself:** build a tile alone, inside a full build,
  and in two visit orders, and require identical records; reverse a road or river's segment order and
  require the same features. "Each feature appears exactly once" passes with ownership shifted by one cell,
  so it proves nothing on its own.
- **Placement records, then drawing.** Placement writes one record per plant (species,
  position, seed, size, tags, a deterministic id) and no LOD level; the draw pass reads the
  records and picks the level. This is `GODOT-PLAN.md`'s rule 5, and the records, not the
  meshes, are what a Godot generator is tested against.
- **Export by tile, for Godot.** Godot streams, culls and fades; the kits only have to say
  what is where, tile by tile, as data (the conventions of `settlements/yuni/GAME_EXPORT.md`
  and `core/atmos/GODOT.md`: metres, +Y up, x east, z south; stable ids; tags in glTF extras):
  - **items** as one MultiMesh per item per tile: a Transform3D, the colour, and the foliage
    extras (`aN`, `aC2`). Those are nine floats and a MultiMesh carries eight (`COLOR`,
    `INSTANCE_CUSTOM`), so the normal goes octahedron-packed into two;
  - **buckets** as one glTF mesh per family per tile (indexed, vertex colours);
  - **materials as data**: each leaf, bark and fauna material's texture (the procedural
    canvases, as PNG) and its hook's options (sway, two-tone, iridescence), so the Godot
    side writes a handful of shaders once (leaf card, bark, iridescent bark, gloss bark, far
    impostor, hanging sway, animated fauna) instead of porting every kit's. Each is a material
    kind in the core first: today four of them live in the kits (blocker 11);
  - **trees as variants, heroes opt-in** (Travis, Oct 2026): by default each species and habit
    is K baked variants (12 to 24, say), exported once as meshes and placed as instances by the
    records' seeds, since Godot grows the flora and ports no builder (blocker 10). Hero trees,
    built unique, stay as an opt-in for sites and zones that need them (below);
  - **LOD as data**: the hero tree and its stand-in (xanadu's runtime LOD already pairs them)
    become LOD levels with Godot visibility ranges; a far impostor is one more level. Every
    record carries all its levels (blocker 8);
  - **tags**: species, class, harvest and Köppen per instance group, for the inspector's
    successor in the game.
- **A bake pipeline.** A headless run (the `verify.py` harness already loads a kit in
  Chromium) builds each tile with every kit whose weight reaches it and writes the files. One
  terrain: the heightfield the kits plant on must be the one Godot draws, so the world's
  terrain and its ground paint need one source both read.
- **Residency is one decision, derived from the fog.** The tile load radius, the camera's far plane and
  the fog density are one choice: fog that erases everything past 600 m makes any tile beyond that pure
  cost. Change one and re-derive the other two (a heavier storm can shrink the radius). Then:
  hysteresis between the load and unload radius, so standing on a tile edge does not load and drop it every
  frame; one residency plan, computed once, that meshes, collision and life all follow (a tile you can see
  but walk through, or the reverse, comes from two policies drifting apart), with collision radius <= load
  radius < unload radius asserted; and a leak test that bounds the **peak** resident tiles and instances
  during a long walk, not only the count after unloading everything (a planner that never drops anything
  passes the second test).

## Against the port plan (`GODOT-PLAN.md`, re-assessed Oct 2026)

`GODOT-PLAN.md` is the repo-wide audit and port plan; this file and `biomes/GODOT.md` stay its
authority for flora. The biome kits are second in its audit order (after `core/`, which is done)
and are what its milestone M4, a first tile in Godot, needs. They start ahead of every other
lineage: one core, one PRNG (the only other copy is in nhighlands' sky), a host reached only
through `BIO.init`, a placement pass (`TREES`) apart from the draw pass in every kit, an exporter,
a probe and `--assert` in each, and every page matching `PORT-BASELINE.json`. What the plan changes
here, each an item in `TODO.md` ("Biomes: the port plan's findings"):

- **Builders do not port; the flora must still grow at run time.** The plan carries a builder
  over as its meshes. That suits a tile, not a continent of unique trees: hence trees as
  variants by default (blocker 10), placement as the one thing ported, and records as the
  golden data. Hero trees stay as an opt-in (next section).
- **Move the plants once.** The integer hash (`core/rand`, Phase 2), cell seeding, level-free
  records and the heightmap terrain (`core/terrain`, Phase 2) each reshuffle every kit. Do them
  as one event with one screenshot set, one baseline rewrite and one gallery update; tune preset
  views after it.
- **Shader hooks name a library shader** (the plan's rule 7). The kits' own hooks become core
  material kinds; that also fixes blocker 11.
- **The host shell** (Phase 1). The biome hosts (ten `host-*` sets, each its own version) are the
  easiest builds to put on `core/host`; the stage's terrain and fields go to `core/terrain`.
- **Tags and ids** on every record, for `core/tags` (Phase 2) and the fauna kit
  (`biomes/README.md`); the export's materials on the plan's shared vocabulary (Phase 3), then
  folded into `core/export/` (Phase 4).
- **Runtime LOD is preview-only.** The plan freezes it: a kit's range per chunk is data (it
  becomes `visibility_range`) and stays; new preview savings come from `core/lod`, which knows
  the biome sets and no kit lists yet, rather than more culling in the kits.
- **The audit.** Each kit's `PORT.md` carries provisional tags that need a person's pass (the
  stage is data as well as host; the trees are already split; floor and dress place and draw in
  one pass). The kits are inside the plan's scoped hand pass (`GODOT-PLAN.md` 3.3). `tools/audit_port.py`
  sees the core's exporter since 2026-10-02.

## Hero trees: an opt-in (Travis, Oct 2026)

Variants are the default; the hero tree code is kept, and unique trees stay available where
they are wanted. Nothing is thrown away: each variant is a hero builder run on one seed, and
a kit's showcase keeps drawing heroes in the preview.

- **What a hero is.** A tree built unique from its own seed by its species' hero builder and
  baked as its own mesh (with the kit's stand-in and impostor as its far levels). Godot never
  regrows it: it streams with its tile, as a settlement's buildings do.
- **Who opts in.**
  - **A site whose architecture is fitted to its trees.** Mav's Refuge is a tree city: its decks,
    levels, gate carvings and bridges are built on `trunkR(T,y)` of five residential and three
    gateway hypertrees, with 35 near ones round them. Those trees cannot be variants; they cross
    over with the settlement as meshes (`GODOT-PLAN.md` Phase 4). Girder's hypertrees are the
    same builder and can opt in the same way.
  - **A hero zone in a kit.** A region (later a zone of the biome tool) with a hero budget:
    hyperjungle's hero disc (~100 hypertrees in six species, 2 km across, whose `PERCHES` feed
    the fauna) is the first; named landmark trees anywhere are the same mechanism.
- **How.** The opt-in is data on the placement record (`hero:true`, with its seed), set by the
  site or the zone, never by distance from a camera (blocker 8). Outside an opt-in the same
  species is placed as variants. The Godot generator grows everything else, and inside a hero
  zone leaves the trees it owns to the baked set.
- **Budget.** Heroes cost memory, not generation: a tile's hero triangles get a budget, set
  when the first tile is measured. The bake pipeline bakes heroes per tile.
- **Preview.** A switch shows either look: every tree a hero (today's pages, the default for a
  kit's showcase) or heroes only where opted in (what Godot will draw).

## Order

1. `core/biome/`, kits switched one at a time and proven unchanged (mesh fingerprints). *Done.*
2. Namespaces and the cache-key fix in the core. *Done.*
3. `waterH` in every kit (*done*); the shared fields contract.
4. The port audit for the nine kits (`PORT.md`), then the kits' shader hooks as core
   material kinds (proven by fingerprints and screenshots).
5. Tags, Köppen and ids on records; the biome hosts onto `core/host`.
6. The reseeding event: `core/rand`'s hash, cell seeding, level-free records and the
   heightmap terrain together (moves every plant once); then weights and the occupancy index.
7. Variants and opt-in heroes in the core (decided: the section above), then the export
   contract (`biomes/GODOT.md`) and `BIO.export(tile)` proven on one kit by loading a tile in
   Godot (M4); then the bake pipeline over a gradual pair and a steep pair.

The Godot port comes later (Travis, Oct 2026). Until then the three.js previews keep being
optimised (runtime LOD, far impostors, impostor colour: items 2, 3 and 8 of the Oct 2026
review), and the Godot side gets SCAFFOLDING only: the contract (`biomes/GODOT.md`) and
`BIO.export()` in the core, so what a page places can already be written out as data in
the contract's shape, and nothing built now has to be torn up for the port. Preview work
follows the plan's tags: impostors, stand-ins and budgets are content and cross over;
new culling machinery does not (`core/lod` first).

Prototype pairs, proposed: **nwlowlands and swlowlands** (gradual; one kit was cloned from
the other, so the core work is tested without species surprises) and **sedesert and
eastabyss** (steep; the same cliff already exists from both sides: sedesert's cataract
falls to the Abyss floor, and eastabyss paints the shelf on an overlay dome). rift and
xanadu add one problem of their own: eight of xanadu's species are altered copies of the
Rift ridge's, so a world with both should carry one of each.
