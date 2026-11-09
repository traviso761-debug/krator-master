# biomes/korona: known issues

Open items are `- [ ]`; `build.py` counts them. Close an item when the fix is in and verified.

- [x] **The punji-pit lids show the whole litter atlas** (found 2026-10-23, `TODO.md`, "Card sheets shown whole"). The
  `lid` slot takes `card.litter` (a three-by-three atlas of forest debris) with no `cell`, and its geometry (`G.pad()`,
  `50-biome-korona-species.js`) is not cut with `cellUV` as every other Korona card is, so each lid is the whole sheet of
  nine pieces. Fix: `cellUV(G.pad(), CELL(k))` on the leaf-pile piece, or a `cell` in `materials.json` (`BIO.libSwap`
  windows it); then rebuild and screenshot a pit.
  Stays (2026-10-25): a card-sheet item for later, per the owner; not touched in this pass.
  Fixed (2026-10-26, the owner: "a buried pitcher plant with a tear-through membrane that slowly regrows after a meal"):
  the pit is rebuilt (`50`, "THE PUNJI PIT"; `57`, `punji`). A flask sunk in the ground (its digestive pool and eight
  bone spikes inside), a waxy ribbed peristome at grade, and over the mouth a membrane disguised with ONE litter cell (a
  leaf-pile cell per pit, 0, 4 or 7, picked in the shader: no more whole sheet). The membrane tears into four ragged flaps
  that hang into the pit, then the flaps lift and the tear closes over six minutes of world time on the motion clock
  (`BIO.WIND.t`: the speed buttons, pause and `?t=` drive it), pale scar tissue on the seams until the litter settles.
  Each pit's phase is `KTRAPS.phase` of its id (core/rand), so at any time about a third are torn or regrowing. The state
  is data: `KORONA.MEMBRANE` (the cycle), `KORONA.pitState(rec,t)` (pure; `KORONA.PIT_GLSL` the same arithmetic),
  `KORONA.PITS` and `tags.trap.membrane` on each pit's core/tags volume (phase, seed, hang, cell). Three instanced draws
  for all the pits (a stencil mask that cuts the ground, the body, the membrane; `KORONA.afterBake` orders them):
  +2 draw calls per page; about 300 triangles a pit (the hollow's 3,326 pits: +0.5 M). `window._punji('torn')` holds
  every pit in one state for a look. A pit now wants ground flatter than about 1 in 2 (seated on its slope): the
  table's talus kept 2 of its 14 (one stood proud of the scree, its body showing below the lip).
  The owner's review (2026-10-26, "make the lid litter flecked; can make the pool a little less red"): the peristome
  carries a broken ring of litter flecks from the same cell (a second, turned look into the pile's dense middle), so the
  red shows only in its gaps and most at the inner edge; the pool samples the throat map's pale band under a murky
  amber-olive vertex colour (it sat on the map's red middle). Same draws and triangles.
- [ ] **No glow.** The lace fan tree should glow at dusk (the northern highlands' bell-bulbs' emissive, raised by the
  night) and the monkeycup rims faintly blue; the page has no night uniform on these materials yet.
  Stays (2026-10-25): needs the night uniform, i.e. a day cycle on the page (next item) and an emissive pass; a design task.
  Stays open (2026-10-26): the glow wants a night to rise in, and the night waits on the shared sky rollout (another
  session is moving every biome onto core/atmos's sky; this kit must not touch the sky fragments). When it lands: a
  `uNight` uniform from core/atmos (the sun's elevation) on `M.lacefan` (an emissive term in the leaf hook, the lace fan's
  peach) and on the monkeycup rims (faint blue), as the northern highlands' bell-bulbs do.
- [ ] **No night.** `core/atmos` is bound (2026-10-19: `89w-host-water.js`, its clock and skylight for the water, its
  export section) with the hour pinned at 13; the giant's light at night, the dusk glow (above) and the weather wait for
  a day cycle on the page. The station's pressure is a record (`STAGE.air`, exported with the layout: 1.3 atm on the
  table, 1.74 in the hollow, 1.44 in the basin, 2.1 at the salt, 1.7 in the gorge, .8 on the hoar table) and changes
  nothing drawn: the dense-air look (a heavier haze with the pressure) is the owner's call, since the six pages' fog was
  judged as it is.
  Stays (2026-10-25): a day cycle and the dense-air haze are the owner's call; `89a-host-atmos.js` binds `core/atmos` with the hour at 13 and takes a night toggle when one lands.
  Available (2026-10-25): `core/atmos/fx/89-atmos-fx-snowcover.js` (`ATMOS.snowCover({base,line,frozen})`, `ATMOS.snowOnScene`) could give the hoar table a light permanent hoarfrost above a line; not adopted, since it changes the look the six pages were judged on and the page has no weather yet. Owner's call.
  Stays open (2026-10-26): the host offers an hour slider only when the sky takes an hour, and the sky is the shared sky
  rollout's (not touched here). The hoar table's snow cover (`stations/hoar/89s-host-snow.js`, 2026-10-25) is kept as is.
- [x] **The hazard key.** Done 2026-10-26 (core/hazard, branch claude/core-hazard): `core/tags` has the `hazard` key and
  `57`'s `reg` writes `tags.hazard` beside `tags.trap` for every trap of danger .3 and over (`KORONA.hazardOf`,
  `KORONA.HAZARDS` in `50`): the punji pits as pits on `KORONA.pitState` (now on the one clock, `KTRAPS.cycle`; hidden while
  the membrane is whole), the man-eaters, coil tendrils, ground stars, bear traps, snare flowers and trap pads as grabs on
  their trap's clock, the numb thorn as poison, the sucking pools as drowning. Every page's `hazards` layer shows them; the
  inspector says their state now. The Throne's CO2 hollows took it too (station 8).
- [ ] **The salt lake and the Tiers' lake are flat discs at the stage's edge**, far above their true depth (the trenches'
  walls are 4 km). A station cannot hold that; the open world will. Since 2026-10-19 they are `core/water` still
  records like every pool (`89w-host-water.js`); the open world will make them `WATER.open` surfaces on a shore window.
  Stays (2026-10-25): needs the open world's shore windows (a `WATER.open` on real depth); a station cannot hold it.
  Stays open (2026-10-26): an open-world item, out of this pass (the owner: known issues besides fauna and the open world).
- [ ] **The tepui is one record.** The open world wants many tables placed from the scale model's ring crests
  (`NOTES.md`, "The ground"); the station builds one by hand (`STAGE.bodies`).
  Stays (2026-10-25): wants the scale model's ring crests, an open-world design task.
  Stays open (2026-10-26): an open-world item, out of this pass.
- [ ] **Two textures came off their prompts** (`core/materials/PROMPTS-NEEDED.md`, "Delivered 2026-10-19, Korona"):
  `ground.quartzite.black` is pale with black patches (the summit reads lighter than Roraima's crust), `ground.peat.black`
  a rusty moss rather than black peat. Usable; a redo is the owner's call.
  Stays (2026-10-25): a redo is the owner's call (a texture owed).
  Stays open (2026-10-26): the owner's call. Redo prompts proposed (each after the base template of
  `core/materials/PLAN.md`, "Prompts for generated sources"; to go into `PROMPTS-NEEDED.md` if the owner wants them):
  `ground.quartzite.black`: "Roraima-type tepui summit pavement seen from above: quartzite sandstone weathered jet black
  by a crust of cyanobacteria and lichen over the WHOLE frame, matte charcoal to soot black, sugary grain and fine pits
  showing dark grey through it, a few hairline cracks and shallow rain pockets holding pale quartz sand, rare small
  flakes of pale pink quartz where the crust has spalled. Average brightness about 15 percent; no green, no large pale
  areas." `ground.peat.black`: "Waterlogged black peat bog floor seen from above: saturated near-black humus, dark
  chocolate to black, half-rotted fibrous plant matter and fine root threads, a few blackened sedge blades pressed flat,
  a faint wet sheen in the hollows and two or three small pools of dark tea-coloured water. No living moss, no rust or
  orange, no sticks thicker than a finger. Average brightness about 12 percent."
- [x] **The hoar table's pavement is drawn on rings.** The table's top carries the station's knolls and its tarn's basin
  through `STAGE.topExtra`; the drawn top reads that function (`KSTACKS.mesh` through the export, on 150 rings and 1,200
  segments for a top with relief: about 10 m), so the basins and the knolls are drawn; a gridded top would be cleaner
  than a 180,000-vertex ring fan.
  Stays (2026-10-25): a gridded top is a terrain-drawing redesign in `KSTACKS` (core/terrain) and the export, over an hour and a core change.
  Stays open (2026-10-26): a core change. Proposed: `core/terrain/37-core-stacks.js`, `KSTACKS.mesh`, an option
  `top:{grid:5}` that draws a top with relief as a square grid (5 m) clipped to the top's outline (the outline's ring
  stitched to the grid's edge cells) in place of the 150-ring by 1,200-segment fan, reading the same top function; the
  export's terrain section takes the same grid. The hoar station then passes `top:{grid:5}` in its `45-host-stage.js`.
  Fixed (2026-10-26, branch claude/core-terrain): `KSTACKS.mesh` opt.top `{grid:5}` (core/terrain/37-core-stacks.js); the hoar station
  passes `STAGE.stackTop:{grid:5}`, read by `47-host-land.js`. The top is a 5 m grid clipped to the edge ring, watertight with the wall, and
  the cells hidden under the bed above are left out: the pavement is 272,031 vertices and 513,488 triangles where the rings were 900,750 and
  1,788,000 (the page 10.11 M triangles at its views, from 11.39 M; 37 draw calls as before). The export reads the same mesh.
- [x] **The man-eater's lid is a flat card.** It is an instanced disc hinged on the back of the rim (it moves on the trap
  cycle); a proper Nepenthes lid (a dome with a spur, veined) wants its own geometry when the plant is redone.
  Stays (2026-10-25): a veined dome with a spur is new geometry for when the plant is redone, a design task.
  Fixed (2026-10-26): the lid is a shallow dome (0.22 m high, its edge turned down) with the spur standing up and back
  at the hinge (`50`, the `hood` def; 63 triangles where the card had 10: +0.17 M on the hollow's 3,114), on the same hinge hook and trap cycle. Its
  veins are the pitcher skin's mottle; a midrib in the map is for when the plant is redone.
- [ ] **The final rebuild's owed items** (pair 9, 2026-11-03; `PLAN.md`, "Core adoption"). (1) The necanyons kit's seep curtains and ferns
  are placed at a bed's outline, past the lip KSTACKS draws (`footR x (1 - ch)`); this page seats them on the drawn lip (`89z`, `?seat=0`),
  and the fix in `biomes/necanyons/src/57-biome-necanyons-carnivores.js` (`outR` from `lipR`) is owed to necanyons' next turn (9 build
  commands, 38 pages read it). (2) The hoar table's `polygon` ground (BACKPORT's row) wants KGROUND on the top's material (`MAT_TOP`).
  (3) Karst site 7 (the west trench rims: gypsum dolines, a salt-shore spring; `biomes/KARST-SITES-5.1.md`) waits on the trenches'
  5.1 re-survey. (4) The receiver rows (bristlecone, caribou moss, ghost gum, sea buckthorn) and the vendor rows `wallfern` and
  `bladderpool` (`KORONA.plant` takes four of six). (5) Wet ground (R9) not taken: oidong saw `WATER.wetGround` over KGROUND draw black
  (`?wet=1` to look). (6) Two banding systems on the walls (the kit's per tier, KSTRATA's per bed): the owner's eye. (7) Two vendors' items are
  left out of this kit's attach audit (`89z`, `window._auditOwed`; `?owed=0` audits them): the eastern highlands' `bloom` on the hoar table
  (82% float: flowers on the poured cushions, which the audit sees only as axes; ehighlands' own page 81.5%, pair 13) and the eastern
  desert's `bloom` on the gorge and the trenches (sedesert's own page 15.4%, its next turn), and the northern highlands' `needle` and `beard` on
  the trenches' crest (4.38% with them; its pair-7 turn, not merged here yet). Each comes back when its vendor's turn holds it.
  (8) The trenches lacked `31b-core-leafset` and `33-core-fungoid`, which nhighlands' species need since the core pass (`G.disc` threw):
  `stations/trench/station.json` lists them now. (9) KGROUND reads the eye uniform r128 leaves at 0 on a Lambert ground; this floor
  redirects it to `kEye` (`47`), the fix belongs in `core/terrain/43-core-ground.js` (necanyons' floor has the same read). (9) is closed by the core fix of 2026-11-08: `43-core-ground.js` and `30-core-foliage.js` take the eye from `viewMatrix`.

## Closed

- **Atmos host binding and the hoar sin-hash lint** (2026-10-25, the biome rebuild): `src/89a-host-atmos.js` calls
  `ATMOS.bindHost` (hour 13) as the migrated biomes do, `build.py` lists `core/atmos/host/89-atmos-c-hostbind.js`, and
  `89w-host-water.js` no longer calls `ATMOS.init` itself. The water was already `WATER.flow` / `WATER.still` with no
  workaround (no preset write, no own shader). The `OWN sin-hash` finding in `stations/hoar/45-host-stage.js` was a false
  positive (`Math.sin(a)*1000`, the radius of the spine's ring of points, not a hash); the radius is a named constant now.

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
  (2026-10-26, X4: the dither's GLSL is core now, `core/biome/31-core-dither.js` `BIO.DITHER`, the same text; `47`'s `DITHER`
  is that string and `build.py` lists the fragment. Farside took the same copy. The core ground shader, R4, is to take it over.)
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

## Open

- [ ] **The shared sky (SKY-PLAN.md section 9, 2026-10-26): the look to judge.** The painted dome and the giant mesh are
      gone; `89s-host-sky.js` calls `ATMOS.skyBiome` (core/atmos) on the host clock: the page opens at 06:00 on game start's
      day (dawn), `#hour=13` is about the old fixed light. It read the hyperjungle's dome in place (all six pages); now the
      shared sky at Korona with each page's own air (STAGE.air.pressure: tepui 1.3 here; each station's
      stations/<name>/89-host-sky.js gives its own). No ridges: the tepuis and gorges are real terrain. Draw calls per
      station before and after (verify.py --assert, GPU, all passing after; the committed basin and gorge pages passed
      before, hoar, hollow and trench failed only their export profile): basin 223 to 222, gorge 115 to 112, hoar 40 to 37,
      hollow 127 to 124, trench 220 to 217. Draw calls at the default camera (verify.py --assert, GPU): 130 before, 129
      after.

