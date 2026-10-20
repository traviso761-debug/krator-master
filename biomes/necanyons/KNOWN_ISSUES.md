# necanyons — known issues

- [ ] **The bedded red sandstone** (`rock.sandstone.bedded.red`, `core/materials/PROMPTS-NEEDED.md` section 5) is in hand in
      another session. When it lands, the mesas' walls take it for their horizontal beds (`materials.json` `rock.wall`, or a
      second wall family by bed), with the varnish set for the streaked faces.
- [ ] **Three optional sheets** (`card.palm.fan`, `card.flametip`, `card.treelily`; PROMPTS-NEEDED section 6) are not
      delivered: the fan palm shows `card.palm`'s middle cell (a palmetto fan), the flametip `card.croptree.glossy` tinted
      (its scarlet flush is the instance colour), the stilt lily `card.ichu` and `card.flower.claw`. Procedural stand-ins
      only where no library set exists (the turncoat's young sticky leaves).
- [ ] **The hyperjungle's trees keep their own heights** (150-305 m): the canyon floor's forest is as tall as the Bench's
      walls, as Pinnacle Rock's lore says. "Lower toward Korona" is only "thinner" here (the jungle mask), because a height
      option on `HYPERJUNGLE.build` would change every build that reads the hyperjungle in place.
- [ ] **No `dress()`**: the hanging gardens are placed from the kit's own seep lines and ledges (KSTACKS records), not
      sampled off a world's structures. A world that hands its own rock as geometry would need one.
- [x] **The water is core/water's** (2026-10-19): the creek a flow line (`WATER.flow`, its surface the bed plus its depth
      every 12 m) drawn as its ribbon, the rain pools still water (`WATER.still`, one mesh with `WATER.stillMaterial`),
      on core/atmos's clock and sky light (`89w-host-water.js`); 47 makes the records, and draws the old plain ribbon only
      on a page without core/water. The export's tile (the Bench's rim) holds neither, so its water section is empty there.
- [ ] **The night has no lamps or life of its own** (`89n-host-night.js` eases the light, the fog and the dome by the world
      hour; nothing glows): the canyons are wild. Pinnacle Rock adds its fires and lamps on core/atmos.
- [ ] **Not in Godot yet**: the rock is meshes made from KSTACKS records (exported as `NECANYONS.records()`); a Godot port
      would port `footR`/`topH`/`mesh` (plain maths) or take the meshes.
- [ ] **Pinnacle Rock does not take the kit yet** (its `PLAN.md` "Biome" row).
