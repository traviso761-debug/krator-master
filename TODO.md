# Krator: to do

A working list. Items marked *(Menagerie)* come from reading the World Menagerie embedded at
`host/WorldMenagerie/` (paths below are under it). Its code is read for ideas only: anything taken is
rewritten as a Krator fragment, never imported from `host/` (`tools/check_insulation.py`).

**Godot tags.** The repo-wide audit and port plan is `GODOT-PLAN.md`; it uses these tags. The plan (`biomes/WORLD.md`) is that three.js generates and previews, and Godot runs the open
world. The port works when **what** a thing is (data) is kept apart from **how** three.js draws it
(`biomes/GODOT.md`, `core/atmos/GODOT.md`). Each item is tagged:

- **[G data]** engine-neutral: an algorithm or data that crosses over through the exporters as it is. This is
  the most valuable kind; do these as data first, drawing second.
- **[G shader]** a shader trick that rewrites directly into a `.gdshader` (often through the global shader
  parameters `core/atmos/GODOT.md` already defines).
- **[G native]** Godot has this built in. Worth doing in three.js only for the preview; don't port it.
- **[web]** browser or three.js only. No Godot value.

Prefer items that are straightforward to port. **Godot order:** (1) the carver's floor and blocker list,
which becomes collision shapes and the navigation mesh source; (2) the land-cover map, which becomes the
terrain splat texture and the placement input; (3) the minimap drawn from exported data.

**Counts:** tags used: about 52 [G data], 27 [G shader], 17 [G native] and 18 [web] (some items carry two, and the legend above uses one of each).

## Port: next *(the ordered critical path; GODOT-PLAN.md, amended 2026-10-02)*

The one ordered list of Godot port work. The plans hold the why: `GODOT-PLAN.md` (phases, rules, milestones),
`biomes/WORLD.md` (the biome order), `core/materials/PLAN.md` (the library), `core/simulation/PLAN.md` (the sim),
`settlements/ys/GODOT.md` (Ys). When one of them changes the order, change it here in the same commit.

1. **DONE 2026-10-02:** the audit tool sees the shared exporters; Iziz's and Dalab's city build passes retagged;
   the minimap split into data and host (port lint 16 warnings to 2); the Voth lineage in the hash baseline;
   `core/rand` with golden vectors and its GDScript twin; Ys's city takes it.
2. **The Godot spike** (GODOT-PLAN.md Phase 7, "The spike"). **Underway 2026-10-05:** `godot/` holds the project,
   five exports (hyperjungle and rift tiles, Girder and Iziz as glTF, Iziz's atmosphere, Yuni's records) and their
   importers; `krand_test.gd` passes in Godot 4.5; the first gap list is in GODOT-PLAN.md ("The spike: first findings").
   Open: the look on Travis's machine in Forward+ (`godot/CHECKLIST.md`), the editor's glTF import, and the route
   Travis's friend used for the Voth kit (ask what it was).
3. **The Ancients re-vendor session** (`settlements/iziz/KNOWN_ISSUES.md`): Ancients to Iziz to Highlands to Xanadu
   and Reed Lake, and Jimjam, with `--assert`, screenshots and a new baseline. It gates Iziz's audit and its
   material work (M5).
4. **The scoped hand pass** (GODOT-PLAN.md 3.3). **DONE 2026-10-03: the ten biome kits** (tags, split notes, Notes paragraphs; `BIO.download()` split into `core/biome/43-core-export-host.js`, port lint 2 warnings to 1), **and Girder and Voth** (their `PORT.md`: tags and notes for every fragment over 10 KB, split notes, the Notes paragraph of PRNG, noise, `terrainH` and palette copies). **Iziz DONE 2026-10-05** (its `PORT.md`: tags corrected by reading the code, split notes on 90a, 90b, 90c, 85 and the mask readers, the own-copies Notes; Voth's `68-props.js` split note added). Still to do: Ys. Other builds
   keep provisional tags until a port session touches them.
5. **The biome reseeding event** (biomes/WORLD.md, Order 6): `KRAND` hash and noise, cell seeding, level-free
   records and a baked heightmap in one change, one screenshot set, one baseline rewrite. Brings `core/terrain`'s
   field with one kit as its first consumer. Needs the spike's findings on terrain.
6. **Ys's P3 placement pass** on `KRAND` (settlements/ys/GODOT.md item 4), as two data passes and one draw pass.
7. **The Girder pilot** (core/materials/PLAN.md). **Material half DONE 2026-10-03:** `core/materials/record/` (`KMAT`,
   `TEX.def`, adapters), `tools/textures/pack.py`, Girder on the library (`?mat=proc` for the old look). Open: the
   four texture gaps (leafy, web, ghostwood, prism gum) and the owner's look review. **`core/furnish` DONE 2026-10-05:**
   Girder, Mav's Refuge, Locus, Highlands and Post-Apoc place through it, fingerprints unchanged (`core/furnish/README.md`).
   **`core/tags` steps 1 and 2 DONE 2026-10-05:** the registry, vocabulary, label, node test and uid twin; Yuni on it,
   its records arriving in Godot as node metadata (`core/tags/README.md`). Steps 3 and 4 DONE the same day: core/furnish's five
   builds register their furniture (fingerprints unchanged); Iziz's `REG` and Voth's `PLACED` are read in. Next: the biome kits, with the
   reseeding event (`core/tags/PROPOSAL.md`).
8. **`core/mask` DONE 2026-10-05** (Iziz, Dalab, Erewhon, Roketstad place from it; `core/mask/README.md`). Next: Iziz's export
   on the `KRATOR_EXPORT` shape (M5).
9. **The host shell, narrowed**: the biome kits and one settlement per lineage; the rest when next touched.

## Features

- **DONE (first batch): `core/minimap/88-core-minimap.js` (`KMAP`), in Voth.** **Minimap** *(Menagerie: `src/moria/walk.js:130-149`)* **[G data]**. A 2D canvas panel, drawn from data
  rather than from the rendered scene. A base layer is painted once into an offscreen canvas: every walkable
  floor, sorted by height so upper levels cover lower, coloured by level, with labels. Each update (at most
  4 Hz, only while the panel is open) copies the base layer and draws the viewer's dot and view wedge.
  Hovering names the floor under the pointer; clicking walks there.
  - For Krator: a shared `core/` fragment that paints from each build's `PLACED` list (footprint, rotation,
    tag) plus hill shading sampled from `terrainH()`, and water. Colour by tag, click to fly or walk.
    Start with Voth, whose `PLACED` list is already exposed (`settlements/voth/src/85-probe.js:73`).
  - Godot: the same records drawn in a `Control._draw()`, almost line for line. Better still, bake the base
    layer to a PNG at export time and ship it with the tile.
  - Optional: a one-time overhead orthographic bake to a texture as the background, for the painted look.
    Hide the sky, fog and inspector helpers during the bake.

