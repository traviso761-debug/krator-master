# Review of the garment session's audit (Claude, 2026-11-06)

A second reading of Gemini's `garment_audit_and_root_cause_proposal.md` against the code in this worktree
(`C:\Users\travi\Documents\krator-garments`, branch `claude/garment-defects`, working tree on top of `23a83693d`).
Every claim below was checked in the source named; where I could not check, I say so.

## 1. The state of the worktree, before any fix

These are the facts that decide what to do first.

- **Nothing from the session is committed.** `git status` shows 351k lines changed over 19 tracked files, and
  `tools/garments/` (the whole Python pipeline, 4,500 lines) is untracked. One `git checkout`, one bad merge, or one
  crash loses the session. Commit now, as it stands, before any further fix.
- **The outfit builders are not in the repo.** `tools/garments/cultures/` holds three cultures (historians, xanadu,
  yuni). The other ten builders (21,288 lines: `build_batch2_outfits.py`, `build_inspired_outfits.py`,
  `build_pc_outfits.py`, `build_geomancers.py`, `build_true_heir_bodyguards.py`, `build_yuni_military.py`,
  `build_hairstyles.py`, `build_facial_hair.py`, two Meshy importers) live in
  `C:\Users\travi\.gemini\antigravity\brain\90fc1231-...\scratch\`. `pieces/` is gitignored, so for about half of
  `kit.json` the only record of how a piece was made is a file outside version control. `tools/garments/build_all.py`
  cannot rebuild them.
- **Five of those builders carry their own copies of core functions** (`assemble_garment`, `torso_tube`, `sleeve`:
  three copies each in batch2, inspired, true_heir and yuni_military, one in pc). This is the mechanism behind
  Gemini's own regression no. 1 (outfits that kept legacy weights after a core fix) and it is still in place.
- **`kit.json` has two writers with two formats.** `tools/garments/core.py register_entries` writes `indent=2`, LF;
  `tools/make_mpfb.py main` and `merge_kit` write `indent=1` and CRLF on Windows. Two of the three kit files are CRLF
  now. Every write reformats the whole file, so the diff of the male kit is 260k lines and no reviewer can see a
  single entry change. That is why the Dalab robe desync was found on the page, not in the diff.
- **`make_mpfb.py main` without `--merge` deletes `pieces/mpfb_<body>/` whole (`shutil.rmtree`) and rebuilds
  `items` from the Blender manifest alone.** A full Blender rebuild would erase every Python-built piece and entry.
  With `--merge`, `merge_kit` replaces entries by id, which is exactly how a stale `.cloth.json` in MPFB's user data
  overwrote `dalab_m_noble_robe`.
- **The integrity gate Gemini proposes (its "Check #10") finds live faults today.** I ran it
  (scratchpad `kit_integrity.py`: GLB present, morph present, chain bone count in the skin against the kit, chain root
  inverse bind against `pts[0]`):

  | body | items | with cloth | anchor off by > 2 mm | missing GLB |
  |---|---|---|---|---|
  | mpfb_male | 825 | — | 5 | 2 |
  | mpfb_female | 629 | — | 5 | 2 |
  | mpfb_giant | 39 | — | 1 | 1 |

  `giant_free_m_chief4` is off by 0.625 m in both the male and the giant kit (a real break, the one Gemini names).
  The rest are 8 to 85 mm on legacy Blender items (`iziz_*_trade_coat`, `beast_*_noble_deel`, `rep_*_trade_jacket`,
  `rep_f_peasant_dress`, `rep_f_fest_peasant_sarafan`): most likely the settle pass moved vertices after the chain
  spec was written, which would be a long-standing fault rather than this session's. The missing GLBs are the
  nonhuman heads (`mod_head_coyote`, `mod_head_frog`), which are local-only by design. All 207 cloth items have the
  right number of chain bones.
- **The regression gate was not run.** `tests/garment-audit.json` is untouched and no sweep is mentioned; the
  handoff's `verify.py --assert` is "not swept". `tests/test-rig.js` passes.
- **The Godot twin has drifted.** `kchar_push.gdshaderinc` has none of `kcSF`, `elayer`, `ehit` and fewer uses of
  `kcSH`, `kcTl`, `kcEO` than the page's shader. The handoff rule ("every change to the push goes into both") was
  not kept this session, and the synthetic wind (below) has no Godot counterpart at all.
- **The editor kept its hooks.** `window._kchar` with `ready`, `still`, `record`, `set`, `body`, `cam`; the wardrobe,
  outfit, mod, dye and thumbnail code all survive, so `shots.py`, `garment_audit.py` and `verify.py` still drive the
  page. The 1,076-line editor diff is mostly the comment system (four persistence tiers plus a `127.0.0.1:18923`
  sync daemon; every page load, the published artifact's too, now makes a failing localhost fetch).

## 2. The thirteen issues: what holds, what does not, and the fix I would make

Agreed means the code says what the report says; the fix column is mine where it differs.

**Issue 10, robes moving at rest.** The "root cause", the oscillating wind when `window.ATMOS` is absent
(`src/50-figure.js` 1874-1878), is **Gemini's own addition this session** (every line of that branch is `+` in the
diff) and it is not in Godot. The report presents it as a found defect. Fix: delete the branch. `DAMP 0.04` and
`DRAG 1.6` predate it and were tuned with the audit; retune only after the wind is out and a sweep shows rest motion
still too high.

**Issue 8, robes pinching at the shins when the trunk turns.** Part 1 (chains placed by the hips' heading, not the
shins') is plausible and the fix is sound: in `rigidTargets` for `!ch.whole`, blend the heading of `F` from the
hips' at the hip joint to the feet's (`footFace`, which `legCaps` already computes for `kcTl`) below the knee. Part 2
(a double rotation on chainless skirts, "already skinned to `LeftLeg`/`RightLeg`") is **wrong**:
`skirt_weights(rigid=True)` (`make_mpfb.py` 316-375) drops every leg joint, including the shins, and gives it all to
`Hips`; `kcTl` is the only turn. Do not touch `kcTl` for this.

**Issue 7, hair and collars turning with the head.** `head_weights` (`make_mpfb.py` 377-455) gives a component that
does not reach below `Neck - 3 cm` wholly to `Head`. For hair on the scalp that is correct; a scalp that does not
turn with the head is the worse fault. The report's fix (a `Spine2 -> Neck -> Head` ramp on all hair) would break
every short hairstyle. The right fix for a long tail is what the headband's tails already have: **cloth chains**
(`cloth_spec` on the tail part, parent `Head`, the `upCrest` path for stiff ones). For high collars on torso items
the report is right that `TRUNK_TREE_GL` leaves `Neck`/`Head` weight on them; fix: in `assemble_garment`, cap
`Head` weight at 0 and `Neck` at 0.3 for torso parts whose `z <= TOP + 0.08`, renormalised.

**Issue 13, belts and medallions floating.** Agreed, confirmed in Rule B (`core.py` 675-735: push to the largest
trunk radius in a 3.8 cm band and an 18 degree sector, plus 12 mm). On a pleated tunic that is mid-air. Fix as
proposed: conform the band's inner ring to the interpolated local tube radius plus 3 mm, and take skinning and morph
deltas from the nearest tunic vertex (`make_mpfb.take_weights` and `cover_weights` already do this for tiers). The
same applies to Check #7's rigid `Spine2` for medallions over a `Spine1`/`Spine2`-blended tunic.

**Issue 1, layers through each other at the hips.** Agreed on both counts: `layered()` moves chain particles only,
and the squeeze loop in the shader (`for(int ci = 0; ci < 6; ...)`) draws trousers toward the leg capsules but not
the seat capsules 14 and 15. Fix: extend the squeeze to 14 and 15 below `kcSH`, and give an outer tier the inner
tier's cloth bone weights through `cover_weights` instead of its own chains (the pitfalls file, section 5, says the
same: one grid per garment).

**Issue 12, seams popping in a run.** The mechanism offered (the `co = -co` normal flip in `pushOut` sending two lips
opposite ways) is unverified and unlikely: both lips of an open coat face outward. The verified half is that
`c.ring` links neighbouring chains only when the tube is closed. Fix: for open arcs, add a lip constraint between
the first and last chain of each row with a maximum of the rest gap times 1.2, the way a ring is constrained, so the
lips can part but not fly.

**Issue 5, holes at open edges (the kimono).** Agreed: `covered()` hides whole triangles, and the new
`boundary_margin` only protects the upper chest (`y >= 1.24`, `|x| <= 0.25`). Generalise it to every open boundary
(hem, cuff, slit, lapel), but scale the margin by how far the garment stands off the skin at that edge: a snug
T-shirt neck must still hide to its edge (the pitfalls file records the shoulders coming through when the hide
stopped short), an open lapel 1 cm off the skin wants the full 3.5 cm.

**Issue 2, thighs and calves through breeches.** Agreed. The strongest proposal in the report: build trousers from
horizontal body slices (`_leg_skin_ring`, as footwear already does) instead of straight raycasts between joints.
`TROUSERS_COVER` hides a triangle only when all three vertices are hit; near the knee a two-of-three rule within
4 cm of the joint would close the rest.

**Issue 9, motifs stretching on flared skirts.** Agreed and confirmed (`core.py` 896-900: `u = j / (cols - 1)` on
every row, painted at one mean circumference). Fix: paint each strip row at its own ring circumference (the pitfalls
rule "draw round things in metres", applied to the whole strip), so a motif keeps its metres from waist to hem.

**Issue 4, sleeves.** `sleeve()` already caps ease at 2 cm and flare at 2.8 cm (Gemini's change), but `sleeves()`
and direct `limb_tube` calls do not, and the scratch builders bypass both. The push has no trunk capsule at all
(capsules 6-9 are the arms, 10-13 the lower arms, 14-15 the seat), so a sleeve on a non-loose top is never pushed.
Fix: cap in `limb_tube` itself, and classify arm parts by distance to the arm bone segment rather than by name.

**Issue 6, hats.** Agreed; the scratch builders hardcode crown radii up to 0.245 m. But the proposed Check #11 is a
silent clamp, and silent clamps are what broke Phil's shoulders (Rule A's first version) and the trouser legs
(trunk_tubes' first version). Make it an assertion that fails the build with the number, so the builder gets fixed.

**Issues 3 and 11** (shoulder seams, ankle rings): agreed as described; the fixes proposed (a shared shoulder cap
ring between `torso_tube` and `sleeve`; ankle rings from body slices) are right.

## 3. Why the work goes backwards, and what stops it

Gemini's regressions all have the same shape: a rule keyed on a **name substring or a shape heuristic**
(`'band' in name`, `>= 24 columns`, `|x| > 0.035`) applied to every part of every garment, fixed by adding an
exclusion list, which the next garment escapes again. Rules A, B, C, `trunk_tubes`, `is_arm_part` and Check #7 all
work this way. The guards, in the order I would add them:

1. **Commit, per fix, with the audit numbers in the message.** Nothing else matters until the session is in Git.
2. **One builder tree.** Move the ten scratch builders into `tools/garments/cultures/`, delete the vendored copies,
   and have `build_all.py` refuse to run if any kit entry marked `made_by: garments` has no builder.
3. **One kit writer.** A `write_kit(body, kit)` in `make_mpfb.py` (LF, `indent=1`, keys in a fixed order) used by
   `main`, `merge_kit` and `register_entries`. The diff then shows one entry per change, and the Dalab desync would
   have been a 20-line diff on the robe's `cloth` block.
4. **Ownership.** Every entry gets `made_by: 'garments' | 'mpfb'`. `make_mpfb.py` keeps `garments` entries and
   their pieces untouched (both the `rmtree` and the rebuild of `items`), and `mpfb_build.py` skips those ids, so a
   stale `.cloth.json` can never reach the kit.
5. **The integrity gate in `build.py`**, as Gemini proposes (the script I ran is a start): GLB and morph present,
   chain bones against the kit, anchor against `pts[0]` within 1 mm, `_VIDX` against the morph vertex count. It
   fails the build, like `test-rig.js` does now.
6. **Explicit roles instead of name matching.** A `Part` gets `role` (`trunk`, `sleeve`, `overlay`, `accessory`,
   `leg`, `sole`) set by the Layer-2 builder that made it; Rules A, B, C and the checks dispatch on the role and
   never on the name. A part with no role gets no rule.
7. **Checks measure and fail; they do not fix.** Check #9 clamps a sole and then asserts; Rule A moves sleeve roots.
   A check that moves geometry is a hidden heuristic whose misfires nobody sees. Split them: the rule lives in the
   builder and is visible in the shots, the check only reports a number.
8. **The twin check.** A small script that lists the uniforms and constants in the JS shader string and in
   `kchar_push.gdshaderinc` and diffs them, run from `build.py`. Today it would list `kcSF`, `elayer`, `ehit`.
9. **A UI inventory golden.** `verify.py` already drives the page; add a step that opens one record per body and
   asserts the section titles and chip groups it finds against `tests/ui-inventory.json` (Wardrobe, Outfits, every
   slot section including Backpacks & gear and Gloves, Mods, the hair gender chips, People chips, named characters,
   the comment box). A section that vanishes fails the build. This is the direct answer to "parts of the lab go
   missing".
10. **No root cause without a toggle.** The handoff's evidence table asks for it: a claimed cause is accepted when
    the shot is named and the fault goes away with the rule switched off. Issues 10 and 8.2 above would not have
    passed that bar.
11. **Run `garment_audit.py --check` before "fixed".** On the affected outfits plus a fixed control set, both height
    ends, with the counts in the commit message, and `--baseline` rewritten only for outfits changed on purpose.

## 4. Order

Commit; remove the wind; write `write_kit` and the ownership field; add the integrity gate and the twin check;
move the builders in and strip the vendored copies; then the garment fixes in the order of section 2 (13, 1, 8.1,
5, 9, 2, 12), each with its sweep. The UI inventory can go in at any point and should go in before the next editor
change.

## 5. On the reconciled plan (Gemini + ChatGPT, later on 2026-11-06)

The plan takes sections 1 to 3 above whole. What to change before acting on it:

- **Names and paths that do not exist.** `applyClothPhysics()` is `clothStep()`; `OutfitComments` is not a symbol; the
  sync fetch is `/state`, not `/comments`; the twin is `godot/krator/character/kchar_push.gdshaderinc`, not under
  `core/charactermodels`; footwear is `tools/garments/types/footwear.py`; `garment_audit.py` is under `tools/`. An
  agent sent to a name that is not there rewrites something else.
- **The in-repo cultures module imports the scratch folder.** `tools/garments/cultures/__init__.py` puts the brain
  scratch path on `sys.path` and imports `build_inspired_outfits` and `build_batch2_outfits` from it. The migration
  (Phase 0.4) is not optional cleanup: the repo's own builder tree does not run without that folder.
- **Migration changes the outfits.** Stripping the thirteen vendored copies rebuilds about half the kit on code
  that differs from what built it. Do it as one commit with a before/after shot sheet of every outfit it touches,
  and expect the owner to see differences.
- **"Checks" are two different things.** Checks 1 to 4 and 8 are builder and skinning behaviour (the trunk-only
  raycast, the crotch clamp, the cowl blend, row order, the cylindrical sleeve skin): turning those into assertions
  deletes the fix. Only the geometry-moving parts (Rules A, B, C, Check 9's clamp, the proposed 11) become
  builder-side, role-dispatched behaviour, and the measuring parts become assertions.
- **Check 7's rigid override has a reason** (pouches sheared across joints). Replace it with one weight vector per
  accessory, copied from the trunk vertex nearest its centre: rigid within itself, attached to the tunic's joints.
- **The 8 to 85 mm anchors are a hypothesis, not a finding.** Before "re-anchoring", decide which side is wrong:
  if the settle moved the vertices, re-running `cloth_bones` on the current GLB recomputes the inverse binds; moving
  `pts` would be the wrong fix.
- **Hashes in kit entries are redundant.** `build-manifest.json` already carries a sha1 per piece; hashes in
  `kit.json` would churn `KCHAR_DATA` in the page on every rebuild.
- **The sweep.** `garment_audit.py --check` runs the 66 baseline outfits; `peoples.json` now has 133, and the seven
  fixture models are not among the baseline. A shared fix (shader, `covered()`, a core rule) needs the full
  baseline at both height ends, with the baseline extended to the batch outfits; the seven are the spot check.
- **Order within Phase 2.** Build the welded shoulder ring before deleting Rule A, and the role-based belt
  conformance before deleting Rule B, each with its shot; deleting first reopens Dax's armpits and the sashes.
- **Missing gates.** `verify.py --assert`, the Godot test (`kchar_test.gd`), and the live-lab patch step (the
  owner sees v75/v55, not `dist/`) are not in the plan; a fix the owner cannot see is not done.
- **Keep the exclusion list out of the gate.** Skip a missing GLB only when the manifest marks it local-only, not
  by naming `mod_head_coyote` and `mod_head_frog`.

## 6. What landed on 2026-11-06 (Phase 0, first pass)

- The checkpoint commit, then Tzintzun's six Meshy weapons (`tools/import_props.py`, with a prop per hand in the
  Cosmetic Lab's record), then the guards:
- `make_mpfb.write_kit` is the one writer of every kit (LF, one indent); every entry carries `made_by` (`mpfb`,
  `mods`, `garments`; `make_mpfb.py made_by` marked the existing ones). `make_mpfb.py` keeps `garments` entries and
  their pieces through a whole or merged Blender build, and `mpfb_build.py` does not export them, unless
  `--force-replace id,id` says so.
- `tests/check_kit.py` (the integrity gate) and `tools/check_twin.py` (the shader twin, by uniforms and the multiset of
  literals, held to `tests/twin-baseline.json`) run from `build.py`; `verify.py --assert` checks the lab's sections
  against `tests/ui-inventory.json` (`--ui-baseline` rewrites it).
- The gate found eleven faults: ten legacy garments' chains rebound in place (`make_mpfb.py anchors`), the giant's
  chief4 allowed by name (`tests/kit-known-bad.json`, KNOWN_ISSUES.md).
- The Godot push shader took the page's changes (the capsule skips, the tier and crotch fades, the chainless turn's
  fade, the page's ray-against-circle hull on every loose garment, the squeeze's factors); the twin gap went from 85
  literals to 25, all structural. Godot's character test runs with its one known failure (the giant on the ladder).
  Not yet compared by eye between the two runtimes.
- The ten scratch builders are in `tools/garments/cultures/` with their paths relative to the file; the package
  imports in 2.5 s with 17 cultures and 46 builders. The thirteen vendored copies are still in them: stripping them
  rebuilds half the kit and wants the before/after sheet and the owner's eye (section 5).
- Not done: the `Part.role` refactor and the non-mutating checks (Phase 0.5), and every Phase 1 and 2 fix.
- **The verifier's court-skirt failure, chased (2026-11-06, later).** `verify.py --assert` failed on the current page and
  on the checkpoint's alike with the Chichani court skirt's chains "inside a thigh" in a walk (16 points on the woman,
  115 on the man), and the round-5 page passed. Toggled on the page (`cloth_probe.py`: the wind off, the dynamics off,
  the torso off): the wind and the torso change nothing; measured against the thigh's *tapered* radius (colliders
  `ra..rb`, which `collide()` has kept the points at, plus 1.5 cm, since the session's change to `rLimb`) the count is
  2 point-frames at 1 mm on the man and 4 at 4 mm on the woman; against the old median radius it is 144 and 42, worst
  2.2 cm. So the chains are not in the leg: the check measured against the median cylinder the solver had stopped
  using. The check now takes the tapered radius. Whether the tighter knee reads well is the audit's call
  (`garment_audit.py --match chichani`), not the verifier's.
- **The audit's call, and the real regression under it.** `garment_audit.py --match chichani --check` against the
  round-5 baseline: the woman's court gown "under" in motion 480 to 2570, the peasant skirt 1471 to 2071, and the
  trade skirt showing skin in a run, 0 to 4887 px (the trailing shin and sandal out through the skirt's back). Not
  the hide masks (the old masks put back: the same numbers), not the solver (Gemini's solver under the round-5
  shader side brings the gown to 21): the shader side. Of its changes, two together are the cause and the fix: the
  legs' capsules were held at full strength in a stride beside the hull (`1 - ceo` where it was `1 - kcM`), and the
  hull's fourth point moved from the ankle to 0.8 of the shin. With both back (`1 - max(kcM, ceo)`, the point at the
  ankle) every gated Chichani row is at or under the baseline on the woman, and "inside" falls on all three outfits
  (noble 15902 to 10972); the ungated "hole" count on the gown rises (741 to 1091). The round-5 hull block whole, the
  pad term alone and the ankle point alone each fix one fault and worsen another (the variants: `cosmetic-v-*.html`
  were the pages, the counts are in the commit). The same two lines are in the Godot twin.
- **Open, and a tool fault found on the way.** The trade skirt's shin in a run is bistable: 0, 774 and 5473 px in
  three audits of the same build (woman only twice, both bodies once), and the man's court robe shows 798 px of the
  same at its hem on the two-body sweep. So `garment_audit.py` is not "the same every run" for a fault that hangs on
  the chains' state from the outfit before: give it a full cloth reset per outfit (`clothStep()` with no dt, then a
  settle from rest) before trusting a skin count under 1000 px. The shin itself is Phase 1's hull work.
- **Repeatability of the audit, chased (2026-11-08).** Done: the made-up breeze on the page's clock is gone from
  `clothStep`; `fig.clothReset()` (chains at their rigid rest, the clock and the step accumulator at zero) runs before
  every shot in `garment_audit.py` and `shots.py`; every audit record carries a hash of the chains' state (`cloth`),
  so two sweeps can be told apart in their records, not only in their pixels. Measured: within one process, a shot
  stepped twice is bit-identical for every clip (the no-clip rest alone carries 17 cm from the shot before: a
  separate fault). Across processes on the GPU backend (`AUDIT_GL=d3d11`) the chains still diverge: with the frame
  loop stopped, every dumped input equal (rests, targets, lengths, rings, colliders, bones and push uniforms at
  every update), one point's previous-position buffer differs after the first substep and the ring and layering
  spread it; switching off collision, layering, the ring and the vertical ordering each leaves the spread; the JIT
  off (`--js-flags=--jitless`) makes the first update agree but not the sixtieth; two software-rendered processes
  agree exactly. So something the Verlet core reads differs between GPU-backed processes over the updates and is
  not in the dump. Next: an instrumented build that writes every chain point after every substep in two processes
  and names the first operation that differs (`tools/cloth_probe.py` and the session's `det_probe.py` are the
  harness). Until then a skin count under about a thousand pixels on the GPU is not evidence, and the baseline's
  `--check` should be read on "under" and "inside", which were stable in every run here.
- **Found and fixed (2026-11-08, later).** A trace of every chain point after every stage of every substep in three
  processes put the first difference in the length-keeping stage of the first substep, one ulp in a third of the
  numbers, from a Verlet stage that agreed exactly; a full-precision dump then showed the chains' rests and lengths
  themselves a few ulps apart between processes while the garment's vertices and targets agreed. `posedRests` puts
  the skeleton in its bind pose and postures it, but reset only the rotations: the hips' position stayed where the
  clip playing at dressing had them, different on every page load, and the parent frame the rest is taken back
  into cancels that translation exactly on paper and not in floating point. Now the hips sit at their rest with the
  morph alone for the measurement (both runtimes). Three GPU processes agree to the last digit; two cold audits of
  the trade outfit are identical in all 28 shots. The trade skirt's shin in a run is a stable 2740 px on this build:
  a real fault for Phase 1's hull work, no longer noise. (The no-clip rest shot still carries chain state between
  shots, since `update` returns before the cloth pass without a clip; its pixels are the rigid rest either way.)
- **Phase 1, first fix (2026-11-08).** With the audit repeatable, five one-line hull variants on the trade outfit in a
  minute each: a point's reach round its bearing 6 cm wider than its padded circle took the run's shin from 2740 px
  to 0 and the underskirt from 4846 to 4022; more standoff also cleared the shin but cost "under"; the hull reaching
  higher, a longer height fade and a lower hem gate did nothing for it. Applied in both runtimes: the whole Chichani
  set on both bodies has no baseline outfit worse, no skin anywhere but 11 px on the man's trade outfit, holes as
  before. Still Phase 1: the capsule squeeze to the seat (issue 1), the shin heading (8.1), the lip constraint (12).
- **The "thirteen vendored copies", measured (2026-11-08).** Eleven are wrappers that call the package (`bio.assemble_garment`
  with the parts flattened, `bio.sleeve`, `bio.torso_tube` with a yoke option): a core fix reaches them. Four are real
  divergences: `build_inspired_outfits.torso_tube` (an older reimplementation, 57 lines, called 44 times), the
  `torso_tube` and `sleeve` of `build_true_heir_bodyguards` (19 and 15 lines), and `build_yuni_military.sleeve` (its own,
  with a 9.5 cm shoulder reach and no ease or flare cap: issue 4's "bypass"). Stripping them changes those builders'
  outfits (44, 3 + 8 and 7 calls), which still wants the before/after sheet; the other nine files need nothing.
- **Phase 1, measured on the whole baseline (2026-11-08, later).** `garment_audit.py --known` sweeps the 66 baseline
  outfits (`peoples.json` has 220 now); one sweep at a time, the records deduped by shot where a sweep resumed. The
  trouser squeeze extended to the seat's capsules changes nothing measurable (skin, under and hole identical to the
  reference, inside within 0.1 %): not applied. The reference build itself against the round-4 baseline is worse on
  "under" for several non-Chichani outfits, in motion (the Izani peasant 0 to 3616 px, the Republic noble 0 to 2752,
  the Yuni peasant 10 to 1731) and at rest (the Izani noble 586 to 5278, the Dalab trade 0 to 2122, the Hykkousoi
  trade 216 to 2148): the Chichani-only runs could not see this. "Under" at rest points at the hull applying at rest
  to chained garments (round 5 gated it by the stride); a gated variant is queued behind the heading and lip sweeps.
- **Issue 8.1's fix, rejected by measurement.** The chains' heading eased from the hips' to the feet's below the knee
  (`rigidTargets`): on the 66, "under" up 5 % and "inside" up 7.5 %, 31 outfits worse (the Izani noble's "under" 7031 to
  13408 px, the Chichani noble's "inside" 17416 to 23368) against 8 better. Turning the lower rows toward the feet folds
  a robe's hem against its own upper rows more than it spares the shins; not applied. The shin pinch of issue 8 wants
  its own shot first.
- **Issue 12's lip constraint, measured: mixed, the owner's call.** An open part's two lips held to 1.2 x their rest
  distance: on the 66, skin down 12 % (the Izani noble woman's open coat, 1912 px of skin at its seam, to none; the
  Izani trade "under" 4761 to 3263 and 322 to 0) and the Free Giant chief's "inside" 68277 to 55142; against that six
  outfits worse, the Beast Rider peasant man's "under" 4541 to 7523 and the Chichani noble man's "inside" 17416 to
  22711 (lips held together fold some open parts over themselves). Not applied by count; the page copy
  `dist/cosmetic-p1-lip.html` and `apply_p1.py lip` are there for a shot sheet of those ten outfits when the GPU is free.
- **The stride gate on the hull, rejected by measurement.** The hull on garments with chains gated by the stride again
  (`ew *= max(kcM, ceo)`, as round 5 had it), to test whether the hull applying at rest explains the whole-set "under"
  regressions against the round-4 baseline: on the 66, "under" up 3.3 % and "inside" up 3.6 %, 18 outfits worse (the
  Hykkousoi trade man's "under" 7059 to 11517 px, the Beast Rider trade man's 1515 to 5856, the Republic festival
  noble's 1896 to 5259) against 7 better (the Izani noble man's "under" 7031 to 1906, the Dalab trade 2626 to 504, the
  Dalab noble 2012 to 30). The at-rest hull is not the one cause: it helps the Izani and Dalab tops and hurts the
  Hykkousoi, Beast Rider and Republic ones. Not applied. The "under" regressions against the baseline (the Izani
  peasant 0 to 3616 in motion, the Beast Rider trade 55 to 4341 at rest) want their own bisection over the round-5
  commits, outfit by outfit, with the page copies the sweeps used.
- **The bisection, first two steps (2026-11-09).** Pages assembled from a commit's `src/` and `data/` (pieces shared
  from the current build; the assembler reproduces the committed page byte for byte), swept with today's audit on the
  66. The baseline commit's own page (644bea198) reproduces the stored baseline ("under" in motion 64889 to 59529 px,
  at rest 14519 to 13455): the audit's method is not the cause. Gemini's checkpoint (dd244ac22) is the step: against
  the baseline commit, "under" 186660 to 315755 px (+69 %), "inside" 806234 to 971226 (+20 %), skin 15064 to 24785,
  113 outfit-class rows worse (the Yuni peasants' "under" 0 to 53652 and 0 to 34425, the Beast Rider noble man's
  "inside" 27009 to 61589, the Free Giant warrior's 12565 to 30804) against 47 better (the Dalab nobles' "inside"
  56785 to 20252 and 37978 to 15388, the Chichani trade's "under" 7418 to 1827). The commits after it recover part
  ("under" 315755 to 271462, "inside" to 796283). Next: the checkpoint's code with the baseline's data, and the reverse,
  to tell the shader and chain code from the rewritten kits.
- **The regression split by outfit.** Nine of the 66 outfits changed their garments at the checkpoint (`peoples.json`):
  the six Yuni outfits wear Gemini's new pieces (bush shirt, duster, trousers, boots, akubra) in place of the boubous,
  wrappers and sandals, the Dalab nobles gained a type, the Xanadu town woman a cap. The Yuni's new garments alone
  carry "under" from 1235 to 95269 px (the trousers under the bush shirt and duster: a hide mask, not a push) and
  "inside" from 33139 to 68519: new garments' defects, not a regression of old ones, and they are the whole of the
  set-wide "under" rise. Over the other 60 outfits the current build is better than the baseline commit on "under"
  (185425 to 176574) and "inside" (773095 to 726040), level on skin, and worse on "hole" (66661 to 78275); the
  checkpoint had put them to 220486 / 902707 / 23646 skin, and the commits after it brought them back. What stays worse
  on unchanged garments: the Beast Rider nobles' "inside" (man 27009 to 54974, woman 25290 to 40520), the Hykkousoi
  nobles' (10240 to 28846, 15191 to 27327), the Hykkousoi trade woman's "under" (2199 to 12527), the Free Giant chief's
  "inside" (56723 to 68277). The checkpoint also rewrote 82 existing kit entries' hide masks (`hide`, `hides`); the
  code-against-data sweeps say which side those belong to.
- **The code, not the kits.** The checkpoint's code on the baseline commit's kits reproduces every outfit that stays
  worse (the Beast Rider noble man's "inside" 27009 to 61676, with the checkpoint's kits 61589; the Hykkousoi trade
  woman's "under" 2199 to 17052, with the kits 18112; the Free Giant warrior's "inside" 12565 to 30804 either way).
  Over the 60 unchanged outfits the code alone takes "under" 185425 to 222117 and "inside" 773095 to 960714; the
  rewritten hide masks move "hole" (68654 to 81484) and little else. The checkpoint's `50-figure.js` diff is 55 hunks;
  next, two page copies from the baseline's page with hunk groups applied (`hunks_at.py`, which rebuilds the
  checkpoint's fragment exactly from all 55): the chain code (placeChains, clothStep, collide, rigidTargets, footFace,
  afterClip: hunks 13-35, 53-55) and the push shader with its uniforms (hunks 1, 7-8, 36-52).
- **The reverse split confirms it.** The baseline's code on the checkpoint's kits is better than the baseline commit
  on the 60 unchanged outfits (skin 14011 to 7651 px, "inside" 773095 to 716874, "under" level at 183040): Gemini's
  rewritten hide masks are a gain, except the Hykkousoi trade pair's "hole" (169 to 6930 and 352 to 6616: a mask that
  hides too much) and the Beast Rider trade woman's "under" (344 to 2692). The Yuni's new garments carry their own
  "under" (1235 to 94701) on either code. So every regression on an unchanged garment is in the checkpoint's
  `50-figure.js`, and the hide masks owe two fixes of their own (the Hykkousoi trade's hole, the Yuni trousers).
- **The chain code carries most of it.** The checkpoint's chain hunks alone (placeChains, clothStep, collide,
  rigidTargets, footFace, afterClip) on the baseline's page take the 60 unchanged outfits' "inside" from 773095 to
  916275 px of the whole code's 960714, and "under" 185425 to 197777 of 222117: the Hykkousoi nobles' doubling is all
  theirs (10240 to 21979, 15191 to 27957), the Free Giant chief's (56723 to 78232) and half the Beast Rider noble
  man's (27009 to 42623 of 61676). The Hykkousoi trade woman's "under" (2199 to 2599 of 17052), the Beast Rider
  peasant's and the Free Giant warrior's "inside" wait on the shader half. Next, the chain hunks in three: the row
  clamp with the second collide pass and the ring constraint (hunk 26), the capsules and collide (19-21, 27-34), the
  rest (upCrest, the layer sort, the heading span, the breeze, footFace, the step order).
- **The shader half does not stand alone.** The checkpoint's shader hunks on the baseline's chain code put "inside"
  at 2039096 px on the 60 (the Republic festival peasant woman 9743 to 118615, the Order novice 2679 to 100347) and
  "hole" at 133490: the shader's new terms (the layered pad `l0`, `cflap`, `cloose`, the hull at rest, the capsule
  tiers) were written against the checkpoint's chain code and are wrong without it, so the two halves are not
  additive and the shader's own share cannot be read this way. What the shader alone does show is the gains the
  checkpoint made: the Free Giants' and the Dalab noble's "under" (10441 to 699, 5121 to 18) and the Dalab noble's
  skin (4624 to 0). The chain hunks stand on their own (b1j had no such blow-up), so the three-way split of the chain
  code goes ahead; the shader is bisected after, on top of the whole chain code.
- **The chain code in three, two measured.** The row clamp with its second collide pass and the ring constraint
  (hunk 26) alone: "inside" 773095 to 840048 on the 60, almost all of it the Dalab noble woman (37978 to 77767) and
  the giants (the chief 56723 to 66754), against the chief's "under" 10441 to 4223 and the Dalab noble's 5121 to 1770.
  The capsules and collide (hunks 19-21, 27-34) alone: "inside" to 836182 and "under" 185425 to 213819 (the Izani
  trade man's "inside" 33366 to 42381, the Republic noble woman's "under" 4306 to 10238, the Chichani trade woman's
  2240 to 7901), against the Chichani noble man's "inside" 21867 to 17539. Neither moves the Hykkousoi nobles or the
  Beast Rider nobles, whose "inside" doubling is the chain code's largest item: it is in the third group (upCrest, the
  layer sort, the heading span, the breeze, footFace, the step order), sweeping now and split six ways after.
- **The third group confirmed.** Those hunks alone (13-18, 22-25, 35, 53-55) take the Beast Rider nobles' "inside"
  27009 to 39614 and 25290 to 36080, the Hykkousoi nobles' 15191 to 25142 and 10240 to 17633, the Izani noble man's
  21821 to 37425 and the Republic noble woman's "under" 4306 to 10582; on the 60, "inside" 773095 to 837401, "under"
  185425 to 200685, skin down (14011 to 12491). Split six ways, one sweep each: the layer sort of the items (18), the
  heading span (16-17), upCrest (14, 15, 24, 25, 35), the breeze (22-23), the step order (55), SLOT_RANK with footFace
  and the toes (13, 53, 54).
- **Found: the heading span (hunks 16-17, `rigidTargets`).** In the baseline a chain row's share of its root's rigid
  offset fell from 1 at the root to 0 at the hips (`fk = (p.y - hy) / (y0 - hy)`); the checkpoint widened the span to
  `max(y0 - hy, 3.5 x |off|)`, so when the root is carried far from its rest, the rows below the hips carry the
  offset too, and a robe's lower rows are swept through the legs. Those two hunks alone on the baseline's page give the
  whole group's "inside" (841219 of 837401 on the 60) and every noble doubling (the Beast Rider noble man 27009 to
  42100, the woman 25290 to 37343, the Hykkousoi noble man 15191 to 23613, the Izani noble man 21821 to 35132, the
  Republic festival noble woman 17791 to 29238), with two gains (the Dalab noble woman's "inside" 37978 to 28196, the
  Free Giant chief's "under" 10441 to 5852). The layer sort alone (hunk 18) changes nothing (773095 to 773696). Next:
  the current page with the baseline's formula restored, measured against the reference sweep.
- **Two more of the six, null.** upCrest (hunks 14, 15, 24, 25, 35) alone changes nothing on the 60 (773095 to
  772687). The breeze (22-23) alone is noise either way (the Republic noble woman's "under" 4306 to 8964, the Beast
  Rider peasant man's 4006 to 1527): it is already gone from the current build. The step order and SLOT_RANK with
  footFace are still to come, then the restored span on the current page.
- **The last two of the six, null.** The step order (hunk 55: the cloth stepped after the tail and jaw) changes
  nothing (773095 to 772944). SLOT_RANK with footFace and the toes (13, 53, 54) is small and mixed (the Republic
  festival trade woman's "under" 6960 to 9027 against the Hykkousoi trade man's 8660 to 6674). So of the checkpoint's
  chain code, the heading span is the one regression that matters; the row clamp and the collide changes are the two
  smaller, mixed ones (hunks 26 and 19-21, 27-34, each a few per cent on "inside" or "under").
- **The span restored on the current build, measured and applied (2026-11-09).** The current page with the
  baseline's fade (to the hips, whatever the offset's size), against the reference sweep on the 66: "inside" 796283 to
  703894 px (-12 %), "under" 271462 to 257655 (-5 %), "hole" level, skin 15218 to 17553 (+15 %, spread over small
  rows: the Chichani noble woman 0 to 2402 is the largest). Every noble is back at its baseline figure: the Beast Rider
  noble man's "inside" 54974 to 27038 (baseline 27009), the woman's 40520 to 22646, the Hykkousoi nobles' 28846 to 10920
  and 27327 to 12155, the Izani noble man's 19004 to 10773, the Chichani noble man's 17416 to 11025; the Izani trade
  woman's "under" 4761 to 0, the Free Giant warrior's 4622 to 406. Worse: the Free Giant warrior's "inside" 13543 to
  19861, the Order monk's 4287 to 8714, the Beast Rider peasant man's "under" 4541 to 7621, the Republic noble woman's
  2211 to 5263. Over the 60 unchanged outfits the build now stands at "inside" 633651 against the round-4 baseline
  commit's 773095 and "under" 162767 against 185425. Applied in both runtimes (`rigidTargets`, `kchar_figure.gd`).
- **The two kit fixes the bisection owed (2026-11-09).** The Hykkousoi trade greaves' hide masks were not the rays'
  rule's: the checkpoint's new greaves GLBs came with masks of 4430 and 4464 triangles where `covered()` at its
  defaults gives 1862 and 2782 (the man's is the baseline's number), hiding shin skin the greaves do not cover.
  Rederived through `write_kit`: "hole" 6704 to 352 px on the man, 6980 to 169 on the woman (the baseline's 352 and
  169), nothing else moved. The Yuni trousers showed their boots through the trouser legs (the audit's "under", class
  feet: the boot shaft's ease, 1.8 to 3.2 cm, exceeded the trousers' cuff ease, 2.6 cm, up the shaft). Two cuff eases in
  `tools/garments/cultures/yuni.py`, rebuilt alone and registered: the stockman trousers straight-leg over the boots
  (cuff ease 3.8 cm), the riding trousers tucked into the gaitered boots (0.6 cm). "Under": the peasant man 53690 to
  6368, the woman 34425 to 1204, the trade man 3874 to 644, the woman 1187 to 777; "inside" up a little on the peasants'
  wider cuffs (3526 to 4264, 2290 to 2978). The pieces are not in Git: the GLBs regenerate from `yuni.py`
  (`tools/garments/build_all.py`), and `build-manifest.json` carries their hashes.
- **Phase 2 groundwork: `Part.role` (2026-11-10).** Every rule in `assemble_garment` (the trunk tubes, Rules A, B and
  C, the footwear fit, the skinning classes, the checks) now reads a part's facts from `part_facts`: its explicit
  `role` and `side`, or, for a part with no role, the same words of its name the rules read before, in one function.
  Proved a no-op first: every culture dry-built into a scratch root before and after (the session's `dry_build.py`
  points `core.ROOT` at the root; `geo_hash.py` hashes every accessor, skin and morph), 276 pieces identical
  (f0c68654e). Then the types set roles (sleeve, leg, trunk, band, belt, collar, drape, pauldron, accessory, trinket,
  sole, foot, shaft, cuff): 32 of 276 pieces change, every one a part whose name had carried a fact by accident, and
  the biggest a finding of its own. **Collars were flared to the shoulders by Rule B.** Rule B clears an overlay
  against the trunk's vertices within 3.8 cm of its height, which at the neck is the shoulder slope: every collar
  named `collar` stood out to 22 to 25 cm at its bottom row (the trooper tunic's rows 0.122, 0.137, 0.165, 0.192,
  0.218 m; the commissar's high collar to 0.246). The role `collar` carries a `neck` fact: Rule B stands it outside the
  trunk's own ring at its height alone (0.116 to 0.135 m, a slight flare), not flat at the neck (0.097, inside the
  coat, where the audit's "inside" rose on the Yuni nobles) and not at the shoulders. The other changes: a bandana no
  longer a strap because its name holds `band`; cravats, hoods, bevors and cowls no longer trunk tubes; canteens,
  compasses and bezels pinned rigid as accoutrements; the chronomonk's kesa a band (pushed and shoulder-clamped as a
  sash, 15 cm); the shoulder yoke and shoulder cape drapes over the coat rather than shoulder caps.
  Two were taken back: `collar_disc` (the Yuni degree hood, the Order's shoulder yokes and the duster's shoulder
  cape) keeps its name facts for now, since as a drape the hood stood open at the back and the audit's "inside" rose
  on the Yuni nobles (18803 to 23779 px on the man); its right treatment is Phase 2's. Thirty pieces change in the
  end, all torso garments: `handoff-shots/roles-sheet-2026-11-10.jpg` is the before/after of every one, front and
  back, `roles-collars-2026-11-10.png` six close-ups. The audit's "inside" rises a little on garments whose collar
  now stands as a ring (the camera looks into it: the Yuni trade duster 17345 to 23853 px) and skin falls to 0 on
  the six Yuni outfits.
- **The vendored copies stripped (2026-11-10).** `build_inspired_outfits.py` defined 25 of the package's functions
  itself (the measurement of 2026-11-08 had counted the wrappers and missed the copies with the same names: its own
  `torso_tube`, `limb_tube`, `smooth_push`, `flap`, `blob`, `horn`, `pauldron`, `collar_disc`, `band`, `head_rings`,
  `hood`, the arm and limb masks, and twelve identical ones). They are imported from the package now (5461 lines to
  5029). Dry-built against the roles build: 71 of 276 pieces change, most by millimetres (the old arm and limb masks
  set different thresholds, so every tube fitted against them shifts), five trunk garments by their row count (the
  core's tube spaces rows by height) and four big robes by up to 17 cm inside the drape (the rustic envoy's gambeson
  174 mm, the hierophant's robe 168, the aedile's agbada 167, the heliarch's mantle 163: the same silhouette from the
  front and back, `handoff-shots/strip-2026-11-10.jpg`). The labs' verify runs with the next commit's rebuild.
- **Issue 13 (2026-11-10): belts, sashes and medallions.** Rule B stood a band off the largest trunk radius within
  3.8 cm of its height plus 12 mm, mid-air on a pleated tunic. A closed band below the shoulders (a belt, sash, obi,
  cummerbund, baldric, swag) now conforms to the trunk at its own height, the tube's ring there or a trunk vertex
  within 1 cm, plus 3 mm, drawn in as well as out; its base vertex (skin weights and morph source) is the trunk's
  under each of its vertices; a small accoutrement of Check 7 (a medallion, a buckle, a button) takes one weight
  vector from the trunk vertex nearest its centre instead of a rigid spine joint. Rings only: the first cut also
  flattened the heliophant's hanging sash tail (17 cm) and the knot, which carry the word. 22 pieces move, their
  bands by 2.5 to 6.4 cm inward (the askari cuirass band 64 mm, the Xanadu penbey band 47, the sibyl's swags 45, the
  axeman's belt 45): `handoff-shots/fix13-2026-11-10.jpg`, the waist from the front and the side.
- **Issue 1 (2026-11-10), the builder half.** A tier that lost its chains to the tier over it (the concentric check)
  kept the body's weights and swung through the chained tier in a stride. `cover_weights` gives such a vertex the
  outer tier's chain weights when it lies inside a layer-1 chained tier between its hem and its top row, faded over
  3.5 cm from 8.5 cm; what is weighted to the legs keeps its own. Nine pieces re-weight, none moves: the pleasure
  caftan, the dredger's robe, the heliophant's mantle, the aedile's agbada, Phil's trousers, the praetorian's lorica,
  the patriarch's robe, the commissar's coat, the cantor's gorget: `handoff-shots/fix1-2026-11-10.jpg`, a walk.
  Blender-built garments take it at their next build.
- **Issue 9 (2026-11-10): motifs on flared skirts.** `paint_strip` painted a part's strip at its mean circumference,
  so a hem band's motif repeated the same number of times on every row, stretched at a flared hem and squeezed at the
  waist. The call passes the part's circumference row by row now and each row of a band is tiled at its own (the
  cell's row resampled across that row's repeats), so a motif keeps its size in metres from waist to hem. Geometry
  identical (138 of 138 pieces); 96 pieces' textures change, every part with a band whose rows differ in girth:
  `handoff-shots/fix9-2026-11-10.jpg`, the hips.
- **Issue 6 measured, not yet asserted (2026-11-10).** The widest radius of each of the 45 head pieces about the
  head's axis (brims included): the patriarch's cap 0.438 m, the magistrate's hat 0.420, the lancer's casque 0.416,
  the dredger's kasa 0.394, the chosen's hat 0.342, the heliophant's crown 0.337, the cataphract's helm 0.320, the
  heliarch's halo 0.311; the median 0.204. A brim or a halo is wide by design, so the assertion wants the crown ring's
  radius (the closed rows at skull height), which these numbers do not separate; the owner's eye on the eight widest
  decides the bound before a build fails on it. Issue 4's half that is a cap went in: `limb_tube` caps an arm tube's
  ease at 2 cm and its flare at 2.8 cm for every caller, not `sleeve()` alone.
- **Issue 5 tried and taken back (2026-11-10).** `covered()` was given a margin at every open edge of the garment,
  scaled by the edge's standoff from the skin (none within 10 mm, the full 3.5 cm from 25 mm). Dry-built, it unhid
  a quarter of the mask on coats and cuirasses (the guild coat 4748 to 3644 triangles, the sibyl's drape 5036 to 3682,
  the praetorian's lorica 4448 to 3402): a garment is many grids, and every grid's edge is "open" by topology, the
  sleeve's top ring inside the shoulder, each band's rows, the hem, so the armholes, waist and hem all shed their
  mask, and the island shaman's arm wrap failed Check 8 (the skirt weights follow the hide). The holes of issue 5
  want an edge that the eye can see past, which topology does not give: a visibility test (the skin's triangles a
  camera round the figure sees through an opening), or the hole patches of the audit mapped back to triangles. Left
  as the opt-in neckline margin it was.
- **A gate that lied, caught (2026-11-10, late).** Every dry build from issue 13 on stopped at the island shaman's
  mantle: its arm wraps carry the word `wrap`, so the belt conform took them for bands, copied trunk weights onto an
  arm part and Check 8 failed the build. The crash came after 135 of 268 pieces, the hash comparison counted only
  the pieces both roots held, and the commits for issues 13, 1 and 9 (6266bfd0c, 35eb45f68, 082edc53d) adopted the
  cultures built before the crash only: Yuni, Yusar, Eternian and the Order were left at the strip's state. Fixed:
  an arm part (`arm` or `arm_tube` fact, or `is_arm`: the wraps are an arm tube by suffix, not an arm word) is never
  a band to issue 13; the sleeve cap of issue 4 applies to arm tubes
  18 cm or longer and never to a pauldron (the first cut moved pauldrons 6 to 9 cm); the dry build now reports
  its piece count against the last complete one. The completion commit rebuilds every culture and adopts every
  piece that differs from the repo's.
- **The baseline audit after the night (2026-11-10).** The 66 baseline outfits on the final page against the sweep
  before the night: the 60 outside the Yuni are unchanged to the pixel class (skin 16414 to 16430, "under" 162767
  both, "inside" 633651 to 633648), as they should be, since they are Blender-built and no builder fix reaches them;
  only the Hykkousoi trade's "hole" moved (the greaves' mask, earlier). The Yuni carry the night: "under" 53690 to
  6327 and 34425 to 586 on the peasants (the trousers), skin to 0 on the man's noble and peasant, "inside" up on the
  trade duster (17254 to 23346, the standing collar seen from above). The 66 cannot measure the night's builder
  fixes: the 84 outfits that wear a changed piece are audited before and after for that (`night_audit.sh` in the
  session scratch; the result is appended below when it lands).
- **The night measured on the outfits it touched (2026-11-10).** The 84 outfits that wear a changed piece, the roles
  build's pieces against the final ones (idle, walk, run, crouch; four views): "inside" 929600 to 828238 px (-11 %),
  "under" 109038 to 96372 (-12 %), skin 171138 to 165559 (-3 %), "hole" 75273 to 73606; 59 outfit-class rows better,
  37 worse. Better: the Beast Rider lancer's "inside" 67664 to 22947, the Izani praetorian's 27527 to 16109, the
  watch's 19928 to 8824, the aedile's 16863 to 8860, the dredger's 14881 to 7104, the Order warden's "under" 5153 to
  25. Worse, each wanting a look: the islander shaman's "inside" 39351 to 80079 and "hole" 1444 to 3348 (the largest
  regression: the strip put his mantle on the core's tube), the Chichani ordinator's "inside" 4093 to 11039, the
  chosen's 16829 to 20684, the Xanadu priest man's 22832 to 26632, the Order cham's "under" 0 to 2344 (a band drawn in
  under its robe).
- **That comparison is withdrawn: the scratch pages lied (2026-11-10, found chasing the regressions).** A scratch
  page took a dry root's GLBs but kept the kit the repo's page embedded (`KCHAR_DATA`: hide masks, cloth chains,
  anchor vertices), and the first version hard-linked the page itself, so it followed every later rebuild. The
  "before" side of the 84-outfit audit therefore drew old pieces with the final kit: on the shaman's mantle the
  chains' anchors indexed a mesh of 2861 vertices with a kit made for 3302. The numbers above (-11 %, -12 %, the five
  regressions) are not evidence either way. The same holds, more mildly, for the night's before/after sheets:
  their geometry is each build's own, their hide masks and chains the repo's of the moment. Not affected: the dry
  build's geometry hashes, the 66-outfit audit and both verifies, which run on the repo's real page. Fixed:
  `scratch_dist.py` now writes each root's kit entries into the page's `KCHAR_DATA` beside its pieces. The audit is
  re-run on a roles page (every culture) against the repo's final page; its result replaces the above.
- **The night measured again, on consistent pages (2026-11-10).** The 84 outfits, a roles page (dry-b4 with dry-b6's
  Yuni and Order, each with its own kit) against the repo's final page: "inside" 874682 to 824007 px (-5.8 %), "under"
  100477 to 98093 (-2.4 %), skin 167660 to 163640 (-2.4 %), "hole" 76757 to 73959 (-3.6 %); 45 rows better, 30 worse.
  Better: the Izani watch's "inside" 18908 to 8824, the Beast Rider lancer's 32496 to 22947, the dredger's 13652 to
  7104, the sibyl's 30408 to 24440, the Yuni sentinel's skin 6068 to 1676, the Order cham's "inside" 20773 to 16820.
  Worse, all smaller than the gains: the Yusar dronemaster's "inside" 2452 to 6798, the Abyssal trade woman's 5813 to
  9846, the Xanadu priest man's 22832 to 26632, the Yuni trade woman's 7971 to 11609, the painted warden's 8849 to
  11971, the heliophant's 9633 to 12266, the commissar's 4159 to 6127, the ordinator's 9178 to 11039. The islander
  shaman and the Order cham, named as regressions by the flawed run, are not: the shaman does not appear and the
  cham improved. Several of the worse rows are coats whose collar stands as a ring now (the dronemaster, the
  commissar, the Yuni trade): the camera sees into the ring, which the audit counts as "inside".
- **The sheets re-shot (2026-11-10, evening).** `scratch_dist.py` pages with each root's own kit: `roles-`, `strip-`,
  `fixes-` and `motifs-2026-11-10.jpg` and nine pairs in `closeups-2026-11-10.jpg` replace the first set (removed).
  The strip changes 53 pieces, not 71. On consistent pages the islander shaman is the same before and after the
  strip to the eye, as the audit said.
