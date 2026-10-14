# core/city: the city-layout module (plan, owner 2026-10-14)

One layout module every city takes: Voth (where it was grown), Verge and Iziz first, then new builds. The owner's
words: "pull out the relevant code as a core module city-layout that other settlements (verge, iziz, future builds)
can use. Ys seems to have come up with its own method of block infill that might be worth putting in there as an
alternative." Streetlab is retired once this is built; Voth's home is `settlements/voth` (ROADMAP.md, "Voth,
Streetlab and the city-layout module").

## Where it stands (survey, 2026-10-14)

- `core/city` is Streetlab's retired toy plus the parts Voth kept. Voth's city target replaces four of the seven
  builder steps (`pass6`, `pass7`, `pass8`, the runner) and every default rule (`wealth`, `choosers`, `vacant`,
  `interiorOk`); the toy defaults read fields no world provides (`PLAN.triWide`, `coreR`, `radials`, `landmarks[2]`).
- The general layout written since lives in Voth's own files: the site layer (district roles, the zone raster with a
  slope limit, drawn avenues with snapping, ring avenues, embankments and levelled gates), highways (A* with a `via`
  ring and river/shore attraction), the wall (gates, towers, crossings, clearance) mixed with its drawing, the main
  streets across voids (a coarse chamfer pass that should replace the toy's `pass8`), the edits overlay, the country
  (lanes, villages, farmsteads, fields, suburbs fading to tracks), the waterfront (pier spacing, turning basin, quays
  square to the current) mixed with drawing, the compound packer (clan compounds, deck fill), "landmark near a marker"
  searches (healing, caravanserai, temples) and square clearing.
- Known defects: `SL.exportPlan` reads `PLAN.wall.poly`, which Voth never sets (Voth keeps `VC.wall`), so its Export
  button should throw; `SL.clash` looks only one cell of its 40 m hash, missing big footprints (Voth added
  `VC.clashWide`); no slope test per lot; the README's cell size and step order are the toy's. No test of its own:
  Voth's `verify.py` `CITY_CHECK` is the only check.
- Every other city has its own spatial hash, PRNG and frontage walker: Ys (an OBB hash, per-side frontage cursors,
  lane quartering, lattice infill facing a street or yard, cell-seeded KRAND, data only), Verge (a KMASK raster,
  grown lanes, back rows, one KRAND stream), Iziz (canvas masks read back with `getImageData`, an OBB hash, Ancient
  lattice clusters, jittered-lattice settler streets, the lineage `rng`, placing interleaved with drawing), and Dalab,
  Erewhon, Roketstad, Yuni, Locus and Mungo likewise.

## The module

1. **An instance, not globals.** `KCITY.create({tune, site, ground, kit, rules, seed})` returns
   `{plan, raster, index, steps, run(), export()}`. Several cities per page (Verge has two); a GDScript twin later;
   the drawing (`50`, `52`) takes a plan. `SL`/`PLAN`/`TUNE` stay as a compatibility shim for Voth until it moves.
2. **Substrate.** Streams from `KRAND` (`KRAND.child(seed, step)`, and `KRAND.cell` per block or way, so one block
   can be rerun alone). Footprints, the road-segment and field hashes on `KSPACE` (one spatial index). Raster codes
   an extensible table, with a typed raster beside `core/mask` (owner ids and distance fields do not fit RGBA).
   Lots registered in `core/tags`. A per-lot ground predicate (slope, water, karst) the world supplies, and Erewhon's
   stance (below). Fix
   `exportPlan` and the wide-footprint clash.
3. **The site layer (steps 0-5), core, fed by world data:** the site schema (Voth's site model), the role table and
   `roleAt`, the zone raster, drawn avenues with snapping and ring avenues, highways, the wall/gates/towers as records
   (drawing stays in the world), pads and embankments through a ground-delta interface.
4. **The builder (6-12):** Voth's `pass6` (with a table of `near` scorers), `pass7` (the no-frontage flag), `pass8`
   (the void-crossing main streets) and `interiorOk` become the defaults. The toy's rings and spokes stay as an
   optional radial-street strategy for walled radial cities (Iziz, Dalab).
5. **Pluggable street and infill strategies**, one interface (`strategy(blocks or ways, ctx) -> ways, lots`):
   - `alleys`: today's steps 10-12 (side streets, alley entrances, alleys, blind alleys);
   - `frontage-courts`: **Ys's infill**: a cursor along each block side, lane quartering, edge runs round a host,
     lattice infill facing a street or a yard; for given polygon blocks; chosen per district or block;
   - (Verge's grown lanes and Iziz's lattice clusters are not ported as strategies: the owner keeps Iziz's in Iziz and
     moves Verge to `alleys`.)
   Shared primitives under all four: one `frontageRun` (replacing `lineLots`, Ys's two walkers, Verge's frontage,
   Voth's lane houses and Iziz's), `faceNearestStreet`, `huntNear`, `packPolygon`, `clearSpot`.
6. **Optional add-ons** out of Voth: `country` (lanes, villages, farmsteads, fields, tracks), `waterfront` (harbour and
   river-port rules as records), the edits overlay.
7. **Steps as data:** `[{name, run, hooks}]` instead of `pass0..12` and inline hooks.
8. **Per world:** the numbers, mixes and choosers, wealth terms, landmark lists, the kit adapter, the site JSON, the
   builders and drawing, and what is only Voth's (cantons, chinampas, the monastery, the census, flora, the
   simulation's consumers).
9. **Tests:** `core/city/test-city.js` on a small synthetic site (no overlap, nothing on a street, wall or water;
   a placement hash in `golden.json`; negatives), then a `city.gd` twin.

## The owner's calls on each city (2026-10-14)

- **Verge: onto the street and alley infill** (`alleys`, steps 10-12), not its grown lanes: Verge's method leaves many
  empty, unused streets. The port must carry Verge's **two-level site**: two cities on one page, each its own
  instance with its own ground, raster and districts, joined where the funicular and the trail meet them (stations
  and pads stay blocked ground in both). Its record ids (`vb_0000`, doors) are kept for the Godot export and
  `verge_sim`.
- **Iziz: keeps its own methods** for the Ancient quarter (the lattice clusters, the hills and ring roads, which turned
  out better than Verge's); only its **newer, vernacular (settler) parts** move onto the stepwise method (streets,
  frontage, infill), inside the site Iziz already lays out. Its move to KRAND and core/mask, and the record/draw
  split, are needed only for the parts that move.
- **Erewhon's slope placement goes into the module, Erewhon itself is not rebuilt.** Its stance rules
  (`settlements/xanadu/targets/erewhon/88-*.js`: `stance` (the base at the highest corner, the footing dropping to the
  lowest, refused past a maximum drop) and `stanceAtDoor` (a street house's floor at the street's level at its door,
  the back cut into the rising ground behind)) become the module's per-lot ground predicate and stance, for every
  strategy.
- **Dalab, Mungo, Locus and Yuni stay as they are.** **Roketstad:** the owner checks it first (it is also being moved
  onto the North Highlands biome).

## Order and proof

1. **Instance, substrate, defaults, tests.** Voth's placement unchanged: a placement hash of every lot and way
   before and after, Voth's `verify.py --assert` and screenshots identical. (Where KRAND replaces a stream the layout
   changes by design: that step lands separately, with the owner shown the before/after.)
2. **The site layer and builder defaults** out of Voth's target into core, Voth's placement hash unchanged.
3. **Strategies:** `alleys` (today's), then `frontage-courts` from Ys, with Ys moved onto it and its placement hash
   unchanged (its streams are already KRAND and cell-seeded).
4. **Ports:** Verge onto `alleys` (two levels, two instances; its record ids kept), then Iziz's vernacular parts onto
   the stepwise method (its Ancient quarter keeps its own; off `rng` and canvas masks only where it moves). A port is a new layout: the owner judges it by
   screenshots, and the baseline moves for it alone.
5. Add-ons (`country`, `waterfront`) as a third city needs them.

## Done (2026-10-14: steps 1 to 3)

1. **Instance, substrate, defaults, tests.** `KCITY.create({tune, site, ground, kit, rules, seed, steps, finish, rand,
   tags, index})` -> `{plan, raster, index, steps, run(), export(), bind()}` (`40-city-kcity.js`); `SL`, `PLAN`, `TUNE`
   are the bound instance's view, so Voth runs unchanged; steps are data (`[{name, run, after}]`, Voth's
   `35-vc-steps.js`). The footprint, road and field hashes are one index on `KSPACE` (`12-city-index.js`): exact for
   any footprint size (the wide-footprint clash fixed, `VC.clashWide` folded in), insertion order, or the old probe's
   order for Voth. The export reads the wall's records (it threw on Voth). The per-lot ground predicate and Erewhon's
   stance (`15-city-ground.js`, opt-in); lots in core/tags (opt-in); KRAND streams as an option (`rand: 'krand'`).
   **Voth's switch to KRAND is not done: it changes the layout, a separate step the owner reviews.** `test-city.js` and
   `golden.json`.
2. **The site layer and builder defaults** (`25-city-site.js`): roles and `roleAt`, the zone raster, drawn and ring
   avenues, corridors, highways, the wall as records, banks and level pads as ground deltas; Voth's `pass6` (with
   `KCITY.NEAR`), `pass7`, `pass8` and `interiorOk` are the defaults; the toy's rings and spokes are
   `34-city-radial.js`. An opt-in exact-streets rule (`TUNE.exact`).
