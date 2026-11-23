# core/hazard: what can hurt a walker

One question every walker, quest, NPC and port can ask of a page: what is dangerous here, how much, and now
(`biomes/HAZARD-RESEARCH.md`, features 1 to 4; `core/tags/PROPOSAL.md`, "A hazard key"; roadmap item R11, 2026-10-26).
A hazard is a core/tags record that carries `tags.hazard`, registered before it is drawn like everything placed. This
module is plain functions on those records (`[G data]`: no THREE, no DOM), ported to Godot as `KHazard` (`GODOT.md`).

| File | What |
|---|---|
| `20-core-hazard.js` | `KHAZ`: `make`, `of`, `shape`, `inside`, `beyond`, `state`, `dose`, `list`, `at`, `zones`, `export`, `STATES`, `speed`; `exposure`, `bindFire`, `fireHazard`, `GROUND`; `taboo`, `taboos`, `forbids`, `tabooOk`, `tabooAudit` |
| `test-hazard.js` | `node core/hazard/test-hazard.js`: every function, each check with a negative |
| `21-core-hazard-flow.js` | opt-in: `KHAZ.moveAt`, `drift`, `poolK`: a hazard's `move` read (`move.pull` toward the core) and gas pooled on a band's floor (`shape.pool`); `test-hazard-flow.js` |
| `22-core-hazard-env.js` | opt-in: crusts that break underfoot (`KHAZ.crust`, `KHAZ.under`, `load`, `mend`, `saveCrusts`), air that pools at night and in still air (`KHAZ.night`, `bindClock`, `bindWind`), fronts that travel a path (`KHAZ.front`: the gorge flood and the charge; `frontAt`, `floodLevel`, `bindHerd`), `KHAZ.ENV` builders; `test-hazard-env.js` |
| `22-core-hazard-tunnel.js` | opt-in: the tunnels' kinds `rockburst`, `inrush`, `seal` (their rows added to the vocabulary at first use), `KHAZ.TUNNEL`, `burstAt`, `spalls`, `flood`, `pressure`, `breach`, `reseal`, `bindDoor`, `sealStep`, `tunnelAudit`; `test-hazard-tunnel.js` |
| `GODOT.md` | the Area3D, navigation and status mapping for the port |

What else it touches (all in this workstream, 2026-10-26):

- **core/tags** `52-core-tags-vocab.js`: the key `hazard: 'object'`, the `hazardKinds` table (each kind's effect, danger,
  dose, falloff, nav costs and tell), `hazardEffects`, `hazardShapes`, `hazardFalloffs`, `hazardTriggers`, `navLayers`.
  `53-core-tags-host.js`: the label's line 2 says `hazard: acid (corrode), danger 0.7`; `KTAGS.hazardNow(rec, t, p)` and
  `KTAGS.hazardAt(x, y, z, t)` put the state now in words; `KTAGS.hazardLayer()` is the overlay.
- **core/biome** `37-core-traps.js`: `KTRAPS.cycle(segs, t, off)`, the one clock every repeating thing runs on
  (`KTRAPS.state` is on it, bit for bit the old arithmetic: `test-traps.js` compares a million and a half samples).
- **core/walk** `20-core-walk.js`: `KWALK.zone(o)` and `export().zones` (the hazards' navigation zones, from `KHAZ.zones`).
- **core/export** `09-core-export-adapters.js`: the `hazards` section (`KHAZ.export`, cropped to the tile; absent when the tile holds none). It rode in the registry as `registry.hazards` until 2026-10-26.
- **core/host** `93-host-inspect.js`: `KHOST.hazardNote(w, point)` adds the state line to the inspector's words (a separate
  function at the end of the file; the record-driven inspector only: the biome pages, which do not take 93, add
  `KTAGS.hazardAt` to their own `describe`).

## The record

