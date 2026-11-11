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

**The oily rain** (the owner, 2026-11-09: "a weather mode, oily rain over the polluted portions"; `89x-host-oilrain.js`): the Weather selector
has an 'oily rain' mode. In it core/atmos's rain wall stands on the valley's foul field instead of a mountain face (`fx/89-atmos-fx-rainwall.js`
takes `o.field` since this day): dark curtains hang over the polluted half, seen from the wild half as smears under the cloud, and under them
the weather's own streaks fall, the ground wets and the fog greys, only while the eye stands in them. The streaks are the colour of oil, a
near-black brown with a slow thin-film sheen, through core/atmos's acid rain (`fx/89-atmos-fx-acid.js`), which also provides the toxic dose to
core/hazard (pH 2.5 under the polluted half in this mode, clean everywhere and in every other mode). Nothing is etched and no rain-cover map is
rendered: one draw call of curtains (the heap is near Chrome's limit).

**Numbers (2026-11-09, `verify.py --assert --all-views` on the Arc 140T lane, 1280 x 800, with the transit):** 824 junctions, the highway 222 spans
and 3 ramps, the cargo line 37 crossings, the subway 3 stations, 4 trains; the war at mean damage 0.57 on 59 lakeward streets against 0.31 on 5 inland;
129 ruins' tops with trees, 2,345 curtains, 6 keepers on their rounds; 12.5 M triangles in the registry (budget 20 M), the trees 7.3 M of their 8 M.
Per view: the Overlook 8.87 M in 999, a residential street 7.50 M in 974, among the towers 7.06 M in 974, the viaduct 6.20 M in 758, the core from the water 6.34 M in 915, the dead lobe 6.17 M in 822, a crater 5.93 M in 846, the Gyre 5.72 M in 544, the Strider 7.04 M in 804, the park gone feral 8.46 M in 1101, from the air 6.47 M in 826 (the ceiling 1,200 calls). **The camera rides with a keeper** on R (again for the next, Escape, a drag or the wheel to let go;
`AV_FOLLOW.follow(i)`).

**The colour of the air** (the owner, 2026-11-09: "the distant buildings just always look greenish blue and it doesn't look right against a yellow
sky"; "make them more similar to cloud color during storm and fog"; `89v-host-smog.js`). The far towers take their colour from the fog, the mist
and the hemisphere light. Three things made them blue-green under a yellow sky: the weather pulled the fog toward a fixed blue-grey in rain and fog,
the mist took 45% of the sky's zenith blue, and the hemisphere's sky colour is blue by its preset; the smog's own purple pull ran in a tick, before
the sky's update, so the sky overwrote it every frame. Now `AV_AIR.view` runs after the sky in the frame's view phase: the fog is the sky's own
horizon colour, moved toward the clouds' colour (the deck's tint, darkened by its darkness) as the cover, the rain and the fog rise, with a fifth
of the smog's purple-grey; under a storm the hemisphere leans to the same cloud colour; the mist takes 12% of the zenith.

**The tower impostors hide where they should** (2026-11-09). The impostors are hidden per tower by matching each instance's position against
`AVC.towerAt`, which was keyed by the float64 coordinates while the instances are read back from a Float32Array: on the 17-degree lattice no key
ever matched, so no tower's billboard was ever hidden. It stood inside every hero and shell, unseen in a solid one, but showing through a
skeleton's frame, over a fallen heap and above a broken top: a share of the "shells clipping through models" reported for a week. The table is
keyed by `Math.fround` now, and a check holds it (every instance finds its tower; none is drawn over a hero, a shell or a heap). With the
billboards hidden, a fallen tower past the far rubble (3.2 km) drew nothing at all: there its billboard stands squashed to the heap's height (16 m).

**The cosmetic distortions of space and time** (the owner, 2026-11-09; `89y-host-anomaly.js`; PLAN-ANOMALIES.md section 5). Three records, one
vertex warp on every material (core/shader `KWARP`, written for this valley) and a time scale; none changes collision, placement or the walker's
ground. THE BEND round the Gyre: as the eye comes within 800 m of the engine the land rises round it like a bowl (`y += k d^2`, d the horizontal
distance from the eye). THE LENS over the Strider: a small dark body with a violet rim bends what lies behind it outward round itself, a point
seen at angle theta from it turned away by thetaE^2 / theta, readable to 4 km. THE TIME POCKET in the park gone feral: inside it the rain, the
clouds, the steam, the sway (core/atmos's clock scale) and the keepers slow to a fifth, eased over its edge.

**The House** (the owner, 2026-11-09: "a House of Leaves style bigger-on-the-inside facility, looping corridors"; `41c-av-house.js` the records,
`75-host-house.js` the drawing and the walking). A concrete hut 3 m square stands on the residential plaza, its door to the south. Walk through it
(F to walk) and you are in a foyer 30 x 60 m and 12 m high, far outside the world's coordinates, lit only round the eye, so every far end is black.
North, a corridor in 12 m segments that never ends (crossing the fourth moves you back one); east, a corridor whose far door opens on a closet, a
hall too large to see across or the descent, by the visit; the descent's ramp has no bottom (its foot leads to the same place on the slope higher
up, and a level is counted); west, a dead-end hallway 4 cm longer each visit, which the readout's tape reports without comment. Back out through
the foyer's door, you step out of the hut. The House's floors and walls are the walker's registry (core/walk `KWALK`, now handed to the host).

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

**The owner's reports of 2026-11-09 and 10** (KNOWN_ISSUES has each in full): the clouds' mood keeps the valley's own hues (no green or
jaundice episode, which the storm's air carried onto the far towers); every roof tree and creeper is confirmed by rays at the drawn ruin (70
`avSurface`); the creepers are on the core's leaf material with their card's fringe refilled; the street furniture is dead and rusted
(`KratorTransitFurniture.dead`); the keepers and hunters steer round the piers, plinths, wrecks and trains (72 `AV_AVOID`); every tower is drawn
turned the way its plinth and its street are (-yaw in three's sense).

**The lobbies and the climbs (the owner, 2026-11-09: "at least a fraction of the buildings here to be actually enterable and climbable; we
can strategically block entrance or ascent to most with well-placed rubble"; "no proper ramp to get into lobby"; "more climbable stumps"; "a
collapsing floor hazard"; PLAN.md section 15).** `41c-av-lobbies.js` (`[G data]`, `tests/test-av.js`) makes the records, `46z` calls it once the
streets are graded and folds the approaches into the ground, `76-host-lobbies.js` registers and draws them. Every tower that fronts a street and
stands has **a door** on its skin facing the street (a portal of the Spindle's or the Cupola's, else the frontage's middle) and **an approach**
from the pavement's back edge to half a metre onto its plinth (the plinth is an ellipse, so a door off the middle meets it further back): steps
(risers of 0.17, cheek walls, slope under 0.55), a ramp under 0.6 m of rise, a rubble ramp over 6.3 m; the ground takes the flight's plane and a
level path on to the door, so the bank between the street and the plinth is cut or filled there. **A fraction is open** by `KRAND` (stumps 30%,
skeletons 15%, broken and crown-gone 10%, intact and gutted 8%; the eligible tower nearest the Overlook's start always): its storeys as plates
(0.8 of the skin's radius, four pieces round the stair, the top one torn) and a switchback stair in the family's stair shaft up to what the ruin
leaves (the roof, or the skin's torn top; no stair across a storey over 8 m, so the Stalk's stem stays shut); an open tower stands plumb (its lean
cleared). **The rest are blocked** by `KRUBBLE` heaps: seven in ten across the doorway, three in ten on the stair a flight or two up, each with
blocks on `core/walk`; a door whose way a fallen tower's shaft or a neighbour's doorway rubble crosses (two towers on a corner), or whose plinth
a cutting or a sinkhole breaks by more than 2.5 m, is cut off. **Weak floors** in the open broken, crown-gone and skeleton towers (about one storey in five, one piece away from the stair, never the
lobby's or the top two): darker and sagging; stood on for half a second it falls and the walker drops a storey (`AVL.collapse`), and it is a
`collapse` zone on the walk for Godot. **The fallen towers' shafts** (the crushed tubes of kits/metropolis 57, which the walker could enter at their
open ends) are blocks along their axes. The walker (F) reads `AVL.walk`: `KWALK` less the floors that have fallen. A door's group (steps, heap,
plates, stair) is built within 420 m of the eye, one a frame, and freed past 650 m. The checks: every standing kerb tower has a door, each
approach's foot on the pavement and head on the plinth with the ground under it; 8 to 25% open with the stumps the most; every open tower walked
(core/host's own step and drop rules, `AV.walkRoute`) from the pavement to its top; every blocked one stopped at its rubble; weak floors only
where they belong; every fallen shaft blocked; six negatives. **Numbers (2026-11-10, GPU `--assert --all-views`, every assert passing on the Arc lane):** 444 doors
(317 steps, 95 ramps, 17 rubble ramps), 61 open (the highest climb 234 m), 269 blocked at the door, 114 on the stair, 26 cut off, 102 weak
floors, 560 fallen shaft sections blocked; about 38,700 walk floors and 9,300 blocks, registered in about 120 ms; the worst view 8.47 M
triangles and 1,176 calls (the park; budgets 20 M and 1,200, unchanged). Seen on the GPU: a blocked door's steps and heap, a skeleton's storey
with its stair rising to the next, the torn top 104 m up over the city.

## Station 2a: the Yards (2026-11-10; `stations/yards/`, `dist/ancientsvalley-yards.html`)

```
cd biomes/ancientsvalley && python3 build.py --station yards           # or: python3 tools/build.py biomes/ancientsvalley --station yards
python3 biomes/ancientsvalley/verify.py biomes/ancientsvalley/dist/ancientsvalley-yards.html --assert --all-views --out shots
```

The industrial district (PLAN.md section 12, 2a), a station of its own; the Overlook is unchanged. `station.json` names the page, its region
record and what it reads beyond station 0: the metropolis kit's `46e` (the third of each industrial kind) and the new `46f`/`57y` (the yards'
pieces), the Ancients kit's industrial builders (as `kits/metropolis/build.py` lists them) and the new Engines (`targets/engines/8aj-engines3.js`).
Its fragments replace `src/`'s of the same name: the stage (`46z`), the industry and the yard (`70y`), its checks (`98y`), and empty stand-ins for
the Overlook's extraplanars, House and distortions (`75`, `89y`).

- **The site** (`region/site.py` SITES, `region/station-yards.json`): px 470,921 on 5.1, 210 m, Af, 1,914 mm: the floor of a west-east trough in
  the shelf 38 km east-south-east of city1 and 14 km from the shore. The trough climbs from the core's floor (105 m four cells west) toward
  Thera and Span (332 m four cells east), 1.4% along it and 3-4.5% up its flanks: the freight line's natural grade inland, a floor wide enough
  for a yard and the halls, flanks for the residential rings, a bowl that holds the smog. Clear of every blast basin by 11 km, no water within
  8 km. Picked on the model by a search for flat shelf ground 8-20 km from the shore near the line from city1 toward Thera.
- **The grid**: the lattice square to the trough (theta 0, pitch 165). In the industrial zone (u -2,227.5 to 1,732.5, w -742.5 to 742.5) only
  the avenues run, so the halls stand in 495 m superblocks: two rows of eight either side of the yard's row; the u-avenues stop at the yard's
  row except two that cross the line (level crossings at -1,732.5 and 1,237.5); the roads stop at the zone's avenues (58 tees). Outside it the
  flanks keep the ordinary grid. `STAGE.yards.STREETS` holds every street as intervals on its line; `streetK`, the wrecks and the checks read it.
- **The yard** (`MP.yards.railYard`, 46f): the cargo line along the trough at z -150 on a graded bench, eight sidings fanning south off it from x
  -1,600 to -100 (each a transit-kit rail at grade, its turnout lengthening with each siding out), buffer stops at their ends, five trains on
  them (three standing, two derailed with wagons on their sides) and a derailed freight on the main line east of the yard; the turntable with
  its twelve-stall roundhouse at the yard's east end; three loading gantries over the tracks.
- **The industry**: the twelve industrial buildings (`MP.ANCIENTS`: the Vault, the Perforated Stacks, the Assembler, the Rig, the Foundry, the
  Pilotis Works, the Well, the Tank Yard, the Cooling Towers, the Gantry Hall, the Furnace Stacks, the Spheres) fronting the avenue on their
  block's yard side, 3 m behind its pavement, as records of `STAGE.plan.towers`, so the city's machinery (`70`) tiers them like the towers:
  heroes, box shells, impostors, ruin states by the shares, the lean. Their families (`MP.FAMILY`) are made at the boot (`70y`, before 70's own
  boot reads them), since the kit makes a family from its first hero and the hero needs the Ancients' builders and the library's maps.
- **The new pieces** (`kits/metropolis` 46f records, 57y drawing through the transit kit's builder, one mesh a family a chunk): two tank farms in
  bunds (cylinders with cone, floating and domed roofs, and spheres on leg rings, after the owner's refinery reference; holed, burnt, collapsed
  and gone by damage), three pipe racks (along both rows' backs and across the yard's row, their bents never in a street or on a track: the
  pipes span them), a dish array on the north-east block, five chimneys in red and white bands behind the foundry and the furnaces, two
  conveyors from the yard to them; each registered before it is drawn.
- **The ground**: the floor all foul (`F.foul`, `F.industry`): spill grounds and toxic pools as dead ground (the scar), the pools still and
  black and sunk 0.6 m; four slag heaps (`MP.yards.slagH`, ground); the wild only on the upper flanks. **The oily rain is the day's weather**
  (`STAGE.weather`; 89x sets it), and the smog is the valley's thickest (fog .00052 against the Overlook's .00036, the mist .0016 and deeper,
  the cloud band lower).
- **The keepers** are the factory kinds of `kits/mechs` culture `ancient` (`STAGE.keepers`; 72): two porters (crane and pallet), the lifter, the
  mender and the courier, each on a round of a superblock.
- **Three of the new Engines** stand in superblocks of their own: the Hive (north row), the Star and the Iris (south row), each on its pad;
  `70y` merges each engine's plain meshes by material (122 meshes into a few).
- **The lines**: the elevated highway along the north flank with three ramps landing at avenue tees, the elevated passenger line along the
  south flank with two stations, the subway under the south row's avenue with three stations.
- **The checks** (`98y`, through `STAGE.checkList`): the industry placed (all twelve, each inside its superblock, each family made and drawn),
  nothing in a street (no plinth, bent, trestle, tank, dish or Engine across one), the yard on the line (every siding leaving it, at its
  spacing, no street across the yard, the turntable at its end, the gantries over the tracks), the wagons, the pieces as records first, the
  dead ground and the heaps, the weather and the smog, the factory keepers, the Engines, the transit; and the general ones (the hand of man,
  dry ground, the impostors, the craters, the lean, the forest, the cards, the wrecks on the streets). Each with a negative.

**Numbers (2026-11-10, `verify.py --assert --all-views` on the RTX 5060 lane, 1280 x 800):** every assert and every negative passes. 188 buildings
(176 residential on the flanks after 25 dropped by the kerb and the street filter, 12 industrial), 41 shell looks in one atlas, 658 junctions
(58 tees), 8 sidings, 52 wagons in the yard, 22 pieces (277 tanks, 976 rack bents, 9 dishes, 5 chimneys, 2 conveyors, a turntable, 3 gantries,
5 pools), 3 Engines (122 meshes merged), 5 keepers, 95 wrecks, 7,316 read-in trees (5,677 grown); 18.16 M triangles in the registry (budget
20 M). Per view: the north flank 4.15 M in 860 calls, the rail yard 3.46 M in 838, the turntable 2.81 M in 663, among the halls 5.92 M in
905 (the worst calls), the tank farm 6.92 M in 677, the foundry 4.15 M in 574, the dish array 7.49 M in 694, the Hive 2.86 M in 613, the
Star 4.64 M in 725, the Iris 8.14 M in 698 (the worst triangles), a spill ground 4.24 M in 832, from the air (over the Foundry, under the
worst of the smog) 3.32 M in 618 (ceiling 1,200). The views were reframed after the first look (the turntable from above its fan, the dishes
from their pad's edge, the spill ground on its oil-crusted rubble with the pools black on it, the air view low over the Foundry).
The shells bake in about 4.8 s, everything at the boot in 6.3 s.

## The Terraces: the Soleri farm belt (a station, 2026-11-10)

```
python3 build.py --station terraces                                 # dist/ancientsvalley-terraces.html (+ the crops kit's pack, dist/ancientsvalley.tex.crops.js)
node biomes/ancientsvalley/tests/test-farm.js                        # the farm's plan on the station's record, each check with a negative
python3 biomes/ancientsvalley/verify.py biomes/ancientsvalley/dist/ancientsvalley-terraces.html --assert --all-views --out shots
python3 biomes/ancientsvalley/region/site.py terraces                # its record alone, after the model moves
```

`PLAN.md` section 12, 2b. **The site** is px 455,899 (`region/station-terraces.json`): 330 m, 1.53 atm, Cfa, +23 degC, 1,694 mm, on the south face
of the ridge north of city1, the terraces band. The page falls about 180 m from its north edge to its south; below it the shelf, the drowned inlet,
and 16-18 km due south city1 and the Overlook's ridge. **The station's own fragments** (`stations/terraces/`, replacing `src/`'s of the same name or
added): `46z-host-stage.js` (its STAGE), `41d-av-farm.js` ([G data]: the plan, `AV.farm`, and its land, `AV.farmLand`, and crops, `AV.farmCrops`),
`70t-host-farm.js` (the pylon lines and their wires, the city below, the station's checks), `87t-host-thicket.js` (the fields gone to thicket),
and one-line stubs for what is the Overlook's alone (`72` keepers, `73` wrecks, `75` the extraplanars and the House, `89y` the distortions).
`station.json` reads the metropolis kit's farm families (`46f`, `54f`) and the crops kit (`10`, `20`, `22`, `40`) in place, and the crops kit's pack.

- **The plan** (`AV.farm`, records first, every placement a `KRAND` hash, the pads, roads and fields on `KSPACE`): **the hub town** on the flattest
  ground near the page's middle (the Hub Hall, the Market along the contour, a ring road); **the aqueduct** traced along the contour 320 m upslope of
  the hub in modules of the kit's joint (66 m, at most 5 degrees a joint, level but for 3 cm a module), the pump house and the water tower beside it
  on the hub's side; **36 clusters** on rings round the hub (honeycombs of pods on a hex lattice, rows of vault houses along the contour, growing stacks
  facing down the steeper ground), a spoke road to each; **four honeycomb arrays** (the owner, 2026-11-10: "more arrays of the honeycombed
  growing pods (groups of 12+ pods)"), nineteen pods each packed flat to flat on a 53 m hex lattice with an 8 m walk between, on one level the relief
  cuts and fills (the walks with it), 950 to 2,150 m out on the belt, 700 m apart, off the aqueduct and the trunk's line, with a spoke road each
  (the clusters' honeycombs are the lattice's first ring the same way: 176 pods in all); **the roads**, a road meeting the aqueduct moved to an arch's middle and squared to the line
  (a spoke laid nearly along it is not built); **two pylon lines** down the slope, a pylon every 280 m nudged off every pad, road and pier; **the
  fields**, parcels along the contour within 420 m of a cluster or 650 m of the hub (the wood took back the rest), a crop or an orchard each.
- **The buildings** are the city stage's towers (`70-host-city.js` unchanged): heroes to 600 m, box shells to 3.2 km, impostors past that, rusted,
  their ruins by the farm belt's shares (`AV.FARM_CUTS`: 4% whole, 30% gutted, 18% crown gone, 18% broken, 12% stumps, 6% skeletons, 12% fallen;
  the aqueduct's own, mostly standing). The creepers (`71`) and the roof trees (`88`) reach them in the wild half as they reach the towers.
- **The ground**: the model and the Overlook's relief (`AV.farmLand`), the fields terraced into the slope (2.5 m risers along the contour, fading at
  each hedge), every plinth eased in (an aqueduct module's bed over 20 m); the roads asphalt, the hub paved, the fields tilled soil, the wood's floor.
- **The pods overgrown on top** (the owner, 2026-11-10: "completely overgrown on top"; `87t`): every standing pod under a mat of vines laid on the
  dome's own facets (the kit's nine rows of a hexagon, 0.35 m off the glass, the broadleaf card across each quad, one in seven open), cut where the
  ruin tore the dome (a crown's, a broken pod's, a stump's, a skeleton's; a gutted pod keeps its whole frame), merged a mesh a 600 m cell; broadleaf
  and fern clumps on the mat, and on a broken pod's or a stump's rubble heaps (`MP.heaps`, `KRUBBLE.at`: the surface their mesh is drawn from). The
  station's own, the same at every tier: a first cut set clumps on the hero by rays, and they floated over the box shells a honeycomb's pods mostly
  are within 600 m (70 draws only the nearest 64 heroes), and fell through a gutted dome's ribs to its beds. Every foot is checked on its mat or heap.
- **The streets** (the owner, 2026-11-10: "the street modeling from the transit kit should be integrated in an overgrown and ruined way"; `46z`):
  the plan's roads as the transit kit's network (`KTRANSIT.network`: kerbs, 2.4 m pavements, junctions with crosswalks; the ring road in four arcs,
  graded on the relief at up to 30%, the ground cut by `KTRANSIT.lineH`), a riot's war at most (`KTRANSIT.war` under 0.3: no craters), drawn by
  `74-host-transit.js` as station 0's grid with the furniture dead and rusted and no gantry across a farm road (`STAGE.transit` without the lines:
  `74` draws only what a station has); weeds through the cracked asphalt along a ridged noise, the kerb joint and the seam, a bush on the pavement
  here and there (`87t`), and the wild wood let onto the roads at a quarter of its strength.
- **The thicket** (`87t`): what the south-west lowlands' zones grow rain-fed with a card (`kits/crops`, `CROPS.forBiome('swlowlands')`: twelve,
  annatto to indigo, four of them tree crops; the measure melon waits on its card in the crops kit's pack), each field's rows of clumps (one plant a cell of the card's sheet, three crossed quads) broken
  by noise and grown wild about their feet, each orchard's trees on an 11 m grid with suckers between, grown feral by the valley's wrap and capped at
  14 m; the lowland kits' wild wood everywhere else, thin in the fields.
- **The city below** (`70t`): the shelf's and the floor's towers as rusted prisms 3 to 16 km out on the model's ground, under the page's fog, the
  mist pooled over the shelf (STAGE.smog: no band of cloud here).
- **The checks** (`STAGE.shared`: the hand of man, dry ground, the impostors hidden, the feral forest, no tree on a road or plinth, the cards cut;
  and the station's own, each with a negative): every farm building on its plinth (the drawn ground level under its box), nothing in a road (a
  building's box, an aqueduct's piers, a pylon), the aqueduct continuous on its bed, every road under an arch, the wires clear of the ground, the city
  below off the page and above the lake, the fields gone to thicket (plants, trees, crops, every card mapped and inside one cell, none on a road),
  the farm belt ruined, the pods overgrown on top (every foot on the drawn dome), the streets the transit kit's (every road, its junctions, the
  furniture dead, no crater, the weeds on their road's surface); the plan's own tests add the honeycombs (four arrays of twelve or more on the
  lattice, no two pods closer than 52 m, no walls overlapping).

**Numbers (2026-11-10, `verify.py --assert --all-views` on the GPU, 1280 x 800):** 46 farm buildings and 25 aqueduct modules (the tiers: 71
towers), 33 roads and 9 crossings under arches, 36 pylons (120 wires), 2,621 towers in the city below, 1,956 fields: 180,729 crop clumps and 24,877
orchard trees, every one grown by the feral wrap; 14.97 M scene triangles (budget 20 M), the lowland trees 6.59 M of their 8 M (the wood's quality
held at .9 and .7: at 1.6 and 1.1 it was 13.9 M and two items passed the 250k instance cap). Per view 530 to 695 calls (ceiling 1,200) and 3.1 to
5.2 M triangles, the hub town the worst. Every assert and negative passes.

**Numbers, the second pass (2026-11-10, `verify.py --assert --all-views` on the GPU, rtx lane):** 223 towers (147 pods standing, four arrays of
nineteen), 12,579 quads of vines over the domes and 22,225 clumps (4,192 on the heaps), 32 transit roads with 31 junctions, 3,223 furniture pieces
and 2,697 of a riot's war, 82,142 weeds; 15.86 M scene triangles (budget 20 M), 678 to 825 calls a view (ceiling 1,200); the attach audit 0.45%
floating (limit 1%). Every assert and negative passes. The build ran 73 s with other sessions' jobs on the machine (the first cut's Terraces 30 to
55 s): the honeycombs' 176 pods and the roads' cuttings both cost the forest kits' ground samples (`KNOWN_ISSUES.md`).

**The atmosphere panel** (the owner, 2026-11-10: "add controls for the atmospheric effects", then "let me select sky color, cloud pattern, trigger
environmental effects"; `98-host-atmos-ui.js`). A foldable panel at the bottom right of every station's page. AIR: haze (the fog's density, scaled
after the sky writes the hour's fog), the smog's mist and band, cloud cover, radiation, the distortions on or off. WEATHER: every mode the page offers
(the oily rain among them). SKY: the clouds' mood held by hand, each part on its own and "auto" giving it back to the shifting episodes: the sky's
colour (the mood's palette, two more, or any colour) and its strength, the darkness, the cloud pattern (still, violent, ordered streets, glitched
sheets, ripple rings) and its strength, the glow (ethereal, lightning, orbs) and its strength. EFFECTS: a lightning strike ahead (the lightning fx's
bolt and a flash under the cloud), a pillar of light and a light ascending (the sky events, drawn as the mood's own), and the sky back to auto. The
spot an effect lands on is drawn from core/rand by how many have been asked for. A viewer's control: nothing is saved or exported.

**The flora, audited** (the owner, 2026-11-10: "audit flora for 1) orientation, 2) proper cut-out of leaves, and 3) attachment"). On all three pages:
- *Orientation:* the Terraces' crop and orchard cards loaded with three's default flip (`flipY`), so every crop stood upside down and its cells were
  cut from the mirrored rows ("cotton is upside down"); they load unflipped now, the library's convention. A page check holds it for every card cut
  from a sheet's cells (`HCHK.cardsUp`, with a negative). Elsewhere only a few staghorn ferns (epiphytes) lean past level.
- *Cut-out:* the crop and creeper cards are generated nine-plant sheets on a rough grid; the even thirds cut a straight edge through leaves that
  reach past them ("the herbs still have a straight boundary"), and the creepers and hanging moss drew the whole sheet on each quad (a 3 x 3 grid of
  clumps: "hanging moss is definitely not cut out properly"). Each plant is cut by its own box now: `card_rects.py` measures them from the packed
  textures into `41e-av-cardrects.js` (`AV.CARD_RECTS`, read by BIO.geo.cells' o.rects). Every readable alpha map is cut (`HCHK.cardsCut`).
- *Attachment:* core/biome's attachment audit finds 0.2 to 0.4% of the leaf cards clear of a branch (blooms, needles, lance leaves: the core's
  known 1%, KNOWN_ISSUES).

**The farm buildings walked into** (the Terraces, 2026-11-10). Their walls are single strips facing out, so from inside they stood transparent ("it's pod
walls that are transparent from inside"; the aqueduct's trough read the same from above): the eight farm families' heroes take two-sided copies of
the kit's materials (`70`, `avTwoSided`). A ruined farm building keeps no piece that touches nothing (`avDropFloaters`: the kit lets a ruin keep loose
remnants, and the crown water tower's gallery hung in the air with palms on it). And the Terraces' towers were turned in three.js's sense while the
page draws the plan's since the lobbies' finding (the yaw's sign): every farm building and aqueduct module drew mirrored, the aqueduct's modules
skewed off their line ("aqueduct does not align segments properly"); `41d` stores the plan's yaw now.

## Read next

`PLAN.md` (the brief and the decisions), `PLAN-ANOMALIES.md`, `INDEX.md`, `KNOWN_ISSUES.md`, `PORT.md`; `kits/metropolis/README.md` for the towers.