3. **Strategies** (`33-city-strategies.js`): `alleys` (steps 10-12) and `frontage-courts` (Ys's method on polygon
   blocks, every block from its own KRAND cell stream), the shared primitives (`frontageRun`, `faceNearestStreet`,
   `huntNear`, `gridCands`, `packPolygon`, `clearSpot`); `SL.lineLots` and Voth's house of healing run on them. Ys's
   placement pass takes the primitives (its frontage walker, edge runs, block candidates, central lattice and facing)
   with its placement unchanged; its blocks, boxes, clash rule and kit audit stay its own.

The proof: Voth's placement hash (every lot's key, x, z, ry, w, d and every way's points; `verify.py --hash`) is
`ff007aab` before and after each step, and so is a hash of its log, greens, fields and knocks; its `verify.py
--assert` reports the same, line for line but the timings, except that the export now works (it threw before). Both
runs fail the same two pre-existing checks, the embassies (Hykkousoi, Iziz, Jimjam, Republic not drawn) and two
cantons not walkable (Arena, Fortress): not this work's. Ys's placement hash (78ecfa06, refusals 45c38520) and its
`verify.py --assert` counters are the same before and after. Next: step 4 with the owner.

**The exact-streets rule on Voth** (owner, 2026-10-14). It threw at first: under the rule a street knocks out every
building it reaches, and `SL.salvage` re-placed each along `PLAN.ways[L.way]`, undefined for a building laid along no
way (Voth's country houses, deck and placed buildings: `way: -1`). Salvage now re-places only frontage lots (a way and
a side) and knocks the rest out; `test-city.js` checks it, with its negative. On Voth's data the rule also met a
mushroom farm's track one point long (`VC.track`) and a watchhouse the simulation fitted into a plot on a bend
(`VC.simFit`); both fixed. Voth's hash is `48efdcaa` with the rule (`ff007aab` without it, unchanged).

The data side stays engine-neutral (`[G data]`): `core/city` becomes the NPC and quest tool and later the player's
settlement builder, in Godot too (CLAUDE.md).
