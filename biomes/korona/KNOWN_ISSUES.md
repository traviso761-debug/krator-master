# biomes/korona: known issues

Open items are `- [ ]`; `build.py` counts them. Close an item when the fix is in and verified.

- [ ] **The punji-pit lids show the whole litter atlas** (found 2026-10-23, `TODO.md`, "Card sheets shown whole"). The
  `lid` slot takes `card.litter` (a three-by-three atlas of forest debris) with no `cell`, and its geometry (`G.pad()`,
  `50-biome-korona-species.js`) is not cut with `cellUV` as every other Korona card is, so each lid is the whole sheet of
  nine pieces. Fix: `cellUV(G.pad(), CELL(k))` on the leaf-pile piece, or a `cell` in `materials.json` (`BIO.libSwap`
  windows it); then rebuild and screenshot a pit.
- [ ] **No glow.** The lace fan tree should glow at dusk (the northern highlands' bell-bulbs' emissive, raised by the
  night) and the monkeycup rims faintly blue; the page has no night uniform on these materials yet.
- [ ] **No night.** `core/atmos` is bound (2026-10-19: `89w-host-water.js`, its clock and skylight for the water, its
  export section) with the hour pinned at 13; the giant's light at night, the dusk glow (above) and the weather wait for
  a day cycle on the page. The station's pressure is a record (`STAGE.air`, exported with the layout: 1.3 atm on the
  table, 1.74 in the hollow, 1.44 in the basin, 2.1 at the salt, 1.7 in the gorge, .8 on the hoar table) and changes
  nothing drawn: the dense-air look (a heavier haze with the pressure) is the owner's call, since the six pages' fog was
  judged as it is.
- [ ] **The hazard key.** `core/tags` has no `hazard` key; the danger rides on `trap.danger` (`BIOME-API.md`). The key is
  proposed (`core/tags/PROPOSAL.md`, "A hazard key", 2026-10-19); when it lands, the Throne's CO2 hollows and the
  natives' punji pits take it too.
- [ ] **The salt lake and the Tiers' lake are flat discs at the stage's edge**, far above their true depth (the trenches'
  walls are 4 km). A station cannot hold that; the open world will. Since 2026-10-19 they are `core/water` still
  records like every pool (`89w-host-water.js`); the open world will make them `WATER.open` surfaces on a shore window.
- [ ] **The tepui is one record.** The open world wants many tables placed from the scale model's ring crests
  (`NOTES.md`, "The ground"); the station builds one by hand (`STAGE.bodies`).
- [ ] **Two textures came off their prompts** (`core/materials/PROMPTS-NEEDED.md`, "Delivered 2026-10-19, Korona"):
  `ground.quartzite.black` is pale with black patches (the summit reads lighter than Roraima's crust), `ground.peat.black`
  a rusty moss rather than black peat. Usable; a redo is the owner's call.
- [ ] **The hoar table's pavement is drawn on rings.** The table's top carries the station's knolls and its tarn's basin
  through `STAGE.topExtra`; the drawn top reads that function (`KSTACKS.mesh` through the export, on 150 rings and 1,200
  segments for a top with relief: about 10 m), so the basins and the knolls are drawn; a gridded top would be cleaner
  than a 180,000-vertex ring fan.
- [ ] **The man-eater's lid is a flat card.** It is an instanced disc hinged on the back of the rim (it moves on the trap
  cycle); a proper Nepenthes lid (a dome with a spur, veined) wants its own geometry when the plant is redone.

## Closed

- **Water and air on the core** (2026-10-19, the core adoption audit, `CORE-ADOPTION.md`): the stream is a `WATER.flow`
  (its ribbon drawn by `core/water`), every pool and every rain pool on the rock a `WATER.still` record, all drawn as one
  mesh on `WATER.stillMaterial` (the sky in them from `core/atmos`'s skylight, the ripple on the module clock); the
  export's `atmos` and `water` sections fill and `verify.py` requires them (every station's export box holds a water
  record). Before, `47` drew a disc per pool and the stream on a plain material, and the page had no `core/atmos`. Found on
  the way: the gorge's spring was under its own floor (a wide shallow bowl on a sloping, wadi-cut floor: the spill point `47`
  samples on the shore ring sat below the basin), so its basin is levelled to the spring's centre and dipped 4 m with a
  steep bank; the spring shows for the first time.
- **Two traps did not move** (2026-10-19): the man-eater's lid is an instanced card hinged on the back of its rim on the
  hinge hook (up while the trap waits, dropped flat over the mouth when it shuts) and the coil tendril's last quarter an
  instanced rod on the whip hook (lying on along the coil, standing up on the grab), both on the trap cycle (`50`, `57`;
  the library's skins copied onto them after the swap).

- **The ecotone species are read** (2026-10-19): the fertile basin reads the **nwlowlands** kit in place on the lake's shore
  band (`stations/basin/station.json` `kits` and `packs`; `STAGE.shore`, within ~200 m of the water, off the bog corner and the
  rock; its fields `tropic` 1 and `dry` 0): the groves, reeds and iris at the water, glow-willows and paperbarks, its ferns under
  the rainforest's edge; the trenches read the **nhighlands** kit on the crest and the dry upper lee (`STAGE.crest`, heightK
  above ~.7, off the windward rainforest; `cold` and `mist` by height, `rockExtra` on the crest so the crag pines find their
  rock): crag pines with their beard lichen, the boreal band's conifers and birches. Each runs under its own mask (`47`,
  `shoreMask`, `crestMask`; `88`), its trees obstacles to the kits after it; the inspector names both kits' plants; a host
  check each keeps them to their band, a preset view each shows them.
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
