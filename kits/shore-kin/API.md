# `kits/shore-kin` API

## 1. Settlement Bundle (`kits/shore-kin/kit_bundle.py`)

Another world (`settlements/fleetborn-cove`, `openworld/*`, `core/hamlet`) seals the kit into an isolated closure `SKK` without touching page globals:

```python
import sys
sys.path.insert(0, os.path.join(ROOT, 'kits', 'shore-kin'))
import kit_bundle as sk_bundle
sk_js, sk_inputs = sk_bundle.bundle('SKK')
```

### Runtime JS API (`SKK`)

- **`SKK.proto(key, variant = 0)`** -> `THREE.Group | null`
  Builds `key` at the origin (`y = 0`, front `+z`) with merged material buckets and operable `core/door` leaves/panes.
  `group.userData` holds `{ key, v, tris, w, d, h, style, materials, bill, doors, fixtures }`.
- **`SKK.dims()`** -> `{ [key]: { cls, name, w, d, h, fw, fd, style, wealth, types, role, job, materials, bill, cut, variants } }`
  Plain dimension, tag, and Arch material bill table for all 16 Shore-kin `defBuilding`s.
- **`SKK.bills`** -> `SK_BILLS` (`{ [key]: { materials: [{ part, mat, cat, good, bucket, qty }], bill: { [good]: qty }, byArchMat: { [mat]: qty } } }`).
- **`SKK.archMaterials`** -> `SK_ARCH_MATERIALS` (canonical whitelist of 33 Arch local & sea-derived materials).
- **`SKK.trades`** / **`SKK.tradeDefs()`** -> 44-row Voth census trade mapping onto `sk_*` building keys.
- **`SKK.errors`** -> array of any runtime `reportErr` strings.

## 2. Building Keys (16 `defBuilding`s)

| Key | Wealth | Types | Job | Summary |
|---|---|---|---|---|
| `sk_stilt_cot` | `poor` | `dwelling-single` | `fishing` | Arched basalt/laterite flood socle + mangrove drying deck + 2-tier thatch |
| `sk_boardwalk_shack` | `poor` | `dwelling-single` | `carpentry` | Salvaged hull-plank & paperbark shore cot on tarred mangrove cribs |
| `sk_crib_rowhouse` | `poor` | `dwelling-multi` | `fishing` | Two-door yard-crew rowhouse on shared arched laterite & mangrove boardwalk |
| `sk_hex_lime_house` | `middle` | `dwelling-single` | `weaving` | Six-sided shell-limewash artisan house + brucite screens + clay door mask |
| `sk_serpentine_lodge` | `middle` | `dwelling-multi` | `herding` | Battered serpentinite/dunite ring lodge + mangrove-knee & whale-rib turf dome |
| `sk_compound_house` | `rich` | `dwelling-single`, `shop` | `shipwrighting` | Two-storey factor/shipwright arched-socle & tiered-roof house + paktong mask |
| `sk_byssus_court` | `rich` | `dwelling-multi`, `shop` | `dyeing` | Sea-silk weaver & catechu-dyer courtyard house with rainwater basin |
| `sk_client_hall` | `rich` | `civic`, `market` | `customs` | Caretaker House's Shore-kin client moot & paktong tally hall |
| `sk_ash_kelp_kiln` | `poor` | `industry` | `alchemy` | *Pycnandra* nickel-shrub turf-sealed ash clamp + stone kelp trench kiln |
| `sk_spar_sawpit` | `middle` | `industry` | `carpentry` | *Araucaria* trestle saw pit, kauri-gum pitch pot & mangrove-knee steaming trough |
| `sk_ropewalk_pitch` | `middle` | `industry` | `ropemaking` | Coir/hibiscus/byssus rope walk + gjár bitumen & kauri-gum boiler |
| `sk_paktong_foundry` | `rich` | `industry` | `smithing` | Copper/zinc roast heap + serpentinite/laterite paktong cupola, bellows & ingot racks |
| `sk_fish_saltery` | `poor` | `industry`, `farm` | `salt` | Intertidal fish weir (`core/water`) + brucite salt pans + twin-crown smokehouse |
| `sk_lime_kiln` | `poor` | `industry` | `quarrying` | Draw-arch shell & `limeshelf` travertine kiln + slaking shed |
| `sk_boat_grid_shed` | `middle` | `industry`, `infrastructure` | `shipwrighting` | Tarred mangrove-crib skiff & tender careening grid and repair shed |
| `sk_tide_shrine` | `middle` | `religious`, `civic` | `worship` | Stepped serpentinite/brucite shrine + spring/neap/Double-Dark paktong tide post |

## 3. Texture Pack Requirement

A host world that renders `SKK` in library mode packs or loads the `shore-kin` family table (`kits/shore-kin/materials.json` -> `KMAT.pack('shore-kin', ...)`).
