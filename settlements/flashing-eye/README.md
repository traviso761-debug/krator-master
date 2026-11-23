# settlements/flashing-eye: the Red Monastery, the Order of the Flashing Eye's head house

The head house of the Order of the Flashing Eye, Qiblai's crimson monastery (`LORE.md` 6.13), on the east volcano of
Erewhon's lake: three terraces on the cone's south spur (the Lip at scale-model px 881,1527.1, 1,660 m), white ranges and towers
under red tiled roofs, facing the Rift over a 200 m band of columnar basalt, the Way of Shrines climbing to them over rope bridges, with the crater 2.2 km north where the Rim Watch keeps the Eye Post and the vent flashes red
at night. About 320 (280 on the bench, 40 at the Foot House). `PLAN.md` is the design and the owner's answers; `BLUEPRINT.md`
explains the sheets in `floors/`; `FURNITURE.md` is the manifest; `KNOWN_ISSUES.md` lists what is still owed.

## Build and verify

```
python3 tools/build.py settlements/flashing-eye                 # dist/flashing-eye.html (gen/39fe-world-data.js from region/data first)
cd settlements/flashing-eye
KRATOR_GL=gpu python3 verify.py dist/flashing-eye.html --assert --views "Overview,The band from the apron,The crater from the rim"
node test-flashing-eye.js                                       # the layout, its 23 rules, the ground and the spur (81 checks)
node test-watch.js                                              # the vent, the Rim Watch and the line (25 checks)
python3 flashing_blueprint.py                                   # the sheets and FURNITURE.md
python3 tools/sights.py                                         # the sights on the scale model
```

In a fresh worktree run `python3 tools/lfs_needs.py settlements/flashing-eye --pull` first, and
`git lfs pull --include="settlements/xanadu/tex/*,biomes/xanadu/tex/*,kits/qiblai/tex/*,kits/catalog/tex/*"`, or the
surfaces build black. `?hour=21` opens the page by night; `_api.burst(k, s)` sets the clock `s` seconds into the k-th burst
of the page's first three hours, `_api.setTime(t)` sets it outright, `_api.vent()` reads the vent and the watch.

## How the page is made

It is a target on Xanadu's page (`settlements/xanadu/build.py --kit settlements/flashing-eye`), as the Azure Dream's and
Qiblai's city are, with the Qiblai kit's fragments read in place.

| Fragment | What |
|---|---|
| `src/30-fe-layout.js` | `[G data]` the house as data: the frame, the crater, the band, the zones, walls, gates, parts, ways, sights, the line, water, the census |
| `src/31-fe-rules.js` | `[G data]` the layout's rules, and `FLASHING_EYE.ground`: the bench cut and filled level, the band's face, talus and apron, the crater's rampart and bowl, over any model surface |
| `src/32-fe-rooms.js` | `[G data]` the rooms: the blueprint's sheets L, H and P storey by storey in kits/interiors' room kinds, each building's shell in its record's frame, its doors, and the Order's pieces each wants (or keeps alone of their type); the Eye Post's platform |
| `src/40-fe-watch.js` | `[G data]` on core/sched and core/rand: the vent's bursts, the day line, the fire basket's night slots, the Rim Watch's rota, the grid code (the Beacon's) |
| `src/89q0w-fe-mats.js` | the cone's ground sets as MAT keys, bound by the page's pack (`materials.json`: the Qiblai kit's families and rock.columnar, ground.ash, ground.scoria, ground.cinder) |
| `src/89qe-fe-roofs.js` | the revamp's shapes (the owner's references, 2026-11-23): the red hip roof with upturned eaves (one unit shape per aspect), tiered roofs, the round cap, the teal frieze, the battered apron, and the three towers (the round-capped, the window-bayed, the pagoda) |
| `src/89qf-fe-buildings.js` | the Order's records on the Qiblai kit's helpers (seeds 34400-34599, *proposed*): the ranges, the Lip Range, the Red Monastery (the Order's temple on the kit's plan), the Ember Tower, the towers, the Eye Post, the Watch's hut, the gates, the shrines of the Way of Shrines |
| `targets/cone/89zfe-site.js` | `[G data]` the site: the ground (`WORLD.H` on the region cut, less 1,660 m, through `FLASHING_EYE.ground`), pads, every place from the layout, the walls with their gates, the ways, the talus heaps (`KRUBBLE`), the flora's mask |
| `targets/cone/90fe-world.js` | the sky; three ground meshes (4 m on the bench and band, 10 m on the cone, 400 m far) under one shader (grass, ash toward the rim, scoria and cinder in the crater, cinder on the talus, the colonnade on every face); core/drawn; the talus meshes; core/atmos |
| `targets/cone/90fg-build.js` | the retaining faces, every place chunk by chunk, the Vale of Xanadu's flora |
| `targets/cone/90fh-vent.js` | the vent on `FE_WATCH`: the throat, its red light, the bombs, the plume (core/atmos smoke with the page's `vent` kind; `ATMOS.ashPlume` as the record), the hazards as records, the Ember and the fire basket by night |
| `targets/cone/90fi-bridges.js` | the Way of Shrines drawn: the gendarmes of basalt columns rising from the spur (the face's own map), their stairs and the stair up the spur's nose, the rope bridges (planks, deck and hand ropes, hangers, posts, prayer flags) |
| `targets/cone/90fj-face.js` | the band's colonnade in relief: hexagonal columns in jointed drums along the face's lean |
| `targets/cone/90fk-fe-interiors.js` | the interiors at load, on kits/qiblai's `qnIxType` (as the Beacon's B8): the Lip Range's four houses (four floors each, entered on L0 from the bench and the balcony), the Hall of the Ember and the tower's shaft, the Eye Post and its platform's heliograph and fire basket; the pieces in core/tags, the floors and stairs in core/walk, the doors unlocked; `window._feIx`, `FE_IX.walkIn()` |
| `targets/cone/91z-views.js` | the views, the budgets, the page's `_api` hooks |
| `verify.py` | Xanadu's verify and the page's asserts: `eye-laid`, `bench-level`, `band-face`, `crater`, `vent`, `sights-near`, `no-trees`, `way-of-shrines`, `way-walk`, `glints`, `fires`, `interiors-furnished`, `interiors-walk-in` |
| `region/` | the scale model's cut round the cone (`extract_region.py`, box px 858-904 x 1504-1546, 250 m cells; `source/` its inputs) |
