# settlements/longsong: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 50 (19%) | 0 (0%) | 0 (0%) | 32 (12%) | 176 (68%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/40-ls-plan.js` | 36.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | the plan as records and pure queries (LS): the site, the rock, the buildings, the Vault, the sealed things, the people and their schedules |
| `src/40b-ls-farms.js` | 12.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 | the farms and gardens as records and pure queries (LS.FARMS): groups, cells, trees, walls, the herds, the provision |
| `src/42-ls-world.js` | 1.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | WORLD.init and the page's origin on the model; landH/worldWater wrappers |
| `src/45-host-stage.js` | 18.3 | [web] | 7 | 0 | 3 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | split: the land's shaping (rock, terraces, pads, pond: data) sits with the renderer and BIO.init |
| `src/62-ls-arch.js` | 26.7 | [draw] | 10 | 0 | 0 | 0 | 0 | 45 | 1 | 0 | 0 | 0 | 0 | the architecture kit: merged per-material meshes; the vocabulary (lsBlock, lsWindows, lsGiltRoof, lsChorten...) |
| `src/63-ls-signs.js` | 8.3 | [draw] | 6 | 2 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | canvas pictures: the sigil, plaques, thangka, glyph band, seal, dial |
| `src/64-ls-monastery.js` | 48.4 | [draw] | 15 | 2 | 0 | 0 | 0 | 88 | 5 | 4 | 0 | 0 | 0 | draws the plan's records; registers each building in core/tags first |
| `src/66-ls-vault.js` | 35.9 | [draw] | 56 | 2 | 0 | 0 | 0 | 71 | 12 | 0 | 0 | 0 | 0 | the Vault and the Procrastinator; its own lights shader |
| `src/68-ls-life.js` | 11.6 | [draw] | 15 | 0 | 0 | 0 | 0 | 6 | 3 | 1 | 0 | 0 | 0 | draws the people from LS.PEOPLE / LS.whereAt (the data is in 40); the drill's poses are motion as a function of time |
| `src/84-ls-ground.js` | 7.6 | [draw] | 6 | 1 | 0 | 0 | 0 | 1 | 6 | 0 | 0 | 0 | 0 |  |
| `src/85-ls-farms.js` | 29.3 | [draw] | 19 | 2 | 0 | 0 | 0 | 35 | 5 | 2 | 0 | 0 | 0 | draws LS.FARMS: the fields' ground, the crop cards' atlas, walls, mills, herds; registers each group first |
| `src/86-ls-far.js` | 2.0 | [draw] | 3 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | the far land: one ring mesh from WORLD.H (the scale model) |
| `src/88-host-build.js` | 2.4 | [web] | 3 | 0 | 0 | 0 | 2 | 1 | 0 | 2 | 0 | 0 | 0 | the build order; the probe's samples of the merged meshes |
| `src/89w-ls-water.js` | 6.6 | [draw] | 5 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | the stream, the canal, the pond and the pools on core/water (records, one still mesh), the water's checks |
| `src/99-host-take.js` | 10.1 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | the page handed to core/host: views, inspector words, checks |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

(none yet: the split lists and the overrides go here)
