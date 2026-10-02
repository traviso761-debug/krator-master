# Ys against the Godot port plan

`GODOT-PLAN.md` (main, 2026-10-02) sets the direction: three.js generates and previews, Godot runs the world. This
file reads the Ys build against it and says what changes in `PLAN.md`. Written 2026-10-02 from the branch
`claude/youthful-planck-je9tyg`, which left `main` at 1672677, 398 commits before the plan; Ys is not on `main`,
has no `PORT.md`, and is in neither `PORT-INDEX.md` nor `PORT-BASELINE.json`. Phases 0–2 of PLAN.md are built (the
phase 2 merge closed on Oct 1: `--assert` green on kit, mock and city, 93 defs, the Citadel in); P3, the city
itself, has not started, which is what makes most of the items below cheap: nothing placed has to move.

## The numbers

`tools/audit_port.py settlements/ys` (main's tool run over this tree, provisional tags):

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB (of 872, 64 fragments) | 166 | 28 | 29 | 38 | 611 |

Two corrections before the table means anything. Four agent fragments (`65-hyk-spans`, `77-hyk-military`,
`78-hyk-agri`, `79-hyk-markets`, 90 KB) are tagged [G data] because they never write `THREE.`: they draw through the
Hykkousoi shell kit (`hykPut`, `hykLathe`, `hykTube`), which is the abstraction the tool's counts cannot see. They
are [draw]. Real [G data] is about 76 KB (9 %), real [draw] about 700 KB (80 %). The tool will mis-tag every future
Hykkousoi fragment the same way; the `PORT.md` Ys gets at the merge needs those cells set by hand.

## What already fits the plan

- **The city layout is data** (`targets/city/87-city-layout.js`): the lattice, blocks, kinds, uses, wealth and host
  choice are plain records. The overlay that draws them is the only reason the tool says "split"; it moves to its
  own fragment.
- **The land–sea lattice and NAV** (`84b-city-shore.js`, `87b-city-nav.js`) are Float32 grids and an A\* with no
  three.js in them. They are the shapes Phase 2's `core/terrain` (land cover, water level) and Phase 5's NAV contract
  (an A\* grid resource) ask for. `NAV_EXTRA` stair and ladder links are the layer links the sim plan wants.
- **The ground is painted with polygon stamps, not a canvas** (`87c-city-paint.js`, `kind:'paint'` on the adapted
  port terrain, read by signed distance). Ys never had the canvas-mask hot spot that Iziz, Dalab, Erewhon and
  Roketstad have; its stamps are already the `core/mask` shape and can move onto it with no change in placement.
- **Everything placed leaves a record**: `REGISTER` volumes, `ysMark` (doors, windows, lights with building, kind,
  position, normal, level), `hykRoom`/`hykSpot`, `HYK_PLACED`, `FURN_PLACED`. Together they are most of a
  `core/tags` registry and the Yuni `KRATOR_EXPORT` record shape the plan names as the city export template.
- **The 92 kit pieces are [draw]** and cross over as meshes through the exporter with no port work. The fan-out's
  output is not lost under the plan; only its unfinished look-rounds are worth less (Godot renders; three.js previews).

## What does not fit, and what to do

1. ~~**Not on main, no audit row, no baseline, no lint.**~~ *Done 2026-10-02:* Ys is on `main` with a `PORT.md`,
   its three pages in `PORT-BASELINE.json` and the port lint in `build.py`. Ys is one of the builds the plan's
   scoped hand pass covers (`GODOT-PLAN.md` 3.3), so the four agent-fragment tags above are corrected there.
2. **`biomes/nwbay` sits on the biome core as it was at 1672677.** Main's core has moved since (hero trees as an
   opt-in, the export, `BIO.register`). Re-vendor it onto main's core before any more work on it; its `host-*` set is
   one more version in the drift table Phase 1 is about to collapse.
3. **The terrain is a closure** (`YS_NAT`: shore, sink, karst, river), one of the plan's 39 `terrainH` definitions.
   Phase 2 bakes these to a heightmap at a fixed step. Ys's port grid (10 m tensor cells) is already a grid; bake
   `YS_NAT` into it once and sample. The river profile is already a sampled array; the karst and the sink are
   analytic and bake with the rest.
