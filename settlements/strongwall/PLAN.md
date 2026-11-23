# Strongwall, the Master of Mines' fort in the Gold March, and the Xanadui fort asset (proposal, 2026-11-16)

The owner, 2026-11-16: *"spin off agents to make site plans for Pher, Thalaba, Kirstabal, and Strongwall. we may need to
build a Xanadui fort asset as well"*.

**The owner's answers, 2026-11-16** (section 8; folded in below):
- The name is **the scarp**'s.
- The Master of Mines **spends much of the year there**.
- **Keep the slot** as a natural moat.
- **The Golden Tears move into the fort.**
- **Powder:** the Sultanate has "enough gunpowder for a few cannon but musketeers are mostly hired from the north".
- **Gold on the gate pavilion and the chapel.**
- **The beacon fort over the Rift** is "a refurbished Ancient high-intensity beacon that has been moved there by Xanadu
  and connected to a generator".
- The garrison and the ore trains ride **horses and donkeys**.
- "I'm open to new texture proposals": three are proposed (`core/materials/PROMPTS-NEEDED.md` section 53).
- ~~**The opal goes to Strongbow first**, as it is closer.~~ **Superseded the same day:** the owner chose "Ferry to laitwal": the Opal
  Valley mines are Lāiṭwāl's works village, their opal ferried to Lāiṭwāl and down the valley by Kirstabal (section 4).
- **The watch posts go on the map**, with English names.
- The musketeers are **"all of the above"**: Izani, Yuni and free companies of the Crater.
- The beacon's keepers are **the Yellow Monastery, the Order of the Beacon**: Qiblai's gold monastery, which may keep
  other beacon lights as well.
- **The Violet Monks of Qiblai** will have their central monastery on a strategic site not far from Strongwall: **the
  Order of the Violet Storm**, a martial order that protects the Vale against Lizardmen incursions (section 3a). Its
  site is **the West Arm** (886,1619). It is **the House of the Tempest**, 600 strong in the Gold March, its monks of
  **sword and bow**, and Qiblai's violet monastery is its daughter house.

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

**Two features of the model:**
- **The slot** (kept: the owner, 2026-11-16, "keep the slot as a natural moat"). Row 1641, x 913-922, is a slot 2 km
  wide and up to 1 km deep along the scarp's foot: 316 m at 913, -8 m at 916, -356 m at 918, -347 m at 920. Row 1642
  below it is -88 m at 918-920. *Proposed reading:* a fault trough where the scarp's master fault meets the bench. It
  opens just east of the gorge's mouth and runs east along the scarp. At 1:1 it covers the fort's east flank, so the
  fort is reached only from the north and west. Kruk Gill's floods spill into its head.
- **The pit.** 913-915, 1633-1635 falls to -351 m. It is the old pin's cell, already owed as a model fix in
  `openworld/PLAN-SETTLEMENTS.md`, and it sits on the road north to Qiblai, which dips to -23 m 12 km out. It is still
  owed: the owner's answer kept the slot, not the pit (W0).

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

**The watch posts** (the owner, 2026-11-16: "put watch posts on the map"). They were found by a search on the same grid,
from the pin outward, over cells with a clear line to the post before them and hops of at most 24 km, preferring high
ground. The clearances are for a 12 m post at both ends:

| Post (English names kept: the owner, 2026-11-16) | px | Ground | Hop | Clear by | Sees besides |
|---|---|---|---|---|---|
| **G1, the Brow post** | 917,1648 | 3,455 m, 3 °C, `Dfc` | the fort, 19 km | 20 m | **Qiblai** (+36 m), **the beacon fort over the Rift** (+19 m, 258 km) |
| **G2, the Cold post** | 911,1653 | 4,137 m, -1 °C, `Dfc` | G1, 16 km | **2 m** (marginal) | |
| **G3, the Lode post** | 915,1664 | 5,046 m, -7 °C, `ET` | G2, 23 km | 18 m | the mines' bowl: the mines at 8 km (+6 m) |
| **R1, the Fan post** | 906,1635 | 585 m, 19 °C | the fort, 16 km | 16 m | |
| **R2, the Bench-end post** | 905,1626 | 446 m, 20 °C | R1, 18 km | 20 m | |
| **R3, the Rift post** | 894,1624 | 362 m, 20 °C | R2, 22 km | **2 m** (marginal) | **the Golden Tears' camp** (+13 m, 88 km); 60 km short of Komodo, which it does not see |

- G1 replaces the Spur (908,1643) of the first draft: it sees the fort, Qiblai and the beacon fort, and it starts the
  chain to the mines.
- The two marginal hops are to be checked on the region's own ground at 1:1 (step S1). A post may move a cell, or
  stand on a taller tower.
- G1's line to the beacon fort is clear but 258 km long, beyond a fire's reach. **The beacon fort's Ancient
  high-intensity beacon** (the owner, 2026-11-16) may carry that far at night. If it does, G1 reads the Marches
  directly; if not, the posts between belong to the Marches' plan.

