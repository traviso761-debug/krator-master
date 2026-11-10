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
| 2 | `brazier` | `dist/twins-brazier.html` | built: the Brazier, Oasis 3 on the col (Route B) |
| 3 | `lavasump` | `dist/twins-lavasump.html` | built: the Red Cistern, the active lava-pool trap (Trap L1) |
| 4 | `shroudvale` | `dist/twins-shroudvale.html` | built: the Valley of the Iron Shroud, Trap F1 |
| 5 | `erebustwin` | `dist/twins-erebustwin.html` | built: the Rime Twin's ice towers and tube 10 |
| 6 | `catchlookout` | `dist/twins-catchlookout.html` | built: Catch-Lookout Spring, Oasis 5 above Stair |

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

## What the stations share (stations 2-6, 2026-11-09, `claude/twins-finish-cloud`)

- **A station's own ground classes** (`45c`: `FIELD.heat`, `FIELD.cls` from the station's `MODEL.heatAt` and `MODEL.classAt`): sinter, mats, mud,
  turf, ice, sulphur, lava crust, ash (`TWINS.GROUND`, `TWINS.XKEYS`), painted by 84 and carried to the shader as `aGO`/`aGP` (`vGO`, `vGP`).
  Station 1 has none: its weights are unchanged.
- **The ground's layers per station** (`STN.layers`: three library layers, fifteen texture units with the strata, the horizon and the cloud
  noise) and **shared layers** (`STN.shareLayers`: a class that reads another layer's map, recoloured by luminance, with no unit of its own:
  the oases' mats and mud read the sinter's or the travertine's grain; the ringisles high isle's way).
