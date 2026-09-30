# Krator Ancients — build notes

Chronological. One entry per round. Newest last.

## Round 1 — split and harden (2026-09-21)

**Input.** `claude/krator-ancients-kit.html` was not on disk; it was pulled from
the published artifact *Krator Ancients Kit*
(`https://claude.ai/artifact/1V5VxyNVxS2ZsEy9M7QJhE`, version 1789973784-4f52,
1451 lines, 162 KB) and kept at `.origin.html` as the reference the split is
checked against. The notes doc, `girder-api.md` and `mavs-refuge-api.md` live in
the Claude project and are not reachable from here; the sibling contract style
was recovered instead from `../girder/girder-source.zip` and
`../mavs-refuge/mavs-refuge-source.zip`, which contain the real `build.py`,
`verify.py` and `API.md`.

**The split.** `split.py` cuts the single file into 48 contiguous fragments at
the section banners already in it. Contiguous and in original order, because
top-level order is load-bearing: `kdef()` order fixes the InstancedMesh bake
order and the `TEX`/`MAT` literals must precede the `kdef()`s naming them. No
statement was moved. `build.py --assert-origin` confirms the concatenation is
byte-identical to `.origin.html`.

**Instrumentation.** Four fragments gained accounting, and two new fragments
were added:

* `12-stats.js` — `TSTAT`, the per-type tally.
* `91-probe.js` — `window._api` and the `BUDGET` table.
* `30-kit.js` — `kput` now charges each item to the current type and records
  any item placed at a non-finite position.
* `32-surfaces.js` — `mesh()` charges its triangles to the current type.
* `90-scene.js` — the builder loop sets `TSTAT.cur` around each call and tags
  each new registry entry with its owning type; sky, gas giant and ground are
  marked `probeSkip` so they do not satisfy an occupancy test by accident.

None of it emits geometry or draws from the PRNG, so the render is unchanged —
verified by screenshot diff against the pristine `.origin.html`, not by eye.

**Two pre-existing bugs found by the new checks**, both seed collisions, both
recorded in `KNOWN_ISSUES.md` and whitelisted so the build stays green:
`buildLibrary`/`buildCampus` overlap on 9800–9801, and `buildMega`/`buildArc`
overlap on 9996. Neither is fixed here — fixing changes output, and this round
must not.

**Proof the refactor was output-neutral.** 17 views shot from `.origin.html` and
from the rebuilt `dist/ancients-kit.html`, compared with `shotdiff.py`:
**0.000% of pixels differ on every view.**

**Three bugs fixed** (all registry or camera, no geometry touched, so the diff
above still holds):

* `Campus — summit hall` registered a volume with nothing in it — the hall
  builds at `y ≈ 49` up the campus hill but the `REGISTER` had no `y`, so its
  cylinder sat at ground level and clicking the hall reported "unregistered
  mesh". Found by the new `registered-volumes-non-empty` invariant. The three
  `Campus courtyard` registrations had the same omission and were passing only
  because the hill happens to be low enough there; fixed too.
* The `Lab` preset pointed at empty ground. The Laboratory sites are at
  `x = ±420`, and at the old 520 m view distance the frame is only ±388 m wide,
  so both labs sat clipped to the edges with the gap between them filling the
  screen. Retargeted to 820 m, and — since the Laboratory is the detail-pass
  priority — `Lab intact` and `Lab ruined` close-ups added.
* `verify.py` now samples draw calls at **every** view it screenshots and judges
  the worst. The single reading taken during `--assert` (770, at Overview)
  proved nothing: the real worst case is 1129.

**Open at the end of round 1:** two budget ceilings are genuinely exceeded —
draw calls (1129 vs 900) and scene triangles (6 015 160 vs 6 000 000). Both are
left failing rather than widened, and both are recorded in `KNOWN_ISSUES.md`.
Every item under "From the brief" there is untouched. Next round is materials.

## Round 2 — Theodiga split out, and an optimisation pass (2026-09-21)

Travis: budget ceilings are "sort of ok to violate" on a showcase but should be
optimised down as far as quality allows; Theodiga looks like a beast and should
become its own artifact for later.

**Budgets are now a target, not a gate.** `verify.py` reports an exceeded
ceiling as `OVER` and no longer fails on it; `--strict-budget` restores the old
behaviour. Correctness invariants still fail hard — the distinction is the
point.

**Build targets.** Rather than copy the dam into a standalone file that would
drift, `build.py` grew targets. `src/` stays shared — core, helpers, all 33
builders — and a target contributes exactly two fragments: `89z-rows.js`
(`GROUND_C`, `ROWS`, `RUINS`) and `91z-views.js` (`VIEWS`, first entry = opening
shot). Two targets today: `kit` (32 types) and `theodiga` (the dam alone at the
origin, 8 presets including canyon-floor and apse views it could never have as
one row among many). `buildDam` still ships in the kit's script; only the site
moved, so the two cannot diverge. Two small supporting changes: the ground
plane's z centre became `GROUND_C` instead of a hard-coded 11000, and the
opening view is `Object.keys(VIEWS)[0]` instead of a hard-coded `'Overview'`.

**Optimisation.** The lever was mesh count, not triangles: draw calls are per
mesh, and several towers emitted one to three meshes *per storey*. New helper
`meshMerged(geos, mat, parent)` concatenates a stack into one mesh, copying
per-vertex normals rather than recomputing them and refusing nothing but
transparent materials (glass is depth-sorted per mesh). Applied to Skyscraper B,
Skyscraper F and all three Apartments blocks. Skyscraper F was also building a
mesh and immediately setting `visible = false` — dead geometry that cost
triangles and drew nothing.

| | before | after |
|---|---|---|
| scene triangles | 6 015 160 | **5 757 024** (under the 6M ceiling) |
| meshes, Skyscraper B + F | 648 | 89 |
| opening view, draw calls | 770 | **651** |
| Skyscraper B | 282 | **96** |
| Skyscraper F | 1006 | **754** |
| Apartments intact / ruined | 772 / 779 | **422 / 430** |
| Campus | 1045 | **717** |
| Hotel | 1055 | **727** |
| Robotics factory (was worst) | 1129 | **801** |

Every view measured is now under the 900 ceiling.

**Pixel-neutrality, measured not assumed.** Diffed against `.origin.html` over
seven views. First pass showed 0.03–0.2% of pixels differing everywhere, which
looked like a real regression; all of it was the **HUD**, which prints the live
draw-call and triangle counters and therefore changes whenever anything is
optimised. `shotdiff.py` now masks the UI overlays by default (`--with-ui` to
include them). With the HUD masked:

