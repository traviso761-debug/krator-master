# settlements/opal-ford: known issues

## Owed

- **The house's two pieces live on this page** (`src/89q8-of-order-pieces.js`: `of_cell_range`, `of_college_range` and its `_m`
  and `_s` lengths, on the Qiblai kit's contract): they move into `kits/qiblai/src/89q3-qb-sacred.js` with the all-builds rebuild
  (TODO.md, "Ride along"), where every page that takes the kit gains them (Qiblai's and Lightwall's pages rebuilt then).
- **The house's interiors follow the kit's planner, not the blueprint's rooms**: each building's rooms are laid by
  kits/interiors' planBuilding from its programme (`90s`: the cells a row of cells, the college ranges halls, a library and
  dormitories, the monastery's ranges the monks' quarters), not the room plans of `iridescent/BLUEPRINT.md`'s sheets; the Hall of
  the Bow and the Gallery of the Bow have no interior of their own (the kit's great monastery draws its hall's), and FURNITURE.md's
  NEW pieces (the prism stand, the moonglass screen, the colour-chart rack, the lens-grinding wheel, the Order's banner) are owed
  to the catalog.
- **Economy** (left for the sim session; the owner, 2026-11-23: "except economy"): the hub is Gihon (re-pointed at the
  integration merge, 2026-11-23: `XAN_TUNE.opalford.hub` 'xan.gihon', `road.gihon-opalford`, about 65 km); the ford's toll (a road `cut` on `road.lw-ks`); a
  ferry route for the raft in the high water.
- **The paddies' ground texture**: the basins hold their water now (90w), but their floor is the painted ground; `ground.paddy.wet`
  is owed (`core/materials/PROMPTS-NEEDED.md` section 60). The crop (`vale-rice`, `kits/crops`) is not read.
- **The fish weirs and the mill's weir** are boxes drawn from the plan's records (stakes, a stone wall): the kit has no weir piece.
- **The cataract** is two falls (20 m and 8 m) with rapids between and above, on the page's ground; the model's whole descent
  (265 m to -155 m over about 40 km) is the region's, at step OF2.

## Done (2026-11-23)

The owner: "work on known issues/kit issues"; "make sure the ferry is wired in as a vessel"; "Work on owed issues except economy".
- The cells and the house of studies on their own pieces (`of_cell_range` on each terrace; four `of_college_range` ranges round
  the debate court); the refectory a college range too.
- The Spray Stair (a flight down each riser between the platforms, the Bow Terrace reaching u 172 for its landing; core/walk
  strips) and entry flights on the outside doors that stand over their ground (5).
- The paved ford (`kits/xanadu/extra/88j-xa-crossing.js` `xa_ford`, class infrastructure) and the ferry raft (`xa_ferry_raft`,
  class vessel: a ferry, pole-pushed, a raft hull, crew 2; `of-ferry`), moored afloat below it on its rope between two posts.
- The river on core/water (`90w`): three flows (below the bow's fall, between the falls, above) and two falls, the skylight in the
  water; CPU twins checked (`of-river`); 90q's ribbon only beyond the near ground. The cataract's upper fall (8 m) and its gorge.
- The paddies' still water (one mesh over the 129 basins).
- The fish racks and smokehouses (`kits/xanadu/src/87k`, opt-in) by the fish weirs.
- The house's interiors (`90s`, Grēṭ-Āil's host): every building with a storey planned, furnished and walked into on demand
  (`of-interiors`).
