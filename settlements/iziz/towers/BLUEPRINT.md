# Iziz's skyscrapers: the interiors blueprint

The owner (2026-10-19): "work on skyscraper interiors; add slum quarters into the first 12 levels of the skyscrapers, then
the upper stories have junk and scrap and walls+room partitions are randomly broken per the established ancient kit rules.
make a blueprint of the floor plan of each skyscraper first. fallen buildings do not need rooms." And, on the first
sheets: "sky c legs should maybe connect to a sky lobby leading to the inhabited levels. other skyscrapers should all
have a lobby on the first floor. also, the ruined/fallen skyscrapers should have rooms in the upright portions, filled
with scrap/junk/rubble."

The plan is code, not drawings: `src/78s-iziz-towers-plan.js` (`IZTOWER.plan(key, d, s)`, plain data) is what the page
will build from, and these sheets are drawn from the same output (`node towers/plan_dump.js` runs that file with the kit's
own noise and writes `plans.json`; `python3 towers/blueprint.py` draws `floors/<key>.png`). So the sheets show exactly what
gets built, at the city's usual scale (0.3; a tower placed smaller gets fewer storeys, each still 3.2 m).

| Sheet | Tower |
|---|---|
| `floors/skyA.png` | A, the Conocylinder (The Project is one) |
| `floors/skyB.png` | B, the Scallop Stack |
| `floors/skyC.png` | C, the Tripod (its legs and sky lobby) |
| `floors/skyD.png` | D, the Monolith |
| `floors/skyE.png` | E, the Sail |
| `floors/skyF.png` | F, the Trays |

## The rules

* **Storeys keep to the tower's window rhythm** (`rows` in 78s: as many window rows a storey as come nearest 3.2 m at the tower's scale, each floor in the spandrel between two rows; the lobby's ceiling is the first row 3 m up, a lobby over 5 m a lobby and a gallery).
* **Storeys are the world's, not the kit's.** The city places every tower at about 0.3 of the kit's size (smax 0.3, hmax
  135 m), so the kit's own floor plates (every 4 to 8 kit metres) land 1.2 to 2.4 m apart: no one could stand in them.
  The interiors use 3.2 m storeys from the body's foot to below its crown (the Trays keep their own trays: 3.6 m apart,
  2.8 m clear). With the interiors on, the kit's plates, soffits and room silhouettes are left out of these towers
  (`IZS_HOLLOW.sky`; every rng draw they made is still made, so nothing else in the tower moves).
