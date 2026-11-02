# gills: the plan (proposal, 2026-11-02; re-sited and re-shaped the same day)

**The Gills**: cracked volcanic ground where the fissures breathe once a day in time with the giant's nod, and the
only life that can live in the cracks is a life that runs on the breath. The idea in one line: **a metabolism separated
in time, not in space**. Everywhere on Earth a chemosynthetic organism sits where fuel and oxidant meet at once (the
vent's hot sulphide against cold oxygenated water). Here the fuel comes up out of the ground at one hour and the oxidant
blows down into it at another, so the organism is a battery that charges on the in-breath and discharges on the
out-breath, and lays down one ring of its own body for every day it has lived. The land is the lung; the organisms are
its lining; their dead bodies are the landscape.

**Two countries, one lineage** (the owner, 2026-11-02: "porque no los dos"): the **Red Gills** on the Godthrone's south
flank, where the breath is iron brine from under the ice belt, and the **White Gills** over the whole massif of the twin
volcanoes between the Catch and the Vale of Xanadu, from the Catch flank across the pass to the Xanadu side, where it is
alkaline magnesium brine from serpentinized rock. The same life, two chemistries, two colours and two shapes, so a
traveller tells them at a glance (section 7).

**Settled with the owner, 2026-11-02.** (1) **Each country is a station of its host kit, not a kit of its own:** the Red
Gills are stations of `biomes/godthrone`; the White Gills are stations of `biomes/catch` (the Catch flank, the candles,
the pass) and of `biomes/xanadu` (the Xanadu side, Alph's head); `biomes/gills` holds the shared life both read in
place, the way `biomes/geyser` is shared by the Steampits, the ring isles and Korona. (2) **The twins are younger than
the Godthrone but older than the Ancients' colonization of Krator**, so the White Gills are fully developed. (3) The
first draft (commit c1de31bcd) sat on the Lesser Throne; the owner ruled it out, rightly: that volcano erupted less than
a thousand years ago and there has not been time for the ecosystem. It survives here only as an optional nursery
(section 11).

Status: **a proposal for the owner** on what is not settled above. Nothing is built, nothing on the model is changed and
`LORE.md` is untouched. Every lore and map change this plan wants is marked *proposed*. Working names throughout; the
owner's, the Nomads' or the Xanadui's names are better.

## 0. What the kit is

| | |
|---|---|
| Folder | `biomes/gills/` (`src/`, `materials.json`, `tex/`, `refs/`, `BIOME-API.md`, `NOTES.md`, `KNOWN_ISSUES.md`, `PORT.md`, `tests/test-gills.js`): **the shared life, no page of its own.** Its fragments are read in place by the host kits' `build.py` (the pooled-folder rule: each names the fragments it takes), as `biomes/geyser`'s are by Korona's corona station |
| Pages | **stations of the host kits** (the owner, 2026-11-02): `biomes/godthrone/build.py --station gills` -> `dist/godthrone-gills.html` (the Red Gill) and `--station gills-ladder` (the Red ladder); `biomes/catch/build.py --station gills` -> `dist/catch-gills.html` (the White Gill over Bitta's road), `--station gills-candles` (the pipe field and the candles), `--station gills-pass` (the pass: the White ladder); `biomes/xanadu/build.py --station gills` -> `dist/xanadu-gills.html` (Alph's head); section 11. Each station's `stations/<name>/99-host-take.js` and `station.json` live in its host kit |
| Regions on the model | none new: each station is inside its host's polygon or on the unowned summits between them, and its ground is the host's. The *proposed* outlines of section 5 are station extents for the host kits' notes, not biome polygons |
| Object | `GILLS` (`SPECIES`, `PLANTS`, `HARVEST`, `byKey`, `breath`, `country`, `dress`, `layout`) on the `BIOME-API.md` contract, loaded into the host's `BIO.kit`; the host kit's `build` places it (its fields, its ground) and calls `GILLS.layout` for the swarm and `GILLS.dress` for the life; `GILLS.breath(t)` is the one pure function of the tide every shader, hazard and animal reads (section 3); `country` is `red` or `white` and sets the chemistry's dress |
| Core | through the hosts: `biome`, `rand`, `tags`, `space`, `hazard`, `host`, `atmos` (the shared sky and its libration), `water` (springs, ice), `terrain` (`KFIELD`, `KCAVERN`, `KSTACKS`, `KRELIEF`, `KSTRATA`, `KFROST`, `KGROUND`, `KFAR`, `KHORIZON`), `clock`; section 13 |
| Read in place | `biomes/godthrone` (the `tibasalt` strata, the ice belt's edge, the bloodfalls' iron-eaters and riverweed by kin, the glass halo on the skyline), `biomes/catch` (the gravel fan, the oases' tugai and the sedesert palms it reads), `biomes/xanadu` (the Vale's flora at both countries' feet, Alph's chasm), `biomes/geyser` (station 5's ice caves and geysers on the twins), `biomes/ehighlands` (the glass tower, by its one-plant API), `kits/fauna` (the cinder crawler, the frost trunker), `kits/resources` (the node field) |
| Out of scope | the Monks' hermitage and the caravans' camps as buildings (a settlement or `core/camp` plan); the animals' models (`kits/fauna`); the ore nodes' data (`kits/resources`); Pluton and the Ancients' tunnels (the Godthrone's own settlement plan); Strongbow (Xanadu's arcology at the pass's far end) |

Not a new biome in the gallery: the stations are published with their host kits' pages (the godthrone kit's, the
Catch's and Xanadu's entries gain stations). `biomes/README.md`'s table gets one row for `gills/` as a shared kit.

## 1. The idea

Both countries are old volcanic ground over a heat-pipe conduit system (`LORE.md` section 2, "Why Krator is volcanic":
the shell loses its heat through long-lived vents, and tides crack it into rifts without moving it), cracked along
radial and ring fractures: the **gills**, fissures 200 m to 3 km long, 10 to 90 m across and 100 to 400 m deep, in
swarms. Under them water meets hot rock and comes back up charged with hydrogen.

- On the **Godthrone** the water is the ice belt's: a closed saline lake at 6,419 m sealed under ice, its brine
  seeping through fissured titanium basalt and dissolving iron as it goes, already canon as the bloodfalls' source
  (`biomes/godthrone/PLAN.md`, "The bloodfalls and the blood river"). Where that brine meets the heat pipe it comes up
  warm, acid-to-neutral, iron-rich and hydrogen-bearing. **Red.**
- On the **twins** the water is the Catch wall's snow and the Vale's rain on two stratovolcanoes whose plumbing the model
  already gives (`DATA.tubes`: the geothermal `tube_xanadu_nw_09`, whose subglacial reservoir "drives the bursting
  chasm fountain" of the Sacred River Alph, and `tube_xanadu_se_10`, the Erebus ice caves of the geyser kit's station 5
  and the lava-tube springs that feed the Catch's oases Bitta and Lasso). Through ultramafic rock it serpentinizes into
  warm alkaline magnesium brine, pH 9 to 11, hydrogen and methane: Earth's Lost City field, which builds 60 m
  carbonate-brucite chimneys from exactly this. **White.**

Twice-daily on Earth the tide is the sea's; on Krator it is the rock's. Krator's orbit is kept eccentric by its sibling
moons (`e` 0.01, `core/atmos/SKY-PLAN.md` "The daily bob"), so once a sidereal day the shell flexes and the fissures gape
a little and close a little. The same libration is what makes the giant **nod** 1.6 degrees north and south and swing
1.1 degrees east and west once a day (`core/atmos/sky/89-atmos-e-skymodel.js:30-34, 136`): **the giant's nod and the
ground's breath are one motion seen two ways.** When the gills gape, the conduit system exhales: warm, wet, reduced gas
(H2, CH4, a little H2S, brine mist) pours out of every throat for a few hours, visible as a wall of steam in air that is
below freezing most of the year. Between, the cooling conduits inhale: dry, oxygen-rich air at 0.7-1.0 atm is drawn
down into the cracks, hard enough to pull dust, seeds and small animals in. Enceladus is the precedent: its plume is
brightest when its tiger stripes are pulled open at apoapsis. Barometric caves on Earth (Wind Cave, Jewel Cave) breathe
at metres a second from pressure changes alone; here the thermal and barometric pump supplies most of the volume and the
tide is the valve that sets the phase (section 3 has the numbers).

**The life.** The native lineage is fungoid: fleshy bodies carrying a partner organism in their skins, no leaves, no
wood (`biomes/outlands/PLAN.md:51-53`; `biomes/swhighlands/PLAN.md:118-121`). In the light the partner is
photosynthetic. In the dark of a gill's throat the same body plan carries a **chemolithotrophic** partner, and the body
has become a battery:

- **On the in-breath** the lining's skin is washed in oxygen. Its outer mantle, a wet crust of iron and manganese
  oxides laid down by the organism itself, charges: Fe(II) to Fe(III), Mn(II) to Mn(IV), as Earth's manganese-cycling
  bacteria and ferromanganese crusts do, only here on purpose and in bulk.
- **On the out-breath** the hydrogen and sulphide of the exhale discharge that mantle, and the partner microbes harvest
  the electron flow between the two; the brine mist drops its minerals on the same surface: carbonate and brucite on
  the twins, iron oxide and carbonate on the Godthrone.
- Each day leaves **one lamina**, a fraction of a millimetre. The organism lives only at the top; below the lip the body
  is dead and mineral, and it has grown upward on its own skeleton for as long as the gill has breathed. The result is a
  **breath pipe**: a hollow chimney 10 to 90 m tall (0.75 g lets a brittle column stand a third taller than on Earth),
  a living collar at its mouth. Thousands of them stand along every gill. The oldest reach back past the Cataclysm
  (section 10).

So three things that are usually separate are one here: the landform (the gill and its pipes), the organism (the
pipes' living lips and the linings down the throat) and the clock (the giant's nod). A traveller reads the hour of the
next breath off the giant, the age of a pipe off its rings, the chemistry of the ground off its colour, and the history
of the mountain off the pipes that have fallen.

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
- **One life, two chemistries.** The same lineage dressed by what the ground feeds it: red and tall where the brine is
  iron, white and squat where it is magnesium. A biome whose colour is a chemical statement, not a palette.

### The trends it extends (what Krator's native life already does)

| Trend (the files) | How the Gills carry it |
|---|---|
| Native life is vent-born and clusters on geology's energy: vents, heat, sulphur, iron, salt, glass (`biomes/throne/NOTES.md:87-96, 293`; `biomes/godthrone/PLAN.md:192-201`) | its energy is the heat-pipe's reduced gas; its body is iron and manganese oxide and carbonate; it does not need the sun at all. The Red Gills are the bloodfalls' iron-eaters grown into a landscape |
| Where Earth life fails, native life is the whole flora; where Earth life is strong, native life is a flavour (`throne/NOTES.md:88-89, 213, 273-275`); the Godthrone has "almost none, and that is the point" (`godthrone/PLAN.md:194`) | both countries sit in ET and EF ground where Earth plants are already nearly gone, so the gills and their breath strips are the only life for tens of kilometres; the biome is native through and through, and the Godthrone kit's bare ground stays bare between the cracks |
| Native forms answer one physical problem each, and a kit's family reads as one because they share the problem (`biomes/riftrim/PLAN.md:109-113`; `biomes/rift/PLAN-STATIONS.md:165`) | every species here answers the breath: how to hold oxidant through the out-breath, how to feed on the in-breath, how to ride the gust |
| Life carries state on the world clock, and the giant is the sky's fixed cue: everything in the east leans to it (`biomes/ehighlands/NOTES.md:117-122`); the sun-dial turns with the sun (`biomes/sedesert/PLAN-STEPPE.md:61`); the night rosette closes at night (`rift/PLAN-STATIONS.md:203`) | the giant is the clock rather than the compass: the Gills are the first biome whose life cycles on the giant's tide, which no kit has used (the digest of 2026-11-01: "no biome ties a native organism's cycle to the giant's tide") |
| The native lineage is fungoid: fleshy, partnered, no leaves (`outlands/PLAN.md:51-53`) | the same body plan with a different partner, which is the point: the lineage is a **host for partners**, photosynthetic in the light, chemolithotrophic in the dark. *Proposed* as the lineage's first stated rule of biochemistry (section 17) |
| Lineages cross kits as cousins, never copies (`BIO.kin`; `hyperjungle/PLAN-LANDS.md:49-56`); the Rift's sky islands diverge by band (`rift/PLAN-STATIONS.md:141-165`) | the red and white countries are sister forms of one lineage, diverged by chemistry as the Rift's islands diverged by pressure; the rust collar is kin of the Godthrone's iron-eaters; the breath fringe is the trumpet line's dark branch |
| Native life is the natives' armoury, medicine and trade (`throne/NOTES.md:109-134`; `riftrim/PLAN.md:287-288`) | one medicine, one ore, one fuel (section 9), on the Catch-to-Xanadu caravan road |
| Dispersal by what the air does (nsemiarid: "everything travels", `biomes/nsemiarid/PLAN.md:154`; spores on plume thermals, implied and unbuilt: `throne/NOTES.md:195`) | the spores ride the out-breath and are sown by the in-breath of the next gill downwind: the breath is the pollinator, so nothing here glows to call one |
| Native fauna are vertebrate-grade hexapods coevolved with the flora, never insects (`outlands/PLAN.md:57-58, 209`; `kits/fauna/BIOME-FAUNA-PLAN.md:52-54`) | three hexapods on the breath (section 8) |
| The Godthrone's dry-cold line at 8-9 km is "a hard edge no life crosses yet" (`godthrone/PLAN.md:103, 196-201`; the digest's open hook 6) | the Gills bring their own water and heat up from below, so they are the one life that approaches the line and the first to show how it ends (section 3, "How far up") |

### Where it breaks a trend, and why the break is earned

- **No iridescence, no glow.** Iridescence and glow are the native signatures (`rift/NOTES.md:94-105`;
  `throne/NOTES.md:80`), and both are optical signals that pay only where there is an audience. The gill life lives in
  the dark and is pollinated by the breath, so it has no audience and no colour but its chemistry: rust and black on
  the Godthrone, bone and grey-green on the twins. The one iridescent thing here is borrowed and lives in the light: the
  ehighlands glass tower on the high ground. This is the Outlands' and the W outer wall's lesson too: a native biome is
  told by one alien idea applied to everything, not by the family colours.
- **Chemistry stated.** The notes say where native life began and what it looks like, never how it works (the digest's
  first open hook). Trend 7 of the second digest keeps Earth life's chemistry Earth's where it is Earth's
  (`biomes/geyser/NOTES.md:155-156`); nothing has been said of the native lineage's. This plan proposes one rule: the
  native body is a host that takes a partner, and the partner decides whether it lives on light or on redox. It is
  deliberately the smallest rule that explains the Gills, the Throne's vent life (sulphur partners), the Godthrone's
  iron-eaters and the ordinary caps and pads (light partners), and it leaves the Ranj enigma open (the "something of
  Krator's own biosphere" the Ranj fungus needs, `throne/NOTES.md:126-127`, could be a partner that only vent ground
  supplies).
- **Life on the Godthrone.** The godthrone plan's rule is "no plants, no animals, no settlement above Pluton" (9.5 km)
  and its point is a kit "where the ground is the whole show" (`godthrone/PLAN.md:192-201`). The Red Gills keep the
  rule (their living lips stop at about 9 km, section 3) and put life only in the cracks of its south flank, where the
  plan already has iron-eaters and riverweed: two stations' worth of life on a mountain that stays bare.

## 3. The physics, honestly

- **The tide.** Krator orbits its giant in 24 h; a Saturn-class primary puts the orbit near 190,000 km (Day, the Io-like
  moon at 12 h, sits at ~122,000 km: the 2:1 ratio checks). The static tidal bulge of a body this size at that distance
  is kilometres; the daily part of it, from an eccentricity of 0.01, is of the order of **tens of metres** in the rock,
  times the shell's Love number. That is Io's class of tide, and more than the owner's heat flow of 2-5x Earth's
  implies, so the plan treats the tide as the **valve, not the pump**: the fissures need only gape by centimetres to
  halve their resistance. Enceladus's plume output rising at apoapsis as its stripes open is the observed precedent.
  The Godthrone, which "sits on its plume", is the ground that flexes most. If the owner prefers a smaller tide,
  nothing in the biome changes but a sentence.
- **The pump.** The conduit system under a swarm (lava tubes, the fissures' own depth, the breccia's voids: `DATA.tubes`
  holds four master tubes on the Godthrone and two on the twins) is of the order of 10^8-10^9 m3 of warm air. A daily
  temperature swing of 10 degC in the upper system moves 3-4% of it, ~10^7 m3 a day, through a few thousand throats:
  ~1 m/s mean in a 2 m2 throat, gusting to several, as Earth's barometric caves do. The heat-pipe adds a steady flow of
  its own gas, so the out-breath is always warmer and wetter than the air and condenses whenever the air is under about
  15 degC: in both countries that is every hour of the year (means of -7 to -15 degC on the Godthrone's flank, -4 to -7
  on the twins').
- **The phase walks round the clock once a year.** The libration is sidereal (`ph = 2 pi t x 1.0027379`,
  `89-atmos-e-skymodel.js:136`), as Day's transit hour is ("its crossing hour drifts ~4 minutes a day against the sun",
  `SKY-PLAN.md:110`). So the out-breath comes at dawn in one season, at noon a quarter-year later, at midnight half a
  year on. The caravans' calendar for the pass is the hour of the breath. A page chooses its date and gets its hour.
- **The chemistry.** On the twins, serpentinization of olivine-rich rock gives H2 (and CH4 where CO2 is present) and
  brucite-carbonate fluids at pH 9-11, 40-90 degC: Lost City's numbers; the chimneys are white. On the Godthrone the
  brine is the bloodfalls': ferrous iron dissolved under ice, rusting the moment it meets air (`godthrone/PLAN.md`,
  "Why it is red"), with hydrogen from the heat pipe's hot rock; the laminae are red-brown and black. In air with 0.15-
  0.21 atm O2 a hydrogen-methane seep ignites readily (Chimaera's eternal flames in Turkey are a serpentinite methane
  seep that has burned for millennia): where a throat's gas is dry and fast it burns, and the White Gills have
  **candles** (section 11). The oxide-charging mantle is Earth's ferromanganese crust chemistry (Mn(II) oxidised to
  Mn(IV) by microbes, reduced again by H2S and H2) with the organism doing it on a daily cycle; the laminae are
  stromatolite laminae with a daily period, as some Earth stromatolites have.
