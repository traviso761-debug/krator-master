# targets/kept — Plymouth and Arcoindian I as the True Heirs keep them

The Eternian kit's P5 (`kits/eternian/PLAN.md` section 7): the `kept` state on two Ancient bodies, chosen by the owner
(2026-10-20: Arcoindian I and Plymouth, in place of the memorial group's Drum and Wing). Built with `python3 build.py
--target kept`; the page is `dist/kept.html`.

## How it works

- `89z-rows.js` places both bodies intact (`DECAYS=[0]`): Plymouth at x -980, z 0; Arcoindian at x -1 650, z -3 400.
  No greening (`RUINS=[]`).
- `8aq5-kept-pass.js` is a pass over the bodies' **materials**, so the Ancients kit's builders are not forked:
  - the glazing (`MAT.glass`) becomes alabaster lit from within, held in a bronze tracery grid drawn in world metres
    (mullions every 1.2 m, transoms every 1.6 m);
  - the shells (`plyWall`, `plyKit`, `aiWall`, `aiBlk`, `aiTop`, `aiKit`) are cleaned toward the Ancient white and carry
    cyan strips every 24 m of height, alive on about a fifth of their 30 m runs (a hash of where the run is, so the same
    runs are lit on every machine); an instanced piece's world position takes its instance matrix;
  - nothing is patched: Plymouth's corrugated tin becomes verdigris sheet, its tarps the State's green cloth.
- `91z-views.js` carries the Sanctum page's horizon fix (the far plane and the sky shader's `pow` of a negative).

## The quality pass on the two bodies (the owner, 2026-10-20)

Edits to the Ancients kit's own builders, so the `plymouth` and `arcoindian` targets changed too:

- **Plymouth** (`src/88-plymouth.js`): the inner liner (the dark wall behind the shell) now stands in the intact state as
  well as the ruin, and is holed where the street, plaza and court cut the mass (it had run across their openings); the
  light court's east and west walls now continue over the channel's mouths from the vault's crown to the court's top
  (the court looked into the hollow over the vault and out through the mountain); the exterior stairs are two flights
  with a half landing, a landing at the foot and one at the head that crosses the rim onto the deck above through a gap
  in its parapet, on the run's own line and never across a chamfer, chosen without a draw.
- **Arcoindian I** (`src/89b2-arcoindian-plinth.js`): the same stairs, on the riser's true tangent (the lobed plan is not
  a circle); each tower, its crown and its finial stay 4 m under the rock roof (the residential tower went through it).

## Checks

- `python3 verify.py dist/kept.html --assert`: OK (2026-10-20), 0.78 M triangles, 66 draw calls at the hero.
- `plymouth.html` and `arcoindian.html` verify OK after the quality pass.
