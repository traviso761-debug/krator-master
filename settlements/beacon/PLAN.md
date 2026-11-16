# The Beacon: the Order of the Beacon's head house over the Rift (plan, 2026-11-16)

The owner, 2026-11-16: *"the fort with rift beacon will become the head monastery of the Order of the Beacon. Spin off a
session to plan this build using the large building skill"*.

**What is settled** (the owner, 2026-11-16; `settlements/strongwall/PLAN.md` sections 5.7 and 8):
- The beacon fort over the Rift is `march.e` in the sim tune, one of the Marches' three forts (P8), 150 people, fed from
  Erehwon (`core/region/data/xan-tune.js`).
- It is *"a refurbished Ancient high-intensity beacon that has been moved there by Xanadu and connected to a generator"*.
  The tune burns a fiftieth of the Sultan's oil licence for it (`T.lit['march.e']`).
- Its keepers are **the Yellow Monastery, the Order of the Beacon**, one of Qiblai's eight great monasteries (**the gold
  one**). The order **may keep other beacon lights as well**.
- The forts' musketeers are hired from the north. Gold goes only on a fort's gate pavilion and its chapel.

**The owner's forks, 2026-11-16** (asked before drawing; *"agree with your recommendation for all"*):

| Fork | The owner's answer | What it sets |
|---|---|---|
| Where the lamp and the house stand | **The east shoulder, 853,1540** (863 m), 14 km east of the tune's pin | the site (section 1); a pin move (step B0) |
| How large the head house is | **About 300, the gold Prismarch here**; Qiblai's gold monastery is the daughter house, the order's seat in the Prismarchy | the census (section 2); the Labrang (the Prismarch's house); the Lamp School |
| Who holds the walls | **The Sultan's watch fort above, the monastery below (Gyantse)**: the fort asset holds the knoll and the lamp, the monks keep the lamp inside it, the monastery steps down the saddle behind its own wall, two walls join them | the three zones of the layout (section 3) |
| How the lamp is served | **Every night, with the signal book**: a slow sweep over the Rift dusk to dawn, the signal book flashed to the forts and posts, the beam raised to the Station when it passes | section 4 |

This is a plan with its blueprint and its layout as data. There is no kit code and no page. Everything not quoted from the
owner, the lore or the tune is *proposed*. The blueprint is `BLUEPRINT.md` (sheets in `floors/`, the manifest in
`FURNITURE.md`). The layout is `src/30-bc-layout.js` with its rules in `src/31-bc-rules.js`, tested by `test-beacon.js`.

Sources:
- `settlements/strongwall/PLAN.md` (the Marches, the fort asset, 5.7 the Ancient beacon);
- `kits/xanadu/src/80f-xa-fort-data.js` (`XFORT`, read in the Strongwall worktree; uncommitted 2026-11-16);
- `kits/qiblai/src/89q3-qb-sacred.js` (`qb_monastery`, the gold dress `o.v 2`) and `kits/qiblai/PLAN.md` section 2;
- `kits/ancients/src/89n-lighthouse.js` (`lhBeamGeo`, `LH_BEACONS`);
- `core/simulation/PROPOSAL-LIZARDMEN.md` and `LIZARDMEN-SURVEY.md`; `core/simulation/PROPOSAL-XANADU.md` (P8, X5);
- `LORE.md` 6.13 (the Decree, the Broken Wheel, the Prismarchy);
- the scale model 5.1 (`tools/scale-model/model/data`, 2 km a pixel).

## 1. The site

> **The model changed under the site (found 2026-11-16, after the owner's answers).** The owner's lake re-run of edit 7
> (5f659c054, then ef04e0733) reshaped this stretch of the rim, and the tune moved Erehwon to **841,1517** and the three
> Marches forts "with Erehwon (+35,+1 px)". `march.e` is now at **881,1541**. Sections 1.1-1.4 survey the model before the
> re-run. On today's model:
> - **The east shoulder is gone.** 853,1540 is **323 m** (was 863), `Cfa`. A 22 m lamp there sees only G1, by +7 m.
> - **The tune's new px sees nothing.** 881,1541 is 650 m, `Csa`, in the hills toward Theodiga. Every target is hidden,
>   none by less than 94 m.
> - **What keeps the owner's reasons** (a high brow over the Rift, in thin air, that sees Strongwall's line, the
>   Tempest, the Tears' camp and Lizard country). A search of x 828-901, y 1522-1565 with a 22 m lamp found:
>
> | Candidate | px | Ground | Climate | Sees | Misses |
> |---|---|---|---|---|---|
> | **A. The west brow** (*recommended*) | **839,1539** | 716 m on a knoll (782 m at 839,1538), ~1.47 atm | 18 °C, ~925 mm, `Cfb` | G1 +56 (268 km), the Tempest +23 (186), the Tears' camp +29 (179), Tuatara +40 (52), **Komodo +47** (164), the tune's `march.e` px +10 (84) | the south watch fort (now 847,1549: 26 km, -399 m), Erehwon (44 km, -418 m), Sauropolis |
> | B. The low spur | 856,1563 | 172 m, ~1.57 atm | 19 °C, ~815 mm, `Csa` | all five: G1, the Tempest, the Tears' camp, Tuatara, the south watch fort; Komodo | nothing, but it stands in raid air, 550 m lower |
> | C. The scarp foot | 851,1545 | -23 m, ~1.6 atm | 23 °C, `Aw` | all five | the house would be in Lizard air |
>
> - A's figures are on 500 m steps from the cell's own ground. B and C come from the 1 km search and want the same fine
>   pass when chosen.
> - **A's ground:** a knoll with a sheer scarp in front, where the Rift floor is at -2,000 m within 12 km, and a lower
>   bench behind it to the north (about 600 m at 1536, 455-475 m at 1533-1534).
>
>   That is the old shoulder's shape, a knoll with the house's ground behind it, only with a bigger drop to the bench.
>   The fort stands on the knoll and the precinct on the bench, Gyantse as chosen. The Lamp Stair grows to a long
>   flight or a ramp.
> - B and C are spurs with no bench: the precinct would have to be terraced down the spur.
> - **The site is re-asked of the owner.** The layout's frame and sights (`src/30-bc-layout.js`) and the sheets keep the
>   east shoulder until the answer.

### 1.1 The tune's pin: a ravine head

The tune puts `march.e` at **846,1540**. That cell is **-44 m, at the head of a ravine** cut into the Rift's northern
scarp: 22 °C, about 990 mm of rain, `Cfa`. The ravine falls south (-179 m at 1541, -320 m at 1543). Shoulders stand on
either side of it: 299 m at 841,1540 to the west and 863-885 m at 853-854,1540 to the east.

A lamp 30 m up at the pin sees:
- the Rift floor to the south, for 300-400 km on bearings 150-240°;
- G1, the Brow post, by only +8 m;
- the Golden Tears' camp.

It does not see Tuatara (blocked by 170 m), the south watch fort, Komodo or Erehwon. The owner chose the east
shoulder (the forks above).

### 1.2 The east shoulder (853,1540)

| | |
|---|---|
| Ground | **863 m**, a knoll at the head of a spur (885 m at 854,1540). The spur falls south to the Rift: 652 m at 1542, 474 m at 1543, 282 m at 1544, 67 m at 1545, -1,086 m at 1548, -1,730 m at 1550. A **saddle** lies behind the knoll to the north (849 m at 854,1538), and the rim massif rises beyond it (1,537 m at 856,1530). On the 2 km grid the steepest step is 114 m a km. The house's ground at 1:1 (the knoll's crown, the saddle 12 m below it) is an assumption until the region is cut |
| Climate | mean **17 °C**, **~990 mm**, `Cfb` (the ravine below is `Cfa`, 21-23 °C) |
| Air | about **1.44 atm**. *Estimated* as in Strongwall's plan (a scale height of about 8.2 km, 1.60 atm at 0 m). That is Strongwall's air, about as thin as a raid comes (`LORE.md` 6.13: the Lizardmen "find the highland air too thin and chilly"). The ravine is about 1.6 atm and the Rift floor about 2.0 atm |
| Water | **no river within 60 km** and no open water within 66 km (the nearest water cell is 834,1513, a basin at -581 m). The house lives on cisterns: roofs into tanks, and the saddle's runoff into a tank for the herd (section 5) |
| From the tune's pin | 14 km east. The ravine is in sight (+22 m) |
| Road | Erehwon is 105 km straight, bearing 297°, behind the rim. The road comes round the rim and down the saddle from the north (*proposed*) |

### 1.3 The lamp's sights

These are computed on the 2 km grid from 853,1540: bilinear ground, the lamp at **22 m** (the plinth's roof), a mark of
10-30 m at the target, and Earth's curve with refraction (k 0.13). They are recorded in the layout (`lamp.sights`), and
the rule "the lamp sees every place the order must reach" checks them.

| Target | px | km | Bearing | Clear by | |
|---|---|---|---|---|---|
| **G1, the Brow post** (Strongwall's watch line) | 917,1648 | 251 | 149° | **+32 m** | must |
| **The House of the Tempest** (the Violet Storm) | 886,1619 | 171 | 157° | **+25 m** | must |
| **The Golden Tears' camp** | 850,1628 | 176 | 181° | **+28 m** | must |
| Sauropolis, on the Rift floor | 765,1596 | 208 | 237° | +11 m | |
| **Tuatara** (the Lizardmen's nearest town) | 818,1554 | 75 | 248° | **+37 m** | must |
| **The south watch fort** (`march.s`) | 812,1548 | 83 | 258° | **+27 m** | must |
| The ravine (the tune's pin) | 846,1540 | 14 | 270° | +22 m | |
| Komodo | 865,1617 | 155 | 171° | -555 m | hidden |
| **Erehwon** | 806,1516 | 105 | 297° | -710 m | hidden |
| The west watch fort (`march.w`) | 783,1530 | 141 | 278° | -610 m | hidden |
| Strongwall | 912,1640 | 232 | 149° | -265 m | hidden (G1 relays) |

- The lamp at 30 m sees the same set. G1's margin grows to +40 m.
- **No cell within 16 km of the pin sees Erehwon.** Neither of the other two Marches forts sees it either. The line to
  the capital needs relays over the rim; they belong to the Marches' plan (P8's "beacon line").
- **What the lamp joins.** G1 sees Strongwall and Qiblai (Strongwall's plan, section 1), so the lamp reaches the Gold
  March's watch line. It reaches the Violet Storm's house directly, and Lizard country (Tuatara, Sauropolis, the south
  watch fort's ground) below.

### 1.4 How far the light carries (*proposed*, an estimate)

The lamp head is Ancient work, *proposed* at **about 10⁸ candela** in a narrow beam (a great searchlight's). The table
uses Allard's law, a night threshold of 2×10⁻⁷ lux and a transmission of 0.05 per meteorological visibility. It gives
the visibility each target needs to read the direct beam:

| Target | km | The visibility it needs |
|---|---|---|
| Tuatara | 75 | ~20 km |
| The south watch fort | 83 | ~22 km |
| The House of the Tempest | 171 | ~53 km |
| The Golden Tears' camp | 176 | ~55 km |
| Sauropolis | 208 | ~67 km |
| G1 | 251 | ~84 km |

So the Rift's near side reads the lamp on most nights. The Tempest and the Tears' camp read it on clear nights. G1 reads
it only on the clearest nights; the lines run low over the Rift's thick air. The loom of the beam on cloud carries
further. This answers Strongwall's open point (its section 1): G1 reads the Marches directly on the clearest nights, so
the Marches' plan still wants posts between for the rest.

## 2. Who lives there (*proposed* split; the owner's ~300, the tune's 150)

| Who | People | Where (the layout's `sleeps`) |
|---|---|---|
| **The gold Prismarch** and his household: his secretary, chamberlain and attendant monks, and the Labrang's cooks | 12 | the Labrang (8) and its household range (4) |
| **The chapter**: the professed monks. The Prior, the chant-master, the **Master of the Lamp** and the **Lamp Watch** (three keepers a night on rota, a week in the plinth and a month out), the signal readers, the librarians, the old keepers | 150 | the Yellow Monastery's cells, two to a cell (149); the Master of Novices in his house (1) |
| **The Lamp School**: masters and keepers in training for the order's other lights | 36 | the school's dormitory |
| **Novices** | 60 | the novices' range |
| **Lay brothers**: cooks, granary, the hosteller, the infirmary, the herdsmen and the dairy | 42 | over the kitchen (12), over the granary (10), the guest house (4), the infirmary (4), the byres (12) |
| **The order** | **300** | |
| **The Sultan's garrison of the watch fort** (the fort asset's): the commander, the watch of the Marches, the gate's gun, **10 hired musketeers** (`T.muskets`) | 120 | the fort's barracks |
| **The fort's others**: grooms, cooks, a smith | 30 | the fort's stable loft and gate rooms |
| **The fort** | **150** | |
| **On the shoulder** | **450** | |

- **The head house and its daughter.** The order's head, the gold Prismarch, sits here. He rides to Qiblai for the
  Prismarchy's councils and keeps the daughter house there as the order's seat on the inner square. Qiblai's gold
  monastery stays in Qiblai's clergy (ring 1, ~2,400 in bulk) in the tune.
- **Who keeps what** (the owner's Gyantse fork). The fort, its walls, gate and gun are **the Sultan's**. The lamp, its
  plinth, the cable, the generator and the oil are **the order's**. The signal room is shared: the order's reader and the
  Sultan's signaller sit at one table. The Decree forbids war-making by its clergy (`kits/qiblai/PLAN.md` 2a), so the
  monks bear no arms. They warn, and the Sultan's men fight.

## 3. The head house's programme (*proposed*; the full blueprint in `BLUEPRINT.md`)

The layout's frame: u runs south along the shoulder, v east, y up from the knoll's crown, and the origin is the lamp.
There are three zones, parted by walls (`src/30-bc-layout.js`):

- **The fort** (the Sultan's): the fort asset's **watch fort** whole (`XFORT.plan({size:'watch'})`: 56 x 42 m, 6 m
  curtains, seven towers, one gate) on the knoll's crown, **with the lamp in the keep's place**. The keep's battered
  12 x 12 m footing becomes the **Lamp Plinth**, 18 m high: the switch room, the signal room, the Lamp Watch and, on top,
  the **Chapel of the Beacon**, which is the fort's gilt chapel. The lamp head stands on the plinth's roof at 22 m. The
  gate faces north to the order and carries the forts' **gilt pavilion**.
- **The lamp ward** (the order's): the knoll's north face between **Gyantse's two walls**. The walls run from the fort's
  north-west and north-east towers down to the precinct's south corners.
  - The **Lamp Stair** climbs from the precinct's Gate of the Lamp to the fort's gate.
  - The **Generator House** holds two engine sets, one running and one spare.
  - The **Oil Pit** and the **Keepers' Workshop** stand beside it, with the **Chorten of the Keepers**.
  - The **Ward Gate** in the west wall takes the fort road, so the Sultan's men and the oil carts never cross the
    precinct.
- **The precinct** (the order's): 172 x 120 m on the saddle, behind a 6 m monastery wall.
  - The **Gate of the Wheel** (north) takes the road.
  - The **Labrang**, the gold Prismarch's four-storey house, stands next: envoys are received there without the cloister
    being opened.
  - The **Yellow Monastery** is the Qiblai kit's 52 m great monastery in the **gold dress** (`qb_monastery`, `o.v 2`),
    kept whole. Its gate faces south through the Gate of the Lamp, up the stair to the lamp. The gilt crown is on its
    Assembly Hall.
  - Round it: the kora, the novices' court, the Lamp School, the Hall of Lights (the Register of the order's lights), the
    Butter Lamp House, the kitchen, refectory, granary, infirmary and guest house.
- **Outside**: the carters' yard, the byres and dairy (milk is a sacrament), the hives (honey is the other), about
  **12.7 ha of terraces** on the saddle's flanks and the rising ground north, the tea garden, the threshing floor and the
  saddle tank.

**The rules the layout keeps** (`src/31-bc-rules.js`; `node settlements/beacon/test-beacon.js` gives 35 checks, every
rule with a negative):
- unique ids;
- every part in its zone;
- no overlaps, with the fort's towers counted;
- no building in a wall;
- Gyantse's walls join the fort's corner towers to the precinct's corners;
- every gate on its wall;
- **the fort is reached without passing the cloister, and the cloister without passing the fort**;
- the hosted monastery 4 m clear of its wall;
- **the cable runs from the engines to the plinth, into the fort only through its gate**;
- **the lamp sees every place the order must reach by 10 m or more**;
- **the lamp's year fits the tune's oil**;
- gold only on the gate pavilion, the chapel and the holy crown;
- **everyone has a bed**: the census sleeps where the parts say, 300 for the order and 150 for the fort.

## 4. The lamp and the generator (*proposed*, but the owner's words)

**The lamp head** is a new Ancients piece (`kits/ancients`, `anc_beacon_lamp` in the manifest):
- a fat white-metal drum 1.6 m across and 2.2 m long;
- a glazed face 1.4 m across, cooling fins, and a slewing yoke on a ring 2.6 m across;
- the kind an Ancient hull or tower carried. "Refurbished" (the owner): Xanadui iron straps, a new cable gland, and
  brass shutters before the glass for the signal book.

The Xanadu kit's plinth and mount carry it. It draws its beam with the lighthouse's `lhBeamGeo` (crossed additive quads,
widening, readable from any bearing) and joins `LH_BEACONS` for its sweep.

**How it is served** (the owner's fork: every night, with the signal book):
- **Dusk to dawn, all year.** The beam sweeps the southern arc (bearings 100-260°) once a minute.
- **The signal book.** On the hour the sweep stops on a bearing and the shutters flash the book's messages to that
  bearing's station: G1 (149°), the Tempest (157°), the Tears' camp (181°), the south watch fort (258°).
  - *Proposed:* the code is **the sound grid of the syllabary**. Each syllable is a row of flashes, a pause, then a column
    of flashes, as a tap code reads a square. Signals are holy writing in light, read by any monk who reads the grid.
  - The alarm is a fixed beam held on the threat's bearing, with the shutters beating fast.
- **The holy hours.** When the Station (the Broken Wheel, `LORE.md` 6.13) crosses overhead, the beam is raised to it
  and held: a light for the Wheel. On those nights the Lamp Watch sings the Song in the chapel below.
- **Dark only** when the engines are down, or in the `damaged` state (5.7 of Strongwall's plan).

**The power** (the tune's numbers):
- `T.oil.kgYr` 400,000 × the licence 0.2 × `T.lit['march.e']` 0.02 = **1,600 kg of oil a year**.
- At `T.chain.dynamo`'s 3 kWh a kg, that is **4,800 kWh**.
- *Proposed:* the lamp draws **1.0 kW** through a 12-hour night: **4,380 kWh a year**. The rest runs the switch room and
  the workshop.
- The rule fails at 1.2 kW, so the lamp can be no brighter on the tune's oil.

**The generator and the oil:**
- **Two engine sets** of the Geomancers' make on Ancient engines (the tune's dynamo is "the Geomancers' make, on an
  Ancient engine"), one running and one spare. They stand in the **Generator House** in the order's lamp ward, not in
  the fort.
- **The cable** runs in a stone channel under the fort's gate passage to the plinth's switch room. This changes the
  fort asset's 5.7, which put the generator house against the fort's curtain (step B6).
- **The Oil Pit** is a walled, sunken tank of 3 m³, about 2,500 kg: a year and a half of the fiftieth.
- **Carts** come from the oil field (925,1598; about 240 km by road) twice a year, by the fort road to the Ward Gate.

**Who keeps it:**
- the **Master of the Lamp** (of the chapter);
- the **Lamp Watch**: three keepers a night in the plinth, on rota from the chapter;
- the **Keepers' Workshop** (the lens bench, the engines' spares);
- the **Lamp School**, which trains keepers for the order's other lights. The owner: "may keep other beacon lights as
  well". *Proposed:* any Ancient lamp the Sultanate refurbishes goes to the order. A keeper's lamp burns in the Hall of
  Lights for each one, and the **Book of Lights** names them.

**The states** (Strongwall's plan 5.6-5.7): in `damaged` the lamp stands dark, the cable cut at the gate. In `ruined` the
lamp head lies on the plinth's talus, seated by its extents (`core/ruins`). The monastery below is not the fort asset's,
and keeps its state from its own plan.

## 5. The economy against the tune (B4, done 2026-11-16 in `core/region/data/xan-tune.js`)

| What | In the tune | Why |
|---|---|---|
| **The order's house** (**done**) | **`T.beacon`** and the settlement **`xan.beacon`**, "The Order of the Beacon's head house (the Yellow Monastery, below the beacon fort over the Rift)", 300, the Xanadu polity, parent the capital. It stands **at `march.e`'s px, whatever that is** (`T.beacon.fort`), so it follows the fort when the site is settled. The fort diet less arms and powder; keepDays 30 | the owner's ~300; the monks take no arms or powder |
| **Its terraces** (**done**) | `bc.terraces`, harvest season, two fifths of its grain: about **22 t** a year (0.4 of 300 × 180 kg) | the T0 sheet's 12.7 ha at about 1.8 t/ha |
| **Its road** (**done**) | `road.er-beacon` from Erehwon, timed like `road.march.e`: grain, salt, tea and tools; no arms | the capital feeds the Marches (P8) |
| **The test** (**done**) | `test-xan-economy.js` check 31: the house beside the fort, its terraces' grain made, the capital's road landed, no arms or powder eaten, the fort's lamp lit; its negative moves the house 5 km off the fort. 67 passed (and `test-east-rift.js` 13 passed) | |
| **`march.e`** | 150, the fort diet, 10 musketeers, `state:'kept'`. **Its px is the open question** (section 1): the tune moved it with Erehwon to 881,1541, where a lamp sees nothing. The answer moves it, and `xan.beacon` with it | the owner's site fork, re-asked |
| **The lamp's oil** | **unchanged**: `T.lit['march.e']` 0.02 stays on the fort. The Sultan's licence pays for the light, and the order's hands keep it | the tune's power check stays as it is; 4,800 kWh covers the lamp (section 4) |
| **Milk and honey** | not in the tune (no dairy good). The byres and hives are drawn; a `milk` good is for the tune's owner to weigh | the sacraments (`kits/qiblai/PLAN.md` 2a) |
| **The daughter house** | no change: Qiblai's clergy stay in bulk. *Later:* an offerings transfer from Qiblai's gold house to the head house, as the Fifth is a transfer | |

**Water** (no river; section 1.2):
- The house's roofs are about 11,000 m², at ~990 mm and a runoff of 0.8. That gives some **8,800 m³ a year**.
- Need: 450 people at 25 litres a day is about 4,100 m³ a year.
- The great cistern under the gate court, the garden's cistern and the fort's hold the dry season. The saddle tank serves
  the herd and the terraces.

**Raids** (`PROPOSAL-LIZARDMEN.md` Z4):
- Tuatara is 75 km away, and the south watch fort (17 km from Tuatara) is the raids' first mark.
- At 1.44 atm and 17 °C the shoulder is at the edge of Lizard air. A raid that reaches it has climbed 2,500 m out of the
  floor.
- The lamp's part in a raid is **warning**: the fixed beam on the raid's bearing, read at the south watch fort, the
  Tempest and G1. The Violet Storm's riders and the Sultan's forts answer.
- A raid's outcome sets the fort's `state` (Strongwall's plan, W1).

## 6. Core adoption (write in full before the first fragment)

| Need | Take | Notes |
|---|---|---|
| The ground at 1:1 | `core/world` (`WORLD.H`, `ROADS`), the region cut by `tools/scale-model/cut_site.py` | which region holds it is the open-world session's call. The layout's frame maps by `BEACON.toPx` |
| The knoll, the saddle, the scarp | `core/terrain` (carve patches for the knoll's faces; `KRUBBLE` for the ruined states) | the layout's `ground` is an assumption until the region is cut |
| Cisterns, the tank | `core/water` (still water) | |
| Sky, light, the beam at night | `core/atmos`; the beam on `kits/ancients`' `lhBeamGeo` | |
| Randomness | `core/rand` (`KRAND`) | the layout itself draws nothing at random |
| Records, names | `core/tags` | `beacon` and `lamp` in the vocabulary if missing |
| Overlap | `core/space` (`KSPACE`) when the layout is placed | the layout's own rule checks boxes |
| The fort | the fort asset (`kits/xanadu` `XFORT`, `size:'watch'`, `beacon:'ancient'`) | the generator moves to the lamp ward (B6) |
| The monastery | `kits/qiblai` `qb_monastery` (`o.v 2`), read in place | the building is a host's, not this plan's |
| Walls, the Labrang, the precinct's ranges | the Xanadu kit's helpers (`xnWall`, `xnStack`, `qnStack`) and Qiblai's houses, read in place | **not `core/city`**: a monastery precinct is one building's plan, as Strongwall's fort is |
| Doors, walks, interiors | `core/door`, `core/walk` (the fort's walk and Gyantse's walks are one), `kits/interiors` (`sets/xanadu.js`), furnished from `kits/catalog` through `core/furnish` | the manifest's NEW pieces first |
| Ruins | `core/ruins` (`KRUINS.watch`) on the fort in its damaged and ruined states | |
| Surfaces | the Xanadu and Qiblai packs; the lamp head in the Ancients' | no new texture proposed |
| People and time | `core/charactermodels`, `core/simulation`, `core/sched` (the Lamp Watch's rota, the hours, the Station's passes) | |
| The economy | `core/region` (`XAN_TUNE`) | section 5 |

## 7. Steps

| Step | What | Who | Test |
|---|---|---|---|
| **B0** (asked 2026-11-16; **on hold**) | The pin, through the scale-model session's queue (`local_bf163a02`). It was asked at 853,1540; that knoll is gone on the re-run model (section 1), so the request is held until the owner re-picks the site | the scale-model session | the pin's ground; the lamp's sights re-run on the edited model |
| **B1** (**done** 2026-11-16) | This plan, the owner's forks answered | | |
| **B2** (**done** 2026-11-16) | The blueprint: `BLUEPRINT.md`, eight sheets and a section, `FURNITURE.md` (`beacon_blueprint.py` on the shared generator) | | the sheets drawn from the layout; the layout's checks must pass first |
| **B3** (**done** 2026-11-16) | The layout as data: `src/30-bc-layout.js`, `src/31-bc-rules.js`, `layout_dump.js` | | `node settlements/beacon/test-beacon.js` (35 checks, 17 negatives) |
| **B4** (**done** 2026-11-16, section 5) | The tune: `T.beacon` and `xan.beacon` (300) at the beacon fort, its terraces and its road from the capital. `march.e`'s px waits on the site | | `test-xan-economy.js` check 31 and its negative |
| **B5** | The lamp head, `anc_beacon_lamp`, on the lighthouse beam | `kits/ancients`' owner | the Ancients kit's verify |
| **B6** | The fort asset's `beacon:'ancient'`: the plinth in the keep's place, the gilt chapel on it, the cable channel through the gate; the generator house **outside** the fort, in the order's ward (this plan's change to Strongwall's 5.7) | `kits/xanadu`'s owner (80f, 80g) | `test-fort.js`; the Xanadu verify |
| **B7** | The house on the open world: the layout's frame on the region's ground at 1:1, the knoll and the saddle fitted, the lamp's sights asserted on the drawn ground | the open-world session | the region's verify; a line-of-sight assert to G1, the Tempest, Tuatara and the south watch fort |
| **B8** | Interiors from the blueprint: the Labrang, the plinth, the precinct's ranges; the NEW pieces in the catalog | the interiors owner | the walk and interiors audits |
| **B9** | Life: the Lamp Watch's rota, the hours, the sweep and the signal book on the sim's clock, the oil carts, the Station's passes | | `core/sched` matches section 4 |

## 8. Questions for the owner

1. ~~**The site.**~~ **Answered 2026-11-16: the east shoulder (853,1540).** **Re-asked:** the edit 7 re-run took the
   knoll away (section 1). A, the west brow (839,1539), is recommended; B and C are the low spur and the scarp foot.
2. ~~**The head house.**~~ **Answered 2026-11-16: about 300, the gold Prismarch here; Qiblai's gold house the
   daughter.**
3. ~~**The garrison.**~~ **Answered 2026-11-16: the Sultan's fort above, the monastery below (Gyantse).**
4. ~~**The lamp.**~~ **Answered 2026-11-16: every night, the signal book, raised to the Station.**
5. **The signal code.** Is the signal book written in the sound grid, so that a signal is holy writing in light
   (*proposed*), or in a plain code of the Sultan's?
6. **The order's other lights.** Which lights does it keep now? Candidates:
   - a lamp for Strongbow's gate;
   - the House of the Tempest's beacon on its utse;
   - Ancient lamps found later.

   Or is this lamp the only one until more are found?
7. **The gold banner on the Rainbow Temple.** It turns toward its monastery (LORE 6.13). Does it now turn toward the
   lamp, 176 km away and out of sight, or toward the daughter house on the inner square?
8. **A Xanadui name** for the house, as the Marches have *Mārchiz*?
