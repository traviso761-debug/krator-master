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
2. **Use the target as it is** (its builder re-aimed and re-grounded, on its own page) **or redraw it from records** as Ledge was?
3. **Rename the target** `kits/ancients/targets/ledge` to `shelf` (the kit's sheet and its view names), or leave the folder as is
   with this designation noted?
