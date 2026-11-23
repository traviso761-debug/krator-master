# The all-kit graphics upgrades K1-K5, written before Stage 8

GRAPHICS-TERRAIN-PROPOSAL.md section 12d B (K1-K5) as code, on the owner's D1 (STAGE-8/PLAN.md on `claude/integration-4`:
"before Stage 8, as their own sessions; Stage 8 then only rebuilds"). Branch `claude/kit-graphics-k1k5`, cut from
`freeze/vertical-stack-1123` (d636c78c4) with `origin/claude/roomlight-fixes` (02b9afc2e) merged. Built pages are NOT
committed here: Stage 8 rebuilds them once. B1-B5 (`core/biome`, `foliage.gdshader`) are another session's.

## What each one is

| | Files | What changed | Looks |
|---|---|---|---|
| K1 | `core/materials/record/25-matlib-host.js`, `26-matlib-bind.js`, `core/materials/opt/69a-world-uv.js` | The library hooks' numbers (specular scale, break-up mix/macro/cell, world-UV K and Kv) are uniforms (`uKmSpec`, `uKmBreak`, `uWuvK`), each set per material in `onBeforeCompile` to the value the text used to print (3 and 4 places). `KMAT.libKey` keys on the hooks' kind (`|libs|bu`); `KMAT.libId` keeps the old value key for ids. A hook carries its key as `fn._pck`, which three's default program key reads, so kbake's clones share the program too; a hook wrapped round one later keeps a program of its own. TODO.md "Fewer shader programs", items 2 and 3 (item 1, the foliage, is B3) | none: the same values, fewer programs |
| K2 | `core/engine/30-geo.js`, `36-def.js`, `91i-interiors.js`; `kits/interiors/src/49-exports.js`, `50-shell.js`, `build.py`, `kit_bundle.py` | Plot-base grounding: a `box()`, `cyl()` or vertical `beam()` on its plot darkens to 0.72 at its foot over 0.30 m (vertex colour; a tall piece drawn in two so the ramp ends at the band). `boxBevel()` (44 triangles). `KROOMLIGHT` bundled ahead of the interiors core: `IX.roomLight`, `IX.lightPool`, `IX.exportInteriors` (interiors.json v2), shells' corner AO in the walls' vertex colour; the engine's `?interiors=1` keeps the table (`SVIX.lightTable`, `svixLightPool`, `svixExport`) | engine pages: walls and posts darker at the foot; interiors shells: corners |
| K3 | `core/catalog/krator-furniture-runtime.js`, `tools/textures/pack.py`, `kits/catalog/materials.json` | An indexed batch (`KF.batch({indexed:true})`, every furnished build) darkens each floor-standing piece's parts that touch its floor to 0.76 over 0.18 m (tall parts clipped at the band); wall- and ceiling-hung pieces, glow and glass left alone; `footAO:false` turns it off; the soup batch never takes it. `pack.py` takes a family's `"normalBits": 8` (packFormat 1) and makes it `xy8` in packFormat 2; the catalog's eight smooth families (lacquer, ceramic, tile, gold, metal, bronze, nacre, obsidian) ask for it. The `rec.scale == null ? 1 : rec.scale` fix was already in `50-core-furnish.js` | furnished pages: pieces grounded. The 8-bit families change nothing on the web: the catalog's detail maps are colour only (`mapOnly`), so `tex/` repacks identical |
| K4 | `core/interiors/20-core-roomlight-host.js` (new); girder, yuni, locus, mavs-refuge `src/45-kit.js` and `build.py` | `KNLV`: the night light volume the four builds pasted, one module; each build keeps its numbers, lists and names. `KRLHOST`: the room table as Godot's `room_light_tex` twin and a hook to light a room from it (opt-in, wired nowhere yet) | none: the shader text and the baked texture are the same bytes (tested) |
| K5 | `godot/shaders/library.gdshader`, `library_cutout.gdshader` (new), `lib/library_body.gdshaderinc` (new), `godot/krator/kmat.gd`, `world_import.gd`, `world_stream.gd` | The library body is one include; `library.gdshader` never writes ALPHA (opaque: depth prepass, early-Z, vertex-only shadow passes), `library_cutout.gdshader` defines `KLIB_CUTOUT` and scissors. `KratorKmat.shader_for(alpha_test)` picks, `is_library(sh)` knows both; `world_import` puts an alphaTest record on the cut-out one | Godot: none intended (cut-outs as before, opaque surfaces faster) |

