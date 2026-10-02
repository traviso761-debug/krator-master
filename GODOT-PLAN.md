# Krator to Godot: the audit and the port plan

The direction is set (`biomes/WORLD.md`, Travis, Oct 2026): three.js generates and previews, Godot runs the open
world. This file is the repo-wide plan for getting there. It says how to audit every module, which parts are
browser-native and get quarantined or retired, which parts cross over as data, and in what order. The per-module
contracts already written stay the authority for their modules: `biomes/GODOT.md` (flora), `core/atmos/GODOT.md`
(the air), `settlements/yuni/GAME_EXPORT.md` (buildings, doors, interiors). `TODO.md` tags each feature idea
with the same four tags this plan uses.

Survey numbers below were taken on 2026-10-02 from `src/`, `targets/` and `core/` (not `dist/`, `host/`,
`archive/`).

## 1. Where things stand

What already crosses over, or is scaffolded to:

| Module | State | Exporter / contract |
|---|---|---|
| `core/biome/` (flora, fauna) | engine-neutral placement on Float32 stores; a shader hook per material kind | `BIO.export()` writes items, buckets, materials, textures (PNG) as `krator-biome` JSON. `biomes/GODOT.md` maps items to MultiMesh, buckets to ArrayMesh |
| `core/atmos/` | presets are data, particles are stateless, time comes from one clock | `ATMOS.export()`: uniforms become global shader parameters, fx records become nodes. `core/atmos/GODOT.md` has the shader translation table |
| `kits/interiors/` core (`src/10-49`) | no THREE, no DOM, runs in node | the room graph, walls, openings and the furniture grid are plain objects |
| `settlements/yuni` fixtures | buildings, doors, windows, lights, interiors as tagged records with stable ids | `KRATOR_EXPORT.building()`, `.fixtures()`; glTF extras carry tags, `-col` names carry collision |
| `kits/catalog/` | 1503 furniture pieces as SPEC entries: family string plus colour, tags, size, anchor | no exporter yet; the entry shape is the data |
| `core/sockets/` | a building declares sockets, a culture pack fills them | data side is the socket list; the packs draw with 2D canvas |
| `core/terrain/36-core-carve.js` | floor and blocker lists as the carve builds | node test exists; no exporter |
| `core/lod/` | runtime LOD over a finished scene | Godot-native; nothing to port |

What does not cross over today, by size:

