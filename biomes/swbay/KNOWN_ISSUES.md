# Krator biome kit — the southwest bay: known issues

Read before changing anything here. `build.py` prints the open count.

## Open

- [ ] PUBLISH AFTER EVERY PASS. The claude.ai artifact is a separate copy of
      `dist/swbay.html`; strip everything before `<title>` and the trailing
      `</body></html>` before publishing (00-head.html carries the page wrapper).
- [ ] BUDGET. At q=1 the scene HOLDS ~10.13M triangles / ~540k instances: the agreed 10M
      ceiling's 9.84M plus 0.29M of lite stand-ins behind the 9.3k heroes (7.5M per pass; the
      tree pass sits at 7.45M with them). Since the runtime LOD (Oct 2026) it DRAWS 4.7-7.0M at
      the presets checked (under the prism gums 6.82M, the jungle from above 6.95M, from the
      highlands 5.73M, the baobab avenue 4.74M, the jetty 5.68M) in 169-273 calls; the chunk
      meshes alone are 2.0-6.2M over the 27 presets. Before it, every camera drew all ~10.5M in
      57-97 calls: the instanced items are not frustum-culled and every bucket's bounding sphere
      spans the map. The probe's ceilings: 10.5M held, 8M drawn (tracked, not asserted by
      verify.py), 400 calls. The heaviest items are the tree limbs, the rods (open cylinders: the
      caps were a third of the scene), the epiphyte rosettes and the small mushrooms. Stocking
      knob: `SWBAY.build({quality:.6})`; drawing knobs: `SWBAY.LOD`, `BIO.LOD.scale`, `BIO.LOD.chunk`.
- [ ] The runtime LOD costs draw calls: one mesh per item per 1200 m chunk per range (614
      meshes). The 3x3 chunks round the camera are drawn in full whatever the ranges, so a
      range under ~1200 m buys little: the chunk sets the near cost. Chunks switch whole: a
      chunk of heroes becomes stand-ins at once somewhere between 1.2 and 2.9 km, and the haze
      is thin (FogExp2 .00017, ~4% at 1.2 km), so the switch can be seen when flying. The
      stand-ins are coarse (20-triangle blobs on a one-band bole); the prism gum's is greener
      underneath than its far impostor so the jungle ring reads as it did from the highlands.
      The fauna is not chunked (its own `eye` LOD, below): its eight meshes are always drawn.
- [ ] THE TEMPLE HEIGHT IS A PLACEHOLDER. The brief says the tallest jungle trees top out
      at the height of the Voth temple; the canon figure is not in this kit, so
      `SWBAY_TEMPLE_H=110` (45-host-stage). Set it and every canopy height follows.
- [ ] The far country is coarse (70 m cells, vertex colour and a detail texture): fine from
      the map, a low-poly hill if a camera is flown out to it. No road, no lava glow; the
      plume and the fumaroles are chains of transparent globes.
- [ ] The zone weights (SWBAY.zones) are thresholds on the fields; a world with
      differently scaled fields will want to retune the smooth() bands in 55-trees.
- [ ] Bark canvases are near-grey and tinted; texMean is measured at run time; the
      species' bark colours are written a stop darker than they read because the
      sun+hemisphere rig doubles them (inherited).
- [ ] The far impostors are the hyperjungle's blob technique; dragon trees, parasols and
      tree ferns, splay shrubs and bracket trees get one cheap blob each beyond the mid
      range, the coral fungus too; none of them is more than a blob.
- [ ] The cataracts' risers are the ribbon's 10 m samples, so a five-metre fall is a 26-degree
      chute rather than a drop; the pools between them do not spill.
      2026-10-20 (migration phase 3): still the limit, now on core/water: the river is a `WATER.flow` with a sample every 10 m, so each
      five-metre terrace is a 26-degree chute (the ground is not reworked), and the 37 terraces `WATER.fallsOf({steep: .3, minDrop: 3.5})`
      finds are `WATER.fall` curtains that leave the lip at the speed that lands them at the foot of the chute, with a plunge pool each.
      The foam cards are gone. A curtain and its plunge are two draw calls, so only the falls within 900 m of the camera are drawn
      (`89w-host-water.js`; 'The cataracts' view 271 -> 290 calls).
