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
- [ ] **Korona's western ring species at station 4.** The plan reads them in place (section 4, `ecotone`). It needs Korona's turn first:
  `BIO.kin` takes a kit that exports `SPECIES`, `make` and `grow`, and Korona exports `grow` but no `make`; its species fragment also takes its
  geometry from the necanyons kit (`KORONA.G = NECANYONS.G`), so necanyons would come onto the page too. Until then the cliff town's wet wall
  grows the eastern badlands' Gambel oak and bigtooth maple (`BIO.kin`).
- [ ] **The cushions over 4 km.** `ehighlands` is not on any page: no station reaches 4 km (the highest, the bloom flats, is 3,393 m). The
  open world's streaming should read `EHIGHLANDS`' cushions where the plateau tops 4 km (4,128 km², section 3).
- [ ] **The fauna.** Named, not drawn (`42-biome-painted-fauna.js`): the fauna kit's bighorn, condor, cougar, pronghorn and honeybee. The
  plateau marmot, a painted-lady butterfly and the plateau's own grazer are owed to `kits/fauna` (its `BIOME-FAUNA-PLAN.md`): a change there
  reaches 24 builds and 97 pages (`tools/reach.py`), so it is the fauna kit's own turn, not this kit's.
- [x] **The flood and the cold as live hazards** (2026-11-11, second pass). The flash flood is drawn on its own `KHAZ` record's cycle
  (`89w-host-water.js`, `FLOOD`): brown water over the wash's floor (station 1) and the canyon's (station 3) at the flood's mark, risen from under
  the bed through the cycle's rise, gone when it idles; a **Flash flood** button on the bar brings it now (its warning first). The cold is
  `KHAZ.provide('temperature')` (`89a-host-atmos.js`): the station's warm and cold months by the season, the lapse and the day's swing, so
  KHAZ's `cold` row harms on a winter night. Both checked by the probe with negatives. Not done: the flood's roar (core/audio) and a flood that
  carries the clay's flowers away.
- [x] **The dust season** (2026-11-11, second pass). `ATMOS.dust`, `ATMOS.airLoad` and `ATMOS.dustSeason` (crater-drylands' lines), the
  dryness the bloom's calendar's straw and seed: light dust off the playas, the bare clay and the washes in late summer, none in the melt and the
  bloom. Not on the cliff town's wet wall.
- [ ] **The `site` tag key.** The plan proposed `site: 'cliff-alcove' | ...`; the records use core/tags' free `zone` key and carry their
  detail in a `site` field of the record, so no core change was needed. If `site` becomes a vocabulary key, move the value there.
- [x] **The canyon-mouth lake at station 4** (2026-11-11, second pass). The wall's foot falls past the page's west edge to the lake's bed, and
  the lake is a `WATER.open` at 516 m with no surf (`89w-host-water.js`), seen from the wall's top (the view "The lake below the wall"). Its
  place is an ideal type's (west of the foot, 4.5 km across), not the model's pixels.
- [x] **Section 8's rows** (2026-11-11, second pass). `core/camp`: the pigment works are a `KCAMP` work camp on the bloom flats (`46-host-cliff.js`,
  `PIGMENT`): its yard the pit, its stands the 300 m cells where the bright beds lie bare, its first pitch, exported with the sites; data only (the
  tents are a settlement plan's). Lee drifts were bound from the first pass (`ATMOS.snowCover({lee: .45})`, `89a`). Left by the defaults:
  `kits/resources` (no node: the teal bed is a clay, section 9); nomad camps in Nomad Country (no station there).
- [x] **The wet wall's broadleaves in spring** (2026-11-11, second pass). The maple's kin row takes ebadlands' summer green (`colour.leaf`,
  70); the oak was green already. They do not turn in autumn on this page.
- [ ] **The painted names.** The canyon, the playas, the hogbacks and the four sites have English working names only (section 9, defaults).

## Notes

- **The pages carry their packs inline** (`matlib_pack.fragment(..., own=True)`, as highrift's): about 5.5 MB a page, the packs the same in
  each. Korona's sidecar packs (`write_sidecar`) would share them, if the page cap ever asks.
- **The fins' beds** are the ground's (`STRATA_SH.inject` on a Standard material, `86-host-stacks.js`): a fin standing on the clay below the
  contact shows the clay's bands at its foot and the sandstone above, as the stack puts them. A first pass on Lambert drew them black.
- **The stones and fallen blocks** take only their instance colour (the solid material without vertex colours: their geometry has none; with
  vertex colours on they drew black).
- **KCARVE's extra attributes** (`84-host-ground.js`, the alcoves' hoods): a one-component attribute's `fn` must still return an array (`[0]`); KCARVE reads `v[0]`, and a bare number gave NaN and black hoods. Not a core change (every caller passes arrays today).
