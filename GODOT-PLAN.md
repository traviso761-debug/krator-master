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
| `kits/catalog/` | 1503 furniture pieces as SPEC entries: family string plus colour, tags, size, anchor, role, `job` (`FURN_JOBS`) | no exporter yet; the entry shape is the data |
| Catalog furniture placements | six builds place every piece of furniture as a record `{key, variant, seed, local and world transform, building, room, setting}`: Highlands (`89y-hl-furnish.js`), Locus (`66-locus-furnish.js`), Girder and Mav's Refuge (`53-furnish.js`), Post-Apoc (`91f-furnish.js`), the catalog's buildings (`F.furn`) | no exporter; six near-copies of the same glue, each mixing the record pass with the three.js batch (Girder's two are noted "split" in its `PORT.md`) |
| `core/sockets/` | a building declares sockets, a culture pack fills them | data side is the socket list; the packs draw with 2D canvas |
| `core/terrain/36-core-carve.js` | floor and blocker lists as the carve builds | node test exists; no exporter |
| `core/lod/` | runtime LOD over a finished scene | Godot-native; nothing to port |
| `core/simulation/` | documents only: `ROADMAP.md`, `PLAN.md` | the life layers' shared vocabulary and `SIM.export()` (`krator-sim`), planned as the fourth exporter |

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
| Placement masks on canvas | Iziz (`85-city-paint.js`), Dalab (`85-city-paint.js`), Erewhon (`85-er-paint.js`) and Roketstad (`85-rk-paint.js`) paint roads and footprints into 2D canvases and read them back with `getImageData`; `canBuild` is a pixel threshold | where a city's buildings stand depends on how the browser anti-aliases a stroke. Godot cannot reproduce it, and GPU and CPU canvases already disagreed (Dalab placed 875 or 882) |

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
2. The biome kits (nine, all on one core, the smallest delta per kit). Findings so far, and what this plan
   changes for them: `biomes/WORLD.md` ("Against the port plan") and `TODO.md` ("Biomes: the port plan's
   findings").
3. `kits/catalog`, `kits/interiors`, `kits/post-apoc`, `kits/ringsea` (self-contained, data-shaped).
4. The Ancients lineage (`kits/ancients`, `iziz`, `highlands`, `xanadu`, `reedlake`, `dalab`, `screamers`,
   `port`, `jimjam`): one material and texture system, shared host shell. **Iziz first** (city kits review,
   Oct 2026): it is the M5 city, so its split list sets that milestone's scope. Two provisional tags there are
   wrong and should be corrected first: `targets/city/90b-city-build.js` (43 KB) and Dalab's
   `targets/city/90b-city-build.js` are tagged [web] but run the city's placement and build passes; they are
   [G data] + [draw] to split. Before the lineage's audit and its Phase 3 work, re-vendor the chain once
   (Ancients to Iziz to Highlands to Xanadu and Reed Lake, and Jimjam; open since main's Ancients work on
   2026-10-01, recorded in `settlements/iziz/KNOWN_ISSUES.md`), with a new hash baseline and a screenshot diff,
   so the tags and the material adapters are written against matching copies, not done twice.
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

**The world clock (contract; approved by Travis 2026-10-02).** Four time sources are about
to exist side by side: each life build's `SKY_T`/`skyHour()` with `TICKS.push(fn(dt, hour))`, `ATMOS.clock`,
`KSCHED` (pure functions of t), and `SIM`'s fixed-rate stepper (`core/simulation/PLAN.md` 4.5). They become one
clock, owned by `91-host-loop.js`, and everything else reads it. The clock itself is `core/clock/20-core-clock.js`
(`KCLOCK`, node test `test-clock.js`); Iziz's city is its first user:

| Field | What | Read by |
|---|---|---|
| `dt` | real seconds since the last frame, capped at 0.1; 0 while paused or pinned | everything that eases (weather, fades) |
| `t` | **motion time**: seconds since load, `t += dt * scale`; `scale` 0 pauses, `fixed` pins it for shots | wind and gusts, particles, flags, `KSCHED` timelines, agents' `pose(t)` between decisions, walking speed |
| `hour`, `day` | **world time**: the hour of day (0..24) and a day count, advancing `rate` world hours per real hour (`rate` 0 holds the hour: today's preview default, set by the slider or `#hour=`) | the sky and sun, light schedules (`litAt`), weather's auto mode, `SIM.step()` once per simulated minute, life schedules |

- The two axes are separate on purpose: a fast day (`rate` 60, an hour a minute) must not make people walk or
  smoke rise 60 times faster. Motion keys off `t`; anything that cycles daily keys off `hour`.
- The host calls each subscriber as `fn(dt, clock)`. `ATMOS.init` already takes `dt` as the first argument of
  its `onFrame` call, and the life builds' `TICKS` already take `(dt, hour)`, so both bind without changes to
  their bodies. `ATMOS.clock` becomes a view onto the host's (`scale` and `fixed` move up); `SIM.init({hour,
  onTick})` takes the same; Shade, which has schedules and no clock, gets one by taking the host.
- Godot: one autoload, `WorldClock.gd`, advances the same fields in `_process(delta)` and sets the global shader
  parameters `atm_time` and `atm_hour`; `Atmos.gd` and the sim runtime read it. Saved games store `{t, day,
  hour, rate}`.
- **One world day is 72 real minutes** (Travis): `rate` 20, a world hour every 3 real minutes.
- **The preview pages hold the hour still by default** (Travis), and the viewer can run time and set it: an hour
  slider and a Run time / Hold time button (Iziz: the toolbar; `#time=run` starts it running). The host shell
  carries both controls once Phase 1 lands; until then each build that takes `core/clock` adds them.

Done when: every build lists `core/host/` and keeps no `camera`, `probe`, `inspect`, `polytool`, `stats`
or `sheetui` fragment of its own; each page's screenshots are unchanged; `check_port.py` is on for the
whole of `src/` in every build. Nothing has been ported yet, but every remaining byte in `src/` is now
[G data], [draw] or [G shader].

### Phase 2: the engine-neutral substrate

Five small `core/` modules, each with a node test (and, where Godot runs the same algorithm, a GDScript
twin) checked against the same golden vectors:

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

4. **`core/furnish/`**: one furniture glue in place of the six copies (Oct 2026 review). A **placement pass**
   with no THREE and no DOM turns `FURNISH(key, lx, ly, lz, lry, {v, seed, setting})` and the interiors hook
   (`KratorInteriors.sets.furnish`) into records, written as `core/tags` entries of class `furniture` with a
   deterministic id, the building's id, the room's id and the piece's `job`. A **draw adapter** per build gives
   the frame (its local-to-world rule) and hands the records to the catalog runtime's batch for the preview. The
   `?interiors=1` / `?furniture=0` switches, the missing-key count, the sRGB-to-linear colour step (three of the
   six copies had to add it) and the frame-shift table (Mav's Refuge's `BRF_SHIFT`) live in it once. Each build
   keeps its `FURNISH` name, so no builder changes; the build's glue fragment shrinks to its adapter. Node test:
   a fixed list of calls gives the same records.

5. **`core/mask/`**: the cities' placement raster in place of the canvas masks (city kits review, Oct 2026).
   A Uint8 grid over the city at a fixed step, with integer stroke and polygon fill (roads at their width,
   footprints, precincts, water) and `canBuild(x,z)` as a grid read, so placement is [G data] and identical in
   node, any browser and GDScript. The four painters (`85-city-paint`, `85-er-paint`, `85-rk-paint`) keep
   their canvases only to draw the ground texture for the preview, from the same strokes. Node test: a fixed
   set of strokes gives the same grid hash. Expected to move rubble once per build (accept it with a screenshot
   diff, as for `core/rand`). It replaces the Dalab stopgap (`willReadFrequently` to keep the canvases on the
   CPU), and it is the likely fix for Erewhon's open plot failures (the plot's front-edge test points fall
   inside the road's anti-aliased stroke): do it before or with the Erewhon session.

Done when: each module has `test-*.js` passing in node and a `.gd` twin passing the same vectors in
Godot's headless test runner; at least one build of each lineage runs on all three. For `core/furnish/`: the six
builds take it, their hash baseline is unchanged, and `check_port.py` passes its placement pass as `[G data]`.
For `core/mask/`: Iziz, Dalab, Erewhon and Roketstad place from it, no `getImageData` is left in a placement
path, and a GPU and a CPU load give the same placement hash.

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

- **Catalog furniture in the pilot.** Girder's furniture is catalog furniture, so the Girder pilot also maps the
  catalog's family strings (`wood plank bark stone plaster concrete metal rust glass cloth rope thatch ...`, about
  30, `CATALOG_MATERIALS`) onto library ids. Furniture is tinted by its culture's palette (`FPAL`), so it needs the
  muted copies of the sets (`--mute`), not the full-colour Beast Rider ones. Furniture is **not** textured in
  three.js: the preview's merged batches keep no UVs, and Godot applies the library through its triplanar option.
  The export carries, per piece, the family and its library record, and states that the catalog's colours are
  sRGB (`convention.colour`).

