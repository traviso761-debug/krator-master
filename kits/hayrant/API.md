# `kits/hayrant` — API

Runs on `core/engine` (`engine.py`), `core/atmos`, `core/drawn`, `core/materials`, `core/tags`, `core/furnish`, `core/door`, `core/walk`, `core/water`, reading `kits/eternian` (`38`, `40`–`44`, `46`, `50`, `52`) and `kits/resources` (`42r`, `44r`) in place. Units are metres; local frame origin is the plot centre on the ground, `+z` the front, `+x` right, `+y` up.

## Kit Globals & Pure Data (`[G data]`)

- `KIT` (`26k-kit.js`): `{id: 'hayrant', culture: 'hayrant', pack: 'hayrant', faction: 'The Eternal State', band: 'Hayrant-Outer-Wall', frag: 'kits/hayrant', ...}`
- `HY` (`26k-kit.js`): `{DOOR_H: 2.15, WALL: 0.44, SOCLE: 0.48, PLINTH: 0.44, RISER: 0.18, RING_W: 2.1}`
- `HY_STYLES` (`26k-kit.js`): `{bench: 'bench', hybrid: 'hybrid', prefect: 'prefect', sanctuary: 'sanctuary'}`
- `HY_SEATS` (`26k-kit.js`): Mirabilis (`350,726`), Sheritu (`384,666`), and Ukor-Tera Divide Pass (`124,710`).
- `SV_CLOTH` (`26k-kit.js`): `{plaid: 1, hemp: 1, hide: 1, netting: 1, chime: 1, flag: 1, sign: 1}` — bound to live `ATMOS` katabatic wind & gusts (`90z-hy-atmos.js`).
- `HY_TRADES` (`34-hy-trades.js`): 44-row Voth census trade table (`41` carried, `0` gaps, `3` explicit `na`).
- `hyRigMath` (`34-hy-trades.js`):
  - `cornerPin(u, v)` -> exact `0` at `(0,0),(1,0),(0,1),(1,1)`, peaking in awning belly
  - `spanPin(u)` -> exact `0` at `u = 0` and `u = 1` (garlic/jujube eaves braids & telegraph spans)
  - `hangPin(v)` -> exact `0` at `v = 0` crossbar, `1` at `v = 1` hem (plaid banners, hides & signs)
  - `chimePin(v)` -> exact `0` at `v = 0` cord attachment, linear rigid-pendulum sway down nephrite/bronze chimes
  - `nuragheRadius(rBase, rTop, t)` -> Sardinian concave-battered *nuraghe* outer radius
  - `cruckArc(rSpring, ySpring, rCrown, yCrown, s)` -> steamed `fur-larch` & `puya` snow-shedding cruck-rib arch `[r, y]`
  - `pierStepTops(n, h0, step)` -> symmetric organ-pipe Deco-Gothic pier heights peaking at centre rank
  - `keyholeHalfWidth(wTop, wPool, f)` -> *Santa Cristina* inverted-keyhole spring step-well half-width
  - `corniceDeltaOk(hHayrant, hEternian)` -> `true` iff `|hHayrant - hEternian| <= 0.50 m` (`VASSAL-KITS.md`)
  - `totemTierY(yBase, nHeads, tierH)` -> vertical tier base heights for stacked Eternian heads on *Sutar-Pira* totem poles
  - `puBaffleRadius(rPost)` -> stone-mushroom *nezumi-gaeshi* marmot-baffle disc radius (`>= 2.35 * rPost`)
  - `formlineLayerZ(zFace, layerIdx)` -> non-coplanar relief z-step (`>= 0.018 m` per layer -> `0` z-fighting)
  - `insulatorShedRadii(rBase, nSheds)` -> tapering shed/neck radii for `Mirabilis` high-voltage porcelain pin-insulators
  - `catenarySagPt(a, b, sag, t)` -> parabolic catenary jumper cable point with exact endpoint pinning at `t = 0` and `t = 1`
