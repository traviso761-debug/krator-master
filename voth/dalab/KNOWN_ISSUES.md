# Known issues — Dalab

Open items are `- [ ]`; `build.py` prints them. Close one by ticking it and
saying what fixed it.

## Building kit (round 1)
- [ ] The mound is a real mesh (a lathe), one draw call each; a settlement with
      seven mounds and the High Priest's pays ~10 calls for them. Fine for now;
      an instanced dome-of-frustums version is the fix if the city budget bites.
- [ ] The mural frieze on a drum is a ring of flat facets tangent to the wall
      (`dnMuralRing`); seen from directly above the facets stand a few cm proud
      at their ends. Not visible at eye level.
- [ ] Windows and doors on a drum are flat boxes: on small huts (r ≈ 2.4) the
      frame corners sink ~4 cm into the wall. Cosmetic.
- [ ] `dnGiant` arms are plain tilted cylinders on the kit's cylinder-and-ball
      figure; the life layer replaces the figures.
- [ ] The Halls of Reformation's pylon cables are straight beams (`vRope`);
      no sag.
- [ ] The ring bank's lathe has no end caps; a rammed-earth revetment block
      hides each end. Looked at from inside the gap at a steep angle the
      turf's back face shows for a metre.
- [ ] Night: the hemisphere light goes blue but the ground map does not; the
      plaza fires and The God's light are unlit cards, so they do not light
      the ground round them (the Ancients kit's standing complaint).
- [ ] The Ancient lab dome (`../ancients/src/64-dalab.js`) is not in this repo;
      the settlement pass vendors it.

## Round 2
- [ ] Palace mound: the mound's own stair runs on through the three terrace
      ranges (they are built over it), so between terraces a short ramp shows
      and inside them it is buried. Reads as the stair continuing indoors;
      a proper cut-and-landing per terrace is the fix.
- [ ] Halls wing pipes cross the court at 6.5 m in straight runs; no supports.
- [ ] Windmill sails do not turn (the kit has no animation; the life layer's
      clock can rotate the four sail instances).
