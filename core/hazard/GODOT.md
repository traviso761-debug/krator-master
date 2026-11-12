# core/hazard in Godot (4.7.2)

What the port does with the hazard records (`README.md` here; `GODOT-PLAN.md` Phase 2, the registry; `biomes/HAZARD-RESEARCH.md`).
Built so far (2026-10-26): the export's own `hazards` section and the importer's Area3Ds (`KratorWorld.hazards`,
`godot/krator/world_import.gd`; `godot/tests/export/lod_test.gd`). Not yet: `KHazard`, navigation, status, the overlay.

## The data

The records arrive twice, and agree: in the registry (`krator-tags`, each record's `tags.hazard` as the kit gave it) and
in core/export's `hazards` section (`krator-hazard`, version 1: every hazard record filled from its kind's row, its shape
in world metres, the kinds table and the navigation layers; present only when the tile holds one; it was
`registry.hazards` until 2026-10-26). The importer reads the `hazards` section; the tags stay the metadata.
The walk export (`krator-walk`) lists the same records' navigation under `zones`.

## One node per record: Area3D

| krator-hazard | Godot |
|---|---|
| `shape.type` cyl | `CollisionShape3D` + `CylinderShape3D` (radius r, height y1 - y0, centred at y0 + height/2) |
| sphere | `SphereShape3D` (radius r) |
| box | `BoxShape3D` (w, height, d), the node turned by `ry` about +Y |
| poly | `ConvexPolygonShape3D` per convex part of the prism (pts x y0..y1), or a `CollisionPolygon3D` (depth = height) |
| `at`, `ry` | the Area3D's transform (+Y up, x east, z south: the export's convention) |
| `monitoring` | on; `monitorable` off. `body_entered` / `body_exited` feed the walker's status component |
| `cycle` / `stateFn` | `KHazard.state(rec, t)` each tick; the Area's `monitoring` follows `on` (an idle geyser does not burn) |
| `trigger` | `body_entered` plus a mass check (`trigger.mass` kg) before it applies; `reset` s before it arms again |
| `tell` | the debug draw's colour; particles and sound by name (`fx`, `sound`) when the tell palette lands (feature 12) |

