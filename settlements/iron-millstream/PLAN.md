# Snou Bruk Iron Millstream (`settlements/iron-millstream`, Scale Model 5.1 `r201` at `px 632.5, py 716.6`, `+2,949.6 m`)

**Status:** Live Hydropower & Stream-Engineering Trial on Scale Model 5.1 (`2026-11-19`)
**Canonical Site:** Upper *Snou Bruk* (`r201`, *"Snow-Stream"*, `Q = 19.5 m³/s`, `163.3 m` gorge drop) immediately east of **Roketstad** (`id: "s28hf1s9ab"`, `px: 632, py: 716`, `+2,949.6 m ASL`, `1.107 atm`, `R1` *Roket-Kanton*, The Iron Republic)
**Companion Docs:** [`settlements/highlands/PLAN.md`](../highlands/PLAN.md), [`settlements/highlands/ROKETSTAD-BLUEPRINT.md`](../highlands/ROKETSTAD-BLUEPRINT.md), [`kits/highlands/README.md`](../../kits/highlands/README.md) (`77c-rep-hydro.js` + `94-hl-anim.js`).

---

## 0. Core Adoption (Written First per `AGENTS.md` & `README.md`)

`settlements/iron-millstream` is built from day one on Krator's shared `core/` infrastructure — zero copied PRNG, noise, sky, `getImageData`, or water shaders:

