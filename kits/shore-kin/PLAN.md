# Shore-Kin Vernacular Architectural Kit (`kits/shore-kin`) — Plan

## 1. Core adoption (`README.md`, "CORE MODULES ARE NOT OPTIONAL")

`kits/shore-kin` (`culture: 'shore-kin'`, prefix `sk`) is a standalone building kit built on `core/engine` (`kits/ria/build.py` and `kits/hueru-kuran/build.py` pattern), reading every core module in place with zero vendored infrastructure:

| Module | Status | Role in `kits/shore-kin` |
|---|---|---|
| `core/engine` | **Taken** (read in place via `engine.py`) | Merged world-space material buckets (`30-geo.js`), `defBuilding` & `place` (`36-def.js`), operable doors & glass (`36o-open.js`), stairs (`36s-stair.js`), box walk reader (`37-wk-rec.js`), furnishing (`91f-furnish.js`), night lights (`91n-night.js`), host take (`99-host-take.js`) |
| `core/rand` (`KRAND`) | **Taken** | Deterministic seeded placement, `MAT_ALT` material variation (`31-alt-takes.js`), world-position ancestor mask seeding (`35-sk-head-geo.js`), and `KTAGS.uid` |
| `core/tags` (`KTAGS`) | **Taken** | Every placed building and furniture piece registered before drawing with `culture: 'shore-kin'`, `types`, `wealth`, `style`, `role`, `job` |
| `core/materials/record` (`KMAT`, `KMAT_M1`) | **Taken** | Packed Arch & sea-derived library families + `f_*` triplanar furniture detail maps (`materials.json` -> `tex/`), Stage 5 `K1` uniform shader deduplication, `M2` `km1RoughAA` specular anti-aliasing, `M3` planar POM, `M4` plot-base contact AO & mortar cavity (`27v-sk-vstack.js`) |
| `core/interiors` (`KROOMLIGHT`) | **Taken** | Stage 7 (`I1`–`I4`) room-graph portal daylight & warm-lamp bounce over `CURREC.rooms`, driving a persistent 6-`PointLight` pool (`91r-sk-roomlight.js`) |
| `core/furnish` (`KFURN`) + `kits/catalog` | **Taken** | Indexed catalog (`generic`, `generic-goods`, `jobs`) + 14 bespoke `shore-kin` pieces (`39-sk-furn.js`) |
| `core/door` (`KDOOR`, `KGLASS`) | **Taken** | Operable single/double doors (`skDoor` -> `svLeaf`) and glazed/shuttered windows (`skWindow` -> `svPane`) |
| `core/walk` & `core/walk/box` | **Taken** | Clean walkable floors (`wkPad`, `svFloor`), stairs (`skStair`, `skStripWalk`), mangrove boardwalks, and full-height wall collision blocks (`skWallBlock`) |
| `core/water` (`WATER`) | **Taken** | Flowing intertidal fish-weir race & careening channel + still solar salt pans, steaming trough & stepped tide-shrine basin (`91z-sk-world.js`) |
| `core/atmos` + `placeholder` | **Taken** | `KratorSky` viewer placeholder sky, PBR skylight, and live `ATMOS` gust wind (`90z-sk-atmos.js`) driving oiled sharkskin/ray-hide awnings, catechu sails, sea-byssus banners, drying kelp, pumice-float nets & shell chimes |
| `core/drawn` (`KDRAWN`) | **Taken** | Ground grid registration for `harness.SURVEY` camera eye-clearance checks |
| `core/host` (`KHOST`) | **Taken** | Standard viewer shell, inspector, polygon tool, cut-away (`X`), door toggle (`E`), night mode (`N`), walk (`F`) |
| `core/terrain`, `core/world`, `core/coast` | Not taken | Standalone flat-sheet building kit; host settlements (`settlements/fleetborn-cove`, `core/hamlet`) seat `SKK` onto world terrain |
| `core/biome` | Not taken | Building kit owns no flora; Arch species live in `biomes/arch` |
| `core/city`, `core/hamlet`, `core/camp`, `core/simulation` | Not taken (data-ready) | Plain `SK_BILLS` (`materials` & `bill` per building) and `SK_TRADES` (`34-sk-trades.js`) feed `SIM`, `KCONS`, `core/hamlet`, and `core/city` when villages are placed |
| `core/ruins` | Not taken | Intact active Shore-kin village & harbour vernacular; Arcoforte's ruin uses `KRUINS` on its own site |

