# `kits/hayrant` — The Hayrant Vassal Kit of the Western Outer Wall (`350,726`, `384,666` & `124,710`)

Standalone vassal building, highland infrastructure, mixed suzerain-vassal street, and bespoke furniture kit (`culture: 'hayrant'`, `faction: 'The Eternal State'`) on `core/engine` (`engine.py`), `core/atmos`, `core/drawn`, `core/materials`, `core/tags`, `core/furnish`, `core/door`, `core/walk`, `core/water`, reading `kits/eternian` (suzerain head generator, Deco-Gothic roof/lancet helpers, and Mixed Street `et_*` peers) and `kits/resources` in place, and sealed as `HYK` via `kit_bundle.py`.

## Three-Way Cultural & Architectural Synthesis

The **`Hayrant`** ("Highlanders", Ainu-shifted vassals of **Circuit E6** on `biomes/wouterwall` — **Mirabilis** `350,726` at `+3,125 m` and **Sheritu** `384,666` at `+3,598 m`) are the conquered eastern branch of the three-part **`Utari-Kuran`** cultural and linguistic complex ([LORE.md](../../LORE.md) §6.25), descended from the destroyed arcology **`Kanopi`** (*Canopy*) in the **Veiled Mountains** alongside the maritime **`Hueru-Kuran`** ("Whale Clans", `kits/hueru-kuran`) on `Crookshore` across the `124,710` **Ukor-Tera Divide Pass** and the unconquered, raiding **`Timpar-Kuran`** ("Timber Clans", `kits/timpar-kuran`) who remained in the Veiled Mountains. Retaining their ancestral `Kanopi` Pacific-Northwest/Tlingit + Jōmon/Ainu architectural DNA translated into semi-arid Western Outer Wall materials (`fur-larch`, birch-tar, golden `loess`, `megabreccia`/`basalt`, cave-madder, `celadon`, `nephrite`, and suzerain metals), their architecture stratifies three traditions across wealth and civic rank:

1. **Bench Vernacular (`style: 'bench'` — Poor & Rural Outer Wall):**
   - **Horizontal Western Outer Wall Loess-Bank *Yaodong* Vaults** (`hy_loess_yaodong`, `hy_scarp_cellar_poor`, `hy_terrace_farmstead`, `hy_mushroom_drift`) — cliff-bank frontispieces in golden-buff loess and impact `megabreccia` (never open-sky sunken square *dikengyuan* pits like `kits/molu-che`), crowned with **Censorate-compliant sleeping-eye formline tympanums** in birch-tar-blackened `fur-larch`, cave-madder red, and incised loess.
   - **Steamed `Fur-Larch` & Century-`Puya` Cruck-Rib *Chise* Lodges, Gale-Cobble Gables & *Pu* Stilt Caches** (`hy_larch_chise_poor`, `hy_fell_fold`, `hy_terrace_row_poor`) — translating coastal Hueru-Kuran pelagic whale-ribs and Veiled-Mountain plank gables into steep highland timber-and-puya crucks, **adzed `fur-larch` plank gables weighted with strapped `megabreccia` katabatic gale-cobbles**, **elevated `fur-larch` *pu* store-caches on tapered basalt posts with flat stone-mushroom *nezumi-gaeshi* marmot-baffle discs**, shaved-willow *inau* spirit-wands, cord-marked Jōmon *kaen-doki* smoke-pots, cave-madder Hayrant plaid (`CROPS.canPlaid('wouterwall')`), and mandatory closed-eye lead/terracotta door masks.
2. **Hybrid Vassal Town (`style: 'hybrid'` — Middle Dwellings, Trades & Sister-Clan Legation):**
   - Battered Sardinian/Kuran cyclopean & columnar basalt ground storeys and **sawn Crookshore emerald-nephrite trapezoid lintels** paired with Eternian white-limewashed Deco upper storeys, **birch-tar, madder & celadon-glazed sleeping-eye formline gable friezes**, **ovoid ancestor-collar doorways**, **celadon-glazed *kaen-doki* chimney crowns**, and bilingual Eternian logograph + Hayrant katakana-coda sound-mark signboards (`hy_bench_house_mid`, `hy_nuraghe_chise_mid`, `hy_courtyard_loess_mid`, `hy_corner_turret_mid`).
   - **Prized Cross-Pass Sister-Clan Heirlooms (`124,710` Ukor-Tera pass):** Bleached **Leviathan whale-jawbone arches** and **3-ton Crookshore emerald-nephrite lintels** reserved exclusively for `hy_kuran_legation` (twin of `hk_embassy_hayrant`), `hy_clan_lord_compound`, and the outer *Utari* clan council *chise* of `hy_prefect_seat`.
3. **Prefectural, Sanctuary & Cyber-Syncretic Totem-Pylon Cult (`style: 'prefect'` / `'sanctuary'` — Rich, State & Sacred):**
   - **Cyber-Syncretic "Eternian-Head" Totem Pylons (*Sutar-Pira*, `hyHeadTotemPole` & `hy_head_totem_court`):** Electrified `3.8–9.8 m` clan, relay, and sanctuary columns rising from octagonal `megabreccia`/`basalt` bases collared with salvaged `Kanopi` `titanium` & `white` arcology Busbar housings and ribbed dorsal pneumatic-and-power cyber-spines — stacking **3 to 5 serene closed-eye or bronze-veiled cyber-wired Eternian ancestor heads** (`42-et-head.js` with `brass`/`titanium` temple-jacks, neural halo-rings, and glowing cyan/amber visor diodes; `0` open eyes!) alongside **framed glowing cyan `faces` / `etFaceScreen` CRT ancestor terminals**, **`maze`/`mazeB`/`mazeC` PCB circuit-trace formline wing-boards** with backlit `nephrite`/`alabaster` capacitor cells, **stepped `Mirabilis` high-voltage `celadon`/`white` porcelain pin-insulator crossarms** with catenary power jumpers, and **`screen` Faraday arc-lantern / telemetry halo / lightning-arrestor crowns**.
   - **Monumental Central-Square Cyber-Totems (`hyMonumentalCyberTotem`, `hy_grand_cyber_totem` & `hy_cyber_totem_obelisk`):** Colossal `15.6–20.5 m` central-square and market-plaza cyber-totem monuments (`5–6` tiers, `5.0–6.2 m` cantilevered PCB great-wings) alternating `1.8–2.3 m` closed-eye/veiled colossus heads with 4-way octagonal `etFaceScreen` public-address matrices and multi-ring Faraday telemetry spires.
   - **"Organ-Pipe *Nuraghi*"** (`hy_prefect_seat`, `hy_clock_observatory`, `hy_merchant_tower_rich`, `hy_assay_registry`, `hy_withdrawn_sanctuary`) — concave-battered basalt *nuraghe* bastions and *mensoloni* stone corbels crowned with stepped pale-brick Deco-Gothic pier bundles, steep snow-shedding `celadon` hex-hips, dual **veined alabaster + translucent emerald-nephrite** lancet bundles, and ranked closed-eye/veiled gold, silver, bronze, and gunmetal ancestor statuary.
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
