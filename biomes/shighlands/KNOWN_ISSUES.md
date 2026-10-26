# Southern highlands — known issues

- [ ] **Some surfaces are still procedural.** The library now dresses the coilbark (`bark.wrung`), the groundsel and
      lobelia skirts (`bark.skirt`), the screw palm, the crown and moss cards, the granite, and three ground layers (moss,
      paramo grass, sphagnum): `materials.json`. Still the kit's own canvases: the trumpet's ribbing, the volute's rind,
      the tree fern's leaf scars, the ruffle-crown's bands, the fern and strap fronds, the begonia leaf, the daisies. Ask
      the owner before generating any (core/materials/PLAN.md, Southern highlands, has the delivered rows).
      2026-10-26: wired from the library (`materials.json`, `pack.py`; cut in `50`'s `libCell`): the floor's fern fronds
      (`card.fern.green`, the upright frond, flipped base-up), the screw palm's straps (`card.strap.pandan`, the straight strap),
      the daisies (`card.cupflower`), the trumpet's ribbing and the frill column (`bark.frill.ribbed`), the volute's rind
      (`bark.smooth`), the tree fern's scars (`bark.lepido`), all grey detail under the species' colours. Delivered 2026-10-26 and pre-wired: the
      ruffle-crown's and cereus's bands (`bark5`, family `bark.banded` = `bark.banded.ring`) and the escargot begonia's leaf
      (family `escargot` = `card.begonia.escargot`, the middle cell, full colour); awaiting the all-builds rebuild. The page grew ~0.8 MB (seven packed maps).
- [ ] **The Koppen classes are an estimate** (Cfb, Cwb, ET, BSk): the scale model's climate rasters were not read for
      this region.
      Stays open (2026-10-26): no local extract covers the southern highlands (`openworld/little-demo` is the east);
      surveying needs `tools/scale-model/extract_region.py` run on the scale model page for this region's polygon.
- [ ] **The cloud sea's edge** thins by the ground's clearance under the deck, sampled round the camera on a 160 grid
      (~33 m a cell, `PRESETS.clouddeck.clear`) plus this host's mist sprites; from low angles on the scarp the deck can
      still show a soft line where it meets the ground. The mist is not exported (core/atmos/README.md, port to-do).
      Stays open (2026-10-26, checked under the shared sky): 'Above the cloud sea' shows the thinned deck as a dark, mottled
      band with a hard line where it crosses the slope. Extra host mist sprites on the contact line were tried and dropped
      (one draw call each, +27 calls from afar, no visible gain). The fix is core/atmos's: a soft-depth fade in the deck's
      fragment shader (alpha by the scene depth behind it, as soft particles), or a finer clearance grid near the camera.
- [ ] **The deck's look is second-pass** (2026-10-06: billow noise in place of plane waves, which drew parallel lines):
      domes and creases from above, a frayed edge over the ground; still flatter than towering cumulus. Tune it in
      `PRESETS.clouddeck` only (octaves, puff, heap, gain, tilt, colours), then rerun `godot/tools/atmos_clouddeck.js`
      and `atmos_golden.js` so Godot follows (core/atmos/GODOT.md).
      Stays open (2026-10-26): `PRESETS.clouddeck` is core/atmos's and the shared sky rollout's; not this kit's files.
- [ ] **No fauna**: it goes to the one fauna kit (biomes/README.md).
- [ ] **No catalog fruit**: the screw palm's fruit and the cereus fruit are now tagged (`generic_fruit_pandan_keys`, `generic_fruit_cereus`,
      2026-10-25); the trumpet's water is a drink with no catalog piece, and the other edible parts (croziers, scroll tips, buds) have none (biomes/FRUIT.md).
      Stays open: needs catalog pieces, not this kit. Proposed (kits/catalog, 2026-10-26): a drink `generic_drink_trumpet_water`
      (a gourd of rain water), foods `generic_food_croziers` (a bundle of fiddleheads), `generic_food_scroll_tips`, `generic_food_frill_bud`
      and `generic_food_ruffle_hearts`, then set `fruit` in `SHIGH.HARVEST`.
- [ ] **Not in the open world**: `openworld/` has no southern highlands region yet; the kit's `fog` field must be
      bound by any world that wants the cloud forest (BIOME-API.md).
- [ ] **The budget is the measured total, 18.5M triangles at q=1** (19.5M ceiling in `99-host-take.js`). The first build drew
      79M: the paramo's rosette trees were too many and their whorls too fine. The fixes, should it creep up again: fewer
      rosette trees (`PASSES`), the mid-distance copies of every spiral item (`SHIGH.it`), the detail radii in the host's
      `lod`. Shared trunk variants (a few templates instanced) would save memory, not drawn triangles.
      2026-10-26: 19.01M before the known-issues pass, 19.44M after it (the tussocks' bodies +0.21M, the bunchgrass +0.22M).
- [x] **The paramo's tussocks are mostly printed** (2026-10-26): each swirl tussock is now a hummock (a dome of dead thatch
      and a skirt of dead blades under its live swirl; 7 live blades near, 6 at mid distance, to pay for it), and the near
      band carries a bunchgrass sward between them (`bunch`, crossed `card.ichu` cards on a KRAND per-cell lattice, 36k
      at 6 triangles, `60-biome-shigh-floor.js`). The print stays for the distance.
- [x] **The streams are painted, not water** (2026-10-25): each ravine's stream is a `WATER.flow` along the ravine's floor line
      (`ravX`), its surface a running minimum of the floor so it only falls (`89zw-host-water.js`); the ground keeps a faint wet bank
      (the painted band lightened from .7 to .4). The tarn is a `WATER.still` with a gradient and the bog pools one `drawPools` mesh
      (the host's own `MAT_WATER` and discs are gone).

## Export profile: sections left out (2026-10-18)

EXPORT_PROFILE in verify.py leaves out: water (no core/water surface meets the box: the section reads empty). Add each back when the kit fills it.

2026-10-20: `atmos` is in the profile and fills (the build lists `89-atmos-8-export.js`). `water` stays out: the page binds no core/water (its water is the host's own MAT_WATER shader), so there is no surface for the section to export. 2026-10-20 (migration phase 0): the wave field and the sky's light (`89-atmos-a-waves.js`, `89-atmos-b-skylight.js`) are in its `CORE_ATMOS` now, ready for core/water; nothing is drawn by them.

2026-10-25 (migration phase 4): `water` is in `EXPORT_PROFILE`: the page draws the tarn and bog pools (`WATER.still`) and the ravine streams (`WATER.flow`) on core/water (`89zw-host-water.js`, after 89z binds ATMOS). The cloud deck stays core/atmos's.

## Open

- [ ] **The shared sky (SKY-PLAN.md section 9, 2026-10-26): the look to judge.** The painted dome and the giant mesh are
      gone; `89s-host-sky.js` calls `ATMOS.skyBiome` (core/atmos) on the host clock: the page opens at 06:00 on game start's
      day (dawn), `#hour=13` is about the old fixed light. A true blue 1 atm column. Kept from the dome: the Throne far to
      the north (now at az 25, where the scale model puts it; the dome painted it at 8), the Inner Wall running east and
      west (one ridge in two lobes) and the warm lowland to the south. The cloud sea in the north beyond the real cloud deck
      and the Throne's plume are not drawn; 89z's cloud deck keeps its fixed sun. Draw calls at the default camera
      (verify.py --assert, GPU): 98 before, 95 after.