4. **The random stream is the lineage's copy** (`reseed`/`rng`/`h3`/`fbm` in the vendored `10-core.js`), one of
   the 26 the plan replaces with `core/rand`. *Done 2026-10-02 for the city:* `core/rand` exists and the city
   target takes it (`TARGET_CORE` in `build.py`); the page is the old page plus `KRAND`, byte for byte, so nothing
   moved. **The P3 placement pass draws only from `KRAND`**: a stream per pass (`KRAND.stream(KRAND.child(seed,
   'blocks'))`), cell seeds for anything placed by area (`KRAND.cell`), and `KRAND.fbm` for any field it reads.
   It does not call `rng()`, `h3`, `vnoise` or `fbm` from `10-core.js`. The kit and the mock keep the lineage's
   stream and noise (their look is gated by Travis; moving it is a separate choice), and `10-core.js` stays
   vendored unchanged.
5. **Placement inside draw code.** `hykAccrete` decides where satellites, drips and way-in pods go while drawing
   them; `hykBridge` decides where runners land (`hykSegNearest`). Rule 5 of the plan (a builder takes a record and
   draws it) wants a growth pass that writes pod and runner records and a draw pass that reads them. The P3 placer
   (`88-city-place`, planned as records then `90a/90b` build passes) is already that split; extend it down to growth.
6. **Furniture is a seventh copy of the glue.** `35-furn-frame.js` (`FURN`, `placeFurn`, `F.*`) is Ys's own piece
   format, not the catalog's SPEC entries, and `FURN_PLACED` is Ys's own record. Phase 2's `core/furnish` replaces the
   six existing copies with one placement pass and per-build draw adapters. Keep the 14 pieces as [draw] builders,
   give each a catalog-shaped entry (family, tags, size, anchor, role, `job`), and make `placeFurn` write the
   `core/furnish` record so the sim can derive slots from them (Phase 5). Harvest the pieces into `kits/catalog` once
   the material vocabulary exists, as the plan does for Yuni's.
7. **Rooms are Ys's own records.** `hykRoom`/`hykSpot` were written to DESIGN §7's spot sizes, not to
   `kits/interiors`' room graph (the plan's engine-neutral interiors). Map them onto that graph at export, or adopt it
   when the interiors planner lands; do not grow a second room model.
8. **No exporter.** No Ancients-lineage build has one; Iziz is the lineage's M5 city and the plan does not want a
   second contender. But rule 10 says a new build takes the export from the start and is not finished without one.
   Ys's registries make a `YS.export()` on the `KRATOR_EXPORT` shape cheap: buildings, doors, windows, lights, rooms,
   spots, furniture placements, the layout, the land–sea lattice, the NAV grids. Write it when `core/export` has a
   shape, and before any life layer.
9. **No life layer in three.js.** PLAN.md's P4 (the walk plan, life) is Phase 5 work under the plan and is owned by
   `core/simulation/PLAN.md`: factions from `LORE.md` §6 (the roadmap's "Hyssoukoi" are the Hykkousoi; neutral,
   trade, travel, caravans), places with activities and slots from the kit's defs (market TRADE, temples, the
   harbour, the Pharos), schedules as data, routes over the NAV grids. Ys writes that data and the `krator-sim`
   export, and does not write an agent runtime. The walk plan stays as what it is: NAV data plus the stair and ladder
   links.
10. **Preview work to stop doing** (Phase 6): night-light passes, LOD tuning, walk-mode features, per-piece polish
    rounds on the sheet (KNOWN_ISSUES.md's open look items stay open unless they are geometry errors). The sheet is
    the kit's correctness test, not its showroom; Godot is the showroom.
11. **Materials and textures.** `60-hyk-mat.js` has eight `canvasTex` painters on `fbm`/noise (nacre, barnacle,
    weed, bone, floor, lens, dark): PNG bakes by the plan's default, or `TEX.def` kinds if another build takes the
    Hykkousoi look. One shader hook, `hkNacreHook` (iridescence over the port's underwater fade): one `.gdshader`.
    The shell kit's merged buckets (`hykFlush`) are the biome export's `buckets` shape as they stand.
12. **The Ancients hosts** come from the kit the plan re-vendors before the lineage audit (Ancients to Iziz to
    Highlands to Xanadu and Reed Lake). Ys vendors `52-sky-abc` adapted and the port's terrain adapted (both
    recorded as deliberate drift). Re-vendor with the chain, and log the Ys stairs item there too.

## What this does to PLAN.md

P0–P2 stand as built. P3 becomes two data passes and one draw pass, waits on `core/rand`, and bakes the terrain;
Travis's Oct 2026 requirements for it (three refurbished full-height towers, land blocks that are reclaimed Ancients
hosts, pods spread over a host's plates) are placement data and belong to the first pass, with their invariants in
the probe as planned. P4 is replaced by the sim data and the export. P5 (polish) is Godot's. The build is finished,
in the plan's sense, when its export opens beside Iziz's.
