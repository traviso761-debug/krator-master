# Working on Voth with subagents

The planner holds the world. Subagents hold one fragment each and never see
the whole thing. This file is the rule set that makes that safe, and the
template for the brief a subagent is handed.

---

## 1. The split is by coupling, not by phase

The intuitive split — "layout is big, detailing is small" — is not the one that
saves tokens. The river-mouth fix was expensive because it was a **diagnosis**
problem spanning the water SDF, the terrain carve and every consumer clipped
against `inRiver`. A subagent with less context would have burned *more*
tokens on it, not fewer, because it could not have seen that the quay
revetment loop was the unclipped one.

The test for delegation:

> Can the task be stated as **here is the input, here is the invariant you must
> not violate, here is the check that proves it**?

If yes, delegate. If the task is "work out why this looks wrong", the planner
keeps it, because diagnosis needs the whole map.

### Planner keeps
Heightmap and water SDF · shoreline trace and arc-length addressing · street
grid · canton, compound and zone placement · anything that changes `CANTONS`,
`SPANS`, `ROADS`, `WALL`, `GATES`, `FARMS`, `MANORS`, `ISLES` · any bug whose
cause is not already known.

These share one geometric contract. An edit to any of them moves the inputs of
three or four later passes at once.

### Delegate
Materials and ground texture (`FAMMAT`) · facades: doors, windows, cornices,
awnings, signage · volcano and sky tuning · chinampa size, spacing and density
(`CHINP`) · willow and orchard distribution · islet dressing · building-grain
blocking *within* an already-fixed street grid.

These consume placements and emit geometry. None of them decides where
anything goes.

---

## 2. Rules a subagent works under

1. **Touch only the fragments named in your brief.** `build-manifest.json`
   records a sha1 per fragment; the planner checks it and will see anything
   else you changed.
2. **Read `API.md` before writing a line.** Everything is a global. If you do
   not know a function exists you will write a second, subtly different one.
3. **Never edit `05-palette.js`.** If you need a colour that is not in `PAL`,
   ask. `build.py` rejects colour arrays declared anywhere else.
4. **Never edit layout objects.** `CANTONS`, `SPANS`, `ROADS`, `PIERS`,
   `RBRIDGES`, `FARMS`, `MANORS`, `ISLES`, `WALL`, `GATES` are read-only.
5. **Stay inside your instance allowance** (`BUDGET.perPass`). Each pass is
   individually reasonable and collectively fatal.
6. **Emit through the kit.** `BOX / FR8 / FR6 / FR3 / DOME / CYL / CONE / STK /
   BLOB`, never `new THREE.Mesh`. A new material family is a new draw call and
   needs the planner's approval.
7. **Reserve before you build.** Anything with a footprint goes into the mask
   and the obstacle list first. Every overlap bug in this project came from
   skipping this.
8. **Hoist before you tune.** If you are changing a magic number inside a
   generator, move it into the fragment's params block first (see `CHINP`) and
   change it second. That is what makes the same task cheap next time.
9. **Assert every text edit applied.** A replace that matches nothing is a
   silent no-op; two rounds were lost to fixes that never landed.
10. **Hand back small.** The diff, one `verify.py` line, two or three named
    screenshots. Not your reasoning, not your dead ends.

---

## 3. The loop

```
python3 build.py                     # enforces reseed + palette rules, writes manifest
python3 verify.py voth.html --assert --baseline baseline.json \
        --views "Chinampas,River mouth,Overview" --out ./shots
```

`build.py` fails on: a generative fragment that does not open with
`reseed(N)`, a seed reused across fragments, a colour array outside the
palette, and — **only if Node is installed** — a JS syntax error.

> ⚠️ Node is **not** installed on this machine, so `build.py` prints
> `NOTE: node not found, skipping the syntax check` and then reports
> `syntax OK` **whatever the JavaScript says**. A clean `build.py` tells you
> nothing about syntax. The only real check is the browser, via `verify.py`.
> See *The harness* in §6 — this has cost two incidents.

`verify.py --assert` fails on: a dirty error panel, any of the seven
invariants below, or a budget ceiling.

