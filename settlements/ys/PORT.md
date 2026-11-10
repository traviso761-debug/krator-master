# settlements/ys: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 257 (22%) | 18 (1%) | 96 (8%) | 106 (9%) | 717 (60%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.4 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/35-furn-frame.js` | 7.1 | [draw] | 2 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/42-offices.js` | 15.5 | [draw] | 12 | 0 | 0 | 0 | 0 | 11 | 0 | 2 | 0 | 0 | 0 |  |
| `src/52-sky-abc.js` | 31.1 | [G native] | 19 | 0 | 0 | 0 | 0 | 15 | 0 | 0 | 0 | 0 | 0 |  |
| `src/54-mat-concrete.js` | 4.4 | [draw] | 8 | 2 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/56-sky-d.js` | 5.9 | [G native] | 3 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/57-sky-e.js` | 3.8 | [G native] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/58-sky-f.js` | 7.3 | [G native] | 1 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/60-hyk-mat.js` | 11.4 | [G shader] | 21 | 7 | 0 | 0 | 0 | 13 | 4 | 0 | 0 | 0 | 0 |  |
| `src/60-ys-registries.js` | 3.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/61-hyk-shell.js` | 15.8 | [draw] | 15 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 |  |
| `src/62-hyk-helpers.js` | 23.6 | [draw] | 5 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/64-hyk-accrete.js` | 16.6 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/64b-ys-ruins.js` | 7.4 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/65-hyk-spans.js` | 27.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | draws through the Hykkousoi shell kit (hykPut, hykLathe, hykTube): no `THREE.` for the counts to see |
| `src/66-hyk-furniture.js` | 26.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 73 | 0 | 0 | 0 | 0 | 0 |  |
| `src/66-office-c.js` | 4.6 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/69i-host-ancients.js` | 14.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/69j-host-offices.js` | 5.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/70-hyk-housing.js` | 68.3 | [draw] | 5 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/71-hyk-shops.js` | 50.6 | [draw] | 2 | 0 | 0 | 0 | 0 | 39 | 0 | 0 | 0 | 0 | 0 |  |
| `src/71-port-terrain.js` | 21.0 | [draw] | 12 | 2 | 0 | 0 | 0 | 1 | 10 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/71-sky-h.js` | 5.4 | [G native] | 3 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/72-hyk-hospitality.js` | 33.9 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/73-hyk-sacred.js` | 14.1 | [draw] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/74a-hyk-amphitriton.js` | 29.4 | [draw] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/74b-hyk-citadel.js` | 22.7 | [draw] | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | draws through the Hykkousoi shell kit (hykPut, hykLathe, hykTube): no `THREE.` for the counts to see |
| `src/74b2-hyk-arena.js` | 11.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/74c-hyk-tides.js` | 20.2 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/74d-hyk-winds.js` | 10.3 | [draw] | 1 | 0 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 | 0 |  |
| `src/74e-hyk-pharos.js` | 13.1 | [draw] | 7 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/74f-hyk-civic-minor.js` | 34.0 | [draw] | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/75-hyk-harbour.js` | 36.9 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/76-hyk-industry.js` | 45.8 | [draw] | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/76b-hyk-warehouse-round.js` | 2.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/77-hyk-military.js` | 29.9 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | draws through the Hykkousoi shell kit (hykPut, hykLathe, hykTube): no `THREE.` for the counts to see |
| `src/78-hyk-agri.js` | 14.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | draws through the Hykkousoi shell kit (hykPut, hykLathe, hykTube): no `THREE.` for the counts to see |
| `src/79-hyk-markets.js` | 18.3 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | draws through the Hykkousoi shell kit (hykPut, hykLathe, hykTube): no `THREE.` for the counts to see |
| `src/79z-ys-matlib.js` | 6.3 | [G shader] | 2 | 0 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 |  |
| `src/82-apartments.js` | 8.9 | [draw] | 6 | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89m-sky-k.js` | 42.2 | [G native] | 42 | 1 | 0 | 0 | 0 | 23 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89x-ys-trades.js` | 6.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/8aj-alt-a-bole.js` | 16.0 | [draw] | 14 | 0 | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8aj-alt-b-stack.js` | 9.9 | [draw] | 6 | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8aj-alt-c-hotel.js` | 7.9 | [draw] | 4 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8ak-alt-a-houses.js` | 24.8 | [draw] | 28 | 0 | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8al-alt-01-office-terrace.js` | 6.9 | [draw] | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8al-alt-06-library.js` | 6.7 | [draw] | 4 | 0 | 0 | 0 | 0 | 4 | 0 | 1 | 0 | 0 | 0 |  |
| `src/90-ys-scene.js` | 7.7 | [web] | 11 | 0 | 1 | 0 | 0 | 4 | 0 | 1 | 0 | 0 | 0 |  |
| `src/91-ys-probe.js` | 8.1 | [web] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |  |
| `src/91t-ys-tags.js` | 3.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | REG into core/tags before the take (core/tags/README.md); Ys's spellings mapped, 0 unknowns |
| `src/92-camera.js` | 7.5 | [web] | 6 | 3 | 7 | 1 | 0 | 2 | 0 | 1 | 1 | 0 | 0 | what stays of the camera on core/host: ui, uiButton, setView with a preset's hour, compass and Inside, the inspector's words, Inside, the compass (2026-10-15) |
| `src/93-ys-ui.js` | 3.6 | [web] | 5 | 0 | 3 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/99-start.js` | 3.3 | [web] | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | KHOST.take: views, ground and the sea's floor, records, inspector words, cutaway units from ROOMS, minimap; FRAME_HOOKS before the camera: host shell |
| `targets/city/77-voth-townhouses.js` | 11.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/city/84-city-geo.js` | 12.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/city/84b-city-shore.js` | 8.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `targets/city/86-bio-45-city-init.js` | 1.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/city/86-city-edits.js` | 2.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/city/87-city-layout.js` | 14.1 | [G data] | 3 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | split: the layout is records; only the debug overlay draws (move it to its own fragment) |
| `targets/city/87b-city-nav.js` | 9.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `targets/city/87c-city-paint.js` | 5.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/city/87d-city-karst.js` | 5.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/city/88-city-place.js` | 72.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | pass 1 of P3: the placement as records on KRAND (blds, hosts with plates and pods, slots, moles); reads the layout and terrainH only |
| `targets/city/88-city-spans.js` | 17.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/city/88-city-sunk.js` | 5.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the drowned grid's sunk ruins as records on KRAND, after the bridge graph (PLACE.ruins, grid:true); reads the layout, SPANS and terrainH only |
| `targets/city/88a-city-floors.js` | 6.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/city/88b-city-draw.js` | 24.8 | [draw] | 6 | 0 | 0 | 0 | 2 | 0 | 2 | 2 | 0 | 0 | 0 | the draw pass: reads PLACE and calls HYK.place, ysPlaceHost, HYK.placeOn; decides nothing |
| `targets/city/88c-city-foreign.js` | 22.2 | [web] | 3 | 0 | 0 | 0 | 2 | 0 | 1 | 1 | 0 | 0 | 0 |  |
| `targets/city/89-city-biome.js` | 14.0 | [web] | 1 | 0 | 0 | 0 | 2 | 3 | 0 | 1 | 0 | 0 | 0 |  |
| `targets/city/89z-rows.js` | 0.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/city/91z-views.js` | 10.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/city/93z-city-api.js` | 16.8 | [web] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | the probe: _api.city.place()/records() and the city invariants on window._api |
| `targets/city/94-city-editor.js` | 21.5 | [web] | 8 | 0 | 18 | 4 | 0 | 1 | 1 | 4 | 1 | 0 | 0 | the city's live building editor; its keys after core/host's camera (KHOST.onTake) |
| `targets/kit/84-kit-geo.js` | 0.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/kit/89z-rows.js` | 6.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/kit/91z-views.js` | 0.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/mock/84-mock-geo.js` | 0.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/mock/86-mock-houses.js` | 13.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/mock/88-mock-build.js` | 6.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/mock/89z-rows.js` | 0.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/mock/91z-views.js` | 1.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |

## Notes

(none yet: the split lists and the overrides go here)
