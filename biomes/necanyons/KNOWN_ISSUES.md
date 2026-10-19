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
- [ ] **The water is plain** (the creek's ribbon and the rain pools are a Standard material), not `core/atmos`' wave field:
      neither is open water.
- [ ] **Not in Godot yet**: the rock is meshes made from KSTACKS records (exported as `NECANYONS.records()`); a Godot port
      would port `footR`/`topH`/`mesh` (plain maths) or take the meshes.
- [ ] **Pinnacle Rock does not take the kit yet** (its `PLAN.md` "Biome" row).