`--baseline baseline.json` prints the counter deltas against the last accepted
run. **That delta is the hand-off.** It is how the planner checks a subagent's
claim in one line without reading its code.

### The invariants

| check | what it catches |
|---|---|
| `river-holds-water` | a bar across the bed — the pass-2/3 failure, silting the mouth |
| `river-mouth-open` | the mouth closing into a pool behind the shore |
| `river-channel-clear` | anything solid in the channel below deck height that is not a bridge or a river pier |
| `river-docks-dry` | docks under water from confusing `riverHalf` with the channel centre |
| `shore-roundtrip` | a heightmap edit moving the shoreline, which silently invalidates every arc-length constant in `30-layout.js` |
| `cantons-afloat` | cantons aground or fouling each other |
| `built-inside-limit` | built fabric scattered out into the farmland |

Add one here every time a bug costs more than one round to find. A subagent
cannot diagnose what the harness cannot detect, and the whole economy of this
depends on failures being cheap.

---

## 4. Order

Parallelism buys context isolation, not wall-clock: the fragments serialise at
the build step regardless. So run the coupled chain **sequentially** under the
planner —

> heightmap → shore → street grid → placement

— re-baselining after each, and only then fan out wide on the detail passes,
which are all leaves of that tree. Do not parallelise the first pass of
anything: the first pass is where the contract is discovered.

---

## 5. Brief template

```
FRAGMENT     src/NN-name.js            (the only file you may edit)
READ FIRST   API.md, src/05-palette.js
GOAL         one sentence

INPUT        the objects and functions you consume, by name
INVARIANTS   what must still be true afterwards
BUDGET       +N instances, +0 draw calls
FORBIDDEN    the palette, layout objects, any other fragment

DONE WHEN    python3 build.py && python3 verify.py voth.html --assert \
               --baseline baseline.json --views "<your views>"
             passes, and the counter delta is only <what you expect>

REPORT       the diff, the verify line, the named screenshots. Nothing else.
```

### Worked example — chinampa tuning

```
FRAGMENT     src/55-chinampa.js
GOAL         Beds read as densely packed working ground: a canoe apart except
             on the main canals, lying lengthwise against the rim cantons.
INPUT        CHINP (the params block at the top of the fragment). CANTONS,
             SPANS, CAUSEWAYS, PIERS, ISLES, inRiver, shoreIn, S_5, WALL_S0,
             HARB_S0, CIDX are all READ ONLY.
INVARIANTS   no bed in the river channel; none at the port canton or on the
             walled city's quay; beds only where depth is between
             CHINP.depthMin and CHINP.depthMax.
BUDGET       +2,000 instances, +0 draw calls.
FORBIDDEN    rewriting chinDensity's structure. Change numbers in CHINP. If a
             number you need is not in CHINP, hoist it there first.
DONE WHEN    --assert passes and the only counter that moved is _chinampas.
REPORT       diff, verify line, Chinampas + Canton rim + Overview shots.
```

---

## 6. Pitfalls

Each of these cost at least one round. They are listed by what you are doing
when you hit them, not by which file they live in.

### Spatial tests

**Test the object's extent, not its centre.** Every obstacle class in
`chinBlocked()` adds `CHINP.bedL` to its clearance — except the hand-drawn
exclusion zones, which were bare centre-point tests. A bed whose centre fell
just outside a zone still planted stakes 13.5 units inside it, so three
successive rounds of re-traced "delete this area" polygons never finished the
job. If a predicate answers for a point but the thing is a rectangle, sample
the rectangle.

**A symmetric clearance window around an oblique feature is wrong.** Cutting
the Palace parapet ±26 about a bridge landing is right for a deck arriving 23°
off the face normal, and wrong for one arriving at 56°: there the deck drifts
1.47 sideways per unit of radius and presents a **17.8-unit** lateral
half-footprint instead of 9.5, and the symmetric window put a gate pier **3.0
units inside the deck**. Derive the cut from the feature's own projection onto
the axis you are cutting along (widen by `W/|dr|`), not from a margin that
happens to work in the square case. The OBB test caught this; the eye did not.

