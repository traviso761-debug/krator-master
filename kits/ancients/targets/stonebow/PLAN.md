# Stonebow: the canyon-bridge arcology in the Chīng-Mā Shut-In (`kits/ancients/targets/stonebow`)

Paolo Soleri's **21. Stonebow** (*Arcology: The City in the Image of Man*, plates 34–36), built as a `[G data]` Ancient megastructure with planned interiors (`kits/ancients-interiors`) across three states — **refurbished** (at the origin `(0, 0)` as the centerpiece for a future Ria Valley arcology settlement), **intact** (`(-2800, -2400)`), and **ruined** (`(+2800, -2400)`) — bridging the **Chīng-Mā Porphyry Shut-In** on Scale Model `5.1` at **`px (1196, 179)`**.

## Core adoption (written before the first fragment, 2026-11-24)

Started from `kits/ancients/targets/theodiga` (an Ancient canyon megastructure with `core/water`, `core/atmos`, `core/ruins` and `core/tags`), `kits/ancients/targets/podium` / `arcpile` (`[G data]` records + deltas by id), and `settlements/theodiga` (`43-th-arc.js` / `8zz1-th-arc-host.js`, planning arcology interiors on `kits/ancients-interiors` with zone-by-zone cut-aways).

| Module | Taken | How |
|---|---|---|
| `core/rand` | yes (`KRAND`) | every procedural choice in the plan, the ruin/refurbishment deltas, the rooftop gardens and the facade skins draws from `KRAND.hash(seed, ...)` / `KRAND.fbm`, never from draw order or `Math.sin` |
| `core/tags` | yes (`KTAGS`) | every structure, pylon, highway, truss chord, arch, light well, skylight, suspended tourist bridge, rim vault, bastion wing, tree and room is registered in `KTAGS` before it is drawn (`TAGS_TARGETS` + `INTERIOR_TARGETS`) |
| `core/terrain` | yes (`35-core-strata.js`, `KSTRATA`) | the Chīng-Mā Shut-In's stratigraphy: basal purple-red rhyolite porphyry (`outland-redbeds` tinted to the Neo-Ozark porphyry knobs) overlain by `carbonate-shelf` cream-to-buff cherty dolostone and recessed marl ledges |
| `core/water` | yes (`20`, `22`, `50`, `51`) | the upstream Chīng-Mā porphyry shut-in cataract (`WATER.fall`), its emerald karst plunge pool (`WATER.still`), and the perennial river *Chīng-Mā* (`WATER.flow`) winding along the canyon park floor (`8av2-stonebow-water.js`, `90w-stonebow-water.js`) |
| `core/atmos` | yes (`0-core`, `0p-presets`, `a-waves`, `b-skylight`) | shared wave field and skylight reflections bound onto the river, cataract and plunge pool |
| `core/ruins` | yes (`KRUINS.watch`) | watches the ruined Stonebow site (`d = 1`): asserts nothing floats and every fallen truss, pylon cap and tourist-bridge wreck is seated on the canyon benches or gorge floor |
| `core/furnish`, `kits/interiors`, `kits/ancients-interiors`, `kits/catalog` | yes (`INTERIOR_TARGETS`) | every interior zone of Stonebow is planned during construction as `AI.barPlate`, `AI.ringPlate`, `AI.gridPlate` and `AI.hallPlate` storeys (`8av1-stonebow-interiors.js`); intact and refurbished-core zones are furnished and audited, while ruined and deep-vault delving zones remain unfurnished sockets with broken partitions; `window._api.stonebow.socketRefurb(culture)` re-furnishes all refurbished zones in any culture |
| `core/door` | yes (`10`, `20`, `30`, `90`) | doorway leaves (`anLeaf`) in every intact and refurbished interior partition (`E` opens/shuts) |
| `core/materials`, `core/lod`, `core/shader` | yes | shared Ancients material library (`ancients.tex.ancients.js`), `vWorldUV`, and `KLOD` distance chunking |
| `core/host` | not yet | as on every `kits/ancients` target, the kit's shared `90-scene`, `91-probe`, `92-camera` and `92z-interior-ui` serve the target sheet; when `settlements/stonebow` is built on the open world, it reads `8av0` and `8av1` on `core/host` FULL |
| `core/world` | later (at settlement placement) | `STONEBOW.SITE` records the exact `5.1` pixel `(1196, 179)` and `toPx(x, z)` transform; the kit target uses its self-contained 1.52 km canyon cut |
| `core/city`, `core/simulation` | later (the settlement pass) | Stonebow is one pre-planned Ancient arcology complex; a future `settlements/stonebow` can add rim/valley hamlets on `core/city` / `core/hamlet` and bind the census to `core/simulation` |
| `core/biome` | later (at settlement placement) | trees in the canyon park and roof gardens use the Ancients kit's instanced flora sockets on the target sheet, replaced by `nwlowlands` / `riavalley` species in the open world |

## 1. Scale-map canyon survey (`Scale Model 5.1`, `2 km/px`)

