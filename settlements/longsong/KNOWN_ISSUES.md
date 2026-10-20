# Longsong — known issues

- [ ] **The festival's dance** (`89y`, `68`): the festival changes from week to week (2026-10-20: four programmes in turn,
      `LS.FESTIVAL.programmes`, core/simulation's week the whole four-week cycle: the cham, the procession, the great
      debate, the valley's day; the valley's turnout and the camp pitched to match, `LS.CAMP.pitched`), the cham's masks
      are the dance's three (the black hat, the deer, the skull) and the butter lamps burn in brass bowls. Still: the
      dancers turn on the library's walk clip and a turning pose (no dance clip in core/charactermodels yet), and the camp
      pitches its tents on the same twenty slots (a share of them each week), not a new layout.
- [ ] **The crowd's detail** (`40d`, `68`, `69`): the nearest 24 are figures, everyone else out to 170 m one of the 16
      commonest outfits baked still and drawn instanced (core/charactermodels `KCharCrowd`: standing, four frames of the
      walk, sitting cross-legged), past that the placeholders. The baked looks have no faces of their own and do not
      sway; a walker's frame follows the clock, not the ground it covers, so the feet slide a little. People are kept
      apart where they are drawn (68: a shoulder's width, eased, half a metre at most), not by the sim, so two on one path
      still queue through each other's place in it. Indoors (2026-10-20) they walk the rooms: every room of the palaces and
      the ward is in the walk graph by the doors 40c records (none patched: the loggia's stair, the Hall of Hours' and the
      Observatory's doors on the wings' roofs, the stair house, the Eastern Watch's stair to the keepers' mess are
      records), round the furniture (the bake's walks on the placer's free cells: `LSIX.walkOf`, `LSS.walkOf`), up the
      stair rooms' flights (`r.flight`, drawn the same by 87) and on the ward courts' galleries; a room's people are
      drawn when its floor is. Still: the vault's rooms are one node each, and a room whose bake is stale is crossed by
      its middle until the bake is redone (`bake_interiors.py`). The world day is 72 real minutes, so a walk across the
      ward takes most of a world hour.
- [ ] **The interiors** (PLAN.md P4; 2026-10-20 a third pass): every storey the shells draw has its rooms (653, and the ward
      courts' yards and galleries), the depths' pieces are the placer's, the Cistern of the rock is built, a room's
      windows are cut through its inner walls to the facade, the courts' upper storeys open on a gallery round the court
      (64 draws the decks, rails and the stair down), a stair room's flight rises to the floor over it, and the Unmaking
      Room keeps what waits to be unmade along its walls. Still: a window lets the hour's colour in, not a view (the
      facade's opening is painted dark from outside); the Oath Room's, the Sealed Library's and the Warden's gate's pieces
      are drawn by hand (they are the rooms' architecture: the lectern, the stacks, the gate); a flight is drawn up to its
      floor's ceiling, the floor over it not cut for it.
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
      built (45: `TERRACES`) with stone risers. The fields go through the year (2026-10-20: `LS.FARMS.YEAR`, 84 days;
      each annual crop ploughed, sown, grown, ripe, cut and in stubble, drawn from `F.stage`; the clock panel's season
      button), but no one is seen at the work, and the winter has no snow.
- [ ] **The herds** (`85`): the yaks and the dzo walk their pastures on core/biome's walker, their legs in the Fauna
      kit's walk (2026-10-20: each kind baked at six phases of it, a walker drawn from the phase its distance walked puts
      it in). Still: they walk without pausing; none stops to graze on the way.
- [ ] **The valley's villages are drawn, not lived in** (core/hamlet, 40h and 85h): their 585 people are a census, not
      core/simulation actors; no interiors. Their buildings are all the Xanadu kit's (2026-10-20: the kit has the pens, the
      corral and the dairy, `xa_pens`, `xa_corral`, `xa_dairy`; core/hamlet's `xanadu` row still declares their boxes for a
      host without the kit), the windmills' rotors turn (the kit builds the mill without them, `XAK.rotors` says where they
      stand) and each house's door is lit after dusk.
- [ ] **The export to Godot** (94-ls-export.js on core/export): the buildings, the depths and the villages go as buckets
      (ARCH's meshes by material, with the volumes they stand in), the flora as items, the ground sampled (no field: 45); the
      depths' own shader (lit by their lamps alone) goes plain, its lamps not yet as lights; the interiors' rooms and the
      walk floors (KWALK) are not sections yet (core/export has no walk section; the rooms want Yuni's interiors contract).
      core/city (the ward) and core/terrain's cavern (the depths) are not needed for it (the owner, 2026-10-20).
      Godot's `tests/export/world_test.gd` is the biome tile's test: on Longsong's case it reports three checks that
      do not fit a city (every bucket dropping vertices, where 42 of 77 lie wholly in the box; `has_tex`, the biome
      shader's flag, where a city's material sets `has_albedo`; the ground's last row and column, where `height_at`
      clamps). On the city's rules all three pass: `godot/tests/export/longsong_test.gd` (2026-10-20) checks Longsong's export
      by them, on `godot/data/world-longsong` (box -120,-60 to 120,200): the registry and flora uids recomputed, every
      bucket triangle's centroid in the box with compacted vertices, the library shader (`has_albedo`) and the biome's
      (`has_tex`), the drawn ground through every sample including the last row and column, the stage, the 196 glows and
      the two still waters, each with a negative; all 46 pass. Godot's glTF import compresses the buckets' vertices to 16
      bits, which moves them by up to 7 mm (every case: `krator/world_import.gd` could turn it off if seams show).
