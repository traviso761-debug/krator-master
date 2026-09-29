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
      beard-oak boughs, reed beds, pipe-reed whorls, the araucaria ropes.
- [ ] The savannah is a sketch: umbrella trees, grass, Vain fronds, rosettes, but the
      slope's top is a smooth ramp and the transition into the highlands is not designed.
      It is meant to be its own kit (the abyssal savannah).
- [ ] The zone weights (EASTABYSS.zones) are thresholds on the four fields; a world with
      differently scaled fields will want to retune the smooth() bands in 55-trees.
- [ ] Bark canvases are near-grey and tinted (the hyperjungle's open issue is closed
      here), but texMean is still measured at run time; the species' bark colours are
      written a stop darker than they read because the sun+hemisphere rig doubles them.
- [ ] The lily pads sit at y=.05 on a plane at y=0 whose ripples are shader-only, so
      they never bob. Fine at any distance; wrong if a world animates its water mesh.
- [ ] Stilt-woods root on terrain under the water (prop roots to the bed); with a world
      whose water is not at y=0 the `inWater` band in 55-trees (-1.6 .. 1.2) must move.
- [ ] The far impostors are the hyperjungle's blob technique; the small species (tree
      ferns, cycads, pipe reeds, palmettos, jade) stop at ~1.5 km from the LOD spine
      instead of becoming impostors. Visible as a thinning from the "From afar" view.
- [ ] The east river's climb up the slope is a ribbon in the water material with no
      cataracts; the west river has no slope reach at all (it stays in the basin).
- [ ] Only one Girder tower dresses. `dress()` samples by triangle area (inherited).
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
- [ ] The iridescent bark is a view-angle hue shift on the sky scale-tree's bucket only;
      it does not reach the impostor ring (flat colour beyond ~1.1 km).

## Done

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
