# Longsong — known issues

- [ ] **The people are placeholder figures** (a robe, a head, two arms, a sash; instanced). They should be drawn from
      `core/charactermodels` in the Order's robes (`peoples.json` has no Historians yet) and run on `core/simulation`
      (SIM) rather than on `LS.whereAt` alone; the schedules and places are already plain data for it.
- [ ] **No interiors**: the buildings are shells (the Vault is the only interior). `FURNITURE.md` is the manifest;
      `kits/interiors` and the catalog's Order set (`order_*`, Yuni's 59-civic) are the way (PLAN.md P4).
- [ ] **The vault's rooms are separate boxes**: the camera may stand in one room at a time (clampCam keeps it inside
      the room it is in); move between them with the views. No doorways are cut between rooms (each has its door drawn).
- [ ] **The vault's shader takes 64 lights**: every lamp of the depths is in one uniform array (~55 used). A new lamp
      past 64 is dropped silently; move to per-room light sets if the depths grow.
- [ ] **The model's Longsong marker** (px 957,1294) is 7 km from the build's site (px 954,1296): the owner's call
      whether to move it (PLAN.md section 1). The page does not write to the scale model's store.
- [ ] **The ward is not on core/city**: its rows are the blueprint's rectangles drawn by the kit. Porting it (lanes,
      lots, infill) is PLAN.md P6; no occupancy grid of its own was written.
- [ ] **The valley road** is a track drawn on the ground from the page's west edge to the bridge: the open world has
      no road network in the Oidong Valley yet to join.
- [ ] **Prayer-wheel rows** turn in the vertex shader (each its own pace, a third still): their turning is not data.
- [ ] **The sky is the Oidong showcase's** (read in place: its painted snow ranges and the Throne's azimuth were drawn
      for the showcase's valley); the real ranges are the far terrain's. A Longsong sky would place the Throne from
      the model.
- [ ] **The stream's western ravine**: the page's stream is core/water's flow on a level that only falls downstream
      (west); the model's 4 km land climbs about 10 m along it west of the pond, so its bed is cut there as a widening
      ravine (up to ~10 m at the page's edge). The far terrain beyond the page shows the model's own land and water: a step
      at the seam seen from far off. A finer cut of the region (the model's river at its own resolution) would end it.
- [ ] **Textures**: all fourteen of the build's are delivered (2026-10-19). The exterior's, the thangka, the glyph band, the
      mandala floor, the lead and the valances are wired; the column paint, the Cataclysm mural, the rug and the book spines
      are in the library and wait for the interiors. The plaques, boards and the dial stay painted on canvases (legible text).
- [ ] **The herds are placeholder yaks** (boxes, instanced, standing still): the fauna kit has no yak or dzo yet. They
      are records (`LS.FARMS.HERDS`, core/tags `life`), ready for a kit's animal.
- [ ] **The fields drape the model's land**: the south terraces and the tea garden are contour bands with stone risers,
      not cut treads (the land outside the grounds is the model's 4 km cells, smooth; cutting treads into it would move
      the far terrain's seam). The farmland is a mesh over the ground (lifted 0.14 m with a polygon offset).
- [ ] **The canal is gravity-honest but short of head**: it takes off 300 m upstream of the bridge, just under the
      stream's level there, and falls 0.3 m to the paper mill's wheel (undershot, in its race) and 1.5 m more to the Mirror.
      A real mill would want more head: a longer leat further upstream (the stream falls ~1 m a km here).
- [ ] **The Hall of Forms is a shell**: its Room of Slow Water (the held basin) and its sprung floor wait for the
      interiors (PLAN.md P4), as everything else does.
