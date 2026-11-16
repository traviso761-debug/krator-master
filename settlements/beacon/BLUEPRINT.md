# The Beacon: the Order of the Beacon's head house on the east shoulder over the Rift

A blueprint on the large-buildings method (`painting-to-3d-world`, `references/large-buildings.md`: Part 1 for the
rooms, Part 2 for the layout as data). It runs on the generator the Voth, Iziz, Longsong, Erewhon and Tempest blueprints
share (`settlements/voth/palace/blueprint.py`), with Longsong's Xanadu key map and programmes. The site, the people,
the lamp and the economy are in `PLAN.md`.

**From the owner and the lore** (everything else here is *proposed*):
- The owner, 2026-11-16: the beacon fort over the Rift (`march.e`) "will become the head monastery of the Order of the
  Beacon". Its lamp is "a refurbished Ancient high-intensity beacon that has been moved there by Xanadu and connected to
  a generator". Its keepers are **the Yellow Monastery, the Order of the Beacon**, Qiblai's gold spoke, which "may keep
  other beacon lights as well".
- The forts' gold is on the gate pavilion and the chapel only. The holy crown is the monasteries' (`kits/qiblai/PLAN.md`
  section 4). The Decree forbids war-making by its clergy (2a), and the Station is the Broken Wheel (2a, `LORE.md` 6.13).
- **The owner's forks, 2026-11-16** ("agree with your recommendation for all"):

