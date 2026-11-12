# GarmentCode spike (2026-10-16)

Question: can GarmentCode ([maria-korosteleva/GarmentCode](https://github.com/maria-korosteleva/GarmentCode), pip
`pygarment` 2.0.2) make a better-tailored garment for the character kit than the lofted garments of
`tools/make_garments.py`, and can its output take the same MakeHuman-clothes path (MPFB fits, weights and morphs it)?

**Answer: it runs here, and its drape does go through the MHCLO path, but don't adopt it as the garment generator.**
Its patterns are good and its simulator works on the MPFB body, but that simulator's licence is research or
evaluation only (below). What we get at the end is a one-off draped mesh,
8x heavier than a lofted part, that doesn't stay clean at the slider ends: the same things the quality pass is
trying to fix. Use it, at most, as an offline reference. See "What adopting it would change" for the narrow version
that could pay off.

Renders: `garmentcode-spike/`. In every sheet the figures are, left to right: the shipped `voth_m_trade_xicolli`
(tunic, sash, mantle), the lofted xicolli's body tube alone, and the GarmentCode tunic. All three were fitted by MPFB
on fresh humans (male, muscle 0.6, height 0.55) at weight 0.5, 0.0 and 1.0.

| File | What |
|---|---|
| `sheet_neutral.jpg`, `sheet_thin.jpg`, `sheet_heavy.jpg` | front, side, back of the three figures at each weight |
| `close_heavy.jpg`, `close_thin.jpg` | lofted tunic beside the GarmentCode tunic, front and back, at the weight ends |
| `gc_pattern.jpg` | the sewing pattern GarmentCode wrote (front and back panels, each two halves) |
| `gc_drape_front.jpg` | GarmentCode's own render of the drape on the MPFB body (its debug colours, one per panel) |

The GarmentCode tunic renders white: its `.mhmat` texture didn't load in the MAKESKIN material. That's cosmetic and
doesn't affect the shape.

## What was done

1. **Setup.** The machine is Windows 11 with an RTX 5060 Laptop GPU (8 GB, sm_120 Blackwell, driver 13.1). Blender
   isn't installed, there is no CUDA Toolkit and no Visual Studio, and the only Python is 3.14.
   - Python 3.9 (GarmentCode pins it, along with `numpy<2`) via `uv`, in a venv in the session scratchpad.
   - **The Warp fork** ([NvidiaWarp-GarmentCode](https://github.com/maria-korosteleva/NvidiaWarp-GarmentCode), based on
     Warp 1.0.0-beta.6) is meant to be built from source with the CUDA Toolkit and MSVC. That isn't needed. A diff
     against upstream `v1.0.0-beta.6` shows the fork changes only `warp/sim/*` (XPBD self-collision, attachment,
     body-part drag, body push-out), a new `warp/collision/`, and the `mesh_query_edge` builtin (`builtins.py`, `stubs.py`,
     `native/mesh.h`, `native/exports.h`). Kernels are compiled at run time from the package's headers, so this
     works: `pip install warp-lang==1.0.0` (the official wheel), patch those four files, and copy the fork's `sim/`
     and `collision/` over the wheel's. The C API changed between beta.6 and 1.0.0, so the fork's whole package
     can't go over 1.0.0's DLL; only the simulation layer moves.
   - The wheel's NVRTC is CUDA 11.5, which predates sm_120, but kernels JIT through PTX and run on the 5060. The
     simulator also falls back to CPU on its own.
   - On Windows, `git clone` of either Warp repo needs `core.longpaths=true` (the cutlass docs go over 260
     characters), or the checkout silently stops halfway.
   - **Blender 4.5.14 portable** with MPFB 2.0.18 and the MakeHuman system assets (CC0), in a short temp path
     (`%TEMP%\gcspike`). Blender's Python can't read files under the session scratchpad's long path, even with
     LongPathsEnabled.
   - Setup cost, once you know the above: about an hour. The first simulation compiles kernels (~45 s, cached
     after that). The stock shirt on GarmentCode's mean body takes 65 s; our tunic on the MPFB body, 22 s (406 frames).
2. **Body.** GarmentCode reads a body as three files: an OBJ (metres, Y up, front +Z), a measurement YAML (26 values,
   cm), and a vertex segmentation (`body`, `left_arm`, `right_arm`, `left_leg`, `right_leg`, `face_internal`).
   **Custom bodies are supported, not only its SMPL ones.** The MPFB male neutral body (the same macros as
   `make_garments.py`, helpers masked, A-pose, arms 49 degrees below horizontal) was exported with:
   - the segmentation taken from the Mixamo weights;
   - height, waist (76 cm), hips (97), chest (98), waist line, hips line, bust line, shoulder width, arm length and
     arm angle measured off the mesh;
   - the remaining 13 values scaled from GarmentCode's `mean_male`.

   It drapes with 0 body-cloth intersections and no self-intersection. The only licence catch is the SMPL bodies
   (CC BY 4.0, and SMPL's own terms for others), which we don't need.
3. **Design.** GarmentCode's `Shirt`: sleeveless, round neck, length 2.0 x `waist_line` (hem at mid-thigh like the
   lofted xicolli), width 1.1 x chest, hem flare 1.3. It's a few lines of design parameters, not code. A new
   *garment type* (a wrap, a mantle, a xicolli's open sides) would be a new GarmentCode program: Python panels,
   edges and stitches, on the order of the 100-400 lines of each file in `assets/garment_programs/`.
4. **Into MPFB.** The draped OBJ (cm, GarmentCode frame) was converted to Blender's frame. Vertices below
   `CROTCH + 0.02` were put in `helper-skirt` and the rest in `body`, as `torso_tube(group_below=...)` does.
   `ClothesService.mesh_is_valid_as_clothes` passed every check, and `create_mhclo_from_clothes_matching` wrote
   the `.mhclo` (no delete group, like the lofted tunics). `HumanService.add_mhclo_asset` then fits it to any body.
   So **yes, a GarmentCode drape can go through the same path** and would get `mpfb_build.py`'s weights and morph
   deltas like any item.

## What the renders show

- **Tailoring at neutral:** GarmentCode is better. It reads as a sewn garment: a real scoop neckline and armholes,
  shoulder seams on the shoulder line, cloth that falls from the chest and shoulder blades, and an even A-line hem.
  The lofted tube is a sheath: rings at a fixed ease, faceted (1,400 vertices, flat shading), with a boxy shoulder.
- **At the slider ends it is worse.**
  - *A step at the group boundary.* There's a crease right round the body at `CROTCH + 0.02`, where vertices switch
    from matching the body to matching the skirt helper. The lofted tube's rows are evenly spaced along that line,
    so its step hides; the drape's dense, irregular triangles show it (`close_heavy.jpg`, `close_thin.jpg`, front and
    back).
  - *The groin through the cloth.* At weight 0.0 and 1.0 the genitals push through the front, at the same
    boundary. At neutral the drape stands 2-3 cm off the front hips (median 3.3 cm to the nearest body vertex), so
    this isn't a tight drape. It's how the vertices either side of the boundary are matched (body triangles above,
    skirt-helper triangles below) and how those move apart at the slider ends; the cause wasn't isolated further.
    The lofted tube, matched the same way, doesn't show it: its row at the boundary is a convex hull spanning the
    hollow. This is pitfalls section 3 again ("skin through a garment at one body size only").
  - *Baked-in wrinkles.* The drape keeps the simulation's high-frequency crumple. That looks right on one body at
    rest, but it morphs along with everything else and is wrong as soon as the body changes or moves.
- **Cost in the kit:** 11,737 vertices and 23,170 triangles against 1,400 vertices for the lofted tube. Every
  vertex carries a morph delta per slider end in `morphs.npz`. The drape would need decimation, losing the detail
  that makes it look better, or a retopology onto a grid.
- **Cloth chains:** `cloth_spec` picks chains from the lofted grid's columns and rows (`part offset + row * cols +
  col`). A simulated triangle mesh has no rows or columns, so chains, `layer`, `stiff` and the push shell would need
  a new way to pick anchor vertices.
- **Texture:** GarmentCode's UVs are per panel, laid out flat. They suit a fabric repeat, but not
  `paint_strip`'s bands, which run along a part's length (hem bands, frets). Bands would have to be painted per
  panel, along the panel's bottom edge.

## Licence and GPU

- GarmentCode and pygarment are MIT.
- **The simulator is not.** The Warp fork, and the official warp-lang 1.0.0 wheel the overlay uses, are under the
  *NVIDIA Source Code License for Warp*. Its section 3.3 says the work and derivatives "only may be used ...
  non-commercially", meaning "for research or evaluation purposes only". This spike is evaluation. Using its drapes
  to build a game's assets would need either NVIDIA's terms checked by the owner, or the fork's simulation layer
  ported onto a later Warp release under Apache 2.0 (Warp moved to Apache 2.0 in 2025, 1.6 or so; the port is the
  `sim/` and `collision/` files and one builtin, but onto an API that has moved a long way since 1.0). Nothing of
  either would ship in a page; only the meshes would.
- The SMPL body models are restricted (CC BY 4.0 plus SMPL's own terms), and we don't use them.
- GPU: any CUDA GPU through Warp, including this Blackwell laptop card with the overlay above. There's a CPU
  fallback too (not timed here). The cloud sessions' Linux boxes have no GPU, so they would run on CPU or not at
  all. A build step that needs a CUDA machine would be a new dependency for `make_garments.py`, which today needs
  only Blender.

## Recommendation

Don't replace the lofted parts with GarmentCode drapes. Clipping across sliders is what this pass is about, and
there the drape is worse than what we have. The simulator's licence rules out using it in production as it stands.
It would also bring a GPU, a patched Warp and Python 3.9 into the
garment build, plus a new way to pick cloth chains and paint bands.

What is worth taking, cheaply, without adopting the tool:

1. **Its pattern shapes as the lofted parts' cross-sections.** A front and a back panel with a scoop neck, an
   armhole curve and a shoulder slope is what makes GarmentCode's tunic read as tailored. `torso_tube` could take a
   neckline depth and an armhole cut (open the ring between front and back above the armpit, as the four-armed holes
   already do) instead of a ring closed to the neck. That's a change inside `make_garments.py`'s `torso_tube` and
   `build()`, not a new dependency.
2. **GarmentCode as an offline reference.** For a new garment type, drape it once on the MPFB neutral body (the
   scripts below make that an afternoon) and compare it with the lofted version, then tune ease and flare by the
   numbers. A reference, not a source.

If the owner wants to go further later, the version that could pay off: drape at neutral, then **project the drape
onto a lofted part's grid** (each grid vertex snapped to the drape along its ray). Rows and columns stay, so the
chains, bands, groups and vertex count stay as they are, and the hang of the cloth comes from the simulation. Clip
safety still comes from the lofted ease (clamp the projection to `ease >= 12 mm`). That is the one way the
simulator improves the kit without breaking what works; it's a separate task.

## What adopting it would change in `make_garments.py` (if done anyway)

- A pre-step outside Blender: Python 3.9 with pygarment and the patched Warp on a CUDA machine. It exports the
  MPFB body (OBJ, YAML, segmentation) per body and per sex, runs the GarmentCode programs, and writes the drapes.
- In `make_garments.py`, a new part kind that loads a drape. Vertex groups would come from height (as here), plus
  normal orientation, decimation or a grid projection, and UV-based paint in place of `paint_strip`'s bands.
- `cloth_spec` would need chain anchors picked off a triangle mesh, and the push shell (`loose`, `layer`) would need
  rechecking against the drape's uneven gap to the body.
- The kit's vertex and morph budget would grow about 8x per draped part, unless decimated.

## Reproducing

The scripts are in the session's shared notes folder (outside the repo; ask for them if they're gone):
- `mpfb_body.py`: Blender. Exports the MPFB body for GarmentCode.
- `gc_tunic.py`: Python 3.9, run from the GarmentCode root with `system.json`'s `bodies_default_path` set to the
  exported body. Designs and drapes the tunic. Wrap it in `if __name__ == '__main__':` on Windows: the simulator
  starts a worker process that re-imports the script, so unguarded it runs twice.
- `spike_fit.py`: Blender. Runs `make_garments.py` unchanged, with one injected garment, then makes the MHCLO and
  renders.
- `spike_close.py`: Blender. The close-ups.

Nothing in `make_garments.py` or any built page was changed.
