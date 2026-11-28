# `kits/hush-kin` — API

Runs on `core/engine` (`engine.py`), `core/atmos`, `core/drawn`, `core/materials`, `core/tags`, `core/furnish`, `core/door`, `core/walk`, and `core/water`, reading `kits/resources` (`42r-res-ore.js`, `44r-res-nodes.js`) in place. Units are metres; local frame origin is the plot centre on the ground, `+z` the front, `+x` right, `+y` up.

## Kit Globals & Pure Data (`[G data]`)

- `KIT` (`26k-kit.js`): `{id: 'hush-kin', culture: 'hush-kin', pack: 'hush-kin', faction: 'Hush-Kin Sanctuary Folk', band: 'Silent-Vales-Sanctuary', frag: 'kits/hush-kin', ...}`
- `HS` (`26k-kit.js`): `{DOOR_H: 2.14, WALL: 0.34, POST_R: 0.24, SOCLE: 0.38, RISER: 0.18, HAND_LAMP_Y: 1.25, RELIEF_STEP: 0.02}`
- `HS_STYLES` (`26k-kit.js`): `{terrace: 'terrace', gallery: 'gallery', spire: 'spire'}`
- `HS_LAKES` (`26k-kit.js`): `northLake` (`196, 928`), `southLake` (`186, 1020`), `pegmatiteDivide`, `southernHushGate`.
- `HS_HARMONICS` (`26k-kit.js`): `440 Hz`, `660 Hz`, `880 Hz`, `1320 Hz` sinusoidal resonance series transmitted undamped through *The Great Hush*.
- `SV_CLOTH` (`26k-kit.js`): `{linen: 1, felt: 1, netting: 1, flag: 1, chimeBronze: 1, chimeNephrite: 1}` — bound to live `ATMOS` valley wind (`90z-hs-atmos.js`).
- `HS_TRADES` (`34-hs-trades.js`): 44-row Voth census trade table (`41` carried, `0` gaps, `3` explicit `na`).
- `hsRigMath` (`34-hs-trades.js`):
  - `quartzStepWidth(wBase, wTop, steps, idx)` — step width profile for 6- to 9-stepped snow-white quartz pyramidal spires
  - `heliographAngle(timeSec, seedPhase, speed)` — optical heliograph bronze shutter rotation angle in `[0, TAU)`
  - `harmonicFreqHz(barIdx)` — `440 / 660 Hz` sinusoidal harmonic ladder (`440, 660, 880, 1320, ...`)
  - `handLampReach(mountY, power)` — dusk *Handspeak* sign-illumination radius around chest-height (`1.25 m`) quartz reflector lamps
  - `chimePin(v)`, `hangPin(v)`, `spanPin(u)` — wind-rigging pin weights with exact `0` at pinned suspension points
  - `formlineLayerZ(zFace, layerIdx)` — `2.0 cm` disjoint depth steps per carved relief / reflector layer (`0` coplanar overlaps)
- `hsDims()` / `hsOreLinks()` (`91z-hs-world.js`): dimensions/tags for `core/hamlet` sanctuary villages, and `resSource` links to `kits/resources` ore nodes.

## Sealed World Bundle (`kit_bundle.py` -> `HSK`)

```python
import sys
sys.path.insert(0, 'kits/hush-kin')
import kit_bundle
js, files = kit_bundle.bundle('HSK')
```

- `HSK.proto(key, v)` -> `THREE.Group` built at origin (`+z` front) with `userData = {key, v, tris, w, d, h, style, doors, fixtures}`
- `HSK.dims()` -> dimensions & tags for all `35` standalone `hs_*` building definitions
- `HSK.trades` / `HSK.tradeDefs(style)` / `HSK.lakes` / `HSK.harmonics` / `HSK.rigMath` / `HSK.errors`

## Architectural & Quartz-Spire Toolkit (`40-hs-kit.js`, `41-hs-quartz.js`)

- `hsQuartzPyramid(cx, cz, wBase, yBase, rise, steps, o)` & `hsQuartzSpireTower(cx, cz, wBase, y0, hShaft, o)` — battered `5:1` to `6:1` pale-granite & blue-slate towers crowned with 6- to 9-stepped gleaming snow-white `quartz` spires, optional `hsHeliographCupola`, and `hsTuningFinial`.
- `hsSignGallery(x, y, z, w, d, h, yaw, o)` & `hsHandLamp(x, y, z, yaw, o)` — open colonnaded *Handspeak* sign-loggias and chest-height (`y = 1.25 m`) crystal-diffused lamps backed by dished white-quartz parabolic reflectors.
- `hsHarmonicRack(x, y, z, w, yaw, o)` — lacquered cypress & bronze frames suspending swaying elliptic *bianzhong* bells (`chimeBronze`) and sawn emerald-nephrite *qing* slabs (`chimeNephrite`).
- `hsPalmMonolith(x, y, z, h, yaw, o)` — carved pale-granite & snow-white-quartz Raised Open-Palm Boundary Monolith (`>= 2.0 cm` z-stepped relief).
- `hsSteppedAmphitheatre(...)` & `hsHushPylon(...)` — walkable stepped council moot tiers and the intact pre-Cataclysm Acoustic Hush-Pylon.

## Bespoke `hush-kin` Furniture (`39-hs-furn.js` — `14` Pieces)

Registered onto `KratorFurniture`:
`hush_bianzhong_bell_rack`, `hush_nephrite_lithophone`, `hush_heliograph_tripod`, `hush_handspeak_mirror_lamp`, `hush_open_palm_stele`, `hush_primer_tablet_stand`, `hush_felt_sole_loom`, `hush_quartz_brazier_stove`, `hush_scroll_chronicle_rack`, `hush_lapidary_grinding_bench`, `hush_tea_sign_table`, `hush_silent_warden_rack`, `hush_cable_capstan`, `hush_crystal_reliquary_chest`.

## Verification Probe (`window._api`, `99-host-tz-hs.js`)

- `_api.quartzSpireAudit()` — verifies `>= 18` snow-white quartz spires, `>= 8` optical heliographs, `>= 14` Open-Palm monoliths, `>= 24` chest-height reflector hand-lamps, and `>= 16` *bianzhong*/nephrite harmonic racks.
- `_api.waterAudit()`, `_api.atmosWindAudit()`, `_api.texturesAudit()`, `_api.zfightAudit()`, `_api.doorsAudit()`, `_api.reachAudit()`, `_api.tradesAudit()`, `_api.oreAudit()`, `_api.fingerprint()`, `_api.rebuild()`.
