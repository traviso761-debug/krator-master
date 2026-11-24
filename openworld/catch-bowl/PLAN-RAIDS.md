# Bandits and Stalkers against the caravans (plan, 2026-11-24)

Item 5 of the owner's brief: *"Implement bandits and Stalkers attacking caravans."* Everything is *proposed* unless it
quotes the owner or an approved scope.

## 1. What is already decided

**The bandits are designed and approved.** `core/region/BANDITS-PIRATES-BOUNTIES-SCOPE.md` (2026-11-22, status
`[APPROVED — RULINGS #90-94]`) gives ten regional bandit factions, a five-stage procedural lifecycle, a regional
`orderliness` number and the bounty mechanics. **Three of the ten are ours:**

| Faction | Country | Who they are | HQ and sub-camps |
|---|---|---|---|
| **BF-05 The Salt-Thirsters** (*Dust-Cloaks*), boss "Dry-Tongue" | the Imperial Bowl | sun-crazed ruined caravaneers and salt-pan debtors; **demand water, grain and salt before silver** | HQ: a collapsed Ancient culvert east of **Mantis** (1113,1164); subs on Talia-Mantis-Verge and at **Solta** (1169,1150) |
| **BF-07 The Tin-Skulls** (*Stalker-Mimics*), boss "Unit Zero-Nine" | the SE Basin and **the Catch rim** | high-altitude scavengers who rivet **Stalker scrap-plates** to their helmets and smear themselves in machine-wax, believing Hub 01's mechs see them as fellow machines | HQ: a buried fuselage near **Stair** (1106,1442); subs at the **Godsgate** (1028,1246), **Lasso** and the Qiblai-Locus road |
| **BF-06 The Glass-Eaters** (*Naphtha-Breathers*), boss "The Cracked Retort" | the eastern deserts and Mid Basin | rogue Yuni alchemist-apprentices fighting with naphtha fire-pots; hijack Geomancer kerosene, fireclay and sulfur trains | HQ in the Loom Chasms; subs on **Yuni-Stalker Gate** and the **Jabal** desert tracks |

BF-07 is the one that matters most, because it is a joke the world plays on itself: a gang that dresses as Stalkers on
the one road where the real Stalkers hunt. The scope's own note — *players wearing Ancient or cybernetic gear can bluff
them as "Senior Units", though real Stalkers attack both* — is the whole flavour, and it only works if the Stalkers and
the Tin-Skulls are both on the same road at the same time.

**The Stalkers are designed and half built.** The owner, 2026-10-23: quiet robotic killers in pairs or triads, about
human size, two variants (the harpooner with a pneumatic harpoon gun, the blade with blade-arms), hunting stragglers or
lying in wait under the sand; *"a wise caravan carries explosives, or more exotic Ancient weapons, to fight them; one
that does not flees"*. `kits/mechs` has `st_harpooner` and `st_blade` built.

**The attrition is already on the simulation.** `PROPOSAL-CATCH.md` C5 is done: through the valley host's `losses` and
`siteSeasons`, **the Stalkers take a twentieth of a train on one floor crossing in six — never the Geomancers', who
carry explosives**. That is the owner's ruling turned into a number, and it works today.

## 2. What is missing

| Gap | Where | Kind |
|---|---|---|
| **`SIM.outlaws`** — the lifecycle, the budding, `orderliness` | named all through the approved scope; **not in `core/`** | core/simulation |
| **`SIM.bounty`** — the bounty tiers and the named boss | same | core/simulation |
| **A raid whose target is a carrier, not a settlement** | `core/region/52-region-raid.js` raids *settlements* (`V.raids.targets`, each with people, garrison, militia, walls, stock) | core/region |
| **The Stalkers' buried pose and the harpoon's line** | `kits/mechs/KNOWN_ISSUES.md`, both open (pitfall P12) | kit |
| **The bandits' camps on this region's ground** | `KCAMP.outlawCamp` and `KCAMP.lookout` exist; no region places them | region |
| **The aftermath drawn** | `PLAN-SETPIECES.md` section 4 | region + core fixtures |