- **How far up it can go** (the owner's question, 2026-11-02). The biome brings its own heat and water from below, so
  the dry-cold line does not stop it the way it stops everything else. Three limits do, and they make a ladder:
  - **Living lips to about 8.5-9 km** (0.55 atm, mean -27 degC). At 0.55 atm water boils at about 84 degC, the top of
    the brine's range, so the throats begin to boil and the lips freeze between breaths. This is where the godthrone
    plan already puts its dry-cold line and its Pluton rule: the living Gills stop where the kit says life stops.
  - **Ice pipes to about 11-12 km** (0.4 atm, boiling at 76 degC). The lining retreats down the throat into the warmth;
    the out-breath freezes at the mouth and builds fumarolic ice towers over the dead pipes, as Erebus's do. The pipes
    stand higher than the life that made them.
  - **Frost jets to about 15 km** (0.2 atm, boiling at 60 degC: the Throne notes' "practical meaning of airless",
    `throne/NOTES.md:56-70`). The heat pipe's fluids flash to vapour and the exhale is a plume that flies far in thin
    air and rimes the lee of its mouth; nothing lives in it. Above 15 km the conduits hold no liquid to breathe and
    nothing shows at the surface.
  So each country reads as one transect: white or red steaming pipes, then ice-cased pipes, then frost jets, then bare
  dead pipes and nothing. Life stops where people do. On the twins the ladder is the pass itself: the caravan road from
  Lasso (6.6 km) over the 7.3 km saddle toward Strongbow climbs through the ice pipes, and the lower summit (8.5 km)
  carries the frost jets.
- **Sound and light.** The breath is audible: a plateau-wide low drone on the out-breath, a hiss on the in-breath,
  carried farther in Krator's air than in Earth's. The out-breath's warm column over cold ground gives the strong mirage
  the dense-air notes promise (`biomes/WORLD.md`, "Mirages are about twice as strong"): the far pipes shimmer and lift at
  the breath hour. Neither is a feature of its own (the horn pipes and the howl bamboo own wind-sound); they are the
  breath's tells.

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
   1.9 atm at the foot and 1.0 atm at the crest driving air up through them. Set aside here because the siphon tree
   (`throne/NOTES.md:218`) and the Siphon Pits' woolly siphon already own the chimney organism; the owner liked it
   anyway, and it has its own session and plan (2026-11-02).
5. **The Lesser Throne as the site** (the first draft). Set aside by the owner: a volcano younger than a thousand years
   has not had time to grow the ecosystem, however old the cracks round it might be. It stays as an optional nursery.

## 5. Where it is on the model (scale model 5.1, surveyed 2026-11-02)

### The Red Gills: the Godthrone's south flank (stations of `biomes/godthrone`)

Between the ice belt's southern edge and the scarp down into the Vale of Xanadu, round the bloodfalls (the godthrone
plan's planned station 6, `-blood`, ~5.5 km): 5.1 px about **850-905 by 1425-1462**, inside the `godthrone` biome polygon
(the Rift's geographic polygon reaches the bloodfalls' cell). *Proposed* station extent, for the godthrone kit's notes:
`[852,1428] [878,1424] [905,1432] [910,1452] [892,1462] [866,1458] [850,1446]`, about 3,500 km2 of the kit's own ground.

| Point (px) | Height | Air | Rain | Mean (warm/cold) | Extremes | Class | What |
|---|---|---|---|---|---|---|---|
| 862,1438 | 5,441 m | 0.81 atm | 157 mm | -7 (6/-20) | +16/-30 | EF | the bloodfalls' level: the Red Gill, station 1 |
| 880,1440 | 7,002 m | 0.67 | 125 | -15 (-2/-28) | +8/-39 | EF | the ice pipes begin |
| 900,1450 | 7,163 m | 0.65 | 78 | -18 (-5/-31) | +6/-42 | EF | the orange belt's foot |
| 940,1450 | 8,707 m | 0.54 | 0 | -28 (-15/-41) | -4/-53 | HF | the dry-cold line: the last living lip |
| 920,1430 | 11,793 m | 0.37 | 0 | -37 | airless | O | frost jets, no life |
| 860,1470 | 1,693 m | 1.29 | 329 | +13 (21/5) | +29/-3 | Csb | the Vale of Xanadu's dry country, 35 km below |

- **Water:** the closed saline lake of 112 km2 at 6,419 m (5.1 px 843,1398), sealed under ice, and the subglacial brine
  conduit that warms and mineralizes it (`tube_god_ssw_14`, "Red Riwa Subglacial Brine-Lake Conduit", 6,415 m): the
  canonical source of the bloodfalls and the Red Riwa, which runs red through the Vale to the Rift's lake. The Red Gills
  are that brine coming up through the cracks instead of out from under the ice.
- **Rock:** titanium basalt (`KSTRATA` recipe `tibasalt`: thin flows with orange and black glass-bead horizons, below the
  dry-cold line turned ochre palagonite). The gills cut the stacked flows; the pipes stand on colonnade ledges.
- **Age:** a plume that never moves (`LORE.md` section 2) built the mountain; the oldest heat plumbing on Krator, so the
  pipe fields go back in stacked generations far past the Ancients' arrival.
- **Neighbours:** the godthrone kit's other stations (its bloodfalls station is the Red Gills' neighbour, its ice belt
  above, its orange belt and dry-cold line the top of the ladder); `xanadu` below the scarp (the Vale, Csb/Cfb at 1.7-2
  km; the Red Riwa's red riverweed is the kit's below the falls); `rift rim N` west. Settlements: Erewhon (Xanadu's
  city) 198 km, Theodiga 189 km, Qiblai 293 km, Tuatara 251 km. Pluton stands on the airless west flank, far off.
