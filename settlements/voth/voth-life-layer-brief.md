# Voth — Life layer (`src/78-life.js`)

Ambient life: vehicles, pedestrians, scheduled behaviour. One new source file,
one hook in the frame loop, no edits to the static bake.

---

## 0. Dependencies — do not start content until these land

The life layer is blocked on work that belongs to the streets pass. Build
infrastructure against stubs if you like, but content needs all four:

1. **Street graph** — nodes, segments, `nearestStreet(x,z)`, and a pathfinder.
   `ROADS` is currently a flat list of polylines consumed only by the texture
   painter (`src/40-ground.js:1166`) and the mask stroke. It has no nodes, no
   adjacency, and no query.

2. **Bridges in the graph.** `SPANS`, `CAUSEWAYS` and `RBRIDGES` are geometry
   only — `road()` is never called for any of them. As it stands, nothing can
   path to a canton. Landings must be snapped as nodes joining the shore roads
   to the canton street network. Without this the temple canton, the ferry
   stops and every pilgrim circuit are unreachable.

3. **Door anchors.** `structure()` (`src/45-kit.js:1309`) emits geometry and
   nothing else; there are no door positions anywhere in the source. Per the
   placement reference, every family should draw its door through a shared
   `door()` helper that registers `[x, y, z, ry]` into a global `DOORS` array
   during Phase 2. This has to happen at build time, not be inferred later.

4. **Segment clear-width.** Every graph segment carries `clearW` (see §5).

---

## 1. Architecture — three tiers, split on entity count

The generic recipe (`references/schedule-and-life.md`) runs all pedestrians on
CPU with mask probe-ahead steering. That is right at ~300 agents. Voth wants
1000+ in a city that already renders 1050+ buildings at 58 fps / 22 draw calls,
so the crowd tier moves to the GPU and the small tiers keep full simulation.

**Before budgeting anything, profile.** 58 fps is 17.2 ms — either just under
vsync with jitter, or genuinely saturated. Establish whether the frame is CPU-
or GPU-bound; it decides how much of tier 3 can move back to the CPU.

| Tier | Count | Where | Pathing | Collision |
|---|---|---|---|---|
| 1 Scripted | ~30 | CPU | fixed routes | bake-time deconfliction |
| 2 Behavioural | ~150 | CPU | graph pathfinding | formation + separation |
| 3 Ambient | 1000+ | GPU | baked loops | none |

---

## 2. Tier 1 — vehicles (~30)

**Inventory.** Ferry/canoe loop calling at harbour, temple canton, clan
district, river mouth, arena, palace, two or three stops on the south and east
sides, occasional shrine-island detours. A few river craft running up past the
map edge. Sailing ships arriving at and departing the harbour district. Barges
down-river and back up off-map. Elephant bugs on a circuit of the city edge,
leaving by the south, east and west roads.

**Routes are multi-leg CatmullRom curves with dwell**, eased with smoothstep so
they decelerate into stops. Orientation from the horizontal tangent (yaw),
pitch capped, bank from turn rate — never `lookAt`. Skip the first and last
0.5% of each leg when sampling tangents.

**Routes bind late.** Author them as ordered lists of semantic anchors
(`'harbour'`, `'temple-canton'`, attractor IDs), never as coordinates. Resolve
to the graph at init by pathfinding between anchors. A street change then
re-resolves instead of breaking. If an anchor becomes unreachable, fail loudly
at build time with the anchor name — never silently.

**No runtime collision. Deconflict at bake time.** Every vessel's position is a
deterministic function of `uTime` — no runtime randomness anywhere in tier 1 —
so the whole system is periodic and verifiable offline:

- **Lane offset**: push each vessel a few units right of its centreline.
  Opposing traffic on a shared route passes port-to-port, no test, no cost.
- **Phase sweep**: after routes resolve, step one full period and log any pair
  within a clearance radius. Adjust phase offsets, re-sweep, assert zero.
