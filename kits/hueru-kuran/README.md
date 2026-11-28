# `kits/hueru-kuran` — The Hueru-Kuran ("Whale Clans") of Crookshore (`89,604`, `81,677`, `104,562`, `123,659` & `124,710`)

Standalone building, megatsunami-infrastructure, and bespoke furniture kit (`culture: 'hueru-kuran'`) on `core/engine` (`engine.py`), `core/atmos`, `core/materials`, `core/tags`, `core/furnish`, `core/door`, `core/walk`, `core/water`, and `kits/resources`.

## Cultural & Architectural Synthesis

The **`Hueru-Kuran`** ("Whale Clans", western maritime branch of the three-part **`Utari-Kuran`** complex descended from the shattered arcology **`Kanopi`** in the **Veiled Mountains**, alongside the Eternian-conquered **`Hayrant`** on the Outer Wall and the unconquered **`Timpar-Kuran`** who remained in the Veiled Mountains; [LORE.md](../../LORE.md) §6.25) inhabit tsunami-safe marine terraces (`+65..+120 m`), four drowned basalt ejecta craters (`89,604`, `81,677`, `104,562`, `123,659`), and the `+690 m` red-cypress flume bench (`124,710`) along Krator's megatsunami-battered **`Crookshore`**. Their architecture fuses **Bronze-Age Sardinian *Villaggio Nuragico* (*Su Nuraxi* & *Santa Cristina*)** cyclopean basalt masonry with **Prehistoric Jōmon, Kuril-Ainu, and Aleut pelagic whale-rib, *kaen-doki* flame-ceramic, and sawn emerald-nephrite (`jade = 200`) craft**:

1. **`HK1` — Sardinian Dry-Stone Basalt *Nuraghi* & *Nuraghi Complessi* (*Su Nuraxi* Massing):**
   - Clan keeps, intertidal *Prou-Torres*, granaries, gatehouses, and lighthouses built as **battered dry-laid dark columnar/cyclopean-basalt truncated cones** with interior **corbelled *tholos* beehive vaults**.
   - Crowned with **projecting Sardinian *mensoloni* basalt stone corbel-brackets** supporting overhanging stone parapets, **trapezoid doorways spanned by massive 3-ton sawn emerald-nephrite (`jade = 200`) lintel blocks** over triangular relieving slits, and quadrilobate/trilobate *Nuraghe Complesso* bastions (`hk_nuraghe_complesso`, `hk_cliff_gatehouse`, `hk_granary_nuraghe`, `hk_beacon_nuraghe`).
2. **`HK2` — Sardinian *Santa Cristina* Inverted-Keyhole Tsunami-Drawdown Sacred Step-Well (`core/water`):**
   - Precision-dressed sunken **inverted-keyhole basalt ashlar step-wells** descending to a live `core/water` (`WATER.still`) coastal-aquifer mirror pool hung with **tuned emerald-nephrite tide-chimes** to detect sudden aquifer drawdown `25 minutes` before silent far-field **Ghost Tsunamis** strike (`hk_stepwell_sanctuary`).
