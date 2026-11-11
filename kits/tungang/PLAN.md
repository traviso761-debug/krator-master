# The Tungang kit: the design plan (proposal, 2026-11-10)

The culture kit of the Rift's tunnel people, **the Tungangs**, their kin on the rim and the fells, **the Fellgangs**,
and a third people this plan proposes, **the Glaziers** of the Cave of Crystals. One kit, three sets on one foundation,
as `kits/highlands` carries the Republican, Rustic and Tribal sets (question 1).

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

## 0. What the kit is

| | |
|---|---|
| Folder | `kits/tungang/` (`src/`, `build.py`, `verify.py`, `materials.json`, `tex/`, `INDEX.md`, `PORT.md`, `KNOWN_ISSUES.md`, `API.md`), three sets: `tg` (Tungang), `fg` (Fellgang), `gz` (the Glaziers), on a shared **salvage foundation** (section 2.1) |
| Page | `dist/tungang.html`: the kit sheet: each set's buildings in rows poor to rich, three seeds a row, with a state switch (kept, worn, abandoned); **a test hold** (two decks of a line station, carved, furnished, with the camera views of section 6); a Fellgang wall and a stretch of the ice road; a Glazier front in a cooler chamber |
| Engine | `core/engine` for built defs (huts, fronts, carriage houses, scaffolds); `core/terrain` `KCAVERN` for carved defs (rooms, sets, halls cut into rock), through a **carved-def layer lifted from `kits/zeijani`** into core (question 14) |
| Registry | `TG.def` (one def per building, tags `culture: 'tungang' / 'fellgang' / <the Glaziers' culture>`, `tier`, `style: carved / built / salvage`, `role`, `job`, `deck`); every hold room a record keyed by stable id, registered in `core/tags` before it is drawn |
| Biomes | read in place: `biomes/hearths` (the Hearth hold, its `CAVE.HOLD` volumes, its flora: hearth trees, dead stalks, coal moss), `biomes/riftrim` (the rim's flora, the Fowlers' and Ice-cutters' stations), `kits/crops` (the dark crops) |
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
| Form | rounded: domes, round rooms and doorways | squared: rectangular rooms and doors in plate frames, the bore's circle the one curve |
| Surface | a finish by wealth: hewn, plastered and painted, polished | hewn or plastered only; wealth is in the salvage fitted (enamel, brass, a carriage), never in the rock |
| Ornament | relief, labyrinth carving, jali, friezes | nothing carved: stencils, enamel signs, livery bands, banners, the crew mosaic |
| Grandeur | Kailasa and Lalibela: monuments cut from the rock | none: the Ancients' station is their biggest room, and they did not cut it |
| Light | a white key, oil lamps, daylight down the wells, glow as accent | the lamp code on the ways, wax light in the rooms, no daylight but the night mouth |
| Plan | a hub hall under a light well, satellites, a braid of tubes | a line: platform spine, sidings, sets, decks |

The Glaziers' carved fronts come nearest the Zeijani's. They differ by being whitewashed and painted (cholet colours,
gilt on plate) and tiered and battered like the Potala, never columned or relief-carved.

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
  hearth wax, sulphur and the vents' copper (*proposed* nodes in `biomes/hearths`), selenite panes from the Glaziers, and
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

### 1.4 The Glaziers: the people of the Cave of Crystals (*proposed*, all of it)

**The problem first.** The built Cave of Crystals is the Hearth hold's drained older storey on the rim's vent shelf
(525,1400, 3,736 m). `biomes/riftrim/PLAN.md` says the rim is too far, with too many Lizardmen in the way, for Xanadu to
exert an influence; the Vale of Xanadu (938,1496) lies about 410 model pixels east (some 750 km), and Longsong (954,1296
in `LORE.md`'s old 4.2x frame, about 1226,1626 on 5.1) about 700. So the owner's
"influenced for centuries by Xanadu and Oidong" needs a road. Two ways (question 2):

- **A (recommended): they live at the built Cave, and the influence came by the south rim's high road.** The Outer
  Wall's southern rim runs east above the Lizardmen's reach (too high and cold for them: canon) from the Ice-cutters'
  lake (470,1521) toward Opal Valley (960-1020, on Xanadu's eastern marches), where "furtive Tungang tunnel-delvers"
  already work the upper tarns **beside Oidong's monks** (`biomes/opalvalley/PLAN.md`), and the Cold Hearths (Oidong,
  1186,1591), where the hearth trees grow again and the monks keep a cairn and share stoke as their cold remedy
  (`biomes/hearths/PLAN.md`). Never a power's reach: a **pilgrims' and monks' road**, a few dozen travellers a year, for
  five centuries. The road is not surveyed on the scale model: tracing it along the drawn rim (heights, passes, where it
  must drop toward the Lizardmen) is a T0 task before the owner's answer is final.
- **B: they are an eastern hold.** A Tungang offshoot in the crystal and opal caves of Opal Valley itself, on Xanadu's
  doorstep, and the Hearth hold's cave stays a plain Tungang loj. Simpler geography; it gives up the built cave.

**Why the monks came (A).** The Order of Historians wants to know what happened at the Cataclysm, and the Tungang sagas
are the only human memory of Arccube: "much wailing and screaming, then the Lizardmen, and no Ancient bodies" (canon).
*Proposed*: some five centuries ago the Order sent a reader to the Hearth hold to take down the sagas, and stayed. The
loj that took the monks in became something else: a loj of **listeners and keepers**, the Glaziers. The Order still
keeps a small house in the cave; Xanadui pilgrims follow the monks for the cave's light, and Xanadui merchants for its
glass.

**Who they are.** A loj (they still vote, by show of hands, and still count the shadows) that took three things from the
east and made them Tungang:

| From | What they took | What it became |
|---|---|---|
| **Oidong** (the Order) | the register and the seal; contemplation; tea; celadon | **the Register of the Cave**: every great crystal numbered and named like a station on the Line, with its designation, its class and its procedure on an enamel plaque at its foot, as Longsong registers its relics; **the long watch**: a crystal grows a hair a century, and a Glazier's meditation is to sit an hour with one and think in its time; tea (Oidong's, carried in bricks) drunk from celadon; the Order's blue on the register plaques |
| **Xanadu** | gold on what is holy; the prayer wheel; massing and paint; the eight-spoked wheel | **gilt on salvage**: gold leaf (Xanadu's mines; bought dear) laid on the Ancient plate of the register's doors and the steward's seat; **the click wheels**: wheels of selenite blades and quartz rods turned by passers-by, ringing in the dark, the Tungang click made a prayer; **carved fronts**: the hold's rooms behind tiered, battered fronts cut in the cooler chambers' walls, whitewashed with the cave's own gypsum, with tapering window cuts and cholet colours (rose, teal, saffron) painted bright, seen only by lamplight: a Potala in a cave; the Line's wheel and lamp drawn with eight spokes |
| **The Tungangs** | the loj, the Book, the lamp code, the Line's salvage | all kept; the timetable is now **the cave's hours**: when the vent breathes, when the well's light falls on which crystal |

**How they live** (*proposed*).

- **The heat and the descent.** The crystal storey is 50 °C and lethal in tens of minutes (canon). The Glaziers live in
  the cooler chambers and on the shelves above the active storey's water (`CAVE.HOLD`), and go down into the crystals
  only in **cooling suits**: wax-cloth coveralls with ice pockets, the ice bought from the Ice-cutters ("the Cold is
  owed" carried 200 km down the rim). **A shift in the crystals is one block of ice**: they reckon time below by the
  melt. The suit room, the ice house and the crystal doors are their holiest rooms.
- **Glass.** They cut **moonglass**: selenite split into panes for lantern windows (the hearth-wax lamp behind a selenite
  pane is the softest light a Tungang can bear and the Glaziers' great export), sold up the Line, east to Xanadu's
  temples and to Longsong. Only fallen and floor crystal is cut; the registered crystals are never touched.
- **Light.** Selenite lanterns, the well's one shaft of daylight (canon: the broken cupola, "the one daylight in the
  cave"), followed across the crystals through the year like a sundial and marked in the register; gilt that catches a
  single lamp.
- **Food.** The Hearth hold's: wax, the dark crops on the active storey's shelves (canon kind `field`), leapers; and
  tea, brick sugar and dried fruit from the east, the Glaziers' luxuries.
- **How they differ from a Tungang loj.** Quieter, richer, cleaner, more inward; they take in strangers (the monks, the
  pilgrims) where a loj keeps them out; other lojes think them half-Xanadui and a little soft, and send their
  sick to them.

### 1.5 Dress and bodies (the brief for `core/charactermodels`)

| | Tungang | Fellgang | Glazier |
|---|---|---|---|
| Body | compact (*proposed* 0.94 of a human: section 3.1), long fingers, huge eyes with eyeshine, colourless skin and hair | the human height, darker, smaller pupils, the long fingers, big-lunged | as Tungang |
| Base | layered dark canvas and grey blanket, hooded; the mat's felt; fingerless gloves (the fingers climb and feel) | hide over scrap, mist-frill felt hats and pads, sailwort-parchment capes against the rain | wax-cloth, dyed alecap purple and indigo; Xanadui silk at the neck for the rich |
| Eyes | **smoked goggles** from Ancient visor glass, worn on the brow inside, down at the surface | goggles up; soot round the eyes | goggles with a selenite slit |
| Rank | **shine**: the steward's tabard, a faded copy of the crews' orange with stripes of **ground-glass beads** sewn on that flash in any lamp (the Ancients' reflective strips, remembered); a berth number on the back; enamel crew badges | trophies worn: plate pauldrons from Ancient white metal, a Labber's helmet, a Lizard's scale on a cord; the family's rope worn coiled across the chest (the Fowlers) | gilt: a gold-leaf disc on the hood, the register's blue |
| Carry | the bait tin, the lamp pole, the long spanner | spear, sling, pick-and-hook, crossbow | the suit's ice pockets, a tea brick |

## 2. Material culture

### 2.1 The salvage vocabulary (the shared foundation)

What the Ancients left in the Line becomes what the three peoples build (*proposed*). Each row is a kit helper, so a
part reads the same wherever it is reused.

| Ancient part (where it lies) | Becomes | Who |
|---|---|---|
| **Precast lining segments** of the 10-14 m bores (`ANCIENT-TUNNELS.md`), fallen in the collapsed stretches | curved walls and vaults: a **ring house** is a room built inside one or two segments stood on end; cistern walls; the dark beds' edging | Tungang, Glazier |
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
| Glazier | the Cave | **selenite** (moonglass panes, never the registered crystals), **gypsum** (whitewash, the fronts' render), iron-stained limestone (the fronts' red base course); bought: gold leaf (Xanadu), celadon and tea (Oidong), silk |

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
| The bands | `fg-war-camp` (a `core/camp` row: hide over scrap, the bigun's tent, the trophy pole, the drum), `fg-stockade` (Wildcat: a scrap fort of plate and stakes, slogans), `fg-raid-cache` |
| The fells | `fg-shieling` (a summer hut on the High Rift), `fg-cairn`, `fg-stone-sign` (Firebliss's "Fellgang stone signs") |

### 3.4 Glazier buildings (*proposed*)

| Def | What |
|---|---|
| `gz_front` | the carved front of a household's rooms in a cooler chamber's wall: two to four tiers, battered, whitewashed, tapering window cuts glazed with moonglass, cholet bands; the rich add gilt; poor fronts are one tier and a door |
| `gz_shelf_house` | a home on a shelf cut above the active storey's water (canon kind `shelf`): plate and plaster, a gallery rail |
| `gz_register` | the gallery of the register: plaques at the crystals' feet (a record per crystal, keyed by its designation), the crystal doors |
| `gz_suit_room` | the cooling suits on their racks, the ice pockets, the melt drain, the ice clock |
| `gz_ice_house` | the ice store, sawdust and snow, buying from the Ice-cutters |
| `gz_wheel_walk` | the click wheels along the way to the crystal doors |
| `gz_tea_hall` | the hold's meeting hall: the loj's benches, the count wall, celadon, the guest benches for the monks |
| `gz_order_house` | the Order's small house: a reading room, the sagas' copies, the Order's blue |
| `gz_glass_shop` | the moonglass workshop: split selenite, frames of plate, lanterns |
| `gz_pilgrim_rest` | a cut guest hall by the night road |

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
| `glazier_poor_moonglass_lantern` | poor | lamp | 0.25 x 0.25 x 0.45 | a hearth-wax lamp behind selenite |
| `glazier_common_click_wheel` | common | shrine | 0.8 x 0.8 x 1.9 | selenite blades and quartz rods on an axle |
| `glazier_common_tea_board` | common | table | 1.2 x 0.6 x 0.35 | low, with celadon |
| `glazier_common_suit_rack` | common | rack | 2.0 x 0.6 x 2.0 | cooling suits, ice pockets |
| `glazier_common_ice_clock` | common | art | 0.5 x 0.5 x 1.5 | the melt bowl and its marks |
| `glazier_court_register_plaque` | court | art | 0.6 x 0.1 x 0.9 | enamel, the Order's blue, gilt edge |
| `glazier_court_steward_seat` | court | chair | 1.0 x 0.8 x 1.6 | a carriage seat whitewashed and gilt |
| `glazier_common_glass_bench` | common | workstation | 1.8 x 0.8 x 0.9 | splitting selenite, `job: 'glazier'` |

The Fellgang file's `bigun` pieces stay for the bands; the villages use the common tier and the new pieces.

## 5. Underground settlement design

### 5.1 Plan: a hold is a station on a line

A Tungang hold is **linear and branching**, a railway yard turned to living in, not a radial hall:

```
  PLAN of a line hold (one deck)                          the Line (bore) ====================================
                                                                     |  platform (green)  |
   sets   sets   sets            loj hall     signal box             +=====+=======+======+
    |      |      |                 |              |                 siding 1     siding 2     siding 3
  --+------+------+---- siding -----+--------------+--------- (carriage houses)  (Fixers)   (dark beds, amber)
    |      |      |                                                    |
   cuts   cuts   bath   cistern   last stop (sealed)               doors (white, hooded) -> the hot section
```

- **The spine** is the Ancient station: the platform and the bore. Everything public is on it.
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
           =========================( bore, guideway )=============
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
| Edge | the bore wall; the dark beds' darkness; the sealed end of the abandoned deck |
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
  its shelves of crops, and the two crystal doors to the Glaziers' cave.
- **The Glaziers' cave.** From the cooler chamber you see the fronts first: tiers of white and rose cut in the rock,
  moonglass windows lit from behind. Then the click wheels ringing as people pass, the register's plaques in the Order's
  blue, the suit room's ice, and through the crystal doors, the beams in the heat, gold on one plate catching the
  well's shaft of daylight.
- **The Fowlers.** Stone houses on the bench at the wall's foot, the rope house long and low, and above it the wall:
  ropes and pegs and ladders up 3 km of face, cages hung from ledges, the dead on their ledges, the flyers wheeling.
- **The Ice-cutters.** Low turf houses on the lee shore, barrows of ice houses, the cut lanes on the frozen lake, and at
  night the lantern road going down the south wall, lobelia in scrap housings, a line of sledges.
- **Wildcat.** A stockade of plate and stakes on a knoll, slogans the height of a man, the trophy pole, the drum.

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
   schematic, Tube-map style (nodes the lojes, stations, junctions and lifts; edges the galleries; depth down the page).
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
| `core/city` | **asked** | a hold's layout (spine, sidings, sets, decks) is a city plan underground; `core/city` has no cavern setting (`HANDOFF-REBUILD.md`: "the Tungang holds will need it too"). Question 15 |
| `core/simulation`, `core/sched`, `core/clock` | later | the turns, the meeting, the lojes as polities (`PLAN-POLITICS.md` already has Dalab against the Tungangs) when a hold page is built |
| `core/lod`, `core/export` | yes | the sheet's LOD; the Godot export (T8) |
| `core/water` | yes, for the bath and cisterns | `WATER.still` and `WATER.spring` for the warm pools; the frozen lake is riftrim's |
| `core/biome` | read through `biomes/hearths`, `biomes/riftrim` | the hearth trees, dead stalks, lobelia on the sheet |
| `core/hazard` | yes | the crystal storey's heat (hearths' records), the suit's ice as time (section 1.4) |

`python3 tools/check_core_use.py` runs before the kit is called done.

## 9. Phases

| Phase | What | Done when |
|---|---|---|
| T0 | the owner's answers (section 10); the owed prompts written and pasted; `LORE.md` updated with what the owner confirms | the questions are answered |
| T1 | first, on Dhelv's page as it is: the cost of `C.sdf` and `C.voidSD` at the camera (section 6.3), and what the player cannot read today (a walk of its braid and wells with the existing views, written down). Then the core camera work of section 6.5, agreed piece by piece: the follow camera on `o.solid`, caps, decks by tag, the soft band, the section plane, the deck map and the line map, the dither and x-ray; tried first on hearths' built hold page (with the hearths session) | `test-walk.js`, `test-minimap.js` and the new tests pass; every page that does not opt in is byte-identical (the hash baseline) |
| T2 | the scaffold: `kits/tungang` on `core/engine`, the carved-def layer in core (agreed), `materials.json`, the salvage foundation (lining segment, carriage, plate, pipe, rivets, enamel, cable, the three rules of fitting), the sheet | the ring house and the carriage house build in three states and `--assert` passes |
| T3 | the Tungang set: every def of section 3.2; the **test hold** on the sheet (two decks of a line station, carved, lit by the lamp code, with the four views) | the owner's walk through the test hold; the camera checks of section 6.7 pass |
| T4 | the Hearth hold furnished: the kit's defs dropped into `CAVE.HOLD`'s volumes on hearths' pages (the hearths session places, the kit publishes) | the hold reads as a loj at eye level |
| T5 | the Fellgang set: the riftrim keys made real (same boxes), the wall, the ice road, the bands; the `fellgang` profile in `core/hamlet` and the row in `core/camp` | riftrim's Fowlers and Ice-cutters stations swap stand-ins for the kit with no layout change |
| T6 | the Glaziers: their defs, their culture file, the register as records; on the crystal pages | the cave's fronts and register read; the suit room and the ice clock work as records |
| T7 | the new catalog pieces (section 4) and the Glaziers' culture registered: one all-builds rebuild, ridden with `TODO.md`'s waiting items | the catalog page passes; the baseline rewritten once |
| T8 | `verify.py --assert` in full, the Godot export and its case, the index tools, the gallery; then the settlements on `core/city`'s cavern setting (Loj Twenny, Loj Fower at Ledge), each its own plan | the sheet exports and passes; Krator Worlds carries the page |

## 10. Questions for the owner

1. **One kit or three?** One kit, `kits/tungang`, with three sets on a shared salvage foundation (the Highlands
   precedent), or separate `kits/fellgang` and a Glaziers kit?
2. **The Glaziers' place.** (A, recommended) they live at the built Cave of Crystals, and Xanadu and Oidong reached them
   by the south rim's high road through Opal Valley, as monks and pilgrims, never as a power; or (B) they are an eastern
   hold in Opal Valley's caves and the built cave stays a plain loj?
3. **Their name and culture id.** *Proposed*: the **Glaziers** (Tungang *glaizaz*), for the moonglass they cut; catalog
   and tags culture `glazier`. Or a name of yours, and a Xanadui name for them?
4. **Why the monks came**: to take down the Arccube sagas, the only human memory of the exchange (the Order would not
   understand what it heard). Does that fit the author's secret, which must never be spelled out?
5. **The Fellgangs as three ways of living** (bands, villages, carriers), the punk strongest in the bands: right?
6. **The lamp code**: red home, green Line, amber work, blue-green glow-cap, white surface and danger?
7. **The count wall** (hands counted by their shadows) and **click-ribs** (each junction's own echo): keep?
8. **Carriages**: do enough derelict carriages survive for carriage houses to be the rich Tungang's home, with the
   running trains kept apart?
9. **The Glaziers' cooling suits** run on the Ice-cutters' ice, and a shift below is one block of ice: keep?
10. **The Big Meeting** (one festival, the banners walked down the Line to the Tpresden): keep?
11. **Dress**: smoked goggles from visor glass; rank as **shine** (ground-glass bead strips on a faded orange tabard)?
12. **Body scale**: Tungangs and Glaziers at 0.94 of a human (doors 1.95 m), Fellgangs at 1.0?
13. **Food words**: the bait tin and the brew (steeped stalk-pith) as the anti-mead; alecap beer only by the cup?
14. **Core extensions** (no new module): may I plan, with each owner's agreement, (a) the follow camera and ceiling clamp in
    `core/host` on an opt-in distance query, (b) caps, decks hidden by tag, the soft band and a section plane in the
    cut-away, (c) deck bands, above/below marks and a line map in `core/minimap`, (d) the dither fade and x-ray in
    `core/shader`, (e) lifting Zeijani's rock cut (rock opens above each void's floor), its carved-def layer
    (`cvRoom` and the rest, `cvFromItem`), Dhelv's height-band map and its draw switch into core (`core/terrain/host`,
    `core/engine`, `core/minimap`, `core/lod`), with the Zeijani session's agreement and Dhelv's pages proven unchanged?
    The other way is to read `kits/zeijani/src/40-zj-cave.js` in place, as Locus reads the Yuni kit, but it is written
    against the Zeijani's fork of the engine.
15. **A hold's layout**: ask the city-layout work for a **cavern setting** in `core/city` (spine, sidings, sets, decks) now,
    or lay the test hold by hand on the sheet and port it when the setting exists?
16. **Textures**: the eight owed sets of section 7: write their prompts into `PROMPTS-NEEDED.md`?
17. **Which first after the sheet**: the Hearth hold (built and empty, waiting for a loj), or a line loj (Loj Twenny)?
18. **The riftrim stand-ins as the contract**: the kit keeps riftrim's `fg-*` keys and boxes so its stations swap without a
    layout change; and the `fellgang` row moves into `core/hamlet` with its own fowling and ice-cutting focuses?
19. **Loj Nahn** as a fourth set later (the Tungang shell under the sky on the Pile's crown), or the Tungang set dressed?

## 11. Rejected and parked ideas

- **A radial great hall** at the heart of a hold: the dwarf hall the owner ruled out; a hold is linear (section 5.1).
- **Smelting and forges**: no fuel underground; cold work and the gypsum kiln instead.
- **Runes or a Tungang script**: they write worn English in stencils and enamel; the Bookmen read it.
- **Bioluminescent everything**: glow-cap is the poor man's light; the culture's light is rationed and coded.
- **The Glaziers as crystal worshippers**: they register and keep the crystals, as the Order keeps relics; they do not
  pray to them.
- **Camera zones per room** (Resident Evil's fixed angles) as the general method: they do not scale to procedural holds;
  kept only as optional room hints for set pieces.
- **A top-down minimap alone**: storeys stack and lie; the deck filter and the line map are needed.
- **three-mesh-bvh for camera collision**: unnecessary where `KCAVERN.sdf` gives the exact distance; and only 0.5.24 runs
  on r128.
- **Owned elsewhere**: the Line's bores, stations and trains (`kits/ancients`); the bodies and clothes
  (`core/charactermodels`); the cliff flyers and the rim's big animals (`kits/fauna`, the owner names them); the dark
  crops' records (`kits/crops`); the settlements as pages (their own plans).