| Fork | The owner's answer | What it set |
|---|---|---|
| The site | **The east shoulder, 853,1540**, a knoll at 863 m over the Rift, a saddle behind it | the frame: u south along the shoulder, the fort on the knoll, the precinct on the saddle |
| The head house | **About 300, the gold Prismarch here**; Qiblai's gold house the daughter | the Labrang (sheet L); the Lamp School; the census |
| The walls | **The Sultan's watch fort above, the monastery below (Gyantse)** | three zones: the fort (the Sultan's), the lamp ward and the precinct (the order's), two walls between |
| The lamp | **Every night, the signal book, raised to the Station when it passes** | the plinth's signal room and Lamp Watch (sheet P); the Generator House; the section |

## What is here

| File | What |
|---|---|
| `src/30-bc-layout.js` | **the layout** (`[G data]`): the frame, the ground, the fort asset's watch plan (a snapshot), the zones, the walls, the gates, the parts with their footprints and beds, the ways, the cable, the lamp's sights, the power and the census |
| `src/31-bc-rules.js` | the rules, as plain functions (`BEACON.checks`, `reach`, `area`, `toPx`) |
| `test-beacon.js` | `node settlements/beacon/test-beacon.js`: every rule passes on the layout and fails on a copy broken in its one way (35 checks) |
| `layout_dump.js` | the layout, its area and its checks as JSON (what the sheets draw) |
| `beacon_blueprint.py` | the sheets and the manifest; it stops if the layout fails a rule |
| `floors/T0.png` | the shoulder round the house (800 x 800 m): the road and the fort road, the terraces, byres, hives, tea, the carters' yard, the tank, the scarp's brow, the lamp's sights on their bearings |
| `floors/B1.png` | the house, ground floor: the precinct, the lamp ward, the fort; the walls by owner, the gates, the kora, the cable |
| `floors/B2.png` | the upper storeys; the fort's wall walk and Gyantse's walks |
| `floors/M1.png`, `M2.png`, `MR.png` | the Yellow Monastery (the kit's block): ground, upper floor and the hall's gallery, the hall's third storey and the roofs |
| `floors/L.png` | the Labrang, its four floors side by side |
| `floors/P.png` | the Lamp Plinth, its five levels side by side |
| `floors/section.png` | along the axis from the road gate to the lamp and the scarp |
| `FURNITURE.md` | the manifest from the same data, the pieces the catalog lacks at the end |

**Frame.**
- u runs **south** along the shoulder: the saddle and the road at the left of a sheet, the knoll, the fort and the Rift
  at the right. v runs **east**, up a sheet. y is up from the knoll's crown (863 m). Metres.
- The origin is the lamp, in the keep's place of the fort asset's watch fort. The fort's x is v, and its z (+z toward
  its gate) is -u - 6.6.
- The fort's ward is u -27.6..14.4, v -28..28, and its gate faces north at u -27.6.
- The precinct is u -240..-68, v -60..60.
- The kit's monastery stands at u -128..-76, v -26..26, with its gate facing south: kit z -> u = -102 + z, kit x -> v.
- `BEACON.toPx` turns a point onto the scale model (2 km a pixel).

## The plans studied, and what they teach

- **Gyantse** (the dzong on its rock and the Palcho monastery below it). The fortress holds the crown; the monastery and
  the town lie at its foot inside walls that climb the rock to join it. Lesson: **the soldiers hold the height and the
  monks the ground below; one set of walls makes them one place without making them one house.**
- **Paro's Ta Dzong.** The round watchtower stands above the dzong it guards and sees down the valley the dzong cannot.
  Lesson: **the eye stands above the house, not in it.**
- **Hook Head and St Catherine's Oratory.** By tradition the monks of St Dubhan kept the light at Hook Head for
  centuries. On the Isle of Wight a chantry priest kept a lamp in an oratory tower for ships, and said masses for their
  souls. Lesson: **a light kept by a religious house is an office, kept by rota and prayer, and the keepers' chapel sits
  under the lamp.**
- **Tashilhunpo.** The Panchen Lama's seat, far from Lhasa, has the great Labrang inside the monastery's walls and the
  assembly hall below it; the head of a lineage keeps his own house apart from the capital's. Lesson: **the order's head
  lives at the order's work, and his house (the labrang) receives the world so the cloister need not.**
- **The Potala's Sunlight Apartments** (*Nyiö*). The Dalai Lama's rooms at the top of the White Palace face south into
  the light. Lesson: **the head's highest room looks toward what the house exists for.** Here that is the Window of
  Light, which looks over the hall's crown to the lamp.
- **The Jokhang's butter lamp house.** Thousands of lamps are kept lit in a room of their own by the faithful in turn.
  Lesson: **the gold spoke's devotion is light, kept by many hands.**
- **The Qiblai kit's great monastery** (`qb_monastery`, `o.v 2`): two storeys of cell ranges round a cloistered court, the
  gate tower in front, the Assembly Hall at the back under the gilt crown, and for the gold spoke **the Song drum** in the
  court. Lesson (the Tempest's too): **keep the kit's block whole as the convent; build the order round it.**
- **The fort asset's watch fort** (`XFORT`, size `watch`). Lesson: **keep the asset's plan; put the lamp where its keep
  was, and keep the order's machinery outside the Sultan's walls.**

## The principles the blueprint applies

1. **The lamp holds the height; the house lies below it** (the owner's Gyantse fork; Paro). The fort and the lamp
   stand on the knoll's crown and the precinct on the saddle 12 m below. Gyantse's two walls climb from the precinct's
   corners to the fort's towers.
2. **One line from the hall to the lamp.** The Assembly Hall faces south. The monastery's gate, the precinct's Gate of
   the Lamp, the Lamp Stair, the fort's gate and the plinth all stand on v = 0. The chapter sings facing the light.
3. **Two ways in, never crossing.** The road comes to the Gate of the Wheel. The Sultan's men and the oil carts take the
   fort road outside the west wall to the Ward Gate. The fort is reached without the cloister, and the cloister without
   the fort (a rule with a negative).
4. **The Sultan's walls, the order's machine.** The fort, its gate and its gun are the Sultan's. The lamp, the plinth,
   the cable, the engines and the oil are the order's. The engines stand in the lamp ward. The cable enters the fort
   only under its gate (a rule), and the signal room is shared. Each needs the other: without the order's engines the
   lamp is dark, and without the Sultan's walls the order has no knoll.
5. **The head receives the world in his own house** (Tashilhunpo). The Labrang stands between the gate court and the
   cloister: envoys in its north hall, the brothers by its south door, the order's council and archive at its heart.
6. **His highest room looks at the light** (the Potala). The Window of Light faces the lamp over the hall's crown, and
   the Prismarch keeps the night's first watch there.
7. **The light is an office kept by rota** (Hook Head, St Catherine's). The Lamp Watch is three keepers a night in the
   plinth, under the Chapel of the Beacon. The night's log is read first at the daily chapter.
8. **Many hands keep the small lights** (the Jokhang). The Butter Lamp House is kept lit by the novices in turn. The
   Hall of Lights burns a lamp for every light the order keeps.
9. **The school trains the order's other keepers.** The Lamp School and its Library of Lights stand beside the Hall of
   Lights: optics, engines, the signal book and the grid code.
10. **The dead keepers are kept by the stair.** The Chorten of the Keepers stands in the lamp ward. The order's first
    lamp lies under silk in the Keeper's Chapel at the top of the hall.
11. **No war in the house.** The monks bear no arms (the Decree). The precinct's wall is a monastery's, 6 m with no
    walk; the fighting walls are the fort's and Gyantse's. In a raid the lay brothers carry water and arrows up
    Gyantse's walks to the Sultan's men.

## Who lives where (*proposed*; the owner's ~300, the tune's 150; the layout's `sleeps`, checked)

| Who | People | Where |
|---|---|---|
| The gold Prismarch and his household | 12 | the Labrang (L2), its household range |
| The chapter (the Prior, the chant-master, the Master of the Lamp, the Lamp Watch on rota, the readers, the old keepers) | 150 | the monastery's cells two to a room (M1, M2); the Master of Novices in his house |
| The Lamp School | 36 | the Keepers' Dormitory (B2) |
| Novices | 60 | the Novices' Dormitory (B2) |
| Lay brothers | 42 | over the kitchen and granary, the guest house, the infirmary, the byres |
| **The order** | **300** | |
| The Sultan's watch fort (the fort asset's: the garrison with 10 hired musketeers, and others) | 150 | the fort's barracks, stables loft and gate rooms |

## The floors in one table

| Sheet | Level | What it holds |
|---|---|---|
| T0 | the shoulder | the house; the road from Erehwon and the fort road; the carters' yard; the byres and dairy; the hives; the west, east and north terraces (12.7 ha); the tea garden; the threshing floor; the midden; the saddle tank; the scarp's brow; the lamp's sights (gold seen, grey hidden) |
| B1 | ground | the Gate of the Wheel, the gate court, the guest house, the granary; the Labrang; the novices' range, yard and master; the infirmary; the Lamp School; the kora garden; the Yellow Monastery; the kitchen and refectory; the Hall of Lights; the Butter Lamp House; the Gate of the Lamp; in the lamp ward the Lamp Stair, the gate plaza, the Generator House, the Oil Pit, the workshop, the Chorten of the Keepers and the Ward Gate; the fort (the asset's barracks, stables, magazine, granary and cistern) with the Lamp Plinth in the keep's place |
| B2 | upper | the porter's loft; the guest chambers; the lay brothers', household, novices', keepers' and cooks' dormitories; the Library of Lights; the gallery of the Register; the infirmary's upper ward; the fort's barracks and gate chamber with the gilt pavilion; the fort's walk and Gyantse's walks |
| M1 | monastery, ground | the Gate of the Light, the front stairs, the sacristy, the hall's butter and oil; the Court of the Drum and the Song Drum; the cloister walks; the Library of the Light, the scriptorium; the Chapter House, the treasury, the old brothers' cells; the inner kora; the porch; the Assembly Hall; the Shrine of the Light; the chapter's cells |
| M2 | monastery, upper | the Drum of the Hours; the cells (the daughter house's brothers among them); the Masters' Gallery round the hall's void; the Prior; the chant-master |
| MR | monastery, top | the Keeper's Chapel (the hall's third storey); the roofs; the gate tower's roof with the gold banner; the gilt crown |
| L | the Labrang | L0 the Envoys' Hall, the guard, the porter, the Treasury of Offerings, the light court, the Secretariat of the Register, the Hall of Petitions; L1 the Audience Hall, the Council of the Order, the Archive of the Book of Lights, the Prismarch's library; L2 the household's cells, the chamberlain, the secretary, the Prismarch's cell, study and oratory; L3 the Chapel of the Gold Light, the roof terraces, the Window of Light |
| P | the Lamp Plinth | P0 the switch room and cable vault; P1 the signal room (shared) and the log; P2 the Lamp Watch; P3 the Chapel of the Beacon (gilt); P4 the roof, the hatch and the lamp on its slewing ring |

## Finishes and the dress (*proposed*)

- **The monastery** is the kit's, in the gold dress (`QSPOKE[2]`: walls 0xd4b040, red trim, brown band), the crown on
  the hall, the Song drum in the court.
- **The precinct's ranges** are Qiblai's crisp cubes in the gold wash, a storey or two. The Labrang is white with the
  gold band and tall south windows, in the Potala's manner.
- **The fort** is the fort asset's in the `march` dress (rubble under lime wash, the maroon band). The plinth is battered
  white with the Chapel of the Beacon yellow-washed on top.
- **Gold, and only here:**
  - the fort's gate pavilion and the Chapel of the Beacon (the forts' rule);
  - the Assembly Hall's crown (the monasteries');
  - inside the Labrang's chapel and the Assembly Hall (furniture, not fabric).

  The layout's gold rule checks the first three.
