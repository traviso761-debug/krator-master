# openworld/catch-bowl: the Catch and the Bowl in the open world

**Plans only — nothing is cut and nothing is built.** Scoped 2026-11-24 to the owner's eight-item brief: assess the
terrain and find the pitfalls; implement the hazards; plan the sites and get them on the simulation; make setpieces for
the Twins' two trails and each named stop; implement bandits and Stalkers attacking caravans; build the plans out;
prepare for one simulation across the regions; and leave groundwork for later sessions.

| File | Read it for |
|---|---|
| [`PLAN.md`](PLAN.md) | **start here**: the proposed region and cut, the seam with `xanadu-oidong-highrift`, core adoption, the ten steps B0-B10, the simulation join, and the seven questions for the owner |
| [`PLAN-TERRAIN.md`](PLAN-TERRAIN.md) | the measured survey of map 5.1 and the twelve pitfalls (four blocking) |
| [`PLAN-HAZARDS.md`](PLAN-HAZARDS.md) | the heat, the cold, the thin air, the caustic storms, the crusts and the Stalkers on `core/hazard`, and the two core fragments they need |
| [`PLAN-SITES.md`](PLAN-SITES.md) | the thirteen sites: Jabal, Mantis, Stair, the White Gills Hermitage, the four oases, the minor settlements, the two salt works, and what each adds to the books |
| [`PLAN-SETPIECES.md`](PLAN-SETPIECES.md) | fixtures as a core idea, then Route B's five stops, Route A's insides, and the Catch's own eight |
| [`PLAN-RAIDS.md`](PLAN-RAIDS.md) | BF-05, BF-06 and BF-07, `SIM.outlaws`, the ambush of a carrier, and keeping the Tin-Skulls apart from the real Stalkers |
| `tools/survey.py` | every number in `PLAN-TERRAIN.md`, reproducible: `python3 openworld/catch-bowl/tools/survey.py [pins\|polygons\|floor\|basins\|routes\|walls\|drift]` |

**The headline findings.** Far more is in hand than the brief assumes: the biome kits (`catch`, `sedesert`'s Bowl,
`twins`), the building kits (`dasri` for Jabal and the oases, `iziz-vernacular`, `ancients` for Stair's Hill), the
Stalkers' models, the Catch's resource nodes, and — the biggest de-risking — **every overlay here already has its land
style, palette and fields in `core/world`** (`the catch` draws on `desert`/`catch` with `dune`, `salt` and `oasis` in
`WORLD.FIELDS`). The crossing is already on the simulation (`PROPOSAL-CATCH.md` C0-C5 done, 29 checks).

What is genuinely missing is four small core changes, each shared with `xanadu-oidong-highrift`'s own waiting work: a
**`trail`** way kind (`ROADS` fixes one grade and one width as constants), a **hazard binding** for a region page, a
**fixture binding** for authored setpieces, and **`SIM.outlaws`** / **`SIM.bounty`** (approved in scope, not built).

Four blocking pitfalls to clear first (`PLAN-TERRAIN.md` section 7): `biomes/catch`'s own oasis records are **75 to 209
km** from their map pins (P1); the two salt works are **not on the map** (P5); `core/world` has **no hazard binding**
(P3); and the Stalkers have **no buried pose** (P12).
