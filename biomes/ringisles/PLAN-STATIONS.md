# ringisles: the high isle (plan, 2026-10-26)

The kit draws one synthetic island of about 3.4 x 2 km, with a windward mountain of ~190 m: every class of the isle demo's
land in miniature, as soft weights. On the model the isles' land rises about a kilometre over the sea (p95 -474 m over a
sea at -1,500 m), and a third of it is upland the showcase has no room for. One station adds it. The page as built stays
station 1. Stations follow the Throne's and Korona's pattern (`stations/<name>/`, `python3 build.py --station <name>`).

**Status (2026-11-03, the rebuild turn, pair 8):** station 1 (the page as built) is rebuilt on the universal set ("Core adoption" below); **station 3, the
lagoon, is built** (`python3 build.py --station lagoon`, `dist/ringisles-lagoon.html`; below); **station 2, the high isle, is built** (2026-11-09, the owner
asked for it; `--station high`, `dist/ringisles-high.html`; below), **not verified** (the owner: hand it over without a verify).

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

## Core adoption (the rebuild turn, pair 8, 2026-11-03)

The universal set (`BACKPORT.md` sections 1 and 5) and the kit's row, on both pages unless said. The page reads eight kits in place (the Throne, swbay,
eastabyss, sedesert, geyser, the Rift, nwlowlands, the hyperjungle), so most of the flora is theirs as their turns left it; what is this kit's is below.

