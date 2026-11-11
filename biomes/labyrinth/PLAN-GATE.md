# The Gate: the Kimrs' ancestral arcology, its stacks, and the Labyrinth's station 1 (plan, 2026-11-11)

This is the plan for three pieces built together:
- the arcology at the Labyrinth's eastern mouth (`PLAN.md` section 6), where the Kimr's ancestors lived;
- the carved rock stacks bridged to it;
- the Labyrinth's station 1, **The Gate** (`PLAN.md` section 8), which shows both on their ground.

The owner's brief (2026-11-11) and the reference images set the form:
- **Paolo Soleri's Arcvillage II**: hexagonal in plan, over 400 m wide and about 400 m high. Six cylindrical "columns",
  100 m across, carry two thick horizontal "topographies" (city centre and cultural centre below, commercial above). It has
  a hexagonal skylight core under a translucent membrane and cellular residential skins, and stands on a reflecting pond,
  "a widening of a waterway".
- **Rock stacks beside it, bridged to it**, carved into gardens, industry and mines (reference 3: brutalist towers and saucer
  decks bridged among karst stacks in mist).
- **Overgrown arches with waterfalls** (reference 4) and **stacked cantilevered blocks over water** (reference 5).

Names marked **TBD** are the owner's to give. The questions are in section 9.

## 1. What each reference gives (its rule, not its picture)

| Image | The rule taken from it |
|---|---|
| 1, 2: Arcvillage II sheets | The massing and the numbers. Six round piers, 100 m across, at the corners of a hexagon. Two slab "topographies", each about 70 m deep, span between the piers: a hollow with public space inside and cells on its faces. A hex skylight well runs down through both. Living-working floors fill the piers between the slabs, and dwelling caps crown them. The perimeter is a hexagonal ring of residential cells between square service piers. It stands on a pond fed by a waterway, among fields. |
| 3: towers and saucers among stacks | Bridges run at the slabs' levels from the arcology to the stacks, on piers where the span is long. Round saucer decks with glazed rims cantilever from the stacks' faces. Brutalist concrete, with board marks and panel joints, stained by damp. Mist sits in the gaps. |
| 4: arches and waterfalls | The stacks' cisterns spill as falls from galleries and ledges, into pools that feed the pond. Every ledge and terrace is overgrown (the biome's planting, `BIO.upFaces`, not geometry). |
| 5: cantilevered blocks | The residential skin is stacked boxes, each cell cantilevered over the one below, with deep shadowed soffits and a few windows. It does not read as a smooth wall. |

## 2. The site (scale model 5.1, read with `smodel.page` on 2026-11-11)

The Gowd Warra (`r331`, order 2, 40 m³/s at its mouth) leaves the Labyrinth through its one eastern opening. Above the neck,
the floor of the chaos amphitheatre is 30-40 km wide at 1,150-1,250 m. At **px 378-385**, the north wall (5.5-6.4 km) and the
south wall's foot (3-5 km) close in. There the river runs in a flat reach (its bed 1,121 m from px 374 to the Rift) through a
neck **12-14 km wide**.

**The proposed site: px 376.5, 1473.5** (world km 753, 2,947; old canvas px 104.5, 1143.5).

| | Value |
|---|---|
| ground at the site | 1,131 m (cells 372-378, 1472-1476: all 1,100-1,140 m: flat) |
| the river | the Gowd Warra at px 374,1471 and 383,1474 (bed 1,199 m upstream at 364,1477, then 1,121 m flat) |
| climate | **Cfb** (temperate oceanic), mean 13 °C, rain 850-925 mm a year |
| the north wall's toe | 3-5 km north. It climbs from 1,226 m (px 375,1468) to 2,400 m (px 381-384,1468) and 4,000 m (px 385,1465): the chaos breaking into knobs at its foot |
| the south side | the ground rises from 1,200 m at px 383,1479 to 3,000 m at px 392,1479 |
| neighbours | the gate lake (1,419 m, px 328,1476) is 97 km up-valley; Wildcat (village) is 100 km east at px 427,1453 |

**Why here:**
- **The waterway.** Soleri's drawing has the pond as a widening of a waterway. The Gowd Warra's flat reach is that, and it is the
  one river out of the maze.
- **The gate.** This is the neck, where a keeper would stand: every herd that leaves the Labyrinth passes it.
- **The stacks.** The chaos knobs at the north wall's toe are the stacks. At 2 km a cell, the model cannot show rock 100-300 m
  across, so the station draws them with `KSTACKS`, as the region's note asks ("isolated flat-topped horst mesas and knobby
  pyramids").
