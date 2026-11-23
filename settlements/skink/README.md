# Skink — the Lizardmen's salt village under the Pile

Skink (`5.1 px 691,1521` proposed, `-1,633 m`, `1.96 atm`, Köppen `XV` abyssal savanna, `1,051 mm`) is the Lizardmen's `1,500`-resident salt-mining and evaporating village on the richest halite deposit in the country (`grade 254`), halfway between Iguana and Gila on the west Coil loop (`PLAN.md`).

- **The village (`core/city`):** a four-winding rhombic squared-spiral street (`75° / 105°`, `32 -> 40 -> 50 -> 62.5 m`, `axis 177.5°` so the mouth opens south-south-east down the basin toward the salt lake), two `gl-saltstore`s alongside the bronze and bone halls on Winding 2, `lz-granary`, `lz-bakehouse`, `lz-barracks` and `lz-fermentery` on Winding 3, and the straight ley line aimed `311.3°` at the west reliquary (`651.9,1486.7`).
- **Rock-salt mines & lake pans (`core/water`, `core/hamlet`):** three rock-salt shafts (`lz-mine`) on white halite aprons `1.6–2.2 km` out on the basin flat (~`150 t/yr` quarried salt), and `7.5 km` SSE on the north shore of the `32 km²` salt lake (`-1,706 m`, `WATER.open`), `skink.pans` (`core/hamlet/lizardmen`, focus `salt`) plus seven squared-spiral evaporating pan fields (`gl-pans`, `WATER.still`, ~`150 t/yr` pan salt).
- **Fields & records (`kits/crops`, `SK_REC`, `[G data]`):** `ashmillet`, `sandpan-fonio` and `frillpod` fields with 3D ridged furrows and walled groves (`lz-orchard`) north up the basin; `src/80-sk-records.js` held to `LZ_TUNE.checkTown` (`1,500` people; `salt 300 t`, `grain 300 t`, `produce 125 t`, `meat_hide 75 t`).

## Build and verify

```sh
python3 tools/build.py settlements/skink
node settlements/skink/test-sk-records.js
KRATOR_GL=gpu python3 settlements/skink/verify.py settlements/skink/dist/skink.html --assert --views "Overview,The nest hall"
```
