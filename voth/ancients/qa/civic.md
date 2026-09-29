# QA pass — group `civic` (2026-09-29)

Types: Offices (42), Starport (44), Bunker (46), Library (48), Gate (60),
Robotics (62), Data center (72), Police (73), Hospital (74), Campus (76),
Government (79). Target `kit`, decays 0 / 1 / 3. Every builder keeps its
reseed except the two KNOWN_ISSUES asked to move (Campus, Gate).

Verified: `build.py --target kit`, `jscheck.py .syntax-kit.js` (PARSES OK),
`verify.py dist/ancients-kit.html --assert --views ...` — error panel clean,
every invariant PASS, showcase OVER as before (10 145 579, was 9 967 649).
Shots: `shots/qa_kit_civic/`. Rounds were rendered on a scratch copy of the kit
page that builds only these 11 types (the full kit loads in ~10 min here).

## Triangles (sum of decays 0+1+3, per-type scene content)

| type | before | after | |
|---|---|---|---|
| off | 161 282 | 183 040 | +13% |
| port | 141 098 | 151 210 | +7% |
| bunk | 24 336 | 37 176 | +13k (tiny type) |
| lib | 70 452 | 82 738 | +17%, most of it the decay-1 ribs that were missing |
| gov | 113 106 | 127 536 | +13% |
| arc | 227 324 | 267 018 | +17% (700k class) |
| robo | 81 092 | 92 304 | +14% |
| campus | 230 768 | 216 568 | -6% (hill trimmed) |
| dc | 79 632 | 113 448 | +34k |
| police | 33 624 | 45 644 | +12k |
| hosp | 80 960 | 104 922 | +24k |
| **group** | **1 243 674** | **1 421 604** | **+14.3%** |

## KNOWN_ISSUES items — tick these

- **"Seed collision: Library and Campus."** FIXED: `buildCampus` now `reseed(9810+d)`.
  Request (build.py is shared): delete the `('48-library.js','76-campus.js')`
  entry from `SEED_COLLISION_EXCEPTIONS`.
- **"Seed collision: Megastructure and Gate."** FIXED: `buildArc` now
  `reseed(9820+d)` (9990 is the Dish's). Request: delete the
  `('60-gate.js','87-mega.js')` entry too.
- **"Glass shards in ruined window openings"** — DONE for all 11 civic builders
  (the ~10 dead-window call sites here go through `civWin()`; see Helpers).
  Other groups' builders are untouched, so leave the item open or split it.
- **"Interiors are floor slabs only"** — DONE for the civic builders: `civRooms()`
  puts floor plates, corridor light strips, cabinets, touch panels and conduit
  bundles behind every ruined shell here (Offices A and B, Library crown and
  reading hall, Gate tower, Bunker casemate, Police, Hospital wards, Government
  tiers, the Data center's server floors, the Robotics hall).
- **"Campus wings should bend (UFM); the data-centre fin row needs hatches and
  ducts; the Gate deck needs an organic lattice; ... the robot chassis are
  placeholders"** — three of four parts DONE:
  - data centre: every bay has service hatches with lintels, two duct runs
    threaded through the fins with collars, a downpipe on every third fin,
    louvre banks on the short ends;
  - Gate: a crest lattice along the extrados, bone vertebrae arching over the
    plating tied by sinuous diagonals (one merged mesh, ~4k tris);
  - robots: real legged chassis (feet, shins, thighs, pelvis, tapered torso,
    shoulder yoke, two arms with clamps, sensor head, dark actuators), instanced;
    one ruined machine has lost an arm.
  - NOT DONE: Campus wings bending. `wing()` lays straight kit-box bars, and the
    courtyards, the forest exclusion and the stair all assume them; bending
    means rewriting `wing()` as segmented arcs — a redesign, not a QA fix.
- **"Remaining types still meet the ground on a hard line"** — aprons added to
  Offices A, Library (and reading hall), Government and both Gate feet. Bunker
  and Data center stand on berms, Campus on its hill, Police/Hospital on
  concrete discs, Robotics on its plinth: no apron wanted there.
- **"The repaired pass dresses every type identically ... a starport wants
  tents on the aprons"** — the Starport part DONE inside `buildStarport`
  (`d===3`: tents and water butts on the landing pads). The rest is shared.

## Found and fixed

- **Library ruin had NO RIBS.** `kdef('ribLibR')` ran again at decay 3, which
  wipes every instance already put under that name (decay 1's) and pushes the
  name into `KIT.order` twice, so decay 3's ribs baked twice. Now `civDef()`
  (guarded, lazy). Any builder calling `kdef` inside itself per decay has the
  same bug; a grep of `src/` found no other (the Wing's `wgHut` is top-level).
- **Campus hills overlapped by 180 m.** Hill 780 m wide on a 600 m row pitch:
  two terrains cut through each other and coplanar turf z-fought. Hill now 596 m
  with its fade inside ±290; the forest keeps to it.
- **Hospital helipad was buried** 3 m under the lobes' roof (y 62 vs 65). Raised.
- **Robotics: gantry rail ran through the robots' torsos** (rail at 16.5 m);
  now above them at 30.5 m with hoists. **Crane hook** stood 40 m tall centred on
  the jib, beside its end; now hangs from it.
- **Bunker gate** stood 3.6 m proud of the battered wall; now flush.
- **Gate fallen leg** hung 10 m in the air as four clean cylinders; now a braced,
  plated section set on the ground (`dropFragment`).

## Ruins that change the silhouette (were "intact with patches")

Offices A: a sector of the ring down, floors sticking out, roof bitten, wall
pieces lying beyond the plinth. Starport: the broken arm's outer vault has
pancaked. Bunker: the SE face breached in a V to the berm, slabs and spill down
it. Data center: the SE corner caved (an ellipsoid bite from both faces and the
roof) onto three open server floors with racks. Police: the south bay's roof
caved, two perimeter runs down, the tower's lantern on the forecourt. Hospital:
the lobe facing the camera fell (it used to be the back one, and its rubble lay
inside the podium); another torn at two thirds. Campus: wing 3 down across a
40 m bay. Gate: chords hang from the broken end. Starport arms got closed
hangar mouths (they ended in open half-tubes).

## Helpers (top of 42-offices.js; function declarations, safe to call anywhere)

`civDef(name,mkGeo,mat)` guarded lazy kdef · `civWin(name,p,q,s)` kput a window,
shards on ~half the dead ones (position hash, no rng draw) ·
`civShardAt(p,q,w,h,out,h01)` · `civRooms({...})` interiors · `civDA(a,b)`.
`civMergeGeo`/`civRobotGeo` in 62-robotics.js.

## Remaining / requests

- Campus wings bending (above). Government ruin still keeps its tier silhouette
  (the petal chamber and spire carry the ruin).
- `The Gate` preset (targets/kit/91z-views.js) stands 500 m past the Robotics
  row, so the factory's roofs fill the lower third of the shot. Pull it to
  z+900 or raise it.
- Draw calls: opening view 764 -> 814 (limit 900); Offices view 581 -> 629.
- MAT.dark reads mid-grey in daylight, so every "dark opening" in the kit is
  grey rather than black (shared material, not changed).
