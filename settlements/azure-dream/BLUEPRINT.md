# Grēṭ-Āil: the blueprint sheets

The blueprint of the Order of the Azure Dream's head monastery. It follows the method of the Voth and Iziz palaces and
of Longsong (the painting-to-3d-world skill, `references/large-buildings.md`): rooms as data, one labelled sheet per
level, a section, and a furniture manifest drawn from the same data. `PLAN.md` is the design; this file says what the
sheets hold and what they were drawn from.

    python3 azure_blueprint.py        # writes floors/*.png and FURNITURE.md

The script runs on the shared generator (`settlements/voth/palace/blueprint.py`) and takes Longsong's Xanadu key map and
room programmes (`settlements/longsong/longsong_blueprint.py`). It adds:
- its own room kinds (the turnings, the walk, the booths, the wharf's);
- a manifest wrapper, so the hall and the wharf get no generic dressing (no fires or statues among sleepers and nets),
  and rooms a closer sheet draws are counted once;
- a redraw of the axis note and the 50 m bar. The generator puts both at u = -ext, which is off the sheet when a frame
  is not centred on 0. The shared file is not changed.

## The sheets

| File | What |
|---|---|
| `floors/G.png` | the grounds, 720 x 660 m: the cove and the wharf, the lower ward, the Stair of Lowered Eyes, the walled upper precinct with the great monastery, the Lotus Garden and the Hall of Dreaming |
| `floors/W.png` | the fishermonks' wharf, closer: the mole and barge berth, the Lustral Steps, three jetties, the dugout beach, the boathouse, the racks, smokehouses, ropewalk and the Fishermonks' House |
| `floors/H1.png` | the Hall of Dreaming, the sleepers' floor, in its own frame (u from the foot): 136 columns, the Keepers' Walk, eight turnings of 32 cots, the Porlock Screen, the Lulling dais and the Damsel's shrine; the kora round it; the waking way (Waking Gallery, Scribes' Room, Register, Readers' Room) and the sleepers' way in (Lustral Bath, Robing Room, Cup House) |
| `floors/H2.png` | the Hall's upper works: the painted ceiling at +7 m, the clerestory to +12 m with the Station Shutters and their catwalk, the Foot Gallery, the gilt lantern over the shrine; the scribes' dormitory and the Register's upper stacks |
| `floors/S.png` | the summit, 8 km up the Dream Road: the Summit Chorten, the great wheel house, the Station Watch, the pilgrims' shelter, the High Kora with sixteen wheel houses |
| `floors/section.png` | along u from the lake to the Quiet Walk, heights x3 |
| `FURNITURE.md` | the manifest: 6,186 pieces as a brief; 22 new pieces listed at the end |

**The frame.** The origin is the cove's head on the waterline, px 846, 1508.703. u runs uphill, due north up column
846 toward the isle's crest; v runs east along the shore, toward the isle's east tip. The cove's two headlands
(`tools/scale-model/edit_517_azure.py`) stand at u -200, v ±480; sheets G and W show their roots. Metres. The heights are assumptions until core/world draws the isle (`PLAN.md`
section 1).

## What the references teach

- **The Asclepieia** (Epidauros, Kos, Pergamon). Arrival, purification, an offering, then sleep in the abaton, and the
  dream read by the temple's servants. Lesson: **the sleeper is prepared on the way to the bed; the reading is a separate
  room and a separate hour.**
- **The Amphiareion at Oropos.** The incubation stoa, a long hall of sleepers' benches along the walls (about 110 m).
  Lesson: **a dream hall is long, regular and repetitive; its order is the rows.**
- **Hasedera and the Heian *komori*.** Pilgrims shut in the hall overnight, beyond a lattice from the image, waiting for
  a dream (the Sarashina diary). Lesson: **the sleepers face the sacred image down the hall's length, and a screen keeps
  them from it.**
- **The Tibetan dukhang.** A pillared assembly hall on a regular grid, its middle raised as a clerestory, rows of seats
  between the columns. Lesson: **the grid is the furniture plan: two cots to a bay; the clerestory lights the one walk
  that is not slept in.**
- **Valaam and Athos.** Island and peninsula monasteries with a great house by the landing, sketes and chapels inland,
  and a chapel on the summit. Lesson: **the house stands by its boats; the summit is a pilgrimage, not the house.**
- **Lake Atitlán** (*cayucos* and the volcanic shore) and **Inle** (the lake's fishing monks' and fishermen's waterside
  houses). Lesson: **the fishing is done from dugouts drawn up on a beach, with the racks and smokehouses behind it, and
  the fishers live by their boats.**
- **Longsong** (`settlements/longsong/BLUEPRINT.md`): the climb is the rank; the holiest room is wrapped in a kora; the
  services run beside the processional way; the ward feeds the house.

## The principles the sheets apply

1. **The climb is the preparation.** Landing, the lake bath, the hostel and the fast, the Lower Gate, the Stair of
   Lowered Eyes, the Blue Gate, the Court, the Lotus Garden, the bath, the cup, the kora, the hall. Each step takes
   something off: talk, food, clothes, the wheels' sound.
2. **The quietest room is the farthest.** The bells are at the Blue Gate, 200 m off. The fishermonks are 500 m down the
   hill. Felt, double curtains, braked wheels.
3. **The waking way never crosses the sleeping way.** In at the foot from the east; out by the Waking Door to the west,
   to the scribe first.
4. **The rows are the order.** Eight turnings of 32 on a 3 m grid, read round the hall like a kora.
5. **The house stands by its boats.** The wharf is the Order's work and its door. The summit is the festival's.

## Decor levels

- **Sumptuous (4):** the Hall of Dreaming (the walk, the Lulling dais, the shrine), the great monastery.
- **Rich (3):** the turnings, the kora gallery, the Waking Gallery, the Register, the Readers' Room, the Prismarch's House,
  the Blue Gate, the Lotus Garden, the Summit Chorten.
- **Fine (2):** the Lustral Bath, the Cup House, the Hall of Fasting, the college, the officers, the Fishermonks' chapel.
- **Plain (1):** cells, the hostels, the refectory, the wharf's buildings, the dairy.
- **Bare (0):** stores, the lay servants' houses.

## Assumptions

- The isle's shape at 1:1, the cove and every height (`PLAN.md` section 1).
- The storeys: 3.5 m in the cells, the hall's cot bays to +7 m, the clerestory to +12 m.
- The hall's grid is 3 m and its cot 0.8 x 1.95 m, two to a bay with a 0.6 m gap between them.
- The manifest counts big zones on the grounds sheet at a quarter of their area, as the other blueprints do; the turnings
  are counted whole.
