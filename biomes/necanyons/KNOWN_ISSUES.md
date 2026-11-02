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

## Open

- [ ] **The shared sky (SKY-PLAN.md section 9, 2026-10-26): the look to judge.** The painted dome and the giant mesh are
      gone; `89s-host-sky.js` calls `ATMOS.skyBiome` (core/atmos) on the host clock: the page opens at 06:00 on game start's
      day (dawn), `#hour=13` is about the old fixed light. It read the hyperjungle's dome in place; now its own shared sky
      with the canopy lines (ridges). NIGHT (89n) keeps its hooks and the skylight key; the sky drives the lights, fog and
      exposure over it each frame. Draw calls at the default camera (verify.py --assert, GPU): 90 before, 89 after.

## The final rebuild's turn (2026-10-27)

- [ ] **Pinnacle Rock reads 46, 47, 50, 55, 57, 60, 70 and 89n in place; its page is not rebuilt here.** Every change this turn made to
      those fragments is gated off for it (LAND defined without `rebuild`: no new talus, water works, strata, contour or wear; the
      card fit, the runtime LOD and the impostors are null without the host's settings), but its page text moves with theirs: rebuild
      and verify it at its own turn. The card fit (`materials.json`) reaches it, as its pack is this kit's.
- [ ] **Cave mouths not taken.** KCARVE cuts a heightfield; these walls are KSTACKS meshes. An alcove under a seep line (the hanging
      gardens of Zion) wants a KSTACKS notch kind or a mesh cut: a core task.
- [ ] **No seep dam.** `WATER.seepDam` is a landslide-dammed lake; no canyon here has a slide. A candidate for a later station.
- [ ] **Looks for the owner:** the far mesas (KFAR) read pale through the height fog from 'From afar'; the crown clumps on their
      sprigs' stems (flametip, ember plum) read sparser than the old tripod; the fall is a thin seep curtain (`width` 3 m); the floor
      cells round the water works are drawn at ~1.5 m (fine patches), the rest at 16 m.
- [ ] **Station 3's carnivores are station 1's sizes**: "growing larger toward Korona" is not drawn (a scale option on 57's passes).

- [ ] **The foliage guards' audit, with a ceiling** (2026-10-27): necanyons' own cards pass on every page (`?nojungle`: 0.38%, 0.03%,
      0.45%; its crowns now on twigs grown from their limbs, its flowers on twig tips and stalks). What floats is the hyperjungle's,
      read in place (`bloom`, `ucard`, `ribbon`, `clump0-2`): 7.9% on station 1, 3.3% on station 2, 1.2% on station 3, so each page
      sets `guards.maxShare` (.08, .035, .013: 99 and the stations' STATION_TAKE). Lower them when the hyperjungle's fix lands.

Switches: `?diet=0 ?index=0 ?lodmerge=0 ?lodfade=0 ?lodcull=0 ?kground=0 ?far=0 ?hz=0 ?hfog=0 ?strata=0 ?contour=0 ?weather=0
?springs=0 ?confluence=0 ?arches=0 ?impgain= ?impwrap=`.
- [x] **The creek's ground** (2026-11-02): the floor's 16 m cells under an 18 m channel. Now a 4 m strip over the carve (`47`, ?creekstrip=0), the bed graded (the water
      rose downstream by up to 4 m and ran up to 19 m under the savanna's talus) and a channel section through it (`creekGround`). A page check, `WATER.audit` on the creek: 0 findings on all three
      pages (167, 461 and 352 before the grade). The strip adds about 40k triangles.
- [ ] **Palms rooted at the creek's edge** (seen 2026-11-02 in the view "The creek", not measured): a dark-stemmed clump stands at or in the water's edge. `waterMask` holds a clump's centre
      off the water; its stems are not held. Give the placement `WATER.fieldAt`'s shore, and `WATER.edgeAudit` the plant records.