- **Harbour semaphore**: where several routes converge, one vessel per approach
  segment; the next holds at the mouth until it clears. ~20 lines, and it
  produces the queue of waiting ships you want visually anyway.

**Striders never cross bridges** — no span or causeway is remotely wide enough
(§5), and they don't need to. Their route is the shore circuit plus the off-map
roads. Where a leg must cross water, let it wade: constrain strider routes by
water *depth*, not by bridge availability. A strider on stilt legs in the
shallows is the intended silhouette.

**Expose `window._legs = [{curve}, ...]` for every leg** so
`verify.py --sweep` can sample routes against scene bounding boxes. Run it
every round; a route threading a building is the most common regression here
and screenshots will not catch it.

---

## 3. Tier 2 — behavioural pedestrians (~150)

Full CPU simulation on the street graph. Real pathfinding, not mask probing —
the graph exists now and gives better routes for free.

- **Ordinator patrols** — a dozen squads, gold and green armour, following a
  leader with longer look-ahead. Formation width clamps per §5.
- **Pilgrim groups** — 2–3 walking a circuit of shrines, staying grouped.
- **Priests** — stationed at the temple canton and smaller temples, blessing
  passers-by; mostly stationary with a short local wander.
- **Merchant caravans** — off-map to the markets and harbour warehouses.
  Width-constrained (§5), so they route around narrow spans automatically.
- **Farmers** — fields and chinampas, daytime only (§6).

Separation between these is worth having — a squad walking through a pilgrim
group is visible. Simple radius push, ~150 entities, negligible cost.

---

## 4. Tier 3 — ambient crowd (1000+)

75% Dunmer, 25% human. Baked door-to-door loops driven by `uTime` in the vertex
shader: per-instance waypoints, phase offset, speed. Zero per-frame CPU, one
draw call, no collision, no runtime pathfinding.

**Paths are baked at init**, routed on the street graph (so they never cross a
building), then flattened to waypoints. Height from `terrainH` baked per
waypoint, interpolated in the shader.

**Destinations are attractor-weighted, not uniform.** Uniform random door-to-
door produces a crowd that is evenly spread and directionless — Brownian
motion, not a city. Weight destination choice by attractor weight and inverse
distance. Density gradients then fall out of the graph's own topology: dense on
the main approaches, thin in the back lanes, and the warren reads as a warren
because it is *off* the main flows.

**LOD**: skip instances beyond the far cull ring entirely.

---

## 5. Width as a graph attribute

Every segment carries `clearW`. Lanes get their road width; spans and causeways
get their true clear deck. One mechanism then covers carts, squads, boats and
striders — no per-case special handling.

Measured from source:

| | `w` | clear deck (`w − 3.1`) |
|---|---|---|
| Canton spans (`src/50-cantons.js:1651`) | `rr(12,17)` | 8.9 – 13.9 |
| Causeways (`:1666`) | `rr(13,18)` | 9.9 – 14.9 |
| Port causeway | 22 | 18.9 |

(Parapets sit at `±(w/2 − 0.8)` and are 1.5 wide, so they eat 3.1 total.)

Scale estimate: poor buildings are 9–17 units wide and 4.5–11 tall, reading as
one-to-two-storey hovels, which puts a unit near 0.35–0.5 m. A narrow span is
then roughly 3–7 m clear — a cart plus someone squeezing past, not two abreast.
**Confirm the unit scale before widening anything.** What makes the spans read
narrow may be the parapets (2.4 tall against a 3.0 deck is visually heavy)
rather than the deck itself.

Uses:
- **Pathfinding**: an entity wider than `clearW` cannot take that edge.
- **Formation**: abreast width = `min(preferred, clearW − margin)`. A three-wide
  ordinator patrol collapses to single file on a span and re-forms after —
  which looks better than widening the bridge.
- **Lane offset**: clamps the same way; on narrow segments opposing traffic
  yields at a node rather than passing.

