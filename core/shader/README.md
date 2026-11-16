# core/shader: shader hooks and colour space

Two small modules every page takes (`CORE-IMPROVEMENTS.md` items 8a and 9a). Neither touches the DOM; `KCOLOR`'s functions are
pure. Each fragment's header is its API.

| File | What |
|---|---|
| `06-core-khook.js` | `KHOOK`: the one door for shader hooks. Every layer on a material composes in one fixed order, the program is keyed from every layer, and a missing anchor throws. `KHOOK.checkPrograms(renderer?, scene?, only?)` lists what did not link and what anchor was missed |
| `06b-core-kcolor.js` | `KCOLOR`: display (sRGB) against linear, once: the JS conversions, the GLSL include (`sampleSRGB`), the renderer's output and exposure |
| `07-core-kwarp.js` | `KWARP`, opt-in: one vertex warp on every material a scene draws (below). No build takes it yet |
| `aids/08-core-kfade.js` | `KFADE`, opt-in by file and by material: the screen-door dither fade (the occluder between the camera and a target; a soft band over a height) and the x-ray silhouette (stencil). In a subfolder so the builds that read `core/shader/` whole do not take it (`core/host/UNDERGROUND.md`) |
| `warp_check.py` | a test warp on a built page: what bent, what was left out and why, two pictures |
| `r128.js` | node only: the real three.js r128 for a hook's test (real chunk order, not a stub of `#include` lines) |
| `test-khook.js`, `test-kcolor.js` | `node core/shader/test-khook.js`, each rule with a negative |

## Taking it into a build

`khost.resolve(PATH, ...)` adds both fragments to every build that calls it, whatever list it passes. A build that lists its core
files by hand names them itself: `'shader'` in `CORE_DIRS` or `CORE_MODULES` (the kits on the Scyvoi engine, Dhelv, Mungo),
`CORE_SHADER` (the Port line: Port, Ring Sea, Hook, the Dam Basins), or the two paths (the open worlds, Voth's `CORE_PLACE`, Verge's
`CORE`, the Ancients, the sky demo). A build with a reseed rule lists them in `DETERMINISTIC`. `tools/fragment_needs.json` declares this for core/atmos, core/terrain, core/water and core/biome, and
`tools/build.py` fails a page without it. Without the fragments a page fails at the first hook with
"core/shader is not on this page".

## Who is on it

| Module | On KHOOK | Left, by name |
|---|---|---|
| `core/atmos` | every hook | |
| `core/terrain` | `KGROUND.hook`, `KFAR.fogThin`, `KHORIZON.shade`, the plain lava's `klava-show` | `35-core-strata-shade.js` has no hook, but its hand `pow(c, 2.2)` could name `gamma22ToLinear` |
| `core/water` | the layers on a material (`wtr-ride`, `wtr-wet`, `wtr-keep`, `wtr-rust`, `wtr-cf:<hash>`, `wtr-breakup`, `wtr-mirror`); a kind's own hook stays the material's own, and all its replaces throw (`W.vs`, `W.fs`) | |
| `core/biome` | `BIO.lodFade` (the layer `lodfade`) | the foliage, bark, irid, far, solid and anim hooks (about 50 replaces, `30-core-foliage.js`, `35-core-anim.js`): one material's own hook each, nothing wraps them, so no collision to end. A throw there needs a GPU sweep of every biome first, not a node test |
| others | | `core/materials`, `core/furnish`, `core/city`, `core/charactermodels` and the kits' own hooks. They run in the page's slot, under the layers |

## KCOLOR: what moved and what did not

core/water's colours are decoded (`WATER.colLin`, the owner, 2026-11-08): a hex is a display colour and goes into the water's shaders
linear, as the Godot importer always read it; a `THREE.Color` goes in as it is. Until then they went in as written (read as linear), so
every page's water darkened with the change; `WATER.colAsWritten` keeps the old reading. Each page's own colours wait for its turn (`CORE-IMPROVEMENTS.md` 9a: "pages at their
turn"). The mirror (`core/water/ext/58`) already matches the page's output encoding and needs nothing from here.

## The warp: `KHOOK.warp` and `KWARP`

`KHOOK.warp` is the slot: null until installed, so no text, uniform or key changes. `KWARP.install` (`07-core-kwarp.js`) fills it and
gives every material in the scene a KHOOK layer at that moment, whatever its hook, so nothing had to be converted ahead of time: with no
warp no material has a new layer, and a page that does not take the fragment does not move. The Ancient's Valley takes it with the Bend.

It covers the three ways a Krator vertex shader projects: `<project_vertex>` (the ground, water, the Ancients' materials, core/materials);
a hook's own `gl_Position = projectionMatrix * mvPosition` (the sway, the anim, the impostors, the lava); and any other
`projectionMatrix * <expression>`. `node core/shader/test-kwarp.js` runs each on the real chunks and hooks.

`warp_check.py` on the rebuilt pages (GPU, Arc, 2026-11-02; every program linked, no shader errors): swlowlands 60 programs bent,
nwlowlands 62, the Ancients kit 71. Ground, trees, water, far country and buildings rise together, with no gap at a chunk edge by eye.
Left out, by reason: the sky dome, and `atmos:rain` and others not compiled because they were not drawn in that frame.

What the Bend still has to deal with:
- **The sky stays put.** The plan wants the horizon to climb: that is the dome's own work, not a vertex warp.
- **A warp moves vertices.** A coarse mesh cannot bend: the Ancients sheet's ground is one quad, so it goes (it is the sheet's floor, not
  the Valley's). Check any large flat mesh on the Valley's pages.
- **Culling** is three's, on unbent bounds, and the biome LOD's ranges are by unbent distance, so chunks lifted into view vanish early.
- **Shadows** stay true: three's default depth material takes no hook (0 such meshes on these three pages' report, whose shadows are off
  or custom). Normals are not bent, so light does not follow the curve.
- `W.sweep()` after a lazy load: what is built after install does not bend until then. Godot needs the same warp in its own shaders.

## Proof that shaders did not move (2026-11-02)

The same node tests were run on `claude/biome-rebuild` before this work and after it, every compiled shader recorded: 134 of 134
identical (water, atmos fog, the runtime LOD), plus the 54 atmos and terrain cases on the real r128 ShaderLib, and the mirror and
the plain lava by a direct comparison. The behaviour that does change is listed below.

- A page hook assigned after `BIO.lodFade` used to replace the fade; it now goes under it.
- `WATER.wetGround` on a material whose page hook replaced `<project_vertex>` (the foliage's sway) now writes its varyings before
  `<fog_vertex>`, as `snowOn` does; before, the varying was never written and the wet chunk read zero.
- A missing anchor in a water hook, the lava's or `lodFade` now throws where it did nothing. Unlit materials keep the old quiet
  path where the anchor is a lit one (`ATMOS.repLit`).
- A second `fadeRibbons` on one material is a layer of its own (`wtr-cf:<hash>`), as it was a wrapper of its own.
- Program keys: the same strings on the real three.js, whose default key is the hook's source. `test-gaps.golden.json`'s two
  `wetGround` entries were rewritten for that alone, because its stub's default key returns `''`; the shader text under them is
  unchanged.

`tools/harness.py` asserts `KHOOK.checkPrograms()` empty as the universal check `shader-programs` on a page that has KHOOK.
