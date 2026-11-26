# godthrone: known issues

Closed 2026-10-27 (the owner's answers to station 1, `PLAN.md` section 10):
- [x] **The station was compressed**: now two pages on one frame at 4.23's distances: the summit vent (`godthrone.html`) and
  the caldera wall (`godthrone-wall.html`, `build.py --station wall`).
- [x] **The vent only fumed**: it fountains every 10 minutes of the page's clock for 2 (`89b-host-vent.js` `VENT_CYCLE`), the
  fountain's hazard record and the drawing on one cycle; the Fountain button and the fountain views jump the clock to it.
- [x] **The bead horizons aliased away past ~300 m**: past 150-600 m from the eye a face shows the column's colour averaged
  over 6 m, its contrast raised (`84-host-ground.js` BAND), read at KSTRATA's stratigraphic height.
- [x] **The map's edge showed from the rim**: within 700 m of the square's edge the flat ground eases into the far country's
  own colours, and the far country no longer tints the benches its own way.
- [x] **The ground was 10 m a cell on the wall**: the wall's page bakes its field at 8 m (the vent's page keeps 10 m and its
  2.5 m inset at the cone). PERF.md has the cost.
- [x] **The temperature field**: the held mean swinging with the sun stays (the owner: as built).

Open:
- [x] **The titanium basalt's grain was a stand-in**: `rock.basalt.titanium` (delivered 2026-10-27) is wired as `rockFace` and `rock`
  (2026-11-04, the rebuild turn).
- [ ] **The 4.23 raster draws the wall as a smooth 9 km ramp**: the owner (2026-10-27): the next scale-model edit (4.24) carries
  the terraces as the pages draw them (`45-host-stage.js` TER_MAIN, `wallAt`). Handed to the main session (the model is shared).
- [x] **Close to a scarp its faces were facets** at 8 m: the wall's page bakes two 2 m insets under its close views (the
  flows' ledges show); the rest of the wall stays 8 m.
- [x] **The lava lake does not overflow** (by default it still stops 15 m under the lip): opened with `?overflow`, the vent's
  page runs the lake's overflow on core/terrain's KLAVA (`89d-host-overflow.js`, `core/terrain/LAVA.md`; 2026-10-27): the
  eruption scaled so 0.25 km3 pours over the lowest lip, the flow on 80 m cells, frozen into the field and the ground mesh.
- [ ] **The overflow dams itself**: of the 250 Mm3 that more than fills the pit, about 37 Mm3 pours through the 80 m notch
  before the flow's own frozen front raises it; the lake then freezes about 10 m over the lip. Physical (lakes build their
  rims), but a bigger flow would need a wider notch or a margin-first freezing model (`core/terrain/LAVA.md`, Known limits).
  The whole scenario costs about 25 s of compute, spread over the time-lapse's frames (`computing…` on its line).
- [ ] **The overflow's flow is on 80 m cells** (the sim's cost: the cells with lava times the steps): its edges are stepped
  beside the 10 m ground, both the glowing surface and the glassy deposit's paint, and the crest cells by the lip take both the frozen lake's re-bake and the flow's deposit (a few
  metres of bump at the lip). The hazard record covers the sim's box with `avoid: false` (a static nav zone cannot follow a
  moving front; Godot's port rebuilds zones from `front()`).
- [ ] **The lake's re-baked floor keeps the old terrain shadows** (KHORIZON is baked once at load): the frozen lake is shaded
  as the empty pit was near its walls.
- [ ] `build.py` keys the strata's three.js half `35s-core-strata-shade.js` so it loads after the data half (the core
  README's adoption line is fixed to say so).
- [x] **Station 2's lobate flows**: four eruptions frozen by core's lava-flow module (KLAVA.bake, 40 m cells), baked once at
  build time by `stations/flank/bake-flows.js` (node, ~45 s; re-run only when its inputs' hash changes) into the committed
  `stations/flank/flows.json`, inlined as FLOWS_DATA; levees and central channels sculpted from each flow's edges (KLAVA freezes a
  whole column at once, so they do not form in it).
- [ ] **The flank's flows are thin** (1-6 m, 31% of the map): titanium basalt is very fluid (PLAN.md section 3: "thin flows,
  long ones, smooth plains"), so they read by their surface (clinker on the levees and older flows, the youngest glassy) and
  in a low sun more than by relief. Thicker flows want KLAVA's yield strength raised or larger eruptions (a look decision).
- [ ] **Station 2 has no lithic texture of its own**: it shares station 1's (the black beads, the titanium basalt's grain).

