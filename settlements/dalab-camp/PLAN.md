# The Dalab party's camp at the Grove: a site plan (proposal, 2026-11-16)

The owner, 2026-11-16, answering Kāmp's plan (`settlements/devisers-camp/PLAN.md`, question 6): the Dalab party's camp at
the Grove is **"a small settlement too"**, with its own site record and plan.

What is settled, from the owner, the lore and the sim:
- **The Dalab mission at Thalaba** (30, the owner: "a small Dalab mission here of about 30 people", "dalab style"). Its
  genepriests come over the rim for the hearth trees (`biomes/godshearth/PLAN.md` section 5, canon: the hearth tree is "one of
  the things its genepriests come over the rim for").
- **Its own expedition** (the owner: "they do their own expedition and hire locals"):
  - it works the **Grove**, Godshearth station 2 (836,1388), where the vent lines' discs merge into hearth forest;
  - it **pitches its own camp, apart from the Devisers'**;
  - its haul is hearth seed and specimens, with some wax;
  - the Sultan takes his tenth of it at Thalaba (the owner: "on dalab party too");
  - what the mission keeps goes home to Dalab with the Great Caravan.
- **In the tune** (`core/region/data/xan-tune.js`, `T.dalab.party`, `exp.dalab`):
  - 40 people, px [836,1388], 180 km by road;
  - a make of 40 kg of `hearthseed` and 8 t of wax in the expedition window;
  - the window: the tune's `expedition`, 120-240 (to be turned to the southern summer, 302-57, as Thalaba's page runs it).
- **On Thalaba's page** the party's 40 are real people (`settlements/thalaba/targets/town/89zu-tb-people.js`): 6 genepriests
  and 34 hired townsmen. They muster at Briḍj with the Devisers' and go up the gorge.

Everything below that is not one of those is ***proposed***.

## 1. The site (*proposed*)

The Grove's middle (836,1388) is the hearth forest itself: warm ground on the vent lines, where the trees stand. The camp
belongs at its edge, off the warm discs (the Hearths kit's rule: nothing stands on hot ground, and the discs are 25-60 °C).

| | px | Height | Mean | Rain | Slope | From it |
|---|---|---|---|---|---|---|
| the Grove (station 2) | 836,1388 | 3,740 m | 6 °C | 910 mm | 0.0° | the forest's middle |
| **the camp (proposed)** | **835,1390** | **3,688 m** | 7 °C | 910 mm | 0.8° | 4.5 km south of the Grove's middle |
| the hot lake's shore | | 3,642 m | | | | 8.5 km |
| Kāmp, the Devisers' camp | 839,1398 | 3,625 m | | | | 18 km |

The floor south of the Grove falls gently (3,740 to 3,660 m over 8 km) toward the lake. 835,1390 is the first flat ground
below the forest on the side toward the road. It is 18 km from Kāmp, which is apart but within a day's walk of the road's
end and the river.

**Water.** No river record runs within 16 km of the Grove; the Āirã Siṭrīm leaves the lake 8 km south. The camp needs a source:
*proposed*, a cooled seep at the forest's edge. The hot lake's margins are 40-80 °C, and the outlet river is Kāmp's. This is
question 3.

## 2. Who is there (in the expedition window)

| Who | People | What they do |
|---|---|---|
| **The genepriests** | 6 (the tune's party: 8-10 proposed in Thalaba's plan; the page sends 6) | Choose the trees, take seed and cuttings, keep the specimen book; the rites of the God at the forest's edge |
| **The hired men** | 34, Thalaba's | Porters, diggers, wax-gatherers at dawn, guides; the camp's cooks |

Out of the window the camp is **empty** (*proposed*): the party goes home with its seed. Nothing of value is left to keep, unlike
Kāmp's strongroom. This is question 4.

## 3. The layout (*proposed*, small)

- **A ring of tents** round an open middle: the Tents kit (`kits/tents`) in a plain dress, and a **Dalab dress** for the
  genepriests' own tents (new: the kit's dresses do not include one).
- **The seed store** in the middle: a low rammed-earth hut in Dalab's style (the Dalab set's `dnGranary` form, read in place as
  Thalaba's mission reads it), its door shaded. The seed and cuttings wait there for the road down.
- **The drying frames** for seed heads and cuttings, under shades.
- **A God's post** at the ring's gate, as the Dalab set raises them (`dnGodPost`).
- **The cookfire** and the water jars.
- **A track** north into the Grove, and one south-east to Kāmp and the road.

## 3a. The name (*proposed*)

| Proposed | Meaning |
|---|---|
| **Grōv-Kāmp** | "the Grove camp", in the hired men's coined Xanadui, as Kāmp |
| or a Dalab name | the mission's own word for it (the owner's, or the Dalab culture file's) |

## 4. The economy

- **The make** (the tune): 40 kg of hearth seed and 8 t of hearth wax in the window, from the Grove's trees.
- **The food** comes up with the Devisers' trains to Kāmp and on 18 km by the party's own mules.
- ***Proposed* changes to the tune:**
  - `T.dalab.party.px` to [835,1390];
  - its `km` from 180 to about 150: Thalaba to Kāmp by the gorge (130), then 18 km across the floor.

## 5. Core adoption

The same as Kāmp's (`settlements/devisers-camp/PLAN.md` section 5), smaller:
- **The ground:** the scale model's.
- **The flora:** the Hearths kit's plants read in place; the camp stands at the forest's edge.
- **The tents:** `kits/tents` through `core/camp`.
- **The seed store and the God's post:** the Dalab set's helpers, read in place as Thalaba's page reads them.
- **The people:** on `core/simulation`; the party's 40 are Thalaba's, by id, present in the window.
- **The site record:** in `openworld/SITES.json`, `model: false`.
- **The page:** a target beside Kāmp's on Xanadu's page (the owner chose Xanadu's page for Kāmp).

## 6. Steps

| Step | What | Test |
|---|---|---|
| **D0** | The records: the site row (through the open-world session), the tune's px and km | `test-xan-economy.js` |
| **D1** | The camp laid: the tent ring, the seed store, the frames, the God's post, the tracks | the camp's checks |
| **D2** | The people in the window | the sim's schedules |

## 7. Questions for the owner

1. **The site:** the Grove's southern edge, px **835,1390** (proposed), or elsewhere round the Grove?
2. **The name:** Grōv-Kāmp, or a Dalab name?
3. **The water:** a cooled seep at the forest's edge (proposed), or carried from the outlet river 8 km south?
4. **The winter:** left empty (proposed), or kept like Kāmp?
