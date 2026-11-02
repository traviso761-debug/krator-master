# gills: the plan (proposal, 2026-11-02)

**The Gills of the Lesser Throne**: a cracked plateau on the Inner Wall's eastern sector, where the ground breathes once a
day in time with the giant's nod, and the only life that can live in the cracks is a life that runs on the breath. The
idea in one line: **a metabolism separated in time, not in space**. Everywhere on Earth a chemosynthetic organism sits
where fuel and oxidant meet at once (the vent's hot sulphide against cold oxygenated water). Here the fuel comes up out
of the ground at one hour and the oxidant blows down into it at another, so the organism is a battery that charges on
the in-breath and discharges on the out-breath, and lays down one ring of its own body for every day it has lived. The
land is the lung; the organisms are its lining; their dead bodies are the landscape.

Status: **a proposal for the owner.** Nothing is built, nothing on the model is changed and `LORE.md` is untouched. Every
lore and map change this plan wants is marked *proposed*. Working names throughout; the owner's or the Nomads' names are
better. The kit's name (`gills`) is a working name too: the Nomads would have their own word.

## 0. What the kit is

| | |
|---|---|
| Folder | `biomes/gills/` (`src/`, `stations/`, `build.py`, `verify.py`, `materials.json`, `tex/`, `refs/`, `BIOME-API.md`, `NOTES.md`, `KNOWN_ISSUES.md`, `PORT.md`) |
| Pages | stations, as the Throne's and Korona's (`build.py --station <name>`): `dist/gills.html` (station 1, the Gill) and `dist/gills-<name>.html` (section 11) |
| Region on the model | *proposed*: a new biome polygon `gills` cut from `e inner wall`'s (section 5), round the model's `Lesser Throne` vent (`DATA.vents`, px 1130,854) |
| Object | `GILLS` (`build`, `dress`, `SPECIES`, `PLANTS`, `HARVEST`, `byKey`, `breath`) on the `BIOME-API.md` contract (the Throne's and sedesert's shape); `GILLS.breath(t)` is the one pure function of the tide every shader, hazard and animal reads (section 3) |
| Core | `biome`, `rand`, `tags`, `space`, `hazard`, `host`, `atmos` (the shared sky and its libration), `water` (springs), `terrain` (`KFIELD`, `KCAVERN`, `KSTACKS`, `KRELIEF`, `KSTRATA`, `KGROUND`, `KFAR`, `KHORIZON`), `clock`; section 13 |
| Read in place | `biomes/ehighlands` (the cushions and the glass tower on the high north), `biomes/sedesert` (the steppe fringe's bunchgrass, umbrella thorn, sun-dial and drift lantern at the dry south-east foot), `kits/fauna` (the cinder crawler, the frost trunker), `kits/resources` (the node field) |
| Out of scope | the Monks' hermitage and the Nomads' camps as buildings (a settlement or `core/camp` plan); the animals' models (`kits/fauna`); the ore nodes' data (`kits/resources`) |

A new biome: it goes in the gallery when it first reaches `main`.

## 1. The idea

The eastern plateau round the Lesser Throne is cracked along radial and ring fractures: the **gills**, fissures 200 m to
3 km long, 10 to 90 m across and 100 to 400 m deep, standing in swarms over a plateau at 3.2 to 4.3 km. Under them is a
heat-pipe conduit system (`LORE.md` section 2, "Why Krator is volcanic": the shell loses its heat through long-lived
vents) threading a crust of impact megabreccia that brought mantle rock to the surface. Rainwater from the wet west face
(4,000 mm a year at px 1090,854) drains east through the fractured rock, meets hot ultramafic rock and is turned, by
serpentinization, into warm alkaline brine charged with hydrogen and methane (Earth's Lost City field makes exactly
this: pH 9 to 11 fluids at 40 to 90 degC that build 60 m carbonate chimneys).

Twice-daily on Earth the tide is the sea's; on Krator it is the rock's. Krator's orbit is kept eccentric by its sibling
moons (`e` 0.01, `core/atmos/SKY-PLAN.md` "The daily bob"), so once a sidereal day the shell flexes and the fissures gape
a little and close a little. The same libration is what makes the giant **nod** 1.6 degrees north and south and swing
1.1 degrees east and west once a day (`core/atmos/sky/89-atmos-e-skymodel.js:30-34, 136`): **the giant's nod and the
ground's breath are one motion seen two ways.** When the gills gape, the conduit system exhales: warm, wet, reduced gas
(H2, CH4, a little H2S, alkaline mist) pours out of every throat for a few hours, visible as a wall of steam in the cold
plateau air. Between, the cooling conduits inhale: dry, oxygen-rich air at 1 atm is drawn down into the cracks, hard
enough to pull dust, seeds and small animals in. Enceladus is the precedent: its plume is brightest when its tiger
stripes are pulled open at apoapsis. Barometric caves on Earth (Wind Cave, Jewel Cave) breathe at metres a second from
pressure changes alone; here the thermal and barometric pump supplies most of the volume and the tide is the valve that
sets the phase (section 3 has the numbers).

**The life.** The native lineage is fungoid: fleshy bodies carrying a partner organism in their skins, no leaves, no
wood (`biomes/outlands/PLAN.md:51-53`; `biomes/swhighlands/PLAN.md:118-121`). In the light the partner is
photosynthetic. In the dark of a gill's throat the same body plan carries a **chemolithotrophic** partner, and the body
has become a battery:

- **On the in-breath** the lining's skin is washed in oxygen. Its outer mantle, a wet black crust of iron and manganese
  oxides laid down by the organism itself, charges: Fe(II) to Fe(III), Mn(II) to Mn(IV), as Earth's manganese-cycling
  bacteria and ferromanganese crusts do, only here on purpose and in bulk.
- **On the out-breath** the hydrogen and sulphide of the exhale discharge that mantle, and the partner microbes harvest
  the electron flow between the two; the alkaline brine mist drops its carbonate on the same surface.
- Each day leaves **one lamina**: a pale carbonate layer from the out-breath, a dark oxide layer from the in-breath, a
  fraction of a millimetre together. The organism lives only at the top; below the lip the body is dead and mineral,
  and it has grown upward on its own skeleton for as long as the gill has breathed. The result is a **breath pipe**: a
  hollow chimney 10 to 90 m tall (0.75 g lets a brittle column stand a third taller than on Earth), bone-white outside,
  banded white and black inside, a living collar at its mouth. Thousands of them stand along every gill. The oldest
  reach back past the Cataclysm (section 10).

So three things that are usually separate are one here: the landform (the gill and its pipes), the organism (the
pipes' living lips and the linings down the throat) and the clock (the giant's nod). A traveller reads the hour of the
next breath off the giant, the age of a pipe off its rings, and the history of the plateau off the pipes that have
fallen.

## 2. Why it is alien, and why it is Krator's

### What a reader has not seen

- **Time-shared metabolism.** No Earth ecology separates its half-reactions by the hour; every chemosynthetic
  community sits on a spatial gradient. A life that must wait for its oxidant, store it in rock, and spend it when the
  fuel arrives is a different way of being alive, and it shows: the whole biome has a pulse, and nothing in it is
  doing the same thing at dawn as at dusk.
- **The land is the organism's skeleton.** Not a reef on a shore but a landform that is entirely the dead of one
  lineage, standing where it grew, readable ring by ring. A pipe field is a graveyard that is also a calendar.
- **A sky-driven tide on land.** Everyone has seen the sea obey the moon. Here the rock obeys the giant, the giant shows
  the phase, and the natives know it.

### The trends it extends (what Krator's native life already does)

| Trend (the files) | How the Gills carry it |
|---|---|
| Native life is vent-born and clusters on geology's energy: vents, heat, sulphur, iron, salt, glass (`biomes/throne/NOTES.md:87-96, 293`; `biomes/godthrone/PLAN.md:192-201`) | its energy is the heat-pipe's reduced gas; its body is iron and manganese oxide and carbonate; it does not need the sun at all |
| Where Earth life fails, native life is the whole flora; where Earth life is strong, native life is a flavour (`throne/NOTES.md:88-89, 213, 273-275`) | the gills (dark, alkaline-misted, breathing wind, sulphide) exclude Earth plants; the dry steppe between them is Earth's (sedesert's bunchgrass and thorn, ehighlands' cushions higher up). The biome reads from the air as stripes: native white-and-green along every crack, Earth brown between |
| Native forms answer one physical problem each, and a kit's family reads as one because they share the problem (`biomes/riftrim/PLAN.md:109-113`; `biomes/rift/PLAN-STATIONS.md:165`) | every species here answers the breath: how to hold oxidant through the out-breath, how to feed on the in-breath, how to ride the gust |
| Life carries state on the world clock, and the giant is the sky's fixed cue: everything in the east leans to it (`biomes/ehighlands/NOTES.md:117-122`); the sun-dial turns with the sun (`biomes/sedesert/PLAN-STEPPE.md:61`); the night rosette closes at night (`rift/PLAN-STATIONS.md:203`) | the giant is the clock rather than the compass: the Gills are the first biome whose life cycles on the giant's tide, which no kit has used (the digest of 2026-11-01: "no biome ties a native organism's cycle to the giant's tide") |
| The native lineage is fungoid: fleshy, partnered, no leaves (`outlands/PLAN.md:51-53`) | the same body plan with a different partner, which is the point: the lineage is a **host for partners**, photosynthetic in the light, chemolithotrophic in the dark. *Proposed* as the lineage's first stated rule of biochemistry (section 17) |
| Native life is the natives' armoury, medicine and trade (`throne/NOTES.md:109-134`; `riftrim/PLAN.md:287-288`) | one medicine, one ore, one fuel (section 9) |
| Dispersal by what the air does (nsemiarid: "everything travels", `biomes/nsemiarid/PLAN.md:154`; spores on plume thermals, implied and unbuilt: `throne/NOTES.md:195`) | the spores ride the out-breath and are sown by the in-breath of the next gill downwind: the breath is the pollinator, so nothing here glows to call one |
| Native fauna are vertebrate-grade hexapods coevolved with the flora, never insects (`outlands/PLAN.md:57-58, 209`; `kits/fauna/BIOME-FAUNA-PLAN.md:52-54`) | three hexapods on the breath (section 8) |
| Lineages cross kits as cousins, never copies (`BIO.kin`; `hyperjungle/PLAN-LANDS.md:49-56`) | the rust collar is kin of the Godthrone's iron-eaters; the breath fringe is the trumpet line's dark branch (section 7) |

### Where it breaks a trend, and why the break is earned

- **No iridescence, no glow.** Iridescence and glow are the native signatures (`rift/NOTES.md:94-105`;
  `throne/NOTES.md:80`), and both are optical signals that pay only where there is an audience. The gill life lives in
  the dark and is pollinated by the breath, so it has no audience and no colour but its chemistry: bone white, rust
  black, the wet sheen of a manganese crust. The one iridescent thing here is borrowed and lives in the light: the
  ehighlands glass tower on the high north. This is the Outlands' and the W outer wall's lesson too: a native biome
  is told by one alien idea applied to everything, not by the family colours.
- **Chemistry stated.** The notes say where native life began and what it looks like, never how it works (the
  digest's first open hook). Trend 7 of the second digest keeps Earth life's chemistry Earth's where it is Earth's
  (`biomes/geyser/NOTES.md:155-156`); nothing has been said of the native lineage's. This plan proposes one rule: the
  native body is a host that takes a partner, and the partner decides whether it lives on light or on redox. It is
  deliberately the smallest rule that explains the Gills, the Throne's vent life (sulphur partners), the Godthrone's
  iron-eaters and the ordinary caps and pads (light partners), and it leaves the Ranj enigma open (the "something of
  Krator's own biosphere" the Ranj fungus needs, `throne/NOTES.md:126-127`, could be a partner that only vent ground
  supplies).

## 3. The physics, honestly

- **The tide.** Krator orbits its giant in 24 h; a Saturn-class primary puts the orbit near 190,000 km (Day, the Io-like
  moon at 12 h, sits at ~122,000 km: the 2:1 ratio checks). The static tidal bulge of a body this size at that distance
  is kilometres; the daily part of it, from an eccentricity of 0.01, is of the order of **tens of metres** in the rock,
  times the shell's Love number. That is Io's class of tide, and more than the owner's heat flow of 2-5x Earth's
  implies, so the plan treats the tide as the **valve, not the pump**: the fissures need only gape by centimetres to
  halve their resistance. Enceladus's plume output rising at apoapsis as its stripes open is the observed precedent. If
  the owner prefers a smaller tide, nothing in the biome changes but a sentence.
- **The pump.** The conduit system under a swarm (lava tubes, the fissures' own depth, the breccia's voids: `DATA.tubes`
  already holds a tube on this cone, `tube_lesser_06`) is of the order of 10^8-10^9 m3 of warm air. A daily temperature
  swing of 10 degC in the upper system moves 3-4% of it, ~10^7 m3 a day, through a few thousand throats: ~1 m/s mean
  in a 2 m2 throat, gusting to several, as Earth's barometric caves do. The heat-pipe adds a steady flow of its own
  gas, so the out-breath is always warmer and wetter than the air and condenses whenever the air is under about 15 degC:
  most mornings and every night on this plateau (mean 5-9 degC, coldest month -4 to -8).
- **The phase walks round the clock once a year.** The libration is sidereal (`ph = 2 pi t x 1.0027379`,
  `89-atmos-e-skymodel.js:136`), as Day's transit hour is ("its crossing hour drifts ~4 minutes a day against the sun",
  `SKY-PLAN.md:110`). So the out-breath comes at dawn in one season, at noon a quarter-year later, at midnight half a
  year on. The Nomads' calendar for the plateau is the hour of the breath. A page chooses its date and gets its hour.
- **The chemistry.** Serpentinization of olivine-rich rock gives H2 (and CH4 where CO2 is present) and brucite-
  carbonate fluids at pH 9-11, 40-90 degC: Lost City's numbers. In air with 0.21 atm O2 a hydrogen-methane seep ignites
  readily (Chimaera's eternal flames in Turkey are a serpentinite methane seep that has burned for millennia): where a
  throat's gas is dry and fast it burns, and the Gills have **candles** (section 11, station 3). The oxide-charging
  mantle is Earth's ferromanganese crust chemistry (Mn(II) oxidised to Mn(IV) by microbes, reduced again by H2S and
  H2) with the organism doing it on a daily cycle; the laminae are stromatolite laminae with a daily period, as some
  Earth stromatolites have.
- **Sound and light.** The breath is audible: a plateau-wide low drone on the out-breath, a hiss on the in-breath,
  carried farther in Krator's air than in Earth's. The out-breath's warm column over a cold plateau gives the strong
  mirage the dense-air notes promise (`biomes/WORLD.md`, "Mirages are about twice as strong"): the far pipes shimmer and
  lift at the breath hour. Neither is a feature of its own (the horn pipes and the howl bamboo own wind-sound); they are
  the breath's tells.

## 4. Ideas considered and set aside

1. **The gas shore.** A sealed deep sump where the heat-pipe's CO2 pools into a permanent lake of gas with a visible
   surface (the refraction step), a dead shore, and life floating on the interface in bladders of lighter gas.
   Set aside: physically fragile (any wind mixes it), the mat and the CO2 hollows already own the small version
   (`throne/NOTES.md:170-173, 277`), and gas bladders are the Loom-Chasms' idea. Its one good image, the pooled heavy
   exhale, is kept as a hazard in the gills' sumps.
2. **The wired marsh.** Cable bacteria at landscape scale: a salt marsh whose mud is one living conductor, oxidation at
   the surface and reduction a metre down, electrons carried between them through kilometres of filament, so that the
   whole marsh is one circuit and a lightning strike or an Ancient's dynamo is food. Alien, and the Gills' honest rival:
   both are about separating the two halves of a redox reaction. Set aside because it separates them in space, which
   Earth's cable bacteria already do, and because nothing in it needs Krator. It would be a good small-and-weird layer
   on an abyssal salt marsh later.
3. **The eclipse bloom.** Life that lives only through the two eclipse seasons, when the sun goes behind the giant for
   two hours a day for two and a half months round each equinox (`LORE.md` section 2), dormant otherwise: a desert that
   wakes for ten weeks twice a year. Krator-only, but it is a timing skin on a bloom, and the Double Dark already
   carries the sky's calendar weight for the cultures.
4. **The cliff lung.** Organisms that span the Inner Wall's 2-4 km scarps as living flues, the stack effect between
   1.9 atm at the foot and 1.0 atm at the crest driving air up through them. Set aside: the siphon tree
   (`throne/NOTES.md:218`) and the Siphon Pits' woolly siphon already own the chimney organism, and it is a skin on a
   cliff rather than a new ecology.

The Gills beat them because the mechanism is one sentence, it is visible every day from a kilometre away, it needs
Krator (a locked moon with an eccentric orbit, a heat-pipe crust, dense oxygen-rich air), and it reorganises time,
land and organism together rather than one of them.

## 5. Where it is on the model (scale model 5.1, surveyed 2026-11-02)

The **Lesser Throne**: `DATA.vents` px **1130,854**, the model's second volcano (`tools/scale-model/README.md`, "5.0 &
5.1": WNW rim 6,880 m, crater floor 6,070 m), inside the `e inner wall` biome polygon and the `Lesser Throne` political
polygon (6,004 km2), 560 km east of the Throne. `LORE.md` 6.15: it erupted after the Cataclysm and buried the History
Monks' first monastery, which `DATA.tubes` places in a lava tube on its east flank (`tube_lesser_06`, px 1133,855 to
1151,865: "Entombed First Monastery Lava-Tube Vaults").

The cone falls from the rim to a plateau: the median height on the ring 32 km from the summit is 3,854 m, at 40 km
3,510 m. North and north-east of it the plateau runs on at 3.2-4.3 km for 100 km (BSk, Dsb, Dsc; 150-300 mm) before
rising to the Inner Wall's crest at 4.5-5.6 km. East and south-east it falls to the eastern desert at 1-2 km (BWh, the
Nomads' country) within 40 km. West it drops 2.6 km in 40 km into the hyperjungle, and that face takes **4,000 mm** a
year (px 1090,854): the aquifer the gills breathe from.

*Proposed* polygon `gills` (biome), cut from `e inner wall`: px `[1100,800] [1125,785] [1150,792] [1163,815] [1165,850]
[1158,880] [1140,902] [1114,898] [1098,870] [1095,835]`. **26,352 km2**; it overlaps the `Lesser Throne` political
polygon whole (6,004 km2), Nomad Country for 5,332 km2 and the `sedesert` biome for 2,096 km2 at its south-east foot
(an ecotone; the sedesert polygon keeps its ground).

| Band | km2 | Air | Rain | Mean (warm/cold) | Extremes | Wind | Classes |
|---|---|---|---|---|---|---|---|
| 1.0-2.5 km (the SE foot) | 3,880 | 1.24 atm | 125 mm | +14 (25/3) | +34/-6 | 9.4 m/s | BWh, BWk, BSh |
| 2.5-3.0 km | 2,868 | 1.13 | 157 | +11 (24/-2) | +33/-11 | 7.9 | BSk, BWk |
| 3.0-3.5 km | 4,476 | 1.06 | 188 | +8 (21/-5) | +31/-14 | 7.2 | BSk, Dsb, Dfb |
| **3.5-4.0 km (the gill country)** | **10,644** | **1.01** | **392** | **+6 (19/-7)** | **+27/-16** | 6.1 | Dsb, Dfb, Dsc, BSk |
| 4.0-4.5 km | 2,748 | 0.96 | 314 | +3 (16/-10) | +26/-19 | 5.9 | Dfb, ET, Dfc |
| 4.5-5.5 km (the cone) | 1,072 | 0.87 | 204 | -2 (11/-15) | +21/-24 | 6.6 | ET, EF |
| 5.5-6.9 km (the summit) | 648 | 0.75 | 125 | -9 (4/-22) | +14/-32 | 6.9 | EF, HT |

- **Air:** 1.0 atm over most of it. Anyone can breathe here unadapted, which no other native biome allows: the Throne's
  lee is in the abyss cough, the Outlands behind a 0.6 atm gate, the Rift at 1.9 atm. The Gills are the alien biome a
  highland traveller can walk into.
- **Water:** no rivers inside the gill country (the plateau's six wadis are dry: `Wadi al-Layl` and its fellows run
  off the south-east foot to the desert). The gills are the plateau's springs: every out-breath drops alkaline mist on
  a strip downwind of each crack, and the strips are the only green between the cracks.
- **Neighbours:** `ehighlands` on the `e inner wall` polygon north and west (the cushions lean toward the giant on the
  high plateau; its station 2, the rainy west face, is the aquifer's catchment; its notes already put "snow-capped
  volcanoes on every horizon, one with a plume": this is that one), `sedesert` south and east (the steppe fringe,
  `biomes/sedesert/PLAN-STEPPE.md`, then the red desert; **Shade** 207 km south-east at px 1229,885), the hyperjungle
  below the west face (steep, out of reach), the painted highlands 300 km north. Settlements within 250 km: Fort Ordo
  (ruin, 147 km W), Girder (184 km SW), Talia and the Monks' Keepwell (205 km SW), Shade (207 km SE), the Flooded Tower
  (206 km W), Mav's Refuge (232 km W).
- **Who holds it:** nobody. Nomad Country reaches up the south-east foot; the Empire of Iziz's polygon touches the
  south corner (128 km2). It is in `little demo`'s box, so `openworld/little-demo` will stream it.

*Proposed* map changes (none made): the `gills` polygon above; a note on the `Lesser Throne` vent that its flows are
young (section 10); no height, rain or river changes. The fissures are kit-scale (tens of metres) and are made by the
kit's own fields, not by the model.

## 6. The ground and the landforms (`core/terrain`)

- **The plateau** (`KFIELD`): the model's heights at 1:1 with the kit's own relief, rolling ground of frost-shattered
  megabreccia (`KSTRATA` formation `megabreccia`, the Inner Wall's core rock, `biomes/godthrone/PLAN.md` section 3) under
  a thin steppe soil; patterned ground on the high north (`KFROST` polygons, `42-core-frost.js`).
- **The gills** (`KCAVERN` trenches, the kit's own layout): a radial-and-ring swarm centred on the Lesser Throne, the
  radial cracks 200 m to 3 km long on bearings from the summit, the ring cracks shorter and curved, 10-90 m across,
  100-400 m deep, walls near vertical, floors of fallen pipe rubble and brine pools. Each gill is a `KCAVERN.trench`
  cut from the field, its throats (`KCAVERN.shaft`) running from the floor down into the conduit system (drawn only as
  dark mouths with a breath; not walked). Placed by `KRAND` from (world, cell, index, salt): a gill's position, bearing,
  length and age are hashes, never counts.
- **The breath pipes** (`KSTACKS`, a *proposed* kind `chimney`, section 14): hollow laminated columns 10-90 m tall
  along both lips of every gill and down the walls on ledges, in rows where a lip has breathed longest; fallen pipes
  lying across the floor; stumps; rubble fans of broken rings. A pipe is a `KSTACKS` body (collision, ledges, LOD from
  the record) whose bore is a `KCAVERN.shaft`, so a walker can look down one. Its laminae come from a `KSTRATA` recipe
  *proposed* as `lamina` (section 14): daily couplets 0.2-0.4 mm, a thicker pale ring at each year's wet season, the
  black Lesser Throne ash band (section 10) in every pipe older than the eruption.
- **The breath meadows** (`KRELIEF`, a strip field): a soft mask downwind of each gill (the wind raster says the wind
  here is 6-9 m/s from the north-west), wet and alkaline, where the mist falls: white carbonate dust on everything, a
  travertine apron at the lip (`core/water` terraces, `ext/53`), brine pools in the floor (`WATER.spring` with the
  geyser kit's temperature ramp, `core/water/geyser/`, kind `pool`: milky, 40-70 degC, drawing a steam column on the
  out-breath only).
- **The candles** (station 3): dry gills on the warm east flank whose throats burn: a flame mesh on core/atmos's fire
  chunk, `KHAZ` kind `heat`, orange-black heat crust round the mouth.
- **The lava edge** (station 4): the Lesser Throne's young flows (`KLAVA` run once at build time and written back, as
  the Godthrone's vent page does: `core/terrain/LAVA.md`) over the inner gills: pipes half-entombed in aa and
  pahoehoe (`ground.lava.aa`, `ground.lava.crust`), a live gill breathing through a skylight in the flow, the buried
  tube's line marked on the surface by a row of collapse pits (`KRELIEF.tube`).
- **The far field and the horizon** (`KFAR`, `KHORIZON`): the cone 25 km off, the Inner Wall's crest to the north, the
  desert's haze to the east, the gill swarm's far stripes of steam at the breath hour drawn as sprites in the far field.

Fields and seeds are deterministic from the terrain (`KRAND` by cell), as every kit's.

## 7. The flora: native, the breath's

**The rule that keeps it one family:** every species answers the breath. It stores oxidant, or rides the gust, or lives
on what the breath drops. Nothing has leaves; nothing glows; nothing is iridescent. Palette: bone white, rust black,
the wet grey-black of a manganese crust, travertine cream, one vivid thing (the breath fringe's red-orange filaments, iron
coloured). Working names.

### The pipe builders (the throats and the lips)

| Key | Name | Where | What it is |
|---|---|---|---|
| `pipe` | **Breath pipe** | every lip and ledge of a live gill; dead ones everywhere a gill once breathed | the chimney organism: a bone-white column 10-90 m, a living collar of grey flesh at its mouth, the bore banded white and black. Lays one lamina a day. Steams on the out-breath; its collar darkens (charges) on the in-breath. The dead body is a `KSTACKS` chimney; the collar a `BIO.fung` ring |
| `collar` | **Rust collar** | the lips of young gills before a pipe has grown; the walls | the lining itself, a flat fleshy sheet 1-3 m across under a botryoidal black oxide crust, which goes from matte black (charged) to wet rust-brown (discharged) through the day: the biome's clock face. Kin (`BIO.kin`) of the Godthrone's iron-eaters (`godthrone/PLAN.md:195-200`) |
| `bellows` | **Bellows pad** | across narrow throats and cracks | a taut translucent membrane 1-4 m across stretched over a crack, which bulges up on the out-breath and sinks on the in-breath: a diaphragm that meters the flow and traps spores and dust on its underside. The biome's one moving plant, on `BIO.animHook` driven by `GILLS.breath(t)` |
| `fringe` | **Breath fringe** | the mouths of pipes and throats | red-orange filaments a metre long streaming out of a mouth on the out-breath and sucked flat into it on the in-breath; the dark branch of the trumpet-tree line (a funnel turned inside out: the trumpet catches water, the fringe catches the breath) |
| `lamp` | **Throat lamp** (optional) | deep in the throats, out of the daylight | a pale soft disc that, uniquely here, does glow, faint and blue, and only on the in-breath: the one concession to "glow pays when it is dim" (`throne/NOTES.md:80`), there to show a walker the throat is drawing. The owner can strike it |

### The breath meadows (what the mist feeds)

| Key | Name | Where | What it is |
|---|---|---|---|
| `dewmat` | **Dew mat** | the strip downwind of every gill | a low fleshy mat that whitens with carbonate every morning and darkens as it dries: the strips' ground cover |
| `saltcup` | **Salt cup** | the meadows' outer edge | a cup 30-60 cm across that fills with condensate on the out-breath and holds it through the day: the plateau's water, drunk by animals and Nomads |
| `whitewood` | **Whitewood** | the meadows' inner band, the travertine aprons | a stubby fungoid tree 3-6 m, its caps crusted white with the mist's lime (the Farside spray coral's trick, `farside/PLAN.md`, here on a native), pale pink flesh where the crust flakes |
| `rollbead` | **Tide bead** | the meadows and the lips | the small-and-weird: hollow spheres 5-20 cm that the out-breath rolls away from a gill and the in-breath rolls back, so a field of them creeps out and in twice a day and the floor of every gill is drifted with them. A seed body |

### The dry ground between (Earth's, read in place)

- `biomes/sedesert` steppe fringe (`PLAN-STEPPE.md`): bunchgrass, umbrella thorn, myrrh at the dry south-east foot; its
  **sun-dial** and **drift lantern** on the lower plateau (the lantern's globes fetch up against the pipes, as they do
  against the tors).
- `biomes/ehighlands`: the poured cushion, woolback and thorn cushion on the high north (4-4.8 km), all leaning toward
  the giant (`39-core-lean.js`), and the **glass tower** on the cone's scree: the only glass and the only iridescence in
  the biome, and it is a guest.

### The dry east scarp and the lava

The Lesser Throne's young flows carry the Throne's lava pioneers by kin (glassfern first on fresh rock,
`throne/NOTES.md:307-311`), nothing else; the candles' heat crust is `collar` in a heat habit.

## 8. Fauna (`kits/fauna`)

Native, vertebrate-grade hexapods on `faWdHex`'s `amb` anatomy (`kits/fauna/BIOME-FAUNA-PLAN.md:52-54`), named here and
built there, drawn in the biome from the fauna bundle, never in the kit.

| Key | Name | Status | What it does |
|---|---|---|---|
| `cinder_crawler` | cinder crawler | in `kits/fauna` (vents) | read in place: grazes the rust collars' fringes on the lips by day |
| `frost_trunker` | frost trunker | in `kits/fauna` (cold plateau) | read in place: the high north's grazer, drinks at the salt cups |
| `breathrider` | **Breath-rider** | new | a soaring six-limbed glider (kin of the hyperjungle's fang glider, `BIOME-FAUNA-PLAN.md:57`) that lifts on the out-breath's thermals from every gill and hunts the tide beads' eaters; the sky over a breathing swarm is full of them for three hours and empty the rest of the day |
| `throatmaw` | **Throat maw** | new | an ambusher that hangs in a throat on the in-breath, mouth to the draught, taking what the breath pulls down: the gill's hazard `hunter` (section 9); kin of the Rift's gapemaw |
| `beadrunner` | **Bead-runner** | new | a hare-sized hexapod that follows the tide beads out and back, the plateau's most common animal and the maw's food |

The herds "have nothing to run from" is the owed gap in two kits (`hyperjungle/NOTES.md:77`); here the predator is
the breath and the thing in it.

## 9. Resources, crops, hazards, people

- **Ore** (`kits/resources`): a dead pipe is a ferromanganese crust 50 m tall. Earth's are the richest cobalt,
  nickel and rare-earth deposits known. *Proposed*: owner nodes of family `rare-earth` and `iron` at the pipe fields,
  grade from the field's age (`RES_GEO` owner nodes and deltas apply by id last, `kits/resources/GEOLOGY.md`); the
  Geomancers of Yuni and the Republic's Mint would want it, the Nomads would sell it. No new family.
- **Fuel**: the out-breath is hydrogen and methane. A throat capped with a Nomad's hide bell gives a clean flame for
  three hours a day; a candle gives it all day. *Proposed* as the Nomads' smelting fuel on the plateau and a thing the
  Eternal State or Yuni would study (the owner's call; it touches the energy lore).
- **Medicine** (`kits/crops`, zone `gills`, `how: node`): **lung salt**, scraped from a charged rust collar at the end of
  the in-breath: an oxygen-carrying salt the Nomads chew on the climb to the Inner Wall's passes and sell to caravans for
  the abyss cough's opposite, the thin-air sickness. Dalab's genepriests want it (pressure adaptation is their trade,
  `LORE.md` section 2). The dangerous version is the discharged collar at the end of the out-breath, which is a
  sulphide: the same plant, two uses, as the glass tower's pallidine (`ehighlands/NOTES.md:158-168`).
- **Food**: tide beads roasted (the one fruit, catalogued in `FRUIT.md`'s way); salt cups for water.
- **Dye**: the oxide crust gives the Nomads a black and the collar's brown.
- **Hazards** (`core/hazard`, every one a `core/tags` record with `tags.hazard` registered before it is drawn,
  `cycle.offset` from `GILLS.breath`): the **in-breath** at a throat (`grab`, hold: it pulls; danger .7 at the mouth, a
  `move` that slows a walker toward it), the **out-breath**'s pooled gas in the gills' sumps (`gas`, suffocate: CO2 and
  H2S settling in the deep reaches; danger 1 on the floor, 0 two metres up), the **candles** (`heat`, burn, steady), a
  lip's rotten rings (`fall`), the throat maw (`hunter`, cycled on the in-breath). The tell is the clock: the giant's
  nod and the collars' colour say which hazard is on.
- **People**: no one lives here. The **Eastern Nomads** (Nomad Country covers the south-east foot; Shade 207 km) come up
  for lung salt, ore, water at the cups and the breath's fuel, and name the gills; their dawn-and-dusk worship of the
  Deep Aquifer (`LORE.md` 6.8) sits well beside a plateau whose water comes out of the ground at an hour the sky
  announces. *Proposed*: the **History Monks** keep a hermitage of two or three in a dead pipe field (section 10);
  Keepwell at Talia is 205 km away. Hazard to all: the Lesser Throne is live.

## 10. The pipes as a calendar (*proposed* lore)

A breath pipe lays one couplet a day, 0.2-0.4 mm; a wet season leaves a thicker pale ring once a year; so a pipe's
rings are days and years that anyone can count, and the tallest standing pipes (80-90 m, 0.75 g) are some 1,200 to
1,500 years old at the base. Two bands run through every pipe old enough to hold them:

1. **The black band**, near the top: the Lesser Throne's eruption, a sharp lamina of ash, in every pipe on the plateau.
   Count the rings above it and you have the eruption's date to the day. (`LORE.md` 6.15 puts the eruption after the
   Cataclysm, when the Order had already formed.)
2. **The thin years**, deeper: a run of years whose laminae are thin, dark and uneven in every pipe that reaches them,
   below which the rings are thick and regular. The Monks read it as the Cataclysm: a dimmed sky and a shaken ground
   for a decade. What it actually records is the owner's to say.

`LORE.md` section 12 lists "When the Ancients fell" among the contradictions ("a thousand years" at Yuni and Iziz,
"millennia" elsewhere). The Gills are the one place on Krator where the answer is written in something no one could
have forged, and only the Order knows how to read it, which is why two or three Monks live in a pipe field counting,
and why the Order lost its first house to the very volcano whose ash is the band they count from. The owner may want
the thin years to mean something else, or to keep the count ambiguous (pipes break; the oldest are fallen and the
fallen weather); the plan only puts the record in the ground.

## 11. Stations

Each station takes the date (so the breath hour) from its `99-host-take.js`; the host's time control moves through
the breath. The breath state `GILLS.breath(t)` in `0..1` (out-breath 1, in-breath 0, with the ramps) drives the steam,
the collars' colour, the bellows pads, the fringes, the beads, the hazards and the breath-riders together.

1. **The Gill** (`dist/gills.html`, px 1138,822: 3,174 m, 1.08 atm, 188 mm, BSk, +9 degC, 22/-4; the north-north-east
   plateau). One great radial gill 1.6 km long and 60 m across, 300 m deep, both lips lined with breath pipes, the walls
   stepped with collars and fringes, bellows pads across the side cracks, the breath meadow running away south-east
   under a white dusting, the cone 20 km off with its plume. Set in spring, with the out-breath at dawn. **The first ten
   seconds**: the camera stands on the lip in blue pre-dawn with the giant huge in the north-east; as the sun rises the
   whole 1.6 km of the crack begins to steam at once, the wall of mist climbs and tips downwind over the meadow, the
   pipes sing, the beads roll away, and the breath-riders lift off the lips one after another. The in-breath preset
   shows the same place six hours on: dry, silent but for the hiss, the collars black, the fringes sucked flat, dust
   streaming down into the throats, a bead-runner fighting the draught.
2. **The pipe field** (`-pipes`, px 1128,812: 3,774 m, 1.0 atm, 235 mm, Dfb, +5 degC): a dead gill, closed by the
   tide's slow shift of the swarm, its hundreds of pipes standing white and silent, fallen ones across the floor, rubble
   fans of broken rings, one lip at the far end still breathing; the Monks' two cells built into a pipe's base (a
   placement site only: the building is a settlement's), their count cut into the bore; the Nomads' ore scrapes.
3. **The candles** (`-candles`, px 1152,845: 2,850 m, 1.12 atm, 157 mm, BSk, +11 degC; the warm east flank): short dry
   gills whose gas burns: blue flames a metre tall at the throats, invisible at noon, plain at dusk, the heat crust
   round each, the Nomads' smelting hearths and slag, the desert opening below.
4. **The lava edge** (`-edge`, px 1146,870: 3,361 m, 1.05 atm, 157 mm, BSk, +7 degC; the south-east flank): the young
   flows over the inner gills, pipes entombed to their collars, one gill breathing through a skylight, the row of
   collapse pits over the buried tube running up toward the summit, glassfern on the aa; the cone filling the sky.
5. **The frost gills** (`-frost`, optional; px 1130,795: 3,960 m, 0.98 atm, 204 mm, +4 degC, 17/-9; the high north):
   gills among ehighlands' cushions, which all lean toward the giant while the pipes' steam leans downwind; rime on
   every lip on the in-breath, melting on the out-breath; `ice.rust` and `ice.aufeis` on the floors; snow in the lee.

## 12. How it reads, and what it costs

- **Geometry.** A pipe is a low-poly hollow tube (24-40 segments, 4-8 rings, ~500 tris) with the laminae in its shader
  (`KSTRATA` lamina recipe: 0 extra tris), instanced per variant (`32-core-variants.js`, 12-16 variants by height and
  lean); 3,000 pipes in view are ~1.5 M tris and a dozen draws. The collars, fringes and pads are `BIO.fung` items on
  the core's instancing (`33-core-fungoid.js`). The gill walls are the field's own mesh with a `KCAVERN` trench cut.
  Target: **under 6 M triangles and 60 draw calls per view** on the integrated GPU, measured as the Godthrone's
  `PERF.md` measures (its pages run 2-3 M tris, 20-35 calls, 12-25 ms sync on the Arc 140T).
- **The breath.** Steam is core/atmos's smoke kind on a few hundred emitters whose rate is `GILLS.breath(t)`; the mist
  wall over the meadow is the height fog's pooled layer (`sky/89-atmos-j-fog.js` `fogPool`) with its density on the same
  function; the far gills' steam is sprites in `KFAR`. No per-frame CPU work: everything reads the clock.
- **Motion.** Bellows pads, fringes and beads move in the vertex shader (`BIO.animHook`, a `breath` mode: a scalar
  uniform from `GILLS.breath`), so a thousand of them cost nothing per frame. The breath-riders are `kits/fauna` orbit
  animals whose count fades with the breath.
- **Light.** The shared sky; the giant's nod is already in the sky model; the collars' albedo and the mist's density are
  the biome's tells. Night: no bioluminescence but the candles and the optional throat lamps; giantshine on the white
  pipes is the night picture.
- **Godot.** Everything above is data on the clock: the pipes are `KSTACKS` records, the gills `KCAVERN` voids, the
  breath a pure function with a GDScript twin, the hazards `Area3D`s with `cycle.offset`, the steam the atmos
  particles' export. Nothing needs a builder to port.

## 13. Core adoption (written before the first fragment, as `CLAUDE.md` asks)

Start from `biomes/godthrone` (the newest station kit on the full core, with `KLAVA` and `KHAZ`) and
`biomes/abyssal-savannah` (the newest station-1 kit). The modules the kit takes, by name, and for each it does not, why:

| Module | Takes | For |
|---|---|---|
| `core/biome` | `10-core-head`, `20-core-kit` (`BIO.INDEX_ITEMS`, LOD merge/fade/cull), `30-core-foliage` (ground tint, A2C, back-light, the one wind), `31b-core-leafset`, `32-core-variants`, `33-core-fungoid` (`BIO.fung`: collars, pads, whitewood caps, dew mat), `34-core-impostor` (far pipes and whitewood), `35-core-anim` (the breath mode: *proposed*, section 14), `39-core-lean` (ehighlands' cushions in place lean to the giant), `40-core-place`, `42`/`43-core-export(-host)`, `44-core-stage` | every species on the core's builders and items |
| `core/rand` | `KRAND` | every field, every gill, pipe and bead cell (`KRAND.hash(world, ix, iz, salt)`); no sin hash, no stream |
| `core/tags` | `50`, `52`, `53` | every pipe, collar, pad, bead, pool and hazard a record (`BIO.init({tags})`) |
| `core/space` | `KSPACE` | the keep-clear between pipes and the nearest-gill index the meadows and hazards read |
| `core/hazard` | `KHAZ` (`20-core-hazard.js`) | the in-breath's grab, the sumps' gas, the candles' heat, the lips' fall, the maw's hunter, each cycled on the tide |
| `core/clock` | `KCLOCK` (`C.day`, `C.hour`) | the date and hour, so the breath's phase is the sky's |
| `core/terrain` | `30-core-field` + brush, `35-core-strata` + host shade (`megabreccia`; `lamina` *proposed*), `37-core-stacks` (`chimney` *proposed*; `tor`, `dome` on the plateau), `38-core-relief` (`tube` for the collapse pits, `pavement`, `talus`, the strip field), `39-core-cavern` (`trench`, `shaft`), `42-core-frost` (station 5), `43-core-ground` (`KGROUND` library layers, `clast` kind for the breccia), `44-core-farfield` + draw, `45-core-horizon` + shade, `46-core-lava` (station 4, run at build time) | the plateau, the gills, the pipes, the lava, the far country |
| `core/atmos` | the core, presets, export, waves, skylight, `bindHost`, the shared sky (the giant's libration), `bindWeather`, height fog (`fogPool`), `3-particles` (steam), `3d-dust` (the in-breath's dust), lava fx (station 4) | the sky, the breath's steam and mist, the light |
| `core/water` | `20`, `21`, `22`, `50`, `51`, `geyser/52` + draw (`WATER.spring`), `ext/53` + draw (the travertine aprons), `ext/57` (the audit) | the brine pools, the aprons, wet ground under the mist |
| `core/host` | `FULL` (camera, loop, clock, panel, probe, inspector, marks, pictures, minimap) | the page shell; the probe checks section 16's invariants |
| `core/materials` | `record` (`KMAT`) and the generated pack (`materials.json`, `tools/textures/pack.py`) | every library set (section 15) |
| `core/export` | `07`, `09` | the krator-world container; the hazards section |

Not taken: `core/mask` (nothing is placed from a canvas), `core/city`, `core/hamlet`, `core/camp`, `core/simulation`,
`core/furnish` (no settlement: the Monks' cells and the Nomads' hearths are placement sites published as plain data, the
way swhighlands' pillar rim publishes `SWHI_PILLARS_SITE`), `core/lod` (the biome core's runtime LOD covers it),
`core/walk` beyond what `KCAVERN` writes (the throats are not walked), `33b-core-bamboo`, `36-core-walker`,
`37-core-traps` (no carnivorous plants: the hunter is an animal), `38-core-fire` (the candles are steady flames on the
atmos chunk, not a spreading fire), the season (one season a page; the date sets the breath hour). `kits/crops`: the
`gills` zone and the lung salt record only; nothing is farmed.

`tools/check_core_use.py` runs before the first station is called done.

## 14. New in core (each small, each a proposal)

1. **`ATMOS.libration(t)` as data.** The sky model already computes the nod and the swing
   (`89-atmos-e-skymodel.js:136`); expose them (and the phase in `0..1`) as a `[G data]` function the kit, the hazards and
   Godot read, so the breath and the picture of the giant can never disagree. `GILLS.breath(t)` is a shaped function of
   it (a ramp up, a plateau of about three hours, a ramp down, a long in-breath), as the geyser's cycle is of its period.
2. **`KSTACKS` kind `chimney`.** A hollow laminated column: footprint, bore radius, a flared or broken top, a lean, a
   collapse state (standing, broken, fallen as a `KSTACKS` body on its side, rubble fan); `topAt` and `ledge` as the
   other kinds; the bore a `KCAVERN.shaft` the mesh agrees with. Beside `pillar` and `mound` in `KINDS`.
3. **`KSTRATA` recipe `lamina`.** Sub-millimetre couplets (two colours), an annual thicker band, and authored marker
   bands at given depths (the black band, the thin years), on a column measured from the top down (a pipe grows up, so
   its age is read from the lip). `S.at` gives the lamina's day for any point, so the inspector can say "day 412,117 of
   this pipe".
4. **`BIO.animHook` mode `breath`.** A scalar uniform (the breath state) that scales a per-item displacement: a pad's
   bulge, a fringe's streaming, a bead's roll along its own vector. One uniform, no per-frame work.
5. **`KHAZ` on an authored phase from the sky.** `cycle.offset` exists; the kit sets it from `ATMOS.libration`. No new
   kind: `grab` with `move` is the in-breath, `gas` the sumps, `heat` the candles, `hunter` the maw. Worth checking that
   a `grab` whose `move` points toward the record's core reads right in the Godot `Area3D` mapping.
6. **`KFAR` sprites.** The far gills' steam as a few hundred sprites in the far field, scaled by the breath; `KFAR.grid`
   carries colour and height today, not sprites. Small.

Nothing else is new. The gills are `KCAVERN` trenches, the plateau a `KFIELD`, the pools `WATER.spring`, the lava
`KLAVA`.

## 15. Textures

Read the library first (`core/materials/PLAN.md`). **Reuse:** `ground.travertine.white`, `stone.geyserite`,
`ground.sinter`, `ground.rust.terrace`, `ground.soda.crust`, `rock.gossan` (the oxidised iron cap: the collars' crust from
afar), `rock.megabreccia`, `rock.basalt.flowbanded`, `ground.lava.aa`, `ground.lava.crust`, `ground.steppe`, `ground.puna`,
`surface.cushion`, `card.ichu`, `card.stipa`, `card.grass.dry`, `ice.rust`, `ice.aufeis`, `organic.pleat.skin` (the
bellows pad), `organic.flesh.cells`, `organic.coil.ribbed`, `organic.tendril.banded`, `ground.mat.thermal`,
`organic.lichen.plates`, `ground.turf.polygon`.

**To source or generate** (generic ids; prompts below, paste-ready, to go into `core/materials/PROMPTS-NEEDED.md` on
approval, never a procedural stand-in without saying so):

- `rock.lamina.pipe`: the pipe wall, cut: fine daily couplets. Tintable.
- `mineral.crust.ferromanganese`: the rust collar's wet black botryoidal crust. Full colour.
- `card.breathfringe`: the fringe's filaments, a cut-out on magenta.
- `card.turf.limed`: the breath meadow's whitened grass and mat, a cut-out.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view,
perfectly flat surface filling the whole frame edge to edge. Flat, even,
shadowless lighting, as if scanned: no highlights, no vignette, no shading
gradient across the image. No perspective, no objects, no text, no border,
no watermark. The left edge must continue into the right edge and the top
into the bottom. Material: a polished cross-section of a mineral chimney wall
made of thousands of hair-fine parallel laminae, alternating pale cream carbonate
and near-black oxide, each couplet a fraction of a millimetre, with a slightly
thicker pale band every few hundred couplets and one sharp black band; the
laminae gently wavy and continuous across the frame, a few hairline cracks.
Keep colours natural but slightly muted and even, so the texture can be
tinted to different palettes without looking stained.
```

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view,
perfectly flat surface filling the whole frame edge to edge. Flat, even,
shadowless lighting, as if scanned: no highlights, no vignette, no shading
gradient across the image. No perspective, no objects, no text, no border,
no watermark. The left edge must continue into the right edge and the top
into the bottom. Material: a wet botryoidal ferromanganese crust, rounded
knobs of near-black manganese oxide (#1a1816) packed edge to edge, each knob
with a faint grey-blue sheen, rust-brown (#6b3a1e) staining in the hollows
between knobs and a few patches where the crust has flaked to show cream
carbonate (#d9cfb8) underneath. Full colour: not tinted.
```

```
Flat sheet of cut-outs, square, 2048x2048, on a solid flat bright magenta
background (#ff00ff); no magenta, pink or purple anywhere in the subject; no
grey or white background. Flat, even, shadowless lighting. Subject: six
separate tufts of long fine filaments, each tuft rooted at a small grey
fleshy knob and streaming to one side as if in a steady wind, the filaments
rust-red to orange (#a83c1a to #d9742a), translucent at the tips, some
beaded with droplets. No text, no border, no watermark.
```

```
Flat sheet of cut-outs, square, 2048x2048, on a solid flat bright magenta
background (#ff00ff); no magenta, pink or purple anywhere in the subject; no
grey or white background. Flat, even, shadowless lighting. Subject: eight
separate clumps of short steppe grass and low fleshy mat, each dusted and
crusted with fine white lime so the blades are pale grey-white on their
upper sides and dull green-brown underneath, a few blades clean green; no
flowers. No text, no border, no watermark.
```

Reference images to collect into `refs/`: Lost City's carbonate chimneys (the pipes' form), Chimaera's flames (the
candles), ferromanganese crust sections (the collars and laminae), Wind Cave's breathing entrance, Enceladus's tiger
stripes from orbit (the swarm's plan), Daliangshan's and Iceland's fissure swarms (the gills from the ground).

## 16. Order of work

- **G0.** The owner's yes or no on the mechanism, the site, the lineage rule, the calendar, the names, the throat lamp
  (section 17); the texture prompts moved to `PROMPTS-NEEDED.md`; the `gills` polygon drawn on the model.
- **G1.** `ATMOS.libration`, `GILLS.breath` and its node test (the phase against the sky model, the drift of the hour
  through a year, determinism); the hazard records cycled on it.
- **G2.** The ground: the plateau on `KFIELD`, the gill swarm as `KCAVERN` trenches and shafts, the strip field; the
  `chimney` kind and the `lamina` recipe with their tests; the pipes placed from the gills' ages.
- **G3.** The flora: pipes, collars, pads, fringes, dew mat, salt cup, whitewood, beads; the `breath` anim mode; the
  two kits read in place.
- **G4.** The breath itself: steam emitters, the pooled fog, the far sprites, the collars' colour, the brine pools on
  `WATER.spring`; station 1 with its two presets (out-breath, in-breath).
- **G5.** Stations 2-4; the lava edge on `KLAVA`; the Monks' and Nomads' sites published as data; station 5 if wanted.
- **G6.** `verify.py --assert` with the probe's invariants: every pipe's lamina count equals its age in days from its
  record; every hazard's phase equals `GILLS.breath`'s; the out-breath preset shows steam at every live throat and the
  in-breath preset none; nothing placed on a lip within its `fall` record's edge; the pipes' height under 90 m; each
  with a negative. `PORT.md`, the index tools, `tools/check_core_use.py`, `python3 tools/port_baseline.py`, the gallery.
- **G7.** `kits/fauna`: the breath-rider, the throat maw, the bead-runner. `kits/crops`: the `gills` zone, lung salt.
  `kits/resources`: the owner nodes.

## 17. Open questions for the owner

1. **The mechanism**: is a daily tidal breath of the ground, phased to the giant's nod, acceptable canon? It touches
   `LORE.md` section 2 (a sentence on the shell's daily tide) and the sky plan (nothing changes there; the kit reads
   what is drawn).
2. **The lineage rule** (*proposed*): "the native body is a host that takes a partner; the partner decides whether it
   lives on light or on redox." The first biochemical statement about Krator's own life. Yes, no, or reworded?
3. **The site**: the Lesser Throne's plateau, cut from `e inner wall`. The alternative with the same mechanism is
   Korona's trench country (ring faults, 2 atm, 40 degC: the breath would be invisible in that air and the biome would
   lose its picture); the plateau is chosen for the visible breath, the 1 atm access, the Monks' buried house and the
   Nomads next door.
4. **The calendar** (section 10): may the pipes record the Lesser Throne's eruption and a band the Monks read as the
   Cataclysm? What do the thin years mean, if anything?
5. **The names**: the Nomads' Dasri word for the gills, the breath, the pipes and the lung salt; whether the kit is
   `gills` or something of the owner's.
6. **The throat lamp**: the one glow, inside the throats on the in-breath. Keep or strike.
7. **Fuel**: may the breath's hydrogen be a thing people burn, and who knows it (the Nomads only, or the State and
   Yuni too)?
8. **The Monks**: a hermitage in the pipe field counting rings, with Keepwell 205 km off. Yes, and in whose name?
9. **The tide's size**: the plan quotes tens of metres in the rock as a plausibility bound and uses the tide only as a
   valve. If the owner wants a number in `LORE.md`, which?
