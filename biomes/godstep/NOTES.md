# biomes/godstep: working notes

## How station 1 is made (2026-11-09)

- **Started from `biomes/godthrone`** (CLAUDE.md: start a new build from the nearest finished one): its build shape (a station's
  `station.json` with `region`, `bake`, `water`, `tex`), its stage, field cache, ground shader and probe take were copied and cut
  to this valley; the vent, the lake, the overflow and the portal were left out. Station 1 is `src/` itself (`src/station.json`), so
  later stations replace fragments from `stations/<name>/` as the Godthrone's do.
- **The frame.** Origin at scale model 5.1 px 903,1116 (the model's front 1, mid-ramp, 2,809 m). The valley's axis bears ENE
  (`DOWN = [.9611, -.2764]`, the plan's -0.28 rad). On the model front 1 is a ~12 km ramp from ~3,124 m (px 900) to ~2,420 m
  (px 906); the kit compresses it into a ~3 km trap stair (PLAN.md section 1: "at the kit's scale that ramp is the trap stair") and
  each floor is checked against the model's own flat floor further up and down the same axis (`98-host-stair.js`, `heightRows`).
- **The far country** is the model's raster (`src/region.json`, written by `biomes/godthrone/tools/region.py` read in place:
  `python3 biomes/godthrone/tools/region.py ../../godstep/src 903 1116`), eased in from 5.3 to 9.6 km off the site.
- **The stair** is core's `KRELIEF.stair` (made for this valley): two steps (3,138 and 2,428 m), lobes 420 m over 2.3 km, a 13.3 deg
  mean front, flows 18-62 m each terraced (`riser` .1: each flow's front a steep colonnade riser, ~65 deg, over its bench), tongues (the frozen falls) .45 per km. The floors tilt 1.8 m/km downstream
  and the beds dip with them (`KSTRATA` `dip`).
- **The bake** (`src/bake-flows.js`, `src/flows.json`, ~40 s in node at build time when its inputs change): `KLAVA.bakeLayers` on the
  FLOWS-INPUT block of `45b`: four eruptions (two lobes on the head step, two breakouts on step 2). The lip's column
  (`KLAVA.column`) is recorded in the bake; at this layout none of the head step's lobes reaches the lip, so it is empty and the
  front's beds are the stair's own flows only.
- **The rock** is the valley's own recipes (`src/35g-godstep-strata.js`): core's `tibasalt-ponded` and `tibasalt` with the bead
  partings already palagonite, because one formation a flow would give one alteration a formation and `KSTRATA.shade` takes four.
- **The tumuli** (`KRELIEF.tumuli` on the bake) are filed in `KSPACE` so the ground reads only those over a point.
