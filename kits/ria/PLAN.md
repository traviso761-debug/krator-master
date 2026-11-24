# Ria Dynasty Architectural Kit (`kits/ria`) — Plan

## 1. Scope & Dynastic Lore ("The Two Reaches")

Across `Ria Valley` (`Mā-Rīa`), civilization cycles Egyptian-style between **Unions** (when one High-Monarch holds both `Heartland` and `Upper Ria` plus the `Weeping Valley` river-forts, often subduing `Arcflow`) and **Sunderings** (`CROOK-RIA-DECISIONS.md` §2.4, §2.6). At game start the valley stands divided into two above-ground monumental river-and-terrace sister courts sharing one 64-sign Amber-Seal syllabary and two spoken branches of *Proto-Ria*:

1. **Lower Ria / Western Dynasty (`Heartland` `796, 176` & `Ria Sound` `626, 140` — Low-Ria *Rīwa-Tōka*, `style: 'lower-ria'`, 38 buildings):**
   - **Linguistic shift:** Mississippian / Muskogean labial-preserving shift (`crown -> kulūną`, `stone -> sitōną`, `amber -> āmpala`, `palace-barge -> pālasi-bāča`, `weeping valley -> Wīpi-wāli`).
   - **Hereditary emblem:** **5-Headed Gilded *Uktena* River-Serpent** (`raNagaHead5`, `raNagaRail`).
   - **50/50 Fusion grammar:** Kiln-fired Babylonian polychrome glazed-brick Ishtar portals & battered pylons (`cobalt`-lapis, `emerald`-celadon, `saffron`-gold) + Persepolitan double-protome capitals + Classical fluted `travertine` round-arch arcades, Pantheon stepped saucer-rotundas, Minoan courts & crow-step merlons, balanced 50/50 with 3-to-7-tier Thai Rattanakosin *Prasat* & Burmese Konbaung *Pyatthat* glazed roofs, cruciform *Sala-Nam* water pavilions, glazed *Prangs*, and raised *Ruan-Thai* dark-`teak` halls.

2. **Upper Ria / Eastern Dynasty (`Upper Ria` `1186, 118` & `Neo-Ozarks` `1135, 153` — High-Ria *Līwa-Tōga*, `style: 'upper-ria'`, 38 buildings):**
   - **Linguistic shift:** Cherokee / Iroquoian bilabial-to-`kw/gw` and `r -> l` shift (`crown -> kwalūna`, `amber -> ākwala`, `upper ria -> Ākwala-Līwayi`, `palace-barge -> kwālasi-gwātsa`, `weeping valley -> Wīkwi-wāliyi`, `spring -> sikwīngi`).
   - **Hereditary emblem:** **Silver-Bronze Crested Water-Swan (*Hongsa*)** (`raHongsaSculpt`, `raHongsaRail`, `raSwanFinial`).
   - **50/50 Fusion grammar:** Cut imperial `porphyry` & cream-white karst `dolomite` ashlar + flat-topped battered Egyptian cavetto pylons + green palm-frond capitals + Classical Greco-Roman rotunda-peristyles, market stoas, Pantheon domes & Pompeian-Minoan tapered-porphyry courts + **Compass-Hills `lodestone` obelisks** (`lodestone = 220`), balanced 50/50 with Khmer Angkor stone *Prangs*, Northern Lanna `alabaster` & `indigoslate` *Prasat* spires, patinated `copper` foundry roofs (`zinc = 90`), and karst counterweight boat-lifts.

## 2. Core adoption & Vertical-Stack Graphics (`GRAPHICS-TERRAIN-PROPOSAL.md`)

Built directly on `core/engine` (`kits/spider-lake/build.py` pattern), reading every core module in place with zero vendored infrastructure, and natively adopting Stages 1, 5 (`M1`–`M4`), 7 (`I1`–`I4`), and §12d (`K1`–`K4`):

