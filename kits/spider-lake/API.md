# `kits/spider-lake` — API

Runs on `core/engine` (`engine.py`), `core/atmos`, `core/materials`, `core/tags`, `core/furnish`, `core/door`, `core/walk`, `core/water`, and `kits/resources`. Units are metres; local frame origin is the plot centre on the ground, `+z` the front, `+x` right, `+y` up.

## Kit Globals & Pure Data (`[G data]`)

- `KIT` (`26k-kit.js`): `{id: 'spider-lake', culture: 'spider-lake', pack: 'spider-lake', faction: 'Silk Principality of Spider Lake', band: 'Hum-Ria', ...}`
- `SL` (`26k-kit.js`): `{DOOR_H: 2.15, WALL: 0.38, SOCLE: 0.44, PLINTH: 0.54, RISER: 0.18, BAY: 3.4}`
- `SV_CLOTH` (`26k-kit.js`): `{silk: 1, velarium: 1, shamiyana: 1, veil: 1, streamer: 1, brocade: 1, flag: 1}` — every silk bucket carries `aFlut` pin-weights and binds live `ATMOS` wind (`90z-sl-atmos.js`).
- `SL_TRADES` (`34-sl-trades.js`): 44-row Voth census trade table mapping every active trade to its `sl_*` building defs (or `na` with reason).
- `slSilkMath` (`34-sl-trades.js`):
  - `cornerPin(u, v)` -> `0` at `(0,0),(1,0),(0,1),(1,1)`, smooth ramp to canopy belly
  - `spanPin(u)` -> `0` at `u = 0` and `u = 1` crossbars, peak in catenary middle
  - `hangPin(v)` -> `0` at `v = 0` curtain rail, `1` at `v = 1` dipped hem
  - `hyparY(u, v, yLow, yHigh, sag)` -> anticlastic hyperbolic-paraboloid saddle elevation
- `slDims()` (`91z-sl-world.js`): `{[key]: {cls, kind, w, d, h, style, wealth, types, role, job, cut}}` for `core/city` lot placement.
- `slOreLinks()` (`91z-sl-world.js`): `{nodes, mines}` linking placed `role: 'mine'` works (`sl_mine_quarry`) to `kits/resources` nodes via `resSource`.

## Architectural & Tensile-Silk Toolkit (`40-sl-kit.js`)

- `slPlinth(w, d, h, o)` — stepped dolomite & red-porphyry stylobate, paved deck, and walkable entrance flight (`svStripWalk`).
- `slWall(x0, z0, x1, z1, y0, h, o)` / `slWallRing(x0, z0, x1, z1, y0, h, o)` — dolomite socle + plastered/cedar walls with non-overlapping corner posts and carved eave cornice.
- `slDoor(x, y, z, yaw, w, h, o)` / `slWindow(x, y, z, yaw, w, h, o)` — operable `core/door` leaf (`svLeaf`) and `KGLASS` pane (`svPane`).
- `slColonnade(x0, z0, x1, z1, y0, h, o)` — `SL1` Ria stone colonnade alternating dolomite and red-porphyry shafts with bronze necking rings and stone entablature.
- `slMastObelisk(x, y, z, h, yaw, o)` — `SL1` notched dolomite mast-obelisk with bronze sheave, golden dragline-silk cable, and nephrite-jade counterweight bobbin.
- `slVelarium(x0, z0, x1, z1, yTop, sag, col, o)` — `SL1` pleated catenary spider-silk sun-sail (`velarium` bucket, `0` drift at corner rings).
- `slKingMast(foot, tip, r)` / `slBollard(x, y, z)` / `slHyparCanopy(cx, cz, rx, rz, yFoot, yLow, yHigh, col, o)` — `SL2` raked vermilion-and-ebony lacquered cedar King-Masts + perimeter bollards tensioning an anticlastic saddle silk roof with floating crimson crown-cap.
- `slSpiderLoft(cx, yBase, cz, w, d, h, o)` — `SL3` open-rafter *Hum* wind-scoop spider-loft with acoustic cedar louvers and rafter-pinned orb-web sheets.
- `slShamiyana(x0, z0, x1, z1, yFoot, yEave, yPeak, col, o)` — `SL3` tensioned jacquard *shamiyana* awning with scalloped valance.
- `slWindVeils(x0, z0, x1, z1, yFloor, yTop, o)` — `SL3` vertical overlapping silk louvers dipping into a carved dolomite evaporative water-trough.
- `slPergola(x0, z0, x1, z1, y0, h, o)` / `slCocoonLantern(x, yTop, z, drop, big)` / `slSilkBolt(a, b, width, sag, col)` — `SL4` cedar pergola parasols, night-glowing oiled-silk cocoon lanterns, and `18–22 m` catenary dyed silk streamers.

## Centerpiece Compound (`56-sl-silkhead.js`)

- `sl_caravanserai_silkhead` (`w: 39.6, d: 39.6, h: 15.8, cut: true, role: 'caravanserai'`): two-storey fortified quadrangle and central Caravan Exchange Court for `Silkhead` (`1288, 220`), uniting `SL1–SL4` with 24 furnished pieces, 11 walk-reach targets across both storeys, operable twin caravan gates, and preset view `'Silkhead Caravanserai courtyard'`.

## Bespoke `spider-lake` Furniture (`39-sl-furn.js`)

Registered on `KratorFurniture.def` under culture `'spider-lake'`:
`spider-lake_reeling_frame`, `spider-lake_drawloom`, `spider-lake_dye_vat`, `spider-lake_spindle_rack`, `spider-lake_low_table`, `spider-lake_silk_cushion`, `spider-lake_cocoon_stand`, `spider-lake_hum_harp`, `spider-lake_bolt_chest`, `spider-lake_sleeping_divan`, `spider-lake_tea_brazier`, `spider-lake_lacquer_screen`, `spider-lake_silk_bales`, `spider-lake_bourse_scale`, `spider-lake_pack_trough`.

## Verification Probe (`window._api`, `99-host-tz-sl.js`)

- `_api.atmosSilkAudit()` — `KHOOK.checkPrograms`, `ATMOS.U` uniform bindings, `0.0` drift at pinned vertices, downwind & gust ripple displacement.
- `_api.texturesAudit()` — verifies 100% of opaque/lit world, door, resource-node, and furniture meshes carry decoded library textures.
- `_api.zfightAudit()` — 3D world-space coplanar triangle overlap audit across buildings, canopies, doors, and furniture.
- `_api.doorsAudit()`, `_api.reachAudit()`, `_api.tradesAudit()`, `_api.oreAudit()`, `_api.fingerprint()`, `_api.rebuild()`.