## Biomes: the port plan's findings *(GODOT-PLAN.md, re-assessed Oct 2026)*

The nine biome kits are next in the audit order (`GODOT-PLAN.md` 3.3, step 2) and are what milestone M4 (a
first tile in Godot) needs. They start ahead: one core (`core/biome/`), one PRNG, a host reached only through
`BIO.init`, a placement pass (`TREES` records) apart from the draw pass in every kit, an exporter
(`BIO.export`), a probe and `--assert` in each, and pages that match `PORT-BASELINE.json`. The plan and the
order are in `biomes/WORLD.md` ("Against the port plan"); the contract is `biomes/GODOT.md`. Suggested order:
the audit, the shader kinds, tags and ids, the host, the reseeding event, then variants with opt-in heroes.

- **DONE 2026-10-03: the port audit for the ten kits** (tooling, no tag; the scoped hand pass, `GODOT-PLAN.md` 3.3; the text below is what was asked, kept for the record). One finding differs from it: `65-dress` is not a `BIO.grid` pass, it samples the host's shells (`BIO.upFaces` and the like) and puts; its note says so. nwbay has since moved onto the shared core (2026-10-03).
  *The tool part is done (2026-10-02): `PORT-INDEX.md` names the `biome` exporter for every kit on the shared core,
  (nwbay too, since 2026-10-03).* Correct the provisional tags in each
  `biomes/<kit>/PORT.md` and write the split lists into its Notes: `45-host-stage` holds `terrainH`, the water
  and the fields, which are data `core/terrain` replaces (note it "split", not plain host); `55-trees` is
  already a placement pass and a draw pass; `60-floor` and `65-dress` place and draw in one pass (`BIO.grid`
  then `BIO.put`); `85-host-tower` is a preview prop (a builder); `82-host-sky` becomes a `core/atmos` sky
  preset.
- **[G shader] One copy of each biome shader hook, in the core.** The iridescent bark `BIO.iridBarkMat` is
  written in four kits (eastabyss, nhighlands, rift, xanadu), on the shared `BIO`: eastabyss and rift assign
  it unguarded and with different signatures, so with several kits resident the last kit loaded replaces the
  others' (a residency bug, not only a port cost). Also the two-tone gloss bark `barkMat2` (nwlowlands,
  swlowlands), the impostor `farMat` (rift: iridescent; swlowlands: gloss), nhighlands' hanging sway on its
  bulbs and pods, and swbay's own `animMat` beside `core/biome/35-core-anim.js`. Move them into
  `30-core-foliage.js` and `35-core-anim.js` as material kinds (`irid`, `gloss`, `far`, `hang`, `anim`) with
  their options as data, so the export names them and Godot writes about seven shaders for every kit: leaf
  card, bark, iridescent bark, gloss bark, far impostor, hanging sway, fauna body. Prove it with mesh
  fingerprints and screenshots: the HTML changes, the pictures must not.
- **[G data] Tags and ids on what the kits place.** Only nhighlands (harvest) and swlowlands carry tags in kit
  data, and no species has its Köppen classes. Put class, species, biome, Köppen and harvest in the `BIO.def`
  options, and give every item, bucket and placement record a deterministic id in build order, so
  `BIO.export` carries them and `core/tags` (Phase 2) takes the kits as they are.
- **[G data] One fauna kit** (Travis's call, `biomes/README.md`): every biome's fauna and the settlements'
  creatures in one kit on `core/biome/35-core-anim.js`, tagged by biome (the item above), each animal's motion
  a function of time (`aP0`/`aP1` paths; the life layer section below). swbay's local `animMat` retires with it.
- **[web] The biome hosts as the first `core/host` customer** (Phase 1). The kits' host fragments
  (`host-stage`, `-sky`, `-build`, `-camera`, `-probe` in ten builds, `host-tower` in eight) are each their own
  version (`PORT-INDEX.md`, host-shell copies), but a kit reaches its host only through `BIO.init`, so these
  are the easiest builds to put on one shell. The stage's terrain, water and fields go to `core/terrain`;
  its DOM goes to the host. `BIO.download()` is split out (2026-10-03) into `core/biome/43-core-export-host.js` [web];
  it joins `core/host/` with the rest in Phase 1.
- **[G data] Placement records carry no LOD level.** Each kit picks a tree's level (hero, lite stand-in, far
  impostor: `T.lv`) as it places it, from the tree's distance to the showcase's LOD spine (`BIO.lodD`): the
  preview's camera baked into the data. Godot has no spine and needs every tree at every level. Placement
  writes level-free records; the draw pass picks the level in the preview; the export carries hero, stand-in
  and impostor as levels of one record (`biomes/GODOT.md`, "Not done yet").
