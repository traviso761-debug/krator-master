# `kits/hueru-kuran` — API

Runs on `core/engine` (`engine.py`), `core/atmos`, `core/materials`, `core/tags`, `core/furnish`, `core/door`, `core/walk`, `core/water`, and `kits/resources`. Units are metres; local frame origin is the plot centre on the ground, `+z` the front, `+x` right, `+y` up.

## Kit Globals & Pure Data (`[G data]`)

- `KIT` (`26k-kit.js`): `{id: 'hueru-kuran', culture: 'hueru-kuran', pack: 'hueru-kuran', faction: 'Hueru-Kuran Whale Clans', band: 'Hayrant-Crookshore', ...}`
- `HK` (`26k-kit.js`): `{DOOR_H: 2.1, WALL: 0.46, SOCLE: 0.52, PLINTH: 0.48, RISER: 0.18, RING_W: 2.4}`
- `HK_POLITIES` (`26k-kit.js`): Crookshore's four drowned ejecta craters (`89,604`, `81,677`, `104,562`, `123,659`) and `+690 m` cypress-flume terrace (`124,710`).
- `SV_CLOTH` (`26k-kit.js`): `{gutskin: 1, hide: 1, kelp: 1, netting: 1, banner: 1, chime: 1, flag: 1}` — every wind-rigged surface carries `aFlut` pin-weights and binds live `ATMOS` wind (`90z-hk-atmos.js`).
- `HK_TRADES` (`34-hk-trades.js`): 44-row Voth census trade table mapping every active trade to its `hk_*` building defs (or `na` with reason).
- `hkRigMath` (`34-hk-trades.js`):
  - `cornerPin(u, v)` -> `0` at `(0,0),(1,0),(0,1),(1,1)`, smooth ramp to gutskin awning belly
  - `spanPin(u)` -> `0` at `u = 0` and `u = 1`, peak in mid-span
  - `hangPin(v)` -> `0` at `v = 0` crossbar, `1` at `v = 1` lower hem
  - `chimePin(v)` -> `0` at `v = 0` baleen cord attachment, rigid linear pendulum sway down sawn nephrite chime-slabs
  - `nuragheRadius(rBase, rTop, t)` -> Sardinian concave-battered *nuraghe* outer radius
  - `whaleRibArc(rSpring, ySpring, rCrown, yCrown, s)` -> pelagic whale-rib vault curve `[r, y]`
  - `keyholeHalfWidth(wTop, wPool, f)` -> *Santa Cristina* inverted-keyhole step-well half-width
  - `totemTierY(yBase, nTiers, tierH)` -> vertical tier base heights `[y0, y1, ...]` for `3–5` stacked coastal creatures
  - `formlineLayerZ(zFace, layerIdx)` -> `>= 0.020 m` (`2.4 cm`) non-coplanar maritime relief z-step
  - `pelicanPouchSag(u, v, depth)` -> distended gular throat-pouch curve (`0` along mandible rims, forward bulge)
- `hkDims()` (`91z-hk-world.js`): `{[key]: {cls, kind, w, d, h, style, wealth, types, role, job, cut}}` for all `48` `hk_*` building defs (`8101–8409`) for `core/city` and `core/hamlet` lot placement.
- `hkOreLinks()` (`91z-hk-world.js`): `{nodes, mines}` linking placed `role: 'mine'` works (`hk_jade_quarry`) to `kits/resources` nodes via `resSource`.

## Architectural & Nautical Totem Toolkit (`40-hk-kit.js`, `41-hk-totem.js`)

