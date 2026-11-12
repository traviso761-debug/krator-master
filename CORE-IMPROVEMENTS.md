# Core improvements: the problems that keep coming back (2026-10-27)

An audit for the owner. It looks for the classes of problem that recur across Krator's builds and sessions, and proposes
core fixes that would stop them: modules, checks, tools, defaults and skill updates, not fixes build by build. It
proposes; it implements nothing.

**Out of scope.** Water (core/water's `PRACTICE.md` and its audit) and foliage cut-outs, floating leaves, branches and
impostor cells (the card audit). Other sessions own these. Where a class touches them (a depth tie under a still), only
the non-water half is here.

**Sources** (on `claude/biome-rebuild` at 898e5f3c3):
- every `KNOWN_ISSUES.md`, `NOTES.md` and `LESSONS.md` outside `archive/` (155 files, 1.9 MB; the two halves were read by
  two read-only agents);
- `HANDOFF-REBUILD.md` ("Practical rules", the look-pass rounds, the core asks);
- `TODO.md` ("Ride along"), `AUDITS.md`, `README.md` ("CORE MODULES ARE NOT OPTIONAL");
- the skill: `painting-to-3d-world/SKILL.md`, 164 KB, sections 5i, 5t and 5u especially, and `references/threejs-pitfalls.md`;
- `tools/test_all.py`, `check_core_use.py`, `harness.py`, `port_baseline.py`, and `core/host/95-host-probe.js`;
- the owner's memory notes (feedback and reference);
- the side-session notes of 2026-10-27, Span's twenty lessons especially;
- `git log` since 2026-09-27: 2,347 commits, of which 149 say fix, again, bug, broke, revert, restore, stale or throws.

**How it is ranked.** By how often a class recurs (builds and sessions where it actually happened, not keyword hits) and
by its cost: who finds it, and how late. A defect the owner finds by eye in a live review costs a round with the owner.
One a verify catches costs minutes.

## Summary

| # | Class | Seen in | Who finds it | Core fix (one line) | Lands without rebuilding pages? |
|---|---|---|---|---|---|
| 1 | Placed against the wrong surface: floating, buried, inside or through, doors and stairs blocked | about 17 biomes and 30 kits or settlements | the owner, by eye | a drawn-surface query (`KSEAT`) and contact, clearance and door sweeps in the probe | the ground-error report, yes; the sweeps come with the rebuild |
| 2 | Silent failures verify passes: shader errors, LFS pointers, undecoded textures | 8+ sessions, every fresh worktree | the owner (black or missing surfaces) | one `harness.verify_page` with universal asserts; refuse LFS pointers at pack and build | **yes** |
| 3 | Budget overruns: triangles, draws, the page cap | 17 biomes, about 14 kits or settlements, 7 page-cap cases | the session, late (a crashed tab, a stalled verify) | a pass-count table at build time; hard caps; ceilings with a reason | **yes** (build side) |
| 4 | Page assembly: fragment order, a missing core fragment, name clashes, readers of another kit breaking | 14 builds | a throw at load, or the owner | fragments declare what they need and provide; one assembly check; host halves that merge either way | **yes** |
| 5 | Stale pages after a shared change; baseline and generated-file churn; merges that drop work | every shared change; 29 pages on 2026-10-08 | the next session | an input manifest for every build, `reach.py`, a no-build stale check; tools scoped to one build | **yes** |
| 6 | Registered volumes empty | 9 builds | verify (late, after building) | volumes made from records; probe points set by the drawer | with the rebuild |
| 7 | Plants or props on cliffs and steep faces | 8 builds, plus the owner's standing rule | the owner, by eye | a cliff gate as a core/biome default, and a universal probe check | with the rebuild |
| 8 | Shader hooks colliding: chained `onBeforeCompile`, missing anchors, `cameraPosition` on Lambert, NaN in GLSL | 64 builds hand-chain hooks; 6 recorded breaks | the owner (a look that never shows) | one hook composer that throws on a missing anchor; `glf()` for numbers | the lint, yes |
| 9 | Colour space and exposure under the shared sky | 10 builds | the owner | `KCOLOR` (decode in GLSL, hex to linear in JS) and a luminance check per view | the lint, yes |
| 10 | Camera or preset views inside geometry; stations without views | 6 builds | the owner or the screenshots | a per-view eye check in the harness; required views per station | the lint, yes |
| 11 | Z-fighting and coplanar faces | about 12 kits or settlements, 12 commits, 21 builds with hand `polygonOffset`, 3 local resolvers | the owner | a coplanar audit in tools; named depth layers | the audit, yes |
| 12 | Map edge, horizon void, seams between ground and far field | 7 builds | the owner, from the air | one far apron in core/terrain | no |
| 13 | Placement that moves when a pass is added (stream order) | 8 builds | a baseline diff | `BIO.grid` on KRAND cells | no |
| 14 | Undefined or `|| d` settings | 4 builds; 224 `o.x || n` in core and biomes | a stalled verify (918,541 cobra lilies) | a lint with a ratchet; `KOPT.num` | **yes** |
| 15 | Wrong winding or back faces culled | 4 builds | the owner | the nwbay winding sweep in the probe | with the rebuild |
| 16 | Verify infrastructure: a dead GPU lock, orphaned browsers, hidden tabs | 7 builds; four agents stalled for 3 h | the session | the harness owns the lock and its browsers | **yes** |
| 17 | Text and Windows traps: a trailing `//`, CRLF churn, heredoc escapes, `:` in names | 6 commits, 4 builds | a broken piece in the page | a comment lint; `.gitattributes`; sanitised view names | **yes** |
| 18 | The skill grows as a log, so lessons repeat | the same lesson written 3 to 5 times | (cause of the others) | a check per lesson; remove lessons a check enforces | **yes** |
| 19 | Vendored-file drift; fixes copied per build | about 17 kits and settlements | the next re-vendor | `--vendor-check` as a ratchet in `test_all.py` | **yes** |
| 20 | Doors blocked, stairs into walls (see item 1) | about 12 | the owner | `doorSweep()` in the probe | with the rebuild |
| 21 | Instance and vertex colours lost on flatten or merge | 6 | the owner (pale towns) | one `KFLAT.flatten` with a test | the module, yes |

**Cheap checks that could land now, with no page rebuilt** (each is a tool, a lint or a build-side refusal; the pages'
bytes do not move):
- 2a: pack and build refuse LFS pointers;
- 2b: `port_baseline.py` says NOT BUILT for pointer pages;
- 2c: `harness.open_page` records shader errors;
- 3a: page size cap;
- 3b: pass-count table at build;
- 4a: assembly check;
- 5a: input manifests and `reach.py`;
- 5b: stale check;
- 5c: `audit_port.py` and `make_index.py` honour their argument;
- 5d: `--write` guard;
- 8b: `cameraPosition` and raw-number GLSL lint;
- 9b: raw `texture2D` lint;
- 10b: station views lint;
- 11a: coplanar audit tool;
- 14: `||` lint with a ratchet;
- 16: lock and orphans in the harness;
- 17: comment lint, `.gitattributes`, view names;
- 18: the skill;
- 19: the vendor ratchet;
- 21: the `KFLAT` module and its test.

Items 1, 6, 7, 8a, 9a, 10a and 15 change the shared probe or core shaders, so they ride the rebuild under way. Each
biome's turn takes them, and `TODO.md`'s "Ride along" list is where they go.

---

## 1. Placed against the wrong surface: floating, buried, inside or through

**Pattern.** Something is placed on a height or outline the code computes (`terrainH`, `topAt`, `footR`, a record's
radius), but the page draws a different surface (a ground mesh of 10 to 44 m cells, a KSTACKS wall capped at 160
segments, a weathered or contoured body, a wrapped export). So it floats, sinks, or stands inside rock.

**Evidence.**
- **Pinnacle Rock.** "Stairs not attached", reported four times running (2026-10-19). The checks were made on the
  analytic outline, but the drawn face stood 4 to 12 m inside it (memory: check against the drawn mesh).
- **Span.** Lesson 15: things put inside the rock between a KSTACKS wall's rows. Lesson 13: `KSTACKS.contour` leaves
  the record unchanged, so anything hung on the wall must read the mesh.
- **Korona.**
  - The prow stood wholly inside the ridge.
  - Carvings ended up behind the talus, and plants floated at the walls' feet.
  - `KSTACKS.mesh` read the module's own top function, not the wrapped export.
  - A mesa footed under the lowest ground buried itself (SKILL 5t).
- **Farside.** Lobes floated off a knoll's flank. A sponge was dressed onto a far stand-in (SKILL 5u).
- **sedesert.** Far spires floated or sank (p99 1.17 m). Columns stood up to 1.6 radii plus 1.5 m off their arms
  (TODO, "Backport the succulent columns").
- **swlowlands.**
  - A road vanished on `terrainH` and was moved to `meshH`.
  - 16 m cells ride over `terrainH`.
  - Tree-top clumps hung in the air.
- **nwbay.** The camera was clamped to an undrawn surface ("THE RIM"). On steep sites roots float or sink.
- **The hyperjungle.** The fire scale-tree's crown sat above its pole (2026-10-27). A 34 m brook drew in slivers on 44 m
  cells.
- **Smaller water and ground cases.**
  - geyser: a spring disc stood 0.1 m proud.
  - nwouterwall: a 4.5 m channel was lost between 10 m cells.
  - godthrone: the scarp drawn as facets.
  - little-demo: 83% of a feature under the floor.
- **k-guilin.** Roots hung off stacks: 45 of 222 figs failed reach.
- **Ancients.**
  - The Stump G float (384679414).
  - Floating posts at the lighthouse (a0f97b5fd).
  - The Trigon plaza raised clear of the ground (83959985e).
- **The port.** The floating-shacks fix (5d6a02026).
- **The Lizardmen.** Glyph bands floated off leaning faces (SKILL 5i).
- **nhighlands.** Tree feet on slopes needed a skirt ring.
- **About 18 settlements and kits report floating or buried pieces.**
  - Ancients: a sky-lobby lens 59 m up, 36 hedges in mid-air, the Skyscraper G tier, and the lighthouse's rail posts and
    rubble. Its `KNOWN_ISSUES.md` (line 922) still holds the open item "**No invariant can see a placement error**".
  - Iziz: aprons floated because `terrainH` was read in the kit's local frame (line 338).
  - Jimjam: `jjStairs` step slabs (2026-10-20).
  - Ys: door lamps, lathe lips, the cliff stair.
  - xanadu: a road sampled only at its points floats and sinks.
  - The port: shacks stood on 90 m invisible beam cones.
  - Also Highlands, Dalab, Screamers, the catalog, the interiors, Dhelv and Locus.
- **About 16 report interpenetration.**
  - Yuni: 399 buildings over a street edge (worst 6 m) and 31 trees inside buildings, from point tests. Fixed with box
    tests and a Yuni-only invariant.
  - Highlands: a chest inside tower walls, brackets through roofs.
  - The catalog: `ANCHOR_AUDIT`.
  - Ringsea: `sails-clear-cabins`.
  - Also the Eternian kit, Ys, Mav's Refuge, the Islanders, Locus, the Beast Riders, Dalab, xanadu and post-apoc.

  Each check is local to its build.
- **About 7 report placing on the analytic ground instead of the mesh.**
  - Ys: the cliff stair hugged the analytic karst wall until it marched `ysMeshH`. Three agents each wrote their own
    corrected `hykLatheAt`.
  - Span: "Pinnacle Rock's rule".
  - Dhelv: 2.5 m walk quads under a finer hill.
  - Also the lighthouse's 4 m grid.
- **About 5 report frame and axis mix-ups in helpers.**
  - Ancients: `beam`'s `w` is its depth, so bridges came out 9 m tall.
  - Ys: `HYK.placeOn` landed at twice its coordinates.
  - Iziz: the local-frame `terrainH`.
  - Also the mirrored catalog +x.

**Root cause.** There are two truths: the record (an analytic function, cheap and available in node) and the drawn mesh
(resolution, segment caps, weathering, contour, skirts). Placement reads the first and the eye sees the second. No core
function gives "the surface as drawn" for a point, and no invariant measures a placed foot against what was drawn. Every
fix so far is local: `PRR.wallR`, `ROCKRAY`, `meshH`, skirts and lifts.

**Proposed core fix.**
1. **`core/terrain` `KSEAT`** ([G data]): `KSEAT.seat(foot, surfaces) -> {y, normal, gap, buried}` over a footprint (a
   centre and an end or ring sample). `surfaces` are drawable records: the KFIELD ground at its drawn cell size (it
   interpolates the drawn triangles, not `terrainH`), and KSTACKS bodies through a new `KSTACKS.drawnR(rec, y, theta)`
   that reads the same rows `mesh()` emits (the 160-segment cap and the weathering included). Lowest-of-footprint
   seating and tilt to the normal are built in (Farside's rule).
2. **The probe invariants.** One shared set in `core/host/95-host-probe.js` replaces the per-build checks above (Yuni's
   box tests, `ANCHOR_AUDIT`, `sails-clear-cabins`, the lighthouse's scratchpad float probe):
   - `contactSweep()`, the ray-down float check, described next;
   - `clearSweep()`, a box-clearance test between records of different classes (a building over a street, a tree in a
     building, a sail through a cabin);
   - `doorSweep()`: for each registered door, a ray in through the opening (Ys's ray probe: 90 of 210 doors were blocked
     by their own building's skin), and from each stair head that the flight reaches its floor (the stairs into walls or
     short in Ys, Iziz, the Islanders, Highlands, Dalab, Zeijani, Screamers, Locus, Jimjam, Span).

   **`contactSweep()`** itself: Every core/tags record carrying a `foot` (a
   tree, a building, a prop, a stair) is ray-tested against the rendered meshes. Fail when the gap is over the record's
   tolerance (default 0.3 m) or the foot is buried past it, with a negative control that lifts one record by 2 m.
   Pinnacle Rock's `ROCKRAY` (rays cast outward from the point) is the method to lift.
3. **`tools/ground_error.py <build>`** (node, no GPU): the drawn ground versus `terrainH` on a grid. It reports the worst
   error and where, so a session sees "your 44 m cells lose 6 m at the brook" before placing anything.

**Touches.** core/terrain (new fragment; opt-in, so no page moves until a build takes it) and core/host's probe (every
page that takes core/host, so it rides the rebuild). Builds adopt `KSEAT` at their turn.

**Adopting it.** A placer calls `KSEAT.seat(foot, STAGE.surfaces)` in place of `terrainH(x, z)`, and the record gets
`foot:{r, tol}`; verify then fails a floating stair without anyone writing a check.

**Lands now:** `ground_error.py` (a report).

## 2. Silent failures that verify passes

**Pattern.** The page builds with no error and verify passes, but surfaces are black, white or missing.

**Evidence.**
- **LFS pointers build black, silently.** A fresh worktree holds 130-byte pointers for `tex/`, the library and `dist/`.
  `pack.py` packs them as 199-byte data URLs, the browser fails to decode them, `_texPending` reads 0 and the error
  panel stays clean. Recorded:
  - memory: LFS tex packs;
  - Span lesson 1 (the Dalab pages lost 5.6 MB);
  - SKILL 5p and 5t;
  - HANDOFF "Practical rules";
  - core-ground-modes, core-strata, export-godot-cull (Godot's `world-*/tex`);
  - 921dfa1b0 (repack the builds a merge left stale).

  Every parallel session meets it on its first build.
- **Shader compile errors.** In r128 these go to `console.error` only, and the mesh does not draw. crater-drylands lost
  its whole ground to a `NaN` spliced into GLSL (memory: shader errors are silent). Only crater-drylands forwards them to
  its error panel.

  **62 of 80 `verify.py` scripts never listen to the console.** 72 of them use the shared harness only for
  `local_three`; each has its own page loop, so a universal assert would have to be added to 80 files.
- **Assert gaps.** `--assert` does not screenshot presets, and a soft budget "OVER" still prints OK (SKILL 5t).
- **`port_baseline.py` in a worktree** reports every pointer page as CHANGED (Span lesson 2), which teaches sessions to
  ignore it.

**Root cause.** Verify has no shared page runner, so each invariant must be re-added to each `verify.py`, and the
universal checks (console, textures) never were. The build reads LFS pointers as data.

**Proposed core fix.**
- **2a, build side (now).** `tools/textures/pack.py`, the KMAT pack helpers and every `build.py` read of a binary (one
  helper in a shared `tools/buildlib.py`) refuse a file that starts with `version https://git-lfs`. The message names
  the `git lfs pull --include=...` to run. `tools/export_report.py` already has this test (line 67).
- **2b (now).** `port_baseline.py` reports a pointer page as `NOT BUILT HERE (LFS pointer)`, not CHANGED.
- **2c (now).** `harness.open_page` records `console.error` lines matching `THREE.WebGLProgram`, `shader error` and
  `WebGL: INVALID`. It also counts textures whose image is under 2x2 after load (pointer or undecoded).
- **2d (with the rebuild).** A shared `harness.verify_page(page, views, asserts)` that every `verify.py` calls. It holds
  the universal asserts: error panel, page errors, shader errors, undecoded textures, the probe's NaN sweep, registry
  occupancy, budget, and the per-view eye check of item 10. A build's own asserts are passed in, and its old loop goes.
  The nightly `smoke` already does half of this; this makes it every verify.

**Touches.** 2a to 2c are tools only. 2d touches every `verify.py` (no page bytes), so convert them at each build's
rebuild turn.

**Adopting it.** `verify.py` becomes about 30 lines: views, the build's own checks, and
`harness.verify_page(page, VIEWS, CHECKS)`.

## 3. Budget overruns

**Pattern.** A pass is planned by density and only counted after it is built. The page crashes, stalls or sits at its
ceiling, and the ceiling is raised to the measured total.

**Evidence (17 builds).**
- **Crashes or stalls.**
  - swlowlands: 25M triangles crashed the page.
  - nhighlands: the tab died near 16M on plain JS arrays.
  - xanadu: 42M.
  - The Cut: 21M of culms, then 186k melons at 33M.
  - swhighlands: 95M in the understorey.
  - nwlowlands: about 30M.
  - Farside: 68M before a trim (SKILL 5u).
  - Korona: 918,541 cobra lilies from an undefined bias.
- **Running at the ceiling.**
  - The Throne: 19.79M of 20M, raised to 22M; about 200 draws against 140.
  - swbay 10.13M of 10M; swlowlands 11.6 of 12; nwbay 9 of 10; Farside 15 of 16; ehighlands 15.4 of 16.
  - shighlands 18.5 of 19.5; xanadu 29.8 of 30; eastabyss 10.84 of 11.
  - The Rift's station 2 trimmed to 35.4M against 40M (06a479816).
- **Ceilings set to the measured total.**
  - Oidong (f4d0ce6b5);
  - Girder `furn.calls` 78, then 84 (09a3ccbe0);
  - Dalab 10M.
- **The 16 MB page cap.**
  - Voth's city page at 18.9 MB;
  - the Lizardmen's Voth page;
  - Span's texture sidecar split at 16 MB (042a3135b);
  - Girder Hero `--slim` (df74443bb);
  - the Throne's station 1 at its ceiling.

**Root cause.** Counts exist (`BIO.stats`, `typeStats`, `HCHK showcase-triangle-budget`) but only at verify, after a
GPU run, and only against a ceiling the build sets for itself. Nothing tells a session the cost of a pass while it is
writing it, and raising a ceiling is free.

**Proposed core fix.**
- **3a (now).** `buildlib.write_page()` fails when a page or sidecar passes the gallery's 16 MB file limit. It warns at
  90%, so the split is planned, not discovered.
- **3b (now, for builds with a node-loadable data half).** `tools/pass_counts.py <build>` runs the placement in node (the
  `[G data]` halves already run there for tests) and prints a table: instances x triangles for each item, the worst
  three, and the cell sizes behind them. Farside's rule "count every pass before you look at it" becomes a command.
  swhighlands' LESSONS item 12 asks for exactly this.
- **3c (with the rebuild).** `core/biome`'s placer gets a default count cap per item (say 250k instances, opt-out per
  item with a reason). The 918k cobra lilies would have thrown at once.
- **3d (now).** Ceilings live in one `BUDGETS.json` per build with a `why` for each raise. A lint fails a raise with no
  reason or older than the change, so "ceiling = what we measured" becomes visible.

**Touches.** 3a, 3b and 3d are tools; 3c is core/biome (every biome page, at its turn).

**Adopting it.** Run `pass_counts.py` after each pass; a raise in `BUDGETS.json` needs a sentence.

## 4. Page assembly: order, missing fragments, clashes, readers of another kit

**Pattern.** A page is a concatenation of fragments chosen by each `build.py`: its own `src/`, core lists, and other
kits read in place. It throws at load, or silently draws wrong, when the order, the set or the names differ from what a
fragment assumed.

**Evidence (14 builds).**
- **Order.**
  - `host/35-core-strata-shade.js` sorts before `35-core-strata.js` and throws. This hit Span and swhighlands, and both
    renamed it `35z`; swhighlands' LESSONS item 1.
  - A KMAT pack fragment (`88x`) loads after the host stage, so `KMAT.packed` is null (Span lesson 5).
  - The impostor bake compiles materials before the snow and weather hooks (swhighlands' LESSONS item 2).
  - Voth's `VC.fieldHit` ran before the country had fields (296ef5761).
- **A missing core fragment.**
  - The Throne's kipuka and frontier: `BIO.walkLoop is not a function`; the hyperjungle's fauna, read in place, needed
    `36-core-walker`.
  - Five Throne stations: `ATMOS.export` threw because `89-atmos-8-export` was not listed (both recorded in the Throne's
    `KNOWN_ISSUES.md`).
- **A name gone.**
  - The sky merge left the Throne's `89w-host-water.js` reading a name that no longer existed (a501ffb2e).
  - A merge dropped `VC.ixUnitBox` and Voth's init threw (cfd971acd).
- **Clashes.**
  - Sets read in place declare the same top-level names (`MATLIB_BOUND`, `vWorldUV`: Span lesson 7).
  - "Identifier already declared" (memory: no trailing `//`).
- **Readers of another kit.**
  - Dhelv (0967ed6cd) and the socket sheet (d6c83a437) broke when the kit they read gained host fragments.
  - nwbay's 50 does not open its own registry, and a kit's `kitEnd` must run with that kit current (rebuild-swbay notes).
  - The Catch: a kit's registry is closed by its fauna fragment.
  - ringisles: four upstream kits lacked `make`/`grow` or wrapped them in closures (fixed upstream 2026-10-26).
  - abyssal-savannah reads eastabyss's B[14] builder.
  - Readers carry stale text of swbay's fragments (Voth, the isle demo, ringisles).
  - k-guilin: "nwbay read in place moves this page".
  - The rebuild notes repeat by hand, every time: "**no species key or index changed or added**" (eastabyss,
    hyperjungle, necanyons, swbay).

**Root cause.** Fragments state no contract. A build's order is file-name order plus hand lists, and the dependency
between fragments is discovered by a throw. A kit's surface for readers (species keys and indices, `make`/`grow`, the
fields it reads, the fragments safe to read) is prose in `EXCHANGES.md` and in each session's notes.

**Proposed core fix.**
- **4a (now): `tools/check_assembly.py`.** It parses each build's assembled script (the builds already write `.syntax.js`
  for `node --check`: 76 of 80 do) with a small top-level scan, and reports:
  - a top-level name declared in two fragments (the clash);
  - a fragment that, at load (not inside a function), reads a global another fragment defines later (the order bugs above);
  - a name a fragment calls (`BIO.walkLoop`, `ATMOS.export`) that no fragment on the page defines (the missing core
    fragment).

  It needs no browser; it is a `test_all.py` step, and it uses the scripts the builds already write.
- **4b (core, cheap): host halves merge either way round.** `35-core-strata-shade.js` and KMAT's pack readers do what
  KHORIZON's pair does: they extend the module object whichever loads first, and read lazily. That removes the `35z`
  workaround from two builds.
- **4c (now): a kit's export contract.** Each kit read in place writes `EXPORTS.json` (the species and plant keys with
  their indices, `make`/`grow`, the fields it needs, the fragments readers may take). `tools/check_exchanges.py`
  compares each reader's `NEIGH` and `station.json` and the commit's diff of `EXPORTS.json`. A changed index or a
  removed key fails, so "no key or index changed" becomes a check, not a sentence.
