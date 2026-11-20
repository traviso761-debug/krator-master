# kits/marr — File Index

| Path | Role |
|---|---|
| `PLAN.md` | Full architectural & urban masterplan, world-map siting (`px: 926, py: 1014`), ~20,000-soul demographic model, and 53-building manifest |
| `marr_blueprint.py` | Generates `blueprint/world_siting.png`, `blueprint/city_layout.png`, `blueprint/courtyard_types.png`, `blueprint/palace_G.png`, `blueprint/palace_U.png`, `blueprint/navigators_G.png`, and `blueprint/navigators_U.png` |
| `kit.json` | Build manifest consumed by `settlements/iziz/build.py --kit kits/marr` |
| `materials.json` | Library material bindings (`maCantera`, `maTile`, `maAzulejo`) |
| `build.py` | Runs `tools/check_port.py` and delegates to `settlements/iziz/build.py --kit` |
| `verify.py` | Headless verification wrapper (`settlements/iziz/verify.py`) |
| `src/69m-mar-mat.js` | `MPAL` palette, `MAT.ma*` materials, and `kdef('ma*', ...)` geometries (`[draw]`) |
| `src/69n-mar-helpers.js` | `ma*` architectural helpers & inhabited courtyard generators (`maPatioPleasure`, `maPatioVegetable`, `maPatioWorking`) (`[G data]`) |
| `src/70m-mar-patios.js` | 3 standalone inhabited courtyard defs (`mar_patio_pleasure`, `mar_patio_vegetable`, `mar_patio_working`, seeds `9801–9811`) |
| `src/70n-mar-poor.js` | 8 poor-tier dwellings for *De Xedaz* & *Qartar Lo* (seeds `9821–9856`) |
| `src/70o-mar-middle.js` | 9 middle-tier dwellings & barrio civic buildings for *Sidi Olda* (seeds `9866–9906`) |
| `src/70p-mar-rich.js` | 6 rich-tier mansions, Baroque palacios, and suburban *fincas* for *Qartar de Gardonz* (seeds `9916–9941`) |
| `src/71m-mar-trade.js` | 8 trade, smuggling, vice, and maritime industry defs (seeds `9951–9986`) |
| `src/72m-mar-civic.js` | 3 civic landmarks: `mar_navigators_guild`, `mar_sea_temple`, `mar_aduana` (seeds `10031–10051`) |
| `src/73m-mar-infra.js` | 5 canal, bridge, colonial *tapia* wall, and *Kastil de Mar* sea-fort defs (seeds `9996–10016`) |
| `src/74m-mar-palace.js` | `mar_governor_palace` (*Palasio de Gobernar*, seed `10021`) on the shared vassal palace blueprint |
| `src/75m-mar-trades.js` | `MAR_TRADES` Voth trade census mapping |
| `src/88ym-mar-matlib.js` | `MAR_MATLIB` material library binding |
| `targets/kit/89z-rows.js` | Kit sheet rows (`MAR_ROWS`) + mixed-street rows (`MAR_MIXED`) alongside `vern_*` |
| `targets/kit/91z-views.js` | Camera views for every row, mixed street, and individual building |