3. **`HK3` — Basalt-Ringed Whale-Rib *Chise* Lodges, `Kanopi` Three-Clan Memory Shrine & Jōmon *Kaen-Doki* Flame-Ceramic Crowns (*Villaggio Nuragico*):**
   - Poor, middle, and rich domestic *Chise* lodges (`hk_house_poor_*`, `hk_house_mid_*`, `hk_house_rich_*`, `hk_ukor_matron_lodge`, `hk_ukor_council`, `hk_tavern_whale`), the **`Kanopi` Three-Clan Memory Shrine & Veilpass Truce Hall** (`hk_kanopi_shrine`, framing a salvaged metallic `Kanopi` canopy-rib arch and three sister-clan totemic pillars — including `Hueru-Kuran`'s whale-and-pelican *Hueru-Pira* totem pole — for `Hueru-Kuran`, `Hayrant`, and `Timpar-Kuran`), and the **`Hueru-Pira` Nautical Totem Court & Carver Loft** (`hk_nautical_totem_quay`) pair **thick `2.2–2.8 m` battered cyclopean basalt ring-walls** with **arching bleached pelagic whale-rib structural vaults** supporting **interlocking turf, peat, and red-cypress bark domes**.
   - Topped at the smoke-hole by **sculptural Jōmon *kaen-doki* ("flame-rimmed") ochre-terracotta & verdigris-glazed chimney crowns**, and lit at dusk (`--night`) by **translucent thin-sawn emerald-nephrite windowpanes** and whale-oil stone lamps.
4. **`HK4` — *Hueru-Pira* / *Kōpa-Pira* Nautical Maritime Totem Poles, Megatsunami Waterfront Infrastructure & Full Voth Census Trades (`48` `hk_*` Defs, `HK_TRADES`):**
   - **`Hueru-Pira` & `Kōpa-Pira` Nautical Maritime Totem Poles (`41-hk-totem.js`, `hk_nautical_totem_quay`):** `4.0–9.2 m` coastal totem poles rising from hexagonal columnar-basalt plinths in salt-cured flumed red-cypress, driftwood, and bleached whalebone, stacking `3 to 5` sculpted coastal creature tiers — **Pelagic Filter-Whales (*Hueru*)** with combed baleen mouths & breaching tail-flukes, **Diving Pouch-Pelicans (*Kōpa-Tori*)** with distended gutskin/ochre gular pouches cradling fish and suspending wind-swaying emerald-nephrite tide-chimes from their bills, **Kelp Sea-Otters (*Rakkō*)**, **Giant Kelp-Octopi (*Takō*)**, **Barking Fur-Seals (*Tukari*)**, and **Reef-Crabs** — all carved with **`100%` wide-open inlaid emerald-nephrite & ivory horizon-watching eyes** (in deliberate contrast to conquered `Hayrant`'s Censorate-mandated sleeping slits);
   - **Prow-Shaped Hexagonal Columnar-Basalt Lagoon Wave-Splitter** crowned with a **bleached Leviathan Whale-Jawbone Arch & seaward *Hueru-Pira* sentinel pole** (`hk_wave_splitter`);
   - **Streamlined Intertidal *Nuraghe Prou-Torre* Refuge Keep** (`+8 m` solid basalt lower prow + external escape stair to elevated nephrite hatch, `hk_prou_torre`);
   - **90-Second Gravity Water-Counterweight Cliff Hoist & *Via Ferrata* Stair** (`hk_cliff_hoist`);
   - **Perched Tsunami-Safe Slipway & *Baidarka* Shipyard** (`hk_baidarka_yard`);
   - **Water-Powered Nephrite Pendulum Wire-Saw Mill** (`hk_jade_sawmill`), whale-blubber & ambergris try-works, baleen-laminate bowyer & cordage loft, **sea-spray brine evaporation & kelp-potash calcining kiln** (`hk_brine_kelp_pan`), kelp-soda & quartz-sand sea-green glassworks (`silica = 150`), harpoon smithy, *kaen-doki* climbing kiln, smokehouse-saltery, bakehouse, oiled seal-hide tailor, kelp brew-lodge, `+690 m` cypress flume yard, vault warehouse, terrace croft, and coastal nephrite quarry-mine (`hk_jade_quarry`).

## Build, Test & Verify

```bash
# Pack library textures (from materials.json -> tex/)
python3 tools/textures/pack.py kits/hueru-kuran

# Run pure-data & architectural/rigging unit tests
node kits/hueru-kuran/tests/test-hueru-kuran.js

# Build dist/hueru-kuran.html (+ sidecar .tex.js)
python3 tools/build.py kits/hueru-kuran

# Headless Chromium verification (--assert runs all 21 structural, nautical-totem, water, ATMOS wind, texture & z-fighting checks)
python3 kits/hueru-kuran/verify.py kits/hueru-kuran/dist/hueru-kuran.html --assert --cut --night
```