- **Who holds it:** nobody. The Talovolci hold the mountain sacred (*proposed* in the godthrone plan, section 6); the
  Vale's Xanadui live in sight of it.

### The White Gills: the twin volcanoes between the Catch and Xanadu (stations of `biomes/catch` and `biomes/xanadu`)

The 5.1 README's "Catch-Xanadu Twin Stratovolcanoes": summits at px 988,1458 (11,080 m, 0.40 atm, airless) and 1042,1498
(8,535 m, 0.55 atm, HF), with parasitic cones at 1007,1472 (9,333 m) and 1024,1485 (7,385 m). **The gill life runs over
the whole massif** (the owner, 2026-11-02): the north-east flank down to the Catch, which carries the Catch's oases Bitta
("Bitter Water": a lava-tube spring of "mineralized volcanic brackish water" at 4,712 m, px 1078,1510) and Lasso (6,602
m, px 1040,1566, "the last water before the 7.3 km pass toward Strongbow") and the caravan road between them
(`biomes/catch/PLAN.md`); the pass itself over the saddle south of the lower summit; and the south-west flank into the
Vale of Xanadu, where the Sacred River Alph bursts from its chasm. *Proposed* station extents: the Catch side
`[1000,1428] [1030,1422] [1062,1440] [1082,1468] [1086,1505] [1066,1520] [1040,1510] [1018,1480] [1004,1455]` (about
7,000 km2, the catch kit's ground above its fan), the pass `[1030,1540] [1050,1545] [1050,1580] [1030,1580]` (the
saddle, no kit's ground: the catch kit's station reaches it as its oasis Lasso already does), the Xanadu side
`[940,1480] [990,1470] [1010,1500] [980,1520] [945,1510]` (the xanadu kit's ground above the Vale).

| Point (px) | Height | Air | Rain | Mean (warm/cold) | Extremes | Class | What |
|---|---|---|---|---|---|---|---|
| 1015,1430 | 3,746 m | 1.00 atm | 110 mm | +2 (15/-11) | +25/-21 | Dsc | the lowest gills, the pipe field and the candles (catch) |
| 1015,1438 | 4,670 m | 0.89 | 94 | -4 (9/-17) | +19/-27 | ET | the White Gill over Bitta's road (catch) |
| 1078,1510 | 4,712 m | 0.89 | 125 | -4 (9/-17) | +19/-27 | ET | Bitta, the oasis under the gills |
| 1015,1446 | 5,231 m | 0.83 | 16 | -7 (6/-20) | +16/-31 | ET | the upper gills |
| 1040,1566 | 6,602 m | 0.70 | 78 | -16 (-3/-29) | +7/-40 | EF | Lasso and the pass: the ice pipes begin (catch) |
| 1024,1485 | 7,385 m | 0.64 | 0 | -21 (-8/-34) | +3/-45 | HF | the parasitic cone: the last lips |
| 1042,1498 | 8,535 m | 0.55 | 0 | -28 (-15/-41) | -3/-52 | HF | the lower summit: frost jets over the pass |
| 938,1496 | ~6,300 m | ~0.73 | | | | | Alph's subglacial reservoir on the Xanadu side (`cav_alph_headwater`) |

- **Water and heat:** the two geothermal tubes above; the Erebus ice caves at 7.26 km with 88 degC geysers (the geyser
  kit's station 5, `biomes/geyser/PLAN-STATIONS.md`); the Sacred River Alph's subglacial reservoir at ~6.3 km on the
  Xanadu side, whose "geothermal pressure drives the bursting chasm fountain" (`DATA.tubes`, `cav_alph_headwater`;
  `biomes/xanadu/NOTES.md`). *Proposed*: the breath is what makes Alph's fountain burst: it is "momently forced" once a
  day, at the hour of the giant's nod.
- **Rock:** dacite and basalt (`DATA.tubes`), with the ultramafic root the serpentinization needs *proposed* in the
  cones' deep plumbing; `KSTRATA` recipes `canyon` on the Catch side's lake beds below and the volcano's own flows above.
- **Age** (the owner, 2026-11-02): **younger than the Godthrone, older than the Ancients' colonization of Krator**, so
  the White Gills are fully developed: pipe fields in stacked generations on every flank, the Cataclysm's band well up
  inside the standing pipes, the oldest fallen rings older than any human on the world.
- **Neighbours:** `the catch` below the north-east flank (the north fan station and Kolli at the notch; the hyperarid
  floor at 1.4 km, whose model rain is flagged ten times too generous, so this flank's figures may fall), `xanadu` below
  the south-west flank (the Vale, Alph's chasm, Erewhon), `godthrone` to the west (one airless body with the twins' upper
  flanks), Strongbow at the pass's far end. Settlements: Stair 153 km (the Hill arcology, the crossing's campground),
  Qiblai 268 km, Strongbow 288 km, Theodiga 297 km.
- **Who holds it:** nobody; the caravans cross it. Yuni, Izani, Dasri and Xanadui traders, the Catch's divers; the
  Xanadui below the Vale side.

### Both

- **Air:** 0.55-1.0 atm. Breathable unadapted on the lower gills, thin on the ladder. The White Gills' lowest fields
  at 1.0 atm are the alien biome a caravan walks past.
- **Why not elsewhere:** Korona's trench country has the ring faults and the heat but its air is 2 atm at 40 degC, so
  the breath would be invisible and the biome would lose its picture; the Lesser Throne is too young (section 4).
- **The scale model:** no height, rain, river or polygon change is proposed. The fissures are kit-scale (tens of metres)
  and are made by the host kits' fields, not by the model. Each station stands inside its host's polygon (or on the
  unowned saddle between two hosts) and on its host's ground.

## 6. The ground and the landforms (`core/terrain`)

- **The flank** (`KFIELD`, the host's): the model's heights at 1:1 with the host kit's own relief. Red: stacked
  titanium-basalt flows (`KSTRATA` formation `tibasalt`, each flow a ledge, the bead horizons recessed, ochre palagonite
  below the dry-cold line, as the godthrone kit draws them), debris-covered ice tongues above 6 km, the ice belt's cliff
  on the skyline. White: a stratovolcano's flank of flows and ash beds over the Catch's old lake beds on one side and
  over the Vale's wall on the other, the gravel fan below the first; patterned ground on both (`KFROST` polygons,
  `42-core-frost.js`), snow in the lee hollows.
- **The gills** (`KCAVERN` trenches, `GILLS.layout`). Red: **radial** cracks on bearings from the summit, 200 m to 3 km
  long, straight, in a swarm that fans down the flank, their walls colonnaded where a thick flow is cut. White: **ring**
  cracks round the two cones and their parasites, shorter and curved, with radial cracks between the cones where the two
  swarms meet; the pass crosses the ring cracks of both cones. Each gill is a `KCAVERN.trench`, 10-90 m across and
  100-400 m deep, its throats (`KCAVERN.shaft`) running from the floor down into the conduit system (drawn only as dark
  mouths with a breath; not walked). Placed by `KRAND` from (world, cell, index, salt): a gill's position, bearing,
  length and age are hashes.
- **The breath pipes** (`KSTACKS`, a *proposed* kind `chimney`, section 14) along both lips of every gill and down the
  walls on ledges, fallen pipes across the floor, stumps, rubble fans of broken rings. A pipe is a `KSTACKS` body
  (collision, ledges, LOD from the record) whose bore is a `KCAVERN.shaft`, so a walker can look down one. Its laminae
  come from a `KSTRATA` recipe *proposed* as `lamina` (section 14). The two countries' shapes are section 7's.
- **The breath meadows** (`KRELIEF`, a strip field): a soft mask downwind of each gill (the wind raster gives 6-10 m/s
  from the north-west), where the mist falls: rust-brown wet ground and red-stained ice on the Godthrone, white
  carbonate dust and travertine aprons on the twins (`core/water` terraces, `ext/53`), brine pools in the floors
  (`WATER.spring` with the geyser kit's temperature ramp, `core/water/geyser/`, kind `pool`: 40-70 degC, drawing a steam
  column on the out-breath only; the Red Gills' pools red, the White Gills' milky).
- **The ladder** (both countries, upslope): ice pipes (a `chimney` in an `ice` dress: `ice.aufeis`, `ice.rust`), frost
  jets (a steam emitter with no pipe, a rime fan on its lee), then nothing; the godthrone kit's orange belt and glass
  halo read in place above the Red ladder; the pass's road through the White one.
- **The candles** (the White Gills, the Catch side): dry gills whose throats burn: a flame mesh on core/atmos's fire
  chunk, `KHAZ` kind `heat`, a black heat crust round the mouth.
- **The far field and the horizon** (`KFAR`, `KHORIZON`): the Godthrone's shield and ice belt, or the twins' two cones
  with the Catch's white floor on one side and the Vale on the other; the gill swarm's far stripes of steam at the breath
  hour drawn as sprites in the far field.

Fields and seeds are deterministic from the terrain (`KRAND` by cell), as every kit's.

## 7. The flora: native, the breath's, in two dresses

**The rule that keeps it one family:** every species answers the breath. It stores oxidant, or rides the gust, or lives
on what the breath drops. Nothing has leaves; nothing glows; nothing is iridescent. **The rule that tells the two
countries apart:** the brine's chemistry sets colour and form, as a `country` habit on every species (`GILLS.country`,
the Bowl's dense-air habit's shape: one builder, two parameter sets; the two are `BIO.kin` sister forms, never copies).

| | **Red Gills** (the Godthrone: iron brine) | **White Gills** (the twins: alkaline magnesium brine) |
|---|---|---|
| Pipe colour | rust-red to black laminae; the outside streaked with rust where the brine runs over; the bore banded red-brown and black | bone-white to cream laminae of carbonate and brucite; grey-green manganese bands; the outside chalky |
| Pipe shape | **tall, straight, flared**: 30-90 m, a trumpet mouth, in colonnade rows along the radial cracks, like the basalt they stand on. The iron brine is hotter and the flow stronger, so a pipe grows fast and thin | **squat, bulbous, branching**: 10-40 m, clustered like Lost City's cauliflower spires, a pipe forking into two or three mouths, soft and porous. The alkaline brine builds slowly and spreads sideways |
| Collar | a wet black crust that discharges to bright rust | a grey-green crust that discharges to tan |
| Fringe | dark red filaments | pale orange filaments |
| Dew mat and aprons | rust-brown, red-stained ice, red pools (the bloodfalls' palette, `godthrone/PLAN.md` "Why it is red") | white lime dust, travertine, milky pools |
| Beads | dark red spheres | chalk-white spheres |
| Skyline | the ice belt and the Godthrone's shield | two cones, the Catch's white floor on one side, the Vale on the other |

Working names, the same species in both countries unless marked.

### The pipe builders (the throats and the lips)

| Key | Name | Where | What it is |
|---|---|---|---|
| `pipe` | **Breath pipe** | every lip and ledge of a live gill; dead ones everywhere a gill once breathed | the chimney organism: a hollow column with a living collar of grey flesh at its mouth. Lays one lamina a day. Steams on the out-breath; its collar darkens (charges) on the in-breath. The dead body is a `KSTACKS` chimney; the collar a `BIO.fung` ring. Red: tall and flared; White: squat and branching (above) |
| `collar` | **Rust collar** (Red) / **Lime collar** (White) | the lips of young gills before a pipe has grown; the walls | the lining itself, a flat fleshy sheet 1-3 m across under a botryoidal oxide crust, which goes from matte (charged) to wet and bright (discharged) through the day: the biome's clock face. Kin (`BIO.kin`) of the Godthrone's iron-eaters (`godthrone/PLAN.md:195-200`) |
| `bellows` | **Bellows pad** | across narrow throats and cracks | a taut translucent membrane 1-4 m across stretched over a crack, which bulges up on the out-breath and sinks on the in-breath: a diaphragm that meters the flow and traps spores and dust on its underside. The biome's one moving plant, on `BIO.animHook` driven by `GILLS.breath(t)` |
| `fringe` | **Breath fringe** | the mouths of pipes and throats | filaments a metre long streaming out of a mouth on the out-breath and sucked flat into it on the in-breath; the dark branch of the trumpet-tree line (a funnel turned inside out: the trumpet catches water, the fringe catches the breath) |
| `lamp` | **Throat lamp** (optional) | deep in the throats, out of the daylight | a pale soft disc that, uniquely here, does glow, faint and blue, and only on the in-breath: the one concession to "glow pays when it is dim" (`throne/NOTES.md:80`), there to show a walker the throat is drawing. The owner can strike it |

### The breath meadows (what the mist feeds)

| Key | Name | Where | What it is |
|---|---|---|---|
| `dewmat` | **Dew mat** | the strip downwind of every gill | a low fleshy mat that crusts with the mist's minerals every morning and darkens as it dries: the strips' ground cover |
| `saltcup` | **Salt cup** | the meadows' outer edge | a cup 30-60 cm across that fills with condensate on the out-breath and holds it through the day: the flank's water, drunk by animals and caravans (the White Gills' is drinkable; the Red Gills' is iron-bitter, the "bitter water" of Bitta's name turned the other way) |
| `whitewood` | **Limewood** (White) / **Rustwood** (Red) | the meadows' inner band, the aprons | a stubby fungoid tree 3-6 m, its caps crusted with the mist's minerals (the Farside spray coral's trick, `farside/PLAN.md`, here on a native), pale flesh where the crust flakes |
| `rollbead` | **Tide bead** | the meadows and the lips | the small-and-weird: hollow spheres 5-20 cm that the out-breath rolls away from a gill and the in-breath rolls back, so a field of them creeps out and in twice a day and the floor of every gill is drifted with them. A seed body |
| `icepipe` | **Ice pipe** | the ladder, 7-12 km | not a species: a dead pipe cased in the out-breath's ice, the lining alive below in the throat's warmth; a `chimney` in the `ice` dress |

### Guests, read in place

- `biomes/godthrone`: the endolith band in split stones and the orange belt's crusts above the Red Gills; the
  bloodfalls' iron-eaters and the Red Riwa's riverweed as kin at the foot (`godthrone/PLAN.md:195-200`, section 4).
- `biomes/xanadu`: the Vale's dry Mediterranean flora at the Red Gills' scarp foot and at the White Gills' Xanadu foot
  (Csb, 1.7-2 km); nothing of it climbs; the chasm frill at Alph's head is the kit's own.
- `biomes/catch`: the fan's tugai and the oases' palms at Bitta, under the White Gills; the lava pioneers (the Throne's
  glassfern by kin, `throne/NOTES.md:307-311`) on the twins' young flows if any are young.
- `biomes/ehighlands`: the **glass tower** on both ladders' scree (`EHIGH.make`/`grow`): the only glass and the only
  iridescence in the biome, and it is a guest.

## 8. Fauna (`kits/fauna`)

Native, vertebrate-grade hexapods on `faWdHex`'s `amb` anatomy (`kits/fauna/BIOME-FAUNA-PLAN.md:52-54`), named here and
built there, drawn in the biome from the fauna bundle, never in the kit. Each in two coats (red-brown, bone-grey) by
country.

| Key | Name | Status | What it does |
|---|---|---|---|
| `cinder_crawler` | cinder crawler | in `kits/fauna` (vents) | read in place: grazes the collars' fringes on the lips by day |
| `frost_trunker` | frost trunker | in `kits/fauna` (cold plateau) | read in place: the ladder's grazer, drinks at the salt cups |
| `breathrider` | **Breath-rider** | new | a soaring six-limbed glider (kin of the hyperjungle's fang glider, `BIOME-FAUNA-PLAN.md:57`) that lifts on the out-breath's thermals from every gill and hunts the tide beads' eaters; the sky over a breathing swarm is full of them for three hours and empty the rest of the day |
| `throatmaw` | **Throat maw** | new | an ambusher that hangs in a throat on the in-breath, mouth to the draught, taking what the breath pulls down: the gill's hazard `hunter` (section 9); kin of the Rift's gapemaw |
| `beadrunner` | **Bead-runner** | new | a hare-sized hexapod that follows the tide beads out and back, the flank's most common animal and the maw's food |

The herds "have nothing to run from" is the owed gap in two kits (`hyperjungle/NOTES.md:77`); here the predator is
the breath and the thing in it.

## 9. Resources, crops, hazards, people

- **Ore** (`kits/resources`): a dead Red pipe is a ferromanganese crust 50 m tall; Earth's are the richest cobalt,
  nickel and rare-earth deposits known. *Proposed*: owner nodes of family `rare-earth` and `iron` at the Red pipe
  fields, `rare-earth` alone at the White ones (their manganese bands), grade from the field's age (`RES_GEO` owner nodes
  and deltas apply by id last, `kits/resources/GEOLOGY.md`); the Geomancers of Yuni and the Republic's Mint would want
  it, the caravans would carry it. No new family.
- **Fuel**: the out-breath is hydrogen and methane. A throat capped with a hide bell gives a clean flame for three hours
  a day; a candle gives it all day. *Proposed* as the caravans' and the Catch's divers' fuel on the pass and a thing
  Yuni, Xanadu and the Eternal State would study (the owner's call; it touches the energy lore).
- **Medicine** (`kits/crops`, zone `gills`, `how: node`): **lung salt**, scraped from a charged collar at the end of the
  in-breath: an oxygen-carrying salt the caravans chew on the 7.3 km pass toward Strongbow and sell to the crater for
  the thin-air sickness, the abyss cough's opposite. Dalab's genepriests want it (pressure adaptation is their trade,
  `LORE.md` section 2). The dangerous version is the discharged collar at the end of the out-breath, which is a
  sulphide: the same plant, two uses, as the glass tower's pallidine (`ehighlands/NOTES.md:158-168`). *Proposed*: the
  Red Gills' salt is the stronger and the more dangerous; the White Gills' the one that is sold.
- **Food**: tide beads roasted (the one fruit, catalogued in `FRUIT.md`'s way); salt cups for water on the White Gills.
- **Dye**: the Red collars' crust gives a rust and a black; the White Gills' a chalk.
- **Hazards** (`core/hazard`, every one a `core/tags` record with `tags.hazard` registered before it is drawn,
  `cycle.offset` from `GILLS.breath`): the **in-breath** at a throat (`grab`, hold: it pulls; danger .7 at the mouth, a
  `move` that slows a walker toward it), the **out-breath**'s pooled gas in the gills' sumps (`gas`, suffocate: CO2 and
  H2S settling in the deep reaches; danger 1 on the floor, 0 two metres up), the **candles** (`heat`, burn, steady), a
  lip's rotten rings (`fall`), the ladder's thin air (`cold`, and the godthrone kit's own air rule above 9 km), the
  throat maw (`hunter`, cycled on the in-breath). The tell is the clock: the giant's nod and the collars' colour say
  which hazard is on.
- **People**: no one lives in either country. **The White Gills** stand over the whole Catch-to-Xanadu crossing: the
  caravan road between Bitta and Lasso (`biomes/catch/PLAN.md`: the five oases, Stair's campground 153 km north-east,
  the Stalkers' peaks far to the east), the pass itself through the ice pipes, and the descent on the Xanadu side past
  Alph's head to the Vale and Strongbow. Yuni, Izani, Dasri and Xanadui traders pass through them, water at the salt
  cups and Bitta's spring, cut lung salt and ore, and time the pass by the breath; the Catch's divers know the candles;
  the Xanadui hold Alph's head holy (the Sacred River's source). *Proposed*: the **History Monks** keep a hermitage of
  two or three in the White pipe field (section 10), from Longsong in the Oidong Valley east of Xanadu (`LORE.md`
  6.15). **The Red Gills** are the Talovolci's sacred mountain's one living flank, in sight of the Vale; the Xanadui
  climb to them for the red salt; Erewhon is 198 km. Hazard to both: the mountains are live.

## 10. The pipes as a calendar (*proposed* lore)

A breath pipe lays one couplet a day, 0.2-0.4 mm; a wet season leaves a thicker pale ring once a year; so a pipe's
rings are days and years that anyone can count, and the tallest standing Red pipes (80-90 m, 0.75 g) are some 1,200 to
1,500 years old at the base, with fallen generations under them going back far further. On the twins, old since before
the Ancients came, the same holds. Two bands run through every pipe old enough to hold them:

1. **The glass band**, in the Red pipes: a lamina of orange bead glass from a summit eruption of the Godthrone, the
   fountain's halo carried down the flank by the wind (the godthrone plan's halo "tens of km across"); a dated event
   in a mountain whose history nobody else records.
2. **The thin years**, in both countries: a run of years whose laminae are thin, dark and uneven in every pipe that
   reaches them, below which the rings are thick and regular. The Monks read it as the Cataclysm: a dimmed sky and a
   shaken ground for a decade. What it actually records is the owner's to say.

`LORE.md` section 12 lists "When the Ancients fell" among the contradictions ("a thousand years" at Yuni and Iziz,
"millennia" elsewhere). The Gills are the one place on Krator where the answer is written in something no one could
have forged, and only the Order knows how to read it, which is why two or three Monks live in the White pipe field
counting (Longsong is across the Vale), and why the Red pipes, which they cannot reach without the Xanadui's leave, are
the archive they most want. The owner may want the thin years to mean something else, or to keep the count ambiguous
(pipes break; the oldest are fallen and the fallen weather); the plan only puts the record in the ground.

## 11. Stations

Each station is its host kit's (`build.py --station <name>` in `biomes/godthrone`, `biomes/catch` or `biomes/xanadu`)
and takes the date (so the breath hour) from its `99-host-take.js`; the host's time control moves through the breath. The
breath state `GILLS.breath(t)` in `0..1` (out-breath 1, in-breath 0, with the ramps) drives the steam, the collars'
colour, the bellows pads, the fringes, the beads, the hazards and the breath-riders together.

1. **The Red Gill** (godthrone `--station gills`, `dist/godthrone-gills.html`; px 862,1438: 5,441 m, 0.81 atm, 157 mm,
   EF, -7 degC, 6/-20; the Godthrone's south flank at the bloodfalls' level). One great radial gill 1.6 km long and 60 m
   across, 300 m deep, both lips lined with tall red pipes in colonnade rows, the walls stepped with rust collars and
   dark fringes, bellows pads across the side cracks, the breath meadow running away south-east rust-brown over
   red-stained ice, the ice belt's cliff and a red fall on the skyline, the Godthrone's shield filling the north. Set in
   spring, with the out-breath at dawn. **The first ten seconds**: the camera stands on the lip in blue pre-dawn with the
   giant huge in the north-east; as the sun rises the whole 1.6 km of the crack begins to steam at once, the wall of
   mist climbs and tips downwind over the meadow, the pipes sing, the beads roll away, and the breath-riders lift off
   the lips one after another. The in-breath preset shows the same place six hours on: dry, silent but for the hiss, the
   collars black, the fringes sucked flat, dust streaming down into the throats, a bead-runner fighting the draught.
2. **The Red ladder** (godthrone `--station gills-ladder`, `dist/godthrone-gills-ladder.html`; px 900,1450 to 940,1450:
   7.2 to 8.7 km, 0.65 to 0.54 atm, 0-78 mm, -18 to -28 degC, EF to HF): up the flank from the last red pipes through
   the ice pipes to the dry-cold line, the lining gone down the throats, the out-breath freezing into fumarolic ice
   towers, then frost jets on bare ground with rime fans on their lee, the godthrone kit's orange belt and palagonite
   ridges read in place, the sky going violet, the glass halo's orange on the horizon. The breath still comes on the
   hour; nothing else moves.
3. **The White Gill** (catch `--station gills`, `dist/catch-gills.html`; px 1015,1438: 4,670 m, 0.89 atm, 94 mm, ET,
   -4 degC, 9/-17; the twins' north-east flank over Bitta's road): a ring gill curving round the lower cone, its lips
   crowded with squat white branching pipes like a reef, lime collars and pale fringes, travertine aprons and milky
   pools, the breath meadow white with lime, the caravan road threading between the pipes below with its cairns, Bitta's
   green at the fan's toe, the Catch's white floor beyond, the two cones above. Set in autumn, with the out-breath at
   dusk: the mist wall catching the last light, the giant nodding, the candles of station 4 just visible as blue points
   down the flank.
4. **The pipe field and the candles** (catch `--station gills-candles`, `dist/catch-gills-candles.html`; px 1015,1430:
   3,746 m, 1.0 atm, 110 mm, Dsc, +2 degC; the lowest White gills): a dead gill closed by the tide's slow shift of the
   swarm, its hundreds of white pipes standing silent, fallen ones across the floor, rubble fans of broken rings; beside
   it the dry gills whose gas burns: blue flames a metre tall at the throats, invisible at noon, plain at dusk, the black
   heat crust round each; the Monks' two cells built into a pipe's base (a placement site only: the building is a
   settlement's), their count cut into the bore; the caravans' smelting hearths and slag; the road climbing toward Lasso.
5. **The pass** (catch `--station gills-pass`, `dist/catch-gills-pass.html`; px 1040,1566 to the saddle: 6.6 to 7.3 km,
   0.70 to 0.64 atm, -16 to -21 degC, EF to HF): the White ladder, which is also the crossing: Lasso's last water in a
   gill's salt cups, the road climbing between ice pipes with the caravans' chains and cairns, the ring cracks of both
   cones meeting at the saddle, frost jets on the lower summit above, and from the top the Vale opening to the
   south-west with Alph's chasm below. The geyser kit's ice caves (station 5) are over the shoulder; the Erebus-style
   fumarolic towers here are the gills' own.
6. **Alph's head** (xanadu `--station gills`, `dist/xanadu-gills.html`; the twins' Xanadu side, ~6.3 km, px ~938,1496):
   the gills on and under the ice over the Sacred River's subglacial reservoir, white pipes standing out of the glacier's
   edge, and the chasm below where the river bursts out once a day on the breath (*proposed*, section 5), the Vale
   beyond and Erewhon's gardens in the haze; the xanadu kit's wildwood read in place at the foot. Set at the breath's
   hour so the fountain is seen to be forced.
7. **The nursery** (optional, a station of `biomes/ehighlands` if wanted; the Lesser Throne's plateau, px 1138,822:
   3,174 m, 1.08 atm, 188 mm, BSk): the first draft's site kept as the lineage's youngest country: cracks less than a
   thousand years old with collars and fringes and no pipes yet, the first stumps a hand high, the young cone smoking
   above. The same life in its infancy, if the owner wants the comparison.

## 12. How it reads, and what it costs

- **Geometry.** A pipe is a low-poly hollow tube (24-40 segments, 4-8 rings, ~500 tris; the White branching form
  ~1,200) with the laminae in its shader (`KSTRATA` lamina recipe: 0 extra tris), instanced per variant
  (`32-core-variants.js`, 12-16 variants by height, lean and branching); 3,000 pipes in view are 1.5-3 M tris and a
  dozen draws. The collars, fringes and pads are `BIO.fung` items on the core's instancing (`33-core-fungoid.js`). The
  gill walls are the field's own mesh with a `KCAVERN` trench cut. Target: **under 6 M triangles and 60 draw calls per
  view** on the integrated GPU, measured as the Godthrone's `PERF.md` measures (its pages run 2-3 M tris, 20-35 calls,
  12-25 ms sync on the Arc 140T); a gills station adds to its host's own view no more than the host's other stations do.
- **The breath.** Steam is core/atmos's smoke kind on a few hundred emitters whose rate is `GILLS.breath(t)`; the mist
  wall over the meadow is the height fog's pooled layer (`sky/89-atmos-j-fog.js` `fogPool`) with its density on the same
  function; the far gills' steam is sprites in `KFAR`. No per-frame CPU work: everything reads the clock.
- **Motion.** Bellows pads, fringes and beads move in the vertex shader (`BIO.animHook`, a `breath` mode: a scalar
  uniform from `GILLS.breath`), so a thousand of them cost nothing per frame. The breath-riders are `kits/fauna` orbit
  animals whose count fades with the breath.
- **Light.** The shared sky at each station's pressure (the godthrone kit's thin-air end on the ladders); the giant's nod
  is already in the sky model; the collars' albedo and the mist's density are the biome's tells. Night: no
  bioluminescence but the candles and the optional throat lamps; giantshine on white pipes, and on red ice, is the night
  picture.
- **Godot.** Everything above is data on the clock: the pipes are `KSTACKS` records, the gills `KCAVERN` voids, the
  breath a pure function with a GDScript twin, the hazards `Area3D`s with `cycle.offset`, the steam the atmos
  particles' export. Nothing needs a builder to port.

## 13. Core adoption (written before the first fragment, as `CLAUDE.md` asks)

The host kits already take most of this: `biomes/godthrone`'s adoption is its plan's section 9a, `biomes/catch`'s and
`biomes/xanadu`'s their own. What follows is what the **gills stations** need of the core, taken through the host's
`build.py` (a station lists its fragments in its `station.json`, as the godthrone kit's stations do for `core/water`),
and what `biomes/gills`'s own fragments may touch (`[G data]` only: species, layout, breath, dress records; the drawing is
the host's and the core's). The modules, by name, and for each not taken, why:

| Module | Takes | For |
|---|---|---|
| `core/biome` | `10-core-head`, `20-core-kit` (`BIO.INDEX_ITEMS`, LOD merge/fade/cull), `30-core-foliage` (ground tint, A2C, back-light, the one wind), `31b-core-leafset`, `32-core-variants`, `33-core-fungoid` (`BIO.fung`: collars, pads, limewood and rustwood caps, dew mat), `34-core-impostor` (far pipes), `35-core-anim` (the breath mode: *proposed*, section 14), `39-core-lean` (ehighlands' glass tower in place leans to the giant), `40-core-place`, `42`/`43-core-export(-host)`, `44-core-stage` | every species on the core's builders and items; `BIO.kin` for the two countries' sister forms; `BIO.kit('gills')` so the shared life's items never collide with a host's |
| `core/rand` | `KRAND` | every field, every gill, pipe and bead cell (`KRAND.hash(world, ix, iz, salt)`); no sin hash, no stream |
| `core/tags` | `50`, `52`, `53` | every pipe, collar, pad, bead, pool and hazard a record (`BIO.init({tags})`) |
| `core/space` | `KSPACE` | the keep-clear between pipes and the nearest-gill index the meadows and hazards read |
| `core/hazard` | `KHAZ` (`20-core-hazard.js`) | the in-breath's grab, the sumps' gas, the candles' heat, the lips' fall, the ladder's cold, the maw's hunter, each cycled on the tide |
| `core/clock` | `KCLOCK` (`C.day`, `C.hour`) | the date and hour, so the breath's phase is the sky's |
| `core/terrain` | `30-core-field` + brush, `35-core-strata` + host shade (`tibasalt` on the Red, the twins' flows on the White; `lamina` *proposed*), `37-core-stacks` (`chimney` *proposed*; `columns` on the colonnades), `38-core-relief` (`tube` for collapse pits, `talus`, `pavement`, the strip field), `39-core-cavern` (`trench`, `shaft`), `42-core-frost` (patterned ground, both), `43-core-ground` (`KGROUND` library layers, `clast` and `sand` kinds as the godthrone kit uses them), `44-core-farfield` + draw, `45-core-horizon` + shade | the flanks, the gills, the pipes, the far country |
| `core/atmos` | the core, presets, export, waves, skylight, `bindHost`, the shared sky at each station's pressure (the giant's libration), `bindWeather`, height fog (`fogPool`), `3-particles` (steam), `3d-dust` (the in-breath's dust), snow cover | the sky, the breath's steam and mist, the light |
| `core/water` | `20`, `21`, `22`, `50`, `51`, `geyser/52` + draw (`WATER.spring`), `ext/53` + draw (the travertine aprons), `ext/54` + draw (the `ice` kind and the `blood` and `brine` looks for the Red pools and stained ice), `ext/57` (the audit); at Alph's head the xanadu kit's own flow and fall for the river | the brine pools, the aprons, the ice, wet ground under the mist |
| `core/host` | `FULL` (camera, loop, clock, panel, probe, inspector, marks, pictures, minimap) | the host's page shell; the probe checks section 16's invariants |
| `core/materials` | `record` (`KMAT`) and the generated pack (`biomes/gills/materials.json`, `tools/textures/pack.py biomes/gills`, read by the hosts as a second pack) | every library set (section 15) |
| `core/export` | `07`, `09` | the krator-world container; the hazards section |

Not taken: `core/mask` (nothing is placed from a canvas), `core/city`, `core/hamlet`, `core/camp`, `core/simulation`,
`core/furnish` (no settlement: the Monks' cells and the caravans' hearths are placement sites published as plain data, the
way swhighlands' pillar rim publishes `SWHI_PILLARS_SITE`), `core/lod` (the biome core's runtime LOD covers it),
`core/walk` beyond what `KCAVERN` writes (the throats are not walked), `33b-core-bamboo`, `36-core-walker`,
`37-core-traps` (no carnivorous plants: the hunter is an animal), `38-core-fire` (the candles are steady flames on the
atmos chunk, not a spreading fire), `46-core-lava` (no young flows at either site), the season (one season a page; the
date sets the breath hour). `kits/crops`: the `gills` zone and the lung salt record only; nothing is farmed.

`tools/check_core_use.py` runs on the three host kits before the first station is called done, and `tools/check_port.py`
on `biomes/gills` (every fragment `[G data]`: nothing in it touches the browser). After any change to `biomes/gills`, every
host kit is rebuilt and verified (`godthrone/verify.py --assert`, `catch/verify.py --assert`, `xanadu/verify.py --assert`)
and `python3 tools/port_baseline.py` run, as the shared-copy rule in `CLAUDE.md` asks.

## 14. New in core (each small, each a proposal)

1. **`ATMOS.libration(t)` as data.** The sky model already computes the nod and the swing
   (`89-atmos-e-skymodel.js:136`); expose them (and the phase in `0..1`) as a `[G data]` function the kit, the hazards and
   Godot read, so the breath and the picture of the giant can never disagree. `GILLS.breath(t)` is a shaped function of
   it (a ramp up, a plateau of about three hours, a ramp down, a long in-breath), as the geyser's cycle is of its period.
2. **`KSTACKS` kind `chimney`.** A hollow laminated column: footprint, bore radius, a flared or branching top (one to
   three mouths), a lean, a collapse state (standing, broken, fallen as a `KSTACKS` body on its side, rubble fan), an
   `ice` dress; `topAt` and `ledge` as the other kinds; the bore a `KCAVERN.shaft` the mesh agrees with. Beside `pillar`
   and `mound` in `KINDS`.
3. **`KSTRATA` recipe `lamina`.** Sub-millimetre couplets (two colours, set by the country), an annual thicker band, and
   authored marker bands at given depths (the glass band, the thin years), on a column measured from the top down (a
   pipe grows up, so its age is read from the lip). `S.at` gives the lamina's day for any point, so the inspector can
   say "day 412,117 of this pipe".
4. **`BIO.animHook` mode `breath`.** A scalar uniform (the breath state) that scales a per-item displacement: a pad's
   bulge, a fringe's streaming, a bead's roll along its own vector. One uniform, no per-frame work.
5. **`KHAZ` on an authored phase from the sky.** `cycle.offset` exists; the kit sets it from `ATMOS.libration`. No new
   kind: `grab` with `move` is the in-breath, `gas` the sumps, `heat` the candles, `cold` the ladder, `hunter` the maw.
   Worth checking that a `grab` whose `move` points toward the record's core reads right in the Godot `Area3D` mapping.
6. **`KFAR` sprites.** The far gills' steam as a few hundred sprites in the far field, scaled by the breath; `KFAR.grid`
   carries colour and height today, not sprites. Small.

Nothing else is new. The gills are `KCAVERN` trenches, the flanks the hosts' `KFIELD`s, the pools `WATER.spring`, the
ice the `ice` kind of `ext/54`.

## 15. Textures

Read the library first (`core/materials/PLAN.md`). **Reuse.** Red: `rock.basalt.titanium`, `rock.gossan` (the oxidised
iron cap: the collars' crust from afar), `ground.rust.terrace`, `ground.riverweed.red`, `ice.rust`, `ground.beads.orange`,
`rock.palagonite`. White: `ground.travertine.white`, `stone.geyserite`, `ground.sinter`, `ground.soda.crust`,
`ground.efflorescence`, `ice.aufeis`, `ice.clear`. Both: `rock.megabreccia`, `rock.basalt.flowbanded`, `rock.columnar`,
`ground.puna`, `ground.tundra`, `ground.snow011`, `ground.snow.drift`, `surface.cushion`, `card.ichu`,
`organic.pleat.skin` (the bellows pad), `organic.flesh.cells`, `organic.coil.ribbed`, `organic.tendril.banded`,
`ground.mat.thermal`, `organic.lichen.plates`, `ground.turf.polygon`.

**To source or generate** (generic ids; prompts below, paste-ready, to go into `core/materials/PROMPTS-NEEDED.md` on
approval, never a procedural stand-in without saying so). The lamina set is tintable, so one set serves both countries.

- `rock.lamina.pipe`: the pipe wall, cut: fine daily couplets. Tintable.
- `mineral.crust.ferromanganese`: the rust collar's wet black botryoidal crust (the Red country). Full colour.
- `mineral.crust.brucite`: the lime collar's chalky grey-green crust (the White country). Full colour.
- `card.breathfringe`: the fringe's filaments, a cut-out on magenta (tintable: red or orange by country).
- `card.turf.limed`: the breath meadow's crusted grass and mat, a cut-out.

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
Seamless tileable texture, square, 2048x2048. Orthographic top-down view,
perfectly flat surface filling the whole frame edge to edge. Flat, even,
shadowless lighting, as if scanned: no highlights, no vignette, no shading
gradient across the image. No perspective, no objects, no text, no border,
no watermark. The left edge must continue into the right edge and the top
into the bottom. Material: a chalky, porous brucite-and-carbonate crust of
soft rounded cauliflower-like lobes, bone white (#e9e4d6) to pale cream,
with faint grey-green manganese staining (#7f8f78) in the seams between
lobes, fine powdery texture, a few damp translucent patches. Full colour:
not tinted.
```

```
Flat sheet of cut-outs, square, 2048x2048, on a solid flat bright magenta
background (#ff00ff); no magenta, pink or purple anywhere in the subject; no
grey or white background. Flat, even, shadowless lighting. Subject: six
separate tufts of long fine filaments, each tuft rooted at a small grey
fleshy knob and streaming to one side as if in a steady wind, the filaments
a muted warm orange-brown, translucent at the tips, some beaded with
droplets. Keep colours natural but slightly muted and even, so the sheet can
be tinted to different palettes without looking stained. No text, no border,
no watermark.
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

Reference images to collect into `refs/`: Lost City's carbonate chimneys (the White pipes' form), Blood Falls and its
rust terraces (the Red palette), Chimaera's flames (the candles), ferromanganese crust sections (the collars and
laminae), Erebus's fumarolic ice towers (the ladders), Wind Cave's breathing entrance, Enceladus's tiger stripes from
orbit (the swarm's plan), Iceland's fissure swarms (the gills from the ground).

## 16. Order of work

- **G0.** The owner's yes or no on the mechanism, the lineage rule, the calendar, the names, the throat lamp, Alph's
  pulse (section 17); the texture prompts moved to `PROMPTS-NEEDED.md`. Settled 2026-11-02: the two sites, stations of
  the host kits with `biomes/gills` as the shared life, the White Gills over the whole twin massif, the twins old enough
  for full gills.
- **G1.** `ATMOS.libration`, `GILLS.breath` and its node test (`biomes/gills/tests/test-gills.js`: the phase against
  the sky model, the drift of the hour through a year, determinism); the hazard records cycled on it.
- **G2.** The ground: each station on its host's `KFIELD`, the gill swarms as `KCAVERN` trenches and shafts (radial on
  the Red, ring on the White) laid out by `GILLS.layout`, the strip field; the `chimney` kind (both forms, the `ice`
  dress) and the `lamina` recipe with their tests; the pipes placed from the gills' ages.
- **G3.** The flora: pipes, collars, pads, fringes, dew mat, salt cup, limewood and rustwood, beads, in both dresses as
  `BIO.kin` sisters; the `breath` anim mode; the guest kits read in place.
- **G4.** The breath itself: steam emitters, the pooled fog, the far sprites, the collars' colour, the brine pools on
  `WATER.spring`; the godthrone kit's `gills` station with its two presets (out-breath, in-breath).
- **G5.** The catch kit's three stations and the xanadu kit's one; the ladders' ice pipes and frost jets; Alph's pulse;
  the Monks' and caravans' sites published as data; the nursery if wanted.
- **G6.** Each host's `verify.py --assert` with the probe's invariants on its gills stations: every pipe's lamina count
  equals its age in days from its record; every hazard's phase equals `GILLS.breath`'s; the out-breath preset shows
  steam at every live throat and the in-breath preset none; no living lip above 9 km and no ice pipe above 12 km;
  nothing placed on a lip within its `fall` record's edge; the pipes' height under 90 m; each country's species in its
  own dress and no other; each check with a negative. `PORT.md`, the index tools, `tools/check_core_use.py`,
  `tools/check_port.py`, `python3 tools/port_baseline.py`, the hosts' gallery entries.
- **G7.** `kits/fauna`: the breath-rider, the throat maw, the bead-runner, two coats each. `kits/crops`: the `gills`
  zone, lung salt. `kits/resources`: the owner nodes.

## 17. Open questions for the owner

1. **The mechanism**: is a daily tidal breath of the ground, phased to the giant's nod, acceptable canon? It touches
   `LORE.md` section 2 (a sentence on the shell's daily tide) and the sky plan (nothing changes there; the kit reads
   what is drawn).
2. **The lineage rule** (*proposed*): "the native body is a host that takes a partner; the partner decides whether it
   lives on light or on redox." The first biochemical statement about Krator's own life. Yes, no, or reworded?
3. **The calendar** (section 10): may the pipes record a Godthrone summit eruption as a glass band and a band the Monks
   read as the Cataclysm? What do the thin years mean, if anything?
4. **Alph's pulse** (*proposed*): may the breath be what makes the Sacred River's fountain burst once a day?
5. **The names**: the Xanadui's or Dasri's words for the gills, the breath, the pipes, the two countries and the lung
   salt; whether the shared kit is `gills` or something of the owner's.
6. **The throat lamp**: the one glow, inside the throats on the in-breath. Keep or strike.
7. **Fuel**: may the breath's hydrogen be a thing people burn, and who knows it (the caravans only, or Yuni, Xanadu and
   the State too)?
8. **The Monks**: a hermitage in the White pipe field counting rings, with Longsong across the Vale. Yes, and in whose
   name?
9. **The nursery**: keep the Lesser Throne as the lineage's youngest country (an ehighlands station), or drop it
   altogether?
10. **The tide's size**: the plan quotes tens of metres in the rock as a plausibility bound and uses the tide only as a
    valve. If the owner wants a number in `LORE.md`, which?
