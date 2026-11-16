# Strongwall, the Master of Mines' fort in the Gold March, and the Xanadui fort asset (proposal, 2026-11-16)

The owner, 2026-11-16: *"spin off agents to make site plans for Pher, Thalaba, Kirstabal, and Strongwall. we may need to
build a Xanadui fort asset as well"*.

This is a plan, not a build: no kit code and no pages. Everything not quoted from the owner, the lore or the sim tune is
*proposed*. The fort asset (section 5) is a specification. Its code goes to a later step, owned by whoever owns
`kits/xanadu` then (section 7).

Sources:
- `LORE.md` 6.13: the Sultanate, its gold, its look, the Lizardmen who "find the highland air too thin and chilly", the
  Sultan's empty ledgers.
- `core/simulation/PROPOSAL-XANADU.md` sections 2-7 and `core/region/data/xan-tune.js`: the province, the assay, the
  Fifth, the Golden Tears, the Marches' forts. The test is `core/region/tests/test-xan-economy.js` (44 passed on this
  branch, 2026-11-16).
- `core/simulation/PROPOSAL-LIZARDMEN.md` and `LIZARDMEN-SURVEY.md`: Komodo and the planned raids (Z4).
- `kits/resources/data/lodes.json` (`lode:xanadu-gold`) and `kits/resources/data/geology.json` (decoded: the copper,
  iron, gold, silver, saltpeter and wood layers).
- `kits/xanadu/src/80-xa-military.js`, `78-xa-palace.js`, `77-xa-sacred.js`; `kits/qiblai/src/89q4-qb-temple.js`; the
  scrap-Xanadu set, `kits/xanadu/PLAN-SCRAP.md` on `claude/scrap-xanadu` (c07e36ef4, not merged).
- `openworld/PLAN-SETTLEMENTS.md`: edit `5.1e8` moved the pin from 914,1634 to 912,1640.
- The scale model 5.1 (`tools/scale-model/model/data`), 2 km a pixel:
  - `h.png`: height = (R*256+G)/65535*29600-2600 m, and B>127 is water;
  - `tm.png`: mean °C + 90;
  - `p.png`: rain = byte/255*4000 mm;
  - `c.png`: the climate class (`climate.json`);
  - `rivers.json`.

## 1. The site

**Pin `sxan7r1sln`, px 912,1640.** It stands on the Gold March's bench, at the foot of the great scarp up to the gold
plateau, at the mouth of the gorge of **Kruk Gill**.

| | |
|---|---|
| Ground | **755 m** on the bench's back edge. The steepest step to a neighbour cell is 155 m a km (8.8°), and that is up the scarp, so the fort's ground at 1:1 is a fan of gravel sloping north off the gorge mouth |
| Climate | mean **18 °C**, **880 mm** of rain, `Cfb`. The bench below it is 19 °C at 430-550 m. The lowland valley 20 km west is 23 °C and `Cfa` |
| Air | about **1.45 atm**. *Estimated* from the pins with stated air: -351 m is 1.67 atm and 1,330-1,460 m is 1.35 atm, which gives a scale height of about 8.2 km |
| Kruk Gill | `r604`: a **seasonal wadi** (68 km, 6 m³/s at its mouth; old name "the Rift wadi 6"; Tungang: *crook-bend wadi*). It rises at **5,437 m** at 903,1670, in the heart of the gold field. It falls north across the plateau and comes down the scarp in a gorge: 3,300 m at 905,1648, 2,544 m at 907,1646, 1,301 m at 909,1644 and 739 m at 911,1642. It leaves the gorge **at the pin** (912.8,1639.9) and dies on the bench 7 km north-east (914.8,1637.9). **The gorge is the road to the gold**, and the wadi's gravels carry the field's placer gold |
| The scarp | South of the pin it climbs **2,700 m in 16 km** (about 10°): 1,072 m at y 1642, 2,030 m at 1644, 2,910 m at 1646, 3,468 m at 1648. Above it the plateau rises gently to the mines |
| The gold mines | `smgxtultfq`, px 911,1665, **50 km south and 4,812 m up**. Mean **-6 °C**, 300 mm, `ET` tundra, about 0.9 atm (*estimated*). The mines sit in a bowl that sees only about 10 km round it (below) |
| The lode | `lode:xanadu-gold`, 911,1665, r 16 km, peak byte 225. The gold layer is 140 across the plateau from y 1646, and 191-221 in the lode's heart at 904-912, 1662-1668 |
| Copper | the province's **rich copper band** (byte 240, with iron at 210 and marble at 63: a skarn contact) on the scarp face **4-12 km west** (896-908, 1642, at 2,000-3,200 m) and **15 km south-east** (920-928, 1646, at 2,500-2,800 m). This is the "flat ground 6 km from the rich copper band" of edit `5.1e8` |
| Wood | the bench is wooded (the wood layer 180-255). Wood thins on the scarp and is gone above about 3,500 m (y 1652 on) |
| Saltpeter | rises southward across the plateau: 0-45 at the scarp's top, 100-133 by the mines (Gemini's 70 t in P4) |