The third is the real design problem, and it is worth stating plainly: **the simulation can raid a town but it cannot
ambush a train.** `52-region-raid.js` is built around a target that stands still and has stock, a garrison and walls.
A caravan is a carrier on a leg with a cargo, a guard and a speed, and it is somewhere different every day. Bolting
"carrier" onto the raid targets would make a mess of a module that works; a sibling is cleaner.

## 3. The plan

### R1 — `SIM.outlaws` and `SIM.bounty` (core/simulation, from the approved scope)

Build what the scope specifies, no more: the five-stage lifecycle (`dormant -> foothold -> established -> pruned ->
shattered -> succession`), the HQ-plus-sub-camp topology, `region.orderliness` driven weekly by garrison standing,
`1 - unrest`, food stability and road distance from a walled seat, and the bounty tiers. Deterministic on
`KRAND.hash(seed, week, zoneId)`, as the scope says, never on a draw count.

**Opt-in and inert where unused**, as C1 and C2 were: every existing tune, `test-sim.js`, Voth's stocks proof and the
baseline must come out unchanged (CLAUDE.md). *Proposed* starting `orderliness`: the **Bowl 0.30** (the scope's own
"unpoliced Bowl 0.25-0.35"), **the Catch floor 0.35** (there is still **no ruler of the passes**, `biomes/catch/PLAN.md`
section 6, so the only order is each caravan group's own hands at its own well), **the Twins 0.55** (the Brotherhood
holds the pass and its oases, which is a kind of government), **Jabal 0.70** (a sheikhdom with a citadel).

### R2 — the ambush: a raid on a carrier (core/region, *proposed* `53-region-ambush.js`)

A sibling of `52-region-raid.js`, inert unless the valley spec has `ambushes`, so no tune changes:

