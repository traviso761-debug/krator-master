# Longsong: the main monastery of the History Monks at Oidong

A blueprint on the method of the Voth and Iziz palaces (`settlements/voth/palace/BLUEPRINT.md` holds the palace
study). The brief (owner, 2026-10-15): the Order of Historians' training, research, archival and, perhaps,
containment facility in the Oidong Valley east of Xanadu; Xanadu styling; the overall effect of the Potala; all one
monastery complex; the whole grounds **400 x 400 m** inside the wall (the owner's figure, settled after a first
220 m draft: room for farms, gardens and outbuildings), the main building more reasonably sized (its base about 135
x 180 m, half again the first draft). The history is in `LORE.md` 6.15.

Decisions taken with the owner: a **walled lower ward** at the foot of the rock (the Potala's Shöl); containment
holds **relics, people and a quarantine of knowledge** (a sealed library with one reading room); the Red Palace holds
the **tombs of the founders**; the Ear is at Yuni, not here.

## What is here

| File | What |
|---|---|
| `floors/section.png` | the ward, the rock, the stepped mass, the Red Palace and the Vault in one section along the axis |
| `floors/L0.png` | the grounds: the whole 220 m square |
| `floors/LV.png` | the Vault in the rock |
| `floors/L1.png`, `L2.png` | the mass's base (stores, the Closed Ward, the keepers) and the School |
| `floors/L3.png`, `L4.png` | the White Palace: the Assembly Hall, the cells and refectory; Testimony, the Restoration Halls, the library |
| `floors/R1.png`, `R2.png`, `R3.png` | the Red Palace: the Founders and the inner kora; the Great Archive; the Chronicle Hall, the Council, the Abbot, the Hall of Stillness |
| `floors/LR.png` | the roof: the gilded roof, the Observatory, the Hall of Hours, the Eastern Watch |
| `FURNITURE.md` | the manifest on the Xanadu sets, with the pieces the catalog lacks at the end |
| `longsong_blueprint.py` | the rooms as data; runs on the Voth generator |

Frame: u from the Great Gate uphill, v across, metres; the grounds are u -200..200, v -200..200; the main mass is
u 15..150, v -90..90 at its base, 30 m above the ward on the rock, stepping back to the Red Palace (u 87..150,
v -60..60); storeys 4.5 m. (The mass sheets are authored at two-thirds size and scaled by 1.5 in the script.)

## The Order's own architecture, carried up from the chapterhouses

The chapterhouses at Yuni, Iziz, Dalab, Ys and Verge are one building (Yuni's `civic_chapter_house`, ported): laterite
drum halls under tile cones with lanterns, round relief-ringed windows, curved arcaded gallery wings, a walled
forecourt with a parabolic gate between two pylons, the Order's Djenné-type civic vocabulary (battered banco,
pilaster-buttresses with pinnacles, toron rows, blue-and-white mosaic string courses, a Sankore-style spire), an earth
palette whose only saturated colour is the Order's blue, and electric lamps. Longsong is built in Xanadu's Tibetan
massing but keeps that lineage where the Order itself is: the Great Gate is the parabolic gate between pylons; the
Lower Gate is flanked by the paired drums; the Great Assembly Hall is a drum under a tile cone and lantern with the
skylight columns inside it; the Debate Court has curved arcaded galleries; the Red Palace's band carries the
blue-and-white string course beside the maroon twig band; the archive has the round relief-ringed windows; the
Eastern Watch is the toron spire with the Order's bell. The library and school fittings are the Order's own set
(`order_bookcase`, `order_reading_table`, `order_lectern`, `order_library_ladder`, `order_globe_stand`,
`order_pupil_desk`, `order_master_chair`, `order_writing_board`, `order_mat_rack`, in `settlements/yuni/src/59-civic.js`).

**Stone and lime, not earth (the owner, 2026-10-19).** The build (`README.md`, `PLAN.md`) keeps the Order's forms above
but none of the chapterhouses' Sahelian earth: no banco, no toron, no laterite. Where they are earth, Longsong is granite
and lime render; the Eastern Watch is a granite spire, not a Sankore one.

## What the references teach

- **The Potala.** A White Palace (the living and governing: the Dalai Lama's apartments, the assembly hall, the
  school, the offices) and a Red Palace (the sacred: chapels, the reliquary stupas of the Dalai Lamas, the libraries)
  stacked on one rock, with the Deyang Shar courtyard between them for festivals and debate, and the Shöl at the foot
  inside the wall: printing house, mint, prison, stables, officials' houses, gates and corner towers. Lesson: **the
  living house below, the dead and the sacred above, the services at the foot; the climb is the plan.**
- **The Jokhang.** A main entrance, an open courtyard, the inner kora round the sanctuary, the assembly hall, the
  Jowo chapel, a second courtyard with a well, monks' quarters, the kitchen, an outdoor assembly square, secondary
  entrances. Lesson: **the holiest room is wrapped in a corridor one walks round; everything else accretes.**
- **The dormitory plan** (the round prayer hall under skylight columns, rooms and classrooms round it, a library,
  kitchens, attendants, the master's and the teacher's rooms at the corners). Lesson: **one lit hall at the centre,
  the cells round it, the teachers at the corners.**
- **Shaolin.** A single axis of halls (mountain gate, Hall of the Heavenly Kings, the main hall, the sutra library,
  the abbot's room, the Standing-in-Snow pavilion, the Thousand Buddha hall) with the bell and drum towers and the
  stele gallery beside it; a fighting order's monastery. Lesson: **the drill and the scripture share one axis; the
  gate is the first teaching.**
- **The Jetavana and St Gall paper.** The onion: a sacred core in secular rings; a central worship route and
  independent service routes so the functions run at once; self-sufficiency. Lesson: **one processional route up
  the middle, the service stairs at the sides, the ward feeds the house.**

## The principles the blueprint applies

1. **The climb is the rank.** Gate, square, avenue, the Great Stair up the rock face, the lower gate and the hall of
   pillars, the School, the Debate Court, the Assembly Hall, the Red Vestibule, the kora, the Founders. The Vault is
   the one thing reached by going down, and by one stair, through a warden's gate.
2. **White below, Red above.** The White Palace holds the living Order: the school, the cells, the refectory, the
   laboratories, the library a monk may use, the Hall of Testimony. The Red Palace holds what the Order is for:
   the founders' reliquaries, the Chronicle, the Archive, the Council, the Abbot, and the Hall of Stillness.
3. **The kora wraps the holiest room.** The inner kora round the Hall of the Founders, with the murals of the
   Cataclysm and the drums; the outer kora round the rock with the prayer-drum row at its foot, where the valley's
   pilgrims walk without entering.
4. **A court of light in the middle.** The Debate Court is open from level 2 to the sky, with galleries at levels 3
   and 4 and the Assembly Hall's porch at its head: the festival ground and the examination.
5. **Containment is a descent with thresholds.** Deep Stair, Warden's gate, keepers' vestibule and register; the
   open vault, then the closed vault, then the quiet cells for the time relics (one each, lead-lined, a bell at the
   door, no clocks in the passage); the Unmaking Room for what must not exist; the Sealed Library behind the Oath
   Room with one reading room and one desk.
6. **The people held are held kindly.** The Closed Ward on the base level has a garden open to the sky, a hall, a
   physician and windows; one door, one warden. The specimen hall is beside it, not in the Vault.
7. **The Order measures.** The Hall of Hours on the roof keeps the clocks (water, sand and the Ancient one); the
   Observatory beside it; the Eastern Watch faces the Lizardmen's country with instruments that read the strangeness
   there. The Restoration Halls below are the laboratories; the heavy workshop is on the base level.
8. **The ward is a town.** Printing house and paper mill (the Order's copies go to the chapterhouses), smiths and
   the lens workshop, the wardens' barracks, the caravanserai, the pilgrims' hostel, the Geomancers' walled lodge,
   the lay servants, the valley's market and tea houses, the dairy. The monks' own infirmary is in the mass; the
   ward's is for travellers.
9. **Contemplation has rooms.** The Hall of Stillness in front of the Chronicle Hall, the masters' meditation cells
   on the roof, the hermits' cliff cells on the east face reached by ladders.

## The floors in one table

| Sheet | Level | What it holds |
|---|---|---|
| L0 | the grounds | gate and gatehouse, pilgrims' square, the avenue; west rows: paper mill, printing house, granaries; smiths, the workshops' court, wardens' barracks; the ward's orchard, the lens house, carpenters, the wardens' drill ground, beehives and the dye garden; east rows: caravanserai, hostel, Geomancers' lodge; lay servants, market, the ward's infirmary; dairy, the pilgrims' camp, kitchen gardens; the Great Stair, the drum rows and the outer kora, the physic and orchard terraces, the hermits' cliff, walk and groves, the spring garden, upper orchards, the reservoir and barley terraces, three posterns |
| LV | the Vault | Deep Stair, Warden's gate, keepers' vestibule and lodge, open vault, closed vault, three quiet cells, Unmaking Room, Oath Room, the Sealed Library's reading room and stacks, the cistern |
| L1 | base | lower gate and wardens, hall of pillars, the Great Stair's hall, granary, cisterns, stores, keepers' quarters and hall, the heavy workshop, the Closed Ward (door and warden, garden, hall, ten cells, physician, specimen hall) |
| L2 | the School | hall of arrival, the Debate Court, drill hall, four lecture halls, trainees' cells, the monks' infirmary, bath house, laundry, lay servants' hall, the masters of arms and of novices |
| L3 | White Palace lower | the Great Assembly Hall, hall of welcome, monks' cells (west range), refectory, kitchen, tea hall |
| L4 | White Palace upper | Hall of Testimony, three Restoration Halls (instruments, machines, the cold room), library reading rooms, scriptorium, bindery, the loggia over the court |
| R1 | Red Palace | Red Vestibule, inner kora, Hall of the Founders, Chapel of the Lost Monastery, Lamp Hall, catalogue, the Archivist and the keepers' door, the Deep Stair's head, the rear shrine |
| R2 | Red Palace | archive stacks (the Peoples; the Ancients), the hall's gallery, conservators, the map room |
| R3 | Red Palace | Hall of Stillness, Chronicle Hall and the chroniclers, the Abbot's antechamber, study and bedchamber, the Council of the Order and its clerks |
| LR | roof | the roof walk, the gilded roof, Observatory, Hall of Hours, Eastern Watch, the masters' meditation cells |

## Finishes

The Xanadu kit's sacred register: battered whitewashed walls on a dressed plinth for the White Palace, the red
upper block under the maroon twig band with gold roundels for the Red Palace, black trapezoid windows with pleated
valances, corbel eaves, painted columns with bow brackets, the gilded hip roof with horns and bells over the
Chronicle Hall; saffron (the Order's colour) on the banners, cushions and lanterns instead of Xanadu's gold-on-
everything; prayer drums at the rock's foot and in the kora. Inside: butter lamps, jali screens, celadon, lacquer
in the Red Palace; rammed earth and timber in the ward. Electric light only where the Order's salvaged generator
reaches (the Restoration Halls, the Vault, the Hall of Hours); elsewhere lamps.

- **Sumptuous (4):** the Assembly Hall, the Founders, the kora, the Chronicle Hall, the Council, the Hall of
  Stillness, the Chapel of the Lost Monastery (sumptuous by its emptiness: one lamp and the names).
- **Rich (3):** the Red Vestibule, the catalogue, the map room, the Abbot's rooms, Testimony, the reading rooms, the
  roof's halls, the Geomancers' lodge.
- **Fine (2):** lecture halls, laboratories, the scriptorium, the Closed Ward's cells, the kora paths.
- **Plain (1):** the drill hall, dormitories, kitchens, the ward's workshops, the vaults.
- **Bare (0):** stores, cisterns, the Unmaking Room.

## Assumptions and open points

- **The build exists** (2026-10-19: `dist/longsong.html`, `README.md`, `PLAN.md`): in situ on the scale model at px
  954,1296, on its own kit (`src/62-ls-arch.js`: the Xanadu kit's Tibetan sacred register without its rammed earth),
  the rock 40 m over the ward, the frame u -> +z (south, uphill), v -> +x (east), the Great Gate in the north wall
  (Krator's sun is in the north). Below the Vault it adds what the owner added to the lore: the Procrastinator's hall
  and its eight seals (`PLAN.md` section 2).
- The rock's height (30 m) and the storey (4.5 m) are assumptions; the Potala's stair and the step-backs will want
  tuning against the hill the build chooses in the Oidong Valley. The grounds may be rectangular (owner): the sheet
  draws a square; a 400 x 320 site drops the two outer rows of the ward or the rear gardens.
- Numbers assumed: about 200 monks, 50 lay scholars, 80 operatives in training, 100 wardens, 120 lay servants, a
  caravan and fifty pilgrims on a festival day. The ten ward cells and three quiet cells are a starting count.
- The manifest counts ward zones at a quarter of their drawn area, as the other blueprints do.
