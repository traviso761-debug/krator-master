# Streetlab: handoff (2026-10-09; the citizen simulation from 2026-10-12)

This note lets a new session take over the Voth city plan work. Read it with `README.md` (the design and every tool), `INDEX.md`
(fragments and sizes), `PORT.md` (port tags) and `KNOWN_ISSUES.md`. The memory file `project-streetlab.md` holds the
owner's rules in short form.

## 2026-10-12: phase C session 2, follow-up: benched squares, village shrines, the bread oven

The owner: "Add a couple village size shrines and benched squares for that overflow. Fix the oven." Done (README
"Benched squares and village shrines"):
- The overflow, mapped by home: the afternoon's company-seekers with nowhere to go were almost all the cantons' people
  (Market, Granary, Fortress, Guild, Arsenal, Foreign); the rest day's short worshippers the farms, the suburbs, city
  NE and SE, the mines.
- 12 benched squares at the cantons' feet (Fortress 3 from its causeway's land end, Market 3, Guild 2, Granary 2,
  Arsenal 1, Foreign 1), 34 x 24 m on 30 cleared house lots, 27 benches each round a well, about 258 places each.
- Two village shrines (`voth_bldg_village_shrine`, a new kit model: a walled precinct, a pillared hall, a forecourt),
  81 each, placed where an estimate of the citizens' choice leaves the most without room.
