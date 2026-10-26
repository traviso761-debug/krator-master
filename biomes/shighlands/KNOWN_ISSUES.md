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
- [ ] **No catalog fruit**: the screw palm's fruit and the cereus fruit are now tagged (`generic_fruit_pandan_keys`, `generic_fruit_cereus`,
      2026-10-25); the trumpet's water is a drink with no catalog piece, and the other edible parts (croziers, scroll tips, buds) have none (biomes/FRUIT.md).
      Stays open: needs catalog pieces, not this kit.
- [ ] **Not in the open world**: `openworld/` has no southern highlands region yet; the kit's `fog` field must be
      bound by any world that wants the cloud forest (BIOME-API.md).
- [ ] **The budget is the measured total, 18.5M triangles at q=1** (19.5M ceiling in `99-host-take.js`). The first build drew
      79M: the paramo's rosette trees were too many and their whorls too fine. The fixes, should it creep up again: fewer
      rosette trees (`PASSES`), the mid-distance copies of every spiral item (`SHIGH.it`), the detail radii in the host's
      `lod`. Shared trunk variants (a few templates instanced) would save memory, not drawn triangles.
- [ ] **The paramo's tussocks are mostly printed**: the ground shader lays a swirled tussock print (`TEX_TUFT`) over the
      paramo; the modelled swirl tussocks fill only the near band. Close up the print reads flat.
- [x] **The streams are painted, not water** (2026-10-25): each ravine's stream is a `WATER.flow` along the ravine's floor line
      (`ravX`), its surface a running minimum of the floor so it only falls (`89zw-host-water.js`); the ground keeps a faint wet bank
      (the painted band lightened from .7 to .4). The tarn is a `WATER.still` with a gradient and the bog pools one `drawPools` mesh
      (the host's own `MAT_WATER` and discs are gone).

## Export profile: sections left out (2026-10-18)

EXPORT_PROFILE in verify.py leaves out: water (no core/water surface meets the box: the section reads empty). Add each back when the kit fills it.

2026-10-20: `atmos` is in the profile and fills (the build lists `89-atmos-8-export.js`). `water` stays out: the page binds no core/water (its water is the host's own MAT_WATER shader), so there is no surface for the section to export. 2026-10-20 (migration phase 0): the wave field and the sky's light (`89-atmos-a-waves.js`, `89-atmos-b-skylight.js`) are in its `CORE_ATMOS` now, ready for core/water; nothing is drawn by them.

2026-10-25 (migration phase 4): `water` is in `EXPORT_PROFILE`: the page draws the tarn and bog pools (`WATER.still`) and the ravine streams (`WATER.flow`) on core/water (`89zw-host-water.js`, after 89z binds ATMOS). The cloud deck stays core/atmos's.
