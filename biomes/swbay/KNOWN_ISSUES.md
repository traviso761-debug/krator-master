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
- [ ] The Girder tower still dresses as one list (`dress()` samples by area within a shell, so
      its big slabs take most of the moss); the jetty hands shells (Done). A shell with no face a
      pass grows on sits that pass out (65-dress `shellsFor`): the core's `BIO.faceSamples` gives
      such a shell its share and places nothing, so a host passing shells straight to the core's
      samplers loses those samples.
- [ ] The fauna's LOD is all-or-nothing at 1.6 km from the eye (frozen beyond, no thinning),
      the stalker never catches anything, and the glint swarms are Points, so the probe
      skips them.
- [ ] Verified only under SwiftShader (headless); the iridescent prism-gum leaves and the
      gill texture at grazing angles are untested on real hardware.

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