- **[G data] One reseeding event for every kit.** `rng` in `core/biome/10-core-head.js` is mulberry32
  (integer: it ports bit for bit). `h3` is a `Math.sin` hash, and `vnoise`, `fbm` and so every field and zone
  rest on it, which a GDScript generator cannot reproduce. Do together, once: `h3` onto `core/rand` (Phase 2),
  placement seeded by cell (`biomes/WORLD.md`), the level-free records above, and each kit's `terrainH`
  closure baked to the `core/terrain` heightmap. Each of these moves every plant; together they cost one
  screenshot set, one `tools/port_baseline.py --write` and one gallery update, not four. Tune preset views
  after it, not before.
- **[G data] Trees as variants by default, hero trees opt-in (Travis, Oct 2026).** Trunks and branches are
  built unique per hero tree and merged into buckets; only leaf cards, floor and dress are instanced. Godot
  grows the flora at run time (`biomes/WORLD.md`), so unique trees everywhere would mean porting the tree
  builders to GDScript, which the plan rules out (a builder crosses over as its meshes). So: K baked variants
  per species and habit (12 to 24, say) exported as meshes, chosen by each record's seed, with per-instance
  scale, turn and tint; only placement is ported, and the golden test compares records, not meshes. The
  preview gains too: instanced variants instead of unique trees cut held triangles (rift holds 25.7M in 1,737
  meshes) and build time.
  - **Hero trees stay, as an opt-in** (`biomes/WORLD.md`, "Hero trees: an opt-in"). The hero builders are
    kept (each variant is one of their seeds). A record marked `hero` by a site or a hero zone is built unique,
    baked per tile as its own mesh and streamed by Godot, never regrown. First users: Mav's Refuge, whose
    architecture is built on its trees' `trunkR` (and Girder's hypertrees, the same builder), and
    hyperjungle's hero disc. A hero budget per tile; a preview switch between every tree a hero and heroes
    only where opted in.
  - Mav's Refuge's and Girder's `60-trees.js` carry a provisional host tag in their `PORT.md`; they are
    builders, and their trees cross over as meshes with the settlement.
- **[G data] `BIO.export` onto the shared vocabulary** (Phases 3 and 4). Material records onto `{family,
  colour, map, roughness, metal, emissive, doubleSided, alphaTest, hook}`, with `hook` naming a library shader
  (the kinds above); a `convention.colour` per table (the biome export is linear, the atmosphere's sRGB); then
  fold it into `core/export/` as the `krator-world` template. The canvas painters (3 to 9 per kit) bake to
  PNG, which the export already does.
- **[G native] Preview LOD: adopt `core/lod`, stop growing the kits' own.** The plan freezes runtime LOD as
  preview-only. A kit's per-chunk `BIO.range`/`minRange` is data (it becomes Godot's `visibility_range`) and
  stays; `BIO.lodTick` is preview machinery. `core/lod` already knows the biome sets (class `biome`,
  `minPx:0`) and no kit lists it: measure it on rift (clustered proxies for merged buckets, frustum-culled
  instance copies) before any more bespoke culling. The paused rift pass keeps its range data and profiling.

## Underground and interiors *(Menagerie: Moria)*

- **DONE as a registry: `core/walk/20-core-walk.js` (`KWALK`); no build writes to it yet.** **[G data] The carver registers walkable floors and blockers as it builds** (`src/moria/carve.js`).
  `room()` and `passage()` write `{rect,y}` or `{a,b,w}` floors and `[x0,x1,z0,z1,y0,y1]` blocks as they
  build. The walker, the minimap and click-to-go all read that one list, so they can never disagree with the
  geometry. Krator's walk solids (girder `83-walk.js`) and its geometry are kept separately. In Godot the
  same list becomes collision shapes and a navigation mesh source; export it next to the geometry.
- **[G data] Walls are built split round their openings**, not cut afterwards: each wall is pieces left of,
  below, above and right of each opening (`carve.js:28-36`). No CSG is needed, and no hidden faces. The
  geometry exports as it is.
- **[G native] Draw underground only when you are under ground** (`src/moria/deep.js:15-24`). Everything built
  after a marker goes into one group. That group is drawn only when the camera is below the terrain or near
  a gate, and the terrain is hidden while you are under. It saved a laptop from crashing. Screamers' vaults
  and the dam tunnels could use this. Godot: occluders and visibility ranges do this, but the group toggle is
  one line if wanted.
- **[G data] Fade to dark underground, and carry a lantern** (`deep.js:26-41`): ease a 0-to-1 "under" value.
  Scale the sun, hemisphere and ambient down from the values the day/night code just set, close the fog in to
  black, and move a camera lantern that already exists at intensity 0. Lights are never added or removed,
  because that recompiles every material. Export the "under" volumes and the curve; Godot drives its
  Environment the same way.
- **[G native] Three moving lights for a whole city** (`src/moria/realm.js:31-44`). There are a few point
  lights, moved four times a second to the nearest of a list of light spots. Hundreds of lamp heads are one
  InstancedMesh of unlit material. Godot's Forward+ renderer handles many lights; the pool still matters on the
  Mobile and Compatibility renderers. Export the light spots either way.
- **[G shader] Shafts of daylight without lights** (`src/moria/halls.js:163-172`): an additive open cone from
  the window to the floor, an additive pool on the floor, and a bright sky card behind the opening.
- **[G shader] "See inside": the mountain as glass** (`deep.js:46`): terrain at opacity 0.18 with depth write
  off. Hidden features (the Endless Stair) are drawn only in that mode.
- **[G native] Polished stone underground uses Phong** (per pixel) so lantern light runs in the walls. Lambert
  is per vertex and loses a small light on big planes. Godot shading is always per pixel.
- **[G data] One switch for lit and dark states** (`src/moria/city.js:259-262`): a whole city changes from
  inhabited to ruined by swapping colours and emissive intensity, never geometry. This fits Krator's ruins and
  inhabited variants. Export both palettes.