- **4d (rule plus check): promote at the second copy.** `check_core_use.py` gains a duplicate-function detector (the
  same normalised function body in two builds' `src/`). Evidence of what it would have caught:
  - the dither in Farside and Korona;
  - the succulent column in sedesert, ebadlands, nsemiarid, the Throne and Shade;
  - `bracket()` in swbay, nwbay, the Rift and the hyperjungle;
  - `crust` in ebadlands and ringisles.

  Ratchet it like the core-use baseline.

**Touches.** 4a, 4c and 4d are tools; 4b changes two core fragments (the pages that take them rebuild at their turn).

**Adopting it.** `check_assembly.py` runs in every build after the syntax check; a kit read in place commits its
`EXPORTS.json`.

## 5. Stale pages, reach, baseline churn and merges that drop work

**Pattern.** A change to a shared file is rebuilt into one build only, and the other pages, the baseline and the
generated tables fall behind. Or a tool or a merge rewrites files the session did not mean to touch.

**Evidence.**
- **Stale pages.**
  - 29 committed pages and the baseline behind their sources (2026-10-08; CLAUDE.md).
  - Iziz and Screamers behind (a9b66e470).
  - The hyperjungle, the Rift and Girder stale before the water and atmos binding (09a3ccbe0).
  - Seven builds a merge left stale (921dfa1b0).
  - 113 pages rewritten after the texture merges (1646dc0f4).
  - Each core session's note ends "pages carry new text, not rebuilt" (swhighlands, core-landforms, core-strata,
    core-ground-modes).
  - Span lesson 12: a function added to `37-core-stacks.js` moves about 13 pages.
  - `TODO.md` keeps a "Ride along" list because of it.
