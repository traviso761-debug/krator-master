# biomes/line: known issues

## Open

- [ ] **The line record is this build's until the transit kit is on main** (2026-11-11). `stations/common/47-line-core.js` (`LK`) and each station's
  `48-line-window.js` hold the window's records (the section, the tracks, the lamps, the niches, the vein, the trains and their timelines, the car pose) as the
  `KTRANSIT.line` kind will (PLAN.md section 4). The kind is written (`kits/ancient-transit/src/43c-tr-line.js`, `56c-tr-draw-line.js`, 2026-11-11) and sent to the
  transit session for review; once agreed, each station's window becomes `KTRANSIT.lineWindow` of one `KTRANSIT.line`, keeping its output.
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
- [ ] **G2 is shorter on the page than in the plan** (2026-11-11). The `gap` page's fall is 0.54 km (bore m 236170-236712) and its walk about
  595 m, 17 minutes; PLAN.md section 2 gives G2 as 3 km and 3-4 h at low water. The page shows the chamber's crossing at a walkable size;
  whether G2 is one chamber or a longer stretch of falls and sumps (more pages, or a longer window) is the owner's call.
- [ ] **The gap's chamber is a `KCAVERN` hall, not `KKARST` hypogene** as PLAN.md section 5 says: an ellipsoid with a flat floor and its gypsum
  crust by shader (`LINE.gypWeight`). Cropping a `KKARST` cave into the window, as the Hearths do, is the follow-up.
- [ ] **The station's rooms are stubs.** Each door opens on 3 m of hewn rock: the workshops, cistern, stores, signal room and the
  mezzanine's rooms are not built (the Tungang kit's rooms are to stay out of it: PLAN.md section 5). The branch toward Loj Twenny is
  carved 60 m into the rock and stops.
- [ ] **The great shaft is still.** Its cage and rope stand under the mouth in the vault (carved 106 m up); no hoist moves, no draught or ice
  comes down (PLAN.md section 2.1).
- [ ] **Abandoned keeps the Ancients' guideways sound** (`cond` state `built`, unkept: no plate patches, no lamp code), so the clearance and
  car-pose checks run on every state; a station whose tracks are blocked or fallen is the `fault` page's.
- [ ] **The hot door's machinery stands still and its heat has no haze.** The generators, fans and leaves do not move; the heat past the inner door
  is a hazard record and a warm describe line, not a shimmer (a heat-haze pass is owed); the cyan strips are lit but faint at a distance.
- [ ] **The cleft shrine's quartz is this page's** (`88-host-hotdoor.js` draws six-sided points on the pocket's wall): `KSPELEO` druse with a
  smoky-quartz preset is the owed core way (`openworld/ANCIENT-TUNNELS.md` cave 7). The shrine is barred by its rail, so the walk does not enter it.
- [ ] **The breach's maze is drawn rock only.** `KKARST` lays the maze and `KKARST.build` carves it, but its floors are not walk floors (only the
  chamber's are), its pools and spring are not drawn (core/water's), its hazards are not registered (one gas pool on the chamber's floor is), and
  KSPELEO's hypogene dress (gypsum crust as crystals) is a shader band only.
- [ ] **The fault's bores have no step at the shear.** The east bore's two pieces meet at the fault with no wall between their offset rings (the
  shared lining draws an end wall only between one section and several); the rubble mound and the cut lining hide the join. The twin bores are
  each a vaulted room with the gallery's lining profile, not the round bores of `KTRANSIT.line`'s owed `twin` form.
- [ ] **The portal draws its own land.** No core module meshes a ground (each build draws its own): `88-host-portal.js` bakes `LINE.groundAt`
  through `KFIELD` and meshes it at 2 m, turf by vertex colour (no library set: a tableland grass set is owed) and the cuttings' faces on the rock
  material. The page opens at the host clock's 06:00 (the owner's start), so the first look is dawn; the exposure ramp is a plain lerp by distance
  from the openings (the wells add a little), not core/atmos's eye adaptation.

