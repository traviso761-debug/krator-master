# The Catch, the Bowl, the Godsgate and the Stalker Range on the simulation (plan, 2026-11-24)

The owner, 2026-11-24: *"Include se outer wall and stalker range in the Sim as well."* This is the simulation side of all
four provinces in one place: what is already running, what each province adds, and how it joins Xanadu and Longsong.
Everything is *proposed* unless it quotes the owner or a settled plan. It replaces `PLAN.md` section 6, which now points
here.

## 0. What is already running

`core/simulation/PROPOSAL-CATCH.md` steps **C0 to C5 are done** (the owner, 2026-11-16: "begin implement the catch
according to plan, steps 0-2", then "Do c3-c5"). `core/region/data/catch-tune.js` (`CATCH_TUNE`) carries:

- **16 places**: Stair (690 plus the Brotherhood's house), Kolli (split between both Iziz houses), Arfwai, Bitta, Lasso
  (split between Yuni's Guild and the Geomancers), Ṣalṭ al-Bān, the Twins' six stations, the White Gills.
- **7 factions**: `stair`, `horns`, `order`, `train`, `geomancer`, `getmastarz`, `goldanda`, `yuniguild`.
- **The rounds**: each group's caravan as a `SIM.trade` round with `legs` of their own length, `provision` (water and
  fodder for the beasts at each stop), `halts`, `sells`, `forHalts`, `closed` and `maxDays`.
- **The cuts**: the Sultan's toll at the Strongbow lift, the Split Tally's gate half at Sinter-Gate and its shrine half
  at the Hall or the Brazier, its outbound half at the Brotherhood's Stair house, the margin at Qiblai.
- **The hazards as data**: the spring black storms close the Catch floor (year days 70-112); winter shuts the col to
  Route B (330-60); the Stalkers take a twentieth of a train on one floor crossing in six, never the Geomancers', who
  carry explosives; Arfwai's well recharges at 30 % in late summer.
- `CATCH_TUNE.join(XV)` puts the crossing into Xanadu's valley. `core/region/tests/test-catch.js`, **29 checks**.

**What is left is C6** (the join into `EAST_RIFT`) **and three provinces the tune does not know**: the Bowl, the
Godsgate and the Stalker Range.

## 1. The shape: four provinces, three tunes, one ledger

| Tune | Province | Scale (people an actor) | Status |
|---|---|---|---|
| `CATCH_TUNE` (`catch-tune.js`) | the Catch floor and the Twins | 10 | **done**; gains the Godsgate's stops |
| **`BOWL_TUNE`** (`bowl-tune.js`) | the Bowl | 25 *proposed* (Jabal is a city) | **its first half is built** (2026-11-24): `core/region/data/bowl-tune.js` declares the six places and `core/region/tests/test-bowl.js` runs them a year, 14 checks. `join` (the rounds) is still to write |
| **`STALKER_TUNE`** (`stalker-tune.js`, new) | the Stalker Range | 10 *proposed* | to write; the smallest tune in the repo by design |
| `EAST_RIFT` (`east-rift.js`) | all of it, with Xanadu and Longsong | per tune | gains three joins |

**Why the Godsgate is not its own tune.** The SE outer wall has **one settlement** (Bāb al-Hawa) and no economy: it is
the Catch crossing's hardest three stages and its five tarns are finds, not places. It belongs inside `CATCH_TUNE` as
stops on the north road, where its legs can share the Catch's calendar and its carriers. Making it a tune would give it
books it cannot fill.

**Why the Stalker Range *is* its own tune**, and why it grew. Not because the Range has an economy — it has almost none
— but because what it emits (Stalkers) crosses into every other province, and because its settlement answers to **Yuni**,
a polity no other tune here speaks for. The owner's decision to add the **Stalker Gate** (2026-11-24) gave that tune a
second province with breathable graben floors, a waystation network and a 500-strong garrison, so it now carries:

- **Ranger HQ** at 500, on a salary and a cut of expeditions (section 4a);
- **the waystation network** through the four-way pass, as stops with their own keep and upkeep (`PLAN.md` 2a);
- **the expeditions themselves**, which is the mechanism the owner's answer to Hub 01 implies: ventures with a backer, a
  share and a chance of not returning, which `SIM.found` and the bounty board already half-support;
- **Hub 01** (section 4b);
- **the convoy that feeds all of it** up 180 km of pass from the Yuni valley.

## 2. The Godsgate on the Catch's tune

The north road today runs from each group's off-map pool to Kolli in one long leg. With the SE outer wall cut, it
becomes stages on real ground (`PLAN-TERRAIN.md` section 5a: a carved thalweg, 2,284 to 3,739 m, median grade 1.1 %).

> **S1 is being implemented in this session (2026-11-24).** Four decisions the code makes, recorded here because they
> are judgements and not transcriptions:
>
> 1. **One new place, not three.** Bāb al-Hawa becomes a `CATCH_TUNE` place; **the North Threshold Sill and the Southern
>    Narrows do not.** An unpeopled stop buys nothing, sells nothing and makes nothing, so on the simulation it is only a
>    place to cut a leg — and the pass needs **one** cut, at the shelter. The Sill and the Narrows stay **drawn** halts
>    (`KWCAMPS`, the region's work, `PLAN.md` 2a), which is what they are: ground a train sleeps on when it mistimes the
>    pass.
> 2. **`forHalts` gains `fodder`.** It carried `grain`, `tea` and `tools` — the things a halt eats and the far town is
>    fed from behind. Bāb al-Hawa is the first stop in the region that **cannot cut fodder at all** (nothing grows at
>    3,590 m), so fodder has to ride for the halts or the caravanserai cannot water and feed anyone's beasts. That one
>    word is the mechanical expression of "every kilogram came up 2,400 m", and it is why the pass is dear.
> 3. **The whiteouts are a loss, not a closure.** Closing the Godsgate for its whole winter window would shut the
>    crater's only road to Xanadu for a third of the year, on top of the storms closing the floor — a swing in every book
>    that depends on the crossing, and more than the lore says. The rime-fog banks are **sudden**, not seasonal (80 km of
>    visibility to under 12 m in minutes), so they are a loss rate inside a window, and the crossing keeps its two real
>    closures: the floor's storms and the Twins' col.
> 4. **The God-Bore's rate is low *because the shelter is there*.** A nightly 80-130 km/h katabatic gale would cost a
>    train dearly in the open; what the leg's rate models is a train that reaches Bāb al-Hawa. A train that cannot is the
>    region's event, not a leg's average — the asymmetry the pass's whole economy rests on.
>
> Also: the four groups' home legs shorten by the 283 km from the pass to Kolli, so section 1c's recorded totals (Iziz to
> Stair about 1,232 km, Yuni about 1,415) are unchanged — the distance moves from one long leg into two. **The Train of
> Jabal does not cross the Godsgate**: it comes out of Jabal to Arfwai, so its round is untouched.

### 2y. What actually broke Goldanda: the serai had no fodder (2026-11-25)

**Section 2z below diagnosed this wrongly, and the stagger it recommended did not fix it.** Recording both, because the
wrong diagnosis was plausible and the right one is a rule worth not learning twice.

The symptom was real: `test-catch.js`'s C3 wanted both Iziz houses to land iron at Strongbow, and **Getmastarz landed
4.0 t while Goldanda landed 0.0 t**. 2z read that as the two rivals contending for the same pool at the same instant,
the owner chose the stagger, and the stagger was built. Then the numbers came back **byte-identical** — Goldanda 0.0 t,
Getmastarz 4.0 t, the tally figures to the kilogram — with `caravan.goldanda(off 24018)` against
`caravan.getmastarz(off 0)`, so the offset was being applied and was changing nothing. Identical output under a changed
input is the proof that the thing changed was not the lever.

What a probe of the joined year actually showed:

| | Getmastarz | Goldanda |
|---|---|---|
| Landed at Strongbow (`gate.iziz>sfgtxw10kr`) | `arms 43, iron 3990, pearls 8, oil 5095, salt 13979` | **the key is not there at all** |
| Landed back home (`sfgtxw10kr>gate.iziz`) | `goldwork 60, wheels 90, opium 1947` | `goldwork 9, wheels 13, opium 12539, cacao 18000` |
| The Twins' cut | `xan.citadel:iron 199`, `twins.sinter:iron 159`, `twins.hall:iron 159` | only return-leg entries |
| Beasts at year's end | 97, 100, 100, 200 | 97, 100, 100, 200 |

So **Goldanda's round runs**. Its carriers cross the pass, reach Strongbow, load there and come home full — the
unguided-crossing check passes on exactly those caravans, losing beasts on the Twins. What Goldanda never does is carry
anything *out*. One carrier was still in flight at the year's close with `iron 1995, salt 8283` aboard, eta 531,105
against the year's 525,600 minutes: it had finally got a load, too late to be counted.

**The cause was the stop S1 added.** Bāb al-Hawa was written with a well and *no fodder work at all*, on the reasoning
that nothing is cut at 3,590 m and the trains would carry its fodder as freight (`forHalts`). But
`core/simulation/77-sim-6-trade.js` draws the beasts' water and fodder **at every stop**, not only at halts — its own
words, line 175: *"the beasts water and feed whether or not the stop trades."* So a stop with no fodder work is a sink
that can never be filled, and the serai ended the year **321,624 kg short of fodder** while the trains hauled grain and
fodder up the pass as freight instead of trade goods. Of the two houses loading at one pool, the one that loads second
got what was left: grain for the halts, and no iron.

**The fix, and the lore it settles.** Bāb al-Hawa gets `fodder: 1000` (kg a day) — not a reed bed but **the serai's
barns**, hay winched and carried up 2,400 m and stacked through the summer, which is how a caravanserai on an artery
works. "Nothing is cut at 3,590 m" still holds; what was wrong was the inference that therefore nothing is *stored*
there. And `forHalts` drops `fodder`, so the trains stop hauling it as freight — capacity the trade goods get back.
1,000 kg a day carries the measured traffic with a little over, which leaves the Godsgate a bottleneck in a heavy year
without making it an impassable one.

**The stagger stays**, on its own merits and as the owner asked: two rival houses would not leave on the same hour, and
lockstep departure was an artefact whatever else was wrong. It is simply not what was starving Goldanda.

**The rule for next time:** in `SIM.trade`, a settlement put on a caravan's road is a place the beasts eat, whether or
not it trades. Every new stop needs a water *and* a fodder number, or it silently taxes every train that passes.

### 2z. A fragility S1 exposed, which is the owner's to settle

> **Superseded as a diagnosis by section 2y (2026-11-25).** The fragility described here is real and the stagger built
> for it is kept, but it was *not* what starved Goldanda. Read 2y first.

**The two Iziz houses run the identical round and can starve each other.** `test-catch.js`'s C3 check wants both to land
iron at Strongbow; with S1 in, **Getmastarz lands 4.0 t and Goldanda 0.0 t**. It is not a timing drift — measured, the
two are *exactly* alike:

| | Getmastarz | Goldanda |
|---|---|---|
| Round | 133 days | 133 days |
| Outbound to Strongbow | 67 days | 67 days |
| First arrivals | days 67, 100, 133, 167 | days 67, 100, 133, 167 |
| Pool | `gate.iziz` | `gate.iziz` |
| Share of Iziz's trade | .5 | .5 |
| The only difference | its Kolli well, `scatchkolli01` | its Kolli well, `scatchkolli01.goldanda` |

So the two rivals **depart at the same hour, on the same road, from the same pool**, and contend for the same cargo at
the same instant; which of them loads is then down to iteration order. Before S1 the check passed; the extra stop shifted
the phase enough for one house to take everything.

**This is a pre-existing fragility, not something S1 broke** — and it is also questionable world-building. The proposal
has the two houses *competing* for the same south-bound loads (`PROPOSAL-CATCH.md` section 2, "The rivalries"), which is
right; total starvation of one is not, and two rival houses would not in any case leave on the same hour.

**ANSWERED (the owner, 2026-11-25): "can we stagger house departures so they don't step on each other like that."**
Option (a), and it is built:

- **`SIM.trade` gains `offset`** (`core/simulation/77-sim-6-trade.js`): minutes before the *first* carrier's first
  sailing, beside the existing `stagger` between carriers. `R.offset == null ? 0 : R.offset`, so **a round without it
  departs exactly as before** — `node core/simulation/test-sim.js` passes unchanged, which is the house rule for any
  `core/simulation` edit.
- **`CATCH_TUNE` spreads the groups that share a pool** through one stagger: the i-th of n leaves i/n of the way
  through it. Only `gate.iziz` has two, so Getmastarz keeps offset 0 and **Goldanda takes 17 days of their 33-day
  stagger**; the Train, Yuni's Guild and the Geomancers are alone on their pools and are unshifted. Their arrivals at
  Strongbow now interleave — 67, 100, 133, 167 against 83, 117, 150, 183 — instead of landing on the same minute.
- **Two checks** cover it: the houses leave half a stagger apart while a group alone on its pool is unshifted, and
  **both houses land iron at Strongbow**, neither starved by the other. Each with a negative.

It is also the better world: rivals who leave on alternate schedules read as rivals, and lockstep departure was never
anything but an artefact.

The question as it was put, and the options weighed:

| | What it would mean |
|---|---|
| **a. Offset the two houses' departures** *(recommended)* | rivals leave on alternate schedules — a `phase` on the group, or simply different `stagger`. Cheapest, and truer than lockstep |
| **b. Give them different roads** | Getmastarz *are* the Gatemasters, so the Godsgate is theirs; Goldanda, "the bankers of the eastern road", might come another way. Richer, but it invents route lore the owner has not given |
| **c. Split the pool** | each house its own stock at Iziz, so contention is for the *market* rather than for the warehouse |
| **d. Leave it** | and loosen the check to "the two together land iron", accepting that in a given year one house may be shut out — which is arguably what a rivalry means |

Until it is settled, the C3 and C4 checks stay red, with this as the reason. ~~They are the only two failures of
`test-catch.js` that are not mine~~ — **wrong, and section 2y says why: they were mine too.** S1 put a stop with no
fodder on four groups' roads. The full tally of this work's own breakages, kept because the pattern is the useful part:
two hard-coded counts that moved when S1 added a place; five negatives written with their pair the wrong way round; one
assertion that demanded a windowed roll come up inside a single year; and a new stop given water but no fodder, which
cost a trade route and was then misdiagnosed as a rivalry.

### 2a. The stops it adds to `CATCH_TUNE.places`

| Stop | Px | Elev | People | Kind | What it sells |
|---|---|---|---|---|---|
| **Bāb al-Hawa**, the Vent-Shaft Caravanserai | the plan's +3,590 m, just south of the saddle (the pin wants moving: `PLAN-TERRAIN.md` P14) | 3,590 m | *proposed* **120**, after Gemini's 320 (question 1) | `caravanserai` (a new diet row: it farms nothing at 3,590 m and eats what the caravans bring) | **shelter** — the pass's only safe overnight camp, out of the 100 km/h God-Bore; fodder carried up; warm air from the shaft; and the divers' winch |
| **The North Threshold Sill** | 1026,1224 | 3,595 m | - | a halt, nobody's | nothing: a `KWCAMPS` halt where a train that misses Bāb al-Hawa by a day must sleep in the gale, at a cost |
| **The Southern Narrows** | 1035,1292 | 3,886 m | - | a halt, nobody's | the same, on the Catch side |

Bāb al-Hawa is the interesting one, and it is interesting because of **what a caravanserai sells that an oasis does
not**: not water (the Godsgate has snowmelt) but **survivable nights**. The sim already has the machinery — `provision`
draws water and fodder per beast per day, and `losses` takes beasts off a leg. A shelter is a place where the leg's loss
rate is **zero** and the fodder price is **high**, because every kilogram was carried up 2,400 m. That single asymmetry
is the whole economy of the pass.

### 2b. The legs it splits

`Parabola > Kolli` (one leg of 249 km today) becomes **Parabola > the North Sill > Bāb al-Hawa > the Southern Narrows >
Kolli**, four legs of 60-110 km each at the thalweg's grades. The caravans then spend nights where the ground says they
must, which is the thing `legs` (C1) and `provision` (C2) were built for.

### 2c. The seasons it adds

Three, each from `biomes/seouterwall/PLAN.md` section 2 and each a `closed` window or a loss rate on these legs:

- **The God-Bore** (nightly, all year): 80-130 km/h katabatic drainage two hours after sunset until after dawn. Not a
  closure — a **night cost**: a train caught between shelters loses beasts. `ATMOS.gale` already models it.
- **Winter whiteouts** (*proposed* year days 300-60): rime-fog banks drop visibility from 80 km to under 12 m in
  minutes. A **closure with a warning**, unlike the Catch's storms, which the simulation already shuts for.
- **The afternoon Salt-Draught** (all year, worst in the dry season): 45-75 km/h upslope gales carrying the Catch's
  alkali dust and the Bowl's ochre salt-haze up to the 4,500 m benches. A **cargo cost**, not a closure:
  `VOCAB.ambientKinds`'s `caustic-dust` row says "it etches what lies open: a cargo system takes its corrode dose", so
  this is where that dose lands.

### 2d. What it does to the books

Xanadu's imports from the north get **dearer and more reliable**: more stages, more provisioning bought, fewer beasts
lost to a night in the open. The first number to watch when C6 runs is whether **Xanadu's salt shortfall** (carried since
X1) narrows too far — the Godsgate's stops make the north road *work better*, and the Catch is supposed to be a barrier.
If it narrows past the lore, the lever is the fodder price at Bāb al-Hawa, not the loss rates.

## 3. The Bowl: `BOWL_TUNE`

| Place | Id | Px | People | What it is on the sim |
|---|---|---|---|---|
| **Jabal** | `sa5o6dvjdv` | 1225,1149 | a city (census from its page) | the Jabal Sheikhdom's seat; **the Train of Jabal's home**, in place of the off-map pool `gate.dasri`. Its works: the salt warehouses (*wakala*), the two caravanserais (*funduq*), the *birka* cisterns, the souq |
| **Mantis** | `slw9dufqfs` | 1113,1164 | **15,000 + 9,000 in its ring** (the owner, 2026-11-24) | the Bowl's **second city**, an Iziz holding under Izani merchant houses: frankincense and resin, dates and figs from the walled gardens, the lake's shrimp-and-brine take, cloth and tools, its own caravanserai, and **the grievance** — it buys its salt from the Train at Solta |
| **Solta** | `s0zgu7u6yb` | 1169,1150 | ~100-150 seasonal | the Train's Bowl works: rock salt 234, gypsum 253, 7 km from the lake, 112 km from Jabal |
| **An arcology TBD** | `skz25tuq0w` | pin 1016,1058 | **10,000 + 6,000 in its ring** (the owner, 2026-11-24) | the largest place on the north road after Jabal and a market the caravans trade at — not a marker to pass. **Not** the Bowl arcology, and **no tunnel runs from it**. **Arcbeam was here until 2026-11-25**, when the owner moved it to a real gorge 2,000 km away (`PLAN-SITES.md` section 7c, SETTLED) and left *"an arcology TBD of about 10k + hinterlands"* on the road. The census, the market and the road's role belong to the place, so they stand unchanged; only the **name** waits on the new model. `BOWL_TUNE` marks it `tbd:true` |
| **Parabola** | `scyeauyek7` | 970,1186 | an inhabited ruin, **the Bowl arcology** | the north road's mustering ground, where a train forms up, waters and reads the water board before the pass — and the end of the Ancient rail line's possible extension (the owner, 2026-11-11 and 2026-11-24) |
| **Esper** | `sq11desertw7` | 1042,1083 | a village | the Bowl's one farming place; named by the owner, 2026-11-24 |

**Its goods**, beyond what `CATCH_TUNE` already names: dates, figs, frankincense, resin, hides, brine shrimp, and the
Bowl's own halite and gypsum. **Its calendar**: the pans in the cool months (as the Catch's), the monsoon in Mantis's
pocket (1,553 mm), the floor unworkable at +47 °C in high summer.

### 3a. The census `BOWL_TUNE` starts from, and two conflicts in it

`openworld/populations-gemini.json` already carries a number for every Bowl place but one, so S2 need invent almost
nothing. The owner has overridden three of them since, and **two more disagree with this region's own site plans** —
those are for the owner, not for the tune to settle quietly.

| Place | Gemini | On screen | What else we hold | Verdict |
|---|---|---|---|---|
| **Jabal** | **15,000** | 14,151 | "a city", the Sheikhdom's seat | **use 15,000**: it is the only number anyone has, and a city of 15,000 fits `kits/dasri`'s urban register |
| **Arcbeam** | **10,000** | 3,369 | `PLAN-SIM.md` had it as "an Iziz arcology and a stop on the north road"; `PLAN-SITES.md` as "a marker, massing out to 30 km" | **CONFLICT (a)**: 10,000 people is not a marker. It would be the **largest place on the north road** — bigger than Stair's 750 and Mantis's — and a real market the caravans would trade at, not pass. Either the number comes down or Arcbeam gets a site plan and a market on the tune |
| **Mantis** | **300** | 584 | `PLAN-SITES.md` §4: an oasis **town**, an Iziz holding taken over by Izani merchant houses, three fabrics on one street, a merchant tower with its wind-catcher, a domed shrine, walled date and fig gardens, the frankincense trade; reach 25 km; the Bowl mantis named after it | **CONFLICT (b)**: 300 people cannot carry that programme. The owner's own lore makes Mantis the Bowl's one town; Gemini's 300 makes it a village |
| **Parabola** | 450 | 202 | the Bowl arcology, an inhabited ruin, the rail head and mustering ground | **use 450**: an inhabited ruin of 450 is exactly what it reads as |
| **Solta** | 400 | 377 | `PLAN-SITES.md` §8: "~100-150 seasonal" | *proposed:* **400**, of whom ~150 are the Train's seasonal rakers and the rest the works' own households. Gemini's is the fuller count |
| **Ṣalṭ al-Bān** | 350, polity **"Nomad Country"** | 325 | `CATCH_TUNE` already declares it: **120**, faction `train` | **`CATCH_TUNE` wins** — it is the owner-reviewed tune, and the Train of Jabal works the pans (the owner, 2026-11-16), not Nomad Country |
| **Stair** | 250 | 540 | **750** (the owner, 2026-11-16, in place of "a couple of hundred") | **the owner's 750**; Gemini's 250 is the superseded figure, and `PROPOSAL-CATCH.md` §0 already lists it as such |
| **Bāb al-Hawa** | 320 | **120** | **120** permanent (S1, the owner's answer C) | **120**, and Gemini's on-screen count is 120 to the person — independent corroboration that the other 200 are caravans in residence |
| **Ranger HQ** | 350 | 129 | **500** (the owner, 2026-11-24) | **the owner's 500** |
| **Esper** | *absent* | - | a village of the Empire of Iziz at 895 m | *proposed:* **220**, the size of the Catch's two largest oases together — the Bowl's one farming village, feeding itself and selling a little up the road |

**Both conflicts were ruled the same day** (the owner, 2026-11-24): *"mantis should be a lot bigger than 300, maybe
15000 + hinterlands. arcbeam can be 10k + hinterlands."* So:

- **Mantis is 15,000 in the town and 9,000 in the green pocket's gardens round it** — the Bowl's second city, which is
  what its programme needed. `kind: 'city'`, with its own caravanserai and repairs.
- **Arcbeam is 10,000 and 6,000 in its ring**, which makes it the largest place on the north road after Jabal and a
  market rather than a marker; `PLAN-SITES.md`'s "a marker, massing out to 30 km" is superseded. **Its site stays open**
  (`site: 'open'` in the tune): the owner wants it in a real canyon as a bridge, and there is none inside the cut, so the
  gorge is carved once B3 routes the road (`PLAN-SITES.md` section 7a).
- **The hinterlands are settlements of their own** at 200 people an actor, as `XAN_TUNE`'s countrysides are, each with a
  lane carrying its make down to its town and the town feeding back what the ring does not grow.
- `BOWL_TUNE.ruled` records both, with the owner's words, and the test asserts no place carries a `pending` flag any
  more — so nobody re-opens them from Gemini's file.

**The one structural change**: the Train of Jabal stops being a gateway pool and becomes a company with a home, two
works and two rounds (Solta > Jabal, and Jabal > Ṣalṭ al-Bān > Stair > the Twins > Strongbow). This is the biggest edit
to books that currently balance, and `test-catch.js`'s 29 checks must pass before the Bowl's are added to them.

### 3b. What is built (2026-11-24)

**`core/region/data/bowl-tune.js`** declares the six places in **Xanadu's frame** (`BOWL_TUNE.px` measures from px
1191,1569, as `CATCH_TUNE.px` does, so the two join the same way and `EAST_RIFT` can take both at C6), with:

- the goods, in two rows: the ones `CATCH_TUNE` also declares — restated so the tune stands alone in node, since the
  join merges the tables with `Object.assign` where a duplicate costs nothing — and the Bowl's own (dates, figs,
  frankincense, resin, hides, shrimp, fish, brick, timber, coffee, cloth);
