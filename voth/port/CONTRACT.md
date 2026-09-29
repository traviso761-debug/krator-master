# Krator Ancient Port — project contract (every port agent reads this)

> **Changed by the foundation round (see API.md for the full contract as built):**
> 1. The builder must be a **top-level `function build...(scene,gx,gz,d,opt)`**
>    opening with `reseed(N+d)`, passed as `build:` - not a method inside the
>    registration object as in the example below. build.py's seed check cannot
>    see inside a method, so it rejects a registering fragment without one.
> 2. **Stamp order is defined, not irrelevant**: soft rings in stamp order, then
>    hard shapes in order with the later stamp winning, and points on a shape
>    edge take the lowest nearby height (cliffs fall inside the wall on the high
>    side). Added kinds/fields: `ramp` (ya->yb along an axis), `paint`, `dry`.
> 3. Hard stamp shapes must lie inside the segment's own footprint (checked).
> 4. Vessel frame fixed: origin midship on the waterline, bow +z at heading 0.


A spin-off of the Krator Ancients kit (`voth/ancients/`): a set of modular
**port segments** and **vessels** for an Ancient port, meant to tile along a
coast and, later, to be folded into a seaside arcology. It lives in
`voth/port/`, a sibling of `voth/ancients/`, built the same way (src/
fragments concatenated in filename order into one page, per-target
`89z-rows.js` / `91z-views.js`, `build.py`, `jscheck.py`, `verify.py`).

## Axes and levels (the user's words mapped onto the kit's axes)
The user said "tile along X, vary back/forward in Y, one flat surface in Z".
The kit is y-up, so in code:
- **x** runs ALONG the coast. Segments tile side by side along x.
- **z** is the land/sea axis: **-z is LAND** (or the larger structure), **+z is
  OCEAN**. A segment may be set back or forward along z (the "variation").
- **y** is up. **Sea level is y = 0.** Every segment's deck (quay top) is at
  **y = PORT.DECK = 6** (6 m freeboard), so tiled decks form one continuous
  flat surface.

## Segment frame and footprint
- Local origin = centre of the segment's **quay line** (its land/water line),
  at sea level: x in [-W/2, W/2], land apron z in [-LAND, 0], sea-side
  structure z in [0, +SEA].
