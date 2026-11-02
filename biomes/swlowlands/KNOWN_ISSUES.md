# Krator biome kit — the southwestern lowlands: known issues

Read before changing anything here. `build.py` prints the open count.

## Open

- [ ] **The shared sky (SKY-PLAN.md section 9, 2026-10-26): the look to judge.** The painted dome and the giant mesh are
      gone; `89s-host-sky.js` calls `ATMOS.skyBiome` (core/atmos) on the host clock: the page opens at 06:00 on game start's
      day (dawn), `#hour=13` is about the old fixed light. Kept from the dome: the Inner Wall (NE), the Outer Wall (SW) and
      the canopy lines, open over the inland sea (ridges). Draw calls at the default camera (verify.py --assert, GPU): 323
      before, 321 after.

- [ ] PUBLISH AFTER EVERY PASS. The claude.ai artifact is a separate copy of
      `dist/swlowlands.html`. Strip everything before `<title>` and the trailing
      `</body></html>` before publishing (00-head.html carries the page wrapper).
      Stays open: a process step for the owner after each pass (publishing needs the owner), not a code fix.
- [ ] BUDGET. At q=1 the scene HOLDS ~11.6M triangles against a 12M ceiling (9M per pass);
      0.36M of it are the 6.2k heroes' lite stand-ins. Since the runtime LOD (Oct 2026) it
      DRAWS 4.1–8.1M at the 27 preset views (1.3M from afar) in 216–403 draw calls. Before
      it, every camera drew all 11.7M in ~63 calls: the instanced items are not
      frustum-culled and every bucket's bounding sphere spans the map. The probe's ceilings:
      12M held, 9M drawn (tracked, not asserted by verify.py), 450 calls. The sprawl oaks
      alone are ~1.0M (vault habit, twigs, 48 avenue oaks), bay laurel ~0.8M. Stocking
      knobs: `DENS` in 55-trees, the per-species cells in the passes, and `quality`
      (`?q=`). The sprawl oak is exempt from `DENS`. `trisBySpecies` in the build report
      lists every species. Drawing knobs: `SWLOW.LOD`, `BIO.LOD.scale`, `BIO.LOD.chunk`.
      Stays open: a stocking/design trade-off (held 11.6M against 12M), not a bug; re-tuning moves placement.
      2026-10-26: moved by this pass. Held 11.74M (was 11.62M: +0.12M the finer ground at the waterline, +0.10M the salt marsh);
      drawn up ~0.1-1.0M a view (the floor's near band now drawn to 1200 m, item below), worst 8.39M (Violet
      jacaranda) under the 9M tracked ceiling; calls down 14-64 a view, worst 435 -> 377. Stays open: still the trade above.