- `voth_bread_oven` stood 0.30 m behind its wall and 0.20 m over its height: its dome and flue are inside its box now
  (the catalog's verify passes every page). `voth_shrine_lantern` named its materials by the catalog's keys.

**Where we're at** (`verify.py`): at 15:00 on a workday 31,002 socialize out (28,117 before), 2,601 visit at home
(5,347), 275 go without (571). The rest day's worship: 209 short at 8:00 (208 before), 528 at 11:00 (576). Both
shrines fill, but the shortfall is spread thin: farms about 150, suburbs 140, city NE 100, city SE 95, the mines 75. My
estimate (`worshipShort` 2,237 before, 1,030 after) overstates the clan compounds' east: the first shrine stands there.
Fixing the rest takes either about six more village shrines placed from the simulation's own map, or letting the farms'
households worship at the village chapels and their homes.

## 2026-10-12: phase C session 2, follow-up: the temples, the chapels, the small shrines (where we're at)

The owner: "3 with half; make 2 new unique temple models to accomodate the halls and place one on the west side and one
on the southeast side at the pre-street phase; and make 3 small tomb size shrines as furniture to distribute around parks
that 2-3 people can use at a time. Clan compounds can also take this furniture shrine. Make a house size chapel that can
go in the villages. Then let's see where we're at". Done (README "The rest day's worship"):
- Three services (8, 11, 17) with half the city attending, dealt in turn (an actor's `alias` picks its service).
- The Temple of the Ash Saints on the west side (placed at step 5, after the wall: at step 3 the highways took it down;
  the west is hilly, so its search allows 12 m of slope and 1.2 km of reach), the Temple of the Tide Mother on the
  southeast (328 m from its mark); 1,358 and 1,368 standing.
- Village chapels in S10, S11 and S12; 193 small shrines (6 along the big parks' walks, 187 in pocket parks); a yard
  shrine in all 54 clan compounds (the small compound's hall is its shrine room).
- `voth_ossuary_shelves` named no plaster material for its skulls (the catalog's verify failed on it, before this work):
  fixed.

**Where we're at** (`verify.py`): at the busiest service (8:00) 7,475 want to worship, room for 8,032 at once (the
temples 2,726, the canton shrine rooms 3,228, the funerary temple 510, the chapels 459 with the monastery's, the shrines
526, the small shrines about 580, the clan compounds 224 for their own): nobody is short overall, but 208 at 8:00 and
576 at 11:00 find no room within 1.5 km (the room is uneven: the cantons hold 40% of it). Socializing at 15:00 on a
workday: 28,117 out, 5,347 visiting, 571 without. Work: 2,187 out of work, 3,979 posts unfilled (from session 1).

## 2026-10-12: phase C session 2, follow-up: more company, the slaves' rest day, worship sized

The owner: "More places to socialize; and maybe people can socialize at home with housemates and neighbors too?",
"Slaves work a half shift on rest day", "How many more temples and shrines would we need".
- The 992 plazas and 617 pocket parks are places, their room by area; houses take visitors (VISIT: their own people and
  neighbours within 60 m) when there is no room out. At 15:00 on a workday 28,594 socialize out (5,000 before), 5,030
  visit, 511 go without (29,114 before).
- Slaves work half their shift on the rest day.
- **Worship at 9:00 on the rest day:** 45,277 want it; the room is 4,698 at once (the canton shrine rooms 3,228, the
  funerary temple 510, the chapel 366, the five shrines 526, the House of Healing and the parks' shrines the rest; the
  Temple canton not counted until its interior). A shrine holds about 105. More needed: one service, everyone: 387
  shrines (or 80 of the funerary temple's size); one service, half the city: 171; three services, everyone: 99; three
  services, half: 28 (or 6 of the largest).

## 2026-10-12: phase C session 2 (branch `Voth-sim`): the week, running

The owner: "Ok continue build" (and, mid-session, "Items like chairs, stools could be a good target for idle and beds etc
for rest"). Done (README "Session 2: the week, running"): roadmap 2.4 items 3 and 3b, and the stepping of everyone.
- Shifts per kind of work, nights for a third of the guards, soldiers, stokers and jailers, the rest day (day 7) for all
  but 23 essential kinds, a rota day off for every worker; 59 roles. Seats offer IDLE (and RELAX), beds REST; houses are
  private. The clock has 20x and 60x; the near citizens are drawn.
- core/simulation: `scheds`/`week`/`off`, the place grid per activity (exact nearest-first; the example's decision hash
  is unchanged), lazy paths, `access: 'private'`, `SIM.REACH`, `SIM.nav.body`, a batched log; `test-sim.js` checks each
  with its negative. Shade, Mungo and the example rebuilt; their verifies and checks pass.

**What a workday says** (`verify.py`, `VC.simDay`): at 3:00 52,781 asleep and the night shift (927) at work; at 10:00
18,774 at work (everyone who wants to), 33,521 idle at home; **at 15:00 29,114 want company and find no free place
within 1.5 km** (the plazas, parks, wells and taverns hold about 5,000 at once): the largest deficit so far; at 20:00
36,000 relax at home. The rest day: 6,602 at work (only the essential kinds). A step costs 29 ms (median: every actor is
asked), 0.8 s at most (6,000 decisions at a shift change); the decisions left waiting clear within about 7 minutes.
WORSHIP on the rest day finds 78 places' worth of room: the shrines and chapels are few.

**Decisions for the owner:** more places to socialise (taverns, plazas with benches, a bath house?) or fewer hours out;
temples and shrines for the rest day; the slaves' rest day (now off).

**Next (phase C session 3):** needs and happiness (`77-sim-6-needs.js`: meters, fill tables, the personality trait,
happiness and efficiency), the resolver's "meter x pull" choice of free time, and the census panel's needs and
deficits. The buildings' own graphs and the canton interiors on the layer; the chinampa huts on `water`.

## 2026-10-12: phase C session 1, follow-up: the outside stairs are navigable

The owner: "Make sure stairs on house exteriors are also navigable". Every stair and ladder the Voth kit models build on
their outsides is now a walk record (`settlements/voth/catalog/README.md` "Walk records"): the four Voth registries'
stair helpers and the hand-built flights of the townhouse, guild hall, tavern, caravanserai and the farmhouse call
`walkRec`. The city collects them in its model probe and lays them at every lot: 6,826 stairs and 4,715 ladders on 6,365
lots, every head on the main body of the pedestrian layer; the walker stands on the stairs (core/walk strips). The layer
is now about 50,700 nodes (27,600 before); the deal is about 4.9 s at load (3 s before), the layer 2.2 s.
- 1,828 stair feet stand on a gallery or roof that no other outside stair reaches: they are joined through the house
  (`indoor` edges) until the buildings' own graphs (planBuilding's, with the interior stairs) join the layer.
- Not records yet: the canton models' own stairs (CANT's flights are), the Voth builders the city calls directly (the
  monastery, the House of Healing, the shrines), and the ladders for the walker.

## 2026-10-12: phase C session 1 (branch `Voth-sim`): the walkable city and the citizens

The owner: "continue next step". Done (README "The citizens (phase C)"): the pedestrian layer (`43-vc-sim-nav.js`) and
every census resident as a SIM actor with a home, a job and a commute (`44-vc-sim-people.js`); core/simulation gained
`yWeight` layers and `SIM.nav.field` (both tested in `test-sim.js` with their negatives; Shade, Mungo and the example
rebuilt, their verifies and checks pass).

**What the report says** (the "interiors report" button; `verify.py`):
- 53,355 citizens (the census) in 8,408 homes: 28,125 of working age, 22,894 at work (6,242 live-in, 16,652 dealt by the
  walk; median commute 67 m, 90th percentile 1,050 m), 3,217 gentry on their means, **2,014 out of work**: no free post
  within 3 km walked, in city SE (795), the suburb (677), the farms (311), villages S11 and S12. 633 slaves (70% of the
  farm, mine and quarry posts) at 281 sites whose quarters are not built.
- **3,967 posts unfilled**, mostly where few live: the market traders (1,668 at 3 markets), porters (808, the Port
  deck's warehouses), dockers (444), armourers (224), smiths (243), chinampa growers (218), the coast-guard berth (40),
  the lighthouses (8), the necropolis (11). Workers (not gentry) number about 24,000 against 27,700 posts: some must stay
  empty, and the walk decides which.
- 6,306 residents sleep on the floor (their homes' beds fall short: phase A's shortfall, now slept on).

**Decisions for the owner:**
- The gentry (rich, manor, clan: 4,271 of working age) take only the professions in `TUNE.sim.people.gentryJobs`; 3,217
  find none and live on their means. Widen the list, or let them be idle?
- Slaves are counted apart from the census (633 more people) and sleep at their field, mine or quarry, which has no
  quarters: build slave quarters (a kit model), or house them in the farmsteads and miners' houses?
- City SE and the suburb have about 1,500 out of work and no posts within 3 km: more workshops there, a longer
  `walkMax`, or the strider and ferry lines as a commute (the roadmap's "walk or transit minutes", not done yet)?
- The chinampa huts hold no census residents: their growers come from the shore (median 865 m). Count the huts as
  homes (`TUNE.census.live`)?

**Next (phase C session 2):** the week and the rota (`KCLOCK.weekday`, `TUNE.sim.shifts`), the fast test clock, and
stepping everyone. Before stepping 54,000 actors: `SIM.placesFor` scans every place for each free-time decision (13 ms
at 20:00; 3.5 ms at 8, mostly routing), so core/simulation needs a spatial index of places (or per-activity fields
from `SIM.nav.field`, refreshed as places fill) and the stepper's `SIM.STEP_MAX` a look; the embodiment (`77-sim-7-lod`)
draws only those near the camera. The buildings' own graphs and the canton interiors' join the layer; the chinampa
huts go on `water` with kayaks.

## 2026-10-12: phase B session 2 (branch `Voth-sim`): phase B is done

The owner: "Put caravanserai closer to the river gate, at post-avenue stage. Add more work furniture. Do B session 2".
- **The caravanserai** is placed at step 3, after the avenues and before any street (`VC.simCaravanserai`, the House of
  Healing's rule): 280 m from the River Gate's marker, off Avenue 10, in the river port's flat ground; the streets and
  lots are laid round it, nothing is displaced.
- **More work furniture:** dense work rooms for the short kinds (`factory`, `enginehall`, `drillhall`, `guardroom`,
  `alehouse`, `counting`, a stable; the funerary temple on two storeys), the granaries and the mustering ground as work
  places. A trade no longer converts a lot with a role (a brewery had taken one of the two power houses).
- **Session 2:** capacity by size, seats round tables, the places' spots (about 110,000 on 8,357 places), reach and
  wander for the open places, the workplaces per place, the density overlay's work-post mode.

**The power station** (owner: "Make a larger power house and sprinkle it in if needed"): a new kit model,
`voth_bldg_power_station` (46 x 34 m: a two-storey turbine hall with a clerestory, the boiler house and its two chimneys,
the fumarole vent house, cooling tanks, conduit masts; `ix` shell 40 x 22 m on two storeys), takes the place of the small
fumarole house (`voth_generator` v1, 128 m2 inside) in `TUNE.power.houses`; the steam turbine hall (v0) stays. Its
programme is four engine halls and a store (`TUNE.ix.byKey`), and an engine hall now takes up to 20 workstations (was 12).
None had to be sprinkled in: the two houses have 274 posts for 260 workplaces.

**The 90% rule now:** every kind of work meets it (24,647 posts for 24,647; 27,366 workplaces).

Plan and furnish takes about 15 s at load now (8 s before): the dense rooms. A bake (as Mav's Refuge's) would bring it
back if the load matters.

## 2026-10-12: phase B session 1 (branch `Voth-sim`)

The owner: "start phase B". Done (README "The citizens' places (phase B)"), in `targets/voth-city/42-vc-sim-places.js`:
- **The new buildings are on the plan:** 14 bakeries, 10 butchers, 8 weavers, 4 breweries, 3 tanneries (converted lots,
  spread over the city), watchhouses east, west and south (and the Fortress's armoury as the central one), the
  caravanserai 320 m from the Spirit Gate inside the wall in place of 7 houses, the coast-guard berth off the Fortress.
- **269 wells** (215 on plazas, 52 along the streets, 2 in market squares) and 59 private ones in the manor and clan
  courtyards.
- **About 11,100 SIM places** with activities, hours, pull and work posts; core/simulation's `SIM.slotsFromFurniture` takes
  a world's own map now (`test-sim.js` checks it; Shade, Mungo and the example were rebuilt, their verifies run).
- **The 90% rule and the full job table** in the report panel and `verify.py`.

**What the 90% audit says:** 23,410 of the 24,556 posts the rule asks for stand. Short: industrial workers (490: the
industrial lots' census is 15 workers each, their warehouses hold about 7 posts), soldiers (257: barracks, the garrison
castle and the wall's towers and gates; their patrols are phase F), power-house stokers (201: 130 workplaces a house),
innkeepers and servers (97), the town guard (32: their patrols are phase F), granary keepers and millers (29), the coast
guard (24), the caravanserai's grooms (7), the funerary priests (6), guild and customs clerks (2, 1). Each short row names
the buildings with the most floor per post: where more work furniture would go, or where the census is too generous.

**Decisions for the owner:**
- ~~The caravanserai~~ moved by the River Gate at step 3 (session 2).
- The short kinds above: more work furniture, or fewer workplaces in the census (`TUNE.census.jobs`: industrial 15,
  power 130 are the large ones)?
- The new buildings' census numbers are first guesses (`TUNE.census.byKey`: a watchhouse 24 guards, the berth 40, a
  brewery 10...).

**Next (phase B session 2 or phase C):** the places' `spots` (where people stand), the furniture's own capacities in place
of one post a piece where it matters (a loom, a counter), and phase C's pedestrian nav layer.

## 2026-10-12: phase A session 2 (branch `Voth-sim`): phase A is done but for the Palace and Temple

The owner (2026-10-12): "work on session 2 phase A except the palace/temple interiors". Done (README "Every building's
interior"):
- **The fallback shells are gone (18 to 0).** They were the probe's fault, not the models': three.js r128's
  `Box3.setFromObject` overstated every turned mesh (Voth's tapered blocks are 4-sided cylinders turned 45 degrees, read
  1.4 times their size and as round), and a block on piles or on a yard platform stood above `TUNE.ix.base`. The probe now
  measures vertices, a cylinder is round only past 6 sides, and `base` is 2.5 m. No overrides were needed.
- **The buildings off the lots have interiors:** 6 monastery dormitories (180 monks, 288 beds), its chapel and assembly
  hall, the funerary temple, 5 shrines, 2 lighthouses and their keepers' cottages, 229 chinampa stilt huts, and the House
  of Healing counted from its wards (112 cots). `build.py` logs Voth's builders (`VOTH.BUILT`); the city's own models
  record their shells (`VC.ixSite`); the hut export carries each hut's size.
- **The eight new Voth kit models** (Q4) are in `kits/catalog/krator-master-buildings-voth.js`: watchhouse, caravanserai,
  coast-guard berth, weaver, tannery, brewery, butcher, bakery, each with an `ix` shell and a programme
  (`TUNE.ix.byKey`); four trade room kinds (`brewhouse`, `weaving`, `tanyard`, `butchery`) take their trades' pieces.
  They are placed in phase B; until then the report plans each as a lot of its class (`TUNE.ix.kitCheck`). The Voth
  building catalog page shows them (`settlements/voth/catalog/index.html` loads the file).

**The report now:** beds for 86% of the need (22,566 of 26,389), item stores 85%, food stores 67%; 1,482 homes short of
beds, about 7,600 residents without one: the poor houses (4,544: the census puts 7 in each, and the five poor-house models hold from 1 to 10 beds),
the clan compounds (1,302), shops (909), farms (380). Middle, rich, manor and craft homes now hold their people.

**For the owner when back at the computer:**
- The new models' look (one screenshot was taken of them side by side; not reviewed by the owner).
- The chinampa huts have 229 beds and the census houses no one there (Q3: the growers' homes); the monastery's
  dormitories hold no food store (the monks eat in the hall), so they show as short of food.
- Still failing `verify.py --assert`, unchanged: Dalab and Yuni embassies (no room on the Foreign deck), the Arena and
  Fortress interior walks (below).

**Left of phase A:** the Palace and Temple interiors, when the references arrive.

## 2026-10-12: the citizen simulation, phase A session 1 (branch `Voth-sim`)

The work is `SIM-ROADMAP.md` (the owner's brief, the phases, the answers). Phase A, session 1 is done; what is left of
phase A is at the end of this section.

**Done (README "Every building's interior"):**
- `targets/voth-city/41-vc-building-interiors.js` ([G data], `VC.IX`): every standing lot building (8,050) gets an
  interior. It is planned and furnished once per kit model and programme (111 types, about 6 s at load, no bake needed),
  placed by each lot's pose. Shells are read off the kit models (`VC.ixShellFrom`); programmes are `TUNE.ix`. Residents
  come from the census, and the residence rule (per 2 residents a bed, an item store and a food store, and a dining
  room) is checked per home. A shortfall is a record and a report line, never forced (Q3).
- `targets/voth-city/56b-vc-building-interiors-host.js` ([web]): the model probe, the drawing, the cutaway (x) on any
  building, the inspector on its pieces, the density overlay (n), the "interiors report" panel with the job table.
- `verify.py` prints the report (totals, by class, by district, the job table, the fallback shells) and asserts: every
  lot with a programme has a unit, no type fails, one unit of each of 12 types draws, the cutaway opens and closes a
  building, the density legend shows.

**What the report says (for the owner to read, Q3):** beds for 81% of the need (21,188 of 26,299); item stores 80%,
food stores 63%; 4,320 of 7,449 homes short of something, 2,255 short of beds, about 9,800 of 46,672 lot-building
residents without a bed. The poor (7 to a house), middle (5) and shop (5) classes and the clan compounds (40) fall
short; rich, manor and tavern homes hold their people. Workplaces: soldiers, household service, innkeepers, industrial
and power-house work have fewer posts than 90% of their workplaces (phase B gives each piece its capacity, so these
are provisional). 18 types read a fallback shell (listed in the report): name overrides in `TUNE.ix.shells` or improve
`VC.ixShellFrom` for them.

**Fixed on the way (they were failing `verify.py` on `main`):**
- **The canton decks were empty** (0 granaries, 0 barracks, 0 embassy plots, 2 shops): `VC.capturedHit` (commit 6086ed22,
  never checked in the page) counted the generic deck buildings that `VC.stripCantons` removes at draw time. The strip is
  now one data function, `VC.stripSet` (33-vc-country.js), which both use. Decks now hold 9 granaries, a barracks and 8
  armouries, 16 shops, 22 + 6 Port warehouses and 4 embassies.
- **The monastery had 2 dormitories of 6**: the extra dormitories and stores were inside the branch that runs only when
  Voth's compound is *not* placed. Now 6 dormitories and 2 stores (the census gains their monks).

**Still failing `verify.py --assert` (not caused here; left for the owner):**
- Embassies 4 of 6: Dalab and Yuni do not fit on the Foreign deck. Every spot left is blocked by the stair house, the four
  embassies and Voth's own stone rails at the deck's corners (kept by the strip, rightly). A design call: smaller embassy
  plots (`TUNE.decks.embassySize`), letting them turn, or another deck.
- The Arena interior walk ("ledge" at 28.7 m) and the Fortress walk ("blocked interior:Fortress" at -357, -776) fail as
  they did before this session.

**Left of phase A (session 2):** interiors for the buildings that are not lots (the chinampa huts, the monastery's
dormitories, the shrines, the lighthouse, the funerary temple, the House of Healing: they are Voth builders' prims, so
each needs a shell table); the new Voth kit models of Q4 (watchhouse, caravanserai, coast-guard berth, weaver, tannery,
brewery, butcher, bakery); overrides for the fallback shells; the Palace and Temple when the references arrive. A bake
(roadmap A.4) is not needed for the lots; it may be for the unique buildings.

## State

**Committed to `main` on 2026-10-09** (branch `claude/city-core`). The street toy (`src/`, `dist/streetlab.html`) was
retired: the owner called it redundant. Its street machinery became **`core/city`**, the city builder and its infill
(`core/city/README.md`), and the city plan takes it from there.

| Page | Built from | Verify | Last result |
|---|---|---|---|
| `dist/voth-site.html` | `targets/voth-site/` | `python3 verify.py dist/voth-site.html --assert` | OK |
| `dist/voth-city.html` | `CITY_JS` in `build.py` (`core/city`, `targets/voth-site/10,50`, `targets/voth-city/`, `core/simulation`) | `python3 verify.py dist/voth-city.html --assert` | OK |

Build: `cd settlements/streetlab && python3 build.py`. Serve: `python3 serve.py`, or the launch.json `streetlab` preview (port 8813). The page is
`/dist/voth-city.html`. It takes about 15 s to lay out and draw.

### Saved owner data (`site/`, inlined by build.py, read fresh under serve.py)
- `voth-site.json`: the site, made with the site editor. It has districts, including `mines`, `quarries`, `more farms` and `mush farm`, which came from the owner's marks.
- `voth-city-marks.json`: the owner's marks on the city plan (POST `/save/voth-city-marks`).
- `voth-city-edits.json`: the plan editor's placed buildings, painted streets and deletions (POST `/save/voth-city-edits`). It is empty now. Keep the file: the page fetches it, and a 404 fails verify.

### The city plan's 15 steps (0–14)
| Steps | What | Fragment |
|---|---|---|
| 0–5 | site, landmarks, districts, avenues, highways, wall | `30-vc-site.js` |
| — | Voth's own builders (wall and gates, monastery, chinampas, harbour, river port, shrines, lighthouses) | `31-vc-voth.js` |
| 6–12 | the street method | `32-vc-city.js` |
| 13 | the country: suburbs, farms, villages S10/S11/S12, orchards, mines, quarries, mushroom farms, windmills, watermills, ranches | `33-vc-country.js` |
| 14 | ferry and elephant bug lines as core/simulation `transport` routes | `34-vc-transit.js` |
| — | runner, plus the owner's edits | `35-vc-steps.js` |
| — | census | `36-vc-census.js` |
| — | power and light: power houses (at step 9), electric reach, street lamps | `37-vc-light.js` |
| — | flora: the swbay biome's mask and climate (parks jungle, environs savannah); built by `VC.drawFlora` (55) | `38-vc-flora.js` |
| — | park and plaza furniture; the big parks' walks, groves and gardens | `39-vc-furnish.js` |
| — | the chinampa beds | `31b-vc-chinampa.js` |
| — | the canton interiors (plans, walls, floors, KWALK) | `40-vc-interiors.js` |
| — | the cantons read into levels; bridges, causeways, flights, doors, falls (both pages) | `targets/voth-site/20-site-cantons.js` |

Host fragments:
- `55-vc-host.js`: drawing, sidebar, census table, foldable panels.
- `56-vc-interiors-host.js`: the interiors furnished and drawn; the cutaway (x).
- `57-vc-marks.js`: marks (p).
- `58-vc-tools.js`: Paths, the pin, the editor (b).
- `59-vc-flora-edit.js`: the editor's flora mode (select, delete, plant).
- `ringsea.py` (beside `foreign.py`): the Voth watercraft of `kits/ringsea`, sealed (`RINGSEA`).

### 2026-10-09, second session (the owner's nine asks), all in README.md
1. **Ring Sea vessels:** the ferries, plus moored dhows, barges, junks and hulks (`VC.MOOR`, `VC.drawVessels`).
2. **Sky:** Voth's own sky, lifted live into `VSKY` (it is not in core/atmos yet).
3. **Weather:** core/atmos weather with its ash modes.
4. **Chinampas:** redrawn, with swbay plants.
5. **Ancestry:**
   - tombs face inward;
   - shader waterfalls;
   - its bridge moved off the falls;
   - walkable to the summit;
   - flora from the biome, with a new ash cherry (species 13 in swbay, `SWBAY.treeAt`).
6. **Bridges and causeways:**
   - replanned deck to deck (`CANT`);
   - every canton walkable from its ferry to its top;
   - no doors buried.
7. **Canton interiors:** for every canton but the Palace and Temple, and the cutaway (x).
8. **Markets and parks:**
   - real market stalls with stock;
   - the big parks' walks, lanterns, benches, avenues, groves and gardens.
9. **The flora editor:** select, delete, plant; saved in the edits file.

`verify.py --assert` now also walks every canton (the interiors from the ferry to the top deck; every bridge, the
terrace chains, the Ancestry and its catacombs), checks the bridges' grade and clearance, and checks the stalls, the
walks, the vessels and the flora editor's mapping.

### Last session's work, all verified
- **Dev tools** (`58-vc-tools.js`):
  - **Paths:** Voth's 87-pathviz, lifted by `build.py voth_pathviz_fragment()`. It shows streets by class, elephant bug and ferry lines with stations and live vehicles, and painted streets.
  - **The pin:** Dhelv's. Double-click drops it; G recenters on it; F walks from it. Walking follows the ground.
  - **Plan editor (b):**
    - place a Voth kit building, aligned to the nearest street and set back off it; Q/E turn it, R re-aligns;
    - paint a street of any class;
    - delete a building or a painted street;
    - undo, save, copy JSON.
  - The layout applies saved edits in `VC.applyEdits` (step 3) and `VC.applyDeletes` (after step 14). A full save → reload round trip was tested.
- **Embassies on the Foreign canton:** Hykkousoi, Iziz, Jimjam (the school), Republic, Dalab, Yuni.
  - `foreign.py` bundles the other builds' kit fragments, each in an IIFE behind a Proxy `window`, about 780 KB. It exposes `window.FOREIGN.place(culture,x,y,z,ry)`.
  - Sources: Dalab, Iziz, Republic and Yuni from settlements/dalab; Hykkousoi from ys; Jimjam from jimjam.
- **Canton decks:** granaries and mills, the arsenal, the market square, Port warehouses.
- **Census:** balanced (pop 46,631, workforce 23,316, jobs 23,219).
- **Transit:** ferries and elephant bugs follow Voth's collision rules. Elephant bugs queue at an occupied station; ferries berth two to a pier. Elephant bugs are Voth's 79c model with orange awnings.
- **Models:** rotating lighthouse beacons; better shrine and small-lighthouse models with doors and windows.
- **Harbour:** ship-spaced long piers (`TUNE.harbour.ship`).
- **Ring Sea kit** (`kits/ringsea`, verify OK, 28 vessels):
  - `81-rs-voth-junk.js`
  - `82-rs-hyk-galleon.js`: the galleon rebuilt as a Hykkousoi vessel
  - `83`–`87`: Voth ferry, taxi, river barge, pleasure barge, dhow
  - Seeds: next free is 73800.
- **core/simulation:**
  - new `77-sim-5r-routes.js` (the `transport` kind, `SIM.transportQueue`, `SIM.vehiclePose`);
  - edits to 0-core and 8-export, SCHEMA, PLAN and `test-sim.js` (57 checks pass, through `tools/node_in_chromium.py`; there is no node on this machine);
  - consumers rebuilt: mungo, shade, `core/simulation/example`.

### Open questions for the owner
- **Gallery (done 2026-10-09):** the city plan is in the Krator Worlds gallery as "Voth - new"; the old page is now "Voth - old" (`gallery/build_gallery.py` ENTRIES, `gallery/README.md`).
- **Unemployment:** suggestions 3 and 4 were never done. The owner asked for 1, 2 and 5 only, stopping when even.

## Working rules (owner and repo)
- **The refactor rules on origin/main** (CLAUDE.md, 2026-10-09, commit acc50484; local main is behind and has another session's staged work, so not pulled here):
  - don't add repo-wide tooling or rewrite a verify.py's harness block;
  - leave `core/terrain`, the biome placement core, the furniture batch and Voth's placement mask to the refactor;
  - new placement draws from `KRAND` cell-seeded, never reads canvas pixels, uses `x == null ? d : x` defaults and registers in `core/tags`;
  - don't copy infrastructure (camera, PRNG, noise, sky) into a build;
  - rebuild every build a shared change reaches.

  Streetlab predates this: its own `SL.stream` PRNG and raster are in `core/city/10-city-core.js` (the module's debts are listed in `core/city/README.md`). New work should not add more of that. Day and night (item 5) must take `core/clock` (KCLOCK), not a local clock.
- Edit only `src/` and `targets/`. Never open `dist/`, `three.min.js`, `archive/` or `*.zip`. Read fragments over 30 KB by section (`grep -n '^/\* ===='`). `33-vc-country.js` is 63 KB.
- Use no canton-specific Voth pieces. Put regular city buildings on the cantons.
- Shell gotchas:
  - Write patch scripts with the Write tool, not heredocs: heredocs eat `\'` and `\n`.
  - Don't use trailing `//` comments in packed fragments.
- **Refreshing the indexes:** `tools/audit_port.py` and `tools/make_index.py` rewrite every build's files.
  1. Back up every INDEX/PORT file first.
  2. Run the tools.
  3. Restore all but streetlab's.

  `tar` fails here on the `C:` path; use `cp`.
- After a change to the street method: rebuild, run all three verifies, take one screenshot per meaningful change.
- On Windows, `window.dispatchEvent` of a synthetic key reaches the window's listeners in registration order. Dispatch on `document.body` to test the capture-phase handlers in `58-vc-tools.js`.

## The owner's to-do list for the next session (in the order given)

**2026-10-12: the work is the citizen simulation** (`SIM-ROADMAP.md`; phase A session 1 is done, see the top of this
file). The list below is the earlier session's.
1. ~~**River gate terrain**~~ **done 2026-10-09:** `VC.levelGate` (`30-vc-site.js`) cuts and fills a level pad under any gate on a slope, at the road's height, meeting the ground at `TUNE.wall.padSlope`. It edits TERR's delta and SL.ground. The River Gate was cut 7.1 m; the Harbor and Spirit gates got pads too (the step 5 log lists them).
2. ~~**The swbay biome**~~ **done 2026-10-09** (README "The flora").
   - The parks have the jungle; 110 trees in 14.7 ha, sparse. Raise `TUNE.flora.quality` if the owner wants more: it raises the savannah too.
   - The environs are savannah: about 6000 trees.
   - The canopy ceiling is `SWBAY_TEMPLE_H` = 40 in `build.py`, with crowns scaled by `TUNE.flora.crownK`.
   - The kit is read from `core/biome` and `biomes/swbay/src` (nothing vendored). Don't load a second biome kit into this page: `BIO.iridBarkMat` clashes (CLAUDE.md).
3. ~~**Park and plaza furniture**~~ **done 2026-10-09** (README "Park and plaza furniture"). It places 393 benches, 127 statues, 3 wayside shrines, an obelisk and 2 braziers, from the catalog's Voth section (lifted by `build.py`). `src/52-host-buildings.js` (shared with the toy) now draws `FURN` keys through `buildFurn`.
4. ~~**Street lighting**~~ **done 2026-10-09**, with the owner's power and light rules (`37-vc-light.js`, README "Power and light"): power houses in the industry district, the electric reach, and street lamps socketed in `SL.addWay`. The lamp kinds are electric, fancy lantern (wealthy streets, canton decks), lantern and torch. The census is even again (power-house staff). **Not done:** lit windows by light kind at night; that belongs with item 5, as do lamp glows dimming by day (`VC.drawLampLight`).
5. ~~**Day and night**~~ **done 2026-10-09** (README "Day and night"):
   - One core/clock `KCLOCK` (72-minute day) drives everything, opening at 10:00 and running, with 1x/2x/4x/8x, run/hold and an hour slider. Core's preview default is a held clock; `TUNE.clock.running` holds it.
   - The sun comes from Voth's own `skySunDir` (lifted), with `PAL.sky` colours and planetshine at night.
   - Lamp glows are core/atmos `glowAdd`, with per-lamp on and off hours.
   - Vehicles and SIM read the clock.
   - **Not done:** lit windows by each building's `light` kind.
6. ~~**River barge clipping**~~ **done 2026-10-09:** each barge now moors across its pier's head, parallel to the current, `TUNE.bargeClear` off it. It is placed only where every corner floats, and it is in `VOTH.PIERS` (`barge:true`), so the boats steer round it. The step 2 log and verify audit hull against pier: 4 barges, 0 clashes.
7. ~~**Elephant bugs and bridges**~~ **done 2026-10-09:** the elephant bug nav closes the water within `TUNE.bridgeBand` of a river bridge's line (beside its deck) and under every canton span (`VC.NAV.under`). Elephant bugs cross the river only along a deck, entered from its ends. They are drawn at the deck's height by Voth's own `lifeBridgeY` (lifted from `78a-life-core.js`). The verify audit, "striders and bridges", reports 0 samples in closed water, 598 on decks and 0 off the deck height.
8. ~~**Rename to "elephant bug"**~~ **done 2026-10-09** (the owner chose "everywhere", but not the hyperjungle's striders, which are a different animal):
   - **Renamed:** "silt strider" in prose, labels and docs across Voth's src and docs, the Voth building catalog's names (`voth-city-captured.js` and its generator `capture.py`), the furniture catalog's "Elephant Bug Transit Station", `LORE.md`, `core/simulation/ROADMAP.md` and streetlab.
   - **Streetlab also renamed:**
     - its labels that said just "strider": station and line names (the saved `site/voth-site.json` too), the site tool, the step names, the logs, the census, the Paths legend and the verify report;
     - its `TUNE` keys: `bugWade`, `bugSink`, `bugAwning`, `navFreeBug`, `census.jobs.bug` and `bugStation`;
     - its comment and doc prose.
   - **Kept:**
     - the owner's quoted words;
     - code identifiers (`VSTRIDER`, `STRIDER_*`, `striderPlaceLegs`, `voth_city_silt_strider_station`);
     - the data ids code matches on (`'strider'` kinds and the nav layer, `TUNE.transit.strider`, `'strider-guild'`, `BOARD_STRIDER`);
     - file names (`79c-strider-model.js`).
   - Voth is rebuilt.
   - The builds that bundle the catalog (`kits/catalog`, `kits/interiors`, `kits/ancients-interiors`, Locus, Mav's Refuge, Mungo, Verge) were rebuilt in the commit.
9. ~~**Placer menu**~~ **done 2026-10-09:** the editor's place mode shows a searchable grid of all 143 Voth kit pieces with pictures (`VC.edGrid`, `VC.thumbsStart` in `58-vc-tools.js`). Each picture is built once off screen, rendered into a render target on the page's renderer and kept as a data URL. Two are drawn a frame, and the ones a search shows go first. The variant select stays.

Earlier ideas, still open:
- Moor Ring Sea ships at the harbour piers (`TUNE.harbour.ship` spacing was made for them).
- Unemployment suggestions 3 and 4.
