# The ground: diagnosis and core fixes (2026-11-03)

`HANDOFF-REBUILD.md`, "Ground is the weak point". The owner, 2026-10-28: the ground "tends to be 'okay' at best"; 2026-11-03, on
ebadlands' banded slopes: "the banding is good but this still looks somehow unrealistic; it needs better shadows within the texture
of the rock; it's too uniformly bright and still looks kind of painted on."

Three grounds, judged near, mid and far on the Intel Arc 140T: a forest floor (`biomes/nhighlands`, "Old wood"), a rocky eroded
surface (`biomes/ebadlands`, "Painted badlands"), a salt margin (`biomes/eastabyss`, "Salt flats"). Shots and numbers:
`tools/ground_shots.py` (below); the PNGs are in the session notes (`ground-shots/`), not in the repo.

## What makes them read "painted"

- **Rocky and eroded (ebadlands, "Painted badlands").** Near: the desert pavement's stones are flat dark specks on a flat tan, lit
  exactly as the sand between them; at the foot of a flank the layers smear into diagonal streaks (sampled from above on a steep
  face). Mid and far: the beds read as clean stripes of colour on a smooth, evenly lit surface, no lip catching the sun and no
  shadow under it: the owner's "painted on".
- **Forest floor (nhighlands, "Old wood"; from the code: its shots did not complete, below).** The canopy's shade is baked into the paint, so the floor is darker under trees, but the
  mulch and lichen are flat colour; the light is per vertex on a 9.2 m grid, so the floor's only relief is the mesh's.
- **Salt margin (eastabyss, "Salt flats"; from the code, likewise).** The crust is a colour; the polygons and the shore band are tints. Per-vertex light again.

### The causes, in order of weight

1. **No light reaches the texture's relief.** Every ground layer is colour only. `KGROUND.layer` takes `KMAT.textures(...).map` and
   nothing else, and the packs drop the rest before that: 262 of 276 ground and rock slots across 30 biome `materials.json` files are
   `mapOnly` (the channel audit below), although the library has a `normal.png` and a `roughness.png` for every one of those sets. So
   a pebble or a crack is a darker patch of paint with the same light on both sides of it: the "painted on" look, and the reason the
   owner sees no "shadows within the texture of the rock".
2. **Lambert grounds light per vertex.** In three.js r128 `MeshLambertMaterial` computes the light in the vertex shader (Gouraud), and
   the ground meshes are 9 to 14 m a cell (ebadlands 560 cells over 7.5 km: 13.4 m; nhighlands 720 over its square: 9.2 m). Even a
   perfect normal map could not show on them. Of the 20 biome grounds whose material the audit could name, 17 are Lambert only;
   ebadlands (MeshStandard under KGROUND), the Godthrone and swlowlands have a MeshStandard path.
3. **The bedded rock is a colour function.** `strataColor` (core/terrain/host/35-core-strata-shade.js) returns a colour: lamination,
   cross-bedding, varnish and a faint shadow line under hard beds are all multiplied into the albedo. The beds have hardness in the
   data (`bi.b`, the ledges of STRATA-PLAN section 4) but nothing turns it into relief in the light, so a hard sandstone bed and a soft
   shale read as two stripes of paint on one smooth surface.
4. **No occlusion at any scale.** Nothing darkens the sky light in a gully, under a ledge or between pebbles: the mesh carries no AO,
   the textures' cavities are not read, and KHORIZON (nhighlands) gives the large-scale sky view only where a page bakes it. With a
   bright sky and a high sun every surface gets the same ambient, hence "too uniformly bright".
5. **Steep ground is sampled from above.** KGROUND samples every layer on the xz plane, so on a badland flank the texture smears into
   vertical streaks (the strata colour on ebadlands is drawn in 3D and does not, which is why the bands look crisp and the surface on
   them does not).
6. Lesser: the hex tiling already hides repetition (no tiling problem showed in the far shots); debris is a page matter (ebadlands'
   turn is adding it); the mesh resolution matters for silhouettes, but at these cell sizes the near relief has to come from shading.

## The material channel audit

Which packed maps the grounds read (static: `materials.json` and the ground material in `src/`; on the GPU: `ground_shots.json`'s
`audit`, the live materials).

| Build | Ground and rock slots | Packed colour only (`mapOnly`) | On KGROUND | Ground material |
|---|---|---|---|---|
| eastabyss | 3 | 3 | yes | Lambert |
| ebadlands | 12 | 12 | yes | MeshStandard (Lambert on `?kground=0`) |
| godthrone | 3 | 3 | yes | MeshStandard and Lambert |
| hyperjungle | 2 | 2 | yes | Lambert |
| necanyons | 11 | 4 | yes | not found by the audit |
| nhighlands | 5 | 5 | yes | Lambert |
| nwbay | 8 | 7 | yes | Lambert |
| nwlowlands | 10 | 10 | yes | Lambert |
| sedesert | 7 | 7 | yes | Lambert |
| swbay | 6 | 6 | yes | Lambert |
| swhighlands | 7 | 7 | yes | Lambert |
| swlowlands | 4 | 4 | yes | MeshStandard and Lambert |
| 18 builds not on KGROUND (throne 49 slots, ringisles 14, catch 13, geyser 10, korona 10, ...) | 198 | 192 | no | Lambert where found |

