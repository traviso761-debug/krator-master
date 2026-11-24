# settlements/xanadu-lake: known issues

- **`stone.ghat.wet` is owed** (`core/materials/PROMPTS-NEEDED.md` section 69; 59 on the Xanadu plans branch). The landing stair's wet steps, its weed line
  and the washing slabs (`xa_ghat`, `kits/xanadu/extra/88k-xa-landing.js`) are the library's `stone.cut` (the kit's `vStone`)
  darkened to 55 %, a stand-in until the set lands; then the wet steps take it (a slot in `kits/xanadu/materials.json`).
- **The shore is sand, not the plan's shingle.** Māuṭh's plan proposed `shingle` at the landing; the region's coast field
  reads `sand` there (`tools/fit_lake_town.py`, `XL.FIT.mouth.coast`), and the plan says to keep the region's.
- **Malbari's river is outside its footprint.** The Qol Siṭrīm reaches the lake 2 km west of the pin, past R: the river's
  quarter (the reeling houses, the watermills) and the road's (the han, the market) stand on the town's west edge toward it
  (`layout.side`), the watermills without a race drawn, and the Qol bridge (`xa_river_span`) is not placed (it wants the
  town's own stream). The rearing houses are the kit's workshop (no rearing house in the kit).
- **Qōqō's drying floors are the kit's farm yard** (`xa_farm`, 56 x 44 m) up the slope, as its plan says; the cacao groves and
  Malbari's mulberry are the kit's orchard plots over the benches' fields.
- **Hāibh's honey houses are the kit's workshop** on the beach, its apiaries in rows on the benches behind the bench houses.
- **Nēṭ's two landings** (one each side of its point) are one: the landing stair and the quay on its south side.
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
- **How the ground meets the region's** (`tools/fit_lake_town.py`, step L2's rules after the re-cut made the coast more jagged).
  The page's waterline is a smoothed line along the town's own waterfront (`world.smooth`: 40 m at Ōlḍ-Thalaba, 35 m at Nēṭ,
  60 m at Ḍāiyar, 70 m at Malbari, else 120 m) and the region's own beyond it (the rest applied in full along the shore there);
  the rest is a 40 m grid in the page's own (x, z) (not in depth from the shore: a bend would shear it), applied in full from
  50 m inside the footprint's edge; the region's hollows not joined to the lake
  are filled 0.3 m over the level. Beyond the waterfront the 40 m rest can close off the mouth of one of the region's narrow
  inlets: slivers of at most 12 cells of 10 m are allowed there (none in the town's waterfront). The town's beach is less
  straight than a quay front would make it: the beach's works are fitted to it piece by piece (`xlBeachFit`).
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
- **The quarters' margins are found by re-running the plan.** A quarter short of its households after a run takes more blocks
  (the rest quarter short: the others take fewer) and the plan runs again, at most four times, the least short run kept.
- **The week** (step L5, 2026-11-23: `targets/town/89zn-xl-days.js`). `?day=N` (else 122, Phēr's default) is the clock's first
  day: on the town's market day the second stall row stands and the round's barge lies at the quay; on a fair day a loop town's
  first launch is away. The day is the page's day plus the clock's (`90q` xlDayTick, every frame), the same day the people's sim
  counts, so past midnight the stalls, the boats and the people turn over together. **Proposed** (the tune leaves them to the page): a round leaves its hub on weekday 0 and calls a town a day in its order;
  Phēr's rounds call on the days between its fairs.
- **The market boats and the fair's launches are not drawn on their courses.** The round's barge is at the quay on the market
  day and nowhere on the others; the fair's launch is gone on the fair's days. Their runs on the lake (`T.rounds`, `T.loops`) are
  the regions' to draw (`openworld/xanadu-north-shore`, `xanadu-lake-shore`), with the sim's transport records.
- **The people are placeholder figures** (a robe and a head, coloured by role: `90t-xl-life.js`, as Thalaba's), not
  `core/charactermodels`' lake Xanadui. Every resident is an actor (`89zu-xl-people.js`): the houses x 5.5 and the governor's
  eight; the crews the tune's (`xan-tune.js` lakeTown: fishers half the crew where the town fishes, the terraces two fifths), a
  keeper a stall, four priests. **Proposed**: the works' hands where the tune names no good for the town (eight a works
  building: Māuṭh, Nēṭ and the rest), the schedules, a fifth of a loop town's households at the fair on its days, the market
  square's crowd (a quarter of the town at once). The fishers out on the lake are hidden at the landing (their dugouts are the
  drawn ones out fishing, not tied to them); nobody rides a boat.
- **The trades' rooms** (step L5, 2026-11-23). `?interiors=1` plans and furnishes every building the kit's interior sets
  cover, as Phēr's, and now the lake's own: the governor's house and its office wing, the dye store, the loom hall, the saffron
  house's sorting floor, the honey house and the net loft's laying-up room (`kits/xanadu/extra/69dy-ix-lake-works.js`, the set
  `xanadu-lake-works`), and the tea factory's floor (`kits/xanadu/src/87k1-xa-lake-rooms.js`, now on this page). Their rooms are
  the planner's from a programme, not drawn rooms of a plan. Left open or solid on purpose (the set's skips): the kiln yard's
  wheel shed, the reeling house, the mat shed, the sulfur works' melting shed, the quarry's tool hut; the saffron loft and the net
  loft's loft are open to the air. `69dy` joins `kits/interiors/sets/xanadu.js` with the all-builds rebuild (TODO.md).
