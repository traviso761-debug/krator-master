# core/

Code shared by more than one build, kept here once instead of copied into each:
`materials/` (the Ancients-lineage materials), `biome/` (the biome core every biome kit
runs on), `terrain/` (carve patches for any heightfield world), `atmos/` (atmosphere and street dressing) and `sockets/` (cultural sockets).

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

## `biome/`

The biome core: the engine-independent kit every biome in `biomes/` is written against
(`BIO`: the host binding, the PRNG and noise, instanced items and merged buckets, the
foliage hook, placement, the runtime LOD, kits, export). One copy, merged from the nine
copies the kits carried (Oct 2026). xanadu's is the base (runtime LOD); the others'
additions are in it, each marked with the kit it came from:

| File | What |
|---|---|
| `10-core-head.js` | `BIO`, `BIO.fn` (rng, noise...), `BIO.init` and the host binding: fields (wet, salt, upland, flow, mist, cold, rock), `waterH`/`depth`, `register`, detail radii (`BIO.radii()`), windows, `eye` |
| `20-core-kit.js` | kits (`BIO.kit`, `BIO.kitEnd`), items and buckets on Float32 stores, extra per-instance vec4s, the runtime LOD (`BIO.LOD`, `BIO.range`, `BIO.lodTick`), indexed bake, `BIO.dynamic`/`BIO.tick` |
| `30-core-foliage.js` | leaf textures and cards, the foliage and bark hooks, the wind clock, `BIO.col` |
| `35-core-anim.js` | animated items (orbit, flit, walk; flapping wings, swinging legs) for fauna |
| `40-core-place.js` | stands, `BIO.grid` (accept first, `depth`, `box`), `BIO.scatter`, keep-clear, surface sampling for `dress()` (`BIO.faceSamples` takes shells: `{geos, share}`) |
| `test-place.js` | `node core/biome/test-place.js`: the surface sampler's contract, each check with a negative |
| `42-core-export.js` | `BIO.export()` / `BIO.download()`: what a page placed, as data for Godot (`biomes/GODOT.md`) |

**Used by** all nine kits in `biomes/`: each lists the files in `CORE_BIOME` in its
`build.py`, read from here unless its `src/` has a copy of the same name (none does).
hyperjungle also lists `35-core-anim.js`, and takes the core's helpers as globals in its
own `41-hyperjungle-globals.js` (it was written when the core declared them). `build.py`
stops if any of the four base files is missing (the syntax check cannot see an absent fragment).

**Kits.** Several kits can share one page (`biomes/WORLD.md`). Each kit calls
`BIO.kit('<name>')` at the top of its first fragment and `BIO.kitEnd(<API>)` at the end of
its last: it gets its own registry of items and buckets (two kits may both have a `trunk`),
its exported functions run in that registry, and material cache keys carry its name
(`BIO.kitKey`), so two kits' `grass` cannot share one compiled shader. Mesh names stay
`biome:<name>`; `userData.kit` says whose.

**`BIO.LOD`** is both the runtime LOD's settings (`chunk`, `scale`) and, called, the detail
radii (sedesert's `BIO.LOD()`, the same as `BIO.radii()`), so sedesert's fragments and
Shade's copies of them run unchanged.

**Proving a change.** The page's HTML changes with the core, so its hash proves nothing.
Compare the baked geometry instead: every biome mesh's attributes and instance buffers,
hashed per mesh name, before and after (fauna moved every frame by a script are hashed by
their geometry only). Identical means the change moved nothing.

Worlds that vendored a kit (dalab from swlowlands, locus and the Ancients kit from
eastabyss, iziz, screamers and the Ancients kit from hyperjungle, Shade from sedesert, the
xanadu settlement) keep their copies. dalab's, iziz's and Shade's `--vendor-check` compare
their core with this folder and report the drift; each records it in its `KNOWN_ISSUES.md`.
Re-vendor when that world is next rebuilt and verified, or switch it to read this folder.

`biomes/WORLD.md` is the plan this core grows toward: several kits in one open world, and
Godot (`biomes/GODOT.md`).

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
