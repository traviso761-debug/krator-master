# Yuni — round 2 (the quality pass).  Read this, then your own briefs2/<name>2.md.

Your working copy has been REFRESHED with the merged world: `src/` now holds every family's fragment (yours plus the
other four), `API.md` is updated, and `refimg/` has four new Gaudí references. Your own fragment is unchanged — pick up
where you left off. You still own ONLY your own file(s); do not edit anyone else's.

**New in the contract** (see API.md for the exact signatures):
- `F.window(..., {noReveal:true})` — drops the flat dark reveal box. Use it on curved, battered or fluted walls, where
  that box stood proud at the silhouette. Several of you flagged this.
- `F.disc(lx,ly,lz, nlx,nlz, r, thick, col, fam)` — a disc lying in a wall: oculus, medallion, boss, wheel.
- `F.roundWindow(lx,ly,lz, nlx,nlz, r, colFrame, spokes)` — frame ring + dark socket + radial mullions + a night pane.
- `F.door(..., ly)` — a sill height, for doors up on a plinth.
- `F.tree(lx,lz, kind, h, ly)` — kind = cypress | pine | olive | palm | shrub, drawn from **F's own stream**, so trees
  are seed-stable and you no longer need a private tree helper. Replace yours with it where it is a straight swap.
- New palette aliases: `GILDC` (gilding), `BLUEGREYC` (Burmecia rain-washed blue-grey stone), `STONEC` (dressed warm
  limestone), `THORNC` (dry thorn / brush).
- `F.lathe`/`F.tube` need y strictly increasing; `rfn`'s angle now arrives in the asset's own frame, so lobed and
  fluted shapes rotate with the building.

**The budgets are relaxed.** The user has seen the buildings and asked for a quality pass, explicitly saying to KEEP
lanterns and windows at their current counts. So: do not strip detail to hit the old triangle numbers. Spend where it
buys silhouette or a signature detail; just don't add a new thousand triangles per house for something nobody will see.

**What "quality pass" means here.** Go back through your own report's "not happy with" list and fix what you can see,
plus the items in your own brief below. Then LOOK at every variant you did not re-shoot last time — several of you
listed those honestly; that list is your shooting list. Use `shoot_sheet.py` (new, in your copy's root) rather than
`verify.py` for close-ups: it opens the page once and steps the asset selector, so a dozen views cost one browser run:

    python3 shoot_sheet.py qa list                 # index -> name for every item on the sheet
    python3 shoot_sheet.py qa 46 46:2 47 48 55     # front views, plus ":2" for plan and ":1" for the back

Run it in the background (`(python3 shoot_sheet.py qa 12 13 14 > qa.txt 2>&1; echo done > qa.done) &`, then poll) — it
takes about 25 s to load plus a second a shot, and the machine is shared with four other agents.

Report in the same format as last time, and again be honest about what you did not look at.
