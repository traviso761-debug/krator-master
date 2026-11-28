# `kits/painted-men` — API

Runs on `core/engine` (`engine.py`), `core/atmos`, `core/drawn`, `core/materials`, `core/tags`, `core/furnish`, `core/door`, `core/walk`, `core/water`, reading `kits/resources` (`42r`, `44r`) in place. Units are metres; local frame origin is the plot centre on the ground, `+z` the front, `+x` right, `+y` up.

## Kit Globals & Pure Data (`[G data]`)

- `KIT` (`26k-kit.js`): `{id: 'painted-men', culture: 'painted', pack: 'painted-men', faction: 'Painted Men', band: 'Payntja-Mana', frag: 'kits/painted-men', ...}`
- `PM` (`26k-kit.js`): `{DOOR_H: 2.05, WALL: 0.42, SOCLE: 0.44, PLINTH: 0.36, RISER: 0.18, VIGA_MAX: 4.2}`
- `PM_STYLES` (`26k-kit.js`): `{alcove: 'alcove', maloca: 'maloca', hung: 'hung', salvage: 'salvage'}`
- `PM_SITES` (`26k-kit.js`): `paintedCanyon` (`cliff-alcove`), `canyonFans` (`talus-bench`), and `silkheadRim` (`cliff-ledge`).
- `PM_PIGMENTS` (`26k-kit.js`): `{ochreRed: 0xb53324, rabbitGold: 0xc98724, pipeclay: 0xf4ede0, ligniteBlack: 0x181614, celadoniteTeal: 0x267974, orchilPurple: 0x7e2854}`.
- `SV_CLOTH` (`26k-kit.js`): `{feather: 1, featherWarm: 1, wildSilk: 1, hide: 1, herbBundle: 1, flag: 1}` — bound to live `ATMOS` canyon-updraught wind & gusts (`90z-pm-atmos.js`).
- `PM_TRADES` (`34-pm-trades.js`): 49-row trade table covering all 44 Voth census rows (`39` active, `0` gaps) plus explicit cultural/ecological `na` rows for `shipwrights and boatbuilders`, `coast guard`, `power-house stokers and engineers`, `beetle herders`, `elephant bug handlers and station hands`, `potters`, `glassmakers`, `bankers`, `scribes`, and `printers`.
- `pmRigMath` (`34-pm-trades.js`):
  - `VIGA_MAX_SPAN` (`4.2`), `vigaSpanOk(spanM)`, `clampVigaSpan(spanM)` — enforces `<= 4.20 m` peeled juniper/oak *viga* span ceiling
  - `isPlateauMaterialAllowed(name)` — rejects bamboo, kiln-fired brick/terracotta/pottery, and legacy Tlingit tokens
  - `malocaCruckArc(rx0, rz0, ySpring, rxTop, rzTop, yApex, s)` -> bent canyon-oak *maloca* arch `[rx, rz, y]`
  - `dogonStepPitch(rise)` -> `{steps, pitch, leanRun}` for single-trunk notched Dogon juniper ladders
  - `keyholeHalfWidth(wSill, wShoulder, f)` -> Mesa Verde T-shaped / keyhole doorway half-width
  - `featherPin(v)`, `hangPin(v)`, `cornerPin(u, v)`, `spanPin(u)` -> exact `0`-anchored wind pin weights
- `pmDims()` (`91z-pm-world.js`): `{[key]: {cls, kind, w, d, h, style, wealth, types, role, job, cut}}` for `core/city`, `core/hamlet`, and `core/camp`.
- `pmOreLinks()` (`91z-pm-world.js`): `{nodes, mines}` linking `pm_pigment_quarry` (`role: 'mine'`) to `kits/resources` mineral nodes via `resSource`.

## Sealed World Bundle (`kit_bundle.py` -> `PMK`)

```python
sys.path.insert(0, os.path.join(ROOT, 'kits', 'painted-men'))
import kit_bundle
js, files = kit_bundle.bundle('PMK')
```

