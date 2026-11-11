# The Ancient's Valley: where physics fails (plan, 2026-11-02)

The owner's brief: make the valley particularly weird and hazardous, with regions where the laws of physics seem to break down. Time runs
faster or slower, gravity reverses or grows several times stronger, spaces behave like *House of Leaves*, and, if the engine allows it,
the landscape bends into a cracked Escher version of itself.

**Status: plan, nothing built; every question settled 2026-11-04 (section 12).** **`PLAN.md` is the valley's master plan** (the owner's
brief of 2026-11-03: the megalopolis, its zones, the scars, the feral flora, the people); this file is the detail of the anomalies and of the
metropolis's drawing tiers. The test bed for the towers is `kits/metropolis` (branch `claude/metropolis-testbed-2b4995`).

Every px here is on the **5.1 canvas** (1821x1723, 2 km a px). Section 3 was rechecked against the model's Round 3 on 2026-11-03.

## 1. The idea

Seven Cataclysm blast basins lie in the valley (`tools/scale-model/smodel/tranche2_biomes.py`, 10-15 km across, with vitrified rims). *Proposed:*
the weapons used here were of the eigenweapon's family (`biomes/cut/PLAN.md`), and each basin is a wound in physics that never closed.
The Cut is the same damage at its mildest: combed growth, clean bites, fixed sizes, nothing that hurts anyone. The valley shows it at its worst.

This keeps the lore's restraint. `biomes/cut/PLAN.md` doesn't say what the eigenweapon was, who fired it or at what, and neither does this
plan: the anomalies show what it did, never why. It also explains why the Ancients' capital is empty, and why only the desperate go in.

## 2. Rules

1. **Bounded.** Each anomaly is a zone with an edge, normally under 2 km across and never over the basin. Outside it, nothing changes. Nothing
   here alters the world's one height per point (`terrainH(x, z)`) outside a station's own slabs.
2. **Graded.** Every anomaly has a strength from 0 at its rim to 1 at its core. Gentle at the rim, broken at the centre: the approach is the
   difficulty curve.
3. **Legible.** A player sees the warning before it hurts: dust hanging, birds refusing to fly over, a stopped waterfall, flora that grew wrong. Each
   anomaly has a tell at the rim, in the Cut's vocabulary where it can be.
4. **Fair.** Lethal only by a choice the player can see coming. The way out is always findable, except where the core of a House is the point, and
   there the rule is that the house lets you leave, late.
5. **Free when absent.** A page without an anomaly in reach pays nothing: no uniform, no shader variant, no tick.
6. **Records first.** Every anomaly is a record, in `core/tags`, before anything is drawn. A builder draws a record; it doesn't decide where things go.

## 3. The basins

