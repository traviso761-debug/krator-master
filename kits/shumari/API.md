# Shumari Kit — Builder & Data API (`kits/shumari`)

All architectural helpers in `src/40-sm-kit.js` and `src/41-sm-dome.js` use the `sm` / `SM_` prefix and draw in the current `CM` local frame (`+z` front, `y` up) on `core/engine`.

## 1. Constants & Pure `[G data]` Validators (`src/26k-kit.js`)

- `SM_GIANT_DOOR = 4.4`, `SM_GIANT_MIN_DOOR = 4.2` — Free Giant clear doorway height (`m`).
- `SM_GIANT_VAULT = 5.2`, `SM_GIANT_MIN_VAULT = 5.0` — Free Giant clear interior vault/ceiling height (`m`).
- `SM_HUMAN_DOOR = 2.25`, `SM_HUMAN_MAX_DOOR = 3.0` — Hearth-Commons human doorway height (`m`).
- `SM_STAIR_MIN_W = 2.4` — Minimum clear width (`m`) on compound Giant+human stairs.
- `smDomeRadius(u, span)` / `smDomeProfile(span, h, steps)` — High-shouldered pointed Mamluk dome profile (`u` in `[0, 1]`).
- `smDomeValid(rec)` — Validates `{key, style, hand, span, h}` (`h/span` in `[0.72, 0.92]`; `spiral` `hand === +1`, or `-1` on `sm_doriyan_stele`).
- `smGiantValid(rec)` — Validates `{key, giant, doors, vaultH}` against Giant vs human clearance invariants.

## 2. Highland & Mamluk Primitives (`src/40-sm-kit.js`)

- `smPlinth(w, d, h, o)` — Battered *ishigaki* polygonal basalt skirt (`rubble`), dressed basalt/travertine corner quoins, moulded kerb, and walkable `paving` top slab at `y = h`.
- `smAblaqWall(L, y0, h, opens, o)` — Thickness-`t` horizontal *ablaq* banded wall (`basalt`, `travertine`, `ironstone`) cleanly segmented around `opens = [{x, y, w, h, kind}]`, registering pier collision blocks on `KWALKBOX` and dressing windows (`jali` + `svPane`).
- `smHollowAblaq(w, d, y0, h, o)` — Four-wall hollow *ablaq* chamber with corner pilasters and paved interior floor.
- `smParapet(w, d, y, o)` — Flat snow-load roof slab (`hole` well cutout for domes), cornice, perimeter stepped Mamluk blade-*shurafat* merlons, and basalt snow-spouts.
- `smCompoundStair(x, z, y0, y1, yaw, o)` — Dual-tread Giant (`~0.40 m` riser center) + human (`~0.20 m` riser flanks) stone flight (`>= 2.4 m` wide) registered on `KWALK` via `KWALK.strip` + landing `KWALK.poly`.
- `smPishtaq(x, y0, z, o)` — Monumental recessed Mamluk portal rising above roofline: corner colonnettes, pointed *ablaq* voussoir arch, stepped prism *muqarnas* hood, triplet *jali* transom lights, *shurafat* crown, bronze `smSocket`s, and operable `KDOOR` leaves (`svDoorway` + `door()`).
- `smLacquerBay(x, y0, z, w, h, d, o)` — Projecting crimson-lacquered *mashrabiya* winter gallery bay with `jali` lattice, `svPane` winter glazing, bronze corbels, and slate snow-hood.

## 3. Mamluk Domes & Transition Drums (`src/41-sm-dome.js`)

- `smDrum(x, y0, z, span, o)` — Square-to-octagon Mamluk transition shoulder with 3-tier stepped prismatic *muqarnas* ("Turkish triangles"), axial `1-over-2` *qamariyya* bullseye roundels over triplet lancets, octagonal *shurafat* belt, and 8- or 12-window *ablaq* clerestory drum (`hollow: true` leaves throat open to chamber below).
- `smDome(x, y0, z, D, o)` — Pointed Mamluk stone dome (`style: 'spiral'` with 16–24 3D torsion gadroons & `hand: +1 | -1`, or `style: 'carved'` star-relief over an epigraphic `frieze` collar), hollow inward-facing stone soffit, and 3-sphere cast-bronze `smJamur` finial. Appends metadata to `SM_DOMES` and `CURREC.domes`.

## 4. Phase SM2 `defBuilding` Definitions

| Key | Seed | Caste / Style | `giant` | Summary |
| --- | --- | --- | --- | --- |
| `sm_regiment_qubba` | `8101` | `sword` | `true` | Walkable hollow *ablaq* regimental mausoleum (`v=0` `#spiral` right-handed dome, `v=1` `#carved` star-relief dome), `4.4 m` *pishtaq*, columbarium urns, ancestor blade-racks, eternal braziers |
| `sm_doriyan_stele` | `8105` | `sword` | `true` | Open 8-pier *ablaq* memorial canopy over 3 NW-facing black basalt steles under a mirror-handed (`hand: -1`) spiral dome |
| `sm_sample_pishtaq` | `8141` | `sword` | `true` | Standalone Giant *pishtaq* (`4.4 m` door), *ablaq* vestibule, *shurafat* parapet, and compound stair |
| `sm_sample_hearth_bay` | `8142` | `hearth` | `false` | Human-scale (`2.25 m` door) Hearth-Commons basalt house front with upper crimson-lacquered *mashrabiya* winter bay |
