# Ria Dynasty Architectural Kit (`kits/ria`)

The full settlement-ready architectural kit of the **Ria Dynastic Continuum ("The Two Reaches")** along the `Mā-Rīa` river system (`CROOK-RIA-DECISIONS.md` §2.4, §2.6), built on `core/engine` with native vertical-stack graphics (`GRAPHICS-TERRAIN-PROPOSAL.md` Stages 1, 5 `M1`–`M4`, 7 `I1`–`I4`, §12d `K1`–`K4`).

Displays **76 complete `defBuilding` palaces, chancelleries, scripture mondops, royal pantheons, citadels, curtain bastions, naval boom-arsenals, crane wharves, caravan weigh-houses, aqueduct cisterns, courier relays, bazaars, thermae, craft works, and every class of poor, middle & rich single- and multi-family dwelling** (`38` Lower Ria + `38` Upper Ria) arranged across six rows, with full Voth census trade coverage (`RA_TRADES` in `src/72-ra-trades.js`) and a sealed settlement bundle (`kits/ria/kit_bundle.py` -> `RIK`):

1. **Rows 1–3 — Lower Ria / Western Dynasty (`Heartland` & `Ria Sound`, Low-Ria *Rīwa-Tōka*, `style: 'lower-ria'`, 38 buildings):**
   Equal 50/50 synthesis of Near-Eastern & Classical masonry — Babylonian polychrome glazed-brick Ishtar round-arch portals, souk vaults, beehive kilns, curtain-wall bastions & Strategion keeps (`cobalt`, `emerald`, `saffron`), two-storey Neoclassical/Classical rusticated stone chancelleries, Roman treadwheel crane wharves, aqueduct nymphaea, steelyard weigh-arches, pierced grey-marble fretwork terraces, inward-battered *Bussabok* pylon gates, Persepolitan double-protome halls, and arcaded *insula* apartments — with 3-to-7-tier Thai Rattanakosin *Prasat*, *Mondop* & Burmese Konbaung *Pyatthat* crowns, celadon porcelain *Phra-Prangs*, atlas-caryatid golden *Chedis*, cruciform *Sala-Nam* water pavilions, poor-to-rich *Ruan-Thai* huts, tenements, shophouses & walled patrician clan compounds, and **5-Headed Gilded *Uktena* River-Serpent** balustrades.
2. **Rows 4–6 — Upper Ria / Eastern Dynasty (`Upper Ria` & `Springhollows`, High-Ria *Līwa-Tōga*, `style: 'upper-ria'`, 38 buildings):**
   Equal 50/50 synthesis of Egyptian, Classical & Minoan stone architecture — colossal flat-topped battered `porphyry` & `dolomite` cavetto pylons, ramparts & Acropolis citadels, green palm-frond capitals, cruciform Classical-Ptolemaic royal ancestor pantheons, pale-alabaster spear-guardian *dromos* cloisters, stone-counterweight quay cranes, bullion assay toll-gates, karst spring reservoirs, and **Compass-Hills `lodestone` obelisks** (`lodestone = 220`) — with Northern Lanna white-`alabaster` & `indigoslate` *Prasat* & *Mondop* spires, celadon/cobalt porcelain *Phra-Prangs*, silver-caryatid stupas, Angkor-Bagan stepped stone *Shikhara-Prangs*, `zinc = 90` brass & copper arsenals/foundries, karst counterweight boat-lifts, poor-to-rich quarry shacks, stepped tenements, lapidary shophouses, guild *insulae* & walled patrician manors, and **Silver-Bronze Crested Water-Swan (*Hongsa*)** balustrades & finials.

## Build, Test & Verify

```bash
# Repack library textures after editing materials.json
/tmp/pw-venv/bin/python tools/textures/pack.py kits/ria

# Build dist/ria.html + dist/ria.tex.*.js sidecars
python3 tools/build.py kits/ria

# Node unit & RIK bundle tests
node kits/ria/tests/test-ria.js

# Headless verification & assertions
python3 kits/ria/verify.py --assert
```

## Controls (`core/host`)

- **Orbit / Pan / Zoom:** Left-drag / Right-drag / Wheel
- **Walk (`F`):** First-person walker on `KWALK` floors, grand stairs, boardwalks, covered bridges, ramparts, and the exterior helical ramp of `ra_west_spiral_beacon` (with Stage 7 `KROOMLIGHT` portal daylight & warm interior lamps)
- **Door (`E`):** Open / shut the nearest `KDOOR` doorway
- **Cut-away (`X`):** Slice open roofs and upper walls to inspect furnished & `KROOMLIGHT`-lit interiors
- **Night (`N`):** Night sky, glowing kilns, forge hearths, braziers, lantern stands, and beacon fire
