# kits/xanadu: known issues

## Defs past their lot

The footprint rule (`README.md`, "Footprints"): everything a def draws stays inside its `w x d`. Every garden and water piece
does since 2026-11-10 (`tests/test-footprints.js` fails if one leaves it). The defs below did not when the check was written;
the test lists them in `KNOWN` with these overhangs, fails if one grows by more than its 0.25 m tolerance, and says when one is
back inside (take it off both lists then). Measured headless in `XAK` (no Vale biome: the kit's own crowns, fitted to the lot),
the worst of up to five variants, townsfolk left out; "past" is metres beyond the lot line, then the kit items that reach
furthest.

What reaches over, by kind:
- **pennant lines** (`vRope`, `xnPennants`): strung from a roof to a post set outside the lot (`S.w/2+4`, `W/2+7`, the
  temple's and the Ortaköy mosque's lines to the quay): the housing, the shops, the smithy, the farmhouse, the temples, the
  monastery, the guilds. The fix is the post inside the lot (or the line to the house's own corner), house by house;
- **retaining and landform masses** (`xBatS92`, `xEarthB`): the hillside quarter's terraces (16 m), the amphitheatre's bank,
  the prison's cliff, the barracks' wall: the lot is smaller than the ground the piece stands on;
- **yards and works spilling over**: the shops' stalls and barrels, the dairy's pots and posts, the watermill's race and
  tail water, the windmill's sails (`vPost`, `vWood`), the mine's and the ice cave's boulders, the quay's mooring cones;
- **the barge** (`xa_barge`, lot 36 x 14): its lot is turned 90 degrees to the hull (the hull runs along z, 29.6 m, in a
  14 m depth): the def's `w` and `d` want swapping, which moves Erewhon's placement of it;
- **held** (the citadel, other sessions' work): `xa_pleasure_dome_bay`;
- the `_palopo` defs repeat their base def's builder in the Palopó paint.

| Def | Family | Lot | Box (worst variant) | Past (m) | Furthest |
|---|---|---|---|---|---|
| `xa_poor_a` | Housing — poor | 18 x 16 | x -4.41..9.68, z -3.80..8.42 (v0) | 0.68 | vRope 0.68, vStone 0.40 |
| `xa_mid_a` | Housing — middle | 14 x 14 | x -7.36..6.50, z -4.60..5.86 (v3) | 0.36 | vRope 0.36 |
| `xa_mid_b` | Housing — middle | 19 x 19 | x -8.65..15.80, z -7.65..8.71 (v0) | 6.30 | vRope 6.30 |
| `xa_mid_c` | Housing — middle | 19 x 16 | x -10.25..6.51, z -5.00..6.92 (v0) | 0.75 | vRope 0.75 |
| `xa_rich_a` | Housing — rich | 26 x 30 | x -11.25..11.25, z -6.95..17.90 (v0) | 2.90 | vStone 2.90, xGold 2.76, vFlag 2.46, xConeL 1.30 |
| `xa_rich_c` | Housing — rich | 32 x 18 | x -8.56..19.10, z -6.71..7.75 (v0) | 3.10 | xTilesB 3.10, xWashB 2.95, vStone 2.00, vFlag 1.96 |
| `xa_shops` | Trade | 22 x 16 | x -14.10..23.32, z -4.28..6.00 (v3) | 12.32 | vRope 12.32, vHoop 3.18, vBarrel 3.13, vClayPot 3.10 |
| `xa_smithy` | Trade | 20 x 16 | x -12.02..10.07, z -6.67..9.37 (v4) | 2.02 | vRope 2.02 |
| `xa_farmhouse` | Farms and mills | 30 x 26 | x -12.38..17.63, z -10.38..14.72 (v1) | 2.63 | vRope 2.63 |
| `xa_windmill` | Farms and mills | 20 x 20 | x -11.57..11.57, z -8.07..8.07 (v4) | 1.57 | vPost 1.57, vWood 1.54 |
| `xa_dairy` | Farms and mills | 10 x 7 | x -4.30..5.76, z -3.10..3.94 (v0) | 0.76 | vClayPot 0.76, vPost 0.66, vWood 0.62 |
| `xa_watermill` | Farms and mills | 20 x 30 | x -7.56..6.18, z -20.00..11.00 (v0) | 5.00 | vStone 5.00, xWaterB 5.00 |
| `xa_temple` | Sacred | 34 x 32 | x -20.82..20.82, z -7.75..19.68 (v2) | 3.82 | vRope 3.82 |
| `xa_monastery` | Sacred | 50 x 50 | x -26.69..26.69, z -21.82..23.47 (v0) | 1.69 | vRope 1.69 |
| `xa_grand_temple` | Sacred | 60 x 64 | x -26.00..26.00, z -24.00..34.11 (v0) | 2.11 | vStone 2.11, xDomeW 1.78, xWashB 1.48, xPaint 0.79 |
| `xa_guild_mine` | Guilds | 34 x 30 | x -9.55..14.23, z -16.32..9.70 (v2) | 1.32 | xBoulder 1.32 |
| `xa_guild_alch` | Guilds | 30 x 22 | x -16.70..13.63, z -5.70..9.75 (v0) | 1.70 | xDomeM 1.70, xFriezeB 1.70, xOctS 1.53, vStone 1.35 |
| `xa_guild_mason` | Guilds | 34 x 28 | x -9.80..20.03, z -5.80..14.53 (v0) | 3.03 | vRope 3.03 |
| `xa_generator` | Guilds | 36 x 24 | x -12.24..19.70, z -7.98..9.48 (v0) | 1.70 | vRope 1.70 |
| `xa_barracks` | Military | 36 x 34 | x -14.40..14.40, z -21.30..16.20 (v2) | 4.30 | xBatD96 4.30, xBatW92 4.00, xPaint 3.39, vWood 2.95 |
| `xa_wall` | Military | 28 x 14 | x -14.52..12.06, z -3.52..3.52 (v1) | 0.52 | xDrumS 0.52, vStone 0.51 |
| `xa_gate` | Military | 38 x 26 | x -17.55..17.80, z -4.17..14.50 (v0) | 1.50 | vStone 1.50, vFlag 1.46 |
| `xa_arena` | Public | 58 x 64 | x -25.22..25.22, z -25.22..34.80 (v0) | 2.80 | vStone 2.80, vFlag 2.76 |
| `xa_amphitheatre` | Public | 58 x 46 | x -26.00..26.00, z -29.00..12.14 (v0) | 6.00 | xBatS92 6.00, vStone 5.87, xEarthB 5.73, xConeL 3.30 |
| `xa_hillside` | Hillside | 50 x 44 | x -23.00..23.00, z -38.00..20.50 (v0) | 16.00 | xBatS92 16.00, vStone 15.69, xEarthB 15.46, xBatD96 2.60 |
| `xa_temple_ortakoy` | Sacred | 60 x 44 | x -29.00..48.00, z -18.82..29.45 (v0) | 18.00 | vRope 18.00, xWaterB 7.45 |
| `xa_house_turk_a` | Housing — middle | 22 x 20 | x -9.20..9.20, z -7.05..10.79 (v0) | 0.79 | vDoorLeaf 0.79, vStone 0.70 |
| `xa_shop_turk_b` | Trade | 20 x 18 | x -6.75..9.25, z -6.25..9.28 (v0) | 0.28 | vRope 0.28 |
| `xa_barge` | The Sultan | 36 x 14 | x -7.27..7.27, z -14.80..14.80 (v0) | 7.80 | xConeG 7.80, xBulbG 6.56, xGoldB 4.10, xPaint 4.00 |
| `xa_quay` | Dockyard | 34 x 16 | x -16.20..16.20, z -3.70..9.53 (v2) | 1.53 | xConeP 1.53, xPaint 0.77, vWood 0.45 |
| `xa_prison` | Military | 40 x 30 | x -20.00..20.00, z -18.00..6.00 (v0) | 3.00 | xBatS92 3.00 |
| `xa_ice_cave` | Sacred | 30 x 32 | x -13.72..14.23, z -12.72..17.37 (v0) | 1.37 | xBoulder 1.37 |
| `xa_pleasure_dome_bay` | The Sultan | 76 x 90 | x -32.80..32.22, z -28.25..51.27 (v0) | 6.27 | vWood 6.27, xConeG 4.56, xArmG 2.89, xHipG 2.75 |
| `xa_poor_a_palopo` | Palopó paint | 18 x 16 | x -4.41..9.68, z -3.80..8.42 (v0) | 0.68 | vRope 0.68, vStone 0.40 |
| `xa_mid_a_palopo` | Palopó paint | 14 x 14 | x -7.36..6.50, z -4.60..5.86 (v3) | 0.36 | vRope 0.36 |
| `xa_mid_b_palopo` | Palopó paint | 19 x 19 | x -8.65..15.80, z -7.65..8.71 (v0) | 6.30 | vRope 6.30 |
| `xa_mid_c_palopo` | Palopó paint | 19 x 16 | x -10.25..6.51, z -5.00..6.92 (v0) | 0.75 | vRope 0.75 |
| `xa_rich_a_palopo` | Palopó paint | 26 x 30 | x -11.25..11.25, z -6.95..17.90 (v0) | 2.90 | vStone 2.90, xGold 2.76, vFlag 2.46, xConeL 1.30 |
| `xa_rich_c_palopo` | Palopó paint | 32 x 18 | x -8.56..19.10, z -6.71..7.75 (v0) | 3.10 | xTilesB 3.10, xWashB 2.95, vStone 2.00, vFlag 1.96 |
| `xa_shops_palopo` | Palopó paint | 22 x 16 | x -14.10..23.32, z -4.28..6.00 (v3) | 12.32 | vRope 12.32, vHoop 3.18, vBarrel 3.13, vClayPot 3.10 |
| `xa_temple_palopo` | Palopó paint | 34 x 32 | x -20.82..20.82, z -7.75..19.68 (v2) | 3.82 | vRope 3.82 |
| `xa_house_turk_a_palopo` | Palopó paint | 22 x 20 | x -9.20..9.20, z -7.05..10.79 (v0) | 0.79 | vDoorLeaf 0.79, vStone 0.70 |
| `xa_shop_turk_b_palopo` | Palopó paint | 20 x 18 | x -6.75..9.25, z -6.25..9.28 (v0) | 0.28 | vRope 0.28 |

`xa_lighthouse` throws in `XAK` (`FRAME_HOOKS`, the lamp's turn hook, is a page global the sheet and Erewhon carry): the test
skips it (`BUILD_FAILS`); measured on the page it is unchecked.
