# The Floating City of Ria Sound (`settlements/floating-city`)

Scale-model `5.1` pixel **`[635, 138]`** in the reshaped 3-river dendritic **Ria Sound** (`tools/scale-model/edit_528_ria_sound.py`), commanding both the **Heartland (`Rīwa-Wāta`)** and **Arcflow (`Suur-Neva`)** river networks (`36,000` metropolitan citizens, `850` non-Ancient lots) and twinned `28 km` ENE across sheltered sound water with East Bluff **Suudme-Kuluuna** (`[649, 141]`).

## Architecture & Core Systems

1. **Kit-Grade Ancient *Sumeru-Noahbabel* Megastructure (`src/42-fc-megastructure-plan.js`, `src/50a-fc-sumeru-core.js`, `src/50b-fc-dykes-weir.js`)**:
   - **Inverted Submarine Hydro-Dynamo Cone (`-12 m -> -96 m`) & `-128 m` Geodetic Taproot**: 12 radial penstocks (`8` active Pioneer superconductor bulb-turbines delivering `18.4–42.0 MW` + `4` SE flooded ruin bays audited by `KRUINS.watch`) and `-62 m` Submarine Control Hall (`vault: true`, `0.000` sky leak).
   - **`1,400 m` Circular *Noahbabel* Sea-Ring Weir (`+18 m` crown) & 6 Venetian Harbour-Quay Shelves (`+6.2 m`)**: 72 outer wave-buttresses, 12 watch-turrets, 6 curved inner two-row Venetian Harbour-Quay masonry shelves, 4 twin-keep sector ship-locks with `+36 m` paktong box-truss bridges & `KDOOR` miter-gates, and the NW `cobalt_glaze` tsunami repair scar (`KRUINS.watch`).
   - **Central `9+3`-Peak *Khao Phra Sumeru* Arcology Mandala (`+168 m` Maha-Meru)**: 3-tier octagonal lotus plinth with 40-column *Phra Rabieng* cloister galleries, 5 vaulted *Gopura* Bridge-Bastions locking the 3 Boulevard-Dykes seamlessly into the `+22 m` Upper Mandala Court, 9-tier redented *Ratha* Maha-Meru tower with 36 storeys of warm-lit arcology loggias & corbelled celadon roof skirts (`0` floating rings), 4 diagonal `+98 m` Khmer *Prangs*, 4 intercardinal `+58 m` 12-column peristyle *Mondops*, and southern 3-spire *Bussabok* Royal Island.
   - **3 Colossal Radial Boulevard-Dykes (`r = 96..698 m`, paired `+6.2 m` solid stone Quay Terraces), NNE Arched Ocean Viaduct (`r = 698..892 m` onto the West Harbour Mole), 14 8-Column *Sala-Nam* Water Pavilions & 6 Outer Stepped-Ziggurat Water-Pods**.
2. **Dense Dual-Kit Urban Fabric & Street-Gridded Bluff Burgh (`src/45a-fc-city-defs.js`, `src/45b-fc-city-steps.js`, `src/56-fc-streets-mole.js`)**:
   - **`850` Non-Overlapping, 100% Structurally-Seated Multi-Kit Buildings (`274` `KLK` `'suudme'`, `546` `RIK` `'lower-ria'`, `30` `RIK` `'upper-ria'`)**: merged into a shared WebGL2 `DataTexture2DArray` (`KCITY.createSharedAtlas`) with `< 13` active samplers.
   - **Mainland Crown Headland Paved Street Network (`D6` & `D7`, `100% >= +65 m`)**: 6 East-West curving avenues (led by the `20 m` Cliff-Lip Grand Esplanade & 6-pier Reservoir Stone Aqueduct Bridge), 13 North-South cross-streets, 4 flagstone civic squares, and `306` street-fronting lots on slope-fitted stone plinths.
   - **Monumental D5 West & East Stone Harbour Moles (`+7.8 m`) & 4 Viaduct Cliff-Funiculars**: 4 double-track inclined viaduct railways on grounded stone portal piers connecting the `+7.8 m` Harbour Moles directly to the `+109 m` Cliff-Lip Esplanade (`8` counterweighted cars).
3. **49 Octagonal Moon-Pool Pontoons, 72 Bascule Bridges, 71 Watercraft & `1,500+` Citizens (`src/55-fc-pontoons-hoists.js`, `src/70-fc-chars.js`)**:
   - Live `[Low Ebb] / [Slack Water] / [High Spring Flood] / [Ghost-Surge Drill] / [Drawdown Chime]` states driving both basin water levels, all `49` pontoons (`313` floating buildings), `72` hinged bascule bridges (`|pitch| <= 12°`), `22` Ring Sea vessels (including 6 cruising canal ferries/junks), `49` floating-market sampans, and `KHAZ.TIDE` submergence/drawdown/race hazards.

## Commands

```bash
node settlements/floating-city/tests/test-fc-city.js
python3 tools/build.py settlements/floating-city
python3 settlements/floating-city/verify.py --assert --out /tmp/verify-floating-city
```
