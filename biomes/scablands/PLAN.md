# The scablands: an overlay (plan)

The second of the north basin's two **overlays** (`biomes/nsemiarid/PLAN.md`, sections 3, 4 and 6; the other is
`biomes/dambasins`): the ground the dam break's flood tore down and is gone from. An overlay owns no ground: it lies over
the biome that is there (n semiarid; the flood lake's dry bed lies over NW lowlands too), shapes the land after the
biome's own detail, writes the fields the biome kits read, places its own objects, and has only the flora that means
nothing without it. Its weight comes from physics: the ground under the flood's water surface along `DATA.floods`.

## 1. What it is made of

| part | where it comes from | state |
|---|---|---|
| the channels' landforms: the scoured floor, butte-and-basin cut in steps of the basalt flows, dry falls and their plunge basins, potholes (kolks), bars with giant current ripples, streamlined loess islands | `core/terrain/41-core-scour.js` (`KSCOUR`), with its node test; a station's scales (`islandL`, `islandW`, `fan`) added 2026-10-23 | **built** |
| the rock the flood cut: flood basalt in flows 15 to 50 m thick (columns at a flow's foot, the hackly entablature over them, a red interbed on top) over sandstone and limestone; loess over all | `KSCOUR.strata` | **built** |
| the coulee itself (its walls stepped by the flows, the dry falls' horseshoe cliff) | the station's stage: in the open world the scale model's heights hold the channel at 4 km, so `KSCOUR.land` adds only what lies under a cell |**built** (2026-10-23) |
| the flora | the n semiarid kit, read in place; its zones read the fields (`rock`, `scour`, `slope`, `wet`): scoured basalt is near bare, the loess islands keep the steppe |**built** (2026-10-23) |
| the water: the plunge-pool lake under the falls (Dry Falls Lake), potholes holding rain | `core/water` still records |**built** (2026-10-23) |
| erratics: dam concrete with rebar, carried kilometres; basalt boulders | this build (`ERRATICS` in the stage, `87-host-erratics.js`; its own library pack) | **built** (2026-10-23) |
| its own flora: the pothole pools' plants (kolk lilies, pothole quills, seep sedge, spray ferns at the falls' foot) | this build (`72-biome-scablands-pools.js`, its own kit registry and pack) | **built** (2026-10-23) |
| the flood lake's high line and its rafted wreckage (station 2) | `stations/highline/`: KBASIN's flood lake (kind `flood`), KSCOUR's fan, the dam basins' flotsam (`DBF`) and wrecks (`DBW`: the hulks, 2026-11-10) read in place | **built** (2026-11-09) over n semiarid's share; the NW lowlands half owed |

## 2. The engine

**The n semiarid kit is the engine**, read in place the way the dam bed reads the Ancient Port kit: `build.py` imports
`biomes/nsemiarid/build.py` and calls its `build(overlay=...)` with this folder's `src/` (which shadows the kit's
fragments by name and adds its own) and `core/terrain/41-core-scour.js`. Its pack of library textures is the kit's.

For that, n semiarid's page was split (2026-10-23) along the line a stage crosses:

- `45-host-scene.js`: the renderer, scene, haze, camera, lights, ticks, registry (the page's, any stage's);
- `45b-host-stage.js`: **the stage** (its map, terrain, water, fields, the biome binding, `STAGE_WATER`, `STAGE_GROUND`);
  this build's own `45b` is the station;
- `45c-host-ground.js`: the painted ground for any stage (its hooks: `STAGE_GROUND.rows`, a channel the mesh snaps to,
  and `STAGE_GROUND.tint`, an overlay's tint over the palette);
- `98-host-checks.js`: the kit's checks and inspector (`HCHK`), naming no place;
- `99-host-take.js`: the stage's views, its list of checks, and the page handed to `core/host`; this build's own `99`.

## 3. Stations

1. **`coulee`: a coulee and dry falls on the west breach** (over n semiarid). The west breach falls 417 m in 216 km;
   KSCOUR finds its dry fall at km 205 (110 m, where it meets the trough). The station is that reach in small (6.6 km
   square): the channel floor 2 km wide running north, scoured to butte-and-basin and potholes upstream; the dry falls,
   a horseshoe cliff ~107 m high across the coulee, with its plunge-pool lake; the lower coulee 260 m deep under the
   plateau, bars and giant current ripples on its margins, a loess island standing in it like Steamboat Rock; the
   plateau's steppe above the rims.
2. **`highline`: the flood lake's high line and the west breach's fan** (built 2026-11-09, `python3 build.py --station highline` ->
   `dist/highline.html`; "Station 2, as built" below). Built over **n semiarid's** share of the flood lake (43,600 km², the larger); the
   plan's half over NW lowlands is `--station highline-nw` (2026-11-10, `dist/highline-nw.html`; section 8), on the NW lowlands kit.

## 4. Order of work

- **S0** the split of n semiarid's page; the build; the coulee station (terrain, water, fields, tint, views); the checks.
- **S1** erratics; the pothole pools' own flora.
- **S2** the second station: **built 2026-11-09** on n semiarid's side, and its NW lowlands half **2026-11-10** (`highline-nw`, section 8) on
  NW lowlands' new rock zone and bed response (`biomes/nsemiarid/PLAN.md` section 8).
- **S3** `WORLD_OVERLAYS` in the north-basin open world.

## 5. Checks (`verify.py --assert`: n semiarid's harness, on this page)

The kit's own checks that apply here (every species tagged, nothing drowned, no tree on a rock face, the wind and the
seeds, the variants), and the station's:

- **the falls**: a cliff across the coulee at KSCOUR's fall, its foot at least 90 m under its lip, the lip's horseshoe
  bowed upstream; the plunge lake at its foot;
- **the coulee's walls stepped by the flows**: benches on the walls at the strata's flow tops, more than chance;
- **the scour bare of trees**: the kit's trees and shrubs thinner on scoured rock than on the plateau's steppe (its small
  plants and stones it heaps on rock by design: reported, not judged);
- **the erratics sunk in the floor**: every one in the ground and out of it, none in the water, all on the coulee's floor;
- **the pools' flora in its places**: lilies on their pool's water, quills on the waterline, ferns at the falls' foot;
- **the water held**: the plunge lake's and every pothole pool's shore over its level all round;
- each with a broken input that must fail.

**Geodes** (planned 2026-11-03; planned in full and built 2026-11-09): the coulee walls cut through the flows' geode-bearing tops, so
station 1 shows small amethyst geodes in the walls and on the talus, and one walk-in geode (`biomes/CRYSTAL-CAVES-5.1.md`, site 3).
- **Where geodes are**: a flood basalt's gas bubbles rise to the top of each flow and are filled later by silica groundwater, so the
  geodes lie in **the band under each flow top** (`SC.strata.tops`): the top 30 per cent of a flow's cliff, under its bench.
- **The records** (`core/terrain/39f-core-geode.js`, `KGEODE`, `[G data]`, node-tested with negatives): `KGEODE.scatter` on a cell
  lattice hashed by (world, cell, salt): **wall** geodes in the band where the drawn ground is steep, broken open by the coulee's cut
  (their cut face out along the ground's normal, half the shell left in the rock), and **loose** geodes on the gentler ground within
  60 m below a band (weathered out and fallen: whole nodules, a share broken in halves). Each `{id, kind, x, y, z, r, split, n, az,
  rind, mineral: 'amethyst', band}`.
- **The walk-in geode**: the drawn ground's cells are 10 m, too coarse to open a 4 m mouth in a cliff (Copper Glacier's lesson), so the
  walk-in geode is in **a fallen block of a flow top** on the talus at a wall's foot: `KGEODE.block` adds a KCAVERN `mass` (the block,
  9 by 8 m and 7 high, its top capped) and a `hall` inside it (a round pocket, 2.3 m in radius, 4.4 high) whose front the block's
  broken face cuts open (a `door` opening); `KGEODE.line` lines it with amethyst points (KSPELEO reads a void inside a mass as
  under the sky and would not dress it). Placed below the west
  wall in sight of the dry falls; an obstacle for the kit's plants, registered.
