# kits/catalog — known issues

`verify.py --assert` passes with nothing deferred: its `ALLOW` list is empty. The style rules (no host globals,
`F.shade`/`F.TAU`, no literal colours) are assertions now, not warnings.

## Open

- [ ] **Hykkousoi has a palette and no pieces** (`krator-master-furniture-hykkousoi.js`): the culture is in
  progress and its sets are deliberately not built yet. The file says what to add.
- [ ] **The sheet is heavy.** 853 furniture pieces, 1129 instances and about 33 000 draw calls on the `all`
  sheet; `verify.py --assert` takes about 15 minutes under SwiftShader and a screenshot of the whole sheet
  several minutes each. Partial runs are cheap: `?cultures=xanadu,voth` (verify.py `--query cultures=...`)
  lays out only those cultures, and `--rows xanadu,court` screenshots only the rows named. The full page
  on a real GPU is fine; a gallery visitor on a weak machine should open a `?cultures=` page.
- [ ] **Painted hangings are one texture per key.** `F.decal` paints a canvas once per key (culture,
  symbol, variant, size, colours) and caches the material, so a thousand tapestries cost a few dozen
  canvases; a host that replaces `FPAL` colours after a piece was built keeps the old painting until
  the page reloads. The paint functions draw from their own seeded stream, never the piece's.
- [ ] **Under-size warnings** (a piece built more than 30 % smaller than declared on an axis) are expected for
  wall art, tapestries and racks: their declared depth leaves room for a skull or a hanging cloak to be swapped
  in by the second variant, so the first often builds shallower. The sheet has about 145 such WARN lines, none
  a failure.
- [ ] **Kit pieces are not in the static checks' block list.** `verify.py` reads literal `FURN({` blocks for the
  SPEC source rules; pieces `FK.set()` registers are checked in the page instead (build, size, anchor, palette:
  an unknown key throws) and the kit and culture files are scanned whole for literal colours
  (`style-colour-kit`).

- **The sheet is split into pages by setting** (indoor, outdoor, both; 2026-10). With the kit harvests the catalog
  has about 2200 instances and the one-page sheet no longer loaded in 20 minutes under SwiftShader (each third
  loads in 1.5–5 minutes). `verify.py --assert` loads each page in turn; `?page=all` still exists for a partial run.
- **Rugs and Jobs pages** (2026-10, owner's call): rugs (`type: 'rug'`) and work items (a jobs-file entry's `job`, a
  culture's FK trade pieces) left the setting pages for pages of their own; `verify.py` asserts every piece is on
  exactly one page (`page-coverage`). Decisions: a work item goes to Jobs before a rug goes to Rugs (the winnowing mat
  is `type: 'tool'`, not a rug); the trade pieces carry no `job` (their row is per culture, `Jobs · trade · <culture>`);
  giving each FK trade role a job (forge, anvil: smithing; vat: brewing or dyeing ...) would let them join the job rows.
- **The jobs file's pieces keep their culture's palette** (`eastabyss`, `yuni-common`): its PALETTE block gives every
  key its pieces name as a DEFAULT (`Object.assign({ ...keys }, FPAL[c])`), so the culture's own file wins for a key
  both define, in either load order, and a bundle of `'jobs'` alone still builds (checked in node: 10 pieces, 14
  variants). The copies of eastabyss keys there (`rustDeep ... fishPale`) only matter without the eastabyss file.
- **Harvest shortcuts in the jobs pieces:** the lying drums are `F.rod`s (8 sides: they read as octagons; the kit's
  were round) and carry the standing drum's two rolling hoops (the kit's lying drum had none); the fuel station's back
  cradle bearer stood 0.6 m behind the drums' ends in the kit and is under them here; the warehouse bales gained two
  cords; the fish tray is a rimmed tray (the kit drew a solid plank box) with a `with the catch` variant; the salt heap is
  a smooth dome (the kit's 7-sided blob was faceted). The tent rug draws the kit's `paintcol` texture in slabs: the
  motifs are squares, diamonds and discs, not the texture's knots and spirals, and it gained a border.
- **Left out of the Jobs pass:** the Locus `prop_drum_stack` (the asset IS the stack) and the other Locus leftovers
  (`settlements/locus/LOCUS-KIT-KNOWN-ISSUES.md`: the coiled-net stand, the gnomon, the fuel pumps, the battery boxes,
  the bracket lamps).
- **Gaps the kit harvests worked around** (no engine change made): no torus (tyres, hoops, wheels are rings of
  rods or beams), no tilted cone or box (`F.box` turns about y only: tilted slabs are `F.beam`), `F.rod` has 8
  sides (horizontal rounds read as octagons), no disc facing z, no gable roof (two `F.beam` slabs). No FURN type
  for carts and vehicles (`tool`, `stall` or `stack`), platforms and daises (`seating`), a rostrum (`desk`), a
  perch (`rack`), a training dummy (`workstation` or `tool`), punishment furniture (`pen`). No water family
  (water is `glass` with a `water` key). The `gold` family renders very dark, so gilt reads darker than the kits'.
- **Near-duplicates across harvests:** `hl_rus_cloth_stall` and `hl_rep_market_stall` (both Highlands `hnStall`),
  `hl_rep_lamp_standard` and `iziz_vern_lamp_post` (both `vnLampPost`, different heights). Kept; merge if wanted.
- **Harvested pieces are heavier than the kits' own** (a Mav's lamppost was 50–200 triangles, `br_lamppost` is
  about 400): builds that now place catalog furniture budget it on its own line. A low-detail variant for
  box-heavy pieces (`KF.setDetail` only thins round primitives) is the follow-up.
- **`F.furn` takes the height from the caller**: it does not apply the piece's anchor (`furnAnchorY`).

## Decisions in the interiors furniture pass (2026-10)

