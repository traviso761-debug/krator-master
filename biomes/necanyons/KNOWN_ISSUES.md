# necanyons — known issues

- [x] **The bedded red sandstone** (`rock.sandstone.bedded.red`, `core/materials/PROMPTS-NEEDED.md` section 5) is in hand in
      another session. When it lands, the mesas' walls take it for their horizontal beds (`materials.json` `rock.wall`, or a
      second wall family by bed), with the varnish set for the streaked faces.
      Closed 2026-10-25 (found already done): it was delivered 2026-10-18 and wired 2026-10-19 (`materials.json` `rock.bed`,
      the wall layers in `47-host-land.js`).
- [x] **Three optional sheets** (`card.palm.fan`, `card.flametip`, `card.treelily`; PROMPTS-NEEDED section 6) are not
      delivered: the fan palm shows `card.palm`'s middle cell (a palmetto fan), the flametip `card.croptree.glossy` tinted
      (its scarlet flush is the instance colour), the stilt lily `card.ichu` and `card.flower.claw`. Procedural stand-ins
      only where no library set exists (the turncoat's young sticky leaves).
      Closed 2026-10-25: the owner's sheets now fill the fan, flametip and lilytuft slots (`materials.json`, `tex/`).
- [ ] **The hyperjungle's trees keep their own heights** (150-305 m): the canyon floor's forest is as tall as the Bench's
      walls, as Pinnacle Rock's lore says. "Lower toward Korona" is only "thinner" here (the jungle mask), because a height
      option on `HYPERJUNGLE.build` would change every build that reads the hyperjungle in place.
      Stays open (2026-10-25): needs a height option in the hyperjungle kit, which every build reading it in place takes (a shared change).
- [ ] **No `dress()`**: the hanging gardens are placed from the kit's own seep lines and ledges (KSTACKS records), not
      sampled off a world's structures. A world that hands its own rock as geometry would need one.
      Stays open (2026-10-25): a design task, for a world that hands its rock as geometry.
- [x] **The water is core/water's** (2026-10-19): the creek a flow line (`WATER.flow`, its surface the bed plus its depth
      every 12 m) drawn as its ribbon, the rain pools still water (`WATER.still`, one mesh with `WATER.stillMaterial`),
      on core/atmos's clock and sky light (`89w-host-water.js`); 47 makes the records. The old plain ribbon and its `MAT_WATER`
      (a fallback for a page without core/water, dead on every page that takes this fragment) are removed (2026-10-25), and the
      atmos binding is `89a-host-atmos.js` (`ATMOS.bindHost`, the clock on the world hour) instead of an `ATMOS.init` inside 89w. The export's tile (the Bench's rim) holds neither, so its water section is empty there.
- [ ] **The night has no lamps or life of its own** (`89n-host-night.js` eases the light, the fog and the dome by the world
      hour; nothing glows): the canyons are wild. Pinnacle Rock adds its fires and lamps on core/atmos.
      Stays open (2026-10-25): a design task (lamps and fires are Pinnacle Rock's, on core/atmos), not a fix.
- [ ] **Not in Godot yet**: the rock is meshes made from KSTACKS records (exported as `NECANYONS.records()`); a Godot port
      would port `footR`/`topH`/`mesh` (plain maths) or take the meshes.
      Stays open (2026-10-25): the Godot port is a separate task (GODOT-PLAN.md).
- [x] **Pinnacle Rock does not take the kit yet** (its `PLAN.md` "Biome" row).
      Closed 2026-10-25 (found already done): `settlements/pinnacle-rock/build.py` reads the layout, land, species, trees,
      carnivores, floor, kit and night fragments in place from here.

## Open

- [ ] **The shared sky (SKY-PLAN.md section 9, 2026-10-26): the look to judge.** The painted dome and the giant mesh are
      gone; `89s-host-sky.js` calls `ATMOS.skyBiome` (core/atmos) on the host clock: the page opens at 06:00 on game start's
      day (dawn), `#hour=13` is about the old fixed light. It read the hyperjungle's dome in place; now its own shared sky
      with the canopy lines (ridges). NIGHT (89n) keeps its hooks and the skylight key; the sky drives the lights, fog and
      exposure over it each frame. Draw calls at the default camera (verify.py --assert, GPU): 90 before, 89 after.

