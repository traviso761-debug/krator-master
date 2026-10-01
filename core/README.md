# core/

Code shared by more than one build, kept here once instead of copied into each:
`materials/` (the Ancients-lineage materials), `terrain/` (carve patches for any
heightfield world), `atmos/` (atmosphere and street dressing) and `sockets/` (cultural sockets).

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

### What is not here yet

These material fragments drifted between builds, so they stay vendored:
- `54-mat-concrete.js`: three versions (ancients+highlands, dalab, iziz+reedlake+screamers)
- `69-mat-salvage.js`: three versions (ancients+dalab+highlands, iziz+reedlake, screamers)
- the local layers `69b-vern-mat`, `71-hl-mat`, `74-rl-mat`, `69d-dalab-mat`

Merge a drifted file only once its differences have been read and the merged
version renders correctly in every build that uses it.

Voth and Yuni use a separate system: a frozen `PAL` palette and `FAMMAT`
material families, instanced per family under a draw-call budget. The catalog
in `kits/catalog/` uses family strings (`'wood'`, `'cloth'`, `'plank'`…) plus a
colour. Neither is compatible with `MAT`.

## `terrain/`

| File | What |
|---|---|
| `36-core-carve.js` | carve patches: overhangs (alcoves, niches, undercuts, or a shape a build registers) on a heightfield world. Global `KCARVE`; with the biome core loaded also `BIO.carve` |
| `test-carve.js` | `node core/terrain/test-carve.js`: the module's contract on a synthetic cliff, each check with a negative |

**Used by** `biomes/sedesert` and `settlements/shade`. Opt-in by name: every
biome's `build.py` has a `CORE_TERRAIN` list (empty in the biomes that do not use
it), and a listed file is read from here unless the build's `src/` has a copy with
the same name, which then wins for that build only (record why in its
`KNOWN_ISSUES.md`). A biome that lists nothing builds byte-identical.

The module needs nothing but THREE (at `mesh()` only, from `opt.THREE`,
`BIO.host.THREE` or the global) and works outside the biome core too (an
Ancients-lineage settlement can load it as an ordinary fragment). To use it a
build must:

1. **declare patches** with `KCARVE.add({...})` before it builds its ground, each
   with a `base(x,z)`: its ground height WITHOUT the patch;
2. **fold `KCARVE.recessD(x,z)` into its wall function** (`min` with its own
   distance to the floor's edge), so the floor runs in under each hood;
3. **mesh the rock back** with `KCARVE.mesh(groundMaterial, {sun})` and give the
   meshes the ground's material (the patch is in world space, so a triplanar or
   world-position shader joins without a seam); `aOcc` and `aSun` are vertex
   attributes for the material to multiply in;
4. **teach its consumers**: no flora where `topAt(x,z)` is set, a camera pushed
   out of `rockAt`, walkable cells blocked where `rockAt(x, ground+1, z)`.

Shade's `45-host-stage.js` and `84-host-life.js` are the worked example. The
contract and its tunables are in the header of `36-core-carve.js`.

## `atmos/`

The atmosphere and street-dressing module: evening lights and a glow layer, particles, weather, ivy and window boxes,
sewer grates, lamps and fountains, InstancedMesh culling. One global (`ATMOS`) behind a five-item host binding, so any
three.js r128 build can take it. Read `atmos/README.md`. **Used by** `settlements/iziz` (city target; its `build.py`
reads it through `TARGET_CORE`).

## `sockets/`

The cultural socket and banner/awning system: buildings declare sockets, a culture pack fills them (Iziz, Republic, Voth, Yuni, Beast Riders, generic). A worked example, `sockets/example/`,
builds a sheet of the same wall in every pack. Read `sockets/README.md`. **Used by** `kits/post-apoc` (its `build.py` reads `37-sockets.js`, `38-symbols.js` and `80-cultures.js` from here; a local copy with the same name overrides) and, for the symbols alone, `kits/catalog` (vendored as `krator-symbols.js`).

## Planned: a material registry

This comes later, with the furniture kit and the Blender export. The plan is not
to merge the three systems into one implementation. **The seed of steps 1 and 2 exists** in
`kits/catalog/krator-asset-engine.js`: `CATALOG_MATERIALS` is the canonical list (timber, stone,
plaster, metal, rustSteel, glass, cloth, rope, thatch, foliage, skin, emissive, and since the
interiors furniture pass bamboo, reed, hyperMahogany, nacre, gold, bronze, lacquer, ceramic,
obsidian, jade, bone, hide, wicker, plastic), each with tags and the catalog family strings it
covers; `CORE_MATERIAL_MAP` says which `MAT.*` here and which `FAMMAT` family each name lands on.
Every catalog furniture piece declares its canonical names and `kits/catalog/verify.py` checks
them against what it builds. Instead:

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