* **A lobby at the foot.** D, E and F: the body's first storey (4 m), open round the core in four rooms, a street door
  on the tower's front (the Sail's at its lens tip). A and B stand on a base cone or core: their lobby is that, at the
  street, round the foot of the stair that climbs to the body. **C's three legs** each carry a stair from a street door
  at its foot (the flights following the leg's lean) up to **the sky lobby**, the body's first storey, where the three
  arrive through wells in its floor; the core's stair goes on up from there.
* **Then 12 storeys of slum**: cells (shanty rooms, each a one-room home: a bed, a hearth, a food store and a chest)
  off a corridor round the stair core. On a wide floor (more than 7.5 m from the corridor to the lining: A's lower body)
  the corridor runs part-way out, with cells on both sides of it and the inner cell in front of the core's door left open
  as the passage. Cells are cut radially every ~3.4 m (the Trays: one from each lobe's valley to its peak), and a cell
  under 2 m deep in its middle is left to the corridor.
* **Above the twelfth storey is junk**: the same cells as the Ancients' offices, full of scrap and junk, and their
  partitions and corridor walls broken by the kit's hole rule (`32-surfaces.js` `holeFn`): a wall breaks where
  `fbm(u, y, seed) < 0.34 * d * HOLES`, `HOLES` 0.55 for a repaired tower as the city builds it. A broken wall keeps a
  jagged stub of part of its height, or is gone.
* **The stair core** (3.2 x 4.2 m) runs the whole height: a switchback, 16 risers a storey, its foot and its arrival on the
  core's door side, the landing behind. Below the body a stack of the same climbs from the street: up A's base cone,
  B's base core, and C's leaning leg (each storey's flight follows the leg). D, E and F stand on the plinth.
* **The ruined and toppled towers** have no slum: every storey of their upright part (a ruined tower up to its cut, the
  cells its collapse scar tears open left out, a toppled one its stump) is **rubble**, the cells full of scrap, junk and fallen rubble, their walls
  broken by the same rule at the tower's own decay (d 1: below .34; d 2: below .68). The toppled tower's fallen body has
  no rooms. Their lobbies are lobbies, strewn with rubble.
* **The Sail** is a twisting lens about 7 m deep: its core turns with it, long side along the lens, a door at each end of
  a corridor down the middle and cells either side; its upper storeys are too narrow for cells, so each end is one open
  room.

## The towers (at scale 0.3)

| Tower | Lobby | Storeys (repaired) | Cells: slum / junk | Ruined: storeys (rubble rooms) | Toppled stump |
|---|---|---|---|---|---|
| Skyscraper A, the Conocylinder | street, in the base cone | 26 | 205 / 315 | 22 (349) | 4 (99) |
| Skyscraper B, the Scallop Stack | street, in the base core | 25 | 120 / 141 | 19 (174) | 4 (40) |
| Skyscraper C, the Tripod | sky lobby at 47.4 m, three leg stairs | 15 | 127 / 18 | 12 (101) | 1 (0) |
| Skyscraper D, the Monolith | street, the body's first storey | 27 | 120 / 132 | 20 (150) | 5 (30) |
| Skyscraper E, the Sail | street, the body's first storey | 27 | 38 / 28 | 22 (56) | 4 (12) |
| Skyscraper F, the Trays | street, the body's first storey | 19 | 72 / 14 | 14 (76) | 3 (12) |

Each sheet: the three sections (repaired, ruined, toppled), the lobby, the first slum storey, the first junk storey and a
ruined tower's rubble storey.

## Building it (next)

1. `IZS_HOLLOW.sky` in the four sky fragments (kits/ancients 52-sky-abc, 56-sky-d, 57-sky-e, 58-sky-f): leave out the kit
   plates, soffits and `skyRooms` (keeping their rng draws), and cut a street door at the foot (and door holes in the
   Trays' core lathe).
2. `78v`: draw each standing tower's plan on its placement (the slabs merged per tower, the walls as kit boxes, the slum's
   in scrap and corrugate, the junk storeys' in the Ancients' panel with their stubs), the stair cores, the doors
   (IZDOOR: a leaf on every third slum cell, a curtain on the rest), and core/walk (floors, stairs, the whole walls and
   stubs as blocks).
3. Furnish near the camera by tower and storey (95i's near pass): the slum cells as one-room homes (poor; the scrap and
   generic sets), the junk cells as stores of scrap, the rubble cells as scrap with rubble heaps (the kit's `rubble`).

## The other Ancient buildings (2026-10-19)

The same rules for every other Ancient building the city places, planned by `src/78w-iziz-ancients-plan.js` (`IZANC.plan`,
on 78s's engine) and drawn from it (`node towers/plan_dump.js` writes `plans-ancients.json` too, at the scales the city
gives them; `python3 towers/blueprint.py` draws a sheet per type: the reclaimed and ruined sections, the lobby, the first
slum storey, a second or the first junk one, a ruined building's rubble storey).

| Sheet | Building (scale in the city) | Layout |
|---|---|---|
| `floors/aptsA.png` | Apartments A, the terrace stack (0.385) | the lobby in the stem's foot; a storey a tray, cells round the stem's stair core |
| `floors/aptsC.png` | Apartments C, the column cluster (0.39) | five drums on stilts: a slim switchback across each, a room either side; steps up to each lobby |
| `floors/honey.png` | Apartments B, the honeycomb wall (0.6) | a bar: corridor down the arc, the core at a third, cells either side; the bite left empty |
| `floors/houseD.png` | House D, the apse house (0.7) | a corridor along the front, three rooms under the dome |
| `floors/houseE.png` | House E, the bridge house (0.54) | the glass box (its east half in a ruin): two rooms, the kit's spiral stair |
| `floors/houseF.png` | House F, the terrace house (0.7) | a row of rooms a tray; the first entered from the street, the next off its roof |
| `floors/fuel.png` | the Well's kiosk (0.3) | one room |
| `floors/t_*.png` | the Ancients transplants (1.9 to 2.6) | rings round the stair core, two or three storeys a window row; the stepped setback by tier |

The offices, government, campus, factory and houses A-C have no plan: the city places none of them (KNOWN_ISSUES.md).

The owner's roster (2026-10-19) takes Apartments A, the kit houses and sky C (but its tripod market) out of the city and
brings in, each with its sheet: `wave.png` (the undulant house, 0.75: a ring round the core in its three storeys),
`bridge.png` (the bridge house, 0.8: four rooms in the tube, a stair up through the entrance box), `fins.png` (the fin
apartments, 0.83: a corridor down the arc, cells either side), `adlab.png` (the star laboratory, 0.9: the drum's four storeys,
the portal's the lobby, two rooms in each lobe), `flat.png` (the undulant flatiron, 0.27: three floors a storey, the ruin's
prow without rooms), `hotel.png` (0.45: two of its storeys a storey, a corridor along the back wall), `cultural.png` (0.27,
compact: the great hall's storeys and the first ring's drums) and `aptsC2.png` (four drums 30 m across, 0.45).
