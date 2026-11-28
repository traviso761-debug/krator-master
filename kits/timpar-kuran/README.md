# `kits/timpar-kuran` — The Timpar-Kuran ("Timber-Clans") Kit of the Veiled Mountains

Standalone building, fortification, clan-shrine, forest/stream trade, and bespoke furniture kit (`culture: 'timpar-kuran'`, `faction: 'Timpar-Kuran Timber Clans'`, political polygon `rmwzqi9dwnd31`) on `core/engine` (`engine.py`), `core/atmos`, `core/drawn`, `core/materials`, `core/tags`, `core/furnish`, `core/door`, `core/walk`, and `core/water`, reading `kits/eternian` (`38`, `40`–`42`, war-loot head generator) and `kits/resources` (`42r`, `44r`) in place, and sealed as `TKK` via `kit_bundle.py`.

## PNW / Tlingit + Jōmon / Ainu Architectural Synthesis (`38` `tk_*` Definitions, Seeds `35001–35316`)

The **`Timpar-Kuran`** are the unconquered, raiding third branch of the **`Utari-Kuran`** cultural and linguistic complex ([LORE.md](../../LORE.md) §6.25), who remained in the Hoh-scale temperate-boreal rainforest U-valleys (`Veilpass`, `Mist Valley`, `Mist Valley 2`, `Region 177`, `+2,100–2,750 m`) of the **Veiled Mountains** after the mountain-forest arcology **`Kanopi`** shattered:

1. **Jōmon / Ainu Mountain-Forest Roots (`style: 'jomon'`):**
   - **Semi-Sunken Jōmon Timber-Crib Pit-Houses, Stepped Ainu *Cise* Lodges & Rainforest Camas Crofts** (`tk_jomon_pit_poor`, `tk_bark_cise_poor`, `tk_twin_pit_kin_poor`, `tk_camas_earth_oven`, `tk_pony_hound_corral`) — `megabreccia`-and-turf pit embankments, stepped courses of mountain-reed and cypress-bark thatch, east-facing sacred *rorun-puyar* spirit-windows hung with shaved-willow ***inau* curls**, sunken cobble ***irori* hearths**, sculptural cord-marked ***kaen-doki* flame-ware smoke-hole crowns**, steaming hot-cobble camas & fern-starch earth-ovens beside bark-stripped cloud-cedar CMTs, and `Veilpass` pack-pony & elevated bear-hound kennels.
   - **Rat-Baffled *Pu* Stilt Storehouses & *Nusa* Skull-Fences** (`tk_pu_clan_granary`, `tk_nusa_mortuary_row`, `tk_iomante_bear_court`) — elevated cedar caches collared with wide overhanging *nezumi-gaeshi* disc rat-guards, curved *nusa* bear/eagle skull altars, and the winter *iomante* raised log bear-cage (*heper-set*).
2. **Pacific-Northwest / Tlingit Monumental Timber, Grease-Trails & Formline (`style: 'plank'` & `'crest'`):**
   - **Split Red-Cypress Plank-Houses, Grease Try-Works, Totem Carving Sheds & `18–22 m` *Timpar-Cise* Great-Halls** (`tk_timpar_cise_rich`, `tk_chieftain_totem_hall`, `tk_twin_hearth_clan_rich`, `tk_potlatch_feast_hall`, `tk_grease_tryworks`, `tk_totem_carving_shed`) — fluted red-cypress corner posts, gale-cobble-weighted split-plank roofs with sliding *ganook* smoke-shutters, interior two-tier stepped **`daak` clan platforms**, hot-cobble candlefish/salmon-grease rendering canoes, horizontal peeled red-cypress totem trunks mid-carving on trestles, edge-to-edge lignite-black / cinnabar-red / celadonite-teal **formline screens** (`>= 1.8 cm` depth-stepped across 4 layers for zero coplanar z-fighting), and `8.6–11.4 m` **oval totem-mouth entrance poles** fitted with operable pivoting `KDOOR` cedar plug-doors.
3. ***Chasi-Noow* Ridge Forts, Caravan Ambushes, `Hayrant` Contraband & Anti-Eternian War-Loot:**
   - **Log-Crib Ridge Forts, Caravan Ambush Works & Cousin Fence Lodges** (`tk_chasi_noow_fort`, `tk_trophy_stockade_gate`, `tk_rockfall_trap_crib`, `tk_raid_mustering_ground`, `tk_ransom_stockade`, `tk_signal_pyre_tower`, `tk_cousin_truce_lodge`, `tk_barter_crest_post`) — double-walled red-cypress log-crib ramparts, walkable catwalks, `WATER.still` spring cisterns, suspended `megabreccia` boulder-deadfall cradles, and **wide-eyed wooden beast war-visors** contrasted against **captured closed-eyed Eternian bronze/stone ancestor heads** (`42-et-head.js`) mounted inverted or slashed with war-paint (`0` reverent Eternian door-masks). Preferring to **ambush Eternian highway and pass caravans** rather than assault fortified lowland settlements, the clans fence captured Eternian goods through a **thriving illicit trade with their `Hayrant` cousins** that the Eternal State continually tries to stamp out — while on the western and southern flanks they are the **sole external enemy ever fought by the `Hush-Kin` of `Silent Vales` (whom they only rarely raid) and the `Dzagh-Vardzi` gorge-kingdoms (whose free-roaming chivalric hero-troubadours rally `K1–K7` against settlement raids)**.

## Build, Test & Verify

```bash
# Pack library textures (from materials.json -> tex/)
python3 tools/textures/pack.py kits/timpar-kuran

# Run pure-data, architectural math & TKK bundle unit tests
node kits/timpar-kuran/tests/test-timpar-kuran.js

# Check Voth 44-trade census table (41 carried, 0 gaps, 3 explicit na)
python3 tools/check_trades.py kits/timpar-kuran

# Build dist/timpar-kuran.html (+ sidecar timpar-kuran.tex.js & build-inputs.json)
python3 tools/build.py kits/timpar-kuran

# Check Godot port tags
python3 tools/check_port.py kits/timpar-kuran

# Headless Chromium GPU verification (--assert runs all 23 kit + SURVEY checks)
python3 kits/timpar-kuran/verify.py kits/timpar-kuran/dist/timpar-kuran.html --assert --no-cache
```
