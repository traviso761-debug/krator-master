# Politics: a draft (not built)

The political layer above core/simulation's unrest (77-sim-6-unrest.js, PLAN-MONEY.md M6): who rules a settlement, how
that changes, and the world's standing conflicts. A draft for the owner to argue with; nothing here is built. Lore names
are the owner's (LORE.md); where this draft proposes, it says so.

## 0. The owner's words (2026-11-03)

1. **The player is the main actor.** "Things should generally maintain a steady state, or at least not veer too far in
   one direction or another, until there is player intervention. There might be some things that are metastable (for
   example, Voth and Iziz trading Hook back and forth, Xanadu-Lizardman border skirmishes in the eastern rift) but
   overall it won't do for the player to spend their time venturing across the map somewhere to find a city in ruins."
2. **Militarized fronts:** Voth and Iziz over Hook; Xanadu and the Lizardmen in the eastern rift; the Eternians and the
   yetis for the Leng plateau; the Beast Riders and Iziz over Nusidi and Port Goto.
3. **Contests triggered between nations when the power differential grows wide enough,** such as: the Republic against
   Dilihan or Ardent, with or without Jimjam; the Hykkousoi against Voth; Voth against the Throne natives (if diplomatic
   influence fails); Dalab against the Tungangs (if desperate enough to try to break a strike); the SW highland natives
   against Dalab (if Dalab ever loses the annual duel); the unclaimed land between Jimjam and the Eternians as a flash
   point; the Free Giants against Dalab.
4. **Raid zones:** the Screamers against their neighbours; the eastern nomads against Iziz, maybe Yuni if relations
   sour; the Scyvoi against Voth and the Hykkousoi; the Painted Men against Shell and the Beast Riders; the Zeijani
   against the colonizers; the Fellgangs against southern Dalab.
5. **The drained dam basin and the floodlands** in general: a mix of settlers, outlaws, and those who skirt the line.
6. **Smaller gangs of bandits** that come and go fluidly in the more remote parts of the map.
7. **A raid's severity** (answering section 3, question 4): agreed, except that "the Screamers could potentially knock out
   Iziz's enclave ports if Iziz is already doing poorly".
8. **Risings under a leader:** "If the Scyvoi unite under a charismatic leader they could potentially destroy Drum or
   Pontus and open up more land for raids and migration; a Dasri leader could similarly try to take Verge or Mantis as
   capital of a new kingdom; abyss nomads might similarly try to take Verge or Locus. Fellgangs might try the same for
   Nulab. Odds of success will vary with faction strength."
9. **A rising's build-up takes months.** At most **two risings in the world at a time.**
10. **A destroyed city is resettled** by its neighbouring nations, "with much better success chance if by original owner.
    Player could be sponsored to help rebuild, or claim the site for themselves, which will piss off original owner and
    anyone who held it recently".
11. **Growth:** "We may need to come up with a way to grow cities to absorb refugees and accommodate pop growth. I'm a
    bit wary of this though because sudden pop shifts could have unpredictable cascade effects and I'm not sure I trust
    procedural city expansion" (section 4).
12. **Empty lots and upkeep** (owner, 2026-11-03): drawing the expansions is low priority, but most cities should show
    some fillable empty lots even while the player is there, which adds demand for timber, stone and other building
    materials; and building maintenance as a demand sink.

## 1. The model (proposed)

