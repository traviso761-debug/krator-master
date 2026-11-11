# Drydocks and boat manufacturing (prefix `dd`, seeds 20100-20124)

Fragments: `src/82-dd-dock.js` (shared helpers + `ddDock`), `src/82-dd-shed.js`
(`ddShed`), `src/82-dd-yard.js` (`ddYard`). Dev targets: `targets/ddDock`,
`targets/ddShed`, `targets/ddYard` (segment-target copies with extra views:
`<Decay> pit/top`, `Down the pit`, `<Decay> sea end/inside`, `<Decay> slip/apron`).

| key | W x LAND x SEA | seeds | tris d0 / d1 / d3 (dev target) |
|---|---|---|---|
| ddDock | 110 x 110 x 130 | 20100+d | 41k / 32k / 60k (57k/57k/77k in the showcase, with land-end riprap) |
| ddShed | 110 x 120 x 40 | 20110+d | 33k / 25k / 52k |
| ddYard | 110 x 100 x 120 | 20120+d | 14k / 16k / 30k |

## What each is
* **ddDock**: an uncovered graving dock. The pit is 156 m long, 46 m across the
  coping, has a 30 m floor at -14 and five stepped altars. It runs out through a
  full-width dock mole (z to +72) to a caisson gate and a walled entrance. There
  is a travelling gantry on rails at x=+/-29, a pump house, and a dockmaster's
  drum. d0 is pumped dry, with a 124 m hull on keel blocks, breast shores,
  staging, and a block on the hook. d1 has the gate breached, the pit flooded and
  silted, the gantry collapsed across the pit, and a holed hulk listing. d3 has
  the pit head filled as a garden terrace behind a retaining wall, houseboats,
  fish pens, a pontoon boom, container houses on the dock walls, and houses on
  the gantry girder.
* **ddShed**: the same pit inside the land apron, gated on the quay line, under
  a 68 x 109 m parabolic white hall. The hall has proud ribs, a glazed
  clerestory monitor, a closed land gable with a great door, and a portal band
  at the open sea end. d0 has a hull being built (stern plated in primer, bow
  bare frames) and a bridge crane on runways hung from the ribs. d1 has the
  shell half gone to the ribs, the glass gone, a rib down across the pit, the
  crane fallen, and a half-hull in silt. d3 is a covered market: fish ponds
  divided by piled weirs, stalls on both floors, lanterns, and washing strung
  between the ribs.
* **ddYard**: a slipway (1:10.7) into a piled launch channel with a 66 m hull on
  a launching cradle. It also has a vaulted fabrication shed, a sawtooth
  plate-rolling hall with its rolls in the door, ring blocks, stacked
  double-bottom panels, an accommodation block, a slewing jib crane, and a
  30 m boat at the outfitting quay. d0 is launch day (bunting, a stand, a
  crowd). d1 is a rusting half-hull on a sagging cradle, with the jib toppled
  across the slip wall, a silted channel, broken piles, and a rolled ring block.
  d3 is a village on the half-hull (houses on deck, a pergola garden over the
  frames, a stair up from the slip), with skiffs built on trestles.

Shared helpers other agents may call (all LOCAL coordinates):
* `ddHull(P,o)`: a plain generic hull with plated range, frames, paint, holes,
  superstructure, blocks, and pitch/roll.
* `ddPit(G,o)`: the stepped pit.
* `ddGantry`, `ddGate`, `ddBar(P,mat,a,b,w,h)`, `ddFigures`, and
  `ddMoleSides(G,nb,d,z0,z1)` (sides for a deck that stands out past z=0).

## Dry pits (read this if you make one)
The underwater fade darkens every `MAT` material by **world y < 0**. That
includes a pumped-dry pit. Everything inside a dry pit is therefore drawn with
unpatched twins: `DDM[k]` are clones kept out of `MAT`, and kit items come in
pairs (`ddSteel`/`ddSteelD`, `ddFigB`/`ddFigBD`, and so on). The pit gets its
own floor slab, because the terrain in it is faded too.

## Shared-change requests
1. **Sea cracks round `dry` stamps (71-port-terrain.js).** With any `dry` stamp,
   the sea is emitted one row of quads at a time, split round dry cells. The rows
   at a pit's z edges meet their neighbours in T-junctions: a 23 km row edge
   against split edges. These show as hairline cracks across the whole open sea
   along those z lines. I confirmed this: the lines went away when the pit was
   not dry.
   *Workaround here:* `ddSeaFix()` in 82-dd-dock.js runs once from the first
   dry-pit builder and re-meshes `PORT_TERRAIN.sea`. Every row is cut at the
   union of all rows' wet/dry boundaries, so rows share vertices. The material
   and UVs are unchanged.
   *Request:* do the same inside `portBuildTerrain`, then delete `ddSeaFix`.
2. **Dry-pit fade.** An opt-out would let dry pits use the normal kit: gate the
   fade by a dry mask, or add a per-material flag honoured by
   `portUnderwaterPatch`.
3. r128 `BufferGeometry` has no `applyQuaternion`. It is worth a line in
   API.md, since `ddBar` hit it.

## Weaknesses / not done
* The d0 caisson gate is a plain box. From the water it hides the hull's lower
  body in ddShed, so the hull reads best from above or from inside.
* The hulls are plain (no bulwarks, hatches or propeller/rudder), and the
  superstructure is stacked boxes.
* The bridge crane, jib and gantry are simple boxes and bars. There are no
  lattice members.
* ddYard is light (14-30k triangles). It could take a steel stockyard, rails or
  a second crane.
* Night lighting is sparse: cyan dots on the cranes and the hall, warm lanterns
  at d3.
