# hearths: the plan (proposal, 2026-11-02)

**The Hearths**: vent fields on cold high ground where the heat-pipe's warmth comes up through the rock, and where the
native life has two suns: the one in the sky and the one in the ground. The owner's brief (2026-11-02): "something like a
land based deep-sea vent where geothermal tropism is just as significant as solar." The idea in one line: **life that
eats temperature difference**. A photosynthetic plant harvests the sun at about one part in a hundred of 250 W/m2 and
reaches for the light; a hearth tree stands on ground at 60-90 degC under a sky at -20 and runs a heat engine between
them, and it reaches for both at once: its foot creeps toward the hottest ground, its fans open to the coldest sky.
Because a vent field's heat flux is hundreds to thousands of watts a square metre, a heat engine there out-earns a leaf
several times over, so round every vent the native heat-eaters are the forest and the light-eaters are the understorey,
and the two change places at the edge of the warmth. The forest works at night, when the sky is coldest, and sleeps by
day under silver; it opens at noon only when the sun goes behind the giant. In winter it stands black and steaming in
the snow.

**Settled with the owner, 2026-11-02** (the answers to section 17 as first written): the **mechanism and the partner
rule are canon** (a third partner kind, heat, and a body may carry two partners in two places); the **sites and host
kits stand**, and **a third field goes to the Godstep flank vent** as a station of `biomes/godstep`; **Oidong's rim
warmth** is the reason the valley's pools never freeze; the **Tungangs' surface** is as proposed (the night forest over
their holds, the wax their staple, the walk in their sagas); **Dalab**: the hearth tree is one of the things its
genepriests come over the rim for, not the one thing; the **kettle cup origin** stands (section 10); the **names** are
the Tungangs' and the Monks' (still to be supplied); **the walk is under a metre a year**.