- **The drawing** (`core/terrain/host/39g-core-geode-draw.js`, `KGEODE.draw`): instanced pieces, one draw each: whole nodules (a knobbly
  grey-brown skin), half shells, cut faces (the agate rind's bands in the vertex colour, the cavity dark), amethyst points (the
  scattered geodes' and the walk-in's druse, translucent purple with a cheap fake glow); the block on `KCAVERN.drawRock` in the flow
  top's vesicular basalt, the pocket's walls in the agate rind.
- **Textures** (the library's, no new set): `stone.geode.druze` (the Throne's druse, its reuse note "any crystal-lined cavity") toned
  grey and coloured amethyst by the material; `stone.onyx` toned grey-blue as the agate rind; `rock.basalt.vesicular` (this overlay's
  `basalt`) for the block.
- **Checks** (each with a negative): every wall geode in a flow-top band and on the drawn ground; every loose one on gentle ground below a
  band; the block standing on the ground (its foot in the drawn ground all round, the ground under its pocket below the pocket's floor), its pocket and door open; the
  pocket's druse fixed to its rock.
- **Views**: the walk-in geode from outside, inside it, the geodes in a wall's flow top.
- **The minerals** (the owner's references, 2026-11-09): `KGEODE.MINERALS` names seven fillings, each a crust habit and a rind palette:
  amethyst (white quartz at the rim, purple deepening inward: most of them), quartz, celestine (blue blades in a chalky rind),
  chalcedony (blue botryoidal pillars in a green crust), watermelon (pink and green bands, tourmaline prisms green at the foot and pink at
  the tip standing out of the face), and two no basalt grows: aura (a teal, blue and violet film) and bismuth (stepped hopper crystals
  in a rainbow film), moved out of the coulee on 2026-11-09 (bismuth to the Throne's vents, aura to Godstep's plan). The coulee's
  palette: amethyst .6, quartz .12, chalcedony .1, watermelon .1, celestine .08. Geodes are ovals, not balls; half the broken loose ones lie with their other half beside them; the walk-in geode's
  lining grows longer and darker toward the back of its pocket.
- **Drawn by distance** (2026-11-09): every piece is chunked (240 m squares) and a chunk shows only while the eye is within its piece's
  range (shells and nodules 240 m, faces 170, druse and tourmaline 90, the other crystals 60: `KGEODE.draw`'s `update`, this page's tick).
  The geodes hold about 0.85 M triangles in 729 meshes; standing by one, about 40 meshes and 43 k triangles are drawn.

Core adoption for the geodes: `core/terrain/39-core-cavern.js` (KCAVERN),
`39f-core-geode.js`, `host/39e-core-cavern-draw.js` and `host/39g-core-geode-draw.js`, added to this overlay's `CORE` in `build.py`.

## 6. Core adoption: the final rebuild's turn (2026-11-03, pair 9)

The coulee takes the kit's turn as it reads the kit (`biomes/nsemiarid/PLAN.md` section 11): the graphics set (`46-host-graphics.js`), the
variants' far level on impostors, KGROUND on the kit's painted ground (with this stage's tint under the layers), KFAR past the map (the plateau
and the coulee by this stage's `terrainH`), KHORIZON, height fog, the rain cover, the air's load with a dust storm, breakup, the water's fields and
the edge audit (`99-host-take.js` `edgeCheck`), `BIO.flareJoin`, and the species fixes (the solid bodies as wood, the gliders and the kiting blades
`free`, the drift's back row lower; a kiting blade never under the plunge lake). This page's own: **`WATER.mirrorSwitch` on the plunge lake**, off at
page load (`?mirror=probe|live`). The rock stays `KSCOUR.strata` (the basalt flows that step the walls): KSTRATA would be a second copy of the same
beds. **Not taken:** karst site 10's spring line at the basalt's base (`biomes/KARST-SITES-5.1.md`, "low gain": a note for the coulee's next pass);
the overhanging lip (KNOWN_ISSUES.md).

## 7. Station 2, as built: the flood lake's high line (2026-11-09)

`stations/highline/` over this overlay's `src/` (`build.py --station highline`, new: the station's `station.json` drops the coulee's pools flora and
geodes, names its own core and its pack family). On n semiarid's side of the flood lake, in small (R 3 km), on the plan's levels (834 m, the trough
at 430: scale model 5.1 has moved the trough, so the levels are the plan's, not the model's).

- **The land**: a plateau east (~880-980 m, the steppe the water never reached) falling west into the old basin (~600 m at the edge). The **west
  breach's mouth** enters from the NE (`KSCOUR`, no falls, its bed 800 to 700 m, under the lake all the way) cut ~170 m into the plateau and spreads
  its **fan** of bars and giant current ripples onto the bed. Over it, **KBASIN**'s flood lake (kind `flood`: no ring, no fast drain; the scour
  first, the lake's marks over it, as its strandlines came after): the **high line** at 834 m with its wrack band, and **63 strandlines** of the slow
  recession from 814 m down, the ground benched on them.
- **The wreckage**: the **wrack** stranded in a band just under the line (the dam basins' flotsam kind, `DBF`, read in place as `45a-db-flotsam.js`:
  torn plating, I-beams, containers), a few further down on the strandlines; the coulee's **erratics** (the dam's concrete with its rebar, basalt) on
  the fan's bars. Textured from this overlay's pack (`rust`: `metal.rust.plate`, packed into this page only).
- **The ground**: the slackwater **silt** under the line, banded where a bank is cut (the rhythmites); the wrack line dark; the fan's gravel and its
  ripples; the kit's steppe above. A **rain pond** behind a bar (a `core/water` still).
- **The flora**: the n semiarid kit read in place on the fields (the bed its lowland desert, thinned to two fifths: `56`, KNOWN_ISSUES.md; the plateau
  its steppe): step cones on the bed reading the years dry (the line came out first), crawlers, dew gardens, the steppe's frills and trumpets.
- **The hulks** (2026-11-10): five of the dam lake's own boats (a barge, a coaster, a tug, two trawlers: 27 to 67 m), torn from their moorings,
  rafted through the west notch and set down on the line as the lake began to fall. Drawn by the dam basins' wreck kind (`DBW`,
  `biomes/dambasins/src/50-db-wrecks.js`, read in place as `45a-db-wrecks.js`: rusted plating holed above the silt, decks rotted through,
  wheelhouses, masts standing or fallen). Records in the stage (`HULKS`): `DBW.records` cell-seeded on core/rand, accepted only in KBASIN's band
  `high` (the line's top 6 m), 250 m apart at least; each laid along the line (its contour, either way, turned up to 25 degrees), lying on the
  ground's tilt across its beam and heeled further toward the bed (at most 20 degrees in all), its keel sunk a third to two thirds of its depth; whole
  or half buried (DBW's snapped hulls list their halves opposite ways, which a slope would not allow). Each registered (`REGISTER`: a core/tags
  record, class `prop`, kind `wreck`) and an obstacle (a row of circles down its length) before the kit plants; the stage's `mask` keeps the
  kit's rolled offspring (mace heads, roll-egg trails) out of their footprints too, and the wrack and the erratics keep out. Drawn by `87h`,
  textured from the wrack's `rust`. **Why not the Ancient Port kit's great ships** (140 to 370 m): they stayed in their berths on the dam bed, where
  the dam basins ground them; what the surge could raft through the notch was the lake's working craft. Reading a port vessel here would mean
  sealing the whole port kit (its core, its stream, its materials and pack) into this page: not done.
- **Checked** (`99`, each with a negative): the kit's (the water's edge, tagged, dry, no tree on a rock face, the variants, the cameras, the bed's dust,
  the step cones by the years dry) and the station's: the wrack in its band and none over the line; the strandlines all under it and the bed benched on
  them; the silt under the line and none over it; the fan's bars at the mouth, not up the coulee; the wrack and the erratics half buried; the wrack drawn;
  the hulks on the line's band (negative: lifted 20 m), half buried with the keel in the silt and the deck out of it (lifted 10 m; sunk 30 m), heeled
  toward the bed (their lists turned), no rooted plant of the kit's inside one (a plant put in one), all drawn. View: `A hulk on the high line`.
- **The half over NW lowlands**: section 8.

## 8. Station 2's NW lowlands half, as built: the high line in the lowlands' forest (2026-11-10)

`stations/highline-nw/` (`build.py --station highline-nw` -> `dist/highline-nw.html`): the flood lake's 32,600 km² over NW lowlands, in small (R 3 km),
on the same lake record as station 2 (KBASIN kind `flood`, 834 m, the trough at 430, age 1000, recession 600) and the plan's levels. **Its engine is the
NW lowlands kit**, read in place by `biomes/nwlowlands/build.py`'s new `build(overlay=...)` (n semiarid's form; `station.json` `"kit"`), not n semiarid:
the page is the lowlands kit with the station's host fragments over it (`README.md`).

- **The land**: NW lowlands' Mediterranean hills west (840-1070 m: the survey's Csa, ~935 m), the kit's own old forest that the water never reached;
  the **high line** at 834 m running north-south near x -700; the **old bed** falling east to ~600 m, its silt (rhythmites on a cut bank) and **63
  strandlines** the ground is benched on; a **spur** out of the hills across the bed's north whose nose is an island: the rising lake poured through the
  gap, **the strait**, a `KSCOUR` course (no falls) cut ~100 m into the spur and scoured to the flood basalt (`KSCOUR.strata`), its bars and giant current
  ripples spread in the bay behind; a **rain pond** on the bars (a `core/water` still).