| Hot spot | Measure | What it means |
|---|---|---|
| Host shells copied per build | `camera.js` in 16 builds, `sky.js` in 11, `probe.js` in 15, `stats.js` in 10, the `host-*` set in 10 biome kits | the browser-native code is not in one place; it is vendored into every build and drifts |
| Terrain field | 39 definitions of `terrainH` | every world's ground is a closure in JS, not a heightmap plus a rule |
| Random and noise | 26 definitions of the PRNG and noise family (`fbm`, `vnoise`, `h3`, `mulberry32`...) | a Godot generator cannot reproduce a placement unless it has the same bit-exact generator |
| Canvas-painted textures | about 700 `canvasTex` calls across builds; 86 in `kits/ancients` alone | 2D canvas is browser-only; each painter is code, not a texture definition |
| Shader hooks | `onBeforeCompile`, `ShaderMaterial` and GLSL in every build (65 in Voth, 63 in Yuni and Girder) | each is a hand rewrite into `.gdshader` |
| The life layer | Voth `78a..79c`, about 500 KB; Girder, Locus, Mav's Refuge, Yuni have their own | agents, nav grids and collision are written against THREE meshes and `Raycaster` (137 uses in Voth) |
| Materials | three incompatible vocabularies: `MAT` (Ancients lineage), `PAL`/`FAMMAT` (Voth, Yuni, Locus, Girder, Mav's), catalog family strings | no single material table to export |
| Three.js r128 | pinned in every page head | the API surface the port rewrites is fixed, which helps |

## 2. The four tags

Every fragment, and every top-level function inside a big fragment, gets exactly one of the tags `TODO.md` already
uses. The audit is the act of assigning them.

| Tag | Meaning | What happens to it |
|---|---|---|
| **[G data]** | an algorithm or data that is the same in any engine: layouts, placement rules, PRNG, noise, terrain fields, tags, schedules, nav grids, presets, the catalog entries | the valuable part. Keep it pure, give it a node test, export it, port the algorithm to GDScript where Godot must regenerate it (flora per tile), else ship the data |
| **[G shader]** | a shader trick | rewrite once into a shared `.gdshader` or `.gdshaderinc`; keep the three.js copy for preview |
| **[G native]** | Godot has it built in: LOD, frustum culling, fog, lights, day/night, picking, pointer lock, collision from meshes | keep for the three.js preview; port nothing; do not improve it further in three.js |
| **[web]** | browser or three.js only: DOM, canvas 2D, `requestAnimationFrame`, the camera, the inspector, the polygon tool, the probe, the error panel, verify harnesses | quarantine into one shared host shell (`core/host/`), so no build's own `src/` contains any. Retire whatever the shell makes redundant |

A fifth working label, **[draw]**, marks a three.js geometry builder (the `build*()` functions, `kdef()`, the
`mk*` kit). It is not a port target as code. Its *output* crosses over through the exporter as meshes. It is
listed so the audit can tell "builder" from "host" and from "data" inside one fragment. A builder is only a
problem when it does the data work too (decides *where* things go, or what they are), and the audit's main
finding per build will be the list of builders that need splitting into a data pass plus a draw pass.

## 3. The audit

### 3.1 The tool

`tools/audit_port.py`, run from the repo root like `tools/make_index.py`. For every build and `core/` module it:

1. Scans each fragment for API families and counts them: `THREE.`, canvas 2D (`getContext('2d')`,
   `canvasTex`, `CanvasTexture`), DOM (`document.`, `innerHTML`, `.style.`, `getElementById`), events
   (`addEventListener`, pointer lock), the frame loop (`requestAnimationFrame`, `performance.now`), shader
   hooks (`onBeforeCompile`, `ShaderMaterial`, `gl_FragColor`, `#include <`), `InstancedMesh`, `Raycaster`,
   storage and network (none today; the scan keeps them so it stays zero).
2. Assigns a provisional tag from the counts and the filename family (`camera`, `sky`, `probe`, `inspect`,
   `polytool`, `sheetui`, `stats`, `host-*` are [web]; `kit`, `kitdefs`, `*-mat`, `texture` are [draw] or
   [G shader]; `layout`, `registry`, `life*`, `nav`, `palette`, `presets`, `terrain` are candidates for
   [G data]).
3. Reads an override file per build, `PORT.md`, where a person confirms or corrects the tag per fragment and
   lists the functions to split. The tool rewrites the table in `PORT.md` and leaves the notes.
4. Writes `PORT-INDEX.md` at the root: one row per build with KB by tag, the drift score of its host shell
   against `core/host/`, and what it still lacks (no exporter, no tags, no node test).

The first survey (section 1) is the hand-run version of step 1. Step 2 is cheap and will be mostly right:
the browser-native code is concentrated. The top of the DOM-density list is nothing but `92-camera.js`,
`80-camera.js`, `90-host-camera.js`, `21-sky.js`, `93-polytool.js`, `89-sheetui.js`, `86-inspect.js`,
`83-walk.js` and `92-hover.js`.

### 3.2 What the audit answers per build

- Which fragments are host shell, and how far they have drifted from the others' copies.
- Which builders decide placement or identity inside the draw code (the split list).
- Which globals the build's data depends on that are not in `core/` (its own PRNG, noise, `terrainH`,
  palette, registry).
- What the build registers for the inspector (name, class, tags) and whether that registry is complete:
  the inspector's registry is the tag source for the export.
- Whether the build has an exporter, a probe (`window._api`, 41 builds do) and `verify.py --assert`
  invariants that can double as the port's golden test.
- Which textures its materials need, by painter: `h3`/`vnoise`/`fbm` only (shader-expressible), `rng()`
  (seeded; bake to PNG), image-like painters (bake to PNG).

### 3.3 Order of audit

Audit in the order the port will consume them, so each audit feeds a phase that starts right away:

1. `core/` (every module; most are already tagged by their READMEs).
2. The biome kits (nine, all on one core, the smallest delta per kit).
3. `kits/catalog`, `kits/interiors`, `kits/post-apoc`, `kits/ringsea` (self-contained, data-shaped).
4. The Ancients lineage (`kits/ancients`, `iziz`, `highlands`, `xanadu`, `reedlake`, `dalab`, `screamers`,
   `port`, `jimjam`): one material and texture system, shared host shell.
5. The Voth lineage (`voth`, `yuni`, `locus`, `girder`, `mavs-refuge`): the life layers and `PAL`/`FAMMAT`.
6. `shade` (sedesert biome plus a settlement; the two kinds in one page).

## 4. The phases