* Campus, Hotel, Robotics factory, Skyscraper B: **0 pixels differ.**
* Skyscraper F 2 px, Apartments intact 8 px, ruined 4 px, Overview 6 px —
  max delta 39/255.

The split is informative: Skyscraper B merged *without* `.translate()` and is
bit-exact, which shows the merge itself (normal copying, index rebasing) is
lossless. Every stray pixel is in a merge that baked a large offset into the
position buffer — an Apartments vertex at `7.5` inside a matrix at `x=340`
becomes `347.5` in the buffer, losing a few bits of float precision and flipping
an antialiased sample on a silhouette edge. Noted in `API.md`.

**Open:** draw calls are under budget on everything measured but the ~50 kit
InstancedMeshes are `frustumCulled = false` and form a fixed floor. The
mesh-count list in `verify.py --assert` is the remaining work queue: `fac` (109),
`hotel` (116), `lab` (82), `skyD` (84), `amph` (70), `off` (69). Next round is
materials.

**Published.** Both targets are live artifacts:

* Krator Ancients kit — https://claude.ai/artifact/1V5VxyNVxS2ZsEy9M7QJhE (v6)
* Theodiga — dam arcology — https://claude.ai/artifact/UT9zLRC3sigZRPbMCuhuQf (v1)

The kit artifact had no favicon and one is required on publish and then sticks,
so it got 🏙️; Theodiga got 🌊. Republishing the kit also needed the whole of the
previous version to be read first — the publish guard refuses to overwrite a
version you have not actually seen, which is correct even when the new build is
derived from that exact file.

## Round 3 — sightlines, campus cuts, more merging (2026-09-21)

Travis: more optimisation where quality allows; fix the amphitheatre sightlines
so every seat sees the stage; drop the rectangular garden at the front of the
campus and the beams crossing the courtyards diagonally. Then: Skyscraper G
should topple the other way, with more of its cuboids destroyed.

**Amphitheatre — two separate sightline faults, not one.**

1. *The sweep.* The acoustic shell is a half-dome occupying z<0 and opening
   toward +z, so a seat only looks into it while its own z>0 — while
   |a| < PI/2. The bowl swept ±2.2 rad (252°), which left **the outer 29% of
   every row sitting behind the shell looking at its back**. Now ±1.5 rad
   (172°), a Roman semicircle.
2. *The rake.* A constant rise does not give a constant view. The clearance C —
   how far a row's sightline passes above the eye in front — decays as ~1/n.
   With the old flat 1.5 m rise it was 0.58 m at row 1 and **0.071 m by row
   15**, under the ~0.12 m needed to see past a head. Now solved from
   `E(n+1) = (D(n+1)/D(n)) * (E(n) + C)` for fixed C, i.e. the classic parabolic
   rake, rescaled so the top row still lands at y=24 where the rim wall meets
   it. Rises run 1.19 m at the front to 1.67 m at the back and the bowl keeps
   its silhouette. The aisles became ramps that follow the rake; the old ones
   were a single straight box laid across the bowl, only correct while the rise
   was constant.

**Campus.** The 260×140 lawn rectangle at the front is gone — a hard-edged slab
of flat green laid over a rolling hill read as a decal. The diagonal atrium
bridges over the three courtyards are gone too; they crossed the only open voids
in the plan at a 0.5 rad angle matching nothing else and roofed them over. Both
`rr()` calls in the courtyard block are kept so the paths land where they did.

**Skyscraper G.** `toppledUpper` gained a direction argument (default unchanged,
so A–F and H are untouched). G's drum fell east, straight through its own block
stack; it now falls west, clear of it. The stack lost one block in eight, which
read as barely touched — it now loses most of the top tier, plus a lower corner
in the toppled variant, with the rule that a lower block never goes without the
one above it so nothing hangs in the air. Also fixed: in the toppled variant the
upper bridge ran to a drum that had been cut off below it.

**Optimisation, continued** — same `meshMerged` treatment on Hotel, Lab,
Skyscraper D, Office B and Office C.

| | round 2 | round 3 |
|---|---|---|
| Hotel meshes (intact/ruined) | 60 / 56 | 20 / 6 |
| Lab | 38 / 44 | 21 / 22 |
| Offices | 38 / 31 | 12 / 10 |
| Amphitheatre | 35 / 35 | 6 / 6 |
| opening view, draw calls | 651 | **507** |
| Robotics factory (worst) | 801 | **615** |
| Campus | 717 | **529** |
| Hotel | 727 | **525** |
| Lab intact | 552 | **260** |

Draw calls have gone 1129 → 615 at the worst view over the two rounds, against a
900 ceiling. Scene triangles 5 757 024 → 5 754 100.

## Round 4 — materials, building audit, fragments (2026-09-21)

Travis: work on materials; audit the buildings and sanity-check them (do all
windows have glass when intact, do upward-facing surfaces need a roof —
especially houses and apartments); make sure fragments fall away appropriately,
the satellite dish has a large chunk that would sit better on the ground; make
sure spaces meant to be enclosed have exterior walls, which is a problem in
Apartment B.

### Audit

**Windows: clean.** Every window placement in the kit switches on decay
(`d>0?'winSmD':'winSmI'` and friends); the only two `paneD` uses are inside
`else` branches. All intact windows are glazed. Nothing to fix.

**Enclosure: four faults, one root cause.** A `lathe`/`gridSurface` shell is a
*surface*, not a solid — no ends, no cap — and with `DoubleSide` materials an
unclosed one simply shows you its inside.

* **Apartments B** — a 12 m sandwich of two perforated skins with no end walls
  and no roof. From above you looked straight down into thirteen storeys of
  floor slab, with the columns (which run to HW+3) standing proud of a wall that
  had no top. Added both end elevations and a roof.
* **Apartments A** — every terrace tray was an open-ended tube; from above you
  saw down through all eight of them to the ground. Added floor and ceiling.
* **House C** — the three lobes were bare tubes on a single column, open at the
  top *and* the bottom. Added floor slabs and domed caps.
* **Office C** — the brise-soleil bar was open along both end elevations.

The top-down camera is what finds these: `verify.py --cam "x,y,z,tx,ty,tz"`.
Recorded as a checklist in `API.md`.

