# Eastern Abyssal kit — known issues (first pass, Oct 2026)

- [ ] **The eight reference images were not available** to this pass (`abyss.zip` was not in the repo or the upload);
      every form follows the brief's written description of the image. Compare against the pictures and list mismatches.
- [ ] **The ruler's title** is a placeholder: "the Headman" (palace and plaza names).
- [ ] **Hospitality lighting is a judgement call:** the inn, tavern and caravanserai burn lit oil lanterns (public
      houses open at night); the brief lights only rich, civic, sacred and palace buildings. Say if they should be unlit.
- [ ] `ind_oil_tank` variant C is "banco-clad in the Yuni manner" and sits on this sheet as the brief allows; it is not
      abyssal in style. Left unchanged.
- [ ] `locus.html --assert` crashes in `verify.py` (`A.GATES` is undefined: the Yuni-inherited world invariants), on the
      commit before this kit as well as after. The world was checked by its counters instead (identical).
- [ ] A long dark line can cross the sheet near the palace and plaza in high views: it is not geometry (nothing long
      stands there; checked by walking the instance matrices) — most likely the sun's shadow-map edge on the large sheet.
- [ ] Swoop roofs, sails and cone shells are vertex-coloured merged meshes with their own smooth normals; the ridge tube
      and horns are 8-sided, so a horn reads faceted up close.
- [ ] The cone shell's arch is cut cleanly, but the reveals are single quads per row, so a very low `arch.h` on a steep
      cone shows a stepped edge.
- [ ] `ABYSS.vessel` windows on tanks and silos are flat panes on a curved wall (they stand 0.02 m proud at the centre);
      at a raking angle their corners float a hand's width off the wall.
- [ ] Drum houses' end doors stand ~0.75 m above the deck (inside the drum's curve), reached by a plank step.
- [ ] The windpump blades are flat (no twist): a real wheel's blades are pitched. The rim rings are static (they are round).
- [ ] The tin-mirror family is Phong; under the night volume it lights like the Lambert families but its specular
      glint follows only the sun and moon, not the lamps.
- [ ] The amphitheatre's aisle stairs are stacked blocks (one per tier), not individual treads.
- [ ] The palace and plaza are 92 m wide; the sheet's whole-sheet view shows them small. Use the row button.
- [ ] Wall pieces are a straight-line system only (segments on one line, 90° corners); there is no angled joint piece.
- [ ] The citadel's corner towers stand partly over the edge of the mound's top (the mound's top is 55 m, the circuit
      48 m plus tower radii).
- [ ] No interiors: houses, inn rooms and containers are closed volumes with doors and windows (shops, the library, the
      tavern and the temple are open and furnished).
- [ ] Furniture has no sheet of its own; it is seen where buildings place it (and in the helper demo for the altar pair).
- [ ] The `abyss_helpers_demo` and `abyss_wall_run` assets are sheet-only demos (tag `demo`); the world must not place them.