**Cell-centre sampling is unsafe once clearance is less than half the cell.**
The strider nav grid is 26 units across and the creature's clearance is 12, so
an obstacle could sit in the gap *between* two adjacent open cell centres and
be invisible to both. That manufactured a ford which did not exist — A* ran a
corridor whose finished curve was then rejected at a point 12 units from a
chinampa bed, unfixably, every time. A cell is open only if its centre **and
its four edge midpoints** pass. The boat grid gets away with centres alone
because its clearance is 6 against the same cell; the rule is about the ratio,
not the grid.

**Two rotation conventions exist and look identical in the source.**
`faceToward(x,z,tx,tz) = atan2(-(tz-z), tx-x)` aims the object's local **+x**
at a target. `atan2(dx,dz)` aligns local **+z** along a heading — what a wall
or fence segment wants. Mixing them is a silent 90° error; it has shipped in
the funerary gate, the abbey gate lintel and the chapel door. When a lintel or
jamb looks perpendicular, this is why: check which axis that object's own `ry`
convention makes the long one before touching the geometry.

**A full-footprint slab whose top face sits above floor level *is* the floor.**
The House of Healing's plinth cornice (`outerHW*2*1.11` wide, based at
`y1-1.2`, 2.2 tall → top at `y1+1.0`) sat above both floor finishes and buried
the garden entirely. Two passes were spent on colour before anyone checked the
heights.

**`footing().hi` pins to the highest of nine samples.** Safe while a footprint
covers near-flat ground, badly wrong once it spans real slope — reorienting the
abbey moved its 145×120 footprint onto ground with a 12-unit spread and left
the low corner floating. The midpoint halves the error and trades it for mild
embedding, which reads as hillside construction; it is a mitigation, not a fix.
Per-element ground sampling is the real answer.

**`lifeGroundY()` does not know about every raised surface.** It handles
causeways, bridges, canton decks and piers, and falls through to bare
`terrainH` for anything else — so monks and compound workers stood *below* the
field and garden slabs they were meant to be working, because the abbey sits on
one flat `yb` and the clan compounds sit on `plinth()`. If you put a population
on a precinct with its own floor, give them that floor explicitly. Adding
cases to `lifeGroundY` itself is planner work: half the life layer reads it.

**A constant that needs a scale-dependent fudge is hiding a modelling error.**
The strider stand-in needed `0.15*SCALE + 1.6` of ground clearance, and the
`+1.6` was tuned by eye until it stopped looking buried. The real cause was
that a cart template was being blown up 2.3× about a pivot that was not at
its ground-contact plane. Authoring the creature with `y=0` at its own foot
plane collapsed the whole formula to the plain `+0.15` every citizen in the
city already stands on. When an offset only works at one scale, fix the pivot,
not the offset.

**Curve-parameter offsets are not world-space offsets.** Spacing the ordinator
squads by a flat constant in `t` held them 2.5 units apart at the turnarounds
and blew them 90–130 apart at mid-route, because the smoothstep's slope varies.
Derive the offset from the curve's real length.

### The measuring tools lie in specific, knowable ways

**`landDist()` / `shoreS()` only answer against the main traced shoreline.**
Cantons are platforms standing over open water, so `terrainH` beneath one reads
as sea floor and `landDist` cannot see a canton at all. This produced a
confident, wrong measurement — a dock zone reported as "400–530 units from any
real shore" when the Port canton's cap edge was **29.7 units** away — and three
piers were built freestanding in open water on the strength of it. To ask "is
there something to stand on here", test cantons against their own cap square
(`c.r*1.07`) as well.

**`CANTON_TOPS[n].hw` is the topmost tier's half-width, not the base cap.** An
audit using it read a jetty rooted exactly on the canton edge as 82 units off.

**`openAt()` is `maskAt() > 200`, and the mask is painted black everywhere
beyond `CITY_LIM`.** Out in the wilderness it is false *by construction* — 0 of
72 probe samples open around the quarry sites. Gating placement on it there
places nothing, and looks like a siting problem rather than a tooling one.

**Screenshots are ambiguous; a scene probe is not.** Two passes were burned
arguing from pixels about which of two similar surfaces was green. One
`scene.traverse` reading instance positions, scales and colours in the region
answered it immediately. When a screenshot raises a "which thing am I even
looking at" question, stop looking and measure.