- **The city kits** (city kits review, Oct 2026). Where the painters are, and the order that covers most builds
  per change:
  - Ancients lineage: about 300 canvas painters (Highlands 72, Dalab 70, Xanadu 60, Reed Lake 55, Iziz 39).
    `70-hl-tex.js` is one byte-identical copy in Highlands, Dalab and Reed Lake, so it is the first painter set
    to move onto `TEX.def` (section 7: promote a painter when several builds share it). Then the two versions
    of `69b-vern-mat.js` and `71-hl-mat.js` onto the record adapters, with `opt/69a-world-uv.js` as the
    world-UV hook.
  - Voth lineage: few painters, but `47-texture.js` exists in five builds as five versions and `40-ground.js`
    in three as three. Reconcile the copies (or record each difference) before the Girder pilot hooks its own,
    so the pilot's adapter is written once.
  - The **second pilot is Iziz** (M5), after Girder. The library sets every city needs are scan sets, CC0:
    `stone.cut`, `plaster`, `brick`, `paving`, `roof.tile`, `earth.adobe`. Source them with Girder's six.
  - Re-harvest Yuni's furniture into the catalog after the vocabulary exists, so the six pieces added on
    2026-10-01 and the new `container-item` / `container-food` types go in once, in their final shape
    (`settlements/yuni/KNOWN_ISSUES.md`).

