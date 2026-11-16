# Library search on the NPU (2026-11-03)

`tools/textures/libsearch.py` searches the material library by words or by a picture, and lists sets that are near copies
of each other, so a texture is reused instead of generated twice. Usage and setup are in its docstring.

**Model:** SigLIP base patch16-224 (`google/siglip-base-patch16-224`, Apache-2.0; ONNX from `Xenova/siglip-base-patch16-224`).
It is converted to OpenVINO IR with static shapes: images 224 px, text 64 tokens. Both encoders compile on the NPU.

| | NPU | CPU |
|---|---|---|
| one image | 0.030 s | 0.24 s |
| one text query | 0.014 s | 0.068 s |
| index the 998 sets of the main checkout | 105 s (mostly reading the images) | |
| re-index, nothing changed | 4 s | |

**Results** (judge by eye):
- `search.jpg`: eight word queries, top six each. The hits are right for every query: for "rusty corrugated metal",
  `metal.corrugated.rusty` first; for "turquoise glazed tiles", the green glazed tiles, celadon roof tiles and the lapis mosaics.
- `like.jpg`: five images from the 2026-11-03 delivery. Coral rubble finds coral stone, shell terrazzo and barnacle; the sedge
  sheet finds the grass cards. White marble finds white stones (ivory, granite, quartz vein) but not the marble sets: a
  picture search matches colour and grain more than the kind of stone, so search by words as well.
- `dupes.jpg`: pairs at 0.975 or above. Most are deliberate siblings (the jungle clump cards, vine cards, abalone shells,
  colourways of one textile). Two are real duplicates:
  - `shell.abalone.soft` is byte for byte `shell.abalone`, from the same source.
  - `pattern.bogolan` and `patterns/common/mudcloth` come from one source image (sha1 55ba3a0d...), processed twice.

  Nothing in the library was changed; which id to keep is the owner's call.

Scores are cosines. Word queries score about 0.07 to 0.15 and picture queries about 0.75 to 1.0, so compare scores only
within one command. Tests: `python tools/tests/test_libsearch.py`; the real model runs when it is set up.
