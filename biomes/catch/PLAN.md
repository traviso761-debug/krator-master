# The Catch: a closed basin (plan)

The owner's polygon `the catch` (2026-10-23; `regions` doc `rmvka7icdn1dq`; the older geographic region
`rmuf346nvpktx`) on the Krator Scale Model: a basin south-east of the Godthrone, walled on every side. The owner asked
(2026-10-23) whether even the rain it has now is generous. **It is, by about ten times on the floor.** This plan says why,
what the model should carry instead (a 4.22 item), and what kit the corrected basin wants. Everything is *proposed*
unless marked.

## 1. What the model says (4.21, surveyed 2026-10-23)

One pixel is ~2 km (4 km²). The polygon is 31,700 px, ~127,000 km²: about the Tarim Basin's size.

| Band | Area | Rain (mean) | Mean T | Notes |
|---|---|---|---|---|
| floor, under 1 km | ~28,700 km² | **369 mm** | +19 °C (warmest month +29, coldest +9) | lowest point 225 m (px 762,1067); no lake |
| piedmont, 1-3 km | ~19,900 km² | **482 mm** | +11 °C | Stair (ruined arcology, px 827,1113, 1,130 m) |
| inner walls, 3-6 km | ~74,300 km² | 147 mm | -1 °C (warmest +11) | ET, Dsc, Dsb |
| above 6 km | ~3,700 km² | 13 mm | | |

The classes include **Cfa 7.3% and Csa 1.8%**, humid subtropical and Mediterranean, on a basin floor, and a hot spot over
800 mm (px 805-870 by 1075-1133, round Stair). The rain rises from the floor to the foothills and falls up the walls:
the floor and foothills are wetter than the walls that should be catching what little gets in.

**The walls.** No crest round the basin is under ~10 km (they run 10-17 km, the Godthrone's 17.1 km summit on the
north-west), and the ground 40-120 km outside the polygon stands 6.5-12.7 km with no rain at all. The lowest ways out,
by the path from the floor that climbs least:

