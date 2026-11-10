# Handoff: garments, for the next session (2026-11-08)

For a session (Claude, Gemini or ChatGPT) taking over the garment work. Read this, then `REVIEW-GARMENTS-2026-11-06.md`
(the audit of the garment session, the reconciled plan in its section 5, and sections 6 on: everything that landed
since, with the measurements), then `HANDOFF-GARMENT-DEFECTS.md` rounds 3 and 4 for the history of the hull and the
chains. The owner judges by eye on textured shots, not by counts: a fix is done when the shots look right.

## Where the work is

- **Worktree** `C:\Users\travi\Documents\krator-garments`, branch `claude/garment-defects`, not pushed. The commits since
  the last handoff (`23a83693d`, round 5), oldest first:
  - `dd244ac22` the checkpoint of Gemini's session (the Python garment pipeline `tools/garments/`, the batch outfits,
    the lab's comments and filters), committed as it stood;
  - `32b26f983` Tzintzun's six Meshy weapons as props (`tools/import_props.py`), a prop per hand in the Cosmetic Lab;
  - `50de0f86b` Phase 0: `make_mpfb.write_kit` the one kit writer, `made_by` on every entry, `tests/check_kit.py` and
    `tools/check_twin.py` in `build.py`, the UI inventory in `verify.py`, the scratch builders in
    `tools/garments/cultures/`, ten legacy chain anchors rebound, the Godot push shader brought level;
  - `d4db43dd0` the capsules hand over to the hull in a stride again, the hull's fourth point back at the ankle;
  - `5c444d91f` no breeze on the page's clock, `fig.clothReset()` before every shot, a hash of the chains in every
    audit record;
  - `45ed84df5` `posedRests` measures with the hips at their rest: a shot is the same on every page load;
  - `9573eff86` the hull's points reach 6 cm round their bearing: the run's shin stays inside the trade skirt;
  - `e69da53d6` the merge of `origin/ccr-fa08b6b3-8w8hxm` (the therian heads and tails, the isle economy, the Menagerie).
- **The live labs are not this branch** (Cosmetic Lab v75, Animation Lab v55): they carry the owner's posture work and
  are updated by patching the diff of `src/50-figure.js` onto them, never by publishing `dist/`. Nothing since round 4
  is on them. `.garment-live/` (untracked) has the copies and `patchwork.py`.
- The pieces (`pieces/`) are gitignored. This checkout lacks the therian heads' and tails' pieces from the merge and the
  nonhuman heads (`build-manifest.json` keeps their hashes, so `check_kit.py` allows them); the ten rebound anchors and
  the kimono's reweighting live only here.

## How it works now (both runtimes)

As the last handoff said (chains, the capsule push, the hull, chainless pieces on the hips, the squeeze), with:
1. The legs' capsules fade out as the stride grows and the hull takes over (`1 - max(kcM, ceo)`); the hull's six points
   a leg sit at mid-thigh, knee, mid-shin, ankle, heel, toes, and each reaches 6 cm round its bearing.
2. The chains' posed rest is measured with the hips at their rest and the morph alone (`posedRests`).
3. `fig.clothReset()`: the chains at their rigid rest, the clock and the step accumulator at zero. `shots.py` and
   `garment_audit.py` call it before every shot; a shot is then the same on every page load, and the audit records
   carry a hash of the chains (`cloth`) so two sweeps can be told apart in their records.
4. Every change to the push goes into both `src/50-figure.js` and `kchar_push.gdshaderinc` / `kchar_figure.gd`;
   `tools/check_twin.py` (in `build.py`) holds the two copies' literals to `tests/twin-baseline.json`.

## The audit, and how to use it

- `tools/garment_audit.py <out> [--match s] [--bodies b] [--known] --page dist/cosmetic-lab.html` with `AUDIT_GL=d3d11`;
  `--check` against `tests/garment-audit.json` (66 outfits, round 4's tools; `--known` sweeps those alone, where
  `peoples.json` has grown to 220, and `--baseline <dir>` *writes* the baseline: never confuse the two). One outfit
  takes a minute on the GPU, the 66 about ten alone; run one sweep at a time on a loaded machine, four at once ran
  out of memory; the records are repeatable now, so a one-line variant is measured by packing it into a copy of the built page
  (the fragment source is in the page verbatim) and running the outfit it concerns. Read "under" and "inside" as the
  gated classes; "hole" is not gated.
