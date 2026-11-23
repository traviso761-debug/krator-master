# Amaro — Capital of the Kingdom of Shumar (`settlements/shumar`)

**Amaro** (`ssgsv5zbd2`, `LORE.md` §6.19 & §6.23) is the fortified canyon-lip Mamluk capital of the **Kingdom of Shumar**, perched at `3,088.7 m` ASL (`px 731, 1192` on Map 5.1) directly overlooking the `241 m` four-tier *ablaq* basalt-and-travertine chasm where `Bētun-Nārun` (`r007`), `Pāyaru-Buruqu` (`r288`), and `Qappu-Nārun` (`r287`) converge at `2,848.0 m` ASL.

## Spatial Architecture & Owner Design Calls

1. **Triple-Confluence Canyon Lip (`1: A`)**:
   - Seated on the `3,088.7 m` southern promontory (`40-am-ground.js` + `tools/scale-model/edit_520_amaro_gorge.py`), overhanging a `241–263 m` stepped basalt-and-limestone gorge with three live `core/water` confluence rivers (`Bētun-Nārun`, `Pāyaru-Buruqu`, `Qappu-Nārun`), a mill-race leat (`leat.gisr`), and the Lip Meydan *sabil* basin.
2. **Greater Amaro Census (`12,850` across 4 `SHUMAR_TUNE` Districts + `1,309` across 6 Ring Hamlets)**:
   - **`ssgsv5zbd2` (`10,600` target)**: Walled Upper City (`amaro-upper`), terraced Outlander Customs Shelf (`amaro-customs`), and mid-cliff `Darb al-Kīr` Forge Ledges (`amaro-forges`).
   - **`amaro.citadel` (`1,100` target)**: `Qappu al-Šubaru` western basalt promontory (`3,110.7 m` ASL, `262.7 m` sheer drop) isolated by a `22 m` rock-cut dry fosse and arched causeway.
   - **`amaro.necropolis` (`300` target)**: `Madīnat al-Qubab` eastern cliff-crest City of Domes (`3,099 m` ASL).
   - **`amaro.gisr` (`850` target, 3rd sub-district)**: `Pāyaru-Gisr` fortified confluence bridgehead (`2,854 m` ASL), twin `sm_gorge_bridge_tower`s, `6` grain watermills, and `8` copper-dome `Ṣūnu-šikaru` (`tequila`) stills.
   - **Ring Hamlets (`amaro.ring.farm-1..3`, `orchard-1`, `quarry-1`, `ranch-1`)**: `6` `KHAMLET.village` settlements on the surrounding plateau (`42-am-ring.js`).
3. **Terraced Outlander Customs Shelf (`-38 m` Below North Gate)**:
   - `Bābu-Dalab` and `Bābu-Iziz` (`~420` `-no` outlanders: factors, caravaneers, envoy houses, and bonded `wikala` caravanserais) sit on a stepped mid-cliff bench at `+202 m` (`-38 m` below the `+240 m` North Gate), commanded from above by `sm_pishtaq_gate` and `sm_payaru_tower`.
4. **`Madīnat al-Qubab` Unblocked Skyline Silhouette**:
   - `15` regimental *qubba* mausolea (`sm_regiment_qubba` `v=0` `+1` spiral gadroons & `v=1` star-carved relief), `sm_hall_of_blades`, and the `-1` mirror-spiral `sm_doriyan_stele` march single-file along the northern cliff crest (`z = -424..-418`) with zero northern blockers, forming an unblocked Mamluk dome silhouette from the gorge floor and opposing rims.

## Build & Verify

```bash
# Offline pure-data layout, OBB safety, skyline, customs shelf & live economy test (20 checks + 20 negative controls)
node settlements/shumar/tests/test-amaro-site.js

# Build dist/shumar.html + sidecar texture packs (shumari, shigh, construction)
python3 tools/build.py settlements/shumar

# Headless GPU verification (smoke, views, ?interiors=1, walk, export, surface/furniture texture audit)
KRATOR_GPU_LANE=auto python3 settlements/shumar/verify.py settlements/shumar/dist/shumar.html --assert
```
