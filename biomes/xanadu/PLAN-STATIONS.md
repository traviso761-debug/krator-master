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

## Core adoption (the final rebuild, pair 6, 2026-11-03)

Written before the stations, as `CLAUDE.md` asks. The page and every station take the universal set (`BACKPORT.md` section 1 and 5) and
xanadu's row; each piece has a `?<name>=0` switch for the owner's before-and-after.

**The land contract.** `src/45-host-stage.js` was split: `45` the renderer, lights and the switches (`XQ`, `XQ_ON`); `45b-host-land.js`
the Vale's land (the map, the river, `terrainH`, the five fields, and `LAND`: shore distance, mask, spine, snow line, label, the mirror's
still); `45c-host-bind.js` the field cache and `BIO.init`. A station replaces `45b` (and its sky `89`, water `89w`, views `98`) and keeps
the rest. `98-host-views.js` holds the Vale's views; `99` is shared.

| Group | Taken | Where | Switch |
|---|---|---|---|
| Graphics | `BIO.INDEX_ITEMS`, `LOD.merge`/`minTris`/`fade`/`cull`; octahedral impostors (`34`) for every species with a hero, heroes to 900 m; every tree reseeds from its own seed | `45`, `55`, `89z` | `?index=0 ?lodmerge=0 ?lodfade=0 ?lodcull=0 ?diet=0` |
| Limb joints | `BIO.flareJoin` (`31j`) on every hero limb (`limb()`), a side more where thick; ground stems (`root`) keep their foot | `55` | `XANADU.JOINTS=false` |
| Ground | `KGROUND` (shore sand, pebbles, river gravel on documented masks), the kit's GLSL bands kept, marble on hard beds; `KSEAT` (plants on the drawn ground); `KFAR` to 14 km; `KHORIZON` | `46`, `83`, `45c` | `?kground=0 ?seat=0 ?far=0 ?hz=0` |
| Strata | `KSTRATA` as data: hard beds are ledges the crag plants root on, the talus under the faces (`87-host-ledges.js`); the look stays the kit's bands (16-unit budget) | `46`, `87` | `?strata=0` |
| Air | height fog with a dawn mist, the **fog belt** on the mountains' north faces (the row), rain cover, the storm's lightning, `bindAtmosWind`, A2C | `89a`, `89z` | `?hfog=0 ?belt=0` |
| Water | the lake `surf:false, breakers:false`; **the river's plume** (`ext/61` `tintFlow`) from Alph's mouth into the lake; breakup on the lake and river; `WATER.mirrorSwitch` on the lake, off at load; wet ground and puddles | `89w`, `89a`, `99` | `?plume=0 ?breakup=0 ?wet=0 ?mirror=probe\|live` |
| Fields | `WATER.fields`/`fieldAt` drive `FIELD.wet`, `FIELD.flow` and the ground's wet band; `BIO.env` maps the five fields to the contract; `BIO.envCheck` and `WATER.edgeAudit` in `hostChecks` | `89z`, `99` | `?fields=0` |
| Shadows | **`core/shadow` (`KSHADOW`)**: one view-following box, 4096 map; the ground receives, the flora casts and receives, the water receives only | `89z` | `?shadow=0 ?shadowmap=2048` |
| Cards | `check_cells.py`: 0 faults (the card audit's fixes were already in); the raceme and `card.flower.bloom` kept as the owner asked | `materials.json` | |
| Textures | `card.lotus` on the lily pads; `ice.glacier`, `ice.clear` packed for the stations | `materials.json`, `50` | |

**ChatGPT's three checklist lines.** (1) Ground layers on documented masks: `46`'s header lists every weight (`aGL`, `aGM`) and its
source. (2) Strata and scour feed placement: the ledges and talus pass (`87`). (3) Wet ground and flora read `WATER.fieldAt`: `89z`, with
`BIO.envCheck` and `WATER.edgeAudit` as page checks (`99`), on the field contract in `core/biome/README.md`.

**Dropped, and why.** Confluences (`ext/55`): the sacred river has no tributary on the page. Arches (the row's `KSTACKS` arch): the
uplands have no arch-forming bedrock on this page; the hornbeam arches are the kit's own. Seasons and kin (the row): kin is taken by the
stations (the cloud forest's cousins, oidong's cherry); seasons wait for the owner's pass, as on the other turns. `ground.shingle` and
`ground.lilypond`: not wired (the 16 texture units; the pebble set covers the shore, and the page has no pond surface). The red
riverweed (`EXCHANGES.md` godthrone→xanadu): the blood river (Reḍ Riwā) is on no xanadu page; it is owed to the station that draws it.
