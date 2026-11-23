# kits/construction: plan

## Core adoption

The sheet (`build.py`, `src/80-cons-sheet.js`) takes, by path:

- `core/rand` (KRAND): the sheet's determinism signature (`KRAND.hash`); the site itself draws nothing at random.
- `core/tags` (KTAGS, vocabulary, labels): every site (a building), pile (a prop) and scaffold (a part) is a record before it is drawn.
- `core/host` (shell, inspector, polygon tool, probe) and `core/clock` with it; `core/shader` (KHOOK, KCOLOR).
- `core/space` (the inspector's index), `core/walk` (a block per site's house).
- `core/atmos/placeholder` (KratorSky, with `80-sky-hash.js`: the page's core has no `h3()`).
- `core/materials` (`record/`: KMAT, the pack host and `bindMat`; the library through `materials.json` and `tools/textures/pack.py`).
- `core/city` (`54-city-host-construct.js`: KCITY.constructMesh, constructKeys).

Not taken, with the reason:
- `core/terrain`, `core/water`, `core/biome`, `core/atmos` (the full sky): a kit sheet on flat ground; the pieces are lit by
  their site's sky in the world (core/atmos/placeholder README).
- `core/engine`: the kit draws plain meshes round another kit's piece; it has no `defBuilding` of its own.
- `core/simulation`, `core/hamlet`, `core/sched`: the progress is the host's record (the isle demo's sim); the sheet's stages are fixed examples.
- `core/export`, `core/lod`, `core/minimap`, `core/mask`, `core/furnish`: nothing exported, placed by mask or furnished on a sheet.

## Next

- The isle demo's lots on the library's maps (opt-in: `KNOWN_ISSUES.md`).
- Site huts, a crane or a hoist for tall works, carts; workers at the scaffold (core/charactermodels poses).
- A pole per lift (the bark map's stretch).