- [x] (2026-10-20: the Girder test tower now hands three shells, floor plates 1 / iron .6 / core walls and rubble .4, like the jetty; and the `shellsFor` edge case is not a loss: the core's `BIO.faceSamples` already drops a shell with no accepted face and gives its share to the others, so `shellsFor` is only a redundant local pre-filter.) Was: The Girder tower dressed as one list (`dress()` samples by area within a shell, so
      its big slabs take most of the moss); the jetty hands shells (Done). A shell with no face a
      pass grows on sits that pass out (65-dress `shellsFor`): the core's `BIO.faceSamples` gives
      such a shell its share and places nothing, so a host passing shells straight to the core's
      samplers loses those samples.
- [ ] The fauna's LOD is all-or-nothing at 1.6 km from the eye (frozen beyond, no thinning),
      the stalker never catches anything, and the glint swarms are Points, so the probe
      skips them.
- [ ] Verified only under SwiftShader (headless); the iridescent prism-gum leaves and the
      gill texture at grazing angles are untested on real hardware.
- [x] **Put the biome fruit in the kit** (`biomes/FRUIT.md`), 2026-10-06: every species carries a harvest tag (`SWBAY.HARVEST`,
      `S.tags.harvest`; the inspector shows it for a tree's volume): gatepod (baobab, the hyperjungle's catalog piece), bay
      fungi (coral, parasol). All drawn. The probe's `fruit tagged, catalogued and drawn` check (with three negatives) holds it.
- [x] The umbrella thorn's pods and the monkey-puzzle cones: tagged as edible with `fruit: null`, named in the probe's
      not-drawn list. 2026-10-20: catalogued (`generic_fruit_acacia_pod`, `generic_fruit_puzzle_seed`, and the planted cherry's
      `generic_fruit_cherry`) and tagged; still not drawn on the stage. `FRUIT_NOT_DRAWN` is down to the tree fern's fiddleheads.

## Done

- [x] Runtime LOD (Oct 2026, review item 2): every pass builds under `BIO.range` (`SWBAY.LOD`),
      bake splits items and buckets per 1200 m chunk, the host calls `BIO.lodTick` each frame;
      a hero keys by its foot (1200 m) with a lite stand-in behind it. Drawn 10.5M -> 4.7-7.0M at
      the presets checked; held 9.84M -> 10.13M.
- [x] The jetty dresses per shell: the deck (slabs, parapets), the piers above the water and the
      kiosk with its rubble hand `{geos, share}` shells (1 / .6 / .4) without their buried or
      hidden faces, so the kiosk, the rubble and the piers get their share of the moss, brackets
      and curtains instead of the deck taking most of it.

- [x] The river bed climbs in steps on the slope: the cataracts fall. The far mesh is 70 m.
- [x] Fauna LOD through the host's `eye` hook; darters loop beside the bole, not through it;
      gliders over the savannah and cap moths under the caps.
- [x] A second structure dresses: the ruined jetty. The bracket shelf's back half is inside
      the trunk.

- [x] The host mask zeroes the river's channel up the slope (trees and floor plants stood
      in it); the ribbon samples every 10 m and rides a metre over the bed's bumps.

- [x] The soarers' loops clear the canopy and the tower; the herd turns away from trunks.
- [x] Foam on the river's steep reaches; fumaroles on the volcano's flank.
- [x] A stalker trails the herd; pods of swimmers cruise the bay; the coral fungus has an
      impostor, so every species now carries to the horizon.

- [x] Fauna: flocks, a herd and insect swarms against this contract (75-fauna).
- [x] The far country carries the ground's detail texture and lava tongues down the cone.
- [x] Splay shrubs and bracket trees become impostors beyond the mid range (coral fungus
      still stops; it is knee-high).

- [x] The volcano and the crater rim are terrain (the far country mesh), not a painting;
      the 16 MB overlay dome is gone.
