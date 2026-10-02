# Ys — handoff from the phase 2 fan-out (Oct 1 2026)

> **Done (Oct 1 2026).** The merge below is finished: `--assert` green on kit, mock and city, the Citadel written,
> the mock houses off the sheet, the agents' helper reports fixed or recorded. See NOTES.md "Phase 2 merge" and
> KNOWN_ISSUES.md. Kept for the record of who built what.

Ten of the eleven phase 2 agents (AGENT-BRIEF.md) were stopped twice by the session's rate limit before they could
commit or report; only agent I finished. Their fragments were copied from the worktrees into `src/` as they stood and
committed here so a fresh session can finish the merge without re-running the agents. **The three targets build and pass
syntax with all 58 fragments, and the merged kit sheet (92 defs, 21 rows, 7 hosts, 291 presets, error panel clean)
passes ten of the eleven invariants.** What `verify.py dist/kit.html --assert` reports on it:

- FAIL `spots-fit-their-rooms`, 4 spots: the Conch stair house's hearth and table overlap each other; the Scallop
  court's food and seat spots fall outside their room (agent A's `70-hyk-housing.js`; A's last note said the conch
  house's curved chamber is narrower than its room polygon).
- OVER `per-type-triangle-budget`: the sheet's Scallop Stack hosts (`skyB/1`, 7 of them, 543 k triangles against the
  250 k medium budget). The hosts are the kit's, not an agent's; the sheet grew from 1 host to 7 at the merge. Either
  class the hosts as `landmark` on the sheet or thin the kit's decay for them.

None of the ten fragments has been looked at by anyone but its agent, and none of the
ten agents' final look-rounds happened. Read this, then AGENT-BRIEF.md (the rules every fragment follows), then PLAN.md P2 (the merge) and P3. For P3
onward read GODOT.md first: main's Godot port plan (Oct 2) changes how the city is placed, what is exported and
what is no longer worth doing in three.js.

## What each agent left

| agent | fragment(s) | defs | state when stopped |
|---|---|---|---|
| A housing | `70-hyk-housing.js` | 15 | all 15 defs build; every invariant passes but spots-fit-their-rooms on the conch house's hall (its curved chamber is narrower than the room polygon says). Was looking at the three rich eye-level shots. |
| B shops | `71-hyk-shops.js` | 21 | 21 defs build, probe green; was reading the twelve front shots of two look-runs. Nothing committed. |
| C hospitality, sacred, markets | `72-hyk-hospitality.js`, `73-hyk-sacred.js`, `79-hyk-markets.js` | 13 | 13 defs build; was waiting on its third look-run (r3) before the final room/spot tally and the commit. |
| D Amphitriton, Citadel | `74a-hyk-amphitriton.js` | 1 | the Amphitriton builds and passes (202 k triangles, landmark class recognised, 50 spots fit); was taking its shots. `74b-hyk-citadel.js` (the Citadel) was not started. |
| E Tides, Winds, Pharos | `74c-hyk-tides.js`, `74d-hyk-winds.js`, `74e-hyk-pharos.js` | 3 | all three build; was waiting on the Pharos render, then interior close-ups of both halls and a Winds satellite door. |
| F spans, harbour | `65-hyk-spans.js`, `75-hyk-harbour.js` | 18 | 18 defs build; probe fully green on the whole sheet (24 volumes, 22 buildings with doors, 47 spots); was taking its six shots. |
| F2 industry | `76-hyk-industry.js` | 8 | 8 defs build; was waiting on the smithy close-ups (awning cloth, forge front) before committing. Seeds shifted +2 at the merge (30762–30790) to clear the harbour's block. |
| G military, agriculture | `77-hyk-military.js`, `78-hyk-agri.js` | 6 | all six pieces build, probe green, error panel clean; was looking at the agriculture shots. Files were staged, not committed. |
| H library, treasury, cells | `74f-hyk-civic-minor.js` | 3 | all three (Library, Treasury, Wet Cells) are written and pass syntax on all three targets; only the Library had been probed, and no shots of any were looked at. |
| I furniture | `66-hyk-furniture.js` | 14 | DONE and reported: 14 pieces, all inside their boxes, sheet row green. Its bug report produced the frame fixes in commit 978cfea. |

## Def keys per fragment (for the sheet rows and the city placer)

