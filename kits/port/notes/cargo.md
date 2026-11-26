# Cargo (prefix `cg`, seeds 20200-20299) — hand-back notes

## Files and keys

| file | registers | seed | W x LAND x SEA |
|---|---|---|---|
| `src/83-cg-crane.js` | `cgCrane` (container cranes) + the shared cg kit and helpers | 20220+d | 110 x 70 x 80 |
| `src/83-cg-box.js` | `cgBox` (container dock) | 20210+d | 110 x 110 x 50 |
| `src/83-cg-store.js` | `cgStore` (warehouses and storage) | 20200+d | 110 x 110 x 40 |

Dev targets: `targets/cgCrane`, `targets/cgBox`, `targets/cgStore` (segment
copies with extra close views: `<Decay> profile / close / top / from the land`,
`Crane village`), `targets/cgEdges` (edges copy, PORT_ONLY cgStore).
Seeds used: 20200-20204, 20210-20214, 20220-20224. 20230-20299 free.

## Helpers other agents may call (all LOCAL coordinates of the builder group G)

### `cgGantryCrane(G, x, z, d, o) -> info`
Ship-to-shore container gantry crane. `(x,z)` = centre of the WATERSIDE rail;
the boom points to +z at yaw 0. Crane frame: X along the rails, Z toward the
boom, Y up from `o.y`. About 3.5 k triangles, ~6 meshes (batched per material).

| o | default | |
|---|---|---|
| `y` | `PORT.DECK` | deck the bogies stand on |
| `yaw` | 0 | turn about y (boom toward +z at 0) |
| `gauge` | 30 | rail gauge; landside rail at Z = -gauge |
| `span` | 17 | leg spacing along the rail (bogies reach span/2 + 4.5) |
| `portal` | 40 | portal beam height |
| `out` / `back` | 50 / 18 | outreach from the waterside rail / backreach behind the landside rail |
| `raise` | 0 | boom 0 down .. 1 parked up (~77 deg) |
| `lean` | 0 | tip about the waterside rail, + = seaward (.95 pitches it into the harbour) |
| `roll` | 0 | tip about Z |
| `broken` | false | landside legs torn off (hang short from the portal) |
| `snapped` | false | boom broken at the hinge, lying from the quay edge into the water |
| `trolley` | .35 | trolley position 0..1 along the boom (parked when raised/snapped) |
| `hoistY` | Hb/2 | spreader height in the crane frame |
| `load` | true | a 40' box under the spreader |
| `lit` | d!==1 | floods under the boom + aviation light |
| `name`, `noReg` | 'Container crane' | REGISTER name; noReg skips it |

Materials: d=0 `MAT.white` + `MAT.cgBlue` trim + cyan light lines; d>0 `MAT.rust`.
Returns `{H, Bm, S, gauge, Hp, Hb, gd, gw, top, apex, Zb, Zh, Lb, M, MB, boomTip}`:
`H` crane group (child of G), `Bm` boom group (child of H), `M`/`MB` their
frames relative to G. To place kit items in the crane's frame:
`cgXF(info.H, G); ...kput/portContainerHouse(...,{noReg:true})...; endGroupXF();`
and `pbAdd(geo, mat, info.H)` for batched geometry (see `cgCraneVillage`).
Footprint: x ± (span/2 + 4.5), z from -(gauge+back) to +out; ~ 76 m tall
(apex), ~ 105 m with the boom raised.