| Module | Taken | Where |
|---|---|---|
| `BIO.INDEX_ITEMS`, `BIO.LOD.merge/minTris/fade/cull`, the runtime LOD tick | yes (`?index=0` `?lodmerge=0` `?lodfade=0` `?lodcull=0`) | `45`, `99` |
| Octahedral impostors (34) | the borrowed kits' far trees (their own `BIO.impostorItem` calls, missing from the page until now: `check_assembly`'s MISSING findings), gain 2.2 (`?imp=0` their blobs, `?impgain=`); this kit's own far canopy keeps its icosahedra | `build.py`, `88`, `89zz` |
| `31b-core-leafset.js` | listed: the kit core calls `BIO.leafOn`/`leafQ` (`check_assembly`) | `build.py` |
| Cards on their geometry | `check_cells.py --fix`: nine crown clumps' `stems`, the liana's cell and `base: top`, the bromeliad's whole plant, one seaweed for the wrack; one fault left by design (`bananaleaf`, no slot: 52 cuts it) | `materials.json`, `tex/pack.json` |
| `BIO.flareJoin` (31j) | every branch limb of the kit's own trees through `limb(..., pr)` (the scrub thorn's forks, the corkwood's, the pandanus', the sea grape's and breadfruit's limbs); the trunks from the ground and the thorn twigs not; `?flare=0` | `55` |
| The attach audit | the forest's dressing put on the wood: the near and mid XA/Af trees keep their structure log (`BIO.tree`), the lianas hang from the nearest span and the bromeliads sit in its bark (`BIO.snapSeg`); the same draws. The Throne's `pompom` (its lehua) is held at the Throne's turn | `55`, `60` |
| `BIO.fung` | listed (33); the kit has no fungoid part of its own | `build.py` |
| The shared sky, height fog (R1, the sea haze and a low morning mist on the lagoon), rain cover (R10), lightning, `bindWeather` | yes; the host binding is `ATMOS.bindHost` on the host clock (it was an `ATMOS.init` of its own on Day/Night) | `89a`, `89zz` |
| Wet ground (R9) | the sand drinks the swash and the rain (`WATER.wetGround` on the sea, as before); no second layer | `89w` |
| `BIO.bindAtmosWind` (R8), `BIO.setA2C` (R7) | yes | `89a`, `89zz` |
| Water: still water without breakers | the tide and brine pools are `WATER.drawStill` (no surf, no breakers); the sea keeps its breakers, as a sea does (the island's ring of surf on the reef is the shore grid's) | `89w` |
| `WATER.mirrorSwitch` | off at load, on the sea's surface centred on the lagoon bay (radius 690 m, far 3.5 km); on the lagoon station on the lagoon | `98z` |
| `KGROUND` | KGROUND's sampler under every library layer (hex tiling, the distance scale), the Throne's way for a many-layer Lambert ground (`THRONE.layGLSL`, the Throne read in place); each layer keeps its documented mask from `paintAt` (the fields beach, dune, mangal, reef, bench, pan, garden, lagoon, the classes, the burn mosaic, the geyser kit's record); `?kground=0` the geyser kit's sampler | `84` |
| `KHORIZON` | baked over the map; the flora takes it; the ground only where it keeps two texture units (on the Arc it does not: below) | `89zz` |
| `KSHADOW` (core/shadow) | **decided by the ground's texture units at load**: the ground reads sixteen (fourteen library layers, the macro map, the water's wet sand), and three r128 declares the shadow map in every lit material, so on a 16-unit GPU (the Arc: ANGLE's limit) it is skipped, as on the Throne's isle; SwiftShader allows 32, so a software verify runs it. `window._units`, `window._shadow` say which. The rain cover and the ground's horizon follow the same count | `89zz` |
| `KFAR` | **not taken**: the island is ringed by the sea to 9 km (the water's own CDLOD mesh to the horizon); the sea floor past the map is never seen through the deep water | |
| `KSTRATA` (the row's "strata on the geode cliffs") | listed (the core's, in place of sedesert's src/ copy the page read before; `BIO.strata` with no recipe is the same shader); **no cliffs to put beds on**: the island's mountain is 190 m of soil and forest, the bench is reef rock. Station 2's valley walls would take it | `build.py` |
| The row's sand on the beaches | the beaches keep their library sand on KGROUND's sampler; the `sand` kind's ripples are a look for the owner (not taken: a shore of swash and wrack, not a wind-rippled one) | |
| The row's fog belt (sea fog) | height fog with a low mist (`ATMOS_AIR`, 89a) | `89a` |
| The row's weed (seagrass), brine | seagrass is the kit's own floor card (`card.seagrass`); the brine pools are the kit's pink stills; core/water's weed and brine kinds not taken (no new kind is needed for either) | |
| Seasons | not taken (the kit has none; a tropical isle's year is the burn mosaic's) | |
| The river-mouth plume | no river on the island | |
| The review's three lines | ground layers on documented masks (84's head); no strata or scour on this ground; the wet sand reads the sea's own shore (`WATER.wetGround`) | |
| `core/hazard`, the one clock | listed (20, 37): the geyser kit's vents and hot ground | `build.py` |
| Exchanges (`EXCHANGES.md`) | ringisles vends `strandpandan` (key 3) to the Throne and `breadfruit` (key 5) to the hyperjungle: `RINGISLES.make(sp, x, y, z)` / `RINGISLES.grow(T, lv)` (55) on fragments 50, 52, 55, 70; the readers take them at their turns | |

## Station 3, built (2026-11-03)

`stations/lagoon/`: its own stage (`45-host-stage.js`: the bank's map and the `STATION` knobs every src/ fragment reads, `null` on station 1) and sky (`89`: the
lee shore's hypertree wall as a low ridge to the east-north-east). The map is 7.6 x 6.8 km: a rim's crest on an ellipse (3.2 x 2.8 km radii) with its pass
at the south-east (~220 m wide, 12 m deep), three motu on the rim (the north-east one the fish camp's, with its coconut, breadfruit and taro plots and the
beachrock tide pools on its ocean side), the lagoon's floor at ~13 m with a sand apron behind the rim and 140 patch reefs rising to 1.6-8 m, the fore reef
falling to 60 m outside. The water reads the true bed (the island's floors its lagoon at 1.6 m), so the swell breaks on the rim. The climate is XA (the
shelf's islands). The geyser kit's passes do not run; the island's places the bank has not got (the mangal, the pan, the vent, the upper garden) stand off
its map, and their checks are skipped (`STATION.skip`). **The plan's scale**: the bank's lagoon is 8-10 km across; this cut is 6.4 x 5.6 km inside the rim.
**Not built** from the plan: the tide (`WATER.tide`: the core has it, the page's sea is a fixed level), the pass's current as a `flow`, the calm share of the
wave field inside the rim, the wreck, the pearl beds, the ring shark (planned in `kits/fauna`), the outrigger fishing. **The look is the owner's to judge.**

## For the owner (look decisions of the rebuild turn, each behind a switch)

- **The ground on KGROUND's sampler** (`?kground=0` the old): hex tiling and the distance scale under every layer; the order and the masks unchanged.
- **The far trees as impostors** (`?imp=0` the borrowed kits' blobs): the gain 2.2 is the Throne's, not set against this page's near crowns on a GPU.
- **Flared limb joints** on the kit's own trees (`?flare=0`).
- **Crowns held to their limbs** (`?hold=0`): the scrub thorn's plates now hug its branches (they were a flat umbrella partly in the air), the breadfruit's
  leaves sit closer in. The thorn may read narrower: the plates could be widened by longer branches instead (a draw change: every tree after it moves).
- **The dressing on the wood**: lianas hang from boughs, bromeliads sit in the bark (no switch: the old spots floated).
- **Height fog and the lagoon's morning mist** (`?hfog=0`), **the wrack as one seaweed a pad** (it was the whole sheet of nine).
- **The lagoon station** as a whole: its scale (a 6.4 x 5.6 km cut of the 8-10 km lagoon), the rim's surf on the true bed, the patch reefs' density, the
  motu's forest (XA: the kit's rainforest on sand, which an atoll's islets would carry thinner), the ridge for the lee shore's wall.

## Station 2, built (2026-11-09; not verified)

`stations/high/`: its own stage (`45-host-stage.js`: the shield, its valleys, the `STATION` knobs src/ reads), the cloud forest (`87-host-cloud.js`), the
valleys' streams and falls (`89x-host-streams.js`), and core/water ext/61 by `station.json`. The map is 8.8 x 8 km: an eroded shield ~7 x 6.2 km at the
coast, its summit 1,010 m a little west of the middle; five windward valleys cut into it, each with an amphitheatre head whose wall drops to a floor
250-330 m up and runs down to the sea; the three middle valleys' streams fall 488-524 m off their headwalls (core/water's tall falls, `?falls=0`); every
stream meets the sea with a plume of red-brown soil over the reef (ext/61, `?plume=0`). The climate: Af on the windward slopes, XA on the coastal flats,
Am on the crest's lee, the savanna's burn mosaic down the lee, BSh and XS on the dry west coast (`dryAt`). **The cloud forest**: the fog belt on the
crest (`ATMOS.fogBelt`, 560-1,100 m, thicker on the windward face) and the Throne's **elfin tree** borrowed into the belt (`FIELD.cloud`; a pass of its own
that runs first; the lowland canopy thins and the tree ferns thicken as the cloud thickens), the kit's files unchanged (the host adds the borrowed
species and its pass; the Throne's elfin bark and hanging moss join the page's Throne pack, so every page's `ringisles.tex.throne.js` grows by them).
**KSTRATA on the valley walls**: the core's `rift-volcanic` recipe (basalt flows with ash partings and scoria) on the steep ground, through `strataColor`
in the ground shader (`STATION.strata`). **Texture units**: the station drops the four ground layers it has nothing for (salt, sinter, mud, damp sand:
`STATION.dropLayers`, each a constant colour with no sampler) to make room for the strata's three; with the fog belt's field the ground reads 16, so on
the Arc the shadows, the rain cover and the ground's horizon are skipped, as on station 1. Gardens: the village's on the windward plain, the coffee and
cloves terraced on the lee at ~350 m in the monsoon band. Checks it skips: `placed` (the island's mangrove has no mangal here), `mangal`, `thermal`.
**Load-checked only**: one software-GL load without the bake (`?nobake=1`): error panel clean, the summit, valleys, falls, gardens and cloud field where
designed. **Not verified**: no `--assert` run, no screenshot, no look; the flora's counts, the attach audit, the export profile (verify.py's box for it is
the great valley's floor) and the universal asserts are the coordinator's GPU run's.
**For the owner**: every look on it; the valleys' walls (steep: ~400 m over ~150 m, on a 10 m ground grid); the elfin trees' density in the belt; the fog
belt's density (.0016); whether the lee wants the island's vent and salt pan back (left out).
