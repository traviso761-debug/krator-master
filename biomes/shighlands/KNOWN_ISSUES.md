# Southern highlands — known issues

- [ ] **Some surfaces are still procedural.** The library now dresses the coilbark (`bark.wrung`), the groundsel and
      lobelia skirts (`bark.skirt`), the screw palm, the crown and moss cards, the granite, and three ground layers (moss,
      paramo grass, sphagnum): `materials.json`. Still the kit's own canvases: the trumpet's ribbing, the volute's rind,
      the tree fern's leaf scars, the ruffle-crown's bands, the fern and strap fronds, the begonia leaf, the daisies. Ask
      the owner before generating any (core/materials/PLAN.md, Southern highlands, has the delivered rows).
- [ ] **The Koppen classes are an estimate** (Cfb, Cwb, ET, BSk): the scale model's climate rasters were not read for
      this region.
- [ ] **The cloud sea's edge** thins by the ground's clearance under the deck, sampled round the camera on a 160 grid
      (~33 m a cell, `PRESETS.clouddeck.clear`) plus this host's mist sprites; from low angles on the scarp the deck can
      still show a soft line where it meets the ground. The mist is not exported (core/atmos/README.md, port to-do).
- [ ] **The deck's look is second-pass** (2026-10-06: billow noise in place of plane waves, which drew parallel lines):
      domes and creases from above, a frayed edge over the ground; still flatter than towering cumulus. Tune it in
      `PRESETS.clouddeck` only (octaves, puff, heap, gain, tilt, colours), then rerun `godot/tools/atmos_clouddeck.js`
      and `atmos_golden.js` so Godot follows (core/atmos/GODOT.md).
- [ ] **No fauna**: it goes to the one fauna kit (biomes/README.md).
- [ ] **No catalog fruit**: the screw palm's fruit, the cereus fruit and the trumpet's water are not in
      `kits/catalog/krator-master-furniture-generic-fruit.js` (biomes/FRUIT.md).
- [ ] **Not in the open world**: `openworld/` has no southern highlands region yet; the kit's `fog` field must be
      bound by any world that wants the cloud forest (BIOME-API.md).
- [ ] **The budget is the measured total, 18.5M triangles at q=1** (19.5M ceiling in `91-host-probe.js`). The first build drew
      79M: the paramo's rosette trees were too many and their whorls too fine. The fixes, should it creep up again: fewer
      rosette trees (`PASSES`), the mid-distance copies of every spiral item (`SHIGH.it`), the detail radii in the host's
      `lod`. Shared trunk variants (a few templates instanced) would save memory, not drawn triangles.
- [ ] **The paramo's tussocks are mostly printed**: the ground shader lays a swirled tussock print (`TEX_TUFT`) over the
      paramo; the modelled swirl tussocks fill only the near band. Close up the print reads flat.
- [ ] **The streams are painted, not water**: the ravines' streams are a dark wet band on the ground, with no water
      surface.
