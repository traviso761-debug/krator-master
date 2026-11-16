# The Throne — known issues

- [ ] **Ten stations of ten.** The plume's edge (station 1), the kipuka (2), the spice frontier (3, `stations/frontier/`),
  the geyser isle (4, `stations/isle/`), the cloud forest (5, `stations/cloudforest/`), the south-flank savanna (6,
  `stations/savanna/`), the ash desert deep under the plume (7, `stations/ashdesert/`), vent country (8,
  `stations/vents/`) the glacier with its ice caves (9, `stations/glacier/`) and the rim over the caldera (10, `stations/caldera/`)
  are built, and the lava tube (11, `stations/tube/`, map 5.1's `tube_hot_05`): eleven pages, every one rebuilt in the final rebuild (2026-11-02,
  `PLAN.md`), and three more (2026-11-02, `PLAN.md`, "New stations"): the lava delta (12, `stations/delta/`), the blast zone (13, `stations/blast/`) and the lee's penitentes (14, `stations/penitentes/`). The shoulders' cold belt went into the glacier's. Not yet a station: the geyser field, the lee's penitentes
  below the summit. The shoulders' cold belt (gill-coral trees among conifers in the snow) is not yet a
  station (it could pair with the glacier's).
- [ ] **One pack for every station.** `materials.json` and `tex/` hold every station's textures, so each page carries the
  others' too (~5 MB of textures a page). A per-station pack would halve that.
- [ ] **The kipuka's hyperjungle is the kit as it is.** Its hypertrees are its own species at their own heights
  (150-300 m); the windward station did not tune them down. On this page they take the library barks (the hyperjungle's
  opt-in pack, `station.json` 'packs') with their limbs on the trunk's own map; the hyperjungle's own page does not.
  Stays open (2026-10-25): owner decision (tune the hypertrees down for the windward station or not); the kit's own species heights.
- [x] **The frill tree's fins** stood close and steep (the Rift's spacing and pitch); from below it read as a furred column.
  2026-10-26: the rows stand every 3.6 m (were 3 m) and the fins splay flatter, 40 degrees low on the column to 29 at the top (were 60 to 43:
  `B[17]`, `55-biome-throne-trees.js`), so each row reads as a tier. A look call for the owner (before/after: the kipuka's 'Frill trees').
- [ ] **The standbys are this kit's own copies.** The frill-tree, the trumpet tree and the star aloe are drawn by this
  kit's builders, not the crater drylands' or the Rift's. In an open world where those kits are resident too, the
  standbys should come from their own kits at the border (`biomes/WORLD.md`, gradual borders).
- [x] **Some alien surfaces are still procedural.** The caps, tiers, bells and pitchers take the owner's fungal skins
  (mapped from above); the mat's veins, the star aloe's head, the trumpet tree's funnels, the lamp caps and the frill pods
  are vertex colour only (`core/materials/PLAN.md`, The Throne: gaps).
  2026-10-26: the star aloe's head (`card.flower.staraloe`) and the funnels (`organic.funnel.trumpet`) were already wired (2026-10-06); the lamp
  caps' dishes now take `organic.fungus.gill` (`cap.gill`, a grey detail under their glow) and the mat takes `organic.flesh.cells` (its cells and
  pale veins as its colour and glow, tinted by the instance colour, the drawn disc's ragged outline kept as an alpha map; `50-biome-throne-species.js`,
  materials.json, re-packed). The frill pods are only the no-pack fallback of the ruff (with the pack it draws `card.frond.frill`).
- [ ] **The far horizon from the air.** Seen from high up, the map's edge meets the painted dome's near flank as a hard
  dark band (as in the other showcases). Ground views are fine.
- [ ] **Budget.** ~18.6M triangles and ~550k instances at q=1 (the near spore puffs' hairs are 130 strands each) on the 5.2 km map (2026-10-06, measured in the browser);
  the floor bands are 6.5 / 13 / 30 m. No runtime LOD (`BIO.range`) yet.
- [ ] **No fauna.** The ember urchins (ref 14), the rats and roaches, the sky rays on the plume's thermals: the fauna kit.
- [ ] **The ash field is unused.** The kit reads `ash` but zones nothing by it; ash dunes are only painted.
- [ ] **No life layer.** The natives, the colonists' plantations, Zey'danin: none yet.
- [ ] **Lore not in LORE.md.** The breathable heights, Ranj (the spice), the Chichani's origin and Zey'danin's founding are in
  `NOTES.md`; LORE.md had an unresolved merge in the main checkout when this was written.
- [x] **Station 2's floor needs stochastic dithering** (the owner, 2026-10-06): done the same day. The kit's
  `THRONE.GLSL_LAY` (70) reads each library ground layer through virtual tiles with random offsets (stochastic tiling);
  the kipuka and the savanna (its kopjes and its burn, the owner) use it. The other stations' grounds can take it the
  same way (their `_lay` replaced by `THRONE.GLSL_LAY`).
- [ ] **The frontier's people are not there yet.** The traps, trails, road and fields are records (`FRONTIER`, `ROAD`,
  `TRAILS`) for the life layer, but no colonist works a field and no native walks a trail. Zey'danin is an empty footprint.
  Stays open (2026-10-25): needs the life layer (core/hamlet, the characters) and a design for who works where; not a station-local fix.
