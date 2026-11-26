# Arcflow (`Külaneva`, `rmwetn7jqgm9g`)

Onshore extension of **The Arch** ([`biomes/arch`](../arch/README.md)) overriding the northern sedimentary foredeep of **Double Delta** and **Ria Valley**, and the showcase for the **Serpentine Edaphic Crazy-Quilt** (`~75%` Earth silver-birch / spire-spruce / honey-linden / cloudberry *Sphagnum* matrix wrapping around `~25%` scarlet-and-carnelian *Erythrophyll* refugia on toxic `Mg/Ca > 8`, `Ni > 2,200 ppm` serpentinite skerries and `pH 11.5` travertine rims).

Read [`PLAN.md`](PLAN.md) for the geological & ecological specification and [`../../docs/CARNELIAN-FRONTIER-PLAN.md`](../../docs/CARNELIAN-FRONTIER-PLAN.md) for the SW→NE Carnelian Ecological Frontier master scope.

## Stations

| Station | Built Page | Focus |
|---|---|---|
| `klint` *(default)* | `dist/arcflow.html` | `55 m` *Külaneva-Klint* horseshoe waterfall over golden *kukersite* oil-shale & glauconitic blue amber-clay (`site:kulanewa-karum-bridge`) |
| `koski` | `dist/arcflow-koski.html` | `Helme-Koski` zebra-cumulate 3-step rapids & cylindrical `Hiidenkirnu` amber swirl-kettles (`site:kulanewa-sampo-forge`) |
| `seep` | `dist/arcflow-seep.html` | `pH 11.5` `Ca-OH` cerulean travertine cascades, *Jumala-Tuli* abiotic `H2/CH4` cold-flames & `60%` Carnelian spire-garden (`site:kulanewa-ikki-shrine`) |
| `neva` | `dist/arcflow-neva.html` | `Musta-Jõgi` tea-black humic fen, regenerating `raha-maak` Fe-Ni penny-ore shoals & crimson *kalju-selkä* serpentinite islands (`site:kulanewa-bog-rake`) |
| `auger` | `dist/arcflow-auger.html` | NE serpentinite Carnelian red-barren sliced by a bone-white Ancient Bleach-Swath & `45 m` `ecof_soil_auger` lime-phosphate birch oasis (`site:kulanewa-watch-post`) |

## Build & Verify

```bash
python3 tools/textures/pack.py biomes/arcflow
python3 tools/build.py biomes/arcflow --all
node biomes/arcflow/tests/test-arcflow.js
python3 biomes/arcflow/verify.py --station klint --assert
```
