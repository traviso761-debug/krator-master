# Ria Dynasty Architectural Kit (`kits/ria`) — Plan

## 1. Scope & Dynastic Lore ("The Two Reaches")

Across `Ria Valley` (`Mā-Rīa`), civilization cycles Egyptian-style between **Unions** (when one High-Monarch holds both `Heartland` and `Upper Ria` plus the `Weeping Valley` river-forts, often subduing `Arcflow`) and **Sunderings** (`CROOK-RIA-DECISIONS.md` §2.4, §2.6). At game start the valley stands divided into two above-ground monumental river-and-terrace sister courts sharing one 64-sign Amber-Seal syllabary and two spoken branches of *Proto-Ria*:

1. **Lower Ria / Western Dynasty (`Heartland` `796, 176` & `Ria Sound` `626, 140` — Low-Ria *Rīwa-Tōka*, `style: 'lower-ria'`):**
   - **Linguistic shift:** Mississippian / Muskogean labial-preserving shift (`crown -> kulūną`, `stone -> sitōną`, `amber -> āmpala`, `palace-barge -> pālasi-bāča`, `weeping valley -> Wīpi-wāli`).
   - **Hereditary emblem:** **5-Headed Gilded *Uktena* River-Serpent** (`raNagaHead5`, `raNagaRail`).
   - **Fusion grammar:** Kiln-fired Babylonian polychrome glazed-brick battered pylons (`cobalt`-lapis, `emerald`-celadon, `saffron`-gold) + Classical fluted `travertine` round-arch arcades & peristyles + Egyptian cavetto cornices, crowned by **3-to-7-tier Thai Rattanakosin *Prasat* & Burmese Konbaung *Pyatthat* glazed-tile roofs**, upturned gilded *chofa* / *hang hong* flame-finials, dark-`teak` and `crimson`-lacquer joinery, and lotus-canal waterworks.

2. **Upper Ria / Eastern Dynasty (`Upper Ria` `1186, 118` & `Neo-Ozarks` `1135, 153` — High-Ria *Līwa-Tōga*, `style: 'upper-ria'`):**
   - **Linguistic shift:** Cherokee / Iroquoian bilabial-to-`kw/gw` and `r -> l` shift (`crown -> kwalūna`, `amber -> ākwala`, `upper ria -> Ākwala-Līwayi`, `palace-barge -> kwālasi-gwātsa`, `weeping valley -> Wīkwi-wāliyi`, `spring -> sikwīngi`).
   - **Hereditary emblem:** **Silver-Bronze Crested Water-Swan (*Hongsa*)** (`raHongsaSculpt`, `raHongsaRail`, `raSwanFinial`).
   - **Fusion grammar:** Cut imperial `porphyry` & cream-white karst `dolomite` ashlar + Classical/Egyptian lotus-and-papyrus colonnades + **Compass-Hills `lodestone`-capped obelisks** (`lodestone = 220`), crowned by **Khmer Angkor stone *Prangs***, **Northern Lanna / *Wat Rong Khun* white-`alabaster` & `indigoslate` multi-tiered *Prasat* roofs**, **Bagan/Nusantara upturned `copper`-and-slate lotus domes**, circular Mandala cloisters, and open-air karst shut-in counterweight boat-lifts.

## 2. Core adoption

Built directly on `core/engine` (`kits/spider-lake/build.py` pattern), reading every core module in place with zero vendored infrastructure:

| Module | Role in `kits/ria` |
|---|---|
| `core/engine` | Merged world-space material buckets (`30-geo.js`), `defBuilding` & `place` (`36-def.js`), operable doors & glass (`36o-open.js`), stairs (`36s-stair.js`), box walk reader (`37-wk-rec.js`), furnishing (`91f-furnish.js`), night lights (`91n-night.js`), host take (`99-host-take.js`) |
| `core/rand` (`KRAND`) | Deterministic seeded placement, `MAT_ALT` material variation (`31-alt-takes.js`) and `KTAGS.uid` |
| `core/tags` (`KTAGS`) | Every placed building and furniture piece registered with `culture: 'ria'`, `style: 'lower-ria' \| 'upper-ria'`, `types`, `wealth`, `role`, `job` |
| `core/materials/record` (`KMAT`) | 88 packed library & `f_*` detail families in `materials.json` -> `tex/` (`dist/ria.tex.js` sidecar) |
| `core/furnish` (`KFURN`) | Indexed catalog + 14 bespoke `ria_*` furniture pieces (`39-ra-furn.js`) |
| `core/door` (`KDOOR`, `KGLASS`) | Operable single/double doors (`raDoor` -> `svLeaf`) and glazed windows (`raWindow` -> `svPane`) |
| `core/walk` & `core/walk/box` | Clean floors (`wkPad`, `svFloor`), stairs (`svStair`, `svStripWalk`), and explicit full-height wall blocks (`raWallBlock`) |
| `core/water` (`WATER`) | Flowing lotus-basin, canal water-gate, karst spring-pool, and shut-in boat-lift streams (`91z-ra-world.js`) |
| `core/atmos` + `placeholder` | `KratorSky`, PBR environment skylight, and wind hooks on ceremonial banners |
| `core/drawn` (`KDRAWN`) | Ground grid registration for camera clearance checks |
| `core/host` (`KHOST`) | Standard viewer controls (`X` cut-away, `E` door, `N` night, `F` walk, inspector, polygon tool) |

