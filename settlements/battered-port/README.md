# Bè-tõ-pò (*Bare-Stone Port*) — `settlements/battered-port/`

`Bè-tõ-pò` (*"Bare-Stone Port"* / `Farport` dock-creole **`ɓè-cTõ-pò`**) is a **`5,000`-resident (`1,020`-household) Unpainted Eternian Exile & Smuggler Stronghold** perched on the **`+85..+138 m` worn crescentic scoria crater rim** above **`(435, 259)`** on **`Battered Isle`** (`rmwetgzft4x9d`).

## Highlights
- **Dual `KCITY` Vertical Tiers:**
  - **Instance A (`battered_rim`, `D1–D5`):** Upper horseshoe crater-rim bench (`+86.5..+138 m`, anchored on the exhumed columnar olivine-basalt volcanic neck **`Bare-Stone Head / Bè-tõ-hè`**) strictly above the `+85.0 m` megatsunami safety floor (`rules.groundOk`).
  - **Instance B (`battered_cove`, `D6–D7`):** Flooded breached-crater **`Kettle / Kò-pò`** (`-28.0 m` deep, `820 m` across, guarded by a `110 m` nickel-steel chain-boom across twin `38 m` radial feeder-dike jaws) and the subterranean yellow-tan palagonite **`Da-wò-hò` Sea-Cave Vault** (`140 × 55 m`, `+18 m` crown) + `640 m` Western Bolt-Hole Sea-Tunnel.
- **Unmasked Exile Orthodoxy (`48-bp-exile-dress.js` over `kits/eternian` read in place):**
  - *"No Mask Above the Door, No Chalk Upon the Cheek"*: dark oxidized scoria & columnar basalt plinths, chiselled-blank / driftwood / open-eyed figurehead lintels (`0` closed-eyed ancestor masks, `0` Heirs' gold colossi, `0` white rank-paint), and cantilevered `ironkneepodocarp` driftwood sea-galleries.
- **Four `90-Second` Counterweighted Twin-Chain Lugger Cliff-Hoists (`55-bp-hoists-fleet.js`):**
  - Spring-water ballast counterweights haul `19.5 m` blockade-luggers and contraband silk crates `86 m` vertically from `+2.2 m` Kettle cradles to `+112 m` rim winches under **`[Hoist Drill 90s Lift]`** or **`[Tsunami Surge]`**.
- **Native Vertical-Stack Graphics:**
  - `WMICRO` `version: 2` (`core/world/43m-world-micro.js`) smoothly attenuated across `KCITY` town bands (zero shelf step at the rim-town edge).
  - `<= 3`-layer zero-weight-guarded `KGROUND` (`< 13` active shader samplers `< 15`), `KHORIZON`, `KSHADOW` (off at load), `KDRAWN`, Stage 5 `KMAT_M1` M2 `km1RoughAA` specular AA + M4 plot-base contact AO (`0.72..1.00`), and Stage 7 `KROOMLIGHT` (`I1–I4`, with `vault: true` receiving `0` sky daylight per Gate 5).
- **Build & Test:**
  ```bash
  python3 tools/build.py settlements/battered-port
  node settlements/battered-port/tests/test-battered-port.js
  python3 tools/check_trades.py settlements/battered-port
  ```
