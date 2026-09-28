# The Drum — hand-back notes

Target `drum` (`dist/drum.html`), builder `buildDrum(scene,gx,gz,d)` in
`src/8af-drum.js`, seed `reseed(9630+d)` (claims 9630-9632; only 0 and 1 are
used). Intact at x = -2200, ruined at x = +2200 (`ROWS.drum.s`). Presets are
derived from `DR_SITE`, which the builder fills.

## The form (from the builder)

| | |
|---|---|
| height | 836 m to the coronet (YC); last tier top 752; core roof 770 |
| diameter | 344 m at the widest tier (ro 172); core 168 m (RW 84) |
| fins | 12 radial, 7 m thick, full height, on a 30 degree bay from 20 degrees |
| tiers | 9, block heights 34-66 m, gaps 20-44 m, outer radius 122-172 m |
| blocks | wedge-planned, 1/2/3 to a bay, some tiers staggered, one tier of two rows (upper set back 12 m); ~260 blocks intact |
| sky gates | 3 arched tunnels through the core, W 56-64 m, H 114-134 m, on axes 50/110/170 degrees |
| base | 12 buttress feet splaying to r 196 at the ground; 12 lit portals; 3-step podium r 214 |
| court | r 560 lawn, 12 radiating lines of 4 stepped monoliths (11 -> 4.4 m), an allée of two runs of monoliths out to 900 m on the 95 degree axis, kerb ring; forest ring to ~1 430 m |

Scale note: the memorial brief suggested 700-850 m; the common brief says
~1 000-1 150. I kept the Drum's own 836 m because the idiom is a squat drum:
at 1 100 m on a 344 m diameter the figure goes past 3:1 and starts to read as
a column, which is the brief's named risk. 836/344 = 2.4:1.

## How it is built

- Everything is (r, theta, y). Fins, core, gate linings, walls and blocks are
  quads written straight into per-material buffers with world-scale UVs and
  winding normals (one mesh per material: 10 draw calls for the structure).
- The fins' outer edge `RF(y)` is one function: the foot flare, flat in a
  tier, and in each gap a two-sided power flare `m+(a-m)(1-t)^p+(b-m)t^p`
  swinging in to `rm` and out to the next tier's edge. Fin edge carries a
  glazed lift slot (emissive).
- Blocks are wedge prisms between radial lines offset by the slot width, so the
  slots between them are parallel; outer face fluted by real piers every 6 m.
- Sky gates: core facets inside the arch (+ half a facet) are dropped; the
  tunnel lining (window wall), floor (a garden) and a wrapped architrave close
  it exactly. Blocks whose middle lies inside the arch scaled to the outer face
  are left out, so the gate's outline is stepped blocks outside, a clean arch
  in the core.
- Ruin: `route(x,y,z)` classifies every quad and kit item against two jagged
  azimuthal cut surfaces: stump / leaning section / gone. The leaning section
  is carried through one matrix (12 degrees about a hinge on the core rim at
  20 degrees) as it is written, so the lean costs no draw calls. Gone blocks
  become fallen pieces in the court.

## Numbers (final `verify.py --assert --all-views`, 16 views)

All six invariants PASS; error panel clean.

| | triangles | instances | meshes | draw calls (16 views) |
|---|---|---|---|---|
| drum/0 intact | 241 620 | 9 241 | 8 | 22-32 for the whole scene |
| drum/1 ruined | 329 692 | 14 323 | 9 | |

Scene total 571 312 triangles; 17 registered volumes. Budget headroom (~370-460 k
per decay) deliberately unspent rather than spent on filler.

## Ruin (d = 1)

- Break surface `cutS` ~526-570 m (lower on the lean side), second break `cutT`
  ~612-636 m: the leaning section is tier 7 (the widest, r 172) plus fin
  stubs, rotated 12 degrees toward 20 degrees about a hinge on the core rim.
  Ruin height ~650 m vs 836 m intact; the coronet, lantern and tiers 8-9 are gone.
- The wedge under the lean (tiers 5-6 within 42 degrees of the fall) lost 80%
  of its blocks and most of its fins; elsewhere 8% of blocks fell, 22% of the
  remaining faces are stripped to the floors (section texture + slab ends),
  16% of fins are snapped in each gap, gates 30% wider with blocks torn from
  the tiers round them, architraves broken.
- 32 fallen blocks (tipped on their broadest face, 8-22% buried, mossed, some
  with a tree), 14 fin slabs, 7 coronet arcs and the lantern lie in the court
  toward the fall, with rubble heaps; walls under them are not built, others
  toppled/leaning/missing; wild grass, 520 trees in the court, forest closing in.
- Fracture rims carry rebar and slab ends; broken floor plates inside the core
  only where its wall still stands; crushed storeys under the hinge.

## Views

The Drum (hero) · Up the shaft · Through the sky gate · A tier close · The crown ·
A sky terrace · The court walls · The allée · From above · By night (intact) ·
Ruined · The lean · The fracture · The fallen top · The ruined court (eye point
computed by the builder, clear of debris and trees) · Ruin from above.

## Known issues / weaknesses

- Intact concrete still reads pale/beige under this kit's warm sun and haze,
  not as dark as Darco; the ruin is clearly darker.
- From the hero the ruined top reads as a tilted mass with dark block
  undersides; the lean is unambiguous only in 'The lean' and 'The fracture'.
- Fin side faces are plain board-marked concrete (no openings) — large blank
  planes close up.
- Lit windows are texture (one room in five); by day they read as a fine
  speckle on the blocks.
- The inside faces of the ruined core's ragged rim show the window texture
  (DoubleSide) rather than a proper section.
- 'The ruined court' stands just outside the kerb on bare soil.
- Fallen pieces are boxes laid down, not broken shapes; they do not crush the
  lawn under them.
