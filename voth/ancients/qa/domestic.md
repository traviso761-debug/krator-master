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
  row-filtered copy, whose per-type accounting is identical; the full kit's
  total should drop by ~0 net (dish −32k, mega +~70k, amph +~24k, over three
  decays).