**The ground within 15 km** (177 cells):
- The lowest cell is -505 m, in the trench below. The highest is 3,263 m, on the scarp.
- **North and east:** the bench, at 400-780 m, about 30 km wide. It falls north toward Qiblai: 465 m at 8 km, then
  steadily down to -1,860 m at Qiblai, 92 km away.
- **West:** a lowland valley at -250 to +80 m, 12-16 km away (900-905, 1630-1635). It opens toward the Rift.
- **South:** the scarp.
- **No open water and no perennial river.** Kruk Gill runs only in the wet season, so the fort needs a cistern and wells
  in the fan's gravels.

**Two features of the model need an answer before the site is cut** (question 3):
- **The trench.** Row 1641, x 913-922, is a slot 2 km wide and up to 1 km deep, cut along the scarp's foot: 316 m at
  913, -8 m at 916, -356 m at 918, -347 m at 920. Row 1642 below it is -88 m at 918-920. It runs straight along one
  row of pixels, so it reads like an artefact of the river carve. It could also be read as a fault trough at the
  scarp's foot. **The Golden Tears' house pin (913,1641) is on its lip, at 316 m.**
- **The pit.** 913-915, 1633-1635 falls to -351 m (the old pin's cell, already owed as a model fix in
  `openworld/PLAN-SETTLEMENTS.md`). It sits on the road north to Qiblai, which dips to -23 m 12 km out.

**Lines of sight.** These are computed on the 2 km grid: bilinear ground, a 25 m tower at the observer, a 10 m mark at
the target, and Earth's curve with refraction (k 0.13). They show where to look; the 1:1 site decides.

| From | Sees | Does not see |
|---|---|---|
| **The pin** (755 m) | its own bench and Kruk Gill's mouth. Westward, nothing past 10-14 km; north, the bench and its falls to 138 km | the gold mines (blocked by the scarp, 1,400 m short), Komodo, the Golden Tears' camp, Qiblai, the Marches' forts |
| **The Spur** (908,1643, 2,416 m, 9 km up the Kruk Gill road, `Csb`, 8 °C) | **the pin** (+32 m clear), **Qiblai** (+24 m, about 100 km), **the beacon fort over the Rift** (+8 m, about 240 km); north and north-west to 160-230 km | the mines, Komodo, the Tears' camp |
| **The brow** (910,1648, 3,488 m, the plateau's edge) | Qiblai, the beacon fort (+26 and +32 m) | the pin (-166 m), the mines (-341 m) |
| **The mines** (4,812 m) | the rim of their own bowl, within about 10 km (902-916, 1658-1666) | everything above. No cell on the 2 km grid sees both the mines and the Spur, the brow or the pin |

**Toward the Rift and Komodo** (`spnqhezhiw`, 865,1617, -2,452 m, 35 °C, about 2.2 atm, 105 km west-south-west): the
ground falls steadily to the Rift floor. The slope is convex: 717 m at 6 km, 338 m at 24 km, -605 m at 54 km, -1,465 m
at 84 km. **No point in reach sees Komodo or the Golden Tears' camp** (850,1628, -1,210 m, 126 km, beyond a 2,639 m
ridge 42 km out). Warning of a raid has to come from posts down the slope (section 3, "The watch line"), not from the
fort's towers.

**What the site is, then** (*proposed*). Strongwall is the **gate of the gold**. The only road from the plateau's mines
down to the Sultanate comes down Kruk Gill's gorge. The fort closes the gorge's mouth. Everything the mines make passes
under its wall, and the Lizardmen's way up from the Rift ends against it. At 755 m it stands where the air thins and
cools from the Rift's 2.2 atm and 35 °C toward the plateau's 0.9 atm and -6 °C. The lore's Lizardmen dislike that change,
so Strongwall is about as high as a raid comes. The gold above it is out of their reach.

## 2. Who lives there

The tune gives Strongwall **250 people** (`town('sxan7r1sln', ..., 250, 'fort', ...)`) and the Golden Tears' house
beside it **80** (`tears.strongwall`). The split below is *proposed*.

