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
- [ ] **The titanium basalt's grain is a stand-in**: `rock.basalt.flowbanded` grey under KSTRATA's colours (PLAN.md section 8
  allows a tint; `core/materials/PROMPTS-NEEDED.md` section 20 has an optional prompt for its own set).
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
