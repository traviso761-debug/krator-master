# kits/motor-vehicles: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 0 (0%) | 10 (6%) | 10 (6%) | 20 (13%) | 116 (74%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `krator-vehicles-eastabyss.js` | 13.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 57 | 0 | 0 | 0 | 0 | 0 | split: palette, detail table, `tags`, `data`, `variantData` are [G data]; `build`/`wheel` draw |
| `krator-vehicles-geomancer.js` | 19.9 | [draw] | 0 | 0 | 0 | 0 | 0 | 129 | 0 | 0 | 0 | 0 | 0 | split: each entry's `tags`, `data`, `variantData` and the palette are [G data] (a sim reads them with no drawing); `build`/`wheel` draw |
| `krator-vehicles-iziz.js` | 11.3 | [draw] | 0 | 0 | 0 | 0 | 0 | 47 | 0 | 0 | 0 | 0 | 0 | split: palette, detail table, `tags`, `data`, `variantData` are [G data]; `build`/`wheel` draw |
| `krator-vehicles-post-apoc.js` | 16.4 | [draw] | 1 | 0 | 0 | 0 | 0 | 79 | 0 | 0 | 0 | 0 | 0 | split: palette, detail table, `tags`, `data`, `variantData` are [G data]; `build`/`wheel` draw; the bogie table `PA_BOGIES` is data too |
| `krator-vehicles-republic.js` | 18.9 | [draw] | 1 | 0 | 0 | 0 | 0 | 78 | 0 | 0 | 0 | 0 | 0 | split: palette, detail table, `tags`, `data`, `variantData` are [G data]; `build`/`wheel` draw |
| `krator-vehicles-runtime.js` | 15.4 | [draw] | 30 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | assembly: merges per material with a detail slot per vertex, hangs the wheels, lays the belts; `list()`/`dataOf()` are the data face, `roll`/`steer`/`lights` act on three.js nodes |
| `vehicles-core.js` | 20.6 | [draw] | 30 | 0 | 0 | 0 | 0 | 20 | 0 | 0 | 0 | 0 | 0 | split: the VEHICLE registry, vocabularies, `vehicleData()` and `vehicleBudget()` are [G data]; the vehicle frame helpers (`F.slab`, `F.tub`, `F.track` ...) and `vehicleBalloonTyre()` draw |
| `vehicles-detail.js` | 9.7 | [G shader] | 4 | 3 | 0 | 0 | 0 | 1 | 8 | 0 | 0 | 0 | 0 | the detail maps: slot resolution is [G data]; the triplanar atlas hook is one .gdshader (or StandardMaterial3D triplanar + a CUSTOM0 slot); the atlas canvas is [web] |
| `src/00-head.html` | 4.3 | [web] | 0 | 0 | 4 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/80-sky-hash.js` | 0.5 | [G native] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/81-sky.js` | 9.5 | [G native] | 23 | 4 | 0 | 0 | 0 | 3 | 6 | 0 | 0 | 0 | 0 | shader hook inside |
| `src/90-sheet.js` | 8.5 | [web] | 8 | 3 | 9 | 4 | 0 | 3 | 0 | 0 | 0 | 0 | 0 |  |
| `src/92-hover.js` | 2.9 | [web] | 2 | 0 | 8 | 3 | 0 | 0 | 0 | 0 | 2 | 0 | 0 |  |
| `src/93-polygon.js` | 4.8 | [web] | 6 | 0 | 9 | 9 | 0 | 2 | 0 | 0 | 1 | 0 | 0 |  |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

The kit's own files sit at the top of this folder (other builds read them through `vehicle_bundle.py`, as the
catalog's furniture is read through `furniture_bundle.py`); `tools/audit_port.py` lists top-level files for this
kit and `kits/catalog`. `vehicle_bundle.py`, `build.py` and `verify.py` are tooling ([web]); `tex/` and
`materials.json` are data (the packed library maps, tools/textures/pack.py).

For Godot: the data (`KratorVehicles.list()`: tags, data, wheels, lamps) exports as is; the body and wheels cross
over as meshes (two body meshes per vehicle and one per wheel, wheel origins at the hubs, `steer_*` pivots), so a
Godot VehicleBody3D can take the wheel records as its VehicleWheel3D nodes (`steerRatio` scales a wheel's steering;
the tracked hab, `maxSteer` 0, wants a skid-steer controller instead, its road wheels `lift` above the belt). The
emissive lamp map (an 8-texel strip picked by uv) becomes an emission texture on the metal surface. The detail maps cross as the per-vertex slot
(`aDetS`, a CUSTOM0 value) and the kit's `tex/` sets; the belts as their loop data (`F.belts`: the hull path, pitch,
shoe size), so a Godot host can run them the same way.
