# Arcoforte — the sea-cliff arcology (`kits/arcoforte`)

A standalone procedural arcology complex inspired by Paolo Soleri's **Arcoforte** (*Arcology: The City in the Image of Man*, Section 5, plates 47–49; kept in `reference/arcology-arcoforte-1.webp`, `2.webp`, `3.webp`), reconciling all top-view, bridge/mid-level, section, elevation, and sea-cliff study drawings into one unified 1:1 coastal megastructure (~300 m tall, ~580 × 580 m core / 29 ha, peak capacity ~20,000), with comprehensive **living, work, and recreation** interiors planned and furnished so the complex can stand in **refurbished, culture-socketable form** as the centerpiece of a new coastal settlement.

---

## Core adoption (written before the first fragment)

Started from `settlements/span` (an arcology layout as `[G data]` records + rules + `settlements/voth/palace/blueprint.py` sheets, reading `kits/ancients` in place on `core/host` FULL and `core/atmos`), `kits/metropolis` (templated multi-storey `kits/ancients-interiors` room plans, `core/furnish`, walkable decks), and `tools/new_build/` (`buildlib.through_tools_build`, `harness.SURVEY`).

| Module | Taken | How |
|---|---|---|
| `core/rand` | yes (`08-core-rand.js`, `KRAND`) | every layout, ruin/refurbishment variation, window circuit, tree placement, and rubble choice is a pure hash of `(seed, salt, part, index)`; never `Math.random`, never stream order |
| `core/tags` | yes (`50`, `52`, `53`, `KTAGS`) | the arcology, every zone/bastion/tower/deck/bridge/harbour part, every interior room (with `living`/`work`/`rec` note & room tag), furniture records, vessels, and park trees registered before drawing |
| `core/drawn` | yes (`10-core-drawn.js`, `KDRAWN`) | coastal cliff, harbour bench, sheltered park valley, and plateau mesh registered into `KDRAWN` so eye and ground audits measure the drawn triangles |
| `core/space` | yes (`20-core-space.js`, `KSPACE`) | footprint and zone overlap checks (`AF_RULES`), host spatial index |
| `core/terrain` | yes (`35-core-strata.js`, `35z-core-strata-shade.js`, `37c-core-rubble.js`) | `KSTRATA` bedded coastal cliff rock; `KRUBBLE` salvage/wreckage heaps in the sealed automated industry vaults and ruined state |
| `core/atmos` | yes (`89-atmos-0-core`, `0p-presets`, `8-export`, `a-waves`, `b-skylight`, `sky/*`, `host/*`) | standard Krator skybox with gas giant and sun (`ATMOS.skyBiome`), `ATMOS.bindHost`, shared wave field, `ATMOS.skylight` reflections, weather presets |
| `core/water` | yes (`20`, `21-shore`, `22-flow`, `50-draw`, `51-kinds`) | `WATER.open` ocean with shore bathymetry and surf, `WATER.still` marina basin and park reflection pools, `WATER.flow` central park waterway and linear-city canal, `WATER.fall` cliff sluice cascade to the sea |
| `core/host` | yes (`khost.FULL + khost.KEYS`: `90`–`99`) | camera, frame loop, `core/clock`, UI panel, unified key map, inspector, stocks, marks/polygon tool, minimap, editor, and **`99-host-cutaway.js`** storey-by-storey interior cutaway |
| `core/walk` | yes (`20-core-walk.js`, `KWALK`) | walkable ground, harbour decks, central park, bridges, promenade, rotunda concourse, sky-crown decks, and interior floor plates |
| `core/door` | yes (`10`, `20`, `30`, `90`) | `KDOOR` records, `KGLASS` glazing, `KDOORLEAF` / `KDOORHOST` interactive interior partition door leaves |
| `core/ruins` | yes (`20-core-ruins.js`, `21-core-ruins-host.js`, `KRUINS`) | watches the sealed/ruined sub-cliff automated industry vaults in refurbished mode and the whole complex in `?state=ruined` (asserts zero floating debris and seated rubble) |
| `core/materials` | yes (`20`, `22`, `68`, `record/23`, `25`, `26`) | `KMAT` bound onto `kits/ancients/materials.json` (`dist/arcoforte.tex.ancients.js` sidecar), plus bronze-mullion alabaster/salvage refurbishment glazing |
| `core/lod` | yes (`09-lod.js`, `97-lod-auto.js`) | automatic chunked distance proxies and instanced culling |
| `core/furnish` | yes (`50`, `52`, `53`, `KFURN`) | camera-independent furniture records made at load for every furnished room and tagged in `KTAGS`; geometry batches built on demand when a cutaway unit opens |
| `kits/ancients` | read in place (`src/10..69w`, `88y`) | instancing kit (`kdef`/`kput`/`kbake`), concrete/white/salvage/worn materials, procedural architectural detailing |
| `kits/interiors` + `kits/ancients-interiors` + `kits/catalog` | bundled (`70d-interiors-bundle.js`) | `AI.ringPlate`, `AI.barPlate`, `AI.hallPlate`, `AI.gridPlate`, `AI.RECIPES`, `AI.furnishPlan`, `IX.audit`, `AI.audit`, and multi-culture catalog pieces (`ancient`, `generic`, `generic-goods`, `scrap`, `post-apoc`, `iziz`, `xanadu`, `highlands`, `jobs`) for live culture socketing |