**Fragments: systematic, not one-off.** Seven broken-off pieces were positioned
by a hand-guessed `y`. The satellite dish was the worst because its fragment is
a patch of a paraboloid whose geometry origin is the dish axis — 25 m to one
side and 30 m below the panel itself — so no hand-picked height could ever land
it. New `dropFragment(o, groundY, bury)` in `32-surfaces.js` rotates the piece,
measures the rotated bounding box in its parent's frame, centres its footprint
on the position the builder asked for, and seats its lowest point just under the
ground. Applied to the dish, fuel lobe, factory tank, factory conveyor pipe,
government petal, house petal, radar wing, lab spire, and the lab's fallen
chimney (which now rests on the roof instead of sunk 0.5 m into it).

### Materials

The headline is that **roughness and metalness now come from a packed map**
(`rmTex`): r128 reads `roughnessMap` from green and `metalnessMap` from blue, so
one texture serves both. With a single flat roughness every panel on a 420 m
tower had an identical highlight and the kit read as moulded plastic.

* **White metal** — 2x1 m sheets with recessed seams, a lit lip, corner
  fasteners, per-sheet tone, vertical brushed grain; roughness broken up per
  sheet and raised along every seam.
* **Rust** — keyed to the bottom of each tile. With world-unit UVs a tile is
  roughly a storey, so the tile bottom is the underside of a ledge: that is
  where the runs converge and the dark band sits. The panel grid still ghosts
  through. **Verdigris removed** from this map entirely.
* **Verdigris** — now its own material. It used to be blended into the rust map,
  which put copper patina on rusting *steel* across the whole kit. Only the
  decorative ring bands (`ringR`) use it, as copper/bronze.
* **Concrete** — board-formed: 0.65 m boards each poured a shade different, the
  joint proud with a lit lip, a form-tie hole grid with a rust weep below each,
  damp running down from every joint, aggregate speckle.
* **Brick** — common bond, header course every sixth, real mortar joints and an
  arris shadow. The old map was randomly-toned rectangles with the background
  showing through as "mortar".
* **Glass** — fresnel rim via `onBeforeCompile`.

Three traps found and recorded in `API.md`:

1. A data map must **not** be sRGB-encoded. `canvasTex` sets sRGB (right for
   albedo, wrong for roughness/metalness); `rmTex` resets to linear.
2. **Metalness must stay modest (~0.3–0.45).** There is no environment map in
   this scene, so a near-1 metalness has no diffuse and nothing to reflect and
   renders almost black. The obvious "make it properly metallic" is wrong here.
3. `Material.clone()` does not carry `onBeforeCompile`, so `kbake` re-attaches
   it or every instanced pane and finial silently loses the fresnel.

r128 has **no `<output_fragment>` chunk** — that arrived in a later version — so
the fresnel is anchored on the literal `gl_FragColor = vec4( outgoingLight,
diffuseColor.a );`. A failed `String.replace` fails *silently* and would read as
"the effect is just subtle", so `verify.py --eval` now checks from inside the
page that the anchor exists, the hook is attached, and the roughness map is
linear-encoded: `{"anchorPresent":true,"glassHook":true,"rm":true}`.

**Closed the inline-materials issue.** The bunker berm, House F's slope, the
campus hill, the mega's root mound, the dam's spillway sheet and the kit's slab
were built with `new THREE.MeshStandardMaterial` mid-geometry — flat untextured
colour that washed out badly under the new lighting. They now use
`MAT.mud/.turf/.rock/.spray/.slab`.

Numbers unchanged by the material work, as expected: 5 760 034 scene triangles,
511 draw calls at the opening view, error panel clean, all invariants pass.

### Vashtir — the recursive spire (delegated)

Travis asked for an agent to build a mysterious megastructure from a reference
image: a colossal recursive pyramid of self-similar tiers, translucent and lacy.

It was given its own build target (`--target spire` -> `dist/spire.html`) and
told it owned exactly three files, so it could not collide with the materials
rewrite running at the same time. To make that possible without it editing
`90-scene.js`, `BUILDERS` now merges an optional `EXTRA_BUILDERS` declared by a
target's own `89z-rows.js` — a target can add builders without touching shared
files at all.

**Verified independently rather than taken on trust:** file mtimes confirm it
touched only its three files; the kit renders **0 pixels different** with its
fragment compiled in; its reported numbers match a run of my own exactly
(`spire/0` 127 555 tris / 6 meshes, `spire/1` 100 791 / 9, 3 114 instances, 6
registered volumes, worst 36 draw calls over 10 views).

One thing it correctly flagged as outside its ownership: `BUDGET.type` in
`91-probe.js` had no `spire` key, so verify was classing it `medium`. Added
`spire:'mega'` — it sits at 18% of that ceiling.

Open on the spire (its own honest list, abridged): some tilted child cones show
their DoubleSide backface where the base rim clears the parent flank; the
proportion is broader than the reference (roughly 1:1.3 height to width, where
the reference is far taller than wide) so it reads as a spiked massif more than
a soaring translucent pyramid; the six trunk tiers do not read individually at
distance; intact contrast is low because nothing in this kit casts shadows.

## Round 5 — spire second pass, decay realism, ground contact (2026-09-21)

### Vashtir, second pass

**I had the proportion critique wrong.** I told Travis the spire was too broad
against the reference. Re-reading the image, the reference is itself a broad
pyramid — roughly as wide as it is tall — and Vashtir's 57° slope already
matched it. What actually differs is that the reference is **translucent**: you
see pyramids through pyramids, layer behind layer. A solid white mass in the
same silhouette reads as a mountain. Fixed by what the form was missing, not by
stretching it:

* **Parasol fans.** Broad, shallow, scalloped glass fans thrown out
  horizontally from each tier's shoulder, drooping as they go out. The structure
  now has something to be seen *through*. Left unmerged: transparent geometry
  sorts per mesh and ten fans at ten heights want ten sort keys. Cost 27 -> 37
  draw calls, which on a 900 ceiling is a fair trade.
* **Capped child bases** — the agent's own top bug. A tier is a surface, not a
  solid, so where a tilted child's base rim cleared its parent's flank you saw
  up inside the cone at its DoubleSide backface, which the hemisphere light
  painted brown. The rim is a star, not a circle, so the cap is swept from the
  same `rOf()` the shell uses. Gone from `Vashtir foot`.
* **Fewer, larger children** (trunk `nk` 7/7/6/5/4 -> 5/5/4/4/3, child scale up
  ~30%) so the recursion reads as nested pyramids instead of fuzz.

### Decay realism (the brief's third detail bullet)

All of it went into the shared helpers in `36-decor.js`, so every one of the 33
types improved from one edit rather than 33.

