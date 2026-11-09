# biomes/ancientsvalley: the Ancient's Valley

The overlay on the two lowlands where the Ancients' war left the land weird and hazardous, and the Ancients' capital stands as a megalopolis in
ruin (`PLAN.md`: the owner's brief, the valley on the model, the city's zones, the scars, the feral forest, the people; `PLAN-ANOMALIES.md`: the
basins where physics fails, and the metropolis's drawing tiers). **Station 0, the Overlook, is built: the city on a normal day, no anomaly**, the
test of the brief's rule (the hand of man in every view) and of the budget.

```
python3 tools/build.py biomes/ancientsvalley                         # dist/ancientsvalley.html (+ dist/ancientsvalley.tex.<pack>.js, the packs' sidecars)
node biomes/ancientsvalley/tests/test-av.js                          # the data side: the model's ground, the fields, the plan, the viaduct, each with a negative
python3 biomes/ancientsvalley/verify.py biomes/ancientsvalley/dist/ancientsvalley.html --assert --all-views --out shots
python3 biomes/ancientsvalley/region/site.py                         # after the model moves: region/station-<name>.json from tools/scale-model/model/data
python3 tools/textures/pack.py biomes/ancientsvalley                 # after a change to materials.json
```

## What the page is

- **The site** (`region/site.py`, `region/station-overlook.json`): px 457,907 on the 5.1 model, the ridge east of city1 over its drowned inlet: 84 m,
  1.58 atm, Af, +24 degC, 2,980 mm. The record holds the model's heights on its 2 km cells round the pixel, the lake's level (17.4 m, y -66.4 on
  the page), the horizon's ridges for the shared sky, and the cities and basins by NUMBER: the names live in that one table (`PLAN.md` section 3).
- **The ground** (`46z-host-stage.js`, `47-host-land.js`): the model's heights by bicubic plus the page's own relief, every tower on a level plinth
  (a disc or a slab, turned with it); core/terrain's KGROUND lays seven library layers (pavement, asphalt streets, rubble, the scar's glass, the
  two lowlands' soils, the shore's mud) over a paint that is also the canopy seen from afar.
- **The fields** (`41-av-field.js`, [G data]): the zone by the model's height (option B: the floor is the core, the shelf the residential rings),
  the density, the parks, the scar (one dead lobe on the ridge's east end), the feral depth, the taint; `tests/test-av.js`.
- **The city** (`41-av-field.js` AV.plan, `70-host-city.js`): about 830 towers on a lattice turned 17 degrees, records before anything is drawn, their
  states by the ruin shares (the owner, 2026-11-04: far too intact at first; now 9% intact, 11% gutted, 12% crown gone, 20% broken, 18% stumps,
  12% skeletons, 18% fallen). Sixteen families: the Spindle and the Ledger, which have baked shells (the nearest 16 as heroes with the dither at
  300 m, to 1.4 km as shells, beyond as impostors, the ruins' rubble to 1 km), and the fourteen designs, which have none (kits/metropolis
  `KNOWN_ISSUES.md`): heroes to 800 m, the nearest 30, then impostors in two looks (intact, broken). A thousand years of rust and grime on every
  hero's colours before the shells and impostors are baked from them (`avRust`). The viaduct (AV.viaduct) runs the ridge's north flank and
  out over the inlet.
- **The Engines** (`70-host-city.js` AVC.engines; kits/ancients `8ah-engines.js`, `8ai-engines2.js` read in place with the kit's runtime, as
  kits/metropolis reads its buildings): the owner, 2026-11-04: massive objects placed sparingly for the sense of scale. The Gyre (a 430 m ring on
  edge) on the floor to the north-west, the Strider (a walker halted mid-stride, its hull 170 m up) on the shelf to the south-east, each at decay 1
  on a pad of its own, the kit's volumes as the page's records. `AV.ENGINES` lists all ten for a station to pick from.
- **The forest** (`46-av-feral.js`, `88-host-build.js`): swlowlands and nwlowlands read in place under the stage's masks, their rainforest zones on
  everywhere (wet .8-.98, tropic .92), every tree grown by the feral field (1.3-2 x), and the taint's tint on the baked foliage (a KHOOK layer:
  green turns toward red-purple and blue-purple by a field of the world position).