Not done here (say so at Stage 8): K1's sine-free `kmH` hash and `pack.py`'s pre-quantisation `mipVariance` / cavity-wear
split (the design's other K1 items: the hash changes the look of every library page and the brief did not scope it; the
mipVariance is already in packFormat 2). K2's `KROOMLIGHT` is data and export on engine pages: no engine page lights its
rooms from the table yet (`KRLHOST.apply` is the hook for it). Godot's catalog furniture in `hemi-oct8` (K3) follows D4:
format 2 only where Stage 8 re-exports.

## Tests (node and Godot; each has its negatives)

```
node core/materials/record/test-k1-uniforms.js     # K1: 21
node core/engine/test-k2-geo.js                    # K2 engine: 25
node kits/interiors/tests/test-roomlight.js        # K2 interiors: 19
node core/catalog/test-k3-foot.js                  # K3: 10, every catalog piece
node core/interiors/test-roomlight-host.js         # K4: 31, each build's pasted copy from git against KNLV
godot --headless --path godot --script res://tests/shaders/terrain_and_jungle_shader_test.gd   # K5: 5 new checks
```

Also green: `core/materials/record/test-record.js`, `test-m1.js`, `core/furnish/test-furnish.js`, `core/interiors/test-roomlight.js`,
`godot/tests/export/longsong_test.gd`.

## Which pages move at Stage 8

Every page that reads a changed file changes bytes; `python3 tools/reach.py <file> --commands` lists them (283 build commands
for the set, almost all through K1's `25-matlib-host.js`). What they DRAW moves only where K2 or K3 reach:

- **Bytes only, same pixels:** every page on `core/materials/record` or `opt/69a-world-uv.js` (K1: the same values as uniforms,
  fewer programs); girder, yuni, locus (its three pages) and mavs-refuge for K4 (the volume's shader text and texture are the same
  bytes: `test-roomlight-host.js`). Measured on SwiftShader, base page vs rebuild (`renderer.info.programs`): highlands 54 -> 31
  programs (Standard 49 -> 25), scyvoi 63 -> 52 (50 -> 39), islanders 52 -> 44 (37 -> 29).
- **Look moves, K2 (plot-base grounding):** the nine `core/engine` pages (`core/engine/fingerprint.py`: scyvoi, ash-nomads,
  desert-nomads, eternian, islanders, lizardmen, yeti, resources, noahs-regret) and every other engine-built page (the isle demo's
  bundles, `biomes/nwouterwall --station yeti`); kits/interiors' sheets (the shells' corner AO).
- **Look moves, K3 (foot grounding):** every page with an indexed catalog batch: the furnished builds (`core/furnish/fingerprint.py`:
  girder, mavs-refuge, locus, locus-kit, abyss-kit, highlands, roketstad, post-apoc), the engine kits' furniture, kits/interiors,
  kits/ancients-interiors, and every settlement and openworld page that furnishes through `KFURN.useBatch(..., {indexed:true})`.