**What the site is, then** (*proposed*, except the name, which is the owner's). Strongwall is named for **the scarp**,
the 2,700 m wall it stands under (the owner, 2026-11-16). Strongwall is the **gate of the gold**. The only road from the plateau's mines
down to the Sultanate comes down Kruk Gill's gorge. The fort closes the gorge's mouth. Everything the mines make passes
under its wall, and the Lizardmen's way up from the Rift ends against it. At 755 m it stands where the air thins and
cools from the Rift's 2.2 atm and 35 °C toward the plateau's 0.9 atm and -6 °C. The lore's Lizardmen dislike that change,
so Strongwall is about as high as a raid comes. The gold above it is out of their reach.

## 2. Who lives there

The tune gives Strongwall **250 people** (`town('sxan7r1sln', ..., 250, 'fort', ...)`) and the Golden Tears' house
beside it **80** (`tears.strongwall`). The split below is *proposed*.

| Who | People | Where |
|---|---|---|
| **The garrison of the Gold March**: archers, spearmen and mounted men under a commander; **musketeers hired from the north** (the owner, 2026-11-16: "musketeers are mostly hired from the north"), *proposed* about 30, with their own captain and mess. **They are a mixed lot: Izani, Yuni and free companies of the Crater** (the owner, 2026-11-16: "all of the above"), each in its own dress, so their range is a mixed barracks; **a few gunners** for the fort's cannon (*proposed*: three guns, below). They keep the gorge wall's watch and escort the ore trains and the Fifth | ~140 | the barracks ranges on the inner and outer wards, the gates; the six watch posts (section 1) by rota, about 4 a post |
| **The assay house**: the assayers, refiners and furnace men, the Sultan's weigher and his sealers | 20 (the tune's crew) | the assay court in the inner ward |
| **The Master of Mines' household and office**: the Master himself, who **spends much of the year here** (the owner, 2026-11-16); *proposed:* the rest of the year at the citadel's Mint, with a deputy holding the fort then. His family, the clerks of the ore tally and the Fifth, servants | ~30 | the keep, which is a residence as much as a tower: the Master's hall and rooms |
| **The fort's trades**: smiths and armourers (the arms bought from Iziz and Yuni are kept and mended here), a farrier, cooks, a baker, a cooper | ~25 | the outer ward |
| **The caravan yard**: drovers, porters, ostlers for the ore trains and the Qiblai road. The garrison rides **horses**; the ore trains are **donkeys** (the owner, 2026-11-16). *Proposed:* about 40 horses and 150 donkeys stabled here, plus the trains out on the road | ~25 | the outer ward and its stables |
| **The wheel house**: a small shrine of the Decree with three or four monks, the garrison's prayer wheel | ~5 | beside the gate inside the inner ward |
| **Wives, children and elders** of the married men | (inside the numbers above) | the outer ward's houses |
| **The Golden Tears** (the owner, 2026-11-16: "a bit more militaristic, running expeditions into Lizard country to seek out unclaimed gold lodes") | 80 | **inside the fort** (the owner, 2026-11-16: "move them into the fort"): *proposed*, **the Tears' court**, a walled court of the outer ward with its own gate onto the ward and its own tower, holding the factors, the house's guards, the ore handlers and the depot for the Rift camp. *Proposed:* their camp of 120 (`exp.rift-gold`) works the Rift floor in the cool months and comes home in the hot ones, so the court swells to ~200 in summer and camps on the muster ground |

Outside the walls is the province's countryside: P4's 10,000 people in the tune (`prov.p4`, in bulk). There are bench
villages, the copper diggings on the band, and placer camps on Kruk Gill's gravels (PROPOSAL-XANADU's "2 placer camps").
They are left to a hamlet pass (`core/hamlet`) once the fort is placed.

## 3. The layout (*proposed*)

The fort is a dzong of the Gold March: a closed, battered, whitewashed enclosure on the gravel fan, set across the
gorge's mouth so the road and the wadi both pass under it. North is downhill and the approach; south is the gorge.

- **The gorge wall.**
  - A curtain about 9 m high runs from the scarp's rock on the west to the rock on the east, across the gorge's mouth
    (roughly 200-400 m at 1:1; the 2 km grid cannot show it).
  - **The Gold Gate** is in it: the road up to the mines, its leaves shut at night.
  - **The water gate** stands beside it: three tall arched sluices with iron grilles, so Kruk Gill's floods pass
    without bringing the wall down.
  - Above the wall, two towers stand on the rock, one on each side of the gorge.
  - **Two of the fort's three cannon** stand on the gorge wall's gun platform, laid down the gorge road. The third
    stands over the Qiblai Gate. *Proposed:* bronze field guns bought in the north, with the powder kept in the magazine.
- **The slot** on the east: the fault trough of section 1, kept as the fort's moat. The inner and outer wards' east
  curtains stand on its lip, so there is no gate and no tower base on that side, only bretèches over the drop.
