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
      Stays open (2026-10-26): the kit has no such option (`HYPERJUNGLE.build` takes R, quality, heroR, fauna; the heights are
      `SP[sp].H` in `55-biome-hyperjungle-trees.js` `mk()`). Proposed (another biome's files, so not done here): `opt.heightAt`,
      `(x,z) => multiplier` (default none, so every other build stays hash-identical: no extra draws), applied in `buildTrees`'
      `mk()` to `H` and to `crownR` by its square root, and to the saplings' `H`; necanyons' `88-host-build.js` would pass
      `heightAt:(x,z)=>.6+.4*smooth(-1400,600,z)` (the jungle mask's northward ramp), so the forest drops to ~90-180 m toward Korona.
- [ ] **No `dress()`**: the hanging gardens are placed from the kit's own seep lines and ledges (KSTACKS records), not
      sampled off a world's structures. A world that hands its own rock as geometry would need one.
      Stays open (2026-10-25): a design task, for a world that hands its rock as geometry.
      Stays open (2026-10-26): still nothing to fix on this page (its rock is KSTACKS records, which the passes read); a design task for the first world that hands necanyons its own rock meshes.
- [x] **The water is core/water's** (2026-10-19): the creek a flow line (`WATER.flow`, its surface the bed plus its depth
      every 12 m) drawn as its ribbon, the rain pools still water (`WATER.still`, one mesh with `WATER.stillMaterial`),
      on core/atmos's clock and sky light (`89w-host-water.js`); 47 makes the records. The old plain ribbon and its `MAT_WATER`
      (a fallback for a page without core/water, dead on every page that takes this fragment) are removed (2026-10-25), and the
      atmos binding is `89a-host-atmos.js` (`ATMOS.bindHost`, the clock on the world hour) instead of an `ATMOS.init` inside 89w. The export's tile (the Bench's rim) holds neither, so its water section is empty there.
- [x] **The night has no lamps or life of its own** (`89n-host-night.js` eases the light, the fog and the dome by the world
      hour; nothing glows): the canyons are wild. Pinnacle Rock adds its fires and lamps on core/atmos.
      Stays open (2026-10-25): a design task (lamps and fires are Pinnacle Rock's, on core/atmos), not a fix.
      Closed 2026-10-26: the flora lights the night, on core/atmos (`src/89g-host-nightlife.js`; `89-atmos-2-lights.js` and
      `89-atmos-3-particles.js` added in `build.py`): a glow card at each hero monkeycup's mouth (its trap lures by light; the
      pitchers are kept as records, `NECANYONS.LURES`, in 57) and fireflies over the creek's banks, the wettest seep lines and
      the rain pools (centres by KRAND hash; ATMOS.fireflies blinks them at night, not in rain). Two draw calls, ~4.4k
      triangles. Still no lamps: those are Pinnacle Rock's. `?nolife` leaves them out.
      The lures read well close to (soft green beads up a vine); the fireflies (core/atmos's preset, 0.35 m, blinking) are
      only faint specks in a still: an `o.size` on `ATMOS.fireflies` (core/atmos/89-atmos-3-particles.js, a uniform in place
      of `P.size`) would let this page make them larger. A core change, proposed, not made.
- [ ] **The owner's new cards in a close shot (2026-10-26):** the fan palm's fans read crisply (a few long stray fronds
      stand out stiffly); the flametip's scarlet flush reads, but its green leaves come out near black under the leaf
      tint; the stilt lily's grass fountains read, but its forked trunks are flat black (`PAL.lilyBark` 0x2a2420 on an
      untextured box-like fork). Look calls for the owner: lighten `PAL.flame`'s greens and `PAL.lilyBark`, or take a
      fibrous bark set for the lily.
- [ ] **Not in Godot yet**: the rock is meshes made from KSTACKS records (exported as `NECANYONS.records()`); a Godot port
      would port `footR`/`topH`/`mesh` (plain maths) or take the meshes.
      Stays open (2026-10-25): the Godot port is a separate task (GODOT-PLAN.md).
- [x] **Pinnacle Rock does not take the kit yet** (its `PLAN.md` "Biome" row).
      Closed 2026-10-25 (found already done): `settlements/pinnacle-rock/build.py` reads the layout, land, species, trees,
      carnivores, floor, kit and night fragments in place from here.
