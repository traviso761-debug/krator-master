# The Slabfields: the plan (2026-11-12)

**The Slabfields** (`rmvmidbasin101`; Mid Basin until 2026-11-12) lies on map 5.1 between the Loom-Chasms (Region 99,
`rmvraoas90co7`, north) and the Siphon Pits (`rmvra9zogfm9t`, south). The Stalker Gate's passes (`rmvstalkergate`) and the
Stalker Range open onto it from the west.

**The idea in one line: where the Loom stops stretching and the Pits start squeezing, the flood basalt breaks into lone slabs
and stands them on edge, as Io's mountains stand.** A slab is a block of the plateau's own lava beds, kilometres thick, shoved
up on a thrust fault and tilted: a sheer cliff on its leading edge, a long straight ramp falling to the plain behind, a
landslide apron spread in front of the cliff, and often a patera at its foot, where the fault let magma up. North of the
hinge the same basalt is pulled apart into the Loom's chasms. The Slabfields is the one place on Krator where both happen in
sight of each other.

The owner's briefs (all kept):
- **2026-11-03:** a transitional zone with "the geological uniqueness that crashing these features together would create". It
  is not a blend of the two neighbours' looks. It is the landforms that only exist where the Pits' volcanism meets the Chasms'
  faults.
- **2026-11-09:** a realistic terrain transition from the Loom-Chasms to the Siphon Pits. A few pits and chasms are fed by a
  spring and might make good player outposts. The dangers are mostly environmental, but Yuni outlaws are known to roam the
  region.
- **2026-11-12:** rename it the Slabfields and re-plan it around Io-style tilted crustal blocks; write the scale model's
  micro edit that carves them (edit 3 of 5.1, `tools/scale-model/edit_513.py`).

**Status.** A plan, the model edit, and **station 1 built** (2026-11-12): the Anvil's Foot, `dist/slabfields.html` (`python3 build.py`;
`NOTES.md` has its numbers, `KNOWN_ISSUES.md` what it owes). Stations 2-5 are not built. The region's id `rmvmidbasin101` is **kept**: ids are stable
keys, and the model's own code (`build_425_master.py`'s protected SE complex, `51-region-store.js`'s reconciles, the
river's id `r_mb_siphon_breach`) names it in places a rename would have to chase for no gain. Only the name changed.
`LORE.md` is untouched: section 17 proposes its sentences. Marks used below: **default taken, owner to confirm** where
this plan chose; **TBD** where a name is the owner's.

This plan replaces the Mid Basin plan of 2026-11-09. Its survey, springs, people, hazards, outposts and life carry over; its
landforms are re-read, and the slabs, aprons and paterae are new.

## 0. What the kit is

| | |
|---|---|
| Folder | `biomes/slabfields/` (`src/`, `stations/`, `build.py`, `verify.py`, `materials.json`, `tex/`, `NOTES.md`, `KNOWN_ISSUES.md`, `PORT.md`) when built |
| Pages | stations, as the Throne's and Korona's (`build.py --station <name>`): `dist/slabfields.html` (station 1) and `dist/slabfields-<name>.html` (section 13) |
| Kind | a biome kit on the shared biome core; life read in place from its neighbours (section 9) |
| Model | scale model 5.1 edit 3 carved the slabs, aprons and paterae (section 5; `tools/scale-model/README.md`, "5.1 edit 3") |

## 1. The idea

