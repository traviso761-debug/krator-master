# Marr (`Porta Marr`): Ring Sea Port & Canal-Quartered Sister City

**Marr** (`Porta Marr`, ~20,000 souls) is the foremost southern Ring Sea port of the Izani Empire (`Empar de Son`) and capital of `Provincia de Marr (Kosta de Marr & Islaz)`. Sited at the head of the sheltered `Cistal Estuary` where `Rrivar Cistal` and `Rrivar stara` meet the Ring Sea, the walled city forms a **steeper U-shaped enclosure** (`x ∈ [-374, +366] m`, `z ∈ [-254, +384] m` inside `Muraya de Marr`, with 4 extramuros fincas extending south to `z = +480 m`) around the harbour bight and 5 delta canals (`Knal Greta`, `Knal de Gardonz`, `Knal de Xedaz`, `Knal de Ismoglarz`, `Knal de Sauta`).

## Build & Verify

```bash
python3 settlements/marr/build.py
python3 settlements/marr/verify.py settlements/marr/dist/marr.html --assert
```

## Six Quarters & Steeper U-Shaped Urban Geometry

1. **I. `Poinda de Navigadarz` (NW Headland)**: Walled rocky headland (`z = -254..-114 m`) crowned by `Forta de Poinda & Tauar de Guach` (`mar_castillo_bastion`), `Gilda de Navigadarz` (`mar_navigators_guild`), and `Gardon de Pilotaz`.
2. **II. `Porta & Dokaz` (Harbour Bight & Breakwater Mole)**: Sheltered by `Mol de Porta` and `Bigon de Mol` (`vern_harbour_light`), lined with 6 stone quays (`vern_quay`), 7 piers (`Kostgarda Pier`, `Piar de Kostomz`, `Islipa de Feri`, `Guarfa de Kren`, `Piar de Marchondaz`, `Landiñ de Fix`, `Piar de Rropa`), `Om de Kostomz` (`mar_aduana`), and the 140 m `Rropaguoka` (`vern_ropewalk`).
3. **III. Inner 3 Delta Islands (Chaotic Jittered Grid via `37-city-grid.js`)**:
   - **`Isla de Sidi Olda` (`3×7` cells, `z ∈ [-94, +296] m`)**: Carries the monumental civic axis (`Templa de Son & Si`, `Isqer Greta`, `Palas de Govarnar`, `Qartar de Garizon`) alongside merchant/chancery cuadras (`Korta de Viejaz` .. `Gueraus de Sauta`).
   - **`Isla de Marchondaz` (`3×3` cells, `z ∈ [-92, -6] m`)**: Guild factorias, `Markita de Porta`, and harbour warehouses.
   - **`Isla de Kanal` (`3×6` cells, `z ∈ [+20, +296] m`)**: Cooperages, rum bodegas, silk/spice factorias, and `Gardon de Kanal`.
4. **IV. `De Xedaz` (Right Bank Planned Turning Grid, `3×4` Cuadras, `z ∈ [-165, +264] m`)**: Tenements, corrala courts, `Markita de Xedaz`, and `Om de Landarnaz` (`mar_lantern_house`).
5. **V. `Qartar de Gardonz` (Left Bank Planned Turning Grid, `3×4` Blocks = 48 Mansion Estates, `z ∈ [-92, +264] m`)**: Walled villas and palaces with centered tiled pool courtyards (`mar_patio_pleasure`) flanking the tree-lined `Paseo de Gardonz`.
6. **VI. `Qartar Lo` & Extramuros Fincas (`z ∈ [+268, +480] m`)**: Creole cottages (`Kotijz de Guesta`, `Kotijz de Sauta`, `Kotijz de Delta`, `Kotijz de Marxa`), `Gardon de Guesta`, `Markita de Marxa`, the southern curtain wall (`Muraya de Tera` at `z = +384 m` with `Porta de Gardonz`, `Arka de Agua & Porta de Iziz`, and `Porta de Xedaz`), and 4 extramuros citrus/cane/indigo fincas (`z = +408..+480 m`).
