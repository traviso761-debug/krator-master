# Screamers — known issues and the queued brief

`- [ ]` items are printed by `build.py` on every build.

## Done

- [x] Fork, single `screamers` target, Hexahedron on the origin.
- [x] Hyperjungle atmosphere: green-white haze, jungle floor opening to trodden
      red soil where the village has cleared it, volcano shield far to the south.
- [x] ALL lower-level damage removed, at the user's direction, to start over.
      The sheared skin, the decks behind it, the interior cells, the soffit
      crater and the failed shaft flank are all gated on one flag, `LOWDMG`
      in `src/68-hexahedron.js`. Set it true to bring the previous pass back.
- [x] THE MAIN PLAZA, surveyed in-scene with the polygon tool:
      [[-173.2,627.6,270.2],[-67.2,618.0,654.3],[117.6,635.0,103.1]].
      Intact, free of debris, grassed, and planted with fruit trees wherever
      nothing is built. The crater and the roof scatter both clip to its edge.

- [x] Anti-overlap is tiered: streets and walls, then the ancient dwellings,
      then warehouses and longhouses, then farms and furniture. Each tier
      registers in OCC before the next is sampled.
- [x] One vertical strip of the lower city's outer skin torn away top to
      bottom, with two decks per band, interior cells and a dark backing wall
      behind it. Heavy hanging growth on every unoccupied layer.
- [x] Ground-floor dwellings rebuilt in three Ancient archetypes -- pilastered
      block with a cornice, barrel-vaulted hall, apsidal end -- all on chamfered
      plinths with arcades and an arched door. The tribal thatch sits on top.
- [x] Elevator pylon by the lobby, with a car that runs the full 600 m to the
      plaza and back on a TICKS animation (new: `tick()` in 10-core.js, run
      once a frame by 92-camera.js).
- [x] Millipede ranch: double stockade, radial troughs, shelter and stock.
      Placed at tier 3, so the farms work round it.
- [x] Gate cut from the upper city onto the plaza, with steps, and a helipad
      out on the deck beyond it.
- [x] THE CHIEF'S PALACE is the flatiron: a wedge tower in the Hexahedron's own
      language on the plaza's prow, sized to the plan's 15-degree taper so it
      sits on the deck, with awnings crossing the footprint, a watch crown, a
      lit ring at the door and standards along the prow. The Skyscraper F
      version is removed.
- [x] Authoring tools: Inspect / Polygon / Path in one panel, sharing one click
      handler. Path records open polylines with a running length, for the life
      layer's walking routes.
- [x] Furniture on the lower roof is bound by `onDeck()`, an exact outline
      test, instead of the axial approximation that let it float off the edge.
- [x] Farms are radial -- every plot's long axis points at the foot of the
      tower -- and denser again (260 plots and pens), packing to a 2 m gap.
- [ ] The palace sits on the plan axis, about 24 m from the surveyed point,
      because at that point the deck is only 46 m across and a tower centred
      there hung 17 m off each side. Move it back if the overhang was wanted.
- [ ] `buildSkyE`/`buildSkyF` keep the gy/noPlinth/hcut parameters added for the
      earlier palace attempts. Nothing uses them now; they are harmless and
      useful, but they are untested outside that one case.
