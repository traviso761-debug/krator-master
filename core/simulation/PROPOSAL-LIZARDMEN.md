# Proposal: the Lizardmen on the sim layer, an economy without exchange (2026-11-16)

**The names (the owner, 2026-11-17):** *"the cube plateau village will be called iguana; the lizard capital is now renamed to
Basilisk"*. So the capital (pin `slrodrkrls`, still "Sauropolis" on the scale model until its queue renames it) is
**Basilisk**, and the plateau's granary town by the Pile (called Basilisk on 2026-11-16) is **Iguana**. This file uses the new names.

The owner, 2026-11-16: *"scope me the sites for the currently marked lizardman settlements and their environs. the
lizardmen will be autarkic but trade among their own villages for useful resources. They will not use currency as a medium
of exchange (although in game, the faction can make reference of a virtual price of goods) but exchange goods through
customs that make sense only to them .... in practice it means the in game lizardman state will be a command economy
directly moving goods and agents with little concern for 'profit' as such"*.

Everything below is *proposed* unless it quotes the lore or the owner. The facts come from a survey of the repo the same
day, written up with its sources in `core/simulation/LIZARDMEN-SURVEY.md`.

Sources:
- `LORE.md` 6.20 (l.811-896);
- `kits/lizardmen` (`DESIGN.md`, `src/59-lz-trades.js`, `KNOWN_ISSUES.md`);
- `biomes/rift` (`PLAN-STATIONS.md`, `src/50-biome-rift-species.js`), `biomes/galvanic/PLAN.md`;
- the scale model 5.1 rasters;
- `kits/resources/data/geology.json` and `ledger.json`, `kits/crops`;
- `openworld/RESOURCES-SETTLEMENTS.md`, `openworld/TRADE-SCOPE.md`;
- Gemini's `populations-gemini.json` and `trade-gemini.json`.

**A coordinate warning:** `LORE.md` 6.20 and `biomes/rift/PLAN-STATIONS.md` give the pins on the old 4.23 canvas. Add
+272,+330 for 5.1. Every pixel below is 5.1.

## 0. What the lore fixes

- They **"never trade or treat"** with anyone else, and **take no captives**: "the dead of both sides are butchered like
  animals" (LORE l.820-823).
- **No coin, no markets, no guilds:** "the castes allot work" (`59-lz-trades.js` l.31). Craft halls store their own goods
  (`DESIGN.md` l.202).
- **No warlord:** what travellers call one is "the Interpreters acting in concert, as one mind remembering what all the
  others will do" (LORE l.878-879). This is the planner the owner asks for, already in the lore.
- **Six castes**, each 1.25 times the last: Tenders, Makers, Drovers, Line warriors, Interpreters, Bulwarks. Caste is set
  at rebirth and can change between lives (LORE l.881-886).
- **Rebirth:** the offspring is the same individual with its memories, and "the same mind keeps a building for centuries
  in successive bodies" (l.871-876). So a person's place and trade are not a career: they are allotted, life by life.
- **Bronze only**, never iron or steel. Steel taken in raids sits unused in the plunder warehouse (`DESIGN.md` l.125,
  l.225-226).
- **Time:** they live it as a coil, "cause can follow memory", and linear time disgusts them (l.845-865).

The owner's command economy fits all of this. The Interpreters are the plan; the castes are the allocation of labour; the
"customs only they understand" are how the plan moves things (section 3).

## 1. The sites

Four towns are marked. Every one sits in the `rift` biome, on the floor of the Great Rift, under 1.96-2.21 atm of air.

