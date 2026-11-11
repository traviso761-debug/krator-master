# Proposal: Longsong and Pinnacle Rock on the simulation layer

A proposal for the owner (2026-11-11), not a plan in force. It asks how far `core/simulation` stretches, what each
settlement's economy would have to balance, and in what order to build it. Numbers marked *est.* are this proposal's
arithmetic, to be checked by the sim.

## 1. How flexible the simulation is

**The core is generic; the region around it is not.**

- `core/simulation` names no island, sea or city. Every piece the two settlements need already exists in a general form:
  - a settlement with its own economy (`SIM.settlement`, `SIM.economy`);
  - recipes, as a rate or a batch, on sites that regrow;
  - herds;
  - the governor (order-up-to over the whole supply line);
  - spoilage;
  - households, accounts and wages;
  - unrest, projects and building;
  - `SIM.trade` carriers between settlements;
  - three levels (record, abstract, presented), with the ledger proving opening + made + imported = consumed +
    spoiled + exported + closing.

  A land-only economy runs in core today: "at sea" is only a label for in transit.
- **Everything that turns a census into a working economy is the isle demo's page code** (`settlements/isle-demo/src/40-49`,
  about 400 KB, under `ISLE.*`):
  - places from the city plans and roles from the census;
  - the hamlet wiring (`47h`) and the herding bands (`47n`);
  - expeditions, founding, refugees, the colony, money;
  - the week checks.

  It is mostly table-driven, but it is not a module. CLAUDE.md forbids copying it, so **the second and third economies
  cannot be built until it is lifted into a shared host.** This is the one large blocker.
- **Culture is data:** goods, inputs, producers and rates, spoilage and lines all sit in one tune table
  (`settlements/isle-demo/src/15-isle-tune.js`). A Xanadu highland table and a Beast Rider table are data work.
  `KHAMLET.CULTURES.xanadu` exists, though its pens, corral and dairy are still stand-in boxes. `KCAMP.CULTURES` has
  `beast-rider`.
- **What the sim does not have yet:**

  | Missing piece | Needed by |
  |---|---|
  | Seasons that change anything (`KCLOCK.season` exists, nothing reads it) | both |
  | Beasts as consumers or as carrying capacity | both |
  | Per-leg land routes (a road is one number of minutes) | both |
  | Moving bands with an economy (core/camp C3 world tick, C4 hand-over, C6 caravans, C7 raids: all plans) | Pinnacle |
  | Scheduled tithe or tribute transfers (M5) | Longsong |
  | Famine consequences, migration, births and deaths | both |
  | Money that limits (the dole feeds anyone) | both |

**Verdict:** flexible enough in its core, but both settlements wait on the same lift. Longsong is the cheaper of the
two: it needs hamlets, a tithe and seasons, all small. Pinnacle Rock needs moving bands, the largest unbuilt part of
the stack. **Build Longsong first and use it to prove the lifted host; Pinnacle second.**

## 2. Longsong: the balance

**Who eats.** The Order is 1,000 people, the ward's town 270 and visitors 74, so 1,344 in all (150 more valley folk on
festival days). At the build's own 180 kg of grain a head a year, they need **~242 t of grain a year**.

**What the house grows itself.** The grain strips and terraces are ~37 ha. With a fallow year, about half is in crop:
18.5 ha × ~1.35 t/ha ≈ 25 t, less a sixth kept for seed ≈ **21 t, about 9% of need**. The build's own figure, "a
quarter", is computed against the old 550 residents (`src/40b-ls-farms.js`, `F.HOUSE.residents`; see section 5).

**The gap is ~220 t a year, and it cannot come by caravan.** The nearest Xanadu city, Qiblai, is 568 km away by the
planned link. That is about 23 days for a pack train at ~25 km a day. Over that distance the animals eat a large part
of what they carry. Pre-modern land transport rarely moved grain beyond about 150-300 km, so caravans carry only
high-value goods:
- salt, iron, tea and gold come in;
- books, paper, silk, saffron and lenses go out.

**Longsong must be fed by its own valley.**

