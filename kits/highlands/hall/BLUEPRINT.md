# The Hall of the Republic: a blueprint

The house of the Iron Republic's **Assembly of Citizens** in Roketstad (`hl_rep_hall_republic`, `../src/78-rep-grand.js`
`buildHlRepHallRepublic`; placed on the Republic square beside the Mint and the Rocketeers' Guild,
`settlements/highlands/NOTES.md` round 9). Written 2026-11-09 on the pattern of the palace blueprints
(`kits/talia/palace/BLUEPRINT.md`, `kits/pylon/palace/BLUEPRINT.md`, `kits/eternian/palace/BLUEPRINT.md`); the rooms are
data in `kits/interiors/sets/highlands.js` (the item's `rooms`, `shells`, `stairs` and the two wings' `bodies`), and the
builder draws their walls, floors, stairs and doors from that data (`../src/72c-hl-plan.js` `hnPlan`) when the interiors
are on (`?interiors=1`).

## The brief, from the lore

- The Republic was born of the **Mutiny of the 3rd Legion** against the Izani Empire (`LORE.md` section 6.3). Its motto is
  *Serviz gir sidizan*, "service makes a citizen"; *kiñ* means tyrant. A citizen is one who has served, and the state is
  run by the citizens who have: an assembly, not a court.
- Its head of state is the **First Citizen** (the owner, 2026-11-09), who lives and commands in the Fortress
  (`../fortress/BLUEPRINT.md`). The Hall is the Assembly's house: the First Citizen comes to it to be heard, as a citizen
  does, and has no throne in it. The Assembly is presided over by its own **Speaker** (*Talsman* in Hajlandsk), chosen by
  the members.
- The capital institutions are the Hall, the Arsenal, the Mint and Treasury and the Forgehouse (`LORE.md` 6.3): the
  Treasury is the Mint's, so the Hall keeps no treasury, only **the Republic's Great Seal** and the Assembly's own records.
- Guild politics: the guilds (mercenaries, alchemists, farmers, smiths, mechanics, astronomers, salvagers, rocketeers)
  are the members' constituencies; the factions sit as **the Veterans** (the Legion's heirs, the old families of the
  mutiny) and **the Guilds** (the newer, richer trades). Each has its party room.
- Numbers assumed: about **300 members** (one for some 50 citizens of a Republic of fifteen to twenty thousand), seven
  standing committees, a clerk's office of a dozen, a serjeant's guard of twenty, a press of a few broadsheets.

## The chamber: a horseshoe (the fork, decided)

| Option | For | Against |
|---|---|---|
| **A horseshoe (hemicycle) of tiers facing the Speaker** (recommended, built) | The Legion's camp assembly (the *contio*: the soldiers in a ring before the tribunal) is the Republic's origin; a citizens' assembly with two loose factions and guild interests, not a government and an opposition; a ring of equals suits a people whose word for king is tyrant; the core of the ring hall (44 x 36 m) takes a U of five tiers 25 m across with room for the division doors round it | the factions cannot be read from the seating; the horseshoe needs more floor than benches facing each other |
| Opposing benches (Westminster) | sharp debate, the division by sides is legible; fits a narrower room | it presumes a government and an opposition, which the lore does not give; a hall 44 m wide would be half empty |
| A full circle with the Speaker in the middle | the most egalitarian | no front to speak from; the galleries would look at backs |

The horseshoe opens **north**, to the Speaker's dais at the back wall, so a citizen coming in through the Bar (the great
door from the Members' Lobby, south) faces the Speaker across the well. Five tiers, 1.5 m deep and 0.4 m high each, at
radii 6.75 to 12.75 m round a centre 12 m south of the dais, the arms running 8 m north: about 230 m of bench, some 300
seats at 0.75 m. The well holds the clerks' table; the dais (12.4 x 4.2 m, 0.9 m high, one step) the Speaker's chair and
the Republic's red hanging; the division doors open off the side aisles (8.75 m wide) to the two division lobbies.

## Zones