```
tags.hazard = {
  kind     heat cold gas acid poison fall pit thorn grab drown sink slip crush hunter lava fire luck trap time mine (VOCAB.hazardKinds: its row fills the rest)
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
  shape. core/export carries it as its `hazards` section.

## Lava, vents, fire, luck and taboo (2026-10-26)

For the planned biomes: the Godthrone (`biomes/godthrone/PLAN.md`), the live fire (core/biome `KFIRE.run`) and the
Outlands' C6 (`biomes/outlands/PLAN.md` section 12). Each new field is written into a filled hazard only where the record
or its kind has it, so every older record fills, states, doses and exports exactly as before.

| Kind | Effect | Row | For |
|---|---|---|---|
| `lava` | burn | danger 1, dose 20, avoid; `radiant` 8 m (dose 2, danger .4) | flows, lakes, the summit vent's fountain |
| `fire` | burn | danger .9, dose 5, avoid; `radiant` 10 m (dose 1, danger .3) | a live fire on `KFIRE.run` |
| `trap` | damage | danger .6, dose 1, walkable; `trigger` step, reset 30 s | a made trap (the arcology ruins, later): plates, beams, blades, stun fields |
| `time` | stasis | danger .8, no dose, avoid; `time.scale` 1e-4 | time slowed or sped up: the History Monks' Procrastinator and its seals (LORE.md 6.15) |
| `mine` | damage | danger 1, dose 40 in a 4 m blast, step trigger, armed 5 s after laid, one shot | land mines, laid or in a field: the Valley of the Ancients |
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
- **The made trap** (`kind: 'trap'`, planned for the arcology ruins): `effects: [{effect, dose, danger}]` delivers
  several at once (effects now include `shock`, `paralysis`, `damage`), each scaled as the dose is. `KHAZ.doses(rec, x, z,
  t, y, tIn)` returns `{effect: dose}` (any hazard: its one effect; radiant heat is `burn`). The row gives a trigger
  (`step`, reset 30 s; triggers now include `beam`). `KHAZ.trip(rec, t)` sets it off: true when it was armed (its doses
  apply now); then it is `resetting` (k 0) for `reset` s. `KHAZ.disarm(rec)` (state `disarmed`) and `KHAZ.rearm(rec)`.
  Trips and disarming are page state by record id, not stored in the record. A hidden trap is `tell: {fx: null, sound:
  null}` with a `sign` for whoever finds it. A pulsing field (a shock floor) is a `cycle`.
- **Time** (`kind: 'time'`, `time: {scale}`): time runs at `scale` at the core and eases to 1 at the edge by the
  falloff, in log scale (a ten-thousandth, a hundredth, a tenth, 1), times its k now. Below 1 is slowed: the
  Procrastinator's seals at 1e-4. Above 1 is sped up: a monk's quickening. A cycle switches it.
  - `KHAZ.time(rec, x, z, t, y)` gives one record's scale; `KHAZ.timeScale(x, z, t, y, T)` multiplies every field at a
    point; `KHAZ.here(...).time` gives the same.
  - The host applies it to what stands there: a walker's dt, an animation's speed, a particle's age, an NPC's schedule
    clock. The harm is being held (`stasis`, no dose), and paths avoid it by default.
- **Land mines** (`kind: 'mine'`). The record's shape is the trigger, and the harm is the blast once it is tripped
  (standing on one doses nothing).
  - `mine: {blast, arm, dud, laid, owner, known, exposed, leaves, life}`.
  - **Laying one:** `KHAZ.deploy(T, {at, t, by: {id, faction}, load})` adds a record live. It is armed `arm` s after
    it is laid, and `KHAZ.clearMine(T, rec)` lifts it.
  - **A field in the world:** `KHAZ.minefield({world, id, box | pts, cell, per, age, load, known, ground})` lays one
    by cell on `KRAND.hash`, so a cut tile holds the same mines.
    - `age` in years makes duds (0.4% a year, to 60%: each mine's own hash, not when it is stepped on) and exposed ones
      (0.5% a year, to 30%).
    - The Valley of the Ancients' old fields are the first planned use; there is no Valley plan yet.
  - **Going off:** `KHAZ.detonate(T, rec, t)` returns `{fired, left, chain}`. It fires once (then `spent`); a dud
    fails and is found. `left` is what it leaves; `chain` is the armed mines its blast reaches (the host trips them).
  - **The blast:** `KHAZ.blast(rec, x, z, y)` returns `{dose, danger, f, doses: {effect: dose}}`, falling off smoothly
    to the blast's edge.
  - **Hidden or known:** a mine is hidden until `KHAZ.find(rec)` or `exposed`. `KHAZ.knows(rec, who)` is true for its
    owner, `mine.known` and anyone once it is found. Its walk zone carries `known`, so only those factions' agents path
    round it.
  - **Loads** (`load`, for deploy and minefield), `KHAZ.MINES`:
    - `frag`: damage and bleed, 5 m;
    - `incendiary`: burn, 4 m; leaves burning ground (heat) for 30 s;
    - `cryo`: freeze and paralysis; leaves ice (slip) for 2 min;
    - `emp`: harms machines only (mechs, robots, energy cells), 8 m, danger .1 to a person;
    - `stun`: shock and paralysis;
    - `gas`: leaves a cloud for 1 min.
    An object of the same shape is a load of one's own.
- **`until`** (any hazard): the t it is gone at (state `gone`, k 0). What a mine leaves runs on it.
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
   - **A predator's place**: `tags: {hazard: KHAZ.PREDATOR.lair(r, {fauna: key})}` (or `ambushPool`, `stalkerSand`) on
     the place's record, beside the animal's own record.
   - **A time field** (the Procrastinator's seals, a monk's quickening): `tags: {hazard: {kind: 'time', time: {scale},
     shape}}`, and the host multiplies each thing's dt by `KHAZ.timeScale(x, z, t, y)` where it stands.
   - **Mines**: a walker or an NPC lays one with `KHAZ.deploy`; a step on its trigger calls `KHAZ.detonate`, and the
     host applies `KHAZ.blast(rec, x, z, y).doses` to every body in reach, then trips the `chain`. A field in the world
     is `KHAZ.minefield(...)`, its records registered before they are drawn.
   - **Thin air and cold**: the page's field owner calls `KHAZ.provide('pressure', fn)` and
     `KHAZ.provide('temperature', fn)`. The walker asks `KHAZ.here(x, y, z, t)`.
   - **Dust, ash and caustic storms**: the page's weather provides `dust` and `ash` (mg/m3) and, where the ground is
     a dry soda lake, `alkali`. A page that knows its fog or smoke outright provides `visibility` (m). The walker and the
     NPCs read `KHAZ.here(...).doses` and `.sight`.
   - **Acid rain**: `KHAZ.provide('rain', fn)` from the page's weather (0 under cover), and `KHAZ.provide('ph', fn)` from
     the region's map (the Valley's acid, clean elsewhere).

It moves nothing drawn: the records gain a tag, the page gains a button. Proof on the pilots (2026-10-26, GPU, same view
before and after): Korona's hollow, the Throne's vent country and the geyser basin keep their draw calls, triangles,
instances and record counts.

Pilots: Korona (every trap of danger .3 and over, all six pages: the punji pits on `KORONA.pitState`, now on the one
clock; the man-eaters, coil tendrils, ground stars, bear traps, snare flowers, trap pads as grabs; the numb thorn as
poison; the sucking pools as drowning), the Throne's vent country (station 8: the hot pools, mud pots, CO2 hollows, the
acid marsh as a polygon, the open cracks as falls, the fumaroles), the geyser basin (every geyser on its real clock, the
springs, the acid flats).
2026-10-26: the Throne's mat (the slime mould, `THRONE.PLANTS.mat`: a soak acid on every instance, every station that
places it), the ash desert's CO2 hollow (station 7, now `"hazard": true`), the Catch's Stalkers' sand (a
`KHAZ.PREDATOR.stalkerSand` round the pair; `biomes/catch/build.py` takes core/hazard and the clock). None is rebuilt
yet: each page moves at its own turn in the biome rebuild.

## Fauna: the places predators hold

A **place** a predator holds is a KHAZ record of kind `hunter`. It is static, has its tell, and paths avoid it. It is
bound to the fauna that hunt there by key: `hunter: {fauna: [key...], count, note}` (HAZARD-RESEARCH.md item 11).
`KHAZ.PREDATOR` makes them:
- `lair(r, o)`: a den or nest; bones and spoor.
- `ambushPool(r, o)`: water something waits under, reaching 3 m down; bleed and drown.
- `stalkerSand(pts, r, o)`: buried waiting; the sand moves with no wind.
`o.fauna` is the keys, and any other field overrides. They do no dose of their own: the harm is the animal's.

The **moving animal** is not a hazard record. Its threat goes on its fauna record and its AI (a zone that followed an
animal each frame would fight the navigation bake). First on a page: the Catch's Stalkers' sand (below).

## The air and the cold: the ambient bridge

Thin air and cold everywhere are fields, not placed shapes. They vary with height, place and time, and Godot samples them
each tick rather than in an Area. KHAZ turns their values into doses; another module owns the values (core/atmos for
pressure by height, and a temperature field when one exists).
- **`KHAZ.provide(field, fn(x, y, z, t))`** registers a field: `'pressure'` (atm) or `'temperature'` (degrees C),
  `VOCAB.ambientFields`. `null` removes it. A page with none has no ambient hits.
- **`VOCAB.ambientKinds`**: each row ramps its effect linearly from `start` (k 0) to `worst` (k 1, the full dose).
  - `thin-air`: suffocate, from .6 atm (a person tires) to .06 atm (the blood boils; the Godthrone's rim is .07).
  - `cold`: freeze, from 0 to -40 C.
  - `hot`: burn, from 45 to 70 C.
  - `acid-rain`: corrode, for the Valley of the Ancients (planned). It takes two fields, `ph` (the rain's acidity: clean
    rain is 5.6) from 4 down to 1, times `rain` (mm an hour) from 0 to 10. A row's `times: {field, start, worst}`
    multiplies a second ramp into k; without both fields, nothing. A storm that moves is a `rain` field of t; a roof is
    rain 0 there, or a guard of 1.
  - `dust`: suffocate, from 2 to 50 mg/m3 (a dust storm; a haboob's wall is thousands).
  - `ash`: suffocate, from 1 to 25 mg/m3. Volcanic ash is glass, so it harms at half dust's load: the Throne's ashfall
    under the plume, an eruption.
  - `caustic-dust`: corrode, for the Catch's black storms off its dry soda lakes. `alkali` (the share of the dust that
    is caustic salt, .05 to .5) times `dust` (1 to 25 mg/m3). The same storm also chokes (the dust row) and blinds
    (sight), and it etches what lies open: a cargo system takes its corrode dose.
- **`KHAZ.sight(x, y, z, t)`** returns `{range (m), by}`: how far one sees. It is the nearer of the `visibility` field
  and what dust and ash together allow (`VOCAB.dustSight`, Chepil and Woodruff 1957: V km = (56 / C)^(1/1.25); 2000
  mg/m3 is about 57 m, 12 is about 6 km, clean air hundreds of km). For a walker's view, an NPC's senses and the port's
  fog. `KHAZ.here(...).sight` gives the same.
- **`KHAZ.seen(d, range)`** and **`KHAZ.aim(x, y, z, tx, ty, tz, t)`** give what sight leaves of a shot or a spotting.
  - The factor is the target's contrast left at d metres (Koschmieder: exp(-3.912 d / V), `VOCAB.sightContrast`),
    rescaled to 1 point-blank and 0 at the sight range.
  - `aim` judges by the worst sight at the shooter, the line's middle or the target, and returns `{k, d, range}`.
  - In a haboob's wall (57 m), 20 m keeps about .24 and 100 m nothing; across clear air 300 m keeps nearly all.
  - Multiply a to-hit chance or a detection roll by k. A game that wants it gentler shapes it there (k^.5, a floor).
- **`KHAZ.ambient(x, y, z, t, guard)`** returns `[{kind, field, value, k, effect, dose, danger}]`, worst first. `guard`
  is `{kind: 0..1}`, how much a walker's gear keeps out (a mask .5, a suit 1).
- **`KHAZ.here(x, y, z, t, T, {tIns, guard})`** returns `{records (KHAZ.at), ambient, doses: {effect: summed}}`: what
  hurts here, in one call.
- **Export**: a page that provides a field gains `ambient: {fields, kinds}`, the thresholds the port applies to its own
  fields.
- **Local cases stay records**: a CO2 hollow, a cold sink, a sealed airless chamber are `gas` or `cold` records with a
  shape.

## Moving and pooling (`21-core-hazard-flow.js`, opt-in, 2026-11-03)

The Gills' in-breath (`biomes/gills/PLAN.md` sections 9 and 14 item 5) is a `grab` that pulls a walker toward a throat, and
their sumps' gas, like the Hearths' fissure lows, kills on the floor and is nothing two metres up. `20-core-hazard.js` kept
`move {speed, sink, slip}` on the record and nothing read it; a band's dose was the same from its floor to its top. This
fragment reads both, and adds two fields:

- `move.pull` (m/s) toward `move.to` (`[dx, dy, dz]` from the record's `at`; default the core at the band's floor), easing out
  within `move.still` (.5 m) of it; `speed`, `sink` and `slip` as before. Each is scaled by the falloff at the point and the
  state's `k` now, so a throat whose cycle (or `stateFn`) is off pulls nothing.
- `shape.pool` (m): the band's dose falls smoothly from its floor (`at` y + `shape.y0`) to nothing `pool` m up.

`KHAZ.moveAt(rec, x, z, t, y)` (one record: `{speed, sink, slip, pull: [vx, vy, vz], k}`, null outside), `KHAZ.drift(x, z, t, y,
T)` (every record at a point: paces multiplied, sinks summed, the worst slip, pulls summed, `by`), `KHAZ.poolK(rec, y)`. Once
the file is loaded, `KHAZ.at`, `dose`, `doses`, `here` and `exposure().step` take the pooled share (`KHAZ.FLOW` is true); a
record without `move.pull` or `shape.pool` answers exactly as before (`test-hazard-flow.js` reads one registry at 8 points
and 5 times before and after loading it). With no `y` the pool is not applied (a plan view). Both fields ride in the export's
filled `hazard`.

### Adopting it

1. `build.py`: list `core/hazard/21-core-hazard-flow.js` after `20-core-hazard.js`.
2. The in-breath at a throat: `{kind: 'grab', danger: .7, falloff: 'linear', shape: {type: 'cyl', r, h, y0: -depth}, move:
   {speed: .5, pull: 1.2, to: [0, -depth, 0]}, stateFn: 'GILLS.suck'}`, with `KHAZ.STATES['GILLS.suck'] = (rec, h, t) =>
   ({state: k > 0 ? 'drawing' : 'still', k, on: k > 0})` and `k = 1 - GILLS.breath(t)` (the in-breath is the breath's low).
3. A sump: `{kind: 'gas', danger: 1, falloff: 'none', shape: {type: 'poly', pts, h: 4, pool: 2}}` at the floor's height.
4. The walker each step: `const D = KHAZ.drift(x, z, t, y)`; its pace times `D.speed`, plus `D.pull` times dt.

## Crusts, night and fronts (`22-core-hazard-env.js`, opt-in, 2026-11-09)

The biome plans of 2026-11-09 asked for three things 20 cannot write as a plain record. A crust is harmless until it
breaks and then stays broken (a `trigger` is harmful until tripped, then resets). Gas and cold air pool at night and in
still air (a `cycle` runs on a hashed or authored phase, not the world clock). A flood or a herd travels a path. Each is
a state function in `KHAZ.STATES`, named by the record's `stateFn`, plus a field on `tags.hazard`. The fields are checked
at first read: an unknown or bad field throws, naming the record, and a field without its `stateFn` (or the reverse)
throws too. They ride in `KHAZ.of`, `KHAZ.make` and the export's filled `hazard`. A record without them answers bit for
bit as before: `test-hazard-env.js` reads one registry at 10 points and 6 times before and after loading 22, with and
without 21.

- **A crust** (twins, opalvalley, firebliss, godshearth, neouterwall: sinter over boiling water, a pahoehoe blister over
  a lava pond, opaline crust over mud pots). It is two records at one `at`:
  - The crust: `stateFn: 'KHAZ.crust'`, `crust: {mass (kg, 60), heal (s; null = it stays broken)}`. It is `intact` (k 0,
    `warn`: its tell, a hollow sound, still shows) until it breaks, then `broken` (k 1, with `left` while it heals).
  - The harm below: `stateFn: 'KHAZ.under'`, `under: {crust: <the crust's id>}`. It is `held` (k 0) while the crust
    holds, then its own state (steady, or its cycle) with `crust: 'broken'`.
  - `KHAZ.load(rec, mass, t)` is true when this load broke it (mass >= `crust.mass`). `KHAZ.trip(rec, t, mass)` on a
    crust does the same (its `trigger: {by: 'weight', mass}` must agree with `crust.mass`; a step or near trigger breaks
    it with no mass); on any other record it is 20's trip.
  - `KHAZ.mend(rec | id)` (and `KHAZ.rearm`) makes it whole. Which crusts broke and when is page state by id, as trips
    are: `KHAZ.saveCrusts()` gives `{format: 'krator-hazard-crusts', version: 1, broken: {id: {t, heal}}}`, and
    `KHAZ.loadCrusts(s)` takes it back (a saved game).
- **Night air** (neouterwall, godshearth, midbasin, greatchasm, firebliss, twins): `stateFn: 'KHAZ.night'`, `night:
  {from (19), to (6), ramp (2 h), still (1 m/s), calm (4 m/s), base (0)}`.
  - It builds over `ramp` hours after `from` and drains over `ramp` hours after `to` (smoothsteps). The wind takes it
    away: all of it at `still` or less, none at `calm` or more, a smoothstep between.
  - `k = base + (1 - base) x night x wind`, times the record's cycle's k when it has a `cycle`.
  - The hour comes from `KHAZ.bindClock(C)`: a KCLOCK clock (it reads `C.hour`) or `fn(t) -> hour`. With none bound, a
    night record throws, naming the call.
  - The wind comes from `KHAZ.bindWind(fn(x, z, t) -> [vx, vz] | m/s)` or a fixed speed. With none bound the air is
    still. core/atmos's slope wind goes in as a function.
  - **The cold-air pool** is a `cold` record on `KHAZ.night` with 21's `shape.pool`.
- **A front** (`stateFn: 'KHAZ.front'`, `front: {path, w, speed, start, period, rise, hold, fall, depth, base, len,
  edge}`): one law for the gorge flood (firebliss, midbasin, outlandgate, paintedhighlands, wouterwall) and the charge
  (labyrinth). The law is written out in the fragment's header, and core/water's `62-core-water-flood.js` draws the
  same water from it: change both or neither.
  - The path is in world metres, with y the bed. `s` (the arc length to the nearest point), `q` (the distance off the
    path) and `L` are all in plan. It is inside when `q <= w`; then the record's own shape and falloff apply as usual.
  - **A flood** (no `len`): a pulse runs down the path at `speed`: `rise`, `hold`, `fall` s, with peak depth `depth`
    over `base` standing water.
    - Its k at a point is `fk`. Given a height y it is `smoothstep(0, .3, level - y)`: a walker in the water takes the
      dose, one above its surface takes nothing.
    - The height comes from `KHAZ.at`, `dose`, `doses`, `here`, `exposure().step`, `time`, `timeScale`, `state`'s sixth
      argument, and 21's `moveAt` and `drift`. Without y it is the plan k.
    - `KHAZ.floodLevel(rec, x, z, t)` is the surface's y (null off the path). The states are `dry` (or `standing`),
      `rising`, `high` and `falling`.
  - **A charge** (`len`): a band `len` m long runs down the path, its edges soft over `edge` m. The states are `coming`
    (with `left`), `charging` and `passed`. `charge: {fauna: id | [ids]}` binds it to the herd's fauna, as `hunter.fauna`
    does. `KHAZ.bindHerd(rec, fn(t) -> [{x, z, r}...])` hands it the live herd the host animates; bound, "inside any
    disc" replaces the law.
  - `KHAZ.frontAt(rec, x, z, t)` gives `{s, q, inside, k, level?, bed?, v?, head?, herd?}`.
- **The builders**, `KHAZ.ENV` (`o` overrides any field):
  - `crust(ptsOrR, {id, mass, heal, below, depth, crust, under})` returns `{crust, below}`.
  - `nightGas(ptsOrR, o)` and `coldPool(ptsOrR, o)` return a body.
  - `flood(path, o)` and `stampede(path, o)` return `{at, hazard}`, a box round the path grown by `w`; register it with
    `ry` 0. A flood's nav is walkable at a cost (`travel` 2), not avoided, so paths still cross a dry gorge.
  - `rockDrop(r, {fauna})` returns a crush on a `near` trigger with the dropper's fauna (a Two-Snout's rock): the host
    trips it and applies its doses once.