- **Plants, the Voth buildings and the Beast Rider buildings left the sheet** (owner's call). The files stay;
  `build.py` no longer lists them. The Voth catalog page (`settlements/voth/catalog`) still loads
  `krator-master-buildings-voth.js` by path and is unaffected. The catalog is the furniture sheet.
- **One row per culture and tier** on the furniture sheet, so a culture's poor, common and court pieces read
  side by side.
- **The engine's `F.cyl` is vertical only.** A disc that faces a wall (a plate, a shield, a medallion) is a
  short `F.rod` along z: `FK.disc()`. Early kit drafts turned cylinders with `ry` and got vertical discs
  poking through the wall; the anchor audit caught all of them.
- **Emblems are the socket packs' own.** The first hangings drew each culture's device in blocks and the
  Republic's triskele came out as a spiral; the packs' canvas `SYMBOLS` moved to `core/sockets/38-symbols.js`
  (out of the Post-Apoc building-fragment number range 4x-7x) and the catalog vendors and paints them.
- **`kits/interiors` gained a wealth band and the `art` type**; its walker smoothing now runs on the rounded
  route points (a layout from the new sets exposed a sub-millimetre mismatch between smoothing and the audit).

## Limits of the checks

- **Seeds.** Plants and some furniture (rubble, crates, fruit) scatter parts with `F.rr`, so their size depends on
  the seed. `--assert` audits seeds 1–4 of every variant. The declarations were set from seeds 1–16 (rounded up
  to 0.05 m for furniture, 0.1 m for plants and buildings), so a seed past 16 can still poke a few centimetres out.
- **Plants sink.** A plant may go up to 10 % of its height below ground (root flare, bole blob); everything else
  gets the normal tolerance, max(0.05 m, 4 %).
- **Anchor geometry** (`ANCHOR_AUDIT` in `verify.py`) is a bounding test, not a fit test. A `wall` piece must have
  nothing more than 2 cm behind `z = -d/2`, and the vertices within max(6 cm, 8 % of d) of that plane must span
  30 % of w and 25 % of h (or touch the plane at the top: a leaning ladder). A `ceiling` piece must reach within
  3 cm of `y = h`; a `surface` piece's lowest point must be within 2 cm of `y = 0`. It does not prove that the back
  is a flat face or that the piece looks right hung. `floor` pieces are not audited beyond the declared box.
- **Palette keys** are checked against the piece's culture's `FPAL` from the source text (`F.col('k')`,
  `F.shade('k', ..)`, `F.cols([...])`, `F.pick([...])`) and by building (an unknown key in `F.col` throws). A key
  held in a variable and passed to `F.pick` is only caught by building it.
- **`materials` is checked against what the piece builds with** (every material family it uses must map to a
  declared canonical name), over the audited seeds. `CATALOG_MATERIALS` is local to the catalog until the
  registry planned in `core/README.md` exists.
- **Building `types`** are checked for presence and vocabulary (`BUILDING_TYPES`), not for being right.

## Fixed in the interiors pass (2026-10)

- **Literal colours.** Every furniture piece names its colours as palette keys: `FPAL[culture]` in the engine,
  `F.col` / `F.cols` / `F.pick([...keys])` / `F.shade(key, amt)`. The palettes were generated from the 897
  literals by nearest-colour clustering per culture (RGB distance <= 16, <= 20 for greys), named role + colour
  (`timberOak`, `clothMadder`, `stoneClay`, `brass`, `ember`); before/after renders of all 130 original instances
  differ by 0.02/255 on average (worst 0.4/255). `verify.py` asserts 0 literals.
- **Bare helpers.** Every piece uses `F.shade` / `F.TAU`; asserted.
- **`voth_lantern_fixture` variant 2** is now `voth_lantern_bracket` (`anchor: 'wall'`). The fixture declares one
  variant; `variant: 1` and `variantDims[1]` still build and size the bracket for old callers.
- **Building type tags.** Every `ASSET` carries `types: [...]` from `BUILDING_TYPES` (README vocabulary, Yuni's
  slugs); `family` stays. Asserted.
- **Polygon tool** on the sheet (`src/93-polygon.js`, P).
- **Anchor geometry audit** added; it failed and these were fixed: ancients_light_strip_ring (drop rods and
  ceiling roses up to y = h), yuni_ancient_cell_wall (back 4 cm behind the plane), yuni_ancient_glass_console
  (back panel), yuni_order_mat_rack (moved back onto the plane), br_weapon_rack (plank back board). Re-anchored
  to `floor`, being free-standing: yuni_salvage_hearth_hood (tripod hood), yuni_order_writing_board (A-frame
  easel), voth_guild_banners (posts on plinths).
- **Ground plane subdivided** (engine): one 8 km quad interpolated depth badly in SwiftShader and hid anything
  within ~3 cm of the ground (labels, rugs, mats) a few metres from the origin.

## Fixed in the verify pass (2026-10)

These were corrected here. The size corrections were synced back to Yuni only (7 plants,
yuni_ancient_socket_rack and yuni_order_mat_rack, measured on Yuni's own geometry); Voth, Iziz, Mav's Refuge and
Girder carry no size declarations, so there is nothing there to sync. The catalog copy is the more accurate one.

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

## Open (2026-10-01): not addressed
- [ ] Yuni's interiors pass (settlements/yuni, 64-interiors) added six furniture pieces (`poor_lidded_basket`,
      `poor_food_pot`, `poor_sleeping_mat`, `common_grain_bin`, `poor_reed_mat`, `common_kilim`) and replaced the
      `storage` type with `container-item` / `container-food` plus `capacity`. The harvested Yuni set in
      `krator-master-furniture.js` predates both. Re-harvest Yuni. See settlements/yuni/KNOWN_ISSUES.md.
