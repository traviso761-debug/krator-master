# biomes/batteredisle: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 55 (31%) | 0 (0%) | 4 (2%) | 45 (25%) | 73 (41%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.0 | [web] | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/28-batter-mipvar.js` | 0.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/40-biome-batter-phys.js` | 16.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/41-biome-batter-sites.js` | 7.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/44z-host-shell.js` | 2.8 | [web] | 9 | 0 | 3 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | renderer, scene, lights, BIO flags |
| `src/44z-host-site.js` | 0.6 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | default station 1 (cove) selector |
| `src/45-host-stage.js` | 18.3 | [web] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 4-station terrain, KCOAST, KSTACKS, KCARVE & KCAVERN |
| `src/46-host-init.js` | 2.1 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | terrainH, waterH, FIELD & BIO.init |
| `src/50-biome-batter-species.js` | 47.4 | [draw] | 0 | 2 | 0 | 0 | 0 | 11 | 0 | 0 | 0 | 0 | 0 | 8 species, HV tags, M2 km1RoughAA, bole/crown AO & impostors |
| `src/60-biome-batter-place.js` | 29.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | deterministic KRAND.cell placement & BIO.kin |
| `src/70-biome-batteredisle.js` | 0.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | public BIOME-API surface |
| `src/84-host-ground.js` | 15.4 | [draw] | 29 | 1 | 0 | 0 | 2 | 2 | 5 | 0 | 0 | 0 | 0 | KSTRATA, <=3-layer KGROUND, KDRAWN, 18.5 km KFAR & KHORIZON |
| `src/86-host-works.js` | 4.6 | [draw] | 8 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | site:* reserves, KHAZ & ?works=0 exile props |
| `src/88-host-scene.js` | 2.2 | [web] | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | BATTER.build, BIO.bake & KSHADOW (off at load) |
| `src/89a-host-atmos.js` | 0.4 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | ATMOS.bindHost |
| `src/89s-host-sky.js` | 1.9 | [G native] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89t-host-weather.js` | 2.5 | [G native] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89w-host-water.js` | 5.4 | [draw] | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/99-host-take.js` | 17.2 | [web] | 1 | 0 | 2 | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |  |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

- `src/28-batter-mipvar.js`, `src/40-biome-batter-phys.js`, `src/41-biome-batter-sites.js`, `src/60-biome-batter-place.js`, and `src/70-biome-batteredisle.js` are engine-neutral `[G data]`: zero `THREE`, zero `DOM`, zero `Math.random`, verified standalone in Node (`tests/test-batteredisle.js`) and read directly in place by `settlements/battered-port/`.
