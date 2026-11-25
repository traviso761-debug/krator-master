# Mirabilis (*Mirapiris* / *Sutar-Kotan*) — Circuit E6 Escarpment Prefecture

Scale Model 5.1 pin `spwjwosq9c` / `s9h1fb5qsc` at **`px [350, 726]`** (`+3,124.9 m` ASL, `1.08 atm`, `12.0 °C`, `627 mm/yr` `Csa`), built as the flagship `1:1` settlement showcase for **`kits/hayrant`** (`47` standalone `hy_*` pieces, `41/41` inland Voth-census trades) alongside suzerain **`kits/eternian`** peers (`38` `et_*` pieces) on `KRATOR_KITS` + `KCITY.multikit` (`core/city/42-city-multikit.js`).

## Highlights

- **Scale-Model Canyon & Escarpment Geomorphology (`40-mb-ground.js`):**
  - **Pepar-Yuan South Tableland (`W1`, `W3`, `+3,125..+3,144 m`)** perched `202.5 m` above the incised box canyon of **`r227` (`Yūt-Mā`, *"Moon-Bridge River"*, `14.3 m³/s` at `+2,922.4 m`)**, breaking east over a **`218 m` Fulcrum Escarpment cliff (`W6`)**.
  - **Sunny `40° S` North-Facing Loess Cliff-Benches (`W4`):** Three contoured shelves (`+3,094`, `+3,060`, `+3,026 m`) of `hy_loess_yaodong` and `hy_mushroom_drift` backed by `KCARVE` vaulted loess collars above dark grey-violet Outer Wall `megabreccia`.
  - **`KGROUND` `DataTexture2DArray` (`array: true`) + Triplanar Cliffs:** Blends `loess`, `megabreccia`, `paving`, and `turf` in a single `sampler2DArray` unit (`<= 8` active fragment samplers total).
- **The Monumental *Yūt* ("Moon-Bridge"):** A `164.5 m`-high, `106 m`-long ashlar-and-basalt viaduct (`52 m` parabolic main arch crowned with a carved emerald-nephrite keystone) linking the South *Yuan* citadel to the North *Yuan* agricultural terraces (`H1`).
- **Multi-Kit Zoning & Rural Ring (`42-mb-city.js`):**
  - `580` zero-overlap lots (`77.2%` Hayrant / `22.8%` Eternian) across `6` urban wards (`W1`–`W6`), `2` `KHAMLET.village` settlements (`H1` *Madder-Terrace* farming + `H2` *Breccia-Adit* mining bound via `resSource` to `iron`/`gold`/`silver`/`tin`/`saltpeter` nodes), `5` active `KCONS` + `KCITY.constructMesh` rising lots in `W6`, and `C1` *Ukor-Tera Whale-Clan Caravan Halt* (`KCAMP.halt` + `kits/tents`) outside `hy_pass_gate`.
  - Enforces the `<= 0.50 m` cornice-alignment law across `10` paired `et_*` / `hy_*` blocks on `W1`'s Suzerain Avenues (`maxDelta = 0.39 m`).
- **Live Hydraulics, Kinematics & Flora (`41-mb-hydraulics.js`, `90z-mb-world.js`):**
  - `3` `WATER.flow` channels (`Yūt-Mā` upper/lower + `W5` mill-leat), `2` `WATER.fall` cascades (Moon-Bridge `8.5 m` step & `Siru-Spring` `36.8 m` veil), and `4` `WATER.still` mineral/stepwell basins.
  - Counterbalanced `hy_escarpment_hoist` cliff-cars (`218 m` vertical travel), rotating overshot waterwheels, overhead porcelain-insulator telegraph catenary line, `biomes/wouterwall` native flora (`WOW.dustTowers`, `fur-larch`, `puya` spikes) + `CROPS` terraces (`WOW.buildCrops`), and walking citizens.

## Build & Verify

```bash
python3 tools/build.py settlements/mirabilis
node settlements/mirabilis/tests/test-mirabilis.js
python3 settlements/mirabilis/verify.py settlements/mirabilis/dist/mirabilis.html --assert --cut --night
```
