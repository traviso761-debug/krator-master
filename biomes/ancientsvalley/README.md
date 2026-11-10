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
avenue of 26 m, asphalt with rubble at the kerbs, the forest thinned to a third on them: a clear Ancient grid, destroyed and overgrown.

**The ruined vehicles** (the owner, 2026-11-07; `41b-av-wrecks.js` the records, `73-host-wrecks.js` the drawing, 2026-11-09): the Motor Vehicles
kit's Ancients culture with its ruin states (`kits/motor-vehicles`, `KratorVehicles.build(key, {variant, seed, state})`, bundled by `build.py` as
`39v-mp-vehicles-bundle.js`, about 1 MB) stands in the streets as records first (`AV.wrecks`, `[G data]`, `tests/test-av.js`): along every street
line of the lattice, a wreck every so many metres by a hash of (seed, axis, line, step), more on the avenues (a wreck every 30 m at a quarter
chance; the streets every 40 m at a tenth), in a lane inside the roadway, facing along the street with the side of the road deciding the way, a
fifth skewed and a twelfth crosswise; pods and saloons the most common, then vans, utilities, haulers and the watch's police saloons, a tank or
two within 2.6 r of a crater; the state by the scorch field (`burnt` where the ground is burnt, else `wreck` or `weathered` by hash); none within
a crossing's width plus 7 m of a crossing (the junctions stay clear for the transit kit's work), none on a plinth, in a crater's bowl or rim, on
the scar, under the viaduct, on an engine's pad or under the lake, none inside a disc the stage lists in `STAGE.wreckAvoid` (the transit kit's
blockades, when the valley takes them: `kits/ancient-transit`); the count capped at 700 by a priority hash, so a cap thins the page evenly. An
airliner lies skidded down an avenue (its furrow 30 m behind the tail on open roadway) and two helicopters on the plazas near the eye's start
(the lattice's empty nodes). Every record is registered as kind `wreck` with the inspector's words. The drawing keeps a pool: the nearest 48
records inside 450 m of the eye are in the scene (core/space, refreshed every quarter second), one prototype per (key, variant, state, seed)
built when first wanted and cloned (geometry and materials shared), no shadows; the rest stand as records only. The check: at least 150 records,
none on a plinth or under the lake, most of those on scorched ground burnt.

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
its Ancients, culture `ancient`, built by the session valley-robots on 2026-11-09 from the robo folder: the porter of the Hoist's lineage, the
hovering watcher, the lamplighter, the sweeper, the gardener, and the stilt tripod hunting a round by the lake; rusted from the seed; each
keeper playing its routine, the kit's keeper clip, at the corners of its round; before 2026-11-09 the Iziz Hoist, Fossor and Catulus, bare, each walking a round of one avenue block near a view's eye and
stopping at the corners as if to work). **The smog** (the owner: "dark, unnaturally turbulent, coloured cloudiness and medium-distance smog,
universal near cities; it should sell the LOD"; `89v`): the sky's clouds low, heavy and fast, the air turbid and dust-coloured toward the
taint's purple, the page's fog thick (2 km half veiled, 4 km gone: the far tiers with it), the height fog's mist pooled on the floor and a broken
band of dark cloud at the tallest towers' height, the fog's colour drawn to a brown-purple grey each frame; since 2026-11-09 the mist's density is a
field of `F.density` and the clouds have a mood (core/atmos `clouds.dark/tint/turbulence/glow`, `ATMOS.cloudMood`: shifting episodes of tint,
turbulence and the fires' glow at night).

**Overgrown like Midgar (the owner, 2026-11-09, with the end of FF7 as the reference; the triangle budget raised to 15 M, `BUDGETS.json`):** in
the wild half the ruins themselves are swallowed. The feral wrap's **perches** (`46-av-feral.js` o.perch, assigned in `88-host-build.js`): every
stump, broken tower and tower with its crown gone wants two to seven trees on its top, and a wrapped tree within 160 m gives it up to two copies
of itself (its instances and its bucket triangles, turned and scaled to a third or a half, under 25 m, each row keyed in the perch's chunk at its own range), registered as
`rooftree`; the **creepers** (`71-host-creepers.js`): curtains of vine and hanging moss (two library cards, `card.creeper.beach` and
`card.moss.hanging`, on crossed quads, one InstancedMesh each) down the faces of every standing tower of the wild half, hung from the broken top
and the storeys below, more the deeper the feral field, tinted toward the taint's purple-green like the kits' foliage; the forest at quality 2.3 and 1.35.
A curtain hangs and a roof tree stands on the DRAWN ruin: the look's measured profile (`avProfile` in `70`: the hero's horizontal extent in 6 m
bands, in the tower's frame turned by its yaw and lean), never the family's footprint, which is the base of a shaft that tapers (a spindle: 46 m
at the foot, 15 m at its break). A tree is never taller than the ruins about it: `capH` (0.6 of the tallest tower within 160 m, 12 to 32 m) caps
the growth and shrinks a tree whose own height is past it (to .4 at the least), the species with no height in its record measured from its geometry.

**The transit (the owner, 2026-11-09; `PLAN.md` section 14; `kits/ancient-transit` read in place):** the lattice is a real road network (`46z`:
64 streets, avenues of 26 m and roads of 11 m, 824 kerb-line junctions with pavement corners and crosswalks), the war along every street rising
toward the lake (scorch, craters, barricades of the Ancients' wrecked vehicles, military positions; a riot inland, bombed at the shore), the
elevated highway across the page with three ramps whose feet are T junctions of the grid (`KTRANSIT.joinRamps`), the elevated passenger line (two stations, a fallen train), the cargo line at grade (37 level
crossings, a derailed train), the subway under an avenue (three stations, sinkholes, two metro trains), the ground carved by the kit's craters,
sinkholes and gradings. `74-host-transit.js` draws it: every surface in one builder in 1.5 km chunks (the kit's 400 m chunks a street were
3,000 draw calls here), the junctions and the kit's own draws chunked the same, far chunks hidden past 3.6 km, and the furniture and the war
(50,000 piece records at the boot) bucketed into 400 m cells and drawn as the eye comes within 750 m, one cell a frame, one mesh a family; every
standing piece 3 m and taller is a dark post in one InstancedMesh beyond that (the far tier). **The lake-front property values:** `AV.plan` leans
the family mix tall toward the shore (`lakeK`, `tall`, `short`: the Spindle, the Organ, the Stalk, the Reed, the Swell, the Yoke, the Telescope
and the Wedge win within 1.3 km of the water, the Ledger, the Pods, the Terrace, the Crescent and the Cupola inland), so the skyline climbs to the lake.
**The towers on the kerb lines** (the owner, 2026-11-09; `AV.kerbPlace` in `41`, data side): the streets run on the lattice's half lines, so a tower
on its node stood alone in the middle of its 165 m cell, 50 m of plinth from any street. Each now slides off its node until its plinth stops 3 m
behind the pavement of one street (an avenue three times as often as a road), and about a third of them into the corner of a second street; on
the axis it does not slide along, its plinth centres between that axis's kerbs, so a wide one no longer reaches into an avenue. A tower whose
landing the plan forbids (the lines' corridors, the craters, the start, the lake) stays where it was, and one whose plinth still reaches into a
roadway after every try is not built (`PLAN.kerbDropped`). The page checks it (`HCHK.kerb`: three in
four towers on a kerb, no plinth into a roadway or pavement), the data test too.

**Numbers (2026-11-09, `verify.py --assert --all-views` on the Arc 140T lane, 1280 x 800, with the transit):** 824 junctions, the highway 222 spans
and 3 ramps, the cargo line 37 crossings, the subway 3 stations, 4 trains; the war at mean damage 0.57 on 59 lakeward streets against 0.31 on 5 inland;
129 ruins' tops with trees, 2,345 curtains, 6 keepers on their rounds; 12.5 M triangles in the registry (budget 20 M), the trees 7.3 M of their 8 M.
Per view: the Overlook 8.87 M in 999, a residential street 7.50 M in 974, among the towers 7.06 M in 974, the viaduct 6.20 M in 758, the core from the water 6.34 M in 915, the dead lobe 6.17 M in 822, a crater 5.93 M in 846, the Gyre 5.72 M in 544, the Strider 7.04 M in 804, the park gone feral 8.46 M in 1101, from the air 6.47 M in 826 (the ceiling 1,200 calls). **The camera rides with a keeper** on R (again for the next, Escape, a drag or the wheel to let go;
`AV_FOLLOW.follow(i)`).

**The extraplanars (2026-11-09; `75-host-extraplanar.js`, `89x-host-xp-weather.js`; `kits/extraplanar` bundled as `39x`, `KratorExtraplanar`):**
`PLAN.md` section 6 and the themes table of section 9 put them at `city3` Dorado, the drowned city, and this page is the lake's near shore, so a
few have come through. **Three hunters** on rounds of one avenue block like the keepers (the kit's gait on the page's ground, the attack at the
corners with the shared tell first; the Haloed's gaze flown as a rod): the Stilter where the lake's pull (`STAGE.transit.lakeK`) is strongest to
the south, the Haloed over the drowned inlet to the north-west, the Crawler deep in the wild half, each block chosen by a want over the lattice
and 500 m from the last; R rides with them after the keepers. **Three phenomena** as records on the kit's registry (the page's core/tags through
`BIO.tagReg()`, a core/space grid) before they are drawn: a void with seven eyes drifting over the water of the inlet (its `at` on the water
surface, `h` 3.5 m its hover, water under its whole 24 m drift), a solid humming in orbit in a plaza of the foul half's floor (off every plinth
and street), a haloed presence in the park gone feral; their weather on the page's core/atmos after the binding (`89x`: a pool of mist round the
void, the solid's chimney plume and steam ring, the presence's breath, a glow each; `ATMOS.finish` now runs once, for the glow layer), and the
solid's tint in the clouds' mood over it. **Four portals:** three drowned-hall portals on the shore under the towers (the floor 2 to 3.5 m under
the lake within 150 m of a plinth, 400 m apart, the densest shore first), the lake's line across the arch, each facing Dorado and leading to
`city3` (two open, one flickering); and a tear standing alone on the dead lobe's melt glass, 160 m before the dead lobe's eye. Three views
are added to the station's list: the drowned hall and the void over the inlet, their eyes on the water, and the solid in its plaza. The checks: the hunters on
their rounds with four dry corners and the Stilter among them, every record registered before it was drawn with its weather bound, the void on
the water and the drowned arches cut by the lake with the near lake drawn under them (`LAKE.contains`), nothing else under it; six negatives.
Placing them found the near lake flooding nothing on the page (its one seed was on dry ground): `89w` now seeds the flood from the page's own
ground under the lake's level, so the drowned inlets are water. **Numbers (2026-11-09, `verify.py --assert --all-views` on the Arc
140T lane):** every assert and negative passes; the extraplanars' geometry 2.4 MB; the registry 12.54 M triangles (budget 20 M, unchanged); per view
550 to 1,156 calls (ceiling 1,200, unchanged) and 4.81 to 8.88 M triangles, the drowned hall 4.81 M in 608.

**The heap (2026-11-09):** the page's renderer ran out of V8's 4 GB heap on a fourteen-view tour, because the transit builder's arrays outlived
the boot (400 MB) and every view kept the transit cells and wreck looks it built (about 130 MB a view). The builder's arrays now go at `finish`,
a transit cell is freed 450 m past its near range and built again on the way back, and the wreck looks are capped at 72. On software GL the boot
holds 1,451 MB (from 1,974) and the heap stays at 1.4 to 1.8 GB through every view (from 3.6 GB after twelve).

## Read next

`PLAN.md` (the brief and the decisions), `PLAN-ANOMALIES.md`, `INDEX.md`, `KNOWN_ISSUES.md`, `PORT.md`; `kits/metropolis/README.md` for the towers.
