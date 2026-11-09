# Godshearth: known issues

Open items (`- [ ]`) are read by `build.py`'s closing line. The plan's open questions for the owner are `PLAN.md` section 9.

## Station 1, the Hot Lake (`stations/prismbasin`, `dist/godshearth.html`; 2026-11-09)

- [ ] **The rim dress stands in for the caldera dress** (PLAN.md section 4: 8-18 m stalks, 2-3 m fans; the Hearths kit's own work and the owner's to scale).
      The grove draws `HEARTH.layout` in the rim dress (4-11 m, 1.2-2 m fans).
- [ ] **The Hearths' species are tagged for ET, Dsc and Dfc** (`biomes/hearths/src/50`); Godshearth's floor is Cwb/Dwb. The Hearths kit's records.
- [ ] **The boil cup, the shade cap and the animals are not built** (the Hearths kit's next steps): the lake's warm margins carry none of the plan's boil
      cups, and no fin-mouse, fin-owl or hearth-stalker walks the grove.

- [ ] **The walls are a backdrop.** The ring (89y) is the model's heights at 2 km cells, so a wall is a few hundred metres of relief a cell: no gullies
      or slump treads of its own (`KRELIEF` at 40-100 km would be lost in the haze), and its haze is the ring's own, not the scene's fog. It follows the
      camera over the ground (a kilometre's walk moves a wall 50 km off by about a degree, not drawn).
- [ ] **Turf and frost are one value each.** The turf (75b) is one plant (a sedge-and-grass sward); the frost is the snow cover's base, one value over
      the page, so the shore's cold-air pools frost no sooner than the open floor (their air is 7 degC colder: 89x). Oidong's cushions and snow lotus on
      the benches and Xanadu's dry-country species up the spillway (PLAN.md section 4) are owed.
- [ ] **The model's artifact is not republished.** `tools/scale-model/edit_512.py` wrote the vent records into `model/data` (and `30-vents.js` draws
      fumaroles and springs as steam); the published Krator Scale Model page is the owner's to republish (`tools/scale-model/README.md`).
- [x] **The model's test and edit 1 point at the retired little demo's regions**: fixed on main (Firebliss's branch moved the test to
      `archive/little-demo`); `tests/test_smodel.py` passes all 233 checks with Firebliss's edit 3 (2026-11-09, `claude/cloud-kits-verify`).
- [ ] **A WebGL delete on another context under SwiftShader.** Software GL on Windows logs two `INVALID_OPERATION: delete: object does not
      belong to this context` during `--all-views` (verify's shader-errors fails there); no cross-context delete is made at load (probed), and
      on the GPU (the RTX lane) `verify.py --assert --all-views` passes (2026-11-09). Not traced further.

## Done (2026-11-09)

- **Vent records on the model** (scale model 5.1 edit 2, `tools/scale-model/edit_512.py`; the owner: "vent records can go on the model"): six
  records in Godshearth (the lake's bed and shore vents, the shore geyser field, the shore vent line, station 2's grove line, the spillway's head);
  the build reads them (`model_site.py` -> `GH_MODEL`), so the grove's line, the field's centre and the lake's vents are the model's.
- **The lake's vents**: the shore vents 400 m out heat the water (KTHERM), tint it paler and greener (WATER.open's tint), steam, and scald (KHAZ heat);
  the bed vents 6 km out stand as a steam column over the lake.
- **The night wind** (core/atmos `fx/89-atmos-fx-katabatic.js`, new, `test-katabatic.js`): on a clear night the cold air drains to the lake, west,
  strongest before dawn; by day the lake breeze blows back east; an overcast night barely drains. Every plume drifts with it.
- **Turf**: the floor's frost turf (75b, Godshearth's own registry, the library's grass set tinted), on the meadow's ground.
- **Frost**: hoar frost on a clear night under 1 degC (the snow cover's base), thickest before dawn, gone by mid-morning, the warm ground bare.
- **The caldera's walls** (89y): the model's heights from 14 to 110 km as a ring at the edge of the camera's reach, true in elevation angle, coloured
  by height (turf, scree, tibasalt with its orange bead horizons, ice over ~6.2 km) and hazed by distance; the far field past 5 km is the model's too.
  The basin's haze thinned (fog .00007) so they show.

- **The grove's weight.** The vent line's two western segments and a 100 m reach: 1,775 hearth trees, 3.7 M triangles (it was ~4,500 and 9.4 M);
  the scene 5.1 M (verify.py --assert, SwiftShader).
- **The climate.** The model holds the owner's since scale model 5.1 edit 1 (f1d1501cf). The page gives the day and the night: KHAZ's temperature
  by the season and hour on the host's clock (89x: +23/+6 on a summer day and night, +6/-11 in winter on the open floor, -17 in the shore's cold-air
  pools, the vents' warm ground near the ground).
- **The snow that lies** stays off the warm ground (ATMOS.snowBare from KTHERM and the geyser kit's heat; the cover is the field stage's).
- **The sinter terraces** down to the lake: eight rimstone pools on a built mound (WATER.terraces), checked tread by tread.
- **The page's middle** is now in PLAN.md section 7's table.
