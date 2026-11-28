# Snou Bruk Iron Millstream (`settlements/iron-millstream`)

Live high-gradient alpine stream & hydropower trial for **The Iron Republic** (`R1` *Roket-Kanton*), cut from Scale Model 5.1 immediately east of **Roketstad** (`id: "s28hf1s9ab"`, `px 632, py 716`, `+2,949.6 m ASL`, `1.107 atm`) along river **`r201` (*Snou Bruk*, `Q = 19.5 m³/s`)**.

Proves `kits/highlands/src/77c-rep-hydro.js` and `94-hl-anim.js` operating on real `core/water` (`WATER.flow`, `WATER.fall`, `WATER.still`, `WATER.open` + `shore`, `WATER.join`) prior to the full `Roketstad` rebuild ([`settlements/highlands/PLAN.md`](../highlands/PLAN.md), [`ROKETSTAD-BLUEPRINT.md`](../highlands/ROKETSTAD-BLUEPRINT.md)):

- **Main *Snou Bruk* Gorge Channel (`x ≈ +32 m`, `Q = 16.3 m³/s`):** Upper snowmelt torrent -> impounded **Weir Mill-Pond** (`+24.40 m`) -> stepped granite **`hl_hydro_weir`** spillway cataract -> boulder gorge & mid-gorge waterfall spanned by an arched granite-and-larch gorge bridge -> confluence with mill tailrace -> lower **Tailwater Cove** (`+1.50 m`).
- **Diverted 4-Step Overshot Headrace Cascade (`x = +11.0 m`, `Q = 3.2 m³/s`, `ΔH = 18.4 m`):**
  1. `hl_hydro_weir` (`+24.40 m` mill-pond forebay)
  2. `hl_hydro_sluice_gate` (twin spoked cast-iron rack-and-pinion intake lock)
  3. `hl_hydro_flume` (elevated braced larch trestle penstock trough)
  4. `hl_rep_hydro_sawmill` (`+19.40 m` terrace: reciprocating 5-blade vertical steel gang-saw & lumber slipway)
  5. `hl_rep_hydro_stampmill` (`+14.76 m` terrace: 5-pestle iron-shod magnetite ore-crushing cam battery & buddle tables)
  6. `hl_rep_hydro_forge` (`+10.12 m` terrace: cam-lifted oak helve trip-hammer, glowing bloom & twin leather blast-bellows)
  7. `hl_rep_hydro_gristmill` (`+5.68 m` terrace: turning granite runner stone, Slavic *kokoshnik* sack-hoist & drying racks)
  8. Masonry tailrace return joining *Snou Bruk* at `(+32, +132, +3.95 m)` via `WATER.join`.
- **Slavic Cantonal Mill-Bench (`KCITY` & `KHAMLET`):** Pure Slavic/Carpathian/Novgorodian carved wood & rendered stone cottages, tavern, shops, tool smithy, charcoal/iron storehouses, and upper magnetite-adit hamlet (`RES_ORE` `iron = 180`).

## Build & Verify

```bash
python3 settlements/iron-millstream/build.py --bake-model         # regenerate src/28-im-model.js from Scale Model 5.1
python3 tools/build.py settlements/iron-millstream                # build dist/iron-millstream.html + sidecar tex
node settlements/iron-millstream/tests/test-iron-millstream.js    # run [G data] hydraulic & layout tests + negative controls
python3 settlements/iron-millstream/verify.py settlements/iron-millstream/dist/iron-millstream.html --assert --out settlements/iron-millstream/shots
```