| Who | People | Where |
|---|---|---|
| **The garrison of the Gold March**: archers and spearmen under a commander, the gorge wall's watch, the escort of the ore trains and of the Fifth | ~140 | the barracks ranges on the inner and outer wards, the gate, the Spur's beacon post (a rota of 6) |
| **The assay house**: the assayers, refiners and furnace men, the Sultan's weigher and his sealers | 20 (the tune's crew) | the assay court in the inner ward |
| **The Master of Mines' household and office**: his deputy (the Warden of the March, question 2), clerks of the ore tally and the Fifth, servants | ~30 | the keep |
| **The fort's trades**: smiths and armourers (the arms bought from Iziz and Yuni are kept and mended here), a farrier, cooks, a baker, a cooper | ~25 | the outer ward |
| **The caravan yard**: drovers, porters, ostlers for the ore trains and the Qiblai road | ~25 | the outer ward and its stables |
| **The wheel house**: a small shrine of the Decree with three or four monks, the garrison's prayer wheel | ~5 | beside the gate inside the inner ward |
| **Wives, children and elders** of the married men | (inside the numbers above) | the outer ward's houses |
| **The Golden Tears** (the owner, 2026-11-16: "a bit more militaristic, running expeditions into Lizard country to seek out unclaimed gold lodes") | 80 | **their own walled compound outside the fort**, on the bench by the Qiblai road: factors, the house's guards, ore handlers, its depot for the Rift camp. *Proposed:* their camp of 120 (`exp.rift-gold`) works the Rift floor in the cool months and comes home in the hot ones, so the compound swells to ~200 in summer |

Outside the walls is the province's countryside: P4's 10,000 people in the tune (`prov.p4`, in bulk). There are bench
villages, the copper diggings on the band, and placer camps on Kruk Gill's gravels (PROPOSAL-XANADU's "2 placer camps").
They are left to a hamlet pass (`core/hamlet`) once the fort is placed.

## 3. The layout (*proposed*)

The fort is a dzong of the Gold March: a closed, battered, whitewashed enclosure on the gravel fan, set across the
gorge's mouth so the road and the wadi both pass under it. North is downhill and the approach; south is the gorge.

