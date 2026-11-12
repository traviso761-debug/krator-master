# Strongbow today: the town and the ruin (plan, draft, 2026-11-11)

Strongbow is the Ancients' cliff arcology on **the scarp between the Oidong Valley and Xanadu**, 3 km north of the cataract by
which the valley's river leaves (scale model 5.1 px 1001,1596; the owner, 2026-11-11: "strongbow needs to be right on the
xanadu-oidong border - the same cliff the cataract is on - so that it offers a real advantage to anyone using its elevator").
- **The top** is on the lip, at about 1,400 m. The valley road from Longsong ends there.
- **The foot** is below, toward the Xanadu floor. The scarp falls about 3,100 m west to that floor over some 20 km, steepest at
  px 994-996. The region's notes are on `claude/cool-tereshkova-d594e8` (`aaed590fe`, `7cff97d0c`, `317dba7b4`).
- **Its elevator** is the way between, and the reason the place is worth holding.
- **The Rift line** reached it from the uplands to the south, but it is abandoned now (the owner, 2026-11-11).
- **Earlier sites**, now superseded: 1298,1647 (the valley's east end) and 1013,1585 (its west end).

The arcology as the Ancients built it, and the shape of its ruin, are `kits/ancients/targets/strongbow` (`NOTES.md` there). Its
parts are the tower with its crown and mast, the Nock and its landing pad, the Spine of drums and terraces, the lower hull, the
galleries on the face, and the terminus at the foot.

This plan is the place as it is **now**: the Sultanate's town in and around the ruin, the ruin's state part by part, the lifts
Xanadu built across its gaps, the lobby at the foot, and the trades. Facts the owner has not given are *proposed*.

## 0. The owner's brief (2026-11-11)

1. **"we can plan for a girder-style elevator or series of elevators connecting the levels in the gaps in the ruins."**
2. **"we should plan the surrounding settlement and the ruination of the arcology carefully."**
3. **No more than about 7,000 people in the whole structure.** "Large parts will be uninhabited and maybe cut off from each
   other."
4. **Xanadu uses the structure up to the first three terraces**, "though even that portion has damaged and unreclaimed areas".
5. **"The bottom portion should be more elaborate and have an actual lobby."**
6. **A floorplan, made with the large-building skill**: the painting-to-3d-world skill's `references/large-buildings.md`, the Span
   method, which lays the building out as data, checks it by rules and draws sheets per level.
7. **A budget of trades** within the arcology, against the trades in a more conventional city built radially around it.
8. **About half the people live in the arcology and its terraces, and half outside**, in other buildings.

The owner's answers on the scarp (2026-11-11), after the move:
- **The town is at the foot only.** At the top there is only a toll post and stables.
- **The elevator goes round the gaps on girder lifts.** Xanadu's girder lifts climb the Spine to the third terrace. From there a
  chain of external girder lifts climbs the bay's wall, past the outcasts and the Spine's torn head, to the Nock's west wing and on
  to the lip. It never passes through the Order's tower.
- **The Sultanate holds the top**: a Xanadui customs post and caravan yard at the lip. The Order stays sealed in its tower, with
  its own ramp.

The owner's answers to this plan's first questions (2026-11-11):
- **The line is abandoned.** The way is broken near Strongbow, and the terminus hall is a ruin the town builds over.
- **Outcasts hold the upper Spine**, above the third terrace: people beyond the Sultan's law, reached by their own rope ways.
- **The Order occasionally uses the Nock** to launch hot-air balloons and for signalling.
- **The town is rings and spokes** round the foot (first said of the bench; after the move to the scarp, at the foot).

Earlier answers that still hold:
- the Sultanate lives below and the Order above;
- the ruin stands on half its stays, and the tower leans;
- the scrap Xanadu set builds the town (`kits/xanadu`, `PLAN-SCRAP.md`, branch `claude/scrap-xanadu`).

## 1. What the build is

| | |
|---|---|
| Folder | `settlements/strongbow/`: this plan, then `src/`, `build.py`, `verify.py`, `strongbow_blueprint.py`, `floors/`, `AREAS.md` |
| The arcology | `kits/ancients/targets/strongbow`, read in place: its plan's records (`STRONGBOW.plan`, `STRONGBOW.ruin`) and its drawing. This build adds the **reclamation**: deltas by the same ids, saying who holds each part now and in what state (section 3). The target's page stays the Ancients' showcase |
| The lobby | the Ancient foot redesigned (section 4) in `kits/ancients/targets/strongbow`: it is the Ancients' building, so it belongs there, as built and as ruined. What Xanadu made of it is this build's |
| The town | on `core/city` (the city builder: a radial plan of rings and spokes round the foot, lots and infill as records), built with the scrap Xanadu set and the Xanadu kit (`XAK`, `kit_bundle.bundle(scrap=True)`) |
| The layout | a fragment that builds nothing (`src/30-sb-layout.js`, [G data]). It holds the zones, levels, rooms, lifts, ways and their states, keyed by stable ids in the arcology's own frame. The rules are plain functions with node negatives (`src/31-sb-rules.js`, `test-strongbow-town.js`) |
| The sheets | drawn from the layout by the shared generator (`settlements/voth/palace/blueprint.py`, through `strongbow_blueprint.py`): a sheet per level of the foot, one for the Spine's lower runs and terraces, a section through the whole cliff with every lift and stair, and the town's plan. `AREAS.md` is written by the sheet script, and a node test fails when it and the layout disagree |
| Life | `core/simulation` later: the population, jobs and trades budgeted here become its roles and workplaces |

## 2. The zones and who holds them

The arcology from the foot up, with the Spine's terraces numbered **from the bottom** (T1 is the lowest, at 108 m; the target's
records count them from the top):

