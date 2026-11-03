# Handoff: garment defects (gaps first, intersections second)

ChatGPT's review of 2026-10-28, added to the repo by the owner's word on 2026-11-01. It was written from an inspection of
the rebuild's checkout and maps likely areas, not diagnosed bugs: reproduce each defect first. Read it beside `HANDOFF-CLIPPING.md`.

**Taking this over? Start at `HANDOFF-GARMENT-NEXT.md`**: where the work stands, round 5, shots of what is broken now.

## Round 4: the tools' bug, and the hull (2026-11-02)

**Read this first. Every count and shot before this round is suspect.** `shots.py` and `garment_audit.py` ran the clip 2 s from `max(0, t - 2)`, then set the skeleton to `t` and did not step the cloth. For any `t` under 2 the cloth was from another moment of the stride: walk and run in every sweep, every shot sheet the owner judged, and the "a run shows more skin" of round 3. Both now start `t - 2` back round the loop, so the 2 s end on `t`. A third of what looked like a fault, the flat sole through a robe's back in some frames, was the tool; the leg through the back was real and was worse than the shots had shown.

**The hull.** A shin kicked straight back pierces the sheet, and a push out of a capsule moves cloth away from the limb: it opens a collar round the leg and the leg stays through. Padding, tapers and thresholds could not touch that, which is why rounds 1 to 3 stalled on it. So in `pushOut` each leg gives six points (mid-thigh, knee, mid-shin, ankle, heel, toes: `kcE`), and each sets how far out from the body's axis the cloth must reach at its bearing: its row and all below hang from it, the rows above run up to the waist, the bearings beside it fall away, as a sheet over a raised foot. The cloth is moved along the axis's radius, so two panels at one bearing go together and a front seam stays shut. It comes in with the stride (`kcM`), and the legs' capsules hand over to it (`1 - kcM`): the two together tore the cloth.

- **Every loose layer takes it from the lowest hem worn** (`kcHm`): from its own hem, a gown left a skirt's tent to come through it. A point within 12 cm of the ground counts for nothing, or a robe tents over a planted foot's toes.
- **A smooth maximum (a cube root), not a clamp.** Clamped, two tiers of one skirt met on one radius and came through each other in stripes, whatever the padding (more padding made it worse: the voth_f skirt's purple and crimson are two tiers of one garment). Inside the hull the radius going in is the rest radius (`position`, capped at 6 cm over the current one, or a kimono's sleeves were flung out): where the chains had swung, two tiers could be either way round.
- **The feet have real colliders**: `footEnds`, moved from the top of the foot to the sole and out to the toes, in the push and in `clothStep`'s `W` (the chains knew no foot). On its own this changed little; the hull's heel and toes use it.