| Zone | Who | Where |
|---|---|---|
| Public | citizens who come to listen, petitioners | the forecourt, the great portal, the **Vestibule** (the Hall of Citizens), the public stair, the public gallery lobby and the **public gallery** |
| Press | the broadsheets' writers | the press stair from the Vestibule, the **press room** and the **press gallery** |
| Members | the 300 | the **Members' Lobby** off the Vestibule (kept by the doorkeepers), the chamber, the division lobbies, the cloakroom, the writing room, the dining room, the party rooms, the members' stairs to the committee floor, the wings |
| The Speaker and the clerks | the Speaker, the clerks, the serjeant | the back of the ring: the Speaker's Lobby (the back door from the service yard), his office and the seal room, the clerks' office, the guard |
| Service | cooks, porters, guards | the back door, the kitchen behind the dining room, the serjeant's guard room |

The public never meets the members' routes: the Vestibule's two stairs rise along its side walls to landings at the upper
storey, and from there to the public lobby (west) and the press room (east), which open only on their galleries; the wall
between them and the members' landings is blind. The Speaker reaches the chamber from his own lobby behind the dais.

## Storeys and sizes

Frame: the builder's; origin at the plot centre, +z the front (south, to the square), the platform top FL = 2.44 m. The
ring hall is 62 x 52 m round the core (44 x 36 m), centred at z = -10; the entrance block 22 x 14 m in front of it; the
wings 13 x 22 m at x = +-37.5.

| Level | Floor | Clear | What |
|---|---|---|---|
| Ground | FL 2.44 | 4.45 (ring), 8.5 (vestibule), 12.9 (chamber, to the clerestory at 15.4-20) | the chamber; the ring's ground storey; the vestibule; the wings' ground storey |
| Upper | FL + 4.7 = 7.14 | 2.7 (ring, under the ring roof), 3 (galleries, landings) | the committee floor; the galleries; the vestibule's landings; the wings' upper storey (FL + 4.2) |

The ring's ground windows (1.3 x 2.6 m) stand below the upper floor; the upper storey gets its own row (1.1 x 1.3 m) over
the keel heads, drawn with the interiors. The corner towers, the spire pavilions, the stepped tower over the chamber and
the clock stage stay solid.

## Rooms by function

**Ground, the ring** (inner faces; x across, z along the axis)

| Room | Kind | x | z | Notes |
|---|---|---|---|---|
| Members' Lobby | lobby | -8 to 8 | 8 to 15.5 | from the Vestibule (3 m door) to the Bar of the chamber (3 m) |
| Cloakroom | lobby | -22 to -8 | 8 to 15.5 | coats and swords left at the door |
| West stair hall | lobby | -30.5 to -22 | 8 to 15.5 | the members' stair up to the committee floor |
| Writing room | study | 8 to 22 | 8 to 15.5 | the members' letters and post |
| East stair hall | lobby | 22 to 30.5 | 8 to 15.5 | the members' second stair |
| Noes Lobby | lobby | -30.5 to -22 | -6 to 8 | a division lobby: in from the chamber at z 5, out at z -3 |
| Ayes Lobby | lobby | 22 to 30.5 | -6 to 8 | the other |
| The Veterans' room | committee | -30.5 to -22 | -28 to -6 | the old faction's party room; to the members' offices (west wing) and the chamber |
| Members' dining room | hall | 22 to 30.5 | -28 to -6 | to the library wing, the kitchen and the chamber |
| Serjeant's guard | guard | -30.5 to -18 | -35.5 to -28 | the Assembly's own guard |
| Clerks' office | study | -18 to -6 | -35.5 to -28 | the Clerk of the Assembly and his clerks |
| Speaker's Lobby | lobby | -6 to 6 | -35.5 to -28 | the back door; the Speaker's way to the dais |
| Speaker's office | study | 6 to 14 | -35.5 to -28 | |
| Seal room | store | 14 to 18 | -35.5 to -28 | the Great Seal and the Republic's charter, off the Speaker's office only |
| Kitchen | kitchen | 18 to 30.5 | -35.5 to -28 | serves the dining room |

**Ground, the core and the front**: the **chamber** (-21.5 to 21.5 by -27.5 to 7.5, the horseshoe above); the
**Vestibule** (the Hall of Citizens, -10.6 to 10.6 by 16.5 to 29.5, 8.5 m high, the two public stairs along its sides).

**Upper (FL + 4.7)**

