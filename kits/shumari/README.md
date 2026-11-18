# Shumari Building Kit (`kits/shumari`)

Architectural kit for the **Kingdom of Shumar** (`culture: 'shumari'`) on the `1.06 atm` dry western plateau of *Subaru-yama* (see [PLAN.md](file:///home/antigravity/traviso761-debug/krator-master/kits/shumari/PLAN.md)).

## Visual Grammar & Reference Plates

Shumari architecture fuses **Cairene Mamluk funerary and civic stonework** with **highland basalt engineering** and **Free Giant dual-scale ergonomics** across **59 `defBuilding` definitions** (60 placements across 9 caste/role rows) and an in-place **Station 4 (`shumar`) highland flora band** (`biomes/shighlands`):

- **[01-mamluk-carved-dome-ablaq.png](file:///home/antigravity/traviso761-debug/krator-master/kits/shumari/refs/01-mamluk-carved-dome-ablaq.png)** — High-shouldered pointed stone dome carved in geometric star-and-lozenge relief over an epigraphic collar, 12-window arched drum clerestory, stepped corner *muqarnas* ("Turkish triangles"), `1-over-2` bullseye *qamariyya* roundels, and horizontal *ablaq* masonry (`sm_regiment_qubba` `v=1`, `sm_hall_of_blades`, `sm_diwan_hall`, `sm_rim_pavilion`).
- **[02-mamluk-spiral-dome-minaret.png](file:///home/antigravity/traviso761-debug/krator-master/kits/shumari/refs/02-mamluk-spiral-dome-minaret.png)** — Bold 3D convex torsion ribs/gadroons winding up a pointed Mamluk dome (`hand = +1` on living regimental monuments; mirror-handed `hand = -1` on `sm_doriyan_stele` memorials for lost *Dōriyan*), polygonal *muqarnas* watch-minaret (`sm_payaru_tower`), and 3-sphere bronze *jamur* finials.
- **[03-mamluk-pishtaq-twin-domes.png](file:///home/antigravity/traviso761-debug/krator-master/kits/shumari/refs/03-mamluk-pishtaq-twin-domes.png)** — Symmetric twin-domed Mamluk *waqf* sanctuary (`sm_hall_of_blades`), monumental recessed *pishtaq* portals with `Sumaru-kattu` (`frieze_kattu`) lintels, and `4.4 m`-tall crimson-lacquered bronze-strapped `KDOOR` leaves for `3.6 m` Free Giants (`smPishtaq`).

## Build, Test & Headless Verification

```bash
# 1. Offline Node unit tests (59 defs, unique seeds, dome handedness, Giant clearances, SM_TRADES)
node kits/shumari/tests/test-sm-kit.js

# 2. Voth census trade check (44/44 rows, 0 gaps)
python3 tools/check_trades.py kits/shumari

# 3. Build dist/shumari.html + dist/shumari.tex.js + build-inputs.json
python3 tools/build.py kits/shumari

# 4. Static lints (port, core use, assembly, source, budgets)
python3 tools/check_port.py kits/shumari && python3 tools/check_core_use.py kits/shumari && python3 tools/check_assembly.py kits/shumari && python3 tools/check_source.py kits/shumari && python3 tools/check_budgets.py kits/shumari

# 5. Headless Chromium + SwiftShader verification (default sheet + ?interiors=1 room plans)
PW_CHROMIUM=/usr/bin/chromium /home/antigravity/.venv/bin/python kits/shumari/verify.py --assert --no-cache
PW_CHROMIUM=/usr/bin/chromium /home/antigravity/.venv/bin/python kits/shumari/verify.py --query interiors=1 --views Overview --assert --no-cache
PW_CHROMIUM=/usr/bin/chromium /home/antigravity/.venv/bin/python kits/interiors/verify.py kits/interiors/dist/interiors-sets.html --sets --assert --seeds 2 --query set=shumari --no-cache

# 6. Godot core/export tile bake (terrain, compacted buckets, standard materials -> world.json + world.glb)
PW_CHROMIUM=/usr/bin/chromium /home/antigravity/.venv/bin/python tools/harness.py export kits/shumari/dist/shumari.html --out /tmp/sm_export --box=-90,-180,90,20 --sections registry,buckets,materials,terrain
```

## Furniture, Interiors, Host Bundle & Delta Loop (Phases SM5–SM6)

- **Catalog furniture (`kits/catalog/krator-master-furniture-shumari.js`):** 28 `'shumari'` pieces (30 variant instances) across Cadet (`-na`), Sword (`-šu`), Free Giant (`Gēdu-šu` `2.90 m` divan & `3.20 m` feasting board), regimental cult (`shumari_ancestor_niche`, `shumari_standard_rack`, `shumari_ash_cenotaph`, `shumari_qubba_lamp`), and `Ṣūnu-šikaru` distillery (`shumari_copper_alembic`, `shumari_spirit_flask_rack`).
- **Room plans (`kits/interiors/sets/shumari.js`):** 49 furnished buildings (57 planned bodies, 110 rooms, 10 open/solid skips). Toggle live on `dist/shumari.html` with `?interiors=1` (or `U` outline / `X` roof cut-away).
- **Hamlet row (`core/hamlet/shumari/25-hamlet-shumari.js`):** Opt-in `KHAMLET.shumariRow` mapping all 7 hamlet kinds (`farming`, `fishing`, `ranching`, `mining`, `lumber`, `salt`, `waystation`) to Shumari defs (`node core/hamlet/test-hamlet-shumari-row.js`).
- **Host bundle (`shumari.py` + `kit_bundle.py`):** Seals `core/engine`, `kits/shumari/src`, and `kits/resources/src` into `SMK` (`SMK.proto(key, v)`, `SMK.dims()`, `SMK.SM_TRADES`) for `openworld/shumar-north`, `openworld/shumar-south`, and `settlements/shumar`.
- **Visual delta audit ([DELTA.md](file:///home/antigravity/traviso761-debug/krator-master/kits/shumari/DELTA.md)):** Round 1 `VISUAL-BAR.md` §5 delta loop against `refs/01..03` and §7 12-row rubric; pass `?sm6=0` on the sheet URL to ablate the SM6 geometry and material pass from identical camera poses.

## Key Sheet Views (`src/92s-sm-views.js`)

- `Overview` — Full 59-def, 9-row Shumari architectural sheet + northern highland flora band
- `Gorge street under the qubba` — Eye-level view up `sm_gorge_street`'s stepped *ishigaki* canyon lane past the street-corner bronze *sabil* and crimson *mashrabiya* toward the Giant *pishtaq* and `+1` spiral *qubba*
- `Domes of the Subaru-su` — Elevated skyline across `sm_hall_of_blades` (twin carved domes), `sm_regiment_qubba`, and `sm_sabil_shrine`
- `Spiral qubba and pishtaq` / `Carved qubba dome` / `Inside the regiment qubba` / `Doriyan mirror canopy`
- `Sword captain bayt compound` — Mamluk courtyard *bayt* with `+1` spiral blade-shrine dome and compound Giant+human stair
- `Diwan hall and kattu chancery` — State halls with `frieze_kattu` archival lintels
- `Citadel and Payaru minaret` — `sm_citadel_keep`, `sm_pishtaq_gate`, and polygonal `sm_payaru_tower`
- `Copper stills and lake jetty` — `sm_spirits_still` twin copper-dome alembics and `sm_lake_jetty` *Ṣīru-Yāmu* basalt slipway
- `Shumar highland flora` — In-place `biomes/shighlands` Station 4 (`shumar`) strip (`ropepine`, `coiljuniper`, `helixpoplar`, `whorlapricot`, `spiralsage`, `ichu`)