Four candidate gorges across the Ria Valley (`rmvriavalley`) and adjacent North Lands were surveyed directly on `tools/scale-model/model/data/` (`h.png`, `rivers.json`, `climate.json`, `net51-gemini.json`):

| Candidate | `5.1 px` | River & flow | Bilateral canyon relief | Climate & geology | Network tie-in |
|---|---|---|---|---|---|
| **Chīng-Mā Porphyry Shut-In (chosen)** | **`(1196, 179)`** | `9109` *Chīng-Mā* ("Clear-Mirror River"), `218–440 m³/s` | **`723 m` within 10 km** (`1,215 m` bed between symmetric `1,938 / 1,960 m` rims; `420 m` inner shut-in throat, `898 m` within 16 km) | `Cfa`, `22 °C`, `1,443 mm/yr`, `~1.37 atm`; `neo-ozarks` / `ria valley` cherty dolomite plateau sliced by purple-red rhyolite porphyry shut-in ridges | **Directly on `route: outland` (`1192, 180`)**, where the Ancient Outland Gate Highway enters the Ria Valley |
| Web-Cleaver Gorge (*Hām-Tsēk*) | `(1048, 327)` | `9102` *Hām-Tsēk*, `1,650 m³/s` | `356–421 m` inner basalt ring-dike gorge inside a `1,189 m` cauldron | `Cfa`, `23 °C`, `1,035 mm/yr`; `arachnoid canyons` | On the Spider-Silk barge route south of the Ria rim |
| Pāk-Mā Basalt Horst Gate | `(633, 139)` | `9107` *Pāk-Mā*, `1,089 m³/s` | `465 m` (`41 m` bed under `506 / 617 m` basalt trap cliffs) | `Cfa`, `26 °C`, `2,008 mm/yr`; `Arcflow` above Double Delta | Coastal delta gate, off the eastern Ancient trunk |
| Weeping Valley bluffs | `(1056, 129)` | `9101` *Ria River* (*Mā-Rīa*), `~1,800 m³/s` | `137–165 m` broad alluvial bluffs | `Cfa`, `23 °C`, `1,004 mm/yr`; haunted ruin core | Main river trunk, too wide/low on 5.1 without artificial trenching |

**Why `(1196, 179)` fits Stonebow:** Soleri designed Stonebow explicitly as *"the waistline of a thicker and more complex configuration of activities extending almost indefinitely from both ends of the arcology"* — a multifunctional urban highway bridge welding two canyon rims together while stratifying climates from windy rim to sheltered river park (`image.png`, `image_3.png`). At `(1196, 179)`, the Ancient **Outland Gate Highway** crosses the narrow porphyry-and-dolomite gorge of *Chīng-Mā* right at the eastern gateway into the Ria Valley, just upstream of its confluence `(1124, 134)` with the Ria River and east of the haunted Weeping Valley.

## 2. Soleri's `21. Stonebow` form & figures (`STONEBOW.DIM`)

| Parameter | Soleri's sheet (`plates 34–36`) | Model (`8av0-stonebow-plan.js`) |
|---|---|---|
| Canyon rim-to-rim span | `900 m` | **`900 m`** (`x = -450..+450 m` at `y = 420 m`; inner river throat `220 m` at `y = 0`) |
| Linear-city & rim vaults run | `1:5,000` full width `~1,520 m` | **`1,520 m`** (`x = -760..+760 m`, highway approaches & vaulted rim chambers) |
| Structural height | `150–450 m` | **`150 m` above rim** (`y = 420 -> 570 m` Skylight crown); **`402 m` crown-to-tourist-keel** (`y = 570 -> 168 m`); **`450 m` crown-to-cliff pier footings** (`y = 570 -> 120 m`) |
| Surface covered | `129 ha` (`316 acres`) | **`~129 ha`** (main bridge + linear approaches + U-loops + 4 splayed rim bastion wings) |
| Peak population (intact) | `200,000` (`1,482 / ha`) | **`~200,000`** (`65 %` dwellings over lit floor within `12 m` of exterior, well, arch and terrace faces, `45 m²` gross/person) |
| Refurbished centerpiece capacity | — | **`~18,500`** across the 5 refurbished zones (Cultural Center crown, lower Living-Working bow, City Center arch, Four Gate Pylons, Suspended Tourist Center) |

### Key architectural elements (`8av0` records -> `8av3` geometry)

