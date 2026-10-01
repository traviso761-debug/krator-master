# Krator biome kit — the eastern abyss: known issues

Read before changing anything here. `build.py` prints the open count.

## Open

- [ ] PUBLISH AFTER EVERY PASS. The claude.ai artifact is a separate copy of
      `dist/eastabyss.html`; strip everything before `<title>` and the trailing
      `</body></html>` before publishing (00-head.html carries the page wrapper).
- [ ] BUDGET. The scene was ~7.4M triangles / ~580k instances at q=1 after the first
      pass and the coal-swamp pass was given a ceiling of 11M (probe: 8.2M per pass,
      11M scene); see baseline.json for where it landed. The hyperjungle ran at 2.5M.
      `EASTABYSS.build({quality:.6})` is the knob. The heaviest items: knee-tree and
      beard-oak boughs, reed beds, pipe-reed whorls, the araucaria ropes. With the far
      hulls (Oct 2026) the trees pass holds 8.195M of its 8.2M (5k left) and the scene
      10.78M of 11M: the next thing added to the trees pass must pay for itself (thin a
      species, or the hulls: `buildFarSmall`'s n, 5 a side, 3 past 2.2 km).
- [ ] The savannah is a sketch: umbrella trees, grass, Vain fronds, rosettes, but the
      slope's top is a smooth ramp and the transition into the highlands is not designed.
      It is meant to be its own kit (the abyssal savannah).
- [ ] The zone weights (EASTABYSS.zones) are thresholds on the four fields; a world with
      differently scaled fields will want to retune the smooth() bands in 55-trees.
- [ ] Bark canvases are near-grey and tinted (the hyperjungle's open issue is closed
      here), but texMean is still measured at run time; the species' bark colours are
      written a stop darker than they read because the sun+hemisphere rig doubles them.
- [ ] The water's ripples are shader-only, so the lily pads and rafts (at the local water level
      +.04 to +.08) never bob. Fine at any distance; wrong if a world animates its water mesh.
- [ ] The far ring is fixed by distance from the LOD spine, not from the camera: a camera
      standing in it (the south marsh past z ~1.9 km, the north shore) sees the canopy
      blobs and the small species' hulls up close, crude. A world with a free camera
      wants the runtime LOD (`BIO.range`, core) instead.
- [ ] The far hulls take no keep-clear entry (so the near field places exactly as before
      them): a hull can stand inside a canopy impostor or another species' hull. Invisible
      at range; seen only from a camera inside the far ring.
- [ ] The east river's climb up the slope is a ribbon in the water material with no
      cataracts; the west river has no slope reach at all (it stays in the basin).
- [ ] Only one Girder tower dresses. `dress()` samples by triangle area within a shell: the core takes shells (`{geos, share}`: the roof, the walls, the ledges, each with its own share of the samples, `core/biome/40-core-place.js`), but this host's tower still passes one list.
- [ ] No fauna yet.
- [ ] The mat-reed beds are registered per bed (a few hundred volumes); a world that
      registers its own structures densely may want only `EASTABYSS.REEDBEDS`.
- [ ] The beard oak's boughs are clamped 1.2 m above terrainH point by point; on a
      steep bank the clamp can put a kink in a bough.
- [ ] The araucaria's rope branches carry no side shoots; the reference plates show
      them. The tip rosette is a lobe.
- [ ] The shore zone reads only terrainH and wet, so the shallows species (stilt-woods,
      tide lycopsids, cordaites, water palms) do not tell the lake's salt west shore from
      its marsh east shore; a world with a fresh lake will not notice.

- [ ] The shelf overlay dome (82-host-sky) is a second 4096x2048 canvas: ~16 MB of texture
      for the wall alone. A world that already draws its horizon as geometry does not need it.
- [ ] The sky scale-tree's impostor shimmers on its bole only (the hero's forks shimmer
      too and have no impostor), and seen from outside the ring the far canopy's blobs
      hide most of that bole. Only six sky scale-trees stand in the ring at q=1 (the jungle
      barely reaches 1.9 km from the spine); the preset "The far ring" frames them.

## Done

- [x] Water-bound heights read the local water (`BIO.waterH`, Oct 2026): the zones' shore height, the stilt-woods'
      `inWater` band and their prop-root base, the keep-outs, the reed beds, the lily pads, rafts and hyacinths, the
      shallows' reeds and the water band of the floor. With this host's level of 0 the geometry is the same bit for
      bit (mesh fingerprints).

- [x] Every species carries to the horizon: past its mid radius a small species is a far
      hull (`buildFarSmall`: 20 triangles, 12 past 2.2 km, shaped per habit in `FARHAB`,
      coloured from the seed), and a reed bed past 1.9 km one low hull. +89k triangles in
      abyss/trees (5185 hulls), +2k in abyss/reeds; every other mesh hashes as before.
      (Jade and Calamophyton grow only inside their mid radius in this host: no hulls.)
- [x] The sky scale-tree's impostor bole shimmers like its hero bark: it is built into its
      own bucket, `fari`, drawn in the iridescent material without a texture (one call more).
- [x] Every bole lathe ends in a dome ring; the crowns of the knee-tree and the bell-bark
      read correctly from above (they were open pipes).
- [x] The abyssal shelf stands in front of the gas giant (painted on an overlay dome drawn
      after it); crest light, lip shadow, strata, gullies and a talus apron added.
- [x] The inspector names a plant by its own item label ("Marsh reeds (under Marsh
      knee-tree)"); the map-wide registration no longer swallows every click.
- [x] Tide lycopsid, Calamophyton palm and Sanfordacaulis added, tagged and zoned.
- [x] Seal-tree, strap cordaite, seed fern, rope araucaria, beard oak, water palm and
      mat reed added, tagged and zoned; cordgrass meadows, leaf rafts, water hyacinth,
      epiphyte ferns and lianas on the floor and the boles.

- [x] Marsh floor above the water plane except in its pools (the first build flooded it).
- [x] Registered tree volumes use the real spread of the crown; the probe's
      registered-volumes-non-empty invariant passes.
- [x] Water ripples fade with range (moiré past 300 m).
- [x] Salt-pan cracks are weighted per vertex by the salt field; the marsh mud and the
      savannah no longer show them.
- [x] The flats' river is damp, not marsh: the knee-trees stay out of it, the jade and
      the rosettes line it.
