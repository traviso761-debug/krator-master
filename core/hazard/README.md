# core/hazard: what can hurt a walker

One question every walker, quest, NPC and port can ask of a page: what is dangerous here, how much, and now
(`biomes/HAZARD-RESEARCH.md`, features 1 to 4; `core/tags/PROPOSAL.md`, "A hazard key"; roadmap item R11, 2026-10-26).
A hazard is a core/tags record that carries `tags.hazard`, registered before it is drawn like everything placed. This
module is plain functions on those records (`[G data]`: no THREE, no DOM), ported to Godot as `KHazard` (`GODOT.md`).

| File | What |
|---|---|
| `20-core-hazard.js` | `KHAZ`: `make`, `of`, `shape`, `inside`, `beyond`, `state`, `dose`, `list`, `at`, `zones`, `export`, `STATES`, `speed`; `exposure`, `bindFire`, `fireHazard`, `GROUND`; `taboo`, `taboos`, `forbids`, `tabooOk`, `tabooAudit` |
| `test-hazard.js` | `node core/hazard/test-hazard.js`: every function, each check with a negative |
| `GODOT.md` | the Area3D, navigation and status mapping for the port |

What else it touches (all in this workstream, 2026-10-26):

- **core/tags** `52-core-tags-vocab.js`: the key `hazard: 'object'`, the `hazardKinds` table (each kind's effect, danger,
  dose, falloff, nav costs and tell), `hazardEffects`, `hazardShapes`, `hazardFalloffs`, `hazardTriggers`, `navLayers`.
  `53-core-tags-host.js`: the label's line 2 says `hazard: acid (corrode), danger 0.7`; `KTAGS.hazardNow(rec, t, p)` and
  `KTAGS.hazardAt(x, y, z, t)` put the state now in words; `KTAGS.hazardLayer()` is the overlay.
- **core/biome** `37-core-traps.js`: `KTRAPS.cycle(segs, t, off)`, the one clock every repeating thing runs on
  (`KTRAPS.state` is on it, bit for bit the old arithmetic: `test-traps.js` compares a million and a half samples).
- **core/walk** `20-core-walk.js`: `KWALK.zone(o)` and `export().zones` (the hazards' navigation zones, from `KHAZ.zones`).
- **core/export** `09-core-export-adapters.js`: the registry section carries `hazards` (`KHAZ.export`, cropped to the tile).
- **core/host** `93-host-inspect.js`: `KHOST.hazardNote(w, point)` adds the state line to the inspector's words (a separate
  function at the end of the file; the record-driven inspector only: the biome pages, which do not take 93, add
  `KTAGS.hazardAt` to their own `describe`).

## The record

```
tags.hazard = {
  kind     heat cold gas acid poison fall pit thorn grab drown sink slip crush hunter lava fire luck (VOCAB.hazardKinds: its row fills the rest)
  effect   burn freeze suffocate poison corrode bleed hold drown | null
  danger   0..1 (.3 hurts, .7 holds a person, 1 kills)          dose   effect units a second at the core
  shape    {type: sphere|cyl|box|poly, r, h, w, d, pts [[dx, dz]...], y0, y1, edge}, metres from the record's at (box and
           poly in its frame, turned by ry). Left out: the record's own footprint (r and h a cylinder; size a box)
  falloff  none | linear | smooth (from the core to the edge; a poly's core is `edge` m in, 2)
  cycle    {period, warn, ramp, on, after, afterK, offset} | null: warn (k 0, a tell), rising, on, falling, after (k afterK,
           .3), idle; the phase is KTRAPS.phase(seed) of the period, or `offset` s (an authored phase: a geyser's own)
  trigger  {by: step|weight|near, mass, reset} | null          move  {speed, sink, slip} | null
  nav      {travel, enter, avoid, layer}: Godot's travel_cost, enter_cost; avoid = never path through (layer navLayers.avoid)
  tell     {colour, fx, sound, sign}                            stateFn  null | a name in KHAZ.STATES
  seed     the id the clock is hashed from (the kit's own id, the one its shader hashes; else the record's id)
  radiant  {reach, dose, danger} | soak {full, from, out} | fire {lit, burn, smoulder, smoulderK, x, z, wind}; cycle.base
           (2026-10-26: only where the record or its kind has them; "Lava, vents, fire, luck and taboo")
}
```

Units: metres, seconds, kilograms. Every field but `kind` may be left out; `KHAZ.make` fills it from the kind's row and
refuses an unknown kind, effect, shape, falloff or trigger, a danger outside 0..1 and a cycle longer than its period.
A numeric default is `x == null ? d : x` (a danger or dose of 0 is kept).

## The functions

- `KHAZ.state(rec, t, speed)` -> `{state, k, on, warn?, hidden?, left?}`. `k` is how much of its harm it does now (0..1).
  A steady hazard is `{state: 'steady', k: 1}`; a cycle runs on `KTRAPS.cycle`; a `stateFn` names a function in
  `KHAZ.STATES`: `'KTRAPS.state'` (a carnivore: its `tags.trap`'s own cycle on `seed`; open and shutting harm, shut does
  not, opening comes back), and the kits' own (`'KORONA.pitState'`, `'GEYSER.state'`), registered by the kit when it loads.
  `speed` (`KHAZ.speed`, 1) compresses a cycle's idle part and a trap's slow phases, as the page's shaders do.