Each takes one kind, so a player learns one rule per place. The owner may reassign them. Floors and rims are the model's (`tools/scale-model/
build_425_master.py` STEP 5C, `anc_blast_specs`, l.1125: cut last in the pipeline, with guards and a test), in absolute metres; the lake is 17.4 m.
Every basin was a major centre of the city before the war (`PLAN.md` 3), so each floor is glass over foundations.

| Basin (5.1 px) | Radius | Floor | Rim | Water | Anomaly | Near |
|---|---|---|---|---|---|---|
| **476,915** | 6 km | -22 m | 132 m | dry | **The Press:** gravity up to 3 g | Dorado, about 100 km |
| **398,966** | 5.5 km | -26 m | 126 m | dry | **The Stilled Ground:** time slows to a stop | Necropolis, about 47 km |
| **450,896** | 5 km | -14 m | 140 m | dry | **The House:** spaces larger inside than out | **Babel, about 27 km** |
| **428,948** | 7.5 km | -44 m | 38 m | drowned, breached at 35 degrees | **The Lake That Falls:** reversed gravity on water | Necropolis, about 45 km |
| **460,962** | 7 km | -46 m | 36 m | drowned, breached at -145 degrees | **The Fast Water:** time runs fast | Dorado, about 46 km |
| **420,984** | 6.5 km | -24 m north, -6 m south | 76 m | the north half wet, the south a dry melt sheet | **The Bend:** landscape curving up, seen | Blade, about 98 km |
| **406,908** | 6.5 km | -20 m | 134 m | dry | **The Broken Country:** the Escher set-piece, the worst basin | Necropolis, about 72 km; Carcosa, about 193 km |

The map problem this section once opened (basins above their rims, two floors at -431 and -521 m) was fixed by Round 3 (68b6aa22b): the basins read, the
lake is settled. Two drowned basins lie under the lake with their rims awash, which is the Lake That Falls' and the Fast Water's setting as written.

**Added by the owner's brief (2026-11-03):** two more kinds, not tied to a basin: **radiation**, the ordinary hazard (a `KHAZ` row, `PLAN.md` 9), and
**portals**, doors to elsewhere on Krator or off it, where the extraplanar entities come through. A marked settlement or a lone arcology may take a
hazard theme of its own (*proposed* in `PLAN.md` 9: Babel the House, Necropolis radiation, Dorado a stilled core, Blade machines).

## 4. `core/anomaly` (`KANOM`)

One small module, plain data and pure functions (`[G data]`: no THREE, no DOM), so Godot takes the same records.

```
KANOM.add({id, kind, shape:{type:'circle'|'poly', at, r, pts}, rim, core, strength, tell, seed})
KANOM.at(x, y, z)  -> {g: [x,y,z] gravity, time: rate, bend: amount, ids: [...]}   one call, every reader
KANOM.strength(rec, x, z)  -> 0..1 at this point, smoothstep rim to core
KANOM.near(x, z, r) -> records in reach, for the host's tick and the shader's uniforms
KANOM.zones() -> navigation zones for core/walk's export
```

- **Kinds:** `gravity`, `time`, `bend`, `space`, and (2026-11-03) `portal`. They're a new vocabulary in `core/tags`, beside `hazardKinds`.
- **Damage goes through `KHAZ`.** An anomaly that hurts also registers a hazard record, so the inspector, overlay, zones and export work as they do
  now. `hazardKinds` already has `crush` and `time` (a stasis field: `KHAZ.timeScale`, `here().time`; checked 2026-11-03). New rows: `crushing` (the Press: its own
  row, the owner's choice 2026-11-04, so heavy gravity is a kind of its own in the inspector and the export; `crush` stays the ordinary press of a
  falling block), `aging` (fast time), `lift` (reversed gravity), `rad` (radiation, `PLAN.md` 9). `KHAZ.here` then reports them like heat or gas.
- **Determinism:** `KRAND.hash(world, cell, index, salt)`. A rewired House depends on seed and visit count, not on draw order.
- **Node test:** `core/anomaly/test-anomaly.js`, with negatives: strength is 0 outside the shape, overlaps combine in a fixed order, and no reader changes
  anything when no record is in reach.

## 5. The effects

### Gravity

**What the code does today.** The host walker (`core/host/90-host-camera.js`, `C.stand`) has no vertical motion. It snaps the feet to the ground or the
highest `KWALK` floor, and `core/walk` has no gravity value at all. So gravity can't just be a multiplier, and there's no jump or fall to scale. *This corrects
the first feasibility note.*

- **Heavy (the Press), easy.** Walk speed and step height fall with strength, the eye drops, the camera bob shortens. Scatter does most of the work: trees
  stunted and spreading, boulders sunk in their own craters, ruins pancaked floor on floor, flat dust that won't rise, waterfalls hitting hard and short.
  All records and kit placement, using `KANOM.strength` at placement. The Godot character takes real gravity.
- **Reversed, seen, easy.** Debris, water and dust rising in columns from the basin, on instancing and `core/atmos` particles. The Lake That Falls: a lake surface
  peeling upward at the core, in `core/water`'s flow ribbons and curtains run upward, into a hanging cloud of its own water.
- **Reversed, felt, medium.** The walker gains one small vertical state: `vy` and an up sign, off unless `KANOM.at` says otherwise. Over a lift zone the
  walker rises and stops at a ceiling. It needs `KCAVERN` roofs or `KWALK` floors marked `ceiling`, plus a camera flip through `camera.up`. Limited to places with a
  ceiling: the open sky is a death drop, and the rim's tell says so.

### Time

- **Stilled, easy.** Objects carry a `time` factor at placement or per tick. At the core: a waterfall stopped in the air, a bird hanging, a raindrop field, steam that
  doesn't move, an Ancient machine mid-explosion. Frozen things are instanced meshes and static water with no tick at all, so **the most striking effect here is the
  cheapest**. A player entering slows too, and leaves to find the sky has moved on.
- **Fast, medium.** Fauna and sim ticks scale directly. Plants age by placement: a ring of forest growing, dying and regrowing in bands, shown by age class. Shader motion
  needs care: wind and water read one global clock, so a local rate means multiplying phase by a smooth field, which shears at the edge. Keep the scaled motion
  bounded (an oscillation's phase, not a growing time), or fade it at the rim.
- **The player's own time.** `core/clock` jumps the world on exit by the time owed. The simulation already abstracts unwatched towns (`77-sim-7-lod.js`), so a jump of hours is
  the same path. Cap it: *proposed* at a day, until the sim has been tested on more.

### Space (the House)

**The best value in the plan, and first after the basics.** Interiors already sit in their own coordinates (`kits/interiors`, `ROOM()`), and `KWALK` floors and blocks take
any rooms.

1. **Larger inside than out.** A shed-sized ruin door opens on an interior hall. A fade or a matching threshold hides the move.
2. **Loops.** A corridor whose far door is its near door, by an invisible teleport between identical rooms. No render cost, and no portal needed.
3. **Rewiring.** `W.setBlock` already switches doors; a room plan changes when no door of it is in view, seeded by visit count. Measurements disagree: a hall a few cm longer
   each visit (the Navidson house), which the inspector reports without comment.
4. **Depth.** The House goes down further than the ground allows. The lower levels are outside the world's coordinates, so no terrain is involved. Cold, dark, and a growl
   the audio mix (`core/audio`) can keep at one distance however far you walk.

### See-through portals (optional)

`core/water/ext/58` already renders a second camera with an oblique near plane, and its live pass costs about 2.4-3.4 ms on the Arc 140T on eastabyss. A portal is the same pass
through a door. At most one or two in view. Godot uses a `SubViewport`. Only needed where a player must see *through* a seam; teleports cover the rest.

### The Bend

A view-space vertex warp centred on the camera: `y += k·d²` turned upward, so the land rises round you like the inside of a bowl and the horizon climbs the sky. The ground
under your feet stays true, so **collision, placement and the walker don't change**.

- It goes through `KHOOK.warp`; `KWARP.install` puts it on every material in the scene (`core/shader/README.md`, "The warp"): one uniform, off with no anomaly in reach.
- Needs: mesh culling widened near a bend (chunks vanish early otherwise), the same warp in the impostors' own shader, the sky's horizon, and water's. Shadows can stay
  unwarped at modest strength: check by eye.
- **Cracking:** a screen-space crack pattern at high strength, where the warped ground splits along bright seams. Cheap, but judge it early: it may look like a bug.

### The Broken Country (the Escher set-piece)

Slabs of landscape at wrong angles: one station, a handful of slabs, not a system.

- **`KSHARD`, a slab:** a piece of ground (a copy of a `KFIELD` patch, tiled or cut) with its own matrix. Seen from outside: cheap, a mesh.
- **Walking it:** each slab keeps its own up. The walker converts to the slab's frame, stands on that slab's `terrainH`, and converts back. At a seam, `camera.up` eases across
  over half a second. Hard but contained: 6-10 slabs. Floors belong to a slab's record, and the walker's `at()` goes through the current slab.
- **Impossible stairs:** teleports at seams and forced perspective. A Penrose stair is a loop in the House's sense, seen from one good angle.
- **Godot makes this easier:** `CharacterBody3D.up_direction` is built in, and each slab gets its own navigation region. Kept out of the browser walker's general path: a mode
  a station asks for.
- **Not attempted:** continuous, free-form walkable curved terrain. It would break the height-per-point assumption everywhere.

## 6. Stations

Each is a station page on `biomes/ancientsvalley`, not streamed terrain. Open-world streaming comes later and only for the rim tells.

| Order | Station | Shows | New work | Effort |
|---|---|---|---|---|
| 1 | **The Stilled Ground** | Stopped falls, hanging birds, the slowing walk | `KANOM`, time factors | Small |
| 2 | **The Press** | Stunted trees, pancaked ruins, heavy walk | Gravity on the walker's speed and eye | Small |
| 3 | **The House** (at Babel) | Loops, rewiring, depth | Interior records, teleports | Medium |
| 4 | **The Lake That Falls** | Water rising in sheets, a debris column | Upward flows | Medium |
| 5 | **The Fast Water** | Forest in age bands, seasons racing | Local shader time | Medium |
| 6 | **The Bend** | The land curling up, cracks | `KHOOK` warp | Medium |
| 7 | **The Broken Country** | Slabs, seams, the stair | `KSHARD`, the walker's frames | Large |

Each is also a district of the city (`PLAN.md` 3): its basin was a centre once, and the station carries the valley's own content round it, the
fields, the feral flora, the lines, the people, as `PLAN.md` 5-7 have them. `PLAN.md` 12 puts a station with no anomaly before these seven.

## 7. Life and people

- **Native life adapts.** Flora in the Press grows flat and thick. Stilled Ground's rim holds plants with one half older than the other. *To be written with the fauna kit*, following the
  Cut's warp vocabulary and the native trends in `biomes/*/PLAN*.md`.
- **Robots:** the valley's machines may be the only things that work here, because they don't care about time. *Proposed.*
- **Who comes:** the rare bandit, salvagers after Stilled Ground's unspoiled Ancient goods. *Proposed:* things kept in a stopped zone don't age, so the richest finds are
  furthest in.

## 8. Core adoption

Written first, as `CLAUDE.md` asks.

| Module | Takes | For |
|---|---|---|
| `core/anomaly` (**new**) | `KANOM` | every zone |
| `core/tags` | `50`, `52`, `53` | records; new kinds and `hazardKinds` rows |
| `core/hazard` | `KHAZ` | crushing, aging, lift, on the usual path |
| `core/walk` | `KWALK` | floors, blocks, doors, ceilings; `zones` for navigation |
| `core/host` | `FULL` | the page shell; the walker change, opt-in |
| `core/shader` | `KHOOK` | the bend slot |
| `core/clock` | `KCLOCK` | time owed on leaving |
| `core/biome`, `core/terrain`, `core/water`, `core/atmos`, `core/materials`, `core/export` | as any new kit | ground, flora, the stopped and rising water, dust, records |
| `kits/interiors` | `ROOM()` | the House |
| `core/rand` | `KRAND` | all of it |

Not taken: `core/city`, `core/furnish`, `core/hamlet`, `core/camp`. `tools/check_core_use.py` runs before the first station is called done.

**Changes to shared code, each opt-in and byte-identical without it:** a `vy`/up state and an `at()` hook in `C.stand`; a time factor for ticks; `KHOOK`'s warp slot; upward flow in `core/water`;
`hazardKinds` rows, which do move the tags digest on purpose. Everything else is new files.

## 9. Godot

Records, `KANOM.at`, slabs and zones port as data. Three pieces need their own twins: portals (`SubViewport`), the bend (a shader global), and the walker's frames (`up_direction`, simpler
there). `tools/check_port.py` holds `core/anomaly` to `[G data]`.

## 10. Budget and checks

- **Budget:** stations cost about what a ruined biome station costs. A portal is one extra pass. The bend is one vertex operation, plus more chunks kept drawn. Measure on the Arc 140T, naming the GPU.
- **Verifies:** each station's `verify.py` on `verify_page`, with asserts that the anomaly's strength is 0 outside its shape, a walker can always leave, and the frozen objects never move.
- **By eye:** the owner judges each anomaly. A bend or a crack that looks like a rendering bug has failed, even if it works.

## 11. Order of work

Superseded by `PLAN.md` 12 (2026-11-03): a station with no anomaly comes first, to prove the city's look and the budget split; then
`core/anomaly` and stations 1 and 2 together (**stop for the owner's eye**); the House; stations 4-6; the Broken Country last. The basins' re-cut
(the old step 1) is done.

## 12. Open questions for the owner

**All settled by the owner on 2026-11-04:** the cause is the eigenweapon's family (section 1 stands as lore); the Press is **fatal** at its core;
time owed on leaving is **capped at a day**; **10-15%** of the metropolis's towers stand (section 13). The basin assignments of section 3 stand
until the owner moves one. The settlements' own themes are in `PLAN.md` 9.

## 13. The metropolis (the owner, 2026-11-02)

The ruin fields are true metropoli: hundreds of skyscrapers, each in its own state of ruin. Skyscrapers are triangle hogs, and the owner asked for an answer other than an optimization pass or
new, slimmer designs. **The answer: keep the kit's towers as source art, bake them into cheap stand-ins, and draw only about ten real ones at a time.**

**The problem:** the Pile alone is about 152k triangles (`kits/ancients/targets/arcpile`). 500 towers at that size is about 75 M; eastabyss's opening view is 3.83 M. Instancing saves draw calls, not
triangles, and these pages are vertex-bound (`biomes/nhighlands/PERF.md`).

**The tiers.** Triangles are rough estimates until the spike measures them.

| Range | Drawn | Triangles |
|---|---|---|
| Under 300 m | About 10 real towers, from `kits/ancients` as they are | About 1.5 M |
| 300 m - 1 km | About 60 baked shells | Under 5k |
| 1 - 3 km | About 400 impostors | About 1k |
| Beyond 3 km | One mesh per square km of district | About 50-100k |
| Everywhere | Stumps, skeletons, rubble | About 300k |

Near-range cost depends on how many towers a player can stand close to, so street width and tower spacing are budget decisions.

**The pieces:**

1. **Ruin does the first cut.** *Proposed:* only 10-15% of towers stand to full height. The rest are stumps, bare steel skeletons (instanced beams), and rubble or fallen towers as `KSTACKS` mounds and ground. Every tower is
   a record with a ruin state in `core/tags`, placed by a plain layout pass on `core/city` where it fits.
2. **`KSHELL`, the baked shell (new in core).** A real tower is rendered once from each face into albedo, normal, depth and coverage atlases. It's then drawn as a box of 12-60 triangles, with parallax for the facade depth,
   interior mapping for the windows, and coverage cut-outs for the broken floors. On the same shape as impostors: a `[G data]` record plus a host-side bake.
3. **Impostors.** `BIO.impostor` as it is, with one set for 8-12 tower families in several ruin states. Tall, thin towers need a larger atlas cell than trees: measure it.
4. **District bakes.** Each square km past 3 km becomes one simplified skyline mesh with one texture, an extension of `KFAR` (which carries colour and height today, not masses).
5. **Visibility bake.** At build time, work out which blocks can be seen from each ground cell, and draw only those. The runtime cost is close to nothing, but core has no such pass, and it lengthens builds. It helps only at
   street level; a flying camera sees the worst case. **Add only if the tiers aren't enough.**
6. **The valley's air.** Height fog (`ATMOS.heightFog`) and the steam take the far work: everything past 2-3 km fades, which suits the place.
7. **Godot.** The baked assets carry over. Occlusion culling and visibility ranges are built in, so the game has more headroom than the pages.

**The risks:**

- **The switch from shell to real tower** is the hard part. `BIO.LOD.fade`'s dithered cross-fade is the tool: judge it by eye.
- **Bake count** should track tower families, not the city: 10 families in 4 ruin states is 40 bakes, shared by 500 towers.
- **Interiors:** a shell has no inside. Only nearby real towers can be entered, which suits the House: its interiors live elsewhere anyway.
- **The page cap:** atlases count against the page's size limit (`BUDGETS.json`).

**Order:**

1. **Spike:** bake one existing tower to a shell, and compare it side by side with the real tower at 300 m on the Arc 140T. **Stop for the owner's eye.** Everything else depends on this.
2. `KSHELL` as a core module, with a node test for its records and a verify.
3. The impostor set and the ruin states.
4. District bakes, then the fog pass and a measured view from the worst street.
5. The anomalies' House and Babel can then stand in the same city.

**The test bed:** `kits/metropolis` (2026-11-02): sixteen towers designed for these tiers, two built, and the spike's findings (`kits/metropolis/README.md`). A box shell does not fit a curved tower: `KSHELL` grew a polar mode.

**Core adoption:** adds `KSHELL` (new) and `core/terrain`'s `KFAR` to section 8's table, plus `kits/ancients` read in place, `core/city` for the street layout (read `core/city/README.md`, "Porting a settlement", first), and `core/lod` if `BIO.LOD` doesn't fit
buildings. It's independent of `core/anomaly`, so either can go first.

