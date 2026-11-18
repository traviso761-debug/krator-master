# Shumari Kit — Builder & Data API (`kits/shumari`)

All architectural helpers in `src/40-sm-kit.js` and `src/41-sm-dome.js` use the `sm` / `SM_` prefix and draw in the current `CM` local frame (`+z` front, `y` up) on `core/engine`.

## 1. Constants & Pure `[G data]` Validators (`src/26k-kit.js`, `src/68-sm-trades.js`)

- `SM_GIANT_DOOR = 4.4`, `SM_GIANT_MIN_DOOR = 4.2` — Free Giant clear doorway height (`m`).
- `SM_GIANT_VAULT = 5.2`, `SM_GIANT_MIN_VAULT = 5.0` — Free Giant clear interior vault/ceiling height (`m`).
- `SM_HUMAN_DOOR = 2.25`, `SM_HUMAN_MAX_DOOR = 3.0` — Hearth-Commons human doorway height (`m`).
- `SM_STAIR_MIN_W = 2.4` — Minimum clear width (`m`) on compound Giant+human stairs.
- `smDomeRadius(u, span)` / `smDomeProfile(span, h, steps)` — High-shouldered pointed Mamluk dome profile (`u` in `[0, 1]`).
- `smDomeValid(rec)` — Validates `{key, style, hand, span, h}` (`h/span` in `[0.72, 0.92]`; `spiral` `hand === +1`, or `-1` on `sm_doriyan_stele`).
- `smGiantValid(rec)` — Validates `{key, giant, solidMarker, doors, vaultH}` against Giant vs human clearance invariants (and doorless solid markers like `sm_wayside_cairn`).
- `SM_TRADES` (`src/68-sm-trades.js`) — Voth census trade mapping covering all 44 rows of `tools/trades_census.json` with zero gaps.
- `smDims()` (`src/68-sm-trades.js`) — Returns `{key: {cls, kind, w, d, h, fw, fd, name, giant, caste, vaultH, style, wealth, types, role, job, cut, shore, variants}}` for every `defBuilding` in `DEFS`, matching `kits/islanders`'s `isDims()` host contract.
- `SM_SM6` (`src/26k-kit.js`) — URL ablation switch (`?sm6=0` reverts the Phase SM6 architectural and PBR fixes for side-by-side `DELTA.md` comparison).

## 2. Highland & Mamluk Primitives (`src/40-sm-kit.js`)

