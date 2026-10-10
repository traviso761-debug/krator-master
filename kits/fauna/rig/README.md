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
