# Urban Tabisti Architectural Kit (`kits/tabisti`) — Design & Implementation Plan

## 1. Purpose & In-World Geography

`kits/tabisti` expands Tabisti architecture from marsh-delta salvage villages (`kits/eastern-abyssal`) into a full, `core/city`-ready **urban building kit** on `core/engine` for the lifted northern East Abyss bench city-states (**Sfenops** `1282, 663`, **Middle Tabisti** `1311, 761`, and **Liikofi** `1316, 797`) plus urban treaty/merchant wards in **Mungo** (`1322, 828`) and **Lower Verge**.

Following Ruling #43 (`core/region/CONTINENTAL-SCOPE.md`), the northern East Abyss bench stands at **`-1,358` to `-1,433 m` ASL (`1.90–1.91 atm`, `30–33 °C`, `~1,600–1,700 mm/yr` monsoon rain)** beside potash/gypsum salt lakes (`clay: 255`, `potash: 253`, `gypsum: 254`, `alabaster: 203`, `silica: 150`, `copper: 170`, `turquoise: 63`, `tin: 200`, `zinc: 136`, `gold: 110`, `wood: 255`, `coal: 147`, plus `Liikofi`'s **`abyss-lac`** lacquer).

In-world, **Tabisti *trencadís* mosaic and alkaline-teal glazed tilework are the urban evolution of marsh-delta `tinmirror` salvage** (`LORE.md` §6.9) paired with centuries of cultural exchange with Gaudí-esque **Yuni**: where delta kin clad stilt shacks in glittering flattened cans and bottle glass, urban *Ibisen* guilds fire abundant lake-marl clays, silica, potash, and copper into shimmering broken-tile mosaics, embossed geometric relief brick, and Zsolnay-style glazed roofs.

In multi-kit settlements (`KRATOR_KITS`), walled bench cores zone to `tabisti` (`style: 'urban'`) while lakeside and marsh skirts zone to `eastern-abyssal`.

## 2. Core Adoption (`check_core_use.py` Mandatory Table)

| Core Module | How `kits/tabisti` Adopts It |
|---|---|
| `core/engine` | Read in place via `engine.py` (`defBuilding`, material-keyed merged buffers, contact sheet, host hand-over); zero shadowed engine files |
| `core/rand` (`KRAND`) | Every placement, *trencadís* patch seed, tile-band rhythm, and variant draw hashes `(world, cell, id, salt)`; zero `Math.sin` or draw-order PRNG |
| `core/tags` (`KTAGS`) | Every building, sub-part, opening, and fixture registered before drawing (`culture: 'eastabyss'`, `style: 'urban'`); `x == null ? d : x` numeric defaults |
| `core/materials` (`KMAT` + `KMAT_M1`) | Uniform-keyed standard materials (`K1`), `tex/` packed via `tools/textures/pack.py` (`M2` normal mip-variance AA on glazes/lacquer/verdigris, `M3` planar POM & `M4` base AO on embossed brick/ashlar) |
| `core/door` & `core/glass` | Operable carved cedar/bronze-strapped doors (`KDOOR`), stained *qamariya* & cross-mullioned lantern panes (`KGLASS`) |
| `core/walk` (`KWALK`) | Walkable raised colonnade plinths, recessed street loggias, courtyard stairs, and upper *ayvan* galleries (`0` unreached floors) |
| `core/interiors` & `core/furnish` | Room shells & catalog/bespoke `eastabyss` furniture wired to `KROOMLIGHT` (`I1`–`I4`) with `X` roof cut-away & `U` outline |
| `core/water` (`WATER`) | Flowing shallow turquoise-tiled courtyard *shadirvan* evaporative channels, potash brine pans, and lake-quay canals |
| `core/atmos` & `core/host` | Standard skybox (`KratorSky`), `KHOST` standard keymap (`I` inspect, `P` marks, `M` minimap, `F` walk, `E` doors), shared `tools/harness.py` in `verify.py` |

## 3. Reference Plates (`kits/tabisti/refs/`)

- **A1** (*Shah-i-Zinda*, Samarkand): High-relief molded alkaline-teal, turquoise & cobalt *kashi* strapwork, twisted ceramic colonnettes, and Tifinagh `ⵣ` salt-mark friezes on buff/rose brick portals.
- **A2** (Bukhara/Khiva *ustun*): Tapered carved cedar column with polychrome stalactite *muqarnas* capital supporting deep shade *ayvans*.
- **A3–A4** (*Kundal* coffered ceilings & *ganch* panels): High thermal-stratification ceiling coffers varnished in moisture-proof `abyss-lac`; crisp white carved *ganch* gypsum panels recessed inside exposed brick frames strictly under sheltered verandas/loggias.
- **A5** (Verdigris & gilt imbricated column): Salt-air-proof cast bronze columns patinated to verdigris teal with gilded relief scales and acanthus bases (`leafscale` + `verdigris` + `gilt`).
- **B1** (`refs/b1-lechner-zsolnay-roof.png`): Ödön Lechner Secessionist hall — steep monsoon-shedding Zsolnay teal/cobalt diamond-glazed roofs, verdigris globe finials, warm beige stucco framed by rose-brick pilasters & curvilinear terracotta trim, pierced ceramic roundels, and open brick corner belvederes.
- **B2** (`refs/b2-raichle-recessed-loggia.png`): Raichle Palace — deep double-height recessed street/court breeze loggia arch, sinuous rose-terracotta moldings, teal *trencadís* spandrels, and projecting verdigris-framed bay-oriels.
- **B3** (`refs/b3-modernisme-escata-spire.png`): Catalan Modernisme open-arched stone belvedere lantern crowned by a concave octagonal spire of yellow-beige & rose-crimson glazed fish-scale (*escata*) tiles and *trencadís* collar.
- **B4** (`refs/b4-gaudi-trencadis-lantern.png`): Gaudí octagonal ventilation lantern — white/teal/cobalt *trencadís* broken-tile drum, cantilevered zigzag brick corbels shading cross-mullioned breeze windows, serrated brick crown, and mosaic dome.
- **B5** (`refs/b5-el-capricho-wind-tower.png`): Gaudí *El Capricho* — buff/rose brick horizontally coursed with embossed teal-and-ochre ceramic relief tile bands, open 4-column breezy ground portico, and cylindrical glazed-teal solar wind-chimney tower with stepped brick corbels, iron breeze balcony, and open 4-pillar cupola.