- **The inner ward** (about 110 by 80 m), on the fan just north of the gorge wall and joined to it:
  - **the keep** (the *utse*: the Master's hall, the office of the ore tally, the clerks, the strongroom under it);
  - **the assay court** (the assay house's furnaces and the weighing hall);
  - the garrison's barracks range along the east curtain;
  - **the magazine**, set apart in the south-west corner against the rock;
  - the cistern under the court;
  - the wheel house by the inner gate;
  - the keep's chapel, with **the fort's gold**: the gilt finial on the chapel and the gilt pavilion over the Gold Gate
    (the owner, 2026-11-16).
- **The outer ward** (about 140 by 70 m), north of the inner ward, holds:
  - the caravan yard and the **ore yard**, where the trains coming down from the mines are counted before the ore goes
    into the assay court;
  - the stables (horses for the garrison, donkeys for the ore trains);
  - the granary;
  - the smithy and armoury;
  - the married quarters and the hired musketeers' barracks (*proposed*: a range of their own);
  - **the Tears' court**, the Golden Tears' house inside the fort (section 2);
  - the muster ground (`xa_muster`).
  - **The Qiblai Gate** in its north curtain takes the road down the bench to Qiblai (83 km) and on to Erehwon (404 km).
- **The watch line**: the six posts of section 1, each a `xa_fort_beacon` post (a small square tower, its fire
  basket, a fuel store, a hut for a rota of four).
  - **The gold line**, G1-G3, runs up the plateau to the mines' bowl. G1, the Brow post, is also the fort's long eye
    north to Qiblai and toward the Marches.
  - **The Rift line**, R1-R3, runs west down the bench and the slope toward the Rift's rising roads. R3 watches the
    Golden Tears' camp.
- **The bench below**: the copper diggings on the scarp face to the west, the placer camps on Kruk Gill's lower
  gravels, the hamlets. The road up to the mines follows the wadi through the gorge.

## 3a. The Violet Storm's monastery

The owner, 2026-11-16: *"not far from Strongwall, on a strategic site, the Violet Monks of Qiblai will have their
central monastery. The Order of the Violet Storm is a martial order that protects the Vale against Lizardmen
incursions"*. The violet house is one of Qiblai's eight great monasteries (LORE 6.13: crimson, saffron, gold, green,
turquoise, blue, violet, white). Everything below the quote is *proposed*.

**What "strategic" means here.** The survey traced the walkers' easiest routes out of Komodo on the 2 km grid (a
least-cost path that penalises steep ground both ways). Three roads lead out of Lizard country toward the Sultanate:

