# Pinnacle: the first site at 1:1

The first site cut off the scale model into the open world, with a settlement planned on that ground
(`openworld/PLAN-SITES.md`; the owner, 2026-11-09).

- **The cut:** Pinnacle Rock (`staiytii0y`, map px 1007,686 on map 5.1) and a 60 km square round it. It covers
  3,600 km² at 500 m cells, with three named rivers and the Crescent ruin 30 km south-west.
  - **Moved 2026-11-10** (the owner: "a spot not too far that's got a bit more forest"): 41 km west of 1027,681, where
    map 5.1 had left the rock in the NE rim's savanna.
  - The new spot is on the **savage hyperjungle's north-east edge**: a knoll 110 m over its 14 km round, at -1,287 m.
    77 % of the ground within 9 km is jungle; the NE rim's savanna is the other half of the cut.
  - The square is from `openworld/SITES.json`; `tools/scale-model/cut_site.py pinnacle` makes the cut.
  - The frame's origin is the site's pixel. Pinnacle Rock's own page still stands on its old cut at the old pixel, until
    it is rebuilt on the new spot (`KNOWN_ISSUES.md`).
- **The site:** the nine Beast Rider bands that camp on the floor round the rock, and a track from each camp's gate to
  the rock.
  - **The bands:** their tribes' `lower` grounds (`kits/beast-riders` `BR_CAMP`), each searched from the spot the rock's
    page gives its camp. All nine stand there: 147 tents and pens, with 2,177 hedge and rail pieces.
  - **The tracks:** `core/world` `ROADS`, the grade held to 8 %.
  - **The plan is records:**
    - `core/world/48s-world-sites.js` (`KSITES`) plans on the world's land: `WORLD.Hland`, the land without the roads.
    - `core/world/bake_sites.py pinnacle` bakes it in node to `plan/sites.json` ('krator-site-plan'). Every id starts
      with the site's scale-model id.
    - The page draws the bake (`core/world/88s-world-sites.js`). Its verify plans again in the browser and compares the
      hash.
  - **The town on the mesa is not here.** It is `settlements/pinnacle-rock`'s own page, and the world's ground has no
    mesa (`KNOWN_ISSUES.md`).
- **The flora:**
  - the hyperjungle grows on the savage hyperjungle, in its stands with saplings under them (its pass table as the
    retired little-demo gave it);
  - the abyssal savannah's own trees, and the eastern abyss's it borrows, grow over the NE rim. `src/49-world-absav.js`
    presents that kit to the world as two registries.
- **Built output:** `dist/pinnacle.html`, with its texture sidecars.

```
python3 tools/scale-model/cut_site.py pinnacle     # the cut (data/, source/)
python3 core/world/bake_sites.py pinnacle          # the plan (plan/sites.json); --check fails on a stale bake
python3 build.py                                   # dist/pinnacle.html
python3 verify.py dist/pinnacle.html --assert --views 1,2,6
```

On the GPU: `KRATOR_GL=gpu` and `python3 ../../tools/harness.py lock --lane auto -- python3 verify.py ...`.

## Fragments

| Fragment | Tag | What |
|---|---|---|
| `src/46-world-config.js` | [G data] | the site's marker, "Go to" (the site, the cut, the floor, each band's camp), the first view |
| `src/47-world-kits.js` | [G data] | the kits that grow here: the hyperjungle on the savage hyperjungle, the abyssal savannah on the NE rim, and the eastern abyss's species it borrows |
| `src/48-world-site.js` | [G data] | the site's spec (`SITE_SPEC`): the bands and the spots their camps are searched from, the tracks' reach and width |
| `src/49-world-absav.js` | [G data] | the savannah kit as the world reads it (`ABSAV_WORLD`): its passes in the world's shape, one entry per registry |

Everything else is `core/world` (the runtime, `KSITES`, the drawing), `core/camp`, `kits/beast-riders` (`BR_CAMP`, and
the tents through `settlements/isle-demo/bundles.py`'s `cat_bundle`), and the two kits.

## Checks (`verify.py --assert`)

Each check has a negative:
- **The world's checks**, round the site: order-free seeding, the land continuous, nothing in water or outside the cut,
  spacing across tiles, the rivers, the tracks on the land at their grade, nothing on a track or in a camp, no NaN.
- **The region:** the site at px 1007,686, on dry land in the savage hyperjungle, with the hyperjungle kit growing there.
- **The sites:**
  - the baked plan is the plan made again in the browser;
  - every camp is whole, apart and on good ground, inside its hedge, with its track at its gate;
  - every camp is cleared of flora, tagged, and drawn with the kit's pieces.
