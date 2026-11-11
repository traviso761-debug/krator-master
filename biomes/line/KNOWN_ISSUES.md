# biomes/line: known issues

## Open

- [ ] **The line record is this build's until the transit kit is on main** (2026-11-11). `stations/bore/48-line-gallery.js` holds the
  window's records (the section, the tracks, the lamps, the niches, the vein, the trains and their timelines, the car pose) as the
  `KTRANSIT.line` kind will (PLAN.md section 4). When `kits/ancient-transit` reaches main (the owner: merge it first), the record moves
  into the line kind and this fragment reads it, keeping its output.
- [ ] **The drawing is this build's builder** (`85-host-lining.js`, `LB`): quads and boxes by family and 100 m chunk, UVs in metres. It
  moves to `KTRANSIT.draw` with the line kind (the transit kit's `B.sweep` and the subway's swept bore are its model).
- [ ] **Three surfaces stand in for owed sets** (`core/materials/PROMPTS-NEEDED.md` section 41): the lining on `concrete.ancient` (owed
  `concrete.lining.segment`: bolt pockets, gasket joints, ring numbers), the guideways on `concrete.board` (owed `concrete.guideway`),
  the kept cars' plate on the vehicles kit's `paintWorn` (owed `metal.plate.riveted.painted`).
- [ ] **The lining's joints are colour, not geometry.** Each 2 m ring is a tone and a dark 5 cm groove; the staggered segment joints and the
  bolt pockets wait for the owed texture.
- [ ] **The tracks are crossed only at the stations' stairs.** The walkway stands 1.2 m over the invert and the guideways 0.6 m: a walker on
  the walkway cannot step down to the tracks here (the walk check runs along the east side only). The stations' stairs and the
  cross-passages (PLAN.md section 3) bring the crossings.
- [ ] **The trains run on the page's clock, four minutes a pass.** The long run's real timetable is four hours a run (PLAN.md section 2);
  the page compresses it so a train passes while you watch (`?t=` starts the clock at t).
- [ ] **No riders yet.** The kept trains carry no one; riding (`core/simulation/ride`, the riding session's) joins at phase L5 with the
  cars' `data.ride` records already in place.
- [ ] **The rock is drawn east of the east wall only** (`84-host-rock.js`): the lining hides the rest; a station with a fallen section
  (`gap`, `fault`) draws its rock where the lining is gone.
