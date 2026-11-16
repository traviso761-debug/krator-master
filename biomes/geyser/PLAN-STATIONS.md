# geyser: more fields (plan, 2026-10-26)

The kit draws one showcase: a geyser basin cut into the hyperjungle, at the Ring Sea's level. That matches the Steampits
and the Ring Sea's isles, where most of the model's vents are. But the model also puts vents high and dry, or high and
forested, or in ice, where a geyser field looks nothing like the showcase; and Korona's plume is active. Four stations add them. The page as built stays station 1.
Stations follow the Throne's and Korona's pattern (`stations/<name>/`, `python3 build.py --station <name>`).

**Status:** the showcase page (station 1) is rebuilt on the core (2026-11-03, "Core adoption" below); the Hearths' station 6, **the Stills**
(`--station stills`), is built on its ground; **stations 2-5 are built** (2026-11-09, below, "Stations 2-5 as built"), on map 5.1's sites, as four
stations on one shared base (`stations/field/`). The sections between here and "Stations 2-5 as built" are the plan as written on map 4.23.

## The ground (scale model 4.23, surveyed 2026-10-26: `DATA.vents`, 79 in all)

**The showcase's country.** The Steampits (11,340 km², 8,460 land): -1,440 m, 1.9 atm, +33 °C, ~1,380 mm, XA 68% and
XV 30%, eight vents. The Ring Sea's isles and shores hold most of the rest (-1,500 to -480 m, in XA, Af, Aw and XV),
SW Bay and the NW bay four (Aw, -950 to -1,160 m). All drawn by station 1.

**The vents the showcase does not fit:**

| px | Ground | Pressure | Class | Rain | Mean | Biome polygon | Fits |
|---|---|---|---|---|---|---|---|
| (825,1253) | 3,160 m | 1.08 | Dfc | 157 mm | +4 | Oidong Valley | station 2 |
| (914,1261) | 4,128 m | 0.95 | Dsc | 110 mm | -3 | Oidong Valley | station 2 |
| (1352,836) | 4,550 m | 0.91 | Dfc | 173 mm | -2 | none (the east) | station 2 |
| (620,815) | 4,973 m | 0.86 | ET | 47 mm | -4 | godstep valley | station 2 |
| (858,524) | 5,332 m | 0.82 | ET | 125 mm | -3 | e inner wall | station 2 |
| (205,1037) | 3,338 m | 1.06 | Dfb | 1,192 mm | +3 | w rift highland | station 3 |
| (158,1058) | 3,730 m | 1.00 | Dsb | 863 mm | +3 | w rift highland / rift rim S | station 3 |
| (253,1070) | 3,915 m | 0.98 | Dsc | 753 mm | +2 | rift rim N | station 3 |
| (270,1173), (574,1312) | 2.0, 2.6 km | 1.25, 1.16 | Csb | 520-720 mm | +7, +12 | rift | the Rift's own |
| (387,1248) | 71 m | 1.59 | Csa | 941 mm | +21 | rift | the Rift's own |

| (770,1168) | 8,357 m | 0.56 | HF | 0 mm | -27 | none: Xanadu's south-eastern wall | station 5 (its iced flanks) |
| (716,1128) | 10,709 m | 0.42 | O | 0 mm | -41 | none: Xanadu's south-eastern wall | its distal flanks only |

The Volcano's and the Godthrone's vents are on airless ground: no water, no geysers (the Throne's and Godthrone's kits).
**The two cones on Xanadu's wall** (the owner, 2026-10-26: "there might be some on the wall of Xanadu where the two vent
cones are") are the vents past the Catch's south-west notch. Round (770,1168) the ground falls from 8.4 km at the cone to
~7.4 km at 20-30 km out (HF), then glacier ice (EF) at ~7.0-7.4 km from about 40 km out, ET from about 100 km: water
there is ice, and the vent's heat melts it. (716,1128) is airless (class O) for 60 km round; only its far flanks, where
EF and ET begin at 100-160 km, could hold a field.

**Boiling point.** Water boils at about 84 °C at 0.56 atm, about 88 °C at 0.66 atm, about 94 °C at 0.82 atm and about
119 °C at 1.9 atm. The cold fields' geysers are
cooler, steam more visibly in the cold air, and erupt more readily for the same heat; the showcase's are superheated.

## Station 2: the high desert field (`--station puna`)