- `hyDims()` (`91z-hy-world.js`): `{[key]: {cls, kind, w, d, h, style, wealth, types, role, job, resSource, cut}}` for `core/city` and `core/hamlet`.
- `hyOreLinks()` (`91z-hy-world.js`): `{nodes, mines}` linking `role: 'mine'` works (`hy_saltpeter_works`, `hy_ore_adit`, `hy_rare_earth_smelter`) to `kits/resources` nodes via `resSource`.

## Sealed World Bundle (`kit_bundle.py` -> `HYK`)

```python
from kits.hayrant import kit_bundle
js, files = kit_bundle.bundle('HYK')
```

- `HYK.proto(key, v)` -> `THREE.Group` built at origin (`+z` front) with `userData = {key, v, tris, w, d, h, style, doors, fixtures}`
- `HYK.dims()` -> dimensions, `resSource` & tags for all 54 `hy_*` building definitions (`56` total `hy_*` defs with `hy_mixed_street` and `hy_statuary_ranks`, including `hy_grand_cyber_totem` and `hy_cyber_totem_obelisk`)
- `HYK.trades` / `HYK.tradeDefs(style)` / `HYK.seats` / `HYK.rigMath` / `HYK.errors`

## Architectural Toolkit (`40-hy-kit.js`, `41-hy-formline.js` & `41a-hy-portal-pu.js`)

- `hyPlinth(w, d, h, o)` — stepped `megabreccia`/`basalt`/`paving` plinth with walkable entrance stair (`svStripWalk`).
- `hyDoor(x, y, z, yaw, w, h, o)` — battered doorway with `'nephrite'` (3-ton cousin block), `'larch'`, or `'civic'` (twin lintel-bearing closed-eye ancestors) lintel, relieving slit, `svLeaf`, and mandatory closed-eye door mask.
- `hyWindow(...)` / `hyOculus(...)` / `hyDualLancets(...)` — nephrite, veined alabaster, and Deco steel openings plus bundled alabaster + emerald-nephrite lancets under stepped Deco heads.
- `hyNuraghe(cx, cz, y0, rBase, rTop, h, o)` / `hyMensoloni(...)` — concave-battered basalt *nuraghe* with interior *tholos* vault, *mensoloni* corbels, and optional `celadon` hex-hip cap.
- `hyChise(cx, cz, y0, rOut, wallT, wallH, domeRise, o)` / `hyKaenCrown(...)` — stone ring-wall + steamed `fur-larch` & `puya` cruck-ribs (or `whaleHeirloom` crest-ribs) + bark/turf dome + Jōmon *kaen-doki* chimney crown (sooty terracotta or `celadon`-glazed).
- `hyLoessVault(cx, cz, y0, w, d, h, o)` — horizontal Western Outer Wall loess cliff-bank *yaodong* vault.
- `hySteppedPierFront(...)` / `hyRoofHip(...)` — Organ-Pipe Deco-Gothic pier frontispieces with closed-eye niche heads and snow-shedding `celadon`/`tile`/`bark` hipped roofs.
- `hyPlaidAwning(...)` / `hyWindHanging(...)` / `hyEavesBraid(...)` / `hySeismicChimes(...)` / `hyBilingualSign(...)` — katabatic wind-rigged membranes & tuned nephrite/bronze chimes (`SV_CLOTH`).
- `hyWhaleJawArch(x, y0, z, yaw, span, h)` — prized cross-pass bleached Leviathan jawbone arch.
- `hyHeadTotemPole(x, y, z, yaw, o)` (`41-hy-formline.js`) — *Sutar-Pira* cyber-syncretic `3.8–9.8 m` totem pylon rising from an octagonal `megabreccia`/`basalt` + `titanium`/`white` arcology Busbar base with dorsal pneumatic-and-power conduits; stacks `3–5` closed-eye or bronze-veiled cyber-wired Eternian ancestor heads (`42-et-head.js`) and framed cyan `etFaceScreen` CRT ancestor face housings, inlaid with `maze`/`mazeB`/`mazeC` PCB circuit-formline wing-boards, `Mirabilis` `celadon`/`white` HV porcelain-insulator crossarms, and `screen` Faraday / telemetry halo / lightning-arrestor crowns.
- `hyMonumentalCyberTotem(x, y, z, yaw, o)` (`41-hy-formline.js`) — colossal `14.5–20.5 m` central-square cyber-totem monument (`5–7` tiers, `4.6–6.8 m` cantilevered PCB great-wings, 4-face octagonal `etFaceScreen` public-address matrices, and multi-ring Faraday telemetry spire), showcased in `hy_grand_cyber_totem` (`34113`) and `hy_cyber_totem_obelisk` (`34114`, `54b-hy-cybertotem.js`).
- `hyFormlineFrieze(x, y, z, w, h, yaw, o)` & `hyFormlineTympanum(x, y, z, w, rise, yaw, o)` (`41-hy-formline.js`) — Censorate-compliant closed-slit sleeping-eye formline gable boards and *yaodong* arch tympanums (`>= 2.0 cm` z-stepped relief).
- `hyOvoidPortal(x, y, z, w, h, yaw, o)` (`41a-hy-portal-pu.js`) — highland ovoid ancestor-collar doorway crowned by a serene closed-eye Eternian ancestor head/mask.
- `hyPuCache(x, y, z, w, d, yaw, o)` (`41a-hy-portal-pu.js`) — elevated adzed `fur-larch` store-box (*pu*) on 4 tapered `basalt` posts with circular `megabreccia` stone-mushroom *nezumi-gaeshi* marmot-baffle discs, gale-cobble roof, and notched larch step-log.
- `hyGaleCobbleRoof(x, y, z, w, d, rise, yaw, o)` (`41a-hy-portal-pu.js`) & `hyInauCluster(x, y, z, yaw, o)` (`41-hy-formline.js`) — adzed `fur-larch` plank gable roofs weighted with strapped `megabreccia`/`basalt` katabatic gale-cobbles, plus shaved-willow *inau* spirit-wand clusters.
- `hyStillPool(...)` / `hyFlowStream(...)` — world-space `WATER.still` and `WATER.flow` recorders.

