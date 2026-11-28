# kits/cascade: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 73 (35%) | 0 (0%) | 0 (0%) | 28 (14%) | 105 (51%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.3 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/40-av-records.js` | 23.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | parametric massing, decks, portals, edits |
| `src/41-av-plans.js` | 29.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 14-deck living/work/rec/civic floorplans & settlementSlots |
| `src/42-av-facade.js` | 3.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | facade bay schedules matching room zones |
| `src/43-av-audit.js` | 5.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | structural, clearance & functional category audit |
| `src/44-av-site.js` | 11.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | canal lines, groundH/waterH, CROPS & twin circular gardens |
| `src/45-host-stage.js` | 2.2 | [web] | 8 | 0 | 3 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | renderer, light, BIO.init |
| `src/50-av-kit.js` | 15.0 | [draw] | 19 | 0 | 0 | 0 | 0 | 26 | 0 | 0 | 0 | 0 | 0 | packed materials, KHOOK window shader, outward-winding builder |
| `src/52-av-hero.js` | 56.2 | [draw] | 15 | 0 | 0 | 0 | 0 | 199 | 0 | 0 | 0 | 0 | 0 | 220 m arcology hero builder (refurbished, intact, ruined) |
| `src/55-av-site-draw.js` | 19.4 | [draw] | 5 | 0 | 0 | 0 | 0 | 60 | 0 | 0 | 0 | 0 | 0 | KDRAWN terrain grids, twin circular gardens & highland flora |
| `src/56-av-interiors.js` | 14.7 | [draw] | 4 | 0 | 0 | 0 | 0 | 6 | 0 | 1 | 0 | 0 | 0 | KFURN/KTAGS records, deck cutaway & 8-storey section stack |
| `src/70-av-stage.js` | 2.6 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | showcase staging, KRUINS.watch, KSHADOW |
| `src/89-host-sky.js` | 1.9 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | ATMOS.bindHost & ATMOS.skyBiome |
| `src/89w-host-water.js` | 5.5 | [web] | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | canal flows & central basin on core/water |
| `src/99-host-take.js` | 14.7 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | preset views, cutaway/section hooks, hostChecks, KHOST.take |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

- All complex geometry, hydropower machinery records, room floorplans, Republican dress tables, settlement slots, portals, edits, sluices, barges, and twin circular crop gardens live in `40`–`44` (`[G data]`, zero `THREE` or DOM calls, verified in Node via `tests/test-cascade.js`).
