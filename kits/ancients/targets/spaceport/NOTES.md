# The Iziz spaceport (kit type `izPort`, target `spaceport`)

Builder `buildIzSpaceport(scene,gx,gz,d)` in `src/8ao-iz-spaceport.js`. Seeds:
`reseed(10460)` at the head (the whole layout draws no `rng()`, so every state
shares one plan), then `reseed(10461+d)` for the decay dressing (10461..10465).

## What the Iziz original was

`settlements/iziz/src/79-iziz-original.js`, `izSpaceport(scene,SP,SPA,y0)`: the
painting's spaceport, out at the end of the city's north-west causeway (bearing
315, r 800, on a 4 m pad of plateau). It only ever existed **ruined**, and it was
a few dozen scaled kit boxes: a three-step octagonal bunker hub (`izOctR`) with a
holed concrete dome, eight dark doorways (which sat inside the hub's own base, so
they never showed), the control tower as one rusted octagon "snapped off at 18 m"
with its top as a second box lying on the hub, six landing pads (slab and ring)
at r 46 that overlapped the hub's base, a fuel farm of six tanks (two toppled), a
perimeter wall of 40 boxes at r 88 with posts, and a wrecked freighter (two
octagon boxes, nose down) with rubble and moss. One seed (7777), no decay
parameter, no interiors, no glass.

## What changed

The same plan, drawn whole first and then brought down, at kit scale (r 120 to
the wall, ~260 m across with the apron):

- **Hub**: plinth (octagonal, battered 37 -> 34 apothem, 7 m) with a base
  course and a cornice; a door on every face with a portal (piers and lintel) and
  a real room behind it (walls, ceiling, floor, counter, lit panel, ceiling
  strips); the great hall on the causeway face, 12 m wide and 16 m deep, with
  columns. Tier 2: a ribbon window band (glass by day, `civShardAt` teeth in a
  ruin) with sill and head bands and a cornice, the offices behind it
  (`civRooms`: strips, cabinets, panels, conduits) against a core wall. The
  drum: portholes (`ovalI` / `civWin('ovalD')`), a strip band, the operations
  room (consoles, lit panels, a central column). The dome, with a finial ring.
- **Control tower** (the tall element): octagonal shaft 52 m, arched slit
  windows (`winSmI` / `civWin('winSmD')`), two moulding bands, a flared glazed
  cab (mullions, consoles, glass by day, shards in a ruin), roof, mast, beacon.
  84 m to the beacon. It stands at bearing 195 so its fall lies across the
  kit's south-west views.
- **Pads**: six at r 70 (Iziz's bearings), each with a blast fence, ring and
  cross markings, edge lights and a lit taxiway. Two shuttles (hull, delta wing,
  fin, nozzles) on pads 2 and 4.
- **Freighter**: on its own berth at bearing 15 (as in Iziz), standing on four
  legs, a bridge with windows, three engines, tail fin and stubs, an open cargo
  hold on its hub side with a ramp, crates and lights inside.
- **Fuel farm**: six tanks (cylinder, dome, two bands), each piped to a header
  that runs to the hub. Moved from bearing 195 to 135 to clear the tower's
  fall line.
- **Cargo yard** (new): 14 containers in two rows at bearing 75, some stacked.
- **Wall** at r 120 with a coping, lamp posts, the gate on the causeway (piers,
  a lit sign beam, the road out and the road in), four floodlight masts.
- **Field**: a paved disc, darker and warmer than the hub (Iziz's plaza grey),
  with a `polygonOffset` because 0.3 m over the ground plane z-fights from
  far off under SwiftShader; an apron to the plain.

## Decay (decay 2 = TOPPLED; reclaimed is decay 4)

| d | state | what it does | tris |
|---|---|---|---|
| 0 | intact | white metal, clean concrete, glass, lit cyan strips, red beacon | 44 668 |
| 1 | ruined | tower snapped at 18 m (floors showing at the break), its top (32 m up, with the cab) lying beyond the plinth; a sector of tier 2 (bearings 83-123) collapsed, a roof slab slid into the gap; the dome caved (a ragged top half gone, plates on the floor); the freighter nose-down with its legs gone and ribs showing; two tanks toppled; a shuttle gone, the other sunk and holed; containers knocked over; 28% of the wall gone; rust, holes, glass teeth, moss, vines from the cornices, trees in the cracked paving | 54 590 |
| 2 | toppled | the whole tower down along bearing ~200 in two pieces (4-30 m, then 31-52 m with the cab), the mast flung on; the dome gone, a wider collapse (57-129) through tier 2 and the drum; the freighter broken in two at the hold, the stern burnt out (`MAT.guts`); four tanks down and one ruptured; a mast down; 42% of the wall gone | 58 454 |
| 3 | rehabilitated | no collapse (`HOLES` .55, `repairPass` from the scene loop) plus its own dressing: beacon and warm lamps, cab panels on, a salvaged shuttle patched on its legs, tent camps on two pads, a timber palisade in the wall gaps, the freighter down on its belly as a workshop with lean-tos, a windsock | 60 254 |
| 4 | reclaimed | the decay-1 ruin lived in (plus the loop's `repairPass`): fires in the plinth rooms, the tier-2 bays, the freighter's hold and the containers; gardens (hedge rows) on three pads, shanty clusters on two, a market along the causeway inside the gate, `acReclaim` on the roofs and walls, three fire lights at night | 67 410 |
| 5 | worn | the scene loop builds decay 0 and runs `wornPass` (white re-skinned, rust streaks, stains) | 46 062 |

All well under the `medium` 250 000 budget (`izPort:'medium'` in `91-probe.js`).
Draw calls: 68-95 over the target's views at 1280x800. Everything opaque is
merged per material by `civFlatten`; glass stays separate (band, cab).

## Target

`targets/spaceport/`: one row, a site per decay along x, ordered from whole to
lived-in: worn -680, intact -340, rehabilitated 0, ruined +340, toppled +680,
reclaimed +1020 (`ROWS.izPort = {z:0, s:340, r:150, t:680, j:1020, w:-680,
ds:[5,0,3,1,2,4]}`). Presets: `All states`; per state a day view and a close
view; night for intact, rehabilitated and reclaimed (and reclaimed close); the
toppled tower; the ruined and intact freighter; the ruin from the north (the
causeway gate and the great hall).

For the kit, lift the row as is (it needs its own `t`, `j` and `w`), or drop 4
and 5 from `ds` if the kit row should show only 0-3.

## Weaknesses

- The intact state is white on pale concrete: low contrast at distance, like
  every intact kit type (the darker paving helps only a little).
- The fallen tower pieces read best from the south-west; end-on, the cab lies
  as a big disc on its rim.
- Pad edge lights in a ruin are dead strips: they read as black dashes.
- `acReclaim`'s side faces include the fuel tanks, so a few fires and patches
  land on tank walls at decay 4.
- The ruined plinth is whole: only the upper tiers, the dome and the tower
  collapse. The plinth rooms are boxes behind the doors (no fit-out beyond a
  counter and a panel).
- Toppled tanks are placed by rule (outward from the slab), not physically
  settled; they can clip the slab edge.
- No ground variation: the field is flat at 0.25 m (the kit has no terrain hook).
