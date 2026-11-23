# The all-kit graphics upgrades K1, K2, K4 and K5, written before Stage 8 (K3 dropped)

GRAPHICS-TERRAIN-PROPOSAL.md section 12d B as code, on the owner's D1 (STAGE-8/PLAN.md on `claude/integration-4`: "before
Stage 8, as their own sessions; Stage 8 then only rebuilds"). Branch `claude/kit-graphics-k1k5`, cut from
`freeze/vertical-stack-1123` (d636c78c4) with `origin/claude/roomlight-fixes` (02b9afc2e), then `claude/integration-4` at
bfa74b80c (6a) merged. Built pages are NOT committed here: Stage 8 rebuilds them once. B1-B5 (`core/biome`, `foliage.gdshader`)
are another session's.

**The owner, 2026-11-23, after the GPU shots: "Agree all but k3."** K1, K2, K4 and K5 are approved. K3 (the catalog batch's foot
grounding, its band clip, `pack.py`'s `"normalBits": 8` and the catalog's eight 8-bit families) was taken out again by a forward
commit: `core/catalog/krator-furniture-runtime.js`, `tools/textures/pack.py` and `kits/catalog/materials.json` are the line's
own (bfa74b80c) again and `core/catalog/test-k3-foot.js` is gone. Nothing kept used them. The design's K3 (12d B 3) is not done.

## What each one is

| | Files | What changed | Looks |
|---|---|---|---|
| K1 | `core/materials/record/25-matlib-host.js`, `26-matlib-bind.js`, `core/materials/opt/69a-world-uv.js` | The library hooks' numbers (specular scale, break-up mix/macro/cell, world-UV K and Kv) are uniforms (`uKmSpec`, `uKmBreak`, `uWuvK`), each set per material in `onBeforeCompile` to the value the text used to print (3 and 4 places). `KMAT.libKey` keys on the hooks' kind (`|libs|bu`); `KMAT.libId` keeps the old value key for ids. A hook carries its key as `fn._pck`, which three's default program key reads, so kbake's clones share the program too; a hook wrapped round one later keeps a program of its own. TODO.md "Fewer shader programs", items 2 and 3 (item 1, the foliage, is B3) | none: the same values, fewer programs |
| K2 | `core/engine/30-geo.js`, `36-def.js`, `91i-interiors.js`; `kits/interiors/src/49-exports.js`, `50-shell.js`, `build.py`, `kit_bundle.py` | Plot-base grounding: a `box()`, `cyl()` or vertical `beam()` on its plot darkens to 0.72 at its foot over 0.30 m (vertex colour; a tall piece drawn in two so the ramp ends at the band). `boxBevel()` (44 triangles). `KROOMLIGHT` bundled ahead of the interiors core: `IX.roomLight`, `IX.lightPool`, `IX.exportInteriors` (interiors.json v2), shells' corner AO in the walls' vertex colour; the engine's `?interiors=1` keeps the table (`SVIX.lightTable`, `svixLightPool`, `svixExport`) | engine pages: walls and posts darker at the foot; interiors shells: corners |
| K4 | `core/interiors/20-core-roomlight-host.js` (new); girder, yuni, locus, mavs-refuge `src/45-kit.js` and `build.py` | `KNLV`: the night light volume the four builds pasted, one module; each build keeps its numbers, lists and names. `KRLHOST`: the room table as Godot's `room_light_tex` twin and a hook to light a room from it (opt-in, wired nowhere yet) | none: the shader text and the baked texture are the same bytes (tested) |
| K5 | `godot/shaders/library.gdshader`, `library_cutout.gdshader` (new), `lib/library_body.gdshaderinc` (new), `godot/krator/kmat.gd`, `world_import.gd`, `world_stream.gd` | The library body is one include; `library.gdshader` never writes ALPHA (opaque: depth prepass, early-Z, vertex-only shadow passes), `library_cutout.gdshader` defines `KLIB_CUTOUT` and scissors. `KratorKmat.shader_for(alpha_test)` picks, `is_library(sh)` knows both; `world_import` puts an alphaTest record on the cut-out one | Godot: none intended (cut-outs as before, opaque surfaces faster) |

Not done here (say so at Stage 8): K3 (above); K1's sine-free `kmH` hash and `pack.py`'s pre-quantisation `mipVariance` /
cavity-wear split (the design's other K1 items: the hash changes the look of every library page and the brief did not scope it;
the mipVariance is already in packFormat 2). K2's `KROOMLIGHT` is data and export on engine pages: no engine page lights its
rooms from the table yet (`KRLHOST.apply` is the hook for it).