### `cgContainerTower(G, x, y, z, yaw, d, o) -> {h, top}`
The reclaimed stacked-container tower of the references (sheets 3/4): steel
posts, a plank floor per level, a 40' (sometimes 20') box per level set askew,
a 20' crosswise or planters, balconies with rails, an outside zig-zag stair,
lit windows/doors, washing lines, and a top piece.
`o = {levels 3-6, lit .5, top: 'mast'|'dish'|'solar'|'turbine', noReg}`.
Footprint ~14 x 8.6 m (long along yaw's x); ~2.95 m per level. Kit only, so
it works inside `cgXF`.

### `cgBarge(G, x, z, L, B, d, o) -> {Bg}`
A small feeder barge (length L along x, beam B), midship on the waterline,
bow +x at yaw 0. `o = {draft 4, free 3, yaw, sunk (d===1), houses (d>=3), bulk}`.
d=0 containers in bays (or hatch covers with `bulk`); sunk: settled by the
stern, listing, onto the berth; houses: container houses, garden, washing.
Not a registered vessel — a berth fallback when no registered vessel fits.

### Small utilities (83-cg-crane.js)
`cgBarGeo(a,b,w,dp)` / `cgBar(P,mat,a,b,w,dp)` a box between two points (note:
for a bar running mostly along x, `w` ends up vertical — pass the cross-section
accordingly); `cgBx(P,mat,x,y,z,w,h,dp,yaw)`; `cgMatOf(obj,G)` / `cgXF(obj,G)` /
`cgPt(M,p)` nested-group frames for kput (useGroupXF only handles one level);
`cgUV(g,s)` scale Extrude UVs to the kit's 8 m tile; `cgTube(r,H,seg)`.
Kit: `cgBogie cgRail cgMast cgMastGlow cgLattice cgSphere cgTurbine cgTractor
cgTyres cgStraddle cgStraddleW`; `cgStraddle(x,y,z,yaw,d,o)` places a
straddle carrier. Materials: `MAT.cgBlue cgHull cgDeck cgGrate`.

## The segments

* **cgCrane** — three STS cranes on 30 m-gauge rails, feeder barge in the berth.
  d0: one hoisting over the barge, one parked boom-up, one over the lanes;
  d1: west crane pitched forward into the harbour (landside legs torn, stumps
  on the rail), middle boom snapped into the water, east boom stuck half-up,
  barge sunk, silted berth + sand bar; d3: vertical village in the west
  crane's portal (4 platforms, container houses, stair, turbine on the apex),
  snapped boom as a plank walkway to the boats, houses on the east crane's
  girders, rope bridge between portals, two container towers, house barge.
* **cgBox** — straddle yard (2 x 9 single rows, 3 slots, 1-3 high), 6
  straddle carriers, reefer block with a 3-tier rack and plug lights, gate
  canopy over 4 lanes with booths/barriers, a terraced drum office, yard
  masts. d1: stacks toppled into the lanes, a row slumped, a carrier on its
  side and one leaning, boxes in the berth, canopy end down; d3: container
  towers (8 and 6 levels) in place of rows, rows cut with doors/windows,
  houses on the carriers, rack as stair-street, market under the canopy.
* **cgStore** — sawtooth warehouse (north lights to the land), wave-shell
  loading canopy to the quay, 4-vault hall, 6 silos + head gallery +
  elevator tower, 2 domed tanks, conveyor gallery on trestles to a ship
  loader over a bulk barge. d1: teeth fallen in, a vault collapsed, silo
  broken, gallery split, conveyor span down, loader boom drooping, 2 canopy
  bays down; d3: markets in both halls and under the canopy, silo houses,
  houses/solar on the head gallery, tank house, lit conveyor bridge.

Triangles per decay (dev target / showcase): cgCrane 19 k / 18 k / 47 k;
cgBox 17-27 k / 17-34 k / 41-54 k (more at a run end: land revetment);
cgStore 14 k / 22 k / 55 k. Draw calls per segment 6-24 meshes.
All volumes non-empty, clearance clean, showcase passes (1.58 M tris, 245 calls
with quay/pier/quay110 and the three cg segments).

## Weaknesses

* Under the suggested 60-150 k aim: cheap by design (big members are merged
  boxes); room left for more detail (lattice booms, walkway grating, cables).
* The fallen crane pivots rigidly about the waterside rail: the boom tip ends
  just under the silted seabed at d=1 (it reads as "buried in silt").
* At d=3 the shared salvage pass sticks patch sheets onto thin crane members,
  where they read as floating boards from close up.
* The sawtooth glazing faces the land, so from the sea the warehouse reads as
  a plain white box; its character shows from the land side and above.
* Crane rails run edge to edge and do not match the neighbours' rails.

## Shared-change requests

1. `portContainerHouse` REGISTERs at the raw (x,z) it was given, which is
   wrong inside a nested/rotated frame (a crane, a barge). I pass `noReg` and
   register myself; it could transform through KXF like kput does.
2. r128 `BufferGeometry` has no `applyQuaternion` (use `applyMatrix4`) — worth
   a line in API.md's pitfalls.
3. `portViewsSegment`'s 'Eye level' camera stands at a fixed spot (W*0.32
   west of centre, z = -10): a segment that puts a prop there gets a camera
   inside it. A note in API.md, or a clearance search, would help.
4. `portSideClose` does nothing where a deeper segment (LAND 110) meets a
   shallower flush/offset neighbour (LAND 60): the back part of the side meets
   natural ground softened by the stamp ring. Acceptable, but a short
   retaining wall/revetment there would finish it.
5. `useGroupXF` handles one group level only; a nested-frame version like
   `cgXF` might belong in the shared kit.
