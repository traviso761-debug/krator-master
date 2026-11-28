# kits/dzagh-vardzi: Petty Gorge-Kingdoms of Dzagh-Vardzi (Vardzieti / Crookwash, K1-K7) — Plan

## Core adoption

Before writing any fragment (`README.md`, "CORE MODULES ARE NOT OPTIONAL"), `kits/dzagh-vardzi` adopts the shared `core/` and `kits/` modules directly in place:

| Module | Status | Reason / Usage |
|---|---|---|
| `core/engine` | **Taken** (read in place via `engine.py`) | Merged world-space geometry buckets (`30-geo.js`), PBR library materials (`27-mat.js`), `defBuilding`/`place` (`36-def.js`), operable doors & glazing (`36o-open.js`), walkable stairs (`36s-stair.js`), walk boxes (`37-wk-rec.js`), scene (`90-scene.js`), catalog furnish pass (`91f-furnish.js`), night halos (`91n-night.js`), clock/smoke (`93-anim.js`), host handover (`99-host-take.js`). Zero shadowed engine files. |
| `core/rand` | **Taken** (`08-core-rand.js`) | `KRAND` deterministic hashing and streams for variant/material selection, ground sculpting, and life records. Zero `Math.random` or `Math.sin` hashes in `src/`. |
| `core/tags` | **Taken** (`50/52/53-core-tags*.js`) | `KTAGS` registry for every placed building, resource node, flora placeholder, animal, and furniture piece (`culture: 'dzagh-vardzi'`). |
| `core/materials` | **Taken** (`core/materials/record` + `tools/textures/pack.py`) | `KMAT` records and packed WebP albedo/normal/roughness sets (`materials.json` -> `tex/`) for every building surface AND `f_*` triplanar detail maps for every furniture render family. |
| `core/catalog` & `core/furnish` | **Taken** (`furniture_bundle.py` + `KFURN`) | Master catalog sets (`generic`, `generic-goods`, `jobs`, `arms`, `scrap`) bundled alongside `kits/dzagh-vardzi`'s bespoke `dzagh-vardzi_furniture.js` (28 custom `FURN` definitions) in `KratorFurniture`. |
| `core/door` | **Taken** (`10-core-door.js`, `20-core-glass.js`, `90-core-door-host.js`) | Operable red-cypress & bronze/magnetite-banded doors (`KDOOR`, `KDOORHOST`, `E` key) and horn/amber lantern glazing (`KGLASS`). |
| `core/walk` | **Taken** (`20-core-walk.js`, `walk/box/24-core-walk-box.js`) | Walkable floor slabs, Dagestani roof-plaza terraces, exterior rock-cut steps, and covered chasm sky-bridges (`F` walker). |
| `core/atmos` & `core/atmos/placeholder` | **Taken** (`89-atmos-*.js`, `placeholder.py`) | Standard Krator skybox (`KratorSky`), `ATMOS.skylight` PBR environment reflections, and `#include <atmos_waves>` on the Crookwash chasm mountain torrent. |
| `core/host` & `core/clock` | **Taken** (`khost.SHELL + kengine.HOST`) | Orbit/WASD/walk camera, frame clock (`20-core-clock.js`), inspector, polygon tool, standard controls (`X` cut-away, `N` night, `E` door). |
| `core/drawn` | **Taken** (`10-core-drawn.js`) | `KDRAWN` registering the sculpted kit-sheet ground (flat catalog rows, `25 deg` terraced gorge ridge, Crookwash chasm & riverbanks). |
| `core/shader` | **Taken** (`core/shader/*.js`) | Shared GLSL helpers required by `core/atmos` and `core/materials`. |
| `kits/resources` | **Taken** (read in place: `42r-res-ore.js`, `44r-res-nodes.js`) | All 20 ore/mineral kinds in 3 grades; `dv-mine-gorge` resolves its nearest non-oil node within 400 m via `resSource`. |
| `kits/fauna` | **Taken** (`fauna_bundle.py`) | Mountain sheep, crag goats, chivalric cousin war-mounts, and yard hens placed in byres and folds with `SV_LIFE` schedules. |
| `core/biome` | Not taken | Building kit viewer page, not a biome showcase; placeholder apricot, red-cypress, barley, and madder flora are tagged `cls: 'flora'` defs per `README.md`. |
| `core/world` | Not taken | Standalone building kit sheet; open-world settlements in `Vardzieti` (`Crookwash`) will take `core/world` and bundle this kit. |
| `core/city` / `core/hamlet` / `core/camp` | Not taken | City and `core/hamlet` village builders consume `dvDims()` and `DV_TRADES` (`style: 'aul'` and `style: 'flume'`) when laying out valley seats and confluence hamlets; the kit sheet lays out inspection rows. |
| `core/simulation` / `core/sched` | Not taken | Life records carry faction, sub-faction, job, and 24-hour schedule data (`SV_LIFE`) ready for `SIM` in settlement builds. |
| `core/water` | Not taken | Viewer sheet renders its Crookwash chasm torrent via `core/atmos` `#include <atmos_waves>`, matching `kits/yonni` and `kits/islanders`. |
| `core/terrain` | Not taken | Kit sheet sculpts a clean analytic `25 deg` gorge slope and Crookwash river chasm registered in `KDRAWN`; map sites use `core/terrain`. |
| `core/ruins` | Not taken | Intact active living culture kit (`state: 'intact'`), no ruined debris structures. |
| `core/export` / `core/lod` / `core/minimap` | Not taken | Settlement/biome-level pipeline modules; kit exposes `tagExport()`, `doorExport()`, and `dvDims()` for downstream worlds. |

---