**What a highland village gives.** On the isle demo's rule of 0.75 ha in crop a hand, a household of 6 has 2 hands:
- harvest: 1.5 ha × 1.3 t/ha ≈ 1.95 t;
- seed: 0.33 t;
- eaten: 1.08 t;
- left over: **~0.55 t surplus a household, about 28% of the harvest** *est.*

So a farming village of 220 (40 households) has ~22 t to spare. Dzo and yak butter, cheese and meat replace part of
the grain in tsampa and butter tea; take dairy as ~20% of the Order's food. The grain to find is then ~175 t.

| If the tithe takes | Farming villages needed |
|---|---|
| all of the surplus | 8 |
| two thirds (the rest sold, or kept against a bad year) | **12** |

**Proposed ring: 3 → 15 hamlets.**

| Kind | Count | People | Role |
|---|---|---|---|
| Farming (Shar, Nub + 10 new) | 12 | ~220-240 each, ~2,800 | grain, beans, frostroot, flax; the tithe |
| Herding (Dzo-ling + 1) | 2 | ~150 each, 300 | dzo and yak: butter, cheese, wool, dung fuel, meat |
| Specialist | 1 | ~150 | mulberry, silk and paper bamboo (feeds the Printing House and the paper mill) |
| **Ring total** | 15 | **~3,250** | with Longsong, the valley is ~4,600 |

- **Land is not the limit:** 12 villages × ~60 ha in crop plus fallow is ~15 km² *est.*, a small share of the valley's
  good farmland.
- **Labour is the limit:** the ring must hold ~2.4 farmers for every person in the house.
- The villages sit 3-12 km out, the way the region's rings already do: a day's walk, so the harvest labour the house
  calls on can come in and go home.

**The flows the sim would carry:**
1. Each farming hamlet's OUT road carries a **tithe share** of its grain to Longsong, not everything it makes.
2. Its IN road carries back what the Order gives: prints, tools from its smiths, salt resold from the caravans, a
   healer's or a teacher's day.
3. The herders' roads carry butter, cheese and wool in, and grain out at the herders' own rate.
4. A Xanadu caravan of 24, monthly, brings salt, iron, tea and gold leaf. It carries out books, paper, silk, saffron
   and lenses, the Keepwell operatives' contract fees, and the archive's fees.
5. **The grant of fealty and the grants of esteem** (the owner, 2026-11-11). In theory the Order leases the valley from
   the Sultan of Xanadu; in practice it runs its own affairs.
   - Each year the Order sends the Sultan a **grant of fealty**, a fixed bill of goods.
   - The Sultan answers with **grants of esteem**: gold leaf, silk, titles and coin.
   - The exchange is bound by tradition, so it barely changes from year to year. The sim books it as a **scheduled,
     fixed transfer** both ways, never priced and never answering scarcity: a yearly table of goods out and goods and
     money in.
   - It is one way the two trade, but it is the inflexible way. The caravan's market trade is the flexible one.
6. The monastery itself makes nothing on most posts (temple-kind places). The mess feeds residents from the store, as
   the refugee camps do (`47r`).

**Caravan volumes to check** *est.*, for a valley of 4,600:

| Good | Rule | Per year |
|---|---|---|
| Salt | ~5 kg a person + the herds' salt | ~25-30 t |
| Iron | ~1 kg a person | ~5 t |

About 35 t a year is roughly 1 t per monthly caravan per animal-train of 10. The scale model says the region has no
coal. Iron is rich only ~390 km west. Salt within reach still has to be found on the geology (Qiblai lacks it within
30 km).

**Seasons matter here:**
- one grain harvest (late summer at 2,000 m);
- storage that must carry the house through winter and spring, which the governor's reserve and the granaries
  (5 per farming village) express;
- the herders moving up to summer pasture.

The balance test should run a year, not a week.

**Where it runs** (the owner, 2026-11-11): Longsong moves onto the open world's ground. A new region,
**`openworld/oidong-highrift`**, is cut from the Oidong Valley and the High Rift (out of the 1,740 km Xanadu region). Its
ring and the Singing Gjár outpost are planned there as KSITES records, and the Longsong page's census and plan read
them.

### 2a. The Singing Gjár outpost

The Order's house in the High Rift, ~690 km east of Longsong by the beck and the graben staircase.