Earth has tilted fault blocks: the Sierra Nevada is one, a granite block whose east face is a 3 km scarp and whose west side
is a long ramp down to the Central Valley. But Earth's are made by **stretching** (the Basin and Range) and stand in ranks.
The un-Earthly kind is Io's: **lone slabs rising out of flat lava plains, pushed up by squeezing**. Io has about 115 named
mountains, 157 km long and 6.3 km high on average, the tallest (Boösaule Montes) 17.5 km (Schenk et al. 2001). They are
not volcanoes; they are blocks of crust thrust up and tilted (Schenk and Bulmer 1998), with landslide aprons below their
cliffs (Euboea Montes' is the type), and paterae, Io's flat-floored volcanic pits, are often found beside them (Radebaugh
et al. 2001; about 40% of mountains have a patera next to them, Turtle et al. 2001).

The drama this gives the region:
- **The ramp side is the road up; the cliff side is a wall.** A slab is a natural fortress: one way up, a kilometre or two of
  sheer rock everywhere else. An outlaw hideout on a slab top is reached by one ramp and sees the whole plain.
- **A slab still tilting.** One slab (the Leaner) is still being lifted at its cliff end. A settlement on its ramp lives on
  ground that is slowly steepening; its springs move; quakes come in swarms (section 3.6 has the honest rate).
- **A split slab.** One slab (the Halves) was cut in two and the halves slid 42 km apart, with a patera in the gap and a pit
  chain along the fault, as Io's Hi'iaka Montes are.
- **The aprons.** Below every cliff lies a landslide apron: a lobe of broken basalt kilometres across, boulders the size of
  fields, caves between them.
- **The springs.** The faults that lift the slabs cut the basalt's aquifer. Spring-fed paterae and the warp chasms' heads are
  the outposts the brief asks for.

## 2. Why it is alien, and why it is Krator's

**What a reader has not seen.** Mountains that are single tilted slabs on a plain, each alone, each with a lake at its foot,
is Io's landscape, seen only in Galileo's images. On Earth, compressional mountains come in belts (fold-and-thrust belts
along plate margins) and tilted blocks come in ranks (rifts). A field of lone, squeezed slabs needs a world with no plates
whose crust is squeezed from below: a heat-pipe world.

**Why Krator has them.** `LORE.md` section 2: Krator is a tidally heated moon with **no plate tectonics, one thick unmoving
shell**, losing its heat "as a heat-pipe world does, through long-lived vents, and the buried flows thicken and stiffen the
shell". That is Io's engine, slower. Io's mountains are what a heat-pipe shell does where it is buried fast enough
(McKinnon, Schenk and Dombard 2001). Krator's volcanism is "focused, not global", so the squeezing is regional too: under
the provinces still being buried. The Siphon Pits is one (its maars, pit chains and geyser swarm are live). The Loom-Chasms
is not: its flood basalt is old and is being pulled apart, which `LORE.md` also allows ("tides crack the shell into rifts
without moving it"). The Slabfields is where one gives way to the other.

**Where it breaks Io's pattern, and why the break is earned.** Krator's slabs are lower (1.2-2.2 km, not 6 km: section
3.3) and fewer, and they carry weather Io lacks: rain, frost, springs. Io's slabs collapse by mass wasting in vacuum; Krator's
also by water (the aprons feed springs and the cliffs' joints freeze and open).

## 3. The mechanics, honestly

Every number here is order of magnitude. Where the arithmetic is the plan's own, it says so.

### 3.1 Why the crust is squeezed (the heat pipe)

On a heat-pipe world, magma rises through pipes and spreads on the surface; each new flow buries the last. The buried crust
moves down toward the centre at the burial rate *v*. Two things then compress it sideways (McKinnon et al. 2001; Schenk and
Bulmer 1998, "compression at depth induced during vertical recycling"):

1. **Geometry.** A layer that sinks a depth *z* must fit on a sphere of radius *R - z*: its horizontal strain is *z / R*.
   Krator's radius is about 4,800 km (`LORE.md` section 2, from 7.4 m/s² at Earth's density). At 30-50 km depth the strain is
   0.6-1.0%; across a 400 km province that is **2.5-4 km of shortening** to be taken up somewhere.
2. **Heat.** The sinking crust warms (it is carried toward the hot base of the shell) and expands. Basalt's expansion,
   3 x 10⁻⁵ per kelvin, over a 300 K warming is 0.9%: **another ~3.6 km over 400 km**, less what creep relaxes.

Rock does not take 1% strain elastically (that is hundreds of MPa): it breaks. The shortening goes onto a few thrust faults,
and each fault's hanging wall rises as a slab. That is the whole mechanism.

**The burial rate** (the plan's arithmetic). If a heat-pipe world loses its heat flow *q* by erupting lava that cools from
melt, *q = ρ v (L + c ΔT)*. With ρ = 3,000 kg/m³, latent heat *L* = 4 x 10⁵ J/kg, *c* = 1,200 J/kg/K and ΔT = 1,000 K:
- Io, *q* ≈ 2.5 W/m²: *v* ≈ 16 mm/yr if all of it went by lava; the published resurfacing estimates are near 1 cm/yr.
- Krator at 2-5x Earth's 0.087 W/m², 0.17-0.44 W/m²: *v* ≈ **1-3 mm/yr** even if all of it went by lava, and less where it
  does not. **5-15 times slower than Io**, which matches the brief's 5-10x.

Slower burial matters twice. It sets how fast the strain builds (slower: fewer active slabs at a time), and it gives the
sinking crust longer to warm, so the lower shell is warmer and weaker and creep relaxes more of the stress. Both make
Krator's slabs fewer and lower than Io's. This is the plan's reading of McKinnon et al.'s model; it is not their number.

### 3.2 Where the stress changes, and why (the hinge)

Squeezing in the middle, stretching to the north. The honest account has two parts.

**The load.** The Siphon Pits plateau is a pile of flood basalt about 2 km higher than the ground north of it (4.3 km
against 2.0-2.3 km on the model). A load on an elastic shell bends it down under the load and up into a low bulge beyond
it. For a line load on an elastic plate the deflection is *w(x) = w₀ e^(-x/α) (cos x/α + sin x/α)*, with the flexural
parameter *α = (4D / Δρ g)^(1/4)* and *D = E Tₑ³ / 12(1 - ν²)*. The top of the plate is in **compression** from the load out
to *x = πα/4* and in **tension** from there to about *5πα/4*, the bulge's crest at *πα*. With *E* = 70 GPa, ν = 0.25,
*g* = 7.4 m/s², an unfilled moat (Δρ = 3,300 kg/m³) and an elastic shell 30-40 km thick (Krator's is "thick"; the
default taken):

| Tₑ | α | compression to (πα/4) | tension to (5πα/4) | the bulge's crest (πα) |
|---|---|---|---|---|
| 30 km | 72 km | 57 km | 284 km | 228 km |
| 40 km | 90 km | 71 km | 353 km | 282 km |

**On the model:** the plateau's edge (the upper bench's foot, 4.2-4.3 km) runs at about y 1398 from x 1640 to 1740. The
compressive band then reaches **57-71 km north, to y 1363-1370**: the middle bench. The tensile band runs from there to
280-350 km north (y 1220-1255), which is where the Loom-Chasms' warp chasms are: their southern heads stop at y 1290-1340
(the model's ground, section 5). In the west the Pits' edge lies further south (the Central Dividing Fault's scarp, about
y 1430-1440 at x 1600), so the band reaches about y 1370-1400 there.

**The burial.** The heat pipe's squeeze (3.1) acts only where crust is still being buried: under the Siphon Pits, whose maars
and pit chains are live, and under the Slabfields' own paterae. The Loom-Chasms' basalt is old; nothing buries it, so it
feels only the bulge's tension and the tides' (`LORE.md`: "tides crack the shell into rifts"). Adding the burial squeeze to
the load's compression pushes the neutral line a little north of *πα/4*.

**So the hinge is a real line: the place where the horizontal stress changes sign.** It runs along the middle bench, about
y 1355-1370 in the east and y 1370-1400 in the west. North of it the faults are normal (the benches' scarps step down
north; the warp chasms are grabens; Mid Basin's old plan read these right). South of it they are thrusts, and the slabs stand.
Every slab the edit placed lies south of the line; none lies in the Loom's band. **This is a simplification**: a line load on
a uniform plate, with Tₑ guessed. A real shell's thickness varies, and the plateau is a broad load, not a line. The band's
place is good to a few tens of kilometres; its existence is not in doubt.

### 3.3 How high a slab can stand (one over gravity)

A slab's height is limited by what the shell can hold up. If the limit is a material strength (a fixed stress σ), the height
is *h ~ σ / ρ g*: **one over gravity**. Io's 17.5 km at 1.796 m/s² becomes **17.5 x 1.796 / 7.4 = 4.2 km** on Krator; Io's
mean of 6.3 km becomes **1.5 km**.

The caveat, honestly: if the limit is friction on faults (Byerlee's law), strength itself grows with *ρ g z* and gravity
cancels; the height then scales with the thickness of the cold, brittle lid instead. Krator's slower burial lets heat soak
deeper, so its cold lid is relatively thinner than Io's, which again points to lower slabs. Both bounds say **a few
kilometres at most, about 1.5 km typical**.

The shortening budget (3.1) says the same thing from the other side: 5-8 km of shortening across the province, on thrusts
dipping about 30°, lifts a few slabs by 1-2 km each (a throw *h* on a 30° thrust takes *h / tan 30° = 1.7 h* of
shortening). **Four slabs, 1.2-2.2 km high**: the edit's numbers.

### 3.4 What a slab looks like

| Part | What it is | On the model (2 km cells) | At page scale |
|---|---|---|---|
| **The cliff** | the thrust's leading edge: the hanging wall's broken front, its flow beds cut across | a drop of 1-2 cells | `KRELIEF.scarp`, sheer, its basalt beds in `KSTRATA` |
| **The ramp** | the slab's back, the old plain's surface tilted 6-9° | a straight slope over 10-18 km | the tilted flow tops: pahoehoe and aa crust kept on a slope |
| **The crest** | the cliff's lip, the slab's highest line | the first row behind the cliff | a lipped rim, frost-shattered |
| **The ends** | where the throw dies out along the fault | the crest tapers over the last 5-6 km; the slab narrows | the ramp and the cliff meet in a nose |
| **The front** | thrust fronts are lobate | the cliff bows out 2-3 km at its middle | |
| **The apron** | the cliff's collapse: a long-runout landslide | a lobe 60-140 m thick running out about four cliff heights | `KRUBBLE`, `KSTACKS`, `KCAVERN` (section 6) |
| **The patera** | a flat-floored collapse pit where the fault let magma up | 10-12 km across, 180-250 m deep | a lava-lake crust under a spring lake |

**The aprons' runout.** A large rockfall's runout over its fall height (Heim's ratio *H / L*) is 0.2-0.3 for a cubic
kilometre and falls to about 0.1 for the largest. That ratio is nearly independent of gravity, as friction is. The edit
runs each apron out about four cliff heights (*H / L* ≈ 0.25) from the foot.

### 3.5 Paterae at their feet

A thrust fault is a pathway: it cuts the whole shell, and magma rises along it. Where it reaches the surface at the slab's
foot it collapses a patera: a steep-walled, flat-floored pit over a shallow sill or lava lake. On Io paterae average about
40 km across (Radebaugh et al. 2001). Krator's two, scaled to its smaller slabs, are 10-12 km across and 180-250 m deep.
Both now hold **spring lakes**: the same faults cut the basalt's confined aquifer (section 7), and its water rises warm and
charged with CO₂. This gives the brief's spring-fed pits.

**The split slab.** Hi'iaka Montes is two mountains that fit together like torn paper, with Hi'iaka Patera between them. The
mapping (Bunte, Williams, Greeley and Jaeger 2010, *Icarus*) reads them as one massif cut by strike-slip faulting and pulled
apart, the gap opening into the patera. The Halves are that: one slab cut by a NW-SE fault, the south-east half slid 42 km
along it, a pull-apart opened between them, and the patera and a pit chain sit in the opening.

### 3.6 Still tilting: how fast, honestly

**The tectonic rate is invisible.** Shortening across the province at the burial rate is about *W v / R* = 400 km x 2 mm/yr /
4,800 km ≈ 0.2 mm/yr, shared among the active faults. A slab rising 0.05-0.1 mm/yr at its cliff tilts about **0.1-0.2° per
million years**. Nobody sees that in a lifetime or in a city's history. It arrives as earthquakes, each a metre or two of
slip every few thousand years.

**The fast rate is magmatic, and it is real.** The Leaner has a sill inflating under its cliff end, the same magma that
collapsed its patera. Magma inflating a sill lifts the ground at rates measured on Earth: Laguna del Maule in Chile has risen
about 20-25 cm a year since 2007; Campi Flegrei rose 1.8 m in 1982-84 (the bradyseism). At 25 cm a year at the cliff end, a
ramp 12 km long tilts **0.07° a century**: 25 m of rise at one end in a hundred years. By eye, nothing. In water, a great
deal:
- a pond on the ramp drifts toward its low end, its shore moving tens of metres a decade;
- a canal or qanat laid at 1:1,000 across the ramp reverses within a few generations;
- the springs at the ramp's foot move as the aquifer's outlet shifts (and after each quake swarm);
- walls crack along the bedding; old floors that were laid level now slope; the patera's lake shifts toward one wall.

Bradyseism comes in episodes: decades of rise with quake swarms and gas, then quiet. **Default taken, owner to confirm**:
the Leaner is in an episode now.

## 4. Ideas considered and set aside

- **Slabs north of the hinge.** The Loom's band is under tension; a thrust slab there would be dishonest. The Loom gets
  horsts (its mesas), which are the extensional cousins.
- **Io's sizes.** 6-17 km slabs on Krator would exceed the shell's strength at 7.4 m/s² and the shortening budget (3.3).
- **A slab of every size, everywhere.** Lone slabs are the point. Four bodies on 169,000 km² keeps them lone.
- **Salt or sulfur glides.** Io's slabs may slide on sulfur; a Krator slab gliding on a buried evaporite (Heart Mountain's
  way) would be fast and dramatic, but the model has no salt under the basalt here (`biomes/KARST-SITES-5.1.md`). Set aside.
- **A volcano on a slab.** Io's mountains and its volcanic centres are anti-correlated (Schenk 2001; McKinnon et al.'s model
  predicts it). The paterae sit at the slabs' feet, never on them.
- **A visible, walk-in-a-lifetime tilt.** No honest tectonic rate gives it. The magmatic episode (3.6) gives what is real:
  water that moves and ground that quakes.
- **Renaming the id.** `rmvmidbasin101` stays (Status).

## 5. Where it is on the model (scale model 5.1, surveyed 2026-11-12)

Read with `smodel.page` on `model/data` (before and after edit 513). Pressure is the model's law, **1.6 x e^(-h / 8 km) atm**.
The polygon is the page's default (`model/src/51-region-store.js`); world km = 5.1 px x 2.

- **Size:** 42,226 cells of 2 km, about **169,000 km²**. It spans x 1476-1767, y 1187-1431. 2,879 cells are shared with its
  neighbours (2,665 with the Stalker Gate in the west, 169 with Region 99, 64 with the Siphon Pits); the edit moved none of
  those.
- **Heights** (land, before the edit): p1 / p5 / p25 / p50 / p75 / p95 / p99 = 926 / 1,507 / 2,028 / 2,171 / 3,086 / 4,408 /
  8,311 m; after: 916 / 1,494 / 2,022 / 2,138 / 2,882 / 4,694 / 8,445 m (the slabs add to the top of the middle and upper
  bands; the medians move because the lakes' cells leave the land).
- **Air:** p5 / p50 / p95 = 0.89 / 1.22 / 1.33 atm. The chasm heads 1.31, the corridor and the maar floors 1.20-1.25, the
  middle bench 1.04-1.07, the upper bench 0.93, the slabs' crests 0.82-1.05.
- **Climate:** BSk 20,359 cells (48%), Dsc 6,105, Dsb 5,522, ET 3,625, Dsa 2,051, BWk 1,824, Cwb 729, and small shares of
  HT, EF, HF, O, Cwc. Mean temperature p5 / p50 / p95 = -1 / 17 / 20 °C; rain 125 / 220 / 282 mm. The model's `th` and `tl`
  read -90 (unset) over much of the region: read each station's own values when the kit starts.
- **The three benches** (the old plan's survey; kept): the lower bench and the chasm heads at 2.0-2.4 km (y 1300-1345), the
  **middle bench**, a flat tread at **3.1-3.4 km** (x 1636-1744, y 1356-1392, 220 x 70 km), and the **upper bench**, the
  Siphon Pits plateau's edge, at **4.2-4.35 km** from y 1400 south. The corridor (x 1476-1630) is flat at 1.95-2.3 km from
  north to south.
- **The edges:**

  | Neighbour | Edge cells | Where | Heights p5 / p50 / p95 |
  |---|---|---|---|
  | Region 99 (the Loom-Chasms), north | 570 | x 1482-1766, y 1188-1297 | 917 / 1,890 / 2,471 m: the warp chasms cut in; the transition is the chasms dying south into the lower bench |
  | Siphon Pits, south | 414 | x 1517-1727, y 1385-1430 | 2,037 / 3,843 / 5,263 m: the upper bench runs on into the plateau; in the west the corridor meets the Ostrukh basin at ~2 km |
  | Stalker Gate, west | 478 | x 1489-1556, y 1187-1397 | 2,334 / 2,977 / 3,476 m: the passes' mouths |

  The east edge is the outer wall: over 5,000 m from x 1714 to 1767, to 10,118 m; no region claims the ground beyond.
- **The six breached maars** (Gemini's, kept; `se_provinces.py`, `build_mid_basin_terrain`; their floors from the model):
  the Flagship Siphon-Breach Pool 1584,1348 (a lake at 2,040 m, 40 cells); the Central Chain-Graben Caldron 1626,1366
  (2,174 m); North-Central 1660,1344 (1,951 m); East-Central 1696,1372 (2,280 m); Eastern Rim 1726,1348 (2,375 m);
  Spindle-Mouth 1610,1312 (1,782 m). Each is 30-45 km across, its north rim cut by a fault gorge. Their floors are the warm
  exception: Cwb, 439 mm, 19-26 °C.
- **Water:** the flagship maar's lake; **Ostrukh Riba** (`r_mb_siphon_breach`) from its outlet north into Region 99 (300 km,
  340 m³/s); the wadis **Gould Guli** and **Solt Guli** in the NW corridor; three geyser vents on the flagship, Caldron and
  East-Central floors. No lava tube crosses it.
- **The passes from the west:** the Loess Gorge ends at 1524,1302 (2,090 m), the Lower Ostrukh connector at 1530,1362
  (2,080 m), both in the corridor.
- **People:** no settlement inside. Half the polygon (21,574 cells) lies in the Yuni Emirate's.

### What edit 513 carved (`tools/scale-model/edit_513.py`, report in `edit_513.report.json`)

| Slab | Centre (5.1 px) | Length x width | Strike; cliff faces | Plain | Crest | Ramp | Apron | Climate (crest / ramp / plain) |
|---|---|---|---|---|---|---|---|---|
| **The Anvil** | 1662,1376 | 40 x 18 km | ENE-WSW (8°); **N** | 3,287 m (middle bench) | **5,356 m** (0.82 atm) | 7.0° S | 264 km², 140 m at the foot | ET -4 °C / Dsc +5 / Dsc +8 |
| **The Halves**, north-west | 1715,1366 | 14 x 10 km | E-W; **N** | 3,234 m (middle bench) | 4,674 m (0.89 atm) | 9.1° S | 72 km² | ET -2 °C |
| **The Halves**, south-east | 1729,1382 | 14 x 10 km | E-W; **N** | 3,435 m (middle bench) | 4,875 m (0.87 atm) | 9.1° S | 72 km² | ET -4 °C |
| **The Leaner** (still tilting) | 1600,1397 | 30 x 12 km | ENE-WSW (30°); **NNW** | 2,110 m (corridor) | 3,355 m (1.05 atm) | 6.7° SSE | 116 km² | Dsc +8 °C / BSk +14 / BSk |
| **The Backstop** (a back-thrust) | 1690,1411 | 28 x 12 km | E-W; **S**, toward the load | 4,367 m (upper bench) | 5,370 m (0.82 atm) | 5.7° N | 96 km² | ET -4 °C / ET 0 |

| Patera | Centre | Across | Rim / floor | Lake | Level, spill | Climate |
|---|---|---|---|---|---|---|
| **The Leaner's Patera** | 1601.5,1388.6 | 10 km | 2,087 / 1,907 m | 16 cells, 64 km², 90 m deep | 1,997 m, spill 2,073 m: closed | WH; the shore BSk, 19 °C, 235 mm |
| **The Halves' Patera** | 1722,1374 | 12 km | 3,312 / 3,062 m | 21 cells, 84 km², 40 m deep | 3,102 m, spill 3,260 m: closed | WH; the shore Dsc, 7 °C, 173 mm |

641 height cells moved (raised up to 2,079 m, cut up to 249 m); temperatures lapsed on 437 cells; rain, class and zone
recomputed on 891 (219 changed class: the crests to ET, the ramps to Dsc and Dfc). Every other cell of every PNG raster
is unchanged, and the four painted maps outside the region are byte-for-byte the untouched maps re-encoded (the report's
`jpeg_outside`). Nothing was carved north of the hinge; no river, vent or shared cell was touched.

## 6. The ground and the landforms (`core/terrain`)

North to south the ground crosses the hinge. The table keeps the old plan's forms that still stand and adds the new.

| Form | How it formed | Earth's or Io's analogue | Where | Drawn by |
|---|---|---|---|---|
| **The slabs** (new) | flood-basalt blocks thrust up on the squeezed side of the hinge and tilted; cliff on the leading edge, ramp behind | Io's Euboea, Boösaule, Hi'iaka Montes; the Sierra Nevada's tilt (by extension) for the shape | the four bodies above | `KRELIEF.scarp` for the cliff along its lobate front (`side` toward the ramp, `talus` for its skirt); the ramp a plane tilted from the crest; `KSTRATA` beds tilted with the slab (the beds dip with the ramp and are cut off at the cliff) |
| **The aprons** (new) | the cliffs' long-runout collapses: crushed basalt in a hummocky lobe, its surface strewn with blocks; field-sized boulders at the distal rim; open voids between them | Euboea Montes' apron; Blackhawk (California), Sherman Glacier, the sturzstroms of the Alps | in front of every cliff | `KRUBBLE.heap` (`37c-core-rubble`) for the lobe and its hummocks; `KSTACKS` (`balanced`, `butte`) for the big blocks, seated by `SEAT.md`; `KCAVERN` for the voids (talus caves) |
| **The paterae** (new) | collapse pits over shallow magma where a thrust reaches the surface; flat floors of crusted lava under a spring lake | Io's paterae; Earth's pit craters (Kilauea's) and the Afar's | the Leaner's foot; the Halves' gap | `KRELIEF.maar` without the tuff ring (`rock: 'baked'`, a closed rim) or `KRELIEF.pit`; the lake on `core/water`; `KTHERM` vents |
| **The pit chain** (new) | small pits along the split fault where the pull-apart sags | Hi'iaka; Kilauea's Chain of Craters | beyond the Halves' patera (1725.0,1371.4 and 1719.0,1376.6) | `KRELIEF.tube`'s pit chain, or `KRELIEF.pit` |
| **The relay benches** (kept) | the basalt stepping down north on normal faults, north of the hinge; the step to the upper bench reactivated as a thrust front where it meets the squeezed band | the Afar margin's relay ramps; Mercury's lobate scarps for the reactivated front | the three benches | `KRELIEF.relay` (`38c`) |
| **The breached maar-diatremes** (kept) | magma rising along the hinge met groundwater; the Loom's faults later cut their north rims open | the Eifel; the Hopi Buttes' diatremes | the six maars | `KRELIEF.maar` (`dir` opens north) |
| **The warp-chasm heads** (kept) | the Loom's grabens dying south into the benches; spring-sapped amphitheatres | Hawaii's Kohala valleys; the Snake River's Box Canyon | y 1290-1340, x 1645-1760 | `KRELIEF.stepcut` and the chasm-head amendment (section 15) |
| **The loess-and-tuff corridor** (kept) | silt off the Stalker glaciers' outwash, tuff beds from each maar eruption interbedded | the Loess Plateau; Idaho's and New Zealand's tephra in loess | x 1476-1630 | `KSTRATA.vary` + `drape`; `KRELIEF.gully` |
| **Silicified loess needles** (kept) | hot silica-rich water along the faults cemented the loess round its joints | Kasha-Katuwe's tent rocks for the look | the chasm heads, the corridor's east edge | `KSTACKS` |
| **Spring lines and travertine** (kept, wider) | faults cut the confined aquifer; warm CO₂ water rises and drops carbonate | Pamukkale; Mammoth Hot Springs; the Eifel's CO₂ springs | the maars, the paterae, the chasm heads, the apron toes | `WATER.spring`, `WATER.terraces` |

**Scale.** A station page (5.2 km) sits on part of one slab: its cliff and apron, or its crest and the ramp behind. The
model's cells are 2 km; the slab's cliff is one to two cells on the model and a sheer face at walking scale. The far field
(`KHORIZON`, `KFAR`) carries the other slabs: from the Anvil's crest the Halves are 50 km east and the Backstop 70 km
south-east, and both show.

## 7. The springs

**What feeds them.** The owner agreed (`TODO.md`, "Reroute the Ostrukh Riba south into Lake Ostrukh") that the springs and
fresh Lake Ostrukh share **one confined aquifer**: the basalt's flow tops, sealed by tuff, recharged by the Stalker Range's
snow at 3-5 km to the west. Its head drives the water up wherever a fault breaks the seal. The slabs add faults: every thrust
cuts the aquifer at the slab's foot, and every patera is a hole through the seal. Magma warms the water and charges it with
CO₂ (and at the Leaner, H₂S).

The springs are now records in the model (`DATA.springs`, written by edit 513), so the open world and the kit read one list:

| Spring | 5.1 px | Kind | Water | From | What it is like |
|---|---|---|---|---|---|
| **The Siphon-Breach** | 1584,1348 | maar | warm, CO₂ | the model | the flagship maar's warm lake, 160 km², spilling north as Ostrukh Riba |
| **The Caldron** | 1626,1366 | maar | hot, CO₂ | the model | hot pools and a geyser on a dry maar floor; a travertine cone |
| **The East-Central Diatreme** | 1696,1372 | maar | warm, CO₂ | the model | a geyser vent on a floor walled by bench basalt, between the Anvil and the Halves |
| **The Warp Head** | 1702,1340 | chasm head | cold | the model's ground | spring sapping at the head of the southernmost warp chasm; its stream dies in the salt |
| **The Leaner's Patera** | 1601.5,1388.6 | patera | warm, CO₂ and H₂S | edit 513 | a warm lake in the patera at the Leaner's cliff foot, by the corridor road; it moves with the sill |
| **The Halves' Patera** | 1722,1374 | patera | warm, CO₂ | edit 513 | a warm pool in the split slab's gap; seeps at the feet of the pit chain |
| **The Anvil's apron toe** | 1662,1366 | apron toe | cold | edit 513 | water through the apron's rubble surfacing at its toe: a line of seeps, reed, the middle bench's one green belt |
| **The Leaner's ramp foot** | 1604,1401.5 | contact | cold | edit 513 | the flow tops leaking where the ramp meets the plain: the springs that move |

Small seeps at the dry maars' walls and on the corridor's perched tuff beds stay the kit's own inference, drawn only at
station scale (the old plan's section 3).

## 8. Climate and air

- **Air** by ground: the chasm heads 1.31 atm; the corridor and the maar floors 1.20-1.25; the Leaner's patera 1.26; the
  middle bench 1.04-1.07; the upper bench 0.93; the crests 0.82 (the Anvil, the Backstop), 0.87-0.89 (the Halves), 1.05 (the
  Leaner). `KHAZ.provide('pressure')` from `core/atmos`.
- **The climate up the slabs** (the model after the edit): the Anvil runs from Dsc (+8 °C mean, warm month 21, cold month
  -5) at its apron to ET at its crest (-4 °C, 9 / -17). Its crest is the coldest ground in the region outside the outer wall,
  and holds snow most of the year. The Leaner is warm: BSk on its ramp (+14 °C, 27 / +1), Dsc on its crest (+8 °C). The
  Halves and the Backstop crests are ET.
- **The gradient up the benches** (the old plan's; kept): 19 °C and 125 mm at 1,445 m (BSk, BWk) to -1 °C and 173 mm at
  4,348 m (ET). The corridor is BSk all the way (16-18 °C, 220-267 mm). The maar floors are the warm, wet exception.
- **A slab's own weather** (the kit's inference, at station scale): the cliff's foot is in shadow for half the day on the
  north faces; cold air drains down the ramps at night and pools against the next slab's cliff; the crests catch the snow.

## 9. Life

Most of the life belongs to the two neighbours and is read in place from their kits. The Siphon Pits kit is being built
(branch `claude/siphon-pits-biome`: its hexapods are drawn); the Loom-Chasms' species exist only in its plan. The Slabfields
does not define their species itself.

| Zone | Life | From |
|---|---|---|
| **Chasm heads and floors** (north) | the cable spinner (*Chordephytum ferreum*) slung across the narrow heads; the halite sifter on the salt | `biomes/loom-chasms` (plan section 4); the cables on `KSPAN` |
| **The corridor** (BSk) | loess steppe: bunch grass, sage-like shrub, forbs in the swales; scrub along the wadis | a steppe set read in place (`biomes/nsemiarid`, the crater drylands); `kits/crops` (`CROPS.at`) for what the Yuni could grow |
| **The maar floors and the paterae** (warm, wet) | the oasis: meadow and reed round the lakes; woolly siphons rooted in the hot ground at the vents; siphon felt and suture-galls on the damp basalt | `biomes/siphon-pits` (woolly siphon, siphon felt, suture-gall); the geyser kit's meadow |
| **Spring and travertine margins** | thermophile mats banded by temperature; hot-spring grasses | `biomes/geyser`, read in place |
| **The aprons** (new) | the rubble's shade and seeps make the richest ground on the bench: ferns and moss in the voids, shrubs rooted between the blocks, a reed line at the toe | Earth's: talus flora (ferns, *Saxifraga*-like cushions) read from the highland kits; the Siphon Pits' siphon felt in the damp voids |
| **The ramps** (new) | the tilted flow tops: lichen, cushion plants in the joints, pockets of soil in the ropy pahoehoe; drier on the south-facing ramps | the Siphon Pits' scarp flora; `KFROST` patterned ground on the crests |
| **The cliffs** (new) | ledges: lichen, the nests of the cliff animals | the highland kits' cliff flora |
| **The plateau's edge** (ET) | alpine tundra | the Siphon Pits plateau, in the far field |

**Animals** (`kits/fauna` owns them; candidates, not placed; **vertebrate-grade hexapods, never insects**, as the Siphon Pits'
brief and every native kit): the woolly ghaunt-ox grazing up the ramps and down to the maar floors; the flenser-hound on the
upper rims and slab crests; the basalt pipe-borer in the diatremes' breccia and the aprons' voids; the cable-stryder at the
chasm heads.

**Only here:** the aprons are a habitat Krator has not had in a kit. A sturzstrom's voids hold cool, damp air under a hot,
dry plain: the bench's refuge, for plants and for the animals that shelter in it.

## 10. Resources

- **Building stone:** columnar flood basalt in the cliffs, already broken into blocks on the aprons (`kits/resources`, the
  basalt family; `GEOLOGY.md` puts Siphon Pits and Region 99 in province 8, **flood basalt**; the Slabfields should join
  them at the next rebake: a note for the geology session, not done here).
- **Native copper** in the basalt's flow tops (`GEOLOGY.md`: basalt 120, Keweenaw's kind), exposed on the cliffs and broken
  out on the aprons.
- **Sulfur** at the Leaner's patera (H₂S springs; `GEOLOGY.md`'s sulfur near vents).
- **Travertine** at the springs: a soft, workable building stone.
- **Water:** the region's real resource (section 7).

## 11. Hazards (`KHAZ` kinds)

| Hazard | Where | `KHAZ` | Its tell |
|---|---|---|---|
| **Rockfall** from the cliffs | the cliffs' feet, the aprons' upper edge | `crush` | fresh scree, a pale scar on the face, the crack of a block at dawn as it warms |
| **Landslides** (a cliff's collapse) | in front of every cliff; rare, huge | `crush`, timed: a record whose `cycle` fires once in a long while (amendment 2) | open tension cracks along the crest, set back from the lip |
| **The active tilt** (the Leaner) | its ramp, its patera | quake swarms (`crush` near the cliff, `slip` on the ramp's loess); springs that move | tilted ponds, cracked walls, a swarm of small quakes, bubbling at the lake's shore |
| **The springs' gas** (CO₂ and at the Leaner H₂S, settling in hollows on still nights) | the paterae, the maar floors, the breach gorges, the apron voids | `gas` with `shape.pool` (`21-core-hazard-flow.js`); strongest at night (amendment 2) | dead birds and bare ground in the hollows; the smell of eggs at the Leaner |
| **A limnic gas release** (Lake Nyos, 1986, was a maar lake) | the flagship lake, the two patera lakes | a `gas` record over the lake, a rare event: the owner's choice (section 19) | the water turning red-brown, a roar from the lake |
| **Scalding water and hot ground** | the geyser vents, the hot pools, the travertine aprons | `heat`; ground temperature from `KTHERM` | colour and steam |
| **Crust over hot water** | sinter and travertine aprons; the patera floors' lava crust | `sink`, breaking underfoot | a hollow ring |
| **Cliffs** | the slabs' cliffs, the bench scarps, the chasm headwalls, the maars' cut walls | `fall` | |
| **Apron voids** | between the boulders | `fall` (a drop into a void), `gas` where CO₂ settles in them | cold breath from the gaps |
| **Wet loess** | the corridor's gullies, the Leaner's ramp foot | `slip` | |
| **A flood down the breach gorge** | Ostrukh Riba's gorge, the gulis | `drown` and `crush`, timed | a rising roar, mud in the stream |
| **Dust storms** | the corridor, the chasm floors | weather (`core/atmos`'s dust season) | |
| **Cold and thin air** | the crests, the upper bench | `KHAZ.provide('temperature')`, `'pressure'` | |
| **Predators** | the slab crests, the upper rims | `hunter` places (`KHAZ.PREDATOR.lair`), candidates only | |

## 12. People

### The Yuni

Two Yuni villages bracket the region (`model/src/60-settlements.js`): **Spindle Fan** (1561,1140, 2,150 m), a farming and
spring outpost on the Weavers' Cradle fan about 200 km north of the polygon's NW edge, and **Ostrukh-on-Water** (1516,1471,
1,988 m), terraces and qanats on Lake Ostrukh, about 170 km south of its SW edge. The corridor is the low, level road between
them; the Stalker Gate's passes join it from the west. Yuni holds half the region on paper and keeps no post in it.

### The outlaws (proposed: the lore says nothing yet)

Kept from the old plan: three streams, the losers of a family feud or an Emmo's choosing, deserters from the outposts'
guards and the qanat gangs, debtors and convicts run out of the Thatch. A name **TBD** (the plan offered *Ranjos* or *Bushis*,
Yuni's clipped bushrangers). Small bands of 10-30, two or three in the region.

**The slabs give them their ground.** A slab top reached by one ramp, with a cliff on every other side and a view over the
plain, is the natural hideout: the band holds the ramp's foot, a lookout on the crest sees the road for 50 km, and the apron
below the cliff gives water at its toe and caves to hide stores in. **Default taken, owner to confirm:**
- **The Halves are the outlaws' seat.** Two slab tops, each one ramp up, a patera with water between them, far from the road
  (40-60 km east of the East-Central maar), and the pull-apart's pit chain as a back way down. A hideout with a name (TBD).
- **The Anvil's crest is their lookout** over the middle bench: too cold to live on (ET), it sees the Halves, the Caldron and
  the bench.
- **The Leaner is contested:** the best outpost site in the region (section 12, outposts) sits on the road below the outlaws'
  view.

**How the kit places them** (records first; a builder draws a record, it does not decide where things go): camps are
`KCAMP.pitch` records sited from the spring candidates by `KRAND.hash(world, cell, index, salt)`, kept clear with `KSPACE`,
each piece with its `<band>:<key>:<i>` id, registered in `core/tags` before it is drawn; lookouts are records sited by a
plain rule (sees a stretch of road, is not seen from it), so they run in Godot; on the simulation each band is a hostile band
whose raids follow `core/camp/PLAN.md` section 6.1. An outlaw is a person with an AI, not a `KHAZ` record. The gaps (a
war-camp culture row, a band size of 10-30, a lookout record) are amendment 4.

### Outposts: candidate sites only

**No spot is picked for the player** (the owner, 2026-11-09). "Outpost" means a **player settlement** in the open world's
outpost registry. NPC camps stay `core/camp` and `core/hamlet` records, never registry records. This kit offers hints the
registry may read: place, water, warmth (`KTHERM`), gas and flood exposure, the view of the road, the outlaws' range.

| Candidate | For it | Against it |
|---|---|---|
| **The Leaner's ramp** (2.2-3.3 km; BSk to Dsc) above its patera lake | a slab's ramp is one way up and a cliff behind: the best defended ground on the road; a warm lake; sulfur; the road below | the tilt: springs that move, quake swarms, H₂S and CO₂ in the hollows; the outlaws' first target |
| **The Halves' patera** (3,062-3,102 m; Dsc) | water between two slabs; the most hidden site | the outlaws' seat; cold; far from the road; gas in the gap |
| **The Anvil's apron toe** (3.1 km; Dsc) | the bench's one spring line; caves for storage; stone already broken | rockfall and landslide from the cliff above; gas in the voids |
| **The Siphon-Breach** (2,040 m) | the most water in the region; a perennial river; warm; the road's midpoint | the lake's CO₂; floods at the outlet |
| **The Caldron** (2,174 m) | hot water and a geyser: heat and power | scalds and crust; gas in the floor |
| **The East-Central Diatreme** (2,280 m) | sheltered by bench walls | far from the road; rockfall |
| **The chasm heads** (1.6 km) | a spring at the top of a way down into the Loom-Chasms; easy to defend | rockfall, floods, a salt floor below |

## 13. Stations (proposed, on the 5.1 map)

World km = 5.1 px x 2. A page's site is the old canvas px (5.1 px less 272, 330). Each page is the usual 5.2 km square;
`KHORIZON` and `KFAR` carry the rest.

| Station | 5.1 px | Ground (model, after edit 513) | What |
|---|---|---|---|
| 1 **The Anvil's Foot** | 1662,1367 | the apron, 3.1-3.4 km; the cliff 2 km over it; Dsc, +8 °C, 1.08 atm | **the landform in one view:** the cliff of tilted basalt beds, the apron's hummocks and field-sized blocks, the spring line at its toe, the voids; the Halves on the east horizon, the Caldron's rim to the west |
| 2 **The Leaner** | 1601,1392 | the patera lake at 1,997 m; the ramp rising SSE to 3.36 km; BSk, +14 to +19 °C | the still-tilting slab: the warm lake in its patera at the cliff foot, the road along the shore, tilted ponds and cracked walls on the ramp, the moving springs. The outpost candidate |
| 3 **The Halves** | 1722,1374 | the patera at 3,062-3,102 m between two crests at 4.7 and 4.9 km; Dsc | the split slab: two cliffs that fit together, the patera and its pool in the gap, the pit chain; the outlaws' seat |
| 4 **The Siphon-Breach** | 1584,1340 | the maar lake at 2,040 m; Cwb on the floor | the old plan's station 1, kept: the collision of maar and fault in one view, with the Leaner on the southern horizon |
| 5 **The Warp Head** | 1702,1340 | chasm floor about 1.35-1.6 km; BWk | the north side of the hinge: a Loom chasm dying into the benches, its spring line, the needles; the Anvil's cliff 60 km south |

Station 1 comes first: it shows what the region is now. Station 2 next: the drama and the outpost.

**Station 1 as built** (2026-11-12): px 1662,1369, the Anvil's cliff along the page's south (`KRELIEF.scarp`, 1,990 m over the bench on a
650 m run, three flow-top ledges, ravines, buttresses, a talus skirt with fresh fallen blocks), its ramp falling 7 degrees behind the rim;
the last collapse's apron (3.6 km, H/L 0.46: one lobe of the many the model's 264 km2 sums) with its hummocks, levees, raised toe and 48
blocks (7 field-sized, `KSTACKS`); nine seeps on the spring line at the toe and their brook; void fern, seep reed, bench bunchgrass and
block lichen (the kit's own Earth stand-ins: `KNOWN_ISSUES.md`), Oidong's cushions read in place on the dry bench; the cliff (`fall`),
the rockfall belt (`crush`) and the night's CO2 in the toe's hollows and the blocks' voids (`gas`, pooled) as hazard records.

## 14. Core adoption (written first, as the working rules ask)

| Need | Module | How |
|---|---|---|
| randomness | `core/rand` (`KRAND`) | every placement seeded by (world, cell, index, salt) |
| the slabs | `core/terrain`: `KRELIEF.scarp` (`38`, `SCARP.md`) | the cliff: a `scarp` along the lobate front, `side` toward the ramp, `h` the slab's height at that point, `talus` for its skirt, `ravines` for the gullies cut into the face; the ramp a plane from the crest falling to the plain (amendment 5 proposes it as `KRELIEF.slab`); `KRELIEF.scarpProfile` checks the face against the model's |
| the beds | `KSTRATA` (35), `KSTRATA.vary` (`35c`) | flood-basalt flows (columnar entablature, colonnade, vesicular flow tops, red baked tops between flows) **tilted with the slab**: the beds dip with the ramp and are cut off at the cliff, so the face shows their edges stepping up the cliff |
| the aprons | `KRUBBLE.heap` (`37c-core-rubble`), `KSTACKS` (37) | the lobe and its hummocks as heaps; the field-sized blocks as `KSTACKS` bodies (`butte`, `balanced`) seated by `SEAT.md` |
| apron caves | `KCAVERN` (39) | the voids between the largest blocks: short talus caves, cold, gas-prone |
| the benches, maars, chasms | `KRELIEF.relay`, `maar`, `stepcut`, `gully` (`38c`) | as the old plan |
| the paterae | `KRELIEF.maar` (closed rim, no tuff ring) or `KRELIEF.pit`; `KRELIEF.tube` for the pit chain | |
| ground heat | `KTHERM` (`47-core-therm.js`) | the vents, the paterae's sills, the hot springs |
| water | `core/water` | the patera lakes and the flagship lake (`WATER.open`), Ostrukh Riba and the gulis (`WATER.flow`), the springs and geysers (`WATER.spring`, `WATER.geyser`), travertine steps (`WATER.terraces`), salt (`W.pan`) |
| ground | `KGROUND` (43), `KHORIZON` (45), `KFAR` (44) | basalt, apron rubble, loess, tuff, travertine, salt as masks; the other slabs as far masses |
| frost | `KFROST` (42) | the crests' patterned ground |
| hazards | `core/hazard` (`KHAZ`, `21-core-hazard-flow.js`) | section 11 |
| flora, sky, weather | `core/biome`, `core/atmos` | the neighbours' species read in place; the standard sky |
| camps | `core/camp` (`KCAMP`) | the outlaws (section 12) |
| fauna | `kits/fauna` | `BIO.record` records registered before they are drawn |
| resources | `kits/resources` (`KRES`) | the basalt family |
| tags, space, mask, host, export, materials, shadows | as every kit | |
| city, hamlet, karst | no | nobody lives here yet; basalt does not dissolve |

## 15. New in core (each small, each a proposal)

1. **Geothermal surfaces** (kept from the old plan): mud pots, fumaroles, travertine, sinter and mat decals. Owed in
   `core/water/README.md`; Firebliss, godshearth, twins, greatchasm and seouterwall want them too.
2. **Hazard behaviour** (kept): gas that pools at night (a `cycle` bound to `core/clock`), a crust that stays broken, a
   flood that runs a gorge; and now **a rare, one-shot event** (a cliff's collapse, a limnic release) as a timed record.
3. **A chasm head for `stepcut`** (kept; the Loom-Chasms want it too).
4. **core/camp for outlaws** (kept): a war-camp culture row, a band size of 10-30, a lookout record and its siting rule.
5. **`KRELIEF.slab`** (**built 2026-11-12** as its own file, `core/terrain/38d-core-slab.js`; `LANDFORMS.md`; station 1 draws the Anvil on it): a tilted block from a front polyline, a height, a width and a taper: the cliff by
   `scarp`, the ramp a plane, the lobate front and the narrowing ends as edit 513 draws them (`slab_add` is the profile, in
   model cells). A published profile, as `scarpProfile`, so the kit and the model agree. Its records: `crest`, `cliff`,
   `ramp`, `toe`, `end`. The Loom-Chasms' horsts could use the same form with the ramp level.
6. **`KSTRATA` tilt** (new, perhaps already possible): a formation whose beds are rotated with a block (a dip and a dip
   direction on a body). Check `35c` first: if `vary` takes a base that is a plane, it is done.
7. **The outpost registry** (open world, not this kit): every player settlement as a record, with this kit's candidate
   sites as hints.

## 16. Textures

The library has what the slabs need: `rock.basalt.flowbanded`, `rock.basalt.polygonal` (the colonnade's column ends),
`rock.basalt.vesicular` (the flow tops), `rock.basalt.oxidised` (the baked tops between flows), `rock.rubble.sturzstrom`
(the apron), `rock.rock_boulder_dry` (the blocks), `rock.tuff`, `rock.loess`, `ground.travertine.white`, `ground.sinter`,
`ground.lava.crust` (the patera floors), `ground.salt`. **Gaps** (for `core/materials/PROMPTS-NEEDED.md` when the kit
starts): a **columnar-jointed cliff face seen side-on** (entablature over colonnade; the library's polygonal set is the column
ends from above), and a **lichen-crusted tilted pahoehoe** for the ramps. Not added to the list yet: the kit is not started.

## 17. `LORE.md` sentences (proposed, for the owner's hand; not written there)

For section 2 ("Why Krator is volcanic"), after "tides crack the shell into rifts without moving it":
> Where the flows still bury the shell, they also squeeze it: the buried crust sinks onto a smaller sphere and warms, and the
> squeeze breaks it on thrust faults. Between the Loom-Chasms and the Siphon Pits this has stood lone slabs of flood basalt on
> edge, as on Io: **the Slabfields**, each slab a cliff on one face and a long ramp on the other, a landslide apron below the
> cliff and often a patera at its foot. Krator's are a few kilometres high, not Io's ten and more, because its gravity is
> four times Io's and its burial five to fifteen times slower.

For section 6.11 (Yuni), if the owner keeps the outlaws:
> Outlaws roam the Slabfields, on the road between Spindle Fan and Ostrukh-on-Water: houses cast out by a feud or an Emmo's
> choosing, deserters, and debtors out of the Thatch. They hold the slab tops, each reached by one ramp.

## 18. Order of work

1. After the integration pass and the neighbours' species files (the Siphon Pits' are being drawn; the Loom's are not).
2. Amendment 5 (`KRELIEF.slab`) and 6 (`KSTRATA` tilt) first: the kit's one new form. Test them on the model's numbers.
3. Station 1 (the Anvil's Foot), then 2 (the Leaner), then 3 (the Halves); 4 and 5 last.
4. Amendments 1, 2 and 4 can go any time: other kits want them.

## 19. For the owner

- **The landform:** the slabs as placed (section 5): four bodies, 1.2-2.2 km over their plains, one split. More, fewer,
  taller? The edit is one table in `edit_513.py` and reruns from a clean data folder.
- **The hinge:** the stress changes sign along the middle bench (section 3.2). Is the reading canon: the Siphon Pits' load
  and its live burial squeeze; the Loom's old basalt stretched by the bulge and the tides?
- **The Leaner's episode:** in a bradyseism now (quakes, springs moving, 25 cm a year)? Default taken: yes.
- **The outlaws:** do they exist as proposed? Their name (Ranjos, Bushis or another)? The Halves as their seat, with a name?
  How many bands?
- **Names (TBD):** the Anvil, the Halves, the Leaner, the Backstop and the paterae are working names. Yuni names, like the
  rivers' *Riba* and *Guli*?
- **A limnic release:** may a patera lake or the flagship lake ever release its CO₂?
- **Ostrukh Riba's direction:** still open (`TODO.md`): its gloss says it feeds Lake Ostrukh but it runs north.
- **The maars' scale:** 30-45 km across; keep them as maar-diatreme complexes with true-scale maars nested on their floors?
- **The geology bake:** add the Slabfields to province 8 (flood basalt) at the next rebake?
- **Yuni's claim:** does Yuni patrol its half, or leave it to the outlaws?
- **The live artifact's region database** still holds "Mid Basin" (`tools/scale-model/README.md`, "5.1 edit 3", lists the write).

## Sources

- The owner's briefs: 2026-11-03, 2026-11-09 and 2026-11-12.
- **Io, checked 2026-11-12:**
  - Schenk, P. M. and Bulmer, M. H. (1998), "Origin of mountains on Io by thrust faulting and large-scale mass movements",
    *Science* 279 (5356), 1514-1517, doi:10.1126/science.279.5356.1514 (Euboea Montes; compression at depth from the crust's
    vertical recycling; block rotation; the landslide);
  - McKinnon, W. B., Schenk, P. M. and Dombard, A. J. (2001), "Chaos on Io: a model for formation of mountain blocks by crustal
    heating, melting, and tilting", *Geology* 29 (2), 103-106 (the heat-pipe burial's stresses; mountains and volcanic centres
    anti-correlated);
  - Schenk, P. et al. (2001), "The mountains of Io: global and geological perspectives from Voyager and Galileo", *JGR*
    106 (E12), 33201-33222 (about 115 mountains, mean 157 km long and 6.3 km high; Boösaule Montes 17.5 km);
  - Turtle, E. P. et al. (2001), "Mountains on Io: high-resolution Galileo observations, initial interpretations, and
    formation models", *JGR* 106 (E12), 33175-33199 (about 40% of mountains beside paterae; the aprons);
  - Radebaugh, J. et al. (2001), "Paterae on Io: a new type of volcanic caldera?", *JGR* 106 (E12), 33005-33020 (417 paterae;
    13% of paterae beside mountains);
  - Bunte, M. K., Williams, D. A., Greeley, R. and Jaeger, W. L. (2010), "Geologic mapping of the Hi'iaka and Shamshu regions
    of Io", *Icarus* (Hi'iaka Montes: strike-slip and rifting separated the halves; the depression became the patera). The
    brief named no Hi'iaka paper; this is the one found.
- **Earth's rates:** Laguna del Maule's uplift (about 20-25 cm a year since 2007) and Campi Flegrei's 1982-84 bradyseism
  (1.8 m) are from memory of the published record, not re-checked this session: check before quoting them in the lore.
  Heim's ratio for rockfalls likewise.
- `LORE.md` section 2 (the heat pipe, the radius) and 6.11 (Yuni); `kits/resources/GEOLOGY.md` (province 8);
  `biomes/loom-chasms/PLAN.md`; `biomes/siphon-pits/PLAN.md` (on `claude/siphon-pits-biome`, read 2026-11-12);
  `TODO.md` (the shared aquifer).
- The model: `tools/scale-model/smodel/se_provinces.py` (`build_mid_basin_terrain`), `edit_513.py` and its report, read with
  `smodel.page` on `model/data`.
- The plan it replaces: Mid Basin's of 2026-11-09 (its sections 1, 3, 5, 6, 7 are carried here).