The rebuild turn (2026-11-04, in the cloud: no GPU; software GL only, PLAN.md section 9b):
- [x] **The GPU verify (2026-11-08) found three faults SwiftShader hid**: (1) the stations' ground read 17-20 texture units over the GPUs'
  16 (twelve fixed: the paint, detail, rock face, band, KSTRATA's five, KHORIZON's two, core/atmos's cloud-shade noise volume; one per
  KGROUND layer with a map): `84-host-ground.js` now leaves out a layer whose weight is zero on every vertex of the ground as drawn (the
  summit's beads, glass and spatter on stations with no halo, rampart or glass), and `verify.py` asserts `ground-texture-units`
  (window._groundUnits, counted when read) against 16 in any GL. Four mapped layers fill a page: the bloodfalls had five, and its
  palagonite layer went (3.5% of its ground; the paint and the faces' tint still carry it). (2) The Red Gill's throat records counted pipes
  as their content; the great gill's throat has none within 30 m: the record is the crack's floor (`ground:true`). (3) The flank's ash check
  read `RILLE.depth`, which KRELIEF.rille's record does not keep, so it sampled nothing: it now reads the wall's height per point (the plain
  over the floor) and samples across the rille's line (1304 samples, 14% ash and ignimbrite).
- [x] **core/shadow's `KSHADOW.units` undercounts** (fixed in core 2026-11-08: it counts sampler3D and the array, shadow and integer forms; 84 now uses core's count): its pattern (`uniform sampler2D|samplerCube`) misses `uniform highp sampler3D uNoise`
  (core/atmos's cloud shade), one short on every ground that takes it, so its "fits" can pass a material that will not link. 84 counts with
  its own pattern until the core fix (outside this kit).
- [ ] **Not GPU-verified**: every page passed its checks in SwiftShader (HANDOFF-REBUILD.md's turn paragraph lists what ran); the coordinator's
  GPU lane runs `verify.py --assert --all-views` and measures KSHADOW (`?shadow=1`) and the relief's cost. PERF.md has no new rows.
- [ ] **The ground's relief is on by default** (`?kgrelief=0` turns it off): judge it on the owner's eye. In software GL the bead sand's glints
  read as strong white flecks under the bumped normal on station 1's halo; possibly SwiftShader's derivatives, possibly the look.
- [ ] **The Red Gill's drawing is a port**: `stations/gills/87-host-gills.js` is xanadu's `stations/gills/87-host-gills.js` with the Red dress;
  lifting it into `biomes/gills` as one host fragment both read is owed (two copies now).
- [ ] **GILLS.layout's radial form is still ring arcs** (biomes/gills/BIOME-API.md): the Red Gill and the ladder's cracks are arcs of a 60 km
  radius (straight to centimetres over 1.6 km), not a true radial geometry.
- [ ] **The Red ladder is its top rungs only** (8.2-8.9 km): the ladder's 80 km (7.2-8.7 km, px 900-940) cannot be one 9.6 km page. Every pipe
  on it is iced (over 7 km, the gills plan's table), so the out-breath's steam on it is the frost jets' (no live mouth).
- [ ] **The bloodfalls rust faster than core's look** (`tau` .45 s in place of the `blood` look's 1 s), so the curtain is red by its foot
  (a 1.3 s fall); a look decision. **The falls face south**, so with the noon sun in the north (the site at ~50 S) the cliff and the
  curtain stand in shade by day (the station's day view is dark against the lit outwash); a morning or evening view, or the owner's call on
  the hour. The red pool read near-white in SwiftShader (the sky's reflection at a grazing angle?): to judge on the GPU. The rust terraces are the ground's paint and `ground.rust.terrace`, not stepped relief; the pool's
  faint steam is not drawn.
- [ ] **The rim's site is a crest no wall station stands under** (PLAN.md 7a); its overturned flap is core's `canyon` recipe flipped (the
  crater's pre-impact beds are not in the lore: a look and lore decision).
- [ ] **The tube's vault is lit only by lamps** (a ShaderMaterial: no sun, no sky, no fog, no KSHADOW); its rock is KCAVERN's 1.5 m cells,
  so its walls are coarse close up; meshing it takes ~26 s at load in software GL (8,715 chunks, 333k triangles; not measured on a GPU). The
  tubes stop 700 m from the vault (sealed; the network beyond is lore). Five of its 494 columns stand a little off the floor's cells.
- [ ] **The generic negative "every card lifted 6 m off its branch" cannot fail on a page with no cards** (core/biome's guardNegatives:
  0 of 0 cards): every station but the summit has none (Pele's hair is the kit's only card), so `verify.py` leaves it out on such a page
  rather than passing it. A core fix (skip it when nothing is audited) would reach every build.
