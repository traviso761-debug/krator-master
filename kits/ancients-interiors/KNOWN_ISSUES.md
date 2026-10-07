# Ancients interiors: known issues

- [ ] **Noah's Regret's halls are still placed by hand.** The world's dining room, messes, greenhouse, engine rooms,
  bridge, forward halls, chain locker and stern lounges are laid out in the hull's own coordinates
  (`settlements/noahs-regret/src/70-nr-interiors.js`); the recipes are those layouts lifted out. Moving the world
  onto the recipes needs each hall's floor as a rectangle in its own frame (several are curved or wrap a stair).
- [ ] **No engines.** The engine room reserves the engines' floor for the host; the demo draws a grey block there.
  A machinery piece (a turbine casing, a gearbox) would let the recipe furnish it.
- [ ] **The Ancients' own set is thin.** The `ancient` dress borrows the salvage lords' chairs, tables, carpets,
  divans, bookcases, statues and banners where the Ancients have no piece of their own (`20-ai-dress.js`).

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
