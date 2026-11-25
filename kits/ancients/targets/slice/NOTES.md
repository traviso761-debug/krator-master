# Slice (`kits/ancients/targets/slice`) — Notes

- **Reference**: Paolo Soleri, *Arcology: The City in the Image of Man* — *26. Theology* (`reference/theology_plan.png`, `reference/theology_elevation.png`), renamed **Slice** in Krator canon.
- **Seed Range**: `12420 + d` (`12420..12424` claimed by `buildSlice` in `8av1-slice-draw.js`; `8av0-slice-plan.js`, `8av2-slice-water.js`, and `90w-slice-water.js` are listed in `DETERMINISTIC` and draw from `KRAND`).
- **Core Modules**:
  - `core/rand` (`KRAND`): deterministic variation in `SLICE.plan`, `SLICE.ruin`, `SLICE.dress`.
  - `core/tags` (`KTAGS.slice`): registers building, structural parts, all 29 Work/Live/Recreation/Civic interior program records, flora, props, life, and wrecks before drawing.
  - `core/water` + `core/atmos` (`8av2-slice-water.js`, `90w-slice-water.js`): foreground gorge river & current, Sunken Park reflecting canal, Front Amphitheatre pool, Hexagonal Skylight mirror basin, East Rotunda fountain, sluice cascades, and the ruin's `48 m` + `192 m` wild cascades.
  - `core/ruins` (`KRUINS.watch` in `90w-slice-water.js`): verifies that the entire standing `d = 1` ruin forms a single grounded structural cluster (`0` floaters) and all `6` detached bench/shore wrecks sit within `[-0.5, +0.1] m` of `SLICE.groundY`.
- **Blueprint Sheets**: Run `python3 kits/ancients/targets/slice/plan/slice_plan.py` to regenerate `plan/sheets/*.png` and `plan/AREAS.md` directly from `8av0-slice-plan.js`.
- **Unit Test**: Run `node kits/ancients/tests/test-slice.js`.