- **[G data] The generator checks that every hall is covered by rock** (`tools/make-moria.py:20`). This could
  be an assert in `verify.py` for carved builds; run on the export, it guards the Godot side too.

## Interiors *(Menagerie: the Backrooms, `src/backrooms/`)*

Krator's interiors planner (`kits/interiors/src/46-planner.js`) already splits a floor plate, cuts openings
and outputs walls, doors and a room graph, so the layout side is covered. What the Backrooms adds is about
making many rooms look lived-in cheaply.

- **[G data] Light baked into vertex colours** (`level.js:216-241`). Every surface is cut into a grid of about
  0.6 m. Each vertex adds up the ceiling panels within 7 m that it can see. Visibility is a 2D walk along the
  grid lines, so light goes through doorways and walls cast shadow. A direct term and a soft fill term are
  clamped to 1.7. The cost is nothing per frame and no real lights. Godot's LightmapGI cannot bake rooms
  generated at runtime, so export the colours as mesh `COLOR`. Use it for furnished rooms, with the catalog's
  lamps as sources.
- **[G shader] Per-lamp flicker without lights** (`level.js:176-188`, `:437`). Each vertex stores how much of
  its light comes from a flickering panel and that panel's phase (attribute `aF`). The shader dims by
  `share·(1−flick(t,phase))`, so the wall flickers with the lamp. Lamp state is on, dead or flickering.
- **[G data] Grime from world-space noise, not in the texture** (`textures.js:7-9`, `level.js:243-252`).
  Textures are one clean repeat at real size (wallpaper 1.2 × 3 m, a ceiling tile 1.2 × 0.6 m). Stains, damp
  creeping up walls and puddles go in vertex colours from fbm over world position, so no stain repeats.
  Stains tint brown rather than grey. This fits every Krator interior and ruin.
- **[G data] Room-variety rules as numbers, one generator per level** (`level.js:28-51`):
  - the chance two rooms merge, leaving columns where the wall would be;
  - partial walls that stop short;
  - one-door versus full-width openings;
  - weighted ceiling heights, with narrow halls more often low;
  - a lighting mode per room: full, alternate, dim or dark, with rates for dead and flickering panels;
  - lamp colour, ambient light and fog.
  Office, car park and pool hall are one generator with three presets. Worth adding to the interiors
  programmes as a `variety` block.
- **[G data] Streaming interior chunks from the seed** (already listed under Worlds): each chunk boundary
  forces one opening, so neighbours always connect.
- **[G shader] Pool caustics** (`level.js:199-213`): two crossed sine fields, `pow(|a+b|·0.6, 3)` for the
  bright lines. Ten lines; useful for baths, cisterns and fountains.
- **[G data] Procedural ambient sound** (`sound.js`): mains hum as a 120 Hz sawtooth through a band-pass, a
  60 Hz square, a high whine and hiss, all slowly modulated. Each level swaps the recipe. The parameters
  port to Godot's `AudioStreamGenerator`; the Web Audio code is [web].

## Props to harvest into the catalog *(Menagerie)*

Most Menagerie props are city-scale, one primitive each, so few are worth taking. The ones listed are pure
geometry merged per material, so they are **[G data]** unless marked otherwise. Convert each to the
`kits/furniture/SPEC.md` shape (`F.*` and palette keys, a declared size). Iziz's and Voth's props are
Krator's own already.

**Real gaps:**
- **Siege engines** (`src/middleearth/hosts.js`):
  - a counterweight trebuchet (`mkEngine`, :249) whose beam sits on a pivot group, so it can swing; it needs
    a sling and a windlass added;
  - a four-storey siege tower (:293) with braces, a hide front, wheels and a drawbridge;
  - a ram slung on chains under a wheeled gantry (:327, parametric length and radius).
  Suits Beast Riders, Voth and Republican. They are too big for furniture, so make a small siege kit or a
  `type:'engine'`. The pivot maps to a Godot AnimationPlayer.
- **Pressurised outpost modules** (`src/europa/details.js:54`, one recipe with a `kind`):
  - a hull on legs with domed ends, an airlock door, a window strip and an antenna; the lab version adds a
    radiator;
  - a domed tank;
  - a ribbed Quonset garage;
  - a steam-pipe run on trestles (:27).
  For Ancients sites, intact or ruined, and post-apoc. Low effort. (Its dishes duplicate
  `kits/ancients/src/86-dish.js`.)
- **Vehicles** (`src/arrakeen/machines.js`):
  - an ornithopter with hinged wings (:20);
  - a carryall whose grapples drop and whose suspensor bags fill (:46);
  - a tracked harvester (:73).
  Each is a factory returning a Group with `update()`. The silhouettes are recognisably Dune, so reshape them
  before taking them. For Ancients, post-apoc and the Iziz spaceport.
- **A shoji and tatami building kit** (`src/infinitycastle/kit.js`):
  - `room()` in ken modules (:74): tatami, fusuma, shoji, a veranda, a hipped roof and a paper lamp;
  - galleries, stairs and bridges;
  - sliding panels.
  It is already data-shaped (`B.box/quad/beam` by material name). The paper surfaces are canvas textures
  [web]; bake them to PNGs. For Republican's Korean strand or Xanadu.
- **Signage** [web for the text] (`src/fleshpit/signs.js:20,51`, `src/nightcity/neon.js:39,107`,
  `src/kowloon/life.js:132`): boards, backlit signs, blade signs, projecting signs on arms. Kowloon's window
  cages, AC units and pipe bundles (:105) suit post-apoc facades. Bake a PNG atlas of Krator strings in izani
  glyphs. Do not port neon.js's `BRAND` table, which holds real trademark names.