## 3. The 16 Demo Buildings (Two Dynastic Rows in `89-rows.js`)

### Row 1 — Lower Ria / Western Dynasty (*Rīwa-Tōka*, `style: 'lower-ria'`)
1. `ra_west_prasat_palace` — **Chakri-Ishtar Grand Sovereign Prasat Palace**
2. `ra_west_lotus_pavilion` — **Emerald-Celadon Star Sala-Nam Water-Pavilion Complex**
3. `ra_west_pyatthat_hall` — **Konbaung-Babylon Crimson-Teak 7-Tier Pyatthat Tribute Hall**
4. `ra_west_prang_cloister` — **Rattanakosin River-Ghat Prang and Colonnaded Sanctuary**
5. `ra_west_water_gate` — **Ishtar-Pyatthat Fortified Canal Water-Gate and Covered Bridge**
6. `ra_west_spiral_beacon` — **Mandalay-Ziggurat Helical Glazed-Brick River Watchtower**
7. `ra_west_arcade_villa` — **Riwa-Toka Classical Arcade and Teak-Veranda Merchant Mansion**
8. `ra_west_stilt_house` — **Heartland Ruan-Thai Raised Teak House on Glazed-Brick Flood Piers**

### Row 2 — Upper Ria / Eastern Dynasty (*Līwa-Tōga*, `style: 'upper-ria'`)
1. `ra_east_swan_prasat` — **Akwala-Liwayi White-Dolomite and Indigo-Slate Grand Hongsa Terrace-Palace**
2. `ra_east_mandala_cloister` — **Circular Dolomite and Porphyry Mandala Cloister and Shikhara-Prang Sanctuary**
3. `ra_east_lotus_dome` — **Bagan-Ptolemaic Upturned-Tiered Lotus-Dome Concourse**
4. `ra_east_gopura_gate` — **Egyptian-Angkor Battered Porphyry Pylon and Prang Fortress Gate**
5. `ra_east_boatlift_hall` — **Karst Shut-In Counterweight Boat-Lift and Tiered Sala Pavilion**
6. `ra_east_saffron_viharn` — **Upper-Ria Colonnaded Saffron and Treaty Viharn Hall**
7. `ra_east_peristyle_villa` — **Liwa-Toga Porphyry-Peristyle and Lanna-Gable Patrician Villa**
8. `ra_east_terrace_house` — **Upland Porphyry-Plinth and Shan-Lanna Tiered-Roof Townhouse**

## 4. Walkability, Solid Ceilings & Zero Z-Fighting Invariants

- **100% Solid Interior Ceilings & Soffits:** `raTieredRoof` emits an explicit coffered ceiling slab (`raCeilingSlab`) at eave base plus a solid horizontal soffit slab on every telescopic tier; `raOctPavilionRoof`, `raPrasatSpire`, `raPrang`, and `raLotusDome` emit explicit `{inward: true}` interior ceiling/vault soffits inset `>= 5 cm` inside the exterior `lathe` shells closing cleanly to `r = 0.01`. Verified at run time by `_api.ceilingAudit()`.
- **100% Clean `KWALK` Walkability:** All decorative masonry courses, socles, sills, cornices, balustrades, columns, roofs, and curbs execute inside `svNoWalk(() => ...)`, while walls register full-height (`h >= 0.82 m`) collision blocks via `raWallBlock(...)` split cleanly around operable `raDoor` portals. Verified at run time by `_api.reachAudit()` (`0` missed targets, `0` unreached floors).
- **Zero Coplanar Z-Fighting:** Adjacent material surfaces step by `>= 2 cm` (`0.02 m`) in normal offset. Verified across all world and furniture triangles by `_api.zfightAudit()`.