* **Rubble piles against walls.** `rubbleRing` keeps its signature, so every
  caller benefits: the radius is now biased hard toward the inner edge
  (`pow(rng(),2.4)`), blocks are largest there, and they bank into a talus slope
  that thins to a scatter outward. It was a uniform annulus — a decorative ring
  laid round the building.
* **Moss only on what faces the sky.** New `upFaces(geos,n,minNY)` walks the
  triangles of geometry the builder already made, keeps the ones lying flat, and
  samples points weighted by area. It tests `|ny|` rather than `ny` because
  these shells are DoubleSide and their winding is not reliably outward — a
  balcony floor can come back with a downward normal while plainly being a
  floor. Cost: a true soffit can be sampled too, which is rare here and cheaper
  than missing every ledge.
* **Vines and staining off real ledges.** `ledgePoints` takes the outer band of
  those flat faces — that is where water leaves a building. `vinesFromLedge`
  roots there; `stainsFromLedge` hangs a **multiply-blended** streak below, so it
  darkens whatever wall it lands on instead of painting a grey rectangle. The
  same decal has to work on white metal, rust, concrete and brick.

Applied to the Laboratory, Hotel and Apartments A, which already build their
skin geometry into arrays for `meshMerged` — the sampler takes those arrays
directly, so there was nothing to re-derive.

### Ground contact

`terrainH(x,z)` now exists in `10-core.js`, returning 0. Everything that meets
the ground asks it instead of assuming zero, so the Krator terrain pass replaces
one function and the aprons, trees and fallen fragments all follow. New
`apron(parent,cx,cz,rIn,rOut,d,hIn)` lays a graded skirt from the foot of a mass
out to the ground. Put inside `skyPlinth`, so **all eight skyscrapers** got one
from a single edit; also on the Laboratory and the Starport.

### Vegetation hand-off

`VEG.tree(x,y,z,species,h)` in `36-decor.js`, with a cheap default. Everything
that plants anything goes through it, so the flora pass is one assignment and
touches no builder. `y` is the ground height — callers ask `terrainH`.

Totals: 5 796 392 scene triangles (+36k for the aprons), 519 draw calls at the
opening view, error panel clean, all invariants pass.

**Still open from the brief:** Gaudí bone-work and the `moulding()` sweep helper;
interiors visible through openings; glass shards in ruined window openings (the
other decay sub-item — it needs per-window placement, unlike the rest); the
per-type gap list; and the library API with `dist/ancients-lib.js`.

## Round 6 — design doc, and rehabilitated structures (decay level 3)

`DESIGN.md` written first, covering the three queued families: rehabilitated
structures, the hanging canyon, and the DALAB domes. It makes the decisions
(targets, decay model, the payload registry, the prison, scope for DALAB) so the
builds do not have to re-litigate them. One open question recorded there: **how
big is the Voth palace**, which DALAB's great dome has to beat.

### Rehabilitated — `--target repaired`, decay level 3

Not "less ruined": a ruin that people came back to, patched with what they could
salvage, and reoccupied. Ancient fabric still legible and still failing;
everything added since visibly cruder and newer.

**Three mechanisms, none of which touch a builder:**

1. **`HOLES`** — a global dial in `32-surfaces.js` that scales every `holeFn`
   call at once. Level 3 sets it to 0.55, so the same 33 builders produce a
   part-eaten fabric instead of a gutted one. Threading that through the
   builders would have been 33 edits and 33 chances to miss one.
2. **`faceSamples` generalised to take an Object3D.** It now traverses a group
   and bakes each mesh's transform, so a *finished* structure can be sampled
   without the builder handing anything over. `sideFaces` (walls) joins
   `upFaces` (anything flat).
3. **`repairPass(G,d)`** runs on the group the builder returned. Patches —
   corrugated sheet, scrap plate, boarding, tarpaulin — riveted proud of the
   walls and a few degrees off the panel grid, because salvage is never flush
   and never square with what it covers. Accretion on the flat surfaces:
   lean-tos with tarp roofs, stove pipes, water butts, planters, walkway planks.
   Warm lamps by one patch in ten, while **the ancient cyan strips stay dead** —
   that contrast is the point.

**It is dressing-per-size, not dressing-per-structure.** The first pass used
fixed counts and buried a 12 m house under as much salvage as it takes to read
on a 420 m tower. Counts now scale with the group's bounding diagonal, so the
ancient form stays the thing you see first — which is what "slightly worn" has
to mean.

New: `MAT.corrugate` / `MAT.timber` / `MAT.tarp` and ten kit items, all in
`69-mat-salvage.js`. `STATE(3)` is `'repaired'`; `SITEX` puts level 3 on the
centre line; a target picks its levels with `DECAYS`.

**A latent bug the new target exposed:** `Campus Wing` registered its volume
with no `y`, so the volume sat at ground level while the wing stands 38 m up the
hill — the same class as the summit hall and courtyards fixed in round 1. It had
been passing on a single stray sample; at level 3 it went to zero and the
invariant caught it. Fixed, which also clears the "thinnest: 1" warning that had
been sitting in the kit's output for five rounds.

Measured: 2 435 650 scene triangles, 258 draw calls, 42 331 instances, 52
registered volumes all non-empty, error panel clean.

## Round 7 — the canyon span, and the Dalab domes

### The Span — `--target canyon`

Colossal pipes bridge a gorge; structures hang beneath them on cables. Three
pipes, sagging (a dead-straight pipe reads as a prop), with flanges and a
walkway rail; the gorge is two rock masses with a wobbled inner face.

**Modularity was the requirement that shaped everything.** A pipe does not know
what hangs from it: it is a spec array, and every payload is one entry in
`HANG`. Moving a payload along a pipe, changing its drop, or swapping it for
another type is a data edit in `SPANS`. Payload functions build in their own
local frame with the cable attachment at the origin, and return *deferred*
geometry plus kit placements; `hangEmit()` then applies one matrix to all of it.
That indirection is what lets the same payload hang from a pipe or lie smashed
on the canyon floor without being written twice.

Seven types, no two sharing a primitive: `pod` (geodesic, portholes — the
reference's form), `prism` (a cut diamond, point-down), `drum` (a carousel of
stacked drums), `ring` (a torus with cabins round its rim), `cluster` (the
chandelier, explicitly), `prison`, and `lift`.

**The prison** gets there by refusing what the others offer: a blunt mass that
*widens as it descends*, so it bears down rather than sits; no gallery, no
balcony, no visible door; an external cage clamped over the shell; slits that
are too few, too narrow and too high, lit cold where everything else is warm; a
winch where anything else has a stair; and a dense bunch of cell pods slung
underneath, each barely bigger than a person. The building is a thing that
holds other, smaller things.