| Toward | Pass | |
|---|---|---|
| north-north-west (to the Bowl's side) | **6,158 m** | the one low notch, near px 726,896 (~5,900 m there, mean -12 °C) |
| south, south-west, west (Strongbow, Theodiga) | 7,296 m | |
| north | 7,354 m | |
| east and south-east (Hub 01) | 7,788-7,846 m | |
| north-east | 8,182 m | |
| the Godthrone's side (west-north-west) | 8,926-10,206 m | |

The basin under its spill level (6.2 km) is ~148,000 km². **Nothing below 6.2 km leaves it, and nothing below 6.2 km
comes in.**

## 2. Why the rain is generous

Rain needs water vapour, and vapour has to come in over the walls. What decides how much air can carry over a pass is the
**cold** there, not the pressure. Krator's dense air (1.6 atm at sea level, a scale height ~8 km) makes 6-7 km passes
breathable, 0.64-0.76 atm, like a 2.5-3.5 km pass on Earth. But the temperature still falls about 5-6 °C a kilometre,
so a 7 km pass is ~35-40 °C colder than the floor. Air at -20 °C and 0.65 atm holds ~1 g of water per kg; air on the floor
(+19 °C, 1.55 atm) holds ~9. Whatever crosses the walls is wrung to a tenth of what the floor's air could carry, has
dropped its rain on the outside slopes, and then sinks into the basin, warming and drying as it falls (a foehn). The
basin has **no lake and no sea** to supply vapour from inside.

The 4.21 figures most likely come from `reclimate`'s climate twins, as Pinnacle Rock's knoll did (`settlements/pinnacle-rock/KNOWN_ISSUES.md`):
the floor's twins are low, warm cells elsewhere on the crater, which are wet because they are open to the Ring Sea's air.
The climate pass does not see that the Catch is sealed.

**Earth's closed basins**, all more open than the Catch:

| Basin | Walls | Its lowest opening | Floor rain |
|---|---|---|---|
| Tarim (the Taklamakan) | 5-7 km | the east, open at ~1.2 km to the Gansu corridor; passes ~3.5-4 km on the west | 10-60 mm (Ruoqiang ~28, Hotan ~35, Kashgar on the rim ~65) |
| Turpan Depression | 4-5 km (the Bogda Shan) | open east and south at ~1 km | ~16 mm |
| Qaidam | 5-6 km | ~3.5 km | 15-50 mm in the west, ~150 in the east |
| Death Valley | ~3 km | many | ~50 mm |

The Catch has **no low side at all**, and its lowest notch is higher than any of these basins' passes. On Earth's numbers
it should be at least as dry as the Taklamakan's core.

## 3. What it should carry (the 4.22 correction)

| Band | 4.21 | Target | Class |
|---|---|---|---|
| floor, under 1 km | 369 mm | **10-30 mm** (the north-north-west, under the 6.2 km notch, a little more) | BWh, BWk in the coldest hollows |
| piedmont, 1-3 km | 482 mm | **40-120 mm**, rising with height | BWk, BWh |
| inner walls, 3-5.5 km | 147 mm | **100-250 mm**, most of it snow: the walls wring out what crosses the passes, and the oases' and the terminal lake's own vapour rises up them on summer afternoons | BSk, Dsc and ET dry |
| above ~5.5 km | | falling to nothing; airless above ~9 km | ET, EF where any snow lies; HF |

**Temperature.** Drier air means clear skies and a wider swing: the floor's warmest month **+33-35 °C** (from +29), the
coldest **+5-6 °C** (from +9), the daily range ~20 °C. The floor's air is dense (~1.55 atm), so the heat feels heavier
than Turpan's.

**Wind.** At night cold air drains off walls 10-17 km high, and the floor gets strong katabatic winds at dawn and
dust storms (the Tarim's *karaburan*, "black storm") in spring. Dense air moves more sand at the same wind speed, so the
dunes are big and the yardangs deep.

This goes on the model's to-do list as its own item (`tools/scale-model/README.md`, "4.22: the Catch, a closed basin").

## 4. Water

A dry basin can still have water. Ice and snow on the inner walls melt into rivers, the rivers run out onto alluvial
fans and die in the sand, and the last of them pool in a salt lake at the lowest point. This is how the Tarim's oases live.

**A rough budget.** ~74,000 km² of inner wall at ~150 mm is ~11 km³ a year. Most of it sublimates in the dry, thin air;
if a quarter runs off, that is **~2.8 km³ a year, ~90 m³/s** in all, split among a dozen or more short rivers, each 2-20
m³/s. On the floor open water evaporates ~2-2.5 m a year, so the terminal lake settles at **~1,100-1,400 km²**: a
shallow salt lake and playa at the lowest point (px 762,1067, 225 m). It moves as its rivers change course, the way Lop
Nur did ("the wandering lake").

**Groundwater.** The fans soak up their rivers, and the water runs under the gravels toward the floor. Tunnels dug into
the fans to bring it out by gravity, Turpan's *karez* (Persia's *qanat*), are what made the Silk Road oases. *Proposed*:
the Catch's oases live on karez, and some of the oldest were the Ancients' own, for Stair. Whether they still run, and
who keeps them, is a question for the owner.

## 5. The landscape: stations

1. **The sand sea**: the floor's core, a Taklamakan erg with star and linear dunes up to a few hundred metres, wind-cut
   yardangs on old lake beds, gravel *reg* between. Nothing grows on the dunes but a few deep-rooted shrubs.
2. **The oasis ring**: the toes of the fans where the rivers surface, all round the basin's foot. Riparian forest along
   the rivers (*tugai*: Euphrates poplar, tamarisk, reeds, licorice analogues), fields and orchards on karez water, poplar
   windbreaks. **Stair**, the ruined arcology at 1,130 m, stands on this ring.
3. **The terminal lake**: the salt lake, its salt crust and reed beds, the dead river channels where it used to lie,
   the dry lake beds the yardangs are cut from.
4. **The fans and the walls**: gravel fans tens of kilometres long, the dry gorges the rivers come out of, the walls'
   snowfields and small glaciers above, and nothing at all above ~9 km. The view is the point: 10-17 km walls on every
   horizon, the Godthrone's mass to the north-west.

The flora should **reuse the eastern desert kit's species where they fit** (`biomes/sedesert`) and add only what a
riparian, salty, enclosed basin needs: a tugai tree, a salt cedar, a dune shrub, the reed beds. Which of the kit's
species fit has not been checked yet.

## 6. People and roads

- **The caravans.** The lore already sends merchants "from the crater to Xanadu through the Bowl and the Catch"
  (`LORE.md` §4, Hub 01). The corrected basin makes that a **Silk Road**: a ring of oases round a sand sea, with caravans
  on the northern and southern rim roads and passes of 6.2-7.8 km at either end. The NNW notch (6.2 km) is the way in from
  the Bowl's side; Hub 01 (4,417 m, px 1072,1079, beyond the eastern walls) and Strongbow (px 754,1264, beyond the south)
  are the ways out. At 0.64-0.76 atm those passes are breathable, but bitterly cold.
- **The Ancients' road.** The draft network (`openworld/ANCIENT-ROADS.md`) runs **Arcbeam to Stair** over the Outer Wall.
  A road into a basin walled at 10+ km almost certainly ran in tunnel, which would make Stair the Catch's door for the
  Ancients as Ledge is the Rift's.
- **Who lives here** is open: the oases' people, their tongue, whether they rule the caravans or serve them.

## 7. Tuff country

The tuff candidate (`biomes/WORLD.md`; `LORE.md` §3.1 and §12) assumed the Godthrone's ash. The survey does not help it:
the two vents near the Catch's south-west notch (px 716,1128 and 770,1168) stand at 10.7 and 8.4 km on the airless walls,
and the floor is 300-600 km from the Godthrone's summit. A tuff station would need a lore decision (an explosive phase,
or vents on the floor); without one the floor's soft rock is **old lake beds**, cut into yardangs, which gives the same
carved, castellated look (Lop Nur's "White Dragon Mounds"). If the owner wants carved dwellings, they go in the lake-bed
cliffs.

## 8. Questions for the owner

1. **The correction**: apply the floor's ~10-30 mm in 4.22, with a terminal lake at 225 m and the oasis rivers?
2. **The karez**: the Ancients' own for Stair, the oases' own, or both? Do they still run?
3. **Who lives in the Catch**, and does it rule its passes?
4. **Tuff**: keep it as a candidate (it needs a lore decision), or let the lake-bed yardangs take its place?
5. **The kit**: `biomes/catch`, four stations as in section 5, on the shared biome core.