- `KHAZ.dose(rec, x, z, t, y)`: dose x falloff x k at a point now, 0 outside.
- `KHAZ.at(x, z, t, y, T)`: the hazards holding a point, the worst (danger x k) first. `KHAZ.list(T)`: every live hazard
  record of a registry, an item set's instances each (cached until the registry or a set's count changes).
- `KHAZ.zones(T)`: `{id, kind, shape (world), travel, enter, avoid, layer}` each; `KWALK.export()` lists them under `zones`.
- `KHAZ.export(T, inBox)`: `krator-hazard`, version 1: the kinds table, the layers, and each record filled with its world
  shape. The registry section of core/export carries it as `registry.hazards`.

## Lava, vents, fire, luck and taboo (2026-10-26)

For the planned biomes: the Godthrone (`biomes/godthrone/PLAN.md`), the live fire (core/biome `KFIRE.run`) and the
Outlands' C6 (`biomes/outlands/PLAN.md` section 12). Each new field is written into a filled hazard only where the record
or its kind has it, so every older record fills, states, doses and exports exactly as before.

| Kind | Effect | Row | For |
|---|---|---|---|
| `lava` | burn | danger 1, dose 20, avoid; `radiant` 8 m (dose 2, danger .4) | flows, lakes, the summit vent's fountain |
| `fire` | burn | danger .9, dose 5, avoid; `radiant` 10 m (dose 1, danger .3) | a live fire on `KFIRE.run` |
| `luck` | misfortune | danger .3, dose .05, walkable; `soak` (full 600 s, from 0, out 1200 s) | Trickster's House's keep-out ring |

The Throne's kinds stay what they were: gas vents are `gas`, hot ground is `heat`.

- **`radiant: {reach, dose, danger}`**: heat by distance. Beyond the shape (or inside it, where it is greater than the
  harm) the dose is `radiant.dose x (1 - d/reach)^2 x k`, `d` from the shape's edge (`KHAZ.beyond`). A hit by it carries
  `radiant: true` and the radiant's danger. A record's `radiant: null` turns its kind's off.
- **`cycle.base`**: the k a cycle never drops below. A lava lake overturns (k .7 to 1) and a vent fumes (.3) between puffs.
  It's the same clock (`KTRAPS.cycle`).
- **`soak: {full, from, out}`**: strength by time inside, `from` at entering to 1 after `full` s. `KHAZ.dose(..., tIn)`
  and `KHAZ.at(..., tIns)` take the time. `KHAZ.exposure(T)` keeps a walker's: `step(x, z, t, dt, y)` counts dt inside
  each soak hazard and forgets at `full/out` a second outside.
- **`fire` + `stateFn: 'KFIRE.run'`**: a live fire. The run is page state (a closure over its grid), so it is bound and
  not stored: `KHAZ.bindFire(rec, run)`. At a point it is `unburnt`, then `burning` (k 1, `burn` 30 s from the front's
  arrival), then `smouldering` (k `smoulderK` .3, `smoulder` 400 s), then `burnt`. With no point, the worst state anywhere
  on it now. Its radiant heat comes from the nearest burning cell. `KHAZ.state(rec, t, speed, x, z)` takes the point (the
  other kinds ignore it). Unbound, it is `unlit` and harms nothing.
