# Krator: evaluation synthesis and roadmap (2026-10-08)

Three evaluations of this repository were made in the week of 2026-10-05: one by ChatGPT, one by Gemini
(both in `evals/`, as the owner received them) and this one, made in a Claude Code session that read the other
two, then checked every concrete claim they make against the code at `b772f2c7` with five verification passes.
This file is the synthesis: what the three agree on, which claims hold, what the other two missed, and the
order of work that follows. It does not replace `GODOT-PLAN.md` (the phases and rules) or `TODO.md` ("Port:
next", the ordered list); section 6 is the amendment to that list.

## 1. The verdict

All three evaluations reach the same architecture, and it is the one `GODOT-PLAN.md` already states: three.js
stays the authoring and preview renderer, records are the truth, Godot is the runtime, and nothing is rewritten.
ChatGPT's one-sentence version is right: *a build is a world-data generator that happens to have a three.js
renderer attached*. There is no architectural decision left to make.

What the other two evaluations under-weight is that the plan's **execution** is the problem, not its shape:

- **Modules exist; adoption is partial, and the rules are already being broken.** `core/tags` is in 15
  builds, `core/mask` 7, `core/simulation` 2, `core/walk` 1; `core/rand` is listed by 14 but drives placement in
  three; `core/terrain`'s field and `core/host/` are not started. Verge wrote its own `SIM`
  (`settlements/verge/src/74-verge-sim.js:23`) after `core/simulation` was written, so the repo now has a third simulation dialect beside Voth's and the core's. Rule 6.11 of the plan
  ("a new core module ships with its first consumer") was written because `walk`, `sched` and `KRELIEF` had
  none; `walk` still has one, `KRELIEF` none.
- **Nothing is enforced by a machine.** No CI, no runner for the 15 `core/*/test-*.js` node tests, 46 copies
  of `verify.py` with no shared module, `port_baseline.py` and `core/furnish/fingerprint.py` run by hand. Every
  guard the plan relies on is a convention an agent must remember.
- **The documents drift from the code within days.** At 298 commits in the week before this evaluation, the
  plan surface (eight root documents, ~180 KB, plus a `README`, `INDEX`, `PORT`, `KNOWN_ISSUES` per build) is the
  project's memory, and it is stale in places both external evaluations then repeated as current findings
  (section 2). Gemini's bug list is largely the plan's own "what does not cross over" table from 2026-10-02,
  three items of which were fixed by 2026-10-05.

The technical gaps that matter most, in order: the terrain field (not started; both evaluations and the plan
agree it is the missing substrate), one exporter (`core/export` does not exist; the spike runs on four
dialects), the life layer (Voth's 500 KB bespoke runtime, now with Verge's as a second), and the preview's
geometry economy (furniture batches unrolled, fixed segment counts, Voth still placing from a real canvas).

## 2. Claim scorecard

Every concrete claim in the two evaluations, checked. "Stale" means it was true when the repo's own plan recorded
it and had been fixed before the evaluation was written.

| # | Claim | Source | Verdict | Evidence |
|---|---|---|---|---|
| 1 | `BIO.iridBarkMat` is defined per kit with conflicting signatures; the last kit loaded wins | Gemini bug 1 | **Real hazard, tracked, not hit today.** Five kits define it, not four (eastabyss, rift unguarded; nhighlands, shighlands, xanadu guarded with `\|\|`). Only eastabyss's signature differs (no tints). The uniform names are identical, so "conflicting uniform names" is false. No current build bundles two definers: little-demo takes sedesert+eastabyss+hyperjungle+ebadlands, Verge sedesert+eastabyss | `biomes/eastabyss/src/50-biome-eastabyss-species.js:320`, `biomes/rift/src/50-biome-rift-species.js:401`, `TODO.md:110`, `openworld/little-demo/build.py:36-45` |
| 2 | `core/lod` copies reach the glTF beside their originals, doubling triangles | Gemini bug 2 | **Stale: fixed 2026-10-05** (`f7013ad6`). The exporter bakes from a fresh root and drops anything under `userData.lodCopy`; the importer drops them too. Iziz's `region.glb` went 12.05 MB to 7.32 MB in that commit | `godot/tools/spike_export.js:24,118`, `godot/krator/gltf_region.gd:43-62`, `GODOT-PLAN.md:580` |
| 3 | City placement reads anti-aliased canvas pixels, so building counts differ by browser (Dalab 875 vs 882) | Gemini bug 3, plan §1 | **Stale for the four cities named: fixed 2026-10-05** by `core/mask` (`KMASK.canvas`, integer-exact). **Still true for Voth**, which neither evaluation checked: its mask is a real canvas and `openAt(x,z)` is a pixel threshold feeding about ten fragments | `settlements/dalab/targets/city/85-city-paint.js:13-14`, `settlements/voth/src/40-ground.js:14-16,232`, `settlements/dalab/KNOWN_ISSUES.md:86-100` |
| 4 | The furniture batcher unrolls indexed geometry; a cube's 8 vertices become 36 | Gemini bug 4 | **Real, overstated.** `Batch.prototype.absorb` pushes one vertex per index and `flush` sets no index, nothing re-welds. A three.js box has 24 vertices (per-face normals), so it is 1.5x, not 4.5x; smooth cylinders and spheres lose up to about 6x. One batcher serves six call sites, so one fix covers all | `kits/catalog/krator-furniture-runtime.js:85-131`, `core/furnish/52-core-furnish-draw.js:17`, `kits/interiors/adapters/runtime-adapter.js:8` |
| 5 | Voth sets `frustumCulled=false` on every InstancedMesh, so all instances are processed every frame | Gemini bug 5 | **Real line, mitigated at runtime.** The line is deliberate (r128 culls instances by the base geometry's sphere at the origin). Voth takes `core/lod`, which hides the originals and draws copies with a sphere computed from the instances and culling on. Repo-wide: 260 such lines in 149 files; the biome kits do not take `core/lod` (they have `BIO.LOD`) | `settlements/voth/src/45-kit.js:484`, `core/lod/09-lod.js:195-216,330`, `core/atmos/89-atmos-7-cull.js:2-3` |
| 6 | Packed normal maps are lossy WebP (4:2:0), halving X/Y resolution; 40 sets still on `normal.png`, which `kmat.gd` cannot read | Gemini bug 6 | **Half real, known.** `pack.py` writes normals at WebP q92 with no `lossless`, so 4:2:0; the repo recorded this on 2026-10-06 (`TODO.md`, "Normal maps after the JPEG switch"). 39 sets (not 40) are on `normal.png`; they pack fine. The `kmat.gd` part is wrong: Godot reads each build's `tex/*.webp` pack, never the library, so a library `normal.png` never reaches it | `tools/textures/pack.py:68-73,113-115`, `godot/krator/kmat.gd:71`, `core/materials/PLAN.md:1279-1280` |
| 7 | `build.py` in girder, mavs-refuge, voth, yuni writes without `encoding='utf-8'` | Gemini bug 7, `README.md:77-79` | **Stale: those four are fixed.** Eight text-mode opens still lack it, in verge (`build.py:246`), ys (`:78`), ash-nomads, desert-nomads and scyvoi (`:88,:165` / `:83,:160`). `README.md` names the wrong builds | `settlements/verge/build.py:246`, `kits/scyvoi/build.py:83,160` |
| 8 | `scale \|\| .0017`, `seed \|\| 9483` make 0 mean the default | ChatGPT §6 | **Real, latent.** `BIO.standAt` and eight vendored copies; no caller passes 0. One more of the same shape is a plausible bug: `mesh.renderOrder=order\|\|3` (0 is a legal renderOrder). 16 `a = b \|\| <number>` assignments in `core/`, four defaulting to 0 harmlessly | `core/biome/40-core-place.js:12`, `core/atmos/89-atmos-0-core.js:92` |
| 9 | `BIO.clearOf` is linear in the obstacle list; `BIO.scatter` is O(n²) | ChatGPT §7-8 | **Real shape, low impact as used,** with one exception: Throne pushes every placed tree into `obstacles`, so `clearOf` there grows quadratically. `scatter` has four callers, all hyperjungle, all small. little-demo already has the fix pattern (24 m buckets, neighbours within 60 m, order-independent "yield to the stronger") and does not use these functions at all | `core/biome/40-core-place.js:44-57`, `biomes/throne/src/60-biome-throne-floor.js:218`, `openworld/little-demo/src/85-world-flora.js:89` |
| 10 | The biome export keeps the whole vertex list per tile and only the tile's triangles | ChatGPT §11 | **Real, documented as the contract.** The importer is expected to drop unused vertices; it does not yet | `biomes/GODOT.md:78-79` |
| 11 | Spike numbers: Girder ~910k tris / 57 meshes / 521 instances / 11 MultiMeshes; Iziz ~360k / 161 / 6,752 / 122 | ChatGPT §17, Gemini §1 | **Confirmed** from `godot/spike-report.json` (909,813 and 360,183) | `godot/spike-report.json` |
| 12 | Rift holds 25.7 M triangles in 1,737 meshes | Gemini §1, §4.1 | **Describes the three.js preview, not Godot.** The rift tile exported to Godot is 186,920 triangles, 48,432 instances. "1,737" is the preview's bake splitting 58 meshes (`_bakeCalls`); the `biome.json` is 25.6 MB, which may be the source of the "25.7" | `biomes/rift/KNOWN_ISSUES.md:13-18`, `godot/spike-report.json` |
| 13 | Instancing cut Girder's export 21 to 18 MB and Iziz's 33 to 12 MB | Gemini §4.2 | **Out of date.** Those were the 2026-10-05 numbers (`GODOT-PLAN.md:550`). Today Girder's `region.glb` is 22.1 MB (re-exported with the Beast Rider textures and the environment map) and Iziz's is 7.4 MB (after the LOD-copy fix) | git object sizes |
| 14 | Host shell copies: camera 38 (32 versions), probe 36 (31), sky 35 (19) | Gemini §2.1 | **Derived, not measured:** each is the sum of two rows of `PORT-INDEX.md` (`camera` 22+`host-camera` 16, `probe` 20+`host-probe` 16, `sky` 19+`host-sky` 16); the versions likewise. Consistent with the repo, but the two families are different code | `PORT-INDEX.md`, "Host-shell copies" |
| 15 | 39 `terrainH` definitions; 26 PRNG/noise implementations; three material vocabularies; four exporters | both | **The plan's own 2026-10-02 counts** (`GODOT-PLAN.md` §1), repeated. Still true in shape, except the exporters: there are now nine `X.export()` entry points in `core/` plus Yuni's and the interiors kit's (section 3.1) | `GODOT-PLAN.md:31-52` |
| 16 | Draw-call and triangle budgets should become a test | ChatGPT §33 | **Already exists.** About 30 builds define a `BUDGET` (`drawCalls`, `triangles`, `instances`; Girder adds a furniture line) and `verify.py --assert` fails on it. What is missing is the cross-build report and per-class budgets (section 4) | `settlements/girder/src/05-palette.js:157`, `settlements/girder/verify.py:182-264` |
| 17 | Duplicated files: 132 groups of JS, 297 copies, 13.5 MB; three.min.js in ~20 places; 426 groups of textures, 68 MB | ChatGPT §1 | **Reproduced exactly on the review's scope** (`archive/`, the Menagerie and `godot/data` included). On the source scope: 131 / 295 / 12.9 MB, of which `three.min.js` is 10.3 MB; images 363 / 985 / 59.7 MB, all per-build `tex/` packs. Section 3.1 | this session's census |
| 18 | The furniture primitives use fixed segments (`mkCyl` 16, `mkDome` 16x10); size-aware tessellation would cut furniture triangles 65-75% | Gemini §4.1 A | **Plausible, unmeasured.** The segment counts are as stated; the saving is a projection. Girder's verify already separates furniture triangles (`furn.tris`), so it can be measured before and after | `kits/catalog/krator-furniture-core.js`, `settlements/girder/verify.py:185-188` |

Where the two evaluations disagree with each other: ChatGPT puts the host shell first (P0); Gemini puts it third,
after bug fixes and geometry. The repo's plan narrowed the shell on 2026-10-02 to the biome kits plus one
settlement per lineage, because moving 31 builds buys no Godot capability. This evaluation sides with the plan
(section 5, stage 3), with one addition: the `verify.py` harness, which is the one host-side copy that blocks
automation, comes first.

## 3. What the other two evaluations missed

### 3.1 The repository's copies and weight

Both evaluations' duplication figures reproduce exactly when `archive/`, `host/WorldMenagerie/` and `godot/data/`
are in the scan (132 JS groups / 297 copies / 13.5 MB; 426 image groups / 1,105 copies / 68 MB). On the source
scope that matters:

| What | Groups | Extra copies | Redundant | Of which |
|---|---|---|---|---|
| JS, source scope | 131 | 295 | 12.9 MB | `three.min.js`: 18 copies, 10.3 MB; everything else 2.6 MB |
| Images outside `core/materials` | 363 | 985 | 59.7 MB | all of it packed `tex/` sets written per build: 42 `tex/` folders, 151 MB; `concreteR.normal.webp` 27 times |

The JS duplication after `three.min.js` is small and almost entirely the Ancients lineage vendored into seven
settlements (`10-core`, `32-surfaces`, `34-kitdefs`, `36-decor`, `38-helpers2`, `50-registry` byte-identical in
eight places; `54-mat-concrete` in eight, `69-mat-salvage` in seven, `81-sky` in fourteen), which `--vendor-check`
already tracks and `core/README.md` already lists as the next move into `core/materials/opt/`. The image
duplication is structural: `pack.py` writes a copy of every library set a build takes into that build's `tex/`,
so one packed `concreteR` lives in 27 places. A pack keyed by set and shared across builds (or packs out of git
with the built pages) removes 60 MB and makes ChatGPT's content-addressed assets (§29) real at no design cost.
The `core/materials` images are all LFS pointers in this clone (1,829 files), so nothing could be compared
against the library here.

**Terrain:** 42 real heightfield `terrainH` definitions in 31 builds (plus 15 flat `return 0` stubs and 19 inner
helpers; the plan's "39" is in range). Throne alone has 11, one per station. All 16 `CORE_TERRAIN` adopters still
define their own.

**PRNG and noise:** mulberry32 is inlined as `rng()` in 29 files across 21 builds (five distinct bodies);
Park-Miller `rnd()` in 13 files (the Voth lineage plus seven one-offs); the `Math.sin` frac-hash `h3` is
byte-identical in 31 copies across 26 builds; `fbm` has 36 sites (seven bodies), `vnoise` 27 (two). The plan's
"26 implementations" undercounts sites and overcounts algorithms: the bodies are mostly identical, so retiring
them is mechanical. `core/rand` is listed by 14 `build.py` files, but only three builds generate from it (Ys,
Verge, little-demo); the other eleven take it for the tags' uid hash only.

**Exporters:** nine `X.export()` entry points in `core/` (`BIO`, `ATMOS`, `SIM`, `KTAGS`, `KMASK`, `KWALK`,
`KMAP`, `KSCHED`, `KMAT.table`) plus Yuni's `KRATOR_EXPORT` and the interiors kit's `IX.exportPlan` /
`exportBuilding`, each writing its own `format:'krator-*'`. Stage 2d's `core/export` is a container over these,
not a rewrite.

**Shaders:** 263 `onBeforeCompile` and 225 `ShaderMaterial` lines in 47 builds (Throne alone has 54
`ShaderMaterial`s).

**Host shell:** `core/host/` does not exist and no build sets `CORE_HOST`; builds' `src/` hold 140 `*host*`
fragments with 127 distinct hashes. Phase 1 has not started beyond the clock.

The working tree is 1,002 MB without `.git`; `.git` is 798 MB (LFS objects not fetched). Built HTML is committed
and is over half the tree: 425 MB across 39 `dist/` folders plus 104 MB of Voth-lineage pages written beside their
`build.py`. The textures were moved to LFS and the history cleaned on 2026-10-05; the built pages were not, and
they are regenerated deterministically from `src/` by every `build.py` and published by `gallery/`. Every one of
those pages re-enters the pack on every rebuild commit. `archive/` holds 30 MB. `wip/` holds three agent patches from 2026-09-29 against commits that no longer exist.

### 3.2 Nothing runs unattended

| Guard | How it runs today |
|---|---|
| `tools/check_port.py` | by every `build.py`, before it builds |
| 15 node tests in `core/` | by hand, one at a time; no runner |
| `tools/port_baseline.py` (117 page hashes) | by hand, after rebuilding everything |
| `core/furnish/fingerprint.py` | by hand |
| `verify.py --assert` (budgets, invariants, screenshots) | by hand, per build, 46 copies with no shared code; six biome copies are byte-identical, `biomes/throne/verify.py:2` still says "the Krator Ancients kit" |
| `tools/check_insulation.py` | by hand |
| Godot tests (`krand`, `ktags`, `kmask`, `atmos`, `verge_sim`) | by hand, `godot --headless` |

There is no `.github/workflows`, no `Makefile`, no `package.json`, no `requirements.txt`. The session-start
hook installs Godot 4.5 and Playwright in cloud sessions, so every piece needed for a CI job exists; none is
wired. This is the cheapest high-leverage change in the repository: every rule in `GODOT-PLAN.md` §6 becomes
a check instead of a memory.

### 3.3 The documents are the project's memory, and they rot

Found stale in this pass alone: `README.md:77-79` (names the wrong builds for the encoding gap);
`GODOT-PLAN.md` §1 (`core/simulation`: "documents only", while it has nine fragments, a node test and two
adopters); `godot/tests/rand/krand.gd:5` ("Not yet run inside Godot"; it passes); `settlements/voth/KNOWN_ISSUES.md:35`
(lists "no LOD" while `:63-66` records core/lod in, and cites `45-kit.js:473` for a line now at `:484`);
`biomes/throne/verify.py:2`. Each is small. Together they are why two external evaluations reported three
fixed bugs as open. The fix is not more documents but fewer hand-kept facts: counts that a script can write
(`make_index.py`, `audit_port.py` already do this) should be written by the script, and a status that a test
can report should be a test.

### 3.4 Fragments the repo's own rules cannot read

`CLAUDE.md` forbids reading a fragment over ~30 KB whole. Fifteen fragments exceed 70 KB and eight exceed 80 KB; the largest is
`settlements/yuni/src/61a-ancients-kit.js` at 206 KB (a vendored copy of the Ancients kit), then Girder's and
Mav's Refuge's `84-flyers.js` (91 and 80 KB), three Ancients arcology files (81-89 KB) and Throne's species file
(78 KB). Every session that touches one pays in context and in risk of an edit landing in the wrong section.
Splitting them is mechanical (the `/* ==== */` section markers are already there) and the hash baseline proves
it moved nothing.

### 3.5 Smaller findings

- **Verge's own `SIM`** (`settlements/verge/src/74-verge-sim.js`) was written "following core/simulation/PLAN.md
  section 4.3" but does not take the core module. It has the only Godot twin with a golden trace (3,235 rows, 0
  differ). It should become the core's second runtime consumer, not a third dialect.
- **`core/tags` is already the universal record envelope** ChatGPT proposes in §3 (`id`, `uid`, `class`, `key`,
  `tags`, `at`, `ry`, `size`, `parent`; `class` covers building, part, fixture, furniture, prop, flora, life,
  landmark, infrastructure, feature). Do not design another; extend it with `render` (archetype, mesh, material,
  lod class) and `sim` sub-records as those passes need them.
- **The spike's open item is identity, not geometry:** "no mesh names its record yet", and MultiMesh instances
  carry a colour and no tag (`GODOT-PLAN.md`, spike findings). ChatGPT's side-table (`{multimesh, records[]}`) is
  the right answer and costs one array per set in the export.
- **The spike's terrain is a stand-in** (`terrain.json`, "krator-heightfield, version 0, spike only: sampled from
  the page"), no collision shape is built from it, and no build exports a real field. This is where the missing
  `core/terrain` field shows.
- **Throne** is the one biome whose keep-clear is quadratic today (finding 9).
- **Fauna and the life layer do not cross** at all: `spike_export.js:19` drops skinned meshes; path-flying fauna
  stand still; people arrive near-white (custom attributes `aGarb`, `aSkin`, `aPRO` lost). This is expected and
  matches Phase 5, but it means every settlement export today is a dead town.

## 4. The preview's geometry economy

The owner asked both evaluations about triangles and draw calls. The honest frame: **Godot will not render the
preview's geometry.** Flora is K baked variants per species placed by a ported pass (the plan's "Unique trees"
call); furniture is one MultiMesh per piece and look; buildings cross as glTF with instancing. So the Rift's
25.7 M preview triangles are not a port problem. What is worth doing is what makes the preview cheaper to
author and verify in, and what fixes a data shape the exporter would otherwise carry over:

| Change | Why | Cost | Proof |
|---|---|---|---|
| Keep indices in `Batch.prototype.absorb` (or weld by position+normal in `flush`) | fixes the vertex shape every furnished page and every furniture export inherits; 1.5-6x fewer vertices | one function, six consumers | `core/furnish/fingerprint.py` (records must read `same`; mesh fingerprints change once, with a screenshot pair) |
| Size-aware segments in the catalog's `mkCyl`/`mkCone`/`mkDome`/`mkBall` | Gemini's projection of 65-75% fewer furniture triangles is plausible; measure before believing | one file | Girder's `furn.tris` before and after; a close-up screenshot of a chair leg |
| Voth onto `core/mask` | the last city placing from a real canvas; its placement is not reproducible in Godot or across browsers | one session; moves rubble once | GPU and CPU loads give one placement hash (the Dalab recipe) |
| A cross-build geometry report | every build measures calls/tris/instances with LOD on and off, into its README by hand; one script should collect them into a root table beside `PORT-INDEX.md`, so regressions are visible across builds | one tool | the table |
| `BIO.near` on little-demo's bucket pattern | replaces `clearOf`/`scatter`'s scans; fixes Throne; is the spatial index the open world's placement pass needs anyway | one core function, four callers | `core/biome/test-place.js` |

Not worth doing in three.js (Phase 6, both evaluations agree): more LOD tuning, octahedral impostors, texture
arrays, alpha-scissor rework. Those are Godot's, and the plan already names them for the shader library.
Per-class budgets (ChatGPT §31) wait until `core/tags` classes are on every mesh, which the biome adoption of
tags brings; then the budget becomes a per-class line in the same `verify.py --assert`.

## 5. The roadmap

Three principles the evaluations converge on, stated as rules the repo can check:

1. **Enforce before extend.** No new settlement or kit until stage 0 is done. (The plan's "consolidation phase";
   ChatGPT §25's "no new duplicated infrastructure" rule exists in `GODOT-PLAN.md` §6 and was broken by Verge's
   `SIM` and Yuni's PRNG exception within days; a CI check is the only form in which such a rule survives.)
2. **One module, one consumer, one test, one CI job.** Rule 6.11 plus the job.
3. **Records before drawing; the exporter is the product.** A build without an export is not finished (rule
   6.10). M4 and M5 are gated on `core/export`, not on the host shell.

### Stage 0: hygiene and automation (one or two sessions; moves no rubble)

- **a. `tools/test_all.py`**: runs `check_port.py` on every build, every `core/*/test-*.js`, `check_insulation.py`,
  rebuilds every build and runs `port_baseline.py`, runs `fingerprint.py`. Then a GitHub Actions workflow that
  runs it on every push (builds are Python concatenation; the whole thing is minutes). A second, nightly job
  runs `verify.py --assert` headless on the critical-path builds (the biome kits, Iziz, Girder, Voth, Verge) and
  the Godot headless tests. Checkout must skip LFS (`GIT_LFS_SKIP_SMUDGE=1`).
- **b. `tools/harness.py`**: the shared verify harness the plan names, extracted from the 46 copies, starting
  with the three byte-identical groups (six biome kits, three biome kits, four settlements). Each `verify.py`
  keeps its own asserts and imports the harness.
- **c. Stop committing built pages**: either `dist/` and the lineage pages go to LFS like the textures, or they
  leave git and `gallery/` and `host/` build them on publish. Either way `port_baseline.py` keeps the hashes, so
  nothing is lost. **Decided 2026-10-08: LFS.** The 18 identical copies of `three.min.js` beside the builds are not
  pages and stay for now; `archive/` and `wip/` wait on the owner.
- **d. The stale facts** in section 3.3, in one commit. Then: every count a script already writes is removed from
  hand-kept prose.
- **e. The eight `open()` calls without `encoding`** (verge, ys, ash-nomads, desert-nomads, scyvoi).
- **f. Lossless packed normals** in `pack.py`, one re-pack of the 41 builds with a `tex/` folder, one baseline rewrite
  (already in `TODO.md`; do it before any build adopts more sets).
- **g. `??`-style defaults** in `BIO.standAt` and its eight copies and `renderOrder=order||3`: when those files
  are next touched; add the pattern to `check_port.py` as a warning for new `[G data]` code.
- **h. Split the eight fragments over 80 KB** at their section markers; baseline unchanged.
- **i. One packed `tex/` per library set**, shared across builds (or the packs out of git with the pages): the
  60 MB of identical WebP goes, and the asset is content-addressed from then on.

### Stage 1: the preview's geometry economy (section 4; one session each; parallel with stage 2)

The five rows of the table in section 4, in that order. Each lands with its measurement in the build's README
and the cross-build report.

### Stage 2: the substrate (the plan's Phase 2 and 4, in the plan's order)

- **a. `core/terrain`'s field**: Float32 heightmap at a fixed step, water levels, carve patches, land cover;
  `terrainH(x,z)` as bilinear sampling; export as 16-bit PNG or EXR plus the carver's floors and blockers;
  Godot reads it into a `HeightMapShape3D` and a terrain mesh. First consumer: one biome kit (the plan says
  the reseeding event brings it). This replaces the spike's sampled stand-ins and is the coordinate substrate
  the open world streams on. Both evaluations rank it first among the technical gaps; so does this one.
- **b. The biome reseeding event** (`biomes/WORLD.md` Order 6): `KRAND` hash and noise, cell seeding, level-free
  records, the baked heightmap, in one change with one screenshot set and one baseline rewrite. Establishes the
  invariant ChatGPT §5 states and little-demo already obeys: a tile is generated from `hash(world, tile, index,
  salt)` and never from the stream's history, so Godot can make tile N without tiles 1 to N-1.
- **c. `core/tags` on the biome kits**, and ids on every exported node: each glTF node's extras carries its
  record id, and each MultiMesh carries a side table of record ids by instance index. Closes the spike's
  "no mesh names its record yet".
- **d. `core/export`**: the `krator-world` container (`items`, `buckets`, `materials`, `textures`, `registry`,
  `terrain`, `atmos`, `fixtures`, `interiors`, `furniture`, `sim`, `convention`), with `EXPORT.register(section,
  fn)` so each module contributes its part, written headless by the harness into `godot/data/`. Keep glTF with
  `EXT_mesh_gpu_instancing` for meshes (it works) and JSON for everything else; the tile's vertex list compacted
  after cutting (finding 10). M4 (a biome tile) and M5 (Iziz) are this stage's proofs.
- **e. Materials**: Iziz as the second library pilot; the shader library as `.gdshaderinc` files named by the
  hooks (`world-uv`, `cloth-sway`, foliage, bark, breakup, coursing). The three JS vocabularies stay; the export
  carries one.

### Stage 3: the host shell, narrowed (the plan's Phase 1, after stage 0b made it smaller)

The biome kits, Iziz and Voth take `core/host/`; every other build when next touched; every new build from the
start. Not all 31 at once. The sky preset moves to `core/atmos`. The inspector becomes record-driven (reads
`core/tags`, as ChatGPT §24 says), which is what makes the same inspector possible in Godot.

### Stage 4: the Godot project graduates from the spike (Phase 7)

- Split `godot/` into `runtime/`, `import/`, `rendering/`, `world/`, `tests/`; `spike.gd` becomes disposable.
- The mesh round trip as an assertion test: for each exported build, object, instance, triangle, material and
  tag counts, bounds, and terrain samples, against the page's own census. Today only Verge's sim has one.
- `compare_shots.py` gets a perceptual metric and runs nightly.
- The streamer: little-demo's scheme (quadtree terrain chunks, 512 m flora tiles cell-seeded, 128 m floor
  chunks, baked town tiles) ported as the world loader, reading `core/export` tiles.
- Forward+ on a real GPU: only the owner's machine can do this (`godot/CHECKLIST.md`); it gates the look, not the
  pipeline.

### Stage 5: the simulation (Phase 5; `core/simulation/PLAN.md` owns it)

- Verge's `SIM` onto `core/simulation` first (it has the golden trace, so the move is provable), then Voth's
  citizens per `PLAN.md` Phase 2 (places from `LIFE_DOORS`, actors' `sched[24]`, the pedestrian NAV), accepted by
  census parity. Ships' random departures become scheduled (the clock rule).
- Adopt ChatGPT §22's three levels explicitly in `SCHEMA.md`: record (exists), abstract (travels, works, eats,
  no animation), presentation (near the player only). `PLAN.md` implies it; naming it keeps the Godot runtime
  from being written against nodes.

### Stage 6: one world (M7)

Two kits and one settlement streaming together in Godot from the scale model's terrain, the owner's trial list
from `openworld/little-demo/KNOWN_ISSUES.md` worked in order (the Shade tile, the Verge cliff, highways joining
street graphs, town tiles keeping their shaders).

### What not to do (all three agree)

No rewrite in Godot; no porting of three.js builders to GDScript (port placement passes and bake geometry); no
all-glTF world format; no rewriting the ~700 canvas painters (bake by default, promote shared ones to
`TEX.def`); no merging the three material systems in JS (adapters onto one export vocabulary); no 31-build host
shell push; no further LOD, impostor or batching work in three.js; no new settlement until stage 0 is green.

## 6. "Port: next", amended

The ordered list for `TODO.md`, with the stages above folded into the existing items (DONE items kept there):

1. **Stage 0a-b**: `tools/test_all.py`, the CI workflow, `tools/harness.py`. *(new; first)*
2. **Stage 0c-i**: built pages out of the pack, stale facts, encodings, lossless normals, the eight big fragments,
   one `tex/` pack per set.
   *(0f is `TODO.md`'s "Normal maps after the JPEG switch")*
3. **Stage 1**: the furniture batcher, the catalog's segments, Voth onto `core/mask`, the geometry report,
   `BIO.near`. *(new)*
4. **The Godot spike's open items** (`TODO.md` item 2): the look in Forward+ (owner), the editor's glTF route, the
   friend's Voth route.
5. **The biome reseeding event with `core/terrain`'s field** (`TODO.md` item 5; stage 2a-b).
6. **`core/tags` on the biome kits and ids on exported nodes** (stage 2c; `core/tags/PROPOSAL.md`).
7. **`core/export`, M4 then M5** (stage 2d; `TODO.md` item 8's "Iziz's export on the `KRATOR_EXPORT` shape").
8. **The Ancients re-vendor session** (`TODO.md` item 3) and Ys's remaining passes (item 6), as they gate M5.
9. **Iziz as the second material pilot; the shader library** (stage 2e; `TODO.md` item 7's open half).
10. **The host shell, narrowed** (`TODO.md` item 9; stage 3).
11. **The Godot project graduates; the round-trip test; the streamer** (stage 4).
12. **Verge then Voth onto `core/simulation`; M6** (stage 5).
13. **M7** (stage 6).
14. **`core/city` onto the substrate** (section 8): KRAND, `core/mask`, `core/tags`, `KFIELD`, one spatial index;
    then the cities' placement passes ported onto it, Iziz first; its `city` export section with item 7.
15. **`core/city` in Godot** (section 8): its GDScript twin with golden tests, edits as an id-keyed overlay, rules as
    shared functions; the base for the NPC and quest tool and, later, the player's settlement builder.

## 7. Decisions and open questions

- **Decided (owner, 2026-10-08):** built pages go to Git LFS; a nightly verify job of about 20 minutes, starting Sunday
  2026-10-11; stages 0 to 2 under way on the branch `full-refactor`.
- Forward+ on a real GPU and the friend's Voth import route are still the spike's two open items that only
  people outside a cloud session can answer.
- Is `archive/` worth keeping in the repository at all, given `krator-before-cleanup.bundle` holds the history?

## 8. Since the plan: `core/city` (on `main` 2026-10-09)

**What landed.** `core/city` is the city builder worked out in Streetlab: a city as plain records (ways, lots,
greens, each with the step that made it) on one occupancy raster, steps 6 to 12 (civic, avenue lots, main streets,
side streets, alleys, the infill of every block), and a reference drawing. A world brings its site (steps 0 to 5),
its kit and its tuning. `settlements/streetlab` is now Voth's site editor and Voth's city plan on it, published in
the gallery as "Voth - new" beside "Voth - old". The same commit added transport routes to `core/simulation`
(`77-sim-5r-routes.js`: `SIM.transportQueue`, `SIM.vehiclePose`, pure functions of motion time), seven Voth and
Hykkousoi vessels to the Ring Sea kit, and renamed "silt strider" to "elephant bug" in prose.

**It is compatible with the refactor.** Checked on 2026-10-09:

| Check | Result |
|---|---|
| The working rules on `main` | followed: `core/city/README.md` lists its debts to the refactor (its own random streams, raster and noise; lots not yet in `core/tags`) |
| Portability | its layout fragments are `[G data]` with no DOM; its random streams are integer and seeded per step, so they port to GDScript; its trigonometry is geometry, not hashing |
| Encodings and rebuilds | Streetlab's `build.py` passes the encoding lint; every page the commit rebuilt reproduces, except Verge (the Windows path-separator bug, fixed on `full-refactor`) |
| Voth's mask | no clash: Streetlab loads Voth's layout fragments (`10-core`, `15-shore`, `30a-layout-districts`), not the ground fragment that moved onto `core/mask` |
| Merge into `full-refactor` | six small conflicts (generated tables, the baseline, one hook line, two additive rows in `core/simulation/SCHEMA.md`), settled; every page rebuilt |

**What it adds to the roadmap.**

- **Stage 2, the substrate, takes `core/city` as a consumer of each shared module** (its README's debts):
  its streams move onto `KRAND` cell seeding in the reseeding event; its occupancy raster onto `core/mask`; its
  lots registered in `core/tags` before they are drawn; its site's ground read from the terrain field (`KFIELD`,
  branch `refactor/terrain-field`).
- **One spatial index, not three.** `core/city` keeps a 40 m hash of building footprints, little-demo buckets its
  flora at 24 m, and stage 1 planned a third for the biome core (`wip/biome-spatial-index`). Make it one small
  core module that all three use, with the biome work's equality tests.
- **`core/city` is the target for every city placement pass.** The plan already asks each city to split its
  builders into a data pass and a draw pass; `core/city` is that data pass. Order: Voth (done in Streetlab), then the
  four cities already on `core/mask` (Iziz, Dalab, Erewhon, Roketstad), then Ys's placement pass, each proven with
  a placement hash and a screenshot pair.
- **`core/export` gets a `city` section** (ways, lots, greens and their steps), so Godot receives a city as records
  and baked meshes.
- **Stage 5 starts from the transport routes.** Voth's ferries, elephant bugs and ships used random departures
  that Godot could not reproduce; `SIM.transportBake` and `SIM.vehiclePose` make them timetables, which is the
  Phase 5 rule. Verge's own `SIM` moves onto the core with them.
- **Decided (owner, 2026-10-09): the new Voth is canonical.** Streetlab's city plan on `core/city` is Voth from
  now on. The old page (`settlements/voth`) stays up as the source things are ported from (its life layer,
  collision, props); it gets no new features, and it retires when nothing is left to port.
- **Where `core/city` is going (owner, 2026-10-09).** A modified city builder is to become a dev tool for placing
  NPCs and building quests, and a further modified version the player's settlement-builder mode. That changes
  three calls:
  1. **It needs a GDScript port.** Godot will run the steps at play time, so `core/city`'s data side gets a twin
     with golden tests like `core/rand` and `core/mask`, not only an export. Its integer per-step streams already
     make that feasible.
  2. **Edits are an overlay, not a rerun.** The README's furniture rule applies to cities: records keyed by stable
     id, the owner's (and later the player's) changes kept as deltas by id, a step re-runnable on one region without
     moving the rest. Cell-seeded `KRAND` is what makes "rerun one block" leave its neighbours alone.
  3. **Rules are data the tools share.** Overlap, frontage, reach and slope tests stay plain functions on records and
     the occupancy grid, so the preview editor, the NPC and quest tool and the player's mode all ask the same
     question. NPC posts and quest anchors are `core/tags` records on lots and places, which is what
     `core/simulation`'s places already are.
- **Minor debts:** two `x || number` defaults in `core/city/10-city-core.js` (`span`, `hw`); `core/city` has no node
  test yet (rule 6.9); `PORT-INDEX.md` needs a rerun of `tools/audit_port.py` to count Streetlab.

## Appendix: how this evaluation was made

The two external evaluations were converted from `.docx` with pandoc (`evals/`). The repo was read at
`b772f2c7` under `CLAUDE.md`'s rules (no built pages, no `dist/`, no fragment over 30 KB whole). Five
verification passes checked: the biome shader and LOD-export claims; the placement, furniture, frustum, default
and complexity claims; a duplication, terrain, PRNG, exporter and material census; the Godot project's state;
and the tooling, CI, texture, simulation and open-world state. Every verdict in section 2 cites the lines it rests
on. Numbers this evaluation did not measure itself are marked as the plan's or the spike report's.
