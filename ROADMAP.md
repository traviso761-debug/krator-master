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
| 1 | `BIO.iridBarkMat` is defined per kit with conflicting signatures; the last kit loaded wins | Gemini bug 1 | **Fixed 2026-10-12 (stage 2): the core's `irid` kind in `core/biome/30-core-foliage.js`, one definition; the five kits' geometry and tints proven unchanged.** Was: **real hazard, tracked, not hit today.** Five kits define it, not four (eastabyss, rift unguarded; nhighlands, shighlands, xanadu guarded with `\|\|`). Only eastabyss's signature differs (no tints). The uniform names are identical, so "conflicting uniform names" is false. No current build bundles two definers: little-demo takes sedesert+eastabyss+hyperjungle+ebadlands, Verge sedesert+eastabyss | `biomes/eastabyss/src/50-biome-eastabyss-species.js:320`, `biomes/rift/src/50-biome-rift-species.js:401`, `TODO.md:110`, `openworld/little-demo/build.py:36-45` |
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
| 18 | The furniture primitives use fixed segments (`mkCyl` 16, `mkDome` 16x10); size-aware tessellation would cut furniture triangles 65-75% | Gemini §4.1 A | **Measured 2026-10-12: true at detail 1 only.** Size-aware segments (`_fit`, `_ring` in the core) cut the catalog's census 57 % at detail 1 (small balls were 48 % of it) but 16 % at the settlements' detail 0.5, where the 6-segment floor binds; on the furnished pages 13.6 % (Highlands 24 %, Zeijani 22 %, Girder 18 %, Mav's Refuge 5 %, Post-Apoc 2 %). `kits/catalog/README.md`, "Size-aware segments" | `kits/catalog/krator-furniture-core.js`, `settlements/girder/verify.py:185-188` |

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
adopters); `godot/tests/rand/krand.gd:5` ("Not yet run inside Godot"; it passes); `archive/voth-first/KNOWN_ISSUES.md:35`
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

**Done 2026-10-14.** The indexed furniture batch (vertices 1.7-3x fewer), the spatial index (KSPACE), Voth's
placement on `core/mask`, size-aware catalog segments (57 % of the catalog's triangles at detail 1, 13.6 % on the
furnished pages), and the first cross-build report: `GEOMETRY.md` and `geometry.json`, all 154 pages, by
`tools/geometry_report.py` (draw calls, triangles, LOD off/on, meshes, instanced sets, instances, materials,
furniture triangles). The heaviest are Streetlab's city (34.9 M triangles, 1,047 calls), Ys (29.5 M) and the Throne's
pages (19-22 M); the contact sheets draw piece by piece (catalog 43k calls, interiors sets 47k); core/lod saves
10-80 % of triangles on the 87 pages that take it. Pages that keep their camera private (the Yuni lineage) are
counted from their own last frame (marked *). Rerun a row with `python3 tools/geometry_report.py <page>` after a
change; a whole run takes most of a day under SwiftShader on a loaded box, so run pages one browser at a time.

### Stage 2: the substrate (the plan's Phase 2 and 4, in the plan's order)