The fingerprints, rebuilt pages against the same pages built from the base (2026-11-23, on this branch before 6a; the base
pages of lizardmen and resources already differed from `fingerprint.json` before this change: their rows are stale, so the
comparison is against the base pages' own fingerprints):

| core/engine | records | objects | registry | scene | tris | where the triangles come from |
|---|---|---|---|---|---|---|
| scyvoi | same | same | same | moves | 913,950 -> 923,002 | furniture batch +9,052 (K3) |
| ash-nomads | same | same | same | moves | 1,012,315 -> 1,027,375 | furniture +15,060 |
| desert-nomads | same | same | same | moves | 1,300,964 -> 1,310,952 | furniture +9,988 |
| eternian | same | same | moves | moves | 613,074 -> 618,378 | furniture +5,292, `earth` +12 (K2) |
| islanders | same | same | moves | moves | 2,887,685 -> 2,933,585 | furniture +43,428, `stone` +2,472 (K2) |
| lizardmen | same | same | same | moves | 673,848 -> 683,252 | furniture +9,404 |
| yeti | same | same | same | moves | 1,385,945 -> 1,387,833 | furniture +1,888 |
| resources | same | same | moves | moves | 109,402 -> 110,026 | the nodes' plinths +624 (K2) |
| noahs-regret | same | same | same | moves | 1,448,262 -> 1,517,314 | furniture +69,052 |

The registry moves where a record's own triangle count grew (a grounded wall drawn in two); no record, place, box or door moved.

| core/furnish (off / on) | placed, records, missing, meshes, lights, interiors | batch triangles |
|---|---|---|
| girder | same | 101,204 -> 134,116 (+32.5%) |
| mavs-refuge | same | 1,218,198 -> 1,405,734 (+15.4%) |
| locus | same | 177,892 -> 185,236 / 996,385 -> 1,088,309 (+4.1% / +9.2%) |
| locus-kit | same | 31,620 -> 35,060 / 97,244 -> 107,856 (+10.9%) |
| abyss-kit | same | 174,730 -> 199,406 / 765,779 -> 833,699 (+14.1% / +8.9%) |
| highlands | same | 771,082 -> 818,986 / 4,555,522 -> 4,780,602 (+6.2% / +4.9%) |
| roketstad | same | 3,267,892 -> 3,479,588 / 19,622,577 -> 21,304,713 (+6.5% / +8.6%) |
| post-apoc | same | 319,438 -> 345,722 / 444,220 -> 488,608 (+8.2% / +10.0%) |

Every move is geometry only (the foot clipping and the grounding colours): no piece placed differently. **The cost to decide:**
K3 clips a tall part's triangles at the 0.18 m band so the darkening stops there; that is the +4% to +33% furniture triangles
above (girder's small, many-legged pieces the most). Without the clip (`FOOT_AO` ramp on the vertices only) it costs nothing but
a tall part darkens up its whole height. The owner's call at the shots; `KF.batch({indexed:true, footAO:false})` is the off switch.

At Stage 8: rebuild as A-runbook says; then `python3 core/engine/fingerprint.py --write` and `python3 core/furnish/fingerprint.py
--write` once, after the owner has seen the shots (the rows above are what they should show). Builds that newly need
`DETERMINISTIC` entries are done here (girder, yuni, locus, mavs-refuge: `20-core-roomlight-host.js`; girder also
`27-matlib-m1.js`, which the freeze added to core/materials/record and girder's build refused before this change).

Found on the way, not fixed (not K1-K5): `tools/check_insulation.py` fails on the freeze (`core/world/landshade.py`, the known
Phase 0 item); `tools/check_vendor.py` reports Tungang's own `src/37-wk-rec.js` shadowing `core/engine`; `check_source` has 41
keys over its baseline on the freeze, none of them in these files; `godot/tests/export/pinnacle_world_test.gd` hangs on Windows
(its synthetic stream goes to `/tmp/...`, so `places` is empty and line 160 errors before `quit`).

## On the merged base (claude/integration-4 bfa74b80c, 2026-11-23)

Merged clean. Every node test above, the Godot shader test and both fingerprints were rerun on the merge, against the same
pages built from bfa74b80c. The moves are the ones in the tables above; the counts that differ are the base's own:

| core/engine | registry | tris (base -> K1-K5) |
|---|---|---|
| islanders | moves | 2,903,345 -> 2,949,245 |
| lizardmen | same | 1,367,905 -> 1,381,681 |
| resources | moves | 120,130 -> 120,838 |
| the other six | as above | as above |

core/furnish: as above, with highlands 549,620 -> 590,028 (+7.4%) off and 3,959,644 -> 4,167,076 (+5.2%) on. Records,
placements, meshes, lights and interiors are the same on every page.

**GPU shots** (rtx lane, RTX 5060, KRATOR_GL=gpu; each page's `verify.py --all-views` on the base pages, then on the rebuilt
pages; the owner has the side-by-sides): islanders 301 views (mean pixel difference 0.02 of 255, the most 0.45, the huts' posts
and furniture), resources 118 (0.02, the nodes' plinths), highlands 217 (0.06, the sacks and barrels), kits/interiors 26 (0.49:
the shells' corner AO, the clearest move), girder 23 (1.6: mostly its clock, which runs between shots, so that page's views are
not a clean comparison).
