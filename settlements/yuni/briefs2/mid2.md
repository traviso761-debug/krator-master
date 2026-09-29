# Round 2: MIDDLE-CLASS HOUSES + TRADE   (agent "mid")
Read `briefs2/_common2.md` first. You own `src/56-mid.js`.

The user's verdict: "Buildings look great but needs a quality pass. keep lanterns and windows at current counts."
So this round is **not** about trimming triangles — the budget is relaxed and the lantern/window counts stay. It is
about the things that are visibly wrong or thin.

## 1. Your own "not happy with" list — work it top to bottom
- **Door surrounds on battered walls stand proud at the top.** Everything set into an `F.fr8` face has to be placed at
  the face's own height: the half-width shrinks by 8% of the wall's height fraction. The planner fixed exactly this on
  the reference asset (`55-mid-example.js`, functions `zf(y)`/`xf(y)`) — copy that pattern into every one of yours.
- **The shop awning hides the shopfront arch from a high camera.** Shorten the awning's projection or raise it.
- **Caravanserai:** the gate's mosaic surround reads as a broad slab rather than a fine band — use `F.archband` with a
  thin `t` and a real reveal; the court arcades are coarse at 4 segments and have no back faces, so from inside the
  court you see through them (that is worth fixing — it is the one asset the user will walk into); the camels are
  blocky. Also give the court more to look at: bales, a trough, tethered animals, tents, lamps.
- **Yard walls** on the potter's and dyer's yards hide the contents at street eye level — drop them to ~1.4 m, or open a
  gate in the +z face wide enough to see the kiln and the vats.
- **Market hall B** is the heaviest thing you have relative to what it shows; simplify the arcade, not the domes.

## 2. New helpers that replace your workarounds
`F.window(..., {noReveal:true})` for curved walls, `F.disc` / `F.roundWindow` for round openings, `F.door(..., ly)` for
a door on a plinth, and `F.tree(lx,lz,kind,h)` — drawn from F's own stream, so you can drop your private tree.
New colours: `GILDC`, `BLUEGREYC` (Burmecia blue-grey, for the townhouse's blue-grey variant), `STONEC`, `THORNC`.

## 3. Then shoot what you never looked at
Your own list: the top views you took but never read (townhouse, Djenné, round-tower, courtyard, smithy, dyer, shed);
shop-house B and D (hidden behind the UI panel last time — `shoot_sheet.py` hides the panel for you); stall variants C
and D; the market tent after its last fix; and everything you changed after your final screenshots.
