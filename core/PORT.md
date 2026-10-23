# core: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 799 (64%) | 107 (8%) | 52 (4%) | 163 (13%) | 137 (11%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `atmos/89-atmos-0-core.js` | 9.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 3 | 1 | 3 | 0 | 0 | 0 | the host passes dt (onFrame), view height and pixel ratio; becomes the Atmos autoload |
| `atmos/89-atmos-0p-presets.js` | 7.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | presets: one .tres per preset |
| `atmos/89-atmos-1-street.js` | 5.7 | [G shader] | 0 | 0 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 | 0 | per core/atmos/GODOT.md |
| `atmos/89-atmos-2-lights.js` | 7.4 | [G native] | 0 | 2 | 0 | 0 | 0 | 1 | 3 | 0 | 0 | 0 | 0 | OmniLight3D for the nearest, halo quads for the rest |
| `atmos/89-atmos-3-particles.js` | 8.9 | [G shader] | 0 | 0 | 0 | 0 | 0 | 0 | 11 | 0 | 0 | 0 | 0 | stateless particles: MultiMesh + vertex shader, or GPUParticles3D per the table |
| `atmos/89-atmos-3d-dust.js` | 5.3 | [G shader] | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 |  |
| `atmos/89-atmos-4-weather.js` | 12.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 3 | 12 | 0 | 0 | 0 | 0 | the state machine (weatherTarget, weatherStep, flashAt) is pure; the selector moved to 9-host |
| `atmos/89-atmos-5-dress.js` | 7.9 | [draw] | 0 | 2 | 0 | 0 | 0 | 2 | 0 | 3 | 0 | 0 | 0 | canvas painters: bake |
| `atmos/89-atmos-6-sewer.js` | 4.8 | [draw] | 0 | 2 | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 | 0 |  |
| `atmos/89-atmos-7-cull.js` | 3.9 | [G native] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 9 | 0 | 0 | 0 | retire: Godot culls |
| `atmos/89-atmos-8-export.js` | 3.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | folds into core/export/; download() moved to 9-host |
| `atmos/89-atmos-9-host.js` | 1.7 | [web] | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the Weather selector and the export download; moves to core/host/ |
| `atmos/89-atmos-a-waves.js` | 6.4 | [G shader] | 0 | 0 | 0 | 0 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | the wave field: the atmos_waves chunk becomes a .gdshaderinc (uniforms atm_wave_t, atm_wave_amp); PRESETS.waves and the JS twin (waveHeight, waveSlope: boats, buoys) are data |
| `atmos/89-atmos-b-skylight.js` | 4.9 | [G native] | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | the sky captured into scene.environment: WorldEnvironment builds this from its Sky; keep for the preview |
| `atmos/89-atmos-d-clouddeck.js` | 14.0 | [G shader] | 0 | 0 | 0 | 0 | 0 | 1 | 6 | 0 | 0 | 0 | 0 | split: the field, its twin and its chunk port (godot/tools/atmos_clouddeck.js); cloudDeck() is the three.js draw (godot/krator/clouddeck.gd) |
| `biome/10-core-head.js` | 11.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | its rng already equals KRAND.stream (test-rand.js); its sin-based h3/vnoise/fbm move to core/rand in the biome reseeding event |
| `biome/20-core-kit.js` | 33.4 | [draw] | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 8 | 0 | 0 | 0 | split: items and buckets on Float32 stores are data; the bake and LOD are three.js |
| `biome/30-core-foliage.js` | 18.7 | [G shader] | 1 | 4 | 0 | 0 | 0 | 6 | 15 | 0 | 0 | 0 | 0 | foliage card, bark, wind: the shader library |
| `biome/32-core-variants.js` | 1.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `biome/35-core-anim.js` | 7.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | fauna paths are data; the body shader is [G shader] |
| `biome/36-core-walker.js` | 5.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | walkers: a pose from the clock (loop, stops, gait); no three.js, no DOM |
| `biome/37-core-traps.js` | 5.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `biome/40-core-place.js` | 10.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | placement: ports to GDScript, tested tile for tile |
| `biome/42-core-export.js` | 25.3 | [G data] | 2 | 0 | 0 | 0 | 0 | 1 | 1 | 7 | 0 | 0 | 0 | pure data now: the one browser line, download(), moved to 43-core-export-host.js (2026-10-03); folds into core/export/ |
| `biome/43-core-export-host.js` | 3.7 | [web] | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | BIO.download(): a Blob and a link click, no caller yet; moves to core/host/ (Phase 1) |
| `biome/44-core-stage.js` | 14.0 | [draw] | 1 | 2 | 0 | 0 | 0 | 2 | 4 | 1 | 2 | 0 | 0 |  |
| `city/10-city-core.js` | 17.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `city/12-city-index.js` | 6.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `city/15-city-ground.js` | 5.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `city/20-city-plan.js` | 17.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 | the layout: no three.js, no DOM |
| `city/25-city-site.js` | 30.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 | the site layer (roles, zone, avenues, highways, the wall as records, ground deltas): records only, its drawing stays the world's |
| `city/31-city-steps-b.js` | 16.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 11 | 0 | 0 | 0 | 0 | 0 | the layout: no three.js, no DOM |
| `city/32-city-steps-c.js` | 15.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 | the layout: no three.js, no DOM |
| `city/33-city-strategies.js` | 17.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `city/34-city-radial.js` | 9.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 | the optional radial strategy (the toy's rings and spokes): the layout, no three.js |
| `city/40-city-kcity.js` | 9.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `city/50-city-host-streets.js` | 15.5 | [draw] | 32 | 5 | 0 | 0 | 0 | 4 | 0 | 3 | 0 | 0 | 0 | streets, overlay, labels, step visibility |
| `city/52-city-host-buildings.js` | 5.9 | [draw] | 5 | 0 | 0 | 0 | 0 | 2 | 0 | 2 | 0 | 0 | 0 | lots as instanced LOD prototypes |
| `clock/20-core-clock.js` | 2.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the world clock (GODOT-PLAN.md Phase 1); becomes WorldClock.gd, tested by test-clock.js |
| `edits/40-core-edits.js` | 10.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the edit log (ADD, MOVE, SET, REMOVE): no three.js, no DOM |
| `export/07-core-export.js` | 36.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | the krator-world container (EXPORT: register, world, check, glb, compact, terrain): no THREE, no DOM; test-export.js; read by godot/krator/world_import.gd (core/export/README.md) |
| `export/09-core-export-adapters.js` | 13.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | core/tags', core/atmos', the material records' and core/water's parts until those modules register themselves (water: the surfaces, bed bytes, the twin's probes); EXPORT.ground for a build without its own terrain part; EXPORT.groundLayers for a ground hook's world-uv layers |
| `export/10-core-export-scene.js` | 15.4 | [web] | 6 | 3 | 0 | 0 | 0 | 1 | 4 | 3 | 0 | 0 | 0 | the scene reader (lifted from Iziz's 94, 2026-10-20): reads a page's three.js scene at export time (canvas 2D only for the PNG bakes of procedural maps), draws nothing; Iziz's 94 and the isle demo's 62 use it |
| `furnish/50-core-furnish.js` | 8.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `furnish/52-core-furnish-draw.js` | 2.5 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `furnish/53-core-furnish-host.js` | 0.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `hamlet/10-hamlet-wood.js` | 4.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `hamlet/12-hamlet-gather.js` | 2.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `hamlet/20-hamlet-cultures.js` | 3.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `hamlet/30-hamlet-village.js` | 18.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 | the village generator: plain records; its "geom" hits are its own box and rectangle maths, no three.js |
| `hamlet/40-hamlet-felling.js` | 2.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `host/90-host-camera.js` | 11.6 | [web] | 7 | 0 | 0 | 10 | 0 | 2 | 0 | 0 | 1 | 0 | 0 |  |
| `host/91-host-loop.js` | 8.2 | [web] | 3 | 0 | 1 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `host/92-host-panel.js` | 14.7 | [web] | 0 | 0 | 10 | 8 | 0 | 0 | 0 | 0 | 1 | 3 | 0 | split: data inside host code |
| `host/93-host-inspect.js` | 9.0 | [web] | 2 | 0 | 12 | 4 | 1 | 2 | 0 | 0 | 1 | 0 | 0 | the inspector over core/tags records (I, click): host shell |
| `host/93-host-stocks.js` | 21.8 | [web] | 1 | 0 | 12 | 7 | 6 | 1 | 0 | 0 | 0 | 0 | 0 | what things hold and the stocks panel (O) over o.holds (core/simulation): host shell; Voth's 56e is the standard |
| `host/94-host-marks.js` | 12.0 | [web] | 7 | 2 | 10 | 8 | 0 | 3 | 0 | 0 | 1 | 3 | 2 | marks (P): host shell; the marks file is plain data |
| `host/94-host-polytool.js` | 5.7 | [web] | 6 | 0 | 5 | 5 | 0 | 2 | 0 | 0 | 1 | 0 | 0 |  |
| `host/95-host-probe.js` | 4.2 | [web] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 |  |
| `host/96-host-pictures.js` | 6.1 | [web] | 4 | 2 | 7 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the picture menu, drawn off screen: host shell |
| `host/97-host-minimap.js` | 3.4 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the minimap panel from the records (KMAP.mount, the M key): host shell |
| `host/98-host-edit.js` | 19.9 | [web] | 6 | 0 | 5 | 10 | 2 | 5 | 0 | 0 | 1 | 5 | 1 | edit modes: host shell; every edit a core/edits op (the log is [G data]) |
| `host/99-host-cutaway.js` | 7.1 | [web] | 2 | 0 | 4 | 4 | 1 | 5 | 1 | 0 | 0 | 0 | 0 | the cutaway (X), clipping planes and the storey bar: host shell |
| `lod/09-lod.js` | 32.7 | [G native] | 0 | 0 | 6 | 3 | 8 | 14 | 0 | 10 | 3 | 0 | 0 | keep for the preview; no port |
| `lod/97-lod-auto.js` | 0.8 | [G native] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `mask/25-core-mask.js` | 11.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the placement raster: KMASK.canvas, hard-edged by pixel centre; test-mask.js, GDScript twin kmask.gd (passing in Godot 4.5). Used by the Iziz, Dalab, Erewhon and Roketstad cities |
| `mask/26-core-mask-xform.js` | 5.5 | [draw] | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | canvas painters: TEX.def or bake |
| `materials/20-textures.js` | 7.2 | [draw] | 3 | 9 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the painter set behind TEX.def (Phase 3) |
| `materials/22-materials.js` | 3.4 | [G shader] | 21 | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | the MAT table becomes the material vocabulary; glass Fresnel is a library shader |
| `materials/68-mat-v5.js` | 1.1 | [G shader] | 11 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | water, spray: library shaders |
| `materials/opt/69a-world-uv.js` | 2.1 | [G native] | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | world-unit UVs: uv1_triplanar / world-space UV in Godot |
| `materials/record/23-mat-record.js` | 5.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | KMAT: the material record vocabulary (Phase 3), build adapters, the library pack registry and table(); test-record.js |
| `materials/record/24-tex-def.js` | 2.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | TEX: procedural textures as records (kind, size, seed, params) and their pure pixel functions; canvas kinds bake to PNG |
| `materials/record/25-matlib-host.js` | 6.3 | [web] | 5 | 0 | 0 | 0 | 0 | 0 | 10 | 0 | 0 | 0 | 0 | the browser half: ?mat=proc, data-URL images to THREE textures, _texPending, the specular hook (Godot's specular); moves to core/host/ |
| `materials/record/26-matlib-bind.js` | 4.2 | [G shader] | 2 | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 |  |
| `minimap/88-core-minimap.js` | 10.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the records, relief, paint onto a given context, and export(): a Control's _draw() in Godot. Split 2026-10-02: the panel is 88a |
| `minimap/88a-core-minimap-host.js` | 3.8 | [web] | 0 | 5 | 5 | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the browser panel, the M key, hover and click; moves to core/host/ (Phase 1) |
| `ports/44-core-ports.js` | 7.5 | [draw] | 2 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | PORT marks for kits/beast-riders: bucket ranges are data; the box measure reads three.js |
| `rand/08-core-rand.js` | 4.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | one stream (the lineages' mulberry32), an integer hash, noise: golden.json, test-rand.js, test_rand.py; GDScript twin krand.gd (passing in Godot 4.5 since 2026-10-05). Used by Ys's city |
| `sched/20-core-sched.js` | 6.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `simulation/77-sim-0-core.js` | 9.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `simulation/77-sim-1-world.js` | 3.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `simulation/77-sim-2-places.js` | 9.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `simulation/77-sim-3-actors.js` | 32.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `simulation/77-sim-4-nav.js` | 9.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `simulation/77-sim-5-motion.js` | 4.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `simulation/77-sim-5r-routes.js` | 11.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `simulation/77-sim-6-economy.js` | 28.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the economy: goods, stores, production by worked hour and efficiency, carts, consumption, days left, imports |
| `simulation/77-sim-6-items.js` | 23.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | items, inventory, the six slots, wear, errands to the nearest seller, meals from a household store (opt-in: SIM.items) |
| `simulation/77-sim-6-needs.js` | 13.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | needs, happiness, efficiency, loyalty; the free-time clause and the interrupt of SIM.desire (opt-in: SIM.needs) |
| `simulation/77-sim-6-population.js` | 6.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `simulation/77-sim-6-trade.js` | 11.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `simulation/77-sim-7-lod.js` | 4.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the levels: SIM.level(s, 'abstract' or 'presented'), a town nobody watches on its books only; raising it (opt-in) |
| `simulation/77-sim-7-stocks.js` | 19.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | what things hold and the settlement's stocks: SIM.contents, SIM.stocks (by state, the daily snapshot's change and flows, the low and out marks), SIM.holders; read only |
| `simulation/77-sim-8-export.js` | 4.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `simulation/77-sim-9-debug.js` | 5.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `sockets/37-sockets.js` | 2.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | socket declarations and the pack registry |
| `sockets/38-symbols.js` | 12.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | canvas 2D symbol painters: bake to PNG |
| `sockets/80-cultures.js` | 20.5 | [draw] | 2 | 1 | 0 | 0 | 0 | 19 | 0 | 0 | 0 | 0 | 0 | split: the packs are data; the drawing kit bakes |
| `space/20-core-space.js` | 4.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `tags/50-core-tags.js` | 18.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the tag registry: ids, the KRAND uid (GDScript twin ktags.gd, passing in Godot 4.5), norm, query, audit, export; test-tags.js. Used by Yuni |
| `tags/52-core-tags-vocab.js` | 9.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the one vocabulary; the catalog's lists copied, test-tags.js fails on drift |
| `tags/53-core-tags-host.js` | 2.6 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the inspector's label text; the inspector hook goes to core/host (Phase 1) |
| `terrain/30-core-field.js` | 13.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `terrain/31-core-field-brush.js` | 4.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the field's ground brushes (raise, lower, flatten, smooth), snapshot and replay: plain data on KFIELD's heights; a GDScript twin to come |
| `terrain/36-core-carve.js` | 13.7 | [G data] | 0 | 0 | 0 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | split: a timing helper reads performance.now (line 103); floors and blockers export (Godot order 1) |
| `terrain/37-core-stacks.js` | 22.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `terrain/38-core-relief.js` | 9.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `terrain/39-core-cavern.js` | 34.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `terrain/40-core-basin.js` | 11.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `terrain/41-core-scour.js` | 13.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `walk/20-core-walk.js` | 11.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | floors and blockers; export() is navigation-mesh source and collision boxes |
| `walk/box/24-core-walk-box.js` | 5.7 | [web] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `water/20-core-water.js` | 21.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | WATER: the six kinds, the CPU twins, ride, export; becomes a Water autoload (core/water/README.md, "Godot") |
| `water/21-core-water-shore.js` | 12.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the shore grid (the flood, the exact distance transform, the bytes) and the shore's twins (shoaling, breakers, the beach); GDScript twin in godot/krator/water.gd (KWater.shore_grid) |
| `water/22-core-water-flow.js` | 11.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | flow ribbons, fall curtains, plunge pools, still meshes as arrays and their shading twins; KWater builds the same meshes |
| `water/50-core-water-draw.js` | 21.1 | [G shader] | 0 | 0 | 0 | 0 | 0 | 1 | 13 | 1 | 0 | 0 | 0 | the GLSL becomes water_open.gdshader (generated, like atmos_waves); the CDLOD selection (WATER.cdlod) is data and ports to GDScript with a MultiMesh |
| `water/51-core-water-kinds.js` | 18.0 | [G shader] | 0 | 0 | 0 | 0 | 0 | 4 | 30 | 0 | 0 | 0 | 0 | flow, fall, plunge, still and wet-ground drawing; the GLSL is godot/shaders/lib/water_kinds.gdshaderinc and water_*.gdshader |

## Notes

Tags set by hand from `GODOT-PLAN.md` section 5 (2026-10-02). The "split" rows each hold one or two browser
lines inside otherwise engine-neutral code: the download helpers and the reads of `performance.now` for timing.
They move to `core/host/` in Phase 1; until then the lint reports them as warnings. `core/atmos` was split on
2026-10-02: its browser lines are in `89-atmos-9-host.js` ([web]), and the host passes time in as `dt`.