- **W = 220 m** for every segment (Skyscraper A's plinth diameter, 2 x 110),
  so any segment tiles with any other. A segment may be narrower in its
  structures but its footprint is 220 wide.
- **SEA <= 420 m** (Skyscraper A is 420 m tall; the largest pier is 220 x 420).
  **LAND <= 120 m.**
- **Clearance on all four sides:** buildings, cranes, ships and props stay at
  least **8 m** inside the x edges and the z extremes. Decks, quay walls and
  paving may run to the edge (that is what makes the surface continuous).
- **Edges.** -z faces land (or the arcology). +z faces open sea. The +/-x
  sides must look finished whether the neighbour is land, sea, or another
  segment (flush, or offset back/forward). Every builder receives
  `opt.nb = {W:{kind:'seg'|'land'|'sea', dz}, E:{...}}` (dz = the neighbour's z
  offset minus this one's) and should close its sides accordingly: a finished
  quay wall with fenders/coping where it faces water, a revetment or
  retaining wall where it faces land, nothing extra where a flush neighbour
  continues the deck, and a finished step where offsets differ.

## Terrain: declarative stamps, applied BEFORE any builder runs
The world has a natural coastline: land at -z rising gently inland, a beach,
and a seabed falling to about -30 m offshore. A segment reshapes it
declaratively, so ground contact is always right and order never matters:
```js
PORT_SEG({key:'pier', name:'Great pier', cls:'seg', W:220, LAND:80, SEA:420,
  decays:[0,1,3],
  stamps(o){ return [
    {kind:'flat', x0:-110,z0:-80,x1:110,z1:0, y:PORT.DECK, soft:40},   // level the land apron
    {kind:'dig',  x0:-110,z0:0,  x1:110,z1:420, y:-18,  soft:30},      // scoop water to -18
  ];},
  build(scene,gx,gz,d,opt){ ... return G; }});
```
- `stamps(opt)` returns rects (or polygons `{kind,poly:[[x,z],...],y,soft}`)
  in LOCAL coordinates. `flat` sets the ground to y (land at deck level);
  `dig` lowers ground to y where it is higher (basins, slips, berths, drydock
  pits); `fill` raises ground to y where it is lower (reclaimed land, pier
  moles). `soft` is the falloff distance in metres back to the natural
  terrain.
- The scene collects every placed segment's stamps, builds the height field,
  and only then calls the builders. `terrainH(x,z)` (the kit's existing
  ground hook, in 10-core.js) returns the final stamped height, so `trees()`,
  `apron()`, rubble and fallen pieces all land on the real ground.
- Water is one plane at y = 0, drawn after terrain; shallow seabed may show
  through near the shore.

## Decay levels
- Segments: **0 intact, 1 ruined, 3 reclaimed** (the kit's level 3: HOLES =
  0.55 and the shared `repairPass()` salvage dressing run automatically, but a
  segment may add its own reclaimed dressing on top: container-stack houses,
  silo houses, stilt shacks, solar panels, dishes, washing lines, gardens).
- Vessels: **0 intact, 1 ruined, 3 reclaimed / built over.** Reclaimed vessels
  are INHABITED: a town piled on the hull (see the `boat` references). Vessels
  do their own d=3 dressing and set `norepair:true` in their registration so
  the generic pass does not double it.

## Registration (no shared file edits, ever)
Each segment or vessel fragment calls `PORT_SEG({...})` at top level (vessels
call `PORT_VESSEL({...})`). Required: `key` (unique, prefixed), `name`,
`cls` ('seg' <= 200 000 triangles per decay, 'vessel' <= 250 000, 'small'
<= 60 000), `W`, `LAND`, `SEA`, `decays`, `stamps`, `build`. Vessels also
give `length`, `beam`, `draft`. The probe reads `cls` from the registry, and
the showcase targets lay out whatever is registered, sorted by key. So a new
fragment appears in the showcase without touching anything shared.

`build(scene,gx,gz,d,opt)` follows the kit's builder contract (API.md): open
with `reseed(N+d)` from your assigned seed block, set KOFF, REGISTER named
volumes, use `mesh()`/`kput()`/`meshMerged()`, reset KOFF, return the group.
Vessel builders take `opt.heading` (0 = bow toward +z, out to sea) and are
placed by slip/berth segments or the showcase, floating at their draft.

## Style
Ancient Krator (see voth/ancients/API.md "House style"): intact is white
panelled metal, pale board-formed concrete, blue glass, curved terraced white
marine forms (references: the white terraced floating cities); ruined is rust,
stripped, holed, silted, moss and vines, hulks aground; reclaimed is salvage
architecture: stacked shipping containers as houses, silo houses, stilt
shacks, rope bridges, awnings and market stalls, solar panels, dishes, masts,
gardens, small boats moored alongside. People for scale everywhere.
ORIGINAL FORMS: take the references' language, never copy a specific image.

References: `voth/port/refs/` (sheet_0..4.jpg contact sheets of all 61 images, and the four
`boat*` images, which govern the inhabited vessels). Full-size originals of
everything are in
/tmp/claude-0/-home-user-krator-master/a8de3ff0-d703-58a9-8390-7f3f9b374dbd/scratchpad/port-refs/
(index.txt maps sheet numbers to files).

## Toolchain
Same as ancients: `python3 build.py [--target X]`, `python3 jscheck.py
.syntax-X.js` every build, `python3 verify.py dist/X.html --assert --views
"A,B" --out shots/X`. python + playwright are installed; do not
`playwright install`. SwiftShader flakes ~1 in 7: re-run before reverting.
Background long runs; <= 16 views per run. READ THE SHOTS every round: no
invariant sees a floating deck, a camera inside a wall, or a ship hull
sticking through a quay.

## Commit as you go
The usage limit has killed agents mid-task four times. Commit your files in
your worktree after each verified milestone and keep your NOTES current.
