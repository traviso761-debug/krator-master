# kits/catalog — known issues

`verify.py --assert` passes with nothing deferred: its `ALLOW` list is empty.
What follows is reported as WARN lines, or is a limit of what the checks cover.

## Open

- [ ] **Literal colours (SPEC "Colour").** All 84 furniture pieces use literal hex colours (668 literals), and 28 build
  literal colour arrays for `F.pick`: voth_bench, voth_street_brazier, voth_ferry, voth_market_stall,
  voth_forge_station, voth_still_cluster, voth_loom_display, voth_craft_tanner, iziz_banner, iziz_market_stall,
  br_market_stall, br_shopfront_display, br_tavern_bar, br_storehouse_goods, br_loom_frame, br_shrine_altar,
  br_roost_fittings, br_drying_rack, br_fruit_stack, yuni_common_floor_seating, yuni_court_mosaic_divan,
  yuni_order_shelf_run, yuni_order_pupil_desk, yuni_order_writing_board, yuni_order_mat_rack, yuni_order_bookcase,
  yuni_order_reading_table, ancients_rubble_pile. Fixing it needs a shared furniture palette with named keys
  (per culture), which does not exist yet. Do it when the pieces move into `kits/furniture/src/`, one culture at a time.
- [ ] **Bare engine helpers.** 82 of 84 pieces call `shade(...)` and `TAU` as globals. Neither is a host global the
  SPEC forbids (`kput`, `BOX`, `FAMMAT`, `MAT`: zero uses), but a host that does not define them breaks the piece.
  The frame now carries `F.shade` and `F.TAU`; switch to them when porting.
- [ ] **`voth_lantern_fixture` variant 2 is a wall bracket** (lantern on an arm, 1.35–2.05 m up) under a piece whose
  `anchor` is `floor`. `anchor` is per entry, so split it into its own key with `anchor: 'wall'`.
- [ ] **Building type tags.** Buildings use `family` as their type (`housing civic religious industrial defensive
  trade guild`). The repo README's building vocabulary (civic, market/shop, tavern/inn, industry, farm,
  single-family dwelling, multi-family dwelling, infrastructure, religious, funerary) allows several tags per
  building; `family` is one string. Add a `types: [...]` array when the buildings move to a building kit.
- [ ] **No polygon tool.** The README DEV TOOLS ask for one in every build; the sheet has the click inspector and the
  hover inspector, not the polygon tool.

## Limits of the checks

- **Seeds.** Plants and some furniture (rubble, crates, fruit) scatter parts with `F.rr`, so their size depends on
  the seed. `--assert` audits seeds 1–4 of every variant. The declarations were set from seeds 1–16 (rounded up
  to 0.05 m for furniture, 0.1 m for plants and buildings), so a seed past 16 can still poke a few centimetres out.
- **Plants sink.** A plant may go up to 10 % of its height below ground (root flare, bole blob); everything else
  gets the normal tolerance, max(0.05 m, 4 %).
- **Wall and ceiling anchors** are checked for presence, not geometry: the audit does not prove that a `wall` piece's
  back is its flat side, or that a `ceiling` piece reads right hung from its top.
- **`materials` is checked against what the piece builds with** (every material family it uses must map to a
  declared canonical name), over the audited seeds. `CATALOG_MATERIALS` is local to the catalog until the
  registry planned in `core/README.md` exists.

## Fixed in the verify pass (2026-10)

These were corrected here and NOT synced back to the builds they were harvested from (Voth, Iziz, Yuni, Mav's
Refuge, Girder). The catalog copy is now the more accurate one.

- **Off-centre pieces** now call `F.shift(-cx, -cz)` so the footprint centre is the origin:
  ancients_aa_battery, yuni_ancient_socket_rack (both variants, different offsets), yuni_salvage_hearth_hood,
  yuni_order_mat_rack (variant 2), voth_craft_fisher, voth_craft_miner, voth_guild_banners, voth_lantern_fixture
  (variant 2), voth_loom_display, voth_sacrifice_altar, voth_strider_station, iziz_banner (0.92 m: the pole was the
  origin), br_market_stall, br_roost_fittings, br_shopfront_display, br_storehouse_goods; buildings
  voth_bldg_customs_house, voth_bldg_guild_hall (variant 1), voth_bldg_townhouse (variant 4),
  voth_bldg_monastery_hall (8.2 m), br_bldg_room_front (per variant), br_bldg_girder_palisade.
- **Declared sizes raised to what the piece builds:** ancients_light_strip_ring, ancients_rubble_pile, br_fruit_stack,
  br_roost_fittings, br_shrine_altar (v1 h), br_storehouse_goods, br_well, voth_craft_tanner, voth_lantern_fixture
  (v2 h), br_bldg_nature_shrine, br_bldg_room_front, and 34 plants (mostly trees whose crowns and leans spread past
  the declared crown: iziz_palm, yuni_olive_valley, the beast-rider hypertrees, the Voth park exotics, succulents).
- **ancients_rubble_pile** no longer sinks below ground: blobs are lifted by half their height, and the propped slabs
  rest on a corner instead of burying it.
