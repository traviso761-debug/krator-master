# Ancients interiors: known issues

- [ ] **Noah's Regret's halls are still placed by hand.** The world's dining room, messes, greenhouse, engine rooms,
  bridge, forward halls, chain locker and stern lounges are laid out in the hull's own coordinates
  (`settlements/noahs-regret/src/70-nr-interiors.js`); the recipes are those layouts lifted out. Moving the world
  onto the recipes needs each hall's floor as a rectangle in its own frame (several are curved or wrap a stair).
- [ ] **No engines.** The engine room reserves the engines' floor for the host; the demo draws a grey block there.
  A machinery piece (a turbine casing, a gearbox) would let the recipe furnish it.
- [x] **The reception recipe is permanent** (opt-in 2026-11-03, folded in 2026-11-08): `src/38-ai-reception.js`, in
  `kit_bundle.bundle()`, the demo sheet and `verify.py --assert`; the `reception` option is gone. Every page that takes
  the kit moves at its next rebuild.
- [x] **`AI.barPlate`'s cross walls ran diagonally** (fixed 2026-11-08): the `.x` wall is `[inner[0], outer[0]]`, straight
  across at the room's start (it was `outer[m]`, corner to corner). kits/metropolis's straightening pass is dropped.
- [x] **`AI.furnishPlan` turned a room's frame toward its first door's point** (fixed 2026-11-08): the frame now faces the
  outward normal of the wall the door is on (`AI.doorWallNormal`), about the area centroid (`AI.polyCentroid`), so a door
  off a wall's middle no longer skews it. kits/metropolis's `mpFrameDoors` is dropped. Every templated room's furnishing
  moves at its pages' next rebuild.
- [ ] **The Ancients' own set is thin.** The `ancient` dress borrows the salvage lords' chairs, tables, carpets,
  divans, bookcases, statues and banners where the Ancients have no piece of their own (`20-ai-dress.js`).

## Real doors and real glass on the sheet (2026-11-03, core/door)

The sheet's halls, ship's rooms and cabins stand in kits/interiors' shells (`50-shell.js`, read in place), which hang each
door's leaf open 75 degrees and glaze a window with a pale lambert pane. `src/75-ai-doors.js` makes each leaf a KDOOR
record (`<room id>.d<n>`, standing open as hung, posed by KDOORHOST: E within reach opens and shuts it, the tip shows near
one) and each pane KGLASS 'clear'; build.py reads core/door's 10, 20, 90 into the page (not into the engine-neutral core).

- [ ] **The leaves are matched to the shell's meshes by order** (the doors with a leaf, in `room.doors` order, against the
      shell group's `part: 'door'` meshes). kits/interiors' shell should register its own leaves (a KDOOR record and a
      `KDOORHOST.object`/`posed` per leaf) and use KGLASS; then this fragment goes. Listed for kits/interiors.
- [ ] **No reachability audit**: the sheet's rooms are shells with no core/walk records (`IX.walk.register` takes a set
      instance, not a `ROOM()` shell). Every hall and room has its one door on the open deck, so each is reached by
      construction; a `KWALK` registration of the shells' floors and walls (kits/interiors) would let `KWALK.reach` prove it.

## The Ancients kit's interiors (2026-10-07)

- [ ] **Skyscrapers have no plans yet.** The user asked for rooms in them but no furniture; their storeys follow each
  tower's own shape function, which lives inside its builder. Next: a ring or bar plate per storey band from each
  tower's radius function, never furnished.
- [ ] **The ruins' holes are not cut into the plans.** A partition can stand behind a hole the builder punched in the
  skin; only the builder's big collapses (`collapse`) open rooms.
- [ ] **Rooms clear the shells at floor height; at full height only by margin.** `AI.storeyAudit` tests each room's
  outline at its floor; a battered or domed shell is kept clear by the plans' own margins (each plan's header says
  which), not by a test.
- [ ] **Stairs are not drawn.** Ring plates keep a core (`core`) and bar plates an end room where the stair would go;
  the planner's stair fixtures are not used for these plans.
- [ ] **Assumptions the builders do not draw** (as kits/interiors/sets/GEOMETRY.md records them for the other kits):
  House C's lobes have two storeys (two window rows) but the builder draws a floor only at 3 m: the upper floor is the
  kit's; House F's rooms stop short of the rock face that slopes through the back of each tray; the Foundry's office
  mezzanines (y 11) and the Assembler's east office block are implied, not drawn; the Vault's server floors are the
  ruin's slab spacing (15.5 m) carried through the intact mass.
- [ ] **A big hall gets a recipe or the placer.** A ring plate's large core with a `recipe` is laid out by that hall
  recipe in its inscribed rectangle (the Watch's charge hall is a mess); one without stays sparse.

## Decisions (not issues)

- The crew, bunkroom and mess programmes stay in `kits/interiors/sets/noahs-regret.js`, where the arcology's
  deck buildings use them; this kit's page loads that set.
- The drill hall skips a few weapon racks at its default size (the wall is shorter than the row); the audit passes.
