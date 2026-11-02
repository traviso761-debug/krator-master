# Handoff: garment defects (gaps first, intersections second)

ChatGPT's review of 2026-10-28, added to the repo by the owner's word on 2026-11-01. **Not started.** It was written from an inspection of
the rebuild's checkout and maps likely areas, not diagnosed bugs: reproduce each defect first. Read it beside `HANDOFF-CLIPPING.md`.

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