**A diagnostic can be wrong, and a wrong one is worse than none.**
`window._sky.giantPixelWidth()` projected through a background camera that is
only synced during a render, so a headless probe that stepped the clock without
rendering measured the *previous* frame's orientation: it reported **2677 px
for a disc that was really 330**. Nothing about the number looked suspicious in
isolation. Any diagnostic that reads matrices must force the update it depends
on (`updateMatrixWorld`, or the same sync the render path does) and return a
sentinel rather than a plausible number when the thing is off-screen or behind
the camera.

**A test that cannot fail is not a test.** The sky brief prescribed one
acceptance check for the sun's azimuth: noon on day 80, sun due north at 50°.
At that instant the hour angle is 180°, so the correct formula and an
east–west-mirrored one *both* produce due north — the check passes on a sky
where the sun rises in the west. When you write or are handed a single
acceptance case, ask what a plausible wrong implementation would return for it.
If the answer is "the same thing", the case is decorative; add one that
discriminates (here, 06:00 must be in the east). The same trap caught the
giant's own placement, which is why the derivation now asserts four
longitude→azimuth rows at load, including one that reproduces the previous
position exactly.

### Rendering architecture

**Static buckets cannot be animated.** Everything emitted through the kit is
merged into one InstancedMesh per `(shape, family)` at build time. Anything that
must move needs its own small `THREE.InstancedMesh` updated per frame. One
shared mesh can serve *every* instance of a moving part citywide — the mill rig
drives every sail and water wheel in the city from a single mesh, for **+1 draw
call total**, not one per mill. Follow that, or the clock hands in
`82-daynight.js`, or the self-contained rAF loop in `84-fauna.js`. Do not invent
a fourth pattern.

**Instance colour has three separate traps; all of them have shipped.**
1. *Blackening.* THREE lazily allocates a zero-initialised `instanceColor`
   buffer on first use, so the first tinted instance turns every
   previously-untinted one black. Every caravan in the city went dark the day
   strider tinting was added. White-initialise the slots you are not tinting.
2. *Whitening.* The shader program is compiled **with or without** the
   instance-colour path at **first render**. A population that only tints at
   frame time — when a match is rolled, when a boat spawns — gets a program
   with no instance-colour input and renders pure white forever. Seed white on
   every slot *before the first frame*, not at first use. Existing populations
   mostly tint at build time, which is why this one only surfaced with the
   gladiators.
3. *Washed-out tints.* `emitBuckets()` converts sRGB→linear; the life layer
   does not. Hand a life-layer mesh a palette hex directly and crimson renders
   as pale salmon. Convert at the call site to match the static bake.

**The terrain is a static heightfield and cannot be carved.** `terrainH()` is
pure procedure, sampled onto one 400×400 warped grid — about 47 world units per
cell out at the quarry belt. Anything drawn below it is inside an opaque mesh.
A literal hole is impossible; a pit has to be built *up* as terraced landform,
anchored at `terrainH(p) + a positive standing height` so nothing can ever be
buried.

### Load order and determinism

**`var` hoists the binding, not the value.** Calling a later fragment's
machinery from an earlier fragment's top level throws "cannot set properties of
undefined". Put the call in the same fragment as the thing it writes to, or
later.

**The kit wrappers stop working after fragment 75.** `BOX`/`CYL`/`DOME`/… push
into `BUCKET`, and `75-terrain.js` drains it into the baked InstancedMeshes.
Anything built in a later fragment — the whole life layer — must call stock
THREE primitives directly and weld them with `lifeMergeGeoms()`, which is why
the ships, ferries, dhows and the strider are all built that way. Calling the
kit from fragment 78 or 79 emits into a bucket nobody will ever drain, and
produces nothing, silently.

**A one-shot pass over `PLACED` does not see anything created after it.**
`townFacade()` runs as a single sweep at its own load time, so the quarry
laborers' houses — built in a later fragment — shipped as blank-walled boxes
until the builder called `townFacade(rec)` per house.

**Hash the position, don't draw from the shared stream,** for any per-object
choice that should stay put across rebuilds. The plaster canopy/second-storey/
smoke selection uses a position hash precisely so an unrelated edit upstream
cannot reshuffle which buildings have what.

