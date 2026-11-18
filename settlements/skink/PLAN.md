# Skink, the Lizardmen's salt village: what the economy ran short of, and the village that mends it (2026-11-17)

The owner, 2026-11-17: *"examine what if anything the lizard economy runs short of, and propose another village site to
address it"*; then, of the proposal: *"yes add it, this will be the village of Skink"*. Section 1 is the examination;
sections 2-8 are the village, planned like the other towns (a builder follows `kits/lizardmen/settle/GUIDE.md`). **Skink is
in `LZ_TUNE`** (section 5); its page is not built. The owner's answers are in section 8; what else is open is *proposed*.

Files: `spec.json` and `sheets/` (made by `python3 kits/lizardmen/settle/towns_plan.py skink`), `stress-lz.js` (the runs
behind section 1).

## 1. What runs short

**Method.** `LZ_TUNE` (`core/region/data/lz-tune.js`) run on the Allotment and the Coil Rounds for three years, as
`core/region/tests/test-lizardmen.js` runs it for two, once as it stands and once with each source cut in turn
(`node settlements/skink/stress-lz.js <case>`). "Short" is a place eating under 99.5 % of a good it needs.

**As it stands, nobody goes short.** The test passes, and three years run clean. The margins are another matter:

| Good | Made a year (t) | Needed (t) | Stock carried, all places | A cut, and what follows |
|---|---|---|---|---|
| grain | 13,200 | 13,050 | **~4,000 t** (four months) | Iguana at 75 %: the stock draws down ~1,000 t a year, **nobody short** in three years |
| fish | 1,000 (with Gila's lakecake) | 880 | grows | none |
| produce | 4,820 | 4,770 | | |
| meat and hide | 2,270 | 2,270 | flat | **10 % down everywhere: the warrens short 1-2 %** |
| **salt** | **415** (Basilisk 115, Gila 300) | **413** | **~70 t (two months)** | **Basilisk's pans at 60 %: the warrens east and west 18-21 % short. Gila's salt at 70 %: the warrens 17 % (east) and 76 % (west) short** |
| **tin** | **8** (Komodo alone) | ~7 (a tenth of the ~71 t of bronze ware the smiths make) | **~1 t** | **Komodo's placers at half: bronze ware short everywhere: the Tubes 34 %, the warrens 38-42 %, Komodo 29 %, Tuatara 20 %, Iguana 6 %**; copper piles up unused (34 → 102 t) |
| copper | 70 (Tuatara alone) | ~70 | ~0 | Tuatara at 70 %: the warrens 7-10 % short of bronze ware |

**So: salt first, tin second.**
- **Salt** is a food and the thinnest margin of all: two sources at the two ends of the country, two months' stock, and
  every load must go the long way round the Coil. And Basilisk's 115 t comes from pans in **~1,900-2,086 mm of rain** at
  36 °C (`settlements/basilisk/PLAN.md` gave them boiling floors for the wet season): the likeliest source to fail.
- **Tin** has one source, a few tonnes a year, no stock. Komodo is a raider town whose placers lie 12-27 km out on rivers
  that flood; one bad year and the bronze stops. The country is not short of tin in the ground: the geology has **17
  high-grade tin placers inside it**, the tune works one place.
- Copper and meat are tight but cause small shortfalls; grain is well buffered.

**The fix tested.** With the village proposed below (1,500 people, 300 t of salt a year) the salt stock grows from ~360 t to
~940 t over three years instead of hovering at 70 t. The cuts above that left the warrens 17-76 % short of salt leave them
**about 1 % short** (the east warrens, last on the other loop). A second tin source (8 t at Iguana's placer, question 6) keeps
every smithy whole when Komodo's placers are halved.

## 2. The site

The geology's halite (`kits/resources/data/geology.json`, its `halite` layer) is **richest in the whole country here: grade
254** (Gila's evaporites are 205; Basilisk's shore 0), beside two salt lakes on the north side of the Pile's plateau.

| | |
|---|---|
| **Proposed pin** | **5.1 px 691,1521** (no pin on the model: the scale-model queue) |
| Ground | **-1,633 m**, a closed basin floor (-1,620 to -1,670 m) running north-south, rimmed by the plateau rising east to -400 m within 25 km |
| Air | **1.96 atm** |
| Climate | **XV abyssal savanna**: 29 °C, **1,051 mm** in one wet season: pans dry, as at Gila (same climate) |
| Salt | **halite 254 at the pin** (rock salt on the flat); **the salt lake** (basins.json 692.5,1525.7: 32 km², -1,706 m) **~7 km south-south-east**; a second salt lake (712.6,1523.7: 64 km², -1,080 m) 43 km east on the plateau |
| Water | **Tethera Gill** (r766, a wadi, 3.4 m³/s) 18 km, into Gila's lake; wells and a tank, as at Gila |
| Neighbours | **Gila 105 km** (north-west), **Iguana 106 km** (south-south-east), the Pile 109 km, the Tubes 174 km; the west reliquary **104 km at 311°** |
| The Coil | **on the west loop between Iguana and Gila**, where the outward and inward loads already pass |

## 3. Who lives there

**~1,500** (half a village: a works town). More Makers (the salt) and Drovers (the haulers).

| Caste | Share | People | Dwelling | Count |
|---|---|---|---|---|
| 1 Tenders | 22 % | 330 | `lz-warren` (28) | ~12 |
| 2 Makers | 26 % | 390 | `lz-makers` (10), two halls | ~37 + 2 halls |
| 3 Drovers | 26 % | 390 | `lz-longhouse` (33) | ~12 |
| 4 Line warriors | 14 % | 210 | `lz-lodge` (30) | ~12 |
| 6 Bulwarks | 10 % | 150 | | |
| 5 Interpreters | 2 % | 30 | `lz-tower` (7) | ~4 |

## 4. The layout (`sheets/village.png`, `sheets/country.png`)

- **One rhombic squared spiral, four windings** (32 → 40 → 50 → 62 m, each 1.25 times the last; 75°/105°), a 40 m court;
  about 700 m across. **Its mouth opens south-south-east, down the basin toward the lake** (`spiral.axis` 177.5°).
- **The windings:** Tenders with the tank, the seer, the medicine hut, an obelisk; Tenders and towers; **the Makers with the
  bronze and bone halls and two salt stores** (`gl-saltstore`); the long houses and the lodges, a granary and a barracks.
- **Three rock-salt quarries** (`lz-mine`: the kit's mine head works the halite flat as it works ore) 1.6-2.2 km out on the
  flat.
- **Seven squared spirals of salt pans** (`gl-pans`) on the salt lake's north shore, 7 km down the basin, and the salt camp
  on `core/hamlet`'s Lizardmen row (focus `salt`), as Gila's.
- **The ley line** north-west, **311°**, to the west reliquary; the mustering ground at the mouth; fields north up the basin
  (ashmillet, sandpan-fonio, frillpod), two windmills, the herds, the stone circle.

## 5. What it lives on, and the tune

**Added to `LZ_TUNE`** (`core/region/data/lz-tune.js`, 2026-11-17, on the owner's yes): the place `skink` (1,500 people; a
year's make grain 300 t, produce 125 t, meat and hide 75 t, **salt 300 t**; its own diet, no fish), `'skink'` in
`T.coil.loops.west` between `'iguana'` and `'gila'`, and its Allotment weight 2. It makes 300 t of salt (~150 t quarried, ~150
t from the pans), eats ~12 t, and the Allotment sends what the country asks round the Coil; its grain falls ~50 t short and
comes from Iguana, 106 km down the loop.

**What moved** (`node core/region/tests/test-lizardmen.js`, 17 of 17; `test-lz-raids.js` 8 of 8; `test-lz-join.js` 8 of 8; the
three towns' records tests unchanged):
- the country is **11 places, 59,500 people**; the two tests that counted ten now count eleven;
- **Gila now sends 137 t of salt a year** (its records' plan says 275 t): Skink, beside it on the loop, sends 135 t, the two
  together the 273 t the west took from Gila alone before. What neither is asked to send stays in their stores: the reserve
  the country lacked. Gila's check now holds Gila to sending no more than its records' 275 t and Gila and Skink together to
  at least that. **`GL_REC`'s allotments still describe the old plan** (275 t out): Gila's records are its page's, and are
  left for that page's next pass;
- the salt cuts of section 1 now leave the warrens **0.8-1.3 % short** (they were 17-76 %), and the salt in store grows
  from ~300 t to ~700-800 t over three years under either cut.

## 6. Pieces and textures

No new piece: `lz-mine`, the kit's; `gl-well`, `gl-tank`, `gl-pans`, `gl-saltstore`, Gila's by path. No texture owed
(`ground.salt`, `ground.savanna.litter`, `ground.dirt`, `ground.tilled`).

## 7. Steps

| Step | What | Test | Status |
|---|---|---|---|
| **S0** | this plan, `spec.json`, the sheets, the runs | `node settlements/skink/stress-lz.js gilaSalt` | done (`ea38addc4`) |
| **S1** | the owner's yes and the name (Skink); the tune's row and the Coil's, section 5 | `test-lizardmen.js` 17/17, `test-lz-raids.js`, `test-lz-join.js` | done (`e08d51c75`) |
| **S2** | the pin on the scale model's queue | | queued (`PLAN-LIZARDMEN.md`) |
| **S3** | `SK_REC`, the spec and the page, by the guide | `test-sk-records.js`; the guide's section 5; `expect.keys` lz-nest, lz-ley, lz-muster, gl-tank, lz-mine, gl-pans, gl-saltstore | done (`2c412cde8`, GPU-verified; section 8 question 6 answered and added at Iguana) |

## 8. Questions for the owner

1. **Salt is the country's weak point**: mend it? **Answered** (2026-11-17): yes.
2. **A fifth village at 691,1521**, between Iguana and Gila on the west loop? **Answered:** yes.
3. **Its name**: **Skink** (the owner, 2026-11-17).
4. **1,500 people, 300 t of salt a year**: **added** as proposed with the village.
5. **Basilisk's pans** stay at 115 t (wet-season boiling floors) or fall back now that Skink carries the
   country? *Proposed:* they stay.
6. **Tin**: a second source on a high-grade placer, rather than a sixth village: **Iguana's placer on Muckle Weyt Beck**
   (geology 700.6,1563.8, high tin, 27 km from Iguana: 8 t a year, a placer camp on `core/hamlet`), or the high placers on
   Basilisk's south shore (790.7,1603.8 and 791.4,1610.1). **Answered** (2026-11-17: *"and add the proposed tin site near iguana"*):
   added `tin: 8000` (`8 t/yr`) to Iguana in `LZ_TUNE` and `IG_REC`, with the `iguana.placer` camp (`core/hamlet`, `focus: 'mine'`)
   and three `lz-placer` washing floors along Muckle Weyt Beck (`r202`) on Iguana's page.
