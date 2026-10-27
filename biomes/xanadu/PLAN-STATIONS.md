# xanadu: the ranges and the descent (plan, 2026-10-26)

The kit draws the Vale of Xanadu: the enclosed lake, its south shore, the sacred river from its chasm, oceanic and
Mediterranean at once. The model's `xanadu` biome polygon (128,856 km²) is three times the vale (`Vale of Xanadu`,
41,052 km²) and runs from the abyssal floor at -1,400 m to ice over 6 km. Three stations add what the kit does not draw.
The page as built stays station 1. Stations follow the Throne's and Korona's pattern (`stations/<name>/`,
`python3 build.py --station <name>`).

**Status: plan, awaiting the owner.**

## The ground (scale model 4.23, surveyed 2026-10-26: `tools/scale-model/survey_biomes.py`)

`xanadu`: 104,708 km² land, 24,148 water. Heights p5 / median / p95: -1,037 / +1,329 / +5,794 m. The vale itself is Csa
55%, Cfa 33%, Csb 9%, Cfb 2%, from -540 m to 1,700 m: what the kit draws.

| Climate | km² | Height | Pressure | Rain | Mean (warm/cold) | Centre px | Drawn today? |
|---|---|---|---|---|---|---|---|
| Csa | 23.3k | ~50 m | 1.59 | ~565 mm | +21 (28/14) | (580,1187) | yes: the vale |
| **ET** | **22.5k** | **~5.2 km** | **0.83** | **~220 mm** | **-7 (5/-20)** | **(662,1205)** | **no** |
| Cfa | 20.6k | ~300 m | 1.55 | ~785 mm | +20 (27/13) | (626,1216) | yes: the vale |
| Csb | 7.3k | ~1.8 km | 1.27 | ~330 mm | +12 (21/4) | (585,1168) | the vale's upper edge |
| **Dsc** | **4.6k** | **~3.9 km** | **0.98** | **~330 mm** | **0 (12/-12)** | **(638,1196)** | **no** |
| **Cfb** | **3.8k** | **~2.2 km** | **1.21** | **~1,300 mm** | **+11 (19/3)** | **(669,1263)** | **no** |
| **Dfc** | **3.6k** | **~3.8 km** | **1.00** | **~830 mm** | **+2 (13/-9)** | **(694,1274)** | **no** |
| Aw, Af, BSh | 7.5k | ~-750 m | 1.75 | 360-2,400 mm | +25 | (631-664,1247-1276) | no |
| BSk | 2.6k | ~1.7 km | 1.29 | ~280 mm | +13 (22/4) | (615,1189) | no |
| **EF** | **1.9k** | **~6.3 km** | **0.73** | **~110 mm** | **-14 (-1/-27)** | **(666,1166)** | **no** |
| **XA, XS** | **3.1k** | **~-1,400 m** | **1.91** | **470-2,260 mm** | **+28** | **(669-676,1255-1271)** | **no** |
| Dsb | 1.2k | ~3.1 km | 1.09 | ~360 mm | +6 (17/-6) | (557,1162) | no |

By height: 2,000-3,000 m, 6,600 km² (Csb, Cfb, BSk, Dsb); 3,000-4,000 m, 6,700 km² (Dsc, Dfc, Dsb); 4,000-6,000 m,
24,300 km² (ET 85%); over 6,000 m, 3,300 km² (EF 58%, ET 42%). Below -1,000 m, 5,700 km² (XA 29%, XS 24%, XV 14%).

## Station 2: the cloud slopes (`--station cloud`)

**Cfb at (669,1263)**, ~2.2 km, ~1,300 mm against the vale's ~500: the windward slopes south-east of the vale, the
oceanic half of the brief at full strength. Mossy evergreen forest in fog (`core/atmos` fog belt), the kit's violet
flowering trees as kin (the lotus trumpet and the haze blossom grown into cloud-forest forms), tree ferns, epiphyte
loads. Above them, Csb and BSk on the drier leeward shoulders: the garrigue and terraces the kit's notes promise ("a second
pass on the uplands").

## Station 3: the high ranges (`--station ranges`)

**3-6.5 km**, the ranges round the vale: the largest ground in the polygon (ET 22,452 km² alone). Two belts:
- **The conifer belt (Dsc, Dfc, Dsb; 3-4 km, ~1 atm):** dry-summer subalpine woodland on the vale side (Dsc, ~330 mm),
  wetter boreal forest on the south-east (Dfc, ~830 mm). A Xanadu conifer, in the kit's colours: the agate tree's banding
  carried into a pine's bark.
- **The alpine (ET, 4-6 km, ~0.8 atm) and the ice (EF, over 6.2 km):** fell-field, cushion plants, talus and snowbeds,
  glaciers under the summits (`core/water` ice; `KSTRATA` and talus on the faces; thin air in `core/atmos`). The chasm the
  sacred river comes from is cut here; its head is the station's set piece.
- **The two vent cones on the south-eastern wall** ((716,1128) at 10.7 km and (770,1168) at 8.4 km, just outside the
  polygon) stand over the ranges: their plumes are this station's skyline, and the second cone's iced flanks hold a
  geyser field (`biomes/geyser/PLAN-STATIONS.md`, station 5, `ice`; the owner, 2026-10-26).

## Station 4: the descent (`--station descent`)

**The cataract and the abyssal south**, from the lake's outlet over the cataract (the kit's notes list "the cataract as
geometry" as owed) down to the floor at -1,400 m: Cfa and Csa giving way to Aw and Af at -750 m, then the hypertropic
jungle (XA, ~2,260 mm) and the salt steppe (XS, ~470 mm) on the floor at 1.9 atm. The vale's species follow the river
down as kin; the floor takes eastabyss's and the Rift's lowland flora in place (the Rift is the neighbour). Spray and
mist from the falls (`core/water` falls with `lipK` and spray, a fog belt in the gorge).

## Order

`cloud` first (it extends the kit's own flora), then `descent` (the cataract the kit owes), then `ranges`.
