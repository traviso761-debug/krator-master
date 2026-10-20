# Longsong — known issues

- [ ] **The festival is the same every week** (`89y`): one festival schedule a role, the same tents in the same places;
      the valley's folk walk in at five and out again at midnight (they are `AWAY`, out by the gate, the rest of the
      week). The cham's dancers (24 of the monks, masked) turn in a ring in the Debate Court on the library's walk clip
      and a turning pose: no dance clip in core/charactermodels yet, and the masks are plain shapes, not the deer, the
      skull and the black hat. The butter lamps are glows, not lamps in their bowls. (2026-10-20: the crowd now stands
      before the thangka, the tents are out of the walk graph.)
- [ ] **Only the nearest 24 people are dressed** (`69`: core/charactermodels figures, each morphed on the CPU); the
      rest are placeholder figures (a robe, a head, two arms, a sash; instanced). core/charactermodels has no level of
      detail or instanced crowd yet, so a whole court cannot be drawn dressed; the figures pass through one another, and
      their clips are the nearest the library has (the wheel's keepers push, the debaters talk or sit on the floor, the
      drill punches). The people run on `core/simulation` since 2026-10-19. Their walk graph is the ward's
      cells round the buildings, the stair and the court: inside, they walk unseen along door edges, not through the
      rooms' own floors (`40c`); a stair room's storeys are not joined for them. The world day is 72 real minutes, so a
      walk across the ward takes most of a world hour.
- [ ] **The interiors are a first pass** (PLAN.md P4, 2026-10-19). Every room ROOMS.md sections 3-4 names is a record and
      furnished (`40c`, `57a`, the bake), but: the rooms' walls are solid inside (the palaces' windows are painted on the
      outside; no light comes through them); by night a room is lit by the nearest six of its furniture's lamps
      (`89x`: a pool of point lights round the eye), by day still by the sky and sun through solid walls; a stair room draws a flight but the storeys are not joined for a walker;
      some storeys have no programme yet and stay empty (the White Palace's front range above L4, the inner ranges' fourth
      and fifth storeys, the back range over the service stairs; the Red Palace's second, fourth, fifth (wings) and
      seventh storeys; the wings' lower floors); the Cistern of the rock (section 4) is not built; the Hall of Forms and
      the ward's buildings (section 2) have no interiors, so the paper mill's and the printing house's presses, vats and
      racks stand only in the bindery and the laundry for now. The depths are the Vault's own (66), not on kits/interiors:
      their catalog pieces (the crates, the lead cases, the furnace) are placed there by hand, not by the placer.
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
