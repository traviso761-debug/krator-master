# Arcube — completion pass (round 2) hand-back

The agent doing this pass was stopped by an API usage limit after writing the
code and the views file, before its hand-back. These notes were written from an
independent verification run afterwards (`verify.py --assert --all-views`,
18 views, every shot read).

## Measured
| | before (39a5cce) | after |
|---|---|---|
| arcube/0 | 386 878 | 403 694 triangles, 38 379 instances, 13 meshes |
| arcube/1 | 296 908 | 323 792 triangles, 24 795 instances, 15 meshes |
All six invariants PASS, error panel clean, 66 registered volumes.

## Sheet features now present (sheets 27, pp. 111-112)
- Side elevation: triangle friezes along the ridge and at the equator, rows of
  oval light wells in dark residential panels, a central circulation spine of
  round openings, slot bays below the equator.
- Heliport tower beside the upper-left face, rising above it with a stepped,
  flared crown and a deck (reads in the diamond elevation as on the sheet).
- Five broad inhabited piers per flank with arched feet, replacing the slim
  legs; the keel clearance under the belly is kept.
- Front elevation concentric bands and the stepped diamond void carried over
  from round 1.

## Ruin
The south face collapsed inward over a large area, exposing the floor plates
behind it; a pier failed and lies in pieces on the plain; the heliport tower
has fallen out onto the north-west plain. Round 1's spall is kept.

## Views (18)
Arcube, The diamond elevation, The side elevation, The midlevel plan, A light
well, The piers from below, A pier, The friezes, The void, The city centre, The
heliport, The heliport tower, The rings at night, Ruined, The broken corner, The
spall, The fallen pier, The fallen tower.

## Weaknesses
- The ruin's outline is still mostly a whole diamond: the collapse is a gouge
  in a face rather than a missing corner of the envelope.
- The fallen heliport tower is small in its own preset.
- ~300 k triangles of headroom per decay remain.
