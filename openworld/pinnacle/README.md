# Pinnacle: the first site at 1:1, and its roads

The first site cut off the scale model into the open world, with a settlement planned on that ground
(`openworld/PLAN-SITES.md`; the owner, 2026-11-09), grown on 2026-11-11 into a corridor region like the Iziz cluster:
the roads to the bands' raid and trade partners (`core/simulation/PROPOSAL-LONGSONG-PINNACLE.md`, S5: the sim's land
logistics book these links).

- **The cut:** `tools/scale-model/cut_site.py pinnacle`, from `openworld/SITES.json`, at 500 m cells (1,553 x 1,689 cells,
  a box of about 770 x 840 km, px 900..1284 x 482..900 on map 5.1). It is the union of:
  - Pinnacle Rock's 60 km square (`staiytii0y`, map px 1007,686): the owner kept the 60 km cut for the rock;
  - each partner's own square (its type's reach: a village 15 km, a ruin or outpost 8 km, Mav's Refuge its 30 km);
  - a 10 km corridor along each road. A corridor follows the Ancient network's route where one joins the two towns (`net`,
    `openworld/network-proposal/net51.json`), else the region's own guide on the valley floors (`guide`); cut_site.py lays
    it as a quad a stretch and an octagon a bend, and keeps the line in `region.json`'s `cut.corridors`.
