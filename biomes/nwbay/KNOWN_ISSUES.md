# Krator biome kit — the north-west bay: known issues

Read before changing anything here. `build.py` prints the open count.

## Open

- [ ] THE STACK FACES ARE A HEIGHT PROFILE ON A LATHE, not a cave system. The notch at the
      waterline is an undercut ring (13 % of the radius), the two ledges are rings; there are
      no real caves, arches or hollow stacks yet. Ys builds its caves and stair-houses into
      the faces itself (DESIGN §8); the karst field only says where the rock is.
- [ ] THE RIM: terrainH() inside a footprint is the dome (`domeH`, rho 0..1) and the face
      mesh's top ring sits at rho .92, so the last 8 % of a footprint is terrain the mesh does
      not cover (it is the rounded rim, 16 m tall). The host mask is zero there (d > -4 m),
      and the cliff figs root at d < -4 m, so nothing stands on the gap -- but a camera on
      the rim is clamped to a surface that is not drawn.
- [ ] THE ROOT CURTAINS HANG AT THE FOOTPRINT RADIUS (R0 + 0.4..1.4 m), while the face bellies
      in and out by ~5 % of R0 up its height; on a big stack a curtain can float a few metres
      off the rock at mid-height or clip into a belly. A face-following root needs the host's
      face profile, which the biome cannot see.
- [ ] THE TERRACES' RISERS ARE RAMPS: the ground mesh's strip (3 x 4 m cells) and the water's
      5 m samples render a five-metre riser as a steep chute, not a drop; the rimstone lips
      sit on the pool's downstream edge and the foam sheet runs down the ramp. Semuc reads
      from the air and from across a pool; from on the lip the drop is too shallow.
- [ ] LILY PADS AND LOTUS ARE ONLY ON WATER AT y=0 (the lagoons, the lowland reach): the
      terrace pools' water level is the host's (tread + 1.5 m) and the biome cannot know it,
      so the pools above the delta carry no pads. The lotus trumpets stand on the banks.
- [ ] BUDGET. At q=1 the scene is ~9 M triangles (the tree pass ~6 M) against the 10 M
      showcase ceiling; the far strip of the ground mesh (NU 793 x NV 36) and the stacks are
      host geometry. `NWBAY.build({quality:.6})` is the knob.
- [ ] The far country is coarse (70 m cells): the Inner Wall is a vertex-coloured ridge and
      the volcano a low-poly cone if a camera is flown out to them. No road, no lava glow.
- [ ] The zone weights (NWBAY.zones) are thresholds on the fields; a world with differently
      scaled fields (Ys's 3.2 km map) will want to retune the smooth() bands in 55-trees,
      the salt rim (260 m here) first.
- [ ] Bark canvases are near-grey and tinted; texMean is measured at run time; the species'
      bark colours are written a stop darker than they read because the sun+hemisphere rig
      doubles them (inherited). The cinder pine's plates are painted mid-grey for the same
      reason and read near-black only through the tint.
- [ ] The far impostors are the hyperjungle's blob technique: a flame-crown's flush is a second
      red blob, a fig's crown is one blob offset over the edge, a cinder pine a lopsided blob.
- [ ] `dress()` samples by triangle area (inherited): on a stack most wall samples land on the
      big mid-height faces, few on the ledges; the jetty's deck gets most of its moss.
- [ ] The fauna's LOD is all-or-nothing at 1.6 km from the eye (frozen beyond, no thinning);
      the soarers' loops clear the canopy and the stack tops but not a fig's root curtain; the
      glint swarms are Points, so the probe skips them. No herd, no gliders, no cap moths
      (the fungoid canopy and the savannah went with the fork).
- [ ] Verified only under SwiftShader (headless); the iridescent prism-gum leaves, the lotus
      fringe's iridescence and the limestone's vertex colours at grazing angles are untested
      on real hardware.
- [ ] PUBLISH AFTER EVERY PASS. The claude.ai artifact is a separate copy of `dist/nwbay.html`;
      `publish.py` strips the page wrapper 00-head.html carries.

## Done

- [x] The core fragments (10–40) are byte-identical to swbay's (a world vendors them once).
- [x] The karst: `karst(x,z)` field, stacks as their own meshes, terrainH on the tops, the mask
      zero on the faces; the probe checks nothing roots on a face and every fig is on the karst.
- [x] The three new land species: cliff fig (root curtains to the waterline), flame-crown
      (scarlet patches on one side), cinder pine (sheared down the salt gradient).
- [x] Travertine: terraced pools with snapped levels, rimstone lips, cascade foam, shelf pools.
- [x] Igneous: two lava tongues, black-sand coves, one columnar-basalt headland, lava boulders.
- [x] The semi-aquatic zone: mangroves in the shallows, pandans, pipe reeds, mat-reed beds
      (exported), lotus trumpets on the banks, sea-grape and salt scrub, lily pads, pneumatophores.
- [x] The height ceiling holds (probe: `height-ceiling`); nothing is Girder-sized.