**The lift** is a track, not a rope: twin heavy cables with rack teeth between,
a guide rail and a counterweight on the return side. There is no animation
system here, so the car is parked — but at a different height in each variant,
so across the three it reads as something that moves. In the fallen variant it
is at the bottom of its track with the cable snapped above it.

Variants: intact / rusted-and-overgrown / **fallen** — cables snapped, three
payloads down on the floor via `dropFragment`, one pipe parted with its far half
hanging off the wall, the car crashed.

**Two errors worth recording.** The first gorge was 1640 wide by 560 deep and
read as two low mesas with a plain between them — a trough, not a canyon; now
1400 by 900. And I mis-budgeted the drops: each payload reaches 2.5R (ring) to
5.6R (prism) *below its cable*, and at the first heights the prison and the
prism both extended below ground. Computed the reach per type, then set the
drops from it. The prison is the largest payload, so it gets the shortest drop
on its span.

Measured: 345 228 scene triangles, 33 draw calls, all invariants pass.

### Dalab — `--target dalab`

**Domes only**, as scoped: no settlement, mounds, streets or life layer.

One great dome (DR=110, DH=95) with seven satellites, no two the same size,
joined by part-buried ribbed passageways with clerestories, inside a low ruined
wall that is breached in places. `DECAYS=[1]` — this complex is never shown
intact, because nobody alive built it.

**The domes are opaque.** Everywhere else in the kit an ancient shell reaches
for blue glass; here it does not, and that is what makes the complex read as a
facility rather than a temple.

Three domes are broken open. The break is **not** noise: it is one great bite
out of a quadrant, so the opening has an edge you can read a section against
instead of dissolving into lace. Behind it, `sectionInterior()` — the kit's
first real interior, and written to be reusable because the original brief has
wanted one behind every opening since the start: floor plates at 4.6 m centres
cut off at the break, a double-loaded corridor, ward floors with bed rows and
curtain rails alternating with lab floors of benches and specimen-tank banks,
conduit bundles dropping through, and three full-height service cores.

On the axis of the great dome, a sunken chamber ringed by cabinet banks with
cable trunking converging on it — a plant room to a stranger, a shrine to a
priest. The AI itself is not modelled.

**Open:** the great dome must be "wider and taller than the Voth palace" and I
do not have that project's dimensions. Built at 110 × 95 — larger than anything
in this kit but the megastructures — and rescalable by those two constants
alone. `BUDGET.type` gained `dalab` and `canyon` as `mega`; Dalab measures
643 204 of 700 000.

## Round 8 — Theodiga optimisation and quality pass

Theodiga sat at 130k triangles of a 700k budget and 46 draw calls of 900, so
there was no fat to trim — the pass was about spending headroom on the three
gaps that had been logged since round 1, and cleaning up what was actually
wasteful.

**Optimisation.** The six canyon-wall meshes always shared `MAT.rock` and the
three dam faces always shared `CONC(d)`; both are now one merged mesh each.
Removed a dead `for(let k=0;k<12;k++){const y=by+13+k*1.5;}` — an empty loop
body that computed a value and discarded it. 23 meshes to 17, 46 draw calls to
44.

**Rougher canyon.** It was two soft banks, not cut rock: a single fbm at low
amplitude on a 80x24 grid. Now bedding planes, vertical gullies and a coarser
base noise on a 118x38 grid — fine enough to actually show them — plus a talus
of fallen blocks banked against each wall foot.

**Irregular fin mosaic.** The Soleri cells were placed by `rng()>.55`, a flat
coin-flip that reads as noise. They now cluster: fbm supplies patches, a sine
supplies banding, the two are mixed, and the densest parts get double-height
openings. A hieroglyph, not a scatter.

**Light tunnels.** Shafts driven back through the mass from the downstream face
and up to the crest. This took four attempts and each failure was a different
kind of mistake, all worth recording:

1. Placed with `zf(y)`, which is the face position **at mid-span only**. The
   face bulges — `zc(x)` runs from -140 at the centre to 0 at the abutments — so
   the outer tunnels were buried ~90 m inside the dam. Same class of error as
   the canyon payload drops last round: using a centreline value as if it held
   across a curved surface.
2. The lit element was a `'strip'`, which is 0.18 m thick and vanishes at any
   distance. Replaced with a plate.
3. The throat used the kit's `'tube'`, which is a **capped** `CylinderGeometry`
   — so it was a closed drum and what showed was its flat end cap. `lathe()` is
   open-ended.
4. And the real one: **the face had no hole where the tunnels broke through**.
   The shafts sat behind an unbroken elevation, so all that was ever visible was
   the 2 m of collar that protruded. The tunnel list is now generated *before*
   the face and feeds its hole predicate, with the face grid raised from 96x40
   to 160x80 so a round hole comes out round.

**A near-miss worth recording.** Chasing (2) I suspected `instanceColor` was
being discarded, because r128's `color_pars_fragment` declares `vColor` only for
`USE_COLOR`, not `USE_INSTANCING_COLOR` — which would have meant every instance
colour in the kit had been doing nothing. Checking the bundled source rather
than acting on it showed r128 *also* emits `#define USE_COLOR` whenever
`instancingColor` is set, so it works correctly. Reading the shader chunks alone
would have led to a wrong and wide-reaching "fix".

**A process note.** The tunnel edit was chained into a backgrounded command, so
when its `assert` failed the error went to a log I only grepped for other
strings — the script never wrote the file, the build ran on unchanged source,
and the render looked identical for a reason that had nothing to do with the
geometry. Edit scripts run in the foreground from now on; only the slow verify
gets backgrounded.

Measured: dam/1 210 998 of 700 000 triangles, 44 draw calls, error panel clean,
all invariants pass.

## Round 9 — Veladiga

Soleri's other dam arcology (1965), from the three sheets. Formally the opposite
of Theodiga, which is a straight wall with a cruciform of fins stuck on its face.

**What the sheets actually say.** Sheet 3 is the face: a row of colossal
**shield-shaped bays** — arched over the top, sides sloping in to a flat sill —
each a deeply recessed cliff packed with dwellings, divided by splayed faceted
piers, with an undulating highway band running along the top. Sheet 2 is the
plan: the dam is an **arc**, bulging upstream, with promenade and industry along
the crest, two circular pads out over the reservoir on stalks (research
laboratories and a vertical take-off airport), and a radial **city centre**
wheel in the park downstream. Sheet 1 gives the sections — dwelling and
living-working terraces stacked behind the face, storage and automated industry
in the base. Canon: 250 m high, 15 000 people.

