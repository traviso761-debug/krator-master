# The scale model's past edits

Each script here made one version of the page from the version before it (`../README.md`, "History"), and the
`.json`, `.jpg` and `.md` files are their reports. They are the record and are not changed. To read one, start at the
version's section in `../README.md`.

The reusable parts were lifted into `../smodel/` on 2026-10-28 (`../tests/test_smodel.py` checks each lifted function is
the same code). New edits use smodel, not these scripts:

- **Each takes the page before it**, which the repo does not keep. Run on today's data, `edit_423.py` stops at its
  `assert D['hi'] == OLD_HI`, and the older ones decode the heights wrongly.
- **They hard-code the height range** `LO, HI = -2600, 17100`. 4.23 raised `hi` to 27,000 m; smodel reads it from the data.
- **They import each other**, and `edit_423.py` also imports `../extract_region.py`. To run one again, put both folders
  on the path: `PYTHONPATH=tools/scale-model:tools/scale-model/history python3 tools/scale-model/history/<script> ...`.

| Script | Version |
|---|---|
| `inner_wall_smooth.py`, `features.py`, `features2.py`, `features3.py`, `assemble.py`, `patch_ui.py` | 4.11 to 4.14 |
| `edit_heights.py` | 4.15 to 4.19 |
| `edit_dams.py` | 4.20 |
| `edit_rivers.py`, `hydro.py`, `river_names.py`, `lake_compare.py`, `sat_audit.py` | 4.21 |
| `edit_422.py` | 4.22 (its `main()` is still the worked example of a full river reroute) |
| `edit_423.py` | 4.23 |
