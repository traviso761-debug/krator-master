# Fleetborn Cove — Arcoforte Sanctuary & Macrotidal Drydock (`settlements/fleetborn-cove`)

Fleetborn Cove (`px [236, 242]` on Scale Model 5.1) seats Paolo Soleri's **Arcoforte** (`kits/arcoforte`, read in place in `'marginal'` caretaker state) on the `+76..+84 m` eastern ophiolite cliff-prow of the Arch's macrotidal pocket fjord (`biomes/arch` Station `cove`, read in place). Protected behind a `-11 m` pillow-lava entrance sill (`87%` tsunami energy reduction) and driven by `KTIDE`'s **`7.5 m` neap to `14.3 m` spring tide** (`meanRange: 11 m`), the cove serves as the spring-tide careening drydock, paktong campaign smelter, and **Great Careening** moot of the pelagic **`cFlīt-qBōn` (Fleet-born)** and their **Shore-kin** client yard crews, paired with the calm microtidal home anchorage at **Deep-Ward** (`px [148, 492]`).

## Build & Verify

```bash
# Run the 92-day [G data] tide rules test suite (Node, < 1 s)
node settlements/fleetborn-cove/tests/test-fcove-tides.js

# Build dist/fleetborn-cove.html + texture sidecars + build-inputs.json
python3 tools/build.py settlements/fleetborn-cove

# Run full headless verification (SURVEY checks + KRUINS + tide state asserts)
flock /tmp/krator-swiftshader.lock python3 settlements/fleetborn-cove/verify.py settlements/fleetborn-cove/dist/fleetborn-cove.html --assert
```

## Interactive Controls

- **Tide & Drydock Bar (`#fcove-tide-panel`):** Switch between **Live** (follows world clock `KCLOCK`), **Run** (`1` tidal day in `48 s`), **Hold** (manual sea-level slider), **Great Ebb**, **Great Flood**, **Spring**, **Neap**, and **Double Dark Moot** (`91`-day syzygy). Displays live sea level, sill race velocity (`m/s`) & slack transit gate, `cradle_deep` / `cradle_great` / `cradle_shallow` gate status, paktong rotor shaft `MW` & smelt-hearth state (`campaign` vs `banked`), impounding tide-mill head, and `-6.0 m` White Stacks causeway exposure.
- **Cutaway & Walk (`core/host`):** Press `X` (`[` / `]`) to inspect Arcoforte's `fleetborn` and `shorekin` socketed interiors, `E` to toggle portal doors, `F` to walk, `I` for the `KTAGS` inspector, and `M` for marks/polygons.
