# Ancients interiors: known issues

- [ ] **Noah's Regret's halls are still placed by hand.** The world's dining room, messes, greenhouse, engine rooms,
  bridge, forward halls, chain locker and stern lounges are laid out in the hull's own coordinates
  (`settlements/noahs-regret/src/70-nr-interiors.js`); the recipes are those layouts lifted out. Moving the world
  onto the recipes needs each hall's floor as a rectangle in its own frame (several are curved or wrap a stair).
- [ ] **No engines.** The engine room reserves the engines' floor for the host; the demo draws a grey block there.
  A machinery piece (a turbine casing, a gearbox) would let the recipe furnish it.
- [ ] **The Ancients' own set is thin.** The `ancient` dress borrows the salvage lords' chairs, tables, carpets,
  divans, bookcases, statues and banners where the Ancients have no piece of their own (`20-ai-dress.js`).

## Decisions (not issues)

- The crew, bunkroom and mess programmes stay in `kits/interiors/sets/noahs-regret.js`, where the arcology's
  deck buildings use them; this kit's page loads that set.
- The drill hall skips a few weapon racks at its default size (the wall is shorter than the row); the audit passes.
