# The Line: the Rift line's biome and its train (plan, 2026-11-11)

The Ancients' Rift line under the Outer Wall, the tunnels the Tungangs keep, and the train built for it. The first piece
of the Tungang work, in the owner's order (2026-11-10): **"we need to get the look of the caverns and Line tunnels right.
we'll also need a train vehicle custom built for it"**; then the cavern layout in `core/city` (T2), then the culture kit.

**Status: approved by the owner (2026-11-11), all 17 questions answered; building started on the owner's word the same day.** Built so far
(see section 14, "Progress"): the Line train and the Tungangs' stock in `kits/motor-vehicles`, the `bore` station, the bore hazards in
`core/hazard` (opt-in). Waiting: the line record on `KTRANSIT` (the transit kit's merge to main).
The answers are below; where a section still says *proposed*, the answer settled it as written unless the answers say
otherwise. The core changes (section 11) are each agreed before code, and a page that does not opt in stays
byte-identical.

## The owner's answers (2026-11-11)

1. **The Line's shape**: accepted (four segments, three gaps, the hot section the middle of the long run).
2. **The numbering**: **"cube is loj nahn so renumber accordingly"**: Loj Nahn, the number no Tungang says, is **9**, the Pile's
   station. Counted **north to south** as `LORE.md` has it (no change to LORE): **1 Dalab, 2 Shelf** (the north mouth),
   **3 the Twenny junction** (km 218), **4 Ledge's lifts**, then down into the Rift **5 Nulab, 6 Chimes, 7 Cthonos, 8 The
   Tubes, 9 the Pile**. The Line's other stops (the valley, the fault junction, the doors, the sealed stations, km 250, the
   shallow station, the south mouth) are **unnumbered halts named by the station before them** (2a, 2b, ...). Loj Twenny's
   20 is a later founding (section 2). And: **"the line might connect to strongbow, theodiga, and all the way to Stair and
   an arcology to be placed in the bowl maybe"**: surveyed now (section 2.2).
3. **Loj Twenny**: by a 25 km side tunnel from the Twenny junction (km 218).
4. **The section**: accepted (the gallery, now 37 m with the access road, guideways, twin bores, flexing-beam crossovers).
5. **The north approach**: accepted (spirals under Shelf, the Line's northern station town).
6. **The power**: accepted (the plant at the hot doors, rare-earth magnets, the cyan lit only in the hot section).
7. **The stations**: accepted, `bore` first; **`hotdoor` at the north door** (km 55, granite, the cleft shrine).
8. **The train**: accepted (24 m cars, 3.6 m wide, sealed; kept trains at 15 m/s).
9. **The car states**: accepted (built, kept, derelict, wreck; `kept` a culture's upkeep dress).
10. **The Tungangs' stock**: in the vehicles kit, a `tungang` culture.
11. **Riding**: the hook accepted as agreed with the riding session (section 8).
12. **Merging**: **ask the ancient-transit and ancient-vehicles sessions to merge their branches first**; the Line builds on
    `main` after.
13. **Hazards**: add `rockburst`, `inrush` and `seal` to `core/hazard` as opt-in kinds.
14. **Textures**: write the three prompts into `core/materials/PROMPTS-NEEDED.md` (done 2026-11-11).
15. **The portal**: accepted (the shallow south, a stretch fallen open, 42 km on the surface to Ledge).
16. **The ore**: accepted (veins from `kits/resources`' nodes; section 2.1's table).
17. **The shafts**: accepted, hidden; **raid reach 15 km** (a night out and back).

**And, mid-answer** (the owner, 2026-11-11): **"where the network runs aboveground, we should have an ancient highway running
alongside it. in places of rough or boggy terrain, the whole network may be elevated like louisiana highways"** (section
2.3).

**The concept page**: https://claude.ai/artifact/CyanY5xY3itERUzw3tZSmm (source `concept/line-concept.src.html`, the
survey's profile injected into `concept/line-concept.html`): the board of segments and gaps, the profile, the section to
scale, the train in four states, the stations, the questions.

**Riding is not this plan's.** People and cargo aboard are planned by the riding session in
`core/simulation/PLAN-RIDING.md` (branch `claude/clever-rhodes-cb3fec`). This plan answers that plan's hook (its
section 3) for the Line's side: tracks, timetables, car poses, car interiors, stops (section 8 here).

## Settled before this plan (quoted, not proposed)

