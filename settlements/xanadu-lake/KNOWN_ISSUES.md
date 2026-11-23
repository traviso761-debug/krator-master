# settlements/xanadu-lake: known issues

- **`stone.ghat.wet` is owed** (`core/materials/PROMPTS-NEEDED.md` section 59). The landing stair's wet steps, its weed line
  and the washing slabs (`xa_ghat`, `kits/xanadu/extra/88h-xa-landing.js`) are the library's `stone.cut` (the kit's `vStone`)
  darkened to 55 %, a stand-in until the set lands; then the wet steps take it (a slot in `kits/xanadu/materials.json`).
- **The shore is sand, not the plan's shingle.** Māuṭh's plan proposed `shingle` at the landing; the region's coast field
  reads `sand` there (`tools/fit_lake_town.py`, `XL.FIT.mouth.coast`), and the plan says to keep the region's.
- **Ōlḍ-Thalaba and Ḍāiyar have no stream** (the model has none within 8 km of either; their plans name none): their records
  in the world carry no river.
- **The ruins are the kit's ruin pieces, not the kit's houses stripped.** Ōlḍ-Thalaba's 331 empty houses are `xa_ruin_s/m/l`
  (roofless shells the size of the small, middling and large houses: broken walls, rubble, a fallen lintel) and its caravan
  market `xa_serai_ruin` (40 m, smaller than `xa_caravanserai`); a ruined state of each house def is not drawn (the plan's
  proposal). The stripped walls' texture `wall.limewash.scorched` is owed: the ruins wear the kit's rubble stone and earth
  render. Every ruin chunk is watched by core/ruins.
- **Ḍāiyar's dye plants are the Vale's, not the plan's names.** Its plan names indigo, madder and safflower; kits/crops grows
  none of those three by rain in the Vale (indigo is the hyperjungle's), so its benches take what the Vale grows by rain:
  cave madder, broom, rabbitbrush (a seeded pick a field). The dye works' ground texture `ground.dyeworks` is owed (section
  58); the works draw on the beach's sand.
- **The stream is the page's own.** The scale model has no stream within 8 km of Māuṭh (`mouth/PLAN.md` open point 1):
  the page draws one (`xlStream`), and the world takes it as a river of the town's own, joined to no model river
  (`core/world/bake_towns.py`, `join: null`). A records-only stream for the scale-model queue only if the owner asks.
- **The town's ground is the profile inside its core.** Inside the core (`layout.core`: |x| < 700 m, from 180 m out in the
  lake to 760 m inland) the ground is the fitted profile across the shore, with its benches and the stream: the region's
  own relief there (up to 15 m) is let go; outside it the region's rest fades back in over 300 m, so the footprint's edge
  and the band are the world's (the node test: within 1.5 % of the band, 9 m: the world eases a difference at R across the
  band, so that adds at most a 1.5 % grade). Ḍāiyar's shore is jagged (the coast's coves, about ±40 m every 100 m) and its
  fit takes a tighter line (`world.smooth` 60 m), so its waterfront is less straight than Māuṭh's.
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