- **The biome core is Xanadu's older copy** (as Phēr's: `settlements/pher/KNOWN_ISSUES.md`): `31b-core-leafset.js` is read
  from core into `gen/` at every build; its MINSET finding (`34-core-impostor.js`) and the `_registered` clash with core/host's
  probe are baselined in `tools/check_assembly_baseline.json`, as Phēr's are.
- **Hoṭ-Bāṭh's core is narrower than the others'** (2026-11-23; held from step L3 until then). The region's shore 800 m west of
  its landing has an inlet about 50 m wide. The finer rest grid the hold asked for was not the cure (at 20 m and at 10 m the
  page's waterline there stayed 68 and 72 m off the region's): the inlet stood inside the core's fade (core.x 620, fade 300),
  where the page keeps its own profile. Its core is now 520 m with a 200 m fade (the waterfront is 500 m), so at x -800 the
  ground is the region's own and the shore within 50 m (`test-xl-site.js`). The fit tool takes a town's own grid
  (`world.gs`, `world.resStep`; 25 and 40 m by default) should a narrower feature need it; no town sets one.
- **The south-east round's footprints are larger where the pin stands far inland.** Pāṭari's pin is 1.9 km above its landing
  (R 3000 m), Hoṭ-Bāṭh's 1.4 km (R 2400 m), Ālph-Hēḍ's on a point (R 2100 m): the footprint is round the pin, so it has to reach
  the whole town. Their band rings lose the points over the lake, so `test-xl-site.js` asks a third of the 144, not 100.
- **The shipwrights' pieces stand out into the lake** (`XL.WATER_KEYS`: Boṭ-Yārḍ's slipways and dry dock, Ālph-Hēḍ's barge
  slips), as the boat sheds do: the beach between the water and the shore road is too narrow for a 32 m slipway.
- **Every south-east landing reads `sand`** in the region's coast field, where the plans proposed shelf or shingle; the specs
  keep the plans' word, the ground is the region's.
- **Boṭ-Yārḍ's timber yard is a new opt-in piece** (`kits/xanadu/extra/88i-xa-timber-yard.js`, `xa_timber_yard`); Pāṭari needs
  no clay pit of its own (88g's kiln yard has its pit and sherd heap).
- **The west round's owed pieces** (step L4, 2026-11-23): Siṭāq's stack (a landform record, from the scale-model queue) and
  Qorī's cut quarry face (a `core/terrain` carve) are not drawn; Lōṭas's reed beds (a `core/mask` bed in the shallows) and its
  walled lotus ponds (`xa_fishponds`, whose seat on the water the plan has not set) are not either: its mat sheds stand up the
  slope, not at the shallows' edge. Phīsh-Mārkiṭ's temple and caravanserai stand by the landing (too deep for its contour
  blocks where the shore bends), its harbour warehouses are the kit's ordinary warehouse.
- **The orchards' crops are named trees**: Gārḍan's `citron` (its plan's citrus gardens), Ōrcharḍ's `pomegranate` (kits/crops'
  fruit trees the Vale grows by rain), on the kit's orchard plot (fruit).
- **The west shore faces north-east**: Ōrcharḍ's, Lōṭas's, Phīsh-Mārkiṭ's and Siṭāq's bearings are 45 degrees (the fits read
  47-60); Lōṭas's pin is 1.7 km and Siṭāq's 1.3 km above their landings (R 2600, 2200).
- **One refit stales every town's bake.** `core/world/bake_towns.py` hashes the whole fit file (`89zm-xl-fit.js`) into each
  lake town's sources, so refitting one town marks all nineteen stale though their own rows are unchanged: re-bake them all
  and rebuild both lake regions after any refit (`bake_towns.py <key> --check` says which). Owed: hash each town's own row.
- **GPU.** The page was first verified on SwiftShader in a cloud session with no GPU lane; the `KRATOR_GL=gpu` run is owed (the north shore's seven by the master session; the south-east round's six from step L3).
