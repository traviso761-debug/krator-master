# Shelf

The Line's north station town on the Outer Wall's north escarpment, the Dalab Council's (scale model 5.1 px 461,1161): the Ancients' cliff
city (the kit's `targets/shelf` form, built as `targets/ledge`, designated for Shelf by the owner, 2026-11-17, and rebuilt from records, 2026-11-22) hung off an
850 m face toward Dalab's plain, the station and the caravan terminus on the plateau at 3,680 m, the shelf town on the bench at 2,830 m.
The spot, the plan and the owner's answers: `PLAN.md`. The size: `AREAS.md`. The sheets: `floors/`. The gaps: `KNOWN_ISSUES.md`.

| File | What |
|---|---|
| `src/30-shelf-layout.js` | THE LAYOUT ([G data]): 238 decks (34 layers x 7 wings) by state and holder, the plateau's and the shelf's buildings, the lifts, the Line, the heaps, the links |
| `src/31-shelf-rules.js` | its rules ([G data]): `SHELF.groundAt`, the census, the Line, 23 checks, seeds, tags; the stack's records are `KCLIFF`'s |
| `test-shelf.js` | `node settlements/shelf/test-shelf.js`: every check with a negative, the ground's marks, seeds, tags, `AREAS.md` |
| `shelf_blueprint.py`, `layout_dump.js` | the sheets and `AREAS.md` on `kits/ancients/cliff/cliff_blueprint.py` |
| `build.py`, `verify.py` | `dist/shelf.html`: the Ancients kit's runtime, the Dalab set, `kits/ancients/cliff` (KCLIFF) read in place, core/rand, drawn, tags, ruins, terrain, atmos, host FULL |
| `src/45`, `8s0`-`8sc`, `89z`, `99` | the stage and ground, the tags, the shell, the towns, the wreck, the sky, the views and checks (each a call to KCLIFF) |

```
python3 tools/build.py settlements/shelf
node settlements/shelf/test-shelf.js
python3 settlements/shelf/shelf_blueprint.py
KRATOR_GL=gpu python3 verify.py dist/shelf.html --assert --all-views --out shots     # from settlements/shelf
```

A fresh worktree: `python3 tools/lfs_needs.py settlements/shelf --pull` (the Ancients', Dalab's and Shelf's `tex/`, and the four library sets).