- `70-hyk-housing.js`: hyk_house_poor_1, hyk_house_poor_2, hyk_house_poor_3, hyk_house_mid_1, hyk_house_mid_2, hyk_house_mid_3, hyk_house_rich_1, hyk_house_rich_2, hyk_house_rich_3, hyk_pod_poor_1, hyk_pod_poor_2, hyk_pod_mid_1, hyk_pod_mid_2, hyk_pod_rich_1, hyk_pod_rich_2
- `71-hyk-shops.js`: hyk_shop_armour, hyk_shop_weapon, hyk_shop_alchemy, hyk_shop_food, hyk_shop_general, hyk_shop_chandler, hyk_shop_pearl, hyk_shop_salt, hyk_shop_cloth, hyk_shop_potter, hyk_fishmonger, hyk_pod_shop_armour, hyk_pod_shop_weapon, hyk_pod_shop_alchemy, hyk_pod_shop_food, hyk_pod_shop_general, hyk_pod_shop_chandler, hyk_pod_shop_pearl, hyk_pod_shop_salt, hyk_pod_shop_cloth, hyk_pod_shop_potter
- `72-hyk-hospitality.js`: hyk_tavern_1, hyk_pod_tavern_1, hyk_pod_tavern_2, hyk_inn, hyk_caravanserai
- `73-hyk-sacred.js`: hyk_shrine_tides, hyk_shrine_seagods, hyk_pod_shrine_tides, hyk_pod_shrine_seagods
- `79-hyk-markets.js`: hyk_market_main, hyk_market_plaza, hyk_market_nbhd_1, hyk_market_nbhd_2
- `74a-hyk-amphitriton.js`: hyk_amphitriton
- `74c-hyk-tides.js`: hyk_temple_tides
- `74d-hyk-winds.js`: hyk_temple_winds
- `74e-hyk-pharos.js`: hyk_pharos_crown
- `65-hyk-spans.js`: hyk_span_l1, hyk_span_l2, hyk_drawbridge, hyk_spiral_stair, hyk_ladder, hyk_lilypad, hyk_walkway, hyk_pontoon
- `75-hyk-harbour.js`: hyk_quay, hyk_pier, hyk_wet_landing, hyk_boat_shed, hyk_boom_chain, hyk_ship_shed_military, hyk_hexareme_berth, hyk_navigators_guild, hyk_pearlmongers_guild, hyk_aquaculture_pen
- `76-hyk-industry.js`: hyk_warehouse_large, hyk_warehouse_small, hyk_smithy_large, hyk_smithy_small, hyk_shipwright, hyk_granary, hyk_windmill, hyk_generator
- `77-hyk-military.js`: hyk_barracks, hyk_ballista, hyk_muster
- `78-hyk-agri.js`: hyk_farm_field, hyk_farmhouse_1, hyk_farmhouse_2
- `74f-hyk-civic-minor.js`: hyk_library, hyk_treasury, hyk_wet_cells
- `66-hyk-furniture.js`: hykkousoi_shell_cradle_bed, hykkousoi_nacre_chest, hykkousoi_oyster_larder, hykkousoi_net_rack, hykkousoi_pearl_table, hykkousoi_shell_stool, hykkousoi_jar_lamp, hykkousoi_sea_chest, hykkousoi_tide_niche, hykkousoi_fish_rack, hykkousoi_hearth_basin, hykkousoi_cushion_ring, hykkousoi_chart_table, hykkousoi_scroll_rack

## To finish the merge (PLAN P2, in this order)

1. `python3 verify.py dist/kit.html --assert` on the whole sheet. Fix what fails in the fragment that owns it.
2. Shots of every row (`'<row> — row'` presets) and every piece's front; look at them, fix what reads wrong. This is
   the round the agents never got to. Budget it: one look-run per row, not per piece.
3. Agent A's known failure: the conch house hall spots. Agent D's Citadel (`74b-hyk-citadel.js`) is unwritten, not
   broken: write it to the brief (DESIGN §4) or move it to P3.
4. Remove `targets/kit/86-kit-mock-houses.js` once the housing row covers the three mock houses (check first whether
   the sheet's hosts take their way-in pod from `mock_grown_pod`; if so, point them at a housing def before removing).
5. `python3 ../../tools/make_index.py` (from the repo root), then NOTES.md and KNOWN_ISSUES.md: every agent was told
   to log what it found; those notes died with the agents, so skim each fragment's header comment for them.
6. Commit per fragment or per agent, not one blob, so the history says who built what.

## Frame changes the ten fragments were not written against

Commit 978cfea changed `35-furn-frame.js` after the agents started: the primitive kdefs are made from the end of
`60-hyk-mat.js` (they used to resolve their materials too early and crash the bake), `F.light`'s bracket is in the
piece's frame, `placeFurn` stands the builder's frame down round the build, `F.lathe` and `F.tube` take the full option
set. Only agent I's fragment uses F; the building fragments use `hykLight(...,{bracket})` directly, which did not change.
The same commit moved the city paint to `targets/city/87c-city-paint.js` and added the stacks and the river; none of
it touches the kit sheet.

## Cost note

The fan-out spent roughly 3.4 M tokens across the eleven agents before the limit stopped them, most of it on
look-rounds (headless renders sharing one CPU, each agent waiting on its own shots). A fresh session finishing the merge
should read one fragment at a time, take one sheet of shots per row, and not resume the dead agents: their context is
gone and everything they produced is in `src/`.
