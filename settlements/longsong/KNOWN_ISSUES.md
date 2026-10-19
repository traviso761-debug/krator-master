# Longsong — known issues

- [ ] **The people are placeholder figures** (a robe, a head, two arms, a sash; instanced). They should be drawn from
      `core/charactermodels` in the Order's robes (`peoples.json` has no Historians yet) and run on `core/simulation`
      (SIM) rather than on `LS.whereAt` alone; the schedules and places are already plain data for it.
- [ ] **No interiors**: the buildings are shells (the Vault is the only interior). `FURNITURE.md` is the manifest;
      `kits/interiors` and the catalog's Order set (`order_*`, Yuni's 59-civic) are the way (PLAN.md P4).
- [ ] **The model's Longsong marker** (px 957,1294) is 7 km from the build's site (px 954,1296): the owner's call
      whether to move it (PLAN.md section 1). The page does not write to the scale model's store.
- [ ] **The ward is not on core/city**: its rows are the blueprint's rectangles drawn by the kit. Porting it (lanes,
      lots, infill) is PLAN.md P6; no occupancy grid of its own was written.
- [ ] **The valley road** is a track drawn on the ground from the page's west edge to the bridge: the open world has
      no road network in the Oidong Valley yet to join.
- [ ] **The stream's western valley**: the page's stream runs west (`LS.STREAM_FLOW`) on a level that only falls; the
      model's 4 km land climbs about 10 m along it west of the pond, so its bed is cut there, its sides at 1 in 6 (a valley
      up to ~10 m deep at the page's edge). The far terrain beyond the page shows the model's own land and water: a step at
      the seam seen from far off. A finer cut of the region (the model's river at its own resolution) would end it.
- [ ] **Textures**: all fourteen of the build's are delivered (2026-10-19). The exterior's, the thangka, the glyph band, the
      mandala floor, the lead and the valances are wired; the column paint, the Cataclysm mural, the rug and the book spines
      are in the library and wait for the interiors. The plaques, boards and the dial stay painted on canvases (legible text).
- [ ] **The strip fields drape the model's land**: the east and west fields lie on the apron's gentle slope (a mesh over
      the ground, lifted 0.14 m with a polygon offset); the south terraces and the tea garden have level treads cut and
      built (45: `TERRACES`) with stone risers. The fields stand still: no ploughing, sowing or harvest through the year.
- [ ] **The Hall of Forms is a shell**: its Room of Slow Water (the held basin) and its sprung floor wait for the
      interiors (PLAN.md P4), as everything else does.
- [ ] **The herds stand still**: the yaks and the dzo are the Fauna kit's (its yak, its highland cow for the dzo), each kind
      baked once in one pose and drawn instanced; they do not walk or graze in time. Running them (the kit's `animate`
      on core/simulation's schedule) is the life layer's (PLAN.md P5), with the people.
