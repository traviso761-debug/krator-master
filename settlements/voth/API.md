# Voth — generator API

Everything in `src/` shares one scope (the fragments are concatenated inside a
single `BUILD()`), so every name below is a global. That is convenient and
dangerous in equal measure: a subagent that does not know a function exists
will write a second, subtly different one. **This file is the contract.** If
something is not here, ask the planner rather than inventing it.

Files that share a numeric prefix (`78a-life-core.js` … `78j-life-arena.js`)
are one fragment split into parts: one `reseed(N)` stream, one unit for
`build.py`'s rules. Comments that cite an old whole-file name such as
`78-life.js` or `65-facade.js` mean that group. `INDEX.md` lists every part.

Coordinates are world units. `y = 0` is the lake surface (`SEA`). `x` runs
east, `z` runs south. Terrain extent is ±5400; the city box is ±2400.

---

## 1. Fields — the geometric contract

Every placement pass is clipped against these. They are pure functions of
position and may be called freely.

| Signature | Returns |
|---|---|
| `terrainH(x, z)` | ground height. Below `SEA` means lake bed. |
| `landDist(x, z)` | signed distance to the waterline: `> 0` inland, `< 0` under water. **Answers against the traced shoreline only — it cannot see a canton.** Cantons are platforms over open water, so `terrainH` beneath one reads as lake bed and this reads as far out to sea. Asking it "is there anything to stand on here" near a canton gives a confident wrong answer; test the canton's own cap square (`c.r*1.07`) too. Three fishing piers were built freestanding in open water on the strength of this. |
| `waterSDF(x, z)` | the raw water shape before the noise wash. Prefer `landDist`. |
| `riverHalf(x, z)` | half-width of the river **waterline**, not the channel centre. Confusing the two put the river docks under water in pass 2. |
| `inRiver(x, z, margin)` | `true` inside the carved channel. **Every coastal feature must be clipped against this** — roads, revetments, quays, chinampas. The mouth blockage in passes 2–3 was one unclipped revetment loop. |
| `zoneAt(x, z)` | `core \| warren \| estate \| manor \| farm \| shorehut \| orchard \| none` |
| `farmFade(x, z)` | 0–1, how thoroughly farmland has taken over |
| `insideWall(x, z)` / `wallDepth(x, z)` | inside the curtain wall / depth between waterfront and wall |
| `maskAt(x, z)` / `openAt(x, z)` | the ground mask: `openAt` is true on road, plaza and other reserved ground. **The mask is painted black beyond `CITY_LIM`, so `openAt` is false out there by construction** — gating placement on it in the wilderness places nothing and looks like a siting failure rather than a tooling one. |

**The river is carved into the terrain only, never into the water SDF.** This
is deliberate and is the single most load-bearing decision in the build. Do not
"fix" a river problem by editing `WATER`.

## 2. The shore, addressed by arc length

The shoreline is traced once (`15-shore.js`) into `SHORE`, total length `SLEN`
(~20,400). Every layout constant in `30-layout.js` is an arc length `s` along
that loop. This is how the city knows what is where.

| Signature | Returns |
|---|---|
| `shoreAt(s)` | `[x, z]` on the waterline |
| `shoreNorm(s)` | `[nx, nz]` outward normal |
| `shoreIn(s, inset)` | `[x, z]` inset units inland (negative = out into the water) |
| `shoreS(x, z)` | nearest arc length to a point (round-trips to within ~12) |
| `shoreRY(s)` | rotation that squares a building to the shore at `s` |
| `bayS(theta)` | arc length at a bearing out of the bay centre — the "clock positions" |

Named positions: `S_5`, `S_7`, `S_10` (clock), `CITY_S0`, `CITY_S1`,
`WALL_S0`, `PORT_S`, `HARB_S0`, `HARB_S1`, `HARB_S`.

## 3. Emitting geometry

Never create meshes directly. Push into buckets and let `emitBuckets()` fold
them into one `InstancedMesh` per (shape, family) pair. One stray `new
THREE.Mesh` is one extra draw call.

```
BOX (x,y,z, w,h,d, ry, colour, family)    // y is the BASE, not the centre
FR8 / FR6 / FR3 (…)                       // battered / tapered / spire frustums
DOME(x,y,z, r,h, ry, colour, family)
CYL (…)  CONE(…)  STK(…)  BLOB(…)
```

Families: `stone plaster roof wood dome leaf trunk fungus metal cloth`. The
family picks the material bucket, so **adding a family adds a draw call**.

