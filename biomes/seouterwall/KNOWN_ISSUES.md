# seouterwall — known issues

- [ ] **The real-GPU verify is owed.** Station 1 was built in a cloud session with no GPU: `verify.py --assert --all-views` ran in
      software GL (SwiftShader) only. The GPU run (`KRATOR_GPU_LANE=auto`, the Arc or the RTX) is owed on the owner's machine before the
      merge, with a look at the views (the ground's tints, the strata's tint on the crags, the impostors' gain against the near larch).
      SwiftShader cannot speak for the texture units a GPU links, the frame time, or the colours as the owner sees them.
- [x] **The station stood in the model's pin hollow, not in the Godsgate's corridor.** Moved 2026-11-10 (the owner: "move the stations to
      be appropriate to the map"): station 1 stands on the corridor's divide, px 1027.5,1256 (PLAN.md section 7.2). The model's pin and
      `test_smodel.py`'s row stay at px 1031,1252: re-pinning them is the scale model's turn (`tools/scale-model/`, not this kit's files).
- [ ] **The Ancients' buildings are not built** (PLAN.md 7.3, 7.6, 7.7): the parabolic wind-baffle crescent and the 40 m vent-shaft collar
      of Bab al-Hawa with its caravanserai (station 1), the fog-bell (station 2), the geodetic bunker (station 4), the seismographic vault
      (station 5). The highway itself is built (7.7: graded into the ground, its pavement drawn). The buildings are `kits/ancients` pieces
      read in place, as `biomes/ancientsvalley` reads them.
- [x] **The flora was the NW outer wall's alone.** The plant turn (2026-11-10, PLAN.md 7.7): the kit's own puya, red guyed stalk, sky and
      gold poppies and goldroot, on the library's cards, placed by zone. Still the NW outer wall's for the trees and the shrubs; the plan's
      snow lotus is its woolly snowball, its cushions its moss cushions; the crag pine and candle birch of station 6 are not drawn.
- [ ] **The God-Bore is a hazard record, not yet weather.** The night's katabatic gale is a `cold` hazard on the day's cycle (on 21:00 to
      05:00) over the col, and the wind's exposure decides the trees' form (`F.wind`); the wind core/atmos blows the foliage with is its
      own field, not turned downslope at night (a core/atmos setting no page has yet: outside this kit).
- [x] **The rockfall was steady.** Fixed 2026-11-10: each chute is a `crush` hazard on the day's cycle, at its worst from 12:00 to 15:00
      as the sun melts the night's ice cement (PLAN.md section 2.4), a quarter of that otherwise (`cycle.base`); the check reads it at
      12:30 and 03:00, with a negative (the same chute steady).
- [x] **The hazard check found no record, and the meltwater's head was an empty volume** (the first software-GL run, 2026-11-10).
      `BIO.record` queues a record until the page's tag registry is up and returns null then, so the checks now read the hazards back
      from the registry (`KHAZ.list()`); and the ground and core/water's meshes are probeSkip, so every landform drawn only as ground
      (the brook's head, the fan, the moraines, the headwall, the tarn) is registered with a probe marker at its middle (`REGISTER_LAND`).
- [x] **Station 2's tarn is not under the plan's pixel** (PLAN.md section 7.4): the model puts each tarn 3 px west of its station pin
      (`test_smodel.py`'s tarn rows), so the pin is the tarn's east shore by the model's own design; station 2 stands on that shore, 1.5 px
      north-west of the pin (its headwall in the near box), and stations 3-6 at their pins. Its "260 m above the Godsgate" is not on the model.
- [ ] **Stations 3-6's owed pieces** (PLAN.md 7.5, 7.6): station 5's cave behind the resurgence and its ponor (`KKARST`), the felsenmeer and
      rock glaciers (`KFROST`); station 6's Geomancers' winch, the Stalker wreck and the live pair (kits/mechs); station 3's sinter caves.
- [ ] **The model's tarns are one stamp.** Every tarn the model's pass filled is 53 cells round a flat floor with its pin on the east shore, so
      stations 3-6 share their ground's shape; each station's own landforms (the mirror, the cliffs, the headwall, the vents) carry it.
- [x] **The tarn was drawn as a box round its cells** (its water where the ground dipped under the level, but the zones dry there). Fixed
      2026-11-10: one quad a cell of the cells and their ring, the same set the zones call water; a brook stops where it meets the tarn.
- [ ] **The walls are the mid ground's.** Within the near box (+-2.3 km) the model's slopes are 13-19 degrees; the crags are core/rand's
      ridged relief on them (up to ~40 m), not the 600-850 m pseudotachylite scarps of the plan, which stand 6-12 km out on the mid ground's
      220 m cells and the sky's far land. KSTRATA's beds are flat (the dip's default; `KSTRATA.vary`'s drape is CPU-only).
- [x] **No texture is missing for stations 1 and 2** (every layer is in the library: `ground.puna`, `ground.wadi.cobble`,
      `ground.gravel019`, `ground.tundra`, `ground.lichen.crust`, `ground.needles`, `rock.megabreccia`, and `rock.basalt.titanium` for
      station 2's headwall, its orange glass beds KSTRATA's tint over it), so nothing was added to `core/materials/PROMPTS-NEEDED.md`.
      The rime-ice feathers (the benches' stations) will want their own.
