# biomes/paintedhighlands: known issues

Open items are `- [ ]`; `build.py` counts them. Built 2026-11-11 in a cloud session: every check on this page ran on software GL
(SwiftShader); no GPU lane was available. The GPU `--assert` and `--all-views` on both lanes are owed before a merge.

## Owed

- [ ] **The GPU verify.** `verify.py --assert --all-views` passed on SwiftShader only. Run it on the `arc` and `rtx` lanes
  (`KRATOR_GPU_LANE`), with `--strict-budget`, and check the texture-unit count on the ground (`window._units`: the ground takes four library
  layers, the strata texture, the horizon and the weather's).
- [ ] **The banded rock's own grain (a procedural stand-in, by the rule).** The beds' colours are KSTRATA's (the core strata shader, which is
  not a stand-in), but their grain is borrowed: `ground.clay.popcorn` on the clay hills and `rock.sandstone.bedded.red` on the danxia faces,
  both used as grey detail under the strata colour. The owed set is `rock.badland.bedded`, a greyscale bedded tile
  (`core/materials/PROMPTS-NEEDED.md` section 9 has the prompt). When it comes: a `materials.json` family and the popcorn layer's slot in
  `84-host-ground.js` on the steep clay.
- [ ] **Korona's western ring species at station 4.** The plan reads them in place (section 4, `ecotone`). Korona's species fragment reads the
  necanyons kit's geometry and the hyperjungle's, so reading it here would bring both kits onto the page. Until Korona exports a kin row
  (`BIO.kin('korona.<key>')`) without them, the cliff town's wet wall grows the eastern badlands' Gambel oak and bigtooth maple (`BIO.kin`).
- [ ] **The cushions over 4 km.** `ehighlands` is not on any page: no station reaches 4 km (the highest, the bloom flats, is 3,393 m). The
  open world's streaming should read `EHIGHLANDS`' cushions where the plateau tops 4 km (4,128 km², section 3).
- [ ] **The fauna.** Named, not drawn (`42-biome-painted-fauna.js`): the fauna kit's bighorn, condor, cougar, pronghorn and honeybee; the
  plateau marmot, a painted-lady butterfly and the plateau's own grazer are owed to `kits/fauna` (its `BIOME-FAUNA-PLAN.md`).
- [ ] **The flood and the cold as live hazards.** The flash flood is a `KHAZ` record with a cycle (`drown`, 30 minutes, four on) on the wash and
  the canyon floor; nothing draws the brown wall yet (the "gorge flood" amendment other plans list: PLAN.md section 8). Winter cold is not a
  provider (`KHAZ.provide('temperature')`): the season's snow is drawn, not felt.
- [ ] **The dust season.** The plan's light summer dust off the playas (`core/atmos` `fx/89-atmos-fx-dustseason.js`) is not bound.
- [ ] **The `site` tag key.** The plan proposed `site: 'cliff-alcove' | ...`; the records use core/tags' free `zone` key and carry their
  detail in a `site` field of the record, so no core change was needed. If `site` becomes a vocabulary key, move the value there.
- [ ] **The canyon-mouth lake at station 4.** The lake (516 m) lies about 6 km north-west of the page, under the far field; it is not drawn.
- [ ] **The painted names.** The canyon, the playas, the hogbacks and the four sites have English working names only (section 9, defaults).

## Notes

- **The pages carry their packs inline** (`matlib_pack.fragment(..., own=True)`, as highrift's): about 5.5 MB a page, the packs the same in
  each. Korona's sidecar packs (`write_sidecar`) would share them, if the page cap ever asks.
- **The fins' beds** are the ground's (`STRATA_SH.inject` on a Standard material, `86-host-stacks.js`): a fin standing on the clay below the
  contact shows the clay's bands at its foot and the sandstone above, as the stack puts them. A first pass on Lambert drew them black.
- **The stones and fallen blocks** take only their instance colour (the solid material without vertex colours: their geometry has none; with
  vertex colours on they drew black).