## 4. Six Bioclimatic Airiness Laws (`1.90 atm` Humid Heat Dispersion)

1. **Permeable Ground Floors & Vented Plinths (`tbPorticoPlinth`):** Raised `0.45–0.85 m` stone/brick flood plinths with terracotta undercroft vent grilles and open 4-column corner porticos (`B5`), souq arcades, or deep recessed *iwans* (`B2`).
2. **Solar-Glazed Stack Chimneys & Open *Mirador* Lanterns (`tbWindTower`, `tbTrencadisLantern`, `tbEscataSpire`):** Every multi-storey or enclosed building carries `>= 1` solar-heated glazed wind-chimney tower or open roof lantern driving dense-air (`~2.2 kg/m³`) thermal updrafts.
3. **High-Ceilinged *Ayvan* Verandas & `abyss-lac` Coffered Plenums (`tbUstunAyvan`, `tbKundalCeiling`):** Generous storey heights (`3.6–4.4 m` residential, `5.0–6.6 m` civic) with deep *ustun* verandas (`A2–A4`).
4. **Breathing Walls — Perforated Brick *Claustra* & Verdigris Oriels (`tbClaustraScreen`, `tbVerdigrisOriel`):** Openwork honeycomb buff/rose brick screens and louvered verdigris bay-oriels scooping lake breezes.
5. **Monsoon-Armored Glazed Roofs vs. Sheltered *Ganch* (`tbZsolnayRoof`, `tbGanchPanel`):** Sky-exposed crowns wear glazed Zsolnay, *escata*, or *trencadís* ceramic with wide eaves; soluble white *ganch* gypsum stucco is strictly confined under porch/loggia/veranda roofs (`0` sky-exposed `ganch` faces).
6. **Zero Domestic Electricity + Evaporative *Shadirvan* Basins (`tbShadirvanPool`):** Warm oil/lac-resin pierced-brass lanterns (`KROOMLIGHT`) and shallow turquoise-tiled courtyard evaporative cooling basins (`WATER`).

## 5. Roster Summary (`50` `defBuilding`s, Seeds `10401..10450`, `44/44` Voth Census Trades)

- **Row 1 — Urban Dwellings (`11` defs, `10401..10411`):** `tb_breeze_cot`, `tb_loggia_row`, `tb_tenement_court`, `tb_tahawst_mid`, `tb_capricho_villa`, `tb_oriel_townhouse`, `tb_shop_house`, `tb_lac_merchant_bayt`, `tb_secession_palazzo`, `tb_mirador_estate`, `tb_servant_quarters` (covering all 6 `(poor|middle|rich) x (dwelling-single|dwelling-multi)` cells).
- **Row 2 — Bazaar, Guild Crafts & Signature Works (`10` defs, `10412..10421`):** `tb_souq_arcade`, `tb_kashi_kiln`, `tb_lac_refinery`, `tb_incense_distillery`, `tb_ganch_mason_yard`, `tb_bronze_foundry`, `tb_potash_evaporator`, `tb_weaver_dyehouse`, `tb_tannery_airy`, `tb_bakery_tannur`.
- **Row 3 — Provisioning, Caravanserai, Mills & Lake Port (`9` defs, `10422..10430`):** `tb_butcher_icehouse`, `tb_tea_tavern`, `tb_caravanserai_urban`, `tb_windmill_grist`, `tb_bonded_warehouse`, `tb_power_steamhouse`, `tb_boatyard_urban`, `tb_lake_quay_customs`, `tb_beacon_tower`.
- **Row 4 — Sacred Salt-Crystal Altar & Patrician Civic State (`9` defs, `10431..10439`):** `tb_temple_altar_grand`, `tb_wayside_salt_shrine`, `tb_necropolis_qubba`, `tb_monk_chapterhouse`, `tb_palace_ahedman`, `tb_syndic_guildhall`, `tb_madrasa_library`, `tb_bimaristan_clinic`, `tb_embassy_compound`.
- **Row 5 — Ventilated City Fortifications & Peri-Urban Estates (`11` defs, `10440..10450`):** `tb_wall_curtain`, `tb_wall_bastion`, `tb_wall_corner`, `tb_wall_gate`, `tb_barracks_court`, `tb_orchard_estate`, `tb_saltrice_manor`, `tb_buffalo_byre`, `tb_beetle_lizard_kraal`, `tb_cellar_fungus`, `tb_fish_curing_pier`.
