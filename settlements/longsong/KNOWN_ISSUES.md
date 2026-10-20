# Longsong — known issues

- [ ] **The festival is the same every week** (`89y`): one festival schedule a role, the same tents in the same places;
      the valley's folk walk in at five and out again at midnight (they are `AWAY`, out by the gate, the rest of the
      week). The cham's dancers (24 of the monks, masked) turn in a ring in the Debate Court on the library's walk clip
      and a turning pose: no dance clip in core/charactermodels yet, and the masks are plain shapes, not the deer, the
      skull and the black hat. The butter lamps are glows, not lamps in their bowls. (2026-10-20: the crowd now stands
      before the thangka, the tents are out of the walk graph.)
- [ ] **The people indoors are a census, not walkers** (`40d`, `68`, `69`): the nearest 24 are figures, everyone else out
      to 170 m one of the 16 commonest outfits baked still and drawn instanced (core/charactermodels `KCharCrowd`,
      2026-10-20: standing, two strides of the walk, sitting cross-legged; a person whose outfit is not among the 16
      wears the commonest of their body and side), past that the placeholders. The baked looks have no faces of their
      own and do not sway; the strides alternate rather than play. People are kept apart where they are drawn (68: a
      shoulder's width, eased, half a metre at most), not by the sim, so two on one path still queue through each other's
      place in it. Their clips are the library's nearest (the cham on the walk, no dance clip; the masks plain shapes).
      Indoors they are not drawn at all: the sim's indoor places are abstract (whoever is at one is hidden) and its indoor
      legs are door edges, so no one walks the rooms' floors or the stairs, and a stair room's storeys are not joined for
      them. A walk graph of the rooms (40c's doors, the stair rooms stacked) and indoor places that are rooms is the next
      step. The world day is 72 real minutes, so a walk across the ward takes most of a world hour.
- [ ] **The interiors** (PLAN.md P4; 2026-10-20 a second pass): every storey the shells draw has its rooms (653: the
      White Palace's fourth and fifth storeys, the Red Palace's second, fourth and fifth, the wings' every storey; the
      ward's buildings and the Hall of Forms with the Room of Slow Water), the depths' pieces are the placer's (57a's
      `lv-` kinds), the Cistern of the rock is built, and a room's windows are cut through its inner walls to the facade,
      the day behind their panes (89x: daylight at the nearest windows, the sun and the sky shut out indoors). Still: a
      window lets the hour's colour in, not a view (the facade's opening is painted dark from outside); the courts' upper
      storeys open on the court by a door each, with no gallery drawn; the depths' Cistern and Unmaking Room get no
      fixtures (the placer found no fit round the basin and the circle: 66 checks that nothing stands on them instead);
      the Oath Room's, the Sealed Library's and the Warden's gate's pieces are still drawn by hand (they are the rooms'
      architecture: the lectern, the stacks, the gate); a stair room draws a flight, not a way up for a walker.
- [ ] **The ward is not on core/city**: its rows are the blueprint's rectangles drawn by the kit. Porting it (lanes,
      lots, infill) is PLAN.md P6; no occupancy grid of its own was written.
- [ ] **The valley road** is a track drawn on the ground from the page's west edge to the bridge: the open world has
      no road network in the Oidong Valley yet to join.
- [ ] **The stream's western valley**: the page's stream runs west (`LS.STREAM_FLOW`) on a level that only falls; the
      model's 4 km land climbs about 10 m along it west of the pond, so its bed is cut there, its sides at 1 in 6 (a valley
      up to ~10 m deep at the page's edge). The far terrain beyond the page shows the model's own land and water: a step at
      the seam seen from far off. A finer cut of the region (the model's river at its own resolution) would end it.
- [ ] **The strip fields drape the model's land**: the east and west fields lie on the apron's gentle slope (a mesh over
      the ground, lifted 0.14 m with a polygon offset); the south terraces and the tea garden have level treads cut and
      built (45: `TERRACES`) with stone risers. The fields stand still: no ploughing, sowing or harvest through the year.
- [ ] **The herds glide**: the yaks and the dzo walk their pastures on core/biome's walker (2026-10-20: each a slow loop
      of its own, its place a pure function of the BIO clock), but each kind is still baked in one pose, so they move
      without their legs moving (core/biome's 35-core-anim or the Fauna kit's `animate` per instance would give the gait).
- [ ] **The valley's villages are drawn, not lived in** (core/hamlet, 40h and 85h): their 585 people are a census, not
      core/simulation actors; no interiors. Their buildings are the Xanadu kit's (2026-10-20), but the kit has no pens,
      corral or dairy yet (core/hamlet's `xanadu` row lists them pending: the page draws its own rings and a white house);
      the windmills' sails stand still (the kit's ticks are not run here); a village's merged meshes carry no night glow.
- [ ] **The export to Godot** (94-ls-export.js on core/export): the buildings, the depths and the villages go as buckets
      (ARCH's meshes by material, with the volumes they stand in), the flora as items, the ground sampled (no field: 45); the
      depths' own shader (lit by their lamps alone) goes plain, its lamps not yet as lights; the interiors' rooms and the
      walk floors (KWALK) are not sections yet (core/export has no walk section; the rooms want Yuni's interiors contract).
      core/city (the ward) and core/terrain's cavern (the depths) are not needed for it (the owner, 2026-10-20).
      Godot's `tests/export/world_test.gd` is the biome tile's test: on Longsong's case it reports three checks that
      do not fit a city (every bucket dropping vertices, where 42 of 77 lie wholly in the box; `has_tex`, the biome
      shader's flag, where a city's material sets `has_albedo`; the ground's last row and column, where `height_at`
      clamps). On the city's rules (Iziz's test) all three pass. A `longsong_test.gd` case is not written yet.