## 1. Culture, Polities & Setting (`Dzagh-Vardzi`, `Vardzieti` / `Crookwash`, `K1-K7`)

- **Culture key:** `dzagh-vardzi` (`Petty Gorge-Kingdoms of Dzagh-Vardzi`, *Dzagh-Vardzi* "Gorge-Wards").
- **Seven Valley-Kingdoms + Confluence Hamlet (`+950..+2,274 m`):**
  - `K1` `Khai-Geti` (*Khāi-Gēti*), `K2` `Red-Spairi` (*Rēd-Spāiri*), `K3` `Tin-Flitsi` (*Tīn-Flītsi*), `K4` `Airn-Dzaghi` (*Āirn-Dzāghi*), `K5` `Rozi-Vardzi` (*Rōzi-Vārdzi*), `K6` `Mist-Khopri` (*Mīst-Khōpri*), `K7` `Dzedi-Khrosi` (*Dzēdi-Khrōsi*), plus the neutral confluence trade-hamlet `Flumi-Bridzi` (*Flūmi-Brīdzi*), where **"every king (*Dzagh-Mep'e*) is lord in his own valley."**
- **Archaic Chivalric Ethos:** Sheltered behind sheer volcanic-tuff and columnar-basalt gorges, the *Dzagh-Vardzi* possess no artillery, siege engines, or mass pike drill. Tiny retinues of royal cousins clad in **300-year-old heirloom tin-bronze & magnetite scale hauberks, nephrite-bossed bucklers, and silver-chased broadswords** settle inter-valley boundary feuds by **1-v-1 or 3-v-3 champions' duels on covered chasm sky-bridges**, weighed out in sawn emerald nephrite-slab weregild (`jade = 200`) and *qvevri* apricot-brandy feasts.

## 2. Unified Architectural Synthesis (`DV2 + DV4 + DV3`)

1. **Polychrome *Ablaq* Masonry & Nephrite Inlays (`DV2` — Armenian/Georgian *Akhtamar* & *Vardzia*):**
   - Horizontal *ablaq* courses alternating warm **apricot-rose volcanic tuff (`tuff`, `tuffPolished`)** and **dark charcoal basalt (`basalt`, `colBasalt`)**.
   - Sawn **emerald-green nephrite (`jade`) cross-medallions**, chip-carved vine/rosette relief friezes (`carve`, `jadeInlay`), and **golden-skarn arched tympanums (`skarn`)**.
2. **Terraced Cliff-*Aul*, `5:1` Quartz Needle-Towers & 12-Pleat *Gumbat* Spires (`style: 'aul'`, `DV4 + DV2`):**
   - Stacked Dagestani stone roof-plaza dwellings (poor/middle/rich) whose flat slate-and-cypress lower roofs form sunny apricot-drying terraces for stepped-back upper tiers.
   - Clustered razor-slender **`5:1` battered defense needle-towers** (Ingush *vovnashki* / Svan *koshki*) crowned with **gleaming stepped snow-white quartz pyramidal roofs (`quartz`)**, projecting *mashikul* machicolation boxes, and **aerial ropeway pulley-baskets**.
   - Civic, sacred & royal halls crowned with **12-pleat fluted conical *Akhtamar* umbrella spires (*gumbat*)** in patinated verdigris copper (`Cu = 130`, `verdigris`) and dressed apricot-crimson tuff (`tuffPolished`).
3. **Specialized `core/hamlet` Flume-Forge & Chasm-Mill Mode (`style: 'flume'`, `DV3` + 40/44 Voth Census Trades):**
   - **Chasm-Straddling Flume-Forge Keep (`dv-flume-keep`)** astride a pointed chasm-arch shooting `30 m` red-cypress logs through a vaulted tunnel in the keep's belly.
   - **Stacked Triple Overshot Cliffside Waterwheel Stamp-Mill & Trip-Hammer Forge (`dv-flume-forge`)** with 3 animated rotating overshot waterwheels and verdigris copper spark-hoods; **Gravity Timber Log-Flume Trestle & Splash-Basin (`dv-flume-trestle`)**; **Nephrite Pendulum Wire-Saw Mill (`dv-sawmill-jade`)**; **Sheepskin "Golden-Fleece" Placer-Gold Sluice-Weir (`dv-sluice-fleece`)**; plus full foundry, armourer, *qvevri* winery/distillery, quarry, `kits/resources`-linked adit mine, market, granary, terrace orchard, and mountain byre.
4. **Zero-Podium Steep-Gorge Engineering:**
   - Zero boxy flat rectangular podiums; every building extends an open-bottomed battered `colBasalt`/`cobble` cliff root-skirt (`4.8-7.0 m` below `y = 0`) with rock-cut exterior steps, proven on both a **`25 deg` Terraced Gorge Slope Row** and the **`Crookwash` Chasm, Cascade & Log-Flume Showcase Row**.

## 3. Quality Gates (Non-Negotiable)

1. **Bespoke Furniture (`dzagh-vardzi_furniture.js`, 28 defs) & `all-surfaces-textured`:** 48 of 49 buildings are cut-away furnished (`4+` pieces each); every building, *ablaq* band, nephrite inlay, waterwheel, log-flume, terrain, fauna, and furniture mesh carries real packed library maps (`0` untextured meshes in `_api.textureAudit()`).
2. **Geometric Z-Fighting Audit (`z-fighting`):** `_api.zfightAudit({ tol: 0.0015, pen: 0.004 })` scans all world-space triangles across buildings, *ablaq* courses, nephrite medallions, *gumbat* spires, quartz roofs, bridges, waterwheels, doors, and placed furniture (`0` coplanar overlaps).
