# nwouterwall: notes

The Yeti's High Country on the north-western Outer Wall (`PLAN.md`; `LORE.md` 6.19, "The northern frontier"). A kit on the
biome core (`BIOME-API.md`) with three stations on the scale model, as Korona's and the Throne's.

## Building it

```
python3 build.py --all                     # dist/nwouterwall.html (station 1), -taiga, -yeti
python3 build.py --station taiga           # one station
python3 verify.py dist/nwouterwall.html --assert --all-views
python3 region/far.py                      # after a new region cut: each station's cut of the model (numpy, PIL; not run by build.py)
python3 tools/textures/pack.py biomes/nwouterwall   # after materials.json changes
node core/terrain/test-frost.js            # the landforms (core/terrain/42-core-frost.js, KFROST)
node kits/crops/tests/test-crops.js        # the Thule package
```

`?season=spring|summer|autumn` (the Season select reloads the page with it): autumn by default (the owner, 2026-10-26).

## On the scale model (4.22, 2026-10-26)

The region is cut with `tools/scale-model/extract_region.py` ("NW outer wall", from the model's page and its `regions` and
`settlements` collections) into `region/data/`; `region/far.py` writes each station's cut (`region/station-<name>.json`): the
site (its pixel, the model's height there, the air, the class, the annual mean, the rain, the latitude), the model's heights in a
box ±44 km round it (~4 km a cell: the page's mid ground to 20 km follows them, bicubic, with crags where the model is steep),
its water cells, the places (Leng), and **three ridge profiles for the shared sky** cast from the model's heightfield (the
highest elevation angle at 1024 azimuths in 18-45 km, 45-120 km and 120-320 km, with the planet's curvature: SKY-PLAN 3.3's
"a horizon profile cast from the scale model at the site").

| Station | Pixel | Height | Air | Class | Mean | Rain | What it shows |
|---|---|---|---|---|---|---|---|
| 1 Leng's forest-steppe (`nwouterwall.html`) | 220,216 | 4,597 m | 0.90 atm | Dsc | +2 °C | ~300 mm | the forest-steppe's split in a valley cut into the plateau: gold larch on the shaded (south-facing) wall, plumegrass and furflowers on the sunny one; the aufeis valley; sweetroot beds on a gravel terrace; snow-potato pockets; a burn with Ivan-chai; granite tors; Leng 16 km south |
| 2 The taiga and alases (`-taiga`) | 218,190 | 5,068 m | 0.85 atm | Dsc | -1 °C (the station takes -2: permafrost) | 188 mm | open larch on permafrost, five alases (three with lakes, two drained, a pingo in one), ice-wedge polygons, caribou moss |
| 3 The Yeti Valley (`-yeti`) | 141.5,175.5 | 5,716 m | 0.78 atm | ET (the model's) | -4 °C (+11 / -19: the valley's swing) | ~95 mm | the frozen lake's north-west shore (its level 5,680 m): the Three Gifts' fields, a meltwater channel, open larch on the floor; a spur of the range climbing ~1,250 m to fellfield (woolly snowballs, cushions), a rock glacier, goldroot on the tors; the capital's domes from `kits/yeti` when it is in the tree |

Station 1's ground on the model is a high rolling plateau (the model's slope there is 0.4%), so the valley is the station's own
relief (`44s-host-site.js`). Leng (the model's settlement, px 218,224, 4,503 m) stands 16 km south of station 1: a placeholder
massing (the owner: "a far silhouette") until Leng has its own build.

Krator's latitude at the stations is 28-29 S (the sky model's frame: `ATMOS.siteAt`), so the sun is in the north and the shaded
slopes face SOUTH (+z), as PLAN.md section 1 says.

## The climate on the page

The annual mean at a point: the model's mean at the pixel, lapsing 6.5 °C a km, ±1.5 °C by aspect (sunny/shaded), and a station's
correction (`SITE.warm`). The warmest and coldest months: the mean +11 and -13.5 (the plan's forest-steppe +5 (17/-9) and taiga
-1 (12/-14)); station 3's valley +14 / -15 (the plan's +11 / -19 round -4: the sun trap and the cold pool). The bands (46) go by
the warmest month: the tree line at +7.5 °C, the fellfield under +2.5 °C. Pycrete's rule (PLAN.md section 5) goes by the mean
(permanent at or below -2 °C) and the coldest month (seasonal at or below -8 °C): station 1 is seasonal on its floor, station 2
on the edge, station 3 permanent.

## The seasons

The page is a season (a build input, read once): autumn (day 176 of the sky model: mid-March, the larch's gold), spring melt
(day 61: late November; furflowers in bloom, the aufeis at its full, the winter's last snow lying in patches everywhere the slope
lets it), summer (day 121: mid-January; green larch, fireweed in flower). The snow is `core/atmos/fx/89-atmos-fx-snowcover.js`:
a base cover above the season's line (`SITE.snow`: autumn's first snow on the high ground), and the weather (`ATMOS.bindWeather`,
climate `{cold:true}`: the Weather select's snowfall and blizzard) builds more on it, melting by day.

## Decisions (the owner, 2026-10-26)

- The stations open in autumn, with a Season select.
- Leng on station 1's horizon is a far silhouette (a placeholder massing, tagged), not a build.
- Station 2's site is picked from the model in N0 (this session): px 218,190.
- Station 3 reads `kits/yeti` now (its domes by the frozen lake). The kit is on its own branch (`claude/yeti-kit`): the station's
  build reads it in place when `kits/yeti/src` is in the tree (`86y-host-yeti.js`) and builds without it otherwise.
