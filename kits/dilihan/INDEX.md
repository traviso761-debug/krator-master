# `kits/dilihan` — Fragment Index

| Path | Role | Contents |
|---|---|---|
| `dilihan.py` | Kit loader | `BASE`, `BUILDINGS`, `TRADES`, `FILES`, `JIMJAM_MAT_ALIAS`, `paths()`, `full_paths()` |
| `build.py` | Sheet build | Builds `dist/dilihan.html` + `dist/dilihan.tex.dilihan.js` via `kits/iziz-vernacular/sheet.py` |
| `verify.py` | Headless check | Runs `sheet_verify.py` + `DL_TRADES` census + 28/28 `dil_*` + Mixed Street overlap asserts |
| `materials.json` | PBR adapter | Maps `dlBrick*`, `dlLaterite`, `dlMortar`, `dlTile` + Vernacular sets from `jimjam/tex` & `iziz-vernacular/tex` |
| `src/69r-dil-mat.js` | `[draw]` | `DL_PAL`, deterministic kiln-brick/mortar/tile procedural fallbacks, world-UV `MAT.dl*`, `dl*` kit items |
| `src/69s-dil-helpers.js` | `[draw]` | `dlnPlinth`, `dlnBrickWing`, `dlnRingBox`, `dlnCornice`, `dlnOpenWin`, `dlnJali`, `dlnArcade`, `dlnCourtyard`, `dlnImpluvium`, `dlnShadeSail`, `dlnPergola`, `dlnMonitorRoof`, `dlnWindCatcher`, `dlnZeerCluster`, `dlnSunOrb` |
| `src/70d-dil-dwell.js` | `[draw]` | 7 dwellings (`dil_house_poor_dogtrot` .. `dil_manor_breezeway`, seeds `9801..9849`) |
| `src/71d-dil-trade.js` | `[draw]` | 12 markets, inns & monsoon workshops (`dil_shop_arcade` .. `dil_carpenter_yard`, seeds `9857..9945`) |
| `src/72d-dil-civic.js` | `[draw]` | 9 civic, cooling-bath, garrison, shrine & modular 12m fortification pieces (`dil_cooling_baths` .. `dil_wall_gate`, seeds `9953..9995`) |
| `src/73d-dil-trades.js` | `[G data]` | `DL_TRADES` (44 Voth census trades) + `dlTradesAudit()` |
| `targets/sheet/88y-dlsheet-matlib.js` | `[web]` | `KMAT.bindMat('dilihan', MAT)` + `KMAT.adapter('dilihan', ...)` |
| `targets/sheet/89z-rows.js` | `[G data]` | `SHEET` rows (`Dwellings`, `Markets and Monsoon Workshops`, `Civic, Garrison and Fortifications`, `Mixed Street`) |
| `targets/sheet/91t-dlsheet-tags.js` | `[G data]` | Registers `REG` + `IZFIX` children into `KTAGS.page` |
