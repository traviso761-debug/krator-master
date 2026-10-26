# Efficiency: tokens and verify time

Plans agreed with the owner on 2026-10-23. Two parts: spending fewer tokens per session (which model does what, what
each session loads), and making `verify.py` runs, the slowest part of most changes, faster. Each item says what it is
and whether it is done; tick it here when it lands.

## Part 1. Tokens

### Where they go

- **Loaded on every turn:** `CLAUDE.md` (about 20 KB, about 5k tokens) and the memory index `MEMORY.md` (8.6 KB, about
  2k tokens), many of whose lines are status snapshots that have gone stale.
- **Plan reads:** `GODOT-PLAN.md` is 92 KB; section 4 (the phases) is most of it. A Godot session that reads it pays
  for every phase to work on one.
- **Command output:** full build, `test_all.py` and `verify.py` logs land in context.
- **Re-exploring:** working out again which builds a `core/` change reaches, or how the last port of a kind was done.

### Model tiers

| Tier | Model, effort | Krator work |
|---|---|---|
| Design | Opus 5.5 (or Fable 5.1), high | Stage 3's one settlement interface; `core/city` data model for Godot; the `[G data]` boundary; writing a phase brief; nondeterminism (hash baseline drift, GPU vs CPU); visual and shader judgement; lore and plans |
| Build | Sonnet 5.5, medium | Carrying out a written brief: a fragment's GDScript twin, a settlement onto `core/city` ("Porting a settlement"), catalog pieces, tests, `verify.py` fixes, the browser edit queue |
| Chores | Haiku 5.5, low | `test_all.py`, rebuild all and the baseline, re-vendoring, `PORT.md` / `INDEX.md` tag updates, encoding lint fixes, repo-wide searches, pruning prompt lists, commits |

How the tiers are kept:

1. [ ] **Subagents in `.claude/agents/`** with `model:` in the frontmatter: `runner` (Haiku: builds and tests, returns
   pass/fail and the failing lines only), `scout` (Haiku: read-only searches), `porter` (Sonnet: one fragment to its
   Godot twin from a brief). The main session delegates and keeps the summary, not the log.
2. [ ] **Plan once, run cheaply.** The Design tier writes a self-contained brief per phase: files, the template to
   copy, what done looks like, which tests prove it. A Build-tier session runs it without exploring again.
3. [ ] **One session per phase,** its model and effort set for it. Long mixed sessions keep paying for old context.

### Other savings, by payoff

1. [ ] **Split `GODOT-PLAN.md`** into a 2-3 KB index and one file per phase (`godot/plan/phase-N.md`).
2. [ ] **Trim `CLAUDE.md`:** move the Layout table to `INDEX.md` (a lookup, not a rule); keep the working rules.
3. [ ] **Consolidate memory** (the `consolidate-memory` skill): finished projects to one line, stale status lines out.
4. [ ] **Quiet tools:** `test_all.py`, `build.py`, `verify.py` and `port_baseline.py` print a short summary (or
   `--json`) and write the full log to a file, read only on a failure.
5. [ ] **`tools/rebuild_dependents.py <changed files>`:** reads every `build.py`'s lists and rebuilds what takes them,
   so the 2026-10-08 lesson is a command, not reasoning redone each session.
6. [ ] **Shared JS / Godot golden fixtures:** both sides write the same JSON records and a script diffs them, so a
   Chores-tier runner can check a port.
7. [ ] **Batch ports from a template:** the Design tier does the first of a kind; the Build tier does the next N in one
   session, pointed at that commit.
8. [ ] **Fewer screenshots:** `read_page`, or a probe that prints numbers, wherever a check can be numeric.
9. [ ] **Keep the prompt cache:** do not edit `CLAUDE.md` or memory mid-session; keep related work in one sitting.

## Part 2. Verify time

Why it is slow: `tools/harness.py` launches Chromium with `--use-gl=swiftshader`, so every verify builds and draws a
whole world on a software rasteriser, while most asserts are about records (placement, overlap, sim stocks, trade
lines), not pixels.

1. [ ] **Skip an unchanged page.** Builds are deterministic and `port_baseline.py` hashes every page: record
   `{page: hash}` after a passing verify and skip a verify whose page hash still matches.