Done when: a build's export carries a material table a Godot importer can apply without reading JS, and
no new `canvasTex` painter is added without a `TEX.def` or a bake.

**Content and status: `core/materials/PLAN.md`.** That file holds the library itself: about 45 shared PBR
surfaces tinted per culture, culture pattern sheets, where each comes from (scan libraries, generated
images, procedural), the generation prompts, and the processing script `tools/textures/process.py`. Status
on 2026-10-02: nine Beast Rider sets processed into `core/materials/library/` and `patterns/`; next is the
Girder pilot (`TEX.def`, the record adapters, Girder's families pointed at the sets), then the six scan
sets and seven generated sets Girder still needs, listed with prompts in that file. Godot reads the sets
directly: colour, normal (OpenGL convention, which Godot expects) and roughness map onto
`StandardMaterial3D`, and world-unit tiling becomes its triplanar option.

### Phase 4: one exporter

Generalise `BIO.export()`, `ATMOS.export()` and `KRATOR_EXPORT` into `core/export/`: one `krator-world`
JSON per build (or per tile with `{box}`), with:

- `items` (instanced sets, unit geometry once, matrices, colours, extras) and `buckets` (merged meshes), as
  the biome export does today, for every build's `kbake`/`pbFlush`/`BIO.bake` output;
- `materials`, `textures` (Phase 3);
- `registry` (Phase 2) joined to items and buckets by id, so every mesh carries its tags;
- `terrain` (Phase 2), `atmos`, `fixtures` (Yuni's records), `interiors` (the room graph), `sockets`;
- `sim` (Phase 5).

- `furniture` (Oct 2026 review): the catalog's pieces and the placements of `core/furnish/`. Each piece is built
  once per variant and per **look**: a placement's seed is reduced to one of K looks per variant (K about 4, as the
  flora's baked variants), so placements share a mesh. A piece record carries its geometry, its entry (tags, anchor,
  size, role, job, family per material) and its lights as data; the catalog's painted panels (`F.decal`, canvas 2D)
  are baked to PNG. Placements are transforms by piece and look, which the importer turns into one MultiMesh per
  piece and look, far cheaper than the preview's merged batches. A catalog-only export (every piece, no
  placements) gives Godot the furniture library the interiors planner places from.

