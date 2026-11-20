# Torus (*Tors* / *Rinkvolk*) — `settlements/torus`

Self-governing Vothic vassal arcology & stepped-terrace agricultural settlement around the **Forest Ring** arcology (`kits/ancients/src/71c-ring.js`).

## Summary

- **Population:** `8,500` citizens — `2,550` (`30%`) top-heavy inside the Forest Ring (`1,250` on the `WY = 300 m` Outer Wheel, `600` in the `+664 m` Crown, `150` mid-barrel transit keepers, `550` in the Foot) and `5,950` (`70%`) across 10 stepped agricultural terraces (`T1 +44 m -> T10 +1 m`, `r = 296..1,120 m`) and the `100% voth-scrap` SE Extension.
- **Hanging Fruitvines & Ag-Domes:** 44 `sky-fruitvine` curtains (`kits/crops`) trailing off both inner and outer rims of the `WY = 300 m` Wheel (*Ruby-Tart* & *Golden-Sun*), harvested by tethered winch gondolas for the Great Cider-Press; 8 surviving Tenders' Ag-Domes (medical plants, tea, cacao, highland spice, out-of-zone crops, and the Ordinator-watched *Amber-Sap* dome) plus 4 welded `KHAZ` Quarantined Feral Ag-Domes.
- **Governance & Hinterlands:** Elected Chairman & Board (`Board Hall`), SE Scrap Voth Extension (Vothic Emissary Compound & Ordinator Palace), 6 km `kits/metropolis` Soleri farm hinterlands (2/3 ruined, 1/3 working farms & orchards), and decayed `kits/ancient-transit` viaducts/monorails.
- **Core Adoption:** `core/rand`, `core/tags`, `core/door`, `core/walk`, `core/hazard`, `core/furnish`, `core/city`, `core/simulation`, `core/atmos`, `core/minimap` (8-band multi-altitude deck minimap + 13-station vertical/hinterland schematic), `core/host`, `core/export` (with `hazards`), `core/biome` + `biomes/swbay`, `kits/crops`.

## Build & Verify

```bash
python3 tools/build.py settlements/torus
node settlements/torus/tests/test-torus.js
python3 settlements/torus/verify.py settlements/torus/dist/torus.html --assert
```