`cloth` (any shape) sways in the wind — a shared clock (`CLOTH_TIME` in
`45-kit.js`, advanced once per frame in `80-camera.js`) drives a vertex
displacement that anchors a `BOX`'s local `y=1` (its top) and swings `y=0`
(its base) most. So build a hanging thing — a banner, a sail — as a `BOX`
whose `y` argument (the base) is the FREE edge and whose height reaches up to
the edge that's actually fixed (a crossbar, a yard): the sway comes for free,
no extra call needed. Every `cloth` instance gets its own phase (hashed from
its world position) so a row of them doesn't flap in lockstep. Ships already
use it (`60-land.js`, `SHIPS.forEach`) as the worked example.

Helpers: `structure(x, yb, z, w, d, h, ry, kind, col, opt)` builds a whole
Hlaalu/Velothi/hovel/tower form. `shade(hex, f)` lightens or darkens.
`loc(x, z, lx, lz, ry)` converts a local offset into world coordinates.
`reserve(x, z, fx, fz, ry)` claims a footprint; `claim(...)`, `gridHit(...)`,
`footing(...)`, `faceStreet(...)` are the placement primitives in `60-land.js`.

**Reserve before you build.** Every overlap bug in this project came from
placing something after the building pass without a reservation.

## 4. Randomness

`rnd() rr(a,b) ri(a,b) pick(arr) chance(p)` all draw from one global LCG.
`reseed(n)` restarts it.

**Every generative fragment opens with `reseed(N)` and `build.py` fails the
build if it does not.** This is what makes parallel work safe: without it, two
extra `rnd()` calls in one fragment shift every tree, hut and farmstead
generated after it, and the diff looks like you broke something you never
touched. Seeds must be unique across fragments — the build checks that too.

Noise: `vn(x,z)` value noise, `fbm(x,z)`, `sig(x,z,f)` roughly −1…1.
Maths: `clamp smooth mix smin segDist polyDist polyNear cumLen segCross`.

## 5. Colour — read only

All colour lives in `src/05-palette.js` as `PAL`. The aliases `TONES`,
`TONES_POOR`, `ROOFS`, `DOMEC`, `MUDC`, `CROPC`, `REEDC`, `WILLOWC`, `LEAFC`,
`FUNGC`, `STALKC`, `TRUNKC`, `FRUITC`, `ROADCOL`, `FIELDC` all point into it.

`build.py` rejects any colour array declared outside the palette. A local
palette is how five separately-reasonable agents end up with five
separately-reasonable greys that do not sit together.

`FAMMAT` (also in the palette) is the texturing pass's table: one entry per
family, with a `tex` slot and a world-unit tiling `scale`. **The texturing
subagent owns `FAMMAT` and `47-texture.js`, and nothing else.**

`src/47-texture.js` fills those slots with procedural grayscale canvases
(ashlar, plaster, tile courses, planks, bark, canopy, fungus blotch, brushed
metal). Grayscale is the rule, not a convention: the per-instance colour from
`PAL` does all the tinting, so a texture changes surface and never hue.

`worldUV(mat, scale)` in `45-kit.js` is what makes them tile in world units.
Instance UVs are unit-space, so without it every building wears the same
texture stretched to its own size and a warehouse reads as a cottage. The hook
recovers the instance scale from `instanceMatrix` in the vertex shader and
picks which pair of extents to use from the face normal. It sets
`customProgramCacheKey`, because r128 caches one program per material.

## 6. Budget

`BUDGET` in the palette. Current standing (2026-09-20):

| | current | ceiling |
|---|---|---|
| draw calls | 73 | 84 |
| triangles | 4,265,206 | 5,200,000 |
| instances | 117,849 | 130,000 |

Every ceiling has been raised by the owner, each time on an explicit ask; the
reasoning is kept in the comments beside each one in `05-palette.js`. The last
raise (72 → 84) was scoped to the Krator sky's background scene, whose star
points, gas giant, rings and sun disc can never live in the city's instanced
buckets — **not** general slack for the city's own geometry.

Two things that make the draw-call number slipperier than it looks:

- **It is a single-frame sample of a fluctuating value.** Moving populations
  drift in and out of the frustum, so the same build measures 71–75. Treat a
  1–2 call gap between the HUD and the budget line as normal.
- **`renderer.info` resets per `render()` call.** The frame now renders twice
  (sky scene, then city), so `info.autoReset` is off and the counter is reset
  once per frame in `80-camera.js`. Without that the budget line silently
  reports only the city and under-counts the whole sky.

