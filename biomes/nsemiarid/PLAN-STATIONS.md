# nsemiarid: the high country (plan, 2026-10-26)

The kit draws the basin round the drained dam lakes: hot steppe, the lake beds' desert, the Mediterranean foothills, the
rainy uplands and the tropical lake margins. The polygon also rises over 3 km along its southern and western edges, into
dry-summer montane country the kit does not draw. One station adds it. The page as built stays station 1. Stations follow
the Throne's and Korona's pattern (`stations/<name>/`, `python3 build.py --station <name>`).

**Status: station 2 built (2026-11-09, `python3 build.py --station high` -> `dist/nsemiarid-high.html`): see "As built" at the end.**

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

## Station 2, as built (2026-11-09)

`stations/high/`: its own stage (`45b`), passes and floor (`56`, `[G data]`), trees grown (`87k`), sky (`89`) and views and checks (`99`), over
the kit's `src/`; `station.json` names the core it adds (`31b` leafset, `32` kin, `33` fungoid for the neighbours' builders, `38` KRELIEF), its five
ground families (packed into its page only) and the two neighbour kits read in place (`kin`: nhighlands' and ebadlands' `50` and `55`, each in its
own registry, with the pack families their trees use). `build.py --station` is new (nhighlands' form, on the overlay path the scablands use).

**The site** (scale model 5.1, read 2026-11-09 from `tools/scale-model/model/data`): px **848,564**, ~3.7 km, the region's densest mix of the
plan's four classes in one window: Dsb with Dfb on the higher, wetter ground south and west, BSk on the leeward bench east (2.9-3.2 km), Csa/Csb
below to the NW. The 4.23 survey's class centres above moved in 5.1 (the Csb centroid now reads ~920 m). The geology bake says **sedimentary**,
so the plan's granite domes and slabs are **sandstone** (`ground.slickrock`), nhighlands' station 2's call on the same geology. Ardent (px 851,572)
is ~16 km south, off the map.

**The land** (true heights, 3,240-3,960 m): a flank rising south and west, ribbed by east-west spurs (each a sunny north face and a shaded south one),
the draws between them; the bench (BSk) NE; four sandstone **domes** with their talus aprons (`KRELIEF.talus`); a sandstone **step** across the flank,
34 m over a 14 m face, its talus under it (`KRELIEF.scarp`); **snowbeds** on the high shaded faces; two **tarns** (`core/water` stills).

**The trees** (`56`'s `HIGH.PASSES`, grown by `87k`'s `STATION_GROW` before the kit's floor; hero near the LOD spine, far form past `KIN_LOD.range`):

| | species | how | where |
|---|---|---|---|
| kin of nhighlands' station 2 (`BIO.kin`, smaller: this side is drier) | dry copper pine (x.66 height), dry white fir (x.7), draw ember giant (x.52), scrub black oak (x.42); burn snag (x.7: nhighlands' names no Koppen class, the kin takes Dsb/Csb) | nhighlands' own builders | the park in clumps on the shaded faces; fir in the draws and the shade; a few giants in the wettest draws; the oak scrub (Csb) low and sunny; snags in the old burns |
| ebadlands', read in place | juniper, pinyon, quaking aspen, Gambel oak, bristlecone | ebadlands' own builders and records | junipers and pinyons on the sunny faces and the bench's edge ("more juniper"), aspen in clonal patches in the draws, Gambel oak in the scrub, bristlecones on the domes' tops and the highest ground |
| the kit's own | frills, trumpets, foxtails, giant dandelions | the kit's passes (`NSEMIARID.PASSES`, replaced by `56`) | the bench only: the walking steppe's highest form (`NSEMIARID.ZONE_HOOK` mutes the kit's zones elsewhere) |

About 16,500 station trees (thinned once to hold the kit's 16 M budget for its trees: 25.9 M at first; heroes within 850 m of the LOD spine, drawn
within 700 m of the eye, the far form past that: `KIN_LOD`); the floor (`NSEMIARID.STATION_PLANT`) bunchgrass (the kit's stipa) and sagebrush (the kit's wormwood, an Artemisia) in the park, more
sage on the sunny faces; sea buckthorn, wormwood and stipa in the chaparral; tulips in the melt under the snowbeds; grass, sedge and flowers in the
meadows and draws; fireweed in the burns; scree and slab stones; nothing on the snow. The bench keeps the kit's own floor (drill grass, dew gardens).

**The ground**: the paint is the stage's (`STAGE_GROUND.tint`) and its eight KGROUND layers are its own (`STAGE_GROUND.layers`): needles, the park's
golden grass (`withered`), the bench's steppe, the meadows' grass, slab, scree, snowbed and the scrub's red soil (`chaparral`).

**The kit's hooks** (each inert when unset, so station 1 and the coulee draw as before; both rebuilt and re-verified): `STAGE_GROUND.layers` (45c),
`FAR_COLOR` (87), `NSEMIARID.ZONE_HOOK` and `NSEMIARID.keepClear` (55), `NSEMIARID.STATION_PLANT` and more of `NSEMIARID.small` (60), `STATION_GROW`
(88). `BIOME-API.md` has them.

**Checked** (`99`, each with a negative): the kit's (the water's edge, tagged, nothing under the water, no tree on a rock face, the variants, the cameras,
the bench's dust) and the station's: every pass placed; the kin and the read-in-place species tagged; **kin, not copies** (each kin nhighlands' species
grown by its builder, shorter than its source); **by aspect** (fir and copper pine on the shaded faces, juniper and pinyon on the sunny ones); **by
height** (oak scrub 3,403 m, the park 3,601, bristlecones 3,877); **the snowbeds** on high shaded faces, nothing rooted on them; **the tarns held**;
**the step** (a 15 m rise over 20 m along it, talus at its foot).

**Not taken** (the owner's decisions to make, as nhighlands' station 2 left them): `KFIRE` (the burns are a field of snags and fireweed, not a fire
model), seasons (`core/clock`: the aspens' autumn, the snowline), snow cover with `lee` (the snowbeds are a field and a ground layer, not
`ATMOS.snowCover`), KSTRATA on the faces (the domes and the step are slab, the units go to the eight layers). The wind-shaped facing check
(`HCHK.facing` wants 20 in view; the bench grows a few). `KNOWN_ISSUES.md` has the open items.
