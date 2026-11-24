# openworld/catch-bowl: the Catch, the Bowl, the SE outer wall and the Stalker Range in the open world

**Plans only — nothing is cut and nothing is built.** Scoped 2026-11-24 to the owner's eight-item brief (assess the
terrain and find the pitfalls; implement the hazards; plan the sites and get them on the simulation; make setpieces for
the Twins' two trails and each named stop; implement bandits and Stalkers attacking caravans; build the plans out;
prepare for one simulation across the regions; leave groundwork for later sessions), and **revised the same day** for
the owner's second ask: *"Include se outer wall and stalker range in the Sim as well."*

| File | Read it for |
|---|---|
| [`PLAN.md`](PLAN.md) | **start here**: the region and its four provinces, the two seams, core adoption, the ten steps B0-B10, and the ten questions for the owner |
| [`PLAN-TERRAIN.md`](PLAN-TERRAIN.md) | the measured survey of map 5.1 over four provinces, the sixteen pitfalls with a glance table, and two corrections to the first pass |
| [`PLAN-HAZARDS.md`](PLAN-HAZARDS.md) | heat, cold, thin air, the caustic storms, the God-Bore, the rime whiteouts, rockfall, the crusts and the Stalkers — mostly **wiring `core/hazard` to `core/atmos/fx`**, not building |
| [`PLAN-SITES.md`](PLAN-SITES.md) | the sixteen sites: Jabal, Mantis, Stair, the White Gills Hermitage, Bāb al-Hawa, Ranger HQ, Hub 01, the four oases, the minor settlements, the two salt works, and the five highland tarns |
| [`PLAN-SIM.md`](PLAN-SIM.md) | **the simulation across all four provinces**: what runs today, the Godsgate's stops, `BOWL_TUNE`, `STALKER_TUNE`, Hub 01 as a source with no economy, and the `EAST_RIFT` join |
| [`PLAN-SETPIECES.md`](PLAN-SETPIECES.md) | fixtures as a core idea, Route B's five stops, Route A's insides, and the Catch's own eight |
| [`PLAN-RAIDS.md`](PLAN-RAIDS.md) | BF-05, BF-06 and BF-07, `SIM.outlaws`, the ambush of a carrier, and keeping the Tin-Skulls apart from the real Stalkers |
| `tools/survey.py` | every number in `PLAN-TERRAIN.md`, reproducible: `python3 openworld/catch-bowl/tools/survey.py [pins\|polygons\|floor\|basins\|routes\|walls\|seow\|union\|drift]` |

## The headline findings

**Far more is in hand than the brief assumes.** The biome kits (`catch`, `sedesert`'s Bowl, `seouterwall` with six
stations, `twins`), the building kits (`dasri` for Jabal and the oases, `iziz-vernacular`, `yuni`, `ancients` for
Stair's Hill and the Godsgate's Ancient works), the Stalkers' models, the Catch's resource nodes — and every overlay
already has its land style and palette in `core/world` (`the catch` desert/catch, `the bowl` desert/desert,
`se outer wall` **alpine/seouterwall**, `stalker range` highland/outlands), with `dune`, `salt`, `oasis`, `cold` and
`mist` already in `WORLD.FIELDS`. The crossing is on the simulation (C0-C5 done, 29 checks).

**The Godsgate is a road, not a wall.** `biomes/seouterwall/PLAN.md` carved a 100 km trans-cordilleran trench and the
carve landed: its thalweg runs **2,284 to 3,739 m at a median 1.1 % grade**, with the saddle crest at 3,620 m to the
metre, and all five highland tarns filled at their planned levels to the metre.

**The hazards are nearly all wiring.** `core/hazard`'s ambient bridge already carries `thin-air`, `cold`, `hot`, `dust`
and **`caustic-dust` whose row names the Catch's black storms**, with `KHAZ.sight`, `KHAZ.seen` and `KHAZ.aim` on real
aerosol optics; `core/atmos/fx` already supplies the fields (`ATMOS.airLoad` named for the karaburan, `ATMOS.gale` built
for the God-Bore, `ATMOS.dustSeason`). What is missing is the binding in `core/world`.

**What is genuinely missing is four small core changes**, each shared with `xanadu-oidong-highrift`'s own waiting work:
a **`trail`** way kind (`ROADS` fixes one grade and one width as constants), a **hazard binding** for a region page
(`48h`/`88h`, including the `KHAZ.provide` calls), a **fixture binding** for authored setpieces (`48f`/`88f`), and
**`SIM.outlaws`** / **`SIM.bounty`** (approved in scope, not built).

## Four blocking pitfalls, and two big decisions

Blocking (`PLAN-TERRAIN.md` section 9): `biomes/catch`'s oasis records are **75 to 209 km** from their map pins (P1);
the two salt-works pins are **not on the map** (P5); `core/world` has **no hazard binding** (P3); the Stalkers have **no
buried pose** (P12).

Decisions: the **SE outer wall's cordillera rescale never landed** — 83 % of it is over 6,500 m against its plan's
target of zero, although the pass and the tarns carved to the metre (P13); and **Gemini's three pins** — Bāb al-Hawa was
dropped as having "no lore" six days *after* the seouterwall kit gave it a page of it, and Ranger HQ, the Stalkers' only
counterparty, was never put to the owner at all (P6).