| Module | Role in `kits/ria` |
|---|---|
| `core/engine` | Merged world-space material buckets (`30-geo.js`), `defBuilding` & `place` (`36-def.js`), operable doors & glass (`36o-open.js`), stairs (`36s-stair.js`), box walk reader (`37-wk-rec.js`), furnishing (`91f-furnish.js`), night lights (`91n-night.js`), host take (`99-host-take.js`) |
| `core/materials/record` (`KMAT`, `KMAT_M1`) | 88 packed library & `f_*` detail families (`materials.json` -> `tex/` + `mip-variance.json`), `K1` uniform-deduplicated shader hooks (`<= 28` programs, `<= 12` samplers), `M2` `km1RoughAA` specular anti-aliasing, `M3` 6-step planar POM (`< 18 m`), `M4` plot-base contact AO (`0.74 -> 1.00`) & concave mortar cavity (`27v-ra-vstack.js`) |
| `core/interiors` (`KROOMLIGHT`) | Stage 7 (`I1`–`I4`) room-graph portal daylight & warm-lamp bounce over `CURREC.rooms`, driving a persistent 6-`PointLight` pool (`91r-ra-roomlight.js`) |
| `core/rand` (`KRAND`) | Deterministic seeded placement, `MAT_ALT` material variation (`31-alt-takes.js`) and `KTAGS.uid` |
| `core/tags` (`KTAGS`) | Every placed building and furniture piece registered with `culture: 'ria'`, `style: 'lower-ria' \| 'upper-ria'`, `types`, `wealth`, `role`, `job` |
| `core/furnish` (`KFURN`) | Indexed catalog + 14 bespoke `ria_*` furniture pieces (`39-ra-furn.js`) |
| `core/door` (`KDOOR`, `KGLASS`) | Operable single/double doors (`raDoor` -> `svLeaf`) and glazed windows (`raWindow` -> `svPane`) |
| `core/walk` & `core/walk/box` | Clean floors (`wkPad`, `svFloor`), stairs (`svStair`, `raStripWalk`), and explicit full-height wall blocks (`raWallBlock`) |
| `core/water` (`WATER`) | Flowing lotus-basin, canal water-gate, karst spring-pool, boat-lift, and skiff-boathouse streams (`91z-ra-world.js`) |
| `core/atmos` + `placeholder` | `KratorSky`, PBR environment skylight, and wind hooks on ceremonial banners & dyed silk skeins |
| `core/drawn` (`KDRAWN`) | Ground grid registration for camera clearance checks |
| `core/host` (`KHOST`) | Standard viewer controls (`X` cut-away, `E` door, `N` night, `F` walk, inspector, polygon tool) |

## 3. Full 76 Settlement-Ready Buildings (`89-rows.js`, `72-ra-trades.js`, `kit_bundle.py`)

Both dynastic branches carry complete residential coverage (`poor`, `middle`, `rich` across both `dwelling-single` and `dwelling-multi`), full `military` (`6` per branch) and `infrastructure`/logistics (`7` per branch) rosters, all 44 Voth census trades (`RA_TRADES` in `src/72-ra-trades.js`), and a sealed settlement bundle (`kits/ria/kit_bundle.py` -> `RIK`):

