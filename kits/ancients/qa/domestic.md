# QA pass — group `domestic`

Types: Houses A–C (`81`), Houses D–F (`64`), Apartments (`82`), Amphitheater
(`83`), Fuel station (`84`), Radar (`85`), Dish (`86`), Megastructure (`87`),
Factory (`88` + `40-factory-extras` + `78-factory-silo`), Laboratory (`89`).
Target `kit`. Every change was built, `jscheck`ed and rendered, and the shots
were read. Seeds unchanged; all new PRNG-consuming code runs AFTER the
builder's `figures()` call, so nothing that was already placed moved (except
where noted).

Numbers are scene triangles / meshes per decay (0 · 1 · 3), from
`verify.py --assert`.

**How the shots were taken.** The machine was running four QA agents at once
(load average ~60 on 4 cores) and a full-kit `verify.py` timed out in
`page.goto` (300 s). The later rounds were rendered from a scratch copy of the
built kit whose scene loop skips every row except this group's ten (a one-line
patch to the COPY, not to any source), which loads in a fraction of the time.
The shipped `dist/ancients-kit.html` builds and parses (`jscheck` OK).

## Factory (the Foundry)

Tris 167 235 · 173 796 · 129 436 → 165 315 · 171 876 · 128 674.
**Meshes 48 · 61 · 61 → 8 · 7 · 7.** Opening view draw calls 764 → 618.

- **"Further draw-call headroom … `fac` (109)"** — FIXED for the factory.
  `facSink()` (in `40-factory-extras.js`) collects every opaque surface with
  its offset baked in and merges per material at the end; glass and the two
  `dropFragment` pieces stay their own meshes. Triangle-neutral.
- **The three Foundry sites overlapped** (found in the shots, not listed).
  The plinth was 380 m wide on a 330 m row, so the rehabilitated plinth lay
  50 m into both neighbours' (coplanar tops, z-fighting), and the intact tank
  farm stood inside the rehabilitated cooling towers. Plinth now 324 m wide
  and centred (deeper in z, .76); tank farm + gantry moved 16 m west, gantry
  legs start at the ground; cooling towers moved east and slimmed to .85;
  the pipe rack and its deck follow the towers (the deck used to run 10 m
  into one).
- **Ruin dressing floated**: moss and rubble at y=6 out to r=190–200, past
  the plinth's z edge; a tree ring at r=210–290 ran under both neighbouring
  plinths with trees poking through them. Now kept on the plinth, and the
  ground planting runs in bands north and south of it.
- **"a factory wants scrap yards"** (Rehabilitated, repair-pass item) — DONE
  for this type in the builder at `d===3`: plate heaps, a pipe pyramid, a
  tarp-roofed sorting shed, a sheerleg hoist, water butts and planks on the
  south apron, where the Factory row shot looks. Kit items only (no draw
  calls). The shared `repairPass` itself is untouched.
- REQUEST (views are not mine): `Rehabilitated factory` puts its camera at
  world x=330, which is the middle of the RUINED Foundry — the shot is a wall
  of the ruin's hypar shell. Suggest `[0+150,8,fac.z+200, 0+110,60,fac.z-60]`.

## Megastructure (the Unnamed)

Tris 192 806 · 204 682 · 215 284 → 221 750 · 220 354 · 235 586 (of 700 000).
Meshes 15 → 16 · 18 · 18.

- **"Megastructure 'Unnamed' wants irregular Beksiński warts"** — DONE. 38
  clustered growths of 1–4 fused lobes on the faces, bunched toward the foot,
  each a displaced sphere (gridSurface, smooth normals), one merged mesh.
  ~29 000 triangles.
- **The ruin was the intact mass with holes** — FIXED. The west third of the
  crown has come down (top line falls from u=.42 to 58% of H, jagged), the
  roof and fins over it are gone, the floors show in the break as broken
  lengths of pale plate over dark soffit, and a talus runs down the west
  flank banked on the root mound. The outrigger has torn off its struts and
  lies toppled east of the mass (its torn ends skinned so they do not read as
  the flat face of the core box); struts are stubs with their spans on the
  ground. Vines moved off the fallen part of the crown.
- NOT MINE: the Megastructure/Gate seed collision.

## Houses A–C · Houses D–F