- [ ] **The frontier's terraces** are cut into the heightfield (2.6 m risers) and faced with stones only within the
  cameras' mid range; farther out the risers are painted.
  Stays open (2026-10-25): a design task (a stone-facing LOD across the mid range) with a triangle cost; station 3 has budget but no brief.
- [ ] **The frontier's north flow is off the planted map** (2026-10-06). `47-host-land.js` lays it from (2700,-1900);
  all its ground falls past `TERR.R-150`, in the unplanted rim, so it gets no registered volume (`84-host-ground.js`
  counts only in-map cells) and the station shows one old flow, the southern headland. Move its source inward to bring
  it onto the map.
  Stays open (2026-10-25): moving the source inward moves the flow's placement and its registered volumes, which the owner has not asked for.
- [ ] **The geyser isle is ideal type and small** (2026-10-06): ~4 km across where the scale model's isles are 20-35 km
  domes, so the whole isle and its beaches fit the page (the owner wanted the beach). An open world would put the basin on
  a big isle's crown and the beaches 10-17 km away.
- [ ] **The isle builds slowly:** ~12-18 s in the browser (the ground and the basin's 1.9 m patch ~5 s, the kit's trees and
  understory ~8 s, the bake ~4 s), ~64k trees and ~1.2M instances, ~15.5M triangles. The far forest is impostors, too small
  to cover the ground from above, so the ground's shader lays the library's canopy over the forest floor past ~400 m.
- [ ] **The isle's surfaces still procedural:** the springs' mats and the runoff's streaks are the ground's paint over the
  library's acid travertine; the sinter is the popcorn clay (`ground.clay.popcorn`), which reads as geyserite but is a
  badland clay. The coconut's fronds, its coir trunk and the seaweed are the owner's (2026-10-06). See
  `core/materials/PLAN.md`, The Throne, for the prompts.
- [x] **The lehua read pale:** on the isle the lehua's grey bark under its vertex colours reads near white in a dense stand.
  2026-10-26: `PAL.lehuaBark` darkened from 0x8a8478 / 0x7e786c / 0x96907e to 0x5e5a52 / 0x56524a / 0x68625a (a grey-brown ohia bark), on every
  station that grows it. A look call for the owner.
- [ ] **The geysers are particles:** the column is water drops and a steam cloud on the clock (`85-host-springs.js`); no
  splash on the cone, no runoff surge when one plays, and the springs' water does not boil.
- [x] **The sea cliffs' face** takes the forest floor's paint, not basalt: the rock field is read off the 11 m field cache,
  too coarse for a ~10 m wall. The fall is a curtain that follows the face (`84-host-ground.js`, THE FALL), spray at its foot.
  2026-10-26: the ground mesh's own normals find the faces: where a vertex leans past ~50 degrees (above the sea) a new layer (L2.y) lays the
  library's flow-banded basalt (`ground.basalt` = `rock.basalt.flowbanded`, materials.json, re-packed) over the paint. The fall is core/water's now
  (a WATER.fall thrown out fast enough to clear the face; 89w-host-water.js).
