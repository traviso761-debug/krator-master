# Mav's Refuge — known issues
build.py prints every unticked item on each build. Claude: when Travis asks for changes to this world,
remind him of this list first. Tick `[x]` and date an item when it is fixed.

- [ ] (2026-10-05) Tree tints (60-trees.js, same change as Girder): roots take the trunk's tint at their height above the ground, limbs/boughs/twigs the trunk's tint where they leave it.
      Built, not run (`verify.py` not called) and not looked at.
- [ ] (2026-10-05) 84-flyers.js has the optional dragonfly-wing hook (`FLYTEX = { wing }` before the fragment) but Mav's Refuge has no material-library machinery
      (no materials.json, no KMAT, no tex/), so nothing sets it and the wings stay vertex-coloured. Adopting the library here is the larger job.
- [ ] (2026-10-05) This copy of 84-flyers.js and Girder's differ by about 9 KB (Girder has the roost traffic); the model block and FlyGeo are shared. Any
      model or UV change has to be made in both.
- [x] Flyers: wingtips clip the gallery posts on landing (84-flyers; Girder's version lands on the beam outside the post line — port it)
  2026-10-01: ported. Roosts are centred between two gallery posts (30-layout); the landing lips are longer (main 3.0-3.6 m, hangar 3.6-4.2, satellite 2.2; 56-levels stores Ro.lipL); quetzals/archaeopteryx/dragonflies touch down on the lip ~2.5-3 m outside the post line, fold first, then walk in, and walk back out to the lip end to launch. Bats still fly in to hang from the ceiling, with shallow beats on the last 16 m (as Girder).
- [x] Flyers: circuit flyers never land (fixed in Girder's 84-flyers with peel-off timers — port it)
  2026-10-01: ported flyPursue / flyTryPeel / flyJoinRoute. Each circuit flyer gets a lap timer (Rookery circuits 150-420 s, patrols 260-700 s), then peels off onto a fresh arrival route (Rookery flyers home to the Rookery when it has room); perched beasts launch straight onto a short-handed circuit to refill it (one per circuit at night). Formations dissolve as flyers rotate, as in Girder.
- [x] Flyers: bats return mostly at dawn (fixed in Girder with sim-time hunt timers — port it)
  2026-10-01: ported. A bat launched in the evening or at night is owed a return 90-540 sim seconds later (flyBatDue); those still out at daybreak follow within ~2 minutes. The hour weights no longer favour bat arrivals at dawn. _flyers.batReturnHours / batsOut report it.
- [x] Flyers: rider lance stays on the saddle when the rider dismounts
  2026-10-01: the lance bone is parented to the rider's translate bone instead of the saddle, so it goes with him when he stands beside the beast and is hidden with him when only the saddle is left (same one-line fix made in Girder's copy of the model).
- [ ] Gates: carved facades stand up to ~1.5 m proud where the bark relief dips (56-levels vs 60-trees)
- [ ] Jungle pass is ~2x its triangle budget (905k) — trim if frame rate suffers (62-jungle)
- [x] Rainbow bark is too loud (Girder desaturates bark2 by 30% at runtime in 60-trees — port it)
  2026-10-01: ported: the bark2 colour texture is pulled 30 % toward its luminance at load, and the far Prism gum trunks' palette tints 45 %.
- [x] Night at 21:00 is too bright under the gas giant (21-sky / 82-daynight)
  2026-10-01: night floors cut (hemi 0.30 -> 0.07, ambient 0.22 -> 0.035, planetshine fill 0.15/0.08 -> 0.07/0.03) and the night fill turned cool blue-grey instead of a dimmed day colour (82-daynight); the giant's key 0.44 -> 0.18 x phase (21-sky); a full giant now cuts the lamps by 8 % instead of 28 %, so lamps, windows and fires are the main light. An eclipse keeps its own fill (DN_ECL_*) so it still reads as twilight. 21:00 lights: hemi 0.53 -> ~0.17, ambient 0.38 -> ~0.09, key 0.45 -> ~0.19. Same code in both builds.
- [x] verify.py --sweep is meaningless (merged meshes have city-wide bounding boxes) — fixed Oct 2026: it samples the flyers' legs against the REGISTER volumes, trunkR trunks, bridge segments and the ground, with two control legs that must hit (61 legs clear)

## Level of detail (core/lod)

The page takes the shared LOD from `core/lod/` (read `core/lod/README.md`): `build.py` adds `09-lod.js` and
`97-lod-auto.js` to the fragment list, and 97 applies it to the finished scene. Big merged meshes are cut into chunks
that switch to clustered proxies with distance and are drawn combined (one draw per level in view); instanced sets keep
one draw call, drop their smallest instances by screen size and switch detailed shapes to a simplified version far off.
The originals stay the raycast targets, so the inspector and `_api` see full detail (checked: the inspector names the
same thing at nine screen points per view with LOD on and off). The panel (`l`, `measure`) reads draw calls and
triangles; `LOD.enabled=false` or `?lod=0` puts back the exact scene. `verify.py --assert` passes with LOD on.

Left out by default: the life layer (`userData.life`) and the flyers (`userData.flyers`, interleaved instance data).

Measured 2026-10-01, 1000x640, SwiftShader (`LOD.flush()` then `LOD.measure()`: one render of the main scene, so
calls and triangles as three.js counts them; sky passes not included):

| View | LOD off: calls / triangles | LOD on: calls / triangles |
|---|---|---|
| Opening | 57 / 4.08 M | 66 / 3.50 M |
| Overview | 57 / 4.08 M | 57 / 2.83 M |
| Forest floor | 57 / 4.08 M | 65 / 3.59 M |

LOD adds up to 9 draw calls (simplified far versions of the canopy sets and the levels of the split meshes); verify's
opening view reads 66, inside the budget.

- [ ] Furniture triangles: the page now draws 4.98 M triangles (world 3.70 M + catalog furniture 1.28 M in 17 meshes,
  10,980 pieces). `BUDGET.triangles` guards the world without the furniture; the furniture has its own line,
  `BUDGET.furnitureTriangles` (1.47 M). The catalog pieces are heavier than the boxes Mav drew (tris each at
  setDetail .5, Mav's own drawing in brackets): br_fruit_stack 932 (~350), br_market_stall 680 (~210), br_well 552
  (~130), br_loom_frame 436, br_weapon_rack 424 (~85), br_lamppost 398 (~70), br_table 304 (~28), br_bench 256 (~26).
  By count the biggest totals are br_bench 791 x 256, br_lamppost 423 x 398, br_market_stall 164 x 680, the 2103
  hanging lanterns x 52, br_weapon_rack 192 x 424. Follow-up (kits/catalog): a low-detail variant, or a setDetail
  that also thins box-heavy pieces.
- [ ] Furniture look gaps (kits/catalog): the framed lantern (br_h_hanging_lantern v1) has no cool variant, so the
  Silk Loft's and the shrines' lanterns lost their blue-green core (their light is still cool); br_lamppost is one
  2.4 m post (LAMPPOST's h 2.6-4.2 is no longer honoured, the flame sits at 2.14 m); single barrels and crates are
  br_h_water_butt v0 / br_h_crate_stack v1 at one size (the old s scale is gone), so a few stacked ones overlap;
  the catalog frame's +x is the FRM frame's left, so asymmetric harvested pieces stand mirrored (the smithy forge
  is turned to keep its bellows' side).
- [ ] Still drawn as geometry though arguably furniture: the shop counters along the shopfronts (a curved built-in
  counter, no catalog piece; their goods are br_h_stall_goods), the shared kitchens' hearth and hood (built into the
  core wall), washing lines between gallery posts (lvlWashing) and the hut-side lines' posts, the hoists' hanging
  loads, the carpenter's half-built frame and leaning poles, the ropewalk trestles and ropes, the cooper's hoop,
  the potter's clay block, the weavers' hanging cloths, the scaffold's flag, the signal tower's drum and horn.
- [ ] To do (future, owner's call): the spiders, the spider nests' egg sacs and cocoons, and the other flyers go to a
  fauna kit, not the furniture catalog (`biomes/README.md` "To do: a fauna kit"). Not started.
- [x] Interiors (?interiors=1): only 3 deck lots were furnished (the beast-rider set's fixed rectangles fit few of Mav's sectors).
  2026-10-05: replaced by 57-interiors.js (API.md, Interiors). Every walled deck lot, apartment, workshop, storehouse,
  bough-platform lodging and hut (1764 units) is planned from its builder's own shell by the interiors kit's planner
  and furnished from the catalog near the camera: homes with a living room and bedroom (a bed, food and a chest each,
  the kit's residence rule), workshops as live/work (the family's rooms behind the trade floor), stores with the
  clerk's office, shops with the family upstairs or behind, inns with guest rooms, barracks with dormitories, stairs to
  upper floors. ON by default (?interiors=0 off). verify.py --assert: `interiors-coherent` (every 12th unit) and the
  `interiorTriangles` budget line. Residents' homes (78-life) are now dwellings only.
- [x] Interiors at night: the catalog's lamps and hearths inside were not in the night light volume.
  2026-10-05: every record's lights go into its window channel (from the bake before the volume is baked, `nlvAddIx`
  after), and the nearest 8 light their rooms per fragment, kept to their storey (`NL_POOL`, 45-kit; 57c `mixLights`).
- [x] Interiors: the windows were painted panes on solid walls. 2026-10-05: real openings, cut through both faces of the
  levels' fronts, the lots' walls (with a plastered lining) and the huts', with a reveal; the pane over one is glass;
  the openings are the planned rooms' windows. The data is apart from the drawing: records, the bake
  (`bake_interiors.py`, `interiors-bake.json`), idle fill, edits overlay (API.md, Interiors).
- [ ] Interiors: no walker goes inside (life agents stop at the door nodes) and there is no first-person walk. The records
  are ready for it: `MIX.slots(i)` gives each home's beds, hearth, table and chest as activity slots.
- [ ] Interiors: painted panels beyond the 4 commonest designs in view are drawn flat in the design's mean colour (a draw
  call each would cost ten or more in a busy hold). The interior light pool is per fragment but not occluded: a lamp
  lights the neighbouring room through a partition (within its 5.5 m radius) though never the storey above or below.
- [ ] The spaces that keep what their builders drew (assessed 2026-10-05; none started). **Address these, and the walkers
  going inside (above), when the simulation layer comes to Mav's Refuge** (`core/simulation/PLAN.md`, Phase 3, item 3a):
  - **Shared kitchens** (~1 in 8 apartment-level rooms, `R.use='kitchen'`): an open-fronted common room with a hearth
    built into the core wall, a table, benches and a shelf block. Every apartment now has its own hearth (the kit's
    `living` room requires one), which makes the shared kitchen redundant, and open fires in timber flats sit oddly
    with it. Decide which: (a) the levels cook communally: give apartments a `living` programme without a hearth
    (a brazier or none) and plan the kitchen as `kitchen` + `hall` with the built hearth as a fixture, and the
    simulation's COOK/EAT for that level's homes points at it; or (b) drop the shared kitchens. (a) suits the lore.
  - **Spider nests** (the Silk Loft's web levels, `lvlWebRoom`): webbed walls, egg sacs, cocoons, floor funnels. Needs
    the husbandry around the spiders: a handler's station per level, silk reeling (feeding the silk houses and the
    weavers' loft), an egg-sac nursery kept warm, a prey store, the handlers' bunks. Waits on the owner's call on a fauna
    kit (above), since the sacs, cocoons and funnels would move there; the human-side rooms could be planned now as
    `workshop` + `store` + `dormitory` with the web as fixtures.
  - **Shrines** (23 open nature pavilions on the decks): a sapling or a standing stone, two lanterns, a lamppost. Needs
    an offering table or altar before the heart, mats or low benches, a keeper's store for incense and offerings, and a
    keeper (a role in the simulation, WORSHIP slots). The interiors set's 9-post shrine ring does not fit the 12-17 m
    sector pavilion; plan the pavilion floor as one `shrine` room with its posts and the heart as fixtures, as Girder
    does (56-interiors.js, the tower shrines).
  - **The council chamber** (the annular hall round the trunk on P_CC): 44 council seats facing the trunk, two rings of
    carved posts, 8 lamps, four portals with braziers. It is furnished as a hall but has no rooms: a council needs a
    dais or speaker's place at the trunk, an antechamber or petitioners' bench at each portal, a records room, a
    guard post and the stair head from the Crown. The planner cannot take an annulus: plan it as four quarter-sector
    bodies between the portals (the seats as fixtures), or give the interiors kit a ring footprint.
  - **The market** (109 stalls in five rings on the Crown, crates, barrels, cisterns, lampposts): open-air stalls, no
    interiors needed. What is missing is coherence with the rest: each stall's goods by trade (the workshops' products,
    the gatherers' fruit), the stock in the storehouses next to it, porters between them, opening hours (shuttered at
    night), and each stall as a simulation place with SELL slots (the catalog's `stall` job already maps to SELL).

Catalog verify pass (2026-10): kits/catalog recentred `br_market_stall` (and other harvested pieces) on their
footprint and raised some sizes. Mav's Refuge now places these pieces (53-furnish.js) and undoes the recentring
shift of the ones it places (`BRF_SHIFT`), so they stand where the old helpers drew; the raised sizes are the
catalog's.
