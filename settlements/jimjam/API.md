# Jimjam: API (the contract)

`build.py` concatenates `src/*` then `targets/kit/*` in filename order into one script, so **every
top-level name is a global**. It fails the build on a duplicate top-level name, on a `buildJj*` function
that does not open with `reseed(N)`, and on an un-prefixed name in `60`/`61`. Units are metres; x east,
y up, z south; a person is 1.75 m. **Indent function bodies**: the duplicate-name check reads any
`const|let|var|function` at the start of a line as a global.

## Registry (`src/61-jj-helpers.js`)

```js
JJ.def({key, name, family, row, w, d, h, r, ry?, tags:{type:[...], wealth, lit, role?}, views?, build})
JJ.place(scene, key, x, z, ry, o)            // o = {v, scale, y, lit}
jjReg(name, lx, lz, r, h, extraTags)          // inspector volume for a part, local frame
```

* `build(G,o)` is a named `function buildJjX(jjG,jjO){reseed(N+(jjO.v|0)); …}` drawing in the **local
  frame**: origin at the plot centre on the ground, **+z is the front**.
* `row` places the building on the sheet (see Layout). `ry` (optional) fixes its world yaw; the temple uses
  it. `views` adds presets in the local frame: `{'Name':{cam:[x,y,z], tgt:[x,y,z], sky:{hour,day}}}`.
* Tags: `culture:'jimjam'` is added; `type` is one or more of `civic, market/shop, tavern/inn, industry,
  farm, single-family dwelling, multi-family dwelling, infrastructure, religious, funerary, military`;
  `wealth` is `poor|middle|rich|civic`; `lit` is true only for rich and civic.
* Furniture is `JJFURN.def/place` (`src/84`), placeholder plants `JJFLORA.def/place` (`src/85`). A building
  never draws a plant; several defs export `plantSpots` / `plantingSpots`, `fountainSpot` or `poolSpot`
  (local points) for a settlement to fill.

## Layout and views (`targets/kit/89z-rows.js`, `91z-views.js`)

Rows are built from the defs' `row` fields in `JJ_ROW_ORDER` (helper gallery, housing poor/middle/rich,
shops, hospitality, civic, palace and plaza, military, walls, agriculture and storage, temple last),
`JJ_ROW_GAP` (56 m) apart. Nothing there needs editing to add a building. Views are generated: `Opening`,
`Overview`, `<row> — aerial`, `<name> — front`, `<name> — eye level`, plus each def's own `views`. A preset
may carry a 7th element `{hour,day}`; `setView` passes it to `jjApplyViewSky` (any other view restores the
showcase light).

## Helpers

The full table, with the y convention of each helper (centre or base), is in `AGENT-BRIEF.md` §2. Shared:
`jjBox jjCylinder jjBeam jjWall jjPlinth jjStairs jjColumn jjBrickShaft jjChimneyStack jjArch jjArcade
jjDome jjSpire jjTurret jjPorthole jjWindow jjDoor jjCrenel jjCornice jjRoundPlaza jjAwning jjBanner
jjWithYaw jjColor`. Family fragments carry their own helpers under their prefix; the useful ones:

