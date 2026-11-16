# The Iziz cluster

The third region of sites (`openworld/PLAN-SITES.md`; the owner, 2026-11-09: Girder, Mav's Refuge and Talia "with the roads
between them"). Each town's square on map 5.1 (Girder's 30 km, Mav's Refuge's and Talia's 60 km) and a 10 km corridor
from Mav's Refuge to Girder and from Girder to Talia, cut by `tools/scale-model/cut_site.py iziz-cluster` at 500 m cells
(417 x 745 cells, 11,060 km² inside the polygon), on `core/world` at 1:1.

| Site | Model id | Px | Where | What is planned round it |
|---|---|---|---|---|
| Mav's Refuge | `skukf2qmmq` | 1024,807 | the savage hyperjungle | the spider, longcrawler and dragonfly bands camped in the jungle (`core/camp`, `kits/beast-riders` `BR_CAMP`), a track from each camp's gate to the town |
| Girder | `seed07` | 1039,869 | the savage hyperjungle | the raptor and threehorn bands, their tracks |
| Talia | `sor1zqih8x` | 1073,939 | the SE savannah rim | four farming villages and a ranch (`core/hamlet`'s `iziz` row: the Iziz Vernacular's houses, farms, silos, byres and pens), a road from each lane end to the town, joined |

The links between the towns are laid: Mav's Refuge to Girder (135 km, 1,160 m up and 1,090 m down) and Girder to Talia
(154 km, 2,700 m up and 1,100 m down: out of the crater floor onto the rim), held to 8 %, kept inside the corridors (routed
in 8 km hops, never along a river's bed). Along them stand a caravanserai every 25 km of road (a wagon caravan's day) and
a rest stop halfway between (the Iziz Vernacular's `vern_caravanserai` and `vern_rest_stop`), 20 in all, each beside the
road with a lane to it: Mav's Refuge-Girder has no inn at km 75, where the road crosses 10 km of water on a causeway. The towns themselves are their pages' (`settlements/mavs-refuge`, `settlements/girder`, `kits/talia`).

The hyperjungle grows on the savage hyperjungle and hyperjungle S, the abyssal savannah's kit (with the eastern abyss's
species it borrows) on the SE, E and NE savannah rims. The savannah reads `upland` as the height above the abyss floor
(`WORLD.abyssUp`, the kit entry's `fields`), as the retired little demo gave the abyss kits: the world's own `upland` is
0 on Talia's low rim, where none of the kit's zones would grow.

## Build and verify

```
cd openworld/iziz-cluster
python3 ../../tools/scale-model/cut_site.py iziz-cluster    # data/ (only when the model or SITES.json changes)
python3 ../../core/world/bake_sites.py iziz-cluster         # plan/sites.json (when the spec, the land or a planner changes)
python3 build.py                                            # dist/iziz-cluster.html (+ its texture sidecars)
python3 verify.py dist/iziz-cluster.html --assert            # on the GPU: KRATOR_GL=gpu
```

`verify.py` runs the world's checks round Talia's first village (seeding, the land, water and polygon, spacing, the
rivers, the roads and links at their grade, nothing on a road or village, no NaN), the region's (each site where the cut
put it, its kit growing there; the negative reads Talia at Girder's spot) and the sites' (the baked plan made again in
the browser, every camp and village on good ground, everything cleared of flora and drawn with the kits' pieces), each
with its negative. `--list` prints the views; `--views 0,4` takes shots.

## Files

| Path | What |
|---|---|
| `src/46-world-config.js` | the sites' markers, "Go to" (the towns north to south, each camp, each village), the first view over Talia's countryside |
| `src/47-world-kits.js` | the kit registry: the savannah on the rims (reading the abyss's `upland`), the eastern abyss's borrowed species, the hyperjungle with Pinnacle's numbers; a shim letting an entry name several overlays |
| `src/48-world-site.js` | the sites' spec (`SITE_SPEC`): the camps, the villages, the roads and links |
| `src/49-world-absav.js` | the savannah kit as the world reads it (a copy of Pinnacle's) |
| `data/` | the cut (`region.json` and the rasters, embedded as PNGs) |
| `plan/sites.json` | the baked plan (hash `91625700`) |
| `../../core/hamlet/21-hamlet-iziz.js` | core/hamlet's `iziz` row, first used here |