**How it is built.** The centreline is a true arc (centre of curvature
downstream, so the dam bulges into the water). Everything is parameterised on
`(t, y)` — position along the arc and height — with `fp(t,y,back)` giving a
point on the downstream face set back by `back`, so the face, the recessed
panels, the reveals and the cell mosaic all share one coordinate system.

A bay is a closed **shield** outline: semi-elliptical arch on top, straight
sides sloping in, flat sill. It is used three ways from one definition —
`inBay()` punches the face, its complement punches the recessed panel 46 m
behind, and `outl()` walks the outline once round so the reveal can be swept
between them. That is what makes the bays read as deep pockets rather than
painted-on shapes, and it is why the arch soffit comes for free.

The dwelling mosaic is ~4 500 instanced cells on the recessed panels, warm and
cyan where lived in, dark where not.

**The breach** is a ragged fbm-perturbed ellipse in `(t, y)` space that every
surface consults: face, panels, reveals, base, crest blocks and the cell mosaic
all respect it, so the hole is genuinely blown *through* the structure rather
than drawn on one layer. Behind it, the floor plates of the living terraces are
cut off at the edge and show in section. Outside, a fan of house-sized concrete
blocks across a drained park, and the reservoir dropped from 226 m to 40 m.

Measured: veladiga/0 179 920 and veladiga/2 207 796 of 700 000 triangles,
39 draw calls, 12 343 instances, error panel clean, all invariants pass.

**Open:** the piers read flatter than the sheets, where they are deep V-shaped
buttresses; the city-centre wheel is small against the dam; the park is a large
flat plane.


## Round 10 — Veladiga follow-up: containment, the crest, the breach, and the
## cultural centre moved to the kit

Four things, three of them the user's own catches.

**The span did not hold the water.** This was measurable rather than arguable,
which is the only reason it got caught: the arc's half-span is `RA*sin(A)`, and
the canyon's inner rock face is a known function of z. At `RA=760, A=1.0` the
arc ended 129 m short of the rock on one side and 219 m on the other — the
reservoir simply ran round both abutments. `RA` 760 → 1000 puts the half-span at
841 m against rock at 759–841 m, so the arc now dies into stone at both ends.
Everything downstream of that is parameterised on `fp(t,y,back)`, so widening
the arc moved the bays, piers, crest and park with it for free. That is the
argument for having one coordinate function rather than twelve.

**Floating polygons at the crest.** Two separate ones. The undulating highway
band sat 16 m above a 34 m deck with air under it, and the promenade blocks
stood 34 m beyond the downstream face on nothing. Both were symptoms of the same
omission: there was no cantilever. The crest is now a real one — a deck gridded
out to ~96 m past the face, an edge beam along its lip, and 48 corbel brackets
running from `H-46` on the face up to `H-6` under the deck nose. The band and
the blocks then sit on something. The corbels respect `blast()`, so the breach
takes the deck out with the wall.

**What a breach actually does.** The user's note — water rushing out would warp
the structure around the hole and tear it to the crest — changed the breach from
an ellipse to a *tear*. `blast(t,y)` is now a vertical rip whose half-width
grows with height (`0.40 → 1.75×` from the toe to the crest) and whose edges are
ragged by `fbm`, so the failure propagates upward and opens out, rather than
being a neat hole with intact wall above it. Downstream, `scour(x,z)` cuts a
plume into the park — a Gaussian trough widening with distance from the toe,
faded in over the first 220 m — so the ground records where the water went.

**The park.** It started at z=440 while the dam toe curves from z=154 at the
crown to z=614 at the abutments, so there was bare orange between the structure
and its own grounds. Now z=120 → 1490, ±2160 wide, seven terraces. Two traps
here, both of the "measure it" kind: the terraces and the tailrace channel had
separate `v` ranges, so their steps fell out of phase and the water sat proud of
the lawn it was meant to run through — they now share one `pV(z)`. And the park
dipped below y=0, where the world ground plane occludes it; that was the orange
bleeding through the grass. `pY()` clamps to 0.8.

**The cultural centre moved out.** At the user's direction it is gone from
Veladiga — where at dam scale it read as a cluster of blocks — and rebuilt at
its own scale in `src/67-cultural.js`, placed in both the kit and repaired
targets at `cult:{z:22500}` with three presets. It is the radial city the sheet
draws: a domed 64 m great hall, three concentric rings of halls each turned
against the last with radial spokes back to the core, a 48-column colonnade, and
three stepped terraces.

Two things went wrong building it and both were visible only in the wide shot.
The terrace radii (96/154/212) did not reach the ring radii (104/156/208), so
two annular strips of bare ground showed between the drums — fixed by carrying
each tier out past the ring it holds (134/190/244). And with every hall a flat-
topped drum of near-identical height it read as a tank farm; every third hall is
now a campanile at ~2× height and 0.62× width, and each drum takes a shallow
dome cap. The fix had to be in silhouette, because at the overview distance
that is all there is.

Measured: veladiga/0 201 852 and veladiga/2 224 564 of 700 000; cult/0 103 084
and cult/1 124 484 of 250 000. Error panels clean on both targets.


## Round 11 — the floor plates at the breach

The user's note: the exposed floors would be warped and blown out too, though
some stubs could survive in cross section. They were right that the old version
was the one thing those plates would not do — they were drawn as full-width
shelves spanning the tear, i.e. cantilevers with nothing holding the free end.

Each level now keeps only a stub off each edge of the tear, ragged at the tip,
drooping as it projects, with whole levels missing where the plate went clean.
They are pushed into `FACE` rather than the dark interior array, so they merge
as concrete and -- because the `mossOnSurface`/`vinesFromLedge` passes sample
`FACE` -- vegetation lands on the exposed floors for free.

The instructive bug: I first sized the surviving stub as a *fraction* of the
tear width. That looks reasonable written down and is badly wrong, because the
tear is ~153 m half-width at the crest, so a 0.5 fraction cantilevered the top
plates 80 m into the void. They rendered as long black feathers. `proj` is now
in metres (2.5-16 m, under 2.5 the level blew out), and `st` is derived from it
by dividing through `hw*ARC`. Same shape of code, but the quantity that varies
is the one with a physical bound on it.