**Adding geometry mid-fragment shifts everything generated after it.** Any
`rr`/`chance`/`pick` your new code calls advances the one stream that fragment
shares, moving every later compound, farm and orchard. `reseed()` at the
fragment head does not protect against this — it is *inside* the fragment. Save
the seed, reseed off the new object's own coordinates, build, restore: the
extra clan-compound building does this, and `_compounds`, `_rejCompound`,
`_buildings` and `_facade.compound` came out byte-identical. The guild-canton
relayout, which did not, shifted the Port canton's warehouse rolls as a
side effect.

**A code path that newly *succeeds* consumes randomness it never used to.**
This is the non-obvious half of the rule above, and it does not look like
adding geometry. A canton-top tavern that previously hit "no clear gap" and
returned early now reaches `tavern()` and `pick(TONES)` — three placements'
worth of draws that did not exist before, shifting `_veg` and `_orchard`
downstream. The same applies to swapping one emitter for another with a
different draw count. If your change alters *whether* a branch runs, isolate it
on a reseeded sub-stream even though you "only changed a condition". The
working trick when the old call must keep its place in the stream: still call
it, discard its geometry via a bucket snapshot, and draw the real thing on an
isolated sub-stream.

**`_flora.instances` moving is not always drift.** `70-veg.js`'s scatter avoids
`PLACED`, so newly claimed ground legitimately changes its count. Say so
explicitly in a report rather than leaving a reader to wonder whether
determinism broke — and check the determinism-critical counters
(`_buildings`, `_rejTown`, `_chinampas`, `_veg`, `_orchard`, `_layout`)
separately, since those must not move.

### Behaviour and logic

**A fallback that silently produces a plausible-but-wrong answer is worse than
a failure.** `lifeNavBuildLeg` fell back to an obstacle-*unaware* straight line
whenever A* failed, which is how twenty ordinators ended up walking across the
bay. The fix is to reject the unreachable destination the way `claim()` rejects
a bad site — not to draw something and hope.

**A probabilistic helper cannot express a guarantee.** `addWindows()` is one
certain window plus a 60% and a 45% roll; asked for "at least 3 per floor" it
delivers 1 in the worst case. Guarantees need deterministic placement sized by
formula.

**Resolve specific-before-general, and don't return early.** The inspector
consulted the canton (a 90–138 unit radius) before the building footprint and
returned, so nothing standing on a canton could ever name itself. Ordering it
smallest-first, with the canton kept as trailing context, fixed it without
losing information.

**Measure a graph before theorising about it.** "Carts swim and climb hills"
was diagnosed by counting components: the road graph was **117** of them,
because `road()` splits polylines at the river and the real bridges, causeways
and canton spans were never edges. The nav grid — the prime suspect — was 99.85%
one component and its fallback never fired once in 62 calls.

**Removing a restriction achieves nothing if something upstream already
enforces it.** `striderBuildLeg()` deliberately dropped the water-avoidance
branch every other cart keeps, and the file's header said so — but it opens by
handing the whole leg to `lifeRoadPath()`, and the road graph is land-only. The
concession had nothing to concede: measured, **3.0%** of route samples were a
genuine swim and the deepest wade in the city was about a metre. Worse, an
earlier *fix* had made it stricter — connecting bridges and causeways as road
edges meant road paths now succeeded almost everywhere. When a capability is
documented but invisible, check what runs before it, and measure the capability
rather than trusting the comment.

**Audit against a baseline, not in absolute terms.** "1,291 clips" means
nothing on its own, because the clearance test uses `claim()`'s padded radius
and a curve running correctly along a street beside a house scores a hit. The
number became evidence only when the same audit was re-run against each leg's
*previous* route: **1,352 → 1,291, and not one leg worse**. Build the
comparison into the diagnostic so it is repeatable, rather than quoting a bare
figure.

