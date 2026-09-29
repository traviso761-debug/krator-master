# Terminals and the heliport (agent 3, prefix `tm`, seeds 20300-20399)

## Files
- `src/84-tm-a-ship.js` - the `tm` helpers (plans, bands, slabs, frames for
  spans, enclosed tube, canopy, control-cab tower, trucks, vessel alongside)
  and the `tmShip` segment. Sorts first because b and c use its helpers.
- `src/84-tm-b-pass.js` - `tmPass` (+ coach kit items).
- `src/84-tm-c-heli.js` - `tmHeli` (+ craft, tank, windsock, leg kit items).
- Dev targets: `targets/tmShip`, `targets/tmPass`, `targets/tmHeli` (segment
  copies with close-up, per-decay and intact-night views), `targets/tmEdges`
  (edges copy, currently PORT_ONLY='tmPass').

## Keys, footprints, seeds
| key | W | LAND | SEA | seed |
|---|---|---|---|---|
| tmShip | 110 | 100 | 50 | 20300+d |
| tmPass | 110 | 110 | 110 | 20310+d |
| tmHeli | 110 | 70 | 150 | 20320+d |
20330-20399 unused.

## Triangles per decay (showcase, d0 / d1 / d3)
tmShip 36k / 41k / 43k; tmPass 40k / 34k / 58k; tmHeli 23k / 22k / 41k.
All well under 200k; draw calls 6-9 meshes per placement (everything opaque
batched, glass merged to one mesh per builder, detail instanced).

## What each decay shows
- **tmShip**: ops building (rounded ends, colonnade, ribbon glass, sun fins,
  glazed stair drum, plant room), 28 m control tower with faceted glass cab,
  enclosed air-bridge on two piers, covered walkway to the quay and a quay
  canopy, marshalling yard (5 lanes, gate canopy with booths, trucks).
  d1: cab shattered, roof slipped, antenna down; air-bridge middle span fallen;
  canopies holed; a truck on its side; berth silted. d3: market under the gate
  canopy, container houses in the lanes, a shack in the cab, plank bridge.
- **tmPass**: four terraced sea-bulging superellipse tiers with glass and
  hedged terraces, a wing roof, full-height glazed concourse; two enclosed
  boarding bridges on V-piers to boarding towers on a liner berth platform,
  telescopic arms; plaza with fountain, tree rows, coaches, entrance canopy.
  d1: glass gone, trees on terraces, W bridge spans fallen into the silted
  berth, E tower broken and lying across the platform. d3: concourse market,
  container houses/gardens on terraces, E bridge an enclosed street (lit
  windows, awnings, roof shacks), W bridge a timber-and-tarp street on
  trestles, fishing boats at the platform.
- **tmHeli**: two raised pads (sea-fort legs round a stair drum, net, H,
  rim lights), walkway on piles from the quay, vaulted hangar, control cab,
  bunded fuel store with pipe run, ground pad, windsock, craft.
  d1: pad 2 tilted into the water on broken legs, the span to it fallen, a
  wreck on pad 1. d3: pad 1 garden with shacks and wind turbine, pad 2
  lookout with timber watchtower, rope bridge, fishing huts on the bracing.

## Vessel hook
tmShip (quay face) and tmPass (outside the platform) offer
`portVesselFor(opt,0)` alongside, bow +x, only if `length <= W-12` and the
beam fits (tmShip SEA-10, tmPass 28 m). Most liners will not fit a 110 m
segment, so usually buoys/tenders show instead.

## Weaknesses
- The salvage pass puts shanties on open paving at d=3 (shared behaviour).
- tmHeli pad stairs are straight kit flights round a drum (reads fine at
  distance, a little crude close-up); pads have no hatch where they meet.
- Ruined fallen tubes are hollow boxes/barrels - no torn ends.
- Night at d=3 is sparse on warm light outside the container houses.

## Shared-change requests
- None required. Nice to have: `portSideClose` could accept a z-list of gaps
  so a walkway root (tmHeli) need not rebuild a coping-less wall piece.
