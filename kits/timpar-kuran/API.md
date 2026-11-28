# `kits/timpar-kuran` — API

Runs on `core/engine` (`engine.py`), `core/atmos`, `core/drawn`, `core/materials`, `core/tags`, `core/furnish`, `core/door`, `core/walk`, and `core/water`, reading `kits/eternian` (`38-et-alt.js`, `40-et-kit.js`, `41-et-profile.js`, `42-et-head.js`) and `kits/resources` (`42r-res-ore.js`, `44r-res-nodes.js`) in place. Units are metres; local frame origin is the plot centre on the ground, `+z` the front, `+x` right, `+y` up.

## Kit Globals & Pure Data (`[G data]`)

- `KIT` (`26k-kit.js`): `{id: 'timpar-kuran', culture: 'timpar-kuran', pack: 'timpar-kuran', faction: 'Timpar-Kuran Timber Clans', band: 'Veiled-Mountain-Clans', frag: 'kits/timpar-kuran', ...}`
- `TK` (`26k-kit.js`): `{DOOR_H: 2.12, WALL: 0.34, POST_R: 0.28, SOCLE: 0.42, RISER: 0.18, FORMLINE_STEP: 0.016}`
- `TK_STYLES` (`26k-kit.js`): `{jomon: 'jomon', plank: 'plank', crest: 'crest'}`
- `TK_CRESTS` (`26k-kit.js`): 5 clan crests (`kuma` Mountain Bear, `kapac` Storm-Bird, `rapan` Mist-Raven, `hueru` Ancestral Whale, `wurup` Cloud-Wolf).
- `TK_VALLEYS` (`26k-kit.js`): `veilpass`, `mistValley`, `mistValley2`, `region177`.
- `SV_CLOTH` (`26k-kit.js`): `{chilkat: 1, attus: 1, inau: 1, hide: 1, netting: 1, flag: 1}` — bound to live `ATMOS` valley-mist wind & gusts (`90z-tk-atmos.js`).
- `TK_TRADES` (`34-tk-trades.js`): 44-row Voth census trade table (`41` carried, `0` gaps, `3` explicit `na`).
- `tkRigMath` (`34-tk-trades.js`):
  - `cornerPin(u, v)`, `spanPin(u)`, `hangPin(v)`, `inauPin(s)` — wind-rigging pin weights with exact `0` at pinned edges/ends
  - `plankSlopeY(w, yEaves, rise, x)` — low-pitched (`18°–24°`) Tlingit split-cedar roof height
  - `kaenCrownR(rBase, t)` — cord-marked Jōmon *kaen-doki* flame-rimmed smoke-pot profile
  - `ratGuardRadius(rPost)` — Ainu *pu* stilt granary *nezumi-gaeshi* disc overhang (`>= 2.45 * rPost`)
  - `totemOvalPt(halfW, halfH, yMid, a)` — oval totem-mouth doorway rim curve
  - `daakTierHeights(yCenter, tiers, stepH)` — interior stepped `daak` clan platform elevations
  - `formlineLayerZ(zFace, layerIdx)` — `1.8 cm` disjoint depth steps per formline relief layer
  - `trophyEyeRuleOk(tkVisorEyes, etLootEyes, etInvertedOrPainted)` — verifies open-eyed Timpar-Kuran war-visors vs closed-eyed inverted/war-painted Eternian trophies
- `tkDims()` / `tkOreLinks()` (`91z-tk-world.js`): dimensions/tags for `core/hamlet` & `core/camp`, and `resSource` links to `kits/resources` ore nodes.

## Sealed World Bundle (`kit_bundle.py` -> `TKK`)

```python
from kits import kit_bundle  # sys.path.insert(0, 'kits/timpar-kuran')
js, files = kit_bundle.bundle('TKK')
```

- `TKK.proto(key, v)` -> `THREE.Group` built at origin (`+z` front) with `userData = {key, v, tris, w, d, h, style, doors, fixtures}`
- `TKK.dims()` -> dimensions & tags for all 38 `tk_*` building definitions
- `TKK.trades` / `TKK.tradeDefs(style)` / `TKK.crests` / `TKK.valleys` / `TKK.rigMath` / `TKK.errors`

## Architectural & Formline Toolkit (`40-tk-kit.js`, `41-tk-formline.js`)

- `tkPitBase(w, d, o)` / `tkPlinth(w, d, h, o)` — semi-sunken Jōmon timber-crib & `megabreccia` pit-bases and stepped plinths with walkable stairs.
- `tkPlankWall(...)` / `tkPlankBox(...)` / `tkPlankRoof(...)` / `tkCiseRoof(...)` — slotted split red-cypress walls, gale-cobble plank roofs with *ganook* smoke-shutters, and stepped Ainu reed/bark *cise* roofs with *kaen-doki* crowns (`tkKaenCrown`).
- `tkDaakTiers(...)` / `tkPuStilts(...)` / `tkIroriPit(...)` — interior walkable stepped `daak` platforms, rat-baffled *pu* stilt caches, and cobble *irori* hearths.
- `tkFormlineScreen(...)` / `tkFormlineGable(...)` / `tkOvoidRelief(...)` / `tkUFormRelief(...)` — z-stepped black-red-teal Tlingit ovoid, U-form, split-U, and copper-eye screens.
- `tkTotemPole(...)` / `tkTotemPortal(...)` — stacked 3D crest/mortuary totem poles and oval totem-mouth entrance portals fitted with operable `pivot: true` `KDOOR` plug-doors.
- `tkInauCluster(...)` / `tkNusaFence(...)` / `tkKanopiRib(...)` / `tkWarVisor(...)` / `tkLootHead(...)` — shaved-willow *inau* spirit-wands, *nusa* bear/eagle skull-fences, salvaged `Kanopi` arcology canopy-ribs, open-eyed wooden war-visors, and captured Eternian war-loot heads (`42-et-head.js`).

## Bespoke `timpar-kuran` Furniture (`39-tk-furn.js` — `14` Pieces)

Registered onto `KratorFurniture`:
`timpar_irori_kaen_hearth`, `timpar_kerfed_bentwood_chest`, `timpar_inau_nusa_rack`, `timpar_slat_cuirass_stand`, `timpar_visor_war_helm`, `timpar_eternian_trophy_rack`, `timpar_chilkat_loom`, `timpar_totem_house_post`, `timpar_smoked_salmon_frame`, `timpar_kanopi_alloy_lamp`, `timpar_bear_feast_trough`, `timpar_attus_bale_bench`, `timpar_copper_shield_crest`, `timpar_dugout_paddle_rack`.

## Verification Probe (`window._api`, `99-host-tz-tk.js`)

- `_api.totemPortalAudit()` — verifies oval totem-mouth doorways and operable pivoting `KDOOR` leaves.
- `_api.trophyContrastAudit()` — verifies 100% open-eyed Timpar-Kuran war-visors vs 100% closed-eyed inverted/war-painted Eternian trophy heads (`0` reverent door-masks).
- `_api.waterAudit()`, `_api.atmosWindAudit()`, `_api.texturesAudit()`, `_api.zfightAudit()`, `_api.doorsAudit()`, `_api.reachAudit()`, `_api.tradesAudit()`, `_api.oreAudit()`, `_api.fingerprint()`, `_api.rebuild()`.