- **The lamp head** is Ancient white metal with the Xanadui iron straps and brass shutters.
- **Decor:**
  - Sumptuous (4): the Assembly Hall, the Shrine of the Light, the Keeper's Chapel, the Labrang's Audience Hall, chapel,
    oratory and Window of Light, the Chapel of the Beacon.
  - Rich (3): the gates, the Labrang's Envoys' Hall and council, the Library of the Light, the Chapter House, the Hall of
    Lights, the Butter Lamp House, the chorten.
  - Fine (2): the guest house, the infirmary, the school, the refectory, the signal room.
  - Plain (1): the ranges, dormitories and workshops.
  - Bare (0): the stores, the pits, the fort's magazine and granary.

## For the fort asset (`beacon:'ancient'`, Strongwall's plan 5.7)

What this house needs of the asset's watch fort, and what it changes:
- **The keep's place is the Lamp Plinth.** The keep's 12 x 12 m, 18 m battered footing is the asset's. Its floors are
  this plan's (sheet P). The Chapel of the Beacon on its top storey is the fort's gilt chapel, and the lamp head on its
  roof is `kits/ancients`' piece.
- **The generator house is not in the fort** (a change to 5.7). It stands in the order's lamp ward, outside the fort's
  north gate. The cable runs in a stone channel under the gate passage to the plinth, so the asset needs only the
  channel and the plinth's cable gland.
