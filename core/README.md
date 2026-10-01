# core/

Code shared by more than one build, kept here once instead of copied into each.

## `materials/`

| File | What |
|---|---|
| `20-textures.js` | procedural canvas textures (`TEX.*`) and packed roughness/metal maps |
| `22-materials.js` | the base `MAT` table: `white rust verdigris glass winIntact winDead dark guts pipe pipeRust strip dot moss vine rubble fig ground slab stain`, plus the glass Fresnel patch |
| `68-mat-v5.js` | `MAT.rock lawn water mud turf turfR spray darkGlass` |

**Used by** the six Ancients-lineage builds: `kits/ancients`, and `settlements/`
`dalab`, `highlands`, `iziz`, `reedlake`, `screamers`. Each `build.py` adds
these files to its fragment list through `srcpath()`/`CORE_FILES`. They sort
into the same place they held when each build had its own copy.

**Override:** a build that needs a different version keeps a file with the same
name in its own `src/`. That copy wins for that build only. Record why in the
build's `KNOWN_ISSUES.md`.

**After editing a file here,** rebuild all six builds and check each one by eye.
A material change is visible everywhere at once.

### Textures are painted lazily

`canvasTex` paints a texture the first time something reads its `.image`, which three.js does when it first draws
with it. A page pays only for the textures it shows: painting all of them at load was about 11 s of every Ancients
page's start-up. The pixels are the same either way.

**A texture whose painter calls `rng()` must pass `eager=true`** (the fifth argument), or every later draw in the
seeded stream shifts and the world changes. Screamers' `TEX.thatch`, `TEX.lash`, `flBarkTex` and `skyTex` do.
Painters that use only `h3`/`vnoise`/`fbm`, or `Math.random`, need nothing.

### `materials/opt/`: opt-in shared fragments

Every digit-named file in `materials/` goes into every build that reads it (kits/ringsea takes them all). A
fragment only some builds want lives in `materials/opt/` instead, and a build takes it by naming it in
`CORE_OPT_FILES` in its `build.py` (`srcpath()` and `build_one()` fall back to it; a local copy still wins).

| File | What | Opted in by |
|---|---|---|
| `opt/69a-world-uv.js` | `vWorldUV(mat,K[,Kv])`: world-unit UVs for instanced boxes, re-tiled by instance scale per face. One shader program per K | `kits/ancients`, `settlements/iziz`, `highlands`, `xanadu`, `reedlake` |

**The world-UV fix (2026-10-01).** The hook used to be a closure copied into several places (`69b-vern-mat.js` in
Iziz, Highlands, Xanadu, Reedlake and Dalab; `izsWorldUV` in `77z-iziz-style.js`). three.js keys a compiled program
on `onBeforeCompile.toString()`, and a closure prints the same source whatever K it captured, so every world-UV
material in a page rendered at the K of whichever compiled first. Xanadu worked round it (`xUVKey`). The shared copy
builds the hook with `Function()`, so K is in the hook's source text (the key differs per K and survives `kbake`'s
material clone, so `30-kit.js` needs no change), and sets `customProgramCacheKey` as well.

**Still on the old closure:** only `settlements/dalab` (its own `69b-vern-mat.js` and `71-hl-mat.js`; Dalab is
left alone, its drift is deliberate). To move it over: delete `vWorldUV` from its `69b`, re-vendor `71-hl-mat.js`
(whose `hWorldUV` now calls the shared hook), add `CORE_OPT_FILES` and the `srcpath`/`build_one` fallback to its
`build.py` (copy them from `settlements/reedlake`), and rebuild. Highlands' `hWorldUV` (Ku != Kv, 71-hl-mat) was
the same kind of closure and now calls `vWorldUV(mat,Ku,Kv)`.

Checked and not affected: `settlements/jimjam` (`jjWorldUV` is already keyed per K; it also scales plain meshes, so
it is a different function); the Voth-lineage `applyWorldUV` in girder, mavs-refuge and locus (each material sets
`customProgramCacheKey` with its scale); port, screamers, kits/post-apoc, kits/ringsea and biomes/* have no
world-UV hook.

### What is not here yet

These material fragments drifted between builds, so they stay vendored:
- `54-mat-concrete.js`: three versions (ancients+highlands+iziz+jimjam+port+reedlake+xanadu, dalab, screamers)
- `69-mat-salvage.js`: two versions (ancients+dalab+highlands+iziz+port+reedlake+xanadu, screamers)
- the local layers `69b-vern-mat`, `71-hl-mat`, `74-rl-mat`, `69d-dalab-mat`

The Ancients versions of `54` and `69` are byte-identical in seven builds and belong in `materials/opt/`, but Dalab,
Port and Reedlake vendor-check them against `kits/ancients/src` and `settlements/highlands/src`: take the copies out
of those folders and those checks report the files as missing upstream. Move them in a pass that may also change
those builds' `build.py`.

Merge a drifted file only once its differences have been read and the merged
version renders correctly in every build that uses it.

Voth and Yuni use a separate system: a frozen `PAL` palette and `FAMMAT`
material families, instanced per family under a draw-call budget. The catalog
in `kits/catalog/` uses family strings (`'wood'`, `'cloth'`, `'plank'`…) plus a
colour. Neither is compatible with `MAT`.

## `atmos/`

The atmosphere and street-dressing module: evening lights and a glow layer, particles, weather, ivy and window boxes,
sewer grates, lamps and fountains, InstancedMesh culling. One global (`ATMOS`) behind a five-item host binding, so any
three.js r128 build can take it. Read `atmos/README.md`. **Used by** `settlements/iziz` (city target; its `build.py`
reads it through `TARGET_CORE`).

## `sockets/`

The cultural socket and banner/awning system: buildings declare sockets, a culture pack fills them (Iziz, Republic, Voth, Yuni, Beast Riders, generic). A worked example, `sockets/example/`,
builds a sheet of the same wall in every pack. Read `sockets/README.md`. **Used by** `kits/post-apoc` (its `build.py` reads `37-sockets.js` and `80-cultures.js` from here; a local copy with the same name overrides).

## Planned: a material registry

This comes later, with the furniture kit and the Blender export. The plan is not
to merge the three systems into one implementation. Instead:

1. **One list of canonical material names** (`slate`, `glazedTile`, `rustSteel`,
   `timber`, `cloth`…), each with tags (stone, metal, wood, fabric, glass,
   organic; weathering) and a Blender Principled BSDF recipe (base colour,
   roughness, metallic, and which procedural texture to bake).
2. **Each system maps its own names onto it**: `MAT.rust → rustSteel`,
   `FAMMAT.slate → slate`, catalog `'wood' → timber`.
3. **Exports carry canonical names.** A glTF export names each material by its
   canonical name, and one `bpy` script turns those into proper Blender
   materials for every settlement.
4. **Portable assets check against the registry.** A piece of furniture or a
   building declares the canonical materials it uses, and a host build must
   map every one of them.
