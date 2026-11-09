# Godshearth: known issues

Open items (`- [ ]`) are read by `build.py`'s closing line. The plan's open questions for the owner are `PLAN.md` section 9.

## Station 1, the Hot Lake (`stations/prismbasin`, `dist/godshearth.html`; 2026-11-09)

- [ ] **No vent records on the model** (PLAN.md section 8, model amendment 1). The vent line (`47b`) and the geyser field's vents are the page's own,
      ideal type. When the model's vents exist, `47b`'s `GH_VENTS` and the field's centre should come from `DATA.vents`, and station 1 may move onto them
      (PLAN.md section 9, "The pinned stations").
- [ ] **The page's middle is 4 km west of the plan's pin** (842,1394, not 844,1394), so the lake is on the page: the pin stands about 4 km from the shore and
      the field stage's square is 2.8 km. PLAN.md section 7's table still gives 844,1394.
- [ ] **The day and the night.** The page's air (mean +7 degC: `amb`, KTHERM's soil) is the model's since scale model 5.1 edit 1 (f1d1501cf,
      `tools/scale-model/edit_511.py`: the floor 7.0 degC, 15/-2, days 24, nights -10; Cwb and Dwb). The page has no day/night temperature of its own
      yet: the frost on the floor at night (`KHAZ.provide('temperature')` on the night low) and the snow that lies (KTHERM's snow mask:
      `89-atmos-fx-snowcover.js` and `ATMOS.snowBare`, as Oidong's Cold Hearths do) are owed.
- [ ] **The rim dress stands in for the caldera dress** (PLAN.md section 4: 8-18 m stalks, 2-3 m fans; the Hearths kit's own work and the owner's to scale).
      The grove draws `HEARTH.layout` in the rim dress (4-11 m, 1.2-2 m fans).
- [ ] **The Hearths' species are tagged for ET, Dsc and Dfc** (`biomes/hearths/src/50`); Godshearth's floor is Cwb/Dwb. The Hearths kit's records, not
      this kit's.
- [ ] **The boil cup, the shade cap and the animals are not built** (the Hearths kit's next steps): the lake's warm margins carry none of the plan's boil
      cups, and no fin-mouse, fin-owl or hearth-stalker walks the grove.
- [ ] **The sinter terraces stepping down to the lake** are not drawn: the geyser kit's Stair is the showcase's own (`STAIR.none` on the field stage).
      Needs the Stair on the field stage, or `WATER.terraces` on the shore.
- [ ] **The hot lake's vents** (WATER.spring's thermal ramp at its bed), its steam banks at dawn and the katabatic night wind (core/atmos, the shared
      amendment) are owed. The lake is a plain still WATER.open.
- [ ] **The walls are out of sight.** The caldera's walls stand 40-90 km off; the far field reaches 14 km and the camera 16 km. A clear high basin would
      show them: a painted ring, or a far field past 14 km on the field stage, is a later pass.
- [ ] **Nothing of the floor's own flora** but the turf in the ground's paint: the frost-hardy turf, Oidong's cushions and snow lotus, and Xanadu's
      dry-country species up the spillway (PLAN.md section 4) are not placed.
- [ ] **The grove is heavy.** Along a 1.4 km vent line with a 170 m reach, `HEARTH.layout` places ~4,500 hearth trees and ~45,000 fans: 9.4 M of
      the scene's 9.5 M triangles (`hearths/field`, under its 16 M budget; verify.py --assert, SwiftShader, 2026-11-09). Not measured on the GPU lanes.
      A shorter reach, `?q=` below 1, or impostors for the far fans would cut it.