---

## 2. Cultural & Architectural Synthesis (Arcoforte Phase P3c, §2.2b)

The **Shore-kin** (`900–1,400` hinterland villagers and harbour-yard crews around Arcoforte) are descendants of mixed **Fleet-born (`cFlīt-qBōn`)**, **Rian (Ria Sound)**, **Eternian**, and **Hueru-Kuran** ancestry who lack or carry only a weak copy of the Fleet-born dive traits ("half-divers") and live ashore as clients of the Fleet-born caretaker house.

Every Shore-kin building synthesizes four strands while remaining **strictly constrained to Arch local and sea-derived materials** (**zero** Crookshore nephrite/jade and **zero** red cypress):

1. **Rian strand** (after `kits/ria` `raPlinth`, `raBoardwalk`, `raTieredRoof`, `ra_west_mudbrick_hut`):
   - Flood socles on arched `laterite` *cuirasse* and `pillow_basalt` rubble piers above storm wash;
   - Elevated `mangrove` plank boardwalks and front net/kelp drying decks;
   - Telescopic 2- and 3-tier *Costularia* sedge, uluhe fern, and *Pandanus* thatch roofs crowned with carved upswept *Metrosideros* (`ohia`) gable horns.
2. **Eternian strand** (after `kits/eternian` `40-et-kit.js`, `43-et-statue.js`, `54-et-dwell-hex.js`, `69-et-coast.js`, and disposable harbour wood `72-et-harbour-wood.js`):
   - Six-sided hexagonal plans (`sk_hex_lime_house`, `sk_client_hall`, `sk_byssus_court`);
   - Dazzling white `shell_limewash` burnt from oyster shell and `limeshelf` travertine;
   - Pierced geometric `brucite_travertine` ventilation block screens cut from alkaline spring curtains;
   - Faceted **closed-eyed ancestor masks** over doorways — moulded in fired `laterite_terracotta` for common households and cast in gleaming white **`paktong`** for house heads and the Caretaker client moot hall;
   - Braced tarred `mangrove`-pile timber cribs and knock-down plank-and-paperbark harbour sheds.
3. **Hueru-Kuran strand** (after `kits/hueru-kuran` `hkWallRing`, `hkChise`, `hkTurfRoof`, `hkGutskinAwning`, `hkKaenCrown`):
   - Battered dry-laid white-veined green `serpentinite` and buff-rind `dunite` ring walls;
   - Steamed `mangrove`-knee and stranded `whalebone_drift` rib vaults lined with *Melaleuca* `paperbark` under coastal `turf_dome` roofs;
   - Wind-rigged oiled `shark_ray_hide` (sharkskin & ray-hide) rain/sun awnings;
   - Sculptural *kaen*-style flame-rimmed `laterite_terracotta` & `verdigris_ash` chimney and kiln crowns.
4. **Fleet-born (`cFlīt-qBōn`) client accents**:
   - Mangrove-tannin `catechu_stain` red-brown sails, awnings, and trim;
   - `verdigris_ash` green trim from *Pycnandra* and verdigris-mangrove nickel-ash;
   - White copper-nickel-zinc **`paktong`** fittings, tally scales, tide-mark inlays, and high-status door masks;
   - Vesicular `pumice` net-floats and spun golden `byssus_cloth` (sea-silk) banners.

---

## 3. Building Roster (16 `defBuilding`s + Structured `materials` / `bill` Records)

Every building carries a structured per-part `materials` array and aggregated `bill` record (`SK_BILLS` in `src/34-sk-trades.js`, attached to `DEFS[key]` and every placed `REG` record) validated by `tests/test-shore-kin.js` and `_api.materialsBillAudit()`:

