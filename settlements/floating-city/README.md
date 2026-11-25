# The Floating City of Ria Sound (`settlements/floating-city`)

Scale-model `5.1` pixel **`[635, 138]`** in the reshaped 3-river dendritic **Ria Sound** (`tools/scale-model/edit_528_ria_sound.py`), commanding both the **Heartland (`Rīwa-Wāta`)** and **Arcflow (`Suur-Neva`)** river networks and twinned `28 km` ENE across sheltered sound water with East Bluff **Suudme-Kuluuna** (`[649, 141]`).

## Architecture & Core Systems

1. **Ancient *Sumeru-Noahbabel* Megastructure (`src/42-fc-megastructure-plan.js`, `src/50-fc-sumeru-draw.js`)**:
   - **Inverted Submarine Hydro-Dynamo Cone (`-12 m -> -90 m`) & `-128 m` Geodetic Taproot**: 12 radial penstocks (`8` active Pioneer superconductor bulb-turbines delivering `18.4–42.0 MW` + `4` SE flooded ruin bays audited by `KRUINS.watch`) and `-62 m` Submarine Control Hall (`vault: true`, `0.000` sky leak).
   - **`1,400 m` Circular *Noahbabel* Sea-Ring Weir (`+18 m` crown)**: 4 sector ship-locks (`42–44 m` wide) with `KDOOR` miter-gates, 8 `+24 m` *Prou-Torre* gate-keeps, 4 `+34 m` paktong suspension spans, and the NW `cobalt_glaze` Babylonian relief-brick tsunami repair scar (`KRUINS.watch`).
   - **Central `9+3`-Peak *Khao Phra Sumeru* Mandala (`+168 m` Maha-Meru)**: Stepped octagonal lotus water-plinth (`R = 136 m`), 4 diagonal `+92 m` fluted *Prangs*, 4 cardinal `+48 m` *Mondops*, and southern 3-spire *Bussabok* Audience Island.
   - **3 Radial Boulevard-Dykes (`+22 m`), Reversible Tide-Wheels, 14 Naga Walkways, 14 *Sala-Nam* Pavilions & 6 Outer Stepped-Ziggurat Water-Pods**.
2. **Dual-Kit Non-Ancient Urban Fabric (`src/45-fc-city-steps.js`, `core/city/53-city-host-multikit.js`)**:
   - **`KLK` (`kits/kulanewa`, `style: 'suudme'`)**: Syncretic lowland estuary Kuruneva *Tooka-Hoov* Treaty Pontoons (`K1–K6`), NE Dyke Ishtar water-gates & tidal wharves, and Crown Headland syndicate bourses, sauna-thermae, Uktena bell-mondops, and sanjhya villas.
   - **`RIK` (`kits/ria`, `style: 'lower-ria'` + `'upper-ria'`)**: Western Ria Dynasty Pontoons (`P1–P18`), Boulevard-Dyke finger-piers, AS-01 *Court of the Amber Seal* Bluff Citadel (`>= +94 m`), and SE Upper-Ria *Hongsa* Co-Court Pontoons (`U1–U2`).
   - Merged at runtime into a shared WebGL2 `DataTexture2DArray` (`KCITY.createSharedAtlas`) with `< 15` active samplers.
3. **28 Cellular Moon-Pool Pontoons, 4x 90s Cliff-Hoists & Two-Basin Tidal `KHAZ` (`core/water/ext/63-core-water-tide.js`, `core/city/float/`, `core/hazard/23-core-hazard-tide.js`)**:
   - Live `[Low Ebb] / [Slack Water] / [High Spring Flood] / [Ghost-Surge Drill] / [Drawdown Chime]` states driving both basin water levels, all `28` pontoons, `29` hinged bascule gangways (`|pitch| <= 12°`), and `KHAZ.TIDE` submergence/drawdown/race hazards.

## Commands

```bash
node settlements/floating-city/tests/test-fc-city.js
python3 tools/build.py settlements/floating-city
python3 settlements/floating-city/verify.py --assert --out /tmp/verify-floating-city
```