**Ideas for existing pieces:**
- **Guardian statue** (`src/moria/city.js:71`): a robed, bearded figure with an axe, scaled by height. A
  generic ruin statue.
- **Forges** (`src/moria/city.js:148`): take the hood and chimney, and the glowing pour channel. In Godot the
  coal and the pour need emissive materials.
- **Festival marquee** (`src/shire/party.js:26,35`): three peaks, a valance and trestle tables, plus
  pavilions. For Rustic.
- **A lofting toolkit for hull builders** (`src/starship/parts.js`: `lathe`, `tube` with cross-sections,
  `sweep`, `grille`): could help `kits/ringsea/src/42-rs-hull.js` and the Ancients.

Skip: the street furniture (one primitive each), Moria's headframe, carts, chests and well, the gondolas, and
the pumpjack. Krator's are better or the same.

## Shafts, caverns and organic interiors *(Menagerie: the Flesh Pit, `src/fleshpit/`)*

Krator has no vertical shaft, cavern network or organic interior. The eastern abyss paints its shelf wall on
a backdrop sphere, and `core/terrain/36-core-carve.js` only does overhangs. Candidates for a new
`core/terrain/37-core-shaft.js` beside carve, and for locus, eastabyss and the screamers' underground:

- **[G data] The shaft as a profile, with layers in data** (`organism.js:50-75`). `radiusAt(d)` interpolates
  radius per layer, adds cavity bulges and pinches at layer boundaries; `wallAt(d)` flares the mouth to meet
  the hole cut in the ground. Every other module places itself from these two functions. The profile could
  feed carve's `recessD`, so the heightfield opens over the shaft.
- **[G data] The shaft wall** (`organism.js:164-206`): rings of 72 vertices every 6 m. The radius is
  multiplied by wobble, wandering veins (`pow(max(cos),7)`), grooves and creases. Vertex colour darkens with
  depth. Pure array maths, so it becomes an `ArrayMesh`. Rock or a sinkhole with a different palette.
- **[G shader] A strata cut-face shader** (`section.js:91-176`). Depth below the local ground is warped by
  fbm into bands: soil, laminated rock with cracks, seams, then folded beds. Each bed has its own thickness,
  creases between folds, `fwidth`-faded fibre, a wet sheen along each fold crest, lens bodies the beds bow
  round, and beds sagging round the shaft. Every input is world position. With a rock palette it is a
  geology material for any cliff or cut face (`core/materials`). Krator's strata today are `sin` shelves
  (`settlements/highlands/src/73-hl-carve.js:217`).
- **[G native] Back faces only for interiors** (`organism.js:110-115`): walls drawn `BackSide` with faces wound
  outward. From inside you see the far wall; from outside the near wall vanishes, which is a free cutaway.
  Godot: `cull_front`.
- **[G shader] Fluid that fills a volume to a level** (`lungs.js:41-48`): a copy of the cavity mesh whose
  vertex shader clamps `y=min(y,uLevel)`. It is a flat-topped body that rises as `uLevel` animates. For
  flooding cisterns, basins and ruins.
- **[G data] Side tunnels from a small spec** (`tunnels.js:41-110`): `{d,a,r,len,bends,wander,drift,state}`
  makes a Catmull-Rom tube that drifts in plan and depth. A black cap at the far end makes the light die
  rather than the tunnel stop. The mouth gets a bulkhead, a grille, a ladder and a blinker. `state`
  (sealed, surveyed, worked) adds rails, a cart and work lamps. Godot: `Path3D`.
- **[G shader] + [G data] Breathing** (`organism.js:78-107`): a sine wave running down the axis pushes
  vertices radially in the vertex shader. The same function in JS drives the matching machinery (rams), so
  steel and wall stay in step. It is the injection technique `core/biome/30-core-foliage.js` already uses
  for sway.
- **[G shader] A pulse band running along a conduit** (`anatomy.js:30-46`): emissive
  `pow(max(0,sin(phase+y·k)),sharp)`, with a two-stroke heartbeat. For glowing conduits, ley lines and power
  cables (`core/materials`). See also City 17's climbing pulses below.
- **[G data] Lamps hung by who installed them** (`organism.js:131-141,893-906`): the colour names the owner
  (sodium, fluorescent, mercury vapour). Strings every 40 m, denser where people walk. All glows are one
  additive point cloud. Wall brightness scales with depth. An `underground` atmos preset.
- **[G data] Organic forms:**
  - brain-fold bulbs from crossed sine fields, with groove depth reused as colour (`springs.js:44-73`);
  - lobed lungs (`lungs.js:54-96`);
  - a branching tree steered to stay inside a volume (`lungs.js:104-152`), for roots, coral and cave growths
    (`core/biome` trees have no containment test);
  - wall growth whose density rises with depth, merged per material (`organism.js:226-279`).
- **[G data] Visitors:** queues that advance a slot every 5 s, and evacuation blended to the nearest exit with a
  per-person delay (`visitors.js:35-52,129-160`). Krator's crowds have neither. Creatures that climb the
  wall by riding `wallAt(d)` (`fauna.js:178`).

**City 17's climbing light pulses** (`src/city17/landmarks.js:104-115,163-167`) are not a shader. Each conduit
is a column of nine translucent unlit boxes, and the pulse is a separate bright box. Every frame its height
is `fract(time·speed + phase)` mapped onto 10–90% of the tower. It is pushed out from the axis by the tower's
own width at that height (`wid`, `dep`), so it hugs the taper. Its opacity breathes with a sine and with
night. **[G data]** as written: a pure function of time, which Godot can drive identically. The cheaper way
in both engines is the pulse-band shader above, **[G shader]**: one emissive band on the conduit material,
with no extra mesh.

## Small set pieces worth taking *(Menagerie)*