## Bespoke `hayrant` Furniture (`39-hy-furn.js`)

Registered on `KratorFurniture` under culture `'hayrant'` (`14` pieces):
`hayrant_irori_hearth`, `hayrant_seismic_chime_rack`, `hayrant_inau_ancestor_shelf`, `hayrant_plaid_loom`, `hayrant_kaen_jar`, `hayrant_saltpeter_vat`, `hayrant_larch_feast_table`, `hayrant_yak_pelt_mat`, `hayrant_larch_cruck_bed`, `hayrant_insulator_rack`, `hayrant_jade_lantern_post`, `hayrant_nephrite_saw_bench`, `hayrant_head_totem_post` (with circuit-maze collar, celadon pin-insulators & cyan glow status diodes), `hayrant_formline_chest`.

## Verification Probe (`window._api`, `99-host-tz-hy.js`)

- `_api.closedEyesAudit()` & `_api.statuePosesAudit()` — verifies closed/veiled ancestor eyes (`< 10%` open) and valid Eternian poses (`stand`, `seat`, `lintel`, `folded`).
- `_api.headTotemAudit()` — verifies `>= 18` placed cyber-totem pylons (`>= 2` monumental `>= 18.0 m` central-square colossi), `>= 60` stacked totem tiers (`0` open eyes), plus `cyberSpines`, `insulators`, `circuitWings`, and `terminalScreens` telemetry counts.
- `_api.mixedStreetAudit()` — verifies `hy_mixed_street` places all 6 `et_*` peers beside `hy_*` houses with `0` lot overlaps and `<= 0.50 m` cornice delta.
- `_api.waterAudit()`, `_api.atmosWindAudit()`, `_api.texturesAudit()`, `_api.zfightAudit()`, `_api.doorsAudit()`, `_api.reachAudit()`, `_api.tradesAudit()`, `_api.oreAudit()`, `_api.fingerprint()`, `_api.rebuild()`.
