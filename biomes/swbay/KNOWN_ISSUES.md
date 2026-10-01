# Krator biome kit — the southwest bay: known issues

Read before changing anything here. `build.py` prints the open count.

## Open

- [ ] PUBLISH AFTER EVERY PASS. The claude.ai artifact is a separate copy of
      `dist/swbay.html`; strip everything before `<title>` and the trailing
      `</body></html>` before publishing (00-head.html carries the page wrapper).
- [ ] BUDGET. The scene is ~9.7M triangles / ~540k instances at q=1 against an agreed 10M ceiling
      (7.5M per pass; the tree pass sits at 7.0M); the heaviest items are the tree limbs, the rods (open cylinders now: the
      caps were a third of the scene), the epiphyte rosettes and the small mushrooms.
      `SWBAY.build({quality:.6})` is the knob.
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
- [ ] `dress()` samples by triangle area (inherited); the jetty's deck gets most of its moss.
- [ ] The fauna's LOD is all-or-nothing at 1.6 km from the eye (frozen beyond, no thinning),
      the stalker never catches anything, and the glint swarms are Points, so the probe
      skips them.
- [ ] Verified only under SwiftShader (headless); the iridescent prism-gum leaves and the
      gill texture at grazing angles are untested on real hardware.
- [ ] **Put the biome fruit in the kit** (`biomes/FRUIT.md`): gatepod (savannah baobabs), bay fungi (coral fungus, parasol). Each has a catalog piece in
      `kits/catalog/krator-master-furniture-generic-fruit.js` (`biome: 'swbay'`). Everything is drawn. Add harvest tags. The umbrella thorn's pods and the monkey-puzzle cones are not drawn.

## Done

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