- **[web] → bake to PNG, or [G shader] A painted pine on gold leaf** (`src/infinitycastle/mats.js:92-122`,
  `fusuma()`). These are the sliding panels at the back of every room, including Muzan's lab. It is painted
  on a canvas:
  - gold leaf laid in 14 px squares, each a little different, with fine seams;
  - bands of cream cloud (suyari-gasumi) in rounded strips;
  - rows of wave arcs along the foot;
  - a pine drawn as a recursive branch: quadratic-curve limbs that narrow by 0.6 a step, with an ellipse of
    needles at each joint;
  - black lacquer frames and round pulls.
  It is painted across four panels so a run reads as one picture. The recursive pine is a small, reusable
  recipe for any painted screen, mural or banner (Xanadu, Republican). Bake it to a PNG for Godot, or keep
  the recipe as data and paint it at export.
- **[G data] + [G shader] A glowing floor sigil** (`src/infinitycastle/places.js:291-294,409-424`, Akaza's
  hall). A 1024² canvas is drawn with `shadowBlur` for the glow: rings, twelve needles with branch ticks that
  make it a snowflake as well, diamond points and a tick rim. It lies on a plane 3 cm over the floor with
  **additive blending and depth write off**, tinted cyan. Each frame its opacity breathes
  (`0.7+0.25·sin(1.3t)`) and it turns slowly (`0.05t`). A cyan point light and a glow sprite above make it
  light the room. Repurpose it for ritual circles, Ancients floor seals, portals and landing pads. In Godot:
  a `Decal` with emission, or an unshaded additive quad; the sigil could be drawn in a shader from polar
  coordinates.
- **[G shader] Horizon fire-glow behind the far range** (`src/minastirith/shadow.js:58-67,124`). It is one
  plane at 0.99 of the backdrop radius, a little north of east, facing the camera. It uses an additive
  shader (`One, One`) with no depth test, drawn just after the sky (`renderOrder -0.7`). The fragment is an
  elliptical Gaussian, `exp(-r²·9)` with y stretched 2.2×, in deep orange. Its strength breathes with two
  slow incommensurate sines (`0.55+0.15·sin(0.7t)+0.08·sin(3.1t)`). The same file lights the underside of
  the cloud deck red toward the fire (`:96`: `exp(-max(d.y,0)·7)·smoothstep(-0.2,0.8,d.x)`).
  - **For Krator's far volcano:** swbay's far-country volcano (`biomes/swbay/src/45-host-stage.js:212-252`)
    and Voth's baked volcano dome (`settlements/voth/src/21-sky.js:188+`). Put the glow on the volcano's
    bearing, raise it at night through `atm_night`, and tint the low sky and the base of the plume.
  - In Godot it is a quad in the sky layer, or the same Gaussian added in the sky shader on the volcano's
    direction, which is simpler.

## Fixes *(Menagerie runtime)*

- **[web]** Recover from a lost WebGL context: `preventDefault` on `webglcontextlost`, show a panel, restore.
  No Krator build does this (`src/core/shell.js:31-43`). One place for it is `gallery/krator-bar.js` `tune()`.
- **[web]** Isolate errors per subsystem in the frame loop. In Voth, `updateLife`, `skyAdvance` and the HUD
  sit outside the try (`settlements/voth/src/80-camera.js:303-319`), so one throw means it never draws again.
- **[web]** Input guards: clear held keys and pointers on blur and on hidden tabs; end a pointer when
  `buttons===0`; ignore keys while typing (`src/core/input.js`).
- **[web]** Leave a cut plane installed and park it at `constant=1e7`, instead of swapping `clippingPlanes`
  and recompiling (`settlements/yuni/src/76-doors.js:259`, `kits/interiors/src-walk/70-walk.js:213`).
- **[web]** Call `renderer.compile(scene,camera)` before hiding the loader.
- **[web]** Redraw the shadow map only when the target moves or the sun turns.
- **[G native]** Adaptive resolution (detail before pixels, remember a ratio that failed, hysteresis). Godot
  has resolution scaling built in; the controller logic would carry over if it is ever needed there.

## Rendering ideas *(Menagerie)*

- **[G shader]** Cloud shadows and rain darkening through one shared shader chunk (`src/core/env.js:102-118`).
  Godot: a shared `.gdshaderinc` over the `atm_*` globals; apply the cloud shade in `light()`.
- **[G shader]** Lit windows as an emissive texture for massed and distant facades
  (`src/engine/stages/03-blocks.js`).
- **[G shader]** Lamp schedules computed per instance on the GPU (`env.js:82,192-197`). This matches
  `core/atmos/GODOT.md`, which already puts hours in `INSTANCE_CUSTOM`.
- **[G native]** A dithered fade before LOD drops an object (`env.js:170-181`). Godot's visibility range has a
  dithered fade mode.
- **[G shader]** Fill a cut solid by drawing its back faces as flat hatching (`src/blame/mats.js:166-176`).
  Godot: `FRONT_FACING` in a `.gdshader`.
- **[G native]** A per-frame bounding sphere for movers, so off-screen herds and boats are culled. Godot: a
  MultiMesh `custom_aabb`.
- **[web]** One shared polygon-offset ladder. **[G data]** A shared mitred ribbon helper for roads, rivers and
  walls, whose output is plain geometry.

## Surfaces *(spiderbench, github.com/xikhar/spiderbench, read 2026-10-05; detail in `core/materials/PLAN.md`, "From spiderbench")*

- **[G shader]** Analytic coursing: ashlar and brick joints from UV math and a per-block hash, not a painted
  canvas. A `coursing` TEX kind, pilot on Voth's canton walls.
- **[G shader]** `breakup` gains `rough` and `grime`; grime samples one shared streak sheet (8 by 16 masks, each
  opening picks a cell by hash). One generated image; prompt to write in PLAN.md.
- **[G native]** A detail normal at close range: record field `detail`, Godot `detail_normal`; one shared
  `detail.*` library set.
