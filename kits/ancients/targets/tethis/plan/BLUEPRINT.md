# Tethis: the Pelagic Saucer Arcology — Blueprint & Functional Plan

An Ancient aquatic live/work/recreation arcology built on clustered pylons in open sea (`kits/ancients/targets/tethis`), after **Paolo __SOLERI_TETHIS_MD__ I/II* and *Babel IID***, **Kiyonori Kikutake's *Marine City / Unabara***, and the owner's four reference plates.

All metrics, coordinates, rules, and blueprint sheets come from one `[G data]` source (`../8az0-tethis-plan.js`), verified in Node (`../test-tethis.js`) and rendered through the shared palace-blueprint generator (`settlements/voth/palace/blueprint.py` via `tethis_blueprint.py`):

```bash
python3 kits/ancients/targets/tethis/plan/tethis_blueprint.py   # writes sheets/*.png, AREAS.md, FURNITURE.md
node kits/ancients/targets/tethis/test-tethis.js                # 15 ktest.js checks + negatives
```

---

## 1. The Owner's Brief & Settled Forks

- **Form & Reference Synthesis**:
  1. **Clustered Brutalist / Soleri Pylons & Garden Saucers** (*Ref 1*, `arco1 #36`): fluted/panelled vertical pier clusters tied by cross-collars plunging into deep water, carrying thick bullnosed saucer platforms topped by lush gardens and curved warm-lit ribbon-glazed conservatories, joined by elevated skybridge balconies with mid-water hexagonal belvedere pylon nodes (`J1`, `J2`).
  2. **Multi-Deck Hub Saucer, Cantilevered Satellite Dishes & Submerged Rotunda** (*Ref 2*, `arco1 #45`): stepped concentric ribbon-glazed hub decks (`P0`), raked diagonal struts carrying satellite saucers (`S0a`, `S0b`, `S0c`) aloft, and **submerged annular saucer pods (`U0`, `U1`, `U4`, `U6`)** suspended on the pylons beneath the waterline (`y = -24.5 .. -7.5 m`) over a `-21.5 .. -35 m` carbonate coral reef shelf.
  3. **Soaring Ribbed Mushroom Towers** (*Ref 3*): flared sea-gate trunk rising 218 m (`T0`, with a companion 166 m mushroom belvedere `T4` on `P4`), mid-stem cantilevered blister pods (`+78`, `+106`, `+132 m`), flaring into a 216 m-wide saucer cap (`R = 108 m`) with 24 warm-lit radial soffit ribs, rooftop rain-catchment dome, cupola, and sensor spires.
  4. **Geometrically Aligned Marine Lattice & Capsule-Studded Towers** (*Ref 4*): a strict `390 m` hexagonal ring of circular lagoon-pierced platforms (`P0` + `P1..P6`) extended along the east-west axis (`P7` Sea-Gate at `-645 m`, `P8` Heavy Smelter at `+645 m`), linked by straight radial spokes, hexagonal ring chords, and twin parallel harbour viaducts, crowned by **stacked cylindrical Metabolist/Soleri drums studded with radial dwelling capsules (`T1a..T5`)** and **segmented industrial condenser columns with T-crane heads (`T6a`, `T6b`)**.
- **Scale & Peak Population**: `1,448 × 956 m` footprint, `-24.5 m` to `+218 m` vertical envelope, **346.6 ha** total built floor, **36,017 peak Ancient residents** at Krator's standard generous daylight-lit residential density (`45 m²` gross per person).
- **Modern Condition (Guided by Original State)**: Inhabited by **~6,420 Hykkousoi** (the rib-gilled seafarers of `LORE.md` §6.16): upper residential and garden saucers kept dry and expanded with **grown nacre barnacle-pods, scallop windscreens, and a helical conch-stair up `T0`**, alongside **intentionally flooded underwater saucers (`U0`, `U1`, `U4`)** that serve as gill-folk sanctuaries, pearl-oyster vaults, and the drowned etched-tablet Gene-Scriptorium where air-breathers cannot follow.

---

## 2. Core Adoption (Required Before Phase 2 3D Build)