Each phase lists what it produces and what "done" means. Phase 0 is done. Phases 1 to 3 are independent of one
another and can run in parallel; 4 to 6 build on them; 7 is the Godot side and starts as soon as Phase 1 gives it a
first tile.

### Phase 0: freeze and baseline (done 2026-10-02)

- **The hash baseline.** `PORT-BASELINE.json` holds the SHA-256 of every built page (103: every
  `dist/*.html` and the sockets example). `python3 tools/port_baseline.py` compares a fresh rebuild with it
  and exits 1 on any difference; `--write` records a new one. Every build is deterministic, so a refactor
  in the phases below must either leave this check green or show a screenshot diff before rewriting the
  baseline. (`settlements/port/dist/` is gitignored but still hashed: the rebuild reproduces it.)
- **The audit tool.** `python3 tools/audit_port.py` writes a `PORT.md` per build (and one for `core/`) with
  one row per fragment: KB, the API-family counts, a tag and a note, and `PORT-INDEX.md` at the root with
  KB per tag per build, which builds have an exporter, a probe and `--assert`, and the host-shell copies
  table (how many builds carry each host family and how many byte-distinct versions). Tags are provisional
  from the counts and the filename family; a person corrects the Tag and Note cells and a rerun keeps them
  (`--reset` retags). The `core/` tags were set by hand from section 5. A note starting "split" marks a
  fragment that mixes data with drawing or host code: the audit's main finding per build.
- **The lint.** `python3 tools/check_port.py [build]`: a fragment tagged `[G data]` must not touch the
  browser (DOM, canvas 2D, input, `requestAnimationFrame`, `performance.now`, storage, network). A
  `[G data]` row noted "split" only warns until it is split. Every `build.py` runs it on its own folder
  before building and stops on a failure (`--no-checks` skips it, like the other checks). It is green on
  every build today, with seven warnings in `core/` (download helpers, the weather `<select>`, two timing
  reads) that Phase 1 moves to the host.

First numbers from the provisional tags (`PORT-INDEX.md`): 1,244 fragments, 16.1 MB of source; 28% `[G data]`,
46% `[draw]`, 21% `[web]`, 3% `[G shader]`, 3% `[G native]`; 125 fragments noted "split". The host-shell
table confirms the drift: `camera` has 12 versions over 16 builds, `probe` 12 over 15, and every biome kit's
`host-*` set is its own version.

Done when: ~~`PORT-INDEX.md` exists, every build has a `PORT.md`, the hash baseline is recorded.~~ Done.
What remains of the audit is the human pass over the provisional tags, build by build, in the order of
section 3.3 (core is done), writing the split lists into each `PORT.md`'s Notes.

### Phase 1: one host shell (the [web] quarantine)

The browser-native code becomes one module, `core/host/`, that a build takes the way it takes `core/lod/`
(a list in `build.py`; a local copy overrides, and the override is recorded in `KNOWN_ISSUES.md`):