| What | Where |
|---|---|
| The Ancients built **tunnels under the Outer Wall** to their Rift settlements; **Ledge** is where the line comes out of the Wall; **the Pile** (once Cube, Arccube: renamed by the owner, 2026-11-11) is the Rift's hub; **most of the Dalab-Ledge line runs underground**, ~340-420 km with stations, sidings and side galleries, joined to the natural caves | `LORE.md` §4 |
| The Ancients' road was **one broad 30 m way with a guideway down its middle**: road and line are one; ruling grade ~4 %, no switchbacks: spiral tunnels | `ANCIENT-ROADS.md` §2 |
| **Significant portions are straight bores**; stations every 30-50 km are "the most-lived-in spaces of all: level, dry, already doored"; the deep middle crossed only by train; **the doors at either end of the hot section are the Tungangs' most important machinery after the trains**; rockbursts in the deepest stretch; collapsed stretches at the breccia's faults, flooded ones at the low points | `ANCIENT-TUNNELS.md` §1-2 |
| The tunnels are "**a kind of cavern of their own**" (the owner, 2026-11-03) | `ANCIENT-TUNNELS.md` |
| The Tungangs keep stretches of the tunnels and Ledge's lifts, the old timetable and signal codes kept as rite; the **Fixers** keep the Line far from the holds; lojes **numbered** after the Line's stations (Ledge's lifts are **Loj Fower**) | `LORE.md` §6.1 |
| **At least four tracks side by side.** Some or all broken in places, **but mostly functional**; **travellers walk the caverns between intact segments** | the owner, 2026-11-10 |
| **The Line is a `line` kind in `KTRANSIT`**; **its cars live in `kits/motor-vehicles`**; **people and cargo must be able to ride** | the owner, 2026-11-10 (tungang plan, round 2) |
| **Riding in its own session** | the owner, 2026-11-11 (`PLAN-RIDING.md`) |
| Tungang look: furniture **post-apocalyptic Soviet**; **friendly Morlocks, no clichéd dwarves**; equipment and architecture mostly **salvage of Ancient wreckage** | `kits/yeti/PLAN.md` §11; tungang plan's brief |

## 1. The line on scale model 5.1 (surveyed 2026-11-11)

`python3 biomes/line/tools/survey_line.py` (this folder; reads `tools/scale-model/model/data` and
`kits/resources/data/geology.json`, never edits them) profiles the straight line of `ANCIENT-TUNNELS.md` section 1,
Dalab (464,1112) to Ledge (437,1330), 439 km. The bore runs between the portals where the surface first and last reaches
the portal heights (3,614 m north, 3,501 m south), its floor graded straight between them (-0.04 %). Rock temperature is
the surface's mean temperature plus 25 degC a kilometre of cover. Its numbers agree with `ANCIENT-TUNNELS.md` within a
kilometre or two (304 km bored here, 306 there: a finer sampling).

**Chainage.** Every place on the Line is given as **km from the north portal** (the bore's s / 1000). The north portal is
at 5.1 px 458.2,1158.6 (line km 94 from Dalab), the south portal at 439.5,1309.5 (line km 398).

| Bore km | px | Surface m | Cover m | Rock | Rain mm | Rock degC | Nearest site |
|---|---|---|---|---|---|---|---|
| 0 | 458,1159 | 3,721 | 107 | impact breccia | 532 | 6 | Shelf 7 km |
| 20 | 457,1169 | 4,740 | 1,133 | sedimentary | 327 | 26 | Shelf 17 km |
| 40 | 456,1178 | 5,248 | 1,649 | impact breccia | 220 | 36 | Shelf 36 km |
| 60 | 455,1188 | 6,960 | 3,368 | gneiss | 65 | 68 | |
| 90 | 453,1203 | 7,554 | 3,973 | granite | 0 | 79 | |
| 124 | 450,1220 | 10,449 | **6,881** | gneiss | 0 | **~130** | (the deepest) |
| 160 | 448,1238 | 8,218 | 4,663 | gneiss | 0 | 93 | |
| 190 | 447,1253 | 7,171 | 3,627 | rift fill | 162 | 73 | Loj Twenny 38 km |
| 215 | 445,1265 | 5,880 | **2,126** | rift fill | 439 | 44 | Loj Twenny 25 km |
| 240 | 443,1278 | 4,948 | 1,423 | rift fill | 267 | 31 | Loj Twenny 32 km |
| 260 | 442,1288 | 4,183 | 666 | rift fill | 785 | 17 | |
| 280-304 | 441-440,1298-1310 | 3,540-3,570 | **30-60** | rift fill | 850 | 5 | Ledge 45-65 km |

| | |
|---|---|
| Cover over 1 / 2 / 3 / 4 / 5 / 6 km | 233 / 179 / 143 / 113 / 59 / 36 km of bore |
| Rock along the bore | gneiss 113 km (km 58-81, 98-186), **rift fill 118 km** (km 187-304), impact breccia 38 km (km 0-16, 33-53), granite 20 km (km 54-57, 82-97), sedimentary 16 km (km 17-32: a valley) |
| Rock over 60 / 80 / 100 degC | km 57-201 (145 km) / km 68-185 (113 km) / km 101-152 (52 km) |
| Cover minima (cheapest shafts and adits) | km 89 (granite, 3,961 m, 79 degC), km 160 (4,663 m, 93 degC), **km 215 (rift fill, 2,126 m, 44 degC: the shallowest point south of the crest, 25 km west of Loj Twenny)** |
| Surface over the crest | rainless from km ~75 to ~180; 7.5 to 10.4 km high: **near-airless** (the airless line is 8 km, `geology.py` `AIRLESS_M`): a shaft there vents to almost nothing |

**What the survey says, beyond `ANCIENT-TUNNELS.md`.**
- **The south end is shallow.** From km 270 to the portal the bore runs 30 to 280 m under a flat tableland at 3,530 m,
  wet (850 mm): a cut-and-cover gallery more than a bore, with light and air shafts to the surface, and the place a
  collapse opens a gallery to the sky. The portal is not a mountain mouth but the end of a long shallow cover, and the
  Line runs 42 km on the surface from it to Ledge's cliff (3,400 m, the lifts down 1.3 km to the lake).
- **The north approach must climb.** Dalab is at 600 m; the surface reaches the portal height only 16 km before the
  portal (1,300 to 3,600 m). At the 4 % ruling grade the climb needs ~57 km, so the Line goes underground low, near
  km -35, and climbs inside the Wall on **spiral ramps** (canon in `ANCIENT-TUNNELS.md` §2) to the bore's level. The
  north portal of the survey is where the bore reaches its level, not a mouth. *Proposed*: the climbing spirals are in
  the impact breccia under Shelf (the arcology at 461,1161, 6 km off): Shelf was the Line's northern station town.
- **The hot section is long**: 145 km of rock over 60 degC, its middle 52 km over 100 degC, under ground that is dry and
  near-airless. Its two cooler pockets (km 89, granite; km 160) are the natural places for the Ancients' mid-section
  stations, now sealed.
- **The rift fill is the Tungangs' country**: the southern 118 km, warm (30-60 degC rock), wet, cut by hypogene chambers
  and gypsum mazes (`ANCIENT-TUNNELS.md` §3), the shallowest point at km 215 toward Loj Twenny.

*Discrepancy to settle*: the tungang plan puts Loj Twenny "on `tube_rift_08`", but `DATA.tubes`' `tube_rift_08` runs at
628,1528 to 594,1558, 300 km south-east; Loj Twenny (457,1269) is in rift fill, 25 km east of the Line's km 215. This plan
takes it as a cavern loj reached by a side gallery from km 218 (question 3).

## 2. The Line's shape along its length (*proposed*)

The owner settled four tracks, mostly working, walked between segments. Laid on the survey:

```
 bore km  0      24    33-36   45   55          89         124         160        203  218   236-239  250 262-264 285  304  (+42 surface) Ledge
          |------|------XXX----|----D==========(g)=========(g)=========(g)========D----J-----XXX------|----XXX----|----P====================L
          N portal valley  G1  fault N door      ghost       ghost       ghost  S door  Twenny  G2      st   G3    shallow  S portal      lifts
          (Shelf) (adit)       junct.  |<------------------ the hot section, km 55-203 ------------------>|  junct.
 segments [-- N --]    [-------------------------------- M: the long run ---------------------------------]    [-- S1 --]   [------- S2 ---------->]
```

| | Bore km | What | Kind |
|---|---|---|---|
| North portal | 0 | the bore's north end under Shelf; the spirals down to Dalab's plain | Ancient station |
| Valley | 24 | under the sedimentary valley: an adit to daylight (cover 1.1 km) | Ancient station |
| **G1** | 33-36 | the breccia's first fault: **the whole width fallen**; walked through block caves (`ANCIENT-TUNNELS.md` cave 6) | gap |
| Fault junction | 45 | the gallery split into two twin-track bores in the breccia; one bore sheared | junction hall |
| **North door** | 55 | the hot section's north doors, its cooling plant, the end of the breccia, granite | Ancient station |
| Ghost stations | 89, 124, 160 | the mid-section stations, sealed and hot; the train runs through | Ancient station |
| **South door** | 203 | the hot section's south doors | Ancient station |
| Twenny junction | 218 | the side gallery east to Loj Twenny (25 km); the shallowest cover near the crest | Ancient station |
| **G2** | 236-239 | the bore cut a hypogene chamber and the gallery fell into it; walked across the chamber, a sump waded | gap |
| Station | 250 | a loj on the old station | Ancient station |
| **G3** | 262-264 | a karst inrush flooded every track; the Fixers' bypass gallery round it | gap |
| Shallow | 285 | a cut-and-cover station under the tableland, shafts to the sky | Ancient station |
| South portal | 304 | the Line comes out on the tableland | portal |
| Ledge | +42 surface | the arcology's top level, the lifts down the cliff (Loj Fower) | Ancient station |

**Segments.** A gap is where every track is cut; between gaps a **segment** runs its own trains, shuttling between its two
end stations. The trains were trapped by the collapses a thousand years ago and are the segment loj's (the tungang plan
§0.2). Four segments:

| Segment | Bore km | Trains (*proposed*) | Ends |
|---|---|---|---|
| N | 0-33 | one train and a trolley | the north portal (Dalab's side: the train meets Dalab's road) and G1 |
| **M, the long run** | 36-236 | **three sealed trains** (two running, one in the shed), the trolleys | G1 and G2, through both doors |
| S1 | 239-262 | one short train | G2 and G3 |
| S2 | 264 to Ledge | two trains | G3 and Ledge's lifts, over the portal and 42 km of surface |

**The hot section is not a segment of its own.** It is the middle of the long run, which stays whole because the hot
section must: if it broke, north and south would be cut apart (the tungang plan). The doors close it within the segment;
the sealed trains are the long run's.

**Timing** (*proposed*). A kept train runs at 15 m/s (the Ancients' 45 m/s is too much for the guideway as it is kept):
the long run's 200 km in about 4 h with its stops, one departure each way per turn (8 h) per running train; a gap walk 1
to 4 h (G1 the block caves 3 km, 2-3 h; G2 the chamber and the sump 3 km, 3-4 h at low water; G3 the bypass 2 km, 1 h).
Dalab to Ledge in about two days. The timetable is the Tungangs' rite and the data that runs the trains (section 7).

**The Line's power** (*proposed*, question 6; the owner, 2026-11-11: "maybe something more exotic maintains the power
sources", `kits/tungang/PLAN.md` §1.2.1): the trains draw power from the guideway, and the cooling plant still turns,
so something still makes power. *Proposed*: **the hot section powers the Line**. The Ancients' power plant stands
**at the hot doors**: heat exchangers reach past the inner door into the 60 to 130 degC rock, and the doors' cooling
plant is the same machinery's cold side. The heat that makes the middle deadly is what runs the trains: the Tungangs'
rite of upkeep is literally keeping the lights on. **The exotic part is rare earths**: the generators' magnets, which
the Tungangs re-wind and patch with the rift fill's rare-earth ore (section 2.1). A few salvaged Ancient power cells are
recharged there. It also explains why **the cyan strips still glow** in the hot section ("perhaps sometimes glow in
forgotten corners", `LORE.md` §4) and nowhere else: it is the one stretch the plant feeds whole.

### 2.1 Ore, power and air (the owner's lore of 2026-11-11)

The owner (2026-11-11, written up in `kits/tungang/PLAN.md` §1.2.1): the Tungangs have more to trade than copper; they
likely reach **veins of metal** through the Line's tunnels and the caverns it passes, since they need metal to keep the
trains running; they may source **ice and other things from the mountains**; and there are probably **at least a few
ventilation tunnels to the surface**. The kit's buildings for it (`tg_vein_working`, `tg_refinery`, `tg_power_hall`,
`tg_shaft_foot`, `tg_shaft_head`) are the Tungang kit's; the Line gives them their places.

**Ore along the bore** (the geology bake's prospectivity bytes, 0-255, sampled by `survey_line.py`; the bytes follow
the province):

| Bore km | Rock | Iron | Copper | Gold | Silver | Tin | Rare earths | Nickel | The Fixers' workings (*proposed*) |
|---|---|---|---|---|---|---|---|---|---|
| 0-16, 33-53 | impact breccia | 120 | 50 | 90 | 80 | 40 | 60 | **60** (the only nickel on the Line) | iron and a little gold and nickel in the breccia's melt veins; unstable ground |
| 17-32 | sedimentary | **180** | 10 | 0 | 0 | 0 | 0 | 0 | **the Line's iron**: ironstone beds under the valley, near the adit |
| 54-57, 82-97 | granite | 120 | 50 | 110 | 110 | **200** | 160 | 0 | **tin** (greisen veins) and rare earths; inside the hot section, so worked only from the north door's end (km 54-57) |
| 58-81, 98-186 | gneiss | 160 | 50 | 110 | 110 | 60 | 100 | 0 | iron, gold and silver in quartz veins; all inside the hot section: Ancient-era workings, sealed |
| 187-304 | rift fill | 70 | **120** | 90 | 80 | 50 | **190** | 0 | **copper and rare earths** (the carbonatites): the Tungangs' main workings, where they live |

So the heartland gives copper and the rare earths for the magnets; iron comes from the valley at the north end (Dalab's
side) and tin from the north door's granite; gold and silver from the gneiss are behind the hot doors. *Proposed*: the
metals move along the Line as the Tungangs' own cargo (the riding plan's consignments), and iron and tin from the north
are why the Tungangs need the long run to stay whole.

**Veins are records, not paintings.** `LN.veins` is derived, as the segments are: `kits/resources`' node field
(`KRES.nodesIn`, the nearest-node rule every works uses) run over a corridor of the bore, keeping the nodes the bore
crosses or passes within 300 m. Each vein is `{id, s, side, family, grade, node, working: {state, len}}`, its grade the
node's, so the open world and the Line agree on where the metal is. Where a vein crosses outside the hot section, a
**Fixers' side gallery** follows it (a `KCAVERN` tube off a refuge niche, its state kept, worked out or abandoned).

**Shafts to the surface** (*proposed*, where the cover is thin; the survey's cover):

| Bore km | Cover | Surface | Shaft | To Dalab's road | A raid point? |
|---|---|---|---|---|---|
| 4, 10 | 0.2, 0.7 km | 3.9-4.4 km, the foothills under Shelf | the north end's air | 6, 8 km | **yes**: the road climbs past Shelf right over the Line's north end |
| 24 | 1.1 km | 4.8 km, the sedimentary valley | the valley's adit and shaft | 13 km | **yes** (a night out and back) |
| 218 | 2.2 km | 5.8 km, the fells over the rift fill | **the great shaft**: the hot section's southern exhaust, at the Twenny junction; the deepest the Ancients sank | 34 km | no: two nights, with a hidden camp |
| 250, 260 | 1.1, 0.7 km | 4.7, 4.2 km | the rift end's air | 26, 24 km | no (two nights) |
| 270-304, every 400 m | 30-280 m | 3.5-3.8 km, the tableland | the shallow south's light and air shafts | 21 km at km 270, falling to **12 km at km 300** | **yes** from km ~290: the road's last stretch to Ledge's cliff |

The distances are to Dalab's road as `biomes/riftrim/PLAN.md` routes it (Dalab, Shelf, 488,1220, the crest 483,1236,
477,1245, Ledge 436,1329; its x at y 1196, 1270 and 1300 interpolated here, so to about 2 km). A raid point is a head
within 15 km of the road: a night's walk there and back over the fells.

None inside the hot section: the crest over it is near-airless, so a shaft there would vent the section (the `seal`
hazard; the `hot-sealed` check). **The shaft heads** on the mountain have a winch house, an ice store and a hooded white
lamp; the Fellgang road families porter there (the tungang plan's Travellers): the mountains' ice comes down the shafts to
the hot holds.

**Hidden** (the owner, 2026-11-11: "the entrances' locations are kept well hidden from outsiders"): a shaft head reads as a
cleft in scree or a turf-capped hut that looks like a boulder, with no path to it; its hooded lamp is lit only to a
signal (the disguised forms are the kit's `tg_shaft_head`). Every shaft and adit is `hidden: true` unless an outsider
knows it (Ledge's lifts and the portals are known). A map shows a hidden head only to those who know it, the minimap
included.

**Raids** (the owner, 2026-11-11: a striking Tungang Union "might exploit" the shafts "to take direct action against Dalab
caravans"): a loj on strike comes up a shaft at night over Dalab's road to block it, cut beasts loose or take cargo down,
and vanishes. The shafts within reach of the road are the raid points of `core/simulation`'s Dalab-Tungang latent war
(`PLAN-POLITICS.md`): `road: {id, d, reach}` on each shaft says which.

`LN.shafts` gives each `{id, s, side, top: [x, y, z], depth, r, kind: air | adit | winch, state, hidden, road: {id: 'dalab-ledge', d, reach}}`.

**The numbering** (settled by the owner, 2026-11-11: the Pile (once Cube) is Loj Nahn). Canon has the lojes numbered "after the Line's
original stations north to south (Ledge's lifts are Loj Fower)". The Ancients numbered only the Line's **main stations**,
north to south: **1 Dalab** (the lab), **2 Shelf** (the north mouth, the spirals' head), **3 the Twenny junction** (km 218,
the great shaft), **4 Ledge's lifts**, and in the Rift **5 Nulab** (the lake shore under the lifts), **6 Chimes**, **7
Cthonos**, **8 The Tubes**, **9 the Pile**: Loj Nahn, the number no Tungang says, the lost loj in Arccube's upper levels. Every
other stop is a **halt**, named by the main station before it: the valley 2a, the fault junction 2b, the north door 2c, the
sealed stations 2d to 2f, the south door 2g; km 250 3a, the shallow station 3b, the south mouth 3c. Lojes founded later in
caverns off the Line took numbers past the stations' (Loj Twenny, 20, off station 3). Beyond the Pile the count goes on (10
Theodiga, 11 Strongbow, 12 Stair: section 2.2).

### 2.2 Beyond Ledge: the Rift's stations, the Pile and the line east (surveyed 2026-11-11)

The owner (2026-11-11): "the line might connect to strongbow, theodiga, and all the way to Stair and an arcology to be
placed in the bowl maybe". `python3 biomes/line/tools/survey_extension.py` takes straight legs between the stations on
5.1, graded straight end to end; ground more than 60 m over the grade is tunnel, more than 30 m under it viaduct
(`ANCIENT-ROADS.md` §2's thresholds). A first look, not a route: **the routing is the Ancient network session's**
(`openworld/ANCIENT-ROADS.md`, branch `claude/ancient-network-9cc3e7`), which gets these numbers.

| Leg | km | Ends (m) | Surface (m) | Tunnel | Viaduct | Over water | Rock |
|---|---|---|---|---|---|---|---|
| 4 Ledge's lifts' foot to 5 Nulab | 59 | 1,563 to 344 | -216 to 1,563 | 0 | 57 | **51** (the great lake) | rift |
| 5 Nulab to 6 Chimes | 83 | 344 to 243 | 243 to 883 | 58 | 0 | 0 | rift, volcanic |
| 6 Chimes to 7 Cthonos | 250 | 243 to 2,313 | -1,848 to 2,738 | 34 | **208** | 0 | rift |
| 7 Cthonos to 8 The Tubes | 186 | 2,313 to -77 | -766 to 3,328 | **137** | 46 | 0 | rift, volcanic |
| 8 The Tubes to 9 the Pile | 228 | -77 to -224 | -2,600 to -36 | 0 | **219** | **154** (the Rift's lake) | rift |
| 9 the Pile to 10 Theodiga | 381 | -224 to -495 | -2,304 to 1,614 | 115 | **229** | 23 | rift, volcanic |
| 10 Theodiga to 11 Strongbow | 264 | -495 to 1,535 | -760 to 2,515 | **188** | 68 | 43 | rift |
| 11 Strongbow to 12 Stair | 344 | 1,535 to 1,379 | 983 to 4,553 | **329** | 11 | 3 | granite, gneiss, sedimentary (the Catch's walls) |
| **Ledge to Stair** | **1,795** | | | **861** | **838** | **274** | |

**Routed by the network session** (2026-11-11, `openworld/ANCIENT-NETWORK.md` §8.6 on `claude/ancient-network-9cc3e7`, commit
3e773f2bc, unpushed; the Ancient cost at 4 %, tunnels only above 8 km, water at 8x): Chimes to Cthonos 278 km (89 tunnel),
Cthonos to The Tubes 221 km, **The Tubes to the Pile 292 km round the lake** rather than across it (put to the owner), the
Pile to Theodiga 424 km, Theodiga to Strongbow 296 km, Strongbow to Stair (possible) the straight bore above, 344 km with
329 bored; from Stair the existing Stair line runs north to **the Bowl's arcology, placed provisionally at 1024,1149**.
The network keeps this plan's chainage as its `rift` route's datum (bore km 0 = route s 94 km), adopts the station
numbers as `stations[].num`, and takes the corridor (`way`), the Louisiana decks (`trestle`) and the access road with
its service bore for every route. The Line's bore is unchanged.

- **The Rift floor is crossed high**: from Chimes to Theodiga the straight legs run more than half their length over
  ground far under the grade (the Rift's trenches and lakes): the Line rides a **continuous elevated way** there (section
  2.3), with tunnels through the ridges between (Cthonos to The Tubes). The router will bend it round the worst.
- **The Tubes to the Pile crosses the Rift's lake**: 154 km over water on the straight line; the router may keep to the
  shore. the Pile's own station (9) stands in Lizardmen country: the Line there is the reward's road, mostly broken.
- **Strongbow to Stair is one long bore** (329 km tunnel under the Catch's walls, 4.5 km high), kin of the Arcbeam-Stair
  tunnel closed by the quake (`biomes/catch/PLAN.md`). Strongbow was Xanadu's end of the line (`LORE.md` §4): *proposed*,
  the bore beyond it is sealed or fallen, and Xanadu keeps only its own short line.
- **The Bowl's arcology** is still to be placed (the owner's "maybe"): between Stair (1106,1442) and Arcbeam (1016,1058),
  on the Bowl's floor near Mantis (1113,1164), it would join the Rift line to the Arcbeam-Stair route and so to the
  crater's network. Its number would be 13.
- **Numbers**: 10 Theodiga, 11 Strongbow, 12 Stair, the Bowl's arcology 13 (*proposed*, by the same north-to-south count
  carried on east).

None of this is in the biome's stations: the biome stays on Dalab-Ledge (stations 1 to 4). The extension is data for the
network session and a later plan.

### 2.3 Above ground: the highway beside it, the elevated way, and the access road below (the owner, 2026-11-11)

The owner (2026-11-11): "where the network runs aboveground, we should have an ancient highway running alongside it. in
places of rough or boggy terrain, the whole network may be elevated like louisiana highways", and "make there be a
smaller access road along the underground portions".

- **At grade, the highway runs beside the line**: the Ancients' 30 m way (`ANCIENT-ROADS.md` §2) beside the four
  guideways, one corridor about 70 m wide (the guideways' 30 m, a 6 m median, the highway's 30 m with its verges), on one
  embankment or one cutting. The Line's surface stretches here: the 42 km from the south mouth to Ledge, the open
  approach on Dalab's plain, and every surface leg of section 2.2.
- **Over bog, lakes and broken ground, the whole corridor is elevated**: long low viaducts on close-set piers, as the
  Louisiana swamp highways run (the Atchafalaya Basin Bridge: 29 km of twin decks a few metres over the swamp): two
  decks side by side, the line's and the highway's, 8 to 15 m up on paired pier bents every 30 to 40 m, for tens of
  kilometres. On the Rift's floor and lake (section 2.2) this is the Line's commonest form; on Dalab-Ledge, the wet
  tableland's dips toward Ledge (surface under the floor by 200-300 m at km 410-420 of the line) are crossed this way.
  `KTRANSIT.highway`'s spans, piers and their ruin states draw both decks.
- **Underground, a smaller access road runs beside the tracks**: along the gallery's west wall, behind a barrier from
  T4: two lanes of 3.3 m for the Ancients' service vehicles (`kits/motor-vehicles`' utility and van), a footway and the
  cable trough at the wall. In the split bores it takes **its own small service bore between the two**, 7 m inside, joined
  to both by the cross-passages (the Channel Tunnel's service tunnel); in the shallow south it is the cut-and-cover's west
  bay. At the mouths it joins the highway. Today it is the Tungangs' footway and barrow road, the porters' way, and a row
  of derelict Ancient service vehicles where the Line fell; the Fixers' trolley needs the guideway, the access road needs
  nothing. It has a track's states (kept, worn, blocked, cut), and at a gap it is cut with the rest.

## 3. The section and its states per track

**The gallery** (*proposed*; the access road added by the owner, 2026-11-11): the underground twin of the Ancients' way.

```
  SECTION of the four-track gallery (looking north; metres)
                            ____________________________________
                     ______/        lamp rows at 10 m           \______                   crown 14.0
                ____/                                                  \____
             __/                     (vault: flattened ellipse)             \__
            /                                                                  \           springing 6.0
           |                   .------.    .------.        .------.    .------.  |   |
           | f|  access road  || car  |    | car  |  [CS]  | car  |    | car  |  |[w]|    car roof 5.0
           |  |  (2 x 3.3 m)  ||      |    |      |        |      |    |      |  |   |
           |__|_______________||______|____|______|________|______|____|______|__|___|    guideway top 0.6
           ===================B=[ T4 ]=======[ T3 ]==============[ T2 ]=======[ T1 ]====    invert 0.0
          -21 -19.8          -13.2 -10.5   -4.5   -2.5   0   2.5   4.5        10.5  13.6 16
           f footway 1.2 m and trough   B barrier   [CS] the central strip, 5 m   [w] walkway 2.4 m and trough
```

| Part | Size | What |
|---|---|---|
| Gallery | **37 m** between the lining's faces (x -21 to +16), 14 m to the crown, walls plumb to 6 m, a flattened elliptical vault | one span: no columns (columns would block crossovers) |
| Access road | 6.6 m, two lanes, along the west wall at the invert (+0.2 m), behind a 0.45 m barrier from T4 (x -13.2 to -12.75: a 0.6 m one would stand inside T4's clearance, found building the `bore` station); a 1.2 m footway and the cable trough at the wall; lay-bys at the refuge niches | the Ancients' service road; the Tungangs' footway and barrow road (section 2.3) |
| Lining | precast segments 0.6 m thick, rings 2.0 m long, the joints a fine grid; a bronze ring band every 3.6 m (the Ancients' storey, as the tram's hoops) | the ring joints make the length readable (`ANCIENT-TUNNELS.md` §2) |
| Guideways | four, at -10.5, -4.5, +4.5, +10.5 m; each a raised concrete beam 2.8 m wide, 0.6 m high, with a central guide slot and the power strip in it; no rails, no catenary | the Ancients' guideway (the tram's "guide skids", `kits/motor-vehicles`) |
| Pairs | T1, T2 one way, T3, T4 the other; 6 m centres in a pair | |
| Central strip | 5 m between the pairs: signal masts, the crossover pits, the Ancients' lamp standards, the Tungangs' lamp posts | at a station it widens into the island platform |
| Walkway | 2.4 m on the east wall, 1.2 m above the invert, a cable trough under, a handrail, refuge niches every 50 m | the Fixers' way beside the tracks |
| Cross-section services | a drain under the central strip, air ducts in the crown, the dead cyan strips along the walkway's and the road's edges | |
| Clearance | a car 3.6 m wide and 4.4 m over the guideway (section 7), 0.5 m all round | |

**Split bores** (*proposed*): in bad ground (the breccia's faults, the rift fill's wettest stretches) the gallery parts
into **two twin-track bores**, 14 m inside, circular, 40 m apart, with the access road's **7 m service bore** between them,
all three joined by cross-passages every 250 m (a refuge and a walk between), and rejoins in a **junction hall**: a 300 m flared cavern where the bores' tracks meet again, the
crossovers in it. `ANCIENT-TUNNELS.md`'s 10-14 m bores are these. In the shallow south the gallery is the same section
cut and covered: a flat roof of beams under 30-60 m of fill, shafts every 400 m.

**Crossovers.** A crossover moves a train from one track to its neighbour: two guideway switches (a **flexing beam**: a
60 m length of guideway that bends sideways on rollers, as a monorail's switch does, the Ancients' kind) and the short
beam between. The Ancients put a crossover between each adjacent pair every ~5 km and in every station's throat; the
Fixers keep them as their most valued work after the doors (the tungang plan). A dead switch is a frozen beam, a kept one
greased and hand-cranked.

**Stations** (the Ancients' form): the gallery widens to 46 m for 300 m (a 12-car train's length and its throats); an
island platform 10 m wide between T2 and T3, side platforms at the walls for T1 and T4, footbridges over the outer
tracks, a mezzanine of rooms in the vault's haunches (offices, the signal room, plant), cisterns and workshops behind
the side walls in their own galleries, the sidings and the sheds in a parallel side gallery off the throats. Form in the
Ancients' house style (`LORE.md` §4: Cyclopean, Modernist, Organic): board-formed concrete at the root, white seamed panel,
bronze bands where the structure transfers, the cyan strips; the vault ribbed in great organic arches (Soleri, Gaudi), not
a Soviet metro's. **The Soviet metro is the Tungangs' layer over it** (mosaics, enamel, banners: the kit's, later).

**States.** Two layers: the gallery's section, and each track.

| Layer | States | Drawn as |
|---|---|---|
| Section (per 20 m) | `intact`, `cracked` (hairline joints, a little seepage), `spalled` (lining shed in plates: the rockburst stretches), `fallen` (the lining down, the rock in a slope across part or all of the width), `flooded` (water over the invert: a depth), `silted` | the lining and the rock behind it; a `fallen` section's slope of blocks as `KCAVERN` rock and drawn rubble |
| Track (per run of s) | `built` (the Ancients' finish: only behind the hot doors), `kept` (the Tungangs': patched beam, greased switch, lamps), `worn` (passable slowly: dust, a cracked beam), `blocked` (a derelict car, rubble over it: walkable, not runnable), `cut` (the beam sheared or buried: a train stops), `flooded` (water over the beam: `depth`; a train runs through 0.3 m, not 0.6) | the beam, its slot, its dress (the Tungangs' lamp posts and number plates on `kept`) |

A gap is a stretch of s where every track is `cut` (or `flooded` over 0.6 m). Segments are derived, never written: the
record holds what is broken, and the segments, their stations and their walks follow.

## 4. The tunnel record (`KTRANSIT.line`, `[G data]`)

`ANCIENT-TUNNELS.md` section 5's record, made concrete as the `line` kind (the owner, 2026-11-10). It is written to fit
beside `KTRANSIT.subway` and `KTRANSIT.rail` (`kits/ancient-transit/API.md`) and drawn by one code once that kit is
merged (section 12). Plain data, stable ids, no three.js.

```
KTRANSIT.line(o) -> LN
  o: { id: 'rift', seed, pts: [[x, y, z]...] (the bore floor's centreline: straight runs, filleted bends, the spirals),
       ground (the host's surface, for the portals and the shafts), forms: [{s0, s1, kind}], tracks: [{id, off}],
       cond: [{s0, s1, track | '*', state, depth?}], lining: [{s0, s1, state}], crossovers: [{s, a, b, dir}],
       stations: [{id, num, s, kind, state}], doors: [{id, s, kind}], adits, shafts, crossings: [{s, kind, ref}],
       branches: [{id, s, side, to}], hot: {s0, s1} }

LN { id, kind: 'line', seed, path, L, floorAt(s), guideAt(s, track), axisAt(s),
     forms:    [{ s0, s1, kind: 'gallery' | 'twin' | 'junction' | 'shallow' | 'open' | 'elevated', w, h, sep?, highway? }],
     tracks:   [{ id: 'rift.t1', i, off, route: {pts, cum, len} }],           the riding hook's route per track (section 8)
     road:     { off: -16.5, w: 6.6, lanes: 2, cond: [{ s0, s1, state }], route: {pts, cum, len} },   the access road (2.3)
     highway:  [{ s0, s1, side, off, ref }],                                   the Ancient highway beside the open and elevated forms (2.3)
     sections: [{ id: 'rift.x10423', i, s0, s1, state, depth, silt }],        20 m, the section layer
     cond:     [{ id, track, s0, s1, state, depth }],                          runs per track
     crossovers: [{ id, s, a: 't2', b: 't3', len, dir, state: built | kept | frozen | gone }],
     stations: [{ id: 'rift.st8', num, s, s0, s1, kind: station | ghost | door | gap | portal, state: built | kept | abandoned | sealed,
                  platforms: [{ id, side, track, from, to, y }], sidings: [...], sheds: [...], rooms: [{ id, kind, box }], loj? }],
     doors:    [{ id, s, kind: 'hot', leaves: [{ track | 'walk', w, h, state }], plant }],
     shafts:   [{ id, s, side, top: [x, y, z], depth, r, kind: air | adit | winch, state, hidden,
                  road: { id, d, reach } }],                                                                 section 2.1
     adits:    [{ id, s, side, to: [x, y, z], state }],
     veins:    [{ id, s, side, family, grade, node, working: { state: kept | worked-out | abandoned, len } }],  derived (KRES)
     plant:    [{ id, s, door, kind: 'geothermal', state, cells }],                                          at the hot doors
     crossings: [{ id, s, kind: hypogene | maze | breccia | cleft | karst, ref }],
     branches:  [{ id, s, side, to, kind: 'gallery' }],
     gaps:      [{ id, s0, s1, kind: fall | flood | shear, walk: { id, pts, len, minutes, hazards } }],     derived
     segments:  [{ id, s0, s1, ends: [stationId, stationId], tracks: [ids], trains: [ids], sheds }],     derived
     hot:       { s0, s1, doors: [ids] } }
```

- **One record for the whole Line** (304 km bored, 346 to Ledge): about 15,000 sections and a few hundred runs, tens of
  kilobytes. A page builds a **window** of it (a station's 1-2 km) by s; the record is the same on every page and in
  Godot.
- **The gap walks are routes**, not geometry: each gap names its walk (`pts`, length, minutes, hazards), which the
  station that draws the gap carves and floors, and which the riding session's journeys walk (`PLAN-RIDING.md` §4.2:
  "walk the gap: an ordinary walk leg").
- **It is derived from the model**: the alignment from `survey_line.py`, the rock per km from the geology bake (where the
  forms split into bores), the cover profile for the hot section and the shafts. The breaks are authored *proposals* on
  that profile (section 2), the owner's to move.
- `ANCIENT-TUNNELS.md` §5's `bore: {r, lining, twin}` becomes `forms`; its `cond: per segment` becomes `cond` per track
  and `sections` per 20 m; `stations`, `crossPassages`, `adits`, `shafts`, `crossings` keep their names.

## 5. The stations (the biome's pages)

`biomes/line`, a station set like the Throne's and the Hearths' (`python3 build.py --station <name>`), started from
`biomes/hearths` (the newest cave stations: `KCAVERN` draw and floor in core, the host shape, the checks). Each station
builds a window of the one record (section 4) at its chainage, carves it on `KCAVERN` and draws it. Each settles one look
question.

| # | Station | Bore km (px) | What | Settles |
|---|---|---|---|---|
| 1 | `bore` | 208-209.2 (445.5,1262) | a kept straight kilometre of the long run, south of the south door: the four-track gallery, its lining, guideways, central strip, walkway and the access road (a derelict Ancient service van on it); a crossover; the Tungangs' green lamps running to a point; a train passing (on its timetable) and a Fixers' trolley; refuge niches; warm (rock 55 degC); **a vein working**: a Fixers' side gallery off a refuge niche following a copper and rare-earth vein (section 2.1), its spoil on a flat wagon | **the section, the scale, the light**; the long view down the bore |
| 2 | `gap` | 235-240 (443.5,1277) | G2: the long run's southern end: its gap station (the last platform, the trains' turning crossover, the shed), the gallery fallen whole into a hypogene chamber; the walk down the slope into the chamber, green lamps on posts across it, a sump waded, a Fixers' stair up the far fall, and S1's platform with its own train | **the walk between segments**, the game's commonest underground journey (built 2026-11-11: the fall 0.54 km on the page; section 14) |
| 3 | `station` | 218 (445,1266) | the Twenny junction: an Ancient station cavern in three states (`?state=built`, `kept`, `abandoned`): platforms, the mezzanine, sidings and sheds, workshops, cistern, ventilation, the branch gallery's mouth toward Loj Twenny; **the great shaft's foot** (2.2 km up to the fells: the hoist, the draught, the ice coming down); **empty of the Tungang kit's rooms** (kept shows only catalog pieces already built: benches, lamps, signs) | the Ancient station's architecture; the hold view's test bed (T3) (built 2026-11-11: section 14) |
| 4 | `hotdoor` | 55 (455,1186) | the hot section's north doors: two door walls a train's length apart (an airlock), each a bulkhead across the gallery with four train leaves and a walkway hatch; **the power plant and the cooling plant** kept by rite (the heat exchangers' pipes through the inner door, the generators' rare-earth magnets, power cells on charge: section 2); a sealed train waiting; through the inner door the deep stretch, spalls on the lining, the heat haze, the cyan strips still lit; a granite cleft shrine behind a rail (`ANCIENT-TUNNELS.md` cave 7) | **heat and machinery**; the one place the Ancients' light still burns (built 2026-11-11: section 14) |
| 5 | `breach` | 225 (444.5,1270) | the bore cuts a hypogene chamber in the rift fill (`KKARST` `hypogene`, as the Hearths): a bulkhead in the lining, a window, a stair down into the natural cave | **the join of built and natural** (built 2026-11-11: section 14) |
| 6 | `fault` | 40-48 (455.5,1180) | the gallery split into two twin bores through the impact breccia; a slump fault shears one bore (its two tracks cut, the beams offset 3 m), the trains crossing over in the junction hall to the other; a low point flooded over two tracks; CO2 pooled | **the ruin states by track** (built 2026-11-11: section 14) |
| 7 | `portal` | 280-304 (440.5,1305) | the shallow south: the cut-and-cover gallery under 30-60 m of fill, light shafts, one stretch fallen in to an open cutting with the sky over it, and the portal onto the tableland, the guideway running on toward Ledge; **a shaft head** on the tableland (a stand-in for the kit's winch house, ice store and hooded lamp) | **daylight to the dark**: the exposure ramp (built 2026-11-11: section 14) |

**The order** (*proposed*): `bore` first (the section must be right before anything else), then `station`, `gap`,
`hotdoor`, `fault`, `breach`, `portal`.

**How a station is drawn.**
- **The rock is `KCAVERN`**: the gallery as a `tube` (its arched section: `w` 38.2, `h` 14.6), the bores as `pipe`s, the
  station cavern and its side galleries as `room`s and `tube`s, the stairs, shafts and openings as theirs; the walk
  floors written from the plan. One cell size a page (1 m in the gallery, where the lining hides the rock; 0.5 m where
  rock shows: the gap, the breach).
- **The lining is drawn**, not carved: a swept mesh of the section profile 0.6 m inside the void, by ring, with its joints,
  bands and bolt pockets; a `fallen` section draws no lining and the carved rock shows, with the rubble slope (`KCAVERN`
  `monolith`s for the big blocks the walk steps round, drawn rubble for the rest). This is `KTRANSIT.draw.subway`'s
  approach, scaled up.
- **The guideways, platforms, doors and fittings are drawn records** (the `line` kind's draw); the Tungangs' lamps and
  signs are catalog pieces placed from the record (`kits/catalog` Tungang file).
- **The natural caves** (the gap's chamber, the breach) are `KKARST` (`hypogene`) cropped to a window, as `biomes/hearths`
  crops its cave; the cleft's crystals are `KSPELEO` druse (a smoky-quartz preset is owed: `ANCIENT-TUNNELS.md` cave 7).
- **Budgets**, as the cave stations hold: under 2 M triangles and 450 draws a view; the gallery chunked by 400 m so the
  far stretches cull; the lining instanced by ring kind where it repeats.

## 6. Light, air, heat and hazards

**Light** (Dhelv's lesson, the tungang plan §0.1: coloured light as the main light turns every surface to mud).
- The Ancients' cyan strips are **dead**, except in the hot section, where the Line's power still reaches them
  (section 2): there they burn, the only living Ancient light on the Line.
- The Tungangs' **lamp code** on the ways: green lamps on the walkway posts every 50 m of a kept track (green: the Line),
  amber at work (the sheds, the cooling plant), white hooded at the doors and the gaps (danger, stop). The code is the
  tungang plan's question 6, still open: this biome uses it as proposed and swaps colours if the owner changes them.
- A **warm-white key** where people are (the station's wax light, the train's saloon), so the white panel, bronze and rust
  read true; the colours mark, they do not light.
- **The view runs to a point**: the lamps down a straight kilometre are the bore's landmark (`ANCIENT-TUNNELS.md` §2).
- Exposure: dark-adapted underground, clamped (`core/atmos`'s exposure, as Dhelv's cave light); the portal station ramps
  it over 300 m.
- The lamps are records; the 14 nearest the eye are real lights (Dhelv's pool).

**Air.** The Ancients ventilated by shafts and ducts in the crown. Outside the hot section the draught runs from portal and
adits toward the shafts; the stations' fans still turn in it. The air is still, cool, faintly damp, with dust in the lamp
beams; the gaps' caves are wetter and smell of the chambers' sulphur (the Hearths' rift fill).

**Heat.** Outside the doors the rock's warmth: 5 degC at the shallow south, 30 to 60 degC in the rift fill near the hot
section (the lining insulates; the air near the south door is a sauna). Inside, the virgin rock is 60 to 130 degC, held
off by the lining and the cooling plant; where the plant failed or the lining spalled, the air is the rock's. `KTHERM`
gives the field per chainage; `core/hazard` `heat` with `soak` past the doors.

**Hazards** (`ANCIENT-TUNNELS.md` §4).

| Hazard | Where | Module |
|---|---|---|
| heat, with soak | the hot section past the doors | `core/hazard` `heat` (exists) |
| gas (CO2, H2S) pooled | the breccia's faults (`fault`), the hypogene chambers (`gap`, `breach`) | `gas` with `shape.pool` (exists) |
| drown | the sumps (`gap`), the flooded tracks (`fault`), G3 | `drown` (exists) |
| crush | the fallen sections | `crush` (exists) |
| fall | the shafts, the gap's slope | `fall` (exists) |
| **rockburst** | the deep stretch (km 101-152), seen from `hotdoor` | owed: a cycle on a `crush` record |
| **inrush** | G3, the rift fill's karst | owed: a `drown` that starts on a cycle |
| **seal** | a hot door, a ghost station's shaft to the near-airless crest | owed: a door whose failure makes a section airless |

The three owed kinds are opt-in additions to `core/hazard`, each agreed before code (question 13).

## 7. The train

**One train, built for the Line** (*proposed* in shape; the owner settled that it lives in `kits/motor-vehicles`): the
**Ancient Line train**, sealed and cooled for the hot section, in the vehicles kit's `ancient` culture beside `anc_tram`,
whose language it stretches (white seamed panel on a superellipse tub, bronze hoops every 3.6 m, a window ribbon with
bronze mullions, cyan strips at the sill and roof, the guide skids under the floor, eight hub motors on the guideway's
power).

| Key (*proposed*) | Car | Length x width x height | Inside | Count in a train |
|---|---|---|---|---|
| `anc_line_power` | the power car: a sealed cab, the cooling plant, the pressure plant | 22 x 3.6 x 4.4 m | a cab for two, plant | one at each end |
| `anc_line_saloon` | the saloon | 24 x 3.6 x 4.4 m | 64 seats (2 + 2, 16 rows), standing for 40, a vestibule at each end with a door each side | 2 to 5 |
| `anc_line_crew` | the crew and service car | 24 x 3.6 x 4.4 m | berths for the crew, a galley, the guard's cab, the brake | 1 |
| `anc_line_van` | the freight van | 24 x 3.6 x 4.4 m | six bays, double doors each side, no windows | 1 to 3 |
| `anc_line_tank` | the tank car: water for the cooling, piped through the train | 22 x 3.6 x 4.2 m | a tank, a gangway over | 0 to 1 |

- **Sealed**: pressure-tight bodies, doors that seal, a pressure plant in the power cars (past a failed seal the hot
  section's air is thin as well as hot: the crest above is near-airless). Each car's floor 1.2 m above the guideway top
  (the platform's height); the bogies two a car, four wheels a bogie on the guideway, the guide skids in the slot.
- **A train**: two power cars and six to ten between (190 to 290 m). The long run's three trains are 8, 10 and 12 cars.
- **States**, the same car at four ages (accepted by the owner, 2026-11-11; the shape agreed with the vehicles session the same day):

| State | What | How in the vehicles kit |
|---|---|---|
| `built` | as the Ancients ran it: white panel, blue glass, cyan strips lit | the kit's `intact` |
| `kept` | a thousand years of Tungang upkeep: plate riveted over the white skin, the windows plated to slits, the lamp code on the nose (green running, red tail, the white lamp hooded), enamel number plates, a loj's livery bands, a bell on the cab, the timetable chalked inside, the door seals waxed | **not a ruin state**: as built (2026-11-11), **variant 1** of each Line car, "Kept (Tungang)", drawn by `lineKept()` in `krator-vehicles-line.js` over the built car, so the shared runtime (which reaches Locus and Mungo) is untouched; a kept car still takes the ruin states. The general build option (`kept: 'tungang'` in `API.build`, as agreed with the vehicles session) is a known issue for when one culture's upkeep must dress another's vehicle generally |
| `derelict` | drawn into a siding and left: glass gone, panels sprung, dust; the kit's carriage houses later | the kit's `weathered` |
| `wreck` | a train caught in a collapse: a car crushed under the fall, one rolled across two tracks | the kit's `wreck` forms |

The vehicles kit also has `burnt` (`intact | weathered | burnt | wreck`, `vehicleRuin(state, seed, key, airframe)` in `vehicles-core.js`),
usable for a train caught in a fire. The Line cars declare `budget.tris` (a 24 m sealed car is over the 6,000 default; the
ceiling is 20,000) and their wheels `steer: false` with `maxSteer: 0`, as `anc_tram` does, so they pass the kit's checks.

- **The Tungangs' own stock**, from salvage (*proposed*, a `tungang` culture file in the vehicles kit): `tg_trolley` (the
  Fixers' hand-pumped car on the guideway: a deck on a bogie, the lever, a lamp pole, a tool chest); `tg_flat` (a flat
  wagon on a salvaged bogie, for rubble and loads); `tg_icewagon` (an insulated box of fungus felt and plate, for the
  Ice-cutters' ice to the hot holds). They run on the same guideway.
- **It runs**: a train is a record of its segment, its cars and its timetable (`core/sched` `KSCHED.timeline`), shuttling
  between its segment's end stations; its head at s(t), each car posed by the formula of section 8. Deterministic, so the
  page, the simulation and Godot agree.
- **The page**: the `bore` station shows a kept train passing on its timetable (and a built one behind the hot doors at
  `hotdoor`); the vehicles kit's sheet gets the Line cars in all four states and the Tungang stock (its `verify.py`).

## 8. Riding: the Line's side of the riding plan's hook

`PLAN-RIDING.md` section 3 asks the Line for five things. This plan **accepts all five** (*proposed*, for the owner and
the riding session to confirm), with these Line-specific answers:

| The hook | The Line's answer |
|---|---|
| 1. **Track** routes `{pts, cum, len}` along the rail head, per track of a segment | `LN.tracks[i].route`, along the guideway's top (the floor + 0.6 m) on the track's offset, sampled every 4 m (every 1 m through a crossover), clipped to the segment by `LN.segments[k].s0, s1`. A crossover is its own short route between the two tracks' routes, so a timetable may run a train across it |
| 2. **Timetable** as a `KSCHED.timeline` export, dwells named `stop:<stopId>:<side>` | yes. The Line's timetables are authored per segment (the Tungangs' rite: section 2's timing), one timeline a train, `period` one turn or two; a dwell's side +1, -1 or 0 from the platform's side of the track. **s(t) is the position of the train's fixed A end** (the end facing +s): Line trains shuttle and never turn, so the cars always trail the A end toward -s and no sign flips with the direction of travel. v1 timetables keep a train on one route; an optional `route` id on a timeline segment is asked for only if a run must cross over |
| 3. **Car pose** `carPose(train, k, t)` by the fixed formula (car middle at s(t) - off_k, bogies at +- b_k, yaw and pitch from rear bogie to front) | yes, as written, with s(t) the A end (row 2) and `off_k` measured from it. The Line's pitch is at most 0.04 (the spirals' grade), its roll 0 (no cant on a guideway): inside the riding plan's 0.1 rad bound. `b_k` 8.5 m on a 24 m car, 7.5 m on a 22 m car; 1.0 m between cars |
| 4. **Interior and capacity** on the car's record: `cap {seats, stand, slots}`, `interior {floors, blocks, doors, seats, stand, slots}` in the car's frame | yes, on each Line car in the vehicles kit: the saloon's 64 seats and 40 standing, the van's six bays (`slots` of kind `bay`), the tank car's water (`kind: water`), the trolley's deck, the ice wagon's blocks. Written beside the car's build, from the same numbers the build draws (one source), checked by the riding plan's reach audit |
| 5. **Stops** `{id, track, s, side, floor, gap}` | `LN.stations[i].platforms` give them: one stop per platform face per track, `floor` the platform's `KWALK` floor id, `gap` the platform-to-car gap **per stop** (0.1 m: the Ancients' close-fitting platform edge; a kept station's edge worn to 0.15) |

Agreed with the riding session on 2026-11-11, and **built on its side** (the owner approved riding; commit e7acf88e4 on
`claude/clever-rhodes-cb3fec`, unpushed): `SIM.rideSource({id, track, timeline, cars, stops})` takes this shape as written
(`stop:<stopId>` without a side is also accepted, taking the stop's side); **a gap's walk goes in through
`SIM.rideFootpath({from, to, pts})`** with `LN.gaps[i].walk.pts`, walked both ways as an ordinary leg; goods ride as
`SIM.trade({line: <source id>})`, and a gap's porters are a timed `SIM.trade` route plus `SIM.porters`; a car's walk side
is its floors and walls in its frame, a door's block tagged `door:<id>`; in Godot, `KRide` (`kride.gd`) and
`godot/krator/ride_cars.gd` build the cars as `AnimatableBody3D` from the same records. Until the `line` kind and the
cars exist, riding's lab runs on stand-ins of this shape. A run that must cross over waits on the optional `route` id on a
timeline segment (to be asked for when needed).

**What the Line does not do**: frame floors, the ride leg, journeys, capacity counting, cargo and porters, the player's
carry and the Godot twins are the riding plan's. The Line's records are the source riding reads; until the `line` kind
exists, the riding test page uses stand-ins of the same shape (`PLAN-RIDING.md` §1), and this biome swaps them for the
real thing at phase L5.

**Where riding shows on these pages** (phase L5, after the riding plan's R-phases it needs): the `bore` station's passing
train carries riders seen through its windows; the `gap` station's porters carry consignments across G2 and load S1's
train; the player boards at the `station` station, rides, and alights. **The hot section's ride is the set piece** (the
doors sealed, the windows plated, the heat on the hazard readout): a ride through the `hotdoor` station's airlock.

## 9. Camera

The stations use `core/host`'s cameras as they are (orbit, walk): the gallery is 32 x 13 m, roomy enough for the orbit
camera inside it, and the lining is a drawn shell, so the camera meets nothing it can pass into but the rock beyond. The
tungang plan's camera work (its section 6: the follow camera on `KCAVERN.sdf`, caps, the deck cut, the line map) is its
phase T3, agreed piece by piece; these stations are its first test bed (`station` for the hold view, `bore` for the
follow camera's long view, `gap` for a narrow walk), but nothing here waits on it.

## 10. Core adoption (written before the first fragment)

| Module | Taken | For |
|---|---|---|
| `core/terrain` | `39-core-cavern` (`KCAVERN`), `39b-core-speleo` (`KSPELEO`), `39c-core-karst` (`KKARST`), `39d-core-cavern-floor`, `host/39e-core-cavern-draw`, `47-core-therm` (`KTHERM`), `43-core-ground` (`KGROUND`) | the gallery, bores, stations and side galleries carved; the gap's and breach's chambers; the cleft's crystals; the heat field; the rock's layers where it shows |
| `core/rand` (`KRAND`) | yes | every seed by (world, chainage cell, index, salt): the lining's wear, the rubble, the lamps' failures |
| `core/tags` | yes | every section, track run, station, door, crossover, train, car and lamp registered before it is drawn |
| `core/space` (`KSPACE`) | yes | the rubble and pieces kept off the tracks, the walk, the platforms |
| `core/walk` (`KWALK`) | yes | floors from the plan: the walkway, the access road, platforms, the gap's walk, the stairs; blocks for the cars at rest |
| `core/hazard` | yes | heat with soak, gas, drown, crush, fall; the owed rockburst, inrush and seal (question 13) |
| `core/door` (`KDOOR`) | yes | the hot doors' leaves and hatches; the car doors (the riding plan drives them) |
| `core/sched` | yes | the trains' timetables (`KSCHED.timeline`) |
| `core/atmos` | yes | no sky underground; the portal's daylight; the dust in the beams; the clamped exposure |
| `core/water` | yes | the sumps and the flooded tracks (`WATER.open`, still) |
| `core/biome` | yes (`BIO.init`, the export) | the host binding; the gaps' chambers take the Hearths' cave flora (coal moss, dead stalks) read in place from `biomes/hearths`, and the portal's tableland the rim's from `biomes/riftrim` |
| `core/host` | `FULL` | the page shell, views, inspector, polygon tool, probe |
| `core/materials` | `record` (`KMAT`), `biomes/line/materials.json` packed by `tools/textures/pack.py` | the library sets and the owed ones |
| `core/catalog` | the runtime, read for the Tungang culture file's pieces | the kept stations' benches, lamps and signs (the 23 pieces already built) |
| `core/shadow` | off by default (`?shadow=1`) | the portal's light through the shafts |
| `core/lod`, `core/export` | yes | the gallery's far chunks; the krator-world container and the Godot export |
| `kits/ancient-transit` (`KTRANSIT`) | **yes, the `line` kind** (settled) | the record and its drawing (section 12: built on the transit kit's branch or after its merge, agreed with its session) |
| `kits/motor-vehicles` | **yes** (settled) | the Line cars in the `ancient` culture, the Tungang stock (section 7) |
| `kits/resources` (`KRES`) | the node field, read in place | the veins the bore crosses (section 2.1): the same nodes the open world places |
| `core/simulation` + `core/simulation/ride`, `core/walk/frame` | at phase L5, opt-in | riders and cargo (the riding plan's) |
| `core/minimap` | later (the tungang plan's T3) | the line map |

**Not taken**: `core/mask` (no canvas placement), `core/city`, `core/hamlet`, `core/camp`, `core/furnish` (no settlement:
the holds come with T2 and the kit), `core/engine` (no building kit here), the sky dome and weather (underground; the
portal's sky is `core/atmos`'s), `38-core-relief`, `KSTRATA`, `KFAR`, `KHORIZON` (the portal's tableland is a small window).
`python3 tools/check_core_use.py biomes/line` runs before any station is called done.

## 11. Core and shared changes, each agreed before code

| Change | Where | Why | Who agrees |
|---|---|---|---|
| The `line` kind (records and draw) | `kits/ancient-transit` | settled by the owner; the code is that kit's | the ancient-transit session (its branch is not merged) |
| The Line cars and the `kept` state (a culture's upkeep dress over another culture's vehicle) | `kits/motor-vehicles` | settled by the owner; the state is new | the ancient-vehicles session (its branch is not merged) |
| A `tungang` vehicles culture (trolley, flat, ice wagon) | `kits/motor-vehicles` | the Tungangs' own stock | the same |
| `rockburst`, `inrush`, `seal` | `core/hazard` | owed by `ANCIENT-TUNNELS.md` §4 | the owner; opt-in kinds, so a page that lists none is unchanged |
| A smoky-quartz `KSPELEO` preset | `core/terrain/39b-core-speleo.js` | the cleft shrine | a new preset only; existing presets unchanged |
| A swept-lining helper, if `KTRANSIT.draw.subway`'s is not general enough | `kits/ancient-transit` | the gallery's and the bores' lining | the ancient-transit session |

Nothing here edits `core/walk` or `core/simulation`: riding's extensions are the riding session's. Every page that does
not opt in stays byte-identical: `python3 tools/port_baseline.py` reads `same` for every other page after each change.

## 12. Coordination (who owns what)

- **`kits/ancient-transit`** (branch `claude/ancient-transit-2600a6`, not merged) and **`kits/motor-vehicles`' Ancients**
  (branch `claude/ancient-vehicles-935f93`, not merged). This plan writes into both. *Proposed*: once the owner approves,
  ask each session whether its branch merges first (the clean way: the Line builds on `main`) or the Line's work goes on
  a branch from theirs. Nothing is changed in either until that is agreed.
- **`kits/motor-vehicles`' Ancients are on main** (origin/main 2009202c8, 2026-11-11, merged into this branch): build the
  Line cars on main. The vehicles session's three cautions: (1) `vehicles-core.js` is read in place by `kits/mechs`, and the
  Catch stations `fan`, `lake` and `oasis` carry the mechs bundle, so an edit there means rebuilding those (`python3
  tools/reach.py kits/motor-vehicles/vehicles-core.js`); a new culture file or a runtime edit reaches only the kit, Locus
  and Mungo, so the Line adds files rather than editing the core; (2) `kept` is read in `API.build` beside `state` and handed
  to the keeping culture's function, kept out of `VEHICLE_STATES`, with its own assertion in the kit's `verify.py`; (3) stage
  files by name (`git add kits/motor-vehicles` picks up the local `three.min.js` the verify needs). The shaders' uniform
  tables are 32 long and `materials.json` has 26 slots: room for six more families. Read `kits/motor-vehicles/API.md`
  ("Ruin states", "The Ancients' ten", "Adding a vehicle") first.
- **The riding session** (`core/simulation/PLAN-RIDING.md`, branch `claude/clever-rhodes-cb3fec`): section 8 is the
  contract; a hand-over note is in the shared notes folder.
- **The tungang plan** (`kits/tungang/PLAN.md`, branch `claude/tungang-fellgang-kits-a56ece`): this plan does not edit it.
  The lamp code, the shine, the Big Meeting are its questions; this plan uses its proposals and follows its answers.
- **`biomes/riftrim`** owns Ledge's site and Dalab's road crossing (its portal at 477,1245 is the road's, not the Line's);
  **`biomes/hearths`** the Hearth hold. Their plans are not edited; the `portal` station's surface stretch toward Ledge
  stops at riftrim's `ledge` station's window.
- **`core/city`'s cavern setting** (the tungang plan's T2) takes the `station` and `gap` stations' records as its first
  Tungang cases; nothing here waits on it.

## 13. Textures

**Reuse** (in the library): `concrete.ancient`, `concrete.ancient.b`, `concrete.board`, `concrete.rust.streaked`,
`concrete.cracked_concrete_wall` (the guideways, the platforms, the station's board-formed root); `metal.ancient.white`,
`metal.ancient` (the cars' panel, the station's white panel), `metal.bronze`, `metal.bronze.cast`, `metal.bronze.verdigris`
(the ring bands, hoops and mullions), `metal.rust.plate`, `metal.rust.heavy`, `metal.painted.chipped`,
`metal.enamel.scoured`, `metal.metal_grate_rusty` (the kept state, the walkways' grating); `glass.frosted`;
`rock.gneiss.banded`, `rock.granite.tor`, `rock.megabreccia`, `rock.limestone.ironstained`, `ground.gypsum.crust`
(the rock where the lining has fallen, by province); `ground.rubble.demolition` (the falls), `ground.brown_mud_02`
(silt), `rock.quartz.vein` (the cleft); `rubber.tyre` (the bogies' tyres); `wax.tallow` (the door seals); patterns
`port/hazard` (the gaps' and doors' stripes), `ancients/glyph-band`.

**Owed** (to go into `core/materials/PROMPTS-NEEDED.md` as paste-ready prompts **only after the owner agrees**,
question 14):

| Id | What | Why no library set does it |
|---|---|---|
| `concrete.lining.segment` | a precast tunnel lining segment's face: bolt pockets in a grid, gasket grooves at the joints, a painted ring number, water and calcite stains below the joints, soot along the crown | the gallery and every bore are made of it; `concrete.ancient` has no segment features (also owed by the tungang plan §7 and `ANCIENT-TUNNELS.md` §5) |
| `concrete.guideway` | the guideway beam's running surface: smooth trowelled concrete worn in two polished bands, the guide slot's steel lips, oil and rust streaks, chips at the edges | the Line's signature surface; road and slab sets read as pavement |
| `metal.plate.riveted.painted` | salvaged plate riveted over white panel: rows of rivets, overlapping sheets, faded railway paint (green, cream, red oxide) over rust | the kept cars' and the kept stations' dress; `metal.rust.plate` has no rivets and no paint |

## 14. Phases and checks

| Phase | What | Done when |
|---|---|---|
| L0 | the owner's answers (section 15); the concept page reviewed; the transit and vehicles sessions asked (section 12) | the questions are answered |
| L1 | **the record**: `KTRANSIT.line` data side (alignment from the survey, forms, tracks, sections, cond, crossovers, stations, doors, gaps and segments derived), node-tested; the riding hook's five outputs | `tests/test-line.js` passes; the record's digest is stable |
| L2 | **the `bore` station**: the scaffold (`build.py`, `verify.py`, `materials.json`, `INDEX.md`, `PORT.md`), the gallery carved and lined, the guideways, walkway and access road, a crossover, the lamps; the train cars' first build (a kept 8-car train, standing) | the owner's walk down the bore; `--assert` passes on the GPU lane |
| L3 | the train in the vehicles kit: the five Line cars in four states, the Tungang stock; running on a timetable in `bore` | the vehicles sheet passes; the train passes on its timetable in `bore` |
| L4 | `station`, `gap`, `hotdoor`, `fault`, `breach`, `portal` | each passes `--assert`; the owner's walk from `station` across `gap` |
| L5 | riding on the pages (after the riding plan's phases it needs): riders in the passing train, porters at G2, the player boarding at `station` | the riding plan's checks pass on these pages |
| L6 | the Godot export; the index tools; the gallery (a new biome goes in when it first reaches `main`) | the stations export and pass |

**Progress** (2026-11-11, on the owner's "start building"):
- **L3, the train (built first)**: `kits/motor-vehicles/krator-vehicles-line.js` (the five Line cars, each with a "Kept (Tungang)" variant
  and `data.ride` for riding) and `krator-vehicles-tungang.js` (the Fixers' trolley, a flat wagon, the ice wagon); the kit's
  `verify.py --assert` passes (135 builds, 405 ruin builds; its ruin box now allows a long vehicle's swing). `kept` is a variant, not a
  build option (the runtime, which reaches Locus and Mungo, is untouched): the kit's `KNOWN_ISSUES.md`.
- **L2, the `bore` station**: `stations/bore/` (the gallery carved on KCAVERN, the lining drawn in rings, the guideways, strip, walkway,
  road, crossover, the lamp code, the niches, the vein working, two kept trains passing on their timelines by the riding hook's car pose,
  the work train, a derelict van); `verify.py --assert` with the station's six checks and their negatives (`99-host-take.js`). The line
  record is the station's own `48-line-gallery.js` until `KTRANSIT.line` exists (`KNOWN_ISSUES.md`).
- **The shared base** (`stations/common/`): the line's core (`47-line-core.js`, `LK`: the section, the profile, routes by arc length, the
  consist, the riding hook's car pose, the cond runs derived to gaps and segments) and helpers (`47b-line-help.js`, `LW`), and the host
  fragments every station takes (stage, rock, lining, way, train, air, build, take). Each station's `station.json` names `"base":
  "common"` and adds its own window (`48-line-window.js`, the `LINE` contract) and works. `bore` moved onto it unchanged.
- **The `gap` station** (G2): the long run's last platform, its shed and porters' hold, the gallery broken off at both lips, the chamber
  (a `KCAVERN` hall, not yet `KKARST` hypogene), the Fixers' ramp and stair, the path's green lamps, the sump (core/water), S1's platform
  and train; its own checks (every track cut across the fall and a walk across it, the path's lamps, the sump waded, the white lamps at the
  lips, the platform edges) with negatives. **The fall on the page is 0.54 km** (bore m 236170-236712), its walk about 595 m and 17
  minutes; section 2's G2 of 3 km and 3-4 h is the whole damaged stretch, which this page compresses (`KNOWN_ISSUES.md`).
- **The `station` station** (the Twenny junction, `?state=built|kept|abandoned`): the cavern 52.5 m wide and 20 m to its vault between
  the galleries, the tracks splayed round the island platform, the side platforms (the west one the road's apron), every face 0.1 m off
  the car; the footbridges at 7.6 m and the mezzanine balconies, the stairs; the doors to the station's rooms (hewn stubs behind them),
  the branch's mouth toward Loj Twenny, the great shaft's cage under its mouth in the vault; by state the Ancients' light and a built
  train, the lamp code and a kept train with the Tungangs' hut and crates, or the dark with dust and a derelict train. Its checks (the
  platform faces, the footbridges over the car's envelope, the branch open) with negatives; every state passes in the browser.
- **The `hotdoor` station** (4, the north door, km 55): the airlock of two door walls 260 m apart (each a bulkhead of the section with four
  train leaves, a walkway hatch and a road gate), the plant's hall off the east wall (three generators on rare-earth magnet rings, the cooling
  banks and fans, the cells on charge, red cloth bound on the generators: the rite), its two heat exchanger pipes through both door walls into
  the hot rock, a sealed train waiting in the airlock and a kept train coming up to the outer door; past the inner door the Ancients' guideways
  and their cyan still burning (`LINE.cyanLit` may now be a function of z), spalls in the vault and the rockburst on them; the Tungangs'
  crossing over the four tracks; the cleft shrine behind its rail in the granite (its rock on the library's `rock.granite.tor`: the window
  names its KGROUND layer, `LINE.rockLayer`). Its checks: the airlock longer than a train, the seal (every opening has its leaf, never both
  walls open), the pipes through both walls, the cyan only past the inner door, the shrine open; each with its negative.
- **The `breach` station** (5, km 225): the kept gallery a few metres from a hypogene chamber: the bulkhead onto a hewn landing, a glazed window
  at the end of a short passage, a stair cut 21 m down to the chamber's floor, the Tungangs' green lamps down it and across; the chamber joined
  to a `KKARST` hypogene maze beyond (its gypsum crust round the water table by shader). Its checks: rock behind the lining but at its two
  openings, the window looking into the chamber, the maze joined; each with its negative.
- **The `fault` station** (6, km 44): the gallery divides in a junction hall into twin bores through the breccia (the tracks splayed 5 m apart,
  the trains crossing from the east pair to the west); the west bore kept with the road; the east bore left, sheared by a slump fault (both
  tracks cut, the beams and the bore offset 3 m east), flooded 0.9 m at a low point beyond under CO2, its walkway kept passable by a scramble over
  the rubble. A ring may now hold several sections (`LINE.sectionsAt`): the shared lining draws each, with the end wall from one gallery into
  two bores; the clearance and lining checks take each. Its checks: the shear, the trains on through the west, the flood over 0.6 m, the
  pillar between the bores, no gap; each with its negative.
- **The `portal` station** (7, km 304): the cut-and-cover gallery under 38 m of wet tableland, its four light wells; a stretch fallen in to an
  open cutting with the sky over the tracks; the portal's headwall at the escarpment's foot and its approach cutting, the line running on at
  grade toward Ledge; the Tungangs' shaft head over a well (stand-ins for the kit's winch house, ice store, hooded lamp). The only station
  under the sky: `"sky": true` in its `station.json` adds the shared sky's fragments (`ATMOS.skyBiome`) and `KFIELD`; the land is
  `LINE.groundAt` baked and meshed by the station. The eye's exposure follows `LINE.exposureAt` (dark-adapted under cover, the day's out of
  it, ramped over 300 m). Its checks: the ramp, the fallen stretch open with its tracks running, the wells open, the line at grade past the
  portal; each with its negative.
- **All seven stations are built** (2026-11-11), each passing `verify.py --assert` on the GPU.
- **The stations are windows of one record** (2026-11-11, after the transit session's review): `stations/common/47c-line-record.js` makes
  the Rift line as `KTRANSIT.line` (kits/ancient-transit/src/43c, read by `build.py` with 40, 41 and 43b) and cuts each station's window with
  `KTRANSIT.lineWindow`; the pages read their tracks' states, splays, crossovers and gaps from it and run their trains on the kind's
  `carPose` and `lineConsist`. Every page's tracks, crossovers and triangle counts came out as before (the cars' seeds now
  `KRAND.child`, so their wear differs); `tests/test-line-record.js`.
- **The bore hazards**: `core/hazard/22-core-hazard-bore.js` (`KHAZ.rockburst`, `inrush`, `seal`), opt-in, as presets on the kinds the
  vocabulary has (`crush`, `drown`, `gas`), so no other page changes; `test-hazard-bore.js`.

**Checks** (`verify.py --assert`; each with its negative control):
- `line-record`: the record's derived segments and gaps match the cond runs (negative: a track's `cut` run removed must
  merge two segments);
- `clearance`: a car's envelope swept along every kept track's route, and a service van's along the access road, stays 0.4 m clear of the lining, the barrier, the platforms and
  every block (negative: a platform edge moved 0.6 m in);
- `walk-floors`: every walkway, platform, stair and gap walk is a `KWALK` floor within 0.15 m of the drawn surface, and
  the reach audit reaches every platform from every other in its segment and across its gaps (negative: the gap's stair
  removed);
- `lining-in-void`: the drawn lining lies inside the carved void everywhere (no rock through the lining; negative: a ring
  pushed 1 m out);
- `gap-is-cut`: every gap has every track `cut` or flooded over 0.6 m, and a walk (negative: one track left `kept`);
- `hot-sealed`: the hot section's ends are doors, and no shaft or adit opens inside it but through a door (negative: a
  shaft at km 124 with no seal);
- `train-on-guideway`: every car's bogies stay within 0.05 m of their track's route through a run, crossovers included
  (negative: a car offset 0.3 m);
- the cave stations' own: eyes in the open and in air, `heat` on every stretch over 45 degC, gas on the low floors, the
  view budgets.

## 15. Questions for the owner

**All seventeen answered on 2026-11-11** (see "The owner's answers" at the top). Kept here as asked.

1. **The Line's shape** (section 2): four segments (N, the long run, S1, S2), three gaps (G1 at the breccia's fault, G2
   where the gallery fell into a hypogene chamber, G3 a karst inrush), the hot section the middle of the long run (doors
   at km 55 and 203), three sealed ghost stations inside it, the long run's three sealed trains. Right, or move the gaps?
2. **The numbering** (section 2): number the Line's stations **from the Rift's hub north** (the Pile 1, Chimes 2, Nulab 3,
   Ledge's lifts 4, the south portal 5, ... the north portal 15), so Loj Fower stays at Ledge; numbers past the stations'
   (Loj Twenny, 20) belong to lojes founded later in caverns? `LORE.md`'s "north to south" would change.
3. **Loj Twenny** reached by a 25 km side gallery from the Twenny junction (km 218), as a cavern loj in the rift fill (not
   on `tube_rift_08`, which is 300 km off)?
4. **The section** (section 3): one 32 m gallery, 13 m to the crown, four guideways (concrete beams with a guide slot, no
   rails), a 5 m central strip, walkways on both walls; two twin-track bores of 14 m in bad ground, rejoining in junction
   halls; crossovers as flexing beams?
5. **The north approach**: the Line goes underground on Dalab's plain and climbs on spirals inside the Wall under
   **Shelf**, which was the Line's northern station town?
6. **The Line's power**: the hot section's heat runs the Line, through an Ancient power plant at the hot doors kept by
   rite, its exotic part the generators' rare-earth magnets (re-wound from the rift fill's ore), a few Ancient power cells
   recharged there; which is why the trains and the cooling plant still work and **the cyan strips still glow inside the
   hot section** and nowhere else?
7. **The stations**: `bore`, `gap`, `station`, `hotdoor`, `breach`, `fault`, `portal`, at the chainages of section 5, `bore`
   first? `hotdoor` at the **north** door (granite, with the cleft shrine), or the south door (nearer the Tungang
   heartland, no granite)?
8. **The train** (section 7): two power cars and six to ten cars (saloon, crew car, van, tank car), 24 m cars 3.6 m wide,
   sealed and pressurised; kept trains at 15 m/s?
9. **The car states**: `built`, `kept`, `derelict`, `wreck`, with `kept` a new idea for the vehicles kit (one culture's
   upkeep dress over another's vehicle)?
10. **The Tungangs' stock** as a `tungang` culture in the vehicles kit (the Fixers' trolley, a flat wagon, the ice
    wagon)?
11. **Riding** (section 8): accept the riding plan's hook as written (track routes, `KSCHED` timetables, the car pose
    formula, interiors and capacity on the car records, stops from the platforms)?
12. **The order of merging**: ask the ancient-transit and ancient-vehicles sessions to merge their branches before the
    Line builds on them, or build the Line on a branch from theirs?
13. **The owed hazards**: add `rockburst`, `inrush` and `seal` to `core/hazard` as opt-in kinds?
14. **Textures**: the three owed sets of section 13 (`concrete.lining.segment`, `concrete.guideway`,
    `metal.plate.riveted.painted`): write their prompts into `PROMPTS-NEEDED.md`?
15. **The portal**: the shallow south's 25 km under 30-60 m of cover is cut-and-cover with shafts, one stretch fallen open
    to the sky, and the Line runs 42 km on the surface from the portal to Ledge?
16. **The ore** (section 2.1): veins taken from `kits/resources`' node field where the bore crosses them, so the open
    world agrees; the heartland gives copper and rare earths, the north end iron (the valley) and tin (the north door's
    granite), the gneiss's gold and silver lie behind the hot doors; the metals move along the Line as cargo?
17. **The shafts** (section 2.1): air shafts only where the cover is thin (both ends, the valley, the great shaft at the
    Twenny junction, the shallow south), none over the hot section; their heads hidden and disguised, with a winch
    house, an ice store and a hooded lamp, portered by the Fellgang road families? The raid points are the heads within
    15 km of Dalab's road: km 4, 10 and 24 in the north, and km 290-304 in the shallow south. Is 15 km (a night's walk out
    and back) the right reach?
