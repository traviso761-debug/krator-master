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
| the flood lake's high line and its rafted wreckage (station 2, over NW lowlands) | | later |

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
2. **`highline`: the flood lake's high line over NW lowlands** (later).

## 4. Order of work

- **S0** the split of n semiarid's page; the build; the coulee station (terrain, water, fields, tint, views); the checks.
- **S1** erratics; the pothole pools' own flora.
- **S2** the second station (needs NW lowlands' rock zone and bed response: `biomes/nsemiarid/PLAN.md` section 8).
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