| Pin | id | 5.1 px | Ground | Climate | Water | Its environs (30 km) |
|---|---|---|---|---|---|---|
| **Basilisk**, the stone capital | `slrodrkrls` | 765,1596 | **-2,600 m**: the model's floor value; the pin stands at the western end of the eastern terminal sea | XA hypertropic jungle, 36 °C, 2,086 mm | the **eastern terminal sea** (9,272 km², salt, "the Lizardman Rift Sea"); Tlahn Gill 8 km, Blek Beck 14 km | jungle timber (score 1,135, the map's best); fish; the **salt lake** (RESOURCES-SETTLEMENTS scores its salt 284, second on the map); iron, copper and rare earths at medium grade; gold and tin placers 13-21 km |
| **Tuatara** | `szv27b2reu` | 818,1554 | -1,704 m | XV abyssal savanna, 29 °C, 1,020 mm | **no perennial river within 40 km**: Neet Gill, a wadi, 10 km; the sea 54 km | the richest ground: **copper 102** nodes, **sulfur 99**, iron 92, silver 40, marble; the volcanic province; farmland 240 (frillpod, ballmelon, bell-date) |
| **Komodo** | `spnqhezhiw` | 865,1617 | -2,452 m | XA, 35 °C, **4,000 mm** (the model's ceiling) | the sea's eastern end (2 km); Kruk Warra (51 m³/s) 12 km; **Nahr ash-Shalālāt** (Erehwon's outflow, 1,180 m³/s) enters the sea 38 km away | **gold and tin placers** on its rivers (high and medium, 12-27 km); copper 62, oil 34; little farmland (26) but bamboo rice |
| **Gila** | `sze26pgivd` | 653,1485 | -1,614 m | XV, 29 °C, 1,051 mm | **its own salt lake** (2,304 km² at -1,723 m) | the country's only **evaporites**: halite, gypsum, potash, soda, saltpeter. Fish 168 |

Two places in the polity's polygon are not Lizardman towns in the lore:
- **The Pile** (pin `slonhq0jgv`, still named "Cube", 720,1567). Loj Nahn's Tungangs hold its upper levels and the
  Lizardmen surround it (LORE l.842-843). Its plateau has the best farmland in the country (319).
- **The Tubes** (`sa8xk6pimb`, 608,1547, a cavern). The lore calls it a proposed ruin on the Rift line. Gemini counts it as
  a Lizardman cavern town of 500. **The owner (2026-11-16): "both a ruin and a lizardman town of about 1000".**

**The two clusters.**
- **The east** is Basilisk, Tuatara and Komodo round the eastern sea. Basilisk-Tuatara is 135 km, Basilisk-Komodo
  204 km and Tuatara-Komodo 157 km, straight.
- **The west** is Gila, and the Tubes if it is theirs, round the western sea. Gila is 315 km from Basilisk.
- The Pile's plateau stands between them.
- No road or river joins any two pins.

**The frontier.**
- Tuatara is **17 km from Xanadu's south watch fort** and 80 km from Erehwon.
- Komodo is **37 km from the Golden Tears' prospecting camp** (850,1628) and 105 km from Strongwall.
- These two are the raiding towns.

**The environs to add** (*proposed*; none has a pin):

| Site | Where | What |
|---|---|---|
| **The reliquaries** | one per cluster at least: in the east on the sea's strand between Basilisk and Tuatara; in the west by Gila's lake | "cyclopean", older than the villages, storing "strange constructions" of Ancient relics (LORE l.829-831). The `lz-ley` stone in each village is "the one straight thing", aimed at its reliquary: the ley lines give the reliquaries' bearings once the villages are fixed |
| **The salt pans** | Basilisk's shore of the eastern sea; Gila's lake | the country's salt (sections 2, 4) |
| **The copper and sulfur diggings** | Tuatara's volcanic ground, 2-6 km out | ore for the bronze hall. The kit has no mine head ("no mine head ('ore for the bronze hall')", `KNOWN_ISSUES.md`): one is owed |
| **The placer camps** | Komodo's rivers, 12-27 km | gold and tin from the gravels |
| **The warrens** | the floor between the towns | the countryside. Gemini's model gives the polity 171,360 rural people in "dispersed Rift geothermal marsh warrens"; the lore says "the villages are modest". The owner decides the number (section 6) |
| **The war camps** | toward the Marches' forts and the Golden Tears' camp | `lc-hide`, `lc-shield`, `lc-seer`, `lc-sail` are the kit's raid tents (`core/camp`: "War camps only (a raid from the Rift)") |
| **Iguana, the farming town near the Pile** (the owner: a settlement of its own, "not around the pile, but on some prime farmland nearby") | *proposed* px 713,1569, 15 km west of the Pile, -373 m | the capital's granary on the plateau's flat, wet farmland, about 3,000 (*proposed*); it also keeps the watch on Loj Nahn: "attack its night parties but have never pressed it further" |

## 2. What each place makes and lacks

| Place | Makes (proposed) | Lacks |
|---|---|---|
| Basilisk | bronze (the capital's halls cast from others' ore), stone, lacquer, reed, timber, fish, salt from the sea's pans; the nest halls, the Interpreters' college | copper and tin of its own grade; grain, which the jungle shore grows poorly |
| Tuatara | copper and sulfur ore, marble; frillpods, ballmelons, bell-dates; frilled lizards | water in the dry season; tin; salt |
| Komodo | gold and tin from the placers; bamboo rice; timber; river fish | farmland, salt |
| Gila | salt, gypsum, potash, soda, saltpeter; fish | copper, tin (it is far from both) |

So the flows the plan must make are: **ore east to west and in to the capital, tin from Komodo, salt from Gila and
Basilisk's pans to everyone, food from Tuatara's savanna to the jungle towns, bronze out from the capital**.
- Steel stays where raids leave it: the plunder warehouse.
- Coal and nickel are nowhere in the country (`ledger.json`), and they do not need them.

## 3. How goods move: the Allotment and the Coil Rounds

**The Allotment (the command).** The Interpreters, "one mind remembering what all the others will do", plan by **season**
(in the sim: at each of the four quarter-days). For every good they compare each place's stock and season's need with what
it will make, and allot:
- **goods:** what moves from where to where, by whom, and when. The Drovers haul with burden beasts and sledges; no
  carrier buys or sells;
- **agents:** who works where. A Maker may be sent from Basilisk to Tuatara's diggings, and a band of Line warriors and
  Bulwarks to a war camp. Rebirth is when a caste changes, so the plan also decides which castes the next births take;
- **the raids:** how many go out, where, and what they are to bring back (livestock, tools, bodies as material).

Nothing is priced and nothing is profitable. A place sends what it is allotted, even when it is short itself, if the plan
weighs the other place's need higher. That is the difference from `SIM.trade`, whose carriers never send a good the sender
fell short of.

**The Coil Rounds (the custom only they understand).** Outsiders see goods move by a rule they cannot read. *Proposed*:
- Every allotted load travels **along the coil**, a fixed spiral circuit of the places, outward in one season and inward
  in the next. It never goes straight from sender to receiver, so a load for Tuatara from Gila passes the capital whether
  or not that is shorter.
- Two kinds of gift go round **in opposite directions**:
  - **bronze** (cast work, bells without clappers) goes outward;
  - **bone and relic** (carved bone, reliquary pieces, the bones of the dead) goes inward.
  
  Each place passes them on after holding them a set time. The useful goods ride with them. This is the Kula ring of the
  Trobriand Islands as a model. A place's standing is which gifts it has held, not what it owns.
- **The memory debt.** Since the dead are reborn with their memories, a gift is owed back across lives. The plan keeps the
  tally: a place that received bronze this coil sends bone the next. To outsiders it looks like waste: loads crossing each
  other, goods moved and moved back, steel stored and never used.

**In the game: the reckoned worth (the owner's "virtual price").** For the faction's screens, every good gets a **reckoned
worth** from the plan itself, not a market:
- what it costs in **caste-days of labour** to make or fetch, times
- how **scarce** it is against the season's allotted need (its shadow price in the plan).

The worth is shown and can be compared, but nothing is bought or sold with it. *Proposed* name: **"the Interpreters'
weight"**.

## 4. On the sim (the build, in steps)

**Built 2026-11-17: Z0, Z1, Z2, Z4 (the raids) and Z5 (the joint run with the Sultanate)** (`core/region/data/lz-tune.js`, `core/region/51-region-allot.js`, `core/region/tests/test-lizardmen.js`); the order of the rest and what each step finished: `core/simulation/PLAN-LIZARDMEN.md`.

The valley host (`core/region/50-region-valley.js`) already runs the Sultanate and Longsong at the abstract level. The
Lizardmen go on the same host with a tune of their own and **one new mechanism**, the Allotment.

| Step | What | Test |
|---|---|---|
| **Z0** | `core/region/data/lz-tune.js` (`LZ_TUNE`, `[G data]`): the four towns and their environs (section 1) as settlements of the faction `lizardmen`; the caste shares of each town's people; the works (farms of frillpod, ballmelon and lakecake; frilled-lizard herds; the salt pans; the copper and sulfur diggings and placers on fields of veins, the X2 rule; the bronze hall's batch copper + tin -> bronze; reed, lacquer, bone); the calendar (a rift year: the wet and the dry). No movement between places yet | each place fed on its own make for a season; the books balance |
| **Z1** | **The Allotment** (`core/region` part `51-region-allot.js`, opt-in by a tune's `allot`): at each quarter-day, the plan sums stocks, makes and needs by place and good, and issues directed loads (a carrier with a fixed manifest, not a want) from where the plan says to where it says; a place may be told to send what it is short of. No `keep`, no `want`, no `share` | the year's salt reaches every town; bronze reaches all four; a place sent more than its surplus when another's need weighs more (a negative: the plan that moves nothing is caught) |
| **Z2** | **The Coil Rounds**: every load routed along the coil; the bronze and bone gifts going round opposite ways with their holding times; the memory debt kept as records by id | the gifts go round the coil once a year each way; no load takes the straight road |
| **Z3** | **Agents**: the plan moves people between places at the abstract level (the host's actors re-homed), and sets the castes of the season's rebirths | a digging short of hands gets Makers from the capital; the castes' shares hold to the plan |
| **Z4** | **Raids** on the Marches: `core/camp`'s ventures (raids with balance caps), against the Marches' forts and the Vale's southern villages (PROPOSAL-XANADU X5), and against the Golden Tears' camp. The plunder (livestock, tools, steel, the dead) to the warehouse and the bone hall | a raid's take lands; Xanadu's forts record it as events |
| **Z5** | **The joint run**: the Lizardmen beside the Sultanate (and Longsong) in one valley run, as `EAST_RIFT` joins Xanadu and Longsong; the only links are the raids and the Golden Tears' camp | one ledger, no trade road between the two |
| **Z6** | **The reckoned worth** for the game's screens, from the plan's shadow prices (section 3) | the worth of salt rises at Tuatara in the dry season |

Records stay plain data keyed by id (the Godot rule): an allotment is `{season, good, from, to, qty, by, via:[coil stops]}`,
a gift `{id, kind, holder, since, dir}`, a debt `{from, to, kind, coil}`.

**What it reuses:**
- `SIM.site` for the diggings and pans;
- `XAN_TUNE.field`'s vein fields;
- `SIM.transfer`-style fixed bills for the allotted loads (Z1 may start as transfers set each quarter-day);
- `core/camp` for the war camps;
- the X2 `cut` mechanism for a raid's take.

## 5. Core adoption (to write in full before Z0)

- The towns' drawing on `core/city`: the kit's spiral village layout is owed, "that needs a street generator on
  `core/city`, agreed with that workstream first" (`kits/lizardmen/KNOWN_ISSUES.md`).
- The war camps on `core/camp`.
- The environs as hamlets on `core/hamlet`, in the Lizardmen's own row.
- Placement on `core/rand`, `core/tags`.
- The sim on `core/region`.
- The crops from `kits/crops`: rift-home frillpod, ballmelon, lakecake. "Rift yam" has no crop record yet; one is owed.

## 6. Questions for the owner

**The owner's answers (2026-11-16)** are recorded below each question. All seven are answered. Iguana, the farming town
near the Pile, has its name; its site and size are proposed.

1. **How many?** The lore says "the villages are modest". Gemini's model has 9,400 in the four towns and the Tubes, and
   232,560 in the whole polity (171,360 in warrens).
   - **Answered:** "basilisk will be about 15k and the regional villages 3k".
   - So the towns hold about 25,000: Basilisk ~15,000; Tuatara, Komodo and Gila ~3,000 each; the Tubes ~1,000 (question 2).
   - **Answered:** the warrens hold **20,000-40,000**, as proposed, as bulk countrysides (as Xanadu's provinces are). With
     the towns that makes the polity about 45,000-65,000.
2. **The Tubes and the Pile.**
   - **Answered:** "tubes is both a ruin and a lizardman town of about 1000". It is the Rift line's ruined cavern, lived in
     by about 1,000 Lizardmen, the western cluster's second place.
   - **Answered:** the ring is a settlement of its own, "but it's not around the pile, but on some prime farmland nearby".
     - *Proposed site:* **px 713,1569**, 15 km west of the Pile on its plateau, at -373 m. It is flat (0.6 % slope, a full
       7-by-7-cell flat patch, 14 km across), mean 23 °C, about 1,990 mm of rain, class Af. That is the plateau's prime
       farmland: the survey scores the Pile's ground the best in the country, 319 farm-equivalent km².
     - *Proposed:* a granary town of about 3,000, the regional villages' size, feeding the capital 107 km away.
     - **Its name: Iguana** (the owner, 2026-11-16).
3. **The reliquaries.** **Answered:** "one reliquary per cluster for now". One in the east, on the sea's strand between
   Basilisk and Tuatara; one in the west, by Gila's lake. Each one's place follows from its cluster's ley stones.
4. **The custom.** **Endorsed:** the Coil Rounds (the spiral circuit, bronze outward and bone inward, the memory debt).
5. **The worth's name.** **Endorsed:** "the Interpreters' weight".
6. **Salt.** **Endorsed:** Gila's evaporites and Basilisk's sea pans are the country's two salt sources.
7. **The capital's hall.** **Answered:** `lk-greathall` becomes **"the Hall of Intention"** (no longer the "Warlord's
   great hall"). The rename in `kits/lizardmen` is owed: its label, and every page that shows it.