| Road | Length | Its course | Air on it |
|---|---|---|---|
| **The trough road to Qiblai** | 128 km | east along the Rift floor's trough at -2,600 to -1,480 m (y 1596-1604), over a low sill at 904-913,1598, into Qiblai's basin at -1,860 m | ~2.1-2.2 atm all the way: Lizard air to the holy city's door |
| **The Vale road** | 170 km | the same trough as far as 877,1601, then north over the ridge at 1,100-1,635 m (900-907, 1541-1574) and down to Theodiga and the Vale | the one road that climbs into thin air |
| **The Strongwall road** | 96 km | east up the **Kruk Warra** (`r088`, perennial, 51 m³/s; it rises at 885,1628 at -794 m and runs 40 km west to Komodo's lake), onto the bench's west end at 895,1630 and along the bench | ~2.2 atm at Komodo, 1.5 atm on the bench |

All three leave Komodo together and part within 25 km of it, west of x 880. The ground between the Kruk Warra's
valley and the trough is a **broad western arm of the bench**, about 400-520 m high (881-893, 1614-1623). It is
Xanadu's last high ground before the Rift, between the two low roads.

**The candidate sites:**

| | **A. The West Arm** (**chosen**: the owner, 2026-11-16) | **B. The Bench-end knoll** |
|---|---|---|
| px | **886,1619** | 906,1628 |
| Ground | 519 m on a flat crest (steepest step 35 m a km): room for a great monastery and its fields | 541 m, a knoll (72-118 m a km) above the bench's west edge, beside the R2 post |
| Climate | 19 °C, ~990 mm, `Cfb` | 19 °C, ~925 mm, `Cfb` |
| From Strongwall | 66 km west-north-west, **in sight** (+18 m) | 26 km, in sight (+23 m) |
| From Komodo | 42 km | 84 km |
| From the roads | the Strongwall road 16 km south (Kruk Warra's head); the trough road and the Vale road 31 km north-west | the Strongwall road's climb onto the bench, 18 cells of it in view |
| Sees | Strongwall, R1 (+30 m), R2, R3 (+3 m, marginal), G1 (+45 m) | Strongwall, R1, R2, R3, G1 (+61 m) |
| Does not see | Komodo, the trough. Its own west brow (879,1618, 153 m, 22 °C) sees **Komodo** (+40 m, 28 km), **the Golden Tears' camp** (+21 m) and all three roads, but not the crest (-117 m). On the 2 km grid no single cell sees both the crest and Komodo, so the forward lookout and its relay are sited at 1:1 | Komodo, the trough road, the Vale road |
| Water | the Kruk Warra's head 16-18 km south; wells and cisterns on the crest | Kruk Gill's floods; wells |
| Why | it **stands between Komodo's roads**: a raid toward Qiblai or the Vale passes under its north flank, one toward Strongwall under its south. Its riders come down on either road, and its fires reach Strongwall and the watch line. It is the Gold March's shield, with Strongwall the gate behind it | close and safe, but it guards only Strongwall's road. A raid along the trough toward Qiblai or the Vale never comes in sight of it |

**The House of the Tempest, on the West Arm** (the owner, 2026-11-16: site A; the name; "sword and bow"; pin `886,1619`, its lookout
`879,1618`):
- **People.** **600, in the Gold March** (the owner, 2026-11-16). *Proposed* split: some 400 fighting monks, 150
  novices, 50 lay brothers, herdsmen and smiths.
- **The order's central house.** **Qiblai's violet monastery is its daughter house** (the owner, 2026-11-16).
- **Its monks fight with sword and bow** (the owner, 2026-11-16), mounted. They take no powder: the forts' guns and
  hired muskets are the Sultan's, the swords and bows the order's.
- **The building is a dzong in the full sense**, monastery and fortress in one. It is the Qiblai kit's great monastery
  in **its violet dress** (`kits/qiblai`: the great monastery has its eight dresses), set inside the fort asset's
  curtain, towers and gate (section 5). This is a fourth size of the fort, `size:'monastery'`: the curtain round a
  monastery's courts.
  - It is holy, so **the gilt crown** goes on its assembly hall (the crowns are the monasteries', `kits/qiblai/PLAN.md`
    section 4).
  - Its gate keeps the forts' **gilt pavilion**.
  - Inside: a drill court and archery butts beside the cloister, the armoury of swords and bows, and the order's
    stables (horses).
- **The forward lookout** stands on the west brow (879,1618): a watch post of the fort asset, with a relay to the
  crest sited at 1:1.
- **The fields.** The crest is `Cfb` and farmable: barley, tea and the order's herds. The rest comes up from
  Strongwall and Qiblai's roads.
- **In the sim** (W1, done): `xan.tempest`, 600 of the Xanadu polity in P4, fed through Strongwall (`road.sw-tempest`,
  80 km). Its terraces make two fifths of its grain (43 t in the test year), and it draws arms but no powder. In the
  Lizardmen's Z4, the order's riders are what meets a raid on the trough road and the Kruk Warra.
- **The blueprint** (the owner, 2026-11-16: "we can use the large building planning skill for this one"):
  `tempest/BLUEPRINT.md`, sheets and manifest. The owner's forks: **concentric** wards (the violet monastery in the
  inner ward, the martial ranges against the outer curtain); **the Prismarch lives in the utse** between the wards;
  **the novices in their own court**; **the horses inside, three gates** (the Main Gate east, sally gates north and
  south). So `size:'monastery'` (section 5.4) is two curtains with the utse astride the inner one (BLUEPRINT, "For the
  fort asset").

## 4. The economy (tied to `XAN_TUNE`)

What the tune did before W1, from `test-xan-economy.js` on this branch:

| Flow | The tune | The year's figure |
|---|---|---|
| Gold ore in from the mines | `mine.gold`: 50 km, all the ore (`T.mine.goldore` 6,400 kg a year, a field of 85 veins, 212 years) | **8.3 t of ore** landed in all |
| Gold ore in from the Golden Tears | `tears.rift` lands at their house; its `cut` sells all the ore to the Sultan's assay | about 2.1 t of ore (70 kg of gold a year at 30 kg of ore a kg) |
| **The assay** | `sw.assay`: 20 crew, 30 kg of ore to 1 kg of gold in 20 hours (`T.chain.assay`) | **277 kg of gold** |
| **The Sultan's Fifth** | `fifth`: a 0.2 share of the gold to `xan.citadel`, 404 km | about **55 kg a year** |
| The rest of the gold | `road.sw-er` to Erehwon (404 km) and `road.qb-sw` to Qiblai (83 km) | 275 kg exported |
| Copper | P4's countryside's copper (240 t a year, the band's lode) passes through | 203 t in, mostly on to Qiblai and Erehwon |
| Opal | `mine.opal`: Opal Valley Mines' opal less its Fifth, 260 km | 136 kg in. **No longer through Strongwall** (below: Lāiṭwāl's ferry) |
| Food | grain, salt, tea and tools up from Qiblai (`road.qb-sw`) and on to the mines (`road.sw-gold`) | 231 t of grain in. The fort eats about 45 t; the rest feeds the mines' 950 |

**W1, done 2026-11-16** (`core/region/data/xan-tune.js`; the test, `core/region/tests/test-xan-economy.js`, 48 passed,
with a new check and its negative, now number 29: "Strongwall's W1"):

| What | In the tune | The test year |
|---|---|---|
| **The opal: by Lāiṭwāl's ferry** (the owner, 2026-11-16: "Ferry to laitwal", over W1's first route, "opal goes to Strongbow first as it's closer") | on `claude/openworld-sites-24defd` (154c2970d), with the Light Wall's L1: the mines (`sjuarjbku0`) are Lāiṭwāl's works village; `mine.opal` ferries their opal to Lāiṭwāl (27 km), the mines' bread back; it goes down the valley with the town's own by Kirstabal (`road.lw-ks`) to Qiblai and the capital. W1's Strongbow road (`road.sb-opal`, the mines under Strongbow, the expects on `road.ks-sb`) is gone. Strongwall's roads carry no opal either way | test-xan-economy's W1 check (now 29) looks for the opal by the ferry and inward, never by Strongwall |
| **The Golden Tears inside the fort** (the owner) | `tears.strongwall` at 912,1640, "the Tears' court, inside Strongwall" | the camp's ore still sold to the assay |
| **Powder** (the owner: "enough gunpowder for a few cannon") | a new good `powder` (kg), brought in by the Iziz and Yuni gateways (`T.gatePool`); the fort diet eats 2 kg a head a year (drill and the guns' proof); it travels on every road that carries arms; `road.qb-sw` now carries arms and powder up to Strongwall | 280 kg into Strongwall, 25 arms |
| **The hired musketeers** (the owner: "mostly hired from the north"; Izani, Yuni and free companies) | `T.muskets`: 30 at Strongwall and 10 at each Marches fort, 12 dinars a man a year (a dinar is 4 g of the Mint's gold), paid by the Treasury on year day 240 as transfers `pay.muskets.*`, owed when it is short | 360 dinars to Strongwall |
| **The beacon fort's generator** (the owner) | `march.e` takes a fiftieth of the Sultan's oil licence (`T.lit`, from the capital's share, now 0.43) and burns it as the large towns' generators do; its name says the Ancient beacon and the Yellow Monastery | lit all year (the power check) |
| **The forts' state** | `state:'kept'` on Strongwall, the Marches' forts and the House of the Tempest: the fort asset's kept, damaged or ruined, for a raid's outcome to set | |
| **The House of the Tempest** (the owner: the Gold March, 600, sword and bow) | `xan.tempest` at 886,1619, the fort diet less powder, its terraces two fifths of its grain, the rest through Strongwall on `road.sw-tempest` (80 km); counted in P4's named people | made 43 t of grain of the 108 t it ate; its first year's grain is in its stores; salt, tea, tools and arms landed from Strongwall |

**Not done in W1, and why:**
- **The Fifth twice a year.** The valley host's roads run continuously and have no departure schedule. The Fifth stays
  a share road until the host has one, and the plan's two escorted caravans are for the drawing (S3).
- **Strongwall's stores** (a season of the mines' grain). `keepDays` stays at the towns' 20. A larger keep holds goods
  back from the mines, and the test year shows no shortage either way.
- **The Golden Tears' season home** (the camp's return in the hot months). It changes only the court's size in the
  drawing.

**Found on the way, not changed:**
- **Arms never reach Erehwon.** No gateway landing at the capital brings them: the Dalab caravan carries salt, iron,
  wine and pearls. So the Marches' three forts are fed their arms only from their opening stores, and now their powder
  the same way.
- A small back-and-forth of arms runs between Strongwall and the House of the Tempest (15 one way, 16 the other in the
  test year): each sends the other its surplus by want.

**Raids** are the Lizardmen plan's Z4 (`core/camp`'s ventures). Their targets near Strongwall are the Golden Tears'
camp (37 km from Komodo), the ore trains on the gorge road, and the bench villages. The fort's `state` is the record a
raid's outcome would set. The sim never draws it.

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
| `xa_fort_curtain` | A run of any length. It sits on a battered talus of rubble with a dressed (or rammed-earth) wall above, battered 1 in 8 (the Tibetan lean). A whitewash band above with the maroon twig band (*pembé*) under the parapet, then pointed Persian merlons over a walk with loopholes sized for bows and muskets. *Rajput* bretèches (corbelled stone boxes) over the gate and at the corners. It follows the ground in steps of at most 1.5 m and never floats | 6 m high, 2.4 m thick, walk 1.6 m | 9 m, 3.5 m, walk 2.4 m; the gorge wall 10 m |
| `xa_fort_tower` | Square and battered (the dzong's) or a drum (the Persian and Turkish one, `xnXETower`'s). A flat roof with merlons, slit windows in the Tibetan trapezoid frame. The corner towers are a storey higher than the curtain | 4 square, 9 m | 6-8 drums of 11 m on the wards; the 2 rock towers over the gorge are square, 14 m |
| `xa_fort_gate` | The iwan gate between two towers (`xa_gate`'s). Over the arch is the Sultan's roundel, the eight-spoked wheel, and over the main gate **a gilt pavilion** (the owner, 2026-11-16). Two leaves of timber and iron, studded with spikes against rams and beasts. The **bent entrance** (the Indian forts' angled approach, so no charge reaches the leaves straight) is optional. Murder holes in the passage vault | 1 gate, straight | the Qiblai Gate bent through a barbican; the Gold Gate straight under the gorge wall; the inner gate |
| `xa_fort_water` | The water gate: two to four tall arched sluices through a curtain, iron grilles, cutwaters | — | the gorge wall's (Kruk Gill) |
| `xa_fort_keep` | The *utse*: a white battered tower of three to five storeys. The red band and red sanctum on top with its chapel (*lhakhang*) and a prayer wheel. **The chapel is gilt** (the owner, 2026-11-16): its finial and roof. A ground-floor hall | 12 by 12 m, 18 m, the commander's room and the chapel | 24 by 18 m, 30 m; the Master's hall and rooms (he lives here much of the year), the tally office, the clerks; **the strongroom under it** |
| `xa_fort_barracks` | A two-storey range against the curtain: a colonnade on the ward side (`xa_barracks`'s painted columns and corbelled eave), sleeping halls above, messes below | 1 range, 120 men | 2-3 ranges, ~140 men, the married quarters in the outer ward |
| `xa_fort_magazine` | **The powder magazine** (the owner, 2026-11-16: "enough gunpowder for a few cannon"): a low vaulted store, apart from the rest, against the curtain or rock, behind a blast wall. Thick walls, a single copper-sheathed door (no iron to strike a spark), blind but for baffled vents. Beside it the armoury keeps the arrows, spears, muskets and the bought steel | 1 small | 1, in the inner ward's south-west corner against the rock |
| `xa_fort_gun` | A gun platform: a stone deck on a tower or curtain with one or two embrasures, a bronze cannon on a wooden field carriage, a shot rack, a covered powder box | 0-1 | 3: two on the gorge wall, one over the Qiblai Gate |
| `xa_fort_beacon` | A beacon: a stone fire basket on the keep's roof (watch fort), or a **beacon post** of its own: a small square tower with the basket, a fuel store and a hut for its rota. Smoke by day, fire by night. *Proposed:* a signal mirror, which the Geomancers would trade. **`beacon:'ancient'`**: the refurbished Ancient beacon and its generator house (section 5.7) | on the keep (the beacon fort over the Rift: the Ancient beacon) | the keep's roof, and the six watch posts (section 1) as separate placements of the post |
| `xa_fort_cistern` | A cistern under the court, with a well head and its cover | 1 | 1, plus wells in the fan's gravels |
| `xa_fort_granary` | `xa_granary`'s stone store on a plinth, sized by the plan's `stores.grain_t` | small | about 60 t |
| `xa_fort_stables` | The stable range: horse stalls along a curtain, an open donkey shed, a hay loft, a trough (horses and donkeys: the owner, 2026-11-16) | 1 | 1, with the caravan yard |
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
| Beacon | on the keep; **the beacon fort over the Rift: the Ancient beacon** (5.7) | on the keep + the six watch posts | optional, on a gate tower |
| Guns | 0-1 | 3 | 0-1 |
| Footprint | about 70 by 55 m with its towers | about 160 by 200 m with the gorge wall | about 40 by 20 m |

The outline is a rectangle by default. A world may pass an outline (a spur's crest, a gorge's mouth) and the plan
fits the towers and walks to it.

### 5.5 The dresses

| Dress | Where | What changes |
|---|---|---|
| **`march`** (the default) | the Marches' forts, the watch posts | rubble masonry under a thick lime wash (`wall.rubble.limewash`, proposed), the maroon band, tiled roofs on the towers |
| **`royal`** | Strongwall, the gates of the capital's roads | dressed ashlar to the walk (the kit's `XPAL.stone`), the maroon twig band, painted iwan gates, the Sultan's roundel |
| **`earth`** | the lesser forts, a fort raised in haste | rammed earth over a rubble footing (`xa_wall` v2's `xWallE`), timber bretèches, thatch on the barracks |
| **`scrap`** | forts in the scrap towns (after `claude/scrap-xanadu` is merged) | the scrap set's panel courses, girder gates and bronze crowns (`xa_scrap_gate`'s); the beacon is a `xa_scrap_tower` |

**Gold, in every dress** (the owner, 2026-11-16): the main gate's pavilion and the keep's chapel are gilt, and nothing
else is. A watch post has neither, so it has no gold.

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
The burnt walls take `wall.limewash.scorched` (proposed, below).

### 5.7 The beacon fort's Ancient beacon (`beacon:'ancient'`)

The owner, 2026-11-16: the beacon fort over the Rift (`march.e`, 846,1540) "will be a refurbished Ancient high-intensity
beacon that has been moved there by Xanadu and connected to a generator". The rest is *proposed*:
- **The beacon is Ancient work set on a Xanadui fort.** A watch fort (`size:'watch'`) is built round it, with the
  beacon in the keep's place. The keep's footing becomes a battered plinth carrying the Ancient lamp head on its
  steel mount: a fat white-metal drum with a glazed face, the kind a hull's searchlight or a tower's warning lamp would
  be. It is bolted down with Xanadui iron straps, and its cable runs down the plinth in a stone channel.
- **The generator house** stands against the curtain: an oil generator of the Geomancers' kind (the oil licence,
  section 4), its fuel tank in a walled pit, and a small workshop where the beacon's keepers mend it.
- **The keepers are monks: the Yellow Monastery, the Order of the Beacon** (the owner, 2026-11-16). It is **one of
  Qiblai's eight great monasteries, the gold one**, so its abbot is the gold Prismarch. It **may keep other beacon
  lights as well**. *Proposed:*
  - its brothers keep the lamp, the generator and the signal book at the fort;
  - their cells are a small cloister inside the fort: a chapel to the Beacon, a yellow-washed lhakhang where the
    keep's chapel would stand (the gilt chapel of 5.5), with the lamp's plinth beside it;
  - the yellow wash and the gilt are the gold spoke's colour, the colour its banner on Qiblai's Rainbow Temple flies;
  - the other lights it keeps are for their own plans to name: any Ancient lamp the Sultanate has refurbished would
    go to the Order.
- **The beam** draws with the Ancients kit's lighthouse beam (`kits/ancients/src/89n-lighthouse.js`, `lhBeamGeo` and
  `LH_BEACONS`): crossed quads, widening, readable from any bearing. **The lamp head is a new Ancients piece**, owned by
  `kits/ancients`, with the Xanadu kit's mount and plinth around it. It is lit only while the generator has fuel (the
  sim's power, as the large towns' lamps are).