| Core Module | Taken? | Role in `settlements/iron-millstream` (or Reason Not Applicable) |
|---|---|---|
| `core/rand` (`08-core-rand.js`, `KRAND`) | **Yes** | Deterministic `KRAND.hash` / `KRAND.stream` / `KRAND.fbm` seeding for gorge micro-relief, `KCITY` & `KHAMLET` lots, yard props, and `biomes/nhighlands` flora. |
| `core/mask` (`25-core-mask.js`, `KMASK`) | **Yes** | CPU-deterministic `KMASK.canvas` placement & shading rasters for the cobble mill-road, cart forecourts, and stream/leat setbacks — zero `getImageData`. |
| `core/drawn` (`10-core-drawn.js`, `KDRAWN`) | **Yes** | Registers both the `4 m` near gorge mesh (`[-640, +640]`, resolving the `16 m` *Snou Bruk* canyon and `2.8 m` terraced mill-leat benches) and the `320 m` regional `44.8 km` Scale Model 5.1 skirt (`KDRAWN.grid`) so `verify.py` (`checks=harness.SURVEY`) audits eye clearances against drawn triangles. |
| `core/space` (`20-core-space.js`, `KSPACE`) | **Yes** | Spatial occupancy index preventing building-to-building, building-to-channel, and flora-to-building overlaps. |
| `core/city` (`KCITY`) & `core/hamlet` (`KHAMLET`) | **Yes** | `KCITY` (`core/city/10..40`) lays out the terraced Cantonal Millers' & Ironworkers' Street along the sunny east-facing slope above the mill-road; `KHAMLET.village` (`core/hamlet/10..30`, `KHAMLET.CULTURES.republican_mill`) places the upper *Jernkulle* magnetite-adit & charcoal-coppice hamlet (`<= 120` pop) feeding the stamp battery and finery forge. |
| `core/tags` (`50`, `52`, `53`, `KTAGS`) | **Yes** | Registers every water-powered mill, weir, sluice, flume, bridge, cantonal cottage, warehouse, and magnetite ore node in `KTAGS.page` before drawing (`0` unknown vocabulary keys/values, `0` `painted`/`tribal` records). |
| `core/water` (`20`, `21`, `22`, `50`, `51`, `WATER`) | **Yes** | Drives **both** the main flowing *Snou Bruk* (`r201`) mountain stream channel (`WATER.flow` + `WATER.fall` gorge cataracts + `WATER.open`/`shore` lower tailwater cove) **and** the weir-impounded **Mill-Pond** (`WATER.still`), diverted **Headrace Mill-Leat** (`WATER.flow` + `WATER.fall` overshot wheel cascades), and **Tailrace Return** (`WATER.join` confluence back into *Snou Bruk*). |
| `core/atmos` (`89-atmos-*`, `ATMOS`) | **Yes** | Standard Krator skybox (`ATMOS.skyBiome` + `ATMOS.bindHost`, `#include <atmos_waves>`, `ATMOS.skylight` reflections on flowing alpine water and Zsolnay roof tile) at `(632, 716)`, `+2,949.6 m ASL`, `1.107 atm`. |
| `core/materials` (`KMAT`, `matlib_pack`) | **Yes** | Sidecar PBR library pack (`highlands` `88x-matlib-pack.js` -> `dist/iron-millstream.tex.js`) plus pure Slavic procedural *rospis'*, *rozetka*, *kolovrat*, *pletenka*, and *nalichnik* woodcarving maps (`70-hl-tex.js`). |
| `core/furnish` (`KFURN`) + `kits/catalog` + `kits/interiors` | **Yes** | Indexed catalog batches (`republican`, `rustic`, `generic`, `scrap`) and `kits/interiors` (`highlands`) for quench troughs, anvils, spare millstones, barrels, crates, and cutaway support. |
| `core/door` (`KDOOR`, `KGLASS`, `KDOORHOST`) & `core/walk` (`KWALK`) | **Yes** | Real interactive doors (`E`), glazed Slavic *nalichniki*, and walkable `KWALK` strips across the cobble mill-road, weir footbridge, and arched granite gorge bridge. |
| `core/biome` (`buildlib.CORE_BIOME_MIN+`) & `biomes/nhighlands` | **Yes** | Reads `biomes/nhighlands` in place: subalpine Norway spruce, silver fir, cathedral cedar, and blue beech clothing the gorge walls outside the road/stream/building setbacks. |
| `core/lod` (`09-lod.js`, `97-lod-auto.js`) | **Yes** | Automatic distance LOD skipping animated `HLANIM` waterwheels, helve trip-hammers, blast-bellows, gang-saws, 5-pestle stamp batteries, sluice handwheels, and runner millstones (`94-hl-anim.js`). |
| `core/host` (`KHOST`: `FULL + KEYS`) & `core/minimap` | **Yes** | Standard `KHOST.take` viewer (`I` Inspector, `P` Polygon tool, `F` Walk, `M` Minimap, `X` Cutaway; view names free of apostrophes and colons per item 30). |
| `tools/harness.py` | **Yes** | Shared headless WebGL verifier (`checks=harness.SURVEY`) auditing drawn ground, active sampler caps, shaders, doors, tags, and hydraulic wheel-immersion invariants. |
| `core/coast` (`KCOAST`) | **No** | *Not applicable:* Landlocked high-gradient alpine mountain stream at `+2,950 m ASL` (`>36 km` inland from the eastern rim). |
| `core/camp` (`KCAMP`) & `core/ruins` (`KRUINS`) | **No** | *Not applicable:* Permanent cantonal industrial mill-gorge trial (`0` nomad bands or Ancient arcology ruins on this cut). |
| `core/engine` (`engine.py`) | **No** | *Not applicable:* Draws through `kits/highlands` (`culture_files('republican', 'rustic')`) on the Ancients + Iziz Vernacular (`VERN.place`) runtime. |

---

## 1. Site & Hydraulic Cascade Engineering (`r201` *Snou Bruk*)

In Scale Model 5.1 (`tools/scale-model/model/data/rivers.json` & `geology.json`), river **`r201` (*Snou Bruk*)** descends the eastern impactite-granite flank of *Jernhorn-Alperna* (`iron = 180`, `clay = 254`, `stone = 255`, `wood = 255`, **`coal = 0`**) right past Roketstad (`px 632.5, py 716.6`, `Q = 19.5 m³/s`). Because `R1` holds zero coking coal within `50 km`, the Iron Republic runs every mechanical blow, blast-bellows, ore-stamp, gang-saw, and flour stone on engineered water head rather than steam boilers.

