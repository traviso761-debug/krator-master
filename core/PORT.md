# core: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 244 (53%) | 60 (13%) | 52 (11%) | 17 (4%) | 89 (19%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `atmos/89-atmos-0-core.js` | 9.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 3 | 1 | 3 | 0 | 0 | 0 | the host passes dt (onFrame), view height and pixel ratio; becomes the Atmos autoload |
| `atmos/89-atmos-0p-presets.js` | 7.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | presets: one .tres per preset |
| `atmos/89-atmos-1-street.js` | 5.7 | [G shader] | 0 | 0 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 | 0 | per core/atmos/GODOT.md |
| `atmos/89-atmos-2-lights.js` | 7.4 | [G native] | 0 | 2 | 0 | 0 | 0 | 1 | 3 | 0 | 0 | 0 | 0 | OmniLight3D for the nearest, halo quads for the rest |
| `atmos/89-atmos-3-particles.js` | 8.9 | [G shader] | 0 | 0 | 0 | 0 | 0 | 0 | 11 | 0 | 0 | 0 | 0 | stateless particles: MultiMesh + vertex shader, or GPUParticles3D per the table |
| `atmos/89-atmos-4-weather.js` | 12.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 3 | 12 | 0 | 0 | 0 | 0 | the state machine (weatherTarget, weatherStep, flashAt) is pure; the selector moved to 9-host |
| `atmos/89-atmos-5-dress.js` | 7.9 | [draw] | 0 | 2 | 0 | 0 | 0 | 2 | 0 | 3 | 0 | 0 | 0 | canvas painters: bake |
| `atmos/89-atmos-6-sewer.js` | 4.8 | [draw] | 0 | 2 | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 | 0 |  |
| `atmos/89-atmos-7-cull.js` | 3.9 | [G native] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 9 | 0 | 0 | 0 | retire: Godot culls |
| `atmos/89-atmos-8-export.js` | 3.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | folds into core/export/; download() moved to 9-host |
| `atmos/89-atmos-9-host.js` | 1.7 | [web] | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the Weather selector and the export download; moves to core/host/ |
| `atmos/89-atmos-a-waves.js` | 6.4 | [G shader] | 0 | 0 | 0 | 0 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | the wave field: the atmos_waves chunk becomes a .gdshaderinc (uniforms atm_wave_t, atm_wave_amp); PRESETS.waves and the JS twin (waveHeight, waveSlope: boats, buoys) are data |
| `atmos/89-atmos-b-skylight.js` | 4.9 | [G native] | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | the sky captured into scene.environment: WorldEnvironment builds this from its Sky; keep for the preview |
| `atmos/89-atmos-d-clouddeck.js` | 14.0 | [G shader] | 0 | 0 | 0 | 0 | 0 | 1 | 6 | 0 | 0 | 0 | 0 | split: the field, its twin and its chunk port (godot/tools/atmos_clouddeck.js); cloudDeck() is the three.js draw (godot/krator/clouddeck.gd) |
| `biome/10-core-head.js` | 9.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | its rng already equals KRAND.stream (test-rand.js); its sin-based h3/vnoise/fbm move to core/rand in the biome reseeding event |
| `biome/20-core-kit.js` | 23.4 | [draw] | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 8 | 0 | 0 | 0 | split: items and buckets on Float32 stores are data; the bake and LOD are three.js |
| `biome/30-core-foliage.js` | 16.5 | [G shader] | 1 | 4 | 0 | 0 | 0 | 5 | 10 | 0 | 0 | 0 | 0 | foliage card, bark, wind: the shader library |
| `biome/35-core-anim.js` | 7.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | fauna paths are data; the body shader is [G shader] |
| `biome/40-core-place.js` | 8.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | placement: ports to GDScript, tested tile for tile |
| `biome/42-core-export.js` | 10.5 | [G data] | 2 | 0 | 0 | 0 | 0 | 1 | 1 | 4 | 0 | 0 | 0 | pure data now: the one browser line, download(), moved to 43-core-export-host.js (2026-10-03); folds into core/export/ |
| `biome/43-core-export-host.js` | 2.9 | [web] | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | BIO.download(): a Blob and a link click, no caller yet; moves to core/host/ (Phase 1) |
| `biome/44-core-stage.js` | 14.0 | [draw] | 1 | 2 | 0 | 0 | 0 | 2 | 4 | 1 | 2 | 0 | 0 |  |
| `clock/20-core-clock.js` | 2.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the world clock (GODOT-PLAN.md Phase 1); becomes WorldClock.gd, tested by test-clock.js |
| `furnish/50-core-furnish.js` | 7.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `furnish/52-core-furnish-draw.js` | 2.4 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `furnish/53-core-furnish-host.js` | 0.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
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
| `rand/08-core-rand.js` | 4.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | one stream (the lineages' mulberry32), an integer hash, noise: golden.json, test-rand.js, test_rand.py; GDScript twin krand.gd (passing in Godot 4.5 since 2026-10-05). Used by Ys's city |
| `sched/20-core-sched.js` | 6.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `simulation/77-sim-0-core.js` | 8.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `simulation/77-sim-1-world.js` | 2.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `simulation/77-sim-2-places.js` | 4.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `simulation/77-sim-3-actors.js` | 20.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `simulation/77-sim-4-nav.js` | 7.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `simulation/77-sim-5-motion.js` | 3.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `simulation/77-sim-6-population.js` | 4.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `simulation/77-sim-8-export.js` | 2.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `simulation/77-sim-9-debug.js` | 5.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `sockets/37-sockets.js` | 2.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | socket declarations and the pack registry |
| `sockets/38-symbols.js` | 9.3 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | canvas 2D symbol painters: bake to PNG |
| `sockets/80-cultures.js` | 14.8 | [draw] | 2 | 1 | 0 | 0 | 0 | 17 | 0 | 0 | 0 | 0 | 0 | split: the packs are data; the drawing kit bakes |
| `tags/50-core-tags.js` | 11.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the tag registry: ids, the KRAND uid (GDScript twin ktags.gd, passing in Godot 4.5), norm, query, audit, export; test-tags.js. Used by Yuni |
| `tags/52-core-tags-vocab.js` | 6.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the one vocabulary; the catalog's lists copied, test-tags.js fails on drift |
| `tags/53-core-tags-host.js` | 2.6 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the inspector's label text; the inspector hook goes to core/host (Phase 1) |
| `terrain/30-core-field.js` | 13.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | the terrain field (KFIELD): a baked heightmap, water surfaces, land cover, krator-field export; twin kfield.gd |
| `terrain/36-core-carve.js` | 13.7 | [G data] | 0 | 0 | 0 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | split: a timing helper reads performance.now (line 103); floors and blockers export (Godot order 1) |
| `terrain/38-core-relief.js` | 9.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `walk/20-core-walk.js` | 7.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | floors and blockers; export() is navigation-mesh source and collision boxes |

## Notes

Tags set by hand from `GODOT-PLAN.md` section 5 (2026-10-02). The "split" rows each hold one or two browser
lines inside otherwise engine-neutral code: the download helpers and the reads of `performance.now` for timing.
They move to `core/host/` in Phase 1; until then the lint reports them as warnings. `core/atmos` was split on
2026-10-02: its browser lines are in `89-atmos-9-host.js` ([web]), and the host passes time in as `dt`.
