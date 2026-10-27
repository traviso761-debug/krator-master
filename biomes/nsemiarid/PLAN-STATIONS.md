# nsemiarid: the high country (plan, 2026-10-26)

The kit draws the basin round the drained dam lakes: hot steppe, the lake beds' desert, the Mediterranean foothills, the
rainy uplands and the tropical lake margins. The polygon also rises over 3 km along its southern and western edges, into
dry-summer montane country the kit does not draw. One station adds it. The page as built stays station 1. Stations follow
the Throne's and Korona's pattern (`stations/<name>/`, `python3 build.py --station <name>`).

**Status: plan, awaiting the owner.**

## The ground (scale model 4.23, surveyed 2026-10-26: `tools/scale-model/survey_biomes.py`)

`n semiarid`: 183,144 km² (158,804 land). Heights p5 / median / p95: 220 / 939 / 3,611 m.

| Climate | km² | Height | Pressure | Rain | Mean (warm/cold) | Centre px | Drawn today? |
|---|---|---|---|---|---|---|---|
| BSh | 73k | ~850 m | 1.44 | ~345 mm | +23 (31/15) | (413,138) | yes: the steppe |
| Csa | 25k | ~930 m | 1.42 | ~675 mm | +23 (31/14) | (403,139) | yes: the foothills |
| Cfa | 19k | ~1.3 km | 1.36 | ~1,400 mm | +21 (29/12) | (479,143) | yes: the rainy uplands |
| BWh | 12k | ~940 m | 1.42 | ~200 mm | +23 (31/16) | (539,82) | yes: the old lake beds |
| **Dsb** | **7.9k** | **~3.7 km** | **1.01** | **~410 mm** | **+8 (20/-5)** | **(364,171)** | **no** |
| Aw, Af, WS | 11.6k | ~350 m | 1.53 | 850-1,900 mm | +25 | (434,117) | yes: the lake margins |
| **Csb** | **3.2k** | **~3.5 km** | **1.04** | **~390 mm** | **+9 (21/-3)** | **(415,156)** | **no** |
| BSk | 2.0k | ~2.7 km | 1.14 | ~250 mm | +14 (25/4) | (461,135) | no |
| **Dfb** | **2.0k** | **~3.7 km** | **1.01** | **~630 mm** | **+8 (20/-4)** | **(450,141)** | **no** |

By height: 3,000-3,500 m holds 7,400 km² (Csb 28%, Cfa 24%, Csa 23%, Cfb 13%); 3,500-4,000 m holds 11,548 km²
(Dsb 68%, Dfb 17%, Csb 10%). About 19,000 km² in all, at about 1 atm, ~420 mm, +8 to +10 °C.

## Station 2: the high country (`--station high`)

**Earth basis:** the eastern Sierra Nevada and the Great Basin ranges, the Elburz's dry side, the Tian Shan's outer
ranges. This is a dry, cold-winter montane: about 1 atm (Earth's sea level), so it is the one place in the region where
Earth's plant sizes hold.

- **Open pine and juniper park** over bunchgrass and sagebrush-like shrub (Dsb), the trees in clumps on north faces
  (here the sunny side is north: Krator is near 40°S, so the shaded faces face south and hold the snow).
- **Fir and aspen-like groves** in the draws where the Dfb rain gathers (~630 mm at (450,141)): the wetter fringe.
- **Csb oak scrub and chaparral** on the lower slopes at 3-3.5 km, under the conifers.
- **A cool steppe (BSk)** on the leeward benches near (461,135): the steppe's highest form.
- **The ground:** granite domes and slabs, talus, snowbeds that last into summer, a few small tarns.

**Kin, not copies.** nhighlands' planned station 2 (its dry-summer montane, Dsb and Csb, 69k km²) is the same climate
across the border. The two stations share their trees as relatives (`BIO.kin`), not as one copied species: this side is
drier (410 mm against nhighlands' ~500-800), so smaller, sparser and more juniper. Whichever station is built first sets
the trees; the other takes kin of them.

**The core:** the dry-summer half of the fire mosaic (`KFIRE`, low-intensity ground fires), `KSTRATA` and talus on the
range faces, snow cover with `lee`, seasons (`core/clock`: the aspens' autumn, the snowline). The universal set as in
`BACKPORT.md`.

## Order

After nhighlands' station 2, so the trees are written once and this side takes kin of them.
