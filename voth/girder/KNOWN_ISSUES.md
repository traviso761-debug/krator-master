# Girder — known issues
build.py prints every unticked item on each build. Claude: when Travis asks for changes to this world,
remind him of this list first. Tick `[x]` and date an item when it is fixed.

- [ ] UNCONFIRMED BRIEF: "platforms protected by rope bridges" was read as "connected by rope bridges" — ask Travis
- [ ] Terrain: ground drops 4-12 m below brook water level in a hollow below the cascade; widen the vale in terrainH (10-core)
- [ ] "Girder from the brook" view was moved onto the footbridge after the last render — never re-shot
- [ ] Life: under the default 2-minute day, worker commutes fade instead of walking (pause/slow the clock to see real walks)
- [ ] Life: sentries never change shift; wall-walk pacers have no way up or down (no ladder/nav link to the ledge)
- [ ] Life: lift-foot nav edge runs through the capstan circle (walkers detour); capstan bar is static and cannot turn with the millipede (30-layout / 50-structure)
- [ ] Life: a lift queue does not steer round the sentry posted at the lift foot; hand lanterns do not light the ground
- [ ] Life: 78-life still carries 12 private road links (_life.virtualLinks) now redundant with the crossing fix in 30-layout — remove and re-test
- [ ] Layout: gallery walk-loop corners at (+-22,+-22) sit inside the corner columns (20.8-24)
- [ ] Flyers: the 12 court-side roost stalls are static residents (every approach crosses a bridge); quetzals use outer bays only
- [ ] Flyers: circuit joins fail ~25% (fall back to plain departure); formations dissolve; quetzal head clearance under the eave judged by eye
- [ ] Flyers: rider-lantern / bat-eye glints never confirmed in a night frame; re-run the obstacle audit against the real forest (it was run against placeholder crowns)
- [ ] Overgrowth: vine curtains are flat two-sided ribbons with no sway; blocky close up (58-overgrowth)
- [ ] Arch: house yards sparse, no animals in pens; dwellings under low slabs have no roofs
- [ ] Forest: no trodden-ground tone on gate tracks; fireflies hard to see; brook bed strip only inside |x|,|z|<1200; FAST-off (shadows) build never run
- [ ] Forest: 62-jungle hard-codes four camera positions from 80-camera to keep them clear — publish viewpoints from the layout instead
- [ ] Night at 21:00 is too bright under the gas giant (shared with Mav's Refuge)