### Row 1 — Houses: Poor to Middling (`50-sk-houses.js`)
1. `sk_stilt_cot` — Arched basalt & laterite flood-socle fisherman stilt cot with mangrove drying deck, pumice-float net rack & 2-tier *Costularia* thatch roof (`poor`, `dwelling-single`, `fishing`).
2. `sk_boardwalk_shack` — Salvaged hull-plank & *Melaleuca* paperbark shore cot on braced tarred mangrove-pile cribs with sharkskin rain-hood (`poor`, `dwelling-single`, `carpentry`).
3. `sk_crib_rowhouse` — Two-household yard-crew rowhouse on a shared tarred mangrove boardwalk & arched laterite piers (`poor`, `dwelling-multi`, `fishing`).
4. `sk_hex_lime_house` — Six-sided shell-limewash artisan house with pierced brucite-travertine screens, clay closed-eyed door mask & hexagonal thatch roof (`middle`, `dwelling-single`, `weaving`).
5. `sk_serpentine_lodge` — Extended-family battered green serpentinite & dunite ring-wall lodge with steamed mangrove-knee & drift whale-rib vault, coastal turf dome & terracotta flame-crown (`middle`, `dwelling-multi`, `herding`).

### Row 2 — Prosperous Compounds, Client Hall & Sacred Tide Shrine (`50-sk-houses.js`, `58-sk-works.js`)
6. `sk_compound_house` — Prosperous factor & shipwright two-storey arched-socle house with shell-limewash ground hall, upper *Araucaria*-offcut gallery, 2-tier thatch roof & paktong hardware (`rich`, `dwelling-single` + `shop`, `shipwrighting`).
7. `sk_byssus_court` — Clan sea-silk dyer & factor courtyard house with hexagonal gate-pavilion, brucite rainwater court & catechu/byssus skeins (`rich`, `dwelling-multi` + `shop`, `dyeing`).
8. `sk_client_hall` — Caretaker House's grand Shore-kin client moot & tally hall: hexagonal shell-limewash pavilion inside an arched brucite-travertine & laterite colonnade, 3-tier *Costularia* roof with carved ohia horns, paktong ancestor mask & sea-byssus banners (`rich`, `civic` + `market`, `customs`).
9. `sk_tide_shrine` — Stepped serpentinite & brucite-travertine intertidal shrine with arched baldachin, tidal mirror pool, **paktong-inlaid tide post** marking Neap, Mean, Spring, and **Double-Dark** water levels, and wind-swung nacreous shell chimes (`middle`, `religious` + `civic`, `worship`).

### Row 3 — Hinterland & Harbour Works (`58-sk-works.js`)
10. `sk_ash_kelp_kiln` — *Pycnandra* nickel-shrub turf-sealed ash clamp + stone intertidal kelp-burning trench kiln + mangrove drying racks (`poor`, `industry`, `alchemy`).
11. `sk_spar_sawpit` — *Araucaria*/*Agathis* trestle saw pit, stone-hearth kauri-gum pitch pot & masonry steaming trough for curved mangrove boat-knees (`middle`, `industry`, `carpentry`).
12. `sk_ropewalk_pitch` — Coir, *Hibiscus* bast & sea-byssus rope walk under sharkskin canopy + gjár bitumen & kauri-gum caulking boiler (`middle`, `industry`, `ropemaking`).
13. `sk_paktong_foundry` — *Casuarina*-bedded copper/zinc roast heap + serpentinite/laterite reverberatory & paktong cupola furnace with flame-crown, ray-hide bellows & white paktong ingot racks (`rich`, `industry`, `smithing`).
14. `sk_fish_saltery` — Intertidal pillow-basalt & wattled mangrove fish weir (`core/water` flow) + brucite/shell-lime solar salt pans + twin-crown smokehouse & drying racks (`poor`, `industry` + `farm`, `salt`).
15. `sk_lime_kiln` — Battered serpentinite & laterite draw-arch shell & `limeshelf` travertine kiln with charging ramp, shell heaps & slaking shed (`poor`, `industry`, `quarrying`).
16. `sk_boat_grid_shed` — Tarred mangrove-crib skiff & Fleet-born tender careening grid and open-portal repair shed with greased launch skids, clinker hull in frame & catechu sail loft (`middle`, `industry` + `infrastructure`, `shipwrighting`).

---

## 4. Settlement Bundle (`kit_bundle.py` -> `SKK`)

`kits/shore-kin/kit_bundle.py` seals `core/engine` + `kits/shore-kin/src` into one isolated closure `SKK` (`SKK.proto(key, v)`, `SKK.dims()`, `SKK.bills`, `SKK.archMaterials`, `SKK.trades`, `SKK.tradeDefs()`, `SKK.errors`) so `settlements/fleetborn-cove` and `core/hamlet` villages can place Shore-kin buildings without global collisions.