**Done 2026-10-14:** the terrain field, the irid kind, `core/tags` on the biome kits with ids on exports, `core/export`
(M4 sedesert, M5 Iziz), the shader library, Iziz as the second material pilot, the Ancients re-vendor, and `core/water`
phases 0 to 4 (open water, shores, flow and falls, still water; `W.wet` waits for a taker). Merged into `main` with
stages 0 and 1.

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
  "no mesh names its record yet". *Done 2026-10-12:* the biome core registers every item as a core/tags item set (instances read from
  the kits' own matrices, so no per-instance objects) and every registered volume as a record; `BIO.export` writes a
  uid per instance aligned with the matrices and a bucket's merged volumes; the glTF exporter writes ids in extras; the
  importers put them on node metadata; `godot/tests/tags/records_test.gd` recomputes the hyperjungle case's uids in
  GDScript (`biomes/GODOT.md`, "Records"). Open: a merged mesh that holds many records (Girder's furniture, one batch
  per material) names none, and Iziz's case is not re-exported; placement records proper wait for the reseeding event (2b).
- **d. `core/export`**: the `krator-world` container (`items`, `buckets`, `materials`, `textures`, `registry`,
  `terrain`, `atmos`, `fixtures`, `interiors`, `furniture`, `sim`, `convention`), with `EXPORT.register(section,
  fn)` so each module contributes its part, written headless by the harness into `godot/data/`. Keep glTF with
  `EXT_mesh_gpu_instancing` for meshes (it works) and JSON for everything else; the tile's vertex list compacted
  after cutting (finding 10). M4 (a biome tile) and M5 (Iziz) are this stage's proofs.
  *Done 2026-10-13, and M4 with it* (`core/export/README.md`): `EXPORT.register(section, fn)` and `EXPORT.world({box,
  sections})` (a section that throws is reported and skipped; an unknown name is refused), `EXPORT.check` (every id
  joins), `EXPORT.glb` (meshes as one glb with `EXT_mesh_gpu_instancing`, the rest as JSON). Filled: `items`,
  `buckets` (a tile's vertex list compacted), `materials` (one vocabulary: the KMAT fields beside the biome's own),
  `textures` (library maps by reference to the build's pack), `terrain` (the KFIELD cropped, a sampled grid, probes),
  `stage` and `registry` (core/tags, cropped to the tile) by the biome core; `atmos` by an adapter over `ATMOS.export`.
  Stubs with a written contract: `fixtures`, `interiors`, `furniture` (the per-look scheme), `sim`, `city` (the Voth
  branch's; only its registration point is here). `BIO.export` is a thin envelope over the same parts and writes
  byte-identical JSON. `tools/harness.py export <page> --out godot/data/<case>/ --box ...` writes it headless;
  `godot/krator/world_import.gd` builds the tile from the spike's own importers. The proof is sedesert's tile
  (`godot/data/world-sedesert`, `godot/tests/export/world_test.gd`): 7,280 instances, every uid recomputed in GDScript
  from the glb, 0 mismatches; every material and map resolves (18 library maps by reference); `KField.h` matches the
  page's `h` at 256 probes to 3e-12 m; a side-by-side screenshot from one camera.
  *M5 done 2026-10-13* (`core/export/README.md`, "Iziz"): Iziz is the second contributor
  (`settlements/iziz/targets/city/94-city-export.js`), its records on the `KRATOR_EXPORT` shape: `REG`'s buildings (with
  their lot's yaw and size), the doors, windows and lamps its vernacular draws as fixtures under their buildings, the
  kit's item sets, the furniture slots; its kit and biome instances (with a per-instance `owners` side table), plain
  meshes by material, materials with their library hooks, library maps by reference, the sampled ground, the stage and
  the atmosphere. `world_import.gd` reads it with no Iziz-only path. The proof is a 240 m district inside the south gate
  (`godot/data/world-iziz`, `godot/tests/export/iziz_test.gd`): 9,638 instances, the kit's 2,158 uids recomputed in
  GDScript (0 differ), 49 bucket records, 139 fixtures each under its building, every material and map resolving with its
  hook, the ground through its samples to 0 m; a side-by-side from one camera. Open: the stubs (`sim`, `city`; Iziz has
  no interiors), the adapters moving into their modules, the Throne and Verge listing core/export (the harness injects
  it), the Ancients kit's openings as fixtures, records on the biome sets inside the city.
- **e. Materials**: Iziz as the second library pilot; the shader library as `.gdshaderinc` files named by the
  hooks (`world-uv`, `cloth-sway`, foliage, bark, breakup, coursing). The three JS vocabularies stay; the export
  carries one.
  *The shader half done 2026-10-13* (`godot/README.md`, "The shader library"): `godot/shaders/lib/` (not
  `core/godot/shaders/`: `res://` cannot reach outside `godot/`) holds `world-uv`, `breakup`, `foliage`, `bark`,
  `cloth-sway`, `flag`, `glass`, `coursing` and `water`, each naming its three.js hook; a record's `hook` selects them
  (`godot/krator/khooks.gd`; the biome kinds are aliases; an unknown hook is reported). The spike's library, foliage,
  bark and ground shaders draw through them. The M4 side-by-side's two gaps are closed on sedesert: the ground's crack
  and detail layers travel as one `world-uv` material record (`EXPORT.groundLayers`, the crack weight on the tile's grid)
  and are multiplied in Godot's ground shader; the pond is a core/water surface (sedesert takes core/water's data side),
  exported by a new `water` section (`krator-water`: kind, level, swell, field share, bounds, waves in turns, the bed's
  bytes, the twin's probes) and drawn by `shaders/water.gdshader` on `lib/water` (`WATER.glsl`'s maths, the waves as
  uniforms). `KWater` (GDScript) equals `WATER.heightAt` within 1.1e-14 m at fixed (x, z, t) (tolerance 1e-9 m;
  `godot/tests/water/water_test.gd`), the include within 0.5 mm of it on a GPU (`tests/shaders/library_gpu_check.gd`);
  `tests/shaders/library_test.gd` checks the wiring. Open: Iziz (the pilot half); a record that selects `cloth-sway`,
  `flag`, `glass` or `coursing` on an exported mesh; the other biome hosts' ground layers (one `groundLayers` call each)
  and their water (sedesert's river and cataract too: flow and fall are core/water's phase 3); the strata on rock.
  *The pilot half done 2026-10-13* (GODOT-PLAN.md Phase 3; `settlements/iziz/KNOWN_ISSUES.md`): Iziz's own city
  materials join the vernacular, Ancients and embassy ones on the library, as `city*` families bound through an alias
  (`stone.cut.b` on the painting's walls and towers, `rock.rock_face` on its rock, `rock.sandstone` on the escarpments,
  `metal.rust.fine` on every rust, the planks and skins on existing families); every material is a KMAT record naming its
  hook, and Iziz's export carries them to Godot, where records with `glass` select it on an exported mesh (drawn plain
  for now). `verify --assert` unchanged. Two gaps with prompts for the owner: a cast statue bronze, a rust-streaked
  concrete. Open: lib/glass in the library shader, a ground detail layer for Iziz's painted streets.

### Stage 3: the host shell, narrowed (the plan's Phase 1, after stage 0b made it smaller)

The biome kits, Iziz and Voth take `core/host/`; every other build when next touched; every new build from the
start. Not all 31 at once. The sky preset moves to `core/atmos`. The inspector becomes record-driven (reads
`core/tags`, as ChatGPT §24 says), which is what makes the same inspector possible in Godot.

### Stage 4: the Godot project graduates from the spike (Phase 7)

- Split `godot/` into `runtime/`, `import/`, `rendering/`, `world/`, `tests/`; `spike.gd` becomes disposable.
- The mesh round trip as an assertion test: for each exported build, object, instance, triangle, material and
  tag counts, bounds, and terrain samples, against the page's own census. Today only Verge's sim has one.
- ~~`compare_shots.py` gets a perceptual metric and runs nightly.~~ Done 2026-10-18: SSIM, mean absolute difference and the
  differing fraction per pair, a difference image, `--threshold` and `--assert`; `tools/test_all.py --nightly` runs it on the
  must-pass cases as a report (`COMPARE_ASSERT` switches it to a gate once the owner has read the first numbers:
  `godot/README.md`, "Scoring the pairs").
- The streamer: little-demo's scheme (quadtree terrain chunks, 512 m flora tiles cell-seeded, 128 m floor
  chunks, baked town tiles) ported as the world loader, reading `core/export` tiles.
- Forward+ on a real GPU: only the owner's machine can do this (`godot/CHECKLIST.md`); it gates the look, not the
  pipeline.

### Stage 5: the simulation (Phase 5; `core/simulation/PLAN.md` owns it)

- **Done on `Voth-sim` and merged (2026-10-14, `fbdb7d6c`; `settlements/voth/HANDOFF-REFACTOR.md`):** Voth's
  citizens on `core/simulation` (places, the pedestrian layer, 53k actors with homes, jobs and rotas; needs, items,
  economy, carriers, animals and pets; the wake, the lag and the half-hour buckets). **No separate economy session
  runs any more (owner, 2026-10-18): the economy is tuned on the isle demo as it is built** (`settlements/isle-demo`,
  two towns of one polity trading by sea; its PLAN.md sections 5 and 7), and `core/simulation` is edited on `main`.
  Next, in the isle demo's order: the settlement key and the economy partitioned by it, trade between settlements as a
  carrier with books, stocks per settlement; then the handoff's known defects (river barges by timer, happiness
  drifting down over a week, the arena's beast paths and double drawing, verify's windows, the scarcity decision) as
  the isle demo reaches each feature, Phase E's remainder (porters, barges, fodder, breeding, beef), Phase F (guards
  and the night watch, Ordinators and priests, arena bouts, dhows, taxis, the pleasure barge), then Verge onto the same
  core against its golden trace. For the refactor: the place grid (`77-sim-2-places.js`) onto `KSPACE`; Godot replays
  baked tasks (a lazy leg resolved by `SIM.legRoute` before it is baked; the export carries the economy's and animals'
  records when the runtime needs them).
