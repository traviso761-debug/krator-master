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
- [ ] **The salt lake and the Tiers' lake are flat discs at the stage's edge**, far above their true depth (the trenches'
  walls are 4 km). A station cannot hold that; the open world will.
- [ ] **The tepui is one record.** The open world wants many tables placed from the scale model's ring crests
  (`NOTES.md`, "The ground"); the station builds one by hand (`STAGE.bodies`).
- [ ] **Two textures came off their prompts** (`core/materials/PROMPTS-NEEDED.md`, "Delivered 2026-10-19, Korona"):
  `ground.quartzite.black` is pale with black patches (the summit reads lighter than Roraima's crust), `ground.peat.black`
  a rusty moss rather than black peat. Usable; a redo is the owner's call.
- [ ] **The hoar table's pavement is drawn on rings.** The table's top carries the station's knolls and its tarn's basin
  through `STAGE.topExtra`; the drawn top reads that function (`KSTACKS.mesh` through the export, on 150 rings and 1,200
  segments for a top with relief: about 10 m), so the basins and the knolls are drawn; a gridded top would be cleaner
  than a 180,000-vertex ring fan.
- [ ] **The man-eater's lid is a plate, not a lathe.** The hood is drawn as a hinged disc standing open over the mouth
  (horizontal rings, each the chord across the tilted disc), seated on the rim; a proper Nepenthes lid (a dome with a
  spur, veined) wants its own geometry when the plant is redone.

## Closed

- The open items of 2026-10-19 (the second pass): **the gorge's floor wears the desert's red soil** (`ground.redsoil`, a
  family in `materials.json`); **the trenches' lee has the eastern desert's kit** (read in place as the gorge reads it:
  dragon trees and the stands on the rain shadow's scree, thin; a `desert` mask and the kit's fields in the stage);
  **the hoar table's seep lines hang icefalls** (`47`, `STAGE.icefalls`: a strip of `ice.glacier` down the bed's face under
  every strong seep, on the wall's profile, a tag record each); the preset views that stood inside the trees look
  from over the canopy; the pavement under the knolls is drawn at about 10 m. **"Not in the gallery"** was stale: the six
  pages are in Krator Biomes and Objects v19 (the pre-pass pages; a republish is the owner's call).

- The look pass of 2026-10-19 (the owner, from the published stations): **the ground tiled as furrows and stripes** (the
  meadows of the basin, the sand of the gorge): every library map on a floor, top or wall is read through a hex-cell
  bomb (`47`, `kdither`: each cell of ~2 tiles turns and shifts the tile by its own hash, three corners blended, at the
  map's scale and at a third of it, mixed by a value noise) under a coarse luminance and hue drift (48 m and 140 m), so
  no repeat can line up and the mottle is no longer one flat field; the walls keep their beds level (`kditherW`).
  **The trenches' two faces were too alike**: the windward face wears sphagnum (a fourth floor layer, `STAGE.layers.d`)
  over litter pulled green (`STAGE.layerMul`, on the library's colour), the lee pale warm scree; the rainforest climbs
  higher and denser (`jungleQ` .9, the lace fans and great sundews biased up). **The stacks all looked alike**: every
  cluster and row draws each stack's taper, lean, girth and crown from ranges of its own (`KSTACKS` variety options;
  unasked, a layout draws exactly as before: necanyons and Pinnacle Rock proved unchanged record for record), and half
  of them are **piles of plates, Roraima's kind** (`plates`: thin beds of their own widths and outlines, deep partings).
  **The prow stood wholly inside the ridge** (its foot was set under the flanks, 260 m below the crest, and its 180 m of
  tiers never cleared it): its first tier is taller by that drop, so the bench and the cap stand 110 and 180 m over the
  crest; a stack on a slope is lifted by the ground's drop across its foot (`lift`). **Carvings wound up behind the
  talus**: a strip now stands 1.6 m over the highest drawn ground along its arc (`47` finds the bed). **The man-eater's
  hood floated** over its rim (a hinged lid now, seated on the rim); **the punji pit's thrown-back lid floated** (it lies
  on the ground beyond the rim) and **the pits read too dark** (the lid lifted 1.8x). **The frozen tarn did not read**:
  it was a water disc under the pavement's own 2.5 m bumps; it is an opaque plate of ice (`pools[].ice`) in a 3.6 m
  basin with the bumps damped, and the drawn top follows the station's relief at all (it did not before: `KSTACKS.mesh`
  read the module's own top function, not the wrapped export).

- The plateau texture tiled visibly and plants floated at the walls' feet (the owner, 2026-10-19): the top, floor and
  wall sample their maps twice at different scales mixed by the map's own coarse luminance (`47`, `kdither`), and the
  ground grid is 8 m (it was 16: the talus is steep).
- The table read as a stack of drums: the beds weather (`KSTACKS weather`, from the necanyons branch), step in up the
  table, carry black streaks by angle, the rims curve in over their top fifth (`STAGE.rimCh`, about 23 degrees off the
  vertical), and the table stands on a forested apron.
- A density bug (an undefined meadow bias read as 1) put 918,000 cobra lilies on the first page and stalled the
  headless harness for its whole timeout; a station's extras (`cobraMeadow`, `rainbowfanFloor`) now default to 0.
