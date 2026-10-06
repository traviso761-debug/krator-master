# Mungo — notes, round by round

## Round 1 (2026-10-05): the first build

**What was made.** The world (terrain, horizon, layout, placement, the reed village through the wrapped Reed Lake
kit, the Geomancers' grid, firelight, the biome), the simulation core `core/simulation` (Phase 1 of its PLAN.md, with
`test-sim.js` and `SCHEMA.md`), Mungo's world data (`world/*.json`) and its embodiment. In parallel, by four helper
agents working to briefs in `briefs/`:
- **A** Reed's Local (`rl_tavern`, `settlements/reedlake/src/81-rl-tavern.js`) and the Reed Lake interiors set
  (`kits/interiors/sets/reedlake.js`, 29 defs) with five new reedlake catalog pieces;
- **B** the Motor Vehicles kit (`kits/motor-vehicles/`) and its first vehicle, the Geomancer dune buggy;
- **C** the Builders' yard (`abyss_shop_builder`) in the Eastern Abyssal kit, with six catalog pieces;
- **D** the Yuni interiors set (`kits/interiors/sets/yuni.js`, the six middle-class houses, every variant).

**Decisions worth keeping.**
- *Share, do not fork.* Mungo reads Locus's fragments by name and overrides only its own world; the reed kit is
  read from `settlements/reedlake/src`. Two engines in one page work when the second is wrapped in ONE function in
  its own `<script>` before the strict `BUILD()`: no global meets another, and the kit's own registry, materials and
  builders run unchanged. The glue that runs inside it (`src/reed/`) returns the API.
- *The reed village is a reed def* (`mungo_reed_village`, registered by the glue) drawn from the layout's records:
  the kit's own `buildRLVillage` recipe on Mungo's data, so `hnSub` and the kit's frames work as designed.
- *The world clock drives everything.* `MCLOCK` (`core/clock`) sets the sky's hour each frame; SIM reads it; the
  clock is held by default and Run time runs it at 72 minutes a day. Motion time keeps running while held, so trips
  finish; schedules only change while time runs.
- *Decisions step, motion is a pure function of time* (PLAN.md 4.5): `SIM.pose(actor, t)` from legs baked at
  decision time; no runtime avoidance.

**What bit, and the fix.**
- *Instanced colours black.* three r128's `setColorAt` sizes `instanceColor` from `mesh.count`; setting `count = 0`
  before the first `setColorAt` made a zero-length buffer and every person rendered black. Allocate
  `instanceColor` at full capacity first (`84-mungo-life.js`, `IM()`).
- *Inspector blind to a sub-scene.* Locus's picker reads only `scene.children`; the reed kit's meshes hung in groups.
  Lift every mesh into the scene with `scene.attach()` (world transform kept) after the kit bakes.
- *The biome's water species follow depth, not the mask.* Shallows 260 m wide filled the lake with stilt-woods and
  lily pads. A 50 m fringe of shallows, then three metres where the islands are anchored.
- *A headless probe cannot see inside `BUILD()`.* `MCLOCK`, `MARKET`, `scene` are locals: use `_dbg`, `_api`, `_sim`,
  `_life` (and `_dbg.scale(k)` to run the clock k times faster for a time-lapse).
- *`tools/audit_port.py` rewrites every build's PORT.md* even when given a folder (and `--help` is taken as "no
  folder"): call `audit_port.audit(build, False)` from Python for one build.
- *A hidden browser pane throttles `requestAnimationFrame`* to about one frame a second; KCLOCK caps a step at
  0.1 s, so a time-lapse there crawls. Time-lapse in the headless verifier, or with the pane showing.

**Measured** (real GPU, the in-app browser): 60 fps at 9:00 over the market, 284 draw calls, 8.3 M triangles before
LOD; headless (SwiftShader) all 19 world invariants pass, 424 draw calls against a budget of 459 (Locus's 190 plus
the reed kit's own). Life: 515 residents; at 9:00, 194 moving, 26 boats out; at 21:30, 259 asleep, 88 drinking; in a
time-lapse from 9:00 to the next morning: three buggy trips, two nomad bands (in, stabled, lodged, out by another
edge), four caravans (in as columns with their pack lizards, stabled, trading, lodging, leaving by the other
highway at 7:00), no route failures.

## Round 1b (2026-10-05): the marsh at the mouth

The owner asked for "an extensive marsh with reeds at the river mouth". `marshK(x,z)` (a fan round the mouth, the
river's banks, the south shore) blends the ground to `marshH` (just above the water, pools and channels below it)
before the river is carved and before any site is levelled, so the town's sites and the river keep their own
ground. The reed beds are the Reed Lake kit's living reed, planted by the glue from `REED_BEDS` in the same kit pass
as the village (one InstancedMesh for all ~30,000 stems). Roads and tracks that cross get a causeway: `CAUSEWAYS`
segments raise the ground under them, applied before the river so a bridge still spans the channel. The biome's
mask drops to a quarter in the marsh, so a few trees stand in the reeds. The fields' own test (dry, level ground)
moved them off the marsh with no other change; two farms boxed in by the marsh and the other fields get a straight
lane to the nearest street, which the causeway pass then raises.

Life: `CUT_REED` at four reed-cutting grounds at the marsh's edge (`REEDCUT`, each by a street or track); a new role
`reed_cutter` (10, reed folk) and the weavers' first two hours; the reed is delivered to the weavers' workshops, the
reed warehouses and the builders' yard. The shore fishers' spots moved up the north shore and onto the marsh's edge.
