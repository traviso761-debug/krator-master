# Krator World Life & Simulation Layer

*Travis's roadmap, kept verbatim so future sessions have the source `PLAN.md` answers to.*

## 1. Purpose

Krator's life layer should become an engine-independent simulation of the people, factions, settlements, resources, routines, transportation, and relationships that make a generated world feel inhabited.

The existing Voth and Mav's Refuge life systems already contain many of the necessary ideas:

- Voth has citizens, homes, destinations, social classes, guards, patrols, guild workers, merchants, caravans, ferries, ships, elephant-bug routes, temples, and faction-specific populations.
- Mav's Refuge has pedestrians, homes, soldiers, patrols, gathering parties, workers, lifts, beast handlers, drills, ladders, and day/night activity.
- Both already use navigation graphs, destination registries, role-specific behavior, schedules, squads, transportation routes, and world geometry as behavioral constraints.

The proposed system should preserve those concepts while moving them into a portable representation. The goal is not to export JavaScript AI directly into Unreal or Godot. The goal is: **Krator defines what the world is doing. Unreal/Godot decides how that behavior is embodied.**

```
                    KRATOR
                       │
             ┌─────────┴─────────┐
             │                   │
        World Definition     Asset Definition
             │
             ▼
       WORLD SIMULATION
             │
       World Behavior IR
             │
       ┌─────┼─────────┐
       ▼     ▼         ▼
   Three.js Unreal    Godot
    preview  runtime  runtime
```

## 2. The Core Design Principle

The current systems frequently answer: "Where should this particular NPC walk?" The new system should instead answer: "What does this NPC belong to, what does it normally do, what does it need, what places are available to do it, and what has changed in the world?"

The current Voth pedestrian system has destination categories (market, guildmarket, guildhall, arena, tavern, temple, park, shrine, dock, strider station, shop, compound, slum). Those should become world activities and affordances, rather than destination buckets. A tavern is not simply a coordinate. It is:

```
Activity: Drink, Socialize, Eat, Rest, Trade, HearRumors
Slots: 12
Faction restrictions: none
Opening hours: 16:00-02:00
Requirements: beverage available
Preferred populations: civilians, merchants, sailors
```

That same semantic object can then become a Three.js destination in Krator, a Smart Object in Unreal, an interaction point in Godot, or simply a simulation node when nobody is close enough to require a rendered NPC.

## 3. The Simulation Hierarchy

```
WORLD
 ├── Countries / Sovereign Factions
 ├── Settlements
 │    ├── Organizations / Subfactions
 │    ├── Districts
 │    │    ├── Buildings
 │    │    │    ├── Activities
 │    │    │    └── Resources
 │    │    └── Infrastructure
 │    └── Population
 ├── Trade / Supply Networks
 └── Wilderness / Ecological Systems
```

Individual actors sit inside that structure: Faction → Organization → Role → NPC → Squad / Group → Current Task. An NPC does not need a giant bespoke AI script; behavior is derived from their place in the world.

## 4. Factions

Factions are first-class simulation objects:

```
Faction { id, name, sovereign, parentFaction, ideology, culture, resources, territory,
          relations, policies, militaryStrength, economicStrength, knownLocations, controlledSettlements }
```

Nested political structures, e.g. Vothic Kingdom → Temple, Ordinators, Guilds (Carpenter, Merchant, Weaver, Navigator), Civilian Population. The Temple and Ordinators are organizations inside the Vothic political structure, not separate "NPC types". The same architecture describes Mav's Refuge → Refuge Guard; Screamers → Warbands; History Monks → Monastery; Player Faction → Expeditionary Company, Town Guard, Trading Office.

## 5. Foreign Faction Presence

A faction can have a presence in a settlement without controlling it:

```
Settlement: Mav's Refuge
Authority: Refuge Council
Foreign Presence:
    History Monks     status: tolerated
    Vothic merchants  status: tolerated
    Screamers         status: forbidden
    Beast Riders      status: visiting
```

