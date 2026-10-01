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
| beast-rider | `br_bldg_gateway_tree_facade` | the trunk is a solid frustum with a carved portal and a door leaf on its face; nothing is hollow, though the variants name a room behind the portal (storehouse, vault, shrine, dorm) | carve the trunk: a room about 4.5 m in radius behind the portal |
| beast-rider | `br_bldg_girder_palisade` | the watch tower is a 1.8 m open post tower whose only floors are ladder landings | a boxed platform room at 9 m, if it should hold sentries |
| highlands | `hl_rep_gate` | the gate chamber over the arch has no door and no stair; the flanking towers are solid | a stair in one flanking tower and a door into the chamber |
| highlands | `hl_tri_scrap_forge` | the container behind the trading shelter has no door drawn | a door in the container's front |
| highlands | `hl_rep_pens`, `hl_rus_pens` | the pigsty hut (1.7 m) and pig hut (1.3 m) are too low for a person | none needed if they are only animal huts |
| post-apoc | `compound` | the guard cabin over the gate has windows on all four walls and no doorway; its ladders end on the open walkway | a door from the walkway into the cabin |

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
| highlands | Arsenal ranges, hospital back range, Mechanics' annex, gasholder crown huts, the frame storeys on the crawler house and the stage tenement, a few offices and sheds | an enclosed block with no `vnDoor`: a door is assumed (each item's `note` names it) |
| highlands | `hl_rep_house_tank`, `hl_rus_tank_stue`, `hl_rep_stage_tenement` | tanks and a rocket stage lying on their sides: a floor is assumed 0.7 m above the bottom |
| highlands | `hl_rep_gasholder` | the four crown huts (3.3 x 2.9 m inside) cannot reliably hold a hearth, a bed and a chest: they are sleeping huts, the five huts round the drum's foot are the households |
| highlands | Hall of the Republic, fortress, Forgehouse, Salvagers' Guild, shipbreakers' yards, Fallen Arcology, mine, quarry | only the principal enclosed bodies are planned; each note lists what is left out |

## 3. Open by design (no interior, nothing to fix)

Fields, pens and paddocks; mustering grounds; town and abyssal walls and the wall gate; the stone
circle; open forge sheds (`hl_rep_smithy_small`, `hl_rus_smithy`, `hl_tri_smithy`); open hull vaults
(`hl_rep_wreck_market`, `hl_tri_hull_hall`); the amphitheatre and the Headman's plaza; the rain
canopy; the Girder tower shell (its households are the tower-slot dwellings); the sun shade, the
fishing dock, the windpump, the pumpjack, the oil tank and the props; the two tag demos.