- **`KHAZ.GROUND`**: the Godthrone's records, as a kit writes them: `lavaFlow(pts, o)`, `lavaLake(r, o)`, `gasVent(r, o)`,
  `hotGround(pts, r, o)` (`pts` a polygon in metres from the record's `at`, else a circle; `o` overrides any field).
- **`tags.taboo = {of, why, shape}`**: an area a people will not build in. `of` null bars every people, else the listed
  cultures. A record is of a people by `tags.faction`, else `tags.culture`. A record of no people (a plant, a rock) is not
  barred. The shape is a hazard's, and defaults to the record's footprint. `KHAZ.forbids(x, z, who, T)` returns the taboos
  that bar it. `KHAZ.tabooOk(who, T)` is a placement predicate: fn(o) false where one does, for a point `[x, z]`, a disc
  `{x, z, r}` or core/city's footprint `{c, u, v, hw, hd}`. `KHAZ.tabooAudit(T)` lists the records of a people standing
  inside a taboo that bars them (a verify check). A keep-out ring is one record carrying both a `luck` hazard and a taboo.
- **Export**: a bound fire's record carries `front` (`N, cs, x0, z0`, the cells it took and each arrival in seconds). A
  page with taboo areas gains `areas: [{id, uid, at, ry, taboo: {of, why}, shape (world)}]`. Without them there is no
  `areas` key.

## The overlay and the inspector

`KTAGS.hazardLayer()` handed to the host as a layer (`layers: {hazards: KTAGS.hazardLayer(), ...}`) gives the page a
`hazards` button: each record's shape drawn additive and unlit in its kind's tell colour, brighter with danger and with
its state now (a geyser between plays fades out, its preplay pulses). Three instanced draws (cylinders, spheres, boxes)
and one mesh per polygon; at most 4000 records, the nearest to the camera, made again when it is shown 60 m away. It is
made on first show: off, it costs nothing. The inspector's words gain `hazard now: on · 100% · 40 s to the next · dose
0.85/s here · paths avoid it`.

## Adopting it

A build opts in by explicit path (it is not pooled): three lines in `build.py`, a field on what it registers, one layer.

1. `build.py`: the module and the clock it runs on (it looks both up at first use, so the slot may sort anywhere):

   ```python
   if '20-core-hazard.js' not in PATH: PATH['20-core-hazard.js']=os.path.normpath(os.path.join(HERE,'..','..','core','hazard','20-core-hazard.js'))
   # and, when CORE_BIOME does not list it yet: '37-core-traps.js' (KTRAPS.cycle)
   ```

   A Throne station: `"hazard": true` in its `station.json` (the Throne's `build.py` adds both).
2. What it registers: `tags: {hazard: {kind: 'acid'}}` on a `BIO.register` / `REGISTER` / `KTAGS` add, with a shape when
   the record's footprint is wider than the danger (a pool's apron, a crack's bounding circle). A carnivore writes
   `{kind, danger: trap.danger, stateFn: 'KTRAPS.state', seed: <the id its shader hashes>}` (Korona's `KORONA.hazardOf`).
   A repeating hazard gives `cycle` (with `offset` when its phase is authored); a kit with a clock of its own registers
   `KHAZ.STATES['<KIT>.state']` and names it in `stateFn`.
3. `99-host-take.js`: `layers: {'hazards': KTAGS.hazardLayer(), ...}`, and in a biome's own `describe(hit)`:
   `+(KTAGS.hazardAt ? '\n' + KTAGS.hazardAt(p.x, p.y, p.z) : '')` (the pilots' `hazardWords(p)`).
4. A page whose shaders compress slow phases sets `KHAZ.speed` (Korona: `KORONA.SPEED`).
5. The 2026-10-26 kinds need nothing more than steps 1 to 3:
   - **The Godthrone**: `tags: {hazard: KHAZ.GROUND.lavaFlow(pts)}` on a flow's record, `lavaLake(r)`, `gasVent(r)`
     (with `cycle.offset` when its puff is authored), `hotGround(pts)`.
   - **A live fire**: `const f = KHAZ.fireHazard(run, {lit: clock.t, y})`, then register a record at `f.at` with
     `tags: {hazard: f.hazard}`, then `KHAZ.bindFire(rec, run)`. Unbind it with `KHAZ.bindFire(rec, null)` when the fire
     is gone.
   - **The Outlands' keep-out ring**: one record with `tags: {hazard: {kind: 'luck'}, taboo: {of: null, why}}`, registered
     before anything of a people is placed. Then:
     - core/city: `rules.groundOk = KHAZ.tabooOk(culture)`, or chain it with the world's own predicate.
     - A biome scatter: `accept: (x, z) => KHAZ.tabooOk(culture)([x, z])`.
     - A pass on core/space: test each candidate with the predicate before `S.insert`.
     - Verify: `KHAZ.tabooAudit()` is empty.
     - A walker: `KHAZ.exposure().step(...)` each frame for the luck's growth.

It moves nothing drawn: the records gain a tag, the page gains a button. Proof on the pilots (2026-10-26, GPU, same view
before and after): Korona's hollow, the Throne's vent country and the geyser basin keep their draw calls, triangles,
instances and record counts.

Pilots: Korona (every trap of danger .3 and over, all six pages: the punji pits on `KORONA.pitState`, now on the one
clock; the man-eaters, coil tendrils, ground stars, bear traps, snare flowers, trap pads as grabs; the numb thorn as
poison; the sucking pools as drowning), the Throne's vent country (station 8: the hot pools, mud pots, CO2 hollows, the
acid marsh as a polygon, the open cracks as falls, the fumaroles), the geyser basin (every geyser on its real clock, the
springs, the acid flats).

## Fauna (not here yet)

The `hunter` kind is in the vocabulary but nothing registers it. The plan (HAZARD-RESEARCH.md item 11, 2026-10-26 note):
a **place** a predator holds (a lair, a nest's defended ring, an ambush pool, stalker sand) is a KHAZ record of kind
`hunter`, static, with its tell, which paths avoid. The **moving animal** is not a hazard record: its threat goes on its
fauna record and the AI (a zone that followed an animal each frame would fight the navigation bake).

## Tests

`node core/hazard/test-hazard.js`, `node core/biome/test-traps.js` (the clock), `node core/walk/test-walk.js` (zones),
`node core/tags/test-tags.js` (the key, the label; the export digest moved with the vocabulary: 5ee8e4c7, then 4935dd5d
with lava, fire, luck and the taboo key). test-hazard checks the new kinds against a stub of `KFIRE.run`'s contract, and
against the real `KFIRE.run` cell for cell once `core/biome/38-core-fire.js` is in the tree (it says `skip` before then),
`node core/export/test-export.js` (the registry's hazards).