Presence states: NONE, VISITING, TOLERATED, LICENSED, ESTABLISHED, COVERT, PERSECUTED, EXPELLED (labels configurable). The settlement authority determines what another faction may do. A History Monk in Mav's Refuge (tolerated: research, worship, socialize, trade; travel settlement + wilderness) entering Voth (persecuted: covert research, hide, travel, contact sympathizers; threat response: avoid Ordinators) changes behavior because the world changed around the NPC.

## 6. NPCs Become Data

```
Actor { id, faction, organization, role, socialClass, home, workplace, needs, inventory,
        capabilities, permissions, schedule, preferences, relationships,
        currentActivity, currentGoal, currentTask,
        health, fatigue, hunger, thirst, temperature, pressure, squad }
```

Mav's existing agents already have role, home, homePlat, speed, destination, squad, post, yard, state, timer. They need to stop being ad-hoc fields inside one JavaScript simulation and become part of a standard actor representation.

## 7. Roles Become Capabilities

A role defines what an actor can do, not what animation they play.

```
Fruit Gatherer: capabilities gather, carry, travel, trade, eat, drink; preferred activity gather_food;
                preferred locations nearby orchards, jungle; faction Refuge
Guild Smith:    capabilities smith, repair, trade, socialize, travel; preferred forge, guild_workshop, market
```

The animation of hammering metal is an engine concern. Six hours a day at a forge is simulation data.

## 8. Activities

The central abstraction: NPC → desired activity → available activity slot. Activities: FISH FARM MINE QUARRY CRAFT SMITH TRADE BUY SELL EAT DRINK SLEEP WORK SOCIALIZE WORSHIP RESEARCH GUARD PATROL TRAVEL GATHER HUNT FLEE FIGHT REST.

A location advertises activities:

```
Voth Dock 17:     unload_cargo, load_cargo, fish, board_ferry, socialize; slots 8
Guild Forge:      smith, repair, train; slots smith 3, training 4
Ruined arcology:  explore, salvage, research, fight, hide
```

## 9. The Player Faction

The player uses exactly the same system: Faction → Settlement → Buildings → Activities → Resources → Population. A player recruit is simply Faction: Player, Organization: Expeditionary Company, Role: Engineer, Home: North Crater Outpost, Workplace: Workshop.

## 10. Settlement Claims and Existing Behavior Networks

When the player claims the North Crater, the world already contains Screamers (territory North Crater, hostile, raiding settlements/caravans/travelers), Hyssoukoi (neutral; trade, travel, caravan), Beast Riders (variable; trade, raid, travel). The player's settlement becomes a new valid target / trade destination / relation to evaluate. No "Screamer raid AI" is written.

## 11. Relationships

```
Relation { factionA, factionB, diplomatic, economic, military, trust, hostility,
           tradeAllowed, travelAllowed, settlementAllowed, modifiers }
```

Directional and contextual, and also at the organizational level: Vothic Kingdom → History Monks: hostile, while Voth Temple → History Monks: extremely hostile. Presence is evaluated against the relevant authority, not one global number.

## 12. Squads and Groups

Mav's gatherers are a Gathering Squad {leader, members, destination, route, activity, state}. Likewise Ordinator Patrol {faction, members 5, route Customs → Fortress, activity patrol} and Merchant Caravan {faction, driver, guards, cargo, draft animal, origin, destination}. Groups are explicit.

## 13. The Player's Squad

Player Faction → Expedition Squad (Player, Scout, Engineer, Heavy, Scholar, Medic). Special only in that the player controls its high-level decisions. "Go to ruined arcology" decomposes into travel → establish temporary camp → explore → salvage → fight → carry relic → return. The engine handles movement and combat.

## 14. Needs

Needs exist at the actor level but are not simulated at full detail for every NPC. Player PCs: hunger, thirst, fatigue, temperature, atmospheric pressure, health, encumbrance, morale. A background civilian: food sufficient, water sufficient, shelter available. State expands only when the simulation needs it.