- **The gorge wall** (the name's *proposed* reading, question 1).
  - A curtain about 9 m high runs from the scarp's rock on the west to the rock on the east, across the gorge's mouth
    (roughly 200-400 m at 1:1; the 2 km grid cannot show it).
  - **The Gold Gate** is in it: the road up to the mines, its leaves shut at night.
  - **The water gate** stands beside it: three tall arched sluices with iron grilles, so Kruk Gill's floods pass
    without bringing the wall down.
  - Above the wall, two towers stand on the rock, one on each side of the gorge.
- **The inner ward** (about 110 by 80 m), on the fan just north of the gorge wall and joined to it:
  - **the keep** (the *utse*: the Master's hall, the office of the ore tally, the clerks, the strongroom under it);
  - **the assay court** (the assay house's furnaces and the weighing hall);
  - the garrison's barracks range along the east curtain;
  - **the magazine**, set apart in the south-west corner against the rock;
  - the cistern under the court;
  - the wheel house by the inner gate.
- **The outer ward** (about 140 by 70 m), north of the inner ward, holds:
  - the caravan yard and the **ore yard**, where the trains coming down from the mines are counted before the ore goes
    into the assay court;
  - the stables;
  - the granary;
  - the smithy and armoury;
  - the married quarters;
  - the muster ground (`xa_muster`).
  - **The Qiblai Gate** in its north curtain takes the road down the bench to Qiblai (83 km) and on to Erehwon (404 km).
- **The Golden Tears' compound** stands outside the Qiblai Gate, 2-3 km out on the bench, under the fort's eye but not
  inside its walls. It is a walled merchant's konak with its own square tower, an ore shed, the camp's stores and a
  caravan yard. Its pin moves out of the trench (W0).
- **The watch line** (the lines of sight in section 1):
  - **The Spur beacon** (908,1643, 2,416 m) stands on the Kruk Gill road 9 km up. It is the one point in reach that
    sees both the fort and the far north and north-west.
  - **Posts down the west slope** toward the Rift: two or three small towers on the convex ground, sited at 1:1,
    which see the Rift's rising roads and the fort's or each other's fires.
  - **A chain of at least three posts** across the plateau up to the mines' bowl: no single relay on the 2 km grid
    joins them.
  - The Spur's sightline to the beacon fort over the Rift (240 km) is clear but far beyond a fire's reach. The line to
    the Marches needs posts between, which belong with the Marches' own plans.
- **The bench below**: the copper diggings on the scarp face to the west, the placer camps on Kruk Gill's lower
  gravels, the hamlets. The road up to the mines follows the wadi through the gorge.

## 4. The economy (tied to `XAN_TUNE`)

What the tune already does, from `test-xan-economy.js` on this branch:

| Flow | The tune | The year's figure |
|---|---|---|
| Gold ore in from the mines | `mine.gold`: 50 km, all the ore (`T.mine.goldore` 6,400 kg a year, a field of 85 veins, 212 years) | **8.3 t of ore** landed in all |
| Gold ore in from the Golden Tears | `tears.rift` lands at their house; its `cut` sells all the ore to the Sultan's assay | about 2.1 t of ore (70 kg of gold a year at 30 kg of ore a kg) |
| **The assay** | `sw.assay`: 20 crew, 30 kg of ore to 1 kg of gold in 20 hours (`T.chain.assay`) | **277 kg of gold** |
| **The Sultan's Fifth** | `fifth`: a 0.2 share of the gold to `xan.citadel`, 404 km | about **55 kg a year** |
| The rest of the gold | `road.sw-er` to Erehwon (404 km) and `road.qb-sw` to Qiblai (83 km) | 275 kg exported |
| Copper | P4's countryside's copper (240 t a year, the band's lode) passes through | 203 t in, mostly on to Qiblai and Erehwon |
| Opal | `mine.opal`: Opal Valley Mines' opal less its Fifth, 260 km | 136 kg in. The Light Wall's plan has now made Lāiṭwāl P6's seat (answered 2026-11-16), so this road may move there (`settlements/lightwall/PLAN.md` step L1; question 10) |
| Food | grain, salt, tea and tools up from Qiblai (`road.qb-sw`) and on to the mines (`road.sw-gold`) | 231 t of grain in. The fort eats about 45 t; the rest feeds the mines' 950 |

What the plan adds to the tune is *proposed*, for whoever owns the tune, in step W1:
- **The fort as a store.** The fort's `keepDays` sizes its granary. It holds a season of the mines' grain as well as its
  own: about 60 t, a granary of about 100 m³. That is why the granary is a building of the outer ward, not a shed.
- **The Fifth caravan as an event.** Gold is light: a year's 277 kg is about 14 litres, and a season's Fifth fits in two
  chests. *Proposed:* the Fifth goes down twice a year under escort. The strongroom is a vault for the seals, the
  scales and the ingots, not a warehouse.
- **The Golden Tears' season.** The camp's return in the hot months could be a schedule on `exp.rift-gold` (its
  `keepDays` and a home window). This only matters for the compound's size.
- **Raids** are the Lizardmen plan's Z4 (`core/camp`'s ventures). Their targets near Strongwall are the Golden Tears'
  camp (37 km from Komodo), the ore trains on the gorge road, and the bench villages. The fort's **state** (section 5.5)
  is the record a raid's outcome would set. The sim never draws it.

## 5. The fort asset (the Xanadui fort)

### 5.1 What exists (checked 2026-11-16)

| Where | Pieces | What they give | What they lack for a fort |
|---|---|---|---|
| `kits/xanadu/src/80-xa-military.js` | `xa_wall` (a 24 m run: v0 dressed curtain, v1 with a drum tower, v2 rammed earth), `xa_gate` (an iwan gate between two towers: v1 square with gilt roofs, v2 round with tiled domes), **`xa_fortress`** (a dzong on a rubble rock: a 42 by 34 m curtain, four corner towers, the white keep with the red sanctum and a gilt roof, a 20-26 m utse tower, a bailey with stables), `xa_barracks`, `xa_watch` (a watch house with a lantern tower), `xa_muster` | the look: battered dressed stone, pointed merlons, the iwan gate, the dzong keep, the corner drums | **one fixed size and shape.** `xa_fortress` is 62 by 64 m, always on its own rock, with no beacon, magazine, cistern, assay or strongroom. Curtains do not follow ground or take an outline. There are no ruin states |
| `kits/xanadu/src/78-xa-palace.js`, `77-xa-sacred.js`, `72-xa-helpers.js` | `xnXECurtain(a,b,h,c,side)`, `xnXETower`, `xnXDSanctum`, `xnCrenel`, `xnIwan`, `xnGiltRoof`, `xnStack`, `xnWall` (the battered mass), `xnSub` | the helpers the fort is drawn with | |
| `kits/qiblai/src/89q4-qb-temple.js` | `qb_wall` (any length via `o.len`), `qb_wall_corner`, `qb_wall_gate` (gilt crown, wheel and deer) | the crisp-cube walls of the holy city, a run of any length | Qiblai's look. The gate's gilt crown is the holy city's, not a fort's |
| `claude/scrap-xanadu` (not merged) | `xa_scrap_gate` (Garrison Gate: battered towers faced in panel courses, a girder gate, bronze crowns, a barracks behind), `xa_scrap_tower` (Glass-Crowned Tower: a verdigris watch and signal tower) | a scrap dress for a garrison gate and a signal tower | the scrap towns' dress only |
| `settlements/xanadu/citadel` | the palace gate (`xa_palace_gate`) and the citadel's blueprint | the court's gate | a palace, not a fort |

**So the asset is new, but drawn on the old pieces.** It is a **parametric fort**: an outline, a size and a dress go in;
the pieces come out as records. `xa_fortress` stays as it is, the one fixed dzong for Erewhon's sheet. Nothing in the
kit is rewritten; the new defs call the helpers.

### 5.2 The record

In the Xanadu kit a building is an `XA.def` (the kit's form of `defBuilding`: `VERN.def` with `culture:'xanadu'`). The
fort is one def that composes its pieces with `xnSub`, plus one def per piece so a world can place a gate works or a
lone tower. *Proposed* keys:

```js
XA.def({key:'xa_fort', name:'Fort', family:'Forts', tags:XTAG_MIL(['civic']), w, d, h, fw, fd, nv:3, build:buildXaFort});
// o: {size:'watch'|'march'|'gate', dress:'march'|'royal'|'earth'|'scrap', state:'kept'|'damaged'|'ruined',
//     outline:[[x,z],...] (optional; else the size's rectangle), gate:[edge, t] (which side, where along it),
//     drop (the footing, as every XA def), seed}
```

The plan of a fort is **data before drawing**, as the Pleasure Dome's is (`XPDOME`, `78c-xa-dome-plan.js`). A `[G data]`
fragment holds `XFORT.plan(o)`. It turns the options into records in the def's frame:

```js
{curtains:[{a:[x,z], b:[x,z], h, t, walk:true, loops:n}],
 towers:[{at:[x,z], kind:'corner'|'interval'|'gate'|'rock', form:'square'|'drum', h, w}],
 gates:[{at, ry, kind:'iwan'|'bent'|'water', leaves:2}],
 buildings:[{key:'xa_fort_keep'|'xa_fort_barracks'|..., at, ry, w, d}],
 walks:[...],   /* the wall walks and stairs, for core/walk */
 garrison, stores:{grain_t, arms}}
```

The plan has rules, written as plain functions on the records so Godot and the sim can read them, and node-tested:
- a tower at every corner of the outline, and at most every 40 m (watch) or 30 m (march) along a curtain;
- the gate on the approach edge, never in a corner;
- every curtain's walk is joined to a stair;
- nothing overlaps (through `core/space`);
- the keep stands clear of the curtain by at least 6 m.

The drawing fragment draws only what the plan says.

### 5.3 The pieces

| Key | What | Watch fort | Strongwall |
|---|---|---|---|
| `xa_fort_curtain` | A run of any length. It sits on a battered talus of rubble with a dressed (or rammed-earth) wall above, battered 1 in 8 (the Tibetan lean). A whitewash band above with the maroon twig band (*pembé*) under the parapet, then pointed Persian merlons over a walk with loopholes. *Rajput* bretèches (corbelled stone boxes) over the gate and at the corners. It follows the ground in steps of at most 1.5 m and never floats | 6 m high, 2.4 m thick, walk 1.6 m | 9 m, 3.5 m, walk 2.4 m; the gorge wall 10 m |
| `xa_fort_tower` | Square and battered (the dzong's) or a drum (the Persian and Turkish one, `xnXETower`'s). A flat roof with merlons, slit windows in the Tibetan trapezoid frame. The corner towers are a storey higher than the curtain | 4 square, 9 m | 6-8 drums of 11 m on the wards; the 2 rock towers over the gorge are square, 14 m |
| `xa_fort_gate` | The iwan gate between two towers (`xa_gate`'s). Over the arch is the Sultan's roundel, the eight-spoked wheel. Two leaves of timber and iron, studded with spikes against rams and beasts. The **bent entrance** (the Indian forts' angled approach, so no charge reaches the leaves straight) is optional. Murder holes in the passage vault | 1 gate, straight | the Qiblai Gate bent through a barbican; the Gold Gate straight under the gorge wall; the inner gate |
| `xa_fort_water` | The water gate: two to four tall arched sluices through a curtain, iron grilles, cutwaters | — | the gorge wall's (Kruk Gill) |
| `xa_fort_keep` | The *utse*: a white battered tower of three to five storeys. The red band and red sanctum on top with its chapel (*lhakhang*) and a prayer wheel. The only gold is the chapel's gilt finial (question 6). A ground-floor hall | 12 by 12 m, 18 m, the commander's room and the chapel | 24 by 18 m, 30 m; the Master's hall, the tally office, the clerks; **the strongroom under it** |
| `xa_fort_barracks` | A two-storey range against the curtain: a colonnade on the ward side (`xa_barracks`'s painted columns and corbelled eave), sleeping halls above, messes below | 1 range, 120 men | 2-3 ranges, ~140 men, the married quarters in the outer ward |
| `xa_fort_magazine` | A low vaulted store, apart from the rest, against the curtain or rock. Thick walls, a single iron door, blind but for vents. It keeps the arrows, spears, the bought steel and (question 5) powder | 1 small | 1, in the inner ward's south-west corner |
| `xa_fort_beacon` | A beacon: a stone fire basket on the keep's roof (watch fort), or a **beacon post** of its own: a small square tower with the basket, a fuel store and a hut for its rota. Smoke by day, fire by night. *Proposed:* a signal mirror, which the Geomancers would trade | on the keep | the keep's roof, the **Spur beacon** and the posts of the watch line (section 3) as separate placements of the post |
| `xa_fort_cistern` | A cistern under the court, with a well head and its cover | 1 | 1, plus wells in the fan's gravels |
| `xa_fort_granary` | `xa_granary`'s stone store on a plinth, sized by the plan's `stores.grain_t` | small | about 60 t |
| `xa_fort_stables` | The stable range: stalls along a curtain, a hay loft, a trough (the mounts: question 8) | 1 | 1, with the caravan yard |
| **`xa_fort_assay`** (**Strongwall only**) | **The assay court**, which has four parts. **The furnace hall**: cupellation hearths, crucible furnaces, bone-ash and charcoal bins, a tall chimney. **The weighing hall**: the Sultan's scales on a stone table, the seal press, the tally boards. **The strongroom**: a blind-walled vault under the keep, reached only from the hall, with an iron door, the ingots and the Fifth's chests (as Qiblai's treasury: "the faith's gold behind blank wall"). **The ore shed**: the trains unload at the ore yard and the ore comes through a single gate | — | in the inner ward against the keep |

### 5.4 The sizes

| | Watch fort (`size:'watch'`) | Strongwall (`size:'march'`) | Gate works (`size:'gate'`) |
|---|---|---|---|
| For | the three forts of the Marches (`march.w` 783,1530, `march.s` 812,1548, `march.e` 846,1540, 150 each); later posts on the Lizardmen's frontier | Strongwall; any later seat of a march | Kirstabal's and Strongbow's gates (their plans decide); a town's gate on a road |
| Enclosure | one ward about **60 by 45 m** | an inner ward about **110 by 80 m**, an outer ward about **140 by 70 m**, and the gorge wall | **no enclosure**: a gate, two towers and curtain stubs to the town's own wall or rock |
| Towers | 4 corner towers | 6-8 drums, 2 square rock towers, 2 gate towers each gate | 2 |
| Gates | 1 | 3 (the Gold Gate, the Qiblai Gate, the inner gate) + the water gate | 1 (or a water gate) |
| Keep | 12 by 12 m, 18 m | 24 by 18 m, 30 m | — (a guardroom over the gate) |
| Garrison | ~120 + 30 others | ~140 + 110 others | from the town |
| Beacon | on the keep | on the keep + the Spur beacon + the watch line | optional, on a gate tower |
| Footprint | about 70 by 55 m with its towers | about 160 by 200 m with the gorge wall | about 40 by 20 m |

The outline is a rectangle by default. A world may pass an outline (a spur's crest, a gorge's mouth) and the plan
fits the towers and walks to it.

### 5.5 The dresses

| Dress | Where | What changes |
|---|---|---|
| **`march`** (the default) | the Marches' forts, the watch posts | rubble masonry under a thick lime wash, the maroon band, tiled roofs on the towers; no gold |
| **`royal`** | Strongwall, the gates of the capital's roads | dressed ashlar to the walk (the kit's `XPAL.stone`), the maroon twig band, painted iwan gates, the Sultan's roundel and a gilt pavilion over the main gate. Gold on the civic is the lore's rule ("Gold is on everything wealthy, religious or civic"), so it goes on the gate pavilion and the chapel's finial only (question 6) |
| **`earth`** | the lesser forts, a fort raised in haste | rammed earth over a rubble footing (`xa_wall` v2's `xWallE`), timber bretèches, thatch on the barracks |
| **`scrap`** | forts in the scrap towns (after `claude/scrap-xanadu` is merged) | the scrap set's panel courses, girder gates and bronze crowns (`xa_scrap_gate`'s); the beacon is a `xa_scrap_tower` |

**No gilt crowns** in any dress. The crowns, with the wheel and deer, are the holy buildings' (`kits/qiblai/PLAN.md`
section 4). A fort that guards a holy place takes the crown only on its shrine.

### 5.6 The states (`core/ruins`)

| State | What is drawn | The check |
|---|---|---|
| **`kept`** | as built | the kit's overlap audit, the walk |
| **`damaged`** (after a raid or a siege) | **One or two breaches** (a curtain run dropped to a rubble talus on both faces, `core/terrain`'s `KRUBBLE` heap: never a scatter of boxes). One tower's top storey fallen (its merlons and roof as wreckage at its foot). The gate's leaves burned (charred, one hanging). The barracks' roof burnt through. Scorch on the walls by the gate | **`KRUINS.watch(root, {name, ground})`** once drawn: nothing floats, every fallen piece lies on its lowest points, seated by its rotated extents |
| **`ruined`** (abandoned, a generation on) | Curtains standing 1-4 m in stretches, their talus heaps between. The towers are shells. The keep stands to one or two storeys, its upper floors fallen into it. Roofs gone, gates gone. The magazine's vault is the only roof left. Scrub in the wards (the biome's) | `KRUINS.watch`, as above |

A state is a field of the record (`o.state`). A world or the sim's raid outcome sets it, and the same plan draws all
three, so a fort keeps its outline as it falls. Damage is seeded by `core/rand` from (fort id, state, breach index).

## 6. Core adoption (write in full before the first fragment)

| Need | Take | Notes |
|---|---|---|
| The ground at 1:1, the site on the map | `core/world` (`WORLD.H`, `ROADS`), the site cut by `tools/scale-model/cut_site.py` into a region | which region holds it is the open-world session's call (the Xanadu regions so far: `xanadu-oidong-highrift`) |
| The gorge, the scarp, the fan | `core/terrain` (carve patches for the gorge's walls; `KRUBBLE` for the states' rubble) | |
| Kruk Gill, the cistern | `core/water` (flow: a seasonal wadi; still: the cistern) | |
| Sky, light, weather | `core/atmos` | |
| Randomness | `core/rand` (`KRAND`): every fort, tower and breach seeded from a hash of (world, fort id, index, salt) | |
| Records, names | `core/tags` (`KTAGS`): the fort and every piece registered before they are drawn; the vocabulary gains `fort`, `beacon` and `assay` if missing | |
| Overlap, occupancy | `core/space` (`KSPACE`) for the plan's rules | |
| Streets and lots | **not `core/city`**: a fort is one building record with its own plan (section 5.2), not a street grid. The Golden Tears' compound and the bench's hamlets go on `core/hamlet` | |
| Doors, walks, interiors | `core/door` (`KDOOR`), `core/walk` (the wall walks and stairs), `kits/interiors` (`sets/xanadu.js`, one item per new def), furnished from `kits/catalog` (`xanadu`, `eastabyss`, `generic`) through `core/furnish` | |
| Ruins | `core/ruins` (`KRUINS.watch`) on every damaged and ruined fort | |
| Surfaces | `core/materials` through the Xanadu pack (`kits/xanadu/materials.json`) | new sets only if the owner wants them (question 9); gaps to `core/materials/PROMPTS-NEEDED.md` |
| The building engine | the Xanadu kit's own (`VERN.def` on the Vernacular and the Ancients core); `core/engine` is not the Xanadu lineage's | |
| People and time | `core/charactermodels` (the Xanadui soldiers' dress), `core/simulation`, `core/sched` (the watch rota, the beacon post's rota, the assay's batches) | |
| The economy | `core/region` (`XAN_TUNE`, `test-xan-economy.js`) | |
| Raids | `core/camp` (the Lizardmen plan's Z4) | |
| Viewer, export | `core/host`, `core/lod`, `core/export` | |

## 7. Steps

| Step | What | Who | Test |
|---|---|---|---|
| **W0** | **The model and the pins**, through the scale-model session's queue (`local_bf163a02`): the trench on row 1641 and the pit at 913-915, 1633-1635 (fixed, or kept as a feature: question 3); **the Golden Tears' house pin moved out of the trench** to the bench, *proposed* 913,1639 (659 m) or 914,1639 (641 m); a pin for the Spur beacon (908,1643) if the owner wants the watch line on the map | the scale-model session | the pins' ground is the bench; Kruk Gill's bed still runs to the bench |
| **W1** | The tune: Strongwall's stores and the Fifth's two caravans; the Golden Tears' season; the opal road (question 10); the fort's `state` as a record raid outcomes can set | the tune's owner | `test-xan-economy.js` |
| **F0** | This specification accepted, the questions answered | the owner | |
| **F1** | `XFORT.plan` as `[G data]` (`kits/xanadu/src/80f-xa-fort-data.js`, *proposed* name), with a node test of its rules (the corner towers, the gate on the approach edge, every walk joined, no overlap) | **whoever owns `kits/xanadu` then** | `node kits/xanadu/tests/test-fort.js` (`tools/ktest.js`, with negatives) |
| **F2** | The pieces drawn (`80g-xa-fort.js`, *proposed*): curtain, towers, gates, the water gate, keep, barracks, magazine, beacon, cistern, granary, stables, the assay court; the four dresses; on Xanadu's sheet | the same | `kits/xanadu/verify.py --assert` (the overlap audit, every door in KDOOR); `check_core_use` |
| **F3** | The states: damaged and ruined from the same plan, rubble on `KRUBBLE` | the same | `KRUINS` on every verify |
| **F4** | Hollow and walkable: the keep's floors, the barracks, the walks; the interiors set's items | the same | the walk and interiors audits |
| **S1** | **Strongwall on the open world**: the gorge wall, the two wards, the Golden Tears' compound, the Spur beacon and the watch line's posts sited at 1:1 (the lines of sight rechecked on the region's own ground) | the open-world session | the region's verify; a line-of-sight assert between each post and the next |
| **S2** | The Marches' three watch forts and Kirstabal's and Strongbow's gate works from the same asset, each by its own plan | those plans' sessions | |
| **S3** | Life: the garrison's rota, the ore trains up and down the gorge, the assay's furnaces at work, the Fifth's escort | | the sim's schedule matches the tune's batches |
| **S4** | The raids (Lizardmen Z4) set the fort's state | the Lizardmen session | a raid's outcome draws the damaged fort |

## 8. Questions for the owner

1. **The name.** Is Strongwall named for **the wall across Kruk Gill's gorge** (proposed: the fort closes the only road
   up to the gold), or for the great scarp behind it, or for something else? Is there a Xanadui form, as *Gōlḍ-Mārch*
   has?
2. **The Master of Mines.** The citadel's Mint belongs to "the Master of Mines and Mints". Does the Master live at
   Strongwall, or at the citadel with a deputy holding the fort? *Proposed:* a Warden of the March holds it, and the
   Master comes up for the Fifth.
3. **The model's trench and pit.** The slot along the scarp's foot (row 1641, down to -356 m) and the pit on the Qiblai
   road (-351 m) look like carve artefacts. Fix both (proposed)? Or keep the trench as a fault trough, a natural moat
   before the fort?
4. **The Golden Tears' house.** Its pin sits on the trench's lip. Move it onto the bench (913,1639 or 914,1639)? Is
   it a walled compound outside the fort (proposed), or a ward inside it?
5. **Powder.** Does the Sultanate have gunpowder? P4 has saltpeter (Gemini's 70 t) and the lore says its best weapons
   come from Iziz and Yuni. This decides the magazine and whether the fort is a high-walled medieval dzong (proposed,
   against bronze-armed raiders) or a low bastioned one.
6. **Gold on forts.** The lore puts gold on everything civic. Proposed: the gate's pavilion and the keep chapel's finial
   on royal forts, and no gold on the Marches'. Or no gold on forts at all?
7. **The watch forts.** One asset with three sizes, as proposed? Or should the beacon fort over the Rift be a different
   thing, a tower fort on a crag?
8. **Mounts.** What do the garrison and the ore trains use: horses, mules, yaks, or something of the Rift's? This sizes
   the stables and the caravan yard.
9. **Textures.** Are the Xanadu pack's stone, wash and earth sets enough for the forts? Or should new sets be sourced:
   a battered rubble wall under lime wash, a weathered timber gate studded with iron?
10. **The opal.** With Lāiṭwāl now P6's seat, does Opal Valley's opal still come to Strongwall's assay? Or does it stay
    in Ōpal-Bhālī, with the Fifth taken at Lāiṭwāl?
11. **The watch line.** Should the Spur beacon and the posts down toward the Rift and up to the mines go on the map as
    pins (W0)? Or should they be left to the 1:1 site?
