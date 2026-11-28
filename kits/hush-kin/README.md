# `kits/hush-kin` — The Hush-Kin (*Handspeak* Sanctuary Folk) White-Quartz Sanctuary Kit of Silent Vales

Standalone building, optical-heliograph spire, sinusoidal harmonic belfry, ribbon-lake ferry, and bespoke furniture kit (`culture: 'hush-kin'`, `faction: 'Hush-Kin Sanctuary Folk'`, political polygons `rmwzq292w0qc9` / `rmw4wizrk66e1`) on `core/engine` (`engine.py`), `core/atmos`, `core/drawn`, `core/materials`, `core/tags`, `core/furnish`, `core/door`, `core/walk`, and `core/water`, reading `kits/resources` (`42r`, `44r`) in place, and sealed as `HSK` via `kit_bundle.py`.

## Architectural Grammar inside *The Great Hush* (`35` Standalone `hs_*` Buildings + `hs_lakeside_sanctuary_row`, Seeds `37001–37401`)

The **`Hush-Kin`** (*Sutiru-Kuran* "Still-Clan" to their `Utari-Kuran` neighbours; `9,000` souls, `aggression: 0`, [LORE.md](../../LORE.md) §6.25 & §6.26) inhabit the twin glacial ribbon lakes (`196, 928` & `186, 1020`) and high granite-pegmatite divide of **`Silent Vales`**, enveloped by a surviving Ancient broadband acoustic-suppression field (*The Great Hush*) where speech, footsteps, clattering stone, and gunfire drop to `-inf dB` dead silence while **only pure sinusoidal harmonics (`440 / 660 Hz`)** propagate undamped:

1. **`HS1` — Gleaming Stepped Snow-White Milky-Quartz Spires & Optical Heliographs (`src/41-hs-quartz.js`):**
   - Slender `5:1` to `6:1` battered pale pegmatite-granite & blue-slate towers (`hsQuartzSpireTower`) crowned with **6- to 9-stepped gleaming snow-white `quartz` pyramidal spires (`hsQuartzPyramid`)**, **shuttered rock-crystal optical heliograph cupolas (`hsHeliographCupola`)** signalling silently shore-to-shore across ribbon-lake mist, and **twin-pronged white-quartz `440 Hz` tuning-fork finials (`hsTuningFinial`)**.
2. **`HS2` — `100%` *Handspeak* Open-Sightline Loggias & Chest-Height Parabolic Hand-Lamps (`src/40-hs-kit.js`):**
   - Communicating `100%` in grammatical **Two-Handed Sign Language (*Handspeak*)**, every house, academy, hospice, and council moot (`hs_handspeak_moot`) opens onto unobstructed colonnaded sign-galleries (`hsSignGallery`) illuminated at chest/hand height (`y = 1.25 m`) by **crystal-diffused lamps backed by polished snow-white quartz parabolic reflectors (`hsHandLamp`)** so signers' hands are brightly lit at dusk (`--night`).
3. **`HS3` — Sinusoidal `440 / 660 Hz` *Bianzhong* & Nephrite Harmonics + Open-Palm Threshold Monoliths:**
   - Ferry arrivals, moot assemblies, and rare southern `Timpar-Kuran` border alerts ring across *The Great Hush* on **graduated elliptic two-tone *bianzhong* bronze bells and L-shaped sawn emerald-nephrite *qing* lithophone slabs (`hsHarmonicRack`)** swaying silently as rigid pendulums (`SV_CLOTH` `chimePin`) in `ATMOS` valley wind, while passes and quays stand behind **`>= 2.0 cm` z-stepped Raised Open-Palm granite & white-quartz monoliths (`hsPalmMonolith`)**.

## Build, Test & Verify

```bash
# Pack library textures (from materials.json -> tex/)
python3 tools/textures/pack.py kits/hush-kin

# Run pure-data, architectural math & HSK bundle unit tests
node kits/hush-kin/tests/test-hush-kin.js

# Check Voth 44-trade census table (41 carried, 0 gaps, 3 explicit na)
python3 tools/check_trades.py kits/hush-kin

# Build dist/hush-kin.html (+ sidecar hush-kin.tex.js & build-inputs.json)
python3 tools/build.py kits/hush-kin

# Check Godot port tags, view names & core module adoption
python3 tools/check_port.py kits/hush-kin
python3 tools/check_views.py kits/hush-kin
python3 tools/check_core_use.py kits/hush-kin

# Headless Chromium GPU verification (--assert runs all kit + SURVEY checks)
python3 kits/hush-kin/verify.py kits/hush-kin/dist/hush-kin.html --assert --no-cache
```
