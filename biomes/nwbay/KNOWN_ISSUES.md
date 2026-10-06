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
- [ ] THE TSINGY'S CANYONS ARE GAPS, NOT CUTS. The ground mesh (11 m cells) cannot draw a 2-7 m
      canyon, so the canyon floors are the massif's plateau, level with the fissures; Bemaraha's
      canyons are tens of metres deep. A real cut needs its own fine floor strip (as the travertine
      reach has) or the fins standing taller beside a canyon.
- [ ] THE FINS ARE NOT SOLID TO ANYTHING: terrainH is the ground between them (the camera can fly
      through a blade), they are not obstacles (a crown can grow into one; only the foot is kept out,
      by the mask), and they are not dressed (no moss, no figs on the blades; Bemaraha's blades are
      mostly bare, but their tops carry Pachypodium and lichen).
- [ ] A SINKHOLE'S WALL IS A LATHE like a stack's: no caves, no arches, no overhang beyond the bell;
      a tiankeng's floor trees can push their crowns into the wall (the mask keeps feet 12 m off it).
      The lip hides the ground mesh's cut with a polygon offset; at a grazing angle from far off the
      cut's jagged edge can show through.
- [ ] VARIANTS GROW ON FLAT GROUND: the ironbark's surface roots, the pandan's stilt roots and the
      mangrove's prop roots are grown in the nursery on level ground (or in level water) and stamped
      onto the slope as they are, so on a steep site a root floats or sinks a little. The cliff fig's
      curtains are the only per-site part.
- [ ] DRAW CALLS: 276 at the first view (99 before; the budget was 130, now 300): 208 baked meshes, of
      which ~140 are variant parts, each one InstancedMesh, plus the host's stacks, fins and dolines. Merging
      a species' variants per material into one geometry with per-instance offsets would cut it to
      ~60, at the cost of the Godot shape (one MultiMesh per variant part).
- [ ] THE MADAGASCARENE FLORA HAS NO IMPOSTOR OF ITS OWN: past the hero range the four species are
      the generic blobs (a column for the spinewand, a flat disc for the avenue baobab). The avenue
      baobabs stand in stands, not in Morondava's lines: there is no road for them to line.
- [ ] PUBLISH AFTER EVERY PASS. The claude.ai artifact is a separate copy of `dist/nwbay.html`;
      `publish.py` strips the page wrapper 00-head.html carries.

## Done

- [x] INVERTED POLYGONS (2026-10-05). The twelve karst stacks (faces and domes) were wound clockwise from
      outside, so their near walls were culled and each drew as its own hollow back wall; dress() read
      their domes as ceilings. The travertine reach's fine ground strip faced down (culled from above).
      Both flipped (45-host-stage); every other host mesh checked by the share of its faces pointing out
      of its centroid and up.
- [x] THE TSINGY, THE DOLINES, THE MADAGASCARENE FLORA (2026-10-05): see NOTES.md, the section of that name;
      the probe checks `nothing-in-a-blade`, `nothing-on-a-sinkhole-wall`, `madagascarene-flora`.
- [x] TREES AS VARIANTS (2026-10-05): six per species and level, grown once, stamped (56-variants); the probe
      checks `heroes-are-variants`.

- [x] The core fragments (10–40) were byte-identical to swbay's (a world vendors them once). Superseded
      by the entry below: nwbay now reads them from `core/biome/`.
- [x] ON THE SHARED BIOME CORE (2026-10-03). `build.py` lists `CORE_BIOME` (10, 20, 30, 40 and
      42-core-export) as rift's does; the four src copies are deleted, and `BIO.export()` is new here.
      The old copies were the swbay-1 core. Differences from `core/biome/`, and whether nwbay depends
      on them: BIO.version string (no); the noise lattice cache in vnoise (bit-identical); `BIO.host`
      gains waterH, register, lod, windows, clock, wind (nwbay binds none: waterH 0, no wind, so the
      sway terms are x1 and +0); the default mask (nwbay passes its own); fields flow, mist, cold, rock
      default to 0 (read by nobody here); kits/namespaces (nwbay stays in the default kit); float32
      stores and the indexed-vertex bake (nwbay's own `K.pos.push(...)` calls work unchanged);
      runtime LOD keys (BIO.range stays null: one mesh per item, as before); BIO.dynamic/tick/col
      (unused); `BIO.grid` calls `accept` before the host mask (same RNG draws unless an accept uses
      the RNG; here none did); `BIO.faceSamples` takes shell groups (plain lists draw as before).
      No nwbay fragment needed a change. Checked in headless Chromium, SwiftShader, 36 preset views,
      frame loop frozen after load: `window._api.totals` identical before and after (8,214,841 tris,
      593,505 instances, 4 meshes, 2,343 registered, 5 types), a hash of every REG record identical
      (no plant moved), page error panel empty, and no view differs from its before by more than
      0.13 % of pixels over 24 levels (sea and sky edges). `BIO.export({})` now returns 39 items, 11
      buckets, 44 materials, 32 textures (214 MB of JSON, digest 227809611 under h=h*31+c); the old core
      has no exporter, so there is no before to compare. Baseline rewritten for nwbay only.
- [x] The karst: `karst(x,z)` field, stacks as their own meshes, terrainH on the tops, the mask
      zero on the faces; the probe checks nothing roots on a face and every fig is on the karst.
- [x] The three new land species: cliff fig (root curtains to the waterline), flame-crown
      (scarlet patches on one side), cinder pine (sheared down the salt gradient).
- [x] Travertine: terraced pools with snapped levels, rimstone lips, cascade foam, shelf pools.
- [x] Igneous: two lava tongues, black-sand coves, one columnar-basalt headland, lava boulders.
- [x] The semi-aquatic zone: mangroves in the shallows, pandans, pipe reeds, mat-reed beds
      (exported), lotus trumpets on the banks, sea-grape and salt scrub, lily pads, pneumatophores.
- [x] The height ceiling holds (probe: `height-ceiling`); nothing is Girder-sized.