- **The oasis** (`45a7-host-oasis.js`: `OASIS_MODEL`, data; `89c-host-oasis.js`: drawn): KTHERM's heat from a fault line vent and each spring,
  geyser, mud pot, fumarole and rill; the relief (sinter mounds with their pools sunk in them, cone mounds, mud pits, rills); the classes by
  the heat (the plan's section 5 zones); the pools as `WATER.spring`, the mud pots as `WATER.mudpot`, the geysers as `WATER.geyser`, the fumaroles' steam
  as `WATER.fumarole` (core/water/geyser 52c, 52d); the other steam (`oasisSmoke`, in 89b's one smoke call with the station's own:
  `STATION_SMOKE`); the hazards (scald, gas vents, hot ground, and the CO2 that pools in the fissure at night in still air: core/hazard's
  `KHAZ.ENV.nightGas`, 22-core-hazard-env.js; 89c binds it the host clock and core/atmos's wind); crusts through `twinsCrust` (`KHAZ.ENV.crust`); the oasis's air (`oasisTemp`). The oasis pass (`60`: `TWINS.buildOasis`) puts the sedge,
  ferns, cushions, dwarf agate-pines and brimstone needles by the heat.
- **A Twin under the station** (`89b`: within 6 km) is not drawn as a far plume: the station draws its own steam.
- **The kit's new items** (`50`): sedge (the library's sedge card), the dwarf agate-pine's bole and flagged crown, brimstone needles, a sinter
  cone, wreck planks and wheels, strongboxes, ice blocks.
- **Neighbours read in place** (`build.py`, station.json `"kin"`, Godshearth's lines): the Hearths (`HEARTH`) on the Brazier.

## Station 2, the Brazier (Oasis 3)

Site px 1016, 1479 (4,680 m, 0.89 atm, -7 C on the col). The fissure runs NW-SE through the site (Fissure Vent NW to Fissure Vent SE: the plan's
map), its north-east side a 16 m basalt scarp with a notch where Route B crosses; the vents rise at its foot. KTHERM: the fissure a line vent
(34 C, reach 600 m), four pools (the Brazier's Eye 86 C, the Kettle 72, the Rust Pool 58 iron, the soaking pool 40), two geysers (the Horn-Spout,
a cone, 3 m every 20 minutes; the Chatterer, a spouter), three mud pots (78 C), three fumaroles, four rills south-west down the runoff. Warm
ground (over 8 C) 780 x 460 m; snow only where it is under 0-8 C. The Hearths' cold dress (1.2-3.2 m) on 25-60 C at q .45; their fans open at
night. The Shrine of the Split Horn in the scarp's notch by Route B. Route B crosses the square from the south-west (Oasis 2) to the east-north-
east (Oasis 4), cairned; Fissure Vents NW and SE steam on the far country 20 km either side.

## Station 6, Catch-Lookout Spring (Oasis 5)

Site px 1056, 1462 (3,690 m, 1.01 atm, +2 C: `STN.tempBias` 2.4 on the range's lapse). The map is a bench here; the Catch's fall begins 5-6 km
out. The page adds a 45 m fault scarp across the bench 380 m east of the spring (its lip wandering; a breach where it has fallen into a talus
ramp: Route B's way down), the lower bench beyond. The Lookout Spring (70 C, alkaline-chloride) and a second pool on the bench's inner fault;
eight travertine soaking basins stepping east down the bench (`WATER.terraces`, the ground cut to hold them); the dwarf agate-pines on the
warm margins (8-18 C), sedge, cushions; the lookout cairn on the lip. No snow lies at this height (the field's snow starts at 4,000 m), so
the snow layer drops out (14 units).

## Station 3, the Red Cistern (Trap L1)

Site px 992, 1465 (4,890 m, 0.87 atm). Map 5.1 pins the trap 1 km down into the NW Twin's south apron (the pin's dent, ~2 km across at its
lattice); the page reads the dent as the collapse amphitheatre's great bowl, a lava shelf inside it and a shallow valley along the tube's
line. The decoy tube (KCAVERN, 16 x 12 m with curb-ledges, station 1's cavern rock shader without the torches and with the pond's red glow)
runs 600 m at 6 degrees from a portal in a collapsed trench, seventeen counterfeit tally-marks cut over the arch and ferns in its warm breath
(+22 C); 400 m in, the fork into a blind side gallery and the guide's bench 4 m up the opposite wall. Its lower mouth opens in the wall of
a blind amphitheatre open to the sky (66 m walls): the pond, 90 m across at 4,890 m, is core/atmos's lava (`ATMOS.lavaMaterial`, the
library's lava crust for the grain), its glow on the glow layer; round it the silvery blister crust 0.23 m over the lava and the ash-dusted
ramp from the tube's mouth onto it. Hazards (records first): the pond (`KHAZ.GROUND.lavaLake`) and its SO2 (`gasVent`), the crust (a heat
crust and the lava under it, core/hazard's `KHAZ.ENV.crust`: a walker crosses, a laden mule breaks it, a new skin in ten minutes), the CO2
that pools in the amphitheatre at night in still air (core/hazard's `KHAZ.ENV.nightGas`), steady gas in the tube's lower end. Ten abandoned strongboxes and wreck planks and wheels on the rim
(`TWINS.putLeavings`, the station's kit fragment `55`). The NW Twin 16 km north-north-west.

## Station 4, the Valley of the Iron Shroud (Trap F1)

Site px 968, 1442 (4,720 m, 0.88 atm). The map is a near-flat upland at 2 km; the page cuts the box vale into it: a U-shaped glacial trough
6.3 km long with 560-620 m walls of columned titanium basalt and talus at their feet, its wide gentle mouth to the south-south-east (toward
Open Sprint 1), eased back into the map past 4.4 km. At the mouth the lie: a lukewarm iron seep (a `WATER.spring` on the iron ramp, its own
KTHERM vent: 16 C ground, +12 C air, no snow on it). Four kilometres in, the reverse-sloped terminal moraine (its crest 45 m over the basin
behind it); the basin sealed (its lowest way out 42 m over its floor), blue ice on its floor, the rimed wreckage of forty caravans (the kit's
planks, wheels and strongboxes), ~400 blocks of spalled ice under the headwall, KGLACIER's seracs (158) along the hanging glacier's lip. The
cold sink: -7 C by day, -34 C on the floor at night (core/hazard's cold-air pool, `KHAZ.ENV.coldPool`, on the host clock and the wind). The Guide's Needle: a
0.7 m chimney slot up the east wall with 1,324 iron rungs from the talus to the rim (5,322 m).

## Station 5, the Rime Twin (the SE Twin's summit)

Site px 1042, 1498 (5,420 m, 0.81 atm, -18 C mean: `STN.tempBias`). The station stands on the SE Twin (89b draws no far plume for it): a
summit caldera 3.9 km across under a basalt wall 320-490 m high (its highest point 5,882 m: the map's rim), the flank eased into the map past
4.4 km; an ice cap up to 30 m thick over the floor, melted back round the inner vent (a pit 150 m across, 55 m deep, sulphur and ash, bare
warm ground on KTHERM, its own steam column); 24 fumarolic ice towers 6-12 m (KGLACIER's `icetower`), each on a KTHERM fumarole with its gas;
four steam caves melted into the ice margin, lit blue (KGLACIER's caves), thin ice over them (core/hazard's crust over the drop, as each crevasse's snow bridge); tube 10's upper mouth an ice
cave at the south-east wall's foot; three boiling slush cauldrons (86 C); seracs and 22 crevasses along the margin. The heat, the cauldrons
and the fumaroles go through `OASIS_MODEL` and 89c. At this site the gas giant hides the sun from about 9:30 to 12:00, so the day views
are set to 13:36 (`STN.viewHour`).
