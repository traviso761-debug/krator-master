# The Ancients' tunnels under the ranges: the bores and the caves they meet (plan, 2026-11-03)

**Status: a plan; nothing is built.** It continues `ANCIENT-ROADS.md` section 3 (the Rift line, Pluton's tunnels, the
Inner Wall tunnel). The owner, 2026-11-03:
- the Ancients' transport tunnels under the mountain ranges are a kind of "cavern" of their own;
- they are mainly for trains, and some stretches still run, especially in the Tungangs' territory;
- **significant portions are straight bores through the rock**;
- the question: what natural caves would they meet crossing the mountains, that people could live in?

## 1. The two lines, profiled on scale model 5.1

Each line is taken as a straight bore between the points where the surface first and last reaches its portal height, level
or near-level between them (the Ancients' ruling grade is about 4%: these are flatter). The rock is `kits/resources`'
geology. "Cover" is the rock over the tunnel.

| | The Rift line (Dalab to Ledge) | The Inner Wall tunnel (crater floor to the Valley of the Ancients) |
|---|---|---|
| Straight line | 439 km, 5.1 px 464,1112 to 437,1330 | 385 km, Drum 673,932 to Dorado 483,964 |
| Bored | **306 km**, portals at 3,614 m (the northern foothills, px 458,1158) and 3,501 m (above Ledge, px 440,1307), grade -0.04% | **142 km**, portals at 3,758 m (px 623,940) and 3,014 m (px 553,952), grade -0.52% |
| Cover over 1 / 2 / 3 / 4 / 6 km | 234 / 180 / 144 / 114 / **36 km** | 98 / 52 / 16 / 0 / 0 km |
| Most cover | **6,868 m**, 124 km from the north portal, under an airless crest of 10.2 km | 3,096 m, 54 km in |
| Rock along it | crystalline (gneiss) 112 km, rift fill 120 km, impact breccia 40 km, granite 20 km, sedimentary 16 km | gneiss 90 km, sedimentary 34 km (the west end: swhighlands' ring folds), granite 20 km |
| Surface over it | rain 550 mm at the north portal, **none** over the crest (km 60-180), 300-860 mm over the rift end | 250-420 mm over the wall, 970-1,320 mm over the west end |
| Nearest vent / lava tube | 136 km / 554 km (`DATA.vents`, `DATA.tubes`) | 216 km / 413 km |

Earth's long rail tunnels are the measure: the Gotthard base tunnel is 57 km under up to 2.3 km of cover, and its rock was
45 degC. **The Rift line's middle is far deeper.** At an ordinary 20-30 degC per kilometre of cover, its 36 km under more
than 6 km of rock sits in rock at well over 100 degC, under ground where nothing lives and no air stands on the surface.
The Ancients ran that stretch cooled and sealed. Only the train crosses it now. The Inner Wall tunnel stays under about
3 km and is cooler: perhaps 50-70 degC rock at its deepest.

**Where people can live is decided by that:** near the portals; under the valleys and passes, where the cover is thin;
at the side adits and ventilation shafts; and where the line runs into the rift fill. The deep middle is crossed, not lived in.

## 2. The straight bores

A large part of each line is **one straight bore**: tens of kilometres without a bend between stations, the alignment
held to millimetres.

- **The section.** A circular bore, lined with precast segments in rings (the joints a fine grid), the guideway on a flat
  invert, a walkway and a cable trough on each side. One bore each way, joined by **cross-passages every ~500 m**. The
  highway's 30 m way (`ANCIENT-ROADS.md` section 2) is the open-air section. The bores carry the line, which is the
  guideway and its trains, not the paved road. *Proposed:* bores of about 10-14 m inside.
- **Straight between stations.** It bends only into stations, at spiral ramps near the portals (to take up height at 4%)
  and round bad ground. A walker sees the lamps run to a point. The ring joints and the dead lamps make the length readable.
- **Stations every ~30-50 km** (`ANCIENT-ROADS.md`): excavated caverns, platforms, sidings, workshops, cisterns, the
  ventilation and the doors that close a section. These are the most-lived-in spaces of all: level, dry, already doored.
- **Adits and shafts.** Side galleries out to valley floors where the cover is thin, and vertical shafts for air and
  for the build. Along the Rift line they cluster at both ends, where the cover is under ~2 km. At the north end the bore
  passes under an impact-breccia bench and a sedimentary valley (km 20-40) where an adit could reach daylight.
- **The deep middle** (the Rift line's km 60-180). The lining is intact or the tunnel is gone; the cooling plant is dead or
  barely kept; the doors at either end of the hot section are the Tungangs' most important machinery after the trains.
  Rockbursts (stressed rock spalling from the walls) mark the deepest stretch.
- **Condition.** As `ANCIENT-ROADS.md` section 4: kept stretches (the Tungangs'), collapsed stretches (at the fault zones in
  the breccia), flooded stretches (at the low points where karst or rift water came in). Whatever cuts a straight bore is
  the event a traveller remembers: a fault, a flood, a cave.

## 3. The natural caves the bores cut, and who lives in them

Ranked by how livable they are. Each is placed where the profiles above put it.

| # | What the bore cuts | Where on these lines | Livable? | Who, and how | Built with |
|---|---|---|---|---|---|
| 1 | **The Ancients' own voids**: stations, sidings, construction halls, spoil chambers, cisterns | every 30-50 km | **best**: level, dry, doored | the Tungangs' outposts (`riftrim/PLAN.md` section 6) and the line's keepers | `KCAVERN` halls and tubes; a station kit (owed: `kits/ancients`) |
| 2 | **Hypogene chambers** where hot water rose through the rift fill | the Rift line's southern 100 km (the rift fill) and the side galleries toward the rim's vents (the Hearth field, 525,1400) | **the best natural homes**: warm, wet, water and dark crops | **the Tungangs' holds**, as the lore has them | `KKARST` `kind:'hypogene'` (and `crystal` where a storey grew megacrystals: `biomes/CRYSTAL-CAVES-5.1.md`) |
| 3 | **Gypsum and salt mazes** in the rift fill | the Rift line's southern end, km 200-306 | good: dry, roomy, a thousand rooms | the lesser holds; the lost loj in the east under Cube (`KARST-SITES-5.1.md` site 3) | `KKARST` `kind:'maze'` |
| 4 | **Karst in limestone bands**: caves, and water bursting in | the Inner Wall tunnel's west third, under swhighlands' ring folds; carbonate blocks in the walls' breccia | water, and room; flood-prone | cisterns, seasonal camps, the bore's flooded sumps | `KKARST` `kind:'branch'` (`KARST-SITES-5.1.md` site 2 is the same folds) |
| 5 | **Lava tubes** | not on these two lines (the nearest is 413-554 km off); on Pluton's tunnels up the Godthrone and wherever a line crosses a volcanic flank | ready-made galleries, long and level | the Zeijani elsewhere; any line's keepers | `DATA.tubes`; `core/terrain`'s tube and lava modules |
| 6 | **Block caves in the impact breccia**: gaps between house-sized blocks, dilation fissures on the slump faults | the Rift line's north end (40 km of `impact` province) and its fault zones | hideouts, smugglers' routes: unstable | outlaws, scavengers; the collapsed stretches are here | `KCAVERN` (halls and tubes on a jittered block field); a `KSTACKS`-like block body would help (owed) |
| 7 | **Alpine crystal clefts** in granite and gneiss: quartz-lined pockets, metres to tens of metres | the granite (20 km on each line) and the gneiss | too small to live in; **treasure rooms and shrines** | the Tungangs' own shrines, kin of the Zeijani's stone eggs (`LORE.md`) | `KCAVERN` hall + `KSPELEO` druse (a smoky-quartz preset owed: `KSPELEO.VUG` with quartz is the nearest) |
| 8 | **Ice caves** under glaciated passes: meltwater galleries crossing the shafts | the high rim, the Stalker Range, Copper Glacier: where a shaft reaches a glacier | water, seasonally; cold | water-gatherers | (owed: an ice-cave module) |
| 9 | **Breccia pipes** (diatremes) | where a line passes a maar field (the Siphon Pits) | a dangerous way up to the surface | a smugglers' or a raiders' shaft | `KCAVERN` shaft + loose fill |

**The pattern for the Tungangs.** Their holds are the hypogene chambers and the stations at the warm southern end; their
outposts are the adits; their shrines are the crystal clefts; their lesser holds are the gypsum mazes. They keep the
trains running because the deep middle can only be crossed by train. A loj's rank in the Book may follow how many
stations of the line it keeps.

## 4. Hazards along a bore

Most are in `core/hazard` already: `heat` with `soak` (the hot section's air), `gas` with `shape.pool` (CO2 and H2S
from faults, pooling in the low points), `drown` (the flooded sumps), `fall` (the shafts), `crush` (the collapsed
stretches). Owed: a **rockburst** (a cycle on a `crush` record: the deep stretch spalls); an **inrush** (a `drown` that
starts on a cycle where karst water breaks in); a **seal** (a door whose failure turns a section airless where it reaches
the airless surface).

## 5. What to build, in order

1. **A tunnel record**, `{id, line, pts (straight segments), bore: {r, lining, twin}, stations, crossPassages, adits,
   shafts, crossings: [{at, kind: 'karst'|'hypogene'|'maze'|'tube'|'breccia'|'cleft'|'ice'|'pipe', ref}], cond: per
   segment}`, derived from the router's tunnel spans (`ANCIENT-ROADS.md` section 5) and the cover profile above. Plain
   data (`[G data]`).
2. **The bore's drawing**: a lined tube (`KCAVERN`'s pipe body and bore primitives, `39-core-cavern.js`, already make a
   hollow lined body on a centreline), its ring joints, the guideway, walkways and lamps. A precast-segment lining
   material is owed (`core/materials/PROMPTS-NEEDED.md`).
3. **The crossings**: where a crossing's kind names a cave, build it with its module (`KKARST`, `KSPELEO`, tubes) and
   join it to the bore: a breach, a bulkhead, a stair, a window.
4. **A station kit** and the trains (kits/ancients).

The first station to build is the Rift line's southern end: the stretch from the last station to Ledge, the rift fill's
holds beside it, and a train that still runs.
