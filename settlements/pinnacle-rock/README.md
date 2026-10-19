# Pinnacle Rock

The Beast Riders' roost town on a red sandstone mesa at the north-eastern edge of the hyperjungle (`PLAN.md`; the lore is
`LORE.md` §6.6). Built in stages (`PLAN.md` section 3). **Done: P0 and P1, the rock and the site.** The roosts, the Stair,
the town, the Deep Root cavern, the farms and the camps are the stages to come.

```
python3 build.py                                   # dist/pinnacle-rock.html (+ its texture sidecars)
cd dist && python3 ../verify.py pinnacle-rock.html --assert [--all-views --out ../shots]
```

## What the page is

- **The site is the scale model's** (4.21, px 755,351). `region/` holds the cut round it (120 km square, from
  `tools/scale-model/extract_region.py`; the model's regions and settlements as read on 2026-10-19 in `region/source/`,
  the cut's box added as `regions-cut.json`). `tools/world_data.py` decodes the rasters at build time into the typed
  arrays the open world's fields take (`openworld/little-demo/src/41-world-fields.js`, read in place: `WORLD.H`). The
  page's floor IS the model's land (y 0 = the knoll's ground at the mesa's south foot), with one cut finer than its
  4 km cells: the dry gorge under the north rim (the plan's). `86-pr-far.js` draws the rest of the cut to 60 km: the
  forest as a canopy surface opened over the rivers, the K'etsaal Baatar's valley 11 km south, the Inner Wall rising to
  ~3 km 48 km north.
- **The plan is data** (`src/40-pr-layout.js`, `[G data]`): the settled layout's numbers (the diagram,
  https://claude.ai/artifact/Dn8qzog9vCzCvcV9gxHpZH): the mesa, the ten fins by group, the Garden's thirteen stacks, the
  shrine's balanced rock, seven spurs, the top's zones, the palisade, the nine bands' pastures, camps and hedges, the
  fair ground, the road and gate, the pond, the spring, the gorge; `PR.zoneAt`, `PR.topZoneAt`, `PR.forest`.
- **The rock** is KSTACKS records (`core/terrain/37-core-stacks.js`) made from the plan (`45-host-stage.js`): the mesa
  (250 m over the south foot, 1.24 by 0.82 km), the fins each set in from the rim until their whole foot is 12 m inside
  the edge, the Garden and the spurs.
- **The plants**: the necanyons kit (`biomes/necanyons`, read in place with its land fragment `47-host-land.js`, which
  takes this page's `LAND` hooks: the cap height, the LOD spine, the cleared ground, no creek) on the walls, ledges,
  spurs and stacks, kept off the town's ground past the 12 m rim band; the hyperjungle on the floor, kept out of the farms,
  the bands' grounds, the fair ground and the road, thin on the cleared ground (`PR.forest`).

## Checks (`verify.py --assert`)

The shared invariants (registered volumes, NaN, budgets, the export profile) and the page's own (`99-host-take.js`
`hostChecks`): the mesa's height and size; ten fins, each wholly on the top 12 m from the edge, 40-90 m over it, spread
round the rim (at least five of eight sectors, no 250 m circle with more than three: the owner, 2026-10-19); the Garden
on the middle; no tree on the town's ground; no forest standing in the farms or a band's ground; the floor equal to the
model's land and the Inner Wall over 2.5 km above the knoll. Each has a negative control (the fins in one row, a fin over
the edge, a 180 m mesa, a tree in the Crown, a tree in the farms).