- `smPlinth(w, d, h, o)` — Battered *ishigaki* polygonal basalt skirt (`rubble`), dressed basalt/travertine corner quoins, moulded kerb, and walkable `paving` top slab at `y = h`.
- `smWalkPier(cx, y0, cz, w, h, d)` — Registers structural wall piers directly on `KWALKBOX` without emitting opaque basalt geometry across window cutouts.
- `smAblaqWall(L, y0, h, opens, o)` — Thickness-`t` horizontal *ablaq* or coursed volcanic `basalt` wall cleanly segmented around `opens = [{x, y, w, h, kind}]`, registering pier collision blocks via `smWalkPier` and dressing windows (`jali` + `svPane`).
- `smHollowAblaq(w, d, y0, h, o)` — Four-wall hollow *ablaq* chamber with corner pilasters and paved interior floor.
- `smParapet(w, d, y, o)` — Flat snow-load roof slab (`hole` well cutout for domes), cornice, perimeter stepped Mamluk blade-*shurafat* merlons, and basalt snow-spouts.
- `smCompoundStair(x, z, y0, y1, yaw, o)` — Dual-tread Giant (`~0.40 m` riser center) + human (`~0.20 m` riser flanks) stone flight (`>= 2.4 m` wide) registered on `KWALK` via `KWALK.strip` + landing `KWALK.poly`.
- `smMuqarnasConch(x, y, z, spanW, h, depth, tiers)` — Concave pointed-arch Mamluk *muqarnas* semi-dome hood recessed inside a *pishtaq* iwan (`refs/03`).
- `smPishtaq(x, y0, z, o)` — Monumental recessed Mamluk portal rising above roofline: outer & jamb colonnettes with flared bell capitals, pointed *ablaq* voussoir arch with spandrel *buqja* bosses (`medallions: true`), concave `smMuqarnasConch` hood, triplet *jali* transom lights, *shurafat* crown, `frieze` band, bronze `smSocket`s, and operable `KDOOR` leaves.
- `smHumanDoor(x, y0, z, yaw, w, h, o)` / `smGiantPortal(x, y0, z, yaw, w, h, o)` — Human (`2.25 m`) and Free Giant (`>= 4.4 m`) arched stone doorways with operable `svLeaf` (`KDOOR`) leaves and optional `frieze_kattu` lintels.
- `smLacquerBay(x, y0, z, w, h, d, o)` — Projecting crimson-lacquered *mashrabiya* winter gallery bay with `jali` lattice, `svPane` winter glazing, bronze corbels, and slate snow-hood.
- `smSabilGrille(x, y0, z, yaw, w, h)` — Cast-bronze `tracery` street-fountain screen over snowmelt water trough and `smoked` `svPane` backing.
- `smBathDome(x, y0, z, d, h)` — Low plastered *hammam* steam dome (`bathLens`) studded with carved stone collars and amber stained-glass light-jewels (distinct from funerary `SM_DOMES`).
- `smCopperAlembic(x, y0, z, D, ry, armLen)` — Riveted miniature Mamluk-profile copper *qubba* still pot and swan-neck condenser pipe for `sm_spirits_still`.
- `smChimney(x, y0, z, h, o)` — Dressed basalt flue stack with travertine cap and optional live `smokeAt` source.

## 3. Mamluk Domes & Transition Drums (`src/41-sm-dome.js`)

- `smDrum(x, y0, z, span, o)` — Square-to-octagon Mamluk transition shoulder with `svWell` base roof curb, 4-tier outward-stepped Turkish-triangle corbels, axial `1-over-2` *qamariyya* bullseye roundels over triplet lancets, octagonal *shurafat* belt, and 8- or 12-window *ablaq* clerestory drum.
- `smDome(x, y0, z, D, o)` — Pointed Mamluk stone dome (`style: 'spiral'` with 16–24 bold 3D torsion gadroons & `hand: +1 | -1`, or `style: 'carved'` star-and-interlace relief over an epigraphic `frieze` collar), inset inward-facing stone soffit, compact `chiselled` apex necking collar, and 3-sphere cast-bronze `smJamur` finial.

## 4. Host Consumer Manifest, Closure Bundle & Godot Export (Phase SM6)

- **`shumari.py`:** `FOUNDATION`, `SETS` (`samples`, `dwellings`, `cult`, `civic`, `defence`, `works`, `trades`, `farms`), `FILES`, `paths(names=None)`, `set_files(*sets)`.
- **`kit_bundle.py` (`bundle(key='SMK', resources=True)`):** Seals `core/engine` + `kits/shumari/src` + `kits/resources/src` into one `SMK` closure for `openworld/shumar-north`, `openworld/shumar-south`, and `settlements/shumar`:
  - `SMK.proto(key, v)` — Builds `DEFS[key]` (`v=0|1`) at the origin into a `THREE.Group` with `userData = {key, v, tris, w, d, h, giant, caste, vaultH, doors, sockets, fixtures}` without touching host `KTAGS` or `KWALK`.
  - `SMK.dims()` — Full `smDims()` + `RES_NODES` dimension dictionary for `core/city` and `core/hamlet`.
  - `SMK.SM_TRADES`, `SMK.DEFS`, `SMK.MAT`, `SMK.RES`, `SMK.errors` — Sealed tables + automatic `KMAT.adapter('shumari', ...)` registration.
- **Godot export (`src/93e-sm-export.js`):** Registers `terrain`, tile-cropped compacted `buckets` per `mk`, and `standard` `materials` (`shumari:<mk>`) for `tools/harness.py export`.

