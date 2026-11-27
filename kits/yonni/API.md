# kits/yonni: API

Units, coordinate frames, `defBuilding`, `place()`, `FURNISH`, doors (`KDOOR`), walk (`KWALK`), and probe methods follow `core/engine` (`core/engine/README.md`).

- **Culture:** `KIT.culture = 'yonni'` (`Yonni Spear-Queens`), life faction `'Twin-Born Spear-Queens of Yonni'`.
- **Modes (`tags.style`):** `'freestanding'` (`Yonni Coast`) and `'cliff'` (`Scoured Hills` cliff-scarp engaged structures).
- **Local frame:** metres; `+x` east, `+y` up, `+z` front (south). Note that `core/engine`'s `sector(mk, cx, cz, r0, r1, a0, a1, ...)` measures angle `a` from `+x` toward `+z`, so `a = PI/2` is the `+z` front (`ynYawFromA(PI/2) === 0`).

## Fragments

| Fragment | Prefix | Role |
|---|---|---|
| `00-head.html` | | Page shell, `#errs` panel, Three.js r128 loader |
| `26k-kit.js` | | `[G data]` `KIT`, `YN_SUB`, `SV_LIB`, `SV_TILE0`, `SV_CLOTH`, `SV_CUT`, `SVPAL`, `P(k)` |
| `28-yn-matfix.js` | | Upgrades `MAT.plain`, `MAT.brass`, `MAT.bone`, `MAT.flag` to packed library maps |
| `31-alt-takes.js` | | `[G data]` `MAT_VAR` variant material tables (`cobble`, `sealime`, `slate`, `planks`) |
| `36p-yn-openfix.js` | | Upgrades `MAT.room` and `svHwMat()` door hardware to packed library maps |
| `yonni_furniture.js` | | Bespoke `FURN_CULTURE('yonni', ...)` + 28 zero-z-fighting `yonni_*` `FURN` defs bundled into `KratorFurniture` |
| `40-yn-kit.js` | `yn` | `ynRootSkirt`, `ynFloorDisc`, `ynCrescentVisor`, `ynDripSkirt`, `ynDrumWall`, `ynCorbelFins`, `ynArcadeRing`, `ynSpiralStair`, `ynGangplank`, `ynFlyingBridge` |
| `41-yn-roof.js` | `yn` | `ynTwinSpearFinial`, `ynCanopy`, `ynUmbrellaCanopy`, `ynFunnelRoof`, `ynStormLamp`, `ynBanner` |
| `42-yn-dress.js` | `yn` | `ynFurn`, `ynFurnRoundRoom`, `ynSpinner`, `ynCropTerrace`, `ynAdit`, `ynWindlass`, `ynOreHeap`, `ynOreLinks()` |
| `42r-res-ore.js`, `44r-res-nodes.js` | `res` | Read in place from `kits/resources`: 20 ore kinds x 3 grades and `resSource` |
| `53a-yn-vocab.js` | | `[G data]` Idempotently registers `yonni` on `KTAGS.VOCAB` |
| `54-yn-dwell.js` | `ynd` | `yndTower(o)` + 9 Freestanding dwellings (`3` poor, `3` middle, `3` rich) |
| `55-sa-beasts.js` | `sa` | Fauna defs (`ynb-sheep`, `ynb-goat`, `ynb-horse`, `ynb-hen`) with `SV_LIFE` schedules |
| `56-yn-civic.js` | `ync` | 5 Civic/Sacred rotundas (`yn-citadel-twinkande`, `yn-rotunda-seer`, `yn-hall-sisterhood`, `yn-school-scriptorium`, `yn-bath-cistern`) + 3 Freestanding Defence defs |
| `56p-yn-palace.js` | `ynp` | Twin-Queen Royal Palace & Citadel (`yn-palace-citadel`), Peripteral Royal Court Rotunda (`yn-court-rotunda`), `ynpOculusMedallion`, `ynpGuardianStatue`, `ynpRainGlobe`, `ynpVaultBridge`, `ynpRadialStairs` |
| `57-yn-forts.js` | `ynf` | Formline Fortifications: `ynfFormlinePanel`, `ynfDiamondScreen`, `ynfGablePier`, `yn-wall-curtain`, `yn-gatehouse-portal`, `yn-tower-formline` (~26 m) |
| `58-yn-trades.js` | `ynt` | 10 Voth-census workshops, processing drums, clinic & mead-rotunda tavern |
| `59-yn-works.js` | `ynw` | 10 Voth-census market, shophouse, granary, squall-mill, warehouse, centered `yn-farmstead`, byre, mine, quarry, pharos |
| `60-yn-monuments.js` | `ynm` | 6 Monumental sacred/civic/citadel landmarks (`yn-spire-saucers`, `yn-monastery-giltcluster`, `yn-arena-ringcourt`, `yn-sanctuary-giltgate`, `yn-shrine-pylondome`, `yn-citadel-hexstilt`) + `ynmBulbDome`, `ynmSaucerPod`, `ynmHexTrussLeg` |
| `61-yn-quarters.js` | `ynq` | 7 Freestanding inns, villas, manors, bazaar-drums, sun-towers, garrison compounds & smelters (`yn-inn-staineddrum`, `yn-villa-belvedere`, `yn-manor-apserose`, `yn-bazaar-drum`, `yn-tower-sunpetal`, `yn-compound-sails`, `yn-smelter-scallop`) |
| `62-yn-harbour.js` | `ynh` | 4 Coastal harbour & war-galley dockyard defs (`shore: true`) |
| `64-yn-cliff.js` | `ynk` | 6 Cliff-Flush Engaged Mode defs (`style: 'cliff'`), including `yn-cliff-rotunda` & `yn-cliff-cluster` |
| `64b-yn-cliff-grand.js` | `ynk2` | 2 Grand Cliff-Flush complexes (`yn-cliff-lanternhold`, `yn-cliff-viaduct-hall`) |
| `65-yn-borderfort.js` | `ynr` | Spear-Queen Frontier Border-Fort (`yn-border-fort`, `style: 'cliff'`), `ynrBeaconBrazier`, `ynrProwBastion` |
| `66-yn-flora.js` | `ynb` | 4 Placeholder wet-coastal flora defs (`cls: 'flora'`) |
| `68-yn-census.js` | `yn` | `[G data]` `YN_TRADES` (44 Voth census trades) and `ynDims()` (`core/city` footprint export) |
| `89-rows.js` | | `[G data]` `FAMILIES` layout rows (`hillside`, `cliff`, `shore`) |
| `90y-yn-terrain.js` | | Sculpts `26 deg` hillside ridge, cliff-scarp backdrop, coastal seabed & `#include <atmos_waves>` sea |
| `91f2-yn-texguard.js` | | Flushes `YN_SPINNERS`, guarantees 100% `f_*` furniture detail maps, registers `KDRAWN` ground |
| `99-ms-audit.js` | | Installs `_api.textureAudit()` and `_api.zfightAudit(o)` onto `window._api` |

## Probe Extensions (`window._api`)

In addition to all standard `core/engine` probe methods (`footprints()`, `doors()`, `kitCoverage()`, `nanSweep()`, `furniture()`, `tags()`, `tagExport()`, `materials()`, `life()`, `openings()`, `doorExport()`):

- `_api.textureAudit()` -> `{ total, textured, buildingMeshes, furnitureMeshes, faunaMeshes, exemptCount, untextured }`
- `_api.zfightAudit({ tol = 0.0015, pen = 0.004 })` -> `{ totalTris, tolMm, overlaps, pairs }`
- `ynDims()` -> `{ [key]: { cls, w, d, h, style, wealth, types, role, job, cut, shore, cliff } }`
- `ynOreLinks()` -> `{ nodes, mines }`
