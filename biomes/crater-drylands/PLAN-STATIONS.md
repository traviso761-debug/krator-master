# crater-drylands: more stations (plan, 2026-10-26)

The kit draws the kiln and bloom country: the hot steppe (BSh) of the crater floor in the volcano's rain shadow, with its
burn mosaic. The owner split the model's region into **crater drylands N** (`rmuqlfgh1u6d8`) and **S** (`rmuqlgonah5tp`)
to tell them apart. Each holds ground the kit does not draw. The page as built stays station 1. Stations follow the
Throne's and Korona's pattern (`stations/<name>/`, `python3 build.py --station <name>`).

**Status: plan, awaiting the owner.** Station `south` is already planned in `biomes/hyperjungle/PLAN-LANDS.md` section
5.3 (the swap); this plan adds the ground under it and two stations in N.

## The ground (scale model 4.23, surveyed 2026-10-26: `tools/scale-model/survey_biomes.py`)

**N:** 54,672 km² (51,928 land). Heights p5 / median / p95: -1,170 / -605 / +94 m.

| Climate | km² | Height | Pressure | Rain | Mean (warm/cold) | Centre px | Drawn today? |
|---|---|---|---|---|---|---|---|
| BSh | 35.7k | ~-580 m | 1.72 | ~490 mm | +29 (36/21) | (491,377) | yes |
| **Aw** | **9.1k** | **~-750 m** | **1.76** | **~770 mm** | **+29 (37/21)** | **(437,457)** | **no** |
| BWh | 2.2k | ~-30 m | 1.61 | ~235 mm | +27 (36/17) | (592,302) | in part |
| Csa | 1.9k | ~-30 m | 1.61 | ~675 mm | +25 (35/16) | (361,524) | no (SW Bay's edge) |
| **XS** | **1.8k** | **~-1,290 m** | **1.88** | **~580 mm** | **+32 (37/27)** | **(483,366)** | **no** |
| **XV** | **0.8k** | **~-1,250 m** | **1.87** | **~880 mm** | **+32 (37/27)** | **(487,387)** | **no** |

**S:** 8,408 km² (7,412 land). Heights p5 / median / p95: -672 / +124 / +1,403 m: a climb of about 2 km.

| Climate | km² | Height | Pressure | Rain | Mean (warm/cold) | Centre px |
|---|---|---|---|---|---|---|
| BSh | 5.1k | ~290 m (-310 .. 1,110) | 1.54 | ~425 mm | +21 (28/15) | (572,667) |
| Aw | 1.2k | ~-180 m | 1.64 | ~770 mm | +24 (31/17) | (583,675) |
| XS | 0.5k | ~-650 m | 1.73 | ~530 mm | +27 (31/22) | (567,644) |
| Af | 0.2k | ~-440 m | 1.69 | ~2,300 mm | +27 (32/21) | (555,618) |
| XV | 0.1k | ~-670 m | 1.74 | ~860 mm | +26 (31/22) | (575,656) |

S by height: below 0 m, 3,120 km² (BSh 46%, Aw 25%, XS 16%); 0-1,000 m, 3,364 km² (BSh ~88%); 1,000-2,000 m, 868 km²
(BSh, then BSk, Csa and Csb at the top, +14 to +16 °C, ~330-360 mm). S is cooler than N by about 7 °C at its median.

## Station 2: the south (`--station south`, planned in PLAN-LANDS 5.3)

The swap and its black mallee are PLAN-LANDS's. The ground adds: **the climb** from a salt floor (XS, at (567,644)) to a
cool kiln at 1-1.5 km (+16 °C, the kiln's scrub lower and greyer), Af gully galleries on the north-western side
((555,618), ~2,300 mm: fed from SW Bay's air), and Csa and Csb oak scrub on the topmost slopes toward the southern
highlands. N's salt-floor species (station 4) read in place for the floor.

## Station 3: the savannah edge in N (`--station edge`)

**The Aw belt toward SW Bay** ((437,457), 9,140 km², ~770 mm, 1.76 atm): the kiln opens into grass. Taller grass than
the steppe, scattered umbrella trees (SW Bay's parasol savannah is the neighbour: its trees as kin, `BIO.kin`), the burn
mosaic hotter and more frequent (`KFIRE`: grass fires every year or two, against the kiln scrub's decades). The kiln's
bloom shrubs hold the rocky ground. Seasons on the clock (the dry season's straw, the wet season's flush). Termite-like
mounds (`KSTACKS` mound kind).

## Station 4: the salt floor in N (`--station salt`)

**The abyssal salt steppe and savannah by the Steampits** ((483,366) and (487,387), 2,568 km², -1,250 to -1,290 m,
1.88 atm, +32 °C): the drylands' lowest, densest, hottest ground. Salt steppe (XS) of succulent chenopod-like scrub on
crusted flats (`KGROUND` polygon kind; `core/water` brine and pan), with abyssal savannah (XV) islands where the ground is
fresher. The Steampits' geyser field is next door (geyser kit, read in place: a vent's run-off and sinter apron reach
in). The kiln's scrub at its largest in the dense air; dust in the dry season (`core/atmos` air load).

## Order

`south` first (PLAN-LANDS's order), then `edge`, then `salt`.
