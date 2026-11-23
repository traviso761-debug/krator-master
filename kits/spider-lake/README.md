# `kits/spider-lake` — The Silk Principality of Spider Lake (`1288, 220`) & Ham-Tsek (`1055, 219`)

Standalone building, tensile-silk, and bespoke furniture kit (`culture: 'spider-lake'`) on `core/engine` (`engine.py`), `core/atmos`, `core/materials`, `core/tags`, `core/furnish`, `core/door`, `core/walk`, `core/water`, and `kits/resources`.

## Cultural & Structural Character

`Spider Lake` (`1288, 220`, *Hām-Spī*) and its western sister market town `Ham-Tsek` (`1055, 219`, *Hām-Tsēk*) belong ethnically and linguistically to the **Korona / *Hum* cultural complex**—inheriting colonial `Cloud-Fleece` and golden-orb spider symbiosis alongside acoustic *Hum* calming—refined by centuries of **Ria Civilizational hegemony** into a wealthy, literate lakeside **Silk Principality**.

### Structural Honesty (`Compression vs. Tension`)
Every piece in the kit enforces strict physical separation:
- **Compression (`Stone & Lacquered Cedar`):** Stepped cream-dolomite ashlar plinths, imperial red-porphyry post-and-lintel colonnades, tall notched dolomite **Mast-Obelisks**, and raked **vermilion-and-ebony lacquered cedar King-Masts** carry all vertical and overturning loads.
- **Tension (`Spider-Silk Rigging & Membranes`):** Golden `1.3 GPa` dragline-silk cables over bronze pulley sheaves counterweighted by nephrite-jade and bronze bobbins suspend pleated catenary *velaria*, anticlastic hyperbolic-paraboloid ("Lotus-Saddle") amber-waxed silk roofs, indigo-and-gold *shamiyana* awnings, vertical evaporative silk wind-veils dipping into carved dolomite water-troughs, and `19 m` hanging dyed canal silk bolts.

### The Four Architectural Pillars (`SL1–SL4`)
1. **`SL1` — Ria Stone Colonnades & Retractable Catenary *Velarium* Sun-Sails:** Cream-dolomite & red-porphyry colonnades paired with notched Mast-Obelisks, bronze sheaves, dragline cables, and nephrite counterweights spanning saffron, cochineal-crimson, and raw ivory *velaria* (`sl_silk_bourse`, `sl_guild_square`, `sl_reeling_market`, `sl_house_rich_villa`, `sl_embassy_ria`).
2. **`SL2` — Raked Lacquered Cedar King-Masts & Hyperbolic-Paraboloid ("Lotus-Saddle") Amber-Silk Roofs:** Raked vermilion-and-ebony King-Masts and perimeter stone/bronze mooring bollards tensioning heavy amber-resin-waxed spider-silk broadcloth into anticlastic saddle canopies with floating crimson crown-caps (`sl_palace_pavilion`, `sl_hum_sanctuary`, `sl_treaty_hall`, `sl_house_rich_pavilion`).
3. **`SL3` — Open Spider-Loft Wind-Scoops, *Shamiyana* Canopies & Evaporative Hanging Silk Wind-Veils:** Poor, middle, and rich lakeside houses, academies, and healing pavilions topped by open-rafter cedar ***Hum* Spider-Loft Wind-Scoop Towers** (where colonial spiders spin orb-webs up in the rafters), *shamiyana* awnings, and vertical silk wind-veils dipping into perimeter water-troughs (`sl_house_poor_*`, `sl_house_mid_*`, `sl_school_scriptorium`, `sl_healer_pavilion`).
4. **`SL4` — Weir-Bridges, Cedar Pergola Parasols, Cocoon Lanterns & `20 m` Hanging Dyed Silk Streamers:** Canal dye-works with twin `16 m` cedar drying-towers draping `19.2 m` catenary dyed silk bolts across flowing `core/water` canals (`sl_dyehouse_canal`), arched dolomite moon/weir-bridges (`sl_ferry_bridge`), silk-weir harvest docks (`sl_weir_dock`), princely barge-quays (`sl_barge_quay`), lakeside bastions & gatehouses, full Voth census trade works (`SL_TRADES`), and warm glowing oiled-silk cocoon lanterns at `--night`.

### Centerpiece Compound — `Silkhead` Great Central Caravanserai (`sl_caravanserai_silkhead`)
Built in `src/56-sl-silkhead.js` (`39.6 × 39.6 m`, `cut: true`) for **`Silkhead`** (*Spī-Kōr*, `1288, 220`), the spillway caravan and silk-baling entrepot where *Hum* silk-wrights, Ria Valley mule-trains, Compass Hills bronze-delvers, and Outland caravans converge:
- **Perimeter Two-Storey Quadrangle (`SL1 + SL3`):** Fortified Twin Mast-Obelisk south caravan gatehouse with operable double gates, vaulted mule/yak pack-stables, bonded `Golden Cable` & `Lake-Sheen Gossamer` silk-bale godowns, continuous upper Ria stone colonnade gallery of merchant hostel suites, teahouse loggias, and treaty offices, plus four corner open-rafter ***Hum* Spider-Loft Wind-Scoop Towers** hung with evaporative silk wind-veils in carved stone water-troughs.
- **Central Caravan Exchange Court (`SL1 + SL2 + SL4`):** Octagonal raked vermilion/ebony King-Mast **Silk-Bourse Pavilion** tensioning a golden-amber **Lotus-Saddle** silk canopy over the grand silk-weighing balance (`spider-lake_bourse_scale`) and central nephrite fountain, framed by four radial catenary *velaria*, trough pergolas (`spider-lake_pack_trough`), glowing cocoon lanterns, and ceremonial dyed silk bolts.

## Build, Test & Verify

```bash
# Pack library textures (from materials.json -> tex/)
python3 tools/textures/pack.py kits/spider-lake

# Run pure-data & silk rigging unit tests
node kits/spider-lake/tests/test-spider-lake.js

# Build dist/spider-lake.html (+ sidecar .tex.js)
python3 kits/spider-lake/build.py

# Headless Chromium verification (--assert runs all 16 structural, ATMOS wind, texture & z-fighting checks)
python3 kits/spider-lake/verify.py kits/spider-lake/dist/spider-lake.html --assert --cut --night
```