A–C tris 21 317 · 18 858 · 13 222 → 21 317 · 18 858 · 12 584 (meshes 28/25/25, unchanged — `petalRing`
is shared code and makes one mesh per petal).
D–F tris 3 852 · 4 606 · 7 188 → 3 852 · 4 462 · 6 652.

- **Each row's variants stood inside each other** (found in the shots): three
  houses at x=0/70/140 (and 0/60/130) on 120 m sites, so intact House C stood
  in rehabilitated House A and rehabilitated House F in ruined House D. Now
  30/70/110 and 25/65/105 — same middle house, so the presets are unchanged.
- **Ruins that were intact-with-rust** — FIXED: House B's front hypar shell
  lies face-down in front of the exposed room block; House E's span has
  failed west of the middle (floor hinged down to the ground, roof fallen
  beside it, glass box only the east half); House F's top tray is gone, its
  roof slab slumped onto the tray below.

## Apartments

Tris 128 076 · 118 328 · 79 982 → 128 076 · 115 650 · 81 256.

- Apartments B (honeycomb wall) ruin was the intact slab with holes — FIXED:
  the upper storeys over the east third of the arc have come down (a jagged
  bite to ~45% of the height), floor plates exposed in section, columns cut,
  talus on both faces.

## Amphitheater

Tris 9 440 · 13 814 · 17 434 → 16 704 · 25 496 · 29 136 (meshes unchanged, 6).

- **Open shell** — FIXED: the seating was a stepped skin on nothing (the rim
  wall only ran 24–30 m), so from outside or past either end of the sweep you
  looked straight under the whole rake (visible in the `Fuel station` shot).
  A cavea wall now carries the top row to the ground, pierced by 24 arched
  vomitoria, and both ends of the sweep are closed by walls that follow the
  rake. Merged into the existing tread mesh (no new draw calls).
- **Ruin silhouette** — FIXED: one sector of the upper cavea has slumped (up to
  seven top rows, the wall, the rim, the aisle and its struts), with a talus
  down the rake and into the void below.

## Fuel station

Tris 9 504 · 11 658 · 13 738 → 11 040 · 12 186 · 14 524.

