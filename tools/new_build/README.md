# Starting a new build: what it takes by default

Copy the nearest finished build (CLAUDE.md, "Start a new build from the nearest finished one"), then make its
`build.py` and `verify.py` take what the two templates here take. They are the checks of the 2026-11-11 survey
(CORE-IMPROVEMENTS.md items 22-31): every old build gets them at the next all-builds rebuild (TODO.md, "switch on
checks 22-31 everywhere"); a new build takes them from its first commit.

1. **List the build in `tools/checks_optin.json`** under every check (`recorded`, `minset` if it is on the biome core,
   `samplers`, `drawn-ground`, `names`).
2. **`build.py`**: `build.py.template` (the top lines and the core list): a plain `python3 build.py` re-runs itself
   through `tools/build.py`, so `build-inputs.json` is always written (item 25); the biome core starts from
   `buildlib.CORE_BIOME_MIN` (item 26); the page is written with `encoding='utf-8', newline='\n'`.
3. **`verify.py`**: `verify.py.template`: `verify_page(..., checks=harness.SURVEY)` (items 27 samplers, 28 the eye on the
   drawn ground). Items 22 (a lane without `KRATOR_GL=gpu` fails) and 31 (a stale pass is called one) need nothing.
4. **Node tests**: `tools/ktest.js` (item 29): `const T = require('<to tools>/ktest.js')(__filename)`, `T.ok`, `T.neg`,
   `T.done()`; never a local `ok`.
5. **Before the first build in a fresh worktree**: `python3 tools/lfs_needs.py <build> --pull` (item 23).
6. **Commit** with `python3 tools/commit.py -F msg.txt` (item 30), or install the hook once per clone:
   `python3 tools/check_text.py --install-hook`.
7. **Ground**: list `core/drawn/10-core-drawn.js` and `KDRAWN.add(KDRAWN.grid(...))` the cells the ground is drawn from,
   so the audits measure the drawn ground (`core/drawn/README.md`).
