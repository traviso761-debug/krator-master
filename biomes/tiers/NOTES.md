# biomes/tiers: notes

The Tiers (PLAN.md): the Coyote Kingdom's staircase country between Korona, the Outlands and the Outer Wall, on the scale model 5.1.
This file says how the kit is built; PLAN.md says what it is and why.

## Building it

```
python3 tools/lfs_needs.py biomes/tiers --pull            # first, in a fresh worktree (the library sets, ebadlands' tex/)
python3 tools/build.py biomes/tiers                        # dist/tiers.html: station 1, the Lake of the Tiers
python3 tools/build.py biomes/tiers --stations             # every station (never --all: tools/build.py reads it as every build in the repo)
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

## Station 2, Coyote Canyon (started 2026-11-16)

- **The site**: the model's village pin, 5.1 px 1265,500 (1,603 m, BSh): the canyon's mouth, opening south-west onto a hollow at 950-1,300 m;
  the canyon climbs north-east into the riser.
- **The land** (`stations/canyon/44w-host-land.js`): the plateau is the model's surface with the canyon's six cells filled from their high
  neighbours (the Great Chasm headwall's `MODEL.h` cell filter); the canyon is recut as nine `KRELIEF.stepcut` treads, mouth to head, each its
  own floor (1,560 to 1,873 m: dry falls of ~39 m between), five ledges up each wall, the last tread ending in stepcut's head bowl. Each
  tread's cut is skipped outside its box (nine reads a point cost 7x the page's sampling; the boxes take it back, the same heights).
- **The water**: the king's spring a still pool in the head's bowl; its stream down the stair as `WATER.terraces` (a pool a tread, a fall a
  riser: the step moss's dams).
- **The seat** (`stations/canyon/86-host-seat.js`): the landmarks as records under the Coyote kit's `cy_*` keys (its plan, draft 2026-11-16),
  pending stand-ins, `KratorCoyote.dims` taking over when the bundle is on the page. The town's rows wait on the layout (KNOWN_ISSUES.md).

## Station 3, the Lip (started 2026-11-16)

- **The site**: the notch's own cell, 5.1 px 1246,531 (285 m on the model, Am): the upper lake east, the floor west.
- **The land** (`stations/lip/44w-host-land.js`): two surfaces and the face between them. `FLOOR` is the model without the sill (the cells'
  own heights); `TOP` the lip's basalt plateau at ~1,180 m, blending into the model's lake bed only inside the lake's own cells (`lakeK`, so the
  water never stands over the low ground south of the lake). The face is a unit `KRELIEF.scarp` (h 1: its profile, benches, ravines, buttresses
  and talus as a share) laid between them: ground = FLOOR + share x (TOP - FLOOR).
- **The outfall**: the notch's channel across the lip (bed 1,147-1,149 m), `WATER.flow` along it; the fall (`FALLS`, 911 m, following the face to
  its foot); the pool (a still at 238 m); the river (`KRELIEF.river` down the floor) drawn by `stations/lip/89w2-host-outfall.js`.
- **The flora**: the natives on the lip (the kit's zones, which now refuse ground over ~25 degC), the north-western lowlands' mist palms, tree
  ferns, pandans, paperbarks and meranti below (kin rows weighted by the fall's spray, `sprayK`).
- **The ground**: the floor takes a leaf-litter layer (45: `GLW` 'litter', weighted by the `hot` field; `ground.litter` on
  `leaf.forest_leaves_02`, darkened to a damp mean of .3) in place of the treads' grasses, which give way where it is hot.
- **The fall** is ~40 m across; its curtain follows the face's highest point across that width (`face` in `FALLS`), 2 m off the rock, so the
  buttresses do not stand through it.

## Station 4, the Great Tread (started 2026-11-16)

- **The site**: 5.1 px 1310,490 (4,637 m on the model, Dsc, 31 mm, +2 degC), by the dry Chung-Gel (16 km south, the far field's).
- **The land** (`stations/tread/44w-host-land.js`): the model flattened to a quarter of its rise about 4,637 m (the tread), a `KRELIEF.scarp`
  up to the next step across the north-east (170 m) and a `drop` scarp down to the great tread across the south-west (190 m), both rims
  striking south-east; the dry gorge a `KRELIEF.stepcut` graben (70 m, four steps) from a sapped head on the tread to the lower rim, where it
  hangs; four buttes (`KSTACKS` butte) off the faces. Strata: the Grey Steps (44r, tiers-grey).
- **The camp** (`stations/tread/86-host-camp.js`): `KCAMP.pitch` and `KCAMP.census` on the station's culture row (`tierhound-herd`), a
  horseshoe toward the gorge's head; every record registered pending, drawn as stand-ins; three flocks of goats and sheep and one of
  ostriches on `BIO.walker` loops round it (`LAND.build`, after the kit's plants). Checks: the pitch whole (no overlap, on good ground, none
  short), every record registered pending, the flocks off the camp; each with a negative (`LAND.negatives`, 99's hook).
- **The flora**: the kit's natives refuse the cold stair (55: `high`, over ~4.2 km; `temperate` is now `mild`, warm and below it); the
  tread's own pass (60: `floor-stair`) draws the tiergrass sparse on its lips, the pagoda bush, the stack cushion and pale cobbles; the
  talus is the Grey Steps' pale blocks (no basalt columns over 3.9 km); kin: the eastern badlands' Utah juniper and bristlecone pine on the
  talus and ledges. Ground: the steppe's withered grass, the desert pavement (`ground.pave`), the band lichen, the talus's gravel.

## Not built yet

Station 2's town (its layout); the whorl pine; terracettes in the ground; the `tiers` crops entry; `outposts.json`. KNOWN_ISSUES.md lists them with the texture swaps.