- **[G data]** Any hash shared between placement code and a shader is written once in `core/` with GDScript and
  `.gdshader` twins and a comparison test.

## Worlds *(Menagerie)*

These are the best Godot candidates: generators whose output is data.

- **[G data]** One land-cover map per world, read by both the ground shader and plant placement
  (`tools/make-yellowstone.py:457-575`, `src/yellowstone/nature.js`). In Godot it is a splat texture for the
  terrain shader and the input to placement.
- **DONE: `KRELIEF.fields` in `core/terrain/38-core-relief.js`; no build uses it yet.** **[G data]** A warped-lattice field and hedgerow generator for the highlands and lowlands
  (`tools/make-shire.py:152-178`).
- **DONE: `KRELIEF.range`, `join` and `volcano`.** **[G data]** Mountain height functions: range walls, junctions that don't double up, volcano cones
  (`tools/make-mordor.py:84-181`).
- **[G shader]** Distant mountain ranges drawn at their true angular size as a backdrop
  (`src/minastirith/shadow.js`). A seamless open world may not want it, except for ranges beyond the map.
- **Data side DONE: `KRELIEF.river` (surface and slope per vertex); the foam shader is still to do.** **[G data] + [G shader]** River foam driven by slope (stored per vertex), and a water surface that never
  climbs downstream (`src/rivendell/water.js`, `src/isengard/isen.js`).
- **DONE in Girder (`settlements/girder/src/83-walk.js`):** the walker is a circle that slides round corners and along walls at any angle (closest-point push-out), and it rides the lift cages (the cage floor is a solid that moves with the cage, and a walker aboard sends the lift off). Girder's stair flights, which sloped the wrong way, are rebuilt with treads.
- **[G native]** Pull a buried camera back along its line of sight (`src/blame/main.js:115-142`): Godot has
  SpringArm3D. A circle walker with corner push-out (`src/backrooms/level.js:395-419`), and a lift you can
  ride: CharacterBody3D does both, platform motion included.
- **[G data]** Chunks generated from the seed alone, with doors forced at chunk edges
  (`src/backrooms/level.js`). This is the same tile-by-tile loading `biomes/WORLD.md` plans.
- **[G data]** Timed set pieces as pure functions of t, publishing signals on a bus (`src/fleshpit/incident.js`).

## Lava *(Menagerie: the fire on Kharak, `src/homeworld/kharak.js:15-61`)*

Krator has no molten lava. swbay's flows are cold vertex colours (`biomes/swbay/src/45-host-stage.js:231-236`),
and its plume is a chain of spheres.

- **[G shader] A lava field shader.** Kharak's fire is a single fragment shader, with no particles. Fire fronts
  are a thin band where a drifting fbm crosses 0.5. A finer front drifts the other way. Embers come from a
  high-frequency fbm, only on the burnt side. A `burn` 0..1 uniform blends the whole effect in. To make it lava:
  - sample world xz in metres, using a tiled 3D noise texture rather than `fract(sin())`, which loses
    precision at world scale;
  - drive the drift with a downslope flow map, blended in two phases, instead of one constant drift;
  - put fronts and embers in emission so they glow at night and bloom (Godot: WorldEnvironment glow);
  - put voronoi plates under the front band, so the cooling crust reads as plates and cracks;
  - drive it from `atm_time`, and ease `burn` per second, not per frame.
  A Godot sketch is about ten lines (`EMISSION` from the front band and the embers). It suits lava lakes and
  fields; channel flows need the flow map.
- **[G data]** The numbers become an atmos preset: `{kind:'lavafield', scale, flow, frontW, colours, burn}`.
- **[G native]** Sparks and steam: GPUParticles3D, with parameters taken from `src/core/dust.js:13-52` (drag,
  gravity, wind, life, alpha curve). The steam is atmos's existing `smoke` steam preset.

## Geothermal terrain *(Menagerie: Yellowstone, `src/yellowstone/landmarks.js`, `nature.js`)*

Krator has no geysers or hot springs. Combined with the lava field above and the land-cover sinter class
(Worlds), these would make a geothermal biome.

- **[G data] → [G shader] Hot-spring pools** (`landmarks.js:56-83,172-189`). The pool is painted rather than
  modelled, because what it is is colour.
  - The colour is a radial palette ramp from centre to rim. The blue centre is water too hot for life; each
    ring outward is the bacteria that can stand that temperature. There are five palettes (prismatic, blue,
    glory, emerald, opal).
  - Round the pool: a pale sinter apron fading at its edge, a lobed bacterial-mat band, runoff rays streaked
    outward, and a scalloped sinter lip.
  - It is laid as a flat disc at the highest ground under it (`topOf`), with polygon offset. A glossy
    low-opacity Phong skin on top reflects the sky, which is most of what a pool looks like.
  - Options: an optional crater wall, and steam vents scattered in proportion to the area.
  - About two thousand small springs are instanced coloured discs with a rim (`nature.js:254-267`).
  Today it is a canvas texture [web]. As data it is the palette stops, the pool fraction, the ray count and
  a seed, which make a short Godot shader: a ramp on radius, with the lobes and rays from angular noise.
  It also makes an atmos `hotspring` fx kind.
- **[G shader] Geyser eruptions, entirely on the GPU** (`landmarks.js:94-121`). Each drop is a point with a
  seed. Its height is a parabola solved in the vertex shader from `uTime`, for a column height `H`, so no
  per-frame work is needed. One `uAmp` strength sets how many drops are airborne and how high they go, so
  the same points serve pre-play splashing, the full column and the dying away. A `fountain` flag throws
  bursts at every height. A second point cloud makes the steam cloud that drifts downwind
  (`cloudPoints`, :122+); it is heavier on cold mornings and at night (:169).
