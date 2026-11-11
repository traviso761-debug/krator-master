# Container housing - land blocks (prefix `ch`, seeds 20800-20899)

Files: `src/89a-ch-stack.js` (shared ch helpers + chStack), `src/89b-ch-court.js`
(chCourt + yard props), `src/89c-ch-tank.js` (chTank), dev target `targets/chHousing/`.

Keys (all `place:'land'`, W 110, LAND 110, SEA 0, decays 0/1/3, `norepair:true`):
- `chStack` Container towers: 4 lots round a cross of alleys; per lot a 4-7 level
  cantilevered tower (steel balconies, braces, stairs/ladders, canopy/solar/garden/tank
  roof; one on stilts, one with a radome mast), a lower 2-3 level stack, an annex.
- `chCourt` Container compounds: 4 one/two-storey compounds round courtyards (decks,
  awnings, fire pit, table, washing line, water tank stand, solar row, dish, antenna,
  outhouse, garden), fenced gates on two lanes.
- `chTank` Silo and tank houses: 8 houses round a ring path and a green with a water
  tower: silo houses (windows, wrap decks, cones, eave solar), twin silos joined by a
  box, tank-on-saddles houses with a cabin on top and a tall tank with walkway.
Decays: 0 bright/tidy/lit/gardens; 1 toppled stacks, one burnt building per block,
cones fallen, trees through roofless silos, water tower down, overgrown; 3 extra
storeys, plank/rope bridges between buildings, rooftop gardens, stalls, bulbs.

Seeds: builders 20800/20810/20820+d; per-building structure from a private
`chPRNG(208[5-8]x)` so the same buildings stand in every decay.
Triangles per decay (d0/d1/d3, in the showcase): chStack 42k/29k/60k, chCourt 43k/33k/53k, chTank 40k/25k/52k.

Sides: 4 m paved footway round all four sides, hedge/fence line with gates at the
lane mouths, lamps. Per side from `opt.nb[W|E|N|S]` (N = inland -z, S = z=0
edge; missing = natural land): seg -> footway continues; land -> kerb, riprap if
the ground falls >1.2 m; sea -> quay wall + dredge strip (outside:true).

Night: `chLit`/`chBulb` kit items are hidden by day via a PORT_NIGHT hook
(windows show glass by day, warm panes at night); lamps use dot + emberB.

Requests / notes for the infrastructure agent:
- Layout: the showcase has no `place:'land'` support yet, so it lays the three
  blocks in the coastal run (sea-facing z=0 edge treated as natural land: kerb +
  riprap). Please place them behind coastal segments and pass nb N/S; I assumed
  N = -z (inland), S = +z.
- `targets/chHousing/89z-rows.js` has a working land layout (quays in front,
  blocks behind, a block behind a block) that may serve as a model.
Weaknesses: d=0 silo walls read brownish (shared corrugate texture is rust-tinted);
tower stairs are approximate (a flight may end against a box, not on a landing);
d=3 tarp roofs over courtyards are flat sheets.