- **Stage 5 starts with the schema** (section 11, item 5). Write ChatGPT §22's three levels into `SCHEMA.md` against the
  isle demo: record (exists), abstract (a town nobody is watching: its places produce and consume by the hour, its
  books and routes tick, nobody is posed), presentation (near the player only); what an unloaded town window ticks,
  what it does not, and what the books must balance to when the player arrives after days away. Then the `sim`
  export section's required fields for the isle demo's profile. Naming the levels keeps the Godot runtime from being
  written against nodes.

### Stage 6: one world (M7)

Two kits and one settlement streaming together in Godot from the scale model's terrain. **Since 2026-10-18 this is
the isle demo's region** (section 11): the ring isles biome and the Islanders kit with the two towns M6 opened,
streamed at 1:1 across the 122 km of sea between them. The owner's trial list from
`openworld/little-demo/KNOWN_ISSUES.md` (the Shade tile, the Verge cliff, highways joining street graphs, town tiles
keeping their shaders) is worked after it, on little-demo.

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
7. **`core/export`, M4 then M5** (stage 2d; `TODO.md` item 8's "Iziz's export on the `KRATOR_EXPORT` shape"). *M4 done
   2026-10-13* (sedesert's tile, stage 2d); *M5 done 2026-10-13* (a district of Iziz, stage 2d).
8. **The Ancients re-vendor session** (`TODO.md` item 3) and Ys's remaining passes (item 6), as they gate M5. *The re-vendor
   session done 2026-10-13* (the chain's `--vendor-check` shows only recorded ADAPTED drift; `verify --assert` unchanged); Ys's passes next.
9. **Iziz as the second material pilot; the shader library** (stage 2e; `TODO.md` item 7's open half). *The shader
   library done 2026-10-13* (with core/export's `water` section and sedesert's ground layers); *Iziz done 2026-10-13*
   (its city materials on the library, every record naming its hook).
10. **The host shell, narrowed** (`TODO.md` item 9; stage 3).
11. **The Godot project graduates; the round-trip test; the streamer** (stage 4).
12. **Verge then Voth onto `core/simulation`; M6** (stage 5).
13. **M7** (stage 6).
14. **`core/city` onto the substrate** (section 8): KRAND, `core/mask`, `core/tags`, `KFIELD`, one spatial index;
    then the cities' placement passes ported onto it, Iziz first; its `city` export section with item 7.
15. **`core/city` in Godot** (section 8): its GDScript twin with golden tests, edits as an id-keyed overlay, rules as
    shared functions; the base for the NPC and quest tool and, later, the player's settlement builder.
16. **`core/water`** (section 9; `core/atmos/WATER.md`): phases 0 and 1 done 2026-10-12 (Ring Sea, geyser; Reed Lake, Noah's Regret, Port, Ys, Locus, Mungo 2026-10-13); phases 2 to 4 done 2026-10-13 with their Godot twins (shore: little-demo, Phase 1's last taker; flow and falls: sedesert, little-demo, Ys; still: Reed Lake, Xanadu's kit page, sedesert's pool); next: more takers of phases 2 to 4 (`core/water/README.md`, "Still to do"), then Phase 5; Voth's water when its branch pauses.
17. **The scripted walk** in the harness (section 9, stage 0j). *Done 2026-10-12.*
18. **One interface for every settlement** (section 10): `core/edits`, then `core/host` on the biome kits, Girder,
    Iziz, Highlands, fauna mode, then every other settlement; Streetlab and Voth with their branch.

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
its kit and its tuning. Streetlab (`settlements/voth` since 2026-10-14) is now Voth's site editor and Voth's city plan on it, published in
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
  and baked meshes. *The section exists as a registration point with a written contract (2026-10-13,
  `core/export/README.md`, "Stubs"); `core/city` registers into it for the isle demo's city plan (its P6; section 11).*
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

## 9. Directives since the pause (`main`, 2026-10-10 to 2026-10-12)

Merged into `full-refactor` on 2026-10-12 (four small conflicts: the generated indexes, the catalog's port table, the
baseline, and `core/materials/PROMPTS-ready.md`, where the Zeijani prompts stay pruned because their images arrived).

**Assigned to this branch:**

- **Water: one shared module, `core/water`** (`core/atmos/WATER.md`; `TODO.md`, "Water"). Thirty-nine builds draw
  water; five take the shared wave field, the rest run ten ripples or static materials; nine clocks never wrap;
  nothing but the Ring Sea's hulls floats; no water reflects the sky. Six kinds (open, shore, flow, fall, still,
  wet), each with a data side and a CPU twin (`heightAt`, `flowAt`, `seaLevel`), one clock, skylight reflection,
  depth absorption. Its phases sit in this roadmap as:
  - **Phase 0** (the README, the API and a node test for the twins) and **Phase 1** (a CDLOD water mesh, the shared
    field, skylight, Jacobian foam; the Ring Sea kit's Gerstner, `rsSeaH` and `rsRide` moved in) are **stage 2f**,
    after the terrain field is merged, since the flow and shore fields are built on it and on `core/mask`.
    **Done 2026-10-12** (`core/water/`, `node core/water/test-water.js`): the Ring Sea kit and the geyser's sea are
    on it (Ring Sea `verify.py --assert` holds, hull poses equal `WATER.rideAt`, the GPU surface is within 0.06 mm
    of the CPU twin). On 2026-10-13 Reed Lake, Noah's Regret, Port, Ys, Locus and Mungo took it, and little-demo with
    Phase 2 (a surface per water body, masked, on a shore window, about a camera-relative origin).
    Depth-buffer absorption is not built yet. Streetlab's page carries the Ring Sea's `rsSeaH`/`rsRide` as aliases
    of `WATER` that it never calls, so it loads without `core/water`.
  - Phases 2 to 4 (shore, flow and falls, still water and `W.wet`) follow `core/export`. **Done 2026-10-13**: the
    shore's flood and distance field on the ground (no lower hollow floods: a node test with its negative, and
    little-demo's hollows behind a ridge, 83 measured, kept dry), shoaling, breakers, surf and the wet-sand twin, masks and shore windows; the
    flow ribbon and its advected ripple, the arcing fall and its plunge; still water and `W.wet`. Each kind's twin is in
    Godot (`KWater`, `lib/water_kinds.gdshaderinc`, the export's water section; `tests/water/water_test.gd`'s golden,
    `tests/water/falls_case_test.gd` on sedesert's notch, the GPU check). Takers: little-demo, sedesert, Ys, Reed Lake,
    Xanadu's kit page; the rest, and why not yet, in `core/water/README.md`. `W.wet` has no taker until Voth's page
    (`settlements/voth`) can take it with its weather. Phase 5 (the FFT backend, the ripple sim) is opt-in per sea world; Phase 6 is the Godot side
    and joins stage 4.
  - Its first takers skip Voth: Voth's water (`settlements/voth/src/75-terrain.js`, and Streetlab's) is in the
    Voth branch's area (below). Ring Sea, geyser, Port, Ys, Reed Lake, Noah's Regret, little-demo, Locus and Mungo go
    first; Voth takes the module when that branch reaches a pause.
- **A scripted walk in the verify harness** (`TODO.md`, from OhMyGame's QA skill): "build success establishes
  compilation, not a playtest". A verify step that walks the camera along a route by scripted keys and asserts the
  end position and a clean console. **Stage 0j**, on `tools/harness.py`.

**Owned by another branch: the Voth citizen simulation** (`settlements/voth/SIM-ROADMAP.md`, the owner's brief
and its phases A to G; the branch is the owner's Voth and simulation session). It is this plan's stage 5 done on the
Voth city page first, adding `core/simulation` modules (`77-sim-6-needs.js`, `-items.js`, `-economy.js`,
`77-sim-7-lod.js`) and an interior in every Voth building. So the refactor:
- **stays out of** `settlements/voth` (Streetlab's folder until 2026-10-14), `core/simulation` and `core/city`. Where the plan
  needs a change there (`core/city` onto `KRAND`, `core/mask` and `core/tags`; Voth's water; Verge onto the core
  `SIM`), it is written as a note for that branch or waits until the branch pauses;
- **keeps the furniture batch's API exactly as it is.** Every new Voth interior furnishes through it, so the indexed
  batch (`wip/furniture-indexed`) lands only with the furniture fingerprint unchanged in records and Streetlab's city
  page loading clean;
- **shares one delta shape with it.** The simulation plan's off-screen sites (`core/simulation/PLAN.md` 8.9) log
  ADD, MOVE, SET and REMOVE operations with a cause and a thread status. `core/city`'s edits-as-overlay (section 8)
  should use the same operations, so the owner's edits, the player's builds and the simulation's changes are one log.

**Naming:** `settlements/port` is the **Ancient Port kit**, not a settlement (it will build Hook). The geyser kit
(`biomes/geyser`) is new; it draws its own sea and creek and is a first taker of `core/water`.

### The order from here (owner, 2026-10-13)

1. Finish stage 2: `core/water` phases 2 to 4, and the Throne on `core/host` (section 10 step 1's last piece).
2. **Merge stages 0 to 2 into `main`** (the owner's go-ahead): `full-refactor` into `main`, its CI and nightly job
   switch on there, and `main`'s CLAUDE.md "refactor paused" section becomes the rules of the merged tree (the known
   bugs it lists are fixed: the irid kind, lossless normals, the indexed furniture batch). Pull in `Voth-sim` in the same
   pass if it has been handed over by then (it takes the fauna branch, `ccr-05259b8d-kuy4pm`, itself; merge that branch
   separately only if `Voth-sim` as pushed does not contain it); each is merged,
   rebuilt and proven like the other branches (verify, smoke, baseline).
3. Stage 3 (section 10, steps 2 to 6): Girder, Iziz and Highlands, fauna mode on the merged fauna kit, the rest,
   then Voth (`settlements/voth`, Streetlab's folder until 2026-10-14) with its branch.
4. Stage 5 starts from Voth's sim, not Verge's (above).

### Voth, Streetlab and the city-layout module (owner, 2026-10-14)

- **The first Voth is retired.** `settlements/voth/voth.html` is off the gallery and the nightly list and is no longer
  kept up to date; it stays only as a source to port from. `settlements/voth/catalog/` stays live (core/city builds
  Voth's lots with it). The gallery's "Voth" is the city plan on `core/city`, under the old slug.
- **One city-layout module.** `core/city` becomes the layout module every city takes (Verge and Iziz first, then new
  builds): the general layout the new Voth grew in Streetlab (now `settlements/voth`) moves into it, parameterised; Ys's block
  infill joins it as an alternative strategy a build can choose; a city's site, districts and kit stay per world.
  A read-only survey comes first (what in Streetlab is general layout vs Voth content vs simulation vs host).
- **Then Streetlab is retired.** Voth's city target (`targets/voth-city`, its site data, its simulation fragments)
  moves to `settlements/voth`, which is Voth's home again; the first Voth's source moves to `archive/`; Streetlab's
  remaining experiment pages are retired or become the module's example. The owner's economy fork merges
  `full-refactor` just after the move (git carries its edits across the rename); the move is announced first.
  **Moved (2026-10-14):** `settlements/streetlab` is now `settlements/voth` (its build, targets, site, simulation, docs and
  pages, page names unchanged); the first Voth's page, build, verify, baseline, library pack and page-only docs are in
  `archive/voth-first`. Its `src/` stays in `settlements/voth` as Voth's source library (the build runs or lifts its
  fragments by name), with `catalog/` and `three.min.js`.

### The order before that (2026-10-12)

1. Stage 0j (the scripted walk) and 0f (the lossless normal repack, one baseline rewrite).
2. Stage 1: land `wip/furniture-indexed` and `wip/biome-spatial-index` verified; size-aware segments; the first
   geometry report.
3. Stage 2: merge `refactor/terrain-field`; `BIO.iridBarkMat` as a core material kind; `core/tags` on the biome kits
   with ids on exported nodes; `core/export` (done 2026-10-13, M4); then `core/water` phases 0 and 1.
4. Stage 0h, the fragment splits, outside the Voth branch's area, whenever a session has room.

## 10. One interface for every settlement: Streetlab's viewer and editor as `core/host` (owner, 2026-10-12)

**The directive.** Streetlab's Voth city plan and site editor is the most complete viewer and editor in the repo; every
settlement takes it. This is the roadmap's stage 3 (`GODOT-PLAN.md` Phase 1, "one host shell") with Streetlab as the
template instead of a shell written from scratch. Because the Voth and simulation branch was still changing Streetlab
at the time, the interface was **copied and generalised into `core/host/`**; Streetlab's own files were not edited, and
Voth switches to `core/host` when next touched (step 6 below; a note maps its `VC.*` calls to `KHOST.*`).

**What it is** (inventory from the source, 2026-10-12): the bar with layers, legend and export; foldable panels;
orbit, pan, fly and walk with a pin and a ledge guard; a depth range that follows the camera; the inspector; the
cutaway with its storey bar; the picture menu (thumbnails drawn off screen); place, turn and delete buildings; the
street painter and align-to-street (these two need `core/city`); the flora editor (select, delete, plant); marks
(areas, lines, points, measured; they supersede the polytools); a paths view; `KCLOCK` time controls, sky lighting,
`ATMOS` weather and lamp glows; stats and census panels; the site editor's areas, markers, lines and ground brushes;
the minimap; save, undo, draft, import and export of edits. **There is no fauna editor**: fauna placement is new work
on the same path (`kits/fauna`).

**Added by the owner (2026-10-14): what things hold, and the settlement's stocks.**
- **The inspector shows contents.** Hovering or picking a container (a chest, a barrel, a granary bin, a cart, a
  boat's hold), a building (its household's or workshop's stock: food, spares, tools, goods for sale, inputs and
  outputs) or a citizen (worn and carried items, the tool, its home's store) lists what is in it, by item, with counts
  and wear. Voth's citizen card (`56d`, 2026-10-14) already shows a citizen's items and its household's food; the host
  generalises it to any record that holds items.
- **A stocks view** (a collapsible panel, its own mode): every item in the settlement, the total, and where it is:
  **at the production site** (made, not yet moved), **in transit** (on a carrier, a cart, a barge, a porter),
  **in storage** (warehouses, granaries, market stalls, households' stores), with the **daily change** (made minus used,
  over the last simulated day) and a mark on items running short. Clicking an item lists its holders; the inspector
  takes it from there.
- **Contract.** `KHOST.take` gains `contents?` (a record id -> its items) and `stocks?` (by item: the totals by state and
  the last day's change). `core/simulation` supplies both from its item records (`SIM.contents(id)`, `SIM.stocks()`,
  a daily snapshot for the change; a carrier's load counts as in transit), so the host reads data, never `VC`. A build
  without an economy has no stocks view and an inspector without contents. Built with the inspector (step 2), proven on
  the pages with an economy (Voth, Mungo, Shade, Dhelv); [web] like the rest of the host, the data side [G data].

**Two things change on the way in.**
- **Edits become an id-keyed operation log**, `core/edits/40-core-edits.js` ([G data], a node test, later a GDScript
  twin): `{format:'krator-edits/1', build, ops:[{op: ADD | MOVE | SET | REMOVE, id, target:{uid, class, key, at},
  rec, cause, thread}]}`, the shape of `core/simulation/PLAN.md` 8.9, so the owner's edits, the player's builds and
  the simulation's changes are one log (section 9). Targets resolve by `KTAGS` uid, falling back to position within a
  tolerance until `core/city` registers its lots. Undo is the inverse operation. Today's Streetlab edits match deletions
  by position and keep undo as closures; a converter reads its file read-only. Ys has a third editor format
  (`settlements/ys/targets/city/94-city-editor.js`); it converts the same way.
- **The host reads a contract, never a build's globals.** `KHOST.take({scene, ground, registry, exporters, views,
  sky?, layers?, phases?, stats?, pick?, palette?, edits?, cutaway?, paths?, contents?, stocks?})` returns `{clock, camera}`; host code
  never reads `PLAN`, `SL`, `VOTH` or `VC`. A build without a piece of data loses only that feature (no registry: the
  inspector shows coordinates; no palette: no place mode; no `core/city`: no street painter; no `BIO` hooks: no flora
  mode; no server: edits go to a download or the clipboard). Each `verify.py` keeps working: `setView` and the view
  buttons stay.

**Layout.** `core/host/` 90 camera, 91 loop (owns `KCLOCK`, shims `TICKS`, `FRAME_HOOKS`, `_frameHooks`, isolates
errors, sets `_ready`), 92 panel, 93 inspect (reads `KTAGS.page`), 94 marks, 95 probe (`window._api`), 96 picture menu
and sheet, 97 minimap (moved from `core/minimap/88a`), 98 edit modes (emit operations only; the build previews them),
99 cutaway; `host.py` lists the files and inlines a build's edits; `tools/edits/serve.py` gains a save route.

**Order, for every settlement** (the owner asked for all of them, so the tail is scheduled, not "when next touched"):

| Step | What | Sessions |
|---|---|---|
| 0 | **Done 2026-10-12.** `core/edits` and its node test; the Streetlab converter's round trip; the save route; record the Streetlab file hashes the host is copied from, checked read-only at each session's start | 1 |
| 1 | camera, loop, panel and probe on hyperjungle, then the other fifteen biome kits (their only host contact is `BIO.init`). **Done 2026-10-12** for all sixteen kits, the Throne's eleven pages (station 1 and its ten stations) the last (`core/host/README.md`; on every page verify unchanged, chrome-hidden shots identical, the meshes the same, smoke clean) | 2 |
| 2 | Girder (the Voth lineage, not Voth): inspector, marks, picture menu, minimap, edit modes (place, remove, flora), cutaway on its interiors. **Done 2026-10-15** (`core/host` 93 to 99, `example/`, Girder on `host.FULL`; Voth's 2026-10-15 stocks panel and contents are the standard, `93-host-stocks.js`; the save route; `core/host/README.md`, "The whole interface") | 2 |
| 3 | Iziz (the Ancients lineage, full registry), then Highlands (the same camera). **Done 2026-10-15** (the vernacular sheet, the city, the rows and Roketstad on `core/host`; `core/host/README.md`, "Used by") | 2 |
| 4 | fauna mode and ground brushes on `KFIELD`. **Owner, 2026-10-13:** the fauna kit was fleshed out on its own branch (`ccr-05259b8d-kuy4pm`: the six-limbed beasts, the centaur, arboreal and climbing gaits, the Rift and lowland gliders, the plumelands' ash runner and racer), so fauna mode is built on that kit once it is merged: it places and edits animals from `kits/fauna`'s registry and life data (biome, diet, activity, traits, gait), as ADD/MOVE/REMOVE ops in `core/edits`, not a copy of Streetlab's flora mode. **Done 2026-10-15** on Sedesert (the one `KFIELD` build): fauna mode from `kits/fauna`, ground brushes (`core/terrain/31-core-field-brush.js`), strokes as `core/edits` ADDs replayed on undo (`core/host/README.md`) | 1 |
| 5 | every other settlement and kit sheet: Dalab, Xanadu, Reed Lake, Screamers, Jimjam, Mav's Refuge, Yuni, Locus, Mungo, Shade, Verge, Noah's Regret, Ys, Dhelv, the kits | about half a session each |
| 6 | Voth (`settlements/voth`) onto it, when next touched (no separate branch owns it since 2026-10-18) | 2 |

Each step is proven by screenshots with the chrome hidden matching the old ones, `verify.py --assert` unchanged, the
scripted walk, and a baseline that moves only for the adopted pages.

**Risks.** Streetlab keeps changing, so features are ported by hand from recorded versions. The full interface is about
70 to 90 KB per page; the editor, picture menu and cutaway are opt-in. Builds disagree on camera angles (Girder's theta
from +x, Iziz's from +z), on frame hooks (four conventions) and on keys (Q/E, F, G, [ ], b, x, p, i): the host has one
keymap and leaves Alt+click to `tools/edits`. The host is `[web]` and is not ported to Godot; the operation log is plain
data, so Godot's tools read and write the same log.

## 11. The refactor audit (2026-10-18) and the adjusted roadmap

ChatGPT's read-only audit of `main` at `a4ace118` (the owner's "Krator refactor audit" doc) reviewed stages 0 to 2.
Its verdict: continue from the refactored architecture, treat the export's stubs as the gap, and make the next
milestone one complete, tested settlement through the canonical export rather than more isolated exporter or importer
features. Checked against the tree the same day:

**Right.** The export's stubs are the real gap: five sections are declared stubs, Iziz alone fills `fixtures` and
`furniture`, `sim` travels through Verge's and Dhelv's own verify scripts, `city` has only its registration point, and
nothing says which sections a given case must have, so a world file can pass `EXPORT.check` with no interiors,
furniture or citizens. The terrain field has one taker: seventeen builds list `CORE_TERRAIN`, but that is mostly the
carve; only sedesert's build takes `30-core-field.js`, so one export in about thirty carries a `krator-field` ground
(stage 2a-b's reseeding event, "Port: next" item 5, is still open). The simulation is not yet one contract: Voth is on
`core/simulation`, Verge keeps its own `SIM` with its own Godot twin, and stage 5's three levels are not in `SCHEMA.md`.
LOD needs a Godot-native policy written down: finding 16 (`GODOT-PLAN.md`) invented one in the importer on 2026-10-16
(150 m cells, ranges widened by the half-diagonal), ~~but it lives in `biome_import.gd`, not in the export contract~~ (2026-10-18: it is in the contract now, `convention.lod` in `core/export`; see item 4).

**Stale or misread.** Forward+ on a real GPU has run: findings 15 to 20 record the 2026-10-16 run on the owner's
machine (Godot 4.7.2), with frame rates and five same-day fixes; what remains is the editor import route, a perf table
and side-by-side comparisons. The `84-host-ground.js` fragments are not terrain duplication: they are the biome core's
browser-side ground draw, tagged `[web]`, where the port rules put drawing; the field is the data side. Its stage 1
items 1 and 2 are done: `checks.yml` runs `tools/test_all.py` on every push and fails on a dirty tree after the
rebuild, and ten biome builds plus Iziz already call the exporter from their build scripts. Its P2 points (duplication,
`core/space` adoption, geometry counts) are covered by stage 1's geometry report and `core/city/PLAN.md`; the geometry
report is extended to the export cases rather than a new tracking effort started.

**The adjustments** (owner's call, 2026-10-18, with the isle demo as the lived-in settlement):

1. **Export profiles** (new, small, first). `EXPORT.check(world, {profile})` takes the sections a case must fill; a
   required section that reads `stub`, `none` or `error` fails that build's `verify.py --assert`, and the nightly runs
   it on the must-pass set. The audit's best new idea; one session.
2. **The must-pass set,** named in `GODOT-PLAN.md`'s milestones: sedesert's tile (M4, done), Iziz's district (M5,
   done), **the isle demo's two towns (M6)**. Every other build is preview-only until it meets a profile. The isle demo
   replaces the Voth district as M6 because it is smaller (a few thousand citizens, not 53k), stands on the scale
   model's own ground from the start, is the first real taker of the `sim` and `city` sections, and its two towns 122
   km apart test what Voth cannot: a settlement nobody is watching, and trade between settlements
   (`settlements/isle-demo/PLAN.md`, section 7). Voth becomes the scale test after M6.
3. **The terrain measure.** Replace "39 `terrainH` definitions" with exports whose ground is a field, one per terrain
   family: a biome heightfield (sedesert, done), the scale-model region (the isle demo), a carve build (the Throne or
   Xanadu), a city on sampled ground (Iziz). Migrate one build at a time with an accepted baseline rewrite: the
   audit's noise warning and this roadmap's own rule.
4. **Stage 4's Godot items, rewritten.** Strike the first GPU run. Add: the editor import route (CHECKLIST item 3c); a
   fixed perf table per must-pass case (load time, frame time, VRAM, draw calls) on the owner's machine; the perceptual
   `compare_shots.py` metric already listed; and the 150 m LOD cell policy written into `core/export`'s contract, so
   pages never export LOD copies and the importer's cells are the one policy.
   **Done 2026-10-18:** `convention.lod = {cell: 150, widen: 'half-diagonal', copies: 'none'}` in `07-core-export.js`;
   `biome_import.gd` reads the cell from it (default 150 for older exports and the krator-biome JSON route);
   `world_test.gd` asserts it and rift's 175/47/12 node counts (`core/export/README.md`, "LOD").
5. **Stage 5 starts with the schema** (above): the three levels against the isle demo, then the `sim` section's required
   fields for its profile, before more sim features cross to Godot. Verge's own `SIM` retires when it moves to the core.
6. **Stage 3 stays where the owner put it** (section 9) but does not gate items 1 and 2: the host shell is `[web]` work
   and touches no export.
7. **No separate economy session.** The owner's Voth economy fork is closed (2026-10-18); `core/simulation` is edited
   on `main`, and the isle demo is the economy's test case as it is built. CLAUDE.md "Who works where" and the isle
   demo's PLAN.md say so; the "Voth branch's" notes in `core/export/README.md` and `GODOT-PLAN.md` are amended.

**The order from here:** the isle demo's P5 (the owner lays out the towns) and P6 (two `KCITY` plans, `core/city`
registering its `city` section), item 1 (profiles) as P6b, item 5 (the schema) opening P7, P7 (the partition, trade,
the abstract-level week test), then P8 as M6 and M7. Stage 3's step 5 (the other settlements onto `core/host`) and
item 3's terrain families run beside it whenever a session has room.

## Appendix: how this evaluation was made

The two external evaluations were converted from `.docx` with pandoc (`evals/`). The repo was read at
`b772f2c7` under `CLAUDE.md`'s rules (no built pages, no `dist/`, no fragment over 30 KB whole). Five
verification passes checked: the biome shader and LOD-export claims; the placement, furniture, frustum, default
and complexity claims; a duplication, terrain, PRNG, exporter and material census; the Godot project's state;
and the tooling, CI, texture, simulation and open-world state. Every verdict in section 2 cites the lines it rests
on. Numbers this evaluation did not measure itself are marked as the plan's or the spike report's.
