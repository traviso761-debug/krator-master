# biomes/greatchasm: known issues

Open items, each with what is owed. The kit was built in one cloud session (2026-11-11, branch `claude/greatchasm`) with **no GPU**:
`verify.py --assert --all-views` ran in software GL (SwiftShader) on every station. **The real-GPU verify is owed on the owner's PC**
(`KRATOR_GPU_LANE`, `KRATOR_GL=gpu`: the log's `gpu-renderer` line must name the card), with the owner's look pass.

## Verified (2026-11-11, the cloud session: SwiftShader, no GPU)

`python3 verify.py <page> --assert --all-views`, 1280x800, software GL (`tools/harness.py`). See the table in the section below for
each page's result as committed (VERIFY-TABLE).

## Owed to the GPU run (the owner's PC)

- [ ] `verify.py --assert --all-views` on all five pages on the GPU. SwiftShader links 32 texture units; the GPUs 16, and ANGLE on the
  Arc 15 (riftrim's measure). The pages are held to 15 on the ground (`every lit program reads 16 texture units or fewer`); confirm on the
  Arc. The heat shimmer (the Deep: core/atmos fx/shimmer, its first page) draws the sky into its target before the world: check its look
  and its cost on the card.
- [ ] The far field runs to 118 km (KFAR, 340 lines a side) with the camera's far plane at 260 km and its near at 1.5 m: check the depth
  precision on the near ground (z-fighting on the ground cover's flat cards) and the frame rate on the Arc.

## Owed to core adoption (`PLAN.md` section 8, "Not taken")

- [ ] **The trade post on core/hamlet** (`PLAN.md` section 8, amendment 1): a `trade` focus (serai court, stores, cisterns, market court)
  and a village shared by two culture rows, each with its own half and a line between; Yuni and Coyote culture rows. Until then the 84
  records are laid by hand in `stations/sill/86-host-post.js` (stable ids, `pending`), and move onto `KHAMLET.village` when it has them.
- [ ] **The post's buildings**: the Yuni half from the Yuni kit (`kits/yuni`: the caravanserai in banco adobe with Tiebele chevron
  bands, the Musgum shell houses, the tower-house, the yellow hyperboloid over the gate), which draws through the Yuni engine that only
  the Yuni-lineage worlds carry; the Coyote half from kits/coyote (planned). All 84 are box stand-ins in their culture's mud now.
- [ ] **The post on core/simulation** (its books: the stock, the caravans' trade of `PLAN.md` section 5) and **core/camp** (the serai as
  the caravans' `court`, the bench's night camp as camp records), and a pin in `tools/scale-model/model/src/60-settlements.js` (outside
  this kit's folder: the scale model's owner).
- [ ] **The amethyst geodes** in the east rim's basalt (KCAVERN with KSPELEO.AMETHYST).
- [ ] **Hazards**: the gas that pools only at night and in still air (a timed `gas`: core/hazard's shared amendment, PLAN.md section 8,
  item 2) is a steady `gas` record in the Deep's three deepest hollows now; the native stalker hexapod's lairs (`hunter`) wait for
  kits/fauna.

## The flora (stand-ins and borrowed species)

- [ ] **The Outlands' ground cover is drawn by this kit as named stand-ins** (needle fur, sac brush, grey cushion, ember scrub, pebble
  mat, crust rosette, frost puff, wall lichen: `GCH.PLANTS[*].tags.standin`), on the library's Outlands cards. When the Outlands kit
  defines them, read them in place and delete the stand-ins (one table: `src/50-biome-greatchasm-species.js`).
- [ ] **The salt tuft** stands in for the abyssal floor's samphire (the eastern abyss's `samphire` item); read it in place when a host
  can grow another kit's floor items.
- [ ] **The trees are read in place** from the built kits: the eastern abyss's jade shrub (the Deep: the plan's own source) and the
  eastern badlands' needle bloom (the sill, the bench, the headwall: a stand-in for the Outlands' and the Loom-Chasms' trees, neither
  built). The badlands' **stilt pod** was dropped: its tendrils floated 2.3-2.6 m off it here (the attach audit: 39 of 143 cards,
  27%); the fault is in its builder (`biomes/ebadlands/src/55-biome-ebadlands-trees.js`), not this kit.
- [ ] Owed with their kits: the Outlands' pleat columns in the dikes' shade (the bench), the Loom-Chasms' cable vines (the sill's
  south), the Outlands' Z8 lichens and cushions on the walls.
- [ ] **No fauna** (kits/fauna owns it): the ostriches, goats, vultures, hexapods, the golden bird on the thermals, the runner bird on
  the road, the halite sifter and the cable-stryder.

## The ground

- [ ] The Deep's floor draws `ground.sand.black` and `ground.obsidian` for the komatiite pavement the code paints
  (`core/materials/PROMPTS-NEEDED.md` section 41, `ground.komatiite.pavement`).
- [ ] The model's 2 km cells smear the bench's lip into a 7-degree ramp; the page keeps the drawn heights and does not invent the scarp
  (`PLAN.md` 7b). A finer model of the walls (a scarp record per bench lip, KRELIEF.scarp) is the scale model's to give.

## The look, seen in SwiftShader (for the owner's pass)

- [ ] The post's stand-ins are boxes and domes in flat colours: they read as the post at range, not up close.
- [ ] The walls 30-120 km off are the far field's vertex colours (banded basalt, frost, bare crests): no texture past the ground's
  square.