- `tools/cloth_probe.py dist/cosmetic-lab.html [base,no-wind,rigid,skirt-only]`: verify.py's court-skirt check taken
  apart, per chain, against the thigh's median and tapered radius.
- `verify.py dist/cosmetic-lab.html --assert`: the page's checks, the UI inventory (`tests/ui-inventory.json`,
  `--ui-baseline` rewrites it), the court skirt's chains against the tapered thigh.
- Godot: `C:\Users\travi\Downloads\Godot_v4.7.2-stable_win64_console.exe --path godot --gpu-index 1 --script
  res://tests/character/kchar_test.gd` (not headless); its one known failure is the giant on the ladder.

## Where Phase 1 stands

Four candidates were measured on page copies against the whole baseline (the review, section 6, has the numbers);
none is applied:
- the trouser squeeze extended to the seat's capsules (issue 1, shader): no measurable change;
- the chains' heading eased from the hips' to the feet's below the knee (issue 8.1, `rigidTargets`): worse, rejected;
- an open part's two lips held to 1.2 x their rest distance (issue 12): mixed (skin down 12 %, six outfits worse), the
  owner's call on a shot sheet of the ten affected outfits;
- the hull on chained garments gated by the stride again (round 5's gate): worse, rejected.
The bisection of the round-5 commits (2026-11-09, the review's section 6) found the one regression that mattered:
Gemini's checkpoint widened the fade of a chain root's rigid offset in `rigidTargets` from "to the hips" to "3.5 x the
offset", which swept robes' lower rows through the legs (the Beast Rider and Hykkousoi nobles' "inside" doubled).
Restored in both runtimes: on the 66, "inside" -12 %, "under" -5 %, every noble back at its baseline figure. The set-wide
"under" rise against the round-4 baseline was never a regression: six Yuni outfits changed to Gemini's new garments
at the checkpoint, and their trousers show under the new shirts and dusters (a hide mask). The two kit fixes it owed
are in: the Hykkousoi trade greaves' masks rederived by the rays' rule ("hole" back to the baseline), and the Yuni
trousers' cuff eases set against their boots (the stockman over, the riding tucked in: "under" 53690 to 6368 on the
peasant man). Two smaller, mixed chain changes from the checkpoint remain as they are (the row clamp with its second collide
pass, hunk 26 of the checkpoint's `50-figure.js` diff; the collide and capsule changes, hunks 19-21 and 27-34): each
a few per cent on "inside" or "under" either way, not worth a revert without a shot sheet.

The bisection's method, for the next one: a page assembled from any commit's `src/` and `data/` (pieces shared;
`page_at.py` in the session scratch reproduced the committed page byte for byte), then page copies of the baseline
with chosen hunks of the diff applied (`hunks_at.py`), each swept with `--known` and compared outfit by outfit. The
shader hunks could not be measured apart from the chain hunks (they were written against them); the chain hunks could.

## Left after that

- The thirteen vendored copies of core functions in `tools/garments/cultures/` (strip them with a before/after sheet
  of every outfit they build: it rebuilds half the kit).
- `Part.role` on every part and the rules dispatching on it, not on names (the review, section 3, point 6).
- Phase 2 (belts and medallions, one cloth grid per garment, the hide margin by standoff, trousers from body slices,
  the painted strips in metres, sleeves, hats, hair tails on chains).
- The giant's four-armed coat's seven dead chains (`tests/kit-known-bad.json`): a Blender rebuild with the split
  before the chains.
- The no-clip rest shot keeps chain state between shots (`update` returns before the cloth pass without a clip); its
  pixels are the rigid rest either way.

## Rules that bit

- Every change to the push goes into both runtimes; `check_twin.py` fails the build when the literals drift.
- Fragments pack many statements a line: no trailing `//` comments inside shader strings.
- A dump rounded to a micron hides an ulp bug: dump full precision when two runs disagree.
- Only `make_mpfb.write_kit` writes a kit; `tools/garments` entries are `made_by: garments` and the Blender tools keep
  them unless `--force-replace` names them.
- The Bash tool mangles backslashes in heredocs: write a patch script to a file and run it.
- Sweep both bodies and both height ends before trusting a rule; a partial sweep looks better than a whole one.
- The owner prefers PowerShell for commands given to them.
