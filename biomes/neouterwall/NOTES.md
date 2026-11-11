# neouterwall — notes (stations 1 and 2, 2026-11-10)

**Where it stands on the model.** The cut is `region/data` (`tools/scale-model/extract_region.py ... "ne outer wall" --add region/horizon.json
--upsample 2`: 909 x 729 cells of 1 km, px 1016-1466 x 156-516, the polygon 109,612 km²; the regions and settlements written out from the model's page defaults,
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

**Stations.** A station's folder (`stations/<name>/`) replaces `src/44r-host-site-rec.js`, the station's record (its toe, dikes, springs,
stair, snow, hour, views, and station 2's `rockTint`); `src/44s` builds and reads the landforms from any record. `region/horizon.json` holds
one 320 km box a station (the cut grew to px 1016-1466 for station 2's; station 1's heights and ridges came out byte-identical, only its
`places` list gained Coyote Canyon). Station 2: px 1185,345.9, base 2,810 m, WH +10 °C, 2,212 mm.

**The opening hour.** Both stations open at midday (station 1 13:00, station 2 12:00), not the frame's 10:00: at these pixels (23-25
degrees east of the W outer wall's, toward the sub-giant point) the giant eclipses the sun from 09:00 to 10:59 on the season's day
(`ATMOS.sunHidden`), and the page opened in the dark.

**Station 3 is a different kind of page** (`SITE.kind:'badlands'`): no tarn, no springs, no stair. Its folder replaces the site functions
(`44s`) as well as the record; the frame's other fragments read the same interface and do nothing where a station has no springs (no
KTHERM field, no snow mask, no water records), and `99` picks its checks by the station's kind. Two frame changes it needed, harmless at
the cauldrons: `38c` (the landform kinds) is on every page, and `groundW`'s tree line is `NEOW.BANDS.treeline` (station 3 takes Köppen's
10 °C: ET is treeless), the gully walls bare. Station 3 also opens at noon (the eclipse, as at the cauldrons).

**Stations 4-5a have their own cut** (`region/data-east`, `region/horizon-east.json`: px 1078-1600 x 168-516), written by
`NEOW_DATA=data-east python3 region/far.py`: re-cutting `region/data` wider would have moved stations 1-3's bytes (their `places` lists
change with the box). The map edit 5.1 edit 1 (`tools/scale-model/edit_511.py`) had already carved the Portal Valley and recorded
`tube_epidote_16` when station 5 was built: the plan's "waits for the map edit" was stale.

**Kinds.** `SITE.kind` is `cauldron` (1, 2, 5), `badlands` (3), `scarp` (4) or `portal` (5a); `99` picks its checks by it. Cave mouths are
`SITE_MOUTHS` (any site may give them; `47` cuts them with `KCARVE` and meshes their hoods on the ground's material, the W outer wall's
cave-house code). The tree fern and the reeds grow only where there are springs (`NEOW.THERM`); a wall's face (grade over .95) is a
`field` to the NW outer wall's tree passes, so none roots there.

**The cave station (5b) is its own frame.** `stations/cave/station.json` says `"frame": "cave"`; `build.py` hands such a station to
`build_cave.py`, which assembles `stations/cave/`'s fragments (forked from `biomes/hearths`' Cave of Crystals, its hold's massing and its
selenite left out) on the cave core (KCAVERN, KSPELEO, KKARST, KTHERM, KGROUND, KHAZ). Its own material adapter and pack
(`stations/cave/materials.json`, `tex/`: marble, the skarn stand-in, gypsum crust, alabaster for the gypsum crystals), inline in the page.
Its checks: the hall carved to the record's size, its floor in the 5.6-5.9 km band, the cupolas open, the dress drawn, the gas pooled, the
pools' heat, sealed (no vent), the view cameras in the open. `verify.py` takes a page's own export profile and box (`_api.exportProfile`,
`exportBox`): the cave has no flora, so no items or buckets.
