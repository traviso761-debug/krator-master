# Building geometry that blocks or bends the interiors

The interiors pass read every builder of the Highlands, Post-Apoc, Beast Rider, Locus and Abyss sets
and planned rooms inside what each one draws. Nothing in a kit's geometry was changed. This is the
list for the kits' author: where the geometry **precludes** logical rooms (the building is skipped or a
part of it is left out), and where the plan **assumes** something the builder does not draw. Each
item's `skip` or `note` in `sets/<set>.js` says the same in place.

## 1. Geometry that precludes rooms

| Set | Key | Problem | What would make a room possible |
|---|---|---|---|
| abyss | `abyss_house_poor` v0 (drum house) | a horizontal drum (r 1.35 m, 5.4 m long) with nothing decking its inside: a 1.8 m chord at the door sill, no flat floor | a plank deck inside the drum at the door sill (about 2.4 m wide at 0.45 m above the bottom) |
| abyss | `abyss_house_rich` v0 (cone shell over terraces) | three stepped plank discs inside a cone shell open in a 7.5 m arch: open terraces, nothing enclosed wider than a 2 m ring; the two tin-mirror side cones have no door | a door into each side cone, or walls round the lowest terrace |
| abyss | `abyss_temple` | the four corner towers are rubble drums under cones with no door | a door in each tower (the precinct itself is open by design) |
| abyss | `abyss_shop_weapons` v1 (container smithy) | the 6.1 m container's side is "hinged up as an awning", but the box under the awning is drawn solid and no door is cut: the container is closed (only the forge under the sail is planned, `#1`) | a dark opening (or the wall left out) on the container's +z side under the awning |
| abyss | `abyss_shop_food` v1 (drum kitchen) | the kitchen is a horizontal drum (r 1.5, 6 m) with no floor and no door; the dining deck is open air (`#1` skipped) | a door in the drum and a plank floor at its sill |
| abyss | `abyss_farmhouse` v1 (drum-and-reed farm) | the home is a horizontal drum (r 1.4, 6 m) entered at its +x end 0.4 m above the bottom, with nothing decking its inside (a 2.0 m chord at the sill); the strip behind the reed wall is a 2 m porch (`#1` skipped) | a plank deck inside the drum at the door sill |
| beast-rider | `br_bldg_gateway_tree_facade` | the trunk is a solid frustum with a carved portal and a door leaf on its face; nothing is hollow, though the variants name a room behind the portal (storehouse, vault, shrine, dorm) | carve the trunk: a room about 4.5 m in radius behind the portal |
| beast-rider | `br_bldg_girder_palisade` | the watch tower is a 1.8 m open post tower whose only floors are ladder landings | a boxed platform room at 9 m, if it should hold sentries |
| highlands | `hl_rep_gate` | the gate chamber over the arch has no door and no stair; the flanking towers are solid | a stair in one flanking tower and a door into the chamber |
| highlands | `hl_tri_scrap_forge` | the container behind the trading shelter has no door drawn | a door in the container's front |
| highlands | `hl_rep_pens`, `hl_rus_pens` | the pigsty hut (1.7 m) and pig hut (1.3 m) are too low for a person | none needed if they are only animal huts |
| post-apoc | `compound` | the guard cabin over the gate has windows on all four walls and no doorway; its ladders end on the open walkway | a door from the walkway into the cabin |
| iziz | `vern_alchemist` | the lab tower is a solid stone drum with no door (its glass lantern is not a floor); the still-house's open half is filled by the stills and the bench, its back half a solid plaster block with no door | a door from the house into the tower and floors in it; a door into the still-house's back half |
| iziz | `vern_caravanserai` | the room over the gate (windows front and back) has no stair and no door | a stair in one gate pier and a door into the room |
| iziz | `vern_governor_palace` | the front pavilion's third storey under the dome and the flag tower rise above the roof with windows but no stair | a stair up from the upper storey (the pavilion's top room, the tower) |
| iziz | `vern_palisade_gate` | the two log towers are 2.0 m closets (1.6 m inside) with a door at the foot | none needed if they are guard closets |

## 2. Rooms planned on an assumption the builder does not draw

