# openworld/catch-bowl: one arid-and-mountain region of six provinces

The Catch, the Bowl, the SE outer wall, the Stalker Range, the Stalker Gate and the Twins — **751,000 km² filled in a
1,280 x 1,052 km box**, to be tweaked and perfected as one build before it joins the XOH region.

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

## Settled by the owner, 2026-11-24

Every question is answered; **`PLAN.md` section 12** has each one with what it changed, and **section 11** the nine map
and kit edits this work now owes. In short:

- **Six provinces, one region, and a rule.** *"Let's try and keep from splitting biome polygons between open world
  builds as much as we can help it. We'll combine twins and catch to these other regions to tweak and perfect this one,
  huge, arid/mountain region prior to joining to the XOH region."* So the **Stalker Gate** joins (*"i guess add it here.
  We'll want a network of waystations marking the trail through it"*) and so do the **Twins**: 751,000 km² filled, box
  px 913-1553 x 1043-1569, origin px 1233,1306. The whole crossing from the Bowl floor to the Twins' col is now one
  build, and the `EAST_RIFT` join to XOH is the **last** step rather than a parallel one.
  - **The Twins crossing becomes this region's work** (`PLAN-TWINS-CROSSING.md` W1-W6 move here): of twenty-two of its
    points, twenty lie inside `twins` or `the catch`; only Route A's Vale portal and Strongbow are region 2's, and the
    ways end there `short`. Region 2's built tube spec migrates, since 94 % of it was planned on ground its own cut does
    not hold.
  - **The Stalker Gate's network** runs through its four-way graben pass (breathable 1.08-1.30 atm floors), Ranger HQ as
    the anchor and Lake Vapora as the hub — **and no branch toward Hub 01**: *"There is no trail towards hub 01. People
    who go that way tend not to come back."*
- **The 16 MB page cap is lifted** — *"this place will be godot native and go into a godot ported version of the host"*.
  Section 4a says what that demands in return, which is the larger half: `[G data]` from the first line, GDScript twins
  and golden vectors landing with each new core module, and `core/export` as the acceptance test.
- **Bāb al-Hawa and Ranger HQ stay**; the Twins fort drops. Bāb al-Hawa's pin moves onto the Godsgate's thalweg and it
  keeps **120** permanent people. **Ranger HQ has 500**, on a **salary from the Yuni Emirate and a cut of expeditions'
  profits** — of expeditions, not of passing cargo, which points the Rangers at the Stalker Range rather than at the
  road.
- **The SE outer wall's rescale** takes the Godsgate's frame and a ~25 km disc at each of the five tarns; everything
  else stays high and airless.
- **Hub 01 is not immortal.** Its pressure resists attrition but can be ended — by an Heir or a Yusar at risk to
  themselves, or by a powerful PC with relics, an army and explosives — and the logistics of reaching it are part of the
  lock.
- **Parabola is the Bowl arcology; there is no Arcbeam-Stair tunnel, but there *is* a ruined bore from Stair to
  Parabola.** The old 2026-11-11 drop had killed the Catch's oldest lore; the bore restored with Parabola at its north
  end brings it back word for word (Yuni stripped the northern half, Stair's divers have the southern), and its line
  runs **straight down the Godsgate corridor** with up to 6.6 km of rock over it — which is why the Ancients graded the
  surface highway too, and why Bāb al-Hawa's 1,400 m shaft reaches the bore's summit section exactly. **P17**; the
  rename is owed in `LORE.md` §4 and four other files.
- **Hub 01 is a surmise, not a secret.** Foolhardy rangers have brought back reports of an Ancient facility; that it is
  the Stalkers' source is their guess. Three tiers of knowledge the build keeps apart, and the one built thing out there
  is the cairn where they turned back.
- **Two biome kits are owed**: `biomes/stalker-gate` (new) and `biomes/gills` (finished).
- **`biomes/catch`'s stale records are to be corrected**, and the Bowl's unnamed village is **Esper**.

**Every question is now answered.** `PLAN.md` section 12 has each with what it changed; section 11 has the eleven map
and kit edits this work owes.
