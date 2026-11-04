# biomes/godthrone: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 18 (14%) | 0 (0%) | 7 (5%) | 50 (39%) | 54 (42%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/35t-godthrone-strata.js` | 2.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/44a-host-station.js` | 1.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the station: the square a page draws and what it builds (stations/wall/ has the wall's) |
| `src/45-host-stage.js` | 4.7 | [web] | 6 | 0 | 3 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/45a5-host-region.js` | 1.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/45b-host-model.js` | 13.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 | the summit's ground model (the caldera, the pit, the vent, KSTRATA, MODEL.fieldsAt): plain functions; stations/flank/ has the flank's |
| `src/45c-host-field.js` | 8.3 | [web] | 0 | 0 | 0 | 0 | 2 | 2 | 0 | 0 | 0 | 0 | 0 | split: the KFIELD bake and the 20 m field cache are data; BIO.init is the page's |
| `src/50-biome-godthrone-species.js` | 7.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/60-biome-godthrone-ground.js` | 5.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 | 0 |  |
| `src/70-biome-godthrone.js` | 1.3 | [web] | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/82-host-sky.js` | 4.0 | [G native] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/84-host-ground.js` | 14.9 | [web] | 12 | 3 | 0 | 0 | 2 | 4 | 7 | 0 | 0 | 0 | 0 |  |
| `src/86-host-portal.js` | 2.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 |  |
| `src/88-host-build.js` | 1.6 | [web] | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/89-host-sky.js` | 1.8 | [G native] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89a-host-atmos.js` | 2.5 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the page's binding of core/atmos (bindHost, bindWeather, airLoad): host code, not data |
| `src/89b-host-vent.js` | 8.5 | [draw] | 3 | 0 | 0 | 0 | 0 | 1 | 3 | 0 | 0 | 0 | 0 |  |
| `src/89c-host-lake.js` | 8.1 | [draw] | 3 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | split: the lake's model (V(L), Q(t), at(day)) is data; the surface, the hazard's state and the re-bake are the page's |
| `src/89d-host-overflow.js` | 15.8 | [web] | 0 | 0 | 3 | 0 | 9 | 0 | 0 | 0 | 0 | 0 | 0 | the lake's overflow on core/terrain KLAVA (?overflow): the pond's hypsometry and the scaled eruption are data; the sim is KLAVA (klava.gd); the mesh edits and the checkbox are the page's |
| `src/89zz-host-shadow.js` | 1.1 | [G native] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/99-host-take.js` | 22.4 | [draw] | 2 | 0 | 6 | 2 | 0 | 0 | 0 | 3 | 0 | 0 | 0 |  |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

- `45-host-stage.js` holds the caldera as data (`wallAt`, `pitAt`, `fissAt`, `coneAt`, `baseH`, the KSTRATA stack, the KFIELD bake) beside the renderer: split it into a `[G data]` stage fragment and the host's binding when the Godthrone moves to Godot (its ground already crosses as `field` in the export).
- `60-biome-godthrone-ground.js` places by `KRAND.hash` per cell: its records are the export's `items`.

(none yet: the split lists and the overrides go here)
