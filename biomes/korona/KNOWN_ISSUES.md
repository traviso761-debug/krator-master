# biomes/korona: known issues

Open items are `- [ ]`; `build.py` counts them. Close an item when the fix is in and verified.

- [ ] **The traps do not move.** The necanyons clapjaws hinge in the shader (`KTRAPS.GLSL`); Korona's ground stars, snare
  flowers and coil tendrils are still. A ground star should close on a phase from its id, a tendril lift: the same
  hook as the clapjaw's lobes, on the star's pad (fold about its middle) and the tendril's end (a bend).
- [ ] **No glow.** The lace fan tree should glow at dusk (the northern highlands' bell-bulbs' emissive, raised by the
  night) and the monkeycup rims faintly blue; the page has no night uniform on these materials yet.
- [ ] **No `core/atmos`.** The notes ask for the pressure preset (1.3 atm on the table, 1.7 in the gorge and the hollow:
  the dense-air look) and the giant's light at night; the page runs on the hyperjungle's sky as the necanyons page does.
- [ ] **The hazard key.** `core/tags` has no `hazard` key; the danger rides on `trap.danger` (`BIOME-API.md`). Propose the
  key (`core/tags/PROPOSAL.md`) and the Throne's CO2 hollows and the natives' punji pits take it too.
- [ ] **The tepui is one record.** The open world wants many tables placed from the scale model's ring crests
  (`NOTES.md`, "The ground"); the station builds one by hand (`STAGE.bodies`).
- [ ] **Two textures came off their prompts** (`core/materials/PROMPTS-NEEDED.md`, "Delivered 2026-10-19, Korona"):
  `ground.quartzite.black` is pale with black patches (the summit reads lighter than Roraima's crust), `ground.peat.black`
  a rusty moss rather than black peat. Usable; a redo is the owner's call.
- [ ] **Not in the gallery.** Two pages (`dist/korona.html`, `dist/korona-hollow.html`) with three texture sidecars each
  (`korona.tex.korona.js`, `.necanyons.js`, `.hyperjungle.js`).
