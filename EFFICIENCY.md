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

## Timing run

(Filled in by the first run.)
