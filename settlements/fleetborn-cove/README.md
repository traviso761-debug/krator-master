# Fleetborn Cove — Arcoforte Sanctuary, Shore-Kin Client Villages & Nomad Fleet Moot (`settlements/fleetborn-cove`)

Fleetborn Cove (`px [236, 242]` on Scale Model 5.1) seats Paolo Soleri's **Arcoforte** (`kits/arcoforte`, read in place in `'marginal'` caretaker state) on the `+76..+84 m` eastern ophiolite cliff-prow of the Arch's macrotidal pocket fjord (`biomes/arch` Station `cove`, read in place). Protected behind a `-11 m` pillow-lava entrance sill (`87%` tsunami energy reduction) and driven by `KTIDE`'s **`7.5 m` neap to `14.3 m` spring tide** (`meanRange: 11 m`), the cove couples:
- **Zero-pump spring graving cradles** (`-3.0 m` blocks), salvaged Ancient submarine wet-pens (`kits/port` at `d = 3`), reversible `|v|^3` paktong sill rotors, an impounding tide-mill, and the `-6.0 m` White Stacks sea-byssus causeway (`FCOVE_TIDE`).
- **5 Shore-kin client hinterland villages + `+9.2 m` Harbour Client Work-Bench (`1,192` clients, `219` `kits/shore-kin` `SKK` buildings)** — *Pycnandra-Clamps* (`ash`), *Kauri-Chute* (`spars` + **529 m 3D Timber Spar Log-Chute** to the southern boatyard), *Seep-Walk* (`cordage`), *Dyke-Roast* (`smelt`), and *Sill-Pans* (`saltery`) — supplying the tide-gated Paktong Reverberatory Smelt-Hearth (`FCOVE_SIM` on `core/simulation`).
- **5 dynamic visiting `cFlīt-qBōn` & Hueru-Kuran Sea-Nomad Fleets (`KCAMP.fleetWorld`, `kits/ringsea` `89c–89h`)** sailing between microtidal **Deep-Ward Anchorage** (`px [148, 492]`, `530 km` SSW, `1.9 m` diurnal) and **Arcoforte**, swapping live between sparse Neap Anchorages (`1–2` fleets) and the **Double Dark & Double Full Great Careening Moots (`5/5` fleets, `36` hulls, `2,480` Moot Pop)**.
- **Tide- & Moot-Driven 3D Citizen Life Layer (`FCOVE_NAMES`, `FCOVE_LIFE_PLAN`, `FCOVE_LIFE` on `core/sched` + `peoples.json`)**: `788` named `cFlīt-qBōn`, `Shore-Kin`, and `Hueru-Kuran` citizens rendered in `5` `InstancedMesh` draw calls — careening shipwrights & caulkers descending onto `-3.0 m` blocks at ebb and relocating to `+9.2 m` coping quays when flooding (`0` non-divers submerged at any tide), free-divers & slack-water rotor tenders, spring-low `-6.0 m` White Stacks sea-byssus gatherers, village kilns/chutes/rope-walks, and Moot crowds swelling from `327` (Neap) to `788` (Double Dark Moot), with `12 px` hover/click ray-pick inspection.
- **Full `core/export` (`krator-world`) Godot Bundle (`FCOVE_EXPORT` + `export_godot.py`)**: Exports `world.glb` (glTF v2 with `EXT_mesh_gpu_instancing`) + `world.json` (`items`, `buckets`, `materials`, `textures`, `registry`, `terrain`, `stage`, `atmos`, `water` + `KTIDE` `{px: 236, py: 242, meanRange: 11}`, `fixtures`, `interiors`, `furniture`, and `sim`) with `0` errors and `0` broken joins.

## Build, Verify & Export

```bash
# Run the [G data] tide rules, 92-day coupled SIM economy, & P6/P7 life/export suites (Node, < 3 s)
node settlements/fleetborn-cove/tests/test-fcove-tides.js
node settlements/fleetborn-cove/tests/test-fcove-sim.js
node settlements/fleetborn-cove/tests/test-fcove-life-export.js

# Build dist/fleetborn-cove.html + texture sidecar + build-inputs.json
python3 tools/build.py settlements/fleetborn-cove

# Run full headless verification (SURVEY + KRUINS + 5 villages + 92d SIM + P6 citizen relocation/ray-pick + P7 EXPORT.check/GLB)
flock /tmp/krator-swiftshader.lock python3 settlements/fleetborn-cove/verify.py settlements/fleetborn-cove/dist/fleetborn-cove.html --assert --no-cache

# Export krator-world bundle (world.glb + world.json + tex/) for Godot 4.7.2
flock /tmp/krator-swiftshader.lock python3 settlements/fleetborn-cove/export_godot.py --out /tmp/fcove-godot-world
```

## Interactive Controls

- **Tide, Drydock, Fleet & Citizen Bar (`#fcove-tide-panel`):** Switch between **Live** (`KCLOCK`), **Run** (`1` tidal day in `48 s`), **Hold** (manual sea-level slider), **Great Ebb**, **Great Flood**, **Spring**, **Neap** (Day 68, `1/5` visiting fleets, `327` active citizens), and **Double Dark Moot** (Day 91, `5/5` converged fleets, `2,480` Moot Pop, `788` active 3D citizens). Relocates careening crews, causeway byssus gatherers, slack-water rotor divers, and Moot crowds live while displaying real-time hydraulic, economic, and citizen counts.
- **Citizen Inspector, Stocks, Cutaway & Godot Export (`core/host`):** Hover or click (`I`) any citizen within `12 px` to inspect their name, people (`cFlīt-qBōn`, `Shore-Kin`, `Hueru-Kuran`), dive physiology (`25 min / 100+ m` vs `3 min / 25 m`), village/fleet, and current tide-gated task. Press `O` for the `SIM` **Stocks** ledger, `X` (`[` / `]`) for Arcoforte's `fleetborn` and `shorekin` cutaway interiors, `E` for portal doors, `F` to walk, `M` for marks/polygons, or click **`export godot world`** in the bar.
