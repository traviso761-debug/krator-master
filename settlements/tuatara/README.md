# Tuatara — the Lizardmen's copper town on the volcanic savanna

Tuatara (`5.1 px 818,1554`, pin `szv27b2reu`, `-1,704 m`, `1.98 atm`, Köppen `XV` abyssal savanna) is the Lizardmen's copper-mining and raiding village 46 km south of the Sultanate's west watch fort, built on `kits/lizardmen/build.py --settlement` and the shared village builder `kits/lizardmen/settle` (`PLAN.md`).

- **The village (`core/city`):** one rhombic squared-spiral street (`75° / 105°`, five windings `36 -> 45 -> 56.25 -> 70.31 -> 87.89 m`, `axis 15°` so the mouth opens due north toward the Marches), every dwelling door facing inward to `lz-nest`, brick wells (`gl-well`) in the outer halves, the mustering ground (`lz-muster`) and war-band camp (`lc-*`) at the north mouth, and the straight ley line aimed `229.4°` at the east reliquary (`790,1578`).
- **Water (`core/water`):** no perennial lake or river within 40 km; fresh water stands in the brick wells (`gl-well`), the great tank (`gl-tank`) and seven sunken brick cisterns (`lz-cistern`) around the spiral, each a `WATER.still` record.
- **Copper & fields (`kits/resources`, `core/hamlet`, `kits/crops`):** five copper nodes within 6 km resolved from `KRES.near`, anchored by the diggers' outwork (`tuatara.diggings`, focus `mine`) on `core/hamlet/lizardmen` at the nearest high-grade node (`-1,653, -1,903 m`) with four satellite `lz-mine` shafts; savanna grain and produce fields (`ashmillet`, `sandpan-fonio`, `bambara`, `frillpod`), seven farms and three panemone windmills to the south.
- **Records (`TU_REC`, `[G data]`):** `src/80-tu-records.js` held to `LZ_TUNE` (`3,000` residents across the six castes; `grain 1,000 t`, `produce 250 t`, `meat_hide 210 t`, `copper 70 t`).

## Build and verify

```sh
python3 tools/build.py settlements/tuatara
node settlements/tuatara/test-tu-records.js
KRATOR_GL=gpu python3 settlements/tuatara/verify.py settlements/tuatara/dist/tuatara.html --assert --views "Overview,The nest hall"
```
