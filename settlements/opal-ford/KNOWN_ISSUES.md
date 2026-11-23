# settlements/opal-ford: known issues

## Owed

- **The house's two pieces live on this page** (`src/89q8-of-order-pieces.js`: `of_cell_range`, `of_college_range` and its `_m`
  and `_s` lengths, on the Qiblai kit's contract): they move into `kits/qiblai/src/89q3-qb-sacred.js` with the all-builds rebuild
  (TODO.md, "Ride along"), where every page that takes the kit gains them. The service court's refectory is still the Xanadu
  kit's guild hall.
- **The house's interiors** from the blueprint's sheets are not wired (`?interiors=1` furnishes the kit's own rooms; FURNITURE.md's
  NEW pieces are owed to the catalog).
- **The hub is Kirstabal** (`XAN_TUNE.opalford.hub`, `road.ks-opalford`, 85 km) until Gihon's tune record lands from
  `claude/gihon-6258a4`: then the hub and the road go to Gihon ('xan.gihon'), 58 km down the river (Integration 2 re-points it at
  the merge). The han is the stage of `road.lw-ks`, which passes the ford; the tune does not stop that road here.
- **The ford's toll** is not in the tune yet (a road `cut` on `road.lw-ks` at the ford, as the Strongbow lift's): proposed, for the
  sim session.
- **The fish weirs and the mill's weir** are boxes drawn from the plan's records (stakes, a stone wall); the kit's `xa_fish_racks`
  is opt-in (87k) and not taken.
- **The ferry raft is moored, not running**: it is a vessel on the page's registry (`of-ferry`), but no rope is drawn across the
  river and the tune has no ferry route (the ford carries `road.lw-ks` all year).
- **The river is a ribbon** at its water's height with a standard material, not core/water's flow (`WATER.flow`, `WATER.fall`): no
  current, no foam but the fall's white ribbon. Core/water's river and fall come with step OF2 on the region (the plan's core
  adoption table names it).
- **The paddies are painted**, level basins on the flats without their own water surface; `ground.paddy.wet` is owed
  (`core/materials/PROMPTS-NEEDED.md` section 60). The crop (`vale-rice`, `kits/crops`) is not read.
- **The cataract is drawn as one fall** of 20 m with rapids above and below (the model's 265 m to -155 m over about 40 km).

## Done (2026-11-23, the owner: "work on known issues/kit issues")

- The cells and the house of studies on their own pieces (`of_cell_range` on each terrace; four `of_college_range` ranges round
  the debate court, the gate between the two south-west ones), in place of the kora arcades and the lodges.
- The Spray Stair: a flight down each riser between the graded platforms, from the Bow Terrace (now reaching u 172, its landing)
  to the pool's ledge, each a strip in core/walk; the node test holds each flight's ends to its platforms.
- The paved ford is the kit's piece (`kits/xanadu/extra/88j-xa-crossing.js`, `xa_ford`, class infrastructure) and the ferry raft
  (`xa_ferry_raft`, class vessel: a ferry, pole-pushed, a raft hull, crew 2) is moored below it, afloat (the node test).
- Entry flights (Phēr's pattern): every door whose sill stands over its ground gets its steps.