- **The flora: the kit reads the fields** (`biomes/nwlowlands/src/57-biome-nwlowlands-overlay.js`, `biomes/nsemiarid/PLAN.md` section 8):
  - on the **rock** (the scour, every face steeper than ~35 degrees): the kit's **crag pines**, stunted, in ones and twos in its cracks, its **tussock**
    and **saltbush** in the hollows, boulders; the kit's own trees and floor kept off it;
  - on the **silt** under the line: **young forest**, the kit's pioneers in even-aged stands of one species (candle birch and spindle poplar, pale
    paperbark where it is wet, tall wattle where it is drier), each stand's height by its ground's **years dry** (`yearsDry`: the line came out
    first, so the stands under it are the tallest, about .9 of the species' height, the youngest toward the trough about .65); the kit's mature forest
    thinned on the silt and coming back toward the line;
  - above the line the kit as it is (Csa: ghost gums, she-oak, needle cypress, crag pines, banksia, grass trees, wattle).
- **The wreckage**: station 2's wrack (the dam basins' `DBF`, read in place; this overlay's `rust`) stranded in its band under the line, **among the young
  forest's trees** (the trees keep clear of it: every piece an obstacle); the coulee's erratics on the strait's bars and a few on the line.
- **The ground**: KGROUND with relief on the kit's six layers (the young forest's litter on the silt, the hills' lawn and red soil, the bare silt,
  mud at the pond, the bars' shingle) and a seventh, this overlay's `basalt`, on the scoured rock; the paint under them (the strandlines' benches, the
  wrack line dark, the ripples' crests).
- **The universal set**: KGROUND with relief, KSHADOW attached and off at load, core/rand (every placement a lattice cell's `KRAND.hash`), core/tags
  (`BIO.init({tags:'scablands'})`), core/water (the pond, its fields, the edge audit, the mirror switch off at load), KFAR past the map and KHORIZON,
  core/atmos (the shared sky, wind, A2C, wet ground, height fog, rain cover), core/host's whole interface (the inspector, polygon and path tools).
- **Checked** (`99`, each with a negative): the pond's edge and the environmental fields, nothing in the pond, no tree on a face steeper than 45 degrees
  (the drawn ground: the station's mask refuses a drawn cell that steep), the cameras over the drawn ground; the wrack in its band and none over the line,
  **the wrack among the trees** (half or more with a tree within 30 m, none with a tree standing in it), the strandlines and the benches, the silt under
  the line and none over it, **the young forest** (on the silt, under the line, its height by the years dry), **the rock** (the crag pines on it, the
  kit's trees off it, its tussock and saltbush), the strait's fan at its mouth, the wreckage half buried, the wrack drawn.
- **The budget**: 13.9 M triangles held (the trees' pass 11.3 M: the kit's hill forest about half, the young forest's ~8.4k trees the rest), 0.3-7 M drawn
  at the presets; declared 15 M / 12 M (station 2's n semiarid half: 19.5 / 16 M).
- **Owed**: the hulks (both halves); the sky's site (px 400,170) is approximate, the levels the plan's (KNOWN_ISSUES.md).
