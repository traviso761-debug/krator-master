# Matron's Coast / The Snail Coast (`Kandē-Sākhil`, `rmwvqchv37nh0`)

Hyper-wet north-western ocean coast (`62,964 km²` dry land + `6,032 km²` drowned `16`-island skerry channels, `3,357–4,000 mm/yr` rain, `1.43–1.60 atm` / `0.30–0.33 atm O₂` at `0.75 g`) wedged between [`biomes/farside`](../farside/PLAN.md) to the south-west and [`biomes/shroudhills`](../shroudhills/PLAN.md) to the north-east, inside the western coastal realm of the Twin-Born Spear-Queens of `Yonni`. Giant pulmonate land-snails, `8`-plated skerry megachitons, and arboreal gastropods shape its `2.20 m` forest browse-line, opalescent mucus silver-highways, biogenic coquina conch-middens (`sealime`), southern `landkelp` grazing border, and north-eastern Shroud-Ant mucus exclusion barrier.

Read [`PLAN.md`](PLAN.md) for the full ecological & geological specification and [`BIOME-API.md`](BIOME-API.md) for the exported contract.

## Stations

| Station | Built Page | Pixel (`5.1`) | Focus |
|---|---|---|---|
| `skerry` *(default)* | `dist/matronscoast.html` | `312, 392` | Drowned `16`-island skerry sound, `KCOAST` shores, cemented spiral Coquina Conch-Middens, `1.1 m` Skerry Megachitons & `site:yonni-sealime-kiln` |
| `browsewood` | `dist/matronscoast-browsewood.html` | `356, 424` | `2.20 m` Browse-Line Snail Cathedral, cauliflorous Pearl-Plum (`nacretree`) fruit lures, opalescent Mucus Silver-Highways, gliding Matron's Tower-Snails & *Sister-Cup* sky-ponds (`site:yonni-spear-plinth`) |
| `kelpfront` | `dist/matronscoast-kelpfront.html` | `298, 476` | Southern Kelp-Grazing Front where giant snails & Megachitons rasp `Farside` `landkelp` down to scarred holdfast stubs (`site:yonni-wrack-watch`) |
| `cloudslope` | `dist/matronscoast-cloudslope.html` | `438, 386` (`+2,150 m`) | Upper `Cfb` cloud-rainforest, `6`-tread Shell-Cemented Tufa Cataract, furry Shag-Shell Mountain Snails & Painted Lantern-Snails (`site:yonni-pass-shrine`) |

## Build & Verify

```bash
python3 tools/textures/pack.py biomes/matronscoast
node biomes/matronscoast/tests/test-snail.js
python3 tools/build.py biomes/matronscoast
python3 tools/build.py biomes/matronscoast --station browsewood
python3 tools/build.py biomes/matronscoast --station kelpfront
python3 tools/build.py biomes/matronscoast --station cloudslope
python3 biomes/matronscoast/verify.py --assert --no-cache
```
