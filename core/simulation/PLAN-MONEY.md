# Money in the sim: research and a proposal (2026-11-02; the owner's answers 2026-11-03; **M0 built 2026-11-03**)

**M0 is built** (`77-sim-6-money.js`, SCHEMA.md "Money"; the isles' accounts: settlements/isle-demo `47m`, `tests/test-isle-money.js`):
currencies at a rate to the Talent, accounts with owners, mint, burn, pay and exchange, the ledger holding every settlement's money to
its books. **M1's first part is built** (2026-11-03, `m1` in the same module; the isles' `15` money.m1, `47m`,
`tests/test-isle-money.js`): prices at labour cost times a calibrated markup, wages at midnight for the rota's hours, every
purchase paid, the chief's redistribution (a ration for each member with no work, shared out of what the treasury holds
over a day's wages), the dole for what a household cannot pay. Money measures and limits nothing yet: the goods' economy,
the week test and Godot's export are unchanged byte for byte. Left of M1: spending by savings within a class's band, and
the rise and fall of a station.

**M2 is built** (2026-11-03, `m2` in the same module; the isles' `m2`, `47m` M2 checks): prices move each night by scarcity,
(target / supply line)^0.5 held to half and double of cost x markup and eased in over three days. **The redistribution is
on everywhere** (the owner, 2026-11-03: the ration is m1's default until households are true households; `ration: false`
turns it off). **The price level is built but off on the isles**, after what it did (below).

**M1's second part is built** (2026-11-03, `m1.spend`; the isles' `15` money.m1.spend, `47m` spend checks): each night a
household's savings in days of its keep, over `days` (10), set its people's wealth within their class's band (the class
stays: the household sits higher or lower in it), which steers the treats a wealth reaches and how often a meal is eaten
out; the treat's bar on the material meter falls by `treatDrop` (15) at a full purse; a treat or a meal out by choice is
bought only with money in hand, the purse checked again at the counter (several of a household wish the same day). On the
isles: rations 93-97% of a full keep (90-92% before), the dole 8-10%, no treat on it; half the households hold a quarter
of a full purse (ten days' keep), the top tenth half. Money now steers what people do: the week test's 32 checks still
pass (happiness 83, the material meter 34, was 36), and Godot's isle books were exported again and agree.

**M1's last part is built: stations** (2026-11-03, `m1.stations`; the isles' `15` money.m1.stations, `47m` station checks).
A household whose purse has held a vacant shop's price (10 days of its wage bill) and five days of its keep for three
nights buys it from the treasury; one of its workers rises to merchant (class middle) and runs it; the owned shop keeps
15% of what it sells and pays the treasury the rest wholesale, and its wages are the household's to cover; a household
that cannot cover them falls (the shop back to the treasury, the merchant a worker again, everyone of the household 25
less happy, fading over 30 days: `SIM.happinessAdd`, read by SIM.happiness), and the fall is counted by station. One rise
a life (`perLife`, two in the fluid nations). The happiness pool, collective and by class (`SIM.happinessPool`), is ready
for M6. On the isles over 20 days: 6 rises (shops at 1,980 shells), no fall, rations 93-99%, the price index within 5%.
No merchant princes on the isles yet: a trading house has no takings until trade by price (M3), so it would fall at once.
**M6 is built** (2026-11-03): first the abstract level was made to live its needs (a town nobody watches had its
people's meters run on whatever they were doing when it was lowered, so its pool sank: Valapo to 29 in 20 days); now
each person's day is lived by its schedule (77-sim-6-needs.js `SIM.needsAbstract`: the free hours as the resolver picks
them among the places within reach and open, a labourer's well trip, ten minutes on the way at each change, a meal at what
its household's last meals were worth), and an unwatched town holds steady near the watched one (Valapo 86 unwatched
against 80 watched over twelve days: fewer and shorter trips). Second, **hunger and thirst are vital** (`needs.vital`):
past 60 they cap happiness, to nothing at a full meter; a weighted mean had let a starving town sit at 70, content on its
other needs, and never riot. Then **unrest** (77-sim-6-unrest.js; the isles' `47u`): each midnight a town's pool,
collective and by class, eased into a level (over five days on the isles: the owner, a week to treason); under 50 the town grumbles (the watch's arrest odds x0.7),
under 40 it demands of the polity (one demand a town at a time, for every class in demand: a shipment of what it lacked
that the others can spare, else a new ruler, refused while there is no political system), under 30 a refused demand
brings strikes (half the strikers' workplaces held a day), under 20 treason (an event). A granted demand cheers the
asking people, a refused one angers them; a stage eases back five points over its line. **Proved on the isles** (tests/
test-isle-unrest.js): as they are, both towns calm (Kautoa 88, Valapo 86); a blight on Valapo (its food works held, its
warehouses spoiled, no food by canoe) leaves its households to eat their stores down: on day 10 it grumbles, day 11
demands rice and coconut (granted: Kautoa ships what it can spare), strikes on day 13, reaches treason on day 16, and
goes on demanding every five days; the books hold throughout and Kautoa stays calm.
**Waiting on the political system** (section 3, question 2): what treason does (a revolution, a faction thrown out or
invited back), a new ruler granted, the demands' answers by a faction's strength and will rather than by its stock.

**What moving prices taught** (the isles, eight market days, 2026-11-03):
- **Scarcity pricing alone is stable.** The price index stays within 5% of where it opened; Kautoa's dearest goods are its
  scarce quarry stone and kava (x1.4), its cheapest the meat and armour it has plenty of (x0.6); 23 of 23 goods point the
  right way. Rations run at 90-92% of a full keep, the dole at 10-11% of what is bought, the treasuries break even.
- **A price level against a flat wage spirals.** Raising the markup when the treasury takes in less than it owes (wages and
  full rations) drove prices up 5% a night, the cap, for eight nights (Kautoa's markup 10.6 to 14.9) without settling: each
  rise leaves more earners' households unable to pay, the dole grows (10% to 18% of what is bought), and food given on the
  dole is not takings, so the treasury stays short and the rule raises prices again. The gap it chases is households
  saving, and no price level closes that: a dearer everything only moves who is short.
- **So the gap wants**, in order: (1) M1's second part, spending that follows savings (a household holding more than its
  band's keep buys more, better, treats, a station), which is how saved money comes back; (2) then, if a price level is
  still wanted, wages that move with it (indexed), so it cannot outrun the earners. The flat wage stays until the owner
  says (2026-11-03).

**What the first run taught** (the isles, 2026-11-03): (1) households with no earner (children, elders, kin at home) are
half the people, so wages alone leave half of what is eaten on the dole: the ration (the chief's redistribution) fixes it,
the markup then set on the earners' own keep (a ration a dependant is then the mean wage of an earner); (2) calibrating
on the first days measures the opening restock's waves (30% over a normal day), so the market opens after a warm-up;
(3) the takings must reach the treasury before the payroll; (4) households save about a tenth of their income, so a fixed
ration drains the treasury: it shares out what the treasury holds over a day's wages (77-87% of a full keep), which M2's
moving prices should close. Kautoa's markup is 10.1, Valapo's 7.6: bread 20 and 15 shells, a stone tool 704 and 229.

The owner asked (2026-11-02) for suggestions on implementing and balancing money in the sim, after crime and the
thieves' guild showed what is missing without it: a pocket picked takes nothing, a fence pays nothing, the guild's stash
goes nowhere, and a person's wealth is a fixed number by class. This is a proposal for the owner's answers, not a plan of
record. Sources are at the end.

## 0. The owner's answers (2026-11-03)

1. **Currency: each nation has its own** (lore: LORE.md §6.2 and the open questions). **The Izani Talent is widely
   accepted by caravaneers and traders, and the player's purchases are made in it.** So the sim keeps an account per
   holder in its nation's currency, and a rate from each currency to the Talent: locals pay one another in their own
   money; a caravan, a ship's trader and the player pay in Talents, changed at the rate. The isles' own money is still to
   be named (proposed: Kautoan shell money; see section 2, M0).
2. **Class follows profession, not money.** But a person may **rise one station** when its resources are adequate:
   worker to merchant, merchant to merchant prince, merchant prince to true noble. A rise is a change of profession
   (a worker opens a shop; a merchant takes up a trading house), so the money is what makes the move possible, and the
   class follows the new work.
3. **Who employs** (asked: the advantages and disadvantages of each; answered in section 2a). In the player's towns
   the player faction will be the main employer, with NPC shopkeepers and others who come to take up residence.
4. **Taxes: an excise on imports and exports for now**, perhaps more later (noted in TODO.md, "Features", to revisit when
   things are more fleshed out). **Player settlements in a nation's core territory pay that nation monthly tribute once
   they reach a certain size.**
5. **The player: all of the above** (buys from the guild's stash, sells to shops, is paid bounties).

**The second round (2026-11-03):**
6. **The isles' money is Kautoan shells** (strung shell money; LORE.md, the Ring Sea Islanders).
7. **The employer recommendation stands** (section 2a): an account and an owner for every workplace, the treasury owning
   them all to start.
8. **Mobility differs by nation.** Some are more fluid: the **Iron Republic** and **Yuni** offer more room to rise in a
   single generation (more than one station in a lifetime, or a lower bar). A nation's row says how many stations a life
   may climb and what each rise takes.
9. **A bankrupt merchant goes back to being a worker** (downward mobility exists), **and downward mobility is a cause of
   mass unrest, if not revolution**: falls are counted per settlement, and enough of them in a short time raise unrest
   (section 2, M6).
10. **No excise between cities of the same nation** (Kautoa and Valapo, and the villages' carts into their town, pay none);
    only trade across a border and the ships from beyond.
11. **Tribute starts above 50 people**, discounted at low population: the full rate only once the settlement is well
    grown (proposed: the rate times (people - 50) / 450, capped at 1, so a town of 100 pays a ninth and one of 500 pays
    in full; the owner may set the curve and the rate).

## 1. What the research says

- **Faucets and sinks.** Money enters through faucets and leaves through sinks; when it enters faster than it leaves,
  prices rise and saved wealth loses value. A transfer between two holders (a purchase, a wage) is neither: only the
  explicit faucets and sinks change the money supply. Map every faucet to a sink and audit the ratio regularly (an
  hourly or monthly table of faucets, sinks and net flow). Hard sinks (consumption, repair, fees, losses) are what hold
  prices; a sink people resent works less well than one they want.
- **EVE Online publishes a Monthly Economic Report**: money supply at the start and end of the month, every faucet and
  sink by kind, a consumer price index, regional trade balances. Even there, the sinks took only about a third of the
  bounty faucet one year, and the money supply rose steadily. Measure the money supply as a first-class report.
- **Ultima Online's closed loop failed.** A fixed amount of gold, spawned from a central pool, plus too few drains, gave
  hoarding and "a collapse of liquidity". NPC shops that buy whatever players bring are "just a gold spigot", and shops
  that track their own stock drove buy prices to zero for goods nobody wanted. The fix was to break the loop and let the
  currency float to an equilibrium with the drains. Lessons: no shop creates money; a shop pays from its own till;
  money in circulation must be able to leave.
- **Dwarf Fortress removed its internal money**: dwarves spent their time carrying coins about instead of working.
  Lesson: money is a book entry on an account, not a pile of items to haul. Only coin that can be stolen or dropped
  needs to exist as a thing.
- **Victoria 3's prices**: each good has a base price, and the market price moves from it by the balance of buy orders
  (consumption) and sell orders (production), every consumer and producer in a market contributing. A trade route adds
  buy orders at one end and sell orders at the other. The base price anchors the price; the order balance moves it.
- **BazaarBot (Doran and Parberry, "Emergent Economies for Role Playing Games")**: each trader keeps a believed price
  range per good, bids within it, narrows the range on a trade and widens it on a failure; the market matches the
  highest bids with the lowest asks; a bankrupt trader is replaced by one of the most profitable trade. Emergent
  prices, but noisy and costly per agent: suited to the merchants, not to every citizen.
- **Stock-flow consistent models** (the economists' agent-based models): every payment goes from one account to
  another, every financial stock is one holder's asset and another's liability, and the balance sheet and the
  transactions-flow tables must sum to zero ("no black holes"). That is the ledger rule core/simulation already keeps
  for goods (SCHEMA.md, "The books"), extended to money.
- **Pacific shell money** (fits the isles): Tolai *tabu* shell rings are still traded for cash and were once considered
  for legal tender; the Banks Islands' *som* strings are ritual money; the Kula ring separates ceremonial gift exchange
  from market barter (*gimwali*). Shell money is made (a faucet: the strings' makers), held in ceremonial hoards (a
  sink), and paid in bride price and ceremony (transfers).

**The third round (2026-11-03):**
12. **The tribute ramp stands** ((people - 50) / 450, capped at 1), and **the full rate is a fixed sum** (a nation's, in
    Talents a month; the sums wait for M1's prices).
13. **Fluid nations: two stations a life** (the Iron Republic, Yuni, and perhaps the Tungangs, the tunnel people of the Rift and the southern Outer Wall: LORE.md §6.1), **with the same
    money bar** as everywhere else.
14. **Unrest is a happiness pool.** Each fallen household takes an **unhappiness modifier**; it feeds a **collective and a
    per-class happiness pool** for the settlement, which other things move too (needs not met, hunger, the taxes and
    tribute later). **The farther the pool falls below 50%, the more serious the unrest.** The milder forms are **demands**:
    a new ruler, or a shipment of needed goods from the faction's authorities; the gravest is **treason**. A **revolution**
    is situational and needs the political system fleshed out first: Hook, say, could throw out Iziz and invite Voth back,
    or become independent, if both are weak enough (M6 below; core/simulation PLAN.md Phase 4).
15. **Twenty Kautoan shells to the Talent** (the rate built in M0) stands.

## 2. A proposal for Krator

**M0. Accounts and the books (no prices yet).** Money is a good of the ledger with a unit, one currency a nation (the
Talent the Empire's and the trade's; the isles' money proposed as Kautoan shell strings, its name for the owner) and,
for the first time, owners other than the settlement: households, workplaces, the town's treasury
(its chief's house), the guild, the ships from beyond, the player. An account is `{owner id, settlement, balance}`,
integers in the smallest unit, keyed by stable ids, edits as deltas by id (core/city's rule), so Godot reads the same.
Every payment is a transfer between two accounts in one call (`SIM.pay(from, to, n, why)`); only `SIM.mint` (a faucet)
and `SIM.burn` (a sink) change the total, each booked by kind. **Exchange** (the owner's answer 1): a payment between
accounts of two currencies goes through a money changer at the rate to the Talent (`SIM.CURRENCY[c].talent`), less a
small spread, the spread booked to the changer; a nation's rate is a number for now, floating later with its trade
balance. The ledger's check grows a line: per settlement, money
opening + minted - burned + in - out = closing, with every route leg reconciled (as goods are). A monthly report, the
EVE way: money supply, faucets and sinks by kind, a price index, velocity.

**M1. Wages and purchases at fixed prices.** Prices start fixed at each good's labour cost (its recipe's worked hours
times a wage, plus its inputs': the governor already knows the chains). The town's treasury pays each worker a wage a
worked hour (one employer first, so no firm goes bankrupt while the rest is tuned); a household pays for what it buys
from the shop's till, the shop passes it to the maker. Check the circular flow: wages paid = spending + saving, over a
week, in each town. **Class stays by profession** (the owner's answer 2): what a household spends follows its savings
within its class's band (the treats, meals out and clothes), and the class moves only with a **rise of one station**:
when a household holds enough (a threshold by station, in months of the next station's cost of living) for long enough,
one of its working adults may change profession upward when there is room (a vacant shop for a worker who becomes a
merchant; a trading house for a merchant prince; a title, granted, for a true noble), paying what the move costs (the
shop's stock, the house, the fee for the title). One station a lifetime by default, so a family climbs over generations;
a fluid nation's row (the Iron Republic, Yuni) allows more in one life or sets the bar lower. A merchant whose
workplace fails and whose household cannot cover it **falls back to worker** (it takes the next free post of its old
trade or labour), and its fall is counted (M6).

**M2. Prices that move.** Each settlement keeps a price per good: its base (the labour cost) times
`(target / position) ^ k`, clamped (say 0.5 to 2 times base), smoothed over a few days. The governor already computes a
good's target (days of cover of its demand) and position (its whole supply line), so this is Victoria 3's order balance
on numbers the sim has. A shortage raises the price, so households buy less of it (an elasticity per good class:
staples low, treats high) and its makers earn more. Keep the governor: prices inform people, the governor still runs
production until firms are their own accounts.

**M3. Trade by price.** The lakatoi buys at the sender's price and sells at the receiver's; it sails a good when the gap
covers the voyage (crew wages, a fee). Today's `want` (the other town's use) becomes the fallback. The ships from beyond
are the isles' main faucet (they pay in their coin or in shell money for cloves, cacao, sugar, iron) and their main
sink when they sell imports: keep the two near each other a month.

**M4. Crime with coin.** A pickpocket takes coins from the victim's purse (a transfer: the victim's account to the
thief's); a burglar takes coin and goods; the fence pays a share of the town's price (say 30-50%) from the guild's till
and sells to the player at a markup; a fine (to the treasury) can stand in for jail for small crimes. Stolen coin is the
only money that has to exist as a thing (a purse in the drawn town); everything else stays a book entry.

**M5. Excise and tribute** (the owner's answer 4). **For now only an excise**: a share of the value of every import and
export, paid by the carrier to the treasury of the settlement it lands at or leaves (the lakatoi, the villages' carts
crossing into a town, the ships from beyond), at a rate by nation and perhaps by good; **none between settlements of the
same nation** (the owner, 2026-11-03: the lakatoi and the villages' carts pay nothing). **Tribute**: a player settlement inside a nation's core territory (the
political polygons core/camp's ranges are cut from) pays that nation a monthly tribute **once it passes 50 people**,
discounted while it is small (proposed: the full rate times min(1, (people - 50) / 450)), in Talents; unpaid, the nation's relation falls (and,
later, it sends someone to collect). Wage, sales and land taxes, tolls and harbour dues wait (TODO.md). Temple offerings
and ceremonial hoards stay the sinks people want.

**M6. Falls, the happiness pool and unrest** (the owner, 2026-11-03, answers 9 and 14; built to treason the same day:
section 1's M6 paragraph; the revolution waits on the political system). A household that falls a station
(a bankrupt merchant back to worker, a prince to merchant) takes an **unhappiness modifier** on its people's happiness
(core/simulation's needs already give each person a happiness and a loyalty), fading over months. Each settlement keeps a
**happiness pool**: the mean happiness of its people, collective and **per class** (workers, merchants, merchant princes,
nobles), moved by the falls' modifiers and by everything else that moves happiness (needs unmet, hunger, later the taxes
and tribute). **Unrest is how far a pool is below 50%**, and its stages grow with it:
- just under 50%: grumbling (loyalty falls, the watch's arrest odds fall, more fights: crime's `assault`);
- lower: **demands** to the faction's authorities: a shipment of the goods the town is short of (the faction's other
  settlements send it, or do not), or **a new ruler**;
- lower still, demands refused: strikes (workplaces held, `SIM.recipeHold`) and riots at the squares;
- at the bottom: **treason**, and a **revolution** whose outcome is situational (answer 14): the settlement may throw out
  its faction and invite another back (Hook from Iziz to Voth), or go independent, as the factions' strength allows.
  That needs core/simulation PLAN.md Phase 4's factions and a political system first: a settlement's ruler, its
  faction's strength and reach, and its neighbours' claims. A per-class pool lets one class rise while another is
  content (the merchants in revolt, the workers not). The thresholds and how fast a pool moves are a nation's.

**Balancing and proof (each phase, with negatives, as the economy's checks):** the money ledger balances in every
settlement and on every route; the money supply per head stays in a band over 90 fast-forwarded days; the price index
moves less than a set share a month once settled; no account goes negative; no shop pays out what it did not take in;
faucets and sinks within a ratio of each other each month. A fast run (90 days at the abstract level, as the week test
runs) before any tuning is believed.

**Avoid:** a shop that creates coin (UO's spigot); a vendor price that can reach zero; coins as physical items everyone
hauls (Dwarf Fortress); per-citizen haggling (BazaarBot's beliefs for the merchants only, if at all); floats in balances
(integers, with any rounding booked); a closed loop with no drain.

**The player** (the owner's answer 5): an account in Talents; buys from the guild's stash (at a markup on what the fence
paid) and from shops (changed into the local money at the rate), sells to shops (from their tills: a shop never buys
what it cannot pay for, nor at a price below a floor), and is paid bounties. The bounties are a faucet (EVE's largest),
so they are counted in the report from the first one and matched by sinks the player wants (gear, land, the tribute).

## 2a. Who employs: the two ways, and a recommendation (asked 2026-11-03)

**One employer per town (the treasury pays every wage and owns every workplace's takings).**
- For: simple and stable: one account to balance, no firm can fail, nobody goes unpaid while prices are being tuned; easy
  to prove (wages paid = what the treasury took in from sales, excise and tribute, plus its reserve); it fits a
  command economy (Iziz's state works, a chief's household on the isles) and the player faction running its own town.
- Against: no shop or workshop has a reason of its own to do well; a bad price hurts nobody in particular; no
  bankruptcies, no rich merchant, nobody to rise from worker to merchant (the owner's answer 2 needs owned shops); the
  NPC shopkeepers who come to live in the player's towns have nothing of their own to run.

**Every workplace its own account (it sells, buys its inputs and pays its wages).**
- For: prices mean something (a shop that overcharges loses custom, a smith short of iron earns less); merchants and
  merchant princes exist as people with money; the climb of a station has something to climb to (a shop to buy); NPCs
  who move into a player's town open their own shops; the player can buy, own or tax a business.
- Against: more state and more tuning; a workplace can run out of money and stop paying (the BazaarBot problem: it
  needs a rule for failure: close, sell, be replaced by the trade most in profit); a bad first price can empty a
  town's tills in days; harder to prove the books at first.

**Recommendation: both, as one mechanism.** Every workplace gets an account from the start, and every account an
**owner** (the town's treasury, a noble house, a merchant, a temple, the player faction). To begin, the treasury owns
every workplace in a town, so it behaves as one employer and is as easy to tune (the treasury covers a workplace's
losses from its reserve); then ownership is handed out: shops to their merchants, trading houses to merchant princes,
a vacant shop bought by a worker who rises. In a player's town the player faction owns what it built and pays its
workers, and an NPC shopkeeper who moves in owns its shop. A failing owned workplace first draws on its owner, then
closes and is put up for sale (the rule for failure, needed only once owners are independent). This is also Godot's
shape: an account and an owner per workplace record, edits as deltas by id.

## 3. Questions for the owner (answered 2026-11-03: section 0; still open below)

1. **The tribute's fixed sums**, a nation's, in Talents a month: set once M1's prices give the Talent a meaning.
2. **The political system** that revolutions need (M6): rulers, a faction's strength and reach, claims. A plan of its own:
   PLAN-POLITICS.md (a draft, 2026-11-03: nothing irreversible without the player; the contests the owner named).

## Sources

- Faucets and sinks: [Designing Game Economies](https://medium.com/@msahinn21/designing-game-economies-inflation-resource-management-and-balance-fa1e6c894670), [Game Economy Design](https://metavert.io/game-economy-design), [The F-Words of MMORPGs: Faucets](https://www.gamebanshee.com/9x94), [crafting a living game economy](https://www.wayline.io/blog/crafting-a-living-game-economy)
- EVE: [Monthly Economic Report, November 2024](https://www.eveonline.com/news/view/monthly-economic-report-november-2024), [EVE Economy Update, Vegas 2015](https://www.eveonline.com/news/view/eve-economy-update-eve-vegas-2015-report), [Leaky faucets: money supply in the economic report](https://evenews24.com/2017/12/15/leaky-faucets-money-supply-in-the-economic-report/)
- Ultima Online: [Raph Koster, The evolution of UO's economy](https://www.raphkoster.com/?p=16263), [Did players destroy the UO ecology?](https://www.raphkoster.com/?p=46439), [Simpson, The in-game economics of Ultima Online (1999)](https://gwern.net/doc/economics/1999-04-07-simpson-theingameconomicsofultimaonline.html)
- Dwarf Fortress: [Dwarf Fortress: A Marxist Analysis](https://mccaine.org/2013/10/09/dwarf-fortress-a-marxist-analysis/), [DF wiki: Trade](https://dwarffortresswiki.org/index.php/Trade)
- Victoria 3: [Dev Diary 9, National Markets](https://admin-forum.paradoxplaza.com/forum/developer-diary/victoria-3-dev-diary-9-national-markets.1484917)
- BazaarBot: [BazaarBot: an open-source economics engine](https://gamedeveloper.com/design/bazaarbot-an-open-source-economics-engine), [Doran and Parberry, Emergent Economies for Role Playing Games](https://ianparberry.com/pubs/econ.pdf), [bazaarBot (Haxe)](https://github.com/codehunt023/bazaarBot)
- Stock-flow consistency: [Implications of zero-growth economics analysed with an agent-based model](https://arxiv.org/pdf/2501.19168), [Dafermos and Nikolaidi, SFC modelling](https://www.boeckler.de/pdf/v_2022_07_30-25_dafermos_nikolaidi.pdf)
- Shell money: [Kula ring](https://en.wikipedia.org/wiki/Kula_ring), [Som: shell money of northern Vanuatu](https://www.emkp.org/som-shell-money-of-northern-vanuatu/), [Tabu currency (Bowers Museum)](https://collections.bowers.org/objects/136182/currency-tabu)
