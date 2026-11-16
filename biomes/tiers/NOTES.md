# biomes/tiers: notes

The Tiers (PLAN.md): the Coyote Kingdom's staircase country between Korona, the Outlands and the Outer Wall, on the scale model 5.1.
This file says how the kit is built; PLAN.md says what it is and why.

## Building it

```
python3 tools/lfs_needs.py biomes/tiers --pull            # first, in a fresh worktree (the library sets, ebadlands' tex/)
python3 tools/build.py biomes/tiers                        # dist/tiers.html: station 1, the Lake of the Tiers
python3 tools/build.py biomes/tiers --all                  # every station
python3 biomes/tiers/verify.py biomes/tiers/dist/tiers.html --assert [--all-views --out shots]
python3 biomes/tiers/stations/bake_far.py --all            # the model round each station (44f), after a model change
python3 tools/textures/pack.py biomes/tiers                # after materials.json changes
node biomes/tiers/tests/test-tiers.js                      # the data side: the strata recipes, the far field's sill (tools/ktest.js)
```

The build is the Great Chasm's (`biomes/greatchasm`, the ebadlands line of Korona's station build): `src/` is every page's, a station's
folder adds its own numbered fragments (`44w-host-land.js`: its ground, features, hazards and views; `44f`: the model round it; any host
fragment it needs: station 1's `86-host-village.js`) and its `station.json` names the neighbours it reads in place (`kin`).

## Station 1, the Lake of the Tiers

- **The site** (PLAN.md 10a): centred on the drawn north shore, 5.1 px 1262,513.4 (the model's cell at 1262,513 is 800 m north of the
  origin). The water fills the page's south-west; the ground rises to ~1,400 m in its north-east.
- **The land** (`stations/lake/44w-host-land.js`): the model's surface; the Black Step's foot as a `KRELIEF.scarp` (64 m over a 72 m run, two ledges, two
  gullies, a talus foot) whose tread steps back level behind its rim (the scarp's height eased out over 1.4 km against the model's rise);
  the lake's bed deepened threefold under the level; the terraced fields stepped into 2.4 m treads; the step moss's rimstone pools dug
  into a seep's line (`WATER.terraces`, its data slotted `22t` so the ground can read it); five basalt stacks on the shore and in the bay.
- **The water** (`src/89w-host-water.js`): the lake an open surface (`WATER.open`) over the whole upper lake (a 200 m mask from the model's
  water cells and the ground under the level), still (no surf, no breakers, field .1); the pools by `WATER.drawTerraces`.
- **The flora** (`src/50`-`70`): the shelf oak's woods within half a kilometre of the water, the step palms on the shore, the ladder reeds
  in the shallows, the stair lilies in the bays, the candelabras and the tiergrass on the dry slopes and the tread, the ledge heath on the
  scarp's ledges, the step moss on the seep, the band lichen on the faces (a ground layer) and the talus (crusts). Kin: ebadlands'
  cottonwood, juniper and pinyon.
- **The village** (`stations/lake/86-host-village.js`): `KHAMLET.village` (fishing, 160 at most: 87 people, 18 households), every
  building pending, drawn as stand-ins at its boxes.
- **The checks** (`src/99-host-take.js`): the Great Chasm's (the ground cover placed, the tags, barren ground, cliffs, rock bodies, the
  model, the sampler units, the hazards, the kin, the cameras) and the kit's own: the natives in their tiers, the lake on its bay and off
  the floor past the sill, the pools dug in, the village registered and pending; each with a negative that must fail.

## Not built yet

Stations 2 (Coyote Canyon), 3 (the Lip) and 4 (the Great Tread); the pagoda bush, the stack cushion and the whorl pine; terracettes in the
ground; the `tiers` crops entry; `outposts.json`. KNOWN_ISSUES.md lists them with the texture swaps.