**Not taken (one line each):**
- `core/world` — Arcoforte is a reusable coastal arcology kit not yet pinned to a scale-model pixel; `ARCOFORTE.toWorld(frame, x, y, z)` maps it onto any coastal cliff site when a settlement places it.
- `core/mask` — all placement is parametric in `[G data]`, never read from a canvas.
- `core/biome` — coastal trees and terrace plantings use `kits/ancients` instanced stand-ins (`README.md`: placeholder flora on a culture/building kit, replaced by the host biome kit when placed on the world map).
- `core/city`, `core/hamlet`, `core/camp` — this kit builds the single megastructure complex (`SINGLE_COMPLEX`); the surrounding surface settlement that adopts it will run `core/city`.
- `core/simulation`, `core/sched`, `core/charactermodels` — room capacities, beds, workplaces, and recreation slots are exported as `[G data]` (`AF_INT.simPlaces()`) ready for the host settlement's `SIM` layer.
- `core/export` — meshes, `KTAGS` records, and `[G data]` plans/rooms are structured for direct host consumption when placed in a settlement.

---

## 1. Reconciling Soleri's Three Plates into One Complex

Frame: metres, `x` east, `z` south, `y` up; ocean level `y = 0`, coastal cliff crest / inland plateau `y = 84 m`. North (`-z`) faces the open sea; South (`+z`) faces the inland plateau.

1. **The Sea Cliff, Multilevel Harbour Lift Platform & Marina (`y = 0..42 m`, North & NW)**
   - *Plate 1 (`MARINA`), Plate 2 (`OCEAN`, `FISHING INDUSTRY`, `AUTOMATED INDUSTRIES`, text on the multilevel boat-lift platform), Plate 3 (cliff sketches, `150 m + 150 m` bar).*
   - A 3-deck concrete sea platform (`z = -332..-244 m`, `y = 4.5, 13.5, 22.5 m`) on caisson piers with twin overhead **boat-lift gantries** and cradles lifting fishing vessels out of the sea into sheltered servicing slips; the **West Marina** (`x = -320..-224 m`, `z = -242..-156 m`, `y = 3.5 m`) with breakwater mole and four finger piers; behind the platform at the cliff foot (`y = 6..24 m`), the **Fishing & Cold-Storage Works** (active/refurbished) and deeper **Automated Industry Vaults & Transit Bore** (`y = 6..18 m`, sealed/ruined in refurbished state, connected upward by twin inclined cliff lift shafts).
2. **The Horseshoe "Neocliff" Bastion Ring, City Center & 13 Skylight Courts (`r = 146..292 m`, `y = 84..168 m`)**
   - *Plate 1 (`DWELLINGS`, `RESIDENTIAL`, `GARDENS`, 13 square radial-oculus courts), Plate 2 Fig. 1 (`CITY CENTER`, `GARDENS`, `PUBLIC`), Plate 3 Figs. 1 & 2 (`LIVING`, `PROMENADE`, battered trapezoidal wings, mushroom-pier belvederes).*
   - Two sweeping C-wings (4 West bastions, 5 East bastions = **9 battered trapezoidal Dwelling Bastions**, outer faces sloped inward at ~68° from `r = 290 m` at `y = 84 m` to `r = 214 m` at `y = 144 m`, separated by deep radial buttress fins).
   - Inside the ring (`r = 146..214 m`, `y = 84..144 m`): multi-storey vaulted **City Center** commercial, craft, and civic arcades opening onto the Central Park through monumental two-tier arches, daylit from above by **13 square Courtyard Skylight Wells** (`y = 144 m`) with circular radial-ribbed oculi.
   - Along the crest (`y = 144..168 m`): continuous planted **Garden Promenade** (`y = 144 m`) topped by **6 flared Mushroom-Pier Public & Recreation Belvederes** (`y = 152..166 m`).
