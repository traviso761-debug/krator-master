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
- [ ] **The Ancients' side of station 1 is not built** (PLAN.md 7.3): the 30 m surface highway and its cuttings, the parabolic
      wind-baffle crescent, the 40 m vent-shaft collar of Bab al-Hawa and the caravanserai in its lee. They are `kits/ancients` pieces
      read in place (as `biomes/ancientsvalley` reads them), and the road wants its line settled first (the item above).
- [ ] **The flora is the NW outer wall's alone.** Its larch (thinned: `NWOW.larchK` .3, only in a lee), stone pine, creeping pine (the
      krummholz on the open shaded slopes and the moraines) and silverthorn, and its floor, read in place. The plan's borrowings (the
      puya, the snow lotus and sky poppies, the cushion domes, goldroot) are a later turn; the cards exist (`card.puya`).
- [ ] **The God-Bore is a hazard record, not yet weather.** The night's katabatic gale is a `cold` hazard on the day's cycle (on 21:00 to
      05:00) over the col, and the wind's exposure decides the trees' form (`F.wind`); the wind core/atmos blows the foliage with is its
      own field, not turned downslope at night. The rockfall hazards are steady (the plan's noon discharge is not on a cycle yet).
- [ ] **The walls are the mid ground's.** Within the near box (+-2.3 km) the model's slopes are 13-19 degrees; the crags are core/rand's
      ridged relief on them (up to ~40 m), not the 600-850 m pseudotachylite scarps of the plan, which stand 6-12 km out on the mid ground's
      220 m cells and the sky's far land. KSTRATA's beds are flat (the dip's default; `KSTRATA.vary`'s drape is CPU-only).
- [ ] **No texture is missing for station 1** (every layer is in the library: `ground.puna`, `ground.wadi.cobble`, `ground.gravel019`,
      `ground.tundra`, `ground.lichen.crust`, `ground.needles`, `rock.megabreccia`), so nothing was added to
      `core/materials/PROMPTS-NEEDED.md`. The rime-ice feathers and the orange fountain-glass beds (stations 2-3) will want their own.