**A negative result, properly evidenced, is a result — report it as one.** A
pass built to recover more river fords recovered none, and that was the
finding: once A* could route around the buildings, the shorter line was simply
*dry* on 13 of 16 legs, and the one apparently-real candidate was an artefact
of the pass's own too-coarse grid. It explicitly disproved its own earlier
hypothesis ("I said those legs were blocked only by a building near an
otherwise clean water line. They are not. There is no water on those lines").
That is worth more than a ford forced into existence. Turning an unexplained
block into a refusal *with a named reason* is a real improvement even when
nothing moves.

### The harness

**Explain an exemption; don't loosen the invariant.** `built-inside-limit` now
forgives farms, manors, deliberate far-flung shrines and quarry sites, each via
its own exported list read by `verify.py`. That keeps the check strict for
everything nobody has explained. Widening the radius instead would have
retired the check.

**The draw-call number is a single-frame sample of a fluctuating value.**
Both the header line and the budget check read `renderer.info.render.calls`,
but from two different page evaluations — and the count genuinely varies as
moving populations (striders, dhows, caravans, fauna) drift in and out of the
camera's frustum and stop being drawn. Measured across one day: **64, 65 and
66** from the same build. So a passing budget line is a sample, not a ceiling;
sample several hours before concluding you have headroom, and treat a 1-2 call
discrepancy between the header and the budget line as normal rather than as
evidence someone opened a bucket.

**Don't retro-claim to fix a tooltip.** `claim()` feeds the live collision
system consulted by passes that run after the cantons. Registering ~100
canton-top rectangles into it would have let those passes start rejecting
candidates on ground 40 units up in the air they can never reach — silently
changing the world to improve a label. Canton-top footprints go into an
inspect-only registry that feeds `placedTagAt()` and nothing else.

**`build.py` prints "syntax OK" even when the JavaScript is broken.** Node is
not installed on this machine, so the check prints `NOTE: node not found,
skipping the syntax check` and then reports success regardless. The **only**
real syntax check is the browser, via `verify.py`'s error panel
(`PAGE DID NOT INITIALISE` / `Uncaught SyntaxError`). Two separate
comment-delimiter breaks shipped past a green `build.py` in one session — a
stray `*/` mid-comment, and new prose appended *after* a comment's closing
`*/`, which parsed the following twelve lines as bare JS and blocked a subagent
completely. Counting braces and parens does not catch this class: comment
delimiters balance either way. Never conclude an edit is good, and never hand
the tree to another agent, off a clean `build.py`.

**`verify.py` has a false failure about one run in seven.** The error panel
comes back dirty with `TypeError: Cannot read properties of null (reading
'trim')` inside three.js `acquireProgram` — r128 calling `.trim()` on a **null**
`gl.getShaderInfoLog()`, i.e. the error-*reporting* path under SwiftShader, not
a broken shader. Two agents chased it independently and reached the same
answer. A deterministic scene cannot produce an intermittent fault: re-run
rather than investigating, and never revert good work over it. Treat it as real
only if it reproduces on every run of the same build. This matters most when
you are writing shaders, where it is easy to mistake for your own compile
error.

**An error that only fires on interaction is invisible to `verify.py`.** The
day/night Pause button called `setDayNightPaused(!DAYNIGHT_PAUSED)` after
`DAYNIGHT_PAUSED` had been retired with the old clock. The page loads clean,
all seven invariants pass, and the button is simply dead the first time a human
presses it. After removing or renaming a module-level global, grep every UI
handler in the affected files for the retired name — a sweep, not a spot-check.

**We test on software rendering; the owner does not.** Headless runs use
SwiftShader, which is more forgiving than a real driver about undefined GLSL.
`pow(1.0 - ndv, 3.2)` where `ndv = max(dot(N,V), 0.0)` looks safe, but
normalised vectors can dot to slightly over 1.0 at fragment precision, making
the base negative — undefined, benign under SwiftShader, **NaN on real
hardware**, and NaN propagates to a black or missing pixel. Clamp anything
feeding `pow`, `sqrt`, `asin`, `acos` or a divide. This asymmetry is exactly
where a defect hides from every test we run and appears only on the owner's
machine.

**Measure what a feature costs on the load path, and make diagnostics lazy.**
The strider A* occupancy grid cost **1,375 ms at every page load** — ~217,000
`terrainH` calls — and recovered no routes. Deleting it would have thrown away
a genuine diagnostic; keeping it taxed every load forever. The resolution was
to notice the cost was not uniform: the *road mask* is consulted on every leg
the router builds and cannot be deferred, but it is one walk over 2,616 graph
edges with no terrain sampling at all — **0.6 ms**. Splitting the cheap eager
half from the expensive lazy half took the load path from 1,375 ms to 0.6 ms
with the tool intact. One detail that makes a lazy diagnostic usable: give it a
way to answer "have you been built yet" *without* building
(`nav({built:false})`), or reading the diagnostic silently costs the thing it
exists to avoid.

---

## 7. When several subagents run at once

Parallelism across *independent* leaf passes works, and is now routine. The
failure modes are all about the shared tree, not the geometry.

1. **Own files, not topics.** A brief that says "the fisherman's-dock section
   of `65-facade.js`" survives a second agent working elsewhere in the same
   file. A brief that says "facades" does not.
2. **Re-read immediately before every edit, and never revert what you did not
   write.** If unfamiliar code has appeared in your file, work around it.
3. **Expect transient failures that are not yours.** Builds during this session
   briefly showed `inspectClaim is not defined` and a `built-inside-limit`
   failure from another agent's half-written save and temporary model-staging
   geometry. Both cleared on their own. Diagnose before chasing — check whether
   the offending coordinates are anywhere near your work.
4. **Never `--save-baseline` over someone else's in-flight failure.** Saving
   freezes their breakage as the accepted state. Report instead, and let the
   planner re-run once the tree is quiet.
5. **To prove you changed nothing else, A/B in an isolated copy of the tree.**
   Copy it, revert only your own edits, and diff the counters. That is how the
   guild-canton relayout demonstrated that all 942 buildings, every rejection
   counter, the road graph and the chinampa count were untouched — impossible
   to show in-place while others are editing.
6. **Budget is shared and it is the thing that actually runs out.** Draw calls,
   instances and triangles come from one pool. State each agent's allowance in
   its brief, and tell them when the ceiling moves — an agent told to economise
   will keep economising, and quietly under-deliver, long after the squeeze is
   lifted. Tell them to **grep before assuming a `(shape, family)` combo
   exists**: one pass shipped 71 draw calls against a cap of 72 by reaching for
   `CONE(...,'metal')` and `BOX(...,'roof')`, both brand-new buckets, for a
   kettle lid and a lean-to panel.
7. **Give every agent its own scratchpad subdirectory and its own port.**
   Parallel agents resolve the *same* session scratchpad path, so two that both
   write `probe.py` clobber each other mid-task with no error. This happened
   three times in one session; one agent's third probe run returned another
   agent's tavern-placement dump, which looks exactly like your own script
   malfunctioning. Name the subdirectory for the task.
8. **Match the agent to the verb, not the subject.** The `voth-*` specialists
   carry explicit "Do NOT use for…" clauses and they *enforce* them — a
   gas-giant sky brief (second render scene, sphere and points geometry, a new
   fragment, a render-loop change) went to `voth-atmosphere`, whose charter
   excludes adding geometry. It declined, correctly, and spent the run on
   something smaller. A sky task that retunes existing values fits that agent;
   one that builds meshes does not. When a brief spans several systems, assume
   no specialist covers it and use a general-purpose agent. State in the brief
   that **the prompt itself defines scope**, or a specialist may read a long
   embedded spec as an attempt to widen its remit.
9. **Tell an agent what is locked, and give it a two-phase plan.** "You own X
   and Y; Z is held by another agent — do your measurement and own-file work
   first, then ask me before touching Z" keeps an agent productive instead of
   blocked or trespassing. Hand the file over explicitly when it frees up.
10. **When an agent stops mid-task, verify the tree before restarting
    anything.** A session rate limit killed three agents at once; the tree was
    sound and one of them had landed nearly all its work, so re-briefing from
    scratch would have duplicated it. Check what actually landed — counters and
    file contents — and resume from there.
11. **Pass on what other agents learned.** Each new agent starts cold. The
    `build.py`, `verify.py`-flake, scratchpad and real-GPU traps above cost a
    full agent run *each* the first time; they cost nothing once they are three
    lines in a brief.