3. **The Sheltered Central Park, Waterways & Amphitheatre (`r < 142 m`, `y = 66..84 m`)**
   - *Plate 1 (`PARK`, `WATER WAYS`, two cross-bridges, circular ribbed amphitheatre bowl).*
   - Terraced valley floor stepping from `y = 82 m` at the south throat to `y = 66 m` at the north cliff lip, threaded by a central stream, two still reflection pools, two arched pedestrian/viaduct bridges, orchard/garden terraces, and the **Ribbed Park Amphitheatre** (`x = 28, z = 8 m`).
4. **The Southern Linear City Throat (`x = -62..+62 m`, `z = +204..+468 m`, `y = 84..116 m`)**
   - *Plate 1 (`LINEAR CITY`), Plate 3 Fig. 4.*
   - Twin parallel stepped 6-storey live/work bars flanking a 40 m central avenue, water channel, and transit trough, bridged by **3 circular Drum Plazas**, linking the inland road network straight into the Central Park.
5. **The Domed Rotunda — "Tourist Center" & Residential Drum (`x = -22, z = -122 m`, `R = 44 m`, `y = 70..222 m`)**
   - *Plate 1 (`TOURIST CENTER`), Plate 2 Fig. 1, Plate 3 Figs. 1 & 2.*
   - Soaring fluted vertical cylinder (`152 m` tall from its park-throat terrace to its lantern) with the **Grand Reception / Pilgrim & Tourist Concourse** at its base (`y = 70..94 m`), radial residential & guild floors around a **32 m-wide sunlit atrium** with 4 glass-fronted lift shafts (`y = 94..198 m`), crowned by a **ribbed parabolic vault dome** with central oculus (`y = 198..222 m`).
6. **The Seven Sea-Cliff Skyscrapers & Complex Sky-Crown (`y = 28..300 m`, North Cliff Arc)**
   - *Plate 1 (`VERTICAL STRUCTURE`, `HOUSING COLUMNS`), Plate 2 (`DWELLINGS`, `LIVING-WORKING`, `CULTURAL CENTER`, `PUBLIC`, `GARDENS`, `HELIPORT`, text on 7 skyscrapers ~300 m tall under a complex roof), Plate 3.*
   - **7 cellular H-plan towers** (`T0..T6`, `38 × 34 m` plan) anchored on stepped sea-cliff plinths (`y = 28..56 m`) and rising to `260..300 m`, with cliff-facing cantilevered **Living-Working & Sky-Garden trays** every 24 m.
   - Tied together at `y = 258..300 m` by the **Complex Sky-Crown**: inverted-cone structural struts supporting the **Hanging Sky-Garden Conservatory (`y = 258 m`)**, **Cultural Center & Public Assembly Vaults (`y = 266..282 m`)**, cable-stayed canopy ribs, **300 m Communications Mast**, and the eastern cantilevered **Heliport / Air-Pad (`y = 276 m`)**.

---

## 2. Interior Program: Living, Work, and Recreation (Refurbished Settlement Centerpiece)

Every interior unit in `src/31-af-interiors.js` (`AF_INT`) assigns each storey and room to `sector: 'living' | 'work' | 'rec' | 'infra'`, builds real room polygons, partitions, and doors via `kits/ancients-interiors` (`AI.ringPlate`, `AI.barPlate`, `AI.hallPlate`, `AI.gridPlate`, `AI.RECIPES`), registers camera-independent `KFURN` furniture records at load, and opens interactively in `core/host`'s cutaway (`X`, `[` `]`).

