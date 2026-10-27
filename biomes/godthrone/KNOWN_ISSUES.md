# godthrone: known issues

- [ ] **The station is compressed** (an ideal type, as every station is): on 4.23 the summit vent's pit lies ~27 km from the
  main caldera wall, and the Ancients' tunnels from Pluton would reach the rim on the south-west, across the caldera from
  the vent. The page puts the pit, ~1 km of floor, the wall and the portal in one 9.6 km map, the wall north-east of the
  vent (its true bearing). The owner's call (PLAN.md section 10).
- [ ] **The 4.23 wall is a smooth 9 km ramp on the raster** (2 km a pixel cannot draw a scarp); the page draws the scarps it
  stands for: six collapse terraces of 300-640 m, each lip wandering, each height swinging +-30% along the wall, the rim
  kept at 25,000 m.
- [ ] **The vent is fuming, not fountaining.** Whether it is active (fountaining every few years) is open (PLAN.md section 10);
  the lava material has `erupt` and the weather has the ash modes, but no fountain is drawn.
- [ ] **The titanium basalt's grain is a stand-in**: `rock.basalt.flowbanded` grey under KSTRATA's colours (PLAN.md section 8
  allows a tint; `core/materials/PROMPTS-NEEDED.md` section 20 has an optional prompt for its own set).
- [ ] **The bead horizons alias away past ~300 m**: the tibasalt beds are 0.1-15 m, so at a distance the walls read black;
  the far country draws the column's colour averaged over 40 m.
- [ ] **The ground is 10 m a cell** (2.5 m at the vent's cone, an inset): close to a scarp its faces are facets.
- [ ] **The temperature field is a stand-in**: the 4.23 mean (-75 C) swinging +-22 C with the sun's height, until core/atmos has
  a temperature field (core/hazard's ambient bridge reads it).
- [ ] **The map's edge shows from the rim**: the field's ground (its library layers) and the far country's vertex colours
  differ in grain, so the 9.6 km square reads against the caldera floor beyond it from high up (the colours are matched in mean).
- [ ] `build.py` keys the strata's three.js half `35s-core-strata-shade.js` so it loads after the data half (found here: the
  core README's adoption line sorted it first; the line is fixed).
