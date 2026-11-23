# Komodo — the Lizardmen's tin town at the far end of the eastern sea

Komodo (`5.1 px 865,1617`, pin `spnqhezhiw`, `-2,452 m`, `2.17 atm`, Köppen `XA` hypertropic jungle, `4,000 mm`) is the Lizardmen's tin-placer, fishing and raiding town on the bluff above the eastern terminal sea's far end, built on `kits/lizardmen/build.py --settlement` and `kits/lizardmen/settle` (`PLAN.md`).

- **The village (`core/city`):** one tighter rhombic squared-spiral street (`75° / 105°`, five windings `32 -> 40 -> 50 -> 62.5 -> 78.12 m`, `axis 15°` so the long arms run level along the contour and the mouth opens due north down to the shore), every building seated on a plinth against the `4,000 mm` rain, the mustering ground (`lz-muster`) and raiding camp (`lc-*`, `120` warriors against the Golden Tears' camp) at the north mouth, and the straight ley line aimed `297.5°` across the sea toward the east reliquary (`790,1578`).
- **Water & fishery (`core/water`):** the eastern terminal sea (`WATER.open`, salt, no tide), brick wells (`gl-well`) and the great tank (`gl-tank`) (`WATER.still`), Kruk Warra (`r088`, perennial, `51.3 m³/s`) (`WATER.flow`), and three cane-and-reed fishing weirs with bone drying racks (`lz-weir`) standing in the northern shallows (`240 t/yr` fish).
- **Tin placers & fields (`kits/resources`, `core/hamlet`, `kits/crops`):** the `18 x 9 km` near grid runs `13.5 km` east along the shore to hold `komodo.placers` (`core/hamlet/lizardmen`, focus `mine`) and three `lz-placer` sluice floors on Kruk Warra's tin-and-gold gravel (`KRES.near`, `8 t/yr` tin for Basilisk's bronze hall), with `bamboo-rice`, `taro` and `shade-manioc` fields along the eastern shore bench.
- **Records (`KM_REC`, `[G data]`):** `src/80-km-records.js` held to `LZ_TUNE` (`3,000` residents across Gila's caste shares; `grain 600 t`, `produce 250 t`, `fish 240 t`, `meat_hide 90 t`, `tin 8 t`).

## Build and verify

```sh
python3 tools/build.py settlements/komodo
node settlements/komodo/test-km-records.js
KRATOR_GL=gpu python3 settlements/komodo/verify.py settlements/komodo/dist/komodo.html --assert --views "Overview,The nest hall"
```