- [x] Volcano baked into the sky texture (Voth/Mav's Refuge method) instead of
      a 3D shield inside the dome. Draw calls at the hero camera 43 -> 17.
- [x] Industry culled to reoccupied CLUSTERS -- two per sector on two ranks,
      6-10 sheds each, each with a thatch pitch, a door and lashed props.
- [x] Hexagonal wall in ruined Ancient fabric with cylindrical thatched guard
      towers on the corners and two gates with lashed posts and lintels.
- [x] The lobby: a ring wall of doors against the bottom of the shaft bundle,
      thatched over, with a lit strip round the walk.
- [x] Foottrails of trodden earth from each cluster to the lobby ring.
- [x] Decks behind the sheared skin of the lower city, with interior cells and
      a dark backing wall, so the shorn panels open onto floors and not a void.
- [x] Warehouses (hexagons of lashed post, plank and salvaged sheet),
      longhouses, and the captive's pen with its own model -- double ring of
      sharpened posts, one barred gate, a raised guard platform, an open
      shelter. Overlap pass with the ancient sheds holding priority and their
      original orientation.
- [x] Fields and livestock pens rejection-sampled into whatever space is left.
- [x] Collapse capped: the shear falls off as a power of height and every
      damaged band gets a solid deck right across the sheared sector, so the
      scar reads as a shallow bite at the tip from any angle.
- [x] The PLAZA (the lower city's roof, the only large open ground) carries the
      patched cultural hall on the lower pyramid's midline, with drying racks,
      hide frames and fire pits round it.

- [x] Polygon draw tool: Mark polygon / Undo / Clear / Select in the panel,
      click surfaces to drop corners, ready-to-paste [[x,y,z],...] in the box.
      Ported from Mav's Refuge; it wraps inspectAt rather than adding a second
      click handler.
- [x] The shear is a coherent narrowing wedge, not an fbm threshold per quad --
      thresholded noise read as extra windows and was invisible in exactly the
      bands that clear the shaft forest.
- [x] Medium crater blown out of the upper pyramid at (149, 792, -208).
- [x] Overgrowth on everything except the level either side of the promenade.

- [x] Support shafts clamped under the mass they carry. Measured first: the
      clusters sit a fixed 0.155 of plan units from the centre of mass, but the
      lower plan's radius runs 0.18 toward +x and 0.64 toward the apex, so
      cluster 0 stood at rho 1.18 and its outermost shaft at 1.61 -- entirely
      clear of the soffit. `pullIn()` clamps every shaft to rho 0.88.
- [x] Balcony orchards on about a tenth of the upper terraces, each with its
      own door on to the terrace.
- [x] Foliage on the upper half of the lower city, planted on the RISERS: an
      inverted pyramid has no up-facing ledges, so the decor samplers had only
      ever dressed its soffits.
- [x] Foliage in the blown holes -- the upper crater and the torn strip -- and
      the whole Ancient fabric re-tinted to weathered ochre. Nothing removed.
- [x] LIFE LAYER, first pass: 79 fruit harvesters walking out of the dwellings,
      the lobby and the upper city's gate to the orchards and back, as two
      InstancedMeshes rewritten per frame. Routes only ever join two points on
      the same surface.
- [x] Non-ground placement ported to the ancients kit with a worked example
      (`buildPerch`): two kit towers standing on a podium, neither on the ground.

- [x] ANTI-OVERLAP, audited. The Ancients' own ground works were never in the
      occupancy list -- six sector roads running 595 m out and the hexagon's rim
      wall -- and farms were being laid straight across both. They are claimed
      first now, the lift is claimed before anything that can move, the ranch
      precedes the orchard, and the pass ends with a check that counts
      intersections among rejection-sampled items and reports to the error
      panel. `window._overlaps` is 0.
- [x] Longhouses rebuilt: four walls, a post frame, a real gable of two roof
      planes meeting at a ridge, gable triangles closing the ends, and a ridge
      pole. They had two walls and a hip pyramid dropped on top.
- [x] Cone roofs lifted. ConeGeometry is centred on its own origin, so every
      thatch cone placed AT a wall head had its base half its height BELOW the
      head -- the warehouses were swallowing 13 m of wall.
- [x] Three scrap smithies with hearth, stack, anvil, quench trough and stock
      racks, each with spoil heaps beside it.
- [x] Plants evened out on the pyramid faces. `upFaces`/`ledgePoints` sample by
      triangle AREA, so the wide lower terraces took nearly all the trees and
      vines. Trees and vines now walk each band and space by its own perimeter;
      moss and the balcony fruit trees keep their own distributions, as asked.
- [x] Metals oxidised: rust, corrugate, pipe and salvaged sheet all retinted to
      iron oxide with roughness up and metalness down (no envMap in this scene,
      so high metalness just goes black).
- [x] PATH TRACKER: Routes draws the fixed geometry every agent is bound to,
      colour-coded by population; Tracks draws a rolling trail behind each one.
      Two draw calls whether there are ten agents or a thousand.

- [x] Presets are DERIVED. `91z-views.js` loads after `90-scene.js`, so the
      rejection-sampled things -- a smithy, the ranch, the pen, the gates, the
      lobby -- are looked up from SCREAM and framed by a helper rather than
      aimed at coordinates guessed off a render.
- [x] Crater growth roots in real fabric. The old pass sampled an ellipsoid and
      kept the points where the crater test was TRUE, which is the VOID, so
      most of it hung in mid-air. It now walks the terraces that pass the hole
      and plants only where the skin survives.
- [x] Girder-scale forest: 26 hypertrees at 230-430 m on the Ironbark profile
      (fluted buttressed bole, golden-angle boughs, buttress roots) at ~1.7k
      triangles each rather than the kit builder's 174k, plus fern rosettes,
      palms and shelf fungus in the understorey.
- [x] Krator sky rebuilt at 4096x2048: cumulus with shaded undersides, the sun
      disc and glare placed at the azimuth the directional light actually uses,
      two small moons, a richer volcano with a summit glow, and emergents
      breaking the far canopy line.
- [x] Every trunk tinted. 'trunk' is kdef'd against MAT.vine, a pale green, so
      every tree in the jungle and both orchards had a bleached pole for a bole.

- [x] OPTIMISATION PASS, measured first: 1.13M triangles against a 6M showcase
      budget and 41 draw calls against 900 -- nothing to rescue, only headroom
      to win. Jungle canopies now shed lobes with distance (6 to 4 to 3 past
      2.1 and 2.9 km, hypertree crowns 13 fronds to 7 past 2.2 km), which took
      the jungle from 350k to 293k with no visible change at range.
- [x] The plaza doorway squared to the wall. It had been placed on the outline
      but oriented along the RADIAL direction to the plaza, which on a plan this
      elongated is tens of degrees off the wall's own normal -- the same mistake
      as the cell facings earlier. It walks the outline for the nearest
      parameter and reads pnorm there.
- [x] The chief's tower has an entrance: arch, door, flanking posts and steps
      down to the deck, on the broad transom end.
- [x] The Flatiron exported to the ancients kit as an intact Ancient type
      (`src/66b-flatiron.js` there), with lit galleries, an entrance colonnade
      and a crowned top, plus intact/ruined presets.

- [x] WIND, ported from Girder's foliage sway. Every leaf, frond, vine and
      trunk moves, displaced in the vertex shader from a per-instance phase
      taken from `instanceMatrix[3].xyz`, with amplitude scaled by the
      instance's own scale. 30 000 plants animate on one uniform per frame.
      MAT.vine backs both vines and trunks and one weight of -position.y is
      correct for both: fixed at the attached end, free at the tip.
- [x] THE GAS GIANT is real geometry now, ported from Girder's sky: a shaded
      sphere whose bands are computed in the fragment shader from the world
      normal against a world spin axis, with storms, limb darkening, phase, an
      atmospheric rim and a ring shadow, plus a ring system seen as a hairline
      because the axis lies in the plane of the sky.
- [x] Metals maximally rusted: iron oxide albedo, roughness 1, metalness near
      zero (no envMap here, so metalness only darkens).
- [x] FURNITURE is a shared set (`src/70c-furniture.js`): bunk, hammock, chest,
      basket, drying rack, hearth, stool, ladder, water jar, loom. Published as
      its own catalogue artifact from a `furniture` target that enumerates
      `FURN.list`, so the catalogue cannot drift from what is in the buildings.
- [x] The plaza hall is the ORCHARD WORKERS' RESIDENCE, furnished from that set.

- [x] FOLIAGE REBUILT the way Girder actually does it. A clump is three crossed
      quads carrying an alpha-mapped leaf cluster -- six triangles -- not a
      solid low-poly blob at twenty. Cheaper AND it reads as leaves; the
      faceted icosahedra were reading as boulders on poles, which is why the
      trees "still looked the same" after the first pass. alphaTest rather than
      transparent, so tens of thousands of clumps need no sorting.
- [x] FOUR SPECIES after Girder's set: Ironbark (red-brown bole, dark needle
      tiers), Ghostwood (near-white bark with dark flecks, airy yellow-green,
      violet racemes), Prism gum (streaked multicoloured bark, broad
      iridescent canopy), Baobab (swollen bottle trunk, sparse flat crown,
      orange pods). Real crowns too: boughs off the top of the bole with clumps
      at their ends, instead of lobes threaded up the trunk.
- [x] Ring toggle in the tools panel, as Girder's sky panel has.
- [x] MILLIPEDES are a moving level of the life layer: eight animals, each a
      chain of 13 segments that follow the head through a trail buffer, so the
      body snakes along the path the head took rather than rotating rigidly.
      They turn back at the stockade instead of walking through it.
- [x] Flatiron entrance rebuilt -- it met nothing before: the door panel started
      below the plinth it stands on, the arch was a third its size and floated
      beside it, and the steps ran DOWN from the plinth past the deck. The
      threshold is the plinth top, the arch frames the door, and three steps
      land on the plaza.
- [x] Flatiron awnings now shade something: each has a door and a pair of
      windows under it. They had been shelves over blank wall.

- [x] FLORA IS ONE MODULE (`src/71b-flora.js`). The species table, the leaf
      texture and material, the clump, the tree, the hypertree and the
      understorey all moved out of `71-village.js`, and every builder that
      plants anything now goes through `FLORA`: the jungle, the Hexahedron's
      terraces, risers and soffits, the balcony orchards, the village orchard,
      `VEG.tree`, `trees()`, `scatterMoss`, `mossOnSurface`, `mossOnRing` and
      `vinesFromLedge`. The Girder vocabulary is all in one place -- leaf-card
      clumps, hanging ribbons (curtains, strands, aerial roots), moss mats,
      moss lips, arching fern fronds, palms, bushes, flowers, bracket fungus --
      so a plant's quality is decided once.
- [x] MOSS ON THE UNDERHANGING SURFACES. The lower city is an inverted pyramid:
      every one of its horizontals is a ceiling. Moss is rolled over to face
      the ground, and aerial roots, beards and curtains hang out of it, with
      density following the light -- strong at the rim, almost nothing in the
      dark middle of a 300 m soffit.
- [x] THE SOFFIT IS DRESSED AS A COFFERED CEILING, not a plane. The cells
      hanging under each step are recorded as they are built (`CELLS`) and
      carry the moss themselves; moss laid on the soffit behind them is
      invisible from every angle on the ground.
- [x] THE WINDING BUG THAT HID EIGHTEEN THOUSAND MOSS MATS. The mat is a fan in
      the xz plane; walking it by increasing angle gives `u x v = -y`, so with
      the triangle order `[0,1,2]` its front face pointed at the floor while
      its declared normal pointed at the sky. On a tread it was invisible from
      above and rolled onto a soffit it was invisible from below, so the
      overgrowth pass rendered nothing at all and looked like a density
      problem. Checked by cross product, not by eye, and the ribbon had it too.
- [x] THE `SH[LO0+2*k]` INDEXING BUG. The overgrowth pass worked out which
      shells were treads and which were soffits by indexing `SH` arithmetically
      with a stride of 2. The lower city pushes 2, 4 or 6 geometries per band
      depending on the damage flags, so the pass was dressing interior decks
      nobody can see and skipping the top four bands of the real underside.
      Surfaces are captured into named lists as they are made now
      (`TRD_U`/`RIS_U`/`SOF_L`/`RIS_L`, published as `window._hexSurfaces`).
- [x] EVEN DENSITY BY PERIMETER, on the underside as well as the terraces. A
      fixed sample count per band gave the 40 m ring at the tip as much growth
      as the 440 m ring at the top.
- [x] GROWTH ON THE RISERS of the upper city. From anywhere but overhead the
      risers are most of what you see, so growth that stopped at the tread left
      the mass reading as clean concrete with a green fringe.
- [x] The overgrowth is accounted separately as `flor` rather than inside
      `hex`: it is the biggest single population in the scene and folding it
      into the arcology's own budget line made both unreadable.
- [x] THE FOREST WAS PARKLAND, and it was placement rather than plants. Measured
      first: 3 260 trunks of which 2 278 were under 30 m and 15 over 120, and
      understorey in one ring at 7 plants per hectare with none inside or
      beyond it. Rebuilt: 60 hypertrees at 170-430 m on 140 m spacing (was 26
      at 190 m), canopy trees at 34-92 m with 14% emergents to 165 (was 13-42
      with 4.5%), and the floor is now a jittered 12.5 m grid with an fbm patch
      mask over it -- Girder's own idiom -- at full density for 230 m outside
      the wall and thinning to a fifth of that over the next kilometre. About
      10 000 plants where there were 520.
- [x] SPECIES COME IN STANDS. A per-tree random draw from four species mixes
      them evenly enough that the eye integrates them back into one colour,
      which is most of why "four species" kept reading as one. The dominant
      species now comes from an fbm field about 600 m across, with a quarter of
      trees off-pattern.
- [x] The old stripped-down hypertree import (`src/70-hypertree.js`) was
      CLEARED of suspicion, not fixed: `buildHypertree` is not in the
      screamers target's builder list and `KIT.items.frond` measures zero
      instances. The file contributes one unused kit definition and the 'bough'
      definition that FLORA does use. It is not interfering with anything.
- [x] Bracket fungus is off the open-ground mix -- a flattened hemisphere lying
      in grass reads as a dropped white plate -- and the near-white flower is
      out of the palette. Both only became visible once the floor was dense
      enough to show them, and then they were most of what it showed.
- [x] The understorey is accounted separately as `undr`: 10 000 plants would
      otherwise hide inside the canopy's budget line.
- [x] FOUR SPECIES, FOUR LEAF TEXTURES. Bark is invisible past 50 m and the
      four leaf palettes sat within 0.17 of a hue of each other, so a mixed
      forest came out as one green. Each species now carries its own painted
      leaf card -- Ironbark's dense dark needle sprays, Ghostwood's airy pale
      round leaves with violet flecks, Prism gum's broad teal blades, the
      Baobab's sparse olive fans with ochre pods -- its own hue well away from
      the others, and its own silhouette: trunk thickness, crown width, bough
      count and elevation, and a bottle trunk for the baobab.
- [x] THE CARDS WERE SQUARES. The leaf texture scattered nine clusters across
      the whole canvas, which filled it corner to corner, and since alphaTest
      cuts a hard edge every card read as a green SQUARE -- three crossed
      squares per clump, which is the blockiness the cards were brought in to
      cure. Each texture is now ONE centred rosette with transparent corners,
      built in three whorls over a small irregular core and measured at 43-66%
      opaque: a single ring of radiating leaves comes out near 25% and a crown
      built from those is sky with specks in it.
- [x] Trunks are eight-sided. A six-sided bole is visibly a hexagonal prism
      from anywhere near it, and trunks are the one instanced thing you walk
      right up to.
- [x] Bushes are leaf cards over a squat lobe. A five-sided cone on grass reads
      as a traffic cone, which is what the understorey was.
- [x] THE SHADER CACHE KEY WAS BEING DROPPED AT THE BAKE. `72a-wind.js` sets
      `customProgramCacheKey` on every wind material precisely because three's
      default key is `onBeforeCompile.toString()` and all six hooks are the
      same function source differing only by their closure -- without the key
      they share whichever program compiled first. `kbake()` clones the
      material per InstancedMesh and `Material.copy()` carries neither the hook
      nor the key, so it re-attached the hook and quietly lost the key, and
      every plant in the scene swayed with one weight. Both are re-attached now
      (`src/30-kit.js`).
- [x] The new foliage materials are hooked into WIND. `MAT.hang` is weighted by
      `-position.y` and reads its amplitude from the instance's LENGTH, not its
      width, or a 20 m curtain would tremble like a 1 m one.

## Still to build, from the brief

- [x] LIFE LAYER complete: 110 agents in four populations -- harvesters,
      ten wall patrols walking the whole hexagon circuit, five guards posted on
      the captives' pen, and a scripted party of four warriors bringing 1-3
      captives in through a gate at t=0, held at the pen, then walked to the
      Hexahedron by three escorts from t=22 and gone by t=46. Two draw calls
      for the lot.
- [x] The hyperjungle: its own build type (own budget), thickening with
      distance, with emergents to 135 m breaking the canopy line.
- [x] The Krator gas giant rebuilt at canon size -- 30 degrees across at
      azimuth 67, altitude 25 -- with belts, a storm and its ring system.
- [x] 20 example camera angles, grouped: the settlement, the life layer, the
      arcology, and the sky and country.
- [ ] Harvesters walk in straight lines and pass through anything between the
      two ends of their route. They do not use the trails.

- [ ] The wall sits at 1.16 x the mesa radius, where `plateY` has run out of
      terraces and returns its lowest step, so it stands a metre or two proud of
      the graded skirt in places.

- [ ] The promenade proper (the 45-100 m walkway ring round the foot of the
      upper pyramid) is still bare except where the palace staging crosses it.

## Carried over from ancients

- [x] `build.py` cannot check syntax -- no node on THIS machine. **Fixed (Oct 2026):**
      `find_node()` looks in `$NODE`, PATH, `/opt/node*/bin`, `~/.nvm` and `~/.volta`;
      `node --check` passes on both targets. With no node anywhere the build still
      says "syntax NOT CHECKED" (every `build.py` shares the lookup).
- [ ] The crater's inner shell is still bare: the growth pass plants round its
      rim and down the torn strip, but nothing inside the bowl.
- [ ] `FLORA.dressSoffit` and `FLORA.dressLedge` are the generic area-sampled
      dressers for the other 33 types in the kit. The Hexahedron does not use
      them -- it walks its own plan, which is exact -- so they are only lightly
      tested.
- [ ] Palms and fern rosettes read as bare poles with small tufts beyond about
      300 m; the frond card wants to be bigger, or to drop out with distance.
- [ ] The crater interior is a dark shell with section floors, but at distance
      it still reads flatter than the Veladiga breach does.

## Publishing

- [ ] PUBLISH AFTER EVERY PASS. The claude.ai artifact is not `dist/screamers.html`;
      it is a separate copy that only changes when it is republished. The whole
      flora rebuild sat on disk for three rounds while the live artifact stayed
      byte-identical to the pre-flora build, which is why "the screenshots show
      moss I don't see on the artifact". `00-head.html` carries the claude.ai
      page wrapper, so the file to publish is `dist/screamers.html` with
      everything before `<title>` and the closing `</body></html>` stripped.

## Level of detail (core/lod)

- [x] No LOD at the page level: `core/lod` now takes over the scene (README, "Level of detail"). The jungle flora keeps
      every instance (the biome core has its own density curve) but is now frustum-culled.
- [x] The chunked biome far meshes cost about 45 more draw calls (82 to ~130). Fixed in core/lod: a split mesh draws
      its chunks combined, one draw per level in view; the three views now read 79-87 calls with LOD (82-84 without).
- [ ] The gain is modest (3.27 M to 2.9-3.1 M triangles). A screen-size curve the biome core reports for its far cards,
      which LOD could read, would do more.

## Materials: the library (2026-10-05)

- [x] The page takes `core/materials/record` (`23-mat-record.js`, `25-matlib-host.js`; not `24-tex-def.js`, whose global
      `TEX` would meet this lineage's canvas table) and a library pack (`materials.json`, `tex/`, the generated
      `72b-matlib-pack.js`). `72c-matlib.js` puts 13 families on the `MAT` table and 6 on the Post-Apoc set's own
      materials, by world-space triplanar projection (README, "Materials"). Draw calls unchanged (85 at Main street).
- [x] The board-formed concrete ran at a different scale on every surface (the UVs are in no one unit): the village
      ground read as a timber deck. World-space tiling fixes both; the ground is packed earth now.
- [x] The three gaps filled by the owner's generated sets (2026-10-05, batch `chatgpt-2026-10f-screamers.json`):
      `ground.ruin` on the village ground (laterite and moss in their own colours: the family sets the material's
      tint to white, `"color"`), `wood.lash` on the lashed posts (the cord bands are back), `metal.ancient` on
      `MAT.white` (drawn nowhere in this scene today) and the Post-Apoc bulkhead slabs (`conc`).
- [ ] Still procedural: `MAT.pipe`, `MAT.bough`, the leaf cards and the vendored hyperjungle's own materials.
- [ ] Scales and tints were judged on four views, not in the demo kit; the owner has not reviewed them against
      `?mat=proc`. The Post-Apoc `corrH` (horizontal silo ribs) stays procedural: triplanar cannot turn a set's ribs.
- [ ] The page is 6.1 MB (the pack is ~4.7 MB of it, 512 px WebP). Normals at 256 px would save about a third.

## The salvage quarter: Post-Apoc homes and their interiors (2026-10-05)

- [x] Nine Post-Apoc dwellings, three round each smithy, through the `KratorPostApoc` bundle (`kits/post-apoc/
      apoc_bundle.py`), dressed in the new Screamer culture pack and furnished by the interiors kit with Screamer
      furniture: 9 buildings, 25 rooms, 194 interior pieces and 73 yard pieces, residence rule met (0 fails), no catalog
      key missing. +38 draw calls and +0.23 M triangles over the whole scene (85 to 123 at the worst view).
- [x] Siting draws nothing from the village rng; the homes claim ground before the fields, so the fields round them moved
      (and only those). `_overlaps` stays 0.
- [ ] The homes are at true scale (1.75 m people) beside a village drawn larger (smithies 22 m in radius, fields 25-45 m):
      they read small. Either is the truth; the village's own scale is the older decision.
- [ ] The kit's cloth, fires and lit windows stand still and dark: nothing drives `KratorPostApoc.ANIMU` (the page has
      no night). Its `plant()` placeholders are the kit's muted defaults, not this biome's flora (`PLANTS.draw`).
