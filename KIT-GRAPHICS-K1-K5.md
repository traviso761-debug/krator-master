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

## Wired in and the other kit-side items (the owner: "wire them in and implement other proposed improvements", 2026-11-23)

| Item | Files | What it does | Test |
|---|---|---|---|
| Bevels on hero masonry (M4) | `core/engine/30-geo.js` (`BEVEL_KEYS`, `BEVEL_BUDGET` 60,000, `BEVEL_STAT`, `clipY`, `bevelBox`); `kits/lizardmen/src/31-alt-takes.js` (`stoneP` .05, `brick` .02); `kits/eternian/src/38-et-alt.js` (`block` .03, `brick` .015, `stone` .03, `paving` .02) | `box()` draws a kit's named masonry keys chamfered (boxes at least 2.5 chamfers thick) until the page has spent 60,000 extra triangles; a grounded one keeps its ramp, cut at the band | `node core/engine/test-k2-geo.js` (33) |
| Joint darkening per vertex (M4) | `core/engine/30-geo.js` (`SLABS`, `aoSlab`, `AO_BASE`), `36-def.js` | the base ramp's foot is whatever the piece stands on: its plot or a slab its building drew (a floor, a deck, a platform) | same |
| Room lighting from the table (I1-I3) | `core/interiors/20-core-roomlight-host.js` (`KRLHOST.hook` attribute mode, `tagRooms`, `lightPool`); `core/engine/91i-interiors.js`, `engine.py` (the host in the interiors fragment); `kits/interiors/src/50-shell.js` (`opt.roomLight`), `70-demo.js`, `build.py` | engine pages with `?interiors=1`: every vertex inside a planned room takes its column of the table, its walls and furniture lit by portal daylight and lamp ambience (the sun's share off at night), a pool of 4 point lights at the eye's room's lamps and windows; Eternian: 423,124 of 1,684,949 vertices indoor in 172 rooms. The interiors demo's shells (`?roomlight=0` to compare) | `node core/interiors/test-roomlight-host.js` (36), `node kits/interiors/tests/test-roomlight.js` (20) |
| Sine-free break-up hash (K1) | `core/materials/record/25-matlib-host.js` `kmH`, `godot/shaders/lib/breakup.gdshaderinc` `km_h` | Hoskins' hash13, the same expression in both engines (fract(sin(large)) differed between GPUs). Moves every library page's break-up pattern | `node core/materials/record/test-m234.js` (17) |
| Specular AA from mip variance (M2) | `tools/textures/pack.py` (`"specAA"`: `mipVariance` on a packFormat 1 entry), `matlib_pack.py`, `25-matlib-host.js` `specAAHook` | the variance of the sampled mip widens the roughness (WebGL 2); on Lizardmen's bronze, cast bronze, jade and Eternian's celadon, tile, bronze, gold | same |
| Cavity and wear, two masks (M4) | `pack.py` (`"m4"`: `<fam>.cw.webp`, R cavity, G wear; `compute_wear_from_normal`), `25-matlib-host.js` `cavityHook` | joints darker, worn arrises paler and smoother; on the survey's masonry (Lizardmen `stoneP`, `brick`; Eternian `block`, `brick`, `stone`, `paving`) | same |
| Planar parallax on masonry (M3) | `pack.py` (`"pom"`: the height in the colour map's alpha, the set's height map or integrated from its normals; `pomDepth` metres), `25-matlib-host.js` `pomHook` | 8 linear steps and one refinement, the frame from screen derivatives (no tangents), explicit gradients; on the same masonry families | same |
| Wet margins (M4) | `25-matlib-host.js` `KMAT.wetTag` (per vertex, from the LOCAL water body: `WORLD.water(x, z)`), `KMAT.wetHook` | written and tested; **not wired**: no page has library materials standing in `WORLD.water` today (the quays of `kits/port`/Hook and the isle demo's harbour are where it goes) | same |

The two kits' textures were repacked (`python3 tools/textures/pack.py kits/lizardmen`, `kits/eternian`): only the flagged masonry
families' albedos changed (RGBA now, the height in alpha) and their `.cw.webp` maps are new; every other file is byte-identical.

**Not done, and why:** room lighting in girder, locus, yuni and mavs-refuge (each furnishes rooms its own way: girder lazily as
the camera nears, locus during its build, yuni and mavs on their own room systems; each needs an adapter onto `KRLHOST.tagRooms`
after its rooms exist); a lit room in Godot as a shot (Godot already reads interiors.json v2; a windowed capture was not set
up); the wet margins' wiring (above). Nothing here needed the owner's texture work: the height, cavity and wear come from the
library sets' own normals (a set's `height.png` where it has one).

**Fingerprints** (rebuilt pages against the line's, bfa74b80c): core/engine: eternian +59,980 triangles (the bevels on `block` and
its variants, `brick`, `stone`, `paving`; registry moves), lizardmen +6,976 (`stoneP` +5,472, `brick` +1,504), islanders +3,240
(`stone`: the slab joints split more walls), resources +708, scyvoi and noahs-regret colour only, ash-nomads, desert-nomads
and yeti `same`; records and objects the same everywhere. core/furnish: every interiors-off row `same`; the five interiors-on
rows that differ from the line's committed pages have the line's own hashes (built from bfa74b80c's sources): furniture untouched.

**GPU shots** (arc lane, KRATOR_GL=gpu, each page as the line built it, then rebuilt; `shots/k-wired/` in this worktree, not
committed): draw calls the same in every view; triangles and programs:

| View | before | after |
|---|---|---|
| Lizardmen, bronze and stone hall (near) | 1,340,969 tris, 48 programs | 1,347,945, 41 |
| Lizardmen, the nest hall (mid) | 1,367,905, 48 | 1,374,881, 41 |
| Eternian, block hut (near) | 613,074, 36 | 673,054, 38 |
| Eternian, court house (mid) | 613,074, 36 | 673,054, 38 |
| Eternian `?interiors=1`, night, court house cut away (near) | 704,941, 64 | 764,921, 68 |
| Eternian `?interiors=1`, night, canal row cut away (mid) | 699,753, 60 | 759,733, 64 |
| kits/interiors sheet | 68,658, 7 | 78,898, 9 |

fps 58-61 in every view before and after: the page is held at the display's 60 Hz, so the numbers show no drop, not the cost.

## More kits (the owner: "I approve these for stage 8, they can go to more kits", 2026-11-23)

| Commit | What |
|---|---|
| 158893cb7 (two commits) | core/engine masonry kits: Scyvoi (`stone` m4, `paving` m4 + pom), Islanders (`coral`, `clayBlock` m4 + pom; bevel `coral`), Yeti (`course`, `slab`, `flag` m4 + pom; bevels `slab`, `flag`), Tungang (`stone` m4 + pom, `wash` m4; bevel `stone`). Bevels spend 10,112 (Islanders), 32,864 (Yeti), 59,968 (Tungang, at the cap; 3,393 boxes left plain) triangles |
| 8c35336b2 | Room lighting in girder, locus, yuni and mavs-refuge: `KRLHOST.wirePage` (tick each second, fixed-width table, re-tag near new rooms and new geometry) and one adapter fragment each (girder: `GIX.jobs`' rooms with portals through `IX.roomLight`; locus: the rooms `LOCF.interior` plans; yuni: `INTERIOR_CACHE`'s plans placed in world terms, `KROOMLIGHT` read in place as `19-core-roomlight.js`; mavs: `MIX.units`' shells). On the GPU: girder 585 rooms / 2.36M vertices indoor, locus 414 / 2.90M, mavs 1,764 / 377k, yuni 3,192 / 33k (its interiors stream near the camera; instanced walls are left alone) |
| b900bc4bc, 6112d2001 | The Ancients-lineage masonry (through `KMAT.bindMat`, no code): kits/ancients and kits/port (concrete m4; paving, brick, pkPave m4 + pom), kits/iziz-vernacular and settlements/iziz, kits/xanadu and settlements/xanadu (stone, brick m4 + pom; plaster m4), kits/highlands and settlements/highlands (stone, brick m4 + pom), kits/talia (taMarble m4 + pom + specAA), kits/qiblai (qAshlar, qCobble, qFlag m4 + pom), kits/construction (block, brick m4). `core/materials/record/test-masonry-packs.js` checks every flagged family in all 17 builds has its outputs. `tools/textures/matlib_pack.py write_sidecar` overwrites in place and retries Errno 22 (kits/ancients failed to reopen its shared sidecar on this Windows box). The second commit puts back pack families the repack settled without being asked (drift between some committed tex/ and their materials.json): against the pre-repack commits only the flagged families differ |

**Not applicable:** Highlands' `cobble` and `ashlarP` and Beast Riders' `stone`, `sandstone`, `navajo` are colour-only maps (`mapOnly`):
no normals to derive cavity, wear or height from.

**Fingerprints** (rebuilt against the line's pages): core/engine moves only by the bevels and joints (islanders +13,352 = 10,112
bevels + 3,240 joints; yeti +32,864, its bevel spend exactly; eternian, lizardmen, resources as in the round before; scyvoi and
noahs-regret colour only; ash- and desert-nomads `same`; no record or object moves). core/furnish as before: the room tagging
adds attributes the furniture's hash does not read; furniture untouched.

**GPU pairs** (arc lane, `shots/k-more/` in this worktree): Tungang near and mid (its committed page is behind the line: 123 records
against 170 built from the line's sources, so its numbers mix that in; this branch's share is the 59,968 bevel triangles and the
joints), Highlands dwellings and temple (programs 56 -> 35 and 59 -> 35, triangles the same; the views are mid-distance, where
the masks and parallax barely show), girder's tower cross-section at 21:00 (programs 188 -> 259, 60 -> 53 fps: the room
light's hook gives each hooked material a program of its own: the cost to weigh), Mav's apartment at 21:00 (programs 81 -> 115,
43 -> 45 fps) and hold cross-section at 13:00 (78 -> 112, 46 -> 49 fps).