- **Open shell** — FIXED: the "hovering disc" was only its 3 m rim band, so
  from the preset you looked through it to the forecourt. Soffit and a
  crowned roof added (the ruin's roof eaten through like its soffit).
- **Ruin silhouette** — FIXED: the canopy has slipped on its mast and hangs
  tilted (its light strips follow via `useGroupXF`), one lobe broken off and
  lying on the forecourt.

## Radar tower · Satellite dish

Radar 8 484 · 8 722 · 9 800 → 9 252 · 9 490 · 11 120.
Dish 19 324 · 20 908 · 24 174 → 8 572 · 10 156 · 13 860.

- Dish: removed a dead loop that `kput` 24 zero-scale `ringR` tori at the
  origin every decay (~10 700 invisible triangles each).
- Dish ruin: the fallen panel stood on edge like a fence (rotation left the
  paraboloid's 42° rim slope standing up); it now lies on the ground.
- **"Remaining types still meet the ground on a hard line"** — `apron()` added
  to the dish and radar pads. (Houses and fuel sit on thin slabs; the
  factory's plinth is square and the mega has its mound, so they were left.)
- Radar ruin already changed the silhouette (lattice cut, bar fallen).

## Laboratory

Tris unchanged (57 826 · 64 146 · 59 066). **Meshes 22 · 23 · 23 → 4 · 9 · 9.**
Roof, parapet, standing chimneys and caps, lattice dome, needle, porch roof
and both hut shells merged into one skin mesh. Shots read clean at all three
decays; no open items.

## Best shots
`shots/qa_dom_c/view_Factory.png` (three Foundries on their own plinths),
`shots/qa_dom_e/e_1.png` and `e_2.png` (Megastructure ruin: crown, floors,
talus, fallen outrigger, warts), `shots/qa_dom_c/view_Amphitheater.png`
(slump), `shots/qa_dom_c/c_0.png` (cavea wall), `shots/qa_dom_c/c_1.png`
(scrap yard), `shots/qa_dom_c/view_Houses_DEF_ruined.png`,
`shots/qa_dom_c/view_Apartments_ruined.png`,
`shots/qa_dom_e/view_Fuel_station_ruin.png`.

## Still open, and why

- Houses A–C still 25–28 meshes: `petalRing`/`luceShells` are shared code
  that add one mesh per petal/shell. Cheap to merge post hoc, but it needs a
  helper that bakes and removes child meshes without double-counting their
  stats (`12-stats.js`) — shared-code request.
- Glass shards, Gaudí mouldings, interiors behind openings (From the brief):
  need the shared helpers named in KNOWN_ISSUES; nothing type-local to do.
- `ROWV`/view fixes (Rehabilitated factory, above) are the coordinator's.
- The cavea wall's vomitoria are quad-stepped (hole predicate on a 20-row
  grid), so up close they read as notched rather than arched. A real arch
  needs `paraFill`-style shapes per bay; not worth the draw calls.
- A final full-kit `--assert` could not complete here (page load > 300 s
  under the machine's load). The per-type numbers above are from the
  row-filtered copy, whose per-type accounting is identical. Net change to the
  full kit over the three decays: about +72 000 triangles (mega +67k, amph
  +31k, fuel/radar +7k, dish −32k), under 1% of the showcase.

## Round 2 — 2026-10-01

Same rules as round 1: built, `jscheck`ed (PARSES OK), `verify.py --assert`
(error panel clean, every invariant PASS) and the shots read, on a scratch
target that builds only this group's ten rows (`targets/qadom/`, not
committed). No seed changed; the new code draws no rng at all (shards, rooms
and mouldings choose by position hash), so nothing already placed moved.

Tris per decay (0 · 1 · 3), round 1 → round 2:

| Type | Round 1 | Round 2 |
|---|---|---|
| Megastructure | 221 750 · 220 354 · 235 586 | 217 918 · 218 970 · 228 326 |
| Factory | 165 315 · 171 876 · 128 674 | 167 619 · 175 704 · 131 722 |
| Apartments | 128 076 · 115 650 · 81 256 | 128 076 · 116 392 · 81 694 |
| Laboratory | 57 826 · 64 146 · 59 066 | 57 826 · 66 418 · 62 232 |
| Amphitheater | 9 440 · 13 814 · 17 434 (*) | 49 152 · 53 304 · 56 944 |
| Houses A–C | 21 317 · 18 858 · 12 584 | 21 317 · 18 930 · 12 848 |
| Houses D–F | 3 852 · 4 462 · 6 652 | 4 620 · 5 344 · 7 440 |
| Fuel station | 11 040 · 12 186 · 14 524 | unchanged |
| Radar | 9 252 · 9 490 · 11 120 | unchanged |
| Dish | 8 572 · 10 156 · 13 860 | 8 572 · 9 372 · 14 262 |

(*) what was actually on the branch: round 1's amphitheater work had been lost
(below). Meshes unchanged except Megastructure +1 (the eye's bore) and House D
+1 (its moulding).

### Found: round 1's amphitheater was lost

The cavea wall, its vomitoria and the ruin's slump (round 1, commit 9358ef5)
were committed under `voth/ancients/` while the tree was being flattened into
`kits/`, and only reached the old path. The other ten fragments of this group
match round 1 byte for byte; `83-amphitheater.js` alone was the pre-QA bowl
again (open under the rake, ruin = intact with holes). Restored by targeted
edits, keeping Iziz's strut fix that landed since (struts meet the rim wall's
outer face). Worth a check by whoever owns the other groups: `voth/ancients/`
still exists in the tree as a stale copy.

### "Still open" from round 1

- **Glass shards, mouldings, interiors** — no longer blocked; done below.
- **Vomitoria quad-stepped** — FIXED. The wall is two bands: the arcade band
  (0–9.2 m) on a fine grid, so the arches are curves, and the plain band above
  on the old grid. Each arch also carries a bone moulding (jambs and head).
  +~32 000 tris per decay; well inside the 250 000 budget.
- **Houses A–C 25–28 meshes** (`petalRing`/`luceShells` one mesh per piece) —
  still open: shared code, unchanged reason.
- **`Rehabilitated factory` view** — already fixed by the coordinator.

### KNOWN_ISSUES

- Ticked: **Seed collision Megastructure/Gate** (fixed in the civic pass; the
  exceptions set in `build.py` is empty).
- Noted as partly done, left open: **glass shards** (civic + domestic done),
  **interiors** (civic + domestic), **Gaudí bone-work** (helper exists, three
  uses), **repaired pass identical everywhere** (Foundry scrap yard, Starport
  tents), **Unnamed warts** (done round 1, inside a multi-part item).

### Old low-priority requests

- **Dish floating wreckage** — FIXED. The ruin's holes were fbm bands across
  the paraboloid, leaving concentric rings of skin hanging in the air joined to
  nothing. Panels now tear away from the rim inward along a ragged line, so
  every surviving piece runs back to the hub; the rim torus went with them and
  the ribs end bare; a few punctures stay. The fallen panel is smaller (it read
  as a 55 m ramp). The rehabilitated dish (d=3) used the ruin's 1.1 rad droop,
  so repairPass's shacks perched on ring fragments in mid-air; it now keeps the
  intact tilt and loses only its outer panels, and the shacks sit in the bowl.
- **Shrink podiums for density** — fuel forecourt 52 → 48 m, Apartments C pad
  50 → 44 m (moss radii follow). The Foundry plinth is already tight to its
  tank farm and towers; the dish and radar pads carry their legs; the mega's
  mound and the houses' slabs are not podiums. Nothing else to take.

### Kit-wide detail

- **Glass shards.** Every dead kit window in the group now goes through civic's
  `civWin()` (Houses A, B, C; Apartments A and C; the Foundry's clover silos and the great silo's ring; the
  Lab's 105 big windows). The glazing that is mesh, not kit, gets the new
  `domShards()` (pane grid over an opening, teeth on ~half the panes by hash):
  House D's glass front, House E's surviving box, House F's trays, the
  Foundry's two great arched end walls. House D and the Foundry got transoms
  in the ruin, since a tooth at a pane head otherwise hung in mid-air.
- **Interiors.** `domRoom()` puts a ceiling strip, a cabinet or machine, now
  and then a touch panel and a conduit wherever the skin is eaten through:
  every Lab storey (plus a floor plate in the band between skin and liner, in
  the existing guts mesh), Apartments A's trays, House A's drum and House C's
  lobes (their dark liners pulled in from 0.4 m to 1.6 m / 1.3 m behind the
  skin so there is a room to see). Kit instances only.
- **Mouldings.** `domMould(pathFn, wallNormal, r, knots)` sweeps a knuckled
  bone roll along a path and returns a geometry to merge: the Foundry's
  archivolts, the Amphitheater's vomitoria, House D's apse edge.

### Found in the shots and fixed

- **Megastructure: the eye was a grey disc.** "A great circular void punched
  through the mass" was a capped kit cylinder over unbroken skin. Both faces
  and liners are now cut and the bore is an open lathe: you see sky through it.
- **Foundry: the furnace shells stood in the hall's end wall.** 60 × 48 m at
  z=96, they began 8 m inside the south end wall and filled its great arched
  opening from every southern view. Now 44 × 32 at z=104, clear of the wall,
  the cooling towers and the plinth edge.
- **Apartments A windows** tested the decay hole at the tray's world height
  instead of its local one, so windows were dropped and kept against the wrong
  part of the hole pattern. Fixed (no rng involved).

### Still open, and why

- Houses A–C mesh count (shared `petalRing`/`luceShells`).
- `voth/ancients/` stale copy in the tree (not this group's to delete).
- Helpers live at the top of `64-houses-def.js`; if civic's `civShardAt`
  changes signature, `domShards` follows it.
- Not rendered on the full kit page (load > 300 s under nine agents); per-type
  numbers above are from the scratch target, whose accounting is the same.

### Follow-up (after merging ancients-resume)

- **Rehabilitated Houses A–C had no petals** (civic found the same in the Government):
  `petalRing` scales its holes by `d`, so at d=3 the threshold was fbm<.9 and every petal
  was hole. Houses A–C now use a local `housePetals()` that scales by `HOLES` (decay 1
  unchanged) and returns geometries. House A (base, drum, 16 petals) and House C
  (column, lobes, caps; liners) are each merged per material.
  Tris house/3 12 848 → 20 778 (petals back); house/0 and /1 unchanged.
  **Meshes 28 · 25 · 25 → 6 · 7 · 7.**
