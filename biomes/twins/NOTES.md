# biomes/twins: notes

The Twins (`PLAN.md`): the tall, cold, black range between Xanadu and the Catch, two small active volcanoes on it (the NW Twin, Al-Qaran
al-Kabir, 6,480 m; the SE Twin, Al-Qaran al-Saghir, 5,880 m: scale model 5.1, Option A), and the two ways caravans cross it: Route A through
extinct lava tubes with brief sprints outside, Route B dashing between five warm geothermal oases. The Xanadui guides know both, and lead
those who cheat them into dead-end frozen vales or onto active lava pools.

## Building it

Every page is a station (`PLAN.md` section 6), started from the Godthrone's kit (`biomes/godthrone`: the same rock, the same frame):

    python3 build.py                     # station 1, the pyroduct -> dist/twins.html
    python3 build.py --station <name>    # stations/<name>/ -> its station.json "out"
    python3 verify.py dist/twins.html --assert [--all-views]

`src/` is what the stations share: the stage and the region (45, 45a5), the field and the kit's fields (45c), the kit (50, 60, 70), the far
country (82), the ground (84), the build order (88), the sky and the atmosphere (89, 89a), the Twins' plumes (89b), the shadow toggle (89zz),
the views, inspector and checks handed to the host (99). A station adds `44a` (its names and square), `45b` (its ground model), its own
structures (`87`) and its views and checks (`98`), and a `station.json` ("out", "region", "reads", "water", "tex").

A station's far country is the map's: `python3 biomes/godthrone/tools/region.py <station> <px> <py> --kit biomes/twins` writes its
`region.json` from `tools/scale-model/model/data/h.png` (2 km lattice, 81 x 81 cells round the site).

## Stations

| # | key | page | state |
|---|---|---|---|
| 1 | `pyroduct` | `dist/twins.html` | built: the First Breath (Route A's tube A1 at its skylight, the sprint, the dive into A2) |
| 2 | `brazier` | | to build: the Brazier, Oasis 3 on the col (Route B) |
| 3 | `lavasump` | | to build: the Red Cistern, the active lava-pool trap (Trap L1) |
| 4 | `shroudvale` | | to build: the Valley of the Iron Shroud, the frozen box vale (Trap F1) |
| 5 | `erebustwin` | | to build: the Rime Twin's ice towers and tube 10 |
| 6 | `catchlookout` | | to build: Catch-Lookout Spring, Oasis 5 above Stair |

## Station 1, the First Breath (the pyroduct)

Site px 980, 1467 (4,240 m on 5.1, 0.94 atm). The frame's origin is the site; the skylight and the portal stand 1.75 km either side of it on
the sprint's bearing (east-north-east, `PLAN.md` section 3.1: from (978, 1468) to (982, 1466)), 3.5 km apart as the plan's prose has it (the
two pixels are 8.9 km apart; the plan's 2 km pixels are coarser than its sprint).

- **Tube A1** (`tube_xanadu_nw_09`'s caravan pyroduct: 18 m wide, 13 m high, curb-ledges 4 m up) comes up from the south-west under the
  smoothed slope, its cover thinning from 14 m to 3 m toward the skylight. 900 m of it is drawn; Xanadu is 60 km down it.
- **The skylight** is a collapse through the thin roof: a KCAVERN shaft (8 m at the crown, 13 m at the ground) and a well opening (the host's
  ground leaves the hole; the cavern draws that ground). Its breakdown is a ramp of fallen roof stepping up to the scree on the far (north-east)
  side: monolith tiers, each 4.6 m higher, the last within a metre or two of the scree.
- **The sprint**: a cairned line from the ramp's top to the trench's head, wandering round the boulders; cairns every ~110 m, alternately
  2.6 m either side, four to six stacked stones, the cap daubed in sulphur. An obsidian coulee 1.3 km long and 22 m thick lies north of it,
  its front 230 m off the route, shedding black glass blocks.
- **The portal**: tube A2 (the Horn-Underpass) leaves east from the head of a collapsed lava trench 190 m long, its floor ramping 26 m down
  to the tube's; a well round the mouth lets the cavern draw the head wall with the mouth cut in it.
- **The light in the tubes**: one ShaderMaterial on the cavern's rock (the Godthrone tube's, extended): the guides' torches (16 at most),
  the eye's headlamp inside, the sky's light through each opening by its solid angle, the sun's patch down the skylight, and the lichens
  golden or blue-green on KCAVERN's crust weight within 80 m of an opening.
- **The cold**: core/hazard's ambient temperature is −4 °C at 4,240 m with a 6.5 °C/km lapse and a ±3.5 °C day (so the scree is below
  freezing even at noon); +13 °C anywhere under the cavern's rock (`STATION_TEMP`), so the cold doses outside and not inside.
- **The boulder field**: the host's `blocks` field, a band ~500 m either side of the sprint's line, patchy; the kit's 5 m pass puts
  frost-shattered blocks of basalt and obsidian (0.3-1.4 m) there, over the 20 m pass's bigger scree blocks.
- **The NW Twin from the sprint**: on map 5.1 the site lies in a hollow whose rim, 4-5 km out, stands as high in the view as the cone's crater
  24 km off, so from the sprint the cone itself is under the rim and only its plume (2.6 km tall) stands over it. `The NW Twin` view is the
  nearest place to the sprint (a 300 m lattice over the square) with a clear line to the summit, found in the built scene; `The NW Twin's
  plume from the sprint` is the sprint's own sight of it. The plan's "under the looming cone" would need the map's hollow opened toward it:
  the map is the owner's call, so it is recorded here, not carved.
