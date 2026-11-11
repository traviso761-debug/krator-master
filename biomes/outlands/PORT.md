# biomes/outlands: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 19 (17%) | 0 (0%) | 1 (1%) | 38 (35%) | 51 (47%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/45-host-stage.js` | 14.3 | [web] | 7 | 0 | 3 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/48-outl-colony.js` | 6.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/50-outl-species.js` | 15.6 | [draw] | 0 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/55-outl-forms-more.js` | 13.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 | split: the five later types' forms and the decay layer are data (records); their items and library skins draw |
| `src/60-outl-colonies.js` | 15.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the placement: forms by role on the colony pass, drawn with BIO.put (split later: the placement records are data) |
| `src/62-outl-colonies-more.js` | 12.1 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | as 60: the placement by role is data, drawn with BIO.put (split later) |
| `src/70-outl.js` | 0.8 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/84-host-ground.js` | 7.8 | [web] | 5 | 1 | 0 | 0 | 2 | 1 | 5 | 0 | 0 | 0 | 0 |  |
| `src/85-host-far.js` | 2.3 | [web] | 2 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89-host-sky.js` | 1.2 | [G native] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89z-host-atmos.js` | 1.8 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/89zw-host-water.js` | 1.5 | [draw] | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89zx-host-build.js` | 1.9 | [web] | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/98-host-views.js` | 8.5 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/99-host-take.js` | 5.1 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 |  |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

- `48-outl-colony.js` is the colony pass (OUTLCOL): plain maths on core/rand and core/space, the part Godot takes as it is (tests/test-colony.js).
- `60-outl-colonies.js` decides where each form stands (data) and draws it (BIO.put) in one pass: the split is a records pass (`OUTL.INST` already holds every form's colony, role and place) and a draw pass over it.
- `89z`, `98` are host code (the fog belt's binding; the page's views and checks), retagged from the scanner's [G data].
- `62-outl-colonies-more.js` is 60's twin for the five later types and the decay layer (data placement drawn with BIO.put): the same split.
- **The later stations** (not scanned: `tools/audit_port.py` reads `src/`). Each `stations/<name>/45-host-stage.js` is [web] host code with
  a [G data] half to split out: its land (`terrainH`, the wadis, pits, pans, pools, palsas, yardangs, the stream) and its fields are
  plain maths on core/terrain, core/rand and core/space; the STAGE record's paint, views and checks are host. `stations/_shared/`'s
  fragments are host code as src/'s are: `44z` [web] (the renderer; STAGEKIT's field cache is [G data]), `84` [web] (the paint; GLSL
  layer weights), `84b` [draw] (KSTACKS meshes), `85` [web], `89` [G native], `89z` [web], `89zw` [draw], `89zx` [web], `98` [web].
  Station 7 reads kits/ancients in place (its runtime and the Arcoindian builders: that kit's own PORT.md tags them).