| Cutaway Unit (`id`) | Zone & Elevations | Sectors | Rooms & Recipes | Refurbished State |
|---|---|---|---|---|
| `harbour_works` | Cliff-foot Fishing & Boatyard Hall (`y = 6..18 m`, 2 storeys) | `work` | Fish processing bays (`gridPlate`), cold store (`store-hall`), sail & net loft (`sail-loft`), boatwright workshops (`workshop`) | **Kept & active** |
| `auto_vaults` | Sub-Cliff Automated Industries (`y = 6..12 m`, 1 deep vault) | `work` / `infra` | Automated machine hall (`engine-room`), cargo transfer bays | **Sealed & ruined** (broken partitions, salvage heaps; intact in `?state=intact`) |
| `linear_west` | Linear City West Spine (`y = 84..108 m`, 4 representative storeys) | `work` (L0–1), `living` (L2–3) | Customs reception (`reception`), trade stores & smith/craft workshops (`workshop`, `store`), upper town flats (`bedroom`, `kitchen`) | **Kept & active** |
| `linear_east` | Linear City East Spine (`y = 84..108 m`, 4 storeys) | `work` (L0), `rec` (L1), `living` (L2–3) | Caravan warehouse (`store-hall`), travellers tavern & mess (`crew-mess`, `tavern`), family flats (`bedroom`, `dormitory`) | **Kept & active** |
| `city_west` | West City Center Arcade (`y = 84..116 m`, 4 storeys) | `work` (L0–2), `rec` (L3) | Market concourse, workshops, clinic (`sick-bay`), guild offices (`study`), bathhouse & lounge (`bath`, `hall`) | **Kept & active** |
| `city_east` | East City Center Arcade (`y = 84..116 m`, 4 storeys) | `work` (L0–2), `rec` (L3) | Artisans row (`workshop`), counting house (`reception`), school & archive (`school`, `library`), commons hall (`dining-hall`) | **Kept & active** |
| `bastion_west` | SW Battered Dwelling Bastion (`y = 84..132 m`, 5 stepped storeys) | `living` | Sloped-terrace family apartments (`bedroom`, `dormitory`, `kitchen`, `hall`) stepping inward with the 68° neocliff batter | **Kept & active** |
| `bastion_east` | SE Battered Dwelling Bastion (`y = 84..132 m`, 5 stepped storeys) | `living` | Sloped-terrace apartments & communal kitchens (`bedroom`, `kitchen`, `study`) | **Kept & active** |
| `promenade_rec` | Mushroom-Pier Promenade Belvederes (`y = 152..160 m`, 2 storeys) | `rec` | Sea-view tavern & social club (`stern-lounge`), bathhouse (`bath`), garden greenhouse (`greenhouse`), reading pavilion (`library`) | **Kept & active** |
| `rotunda` | Domed Rotunda ("Tourist Center", `y = 70..190 m`, 6 key storeys) | `rec` (base/top), `work` (L1), `living` (L2–4) | Grand Reception & Gallery (`reception`, `gallery`), Grand Refectory (`dining-hall`), administration (`study`), radial atrium apartments (`ringPlate`, sym 12), Dome Observatory Lounge | **Kept & active** |
| `tower_central` | Central Cliff Skyscraper `T3` (`y = 56..236 m`, 6 representative trays) | `work` (low), `living` (mid/high), `rec` (garden tray) | Soleri `LIVING-WORKING` studios (`workshop`, `study`), cellular tower apartments (`bedroom`, `dormitory`), cliff-tray sky-garden mess (`crew-mess`) | **Kept & active** |
| `sky_crown` | 300 m Sky-Crown Cultural Center (`y = 258..276 m`, 3 storeys) | `rec` & `work` | Hanging Sky-Garden Conservatory (`greenhouse`), Cultural Assembly Hall (`officers-hall`), Sky Library & Sea Chart Deck (`chart-deck`, `library`) | **Kept & active** |

### Refurbishment & Culture Socket (`ARCOFORTE.socket(culture)`)
- **Exterior refurbishment (`?state=refurbished`, default):** Weathered Ancient architectural concrete and pale panels cleaned on kept zones; lost large Ancient plate-glass panes replaced with **bronze-mullioned translucent alabaster/salvage glazing** (warm-lit at night on inhabited bands), intermittent re-awakened cyan circuit strips on the Rotunda and Sky-Crown, timber/canvas awnings and terraced crop planters on the promenade and park, while the deep `auto_vaults` and windward cliff foot show authentic wear and gated bulkheads.
- **`?state=intact`:** Pristine white Ancient panels, clear cyan-tinted glazing, full lighting, intact automated vaults.
- **`?state=ruined`:** Cracked shells, open holes, dead glass, broken crown/bastion bays, `KRUBBLE` collapse mounds watched by `KRUINS.watch`.
- **Live Culture Socket:** `ARCOFORTE.socket(culture)` (`'refurbished'`, `'ancient'`, `'scrap'`, `'iziz'`, `'xanadu'`, `'highlands'`) re-runs `AI.furnishPlan` with that culture's catalog pieces and hall-recipe dress across every inhabited `living`, `work`, and `rec` room, updating `KFURN` records and any open cutaway batch live.

---

## 3. Acceptance Frames (`VISUAL-BAR.md`)
1. **Vista (`Sea cliff vista`):** Offshore NW perspective looking across the breaking sea and multilevel harbour lift platform up the 300 m seven-tower cliff face and Sky-Crown, with the Domed Rotunda and battered Neocliff bastions wrapping behind.
2. **Ground-level (`Central park and waterways`):** Standing on the south park terrace beside the flowing waterway, reflection pool, and ribbed amphitheatre, looking across the arch footbridge through the vaulted City Center arcades up to the fluted Domed Rotunda and Sky-Crown.