## 5. Complete 59 `defBuilding` Registry (Phases SM2–SM6)

- **Toolkit Samples (`src/45-sm-samples.js`, 2):** `sm_sample_pishtaq` (`8141`, Giant), `sm_sample_hearth_bay` (`8142`, human).
- **Poor Dwellings (`src/50-sm-dwell-poor.js`, 5):** `sm_cadet_cell` (`8201`, `variants: 2`), `sm_giant_cadet_cell` (`8202`, Giant), `sm_cliff_cot` (`8203`), `sm_herder_house` (`8204`), `sm_outlander_lodging` (`8205`).
- **Middle Dwellings (`src/51-sm-dwell-mid.js`, 4):** `sm_hearth_house` (`8211`, `variants: 2`), `sm_courtyard_house` (`8212`), `sm_terrace_house` (`8213`, `variants: 2`), `sm_shop_house` (`8214`, `variants: 2`).
- **Rich Sword Compounds (`src/52-sm-dwell-rich.js`, 4, all Giant):** `sm_sword_villa` (`8221`, `variants: 2`), `sm_captain_bayt` (`8222`), `sm_giant_sword_hall` (`8223`), `sm_rim_pavilion` (`8224`).
- **Street Ensemble (`src/56-sm-gorge-street.js`, 1, Giant):** `sm_gorge_street` (`8256`).
- **Cult & Funerary (`src/60-sm-cult.js`, 6):** `sm_regiment_qubba` (`8101`, `v=0`/`v=1`, Giant), `sm_hall_of_blades` (`8102`, Giant), `sm_sabil_shrine` (`8103`, Giant), `sm_ordeal_gate` (`8104`, Giant), `sm_doriyan_stele` (`8105`, Giant, `hand: -1`), `sm_wayside_cairn` (`8106`, solid marker).
- **Civic & Mamluk State (`src/61-sm-civic.js`, 8, all Giant):** `sm_diwan_hall` (`8301`), `sm_kattu_chancery` (`8302`), `sm_wikala_caravanserai` (`8303`), `sm_hammam` (`8304`), `sm_bimaristan` (`8305`), `sm_state_granary` (`8306`), `sm_cistern_hall` (`8307`), `sm_envoy_house` (`8308`).
- **Citadel & Gorge Defence (`src/62-sm-defence.js`, 8, all Giant):** `sm_citadel_keep` (`8321`), `sm_curtain_wall` (`8322`), `sm_pishtaq_gate` (`8323`), `sm_payaru_tower` (`8324`), `sm_regiment_barracks` (`8325`), `sm_ordeal_yard` (`8326`), `sm_armoury` (`8327`), `sm_gorge_bridge_tower` (`8328`).
- **Extractive Works & Heavy Crafts (`src/64-sm-works.js`, 8, human):** `sm_blade_smithy` (`8401`), `sm_saltpeter_works` (`8402`), `sm_lacquer_inlay_shop` (`8403`), `sm_stonecutters_yard` (`8404`), `sm_mine_head` (`8405`), `sm_salt_evaporator` (`8406`), `sm_charcoal_kiln` (`8407`), `sm_placer_sluice` (`8408`).
- **Town Trades, Distillery & Lake Quay (`src/65-sm-trades.js`, 8, human):** `sm_bakery` (`8421`), `sm_butcher` (`8422`), `sm_weaver_dyer` (`8423`), `sm_tannery` (`8424`), `sm_brewery_teahouse` (`8425`), `sm_bazaar_hall` (`8426`, `variants: 2`), `sm_spirits_still` (`8427`), `sm_lake_jetty` (`8428`).
- **Highland Farms & Mills (`src/66-sm-farms.js`, 5, human):** `sm_watermill` (`8441`), `sm_apricot_orchard` (`8442`), `sm_terrace_farm` (`8443`), `sm_fungus_cellar` (`8444`), `sm_stock_fold` (`8445`).
