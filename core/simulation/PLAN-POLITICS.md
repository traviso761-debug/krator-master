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
4. ~~A raid zone's worst off-screen outcome~~ (answered, section 0 item 7). Still open: a **rising's rarity** (one a
   region at a time? a cooldown of years?), how long its build-up lasts before it marches, and whether a destroyed city
   is ever resettled (by its survivors, the victors, or the player).
5. **Fronts' cycles:** Hook's period (a season? a year?), and whether the other fronts turn at all or only skirmish.
6. **What the player's actions weigh:** a scale for the source tag (one assassination against a season of raids).
