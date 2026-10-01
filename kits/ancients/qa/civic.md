# QA pass — group `civic` (2026-09-29)

Types: Offices (42), Starport (44), Bunker (46), Library (48), Gate (60),
Robotics (62), Data center (72), Police (73), Hospital (74), Campus (76),
Government (79). Target `kit`, decays 0 / 1 / 3. Every builder keeps its
reseed except the two KNOWN_ISSUES asked to move (Campus, Gate).

Verified: `build.py --target kit`, `jscheck.py .syntax-kit.js` (PARSES OK),
`verify.py dist/ancients-kit.html --assert --views ...` — error panel clean,
every invariant PASS, showcase OVER as before (10 146 021, was 9 967 649).
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
- Draw calls. Measured on the full kit before this pass (777dffc): Robotics
  yard **938 (already OVER 900)**, Data center ruin 825, Hospital ruin 804,
  Campus 785, opening 764. The first cut of this pass took Robotics yard to 992;
  since then the Gate's skin (chords, four plated faces, crest) is one mesh
  instead of 14-20 per decay (arc meshes 14 -> 4 / 23 -> 7), the Robotics roof
  bays and ruined glazing are 2 meshes instead of 16, robot joints use the
  shared `tube`, shards are one kit mesh and tents use `patchTarp`, so the only
  new never-culled kit meshes are civRobotW, civRobotR and civShard. On the
  civic-only page Robotics yard went 300 (before) -> 356 -> 274, i.e. now 26
  calls BELOW where it started. Full kit, final: **Robotics yard 910** (was
  938), Data center ruin 786 (was 825), opening 797 (was 764). Robotics yard
  is still over 900, as it was before the pass; the rest of that view's calls
  are other rows' meshes plus the ~50 never-culled kit meshes. Showcase
  10 146 021 triangles (was 9 967 649).
- MAT.dark reads mid-grey in daylight, so every "dark opening" in the kit is
  grey rather than black (shared material, not changed).

# Round 2 (2026-10-01)

Worked down "Remaining / requests" above, the KNOWN_ISSUES entries for these
types, the bunker-launcher request, and a look at every type at decays 0/1/3.
Rendered on a civic-only scratch copy of the kit page (`--target kit`, the
builder loop filtered to these 11 rows); draw calls re-measured on the full kit.
Every step: `build.py --target kit`, `jscheck.py` PARSES OK, `verify.py --assert`
error panel clean, all invariants PASS.

## Fixed / built

- **Government ruin changes the silhouette.** The upper two tiers have slumped
  in a sector west of the portico (toward the ruin camera): tier 3 open nearly to
  its foot, tier 2 above its first floor, both roofs bitten, the liner cut, the
  floors inside left standing exposed, and a spill of rubble and tilted roof
  slabs on tier 2's floor, the tier-1 terrace and the ground. Strips, moss and
  conduit the slump left in mid-air are culled after the fact (`civCull`), so
  no rng draw before the spill moved; the spill is drawn after `figures()`.
- **Rehabilitated Government had no petals.** `petalRing` scales its holes by
  `d` itself, so at decay 3 the threshold was fbm<.9 and every petal was hole.
  The Government now passes `HOLES` (decay 1 unchanged). *Houses ABC call
  `petalRing` with `d` too, so their decay-3 petals have the same bug (domestic
  group).*
- **Campus wings bend** (the UFM item). `wing()` lays each bar along a bow
  `f(T)=bow*(1-cos 2πT)/2` pushed downhill, bow = min(10 m, 4.5% of length):
  the ends keep their position AND tangent, so every joint in the chain is where
  it was, and 10 m stays inside the forest's 12 m keep-clear. Every loop and rng
  draw is the straight bar's; long boxes become chord segments. The ruined
  Library floors (wing 3) are two `sub` stretches of the same bow, and their
  debris follows it. Courtyard trees and hedges are mapped into the box the
  wings really leave open (they stood 8-30 m inside terraces).
- **Bunker launchers** face forward (the cupola's along +z, the two deck pods
  0.7-0.8 rad either side) at every decay; the ruin keeps the intact facing and
  sags nose-down (-0.32 rad) instead of lying level pointing anywhere.
  `aaBattery(...,aim)` keeps its `rr()` draw, unused.