- a diet by kind (`city`, `town`, `works`, `village`, `ruin`), everyone drinking hard because the floor reaches +47 °C
  at 1.83 atm, and salt the one thing nobody here lacks;
- a calendar of three windows: `pans` in the cool months as the Catch's, `monsoon` for Mantis's pocket, and
  **`deadheat`** — the floor's high summer, too hot to work at all, which no other tune in the repo has had to say;
- Jabal's **caravanserai wells and fodder yards**, because the Train's rounds have to set out from somewhere that can
  water them, and `kits/dasri`'s urban register gives Jabal two *funduqs*;
- the Train and Mantis's Izani houses **wary**, which is the salt grievance the owner's 2026-11-16 "Solta too" created;
- **`BOWL_TUNE.conflicts`**: the two census rows of section 3a, each carried at Gemini's number with a `pending` flag on
  the place, so the tune runs and the question stays visible in the data rather than only in a plan.

**`core/region/tests/test-bowl.js`**: a year of the Bowl (**8 settlements, 56,070 people** at one actor to 25 — the six
places and Mantis's and Arcbeam's hinterlands — about 100 s), **16 checks, every one with a working negative** — the six places declared and run; nobody short on their own make and a
400-day start; Jabal making a city's goods, Solta raking salt and gypsum, Mantis tapping frankincense and resin; the
pans worked only in the cool months and the dates only in the monsoon while a city's kilns run all year; Jabal's
caravanserais watered; the salt grievance wary; **both census rows ruled with no `pending` flag left**; and **each
hinterland a settlement at 200 people an actor with its lane down to its town**. Nobody goes short even at 56,070
people.