- `hkPlinth(w, d, h, o)` — stepped columnar & cyclopean basalt terrace plinth and walkable entrance stair (`svStripWalk`).
- `hkJadeDoor(x, y, z, yaw, w, h, o)` — battered basalt doorway spanned by a massive 3-ton sawn emerald-nephrite (`jade = 200`) lintel block over a triangular relieving slit, with operable red-cypress leaf (`svLeaf`).
- `hkJadeWindow(x, y, z, yaw, w, h, o)` — translucent thin-sawn emerald-nephrite or kelp-soda sea-green glass window (`svPane` + night `haloAt`).
- `hkNuraghe(cx, cz, y0, rBase, rTop, h, o)` / `hkMensoloni(cx, yTop, cz, rTop, o)` — `HK1` Sardinian battered cyclopean-basalt truncated cone, interior corbelled *tholos* beehive vault, and projecting *mensoloni* corbel parapet (supports `solidBelow` for `+8 m` intertidal *Prou-Torres*).
- `hkChise(cx, cz, y0, rOut, wallT, wallH, domeRise, o)` / `hkKaenCrown(cx, y0, cz, r, h, nFins, o)` — `HK3` `2.2–2.8 m` basalt ring-wall + arching pelagic whale-rib vault + interlocking peat/bark/turf dome + sculptural Jōmon *kaen-doki* flame-ceramic chimney crown.
- `hkWall(x0, z0, x1, z1, y0, h, o)` / `hkWallRing(...)` / `hkTurfRoof(...)` — rectangular hall masonry with columnar corner piers and whalebone-ridged turf/bark roofs.
- `hkGutskinAwning(...)` / `hkWindHanging(...)` / `hkNephriteChimes(...)` — wind-rigged gutskin sails, drying kelp curtains, whale-nets, banners, and tuned emerald-nephrite wind/tide-chimes (`SV_CLOTH`).
- `hkWhaleJawArch(x, y0, z, yaw, span, h)` / `hkBaidarka(x, y0, z, yaw, len)` — monumental bleached Leviathan jawbone arch and bifid-bow oiled-hide *baidarka* / *umiak* watercraft.
- `hkNauticalTotemPole(x, y, z, yaw, o)` (`41-hk-totem.js`) — `4.0–9.2 m` *Hueru-Pira* / *Kōpa-Pira* coastal totem poles rising from hexagonal `columnar` basalt & `ashlar` plinths, stacking `3–5` sculpted `'whale'`, `'pelican'`, `'otter'`, `'octopus'`, `'seal'`, and `'crab'` tiers with `100%` wide-open `nephrite`/`jade` & `ivory`/`seaglass` horizon-watching eyes and optional bill-hung `chime` nephrite tide-chimes (`CURREC.nauticalTotems`).
- `hkNauticalFrieze(x, y, z, w, h, yaw, o)` / `hkWhaleFlukeFinial(x, y, z, span, yaw, o)` (`41-hk-totem.js`) — `>= 2.4 cm` z-stepped maritime whale-and-pelican formline lintel boards and rooftop/headland whale-fluke or pelican-head finials.

## Bespoke `hueru-kuran` Furniture (`39-hk-furn.js`)

Registered on `KratorFurniture.def` under culture `'hueru-kuran'`:
`hueru-kuran_whale_oil_hearth`, `hueru-kuran_nephrite_chime_rack`, `hueru-kuran_whalebone_cot`, `hueru-kuran_jade_saw_bench`, `hueru-kuran_kaen_storage_jar`, `hueru-kuran_blubber_kettle`, `hueru-kuran_baleen_loom`, `hueru-kuran_harpoon_rack`, `hueru-kuran_cedar_feast_trough`, `hueru-kuran_seal_pelt_mat`, `hueru-kuran_jade_lamp_pedestal`, `hueru-kuran_driftwood_chest`, `hueru-kuran_tide_gauge_plinth`, `hueru-kuran_baleen_bow_trough`, `hueru_pelican_totem_post`, `hueru_nautical_crest_chest`.

## Verification Probe (`window._api`, `99-host-tz-hk.js`)

- `_api.nauticalTotemAudit()` — verifies `>= 18` placed `hkNauticalTotemPole`s, `>= 55` stacked coastal creature tiers across all 6 motifs (`whale`, `pelican`, `otter`, `octopus`, `seal`, `crab`) with strong `whale` & `pelican` prominence, bill-hung `chime` tide-chimes, and `100%` open horizon-watching eyes (`openEyes === totalFigures`).
- `_api.waterAudit()` — verifies `WATER.still` (*Santa Cristina* drawdown mirror pool, healer pool, cliff-hoist cistern) and `WATER.flow` (pendulum sawmill race, cypress flume, caldera weir channel) on `core/water`.
- `_api.atmosWindAudit()` — `KHOOK.checkPrograms`, `ATMOS.U` uniform bindings, `0.0` drift at pinned vertices, downwind & gust displacement.
- `_api.texturesAudit()` — verifies 100% of opaque/lit world, door, resource-node, and furniture meshes carry decoded library textures.
- `_api.zfightAudit()` — 3D world-space coplanar triangle overlap audit across *nuraghi*, whale-ribs, totem poles, lintels, hoists, doors, and furniture.
- `_api.doorsAudit()`, `_api.reachAudit()`, `_api.tradesAudit()`, `_api.oreAudit()`, `_api.fingerprint()`, `_api.rebuild()`.
