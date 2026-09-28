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
  is carried through one matrix (10 degrees about a hinge on the core rim at
  20 degrees) as it is written, so the lean costs no draw calls. Gone blocks
  become fallen pieces in the court.

## Status

Round in progress — see the hand-back for final numbers.
