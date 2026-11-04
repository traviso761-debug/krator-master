# NPU normal-map trial (2026-11-03)

Can a depth model on the NPU make better normal maps than `tools/textures/process.py`'s step 4? That step takes the
luminance minus its wide blur as the height, so dark means low.

**Partly.** The model is much better on built relief: bricks, cobbles, roof tiles, planks. It is also better on flat
surfaces whose colour is not relief (marble, mosaic, tiles), where luminance invents bumps. On fine grain (moss, cloth,
snow, leather) it is worse, because the model sees only shapes and luminance carries the grain. No method wins on every
set. The NPU runs it fast enough to use: 0.12 s per frame, about 1.3 s for a 1024 set (nine frames).

Judge by eye: `built-relief.jpg` (brick, cobble, roof) and `flat-and-grain.jpg` (marble and moss, plus three sets with no
scan: painted metal, a wool rug, trencadis). These are `preview.py` sheets. Each row is one set with one method (`scanned`
is the truth where it exists); the panels are a 3 x 3 colour tiling, one lit tile, and a lit 2 x 2 tiling.

## Model

Depth Anything V2 **Small** (`onnx-community/depth-anything-v2-small`), Apache-2.0: fine for the pipeline. The Base, Large
and Giant weights are CC BY-NC (non-commercial); don't use them. It is converted to OpenVINO IR with a static
1 x 3 x 518 x 518 input. It compiles on the NPU (ViT-S; 33 s the first time).

| | NPU | CPU |
|---|---|---|
| one 518 frame | **0.10 to 0.14 s** | 0.41 s |
| one 1024 set (3 x 3 frames, plus the blend) | ~1.3 to 1.9 s | ~4 to 5 s |

The model's depth is known only up to scale and shift, and a set must tile. So `trial.py` runs it on 518 px windows laid
round the torus (3 x 3 for 1024), standardises each window, and feathers them together. The result tiles. Then the same
high-pass, soften and normal steps as process.py.

## Methods

- `lum`: process.py steps 4 and 5 as they are.
- `model`: the model's depth as the height.
- `blend`: half each, after standardising.
- `split`: the model below a 3 px blur (the shapes), plus half-weight luminance grain above it.

## Score against scanned normals

24 Poly Haven sets in the library (`tools/textures/ingest_polyhaven.py`) carry their **scanned** normal maps: that is the
truth. Measures (`trial.py`, `score()`):
- **cos**: the cosine between the predicted and scanned slope fields. It doesn't depend on strength: 1 is perfect, 0 unrelated, below 0 upside down.
- **deg**: the mean angle to the scanned normal at the best single strength.
- **flat**: the angle error of a flat normal map, for reference.

| set | cos lum | cos model | cos split | deg lum | deg model | deg flat |
|---|---|---|---|---|---|---|
| roof.clay_roof_tiles | 0.19 | **0.72** | 0.40 | 37.5 | **20.7** | 38.5 |
| paving.cobblestone_01 | 0.12 | **0.63** | 0.22 | 11.3 | **8.4** | 11.4 |
| paving.brick_wall_001 | 0.06 | **0.58** | 0.22 | 18.7 | **15.4** | 18.7 |
| wood.wooden_gate | 0.13 | **0.40** | 0.18 | 7.1 | **6.5** | 6.9 |
| rock.marble012 (flat, veined) | 0.01 | 0.00 | 0.01 | 2.05 | **0.38** | 0.32 |
| paving.old_mosaic_floor | 0.18 | 0.07 | 0.19 | 3.75 | **2.79** | 2.77 |
| ground.moss002 | **0.57** | 0.01 | **0.57** | **23.6** | 29.2 | 29.2 |
| cloth.quatrefoil_jacquard | **0.38** | 0.00 | 0.38 | **6.0** | 6.4 | 6.4 |
| ground.snow011 | **0.34** | -0.19 | 0.25 | **9.7** | 10.3 | 10.2 |
| metal.metalplates001 | 0.49 | 0.05 | **0.59** | **2.1** | 2.6 | 2.5 |
| **mean of 24** | 0.100 | 0.081 | **0.125** | 11.46 | **10.46** | |

Per-set numbers for all 24 are in `results.json`. Across the 24:
- Best by cos: `model` on 8, `split` on 7, `lum` on 5, `blend` on 4.
- Worse than `lum` by more than 0.05: `model` on 12, `split` on 1, `blend` on 2.

Notes:
- **Neither method gets near the scans on rough natural stone** (rock_face, sandstone_blocks, palm bark: cos about 0). Their
  relief is real but doesn't show in the colour. Both maps there are about as good as a flat one.
- **On flat, coloured surfaces, `lum` is worse than a flat normal** (marble 2.05 deg against 0.32 for flat; tiles144 and
  old_mosaic_floor likewise). This is the failure the trial was for. The model stays near flat there.
- Two sets read upside down for every method (`hide.leather008` -0.94, `metal.metal_grate_rusty` -0.6 to -0.8). Their
  scanned maps or their colour/height relation may follow another convention. They weren't investigated.

## Recommendation

- **Add `--height model` to process.py as an opt-in, per set.** Use it for built relief (brick, cobble, block, tile, roof,
  plank, gate) and for flat surfaces whose colour is not relief (polished marble, mosaic, painted tiles). Keep `lum` as the
  default for grain (moss, cloth, sand, snow, leather, bark). `split` is the safe middle option for a set that is
  both, or for re-running the library in bulk. It is almost never worse than `lum` and gains a little on average.
- Run it on the NPU with a CPU fallback (4x slower, still a few seconds a set). The weights stay in `%LOCALAPPDATA%/krator-models/`.
- **Done (2026-11-03):** `process.py --height model|split` (or `"height"` in a batch entry's options); the default `lum` is
  byte-identical to before, meta.json included. The model code is `tools/textures/depth.py` (setup in its docstring:
  a venv with openvino, then `depth.py --setup`; `depth.py --check` says which device compiles it). Run process.py
  with that venv's python for these modes. The device is NPU, else CPU; `KRATOR_DEPTH_DEVICE` overrides it, and meta.json
  records it. Test: `python tools/tests/test_process_height.py`.
- Still to do: check the unscanned sets (painted metal, rug, trencadis) by eye; choose which library sets to re-run.

## Reproduce

Same venv as `../npu-cutout/README.md`. Then:

```powershell
$p = "$env:LOCALAPPDATA\krator-models\venv\Scripts\python.exe"
Invoke-WebRequest https://huggingface.co/onnx-community/depth-anything-v2-small/resolve/main/onnx/model.onnx -OutFile "$env:LOCALAPPDATA\krator-models\onnx\depth-anything-v2-small.onnx"
& $p -I -c "import openvino as ov,os; d=os.environ['LOCALAPPDATA']+'/krator-models'; m=ov.convert_model(d+'/onnx/depth-anything-v2-small.onnx'); m.reshape({m.inputs[0].get_any_name():[1,3,518,518]}); ov.save_model(m,d+'/ir/depth-anything-v2-small.xml')"
& $p -I tools/textures/trials/npu-normals/trial.py C:/Users/travi/Documents/krator-master/core/materials/library paving.cobblestone_01,rock.marble012 --device NPU
python tools/textures/preview.py out.jpg "$env:LOCALAPPDATA\krator-models\trial-npu-normals\paving.cobblestone_01\model" ...
```

The library images are in LFS. The trial reads a checkout that has them (the main checkout); this worktree holds pointers.
