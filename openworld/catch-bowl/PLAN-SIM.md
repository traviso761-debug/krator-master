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
| **`BOWL_TUNE`** (`bowl-tune.js`, new) | the Bowl | 25 *proposed* (Jabal is a city) | to write |
| **`STALKER_TUNE`** (`stalker-tune.js`, new) | the Stalker Range | 10 *proposed* | to write; the smallest tune in the repo by design |
| `EAST_RIFT` (`east-rift.js`) | all of it, with Xanadu and Longsong | per tune | gains three joins |

**Why the Godsgate is not its own tune.** The SE outer wall has **one settlement** (Bāb al-Hawa) and no economy: it is
the Catch crossing's hardest three stages and its five tarns are finds, not places. It belongs inside `CATCH_TUNE` as
stops on the north road, where its legs can share the Catch's calendar and its carriers. Making it a tune would give it
books it cannot fill.

**Why the Stalker Range *is* its own tune.** Not because it has an economy — it has almost none — but because what it
emits (Stalkers) crosses into every other province, and because its one settlement answers to **Yuni**, a polity no
other tune here speaks for. A tune of four or five records is cheap; a faction's worth of predation buried inside
`CATCH_TUNE` is not.

## 2. The Godsgate on the Catch's tune

The north road today runs from each group's off-map pool to Kolli in one long leg. With the SE outer wall cut, it
becomes stages on real ground (`PLAN-TERRAIN.md` section 5a: a carved thalweg, 2,284 to 3,739 m, median grade 1.1 %).

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
| **Mantis** | `slw9dufqfs` | 1113,1164 | a town | an Iziz holding under Izani merchant houses: frankincense and resin, dates and figs from the walled gardens, the lake's shrimp-and-brine take, and **the grievance** — it buys its salt from the Train at Solta |
| **Solta** | `s0zgu7u6yb` | 1169,1150 | ~100-150 seasonal | the Train's Bowl works: rock salt 234, gypsum 253, 7 km from the lake, 112 km from Jabal |
| **Arcbeam** | `skz25tuq0w` | 1016,1058 | an arcology (question 5) | the Iziz road's last Imperial place before Parabola; the **north end of the collapsed Arcbeam-Stair base tunnel**, which is why the Godsgate exists |
| **Parabola** | `scyeauyek7` | 970,1186 | an inhabited ruin | the north road's mustering ground: where a train forms up, waters, and reads the water board before the pass |
| **The Izani-Dasri village** | `sq11desertw7` | 1042,1083 | a village | the Bowl's one farming place (question 6: it has no name) |

**Its goods**, beyond what `CATCH_TUNE` already names: dates, figs, frankincense, resin, hides, brine shrimp, and the
Bowl's own halite and gypsum. **Its calendar**: the pans in the cool months (as the Catch's), the monsoon in Mantis's
pocket (1,553 mm), the floor unworkable at +47 °C in high summer.

