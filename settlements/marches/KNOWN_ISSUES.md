# The Marches' forts: known issues

The sheet (`dist/marches.html`, M1) draws the fort asset as the Strongwall session left it on
`claude/strongwall-plan-c1ee33` (merged at 9be1f476, 2026-11-23). This build does not edit the asset
(`kits/xanadu/src/80f-xa-fort-data.js`, `80g-xa-fort.js`): what it would need from it is listed here, for the Strongwall session.

## For the fort asset (the Strongwall session)

1. **`xa_fort_watch` draws one fixed plan.** 80g's `XF_PLANS.watch` is `XFORT.plan({size:'watch'})` with no options, and the def
   ignores `o.outline` and `o.gateEdge`. M2 fits each ward to its knoll (PLAN.md section 2: "a convex outline fitted to the knoll");
   the def needs to draw `XFORT.plan(o)` when a world passes an outline (the plan already takes one). Until then both forts are the
   56 x 42 m rectangle.
2. **`o.seed` sets both the damage and the look.** `xfDraw` reseeds the whole fort with `o.seed` (colours, merlons) as well as
   `XFORT.damage`. The sheet passes each fort its own seed (`KRAND.child` of its id) so the two fall differently; a fort that should
   keep one look through its states, and only change its ruin, would want the two split (e.g. `o.damageSeed`).
3. **The field gun is drawn** (80g `xfGun`, a bronze piece on its carriage on the gate tower): PLAN.md section 4 called it missing.
   It is not drawn in the damaged state (the gate is burnt) nor the ruined one; a damaged fort could show the gun tipped off its
   carriage as a wreck watched by core/ruins.
4. **The relay post** is `xa_fort_post` at its one size; it has no fort it belongs to in its record (a post's `fort` and `rota`
   for the sim, S3).
5. **The watch fort's interiors** (the `xanadu-fort` set, F4) are not turned on on this sheet (Xanadu's page has them off unless
   `?interiors=1`); Strongwall's page turns them on. Six forts furnished would be heavy for a sheet; M2's region page may want them on
   for the kept forts only.

## For the Xanadu kit (its owner)

6. **The outside works the kit lacks are written here**, in `src/80m-mr-works.js`, on the kit's contract: `mr_wayside_shrine` (PLAN.md
   section 4 names `xa_wayside_shrine`), `mr_cistern` (the stable yard's cistern and trough) and `mr_road` (the road down, a
   straight gravel bed). They belong in `kits/xanadu` when its owner takes them; moving them changes Xanadu's pages, so not here.
   No gold on them (the fort's rule, `settlements/strongwall/PLAN.md` 5.5).
7. **Textures**: the fort's three proposed sets (`wall.rubble.limewash`, `wood.gate.studded`, `wall.limewash.scorched`;
   `core/materials/PROMPTS-NEEDED.md` section 53) are still owed; the sheet shows the stand-ins.

## On this sheet

8. **Flat ground, no region.** Mārchiz is cut after the vertical stack (the owner, 2026-11-22). The forts, the road and the posts stand
   on the showcase's meadow at y 0; the relay posts are set off to the side, not sited by sight (M2).
9. **The tune under a numbered name.** The page is one script in the fragments' name order, so `build.py` writes
   `core/region/data/xan-tune.js` as it is to `gen/69m-mr-tune.js` (not committed) to load it before the rows. A `kit.json` external
   with an order name (a change to `settlements/xanadu/build.py`) would remove the step.
10. **The garrison's split is proposed** (`src/80n-mr-forts.js` `MRF.garrison`): household 10, foot 88, horse 25, musketeers 10 (the
    tune's), gunners 5, the relay post's rota 12. The node test holds its sum to the tune's 150.
