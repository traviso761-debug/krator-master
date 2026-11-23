# settlements/opal-ford: known issues

## Owed (2026-11-23, step OF1)

- **The Iridescent Order's house** (the owner, 2026-11-23): its precinct at the fall's foot is kept clear; its blueprint and records
  are step OF1b (PLAN.md section 2b).
- **The hub is Kirstabal** (`XAN_TUNE.opalford.hub`, `road.ks-opalford`, 85 km) until Gihon's tune record lands from
  `claude/gihon-6258a4`: then the hub and the road go to Gihon, 30 km down the river, as the plan has it. The han is the stage of
  `road.lw-ks`, which passes the ford; the tune does not stop that road here.
- **The ford's toll** is not in the tune yet (a road `cut` on `road.lw-ks` at the ford, as the Strongbow lift's): proposed, for the
  sim session.
- **No ford piece**: the paved causeway and its stepping stones are boxes drawn from the plan's record (`OF_WORKS.ford`); `xa_ford`
  for `kits/xanadu/extra/` is owed (PLAN.md section 3). The same for the fish weirs (stakes) and the mill's weir; the kit's
  `xa_fish_racks` is opt-in (87k) and not taken.
- **No ferry raft** for the high water: the kit has none.
- **The river is a ribbon** at its water's height with a standard material, not core/water's flow (`WATER.flow`, `WATER.fall`): no
  current, no foam but the fall's white ribbon. Core/water's river and fall come with step OF2 on the region (the plan's core
  adoption table names it).
- **The paddies are painted**, level basins on the flats without their own water surface; `ground.paddy.wet` is owed
  (`core/materials/PROMPTS-NEEDED.md` section 60). The crop (`vale-rice`, `kits/crops`) is not read.
- **The cataract is drawn as one fall** of 20 m with rapids above and below (the model's 265 m to -155 m over about 40 km).
- **Entry flights**: the toll house and the Tears' post stand on the riser (6 %); a door on the downhill face may stand over the
  ground in front of it (Phēr's flights are not taken).
