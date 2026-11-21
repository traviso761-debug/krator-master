# `kits/dilihan` — Vassal City Building Kit Plan (Dilihan / Dellu-Handu)

## 0. Core Adoption

Per `AGENTS.md` and `README.md` ("CORE MODULES ARE NOT OPTIONAL"), `kits/dilihan` adopts the shared Krator core modules and the Iziz Vernacular contract (`settlements/iziz/VASSAL-KITS.md`):

| Need | Core / Shared Module | How `kits/dilihan` Uses It |
|---|---|---|
| Deterministic PRNG & hashes | `core/rand` (`08-core-rand.js`, `KRAND`) + `reseed` | Seed block `9801..9999` (`reseed(98XX + (o.v\|0))`) on every builder; `KRAND.hash` in `69r-dil-mat.js` procedural fallbacks (zero `Math.random` or `Math.sin` hashes) |
| Semantic world records | `core/tags` (`50`, `52`, `53`, `KTAGS`) | Every `VERN.def` carries `culture: 'iziz'`, `style: 'dilihan'`, `wealth`, `type`, `job`, and `lit`; `91t-dlsheet-tags.js` registers all `REG` sites + `IZFIX` children |
| Operable doors & glass | `core/door` (`10`, `20`, `30`, `90`, `KDOOR`, `KGLASS`, `KDOORLEAF`) | Drawn through `69e5-iziz-openings.js` (`vnDoor`, `vnWin`, `IZDOOR`) with locked doors on solid sheet bodies and real `KGLASS` panes |
| Walkability & stoops | `core/walk` (`20-core-walk.js`, `KWALK`) | Every doorway stoop, stair flight, and locked door block registers into `KWALK` |
| PBR library & world-UVs | `core/materials` (`20`, `22`, `68`, `opt/69a`, `record/23,25,26`, `KMAT`) | `vWorldUV` metre-tiling + `KMAT.bindMat` reading committed `.webp` brick/terracotta/mortar sets in place from `settlements/jimjam/tex/` and `kits/iziz-vernacular/tex/` |
| Viewer shell, probe & sky | `core/host` (`khost.FULL`), `core/atmos/placeholder` (`81-sky.js`), `kits/iziz-vernacular/sheet.py` | Shared `ksheet` page shell, camera, inspector, polygon tool, universal asserts (`SURVEY`), and placeholder sky |

## 1. Climate & Material Brief (`px 744, 663`, `-888.6 m ASL`, `1.79 atm`, `Am`)

Dilihan sits on the southern bench of the Cut (`-888.6 m ASL`), where dense `1.79 atm` air and tropical monsoon humidity (`Am`) demand aggressive passive cooling, while local alluvial lake-apron clays yield warm kiln-fired red, terracotta-orange, oxblood, and golden-ochre bricks akin to classical **Jimjam**:

1. **Red & Terracotta-Orange Kiln Brick + Iziz Imperial Orange:**
   - Primary walls in `MAT.dlBrick` (`brick.red`), `MAT.dlBrickBand` (`brick.red.band`), `MAT.dlBrickDeep` (`brick.oxblood`), and `MAT.dlBrickOchre` (`brick.ochre`), grounded on splash-proof dark basalt/laterite plinths (`MAT.dlLaterite`) with pale cream lime-mortar stringcourses (`MAT.dlMortar`).
   - Roofs in terracotta barrel/scale tile (`MAT.dlTile`) on poor/middle/trade buildings and verdigris copper (`MAT.verdigris` / `vCopperB`) on rich and civic buildings.
   - Canonical **Iziz Imperial Orange (`VPAL.orange` `0xe07a2a`)** unifies fascia boards, arch keystones, sun-hood trims, canvas stripes, banner poles, and gilt/orange Izani Sun-Orb medallions.
2. **Passive Tropical Cooling Grammar (`69s-dil-helpers.js`):**
   - **Internal & Peristyle Courtyards (`dlnCourtyard`, `dlnImpluvium`):** U-plan, L-plan, and hollow-square wings wrapped around sunken turquoise evaporative cooling basins, *zeer* porous terracotta water-cooler jars (`dlnZeerCluster`), and *zaguán* / dogtrot wind-passages.
   - **Deep Monsoon Eaves, Arcades & Shade-Sails (`dlnArcade`, `dlnShadeSail`, `dlnPergola`, `dlnSunHood`):** Recessed brick-arched ground loggias, wrap-around upper sleeping verandas, angled *jalousie* window hoods, slatted bamboo/teak pergolas, and taut linen/Iziz-orange courtyard shade-sails.
   - **Open Shuttered Windows, Brick *Jali* Screens & Monitor Roofs (`dlnOpenWin`, `dlnJali`, `dlnMonitorRoof`, `dlnWindCatcher`):** Outward-propped slatted louver shutters, perforated honeycomb red-brick *jali* (*cobogó*) ventilation lattices, raised ridge-vent clerestory monitors, and rooftop brick *malqaf* wind-catchers.

## 2. Shared Vassal Contract Alignment (`VASSAL-KITS.md`)

- **Plinths:** `0.42–0.65 m` dwellings, `0.82 m` damp-proof godown piers, `0.80–1.05 m` civic.
- **Cornice bands:** Middle dwellings & street trades land at `6.50–6.90 m` (`vern_house_mid_a` `6.70 m`, `vern_shops` `6.60 m`, `vern_bakery` `6.50 m`), rich villas at `8.30–8.60 m` (`vern_house_rich_a` `8.60 m`), civic halls at `8.30–8.80 m` (`vern_school` `8.40 m`, `vern_barracks` `8.20 m`) — all within `<= 0.50 m` on Mixed Street and Dilihan's Wall Street.
- **Seeds:** `9801..9985` across 24 builders (`buildDil*`), disjoint from Iziz Vernacular (`7100..8079`), Pylon (`9001..9399`), Talia (`9401..9799`), and Ancients (`10100+`).
