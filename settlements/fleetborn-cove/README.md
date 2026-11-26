# Fleetborn Cove — Arcoforte Sanctuary, Shore-Kin Client Villages & Nomad Fleet Moot (`settlements/fleetborn-cove`)

Fleetborn Cove (`px [236, 242]` on Scale Model 5.1) seats Paolo Soleri's **Arcoforte** (`kits/arcoforte`, read in place in `'marginal'` caretaker state) on the `+76..+84 m` eastern ophiolite cliff-prow of the Arch's macrotidal pocket fjord (`biomes/arch` Station `cove`, read in place). Protected behind a `-11 m` pillow-lava entrance sill (`87%` tsunami energy reduction) and driven by `KTIDE`'s **`7.5 m` neap to `14.3 m` spring tide** (`meanRange: 11 m`), the cove couples:
- **Zero-pump spring graving cradles** (`-3.0 m` blocks), salvaged Ancient submarine wet-pens (`kits/port` at `d = 3`), reversible `|v|^3` paktong sill rotors, an impounding tide-mill, and the `-6.0 m` White Stacks sea-byssus causeway (`FCOVE_TIDE`).
- **5 Shore-kin client hinterland villages + `+9.2 m` Harbour Client Work-Bench (`1,192` clients, `219` `kits/shore-kin` `SKK` buildings)** — *Pycnandra-Clamps* (`ash`), *Kauri-Chute* (`spars` + **540 m 3D Timber Spar Log-Chute** to the southern boatyard), *Seep-Walk* (`cordage`), *Dyke-Roast* (`smelt`), and *Sill-Pans* (`saltery`) — supplying the tide-gated Paktong Reverberatory Smelt-Hearth (`FCOVE_SIM` on `core/simulation`).
- **5 dynamic visiting `cFlīt-qBōn` & Hueru-Kuran Sea-Nomad Fleets (`KCAMP.fleetWorld`, `kits/ringsea` `89c–89h`)** sailing between microtidal **Deep-Ward Anchorage** (`px [148, 492]`, `530 km` SSW, `1.9 m` diurnal) and **Arcoforte**, swapping live between sparse Neap Anchorages (`1–2` fleets) and the **Double Dark & Double Full Great Careening Moots (`5/5` fleets, `36` hulls, `2,480` Moot Pop)**.

## Build & Verify

```bash
# Run the 92-day [G data] tide rules & coupled SIM economy test suites (Node, < 2 s)
node settlements/fleetborn-cove/tests/test-fcove-tides.js
node settlements/fleetborn-cove/tests/test-fcove-sim.js

# Build dist/fleetborn-cove.html + texture sidecar + build-inputs.json
python3 tools/build.py settlements/fleetborn-cove

# Run full headless verification (SURVEY checks + KRUINS + 5 villages + 92d SIM + dynamic fleet asserts)
flock /tmp/krator-swiftshader.lock python3 settlements/fleetborn-cove/verify.py settlements/fleetborn-cove/dist/fleetborn-cove.html --assert
```

## Interactive Controls

- **Tide, Drydock & Fleet Bar (`#fcove-tide-panel`):** Switch between **Live** (`KCLOCK`), **Run** (`1` tidal day in `48 s`), **Hold** (manual sea-level slider), **Great Ebb**, **Great Flood**, **Spring**, **Neap** (Day 68, `1/5` visiting fleets, banked hearth), and **Double Dark Moot** (Day 91, `5/5` converged fleets, `2,480` Moot Pop). Updates moored 3D fleet groups and displays live sea level, sill race & slack gate, cradle gates, rotor `MW` & smelt-hearth state, tide-mill head, White Stacks exposure, fleet count, moot population, paktong stock, and Shore-kin client villages.
- **Stocks, Cutaway & Walk (`core/host`):** Press `O` for the `SIM` **Stocks** ledger (`paktong`, `nickel_ash`, `copper_zinc`, `spars`, `pitch_cordage`, `shell_lime`, `salt_fish`, `salvage`, `whale_oil`), `X` (`[` / `]`) to inspect Arcoforte's `fleetborn` and `shorekin` socketed interiors, `E` for portal doors, `F` to walk, `I` for the `KTAGS` & place-holdings inspector, and `M` for marks/polygons.
