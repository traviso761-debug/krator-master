# hyperjungle: more stations (plan, 2026-10-23)

**Superseded (2026-10-26) by `PLAN-LANDS.md`**: the old `hyperjungle` polygon is gone (hyperjungle S, savage
hyperjungle, hyperjungle N), and the savanna rims each get their own palette. Kept for the survey below.

The kit draws the closed abyssal jungle. Two pieces of its country are not drawn: the **savanna edge**, which the owner's
new polygons mark (2026-10-23: `e savannah rim` and `se savannah rim`, "the transition zone from inner crater rainforest
to tropical savannah", and the north strip `hyperjungle`), and **the lake** 4.21 settled in it. Two stations; the page
as built stays station 1.

**Status: built (2026-10-27, the final rebuild's pair 2):** station 2 `dist/hyperjungle-savanna.html` (`build.py --station
savanna`), station 3 `dist/hyperjungle-lake.html` (`build.py --station lake`); both pass `verify.py --assert --all-views` on the
GPU with station 1. PLAN-LANDS.md's lands (savage, north, the rims' savannarim kit) are later turns the owner queued.

## The ground (surveyed 2026-10-23)

| | km² | Height | Air | Rain | Mean | Climate |
|---|---|---|---|---|---|---|
| The kit's jungle (`Hyperjungle`, less the smaller polygons) | 67k | ~-1,380 m | ~1.9 atm | ~1,950 mm | +31 | XA 77% |
| The north strip (`hyperjungle`: Screamer Country, the Hexahedron) | 25k | ~-1,270 m | 1.88 | ~1,035 mm | +32 | XA 32%, XV 29%, Aw 24% |
| `e savannah rim` (Fridon) | 24k | ~-810 m | 1.77 | ~1,490 mm | +29 | Am 53%, Aw 32% |
| `se savannah rim` (Pylon, Talia) | 34k | ~-400 m | 1.68 | ~1,290 mm | +26 | Aw 31%, Am 29%, Cfa 25% |
| Water in the kit's polygon | 32% | | | | | the lake (about 7,500 km² at -1,499 m) and its shores |

## Station 2: the savanna edge

One station for all three savanna polygons: the forest breaking into **monsoon forest** (deciduous in the dry season),
then gallery forest along the rivers, then **tall-grass savanna** with scattered hypertree outliers and fire-scarred
parasol trees; the abyssal savanna (XV) on the north strip drier and shorter. Termite cities, a dry-season burn front.
Pylon's and Talia's vassal-kit pages read this station for their ground (`settlements/iziz/VASSAL-KITS.md`).

## Station 3: the lake and the flooded forest

Várzea and igapó: forest standing in water for half the year, buttress roots and stilt roots, floating meadows, the
lake's open water, black-water channels; a high-water and a low-water state on the world clock.

## Order

J0 sites (station 2 in `se savannah rim`, near Talia); J1 station 2; J2 station 3; verified and baselined; `kits/crops`
`hyperjungle` already has `savanna`; a `flooded` zone (wet) is added.

## Core adoption (the final rebuild, 2026-10-27)

Written for the rebuild's turn (BACKPORT.md sections 1, 2 and 5; HANDOFF-REBUILD.md "How step 3 runs"). Every look change has a
`?x=0` switch.

| Module | Station 1 (`dist/hyperjungle.html`) | Station 2 (savanna) | Station 3 (lake) | Switch |
|---|---|---|---|---|
| INDEX_ITEMS, LOD merge, minTris, fade, cull | yes (45) | yes | yes | `?index=0`, `?lodmerge=0`, `?lodfade=0`, `?lodcull=0` |
| Runtime LOD and the far band's diet | heroes and their bole dress 1200 m, young trees 1800, floor 800 / 1800 / 2600 (88) | the same, the grass in three rings | the same | `?diet=0` |
| Octahedral impostors (34) | the six species, `impostorLook` gain 1.6 (measured: nhighlands' 3.6 bleached the pale boles) | the same, the eastabyss trees' own stand-ins | the same, the pandan's | `?impgain=`, `?diet=0` |
| The shared sky at `viewHour`, height fog, rain cover | yes (89, 89a) | site px 795,606 | site px 676,512 | `?hfog=0` |
| Wind (R8), A2C (R7), ground tint (R5), back-light, wet ground and puddles (R9) | yes | yes | yes | `?groundtint=0`, `?backlit=0` |
| KGROUND / KFAR / KHORIZON | the litter layer, the far canopy's roof to 14 km (83), its horizon | the same, the savanna's far colours | the same, the lake flat at low water past the map | `?kground=0`, `?far=0`, `?hz=0` |
| The card fit (`check_cells.py --fix`) | 14 faults to 0; the kit binds its own card slots, so 50 applies the cells and bases itself | | | |
| `BIO.fung` | the brackets (bole, log, tower) and the floor's mushroom caps | | | `?fung=0` |
| Seasons (H7) | bound (the closed jungle has no dry season: no material turns) | the kapok and baobab drop (monsoon forest), the grass bleaches | the lake's level (8 m flood pulse) | `?season=0` |
| KFIRE (H3), mounds (H10) | | the burn mosaic (four fires and KFIRE's old ones), the ember line, the grass by burn age; 270 termite cathedrals | | `?fire=0`, `?station=0` |
| Reach and kin (H1, H2) | | kin: the fire scale-tree (`eastabyss.sigillaria`), the monsoon cycad (`eastabyss.cycad`); read in place: eastabyss's umbrella-tree and grass card | read in place: geyser's stilt pandan | `?station=0` |
| Water: confluence, seasonal still | the brook as before | one river | the seasonal lake, the river and the black-water creek's confluence | `?confluence=0` |
| Not taken here | BIO.bamboo (the howl bamboo is hyperjungle N's, PLAN-LANDS J3), 480 m trees (H6, the savage land, J2), fauna by land (H8, the savage land's beasts, J2), reach (no home polygon's distance field on these pages: the cousins sit where the station's own ground says), falls (no drop on any of the three) | | | |

The station sites are ideal types (the live model was not surveyed: approximate px). PLAN-LANDS.md section 6's lake species are
built here as station 3; its section 9 numbers the lake station 4 (`-lake`): the page is `hyperjungle-lake.html` either way.