- **The air and the water** (`89s`, `89w`): the shared sky at the pixel with the model's ridges; the lake and the inlets as one open surface, the far
  lake to 30 km where the model has water.

## Numbers (2026-11-04, `verify.py --assert --all-views` on the GPU, 1280 x 800)

814 towers (3% intact, 22% standing tall), two Engines, fourteen craters, 2,764 read-in trees, 7.7 M triangles in the registry; every assert
passes. Per view: the Overlook 3.07 M triangles in 465 calls, the dead lobe 5.23 M in 559, the park 4.58 M in 665 (the worst calls), a crater
4.07 M in 531, the Strider 3.69 M in 456, from the air 2.45 M in 451. The shells bake in about 3 s, the heroes and shells together in 4 s, then
42 impostors one a frame. Run on the RTX 5060 lane (the first cut, 2 families and no engines, measured on the Arc 140T: the dead lobe 5.67 M in
522 calls).

**The war damage (the owner, 2026-11-07 and 08, three passes: "really fuck it up", "further still"):** the ruin shares (`AV.RUIN_CUTS`: 2% intact,
5% gutted, 8% crown gone, 22% broken, 25% stumps, 16% skeletons, 22% fallen; 14% standing tall of 797); the broken towers lean up to 5 degrees
(`AV.lean`, one quaternion shared by hero and shell; the rubble lies flat); `avRust` (`70-host-city.js`): rust over everything with streaks to
full rust, soot in patches and smeared upward from the burnt storeys, three to five laser cuts through each tower (planes in its frame, scorched
black along a band), and every colour drawn two thirds of the way to a rust-brown of its own brightness, so the city reads as one rust-shaded
palette; the Wedge's black glass and dark piers swapped for the others' grey before the rust (the owner: it stood out); `AV.craters` and
`AV.scorch` (`41-av-field.js`): 24 strikes on the dry land, bowls with raised rims, each a scar of melt glass with the ground blackened to 2.6 r
and nothing standing in it; `AV.debris`: slabs thrown from the craters and lying in the streets (one instanced mesh); the viaduct with a deck in
seven down and lying tilted at the foot. **The street grid** (the owner, 2026-11-08): the lattice's lines are 11 m streets and every third an
avenue of 26 m, asphalt with rubble at the kerbs, the forest thinned to a third on them: a clear Ancient grid, destroyed and overgrown. Ruined
vehicles in the streets are a kit's work (`kits/motor-vehicles`, an Ancients culture with ruin states: in its own session) and come to the valley
when it exists.

**The tiers** (the owner, 2026-11-08, three passes: the foreground towers looked low-res and floors floated; shells drew over heroes; "make
intermediate forms for the others"): every family and every look has a box shell now (KSHELL's box mode, 66 looks baked at the boot into two 2048
atlases from the rusted heroes, `avFlat` flattening a design's nested groups for the bake), so one rule serves all towers (`70-host-city.js`, "THE
TIERS, plainly"): a hero to 360 m (every tower inside the band, then the nearest 40, fading out over the dither band toward its shell; the pierced
designs to 1.5-2 x that), its shell to 3.2 km side-on, its impostor past
that; a skeleton and any tower whose roof the eye is above are heroes to 1 km (3.2 km seen steeply), the nearest 72, then impostors. Every baked
form of a ruin (shell and impostor) is the family's intact hero cut at the state's height (`avStub`: a solid stub with a torn top), because a ruin's
hero is an open frame of slabs and mullions once its glass is gone, and a frame baked to a box or a card is dashes in the air at range. Outside the
dither band exactly one form stands for a tower.