- [x] The cap-tree's gills meet the stipe through a collar of flesh.
- [x] Dragon trees, parasols and tree ferns become impostors instead of stopping.

- [x] Every bole and cap lathe ends in a near-zero ring; nothing is an open pipe from above.
- [x] Registered tree volumes use the real spread (bough tips / cap radius); the probe's
      registered-volumes-non-empty invariant passes.
- [x] The water material is double-sided, so the river ribbon renders whichever way its
      triangles wind.
- [x] The verify harness launches the installed Chromium (`VERIFY_CHROME`) when Playwright's
      own pin is not present.
- [x] (2026-10-06) The showcase takes the material library (materials.json, tex/, the 44 pack; BIO.libSwap after the MAT table): barks, rock, wood and the leaf, frond and ground-plant cards, brightness matched to the measured procedural maps; single-plant slots show one cell of their sheet. Slots not in materials.json stay procedural (the 2026-10-06 sweep lists them in core/materials/PLAN.md). verify --assert passes, before and after.

## Export profile: sections left out (2026-10-18)

EXPORT_PROFILE in verify.py leaves out: atmos (the page has no core/atmos export: the section reads empty; sedesert fills it with 89-atmos-8-export.js); water (no core/water surface meets the box: the section reads empty). Add each back when the kit fills it.

2026-10-20: `atmos` is now bound and in the profile (migration phase 0: `89a-host-atmos.js` calls `ATMOS.bindHost`, build.py lists core/atmos's core, presets, export, waves and skylight plus `core/atmos/host/89-atmos-c-hostbind.js`; the binding alone draws nothing, and the page's own sky, fog, sun and water are unchanged). `water` waits for its phase: no core/water surface is drawn here yet.

2026-10-20: checked, nothing to wire. This page binds neither core/atmos nor core/water (its water, where it has any, is the host's own MAT_WATER shader), so there is nothing for the two sections to export and both stay out of the profile. The shared pieces are in place for the day it does: core/export's adapters (`09`) fill `atmos` from `ATMOS.export` and `water` from `WATER.surfaces`, and a kit that binds core/atmos lists `89-atmos-8-export.js` in its `CORE_ATMOS` and adds `atmos` to `EXPORT_PROFILE` (geyser, ringisles, sedesert, the Throne's stations).

2026-10-20 (migration phase 3, seas and lakes): `water` is in the profile (`EXPORT_PROFILE` in verify.py) and the page's own water is gone. The bay is `WATER.open`
(`89w-host-water.js`: bed from terrainH over the old plane's 2.2 R square at 8 m, a shore grid flooded from the bay's middle so the water stops at the beach and
laps a white edge under 1.4 m, a calm swell and 12% of the shared wave field, `BAY_BOX` as its bounds, which hold the export box), the far country's water a flat second
`WATER.open` 0.15 m under it (masked off 60 m inside the bay's box), the river a `WATER.flow` along vR (`RIVER`, 45-host-stage), the cataracts `WATER.fall`s. Before and
after, from the same named cameras (headless SwiftShader, `verify.py --views`): 'The bay from the shore' 172 calls / 5.69M tris -> 172 / 5.57M; 'The river mouth' 330 / 7.64M -> 329 /
7.50M; 'The cataracts' 271 / 7.51M -> 290 / 7.36M; 'From over the bay' 226 / 5.89M -> 225 / 5.75M. The scene-triangle ceilings do not move (10.14M held of 10.5M, 172 of 400 calls at
the initial camera); the build takes about 3.5 s longer for the bed and shore bake (3.7 s -> 7.2 s in the same run). `BIO.waterH` and `terrainH` are unchanged and the random
stream is too (the old foam texture's painter still runs its draws: `45-host-stage.js`). What changed in the look: the bay is lit and tone-mapped like any standard material, so its tints
are written darker than the old unlit colours; the shoals are paler and have a surf line; the pale sand shoals and the fresh-water tint where the river meets the bay are not kept (an
open surface takes one shallow and one deep colour: `core/water/README.md`, 'Open gaps (phase 3...)'); the water is not click-to-inspect any more (the labels are on the meshes; core/water's meshes have no raycast).
