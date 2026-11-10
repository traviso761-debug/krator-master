# seouterwall — known issues

- [ ] **The real-GPU verify is owed.** Station 1 was built in a cloud session with no GPU: `verify.py --assert --all-views` ran in
      software GL (SwiftShader) only. The GPU run (`KRATOR_GPU_LANE=auto`, the Arc or the RTX) is owed on the owner's machine before the
      merge, with a look at the views (the ground's tints, the strata's tint on the crags, the impostors' gain against the near larch).
      SwiftShader cannot speak for the texture units a GPU links, the frame time, or the colours as the owner sees them.
- [ ] **The station stands in the model's pin hollow, not in the Godsgate's corridor** (PLAN.md section 7.2). The model's pass ran
      after the plan and carved the corridor N-S along px ~1027 (3,630-3,680 m), 7.5 km west of the station's pixel; the pixel itself is
      a 7x7 stamp at 3,620 m (`seow_station_pins`), which left a closed hollow about 2 km across, 140-570 m under its north rim. Station 1
      draws that hollow as it is (the saddle's outwash flat: the north slope's meltwater sinks into its fan; no tarn at 282 mm), with the
      corridor on the mid ground. For the owner: move the pin onto the corridor (px ~1027,1252, `test_smodel.py`'s row with it), or keep
      the hollow as the saddle's flat and let station 1's road climb its 280 m west rim to the corridor. Either is a turn of its own.
- [ ] **The Ancients' side of stations 1 and 2 is not built** (PLAN.md 7.3; station 2's toppled fog-bell and the Historian's cache, 7.4): the 30 m surface highway and its cuttings, the parabolic
      wind-baffle crescent, the 40 m vent-shaft collar of Bab al-Hawa and the caravanserai in its lee. They are `kits/ancients` pieces
      read in place (as `biomes/ancientsvalley` reads them), and the road wants its line settled first (the item above).
- [ ] **The flora is the NW outer wall's alone.** Its larch (thinned: `NWOW.larchK` .3, only in a lee), stone pine, creeping pine (the
      krummholz on the open shaded slopes and the moraines) and silverthorn, and its floor, read in place. The plan's borrowings (the
      puya, the snow lotus and sky poppies, the cushion domes, goldroot) are a later turn; the cards exist (`card.puya`).
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
- [ ] **Station 2's tarn is not under the plan's pixel** (PLAN.md section 7.4). The model's tarn is 45 cells (about 7 km across) 3-9 km
      west of px 1016,1236; the station stands on its north-east shore (px 1014.5,1234.5) with the headwall it draws itself (a 140 m
      KRELIEF.scarp: the model's walls are 4-8 km out). The plan's 120 m fall is that headwall's; its "260 m above the Godsgate" is not on
      the model (the corridor is 25 km east, at the same height). For the owner, with station 1's pin.
- [ ] **The walls are the mid ground's.** Within the near box (+-2.3 km) the model's slopes are 13-19 degrees; the crags are core/rand's
      ridged relief on them (up to ~40 m), not the 600-850 m pseudotachylite scarps of the plan, which stand 6-12 km out on the mid ground's
      220 m cells and the sky's far land. KSTRATA's beds are flat (the dip's default; `KSTRATA.vary`'s drape is CPU-only).
- [x] **No texture is missing for stations 1 and 2** (every layer is in the library: `ground.puna`, `ground.wadi.cobble`,
      `ground.gravel019`, `ground.tundra`, `ground.lichen.crust`, `ground.needles`, `rock.megabreccia`, and `rock.basalt.titanium` for
      station 2's headwall, its orange glass beds KSTRATA's tint over it), so nothing was added to `core/materials/PROMPTS-NEEDED.md`.
      The rime-ice feathers (the benches' stations) will want their own.
