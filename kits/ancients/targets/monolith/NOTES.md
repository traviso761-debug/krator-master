# The Monolith — hand-back

Built by a subagent that was stopped by an API usage limit before writing its
hand-back; these notes were written afterwards from an independent
verification run (`verify.py --assert --all-views`, 16 views, all read).

- `src/89g-monolith.js` — `buildMonolith(scene,gx,gz,d)`, `reseed(9720+d)`,
  prefix `mn`/`MN_` (`MN_SITE`, `MAT.mn*`, `TEX.mn*`, kdefs `mn*`).
- `targets/monolith/` — `DECAYS=[0,1]`, intact at x=-2400, ruin at x=+2400.

## Measured
| | triangles | instances | meshes |
|---|---|---|---|
| monolith/0 | 385 304 | 31 012 | 4 |
| monolith/1 | 374 108 | 28 419 | 5 |
All six invariants PASS, error panel clean, draw calls 24-30 across 16 views.

## Form
~1 100 m slab on a flared, buttressed foot; orange/ochre panel cladding over a
pale carved stone "city" that is exposed down one flank (after the user's
reference 1). A through-arch at the base with coffered soffit, inhabited
jambs and an avenue running through it. Three through-oculi, the largest near
the top, each with a thick stepped rim, radial fins and a bridge gallery.
Outlying banded spires on the plain.

Ruin: skin stripped from most of the broad face, crown broken and jagged, the
great oculus rim broken through to the edge, arch soffit spalled, the upper
corner fallen as large slab fragments with a rubble field to the east,
outlying spires reduced to stumps.

## Views
Monolith, The broad face, Edge-on, Through the arch, The arch soffit, The great
oculus, Through the oculus, The lower oculi, The carved flank, The top edge,
Night, Ruined, The broken crown, The stripped face, The fallen corner, The
spalled arch.

## Known weaknesses (from the shots)
- The fallen slab fragments are clean boxes; they read as buildings dropped on
  the plain rather than shattered cladding.
- Night is dim apart from scattered window points; the oculi do not glow.
- ~300 k triangles of headroom per decay is unspent.
