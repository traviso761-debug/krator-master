# biomes/korona: known issues

Open items are `- [ ]`; `build.py` counts them. Close an item when the fix is in and verified.

- [ ] **Two traps do not move.** The bear traps' jaws, the ground stars, the trap pads and the numb thorns go off in the
  shader (`50`, `trapHook`: hinge, fold, whip on the trap cycle); the coil tendril and the man-eater's lid are merged
  bucket geometry and stay still. A tendril should lift its end, a lid drop: the same cycle on a per-plant uniform or
  an instanced end piece.
- [ ] **No glow.** The lace fan tree should glow at dusk (the northern highlands' bell-bulbs' emissive, raised by the
  night) and the monkeycup rims faintly blue; the page has no night uniform on these materials yet.
- [ ] **No `core/atmos`.** The notes ask for the pressure preset (1.3 atm on the table, 1.7 in the gorge and the hollow,
  2.1 at the salt: the dense-air look) and the giant's light at night; the pages run on the hyperjungle's sky as the
  necanyons page does.
- [ ] **The hazard key.** `core/tags` has no `hazard` key; the danger rides on `trap.danger` (`BIOME-API.md`). Propose the
  key (`core/tags/PROPOSAL.md`) and the Throne's CO2 hollows and the natives' punji pits take it too.
- [ ] **The ecotone species are not read.** The notes name the nwlowlands' bamboo, ferns and glow-willows for the lake
  shores (the fertile basin) and the nhighlands' crag pine and beard lichen for the dry crests (the trenches); the pages
  draw the hyperjungle and the necanyons kit only. Read those two kits in place the way the kipuka station does.
- [ ] **The trenches' lee has nothing of its own.** The rain shadow is bare scree by design, but the eastern desert's
  Socotran palette (`biomes/sedesert`) is the right neighbour for it; nothing is read from it yet.
- [ ] **The salt lake and the Tiers' lake are flat discs at the stage's edge**, far above their true depth (the trenches'
  walls are 4 km). A station cannot hold that; the open world will.
- [ ] **The tepui is one record.** The open world wants many tables placed from the scale model's ring crests
  (`NOTES.md`, "The ground"); the station builds one by hand (`STAGE.bodies`).
- [ ] **Two textures came off their prompts** (`core/materials/PROMPTS-NEEDED.md`, "Delivered 2026-10-19, Korona"):
  `ground.quartzite.black` is pale with black patches (the summit reads lighter than Roraima's crust), `ground.peat.black`
  a rusty moss rather than black peat. Usable; a redo is the owner's call.
- [ ] **The gorge's ground is the kit's own, not the desert's.** The sedesert pack's ground layers are left out of the
  gorge's page (as the ring isles leave them out); the floor wears Korona's gravel, sand and bog families. A red desert
  soil family for the gorge (the sedesert's `ground.redsoil` is in the library) is a one-line addition to
  `materials.json` when wanted.
- [ ] **The hoar table's walls have no icefalls.** The seep lines are bare rock (the staghorns are barred there); the notes
  want the hanging gardens frozen to ice. A hung ice card (`ice.glacier` is in the library) on each seep line.
- [ ] **Not in the gallery.** Six pages (`dist/korona.html`, `korona-hollow.html`, `korona-basin.html`,
  `korona-trench.html`, `korona-gorge.html`, `korona-hoar.html`) with five texture sidecars shared between them
  (`korona.tex.korona.js`, `.necanyons.js`, `.hyperjungle.js`, `.sedesert.js` for the gorge, `.ehigh.js` for the hoar table).

## Closed

- The plateau texture tiled visibly and plants floated at the walls' feet (the owner, 2026-10-19): the top, floor and
  wall sample their maps twice at different scales mixed by the map's own coarse luminance (`47`, `kdither`), and the
  ground grid is 8 m (it was 16: the talus is steep).
- The table read as a stack of drums: the beds weather (`KSTACKS weather`, from the necanyons branch), step in up the
  table, carry black streaks by angle, the rims curve in over their top fifth (`STAGE.rimCh`, about 23 degrees off the
  vertical), and the table stands on a forested apron.
- A density bug (an undefined meadow bias read as 1) put 918,000 cobra lilies on the first page and stalled the
  headless harness for its whole timeout; a station's extras (`cobraMeadow`, `rainbowfanFloor`) now default to 0.