| Fragment | Replaces | Notes |
|---|---|---|
| `90-host-camera.js` | 16 `camera.js` copies | fly and walk modes, pointer lock, key guards (the TODO's input guards land here once) |
| `91-host-loop.js` | the render loops | one frame loop with per-subsystem error isolation (TODO), `_ready`, N-frames-since-ready for verify |
| `92-host-panel.js` | error panel, stats, loader | |
| `93-host-inspect.js` | 5 `inspect.js`, `92-hover.js` | reads the tag registry (Phase 2) and nothing else |
| `94-host-polytool.js` | `93-polytool.js` copies, `93-polygon.js`, nhighlands' path tool | the biome tool's seed |
| `95-host-probe.js` | 15 `probe.js` copies | `window._api`, built from the registry and the exporters |
| `96-host-sheet.js` | `89-sheetui.js`, catalog sheet UI | |
| `tools/harness.py` | the harness block in 25 `verify.py` files (TODO) | one copy, imported by each `verify.py` |

The sky (`21-sky.js`, 11 copies, about 55 KB each) is [G native] plus one [G shader] (the gas giant and sun
discs) and moves to `core/atmos/` as a sky preset, not to the host.

Rules the shell enforces: the host owns the DOM, the camera, time, input and picking. A build hands it
`{scene, terrainH, registry, exporters}` and gets `{hour, clock, camera}` back. A build fragment that
touches `document` outside `core/host/` fails `check_port.py`.

Done when: every build lists `core/host/` and keeps no `camera`, `probe`, `inspect`, `polytool`, `stats`
or `sheetui` fragment of its own; each page's screenshots are unchanged; `check_port.py` is on for the
whole of `src/` in every build. Nothing has been ported yet, but every remaining byte in `src/` is now
[G data], [draw] or [G shader].

### Phase 2: the engine-neutral substrate

Three small `core/` modules, each with a node test and a GDScript twin checked against the same golden
vectors:

1. **`core/rand/`**: one PRNG (a 32-bit integer generator, `mulberry32` or `sfc32`, so the arithmetic is
   exact in both engines), one hash (`h3`), value noise and `fbm`, with reseed and the per-cell seeding
   `biomes/GODOT.md` lists as not done. Golden file: the first 1000 draws for 20 seeds, and noise at 1000
   points. The 26 local copies are retired build by build; a build whose stream changes re-baselines its
   hash with a screenshot diff. Note that Math-library noise (`Math.sin` based hashes) is not portable
   bit for bit; the port replaces it, so this is the one phase that is expected to move rubble.
2. **`core/terrain/`** grows a `TERRAIN` field: a heightmap (Float32, metres, a grid at a fixed step) plus
   named carve patches and water levels, with `terrainH(x,z)` as bilinear sampling of it. A world either
   paints its heightmap from its present closure once (the 39 `terrainH` closures become bakes) or, for the
   open world, reads a tile of the scale model. Exports: 16-bit PNG or EXR heightmap, water level, the
   carver's floor and blocker list (Godot order item 1 in `TODO.md`), a land-cover map (item 2).
3. **`core/tags/`**: the registry. One record per placed thing: `id` (deterministic, in build order, like
   Yuni's), `name`, `class` (building, flora, fauna, furniture, prop, life, infrastructure), `tags`
   (culture, biome, Köppen, type, harvest, indoor/outdoor), `transform`, `footprint`, `parent`. The
   inspector reads it; the exporter writes it as glTF extras; the minimap draws from it. `BIO.register`,
   Voth's `PLACED`, Yuni's `FIX.*` and the catalog's entries all map onto it.

Done when: each module has `test-*.js` passing in node and a `.gd` twin passing the same vectors in
Godot's headless test runner; at least one build of each lineage runs on all three.

### Phase 3: textures and materials as data

- **Textures.** Every `canvasTex` painter is classified by the audit. Three dispositions:
  - painters on `h3`/`vnoise`/`fbm` only: express as a `TEX.def({kind, params})` record, painted in three.js
    by one of a handful of core painters and in Godot by one `.gdshader` per `kind` (or a
    `NoiseTexture2D` where it fits);
  - painters that call `rng()` or draw pictures (the culture symbols, signs, the gas giant): bake to PNG at
    export; the export already carries textures as PNG data URLs, so this is the cheap default;
  - painters only a dev tool uses: [web], no action.
  Rule for new work: a texture is a `TEX.def` record or a PNG bake; a bespoke painter is the exception and
  is tagged.
- **Materials.** One material vocabulary over the three in use: `{family, colour, map, roughness, metal,
  emissive, doubleSided, alphaTest, hook}` where `hook` names a shader from the shared library. `MAT`,
  `FAMMAT` and the catalog's family strings become adapters onto it; the export writes it; Godot reads it as
  a `StandardMaterial3D` or one of the library shaders.
- **The shader library.** `core/godot/shaders/`: `atmos.gdshaderinc` (already specified), foliage card, bark,
  animated fauna body, world-unit UV (triplanar or world-space UV: `vWorldUV` is [G native] in Godot), the
  flag, the glass Fresnel, the water. Each three.js hook in `core/` names the shader it corresponds to.

Done when: a build's export carries a material table a Godot importer can apply without reading JS, and
no new `canvasTex` painter is added without a `TEX.def` or a bake.

### Phase 4: one exporter

Generalise `BIO.export()`, `ATMOS.export()` and `KRATOR_EXPORT` into `core/export/`: one `krator-world`
JSON per build (or per tile with `{box}`), with:

- `items` (instanced sets, unit geometry once, matrices, colours, extras) and `buckets` (merged meshes), as
  the biome export does today, for every build's `kbake`/`pbFlush`/`BIO.bake` output;
- `materials`, `textures` (Phase 3);
- `registry` (Phase 2) joined to items and buckets by id, so every mesh carries its tags;
- `terrain` (Phase 2), `atmos`, `fixtures` (Yuni's records), `interiors` (the room graph), `sockets`;
- `sim` (Phase 5).

Then the converter: `tools/godot/krator_import.py` writes `.glb` (meshes, MultiMesh instancing through
`EXT_mesh_gpu_instancing`, extras) plus a `.tscn` or a Godot `addons/krator/` importer that reads the JSON
directly. The verify harness drives the export headless, so every build's CI run can emit its tile.

Done when: one build per lineage (a biome kit, `iziz`, `voth`) opens in Godot from its export with the
right materials, tags on every node and the terrain under it.

### Phase 5: the simulation layer as data

The README's rule ("never encode a world rule solely in the visual implementation") is the port's rule for
the life layer. Voth's is the reference and the biggest. Split it into:

- **data**: the nav grid (and the strider's), walk solids and collision volumes (the carver's list form),
  factions and sub-factions, jobs, schedules (hour to activity), activity sites (`Market: TRADE, capacity
  20`), routes, spawn tables, the door-transit rule's door list;
- **runtime**: the agent update, the A\* and local avoidance, the animation rigs.

The data goes through the exporter (`sim` key): the nav grid as a Godot `NavigationMesh` source or an A\*
grid resource, solids as collision shapes, schedules and factions as `.tres`. The runtime is rewritten once
in GDScript against the same data. The three.js runtime becomes the reference: for a fixed seed and N ticks,
the agents' positions are a golden trace the Godot runtime is tested against (loosely, within tolerance;
float paths differ).

Girder, Locus, Mav's Refuge and Yuni's layers are brought onto the same data shape, not ported separately.

Done when: Voth's `78a-78j` and `79a-79c` fragments read their world from exported data and so can the
Godot runtime; one agent class (citizens) walks the same routes in both.

### Phase 6: retire what Godot does natively

Stop investing in, and where it simplifies the host shell, remove:

- `core/lod/` (keep as the preview's LOD; no port, no further features);
- per-build day/night light rigs, fog and glow layers once `core/atmos` presets cover the look;
- `Raycaster`-based picking and walk-mode collision in the life layers (Phase 5 moves them to data);
- the underground toggle, cut planes, shadow-map tricks (the TODO's [G native] items).

Nothing in this phase is deleted while a build still needs it to preview. "Retire" means tag [G native],
freeze, and do not copy into new builds.

### Phase 7: the Godot project

`godot/` in this repo (Godot 4.x, Forward+; Compatibility only if a web export is wanted):

- `addons/krator/`: the importer (Phase 4), the tag metadata, collision from `-col` and from the carver's
  list, `visibility_range` from the LOD records;
- `autoload/Atmos.gd` and the global shader parameters (`core/atmos/GODOT.md`);
- `shaders/` (Phase 3);
- `biome/`: the tile generator, a port of `core/biome` placement on `core/rand`, tested tile for tile against
  exported golden tiles (`biomes/GODOT.md`, "What a port is tested against");
- `sim/`: the agent runtime (Phase 5);
- `tests/`: the golden-vector tests of Phase 2 and the tile and trace comparisons.

Done when: a tile exported from a biome kit and a settlement load, stream and run in one scene, and the
golden tests pass in CI.

## 5. Disposition by module

| Module | Tag | Disposition |
|---|---|---|
| `core/biome/` 10, 20, 40 | [G data] | port placement to GDScript (Phase 7); stays the reference generator |
| `core/biome/` 30, 35 | [G shader] | foliage, bark, fauna shaders in the library |
| `core/biome/42-core-export.js` | [G data] | folds into `core/export/` |
| `core/atmos/` 0, 0p, 4 | [G data] | the autoload; presets as resources |
| `core/atmos/` 1, 2, 3, 5, 6 | [G shader] / [G native] | per the table in `core/atmos/GODOT.md` |
| `core/atmos/7-cull` | [G native] | retire |
| `core/atmos/8-export` | [G data] | folds into `core/export/` |
| `core/lod/` | [G native] | keep for preview; no port |
| `core/materials/20-textures.js` | [draw] | the painter set behind `TEX.def`; what it paints becomes records or bakes |
| `core/materials/22, 68, opt/69a` | [G shader] / [G native] | material table plus the world-UV shader |
| `core/sockets/37` | [G data] | socket declarations and packs as data |
| `core/sockets/38, 80` | [draw] | symbols and signs bake to PNG |
| `core/terrain/36-core-carve.js` | [G data] | export floors and blockers; first Godot order item |
| `kits/interiors/` core | [G data] | already pure; add the export; port the planner later if rooms are to be generated in Godot |
| `kits/interiors/` demo, views | [web] | host shell |
| `kits/catalog/` entries | [G data] | export entries; the `mk*` geometry kit is [draw] and exports as meshes |
| `kits/catalog/` sheet, hover, polygon | [web] | host shell |
| `kits/post-apoc`, `kits/ringsea` | [draw] + [G data] | builders export as meshes; their `92-camera.js` goes to the host |
| `kits/ancients` and lineage | [draw] + [G data] + [G shader] | split builders (section 3.2); `MAT`/`TEX` onto Phase 3; `targets/` are data already |
| Voth lineage life layers | [G data] + [web] | Phase 5 |
| `21-sky.js` (11 copies) | [G native] + one [G shader] | sky preset in `core/atmos` |
| `gallery/`, `host/`, `host/WorldMenagerie/` | [web] | out of scope; the gallery stays the preview's front door |
| `archive/`, `wip/` | none | untouched |
| `tools/scale-model/` | [G data] | the world's heightmap source; feeds `core/terrain` |

## 6. Rules for new work, from now

These go into `README.md`'s design rules and `check_port.py` as they become enforceable:

1. No `document`, canvas 2D, `requestAnimationFrame` or input handling outside `core/host/`.
2. Random numbers and noise come from `core/rand/` only.
3. Ground height comes from `core/terrain/` only.
4. Everything placed is registered in `core/tags/` with its class and tags, before it is drawn.
5. A builder takes a record and draws it; it does not decide where it goes or what it is. Placement is a
   pass that writes records; drawing is a pass that reads them.
6. Textures are `TEX.def` records or PNG bakes. Materials use the shared vocabulary.
7. A shader hook names its library shader and reads only presets and global uniforms.
8. World rules are data: factions, schedules, activities, capacities, routes (the README's rule).
9. Any new `core/` module ships a node test, and a GDScript twin when Godot must run the same algorithm.
10. New builds take `core/host/`, `core/rand/`, `core/terrain/`, `core/tags/` and `core/export/` from the
    start; a build without an export is not finished.

## 7. Risks and the calls already made

- **Determinism across engines.** JS doubles and GDScript floats differ; `Math.sin`-based hashes are not
  reproducible. The call: integer PRNG and integer hashes (Phase 2), tolerance-based golden tests for
  anything that touches trigonometry, and the three.js export as the reference rather than bit equality.
- **Moving rubble.** Replacing a build's PRNG changes that build's world. Do it one build at a time, with
  a before and after screenshot set, and accept the change; do not try to keep the old streams alive.
- **Colour space.** The biome export is linear, the atmosphere export is sRGB (each says so). The unified
  export (Phase 4) carries one `convention.colour` field per table and the importer converts once.
- **Scale of canvas painters.** About 700 painters is too many to rewrite. Bake by default; only promote a
  painter to a `TEX.def` kind when several builds share it.
- **Three material systems.** Do not merge them in three.js. Write adapters onto one export vocabulary and
  leave the pages as they are.
- **The life layers are big and bespoke.** Phase 5 is the largest single piece. Start with Voth's citizens
  (routes, schedules, the door-transit rule) and prove the data shape before touching ships and the arena.
- **Renderer.** Forward+ is assumed. If a web export of the Godot project is wanted, the sprite fallbacks
  in `core/atmos/GODOT.md` apply and `GPUParticles3D` features need checking per version.
- **What is not worth porting.** The gallery, the LAN host, the Menagerie, the verify harnesses and the dev
  tools. They are the preview's tooling and stay in the browser.

## 8. Milestones

| Milestone | Proves |
|---|---|
| M1 audit | `PORT-INDEX.md`, a `PORT.md` per build, `check_port.py` running (Phase 0) |
| M2 shell | one `core/host/`, no camera/probe/inspector copies left, hashes or screenshots unchanged (Phase 1) |
| M3 substrate | `core/rand`, `core/terrain` field, `core/tags` with node tests and GDScript twins (Phase 2) |
| M4 first tile | a biome kit's tile opens in Godot from `core/export` with materials and tags (Phases 3, 4, 7 start) |
| M5 first city | Iziz exports and opens: buildings, atmosphere, terrain, interiors (Phase 4) |
| M6 first citizens | Voth's citizen layer runs in Godot from exported sim data (Phase 5) |
| M7 one world | two kits and one settlement stream together in Godot from the scale model's terrain (Phase 7, `biomes/WORLD.md`) |

M1 to M3 are repo hygiene and can be done without Godot installed. M4 is the first point where the Godot
project exists and the port is testable end to end; everything after it is iteration on the same pipeline.
