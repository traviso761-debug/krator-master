# kits/timpar-kuran: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 22 (11%) | 12 (6%) | 0 (0%) | 22 (10%) | 151 (73%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/26k-kit.js` | 7.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | KIT identity, 5 clan crests, SV_LIB, SV_CLOTH & palette |
| `src/27v-tk-vstack.js` | 9.0 | [G shader] | 4 | 0 | 0 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 | K1 uniform dedup, M2 specular AA, M3 POM, M4 base AO |
| `src/27z-tk-matfix.js` | 2.3 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | library fallback keys, tempera sheen, jade glow & metals |
| `src/34-tk-trades.js` | 11.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | TK_TRADES and tkRigMath pure functions |
| `src/39-tk-furn.js` | 15.1 | [draw] | 0 | 0 | 0 | 0 | 0 | 105 | 0 | 0 | 0 | 0 | 0 | 14 bespoke timpar_* furniture defs on KratorFurniture |
| `src/40-tk-kit.js` | 25.4 | [draw] | 3 | 0 | 0 | 0 | 0 | 84 | 0 | 0 | 0 | 0 | 0 | Jomon pit, cise thatch, kaen crown, pu stilts, Kanopi rib, visors & loot heads |
| `src/41-tk-formline.js` | 12.7 | [draw] | 0 | 0 | 0 | 0 | 0 | 24 | 0 | 0 | 0 | 0 | 0 | z-stepped Tlingit formlines, stacked totems & pivoting totem-mouth portals |
| `src/50-tk-dwell.js` | 23.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 | 0 | 10 poor, middle & rich dwellings (35001-35010, 6/6 matrix) |
| `src/52z-tk-vocab.js` | 0.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | registers timpar-kuran onto KTAGS.VOCAB at load |
| `src/54-tk-sacred.js` | 15.0 | [draw] | 2 | 0 | 0 | 0 | 0 | 11 | 0 | 0 | 0 | 0 | 0 | Kanopi shrine, iomante bear court, nusa mortuary, potlatch, sweat & truce lodges |
| `src/58-tk-fort.js` | 18.0 | [draw] | 2 | 0 | 0 | 0 | 0 | 25 | 0 | 0 | 0 | 0 | 0 | chasi-noow ridge fort, trophy gate, rockfall trap, mustering, ransom & pyre |
| `src/62-tk-trades.js` | 27.1 | [draw] | 3 | 0 | 0 | 0 | 0 | 34 | 0 | 0 | 0 | 0 | 0 | 12 salmon weir, dugout, kaen, Chilkat, copper forge, jade adze & barter works |
| `src/64-tk-crafts.js` | 12.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 30 | 0 | 0 | 0 | 0 | 0 | camas earth-oven, grease try-works, totem carver & Veilpass pony-hound corral |
| `src/89-rows.js` | 2.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | sheet rows, clean view names, no three.js, no DOM |
| `src/90z-tk-atmos.js` | 3.3 | [G shader] | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | live ATMOS valley-mist wind shader hook & CPU twin |
| `src/91z-tk-world.js` | 4.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | KDRAWN ground, core/water pools & streams, ore links, tkDims() |
| `src/99-host-tz-tk.js` | 16.4 | [web] | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | verify.py probe fields (window._api) |

## Notes

(none yet: the split lists and the overrides go here)
