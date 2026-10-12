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

**Farm animals** (cow, ox, pig, sheep, goat, hen, dog, cat): `qmodel.py <animal> <meshy.glb> <out.glb>` is one script (Meshy
text-to-3D standing pose, textured). It decimates in one pass, carries the UVs, splits the body into torso, head (with the neck),
tail and per leg a thigh, shin and foot, overlaps every join with a band of the neighbour's faces so no seam opens, and rigs a
two-bone leg with the foot kept level. The walk is a trot (a hen alternates) with every foot planted while on the ground;
`verify_farm.py <glb>` reads the finished file and reports foot slide and floor penetration. Per-animal cuts live in `CFG`
(the belly line, the head and tail cuts, the stride); `--debug cls.png` plots the classification to tune them. Each animal's four
feet are a little different in height in Meshy's model, so each leg has its own ground. Pack the result with
`models_pack.py ... --truthful-sides` (the rig already names L the animal's left).