Read by every ground: the colour map. Read by none: the sets' normal and roughness maps (the library has both for every set
listed). The live check (`ground_shots.py`'s `audit`) agrees on the three pages judged: one KGROUND material each, `map` only.

## The core fixes (all opt-in; without them the shader is byte for byte the same, `test-ground.js`'s FROZEN hashes)

- **`relief`** on `KGROUND.hook`: the layers' blended height (`kgHc`, already computed for the height blend) bumps the normal by its
  screen derivatives (Mikkelsen 2010), faded out by 140 m. **No texture unit**, which matters: ebadlands is at the Arc's 15-sampler
  link limit, so "read each layer's normal map" would cost it layers. On MeshStandard the lit normal is bumped; on Lambert the sun's
  share is scaled by the bumped facing over the face's own (weaker; see below).
- **cavity occlusion**, part of `relief`: the low of the height loses sky light (`cavity`, .55) and a little sun (`direct`, .35).
- **mesh cavities**: `KGROUND.cavity` / `cavityMesh` bake each vertex's depth below its smoothed neighbourhood at two scales (a gully,
  a valley) into `aKGAO`, read by `relief.mesh`. Plain arrays, deterministic: Godot bakes the same.
- **bed relief**: `relief.strata` adds the strata's own height on the core strata path: hard beds proud, soft ones recessed, each
  bed's nose rounded, a faint lamination. It reads the same bed texel as `strataColor` (no new sampler).
- **`tri`**: on the steep each layer is sampled from the side as well (two side planes blended by facing).

## Before and after

`tools/ground_shots.py`, 2026-11-03, Intel Arc 140T (ANGLE D3D11), 1280x720, on `claude/biome-rebuild` merged in; the PNGs are in
the session notes' `ground-shots/` (`<page>-<view>-<query>-<near|mid|far>.png`). Calls and triangles are the same with and without
in every shot (no draw, no triangle, no texture unit added). Every shot loaded with no page error and no GL error, and the linked
program's audit showed what was asked (bump, occlusion, bed relief where the core strata path is, side planes, mesh cavities).

| Ground | What changes, by eye | `?kgrelief=1` | `?kgrelief=2&kgtri=1` |
|---|---|---|---|
| ebadlands, Painted badlands (MeshStandard) | near: the pavement's stones stand, each with a shadow; mid: a lip and a shadow line at each bed's edge, the gullies darker | subtle | clear; some bed lines alias into dashes at mid range |
| nhighlands, Old wood (Lambert) | next to nothing: the floor stays flat green paint | none seen | barely |
| eastabyss, Salt flats (Lambert) | the crust's cracks a shade deeper | barely | barely |

Its near camera on nhighlands landed on the stream (the script stands 8 m short of where the view looks): judge the mid and far.

**Cost.** One sample a shot, and the Arc's timer swings far more than its documented 25% (the same page's far view read 23.7 and
35.3 ms in two runs), so `ground_shots` gives the order only. On the two Lambert grounds relief and tri cost within the noise
(nhighlands 28.6 / 27.6 / 29.4 ms near, before / relief / relief+tri; eastabyss 4.3 / 5.6 / 5.2 ms mid). On ebadlands the first cut
cost +17, +23 and +52 ms (near, mid, far), almost all of it the bed relief's lookup run out to 600 m and the side planes at every
distance; both are now cut off past their fade (300 m, 250 m). The cut was not re-timed: an alternating `perf_views.py` run
(`python3 tools/harness.py lock -- python3 tools/perf_views.py <page> "<page>?kgrelief=1" "<page>?kgrelief=1&kgtri=1" --rounds 3`)
died twice with the app. **Each build times it at its adoption turn, on its own views, before it turns relief on.**

## What I would make the default

- **Keep `relief` off by default for now**, as asked, and offer it per page at its turn: on MeshStandard grounds (ebadlands,
  godthrone, swlowlands) at about `?kgrelief=1.5` (`bump: .075, strata: .45`), the owner's "definitely improved" being on these.
- **`tri` only where flanks are steep and near**: it costs most and shows least past 100 m.
- **On Lambert grounds the switch is not the fix**: their light is per vertex, so the next step is moving each to MeshStandard at its
  turn (one line plus a roughness), then `relief`. Until then, leave them as they are.

## Not done, and why

- **Reading the library's normal maps** (unpack `mapOnly`, sample per layer): costs one sampler a layer; ebadlands has none spare and
  the others are close. The relief's derivative bump gets most of it free. A better height for it is a pack change, not a shader one:
  `tools/textures/pack.py` could write each set's height (integrated from its normal map) into the albedo's alpha, which KGROUND reads
  already (`h: {from: 'a'}`): luminance is a poor height for a painted or tinted layer.
- **Lambert to MeshStandard**: a page change (the light per pixel), the biggest single step for nhighlands and eastabyss; for each
  turn session, not core.
- **Environmental-field weights** (wet darkening, salt bloom, scree, litter under canopy): page weights on the field contract; core has
  nothing to add until two pages want the same rule.
- **Near-camera debris and a finer mesh near the camera**: ebadlands' turn is doing page-level relief and debris on the same slopes; a
  core scatter waits on what it learns.

## Godot

`ground.gdshader` takes the same: the height blend already exists; the bump is Godot's built-in `NORMAL` from `dFdx/dFdy` of the
height (or a `NORMAL_MAP` from a baked height), the cavity occlusion goes on `AO` (which Godot applies to ambient only, as here) and a
`DIFFUSE_LIGHT` scale for the `direct` share. `aKGAO` is exported per vertex as `CUSTOM0.x` from `KGROUND.cavity` (pure arrays). The
bed relief is `strata.gdshaderinc`'s bed lookup with the same three lines as `ksRelief`.