### Adopting it

1. `build.py`: list `core/hazard/22-core-hazard-env.js` after `20-core-hazard.js` (and after `21-core-hazard-flow.js`
   when the page takes both: 22 then carries the height into 21's `moveAt` and `drift`).
2. A crust over a hot spring: `const B = KHAZ.ENV.crust(r, {mass: 60, below: 'heat', under: {danger: .9, dose: 3}})`.
   Register the crust (`tags: {hazard: B.crust}`), set `B.below.under.crust` to its id, then register the below at the
   same `at`. When a walker steps on it: `KHAZ.load(crustRec, walker.mass, t)`; draw it broken while
   `KHAZ.state(crustRec, t).state === 'broken'`. A save keeps `KHAZ.saveCrusts()`.
3. Night gas in a hollow: `tags: {hazard: KHAZ.ENV.nightGas(pts, {pool: 1.5})}`, and once on the page
   `KHAZ.bindClock(clock)` (the host's KCLOCK) and `KHAZ.bindWind((x, z, t) => wind)` when the page has a wind field.
   A cold-air pool on a valley floor: `KHAZ.ENV.coldPool(pts, {h: 8, pool: 6})` (take 21 for the pool).
4. A gorge flood: `const F = KHAZ.ENV.flood(path, {w, speed, rise, hold, fall, depth, period})`; register a record at
   `F.at` with `tags: {hazard: F.hazard}`. Pass the walker's height to the queries. The drawn water reads the same
   `front` (core/water's flood).
5. A stampede: `KHAZ.ENV.stampede(path, {fauna: 'twosnout', speed, len, period})`, registered the same way. When the
   herd itself is animated: `KHAZ.bindHerd(rec, t => herd.discs(t))`. A Two-Snout's dropped rock is
   `KHAZ.ENV.rockDrop(r, {fauna})` under its ledge.

## Tests

`node core/hazard/test-hazard.js`, `node core/hazard/test-hazard-flow.js` (the pull and the pool), `node core/hazard/test-hazard-env.js` (crusts, night, fronts: on 20 + 22 and on 20 + 21 + 22, with broken variants of the laws), `node core/biome/test-traps.js` (the clock), `node core/walk/test-walk.js` (zones),
## The tunnels' kinds (`22-core-hazard-tunnel.js`, opt-in, 2026-11-11)

The Line (`biomes/line/PLAN.md` section 6, the owner's answer 13; `openworld/ANCIENT-TUNNELS.md` section 4). **Opt-in by
file**: the three rows are not in core/tags' vocabulary (that would change every page); the file adds them to
`KTAGS.VOCAB.hazardKinds` the first time any `KHAZ` function runs, so it may sort before core/tags. A page that does not list
it is byte-identical; on a page that does, every older record answers as before (`test-hazard-tunnel.js` reads a registry
before and after loading it).

Each kind runs on a state function, so **write its record with the builder** (it names the function and fills the
defaults; any field of `o` overrides). `KHAZ.tunnelAudit(T)` lists a record of these kinds written without its function, or
with a bad field: make it a verify check.

| Kind | Effect | Row | Builder | What it does |
|---|---|---|---|---|
| `rockburst` | damage | danger 1, dose 20, walkable (travel 2): the trains run through | `KHAZ.TUNNEL.rockburst({shape, cycle, burst: {cell 40, throw 6, spall [.05, .4]}})` | a crush on a cycle (default 30 min): rock talk 12 s (warn, k 0), the burst (.4 s rise, 1.6 s), falling slabs 40 s (k .25), quiet. Each period bursts in **one cell** along the shape's long axis (`KRAND` by the period's number) and harms only within `throw` m of it |
| `inrush` | drown | danger .9, dose .5, travel 6 | `KHAZ.TUNNEL.inrush({shape, cycle \| inrush: {at}, inrush: {depth 3, deep 1.4}})` | karst water breaks in: the rock sweats (warn 90 s), the water rises over the ramp (240 s) to `depth` m over the shape's floor, stays (15 min), drains, leaves a pool (k .15), dry; or once at `inrush.at` and flooded for good. At a point, k is the water over the feet over `deep` |
| `seal` | suffocate | danger 1, dose 1 | `KHAZ.TUNNEL.seal({shape (the section), seal: {door, inside 1, outside .05 \| fn(t), bleed 40, refill 900, fail, events}})` | the section behind a door: while the door is open its air relaxes toward the surface it reaches (e-folding `bleed` s), shut it refills (`refill` s); k is the `thin-air` ambient row's ramp of that pressure. The door's openness: a bound function (`KHAZ.bindDoor(rec, t => open)`, integrated live by `KHAZ.sealStep(t, dt, T)` each frame), else the page's `KHAZ.breach(rec, t, open)` / `KHAZ.reseal(rec, t)` and the record's `seal.events`, else `seal.fail` (a cycle whose k is how far it stands failed) |

- `KHAZ.burstAt(rec, t)`: `{n, cell, cells, x, z, t0, state}`: where this period bursts and when.
- `KHAZ.spalls(rec, t, n)`: the last n bursts begun by t, newest first, each `{n, t, cell, x, z, along, side, up, spall}`: where a
  host draws fresh spalls on the lining (the same hashes every time: the Line's `hotdoor` station's scars).
- `KHAZ.flood(rec, t)`: `{state, level, y, k, left}`: the water's height for a `WATER.open` plane.
- `KHAZ.pressure(rec, t)`: the section's atm now.
- Once loaded, `KHAZ.at`, `dose`, `doses`, `here` and `exposure().step` take an inrush's water over the point (as 21's pool share;
  with no `y`, the level over the floor). The export adds each tunnel record's own fields as `hazard.raw`.

## Tests

`node core/hazard/test-hazard.js`, `node core/hazard/test-hazard-flow.js` (the pull and the pool), `node core/hazard/test-hazard-tunnel.js` (the tunnels' kinds), `node core/biome/test-traps.js` (the clock), `node core/walk/test-walk.js` (zones),
`node core/tags/test-tags.js` (the key, the label; the export digest moved with the vocabulary: 5ee8e4c7, then f8fc8840
with lava, fire, luck, trap, time, the taboo key, the ambient rows, acid rain and the dust storms). test-hazard checks the new kinds against a stub of `KFIRE.run`'s contract, and
against the real `KFIRE.run` cell for cell once `core/biome/38-core-fire.js` is in the tree (it says `skip` before then),
`node core/export/test-export.js` (the registry's hazards, and the hazards section).
