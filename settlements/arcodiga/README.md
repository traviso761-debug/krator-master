# Kōpa-Dīga / Arcodiga / Dī-Gā Wài-Sī — `settlements/arcodiga/`

**Kōpa-Dīga** (*`Hueru-Kuran`*: "Caldera-Dam") / **Arcodiga** (*Ancient plate name*) / **Dī-Gā Wài-Sī** (*`Pè-wè` Paper Eternian*: "Outer Dam Superintendency") is a **`6,800`-resident (`1,380`-household) Dense Dual-Polity Charter-Market Town & Hexagonal Superintendency** spanning **Crookshore North Crater (`Kopa-North`, Scale Model `5.1` `px 89, 604` / southern basalt gorge-throat `88.5, 608`)** at `1.60 atm` sea level.

## Highlights
- **Tsunami-Breached Soleri Dam-Arcology (`kits/ancients/targets/arcodiga` read in place at `yOffset = -95.0 m`):**
  - Seated directly on the `-95.0 m` bedrock crater-throat sill (`worldY = localY - 95.0 m`) with `{ noTerrain: true, noWater: true, ground }` and exact parametric keep-out (`ADG_SITE.inArcologyKeepout`: `0` street or building clipping!).
  - **`88%` Abandoned Ruin (`d = 1` + `KRUINS.watch`):** Completely submerged lower Powerhouse & Automated Industries (`-95..-49 m`), `Notch` cascade breach scar (`+117 m`), severed West Stiffening Wing (`x = -348..-182 m`), `62` seated megablock talus wrecks (`0` floaters), and `+337 m` lagoon-surrounded VTOL spire.
  - **`12%` Reclaimed `Eternal State` Enclave (`ADG_CROOK_DELTA` + `KratorAncientsInteriors` `'eternian'` socket):** Intact East Stiffening Wing (`wing.learning` + east `wing.hub`, `worldY +81..+227 m`) & inner East Buttresses (`E1..E2`), sealed at `x = +38 m` by a **Bronze Closed-Eyed Ancestor-Lintel Bulkhead** and emerging at `x = +1020.5 m` through a **Sculpted Bronze-and-Basalt Charter Concourse Portal** onto `Dīga-Māketi` Boulevard.
- **Dense Three-Instance Dual-Polity `KCITY` Layout on `KCITY.hostMultikit` (`DataTexture2DArray`, `< 13` Samplers):**
  - **`hk_rim` (`Z5`, `+98..+205 m`):** Densely clustered `Hueru-Kuran` whale-rib *Chise* wards across `32` terraced blocks, Trilobate *Nuraghe Complesso*, ***Santa Cristina* `25-min` Ghost-Tsunami Drawdown Chime-Well**, pendulum nephrite wire-sawmills, and *benihi* red-cypress flume yards.
  - **`et_cantonment` (`Z4` Charter Arcade east of `x = 1032 m` + `Z6` `15`-Cell `ADG_HEX` Eternian Hexagonal Honeycomb):** True `6`-fold flat-Z hexagonal street lattice (`R = 56.0 m`, inner hexagonal court loops, radial lanes, `6`-sided basalt podiums, and `100%` `60°`-aligned hexagonal buildings) centered on `et_fort` at `(1205, 555)` with `et_ministry`, mechanical bronze Tsunami-Tide `et_clock`, `7`-villa `et_hex_villa` rosette, `et_kiln` / `et_tile_works`, and `2` active `KCONS` construction sites.
  - **`cove_works` (`Z1` Lagoon Cove + NW Breach Splitters + SE Dam-Lee Farport Junk Quay, `+5..+15 m`):** `37` densely arranged non-residential coastal works (`0` dwellings `< +65.0 m`!) linked to the rims by **`3` `90-second` counterweighted cliff-hoists**.
- **Crookshore `+65.0 m` Trimline Ecology, Dual `WATER.open` & Live `1.60 atm` `ATMOS` Wind:**
  - `biomes/crook` (`CROOK_PHYS.sprayTrimAt`): lithistid basalt chimney- and cushion-sponges below `+65 m` (`0` woody trees) vs. *benihi* red-cypress, Sitka spruce, Western redcedar & canopy fog-sponges above `+65 m`.
  - Heavy `1.60 atm` outer ocean breakers (`surf: true`) vs. calm `-95 m` `Kopa-North` caldera lagoon (`surf: false`), *Santa Cristina* `WATER.still` mirror pool, faded sawmill `WATER.flow` cascades, and `[Ghost-Tsunami Drawdown]` interactive drill.

## Build, Test & Verify
```bash
python3 tools/build.py settlements/arcodiga
node settlements/arcodiga/tests/test-arcodiga-town.js
python3 settlements/arcodiga/verify.py --assert --out /tmp/verify-arcodiga
```
