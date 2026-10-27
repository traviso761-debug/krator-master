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
- [ ] **The 4.23 raster draws the wall as a smooth 9 km ramp**; the pages draw the scarps it stands for (the owner keeps the
  terraces). Whether 4.24 carries scarps on the raster is open.
- [ ] **Close to a scarp its faces are still facets** at 8 m; an inset per hero face would be the next step.
- [ ] `build.py` keys the strata's three.js half `35s-core-strata-shade.js` so it loads after the data half (the core
  README's adoption line is fixed to say so).
