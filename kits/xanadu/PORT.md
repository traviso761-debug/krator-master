# kits/xanadu: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 244 (52%) | 0 (0%) | 0 (0%) | 36 (8%) | 194 (41%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/70-xa-tex.js` | 10.1 | [draw] | 0 | 13 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | canvas painters: TEX.def or bake |
| `src/71-xa-mat.js` | 11.3 | [draw] | 16 | 0 | 0 | 0 | 0 | 30 | 2 | 0 | 0 | 0 | 0 |  |
| `src/71c-xa-openings.js` | 3.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | real doors and glass: leaves registered in KDOOR (core/door) through IZDOOR.leaf (69e5), panes and room cards as kit items; stable door ids |
| `src/72-xa-helpers.js` | 33.4 | [draw] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/74-xa-dwell.js` | 25.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/75-xa-trade.js` | 8.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/76-xa-farm.js` | 18.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/77-xa-sacred.js` | 11.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/78-xa-palace.js` | 10.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/78a-xa-pattern-data.js` | 6.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | the black-and-white pattern system's data (XPAT: the stones, each pattern's sizes, the room kinds' dress, the arch curves, the fret): a Godot ShaderMaterial per pattern reads the same table |
| `src/78b-xa-pattern.js` | 21.1 | [draw] | 20 | 0 | 0 | 0 | 0 | 18 | 4 | 0 | 0 | 0 | 0 | the patterns' materials (one onBeforeCompile hook on world position: rewrite once as a .gdshader per kind, [G shader]), their kit items and the helpers that draw with them (arches, voussoirs, orders, gores, rings, runner) |
| `src/78c-xa-dome-plan.js` | 12.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the Pleasure Dome's plan: rooms, openings, and the walls worked out from them (xdomePlan); no three.js, no geometry, no DOM |
| `src/78d-xa-dome-in.js` | 28.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 | draws 78c's plan through 78b's helpers; writes core/walk (KWALK) and core/door (IZDOOR.leaf) records as it draws |
| `src/78l-xa-moorish-data.js` | 4.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | XMOOR: the citadel's arch outlines, muqarnas cells, star ceilings, barrel section as plain numbers (Godot builds from them) |
| `src/78m-xa-moorish.js` | 16.3 | [draw] | 10 | 0 | 0 | 0 | 0 | 15 | 0 | 0 | 0 | 0 | 0 | the Moorish and Mughal materials, geometry items and helpers (arch heads, muqarnas, star ceilings, vaults, jali, iwan, water) |
| `src/78n-xa-citadel.js` | 35.7 | [web] | 0 | 0 | 1 | 0 | 0 | 9 | 0 | 0 | 0 | 0 | 0 | the citadel's builders: walls, floors, doors and stairs drawn from the interior set's rooms (sets/xanadu-citadel.js); window._citadel |
| `src/78o-xa-golden-way.js` | 24.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/79-xa-guild.js` | 17.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/80-xa-military.js` | 15.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/81-xa-public.js` | 11.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/82-xa-hill.js` | 2.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/83-xa-turk.js` | 23.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/84-xa-grandbath.js` | 10.5 | [draw] | 2 | 2 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/85-xa-water.js` | 11.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/85b-xa-garden.js` | 21.2 | [draw] | 0 | 6 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | canvas painters: TEX.def or bake |
| `src/86-xa-vizier.js` | 8.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/86b-xa-plants.js` | 2.9 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/87-xa-spicer.js` | 9.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/87b-xa-andean.js` | 12.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/87c-xa-erewhon.js` | 23.7 | [draw] | 9 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/88-xa-dress.js` | 11.9 | [draw] | 4 | 6 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | canvas painters: TEX.def or bake |
| `src/89-xa-trades.js` | 4.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the Voth census table: plain data |
| `targets/sheet/88y-xasheet-matlib.js` | 1.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/sheet/89z-rows.js` | 1.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/sheet/91t-xasheet-tags.js` | 2.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |

## Notes

(none yet: the split lists and the overrides go here)
