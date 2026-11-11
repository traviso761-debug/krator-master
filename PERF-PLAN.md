# Krator: the optimization plan for the next all-builds rebuild (2026-11-10)

Written by the second integration pass from two inputs: `heaviest-pages-2026-11-10.md` (this pass's GPU numbers) and Gemini's
second opinion on it, `OPTIMIZATION-PLAN-2026-11-10.md`. This file is the plan; Gemini's file is the evidence it draws on.
Nothing here is built yet. The owner decides the gates marked **Owner**.

## 1. What Gemini got right, and what to check before acting

Checked against the code on `claude/integration-2` (2026-11-10):

| Gemini's claim | Verdict |
|---|---|
| 39 of 42 biome `verify.py` click every `#ui button`, the shadow toggle included, so later `--all-views` shots run with shadows on | **Confirmed** (only throne, xanadu and one other filter `[id$=-btn]`). Some of today's per-view numbers are inflated by it. |
| `BIO.INDEX_ITEMS = false` (every foliage card unwelded) | **Confirmed** (`core/biome/20-core-kit.js` line 61) |
| `BIO.bake()` sets `frustumCulled = false` on every instanced mesh, ranged or not | **Confirmed** (line 548; and line 706). Range-less items are one map-wide mesh, never culled. |
| A tree's owned cards are not `loose`, so per-instance LOD culling skips them | **Confirmed** (line 553) |
| The catalog batch is soup unless asked (`indexed` off by default) | **Confirmed**, but 22 furnished fragments already ask; the default flip is cheap, not a big win |
| `kbake` clones the material per chunk and never culls | **Confirmed** (`kits/ancients/src/30-kit.js` lines 23, 28; the same in the lineage's copies) |
| Throne's `elfin` declares `far:{...}` and then `far:null` | **Confirmed** (`biomes/throne/src/50-biome-throne-species.js` lines 137-141) |
| Pillow and bolster over-tessellated | **Confirmed** (`_seg(12, 8)`), a look change |
| Voth's always-on 4096 shadow at `settlements/voth/src/50-site-scene.js` | **Wrong path**: that file does not exist (Voth's city is `targets/voth-city`). Re-measure before acting |
| Its "Owner-Locked Architectural Decisions" (1.3) | **Not owner decisions yet**: they are Gemini's proposals. They are gates below |
| Projected "post-fix" numbers | Estimates; Phase 0 must measure them |

Rule for every item below: open the cited lines first. Several of Gemini's line numbers will have moved with this pass's merges.

## 2. Principles

1. **Measure before cutting.** Fix the verify harness first, or every before/after is wrong (Phase 0).
2. **Zero-look-change first**, proved by the fingerprints (`core/engine`, `core/furnish`), `KTAGS` uids and a GPU screenshot diff;
   the hash baseline will move (bytes change) and that is expected.
3. **Look changes go to the owner** with before/after sheets, kit by kit, never inside a core change.
4. **Placement never moves**: no new or reordered draws on `BIO.fn.rng` / `KRAND` (README, "CORE MODULES ARE NOT OPTIONAL").
5. **One all-builds rebuild** carries the core phases; the kit passes ride with their own kit turns.
6. **Godot parity**: every core change says what the importer does with it (`aLodI` -> `MultiMesh` custom data, chunked meshes
   -> one record per item on export).

## 3. The phases

### Phase 0: measurement truth (before the next rebuild; small, no page changes)
- **0.1 The view buttons.** One helper in `tools/harness.py` (`view_buttons(page)`: `#ui button:not([id$=-btn]):not(#boundsBtn)`)
  and every `verify.py` calls it instead of its own selector. A test in `tools/tests/test_verify_page.py` that a page with a
  `shadow-btn` keeps shadows off through `--all-views`.
- **0.2 One stats line for every verify.** `verify_page` prints and records per view: draw calls, triangles drawn, shadow on/off,
  scene triangles (a scene census, Gemini's `_api.sceneCensus()`: bio, ground, water, stacks, caverns, furniture, fauna, other).
  Today about 70 verifies (most kit sheets, Voth, Dhelv, the isle demo) print their numbers in their own shapes or not at all.
- **0.3 A perf ledger.** Each verify writes its stats to `perf/ledger.json` keyed by page and bytes; `tools/perf_report.py`
  writes the heaviest-pages table and a before/after diff. The table Gemini read becomes a command, not a hand job.
- **0.4 `BIO.unrangedReport()`**: items with over 100k instances and no `BIO.range`, as a verify warning (not a failure).
- Done when: the 42 biome verifies keep shadows off; every verify prints the stats line; `perf_report.py` reproduces the table.

### Phase 1: core, no look change (the next all-builds rebuild)
Each item its own commit, each with its node test, each checked on 6 reference pages before the rebuild
(rift, ringisles-high, throne-cloud, crater-drylands-edge, erewhon, voth-city): fingerprints identical, screenshots identical
at every view, the stats line lower.
- **1.1 Frustum culling for baked instances.** `BIO.boundInstanced(im)`: a rotation-safe `im.geometry.boundingSphere` over the
  instance matrices (r128 tests the geometry's sphere; it has no `InstancedMesh.boundingSphere`), `frustumCulled = true`, in
  `BIO.bake()`, `kbake()` and the catalog batch's `flush()`. The biggest win for the least risk.
- **1.2 Chunk the range-less items.** Items with no `BIO.range` and over 25k triangles split into the `BIO.LOD.chunk` cells (1200 m)
  so 1.1 can cull them; `lod` stays null (test-lod, the attach audit unchanged); the export coalesces them to one record per item;
  `core/tags` parts keep their index map (`def.parts`): test it.
- **1.3 Indexed foliage.** `NURSERY.harvest()` reads indexed geometry first (`core/world/84-world-nursery.js`), then
  `BIO.INDEX_ITEMS = true`. Gemini cites a measured 17-18% frame cut on nhighlands.
- **1.4 `kbake` materials**: one cached material per def, two variants (with and without `instanceColor`: r128 does not key its
  program cache on it). **1.5** the catalog batch indexed by default. **1.6** open-ended `cord`/`sagRope` tubes.
- **1.7 The LOD attribute (`aLodI`, one slot)**, replacing `aLodA/B/C`: per-instance culling for owned cards and for chunks with
  four or more ranges. This one changes what is drawn far away (cards that drew 1.7 km too far stop), so it is **Owner**-gated on
  before/after sheets of rift, xanadu and nhighlands.
- **1.8 The impostor exposure** fixed in `34-core-impostor.js`, the kits' `IMP_GAIN` overrides removed: a look check, **Owner**.

### Phase 2: structural (their own sessions, after Phase 1 lands; each a branch)
- **2.1 Showcase sheets batched** (interiors-sets 47k calls, catalog 43k, ancients-interiors 17k): `KratorFurniture.batch({indexed})`
  with triangle ranges so a click still finds its piece (Gemini's decision 4). **Owner**: approve the click-to-inspect approach.
- **2.2 Fauna part-instancing** (fauna sheet 2.4k calls; 90% of the culture kits' calls): one instanced mesh per (species, part, material).
- **2.3 Lazy interiors as a core streamer** (`core/furnish`, from Iziz's `95i`, per-cell groups that cull): Roketstad, Verge,
  Erewhon, Ys, Iziz's palace, Longsong, Dalab, Girder. **Owner**: confirm interiors may load on approach on every settlement.
- **2.4 The open-world painter** (`core/world`): cull flora cells before packing matrices, skip rebuilds when the camera is still,
  keep impostor materials, indexed floor, town HLOD from the isle demo's `88t` and its atlas (Gemini's decision 2). **Owner**.
- **2.5 Cavern super-chunks** (nwbay-caverns 880 calls, godthrone-tube 635, zeijani 460).

### Phase 3: kit passes (look changes; each with its kit's turn and the owner's eye)
Ranked by this pass's numbers: Pinnacle Rock (1,857 calls: one isle-proto pool, shadows off at load), Erewhon (35 M tris, 1,528 calls),
Voth city (34.9 M, 1,047), ringisles (27 M, 811), Throne (25 M; `elfin`'s duplicate `far`, lathe segments), crater-drylands edge
(22 M; mound step), swhighlands span (19.7 M; mid prototypes), sedesert mantis (missing `BIO.range`), riftrim lakes (the 720-tri
lens), dambasins port and graveyard (wreck meshes), the Hook port flush. Gemini's section 6 Phase 3 has the per-kit detail; check
each citation first.

## 4. GPU offload: verifying the next rebuild in the cloud

This pass's verify was the bottleneck: about 350 GPU runs took roughly 9 hours on the two local lanes, queued behind other
sessions' verifies. The cloud lanes (`tools/CLOUD-LANE.md`, merged here from `claude/cloud-gpu-lane-7e39d9`) add two RTX PRO 5000
lanes (`vast0`, `vast1`) on one vast.ai machine, same lock and cache. Measured: identical results to the local RTX; slower per job
from here (upload about 3.6 MB/s; the first run of a build sends its LFS files), so they add lanes, not speed.

The plan for the next rebuild:
1. **A verify driver in the repo**: `tools/verify_all.py` (this pass's scratch driver, promoted): the pages that differ from
   `PORT-BASELINE.json` -> the right arguments (biome and station pages `--all-views`, Erewhon `--interiors`, `interiors-sets`
   `--sets`) -> one job each, N workers, `auto` lanes, a results TSV and the perf ledger. `--resume` skips cached passes.
2. **Warm the machine before the run**: `harness.py cloud prewarm` sends every LFS file the changed pages read (the tex packs,
   the libraries) once, so no job pays for it mid-run. Start the instance at the verify phase, stop it when the queue is empty
   (`vastai start/stop instance`), and print the cost at the end. About $1 an hour: a full pass is a few dollars.
3. **Route by size.** Long jobs (Voth city, the isle demo, Erewhon `--interiors`, the biggest biomes' `--all-views`) go first, to
   the fastest lanes; timing runs and Godot GPU runs stay local (their numbers are this PC's).
4. **More lanes when the rebuild is big**: one 4- or 8-GPU machine instead of the 2-GPU one for the all-builds pass (the lane code
   takes one user per GPU; adding `vast2`..`vast7` is configuration). **Owner**: the budget per rebuild.
5. **Fewer GPU runs**: a page whose bytes did not change needs no run (the cache); a page changed only by a shared core file whose
   effect a node test or fingerprint proves (Phase 1's no-look-change items) could take `--assert` on its main view instead of
   `--all-views`. **Owner**: whether that tiering is acceptable.
6. **Keep the local lanes for the work only they can do**: perf timings, Godot, and the sessions that need a GPU while the cloud
   runs the rebuild.

## 5. Found by this pass (fixed or owed)
- Fixed: `tools/build.py --all` built no station pages beyond each kit's default (`tools/test_all.py` `extra_builds` now lists every
  station folder, with or without a `station.json`).
- Owed to Phase 0: the verify stats lines; the `#ui button` sweep.
- Owed elsewhere: Longsong's rebuild (unpublished garment pieces), Voth city's embassies and Arena flight, the Audio Lab's lint.

## 6. Gates for the owner
1. Phase 0 and Phase 1.1-1.6 go into the next all-builds rebuild (no look change). Yes / no.
2. 1.7 (`aLodI`) and 1.8 (impostor exposure): after before/after sheets.
3. Phase 2's four structural changes, each as its own session.
4. Cloud budget per all-builds rebuild, and whether a bigger machine is worth it.
5. Verify tiering for shared-core-only changes (section 4, item 5).