**The one structural change**: the Train of Jabal stops being a gateway pool and becomes a company with a home, two
works and two rounds (Solta > Jabal, and Jabal > Ṣalṭ al-Bān > Stair > the Twins > Strongbow). This is the biggest edit
to books that currently balance, and `test-catch.js`'s 29 checks must pass before the Bowl's are added to them.

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
| **People** | 350: a garrison, the rangers themselves, a smith, a surgeon, and the families |
| **What it eats** | everything, carried up the Stalker Gate from the Yuni valley: it farms nothing at 1,982 m in a 0 mm province |
| **What it sells** | **escort**. This is its whole economy, and the sim already has the pattern: the Brotherhood of the Two Horns sells guiding over the Twins and takes the Split Tally in two halves. The Rangers sell a sworn escort across the Stalker Gate and take a cut of what lands |
| **What it also sells** | **Stalker salvage** — the one place a hull, a harpoon mechanism or a power cell comes to market with a provenance. Buyers: the Geomancers, Yuni's Guild, the Yusar, Xanadu's engine-keepers (the same list `biomes/catch/PLAN.md` 6a gives for Stair's divers) |
| **What it buys** | arms, explosives (the owner's 2026-10-23 answer: a wise caravan carries them), grain, charcoal, medicine |
| **Its bounty** | `SIM.bounty` (`PLAN-RAIDS.md` R1): the Rangers post and pay the only standing bounty on Stalkers in the world |

**Why this is worth having.** It gives the Stalkers a **counterparty**. Until now they were weather: a loss rate on a
leg, with nobody on the other side of it. With Ranger HQ there is a faction whose income rises when the Stalkers are
active, whose escorts can be hired or refused, and whose bounty board is where a player's Stalker kill turns into money.
That is the difference between a hazard and an antagonist.

### 4b. Hub 01 — a source with no economy

`sodpa02bfv`, px 1344,1409, **4,351 m** (its plan's figure to the metre). A ruined arcology with **no polity, no people,
no goods and no trade**, run by a mad AI. The owner, 2026-10-23: **no human has reached it since the Cataclysm and lived
to tell the tale**, and *in the world nobody knows the Stalkers come from it*.

On the sim it is a **`SIM.site` with one output: pressure.** *Proposed*:

- a **faction `hub01`** with no settlement the player can trade with, hostile to everyone, allied to nothing;
- a **pressure number** (0..1) that sets how many Stalker triads are abroad, and where. It rises slowly and falls when
  triads are destroyed, so the Rangers' bounties and a player's kills **actually reduce the danger on the Catch floor**
  — which is the loop that makes the whole province matter;
- **no visibility**: the pressure number is never named in any report the player can read. What they can read is the
  Rangers' board and the caravaneers' talk. The design shows it, never says it;
- **a cap**: the pressure cannot be driven to zero. Hub 01 rebuilds. Nobody has reached it and lived.

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

### 4d. What the province does *not* get

No census beyond Ranger HQ's 350. No farms. No works except the abandoned Geomancer copper-and-rare-earth mine at the
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
| **S3** | `STALKER_TUNE` (section 4): Ranger HQ, Hub 01's pressure, the escort cut and the bounty | the escort's cut lands at Ranger HQ; destroying triads lowers the floor's losses; the pressure number appears in **no** player-readable report |
| **S4** | **C6**: all three into `EAST_RIFT` with Xanadu and Longsong | **one ledger** over five tunes; Xanadu's salt shortfall narrows but does not close; every tune's own tests still pass |
| **S5** | The census across the four provinces, for `openworld/PLAN-SETTLEMENTS.md` | the region's population agrees with the map's pins and Gemini's where the owner has not overridden them |

**The frames.** This region's cut has its own origin (*proposed* px [1194,1280]); `CATCH_TUNE` is written in Xanadu's
frame (`CATCH_TUNE.px` measures from px 1191,1569). `EAST_RIFT`'s existing offset trick handles it: the shared sites are
**Lasso and Bitta**, which both this region and region 2 cut (`PLAN.md` section 3). Nothing needs rewriting in Xanadu's
frame.

**The rule, as ever** (CLAUDE.md): a change to `core/simulation` keeps Voth's stocks proof, `test-sim.js` and the
baseline unchanged unless it is meant to move them. Every trade-code change C1 and C2 needed was made inert where
unused, and the same discipline holds for the escort cut, the pressure number and `SIM.outlaws`.

## 7. Questions for the owner

1. **Bāb al-Hawa's people.** Gemini's model says 320, which is more than Stair's 750 can be squared with for a camp in
   a 3,590 m pass that grows nothing. *Proposed:* **120** — the keepers of the caravanserai, the shaft's winch crew and
   the Brotherhood's or the Oasis Stations' hands — with the rest of Gemini's number being the caravans in residence on
   any given night. And see question 4 of `PLAN.md`: whether the place exists at all is still open.
2. **Ranger HQ.** It is Gemini's pin (2026-11-14), the same provenance as the two the owner dropped on 2026-11-16, and
   it was never put to them. *Proposed:* **keep it** — it is the only counterparty the Stalkers have, it gives the Yuni
   Emirate a presence on this map, and its 1,982 m valley is the one habitable spot in 255,000 km². Does the owner want
   it, and is 350 right?
3. **Hub 01's pressure.** Is a hidden, capped pressure number that the player can lower but never zero the right shape
   for the Stalkers' source? And should a player who reaches Hub 01 be able to change it — the owner's 2026-10-23 note
   says an Heir who used the Call there would be "either its master or its next subject".
4. **The Rangers' escort.** Is a sworn escort with a cut of the cargo the right economy for them, mirroring the
   Brotherhood's Split Tally on the Twins? Or are they a government garrison paid from Yuni, with no price on their
   service?
5. **The Stalker Gate.** It is not in this cut. It holds Ranger HQ too, and it is the pass network to Yuni, the Loom
   Chasms, the Slabfields and the Siphon Pits. Should its tune be this session's, a later region's, or Yuni's?