| Room | Kind | x | z | Notes |
|---|---|---|---|---|
| Members' landings | lobby | +-(22 to 30.5) | 8 to 15.5 | the heads of the members' stairs |
| West and east corridors | lobby | +-(22 to 24) | -28 to 8 | along the chamber's walls |
| Committee rooms I, II | committee | -30.5 to -24 | -10 to 8, -28 to -10 | |
| Members' library | library | 24 to 30.5 | -10 to 8 | |
| Committee room III | committee | 24 to 30.5 | -28 to -10 | |
| Archive | library | -30.5 to -10 | -35.5 to -28 | the Assembly's acts and votes |
| Journal office | study | -10 to 10 | -35.5 to -28 | the clerks write the Journal of the Assembly here |
| The Guilds' room | committee | 10 to 30.5 | -35.5 to -28 | the second faction's party room |
| Public gallery lobby | lobby | -22 to 0 | 8 to 15.5 | from the public stair's landing; to the public gallery |
| Press room | study | 0 to 22 | 8 to 15.5 | from the press stair's landing; to the press gallery |
| Public gallery | gallery | -21.5 to 0 | 3 to 7.5 | a balcony over the chamber's south end, its rail on the chamber side |
| Press gallery | gallery | 0 to 21.5 | 3 to 7.5 | the same, east |
| Vestibule landings | lobby | +-(7.2 to 10.6) | 16.5 to 19.5 | the stairs' heads, railed over the Vestibule |

**The wings** (planned by the interiors kit's planner): the west wing is the **members' offices** (an anteroom and two
offices, three offices above); the east wing the **Assembly's library and records** (library, study, store; library and
store above). Each has its street door and a door into the ring (the Veterans' room, the dining room).

Five committee rooms (three on the committee floor, the two party rooms when the factions do not sit) for seven standing
committees: the committees share by day.

## Circulation

- Public: square, forecourt stair, portal (8.2 m, two leaves), Vestibule; up the public stair (west) to the public gallery
  lobby and the gallery; the press up the east stair to the press room and its gallery.
- Members: Vestibule, Members' Lobby (the doorkeepers' line), the Bar into the chamber; or round by the cloakroom and the
  stair halls to the committee floor; the division lobbies off the chamber's side aisles; the wings from the party room
  and the dining room.
- The Speaker and clerks: the back door into the Speaker's Lobby, the door behind the dais; the clerks' office and the
  guard off it.
- Service: the back door, the guard, the Veterans' room; the kitchen through the dining room (the kitchen has no door of its
  own: a fork below).

## Forks (each with a recommendation)

1. **The seating** (decided above): the horseshoe. Opposing benches only if the owner wants a government and an opposition.
2. **The First Citizen's place in the Hall.** (a) none: the First Citizen addresses the Assembly from the Bar like any
   citizen (recommended: it is the Republic's point); (b) a box in the public gallery; (c) a seat beside the Speaker.
3. **The kitchen's own door.** (a) through the dining room only (built); (b) a service door in the back wall at x 26
   (recommended when the yard behind is laid out: deliveries need not cross the dining room).
4. **Seven committees in five rooms.** (a) share by day (built); (b) take the west wing's upper storey for two more
   committee rooms and move the members' offices to the corner towers (recommended if the towers are opened).
5. **The corner towers and spire pavilions.** Solid now. (a) open the towers as the members' tea room and the Speaker's
   house (recommended, a later pass: the doors and stairs would need cutting through the wings); (b) keep them solid.
6. **The galleries' depth.** 4.5 m (two rows of benches, some 80 seats); a deeper gallery over the side aisles would need
   columns in the chamber (recommended against).
7. **The tower over the chamber.** Its stages (the clock, the loggia) could be the Assembly's bell and the signal post to
   the Fortress; left solid (recommended: ask the owner with the Fortress's signals).

## What is built (2026-11-09)

The 37 explicit rooms and the two wings' planned rooms, furnished from the Republican catalog (the new room kinds
`chamber committee gallery lobby guard` in `kits/interiors/sets/highlands.js`); the ring, the core and the entrance block
drawn hollow (69e6) with their base and cornice bands as rings open at the doors; 24 inner doors and every door on a
shell wall cut and hung (core/door, unlocked); four stairs in core/walk; the horseshoe's five tiers, the dais, the
members' benches (catalog benches on the tiers), the Speaker's chair, the clerks' table, the banners. The cut-away (X)
opens the Hall storey by storey. Catalog pieces the Hall would want and the catalog lacks: a curved members' bench with a
desk front, a rostrum, the mace and its table, the division clerks' desks (settlements/highlands/KNOWN_ISSUES.md).
