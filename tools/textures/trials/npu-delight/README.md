# Baked-lighting trial (2026-11-04)

Can a model take the baked light out of a delivered texture better than `process.py`'s step 2 (delight: divide by a wide
blur of the luminance, then lift the darks)? Step 2 only evens out slow brightness changes. The light that hurts is the
raking light on the relief: dark sides of cobbles, shadows under bricks. Those then double up with the normal map in the game.

**Short answer: partly. The model that helps runs on the NPU, at about 9x the CPU's speed for its main network.**
- Marigold-IID's light estimate, used only as a ratio, beats step 2 on 10 of 12 sets and keeps every detail.
- A light fitted on a *real* normal map removes nearly all of the raking light. The depth model's normals are too weak for it.
- Nothing is wired into `process.py`.

Judge by eye: `compare.jpg`. Rows are six sets; columns are the truth, the baked copy, and each method. Per-set numbers are in
`results.json`.

## The test

The truth is known: 12 Poly Haven sets in the library have a near flat-lit colour map **and** a scanned normal map.
`trial.py` bakes a lit copy of each:
- the colour map times a raking light on the scanned normals (elevation 40 deg, an azimuth hashed from the id, ambient 0.3);
- times a slow +-20% brightness swell.

Each method then has to give back the colour map. Scores, after a per-channel gain (exposure can't be known):
- **rmse:** 0 to 255 against the truth.
- **left:** how much of the baked shading is still in the result. 1 is all of it, 0 none, below 0 overcorrected.

## Methods and licences

| method | what | licence |
|---|---|---|
| `current` | process.py step 2 as it is | ours |
| `shadefit-model` | the raking part of a fitted light divided out, on slopes from the depth model (`tools/textures/depth.py`, NPU) | Apache-2.0 (Depth Anything V2 Small) |
| `shadefit-true` | the same fit on the scanned normals: what the fit can do with good normals | ours |
| `marigold` | Marigold-IID lighting v1-1's albedo (`marigold.py`; 4 steps, 768 px) | CreativeML OpenRAIL++-M: commercial use allowed, with use restrictions. Fine for textures |
| `marigold-ratio` | only Marigold's light: the baked image divided by (its luminance over Marigold's, both blurred 2 px), so its own detail stays | as above |

Ruled out: Careaga and Aksoy's `Intrinsic` (academic use only).

**The fit (`fit_light`):** a raking light darkens the slopes turned away from it and brightens the ones turned toward it.
That effect is *odd* in the slope. Dirt and dark grout in a colour map darken from every side, so they're *even* and drop out
of a least-squares fit of log luminance on the two slope components.

A first version searched whole shading models instead (direction, elevation, ambient). It scored the true light *below* a
wrong, high one, because the grout looks like light from above, and so it removed nothing. Even this fit can't take out the
even part of the shading (slopes darker than flats from every side): it looks the same as dirt.

## Results (12 sets)

| method | mean rmse | mean left | notes |
|---|---|---|---|
| none | 18.8 | 0.99 | |
| `current` | 16.6 | 0.98 | the slow swell goes; the relief light stays |
| `shadefit-model` | 16.5 | 0.83 | the model's slopes explain only 1 to 24% of the image's relief (the scans: 2 to 71%, 47% typical) |
| **`shadefit-true`** | **11.3** | **0.10** | best by far, but needs a real normal map |
| `marigold` | 16.0 | 0.12 | the light goes, but its albedo is smeared: roof tiles to mush, grain gone (see the sheet). Not usable as is |
| **`marigold-ratio`** | **13.7** | 0.82 | beats `current` on 10 of 12 (worse on the brick wall and the gate). The hard shadows weaken visibly and fine detail is the original's. Most of the fine relief light stays |

## Speed

| step | NPU | CPU |
|---|---|---|
| depth model (for `shadefit-model`) | ~1.5 s a set | ~4 s |
| Marigold, whole pipeline, 4 steps at 768 px (PyTorch) | - | 35 s of diffusion, 60 to 85 s with the encoders |
| Marigold UNet, one step (PyTorch) | - | 15.8 s |
| Marigold UNet, one step (OpenVINO) | **1.71 s** | 4.76 s |

## NPU

`unet_npu.py` converts Marigold's UNet (an 865M-parameter network; 16-channel 96 x 96 latent for 768 px) from PyTorch
to OpenVINO IR with a fixed shape, then times one step per device. **It runs on the NPU:**

| device | compile (first time; cached after) | one step | max difference from PyTorch |
|---|---|---|---|
| NPU (fp16) | 393 s | **1.71 s** | 3.4% |
| CPU (OpenVINO) | 237 s | 4.76 s | 0.0% |
| CPU (PyTorch) | - | 15.8 s | - |

So the four steps would take about 7 s on the NPU, against about 60 s now. Not done yet: the VAE encode and decode and the
text embedding (small, one pass each), and wiring the converted UNet into the pipeline.

## Recommendation

- **When a delivery comes with a real normal map** (scans, Poly Haven, a photogrammetry set): fit the light on it and divide
  it out (`fit_light` with the scanned normals). It's cheap (numpy, under a second) and by far the best.
- **For generated textures with no normal map:** `marigold-ratio` is the only method here that beats step 2, by about a fifth
  in error, on 10 of 12 sets, with no loss of detail. It needs the PyTorch venv and about a minute a set on the CPU, or
  about 10 s once the NPU UNet above is wired into the pipeline. Run it per set, by eye, as an opt-in: worse on 2 of 12 sets.
- **Not worth it:** `shadefit-model`. The depth model's slopes are too coarse for light fitting.
- Nothing is wired into `process.py` yet. The opt-in would be `--delight marigold` (with the venv) or `--delight normals
  NORMAL_MAP`; ask before adding it.

## Reproduce

```powershell
# the depth venv (../npu-normals/README.md) for trial.py; a second venv for Marigold:
python -m venv "$env:LOCALAPPDATA\krator-models\venv-export"
& "$env:LOCALAPPDATA\krator-models\venv-export\Scripts\python.exe" -m pip install torch --index-url https://download.pytorch.org/whl/cpu
& "$env:LOCALAPPDATA\krator-models\venv-export\Scripts\python.exe" -m pip install diffusers transformers accelerate safetensors openvino pillow numpy
$lib = "C:/Users/travi/Documents/krator-master/core/materials/library"     # a checkout with the LFS images
$sets = "paving.cobblestone_01,paving.brick_wall_001,roof.clay_roof_tiles,rock.rock_face,rock.sandstone_blocks_04,bark.bark015,ground.coast_sand_rocks_02,concrete.cracked_concrete_wall,wood.wooden_gate,paving.tiles144,rock.rock_wall_11,ground.gravel042"
& "$env:LOCALAPPDATA\krator-models\venv\Scripts\python.exe" tools/textures/trials/npu-delight/trial.py $lib $sets          # writes the baked copies
& "$env:LOCALAPPDATA\krator-models\venv-export\Scripts\python.exe" tools/textures/trials/npu-delight/marigold.py "$env:LOCALAPPDATA\krator-models\trial-npu-delight"
& "$env:LOCALAPPDATA\krator-models\venv\Scripts\python.exe" tools/textures/trials/npu-delight/trial.py $lib $sets          # scores Marigold too
```

The Marigold weights (about 2.5 GB) go to `%LOCALAPPDATA%/krator-models/hf`.