- [ ] **The cloud forest is dense only near the cameras** (2026-10-06): the elfin trees are heavy (crooked tubes, moss), so a
  sparse stand covers the map and a dense one stands only within 90 m of the cameras' spine; the elfin tree has no far
  impostor (the cloud hides it; when it clears the ground's canopy layer stands in). ~12 s to build, ~21.5M triangles.
  2026-10-26: the elfin tree has a light far impostor (a flat crown blob on a pole, `far` in its species), so the sparse stand stays on the map
  past the near range, and the dense stand thins from 65 m to 90 m (it ended at a hard edge at 90 m; taking it to 140 m cost 2.6M triangles,
  over the page's 24M). Stays open: a dense stand over the whole map is still out of budget; a look call for the owner (before/after: 'The elfin woods', 'Above the cloud').
- [ ] **The cloud forest's moss curtains** are the six greener cells of `card.moss.hanging` (its red and orange ones read as autumn).
  Stays open (2026-10-26): not a defect in code; the three warm cells would need a recoloured sheet (the instance colour multiplies, it cannot turn
  red to green). A prompt for a nine-cell green sheet, or the warm cells as a rare red-moss accent, is the owner's call.
- [ ] **The sky dome takes no fog**, so in the cloud a fog-coloured veil sphere hides it (`89-host-atmos.js`); the
  mountain shows only in a clear spell.
- [ ] **The savanna's parasol caps are heavy** (2026-10-06): the gill-parasols' and stilt parasols' discs and gills are dense
  lathes, ~10M of its ~17M triangles, so their woods are thinner than they might be. A lighter cap far off would let them
  thicken. No grazers (the fauna kit) and no people yet.
  Stays open (2026-10-25): a lighter far cap is a kit change in the biome core's parasol builders (shared with other stations), plus fauna and people are separate kits.
  2026-10-26, the proposal: the caps are instanced (`BIO.def('disc')` 336 triangles, `BIO.def('gills')` 224, `50-biome-throne-species.js`), so the
  fix is a distance LOD on an instanced def: core/biome `BIO.def(key, geo, mat, {lod: [[geoFar, metres]]})` splitting each item set into a near and a
  far InstancedMesh by the camera's LOD key (as `BIO._lodKey` does for the baked buckets), then here a 7 x 12 disc and no gills past ~250 m. That is
  a core change (core/biome/20-core-kit.js and 40-core-place.js), not made here.
- [ ] **The ash desert's storm is particles and fog** (2026-10-06): the shared atmosphere's ash weather (flecks, streaks,
  veils, warm lightning) and the host's brown-out; nothing settles on the ground or the trees as it falls, and the dunes
  do not move. No grazers, no rats or birds yet (the fauna kit).
- [ ] **Vent country's small features are coarser than the ground mesh** (2026-10-06): the ground is one 6.5 m mesh, so
  the open cracks (~10 m across) read as notches and the mud pots (3-7 m) lie on flattened floors under a surface that
  fades out at its rim. The thermophile mats round the pools are drawn in the ground shader over the owner's `ground.mat.thermal`
  (the bands' hue by distance from each pool). Nothing sits in the steam valley's walls (no ledges, no
  overhangs: `core/terrain` could carve them). No fauna. The sulphur life (the candelabras, reeds, pads, bladders) is
  the owner's textures where they came (`bark.brimstone`, `card.reed.brimstone`); the acid pads and gas bladders are still
  procedural geometry in vertex and instance colours.
  2026-10-26: the hot pools and the mud pots stand on a fine patch (1.6 m, four times the mesh; `84-host-ground.js`, THE FINE PATCH), cut out
  of the main mesh with its border on the coarse edges, so the pots' floors and the pools' bowls are drawn as cut. Stays open: the open cracks
  across the graben still read as notches (a patch along each would cost ~0.2M triangles each), the valley's walls carry nothing.
- [x] **The heat shimmer turns off antialiasing while it runs** (2026-10-07): in reach of the heat the frame renders to
  an offscreen target (WebGL cannot read an antialiased screen back), so edges step a little there; out of reach the page
  renders as before. The renderer's draw-call count in the HUD then shows only the last pass.
  2026-10-26: the screen quad runs FXAA over the target (`83-host-heat.js`): three r128's multisampled target cannot resolve the depth texture the
  sheets read, so the antialiasing is a post pass. The HUD's draw-call count still shows only the last pass.
- [ ] **The lava tube is one swept mesh** (2026-10-06, station 11): the walls and roof are a section swept along a centre
  line (no overhangs beyond its arch, no breakdown blocks fused into the walls); the skylights are holes in it with a pit
  wall up to the surface (small gaps can show where the two meet). The skylights' light is three spot lights (no shadows:
  the light pools on the floor below each hole, but the roof does not shadow the floor beside it), and the cave reads
  through a dim lamp carried with the camera. The kit's floor items are planted on the tube's floor (a heightfield inside
  the tube); its wall and roof life is placed by the host. The surface above is a band ~1.2 km wide; its rim trees are the
  kit's gully zone. No fauna (the blind cave life of the notes waits for the fauna kit).
- [ ] **The caldera's lava lake and plume are shader effects** (2026-10-06): the lake's crust and its swell are drawn
  in its shaders (the facets are shading, not geometry; the surface's swell is ~2 m); the plume is a column of point sprites (it does not cast a shadow and has
  no inside: a camera in it sees the billows from within). The eruption's fountains and bombs are glowing points (no
  splash or spatter where they land, no camera shake, no sound); the lightning is the shared atmosphere's bolt, struck
  round the camera, not inside the plume. The penitentes are near the cameras only (half a million blades
  was 28M triangles); farther out the plateau is plain snow. The rim's peaks are the heightfield's (no overhanging cornices).
- [ ] **The glacier's ice is drawn in the shader** (2026-10-06): the owner's `ice.glacier` is its surface and `ice.clear` its
  seracs, bergs, towers, caves and arch, but the crevasses, ogives and the medial moraine are painted over it in the ground
  shader. The gill-coral caps are the owner's `organic.cap.gillcoral`, mapped from above (their undersides
  show the same face). The crevasses are painted slots, not cut (the ground is one 6.5 m mesh); the caves are
  shells standing on the shelf, not hollows in the glacier (a carve patch, `core/terrain`, could cut a portal into the
  snout). The snow does not settle as it falls, and nothing moves on the ice (no calving, no meltwater on the surface).
