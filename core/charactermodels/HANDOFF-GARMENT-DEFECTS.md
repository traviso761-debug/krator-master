# Handoff: garment defects (gaps first, intersections second)

ChatGPT's review of 2026-10-28, added to the repo by the owner's word on 2026-11-01. It was written from an inspection of
the rebuild's checkout and maps likely areas, not diagnosed bugs: reproduce each defect first. Read it beside `HANDOFF-CLIPPING.md`.

## Where it stands (2026-11-02)

**Done: the runtime half, on `claude/garment-defects`.** The review's rule, "do not start by widening the padding", was right: both
causes found were the push itself, and narrowing it where nothing needs it is the fix. Not done: anything that needs a garment re-cut, because
this machine has no Blender (the Blender MCP is enabled but has no Blender behind it, and `make_garments.py` needs Blender 4.5 + MPFB2).

**How it was measured.** `tools/garment_audit.py` draws the 66 outfits of `data/peoples.json` (man, woman, giant; A-pose, idle, walk,
run, crouch; four views: 1848 shots) in flat colours and counts faulting pixels (a pixel is about 2.5 mm). `tests/garment-audit.json` is the
state after the fix; `--check` fails a sweep worse than it, and the sweep of the code before the fix fails it. Colours, and what each count does
not see, are in the tool's header. `hole` and `inside` are noisy (arm gaps, sleeve openings): compare them, do not read them as counts of faults.

**The causes** (neutral bodies; controls: the push off, then one capsule group or rule off at a time):

| Evidence | Finding |
|---|---|
| Faults at the A-pose too, gone with the push off | the fit was clean; the push made them |
| Gone with the mirror off (`cs < 0`) | "deep" was measured from the padded radius (5.5 cm out over trousers), so ordinary cloth round a leg was mirrored and the tube folded on itself. Now the bare limb's radius on a hanging leg, growing back to the padded one as the limb lifts (a shin takes its thigh's lift) |
| Boubou and open coats parting at rest, gone with `PAD_OVER` off | a full pad standing still held open panels off the thigh. `PAD_OVER` now comes in with the stride (`kcM`, one number for the figure) |

**The result** (pixels, all 66 outfits, before to after):

| | rest | idle | walk | run | crouch |
|---|---|---|---|---|---|
| legs through a top | 44441 to 14519 | 36962 to 29735 | 119410 to 49498 | 74952 to 61588 | 39919 to 46615 |
| skin through cloth | 33 to 33 | 23826 to 20871 | 43728 to 20997 | 45062 to 58703 | 49094 to 50670 |

`inside`, cloth folded through itself, fell by a third (1548917 to 1052995). **Worse:** skin in a run by 30% and legs through a top in a crouch by
17%. The worst of the run's increases, shot before and after, are the same patches a little larger (the tube skirts below), not new ones.

**At the height ends (`height` 1 and -1, man and woman, no giant) the gain mostly does not reach.** Tall: legs through a top in a walk fell 20%; short:
rose 2%. Skin in a walk rose 12% and 10%; `inside` fell 26% and 25%. Rest stayed high (about 36000 pixels on both), and the push still makes most of
that (about 5000 tall, 2500 short with it off) with `PAD_OVER` off: it is `PAD_TOP` or the capsules against the morphed legs. Taking
the rest of the push away at rest was not tried: the controls show skirts under robes need it at idle.