| Set | Key | Assumption |
|---|---|---|
| post-apoc | `dw-tank` | the builder draws no floor inside the lying tank: the plan lays one at the door sill (1.3 m), giving a 3.06 m wide floor with 1.85 m headroom at the walls. The kit should add a floor (`collFloor`) there |
| post-apoc | `dw-bus`, `shop-weapon` | the `bus()` core is 1.55 m clear inside (floor 0.8, roof 2.35) and its door 1.5 m high: lower than a person |
| post-apoc | `shop-weapon` | the bus has no `door()`: the plan enters by the core's rear emergency door (1.4 m high) |
| post-apoc | `lg-twinsilo` | no stair between the silos' two floors, and none up to their balconies: each floor is planned with its own door |
| post-apoc | `chief` | no stair to the upper side decks: the plan puts an inside stair in the hall |
| post-apoc | `lg-stack`, `lg-bulkhead`, `lg-tanktower`, `farmhouse` | upper storeys are reached by outside stairs, so each storey is its own body with its door on its landing |
| beast-rider | `br_bldg_girder_dwelling` v2 | the 8.0 m counter leaves 0.32 m at each end of an 8.64 m interior; the plan assumes a 0.8 m pass at the right end. Shorten the counter by about 0.5 m |
| abyss | `abyss_palace` | the two back pavilions have no door: the plan assumes one at the middle lattice screen |
| abyss | `abyss_tavern` v1 | the raised back deck (H 4.2) leaves about 1.9 m clear over the main deck between its piles (2.7 m apart), so the space under it is not planned; the builder's bar there has a pile standing in its counter (x -4.1, z -6.0), and the kitchen drum (r 1.0) rises 0.15 m through the raised deck (a fixture in `#1`'s upper room) |
| abyss | `abyss_shop_general` v1, `abyss_shop_sailmaker` v1 | two-storey cabins with no stair drawn (the general store's upper floor shows windows and a balcony, the sail loft a hoist door): the planner fits an inside stair |
| abyss | `abyss_inn` v1 | the three wings are solid plastered boxes: the 27 rooms (one per door) assume 0.25 m walls, 0.15 m partitions and floors at the doors' sills |
| abyss | `abyss_guard_tower` | the tower's three storeys (floors 0.4, 3.8, 7.2) have windows but no stair is drawn: the planner fits one inside |
| yuni | `civic_chapter_house` | the curved gallery wings show two storeys (round windows at 5 m) but no stair: the planner fits one; the dormitories above are assumed |
| yuni | `mid_round_tower_house` | the drum's upper storey has windows and a door onto the wing's roof, no stair inside: each storey is planned as its own room |
| yuni | `trade_caravanserai` | the side ranges' upper doors are never cut (the builder's loop steps by 2 and tests `i % 4 === 1`): only the back range's upper rooms are planned; the left range is stables |
| yuni | `mid_courtyard_house` | the corner tower's ground storey sits inside the front range with no partition: not planned; its upper room opens onto the roof |
| locus | `stilt_mid` v2 | the right wing (3.3 x 4.6) has windows but no door: its bedroom is assumed to open through the house's right wall |
| locus | `tent_pavilion` v2 | the bell tent's cone falls to 2.3 m at r 5.7 (the wall is 1.9 high at r 6.0): the hall is kept inside r 5.7 at 2.2 m headroom |
| highlands | Arsenal ranges, hospital back range, Mechanics' annex, gasholder crown huts, the frame storeys on the crawler house and the stage tenement, a few offices and sheds | an enclosed block with no `vnDoor`: a door is assumed (each item's `note` names it) |
| yuni | `mid_stacked_cubes` (all) | no stair from the ground floor to the roof terrace is drawn: the plan puts a steep inside stair up to the second cube's rooms (the loggia door onto the terrace is not planned); the tower room of v1/v2 is reached over the roof by the drawn ladder |
| yuni | `mid_round_tower_house` (all) | the lower wing has no door: it is assumed entered through the drum wall where the two overlap; the drum has no stair drawn: a 1.5 m spiral stair is a fixture in both drum rooms |
| yuni | `mid_courtyard_house` (both) | the side ranges have no doors (planned as the ends of two L bodies entered from the front and back ranges); no stair to the roof is drawn, though the tower room's only door opens onto it; the tower's lower storey has no door and is left out |
| yuni | `mid_bluewash_townhouse` (all) | the roof bulkhead implies a stair from the top storey to the terrace: not planned; the first-floor mashrabiya bay is not planned |
| highlands | `hl_rep_house_tank`, `hl_rus_tank_stue`, `hl_rep_stage_tenement` | tanks and a rocket stage lying on their sides: a floor is assumed 0.7 m above the bottom |
| highlands | `hl_rep_gasholder` | the four crown huts (3.3 x 2.9 m inside) cannot reliably hold a hearth, a bed and a chest: they are sleeping huts, the five huts round the drum's foot are the households |
| highlands | Hall of the Republic, fortress, Forgehouse, Salvagers' Guild, shipbreakers' yards, Fallen Arcology, mine, quarry | only the principal enclosed bodies are planned; each note lists what is left out |
| iziz | stone and plaster storeys stacked on a stepped cornice (`vern_house_rich_a` `_rich_b`, school hall, hospital pavilion, alchemist's house, Farmers' Guild, the frontier's palace, guard tower, watch and toll houses) | the cornice is up to 1.4 m of solid stone between the storeys: the lower level's h is planned taller than its clear height so the next floor lands on the drawn one; a set-back upper storey (0.2 to 1.0 m in) is planned on one footprint with the storey below (the manor on its gallery storey's 11 x 9.4) |
| iziz | `vern_workshop_a` | the board-walled back half of the carpenter's shed has no door: one is assumed from the open shed |
| iziz | `vern_hospital` | the ward's front door at x 3.7 opens into the entrance pavilion, which the plan cuts at the ward's face |
| iziz | `vern_toll_house` | the strongroom annex has no outer door: its door is assumed in the house's -x wall |
| iziz | `vern_guard_tower` | the roof kiosk shows where the stair comes up, but no stair is drawn inside: the planner fits one per storey |

## 3. Open by design (no interior, nothing to fix)

Fields, pens and paddocks; mustering grounds; town and abyssal walls and the wall gate; the stone
circle; open forge sheds (`hl_rep_smithy_small`, `hl_rus_smithy`, `hl_tri_smithy`); open hull vaults
(`hl_rep_wreck_market`, `hl_tri_hull_hall`); the amphitheatre and the Headman's plaza; the rain
canopy; the Girder tower shell (its households are the tower-slot dwellings); the sun shade, the
fishing dock, the windpump, the pumpjack, the oil tank and the props; the two tag demos. Iziz: the scrap smithy, the market
canopy, the grain silos, the palisade segment and its gate, the mustering ground (and the barracks' drill yard and watch
tower), the rest stop's benches, cistern and awning.
