# The Labyrinth (biome kit, station 1 built)

The canyon maze of the SW Glaciated Dome (`PLAN.md`), and at its one eastern opening the Hall of Heroes: the Kimrs' ancestral
arcology, now their necropolis, with its five carved stacks (`PLAN-GATE.md`).

```
python3 build.py                                      # dist/labyrinth.html: station 1, the Gate
python3 verify.py dist/labyrinth.html --assert        # the host's checks and their negative controls, the export profile
KRATOR_GL=gpu python3 ../../tools/harness.py lock --lane auto -- python3 verify.py dist/labyrinth.html --assert
```

The page reads its textures from three sidecars beside it (`dist/labyrinth.tex.<pack>.js`: this kit's ground and rock, the NW
lowlands' bark and cards, the Ancients kit's skins). A fresh worktree needs `git lfs pull --include="biomes/labyrinth/tex/*,biomes/nwlowlands/tex/*,kits/ancients/tex/*"` first.

## What the page holds

| Part | From | Where |
|---|---|---|
| the land: the floor at 1,131 m, the pond, the Gowd Warra's channel | `src/45-host-stage.js` | `SITE` in `src/44z-host-site.js` |
| the land past the square: the neck's walls | the scale model's heights, cut at build time (`build.py model_heights`) | `MODEL_H` (`44m`, generated) |
| the ground's layers | `KGROUND` with this kit's pack (`materials.json`: steppe, mud, gravel, sand, the dome's gneiss) | `src/84-host-ground.js` |
| the far field and the horizon | `KFAR`, `KHORIZON` | `src/85-host-far.js` |
| the chaos's wild knobs | `KSTACKS` | `src/86-host-knobs.js` |
| the Hall of Heroes and its five stacks | `kits/ancients` targets/gatearc, read in place with the kit's runtime | `src/89g-host-gate.js` |
| the pond, the river, the fall, the pools | `core/water` | `src/89w-host-water.js` |
| the flora (a first cut) | `biomes/nwlowlands`, read in place | `src/89z-host-build.js` |
| views, inspector, checks | `core/host` | `src/99-host-take.js` |

URL switches: `?decay=0` the Hall as built, `?lift=<k>` the Hall's light lift (2.2), `?q=` the flora's quality, `?far=0`,
`?hz=0`, `?kground=0`, `?shadow=1`.
