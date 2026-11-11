# The Tungang kit: the design plan (proposal, 2026-11-10)

The culture kit of the Rift's tunnel people, **the Tungangs**, their kin on the rim and the fells, **the Fellgangs**,
and a third people this plan proposes, **the Glaziers**, the eastern loj of Opal Valley. **One kit, three sets** on one
foundation, as `kits/highlands` carries the Republican, Rustic and Tribal sets (the owner, 2026-11-10).

**Status: a proposal.** No code is written. Every fact not already in `LORE.md` or a biome plan is marked *proposed* and
waits on the owner; `LORE.md` is not edited until the owner confirms. Section 10 holds the numbered questions.

**The owner's brief** (2026-11-10, in brief): start the Tungang and Fellgang kits; propose underground settlements with
**convenient camera navigation**, researched; the theme is **"friendly Morlocks"**: pale, light-shy, nocturnal tunnel
folk who are decent people, not monsters, and **no clichéd dwarves** (no beards and axes, no rune halls, no mead, no forges
under the mountain, no Moria); much of their equipment and architecture is **salvage, mostly Ancient wreckage**, the rest
**underground materials** (Tungangs) and **Rift materials** (Fellgangs); **the Cave of Crystals needs something
special**: its people may be their own divergent culture, influenced for centuries by **Xanadu** and **Oidong**; flesh
them all out.

## Settled before this plan (quoted, not proposed)

| What | Where |
|---|---|
| The Tungangs are the Ancients' engineered worker caste of the Rift line gone feral, "Morlock-like and born to the dark": pale, huge-eyed with eyeshine, dazzled by day, echolocating by tongue-clicks, long strong fingers, a compact build for low galleries | `LORE.md` §6.1; `biomes/riftrim/PLAN.md` §6 |
| The union kept as form without meaning: each hold a **loj** under a **steward** (*stoord*) elected by show of hands, a **sekketri** with the minutes, **the Book** and its **Bookmen** and readings, the **Tpresden** over all lojes, the **Fixers** on the Line; lojes **numbered** by the Line's stations (Ledge's lifts are **Loj Fower**); the timetable and signal codes kept as rite; *skab* the curse; the Great Strike; **Loj Nahn** in Arccube; the tongue Northern English worn past understanding | `LORE.md` §6.1, §6.20 |
| "The only thing worse than a Labber is a Lizard" | `LORE.md` §6.20 |
| A loj names itself for its hearth; "the stewards moved the hold when the heat moved"; hearth wax is their food and lamp, "the smell of a loj" (wax *proposed*) | `biomes/hearths/PLAN.md` |
| Some stretches of the Line still run; "only the train crosses" the hot middle; the doors at either end of the hot section are "the Tungangs' most important machinery after the trains"; stations are "the most-lived-in spaces of all" | `openworld/ANCIENT-TUNNELS.md` |
| The Fellgangs: the wilder highland branch, darker skin, smaller pupils, can bear the day; herding, hunting, a little farming, raiding; *wildcat* bands with their own rulebooks; "the stewards who sold the fells to Dalab" | `biomes/riftrim/PLAN.md` §6 |
| **Look** (the owner, 2026-10-26): Tungang furniture **post-apocalyptic Soviet**; Fellgang **a more primitive, militaristic, "punk" Tungang** | `kits/yeti/PLAN.md` §11 |
| **Two Fellgang villages chosen** (the owner, 2026-11-11): **the Fowlers** (a rope is a vote) and **the Ice-cutters** ("the Cold is owed"); stand-in buildings keyed `fg-*` on `core/hamlet` | `biomes/riftrim/PLAN.md` on `claude/rift-hearths-cavern-b8baf6` (07b9408e3, ab959b38b) |
| The Rift's places are canon in place and type (names tentative but Ledge, Arccube, Pluton): Nulab, Shelf, **Loj Twenny** (cavern, 457,1269), **Wildcat** (Fellgang village, 427,1453), Chimes, Cthonos, The Tubes | same, the owner's answers of 2026-11-11 |
| **Already built**: the Tungang (23 pieces) and Fellgang (20 pieces) catalog culture files, registered in `core/tags` and the catalog core in the shared rebuild of 2026-11-03; the Hearth hold's two storeys (`biomes/hearths`, stations `crystals` and `hold`), massed empty as 33 volume records (`CAVE.HOLD`) "the settlement kit drops into" | `kits/catalog/krator-master-furniture-{tungang,fellgang}.js`; `biomes/hearths/PLAN.md` §18-19 |

## The owner's answers, round 1 (2026-11-10)