Item sets (Korona's carnivores are registered one by one, so none yet) would be one `Area3D` per instance, or one per set
with a `MultiMesh`-like shape list when they grow past a few hundred.

## KHazard (autoload, GDScript)

The same functions as `KHAZ`, transliterated as `ktags.gd` is: `make`, `state`, `dose`, `at`, with
`cycle(segs, t, off)` the one clock (`KTRAPS.cycle`: u = t + off wrapped to the length, minus each segment in turn) and
`phase(id)` (`KRAND.hash(0x7A9, len(id), KRAND.child(5, id)) / 2^32`, as core/rand's GDScript twin computes it). The
named state functions port with it: `KTRAPS.state` (a trap's four phases on its `tags.trap.cycle`), `KORONA.pitState`
(the membrane: whole 720 s, tear .6 s, torn 120 s, regrow 360 s, on the record's `tags.trap.membrane.phase`) and
`GEYSER.state` (the record's own cycle: warn = preplay, on = the column, after = steam at .25, offset = -off). A port
checks itself against the page: `KHAZ.state` sampled at fixed t for a few records, the way `godot/krator/water.gd` checks
its probes.

## The 2026-10-26 fields

- `radiant`: a second, wider `Area3D` (the shape grown by `reach`). Its dose follows `KHazard.dose` (heat by distance,
  `(1 - d/reach)^2`), and the inner Area's harm wins where it is greater.
- `cycle.base`: `k = base + (1 - base) * k` on the same clock. `monitoring` stays on while `base > 0`.
- `soak`: the walker's `HazardStatus` keeps the seconds inside per record (`KHAZ.exposure`'s rule: plus dt inside, minus
  dt x full/out outside) and scales the dose by `from + (1 - from) x min(1, tIn/full)`.
- `fire` (`stateFn` `KFIRE.run`): the record's `front` (`N, cs, x0, z0`, the cells and their arrivals) is the fire, with no
  rerun needed. A cell burns from `lit + arrive` for `burn` s, smoulders at `smoulderK` for `smoulder` s, and is then out.
  The Area3D covers the box. Its state and its radiant heat are read per point from the front, as `KHAZ.state(rec, t, s,
  x, z)` does. `kfire.gd`'s `run` can make the same front from the history, when the port runs fires itself.
- `effects` (the made trap): one build-up meter per effect on the walker's `HazardStatus`, each fed by its own dose. A
  `trigger` is `body_entered` (a `beam`: a thin `Area3D` or a `RayCast3D` along the beam) calling `KHazard.trip`, which
  keeps the last trip time per record; `resetting` and `disarmed` turn `monitoring` off.
- `hunter` (a predator's place): an Area3D as any record, plus a link to the fauna it names. The AI of those fauna treats
  the area as home ground: it waits or patrols there, and walkers who enter get the hunter's attention.
- `time` (a time field): an Area3D as any record. Each body inside it runs its own clock: its physics step, its
  AnimationPlayer's `speed_scale` and its particles' `speed_scale` take `KHazard.time_scale(pos, t)`, the product of the
  fields' log-eased scales. It is not `Engine.time_scale`, which is global.
- `mine`: an Area3D for the trigger (`body_entered` calls `KHazard.detonate`), and the blast as a sphere query of
  `mine.blast` m at that moment, each body taking `blast.doses` (a body's `emp` meter only if it is a machine). Spent and
  dud are the record's runtime state; what it leaves arrives as a new record with `until`. The faction's agents add the
  mine's zone to their avoid layer when their faction is in `known`.
- `ambient` (no node): the walker's `HazardStatus` samples the port's own fields (pressure from the atmos port by
  height, temperature) each tick and applies the export's `ambient.kinds` ramps (start to worst, linear), as
  `KHAZ.ambient` does; a row with `times` multiplies its second field's ramp (acid rain: pH x rain from the weather
  port, 0 under a roof by a ray up). Gear is a guard per kind. Sight (`KHazard.sight`, from the dust and ash loads by
  `dustSight`, or a visibility field) sets the camera's fog distance and the NPCs' perception range; `KHazard.aim`
  (the contrast left, by `sightContrast`) scales a to-hit or detection roll, as on the page.
- `areas` (taboo): no node. They are placement data. Godot's settlement builder and NPC placement ask
  `KHazard.forbids(x, z, who)` (the area's shape, its `of` cultures; a record is of a people by faction, else culture),
  as `KHAZ.tabooOk` does on the page.

## Moving and pooling (`21-core-hazard-flow.js`, 2026-11-03)

- `move` (`speed`, `sink`, `slip`, `pull`, `to`, `still`): the walker's `HazardStatus` calls `KHazard.drift(pos, t)` each
  physics tick, scales its pace by `speed`, sinks by `sink`, and adds `pull` (m/s) to its `velocity` before
  `move_and_slide`. A `CharacterBody3D` does not take an `Area3D`'s gravity by itself, so the pull is the status's, not the
  physics server's. **Loose rigid bodies** (a tide bead, a dropped pack) take it from the Area: `gravity_space_override =
  SPACE_OVERRIDE_COMBINE`, `gravity_point = true`, `gravity_point_center = to` (local), `gravity = pull / 0.5` (a body
  reaching about the pull's speed in half a second), `gravity_point_unit_distance = 0`, switched with `monitoring` as the
  state turns on and off. The Area's own falloff is not KHAZ's: the status's drift is the one to check against the page
  (`KHAZ.moveAt` sampled at fixed points, as for `state`).
- `shape.pool`: `KHazard.dose` multiplies by `1 - smoothstep(0, pool, y - (at.y + y0))` at the height the status passes, as the
  page does (a host passes the walker's breathing height, about 1.6 m over its feet). The
  `Area3D` is the whole band; the ramp is in the dose.

## The tunnels' kinds (`22-core-hazard-tunnel.js`, opt-in, 2026-11-11)

The rows ride in the export's `kinds` (only on a page that lists the file); each record's own fields (`burst`, `inrush`,
`seal`) ride as its filled hazard's `raw`, since `make` keeps only the fields it knows. `KHazard` gains the three state
functions by name (`KHAZ.rockburst`, `KHAZ.inrush`, `KHAZ.seal`), each a plain function of (record, t, point):
- **rockburst**: the cycle as any other; the cell is `KRAND.hash(KRAND.child(0x524f43, seed), n) % cells` with `n` the
  period's number (`floor((t + off) / L)`), and a point outside the cell (plus `burst.throw` along the long axis) takes k 0.
  The `Area3D` is the whole stretch; the cell test is in the status. The spalls a host draws are `KHAZ.spalls`' list, the
  same hashes (salt `0x53504c`), so a Godot scene and the page show the same fresh scars.
- **inrush**: the water's level is `depth x k` of the cycle (or the one-off rise from `inrush.at`); a `WATER.open` plane at
  `KHAZ.flood(rec, t).y`, moved each frame. The dose at the status's height y is scaled by `(floor + level - y) / deep`
  over the state's k (the page passes the walker's feet; the drowning is in the water over them).
- **seal**: the section's pressure is a closed form of t for events and a fail cycle (exponential relaxation per stretch of
  constant openness; the cycle's steady state by its affine period map), and a live integration for a bound door (the
  status calls `sealStep` each physics tick with the `KDoor` leaf's openness). k is the `thin-air` ambient row's ramp.

## Navigation: NavigationRegion3D

Each zone of `krator-walk`'s `zones` (or each `registry.hazards` record's `hazard.nav`):

- `travel` > 1: a `NavigationRegion3D` over the zone's footprint with `travel_cost = travel`, `enter_cost = enter`
  (metres), on `navigation_layers = layer` (1, the walk layer). Agents path through mud only when it is shorter.
- `avoid`: the zone's footprint is cut out of the walk layer's mesh (a `NavigationObstacle3D` with `affect_navigation_mesh`
  on, at bake time) and baked as its own region on layer 2 (`navLayers.avoid`), which no agent asks for. A quest that
  must cross (a rope over a crack) asks for layer 2 explicitly.
- Godot's `travel_cost` floor is 1: `KWALK.zone` refuses less.

## Status: the walker's component

A `HazardStatus` node on a walker sums `KHazard.dose` of the Areas it is inside, per `effect`, into build-up meters that
drain out of range (feature 6, later); `danger` 1 with a full meter kills, .7 holds. Until feature 6, the debug HUD
shows the dose and the state, as the page's inspector does.

## The overlay

A debug draw of the Areas (an `ImmediateMesh` or a `MeshInstance3D` per shape, unshaded, additive, the kind's tell
colour times (.1 + .25 danger) times k now), toggled from the debug menu, as `KTAGS.hazardLayer` does on the page.
