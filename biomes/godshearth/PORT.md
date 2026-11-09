# biomes/godshearth: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|

## Notes

**Godshearth has no `src/`.** Its pages are the geyser kit's (`biomes/geyser/src/` and its field stage, `biomes/geyser/stations/field/`, tagged in
`biomes/geyser/PORT.md`) and the Hearths' (`biomes/hearths/src/`, tagged in `biomes/hearths/PORT.md`), read in place, with this kit's station fragments on
top. `tools/audit_port.py` and `tools/check_port.py` read `src/` and `targets/` only, so the stations' tags are kept here by hand.

| Fragment | Tag | Note |
|---|---|---|
| `stations/prismbasin/44s-host-site.js` | [web] | split: the site's numbers, the land (`ghLand`, `shoreX`), the vent line and the field's spec are data; the take's views and checks and the ground's paint (THREE colours, GLSL layer weights) are host |
| `stations/prismbasin/47b-host-heat.js` | [G data] | the KTHERM field (soil, the vent line), its bake, the fumaroles' records and heat hazards: plain records on core/terrain and core/tags |
| `stations/prismbasin/87-host-hearths.js` | [G data] | HEARTH.layout's calls (records and BIO.put only), the dead spring's record; the checks (GHC) read the page's records |
| `stations/prismbasin/89w-host-water.js` | [draw] | the hot lake: WATER.open (data) and WATER.draw (the mesh) |
| `stations/prismbasin/89x-host-air.js` | [web] | the vent line's steam (core/atmos particles) and the engine's write a frame (HEARTH.work to BIO.breathState) |
