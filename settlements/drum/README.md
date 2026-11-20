# Drum (*Drïm* / *Vinvolk*) — `settlements/drum`

Vothic vassal arcology settlement around the partly ruined **Drum Arcology** (`kits/ancients/src/8af-drum.js`).

## Summary

- **Population:** `13,500` citizens — `5,400` (`40%`) across inhabited Levels 1–15 of the Drum Arcology (including 70 SIM trade/storage vaults and the ENE battle-scar collapse quarry) and `8,100` (`60%`) across radial concentric ring quarters (`sw-arcology`, `voth-scrap`, `post-apoc`).
- **Governance & Landmarks:** Direct military rule under a Vothic Military Governor seated in the Garrison Fortress (`Praetorium`), flanked by the Ordinator Fortress & Parabolic Sun Chapel, *The Cauldron* post-apoc gladiatorial arena, and the Regional Scrap-Market & Assay Rotunda.
- **Defences:** Restored Ancient Inner Wall (`W1`, `r = 402 m`, 6 Voth-patched gates) and Outer Ruined-Vehicle Palisade (`W2`, `r = 636 m`, 5 gates, buttressed by 118 ruined Ancient's Valley vehicles from `kits/motor-vehicles`).
- **Core Adoption:** `core/rand`, `core/tags`, `core/door`, `core/walk`, `core/furnish`, `core/city`, `core/simulation`, `core/atmos`, `core/minimap` (7-band deck minimap + 12-station vertical schematic), `core/host`, `core/export`, `core/biome` + `biomes/swbay`.

## Build & Verify

```bash
python3 tools/build.py settlements/drum
node settlements/drum/tests/test-drum.js
python3 settlements/drum/verify.py settlements/drum/dist/drum.html --assert
```