### 1.1 Cross-Section Across the Gorge (`West -> East`, Flow `+z` South)

- **`x = -54..-20 m` — Sunny East-Facing Cantonal Bench (`KCITY` & `KHAMLET`):** Stepped Slavic horizontal-log *izbas* and rendered-masonry cantonal cottages (`hl_rep_house_poor_a/b`, `hl_rep_house_mid_a/b`, `hl_rus_house_poor_a`, `hl_rus_house_mid_a`), cantonal tavern (`hl_rep_tavern_b`), factor's shop (`hl_rep_shops`), tool smithy (`hl_rep_smithy_small`), grain/charcoal storehouses (`hl_rep_granary`, `hl_rep_warehouse_b`), and upper magnetite-adit hamlet (`KHAMLET`).
- **`x = -11.0 m` — Cobble Mill-Road (`im.road.mill`):** `6.5 m` granite-cobble waggon road descending parallel to the cascade with paved cart turnouts into each mill's `+z` loading yard, linked to the east bank by the **Arched Granite Gorge Bridge** (`z = +2.0 m`).
- **`x = +2.6..+4.1 m` — Terraced Industrial Mill Halls (`ry = 0`):** Four stepped masonry-revetted level pads (`Δy = 4.64 / 4.64 / 4.44 m` per step) carrying the dry building halls (`hl_rep_hydro_sawmill`, `hl_rep_hydro_stampmill`, `hl_rep_hydro_forge`, `hl_rep_hydro_gristmill`) — **zero hall footprints touch the main river or headrace**.
- **`x = +11.0 m` — Engineered Headrace Mill-Leat & Overshot Wheel Cascade (`Q_leat = 3.2 m³/s`):** Diverted from the west forebay of the **Weir Mill-Pond**, regulated by `hl_hydro_sluice_gate`, carried on `hl_hydro_flume` onto the Sawmill crown, and stepped from wheel-pit to next overhead penstock launder down all four overshot waterwheels (`x_wheel = +11.00 m` exact) before returning via `WATER.join` tailrace at `(x = +32.0, z = +132.0)`.
- **`x = +32.0 m` — Main *Snou Bruk* Gorge Torrent (`Q_main = 16.3 m³/s`, `width = 15..18 m`):** Plunges from `z = -260 m` (`+30.8 m`) into the **Weir Mill-Pond** (`z = -196..-156 m`, `+24.40 m`), spills over **`hl_hydro_weir`** (`z = -156.0 m`, crest `+24.25 m`), roars down a carved granite boulder gorge with a mid-gorge waterfall (`z = -18..-8 m`) under the **Gorge Stone Bridge**, receives the tailrace at `z = +132.0 m`, and widens into the lower **Tailwater Cove** (`WATER.open` + `shore`, `z = +178..+310 m`, `+1.50 m`).

### 1.2 Step-by-Step Hydraulic Head Table (100% Monotonic `dy/ds <= 0`)

