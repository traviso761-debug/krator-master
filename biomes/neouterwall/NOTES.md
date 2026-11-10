# neouterwall — notes (station 1, 2026-11-10)

**Where it stands on the model.** The cut is `region/data` (`tools/scale-model/extract_region.py ... "ne outer wall" --add region/horizon.json
--upsample 2`: 785 x 689 cells of 1 km, the polygon 109,612 km²; the regions and settlements written out from the model's page defaults,
`51-region-store.js` `defRegs` and `60-settlements.js` `defSetts`). The region store already names this kit for the polygon (`kit neouterwall`).
`region/far.py` writes `station-vitreous.json`: px 1260.75,327.8, base 2,950 m (the tarn's level), 1.11 atm, WH, +9 °C, 2,494 mm, latitude
-31.4; the grid 49 x 49 km round it with 125 water cells (the tarn); the far land's three bands at ~21, 47 and 125 km.

**The tarn on the 1 km grid** is ~15 x 11 km at 2,940-2,949 m with no shore: its cells meet the wall's (3.2-3.8 km) directly. The bicubic
ground makes that a slope of ~40-55 degrees for the first 600-800 m. The station's spring apron (44s) is the shore; the tarn's bed is sunk
60 m under its middle (45: `tarnBed`) so the water reads deep.

**Why the page's y = 0 is the tarn.** The shore pixel's bilinear height is 3,474 m (half-way up the wall). A page whose y = 0 is there
puts the water at -524 m and the climate in the wall's Dfc cell (+3 °C), where the plan's cauldron is +9 °C (WH). far.py's `level` and
`clim` keys take the tarn's level and its cell instead; nothing else in the frame changes.

**The dikes.** Three `KSTACKS.row` rows (SITE.dikes): `dikeW` (9 fins, 60-150 m) and `dikeE` (6 fins, 50-130 m) on N25E across the apron and
into the water, `dikeN` (7 fins, 30-70 m over the tarn's bed) across them out in the tarn: the cell's walls. A fin's foot is set under the
lowest ground round it (a fin on the wall's slope buries its uphill side). The ground under a fin is not raised (the fin is its own mesh);
its footprint is the `dike` zone and the zone raster widens it by a cell so nothing roots against it.

**The springs' heat** is one `KTHERM` field (vents: each spring a point, 40-95 °C; the stair two line vents, 62 and 38 °C; the fault's seep a
line at 26 °C along the springs; the soil +9 °C). The zones, the ground's weights, the tree ferns' warmth and the snow mask (`snowMask`,
`ATMOS.snowBare`) all read it.

**The NW outer wall read in place** (as the W outer wall reads it): its passes run in its own registry (`BIO.kitWrap`), so this kit's passes
that use its grid (`NWOW.place`) only note candidates inside it and draw after, in this kit's registry; and its `place` hands an accept the
nwouterwall zone, so this kit's accepts read `NEOW.zoneAt` themselves.