- Cities (city kits review, Oct 2026): `KRATOR_EXPORT` is the only city exporter, and its records (buildings,
  doors, windows, lights, interiors, furniture kit slots, each with a stable id and tags) are already the shape
  `core/tags` needs. Use it as the city template: give Iziz the same record shape for M5, from its `REGISTER`
  and its city placement records, rather than starting the city side of `core/export/` from the biome export.

Then the converter: `tools/godot/krator_import.py` writes `.glb` (meshes, MultiMesh instancing through
`EXT_mesh_gpu_instancing`, extras) plus a `.tscn` or a Godot `addons/krator/` importer that reads the JSON
directly. The verify harness drives the export headless, so every build's CI run can emit its tile.

Done when: one build per lineage (a biome kit, `iziz`, `voth`) opens in Godot from its export with the
right materials, tags on every node and the terrain under it.

### Phase 5: the simulation layer as data

**This phase is owned by `core/simulation/PLAN.md`** (on `main` since 2026-10-02, with Travis's roadmap in
`core/simulation/ROADMAP.md`). That plan surveys every life layer, defines the shared vocabulary (`SIM`:
factions, places with activities and slots, roles and schedules, actors, the NAV contract, routes as functions
of time), keeps hand-edited `world/*.json` as a source that `SIM.load()` applies over what the geometry
implies, and makes `SIM.export()` (`krator-sim`, written headless by `verify.py` to `dist/<name>.sim.json`)
the fourth exporter beside atmos, biome and Yuni's fixtures. What follows is the shorter statement this
plan made before that one existed; where they differ, `core/simulation/PLAN.md` wins.

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

Furniture feeds the places' slots: `core/simulation/PLAN.md` derives work and sleep slots from placed furniture
(`SIM.slotsFromFurniture`: a piece's `job` from `FURN_JOBS`, or an interiors walker target type: forge to SMITH,
bed to SLEEP, counter to SELL). The `core/furnish/` records (Phase 2) carry what that needs: a stable building
id, room id and job on every placement.

Done when: Voth's `78a-78j` and `79a-79c` fragments read their world from exported data and so can the
Godot runtime; one agent class (citizens) walks the same routes in both.

### Phase 6: retire what Godot does natively

Stop investing in, and where it simplifies the host shell, remove:

