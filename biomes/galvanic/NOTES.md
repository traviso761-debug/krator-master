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

## Stations 2 and 3, the Deep and the Gossan Hills (built 2026-11-17)

- **One stage, three sites.** A station's folder holds one line (`stations/<name>/44z-host-site.js`: `STATION_KEY`); its site record
  (`GALV_SITES.<name>`, `[G data]`) holds the shapes, and the stage, the ground, the water and the probe read each shape when the record has it (no
  `deep`, no Deep; no `hills`, no hills; `base: 'hill'` for a slope in place of the strand). Station 1's page rebuilt to the same instances
  (127,581), triangles (1,604,862) and checks after the change: its numbers did not move, only its bytes (the new code it carries unused).
- **The flood's datum.** On the strand and at the Deep the flood is the sea's; on the hill it is the water table's (`DATUM`), read against the slope
  without its channels (`GROUND0`, `CUT`): a stream's bed under the table is the stream's water, not a drowned cathode. Every check reads a record's
  flood through `OVER(x, y, z)`, so the strand's numbers are what they were.
- **The iron hat is dead ground.** A gossan is what is left when the sulfides have been leached: iron oxides, no couple. The life keeps off it
  (`HAT_AT`, the placement's keep, a probe check with a negative); its pores run ~4.2. The battery lives on the line where the ore crosses the
  table, and dies below it where the ore lies drowned (the seep stream's stumps): the plan's "the iron hat above, the reducing ore below, masts in
  the seeps on the line between", drawn by the store's own rule.
- **The geobattery's number** (`GALV_PHYS.emf`, `GALV_PHYS.sp`): pyrite at the gossan's pH 3 and the air's oxygen against a reducing depth at
  -0.1 V gives 0.68 V; half of it on a pole at 30 m reads -0.34 V over the top and -0.03 V 300 m off, inside the field's -0.1 to -0.6 V.
- **The chimneys** are the site's records, registered, seated on the lowest ground of their (tilted) foot and listed as obstacles before the
  placement; the reefs and runners crowd their feet through `GALV.place`'s `o.spires`. Relict and geological, not a built ruin, so not on
  `core/ruins` (which watches wreckage); the probe checks the seating itself, with a negative.
- **A page with no trees fails a core negative**: the card audit's "every card lifted 6 m" cannot fail with no cards. The Deep's page took the hills'
  foot on its north edge (and the Rift's trees on it) rather than leave the harness a check it cannot run.

## The move (2026-11-17)

- The owner moved the battery nearer Sauropolis: the stations now stand on the north strand at px 780,1576 (50 km from the city). Only the site records
  changed (px, world, sky, the survey's climate); the pages are ideal types, so their shapes did not move. The model has no vent there
  (`KNOWN_ISSUES.md`, for the scale-model queue). The owner's other answers the same day: the Lizardmen work the strand (nothing drawn yet; station 4
  waits), and the relict black smokers are **galvanic chimneys** ("Chimney").

## Lessons

- A placement pass over a 5 km page at a 3 m cell put 530,000 crusts on the strand (28 M triangles): budget the cell before the first build; 6 m
  and a lower acceptance holds the showcase.
- The terraces must not stop at the sea's highest water: the strand under it is where most of a stream runs. They run to the dry season's shore.
