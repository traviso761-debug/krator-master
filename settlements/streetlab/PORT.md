# settlements/streetlab: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 248 (46%) | 0 (0%) | 0 (0%) | 170 (31%) | 126 (23%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `targets/voth-city/00-head.html` | 8.2 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `targets/voth-city/15-vc-tune.js` | 20.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/voth-city/30-vc-site.js` | 35.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 | the site read into the plan: ground, landmarks, districts, avenues, highways, wall |
| `targets/voth-city/31-vc-voth.js` | 29.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 79 | 0 | 0 | 0 | 0 | 0 | where Voth's own builders run; they push primitives (VOTH.PRIMS), no three.js |
| `targets/voth-city/31b-vc-chinampa.js` | 8.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 18 | 0 | 0 | 0 | 0 | 0 | the chinampa beds as primitive records (VOTH.PRIMS shim) and flora and hut records; KRAND per bed, no three.js |
| `targets/voth-city/32-vc-city.js` | 11.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 | wealth, lot mixes, street passes: layout data |
| `targets/voth-city/33-vc-country.js` | 61.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 65 | 0 | 0 | 0 | 0 | 0 | monastery, clan compounds, canton decks, the country: lots, fields and Voth primitives (VOTH.PRIMS), no three.js |
| `targets/voth-city/34-vc-transit.js` | 27.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 10 | 0 | 0 | 0 | 0 | 0 | elephant bug stations and lay-bys, ferry piers, the ferry and elephant bug lines as core/simulation records (places, ports, transport routes, nav grids), no three.js |
| `targets/voth-city/35-vc-steps.js` | 4.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the step list and the runner; applies the owner's edits (site/voth-city-edits.json) |
| `targets/voth-city/36-vc-census.js` | 6.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the census: residents and workplaces from the plan, no three.js |
| `targets/voth-city/37-vc-light.js` | 11.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 26 | 0 | 0 | 0 | 0 | 0 | power houses, who has electric light, street-lamp sockets laid with each street and drawn from Voth's primitives, no three.js |
| `targets/voth-city/38-vc-flora.js` | 6.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the swbay biome's mask (its own grid, no canvas), climate fields and LOD spine on the city; the host builds it |
| `targets/voth-city/39-vc-furnish.js` | 14.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | park and plaza furniture (Voth catalog benches, statues, shrines, obelisk, braziers) as records; the host draws them |
| `targets/voth-city/40-vc-interiors.js` | 30.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 23 | 0 | 0 | 0 | 0 | 0 | the canton interiors planned as records (storeys, rooms, halls, tunnels, stairs, walls, floors) and their KWALK registry; prims for the portals |
| `targets/voth-city/55-vc-host.js` | 49.0 | [web] | 33 | 4 | 11 | 16 | 2 | 14 | 0 | 9 | 1 | 2 | 0 |  |
| `targets/voth-city/56-vc-interiors-host.js` | 16.5 | [web] | 9 | 0 | 0 | 2 | 2 | 1 | 1 | 6 | 0 | 0 | 0 | the interiors furnished (kits/interiors) and drawn instanced per storey; the cutaway's clipping planes and its keys |
| `targets/voth-city/57-vc-marks.js` | 10.5 | [web] | 8 | 0 | 8 | 12 | 0 | 3 | 0 | 0 | 1 | 2 | 2 |  |
| `targets/voth-city/58-vc-tools.js` | 25.6 | [web] | 14 | 1 | 7 | 15 | 0 | 5 | 0 | 0 | 2 | 1 | 1 | the dev tools: Paths (Voth's pathviz), the pin (G, F), the plan editor |
| `targets/voth-city/59-vc-flora-edit.js` | 10.4 | [web] | 3 | 0 | 2 | 2 | 0 | 1 | 0 | 2 | 0 | 0 | 0 | the editor's flora mode: pick, delete (hide the tree's instances and triangles), plant; the swbay veto and record hooks |
| `targets/voth-city/98-start.js` | 1.6 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | runs SL.layout(), then the host |
| `targets/voth-city/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `targets/voth-site/00-head.html` | 4.6 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `targets/voth-site/10-site-model.js` | 18.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/voth-site/20-site-cantons.js` | 59.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 14 | 0 | 0 | 0 | 0 | 0 | CANT: the captured cantons read into levels; bridges, causeways, flights, doors, falls planned as records; KWALK and KTAGS registries; prims |
| `targets/voth-site/50-site-scene.js` | 26.8 | [draw] | 29 | 6 | 0 | 0 | 1 | 18 | 8 | 2 | 2 | 0 | 0 |  |
| `targets/voth-site/55-site-tools.js` | 42.1 | [web] | 11 | 2 | 20 | 24 | 1 | 4 | 0 | 0 | 1 | 3 | 1 |  |
| `targets/voth-site/98-start.js` | 1.6 | [web] | 1 | 2 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |  |
| `targets/voth-site/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

(none yet: the split lists and the overrides go here)