1. **One kit, three sets** (question 1).
2. **The Glaziers move to Opal Valley**, and their concept changes with it (section 1.4). The High Rift's crystal cave
   (the Singing Gjár's crystal-lined fissures, `biomes/highrift/PLAN.md` station 5) could be **a monk outpost** of the
   Order instead (section 1.4, last paragraph). The Hearth hold's Cave of Crystals stays a Tungang loj's (section 5.5).
3. **Wildcat** is notable for its **cultural hybridization with the Kimr** (`biomes/labyrinth/PLAN.md` section 5), whose
   bravado shapes its culture of raiding. Wildcat is **about 50% Kimr** by descent: a mix of **Conan-the-Barbarian
   capital-H heroism and south-western pueblo culture** (section 1.3.1).
4. **A cavern layout in `core/city`**, which should also serve Dhelv and future Zeijani settlements (section 5.6).
5. **The biome comes first**: the look of the caverns and the Line's tunnels must be right before the kit, and the Line
   needs **a train built for it** (section 0.2).

## The owner's answers, round 2 (2026-11-10)

1. **The Line is a `line` kind in `KTRANSIT`** (question 20), and **its cars live in the vehicles kit** (question 21).
2. **People and cargo must be able to ride them** (section 0.2.1).
3. **Wildcat goes in the Fellgang set for now**, its dwellings **pueblo-like: a "scrap pueblo"** (section 1.3.1; question 24).
4. **The Glaziers' language is half Xanadui** by now: written up on the tongues page (section 1.4, "Tongue and look").
5. **The Glaziers wear turbans like the Xanadui**, with similar slight touches of Orientalism (sections 1.4, 1.5, 3.4, 4).

## 0. What the kit is

| | |
|---|---|
| Folder | `kits/tungang/` (`src/`, `build.py`, `verify.py`, `materials.json`, `tex/`, `INDEX.md`, `PORT.md`, `KNOWN_ISSUES.md`, `API.md`), three sets: `tg` (Tungang), `fg` (Fellgang), `gz` (the Glaziers), on a shared **salvage foundation** (section 2.1) |
| Page | `dist/tungang.html`: the kit sheet: each set's buildings in rows poor to rich, three seeds a row, with a state switch (kept, worn, abandoned); **a test hold** (two decks of a line station, carved, furnished, with the camera views of section 6); a Fellgang wall and a stretch of the ice road; Wildcat's pueblo; a Glazier adit front on a fault scarp |
| Engine | `core/engine` for built defs (huts, fronts, carriage houses, scaffolds); `core/terrain` `KCAVERN` for carved defs (rooms, sets, halls cut into rock), through a **carved-def layer lifted from `kits/zeijani`** into core (question 14) |
| Registry | `TG.def` (one def per building, tags `culture: 'tungang' / 'fellgang' / <the Glaziers' culture>`, `tier`, `style: carved / built / salvage`, `role`, `job`, `deck`); every hold room a record keyed by stable id, registered in `core/tags` before it is drawn |
| Biomes | read in place: `biomes/hearths` (the Hearth hold, its `CAVE.HOLD` volumes, its flora: hearth trees, dead stalks, coal moss), `biomes/riftrim` (the rim's flora, the Fowlers' and Ice-cutters' stations), `biomes/opalvalley` (the Glaziers' valley: its silica flora, its opal), `biomes/labyrinth` (the Kimr's megafauna, for Wildcat), `kits/crops` (the dark crops); and **the Line's biome**, built first (section 0.2) |
| Out of scope here | the settlements as pages (Ledge, Loj Twenny, the Hearth hold page is hearths'; Wildcat; Loj Nahn on the Pile); the Line's bores, stations and trains (`kits/ancients`, `openworld/ANCIENT-TUNNELS.md`); the characters' bodies and clothes (`core/charactermodels`: section 1.5 gives the brief); the fauna (`kits/fauna`) |

A new kit goes into the gallery when it first reaches `main`.

### 0.1 The precedent: the Zeijani kit and Dhelv

Dhelv, the Zeijani's capital (`kits/zeijani`, `settlements/dhelv`), is Krator's one finished underground city: carved
defs on `KCAVERN`, a walk map written from the plan, a cut-away for carved rooms, a cave's light, a switch that draws only
what is seen, ramblers on the nav graph, and a Godot replay. The Tungang kit takes its machinery and its lessons, and
**must not take its look**.

**What to take.**

| In Dhelv and the Zeijani kit | For the Tungangs |
|---|---|
| A carved def is a **front** and a **void plan**; "the void plan is the one source": the cavern carves it, `core/walk` takes its floors, `kits/interiors` furnishes it, `core/tags` records it (`kits/zeijani/PLAN.md` 6.3). The plans are data in `kits/interiors/sets/zeijani.js`, carved by `cvFromItem` | every Tungang and Glazier carved def, its plan in `kits/interiors/sets/tungang.js` |
| **The cut-away for carved rooms**: each void's rock opens 2 m above its own floor ("a dollhouse at every level"), shafts open whole, the ground over a sunk def opens; at Dhelv the 32 carved sites nearest the camera get cut boxes in the rock shader (`CV_OPTS.cutBoxes`, `dhCutBoxes`) | the hold view's deck cut (section 6.3) is this, per deck; lifted into core (question 14) |
| `camGroundY`: the orbit camera has no floor inside a void; underground the sky is hidden and a dark fog closes the distance | the follow camera and the hold view |
| Dhelv's own map (`93-dhelv-map.js`): **the ways within 6 m of your height drawn bright** | the deck filter of section 6.3, moved into `core/minimap` |
| **What is drawn** (`dhSeen`, every quarter second): carved cells within 420 m, a carved site's furniture only from inside it or before its front, built interiors within 90 m; budgets of 450 draws and 1.1 M triangles underground, checked at every view | a hold's draw switch and budget from the start, with the same check |
| The rock **meshed near the camera only** (16 m chunks within 120 m, about 7 ms a chunk, `DH_STREAM`) | a hold's rock streamed the same way (a line hold is far smaller than Dhelv's 5,600 chunks) |
| **The cave's light** (`94-dhelv-light.js`): underground the sun and the sky's reflections go out and exposure rises; lamps are records and the 14 nearest the eye are real lights; glow fungus every 18 m along the tunnels | the lamp code as light records; the same pool of real lights |
| **The checks**, each with its negative: a walk route per def, `walk-joins`, 0.8 m of rock between voids, no void open to the air but at its openings, nav edges walked every 0.5 m with 2 m headroom, stacked lookups by y, the cut-away boxes, the view budgets | all of them, with section 6.7's camera checks |
| **Ramblers** on `core/simulation`, with groups that try the hard routes (the scouts' patrol, a funeral to the catacombs, porters, the guard at the stone door) | the turn change down the Line, the Fixers' patrol, the Big Meeting's march, a funeral to the last stop |

**What it learned the hard way** (its progress log and `KNOWN_ISSUES.md`), kept as rules here:

- Every doorway passage **overlaps the floors it joins**, or walkers cannot get in.
- A straight stair between stacked rooms passes under the upper room: **stairs come in from the side** and end on a level
  landing clear of the ways at their top.
- Carved rooms are furnished in their outline **inset 0.25 m** (rounded corners put pieces in the rock); frames stand 2 cm
  inside every cut, lintels under the ceiling.
- Underground the sun casts no shadow: floor-standing pieces need **contact shadows** or they float.
- **Every lookup takes y**: an x-z search finds a passage on the wrong level.
- **One cell size per cavern** (0.5 m): chunks of two sizes crack at their seams.
- The cavern's `ceilingAt` costs about **1 ms a query**, so Dhelv checks headroom only on ways and doors. The follow
  camera's distance queries (section 6.3) are measured before they are relied on.
- **Glow as the main light turned the reds to mud.** Dhelv keeps its key light near white (warm-white lamps, daylight down
  the wells) and the glow fungus as an accent. This changes the lamp code (section 1.2): the coloured lamps mark the ways
  and doors, and rooms are lit by wax light.

**What not to take: the look.** The Zeijani's sources are fantasy dwarves, the Pueblo and the kiva, Cappadocia, Petra,
Lalibela and Kailasa (`kits/zeijani/PLAN.md` 6.2): rounded, rock-cut, ornate, polished oxide "red rooms", monoliths left
standing, columned fronts. That is the look the owner ruled out for the Tungangs, and Dhelv already owns it.

| | The Zeijani (Dhelv) | The Tungangs |
|---|---|---|
| Form | rounded: domes, round rooms and doorways | squared: rectangular rooms and doors in plate frames, the Line's vault the one curve |
| Surface | a finish by wealth: hewn, plastered and painted, polished | hewn or plastered only; wealth is in the salvage fitted (enamel, brass, a carriage), never in the rock |
| Ornament | relief, labyrinth carving, jali, friezes | nothing carved: stencils, enamel signs, livery bands, banners, the crew mosaic |
| Grandeur | Kailasa and Lalibela: monuments cut from the rock | none: the Ancients' station is their biggest room, and they did not cut it |
| Light | a white key, oil lamps, daylight down the wells, glow as accent | the lamp code on the ways, wax light in the rooms, no daylight but the night mouth |
| Plan | a hub hall under a light well, satellites, a braid of tubes | a line: platform spine, sidings, sets, decks |

The Glaziers' carved fronts come nearest the Zeijani's. They differ by being whitewashed and painted (cholet colours,
gilt on plate) and tiered and battered like the Potala, never columned or relief-carved.

### 0.2 First: the Line's biome and its train (the owner, 2026-11-10)

The kit's rooms stand inside the Line's stations and the caverns it joined, so their look decides the kit's. The order is
**the Line's biome and its train first** (T1), the cavern layout in `core/city` next (T2, section 5.6), the kit after.

**What exists already.**

| What | Where | State |
|---|---|---|
| The hypogene hold (the Hearth hold's two storeys, the Cave of Crystals), massed empty | `biomes/hearths` | built |
| A gypsum maze on `KKARST` | `biomes/rift --station maze` | built, on `claude/rift-hearths-cavern-b8baf6` |
| The south portal ("a cut face with the Tungangs' lamps in a row") | `biomes/riftrim` station 5 | built, a site only |
| A hollow lined body on a 3D centreline (`C.pipe`: a bore inside a pipe body, stepped floor, open ends) | `core/terrain/39-core-cavern.js` | built (for the Cliff Lungs) |
| `KTRANSIT.subway` (a bored twin-track tunnel in 20 m sections, `intact`, `cracked`, `collapsed`, `silted`; cut-and-cover stations), `KTRANSIT.rail`, `KTRANSIT.train` (`freight` or `passenger`; `standing`, `derailed`, `fallen`) | `kits/ancient-transit`, for the Ancients' Valley | on `claude/ancient-transit-2600a6`, **not merged** |
| The Ancients' vehicles, with ruin states for every vehicle; `anc_tram`, "a guideway tram-car, forty seats", 2.95 x 13.4 m | `kits/motor-vehicles`, culture `ancient` | on `claude/ancient-vehicles-935f93`, **not merged** |
| The tunnel record's shape, the section, the crossings by cave kind, the hazards owed (rockburst, inrush, seal) | `openworld/ANCIENT-TUNNELS.md` | a plan |

**The Line is bigger than a subway** (the owner, 2026-11-10): **at least four tracks side by side**. In places some or
all of them are broken, but despite the gaps **the Line is mostly functional**, and **travellers walk the caverns
between intact segments**. So (*proposed* unless quoted):

- **The section.** One wide gallery, not a pair of bores: about 32 m across and 12 to 14 m to a flattened vault, four
  guideways on a flat invert (two each way, about 6 m apart), an island platform strip between each pair, walkways and
  cable troughs along both walls, lamps in rows down the vault. In bad ground (the breccia's faults, the rift fill's
  wet stretches) it splits into two or four bores, rejoining in a **junction hall** where the ground is good again. The
  Ancients' road was a 30 m way with a guideway down its middle (`ANCIENT-ROADS.md`); the Line is that road's
  underground twin, a cavern of its own ("a kind of cavern of their own": the owner, 2026-11-03).
- **Gaps by track.** A collapse, a flood or a sheared fault takes one track, two, or the whole width. Where a track or
  two is gone the trains cross over to the others (the Fixers keep the **crossovers** as their most valued work after the
  doors); where the whole width is gone the Line is **cut into segments**.
- **Segments and the walk between.** Each intact segment runs its own trains, back and forth between its two gaps: the
  trains were trapped in their segment by the collapses a thousand years ago and have never left it, so a segment's
  rolling stock is its loj's, kept in its own sheds. A traveller rides to the gap, **gets down at a gap station**, and
  walks to the next segment through what the collapse left: a natural cavern the bore had cut through, a bypass gallery
  the Fixers dug, a block cave in the breccia, a sump waded at low water, a ledge over a breach. The walk takes an hour
  or a day; porters carry the goods across.
- **Holds grow at the gaps.** A gap station is where trade stops, goods change hands and porters live, so the lojes sit
  on the gaps as much as on the old stations (the Line's stations and its breaks are both "stations" in the Book's
  count). This is the shape of a Tungang journey and of the map: lit segments in a row, joined by walked dark.
- **The hot section is one segment and must stay whole**: only the train crosses it (`ANCIENT-TUNNELS.md`). If it broke,
  the north and south would be cut apart; it is the Tpresden's first care.

**The biome** (*proposed*: `biomes/line`, "the Line"; a station set like the Throne's). Its stations each settle one
look question:

| Station | What | Settles |
|---|---|---|
| 1 `bore` | a kept straight stretch south of the hot section: the four-track gallery, its lining, guideways, island strips, walkways and troughs, a crossover, the lamp code running to a point, a train passing and a Fixers' trolley; a crystal cleft shrine behind a rail in a granite stretch | the section, the scale, the light; the follow camera's long view |
| 1b `gap` | a gap station: the whole width fallen; the last platform, the trains' turning sheds, the porters' hold, and the walk into the cavern beyond (a breach into a natural chamber, a Fixers' bypass, a rope over a drop) to the next segment's platform | **the walk between segments**, the game's most common underground journey |
| 2 `station` | an Ancient station cavern in three states (as the Ancients left it, kept by a loj, abandoned): platforms, sidings, workshops, cistern, the ventilation, the doors; **empty of the kit's rooms**, the seed every hold grows from | the station's architecture (the Ancients' form and materials, `kits/ancients`); the hold view's test bed |
| 3 `hotdoor` | the great doors at the hot section's end, the cooling plant kept by rite, the sealed train waiting at the door; beyond it the deep stretch, rockburst spalls on the lining | heat and machinery |
| 4 `breach` | where the bore cuts a hypogene chamber in the rift fill: a bulkhead, a stair and a window from the lined bore into the natural cave (`KKARST` `hypogene`, as the Hearths) | the join of built and natural |
| 5 `fault` | the gallery split into bores through the impact breccia, one bore sheared and its tracks cut, the trains crossing over to the others; a flooded sump over two tracks at a low point | the ruin states by track |
| 6 `portal` | the Line leaving the Wall above Ledge (440,1307), with the riftrim session | daylight to the dark: the exposure ramp |

The data is the tunnel record of `ANCIENT-TUNNELS.md` section 5 (`[G data]`), the gallery drawn on `KCAVERN` (its split bores on `C.pipe`), the stations as
`KCAVERN` halls and rooms with the Ancients' fittings; the hot section's air as `core/hazard` `heat` with `soak`, and the
owed hazards (rockburst, inrush, seal) added to `core/hazard`. The camera's views (section 6) are tried here first.

**One vocabulary with the Ancient transit kit.** `KTRANSIT.subway` is a city metro (a twin-track bore, rails of gauge
1.6, cut-and-cover stations); the Line is far bigger, an intercity gallery of four or more guideways (`ANCIENT-ROADS.md`,
`ANCIENT-TUNNELS.md`). *Proposed*: a `line` kind in `KTRANSIT` (the wide gallery and its split bores, guideways by track,
crossovers, state **per track and per section**, segments and gaps derived from them, long cavern stations, the hot
section's doors), so the Line's sections, signals, states and trains are drawn by one code once that kit is merged
(question 20). The tunnel record of `ANCIENT-TUNNELS.md` section 5 gains `tracks` and a per-track `cond`, and a derived
`segments` list (each with its trains, its sheds, its two gap stations).

**The train** (*proposed*), built for the Line:

- **The Ancient Line train.** Sealed and cooled for the hot section: a power car at each end and 6 to 10 cars between (a
  crew car, saloons, a freight van, a tank car of water for the cooling), pressure-tight bodies (past a failed seal the
  hot section's air is thin as well as hot), riding the guideway. Its form is the Ancients' vehicle language of
  `kits/motor-vehicles`' `ancient` culture (white skin, bronze rails, the tram's bogies), stretched for the Line.
- **The Tungang-kept train**, a state of the same cars, not a new model: a thousand years of upkeep; plate riveted over
  the white skin, the windows plated to slits, the lamp code on the nose (green running, red tail, the white lamp
  hooded), enamel number plates, a loj's livery bands, a bell on the cab, the timetable chalked inside; the door seals
  waxed. With the Tungangs' own stock built from salvage: the Fixers' trolley (a hand-pumped car on the guideway), flat
  wagons, an ice wagon for the Glaziers' and the hot holds' ice.
- **Derelict carriages** (a state again) are the carriage houses of section 3.2: the same car, drawn into a siding.
- **States**: `built` (as the Ancients ran it), `kept`, `derelict`, `wreck` (the vehicles kit's ruin forms).
- **It runs.** A train is a record on its segment at s(t) on a timetable (`core/sched`), shuttling between the segment's
  gap stations: the Tungangs' timetable, kept as rite, is the data that runs it, and it now times the walks too (the
  timetable gives the next segment's train, so a traveller knows how long the walk may take). The player rides it
  through the hot section and walks the gaps.
- **Where it lives** (settled, the owner, 2026-11-10): the cars in `kits/motor-vehicles` (culture `ancient`, with its
  registry, rig and ruin states), placed and moved on the Line by `KTRANSIT`'s `line` kind.

#### 0.2.1 Riding: people and cargo aboard (the owner, 2026-11-10: "we do need to add functionality for people and cargo to ride them")

Nothing in Krator rides today: `core/walk`'s floors stand still, and `core/simulation`'s walkers walk. The Line needs four
things, all engine-neutral data, each an opt-in extension of a module that exists (*proposed*; question 28):

| What | How | Where |
|---|---|---|
| **A car is a moving frame** | each car's pose at time t is a function of its train's s(t) on its segment (from the timetable) and its place in the train: `car.pose(t) -> {x, y, z, yaw, pitch}`, deterministic, so the page and Godot agree | `KTRANSIT` (the `line` kind's trains) |
| **Floors that ride** | a car's floors, aisles and blocks (seats, bays) are given once in the car's own frame and registered as a **frame group**: `KWALK.frame(id, poseFn)` holds them, and every lookup (`floorsAt`, `floorBelow`, `blocked`, `push`) transforms by the frame's pose at the current time. A walker standing on a frame floor is carried by the frame's motion each tick (the moving platform), then walks on it as on any floor | `core/walk` (opt-in: a page with no frame groups is unchanged) |
| **Doors that open at platforms** | a car door is a link between a car floor and a platform floor that exists only while the train stands at that platform with its doors open (the timetable's dwell): a nav edge with a time window, a walk strip that switches on (`W.setBlock` already switches blocks) | `KTRANSIT` with `core/door` where it fits; the nav graph |
| **Riders and cargo in the simulation** | an itinerary gains a **ride leg**: walk to the platform, wait for the train, ride (the rider's pose is the car's pose with a seat or standing offset), alight, walk on: **the walk across a gap is an ordinary walk leg**, then the next segment's ride. Cargo is a record `{id, kind, qty, owner, from, to}` in a car's slot, the train a **carrier** on a fixed route as ships are for `SIM.trade`; at a gap, **porters** carry it across as a group (Dhelv's porters' pattern) and load it on the next segment's train. All of it a function of time, replayable in Godot (`KSim`) | `core/simulation` (a ride leg and a rail carrier) |

- **Capacity** lives on the car's record in the vehicles kit: `cap: {seats, stand, slots: [{kind, size}]}` (a saloon's
  seats, a freight van's bays, the tank car's water, the ice wagon's blocks), with the interior's floors, seats and bays
  in the car's frame.
- **The player** boards at an open door (the walk key, or E at the door), walks the moving car on its frame floors, takes
  a seat, looks out; the follow camera works in the car's frame (section 6); alights at a platform. Riding the whole hot
  section is a set piece: the doors sealed, the windows plated, the heat outside on the hazard readout.
- **Who rides**: Tungangs on the turns (shift workers between holds), traders and porters, the Fixers with their gear, the
  dead going to the last stop, the Big Meeting's banners; cargo of wax, sulphur, copper, grain from Dalab at Ledge, ice
  for the hot holds, salvage.
- **Godot**: each car an `AnimatableBody3D` moved by the same pose function (`sync_to_physics`), its floors and blocks its
  children; the player's `CharacterBody3D` rides it by the platform velocity Godot already applies; car doors as
  `NavigationLink3D`s enabled by the timetable; riders replayed by `KSim`.
- **Checks** (each with its negative): every rider's pose stays on a car floor through a ride (no drift: a rider planted
  0.5 m off the floor fails); boarding only while the doors are open (a boarding during the run fails); cargo is
  conserved through every transfer (sum by kind before and after a gap); the porters' gap legs complete; the golden trace
  replays in Godot.
- **Beyond the Line**: the same frame groups and ride legs carry the Ancients' Valley's trams, the Ring Sea's ships and the
  caravans' wagons; worth building once, generically (question 28).

## 1. The peoples

### 1.1 Friendly Morlocks, not dwarves

H. G. Wells's Morlocks keep the machines running in the dark while the surface lives in the light. The Tungangs keep
that half and drop the horror: **they are the night shift that never ended**. A thousand years after the last train
pulled out with Ancients on it, they still walk the Line, read the timetable aloud, mend what can be mended and vote on
everything. They are shy of light and of strangers, dry-humoured, scrupulously fair among themselves, slow to anger and
slow to forgive (Dalab took some of them: `LORE.md` §6.1). The surface folk call them "greys" and "lamp-eyes" and are a
little afraid of them, mostly because they come at night and see you before you see them.

The cultural anchors are **the railway and the pit village**, not the mountain hall: the miners' lodge (the *loj* is a
lodge), its painted banner and its band, the gala; the night shift, the bait tin and the brew; the signal box, the
timetable, the enamel sign, the lamp code; the Soviet metro's mosaics of workers, a thousand years worn (the owner's
"post-apocalyptic Soviet").

| The cliché | What the Tungangs have instead (*proposed*) |
|---|---|
| Beards and braids | fine colourless hair, cropped short for the low galleries; faces bare, eyes huge; rank shown by **shine** (section 1.5) |
| Axes and warhammers | track tools: the long spanner, the pry bar, the lamp pole with its hook; the Fixers' gauge; in war, the pick-and-hook and the crossbow of spring steel |
| Rune-carved halls | **enamel signs and stencils**: station numbers, the lamp code, timetables in worn English letters nobody reads but the Bookmen; the walls are numbered, not carved |
| Forges under the mountain | **cold work**: rivets, bolts, wire and pressure fits. Fuel is scarce underground; metal is reused, not smelted. The one hot trade is the gypsum kiln (plaster) on the vent's heat |
| The great hall of kings | **the platform**: long, low, vaulted, linear. The biggest room in a hold is the Ancients' station, and the Tungangs' own rooms are small, warm and many |
| Mead and feasting | **the brew** (a hot drink of steeped stalk-pith, *proposed*) and the **bait tin** (packed food: Xanadu kept the word as *bāiṭ*); alecap beer at the meeting's end, by the cup, not the barrel |
| Gold hoards | the Line kept running; a loj's wealth is how many stations it keeps (`ANCIENT-TUNNELS.md`) |
| Ancestor kings | an elected steward who can be recalled by show of hands |

### 1.2 The Tungangs

**Who.** The Line's crews, in some forty lojes along the Rift line under the Outer Wall and in the caverns it joined
(*proposed* number; the plans give none). The `Tungang Union` polygon (5,804 km² at the Outer Wall's southern end) holds
them; Ledge's lifts are Loj Fower; **Loj Twenny** (a lava-tube loj on `tube_rift_08`, 457,1269) and **the Hearth hold**
(525,1400) are the two big holds the plans name. *Proposed* population: 25,000 to 40,000 in all, holds of 300 to 2,500.

**How they live** (*proposed* unless marked).

- **The shift.** A Tungang day is three **turns** of eight hours, the old shifts: one asleep, one at work, one "on the
  Line" (meetings, mending, visiting, trading at the lifts). The hold never sleeps; a loj's bell rings the turn. They go
  out to the surface on the night turn only.
- **The meeting.** Everything a loj decides is decided by show of hands in the loj hall. *Proposed*: hands are counted
  **by shadow**: a low row of lamps behind the benches throws every raised hand onto **the count wall** behind the
  steward, a white-plastered wall ruled in squares, where the sekketri counts shadows, not people. It is the one bright
  thing a loj makes on purpose.
- **The Book** on its lectern, the **Bookmen** who read it, the minute chest with every meeting since the Strike
  (canon). *Proposed*: the minutes are scratched on enamel plates when paper runs short; old lojes have walls of them.
- **The banner.** Each loj has one: a painted canvas scene with the loj's number and motto (the existing catalog piece:
  the wheel and lamp, or the show of hands). *Proposed*: **the Big Meeting**, once a year, every loj walks its banner
  down the Line to one junction hall, behind its pipe band (pipes cut from dead stalks and salvaged tube), and the
  Tpresden hears the lojes' quarrels. The one festival, and the one time the Line is crowded.
- **Sound.** They echolocate by tongue-clicks (canon), so they build for the ear: *proposed*, every junction and door is
  cut with **click-ribs**, a band of grooves or a row of hanging plates that gives the place its own echo, so a Tungang
  knows where they are with their eyes shut. Bells and chimes keep the signal codes (canon: "perhaps why Chimes is called
  Chimes"). To a player, the click-ribs are the junction's visible mark (section 5.4).
- **Light, the lamp code** (*proposed*). Tungangs see by very little and are dazzled by much. Light is rationed, low
  and coloured, and its colour is a word: **red** a home (a dim red keeps dark-sight, as a ship's night light does);
  **green** the Line (the galleries, the platforms, the way); **amber** work (the dark beds' tending lamps, the
  workshops); **blue-green** glow-cap, the common light of passages and the poor; **white** the surface, the Gaffers and
  danger: a white lamp means "stop" and is hooded at once. A visitor's torch is rude. This is the culture's and the
  player's wayfinding at once (section 6). **The code marks the ways and the doors; rooms are lit by wax light**, low
  and warm-white (hearth wax burns clean), so the salvage's enamel, rust and paint read true: Dhelv found that coloured
  light as the main light turns every surface to mud (section 0.1). A home's red lamp hangs at its door, not in it.
- **Food.** Hearth wax, the staple (*proposed* in `biomes/hearths`: tallow beads gathered at dawn, eaten and burned);
  **the dark crops** of `kits/crops` grown in the dark beds: pale fungi (the mash), alecap (beer and a purple dye), the
  mat (pressed to felt sheets for sealed beds); glow mushrooms for light, not food; **cavern leapers** (the Hearth
  hold's animal) kept in pens; fin-mice trapped as pests and eaten. From the surface by trade: Dalab's grain at Ledge;
  the Fowlers' eggs and wall honey at the Hearth hold (80 km); the Ice-cutters' ice for the hot holds. *Proposed*: **the
  bait tin**, a riveted box of wax-sealed mash cakes, the thing every Tungang carries; and **the brew**, a hot drink of
  steeped dead-stalk pith with a drop of stoke against the cold (stoke is canon as a cold remedy, fatal in excess, so
  the steward keeps the stoke).
- **Trade.** They sell what only they can: passage (guides, the trains through the hot middle, the lifts at Ledge),
  hearth wax, sulphur and the vents' copper (*proposed* nodes in `biomes/hearths`), moonglass by the rare trader from the east, and
  their labour on the Line. They buy grain, cloth, timber (scarce below), salt and iron.
- **Belief.** No gods. The Book is law, not scripture; the Strike is history, not myth. *Proposed*: what they keep as
  holy is **the Line itself** and the **turn**: a lamp left burning for every Tungang "on shift" somewhere, put out when
  they come home or die. **The dead go off shift**: laid in a sealed siding (the hold's last stop), their berth number
  painted on the seal, their lamp let burn until its wax is gone. The alpine crystal clefts in the Line's granite are
  their shrines (canon, `ANCIENT-TUNNELS.md`): rooms of quartz no one may take from.
- **Faults** (they are not saints). Big men take over lojes the Book says they should not; the Strike has become a
  weapon (work-to-rule at the lifts, raids on Dalab when the bargain breaks: canon); they nurse grudges for centuries
  (a loj will not forget a skab); and they are close: a stranger may live a year in a hold and never be asked to a
  meeting.

### 1.3 The Fellgangs

**Who.** The rim and fell folk: survivors of the tunnel wars east of Chimes who fled up and out, and lojes that broke
away. They bear the day (darker skin, smaller pupils), keep the long climbing fingers, and kept the union's words while
throwing out its stewards. The owner's look (2026-10-26) is the Tungang made **raw, militaristic and punk**; the owner's
villages (2026-11-11) are peaceful working towns. *Proposed*: both are true, because the Fellgangs are **three ways of
living**, and the punk shows in each differently:

| Way | Who | The punk in it |
|---|---|---|
| **The bands** (*wildcats*) | raiders and hunters with no steward, each with "a rulebook of their own": Wildcat (427,1453), the war camps `core/camp` still lacks a row for, Firebliss's seasonal hunters | strongest: spiked plate, trophies (a Labber's helmet, a Lizard's scale), slogans daubed on everything (NO SKABS), war drums, soot-blacked eyes, a bigun's seat |
| **The fell villages** | the Fowlers, the Ice-cutters, the High Rift's summer shielings | in paint and pride: slogans over doors, rope badges, the family's rope as its banner, a few trophies on the meeting hall; the work is careful and the houses tidy |
| **The carriers** | the Ice-cutters' long carry down the wall, egg and honey runners, guides for hire | the road gear: goggles worn up, scrap armour for the road, painted sledges |

**How they live** (*proposed* unless marked).

- **Light.** Fire people, where the Tungangs are glow people: tallow and hearth-wax flames, peat fires of moor sponge,
  braziers in spiked drums (the catalog's), and the **lantern lobelia** (canon: the rim's one native glow, faint blue on
  cold nights; "herders steer by them"), planted along their paths as Tungangs hang green lamps. They still go goggled at
  noon on snow, and soot round the eyes cuts the glare (and looks the part).
- **The rope is a vote** (the Fowlers, canon). *Proposed* in architecture: **the rope wall** in the meeting hall, each
  family's coil hung on its own peg, which is the roll; a family that loses its rope has an empty peg. **The Cold is
  owed** (the Ice-cutters, canon): *proposed* the **tally board**, a long board of notched slats, one per block cut and
  carried, on the meeting hall's end wall: the Book's habit without the Book.
- **Food.** Bell seed meal (the north rim's staple), starberries, crozier fiddleheads, eggs and young of the cliff
  flyers and wall honey (the Fowlers), herd meat (the rim's big animals, still to be named by the owner), Dalab's
  introduced pine nuts, grain bought with ice. Smoked, dried and stored in drystone (the smokehouse and egg store of
  riftrim's stand-ins).
- **Trade.** Ice down the wall to the hot floor towns (Cthonos); eggs, honey and herbs to the Hearth hold; hides and felt;
  raiding Dalab's supply trains' surface stretches (canon).
- **Belief.** The cairn house (riftrim's `fg-cairnhall`: "the dead's names, the old rules said aloud"); the Fowlers lay
  their dead on ledges of the wall (canon); *proposed*, **the cairns and stone signs** on the fells are both route marks
  and the dead's names, and a band's rulebook is read at its fire as a loj reads the Book.

### 1.3.1 Wildcat: Fellgang and Kimr

Wildcat (a Fellgang village on the model, 427,1453) sits on the rim some 100 model pixels from the Labyrinth's gate
(328,1476), where the **Kimr** live in raised pueblos among the Ice Age megafauna (`biomes/labyrinth/PLAN.md` section 5:
platforms 6-15 m up, stepped room blocks with no doors at the ground, ladders pulled up at night, round kiva-like rooms in
walled courts; the great **Aurochs** their symbol, its horns on the helmets of their most famed warriors and kings; every
part of every animal used). Kimr and Fellgang hunters already share the Firebliss Range's grounds (`biomes/firebliss`).

**The owner (2026-11-10):** Wildcat is notable for its cultural hybridization with the Kimr, whose bravado has strongly
shaped its culture of raiding; it is **about 50% Kimr** by descent; a mix of **Conan-the-Barbarian capital-H heroism and
south-western pueblo culture**.

*Proposed* from there:

- **How it mixed.** Kimr hunters who followed the strays up the gorges and stayed; Fellgang wildcats who went down and
  married in; captives taken both ways who became kin. Two tongues at one fire, the fell speech and the Kimr's (whether
  the Kimr speak Tungang is the labyrinth plan's open question).
- **Heroism with a capital H.** Renown is won by deeds and kept by name: a Wildcat hero is known across the rim, the way
  a loj is known by its number. The great hunt of the Aurochs is the first deed; the Aurochs-horn helmet is earned, never
  inherited (the Kimr's own rule, kept). Single combat settles what a meeting cannot.
- **The Boast and the show of hands.** The union's form and the Kimr's bravado in one rite: a raid is proposed by **a
  Boast**, a hero standing on the round room's roof and saying aloud what they will do; the band answers by **show of
  hands**, and the hands raised are the ones who go. A hero no hands follow goes alone, or not at all. The sekketri's
  minute book became **the Deeds**: every boast written down, and beside it whether it was made good. The band's
  rulebook is a book of deeds, and the bigun is the hero with the most boasts made good.
- **What they raid.** Dalab's supply trains on their surface stretches (canon), the Ice-cutters' ice road (canon: a rival
  band that raids it), Firebliss's hunting camps; and the Labyrinth's beasts, for the glory.
- **The village: a scrap pueblo** (the owner, 2026-11-10: Wildcat's dwellings are pueblo-like, "scrap pueblo"; in the
  Fellgang set for now). The Kimr's pueblo built from a scrapyard, on a knoll: **stepped room blocks** set back storey
  by storey, their walls **faced in salvage** (Ancient plate, the shells of wrecked cars and carriages cut open,
  corrugated sheet, container panels) over a core of drystone and rammed earth for mass and warmth; **no doors at the
  ground**, ladders of pipe pulled up at night, roof hatches of plate; flat roofs on bell-fir beams whose ends stand out
  of the walls in rows, as a pueblo's vigas do, here mixed with scrap rail and pipe; parapets, glyptodont shells as
  domed cisterns and shields; door frames of mammoth ivory; aurochs skulls along the crest; slogans painted man-high on
  the blocks (NO SKABS beside a painted aurochs). Stores and pens below, homes above, the hero's rooms on the top
  terrace under a horned crest. In the walled court the **round room** of the Kimr, sunk, its roof the Boast's stand and
  its floor where the hands are counted; trophy poles; a scrap stockade round the knoll's foot.
- **The look.** Bare-armed heroes in megafauna furs and Aurochs-horn helmets, Ancient white plate as pauldrons and
  shields, mammoth-ivory spears and long knives, Fellgang soot round the eyes and Kimr paint on the arms; war drums of
  hide; the Fellgangs' pale eyes in sun-dark Kimr faces.
- **Not the Zeijani's pueblo.** Dhelv took the kiva into carved rock with katsina-style spirits (`kits/zeijani/PLAN.md`
  6.2). Wildcat's pueblo is built above ground and holds no spirits at all: its walls carry heroes, deeds and trophies.

### 1.4 The Glaziers: the eastern loj of Opal Valley (*proposed*, all of it but the place)

**The place** (the owner, 2026-11-10: the Glaziers move to Opal Valley). The upper Opal Valley, above the Sultanate's writ
(over ~1,800 m), where `biomes/opalvalley/PLAN.md` already has "independent prospectors, exiled miners, and peaceful
herbalist-monks descending from neighbouring Oidong Valley ... work the upper tarns alongside furtive Tungang
tunnel-delvers who know the fault fissures better than any surface surveyor". Their hold is cut into **the fault scarp
between the first and second terraces** (x ~1060, the riser from 1,390 to 2,450 m), along the "potch lines" into the
basalt-rhyolite contact where the miners find Rift Black Opal; its upper mouths open on the milk-opal tarns (the
valley's station 2, `upperbed`, 1082,1672), its lower ones look down on the Xanadui factors' assay pavilion (station 3,
`middlebed`, 1038,1662). Oidong's ridge is just north; Strongbow and the Vale of Xanadu down the valley.

**Who they are: the crews who came east.** `LORE.md` §6.13 has it that at the Cataclysm some of the Tungangs' ancestors
fled east and were absorbed into Xanadu, leaving loanwords (*gāphar*, *mārā*, *bāiṭ*, *lāin*) and big eyes. *Proposed*:
not all of them were absorbed. One crew went on up the Opal River into the fault, found the fissures dark and dry, and
kept a loj there: **the eastern loj**, a thousand years apart from the Union. They never had the Line: no trains, no
stations, no doors to keep. They still read **the timetable of a train that never comes**, at every turn, as their
liturgy; the monks long took it for a calendar. The Xanadui call them **the Mārā**, "the comrades", from what they
called each other; the western lojes know them only as a half-legend, "the crews who came east".

**What they took from their neighbours, and made Tungang:**

| From | What they took | What it became |
|---|---|---|
| **Oidong** (the Order's herbalist-monks, over the ridge) | the register and the seal; contemplation; tea; celadon; opal ground into pigment | **the Register of the Veins**: every adit, vein and claim numbered like a station on the Line, with what was taken, by whom, and what is owed the Sultan, on enamel plaques in the Order's blue at each adit's mouth; **the long watch**: opal is silica settling over ages, and a Glazier's meditation is to sit with a vein and think in its time; tea from celadon; the monks' manuscript pigment ground from their spoil |
| **Xanadu** (the factors, the Sultan's Fifth, Strongbow) | gold on what is holy; the prayer wheel; massing and paint; the eight-spoked wheel | **gilt on salvage** (bought with opal); **the click wheels**: prayer wheels hung with opal chips and the frost willow's fallen spicule twigs, ringing as passers-by turn them, the Tungang click made a prayer; **carved fronts on the scarp**: tiered, battered, whitewashed fronts cut in the cliff over the tarns, tapering window cuts glazed with moonglass, cholet colours (rose, teal, saffron) bright in lamplight: a Potala on a fault; the wheel and lamp drawn with eight spokes |
| **The Tungangs** (what the crew carried) | the loj, the Book, the lamp code, the show of hands and the count wall | all kept, and the timetable of the train that never comes |

**How they live.**

- **The only Tungang hold with a face to the sky.** Their fronts look out over the tarns; by day they keep behind them,
  dazzled by a valley where every rock and leaf shimmers; at dusk the windows light, and across the milky water the
  scarp is a cliff of glowing panes.
- **Glass.** They are glaziers because of **potch**, the common opal with no fire that the jewellers throw away: sliced
  thin it is a milky translucent pane, **moonglass**, the softest light a Tungang can bear. They sell the precious opal
  down the valley (the Sultan's Fifth paid in cut stones) and keep the potch for themselves; they also grind lenses from
  the clear crystal opal of the glacial tarns, and the monks' seeing-mirrors.
- **The work and its cost.** They follow the potch lines into the dark by hand and lamp, as the valley's plan describes;
  they **wet-drill** with tarn water against the "prism-lung" of dry silica dust and wear wax-cloth masks, and the old
  ones have the Glazier's cough anyway.
- **Light.** Moonglass lanterns on wax, the lamp code on the adits, gilt that catches one lamp, the valley's opal
  flashing in it.
- **Food.** Dark crops in the old adits (pale fungi, alecap, on `kits/crops`' dark beds); lotus root and seed from the
  tarns (the valley's opal water-lotus, Oidong's lotus kin); grain, tea, sugar and dried fruit bought from Xanadu with
  opal.
- **How they differ from a western loj.** Richer, cleaner, quieter, more inward in thought and more open in fact: they
  take in strangers (monks, prospectors, the factors' clerks) where a loj keeps them out; they have no Line to keep and
  so no Fixers, and their wealth is opal, not stations.

**Tongue and look** (the owner, 2026-11-10):

- **Their language is half Xanadui by now.** Written up as **Glazier speech** on the tongues page
  (`lore/tongues-of-krator.html`, the Tungang tab): Tungang words in Xanadui grammar and sounds (verb last, case
  suffixes, the evidentials *-sin* and *-se*, and their own *-rīḍ*, "so the Book reads", from the monks' third margin
  mark), a mixed language on the model of Earth's Media Lengua; the Xanadui words whole for gold, cloth, tea, trade and
  holy things; the Book in its old letters, everything else in Xanadu's syllabary. *Ṭren qamgonārīḍ*: "the train will
  come, so the Book reads".
- **Turbans like the Xanadui**, and **slight touches of Orientalism** throughout, kept light: long sashed coats; cusped
  arches over the adit doors and the fronts' windows; pierced brass lanterns beside the moonglass ones; carpets and
  bolsters on the tea hall's floor, a brass tea urn; a little Xanadui gilt and lattice. A Tungang loj underneath, always:
  the count wall, the banner, the lamp code stay.

**The monks' outpost at the High Rift** (the owner, 2026-11-10: "could be a monk outpost maybe"). The High Rift's
Singing Gjár (`biomes/highrift/PLAN.md` station 5, 5.1 px 1572,1643, 3,700 m): eight fissures lined with chalcedony,
opal crust, bladed quartz and amethyst vugs, which "sing". *Proposed*: an Order outpost keeps watch on the singing
crystals, a small house in the Longsong style (`settlements/longsong`: its drum halls, its register and seals), where
the High Rift plan already proposes Fellgang summer country and offerings in the vugs. It is the Order's, not this kit's;
the note goes to the High Rift and Longsong plans with the owner's word.

**The Cave of Crystals** (the Hearth hold) stays a Tungang loj's (section 5.5): its crystal storey is the Hearth loj's
shrine, a crystal cleft on the grand scale, entered rarely in cooling suits packed with the Ice-cutters' ice.

### 1.5 Dress and bodies (the brief for `core/charactermodels`)

| | Tungang | Fellgang | Glazier |
|---|---|---|---|
| Body | compact (*proposed* 0.94 of a human: section 3.1), long fingers, huge eyes with eyeshine, colourless skin and hair | the human height, darker, smaller pupils, the long fingers, big-lunged | as Tungang |
| Base | layered dark canvas and grey blanket, hooded; the mat's felt; fingerless gloves (the fingers climb and feel) | hide over scrap, mist-frill felt hats and pads, sailwort-parchment capes against the rain | **turbans like the Xanadui** (the owner, 2026-11-10), wound over the goggles' strap and drawn across the mouth in the dusty adits; long coats with a sash, wax-cloth for work and Xanadui silk for the rich, dyed alecap purple and indigo; soft boots |
| Eyes | **smoked goggles** from Ancient visor glass, worn on the brow inside, down at the surface | goggles up; soot round the eyes | goggles glazed with clear opal from the tarns |
| Rank | **shine**: the steward's tabard, a faded copy of the crews' orange with stripes of **ground-glass beads** sewn on that flash in any lamp (the Ancients' reflective strips, remembered); a berth number on the back; enamel crew badges | trophies worn: plate pauldrons from Ancient white metal, a Labber's helmet, a Lizard's scale on a cord; the family's rope worn coiled across the chest (the Fowlers) | an opal set in the turban's front, gilt on the sash, the register's blue; the steward still wears the orange, as a sash |
| Carry | the bait tin, the lamp pole, the long spanner | spear, sling, pick-and-hook, crossbow | a wax-cloth dust mask, a tea brick, the potch knife |

## 2. Material culture

### 2.1 The salvage vocabulary (the shared foundation)

What the Ancients left in the Line becomes what the three peoples build (*proposed*). Each row is a kit helper, so a
part reads the same wherever it is reused.

| Ancient part (where it lies) | Becomes | Who |
|---|---|---|
| **Precast lining segments** of the Line's gallery and its split bores (section 0.2), fallen in the collapsed stretches | curved walls and vaults: a **ring house** is a room built inside one or two segments stood on end; cistern walls; the dark beds' edging | Tungang, Glazier |
| **Guideway beams** | lintels, bridges over shafts, the meeting hall's ridge, the Fellgangs' longhouse ridge | all |
| **Carriages** of the Line's trains | **the carriage house**: a derelict carriage drawn into a siding and fitted out, a rich family's home (the windows plated, a cut room behind); carriage seats as the Tpresden's chair and the meeting's benches (catalog) | Tungang |
| **Cable** from the troughs | rope, lamp lines, the lifts' rigging; the Fowlers' oldest fixed lines on the wall are Ancient cable, inherited like land | all |
| **Trough covers, deck plate, walkway grating** | floors, shelves, bunks (catalog), the dark beds' racks, Fellgang shields | all |
| **Pipe and conduit** | everything framed: bunks, rails, stands, lamp poles; the pipe band's pipes | all |
| **Doors**: the hot section's great doors, airlocks, station doors | hold gates; a loj's doors are its walls (a hold is only as safe as its doors: canon) | Tungang |
| **Lamps** (dead Ancient light fittings) | lamp housings for glow-cap jars and wax; the lamp code's coloured glass from signal lenses | all |
| **Enamel signs**, station names, numbers | tables, chest lids, the minutes on enamel, the register's plaques; read as holy text by people who cannot read them | Tungang, Glazier |
| **Fans** of the ventilation | the hold's breathing (some still turn in the draught); their blades as Fellgang roof sheets and shields | Tungang, Fellgang |
| **Lift gear and cages** | the gear kept as a shrine (catalog); cages as Fowlers' wall stations hung from the face | Tungang, Fellgang |
| **Visor and panel glass** | goggles; small windows | all |
| **White Ancient metal** (`metal.ancient.white`) | Fellgang plate armour, the bigun's seat, trophy mounts | Fellgang |
| **Tyres, buffers, rubber seals** | sledge runners, boot soles, door seals | Fellgang, Tungang |
| **Ballast** | floor gravel, the dark beds' drainage | Tungang |

**The rule of salvage** (*proposed*): Tungangs **fit** salvage (bolted, pressed, riveted, the joints neat and painted,
the part's old use still legible), Fellgangs **lash and spike** it (wired, pegged, its edges left raw, spikes added),
Glaziers **dress** it (whitewashed, gilt, set in carved stone). The same carriage seat reads as three cultures.

### 2.2 Native materials

| People | From | What |
|---|---|---|
| Tungang | the rock | hewn rock (rift-fill limestone, gneiss, the tubes' basalt): the galleries are cut, not built; **gypsum**, burned on the vent's heat into **plaster** (the count wall, the homes' whitewash: a hot trade that needs no fuel) |
| | `biomes/hearths` | **hearth wax** (lamps, food, sealant, the bait tin's seal); **dead stalks**, white hollow tubes (pipes, poles, lattices, the pipe band; canon "a pipe the Tungangs cut"); **coal moss** (bedding, stuffing); hearth trees are never felled (canon) |
| | `kits/crops` (dark beds) | pale fungi (food; *proposed* pressed and tanned into **fungus leather**); alecap (beer, purple dye); the mat (felt sheets, kept in sealed beds); glow mushrooms (lamps) |
| | the vents | sulphur; copper (*proposed* medium nodes at the fumarole lines); warm water (baths, the dark beds) |
| | fauna | cavern leaper (meat, hide), fin-mouse (pest, fur) |
| Fellgang | `biomes/riftrim` | **drystone and turf** (riftrim's stand-in row: "drystone under turf, low and long"); **bell fir** poles and light timber; **glass cane** (pipes, floats; it rings in the wind); **lobe larch** bark cordage; **mist frill** fur felted into pads and hats; **sailwort** membranes dried into parchment; **frost frill** resin varnish and tinder; **iris lichen** violet dye; **moor sponge** peat; sedge and tussock thatch; prism-heath honey; rimroot (medicine); Dalab's introductions in the west (cork oak, withies of veil willow, coilbark fibre) |
| | the fells and walls | the cliff flyers' eggs and feathers (the flyers are owed to `kits/fauna`); lake ice; the rim's big animals' hides and horn (to be named) |
| Glazier | `biomes/opalvalley` | **potch** (common opal sliced into moonglass panes), clear crystal opal (lenses), precious opal (sold: the Sultan's Fifth), the frost willow's fallen silica spicule twigs (the click wheels' chimes), tarn water (wet drilling), the basalt and rhyolite of the scarp (the fronts, whitewashed); the opal water-lotus (food); bought: gold leaf, grain, sugar (Xanadu), celadon and tea (Oidong), silk |

## 3. Architecture

### 3.1 Scale and rules

- **Tungang scale** (*proposed*, question 12): a kit constant `TG.SCALE = 0.94` for Tungang and Glazier openings, bunks
  and furniture (doorways 1.95 m, galleries 2.2 to 2.6 m clear), as `YT.SCALE` is the Khaayken's; Fellgangs at 1.0.
- **Carved first.** A Tungang room is cut into rock (a `KCAVERN` room, its walls hewn or plastered); built pieces stand
  inside the voids (bunks, partitions, carriage houses, scaffolds), never instead of them.
- **Small and many.** No Tungang room but the platform and the loj hall spans more than 8 m.
- **Every door on a gallery** has its lamp of the code's colour, a stencilled number and a click-rib.
- **Fellgangs build in the open**: drystone under turf (the riftrim row), low and long, the meeting hall the one large
  room, salvage lashed on.

### 3.2 Tungang buildings and rooms, poor to rich

| Tier | Def (*proposed* key) | What |
|---|---|---|
| poor | `tg_berth_gallery` | a gallery racked with bunks (catalog `tungang_poor_gallery_bunk`): a berth is a person's whole home; canvas curtains; a peg wall |
| poor | `tg_cut` | a single hewn cell off a gallery, 2.5 x 3 m, a curtain door, a red lamp, a glow-cap jar |
| common | `tg_set` | a household's two to four cut rooms off a siding: the hearth room (drum stove, trestle), the sleeping room (box beds behind curtains), a store; the doorway plastered white with the berth numbers of the household |
| common | `tg_ring_house` | a home built inside lining segments stood on end in a wide gallery or a collapse: curved walls of Ancient concrete, plate ends, a door from a carriage |
| rich | `tg_carriage_house` | a Line carriage on a siding, windows plated, seats kept, a cut room behind for the stove; a brass bell; the household's banner |
| rich | `tg_foremans_set` | a set of six rooms with its own lamp shrine, a tiled floor of enamel signs, enamel lockers |
| civic | `tg_platform` | **the Ancient station** fitted out: the hold's street, market and parade ground; stalls in the bays, the timetable board, the signal post, the green lamps |
| civic | `tg_loj_hall` | the meeting: raked benches, the count wall with its lamp row, the Book's lectern, the steward's desk, the Tpresden's chair if the hold is the Tpresden's, the banner, the minute chest, the minutes on enamel |
| civic | `tg_signal_box` | the steward's office in the old signal cabin over the platform (or a cut room called so) |
| civic | `tg_doors` | the hold's gate: an Ancient door kept working, its winding gear, a guard cut, the white lamp hooded |
| civic | `tg_lift_head` | Loj Fower's: the lift's machine room kept by rite, the gear shrine |
| works | `tg_dark_beds` | the fungus terraces (canon kind `field` in `CAVE.HOLD`): racks of plate trays (catalog), amber tending lamps, the mat in its sealed beds |
| works | `tg_fixers_shop` | the Fixers' workshop in a siding: the tool wall, a bench, a press, salvage sorted in bins |
| works | `tg_wax_house` | rendering hearth wax: the beads melted on the vent's heat, moulded into cakes, lamps and seals |
| works | `tg_kiln` | the gypsum kiln on a vent: plaster for the hold |
| works | `tg_bait_room`, `tg_brew_room` | the communal kitchen and the brew room by the platform |
| works | `tg_cistern`, `tg_fan_house` | water and air (section 5.3) |
| works | `tg_bath` | where the vent's water is warm: a plastered pool, the hold's luxury (Hearth hold only) |
| works | `tg_leaper_pens` | the cavern leapers' pens |
| care | `tg_stoke_room` | the infirmary: the steward's stoke, the beds |
| last | `tg_last_stop` | the sealed siding of the dead, the berth numbers on the seals, the lamps burning down |
| shrine | `tg_cleft` | a crystal cleft in the granite, a rail across its mouth, nothing taken |
| war | `tg_watch_cut`, `tg_night_mouth` | a guard cut over a gallery; the hold's mouth to the surface, hooded lamps, the click-ribs that tell who comes |

### 3.3 Fellgang buildings

The riftrim session's stand-in row is the contract: **the kit keeps its keys and boxes** (`fg-hut` 6 x 5 x 4.2 m, `fg-house`,
`fg-longhouse`, `fg-headhouse`, `fg-meethall` 18 x 10 x 7, `fg-cairnhall`, `fg-store`, `fg-smokehouse`, `fg-barn`,
`fg-ropehouse` 20 x 5 x 4, `fg-eggstore`, `fg-pens`, `fg-icehouse` (a barrow), `fg-sledgeshed`), so the Fowlers' and
Ice-cutters' stations swap stand-ins for the kit's defs without a layout change (question 18). Added (*proposed*):

| Group | Defs |
|---|---|
| The wall (Fowlers) | `fg-wall-station` (a pegged ledge with a lift cage or a plate shelter hung from the face), `fg-fixed-line` (a family's rope with its pegs and ladders, as a record: owner, length, the stretch it claims), `fg-nest-ledge`, `fg-burial-ledge` |
| The meeting | `fg-rope-wall` (inside `fg-meethall`: a peg per family), `fg-tally-board` (the Ice-cutters') |
| The ice road | `fg-lantern-post` (lobelia in a scrap housing), `fg-carry-hut` (a shelter every few hours down the wall), the sledges (catalog pieces) |
| The bands | `fg-war-camp` (a `core/camp` row: hide over scrap, the bigun's tent, the trophy pole, the drum), `fg-raid-cache` |
| Wildcat (section 1.3.1) | `fg-wc-block` (**the scrap pueblo's room block**, the owner's word: two to four storeys set back, walls faced in salvage plate, car shells and corrugated sheet over drystone and rammed earth, beam ends standing out in rows, no ground door, roof hatches, parapets; variants: a store and pen storey, a family's rooms, the hero's top terrace under a horned crest), `fg-wc-ladder` (pulled up at night), `fg-wc-round-room` (the Kimr's round room as the meeting hall, its roof the Boast's stand), `fg-wc-crest` (aurochs skulls on the parapet), `fg-wc-court` (the walled court and pen), `fg-wc-stockade` (scrap and stakes round the knoll's foot), `fg-wc-deeds-wall` (the Deeds: boasts and their outcomes painted and tallied) |
| The fells | `fg-shieling` (a summer hut on the High Rift), `fg-cairn`, `fg-stone-sign` (Firebliss's "Fellgang stone signs") |

### 3.3.1 Replacing riftrim's stand-ins (stations 8 and 9)

The rift rim session has built both villages on its stand-ins: **the Fowlers** (`--station fowlers`, 5.1 px 571,1397; commit
7cb179603 on `claude/rift-hearths-cavern-b8baf6`, GPU-verified: 27 buildings, 104 people, 21 families' ropes, 93 nests) and
**the Ice-cutters** (`--station icecut`, 470,1521; commit 864f07573 on the same branch, GPU-verified: 23 buildings, 96
people, 59 stacks of blocks with sledges, 65 lantern posts up the ice road). Both are `KHAMLET.village` on the Fellgang row of
`stations/fowlers/84f-host-fellgang.js` (`FELLGANG.ROW`, `FELLGANG.BOX`), drawn by `FELLGANG.draw` as untextured boxes:
drystone under gabled turf (`house`), round stores (`round`), open sheds (`shed`), pens (`pen`), turf barrows (`barrow`).

**The contract the kit keeps**, so the stations swap without a layout change:

- **The same keys and the same boxes.** Every def below answers to its `fg-*` key with the stand-in's `w`, `d` and `h`
  (`verify.py` asserts the measured box within 0.5 m of it), so `KHAMLET.village` lays out the same village.
- **The same frame.** Origin at the footprint's centre, the door on +z toward the lane (core/hamlet's records face their
  lane), seated as the stand-ins are: the floor at the footprint's highest corner, and a **drystone plinth** carried down
  to the lowest corner (the stand-in's `lo`), so a house on the bench's slope stands on a stepped footing, not in the air.
- **The station keeps its records.** It registers every record in `core/tags` before drawing (as now); it then calls the
  kit's `TG.fg.draw(V, o)` with the arguments `FELLGANG.draw` takes today, and the kit adds each building's parts
  (rooms, furniture) under the record. One line changes in each station's `89b` (and `84f`'s `draw` retires).
- **The row moves to `core/hamlet`** as the `fellgang` profile, **and this plan proposes the two focuses** riftrim's
  `KNOWN_ISSUES.md` lists as owed, added to `KHAMLET.FOCI` in the same change: **`fowling`** (works `fg-ropehouse`,
  `fg-eggstore`, `fg-pens`; its resource a cliff with nest ledges, its reach measured to the wall's foot) and **`ice`**
  (works `fg-icehouse`, `fg-sledgeshed`; its resource a lake frozen in winter, its season the cutting weeks). The
  station passes `focus: 'fowling'` or `'ice'` in place of `ranch` and `quarry`, with its village's records and digest
  unchanged (the works lists are the same keys, so the layout must not move: the change is proven by `test-hamlet.js` and
  both stations' `--assert`). Until it lands, the kit reads `FELLGANG.ROW` as it is, `ranch` and `quarry` standing for
  fowling and ice. This rides with phase T7 or ahead of it (question 27).

**The buildings** (*proposed* forms; every one drystone of the rim's stone under turf on bell-fir poles, salvage lashed
on, a slogan somewhere: section 1.3):

| Stand-in key | Box (w x d x h m), form | The kit's def | What it becomes |
|---|---|---|---|
| `fg-hut` | 6 x 5 x 4.2, house | `fg-hut` | a one-room hut: drystone walls 0.7 m thick, a turf roof on bell-fir poles, a door of Ancient plate on cable hinges, the hearth under a smoke hole; poor |
| `fg-house` | 9 x 6 x 4.8, house | `fg-house` | two hearths, a cross wall, a box bed in the wall's thickness, a store loft; the family's slogan over the door |
| `fg-longhouse` | 15 x 6.5 x 5.2, house | `fg-longhouse` | house and byre under one roof, **the byre at the low end** (the def reads the footing's fall and puts the byre down-slope), a drain through the gable |
| `fg-headhouse` | 13 x 8 x 5.8, house | `fg-headhouse` | the head's house (the village's elected head, not a steward: section 1.3): two rooms and a porch where the head hears complaints |
| `fg-meethall` | 18 x 10 x 7, house | `fg-meethall` | **the one large room**: benches down both walls, the fire down the middle; the Fowlers' **rope wall** (a peg for each family, its coil hung on it, an empty peg where a family lost its rope) or the Ice-cutters' **tally board** on the end wall, by a `variant` the station passes (`fowlers` or `icecut`); a scrap-plate porch |
| `fg-cairnhall` | 7 x 7 x 6, round | `fg-cairnhall` | a corbelled drystone round house; inside, the dead's names scratched on slate tallies hung in rows (no carving: section 11); the old rules said aloud from its step |
| `fg-store` | 8 x 6 x 4.5, house | `fg-store` | the general store: shelves, sacks, the trade goods (grain, cloth, metal bought with eggs or ice) |
| `fg-smokehouse` | 6 x 5 x 4.5, house | `fg-smokehouse` | a louvred turf ridge, racks of fowl and fish, a peat smudge |
| `fg-barn` | 12 x 7 x 5.5, house | `fg-barn` | hay and peat, the herd's winter feed, a threshing floor |
| `fg-ropehouse` | 20 x 5 x 4, shed | `fg-ropehouse` | **the rope walk**: a long open shed, the twisting posts, lobe-larch bark cordage laid up and Ancient cable spliced in, every family's spare coil on its own peg |
| `fg-eggstore` | 6 x 6 x 4.5, round | `fg-eggstore` | a cool corbelled store, half sunk: egg racks in ash, honey crocks, the herb bundles hung |
| `fg-pens` | 14 x 12 x 1.4, pen | `fg-pens` | drystone pens with a gate of plate and stakes, a shelter wall |
| `fg-icehouse` | 12 x 9 x 4.5, barrow | `fg-icehouse` | a turf barrow over a corbelled stone vault, a stone door frame faced with salvage plate; inside (cut-away) the blocks packed in sawdust and snow, the reckoning chalked by the door |
| `fg-sledgeshed` | 16 x 7 x 4.2, shed | `fg-sledgeshed` | an open shed, the sledges racked (catalog `fellgang_common_ice_sledge`), runners from tyres, paint pots |

**The records that are not buildings** (each drawn by the kit from the station's own record, the station placing them):

| Station record | Today | The kit's piece |
|---|---|---|
| `fowlers:rope:i` (one per household: `pts` up the fall line, `y0`, `top`) | a 5 cm ribbon, pegs every 25 m, a ladder up the first 18 m | `fg-fixed-line`: the rope (Ancient cable at the foot, bark cordage above), iron pegs and rope-ends, the ladder, **the family's mark** painted at the foot and at each peg (so the rope reads as a claim); optional `fg-wall-station`s (a pegged ledge with a lift cage or a plate shelter) where the rope passes a flat |
| `fowlers:nest:...` | a stick cup and eggs | stays the station's (the nests are the flyers', `kits/fauna`); the kit adds `fg-nest-ledge` gear beside some: a basket on a line, a plank bridged to the ledge |
| the Fowlers' dead on the wall's ledges (canon, not yet placed) | none | `fg-burial-ledge`, placed by the station on its high ledges |
| `icecut:stack:i` | pale blue blocks | stays the station's (the blocks are water); the kit adds the cutters' saws, pike poles and tongs leaned on it |
| `icecut:sledge:i` | (the station's) | the catalog's `fellgang_common_ice_sledge` |
| `icecut:lamp:i` (every 60 m up the ice road) | (the station's) | `fg-lantern-post`: a lantern lobelia in a scrap housing on a bell-fir post, lit by night |

These villages are surface work: they wait on neither the Line nor the cavern setting, so the Fellgang village defs can be
built ahead of the Tungang set (question 27).

### 3.4 Glazier buildings (*proposed*)

| Def | What |
|---|---|
| `gz_front` | the carved front of a household's rooms on the fault scarp, facing the tarns: two to four tiers, battered, whitewashed, tapering window cuts under cusped arches glazed with moonglass, cholet bands; the rich add gilt and a little lattice; poor fronts are one tier and a door |
| `gz_stair` | the switchback stairs and ledges up the scarp between the fronts, railed, lamp-coded |
| `gz_adit` | an adit's mouth: a plate-framed portal, the register's plaque, a spoil heap of potch below, the wet-drilling flume from the tarn |
| `gz_vein_gallery` | the working: a narrow gallery following a potch line into the basalt-rhyolite contact, the face lit, the wet floor |
| `gz_wheel_walk` | the click wheels along the ledge to the loj hall |
| `gz_tea_hall` | the loj's meeting hall: the benches, the count wall, celadon, the guest benches for monks and factors' clerks |
| `gz_register_room` | the Register of the Veins: plaques, the claim book, the Sultan's Fifth counted |
| `gz_glass_shop` | the moonglass workshop: potch sliced and polished into panes, lenses ground from crystal opal, frames of plate |
| `gz_monks_house` | the herbalist-monks' house in the hold: a reading room, the pigment mill grinding opal spoil, the Order's blue |
| `gz_dark_adit` | an old adit turned to dark beds |
| `gz_lotus_pond` | a terraced pond on the tarn's edge for the opal water-lotus |

### 3.5 Loj Nahn (later)

Loj Nahn lives on the Pile's crown (`kits/ancients/targets/arcpile`: 19 ha of roof fields, rope bridges, the cores walled
up, "a parapet of salvage"). Five centuries in the open have changed them (canon). *Proposed* for a later phase: a fourth
set, the Tungang shell under the sky, terraces of the Pile's own soil, everything hidden from below at night. Not
designed here.

## 4. The piece list (catalog SPEC shape)

The existing catalog files stand (Tungang 23, Fellgang 20). The kit adds pieces in the same shape
(`FURN({key, name, culture, tier, type, setting, rooms, anchor, clearance, materials, w, d, h, variants, build})`), and a
new culture file for the Glaziers (question 3: a new culture is a `core/tags` vocabulary change and so one all-builds
rebuild, best ridden with other work).

| Key (*proposed*) | Tier | Type | w x d x h (m) | Note |
|---|---|---|---|---|
| `tungang_common_count_lamps` | common | lamp | 4.0 x 0.3 x 0.4 | the low lamp row behind the meeting's benches |
| `tungang_court_count_wall` | court | art | 5.0 x 0.1 x 3.0 | the ruled white wall the shadows fall on |
| `tungang_court_enamel_minutes` | court | art | 2.4 x 0.05 x 1.8 | a wall of enamel minute plates |
| `tungang_common_click_ribs` | common | art | 1.2 x 0.1 x 2.2 | a door's sound mark: hanging plates or a grooved panel |
| `tungang_poor_bait_tin` | poor | vessel | 0.25 x 0.15 x 0.1 | the riveted bait tin (a prop, also on shelves) |
| `tungang_common_brew_urn` | common | vessel | 0.5 x 0.5 x 0.9 | the brew room's urn |
| `tungang_common_wax_moulds` | common | workstation | 1.6 x 0.7 x 0.9 | the wax house's moulds and melting tray, `job: 'wax'` |
| `tungang_common_pipe_band` | common | art | 1.0 x 0.4 x 1.2 | the band's pipes on their stand |
| `tungang_court_turn_bell` | court | art | 0.8 x 0.8 x 1.6 | the loj's bell that rings the turn |
| `tungang_poor_last_lamp` | poor | lamp | 0.2 x 0.2 x 0.3 | the lamp left at a seal |
| `tungang_common_carriage_galley` | common | stove | 1.4 x 0.7 x 1.0 | a carriage house's stove in a seat bay |
| `fellgang_common_rope_wall` | common | rack | 4.0 x 0.4 x 2.4 | the family ropes on their pegs |
| `fellgang_common_tally_board` | common | art | 3.0 x 0.1 x 1.4 | the Ice-cutters' notched slats |
| `fellgang_common_ice_sledge` | common | vessel | 2.6 x 0.9 x 0.8 | runners from tyres, painted |
| `fellgang_poor_egg_basket` | poor | storage | 0.5 x 0.5 x 0.4 | the Fowlers' cliff basket |
| `fellgang_common_wall_peg_rack` | common | rack | 1.2 x 0.3 x 1.8 | pegs, hooks and ladders |
| `glazier_poor_moonglass_lantern` | poor | lamp | 0.25 x 0.25 x 0.45 | a wax lamp behind panes of potch |
| `glazier_common_click_wheel` | common | shrine | 0.8 x 0.8 x 1.9 | a prayer wheel hung with opal chips and spicule twigs |
| `glazier_common_tea_board` | common | table | 1.2 x 0.6 x 0.35 | low, with celadon |
| `glazier_common_mask_rack` | common | rack | 1.2 x 0.4 x 1.8 | wax-cloth dust masks, lamps, the potch knives |
| `glazier_common_timetable` | common | art | 1.6 x 0.1 x 1.2 | the timetable of the train that never comes, gilt |
| `glazier_court_register_plaque` | court | art | 0.6 x 0.1 x 0.9 | enamel, the Order's blue, gilt edge |
| `glazier_court_steward_seat` | court | chair | 1.0 x 0.8 x 1.6 | a carved stone seat, whitewashed and gilt, an opal boss (no carriages in the east) |
| `glazier_common_glass_bench` | common | workstation | 1.8 x 0.8 x 0.9 | slicing and polishing potch, grinding lenses, `job: 'glazier'` |
| `glazier_common_carpet` | common | rug | 3.0 x 2.0 x 0.02 | a Xanadui carpet on the tea hall's floor, with bolsters |
| `glazier_common_brass_lantern` | common | lamp | 0.3 x 0.3 x 0.6 | pierced brass, hung beside the moonglass lanterns |
| `glazier_common_tea_urn` | common | vessel | 0.5 x 0.5 x 0.8 | brass, on a stand, the tea hall's centre |
| `fellgang_court_deeds_wall` | court | art | 4.0 x 0.1 x 2.4 | Wildcat's Deeds: boasts and their outcomes, painted and tallied |
| `fellgang_court_horn_helmet_stand` | court | rack | 0.6 x 0.6 x 1.8 | an Aurochs-horn helmet on its stand, earned |
| `fellgang_common_shell_shield_rack` | common | rack | 2.0 x 0.5 x 1.6 | glyptodont-shell and Ancient-plate shields |

The Fellgang file's `bigun` pieces stay for the bands; the villages use the common tier and the new pieces.

## 5. Underground settlement design

### 5.1 Plan: a hold is a station on a line

A Tungang hold is **linear and branching**, a railway yard turned to living in, not a radial hall:

```
  PLAN of a line hold (one deck)                   the Line (four tracks) ====================================
                                                                     |  platform (green)  |
   sets   sets   sets            loj hall     signal box             +=====+=======+======+
    |      |      |                 |              |                 siding 1     siding 2     siding 3
  --+------+------+---- siding -----+--------------+--------- (carriage houses)  (Fixers)   (dark beds, amber)
    |      |      |                                                    |
   cuts   cuts   bath   cistern   last stop (sealed)               doors (white, hooded) -> the hot section
```

- **The spine** is the Ancient station: the platforms and the four-track gallery. Everything public is on it.
- **Sidings are streets**: the old sidings and side galleries, each a district with its paint band (5.4).
- **Sets are houses**: cut rooms off the sidings, in rows, their doors numbered.
- **The doors** close the hold at both ends of the Line; the night mouth is the way to the surface.

A cavern hold (the Hearth hold) is the same idea set into natural chambers: the chambers are the halls, the galleries
between them the sidings, shelves cut up the walls the sets (canon in `CAVE.HOLD`: chambers, shelves, fields, galleries,
passages, approaches). The kit's defs drop into those records without carving again (`biomes/hearths/PLAN.md`).

### 5.2 Section: decks

```
  SECTION through a line hold (looking along the Line)

     surface  ~~~~~~~~~~~~~~~~~~~~~~~~~~~ night mouth (hooded white lamp)
                                    \
  deck +1  [sets][sets][stoke][fans] \ ramp            <- the quiet deck: homes, the infirmary, the fan house
           ----------------------------\-----
  deck 0   [loj hall][signal box]  ( P L A T F O R M )  [Fixers]   <- the Line's deck: public, green lamps
           ===================( the gallery: four guideways )===========
  deck -1  [dark beds][dark beds][wax house][cistern][last stop]   <- the work deck: amber, warm, wet
           -------------------------------------
  deck -2  [kiln on the vent][bath]                                <- the hot deck (Hearth hold only)
```

- **Decks 4.5 m apart** (2.6 m clear, the rest rock and services: pipes of dead stalk for water, ducts for air), so a
  storey cut opens a whole deck (section 6.4). The platform's vault is the one room that spans two decks.
- **Light falls with depth**: deck +1 red (homes), deck 0 green (the Line), deck -1 amber (work), the dead in the dark.
- **Heat rises**: the hot work below, the homes above where the vent's warmth arrives.

### 5.3 How a hold grows, breathes and drinks

- **Growth** (*proposed*). (1) A station of the Line is the seed: platform, sidings, workshops, cisterns, doors (all
  Ancient). (2) The first crews berth in the galleries. (3) Families cut sets off the sidings. (4) A full deck is cut
  down (work) or up (homes), joined by ramps and the old lift. (5) A hold on a vent **moves when the heat moves**
  (canon): the old chambers become stores, then the last stop, then are sealed. So every hold has an abandoned end, and
  the kit's state switch (kept, worn, abandoned) is the same def at three ages.
- **Air.** The draught runs from the night mouth to the vent or the Line's shafts; the Ancient fans still turn in it
  (`tg_fan_house`), and doors are hung to steer it. *Proposed* check: every deck has a way to the draught.
- **Water.** Cisterns of the station (Ancient), drip lines from the rock into plate gutters, the vent's warm water at
  the Hearth hold. The dark beds take the waste.
- **The surface** is the night turn's: the mouth's hooded lamps, the gathering at the hearth field, trade at the lifts.

### 5.4 How it reads to a player

After Kevin Lynch's five elements (section 6.1):

| Element | In a hold |
|---|---|
| Path | the platform and the sidings, green-lamped, the floor plate worn to a shine down the middle |
| Edge | the gallery's wall; the dark beds' darkness; the sealed end of the abandoned deck |
| District | each siding has a **paint band** at waist height, a railway livery colour (cream over red, cream over green, plain red): the Tungangs' own way of saying which siding, and the player's |
| Node | junctions: the click-ribs, an enamel number, a lamp of the code's colour, a bench |
| Landmark | the loj hall's banner wall and count wall (the one bright wall), the lift, the doors, a great crystal, the bath's steam |

### 5.5 Walking through (*proposed*)

- **A line loj (Loj Twenny's kind).** You come in by the night mouth: a cut passage, a hooded white lamp you are asked to
  cover, a door. Beyond it the air is warm and smells of wax. The platform runs away under its vault in green light,
  stalls in the bays, people sitting on carriage seats along the edge, the timetable board read aloud on the turn. A
  siding off it is cream-over-red: doors with numbers and red lamps, curtains, a child's chalk on the plaster. Below, the
  dark beds: racks of pale fungus in amber light, warm and damp. At the far end the loj hall, the banner, and the white
  count wall, the only bright surface you have seen.
- **The Hearth hold.** The chambers of a drained cave; homes on shelves cut up the walls, galleries of plate between
  them, the vent's heat everywhere, the bath steaming, the wax house's smell; the stair down to the flooded storey and
  its shelves of crops, and the two crystal doors to the loj's shrine: the beams in the heat, entered rarely, in cooling
  suits packed with the Ice-cutters' ice (a turn in the crystals lasts one block's melt).
- **The Glaziers' scarp.** From the milk-opal tarns at dusk: a cliff of tiered white and rose fronts cut in the fault
  scarp, moonglass windows lighting one by one. Up the switchback stair to an adit's mouth: the click wheels ringing as
  people pass, the register's plaque in the Order's blue, a monk at tea with the steward, and inside, the potch line
  running into the dark, wet with tarn water, a lamp at the face.
- **The Fowlers.** Stone houses on the bench at the wall's foot, the rope house long and low, and above it the wall:
  ropes and pegs and ladders up 3 km of face, cages hung from ledges, the dead on their ledges, the flyers wheeling.
- **The Ice-cutters.** Low turf houses on the lee shore, barrows of ice houses, the cut lanes on the frozen lake, and at
  night the lantern road going down the south wall, lobelia in scrap housings, a line of sledges.
- **Wildcat.** A pueblo on a knoll: stepped blocks of stone and plate, ladders, aurochs skulls along the crest, NO SKABS
  painted beside an aurochs the height of a man. In the court the round room; on its roof a hero in a horned helmet makes
  a Boast, and below, the band's hands go up.
- **A gap on the Line.** The train stops where the gallery ends in a slope of fallen rock. Porters take the loads down a
  ramp into a natural cavern the collapse opened; you follow green lamps on posts across it, wade a sump, climb a Fixers'
  stair, and come out on the next segment's platform, where its own train waits under its own loj's banner.

### 5.6 The cavern layout in `core/city` (the owner, 2026-11-10)

The owner: a cavern layout in `core/city`, which should also serve **Dhelv and future Zeijani settlements**. `core/city`
is the city-layout work's, so this is the brief for it, agreed with that work before any code, as the Khaayken's covered
way was (`kits/yeti/PLAN.md` section 3). Today Dhelv lays its city by hand (`settlements/dhelv/src/41-dhelv-layout.js`,
`DH`, with twelve checks in `tests/test-layout.js`) and is exempt from "takes `core/simulation`, therefore takes
`core/city`" as `CAVERN` in `tools/check_core_use.py`; Longsong's single complex is the other exemption.

**What the cases need.**

| Case | Spine | Spaces | Sites |
|---|---|---|---|
| A Tungang line hold | the Line's gallery and a station or gap (from the tunnel record, section 0.2) | the station cavern; decks | sets off sidings (wall sites), carriage and ring houses in the galleries (in-void sites), the loj hall, works on the work deck |
| A Tungang cavern hold (the Hearth hold) | the galleries between natural chambers (`CAVE.HOLD`) | the chambers, their shelves and fields | homes on shelves (shelf sites), halls in chambers (floor sites) |
| The Glaziers' scarp | the switchback stairs and ledges on an open fault scarp, adits into it | the scarp face, the tarn shore | fronts on the face (wall sites, outdoors), adits behind them |
| Dhelv and later Zeijani towns | a braid of lava tubes, the outer tube | the hub (a bottle hall under a light well), satellite wells (open pits), the cistern hall, the catacombs | fronts on the hall's and the wells' walls, buildings on the square and the well floors, sunk defs (the kiva, the council) |

**The setting** (*proposed*, for the city-layout work to shape):

- **The frame is three-dimensional.** `core/city` plans on a 2D raster today; the cavern setting plans a **graph of ways
  with heights**, spaces on several levels, and every lookup takes y (Dhelv's lesson).
- **Ways** are records with a kind (`gallery`, `siding`, `passage`, `tube`, `stair`, `ramp`, `shaft`, `bypass`, `ledge`),
  a section (width, height), a height profile, the `KCAVERN` primitive it carves to (`tube`, `room`, `stair`, `shaft`,
  `pipe`), and a state (kept, worn, abandoned, fallen).
- **Spaces** are halls (Dhelv's hub, a Line station, a natural chamber), wells (open pits), decks (a band of floors at one
  height) and faces (a cliff or scarp in the open).
- **Sites** by how they meet their space: `wall` (a front on a wall, facing in or out), `floor` (on a hall's floor),
  `shelf` (cut up a wall), `in-void` (built inside a gallery or hall), `sunk` (cut down under a floor).
- **Rules as plain functions on records**, as the rest of `core/city`: rock between voids (the cavern's 0.8 m), headroom,
  frontage (every site's door on a way), grades and the step rule, deck alignment (the Tungangs' bands), daylight (sites
  that need a well), wealth by distance along the graph (Dhelv's rule: it falls with the distance from the square), and
  growth by phases (a hold that moves when its heat moves leaves an abandoned end).
- **In and out.** In: the host's network (the tunnel record's segments, a cave's `CAVE.HOLD`, Dhelv's braid) and the
  kit's defs with their void plans. Out: records keyed by stable ids, edits as deltas by id, which `KCAVERN` carves and
  the kits draw; the walk floors and the nav graph written from them. `[G data]`: no three.js, no DOM, so it runs in Godot.
- **The proof.** Dhelv's layout ported onto it with its golden digest unchanged (or every change listed and accepted), as
  Voth and Verge were ported, and its `CAVERN` exemption removed; then the Tungang test hold as its second user, the
  Glaziers' scarp its third.

## 6. Camera and navigation underground

The owner's brief: underground settlements with **convenient camera navigation**. This section is the research (6.1),
what Krator already has (6.2), and the recommendation (6.3 to 6.8). Where a claim about a shipped game comes only from a
wiki or a forum, it says so.

### 6.1 What games and tools do (researched 2026-11-10)

| Technique | Who does it | What it is good for underground | How it fails underground |
|---|---|---|---|
| **Storey cut-away** (hide everything above level N; show N and below) | The Sims (Walls Up, Cutaway, Walls Down; a floor up and down button); Dwarf Fortress (one z-level, the lower ones under a fog overlay, `multilevel_overlay.png`) [1][2] | carved holds with real storeys | a flat cut through a ramp or a sloped cave leaves a ragged band, and the cut rock reads as a hollow shell unless capped |
| **Height cut-off** (a y the player sets, not a floor index) | Timberborn (layer cut-off), Stonehearth (slice from the camera's height) [3][4] | terrain and caves with no floors | Timberborn's players report it switching on by accident and hiding buildings with no warning [3]: **a cut must always say it is on** |
| **Mask round the player** (a sphere or cylinder from the player toward the camera is cut out, with a noisy edge) | Baldur's Gate 3, as recreated by a Mojang technical artist; Larian has not described its own method [5] | an orbit or follow camera in rock, where nothing is a "wall" or a "roof" | the hole shows the void outside the cave unless something is drawn there |
| **Side section** (the world drawn as a vertical slice) | Oxygen Not Included (and its overlays) [6] | reading a hold's storeys and shafts at a glance | 2D only in that game; in 3D it is a section plane (below) |
| **Section planes with caps** (cut along any plane; the cut face filled and hatched) | BIM viewers: xeokit's `SectionPlanesPlugin` and `SectionCaps` [7]; three.js's own `webgl_clipping_stencil` example (caps by stencil) [8] | one mechanism for a storey cut (horizontal), a cut through a cliff face (vertical), and "only this band" (two parallel planes, `clipIntersection`) | planes do not follow sloped floors; three.js's `Raycaster` ignores clipping, so picks must filter their hits |
| **Dithered fade of the occluder** (screen-door, not alpha: stays opaque, unsorted, shadowed) | Super Mario Odyssey (community analysis, disputed) [9]; Godot's `distance_fade_mode = PIXEL_DITHER` and `TRANSPARENCY_ALPHA_HASH` [10] | a pillar, a rope, an overhang or a room's near wall between camera and player | shimmers in motion (keep the cell one screen pixel); fading a cave wall shows the void |
| **X-ray silhouette** (the hidden character drawn with an inverted depth test, gated by stencil) | Godot 4.5+ `BaseMaterial3D.stencil_mode` XRAY / OUTLINE / CUSTOM (experimental) [10][11]; three.js r128's stencil properties on `Material`; `OutlinePass.hiddenEdgeColor` [8] | where you are behind any thickness of rock | says where you are, not how to get there |
| **Spring-arm follow camera** (a sphere cast from the pivot to the wanted camera; pull in fast, push out slowly after a dwell; ignore brief and thin blockers) | Godot `SpringArm3D` with a shape, `ShapeCast3D.get_closest_collision_safe_fraction()` [12]; Unity Cinemachine 3's Decollider and Deoccluder (camera radius, damping when occluded, minimum occlusion time, transparent layers) [13]; a three.js open-world write-up that sphere-marches a **signed-distance field** so cave ceilings and overhangs count [14] | every site | a ray slips between stalactites (use a sphere); the boom collapses into the player's own capsule; pumping at ropes and posts; in a 1.5 m tunnel no third-person spot works: go over the shoulder or first person |
| **Orbit clamped to a room's volume** | camera-controls (yomotsu): `setBoundary`, `boundaryEnclosesCamera`, `colliderMeshes` (four near-plane rays) [15] | inspecting a carved room | a box does not fit an irregular cave; the camera sticks in corners |
| **Explored-only 3D map** | Descent's automap (a wireframe of the mine you have seen, colour for doors and zones) [16]; Deep Rock Galactic's terrain scanner (a rotatable 3D sphere round the player) [17] | tunnel networks, where a top-down map stacks storeys on each other | a 3D map needs its own camera and is slow to read under pressure |
| **Map layers and above/below marks** | Elden Ring's underground layer [18]; World of Warcraft's minimap arrows for "above you / below you" [19]; Tears of the Kingdom's Depths, dark until each Lightroot is lit [20] | stacked storeys | a top-down minimap lies when storeys overlap unless it dims and arrows them |
| **Light-led wayfinding** | level-design practice: an ambient floor, the path a little brighter, the goal the brightest thing in view, non-play areas darker; Kevin Lynch's paths, edges, districts, nodes and landmarks [21][22] | every site, and it is diegetic | modern lighting blurs the read; a pitch-black level is a poor default unless darkness is the mechanic |
| **Clamped eye adaptation** | three.js r128 `AdaptiveToneMappingPass`; Godot 4.7 auto exposure on `CameraAttributesPractical` (**Forward+ only**) [23] | walking from the bright cliff into the hold | unclamped, it turns a cave into grey daylight |

Not verified, so not relied on: how BG3, Diablo IV, Metroid Prime, Uncharted, God of War and Disco Elysium do it inside;
whether Godot's stencil works in the Compatibility renderer; whether camera-controls runs on r128 (its peer range says
it does: `three >= 0.126.1`). **three-mesh-bvh** works on r128 only up to **0.5.24** (0.6 needs r151).

Sources: [1] forums.ea.com (The Sims 4 cutaway threads); [2] dwarffortresswiki.org/index.php/Z-level;
[3] timberborn.featureupvote.com/suggestions/221063; [4] steamcommunity.com/app/253250/discussions/0/3770112941888344141;
[5] 80.lv/articles/artist-recreated-baldur-s-gate-3-occlusion-cutout-effect; [6] oxygennotincluded.wiki.gg/wiki/Overlay;
[7] xeokit.github.io (SectionPlanesPlugin), xeokit.io/blog/hatching-sliced-objects-using-xeokit-sdk;
[8] threejs.org r128 docs and examples (`Material` stencil and clipping properties, `webgl_clipping_stencil`, `OutlinePass`);
[9] threadreaderapp.com/thread/924061000919285761.html; [10] docs.godotengine.org/en/4.7/classes/class_basematerial3d.html;
[11] godotengine.org/releases/4.5, godotshaders.com/shader/stencil-based-silhouette;
[12] docs.godotengine.org (SpringArm3D, ShapeCast3D); [13] docs.unity3d.com Cinemachine 3.0 Deoccluder, 3.1 Decollider;
[14] app.cinevva.com/blog/2026-06-04-open-world-browser-part-30-collision-aware-camera; [15] github.com/yomotsu/camera-controls;
[16] Descent (1995), Wikipedia; [17] deeprockgalactic.fandom.com/wiki/Terrain_Scanner; [18] pcgamer.com (Elden Ring underground map);
[19] warcraft.wiki.gg/wiki/Minimap; [20] zeldatearsofthekingdom.wiki.fextralife.com/Lightroots;
[21] Kevin Lynch, *The Image of the City* (1960); [22] worldofleveldesign.com (functional lighting), GDC Vault "Level Design
Workshop: Invisible Intuition"; [23] docs.godotengine.org/en/4.7/classes/class_cameraattributespractical.html. Also read:
John Nesky, "50 Game Camera Mistakes" (GDC 2014); Mark Haigh-Hutchinson, "Real-Time Cameras: Navigation and Occlusion"
(gamedeveloper.com: spread the casts over frames; predictive beats reactive).

### 6.2 What Krator already has

| Module | What it already does | What it lacks underground |
|---|---|---|
| `core/host` camera (`90-host-camera.js`) | orbit, pan, fly, walk (F), the pin, the depth range | **no collision with rock and no ceiling**: the orbit and fly cameras pass through it |
| `core/host` cut-away (`99-host-cutaway.js`, `KHOST.cut`) | five clipping planes intersected into a box: everything above the storey cut **and** inside the unit's box goes; the storey bar; X opens the nearest unit, `]` `[` PageUp PageDown change storey | a unit is a box with flat storeys; no caps (the cut rock reads hollow); no vertical section |
| `kits/interiors` cut-away (`IX.view.cutaway`) | `cut`, `fade`, `roof`, `off`; `setLevel(k)` hides every storey above k | built buildings only, not rock |
| `core/terrain` cavern (`KCAVERN`, `39-core-cavern.js`, draw `host/39e`) | voids as records (room, tube, hall, shaft, stair, trench, pipe, monolith), floors written to `KWALK` from the plan, chunked meshes, and **`C.sdf(x, y, z)`**, the exact signed distance to the rock | a cut through its rock is kit-local (below) |
| `kits/zeijani`, `settlements/dhelv` (section 0.1) | the rock shader opens **2 m above each void's own floor** inside up to 32 cut boxes ("a dollhouse at every level", `CV_OPTS.cutBoxes`); `camGroundY` so the camera has no floor while inside a void; a map that brightens **the ways within 6 m of your height**; a draw switch by the camera's place; the lamps' pool | all of it is the Zeijani kit's or Dhelv's own, not core; no follow camera (Dhelv walks in first person) |
| `core/walk` (`KWALK`) | every floor, strip and block; the reach audit | nothing missing |
| `core/minimap` (`KMAP`) | a plan drawn from records, `fromWalk` coloured by height, `export()` for Godot | overlapping storeys stack; no above/below marks; no schematic |

So nothing here needs a new core module. It needs **four opt-in extensions** of modules that exist (6.5), each asked for
before it is planned in detail (question 14).

### 6.3 The recommendation: four views and three aids

**The views** (one key each, all on `core/host`'s keymap):

1. **Walk (F, exists) and Follow (new, V)**. In a Tungang gallery (2.2 to 2.6 m clear, section 5) the default is first
   person. In halls, the crystal cave and on the cliffs, a **follow camera** on a spring arm that **sphere-marches
   `KCAVERN.sdf`**: the cavern's own distance field is exact, cheap (a few dozen evaluations a frame, spread over frames
   as Haigh-Hutchinson advises), counts ceilings and overhangs, and is the same function the Godot side can port. Pull in
   fast, push out slowly after a 0.4 s dwell, ignore blockers shorter than 0.15 s; **thin things never shorten the boom**
   (ropes, crystal blades, banners, lamp chains: a `thin` tag), they dither out instead (aid 1). Under 1.2 m of boom the
   camera goes over the shoulder, under 0.6 m to first person; an upward cast from the pivot lowers the pitch limit under a
   low ceiling. Built meshes (huts, scaffolds) answer through `KWALK` blocks as boxes in the same distance query.
   **The cost is measured first** (T1): Dhelv found the cavern's `ceilingAt` costs about 1 ms a query over hundreds of
   voids. If `C.sdf` is as slow, the arm reads a small distance grid cached round the camera (0.5 m, the meshing
   lattice's own samples, refreshed as the camera moves), or `C.voidSD` over only the voids near the camera.
2. **Hold view (orbit, with the storey cut)**. The orbit camera over a hold, with `KHOST.cut` opening **one storey at a
   time** (X, `]`, `[`): every hold is planned in **decks** at fixed heights (section 5.2), so one cut height opens every
   room of a deck at once, the way The Sims' floor button does. Three additions:
   - **caps**: the cut rock is drawn solid, not hollow: the rock's back faces, under the same planes, in a flat section
     colour with a faint hatch (one extra draw of the rock with `side: BackSide`; the stencil cap of three.js's
     `webgl_clipping_stencil` is the fallback if the cheap cap shows seams);
   - **the decks above** are hidden whole by their tags (free, no shader), or ghosted as a faint outline;
   - **the deck below** is drawn darker, as Dwarf Fortress fogs its lower levels, so depth reads.
   For caves with no decks (the crystal cave, the natural halls) the cut is a **soft band relative to the player**: the
   rock above the player's eye plus 3 m dithers out over a metre (Timberborn's cut-off, made automatic). **The bar always
   says a cut is on** and at what deck (Timberborn's lesson).
3. **Section view (C)**: a vertical plane, the ant-farm picture of a hold (Oxygen Not Included's side view, a BIM
   viewer's section): along the Line's axis it shows every deck, the shafts and the lift at once; two parallel planes show
   one slab. The same caps. It is also the picture for the owner's review of a hold's plan.
4. **Map (M)**: `KMAP` drawn from `KWALK`, **filtered by deck** (the current deck bright, the others dim, marks with an
   up or down arrow for what is above or below, as World of Warcraft's minimap does), and beside it **the line map**: a
   schematic, Tube-map style (nodes the lojes, stations, junctions and lifts; edges the galleries; depth down the page; the Line's intact segments drawn solid and the gaps as dashed walks, with the walk's time).
   The line map is the Tungangs' own timetable board (section 1.2), so it is diegetic: the player reads the network on the
   wall of every loj hall, and the panel is that board. *Proposed*: the map reveals only what the player has walked or
   what a loj's board has shown them (Descent's automap, Tears of the Kingdom's lit Depths).

**The aids**:

1. **Dither fade** of whatever stands between the camera and the player (a pillar, a rope, a near wall, a crystal):
   screen-door, not alpha, so it stays opaque, unsorted and shadowed. One shader chunk; Godot has it built in.
2. **X-ray silhouette** of the player and the picked NPC when rock hides them (stencil and an inverted depth test; Godot's
   `STENCIL_MODE_XRAY`).
3. **Light that leads**, which is the cultures' own: the Tungangs' lamp code (section 1.2, red for a home, green for the
   Line, amber for work, white for the surface and danger) marks every gallery and door, so a player learns the hold the
   way its people do; a lit landmark at every node (a shaft head, a loj's banner wall, a great crystal); an ambient floor
   so nothing is black; **clamped** eye adaptation between the bright rim and the hold (`core/atmos` exposure; Godot's auto
   exposure is Forward+ only, so the Compatibility build needs the clamp by hand).

**Room camera hints** (optional): a room record may carry `cam: {yaw, pitch, dist}` for a set piece (the loj hall, the
crystal cave's reveal from the gallery mouth); the orbit and the follow camera ease toward it on entering. Never relied on
for ordinary rooms.

### 6.4 Design for the camera (rules the hold's plan follows)

- **Decks at fixed heights.** Every Tungang hold puts its floors in bands 4.5 m apart (2.6 m clear, the rest rock and
  services), so a storey cut opens a whole deck cleanly. A ramp between decks is a strip in `KWALK`, never a room.
- **Public ways are camera-sized**: the platform, the main gallery and the loj hall at least 3.2 m clear and 4 m wide, so
  the follow camera has a boom; homes and stores may be tight (first person there).
- **Every node is lit and named**: a junction has a lamp of its colour, a stencilled number and a sound mark (section 3).
- **No room is buried in a deck's rock without a door on the deck's gallery** (the reach audit finds them).

### 6.5 Where it goes (all opt-in, so every page that does not ask draws as before)

| Piece | Home | Change |
|---|---|---|
| Follow camera, ceiling clamp | `core/host/90-host-camera.js` | `o.solid(x, y, z)` -> signed distance (positive in the open): `KCAVERN.sdf` plugs in; a page without it is unchanged. Keys: V |
| Caps, decks hidden by tag, the deck below darkened, the soft band, the section plane | `core/host/99-host-cutaway.js` | `o.cutaway.caps`, `ghost`, `band`, `section` (a vertical unit kind). The plane count stays fixed (three.js recompiles a material when it changes) |
| The rock cut above each void's floor | lifted from `kits/zeijani` (`CV_OPTS.cutBoxes`) to `core/terrain/host` (a material helper beside `KCAVERN.drawRock`) | so the Hearths' cave, the nwbay cave, Dhelv and the holds share one; Zeijani keeps its fork until it adopts it |
| Deck filter, above/below marks, the line map | `core/minimap` | `M.band(y0, y1)`, marks with `dy`, `M.schematic(nodes, edges)`; `export()` carries them |
| Dither fade, x-ray | `core/shader` | a dither chunk and an x-ray pass, opt-in by material |

### 6.6 Godot 4.7

| Piece | Godot |
|---|---|
| Follow camera | `SpringArm3D` with a `SphereShape3D` against the exported cavern mesh's collision (`ConcavePolygonShape3D`, which the player needs anyway), thin things on a collision layer the arm ignores; `ShapeCast3D` for the ceiling cast. `KCAVERN.sdf` ported to GDScript only for a parity test |
| Storey cut | whole decks hidden by their tag groups (`visible`, or `Camera3D.cull_mask`), with `cast_shadow = SHADOWS_ONLY` so a hidden deck still shades the one below; the band and the section plane as a shared shader include (world position, `discard`, the cap colour on back faces), since Godot has no material clip plane: the rock and the kit's materials use it; plain `StandardMaterial3D` pieces inside a cut deck are hidden by group instead |
| Dither, x-ray | `distance_fade_mode = PIXEL_DITHER` or `TRANSPARENCY_ALPHA_HASH`; `stencil_mode = XRAY` (experimental: tested first in the port) |
| Map | a `Control`'s `_draw()` from `KMAP.export()` (the deck bands, marks and the line map as data) |
| Exposure | `CameraAttributesPractical` auto exposure with min and max sensitivity (Forward+); a fixed exposure per zone in Compatibility |

### 6.7 Checks (`verify.py --assert`)

- `cam-not-in-rock`: along every walk route and preset view, the camera's distance to the rock is at least its near-plane
  margin (`C.sdf` at the camera).
- `deck-cut-clean`: with each deck cut, every room of that deck has its floor in view from the deck's preset and no floor
  of it is clipped.
- `map-reaches`: every loj, station and lift on the line map is a `KWALK` floor the reach audit reaches.
- `lamp-code`: every door on a gallery has a lamp of its colour within 6 m (section 1.2).

## 7. Textures

**Reuse** (in the library): `concrete.ancient`, `concrete.ancient.b`, `concrete.rust.streaked` (the lining segments, the
station); `metal.ancient`, `metal.ancient.white` (plate, Fellgang armour), `metal.enamel.scoured`, `metal.painted.chipped`,
`metal.rust.plate`, `metal.rust.heavy`, `metal.scrap`, `metal.tin.patchwork`, `metal.metal_grate_rusty`, `metal.corrugated.rusty`,
`metal.brass.braid`, `metal.gold` (Glazier gilt); `rubber.tyre`; `glass.frosted`, `glass.bottle` (lamp glass);
`plaster`, `plaster.white_stucco_02` (the count wall, whitewash); `rock.limestone.ironstained`, `rock.gneiss.banded`,
`rock.basalt.vesicular`, `stone.tuff.hewn` (as the hewn finish, tinted); `mineral.selenite`, `stone.geode.druze`,
`rock.quartz.vein`; `wax.tallow`, `wax.candle` (hearth wax); `organic.fungus.cap`, `organic.fungus.stalk`, `organic.fungus.gill`,
`ground.mycelium.pale`, `ground.mushroom.glow`, `card.mushroom.pale`, `card.mushroom.alecap`, `card.mushroom.glow`; `cloth.canvas`,
`cloth.felt`, `cloth.wool`, `cloth.tarp`, `cloth.oiled` (wax-cloth); `hide.leather008`, `hide.fur.brown`, `fur.bat`;
`roof.turf`, `ground.turf.native`, `rock.old_stone_wall` (Fellgang drystone); `fibre.rope`, `fibre.rope.twist`;
`ceramic.celadon.crackle` (Glazier tea), `paper.parchment` (sailwort); patterns `port/hazard` (the Line's stripes),
`ancients/glyph-band`, `xanadu/*` (lozenge, zigzag, star, sun-emblem), `order/*` (prayer-wheel, mani-stone, book-spines).

**Owed** (*proposed*, to be written into `core/materials/PROMPTS-NEEDED.md` as paste-ready prompts **only after the
owner agrees**, question 16):

| Id | What | Why no library set does it |
|---|---|---|
| `rock.hewn.drillmarked` | hand-hewn gallery wall in grey gneiss and limestone: pick and drill scars in parallel rows, soot along the top, a polish at shoulder height where people pass | `stone.tuff.hewn` is a soft volcanic tuff; the Line's rock is hard and shows drill rows |
| `concrete.lining.segment` | a precast tunnel lining segment's face: bolt pockets in a grid, gasket grooves at the joints, water stains, a painted ring number | `concrete.ancient` has no segment features; the ring house and every bore need them (also `kits/ancients`' Line) |
| `organic.fungus.leather` | pressed and tanned fungus leather, pale tan, fibrous, with stitch rows | no fungal hide in the library |
| `patterns/tungang/loj-banner` | a lodge banner: painted canvas, a central scene (crews at a lamp, the show of hands), a scroll with a number and a worn-English motto, fringe, a thousand years' fading (three variants) | the miners' banner is the culture's centrepiece |
| `patterns/tungang/enamel-signs` | an enamel sign sheet: station numbers, the lamp-code symbols, arrows, red on cream and cream on green, chipped to black iron (a 4 x 4 atlas) | signage is everywhere in a hold |
| `patterns/tungang/crew-mosaic` | a worn scrap-tile mural of the crews (Soviet metro mosaic in style: workers with lamps and spanners, a train, rays), tiles missing | the platform's landmark wall |
| `patterns/fellgang/slogans` | daubed and stencilled slogans on plate (NO SKABS, T FELL IZ US, numbers, the wheel), drips, scraped and repainted (a 2 x 2 atlas) | the Fellgangs' look |
| `patterns/glazier/cholet-front` | a carved front's painted band: Andean cholet colours (rose, teal, saffron, white) in Xanadui lozenge and zigzag, gilt edges, on whitewash | the Glaziers' fronts |

Lighting needs no texture: the lamp code is emissive colour and point-light pools (as Dhelv's `91n-night.js` moves a pool
of lights to the halos nearest the camera).

## 8. Core adoption

| Module | Taken | For |
|---|---|---|
| `core/rand` (`KRAND`) | yes | every seed: a def's draws, a hold's layout, the salvage's wear, by (world, cell, index, salt) |
| `core/tags` (`KTAGS`) | yes | every building, room, rope and register crystal registered before it is drawn; `tungang` and `fellgang` already in the vocabulary; the Glaziers' culture added (question 3) |
| `core/space` (`KSPACE`) | yes | overlap on the sheet and in a hold (no new occupancy grid) |
| `core/mask` (`KMASK`) | yes | any painted placement (the dark beds' racks, a wall's ropes) |
| `core/terrain` | yes | `KCAVERN` for every carved room, set, hall and gallery (`room`, `tube`, `hall`, `shaft`, `stair`, `fixture`); `KCAVERN.drawRock`; carve patches for the Fellgangs' sunk floors and the ice houses' barrows |
| `core/engine` | yes | built defs and their records, the sheet's scene (a new kit starts from it); the **carved-def layer** lifted from `kits/zeijani` into it (question 14) |
| `core/walk` (`KWALK`) | yes | floors written from the cavern plan and the built defs; the reach audit |
| `core/host` | yes | camera, inspector, polygon tool, probe, the cut-away (`KHOST.cut`), with the opt-in extensions of section 6.5 |
| `core/minimap` (`KMAP`) | yes | the deck-filtered map and the line map (section 6.3) |
| `core/shader` | yes | the dither fade and the x-ray pass (section 6.5) |
| `core/atmos` | yes | the placeholder sky on the sheet (`KratorSky` by path); the surface scenes' sky; exposure |
| `core/materials/record` | yes | `materials.json` on the library and the owed sets |
| `core/catalog`, `core/furnish`, `kits/catalog`, `kits/interiors` | yes | the culture files, `ROOM()` and the placer for the sets and halls, the 0.94 scale through `core/furnish` (as the Khaayken's 1.15) |
| `core/sockets` | yes | signs, lamps and banners on doors |
| `core/hamlet` | yes | the Fellgang villages: the riftrim row moves into `core/hamlet` as the `fellgang` profile (agreed with the riftrim session), with fowling and ice-cutting as focuses instead of borrowing `ranch` and `quarry` |
| `core/camp` (`KCAMP`) | yes | the bands' war camps and Firebliss's hunting camps: the `fellgang` row `core/camp/PLAN.md` lists as a gap |
| `core/city` | yes: **the cavern setting** (the owner, 2026-11-10) | every hold's layout (spine, sidings, sets, decks; shelves; the Glaziers' scarp), built with the city-layout work and proven on Dhelv first (section 5.6) |
| `kits/ancient-transit` (`KTRANSIT`) | yes, once merged | the Line as a `line` kind, its states per track, its segments and its trains placed and moved (section 0.2; question 20) |
| `kits/motor-vehicles` | yes, once merged | the Line's train cars in the `ancient` culture, with the `kept`, `derelict` and `wreck` states (question 21) |
| `core/simulation`, `core/sched`, `core/clock` | later | the turns, the meeting, the lojes as polities (`PLAN-POLITICS.md` already has Dalab against the Tungangs) when a hold page is built |
| `core/lod`, `core/export` | yes | the sheet's LOD; the Godot export (T8) |
| `core/water` | yes, for the bath and cisterns | `WATER.still` and `WATER.spring` for the warm pools; the frozen lake is riftrim's |
| `core/biome` | read through `biomes/hearths`, `biomes/riftrim` | the hearth trees, dead stalks, lobelia on the sheet |
| `core/hazard` | yes | the crystal storey's heat (hearths' records), the suit's ice as time (section 1.4) |

`python3 tools/check_core_use.py` runs before the kit is called done.

## 9. Phases

The owner's order (2026-11-10): **the biome first, then the cavern layout, then the kit.**

| Phase | What | Done when |
|---|---|---|
| T0 | the owner's answers (section 10); the owed prompts written and pasted; `LORE.md` updated with what the owner confirms | the questions are answered |
| T1 | **The Line's biome and its train** (section 0.2), its own plan first (`biomes/line/PLAN.md`): the tunnel record with tracks, per-track states and segments; the four-track gallery and its split bores on `KCAVERN`; the stations `bore`, `gap`, `station`, `hotdoor`, `breach`, `fault`, `portal`; the lining texture; the lamp code as light records; the hot section's hazards. The train: the Ancient Line cars in `kits/motor-vehicles`' `ancient` culture with `built`, `kept`, `derelict` and `wreck` states, the Fixers' trolley, running a segment on a timetable. On `KTRANSIT` as a `line` kind once `kits/ancient-transit` is merged (settled). **Riding** (section 0.2.1): frame floors, door windows, ride legs and cargo (question 28) | the owner's walk along a bore, across a gap and into a station; a train runs its segment and the player rides it; `--assert` passes |
| T2 | **The cavern setting in `core/city`** (section 5.6), with the city-layout work: Dhelv's layout ported first, its golden digest unchanged and its `CAVERN` exemption removed | `test-city.js`, Dhelv's `test-layout.js` and `verify.py --assert`, Voth's and Verge's pages unchanged |
| T3 | the camera work (section 6): first measured on Dhelv's page as it is (the cost of `C.sdf` and `C.voidSD` at the camera; what a player cannot read there today); then the opt-in extensions of section 6.5, agreed piece by piece, tried on the Line's stations and Dhelv | the new tests pass; every page that does not opt in is byte-identical (the hash baseline) |
| T4 | the kit's scaffold: `kits/tungang` on `core/engine`, the carved-def layer in core (agreed), `materials.json`, the salvage foundation (lining segment, carriage, plate, pipe, rivets, enamel, cable, the three rules of fitting), the sheet | the ring house and the carriage house build in three states and `--assert` passes |
| T5 | the Tungang set: every def of section 3.2; **the test hold in a Line station and at a gap** of the biome, laid by the cavern setting | the owner's walk through the hold; the camera checks of section 6.7 pass |
| T6 | the Hearth hold furnished: the kit's defs dropped into `CAVE.HOLD`'s volumes on hearths' pages (the hearths session places, the kit publishes); the crystal storey as the loj's shrine | the hold reads as a loj at eye level |
| T7 | the Fellgang set: the riftrim keys made real (same boxes), the wall, the ice road, the bands, **Wildcat** (with the Kimr kit's plan, question 24); the `fellgang` profile in `core/hamlet` and the row in `core/camp` | riftrim's Fowlers and Ice-cutters stations swap stand-ins for the kit with no layout change; Wildcat's pueblo reads |
| T8 | the Glaziers: their defs and culture file; the scarp hold laid by the cavern setting on `biomes/opalvalley` once that biome is built (it is a draft plan today) | the scarp's fronts, adits and register read |
| T9 | the new catalog pieces (section 4) and the Glaziers' culture registered: one all-builds rebuild, ridden with `TODO.md`'s waiting items | the catalog page passes; the baseline rewritten once |
| T10 | `verify.py --assert` in full, the Godot export and its case, the index tools, the gallery; then the settlements on the cavern setting (a gap loj, Loj Twenny, Loj Fower at Ledge), each its own plan | the sheet exports and passes; Krator Worlds carries the page |

## 10. Questions for the owner

**Answered 2026-11-10**: 1 (one kit, three sets), 2 (the Glaziers to Opal Valley), 15 (a cavern setting in `core/city`,
for Dhelv and the Zeijani too). Question 4 fell with question 2; question 9 moved to the Hearth loj.

3. **The Glaziers' name and culture id.** *Proposed*: still the **Glaziers** (Tungang *glaizaz*), for the moonglass they
   cut from potch; the Xanadui call them **the Mārā**; catalog and tags culture `glazier`. Or a name of yours?
5. **The Fellgangs as three ways of living** (bands, villages, carriers), the punk strongest in the bands: right?
6. **The lamp code**: red home, green Line, amber work, blue-green glow-cap, white surface and danger; on ways and doors
   only, rooms in wax light?
7. **The count wall** (hands counted by their shadows) and **click-ribs** (each junction's own echo): keep?
8. **Carriages**: the derelict cars of each segment's trapped stock become carriage houses, the running trains kept apart?
9. **The Hearth loj's cooling suits** run on the Ice-cutters' ice, and a turn in the crystals lasts one block's melt: keep?
10. **The Big Meeting** (one festival, the banners walked down the Line to the Tpresden, across the gaps): keep?
11. **Dress**: smoked goggles from visor glass; rank as **shine** (ground-glass bead strips on a faded orange tabard)?
12. **Body scale**: Tungangs and Glaziers at 0.94 of a human (doors 1.95 m), Fellgangs and Wildcat at 1.0?
13. **Food words**: the bait tin and the brew (steeped stalk-pith) as the anti-mead; alecap beer only by the cup?
14. **Core extensions** (no new module): may I plan, with each owner's agreement, (a) the follow camera and ceiling clamp in
    `core/host` on an opt-in distance query, (b) caps, decks hidden by tag, the soft band and a section plane in the
    cut-away, (c) deck bands, above/below marks and a line map in `core/minimap`, (d) the dither fade and x-ray in
    `core/shader`, (e) lifting Zeijani's rock cut (rock opens above each void's floor), its carved-def layer
    (`cvRoom` and the rest, `cvFromItem`), Dhelv's height-band map and its draw switch into core (`core/terrain/host`,
    `core/engine`, `core/minimap`, `core/lod`), with the Zeijani session's agreement and Dhelv's pages proven unchanged?
    The other way is to read `kits/zeijani/src/40-zj-cave.js` in place, as Locus reads the Yuni kit, but it is written
    against the Zeijani's fork of the engine.
16. **Textures**: the eight owed sets of section 7: write their prompts into `PROMPTS-NEEDED.md`?
17. **Which hold first** after the Line's biome: a loj at a gap, the Hearth hold (built and empty), or Loj Twenny?
18. **The riftrim stand-ins as the contract**: the kit keeps riftrim's `fg-*` keys and boxes so its stations swap without a
    layout change; and the `fellgang` row moves into `core/hamlet` with its own fowling and ice-cutting focuses?
19. **Loj Nahn** as a fourth set later (the Tungang shell under the sky on the Pile's crown), or the Tungang set dressed?
20. *Answered 2026-11-10*: the Line is a `line` kind in `KTRANSIT`.
21. *Answered 2026-11-10*: the cars live in the vehicles kit.
22. **The Line's shape**: one wide four-track gallery that splits into bores in bad ground; crossovers round a broken
    track; trains trapped in their segments since the collapses, shuttling between gap stations; holds at the gaps as
    well as at the old stations; the hot section one segment that must stay whole. Right?
23. **The biome**: `biomes/line`, with the stations `bore`, `gap`, `station`, `hotdoor`, `breach`, `fault` and `portal`,
    built by a session of its own from section 0.2?
24. *Answered 2026-11-10*: Wildcat in the Fellgang set for now, as a scrap pueblo. Still open: the Boast and the show of
    hands, the Deeds, the earned horn helmet, no spirits on its walls?
25. **The Glaziers' history**: the crews who came east and were not absorbed, a loj a thousand years apart, reading the
    timetable of a train that never comes; the Xanadui call them the Mārā. Right? (The tongue is settled as half
    Xanadui; the forms on the tongues page are proposals. They wait on `biomes/opalvalley`, a draft plan today.)
26. **The High Rift's outpost**: the Order's (monks at the Singing Gjár's crystals), in Longsong's style, with a note to
    the High Rift and Longsong plans; not this kit's?
27. **The Fellgang villages ahead of the order?** The Fowlers and the Ice-cutters are built on stand-ins and need neither the
    Line nor the cavern setting: build the Fellgang village defs of section 3.3.1 (and the row's move into `core/hamlet`)
    in parallel with the Line's biome, rather than after the Tungang set?
28. **Riding** (section 0.2.1): may I plan it as three opt-in core extensions (frame groups in `core/walk` so floors can
    ride; a ride leg and a rail carrier in `core/simulation`; the cars' poses and door windows in `KTRANSIT`), built
    generically so the Valley's trams, the Ring Sea's ships and the caravans' wagons can use them later? And does it
    belong to the Line's biome session (T1) or a session of its own?

## 11. Rejected and parked ideas

- **A radial great hall** at the heart of a hold: the dwarf hall the owner ruled out; a hold is linear (section 5.1).
- **Smelting and forges**: no fuel underground; cold work and the gypsum kiln instead.
- **Runes or a Tungang script**: they write worn English in stencils and enamel; the Bookmen read it.
- **Bioluminescent everything**: glow-cap is the poor man's light; the culture's light is rationed and coded.
- **The Glaziers in the Cave of Crystals**, reached by a high road along the south rim: the owner moved them to Opal
  Valley (2026-11-10); the Cave stays the Hearth loj's shrine.
- **The Glaziers as worshippers** of crystal or opal: they register and keep the veins, as the Order keeps relics; they do
  not pray to them.
- **The Line as a twin-bore metro** (`KTRANSIT.subway`'s shape): the owner wants at least four tracks side by side.
- **Camera zones per room** (Resident Evil's fixed angles) as the general method: they do not scale to procedural holds;
  kept only as optional room hints for set pieces.
- **A top-down minimap alone**: storeys stack and lie; the deck filter and the line map are needed.
- **three-mesh-bvh for camera collision**: unnecessary where `KCAVERN.sdf` gives the exact distance; and only 0.5.24 runs
  on r128.
- **Owned elsewhere**: the Line's gallery, stations and trains (the Line's biome, `KTRANSIT`, `kits/motor-vehicles`: section 0.2); the Kimr's pueblos (their own kit); the Order's outpost (Longsong's style); the bodies and clothes
  (`core/charactermodels`); the cliff flyers and the rim's big animals (`kits/fauna`, the owner names them); the dark
  crops' records (`kits/crops`); the settlements as pages (their own plans).