Left for S2's second half: `BOWL_TUNE.join` — the Train's rounds, Mantis buying its salt at Solta, and the north road's
stops at Arcbeam, Parabola and Esper.

## 4. The Stalker Range: `STALKER_TUNE`

**The province has no economy and must not be given one** (`PLAN-TERRAIN.md` P16: 0 mm of median rain, -22 °C median,
47 % over 8,000 m, two settlements in 255,000 km²). It has exactly three things on the simulation.

### 4a. Ranger HQ — the only settlement

`sz85a8i5js`, px 1420,1242, **1,982 m with water 2 km away**: a river valley on the province's eastern edge where it
meets the Stalker Gate. The map calls it a *"fortified Yuni Stalker-watch outpost supporting caravans through the
Stalker Gate"*, polity **Yuni Emirate**, Gemini's population **350**.

On the sim, *proposed*:

| | |
|---|---|
| **Faction** | `yuni` (the Emirate, not the Merchants' Guild and not the Geomancers — a fourth Yuni interest on this map, and the only one that is a government) |
| **People** | **500** (the owner, 2026-11-24): a garrison, the rangers themselves, a smith, a surgeon, the quartermaster's staff and the families. A fort with a village inside the wall, not an outpost |
| **What it eats** | everything, carried up the Stalker Gate from the Yuni valley: it farms nothing at 1,982 m in a 0 mm province. **This is the fact that sets its whole shape** — 500 people fed over 180 km of graben pass is a standing convoy, which is why the waystation network exists (`PLAN.md` 2a) |
| **Its income, 1: a salary** | the owner, 2026-11-24: the Rangers *"get paid a salary"* — a transfer from the Yuni Emirate, on `SIM.transfer`, which the sim already has (`77-sim-6-transfer.js`, as Xanadu's grants of fealty and esteem run). **This is what makes 500 people possible**: a garrison in a 0 mm province cannot live on fees, and a salary is also a lever the Emirate can cut |
| **Its income, 2: a cut of expeditions** | the owner: *"and also a small cut of an expeditions profits."* **Of expeditions, not of passing cargo** — which is the interesting distinction and not the Brotherhood's Split Tally. The Rangers do not toll the road; they take a share of what a venture into the Stalker Range brings back. So their income rises with **salvage**, not with traffic, and a rich season for the divers is a rich season for them |
| **What it also sells** | **Stalker salvage** of its own — the one place a hull, a harpoon mechanism or a power cell comes to market with a provenance. Buyers: the Geomancers, Yuni's Guild, the Yusar, Xanadu's engine-keepers (the same list `biomes/catch/PLAN.md` 6a gives for Stair's divers) |
| **What it buys** | arms, explosives (the owner's 2026-10-23 answer: a wise caravan carries them), grain, charcoal, medicine, timber |
| **Its bounty** | `SIM.bounty` (`PLAN-RAIDS.md` R1): the Rangers post and pay the only standing bounty on Stalkers in the world |
| **The waystations** | theirs to keep: the network's bothies, water tanks and fodder bins are a cost on their books, and the reason the salary has to cover more than wages |

**Why "a cut of expeditions" is the better design.** A toll on traffic would make the Rangers richer the more caravans
pass, which points them at the road. A cut of expeditions points them at **the Stalker Range** — they profit when
someone goes in and comes out heavier, so they outfit, guide and insure ventures rather than taxing trade. That puts them
on the same side as the player and on the opposite side from Hub 01, which is exactly where an antagonist's counterparty
belongs. It also gives `SIM.found` and the bounty board something to feed: an expedition is a thing with a backer, a
share and a chance of not returning.

**Why this is worth having.** It gives the Stalkers a **counterparty**. Until now they were weather: a loss rate on a
leg, with nobody on the other side of it. With Ranger HQ there is a faction whose income rises when the Stalkers are
active, whose escorts can be hired or refused, and whose bounty board is where a player's Stalker kill turns into money.
That is the difference between a hazard and an antagonist.

### 4b. Hub 01 — a source with no economy

`sodpa02bfv`, px 1344,1409, **4,351 m** (its plan's figure to the metre). A ruined arcology with **no polity, no people,
no goods and no trade**, run by a mad AI.

**What the world knows** (the owner, 2026-11-24): *"There is no trail towards hub 01. People who go that way tend not to
come back. Foolhardy rangers have brought back reports of an ancient facility there, but its function as stalker HQ is
surmised, not confirmed for them."* Three tiers, which the simulation must keep apart as carefully as the region does
(`PLAN.md` section 2b):

| Tier | Held by | Content |
|---|---|---|
| Rumour | the caravaneers | the Stalkers come out of the eastern peaks and go back into them |
| **A surmise** | the Rangers | **reports** of an **Ancient facility** out east, brought back by their own foolhardy; that the Stalkers come from it is their guess |
| Fact | nobody | it is Hub 01, and a mad AI runs it |

So `STALKER_TUNE` carries the Rangers' reports as a **rumour record with a confidence**, not a fact — the thing a player
can buy at the board, argue with, and set out to test. No tune, report or panel anywhere names Hub 01 as the source. The
owner's 2026-10-23 line still holds of **reaching** it: nobody has reached it and returned.

On the sim it is a **`SIM.site` with one output: pressure.**

- a **faction `hub01`** with no settlement the player can trade with, hostile to everyone, allied to nothing;
- a **pressure number** (0..1) that sets how many Stalker triads are abroad, and where. It rises slowly and falls when
  triads are destroyed, so the Rangers' bounties and a player's kills **actually reduce the danger on the Catch floor**
  — which is the loop that makes the whole province matter;
- **no visibility**: the pressure number is never named in any report the player can read. What they can read is the
  Rangers' board and the caravaneers' talk. The design shows it, never says it;
- **it resists attrition but it can be ended** (the owner, 2026-11-24): *"In theory an Heir or Yusar could change it, but
  could still be dangerous for them. A powerful PC with many relics and a large army with explosives could in theory
  take them down, if they figure out a way to get one way the hell out there."* So:

| | |
|---|---|
| **Attrition alone cannot finish it** | killing triads lowers the pressure; it recovers. A floor the player can push down and hold down with effort, never clear by grinding. Hub 01 rebuilds |
| **Route 1: the Call** | an **Heir or a Yusar** can *change* it — not merely destroy it — and it is **dangerous to them**. The owner's 2026-10-23 note is the shape: whoever reached it and used the Call "would be either its master or its next subject". So the outcome is a roll the player can load but not guarantee, and mastery is a live outcome: the pressure could be **redirected**, not only stopped |
| **Route 2: force** | a **powerful PC with many relics, a large army and explosives** can take it down. Not a raid: a campaign, with the three requirements named |
| **Route 3 does not exist** | there is no cheap way. The lock is partly the thing itself and partly **the logistics** — the owner: *"if they figure out a way to get one way the hell out there"*. Hub 01 is 255 km east of Stair across 255,000 km² at 0 mm of rain, -22 °C and 47 % over 8,000 m. **Getting an army there is the puzzle**, and the Stalker Gate's waystation network and Ranger HQ are the only infrastructure that could stage one |
| **What it means for the books** | `STALKER_TUNE` needs a `hub01` state with more than a number: `{pressure, state: 'active' \| 'mastered' \| 'dead', bywhom}`. A dead Hub 01 ends the Stalker losses on every leg in the region — which is a **permanent change to the Catch's economy**, and the single largest thing a player can do to these books. The Catch stops being the barrier it was built to be, and that should be felt: cheaper salt in Xanadu, and the Brotherhood and the Rangers both poorer |

**The design note that matters.** Because route 3 does not exist, the pressure number can stay hidden for the whole of
normal play and only becomes legible when a player is already mounting the expedition that could end it. That is the
right time for the world to admit what it has been doing.

### 4c. The Stalkers themselves

They already exist as loss data on the Catch's legs (C5). What the province adds is **where they come from and where
they go**, which `PLAN-RAIDS.md` R2 turns into ambushes:

- their triads are seeded over the Catch floor and the SE outer wall's eastern half, **weighted by distance from Hub 01**
  and by the leg's traffic;
- they transit the high snow-chutes and dry wadis of the eastern wall (`Loua Waita Guli`, `Waita Guli`, `Wādī al-Zulāl`
  — `biomes/seouterwall/PLAN.md` 2.5), so the SE outer wall's eastern half carries them too, not just the floor;
- they take **people and beasts, never cargo** (`PLAN-RAIDS.md` section 4), so their raids book as population and
  livestock losses, not as theft. No tune has modelled that before, and it is what makes them read differently from
  bandits.

### 4d. What the provinces do *not* get

No census beyond Ranger HQ's 500 and the waystations' keepers. No farms. No works except the abandoned Geomancer copper-and-rare-earth mine at the
Copper-Vein Tarn (`PLAN-SITES.md`: a find, with a wrecked Harpooner frozen in the aufeis beside an unlooted winch — a
ruin, not a producing site). No roads except the Stalker Gate's, which belong to a later region. No markets.

## 5. The five tarns are finds, not settlements

`biomes/seouterwall/PLAN.md` section 4 gives five hidden highland lake oases as *"rewards for off-road exploration"*. On
the simulation they are **nothing at all** — and that is the point. They carry no census, no works, no trade and no
stops. Two carry squatters who are deliberately outside the books:

- **Amber-Sinter Tarn** (1064,1272): free Talovolci prospectors and Dalab runaway mods wintering in the sinter caves,
  harvesting orange titanium glass and alkali sinter *without descending into the Catch* — i.e. **people avoiding the
  economy**, which is worth exactly one record and no ledger;
- **Copper-Vein Tarn** (1288,1184): the Geomancers' abandoned high mine, and a live Stalker pair on the moraine.

If a later session wants them on the sim, the honest hook is `SIM.found` (`47f-region-found.js`) — a place a player or an
NPC band *founds* — not a settlement the world started with.

## 6. The join: `EAST_RIFT` and C6

`EAST_RIFT` already joins `XAN_TUNE` (Xanadu, 50 people an actor) and `LS_TUNE` (Longsong, 10) by moving one plan into
the other's frame by the offset between a site both hold, prefixing one's calendar windows, and merging goods, factions
and relations. The three new tunes join the same way.

| Step | What | Check |
|---|---|---|
| **S1** | `CATCH_TUNE` gains the Godsgate's three stops, its four legs and its three seasons (section 2) | the 29 existing checks pass unchanged; a train that misses Bāb al-Hawa loses beasts and one that reaches it does not |
| **S2** | `BOWL_TUNE` (section 3), joined to `CATCH_TUNE`; the Train's home moves from the pool to Jabal | salt leaves Solta and Ṣalṭ al-Bān and reaches Strongbow and Qiblai; Mantis buys its salt from the Train; `test-sim.js`, Voth's stocks proof and the baseline unchanged |
| **S3** | `STALKER_TUNE` (section 4): Ranger HQ's 500 on its salary and its cut of expeditions, the waystation network's upkeep, Hub 01's pressure and state, the bounty | the salary lands and a cut of it does not depend on traffic; an expedition's share reaches Ranger HQ; destroying triads lowers the floor's losses and the pressure recovers; the pressure appears in **no** player-readable report; a `dead` Hub 01 ends the Stalker losses region-wide and the Brotherhood and the Rangers both lose income |
| **S4** | **C6**: all three into `EAST_RIFT` with Xanadu and Longsong | **one ledger** over five tunes; Xanadu's salt shortfall narrows but does not close; every tune's own tests still pass |
| **S5** | The census across the four provinces, for `openworld/PLAN-SETTLEMENTS.md` | the region's population agrees with the map's pins and Gemini's where the owner has not overridden them |

**The frames.** This region's cut has its own origin (*proposed* px [1194,1280]); `CATCH_TUNE` is written in Xanadu's
frame (`CATCH_TUNE.px` measures from px 1191,1569). `EAST_RIFT`'s existing offset trick handles it: the shared sites are
**Lasso and Bitta**, which both this region and region 2 cut (`PLAN.md` section 3). Nothing needs rewriting in Xanadu's
frame.

**The rule, as ever** (CLAUDE.md): a change to `core/simulation` keeps Voth's stocks proof, `test-sim.js` and the
baseline unchanged unless it is meant to move them. Every trade-code change C1 and C2 needed was made inert where
unused, and the same discipline holds for the escort cut, the pressure number and `SIM.outlaws`.

## 7. Questions for the owner — all answered 2026-11-24

Every one of these was answered on the day (`PLAN.md` section 12). Kept with its answer, since the reasoning behind each
is what the tunes have to encode.

1. **Bāb al-Hawa's people.** The place **stays** (the owner, 2026-11-24). Gemini's model says 320, which is hard to
   square with Stair's 750 for a camp in a 3,590 m pass that grows nothing. *Proposed:* **120** — the keepers of the
   caravanserai, the shaft's winch crew and the Oasis Stations' hands — with the rest of Gemini's number being the
   caravans in residence on any given night, which the simulation already models as halts. (`PLAN.md` question C.)
2. **Ranger HQ. ANSWERED (the owner, 2026-11-24: "Agree keep both"): it stays.** It is the only counterparty the
   Stalkers have, it gives the Yuni Emirate a presence on this map, and its 1,982 m valley is the one habitable spot in
   255,000 km². **Open:** whether Gemini's 350 is right (`PLAN.md` question D).
3. **Hub 01's pressure. ANSWERED (the owner, 2026-11-24): hidden, attrition-proof, but not immortal.** An Heir or a
   Yusar can change it at risk to themselves; a powerful PC with many relics, a large army and explosives can bring it
   down; and the logistics of reaching it are part of the lock. Section 4b.
4. **The Rangers' escort. ANSWERED (the owner, 2026-11-24): both, and neither is a toll.** *"They get paid a salary and
   also a small cut of an expeditions profits."* A transfer from the Emirate **and** a share of what ventures bring out
   of the Stalker Range — not a cut of passing cargo. Section 4a says why that points them at the Range rather than at
   the road, and puts them on the player's side. Their people: **500**, not 350.
5. **The Stalker Gate. ANSWERED (the owner, 2026-11-24): add it here**, with *"a network of waystations marking the
   trail through it"*. It joins `STALKER_TUNE` rather than becoming a sixth tune, because its one settlement is Ranger
   HQ and its traffic is the Rangers' own. `PLAN.md` section 2a lays the network.