- [ ] **Some of the new flora is still procedural** (2026-10-18, `HANDOFF-FLORA.md`). The owner's textures came the same day
  and are wired: the pyre thistle's blades and the lace fans (cards, glowing at night), the cage lantern's lattice, the medusa
  cap's dome, the coil horns' ribbed skin and the red velvet (a ragged alpha outline painted in code). Still vertex colour:
  the chalice parasol's stalk and skirt, the braid cap's vines, the geode pods, ember burrs, wire stalks, gold pins, blood
  chalices, the snare rafts' runners; the braid caps and the chalice's cap take the parasol skin (`cap.disc`) tinted, the
  moss domes the brain cap's. Library sets that could serve: `bark.ghostwood` or `bark.smooth` (the chalice stalk),
  `ground.moss001` (the domes).
  Stays open (2026-10-26): checked against the library: the moss domes already take `ground.moss001` and the chalice's stalk the pale bark's
  `organic.fungus.bracket` (`bark2`), so those two are done; the chalice's skirt, the braid cap's vines, the geode pods, ember burrs, wire stalks,
  gold pins, blood chalices and the rafts' runners have no matching set in the library (Delivered 2026-10-25/26 holds none for them): prompts are owed.
- [ ] **Station 1 is near its triangle ceiling** after the new flora: 19.79M scene triangles of 20M (19.06M before). The
  moss domes reuse the brain cap (~480 triangles each), so there are only ~800; a lighter dome would let them thicken.
  Its draw calls at the default camera were over the 140 ceiling before the flora (186) and are ~200 now (the verify
  flags it as a budget, not a failure); 209 with the owner's textures (four cards each for the blades and the fans). Station 1's gullies lie on the clear shoulder and its skylights barely reach the
  plume, so the plume's new trees stand on its old ground and the acid shores, a few in the gullies.

## The host (core/host, 2026-10-12)

- [ ] **Every page of the Throne is on core/host**: station 1's `src/99-host-take.js` and each station's own
      `stations/<name>/99-host-take.js` hand the page to `KHOST.take` (the stations' 90-host-camera.js and
      91-host-probe.js are gone; no core/host file is overridden). The caldera and the tube draw through `HEAT.render`
      (`draw`), the tube keeps its own camera clamp in the tube (`clampCam`), and the five stations with a Weather select
      put it in the host's `#ui` after `KHOST.take` (their 89-host-atmos.js ran before there was one). The Day / Night
      buttons and N are the kit's (`controls`, `keys`); the light of a preset is set by `onView`. Two things moved with the
      loop: a tick's second argument is now the clock's motion time, not seconds since the page opened, so an animation
      stands at another phase at a given moment (identical with time frozen, which is how the pages were proven); and the
      heat shimmer's `dt` is the clock's, so it holds still while the clock is paused.

## Export profile (core/export, 2026-10-18)

