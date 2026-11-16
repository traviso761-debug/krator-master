# core: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 2300 (48%) | 516 (11%) | 116 (2%) | 1143 (24%) | 762 (16%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `anomaly/20-core-anomaly.js` | 16.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `anomaly/host/90-anomaly-walker.js` | 2.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `atmos/89-atmos-0-core.js` | 11.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 3 | 1 | 3 | 0 | 0 | 0 | the host passes dt (onFrame), view height and pixel ratio; becomes the Atmos autoload |
| `atmos/89-atmos-0p-presets.js` | 7.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | presets: one .tres per preset |
| `atmos/89-atmos-1-street.js` | 5.6 | [G shader] | 0 | 0 | 0 | 0 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | per core/atmos/GODOT.md |
| `atmos/89-atmos-2-lights.js` | 7.4 | [G native] | 0 | 2 | 0 | 0 | 0 | 1 | 3 | 0 | 0 | 0 | 0 | OmniLight3D for the nearest, halo quads for the rest |
| `atmos/89-atmos-3-particles.js` | 8.9 | [G shader] | 0 | 0 | 0 | 0 | 0 | 0 | 11 | 0 | 0 | 0 | 0 | stateless particles: MultiMesh + vertex shader, or GPUParticles3D per the table |
| `atmos/89-atmos-3d-dust.js` | 5.4 | [G shader] | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 |  |
| `atmos/89-atmos-4-weather.js` | 13.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 3 | 12 | 0 | 0 | 0 | 0 | the state machine (weatherTarget, weatherStep, flashAt) is pure; the selector moved to 9-host |
| `atmos/89-atmos-5-dress.js` | 7.9 | [draw] | 0 | 2 | 0 | 0 | 0 | 2 | 0 | 3 | 0 | 0 | 0 | canvas painters: bake |
| `atmos/89-atmos-6-sewer.js` | 4.8 | [draw] | 0 | 2 | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 | 0 |  |
| `atmos/89-atmos-7-cull.js` | 3.9 | [G native] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 9 | 0 | 0 | 0 | retire: Godot culls |
| `atmos/89-atmos-8-export.js` | 3.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | folds into core/export/; download() moved to 9-host |
| `atmos/89-atmos-9-host.js` | 1.7 | [web] | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the Weather selector and the export download; moves to core/host/ |
| `atmos/89-atmos-a-waves.js` | 6.4 | [G shader] | 0 | 0 | 0 | 0 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | the wave field: the atmos_waves chunk becomes a .gdshaderinc (uniforms atm_wave_t, atm_wave_amp); PRESETS.waves and the JS twin (waveHeight, waveSlope: boats, buoys) are data |
| `atmos/89-atmos-b-skylight.js` | 4.9 | [G native] | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | the sky captured into scene.environment: WorldEnvironment builds this from its Sky; keep for the preview |
| `atmos/89-atmos-d-clouddeck.js` | 14.0 | [G shader] | 0 | 0 | 0 | 0 | 0 | 1 | 6 | 0 | 0 | 0 | 0 | split: the field, its twin and its chunk port (godot/tools/atmos_clouddeck.js); cloudDeck() is the three.js draw (godot/krator/clouddeck.gd) |
| `atmos/fx/89-atmos-fx-acid.js` | 9.0 | [G shader] | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 |  |
| `atmos/fx/89-atmos-fx-airload.js` | 9.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `atmos/fx/89-atmos-fx-ashplume.js` | 13.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | opt-in: ATMOS.ashPlume, a volcanic plume (fog, under for airLoad ashAt, shade, deposit, KFAR sources); export/load for Godot; fx/test-ashplume.js |
| `atmos/fx/89-atmos-fx-deckday.js` | 4.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | opt-in (subfolder): ATMOS.deckLevel (the cloud deck's level by the hour and weather), deckDay, deckIn, provideDeck (visibility in the cloud) |
| `atmos/fx/89-atmos-fx-dustseason.js` | 2.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `atmos/fx/89-atmos-fx-gustsheen.js` | 3.6 | [G shader] | 0 | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 |  |
| `atmos/fx/89-atmos-fx-katabatic.js` | 3.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `atmos/fx/89-atmos-fx-lava.js` | 10.9 | [G shader] | 1 | 0 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 |  |
| `atmos/fx/89-atmos-fx-lightning.js` | 6.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `atmos/fx/89-atmos-fx-localtime.js` | 12.9 | [draw] | 0 | 0 | 0 | 0 | 0 | 1 | 3 | 1 | 0 | 0 | 0 |  |
| `atmos/fx/89-atmos-fx-plumes.js` | 8.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 1 | 3 | 1 | 0 | 0 | 0 |  |
| `atmos/fx/89-atmos-fx-radiation.js` | 15.0 | [G shader] | 0 | 0 | 0 | 0 | 0 | 2 | 12 | 0 | 0 | 0 | 0 |  |
| `atmos/fx/89-atmos-fx-raincover.js` | 9.8 | [draw] | 0 | 0 | 0 | 0 | 0 | 1 | 2 | 2 | 0 | 0 | 0 |  |
| `atmos/fx/89-atmos-fx-rainwall.js` | 8.0 | [G shader] | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 |  |
| `atmos/fx/89-atmos-fx-shimmer.js` | 7.0 | [G shader] | 0 | 0 | 0 | 0 | 0 | 1 | 5 | 0 | 0 | 0 | 0 | opt-in (subfolder): ATMOS.shimmer, the heat shimmer post pass over a KTHERM bake (core/host o.draw), shimmerK its JS twin; a full-screen quad shader in Godot |
| `atmos/fx/89-atmos-fx-slag.js` | 5.0 | [G shader] | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 |  |
| `atmos/fx/89-atmos-fx-slopewind.js` | 16.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | opt-in: ATMOS.slopeWind, katabatic/anabatic/gap wind and cold pools on baked grids; attach to ATMOS.windAt, provide KHAZ temperature; fx/test-slopewind.js |
| `atmos/fx/89-atmos-fx-sludge.js` | 11.2 | [G shader] | 0 | 0 | 0 | 0 | 0 | 1 | 8 | 0 | 0 | 0 | 0 |  |
| `atmos/fx/89-atmos-fx-smokegroups.js` | 2.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | opt-in (subfolder): ATMOS.smokeGroups, one smoke cloud a group with its own strength (the gills' steam on the breath); Godot scales the group's GPUParticles3D alpha |
| `atmos/fx/89-atmos-fx-snowcover.js` | 11.0 | [G shader] | 0 | 0 | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 0 | 0 |  |
| `atmos/fx/89-atmos-fx-sparks.js` | 11.8 | [draw] | 0 | 0 | 0 | 0 | 0 | 2 | 6 | 2 | 0 | 0 | 0 |  |
| `atmos/fx/89-atmos-fx-spill.js` | 5.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `atmos/fxdemo/src/10-demo.js` | 16.6 | [web] | 0 | 0 | 4 | 1 | 3 | 22 | 0 | 1 | 0 | 0 | 0 |  |
| `atmos/host/89-atmos-c-hostbind.js` | 3.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `atmos/host/89-atmos-e-weatherhost.js` | 6.7 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `atmos/host/89-atmos-h-skyhost.js` | 22.2 | [G native] | 0 | 0 | 0 | 0 | 1 | 1 | 8 | 0 | 0 | 0 | 0 | the sky as a three.js background pass driving the page light; Godot: the Sky material and krator/sky.gd |
| `atmos/host/89-atmos-i-skybiome.js` | 7.9 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `atmos/host/89-atmos-j-heightfog.js` | 11.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 3 | 7 | 0 | 0 | 0 | 0 |  |
| `atmos/placeholder/80-sky-hash.js` | 0.5 | [G native] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `atmos/placeholder/81-sky.js` | 9.5 | [G native] | 23 | 4 | 0 | 0 | 0 | 3 | 6 | 0 | 0 | 0 | 0 | shader hook inside |
| `atmos/sky/89-atmos-e-skymodel.js` | 28.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the sky model (SKY-PLAN.md): sun, the lifted giant, moons, stars, calendar, ridge profiles; krator/sky.gd twin |
| `atmos/sky/89-atmos-f-skypresets.js` | 10.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the standard sky preset and the colour script by sun altitude (skyLook): Environment and lights in Godot |
| `atmos/sky/89-atmos-g-sky.js` | 52.1 | [G shader] | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | the atmos_sky chunk, every layer in one fragment: becomes atmos_sky.gdshaderinc for a shader_type sky |
| `atmos/sky/89-atmos-j-fog.js` | 19.5 | [G native] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `atmos/sky/89-atmos-k-cloudmood.js` | 17.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `audio/20-core-audio-catalog.js` | 5.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `audio/22-core-audio-cues.js` | 5.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `audio/24-core-audio-sky.js` | 10.7 | [web] | 0 | 0 | 0 | 1 | 0 | 1 | 0 | 0 | 0 | 0 | 1 | split: data inside host code |
| `audio/24-core-audio-soundscape.js` | 8.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `audio/26-core-audio-music.js` | 21.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `audio/lab/build.js` | 5.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `audio/lab/serve_local.js` | 1.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `audio/tools/append_baking_to_stk.js` | 13.6 | [web] | 0 | 0 | 3 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | split: data inside host code |
| `audio/tools/audit_downloads.js` | 1.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `audio/tools/build_soundtrack_engine.js` | 103.7 | [web] | 0 | 0 | 94 | 38 | 0 | 0 | 0 | 0 | 0 | 2 | 2 | split: data inside host code |
| `audio/tools/catalog.js` | 8.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `audio/tools/check_five.js` | 1.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `audio/tools/find_sonniss_details.js` | 4.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `audio/tools/finish_cut_display.js` | 8.2 | [web] | 0 | 0 | 0 | 12 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `audio/tools/fix_backticks.js` | 0.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `audio/tools/fix_cut_display_names.js` | 23.8 | [web] | 0 | 0 | 14 | 12 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `audio/tools/fix_join.js` | 0.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `audio/tools/fix_saved_scenes_dropdown.js` | 8.8 | [web] | 0 | 0 | 8 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `audio/tools/insert_matrix.js` | 1.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `audio/tools/install_cut_chain_complete.js` | 17.2 | [web] | 0 | 0 | 16 | 9 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `audio/tools/install_end_to_end_stacking.js` | 14.6 | [web] | 0 | 0 | 11 | 10 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `audio/tools/install_enhanced_combat.js` | 32.4 | [web] | 0 | 0 | 17 | 12 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `audio/tools/install_saved_cuts_soundtrack.js` | 20.8 | [web] | 0 | 0 | 30 | 10 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | split: data inside host code |
| `audio/tools/install_soundtrack_editor.js` | 29.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `audio/tools/install_soundtrack_js.js` | 1.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `audio/tools/install_stinger_fx.js` | 21.7 | [web] | 0 | 0 | 18 | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `audio/tools/mp3_dur.js` | 1.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `audio/tools/patch_combat_multitrack.js` | 14.4 | [web] | 0 | 0 | 14 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `audio/tools/patch_multi_biome.js` | 18.8 | [web] | 0 | 0 | 22 | 9 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `audio/tools/patch_music_tab.js` | 23.0 | [web] | 0 | 1 | 10 | 12 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `audio/tools/patch_search.js` | 3.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `audio/tools/patch_template_cuts.js` | 2.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `audio/tools/patch_template_search.js` | 6.3 | [web] | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `audio/tools/playback_limits.js` | 3.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `audio/tools/prepare_batch_d.js` | 6.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `audio/tools/prepare_dailysounds.js` | 12.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `audio/tools/soundtrack_engine_code.js` | 258.9 | [web] | 0 | 0 | 217 | 84 | 1 | 0 | 0 | 0 | 0 | 4 | 3 | split: data inside host code |
| `audio/tools/test_search_queries.js` | 1.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `audio/tools/update_clip_picker.js` | 10.5 | [web] | 0 | 0 | 23 | 7 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | split: data inside host code |
| `audio/tools/update_clip_picker_playback.js` | 13.4 | [web] | 0 | 0 | 27 | 9 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | split: data inside host code |
| `audio/tools/update_durations_d.js` | 0.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `audio/tools/update_stk_env_fades.js` | 12.3 | [web] | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `audio/tools/update_stk_stackable.js` | 10.2 | [web] | 0 | 0 | 14 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `audio/tools/update_template_stk_js.js` | 1.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `audio/tools/verify_all_queries.js` | 1.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `audio/tools/verify_soundtrack_build.js` | 2.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `biome/10-core-head.js` | 12.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | its rng already equals KRAND.stream (test-rand.js); its sin-based h3/vnoise/fbm move to core/rand in the biome reseeding event |
| `biome/20-core-kit.js` | 80.5 | [draw] | 1 | 0 | 0 | 0 | 0 | 4 | 3 | 15 | 0 | 0 | 0 | split: items and buckets on Float32 stores are data; the bake and LOD are three.js |
| `biome/30-core-foliage.js` | 48.9 | [G shader] | 1 | 5 | 0 | 0 | 0 | 6 | 51 | 0 | 0 | 0 | 0 | foliage card, bark, wind: the shader library |
| `biome/30s-core-season-flush.js` | 3.8 | [G shader] | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | opt-in: the copper flush (BIO.FLUSH, setFlush, bindFlush) wrapping BIO.foliageHook; Godot's is shaders/lib/season.gdshaderinc in foliage.gdshader (season_dry, season_flush globals) |
| `biome/31-core-dither.js` | 3.6 | [G shader] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the hex-cell ground dither (BIO.DITHER GLSL, X4) and its JS twin ditherCell: ground.gdshader writes the same functions |
| `biome/31b-core-leafset.js` | 8.8 | [G data] | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | leaves held by the stem: stems, stem-pivoted cards and sprays (geometry), BIO.leafOn/leafAlong placement on KRAND (plain maths) |
| `biome/31j-core-joint.js` | 2.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `biome/32-core-variants.js` | 4.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `biome/33-core-fungoid.js` | 19.7 | [draw] | 1 | 0 | 0 | 0 | 0 | 12 | 0 | 0 | 0 | 0 | 0 |  |
| `biome/33b-core-bamboo.js` | 25.8 | [draw] | 0 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 |  |
| `biome/34-core-impostor.js` | 23.1 | [web] | 0 | 0 | 2 | 0 | 0 | 3 | 13 | 7 | 0 | 0 | 0 |  |
| `biome/35-core-anim.js` | 13.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 13 | 0 | 0 | 0 | 0 | fauna paths are data; the body shader is [G shader] |
| `biome/35b-core-anim-turn.js` | 3.2 | [G shader] | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | opt-in: BIO.animHook breath.turn, a yaw on a second key with the normals turned (the Stills' sails); a global shader parameter and VERTEX.xz in Godot |
| `biome/36-core-walker.js` | 5.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | walkers: a pose from the clock (loop, stops, gait); no three.js, no DOM |
| `biome/37-core-traps.js` | 6.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `biome/38-core-fire.js` | 12.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `biome/39-core-lean.js` | 4.8 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `biome/40-core-place.js` | 18.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 1 | 0 | 0 | 0 | placement: ports to GDScript, tested tile for tile |
| `biome/41-core-env.js` | 4.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `biome/42-core-export.js` | 27.6 | [G data] | 2 | 0 | 0 | 0 | 0 | 1 | 1 | 7 | 0 | 0 | 0 | pure data now: the one browser line, download(), moved to 43-core-export-host.js (2026-10-03); folds into core/export/ |
| `biome/43-core-export-host.js` | 3.7 | [web] | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | BIO.download(): a Blob and a link click, no caller yet; moves to core/host/ (Phase 1) |
| `biome/44-core-stage.js` | 14.0 | [draw] | 1 | 2 | 0 | 0 | 0 | 2 | 4 | 1 | 2 | 0 | 0 |  |
| `biome/45-core-span.js` | 4.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | opt-in: KSPAN, catenaries between two anchors (solve by length, slack or sag; up for a buoyant cable; strands for a curtain): spiderlake's silk, loom-chasms' cables |
| `biome/46-core-sign.js` | 17.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | opt-in: KSIGN animal sign from herd records (trails, wallows, dung, browse, trample, bone yards, maskAt); test-sign.js |
| `camp/10-camp-cultures.js` | 3.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the culture rows (KCAMP.CULTURES): plain data |
| `camp/20-camp-census.js` | 4.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | a band's census (KCAMP.census): no three.js, no geometry, no DOM; test-camp.js |
| `camp/30-camp-pitch.js` | 13.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 | the pitch (KCAMP.pitch, check): plain records, no three.js (its 'box' is a footprint's corners); test-camp.js |
| `camp/40-camp-work.js` | 10.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | work camps that migrate: the range's stands, the op log (pitch, strike, march), the move rule, the trees' state; no three.js, no geometry, no DOM |
| `camp/50-camp-outlaw.js` | 17.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `camp/50-camp-tents.js` | 17.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | tents by role and culture for kits/tents (KCAMP.TENTS, tentFor, tentProgram, tentDims) and the caravan halt (KCAMP.halt): plain records, no three.js, no DOM; kits/tents/tests/test-tents.js |
| `catalog/catalog-files.js` | 0.6 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | node tools only: a catalog name to its file (files.json) |
| `catalog/inspector.js` | 19.0 | [web] | 11 | 0 | 19 | 6 | 0 | 2 | 0 | 0 | 2 | 0 | 0 |  |
| `catalog/krator-asset-engine.js` | 11.5 | [web] | 22 | 3 | 1 | 9 | 4 | 5 | 0 | 0 | 0 | 0 | 0 |  |
| `catalog/krator-furniture-core.js` | 75.5 | [draw] | 54 | 3 | 0 | 0 | 0 | 115 | 0 | 0 | 0 | 0 | 0 |  |
| `catalog/krator-furniture-detail.js` | 4.1 | [web] | 2 | 0 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | optional (`bundle(tex=True)`); the detail-map shader is a three.js stand-in for StandardMaterial3D triplanar, one texture per family from `tex/pack.json` |
| `catalog/krator-furniture-kit.js` | 156.3 | [draw] | 0 | 0 | 0 | 0 | 0 | 765 | 0 | 0 | 0 | 0 | 0 |  |
| `catalog/krator-furniture-runtime.js` | 14.5 | [draw] | 23 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 |  |
| `cavelight/10-core-cavelight.js` | 20.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `cavelight/90-core-cavelight-host.js` | 12.5 | [draw] | 0 | 4 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | canvas painters: TEX.def or bake |
| `city/10-city-core.js` | 17.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `city/12-city-index.js` | 6.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `city/15-city-ground.js` | 5.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `city/20-city-plan.js` | 17.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 | the layout: no three.js, no DOM |
| `city/25-city-site.js` | 30.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 | the site layer (roles, zone, avenues, highways, the wall as records, ground deltas): records only, its drawing stays the world's |
| `city/31-city-steps-b.js` | 16.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 11 | 0 | 0 | 0 | 0 | 0 | the layout: no three.js, no DOM |
| `city/32-city-steps-c.js` | 15.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 | the layout: no three.js, no DOM |
| `city/33-city-strategies.js` | 17.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `city/34-city-radial.js` | 9.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 | the optional radial strategy (the toy's rings and spokes): the layout, no three.js |
| `city/36-city-covered.js` | 7.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `city/40-city-kcity.js` | 9.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `city/50-city-host-streets.js` | 15.5 | [draw] | 32 | 5 | 0 | 0 | 0 | 4 | 0 | 3 | 0 | 0 | 0 | streets, overlay, labels, step visibility |
| `city/52-city-host-buildings.js` | 5.9 | [draw] | 5 | 0 | 0 | 0 | 0 | 2 | 0 | 2 | 0 | 0 | 0 | lots as instanced LOD prototypes |
| `city/54-city-host-construct.js` | 7.6 | [draw] | 4 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `clock/20-core-clock.js` | 5.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the world clock (GODOT-PLAN.md Phase 1); becomes WorldClock.gd, tested by test-clock.js |
| `clock/opt/21-core-clock-flush.js` | 2.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | opt-in (subfolder): KCLOCK.flush, the copper flush's pulse at the rains' onset; KSeason.flush in kseason.gd (golden-flush.json) |
| `door/10-core-door.js` | 17.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | KDOOR: doors as records by stable id, open/close/toggle/nearest, the swing, walk blocks in KWALK, save deltas, export() |
| `door/20-core-glass.js` | 3.7 | [G native] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | KGLASS: the glass kinds as data (SPEC) for a StandardMaterial3D with alpha; material(THREE, kind) is the three.js side |
| `door/30-core-door-leaf.js` | 8.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 7 | 0 | 5 | 0 | 0 | 0 |  |
| `door/90-core-door-host.js` | 4.9 | [web] | 1 | 0 | 4 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | KDOORHOST: pose a leaf (an instance or an Object3D), the frame tick, the E key and its tip |
| `drawn/10-core-drawn.js` | 7.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `edits/40-core-edits.js` | 10.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the edit log (ADD, MOVE, SET, REMOVE): no three.js, no DOM |
| `engine/10-core.js` | 3.4 | [web] | 0 | 0 | 2 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `engine/27-mat.js` | 6.4 | [G shader] | 12 | 0 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 |  |
| `engine/30-geo.js` | 23.1 | [draw] | 44 | 0 | 0 | 0 | 0 | 25 | 0 | 0 | 0 | 0 | 0 |  |
| `engine/36-def.js` | 6.5 | [draw] | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `engine/36o-open.js` | 14.0 | [draw] | 11 | 0 | 0 | 0 | 0 | 7 | 0 | 5 | 0 | 0 | 0 |  |
| `engine/36s-stair.js` | 11.1 | [draw] | 1 | 0 | 0 | 0 | 0 | 10 | 0 | 0 | 0 | 0 | 0 |  |
| `engine/37-wk-rec.js` | 2.2 | [draw] | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `engine/90-scene.js` | 6.4 | [web] | 15 | 0 | 1 | 0 | 2 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `engine/91f-furnish.js` | 6.0 | [web] | 1 | 0 | 0 | 0 | 2 | 0 | 3 | 0 | 0 | 0 | 0 | split: data inside host code |
| `engine/91i-interiors.js` | 8.7 | [web] | 1 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `engine/91n-night.js` | 2.6 | [draw] | 6 | 2 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `engine/92-world.js` | 0.2 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | builds the world and names the views; before 93-anim.js, which reads the smoke sources the build records |
| `engine/93-anim.js` | 2.5 | [draw] | 5 | 2 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `engine/99-host-take.js` | 9.7 | [web] | 0 | 0 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | the page handed to core/host (KHOST.take): views, inspector words, controls, the probe's fields; after core/host's 95-host-probe.js |
| `export/07-core-export.js` | 37.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | the krator-world container (EXPORT: register, world, check, glb, compact, terrain): no THREE, no DOM; test-export.js; read by godot/krator/world_import.gd (core/export/README.md) |
| `export/09-core-export-adapters.js` | 14.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | core/tags', core/atmos', the material records' and core/water's parts until those modules register themselves (water: the surfaces, bed bytes, the twin's probes); EXPORT.ground for a build without its own terrain part; EXPORT.groundLayers for a ground hook's world-uv layers |
| `export/10-core-export-scene.js` | 15.4 | [web] | 6 | 3 | 0 | 0 | 0 | 1 | 4 | 3 | 0 | 0 | 0 | the scene reader (lifted from Iziz's 94, 2026-10-20): reads a page's three.js scene at export time (canvas 2D only for the PNG bakes of procedural maps), draws nothing; Iziz's 94 and the isle demo's 62 use it |
| `furnish/50-core-furnish.js` | 8.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `furnish/52-core-furnish-draw.js` | 3.5 | [draw] | 1 | 0 | 0 | 0 | 0 | 2 | 3 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `furnish/53-core-furnish-host.js` | 0.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `hamlet/10-hamlet-wood.js` | 4.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `hamlet/12-hamlet-gather.js` | 2.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `hamlet/14-hamlet-farmland.js` | 12.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `hamlet/16-hamlet-names.js` | 5.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `hamlet/18-hamlet-names.js` | 1.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `hamlet/20-hamlet-cultures.js` | 5.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `hamlet/21-hamlet-iziz.js` | 2.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `hamlet/30-hamlet-village.js` | 25.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 | the village generator: plain records; its "geom" hits are its own box and rectangle maths, no three.js |
| `hamlet/32-hamlet-platform.js` | 35.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 14 | 0 | 0 | 0 | 0 | 0 |  |
| `hamlet/34-hamlet-trade.js` | 14.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `hamlet/40-hamlet-felling.js` | 2.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `hazard/20-core-hazard.js` | 48.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `hazard/21-core-hazard-flow.js` | 6.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | opt-in: KHAZ.moveAt, drift, poolK: a hazard's move read (move.pull toward its core) and gas pooled on a band's floor (shape.pool); test-hazard-flow.js; core/hazard/GODOT.md "Moving and pooling" |
| `hazard/22-core-hazard-env.js` | 28.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | opt-in: KHAZ.crust/under, KHAZ.night (bindClock, bindWind), KHAZ.front (flood, charge, bindHerd), KHAZ.ENV builders; test-hazard-env.js; GODOT.md "Crusts, night and fronts" |
| `hazard/22-core-hazard-tunnel.js` | 20.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `host/90-host-camera.js` | 11.7 | [web] | 7 | 0 | 0 | 10 | 0 | 2 | 0 | 0 | 1 | 0 | 0 |  |
| `host/91-host-loop.js` | 8.2 | [web] | 3 | 0 | 1 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `host/91b-host-follow.js` | 13.1 | [web] | 5 | 0 | 1 | 3 | 1 | 8 | 0 | 0 | 0 | 0 | 0 |  |
| `host/92-host-panel.js` | 14.8 | [web] | 0 | 0 | 10 | 8 | 0 | 0 | 0 | 0 | 1 | 3 | 0 | split: data inside host code |
| `host/92k-host-keys.js` | 16.3 | [web] | 0 | 0 | 7 | 2 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `host/93-host-inspect.js` | 10.6 | [web] | 2 | 0 | 12 | 4 | 1 | 2 | 0 | 0 | 1 | 0 | 0 | the inspector over core/tags records (I, click): host shell |
| `host/93-host-stocks.js` | 21.8 | [web] | 1 | 0 | 12 | 7 | 6 | 1 | 0 | 0 | 0 | 0 | 0 | what things hold and the stocks panel (O) over o.holds (core/simulation): host shell; Voth's 56e is the standard |
| `host/94-host-marks.js` | 12.0 | [web] | 7 | 2 | 10 | 8 | 0 | 3 | 0 | 0 | 1 | 3 | 2 | marks (P): host shell; the marks file is plain data |
| `host/94-host-polytool.js` | 5.7 | [web] | 6 | 0 | 5 | 5 | 0 | 2 | 0 | 0 | 1 | 0 | 0 |  |
| `host/95-host-probe.js` | 6.5 | [web] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 |  |
| `host/95b-host-seat.js` | 7.4 | [web] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | the probe's seat sweeps (contact, clear, doors, stairs) over the drawn scene, opt-in; the measuring is KSEAT (terrain/38a) |
| `host/96-host-pictures.js` | 6.1 | [web] | 4 | 2 | 7 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the picture menu, drawn off screen: host shell |
| `host/97-host-minimap.js` | 3.4 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the minimap panel from the records (KMAP.mount, the M key): host shell |
| `host/97b-host-minimap-decks.js` | 4.3 | [web] | 0 | 2 | 2 | 3 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `host/98-host-edit.js` | 19.9 | [web] | 6 | 0 | 5 | 10 | 2 | 5 | 0 | 0 | 1 | 5 | 1 | edit modes: host shell; every edit a core/edits op (the log is [G data]) |
| `host/99-host-cutaway.js` | 7.1 | [web] | 2 | 0 | 4 | 4 | 1 | 5 | 1 | 0 | 0 | 0 | 0 | the cutaway (X), clipping planes and the storey bar: host shell |
| `host/99-host-section.js` | 14.4 | [web] | 8 | 0 | 3 | 4 | 1 | 1 | 2 | 0 | 2 | 0 | 0 |  |
| `host/underground/40-world.js` | 4.5 | [draw] | 1 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `host/underground/60-scene.js` | 3.0 | [web] | 11 | 0 | 1 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `host/underground/98-take.js` | 2.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `lod/09-lod.js` | 32.7 | [G native] | 0 | 0 | 6 | 3 | 8 | 14 | 0 | 10 | 3 | 0 | 0 | keep for the preview; no port |
| `lod/97-lod-auto.js` | 0.8 | [G native] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `mask/25-core-mask.js` | 11.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the placement raster: KMASK.canvas, hard-edged by pixel centre; test-mask.js, GDScript twin kmask.gd (passing in Godot 4.5). Used by the Iziz, Dalab, Erewhon and Roketstad cities |
| `mask/26-core-mask-xform.js` | 5.5 | [draw] | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | canvas painters: TEX.def or bake |
| `mask/27-core-mask-distance.js` | 5.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | KMASK.distance: the exact distance transform in integers (a species' reach, PLAN-LANDS H1); test-mask-distance.js, GDScript twin KMask.distance (golden-distance.json, passing in Godot 4.7.2) |
| `materials/20-textures.js` | 7.2 | [draw] | 3 | 9 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the painter set behind TEX.def (Phase 3) |
| `materials/22-materials.js` | 3.4 | [G shader] | 21 | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | the MAT table becomes the material vocabulary; glass Fresnel is a library shader |
| `materials/68-mat-v5.js` | 1.1 | [G shader] | 11 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | water, spray: library shaders |
| `materials/opt/69a-world-uv.js` | 2.1 | [G native] | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | world-unit UVs: uv1_triplanar / world-space UV in Godot |
| `materials/record/23-mat-record.js` | 5.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | KMAT: the material record vocabulary (Phase 3), build adapters, the library pack registry and table(); test-record.js |
| `materials/record/24-tex-def.js` | 2.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | TEX: procedural textures as records (kind, size, seed, params) and their pure pixel functions; canvas kinds bake to PNG |
| `materials/record/25-matlib-host.js` | 6.5 | [web] | 5 | 0 | 0 | 0 | 0 | 0 | 10 | 0 | 0 | 0 | 0 | the browser half: ?mat=proc, data-URL images to THREE textures, _texPending, the specular hook (Godot's specular); moves to core/host/ |
| `materials/record/26-matlib-bind.js` | 4.2 | [G shader] | 2 | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 |  |
| `minimap/88-core-minimap.js` | 10.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the records, relief, paint onto a given context, and export(): a Control's _draw() in Godot. Split 2026-10-02: the panel is 88a |
| `minimap/88a-core-minimap-host.js` | 3.8 | [web] | 0 | 5 | 5 | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the browser panel, the M key, hover and click; moves to core/host/ (Phase 1) |
| `minimap/decks/88b-core-minimap-decks.js` | 10.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `ports/44-core-ports.js` | 7.5 | [draw] | 2 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | PORT marks for kits/beast-riders: bucket ranges are data; the box measure reads three.js |
| `rand/08-core-rand.js` | 4.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | one stream (the lineages' mulberry32), an integer hash, noise: golden.json, test-rand.js, test_rand.py; GDScript twin krand.gd (passing in Godot 4.5 since 2026-10-05). Used by Ys's city |
| `ruins/20-core-ruins.js` | 6.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `ruins/21-core-ruins-host.js` | 6.0 | [draw] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |  |
| `sched/20-core-sched.js` | 6.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `shader/06-core-khook.js` | 11.4 | [G shader] | 0 | 0 | 0 | 0 | 0 | 0 | 10 | 0 | 0 | 0 | 0 |  |
| `shader/06b-core-kcolor.js` | 5.3 | [draw] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `shader/07-core-kwarp.js` | 4.7 | [G shader] | 0 | 0 | 0 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 |  |
| `shader/r128.js` | 2.0 | [G shader] | 3 | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 |  |
| `shader/aids/08-core-kfade.js` | 6.2 | [draw] | 8 | 0 | 0 | 0 | 0 | 0 | 1 | 1 | 0 | 0 | 0 |  |
| `shadow/10-core-shadow.js` | 3.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `shadow/host/12-core-shadow-host.js` | 10.7 | [web] | 1 | 0 | 1 | 1 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | the page's renderer and sun: Godot's DirectionalLight3D shadows instead |
| `simulation/77-sim-0-core.js` | 9.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `simulation/77-sim-1-world.js` | 3.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `simulation/77-sim-2-places.js` | 9.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `simulation/77-sim-3-actors.js` | 33.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `simulation/77-sim-4-nav.js` | 9.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `simulation/77-sim-5-motion.js` | 4.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `simulation/77-sim-5r-routes.js` | 11.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `simulation/77-sim-6-build.js` | 15.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `simulation/77-sim-6-crime.js` | 23.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | crime and punishment (opt-in SIM.crime): criminals, the crimes, witnesses, guards, arrest, jail by SIM.command; hashes only; no three.js, no DOM |
| `simulation/77-sim-6-economy.js` | 38.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the economy: goods, stores, production by worked hour and efficiency, carts, consumption, days left, imports |
| `simulation/77-sim-6-govern.js` | 12.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the economy's opt-in rules: the production governor, spoilage, keeping, seasoning |
| `simulation/77-sim-6-items.js` | 31.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | items, inventory, the six slots, wear, errands to the nearest seller, meals from a household store (opt-in: SIM.items) |
| `simulation/77-sim-6-money.js` | 33.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | money (opt-in SIM.money): currencies at a rate to the Talent, accounts with owners, mint, burn, pay, exchange, the report; integers; no three.js, no DOM |
| `simulation/77-sim-6-needs.js` | 19.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | needs, happiness, efficiency, loyalty; the free-time clause and the interrupt of SIM.desire (opt-in: SIM.needs) |
| `simulation/77-sim-6-population.js` | 6.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `simulation/77-sim-6-trade.js` | 11.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `simulation/77-sim-6-unrest.js` | 12.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `simulation/77-sim-7-ledger.js` | 10.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the accounting contract: statements and route reconciliation (SIM.ledgerSnap, SIM.ledger); read only |
| `simulation/77-sim-7-lod.js` | 6.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the levels: SIM.level(s, 'abstract' or 'presented'), a town nobody watches on its books only; raising it (opt-in) |
| `simulation/77-sim-7-stocks.js` | 19.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | what things hold and the settlement's stocks: SIM.contents, SIM.stocks (by state, the daily snapshot's change and flows, the low and out marks), SIM.holders; read only |
| `simulation/77-sim-8-export.js` | 4.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `simulation/77-sim-9-debug.js` | 5.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `sockets/37-sockets.js` | 2.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | socket declarations and the pack registry |
| `sockets/38-symbols.js` | 13.3 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | canvas 2D symbol painters: bake to PNG |
| `sockets/80-cultures.js` | 21.2 | [draw] | 2 | 1 | 0 | 0 | 0 | 20 | 0 | 0 | 0 | 0 | 0 | split: the packs are data; the drawing kit bakes |
| `space/20-core-space.js` | 4.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `tags/50-core-tags.js` | 18.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the tag registry: ids, the KRAND uid (GDScript twin ktags.gd, passing in Godot 4.5), norm, query, audit, export; test-tags.js. Used by Yuni |
| `tags/52-core-tags-vocab.js` | 19.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the one vocabulary; the catalog's lists copied, test-tags.js fails on drift |
| `tags/53-core-tags-host.js` | 11.3 | [web] | 12 | 0 | 0 | 0 | 0 | 2 | 0 | 1 | 0 | 0 | 0 | the inspector's label text; the inspector hook goes to core/host (Phase 1) |
| `tags/opt/54-core-tags-sound.js` | 7.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | opt-in (subfolder): the sound key and VOCAB.soundKinds; KTAGS.sound, soundLevel, soundAt (aeolian emitters, H9); ksound.gd twin (golden-sound.json) |
| `terrain/30-core-field.js` | 13.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `terrain/31-core-field-brush.js` | 4.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the field's ground brushes (raise, lower, flatten, smooth), snapshot and replay: plain data on KFIELD's heights; a GDScript twin to come |
| `terrain/35-core-strata.js` | 41.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | KSTRATA: formations and beds as records (12 recipes), the closed-form warp, folds, faults, lateral change, alteration, wash and cover, the ledge pass, the bake (the shaders' bytes); kstrata.gd twin (golden-strata.json) |
| `terrain/35b-core-lamina.js` | 13.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | opt-in: KSTRATA.lamina, a breath pipe's day couplets, annual bands and marker bands as a column of years (KRAND by year), at/atPipe/depthOf/bands/bake/shade/export (LAMINA.md, test-lamina.js); no GDScript twin yet |
| `terrain/35c-core-strata-vary.js` | 8.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | opt-in: KSTRATA.vary (contacts moved by an offset of (x,z), the column remapped between them), KSTRATA.drape, loadVaried; kstrata_vary.gd twin (golden-strata-vary.json); the shaders draw the flat column |
| `terrain/35d-core-strata-bake.js` | 12.6 | [G shader] | 1 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | opt-in: KSTRATA.varyBake (plain RGBA8 bytes, [G data]) and ksVaryYY as GLSL text with a JS twin; Godot owes KStrataVary.bake and ks_vary_yy; test-strata-bake.js |
| `terrain/35e-core-strata-skarn.js` | 15.7 | [G shader] | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | opt-in: skarn recipes and KSTRATA.skarn lenses on vary ([G data]); KSTRATA.glaze thin-film glaze, GLSL text with a JS twin; Godot owes ks_glaze_colour; test-strata-skarn.js |
| `terrain/36-core-carve.js` | 20.5 | [G data] | 0 | 0 | 0 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | split: a timing helper reads performance.now (line 103); floors and blockers export (Godot order 1) |
| `terrain/37-core-stacks.js` | 80.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `terrain/37b-core-stacks-contour.js` | 5.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `terrain/37c-core-rubble.js` | 13.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `terrain/38-core-relief.js` | 58.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `terrain/38a-core-seat.js` | 29.8 | [G data] | 1 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 | KSEAT: the surface as drawn (triangles, a drawn grid, KSTACKS bodies), seat, contact, clearance, door and stair sweeps as plain functions on flat arrays and records; test-seat.js. The drawers' probe points wrap KSTACKS.mesh and KCARVE.mesh when loaded |
| `terrain/38b-core-relief-lava.js` | 11.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | opt-in: KRELIEF.tumuli (tumuli and pressure ridges on a lava bake), KRELIEF.tubeRille (a tube's fallen roof as a trench, skylights), two kinds on KRELIEF.shape/at/apply |
| `terrain/38c-core-landforms.js` | 39.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | opt-in: KRELIEF.slump, runout, gully, terraces, maar, relay, stepcut (LANDFORMS.md) and KRELIEF.waters, seven kinds on KRELIEF.shape/at/apply; no Godot twin (a page bakes them into its KFIELD) |
| `terrain/38d-core-landforms-net.js` | 21.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | opt-in: KRELIEF.grabenNet (three-trend graben net on stepcut) and KRELIEF.ripples (giant flood ripples); test-landforms-net.js |
| `terrain/39-core-cavern.js` | 39.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `terrain/39b-core-speleo.js` | 19.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 12 | 0 | 0 | 0 | 0 | 0 | opt-in: KSPELEO, speleothems placed on a built KCAVERN by KRAND per cell, meshed as plain arrays (riftrim's hold; the limestone dress; the crystal caves' megacrystal beams, blocks and druse); an ArrayMesh in Godot |
| `terrain/39b2-core-speleo-cleft.js` | 2.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `terrain/39c-core-karst.js` | 31.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | opt-in: KKARST, a solution cave's plan (branchwork or maze on joints, chambers, levels, keyholes, sumps, sinks, dolines, cenotes, the spring; or hypogene: feeders, chambers and cupolas at the table, rising maze or spongework storeys, gypsum crusts for KSPELEO, a warm spring and vents, scalding pools and pooled bad air) as records for KCAVERN, KRELIEF, core/water and core/hazard; a karst KSTRATA recipe |
| `terrain/39d-core-cavern-floor.js` | 2.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `terrain/39f-core-geode.js` | 14.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `terrain/40-core-basin.js` | 11.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `terrain/41-core-scour.js` | 13.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `terrain/42-core-frost.js` | 14.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 | KFROST: the periglacial landforms (patterned ground, alases, pingos, aufeis, solifluction lobes, rock glaciers); plain maths on KRAND, no trig; test-frost.js |
| `terrain/43-core-ground.js` | 37.0 | [G shader] | 0 | 0 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | KGROUND: the ground layers (hex tiling, distance scale, height blend) and the layer kinds (clast, sand, polygon) as a GLSL hook; becomes ground.gdshader, its JS twins in KGROUND.fn; the kinds' functions already in godot/shaders/lib/kground_kinds.gdshaderinc |
| `terrain/44-core-farfield.js` | 11.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | KFAR: the far-field lattice as arrays (grid lines, heights, colours, curvature, exaggeration, crests); a MeshInstance3D in Godot |
| `terrain/44b-core-farfield-lines.js` | 3.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | opt-in: KFAR.streaks, far dark lines as items scaled by the kit's value (the lungs on the Inner Wall); a MultiMesh in Godot |
| `terrain/44g-core-glacier.js` | 10.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | KGLACIER (2026-11-03, lifted from the Throne's glacier station): a valley glacier along an axis (ice, trough, moraines, lake basin) and its placement on KRAND (seracs, bergs, crevasses, caves) as records; test-glacier.js |
| `terrain/45-core-horizon.js` | 6.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | KHORIZON: the horizon maps baked from a heightfield (two RGBA8 arrays, sky visibility); ImageTextures in Godot |
| `terrain/46-core-lava.js` | 21.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | KLAVA: the Bingham lava flow (MAGFLOW family) on the KFIELD lattice, vents, ponds, cooling, freezing into new ground; klava.gd twin (golden-lava.json), passing in 4.7.2 |
| `terrain/46b-core-lava-layers.js` | 5.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | opt-in: KLAVA.bakeLayers (bake with each eruption's sheet), column, strata (the flows as KSTRATA formations) |
| `terrain/47-core-therm.js` | 9.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `terrain/host/35-core-strata-shade.js` | 20.6 | [G shader] | 1 | 5 | 0 | 0 | 0 | 2 | 4 | 0 | 0 | 0 | 0 | opt-in (subfolder): BIO.strata (today's shader kept, and the core path), KSTRATA.shade: the bake as RGBA8 data textures, strataColor in GLSL; Godot's is godot/shaders/lib/strata.gdshaderinc |
| `terrain/host/35b-core-lamina-shade.js` | 2.7 | [G shader] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | opt-in (subfolder): KSTRATA.laminaShade, the lamina bake as an RGBA8 data texture and laminaColor(depth, px) in GLSL; a .gdshaderinc in Godot |
| `terrain/host/39e-core-cavern-draw.js` | 3.7 | [web] | 1 | 0 | 0 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `terrain/host/39g-core-geode-draw.js` | 19.7 | [draw] | 0 | 0 | 0 | 0 | 0 | 11 | 0 | 3 | 0 | 0 | 0 |  |
| `terrain/host/39h-core-cavern-cut.js` | 5.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `terrain/host/44-core-farfield-draw.js` | 5.8 | [G shader] | 2 | 0 | 0 | 0 | 0 | 3 | 7 | 1 | 0 | 0 | 0 | opt-in (subfolder): KFAR.mesh, geometry, fogThin, the three.js draw of the lattice |
| `terrain/host/44b-core-farfield-lines-draw.js` | 3.0 | [G shader] | 1 | 0 | 0 | 0 | 0 | 1 | 5 | 1 | 0 | 0 | 0 | opt-in (subfolder): KFAR.streakMesh, the far lines as camera-facing ribbons in one instanced draw |
| `terrain/host/44h-core-glacier-draw.js` | 13.9 | [draw] | 20 | 0 | 0 | 0 | 0 | 8 | 11 | 0 | 0 | 0 | 0 | opt-in (subfolder): KGLACIER.drawer, the three.js draw of the glacier's records (seracs, towers, ice-cave shells, arch, crevasses, steam) |
| `terrain/host/45-core-horizon-shade.js` | 7.0 | [G shader] | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | opt-in (subfolder): KHORIZON.shade, the GLSL that cuts the sun and the ambient; a .gdshaderinc in light() |
| `terrain/host/46-core-lava-draw.js` | 5.8 | [G shader] | 1 | 0 | 0 | 0 | 0 | 1 | 5 | 0 | 0 | 0 | 0 | opt-in (subfolder): KLAVA.surface, the flow's surface on core/atmos's lava chunk; an ArrayMesh and the lava .gdshaderinc in Godot |
| `terrain/host/46-core-lava-gpu.js` | 10.4 | [G shader] | 0 | 0 | 0 | 0 | 0 | 1 | 6 | 0 | 0 | 0 | 0 | opt-in (subfolder): KLAVA.gpu, the step as render passes on float textures; a compute shader in Godot (LAVA.md, "Godot") |
| `walk/20-core-walk.js` | 16.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | floors and blockers; export() is navigation-mesh source and collision boxes |
| `walk/box/24-core-walk-box.js` | 6.7 | [web] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `water/20-core-water.js` | 32.4 | [G data] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | WATER: the six kinds, the CPU twins, ride, export; becomes a Water autoload (core/water/README.md, "Godot") |
| `water/21-core-water-shore.js` | 19.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the shore grid (the flood, the exact distance transform, the bytes) and the shore's twins (shoaling, breakers, the beach); GDScript twin in godot/krator/water.gd (KWater.shore_grid) |
| `water/22-core-water-flow.js` | 21.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | flow ribbons, fall curtains, plunge pools, still meshes as arrays and their shading twins; KWater builds the same meshes |
| `water/50-core-water-draw.js` | 26.7 | [G shader] | 0 | 0 | 0 | 0 | 0 | 1 | 10 | 1 | 0 | 0 | 0 | the GLSL becomes water_open.gdshader (generated, like atmos_waves); the CDLOD selection (WATER.cdlod) is data and ports to GDScript with a MultiMesh |
| `water/51-core-water-kinds.js` | 36.8 | [G shader] | 0 | 0 | 0 | 0 | 0 | 4 | 30 | 0 | 0 | 0 | 0 | flow, fall, plunge, still and wet-ground drawing; the GLSL is godot/shaders/lib/water_kinds.gdshaderinc and water_*.gdshader |
| `water/glsl-interp.js` | 9.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `water/ext/53-core-water-terraces.js` | 9.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | opt-in (subfolder: not pooled): WATER.terraces (a stepped river: a still pool per tread, a fall per riser, linked) and WATER.mergedFalls (the arrays of many falls in one); GDScript twin: the pools and falls are ordinary still and fall records |
| `water/ext/53b-core-water-terraces-draw.js` | 12.2 | [G shader] | 0 | 0 | 0 | 0 | 0 | 3 | 13 | 0 | 0 | 0 | 0 | opt-in (subfolder): WATER.drawFalls (two meshes for any number of falls), drawPools, drawTerraces; the GLSL is the per-fall functions with the lip scale, fall time and plunge centre as arguments |
| `water/ext/54-core-water-kinds-ext.js` | 30.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `water/ext/54b-core-water-kinds-ext-draw.js` | 10.7 | [G shader] | 0 | 0 | 0 | 0 | 0 | 4 | 10 | 2 | 0 | 0 | 0 |  |
| `water/ext/55-core-water-confluence.js` | 10.3 | [draw] | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `water/ext/55b-core-water-confluence-draw.js` | 5.6 | [G shader] | 0 | 0 | 0 | 0 | 0 | 1 | 5 | 0 | 0 | 0 | 0 |  |
| `water/ext/56-core-water-breakup.js` | 8.0 | [G shader] | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 |  |
| `water/ext/57-core-water-audit.js` | 18.3 | [draw] | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 |  |
| `water/ext/58-core-water-mirror.js` | 10.3 | [web] | 0 | 0 | 1 | 1 | 0 | 0 | 3 | 1 | 0 | 0 | 0 | split: data inside host code |
| `water/ext/58-core-water-shore.js` | 3.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `water/ext/59-core-water-network.js` | 6.1 | [draw] | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `water/ext/59b-core-water-network-draw.js` | 1.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `water/ext/60-core-water-fields.js` | 6.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `water/ext/61-core-water-plume.js` | 6.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `water/ext/62-core-water-flood.js` | 11.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | opt-in: WATER.flood on the KHAZ.front law (level, wet, hazard record); test-flood.js, test-flood-front.js |
| `water/ext/62b-core-water-flood-draw.js` | 8.0 | [G shader] | 0 | 0 | 0 | 0 | 0 | 1 | 7 | 0 | 0 | 0 | 0 | the flood ribbon lifted to the level in the vertex shader, on drawFlow's look; GLSL checked against the twin, not judged on a GPU |
| `water/geyser/52-core-water-geyser.js` | 16.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `water/geyser/52b-core-water-geyser-draw.js` | 13.5 | [G shader] | 0 | 0 | 0 | 0 | 0 | 3 | 12 | 0 | 0 | 0 | 0 |  |
| `water/geyser/52c-core-water-thermal.js` | 28.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `water/geyser/52d-core-water-thermal-draw.js` | 7.7 | [G shader] | 0 | 0 | 0 | 0 | 0 | 3 | 10 | 0 | 0 | 0 | 0 |  |
| `world/41-world-fields.js` | 40.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `world/42-world-roads.js` | 11.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `world/45-world-host.js` | 5.1 | [web] | 9 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `world/48s-world-sites.js` | 19.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `world/80-world-sky.js` | 9.1 | [G native] | 15 | 1 | 0 | 0 | 0 | 3 | 12 | 0 | 0 | 0 | 0 | shader hook inside |
| `world/81-world-terrain.js` | 11.8 | [web] | 10 | 1 | 0 | 0 | 3 | 2 | 5 | 0 | 0 | 0 | 0 | split: data inside host code |
| `world/83-world-water.js` | 2.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `world/83w-world-seas.js` | 3.9 | [web] | 2 | 0 | 0 | 0 | 3 | 0 | 1 | 0 | 0 | 0 | 0 |  |
| `world/84-world-nursery.js` | 13.0 | [web] | 8 | 0 | 0 | 0 | 6 | 1 | 10 | 0 | 0 | 0 | 0 |  |
| `world/85-world-flora.js` | 13.8 | [web] | 4 | 0 | 0 | 0 | 5 | 2 | 0 | 4 | 0 | 0 | 0 |  |
| `world/86-world-floor.js` | 6.0 | [web] | 5 | 0 | 0 | 0 | 5 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `world/87-world-places.js` | 2.7 | [web] | 6 | 0 | 5 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `world/88-world-towns.js` | 9.0 | [web] | 20 | 0 | 0 | 0 | 2 | 2 | 0 | 3 | 0 | 0 | 2 |  |
| `world/88s-world-sites.js` | 20.0 | [web] | 26 | 0 | 0 | 0 | 2 | 5 | 0 | 5 | 0 | 0 | 0 |  |
| `world/90-world-camera.js` | 13.5 | [web] | 3 | 3 | 7 | 14 | 0 | 1 | 0 | 0 | 2 | 0 | 0 |  |
| `world/91-world-probe.js` | 12.5 | [web] | 0 | 0 | 1 | 0 | 3 | 6 | 0 | 0 | 0 | 0 | 0 |  |
| `world/98-world-start.js` | 6.7 | [web] | 0 | 1 | 2 | 0 | 5 | 0 | 0 | 0 | 0 | 0 | 1 |  |

## Notes

Tags set by hand from `GODOT-PLAN.md` section 5 (2026-10-02). The "split" rows each hold one or two browser
lines inside otherwise engine-neutral code: the download helpers and the reads of `performance.now` for timing.
They move to `core/host/` in Phase 1; until then the lint reports them as warnings. `core/atmos` was split on
2026-10-02: its browser lines are in `89-atmos-9-host.js` ([web]), and the host passes time in as `dt`.
