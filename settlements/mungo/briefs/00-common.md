# Common rules for every Mungo helper agent

You are one of several agents working in parallel for the new settlement **Mungo** (`settlements/mungo/`), a
trade village at the bottom of the Eastern Abyss on the east shore of a salt lake. The planner (the main session)
builds Mungo itself; you build one self-contained piece that Mungo will use. Read your own brief after this one.

## The repo
- Read `CLAUDE.md` (root) first, and follow its token rules: never open or grep `dist/`, `*.html` builds, `.syntax*.js`,
  `three.min.js`, `*.zip`, `shots/`, `archive/`, `host/`. Read a fragment over ~30 KB by section
  (`grep -n '^/\* ====\|^// ----' file`, then offset/limit). Edit only source (`src/`, `sets/`, the catalog's culture files).
- `README.md` (root) holds the design rules: tag buildings by culture and type, furniture by culture and type and
  indoor/outdoor, keep culture kits separate and modular, write with an eye to the Godot port (data over code).
- Units are metres, x east, z south (north is -z), y up. A building's local frame: origin at the plot centre on the
  ground, +x right, **+z the front (the door side)**.

## This machine
- Windows, Git Bash. Use `python` (3.13). **There is no `node`.** A build's "syntax NOT CHECKED" line is expected.
  Syntax-check and run JS with the planner's stand-in:
  `python "C:/Users/travi/AppData/Local/Temp/claude/C--Users-travi-Documents-krator-master/8872bdae-cfb1-49bd-825b-8142143b033e/scratchpad/jsrun.py" --syntax file.js`
  (`--html page.html` checks every inline script of a built page; without a flag it runs the files in Chromium and
  stubs `require('assert')`).
- Each build's `verify.py` drives Playwright's Chromium (installed; software GL, so heavy pages are slow: be patient,
  run one at a time, never two verify runs at once).
- Python on Windows: open files with `encoding='utf-8'` when you write any script.

## Working rules
- **Another agent session may be editing this same checkout.** Touch only the files your brief gives you. Never
  `git add`, `git commit`, `git stash`, `git checkout`, `git switch` or `git reset`. Never revert or tidy a change you
  did not make (`git status` shows several files modified by someone else: leave them).
- Do NOT run `tools/make_index.py`, do not edit the root `INDEX.md`, `README.md`, `PORT-INDEX.md`, `PORT-BASELINE.json`,
  `gallery/`, or another agent's files. If a shared doc needs a line, put the exact text in your report instead.
- Write your files to disk early and grow them (agents die mid-task; a half-written file on disk is recoverable).
- Determinism: builders draw from their own seeded stream (each kit's convention: `reseed(N)` / `F.rnd()`), never
  `Math.random()`.
- Vertex colours and material hex colours are sRGB in the palettes: convert with `.convertSRGBToLinear()` where the
  kit's own code does (follow the surrounding code).
- Verify by measurement and by looking: build, run the kit's `verify.py --assert`, take the screenshots it offers and
  LOOK at them (open the PNGs with your image reader). One screenshot per meaningful change.

## Report (your final message)
1. What you built (keys, names, files, sizes, triangle counts).
2. How to call it (the exact API the planner will use), with any frame/offset facts.
3. Verify results (commands and pass/fail lines) and the screenshot paths you looked at.
4. Known gaps, and the exact text of any doc line the planner should add to a shared doc.
