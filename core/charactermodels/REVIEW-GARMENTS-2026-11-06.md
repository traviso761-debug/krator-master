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