**No surprise ruins.** Irreversible: a settlement changing faction, a ruler deposed, a settlement sacked or abandoned, a
large share of its people lost. Most of these happen only with the player. The exceptions (section 0, items 7 and 8: a
rising under a leader, the Screamers against a failing Iziz's ports) can happen on their own, but only at the end of a
long build-up the world makes known, with its odds set by the defender's strength, so the player could always have
stepped in. (The owner's first rule, 2026-11-03, was nothing irreversible without the player; items 7 and 8 loosened it
the same day.)

- **A bowl for every settlement.** Each has a resting state (owner, ruler, people, its stocks about their targets). The
  world's own shocks (a blight, a bad season, a raid) push it up the side; its authorities push back in proportion to how
  far it has gone (relief, garrison, a tax pardon). Only the player can push it over the rim: directly (the granary
  burned, the governor killed) or by weakening the push back (the relief caravan robbed, the garrison bribed). The unrest
  stages (grumble, demand, strike, treason) are how high up the bowl it sits, and how little a push it needs.
- **Pressure carries its source.** Each push is the world's or the player's. On the world's alone, unrest stops short of
  treason and eases back; a stage past it opens only with some of the player's in it.
- **A standing crisis, not a ruin.** A settlement at the rim without the player holds there as a crisis, with its
  grievance named, and the news travels (rumour, a messenger, a notice in the next town); unvisited, it eases back on the
  authorities' terms (a crackdown, relief, a new governor) over a time to be set.
- **Contests are authored data:** each a small set of acceptable states and a dial between them, moving on its own
  within its bounds, which the player can push past. They are the world's life while the player is away; every change
  off-screen lands on a state the owner approved.
- **The push back's strength is the balance knob,** a nation's own: an unruly Iziz province easy to tip, the heart of a
  settled empire very hard. Too strong everywhere and the world is inert.

## 2. The kinds of contest (proposed shapes for the owner's list)

| Kind | The owner's | What moves on its own | Its bounds | The player |
|---|---|---|---|---|
| **Front** (always live) | Hook (Voth / Iziz); the eastern rift (Xanadu / Lizardmen); the Leng plateau (Eternians / yetis); Nusidi and Port Goto (Beast Riders / Iziz) | a line across a band of places that may change hands; for Hook, its owner on a long cycle with a visible build-up (garrisons, prices, refugees) | a handover changes flags, garrison, taxes, never the people; skirmish losses capped and replaced; the line stays in its band | hastens or holds a turn, or ends the contest for good (the one irreversible move, the player's) |
| **Latent war** (asleep until a trigger) | Republic / Dilihan or Ardent (+/- Jimjam); Hykkousoi / Voth; Voth / Throne natives; Dalab / Tungangs; SW highland natives / Dalab; Jimjam / Eternians over the unclaimed land; Free Giants / Dalab | wakes on its trigger: a power differential past a line, diplomacy failed, desperation (Dalab facing a Tungang strike: unrest's strike stage), an event (Dalab losing the annual duel) | awake, it is a front (above) with a peace that comes back after a time; the nations' power drifts only within a band on its own, so a war wakes rarely without the player | widens or narrows the differential, sabotages diplomacy or makes it, fights the duel |
| **Raid zone** (a border under steady pressure) | Screamers / neighbours; eastern nomads / Iziz (Yuni if relations sour); Scyvoi / Voth and Hykkousoi; Painted Men / Shell and Beast Riders; Zeijani / colonizers; Fellgangs / southern Dalab | raids at a rate in a band (core/camp's ventures: raids with balance caps), loot and casualties out, recovery in | a raid never takes a settlement; the rate and the losses capped, the defenders' recovery faster than the raids at rest | ends a band's camp, guards a road, joins a raid |
| **Frontier** (no owner) | the drained dam basin and the floodlands | settlers, outlaws and those between, local control shifting place to place | nobody holds it; settlement counts and the outlaw share in a band | settles (a player settlement outside core territory: no tribute), clears, rules |
| **Bandits** (fluid) | small gangs in the remote parts of the map | gangs form, move and break up | a density budget a region; a gang broken is replaced only slowly | hunts them, hires them |
| **Rising** (a people united under a leader) | the Scyvoi against Drum or Pontus (destroyed: land opened for raids and migration); a Dasri leader against Verge or Mantis (a new kingdom's capital); the abyss nomads against Verge or Locus; the Fellgangs against Nulab | a named leader appears among a raiding people when conditions allow, gathers the bands over months (raids grow, refugees, rumours, envoys), then marches; the outcome by the odds of the leader's strength against the defender's | rare (one at a time in a region, a cooldown after); every stage visible and long; a city taken stays a living city under its new rulers, a city destroyed leaves its ruin and its survivors somewhere | kills, joins, bribes or splits the leader; arms the defender; turns the march; or lets it happen |

The Screamers' raid zone takes the same build-up when Iziz is weak (its strength under a line): the raids on its enclave
ports grow over a season, and a port may be knocked out at the end of it.

## 3. Questions for the owner

1. **Can a latent war wake without the player at all,** or only when the player has widened the differential? The draft:
   it may wake, rarely, as a bounded front with a peace timer; conquest needs the player.
2. **The annual duel** (Dalab and the SW highland natives): its odds, and whether the player can be champion.
3. **How long a standing crisis waits** before it eases back, and whether one ignored leaves a mark (a harsher governor,
   a grudge that lowers the next rim).
4. ~~A raid zone's worst off-screen outcome, a rising's rarity and build-up, resettlement~~ (answered, section 0 items 7
   to 10). Still open: a rising's cooldown after it ends, and how long a ruin waits before a nation tries to resettle it.
5. **Fronts' cycles:** Hook's period (a season? a year?), and whether the other fronts turn at all or only skirmish.
6. **What the player's actions weigh:** a scale for the source tag (one assassination against a season of raids).

## 4. Population and growth (proposed, for the owner's item 11)

The aim: people can move and multiply without the city's plan changing under the player, and without a shift in one
town cascading through the others.

- **Refugees go to a camp first, not into the city.** A refugee camp is a core/camp camp pitched outside the town (tents,
  cook fires, a ration line). The layout of the city does not change. The camp's people are a class of their own in the
  town's happiness pool, fed by the town's relief (a cost to its treasury); they settle into the town as housing frees,
  move on to the next town, or go home when it is resettled. A camp is temporary by nature, so a procedural one is safe.
- **Flows are rate-limited and capped by housing.** At most a set share of a town's people may arrive or settle in a
  month; a town's housing is its cap. What a town cannot take stays in the camp or moves on, and growth past the cap
  leaves for the frontier (the dam basin's settlers). Births and deaths are slow. The damping is the cascade guard.
- **Empty lots fill in plain view, by building** (the owner's item 12). Most cities' plans keep some lots empty (cleared
  ground, a foundation, a pile of stone): authored, so nothing is invented at run time. A lot is filled by a building
  PROJECT, a record: the building's kind (one the plan already allows there), its bill of materials (timber, stone,
  thatch, rope, tools), its labour hours, and who pays (the treasury, or a household: a rise of station, 77-sim-6-money.js,
  could buy a lot as it buys a shop). The materials come out of the warehouses as the town's builders work, so the
  governor sees the demand and the lumber camp and the quarry answer it; the drawing follows the record's progress
  (foundation, frame, walls, roof), so the player can watch a house go up over weeks. A project waits when its materials
  are short. Housing pressure (people over housing, the refugees in the camp) orders projects; so does wealth.
- **Upkeep is a steady sink** (item 12). Every building wears by its materials (thatch fast, timber slower, stone slowest);
  keeping it costs a share of its bill of materials a year, booked as used. Neglected (the materials short, the treasury
  broke), a building shows its wear (a patched roof, a sagging porch) and gives its people less (housing a need, a little
  unhappiness), but off-screen it never falls to a ruin (no surprise ruins). Upkeep at rest should be within what the
  lumber camp's range gives back for ever (core/camp `KCAMP.workYield`) and the quarries' rates, so a town can keep
  itself.
- **New quarters grow by authored stages, not at run time,** and later (low priority, the owner): when a town's lots are
  full, an outer ring, then a new quarter, drawn by core/city at authoring time, reviewed by the owner and committed as
  data. A stage opens only while the town is unwatched, so the player comes back to find a new quarter, never sees one
  appear.

**The first pass is built** (2026-11-03: core/simulation 77-sim-6-build.js; the isles' `47b`, `32`'s empty lots, `60`'s
drawing; tests/test-isle-build.js). Three in a hundred of the isles' dwellings are left as empty lots (Kautoa 39, Valapo
12), each with a builder; a town keeps two projects going and spreads its builders over them. A house (1,200
worker-hours: timber 40, stone 2, mats 30; a longhouse 3,000) takes Kautoa's twenty builders about six days; the drawing
follows it (a cleared plot with its timber, stone and mats; the piles; the floor and the wall frame; the rafters; the
house). Every home wears its bill over three years: Kautoa draws about 32 mats, 2 stone and 43 timber a day (the timber
where the lumber village is: the open world), Valapo a third of that; the canoes carry Valapo its stone and timber, and
the governor keeps a stone floor. Twenty days without stone leave Kautoa 44 stone owed and two thirds of its houses
showing wear. **Not yet:** a finished house stands empty (the people to fill it are section 4's flows: refugees, growth);
workplaces do not wear; a household cannot buy a lot; the works are plain stand-ins for the islanders kit's own pieces.

**The second pass** (2026-11-04, the owner: building follows demand; the lots must last more than a year; streets outside
the gates, hamlet-size; a quarry for Valapo; the gaps; a construction kit of its own):
- **Growth fills the houses** (`growth`: 2% a year, a household of five at a time): a new household forms and moves into
  a finished house no one lives in, set up as the census's people are (dressed, its needs, its class, an empty purse); a
  town builds only while its houses ready or going up are fewer than two plus the households waiting, one house at a
  time, with a crew of its own (Kautoa 12 builders, about nine days a house; Valapo 6). Kautoa forms about 24 households a
  year, Valapo about 9: with the streets outside the gates their lots last 2.1 and 2.9 years.
- **Streets outside the gates** (`33`, laid out with the plan, closed; core's `onFull` opens the next when a town's empty
  lots are out): at most two a town, each a 72 m lane with up to eight lots on dry, gentle ground clear of the plan, off a
  gate's road (Kautoa: the East and South gates, six lots each) or carrying an outer dead-end street on (Valapo, which has
  no gates: six and six). Registered in core/tags from the start; drawn, with the lane as a dirt track, once open.
- **Valapo's quarry** (core/hamlet's new `quarry` focus; openworld 48's fifth village, on the island's high ground apart
  from the mine): 145 people, 10.6 km from Valapo, at 0.25 stone a worker-hour against Kautoa's 0.4, with a third of the hands.
- **Workplaces wear too** (`works`: every roofed place, a bill of timber 30, stone 4, mats 20 over four years): Kautoa
  keeps 1,613 buildings for about 38 mats, 52 timber and 3 stone a day.
- **The Construction kit** (`kits/construction`, KCONS: the plot, the materials piled by what is still on site, the
  scaffold rising with the walls) round the lot's own kit piece, which **core/city's `KCITY.constructMesh`** reveals in
  build order read off the piece itself (footing; then upward in bands, the frame before the infill; the roof last, eaves
  to ridge), with no line of the islanders kit changed. Built, the piece stays drawn by it.
**Still not:** a household cannot buy a lot; refugees (the camp first) are not modelled; on the city page (no lumber
village) a house's timber is gathered on the spot; the new quarters (low priority, the owner).

**The refugee experiment** (2026-11-04, the owner: a shipload of thirty a week, "to see how things develop"; the isles'
`47r`; Valapo watched, 180 days on the city page's [G data] half in node). Twenty-six ships, 780 people, none turned away:
- **Building is the bottleneck.** The camps grew without stop: Kautoa 295 people (59 households), Valapo 345 (69) by day
  180, against 95 and 45 housed. Kautoa's crew of twelve finishes a house in nine days or so, Valapo's six in twenty: a
  town houses one household a week or two while the ships bring three. At that pace Kautoa's lots (39, and 12 outside the
  gates) would last about a year and a half, Valapo's (12 and 12) run out at day 200 or so; neither street outside the
  gates had opened by day 180 (Valapo's two lots left would open the first soon after).
- **The ration breaks before anything else.** Every housed refugee household is two grown-ups with no work and three
  children: the chief's redistribution pays them a day's keep each from the treasury, with no wages paid in. Kautoa's
  ration fell from 94% of a full keep to 5%, Valapo's to nothing by day 120; the dole (purchases the treasury covers)
  doubled. The towns' own poor felt it: Kautoa's pool fell from 85 to 74 (still calm), Valapo's stayed near 81.
- **The refugees themselves are content** (83-93 in the camps: fed at the ration line, a modest hardship that fades), and
  the food held (the shortest food at 2.4-3.1 days throughout): the warehouses and the governor kept up.
- **What it suggests** (for the owner): put the refugees to work (the camp's grown-ups as builders, labourers, field hands:
  the crews double and so does housing), size the crews to demand (a town hiring builders when its camp grows), let the
  polity relieve a strained treasury (unrest's demands already ship goods; a grant of shells is the same machinery), and
  cap a camp lower so that ships turn to the other town or away (the cap, 400, was never reached).

**The refugees to work** (2026-11-04, the owner: "yes do so"). Every grown-up refugee joins its town's builders at
landing, paid as a builder; a town keeps a house going for every twelve hands (`build.crewPer`). The camp and the
streets outside the gates got their doors on the walking graph when the town is declared (a watched camp's people, walking
to work and back, had been unable to get home to eat). The 180-day run again: housing three times as fast (Kautoa housed
225 and Valapo 120 by day 105, against 95 and 45 by day 180 before), every lot and both streets outside the gates of each
town built by day 100, and then the camps filled again (165 and 270 by day 180) with the builders idle: Valapo's
treasury, paying idle builders and the ration, ran from 57,000 shells to nothing. The owner's next answer (2026-11-04):
the governor drafts the unemployed into WORK CREWS sent to nearby deposits the town lacks or can sell; a crewman in a tent
is unhappier and seeks a house, buys or builds one near his work, and moves on if he cannot; the hamlets may grow, by
empty lots, to twice their first size.

**Tents** (2026-11-04, the owner's first of the three): anyone whose home is a tent camp carries twelve points of
unhappiness while there (refreshed each midnight); a household 45 days in a tent whose people are on the mean under 70
happy moves on, out of the sim (the camp's count, the builders' posts and the books following). Sixty days of ships with
the refugees at work: the camps at 63-67 happy against the towns' 81-83, none yet past 45 days unhoused (the camps house
in the order the ships came).

**The countryside** (2026-11-04, the owner: move agriculture into the countryside, the requisite number of farming
hamlets; planned, not built): `settlements/isle-demo/PLAN.md` section 11 has the estimate (about 610 ha in crop and
2,400 ha farmed for the islands' 8,100 people, against 81 ha today) and the plan (the fields within the walls removed,
the farm ring left alone, about four farming hamlets for Kautoa and two for Valapo, a plantation each). The hamlets that
grow and the work crews (the owner's earlier three) come after, on the same machinery.
