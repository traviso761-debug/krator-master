# ehighlands: the two stations (plan, 2026-10-23)

Owner's decision (2026-10-23): the eastern highlands kit goes back to the eastern Inner Wall, where it began. **Station 1**
is the kit as built, on the wall's **dry** side; **station 2** is new, the **wet** face. The plateau by Korona that the
`e highlands` polygon covered on 2026-10-23 becomes a new biome, the painted highlands (`biomes/paintedhighlands/PLAN.md`).

**Status: plan, awaiting the owner.** This file sits beside the kit's own docs because the kit has another session's
work in progress; it is folded into `NOTES.md` when that lands.

## 0. The polygons

On the scale model the kit's ground is the polygon now called **`e inner wall`** (106,000 km², px 674-929 by 361-755).
Proposed renames (the owner's to make, or to ask for): `e inner wall` > **`e highlands`**, and the plateau's `e highlands`
> **`painted highlands`**. The wall's crest splits the two stations: each row of the polygon is cut at its highest cell.

## 1. The ground (4.21, surveyed 2026-10-23)

| | Station 1: the dry side (crest and east) | Station 2: the wet face (west) |
|---|---|---|
| Area | 56,000 km² | 50,000 km² |
| Height | median 3.4 km | 0.6 to 4.7 km |
| Rain | about 170 mm | 250 to 3,400 mm, falling with height |
| Climate | BSk 43%, Dfb 19%, BWk 9%, Dfc 9% | Dfb 45%, Cfa 21%, Dfc 17% |
| Peoples | Nomad Country (the Eastern Nomads) | the Empire of Iziz (38% of the polygon) |

**The wet face is the windward one**: air off the inner crater rises up it and drops its rain; the dry side is its
shadow. The face's belts:

| Belt | km² | Rain | Mean (warm/cold) | Air | Climate | What grows |
|---|---|---|---|---|---|---|
| Foot, under 2 km | 11k | ~2,400 mm | +17 to +22 (27-31 / 7-14) | 1.3-1.5 atm | Cfa 77%, Cwa | montane rainforest and cloud forest; the wettest ground (11,000 km² over 2,000 mm, round px 789,614 at ~1.2 km) above the se savannah rim |
| 2-3 km | 7.5k | ~940 mm | +12 (24/0) | 1.16 | Dfb, Cfa | mixed broadleaf forest |
| 3-4 km | 18.5k | ~630 mm | +6 (19/-7) | 1.02 | Dfb 80% | montane conifer and broadleaf: the largest belt |
| Over 4 km | 13.5k | ~300 mm | +1 (14/-12) | 0.91 | Dfc, ET | spruce-fir to krummholz under the crest |

Rivers off the face: Rrivar Falz (135 m³/s), Rrivar Isguifta (126), Rrivar Grin (111), Rrivar Loña (74).

## 2. Station 1: the dry side (the kit as built)

- **Re-site it on the crest's lee** (over 4.5 km: 6,500 km², ~110 mm, ET and Dsc, warm month +12, 0.86 atm), the band
  nearest the kit's cold cushion plateau. Below it the dry side is BSk steppe at 2.5-4.5 km (~200 mm), then cold desert.
- **The air note changes.** The kit was written for ~0.6 atm; the crest reads about 0.86. Nothing in the look depends on
  thin air (the cushions answer the cold, the dry and the wind), so `NOTES.md` and the kit's inspector words are
  rewritten, and the `kits/crops` entry `ehighlands` goes from `atm: 0` to `atm: 1`.
- **The geyser field** stays only if the model backs it: the polygon holds one vent (`DATA.vents`); E0 checks which side.

## 3. Station 2: the wet face (new, `dist/ehighlands-face.html`)

A forest that climbs the face, every belt still **growing toward the giant**, the kit's theme: crowns lean one way,
bracts and leaves turn to the gas giant, epiphytes and mosses grow thickest on the giant-facing side of each trunk, so
from below the forest looks combed toward one point in the sky.

- **The foot's cloud forest**: tree ferns, broadleaf evergreens heavy with moss, a cloud bank standing at the belt's top
  most mornings; the giant-facing epiphyte gardens. Own species (the kit has none for this belt).
- **The mixed belt and the montane belt**: broadleaf and conifer together; `biomes/nhighlands`' spruces and cedars read
  in place for the conifers, with a "toward the giant" lean applied; own broadleaves.
- **Under the crest**: spruce-fir thinning to krummholz, and the first cushions of station 1 coming over the crest.
- Rivers in gorges with falls down the face (the core's `waterH`, as nhighlands' stream).

## 4. Crops

`kits/crops` `ehighlands` gains a `forest` zone (warmth [1, 3], arid [3, 4]) and a `cloud` zone (warmth [2, 3], arid [4,
4], wet). One fruit, one staple and one medicine from station 2's own flora, as every newer kit (to be chosen with the
species).

## 5. Order of work

- **E0.** The owner renames the polygons (or asks); the two sites are chosen from the model; the vent checked.
- **E1.** Station 1 re-sited: the air note, the crops entry, the inspector's words; the build rebuilt and verified.
- **E2.** Station 2's ground: the belts from height and rain, the gorges.
- **E3.** Station 2's flora, with texture prompts written first (`core/materials/PROMPTS-NEEDED.md`).
- **E4.** `verify.py --assert` for both pages, `PORT.md`, the gallery (a fix to one kit republishes only its files).