- **DONE: `KSCHED.eruption` in `core/sched/20-core-sched.js`.** **[G data] The eruption schedule** (`landmarks.js:162-167`): `interval`, `duration` and `phase`, as a pure
  function of time. The strength ramps up over 3 s and holds; there are 50 s of splashing beforehand and
  40 s of fading cloud afterwards. Godot evaluates it identically.
- **[G data] Rimstone terraces** (`landmarks.js:186-215`): lobed extruded steps laid along the steepest
  downhill direction, in flights of three. Active steps are white and orange with blue pools and steam; dry
  ones are grey.
- **[G data]** A sinter cone (a lathe, :217) and mud pots (a stippled disc plus bubbling domes, :223).

## Effects: new core/atmos fx kinds *(Menagerie sci-fi scenes)*

Every Menagerie particle effect is stepped on the processor. Take the parameters, not the code: Godot's
GPUParticles3D, FogVolume and Decal read them directly.

- **[G data] → [G native] `jet`:** ballistic grains under gravity alone (`src/europa/grains.js:18-45`,
  `src/europa/ice.js:163-185`). It starts full, because each grain is placed at a random point along its arc
  (Godot: `preprocess`). Presets `plume` and `vent`, with g as a parameter.
- **[G data] → [G native] `dustburst` plus a `dust` weather mode:** velocity relaxes toward the wind with drag
  (`src/core/dust.js:13`). The Coriolis storm front (`src/arrakeen/events.js:81-96`) crosses at 110 m/s; as it
  passes, fog goes to ×90 and dust brown, the sun to ×0.15, with static flashes. Godot: a moving FogVolume
  plus Environment fog. `ATMOS.W` has no dust mode today.
- **[G data] → [G native] `burst`:** explosion and impact: a flash, a flat ring, sparks and a scar left on the
  ground (`src/homeworld/fleet.js:96-110`, `src/europa/events.js:107-121`). Godot: one-shot particles and a
  Decal. Krator has no explosions.
- **[G data] `exhaust`:** an engine glow disc plus a plume cone, with drive-state presets taken from Voyager's
  warp sequence (`src/voyager/ship.js:246-283`: idle, hot, flare). Trails: GPUParticles3D trails.
- **[G shader] `portal`:** counter-rotating spiral discs, opening as `sin^0.6` (`src/babylon5/station.js:735-760`).
- **[G native] `airbox`:** a haze box (`src/blame/city.js:113-124`); in Godot, a box FogVolume.
- **[G data] `sign`:** text, colour, size and pulse (`src/nightcity/neon.js`); in Godot, a `Label3D` with
  emission, its halo in `glow`.
- **[G data] An `events` export block:** a random-event scheduler with `every:[min,max]` and an `active()`
  gate (`src/core/happenings.js:19,73`).
- Sky module, not atmos, **[G shader]**:
  - drifting cloud bands on the gas giant, from the latitude-stretched, drifting fbm cloud shell
    (`src/homeworld/kharak.js:68-83`); the giant's rim already exists. No night-side city lights: it is a gas
    giant;
  - a galactic band in the star field (`kharak.js:92+`);
  - a rotating-habitat sky: an axial sun tube that dims rather than sets, with land overhead
    (`src/hab/world.js:40-63,357-368,539-560,622-650`).

## Life layer: motion as a function of time *(Menagerie ship behaviour)*

Voth's life layer is integrated state. Ships cycle docked, away, arriving and departing, with avoidance nudges
and departures picked at runtime (`settlements/voth/src/78c-life-ships.js`), so Godot cannot reproduce it from
the clock. The interiors walkers (`kits/interiors/API.md` §8) and the Ring Sea vessels (`rsWayPose`) are
already pure functions of t, and are the model.

- **Evaluator DONE: `KSCHED.timeline` and `KSCHED.slots`; moving Voth's ships onto it is still to do.** **[G data] Schedules as data:** `{route, period, phase, segments:[[dur, ease, from, to]...]}`, as for
  Homeworld's lifters and collector (`src/homeworld/fleet.js:135`: 14 s up, 6 s docked, 13 s down, offset per
  craft). Bake Voth's nav routes at build time, resolve slot conflicts offline, and drop the runtime
  avoidance and the random departures.
- **DONE: `KSCHED.formation`.** **[G data] Formations:** offsets in the leader's tangent frame (`fleet.js:130`, Babylon 5's diamond). Use
  them for coast-guard escorts and strider convoys.
- **DONE: `KSCHED.approach`.** **[G data] A queued harbour approach:** closing distance `9000(1-u)^1.6`, so ships slow as they arrive;
  lateral offsets merge into the lane, then a final alignment (`src/babylon5/station.js:624-700`).
- **[G data]** A closed-form launch from a rotating frame (Babylon 5), for habitats. Arrivals keyed to the
  schedule, spawning and despawning on it.
- **[G shader] Pose on the GPU:** once pose is a function of t, put phase and parameters in
  `INSTANCE_CUSTOM` and pose each instance in the vertex shader. No per-frame uploads, in three.js or Godot.
- **[G native]** Engine lights that stay a fixed size on screen: a MultiMesh of billboards with `fixed_size`.
- Avoid integrated pursuit (Homeworld's defenders) unless it is seeded and stepped at a fixed rate.

## Testing *(Menagerie)*

- **[G data]** Layout fingerprints compared with saved goldens, which can prove a refactor changed nothing in
  the world. Refuse an empty fingerprint. Taken over the export, the same fingerprint can check that the Godot
  import placed what three.js built.
- **[web]** Fail on WebGL and shader errors in the console.
- **[web]** Voth: set `_ready`, and replace the fixed sleeps with "N frames since ready".
- **[web]** `tools/test-all.py -j N`, running the `core/**/test-*.js` unit tests first; `build.py --check`
  for a stale `dist/`.
- **[web]** One shared `tools/harness.py` instead of 25 copies inside the `verify.py` files.