- [ ] The interiors are lit only by the sky light through the walls; there is no interior light, and the rooms are
      reached by the presets only (no walk mode here).
- [ ] The harvesters' routes do not visit the homes (the life layer reads `SCREAM.pairs`, not `SCREAM.homes`).

## Core modules: where this page stands (assessed 2026-10-05)

- Taken from `core/`: `materials/` (20, 22, 68: the Ancients-lineage table), `materials/record` (23, 25: the library),
  `lod/` (09, 97), and through the bundles `sockets/` (inside `KratorPostApoc`), the catalog and the interiors kit.
- [ ] VENDORED AND DRIFTED, with no `--vendor-check`: the biome core (`75-biome-10..40` against `core/biome`: 42-137
      lines differ per file) and the hyperjungle kit (`76-50..65` against `biomes/hyperjungle/src`: 4-98 lines). Re-vendor
      or switch to reading `core/biome` the way the biome kits do, then prove it by hashing the baked biome geometry.
- [ ] Not taken: `rand/` (its own mulberry32 and `Math.sin` noise; GODOT-PLAN Phase 2), `clock/` (no world time: no
      day and night), `simulation/` (`94-life.js` is straight lines; `core/simulation/PLAN.md` Phase 4 names this page
      the Change testbed), `walk/`, `minimap/`, `atmos/`, `terrain/`. `54-mat-concrete.js` and `69-mat-salvage.js` stay
      vendored and drifted on purpose (`core/README.md`, "What is not here yet").