- **The mist.** Cfb, 900 mm of rain and a cold river under walls 5 km high give morning valley fog: reference 3's air.

**One catch:** the region's polygon cuts the floor diagonally, from (345,1463) to (393,1513), so the neck is about 20 km east of its
line (the river's record says `rift rim S`). The polygon's edge is coarse, and `PLAN.md` already puts the east entrance at
px 367,1486, outside it too. **Asked** (section 9): keep the site and move the polygon's corner east in the pin edit, or pull the
site west into the polygon at about px 360,1476 (flat floor at 1,200 m, 20 km from either wall, with no rock nearby to stand
the stacks on).

## 3. Lore fit

- **The Kimr came out of it** (`PLAN.md` section 5). The arcology is Ancient, as is the preserve. Its people walked down into the
  maze and became the Kimr, a pueblo people who use every part of every animal. The Aurochs on their crests is the arcology's
  mark too: carved over its gates and painted inside the topographies.
- **The keeper's town.** The Historians' three readings (`PLAN.md` section 6: gatehouse, barn, lodge) all fit one building:
  - the pond and the sluices hold the gate;
  - the stacks' carved yards and galleries are the barn and the works;
  - the topographies' decks look out over the paddock.
- **The stacks' mines and works** say the Ancients worked the knobs' rock, and the smelter galleries are a reason the place was
  self-sufficient. A Kimr legend can remember them (asked: section 9).
- **The state: ruined** (the owner, section 9), and the Kimr's necropolis, **the Hall of Heroes**. The kit's sheet shows it
  intact (decay 0) and ruined (decay 1) side by side; the station shows the ruin.

## 4. The arcology at real scale (the working id `gatearc`; the name is TBD)

Metres, y up, x east, z south. A person is 1.75 m. Storeys are 4.2 m (the kit's Modernist storey). The hexagon's flats face
north and south.

| Part | Size | What |
|---|---|---|
| plan | **440 m across the corners** (381 m across the flats); Soleri's 420 m diameter | the hexagon, inscribed in a 220 m circle |
| height | **400 m** to the dwelling caps; 412 m to the membrane's crown | |
| the six columns | **100 m across**, centres on a 150 m radius at the hexagon's corners | each a drum of living-working floors: an outer ring of cells 14 m deep round a 30 m hall, with a lift and stair core 16 m across |
| the pond deck | 0-12 m | the base: the columns stand in the pond on 12 m plinths with arcades; the ground between them is open water and causeways |
| **the lower topography** (city centre and cultural centre) | **96-168 m** (72 m deep, 17 storeys) | a thick slab between all six columns, a hexagonal ring round the skylight. Its outer faces are cellular dwellings (reference 5's cantilevered boxes). Inside is a hollow public volume 30-40 m high: the city centre's streets and squares, the theatre (sheet 1's cultural facilities). |
| between the slabs | 168-232 m | the columns alone, living-working floors; the light falls between them onto the lower slab's roof gardens |
| **the upper topography** (commercial) | **232-300 m** (68 m deep) | the same, a little smaller (setback 8 m): its hollow holds the commercial hall, galleries round the skylight |
| the dwelling caps | 300-400 m | the columns rise above the upper slab as residential drums with terraced, stepped tops (sheet 1's "Living" blocks) |
| **the skylight core** | a hexagonal well **110 m across the flats**, down from 412 to 96 m | lit to the lower topography's floor. A translucent membrane of radial ribs spans the tops of the six columns (sheet 1's "translucent membrane"). |
| **the residential skin** | 12-16 m deep, on every outer face of both topographies and round the columns | cells 6-9 m wide, 1-2 storeys, each pushed out or in by 0-4 m (reference 5), with a few windows and a deep soffit under each overhang |
| perimeter ring | at ground level, round the pond's inner edge: square service piers every 60 m | sheet 2's square piers, as gate houses and sluices |
| heliport | on one column cap (sheet 2) | a deck 60 m across; it reads as a landing ring for Ancient craft |
| **population** | about 30,000 (Soleri) | on 16 ha |

**The reflecting pond:** a widening of the Gowd Warra, **900 m east-west by 650 m north-south**, its level held at 1,128 m (7 m
over the bed) by a weir on the downstream side. The river enters on the west through a straightened cut and leaves over the
weir to the east. Causeways run from the pond's banks to three of the columns' plinths. Farm terraces lie round it on the
floor (sheet 2's fields), worn back to steppe and parkland in the worn state.

**Records first** (`large-buildings.md`, 5h): the arcology is a plan of records before geometry, in its own `[G data]` plan
fragment, KRAND-hashed, as the Podium, Sanctum and Pile are (`8aq0`, `8ar0`, `8at0`):
- the columns, slabs, skylight, cells, bridges and decks, each with an id, a level and a tag;
- one drawer builds everything from the plan;
- the cells (thousands of them) are instanced boxes, keyed by face, storey and index.

Interiors are not in this round. The topographies' hollows are drawn as volumes with floors, so a later interiors pass has rooms
to fill.

## 5. The stacks (the set piece)

**Five stacks**, standing 120-500 m from the arcology's corners: the north wall's broken toe. They are `KSTACKS` bodies:
tilted flat-topped mesas and knobby spires (the chaos's kinds, `PLAN.md` section 1), drawn from bedded strata.

| Stack | Kind | Size | Carved into | Bridged |
|---|---|---|---|---|
| S1 **the Garden Stack** | mesa, 3 tiers | 320 m tall, 150 m across at the foot | terraced gardens on every ledge, hanging gardens from cut galleries, a cistern in the top whose overflow falls 200 m into the pond (reference 4) | to the lower topography at 120 m, and to the upper at 260 m |
| S2 **the Works Stack** | butte | 260 m, 120 m | smelter and foundry galleries cut into the face, chimney flues up through the rock, a hauling incline down to the river | to the lower topography at 100 m |
| S3 **the Mine Stack** | spire, plates | 380 m, 110 m | adits and stopes, spoil fans at the foot, a headframe on a ledge, ore chutes; the saucer decks (reference 3) at 180 and 240 m | to S1 at 180 m; to the upper topography at 240 m |
| S4 **the Lookout** | spire, lean | 220 m, 60 m | a stair cut round it, a saucer deck at the top (the lodge's view over the paddock) | to S3 at 200 m |
| S5 **the Quarry** | mesa, worked down | 140 m, 200 m | stepped quarry benches, the source of the arcology's stone; a quarry lake | none (a causeway from the pond) |

- **Bridges** span 120-400 m between bridgeheads on the stacks' drawn walls (`KSTACKS.wall`, by rays against the drawn mesh:
  the skill's "Fit to the DRAWN mesh"). Over 180 m they stand on piers rising from the floor. Their decks are 12 m wide box
  girders with parapets (reference 3).
- **Carving:** cut terraces are ledges (`KSTACKS.ledge`), and the galleries, adits and flues are openings cut into the drawn
  wall: a dark recess, a lintel and a deck. True voids in the rock (`KCARVE`) wait for the interiors pass.
- **Its own set piece:** the stacks are a builder of their own (`buildGateStacks`), with their own plan of records, so the
  open world and another site can place them without the arcology.

## 6. Where each piece lives (the build plan)

1. **`kits/ancients`, a new target `gatearc`** (Soleri's family: `hexahedron`, `arcbeam`, `arcoindian`). The kit's sheet shows:
   - the arcology, worn and ruined;
   - the stacks set piece beside it, with the bridges;
   - Soleri's numbers in the title block.
   The new fragments are:
   - `8av0-gatearc-plan.js` (`[G data]`, records): the arcology's plan;
   - `8av1-gatearc.js`: the arcology's drawing;
   - `8av2-gatestacks-plan.js` (`[G data]`): the stacks' records, on `KSTACKS`;
   - `8av3-gatestacks.js`: the stacks' fittings and the bridges.
   The kit's `build.py` adds `core/terrain`'s `37-core-stacks.js` (and `core/rand`) for this target. Asked of nobody: the kit
   reads core by path already.
2. **`biomes/labyrinth`, a new biome build**, started from `biomes/copperglacier` (its neighbour to the north, the form
   `PLAN.md` follows), with station 1 **The Gate** at px 376.5,1473.5. It reads the Ancients kit's runtime and the `gatearc`
   builders in place, renamed as `biomes/ancientsvalley/build.py` does (`ANC_RUNTIME`, `ANC_SUBST`). The station draws:
   - the ground from the scale model's cells, with `KRELIEF` for the walls' toes;
   - the stacks on `KSTACKS`, seated by `SEAT.md`;
   - the pond and the river on `core/water` (`WATER.open` for the pond, `WATER.flow` for the Gowd Warra, `WATER.fall` for the
     Garden Stack's fall);
   - the mammoth-steppe flora and parkland as a first cut on `core/biome`. The animals wait for `kits/fauna`'s megafauna
     (`PLAN.md` section 4): station 1 places their herd records as keep-clears only.
   - the arcology as a hero, with `KFAR` far masses of the walls.
3. **The scale model pin**: an edit script `tools/scale-model/history/` (reconcile key `5.1e4-gate`) adding a `ruined arcology`
   (or `arcology`) pin at px 376.5,1473.5, name TBD, and the polygon change if the owner keeps the site. It runs only after the
   owner's answers. Until then it is a proposal in this file.

## 7. Core adoption (written first, as `CLAUDE.md` requires)

**The `gatearc` target (kits/ancients):**

| Need | Module | How |
|---|---|---|
| randomness | `core/rand` (`KRAND`) | every cell, opening and deck hashed by (site, part, index, salt); no `rng()` in the plan fragments |
| rock bodies | `core/terrain` `KSTACKS` (37) | the five stacks as records and meshes; bridgeheads on `KSTACKS.wall`, terraces on `KSTACKS.ledge` |
| strata | `KSTRATA` (35) | **no** on the sheet (the kit's sheet ground is flat): the station's walls take it |
| engine, records, tags | the kit's own runtime (`REGISTER`, the merged buckets) | the Ancients kit's engine; `core/engine` is the culture-kit engine, which this kit predates |
| materials | `core/materials` (the kit's `22-materials.js`, `68-mat-v5.js`, the library pack) | the concrete, board-marked and stained; the rock from the library's sets |
| worn and ruined | the kit's `69w-worn.js`, its decay | decay 5 and 1 |
| LOD | `core/lod` | as every target |
| sky | the kit's sheet sky | the kit's target pages are viewers, lit by their site's sky in the world |

**Station 1 (biomes/labyrinth):** the table in `PLAN.md` section 7, unchanged, plus:
- `core/water`: `WATER.fall` for the stack's cistern fall and `WATER.still` for the quarry lake;
- the Ancients kit's runtime read in place, as `biomes/ancientsvalley` reads it. `core/city`: no (the arcology is one complex, a
  ruin; the Kimr's pueblos are `core/hamlet`, a later station).

`tools/check_core_use.py` is run before either is called done.

## 8. Budgets and checks

| | Budget | Check |
|---|---|---|
| `gatearc` sheet | 3.0 M triangles for both rows (the cells are instanced: about 9,000 at 12 triangles) | `verify.py --assert` (the kit's invariants, `REGISTER` non-empty, no NaN) |
| station 1 page | the station budgets of copperglacier (`BUDGETS.json`), plus 1.2 M for the hero | `verify.py --assert`, every view named, `check_views` |
| bridges | every bridgehead within 1.5 m of the drawn wall | an assert from the stacks' records against `KSTACKS.surface(..., {drawn:true})` |
| the pond | its level over the ground on every bank cell | an assert over the station's ground |

## 9. For the owner (asked before the build)

1. **Its state:** worn and whole (the Kimr left it), ruined, or partly reused by Kimr? Which does station 1 show?
2. **The site:** the neck at px 376.5,1473.5 (moving the region's corner east), or inside the current polygon at about
   px 360,1476?
3. **The stacks:** five as in section 5, or a denser karst garden (eight to twelve)?
4. **The name** of the arcology, and does a Kimr legend remember the stacks' mines?

**The owner's answers (2026-11-11):**
1. **Ruined.** Station 1 shows the ruin (decay 1); the kit's sheet shows it intact beside it, for reference.
2. **The neck**, px 376.5,1473.5. The pin edit moves the region polygon's corner east to take it in.
3. **Five stacks**, as in section 5.
4. **The Hall of Heroes. The Kimr bury their dead there.** The ruin is their necropolis:
   - **The dead in the ruin:** burial niches cut in rows into the broken cells of the residential skin (the cells are the tombs);
     bundled dead on the topographies' fallen decks; ossuaries in the columns' halls.
   - **Their marks:** Aurochs skulls and horns over the niches and on poles along the causeways; ochre hand-prints; offerings
     of horn vessels and melons on ledges.
   - **The way in:** the causeways across the pond are the funeral road. A Kimr pueblo is not built at the Hall: the living
     stay out. Their village on a knob above the gate is a later station item (`PLAN.md` section 5).
   - **In the records:** the niches and markers are records tagged `funerary`, `religious` and culture `kimr`, registered before
     they are drawn, so `core/simulation` can later send funeral processions along the causeways.

   The working id stays `gatearc` in code, so the files keep a stable name. Its title is "the Hall of Heroes".