- `core/lod/` (keep as the preview's LOD; no port, no further features);
- per-build day/night light rigs, fog and glow layers once `core/atmos` presets cover the look;
- `Raycaster`-based picking and walk-mode collision in the life layers (Phase 5 moves them to data);
- the underground toggle, cut planes, shadow-map tricks (the TODO's [G native] items);
- furniture and interiors preview work (Oct 2026 review): lighter low-detail versions of heavy catalog pieces
  and other three.js furniture performance work (Godot instances each piece once and has its own LOD); new
  walk-mode features (ladders, edge rails, head collisions: Girder's `83-walk.js` and the interiors walk-through
  stay as they are); the after-load furnishing timing in Girder; re-exporting the interiors walk-through's
  building shells. The furniture budget lines in the builds' `verify.py` stay as guards for the preview.
- city preview work (city kits review, Oct 2026): `core/lod/` was rolled out to every settlement on
  2026-10-01 and the night lighting retuned in Mav's Refuge, Girder, Yuni, Locus and Voth. Both are [G native]:
  keep them as they are, with no further LOD tuning, no more night-light passes and no picking work in three.js.

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
| `kits/catalog/` runtime and bundle (`krator-furniture-runtime.js`, `furniture_bundle.py`) | [draw] | the preview's batch; the exporter builds pieces through the same core (Phase 4) |
| Builds' furniture glue (`89y-hl-furnish`, `66-locus-furnish`, `53-furnish` x2, `91f-furnish`, `F.furn`) | [G data] + [draw] | split into `core/furnish/`'s placement pass and a per-build draw adapter (Phase 2) |
| Girder `56-interiors.js`, `83-walk.js` | [G data] + [web] | the per-building set items move to the placement pass; walk mode is [G native] (Phase 6) |
| `kits/catalog/` sheet, hover, polygon | [web] | host shell |
| `kits/post-apoc`, `kits/ringsea` | [draw] + [G data] | builders export as meshes; their `92-camera.js` goes to the host |
| `kits/ancients` and lineage | [draw] + [G data] + [G shader] | split builders (section 3.2); `MAT`/`TEX` onto Phase 3; `targets/` are data already |
| City placement painters (`85-city-paint` in Iziz and Dalab, `85-er-paint`, `85-rk-paint`) | [G data] + [web] | placement onto `core/mask/` (Phase 2); the canvas stays only for the preview's ground texture |
| City build passes (`90b-city-build` in Iziz and Dalab) | [G data] + [draw] | split; provisionally mis-tagged [web] |
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
- **Unique trees** (Travis, Oct 2026). Godot grows the flora at run time and ports no builder, so a tree is
  by default one of K baked variants of its species, placed by a ported placement pass. Hero trees, built
  unique by the kits' hero builders, stay as an opt-in: a placement record marked `hero` by a site whose
  architecture is fitted to its trees (Mav's Refuge) or by a hero zone (hyperjungle's hero disc) is baked per
  tile and streamed as a mesh, under a per-tile budget (`biomes/WORLD.md`, "Hero trees: an opt-in").
- **What is not worth porting.** The gallery, the LAN host, the Menagerie, the verify harnesses and the dev
  tools. They are the preview's tooling and stay in the browser.

## 8. Milestones

| Milestone | Proves |
|---|---|
| M1 audit | `PORT-INDEX.md`, a `PORT.md` per build, `check_port.py` running (Phase 0) |
| M2 shell | one `core/host/`, no camera/probe/inspector copies left, hashes or screenshots unchanged (Phase 1) |
| M3 substrate | `core/rand`, `core/terrain` field, `core/tags` with node tests and GDScript twins; `core/furnish` in the six furnished builds; `core/mask` under the four mask-placed cities (Phase 2) |
| M4 first tile | a biome kit's tile opens in Godot from `core/export` with materials and tags (Phases 3, 4, 7 start) |
| M5 first city | Iziz exports and opens: buildings, atmosphere, terrain, interiors (Phase 4); Girder's furnished rooms open from the `furniture` export; Iziz's export uses the `KRATOR_EXPORT` record shape and the library's city sets |
| M6 first citizens | Voth's citizen layer runs in Godot from exported sim data (Phase 5) |
| M7 one world | two kits and one settlement stream together in Godot from the scale model's terrain (Phase 7, `biomes/WORLD.md`) |

M1 to M3 are repo hygiene and can be done without Godot installed. M4 is the first point where the Godot
project exists and the port is testable end to end; everything after it is iteration on the same pipeline.
