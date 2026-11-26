# NPU cut-out trial (2026-11-03)

Can the laptop's NPU, running a segmentation or matting model, cut texture card sheets out of their magenta better than
`tools/textures/cards.py`? **No: the models lose to the key. A better key wins, and it needs no NPU.** It is now opt-in in
`cards.py` as `"spill": "vlahos"`.

Sheets: the 2026-11-03 delivery's `card.glasscane`, `card.sedge.fen` (the hard ones), `card.dwarfbirch`, `card.breathfringe`,
`card.turf.limed` (controls), all 1254 x 1254.

**Judge by eye:** `contact.jpg` (whole sheets) and `contact-zoom.jpg` (one cell each, larger). Columns are methods. Each sheet is
shown three times, over grey, dark and light.

## Hardware

Intel Core Ultra 7 255H. OpenVINO 2026.4.1 sees `CPU`, `GPU.0` (Arc 140T iGPU), `GPU.1` (RTX 5060) and `NPU` (Intel AI Boost,
driver 32.0.100.4724, 2026-03-18). The NPU needs static shapes: models are reshaped to 1 x 3 x 1024 x 1024 on conversion.
The GPU was not timed. The verify lock was held (a Xanadu verify on the iGPU), and the GPU is the verifies'.

## Methods

| column | what | license |
|---|---|---|
| `key` | `cards.py` default: `key_out`, spill `edge` (the baseline) | ours |
| `unmix` | `cards.py` spill `unmix` (`key_unmix`, key_hi 200) | ours |
| `line` | `cards.py` spill `line`, subject white (`key_line`) | ours |
| `vlahos` | **new**: alpha from the key's tint in each pixel, colour unmixed against the key (`cards.key_vlahos`) | ours |
| `isnet` | IS-Net / DIS `isnet-general-use` (rembg's ONNX), the model's alpha, colour despilled | Apache-2.0 (weights and code): fine for a game pipeline |
| `birefnet` | BiRefNet general, Swin-tiny backbone (`BiRefNet-general-bb_swin_v1_tiny-epoch_232`, rembg's ONNX) | MIT: fine |
| `hybrid-*` | the model's mask, dilated, as the support; inside it `key_unmix` for alpha and colour | as the model |

RMBG-1.4 and 2.0 were left out: their weights are CC BY-NC (non-commercial), so they can't go in a game asset pipeline.

Salient-object models keep **one** object per frame: on a 3 x 3 sheet IS-Net cut out only the middle cell. `trial.py` therefore
runs the model once per blob of not-the-key (a padded box per patch) and keeps the largest alpha. This made it better, but not good.

## Results

Measures (`trial.py`, `measures()`, raw in `results.json` beside the outputs): **kept** = share of the clearly-not-key pixels at
alpha > 0.1; **semi** = share of those that are partly see-through; **holes** = share of the solid core at alpha < 0.5 (false holes);
**fringe** = mean magenta excess, min(R,B) - G, on the edge band. `vlahos` reads 0 for fringe by construction, so trust the contact sheet there.

| sheet | key | unmix | line | **vlahos** | isnet | birefnet | hybrid-birefnet |
|---|---|---|---|---|---|---|---|
| glasscane: kept / semi | 1.00 / 0.07 | 1.00 / 0.24 | 1.00 / 0.29 | **1.00 / 0.25** | 0.19 / 0.94 | 0.98 / 0.11 | 1.00 / 0.24 |
| glasscane: fringe | 49.8 | 7.8 | 3.4 | **0** | 14.0 | 5.7 | 7.8 |
| sedge.fen: fringe | 31.8 | 3.1 | 6.6 | **0** | 3.6 | 8.3 | 3.1 |
| controls: holes (max) | 0 | 0 | 0 | **0** | 0.99 | 0.02 | 0.009 |

By eye:
- **Glass canes.** `key` leaves them pink. `unmix` keeps them see-through but specks the glass green. `line` greys them and
  draws dark rims. **`vlahos` gives clear, white-to-cyan glass with partial alpha** (41% of cane pixels under 0.95, 10th
  percentile 0.35) and no magenta (largest excess left: 16). IS-Net throws the glass away and keeps the green rings: it reads
  see-through glass as background. BiRefNet keeps the canes but makes them opaque, so the magenta showing through stays in the colour.
- **Sedge tips.** `key` leaves hot-pink fringes. `vlahos` keeps the blades' own red-brown tips and drops the pink. `unmix` is
  close but softer. BiRefNet leaves dark purple edges.
- **Controls.** `vlahos` makes no false holes and returns the breathfringe filaments to their true orange (`key` leaves
  them pink). IS-Net holes every control. BiRefNet is close to the key but haloes dark.

## Speed (per 1254 px sheet)

| | NPU | CPU |
|---|---|---|
| IS-Net, one 1024 px frame | **0.51 s** | 5.4 s (CPU loaded by another compile) |
| IS-Net, per sheet (a frame per blob, plus blob finding) | 6.4 s | 11.4 s |
| BiRefNet-tiny | does not compile (fp16 IR: `Level0 pfnCreate`; fp32: still compiling after 30 CPU-minutes, stopped) | 57 s |
| `key` / `unmix` / **`vlahos`** | (no model) | 1.4 s / 3.6 s / **0.37 s** |

The NPU runs IS-Net ten times faster than the CPU, and its output matches the CPU's to 0.002. The hardware works. What it
runs doesn't help here.

## Why the models lose

The background is one flat, known colour, so the cut-out is a colour-unmixing problem, not a segmentation problem. A segmentation
or matting model predicts only an alpha, and it is trained on opaque photo subjects. It does not give back the subject's own
colour, so magenta seen through glass stays in the pixels. `vlahos` solves P = a F + (1 - a) K for the largest alpha that leaves
F with no magenta excess (the classic Vlahos screen key). That is exactly the physics of glass over a magenta card.

## Recommendation

- For glass, water and ice (and, judged by eye, fine blades with a tinted fringe), use `"spill": "vlahos"` in the batch entry (`"key_gain": 1.2` to
  1.5 makes see-through parts clearer).
- Keep `edge` as the default. Do not use `vlahos` on a sheet with pink, purple or magenta subjects: it turns them pale and half
  clear (the same caveat as spill `all`).
- **What the library took (textures-1103, 2026-11-03):** `card.glasscane` re-keyed with `vlahos` at `key_gain` 1.3. Against
  1.0 this halved the lavender cast; 25% of the sheet is still above alpha 0.5. The sedge and the breathfringe stayed on `unmix`:
  judged by eye, `vlahos` left the sedge tips red-pink and the fringe salmon. So `vlahos` is the key for see-through subjects.
  For fine blades, compare it with `unmix` by eye.
- Shelve the NPU for cut-outs. Revisit it only if a sheet comes on a busy or non-flat background, where a key can't work.
  For that, IS-Net runs on the NPU today, per blob.

## Reproduce

```powershell
python -m venv "$env:LOCALAPPDATA\krator-models\venv"
& "$env:LOCALAPPDATA\krator-models\venv\Scripts\python.exe" -m pip install openvino pillow numpy onnx
# weights (outside the repo): rembg's release assets
$d = "$env:LOCALAPPDATA\krator-models\onnx"; New-Item -ItemType Directory -Force $d
foreach ($n in 'isnet-general-use','BiRefNet-general-bb_swin_v1_tiny-epoch_232') {
  Invoke-WebRequest "https://github.com/danielgatis/rembg/releases/download/v0.0.0/$n.onnx" -OutFile "$d\$n.onnx" }
# convert to static-shape IR (in ...\krator-models\ir), then run; devices fall back in order, e.g. --devices CPU without an NPU
& "$env:LOCALAPPDATA\krator-models\venv\Scripts\python.exe" -I -c "import openvino as ov,os; d=os.environ['LOCALAPPDATA']+'/krator-models'; os.makedirs(d+'/ir',exist_ok=True); [ (lambda m:(m.reshape({m.inputs[0].get_any_name():[1,3,1024,1024]}), ov.save_model(m,d+'/ir/'+n+'.xml')))(ov.convert_model(d+'/onnx/'+n+'.onnx')) for n in ['isnet-general-use','BiRefNet-general-bb_swin_v1_tiny-epoch_232']]"
& "$env:LOCALAPPDATA\krator-models\venv\Scripts\python.exe" -I tools/textures/trials/npu-cutout/trial.py C:/Users/travi/Downloads/krator-delivery-2026-11-03 --models isnet,birefnet --devices NPU,CPU
```

The winner needs none of this: `vlahos` is numpy only. Its test is `python tools/tests/test_cards.py`.
