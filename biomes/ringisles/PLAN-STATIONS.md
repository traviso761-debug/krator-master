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

## Station 3: the lagoon (`--station lagoon`; asked for by the owner, 2026-11-02)

The kit builds a reef crest 190 m off its island and no closed lagoon. The model (5.1, surveyed 2026-11-02: shallow water
more than 5 km from any land) has one great bank and several small ones:

| Bank (5.1 px) | Awash and shallow | Round it | Where |
|---|---|---|---|
| **1002,779** | **520 km2 under 5 m**, 96 km2 at 5-15 m, 136 at 15-30 m, 544 at 30-100 m | 2,364 km2 of 100-300 m and 884 of 300-900 m in the 70 x 80 km window; 1,056 km2 of XA islands | off the Beast Riders' lee shore: **Talon** (village, px 1026,760) 60 km, **Mav's Refuge** 71 km, Bipo 37 km |
| 952,928 | 152 km2 at ~20 m | 180 m deep round it | the open sea, Fort Vaklu 72 km |
| 928,967 | 144 km2 at ~16 m | 809 m deep round it: the sharpest atoll | Port Tobin 13 km (Iziz's) |
| 760,996 | 144 km2 at ~25 m | 536 m | the Bay of Voth's mouth, Torus 36 km |

- **The site**: the great bank at px 1002,779, a drowned shelf off the lee shore with reef flats awash across 500 km2,
  islands of hypertropic jungle standing out of it, and deep water at its outer edge: a **barrier reef and lagoon**
  complex (the Great Barrier Reef's inner lagoon, the Tuamotus' atolls for the small banks). The station is a cut of it:
  a lagoon 8-10 km across inside a reef rim awash at the sea's level, two or three motu with the kit's dry forest and
  coconut-like palms (the kit's borrowed trees), a pass through the rim where the swell breaks, the lagoon floor of sand,
  seagrass (`ground.lagoon.seagrass`) and coral heads under 2-25 m of clear water, the shelf's XA islands on the horizon
  and the lee shore's hypertree wall behind them.
- **The water**: `core/water`'s open sea with its **bed** (the lagoon's depth grid), the shore grid on the rim and the
  motu (shoaling, breakers on the reef, surf foam, the wet sand twin), the lagoon's own calm share of the wave field
  inside the rim (as Reed Lake takes a calm share), the pass's current as a `flow`; the tide the Ring Sea has
  (`WATER.tide`), which here is what wets and bares the reef flat twice a day.
- **Hazard and reward**: the reef (`slip`, `thorn`: coral cuts; the pass's current, `move`), the ring shark (`kits/fauna`,
  planned: `hunter`), the lagoon's depth for the unadapted; the Islanders' and the Riders' fisheries, the pearl beds
  (the Hykkousoi's trade in `biomes/deeps`'s plan), the reef's lime (Farside's coral lime, `kits/crops`), a wreck on the
  outer rim (the Ring Sea's fleets lose ships here: `kits/ringsea`'s hulls as wrecks on the reef, the Deeps' sunk dress).
- **People**: the Beast Riders' Talon and Mav's Refuge on the lee shore, Bipo; the Islanders' outrigger fishing on the
  lagoon (their vessels, `kits/ringsea`); a fish camp on a motu as a published site. The bank's owner polygon on the model
  is `savage hyperjungle` (the lee shore's), not `Ring Sea`: the station is this kit's by its ground (the sea), and the
  hyperjungle's PLAN-LANDS is told.
- **The core**: nothing new; the sea's bed, shore grid and tide exist. The lagoon floor seen through clear water from
  above is the open water's depth tint on the bed (the Port kit's and Ys's way); the Deeps' underwater preset, if built,
  would let a camera go under the rim.

## Order

With the isle demo's next phase, if the towns need their hinterland; otherwise after the larger biomes' stations. **Station
3** after station 2, or before it if the Deeps' sea work lands first (its shore grid and bed are the same code).