| Zone | What | Who now | Reached by |
|---|---|---|---|
| **Z0 The foot** | the lobby, the terminus hall (a ruin), the podium's wings (section 4) | Xanadu: the bazaar, the serai built over the hall's ruin, the governor, the garrison, the salvagers' yards | the plaza; the valley road |
| **Z1 The lower Spine** | the drums from the foot up to T1, and T1 | Xanadu: homes and workshops | the lobby's great stair; lift L1 |
| **Z2 The middle Spine** | the runs from T1 up to T3, and T2 and T3 | Xanadu, **partly**: T2 and its runs reclaimed; the run from T2 to T3 burned and sealed; T3 a garden terrace, half reclaimed | lift L2 over the burned run |
| **Z3 The upper Spine** | the runs above T3 and the terraces T4 and T5 | **the outcasts** (the owner, 2026-11-11): about 200 people beyond the Sultan's law, in the soundest drums; the rest unsafe and overgrown. *Proposed*: runaways, debtors, deserters and those the Decree's courts cast out, living on salvage they trade down at night and on the terraces' wild gardens | **their own rope ways**: ropes, ladders and baskets down the face to the scree west of the Spine, out of the town's sight; the salvagers' lift L3, gated and guarded |
| **Z4 The Spine's head** | the top run and T6, torn off when the tower leaned (the target's ruin) | gone: its drums lie on the floor | nothing |
| **Z5 The Nock** | the deck at 520 m: the landing pad, the west wing on the rock, the centre leaning with the tower | **the Order, now and then** (the owner, 2026-11-11): it launches **hot-air balloons** from the landing pad and **signals** from the deck. *Proposed*: a balloon shed and a burner store on the pad's edge, a signal mast with mirrors and lamps on the west wing, which sees down the valley | from the tower only, by the Order's stair |
| **Z6 The tower** | 126 storeys, from 498 m to the crown at 960 m | **the Order of History Monks**: a sealed house in its upper storeys and on the crown, about 100 monks. The lower two-thirds are empty and sealed by the Order | the arc ramp from the plateau, through the Order's gate |
| **Z7 The face** | the galleries beside the Spine, the stays' sockets | the east galleries below T3: Xanadu (a few households, reached by girder bridges from T2); the rest no one | girder bridges from the Spine |
| **Z8 The lower hull** | fallen in three pieces in the scree (the target's ruin) | the salvagers' **quarry**: they cut it up for panels, glass and girders | the quarry road from the town |
| **Z9 The top** | the lip and the plateau: the rim gallery, the pad and its craft, the heliostats | **the Sultanate** (the owner, 2026-11-11): its customs post and caravan yard at the lip, where the valley road from Longsong ends and the elevator's top lift lands. The Order keeps the rim gallery's west end as its gatehouse at the ramp's foot (*proposed*) | the valley road; the elevator; the Order's ramp |

**Cut off from each other**: Z0 to Z2 are one place, joined by the stairs and lifts. Z3 is the outcasts', reached by their rope
ways from the scree and by the salvagers' lift L3, which the garrison guards. Z4 is gone, so nothing joins Z3 to the Nock and the
tower. Z5 and Z6 are the Order's, reached only from the plateau by the ramp. A rule checks this: with L3 shut, Z3 is reached
from the town only by the rope ways, which start outside it; nothing in Z0 to Z3 reaches Z5 or Z6.

## 3. The ruination, part by part (deltas by id on the target's records)

The target's ruin stays as it is, with the east stays snapped, the tower leaning, the Spine's head torn off, the lower hull
fallen and the mast kinked. This plan adds each part's **state** from a list:
- **reclaimed**: Xanadu lives or works in it; glazing replaced by scrap glass, panels re-hung;
- **damaged**: standing and walkable, but gutted, its glass gone, its services dead; squatted, stored in or used as a quarry;
- **sealed**: closed off on purpose (burned, unsafe, the Order's);
- **cut off**: standing, but reachable by no way;
- **gone**: fallen.

Each part's state comes from its own seed (`KRAND.child(world, 'sb:' + id)`) within the zone's share:

| Zone | reclaimed | damaged | sealed | cut off / gone |
|---|---|---|---|---|
| Z0 the foot | lobby, serai, bazaar, governor's wing: about 70% | the east wing's upper floors (fire, *proposed*) | the lower vaults (flooded) | none |
| Z1 the lower Spine | about 80% of its drums | 20%, used as stores | none | none |
| Z2 the middle Spine | T2 and its runs, about 50% | T3's pavilion ring | the burned run from T2 to T3 | none |
| Z3 the upper Spine | none (the outcasts' drums are *squatted*, a sixth state: lived in, not reclaimed), about 25% | about 35%, the salvagers' working faces | none | about 40%, the drums nearest the break, unsafe |
| Z4 the Spine's head | none | none | none | gone |
| Z5 the Nock | none | the west wing | none | the centre: leaning, cracked |
| Z6 the tower | the Order's upper 25 storeys and the crown | none | the lower 100 storeys (the Order's seals) | none |
| Z7 the face | the two lowest east galleries | the west galleries | none | the rest |

Done when the rules hold: every part has one state; a reclaimed part is reachable from the plaza by the ways in the layout;
no part above T3 is reclaimed (the owner's "up to the first three terraces"); each zone's shares land within ±10% of the table.

## 4. The lobby (the foot, redesigned)

The owner: "the bottom portion should be more elaborate and have an actual lobby". The terminus box is replaced by **the
foot**, the Ancients' podium where the Spine lands and the line ended. *Proposed* (Ancient programme, then Xanadu's use):

| Part | As built (the Ancients) | Now (Xanadu) |
|---|---|---|
| **The lobby** | a glazed hall 40 m tall and 120 m across, round the Spine's foot: the Spine's lifts rise from its centre, a great stair winds up round the first drum to T1, galleries on three levels | **the bazaar**: stalls on the floor, the money changers and scribes on the first gallery, the Spine's dead lift shafts used as light wells. The glazing is scrap glass in bronze frames (the scrap set's style) |
| **The terminus hall** | the Rift line's station 11: platforms under a vault on the west side, opening west onto the line | **a ruin the town builds over** (the owner, 2026-11-11: the line is abandoned). Its vault has half fallen, and the platforms are filled. The terminus serai (`xa_scrap_serai`) stands on them, with customs at the road's gate; the rest of the hall's floor is the caravans' yard |
| **The forecourt** | a plaza before the lobby, stepping down to the road, fountains | **the plaza**: the town's market square; the Wheel shrine (`xa_scrap_shrine`) on its east side; the girder gate where the road enters |
| **The east wing** | the arcology's works: freight docks, workshops, store vaults | **the salvagers' yards**: the guildhall (`xa_scrap_guild_salvage`), cutting sheds, stores. The upper floors are fire-damaged |
| **The west wing** | offices, the line's administration | **the governor's wing and the garrison**: the Sultan's governor, customs, the barracks (`xa_scrap_gate` at its door) |
| **The vaults** | plant and cisterns under the podium | **sealed**: flooded. The cisterns' upper level is used, through the Cistern Pavilion (`xa_scrap_pavilion`) on the plaza |

The foot is about 300 m wide and 170 m deep, with three to five storeys round the lobby. Its sheets are the first drawn.

## 5. The lifts (girder-style, across the gaps)

The Spine's own lifts died with the Ancients. Xanadu's lifts are **girder lift frames** with capstan-driven cages, like Girder's
(`settlements/girder`: `LIFTS`, the cage ridden up a frame, about 146 m), dressed in the scrap set's girders, cable and bronze.
*Proposed*:

| Lift | From, to | Why | Who |
|---|---|---|---|
| **L1** | the lobby (inside a dead shaft) to T1 | the great stair is long; goods go up | public, the lift guild's crew |
| **L2** | T1 to T2, on the outside of the Spine | the run from T2 down is sound, but the burned run above T2 is sealed, so L2 also climbs on to T3 past it | public to T2; T3 by permit |
| **L3** | T3 up the face to T5 | the salvagers' way into Z3, which the outcasts hold | the Salvagers' Guild, gated, guarded by the garrison; *proposed*: the salvagers pay the outcasts in kind to work their faces |
| **The rope ways** | the scree west of the Spine up to the outcasts' drums | the outcasts' own way (the owner, 2026-11-11): ropes, ladders, hauled baskets | the outcasts; not Xanadu's |
| **The bridges** | T2 to the two lowest east galleries | girder footbridges (`xa_scrap_bridge`) | public |
| **W1 to W5, the wall lifts** | from T3's level up the bay's west wall in five stages (about 150 m each, as Girder's frames), landing on the Nock's west wing at its outer end and climbing on to the lip | **the elevator** (the owner, 2026-11-11): the way between Xanadu and the Oidong Valley, round the outcasts' drums and the Spine's torn head, never through the Order's tower. The transfer landing on the Nock's west wing is walled off from the Order's pad (*proposed*) | the Sultan's lift guild; tolled at the foot's customs, checked again at the lip's post |

Each lift is a record: a frame, a cage and a capstan house at its head, with a lift crew. With the wall lifts the elevator is
L1, L2 to T3, then W1 to W5: seven stages from the lobby to the lip. Caravans' beasts and loads go up in cages; drovers walk the
landings between stages. The layout's rule holds that every lift
stands on a reclaimed or damaged part at both ends and clears the drums.

## 6. The people: about 7,000

| Where | People | What |
|---|---|---|
| **The arcology** | **about 3,500** | |
| the foot | 900 | the bazaar's traders, the serai, the governor's household, the garrison (150 soldiers in barracks), the salvagers' yards |
| the lower Spine (Z1) | 1,400 | homes in the drums, workshops on the lower floors |
| the middle Spine (Z2) | 800 | T2's homes and gardens; T3's garden terrace; the lift crews |
| the upper Spine (Z3) | 200 | the outcasts (not the Sultan's census) |
| the face (Z7) | 100 | the gallery households |
| the tower (Z6) | 100 | the Order (not the Sultan's census), with its balloon and signal crews on the Nock |
| **The town** | **about 3,500** | radial, round the foot (section 7) |

## 7. The town (radial, at the foot)

The town stands **at the foot only** (the owner, 2026-11-11). At the top there is only the toll post and stables, at the
Sultanate's caravan yard on the lip. The town rings the foot, with **spokes** from the plaza:
- **The road spoke**: the road from the Xanadu floor enters through the girder gate, with the bazaar street and inns.
- **The quarry spoke**: west, to the fallen lower hull, with the cutting sheds.
- **The fields spoke**: out across the scarp's lower ground toward the Xanadu floor.

Its **rings**:
1. **The inner ring**, against the foot: the rich courtyard houses (`xa_scrap_court`), the guildhalls, the bath (`xa_scrap_bath`).
2. **The middle ring**: the Panel Houses and Rows (`xa_scrap_house`, `xa_scrap_row`), the granary and stores
   (`xa_scrap_granary`, `xa_scrap_store`), the craftsmen.
3. **The outer ring**: the poor tier (`xa_scrap_tank_house`, `xa_scrap_silos`, `xa_scrap_hull`, `xa_scrap_glint`,
   `xa_scrap_shacks`).
4. **Beyond the rings**: the farms (`xa_scrap_farm`). **Owed**: what the foot grows and herds is the foot's height and climate on
   the scarp, from the region's data (the first draft assumed barley and yak at 2,568 m, which no longer holds).

`core/city` lays it out: the rings and spokes as the plan's streets, the lots by ring, infill from the set by the trades budget
below. The town stays off the scree and the quarry, and off the line's and road's ways.

## 8. The trades budget

About **3,180 working** of 7,000 (45%). *Proposed*; after the move to the scarp the lift crews, customs and the lip's post grew, and the farms shrank:

| Trade | In the arcology | In the town | Buildings (in the arcology: rooms in the layout; in the town: the set's keys) |
|---|---|---|---|
| Salvage (quarry crews, cutters, haulers, sorters) | 380 | 60 | the salvagers' yards, the quarry; `xa_scrap_guild_salvage` |
| Caravans (the serai, grooms, porters, drovers; the lip's stables) | 160 | 175 | the terminus serai; inns on the road spoke; the caravan yard at the lip |
| Trade (the bazaar, money changers, the merchants' guild) | 220 | 120 | the lobby; `xa_scrap_bazaar`, `xa_scrap_guild_hall` |
| Crafts from the hull (glaziers, panel-cutters, bronze-smiths, cable-makers) | 240 | 60 | drum workshops; sheds on the quarry spoke |
| Other crafts (smiths, potters, weavers, tanners, dyers) | 40 | 200 | the middle ring |
| Food (millers, bakers, brewers, cookshops) | 70 | 80 | `xa_scrap_store`; the middle ring |
| Farming and herding | 90 (terrace gardens) | 570 | T2 and T3 gardens; `xa_scrap_farm`, `xa_scrap_silos`, `xa_scrap_granary` |
| Building (the scrap builders, masons) | 40 | 120 | yards on the quarry spoke |
| The garrison and the watch (with the lip's post) | 150 | 55 | the west wing's barracks; `xa_scrap_gate`, `xa_scrap_tower` |
| Government (the governor, customs at the foot and the lip, scribes) | 50 | 20 | the west wing; the serai's gate; the post at the lip |
| The lift crews and the bridge wardens (L1 to L3, W1 to W5) | 122 | none | the capstan houses |
| Care (healers, teachers, the bath) | 30 | 40 | `xa_scrap_bath` |
| Faith (the Decree's shrines) | 10 | 15 | `xa_scrap_shrine` on the plaza and in the town |
| Fuel (charcoal, dung, the wood carts) | none | 60 | the outer ring |
| **Total** | **1,602** | **1,575** | plus about 100 monks in the tower |

**The trades census** (the owner, 2026-11-11: "also give me a trades census"): the budget trade by trade, as data in
`src/20-sb-census.js` ([G data], for `core/simulation` later). It covers 48 trades, with their workers in and out, the workplaces,
where they work and the scrap set's buildings, plus the Order's and the outcasts' work. `CENSUS.md` is written from the records, and
`node settlements/strongbow/test-census.js` checks the sums against this section and section 6 (each check with a negative).

## 9. Order of work

1. **The owner's answers** (given 2026-11-11: section 10).
2. **The lobby** in `kits/ancients/targets/strongbow`: the foot's records and drawing, as built and as ruined; GPU-verify; baseline.
3. **SB1, the layout as data** (done 2026-11-11). The parts:
   - `src/30-sb-layout.js`: 79 parts and 73 ways, among them the lifts, read off the arcology's own records;
   - `src/31-sb-rules.js`: 15 rules;
   - `test-strongbow-town.js`: every rule with a negative, plus `AREAS.md` checked current;
   - `layout_dump.js` and `strongbow_blueprint.py`: the sheets in `floors/`. S0 is the site, S1 and S2 the foot's two levels, S3 the
     Spine Xanadu holds, S4 the outcasts' Spine, S5 the Nock, S6 the top, and S7 the elevation with every way up.

   Found on the way: the wall lifts W1 to W5 stand on the face 12 m west of the bay. The west anchor stays' sockets moved 20 m
   further west in the arcology's plan, to clear them by 6 m. The owner reviews the sheets.
4. **SB2, the page** (done 2026-11-11): `kits/ancients/dist/strongbow-today.html`, the kit's target `strongbow-today`. It reads
   the arcology's fragments and `src/` in place and draws the ruin with the reclamation from the layout's records
   (`src/8ax0-sb-reclaim.js`):
   - the girder lift frames with their cages, capstan houses and the elevator's banners;
   - the wall landings and the girder bridges;
   - the outcasts' rope ways and their fires;
   - the sealed run's soot and the barred stair at T3;
   - the lobby's scrap glass on its south side and the bazaar's stalls;
   - stand-ins for the serai, the gate, the shrine and the pavilion;
   - the Order's balloon, shed and signal mast on the Nock;
   - the Sultanate's post and caravan yard at the lip, and the Order's banners on its gatehouse.

   The arcology's placeholder town is left out (`SB_TODAY`). Its lamps now burn only in the runs Xanadu holds.
5. **SB3, the town** on `core/city`, with the scrap set.
6. **SB4, life** on `core/simulation`.
7. Placement in the open world: the region's job, from the records.

## 10. Answered (2026-11-11)

1. **The line**: abandoned. The way is broken near Strongbow, and the terminus hall is a ruin the town builds over.
2. **The upper Spine (Z3)**: outcasts, people beyond the Sultan's law, reached by their own rope ways.
3. **The Nock**: the Order occasionally uses it to launch hot-air balloons and for signalling.
4. **The town's form**: rings and spokes round the foot.

Still *proposed*, for the owner to correct: who the outcasts are; the balloon shed and signal mast on the Nock; the fire in the
foot's east wing; the burned run from T2 to T3; the trades' numbers.
