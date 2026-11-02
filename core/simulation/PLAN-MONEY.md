# Money in the sim: research and a proposal (2026-11-02, not built)

The owner asked (2026-11-02) for suggestions on implementing and balancing money in the sim, after crime and the
thieves' guild showed what is missing without it: a pocket picked takes nothing, a fence pays nothing, the guild's stash
goes nowhere, and a person's wealth is a fixed number by class. This is a proposal for the owner's answers, not a plan of
record. Sources are at the end.

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

## 2. A proposal for Krator

**M0. Accounts and the books (no prices yet).** Money is a good of the ledger with a unit (the isles: a strand of shell
money, `som`) and, for the first time, owners other than the settlement: households, workplaces, the town's treasury
(its chief's house), the guild, the ships from beyond, the player. An account is `{owner id, settlement, balance}`,
integers in the smallest unit, keyed by stable ids, edits as deltas by id (core/city's rule), so Godot reads the same.
Every payment is a transfer between two accounts in one call (`SIM.pay(from, to, n, why)`); only `SIM.mint` (a faucet)
and `SIM.burn` (a sink) change the total, each booked by kind. The ledger's check grows a line: per settlement, money
opening + minted - burned + in - out = closing, with every route leg reconciled (as goods are). A monthly report, the
EVE way: money supply, faucets and sinks by kind, a price index, velocity.

**M1. Wages and purchases at fixed prices.** Prices start fixed at each good's labour cost (its recipe's worked hours
times a wage, plus its inputs': the governor already knows the chains). The town's treasury pays each worker a wage a
worked hour (one employer first, so no firm goes bankrupt while the rest is tuned); a household pays for what it buys
from the shop's till, the shop passes it to the maker. Check the circular flow: wages paid = spending + saving, over a
week, in each town. A person's `wealth` (now fixed by class) becomes its household's savings, smoothed, with its class
as the starting point, so the treats, meals out and clothes follow what it has.

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

**M5. Taxes, tribute, the polity.** A tax on wages or sales to the treasury, which pays the soldiers, the officials and
the watch (today the treasury is implicit); tribute from Valapo to Kautoa, or from both to the polity's seat; temple
offerings and ceremonial hoards as sinks that people want (the shell money's own sink).

**Balancing and proof (each phase, with negatives, as the economy's checks):** the money ledger balances in every
settlement and on every route; the money supply per head stays in a band over 90 fast-forwarded days; the price index
moves less than a set share a month once settled; no account goes negative; no shop pays out what it did not take in;
faucets and sinks within a ratio of each other each month. A fast run (90 days at the abstract level, as the week test
runs) before any tuning is believed.

**Avoid:** a shop that creates coin (UO's spigot); a vendor price that can reach zero; coins as physical items everyone
hauls (Dwarf Fortress); per-citizen haggling (BazaarBot's beliefs for the merchants only, if at all); floats in balances
(integers, with any rounding booked); a closed loop with no drain.

## 3. Questions for the owner

1. **The currency.** Shell money (`som`) on the isles, Voth's coin elsewhere, foreign coin from the ships with an exchange
   rate? Or one currency for the whole crater to start?
2. **Wealth.** Should a person's class follow its savings (people can rise and fall), or stay fixed with money on top?
3. **Who employs.** One employer per town (the treasury) to start, or workplaces as their own accounts from the start
   (bankruptcy, as BazaarBot replaces a failed trader with the most profitable trade)?
4. **Taxes and tribute**: wanted on the isles (Valapo to Kautoa), and who is paid from them?
5. **The player**: buys from the guild's stash, sells to shops, is paid bounties (a faucet to watch)?

## Sources

- Faucets and sinks: [Designing Game Economies](https://medium.com/@msahinn21/designing-game-economies-inflation-resource-management-and-balance-fa1e6c894670), [Game Economy Design](https://metavert.io/game-economy-design), [The F-Words of MMORPGs: Faucets](https://www.gamebanshee.com/9x94), [crafting a living game economy](https://www.wayline.io/blog/crafting-a-living-game-economy)
- EVE: [Monthly Economic Report, November 2024](https://www.eveonline.com/news/view/monthly-economic-report-november-2024), [EVE Economy Update, Vegas 2015](https://www.eveonline.com/news/view/eve-economy-update-eve-vegas-2015-report), [Leaky faucets: money supply in the economic report](https://evenews24.com/2017/12/15/leaky-faucets-money-supply-in-the-economic-report/)
- Ultima Online: [Raph Koster, The evolution of UO's economy](https://www.raphkoster.com/?p=16263), [Did players destroy the UO ecology?](https://www.raphkoster.com/?p=46439), [Simpson, The in-game economics of Ultima Online (1999)](https://gwern.net/doc/economics/1999-04-07-simpson-theingameconomicsofultimaonline.html)
- Dwarf Fortress: [Dwarf Fortress: A Marxist Analysis](https://mccaine.org/2013/10/09/dwarf-fortress-a-marxist-analysis/), [DF wiki: Trade](https://dwarffortresswiki.org/index.php/Trade)
- Victoria 3: [Dev Diary 9, National Markets](https://admin-forum.paradoxplaza.com/forum/developer-diary/victoria-3-dev-diary-9-national-markets.1484917)
- BazaarBot: [BazaarBot: an open-source economics engine](https://gamedeveloper.com/design/bazaarbot-an-open-source-economics-engine), [Doran and Parberry, Emergent Economies for Role Playing Games](https://ianparberry.com/pubs/econ.pdf), [bazaarBot (Haxe)](https://github.com/codehunt023/bazaarBot)
- Stock-flow consistency: [Implications of zero-growth economics analysed with an agent-based model](https://arxiv.org/pdf/2501.19168), [Dafermos and Nikolaidi, SFC modelling](https://www.boeckler.de/pdf/v_2022_07_30-25_dafermos_nikolaidi.pdf)
- Shell money: [Kula ring](https://en.wikipedia.org/wiki/Kula_ring), [Som: shell money of northern Vanuatu](https://www.emkp.org/som-shell-money-of-northern-vanuatu/), [Tabu currency (Bowers Museum)](https://collections.bowers.org/objects/136182/currency-tabu)
