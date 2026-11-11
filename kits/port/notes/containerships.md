# Container ships (agent 5): vsFeeder, vsPanamax, vsGiant

Files: `src/86-vs-a-feeder.js` (the shared container-ship kit, plus vsFeeder),
`src/86-vs-b-panamax.js`, `src/86-vs-c-giant.js`; dev targets
`targets/vsFeeder|vsPanamax|vsGiant/` (segment-target copies with PORT_ONLY
set, plus close/shore/deck/stern/night views per decay; the giant target also
has 'Ruined break' views). Seeds: feeder 20500+d, Panamax 20510+d, giant
20520+d (20500-20524). Every top-level name has the `vs`/`VS` prefix.

| key | L x B x T | d=0 | d=1 | d=3 |
|---|---|---|---|---|
| vsFeeder | 140 x 22 x 7.5 | 12.2k | 18.1k | 51.8k |
| vsPanamax | 260 x 32 x 12 | 23.9k | 31.9k | 63.5k |
| vsGiant | 368 x 58 x 15 | 67.2k | 75.5k | 138.7k |

(Triangles per decay, budget 250k.) All three dev targets and the showcase
pass `verify.py --assert`.

## How it is built
* Hull lines are generated from station functions (`vsLines`): deck and bilge
  half-breadths, keel line, a forecastle sheer, and sections from a round-bilge
  box amidships to a flared V at the ends. The shell is cut into bands by
  height (antifouling, coloured boot-top, topside), so the boot-top follows
  the real waterline. There is a transom, a forecastle bulwark and breakwater,
  rails, anchors and bollards.
* Everything is placed in the hull frame and handed to PART groups (`vsCtx`).
  A part's matrix = heading x (sink, pitch, roll, split offset), and it is
  installed as KXF, so kput items follow the meshes. There is also a WATER
  frame (heading only) for spilled containers, skiffs and pontoons. `C.reg`
  applies the part matrix before calling REGISTER.
* The house is a white tower of rounded (superellipse) storeys stepping back
  in terraces at the front, with ribbon windows and a full-beam bridge.
* `vsShore` casts along the hull frame's x against `terrainH`. A quay within
  28 m gets a gangway. Otherwise the ship gets hull stairs, a floating walk
  and a flight up the quay wall. The pontoon and moored skiffs go on the sea
  side. This works at any heading: +x in the dev target, 0 in the pier slip.

## Decays
* 0: white or grey panelled hull, red, blue or teal boot-top, clean colourful
  stacks, CYAN lit bridge, nav lights. The feeder has two deck cranes. The
  giant is twin-island: the bridge forward of midship, the casing and twin
  funnels aft.
* 1: rust, a list and settled draft, holes in the shell (unlit black
  `MAT.vsVoid` behind them), whole bays toppled, low-side columns spilled into
  the sea, rust streaks, vines, moss and trees. On the feeder a crane jib is
  down. **The giant is broken in two**: the halves slope down into a sunk
  break, twisted against each other and 7 m apart, with torn plating at the
  break.
* 3, each ship with its own character:
  * **Feeder, the market ship.** Stalls in aisles under sawtooth awnings. The
    cranes are raised and kept as structure: ropes to the awnings, a shack on
    each cab, a house hung from one jib. Two-storey container shopfronts line
    the rails with an upper walk. Shacks climb the aft house, with a roof
    village and garden. There is a forecastle garden, a floating market of
    skiffs and a poop-deck cafe.
  * **Panamax, the terraced garden ship.** Stacks step down in terraces from
    the house to the bow. Each terrace is crops, an orchard or greenhouses,
    with hedges and greenery spilling over the edge. Homes are cut into the
    terrace fronts and outboard faces, with stairs up the centreline. The two
    bow holds are filled with earth and planted as orchards. There are
    windmills and rain tanks, hanging gardens on the house, and vine curtains
    down the hull.
  * **Giant, the dense stack town.** A container mountain with two peaks,
    terraced down to both rails. Buried containers are culled, and exposed
    faces get windows, balconies, awnings and washing. Roofs carry shacks,
    gardens, trees, solar panels and tanks. Shack towers stand on the peaks,
    linked by rope bridges. A steel truss bridge runs from the bridge house
    over a canyon to the fore peak. The forecastle crane is kept, with houses
    on it. The bridge house, funnels and poop deck are built over.
  * **All three:** a patched and painted hull, tyre fenders, stairs down to a
    pontoon, skiffs, a way ashore, and warm windows with FIREKIT glows at
    night.

## Weaknesses
* The giant's reclaimed stacks are still a little candy-coloured and regular
  close up. The break in the ruined giant reads best from the 'Ruined break'
  views and is subtler from far away.
* The ruined feeder and Panamax differ from intact mainly by list, rust and
  collapse. Their silhouettes are less changed than the giant's.
* The feeder's and Panamax's ruined holes are small (low freeboard).
* The giant is 368 m, not 380 m, so the pier's slip accepts it: the pier
  tests `length <= 370`.

## Shared-change requests
1. `81-pp-pier.js`: when a vessel is placed in the slip, skip the d=1 barge
   hulk at (80,70). It sits inside a moored hull. At d=3, keep the 14 random
   slip skiffs out of the vessel's footprint (x 72 +/- beam/2 + 4, z 24 ..
   24+length). Both are currently hidden inside or under my hulls, but a
   narrower ship would show them.
2. Optional: the pier's 370 m limit could become 380 m if the lead wants the
   giant at the full ~380 m. SEA 420 still leaves room (24 + 380 = 404 < 412).
3. REGISTER does not know group rotation. Vessel builders must transform
   positions themselves (as `C.reg` does). This is worth a line in API.md
   "Vessels".
