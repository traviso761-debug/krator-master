# The Crescent — hand-back notes

Target `crescent` (`dist/crescent.html`), builder `buildCrescent(scene,gx,gz,d)` in
`src/89h-crescent.js`, seed `reseed(9730+d)` (claims 9730-9732; only 0 and 1 are
used). Intact at x = -2400, ruined at x = +2400 (`ROWS.crescent.s`).

## The form (measured from the builder)

| | |
|---|---|
| height | 1 112 m (outer arc top; centre CY 522, radius R1 590) |
| outer edge | one circular arc, 259 degrees, 2 670 m long |
| radial thickness | 320 m at the belly, 0 at both horns (non-concentric inner edge) |
| depth across the plane | 200 m at the belly, 10 m at the horns |
| lower horn | tip at (-277, -3): it lies on the plain and the terraces rise from it |
| upper horn | tip at (-465, 885): cantilevers 190 m west of the lower tip |
| terraces | 58 levels of 15 m (4 storeys) from 4 m to 874 m, in tiers of 2-5 levels pushed 0/16/30/48 m out or 10 m in |
| dome platforms | 8 cantilevered decks, 50-86 m reach, domes r 18-31 m (lower-deck domes 7-34 m) |
| footing | 3-step plinth 676 x 260 m; plaza ellipse 1 660 x 1 120 m; raised basin 460 x 660 m under the horn |

Orientation: the crescent stands in the plane z = 0, belly east, concave mouth
west (toward the sun), so +z is the south side face.

## How it is built

- Everything is written in `s` (0 lower tip .. 1 upper tip) and a cross-section
  `XS(s,u,v)`: side faces are u = 0/1, the shell v = 1 (rounded into the sides),
  the horn soffit v = 0. A cut at any `S(u,v)` is watertight by construction, which
  is how the ruin's jagged fracture meets shell, sides and soffit exactly, and how
  the three fallen pieces have matching fracture faces.
- The inner edge up to 70 m below the concave's peak is a STAIRCASE; the side
  faces follow it exactly, so the terracing is the side-elevation silhouette.
  Plates between risers are terraces (setback) or painted-shade soffits (overhang).
- Zero-triangle window walls: side faces (30 m tile, 8 x 8, one lit in eight),
  risers/horn soffit (glazed gallery, 24 x 15 m, warm glow), both with emissive
  maps. The shell is dark bronze with a Truchet-arc gilt filigree (emissive at
  night); ruin shell is verdigris with a ghost of the gilt.
- Real geometry: balconies, bronze fins, set-back blocks and towers, domes with
  drums/lanterns, pools, pavilions, stairs, gardens, brackets, jutting decks and
  masts, floor-line ledges on both side faces every 15 m, hoop ribs on the shell,
  ribs under the horn, plaza colonnade, lawns, lamp paths, people.
- Ruin: upper horn snapped at the top terrace (jagged fracture in floor-section
  material, protruding plates and rebar) and lying in three pieces across the
  forecourt; shell plates missing in clusters with liner, hoop ribs and floor
  plates behind; four terrace collapse zones with cavities, broken slabs and
  rubble cascades on the decks below; three platforms gone; domes cracked open;
  dead windows; verdigris; moss, trees and vines on every deck; stains down the
  side faces; paving broken and greened.

## Numbers (final verify)

See the hand-back message for the final per-decay triangles/draw calls; all six
invariants PASS. Draw calls 29-40 across the 16 views (8-10 meshes per decay;
everything opaque is merged per material).

## Known issues / weaknesses

- The side faces are the largest surfaces and are still mostly texture; the
  15 m ledges help at mid range but at 2 km they read as a fine stripe.
- The top ~70 m of the concave under the horn (above the last terrace) is smooth
  soffit, so the terracing stops short of the peak of the curve.
- No shadows in the kit: the stacked overhangs rely on painted shade; the belly
  (facing east, away from the sun) is dark bronze in all day views.
- The basin does not reflect anything (no env map) — it reads as flat blue-grey.
- Floor plates visible through missing shell plates are axis-aligned boxes; on
  sloped parts of the shell they read as a regular comb.
- Fallen pieces lie flat on their side faces; they do not interpenetrate each
  other but rubble is scattered, not modelled as crushed plaza under them.
- Budget: ~230 k intact / ~320 k ruined of the 700 k ceiling — headroom left
  deliberately rather than spent on filler.
