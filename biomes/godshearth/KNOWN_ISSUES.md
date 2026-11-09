# Godshearth: known issues

Open items (`- [ ]`) are read by `build.py`'s closing line. The plan's open questions for the owner are `PLAN.md` section 9.

## Station 1, the Hot Lake (`stations/prismbasin`, `dist/godshearth.html`; 2026-11-09)

- [ ] **No vent records on the model** (PLAN.md section 8, model amendment 1: the owner's to authorize). The vent line (`47b`) and the geyser field's
      vents are the page's own, ideal type. When the model's vents exist, `47b`'s `GH_VENTS` and the field's centre should come from `DATA.vents`, and
      station 1 may move onto them (PLAN.md section 9, "The pinned stations").
- [ ] **The rim dress stands in for the caldera dress** (PLAN.md section 4: 8-18 m stalks, 2-3 m fans; the Hearths kit's own work and the owner's to scale).
      The grove draws `HEARTH.layout` in the rim dress (4-11 m, 1.2-2 m fans).
- [ ] **The Hearths' species are tagged for ET, Dsc and Dfc** (`biomes/hearths/src/50`); Godshearth's floor is Cwb/Dwb. The Hearths kit's records.
- [ ] **The boil cup, the shade cap and the animals are not built** (the Hearths kit's next steps): the lake's warm margins carry none of the plan's boil
      cups, and no fin-mouse, fin-owl or hearth-stalker walks the grove.
- [ ] **The hot lake's vents** (WATER.spring's thermal ramp at its bed) and the katabatic night wind (core/atmos, the shared amendment) are owed. The
      lake is a plain still WATER.open; its steam banks (89x) thicken with the cold.
- [ ] **The walls are out of sight.** The caldera's walls stand 40-90 km off; the far field reaches 14 km and the camera 16 km (the geyser field
      stage's). A clear high basin would show them: a painted ring, or a far field past 14 km on the field stage, is a later pass.
- [ ] **The meadow's turf is paint only.** The floor's frost-hardy turf is the ground's `grass` layer; the yareta cushions stand on it. The geyser kit's
      ichu was tried and dropped: its library set (`st.ichu`) is pale straw (mean 211,204,190), white dots on this dark turf. A turf plant of its own,
      Oidong's cushions and snow lotus on the benches and Xanadu's dry-country species up the spillway (PLAN.md section 4) are owed.
- [ ] **No frost on the ground.** The night's cold is a KHAZ field (89x) and the snow lies off the warm ground in a snowfall (`?snow=1`), but no hoar
      frost whitens the meadow on a clear night.

## Done (2026-11-09)

- **The grove's weight.** The vent line's two western segments and a 100 m reach: 1,775 hearth trees, 3.7 M triangles (it was ~4,500 and 9.4 M);
  the scene 5.1 M (verify.py --assert, SwiftShader).
- **The climate.** The model holds the owner's since scale model 5.1 edit 1 (f1d1501cf). The page gives the day and the night: KHAZ's temperature
  by the season and hour on the host's clock (89x: +23/+6 on a summer day and night, +6/-11 in winter on the open floor, -17 in the shore's cold-air
  pools, the vents' warm ground near the ground).
- **The snow that lies** stays off the warm ground (ATMOS.snowBare from KTHERM and the geyser kit's heat; the cover is the field stage's).
- **The sinter terraces** down to the lake: eight rimstone pools on a built mound (WATER.terraces), checked tread by tread.
- **The page's middle** is now in PLAN.md section 7's table.