Per `README.md` ("CORE MODULES ARE NOT OPTIONAL") and `kits/ancients/NOTES.md` (Theodiga's core adoption pattern):

| Core Module | Taken | Role in `kits/ancients --target tethis` |
|---|---|---|
| `core/rand` (`KRAND`) | **Yes** (now) | Every placement, seabed ripple, pylon barnacle band, and Hykkousoi pod draws from `KRAND.child(seed, id)` / `KRAND.fbm`; seed `0` honoured |
| `core/tags` (`KTAGS`) | **Yes** | Every platform, tower, satellite dish, submerged pod, skybridge, pylon, and Hykkousoi addition registered in `KTAGS` before drawing (`TAGS_TARGETS`) |
| `core/water` (`WATER`) | **Yes** | Open sea & sheltered lagoon water (`y = 0`) on `core/water`, with underwater visibility / depth tint for submerged pods `U0..U6` |
| `core/atmos` (`ATMOS`) | **Yes** (water & skylight) | Shared wave field (`#include <atmos_waves>`) and `ATMOS.skylight` reflections bound as `theodiga` / `kits/port` bind them |
| `core/ruins` (`KRUINS`) | **Yes** | Watches cut-off Salvage Island `P8` and the collapsed `B_6_8` span (`KRUINS.watch`): asserts nothing floats and every wreck lies seated on the deck or seabed |
| `core/lod`, `core/materials`, `core/door` | **Yes** | Shared `kits/ancients` LOD chunking, packed library textures (`dist/ancients.tex.ancients.js`), and `KDOOR` / `KGLASS` openings |
| `kits/catalog`, `kits/interiors`, `kits/ancients-interiors` | **Blueprint manifest ready** | `FURNITURE.md` maps every room to `ancients_*` and `hykkousoi_*` catalog pieces; ready for interior cutaway / settlement wiring |
| `core/host`, `core/world`, `core/city` | **Not yet** (`kits/ancients` target) | As on `theodiga` and `arcpile`, the Ancients kit's showcase host runs all kit targets; when placed on the open-world Ring Sea map later, `core/world` supplies the region sea and coast |

---

## 3. Architectural Precedents & Spatial Principles

1. **__SOLERI_TETHIS_MD__ I* & *Babel IID* — Skin is for Living, Core is for Works, Courts Breathe**:
   Dwellings (`LIVE`, `162.1 ha`) never sit in windowless deep plates; every apartment lies within `14 m` of a stepped sea-rim balcony, an inner lagoon well, a radial light-court, or a plug-in tower capsule face (`RULES.daylightHousingLaw`). Heavy desalination, smelting, and stores sit in mid-rings, waterline bases, and downwind eastern platforms (`P6`, `P8`).
2. **Kikutake's *Marine City / Unabara* — The Annular Lagoon is Harbour, Neutral Axis, and Light-Well**:
   Every main platform (`P0..P8`) is an annular ring around a calm circular sea-well (`R = 18..54 m`), damping open-ocean swell into a sheltered boat harbour (`3.9 ha` total calm basin) while sending daylight down into the water column round the submerged pods.
3. **Venice Arsenale — Wet Logistics at `y = 0`, Dry Craft Above**:
   Arched sea-gates in the flared pylon bases (`P0`, `P5`, `P6`) admit cargo barges, triremes, and pearl skiffs straight into the calm inner wells under vertical hoist shafts that lift goods into dry workshops and markets at `+14..+32 m`.
4. **Knossos Lustral Basins & `LORE.md` §6.16 — Depth as Amphibious Sanctuary**:
   Because trueborn Hykkousoi breathe water through rib-gills (`LORE.md` §6.16) yet prize dry fire-cooked hearths and unrusted bronze above water, Tethis splits naturally along `y = 0`: dry hearth-life, bronze-casting, and scroll-keeping above `+14 m`; **sacred, unassailable gill-only sanctuaries and pearl-vaults in the flooded benthic domes (`-22..-8 m`)**.
5. **Hanging Gardens & Gravity Hydrology — Fresh Water Flows Top-Down**:
   With Ancient electric pumps dead, the **concave 216 m roof of the Great Mushroom Cap `T0` (`+188 m`)** and **Dew-Spire `T3`** act as gravity rain-and-mist harvesters, feeding header cisterns that irrigate `P0..P5` orchards (`21.3 ha` of gardens) without a single mechanical pump.
6. **Habitat 67 & Nakagin Capsule Stalks — Plug-In Cellular Drums with Sky-Loggia Necks**:
   The cylindrical capsule towers (`T1a..T5`, *Ref 4*) group 9–11 storeys of cantilevered `45 m²` family pods into modular drums separated by open sky-loggia garden necks so high-rise residents have wind-sheltered communal parks in the sky.

---

## 4. How the Original State Guides the Modern Hykkousoi Condition

| Layer / Part | Elev (`m`) | Original Ancient Programme | Why & How It Became Its Modern Hykkousoi State |
|---|---|---|---|
| **Submerged Benthic Pods** (`U0`, `U1`, `U4`) & Tubes (`ST_0_1`, `ST_0_4`) | `-21 .. -7.5` | Benthic genetics lab (`U0`), sea-cooled cryo-larders (`U1`), coral observation theatre (`U4`), glazed subsea walkways | Pressure seals Equalized with the sea. Lethal to air-breathing raiders, effortless for gilled Hykkousoi: `U0` preserves corrosion-proof **etched Greek-symbol gene tablets** (`LORE.md` §6.16) & sacred pearl beds; `U1` holds live oyster pens; `U4` is the gill-initiation court |
| **Deep OTEC Intake Vault** (`U6`) & Tube `ST_0_6` | `-24.5 .. -11.5` | Deep thermal-gradient cold-water intake & ballast turbines under `P6` | Industrial machinery silted and dark; `ST_0_6` ruptured on the reef and barred with a Hykkousoi bronze grille against giant reef-eels; cautiously dived for titanium scrap |
| **Waterline Base Rings & Sea-Wells** (`P0`, `P5`, `P6`) | `0 .. +10.5` | Submarine/barge locks, container hoists, West Ship Canal (`36 m` cut in `P5`) | Active **Trireme, Pearl-Mother-Ship & Outrigger Harbours**; nacre slipways, net-racks, and suspended pearl-oyster lines fill the calm inner lagoons |
| **Nexus & Residential Saucers** (`P0`, `P1`, `P2`) | `+24 .. +58` | Sunlit perimeter duplexes, Hall of Tides, central library, clinic, Marine Academy | **Heart of the Dry Settlement (~5,120 residents)**: shattered blue-glass curtain walls patched and extended with **grown nacre barnacle-pods, conch stair-drums, and scallop balconies** (`hyk_accreted`); Hall of Tides serves as the Archon's Amphitriton council hall |
| **Botanical & Cascade Saucers** (`P3`, `S3a`, `S0a`, `T3`) | `+13 .. +66` | Irrigated orchard terraces, ribbon-glazed seed conservatory (*Ref 1*), dew-condenser tower | **Rain-Fed Groves & Gill-Balm Gardens**: fed by gravity rainwater from `T0` and fog-nets hung on `T3`, growing olives, figs, gourds, medicinal herbs, and **sea-linen** above salt spray |
| **Lagoon Park, Baths & Belvedere** (`P4`, `S0c`, `T4`) | `+22 .. +166` | Diving-well amphitheatre, thalassotherapy baths, companion mushroom tower | **Festival Basin & Salt-Mist Baths**: swimmers dive straight from `P4`'s stone bowl through the lagoon into `U4` below; `S0c` mist-baths prevent dry-season gill-wither |
| **East Works Ring** (`P6`, `T6a`, `T6b`) | `+16 .. +150` | Flash desalination stills, OTEC power hall, electrolysis & hull fabrication | **Ventilated Bronze-Foundry & Shell-Lime Kilns**: positioned downwind on the east; `T6a`'s 150 m stack provides natural furnace draft; silent brass OTEC turbines kept as guild shrines |
| **Outer Smelter Saucer** (`P8`) & Span `B_6_8` | `+14 .. +31` | Hazardous arc-smelters, alkali-brine tanks, slag cranes | **Cut-Off Salvage Island (`salvage_ruin`)**: pipe-viaduct `B_6_8` collapsed in the Cataclysm; Hykkousoi leave it unbridged and strip its Ancient alloys by boat (`KRUINS.watch`) |
| **Great Mushroom Spire** (`T0`) | `0 .. +218` | Express lift core, mid-stem sky-lobbies, 216 m sky-villa & observatory dish, rain dome | **Archon's Watch & Gravity Rain-Crown**: lifts dead, so a **3.5-turn grown nacre conch-stair (`HYK_T0_helix`)** climbs the outside of the ribbed trunk from `+48 m` to `+158 m`; concave dome feeds all freshwater cisterns |
| **Skybridge Network** (`B_*`) | `+18 .. +26` | 15 aligned radial spokes, hex ring chords, and twin harbour viaducts | Kept promenades & aqueducts, except `B_6_8` (**collapsed**), `B_6_1` (**bridged by a Hykkousoi grown organic rib-span**), and `B_5_7s` (**fitted with a counterweighted rib-drawbridge** for tall masts and defence) |

---

## 5. Blueprint Sheets (`sheets/`)

| Sheet | File | Scale / Cut | What It Shows |
|---|---|---|---|
| **N0** | `sheets/N0_master_site.png` | Full `1.5 × 1.0 km` site | All 9 platforms (`P0–P8`), 4 satellite dishes (`S0a–c`, `S3a`), 10 towers (`T0–T6b`), 4 submerged pods (`U0–U6`), 15 skybridges + 3 subsea tubes, 74 pylons, mooring slips, and bathymetry colour-coded by **Live / Work / Recreation / Garden / Civic / Infra** |
| **N1** | `sheets/N1_benthic_rotunda.png` | `U0` at `y = -14 m` (`R = 68 m`) | 12 numbered underwater rooms: Benthic Gene-Lab / Drowned Scriptorium, Kelp Bioreactor Hall, Subsea Reef Observation Sanctuary, Hyperbaric Lock, and Subsea Tube Portals (`ST_0_1`, `ST_0_4`, barred `ST_0_6`) |
| **N2** | `sheets/N2_nexus_hub_saucer.png` | `P0` at `y = +32.4 m` (`R = 152 m`) | 28 numbered rooms across outer sunlit apartment rim, 6 skybridge portals, 6 radial light-courts, Hall of Tides, Scriptorium, Weather Bureau, Clinic, Refectory, Lagoon Gallery, and `S0a–c` strut lobbies |
| **N3** | `sheets/N3_residential_and_capsules.png` | `P1` (`R = 126 m`) + `T1a` (`2×`) | 25 numbered zones: stepped residential duplex arcs, radial light-courts, communal kitchens, baths, craft lofts, lagoon flats, plus an enlarged `2×` floorplate of Ref 4's **16-pod radial plug-in capsule drum** and open sky-loggia neck |
| **N4** | `sheets/N4_work_vs_garden_saucers.png` | `P6` (`R = 120 m`) vs `P3` (`R = 122 m`) | Side-by-side comparison of **Work (`P6`)** — Desalination Stills, OTEC Hall, Bronze Foundry, Hull Hangar, `T6a/b` stacks, severed `B_6_8` stub — and **Garden/Recreation (`P3`)** — Ribbon-Glazed Seed Conservatory (*Ref 1*), Olive/Fig & Sea-Linen Terraces, Orchid Walk, Sunset Pavilion, `T3` Dew-Spire |
| **N5** | `sheets/N5_great_mushroom_cap.png` | `T0` cap at `y = +166.4 m` (`R = 108 m`) | 11 numbered sky-zones over the 24 radial soffit ribs (*Ref 3*): Conch-Stair & Trunk Core, Archon's Beacon Rotunda, Gravity Rainwater Header Cistern, Sky-Villa Terraces, Horizon Banquet Loggia, Cloud-Orchard, and Zenith Sky-Courts |
| **N6** | `sheets/N6_modern_hykkousoi.png` | Full site (Modern state) | Part-by-part Hykkousoi state map: nacre barnacle-pod accretions on `P0/P1/P2/P5/P7`, rain-fed groves (`P3/S3a/S0a`), flooded habitable gill-domes (`U0/U1/U4`), grown rib-bridge (`B_6_1`), drawbridge (`B_5_7s`), and collapsed `B_6_8` isolating Salvage Island `P8` |
| **N7** | `sheets/N7_axial_section.png` | `W–E` section at `z = 0` (`2.4×` vertical) | Full vertical section from `-35 m` coral seabed through `y = 0` waterline, submerged pods `U0/U6` & tube `ST_0_6`, stepped saucers `P7–P5–P0–P6–P8`, cantilevered dishes `S0a/S0b`, capsule towers `T5/T1a/T6a`, and the `+218 m` Great Mushroom Tower `T0` with its helical conch-stair |

See [`AREAS.md`](AREAS.md) for the exact area and population table and [`FURNITURE.md`](FURNITURE.md) for the room-by-room catalog manifest (`9,758` pieces across `ancients_*` and `hykkousoi_*`, plus 6 `NEW` marine-arcology pieces).

---

## 6. Review Checkpoints Before Phase 2 (3D Geometry & Verification)

Before building `8az1-tethis-water.js`, `8av2-tethis-draw.js`, `89z-rows.js`, and `91z-views.js`:
1. **Site Showcase Pair**: Should `dist/tethis.html` display **two sites side-by-side** in open sea (West: **Tethis as the Ancients built it**, gleaming white seamed panels, board-formed concrete pylons, blue glass, cyan/amber soffit strips, intact skybridges; East: **Tethis as the Hykkousoi hold it today**, weathered patina, grown nacre barnacle-pods & conch-helix, rib-bridges, oyster rafts, collapsed `P8` salvage ruin, and flooded glowing benthic domes — matching `podium` and `arcpile`), or a single switchable site?
2. **Tower & Saucer Proportions**: Any adjustment to the `390 m` hex spacing, `+218 m` central mushroom tower height, number of capsule-studded towers (`6` residential + `2` condenser), or submerged pod visibility beneath the `core/water` sea surface?
3. **Zoning & Modern Adaptation**: Any changes to the Live / Work / Recreation split (`162.1 / 77.3 / 51.7 ha`), the flooded gill-folk chambers (`U0`, `U1`, `U4`), or the cut-off eastern salvage saucer (`P8`)?