**Earth basis:** El Tatio (4.3 km, the Atacama's altiplano), the Puna's fumaroles. **Sites:** Oidong's two vents, the
e inner wall's, Godstep's and the one at (1352,836): 3-5.3 km, 0.8-1.1 atm, 50-170 mm, a mean near freezing.

- **Steam columns at dawn** in frozen air, the eruptions brief and low; sinter terraces without the mats' greens (too cold
  and dry), only orange and black cyanobacterial crusts in the warm run-off.
- **Ice and frost** round the pools in the morning (`core/water` ice); salt and borate crusts on the flats (`KGROUND`
  polygon kind; brine and pan).
- **Bare ground:** cushion plants and bunch grass only in the run-off's warmth (a reach from the vent: plants cluster on
  the warm ground, `KMASK.distance`).
- **Thin air** (`core/atmos`), dust; the hot-ground hazard (`KHAZ`).

## Station 3: the mountain forest field (`--station basin`)

**Earth basis:** Yellowstone's geyser basins (2.2-2.5 km in lodgepole pine), Kamchatka's Valley of Geysers. **Sites:** the
w rift highland and the rift rims' three vents: 3.3-3.9 km, ~1 atm, 750-1,200 mm, a mean of +2 to +3 °C.

- **A geyser basin in conifer forest:** the dead "bobby-sock" trees where the silica run-off has killed and whitened them,
  steaming meadows, bacterial mats in the run-off channels (the showcase's mats in their cooler colours), mud pots.
- **Snow in winter**, kept off the hot ground (the snow cover reads the vents' heat).
- **The forest is riftrim's** (`biomes/riftrim/PLAN.md`), read in place: this station is the field and the burnt and
  silicified edge, not a new forest.

## Station 4: the corona field (`--station corona`)

Korona is a corona: a mantle plume dome with ring fractures, trenches and a moat, and water in its lakes and basins.
**The plume is still active** (the owner, 2026-10-26: "better watch your step in Korona"), so it has geyser fields: heat
from the plume, deep plumbing in the ring faults, water from the basins. **Earth basis:** Yellowstone's ring-fault basins
over its hotspot, Iceland's Haukadalur. Sites to be read off the model in Korona's trenches and moat (the model puts no
vent there yet: add vents, a 4.24 item, or place the fields from Korona's own data).

- **The field follows the ring:** geysers, hot springs and fumaroles strung along a trench floor, in the dense,
  warm air of Korona's low ground (`korona/NOTES.md`: the trenches at ~2.1 atm), so superheated and violent.
- **Korona's quilt in the run-off:** each spring's chemistry its own (acid, alkaline, iron, sulphur), so the mats and
  sinter change colour pool to pool, matching the microclimates; the trenches' existing flora at the field's edge.
- **The hazard is the point:** thin crusts over boiling water, hot ground, gas in the hollows (`KHAZ` vents and hot ground,
  taboo areas). A traveller watches their step.
- Korona's own kit gains a matching note (`korona/NOTES.md`); a Korona station can load this one in place.

## Station 5: the ice field on Xanadu's wall (`--station ice`)

**Earth basis:** Mount Erebus's fumarolic ice towers and ice caves, Kverkfjöll under Vatnajökull. **Site:** the iced flanks
of the cone at (770,1168), about 7 km, 0.6-0.7 atm, a mean near -20 °C, no rain: the water is the glacier's.

- **Ice towers and ice caves:** fumaroles freeze into hollow ice chimneys several metres high; the vents' heat carves caves
  into the glacier, lit blue from within.
- **Short, steaming geysers** at about 88 °C boiling, erupting into frozen air; meltwater pools rimmed with ice; ash-dark
  ice and bare, warm ground in patches.
- **No plants** beyond the microbial films on the warm ground; the thin air (`core/atmos`), the ice (`core/water`), the
  hot ground and the crevasses (`KHAZ`).
- Seen from the Vale of Xanadu, the cones' plumes over the south-eastern wall: a far-field landmark for Xanadu's stations
  (`xanadu/PLAN-STATIONS.md`, the high ranges).

## Order

`puna` first (it differs most from the showcase), then `corona` (with Korona's next pass), then `basin` with or after
riftrim, then `ice`.

## Station 6 of the Hearths: the Stills (`--station stills`, `dist/geyser-stills.html`; built 2026-11-03)

`biomes/hearths/PLAN.md` section 7b and section 11 item 6, on the showcase's own ground (no `base`: `stations/stills/` adds one fragment to
`src/`). `biomes/hearths/src` is read in place (`station.json` "kin": `50` the records and parts, `57` the placement, new in this turn), with
`core/biome/35b-core-anim-turn.js` (the breath's turn). What is drawn, all from the kit's own water records (`GEYSER.R`), never a noise:

- **Still trees** ring every boiling spring at its rim (temp .75 and over: the Great Prism and the funnels), their feet in the water's edge,
  and every geyser at its spray line (outside it; off the kit's trees by `GEYSER.blocked`): a 15-30 m heat-pipe stalk, 4-6 tiers of black
  sails (each a panel of three fans) held **across the sea wind**, wax pooled at some feet.
- **The two scalars** (one write a frame each, `87-host-stills.js`): a geyser's ring **folds its sails** through the warning (`pre`) and
  the column and opens them as the steam's roar falls (`HEARTH.sailFold` on `WATER.geyser`'s `S.state` at the show's clock; key
  `stills:<geyser>`); the springs' rings never fold. **Every sail turns** from across the wind toward edge-on to the sun by day, back
  across the wind at night (`HEARTH.sailTurn` on the sky's sun; key `stills:turn`, three quarters of the way at full day).
- **Glass stills** by the springs gone cool (temp under .55), white, standing; **spray mats** on the scalded ground inside each cone's spray
  line; **sail cups** down the run-off's 40-80 degC reach, their fans across the wind.
- Views: "The Old Kettle's ring" (the Old Kettle set off as the view opens, so its ring is seen shut), "The stills round the Great Prism",
  "A still tree", "The sails across the wind". Checks (each with a negative): the field placed, still trees only at boiling water, the fold's
  phases, the turn by day and night.

**Look decisions for the owner** (none judged on a GPU yet):
- The sail is three fans side by side in one plane (the plan's "held across the wind like sails"), not a radial crown: a radial crown cannot
  stand across a wind. Folded, a sail swings down-wind and hangs along the stalk (2.5 rad): the plan says only "fold".
- The turn is a compromise: the plan asks both across the wind and edge-on to the sun, which disagree most of the day; the sails go three
  quarters of the way to edge-on at full day.
- The page opens at the host's 06:00; the plan's "first ten seconds" are at midday: `#hour=13`. Sail cups' cup is a funnel cap with a small
  fan on its lip; vertex-shaded, no textures (the Hearths' section 15 has none delivered).

**Not built here:** the people's words (the plan's open question 3), the fauna, the shimmer over the hot ground (`ATMOS.shimmer`: a post pass,
as the Cold Hearths left it), KTHERM (the rings are placed by the water records, which already say where the water boils), and the Stills on
the other two geyser sites (the West Ring's isles, the Throne's geyser isle: their own pages' turns, reading `57` in place).

## Core adoption (the rebuild turn, pair 7, 2026-11-03)

The universal set (`BACKPORT.md` sections 1 and 5) and the kit's row, on both pages unless said:

| Module | Taken | Where |
|---|---|---|
| `core/water/21` (the shore presets) | **yes, a fix**: the page rebuilt from the merged sources died at render (`W.wetChunk`: `WATER.PRESETS.shore` undefined) | `build.py` |
| `BIO.flareJoin` (31j) | the pandan's forks, the kanuka's side limbs, the snags' stubs; 6 sides at a joint over .15 m. Guarded, so a reader without 31j (the hyperjungle's lake station, ringisles) draws the limbs as before | `55` |
| Octahedral impostors (34) | the hyperjungle's far trees (its `55` makes them when 34 is on the page), its gain 1.6, `?diet=0` the old blobs; the kit's own trees all stand inside the hero radius, so none of them goes far | `88` |
| Cards on their geometry | `check_cells.py --fix`: the screwpine crown's cell (it showed a quarter of the plant), the pandan strap's plain cell and base, the heath's stems; 3 faults to 0, repacked | `materials.json`, `tex/pack.json` |
| `KGROUND` (43) | the nine library surfaces the paint mixed (litter, grass, moss, rock, sand, sinter twice, travertine, clay, mud) are KGROUND layers in the same order with the same weights and tints; the mats' sampler stays the kit's (a term on top, as the vents, film and pools are); `?kground=0` the old mix | `84` |
| `KSTRATA` lamina (35, 35b) | the row's "strata in the sinter terraces": the Stair's curtains banded as travertine lays down (couplets of ~0.8 mm a day, a paler band each wet season, 151 years over the flight), cream and iron buff; `?lamina=0` | `84` |
| `KFAR` (44), `KHORIZON` (45) | the plateau's canopy and the coast to 14 km; the horizon over the square and the far field, on the ground and (after the bake) the flora; `?far=0`, `?hz=0` | `85`, `88` |
| `KSHADOW` | yes (`?shadow=0`): the flora casts, the ground receives; shader materials (springs, columns, plumes) and the far field neither. Its cost is not measured here (no GPU): the coordinator's run measures it | `88` |
| Sky and air | the shared sky as before; height fog, rain cover, lightning listed with the particles | `build.py` |
| River plume (ext/61) | the creek's tea-brown water and the Stair's milky silica run-off carried into the sea on a current (`?plume=0`) | `89w-host-sea.js` |
| No breakers on still water | nothing to do: the Stair's pools are `drawPools` (no surf); the sea keeps its breakers | |
| `WATER.mirrorSwitch` (58) | **dropped**: the largest stills are the springs, whose discs are their own shader (the ramp) with no anchor the mirror can patch; the Stair's 143 pools are small at 143 levels | |
| `KHAZ` (the row's "vents and hot ground") | the springs' sinter crusts (KHAZ hot ground), the fumaroles' gas, the mud pots' boiling clay, beside the geysers, springs and acid flats already there | `46`, `65` |
| `KGROUND` `polygon` (the row) | **dropped**: the sinter flats are geyserite sheets laid by water, not frost or desiccation polygons | |
| Brine looks, karst-spring vents (the row) | **dropped**: the springs' colour is core/water's thermal ramp already; no karst here | |
| `BIO.fung`, `BIO.bamboo` | the kit has no fungoid or bamboo part of its own; 33 is listed for the hyperjungle and the Stills | |

**Owed:** (stations 2-5 are built: below) the hyperjungle's own
universal set on this page (its `KGROUND` ground is not this page's: the basin's ground is the kit's); `WATER.audit` on the creek (57 is listed,
no check reads it yet); the Godot side of the new pieces (the exporter carries the hazards and the stills' records; nothing judged in Godot).

## Stations 2-5 as built (2026-11-09)

**One base, four sites.** `stations/field/` is a geyser field on any ground (station.json `"base": "field"`): its stage (45), land and binding (47),
far field (85), build (88), sky (89), air (89w) and take (98) read the station's **site record** (`44s-host-site.js`, `STATION_SITE`): the land as a
function, the field's centre and reach, the air (mean, wind, pressure, haze, fog), the layout (`FIELD_SPEC`: the field's geysers, springs, acid ground,
fumaroles and dead rings, each record from `KRAND.hash`, sized per site), which of the kit's tree passes and floor run, the station's own flora, its
words, views and checks. The shared host fragments take a station's ground through `STATION_GROUND` (84: patches, paint, layers, the run-off's colour
ramp) and its views and checks through `STATION_TAKE` (99). The cold stations' library sets are `materials.json` slots `st.*`, packed only into the pages
whose `station.json` lists them (`"tex"`), so the showcase and the Stills carry none. **The cold grounds' plants** (a lodgepole pine on the library's
needles and scaled bark, ichu bunch grass, yareta cushions) live in a registry of their own (`stations/field/75-biome-geyserfield-flora.js`,
`FIELDFLORA`, kit `geyserfield`): the kit's species list (50/55/60) and its keys and indices are untouched for its readers.

**The sites moved** from the 4.23 plan: the Hearths' hosts took the Oidong rim's, Godstep's and the rift rim's vents (the owner, 2026-11-02), and map 5.1
gave the plan's "east" vent (px 1622,1166 on 5.1) to the Loom-Chasm kit as Mount Caelum. The new eastern vents of map 5.1 (kind `geyser`, 2.0-4.7 km)
supplied the high desert and the mountain forest. Surveyed with `tools/scale-model` (`smodel.page`; heights, the monthly temperatures, rain, class):

| Station | Page | 5.1 px (old canvas) | Height | Air | Mean (warm/cold) | Rain | Class | Earth basis |
|---|---|---|---|---|---|---|---|---|
| 2 `puna` | `dist/geyser-puna.html` | 1574,1642 (1302,1312) | 3,896 m | 0.98 atm | 0 (+13/-13) | 220 mm | ET | El Tatio |
| 3 `basin` | `dist/geyser-basin.html` | 1454,1684 (1182,1354) | 3,249 m | 1.07 atm | +9 (+22/-4) | 345 mm | Dwc | Yellowstone |
| 4 `corona` | `dist/geyser-corona.html` | 1123,517 (851,187) | -1,892 m | 2.03 atm | +36 (+41/+32) | 2,500-3,400 mm | WS (XA round it) | Yellowstone's ring faults, Haukadalur |
| 5 `ice` | `dist/geyser-ice.html` | 1024,1485 (752,1155) | 7,385 m | 0.64 atm | -21 (-8/-34) | 0 | HF | Erebus, Kverkfjoll |

- **`puna`**: a shallow basin on the altiplano, gravel fans, rims 150-400 m up within 3 km and a stratovolcano 9 km north-east (far field). Seven small
  geysers (2-9 m, every 3-25 minutes), five spouters, sixteen springs (silica, sulphur, iron), an acid field; the run-off's crusts orange and black,
  no greens; borate and salt crust on the flats (`st.salt`), the ash-grey gravel (`st.ash`); ichu and yareta only where the run-off warms the ground;
  no tree. The page loads at 11:00, which at this longitude is in the giant's eclipse season's dark: the views are at day (13:00).
- **`basin`**: a geyser basin a few metres into a forested shelf, the range rising south (4.5 km 10 km out); six geysers (10-45 m, one to ten hours),
  a great prismatic spring (30 m) and twelve more, an acid field; the kit's warm-ground life on the floor (panic grass, moss); **lodgepole pine** round
  it (75) on the library's needles (`st.needles`, `st.pine`, `st.pinebark`); three stands of **bobby-sock pines** (the kit's snags, sized as lodgepoles:
  the page's copy of the snag's record); the mats in cooler colours. `?snow=1`: winter, the snow (`st.snow`) on all but the warm ground.
- **`corona`**: a Korona trench floor in the hyperjungle (read in place as on the showcase), the field strung along a ring fault (a 24 m scarp, the
  dome's side up): eight superheated geysers (25-75 m), four spouters, eighteen springs each of its own chemistry (sulphur, iron, copper, silica: the
  quilt), two acid fields, drowned jungle on the fault; **the hazard is the point**: taboo ground over the four hottest springs' crusts and every
  geyser's mound (`tags.taboo` with a hot-ground hazard), gas in the acid hollows (KHAZ `gasVent`). No model vent here: the field is placed from
  Korona's own data, as the plan said.
- **`ice`**: an icefield on the cone's flank (`st.ice`, the library's aufeis), the field melted into it as a hollow of warm ash (`st.ash`) under a 14 m
  ice cliff; sixteen **ice towers** round it on the ice (KGLACIER's drawer, each a fumarole's gas), three **ice caves** melted into the cliff, lit blue
  from within; four short geysers (4-14 m), meltwater pools; microbial films only; no plant.

**Look decisions for the owner** (software GL shots only; none judged on a GPU):
- The ichu, yareta and lodgepole are new plants of this kit's stations, not readers of another kit: no kit drew them (riftrim, which the plan named for
  the basin's forest, has no source yet). The lodgepole is a bole and a narrow crown of needle clumps, no limbs: a far-reading tree.
- The run-off's colour ramps per station: puna black to orange, basin olive and brown, ice pale green and brown; corona keeps the kit's ramp in its
  run-off and puts the chemistry in each spring's own disc.
- Corona's ring walls (20-40 km off) are out of the far field's 14 km: its horizon is jungle and haze. The basin's range is real far-field ground.
- The geysers' times are each site's own, in real time (no demo times): puna's every few minutes, basin's and corona's hours, ice's under an hour.

**Not built:** the frost and the ice round puna's pools in the morning (core/water's ice), the snow kept off the hot ground by KTHERM's mask (basin's
winter is a paint switch), the hearths stations' sites (the Hearths' hosts'), the fauna, corona's link to Korona's own pages, the Godot export's check
of the new records.