Before spending a call, **grep for the `(shape, family)` combo** — a new pair
opens a whole new InstancedMesh, and one pass blew the cap using
`CONE(...,'metal')` for a kettle lid without checking.

`BUDGET.perPass` allocates the remaining instance headroom by pass, because
each pass is individually reasonable and collectively fatal. `verify.py
--assert` fails the build when a ceiling is crossed. Mobile is roughly a third
of these numbers; ask before spending.

## 7. Layout objects — read only

`CANTONS` (`{n, x, z, r, s, port, i}`), `CIDX` by name, `SPANS`, `CAUSEWAYS`,
`WALL`, `GATES`, `ROADS`, `PIERS`, `SHIPS`, `RPIERS`, `BARGES`, `RBRIDGES`,
`FARMS`, `MANORS`, `COMPOUNDS`, `ISLES`, `RIVER`, `RIVERC`, `OBST`, `PLACED`.

A detail pass reads these. **Only the planner changes them**, because every one
of them is an input to three or four later passes.

`claim(x,z,fx,fz,ry,tag)` returns the claimed record (truthy) rather than
`true`, so a caller can attach facts to it after building. `townBuilding()`
does this: a `PLACED` entry with `tag:'town'` carries `fx0, fz0` (the true,
unpadded footprint — `fx`/`fz` on the record are padded for collision), `yb`
(base y), `h` (total height), `kind` (`hlaalu|velothi|domed|hovel`), `col`,
and `poor` (bool). Entries from other tags (`compound`, `shed`, `warehouse`,
`barn`, `gate`, `farm`, `shrine`, `velothi-out`, `fixed`) do **not** carry
these — a facade pass should treat them as position/footprint only, or skip
them. `COMPOUNDS` entries additionally carry `wallFx, wallFz, wallH, wallCol`
(the compound's own perimeter wall, for decorating it from outside) on top of
`x, z, fx, fz, ry, y` (the courtyard/garden patch inside the wall — the gate
is always on the local `+fx` face, i.e. world direction `ry`).

## 8. Instrumentation

Each fragment publishes its own counters on `window._*`: `_shore`, `_layout`,
`_chinampas`, `_chinp`, `_compounds`, `_buildings`, `_rejTown`, `_rejCompound`,
`_farms`, `_orchard`, `_veg`, `_stats`. Keep this up: it is how the planner
checks a subagent's claim without reading its code.

The determinism-critical set — the counters that must be **byte-identical**
across any change that is not deliberately reshaping the world — is
`_buildings`, `_rejTown`, `_chinampas`, `_veg`, `_orchard`, `_layout`. Quote
them in a hand-off. `_flora.instances` is *not* in that set: `70-veg.js`'s
scatter avoids `PLACED`, so newly claimed ground legitimately moves it.
`_highpriest.stateT` and `_legsFerry` are live animation state and drift
between runs of an unchanged build.

Prefer publishing a **live diagnostic function** over pasting numbers into a
report: it stays true, and the next agent can re-run it. The useful pattern is
one that carries its own baseline, so the number means something — 
`_striders.legStats()` reports each route leg's chosen source *and* the road
candidate it beat, and `_striders.clipAudit()` can re-run itself against the
previous routes. Three rules learned the hard way:

- **Force any matrix update you depend on.** A diagnostic that projects through
  a camera only synced during a render will silently measure the previous
  frame (`_sky.giantPixelWidth()` returned 2677 px for a 330 px disc).
- **Return a sentinel, not a plausible number,** when the answer is undefined
  (off-screen, behind the camera, not built).
- **Let a lazy diagnostic be queried without triggering its own cost** —
  `_sky`/`_striders.nav({built:false})` answers "has the grid been built" for
  free, where the plain call pays 1.4 s.

`src/85-probe.js` exposes `window._api` — this same surface — for the
verifier. It is read-only and nothing in the build depends on it.

## 9. Tuning blocks

Parameters a leaf pass is allowed to change are hoisted into a single block at
the top of their fragment, so tuning is "change numbers, rebuild, look" rather
than "understand the generator".

- `CHINP` (`55-chinampa.js`) — bed size, canal cadence, density falloffs,
  clearances, marsh and willow rates. **Complete**: the generator below it
  holds no magic numbers.
- `FAMMAT[fam].scale` (`05-palette.js`) — world-unit tile size per family.
  Tuning texture density is changing two numbers, nothing else.
- `BUDGET`, `PAL`, `FAMMAT` (`05-palette.js`).

Other fragments do not have one yet. If a pass needs to tune something, hoist
it into a block first and change it second — that is what makes the same task
cheap the next time.
