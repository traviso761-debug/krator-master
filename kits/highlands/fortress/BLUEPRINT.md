# The Fortress of Roketstad: a blueprint

The Iron Republic's **military headquarters** and the **residence of the First Citizen**, its head of state (the owner,
2026-11-09). `hl_rep_fortress` (`../src/78-rep-grand.js` `buildHlRepFortress`), placed in Roketstad as the landmark "The
Fortress" (`settlements/highlands/targets/roketstad/88-rk-place.js`). Written 2026-11-09 on the pattern of the palace
blueprints (`kits/talia/palace/BLUEPRINT.md`, `kits/pylon/palace/BLUEPRINT.md`); its rooms are data in
`kits/interiors/sets/highlands.js` (the item's `rooms`, `shells`, `stairs` and the barracks' `body`), drawn by the builder
through `../src/72c-hl-plan.js` `hnPlan` when the interiors are on (`?interiors=1`). The Assembly's house is the Hall of the
Republic (`../hall/BLUEPRINT.md`).

## The brief, from the lore

- The Republic is the 3rd Legion's mutiny made a state (`LORE.md` 6.3): its head of state, the First Citizen, is a
  soldier's office before it is a civil one, so the First Citizen lives in the Legion's fortress and not in a palace; "service makes a
  citizen", and a citizen who commands lives by the command.
- Roketstad was the Izani Empire's munitions hub and an Ancient spaceport; the Republic's **Rocketeers** and the
  **Arsenal** (racks of rockets) make rockets its arm. The headquarters holds the **rocket corps' command** and the signals
  that reach the batteries and the town; the Arsenal itself is elsewhere in the town, so the Fortress keeps a **magazine**
  for its own guns and rockets, not the Republic's stock.
- Firearms are musket and cannon (`LORE.md` "Firearms"): an armoury of muskets, blades, lamellar; powder kept apart.
- Numbers assumed: the guard company of the Fortress about 60 (a third on duty), the general staff a dozen officers and
  as many clerks, the First Citizen's household about 15 (the family, a steward, cooks, body servants).

## Massing (kept; what was added)

The square curtain (72 x 64 m between the corner towers) with its hoarded wall-walk, four Peles towers, the gatehouse in
the front wall; in the bailey the **keep** (14 x 14 m, rubble to 11 m, stucco to 24 m, a jettied half-timber storey and a
hipped roof with bartizans), the **commandant's palace** along the back wall (24 x 10 m, stucco and half-timber, a gable,
a stair tower at its east end), the **barracks** along the west wall (9 x 24 m, stucco and log), the open stables and the
smithy along the east wall. Added with the interiors: **the bridge**, a covered half-timber gallery 10 m long on four oak
posts from the keep's first-floor guard hall to the residence's upper storey (the secure link); stone steps to the two
back towers' doors. The keep's string course and cap are rings round its walls (open inside), so its storeys are rooms.

## Zones

| Zone | Who | Where |
|---|---|---|
| Public | envoys, petitioners, officers of the town | the gate, the bailey, the residence's front door: the entrance hall and the Hall of Envoys |
| Military | the staff, the guard | the keep (its outside stair to the guard hall), the barracks, the magazine, the gaol, the wall-walk |
| The First Citizen's private | the family and household | the residence's upper storey, its stair in the entrance hall |
| The link | the First Citizen and the duty officers | the bridge: study to guard hall, then the keep's stairs to the war room |

The residence's private storey is reached only by its own stair and by the bridge; the keep only by its outside stair
(guarded) and by the bridge (from the study). The magazine and the gaol open on the bailey under the guard's eye, away from
the residence and the kitchens' fires.

## Storeys and rooms

Frame: the builder's; origin at the plot centre, +z the front (the gate), the bailey at y 0.

**The keep** (inner 12.8 x 12.8 m, x -20.4 to -7.6, z -20.4 to -7.6; a straight flight up each storey along a wall,
turning a quarter at each)

