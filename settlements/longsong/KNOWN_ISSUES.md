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
- [ ] **No core/atmos**: the stream and the pond are this page's own water shader (as the Oidong kit's pools), not the
      shared wave field; the stream is a ribbon on the model's river line.
- [ ] **Textures**: the exterior's five are delivered and wired (2026-10-19: the glyph relief, the mosaic band, the red
      limewash, the prayer wheel's repousse, the mani stones); still painted on canvases here: the Procrastinator's
      glyph bands, the thangka, the plaques and the valances (their prompts are owed: `core/materials/PROMPTS-NEEDED.md`,
      "Longsong"). The Order's blue tile is gone: the cones are terracotta now (ROOMS.md section 1).
- [ ] **The herds are placeholder yaks** (boxes, instanced, standing still): the fauna kit has no yak or dzo yet. They
      are records (`LS.FARMS.HERDS`, core/tags `life`), ready for a kit's animal.
- [ ] **The fields drape the model's land**: the south terraces and the tea garden are contour bands with stone risers,
      not cut treads (the land outside the grounds is the model's 4 km cells, smooth; cutting treads into it would move
      the far terrain's seam). The farmland is a mesh over the ground (lifted 0.14 m with a polygon offset).
- [ ] **The leat runs on the land, not in a cut**: its channel follows the ground from the stream to the ward's water
      gate; it does not check that the water could flow (the bank falls toward the stream, not along the leat).
- [ ] **The Hall of Forms is a shell**: its Room of Slow Water (the held basin) and its sprung floor wait for the
      interiors (PLAN.md P4), as everything else does.