- [x] **core/atmos bound on every page (migration phase 0, 2026-10-20).** `ATMOS.bindHost` (`core/atmos/host/89-atmos-c-hostbind.js`, a subfolder so the kits that list core/atmos whole are unchanged) is called by `src/89a-host-atmos.js` on station 1 and, through `station.json` `"atmosHost": true`, on the kipuka, the savanna and the tube (hour 13, 0 in the night mode); all ten stations now list the core, presets, export, wave field and skylight fragments. The binding alone draws nothing (no triangles or calls added); the page's own sky, fog, sun and water are unchanged. `atmos` joins the profiles of stations 1, 2, 6 and 11. Station 1's triangle ceiling is raised from 20M to 22M (`BUDGET.showcase` in `src/99-host-take.js`, owner's approval) for core/water's drawing in later phases; the draw-call ceiling stays 140 (the page is over it already, above).

- [ ] **The Throne keeps the injection route.** Stays open (2026-10-26): the water moved onto core/water saved no page bytes (each page grew
      ~100-130 KB with core/water's fragments), so core/export is still injected, not listed.
      No page of the Throne lists core/export in its build: station 1's page is
      at its 20M size ceiling (above), so the two fragments are not added to the pages. `tools/harness.py export` injects
      them at export time (the biome core's `42`/`43` queued their parts), and `verify.py --assert` checks each page's
      export profile through the same injection (`check_profile(..., inject=True)`), one box and profile per page in
      `EXPORT_STATIONS` (`verify.py`; the table is also in `core/export/README.md`, "Profiles"). Every profile is
      `registry, items, buckets, materials, textures, terrain, stage` (sampled terrain: the kit has no krator-field). The
      caldera's and the tube's `stage` and `terrain` sections read ok: `HEAT.render` draws on the frame after the scene,
      and the stage capture renders the scenes with its own cube camera, so the shimmer is not in the panorama.
- [x] **`atmos` is left out of every profile, and errors on four stations.** 2026-10-20: fixed. `89-atmos-8-export.js` is in the `atmos` list of the seven stations that bind core/atmos (ash desert, caldera, cloud forest, glacier, vents, frontier, isle: their `station.json`), so `ATMOS.export` exists under the host fragment's wrapper; `atmos` joins those seven profiles (`EXPORT_STATIONS` in verify.py) and the `--sections` restriction is gone. Pages rebuilt, every profile PASS. The text below is the finding as made: The ash desert, the caldera, the cloud forest,
      the glacier and vent country list `89-atmos-9-host.js` but not `89-atmos-8-export.js`; the host fragment wraps
      `ATMOS.export` over the export fragment's, so on those pages `ATMOS.export` throws (`_export is not a function`) and
      the section reads `error` (the frontier and the isle, on the waves only, read `none`; station 1, the kipuka, the
      savanna and the tube have no core/atmos). The verify exports only the profile's sections on those five pages
      (`sections` in their `EXPORT_STATIONS` entry), so the error does not fail the run; `harness.py export` on them
      needs `--sections` the same way until it is fixed. The fix is either `89-atmos-8-export.js` in those stations'
      `station.json` `atmos` lists (then `atmos` joins their profiles) or a guard in `89-atmos-9-host.js`; both rebuild pages.
- [x] **The kipuka's and the frontier's pages failed the error panel** (found by the profile runs, 2026-10-18; fixed the same
      day): the hyperjungle's fauna, read in place from `biomes/hyperjungle/src`, lays its herds' loops with `BIO.walkLoop`
      (`core/biome/36-core-walker.js`, which the hyperjungle's own build lists), and the two `station.json` `core` lists
      had `35-core-anim.js` only, so `HYPERJUNGLE.buildFauna` threw `BIO.walkLoop is not a function` and the page built
      without its fauna. Both `core` lists now hold `36-core-walker.js` (the sort by name puts it after `35-core-anim.js`
      and before the hyperjungle fragments, as the hyperjungle's own build orders them); the two pages were rebuilt, verify
      clean with their profile PASS, and their baseline rows were rewritten (only those two).
- [x] **`water` is left out of every profile.** (2026-10-26: closed, below. 2026-10-20: re-checked: still true, no station binds core/water; the section reads `empty` on all eleven.) No page of the Throne is on core/water (the acid lake, the hot pools, the lava
      lake and the sea are the hosts' own surfaces), so the section reads `empty` everywhere. Add it back when a station's
      water is named to core/water.
      **2026-10-20 (migration phase 2): stations 2 (kipuka) and 6 (savanna) are on core/water, and `water` is in their profiles.** The rest stay out.
      `station.json` has a new `"water"` key (the five core/water fragments by name; build.py reads them from `core/water`). Station 2: its streams, run by
      run where no flow has buried the bed, are `WATER.flow` records (`STREAM_FLOWS`, 84-host-ground.js: the stream's centre line at `streamLevel` every
      10 m, 2.3 w wide), drawn by `stations/kipuka/89w-host-water.js` (`drawFlow`, skylight keyed on `LIGHT_MODE`), the page's own water shader and ribbon gone;
      the page sets `WATER.PRESETS.flow.rapids = [.1, .3]` (the streams fall 3% to 12%; the global default whitens them, `core/water/README.md` "Open gaps").
      Station 6: the sixteen dry-season pools are `WATER.still` discs (`POOL_STILLS`, 84), drawn by `stations/savanna/89w-host-water.js` (the old colour and .86
      opacity, night 0x101814 as before, the sky in them), each keeping an invisible flat disc for the inspector's click and the probe's occupancy of its
      registered volume (core/water's meshes take no ray and no probe sample: without the disc `registered-volumes-non-empty` failed for the two pools nothing else
      stands in). EXPORT_STATIONS: the savanna's box moved from the wood at the default view ([-1050,350,-750,650], no pool) to [-310,-420,-10,-120] (a pool at -158,-271;
      48 sets, 4 buckets), the kipuka's box is named in its row. Cost, same cameras, before -> after (calls, triangles): the savanna's A dry-season pool 69 -> 69, 17.97 M -> 17.97 M (the invisible discs draw nothing), Night: the savanna 73 -> 73, 17.97 M; the kipuka's A stream in the kipuka 111 -> 111, 9.16 M -> 9.17 M (a strip of two vertices every 5 m is a ribbon of three every 10 m).
      **2026-10-20 (migration phase 3): station 3 (frontier) is on core/water too, `water` is in its profile; stations 1, 4, 5, 8, 9 stay open.** The Ring Sea and the
      harbour bay (`SEA_MAT`, a 220 x 220 ShaderMaterial grid with its own foam and depth attribute) are one `WATER.open` (`stations/frontier/89w-host-sea.js`): level `SEA`,
      the shared wave field at full strength (no trochoid swell: this coast has no swell kit), `bed: terrainH` over [-3380, -3380, 300, 3380] (the sea lies west of x = 300),
      with a SHORE GRID (8 m cells, flooded from the bay's centre and a point at u = -3000): the swell shoals toward the black beaches and the headland, a breaker train runs in
      along the coast, and the ground (`MAT_GROUND`) takes `WATER.wetGround` (wet sand where the swash reaches). The two streams are `WATER.flow` per run (`STREAM_FLOWS`, 84: the
      valley's centre line at `streamLevel` every 10 m, 10 m wide, `drawFlow`; before, a `MeshLambertMaterial` ribbon every 6 m, 2 (5 + 2 sin) m wide), `WATER.PRESETS.flow.rapids`
      set to `[.1, .3]` as the kipuka does. `waterH` and `terrainH` are unchanged (the sea check, 'nothing rooted under the water', the camera clearance read them). The sky in the water is
      core/atmos's skylight (a capture of the dome and the giant, given to the water only, recaptured at each light mode). An invisible flat plane at `SEA` keeps the inspector's click on the
      sea. `ATMOS.waveUniforms(SEAU)` and the page's own foam and `_onLight` colours are gone. Hour stays 1 / 14. Cost, same camera (the default view), before -> after: 102 calls -> 102,
      7,664,442 -> 7,663,364 triangles (the old grid was never frustum-culled; the CDLOD mesh is selected per view: a net saving of about 1,100 at this camera, more where the camera looks away from the sea); the budget (24 M) is not near it (6.92 M scene). The shore grid and the draw take 0.2 s
      to build (390 k cells; `_t.sea0` -> `_t.sea`). EXPORT_STATIONS: the frontier's box moved from [-560, -400, -260, -100] (no water) to
      [-900, -700, -260, -100] (the first lahar valley's stream and the old terraces: 67 sets, 15 buckets), profile + `water` (9 of 9 met). This is the template for stations 4 and 5
      (an open sea with a shore grid, streams as flows). Gaps: `core/water/README.md`, "Open gaps (phase 3, Throne frontier/ringisles)".
      **2026-10-25 (core/water options, 2026-10-21): the three workarounds are gone.** Rapids: kipuka and frontier give each flow its own band (`drawFlow({rapids:[.1,.3]})`), the
      page-wide `WATER.PRESETS.flow.rapids` write is deleted. Savanna: the sixteen pools take `pick: true`, the invisible flat discs are gone (`registered-volumes-non-empty` is read from the
      pools themselves). Frontier: the streams' `width` is the old ribbon's profile again, 2 (5 + 2 sin(.03 u)) m, a per-point array (6 to 14 m, breathing along the valley), not a flat 10 m;
      the sea's `pick: true` replaced its plane. The kipuka's ribbon was always a flat 2.3 w (the old code offset by a constant S.w * 1.15), so its width stays a number.
      **2026-10-26 (the last stations): every station's water is on core/water, and `water` is in every profile that has water.** `station.json` "water" (and, for
      station 1, `S1_WATER` in build.py) lists the core/water fragments, a subfolder fragment (`geyser/52*`, `ext/53*`) keyed by its name; each station draws in its own
      `89w-host-water.js` (station 1's is `src/89w-host-water.js`, kept off the other stations), after core/atmos is bound, the sky in the water from core/atmos's skylight.
      Station 1: the acid lake a `WATER.still` (its 48-gon, the old middle-to-rim colours as the gradient at 60% brightness, the surface being lit where the old one was not),
      the three hot pools `WATER.spring` (banded by heat). Station 4 (the isle): the sea one unbounded `WATER.open` with a shore grid over the isle and shelf (8 m, seeds 'edge';
      both old grids gone), the wet sand by `WATER.wetGround`; the six springs `WATER.spring` (core/water's ramp is this page's old one); the cliff fall a `WATER.fall`
      (its speed the least that clears the face); each gully stream and the warm creek a `WATER.flow` per run. Station 5 (the cloud forest): the four falls a
      `WATER.fall` each (fitted to land on the old foot, where the spray rises), drawn by `WATER.drawFalls` in two meshes; the four plunge pools `WATER.still`, one mesh
      (`WATER.drawPools`, its probe points the pools' middles); each ravine's stream a `WATER.flow` per run between the falls. Station 8 (vents): the marsh a `WATER.still`
      (gradient, 60%), the nine hot pools `WATER.spring`. Station 9 (the glacier): the proglacial lake a `WATER.open` over its basin, calm (field .1, no surf), its shore
      grid flooded from the middle with the cells the lake does not hold set as land (so it cannot run down the river), the three braids a `WATER.flow` each.
      Not water, left out and said so: the caldera's lava lake and the tube's lava stream (core/atmos fx lava), the glacier's ice (its seracs, bergs, towers), the mud
      pots of the isle and vents (mud: core/water has no kind for it), the geysers' columns (the page's particles; `WATER.geyser` could take them later). The ash desert,
      the caldera and the tube have no water, so their profiles do not name it. waterH and terrainH are unchanged everywhere. EXPORT_STATIONS: station 1's box moved
      to the acid lake [55, -517, 355, -217], vents' to the hot pools [280, -600, 580, -300]; the isle, cloud forest and glacier boxes already held water.
      Cost (draw calls, triangles at the default camera, before -> after): station 1 210 -> 210, 19.76M scene triangles -> 19.76M (renderer 20.41M -> 20.41M; under the
      20M the brief keeps it to); the isle 130 -> 129, 16.94M -> 16.80M (renderer); vents 202 -> 203, 21.62M -> 21.74M (renderer; +0.12M is the pools' fine ground patch);
      the glacier 42 -> 42 (the outwash view 42 -> 44: one flow per braid), 6.31M -> 6.31M. The cloud forest 75 -> 72, 21.41M -> 20.06M scene triangles (the falls two meshes for
      four, the pools one for four, the streams one per run; the triangles fell with the dense stand's thinning edge, its item).

## The final rebuild (pair 5, 2026-11-02; `PLAN.md`, "Core adoption")

- [ ] **The far field.** No page takes KFAR: each station is an ideal type whose `terrainH` past the map is its own procedure, not the scale model, and
  station 1 is at its triangle ceiling. KHORIZON is baked over the map alone. Owed: a far ring per station from the model's heights round its px (the
  sky's ridges stand in today).
- [ ] **Sixteen texture units.** Station 1's floor reads fifteen (the paint, the detail, the macro and twelve library layers), the isle's and the vents'
  sixteen. The horizon (two units) goes on a ground only where it fits (`window._horizon.skipped`: station 1, the isle, the ash desert, the vents and the
  caldera keep their grounds' plain light, their flora takes it), and the rain's occlusion map (one) only where the ground has one free
  (`window._rainCover`: skipped on the isle and the vents, where the rain falls everywhere, as before). **The sun's shadows** (`KSHADOW`) take one more unit in every lit material (three r128 declares the map whenever the renderer's shadow map is on), so a page whose ground already reads sixteen has none: the isle and the vents (`window._shadow`); the others have them. **Their cost on station 1** (2026-11-03, the Intel Arc 140T, 1280x720, the world pass by wall clock: the Arc's ANGLE has no timer query): 118.7 to 161.2 ms on 'The plume's edge', 143.1 to 184.8 on 'From afar', 115.0 to 158.9 on 'A wild Ranj tree', about +42 ms a frame (+30-38%); the instances drawn double (0.55 to 1.11 M, the casters drawn again into the map), the triangles held do not move (19.89 M). **Station 1 cannot afford them on the Arc**: it already draws at 7-9 frames a second there. **Decided (the owner, 2026-11-03): shadows are toggleable and off by default on every page** (core/shadow, "Off by default"): the panel's `shadows` button or `?shadow=1` turns them on, and off they cost nothing. A ground on fewer layers, or two layers packed
  in one map, would free them.
  2026-11-09: the isle and the vents failed the GPU verify (`FRAGMENT shader texture image units count exceeds MAX_TEXTURE_IMAGE_UNITS(16)`) on their grounds,
  now on MeshStandard and KGROUND (claude/throne-kground-wip): core/atmos's cloud shade (`cloudShadeScene`, every lit material) declares `uniform highp
  sampler3D uNoise`, which `samplersOf` (89zz) did not match, so the isle's mesh (map, macro, detail, canopy, eleven KG layers, the swash's `wtrBed`, the
  noise) linked seventeen while the guard read sixteen, and the vents' ground (map, thermal, macro, detail, twelve KG layers, the noise) seventeen too; the
  bismuth added none. Fixed: `samplersOf` counts every sampler form (3D, array, shadow, integer, a precision qualifier) that the shader reads (one only
  declared, as the delta's `uMacro` under KGROUND, is compiled out and takes no unit), the normal/bump/roughness/metalness/env maps and `scene.environment`; the guard's limit is min(16, the GL's) so SwiftShader (32) decides as the GPUs do; after the guard every ground's count is
  `window._groundUnits` and one past 16 is on the error panel in any GL; and on the isle and the vents the detail is the macro's blue channel (the same
  pixels, one unit for two), so both grounds link sixteen.
- [ ] **What hangs under a cap.** The parasols' caps are drawn on a leaf material (their sway), so the attach audit reads a cap as a card and holds what
  hangs from it only inside half its radius (`onLeaf`). The snare moss and the drips were hung out to .85 of the radius; they now hang inside .47 and
  .48 of it. **The owner's eye:** a cap's rim may look bare now.
- [ ] **The caldera on map 5.1.** The model agrees with the page: its floor 10,260 m (the page 10,300), the west rim 10,450-10,835 m (the page 10,750, the
  peaks to ~10,850), so the wall's ~450 m drop stands. One difference for the owner: the model's floor holds a pit some 250 m deep (cells to 9,985 m), where
  the page's lava lake lies in a pit of 28 m. Deepening it changes the station's main view; not done.
- [ ] **The Zeijani's tubes round the kipuka** (map 5.1, `tubes.json`): `tube_dhelv_01`'s West Kipuka Portal (a cliff portal in old-growth kipuka forest, a
  rolling stone door 2 km in) and its neighbours `tube_surpu_02`, `_qarnu_03`, `_nuru_04` give station 2 a real route; the page draws none of them.
- [ ] **ringisles' strand pandanus** (`EXCHANGES.md`, ringisles ↔ throne) is not on the isle's beaches: ringisles reads this kit in place and has its turn in
  pair 8; read it in place there, or here after it.

## Open

- [ ] **The sky's landmarks (SKY-PLAN.md 4, layer 8; 2026-10-26).** The shared sky now draws the Throne's plume arcing over station 1 and the tube, the plumes over the summits of kipuka, savanna, frontier, isle and the glacier, the cloud belts on their flanks, the ash ceiling with its plume over the ash desert and the vents, the cloud seas round the caldera and west of the glacier, and the Ring Sea's silver line (preset.landmarks in 89-host-sky.js), where the notes above say they were not drawn. Built but not yet verified on the GPU page by page: that is folded into the biome rebuild's final rebuild and verify.

- [ ] **The shared sky (SKY-PLAN.md section 9, 2026-10-26): the look to judge.** The painted dome and the giant mesh are
      gone; `89s-host-sky.js` calls `ATMOS.skyBiome` (core/atmos) on the host clock: the page opens at 06:00 on game start's
      day (dawn), `#hour=13` is about the old fixed light. Station 1, the plume's edge, 1.26 atm with the plume's dust. Kept
      from the dome: the Throne's flank to the summit NNW, the near flank's swells and cones, the Inner Wall's faint line
      over the Ring Sea (ridges); the plume across the sky, its haze and the sea's silver line are not drawn (no landmark
      layer yet). Day and night are hours (13:00, 22:00): the old sun is out of reach at 40 S (SKY-PLAN 8). Stations on the
      shared sky: 1, kipuka, savanna, frontier and isle (each its own stations/<name>/89-host-sky.js; their 82 keeps only
      the light-mode names). Draw calls before and after (verify.py --assert, GPU, all passing): station 1 210 to 207,
      kipuka 112 to 111, savanna 73 to 71, frontier 102 to 101, isle 130 to 127. The six that waited moved on 2026-10-26 too: the weather stations (ashdesert, vents, caldera, glacier, cloudforest) keep their weather law, which now darkens the hour's light (their 89-host-atmos re-reads WXB from the sky each frame through SKY_LOOK and ATMOS.skyBiome weatherOver runs it again after the sky; weatherLook greys the sky in ash, snow, fog and rain), and the tube is a cave (skyBiome cave: the sky only draws, through the skylights and above ground, and the tube keeps its own light; 82 keeps its light table as caveLight). Caldera and tube draw through HEAT, which now takes the sky first (HEAT.before = SKY.renderSky; the tube calls its sky SKYB, since its stage already has a SKY, the skylights). The snowy surfaces (fx snowcover) take no cloud shade. Not drawn: the plume's brown ceiling over the ash desert and the vents, the cloud seas round the caldera and west of the glacier (no landmark layer yet). Draw calls before and after (all passing): ashdesert 145 to 143, vents 202 to 199, caldera 5 to 5, glacier 42 to 39, cloudforest 75 to 73, tube 92 to 89.
      Draw calls at the default camera (verify.py --assert, GPU): 210 before, 207 after.