| fragment | prefix | reusable helpers |
|---|---|---|
| `62-jj-culture.js` | `jjCult` | the `jimjam` socket pack: awnings (`scheme:'red'/'turq'/'gold'`, `posts:false` for brackets), sun banners, flags, emblems, two-faced signs; icons `ALCHEMY TEXTILES JEWELER SPICE` |
| `70-jj-housing.js` | `jjHouse` | solid stairs, bulbous onion, chhatri, jharokha, instanced arched wall panels and portholes, round-collared spire |
| `71-jj-shops.js` | `jjShop` | `jjShopArcade` / `jjShopSpandrel` (arcade with closed spandrels) |
| `72-jj-hospitality.js` | `jjHosp` | `jjHospBay` / `jjHospRow` (instanced wall panels with a round-headed opening), lunette, archivolt, barrel vault, `jjHospFurn` (furniture at a building's world point); `73` reuses them |
| `74-jj-sacred.js` | `jjTemple` | `jjTempleFlight` (a solid stair with cheek walls), `JJ_SOLSTICE`, `JJ_TEMPLE_OBS` |
| `75-jj-palace.js` | `jjPal` | `jjPalDome` (frame-aware dome); needs `74` |
| `76-jj-military.js` | `jjMil`, `jjWallKit` | `jjMilTower`, `jjMilMerlons`, `jjMilArchRingGeo`, `jjMilSock` (a frame-aware socket); `77` uses them |
| `77-jj-agri.js` | `jjAgri` | `jjAgriSails` (animated sail group) |

## Constants other builds need

* **Walls** (`76`): `JJ_WALL_SEG_LEN=12`, `JJ_WALL_H=10` (walkway), `JJ_WALL_T=5`, `JJ_WALL_GATE_SEGS=2`,
  `JJ_WALL_TOWER_R=4.6`, `JJ_WALL_CORNER_R=5.6`. Pieces are `jjWallKit…(ox,oz,ry)` about an origin on the
  wall centre line; length runs along local +x, the outer face is +z. Segments 12 m apart meet face to face;
  a tower sits on a joint and adds no length; the gate takes two segment slots; the corner joins a +x leg to a
  −z leg (that segment at ry=+π/2, centred 6 m along −z).
* **Palace and plaza** (`75`): plaza centre = palace centre + (0, 0, 85) in the palace's local frame, same yaw
  (`JJ_PAL_PLAZA_OFFSET`). Both decks are 4.5 m high; the palace landing meets the gap in the plaza's back
  balustrade.
* **Solstice** (`74`): `JJ_SOLSTICE = {day:350, hour≈19.09, azimuthDeg≈242.2, altitudeDeg:3}`, filled on
  first use (KratorSky loads after `74`); the temple def's `ry` and `views` are getters.
* **Windmill** (`77`): the sails are a `THREE.Group` named `jj_windmill_sails`, turned by one `FRAME_HOOKS`
  entry (`rotation.z` only, 0.11 turns a second).

## Seeds

housing 9110–9199 · shops 9200–9299 · hospitality and civic 9300–9399 · temple and palace 9400–9499 ·
military and walls 9500–9599 · agriculture 9600–9699 · helper gallery 9100.

## Probe (`window._api`)

`totals`, `typeStats()`, `regOccupancy()`, `nanSweep()`, `tagAudit()`, `defs()`, `views()`, `setView()`,
`solsticeCheck()`. Budgets: the showcase 3 M triangles / 1600 draw calls (each call is drawn twice with sun
shadows); one building 250 k (palace, temple, fortress, caravanserai, amphitheater: 700 k).

## Buildings

| key | name | row | w × d × h (m) | type | wealth | lit | k tris |
|---|---|---|---|---|---|---|---|
| `jj_helper_gallery` | Jimjam helper gallery | Helper gallery | 110 × 60 × 34 | infrastructure+civic | civic |  | 136.4 |
| `jj_house_poor_a` | Poor houses A — party-wall pair | Housing — poor | 8.4 × 7.8 × 8.5 | multi-family dwelling | poor |  | 1.7 |
| `jj_house_poor_b` | Poor house B — outside stair | Housing — poor | 6.2 × 8.4 × 8.1 | single-family dwelling | poor |  | 2.1 |
| `jj_house_poor_c` | Poor house C — yard and dome | Housing — poor | 8.1 × 8.1 × 5.9 | single-family dwelling | poor |  | 3.6 |
| `jj_house_mid_a` | Middle house A — stepped terraces | Housing — middle | 10.6 × 11.2 × 15.2 | single-family dwelling | middle |  | 10.7 |
| `jj_house_mid_b` | Middle house B — tower house | Housing — middle | 11.5 × 7.8 × 19.6 | single-family dwelling | middle |  | 9 |
| `jj_house_mid_c` | Middle house C — shop-house | Housing — middle | 12.9 × 12.4 × 15.4 | single-family dwelling+market/shop | middle |  | 14.8 |
| `jj_house_rich_a` | Rich house A — courtyard mansion | Housing — rich | 24.5 × 24.5 × 18 | single-family dwelling | rich | yes | 43.4 |
| `jj_house_rich_b` | Rich house B — pavilion villa | Housing — rich | 18.4 × 24 × 21.8 | single-family dwelling | rich | yes | 29.7 |
| `jj_house_rich_c` | Rich house C — tower compound | Housing — rich | 23 × 23.2 × 27 | single-family dwelling | rich | yes | 49 |
| `jj_shop_weapons` | Weaponsmith | Shops | 8.4 × 9 × 11.9 | market/shop+single-family dwelling | middle |  | 7.4 |
| `jj_shop_armor` | Armourer | Shops | 10.2 × 8.6 × 10.2 | market/shop+single-family dwelling | middle |  | 12.9 |
| `jj_shop_general` | General goods | Shops | 10 × 8.4 × 10.4 | market/shop+single-family dwelling | middle |  | 11 |
| `jj_shop_food` | Grocer and baker | Shops | 9.6 × 9.2 × 9.4 | market/shop+single-family dwelling | middle |  | 19.6 |
| `jj_shop_alchemy` | Alchemist | Shops | 6.4 × 8 × 11.6 | market/shop+single-family dwelling | middle |  | 20.7 |
| `jj_shop_textiles` | Cloth and carpet merchant | Shops | 10 × 8.6 × 10.2 | market/shop+single-family dwelling | middle |  | 8.3 |
| `jj_shop_jeweler` | Jeweller | Shops | 6 × 7.6 × 10.2 | market/shop+single-family dwelling | rich | yes | 10.1 |
| `jj_shop_spice` | Spice and pottery | Shops | 8 × 8.2 × 8.6 | market/shop+single-family dwelling | middle |  | 18 |
| `jj_inn` | Inn | Hospitality | 33.4 × 37.5 × 18.8 | tavern/inn+multi-family dwelling | middle |  | 75.4 |
| `jj_tavern` | Tavern | Hospitality | 16 × 27.4 × 18.4 | tavern/inn | middle |  | 22.7 |
| `jj_caravanserai` | Caravanserai | Hospitality | 57.2 × 71.6 × 25 | tavern/inn+market/shop | civic | yes | 134.8 |
| `jj_library` | Library | Civic | 45.5 × 30.6 × 33 | civic | civic | yes | 56.4 |
| `jj_school` | School | Civic | 31 × 29 × 16 | civic | civic | yes | 39.9 |
| `jj_amphitheater` | Amphitheater | Civic | 80.4 × 61.2 × 28 | civic | civic | yes | 142.3 |
| `jj_temple_sun` | Solstice temple | Temple | 50 × 86 × 48 | religious+civic | civic | yes | 231 |
| `jj_palace` | Raja's palace | Palace and plaza | 113 × 90 × 52 | civic+single-family dwelling | civic | yes | 350.3 |
| `jj_palace_plaza` | Great sunray plaza | Palace and plaza | 104 × 82 × 24 | civic | civic | yes | 100.2 |
| `jj_barracks` | Barracks | Military | 64 × 52 × 22 | military | civic | yes | 25.3 |
| `jj_fortress` | Fortress — citadel | Military | 104 × 100 × 44 | military | civic | yes | 85.4 |
| `jj_wall_seg` | Wall segment (12 m) | Walls | 12 × 6.5 × 12.6 | military+infrastructure | civic |  | 0.6 |
| `jj_wall_tower` | Wall tower | Walls | 10.4 × 10.4 × 25 | military+infrastructure | civic |  | 3.4 |
| `jj_wall_run` | Wall run (demo) | Walls | 67 × 26 × 33 | military+infrastructure | civic |  | 24 |
| `jj_wall_gate` | Wall gate (2 segments) | Walls | 24 × 15 × 31 | military+infrastructure | civic |  | 12.6 |
| `jj_wall_corner` | Wall corner tower | Walls | 13 × 13 × 33 | military+infrastructure | civic |  | 5.9 |
| `jj_farm_field` | Farm field | Agriculture and storage | 30 × 24 × 2.6 | farm | poor |  | 2.8 |
| `jj_farmhouse_a` | Farmhouse A — courtyard and pens | Agriculture and storage | 22 × 20 × 9.2 | farm+single-family dwelling | poor |  | 4.7 |
| `jj_farmhouse_b` | Farmhouse B — dome and roof terrace | Agriculture and storage | 20 × 16 × 9 | farm+single-family dwelling | poor |  | 4.4 |
| `jj_granary` | Granary — beehive silos | Agriculture and storage | 24 × 16 × 10.8 | farm+infrastructure | civic |  | 11.6 |
| `jj_windmill` | Windmill | Agriculture and storage | 18 × 18 × 26 | farm+industry | civic |  | 7.3 |
| `jj_warehouse_a` | Warehouse A — barrel vault | Agriculture and storage | 36 × 24 × 12.8 | industry+market/shop | middle |  | 8.6 |
| `jj_warehouse_b` | Warehouse B — row of domes | Agriculture and storage | 38 × 24 × 11.4 | industry+market/shop | middle |  | 14.2 |