**One real widening**: the port causeway, if carts move cargo between harbour
and warehouses. 18.9 clear takes one cart plus foot traffic but not two carts
passing, which will look wrong once things are moving on it.

---

## 6. Attractors and the schedule clock

**`ATTRACTORS` — pin the interface before the facade agent starts.** Anything
that draws people writes to one array: markets, parks, shrines, temples, gates,
the quay, canton landings, warehouse doors. Record shape:

```js
{ id, type, x, z, nx, nz, weight, hours }
```

`nx, nz` is the outward normal — where the crowd actually stands. `hours` stays
`null` until the clock exists; leave the field in now or every call site gets
retrofitted later.

**The day cycle is deferred** until layout and life patterns are settled, but
the seams go in now. `SUNDIR` is currently a fixed constant
(`src/20-stage.js:450`).

The expensive part of a day cycle is never the curves — it is threading an hour
parameter through several dozen call sites that were all written assuming there
isn't one. So leave **seams, not systems**: a function returning a constant
commits to nothing but its signature, and the signature is the only thing that
is costly to retrofit.

Put in now:

- `hourNow()` — returns a fixed hour matching the current sun. Everything that
  will eventually vary by time calls it today.
- `sunDir(h)` — returns the existing `SUNDIR` constant. Every consumer goes
  through it: the sun mesh, the shadow camera, `waterUni.uSun`, the sprites.
- Schedule curves as functions returning 1.0 — `farmerF(h)`, `templeF(h)`,
  `marketF(h)`. Write `farmerF(hourNow())`, never `if (isDaytime)`. Later only
  the curve body changes.
- `hours` on every `ATTRACTORS` record, left `null`.
- A per-instance `sched` attribute on any emissive or glow geometry life adds.
  Adding an instance attribute later means rebuilding the geometry setup for
  every affected mesh; adding it now is one unused float.

Do **not** build now: curve shapes, the HUD time slider, pause/offset state,
night lighting, window emissives, moonlight. These will be wrong without the
cycle in front of you.

**Keep the seams exercised.** If `hourNow()` always returns the same value,
nothing tests the seam, and on the day the cycle lands a third of the call
sites will turn out to have hardcoded the hour anyway. Make `setHour(h)` work
from the console now even with no clock running, and take one verification
screenshot at a different hour each round. Dead scaffolding rots; this is cheap
insurance against it.

---

## 7. Contract — what this agent may touch

Everything in this codebase is a global; a file boundary will not stop cross-
contamination. State it explicitly:

- **Owns**: `src/78-life.js`, plus exactly one call added to the frame loop in
  `src/80-camera.js`.
- **Read-only**: street graph, block faces, `DOORS`, `ATTRACTORS`, `terrainH`,
  `openAt`, `PLACED`, `zoneAt`, `wallOffset`.
- **Never touches**: `BUCKET` / `emitBuckets()`. The static bake stays static;
  life gets its own meshes. Do not add moving instances to the baked path.
- **Budget**: a stated draw-call and millisecond ceiling, verified against the
  existing fps counter each round.

Build-order note: `build.py` concatenates `src/*` in sorted numeric order, so
`78` sits after terrain (`75`) and before camera (`80`). Correct slot.

---

## 8. Instrumentation and acceptance

Expose on `window` and read from the harness every round:

- `_life` — active counts per tier
- `_legs` — every vehicle leg curve (required by `verify.py --sweep`)
- `_routeFail` — anchors that failed to resolve, by name
- `_conflicts` — vessel pairs inside clearance during the phase sweep
- `_narrow` — entities assigned a route with an edge narrower than they are

Acceptance:

- `verify.py --sweep` reports zero route/geometry intersections.
- `_conflicts` is zero over a full period.
- `_routeFail` is empty.
- `_narrow` is zero.
- Frame time stays inside the stated budget with all tiers live.
- Visual: crowd density is visibly higher on the boulevards, quay and gate
  approaches than in the warren back lanes.
