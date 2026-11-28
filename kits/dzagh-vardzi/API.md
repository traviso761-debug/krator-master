# kits/dzagh-vardzi: API

Units, coordinate frames, `defBuilding`, `place()`, `FURNISH`, doors (`KDOOR`), walk (`KWALK`), and probe methods follow `core/engine` (`core/engine/README.md`).

- **Culture:** `KIT.culture = 'dzagh-vardzi'` (`Petty Gorge-Kingdoms of Dzagh-Vardzi`), life faction `'Petty Gorge-Kingdoms of Dzagh-Vardzi'`.
- **Polities (`DV_KINGDOMS`):** `K1` (`Khai-Geti`), `K2` (`Red-Spairi`), `K3` (`Tin-Flitsi`), `K4` (`Airn-Dzaghi`), `K5` (`Rozi-Vardzi`), `K6` (`Mist-Khopri`), `K7` (`Dzedi-Khrosi`), `H0` (`Flumi-Bridzi`).
- **Modes (`tags.style`, 52 buildings total):**
  - `'aul'`: Terraced Cliff-*Aul* dwellings, `5:1` dark-slate & crimson-tuff *koshki* needle-towers, 12-pleat *Akhtamar* *gumbat* courts, Hall of Seven Strings (`dv-hall-troubadour`), Century-Buried *Mep'e-Qvevri* Elixir Cellar (`dv-vault-mepe-qvevri`), and chasm sky-bridges (`26` buildings).
  - `'flume'`: Specialized `core/hamlet` Flume-Forge, Chasm-Wind Pipe-Organ Raid-Beacon (`dv-organ-beacon`), & Chasm-Mill industrial works, mines, quarries, market, and terrace farms (`26` buildings).
- **Local frame:** metres; `+x` east, `+y` up, `+z` front (south).

## Fragments

