# Verge: the brief, read back as decisions

## The setting

- **The descent.** The high desert's river leaves its canyon at the lip of the escarpment (x ≈ -1400). It drops
  about 856 m through **seven cataracts** in a slot cut into the cliff, into a **plunge pool** (x -886, z -226). From
  there the **lower river** runs east toward the **salt lakes**, which lie 7.4 to 14.6 km east and below the floor, so
  they are seen from the lip and from the trail.
- **The spur.** South of the gorge the escarpment does not stand as a cliff: it comes down as a **spur**, a ridge
  1.4 km long. This is the easiest descent, and the reason the city exists. Its profile is stepped by low ledges (the
  beds it is cut from) and its toe is ragged. Rock outcrops show between the scree.
- **The trail.** It zigzags down the spur in **26 legs** (about 7.06 km at 12.2%), between z -138 and z +116. The
  hairpins have a radius of 7 m; the trail is 4.4 m wide and its bench is cut 8.5 m into the slope.
- **The funicular.** The rusted remnant of an Ancient funicular runs straight down the spur's crest (z 58): an upper
  station on the rim, piers, broken spans and a fallen car. The trail shares its cuttings where they cross. It is the
  only Ancient structure in Verge.
- **The biomes.**
  - Above: the eastern high desert (`biomes/sedesert`) over the plateau and the canyon. A linear oasis follows the upper
    river's banks.
  - Below: the Eastern Abyss (`biomes/eastabyss`) over the floor: desert, salt flats, and lush riparian growth by the
    pool and along the river.
  - Each kit grows only in its own zone, and no flora stands on a street, the trail or a building.

## The two cities

**Upper Verge** fills the canyon floor behind the lip. It is the denser city: the canyon walls hold it to a band
about 1.4 km long. It is built in the **Iziz Vernacular**: wood, plaster, salvage and stone. Its landmarks are:

- the governor's palace, on the south side;
- the guard tower and barracks, where the highway enters from the west;
- the mustering ground;
- four watch houses;
- two caravanserais;
- a school and a hospital;
- the market plaza, with four canopies.

**Lower Verge** spreads over the floor round the pool and along both banks of the river. It is built in the **Yuni
and Eastern Abyssal** styles, as Locus is. Its landmarks are:

- the guard tower;
- the **Mayor's compound**, a new 70 × 56 m courtyard palace in the Eastern Abyssal style;
- the **Historian chapterhouse**;
- two caravanserais;
- a temple, a library and a school;
- three watch posts;
- the market: a hall, stalls and nomad tents.

**The counts.** Upper Verge has about 870 buildings and Lower Verge about 930. That is a similar number, and the
upper city stands on a third of the lower one's ground.

**The streets are unplanned.**

- Lanes meander off the highway and branch into sub-lanes.
- Alleys come off the lanes.
- Plots front every street, most with a smaller house in a back row behind, and back lots fill the gaps.
- A lane that meets another street joins it. Each street leaves room for a block two plots deep on either side.

**The districts** are rings round each trailhead:

1. warehouses nearest the trail (the porters' trade);
2. then shops and workshops;
3. then houses, inns and the caravanserais.

**The trailheads.** At each end of the trail there is a **toll gate, a small palisade and a toll house**. There are
no walls and no gates elsewhere.

**The spill.** A few houses stand on pads beside the trail's first legs below the top and its last legs above the
bottom. Neither city comes near spanning the descent.

**The rest stops** stand by the hairpins nearest the 200, 400, 600 and 800 m marks of the descent, on alternate
sides. The north ones are built out over the gorge on a cliff deck; the south ones are cut into the rock. They are a
new model in the Vernacular kit (`vern_rest_stop`, two variants).

## New buildings went into their kits

Nothing is a Verge-only kit. Each new building is an addition to its own culture's kit and interior set, so any
build can place it.

- **Iziz Vernacular** (`settlements/iziz/src/74b-vern-frontier.js`): the governor's palace, the guard tower and
  barracks, the watch house, the toll house, the palisade and its gate, the mustering ground and the rest stop.
- **Eastern Abyssal** (`settlements/locus/src/65-abyss-75-verge.js`): the Mayor's compound, the guard tower, the toll
  house, the palisade and its gate.
- **The Ancients kit** (`kits/ancients/src/8ap-funicular.js`): the funicular. Its plan is data; it is drawn through
  the kit.
- **Interior sets** (`kits/interiors/sets`): every Vernacular key, the Yuni assets Lower Verge places (the
  chapterhouse furnished from the Order's pieces), and the Abyssal additions.
- **Furniture** comes from the existing catalog only (Iziz, East Abyss, nomad, generic, the goods sets, scrap and the
  job sets). Verge adds no furniture.

## The life layer

**Motion is a function of time.** Every group has a timetable (core/sched) and a path over the walk graph. A
member's pose at run time `tau` is `SIM.memberPose(G, M, tau)`, a pure function. The page and Godot compute the same
poses: `godot/tests/verge` replays them against the page's golden trace.

- **Caravans** are a guard, 3 to 5 laden camels each with its own driver, and a guard. Each member is its own model
  and follows the leader 4.2 m apart along the path. A corner is turned by each member in turn, so the caravan
  never pivots as one block.
  - **Through caravans** (8) come in from one edge, cross the trail and leave by the far edge. They stop at the rest
    stops on the way.
  - **Turnaround caravans** (8) unload at a caravanserai and go home. Because of the toll, about half the caravans
    never take the trail.
  - At a caravanserai each member walks to its **own reserved slot**: the people by the court walls, the animals in
    a marked yard grid. Slots are reserved round the timetable's cycle, so no slot is held twice at once and no two
    caravans overlap.
- **Porters** (10) lead 1 or 2 camels from a warehouse on one level to a random warehouse on the other, by the trail.
- **Nomad squads** (4) come in from a random map edge, stop at a caravanserai and leave by another edge of the same
  level. They ride camels above and lizards below.
- **Patrols** (6): the guards of each level walk their city out of its guard tower.
- **The citizens** (380 above, 340 below) ramble as Voth's do. Each one's day comes from its role's schedule, and
  each decision is taken from its own seeded stream and logged.
- **The fauna**: deer and coyotes on the upper desert (sedesert), flamingos and frilled lizards below (eastabyss).
  They live in the biome kits, so any build with those biomes has them.

## The lighting

It is Locus's system (itself Voth's), vendored unchanged:

- **the sky** (21-sky): the sun, the giant planet, the eclipses and the dome;
- **the day/night pass** (82-daynight): the key light, the fills and the fog;
- **the Yuni engine's night light**: the lamp halos, the glow, the window panes.

Verge feeds it its own lamps: the furniture's lamps and the Vernacular's bulbs. The world has one clock (core/clock):
the sky reads `CLOCK.hour`.

## Godot

The page's world is data before it is drawn. `verify.py --export godot/data/verge` writes the terrain (a heightfield),
every placed record (place, tags), the walk graph, the sim (factions, places and slots, the nav graph, every group's
timetable and path) and the golden trace. `godot/krator/verge_sim.gd` is `memberPose` in GDScript. The spike's verge
case builds stand-ins from these files.