- **Offices: the three variants stood in each other.** B at x=190 and C at
  x=330 made one site 430 m wide on a 265 m row pitch: the rehabilitated Office C
  stood inside the ruined Office A. B is now at x=105 and C stands behind them at
  (95,-75) (moved with KOFF and a child group, so REGISTER follows). Site 195 m.
  `Office C` presets (kit and worn targets) re-aimed.
- **Interiors.** Hospital podium: the dark core is pulled back 7.5 m and the band
  behind the ribbon is cut into ward bays at the facade posts, a bed in each,
  cabinets in some; ruined beds tipped. Data centre ruin: the dark mass's two cut
  faces carry floor edges at every server level, a column per bay and a few rack
  lights, so the cave-in reads as a building section rather than grey walls.
- **Mouldings.** Government: a hood following each arched window and a sill
  under it (`civHoodGeo`, one kit mesh, ~70 tris; a ruin has lost 30%), and a
  flared cornice lip on every tier (holed with the slump).
- **The Gate preset** pulled back to z+1000 and aimed higher: the apex tower
  was cut by the frame top. (No Robotics roofs in it any more.)
- **Draw calls.** `civFlatten(G)` at the end of every civic builder merges all
  opaque meshes under G by material, in G's frame (triangle-neutral; pixel-
  neutral: the Data centre and Robotics yard shots came out identical). Per-type
  meshes: off 13-16 -> 6-8, port 16 -> 4-8, gov 15 -> 4-5, dc 16-17 -> 2,
  hosp 7-8 -> 2, robo 8-15 -> 3-11 (its glass roofs stay separate). Civic-only
  page, worst view: 310 -> 167 (Police ruin); Data center ruin 308 -> 163,
  Robotics yard 274 -> 160, opening 236 -> 134. Full kit (vs the end of
  round 1): **Robotics yard 910 -> 619** (no longer over 900), Data center ruin
  786 -> 608, opening 797 -> 519, Hospital ruin 593, Police ruin 575. Showcase
  10 297 805 triangles (OVER the 6M target, as before; this branch adds ~70k).
  **What moved:** repairPass/wornPass sample G's faces in mesh order, so the
  decay-3 salvage dressing (and the worn pass) lands on different faces of the
  same shells.

## KNOWN_ISSUES

Ticked: both seed collisions (fixed in round 1). Annotated as civic-done but
left open because other groups share them: interiors, glass shards, the
Campus/data-centre/Gate/robots line (Campus bend now done; Mega warts and Sky B
crown remain), mouldings, the repaired-pass item (Starport tents), ground contact.

## Triangles (sum of decays 0+1+3)

| type | before round 2 | after | per decay after (0/1/3) |
|---|---|---|---|
| off | 183 148 | 179 890 | 67 500 / 58 696 / 53 694 (smaller site, fewer salvage patches) |
| port | 150 850 | 150 850 | |
| bunk | 37 176 | 37 176 | |
| lib | 82 822 | 82 822 | |
| gov | 127 796 | 169 772 | 47 092 / 61 946 / 60 734 (hoods, cornices, spill, decay-3 petals back) |
| arc | 267 442 | 267 442 | |
| robo | 91 640 | 91 640 | |
| campus | 216 568 | 236 776 | 72 260 / 77 132 / 87 384 (chord segments) |
| dc | 113 448 | 114 408 | |
| police | 45 772 | 45 532 | (decay-3 salvage resampled) |
| hosp | 105 384 | 116 148 | 32 260 / 43 528 / 40 360 (ward bays) |
| **group** | **1 422 046** | **1 492 456** | **+5.0%** |

## Still open

- The Gate's rehabilitated variant (x=0) stands 80 m from the intact one's east
  foot on the 800 m row pitch; its fallen leg reads as the intact Gate's debris
  from some angles. A row-spacing question (targets/kit, shared).
- Office C's roof pergola beams read as loose planks from low angles.
- Robotics: the intact hall's arched doors and the tower's bays still open onto
  MAT.dark (mid-grey in daylight; shared material).
- Mouldings are Government-only; a general `moulding(profile,path)` helper is
  still the shared item in KNOWN_ISSUES.
