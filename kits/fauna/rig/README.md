# kits/fauna/rig: cutting a Meshy model into animatable parts

The scripts that turned five Meshy models (image-to-3D from the owner's reference art; the dragonfly from text) into the rigged
GLBs `models_pack.py` packs into `models/`. Python with numpy, scipy, trimesh, fast-simplification, Pillow. They read a Meshy
GLB (the filenames inside are the session's: `img_<animal>.glb`, `tex6.glb`, `milli.glb`) and write a GLB with a node per part,
the textures kept and four clips (`flap`, `glide`/`hover`, `perch`, `walk`).

| Script | Does |
|---|---|
| `fcfg.py` | per-animal rules that name each face's part from its centroid (head, neck, torso, wings, legs, feet, tail) |
| `fbuild.py <animal>` | decimate in one pass, carry the UVs over, drop debris, cut into parts (`parts_<animal>.pkl`); the animal settings (`CFG`) |
| `frig.py <animal> <out.glb>` | pivots, overlapped joints (a band of faces duplicated across every wing, shoulder and neck join so no seam opens), two-bone IK walk with planted feet, the clips |
| `milli_build.py`, `dragonfly_parts.py`, `dragonfly_rig.py` | the same for the millipede (17 rings, 34 legs) and the dragonfly (six legs, library wing cards) |
| `verify_*.py` | read the finished GLB and measure foot slide and floor penetration over the walk |

The walk clips are walk-in-place; `extras.speed` in the clip is the root speed that keeps planted feet still. Results of the
checks: no foot slides more than 3% of a stride and no leg goes through the ground (the millipede: 18%, its legs are short).
This is working code from one session, not a tool: paths are the session's, and the thresholds in `fcfg.py` were tuned by eye
per model.

**Families** (`family.py <family>`, `families/<family>.json`): rigged models merged into one file of swappable parts, a species a named pick; `PLAN-MESHY.md` section 11. Specs for these take `pedicel` and `jaw` (a spider) or `swap` (a beetle), and `defur` for hair modelled as spikes. `showcase.py` makes a viewer page.

**Arthropods** (`arthro.py <key> <candidate>`; a raw GLB and `spec.json` in `rig/sources/<key>/`): one script, no per-animal table. A solid voxel model opened by a
ball wider than a leg finds the trunk and the limbs, the trunk parts at its necks, and each leg is cut at its bends along the surface. Each part is decimated on its own
budget and every cut capped, so a part is a closed shell in any pose. It writes `rig-<candidate>.glb` with a tripod walk. It needs `trimesh` and `fast-simplification`. A spec holds `legs`, `contacts` (feet on the ground), `segments`, and when a body needs them `raptorial` (limbs held up, a mantis's), `strip`, `open` and `budget`.
`prep_refs.py` readies the reference views, `fal_gen.py` runs fal's generators, `intake.js` scores a raw GLB and `sheet.py` draws the comparison.

**The steps for a new model** (`../PLAN-MESHY.md`): keep the source in `rig/sources/<key>/` (`source.json`: prompt, task_ids, ai_model,
credits, raw; and the raw GLB), rig it, `models_pack.py`, `node rig/fit_anchors.js`, `python3 rig/patch_models.py`, then
`node tests/test-models.js`, which a new model must clear with no waiver. `--png <dir>` draws where a body opens. The `verify_*.py`
above need the rigged GLB and are not in CI; the test covers their foot slide and floor depth on the packed model.

**Farm animals** (cow, ox, pig, sheep, goat, hen, dog, cat): `qmodel.py <animal> <meshy.glb> <out.glb>` is one script (Meshy
text-to-3D standing pose, textured). It decimates in one pass, carries the UVs, splits the body into torso, head (with the neck),
tail and per leg a thigh, shin and foot, overlaps every join with a band of the neighbour's faces so no seam opens, and rigs a
two-bone leg with the foot kept level. The walk is a trot (a hen alternates) with every foot planted while on the ground;
`verify_farm.py <glb>` reads the finished file and reports foot slide and floor penetration. Per-animal cuts live in `CFG`
(the belly line, the head and tail cuts, the stride); `--debug cls.png` plots the classification to tune them. Each animal's four
feet are a little different in height in Meshy's model, so each leg has its own ground. Pack the result with
`models_pack.py ... --truthful-sides` (the rig already names L the animal's left).
The Dalab lizard uses the same script in `sprawl` mode (CFG key `sprawl`): the legs are cut by distance from the body's axis, not height, and the IK has a free three-axis hip plus a knee hinging about the leg-plane normal, so the legs go out sideways and then down while each foot stays planted. The horse's cuts use `head_line` (a slanted neck cut, so the chest and shoulders stay in the torso), `head_box`, `head_dup` and `tailx`.