2. [ ] **Record checks in node.** The `[G data]` side has no three.js or DOM, so placement, `core/city`, sim and trade
   checks (isle demo's `CITY_JS`, `TRADE_JS`, sim checks) can run in node like the `core/` tests. The browser verify
   keeps what needs a browser: the page loads, nothing throws, shaders compile, a few views render. The same fixtures
   then check the Godot twins.
3. [ ] **The real GPU locally.** SwiftShader is for the Linux cloud containers. A harness setting (`KRATOR_GL=gpu`:
   `--use-angle=d3d11` on Windows) for local runs; CI keeps SwiftShader. Run both once to confirm no check disagrees.
4. [ ] **A records-only page mode** (`?verify=data`): build the records, skip drawing, textures and furnishing. Voth's
   `?lite=1` is a start.
5. [ ] **Parallel verifies:** `test_all.py --nightly` runs them in a process pool, one Chromium each; one verify can
   hold several pages in one browser (isle demo loads Kautoa, then Valapo).
6. [ ] **A quick mode per verify:** asserts only (no screenshots, negatives or long sim runs such as Voth's workday)
   while iterating; the full run before a push and nightly.
7. [ ] **Voth onto the harness.** `settlements/voth/verify.py` has its own Chromium launcher, against the rules, so a
   harness speedup does not reach it.

Order: a timing run first (below), then 1 and 3 (small changes to `harness.py` and `test_all.py`), then 2 build by
build, slowest first.

## Timing run (2026-10-23)

On the owner's laptop (16 threads, Intel Arc 140T), branch `claude/water-migration-merge` at `6763cbdef`: the seven
nightly builds and the isle demo, one at a time, on the committed pages. Script: `timing.py` and `phases.py` in that
session's scratchpad (load through `harness.open_page`, then each verify `--assert` as a subprocess).

**Page load to `window._ready`**, SwiftShader against the GPU (ANGLE D3D11, the renderer string checked):

| Page | SwiftShader | GPU |
|---|---|---|
| hyperjungle | 3.2 s | 4.4 s |
| rift | 64.7 s | 15.8 s |
| sedesert | 54.1 s | 7.9 s |
| iziz | 72.6 s | 21.6 s |
| girder | 36.7 s | 16.1 s |
| verge | 48.3 s | 28.3 s |
| yuni | 26.3 s | 19.0 s |
| isle-city | 38.7 s | 23.7 s |
| **total** | **344 s** | **137 s** |

**`verify.py --assert`, wall clock** (SwiftShader, as they run):

| Build | Wall | Result |
|---|---|---|
| isle-demo | 386 s | pass |
| rift | 312 s | FAIL: export profile, `atmos` and `water` empty (page built before `ec7f97c29`) |
| iziz | 195 s | pass |
| sedesert | 147 s | pass |
| hyperjungle | 78 s | FAIL: as Rift (page last built `dbdf85ce9`) |
| yuni | 66 s | pass |
| verge | 62 s | pass |
| girder | 43 s | FAIL: a shader compile error in the render loop (three r128 from cdnjs, not routed), `window._walk.navAudit` missing, `furn.calls` 82 / 54 |
| **total** | **1289 s (21 min)** | 3 of 8 fail on the committed pages |

**Where a biome verify spends it** (each step timed alone after one load, SwiftShader):

| Step | Rift | Sedesert |
|---|---|---|
| load + settle | 15 s | 11 s |
| `STATS_JS` (first frames, window counters) | 22 s | 21 s |
| `ASSERT_JS` (invariants) | 114 s | 16 s |
| `typeStats` | 9 s | 6 s |
| export profile (`check_profile`) | 103 s | 76 s |

(Load times differ between the two runs: Chromium's first frame lands in `open_page` in one and in `STATS_JS` in the
other. Load plus the first stats call is the stable figure.)

### What it says

- **The checks cost more than the load.** On Rift, load plus first frames is about 37 s of 312 s; the invariants and
  the export profile are 217 s. Isle demo's two town loads are about 80 s of 386 s; the rest is its city, sim and
  trade checks.
- **The export profile is 75-100 s per biome verify**, and it is data work in JS: the GPU will not speed it. It runs the
  exporter the nightly export step runs too.
- **Rift's `ASSERT_JS` is 114 s** against Sedesert's 16 s: one or two invariants there are worth profiling.
- **The GPU is 2.5x on loads** (4-7x on the biomes, 1.4-3x on the settlements), so about 3.5 minutes of the 21, not more.
- **Three of eight committed pages fail.** Hyperjungle and Rift are behind `core/` (the atmos and water sections), the
  2026-10-08 failure again; Girder has a render error and a missing nav audit.

### Rift's checks, profiled

Each call timed alone in the page (SwiftShader), then a CPU profile (CDP, 2 ms samples) over the invariants and the
export (`rift_prof.py` in the session scratchpad). Another session was building at the same time, so absolute times
run high; the shares hold.

| Call | Time |
|---|---|
| `_api.regOccupancy()` | **117.9 s** |
| `EXPORT.world`, section `stage` alone | **37.0 s** |
| `EXPORT.world`, every section | 36.8 s |
| items, buckets, materials, textures (each alone) | 0.4-0.7 s |
| `hostNegatives()`, `hostChecks()`, `nanSweep()` | 0.35, 0.23, 0.13 s |
| registry, terrain, atmos, water, `typeStats`, `totals` | under 0.03 s |

- **`regOccupancy` is the whole of Rift's 114 s of invariants.** It is in the shared host probe
  (`core/host/95-host-probe.js` `K.probeTake`): for every registered volume it tests every probe point (every instance of
  every InstancedMesh, every mesh's box centre), so registry size x instance count. The profile puts 88 s in its loop and
  38 s in `inCyl`. Reed Lake's own probe (`settlements/reedlake/src/91-probe.js`) already buckets the volumes by z. The
  fix: a grid over the volumes' circles (x, z, r) in front of `has`, on `core/space` (KSPACE), not a new hash. Every
  build's `regHas` found is the same cylinder test as `inCyl`, so the counts stay the same; the verifies' printed counts
  and the hash baseline prove it. It reaches every build on the host probe.
- **The export's cost is the `stage` section: `KSTAGE.capture` renders the sky panorama and reads it back**
  (`readPixels` 28 s in the profile) under SwiftShader. The GPU speeds that up; or the check takes a smaller sky
  (`sky` 64, not 256) and leaves the full one to the export step.
- Everything else in Rift's verify is under a second.

### The order, revised

1. Skip a verify whose page hash is unchanged since its last pass (item 1): removes whole runs.
2. Run the export profile once per page hash, or read it from the nightly export's output, instead of in every verify
   (new; 75-100 s per biome).
3. Broad-phase `regOccupancy` in `core/host/95-host-probe.js` on KSPACE (profiled above: Rift's 118 s), and a
   smaller sky in the verify's stage capture (37 s).
4. Isle demo's sim and trade checks to node (item 2): the largest single verify.
5. The GPU locally (item 3).
6. Rebuild Hyperjungle and Rift and fix Girder's render error and nav audit, so the nightly list is green.