**Built so far (2026-11-03, oidong's rebuild turn):** `src/50-biome-hearths-species.js` (`HEARTH`: the species and plants with tags, `work`,
the two dresses, the parts on `BIO.fung` and the breath's `fold`) and `src/55-biome-hearths-place.js` (`HEARTH.layout` on a KTHERM bake), read in place
by `biomes/oidong/stations/hearths` (station 3). Not yet: the boil cup, the shade cap, the walk, the hold, the animals, the textures (section 15), the
Godot side, `tests/test-hearths.js`, `BIOME-API.md`. **Built 2026-11-03: the Cave of Crystals** (section 18), the kit's one
page: `python3 build.py` -> `dist/hearths-crystals.html`.

Status: **a proposal for the owner** only in its wording of the lore sentences and the names. Nothing is built, nothing
on the model is changed and `LORE.md` is untouched. Every lore change this plan wants is marked *proposed* with its
wording. It follows the owner's 2026-11-02 pattern for the Gills: **a shared kit of life read in place by host kits,
shown as a station of each host**, not a biome polygon of its own. Working names throughout until the Tungangs' and the
Monks' words come.

## 0. What the kit is

| | |
|---|---|
| Folder | `biomes/hearths/` (`src/`, `materials.json`, `tex/`, `refs/`, `BIOME-API.md`, `NOTES.md`, `KNOWN_ISSUES.md`, `PORT.md`, `tests/test-hearths.js`): the shared life, no page of its own, read in place by the host kits' `build.py` (the pooled-folder rule: each names the fragments it takes), as `biomes/geyser` and (proposed) `biomes/gills` are |
| Pages | stations of the host kits: `biomes/riftrim/build.py --station hearths` -> `dist/riftrim-hearths.html` (the Hearth field on the north rim) and `--station hearths-hold` (the loj under it); `biomes/oidong/build.py --station hearths` -> `dist/oidong-hearths.html` (the Cold Hearths on the valley's north rim); `biomes/godstep/build.py --station hearths` -> `dist/godstep-hearths.html` (the small field at the flank vent, the owner's third, 2026-11-02; it folds into the godstep plan's optional vent station); and **the hot-country cousin, the Stills** (section 7b): `biomes/geyser/build.py --station stills` -> `dist/geyser-stills.html` at the Steampits showcase, and the still trees in every page that loads the geyser kit (the West Ring's geyser isles, the Throne's geyser isle: the owner, 2026-11-02, "stills grow at all 3"); section 11. Each station's `99-host-take.js` and `station.json` live in its host kit |
| Regions on the model | none new: each station is inside its host's polygon (`rift rim N` / `w rift highland`, `Oidong Valley`, `godstep valley`) on its host's ground, at vents the model already holds (`DATA.vents`); section 5 |
| Object | `HEARTH` (`SPECIES`, `PLANTS`, `HARVEST`, `byKey`, `heat`, `work`, `dress`, `layout`) on the `BIOME-API.md` contract, loaded into the host's `BIO.kit('hearths')`; `HEARTH.heat(x, z)` is the ground's temperature from the vent records (section 14), `HEARTH.work(t, W, atm)` the engine's state in `0..1` (open fans 1, closed spindles 0) from the clock, the weather and the eclipse, which every shader, hazard and animal reads (section 3) |
| Core | through the hosts: `biome`, `rand`, `tags`, `space`, `hazard`, `host`, `atmos` (the shared sky with its eclipse seasons, the weather, snow cover), `water` (springs, pools), `terrain` (`KFIELD`, `KCAVERN`, `KRELIEF`, `KSTRATA`, `KFROST`, `KGROUND`, `KFAR`, `KHORIZON`), `clock`; section 13 |
| Read in place | `biomes/riftrim` (the glass rim's light-piping forest, the lakes, the caverns and the Tungangs' holds: the host), `biomes/oidong` (the high passes' cushions and snow lotus: the host), `biomes/godstep` (the red crater: the host), `biomes/geyser` (the hot pools' temperature ramp, the fumaroles, the geysers' cycles; **the host of the Stills**), `biomes/ehighlands` (the glass tower by its one-plant API, on the Oidong rim), `kits/fauna` (the cinder crawler, the frost trunker, the cavern leaper), `kits/resources` (the node field) |
| Overlap, settled | `biomes/geyser/PLAN-STATIONS.md` (2026-10-26) plans its station 2 (`--station puna`, "the high desert field") at the Oidong rim's two vents, the Godstep flank vent and the Lesser Throne, and its station 3 (`--station basin`, "the mountain forest field") at the rift rim's three vents: the same ground as the Hearths' stations. **The owner (2026-11-02): they go to the host kits.** One build per vent field: the hearths stations are built by `riftrim`, `oidong` and `godstep`, with the geyser kit read in place for the field itself (its `puna` and `basin` recipes: the frozen-air steam columns, the ice round the pools, the bobby-sock trees, the snow kept off the hot ground) and the hearth life on it; the geyser kit's `puna` and `basin` stations keep only the sites the Hearths do not take (the e inner wall's vent, the one at the east, the Lesser Throne) |
| Out of scope | the Tungangs' loj as architecture (their kit, when it exists; this kit publishes the chamber and the sites), Ledge and Dalab's road (the riftrim plan), the animals' models (`kits/fauna`), the ore nodes' data (`kits/resources`) |

Not a new biome in the gallery: the stations are published with their hosts' pages. `biomes/README.md`'s table gets one
row for `hearths/` as a shared kit.

## 1. The idea

A **hearth** is a vent of the heat-pipe crust (`LORE.md` section 2, "Why Krator is volcanic": the shell loses its heat
through long-lived vents) on cold high ground: fumaroles at 100-300 degC in the cracks, ground at 40-90 degC a hand down
for tens of metres round them, falling to the country's frozen soil a few hundred metres out, hot pools and sinter
between, and under it all the warm wet hypogene chambers the rift rim plan already gives the Tungangs for their holds
(`biomes/riftrim/PLAN.md`, "Caverns"). Earth has such ground (Yellowstone's thermal areas, Iceland's, Erebus's); Earth's
life there is microbial mats and a ring of frost-free moss. Krator's native lineage did something else with it.

**The hearth tree** is the native fungoid body (the owner's canon rule, 2026-11-02: "the native body is a host that
takes a partner; the partner decides" how it lives) carrying a **thermosynthetic partner**: an organism that harvests a
temperature cycle rather than light or redox. The idea is Muller's thermosynthesis (the hypothesis that the first life
on Earth harvested the thermal cycling of convection cells through a membrane-bound enzyme that binds its substrate at one
temperature and releases the product at another); here it is the partner's whole economy, and the host has built a body
round it:

- **The foot** is a flat fleshy mass pressed to the hot ground, a metre or three across, that creeps toward hotter
  ground over the years as a root creeps toward water: **thermotropism**, the first tropism.
- **The stalk**, 2-12 m, is a **heat pipe**: a sealed hollow stem with a brine inside that boils at the hot foot and
  condenses at the cold crown, so the stalk carries kilowatts of heat upward with no pump, as an engineer's heat pipe
  does. The partner's cells ride the brine and are cycled hot and cold every few seconds: that cycle is the engine.
- **The fans** are the crown: thin black ribbed membranes a metre or two long, a dozen to a stalk, that open flat to the
  sky at night and radiate and convect the heat away, so the engine's cold end stays cold. They open **toward the
  coldest sky**, which is the zenith on a clear night: the second tropism, the sun's opposite. By day they fold shut
  into a **spindle** whose outer skin is silvered, because sun on a radiator warms its cold end and stops the engine.
- **And the spindle's outer skin carries a light partner too**, green under the silver where it faces the sun: a hearth
  tree photosynthesizes a little by day and runs its engine by night, and leans for both: the stalk bows sunward through
  the day and the foot inches toward the heat through the years. **One body, two suns, two tropisms of equal weight**,
  which is the owner's brief in one organism.

The arithmetic (section 3) says a hearth tree on hot ground out-earns a leaf of the same crown five to ten times, so
inside the warmth the heat-eaters are the forest; outside it, where the ground is frozen, they cannot stand at all, and
the host kit's light-eaters (the glass rim's light-piping forest, the Oidong rim's cushions) take over. So every hearth
reads from the air as a **disc**: black fans and steam at its centre, a ring where black fans and glass crowns interleave,
the cold country beyond; and the disc is not where it was: the hot ground shifts over decades as the vent's plumbing
does, and the hearth trees walk after it, under a metre a year (the owner, 2026-11-02), so round every live disc lies a
ring of **the dead**, white hollow stalks standing where the heat used to be, and the field's history is drawn on the
ground in rings, as a slime mould's trail is: a metre a year is a kilometre a millennium, and the oldest rings predate the
Ancients.

So four things are one here: the vent (the ground's sun), the sky (the engine's cold end), the organism (the heat pipe
between them) and the clock (night, day and the eclipse decide when it works). A traveller reads the ground's heat off
the black discs, the hour off whether the forest is black or silver, and where the heat has gone off the rings of dead.

## 2. Why it is alien, and why it is Krator's

### What a reader has not seen

- **Life that eats a temperature difference.** Not warmth as comfort (every Earth thermophile wants that) and not the
  vent's chemistry (the Throne's sulphur life, the Gills' redox) but the gradient itself as the food: a forest of heat
  engines, each a living heat pipe between hot rock and cold sky.
- **A forest that works at night and sleeps by day.** Open and black under the stars, shut and silver under the sun,
  and the whole field changes state in a quarter of an hour at dusk and dawn, and at noon in the eclipse seasons when
  the sun goes behind the giant. Nothing on Earth is more alive at night than by day for a reason you can compute.
- **Two tropisms in one body.** The stalk to the sun, the foot to the heat, the fans to the cold: a plant whose shape
  is the vector sum of three pulls, so that a field of them is a diagram of where the heat is, where the sun passes and
  where the clear sky lies.
- **A forest that walks after its fire** at metres a year and leaves its dead standing in rings: the field's history on
  the ground.

### The trends it extends (what Krator's native life already does)

| Trend (the files) | How the Hearths carry it |
|---|---|
| Native life is vent-born and clusters on geology's energy (`biomes/throne/NOTES.md:87-96, 293`; `biomes/godthrone/PLAN.md:192-201`) | its energy is the vent's heat itself, taken the one way no biome has taken it: as a gradient, not as chemistry |
| Where Earth life fails, native life is the whole flora; where Earth life is strong, native life is a flavour (`throne/NOTES.md:88-89, 273-275`) | the heat-eaters own the warm discs where frozen ground stops everything else, and stop dead where the ground is cold; the host's light-eaters own the cold country. The boundary is a ground temperature, and it moves |
| Native forms answer one physical problem each, and a kit's family reads as one (`biomes/riftrim/PLAN.md:109-113`: the rim's own plants "store heat" against the cold) | the rift rim's rule taken to its end: these do not store heat, they live on it; every species here answers the gradient (how to touch the heat, how to carry it, how to shed it, how to shade it from the sun) |
| The body is a host that takes a partner, and the partner decides how it lives (canon, the owner, 2026-11-02, `biomes/gills/PLAN.md` section 2) | a third partner kind, **heat**, beside light and redox, and the first body that carries two partners in two places (light on the spindle's skin, heat in the stalk): *proposed* as an amendment to the rule (section 17) |
| Life carries state on the sky's cues: everything leans to the giant (`biomes/ehighlands/NOTES.md:117-122`), the sun-dial turns with the sun (`biomes/sedesert/PLAN-STEPPE.md:61`), the night rosette closes at night (`rift/PLAN-STATIONS.md:203`), the Gills breathe on the tide | the Hearths run on the day and on the eclipse: the one biome the eclipse seasons change, opening at noon for the two hours the sun is gone (`LORE.md` section 2: "for about two and a half months the sun passes behind the giant every day, for up to two hours") |
| Native life is the natives' armoury, medicine and trade (`throne/NOTES.md:109-134`; `riftrim/PLAN.md:287-288`: the Tungangs' dark crops in the warm chambers by the vents) | the Tungangs' holds are under these very vents; the hearth wax is their food and lamp, the stalk's brine their cold remedy; Dalab holds Ledge "to study the rim's flora and fauna ... for useful genes" (`LORE.md` 6.1), and this is the plant it came for (section 9) |
| Native fauna are vertebrate-grade hexapods coevolved with the flora (`biomes/outlands/PLAN.md:57-58`; `kits/fauna/BIOME-FAUNA-PLAN.md:52-54`) | three hexapods on the heat (section 8) |
| Lineages cross kits as cousins (`BIO.kin`; `hyperjungle/PLAN-LANDS.md:49-56`) | the hearth tree's fans are the frill line's fins turned radiator; the ember mat is the Throne's thermal mats' kin; the two countries (the rim's and Oidong's) are sister forms by cold |
| Nothing lives on active heat (`throne/NOTES.md:287`: "nothing lives on its hot ramparts or its cones") | kept: the fumarole mouths and the boiling pools are bare; the Hearths stand on warm ground, not hot, and the plan says where the line is (section 3) |

### Where it breaks a trend, and why the break is earned

- **Native life in full sun, on cold high ground, as the biggest thing there.** The native lineage so far is the dark's
  and the vent's ("dim, buried, acid, fed by the volcano", `throne/NOTES.md:79-85`) or small and weird; where it meets
  the open sky it is a flavour. The Hearths are native, out in the open, at 3.4-4.3 km under a fierce sun, and they are
  the forest. The break is earned by the arithmetic: a vent field's heat flux is a hundred times the sun's usable
  yield, and only a heat engine can take it; the light-eaters lose that ground on the numbers.
- **The native thing here is silver and black, not iridescent or glowing.** Iridescence and glow are the native
  signatures (`rift/NOTES.md:94-105`; `throne/NOTES.md:80`). A radiator must be black; a sunshade must be a mirror; both
  are the physics, not a palette, and the owner has already approved one native biome without them (the Gills). The
  host's glass forest beside them keeps the family colours.
- **A tropism away from the sun.** Everything on Krator that leans leans toward something warm or bright (the giant, the
  sun). The fans lean to the cold. It is the first negative tropism in the world, and it is what the brief asked for.

## 3. The physics, honestly

All numbers from scale model 5.1 at the two sites (section 5) and the model's air law, 1.6 x exp(-h/8000) atm.

- **The ground's heat.** A heat-pipe vent field: fumaroles at 100-300 degC along the cracks, boiling pools, and warm
  ground round them whose temperature falls from ~90 degC at the cracks to the country's soil (frozen most of the year at
  these heights) over 50-300 m. Earth's thermal areas conduct 50-500 W/m2 through their warm ground and kilowatts a
  square metre at the vents themselves; Krator's heat-pipe crust runs 2-5x Earth's mean flow (`LORE.md` section 2), and a
  vent concentrates it. Take **300-1,000 W/m2** through the warm ground a hearth tree stands on.
- **The cold end.** At 3.7 km on the rift rim the night air is -10 to -17 degC in winter and about +2 in summer; on
  Oidong's rim at 4.3 km, -16 to -25 and -3. A black fan at +10 degC radiates 364 W/m2 (sigma T^4); a clear dry sky at
  these heights returns 150-220 W/m2, so the net radiative loss is **150-200 W/m2 of fan** on a clear night, near zero
  under cloud. The wind (7-9 m/s on both sites) convects more: 20-40 W/m2 per degree of excess in air of Earth's sea-level
  density (1.0 atm here), so a fan 20 degrees above the air sheds **400-800 W/m2**. Call it 500 W/m2 a side on a clear
  windy night, both sides working.
- **The heat pipe.** An engineer's heat pipe carries kilowatts through a tube a few centimetres across (its limit is the
  vapour's sonic flow, not conduction). A hearth stalk 10 cm across with brine at 60-90 degC inside moves **5-15 kW** from
  foot to crown with no muscle; a crown of twelve fans, 20 m2 of surface, sheds it at the rate above. The foot must draw
  that from 10-30 m2 of warm ground at 300-1,000 W/m2: so a hearth tree's foot is a metre or three across and its stand
  is spaced by the ground's heat, as trees are spaced by light.
- **The engine.** Carnot between 350 K and 280 K is 20%; Muller's thermosynthesis in a cell cycled between the two ends
  would do perhaps a tenth of that: **2-3% of the heat throughput**, 100-400 W per tree, against the 50 W a leaf crown of
  the same 20 m2 makes from the sun at 1% of 250 W/m2. **Five to ten times a plant's yield, on the warm ground only**:
  the ratio that makes the heat-eaters the forest inside the disc and nothing outside it. The light partner on the
  spindle's skin adds the leaf's 50 W by day, which is why the hearth tree keeps it.
- **Day and night.** By day the sun would put 600 W/m2 onto an open fan and warm the cold end; the engine would run
  backward at the surface. So the fans fold into a spindle whose outer skin reflects (the owner's lineage has sealed
  skins already: `outlands/PLAN.md:53`), and the engine idles on the stalk's conduction alone. At dusk the fans open in
  minutes (a turgor hinge at each rib's root: the fans are the frill line's fins on a hinge). The **eclipse**: in the two
  and a half months round each equinox the sun goes behind the giant for up to two hours a day; the sky stays bright
  but the fans' solar load is gone, so the field opens at midday and shuts again when the sun comes out. A traveller in
  eclipse season sees the forest open twice a day.
- **The seasons.** Winter is the engine's best season (the coldest sky) and the plant's worst; so the Hearths grow in
  winter and rest in summer, the reverse of everything round them, and the field is **snow-free and steaming in a white
  country**: the fans at +10 degC melt what falls on them, the warm ground melts what falls on it, and the disc's edge is
  the snow line. From the rim's lakes the Hearths are black discs on the snow with steam over them.
- **The walk.** A vent field's hot spots shift over decades (Yellowstone's thermal ground migrates tens of metres in a
  human lifetime as the plumbing seals and reopens). The foot creeps toward the warmer side at **under a metre a year**
  (the owner, 2026-11-02; a fleshy mass growing on one side and dying on the other, as a lichen's thallus advances); a
  stalk that finds its ground cooling dies standing, white and hollow, and a new one is budded on the warm side. The
  rings of dead round a live disc are centuries of movement, legible as the Gills' laminae are; a field that has moved
  a kilometre has been moving since before the Ancients came.
- **Where life stops.** On the fumarole mouths and the boiling pools nothing stands (the Throne's rule): the ember mat
  takes the ground over 60 degC, the hearth trees 25-60, the mixed ring 10-25 with the host's light forest, and under 10
  the heat-eaters fail. The hot pools carry the geyser kit's temperature-banded mats, which are Earth's chemistry and
  keep Earth's bands (`biomes/geyser/NOTES.md:155-156`).
- **Why it must be alive.** A dead heat pipe (a hollow stalk) would still carry heat for a season; it could not move its
  foot to follow the heat, could not fold its fans against the sun or open them for an eclipse, could not meter its brine
  to the sky's cold, and would fill with the wind's dust in a year. The living hearth does all four and sheds its wax to
  the animals and the Tungangs besides.

## 4. Ideas considered and set aside

1. **Black smokers on land.** The brief's literal reading: vents jetting 120 degC sulphide brine into 2 atm air (water
   boils at ~120 degC there), building chimneys of chalcopyrite, with chemosynthetic reefs on them. Set aside: the
   Throne's vent country owns sulphur chemotrophy crusted in its own sulphur (`throne/NOTES.md:293-297`), the Gills own
   the chimney organism, and the Rift floor, where the dense air would allow it, is the Rift kit's. Its one good image, the
   black sulphide "snow" that settles downwind of a smoker, is kept as the Hearths' hazard (section 9).
2. **The thermophile colour field.** A vent biome told by its temperature-banded mats, blue at the boil to orange at the
   edge. Set aside: the geyser kit owns it (`biomes/geyser/NOTES.md:140, 206-216`), and it is Earth's chemistry at any
   rate; the Hearths read it in place at their pools.
3. **The heat-seeking herd.** A forest that migrates toward heat as its whole idea: trees that walk after the vents.
   Set aside as the main idea because the walking steppe owns motion ("everything here travels", `nsemiarid/PLAN.md:154`);
   kept as the Hearths' slow second movement (metres a year, read off the rings of dead), which the heat engine makes
   necessary rather than decorative.
4. **The thermal wire.** Electrochemistry across the vent's gradient, hot anode in the ground and cold cathode in the
   air, as cable bacteria run electrons through a metre of mud. Set aside: it is the Gills' redox economy with a
   thermocouple attached, and the Gills already own "the land is wired" as their rejected rival.
5. **Convection-cell life.** Muller's original setting: cells riding a hot pool's convection and harvesting the cycle,
   so the pools themselves are alive. Set aside as the whole biome: it is a pool, a few metres across, and a page needs
   a forest. Kept as the Hearths' origin story (section 10) and as the kettle cup's economy (section 7).

The Hearths beat them because the mechanism is one sentence a physicist would sign (a living heat pipe between hot
ground and cold sky, run by thermal cycling), it is visible every day from across a lake (black discs steaming in the
snow, silver by day, black by night), it needs Krator (a heat-pipe crust whose vents stand on cold high ground, dense
air to convect, a leafless lineage of hosts that take partners, an eclipse season to open the forest at noon), and it
answers the owner's brief exactly: here the ground's sun matters as much as the sky's, and the plant says so with its
shape.

## 5. Where it is on the model (scale model 5.1, surveyed 2026-11-02)

Every non-geyser vent on the model was surveyed (`DATA.vents`: 31, with its climate, polygon and nearest settlements).
A hearth wants **a vent on cold high ground under a clear sky**: the colder and clearer the sky, the better the engine.
That rules out the Steampits and the Rift floor (hot dense air at 1.9-2.2 atm: no gradient, and the geyser and Rift
kits' ground), the Throne's and Godthrone's airless summits (no air to convect, no liquid brine), the Lesser Throne (too
young, and the inner crater: the owner's rule for the Gills, 2026-11-02, is kept here too) and the twins (the Gills').
Two fields remain in the old map, and both are in planned kits' country with nothing planned at their vents:

### The Hearth field: the rift rim's north side (station of `biomes/riftrim`)

Three vents on the rim and the western highland, 100-190 km apart, each on its own cold shelf above the Rift's trough:

| Vent (5.1 px) | Height | Air | Rain | Mean (warm/cold) | Night low | Class | Wind | Polygons | Nearest |
|---|---|---|---|---|---|---|---|---|---|
| **525,1400** (the showcase) | 3,737 m | 1.00 atm | 753 mm | +2 (14/-10) | -17 | Dsc | 9.4 m/s | `rift rim N`, Fellgangs | Chimes 115 km, Nulab 183 km |
| 477,1367 | 3,448 m | 1.04 | 1,082 mm | +3 (16/-10) | -17 | Dfb | 6.8 | `w rift highland`, Dalab Council, Fellgangs | Chimes 53 km, Nulab 70 km |
| 430,1388 | 3,740 m | 1.00 | 863 mm | +3 (16/-10) | -18 | Dsb | 8.2 | `w rift highland`, `rift rim S`, Dalab Council, Fellgangs | Nulab 64 km, Chimes 76 km |

- **The ground round the showcase vent** (px 525,1400): a shelf at 3.5-3.7 km (Dsc, 500-750 mm) running 60 km north
  to the rim's crest at 4-4.5 km (Dfc), the trough's edge 12 km south where the ground falls from 3.4 km through Csb at
  2.4 km to the Rift's floor at -1.6 km (XA, 1.9 atm) within 30 km; the N rim's lake chain (1.9-3.4 km) east and west.
  The rift rim plan's N rim is the **glass rim**: "tall columns over still lakes, the forest and its reflection", light-
  piping translucent tissue (`riftrim/PLAN.md`, "The N rim"): the light-eaters the Hearths stand among.
- **The caverns**: the rift rim plan puts lava tubes round exactly these three vents and the Tungangs' holds in "the
  warm, wet hypogene chambers by the vents above all" (`riftrim/PLAN.md`, "Caverns", "Natives"): the Hearth field's warm
  ground is the roof of a loj. Station 2 goes down into it.
- **Who holds it**: the Fellgangs' political polygon covers all three vents; Dalab Council's the western two. Ledge
  (5.1 px ~437,1330) is 110-120 km west; Dalab's road comes out of the Outer Wall there and runs by the western vents.
  Chimes (the gorge's foot, 53-115 km) and Nulab (64-183 km) are the nearest markers.
- **Age**: the Rift is tidal, old and heat-pipe fed ("the Rift and the vent fields take the rest", `LORE.md` section 2);
  the rim's vents are as old as the rift's shoulders. Rings of dead hearths go back as far as the owner likes.

### The Cold Hearths: the Oidong Valley's north rim (station of `biomes/oidong`)

| Vent (5.1 px) | Height | Air | Rain | Mean (warm/cold) | Night low | Class | Wind | Nearest |
|---|---|---|---|---|---|---|---|---|
| **1186,1591** (the station) | 4,333 m | 0.93 atm | 110 mm | -3 (10/-16) | -25 | Dsc | 8.0 m/s | Longsong 106 km |
| 1097,1583 | 3,322 m | 1.06 | 157 mm | +4 (15/-7) | -14 | Dfc | 10.3 | Strongbow 144 km |

- **The ground**: the valley's north rim, the "Tibetan cold desert above the valley" of oidong's planned station 2
  (`biomes/oidong/PLAN-STATIONS.md`: "bare gravel plains and scree under huge skies, cushion plants and the snow lotus,
  cairns and prayer-stone piles"), 110 mm of rain, so **the clearest sky of any vent on the model**: the engine's best
  country. The upper vent sits at 4.3 km with ET ground rising north to 5-5.6 km and the Vale's lake (1,469 m, WH) 24 km
  south down the valley wall; the lower vent on a 3.3 km shelf with the Cfb valley floor 12 km south.
- **Who holds it**: the Monks of History (Longsong, 106 km down the valley; the pilgrims' road to the passes). The
  valley's rule is serenity, "nothing that stings or burns" (`biomes/oidong/NOTES.md`); the Hearths are on the rim above
  it, warm, silent and harmless but for the vents themselves (section 9), and the valley kit's station 2 is the same
  cold desert: the Hearths are a disc in it, not a change to it.
- **The two vents are 5.1's** (`smodel/volcanoes.py`); no earlier plan names them. **Canon (the owner, 2026-11-02)**:
  they are the Oidong Valley's own warmth, the reason a chilly enclosed valley at 1.6-2.2 km has mirror-still pools that
  never freeze (*proposed* sentence for `biomes/oidong/NOTES.md` and `LORE.md` 6.15: "the valley's pools are kept open
  by the vents on its north rim").

### Both

- **Air**: 0.93-1.04 atm: anyone breathes here. A field is walked in a day.
- **The third field: the Godstep flank vent** (the owner, 2026-11-02; px 893,1145, 2,700 m, 1.14 atm, 110 mm, Dsc,
  +12 degC (25/-1), night low -12, the Talovolci's and Iziz's polygons): a small hearth field in the godstep plan's vent
  station ("the red cinder crater with its spring and moss lawn", `biomes/godstep/PLAN.md` station 3): the warmest and
  lowest of the three, so its discs are the smallest and its engine the weakest (a 12 degC mean against the rim's +2 and
  Oidong's -3), its fans broad and few like the rim's, its season the winter nights only; the Talovolci's processions up
  the god's stair pass it, and the plan leaves them a word for it (section 17).
- **The scale model**: no height, rain, river, vent or polygon change is proposed. The hearths' warm ground is
  kit-scale (hundreds of metres) and comes from the vent records.

## 6. The ground and the landforms (`core/terrain`)

- **The shelf** (the host's `KFIELD`): the model's heights at 1:1 with the host's own relief: the rift rim's benches of
  rift fill over basement (`KSTRATA` recipe `rift`, `core/terrain/STRATA-PLAN.md`), the N rim's lakes below; or Oidong's
  gravel plains and scree (`KRELIEF.pavement`, `talus`) with `KFROST` patterned ground.
- **The heat field** (`HEARTH.heat`, *proposed* core `KTHERM`, section 14): vents as point and line sources with a
  temperature and a reach, the ground temperature their sum over the country's soil temperature (from the model's
  climate), smoothly falling; the one field placement, the ground shader (snow-free, steaming, the sinter halo), the
  hazards and the Tungangs' chamber all read. Deterministic from the vent records (`KRAND` by cell for the detail).
- **The vents** (`KRELIEF` kinds `pit` and the geyser kit's fumaroles): cracks and small craters along a fissure line
  through the field, fumaroles steaming from them (core/atmos steam), **hot pools** (`WATER.spring`, the geyser kit's
  temperature ramp and banded mats, `core/water/geyser/`), sinter aprons (`stone.geyserite`), sulphur on the lips.
- **The discs**: round each hot ground the hearth stand, spaced by the heat; outside it the dead rings (white stalks,
  `KSTACKS` bodies of a *proposed* kind `stalk` or `BIO.fung` tubes, collision from the record); outside that the host's
  forest, interleaving in the mixed ring.
- **The snow line** (core/atmos snow cover, `KGROUND`): the snow cover's mask reads `HEARTH.heat`, so in winter the disc
  is bare and dark in a white country, its edge following the 0 degC ground contour.
- **The hold** (station 2, `KCAVERN`): the hypogene chamber under the field, "huge chambers, gypsum blocks and
  chandeliers, few entrances, warm and wet" (`riftrim/PLAN.md`, "Caverns"), its roof the hearth stand's floor, the
  hearth trees' feet showing in the chamber's ceiling as warm pale domes, the Tungangs' dark crops (the mat, pale fungi,
  alecap, glow mushrooms: `kits/crops`' dark-grown crops) on the warm floor, a fumarole's shaft through it; walkable
  (`core/walk` written from the plan); the rift rim kit's caverns are the same module.
- **The Cave of Crystals** (the owner, 2026-11-03): the hold's **drained older storey** is a Naica. Selenite beams cross its chambers and blocky crystals stand on its floors, grown when the water stood there just under 58 degC for ages, then left when the table fell. It is still hot and close to saturated, so a `heat` hazard with `soak` covers it (the station's to add) and `slip` lies on the beams. `KKARST` `crystal:{storeys:[1], speleo:'SELENITE'}`, then `KSPELEO.SELENITE` over its crusts (`biomes/CRYSTAL-CAVES-5.1.md`, site 1). The active storey below keeps the hold's hypogene dress.
- **The far field and the horizon** (`KFAR`, `KHORIZON`): the rim's crest, the trough's far wall, the lakes, the other
  discs' steam as sprites; on Oidong's rim the valley's lake and the Vale's walls.

Fields and seeds are deterministic from the terrain and the vent records (`KRAND` by cell), as every kit's.

## 7. The flora: native, the gradient's

**The rule that keeps it one family:** every species here lives on the gradient and answers it one way: it touches the
heat, carries it, sheds it, or shades it from the sun. Every one is fungoid (fleshy, partnered, sealed skins, no leaves).
Palette: black (the radiators), silver (the sunshades), the pale of dead stalks, sulphur yellow and sinter white on the
ground, the host's teal and glass beside them. Nothing glows; nothing is iridescent. Working names.

| Key | Name | Where (ground temperature) | What it is |
|---|---|---|---|
| `hearth` | **Hearth tree** | 25-60 degC ground | the engine: a limpet foot 1-3 m across, a heat-pipe stalk 2-12 m, a crown of 8-16 black ribbed fans 1-2 m long. Fans open flat to the zenith at night and in eclipse (`HEARTH.work`), fold into a silvered spindle by day; the spindle's sun side carries the light partner (green under the silver). The stalk bows sunward by day (`39-core-lean.js` toward the sun's mean bearing), the foot's record carries its walk (section 3). The two countries differ in dress (section 7a). The fans are the frill line's fins on a hinge (`BIO.kin` of the Rift's frill) |
| `stalkdead` | **Dead stalk** | the rings round each disc | a hearth tree whose ground went cold: foot gone, stalk standing hollow and white, fans fallen; a `KSTACKS` `stalk` or `BIO.fung` tube with collision; the field's history. Snaps in the wind; a fallen one is a pipe the Tungangs cut |
| `ember` | **Ember mat** | 60-95 degC: the fumaroles' aprons | a flat black fleshy mat on the hottest ground a hearth cannot stand, its surface a radiator without a stalk, warm to the hand; kin of the Throne's thermal mats; the first native thing on new hot ground |
| `kettle` | **Boil cup** (was "kettle cup": the geyser kit already has a kettle lily) | the hot pools' rims, 40-80 degC water | a cup 30-80 cm across rooted in a pool's rim with its bowl in the water: the pool's convection cycles the partner's cells for it (Muller's own setting, section 4): a hearth tree with the pool for a stalk; its lip above the water is a small black fan |
| `stoker` | **Stoker** | the discs' edges, 10-25 degC | a creeping heat-seeker: a fleshy runner a few centimetres thick that advances a hand's breadth a year toward warmer ground, a line of small black fins along its back; the first heat-eater onto ground that is warming and the last off ground that is cooling, so the stokers point the way the heat is moving |
| `shade` | **Shade cap** | the mixed ring, among the host's forest | a native light-eater of the gradient's edge: a pale cap on a short stalk whose cap tilts to shade a hearth tree's foot at noon and folds away at dusk; the two grow together (the hearth's warm ground is the cap's only frost-free bed) |
| `coal` | **Coal moss** | 20-40 degC, the discs' floor | a black fleshy turf between the stalks, warm, snow-free, the hearth animals' bed; stores the day's heat and gives it up at night |
| `tallow` | **Tallow bead** | on the hearth trees' stalks | the small-and-weird: beads of pale wax the stalk exudes where the brine's heat is surplus, melting and dripping on warm days, setting hard on cold nights: the **hearth wax** (section 9), gathered by the Tungangs and eaten by the fin-mice |

### 7a. Two countries

As the Gills have a red and a white dress, the Hearths have two by their cold:

| | **The rim's Hearths** (3.4-3.7 km, 750-1,080 mm, cloudier) | **The Cold Hearths** (Oidong's rim, 4.3 km, 110 mm, clear) |
|---|---|---|
| Fans | broad, few, held high: the sky is often cloudy, so the fans work the wind (convection) more than the stars: paddle-shaped, on tall stalks in the wind | narrow, many, low: the sky is clear and the air thin and still at night, so the fans work the stars: many fine ribs close to the ground, the stalks short, the crown a black rosette on the gravel |
| Spindle | silver-grey, the green partner strong (more rain, more cloud, more leaf) | bright silver, the green faint (the engine is everything here) |
| Stand | discs 100-300 m across among glass columns and lakes | discs 50-150 m across on bare gravel, the only dark thing for kilometres |
| Dead | white stalks standing in rings | stalks snapped by the wind, the rings drawn in fallen pipes |
| Season | winter the working season; summer idle | winter the working season; summer nights still work |

### 7b. The hot-country cousin: the Stills (the geyser kit's station; the owner, 2026-11-02: at all three sites)

The Steampits, the West Ring's geyser isles and the Throne's geyser isle stand at -400 to -1,600 m, 1.9-2.0 atm, +32-34
degC (37/28, never under +22 at night), 1,000-1,900 mm, with 3.5-5.5 m/s of sea wind (the model's six Steampits vents and
the Ring Sea's geysers, `DATA.vents`). The Hearths' engine as written would not run there: no cold sky, no frozen ground.
But the hot end is better. **Water boils at 119 degC at 1.9 atm**, and the basins are full of boiling springs. So the
cousin keeps the heat-pipe stalk and the thermosynthetic partner and swaps both ends:

- **The hot end is the water.** A still tree's foot stands in a boiling pool or on a geyser's cone with its roots in the
  119 degC water: hotter than any warm ground the rim's hearths get, and the water's heat transfer is in kilowatts a
  square metre a degree, so the stalk's heat pipe, not the foot, is the limit.
- **The cold end is the wind.** Air at 2.3 kg/m3 convects hard even at the basins' 4 m/s: a fan at 70 degC in 33 degC air
  sheds about **2 kW/m2**, ten times what a Hearths fan radiates to a clear night, and it needs no sky, so **the engine
  runs day and night** (392 K against 343 K: Carnot 12%, a realised 1.5-2%). The daily yield is twice the Hearths', the
  dense air lets a thicker stalk carry more (a 30 cm stalk 50-150 kW), so the still trees are **15-30 m**, the biggest
  the lineage grows, standing where the hypertrees cannot (the sinter aprons, the boiling margins).
- **No fold: a feather.** Sun on a 70 degC fan costs a third of its cooling, not the engine, so by day the fans turn
  **edge-on to the sun** as a sun-dial does in reverse and stand **across the wind** like sails: a whole basin of them
  faces the sea breeze and turns through the day with the sun. The third tropism, to the wind, is the cousin's own.
- **The geyser rule.** A fan in a geyser's spray is scalded, so the trees ring each geyser at its spray line, and **they
  fold during the geyser's warning phase and eruption** (`WATER.geyser`'s `pre` and `dur`, the geyser kit's real
  periods): a visitor sees the ring round a cone flinch shut a minute before it blows and open again as the column falls.
- **The dead are glass.** The geyser kit already drowns its dead forest in silica; a dead still tree silicifies the same
  way, standing white and glassy by the pool that killed it when the plumbing shifted, hollow, ringing when struck.
- **Why not the whole shore.** Only boiling water feeds the engine; a warm pool at 60 degC gives a tenth of the gradient
  against 33 degC air. So the Stills stand only where the water boils: a ring round each spring and cone, nothing between.

| Key | Name | Where | What it is |
|---|---|---|---|
| `still` | **Still tree** | the boiling springs' rims, geyser cones outside the spray line | the cousin: a foot in boiling water, a 30 cm heat-pipe stalk 15-30 m, 12-20 black fans 2-4 m long held across the wind and edge-on to the sun, folding on the geyser's warning (`WATER.geyser` state). Sister form of the hearth tree (`BIO.kin`): the same fans without the silver, the same stalk thicker, no walk (a spring does not move; a tree stands or dies). Its tallow runs in the heat and pools at the foot |
| `stillglass` | **Glass still** | by dead springs | a silicified still tree, white, hollow, standing; the geyser kit's silica drowning on the lineage's own body |
| `sailcup` | **Sail cup** | the warm run-off channels (40-80 degC) | the boil cup's hot-country form, its lip a small fan across the wind; the mat-banded run-off's one native |
| `spraymat` | **Spray mat** | inside the spray line, where a still tree cannot stand | the ember mat's cousin on the scalded ground round a cone, black, flat, wet, re-growing after each eruption |

The Stills' people: the Steampits' shore is **Screamer Country** (Fort Kalor 20 km from the vents, Kierson 27-50 km)
and **Shell Province**'s Izani at Port Goto (60 km); the isles are the Islanders', the Hykkousoi's and Voth's by the
Ring Sea's fleets. *Proposed*: the still trees' wax is the isles' lamp oil, and a still tree's hollow glass is a horn.
Their fauna: the fin-mouse and fin-owl in hot-country coats, and the Steampits' own (the geyser kit's and the
hyperjungle's) read in place; no stalker (nothing needs the warmth here).

### Guests, read in place

- `biomes/riftrim`: the glass rim's light-piping forest (its own species by key) as the light-eaters outside and in the
  mixed ring, its lakes, its caverns; nothing copied.
- `biomes/oidong`: the high passes' cushions, snow lotus and sky poppies on the cold ground round the Cold Hearths.
- `biomes/geyser`: the hot pools' temperature-banded mats and the fumaroles' steam (`WATER.spring`, the kit's ramp).
- `biomes/ehighlands`: the glass tower on the Oidong rim's scree (`EHIGH.make`/`grow`).

## 8. Fauna (`kits/fauna`)

Native, vertebrate-grade hexapods on `faWdHex`'s `amb` anatomy (`kits/fauna/BIOME-FAUNA-PLAN.md:52-54`), named here and
built there, drawn from the fauna bundle, never in the kit. Every animal here is **nocturnal and warm-seeking**: the
disc is the only warm ground in a frozen country and the forest is open only at night.

| Key | Name | Status | What it does |
|---|---|---|---|
| `cinder_crawler` | cinder crawler | in `kits/fauna` (vents) | read in place: grazes the ember mats' edges by night |
| `frost_trunker` | frost trunker | in `kits/fauna` (cold plateau) | read in place: comes in off the cold country to sleep on the coal moss |
| `cavern_leaper` | cavern leaper | in `kits/fauna` (caves and lava tubes) | read in place: the hold's animal, up the fumarole shafts at night |
| `finmouse` | **Fin-mouse** | new | a hand-sized hexapod that lives in the folded spindles by day and eats tallow beads by night; the disc's most common animal and the fin-owl's food |
| `finowl` | **Fin-owl** | new | a six-limbed night flyer (kin of the hyperjungle's fang glider) that roosts in the open fans' warmth and hunts the fin-mice over the disc; it leaves at dawn when the fans close on it |
| `hearthstalker` | **Hearth-stalker** | new | an ambusher that lies on the warm coal moss by night, the colour of it, taking what comes in off the cold to warm itself: the disc's hazard `hunter`; kin of the Rift's gapemaw |

The herds "have nothing to run from" is the owed gap in two kits (`hyperjungle/NOTES.md:77`); here the predator lies
where the warmth is.

## 9. Resources, crops, hazards, people

- **Hearth wax** (`kits/crops`, zone `hearths`, `how: node`): the tallow beads, gathered off the stalks at dawn when they
  have set: a clean-burning wax that is also food (the Tungangs' lamp and their fat in a country with no sun crop:
  "they farm the dark", `riftrim/PLAN.md`, "Natives"); the one staple. *Proposed*: the Tungangs' trade good to Dalab at
  Ledge, and the smell of a loj.
- **Stoke** (the medicine): the stalk's brine, tapped from a cut stalk: a draught that raises the body's heat for a night,
  the Tungangs' and the Monks' cold remedy on the passes; too much is a fever that kills. The same plant, two uses, as
  the glass tower's pallidine (`ehighlands/NOTES.md:158-168`).
- **Ore** (`kits/resources`): the vents' cracks carry sulphur (the field's `sulfur` family is already highest within 40 km
  of a vent, `kits/resources/GEOLOGY.md`) and sulphide: *proposed* owner nodes of family `copper` at the fumarole lines
  (the volcanic province's porphyry copper, here as vent sulphide), grade medium; no new family.
- **Dalab** (the owner, 2026-11-02): Dalab holds Ledge "to study the rim's flora and fauna ... for useful genes"
  (`LORE.md` 6.1, 6.21), and the hearth tree is **one of the things its genepriests come over the rim for**, not the one
  thing: a body that lives on warmth, beside the glass rim's light-piping tissue, the Tungangs' own cold and dark genes and
  whatever else the rim grows. What Dalab means to do with it is the owner's; the plan only puts the plant in reach of
  the people who collect peoples.
- **Hazards** (`core/hazard`, every one a `core/tags` record with `tags.hazard` registered before it is drawn, steady or
  on `HEARTH.work`): the **fumaroles** and their aprons (`heat`, burn, steady, danger 1 at the mouth), the **hot pools**
  (`heat` + `drown`), the **gas** at the fissure's low points (`gas`, suffocate: CO2 and H2S pooling on still nights, the
  Throne's CO2 hollows' kin, danger 1 on the floor), the **sulphide snow** downwind of a smoking crack (`poison`, mild,
  on the wind), **thin ground** over the chambers (`sink`, trigger `weight`), the hearth-stalker (`hunter`, on the
  night). The tell: steam, yellow lips, black snow, the stalker's shape in the coal moss.
- **People**: no one lives on the discs. **The Tungangs** (`LORE.md` 6.1, `riftrim/PLAN.md` section 6: "born to the dark",
  "dazzled by daylight", "they come up at night") live under them in the hypogene holds the vents warm, and the Hearths
  are their surface: a forest that opens at night for a people who come up at night, where they gather wax by the fans'
  faint warmth and cut dead stalks for pipes. **Canon (the owner, 2026-11-02)**: a loj names itself for its hearth, and
  the walk of the disc over the centuries is in its sagas (the stewards moved the hold when the heat moved). **Dalab** at Ledge, 110-120 km west,
  sends its genepriests to the western vents by its road. **The Monks** on Oidong's rim: the pilgrims' road to the passes
  runs by the Cold Hearths, whose warm coal moss is the one place to sleep out on the pass (*proposed*: a cairn and a
  prayer-stone pile at the disc's edge, and the valley's never-freezing pools explained by the vents). **Hazard to all**:
  the gas at night, which the Tungangs read by their lamps' flames.

## 10. Where the lineage began (canon, the owner, 2026-11-02)

Canon says Krator's own life began "round volcanic vents" on a tidally heated moon (`throne/NOTES.md:87-89`). Muller's
thermosynthesis is a theory of the origin of life: the first energy was the thermal cycling of a hot pool's convection.
**The kettle cup is the native lineage's oldest living habit**, the host body still sitting in a convecting pool with
its partner cycled by the water, and the hearth tree is what the lineage made when it took the convection cell inside
itself as a stalk and carried it out of the water onto the ground. The light partners and the redox partners came later,
as the lineage spread to where the heat was not. *Proposed* wording for `LORE.md` section 8, after the lineage rule the
Gills plan proposes: "The lineage began in the vents' hot pools, where the first partner lived on the water's convection
carrying it hot and cold; the kettle cup still does, and the hearth tree carries the same cycle in its stalk. The light
and redox partners came later, where the heat was not."

## 11. Stations

Each station is its host kit's and takes the date and hour from its `99-host-take.js`; the host's time control moves
through the day, the night and (in season) the eclipse. `HEARTH.work(t, W, atm)` in `0..1` drives the fans' opening, the
spindles' silver, the steam, the snow line's edge, the hazards and the animals together.

1. **The Hearth field** (riftrim `--station hearths`, `dist/riftrim-hearths.html`; px 525,1400: 3,737 m, 1.00 atm, 753
   mm, Dsc, +2 degC (14/-10), night low -17; the rift rim's north shelf). A fissure line of fumaroles and three hot pools
   across a 3 km map; round them four discs of hearth trees 100-300 m across, the ember mats on the aprons, coal moss and
   stokers at the edges, the rings of dead stalks round each disc marking where the heat was, the glass rim's columns and
   a still lake beyond (read in place), the trough's far wall and the Rift's haze to the south. Set in winter. **The
   first ten seconds**: the camera stands at dusk on snow at a disc's edge; the field in front is bare, dark and steaming
   in a white country, the stalks silver-grey; the sun goes, and over a few minutes every spindle unfolds into a black fan
   and the discs go black from the centre out, steam thickening over them, the giant's light on the snow, a fin-owl
   lifting out of the nearest crown. The **noon** preset: the same field shut and silver, the spindles' sunward faces
   green, snow still absent on the warm ground, the fumaroles the only steam. The **eclipse** preset (an equinox day): the
   field opening at midday under a bright sky with the sun's disc behind the giant, and shutting again as the sun's edge
   comes out.
2. **The hold** (riftrim `--station hearths-hold`, `dist/riftrim-hearths-hold.html`; under the field): the hypogene
   chamber, gypsum chandeliers over a warm wet floor, the hearth trees' feet as pale domes in the ceiling, a fumarole's
   shaft of heat through it, the Tungangs' dark crops (the mat, pale fungi, alecap, glow mushrooms: the one glow here,
   and it is the crops', `kits/crops`) on the warm floor, the loj's site published as data; the night entrance up a tube to
   the disc's edge, where the fans are open overhead.
3. **The Cold Hearths** (oidong `--station hearths`, `dist/oidong-hearths.html`; px 1186,1591: 4,333 m, 0.93 atm, 110
   mm, Dsc, -3 degC (10/-16), night low -25; the valley's north rim): a single vent on bare gravel under a huge sky, one
   disc of low black rosettes 120 m across, the Oidong kit's cushions and snow lotus on the cold ground round it, the
   pilgrims' cairn and prayer stones at its edge, the valley's lake 24 km below and the Vale's walls beyond. Set on a clear
   winter night: the fans at their widest, every rib frosted at the tip and bare at the root, the stars and the giant,
   the disc's steam a thin column in still air. The noon preset: a field of silver spindles on gravel, snow in the lee of
   each; the summer-night preset: the engine still working in -3 degC air.
4. **The walk** (optional, a riftrim station `hearths-walk`, the western vent 430,1388): a hearth field that has moved
   a kilometre since before the Ancients came, its rings of dead stalks lying in a long arc across the shelf like the
   growth rings of a tree laid flat, the live disc at one end, the oldest rings fallen and overgrown by the glass forest
   at the other, Dalab's road passing it, a genepriests' camp (a site, not a building).
5. **The stair's hearth** (godstep `--station hearths`, `dist/godstep-hearths.html`; px 893,1145: 2,700 m, 1.14 atm,
   110 mm, Dsc, +12 degC (25/-1), night low -12; the valley's head): the small third field in the red cinder crater of
   the godstep plan's vent station: one disc of broad-fanned hearth trees round the crater's spring, the moss lawn and
   the lake in the older crater beside it with the Talovolci's walled fields, the Godthrone's mass up the valley. Set on
   a winter night, the one season its engine earns; the noon preset shows the field shut and silver in a warm valley,
   the only hearth that is often idle.
6. **The Stills** (**built 2026-11-03** in geyser's rebuild turn: `src/57-biome-hearths-stills.js` and the Stills' records and parts in `50`; what was built and the look decisions: `biomes/geyser/PLAN-STATIONS.md`, "Station 6 of the Hearths") (geyser `--station stills`, `dist/geyser-stills.html`; the Steampits showcase's ground, -1,440 m, 1.9
   atm, +33 degC): the geyser basin as the kit draws it (the sinter cones, the prismatic springs, the terraces to the sea,
   the dead forest in silica) with the still trees ringing every boiling spring and cone at the spray line, their black
   sails all across the sea wind and edge-on to the sun, glass stills by the dead springs, sail cups down the run-off,
   the hyperjungle's wall behind. **The first ten seconds**: the camera stands on a terrace at midday with the sea
   behind; the Old Kettle's ring of stills flinches shut, the geyser goes up, the column falls as rain on the folded
   fans, and the ring opens again into black sails steaming in the sun. The dusk preset: the fans turning with the
   sun's last bearing, the Screamers' fort lights on the shore. The same life is drawn by every page that loads the
   geyser kit (the West Ring's geyser isles, the Throne's geyser isle), at their own springs, with no station of their
   own.

## 12. How it reads, and what it costs

- **Geometry.** A hearth tree is a stalk (a low-poly tube, ~200 tris), a foot (a flattened dome, ~100) and 8-16 fans
  (two-sided cards with ribs in the normal map, 2 tris each) on `BIO.fung` and the core's instancing; 12-16 variants by
  height and fan count (`32-core-variants.js`); a disc of 300 trees is ~150 k tris and a handful of draws. The fold is a
  vertex-shader hinge on the `work` uniform (`BIO.animHook`, the `breath` mode the Gills propose, here driven by the
  day), so a thousand fans open at dusk for nothing. The dead stalks are the same tube in the `dead` dress. The ground
  is the host's field with the heat halo in the shader. Target: **under 5 M triangles and 60 draw calls per view** on
  the integrated GPU, measured as the Godthrone's `PERF.md` measures; the host's own forest is the larger cost.
- **The heat.** Steam is core/atmos's smoke kind on one emitter per fumarole and pool and a thin one per disc, rates from
  `HEARTH.heat` and the air temperature; the snow line is the snow cover's mask reading the heat field; the shimmer over
  the warm ground is the dense-air mirage term the atmos notes promise (`biomes/WORLD.md`), scaled by the heat. No
  per-frame CPU work: everything reads the clock, the weather and a baked field.
- **Light.** The shared sky with its eclipse seasons (`core/atmos/SKY-PLAN.md`: the sun behind the giant ~2 h a day for
  ~2.5 months round each equinox): `HEARTH.work` reads the sun's occultation from the sky model, so the eclipse preset is
  the real sky. Night: giantshine on snow and silver; no bioluminescence but the hold's crops.
- **Godot.** Everything above is data: the hearth trees are records with a walk vector, the heat field a baked raster
  with a GDScript twin, the fold a shader uniform from the clock, the hazards `Area3D`s, the chamber a `KCAVERN` export.
  Nothing needs a builder to port.

## 13. Core adoption (written before the first fragment, as `CLAUDE.md` asks)

The host kits (`biomes/riftrim`, `biomes/oidong`, `biomes/godstep`, and `biomes/geyser` for the Stills) own the ground,
the page and most of the core; `biomes/hearths`'s own
fragments are `[G data]` only (species, the heat field's records, the work function, dress, layout), and the drawing is
the host's and the core's. What the hearths stations need of the core, taken through the host's `build.py` (listed in
each station's `station.json`), and for each module not taken, why:

| Module | Takes | For |
|---|---|---|
| `core/biome` | `10-core-head`, `20-core-kit` (`BIO.INDEX_ITEMS`, LOD merge/fade/cull), `30-core-foliage` (A2C on the fan cards, the one wind), `31b-core-leafset`, `32-core-variants`, `33-core-fungoid` (`BIO.fung`: feet, stalks, caps, mats, cups), `34-core-impostor` (far stalks), `35-core-anim` (the fold: the `breath` scalar mode the Gills propose, driven by `HEARTH.work`), `39-core-lean` (the stalks' sunward bow: *proposed* extension to lean toward a bearing, section 14), `40-core-place`, `42`/`43-core-export(-host)`, `44-core-stage` | every species on the core's builders and items; `BIO.kit('hearths')` so the shared life's items never collide with a host's |
| `core/rand` | `KRAND` | every disc, tree, stoker and bead cell (`KRAND.hash(world, ix, iz, salt)`); the heat field's detail; no sin hash, no stream |
| `core/tags` | `50`, `52`, `53` | every tree, stalk, mat, pool, fumarole and hazard a record (`BIO.init({tags})`); a tree's record carries its foot's temperature and its walk |
| `core/space` | `KSPACE` | the keep-clear between trees (spaced by the heat) and the nearest-vent index the animals and hazards read |
| `core/hazard` | `KHAZ` (`20-core-hazard.js`) | the fumaroles' heat, the pools, the gas, the sulphide snow, the thin ground, the stalker |
| `core/clock` | `KCLOCK` (`C.day`, `C.hour`, `C.season`) | the hour, the season and (through the sky model) the eclipse, so `HEARTH.work` is the sky's |
| `core/terrain` | `30-core-field` + brush, `35-core-strata` + host shade (the hosts' recipes), `37-core-stacks` (`stalk` *proposed*, or `BIO.fung` tubes), `38-core-relief` (`pit`, `pavement`, `talus`), `39-core-cavern` (the hold: `hall`, `shaft`, `tube`), `42-core-frost`, `43-core-ground` (`KGROUND`; the snow and sinter layers weighted by the heat field), `44-core-farfield` + draw, `45-core-horizon` + shade; **`KTHERM` *proposed*** (section 14) | the shelf, the vents, the discs, the hold, the far country |
| `core/atmos` | the core, presets, export, waves, skylight, `bindHost`, the shared sky (the eclipse seasons), `bindWeather`, snow cover (its mask from the heat field), height fog, `3-particles` (steam) | the sky, the eclipse, the steam, the snow line |
| `core/water` | `20`, `21`, `22`, `50`, `51`, `geyser/52` + draw (`WATER.spring`: the hot pools with the kit's ramp and banded mats; `WATER.geyser`: the Stills read each geyser's `state(t)` for the flinch), `ext/57` (the audit) | the pools, wet ground under the steam; the Stills' geysers |
| `core/host` | `FULL` (camera, loop, clock, panel, probe, inspector, marks, pictures, minimap) | the host's page shell; the probe checks section 16's invariants |
| `core/materials` | `record` (`KMAT`) and the generated pack (`biomes/hearths/materials.json`, `tools/textures/pack.py biomes/hearths`, read by the hosts as a second pack) | every library set (section 15) |
| `core/export` | `07`, `09` | the krator-world container; the hazards section |

Not taken: `core/mask` (nothing is placed from a canvas), `core/city`, `core/hamlet`, `core/camp`, `core/simulation`,
`core/furnish` (no settlement: the loj and the camps are placement sites published as plain data), `core/lod` (the biome
core's runtime LOD covers it), `core/walk` beyond what `KCAVERN` writes for the hold, `33b-core-bamboo`,
`36-core-walker`, `37-core-traps` (no carnivorous plants: the hunter is an animal), `38-core-fire` (the fumaroles are
steady heat, not fire), `46-core-lava` (no flows), the season beyond its effect on `HEARTH.work`. `kits/crops`: the
`hearths` zone, the hearth wax and stoke only; the Tungangs' dark crops are the crops kit's already.

`tools/check_core_use.py` runs on both host kits before the first station is called done, and `tools/check_port.py` on
`biomes/hearths` (every fragment `[G data]`). After any change to `biomes/hearths`, both host kits are rebuilt and verified
and `python3 tools/port_baseline.py` run, as the shared-copy rule in `CLAUDE.md` asks.

## 14. New in core (each small, each a proposal)

1. **`KTHERM`, a ground-heat field** (`core/terrain`, `[G data]`): vents as records (point or line, temperature, reach,
   a decay), the ground temperature at (x, z) as their sum over the country's soil temperature, with `KRAND` detail;
   `heatAt`, `contour` (the 0 degC line for the snow mask, the 25 and 60 degC lines for the discs), `export`, a GDScript
   twin. The geyser kit keeps per-spring ramps today; nothing gives a kit the ground's temperature between vents, and the
   Hearths, the Throne's vent country and Korona's active plume would all read it. The one new module.
2. **`HEARTH.work(t, W, atm)`** is the kit's own, but it reads **the sun's occultation by the giant** from the sky model
   (`core/atmos/sky/89-atmos-e-skymodel.js` has the geometry): *proposed* `ATMOS.sunHidden(t)` as `[G data]`, beside the
   libration the Gills ask for, so a biome can know the eclipse without reading pixels.
3. **`39-core-lean.js` toward a bearing.** It leans every plant toward the giant; the hearth stalks bow toward the sun's
   mean daily bearing (north here, at 50 degrees south) and the fans toward the zenith; the still trees' fans turn
   across the wind (`ATMOS.windAt`) and edge-on to the sun's bearing now. A `toward: {az, alt}` option on the same
   function, defaulting to the giant, and a per-frame yaw uniform for the Stills' fans (one scalar, as the fold), so no
   other kit moves.
4. **`BIO.animHook` mode `breath`** (the Gills' proposal, a second taker): a scalar uniform scaling a per-item
   displacement; here the fans' fold about their hinge and the spindle's silver (a roughness and albedo term on the
   same uniform).
5. **Snow cover's mask from a field.** core/atmos's snow cover takes a mask today (the rain cover's and the host's);
   *proposed*: a `KTHERM` contour as the mask's source, so warm ground is bare in a snowed country without a host hack.
6. **`KSTACKS` kind `stalk`** (optional): a hollow slender tube with a broken top for the dead stalks, with collision; or
   the dead stalk stays a `BIO.fung` tube and this item is dropped.

Nothing else is new. The vents are `KRELIEF` pits and the geyser kit's springs, the hold a `KCAVERN` hall, the shelf the
host's `KFIELD`.

## 15. Textures

Read the library first (`core/materials/PLAN.md`). **Reuse:** `card.fin.membrane` (the fans' base card), `card.fin.glass`
(the host's glass fins beside them), `organic.pleat.skin` (the folded spindle), `organic.flesh.cells` (the foot),
`organic.coil.ribbed` (the stalk), `ground.mat.thermal` (the pools' banded mats), `stone.geyserite`, `ground.sinter`,
`ground.sulphur`, `ground.obsidian`, `ground.cinder`, `rock.gossan`, `ground.snow011`, `ground.snow.drift`, `ground.puna`,
`ground.gravel042`, `surface.cushion`, `ground.gypsum.crust` (the hold's chandeliers), `ground.mushroom.glow` and
`card.mushroom.alecap` (the Tungangs' crops), the rift rim's and Oidong's own sets read with their species.

**To source or generate** (generic ids; prompts below, paste-ready, to go into `core/materials/PROMPTS-NEEDED.md` on
approval; never a procedural stand-in without saying so):

- `organic.fan.radiator`: a hearth fan's black ribbed membrane. Full colour (black is the point).
- `organic.spindle.silver`: the folded fans' reflective outer skin with the green partner under it. Full colour.
- `organic.wax.tallow`: the tallow beads' pale wax on dark stalk skin. Tintable.
- `ground.coalmoss`: the black fleshy turf of the discs' floor. Full colour.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view,
perfectly flat surface filling the whole frame edge to edge. Flat, even,
shadowless lighting, as if scanned: no highlights, no vignette, no shading
gradient across the image. No perspective, no objects, no text, no border,
no watermark. The left edge must continue into the right edge and the top
into the bottom. Material: a thin black organic membrane stretched between
fine parallel ribs a finger apart, the membrane velvety matte black
(#0e0d0c) and very slightly translucent so the ribs read darker, each rib
a smooth rounded ridge with a faint crease, a few tiny pale flecks of frost
(#cfd6dc) caught along the ribs. Full colour: not tinted.
```

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view,
perfectly flat surface filling the whole frame edge to edge. Flat, even,
shadowless lighting, as if scanned: no highlights, no vignette, no shading
gradient across the image. No perspective, no objects, no text, no border,
no watermark. The left edge must continue into the right edge and the top
into the bottom. Material: a taut organic skin with a mirror-like silver
sheen (#c9ccc8), finely pleated in long parallel folds like a closed fan,
with a faint green tint (#5d7a4a) showing through the silver in the
troughs of the folds and small dark pores along each fold's crest. Full
colour: not tinted.
```

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view,
perfectly flat surface filling the whole frame edge to edge. Flat, even,
shadowless lighting, as if scanned: no highlights, no vignette, no shading
gradient across the image. No perspective, no objects, no text, no border,
no watermark. The left edge must continue into the right edge and the top
into the bottom. Material: a dark leathery stalk skin with shallow
lengthwise ridges, studded with rounded beads and drips of pale waxy
tallow of different sizes, some half-melted into runs, the wax slightly
translucent at its edges. Keep colours natural but slightly muted and
even, so the texture can be tinted to different palettes without looking
stained.
```

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view,
perfectly flat surface filling the whole frame edge to edge. Flat, even,
shadowless lighting, as if scanned: no highlights, no vignette, no shading
gradient across the image. No perspective, no objects, no text, no border,
no watermark. The left edge must continue into the right edge and the top
into the bottom. Material: a dense black fleshy turf of short rounded
fingers packed edge to edge like a moss cushion, matte charcoal black
(#141312) with faint warm brown (#3a2a1e) at the fingers' bases, a few
grains of yellow sulphur (#d9c13a) and white sinter dust caught between
them. Full colour: not tinted.
```

Reference images to collect into `refs/`: Yellowstone's and Iceland's steaming thermal ground in snow (the disc in a
white country), Erebus's warm ground, a radiator heat sink's fins and a heat pipe cut open (the stalk), a folded paper
fan and a fan palm (the fold), limpets on rock (the foot), Muller's thermosynthesis diagrams, a lichen's advancing
thallus with its dead centre (the walk), gypsum chandeliers of Lechuguilla (the hold), a solar eclipse's light (the
eclipse preset).

## 16. Order of work

- **H0.** The owner's yes or no on the mechanism, the two sites and their hosts, the partner-kind amendment, the walk,
  the Tungangs' and Dalab's parts, the Oidong rim's warmth, the names (section 17); the texture prompts moved to
  `PROMPTS-NEEDED.md`.
- **H1.** `KTHERM` and its node test (the field against hand values; the contours; determinism); `HEARTH.work` and its
  test (the four states against the clock and the sky model's occultation; the eclipse opening; determinism);
  `ATMOS.sunHidden`; the hazards on them.
- **H2.** The ground: each station on its host's `KFIELD`; the vents (`KRELIEF` pits, the geyser kit's springs and
  fumaroles); the heat field baked; the snow line from it; the hold on `KCAVERN` (station 2).
- **H3.** The flora: hearth trees (the fold, the bow, the two dresses as `BIO.kin` sisters), dead stalks, ember mats,
  kettle cups, stokers, shade caps, coal moss, tallow beads; the hosts read in place.
- **H4.** Station 1 with its three presets (dusk, noon, eclipse); then stations 2 and 3; station 4 if wanted; the loj's,
  the camps' and the cairn's sites published as data.
- **H5.** Each host's `verify.py --assert` with the probe's invariants on its hearths stations: every hearth tree's foot
  on ground between 25 and 60 degC by `KTHERM`, every ember mat over 60, no heat-eater under 10; the fans' state equals
  `HEARTH.work` at the preset's hour, open at night and in eclipse, shut at noon; snow absent on ground over 0 degC in
  the winter preset; every dead stalk on ground colder than a live tree's; every hazard's state as its record says; each
  check with a negative. `PORT.md`, the index tools, `tools/check_core_use.py`, `tools/check_port.py`,
  `python3 tools/port_baseline.py`, the hosts' gallery entries.
- **H6.** `kits/fauna`: the fin-mouse, the fin-owl, the hearth-stalker. `kits/crops`: the `hearths` zone, hearth wax,
  stoke. `kits/resources`: the copper owner nodes.

## 17. Open questions for the owner

Settled 2026-11-02 (the head of this file): the mechanism, the partner kinds, the three sites and their hosts, the
Tungangs' surface, Dalab's reasons, Oidong's warmth, the origin, the names' tongues, the walk. Still open:

1. **The words**: the Tungangs' (worn Northern English: `LORE.md` 6.1) for the hearth, the fans, the wax and the stoke;
   the Monks' for the Cold Hearths; the Talovolci's for the stair's hearth; the shared kit stays `hearths` unless the
   owner says otherwise.
2. **What Dalab does with the gene**, if anything the game shows.
3. **The Stills' words** (section 7b): the Islanders', the Hykkousoi's or the Izani's for the still tree and its wax
   and glass; and whether the isles' lamp oil and the glass horn stand.

Settled 2026-11-02, later: **the Stills grow at all three geyser sites** (the Steampits, the West Ring's geyser isles,
the Throne's geyser isle), as section 7b says; and **the Hearths' vent fields are built by their host kits** (riftrim,
oidong, godstep) with the geyser kit read in place, not by the geyser kit's own stations (section 0, "Overlap, settled").

## 18. The Cave of Crystals: `build.py --station crystals` (2026-11-03)

The owner (2026-11-03): build the hold's drained storey, the Naica (`biomes/CRYSTAL-CAVES-5.1.md` site 1,
`biomes/KARST-SITES-5.1.md` site 4), now, as a page: the giant selenite beams, the bladed floor, the hot and deadly air.
**The hold itself is a later settlement kit**: this station builds no structure and no person, but masses the caverns
as if they held one, and publishes the spaces a hold would take as plain records, so the settlement kit drops into them
without carving again (the metropolis massing's pattern: reserve the space, do not fill it).

**Where it builds.** `biomes/riftrim`, the planned host (section 0), has no build yet. So this kit gets a `build.py` whose
one page is this station: `python3 build.py` (or `--station crystals`) writes `dist/hearths-crystals.html` from
`stations/crystals/` and the core; `src/` (the life, read in place by oidong) is not on the page. When riftrim gets a build,
the station moves there as `--station hearths-crystals` unchanged: its fragments read only the core. Started from
`biomes/copperglacier` (the newest finished kit): its `build.py`, `verify.py` and host shape.

**The cave** (all `KKARST`, site 4's arguments). One hypogene network over the site's box (1.8 km, world 52514): the active
storey at G - 70 (table G - 69, 55 degC), the drained storey at G - 40 with `crystal: {storeys: [1], speleo: 'SELENITE'}`,
feeders on two faults along the rim's strike. G is the shelf (3,736 m), drawn as y = 0. The page crops it to a 360 m box
round the network's largest feeder chamber on the drained storey (`ch:n1:-11,-3`: 108 by 100 m, 31 m to the crown), with
the four chambers and the passages round it, the cupolas in their roofs, and the feeder shafts down to the water. A
passage that leaves the box stops at the box: the cave goes on. KKARST's records are cropped, never edited.

- **The Cave of Crystals** is the feeder chamber: KSPELEO's `beam`, `block` and `druse` kinds over its floor, with the
  station's own numbers (`SELENITE` raised as the preset allows at 0.75 g: beams 5-16 m, 0.45-1.1 m thick, rising at up to
  63 degrees, so they cross at every angle and lean on each other), the bladed floor (druse points on every floor, the
  "shark teeth"), blocks under the walls; the second feeder chamber west of it (`ch:n1:-14,-2`) is dressed the same, thinner.
- **The feeder well**: the level shaft in the great chamber's floor, the storey's hot water (55 degC, sulphurous) 29 m
  down it, steaming (core/water's still surface, core/atmos's steam).
- **The vent**: the cupola in the great chamber's crown broke the shelf (KKARST's `thin`): a well to the sky, the one
  daylight in the cave, falling through the beams.
- **The rock**: the rift fill's limestone, iron-stained rust red on the roofs and the walls between the crystals (the
  references), gypsum crust on the floors and the lower walls.

**The hold's massing** (*proposed*: where a loj would sit in this storey; the owner's settlement kit decides what fills it).
The feeder chambers are the heat (50 degC, lethal): the Tungangs cross them in cooled suits or not at all (CRYSTAL-CAVES
section 1). The hold takes the storey's **cooler chambers** round them, joined by the network's own passages:
- **chambers**: `ch:n1:-11,-2` (the north chamber: the loj's hall), `ch:n1:-10,-3` (east) and `ch:n1:-13,-4` (south); their
  level floors are the hold's floors, cleared of crystals;
- **shelves**: a level terrace cut into each hold chamber's wall 4 m over its floor (`KCAVERN.room`): an upper floor;
- **galleries**: the passages between the hold's chambers;
- **passages**: the two crystal doors from the hold into the Cave of Crystals;
- **approaches**: the night road (a rising gallery from the north chamber toward the shelf's surface, carved to the
  page's edge, its run to the surface recorded) and the way down (a stair from the south chamber toward the active storey,
  its foot recorded).
Each is a record (`HOLD.volumes`, `[G data]`): `{id, kind, name, prim (the KCAVERN primitive), shape (ellipse, poly or
capsule, with y0 and y1), floor, area, volume, temp (KTHERM over the feeders), links}`. No crystal stands in one (KSPELEO's
`accept`), the probe checks it with a negative, and `?massing=1` outlines them. `node biomes/hearths/hold_export.js` prints
the records as JSON from the same fragments (`--cave`: the whole cave's export), for the settlement kit and Godot.

**Light and air.** No people, so no floodlights: the vent's daylight, the hot water's dull glow up the well, and the
visitor's own lamp (the camera's headlamp; `?lamp=0` off). The beams are instanced translucent prisms with a cheap fake
scattering (a thickness term in the shader, lit by the lamp, the vents and the wells; no refraction). The air: warm humid haze (built: the
scene's fog, since height fog reads the sky's uniforms and there is no sky), steam off the wells. **Hazards** (core/hazard): `heat` over each feeder chamber with `soak`
(Naica's 50 degC at 100% humidity kills in tens of minutes: full 1500 s), `slip` on the beams, and KKARST's own (the falls
down the feeder shafts, the gas pooled in the active storey).

**Budget.** The cavern at 1 m cells (~200 k triangles in the box); the crystals instanced (each kind one draw: beams,
block parts, floor blades, wall points); under 2 M triangles and 60 draw calls a view, as the other stations hold to.
(Built: the selenite, beams and block parts, in one draw; the blades, floor and roof, in one; ~450 k triangles in all.)

### 18a. Core adoption (written before the first fragment)

| Module | Takes | For |
|---|---|---|
| `core/terrain` | `39-core-cavern` (KCAVERN), `39b-core-speleo` (KSPELEO), `39c-core-karst` (KKARST), `39d-core-cavern-floor` and `host/39e-core-cavern-draw` (the floor under the eye, the chunks drawn: lifted into core 2026-11-09), `47-core-therm` (KTHERM), `43-core-ground` (KGROUND) | the network, its voids and chunks; the crystals' records; the storey's warmth; the rock's layers (gossan and gypsum crust, triplanar on the walls) |
| `core/rand` | `KRAND` | every seed; the massing's and the crystals' hashes |
| `core/tags` | `50`, `52`, `53` | every chamber, crystal group, reserved volume and hazard a record |
| `core/space` | `KSPACE` | the reserved volumes' index the crystals' `accept` and the probe read |
| `core/hazard` | `20-core-hazard`, `21-core-hazard-flow`, `37-core-traps` (the clock) | the heat with `soak`, the slip, KKARST's falls and pooled gas |
| `core/biome` | `10`, `20`, `30`, `31b`, `40`, `42`, `43`, `44` | `BIO.init` (the host binding, records, the export); no flora on this page (nothing grows in the drained storey) |
| `core/atmos` | the core, presets, the evening's cones (`2-lights`), particles, export, waves, `bindHost` | the vents' shafts of light, the steam; no sky and no height fog (underground) |
| `core/water` | `20`, `21`, `22`, `50`, `51` | the hot water in the feeder well (`WATER.open`), still |
| `core/host` | `FULL` | the page shell, views, inspector, probe |
| `core/materials` | `record` (`KMAT`), `biomes/hearths/materials.json` packed by `tools/textures/pack.py` | the library sets |
| `core/shadow` | `KSHADOW`, off by default (`?shadow=1`) | the vent's shaft of light through the beams |
| `core/export` | `07`, `09` | the krator-world container |

Not taken: `core/mask` (no canvas placement), `core/city`, `core/hamlet`, `core/camp`, `core/simulation`, `core/furnish`
(no settlement: the hold is massing records), `core/lod` (the chunks are few and static), `38-core-relief`, `KSTRATA`
(the walls are textured, not bedded), `KFAR`, `KHORIZON`, the sky, the weather, the clock's season (no sky reaches in but
the vent's).

**Textures.** `rock.limestone.ironstained` (iron-stained cave limestone) is the roofs' and walls' rust; `ground.gypsum.crust` the
floors' gypsum; `mineral.selenite` the beams' and blades' grain (both delivered 2026-11-10, `core/materials/PLAN.md` "Delivered
2026-11-10"; before them `rock.gossan` toned down and `stone.alabaster` tinted pale green stood in).

## 19. The hold's active storey: `build.py --station hold` (planned and built 2026-11-09)

Station 2 of section 11, under the Cave of Crystals: the same network (`SITE.net`, world 52514) and the same box, cropped to
**storey 0**, the active storey at G - 70 under the water table at G - 69, so the two pages are one cave. The crystal page's
way down arrives here.

**What the records say** (read off the network, 2026-11-09). Six chambers in the box (two feeder chambers, `ch:n0:-11,-3` under
the Cave of Crystals and `ch:n0:-14,-2`; four others), 44 passages, all phreatic: every floor is at -70 +- 0.6 and the table
is at -69, so **the whole storey stands in about a metre of water** (KKARST flags all six chambers flooded). Gypsum crust from
the floor to -63 round every chamber; the cupolas in the crowns; the two feeder shafts rising from depth. KKARST gives every
pool the rising water's 55 degC.

**Decisions.**
- **The water's heat falls off from the feeders** (KTHERM, the crystal page's own field over the same feeders): scalding over
  the feeder chambers (55, a `heat` hazard), warm (30-38) in the far chambers. KKARST's pools keep their record; the station
  gives each its KTHERM temperature (`temp` on the pool's draw and its hazard). One still `WATER.open` at the table over the
  storey's floor: milky green-grey, steaming where it is hot.
- **The dress**: KSPELEO's `HYPOGENE` (gypsum chandeliers, stalactites, columns) over each crust record, drawn by
  `KSPELEO.mesh` in one geometry; the crust band on the rock (KGROUND's gypsum layer by KCAVERN's crust weight).
- **The air**: KKARST's hazards as they are (drown in the sumps and pools, gas pooled on every floor, the acid's drips in the
  crust band, the falls), plus the steam over the hot water (core/atmos smoke).
- **The fumarole's shaft** (KARST-SITES site 4, "the station's, not KKARST's"): one `KCAVERN.shaft` from the feeder chamber
  `ch:n0:-14,-2` up through both storeys to the shelf, a hot column (steam, a `heat` hazard round it).
- **The hold's lower storey, massed and empty** (*proposed*; the settlement kit fills it): the loj cannot live in the water,
  so it lives **on shelves cut above the waterline** round the cooler chambers' walls (floor at the table + 1.5 m), joined by
  raised galleries (passages whose floors the station levels above the water with a monolith), and the warm water in the
  middle is the loj's. Chambers: `ch:n0:-14,-5` (where the crystal page's stair comes down), `ch:n0:-15,-5`, `ch:n0:-9,-3`.
  Kinds as section 18's, plus `field`: the shelves meant for the dark crops (`kits/crops`' pale fungi, the mat, alecap, glow
  mushrooms). The crops are not drawn: they are the hold's, as the structures are.
- **The way down meets it**: section 18's stair ends on a landing at the table + 1.5 (moved up from the storey's floor, which
  is under water), at `ch:n0:-14,-5`'s shelf. Both pages carve both storeys' cuts, so the stair is the same void on each.
- **Not drawn** (section 11's first sketch, before the two-storey cave): the hearth trees' feet in the roof (the surface is 40
  m above this storey's crown) and the night entrance (the crystal page's night road is the hold's way up).
- **The light**: none but the lamp, the water's faint steam glow over the hot pools, and daylight only where a feeder's well
  rises to the crystal storey's vents (none in this box): a dark page by design. `?mood=gold` as section 18.

**Shared with station 1.** Both stations take one data fragment, generalised by storey (`SITE.storey`, `SITE.hold`), and the
same host fragments where they agree (the rock, the massing, the build); a station's own fragments (its site, its dress, its
views and checks) replace those by name (`station.json` `"base": "crystals"`). The cavern's drawing and its floor function
move into core (`core/terrain/host/39e-core-cavern-draw.js`, `core/terrain/39d-core-cavern-floor.js`), since
every cave page draws the same way (nwbay's caverns station could take them).

**Checks** (each with a negative): no speleothem in a reserved volume; every reserved volume open and its floor level **and
above the water**; the water hot only near the feeders (KTHERM) and a `heat` hazard on every pool over 45 degC; gas on every
active chamber's floor; the crystal page's stair and this page's landing the same void; the eyes in the open and in air.

**Built (2026-11-09).** As planned, with these as built: both stations carve and draw both storeys (one cave, ~450 k rock triangles); the hold's
lower storey is three warm pools (24-28 degC) with a shelf and a field over the water in each, the way down's landing a rock platform 1.5 m
over the water in the landing pool, the galleries wading (1-1.6 m deep), two hot crossings past the feeder pool (41-44 degC); one pool
scalds (50 degC, under the Cave of Crystals); 183 gypsum chandeliers; the fumarole from the west feeder pool to the shelf.
`node biomes/hearths/hold_export.js` prints all 33 volumes (both storeys).
