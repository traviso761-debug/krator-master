# core/hazard in Godot (4.7.2)

What the port does with the hazard records (`README.md` here; `GODOT-PLAN.md` Phase 2, the registry; `biomes/HAZARD-RESEARCH.md`).
Nothing here is built yet: this is the mapping the importer and the autoload follow.

## The data

The records arrive twice, and agree: in the registry (`krator-tags`, each record's `tags.hazard` as the kit gave it) and
in `registry.hazards` (`krator-hazard`, version 1: every hazard record filled from its kind's row, its shape in world
metres, the kinds table and the navigation layers). The importer reads `registry.hazards`; the tags stay the metadata.
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
colour times (.25 + .75 danger) times k now), toggled from the debug menu, as `KTAGS.hazardLayer` does on the page.
