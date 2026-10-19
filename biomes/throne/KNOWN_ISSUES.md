# The Throne — known issues

- [ ] **Ten stations of ten.** The plume's edge (station 1), the kipuka (2), the spice frontier (3, `stations/frontier/`),
  the geyser isle (4, `stations/isle/`), the cloud forest (5, `stations/cloudforest/`), the south-flank savanna (6,
  `stations/savanna/`), the ash desert deep under the plume (7, `stations/ashdesert/`), vent country (8,
  `stations/vents/`) the glacier with its ice caves (9, `stations/glacier/`) and the rim over the caldera (10, `stations/caldera/`)
  are built. The shoulders' cold belt went into the glacier's. Not yet a station: the geyser field, the lee's penitentes
  below the summit. The shoulders' cold belt (gill-coral trees among conifers in the snow) is not yet a
  station (it could pair with the glacier's).
- [ ] **One pack for every station.** `materials.json` and `tex/` hold every station's textures, so each page carries the
  others' too (~5 MB of textures a page). A per-station pack would halve that.
- [ ] **The kipuka's hyperjungle is the kit as it is.** Its hypertrees are its own species at their own heights
  (150-300 m); the windward station did not tune them down. On this page they take the library barks (the hyperjungle's
  opt-in pack, `station.json` 'packs') with their limbs on the trunk's own map; the hyperjungle's own page does not.
- [ ] **The frill tree's fins** stand close and steep (the Rift's spacing and pitch); from below it reads as a furred column.
- [ ] **The standbys are this kit's own copies.** The frill-tree, the trumpet tree and the star aloe are drawn by this
  kit's builders, not the crater drylands' or the Rift's. In an open world where those kits are resident too, the
  standbys should come from their own kits at the border (`biomes/WORLD.md`, gradual borders).
- [ ] **Some alien surfaces are still procedural.** The caps, tiers, bells and pitchers take the owner's fungal skins
  (mapped from above); the mat's veins, the star aloe's head, the trumpet tree's funnels, the lamp caps and the frill pods
  are vertex colour only (`core/materials/PLAN.md`, The Throne: gaps).
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
- [ ] **The frontier's terraces** are cut into the heightfield (2.6 m risers) and faced with stones only within the
  cameras' mid range; farther out the risers are painted.
- [ ] **The frontier's north flow is off the planted map** (2026-10-06). `47-host-land.js` lays it from (2700,-1900);
  all its ground falls past `TERR.R-150`, in the unplanted rim, so it gets no registered volume (`84-host-ground.js`
  counts only in-map cells) and the station shows one old flow, the southern headland. Move its source inward to bring
  it onto the map.
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
- [ ] **The lehua read pale:** on the isle the lehua's grey bark under its vertex colours reads near white in a dense stand.
- [ ] **The geysers are particles:** the column is water drops and a steam cloud on the clock (`85-host-springs.js`); no
  splash on the cone, no runoff surge when one plays, and the springs' water does not boil.
- [ ] **The sea cliffs' face** takes the forest floor's paint, not basalt: the rock field is read off the 11 m field cache,
  too coarse for a ~10 m wall. The fall is a curtain that follows the face (`84-host-ground.js`, THE FALL), spray at its foot.
- [ ] **The cloud forest is dense only near the cameras** (2026-10-06): the elfin trees are heavy (crooked tubes, moss), so a
  sparse stand covers the map and a dense one stands only within 90 m of the cameras' spine; the elfin tree has no far
  impostor (the cloud hides it; when it clears the ground's canopy layer stands in). ~12 s to build, ~21.5M triangles.
- [ ] **The cloud forest's moss curtains** are the six greener cells of `card.moss.hanging` (its red and orange ones read as autumn).
- [ ] **The sky dome takes no fog**, so in the cloud a fog-coloured veil sphere hides it (`89-host-atmos.js`); the
  mountain shows only in a clear spell.
- [ ] **The savanna's parasol caps are heavy** (2026-10-06): the gill-parasols' and stilt parasols' discs and gills are dense
  lathes, ~10M of its ~17M triangles, so their woods are thinner than they might be. A lighter cap far off would let them
  thicken. No grazers (the fauna kit) and no people yet.
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
- [ ] **The heat shimmer turns off antialiasing while it runs** (2026-10-07): in reach of the heat the frame renders to
  an offscreen target (WebGL cannot read an antialiased screen back), so edges step a little there; out of reach the page
  renders as before. The renderer's draw-call count in the HUD then shows only the last pass.
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

- [ ] **The Throne keeps the injection route.** No page of the Throne lists core/export in its build: station 1's page is
      at its 20M size ceiling (above), so the two fragments are not added to the pages. `tools/harness.py export` injects
      them at export time (the biome core's `42`/`43` queued their parts), and `verify.py --assert` checks each page's
      export profile through the same injection (`check_profile(..., inject=True)`), one box and profile per page in
      `EXPORT_STATIONS` (`verify.py`; the table is also in `core/export/README.md`, "Profiles"). Every profile is
      `registry, items, buckets, materials, textures, terrain, stage` (sampled terrain: the kit has no krator-field). The
      caldera's and the tube's `stage` and `terrain` sections read ok: `HEAT.render` draws on the frame after the scene,
      and the stage capture renders the scenes with its own cube camera, so the shimmer is not in the panorama.
- [ ] **`atmos` is left out of every profile, and errors on four stations.** The ash desert, the caldera, the cloud forest,
      the glacier and vent country list `89-atmos-9-host.js` but not `89-atmos-8-export.js`; the host fragment wraps
      `ATMOS.export` over the export fragment's, so on those pages `ATMOS.export` throws (`_export is not a function`) and
      the section reads `error` (the frontier and the isle, on the waves only, read `none`; station 1, the kipuka, the
      savanna and the tube have no core/atmos). The verify exports only the profile's sections on those five pages
      (`sections` in their `EXPORT_STATIONS` entry), so the error does not fail the run; `harness.py export` on them
      needs `--sections` the same way until it is fixed. The fix is either `89-atmos-8-export.js` in those stations'
      `station.json` `atmos` lists (then `atmos` joins their profiles) or a guard in `89-atmos-9-host.js`; both rebuild pages.
- [ ] **The kipuka's and the frontier's committed pages fail the error panel** (found by the profile runs, 2026-10-18; not the
      profile, which both pass): the hyperjungle's fauna, read in place from `biomes/hyperjungle/src`, lays its herds' loops
      with `BIO.walkLoop` (`core/biome/36-core-walker.js`, which the hyperjungle's own build lists), and the two
      `station.json` `core` lists have `35-core-anim.js` only, so `HYPERJUNGLE.buildFauna` throws `BIO.walkLoop is not a
      function` and the page builds without its fauna. Fix: `36-core-walker.js` in both `core` lists, rebuild the two pages,
      rewrite their baseline rows (a page change; not done with the profiles).
- [ ] **`water` is left out of every profile.** No page of the Throne is on core/water (the acid lake, the hot pools, the lava
      lake and the sea are the hosts' own surfaces), so the section reads `empty` everywhere. Add it back when a station's
      water is named to core/water.