## 15. Macro Food and Resource Simulation

Settlements have stockpiles and flows (Voth: food 14,200; consumption 1,100/day; production 700; imports +500; net +100/day). Individual hunger does not remove an apple from a warehouse. Macro: stockpile → population. Local: NPC → Eat activity.

## 16. Supply Chains

First-class objects. Farm → Farmstead → Caravan → City Warehouse → Market → Population. Mine → Ore caravan → Smelter → Metal stockpile → Workshop → Player settlement.

```
SupplyRoute { origin, destination, resource, quantity, frequency, transportFaction, security, status }
```

The route is simulated, not every sack of grain.

## 17. Player Disruption

Destroy agricultural caravans → imports collapse → stockpile falls → prices rise → hunger → migration / unrest / political response. Destroy a mine → ore ↓ → metal ↓ → weapons ↓ → readiness ↓. Destroy a bridge → caravans reroute → travel time ↑ → some destinations unviable.

## 18. Infrastructure Is Behavioral

A bridge exposes Navigation (pedestrian, cart, strider), Transport (caravan route), Economic (trade connection), Military (patrol route), Strategic (chokepoint). Destroying it changes several systems at once.

## 19. Navigation

Semantic layers: pedestrian, road, vehicle, animal, water, climbing, air. Voth already does this informally. Engine adapters map to Unreal (NavMesh, StateTree, Smart Objects, EQS, Perception) or Godot (NavigationRegion3D, NavigationLink3D, NavigationAgent3D, interaction systems, state machines).

## 20. Schedules

```
Schedule { entries: [ {start:"06:00", activity:"WAKE"}, {start:"07:00", activity:"WORK"},
                      {start:"12:00", activity:"EAT"},  {start:"13:00", activity:"WORK"},
                      {start:"18:00", activity:"SOCIALIZE"}, {start:"22:00", activity:"SLEEP"} ] }
```

Soft priorities, not railroad tracks. If the forge burns down, WORK → unavailable and the NPC finds another appropriate activity.

## 21. Behavior Resolution

```
Schedule + Needs + Faction → Desired Activity → Available Locations → Permissions / Risk
→ Choose Target → Navigation → Engine Task
```

Scheduled WORK, role blacksmith, Guild Forge destroyed, repair workshop occupied → SOCIALIZE / IDLE / TRAVEL. Emergent behavior without a script per failure.

## 22. Life Simulation LOD

