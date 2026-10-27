# ringisles: the high isle (plan, 2026-10-26)

The kit draws one synthetic island of about 3.4 x 2 km, with a windward mountain of ~190 m: every class of the isle demo's
land in miniature, as soft weights. On the model the isles' land rises about a kilometre over the sea (p95 -474 m over a
sea at -1,500 m), and a third of it is upland the showcase has no room for. One station adds it. The page as built stays
station 1. Stations follow the Throne's and Korona's pattern (`stations/<name>/`, `python3 build.py --station <name>`).

**Status: plan, awaiting the owner.**

## The ground (scale model 4.23, surveyed 2026-10-26: `tools/scale-model/survey_biomes.py`, region `isle demo`)

26,948 km² (9,796 land). Heights p5 / median / p95: -1,471 / -1,124 / -474 m. Eight vents.

| Climate | km² | Height | Pressure | Rain | Mean (warm/cold) | Centre px |
|---|---|---|---|---|---|---|
| XA | 2.4k | ~-1,320 m | 1.89 | ~1,900 mm | +32 (36/28) | (680,421) |
| **Af** | **2.0k** | **~-840 m (-1,160 .. -520)** | **1.77** | **~1,900 mm** | **+29 (35/24)** | **(670,432)** |
| Aw | 1.8k | ~-1,020 m | 1.81 | ~890 mm | +31 (36/25) | (678,399) |
| XV | 1.5k | ~-1,290 m | 1.88 | ~970 mm | +32 (36/28) | (668,404) |
| **BSh** | **0.8k** | **~-730 m (-1,120 .. -330)** | **1.74** | **~800 mm** | **+30 (35/24)** | **(668,425)** |
| XS | 0.6k | ~-1,340 m | 1.89 | ~770 mm | +32 (36/28) | (668,421) |
| **Am** | **0.6k** | **~-935 m** | **1.79** | **~1,500 mm** | **+30 (36/24)** | **(670,443)** |

By height: below -1,000 m, 6,548 km² (XA 36%, XV 22%, Aw 15%); **-1,000 to 0 m, 3,248 km² (Af 43%, Aw 25%, BSh 18%,
Am 12%)**: the upland, up to ~1 km over the sea.

## Station 2: the high isle (`--station high`)

**Earth basis:** the high islands of Polynesia and Hawai'i (windward cloud forest, leeward dry forest), Sumba's and
Timor's hills for the Kautoan side.

- **A volcanic isle rising ~1 km:** the windward slopes under rainforest to the crest (Af, ~1,900 mm), with cloud forest
  on the top few hundred metres (`core/atmos` fog belt), streams in steep valleys with falls (`core/water` falls and
  chutes), the amphitheatre-headed valleys of an eroded shield.
- **The leeward side dry:** hot steppe and dry forest (BSh, ~800 mm, at -730 m), the burn mosaic on it, the rain shadow a
  sharp line across the crest.
- **Monsoon forest (Am)** on the transition, and the kit's coffee and clove gardens terraced into its slopes (they are
  upland crops).
- **The flora:** the kit's borrowed trees as station 1 has them, the forest's canopy kept at island scale (the kit's cap
  at 42 m holds).

**The core:** fog belt, falls, `KSTRATA` on the valley walls, the burn mosaic (the kit's own), seasons. The universal set
as in `BACKPORT.md`.

## Order

With the isle demo's next phase, if the towns need their hinterland; otherwise after the larger biomes' stations.
