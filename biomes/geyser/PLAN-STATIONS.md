# geyser: more fields (plan, 2026-10-26)

The kit draws one showcase: a geyser basin cut into the hyperjungle, at the Ring Sea's level. That matches the Steampits
and the Ring Sea's isles, where most of the model's vents are. But the model also puts vents high and dry, or high and
forested, or in ice, where a geyser field looks nothing like the showcase; and Korona's plume is active. Four stations add them. The page as built stays station 1.
Stations follow the Throne's and Korona's pattern (`stations/<name>/`, `python3 build.py --station <name>`).

**Status: plan, awaiting the owner.**

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