1. **Four Twin-Shaft Abutment Pylons (`pylons`):** Battered monumental towers at `(±350, ±118)` (`y = 250..516 m`), each housing twin circular lift/service cores (`image_2.png`) and pierced at `y = 420..448 m` by monumental **Highway Portals** (`HIGHWAYS`, `image_3.png`).
2. **Twin Outer Highways & Rim U-Loops (`highways`):** North and south Ancient highway decks (`z = ±118 m`, `y = 420 m`, `24 m` wide with central guideways) joined at `x = ±490 m` by semicircular hairpin turnaround viaducts (`image_2.png`).
3. **Upper X-Braced Living-Working Megatruss (`upperBow`, `trusses`):** Rising from `y = 420 m` at the pylons to `y = 570 m` at `x = 0`, framed on `z = ±94 m` by 6 bays of giant diagonal X-braces over recessed cellular living-working facades and corbelled promenade garden shelves (`image_3.png` Inset 2).
4. **Nine Spine Light Wells, Twin Rosette Oculi & Cultural Center Crown (`wells`, `crown`):** Along `z = 0` (`LARGE OPENINGS` in `image_2.png`), 6 rectangular light wells, 2 radial bronze/glass **Rosette Oculi** (`x = ±58 m`), and the central **Cultural Center Light Well** (`x = 0`) under curved translucent `SKYLIGHT` shells (`image.png`, `image_3.png` Inset 3).
5. **City Center Compression Arch (`cityArch`):** Graceful main arch (`soffit y = 296 -> 390 m`) spanning between cliff springings, carrying 3 storeys of `CITY CENTER` civic concourses, markets and arcaded galleries overlooking the gorge.
6. **Suspended Lower Tourist Center Bridge (`tourist`, `struts`):** Hung `172 m` above *Chīng-Mā* (`x = -192..+192, z = -54..+54, y = 172..204 m`) on 4 pairs of diagonal box-struts plunging from cliff-cut `MECHANICAL FACILITIES` corbels (`x = ±366, y = 262 m`), framing Soleri's iconic **eye-shaped central canyon void** (`384 m × 214 m`!) with stepped cliffside promenade cantilevers on both flanks.
7. **Vaulted Rim Undercrofts & Four Splayed Bastion Wings (`vaults`, `wings`):** Cut into both rims (`|x| = 420..720 m`, `y = 336..420 m`) behind vaulted stone-and-concrete arches (`WAREHOUSING` above, `AUTOMATED INDUSTRIES` west, `FACTORIES AND UTILITIES` east), flanked on all four corners by polygonal terraced neighborhood wings with circular amphitheater bowls (`NEIGHBORHOOD`, `LIVING`, `image.png` & `image_2.png`).

## 3. Planned interiors & refurbishment boundary (`8av1-stonebow-interiors.js`)

Every major zone has multi-storey floor plates built on `kits/ancients-interiors` (`AI.barPlate`, `AI.ringPlate`, `AI.gridPlate`, `AI.hallPlate`) so rooms, corridors, doorways (`core/door`), `core/tags` room records, and `core/furnish` placements exist from day one:

| Zone key | Height (`y`) | Storeys | Programme | State in `refurb` (origin centerpiece) |
|---|---|---|---|---|
| `crown` | `496..544 m` | 3 | Cultural Center Assembly Hall (`dining-hall`), Museum Gallery (`gallery`), Skylight Reception (`reception`), Scholars' Studies & Library (`study`, `library`, `bedroom`) | **Refurbished & furnished** (kept re-glazed skylight, whole white partitions, working doors) |
| `bow` | `428..476 m` | 4 | Living-Working residential/studio bars (`bedroom`, `dormitory`, `study`, `kitchen`), Terrace Greenhouses (`greenhouse`), Community Commons (`officers-hall`, `crew-mess`) | **Refurbished & furnished** |
| `city` | `390..414 m` | 3 | City Center Civic Concourse (`reception`), Market & Store Halls (`store-hall`, `gallery`), Transit Control (`bridge`, `chart-deck`), Travellers' Quarters (`bedroom`) | **Refurbished & furnished** |
| `tourist` | `174..194 m` | 2 | Canyon Panorama Lounge (`stern-lounge`), River Overlook Dining Hall (`dining-hall`), Botanist & Watch Cabins (`bedroom`, `study`, `sickbay`) | **Refurbished & furnished** |
| `pylons` | `384..468 m` | 3 | Gate Guardhouses, Lift Rings, Bulkhead Armouries & Garrison (`armoury`, `brig`, `barracks`, `strongroom`, `study`) | **Refurbished & furnished** (sealing the bulkhead doors to the delving vaults) |
| `vaults-w` | `342..366 m` | 2 | West Rim Automated Industries & Synthesis Bays (`engine-room`, `store-hall`, `workshop`) | **Ruined delving zone** (45% broken partitions, rubble stubs, unfurnished socket behind bulkhead) |
| `vaults-e` | `268..366 m` | 3 | East Rim Factories, Warehousing & Cliff Mechanical Roots (`engine-room`, `store-hall`, `chain-locker`, `workshop`) | **Ruined delving zone** (broken partitions & dark machinery chambers for explorers) |

### Culture-neutral settlement socket

By default, `stonebow/0` (intact) and the 5 kept zones of `refurb` are furnished in `ancient` + `generic-goods` so the centerpiece remains culture-neutral. Any settlement build (e.g. a future `settlements/stonebow` in the Ria Valley / *Mã-wè* or Eternian sphere) can re-socket all refurbished zones in one call:

```js
window._api.stonebow.socketRefurb('eternian');   // or any culture bundled on the settlement page
```