| Fragment | Prefix | Role |
|---|---|---|
| `00-head.html` | | Page shell, `#errs` panel, Three.js r128 loader |
| `26k-kit.js` | | `[G data]` `KIT`, `DV_KINGDOMS`, `DV_SUB`, `SV_LIB`, `SV_TILE0`, `SV_CLOTH`, `SV_CUT`, `SVPAL`, `P(k)` |
| `27v-dv-vstack.js` | | `[G shader]` Triplanar & vertical-variation PBR shader hooks |
| `28-dv-matfix.js` | | Upgrades `MAT.plain`, `MAT.brass`, `MAT.bone`, `MAT.flag` to packed library maps |
| `31-alt-takes.js` | | `[G data]` `MAT_VAR` variant material tables (`tuff`, `cobble`, `slate`, `planks`) |
| `36p-dv-openfix.js` | | Upgrades `MAT.room` and `svHwMat()` door hardware to packed library maps |
| `dzagh-vardzi_furniture.js` | | Bespoke `FURN_CULTURE('dzagh-vardzi', ...)` + 31 zero-z-fighting `dv_*` `FURN` defs (`< 30 KB`) bundled into `KratorFurniture` |
| `40-dv-kit.js` | `dv` | `dvRootSkirt`, `dvFloorRect`, `dvExtStair`, `dvJadeCross`, `dvSkarnArch`, `dvWallPanel`, `dvAblaqBox`, `dvRoofTerrace`, `dvMashikul`, `dvPulleyRig` |
| `41-dv-roof.js` | `dv` | `dvSlatePyramid`, `dvSlateCrowns()`, `dvNeedleTower`, `dvGumbat`, `dvGableRoof`, `dvLampBracket`, `dvBanner` |
| `42-dv-flume.js` | `dv` | `dvFurn`, `dvFurnRoom`, `dvSpinner`, `dvWaterwheel`, `dvCypressLog`, `dvLogFlumeSeg`, `dvSparkHood`, `dvCropTerrace`, `dvAdit`, `dvOreHeap`, `dvOreLinks()` |
| `42r-res-ore.js`, `44r-res-nodes.js` | `res` | Read in place from `kits/resources`: 20 ore kinds x 3 grades and `resSource` |
| `54-dv-aul.js` | `dva` | 9 Terraced Cliff-*Aul* & `5:1` Dark-Slate Needle-Tower dwellings (`3` poor, `3` middle, `3` rich) |
| `55-sa-beasts.js` | `sa` | Fauna defs (`dvb-sheep`, `dvb-goat`, `dvb-horse`, `dvb-hen`) with `SV_LIFE` schedules |
| `56-dv-civic.js` | `dvc` | 15 Civic, Sacred, Royal & Gorge-Defence buildings (`dv-citadel-mepe`, `dv-sanctuary-gumbat`, `dv-hall-weregild`, `dv-bridge-duel`, `dv-gate-flume`, etc.) |
| `56b-dv-wonders.js` | `dvw` | 3 Player-Magnet Wonders (`dv-hall-troubadour`, `dv-vault-mepe-qvevri`, `dv-organ-beacon`; `LORE.md` §6.26) |
| `58-dv-flumeworks.js` | `dvf` | 12 Flume-Forge & Chasm-Mill industrial works (`dv-flume-keep`, `dv-flume-forge`, `dv-flume-trestle`, `dv-sawmill-jade`, `dv-sluice-fleece`, `dv-winery-qvevri`, etc.) |
| `60-dv-hamlet.js` | `dvh` | 13 Confluence Hamlet trades, kilns, quarry, `kits/resources` mine, market, granary, terrace orchard & byre |
| `66-dv-flora.js` | `dvb` | 4 Placeholder Vardzieti gorge flora defs (`cls: 'flora'`) |
| `68-dv-census.js` | `dv` | `[G data]` `DV_TRADES` (40/44 Voth census trades) and `dvDims()` (`core/city` & `core/hamlet` footprint export) |
| `89-rows.js` | | `[G data]` `FAMILIES` layout rows (`hillside`, `chasm`) for `dist/dzagh-vardzi.html` |
| `89v-dv-village-head.js` | | `[G data]` `TITLE` and `FAMILIES` header for `--village` (`dist/dzagh-vardzi-village.html`) |
| `90y-dv-terrain.js` | | Sculpts `25 deg` terraced gorge slope, Crookwash river chasm, lateral arch clefts & `#include <atmos_waves>` mountain torrent |
| `90z-dv-village.js` | | `--village` `Flumi-Bridzi` terraced gorge confluence hamlet (15 DV buildings incl. `dv-hall-troubadour` & `dv-organ-beacon`, monotonic 10-segment 89.1 m V-flume, headpond, overshot waterwheel splitters, 5 live sliding cypress logs, boom-pond & 6 preset views) |
| `91f2-dv-texguard.js` | | Flushes `DV_SPINNERS`, resets shell/crown counters, guarantees 100% `f_*` furniture detail maps, registers `KDRAWN` ground |
| `99-ms-audit.js` | | Installs `_api.textureAudit()`, `_api.doorsAudit()`, `_api.windingAudit()`, `_api.zfightAudit(o)`, and `_api.retconAndHooksAudit(o)` onto `window._api` |

## Probe Extensions (`window._api`)

- `_api.textureAudit()` -> `{ total, textured, buildingMeshes, furnitureMeshes, faunaMeshes, exemptCount, untextured }`
- `_api.doorsAudit()` -> `{ doors, locked, bad, spinners }`
- `_api.windingAudit()` -> `{ ok, totalCheckedTris, negDet, vnMismatch, waterGlassMisuse, flumeWaterOk, probes, counts, shellBad }`
- `_api.zfightAudit({ tol = 0.0015, pen = 0.004 })` -> `{ totalTris, tolMm, overlaps, pairs }`
- `_api.retconAndHooksAudit({ village = false, zf })` -> `{ quartzOk, hooksOk, quartzMeshes, slateCrowns, crownMatMeshes, hooks, bespokeCounts, problems }`
- `DV_FLUME_VILLAGE.audit()` (`--village`) -> `{ ok, segments, totalLenM, yStart, yEnd, minDeg, maxDeg, maxGapMm, uphill, animLogs, spinners, detail }`
- `dvDims()` -> `{ [key]: { cls, w, d, h, style, wealth, types, role, job, cut, chasm } }`
- `dvOreLinks()` -> `{ nodes, mines }`