**The site** (`biomes/highrift/PLAN.md`, station 5; sampled on the region's page):
- 5.1 px 1572,1643 (region frame 762, 148 km), on the plateau at **3,680 m**;
- Dsb/ET, **220 mm**, a mean of **+2 °C** (warm month 15, cold month -11, nights to -21), 1.01 atm;
- the master gjá runs through it, and **Verdigris Beck rises** in its floor 4 km west (3,626 m), in gin-clear water;
- vent 91, a geyser with hot ground, is 4.5 km east-north-east (3,894 m);
- the fissures' walls are lined with chalcedony, opal, bladed quartz and amethyst, and they **sing in the wind**;
- the bake puts copper, gold, silver and sulfur here: an epithermal field.

**Why the Order is there** (*proposed*, the owner to settle):
- a **listening house**: the singing heard and recorded, as the History Monks record everything;
- the **crystal works** that feed Longsong's lens house: optical quartz and chalcedony are what a lens house needs, and
  the gjár is where they grow;
- the High Rift is Fellgang summer country (PLAN section 7, *proposed*), so the house also **keeps the peace of the
  vugs**: the offerings the Fellgangs leave in them are not taken, and the vein camp works only fissures that no longer
  sing.

**The complex, ~350:**

| Group | People | Notes |
|---|---|---|
| Monks | 200 | the listeners, the scribes, the lens grinders' masters |
| Novices | 40 | |
| Elders | 10 | |
| Lay servants and artisans | 60 | kitchen, smithy, lens grinding, bindery |
| Wardens | 25 | the road and the fissures' edges |
| Guests | ~15 | Fellgang visitors and pilgrims, in the guest hall |

**Its form:**
- on the plateau's lee at the gjá's lip, out of the prevailing wind but within hearing of it;
- battered stone halls in the Xanadu-and-chapterhouse style Longsong uses;
- a listening gallery cut down the gjá's wall to the singing fissures;
- warm cisterns fed from the beck's seepage;
- a sinter-walled greenhouse terrace on the vent's hot ground.

**Two monastic work camps:**

| Camp | People | Where | What it gives |
|---|---|---|---|
| **The Beck Fields** | ~90 lay brothers | down the beck's first ~10 km below the plateau (3,600 → 3,300 m), plus the vent's warm terraces | irrigated barley terraces (the beck's water; the warm seepage lengthens the season); greenhouse greens; a yak herd of ~250 on the plateau's tussock in summer; dung fuel |
| **The Vein Camp** | ~50 | the dead fissures of the swarm, north-east of the gjá | optical quartz and chalcedony (for the lens house), sulfur from the vent's sinter, copper salts (verdigris, an ink pigment), trace gold and silver for gilt, amethyst |

**Its balance** *est.*:
- 490 people need ~88 t of grain-equivalent a year.
- The herd's dairy and meat give ~35% at this height (the Tibetan high diet), leaving ~57 t of grain.
- The Beck Fields at ~1 t/ha irrigated, ~55 hands × 0.75 ha ≈ 41 ha in crop, less seed: ~34 t, **about 60%**.
- The remaining ~23 t comes up from the Mirror Graben: the region's mildest ground, Dfb at +12, 3,017 m, ~285 km west down
  the beck. Fellgang herders and the Mirror's growers carry it, paid in sulfur, copper salts and crystal.

**Its link to Longsong:**
- the 690 km road is for crystal, lenses, books and people, a pack train twice a summer;
- not for grain, by the same rule as Longsong's own.

**The sim reads it as:**
- a settlement with a `parent` (Longsong) and its own economy;
- two work camps as hamlets on OUT and IN roads;
- the Mirror's grain as a market trade;
- the crystal as an export to Longsong's lens house.

## 3. Pinnacle Rock: the balance

**Who eats.**
- **The town:** **3,000** (the owner, 2026-11-11), on ~600 buildings and ~120 streets.
- **The bands:** the 9 floor bands bake to 409 people with 258 mounts. The 9 upper grounds (flyers) are perhaps ~400
  more. That is ~800 people at home in the wet season.
- **Total:** ~3,800 people, needing **~680 t of grain-equivalent a year**.

**What the rock grows.**
- The floor ring is ~70-90 ha on 6 terraces of fonio, millet, pigeon pea and gourds, plus paddies and orchards.
- At ~1 t/ha with one monsoon crop, plus gardens, beetle pens and orchards, that is **~100-150 t, feeding ~600-800**
  *est.*
- The region is poor farmland: mean 0.27, good on 800 km². The best spots score 50-63%.

**The gap is ~550 t a year, about 80% of need.**

**The mounts are the hidden cost.** Of the 258 floor mounts, about 110 are meat-eaters: raptors, tigers, spiders, and
the dragonflies if they hunt. Their meat comes from **both the wild hunt and kept herds** (the owner).

Every mount's appetite is cut by a third for playability: **the low-gravity payoff** (the owner, 2026-11-11). A
predator of this size would eat ~4 kg of meat a day; the sim's figure is **~2.7 kg**, so **~107 t of meat a year** *est.*
The cut is one constant in the Beast Rider tune table, applied to every mount kind's fodder and meat. The ~145
grazers (threehorn, hardshell, longcrawler, staghorn, mammoth) browse far more than a band's 4-12 ha pens hold. This
is the economic reason the bands roam: a band cannot feed its beasts at home all year.

**Proposed shape: a market and garrison town fed by four streams.**

| Stream | Share of the town's food *est.* | How |
|---|---|---|
| The floor ring | ~20% | the existing terraces; a governor-run farm economy |
| Floor clearings | ~20% | 3-4 new farming hamlets of the ground tribes in jungle clearings within ~10 km (core/hamlet, a `beast-rider` row) |
| The bands at home | ~20% | meat, hides, gathered fruit, beetle protein; traded at zero distance while RESIDENT (core/camp's owner's answers) |
| The bands' dry-season haul | ~40% | grain, salt and iron carried home from far lands: bought with beasts, hides and escort fees, or taken in raids, or paid as tribute by those the Wings protect |

**A band's year as the sim would book it** (a band of 50 with 30 mounts, half of them meat-eaters) *est.*:

| Item | Per year |
|---|---|
| Its people | ~9 t grain-equivalent |
| Its meat-eating mounts | ~15 t of meat after the low-gravity payoff (~70 large kills, or a share of a kept herd): steady hunting, home or away |
| Its share of the town's import | ~550 t ÷ 18 bands ≈ 30 t brought home |

The proof to pass: across a year, every band's hunt, trade and loot cover its own needs plus its share, and the town
never goes short past its reserve. A failed season should show (unrest, a raid that goes badly), not be hidden by the
dole.

**Where the haul comes from** (the owner, 2026-11-11). The bands range around Pinnacle Rock itself. Their ventures, in
the sim's terms:

| Venture | Kind | Against or with |
|---|---|---|
| Raids | C7 raids, with balance caps (risky; a failed raid costs beasts and riders) | **Goto**, Iziz's nearby port; or south to **Nusidi** |
| Trade | land caravans (C6), market trade at each end | the other Beast Rider cities: Girder, Mav's Refuge, Talon, Fort Kreia, Fort Ordo |
| Long-distance trade | a few long caravans a year, high-value goods | the **coyotemen** and the **Dasri** |
| Everything else | not simulated as carriers: the far market as an import/export route at a mark-up (`carriers` from a map edge, as the isle demo's foreign ships) | intermediaries |

So the sim needs:
- real carriers on two kinds of road: raid paths to Goto and Nusidi, and caravan roads to the Beast Rider cities and the
  long-distance partners;
- an off-map intermediary market for everything else.

The open world's link roads are that graph (`core/world/48s` `LINK`: points, length, grade, inns every 25 km). The Iziz
cluster's links between Mav's Refuge, Girder and Talia already exist.

## 4. The build, in order

| Phase | What | Size | Blocks |
|---|---|---|---|
| **S0** | **Lift the region host** out of `settlements/isle-demo/src/40-49` into a shared module (places, roles, hamlet wiring, herders, money hooks, the week checks), driven by a culture tune table. The isle tests come out byte-identical. | large (several sessions) | both |
| S1 | **Seasons in the sim:** recipes, yields and herd moves read `KCLOCK.season`; a year test at the abstract level | small-medium | both |
| S2 | **Culture tables:** the Xanadu highlands (frost oat, emmer, frostroot, beans, dzo dairy, wool, tea, salt, paper, silk; from kits/crops `forBiome`); the Beast Riders (meat, hides, beasts, beetle protein, fonio, millet); the Xanadu ranch's pending pens, corral and dairy drawn | small-medium, data | both |
| S3 | **Longsong on the sim:** the 15-hamlet ring (region spec and the page's `40h`); the tithe share on the OUT roads; the Order as a non-producing house with a mess; the monthly caravan; the grant of fealty and grants of esteem as a fixed yearly transfer; the new region `openworld/oidong-highrift` cut, with the Singing Gjár outpost and its two work camps; a year's balance test; fix the residents count | medium-large | — |
| S4 | **Beasts as consumers and capacity:** fodder and meat per mount kind (from `BR_CAMP`), pack capacity per beast | small-medium | Pinnacle, caravans |
| S5 | **Land logistics from the open world's links:** per-leg minutes from `length_m` and grade, inns as stops, multi-hop paths | medium | Pinnacle's ranging |
| S6 | **Bands as actors** (core/camp C3 world tick, C4 hand-over, the band economy: hunt, herd, trade tent; C6 caravans; C7 raids with their balance caps) | very large | Pinnacle |
| S7 | **Pinnacle Rock on the sim:** the page rebuilt at its open-world site; the population fixed; the ring and 3-4 clearings; 18 bands home in the wet season and ranging in the dry; a year's balance test | large | — |
| S8 | **Hardening for dependent towns:** famine consequences, migration, money that limits, M5 tribute and excise | medium | not blocking |

Longsong can be on the sim after S0-S3. Pinnacle Rock needs S0-S7.

## 5. Things to fix on the way

**Longsong:**
- `F.HOUSE.residents` is 550 (the old "about 200 monks" blueprint), but the house holds 1,344.
- The roles sum to 1,494 with the festival folk.
- Dzo-ling's ceiling is 160 in the spec, but its census says 145.

**Pinnacle Rock:**
- It stands at two sites: the page is at map 4.21 px 755,351, the open world at 5.1 px 1007,686 since 2026-11-10.
- LORE.md:345 still gives 3,000 mm of rain and 500-600 m of height, against the page's corrected ~1,380 mm.

**The bands:** Mammoth (33) and Dragonfly (34) bake below the 40-person band floor, and the census test checks only the
Raptor programme.

## 6. The owner's answers (2026-11-11)

1. **Pinnacle Rock is 3,000.**
2. **The bands range around Pinnacle.** They raid Iziz's nearby port **Goto**, or go south to **Nusidi**. They trade with
   the other Beast Rider cities, and long-distance with the **coyotemen** and the **Dasri**. Most other long-distance
   trade goes through intermediaries.
3. **The meat-eaters eat both the wild hunt and kept herds**, and every mount's appetite is cut by a third: **the
   low-gravity payoff**.
4. **Oidong leases the valley from the Sultan in theory but runs its own affairs in practice.** Its yearly **grant of
   fealty** to Xanadu is answered by the Sultan's **grants of esteem**: a fixed exchange bound by tradition, one way the
   two trade, not flexible.
5. **Longsong moves onto the open world's ground.** A new region is cut from the Oidong Valley and the High Rift, with the
   Order's outpost at **the Singing Gjár** up there: a monastery complex of about 350 with two monastic work camps
   (section 2a).

**Still open:**
- On the scale model (`60-settlements.js`), measured from Pinnacle Rock's open-world spot at 5.1 px 1007,686:

  | Place | Type | 5.1 px | Straight-line distance |
  |---|---|---|---|
  | **Port Goto** | village | 918,698 | ~180 km west |
  | **Nusidi** | ruin (lived in?) | 996,870 | ~370 km south |
  | **Coyote Canyon** | village; the coyotemen? | 1265,500 | ~640 km north-east |

  The **Dasri** have no settlement on the list. Where do they trade from?
- The Singing Gjár outpost's purpose. The listening house and the crystal works are this proposal's reading; no lore text
  was found.
- The new region's exact cut (`openworld/SITES.json`). It could keep the Mirror Graben and the beck road whole, so the
  outpost's grain trade stays inside it.
