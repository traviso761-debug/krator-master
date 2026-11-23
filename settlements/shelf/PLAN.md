# Shelf: the site, and the Ancients' cliff-city target designated for it (draft, 2026-11-17)

**The owner, 2026-11-17:** "since we didn't use Ledge as originally designed can we designate it for Shelf on the opposite end of
the line? let's find a good spot for it". This file records the designation and the spot. It is not Shelf's plan; nothing is built.

Marks: ***proposed*** is invented here and waits for the owner; the rest is quoted from the source named in the line.

## 1. What Shelf is (the sources)

| Source | What it says |
|---|---|
| `biomes/line/PLAN.md` (branch `claude/loj-twenny-059a5e`) | Station **2, Shelf, the north mouth**: Dalab's plain is far below the bore's level, so the Line goes underground low and climbs inside the Wall on spiral ramps; "the climbing spirals are in the impact breccia under Shelf (the arcology at 461,1161, 6 km off): **Shelf was the Line's northern station town**". The owner accepted the north approach ("spirals under Shelf") |
| `openworld/ANCIENT-NETWORK.md` | Dalab to Shelf 99 km (18 km of it the spirals' tunnel); Shelf to the north portal 7 km; Dalab's road climbs past Shelf; Shelf is on Dalab's dirt roads (Dalab, Daranch, Blade, Span, Shelf) |
| `openworld/RESOURCES-SETTLEMENTS.md` | Shelf: arcology, **Dalab Council**, 5.1 px **461,1161**; Dsb, 3 °C mean, 533 mm, 1.00 atm; iron 71, tin 16, gold 5 in reach |
| `kits/ancients/targets/ledge` (`src/89i-ledge.js`, 2026-09) | **The Ledge**: 34 pale slab layers cantilevered off an 850 m sandstone escarpment as an inverted ziggurat (the lowest layer 150 m over the plain, the top decks overhanging 330 m, a great prow 460 m, the top deck flush with the plateau), a 2 km straight front, lift cores on the face, a settlement at the foot; intact and ruined. Built before the lore, for a desert cliff facing west "toward the sun" |

Ledge itself did not take the target (`settlements/ledge/PLAN.md` 9.1: it is the wrong size and faces the wrong way for a 1,265 m
face over the lake, and Ledge draws its shell from records). Shelf fits it far better.

## 2. The spot (measured on scale model 5.1)

Read from `tools/scale-model/model/data/h.png` (heights decoded as `smodel` does) and `c.png`, bilinear between the 2 km cells.

- **The Outer Wall's north escarpment runs NW-SE through Shelf's pin** and falls ~2,300 m from the Wall's top to Dalab's plain:
  through 461,1161 along its fall line, 3,759 m at the pin, 3,393 m 2 km out, 2,883 m at 4 km, 2,001 m at 7 km, 1,472 m at 10 km, and
  the plain at ~1,200-1,300 m beyond. Its steepest band (2-7 km out) is ~28 %; the model's 2 km cells smear any real cliff into that
  slope, so the drawn ground cuts the cliff (as riftrim does at Ledge).
- **It faces azimuth 35 degrees (north-east)**, the same within a few degrees for 6 km along it (35-44 degrees at four pins). Krator's
  setting is ~40 deg S (`climate.json`), so the sun stands in the north: **a north-east face looks toward the sun**, which is what
  "facing west, toward the sun" meant for the target. Turning the target 125 degrees keeps its intent.
- **It is straight**: along the strike the edge holds 3,497-3,531 m for 3 km, the ground 1 km behind it 3,676-3,694 m, and 4 km out
  2,410-2,435 m at every sample. The target's 1,640 m straight front and its rounded ends fit inside.

**The spot (settled: the owner, 2026-11-17, "Yes, use it"): the face's centre at 5.1 px 461.43,1160.39**, 1.5 km down the fall line from the pin, its front running
305-125 degrees (NW-SE) and facing 35 degrees:

| | Height | Note |
|---|---|---|
| The plateau (the cliff top, the top deck flush with it) | **~3,680 m** | the Wall's top 1 km behind the edge; the pin (461,1161, 3,759 m) stays the arcology's head on it |
| The cliff | **850 m**, as the target has it | cut into the model's slope by the drawn ground |
| The shelf at its foot (the target's 2 km town-and-plain apron) | **~2,830 m**, 2 km deep | the model has 3,024 m 2 km out and 2,434 m 4 km out: the cut and the fill roughly balance. **The shelf is the place's name**: the bench the city hangs over |
| The lower escarpment | ~2,800 m down to ~1,500 m over the next 6-7 km | the Line's spirals climb inside it |
| Dalab's plain | ~1,100-1,300 m | the view: Dalab 111 km away at azimuth 17 degrees, nearly straight out from the face |

So: **the station on the plateau**, at the top deck (the spirals' head; the bore runs on 7 km north-west along the Wall's top to the
north portal, 458,1159, 3,845 m); **the city hung down the cliff**; **the shelf town at its foot**, where Dalab's road climbs past.

## 3. What changes in the target for Shelf (*proposed*)

- **Re-aimed**: its face from west to 35 degrees (a turn of the site group; the builder is unchanged).
- **Its ground**: the target's own desert massif and plain give way to Shelf's (a plateau, the 850 m cut face, the shelf, the lower
  escarpment falling off its far edge), as Ledge's page draws its own.
- **The rock**: the Line plan puts **impact breccia** under Shelf; the target's sandstone with strata would read as breccia (KSTRATA's
  `megabreccia` or the `rift-basement` recipe), and the census's **Dsb** (3 °C, 533 mm, snow in winter) makes the foot a cold dry steppe,
  not the target's hot desert with a little green.
- **Its state**: the target has an intact and a ruined decay; Shelf is held by the Dalab Council today, so a decay of its own (Dalab
  in the sound decks, as at Ledge and Span) is the plan's to decide.
- **Its records**: like Ledge, Shelf would want its decks as records keyed by id for the tags, the census and the ruin (or the target
  ported onto the same record form); question 2 below.

## 4. Questions for the owner

1. ~~**The spot**~~: **settled** (2026-11-17): the face at 461.43,1160.39, facing 35 degrees, the station on the plateau and the town on the shelf below.
2. ~~**Use the target as it is or redraw it**~~: **settled** (the owner, 2026-11-22: "Rebuild from records"): section 5.
3. ~~**Rename the target**~~: **settled** (the owner, 2026-11-22, "Rename it"): `kits/ancients/targets/shelf` (its page `dist/shelf.html`, title and hero view "Shelf", the gallery's `arc-shelf`); its builder file `src/89i-ledge.js` keeps its name, because every kit page carries it. Was: rename the folder, or leave the folder as is
   with this designation noted?

## 5. The build: Shelf from records (the owner, 2026-11-22: "Rebuild from records")

Everything here is *proposed* unless section 2 or the owner's answers fix it. The layout (`src/30-shelf-layout.js`) is the one source;
`AREAS.md` and `floors/` are drawn from it; `test-shelf.js` checks it.

### 5.1 The records are the kit's, not Shelf's own

Ledge's stack records and builder were lifted into `kits/ancients/cliff/` (`KCLIFF`: `10-cliff-stack.js` the records, `20-cliff-stack-draw.js`
the builder), and Ledge moved onto them unchanged (its layout, area and census identical; its shell's geometry identical, hashed on the page).
Shelf takes the same module: the target's form drawn from Shelf's own deck records.

### 5.2 The frame and the ground

- **Frame**: x along the face (toward azimuth 125, the south-east end), z out of it (toward 35, Dalab's plain), y above sea level; origin on
  the face line at 5.1 px 461.43,1160.39.
- **The plateau** (`SHELF.groundAt`): flat at **3,680 m** for 300 m behind the edge (the Ancients' cut, the station's yard), then rising
  as the Wall does (3,759 m at the pin 1.5 km back, toward ~4,200 m 6 km back).
- **The face**: dressed sheer for 2,200 m (|x| < 1,100); beyond, the natural breccia cliff.
- **The shelf**: flat at **2,830 m** for 300 m out (the Ancients' apron), falling gently to 2,780 m at its edge 2 km out.
- **The lower escarpment** from the shelf's edge down to Dalab's plain at ~1,450 m, 8.5 km out, and the plain on to 1,200 m.
- The rock is KSTRATA's `secondary-ejecta` (impact breccia); the library's megabreccia on the natural faces, the drill-marked cut on the
  dressed ones, steppe on the flats (Dsb: 3 deg C, 533 mm), gravel on the screes.

### 5.3 The shell (the target's numbers at Shelf)

34 layers, floors at 2,980 + 21.2 k (the lowest 150 m over the shelf, the top flush with the plateau at 3,680 m); a layer a 4 m slab, three
4.5 m storeys and a 3.7 m plenum; 600 m along the face at the bottom to 1,500 m at the top; 40 m out at the bottom to 330 m at the top, the
prow (the centre wing from layer 20) to 460 m; seven wings (W3-W1, C, E1-E3). `AREAS.md` says the floor.

### 5.4 The levels, the people and the ruin

| Zone | Layers | What | People |
|---|---|---|---|
| **Z0 The plateau** | on the cut at 3,680 m | **the station** (the Line's north mouth: its platforms in the rock behind the top deck, the spirals below them), the caravan terminus (Dalab's road and the Great Caravan: salt, iron, wine and pearls), the fort, customs, the warehouses, Dalab's town and mound; the station's Tungangs (its loj, name open) | 2,500 (Dalab 2,200, Tungangs 300) |
| **Z1 The upper decks** | 27-33 | the governor's house, the genepriests, the rich, either side of the gash | 1,500 |
| **Z2 The middle decks** | 14-26 | the town on the decks: trades, homes, inns; the pancaked wing (W3, 20-26 onto 19) | 3,000 |
| **Z3 The lower decks** | 0-13 | the sheared layers at the south-east end (E3 and E2, 12-18 reaching into Z2), the rest dead or sealed but the lowest, the poor's | 800 |
| **Z4 The shelf** | on the bench at 2,830 m | the shelf town: carters, the caravans' yards, the salt and iron trades, barley and sheep; a Travellers' halting place; the prow's wreck across its middle; a rockfall at the south-east end | 2,200 (Dalab 1,900, Fellgang Travellers 300) |

**10,000** in all (the West Rift scope's "Shelf 10,000 by type"). **The ruin** is the target's decay 1: the prow (C, 20-33) fell across the
shelf town and tore the gash (C 14-19 sheared; W1 and E1 26-33 damaged); seven layers at the south-east end sheared at the rock line; a wing
at the north-west end pancaked; a rockfall south-east of the city. The rule: the broken decks 30-50 % of the floor (Shelf is held and
mended, less ruined than Ledge).

**The lifts**: two great lifts in the rock (plateau to shelf, 850 m; vehicle cars as at Ledge), both running; four face cores, two running.
**The Line** comes up the spirals (a helix of 4 % inside the Wall, from its low portal on Dalab's plain) to the station at 3,680 m.
**Dalab's road** climbs the lower escarpment to the shelf and, at its north-west end, the Ancients' road tunnel up the Wall to the plateau (2026-11-22: the cut ramp it replaced was 850 m of cliff in 260 m).

### 5.5 Core adoption (written before the first fragment, 2026-11-22)

As Ledge's (`settlements/ledge/PLAN.md`, "Core adoption"), started from Ledge: `core/rand`, `core/tags`, `core/space`, `core/terrain`
(KSTRATA `secondary-ejecta`, KRUBBLE for the prow's and the rockfall's heaps), `core/ruins` (the shell, the wreck), `core/atmos` (the
shared sky at Shelf's place, 1.00 atm), `core/host` FULL, `core/drawn`, `core/materials` (`materials.json`), the Dalab set read in
place, the Fellgang set (`TG`) for the Travellers; `kits/ancients/cliff` (KCLIFF) for the shell. Not taken: `core/water` (no water on
the page: the shelf is dry), `core/city` and `core/simulation` (as Ledge), `core/walk`, `core/biome` (the steppe's flora: owed),
`core/lod`, `KCARVE` / `KCAVERN` (the station, the spirals and the shafts are inside the rock: owed with interiors), the `tg` set.

### 5.6 Built (2026-11-22)

The layout (238 decks, 360 parts), its 23 checks and their negatives (`test-shelf.js`: 57 pass), the sheets and `AREAS.md` (**7.7 million
m2** at the Ancients' peak, ~110,000 people then; **32.9 %** broken; 10,000 today), and `dist/shelf.html`, GPU-verified (`KRATOR_GL=gpu`,
the rtx lane): every page check and negative, the ruin watches (the shell, the wreck), samplers and the eye on the drawn ground in 12 views.
Owed: `KNOWN_ISSUES.md`. Question 3 settled 2026-11-22 (the target renamed `shelf`).
