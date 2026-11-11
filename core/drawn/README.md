# core/drawn: the ground as drawn (`KDRAWN`)

CORE-IMPROVEMENTS.md item 28 (the survey of 2026-11-11). Audits that read the ground as defined (`terrainH`) miss what
the eye sees: the triangles drawn between the vertices. A camera above `terrainH` sits under the mesh, 16 m cells
bridge an 11 m channel, a tree stands on a step `terrainH` calls gentle. `KDRAWN.h(x, z)` is the height of the drawn
triangles.

| File | What |
|---|---|
| `10-core-drawn.js` | `KDRAWN.grid` (strip cells: a heightfield drawn as a PlaneGeometry, split a-b-d / b-c-d as three.js splits it), `KDRAWN.mesh` / `fromObject` (any mesh's triangles in world space, bucketed), `KDRAWN.add` / `h` (the page's ground sources, the highest wins), `KDRAWN.compare` (defined against drawn at a list of points). Plain data, no three.js ([G data]) |
| `test-drawn.js` | `node core/drawn/test-drawn.js`: the split against three's PlaneGeometry, the bridged channel, an eye under the drawn ground; each with its negative (`tools/ktest.js`) |

**Who takes it.** No page lists it yet, so no page moved. Today the verify harness reads it: a build listed under
`drawn-ground` in `tools/checks_optin.json` (or a verify.py passing `checks=harness.SURVEY`) gets the eye check against
the drawn ground, from the page's own `KDRAWN` sources when it registers them (`KDRAWN.add(KDRAWN.grid({...}))` beside
its ground), else from its meshes named `ground` / `terrain` or marked `userData.ground`. The in-page audits (the water
audit, the cliff gate, the attach audit) take it at the next all-builds rebuild (TODO.md, "Ride along").

A build that takes it lists `core/drawn/10-core-drawn.js` after core/rand and before its ground, and registers the grid
it drew the ground from: then every audit measures what is on the screen.