- **Generator churn.**
  - `tools/audit_port.py` and `make_index.py` ignore their argument and rewrite about 80 `PORT.md` and `INDEX.md` files
    (three sessions by accident; Span lesson 3; klava; swhighlands; SKILL 5t; swhighlands' LESSONS item 4).
  - b5badc0cc restored other builds' tables.
  - CRLF churn on revert (`git -c core.autocrlf=false checkout`).
- **Merges and staging.**
  - `git add biomes` swept other agents' work into a merge (HANDOFF).
  - The `core/export/README.md` text was overwritten (98ad63758).
  - A merge dropped `VC.ixUnitBox` (cfd971acd).
  - Amphitheatre work was lost in the Voth flatten (7fab85267).
  - memory: concurrent sessions.
- **The baseline.**
  - `--write` with others' uncommitted work is the standing warning (HANDOFF).
  - Pointer pages read as CHANGED (item 2b).

**Root cause.** Nothing maps a source file to the pages it reaches. Kits and most settlements write
`build-manifest.json` (input hashes), but only 1 of 32 biome builds does. The generators are all-or-nothing.

**Proposed core fix.**
- **5a (now).** One `tools/buildlib.py` helper every `build.py` calls at the end. It writes `build-manifest.json`: every
  input path (`/` separators) with its hash, including core fragments, other kits read in place and packs.
  `tools/reach.py <file>...` then lists every page that takes those files.
- **5b (now): `tools/check_stale.py`** (a `test_all.py --no-build` step). It compares each manifest's input hashes with
  the tree. A page whose inputs changed since it was built is STALE. It prints the build commands and reads no page
  bytes. This is the check the 2026-10-08 rule ("rebuild what a shared change reaches") needs.
- **5c (now).** `audit_port.py <build>` and `make_index.py <build>` write only that build. Without an argument they keep
  today's behaviour, with a confirmation flag.
- **5d (now).** `port_baseline.py --write` refuses while `git status` shows changes outside the pages being written, or
  while pointer pages exist. `--update <pages>` stays the normal path.
- **5e (rule).** Span's lesson in core's README: add a function to a widely taken fragment through an opt-in companion
  (`37b-core-stacks-contour.js`) and list it from the builds that want it. `reach.py` shows the cost first.

**Touches.** Tools, plus one line in each `build.py` (it changes no page bytes; the manifest is a separate file).

**Adopting it.** Before committing a core change, run `python3 tools/reach.py core/terrain/37-core-stacks.js`; CI's
`check_stale.py` fails if those pages were not rebuilt.

## 6. Registered volumes that read empty

**Pattern.** A volume is registered, but the probe finds nothing drawn in it, so verify fails late (after a GPU run) and
the kit adds points or discs by hand.

**Evidence (9 builds).**
- The Cut: a warp left 20 paperbark volumes behind.
- The Catch: dead poplars merged into one bark bucket.
- dambasins: merged debris; scablands: merged erratics (both closed 2026-10-25).
- swhighlands: "registered volumes of merged meshes come out empty".
- nwouterwall: only drawn aufeis may be registered.
- The Throne's savanna needed invisible discs; ringisles needed 22 invisible pick discs.
- eastabyss and swbay: the volume needs the real crown spread.
- Korona: "a plant made of buckets only needs one instance inside" (SKILL 5t).
- Span lesson 10: `probePoints` is a flat array, and `userData.host=true` is needed.

**Root cause.** The registry and the drawn geometry are produced separately. The probe samples a merged mesh by its box
centre, and `userData.probePoints` must be set by hand by each drawer. A volume does not follow a record that was moved
or dropped after registering.

**Proposed core fix.** The core drawers (BIO's bucket, KSTACKS, KFLAT and the flatten helpers) write
`userData.probePoints` themselves, one point for each record they draw, from the record's foot and id. The registry
volume is derived from the core/tags record at draw time, not registered separately, so a dropped record drops its
volume. The probe accepts triples or a flat array and names the volume and the drawer in its failure message.

**Touches.** core/biome, core/terrain and core/host (every page, at its turn).

**Adopting it.** Delete the build's hand-made pick discs and probe points; the drawer supplies them.

## 7. Plants and props on cliffs and steep faces

**Pattern.** A zone that reads a band (a bench, a crag, a wall's strata) puts trees and grass on sheer faces, and the
owner sees it in the first screenshot.

**Evidence (8 builds plus a standing rule).**
- memory: no trees on cliffs (the owner, 2026-10-05, on ebadlands).
- Each of these copies `zones() *= 1 - cliff` by hand: crater-drylands, ebadlands, ehighlands, shighlands, and the
  Rift ("mesa faces sprout grass sideways").
- 11 biome builds compute their own cliff gate.
- k-guilin: roots hung off stacks.
- nwbay: roots float on steep sites.
- Farside: a stalked plant on a steep face seats at the lowest ground round it.

**Root cause.** The rule is a convention copied per kit; core/biome's zones have no slope default and no check.

**Proposed core fix.** core/biome's placer multiplies every item's zone by `1 - cliff(slope, rock)` by default. An item
that belongs on faces opts in (`cliff: true`: lichens, cliff plants, hanging vines). A universal probe check (no item
without `cliff:true` where slope is near 1 and rock shows) comes with a negative control. `BIO.reachW` is already in
core for roots.

**Touches.** core/biome (every biome page at its turn; the kits that copy the gate delete it).

**Adopting it.** Remove the kit's `cliff` term and mark the cliff species.

## 8. Shader hooks that collide or silently do nothing

**Pattern.** Pages chain `onBeforeCompile` by hand: read the old hook, wrap it, inject a string at an `#include` anchor.
A second hook replaces the anchor or recurses through the first, or reads a uniform r128 does not upload, and the
effect silently never shows.

**Evidence.**
- 174 source files in 64 builds assign `onBeforeCompile` directly.
- The atmos snow never reached a leaf card on any page: it inserted after `project_vertex`, which the foliage hook
  replaces (swhighlands, 2026-10-27).
- `ATMOS.cloudShade` recurses after `WATER.wetGround` (nwouterwall's `KNOWN_ISSUES.md`, open).
- `cameraPosition` is not uploaded to Lambert in r128:
  - the ground tint dissolved past about 700 m from the world origin (hyperjungle, fixed);
  - the LOD fade had the same bug (2026-10-26);
  - two more uses in the same file are still open.

  43 source files mention `cameraPosition`.
- The impostor bake compiles before the late hooks (swhighlands, `needsUpdate`).
- r128's `color_fragment` comes after `map_fragment` (Span lesson 17).
- A `NaN` spliced into GLSL removed crater-drylands' ground (item 2).
- The Korona peristome's broken ring (79c8247dc).

**Root cause.** No shared composer. `ATMOS.shaderHook` exists but most hooks predate it, and an injection whose anchor
is gone does nothing instead of failing.

**Proposed core fix.**
- **8a (with the rebuild): `KHOOK`** in core (or `ATMOS.shaderHook` made the only door). Hooks are registered by name
  with an anchor and a position, composed in a fixed order once per material, with no chaining by reading
  `onBeforeCompile`. It **throws when an anchor is missing**, offers `kEye` (the eye from the view matrix) in place of
  `cameraPosition`, and marks materials `needsUpdate` when a hook is added after compile.
- **8b (now): a lint.** It flags `cameraPosition` inside a hook string and a template literal that splices a bare number
  into GLSL without `glf(x)`, a helper that throws on non-finite values. Use a ratchet baseline like `check_core_use`.

**Touches.** 8a: core/atmos, core/biome and core/terrain hooks (every page at its turn); 8b: tools only.

**Adopting it.** `KHOOK.add(mat, 'snow', {after: 'project_vertex', fallback: 'fog_vertex'}, glsl)` in place of a
hand-chained `onBeforeCompile`.

## 9. Colour space and exposure under the shared sky

**Pattern.** Colours tuned for one light rig render washed out or dark under the shared sky. Custom shaders skip sRGB
decode, and tints divided by a texture's mean clip to white.

**Evidence (10 builds).**
- k-guilin: raw hex Lambert went near white under the 2.3 sun; it needed `convertSRGBToLinear`.
- The isle demo: buildings washed out.
- Bark tints clipped to white: the hyperjungle (45a48df3d), nwbay, swbay, xanadu, the Throne (lehua pale).
- eastabyss, nwbay and swbay write colours "a stop darker" for the sun plus hemisphere rig.
- nwlowlands and swlowlands: tints rewritten for tone mapping.
- Farside: a raw `texture2D` on library layers rendered the wrack as pale sand (SKILL 5u).
- Span lesson 18: an sRGB-looking target washes pale.
- swbay: core/water's ext/54 gives sRGB hex and the page linearises it (rebuild-swbay).
- Earlier fixes: the Voth catalog's sRGB colour fix (359297b13) and Jimjam's sRGB colours (a0132bcaa).
- 44 source files decode with `pow(c, 2.2)` by hand.

**Root cause.** r128 converts nothing for you, and each page writes its own decode and its own tint arithmetic. Nothing
measures whether a view's exposure is sane.

**Proposed core fix.**
- **9a (with the rebuild): `KCOLOR`.** `KCOLOR.lin('#a8382a')` in JS, and a GLSL include with `sampleSRGB(tex, uv)` and
  `srgbToLinear`. core/biome's `tint`/`texMean` clamp so that a tint never exceeds 1 after the mean divide.
- **9b (now): a lint.** A raw `texture2D(` on a library map inside a hook without `sampleSRGB` or a decode (ratchet
  baseline).
- **9c (with item 2d): a per-view check.** The mean and the 99th-percentile luminance of each verify view must lie in a
  band for its hour. A wholly washed-out or black view fails.

**Touches.** 9a core (pages at their turn); 9b tools; 9c the harness.

**Adopting it.** Swap hand `pow(c, vec3(2.2))` for `sampleSRGB`, and hex colours for `KCOLOR.lin`.

## 10. Camera and preset views inside geometry; stations without views

**Pattern.** Preset views are written before the terrain or the crowns exist and end up inside a hillside, a trunk or a
crown. `verify.py --cam` clamps to the ground, so a view under a lip lands on the tableland.

**Evidence (6 builds plus the harness).**
- xanadu: "preset views written before the terrain exists end up inside hillsides and trunks".
- swlowlands: `viewTree` keeps the camera outside the crown.
- Korona: views inside trees, and a view at a plant's foot inside its crown (SKILL 5t).
- The hyperjungle: `HCHK.views`.
- sedesert: "no camera inside rock".
- nwbay: the camera clamped to an undrawn surface.
- Span lesson 9: `--cam` clamps to the ground.
- dambasins' camera floor line was swallowed by a comment (c34ba1558).
- Station pages need their own views (HANDOFF: "each build's verify views keep their own modes").

**Root cause.** A view is a pair of numbers with no check; each build that cares writes its own.

**Proposed core fix.**
- **10a (with item 2d).** For each view, the harness casts from the eye up and in six directions against the rendered
  meshes. It fails when the eye is under the drawn ground, inside a closed mesh, or nearer than 1 m to a surface it
  faces. It reports the view by name.
- **10b (now): a lint.** Every `--station` a `build.py` can write (`stations/*/` or `station.json`) has its own `VIEWS`
  entries in `verify.py`, and every view name is file-safe.

**Touches.** The harness and the lint; no page bytes.

**Adopting it.** Nothing per build beyond listing the views; KHOST's found views (`viewTree`) become the recommended way
to write one.

## 11. Z-fighting and coplanar faces

**Pattern.** Two faces at the same depth flicker with the camera: a slab on the ground, a lintel in a wall, a roof on a
floor, a still on flat ground.

**Evidence.**
- Commits since 2026-09-28:
  - Girder (0dc5bb563);
  - the walk mockup (2f5f92598);
  - Ancients arcA (38a3dac47) and the Trigon plaza (83959985e);
  - Jimjam (fdffa71d4, a coplanar resolver plus a log depth buffer);
  - the Longhouse (94ac4f939);
  - Zeijani (5e2ffb6ac);
  - Voth's interiors (6015e6c57);
  - the Iziz palace (6974f4975) and Iziz's interiors (99e69a83b);
  - the Eternian kit (db5c9a192).
- The hyperjungle's lake shore (2026-10-27, `depthBias`).
- swbay: coarse ground through fine ground.
- The Lizardmen: an inverted wall normal looked like z-fighting (SKILL 5i).
- 21 builds set `polygonOffset` by hand.
- Per-kit audits: the mechs' z-fighting audit, Iziz towers' z checks, Jimjam's resolver.

**Root cause.** Each kit finds coplanar faces by eye, then fixes them with a hand offset or a nudge. Core has no audit
and no depth-layer convention.

**Proposed core fix.**
- **11a (now): `tools/zaudit`.** It lifts the mechs and Jimjam coplanar detectors into one node tool over a page's
  exported geometry (`core/export` already writes it): triangles from different meshes within ε of the same plane and
  overlapping in plan. It reports by record id, in the walk-audit style.
- **11b (with the rebuild): `KDEPTH`.** Named layers (`ground`, `decal`, `still`, `trim`) map to polygonOffset factors
  in one place, in place of hand values.

**Touches.** 11a is tools only; 11b is core/host (pages at their turn).

**Adopting it.** Run `zaudit.py <page>` in a kit's verify, and use `KDEPTH.set(mat, 'decal')`.

## 12. Map edge, horizon void and seams to the far field

**Pattern.** From a high camera or a rim, the edge of the ground mesh, a void, or a hard line shows.

**Evidence (7 builds).**
- The Catch: a void past the ground mesh.
- The Cut: sky ridges over the floor, and a culled skirt that read as snow.
- godthrone: the map's edge from the rim.
- The Throne: a hard line at the map edge.
- The Rift: "the sky at the seam".
- swbay: edge sampling.
- swhighlands and sedesert: insets need rim alignment or T-junction fans.

**Root cause.** Each build makes its own far apron and inset joins.

**Proposed core fix.** One `KFIELD.apron(field, {to: horizonR})` in core/terrain: a ring stitched to the drawn edge with
T-junction fans, and the far field's colour from the sky's horizon. The inset join is in core too.

**Touches.** core/terrain (biome pages at their turn).

**Adopting it.** Replace the build's skirt and apron code with one call.

## 13. Placement that moves when a pass is added

**Pattern.** A grid placer draws from one sequential stream, so adding or reordering a pass shuffles everything after it.

**Evidence (8 builds).**
- swhighlands' LESSONS item 6: `BIO.grid` is stream-ordered.
- sedesert: a reseed reshuffled 477k of 544k instances.
- The Cut: read-in kits draw from their own sequential streams.
- nhighlands: the test tower reseeds.
- ehighlands, Korona and crater-drylands: sin-hash findings.
- abyssal-savannah and necanyons moved to per-cell KRAND.

**Root cause.** `BIO.grid` predates the KRAND-cell rule; `check_core_use` catches sin-hashes, but not stream order.

**Proposed core fix.** `BIO.grid` on KRAND cells (one hash per cell, from world, cell, index and salt), with the old
grid kept behind a flag for pages not yet rebuilt. `check_core_use` flags new calls to the old form.

**Touches.** core/biome; pages move once at their turn, as planned.

**Adopting it.** `BIO.grid(salt, cell, accept, fn)`, the Farside `kgrid` signature.

## 14. Undefined settings and `|| d`

**Pattern.** An undefined option reads as "everything", or a 0 is replaced by a default.

**Evidence.**
- Korona: an undefined meadow bias read as 1, placing 918,541 cobra lilies.
- nwouterwall: a missing season key "plants nothing, or plants everything".
- xanadu: `opt.R == null`, not `||`.
- The hyperjungle's 70: `opt.R` and `opt.heroR` (2026-10-27).
- `grep` finds 224 occurrences of `o.<name> || <number>` in core and the biome sources.

CLAUDE.md states the rule; nothing checks it.

**Proposed core fix (now).** A lint: `|| <numeric literal>` on an option read, in core and in `src/`, with a ratchet
baseline. Also a `KOPT.num(o.x, d)` helper, and a `KOPT.req` that throws on an undefined key in a table a placer
indexes (season, bias).

**Touches.** Tools; core helpers are opt-in.

**Adopting it.** `KOPT.num(o.scale, 1)` for new code; the ratchet shrinks the old code.

## 15. Wrong winding, back faces culled

**Pattern.** A wrongly wound outline drops its sides, or a lathe wound inward lights its back faces black.

**Evidence (4 builds).**
- nwbay: 12 stacks wound clockwise, so near walls were culled; a host sweep was added.
- The Cut: a culled skirt.
- swhighlands: a lathe wound down and in.
- The Lizardmen: `prism()` clockwise, and the inverted wall normal (SKILL 5i).

**Proposed core fix.** Promote nwbay's winding sweep (the share of each mesh's face normals that point out from its
bounding centre) into the probe as a report, and into `zaudit` (11a) as a check. Core's prism and lathe helpers order
their own outlines.

**Touches.** core/host and the tool.

**Adopting it.** Nothing per build.

## 16. Verify infrastructure

**Pattern.** Sessions lose hours to the machine, not the page.

**Evidence (7 builds).**
- A dead holder of the GPU lock stalled four agents for three hours (2026-10-26, HANDOFF).
- Lock contention in the Catch, k-guilin, swhighlands and nwouterwall.
- Stopped verify loops leave `chrome-headless-shell` orphans at 500 MB each (SKILL 5t).
- Hidden panes do not render, so `SKY.state` is stale (the Cut) and sun-dials do not tick (sedesert).
- `harness smoke` crashed every page on one machine (core-strata).
- SwiftShader flakes.
- memory: kill by PID.

**Proposed core fix (now).** The harness owns the lock: a lock file holding its PID and start time, a stale lock (dead
PID) taken over with a message, and a wait with a timeout and a report. It launches Chromium in its own process group
and kills that group on exit or a signal. `harness renderer` runs at the start of a GPU verify and refuses SwiftShader
when `KRATOR_GL=gpu`.

**Touches.** `tools/harness.py` only (and the verifies that take 2d).

**Adopting it.** `with harness.gpu_lock(timeout=1800):`, and stop writing lock loops in bash.

## 17. Text and Windows traps

**Evidence.**
- A trailing `//` swallowed the rest of a packed line:
  - c34ba1558 (nsemiarid's gale check, dambasins' camera floor);
  - 17fe592df (xanadu's mask brace);
  - 605524cfd (Roketstad's street growth);
  - Erewhon 9c, four times in one session (memory).

  `node --check` catches the lost brace, not the lost statements.
- CRLF and LF mixed: revert churn (Span lesson 3, swhighlands), and Godot's `atmos_test.gd` failing on EOL only
  (HANDOFF).
- Heredoc escapes mangling `\'` and `\n` (Span lesson 8, SKILL 5u, memory: bash backslashes).
- A `:` in a view name writes an NTFS stream (Span lesson 8, nwouterwall).
- `os.sep` in Verge's page (CLAUDE.md, fixed by `check_encoding`).

**Proposed core fix (now).**
- A comment lint over `src/`. For a `//` comment that follows code on a packed line, it parses the comment's text: two
  or more statements, or a closing brace, is flagged.
- `.gitattributes` pins `eol=lf` for `src/**`, `*.md` and `*.gdshaderinc` (one renormalising commit, no page bytes if
  the pages are already LF).
- The harness replaces `:` and other unsafe characters in view names when it writes files.
- A `tools/splice.py` that edits a fragment from a scratch file, to replace heredoc edits.

## 18. The skill grows as a log

**Pattern.** `SKILL.md` is 164 KB in 30 sections, most "Added from" or "Lessons from" a build. The same lesson is
written again by each session that meets it:
- LFS pointers: 5p, 5t, Span, HANDOFF, memory;
- `audit_port`/`make_index`: 5t, Span, HANDOFF, LESSONS;
- the drawn mesh: 5p, 5t, Span, memory;
- count before you look: 5u, LESSONS.

A new session cannot read it all, so it relearns the trap.

**Proposed fix (now).**
- Restructure it into a short **checks catalogue**: each recurring lesson, the tool or invariant that now enforces it
  (from this file, as they land), and the command.
- Move the build stories to `references/`.
- When a check lands, remove the lesson it enforces from the prose; leave a line saying the check exists.
- A session's lessons go first into its notes; a lesson seen twice becomes a check request, not a third paragraph.

---

## Settlements and kits: what they add to the ranking

The settlements' and kits' 88 issue files rank the same classes: placement, budgets, z-fighting, colour, order. They
add three that the biomes barely show.

### 19. Vendored-file drift (about 17 kits and settlements)

**Evidence.**
- Ancients: Dalab, Highlands, Jimjam, Reed Lake, xanadu, Ys and Screamers are "behind until re-vendored" (its
  `KNOWN_ISSUES.md`, lines 19 to 25).
- Iziz: 28 drifted fragments, re-vendored down the chain on 2026-10-06.
- The catalog: `krator-symbols.js` (TODO, "Ride along").
- Verge: Locus's sky and day-night copies.
- Mav's Refuge: `84-flyers.js` is about 9 KB off Girder's.
- Screamers: an old Vashtir fork.
- AUDITS.md batch 3: "re-vendor drift after the core/biome move: not done".
- The fixes copied per build: the night fix ported three times (Mav's Refuge, Girder, Locus, then Verge vendored
  Locus's); the sky's `pow(h, .55)` band fixed on four pages separately; three z-fix resolvers.

**Root cause.** Vendoring is a copy with a drift report (`--vendor-check`), and nothing makes a session act on the
report.

**Proposed fix.**
- `--vendor-check` runs for every vendoring build in `test_all.py`, as a ratchet: the set of drifted files may only
  shrink, and an `ADAPTED` entry needs a reason.
- Item 5's input manifest lists vendored files with their upstream path, so `reach.py` on the upstream file names the
  vendors too.
- For the long chains (Ancients to Iziz to the vassals), item 4d's rule applies: a fix copied a second time is promoted
  to core.

**Lands now:** yes (tools).

### 20. Doors and stairs (about 12 kits and settlements)

Covered by item 1's `doorSweep()`. The walk audit (`tools/walk_audit`) and `IX.walk.register` already answer "can a
walker reach every floor" for two families of kit. The door ray and the stair-head check make it universal, and
TODO's "Opening doors as a core module" gives the door records it needs.

### 21. Instance and vertex colours lost when geometry is merged or flattened (6)

**Evidence.**
- Ancients: `meshMerged` dropped colours.
- The isle demo: `isleFlatten` dropped `instanceColor`, so the towns read white; Hook needed the same fix (memory:
  flatten keeps instance colours).
- Mungo: `setColorAt` with count 0 made everyone black.
- Dalab, xanadu.

**Proposed fix.** One core flatten and merge (`KFLAT.flatten(group)`, in core/lod or core/export, which already walks
these meshes). It bakes `instanceColor` and vertex colour, and keeps `onBeforeCompile` and `customProgramCacheKey` on
clones: kbake's clones dropped them (Ancients, Screamers' wind). A node test runs on a coloured instanced fixture.

**Lands now:** the module and its test, yes; builds adopt it at their turn.

### Smaller additions from the same read

- **Item 3 (budgets).**
  - Iziz's city page is 24.6 MB, "already over the gallery's 16 MB".
  - Budgets only fail with `--strict-budget`; the default prints OVER and passes.

  Make strict the default, with `BUDGETS.json` as the exception list.
- **Item 4 (order).**
  - The isle demo and Verge: `vnPlate is not defined`, because `izv_files` lists the Vernacular's files by name and missed
    `69e5` (2026-10-20).
  - Yuni: a life fragment registered too late.
  - Ys and Dalab: `86-bio-45` must bind THREE before 50.
  - Ancients: the `plateY` temporal dead zone.
  - Girder's hero calls walker functions the port removed.

  `check_assembly.py` catches the first and the last.
- **Item 8 (hooks).**
  - `vWorldUV` closures shared one program until `customProgramCacheKey` (`core/materials/opt/69a-world-uv.js`); Span
    still swaps in Dalab's own.
  - A failed `String.replace` on a shader is silent; Ancients added an anchor check in `--eval`.

  `KHOOK`'s throw on a missing anchor is the general form.
- **Item 9 (light).**
  - The hemisphere's ground colour browns soffits (Ancients).
  - Metal without an envMap reads black (Ancients, Zeijani, Screamers).
  - Tone mapping differs between a kit's page and the town that takes it (the Beast Riders, the isle demo, Mav's Refuge,
    Girder).
  - sRGB mistakes in 7 more builds (Ancients, Jimjam, Shade, the port, Ringsea, Iziz, post-apoc).

  `KCOLOR` plus a per-view luminance band covers the first and last. A lint for `metalness > 0` without an env map is
  cheap.
- **Item 13 (determinism).**
  - Shuffles with a random comparator changed Roketstad's layout on every load (Highlands, 2026-10-15) and Verge's.
  - The Scyvoi engine's `Math.sin` hash is vendored into the Islanders, the Eternian kit and the nomads.

  Add `sort(() => Math.random() - .5)` and its kin to `check_core_use`'s patterns.
- **Item 16 (infrastructure).**
  - `CONTEXT_LOST_WEBGL` on Iziz, Pylon and Talia.
  - SwiftShader dropping the 163rd `linkProgram` (Girder) and the interiors' sheets.

  Teardown between verify pages is suspected. The harness-owned browser of item 16 is where to fix it.

**Not recurring enough to rank.** NaN geometry (one case; the probe's `nanSweep` exists). Triangle soup (two). `x || d`
eating a 0 (no recorded case in the settlements; four in the biomes, item 14).

## Survey of 2026-11-11: what the biome rebuild round's sessions hit (check requests)

At the end of the biome rebuild round the owner asked about 60 sessions for their pitfalls; 57 answered (the story, by
theme, is the skill's 5w in `references/stories-rounds.md`). Per the skill's growth rule, every lesson two or more
sessions hit is a check request here, not a third paragraph. Most are tools-only (no page moves).

- **22. A "GPU" verify in SwiftShader** (7 sessions). Make `gpu-renderer` a hard fail whenever a lane lock is held (a lane
  without `KRATOR_GL=gpu` is a mistake, not a mode), and print the renderer in the harness's first line.
- **23. LFS pointers read in place** (10+). `tools/build.py --pull` (or a `tools/lfs_needs.py <build>`) that lists every
  `tex/` and `dist/*.js` a page reads, from `--list-sources` and `fragment_needs.json`, and pulls them in one go; plain
  `build.py` files refuse pointers as `tools/build.py` does; node tests that require a `dist/` file name the pull to run.
- **24. Docs and listed folders as build inputs** (5). `check_stale` says "docs only: rebuild, bytes unchanged" when the
  only changed inputs are `KNOWN_ISSUES.md`/`PORT.md` or a folder listing, so nobody chases it.
- **25. Builds that skip `tools/build.py`** (5). Each kit's `build.py` writes `build-inputs.json` itself (shared helper),
  or refuses to write `dist/` unless called through `tools/build.py`.
- **26. Missing core fragments on hand-listed pages** (4: `31b-core-leafset.js`). `check_assembly` names the fragment to add,
  and a `CORE_BIOME_MIN` list (10, 20, 30, 31b, 34, 40) is the default a build extends.
- **27. Texture units** (4 + the ground that vanished). A universal assert that reads every linked program's sampler count
  (fail at 16 on any lane, warn at 15), replacing `samplersOf`'s guess, which overcounts.
- **28. Audits against the drawn ground** (5). `drawnH` as a core function (strip cells, else the mesh's triangles); the
  eye check, the water audit, the cliff gate and the attach audit's ground all take it by default.
- **29. Negatives written backwards, predicates shadowing `ok`** (3). The node test helper refuses a negative that passes
  on the fixed code and refuses a local named `ok`; the pass count is printed against the number of `ok(` calls in the file.
- **30. Windows text traps** (9 commit messages, 8 heredocs, BOMs twice). A `tools/commit.py -m-file` helper; a pre-commit
  check for a BOM, mojibake (`Ã`, `â€`) or CRLF in staged text; `check_views` and the build both refuse apostrophes and
  colons in view and check names.
- **31. Stale committed pages passing verify** (3). The verify cache records the page's source hash; a pass on a page whose
  sources moved since is reported "stale pass", not "pass".
- **32. Owed fixes the survey found** (one session each, each small): KHOOK clones re-running layers; `43-core-ground.js`
  reading `kEye`; `kits/fauna/src/90-sheet.js:147` `_texPending` as a function; `BIO.alphaTex` without
  `willReadFrequently`; library-card mipmap fringes (fill transparent texels as `alphaTex` does); KKARST duplicate sink ids
  across branch levels; 19 biome `build.py` files writing CRLF pages; `check_source` not scanning kits' top-level files;
  hyperjungle's harvest-wood phrases failing `test-hamlet.js`; the ISK error loop.

## Order of work this suggests

1. **Now, tools only, no page moves** (an afternoon or two each):
   - 2a and 2b (LFS);
   - 5a to 5d (manifests, reach, stale check, scoped generators, baseline guard);
   - 4a (assembly check);
   - 16 (lock and orphans);
   - 17 (comment lint, view names);
   - 14 (`||` lint);
   - 8b and 9b (shader lints);
   - 10b (station views);
   - 3a and 3d (page cap, `BUDGETS.json`);
   - 19 (vendor ratchet);
   - 18 (the skill).

   Each is a `test_all.py` step with a ratchet baseline where old code would fail it.
2. **Before the next biome turns** (they take it as they rebuild):
   - 2c and 2d (`harness.verify_page` with the universal asserts);
   - 1 (`KSEAT` and the probe sweeps);
   - 6 (probe points from the drawers);
   - 7 (cliff default);
   - 8a (`KHOOK`);
   - 9a (`KCOLOR`);
   - 13 (`BIO.grid` on cells);
   - 3c (count cap).

   These change shared fragments, so landing them early means each page moves once, at its own turn, rather than twice.
3. **With stage 2's kits and settlements:**
   - 11 (`zaudit`, `KDEPTH`);
   - 21 (`KFLAT`);
   - 20 (doors);
   - 12 (the apron);
   - 4c (export contracts for the kits read in place).