Two things I got wrong reading the renders, both worth recording because they
cost a round each. The left-hand flank's stubs looked black next to the pale
right-hand ones and I took it for a flipped-normal bug from mirroring `sg`; I
"fixed" it with a v-reversal that changed nothing, because the two flanks of a
tear face opposite directions and the sun only lights one of them. And an
earlier edit script asserted a count of 2 that was really 3, so it aborted, the
file was never written, and the build that followed in the same command ran on
unchanged source -- the failure mode already in the notes. Running edits in the
foreground is what caught it.

Measured: veladiga/2 225 710 of 700 000, error panel clean.


## Round 12 — Hexahedron (`--target hexahedron`)

Soleri's sheet 28, at the sheet's own numbers: 1 100 m tall, 1 km span, the
automated industries on a hexagon of about 57 hectares underneath. Its own
target, because the kit is already at its triangle ceiling and this is 216 k
triangles per variant.

**The rotation, which is the whole design.** The note was that the two pyramids'
tips must not sit above one another, and that the lower is turned about 120 deg
from the upper. Those two cannot both hold: a triangular plan has 3-fold
symmetry, so 120 deg maps it exactly onto itself and the tips would coincide.
The rotation that interleaves them is 60 deg -- which for a triangle is the same
figure as 180 deg, and is what the plan sheet draws (its mid-level plan is a
triangle with a second, opposed triangle dashed behind it). So the lower plan is
the upper turned 60 deg, with deliberately unequal corner angles and radii so
the result is a lopsided star rather than a mechanical hexagram. `From below` is
the view that shows it: six tips, none above another.

**Structure.** One irregular triangular outline, chamfered at the corners,
sampled by a single `pp(P,p)` so every level of both pyramids, both promenade
decks and the dwelling cells share one parameterisation. The upper city is 24
terraces from the waist to the summit, the lower an inverted 16 down to a
truncated apex, and the shaft forest below it takes each column up to
`soffitY(rho)` -- the height the inverted pyramid has actually reached above
that column -- so the shafts lengthen toward the rim instead of all being cut to
one line.

**Three bugs worth keeping.**

`holeFn` takes a 0..1 severity, not a decay level. Passing `d*.7` handed it 1.4
at d=2, which removed about half the fabric: the ruined variant rendered as
terraces floating in the sky with nothing beneath them. It is the second time
this session a quantity has been fed to a function in the wrong units, and both
times the render looked like a structural bug rather than an arithmetic one.

The shear wedge was sized as a fraction of the perimeter and set at 0.070. Since
one face is 1/6 = 0.167 of the perimeter, at the crest the wedge was wider than
a whole face and the dark interior swallowed the elevation. Also it was placed
at p=0.62, which is a corner on the far side from every preset camera -- the
outline runs edge, chamfer, edge, chamfer, so the faces are at p = 1/12, 3/12,
5/12 and a wedge belongs on one of those.

The ground blocks took a random y and a random height independently, so some
floated and some were half-buried. `plateY(x,z)` asks the mesa which terrace it
is standing on. This is the same error as the hand-guessed fragment heights from
round 5 and it will keep recurring until placement always derives from the
surface rather than from a guess.

Measured: hex/0 216 252 and hex/2 237 506 of 700 000, 22-24 draw calls, error
panel clean, all invariants pass.


## Round 13 — Hexahedron quality pass: the oblong plan, and windows on walls

**The plan was wrong and the correction resolves the contradiction.** I had read
"tips do not overlap" and "turned 120 deg" as incompatible and gone with 60 deg.
They are only incompatible for an *equilateral* triangle. The plan is an oblong
isosceles triangle -- one apex reaching much further than the two base corners --
and an elongated triangle does not map onto itself at 120 deg. So 120 deg is
right after all: the three points stand clear of each other while the bodies
still overlap across the middle, which is what the sheets draw and what the
brief said. `TRI` is now three explicit corner points, already centred on the
centroid so the turn is about the middle of the mass.

That change forced two others. The three edges are now different lengths, so
`pp()` samples the outline by **arc length** rather than by segment index --
otherwise cells and texture crowd on the short base edge and stretch along the
two long ones. And the outward direction is no longer close to radial: for an
elongated plan the base-edge normal is far off the radius, so `pnorm()` takes
the real edge normal and every window, cell and parapet faces along it.

**Windows.** They were being placed at the tread height but at the *riser*
radius -- which is outside the building -- so they hung in the air among the
balcony boxes instead of belonging to anything. They now sit on the vertical
terrace wall below each tread, three storeys to a 20 m riser, on a regular
rhythm round the whole perimeter.

The swap that paid for them: `winI` is an `ExtrudeGeometry` arched window of
roughly a hundred triangles. Five thousand of them cost 550 k and put hex/0 at
766 k, over the mega ceiling. At this range nobody can resolve an arched reveal,
so the panes are `pane`/`paneD` at twelve triangles -- which bought enough
headroom to double the window count and still land at 469 k.

Terrace cells also went from per-cell noise to one `fbm` walked along the
perimeter, with a street cut through every ninth bay, so neighbours agree in
height and the faces read as blocks of city rather than static.

Measured: hex/0 469 228 and hex/2 392 956 of 700 000, 23-26 draw calls over 14
views, error panel clean, all invariants pass.


## Round 14 — the real plan, and a hypertree for scale

**The plan relationship, as specified.** Two oblong isosceles triangles that
share one base vertex, each one's base lying along one of the other's legs.
With base angle TH the construction is exact and needs no fitting: put the
shared vertex at the origin, send the upper triangle's leg along +x and the
lower triangle's leg out at TH; each base is then 2*cos(TH) long and runs up
the other's leg from that corner. Checked numerically before rendering --
legs 1.0000/1.0000 and base 0.5176 on both, U's base collinear with L's leg to
a dot product of 1.000000 and shorter than it, the same the other way, and the
closest pair of distinct tips 482 m apart.

The consequence drives the whole file: **the two triangles do not share a
centroid**. Each pyramid has to taper about its own centre, or scaling both
about the world origin leans them into each other. So every plan point is
`(P.O + outline*s)`, never `outline*s`, and the mass is deliberately
off-balance -- the summit stands about 190 m to one side of the shaft forest
and the upper apex cantilevers far past the ground works, which is what this
plan produces and not a mistake to be centred away.

Two more things fell out of it. `soffitY` can no longer approximate the plan as
a circle of radius 1, because the outline radius runs 0.40 to 0.72 depending on
direction, so it asks `planR()` for the true radius along the ray. And the
presets all aim at the union's bounding-box centre, local (182, 239), because
the union is not centred on the builder origin either.