- [ ] The runtime LOD costs draw calls: one mesh per item per 1200 m chunk per range (995
      meshes). The 3x3 chunks round the camera are drawn in full whatever the ranges, so a
      range under ~1200 m buys little: the chunk sets the near cost. A host that sets
      `BIO.LOD.chunk=600` before the build draws 2.9–5.0M at the presets (-35%) but in
      297–581 calls, with 2.6k meshes and a slower bake (measured Oct 2026). Chunks switch
      whole: a chunk of heroes becomes stand-ins at once somewhere between 1.2 and 2.9 km.
      This world's haze is thin (FogExp2 .0002, ~6% at 1.2 km), so the switch can be seen
      when flying across the plain.
      Stays open: the chunk cost is in the shared `BIO.LOD` (core/biome); a smaller chunk is a trade the owner decides.
      2026-10-26, the saving within the biome: `SWLOW.LOD.floor` and `.under` 800 -> 1200 (55-trees), so each floor
      item takes one mesh a chunk, not two (lod meshes 1091 -> 863). At the 28 presets: calls 239-435 -> 181-377
      (-14 to -64 a view), triangles drawn +0.1 to +1.0M (the near band's chunks at 800-1200 m now drawn). The owner can
      take it back to 800 if the triangles matter more than the calls.
      Stays open, the real fix is in core/biome 20-core-kit.js (proposed, not made): in `BIO.bake`, key the meshes by
      chunk only and sort each chunk's instances (and a bucket's triangles) by range, longest first; `BIO.lodTick` then
      sets `im.count` (a bucket's `geometry.setDrawRange`) to the instances whose range reaches the camera, instead of
      hiding whole meshes per range. One mesh per item per chunk whatever the number of ranges, and the core/tags parts
      keep their `idx` tables (already arbitrary order). The stand-ins' `minRange` stays a key of its own.
- [ ] The zone weights (SWLOW.zones) are thresholds on six fields. A world with
      differently scaled fields will want to retune the `smooth()` bands in 55-trees.
      `tropic` in particular: the rainforest proper starts where it passes ~.7.
      Stays open: a note for a future host; no defect here.
- [ ] The two-tone bark's second colour is per BUCKET, not per species: every
      `bk_flay` tree (madrone) shares one underbark green-white, every `bk_furrow` tree
      one lichen. A species that needs its own second colour needs its own bucket
      (one draw call).
      Stays open: a core/biome bucket design (per bucket, not per species); a new bucket is a design task.
      2026-10-26, proposed core change (not made): `BIO.glossBarkMat` (core/biome 30-core-foliage.js) reads the second
      colour from a per-vertex attribute (`aC2`, which the items already carry) instead of the bucket's uniform, and
      `BIO.tube`/bucket bake store a c2 per vertex (the species' own underbark); the uniform stays the default when a
      builder gives none. Per species, no new buckets, no new draw calls; +12 bytes a bark vertex.
- [ ] The far impostors are blobs (the hyperjungle's technique, shaped per habit). The
      small species use a 20-triangle blob; from the hills the chaparral reads as lobes.
      The heroes' lite stand-ins (seen past 1.2 km) are coarser still: 20-triangle blobs for
      crowns under 16 m (wider crowns keep the 80-triangle blob), an 8-triangle octahedron
      for the small species.
      Stays open: a core/biome impostor design task. (2026-10-26: the blobs themselves are this kit's code,
      55-trees buildFar / buildFarSmall; a finer small-species blob is a triangle trade at ~0.36M of stand-ins, left for
      the owner. Nothing in core needs to change for it.)
- [x] The small species' impostors carry no bark (one blob in the leaf colour), so the
      manzanita's ember, the ringbark's copper and the cane palm's lacquer stop at the
      detail ring.
      (Was: needs a bark-carrying impostor in core/biome.) Fixed 2026-10-26 in the kit, no core change needed (buildFarSmall is in 55-trees): the small species' blob takes
      half its bark colour (the second colour mixed in by the mask's mean, as buildFar's trunk) into its underside and
      the bark's gloss into uv.x toward the bottom, which `SWLOW.farMat` turns into the hero bark's sun highlight. No
      triangles and no random draws added. Subtle at the presets' distances (From the hills / From afar look the same).
- [x] The ground mesh shows square brown patches through the bayou's water ('The plain
      from above'): host 45-stage, ground cells standing above the water plane. It predates
      the runtime LOD.
      (Was open: ground work in host 45-stage.) Fixed 2026-10-26: the ground mesh (45-stage) keeps its 400 cells but splits every cell straddling the waterline
      (corners both under .3 m and over -.3 m: ~3.7k cells) 4 x 4 (~4.1 m) on terrainH; a split cell's edge against a
      coarse one takes the coarse edge's line, so no cracks. The straight-edged brown facets in the bayou ('The plain
      from above') are gone; the islets left are the real terrain's, rounded. terrainH and waterH unchanged, so no
      placement moved; the road (meshH) crosses no split cell. Ground 320k -> 438k triangles.
- [x] The river ribbon through the hills has no rapids. The delta has two
      distributaries and no salt-marsh fringe.
      The river has a rapids band of its own ([.08,.3], 2026-10-25, per flow). Fixed 2026-10-26, the delta's salt-marsh fringe (60-floor `buildMarsh`): where the salt and flow fields meet (the
      delta and the river mouth), on the mud and channel banks from -.3 to ~1.5 m: cordgrass swards at the water,
      glasswort (green to crimson) higher up, sea lavender in it. A new item `marsh` (50-species, last), a core/tags item
      set of kind `saltmarsh` (tags: tropic..subtropic, humid, riparian yes, zone 'salt marsh', form 'halophyte');
      the lavender is `bloom`. Every cell draws from core/rand (KRAND.stream of seed, band, world cell), not the floor's
      stream, so nothing else moved. 17.3k tufts, ~0.10M triangles; one LOD range: 2 meshes on the whole map. Density and colours are a look call for the owner.
- [ ] The Inner and Outer Walls are painted on the sky dome: 5.5° and 8.5° square-on,
      sinking toward NW and SE. Their distance and height are an assumption, not canon.
      A world that draws the walls as geometry does not need them.
      Stays open: an owner/canon decision (distance and height are assumed).
      Stays open (2026-10-26): left for the shared core/atmos sky rollout and the owner's canon call; not touched.
- [x] Only one Girder tower dresses. `dress()` samples by triangle area within a shell: the core takes shells (`{geos, share}`: the roof, the walls, the ledges, each with its own share of the samples, `core/biome/40-core-place.js`), but this host's tower still passes one list. 2026-10-20: the host tower hands three shells ({geos, share}: floor plates 1, iron .6, core walls and rubble .4), so the plates no longer take the moss; one test tower is all the host builds (Girder itself is not changed).
- [ ] No fauna yet.
      Stays open: a design task (a fauna kit), out of budget for this pass.
- [ ] verify.py: under `--assert` a page that never initialised raises in the per-type
      table instead of reporting (inherited). The error panel line above it says why.
      Stays open: inherited harness behaviour (tools/harness.py is shared, not this biome's).
      Stays open (2026-10-26): the shared harness's, not this kit's; not touched.
- [x] **Put the biome fruit in the kit** (`biomes/FRUIT.md`, 2026-10-06): madrone berries, rattlepods, ember tamarind, pillar figs, each a
      catalog piece in `kits/catalog/krator-master-furniture-generic-fruit.js`. Every species carries `tags.harvest` (`SWLOW.HARVEST`,
      `HV()` as nhighlands'), the toyon is tagged in `SWLOW.PLANTS`, `SWLOW.FRUIT_KEYS` lists the four keys; the inspector shows the tag.
      Figs are drawn on `pillarfig` near trees (item `fig`, 20 tris, palette `PAL.figFruit` from the catalog's `fruitFig`): clusters under
      and beside the limbs and on the bole (`bo.rS`), on their own h3 stream so nothing else moved; 1984 figs, ~40k tris. The probe's
      `fruit tagged, catalogued and drawn` check (and three negatives) runs in verify. 2026-10-20: the bay laurel berries, the skirt-palm
      fruit, the acorns (sprawloak, corkoak, coastoak: `generic_fruit_mast`) and the kapok seeds (`generic_fruit_silkpod`) now name catalog pieces
      (`generic_fruit_bay_laurel`, `generic_fruit_skirt_palm`); they are catalogued, still not drawn on the stage. `FRUIT_NOT_DRAWN` is down to the
      cane palm's heart and the pine nuts. `settlements/dalab` vendors this kit: it needs a re-vendor and rebuild.

## Done

- [x] Water-bound heights read the local water (`BIO.waterH`, Oct 2026): the mangroves' and knee-cypresses'
      `inWater` bands, the keep-out above the water, the lilies, hyacinth and duckweed, the shallows' reeds and the
      water band of the floor. With this host's level of 0 the geometry is the same bit for bit (mesh fingerprints).

- [x] Runtime LOD (xanadu's, through the core): heroes drawn within `SWLOW.LOD.tree` of
      their chunk and as lite stand-ins past it, ranges on the floor bands, understorey,
      logs, the avenue and grove rows and the dressing; the host calls `BIO.lodTick`. The
      presets draw 4.1–8.1M of 11.6M (1.3M from afar), where every camera drew 11.7M.
- [x] The bark's second colour and gloss reach the impostors: the trunk mixes in its
      bucket's second colour by the mean of the bark's mask, and carries the gloss in uv.x
      for `SWLOW.farMat`, which adds the bark hook's sun highlight. This kit has no
      view-angle iridescence: the item meant the two-tone. A ribbon gum's impostor is pale
      like the gum (it was the red of its stripes).
- [x] Magnolia flowers sit on twigs from the branch ends (they floated in the air).
- [x] Small species become far impostors instead of stopping at ~1.2 km.
- [x] Sprawl oaks ~50% more massive; three more tree species (sunburn, star gum, bay laurel).

- [x] No flowers on bark: perched bromeliads are grey-green; flowering trees flower in
      the crown (flame parasol, jacaranda, magnolia added).

- [x] Oaks tall enough to vault: 22–30 m, arch limbs, the avenue view from the road.
- [x] No floating foliage: every clump is anchored to a branch point (`crownOn`); crown
      tops have leaders.
- [x] Stripped cork only in the harvested grove; wild cork oaks are intact.
- [x] The road is laid on the rendered ground mesh (`meshH`); on terrainH it vanished
      into the 16 m ground cells.

- [x] First full build was ~25M triangles and crashed the page. Species are now
      stocked against `trisBySpecies`: manzanita, cane palm and pine were cheap per tree
      but ruinous in count.
- [x] Floor planting asks about the bole only (`SWLOW.blocked`); it used to be kept out
      from under half of every giant's crown.
- [x] Oak secondaries are short and flat, with the crown carried on them (they were
      bare vertical poles). Oak leaves are drawn at oak scale.
- [x] Lichen masks on the furrowed and lacquered barks are soft stains (they read as
      uniform white flecks).
- [x] Bark tiles no longer seam (painted shapes take their wobble from their size, so
      every wrapped copy is identical).
- [x] Mangroves stay in the water (they stood on the beach). Their drop roots are few and
      thin, and the prop roots arch.
- [x] Willow veils are fine strands (they were planks), only a few of them golden.
- [x] Chaparral shrubs are clad with foliage, with no bare lobe under them. Manzanitas
      grow upright.
- [x] Preset views find their subject (`viewTree`) and keep the camera outside the crown.
- [x] verify.py takes `KRATOR_CHROME=<path>` for an installed Chromium.
- [x] (2026-10-06) The showcase takes the material library (materials.json, tex/, the 44 pack; BIO.libSwap after the MAT table): barks, rock, wood and the leaf, frond and ground-plant cards, brightness matched to the measured procedural maps; single-plant slots show one cell of their sheet. Slots not in materials.json stay procedural (the 2026-10-06 sweep lists them in core/materials/PLAN.md). verify --assert passes, before and after.

## Export profile: sections left out (2026-10-18)

EXPORT_PROFILE in verify.py leaves out: atmos (the page has no core/atmos export: the section reads empty; sedesert fills it with 89-atmos-8-export.js); water (no core/water surface meets the box: the section reads empty). Add each back when the kit fills it.

2026-10-20: `atmos` is now bound and in the profile (migration phase 0: `89a-host-atmos.js` calls `ATMOS.bindHost`, build.py lists core/atmos's core, presets, export, waves and skylight plus `core/atmos/host/89-atmos-c-hostbind.js`; the binding alone draws nothing, and the page's own sky, fog, sun and water are unchanged). `water` waits for its phase: no core/water surface is drawn here yet.

2026-10-20: checked, nothing to wire. This page binds neither core/atmos nor core/water (its water, where it has any, is the host's own MAT_WATER shader), so there is nothing for the two sections to export and both stay out of the profile. The shared pieces are in place for the day it does: core/export's adapters (`09`) fill `atmos` from `ATMOS.export` and `water` from `WATER.surfaces`, and a kit that binds core/atmos lists `89-atmos-8-export.js` in its `CORE_ATMOS` and adds `atmos` to `EXPORT_PROFILE` (geyser, ringisles, sedesert, the Throne's stations).

2026-10-20 (migration phase 3, seas and lakes): `water` is in the profile (`EXPORT_PROFILE` in verify.py) and the page's own water is gone: the one 6.6 km plane (vertex colours by depth and place, ripples in its shader) and the river ribbon. Now `89w-host-water.js`: the inland sea (`SEA_WATER`) and the bayou, the oxbows, the delta and the river's lowland reach (`INLAND_WATER`) are two `WATER.open` surfaces at y=0 on one 8 m bed baked once from terrainH; the first has a shore grid flooded from the middle of the water (the beach laps, the water stops at the shore), a calm swell and 12% of the shared wave field, the bed's tint over sand; the second is flat, bed-less and tea-dark, drawn only over the 16 m cells that hold inland water (ground under 0.4 m, inland of the shore, or the delta's plume within 45 m of a channel and 120 m off the shore). The two masks are complements, so no cell is drawn twice. The river through the hills is a `WATER.flow` (`RIVER`, 45-host-stage: a line down RIVER_T every 24 m at bed + 0.6 m, never climbing downstream, 1.6 x riverW wide, quicker where it falls; `WATER.PRESETS.flow.rapids` is set to [.08, .3] before drawing, the old ribbon had none). Before and after, from the same named cameras (headless SwiftShader): 'The plain from above' 340 calls / 7.23M tris -> 341 / 7.08M; 'Mangrove shore' 259 / 4.75M -> 260 / 4.65M; 'The bayou' 303 / 5.90M -> 304 / 5.78M; 'From afar' 98 / 1.32M -> 99 / 1.15M; 302 of 450 draw calls at the initial camera (301 before); scene triangles unchanged. `BIO.waterH` and `terrainH` are unchanged. What changed in the look: lit and tone-mapped like any standard material, so the tints are written darker than the old unlit colours (the sea's shallow is a third of the way to its mid colour, its deep three quarters of the old deep); the water has a surf line and a sun glint; the tint now steps at the shore and at the plume's edge instead of blending over 90 m and 200 m; the pale sand shoals, the bayou's darker pools and the river's silt colour are one tea-dark colour (core/water's open surface has one tint pair: `core/water/README.md`, 'Open gaps (phase 3...)'); the water is not click-to-inspect any more. the old ground-squares issue ('The ground mesh shows square brown patches', above) is NOT fixed by the clip: those squares are ground-mesh cells (16 m) standing above the surface where the ground, not the water, is the coarse thing, and a shore grid only changes where the water is drawn. Checked on 'The plain from above' (before and after look the same); it needs ground work, which this phase does not do.

2026-10-26 (core/water gap options): merging the bayou into the sea's surface (one WATER.open, a predicate shore seed, the tea-dark colour as a tint field) was tried and REVERTED: on a GPU verify the lily pads (waterH+.04) vanished under the merged surface on 'The bayou'. Not the sea's swell (damp 12 did not help) nor the wave field, and the merged surface sits lower than the level there; cause not found. The page keeps its two surfaces (INLAND_WATER for the bayou and river). The river's rapids band is `drawFlow({rapids:[.08,.3]})` on the flow itself.

## The plants' feet on the drawn ground (KSEAT, 2026-11-02)

The plants stand on the ground mesh's triangles (`drawnH`), and `hostChecks` measures their feet with `KSEAT.contactSweep`. 47 of
36,733 sampled feet are still off it, recorded as `FEET_OWED` in `src/99-host-take.js` and in `tools/verify_ratchet.json`: 26 floating,
21 buried, worst 2.29 m up, .97 m down, mostly reed, marsh, mossmat and a few lobes. Not traced. On `terrainH` the same feet give 963.
The check leaves out 1,261 pieces held by something else (a palm's crown, a limb, a log's back, duckweed, the tower's ledges): those
over .6 m above the ground on `HELD_ITEMS`, or inside an obstacle's footprint. A float over .6 m on those items is not seen here.
The tower is not a seat surface: with it marked, verify never finished twice, though the stall was not traced to it.
