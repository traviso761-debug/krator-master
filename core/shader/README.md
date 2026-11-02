# core/shader: shader hooks and colour space

Two small modules every page takes (`CORE-IMPROVEMENTS.md` items 8a and 9a). Neither touches the DOM; `KCOLOR`'s functions are
pure. Each fragment's header is its API.

| File | What |
|---|---|
| `06-core-khook.js` | `KHOOK`: the one door for shader hooks. Every layer on a material composes in one fixed order, the program is keyed from every layer, and a missing anchor throws. `KHOOK.checkPrograms(renderer?, scene?, only?)` lists what did not link and what anchor was missed |
| `06b-core-kcolor.js` | `KCOLOR`: display (sRGB) against linear, once: the JS conversions, the GLSL include (`sampleSRGB`), the renderer's output and exposure |
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

Nothing is decoded that was not decoded before. core/water's colours go in as written (`WATER.colAsWritten`): those hexes were
tuned as linear, and decoding them would darken every page's water. So a surface that wants a true display hex passes
`KCOLOR.lin(hex)`, a `THREE.Color`, and each page's own colours wait for its turn (`CORE-IMPROVEMENTS.md` 9a: "pages at their
turn"). The mirror (`core/water/ext/58`) already matches the page's output encoding and needs nothing from here.

## The warp's slot

`KHOOK.warp` is reserved for a later `core/anomaly`: null until installed, so no text, uniform or key changes. Not built. It reaches only
a material with a KHOOK layer, so the warp's own work will include giving the others one.

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
