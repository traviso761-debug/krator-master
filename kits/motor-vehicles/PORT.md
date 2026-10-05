# kits/motor-vehicles: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 0 (0%) | 0 (0%) | 10 (34%) | 20 (66%) | 0 (0%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 4.3 | [web] | 0 | 0 | 4 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/80-sky-hash.js` | 0.5 | [G native] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/81-sky.js` | 9.5 | [G native] | 23 | 4 | 0 | 0 | 0 | 3 | 6 | 0 | 0 | 0 | 0 | shader hook inside |
| `src/90-sheet.js` | 7.6 | [web] | 8 | 3 | 9 | 4 | 0 | 3 | 0 | 0 | 0 | 0 | 0 |  |
| `src/92-hover.js` | 2.9 | [web] | 2 | 0 | 8 | 3 | 0 | 0 | 0 | 0 | 2 | 0 | 0 |  |
| `src/93-polygon.js` | 4.8 | [web] | 6 | 0 | 9 | 9 | 0 | 2 | 0 | 0 | 1 | 0 | 0 |  |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

The kit's own files sit at the top of this folder (other builds read them through `vehicle_bundle.py`, as the
catalog's furniture is read through `furniture_bundle.py`), so `tools/audit_port.py` does not list them above: its
`fragments()` takes top-level files only for `kits/catalog`. Tagged by hand, same columns (THREE | canvas | DOM |
events | loop | geom | shader | inst | ray | store | net):

| File | KB | Tag | Counts | Note |
|---|---|---|---|---|
| `vehicles-core.js` | 13.3 | [draw] | 23 0 0 0 0 18 0 0 0 0 0 | split: the VEHICLE registry, vocabularies and `vehicleData()` are [G data]; the vehicle frame helpers and `vehicleBalloonTyre()` draw |
| `krator-vehicles-geomancer.js` | 18.9 | [draw] | 0 0 0 0 0 126 0 0 0 0 0 | split: each entry's `tags`, `data`, `variantData` and the palette are [G data] (a sim reads them with no drawing); `build`/`wheel` draw |
| `krator-vehicles-runtime.js` | 10.2 | [draw] | 18 0 0 0 0 1 0 0 0 0 0 | assembly: merges per material, hangs the wheels; `list()`/`dataOf()` are the data face, `roll`/`steer`/`lights` act on three.js nodes |
| `vehicle_bundle.py`, `build.py`, `verify.py` | | [web] | | tooling |

For Godot: the data (`KratorVehicles.list()`: tags, data, wheels, lamps) exports as is; the body and wheels cross
over as meshes (two body meshes per vehicle and one per wheel, wheel origins at the hubs, `steer_*` pivots), so a
Godot VehicleBody3D can take the wheel records as its VehicleWheel3D nodes. The emissive lamp map (an 8-texel strip
picked by uv) becomes an emission texture on the metal surface.
