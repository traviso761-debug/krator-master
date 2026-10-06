# Southern highlands — known issues

- [ ] **Every surface is procedural.** No `materials.json` yet: the barks, the ground, the leaves and the granite are
      the kit's own canvases. What the library would need (core/materials/PLAN.md, "Prompts for generated sources"):
      a wrung, moss-streaked mauve bark (the coilbark; refs/17, 19), a tree-fern trunk of diamond leaf scars, a
      shaggy dead-leaf skirt (the groundsel), a paramo ground (gold tussock over peat), sphagnum (green, gold and
      rust), and a leaf card of sage-teal small leaves. Existing sets that may serve: `rock.granite.tor`,
      `bark.pillar` (banded). Ask the owner before generating any.
- [ ] **The Koppen classes are an estimate** (Cfb, Cwb, ET, BSk): the scale model's climate rasters were not read for
      this region.
- [ ] **The cloud sea's edge** is a baked alpha mask on a 256 grid (~22 m a cell) plus mist sprites; from low angles
      on the scarp the deck can still show a soft line where it meets the ground.
- [ ] **No fauna**: it goes to the one fauna kit (biomes/README.md).
- [ ] **No catalog fruit**: the screw palm's fruit, the cereus fruit and the trumpet's water are not in
      `kits/catalog/krator-master-furniture-generic-fruit.js` (biomes/FRUIT.md).
- [ ] **Not in the open world**: `openworld/` has no southern highlands region yet; the kit's `fog` field must be
      bound by any world that wants the cloud forest (BIOME-API.md).
- [ ] **The budget is the measured total, 18.4M triangles at q=1** (19.5M ceiling in `91-host-probe.js`). The first build drew
      79M: the paramo's rosette trees were too many and their whorls too fine. The fixes, should it creep up again: fewer
      rosette trees (`PASSES`), the mid-distance copies of every spiral item (`SHIGH.it`), the detail radii in the host's
      `lod`. Shared trunk variants (a few templates instanced) would save memory, not drawn triangles.
- [ ] **The paramo's tussocks are mostly printed**: the ground shader lays a swirled tussock print (`TEX_TUFT`) over the
      paramo; the modelled swirl tussocks fill only the near band. Close up the print reads flat.
- [ ] **The streams are painted, not water**: the ravines' streams are a dark wet band on the ground, with no water
      surface.