- In the `ruined` state the lamp head lies on its plinth's talus, a wreck seated by its extents (`core/ruins`). In
  `damaged` it stands, dark.

### 5.8 New textures (proposed; `core/materials/PROMPTS-NEEDED.md` section 53)

The owner, 2026-11-16: "I'm open to new texture proposals".

| id | For | Stand-in until it comes |
|---|---|---|
| `wall.rubble.limewash` | the curtains, towers and keep: rubble under poured, dripping lime wash, the dzong's wall | `rock.old_stone_wall` (bare) or `plaster.white_stucco_02` (smooth) |
| `wood.gate.studded` | the gate leaves: dark planks, iron straps, a grid of iron spikes | `wood.wooden_gate` |
| `wall.limewash.scorched` | the burnt walls of the `damaged` and `ruined` states | the wash darkened by its colour |

The rest is the library already in the Xanadu pack: `stone.cut`, `earth.rammed`, `band.xanadu.twig`, `metal.gold`,
`metal.bronze.cast` (the cannon) and `metal.iron`.

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
| Surfaces | `core/materials` through the Xanadu pack (`kits/xanadu/materials.json`) | three new sets proposed (section 5.8; `PROMPTS-NEEDED.md` section 53), wired at F2 when delivered |
| The building engine | the Xanadu kit's own (`VERN.def` on the Vernacular and the Ancients core); `core/engine` is not the Xanadu lineage's | |
| People and time | `core/charactermodels` (the Xanadui soldiers' dress), `core/simulation`, `core/sched` (the watch rota, the beacon post's rota, the assay's batches) | |
| The economy | `core/region` (`XAN_TUNE`, `test-xan-economy.js`) | |
| Raids | `core/camp` (the Lizardmen plan's Z4) | |
| Viewer, export | `core/host`, `core/lod`, `core/export` | |

## 7. Steps

| Step | What | Who | Test |
|---|---|---|---|
| **W0** (asked 2026-11-16; the scale-model session's to do) | **The model and the pins**, through the scale-model session's queue (`local_bf163a02`): **six watch-post pins** (G1 917,1648; G2 911,1653; G3 915,1664; R1 906,1635; R2 905,1626; R3 894,1624), each `type:'outpost'` of the Xanadu Sultanate; **the Golden Tears' house pin into the fort** (913,1641 to 912,1640); **the slot kept**, so nothing is smoothed on row 1641; **the pit** at 913-915, 1633-1635 filled to the bench (already owed) | the scale-model session | the pins' ground; each post's line to the one before it re-run on the edited model |
| **W1** (**done** 2026-11-16, section 4) | The tune: **the opal** (first to Strongbow; then, by the owner's choice, by Lāiṭwāl's ferry: section 4); Strongwall's stores and the Fifth's two caravans; `tears.strongwall`'s px into the fort; the Golden Tears' season; powder bought and the musketeers' hire on the Marches' bill; **the beacon fort's generator** (`march.e` on the oil licence); the fort's `state` as a record raid outcomes can set | the tune's owner | `test-xan-economy.js` |
| **F0** (**done** 2026-11-16) | This specification accepted, the questions answered | the owner | |
| **F1** (**done** 2026-11-16) | `XFORT` (`kits/xanadu/src/80f-xa-fort-data.js`, `[G data]`): `XFORT.plan` for the watch fort, Strongwall and the gate works (and a watch fort of any convex outline), `XFORT.check` with its six rules, `XFORT.damage` for the states, `XFORT.post` | this session | `node kits/xanadu/tests/test-fort.js`: 20 passed, each rule with its negative; the rules caught three faults in the first plan (a 35 m gap between towers, the married quarters on a tower, a cistern on the keep) |
| **F2** (**done** 2026-11-16) | `kits/xanadu/src/80g-xa-fort.js`: four defs in the family *Forts* (`xa_fort_watch`, `xa_fort_march` = Strongwall, `xa_fort_gate`, `xa_fort_post`), every piece of section 5.3 but the monastery size; gold only on the main gate's pavilion and the keep's chapel; on the kit's sheet (`kits/xanadu/build.py` names the fragments, not `xanadu.py`, so `XAK` and Xanadu's pages are unchanged) | this session | `kits/xanadu/verify.py --assert` on the GPU (the RTX and Arc lanes): every sheet assert passes, `fort-plans` passes; the showcase budget is over (6.71 M of 6.0 M: it was over before the forts, about 6.27 M) |
| **F3** (**done** 2026-11-16) | The damaged and ruined states (`o.v` 1, 2) from the same plan: breaches with their talus, fallen tower tops seated on their lowest points, a burnt gate and barracks roof; ruins in stubs, shells and low walls; rubble on `KRUBBLE` | this session | `KRUINS` on every verify (`targets/sheet/91u-xasheet-ruins.js`): all eight damaged and ruined forts pass, nothing floating, every wreck lying right |
| **F4** (**done** 2026-11-22: walkable 2026-11-16, interiors 2026-11-22) | The wall walks, stairs and their landings on core/walk; the interiors (the owner, 2026-11-22: "wire in interiors"): the interior set `xanadu-fort`, written in `kits/xanadu/src/80g-xa-fort.js` from XFORT's plans, one item per fort def: the keep's five storeys, the ranges (barracks, quarters, the Tears' house and store), the strongroom, the magazine, the assay court, the smithy and the wheel house as inset bodies; hollow, unlocked, planned and furnished on a page with Xanadu's interiors (Strongwall's, on by default; `?interiors=0` turns them off). A damaged or ruined fort gets no rooms. Still solid: the towers, gatehouses, barbican, the keep's chapel, the granary (`kits/xanadu/KNOWN_ISSUES.md`) | this session | `fort-walks`: every standing fort's walks, flights and tower tops reached from its stairs (2026-11-23, F4b: the walk climbs onto the towers instead of running through them; watch 41/41, Strongwall 131/131, the gate works 10/10, and their damaged states), with a negative; `test-fort.js` checks the layout (no walk through a tower or gatehouse, every corner and interval tower climbed); on Strongwall's page `interiors-hollow-and-reach`: 23 hollow storeys, 57 rooms, 489 pieces, every floor of the fort reached from its doors |
| **S1** (**the page done** 2026-11-16; the open world to come) | **Strongwall on its ground.** Done: the page (`settlements/strongwall`, a target on Xanadu's page): the march fort on a pad levelled into the bench at the pin (738.6 m; 4.4 m cut, 5.4 m fill), its gorge wall on the pin's row, the scarp behind from the model's next cell, the model's ground to 40 km (`README.md`). Turned so its Qiblai Gate faces north, the water gate stands in the west wing, where Kruk Gill comes down from the south-west. To come: the site in `openworld/xanadu-oidong-highrift` with its ring, the gorge carved at 1:1, Kruk Gill on core/water, and the six watch posts at 1:1 with their lines of sight rechecked (their pins wait on W0) | this session (the page); the open-world session with this one (the region) | `verify.py --assert` on the GPU: `strongwall-laid`, `on-the-model`, `fort-on-its-pad`, `fort-walks` and Xanadu's page asserts |
| **S2** | The Marches' three watch forts (the beacon fort with the Ancient beacon and its generator) and Kirstabal's and Strongbow's gate works from the same asset, each by its own plan | those plans' sessions | |
| **S3** | Life: the garrison's rota, the ore trains up and down the gorge, the assay's furnaces at work, the Fifth's escort | | the sim's schedule matches the tune's batches |
| **S4** | The raids (Lizardmen Z4) set the fort's state | the Lizardmen session | a raid's outcome draws the damaged fort |
| **V0** | **The Violet Storm's monastery on the map** (site A, the owner, 2026-11-16; asked 2026-11-16): a pin for the monastery at 886,1619 and one for its west-brow lookout at 879,1618, through the scale-model session's queue | the scale-model session | the pin's ground; its lines to Strongwall and the posts re-run |
| **V1** (**done** 2026-11-16, with W1) | The House of the Tempest in `XAN_TUNE`: its people, fields and arms, fed through Strongwall | the tune's owner | `test-xan-economy.js` |
| **V2** | The building: the fort asset's `size:'monastery'` round the Qiblai kit's violet great monastery | `kits/xanadu`'s owner and `kits/qiblai`'s | the two kits' verifies |
| **V3** | The monastery on the open world, with the forward lookout and its relay sited at 1:1 | the open-world session | the region's verify; the lookout sees the trough |

## 8. Questions for the owner

1. ~~**The name.**~~ **Answered 2026-11-16: the scarp.** Still open: is there a Xanadui form, as *Gōlḍ-Mārch* has?
2. ~~**The Master of Mines.**~~ **Answered 2026-11-16: he spends much of the year at Strongwall.** *Proposed:* the rest
   of the year at the citadel's Mint, with a deputy holding the fort then.
3. ~~**The model's trench and pit.**~~ **Answered 2026-11-16: keep the slot as a natural moat.** The pit on the Qiblai
   road stays an owed fix (W0) unless the owner says otherwise.
4. ~~**The Golden Tears' house.**~~ **Answered 2026-11-16: inside the fort.** *Proposed:* a walled court of the outer
   ward with its own gate and tower (the Tears' court).
5. ~~**Powder.**~~ **Answered 2026-11-16: "enough gunpowder for a few cannon but musketeers are mostly hired from the
   north".** The fort stays a high-walled dzong, with three guns at Strongwall and a powder magazine.
6. ~~**Gold on forts.**~~ **Answered 2026-11-16: on the gate pavilion and the chapel.**
7. ~~**The watch forts.**~~ **Answered 2026-11-16: the beacon fort is a refurbished Ancient high-intensity beacon,
   moved there by Xanadu and connected to a generator** (section 5.7).
8. ~~**Mounts.**~~ **Answered 2026-11-16: horses and donkeys.**
9. ~~**Textures.**~~ **Answered 2026-11-16: "open to new texture proposals".** Three are proposed (section 5.8;
   `PROMPTS-NEEDED.md` section 53).
10. ~~**The opal.**~~ **Answered 2026-11-16: to Strongbow first, as it is closer; then the owner chose "Ferry to laitwal"** (section 4).
11. ~~**The watch line.**~~ **Answered 2026-11-16: on the map** (section 1's six posts; W0).
12. ~~**The hired musketeers.**~~ **Answered 2026-11-16: all of the above** (Izani, Yuni and free companies of the
    Crater).
13. ~~**The beacon's keepers.**~~ **Answered 2026-11-16: the Yellow Monastery, the Order of the Beacon** (section 5.7).
14. ~~**The posts' names.**~~ **Answered 2026-11-16: the English names are fine** (the Brow, Cold, Lode, Fan,
    Bench-end and Rift posts).
15. ~~**The Yellow Monastery.**~~ **Answered 2026-11-16: it is one of Qiblai's eight, the gold one, and it may keep
    other beacon lights as well** (section 5.7). For `kits/qiblai/PLAN.md` (its question 1, the monasteries' names):
    the gold spoke is the Yellow Monastery, the Order of the Beacon.
16. ~~**The Violet Storm's site.**~~ **Answered 2026-11-16: A, the West Arm** (886,1619). Its pin and its west-brow
    lookout's (879,1618) are asked of the scale-model session (V0).
17. ~~**Its province and size.**~~ **Answered 2026-11-16: the Gold March, 600.**
18. ~~**Its spoke in Qiblai.**~~ **Answered 2026-11-16: Qiblai's violet monastery is the daughter house of this one.**
19. ~~**Its name and arms.**~~ **Answered 2026-11-16: the House of the Tempest; sword and bow.**