## Tests (node and Godot; each has its negatives)

```
node core/materials/record/test-k1-uniforms.js     # K1: 21
node core/engine/test-k2-geo.js                    # K2 engine: 25
node kits/interiors/tests/test-roomlight.js        # K2 interiors: 19
node core/interiors/test-roomlight-host.js         # K4: 31, each build's pasted copy from git against KNLV
godot --headless --path godot --script res://tests/shaders/terrain_and_jungle_shader_test.gd   # K5: 5 new checks
```

Also green: `core/materials/record/test-record.js`, `test-m1.js`, `core/furnish/test-furnish.js`, `core/interiors/test-roomlight.js`,
`godot/tests/export/longsong_test.gd`. All rerun on the merge with bfa74b80c, and again after K3 came out.

## Which pages move at Stage 8

Every page that reads a changed file changes bytes; `python3 tools/reach.py <file> --commands` lists them (almost every build,
through K1's `25-matlib-host.js`). What they DRAW moves only where K2 reaches:

- **Bytes only, same pixels:** every page on `core/materials/record` or `opt/69a-world-uv.js` (K1: the same values as uniforms,
  fewer programs); girder, yuni, locus (its three pages) and mavs-refuge for K4 (the volume's shader text and texture are the same
  bytes: `test-roomlight-host.js`). Measured on SwiftShader, base page vs rebuild (`renderer.info.programs`): highlands 54 -> 31
  programs (Standard 49 -> 25), scyvoi 63 -> 52 (50 -> 39), islanders 52 -> 44 (37 -> 29).
- **Look moves, K2 (plot-base grounding):** the `core/engine` pages whose buildings stand walls, posts or plinths on their plots
  (below) and every other engine-built page (the isle demo's bundles, `biomes/nwouterwall --station yeti`); kits/interiors'
  sheets (the shells' corner AO).
- **Furniture: nothing moves** (K3 out).

The fingerprints after K3 came out, rebuilt pages against the same builds' pages from bfa74b80c:

| core/engine | records, objects | registry | scene | tris | where |
|---|---|---|---|---|---|
| ash-nomads, desert-nomads, yeti | same | same | same | same | no grounded piece |
| scyvoi, lizardmen, noahs-regret | same | same | moves | same | low grounded pieces ramped (colour only) |
| eternian | same | moves | moves | 613,074 -> 613,086 | `earth` +12 (a grounded wall drawn in two) |
| islanders | same | moves | moves | 2,903,345 -> 2,905,817 | `stone` +2,472 |
| resources | same | moves | moves | 120,130 -> 120,838 | the nodes' plinths +708 |

The registry moves where a record's own triangle count grew; no record, place, box or door moved.

`core/furnish`: every page reads `same` with interiors off. With interiors on, locus, abyss-kit, highlands, roketstad and post-apoc
differ from the line's COMMITTED pages in the geometry hash only (placements, triangles, meshes the same), and so do the same
builds built from bfa74b80c's own sources: their committed pages are behind the line's catalog changes (`check_stale`). Built
from the line's sources, those five read the same hashes as this branch (post-apoc 7b75c4b9, highlands daaed980, locus
fd6c4a81, abyss-kit 61a9cea2, roketstad 50232d25): the furniture is the line's.

At Stage 8: rebuild as A-runbook says; then `python3 core/engine/fingerprint.py --write` and `python3 core/furnish/fingerprint.py
--write` once. Builds that newly need `DETERMINISTIC` entries are done here (girder, yuni, locus, mavs-refuge:
`20-core-roomlight-host.js`; girder also `27-matlib-m1.js`, which the freeze added to core/materials/record and girder's build
refused before this change).

**GPU shots** (rtx lane, RTX 5060, KRATOR_GL=gpu, each page's `verify.py --all-views` on bfa74b80c's pages, then on the rebuilt
pages with K1-K5; the owner has the side-by-sides): kits/interiors 26 views (the shells' corner AO, the clearest move), islanders
301, resources 118, highlands 217, girder 23 (mostly its running clock). The furniture grounding they showed is K3's and is gone.

Found on the way, not fixed (not K1-K5): `tools/check_insulation.py` fails on the freeze (`core/world/landshade.py`, the known
Phase 0 item); `tools/check_vendor.py` reports Tungang's own `src/37-wk-rec.js` shadowing `core/engine`; `check_source` has 41
keys over its baseline on the freeze, none of them in these files; `godot/tests/export/pinnacle_world_test.gd` hangs on Windows
(its synthetic stream goes to `/tmp/...`, so `places` is empty and line 160 errors before `quit`).
