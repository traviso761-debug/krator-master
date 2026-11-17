# biomes/galvanic: notes (the Rift battery)

The plan is `PLAN.md`. This file holds what the build learned.

## The survey (2026-11-11)

`python3 biomes/galvanic/tools/survey.py [px py]` reads scale model 5.1 (`tools/scale-model/model/data`, read only) round a point: the height, air,
rain, mean and class at the point; land, water, strand (land at or below -2,590 m), heights, rain, mean and classes within 10, 20 and 40 km; the
Rift floor's vents. The regions' polygons are in the artifact's database, not the repo, so it reads the model's classes and water instead.

## Station 1, the Gossan Strand (built 2026-11-11)

- **An ideal type**, as High Rift's pages: the model's numbers, not its pixels. The strand's 16 km from the vent to the water are drawn as ~4 km, so the
  vent's crater, the mounds, the terraces and the season's shore stand on one page; the fall (the model's -2,597 m at the hills' foot to the sea floor)
  is kept, so a metre of sea level moves the shore by ~700 m.
- **The season is a URL**: `?day=0-364` sets the sea (`GALV_PHYS.level`) and the jars' charge. Day 70 (the default) is the dry season's low water;
  day 252 the flood's top.
- **The physics drives the page**: the streams' terraces begin where `GALV_PHYS.stream` crosses pH 2.8, their colour is `colourAt(pH)`, the life
  keeps to pH under 4.6 and above the 60-day flood line, the jars sit on the flood line. The probe checks each (`99-host-take.js`, with negatives).
- **Started from High Rift** (`biomes/highrift`): its stage, ground, far field, atmos and build fragments were the nearest finished frame (a Rift-family
  station kit with acid springs); each is marked "taken from biomes/highrift". The Rift's trees on the hills are read in place as riftrim reads them.

## Lessons

- A placement pass over a 5 km page at a 3 m cell put 530,000 crusts on the strand (28 M triangles): budget the cell before the first build; 6 m
  and a lower acceptance holds the showcase.
- The terraces must not stop at the sea's highest water: the strand under it is where most of a stream runs. They run to the dry season's shore.
