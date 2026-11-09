# biomes/throne: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 57 (18%) | 22 (7%) | 3 (1%) | 52 (16%) | 193 (59%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/45-host-stage.js` | 8.3 | [web] | 7 | 0 | 3 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/46-biome-throne-flows.js` | 6.0 | [G data] | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | the flow model: pure maths over the host's baseH, writes typed arrays (the THREE count is a comment) |
| `src/47-host-land.js` | 9.8 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | host binding: the showcase's flows, the cuts, the fields cache, BIO.init |
| `src/50-biome-throne-species.js` | 96.9 | [draw] | 0 | 12 | 0 | 0 | 0 | 13 | 3 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/55-biome-throne-trees.js` | 87.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 34 | 0 | 0 | 0 | 0 | 0 |  |
| `src/60-biome-throne-floor.js` | 43.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/70-biome-throne.js` | 8.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/80-host-core.js` | 1.1 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the final rebuild's page switches from the query (?kground, ?imp, ?lodmerge, ?lodfade): host only (2026-11-02) |
| `src/82-host-sky.js` | 0.8 | [G native] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | shader hook inside |
| `src/83-host-heat.js` | 6.1 | [G shader] | 8 | 0 | 0 | 0 | 0 | 1 | 6 | 0 | 0 | 0 | 0 |  |
| `src/84-host-ground.js` | 16.2 | [G shader] | 12 | 4 | 0 | 0 | 0 | 2 | 11 | 0 | 0 | 0 | 0 | the ground's library layers and the night glow (onBeforeCompile), the steam points (the water moved to 89w, core/water, 2026-10-26) |
| `src/89-host-sky.js` | 2.3 | [G native] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89a-host-atmos.js` | 1.5 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | core/atmos bound on the page's renderer, camera and light mode (ATMOS.bindHost, bindWeather): host only |
| `src/89w-host-water.js` | 3.2 | [draw] | 4 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | station 1's water on core/water (2026-10-26): the acid lake a WATER.still, the hot pools WATER.spring; the records cross over through WATER.export |
| `src/89x-host-fields.js` | 6.0 | [draw] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | the water's fields, KTHERM and BIO.env (plain records a port reads through WATER.fields and KTHERM.export) and the ground's wet band (a KHOOK layer) (2026-11-02) |
| `src/89z-host-build.js` | 1.0 | [web] | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/89zz-host-core.js` | 8.1 | [web] | 1 | 0 | 0 | 0 | 2 | 0 | 2 | 0 | 0 | 0 | 0 | the universal set after the bake: wind, alpha to coverage, the impostors' bake, height fog, rain cover, the horizon, the snow's bare ground (2026-11-02) |
| `src/98z-host-core.js` | 1.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the reflections switch (WATER.mirrorSwitch, its panel button) and the runtime LOD tick on core/host: host only (2026-11-02) |
| `src/99-host-take.js` | 16.8 | [web] | 2 | 0 | 0 | 0 | 0 | 1 | 0 | 3 | 0 | 0 | 0 | the page handed to core/host (KHOST.take): the preset views, the inspector's words, the budgets and the kit's own checks; replaced 90-host-camera.js and 91-host-probe.js |
| `src/99-host-tz-core.js` | 3.0 | [web] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | the environmental fields' checks (BIO.envCheck, WATER.edgeAudit) added to window._api's hostChecks: host only (2026-11-02) |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

(none yet: the split lists and the overrides go here)
