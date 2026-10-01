# Round 2: WEALTHY COMPOUNDS   (agent "rich")
Read `briefs2/_common2.md` first. You own `src/58-rich.js`.

The user's verdict: **"emir's palace can have more colorful ornamentation"** — and, generally, "buildings look great but
needs a quality pass", with lanterns and windows to stay at their current counts.

## 1. The Emir's Palace: more colour
It reads as an adobe box with blue domes today. The reference is the Hausa emir's palace (`refimg/02-hausa-palaces.jpg`):
a whole facade of polychrome relief — interlaced knots, rosettes, spirals and bands in green, yellow, red, blue and
white over the entire gate block, not a panel or two — plus the new Gaudí references (`refimg/17-sagrada-familia.jpg`,
`18-casa-batllo.jpg`, `19-casa-batllo-painted.jpg`, `20-batllo-amatller-street.webp`) for how far trencadis can go: a
whole wall of broken tile in shifting colour, a scaled roof that changes hue along its length, mosaic-lined arch
reveals, glittering finials. Specific things to add:
- the gate block's whole front face in `paintcol` with a `relief` band above and below, not a single panel;
- trencadis on every dome and every parapet coping, with the colour CHANGING across each dome (blue at the base into
  green and gold at the crown) rather than one flat tint;
- mosaic archivolts (`F.archband`) round the great portal and every court arch;
- colour-glazed horn pinnacles alternating along the parapets;
- `GILDC` for the door leaves, finials and the sunburst over the gate;
- a tiled dado (a waist-high band of `mosaic`) round the courts;
- the second court is a narrow 8 m slot today and the first is large and empty — give the big one a pool, planting
  (`F.tree`) and a colonnade, and widen or repurpose the slot.
Spend up to ~11k triangles on the palace; it is the landmark of the inner city.

## 2. Quality pass on the rest, from your own list
- the proud dark window boxes on curved and battered walls: `F.window(..., {noReveal:true})` now exists;
- true round windows: `F.roundWindow` now exists — use it for the terrace apartments' circular openings instead of the
  painted disc with a square pane;
- Burmecia blue-grey now has a palette entry, `BLUEGREYC` — swap your runtime mix for it;
- the merchant palace's roof is bare apart from a pavilion and two chimneys;
- compound C and D are ~35% over the old 1500 budget: leave them, the budget is relaxed.
- variants you never re-shot, and the palace court at eye level, which your only attempt (`e7`) aimed the wrong way.