**The Kimono** (`mindfront_kimono`, the man's first outfit, a library piece with no chains) had its lower half skinned to the legs: the shins lifted its back with a kicked-up leg and each thigh took its own front panel, which is the owner's "pants through the back, seams splitting in front". `skirt_weights(rigid=True)` hangs it from the hips alone (`make_mpfb.py`, for `LOOSE`), it takes the hull in place of the legs' capsules, at rest too (`kcEO`), and below the hips it is stood back up against the pelvis's tilt (`kcTl`, measured from the hips' joint: from the spine it read the back's posture as a tilt and lifted the back hem off the calves). `mpfb_build --only` cannot re-export a library piece (`merged 0 items`), so the two GLBs in `pieces/` were reweighted in place by the same function; a whole rebuild gives the same.

- **A top over a skirt stands 6 cm further in the hull** (`kcP` 4 cm picks it out): a skirt flared wider at rest than the coat over it came through in patches, trousers-and-skirts through tops up 75% until then. It is why coats stand wide in a stride.

**The counts, the live build against this one, both with the tools fixed, all 66 outfits:** skin through cloth 70913 to 8295 (walk 13854 to 581, run 25353 to 1744, idle 5015 to 636, crouch 26640 to 5283); legs items through tops 131017 to 125767; feet through tops 125303 to 88769; cloth folded through itself 789131 to 710178; holes flat at 60697 to 60011.
Height 1: skin 83001 to 26319 (walk 29365 to 541, crouch 53250 to 25392), legs through tops **171863 to 189604, all of it crouch (76113 to 104137)**; folded cloth **649013 to 710923**. Height -1: skin 59666 to 7014, legs through tops 91630 to 74907. Crouch is the weak clip on the tall body. Counts before round 4 are not comparable with these. `tests/garment-audit.json` was rewritten from a sweep with the fixed tools.

**Left:** flecks of under-tier through the top tier at the back (the Chichani woman's crimson; the Izani court cape shows more of the robe through it: its rest shape is not cleanly outside the robe's); a pale panel in the Kimono's front overlap; a slipper near the hem of the jama and the boubou in one run frame; long robes stand wider in a stride than they did; a skirt's chains still swing wide in a run; white sleeve patches on the boubou at the shoulder, which the hull does not reach. Godot has all of it and compiles it (one known failure, no shader errors), but its picture has still not been compared with the page. Round 4 is on the live labs, patched on as before: Cosmetic Lab v75 and Animation Lab v55, with the Kimono's two pieces.

## Round 3: the bone bug, and the slits taken out (2026-11-02)

**Read this after round 4: its counts came from the out-of-step tools.** Gemini's review found the cause of the staircase. In `clothStep` a chain bone's offset came from the postured rest while its rotation was built on the A-pose's, so while a clip
played bones stood away from the particles they follow: mean 10.4 cm and worst 30.6 cm on the man's skirt at an idle, 1.8 and 7.4 on the woman's. The simulated cloth and the drawn cloth were different shapes. Each joint now sits on its point.
All the tuning below was measured with that bug in it. Over all 66 outfits the fix alone took skin through cloth from 161743 to 90492, trousers through tops from 315684 to 132879, folds from 1.55M to 781k, skin at idle from 23826 to 3782.

**The slits are out.** With the bones right the four skirts look far better uncut: the novice walk is solid cloth. `torso_tube(slit=)`, kit `gaps` and `slit` and `kcSl` stay, tested and unused, for a real vent. The counts rose when they went (a leg leaving by a slit is not counted): shots decided.

**This build, all 66, neutral, against the start:** skin 161743 to 111980, walk 43728 to 14078, idle 23826 to 3498, crouch 49094 to 30569, **run 45062 to 63802 (+42%)**; trousers 315684 to 129193, walk 119410 to 22442, rest 44441 to 14519; folds 1.55M to 757k.
Height 1: skin 153249 to 143721, **walk 41081 to 70984 (+73%)**; trousers 246200 to 252543, **run 39344 to 59401 (+51%)**. Height -1: skin 113003 to 64902, trousers 161115 to 107575. `verify.py --assert` passes on both pages; Godot gives its one known failure and no shader errors.

**Kept beyond the bone fix:** a stretched segment gives a third of its stretch to the joint (Gemini's cap; the count is flat, it is there for the smear in a cape's border, and that is not yet judged by eye).

**Tried in this round and dropped:** closing the slit's ring with the push on (skin +12%); tapered radii in `collide`, whole leg and thigh-only (run better, crouch and walk worse); the arc lift in `layered` (it held length and folded chain tops: the fold check went to 16, limit 8, and it was
worth nothing in a tall walk). Claims in the first review that did not match the code: the order of `keepLen` and `collide`, a height cutoff in `layered`, several constants; the second review corrected them.

**The open choice: the thigh's dead zone.** `cup` in `pushOut` leaves the back of the top of the thigh unpushed down to `ct` 0.3-0.4. Starting it at 0.18-0.28 once the thigh swings (`smoothstep(0.09, 0.18, lift)`) takes neutral skin in a run from 63802 to 46272 and trousers to 119809, and takes trousers in a tall walk from 61007 to
138661. With a gate at 0.03-0.12 it was the same trade with better numbers while the slits were in. No gate separates them: a tall body's walk trips it. Why a longer thigh suffers so much is not known. It is left out. Ask the owner.

**Left:** a run's kicked-up shin at the hem; skirts swinging wide in a run; the tall body's walk; the plain cast clothes, still never swept; Godot's picture never compared with the page. Round 3 is on the live labs: Cosmetic Lab v74 and Animation Lab v54 (patched on as below, not `dist/`). The patched Cosmetic page passed `verify.py --assert`; `verify.py` waits on a hook the Animation page has not got, so that page was loaded on the GPU beside its last version: the same one blocked-font error, and the skirts draw.

## Where it stood before round 3 (2026-11-02)

**The owner's verdict, ahead of every number below: not solved.** On the textured shots of the slit skirts, every one showed leg clipping through the clothes or seam separation to some degree. The fault counts
miss what the owner sees (a leg leaving through a slit is not a "closed-in patch"). The question sent to ChatGPT and Gemini is whether chains plus a capsule push have reached their limit, against baking real cloth or cutting real panels.

**The live labs are not this branch.** They carry the review-round-3 work (posture controls, two-sided sleeves, the Talovolci) and lack what this branch has (frog and coyote heads, fur). So Cosmetic Lab v73 and Animation Lab v53 are the live pages
with this branch's `50-figure.js` changes, the four skirts' kit entries and their pieces applied on top, not `build.py`'s output. Merge the two lines before the next whole publish, or publishing `dist/` drops the posture controls. The patched Cosmetic page passed `verify.py --assert`; the Animation page's timed out on SwiftShader, and it loads as the unpatched page does on the GPU.

**Done, on `claude/garment-defects`: the push fix, then side slits on four skirts.** The review's rule, "do not start by widening the padding", was right: both
causes found were the push itself, and narrowing it where nothing needs it is the fix. The owner chose a side slit over more flare for the skirts with no cloth for
a stride.