**Left, and what owns it:**
- **A narrow skirt or robe has no cloth for a stride** (the Chichani court skirt's calf, still shown at walk 0.3 from the back; Order novices; the
  Xanadu tunic's front in a stride). The cut's, not the push's: `HANDOFF-CLIPPING.md` open item 2. A side slit or more flare, the owner's choice; needs Blender.
- **The height ends**, above; `HANDOFF-CLIPPING.md` open item 1.
- **Not swept:** the plain cast clothes (cargo trousers and tee are no people's outfit), so the owner's later notes (a pant seam at Sword cut B, pants through
  the shirt's back in Push (heavy), the left nipple in Idles 3 and 4, the ladder's gap) are neither reproduced nor changed; they are not `loose`, so this push never touched them.
  Sweep them with `--outfits`, and with the roll, swim and ladder clips in `--clips`.
- **`under` overcounts the Hykkousoi trade outfits**: the pteruges sit in the legs slot but hang over the tunic on purpose (kit item `over`), and the tool does not read that.
- **The sweep's pieces:** 24 pieces here were older than the manifest and 10 absent (the mods' heads, tails, some boots and hats, `order_*_novice_skirt`), so
  the novices' numbers are for the older skirt. Rerun them with the published pieces.
- **The Godot twin** has the same change. `kchar_test.gd` gives the one known failure (the giant's ladder, KNOWN_ISSUES), and the shader compiles on Forward+,
  but its picture was not compared with the page's. Its pieces came from an older local set.

### Assignment

Work in `core/charactermodels` to investigate garment defects, with this priority:

1. **A — primary:** garment panel gaps expose skin or underlayers.
2. **B — secondary:** garments occasionally intersect other garments.

Inspect the current checked-out source and branch state before relying on this handoff. Treat it as a map of likely areas, not a diagnosis of any current reproduction. Do not start by widening collision/push padding. First identify whether each symptom comes from the garment cut and seam topology, body coverage/deletion data, skinning and morphing, cloth-chain rest/deformation, slot/layer order, or runtime push/correction.

### Read project instructions and establish the current baseline

- Read `CLAUDE.md`, `core/charactermodels/README.md`, `.claude/skills/character-modeling/SKILL.md`, `.claude/skills/character-modeling/references/pitfalls.md`, `core/charactermodels/HANDOFF-CLIPPING.md`, and `core/charactermodels/KNOWN_ISSUES.md`.
- Start from `core/charactermodels/INDEX.md`; inspect only relevant source ranges in large files.
- Confirm branch, local edits, generated-piece hashes, and that the garment assets used by the lab match the kit manifest. The character-modeling notes warn that stale published pieces make shots misleading.
- Reproduce and record each issue before editing. Use `tools/shots.py` and its deterministic specs; compare front/back and relevant clip times, and capture the exact body, garment/outfit, morphs, clip/time, and view where A or B occurs. Check the rigid/rest pose (`cloth: false`) and the A-pose as diagnostic controls.

### Trace the whole garment path before changing it

Inspect actual code and records, then follow a failing garment from authoring to runtime:

- **Panel construction, seams, and coverage:** `tools/make_garments.py` constructs the procedural panels and garment definitions; inspect the specific garment factory, seams/edge closure, panel row/column topology, hem, slit/flare and ease. Determine if a visible gap is open geometry, insufficient cut coverage during a pose, a bad join, or the body simply showing through an intentional opening. Trace base-body coverage and hides in `tools/make_mpfb.py` (`covered`, `TROUSERS_COVER`, `legged_trousers`, `hide_parts`, `refresh_hides`) and the kit `hides`/delete-group data. A hole in garment mesh and a visible skin region are separate failure classes.
- **Weights, morphs, and deformation:** trace garment fitting/export through `tools/make_mpfb.py` (including `skirt_weights`, `head_weights`, `cover_weights`, `cloth_bones`, `colliders`) and `tools/mpfb_build.py` (slider endpoints/refits and recorded deltas). Check whether vertices at the failing seam have discontinuous or inappropriate bone weights, whether posture/morphing changes the rest clearance, and whether garment chain anchors/rest positions are coherent. Do not assume the build-time settle fixes animated coverage.
- **Layer and fit ordering:** read `tools/layers.py` and the `peoples.json` outfits that combine the failing items. Confirm authoring settle order, each part's layer/slot/`over` rank, and runtime ranking. Inspect fit/ease measurements from `tools/ease.py` where relevant. For B, determine which surface should be outer at the intersection and whether the result changes with build order, morph, or clip.
- **Runtime correction:** inspect `src/50-figure.js` at the current functions/data for `layered`, `pushOut`, cloth rest/step and `afterClip`, plus its Godot twin in `godot/krator/character/` (confirm exact current filenames). Runtime code currently has calibrated thin pads and layer pushes (`PAD_TOP`, `PAD_SKIRT`, `PAD_OVER`) and chain layering. Establish whether correction is creating a gap, failing to cover, or merely exposing a bad cut. Any runtime change must be mirrored in Godot per the project notes.

### Diagnose by symptom and choose the smallest correct fix

Build a short evidence table for each reproduced case:

| Evidence | Root cause it can distinguish |
|---|---|
| Visible in rigid A-pose / `cloth:false` | pattern/cut/coverage or fit data rather than animation correction |
| Rigid pose is clean; first appears at a specific clip frame | skin weights, chain motion, body pose or motion-specific cut coverage |
| Skin visible while garment surface is continuous | body hide/coverage mask, wrong body part variant, or garment too small/short |
| Garment surface itself has an open edge | construction/seam/topology defect |
| Only under/over outfit combination fails | ease, layer rank or build-order dependency |
| Changes with height/weight/muscle endpoints | refit/morph deltas or fixed-size clearances |
| Appears only after push/chain correction | runtime correction interaction; compare correction disabled and enabled |

Fix the cause at the stage that owns it. Prefer a focused panel extension, seam/closure correction, coverage/hide region correction, weight/chain/rest correction, or explicit layer/ease correction. Change push padding only when measured evidence shows a consistent geometric clearance deficit and when pose/outfit regression shots show the added offset does not create gaps or new intersections. Avoid global padding changes to mask a local cut or hide problem.

### Regression checks and completion report

- Add a focused deterministic regression check for each confirmed defect, plus representative front/back shots for the affected outfit. Cover the relevant clip/time and a nearby control; cover another body or morph endpoint when the cause is shared. Include a paired garment when testing B.
- Run the narrow relevant checks first, then the project-prescribed page verification, golden check, and Godot twin test if shared/runtime/coverage data changed. Follow current `HANDOFF-CLIPPING.md` for command paths and verify requirements; it lists `tools/shots.py`, `verify.py --assert`, `tests/make-golden.js`, sync and Godot checks. Do not claim checks that were not run.
- Inspect the final diff and generated manifest for unintended files. If a whole garment rebuild is required, follow the `tools/rebuild.sh --only` workflow and do not edit build inputs while Blender is consuming them.
- Report: each issue reproduced or not; root-cause evidence; exact files/functions/assets changed; why the change addresses A or B; checks and results; visual before/after evidence; remaining cases/risks (including any unrebuilt Godot cover-region data); and any regressions found. Keep A as the release gate; B remains required where the change affects layering.

### Source map and current caveats from this inspection

- `core/charactermodels/src/50-figure.js`: figure outfit assembly, per-item push setup, layer assignment, chain layering, runtime `pushOut`, cloth rest and post-clip pipeline.
- `core/charactermodels/tools/make_garments.py`: garment patterns, settling and layer-ordered generation near its final build loop.
- `core/charactermodels/tools/make_mpfb.py`: garment weight transfer/coverage, cloth bones/colliders, delete groups and skin coverage.
- `core/charactermodels/tools/mpfb_build.py`: MakeHuman/MPFB fitting and morph endpoint exports.
- `core/charactermodels/tools/layers.py`: canonical layer rank and outfit combinations.
- `core/charactermodels/HANDOFF-CLIPPING.md`: recorded findings through 2026-10-20. It documents already-fixed trousers coverage and known unresolved examples such as tall-body robe tears, stride gaps in narrow skirts/robes, a grand boubou intersection, and a court robe/cape intersection. Reconfirm all against the current checkout; do not present that historical list as a current verified bug list.
