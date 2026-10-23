# paintedhighlands: the plan (draft, 2026-10-23)

The **painted highlands**: the high plateau west of Korona, between the eastern Inner Wall and Korona's rings. Bare
hills banded red, ochre, cream, mauve, green-grey and teal, and every spring, after the snowmelt, flats and slopes of
wildflowers in drifts of colour. The Painted Men's country.

Owner's brief (2026-10-23): the plateau by Korona is a new biome, the painted highlands, with spectacular bands of
exposed rock and colourful wildflowers.

**Status: plan, awaiting the owner.** Nothing built.

## 0. What the kit is

| | |
|---|---|
| Folder | `biomes/paintedhighlands/` (the usual kit layout) |
| Pages | stations: `dist/paintedhighlands.html` (the stripe badlands), `-bloom`, `-canyon` (section 4) |
| Core | the biome core, `core/host`, `core/rand`, `core/mask`, `core/tags`, `core/terrain`, the shared sky |
| New in core | not a new module: the existing bedded-rock shader moved into `core/terrain` and upgraded with recipes (`badland`, `danxia`), formations, folds and `S.at` (`core/terrain/STRATA-PLAN.md`), which ebadlands, sedesert and Korona share |
| Read in place | `biomes/korona` at its western edge; `biomes/ehighlands` station 1's cushions on the highest ground |
| Object | `PAINTED` on the `BIOME-API.md` contract |

## 1. The ground (4.21, surveyed 2026-10-23)

61,700 km² (px 634-915 by 202-349; the polygon called `e highlands` on 2026-10-23, to be renamed). Median 3.4 km, about
1.0 atm, about 170 mm of rain, BSk 44% and Dsb 25%: **a cold steppe with dry summers**, so the snow falls in winter and
melts in spring. No rivers on the model; two small lakes (136 km²).

| Band | km² | Rain | Mean (warm/cold) | Climate |
|---|---|---|---|---|
| The flank, under 2.5 km | 9k | ~490 mm | +16 (28/5) | Cfa 47%, BSk, BWk: the edge toward the crater and Korona |
| 2.5-3.2 km | 16k | ~220 mm | +12 (24/0) | BSk 56% |
| 3.2-3.7 km | 21k | ~170 mm | +8 (21/-4) | BSk 51%, Dsb 33% |
| Over 3.7 km | 15k | ~125 mm | +6 (18/-7) | Dsb 52%, BSk 34% |

- **Why the rock stays bare.** At under 300 mm plants never close over a slope, so the beds stay exposed, as at China's
  Zhangye (Rainbow Mountains, about 200 mm) and Oregon's Painted Hills (about 300 mm).
- **Why the bloom.** Dry summers and winter snow give a spring flush on the melt, the pattern of every real superbloom.
- **Relief.** 17% of the plateau is over 8% slope at the model's 4 km scale; the dissected edges become badlands at 1:1.
- **People.** 80% is the Painted Men's (`LORE.md` §6.5); 9% Nomad Country.

## 2. The rock

- **The strata field**: beds a few metres to tens of metres thick, coloured by what they are (iron red, ochre, cream ash,
  mauve and green-grey clays, a rare teal copper bed), tilted and gently folded so ridges and hills show stripes, and
  rounded into popcorn-clay hills where the clay swells (`ground.clay.popcorn` is in the library).
- **Cover**: bare on slopes, softening to green and gold where plants close over the flats; the stripes show through
  thin cover.
- **Landforms**: rounded badland hills, banded ridges and fins, a canyon cut through the full stack, and dry washes.

## 3. The flowers and the steppe

The **bloom** follows the world clock: a green flush in early spring, the flowers in drifts by soil (each bed's clay
favours its own flowers, so the drifts echo the stripes), seed and straw by late summer, snow in winter. Earth models,
renamed as each kit does: lupins and penstemons (Great Basin), globe mallow, paintbrush, blazing star, desert
dandelion, evening primrose, Namaqualand's daisies, the Atacama's pata de guanaco. Between them: bunchgrass steppe,
sagebrush and rabbitbrush, junipers on the rims, cushions from `ehighlands` on the highest ground.

**One fruit, one staple, one medicine** from the kit's flora, wired into `kits/crops` (a `paintedhighlands` entry:
`atm: 1`, zones `steppe`, `bloom`, `rim`).

**The Painted Men's pigments come from these rocks.** Mineral dyes for `kits/crops` (and DYES.md, which gives the Painted
Men black, red and teal): manganese black, iron red (beside the existing `falu-red`), and a teal from the copper bed
(celadonite or malachite; `rock.malachite` is in the library).

## 4. Stations

1. **The stripe badlands**: rounded banded hills and a ridge of fins, the bloom in the washes.
2. **The bloom flats**: a broad flat in full spring flower against a banded scarp.
3. **The banded canyon**: a canyon cut through the whole stack of beds, the colours deepest on its walls.

## 5. Textures

In the library: `ground.clay.popcorn`, `rock.sandstone.bedded.red`, `ground.playa.red`, `rock.gossan`, `rock.malachite`,
`ground.steppe`, `card.grass.dry`. To source or generate (prompts first): banded badland rock tiles in the bed colours (or
one greyscale bedded tile tinted by the strata field: cheaper and preferred), and flower cards for the bloom.

**The prompts**: `core/materials/PROMPTS-NEEDED.md` section 9 (2026-10-23).

## 6. Order of work

- **P0.** The owner approves; the polygon renamed; the station sites chosen from the model; texture prompts written.
- **P1.** The strata upgrade's S1-S3 (`core/terrain/STRATA-PLAN.md`) if not done already, and station 1's ground on it.
- **P2.** The steppe, the bloom and its clock.
- **P3.** The crops and dyes.
- **P4.** Stations 2 and 3.
- **P5.** `verify.py --assert`, `PORT.md`, the gallery (a new biome).
