# geyser: more fields (plan, 2026-10-26)

The kit draws one showcase: a geyser basin cut into the hyperjungle, at the Ring Sea's level. That matches the Steampits
and the Ring Sea's isles, where most of the model's vents are. But the model also puts vents high and dry, or high and
forested, or in ice, where a geyser field looks nothing like the showcase; and Korona's plume is active. Four stations add them. The page as built stays station 1.
Stations follow the Throne's and Korona's pattern (`stations/<name>/`, `python3 build.py --station <name>`).

**Status (2026-11-03, the rebuild turn, pair 7):** the showcase page (station 1) is rebuilt on the core (below, "Core adoption"), and the
Hearths' station 6, **the Stills** (`--station stills`), is built on its ground. Stations 2-5 (`puna`, `basin`, `corona`, `ice`) are still a
plan: the owner gave `puna`'s and `basin`'s Oidong, Godstep and rift-rim sites to the Hearths' hosts (2026-11-02; `biomes/hearths/PLAN.md`
"Overlap, settled"), so each keeps only the sites the Hearths do not take, and none is built in this turn (below, "Owed").

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

**Owed:** stations 2-5 (each a session: `puna` first, at the e inner wall's, the east's and the Lesser Throne's vents); the hyperjungle's own
universal set on this page (its `KGROUND` ground is not this page's: the basin's ground is the kit's); `WATER.audit` on the creek (57 is listed,
no check reads it yet); the Godot side of the new pieces (the exporter carries the hazards and the stills' records; nothing judged in Godot).
