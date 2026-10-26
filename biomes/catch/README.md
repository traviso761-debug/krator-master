# biomes/catch: the Catch, the sealed basin

The biggest barrier to trade between Xanadu and everywhere else (`PLAN.md`): a basin south-east of the Godthrone walled
on every side by 10-17 km crests, its floor ~18 mm of rain a year (the 4.22 correction), its water just enough: five
oases days apart, a terminal soda lake at the lowest point, the Stalkers under the sand. Four stations on one kit,
each its own page:

| # | Page | Station |
|---|---|---|
| 1 | `dist/catch.html` | **The sand sea**: linear and star dunes (to ~160 m), the gravel reg, an old lake bed with yardangs, a dead channel with its tugai dead standing (living at two seeps), salt cedars on their sand cones, a Stalker pair half under the sand |
| 2 | `dist/catch-oasis.html` | **Stair's oasis**: the spring hollow through the interior hills, its pool and seeps, Euphrates poplars, salt cedars, reeds, the eastern desert's palms and mesquite, the caravans' campground, the Hill's empty slope (Stair's site), the tunnel's southern portal with the divers' camp |
| 3 | `dist/catch-lake.html` | **The lake and the lake beds**: the soda lake (pink, teal and ochre brine on core/water), algal mats, soda crust, white efflorescence, a playa of ochre salt polygons, the old lake's strandlines, yardangs and castellated mesas of wind-cut lake beds (the White Dragon Mounds), dead channels, saltbush and brine lamps |
| 4 | `dist/catch-fan.html` | **The north fan and the walls**: the gravel fan under the 6.2 km notch, braided dry channels, the gorge's mouth, the mountain front, Kolli (the first oasis) at the fan's toe; the walls close, snow on their shoulders, bare crests above the air |

Build and verify:

```
python3 build.py --all                       # or: python3 build.py; python3 build.py --station oasis|lake|fan
python3 verify.py dist/catch.html --assert --all-views      # KRATOR_GL=gpu on a machine with a GPU
```

Read `BIOME-API.md` (the contract between a stage and the kit), `PLAN.md` (the survey, the rain, the water, the
stations, the owner's answers, the Core adoption section), `KNOWN_ISSUES.md`, `PORT.md`.

**What it takes from core** (PLAN.md section 9): core/biome (the kit), core/rand (every placement seeded per cell, the
terrain's noise), core/tags (every record), core/host, core/atmos (the shared sky with each station's ridges, the weather,
the dust, the wind), core/water (the lake, the pools), core/terrain (KBASIN's lake marks and yardangs, KSTACKS's mesas),
core/space, core/materials (the library), core/export. It reads `biomes/sedesert` in place at the oases and the
`kits/mechs` bundle (the Stalkers).

**Its flora** (`src/50-biome-catch-species.js`): the Euphrates poplar (tugai; living, gold where its water is short, dead
standing where it fell), the salt cedar (on its nebkha), the dune shrub (sand juzgun), reeds, saltbush, the brine lamp
(Krator's: the medicine for heat sickness); from sedesert the wadi palm and the mesquite. The five oases' records,
named in Yuni, Izani, Dasrī and Xanadui (proposed), are `CATCH.OASES`.

**Its resources**: `kits/resources` gained the Catch's two nodes with it, potash and alkali salts (`node-potash-*`,
`node-alkali-*`).