Also this round: the summit is a ridge rather than a point (elevation 3 draws
the cultural centre running along a long flat top, which only an oblong plan
can carry), sky bridges out to cantilevered pods off the promenade grooves,
gardens on the promenade levels, and the heliport moved to the apex -- it had
been put at p=0.877, which by arc length is the middle of the base edge.

**The hypertree.** One Ironbark imported from Mav's Refuge purely as a scale
reference: 452 m tall, 27.5 m base radius, crown from half height and 196 m
across, which are that project's own SPECIES[0] numbers. `trunkR`, the buttress
falloff and the lobe sum are ports of its functions; the branching keeps its
shape rules (golden-angle boughs, alternating secondaries, twigs off those) but
is re-expressed with this kit's instanced primitives, because the original is
written against its own merged-bucket tube builder and its FAMMAT material
system. Nothing else came across -- no platforms, bridges, lifts or buildings.

One thing needed adding rather than porting: in the source most of the lower
crown hangs off the city's own structural branches, which are not imported, so
a straight port left the trunk bare to 72% of its height and the tree read as a
palm. A third tier of boughs at u 0.52-0.70 puts the crown back where
`crown0 = 0.50` says it starts.

While wiring it in: this target's `RUINS` now passes `-r.s` for the intact
site. `RUINS` greens the ground texture under each structure, and the d=0 site
is at `-s`, so every target that passes `+s` has been greening the mirror
position all along.

Measured: hex/0 548 588 and hex/2 453 032 of 700 000, mav/0 174 420 of 250 000,
error panel clean, all invariants pass.


## Round 15 — supports on the centre of mass, and closing the pyramids

**Centre of mass.** Worth stating because it makes the computation trivial:
each pyramid's outline scales about its own centre, so that centre IS its plan
centroid at every level, and the only unknown is the mass ratio -- the integral
of s(y)^2 over each one's height. The two centres are antisymmetric about the
origin and the two integrals come out close (the upper is taller but tapers to
nothing, the lower is shorter but flares to full width), so the COM lands within
about 15 m of the builder origin, which is where the ground works already sat.
Five shaft clusters now stand on it, tight, instead of being spread out under
the lower pyramid's corners. The mass stays deliberately off balance; in-world
it is the lost carbon nanomaterial spine that carries it.

The cluster positions come from ONE `clusterAt(c)`. The first cut of this had
the failed cluster's coordinates hand-copied into the crater predicate, because
the crater is punched before the shaft loop runs -- the exact duplication that
has caused three separate bugs in this file already. Hoisting the COM above
both uses fixed it properly.

**Both pyramids were open shells.** Risers and treads on the upper, risers and
soffits on the lower, and nothing across either end. Because the plans are
turned 120 deg, most of each one's perimeter reaches past the other, so you
could look straight up into the hollow cone or down into the inverted one over
a large part of the footprint. Three caps now: the great soffit under the upper
city, the deck over the lower city 2 m below it (offset rather than coplanar,
so the overlap cannot z-fight), and the floor of the lower truncation. The
summit surface closes fully to a point instead of stopping at 0.2 of the
truncation scale.

Neither new surface is left blank. The great soffit takes coffer ribs and, on
the intact one, light strips. The lower city's roof is planted -- blocks and
trees wherever the upper pyramid does not cover it, which is the park and
promenade level the sheets label. The test for "is this bit roofed" reuses
`planR`: a point is under the upper city if its distance from that plan's
centre is less than the outline radius along its own direction.

Measured: hex/0 574 632 and hex/2 436 470 of 700 000, mav/0 174 420 of 250 000,
27 draw calls, error panel clean, all invariants pass.


## Round 16 — the shafts actually meet the mass

**Why they did not.** `soffitY()` inverts a continuous curve to say how high the
inverted pyramid's underside is above a plan point. The built soffit is
STEPPED. The two agree only at each band's inner edge and disagree by up to a
whole 20 m band everywhere else, so shafts cut to the continuous value stopped
short of the plate they were supposed to carry -- visible as columns ending in
open air under the mass.

The fix is not a better height calculation. The lower city is a closed shell
now, so an intact shaft simply runs to the waist and everything above the
soffit it first meets is enclosed and invisible. The connection is then true by
construction rather than true whenever an inverse happens to agree with a
stepped surface, and the silhouette does not change, because the visible length
is still governed by where the soffit actually is. `soffitStep()` -- floor of
the same expression -- is kept for the things that DO need the real step: the
bracing, which must stay below the soffit, and the new capital.

Each shaft gained a capital under the soffit with four corbel braces, and a
footing seated on `plateY` rather than intersecting the mesa on a hard line.

Hoisting `plateY` above the shafts was necessary and worth recording: it is a
`const`, so using it earlier in the function is a temporal dead zone throw, not
a hoisted `undefined`. The error panel would have caught it, but only after a
build and a verify run.

**The collapse had to change with the supports.** Drawing the clusters in onto
the centre of mass merges them into one bundle about 330 m across, and a single
failed sub-cluster then hides inside it -- the ruin view showed an apparently
intact forest. The failure is now a FLANK: every shaft within about 55 deg of
one bearing went, so the near side is stumps and debris and you see through to
the survivors behind, with the soffit crater over that sector.

**Also this round.** The industries were scattered at uniform random, which
reads as debris rather than a plan; plan 2 divides the hexagon into six wedges,
so there are five ranks per sector now, set out on the sector's own bearing
with a street between sectors, plus a paved apron round the vertical structure.

Two presets had to be re-aimed after the supports moved, which is the recurring
cost of hard-coding camera targets: any preset pointed at a computed feature
goes stale the moment the computation changes.

Measured: hex/0 577 616 and hex/2 440 570 of 700 000, mav/0 174 420 of 250 000,
error panel clean, all invariants pass.

## Worn (decay 5), folded in from Yuni (2026-09-30)

Yuni's port of the kit had a WORN variant for its `ancient_*` assets: the intact
fabric, whole, with rust bleeding from seams and fasteners (`TEX.panelWorn`,
`MAT.whiteWorn`), streaks under every ledge, sill and ring, flush rusted plates,
and moss and vine only on the tall towers. It now lives in `src/69w-worn.js` as
decay 5, and the `worn` target shows every type intact (west) and worn (east).

Differences from Yuni's version: the dirty-white tint (0.90, 0.87, 0.81) is the
worn material's colour instead of a per-part tint at merge time, and every
MAT.white mesh of the structure goes worn, not only the ones SHELL() made. The
texture is made on first use, so targets without decay 5 are unchanged: the kit
showcase and skyi fingerprint identically before and after (same counts, same
instance transforms). worn.html: 5.3 M tris, 146 registered, error panel clean.