- **A party** is an outlaw sub-camp (R1) or a Stalker triad (`PLAN-HAZARDS.md` section 6), with its own strength, its
  reach from its camp, and its appetite (BF-05 wants **water, grain and salt before silver**; BF-07 wants cargo and
  Ancient gear; the Stalkers want nobody's cargo at all — they take **people and beasts**).
- **A target** is a `SIM.trade` carrier **on a named leg**, which is what `CATCH_TUNE`'s rounds already are, with its
  cargo, its beasts, its guard and its days on that leg.
- **The roll** reads what is already there: the leg's own loss rate (C5), the party's strength against the guard, the
  season (a storm hides an ambush and stops a pursuit), and the leg's `orderliness`. One outcome of four: **passed**
  (nothing), **tolled** (the party takes a share and lets it go — BF-05's barrels of water buy it off, which the scope
  makes an explicit player move), **mauled** (cargo and beasts lost, people lost), **broken** (the train turns back,
  which is the owner's "one that does not, flees").
- **What it books**: the take lands in the party's cache (`ol_cache`), the loss comes off the carrier's cargo, the dead
  go in the ledger, and the leg's reputation drops — which is how `orderliness` and the merchants' route choice couple.
- **The caravan's answer**: a `guard` and a `kit` on the round (explosives, or exotic Ancient weapons). The Geomancers
  carry explosives today as a hard-coded exception in C5; R2 should make that a **field on the round**, so any group can
  buy the same immunity and the exception stops being special-cased.

### R3 — the Stalkers, drawn (`kits/mechs`)

Three items from the kit's own `KNOWN_ISSUES.md`, and they are item 5's real art work:

1. **A buried pose and a rising clip.** The lore's defining behaviour: lying under a hand's depth of sand until the
   last moment. A slumped buried idle, a sand-shedding rise, and the hull half-covered as a separate drawn state. The
   kit's note says the Ancients' hunters want the same slumped idle and rising clip, so one solution serves both.
2. **The harpoon's line.** `barb` flies alone today; the line that pins or drags the quarry is the weapon. A ribbon
   (`linewidth` is ignored — the skill's rule), anchored at the gun and at the hit, with a reel-in.
3. **The lopsided footprints**, so a triad's oriented boxes file correctly in `core/space` and the ambush's placement
   stops being wrong by a metre.

### R4 — the camps on the ground (this region)

`KCAMP.outlawCamp` lays a hidden band camp and `KCAMP.lookout` ranks a lookout by `sees x (1 - seen)` over the real
heightfield — both built, neither used by any region. With this region's roads laid (`PLAN.md` B3), each faction's camps
go on:

| Camp | Where | Notes |
|---|---|---|
| BF-07's HQ, the buried fuselage | near Stair (1106,1442) | an Ancient hull half out of a dune, the Tin-Skulls' wax-smeared plates nailed over it; its lookout must see the Stair road and not be seen from it |
| BF-07's subs | the Godsgate saddle, Lasso | the Godsgate sub is **the place, not the dropped pin** (pitfall P6): the saddle is still a saddle |
| BF-05's HQ, the collapsed culvert | east of Mantis (1113,1164) | an Ancient culvert in the Bowl's silt; the Mantis-Solta road its prey |
| BF-05's sub | Solta (1169,1150) | the salt-pan debtors' own works, which is why they know the shifts |
| BF-06's sub | the Jabal desert tracks | naphtha against the Train's salt trains |

Each camp is pitched **out of line of sight of the road** with two or three ray-marched lookouts that see it, by the
module's own score — which means the region's roads have to be laid first, and that a camp moves when a road moves.

### R5 — the aftermath, drawn (fixtures)

`PLAN-SETPIECES.md` section 4: where the simulation records a loss, the region draws it — a wagon on its side, a harpoon
line still in the sand, bones picked clean by nothing, half covered. This is the one place where procedural placement is
**better** than authoring, because it puts the evidence where the books say the thing happened. It wants
`48f`/`88f` (fixtures) and a reader on `SIM.tradeReport`'s losses.

## 4. The two dangers must not blur

The Catch's floor carries both a bandit gang that dresses as Stalkers and the Stalkers themselves. The design has to
keep them apart or both are wasted:

| | The Tin-Skulls (BF-07) | The Stalkers |
|---|---|---|
| What they want | cargo, Ancient gear, ransom | people and beasts; no cargo at all |
| How they announce themselves | loudly, in machine-voice ("DECLARE CARGO SERIAL NUMBER") | not at all: no tell, no tracks, no light (`PLAN-HAZARDS.md` section 6) |
| Where they are | a camp, a lookout, a road they prey on | under the sand, a stage out from an oasis, where the traffic is |
| How a caravan survives | pay, fight, or bluff them | keep together, keep the fires, carry explosives |
| What they leave | a looted wagon and witnesses | nothing, and nobody |
| Can they be found? | yes: the camp, the boss, the bounty | **no**: following one leads east, and nobody who has taken that road has come back |

A player who cannot tell them apart in the first hour and can in the tenth is the design working. **Both attack the
other**: the scope says real Stalkers attack the Tin-Skulls too, which is the cheapest possible way to show the player
that the mimicry is a delusion.

## 5. Order, and checks

R1 and R2 are core and should be one session of their own; R3 is a kit session; R4 and R5 ride with the region's B8.
R3 can go first and alone — the Stalkers' buried pose is useful to the Catch's station pages today.

Checks, each with a negative:

- **R1**: a faction's lifecycle is deterministic on (seed, week, zone) — the same run twice gives the same camps;
  `orderliness` 0.80 gives no HQ and 0.25 gives four sub-camps; killing the boss shatters the faction and a successor
  rises only after the cooldown. Every other tune's books unchanged (`test-sim.js`, Voth's proof, the baseline).
- **R2**: a train on the Stair-Bitta leg with no guard is mauled at the rate the leg's data says, and the Geomancers'
  with explosives is not; a storm season hides an ambush; the take appears in the party's cache and off the cargo; the
  negative removes `ambushes` from the spec and every book comes out as C5 left it.
- **R3**: a Stalker's buried pose leaves the hull under the sand's surface and its rising clip ends standing, with no
  clipping through the ground; the harpoon's line is anchored at both ends through the flight; a triad's three oriented
  boxes file in `core/space` without overlapping.
- **R4**: each camp is out of sight of its road (`seen` under its threshold) and its lookouts see over half the road's
  samples within reach; the negative puts a camp on the road and must fail.
- **R5**: an aftermath fixture stands where the simulation's loss was recorded, on the ground, nothing floating
  (`KRUINS.watch`); the negative records no loss and the floor is clean.