- **The frame's origin moved** to the box's centre pixel, 1091,690 (it was the rock's pixel while the cut was its square).
  Every view and check reads a site's own point; Pinnacle Rock is at x -168 km, z -8 km.
  - **Moved 2026-11-10** (the owner: "a spot not too far that's got a bit more forest"): 41 km west of 1027,681, where
    map 5.1 had left the rock in the NE rim's savanna.
  - The rock is on the **savage hyperjungle's north-east edge**: a knoll 110 m over its 14 km round, at -1,287 m.
  - Pinnacle Rock's own page (`settlements/pinnacle-rock`) still stands on its own 4.21 cut (`region/`): it does not
    read this region (`KNOWN_ISSUES.md`).
- **The site:** the nine Beast Rider bands that camp on the floor round the rock, and a track from each camp's gate to
  the rock.
  - **The bands:** their tribes' `lower` grounds (`kits/beast-riders` `BR_CAMP`), each searched from the spot the rock's
    page gives its camp.
  - **The tracks:** `core/world` `ROADS`, the grade held to 8 %.
- **The links** (`src/48-world-site.js`, each along its corridor's line, laid, held to 8 %, bridged where it crosses a
  named river, a caravanserai every 25 km of road and a rest stop between):

  | Link | Line | Km | Up / down m | Inns + rests | Bridges | For |
  |---|---|---|---|---|---|---|
  | Pinnacle Rock - Port Goto | Izani highway `izani.17.22` | 186 | 1,724 / 1,758 | 7 + 7 | 0 | raids (Iziz's port) |
  | Pinnacle Rock - Talon | Beast Rider trail `trail.1.3` | 161 | 1,564 / 1,385 | 6 + 6 | 2 | trade |
  | Pinnacle Rock - Fort Kreia | guide up onto the NE rim | 131 | 2,896 / 583 | 4 + 5 | 2 | trade |
  | Talon - Mav's Refuge | Beast Rider trail `trail.0.3` | 93 | 506 / 729 | 3 + 3 | 0 | trade (Girder beyond: the Iziz cluster) |
  | Mav's Refuge - Nusidi | Izani highway `izani.20.24` | 161 | 1,134 / 1,086 | 6 + 6 | 2 | raids |
  | Fort Kreia - Fort Ordo | the trunks by the Sleeping City | 210 | 1,785 / 3,978 | 8 + 8 | 6 | trade |
  | Pinnacle Rock - Coyote Canyon | `dirt.coyote`, on the north half of the trough's floor east of the rock | 722 | 7,847 / 5,049 | 28 + 29 | 3 | long-distance trade (the coyotemen) |
  | Pinnacle Rock - Shade | guide: the trough, the gap north of the crater's east wall, south down the Nomad Country | 788 | 9,884 / 6,223 | 31 + 31 | 1 | long-distance trade (the Dasri) |

  - Fort Kreia has no network route from the rock: the network's trunk to it starts at the Crescent, 26 km south-west,
    and crosses the Talon trail.
  - The Coyote road and the Shade road share the trough east of the rock, 10 km apart on its floor: the Coyote road on
    its north half turns north-east, the Shade road on its south half turns south-east, and they never cross. (Guided
    onto the trough's north wall, the Coyote road switchbacked, and its upper leg's cut showed under the lower.)
  - Each link leaves its towns from 1.8 km out, beyond the camps' ring round the rock.
  - The stops are the Iziz Vernacular's (`vern_caravanserai`, `vern_rest_stop`), as on the Iziz cluster's Izani highways.
  - The partners' towns are not planned here: a link's end is the town's point.
- **The plan is records:**
  - `core/world/48s-world-sites.js` (`KSITES`) plans on the world's land: `WORLD.Hland`, the land without the roads.
  - `core/world/bake_sites.py pinnacle` bakes it in node to `plan/sites.json` ('krator-site-plan'). Every id starts
    with a site's scale-model id.
  - The page draws the bake (`core/world/88s-world-sites.js`, the bridges `88b`). Its verify plans again in the browser
    and compares the hash.
  - `core/world/48t-world-travel.js` (`KTRAVEL`, the sim's S5) reads the links, their stops and bridges as its graph.
- **The town on the mesa is not here.** It is `settlements/pinnacle-rock`'s own page, and the world's ground has no
  mesa (`KNOWN_ISSUES.md`).
- **The flora:**
  - the hyperjungle grows on the savage hyperjungle and hyperjungle N (Port Goto's), in its stands with saplings under
    them (its pass table as the retired little-demo gave it);
  - the abyssal savannah's own trees, and the eastern abyss's it borrows, grow over the NE and E rims. `src/49-world-absav.js`
    presents that kit to the world as two registries;
  - the corridors east of the rock (the crater's east wall, the Nomad Country, the Tiers) have no kit yet.
- **Built output:** `dist/pinnacle.html`, `dist/pinnacle.land.js` (the rasters as PNGs, 8.7 MB, beside the page so the
  page stays inside its 16 MB cap) and its texture sidecars.

```
python3 tools/scale-model/cut_site.py pinnacle     # the cut (data/, source/)
python3 core/world/bake_sites.py pinnacle          # the plan (plan/sites.json); --check fails on a stale bake
python3 build.py                                   # dist/pinnacle.html
python3 verify.py dist/pinnacle.html --assert --views 1,2,6
```

On the GPU: `KRATOR_GL=gpu` (verify.py takes a lane itself, under the stall watchdog).

## Fragments

| Fragment | Tag | What |
|---|---|---|
| `src/46-world-config.js` | [G data] | the sites' markers, "Go to" (the rock, its partners, the cut, the floor, each band's camp, each caravanserai), the first view |
| `src/47-world-kits.js` | [G data] | the kits that grow here: the hyperjungle on the savage hyperjungle and hyperjungle N, the abyssal savannah on the NE and E rims, and the eastern abyss's species it borrows; the overlay-list shim (as the Iziz cluster's) |
| `src/48-world-site.js` | [G data] | the site's spec (`SITE_SPEC`): the bands and the spots their camps are searched from, the tracks' reach and width, the partners, the links along their corridors' lines, their stops and bridges |
| `src/49-world-absav.js` | [G data] | the savannah kit as the world reads it (`ABSAV_WORLD`): its passes in the world's shape, one entry per registry |

Everything else is `core/world` (the runtime, `KSITES`, the bridges, the drawing), `core/camp`, `kits/beast-riders`
(`BR_CAMP`, and the tents through `settlements/isle-demo/bundles.py`'s `cat_bundle`), the Iziz Vernacular (`izv_bundle`:
the stops), and the two kits.

## Checks (`verify.py --assert`)

Each check has a negative:
- **The world's checks**, round the rock: order-free seeding, the land continuous, nothing in water or outside the cut,
  spacing across tiles, the rivers, the tracks and links on the land at their grade, nothing on a track or in a camp, no NaN.
- **The region:**
  - the rock at px 1007,686, at its pixel in the frame, on dry land in the savage hyperjungle, with the hyperjungle kit
    growing there;
  - every partner at its pixel, inside the cut;
  - every corridor's link baked along the line it was cut on (no point more than 6 km off it), inside the cut, with its
    caravanserais.
- **The sites:**
  - the baked plan is the plan made again in the browser;
  - every camp is whole, apart and on good ground, inside its hedge, with its track at its gate; every stop on good
    ground; every bridge's deck clear of its water;
  - every camp is cleared of flora, tagged, and drawn with the kit's pieces.