- Tier 0 Statistical: distant populations as numbers (Voth population 31,500; food 18 days; military 1,200).
- Tier 1 Group: caravans, patrols, crews, crowds as abstract entities (Caravan #182, Mine → Voth, iron, ETA 2.3 days).
- Tier 2 Individual: important NPCs and nearby groups with individual state.
- Tier 3 Embodied: spawned in Unreal/Godot with AI controller, navigation, animation, collision, combat, interaction.

Transitions are automatic.

## 23. Voth Translation

LIFE_DOORS / destination registry → ActivityRegistry (building, district, transport, social, faction activities). Citizens {race, socialClass, home, destination, active} → Actor {faction, race, class, home, workplace, schedule, preferences, permissions, needs}. Ordinators (fixed posts, idle wander, patrol routes) → Organization Ordinators; roles sentry, patrol, officer; activities guard, patrol, inspect, respond, arrest; restricted-area permissions; threat response investigate, pursue, call reinforcement. Guild workers → Guild → Workplace → Activity slots (forge supplies SMITH, REPAIR, TRAIN). Caravans → TradeRoute {origin, destination, resource, quantity, frequency, faction, security}; the visible caravan is the embodiment. Ferries and striders → TransportRoute {stops, schedule, capacity, faction, vehicle}; passengers are temporary occupants of the route.

## 24. Mav's Refuge Translation

700 pedestrians → PopulationGroup {faction Refuge, archetype civilian, population 700, residential zones, workplaces, social activities, daily schedule}; only nearby individuals embodied. Soldiers → Refuge Guard; orgs Gate Guard, Patrol, Training Yard; activities GUARD, PATROL, TRAIN, RESPOND. Gatherers → Squad Refuge Gatherers; activity GATHER_FOOD; resource jungle fruit; source Orchard / Jungle Gathering Site; route home → source → home; output food stockpile. The simulation knows "+43 food"; the animation shows picking.

## 25. The New Krator Life Schema

```
core/
    simulation/   world/ factions/ settlements/ populations/ actors/ groups/ activities/
                  schedules/ resources/ economy/ supply/ transport/ relationships/ diplomacy/
                  permissions/ navigation/ events/ simulation-lod/
    behavior/     primitives/ goals/ state-machines/ utility/ adapters/
    export/       world-ir/ unreal/ godot/

settlements/voth/
    world/        factions.json population.json activities.json resources.json routes.json relationships.json
    assets/ geometry/ simulation/ preview/
```

Format may be JSON, binary, or another compact representation.

## 26. Portable Behavior Primitives

MOVE WAIT SLEEP EAT DRINK WORK REST SOCIALIZE GATHER FARM HUNT FISH MINE QUARRY CRAFT REPAIR BUY SELL TRADE LOAD UNLOAD GUARD PATROL ESCORT FOLLOW EXPLORE SEARCH RESEARCH FLEE FIGHT INVESTIGATE WORSHIP TEACH STUDY BOARD DISEMBARK TRAVEL.

Composed: CARAVAN = TRAVEL LOAD TRAVEL UNLOAD TRADE TRAVEL. ARCOLOGY EXPEDITION = TRAVEL EXPLORE SEARCH FIGHT SALVAGE RETREAT.

## 27. Arcology Exploration

The world simulation only needs: Arcology {faction abandoned/hostile/unknown, accessibility difficult, threats present, relics present, entrances 3}. "Explore Arcology" becomes an engine-specific mission (squad movement, platforming, stealth, climbing, combat, puzzles) without the overworld becoming a platformer.

## 28. Ruins Should Have Their Own Simulation State

```
Arcology 17: ownership abandoned; known by Voth, History Monks, Player; threat high;
security ancient automated systems; resources relics, ancient components, data;
condition 73% unexplored; entrances collapsed, main gate, maintenance shaft;
faction interest History Monks high, Voth moderate, Screamers none
```

Recover a relic: relic inventory ↓, arcology stock ↓, player knowledge ↑, faction interest ↑. Destroy a defense: threat ↓, accessibility ↑. Sell the relic: wealth ↑, buyer knowledge ↑, political consequences possible.

## 29. World Events

```
Event { type, source, target, participants, location, time, consequences }
```

CARAVAN_DESTROYED FARM_RAIDED SETTLEMENT_FOUNDED FACTION_EXPELLED WAR_DECLARED TRADE_ROUTE_OPENED TRADE_ROUTE_CLOSED RELIC_RECOVERED CITY_STARVATION MIGRATION RAID_LAUNCHED BUILDING_DESTROYED BRIDGE_COLLAPSED. Events bridge simulation and gameplay.

## 30. Player Agency

The player becomes a new actor inside the simulation: unknown expedition → Player Faction with settlement, territory, allies, enemies, supply routes, reputation, military strength. The world responds using the same rules as for everyone else.

## 31. The North Crater Example

Canonical test. Before: Screamer territory, Hyssoukoi trade route, Beast Rider travel route, abandoned structures, minor resources. Player establishes an outpost → Player Settlement created → Screamers (hostile, raid hostile settlements) add it as a raid candidate; Hyssoukoi (neutral, trade permitted) add it as a caravan destination; Beast Riders (conditional) trade or raid. Nothing says `if playerBuiltNorthCrater: spawnScreamerRaid()`.

## 32. The Life Layer Becomes the World Layer

Rename to World Simulation Layer: population, economic, faction, behavior, transportation, resource, settlement simulation. "Life" becomes one subsystem.

## 33. What Krator Should Export

WORLD: geometry, assets, navigation, factions, organizations, populations, settlements, activities, schedules, resources, supply routes, transport routes, relationships, permissions, events, behavior definitions. Unreal: World IR → Actors, Smart Objects, StateTrees, Behavior Trees, Navigation, Data Assets, AI Controllers. Godot: World IR → Nodes, Resources, NavigationRegions, NavigationAgents, interaction objects, state machines, scripts. Krator remains authoritative.

## 34. What Happens to the Existing Voth/Mav Code?

Very little is thrown away; they are reference implementations. Voth teaches destination registries, faction-specific populations, road-constrained movement, pedestrian navigation, transport networks, caravans, ferries, guild workers, guards, restricted areas, infrastructure-driven movement. Mav's Refuge teaches individual actors, home assignment, schedules, day/night activity, squads, gathering expeditions, fixed posts, patrols, workplace behavior, transportation workers, specialized routines, animation state, pathfinding budgets. Extract these concepts rather than rewrite.

## 35. Development Strategy

- **Phase 1 Behavioral vocabulary:** Actor, Faction, Organization, Activity, Schedule, Group, Location, Resource, Route, Relationship. No engine integration.
- **Phase 2 Translate Voth:** civilians, Ordinators, Temple, guild workers, caravans, ferries, elephant bugs; make the existing Three.js simulation consume the new data.
- **Phase 3 Translate Mav's Refuge:** civilians, soldiers, patrols, gatherers, lift workers, handlers, drills. If both run from the same abstractions, the architecture is sound.
- **Phase 4 Faction relationships:** country, organization, foreign presence, permissions, relations (the History Monk / Voth / Refuge example).
- **Phase 5 Resources and supply:** food, water, raw materials, manufactured goods, stockpiles, trade routes, production, consumption. Start abstractly.
- **Phase 6 Player faction:** faction, squad, inventory, settlement, relationships, territory on the existing simulation.
- **Phase 7 Engine adapters:** Krator → Unreal, Krator → Godot, mostly an embodiment layer.

## 36. The Most Important Architectural Rule

**Never encode a world rule solely in the visual implementation if it could exist as simulation data.**

Bad: `if (x > -500 && x < 200 && faction === "screamer") spawnRaid();` Good: Screamer faction, territory North Crater, hostility Player, behavior raid hostile settlements.
Bad: merchant walks to this coordinate. Good: Merchant preferred activity TRADE; Market activity TRADE, capacity 20.
Bad: Mav's gatherers walk to these four coordinates. Good: Gatherer activity GATHER_FOOD; Jungle region resource FRUIT, gatherable true.

That is the difference between a procedural scene generator and a procedural world simulator.

## 37. The Resulting Game

The world begins with countries, factions, cities, villages, religions, guilds, trade, resources, wars, ruins, ecologies. The player starts as an insignificant squad: explore, recruit, trade, steal, recover relics, establish relationships, discover places already doing things. Player squad → faction → outpost → settlement → regional power, and the world reacts because the settlement enters the same networks as every pre-existing one.

Krator should not generate NPCs that happen to walk around a world. It should generate a world in which NPCs, factions, settlements, resources, and routes have reasons to exist, and then generate the visible NPC behavior from those reasons. Voth and Mav are the first two hand-built experiments; the next step is to extract the rules they independently discovered into a common simulation language.

## The five dimensions

| Settlement | Dimension | Question |
|---|---|---|
| Mav's Refuge | Routine | What does an actor normally do? |
| Voth | Society | How does a dense settlement function? |
| Locus | Mobility | How do different populations and transportation systems move through the world? |
| Hexahedron | Change | How can events alter actors, affiliations, and populations? |
| Dalab | Capability & Knowledge | What can an actor physically do, what services can they seek, and what do they believe about the world? |

These connect: an injured NPC believes Dalab has the best healer, plans a cross-country journey, encounters a caravan, changes affiliation after being captured, eventually reaches Dalab, receives treatment, and later hears a rumor from the AI god that changes their next goal.
