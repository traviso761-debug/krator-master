# KSEAT: the surface as drawn

`core/terrain/38a-core-seat.js` (`[G data]`, `node core/terrain/test-seat.js`) and its probe half,
`core/host/95b-host-seat.js` (`node core/host/test-seat-probe.js`). CORE-IMPROVEMENTS.md items 1, 6 and 20.

**The problem it ends.** A placer reads the surface the code computes (`terrainH`, `KSTACKS.topAt`, `footR`, a record's
radius), while the page draws a different one: a ground of 10 to 44 m cells, a KSTACKS wall of at most 160 segments
standing up to 12 m inside its outline, a weathered or contoured body, a carve. Things then float, sink, stand inside rock,
or block a door, and until now the owner found them by eye, in about 17 biomes and 30 kits and settlements. KSEAT reads
the triangles the page draws, and its sweeps measure every placed foot, door and stair against them.

The full API is in the fragment's header. In short:

| Call | What |
|---|---|
| `KSEAT.tris(pos, idx, {matrix, id, cls})` | a surface from a drawn mesh's arrays (a BufferGeometry's position and index, its `matrixWorld.elements`) |
| `KSEAT.grid(h, box, cell, {diag})` | the ground as a displaced grid draws it: `h` sampled at the vertices only, the triangles between them as `PlaneGeometry` splits them |
| `KSEAT.stacks(list, opt, post)` | KSTACKS bodies as drawn: `KSTACKS.mesh(B, opt)` with the page's own `opt`, `post(B, m)` its contour or weather |
| `KSEAT.lazy(items)` | many meshes, each bucketed the first time a ray reaches it (the probe's scene) |
| `KSEAT.down / ray / under / gap` | the first face down, along a ray (with `back`: met from inside), how deep a point is in, the level gap to a wall |
| `KSEAT.seat(S, foot)` | `{y, n, tilt, spread, ...}`: a footprint seated on the lowest of its samples, its plane fitted |
| `KSEAT.contact / contactSweep` | a placed foot: `ok`, `float`, `buried`, `inside`, `off`; the sweep with its negative control |
| `KSEAT.clearSweep` | boxes of different classes that overlap (a house over a street, a tree in a house); KSPACE broad phase |
| `KSEAT.doorSweep / stairSweep` | nine rays in through each door; each stair's head and foot on a floor and its flight out of the walls |

Faces must wind CCW from outside, which is the drawn convention (back faces are culled). "Inside" is read from the side
of the first face a ray meets, the way Pinnacle Rock's `ROCKRAY.inRock` does.

## Adopting it

A build adopts it at its own turn. Nothing moves until it lists the fragments.

1. **Take the fragments.** Add `'38a-core-seat.js'` to `CORE_TERRAIN` (after `36-core-carve.js` and `37-core-stacks.js`,
   which it wraps for their probe points). Then resolve the probe half beside the shell:
   `khost.resolve(PATH, khost.SEAT)`, or add `'95b-host-seat.js'` to the build's host list. It loads after `95-host-probe.js`.
2. **Place on the drawn surface.** Wherever a placer calls `terrainH(x, z)` (or `KSTACKS.topAt`) for a foot, build the
   surface once from what the page draws and seat on it:
   ```js
   const DRAWN = [KSEAT.grid(terrainH, [x0, z0, x1, z1], CELL, {id: 'ground'}),   // the ground mesh's own box and cell
                  ...KSEAT.stacks(ROCK, {step: 6}, (B, m) => KSTACKS.weather(B, m, {ground: terrainH}))];
   const s = KSEAT.seat(DRAWN, {x, z, r: 1.2});          // the lowest of the footprint; s.n to tilt by
   rec.at = [x, s.y, z]; rec.foot = {r: 1.2, tol: .3};   // the record carries its foot: the sweep checks it
   ```
   When the page draws the ground from its own arrays (a merged mesh, insets, a contoured body), pass those arrays:
   `KSEAT.tris(geo.attributes.position.array, geo.index.array, {id: 'ground'})`. Never hand KSEAT `terrainH` sampled
   finer than the page draws it: the point is to read the drawn cells.
3. **Mark the drawn surfaces.** Set `userData.seat = 'ground'` (or `'rock'`) on the meshes things stand on. Set
   `userData.door = true` on a door's own leaf, and `userData.solid = true` on an instanced mesh that should block a door
   (flora cards do not). Hand doors and stairs through `KHOST.take({seat: {doors: () => [...], stairs: () => [...]}})`
   when they are not core/tags records of kind `door` (records carrying `head` and `foot` are stairs).
4. **Assert in verify.** `_api.seatSweeps()` returns all four sweeps. Assert `contact.nFails === 0 && contact.neg === true`
   (the negative control: a passing record lifted 2 m must read as floating), and `doors.nFails`, `stairs.nFails`,
   `clear.nFails` at zero, or at a recorded number that the build ratchets down. The `core-verify` session wires these into
   `harness.verify_page`.
5. **Delete the local check** that the sweep replaces (Yuni's box tests, `ANCHOR_AUDIT`, `sails-clear-cabins`, a
   `ROCKRAY`, a scratchpad float probe), and the hand-made pick discs and probe points a drawer now supplies (below).

Worked example: swlowlands (`biomes/swlowlands/src/99-host-take.js`). A mesh that shares its item between the ground and things
that hold it (a palm's crown, a limb) needs those pieces left out of the feet and counted, and a tall merged shell with many floors
may cost too many rays to be a seat surface: the sweep counts every face `under` walks through.

## The drawers' probe points (item 6)

With the fragment loaded, `KSTACKS.mesh(B, opt)` returns `m.probe` (a flat `[x, y, z]` half way up the body's middle bed;
`KSTACKS.hash` reads only `pos` and `idx`, so no mesh hash moves). A page that merges bodies into one mesh sets
`mesh.userData.probePoints = KSEAT.points(meshes)`. `KCARVE.mesh` sets `userData.probePoints` on each patch mesh itself
(the mouth, half way up the void). Both are flat arrays, the form `95-host-probe.js` reads (Span lesson 10). core/biome's
drawers (BIO's bucket, the flatten helpers) are core-biome's to add.

## What it found on the way

- **A ringed KSTACKS top had a hole at its centre** (closed 2026-11-08). `KSTACKS.mesh` drew a top as rings from the edge in
  to `.08` of the radius (`rhos` in `37-core-stacks.js`) and never closed the last ring, so a ray down at a mesa's centre fell
  through to the ground (about 13 m across on a 160 m mesa). A centre fan (`fan`) now closes every ringed top, a chimney's
  solid top too; `test-seat.js` checks the ray meets the rock.
- **A body's hidden bed tops are drawn inside it.** `under` walks up through every face met from behind, so a point's
  depth is measured to where it comes out, not to the first buried bed top.
