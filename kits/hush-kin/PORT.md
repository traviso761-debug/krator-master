# kits/hush-kin: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 21 (13%) | 12 (7%) | 0 (0%) | 22 (13%) | 115 (68%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/26k-kit.js` | 7.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | KIT identity, HS_LAKES, HS_HARMONICS, SV_LIB, SV_CLOTH & palette |
| `src/27v-hs-vstack.js` | 9.0 | [G shader] | 4 | 0 | 0 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 | K1 uniform dedup, M2 specular AA, M3 POM, M4 base AO |
| `src/27z-hs-matfix.js` | 2.9 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | library fallback keys, snow-white quartz & nephrite sheen, metals |
| `src/34-hs-trades.js` | 11.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | HS_TRADES and hsRigMath pure functions |
| `src/39-hs-furn.js` | 13.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 92 | 0 | 0 | 0 | 0 | 0 | 14 bespoke hush_* furniture defs on KratorFurniture |
| `src/40-hs-kit.js` | 16.9 | [draw] | 2 | 0 | 0 | 0 | 0 | 63 | 0 | 0 | 0 | 0 | 0 | sanctuary masonry, Handspeak sign-loggias, hand-lamps, harmonics & monoliths |
| `src/41-hs-quartz.js` | 10.1 | [draw] | 0 | 0 | 0 | 0 | 0 | 26 | 0 | 0 | 0 | 0 | 0 | 6-9 stepped snow-white quartz spires, optical heliographs & moot tiers |
| `src/50-hs-dwell.js` | 19.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | 10 poor, middle & rich Handspeak dwellings (37001-37010, 6/6 matrix) |
| `src/52z-hs-vocab.js` | 0.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | registers hush-kin onto KTAGS.VOCAB at load |
| `src/54-hs-sanctuary.js` | 19.0 | [draw] | 2 | 0 | 0 | 0 | 0 | 20 | 0 | 0 | 0 | 0 | 0 | moot, 21 m heliograph, bianzhong belfry, Hush-pylon shrine & border watches |
| `src/62-hs-trades.js` | 16.8 | [draw] | 4 | 0 | 0 | 0 | 0 | 25 | 0 | 0 | 0 | 0 | 0 | quartz quarry, lapidary mill, bell foundry, felt weaver, silent ferry & skiffs |
| `src/64-hs-lake-land.js` | 13.6 | [draw] | 4 | 0 | 0 | 0 | 0 | 21 | 0 | 0 | 0 | 0 | 0 | brew cellar, tannery, granary spire, warehouse, hospice, tea pavilion & farm |
| `src/70-hs-showcase.js` | 3.4 | [draw] | 1 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 | ribbon-lake Handspeak sightline promenade & heliograph quay showcase |
| `src/89-rows.js` | 2.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | sheet rows, clean view names, no three.js, no DOM |
| `src/90z-hs-atmos.js` | 3.4 | [G shader] | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | live ATMOS Silent-Vales wind shader hook & CPU twin |
| `src/91z-hs-world.js` | 3.9 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | KDRAWN ground, core/water basins & millraces, ore links, hsDims() |
| `src/99-host-tz-hs.js` | 16.4 | [web] | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | verify.py probe fields (window._api) |

## Notes

(none yet: the split lists and the overrides go here)