- **The gate faces north**, toward the order, with the gilt pavilion. The asset's single gun stays over the gate.
- **Gyantse's walls** start at the fort's north-west and north-east corner towers. The asset's corner towers take a wall
  end, as Strongwall's gorge wall takes the rock towers.

## Lore (*proposed*, for the owner)

- **Why the head moved.** The gold spoke's office was always light: gold as the "sunny dome" kept, the butter lamps of
  the Rainbow Temple, the kora's lamps. When the Sultan's engineers set the Ancient beacon on the shoulder, the gold
  Prismarch moved his chair to it, for "the house is where the light is". Qiblai's gold house became the daughter and
  the order's seat on the inner square.
- **The lamp makes no war; it warns.** It keeps the Decree's ban on war-making by the clergy and serves the Sultan's
  forts all the same. Its keepers read the signals and the Sultan's men answer them.
- **A light for the Wheel.** When the Station crosses, the beam is raised to it and held while the Lamp Watch sings: the
  lamp turns where the broken Wheel cannot, as the prayer wheels do.
- **Signals in the sound grid.** The signal book flashes syllables as rows and columns of the grammarians' grid, so a
  message is holy writing in light, and a misspelled flash is a false note. This is PLAN.md question 5.

## Assumptions and open points

- **The ground.** The knoll's crown is flat for the fort and the saddle 12 m below it (the layout's `ground`). The 2 km
  grid shows the knoll, the spur and the saddle but cannot place them closer than a cell; the region at 1:1 decides
  (step B7).
- **The heights:**
  - the storeys, about 4.2 m in the ranges and the Labrang;
  - the precinct wall, 6 m;
  - Gyantse's walls, 6 m with a walk;
  - the Lamp Stair, about 11 m of rise;
  - the plinth, 18 m with the lamp at 22 m.

  The fort's are the asset's.
- **The fort asset's plan is a snapshot** of `XFORT.plan({size:'watch'})` on 2026-11-16, uncommitted on
  `claude/strongwall-plan-c1ee33`. If the asset changes, re-copy it into the layout and rerun the test.
- **The cells are about 22 beds short.** 149 monks at two to a 20 m² cell want about 1,490 m². The kit's two-storey
  gold dress gives about 1,270 m² of cells (M1 and M2) after the hall, the library, the chapter house and the treasury.
  That is about 127 beds. Two ways out:
  - cells of 8.5 m² a monk (Tibetan cells are small);
  - a third storey on the gold dress, as the kit's odd dresses have (`hr` [3.4, 3.0, 2.8]). That is `kits/qiblai`'s
    call.

  The layout still beds the chapter's 149 in the monastery.
- **The light's reach** (PLAN.md 1.4) rests on a *proposed* 10⁸ candela and the haze of a 2 atm Rift.
- **Fodder, milk and honey** are drawn but not in the tune (PLAN.md section 5).
- **The manifest** counts every room at its full area except the shoulder sheet's large zones. It does not dress open
  grounds, roofs or the hosted building's court.