- **Lower Ria (`38` buildings across Rows 1–3):**
  - *Row 1 — Palaces, Chancellery & Sacred Precincts (13):* `ra_west_prasat_palace`, `ra_west_chakri_chancellery`, `ra_west_mondop_library`, `ra_west_celadon_prang_terrace`, `ra_west_bussabok_gate`, `ra_west_lotus_pavilion`, `ra_west_pyatthat_hall`, `ra_west_prang_cloister`, `ra_west_covered_bazaar`, `ra_west_lotus_thermae`, `ra_west_amber_scriptorium`, `ra_west_caravanserai_inn`, `ra_west_spiral_beacon`
  - *Row 2 — Military, Logistics & Trade Works (16):* `ra_west_strategion_keep`, `ra_west_ishtar_barracks`, `ra_west_curtain_bastion`, `ra_west_boom_arsenal`, `ra_west_siege_armoury`, `ra_west_mule_castellum`, `ra_west_water_gate`, `ra_west_crane_wharf`, `ra_west_weigh_station`, `ra_west_courier_mansio`, `ra_west_aqueduct_cistern`, `ra_west_barge_commissary`, `ra_west_ziggurat_granary`, `ra_west_glaze_kiln`, `ra_west_silk_dyeworks`, `ra_west_bronze_smithy`
  - *Row 3 — All Dwelling Classes, Rich to Poor, Single & Multi-Family (9):* `ra_west_clan_compound`, `ra_west_mandarin_court`, `ra_west_arcade_villa`, `ra_west_insula_apartments`, `ra_west_artisan_shophouse`, `ra_west_stilt_house`, `ra_west_courtyard_tenement`, `ra_west_canal_cottage`, `ra_west_mudbrick_hut`
- **Upper Ria (`38` buildings across Rows 4–6):**
  - *Row 4 — Palaces, Pantheon & Sacred Precincts (13):* `ra_east_swan_prasat`, `ra_east_thepbidorn_pantheon`, `ra_east_kinnara_dromos`, `ra_east_archon_dicastery`, `ra_east_caryatid_reliquary`, `ra_east_mandala_cloister`, `ra_east_lotus_dome`, `ra_east_gopura_gate`, `ra_east_saffron_viharn`, `ra_east_stoa_agora`, `ra_east_karst_thermae`, `ra_east_pilgrim_serai`, `ra_east_skiff_boathouse`
  - *Row 5 — Military, Logistics & Trade Works (16):* `ra_east_acropolis_keep`, `ra_east_cavetto_watchfort`, `ra_east_pylon_rampart`, `ra_east_chain_drydock`, `ra_east_bronze_arsenal`, `ra_east_pack_castellum`, `ra_east_boatlift_hall`, `ra_east_counterweight_wharf`, `ra_east_caravan_tollhouse`, `ra_east_pass_relay`, `ra_east_spring_castellum`, `ra_east_terrace_depot`, `ra_east_cliff_granary`, `ra_east_zinc_foundry`, `ra_east_stone_atelier`, `ra_east_saffron_press`
  - *Row 6 — All Dwelling Classes, Rich to Poor, Single & Multi-Family (9):* `ra_east_patrician_manor`, `ra_east_archon_residences`, `ra_east_peristyle_villa`, `ra_east_veranda_insula`, `ra_east_lapidary_shophouse`, `ra_east_terrace_house`, `ra_east_stepped_tenement`, `ra_east_karst_cottage`, `ra_east_quarry_shack`

## 4. Walkability, Solid Ceilings & Zero Z-Fighting Invariants

- **100% Solid Interior Ceilings & Soffits:** `raTieredRoof` emits an explicit coffered ceiling slab (`raCeilingSlab`) at eave base plus a solid horizontal soffit slab on every telescopic tier; `raOctPavilionRoof`, `raPrasatSpire`, `raPrang`, `raLotusDome`, and `raPantheonRotundaDome` emit explicit `{inward: true}` interior ceiling/vault soffits inset `>= 5 cm` inside the exterior `lathe` shells closing cleanly to `r = 0.01`. Verified by `_api.ceilingAudit()`.
- **100% Clean `KWALK` Walkability:** All decorative masonry courses, socles, sills, cornices, balustrades, columns, kilns, furnaces, roofs, and curbs execute inside `svNoWalk(() => ...)`, while walls register full-height (`h >= 0.82 m`) collision blocks via `raWallBlock(...)` split cleanly around operable `raDoor` portals. Verified by `_api.reachAudit()` (`0` missed targets, `0` unreached floors across all `76` buildings).
- **Zero Coplanar Z-Fighting:** Adjacent material surfaces step by `>= 2 cm` (`0.02 m`) in normal offset. Verified across all `1.02M+` world and furniture triangles by `_api.zfightAudit()`.
