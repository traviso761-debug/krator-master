# Iguana — the Lizardmen's granary town on the Pile's plateau

Iguana (proposed `5.1 px 713,1569`, `-373 m`, `0.3 %` flat plateau, `1.68 atm`, Köppen `Af` tropical rainforest, `23 °C`, `1,992 mm`) is Basilisk's granary town 14.6 km west of the Pile (`Loj Nahn`), built on `kits/lizardmen/build.py --settlement` and the shared village builder `kits/lizardmen/settle` (`PLAN.md`).

- **The village (`core/city`):** one wide rhombic squared-spiral street (`75° / 105°`, five windings `44 -> 55 -> 68.75 -> 85.94 -> 107.42 m`, `axis 105°` so the mouth opens due east toward the Pile), every dwelling door facing inward to `lz-nest`, brick wells (`gl-well`) in the outer halves, the mustering ground (`lz-muster`) at the east mouth, and the straight ley line aimed `96.7°` at the east reliquary (`790,1578`).
- **The Great Granary & Watch on Loj Nahn:** twenty-seven `lz-granary` halls laid in a squared spiral `1.25 km` west between the village and its fields (~`2,600 t` of grain a year), and three `lz-lookout` towers (`2.6`, `3.7` and `4.7 km` east) watching Loj Nahn without pressing it.
- **Water (`core/water`):** brick wells (`gl-well`) and the great tank (`gl-tank`) on `WATER.still`, plus **Muckle Weyt Beck** (`r202`, perennial, `22.0 m³/s`) crossing the NW edge `5.4 km` from the pin on `WATER.flow`.
- **Fields & outwork (`kits/crops`, `core/hamlet`):** 29 rows of plateau farmland (`rice`, `helix-bean`, `sweet-potato`, `ashroot`), eleven farms, seven panemone windmills, and the farming hamlet (`iguana.farm`, focus `farming`) `3.3 km` WSW on `core/hamlet/lizardmen`.
- **Records (`IG_REC`, `[G data]`):** `src/80-ig-records.js` held to `LZ_TUNE` (`3,000` residents, Drovers `40 %`; `grain 2,600 t`, `produce 250 t`, `meat_hide 210 t`, `relics 1.5 t`).

## Build and verify

```sh
python3 tools/build.py settlements/iguana
node settlements/iguana/test-ig-records.js
KRATOR_GL=gpu python3 settlements/iguana/verify.py settlements/iguana/dist/iguana.html --assert --views "Overview,The Great Granary"
```
