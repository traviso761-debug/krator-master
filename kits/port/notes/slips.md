# Slips: drone carrier, submarine, deep-water berth, submarine pen (prefix `sl`)

Fragments (seed block 20600-20699):

| file | key | kind | seeds |
|---|---|---|---|
| `src/87-sl-a-carrier.js` | `slCarrier` | vessel, 320 m | 20600-20604 |
| `src/87-sl-b-sub.js` | `slSub` | vessel, 150 m | 20610-20614 |
| `src/87-sl-c-berth.js` | `slBerth` | segment 110 x 410, LAND 50 | 20620-20624 |
| `src/87-sl-d-pen.js` | `slPen` | segment 110 x 196, LAND 60 | 20630-20634 |

`87-sl-a` also holds the helpers the other three use (all `sl`-prefixed):
`slSS slUV slPrism slPlan slReg slRope slShack slStairTower slRaft slLattice`,
the kit items `slDrone` `slDome`, materials `MAT.slDrone slLow slLowR slDeck
slDeckR slSub`, the deck texture `TEX.slDeck/slDeckR`. Dev targets:
`targets/slCarrier slSub slBerth slPen`.

## Vessel registrations (extra fields other agents may read)
`slCarrier`: length 320, beam 68 (flight deck), `hullBeam` 40, draft 11,
`deckY` 21.2 (flight deck), `moorY` 10 (fairlead height), `stbd` -39.5 /
`port` 39.5 (x extents of the whole vessel incl. elevators). `slSub`: 150,
beam 13, draft 10, `deckY` 3.5, `moorY` 3.

The anchor pier only takes vessels with beam <= 58, so it skips the carrier
(it does take the sub). Vessel REGISTERs are rotated by the heading by hand
(`slReg`); container houses on vessels are placed with `noReg`, because
`REGISTER` does not know the vessel group's rotation.

## slBerth vessel choice
`slBerthVK(opt)` tries, in order, `opt.vessel`, `opt.vesselKey`, a global
`SL_BERTH_VESSEL` (a target may define it in its 89z-rows.js), then
`slCarrier`; the first that is registered AND fits (length <= 378, the hull
beside the pier face, the whole beam inside x +/-47.5) is used. So `vsGiant`
etc. are taken by name only when they exist; nothing depends on them. The
berth lays mooring lines to the vessel's `hullBeam`/`moorY` (generic
vessels: beam/2, 8 m) and, at d=3, stair towers to `deckY` when given.

## Triangles per decay (showcase)
slBerth 27k / 26k / 65k; slPen 50k / 59k / 120k; slCarrier 27k / 31k / 95k;
slSub 6k / 9k / 12k. All budgets and all invariants pass (showcase 1.84 M
triangles, 214 draw calls at the overview).

## Known weaknesses
- The intact carrier's hull sides are plain white panels (hull windows, a
  cyan line); the flight deck underside reads brown from the ground bounce.
- Carrier and sub are placed rigidly: the ruined list/roll is a group
  rotation, so the ruined carrier's mooring lines (the few left attached)
  end near, not exactly at, the tilted hull.
- The sub in the pen is placed with `{low:true, ledge, ledgeY}` (no lookout
  mast, gangways to the bay ledges instead of rafts); elsewhere it is normal.
- The berth's crane jib at 54 m could clip a very tall third-party vessel.

## Shared-change requests
- `portOptFor` (90-scene.js) builds opt from a fixed field list, so a layout
  item cannot hand a berth its vessel. Please pass `it.vessel` (or a generic
  `it.opt` merged in) through, so `slBerth` can be given `vsGiant` from a
  layout; until then use `SL_BERTH_VESSEL` in a target.
- `REGISTER` ignores `KXF`; a helper that REGISTERs (`portContainerHouse`,
  `portShed`) lands in the wrong place inside a rotated vessel group. A
  `REGISTER` that applies `KXF` to (x,z) would let vessels use them directly.