**The halves, the steam, the keepers and the smog (the owner, 2026-11-08):** "the landscape should be half scarred and polluted and half overgrown
with foliage gone feral": `AV.fields` has a `wild` field (1.4 km lobes of core/rand noise, split at the noise's median over the page's dry land, so
every seed gets its half; nothing on a scar) and its `foul` complement. The forest mask takes every lot in the wild half (the core's plazas and
more of the streets too) and keeps a twelfth in the foul half, whose wet falls under the rainforest zone (the kits' drier species: a sick scrub);
the feral depth follows it (trees to 1.7 x in the wild and never past 40 m, the owner: not taller than the buildings; near their size in the foul); the foul half's ground goes to rubble and an oily dark
paint with the taint's purple, the wild half's canopy paint toward purple-green. About 2,900 read-in trees now (4.9 M triangles in the
registry). The station's vision (`PLAN.md` section 12) is complete: a park gone feral, the dead lobe, **two viaduct lines** (the second from the
west through the core, crossing the Overlook's line of sight 1.1 km out), **the lake's steam** (`89u`: banks of mist on every water cell of the
page and the model's water to 7 km, plumes of steam among them, core/atmos sprites), and **the keepers** (`72`: kits/mechs read as a bundle,
its Iziz walkers of Ancient origin, the Hoist, the Fossor and the Catulus, rusted, each walking a round of one avenue block near a view's eye and
stopping at the corners as if to work). **The smog** (the owner: "dark, unnaturally turbulent, coloured cloudiness and medium-distance smog,
universal near cities; it should sell the LOD"; `89v`): the sky's clouds low, heavy and fast, the air turbid and dust-coloured toward the
taint's purple, the page's fog thick (2 km half veiled, 4 km gone: the far tiers with it), the height fog's mist pooled on the floor and a broken
band of dark cloud at the tallest towers' height, the fog's colour drawn to a brown-purple grey each frame.

**Overgrown like Midgar (the owner, 2026-11-09, with the end of FF7 as the reference; the triangle budget raised to 15 M, `BUDGETS.json`):** in
the wild half the ruins themselves are swallowed. The feral wrap's **perches** (`46-av-feral.js` o.perch, assigned in `88-host-build.js`): every
stump, broken tower and tower with its crown gone wants two to seven trees on its top, and a wrapped tree within 160 m gives it up to two copies
of itself (its instances and its bucket triangles, turned and scaled to a third or a half, under 25 m, each row keyed in the perch's chunk at its own range), registered as
`rooftree`; the **creepers** (`71-host-creepers.js`): curtains of vine and hanging moss (two library cards, `card.creeper.beach` and
`card.moss.hanging`, on crossed quads, one InstancedMesh each) down the faces of every standing tower of the wild half, hung from the broken top
and the storeys below, more the deeper the feral field, tinted toward the taint's purple-green like the kits' foliage; the forest at quality 2.3 and 1.35.

**Numbers (2026-11-09, `verify.py --assert --all-views` on the Arc 140T lane, 1280 x 800):** 787 towers, 3,735 read-in trees (631 copies on 131
ruins' tops), 2,441 curtains, 575 banks of mist, four keepers; 11.9 M triangles in the registry (budget 15 M), the trees 6.7 M of their 7 M. Per
view: the Overlook 6.46 M triangles in 682 calls, a residential street 4.57 M in 630, among the towers 4.36 M in 627, the viaduct 4.16 M in 542,
the core from the water 3.94 M in 568, the dead lobe 4.80 M in 642, a crater 3.41 M in 555, the Gyre 5.12 M in 508, the Strider 5.02 M in 568, the
park gone feral 5.73 M in 804 (the worst calls; the ceiling 900), from the air 4.74 M in 633; the shells bake in 3.4 s, the boot 4.2 s. **The
camera rides with a keeper** on R (again for the next, Escape, a drag or the wheel to let go; `AV_FOLLOW.follow(i)`).

## Read next

`PLAN.md` (the brief and the decisions), `PLAN-ANOMALIES.md`, `INDEX.md`, `KNOWN_ISSUES.md`, `PORT.md`; `kits/metropolis/README.md` for the towers.
