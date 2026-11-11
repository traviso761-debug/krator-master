# biomes/outlandgate: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 37 (37%) | 0 (0%) | 1 (1%) | 42 (42%) | 20 (20%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/44f-og-far-data.js` | 33.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the model's heights round the station (tools/far_grid.py): Godot reads the same grid |
| `src/45-host-stage.js` | 11.8 | [web] | 7 | 0 | 3 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/50-og-kit.js` | 2.7 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: the species and kin rows are data; the reed item draws (BIO.def on BIO.fung) |
| `src/60-og-floor.js` | 3.7 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the placement (KRAND lattices: data) drawn with the kin's grow and BIO.put in one pass (split later) |
| `src/70-og.js` | 0.3 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the kit's registry closed |
| `src/84-host-ground.js` | 5.3 | [web] | 5 | 1 | 0 | 0 | 2 | 1 | 5 | 0 | 0 | 0 | 0 |  |
| `src/85-host-far.js` | 2.7 | [web] | 2 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/86-host-gate.js` | 6.7 | [draw] | 4 | 0 | 0 | 0 | 0 | 14 | 0 | 3 | 0 | 0 | 0 |  |
| `src/87-host-hazards.js` | 3.6 | [web] | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | host: the hazard records (KHAZ data, Godot reads them from the tags export) and the page's flood clock |
| `src/87b-host-fauna.js` | 4.3 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | host: the fauna land planned and registered (FAUNALANDS: records), then drawn and ticked through kits/fauna |
| `src/89-host-sky.js` | 1.2 | [G native] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89z-host-atmos.js` | 3.8 | [web] | 4 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | host: core/atmos bound for this stage |
| `src/89zw-host-water.js` | 2.8 | [draw] | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89zx-host-build.js` | 2.1 | [web] | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/98-host-views.js` | 11.5 | [web] | 1 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | host: the page's views and checks |
| `src/99-host-take.js` | 3.7 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 |  |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

- `45-host-stage.js` is [web] host code with a [G data] half to split out: the land (`terrainH`, the river's line and braids, the graded level, the Gate's footprints) and the fields are plain maths on core/terrain, core/rand and core/space.
- `86-host-gate.js` draws the Gate's works as instanced boxes; the records (REGISTER, BIO.record) are the data the culture kit (`kits/coyote`) will take over.
- The trees are ebadlands' (`47a*`, read in place): that kit's own PORT.md tags its fragments.
- **The later stations** (not scanned: `tools/audit_port.py` reads `src/`). Each `stations/<name>/45-host-stage.js` is [web] host code with
  a [G data] half to split out: its land (`terrainH`: the seeps' alcoves and rimstone stairs, the tarn's terraces, coulee and ripples, the
  delta's channels and coves) and its fields are plain maths on core/terrain, core/rand and core/space; the STAGE record's paint, works,
  views and checks are host. Each station's `44f-og-far-data.js` is [G data] (generated). Its `52-og-<station>.js` is kit data (`OGATE.KINX`;
  the mouth's silk card is [draw]) and its `60-og-floor.js` the kit's placement, as `src/60` ([G data] records drawn by BIO.put).
  `stations/_shared/`'s fragments are host code as src/'s are: `44z` [web] (the renderer; STAGEKIT's field cache is [G data]), `84` [web]
  (the paint; GLSL layer weights), `84b` [draw] (KSTACKS meshes), `85` [web], `86` [draw] (the works' boxes; their records [G data]), `87`
  [G data] (hazard records; the flood clock [web]), `87b` [web], `89` [G native], `89z` [web], `89zw` [draw], `89zx` [web], `98` [web], `99` [web].
