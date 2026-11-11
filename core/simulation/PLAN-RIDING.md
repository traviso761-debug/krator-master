# Riding: people and cargo aboard moving vehicles (plan, 2026-11-11)

The owner, 2026-11-10: "we do need to add functionality for people and cargo to ride them" (the Line's trains); and
2026-11-11: "riding in its own session". This plan shapes `kits/tungang/PLAN.md` section 0.2.1 (on
`claude/tungang-fellgang-kits-a56ece`) into work. **Status: a proposal. No code is written.** Section 9 holds the
questions for the owner.

**Why this file sits in `core/simulation`.** Most of riding is the simulation's: the ride leg, the journey across
segments, capacity, cargo, the rail carrier, the porters, the export and the Godot replay. The other parts (floors that
ride in `core/walk`, the player's carry in `core/host`, the car doors) are small and serve the same records, so one plan
beside `PLAN-MONEY.md` and `PLAN-POLITICS.md` keeps them in step. Each module's own README gets its part when built.

## 0. What exists, and what is missing

| What | Where | What it gives riding |
|---|---|---|
| Floors, strips, polygons and blocks; `setBlock` switches a block (a door) | `core/walk` (`KWALK`) | everything a car's interior needs, but every record stands still |
| An opt-in walk extension in a subfolder | `core/walk/box` (`KWALKBOX`) | the pattern for an extension a page lists only when it wants it |
| Motion as a function of time: tasks of legs, `SIM.pose(a, t)`, the motion export, `KSim.pose` in Godot | `core/simulation` 5, 8; `ksim.gd` | the place a ride leg goes; the golden-trace machinery (Dhelv, isle demo) |
| Transport routes: stops, a timetable laid out offline, `SIM.vehiclePose(id, k, t)` a pure function | `77-sim-5r-routes.js` (Voth's ferries and striders) | the vehicles move; **nobody boards them** (`SIM.board`, PLAN.md Phase 2 step 5, was never built) |
| `SIM.trade({line})`: a trade carrier bound to a transport's vehicle k | `77-sim-6-trade.js` | goods ride as counts in a carrier's load, not as records |
| Group events with itineraries (`legs`, `spread`), Dhelv's porters | `77-sim-3-actors.js`; `settlements/dhelv` | the porters' walk across a gap |
| `KSCHED.timeline({period, phase, segments})` | `core/sched` | a train's s(t), dwells included, as data |
| Doors as records, leaves posed, walk blocks switched | `core/door` (`KDOOR`) | the car door's leaves; its state is stepped, not a function of time |
| The host's walker (`C.stand`, `C.walkAt`) | `core/host/90-host-camera.js` | the player's feet; nothing carries them |
| `KTRANSIT.train` (cars placed at rest along a rail) | `kits/ancient-transit` on `claude/ancient-transit-2600a6`, not merged | car sizes and frames; the `line` kind is the Line session's |

**Missing**: floors that move; a leg whose pose is a vehicle's; boarding inside a door window; capacity; a journey
planner over timetables; cargo as records with a conservation ledger; carry for the player; the Godot twins of all of it.

## 1. The rules this plan keeps

- **Opt-in by inclusion, so every other page stays byte-identical.** Five builds (the sim example, both isle demos, Voth,
  Longsong) glob `core/simulation/77-sim-*.js`, so a new `77-sim-*` file would change their pages. Riding's code goes in
  **subfolders**, as `core/walk/box` does: `core/walk/frame/`, `core/simulation/ride/`, plus one opt-in host fragment.
  No existing core file is edited; the new fragments extend the shared objects (`KWALK`, `SIM`) when a page lists them.
  `tools/port_baseline.py` must read every page `same` after each phase.
- **Engine-neutral data** (`[G data]`): no three.js, no DOM, in `frame/` and `ride/`; stable ids; motion a pure function
  of time; decisions stepped by `SIM.step` from `SIM`'s seeded RNG; any per-rider draw from `KRAND` by (world, rider,
  run, salt), never by draw order.
- **Not a new core module.** These are extensions of `core/walk`, `core/simulation` and `core/host` (question 1 asks the
  owner to confirm). Nothing here writes a camera, a PRNG, a nav or a walker of its own.
- **The Line session owns the Line**: the `line` kind, its tracks, timetables, trains and cars (section 3). Riding reads
  them through an agreed hook and never edits their files; until they exist, the test page uses stand-ins of the same
  shape.

## 2. Floors that ride: `core/walk/frame` (`KWALKFRAME`)

A **frame group** is an independent `KWALK.create()` registry in a vehicle's own frame, plus a pose function. The car's
floors, aisles, seats' blocks, walls and door blocks are registered once, in car coordinates, with the calls every kit
already uses. A world lookup takes the point into each frame at the current time, asks that frame's registry, and brings
the answer back.

```js
const F = KWALKFRAME.frame(KWALK, { id: 'line3.t1.car4', pose: t => ({ x, y, z, yaw, pitch, roll }), r: 9 });
F.walk.floor({ rect: [-1.3, 1.3, -6.5, 6.5], y: 1.1, name: 'saloon' });     // car coordinates (+z forward, +x side +1, y up)
F.walk.block([-1.5, -1.3, -6.7, 6.7, 0, 3.2], 'wall');
const door = F.walk.block([1.3, 1.5, -0.6, 0.6, 1.1, 3.1], 'door');
const sill = F.floor({ rect: [1.3, 1.6, -0.6, 0.6], y: 1.1, off: true }); // a switchable floor: the step plate
KWALKFRAME.at(KWALK, t);                 // the clock every wrapped lookup reads (the host's frame time, or SIM's motion t)
KWALK.floorsAt(x, z); KWALK.floorBelow(x, z, y); KWALK.blocked(x, y, z); KWALK.push(x, y, z);   // static + every frame
KWALKFRAME.carry(KWALK, [x, y, z], t0, t1)   // the moving platform: a point standing on a frame floor at t0, where it is at t1
KWALKFRAME.toLocal(F, p, t); KWALKFRAME.toWorld(F, p, t);
KWALKFRAME.export(KWALK)                     // {format: 'krator-walk-frames', frames: [{id, floors, blocks, source}]}
```

- **Wrapping.** `frame()` wraps the instance's four lookups the first time it is called; until then the registry is
  exactly as it was. Answers from a frame carry `rec.frame = F`, so a caller knows the walker is aboard.
- **The transform.** The pose is a full rotation (yaw, then pitch, then roll); the plan view of `blocked` and `push`
  works in the frame's yawed plane, which is exact for yaw and holds for pitch and roll under 0.1 rad (the Line's grades
  are 4 % at most; a ship's roll is a later question). The frame asserts `|pitch|, |roll| < 0.1`.
- **Cost.** A frame is skipped when the point is outside its bounding circle `r` at time t: a page with forty cars pays
  forty circle tests a lookup.
- **Switching.** `setBlock` already switches a block; `F.floor({off})` and `KWALKFRAME.setFloor(rec, on)` add switchable
  floors inside a frame only (the static registry is untouched): the step plate across the platform gap exists only while
  the doors are open, so a walker on the platform edge is not swept off by a passing train.
- **Carry.** `carry` finds the frame floor under the point at t0, holds the point fixed in that frame, and returns its
  world position at t1 (and the frame's yaw change, for the camera). A walker on a static floor is returned unchanged.
- **Reach.** A car's interior is audited in its own frame: `F.walk.reach(doorSteps)` (every seat and bay reached from a
  door), with no change to `reach`.

## 3. The hook with the Line (`KTRANSIT`'s `line` kind: the Line session's)

Proposed to the Line session (`the-line-biome-train-and`, 2026-11-11); its answer is recorded here when it comes.

1. **Track.** Each track of a segment gives a route in the simulation's shape, `{pts: [[x, y, z]...], cum, len}`, along
   the rail head, so `SIM.at` and `KSim.at` evaluate it on the page and in Godot.
2. **Timetable.** A train's head position s(t) is a `KSCHED.timeline` export: segments of s along its track's route; a
   dwell is a segment without `to`, named `stop:<stopId>:<side>` (+1, -1 or 0 for both sides' doors).
3. **Car pose.** `carPose(train, k, t) -> {x, y, z, yaw, pitch, roll}` by a fixed formula Godot twins in a few lines:
   car k's middle at `s(t) - off_k`, its bogies at `± b_k` along the route, the origin at their midpoint on the rail head,
   yaw and pitch from the rear bogie to the front one. Frame axes as `KTRANSIT.frame`.
4. **Interior and capacity** (on the car's record in the vehicles kit; the owner's round-2 shape): `cap: {seats, stand,
   slots}` and `interior: {floors, blocks, doors: [{id, side, at, w, h}], seats: [{id, at, yaw}], stand: [rects], slots:
   [{id, kind, size, at}]}`, all in the car's frame.
5. **Stops.** `{id, track, s, side, floor, gap}`: where a dwell's doors meet a platform's floor.

**The door window** is read from the timetable: open from a dwell's start plus `doorLag` (4 s) to its end less
`doorClose` (6 s), on the dwell's side. A car door is a `KDOOR` record in the car's frame (`slide` or `biparting`) whose
openness the host sets from the window each frame, instead of `KDOOR.step`; its walk block lives in the frame's
registry and is switched by the same window. Whether that needs an opt-in `KDOOR.drive(D, open(t))` or only a host
call is settled when the door is built (it touches `core/door` only if a record must say it is driven).

Riding is generic: any vehicle that can give a pose function, a door window and a capacity is a **ride source**
(section 4). A `SIM.transport` route is wrapped as one (`SIM.vehiclePose`, yaw only) for Voth's ferries, the isle demo's
ships and, later, the Valley's trams and the caravans' wagons.

## 4. Riders: `core/simulation/ride` (`SIM.ride*`)

### 4.1 Ride sources

```js
SIM.rideSource({ id: 'line3.t1', kind: 'train', cars: [{ k, pose: t => ({...}), cap, interior }],
                 timeline,             // the KSCHED export (or `windows(t0, t1)` for a source with no timeline)
                 stops: { stopId: { at: [x, y, z], floor, side, door: {k: [doorIds]} } },
                 doorLag: 4, doorClose: 6 })
SIM.rideFromTransport(routeId)        // a SIM.transport as a ride source: one car per vehicle, its deck as the interior
SIM.rideRuns(sourceId, t0, t1)        // [{run, from, to, depart, arrive, open: [t, t]}]: every hop between two dwells
```

A **run** is one hop of one train between two dwell stops, identified by `(source, cycle, segment)`: the unit capacity
is counted in.

### 4.2 The ride leg (one addition to a task's legs)

A leg may carry `frame: {source, k}`: its route is then in that car's frame and its pose is the car's pose applied to
the point along it. So **one** new idea covers every phase of riding:

| Phase | Leg |
|---|---|
| walk to the platform | an ordinary leg (the nav graph) |
| wait for the train | an ordinary leg of length 0 at the waiting spot (its `dur` the wait) |
| board | a walk from the platform spot to the door, ending inside the door window (the car stands still: a world leg) |
| find a place | a frame leg from the door to the seat or standing spot (in car coordinates: it stays right as the car moves off) |
| ride | a frame leg of length 0 at the seat, lasting until the alighting stop's door window opens |
| alight | a frame leg seat to door, then a world leg door to platform |
| walk the gap | an ordinary walk leg (the cavern between two segments, on the nav graph like any other) |

`SIM.pose` is wrapped by the ride fragment: a leg with `frame` is posed through it, every other leg exactly as now
(`mode` `'ride'`, `hidden` false through the windows of a saloon, true in a sealed van). `SIM.vehicleAt` reads the
source and car off a frame leg, so a rider asked again mid-ride is planned from its seat.

### 4.3 Journeys

```js
SIM.journey(actor, { to: placeId, depart: minute }) -> task   // walk, wait, board, ride, alight, walk ... arrive
SIM.journeyPlan(from, to, t) -> [{kind: 'walk' | 'wait' | 'ride', ...}]   // the plan alone (an inspector, a test)
```

The planner is a **connection scan** over the runs: deterministic, a few hundred lines, and the standard way timetables
are searched. Its walk links are the nav graph's routes between stops and places (the gap walks among them, timed by
the route's length at the actor's speed); its ride links are the runs with free capacity. It returns the earliest
arrival, ties broken by fewer changes, then by stop id.

**Capacity** is counted per run and car: seats first, then standing room, then the next train. Boarding order within a
run is by decision minute, then actor id, so a replay boards the same riders. A full train is logged (`rideFull`).

**Who rides, in the resolver.** Phase R2 gives explicit journeys (an event's itinerary leg `{ride: true, to}`, a
`SIM.command`, a role's `prefers` with `via: 'line'`, the way `via: 'boat'` works today). A role choosing the train by
itself, when its walk would be longer than the journey, is phase R6.

## 5. Cargo, the rail carrier and the porters

- **A consignment is a record**: `{id, kind, qty, owner, from, to, at}` where `at` is its holder now: a place's store,
  a car's slot (`source:k:slot`), a group (porters carrying it), or `delivered`. Ids are stable (`cg.<from>.<n>`).
- **The rail carrier.** A train is a carrier: at a dwell, consignments bound beyond the stop are loaded into free slots
  of the right kind and size (bays, the tank car's water, the ice wagon's blocks), unloaded at their stop, in id order.
- **Porters across a gap.** A consignment unloaded at a gap station waits there until a porters' group (Dhelv's group
  event: an itinerary from this gap station to the next segment's, `spread` 0 or pairs) takes it: the group's `carry`
  limit in kg or units, its members walking the gap leg; at the far station it waits for the next train. The group fires
  when goods wait (or on a timetable), not by chance.
- **The ledger.** Every move is logged (`load`, `unload`, `porter`, `deliver`) and `SIM.cargoCheck()` sums each kind by
  holder: what entered equals what is held plus what was delivered, at every step.
- **Joining the economy** is a later phase (question 4): a delivered consignment lands into the destination's store as
  an import under the books' contract (SCHEMA.md "The books"), and `SIM.trade` routes over a ride source make their
  loads consignments instead of counts.

## 6. The player: `core/host` (one opt-in `[web]` fragment)

`core/host/95c-host-ride.js`, listed by a page that has frames: each frame, before the walker stands, `KWALKFRAME.carry`
moves `C.walkAt` and the camera's target by the frame's motion since the last frame and turns the view by its yaw change
(the follow camera stays behind the player in the car's frame). Boarding is walking through an open door; E at a seat
sits (the seat's pose through the frame), E again stands. The minimap and the probe see the car's floors through the
wrapped lookups. Pages without the fragment are unchanged.

## 7. Godot

- **Cars**: each car an `AnimatableBody3D` (`sync_to_physics`) moved by the twin of `carPose` from the exported track
  route and timeline; its floors and blocks from `KWALKFRAME.export` as its children. The player's `CharacterBody3D`
  rides it by the platform velocity Godot applies to a body standing on an `AnimatableBody3D`.
- **Doors**: a `NavigationLink3D` per car door and stop, enabled by the door window; the leaf posed as in the page.
- **Riders**: `kride.gd` beside `ksim.gd` (synced by `godot/tools/sync_core.py`): the `KSCHED.timeline` twin (`at`,
  the eases), `carPose`, and the frame leg in `KSim.pose`. The motion export gains a `frames` block (each source's
  route index, timeline, car offsets and bogies) and legs carry `frame: [source, k]`.
- **The golden trace**: the page's poses of riders, cars and consignments' holders at fixed times, replayed by a
  headless Godot test to the same numbers (as `dhelv_sim_test.gd`).

## 8. Checks (each with its negative), the test page, the phases

**The test page** (question 3): `core/simulation/ride/lab/` builds `dist/ride-lab.html`, a stand-in Line: two segments
of a two-track gallery joined by a walked gap cavern, a three-car train shuttling on each segment, two platforms a
segment, stand-in cars of the hook's shape (boxes, the interiors' floors and seats). The player walks, boards, rides and
alights; about forty NPCs on journeys across the gap; porters carry cargo across it. It is swapped to the Line's
`line` kind and cars when those are merged, and then becomes a station of the Line's biome or stays as the lab.

| Check | Negative control |
|---|---|
| every rider's pose stays on a car floor for the whole ride (sampled each second, through `floorBelow`) | a rider planted 0.5 m above its seat fails |
| a carried walker keeps its car-local position over a run (drift under 1 mm) | a walker carried with the pose a second late fails |
| boarding and alighting legs cross the door only inside its window | a boarding moved into the run fails |
| no car exceeds its seats plus standing room on any run | a run loaded one over fails |
| the door's walk block and step plate follow the window (blocked moving, open at the dwell) | the block left on at a dwell fails `reach` from the platform to a seat |
| every car's seats and bays are reached from a door in its frame (`F.walk.reach`) | a seat walled off is reported unreached |
| a journey with a ride, a gap walk and a second ride arrives when the planner said | a timetable shifted 60 s after planning is caught |
| cargo is conserved through every transfer (sum by kind by holder) | a consignment dropped at the gap fails |
| the porters' gap legs complete and the cargo meets the next train | a porter group with no route is reported |
| determinism: two loads give the same trace hash | |
| the Godot replay matches the golden trace (positions within 1 mm) | a trace with one rider moved fails |
| every other page is byte-identical (`tools/port_baseline.py`) | |

**Phases** (each its own commit; push nothing; the owner decides merges):

| Phase | What | Done when |
|---|---|---|
| R0 | this plan, the Line's hook agreed | the owner approves |
| R1 | `core/walk/frame` and `test-walk-frame.js` | the walk checks pass with their negatives; `node core/walk/test-walk.js` unchanged |
| R2 | `core/simulation/ride`: ride sources, frame legs, journeys, capacity; `test-ride.js` | the rider checks pass; `test-sim.js` unchanged |
| R3 | cargo, the rail carrier, the porters | the cargo checks pass |
| R4 | the host fragment and the lab page, `verify.py --assert` | the page shows the walker riding through a door window, the NPC journey with a gap walk, cargo across the gap |
| R5 | `kride.gd`, the export's frames block, the Godot cars and the golden-trace test | the replay matches |
| R6 (later) | the resolver choosing the train; cargo joined to the economy; ferries and ships as ride sources; the swap to the Line's kind and cars | as each user needs it |

## 9. Questions for the owner

1. **Where it lives**: as opt-in extensions in subfolders of the modules that exist (`core/walk/frame`,
   `core/simulation/ride`, one `core/host` fragment), not a new core module. Right?
2. **The timetable as a `KSCHED.timeline`** (s along the track, dwells named by stop and side), so the page, the
   simulation and Godot read one shape. Right? (The Line session is asked the same.)
3. **The test page** `core/simulation/ride/lab/` with a stand-in Line until the Line's kind and cars are merged?
4. **Cargo**: consignments as records with their own ledger first, joined to the economy's books later (when the Line's
   lojes trade, or the isle demo's ships carry consignments)?
5. **The player**: board by walking through the open door, E to sit and stand; the camera follows in the car's frame.
   Anything else for the hot section's set piece (the doors sealed, the windows plated, the heat on the readout) in
   this phase, or with the Line's biome?
