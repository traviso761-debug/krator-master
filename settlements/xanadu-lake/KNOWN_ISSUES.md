# settlements/xanadu-lake: known issues

- **`stone.ghat.wet` is owed** (`core/materials/PROMPTS-NEEDED.md` section 59). The landing stair's wet steps, its weed line
  and the washing slabs (`xa_ghat`, `kits/xanadu/extra/88h-xa-landing.js`) are the library's `stone.cut` (the kit's `vStone`)
  darkened to 55 %, a stand-in until the set lands; then the wet steps take it (a slot in `kits/xanadu/materials.json`).
- **The shore is sand, not the plan's shingle.** Māuṭh's plan proposed `shingle` at the landing; the region's coast field
  reads `sand` there (`tools/fit_lake_town.py`, `XL.FIT.mouth.coast`), and the plan says to keep the region's.
- **The stream is the page's own.** The scale model has no stream within 8 km of Māuṭh (`mouth/PLAN.md` open point 1):
  the page draws one (`xlStream`), and the world takes it as a river of the town's own, joined to no model river
  (`core/world/bake_towns.py`, `join: null`). A records-only stream for the scale-model queue only if the owner asks.
- **The town's ground is the profile inside its core.** Inside the core (`layout.core`: |x| < 700 m, from 180 m out in the
  lake to 760 m inland) the ground is the fitted profile across the shore, with its benches and the stream: the region's
  own relief there (up to 15 m) is let go; outside it the region's rest fades back in over 300 m, so the footprint's edge
  and the band are the world's (the node test: within 6 m).
- **The quarters are filled to the tune's households, then trimmed.** Each quarter takes blocks until their free ground
  holds its share with a margin (`XL.DENSITY`, `XL.MARGIN`), core/city's frontage-courts fills them, and the houses
  farthest from the landing are let go (`died`) until each quarter holds its share. The wealth comes out near the spec's
  (the node test: within .12 a class), not on it: the rich houses (26-32 m) find fewer plots.
- **No market boat runs and no fair launches.** The boats are moored, drawn up or fishing; the north-east round's barge and
  the fair's east loop (`T.rounds`, `T.loops`) are not drawn on their courses yet.
- **The towns' rooms are not planned.** The page takes the furniture bundle and the interiors core as Phēr's does, but the
  lake towns' trades' rooms (`87k1-xa-lake-rooms.js`) and the governor's house's are step L5's.
- **The biome core is Xanadu's older copy** (as Phēr's: `settlements/pher/KNOWN_ISSUES.md`): `31b-core-leafset.js` is read
  from core into `gen/` at every build; its MINSET finding (`34-core-impostor.js`) and the `_registered` clash with core/host's
  probe are baselined in `tools/check_assembly_baseline.json`, as Phēr's are.
- **GPU.** The page was first verified on SwiftShader in a cloud session with no GPU lane; the `KRATOR_GL=gpu` run is owed.