**Blender works on Windows now** (`C:\Users\travi\Tools\blender-4.5`, portable, MPFB 2.0.18, the system assets; `BLENDER_PATH` is set). `BLENDER=<it> LOGS=<a short path> tools/rebuild.sh --only <male ids> <female ids>` takes about 10
minutes. Unchanged garments came back with the same geometry, weights and UVs (one skirt up to 0.3 mm off), textures within 41 bytes. `make_mpfb.py` writes kit.json with CRLF
here: normalise it, and a worktree needs `git lfs pull --include="core/materials/library/cloth.*/albedo.jpg"` (leather and fur too) first; `make_garments.py` now stops on a pointer.

**The slit** (`torso_tube(slit=)`, on the Chichani court skirts and the Order novice skirts, both bodies; its top 24 cm above the knee). Two columns a seam's width apart at each side, the faces between
them left out below its top, so the grid stays a grid; a chain down each lip, not tied to the other (kit part `gaps`), and the legs do not push the cloth below its top (kit part `slit`), as a garment of flaps
is not pushed. Those four outfits, skin through cloth, the slit against the push fix alone: walk 5814 to 607, crouch 15528 to 866, run 12919 to 2598, idle 6728 to 898. All 66 outfits, against the state
before any of this: skin 161743 to 115302, walk 43728 to 15790, idle 23826 to 15041, crouch 49094 to 36008, run 45062 to 48382 (still 7% worse). Trousers through tops as in the table below.

**Tried for the slit, and why not** (each shot or swept; ChatGPT's second round, 2026-11-02, suggested the last two):
- Lips tied by the ring, or let go, or tethered to open with the stride: no visible difference. The ring is not what shaped it.
- Top 10 cm above the knee: the thigh tore through the cloth just above it. 24 cm cured that, so the slit shows the leg to mid-thigh on skirts with nothing under them: the owner's call by eye.
- A rest-relative push (a vertex keeps its rest clearance from each capsule, bounded by the bare limb): clean in principle, but over all 66 skin in a walk doubled (21k to 42k) and trousers in a crouch doubled (47k to 95k). Rest clearance is too little over trousers in motion. Taken out.

**Not tried:** a centre-back vent or gore for the trailing calf (the side slit does not reach it on the Chichani man; a back view at walk 0.3 still shows it, now as a clean opening);
tapering the slit's top over several rows (a little jagged in a stride); measures of lip separation, edge motion, raggedness and flare, which ChatGPT proposes because pixel counts improved while the first slit
looked worse: only shots caught that. `inside` doubled on the four outfits in a walk and a run, probably the lips' inner faces: unchecked. The Chichani man's idle is still untidy at the slit. Other long skirts and robes have no slit yet.

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

That table is the push fix alone; the slit moves only the skin row (above). `inside`, cloth folded through itself, fell by a third (1548917 to 1052995). **Worse:** skin in a run by 30% and legs through a top in a crouch by
17%. The worst of the run's increases, shot before and after, are the same patches a little larger (the tube skirts), not new ones.

**At the height ends (`height` 1 and -1, man and woman, no giant) the gain mostly does not reach.** Tall: legs through a top in a walk fell 20%; short:
rose 2%. Skin in a walk rose 12% and 10%; `inside` fell 26% and 25%. Rest stayed high (about 36000 pixels on both), and the push still makes most of
that (about 5000 tall, 2500 short with it off) with `PAD_OVER` off: it is `PAD_TOP` or the capsules against the morphed legs. Taking
the rest of the push away at rest was not tried: the controls show skirts under robes need it at idle.

**Left, and what owns it:**
- **The rest of the narrow skirts and robes** (the Xanadu tunic's front in a stride, the other long skirts): the slit is one argument to `torso_tube`, a rebuild away, once the owner has judged the first four.
- **The height ends**, above, measured before the slit; `HANDOFF-CLIPPING.md` open item 1.
- **Not swept:** the plain cast clothes (cargo trousers and tee are no people's outfit), so the owner's later notes (a pant seam at Sword cut B, pants through
  the shirt's back in Push (heavy), the left nipple in Idles 3 and 4, the ladder's gap) are neither reproduced nor changed; they are not `loose`, so this push never touched them.
  Sweep them with `--outfits`, and with the roll, swim and ladder clips in `--clips`.
- **`under` overcounts the Hykkousoi trade outfits**: the pteruges sit in the legs slot but hang over the tunic on purpose (kit item `over`), and the tool does not read that.
- **The sweep's pieces:** 24 pieces here were older than the manifest and 10 absent (the mods' heads, tails, some boots and hats; the novice skirts were among them until the re-cut), so
  the novices' "before" numbers are for an older skirt, and the baseline's other outfits may move a little on the current pieces.
- **The labs are not republished:** the four skirts' pieces are new (`pieces/`, gitignored) and go up with the pages.
- **The Godot twin** has the same changes. `kchar_test.gd` gives the one known failure (the giant's ladder, KNOWN_ISSUES), and the shaders compile on Forward+,
  but its picture was not compared with the page's, and no chain or slit check was added. A slit's height there runs on the unmorphed rest heights (CUSTOM1), the page's on the morphed; the merged skirts' skin regions wait for a whole build, or `make_mpfb.py gshapes`.

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
