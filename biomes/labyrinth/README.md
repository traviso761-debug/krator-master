# The Labyrinth (biome kit, four stations built)

The canyon maze of the SW Glaciated Dome (`PLAN.md`), and at its one eastern opening the Hall of Heroes: the Kimrs' ancestral
arcology, now their necropolis, with its five carved stacks (`PLAN-GATE.md`).

```
python3 build.py                                      # dist/labyrinth.html: station 1, the Gate
python3 build.py --station paddocks                   # dist/labyrinth-paddocks.html: station 2 (also mesas, pits: PLAN.md section 8)
python3 verify.py dist/labyrinth.html --assert        # the host's checks and their negative controls, the export profile
KRATOR_GL=gpu python3 ../../tools/harness.py lock --lane auto -- python3 verify.py dist/labyrinth.html --assert
```

The page reads its textures from two sidecars beside it (`dist/labyrinth.tex.<pack>.js`: this kit's ground, rock, barks and cards;
the Ancients kit's skins). A fresh worktree needs `git lfs pull --include="biomes/labyrinth/tex/*,kits/ancients/tex/*"` first.

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
| the flora: the mammoth steppe (PLAN.md section 3) | the kit's own: species `src/50`, trees `55`, floor `60`, growth on the rock and the ruin `65`, build `70` | the station's profile, `SITE.flora` in `44z` (parkland, tallsteppe, drysteppe, cold); called from `src/89z-host-build.js` |
| views, inspector, checks | `core/host` | `src/99-host-take.js` |

URL switches: `?decay=0` the Hall as built, `?lift=<k>` the Hall's light lift (2.2), `?q=` the flora's quality, `?dress=0` no growth on the rock and the ruin, `?far=0`,
`?hz=0`, `?kground=0`, `?shadow=1`.

## The flora (`src/50`-`70`, `LABY`)

On `core/biome`, after `biomes/nwouterwall` (the closest kit: larch, dwarf birch, woolly willow, feather grass) and
`biomes/copperglacier`. Every plant is tagged (climate, aridity, riparian, Koppen, harvest: `LABY.SPECIES`, `LABY.PLANTS`), and
placement is by cell on `core/rand` (`LABY.place`).

| Station | Profile | What grows |
|---|---|---|
| the Gate | `parkland` (Cfb) | birch stands and scattered larch over a grazed floor; poplar and willow along the river and the pond; the wild melon |
| the Paddocks | `tallsteppe` | tall grass and sedge; the gallery woods (poplar, willow) along the lake and the beck; the wild melon |
| the Mesas | `drysteppe` (BSk) | short grass, feather grass and wormwood; juniper on the rock's feet; the odd larch; cushions and lichened stones |
| the Pit Chain | `cold` (Dfc) | open larch; dwarf birch, scrub willow, juniper; cushions, reindeer lichen, lichened stones; cottongrass; the tarns' iridescent pads and glass reeds |

Every tree over the browsers' reach is bare under `LABY.BROWSE` (4.4 m): the browse line. Its crowns are held by its limbs
(`BIO.tree` scopes, library cards with measured `stems`), so the core attach audit reads no floaters.