| Station | `z` (`m`) | Structure (`key`) | `baseY` (`m`) | Wheel `rimBottomY` (`m`) | Live `core/water` `y` (`m`) | Rim Immersion (`m`) | Hydraulic Action |
|---|---:|---|---:|---:|---:|---:|---|
| **0. Weir Mill-Pond** | `-196..-156` | `hl_hydro_weir` (`x=+26, z=-156`) | `+21.90` | *(crest `+24.25`)* | **`+24.40`** | `+0.15` over crest | Impounds *Snou Bruk*; `16.3 m³/s` spills over granite apron (`WATER.fall`), `3.2 m³/s` enters west forebay |
| **1. Head-Sluice Gate** | `-140.0` | `hl_hydro_sluice_gate` (`x=+11`) | `+23.55` | *(invert `+23.79`)* | **`+24.24`** | `0.45` depth | Twin rack-and-pinion handwheels meter ice-free headwater into leat |
| **2. Timber Flume** | `-115.0` | `hl_hydro_flume` (`x=+11, len=28`) | `+19.50` | *(bed `+23.55`)* | **`+24.08 -> +23.96`** | `0.41..0.53` in trough | Braced larch trestle aqueduct carries headrace onto Sawmill penstock |
| **3. Gang Sawmill** | `-88.0` | `hl_rep_hydro_sawmill` (`x=+3.6`) | `+19.40` | **`+19.54`** (`R=2.10`) | Crown **`+23.92`** -> Pit **`+19.74`** | **`+0.20 m`** | `4.18 m` overshot drop drives 5-blade reciprocating steel gang-saw sash |
| **4. Ore Stamp Mill** | `-34.0` | `hl_rep_hydro_stampmill` (`x=+2.6`) | `+14.76` | **`+14.90`** (`R=2.20`) | Crown **`+19.50`** -> Pit **`+15.10`** | **`+0.20 m`** | `4.40 m` overshot drop turns 5-cam barrel lifting iron-shod magnetite stamps |
| **5. Finery Forge** | `+20.0` | `hl_rep_hydro_forge` (`x=+3.0`) | `+10.12` | **`+10.26`** (`R=2.20`) | Crown **`+14.86`** -> Pit **`+10.46`** | **`+0.20 m`** | `4.40 m` overshot drop drives oak helve trip-hammer & twin leather blast-bellows |
| **6. Cantonal Gristmill** | `+74.0` | `hl_rep_hydro_gristmill` (`x=+4.1`) | `+5.68` | **`+5.82`** (`R=2.10`) | Crown **`+10.22`** -> Pit **`+6.02`** | **`+0.20 m`** | `4.20 m` overshot drop turns granite runner millstone & sack-hoist |
| **7. Tailrace Confluence** | `+74..+132` | Masonry tailrace + `WATER.join` | — | — | **`+6.02 -> +3.95`** | Joins main `+3.92` | Returns `3.2 m³/s` cleanly into *Snou Bruk* above the `+1.50 m` Tailwater Cove |

---

## 2. Invariants & Verification Gates

1. **Node `[G data]` Suite (`node settlements/iron-millstream/tests/test-iron-millstream.js`):**
   - Scale Model 5.1 pin `(632, 716)` datum `+2,949.6 m ASL`, `r201` *Snou Bruk* discharge, and `KDRAWN` near (`4 m`) + regional (`320 m`) grids.
   - Strict monotonic downstream drop (`dy <= 0` on every segment of main *Snou Bruk*, headrace reaches, penstocks, and tailrace return) — paired with `T.neg` uphill segment mutation.
   - Exact hydraulic wheel contact (`0.08 m <= waterY - rimBottomY <= 0.45 m` and `waterY <= hubY - 0.80 m` on all 4 waterwheels, plus crown feed alignment within `0.35 m` of `crownTopY`) — paired with `T.neg` dry-hanging wheel & hub-buried wheel mutations.
   - Zero main-channel building intrusions (every hall OBB stays strictly outside the *Snou Bruk* main channel and mill-pond) — paired with `T.neg` channel-intrusion mutation.
   - Zero OBB footprint overlaps, pure Slavic Republican/Rustic culture (`0` `painted`/`tribal` records), `KCITY` + `KHAMLET` population, `KTAGS` vocabulary audit (`0` unknown), and 100% run-to-run determinism.
2. **Headless WebGL Suite (`verify.py dist/iron-millstream.html --assert`):**
   - Live Three.js inspection of `G.userData.hydro` on all 7 placed hydropower groups confirming 3D world-space `rimBottomY`, `hubY`, `wx`, `wz` match the live `WATER` surfaces, `window._hydroParts >= 12` animated assemblies running, scene triangles well within crisp `1.2–2.8M` showcase budget, and `harness.SURVEY` universal checks (`drawn-ground`, `samplers`, `shader-programs`, `no-nan-geometry`, `registered-volumes-non-empty`).
