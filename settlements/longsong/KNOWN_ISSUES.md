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
      the ward's buildings (section 2) have no interiors. The depths are the Vault's own (66), not on kits/interiors.
      The pieces FURNITURE.md marked NEW for the grounds and the depths (the press, the paper vat, the drying rack, the
      well, the lead case, the furnace, the bath's pool and basin, the wall fountain, the relic crate) are still to make.
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
      are in the library and are not yet on the interiors (their walls and columns take ARCH's render and timber; the
      pieces the catalog's colours). The plaques, boards and the dial stay painted on canvases (legible text).
- [ ] **The strip fields drape the model's land**: the east and west fields lie on the apron's gentle slope (a mesh over
      the ground, lifted 0.14 m with a polygon offset); the south terraces and the tea garden have level treads cut and
      built (45: `TERRACES`) with stone risers. The fields stand still: no ploughing, sowing or harvest through the year.
- [ ] **The herds stand still**: the yaks and the dzo are the Fauna kit's (its yak, its highland cow for the dzo), each kind
      baked once in one pose and drawn instanced; they do not walk or graze in time. Running them (the kit's `animate`
      on core/simulation's schedule) is the life layer's (PLAN.md P5), with the people.