- `PMK.proto(key, v)` -> `THREE.Group` built at origin (`+z` front) with `userData = {key, v, tris, w, d, h, style, doors, fixtures}`
- `PMK.dims()` -> dimensions & tags for all `34` `pm_*` `cls: 'building'` definitions
- `PMK.trades` / `PMK.tradeDefs(style)` / `PMK.sites` / `PMK.rigMath` / `PMK.errors`

## Architectural & Rock-Art Toolkit (`40-pm-kit.js`, `41-pm-rarrk.js`)

- `pmPlinth(w, d, h, o)` — stepped `danxia` sandstone plinth with flagstone deck and walkable entrance steps (`svStripWalk`).
- `pmKeyholeDoor(x, y, z, yaw, w, h, o)` — Mesa Verde T-shaped / keyhole doorway with narrowed lower sill cheeks, rawhide-lashed double juniper lintel, selenite transom, and operable `svLeaf`.
- `pmAlcoveRoom(cx, cz, y0, w, d, wallH, o)` / `pmVigaRoof(...)` — cellular `danxia` & bentonite roomblock with projecting peeled juniper *vigas* (`<= 4.20 m`), willow *latilla* mat, and walkable rooftop plaza.
- `pmDogonLadder(fx, fy, fz, tx, ty, tz, o)` — single-trunk V-forked notched Dogon juniper ladder (`wkLadder`).
- `pmMalocaHall(cx, cz, y0, w, d, wallH, apexH, o)` — bent canyon-oak cruck-rib oval *maloca* thatched in stepped `Stripe bunchgrass` with optional Xingu warrior sparring sand-ring.
- `pmGranaryTower(cx, cz, y0, w, hTower, hHat, o)` — boulder-stilted Dogon clay silo with conical `Stripe bunchgrass` hat.
- `pmHungLedge(cx, cz, yDeck, w, d, o)` / `pmSilkWinch(...)` — socketed canyon-oak cantilever platform and braided Korona wild-silk cargo hoist.
- `pmSeepBasin(...)` / `pmSeepRill(...)` — world-space `WATER.still` seep-contact cisterns and `WATER.flow` stone rills.
- `pmRarrkPanel(...)` / `pmXrayBeastPanel(...)` / `pmHandStencilCluster(...)` / `pmTrackRingMap(...)` / `pmWandjinaBrow(...)` / `pmPukamaniPole(...)` — 5-pigment mineral rock-art & feathered `2.8–5.5 m` *Pukamani*/*Lorrkon* poles stepped `>= 1.8 cm` clear of host surfaces.

## Bespoke `painted` Furniture (`39-pm-furn.js` — `15` Pieces)

Registered on `KratorFurniture` under `culture: 'painted'`:
`painted_pitch_tus_rack`, `painted_burl_coolamon_set`, `painted_rarrk_bark_screen`, `painted_ochre_grinding_slab`, `painted_woomera_dart_rack`, `painted_bark_shield_stand`, `painted_pukamani_indoor_post`, `painted_feather_diadem_perch`, `painted_sage_smudge_pit`, `painted_pronghorn_pelt_bed`, `painted_hotstone_boiling_basket`, `painted_amaranth_mano_metate`, `painted_raided_iron_kettle`, `painted_dogon_notched_ladder`, `painted_drone_pipe_rack`.

## Verification Probe (`window._api`, `99-host-tz-pm.js`)

- `_api.plateauMaterialAudit()` — verifies `0` bamboo, `0` kiln brick/pottery, `0` Tlingit formlines, all *viga* spans `<= 4.20 m`, `15/15` bespoke `painted_*` furniture pieces placed, and `2.8–5.5 m` *Pukamani*/*Lorrkon* pole heights.
- `_api.waterAudit()`, `_api.atmosWindAudit()`, `_api.texturesAudit()`, `_api.zfightAudit()`, `_api.doorsAudit()`, `_api.reachAudit()`, `_api.tradesAudit()`, `_api.oreAudit()`, `_api.fingerprint()`, `_api.rebuild()`.
