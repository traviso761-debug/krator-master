# `kits/hayrant` — The Hayrant Vassal Kit of the Western Outer Wall (`350,726`, `384,666` & `124,710`)

Standalone vassal building, highland infrastructure, mixed suzerain-vassal street, and bespoke furniture kit (`culture: 'hayrant'`, `faction: 'The Eternal State'`) on `core/engine` (`engine.py`), `core/atmos`, `core/drawn`, `core/materials`, `core/tags`, `core/furnish`, `core/door`, `core/walk`, `core/water`, reading `kits/eternian` (suzerain head generator, Deco-Gothic roof/lancet helpers, and Mixed Street `et_*` peers) and `kits/resources` in place, and sealed as `HYK` via `kit_bundle.py`.

## Three-Way Cultural & Architectural Synthesis

The **`Hayrant`** ("Highlanders", Ainu-shifted vassals of **Circuit E6** on `biomes/wouterwall` — **Mirabilis** `350,726` at `+3,125 m` and **Sheritu** `384,666` at `+3,598 m`) are the inland highland sister-branch of the maritime **`Hueru-Kuran`** ("Whale Clans", `kits/hueru-kuran`) across the `124,710` **Ukor-Tera Divide Pass**. Their architecture stratifies three traditions across wealth and civic rank:

1. **Bench Vernacular (`style: 'bench'` — Poor & Rural Outer Wall):**
   - **Horizontal Western Outer Wall Loess-Bank *Yaodong* Vaults** (`hy_loess_yaodong`, `hy_scarp_cellar_poor`, `hy_terrace_farmstead`, `hy_mushroom_drift`) — cliff-bank frontispieces in golden-buff loess and impact `megabreccia` (never open-sky sunken square *dikengyuan* pits like `kits/molu-che`).
   - **Steamed `Fur-Larch` & Century-`Puya` Cruck-Rib *Chise* Lodges** (`hy_larch_chise_poor`, `hy_fell_fold`) — translating coastal Hueru-Kuran pelagic whale-ribs into steep parabolic highland timber-and-puya crucks under birch-tar, bark, and alpine turf domes, cord-marked Jōmon *kaen-doki* smoke-pots, braided bench-garlic & cave-date jujube eaves, cave-madder Hayrant plaid (`CROPS.canPlaid('wouterwall')`), and mandatory closed-eye lead/terracotta door masks.
2. **Hybrid Vassal Town (`style: 'hybrid'` — Middle Dwellings, Trades & Sister-Clan Legation):**
   - Battered Sardinian/Kuran cyclopean & columnar basalt ground storeys and **sawn Crookshore emerald-nephrite trapezoid lintels** paired with Eternian white-limewashed Deco upper storeys, stepped window heads, doorway oculi, **celadon-glazed *kaen-doki* chimney crowns**, and bilingual Eternian logograph + Hayrant katakana-coda sound-mark signboards (`hy_bench_house_mid`, `hy_nuraghe_chise_mid`, `hy_courtyard_loess_mid`, `hy_corner_turret_mid`).
   - **Prized Cross-Pass Sister-Clan Heirlooms (`124,710` Ukor-Tera pass):** Bleached **Leviathan whale-jawbone arches** and **3-ton Crookshore emerald-nephrite lintels** reserved exclusively for `hy_kuran_legation` (twin of `hk_embassy_hayrant`), `hy_clan_lord_compound`, and the outer *Utari* clan council *chise* of `hy_prefect_seat`.
3. **Prefectural & Sanctuary (`style: 'prefect'` / `'sanctuary'` — Rich, State & Sacred):**
   - **"Organ-Pipe *Nuraghi*"** (`hy_prefect_seat`, `hy_clock_observatory`, `hy_merchant_tower_rich`, `hy_assay_registry`, `hy_withdrawn_sanctuary`) — concave-battered basalt *nuraghe* bastions and *mensoloni* stone corbels crowned with stepped pale-brick Deco-Gothic pier bundles, steep snow-shedding `celadon` hex-hips, dual **veined alabaster + translucent emerald-nephrite** lancet bundles, and ranked closed-eye/veiled gold, silver, bronze, and gunmetal ancestor statuary (`kits/eternian/src/42-et-head.js`).
   - ***Santa Cristina* Highland Spring & Seismic Chime Step-Well (`hy_spring_stepwell`, `core/water`):** Sunken inverted-keyhole ashlar stair descending to a live `WATER.still` loess-foot spring mirror pool hung with tuned Crookshore emerald-nephrite & Eternian bronze chimes that ring out before rockfalls and sturzstroms.
   - **Mirabilis Mixed Eternian-Hayrant Vassal Street (`hy_mixed_street`):** Places all 6 read-in-place `et_*` residential peers alongside 7 `hy_*` peers across poor, middle, and rich tiers with `0` footprint overlaps and `<= 0.50 m` cornice alignment (`VASSAL-KITS.md`).

## Build, Test & Verify

```bash
# Pack library textures (from materials.json -> tex/)
/usr/bin/python3 tools/textures/pack.py kits/hayrant

# Run pure-data, architectural math & HYK bundle unit tests
node kits/hayrant/tests/test-hayrant.js

# Check Voth 44-trade census table (41 carried, 0 gaps, 3 explicit na)
python3 tools/check_trades.py kits/hayrant

# Build dist/hayrant.html (+ sidecar hayrant.tex.js & build-inputs.json)
python3 tools/build.py kits/hayrant

# Headless Chromium verification (--assert runs all 22 bespoke + SURVEY checks)
KRATOR_GL=gpu python3 kits/hayrant/verify.py kits/hayrant/dist/hayrant.html --assert --cut --night
```