| Storey | Floor | Room | Kind | Notes |
|---|---|---|---|---|
| 0 | 1.4 | **Armoury** | armoury | muskets, blades, lamellar; its way in the stair from the guard hall |
| 1 | 5.2 | **Guard hall** of the duty officers | guard | the outside stair's door (south); the bridge's door (east) |
| 2 | 9.0 | **Intelligence** (east), **cipher room** (west) | study, signals | no windows on this storey: the cipher room is entered only through intelligence |
| 3 | 12.6 | **War room**: the general staff, the map table | war_room | windows to all four sides |
| 4 | 16.6 | **Rocket corps' command** (west), **signals** (east) | war_room, signals | the telegraph and the heliograph's orders go out from here |
| 5 | 20.6 | **Map store**: the archive of orders and maps | library | no windows |
| 6 | 24.8 | **Signal loft** in the jettied storey | signals | the lookout and the signal lamps |

**The First Citizen's residence** (the palace, inner x 3.4 to 23.6, z -25.6 to -16.4; the stair tower at x 23.8 left solid)

| Storey | Floor | Rooms, west to east |
|---|---|---|
| Ground | 1.0 | **kitchen** (the household's), **state dining room**, **entrance hall** (the front door, the stair), **Hall of Envoys** (the audience room, 6 x 9 m) |
| Upper | 5.0 | the First Citizen's **study** (the bridge's door), the family's **hearth room** (the tiled stove: the household's hearth, the Republic's nearest thing to a chapel), the **landing**, the **bedchamber** |

**The barracks** (planned by the interiors kit): the guard room by the door, the mess hall, the garrison's kitchen and a
store below; three barrack rooms above. **The back towers**: the **magazine** in the north-west tower (8.8 x 8.8 m, one
vaulted storey 1.3 m up, slit windows), the **gaol** in the north-east (the turnkey's room and three cells).

## Circulation

- Envoys: the gate, the bailey, the residence's door, the entrance hall, the Hall of Envoys; dining in the state dining room.
- The First Citizen: the private stair to the upper storey; the study; the bridge to the guard hall; up the keep to the war room.
- The staff: the keep's outside stair to the guard hall, the keep's stairs; down to the armoury.
- The guard: the barracks, the bailey, the magazine and the gaol, the curtain's stairs to the wall-walk.

## Forks (each with a recommendation)

1. **Where the First Citizen lives.** (a) in the Fortress's palace (built: the owner's brief); (b) a house in town with
   only an office here. Recommended (a).
2. **The secure link.** (a) a covered bridge at the first floor from the study to the guard hall (built); (b) a tunnel under
   the bailey from the palace's cellar to the keep's armoury (more secret, but the palace has no cellar and the keep's
   ground storey is solid below 1.4 m); (c) a new wing joining them along the back wall. Recommended (a), with (b) as
   a quest's secret way if one is wanted.
3. **The magazine.** (a) in its own tower, away from the residence and the fires (built); (b) under the keep (the classic
   powder vault: closer to the guns, but under the headquarters). Recommended (a).
4. **The household's quarters.** The palace's attic is a solid gable (its end walls are wedges): (a) the household lives
   in the town and the body servants in the barracks' third room (built); (b) open the attic over the half-timber storey
   as the household's dormitory (recommended next: the dormers are already there).
5. **The front towers and the gatehouse's chamber.** Solid. (a) open the gatehouse's chamber (the portcullis winch and the
   gate guard) from the wall-walk (recommended when the wall-walk is walkable); (b) the front towers as guard posts.
6. **The keep's ground storey.** The rubble below 1.4 m is solid; the armoury stands on it. A cellar (a strongroom, the
   tunnel of fork 2) would need the plinth opened.
7. **A chapel.** The Republic's faith is a placeholder (`LORE.md` 6.3); the hearth room stands in for a household shrine.
   A shrine to the Legion's dead in the war room's storey is an option when the faith is settled.

## What is built (2026-11-09)

The 27 explicit rooms and the barracks' planned rooms, furnished from the Republican catalog (the new kinds `war_room
armoury magazine audience signals guard cell` in `kits/interiors/sets/highlands.js`); the keep, its loft, the palace, the
bridge and the two back towers drawn hollow (69e6); seven stairs in core/walk; every inner door hung (core/door, unlocked).
The cut-away (X) opens the Fortress storey by storey.
