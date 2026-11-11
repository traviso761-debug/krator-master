# Krator: to do

A working list. Items marked *(Menagerie)* come from reading the World Menagerie embedded at
`host/WorldMenagerie/` (paths below are under it). Its code is read for ideas only: anything taken is
rewritten as a Krator fragment, never imported from `host/` (`tools/check_insulation.py`).

**Godot tags.** The repo-wide audit and port plan is `GODOT-PLAN.md`; it uses these tags. The plan (`biomes/WORLD.md`) is that three.js generates and previews, and Godot runs the open
world. The port works when **what** a thing is (data) is kept apart from **how** three.js draws it
(`biomes/GODOT.md`, `core/atmos/GODOT.md`). Each item is tagged:

- **[G data]** engine-neutral: an algorithm or data that crosses over through the exporters as it is. This is
  the most valuable kind; do these as data first, drawing second.
- **[G shader]** a shader trick that rewrites directly into a `.gdshader` (often through the global shader
  parameters `core/atmos/GODOT.md` already defines).
- **[G native]** Godot has this built in. Worth doing in three.js only for the preview; don't port it.
- **[web]** browser or three.js only. No Godot value.

Prefer items that are straightforward to port. **Godot order:** (1) the carver's floor and blocker list,
which becomes collision shapes and the navigation mesh source; (2) the land-cover map, which becomes the
terrain splat texture and the placement input; (3) the minimap drawn from exported data.

**Counts:** tags used: about 52 [G data], 27 [G shader], 17 [G native] and 18 [web] (some items carry two, and the legend above uses one of each).

## The Audio Lab's numeric defaults *(2026-11-10, the second integration pass)*

- **`|| <number>` in core/audio** (check_source ORNUM, 147 findings, recorded in `tools/check_source_baseline.json` when
  `claude/water-migration-merge` came in): `core/audio/tools/soundtrack_engine_code.js` (145, e.g. `vol: tr.vol || 0.85`, where a
  volume of 0 is a real mute), `core/audio/26-core-audio-music.js` line 550 (`scenario.frequency || 1.0`) and
  `core/audio/lab/serve_local.js` line 9. Write them `x == null ? d : x` with the audio work's next turn, run its node tests
  (`core/audio/test-*.js`) and let the ratchet shrink (`python3 tools/check_source.py --write-baseline`).
- **`node core/audio/test-audio.js` fails two checks as the branch committed it** (core/audio is byte-identical to
  `claude/water-migration-merge`): "every clip has a known category" (68 of the 1,007 clips name categories
  `data/categories.json` lacks: `sfx.interface`, `sfx.impact`, `music.motif`, `sfx.voice`, `mus.loop`, `sfx.env`) and "every clip has a
  source page and a creator". Add the categories (or map the clips onto existing ones) and fix the sources in the audio work's next turn.

## Left red by the second integration pass *(2026-11-11; HANDOFF-REBUILD.md)*

- **The NE wall's `HV('thatch, mats, arrow shafts', ...)`**: `core/hamlet/test-hamlet.js` cannot read "arrow shafts". Add it to the
  craft rule in `core/hamlet/10-hamlet-wood.js` with the next rebuild that takes core/hamlet (54 pages), or call it `poles` in the kit.

## With the next scale-model edit *(the owner, 2026-11-09)*

- **Reroute the Ostrukh Riba south into Lake Ostrukh.** The owner agreed that Mid Basin's springs and Lake Ostrukh share one aquifer, fed by the Stalker Range's snow (`biomes/midbasin/PLAN.md`). Today the river runs north from the flagship pool (2,040 m) into Region 99 and ends at 334 m, although its note says it feeds the lake (1,850 m). A southern course needs a carve about 70-80 m deep; its highest point is 2,082 m at 1588,1392. Retrace the river downhill and fix its note. The scale-model edits session (`claude/dreamy-davinci-30f3c1`, edit 5.1.1 at f1d1501cf, artifact version 92) has the details. Held for the next map edit, not done alone. **Not taken by 5.1 edit 3** (`edit_513.py`, 2026-11-09: the Firebliss Range's decisions); its least-cut router and channel carve (`route`, `carve`) are the tools for it. Reed, Nazar and Mungo's plans were corrected with it (`biomes/loom-chasms`, `biomes/godshearth`).

## Ride along with the next all-builds rebuild

**Taken by the second integration pass** (`claude/integration-2`, 2026-11-10 and 11; HANDOFF-REBUILD.md): the `dalab` sockets pack,
water breakup on by default, the catalog's `tile` detail family, the Highlands great-building room kinds in `30-programs.js`, the fauna
runtime and bison table, and the `tools/` listing staleness (every build rebuilt): all rebuilt and GPU-verified, items deleted.
- **KSTRATA recipe `obsidian`** (`scoria` has since landed) (2026-11-09, `biomes/twins/PLAN.md` section 0.1): the Twins' plan names them for its coulees and
  spatter cones; `core/terrain/35-core-strata.js` has `tibasalt` as the nearest. Adding a recipe changes every page that inlines the file, so
  it waits here; station 1 draws its faces as `tibasalt` and its obsidian as items and a ground class until then.
- **Any new file in `tools/` stales eight builds** (kits/catalog, crops, interiors, mechs, motor-vehicles, port; settlements/isle-demo,
  longsong record `tools/` as a listing input, likely Python's importer reading it): a rebuild clears it; worth a fix in `build_sources`.
- **Switch on checks 22-31 everywhere** (the survey of 2026-11-11, CORE-IMPROVEMENTS.md items 22-31; landed opt-in on
  `claude/survey-checks` with no page moved). Items 22 (lane without `KRATOR_GL=gpu`), 24 (DOCS-ONLY) and 31 (STALE PASS) are on
  already. The rest is `tools/checks_optin.json`; set each check's `"builds"` to `"*"` in this order, inside the rebuild:
  1. Pull and rebuild everything through `tools/build.py --all` (`python3 tools/lfs_needs.py <build> --pull` per build in a fresh
     worktree), so every `build-inputs.json` is current; then `python3 tools/check_stale.py --write-baseline` (it should be `{}`).
  2. `names`: rename the 99 view names holding an apostrophe and the 40 holding a colon (`python3 tools/check_views.py --list`),
     rebuild those builds, `check_views.py --write-baseline` (it shrinks), then `"*"`: `tools/build.py` fails any new one.
  3. `recorded`: add `buildlib.through_tools_build(__file__)` at the top of every `build.py` (the template is `tools/new_build/`),
     then `"*"`: a plain run of a build that lacks it is refused by `tools/check_port.py` (dep_graph and check_vendor pass
     `KRATOR_ALLOW_PLAIN_BUILD=1`).
  4. `minset`: `"*"`, then `python3 tools/check_assembly.py`; extend each MINSET page's list from `buildlib.CORE_BIOME_MIN`
     (`CORE_BIOME = buildlib.CORE_BIOME_MIN + [...]`) rather than baselining it; `--write-baseline` only for a page that cannot take
     one, with the why in its KNOWN_ISSUES.md.
  5. `samplers` and `drawn-ground`: `"*"`, then on the GPU lane (`KRATOR_GL=gpu`), per rebuilt page, `python3 tools/harness.py
     ratchet --write <page>` records the pages over 16 samplers or with an eye under the drawn ground in `tools/verify_ratchet.json`;
     fix them at each page's own turn. The sampler count replaces the Throne's `samplersOf` (the KSHADOW row above).
  6. Node tests: move each test's own `ok` onto `tools/ktest.js` as it is next touched (`core/terrain/test-scarp.js` passes a
     negative as a third argument to its own `ok`); then add a `test_all.py` step that runs `ktest.shadows` over every `test-*.js`,
     ratcheted, so no new test declares an `ok`.
  7. `check_source` now reads kits' top-level files: 19 keys were added to its baseline (catalog, fauna, mechs, motor-vehicles);
     fix them with those kits' rebuild and rerun `--write-baseline` (it shrinks).
  Write each baseline only from pages rebuilt and checked in that pass, never over a page you did not build.

- **The owed fixes the survey found** (2026-11-11, CORE-IMPROVEMENTS.md item 32; each moves the pages that take the file):
  - KHOOK clones re-run layers (`core/shader/06-core-khook.js:72,81`): about 40 sites do `c=m.clone(); c.onBeforeCompile=m.onBeforeCompile`,
    which stores m's composed hook as the clone's page hook, so each layer runs twice ("Vertex shader is not compiled"). Tag the
    composed hook with its state (`st.hook.__khst=st`); in the setter and in `state()`, when the value is another material's
    composed hook take that state's page as the page and copy its layers by name (`K.copy`), never the composite as a page.
  - `core/terrain/43-core-ground.js:199,223` inlines the eye as `-(viewMatrix[3].xyz*mat3(viewMatrix))` twice: put `K.EYE`
    (`#ifndef KHOOK_EYE`) in front of the kground layer's fragment declarations (about line 333) and call `kEye()` in both.
  - `BIO.alphaTex` (`core/biome/30-core-foliage.js:110`): `c.getContext('2d',{willReadFrequently:true})` (about 1 s a card now);
    the same at line 473 where that canvas's context is first made.
  - Library-card mipmap fringes (`core/biome/20-core-kit.js:242-245`, `BIO.libSwap`; the image lands raw in
    `core/materials/record/25-matlib-host.js:27`): when a `flipY:false` card decodes, draw it to a `willReadFrequently` canvas and
    fill the texels under alpha 48 with the mean opaque colour, as `alphaTex` does (`30-core-foliage.js:112-114`), once per cached sheet.
  - KKARST duplicate sink ids across branch levels (`core/terrain/39c-core-karst.js:184`): `id:'sink:'+lv+':'+si+','+sj` (the node
    ids already carry the level); the shaft and doline ids follow; add `s.level` to the radius hash at line 207.
  - The ISK error loop (`settlements/isle-demo/bundles.py:101` and `:173`): `reportErr` logs `console.error('ISK: '+m)`, which
    `core/engine/10-core.js:11`'s wrapper matches again (`/shader|WebGLProgram|GL_INVALID/`) until the stack overflows. Log with the
    saved `console.error` or `console.warn` there, and give the wrapper a re-entry guard.
  - The in-page audits on the drawn ground (item 28): the water audit (`core/water/ext/57-core-water-audit.js`), the cliff gate
    (`core/biome/40-core-place.js`, `cliffOld`) and the attach audit's ground (`core/biome/20-core-kit.js:609`, `BIO.attachAudit`)
    read `KDRAWN.h` when the page lists `core/drawn/10-core-drawn.js` and registers its ground; cameras stand on it.
  - Already done before the survey closed (no row needed): `kits/fauna/src/90-sheet.js`'s `_texPending` is a getter (15ca3363);
    hyperjungle's harvest-wood phrases parse (`node core/hamlet/test-hamlet.js` passes).
- **core/world: a kit on several biome overlays** (2026-11-11, the Iziz cluster's open-world region): `core/world/41-world-fields.js`
  matches a `WORLD_KITS` entry's `overlay` to one biome name (`k.overlay===name`). Let it take a list (`Array.isArray(k.overlay)?
  k.overlay.indexOf(name)>=0:...`), then drop the shim in `openworld/iziz-cluster/src/47-world-kits.js` (`WORLD_KITS.findIndex`, which
  tries each name of a list). It moves every page that reads core/world (the isle demo's two city pages, Longsong, Pinnacle Rock and the
  open-world regions) without changing what they draw.

- **`KSHADOW.units` counts what the GPU links** (2026-11-09, found by the Throne's fix): `core/shadow/host/12-core-shadow-host.js` counts
  declared samplers (some are never read and the GPU drops them), misses `scene.environment` on standard materials, and judges against the
  renderer's own limit (32 in SwiftShader, so shadows turn on where the GPU cannot link them). The Throne's `samplersOf`
  (`biomes/throne/src/89zz-host-core.js`) does all three right since 2026-11-09: move that into core, cap at min(16, GL), and drop the copies.
  It moves every KSHADOW page.

- **Two `||` numeric defaults left for the rebuild** (2026-11-10, test_all's source lint; not changed, because each moves pages):
  `core/furnish/50-core-furnish.js` line 65 `rec.scale || 1` (reaches 34 builds, 186 pages: `python3 tools/reach.py`) and
  `settlements/yuni/src/76-doors.js` line 180 `d.y||0`, `d.yaw||0`, `d.w||0.9`, `d.h||2.05` (Yuni's seven pages). Write them
  `x == null ? d : x` with the all-builds rebuild, then `python3 core/furnish/fingerprint.py`. (The other new ones, Highlands'
  `89y-hl-furnish.js`, Xanadu's `89y-xa-interiors.js` and the Vernacular's `69e6-vern-autobody.js`, are the interiors session's.)
- **`core/engine/fingerprint.json` is behind core/engine** (2026-11-10): Eternian's page differs from it with or without its old
  `src/37-wk-rec.js` (the triangles by material move), so the change came with the 2026-11-09 engine merges (interiors, walk
  records); rewrite it (`--write`) with the all-builds rebuild, after the engine kits' screenshots.

Fixes to shared code that reach every build (or most of them), parked until a change that rebuilds them all anyway comes
along: do them in that change, rebuild once, rewrite the baseline once. Take an item out when it is done.

- **A `dalab` culture pack for the Post-Apoc kit's sockets** (sources done, awaiting the all-builds rebuild; 2026-10-27, `settlements/span`): one `mkCulture({key:'dalab', ...})`
  in `core/sockets/80-cultures.js` (red ochre field `#a8382a`, earth edge, the God's single eye as the symbol, a new entry in
  `38-symbols.js`), so the barricade, the arena and anything Dalab raises from salvage fly its red. `mkCulture` draws from the
  shared stream at load (`jc`, `rr`), so the pack reaches every build that takes core/sockets (the catalog, post-apoc,
  ringsea, zeijani, dhelv, jimjam, longsong, screamers by its bundle): rebuild them with it; then Span passes `culture:'dalab'`
  for the Line and the arena (`src/8at-host-place.js`).
- **Water breakup on by default** (sources done, awaiting the all-builds rebuild; the owner, 2026-10-27, `core/water/PRACTICE.md` section 2 item 5): every lake, pool and river drawn
  from a few sines glints in stripes or a herringbone; `core/water/ext/56-core-water-breakup.js` breaks it up. Today it is opt-in
  (`WATER.breakupAll()`, `WATER.breakupFlows()`, or `WATER.BREAKUP_AUTO = true` before the water is drawn; eastabyss takes it). The flip:
  list `ext/56` in every build that takes core/water (the pooled `settlements/`/`kits/` lists and each biome's `CORE_WATER`), set
  `W.BREAKUP_AUTO=true` as the default in ext/56, rebuild them all, rewrite the baseline once, and look at a lake, a pool and a river
  in a few of them (the eastabyss look). `node core/water/test-breakup.js` and `test-gaps.js` say what moves. **2026-11-08:** left out of
  the core pass of the integration rebuild: 25 of the 43 builds that take core/water (by `51-core-water-kinds.js` in their `build.py`) do
  not list ext/56, and those lists are the builds' own files; the default flip alone would turn it on only in the 18 that do.

- ~~**Backport the succulent columns' quality pass**~~ **DONE 2026-11-09** (nsemiarid: `columnGeo` in `50-biome-nsemiarid-species.js`,
  the sail candelabra's arms seated in `60-biome-nsemiarid-floor.js`, 48 to 80 triangles a column, `column` 774,096 to 1,290,160
  triangles over 16,127 instances, `verify.py --assert` OK, page rebuilt and committed 2026-11-10; its page and the pages that read it,
  scablands' coulee and dambasins' graveyard, east and port, rebuilt: `biomes/nsemiarid/KNOWN_ISSUES.md`. The Throne has no succulent
  column: its `column` is the vent coral, a 12-sided ribbed lathe planted in the ground and closed at the top, and its brimstone
  candelabra's arms are one tube with the cup on the tip, so nothing to port. Shade reads sedesert in place since 2026-11-03, so its
  page had the pass before this work: 80 and 36 triangles a column, 3,508,729 scene triangles, before and after; rebuilt 2026-11-10, OK.) The entry as it was (the owner, 2026-10-26; done in `biomes/sedesert` on `claude/bowl-station-e15b2d`):
  `columnGeo`'s profiles start at a narrow, rounded foot with a closed cap and per-row normals (`50-biome-sedesert-species.js`:
  `G.column` 80 triangles, `G.columnLo` 36), `columnTree` seats every column on its arm (spots three to a segment along each arm,
  the column within the arm's radius, its foot sunk a third of a radius: they stood up to 1.6 radii plus 1.5 m off, feet in the
  air) and the arms are 7- and 9-sided tubes (`55-biome-sedesert-trees.js`). The same column geometry is in `biomes/ebadlands`,
  `biomes/nsemiarid` and `biomes/throne` (their `50-*-species.js`, and their trees fragment where it has a column tree) and
  vendored in `settlements/shade` (`src/50-biome-sedesert-species.js`: re-vendor). Port them in the final rebuild; it moves those
  pages' hashes and their per-type triangle counts (the hero column doubles). **2026-11-02:** ebadlands' moonflower column is ported (its turn); nsemiarid, the Throne and Shade are left.

- **Doors and glass: what is left** (the pass of 2026-11-03/04 put every building kit on `core/door`: KDOOR records with stable ids,
  the door kinds and leaf styles, KGLASS panes over the room card, E and the tip; each kit's KNOWN_ISSUES.md has its counts).
  - ~~Verge and the isle demo take the Vernacular's openings (69e5) but host no doors: their leaves are drawn shut and never
    open (no KDOORHOST tick, no E, no walk blocks). Give each page the host (`90-core-door-host.js`, as Highlands' `95-hl-doors.js`).~~
    Done (2026-11-09): Verge (`settlements/verge/src/95-verge-doors.js`: posed, the tick, E, walk blocks; its Vernacular bodies hollow
    with the interiors on); the isle demo's city page (`settlements/isle-demo/src/63-isle-doors.js`: each near Vernacular lot's doors
    registered in the world under the lot's id, the leaves posed, the tick, E at the view's target; no walk blocks, the page has no
    core/walk, and the kit locks the doors of its solid bodies). Left: the open world's hamlets still bake their leaves shut.
  - ~~`kits/interiors`: `50-shell.js` should register its own leaves in KDOOR (a kind and style, `KDOORHOST.object` or `posed`)
    and its glass in KGLASS (`kits/ancients-interiors/src/75-ai-doors.js` matches the shell's leaves by order meanwhile), and
    `IX.walk` should register a `ROOM()` shell's floor, walls and doors in core/walk so a sheet can run `KWALK.reach`.~~
    Done (2026-11-09): `IX.walk.room`; Ancients-interiors' sheet reaches 48 of 48 rooms with the doors open, 0 shut.
  - ~~Highlands and Xanadu: every body is solid (no 69e hollow walls), so every door is locked; Roketstad's `?interiors=1`
    unlocks the doors whose sill meets a furnished room, which still open onto the box's face. Hollow walls for the furnished defs.~~
    Done (2026-11-09, with `?interiors=1`): the Vernacular's auto bodies (`kits/iziz-vernacular/src/69e6-vern-autobody.js`) draw a
    furnished def's matching blocks hollow, its doors unlocked into the rooms; Xanadu has its interior set
    (`kits/interiors/sets/xanadu.js`; the citadel's defs skipped: the citadel sessions build them); the Hall of the Republic and the Fortress
    are planned room by room (`kits/highlands/hall/`, `kits/highlands/fortress/`). What is left: the kits' KNOWN_ISSUES.md.
    Finished and verified 2026-11-10 (the audit, `verify.py --interiors`: every floor of the Hall and the Fortress reached; the
    furniture textured): what is left is in `settlements/highlands/KNOWN_ISSUES.md` and `settlements/xanadu/KNOWN_ISSUES.md`.
  - Locus with `?interiors=1`: 32 floors are reached only through a locked door (the interiors kit's entrance is not the
    building's `F.door`). **2026-11-09: tried, not fixed.** `66-locus-furnish.js` `locfDoorsIn` now also unlocks the placement's
    door nearest each planned street door, but `LDOOR.reach()` still reads 146 starts, 390 of 510 floors reached (422 with every
    door open), as before: it unlocked nothing more. Find why (the planned doors' `at` and `floors[].y` against the placement's
    KDOOR records) before trusting it (`settlements/locus/KNOWN_ISSUES.md`).
  - ~~Mav's Refuge has no core/walk: its 1,883 operable doors block nothing, and it has no reachability audit.~~ Done
    (2026-11-09): `src/83-mr-walk.js` (the units' plans in core/walk, the doors' blocks, `MRWALK.reach`); decks and bridges not yet.
    Open: the audit leaves 86 apartments' ground floors unreached, and the first walk freezes the page (KNOWN_ISSUES.md).
  - ~~Yuni: the streamed interiors' room doors are not KDOOR records, and its own leaves swing 1.4 rad, not KDOOR's 1.75.~~
    Done (2026-11-09): KDOOR records while live, pruned by id. The swing stays 1.4 rad, recorded on each record (`R.swing`) so the
    export gives what the page draws; whether to move it to 1.75 is the owner's call (`settlements/yuni/KNOWN_ISSUES.md`).
  - Beast Riders (`kits/beast-riders`): its town copies draw Girder's and Mav's leaves shut and their walls whole (fallbacks in
    their `55-arch.js` / `56-levels.js`); the faithful port bundles `54-openings.js`, the glass of `81-glow.js` and core/door.
  - ~~Detail the plain leaves lost: the ger's brass bands, the vardo's scrolls, Pylon's and Talia's pulls (a leaf style with
    hardware, or a socket on the leaf).~~ Done (2026-11-09): `KDOORLEAF` hardware styles (`banded`, `scrolled`, `+pull`, `+ring`).
  - The arcologies' painted windows (canvas glazing, Crescent, Monolith, Hill, ...) stay painted: real panes would be tens
    of thousands of instances a building.
  - ~~Godot: the exports meet new materials (`kglass:*`, `kglass:room-lit`, the leaf meshes) and KDOOR's `export()` (kinds,
    pairs, styles); the importer should take the records and build the leaves (`godot/README.md`).~~ Done (2026-11-09):
    `godot/krator/kdoor.gd`; `godot/tests/door/door_test.gd` passes on 4.7.2. The isle demo's export does not carry its doors yet.

## With the final biome rebuild *(the owner, 2026-10-26)*

Work parked for the coming rebuild of every biome kit: do it there, rebuild each page once, rewrite each baseline once and on
purpose. Take an item out when it is done.

- **Rebuild the old fungoid flora on `BIO.fung`** (the owner, 2026-10-26). `core/biome/33-core-fungoid.js` (planned in
  `biomes/outlands/PLAN.md` section 12, C2: `cap`, `bracket`, `bladder`, `pod`, `stalk`, `fringe`, `comb`, `tube`, `crust`)
  replaces the copies each kit carries: `bracket()` in the swbay, nwbay, rift and hyperjungle `65-*-dress.js`; the Throne's
  `cap`, `capTube` (`throne/src/55-biome-throne-trees.js`) and `bladders` (its floor file); swbay's `capTop`
  (`swbay/src/55-biome-swbay-trees.js`); nhighlands' `mushrooms`/`discStalks`; the `crust` in ebadlands and ringisles; the
  hyperjungle's `fungi`; the `stalk` in rift and xanadu trees. Each kit switches to the core parts, its own copy goes, and
  its page is checked by eye against the old one before the baseline is rewritten (the shapes will move a little). Needs
  the fragment built first (the Outlands' phase O3); the kits that read those fragments in place (Korona's stations, the
  Throne's) follow automatically.
  **2026-10-26:** the fragment is written (`core/biome/33-core-fungoid.js`, `test-fungoid.js`, core/biome README "Fungoid parts")
  and nhighlands' mushroom and disc stalk are on it; the rest of the list is still to switch. **2026-10-27:** nwbay's bracket is
  on `BIO.fung.bracket` (its page only, `?fung=0` the old dome; `biomes/nwbay/PLAN.md`). **2026-10-27:** swbay's mushroom, parasol, bracket and the cap-tree's `capTop` are on `BIO.fung` (its page only, `?fung=0`; `biomes/swbay/PLAN.md`). **2026-11-02:** ebadlands' dressing crusts are on `BIO.fung.crust` (its pages, `?fung=0`; `biomes/ebadlands/PLAN-STATIONS.md`).

## Port: next *(the ordered critical path; GODOT-PLAN.md, amended 2026-10-02)*

The one ordered list of Godot port work. The plans hold the why: `GODOT-PLAN.md` (phases, rules, milestones),
`biomes/WORLD.md` (the biome order), `core/materials/PLAN.md` (the library), `core/simulation/PLAN.md` (the sim),
`settlements/ys/GODOT.md` (Ys). When one of them changes the order, change it here in the same commit.

1. **DONE 2026-10-02:** the audit tool sees the shared exporters; Iziz's and Dalab's city build passes retagged;
   the minimap split into data and host (port lint 16 warnings to 2); the Voth lineage in the hash baseline;
   `core/rand` with golden vectors and its GDScript twin; Ys's city takes it.
2. **The Godot spike** (GODOT-PLAN.md Phase 7, "The spike"). **Underway 2026-10-05:** `godot/` holds the project,
   five exports (hyperjungle and rift tiles, Girder and Iziz as glTF, Iziz's atmosphere, Yuni's records) and their
   importers; `krand_test.gd` passes in Godot 4.5; the first gap list is in GODOT-PLAN.md ("The spike: first findings").
   Open: the look on Travis's machine in Forward+ (`godot/CHECKLIST.md`), the editor's glTF import, and the route
   Travis's friend used for the Voth kit (ask what it was).
3. **The Ancients re-vendor session** (`settlements/iziz/KNOWN_ISSUES.md`): Ancients to Iziz to Highlands to Xanadu
   and Reed Lake, and Jimjam, with `--assert`, screenshots and a new baseline. It gates Iziz's audit and its
   material work (M5).
   **DONE 2026-10-13** (on `full-refactor`). The Ancients fragments were already current down the chain (the 2026-10-06
   re-vendor holds: Iziz 35, Highlands 13, Jimjam all match); the session cleared the chain's other drift, each copy's
   diff read: Iziz's four `core/biome` copies were only behind (re-vendored, `--vendor-bio`); Xanadu's and Reed Lake's
   `91-probe.js` were behind Highlands (re-vendored; the new line is inert without `HLF`); Highlands' `91-probe.js` and
   Reed Lake's `73-hl-carve.js` (pre-catalog furniture; Reed Lake has no `FURNISH`) are kept on purpose and named in a
   new `ADAPTED` set in their build.py. Nothing was fixed upstream in `kits/ancients`. `verify --assert` before and
   after: identical on Iziz's city, Xanadu, Erewhon and Reed Lake (each build's KNOWN_ISSUES.md); Iziz's verify.py runs
   again (stage 0b had taken its `GL_ERR`). Every chain build's `--vendor-check` shows only recorded ADAPTED drift.
   Open: the baseline rewrite for the five changed pages (Iziz's `iziz.html`, Xanadu's `xanadu.html` and `erewhon.html`,
   Reed Lake's two) when the pages are committed; the composing `useGroupXF` (Iziz's 69c) is still not in
   `kits/ancients`' 50-registry.js (Jimjam's open item); Dalab and Ys, outside this chain, keep their non-Ancients drift.
4. **The scoped hand pass** (GODOT-PLAN.md 3.3). **DONE 2026-10-03: the ten biome kits** (tags, split notes, Notes paragraphs; `BIO.download()` split into `core/biome/43-core-export-host.js`, port lint 2 warnings to 1), **and Girder and Voth** (their `PORT.md`: tags and notes for every fragment over 10 KB, split notes, the Notes paragraph of PRNG, noise, `terrainH` and palette copies). **Iziz DONE 2026-10-05** (its `PORT.md`: tags corrected by reading the code, split notes on 90a, 90b, 90c, 85 and the mask readers, the own-copies Notes; Voth's `68-props.js` split note added). Still to do: Ys. Other builds
   keep provisional tags until a port session touches them.
5. **The biome reseeding event** (biomes/WORLD.md, Order 6): `KRAND` hash and noise, cell seeding, level-free
   records and a baked heightmap in one change, one screenshot set, one baseline rewrite. Brings `core/terrain`'s
   field with one kit as its first consumer. Needs the spike's findings on terrain.
6. **Ys's P3 placement pass** on `KRAND` (settlements/ys/GODOT.md item 4), as two data passes and one draw pass. **First pass
   DONE 2026-10-05** (`88-city-place.js` records, `88b-city-draw.js`): open are the bridge graph, the host types and the
   foreign sets (settlements/ys/KNOWN_ISSUES.md). ~~The Ancients chain re-vendored into Ys~~: **done 2026-11-09**, Ys reads
   the chain in place (every vendored fragment but its 18 adapted copies, with the Vernacular's 69e5, the Highlands kit's
   71c and core/door; settlements/ys/KNOWN_ISSUES.md).
7. **The Girder pilot** (core/materials/PLAN.md). **Material half DONE 2026-10-03:** `core/materials/record/` (`KMAT`,
   `TEX.def`, adapters), `tools/textures/pack.py`, Girder on the library (`?mat=proc` for the old look). Open: the
   four texture gaps (leafy, web, ghostwood, prism gum) and the owner's look review. **Iziz, the second pilot, DONE 2026-10-13**
   (its city materials on the library, every KMAT record naming its hook; two gaps with prompts: `settlements/iziz/KNOWN_ISSUES.md`). **`core/furnish` DONE 2026-10-05:**
   Girder, Mav's Refuge, Locus, Highlands and Post-Apoc place through it, fingerprints unchanged (`core/furnish/README.md`).
   **`core/tags` steps 1 and 2 DONE 2026-10-05:** the registry, vocabulary, label, node test and uid twin; Yuni on it,
   its records arriving in Godot as node metadata (`core/tags/README.md`). Steps 3 and 4 DONE the same day: core/furnish's five
   builds register their furniture (fingerprints unchanged); Iziz's `REG` and Voth's `PLACED` are read in. Next: the biome kits, with the
   reseeding event (`core/tags/PROPOSAL.md`).
8. **`core/mask` DONE 2026-10-05** (Iziz, Dalab, Erewhon, Roketstad place from it; Voth since 2026-10-08; `core/mask/README.md`). Next: Iziz's export
   on the `KRATOR_EXPORT` shape (M5). **M5 DONE 2026-10-13** (`core/export/README.md`, "Iziz"; `godot/tests/export/iziz_test.gd`).
9. **The host shell, narrowed**: the biome kits and one settlement per lineage; the rest when next touched.

**Normal maps after the JPEG switch** *(found 2026-10-06; off the critical path, nothing is broken today)*. The library's
normal maps became `normal.jpg` (JPEG q95, 4:4:4) in `9b46d9e`. Godot does not read the library yet: `godot/krator/kmat.gd`
loads each build's `tex/` pack, which is WebP. What is left:
- **40 sets still on `normal.png`**: the ones added on main after the switch (the eastern badlands' and Ys's sets among them;
  `git grep -l '"normalMap": "normal.png"' -- 'core/materials/**/meta.json'`). Convert them the same way (Pillow,
  `quality=95, subsampling=0`) and point their `meta.json` at `normal.jpg`, so the library has one format.
- **`kmat.gd`'s `_tex()` reads only WebP and PNG** (`load_png_from_buffer` for anything not `.webp`). Add a
  `load_jpg_from_buffer` branch before Godot reads library sets directly, as `GODOT-PLAN.md` plans.
- **Packed normals are lossy WebP, which is always 4:2:0** (`tools/textures/pack.py`, `webp(..., 92, 'RGB')`): X and Y
  live in red and green, so the pack halves their resolution, a bigger loss than the JPEG switch avoided. Write packed
  normals as lossless WebP or PNG.
- **Re-packing moves the baseline.** A build that re-runs `pack.py` on a converted set gets very slightly different
  normals (decoded from the JPEG), so its `PORT-BASELINE.json` hash changes with nothing to see. Re-pack Girder, Iziz,
  Ys, Yuni, Mechs and Motor Vehicles in one change with one baseline rewrite, after the packed-normal format above.
- `core/materials/record/23-mat-record.js:59` still names `normal.png` in its convention string; change it in that
  same change, since it alters Girder's built page.

## Features

- **Revisit taxes when the economy is more fleshed out** *(the owner, 2026-11-03)*. For now money is taxed only by an
  excise on imports and exports (core/simulation/PLAN-MONEY.md, M5). Wage, sales, land or poll taxes, tolls on the roads
  and harbour dues wait until wages, prices and the player's towns run: decide then which each nation levies, and who
  the taxes pay (soldiers, officials, the watch). The tribute player settlements owe a nation (same plan) is separate.
- **DONE (first batch): `core/minimap/88-core-minimap.js` (`KMAP`), in Voth.** **Minimap** *(Menagerie: `src/moria/walk.js:130-149`)* **[G data]**. A 2D canvas panel, drawn from data
  rather than from the rendered scene. A base layer is painted once into an offscreen canvas: every walkable
  floor, sorted by height so upper levels cover lower, coloured by level, with labels. Each update (at most
  4 Hz, only while the panel is open) copies the base layer and draws the viewer's dot and view wedge.
  Hovering names the floor under the pointer; clicking walks there.
  - For Krator: a shared `core/` fragment that paints from each build's `PLACED` list (footprint, rotation,
    tag) plus hill shading sampled from `terrainH()`, and water. Colour by tag, click to fly or walk.
    Start with Voth, whose `PLACED` list is already exposed (`settlements/voth/src/85-probe.js:73`).
  - Godot: the same records drawn in a `Control._draw()`, almost line for line. Better still, bake the base
    layer to a PNG at export time and ship it with the tile.
  - Optional: a one-time overhead orthographic bake to a texture as the background, for the painted look.
    Hide the sky, fog and inspector helpers during the bake.

## Viewers, interaction and effects *(the owner, 2026-10-07; raised during the Zeijani kit, not started)*

- ~~**Doors that open.**~~ Done (2026-11-03/04): `core/door` (KDOOR's kinds: swing, slide, lift, tilt, fold, iris, hatch,
  pairs, double-acting, sprung; KDOORLEAF's styles; KDOORHOST's E and tip) in every building kit. What is left is under
  "Doors and glass: what is left" above.
- **One walk mode and one set of controls in every viewer.** Implement walk (first person on the `core/walk`
  floors, steps and slopes, collision with its blocks) everywhere, and standardise the UI and the keys across all
  builds and kit sheets: the same buttons, names and shortcuts (inspector, cut-away, night, polygon tool, walk).
  The Zeijani kit's page (`kits/zeijani/src/92-camera.js`) is one reference (retired 2026-10-18: the kit's sheet and Dhelv
  are on core/host, whose `90-host-camera.js` carries those controls; `kits/zeijani/README.md`, "The engine"). **[web]**
  *Under way (2026-11-09, branch `ccr-55bd6ee1-p1si44-walk`).* The one key map and the one walk mode are
  `core/host/92k-host-keys.js` (`khost.KEYS`; `core/host/README.md`, "The one key map" and "The one walk mode"): a build
  names its controls by id (`KHOST.standard({std: {night, cutaway, door, interiors, shadows}})`) and gets the same button,
  words and key; the walker is sub-stepped (it went through thin walls), `window._walk` lets `tools/harness.py walk`
  drive any page, and every `verify.py` checks `one-key-map` and `walk` (a raised floor stood on, a wall that stops the
  walker) on a page that takes it. A build is **adopted** when its page takes `khost.KEYS`, its controls go through `std`
  and its `--assert` passes both checks.
  - [x] core/engine and every kit on it (`kengine.HOST`, `CORE_DIRS` with `core/walk/box`), each `--assert` passing: Scyvoi,
        Ash Nomads, Desert Nomads, Islanders, Lizardmen, Resources, Post-Apoc (moved onto core/host), Eternian (with interiors:
        `?interiors=1` 58 buildings, 172 rooms, 1021 pieces, no errors), Yeti; Tents (build.py only; its own
        `interiors-reachable` fails, as on the page before: the Tents session's verify was being rewritten)
  - [x] build.py `khost.KEYS`, controls through `std`, `--assert` passing: Construction, Zeijani (its C became X; Night, Door,
        Shadows), Necanyons (N), Verge (E), Span, Girder (E), Reed Lake, Shade, Jimjam, Screamers, Iziz (city and Vernacular: E),
        Ys (city: N; kit), Longsong (its interiors re-baked on the merged kit), Locus and Mungo (E; they read one take)
  - [x] adopted, the key map and the walk passing, the build's own checks failing as on the page before this work:
        Guilin (fruit drawn; foliage attach 31.96%), Pinnacle Rock (N; foliage attach 1.87%), Dalab (swlowlands/glossy
        282,687 instances over the 250,000 cap with no `capWhy`, since it reads the biome in place)
  - [ ] Mav's Refuge (E; the key map and the walk pass): `walk-and-reach` could never read `MRWALK` (the page's script is
        scoped; now `window.MRWALK`, 2026-11-10). Its first real run fails: 370 of 2373 floors unreached from the doors of 1480
        units (284 units with no unlocked door), most of them the stores' floors (`mix.3.store.floor.0`, ...): the interiors'
        stores are not entered from their units' doors (src/57a-interiors.js, 83-mr-walk.js)
  - [ ] Yuni: E is the key map's Door, but F is Yuni's own walker (`DOORS.walk`) and the page hands the host no `KWALK`:
        port Yuni's walker onto core/walk (Locus, Mungo, Girder and Mav's Refuge share the Yuni engine; theirs are on the host)
  - [ ] not yet: the biome kits but Guilin and Necanyons (`khost.KEYS` in `build.py`, the take's Night through `std`;
        Geyser and Godthrone have Day / Night buttons of their own, so N wants a std entry with no button: a 92k option);
        crater-drylands binds L to its fire tool (the polygon tool's key: `keysCheck` reports it); Metropolis (its X);
        Dhelv (its C and N; the Zeijani session); Highlands, Xanadu (the interiors session), Noah's Regret (C and T: record the
        clash), Voth's city target, the isle demo; the sheets with their own camera (kits/ancients, kits/port and
        biomes/dambasins's copy, kits/ringsea, the catalog engine's pages) move onto core/host first. Then `KEYS` joins
        `khost.SHELL` at an all-builds rebuild.
  - [ ] the merges of claude/dreamy-tesla-wzp8hw and ccr-55bd6ee1-p1si44 (2026-11-10) change `core/host/95-host-probe.js` and
        `core/biome`: every core/host and biome page not rebuilt since is behind its sources until the all-builds rebuild
  - [ ] tents and round bodies drawn from cylinders and cones register nothing in `core/walk` (the nomads' tents, Tents):
        the walker walks through their cloth (`core/engine/README.md`, "Controls and walk")
- **Interiors in every building kit that has them, with a cut-away.** Integrate `kits/interiors` (its sets, the
  furniture placer through `core/furnish`) into every building kit whose buildings have a corresponding interior
  set, each with a cut-away that opens them. **[G data]** for the plans.
  - [x] Done once in `core/engine` (`91i-interiors.js`; `core/engine/README.md`, "Interiors", 2026-11-09): a kit names its sets in
        `build.py` (`kengine.interiors([...])`); X opens the building nearest the view storey by storey (the host's cut-away),
        `?interiors=1` / U plans and furnishes every building with an item through `core/furnish`, rooms and pieces in core/tags,
        floors and walls in `core/walk`. Wired: Eternian (checked: 58 buildings, 172 rooms, 1021 pieces, no errors);
        Post-Apoc takes its units for the cut-away.
  - [ ] the other sets belong to kits on other engines (Highlands, Iziz, Talia, Pylon, Reed Lake, Yuni, Locus, the Eastern
        Abyssal, the Beast Riders; Zeijani and Noah's Regret on their forks): each wires its own, or moves onto core/engine
- **One flame and heat-haze effect.** Look at `biomes/crater-drylands` and `biomes/throne` (the caldera) and make a
  standard flame plus heat-shimmer effect shared by every build (fires, braziers, burners, lamps, lava). **[G shader]**
- **Water: an audit and one best solution.** Audit the water effects across the builds and settle on the
  best-looking one that appears to run downhill under gravity, leaves no gaps, fills where it should (basins,
  channels, pools) and stays out of where it should not (no water through floors, walls or banks). **[G shader]**
  for the surface, **[G data]** for where it fills.

## Card sheets shown whole *(2026-10-23)*

Most library cards are sheets (three by three plants, or an atlas of pieces). A page shows ONE of them when the slot in
its `materials.json` names a `cell` (the pack carries it; `BIO.libSwap` and n semiarid's `libCard` window the texture
to it) or when the page cuts it by hand (`libCell(..., CELL(i, j))`, or the geometry's UVs: Korona's `cellUV`). Miss
both and every instance shows the whole sheet: n semiarid's steppe grass read as "a sheet of 9" and its maple keys flew
as a sheet (the owner, 2026-10-23; fixed: its inline pack writer dropped `cell`). Korona's punji-pit lids show the whole
`card.litter` atlas (`biomes/korona/KNOWN_ISSUES.md`). The library does not mark a card as a sheet, which is why nothing
caught it.

`python3 tools/textures/cell_audit.py [--list] [<build>]` lists, per build, the slots that take a sheet card with no
`cell` (215 in 25 builds today) and how the build writes its pack. Each slot is a candidate, not a bug: open the page's
code and see whether it cuts that slot by hand.

- [ ] **Audit every candidate slot**, build by build, and give each a `cell` or a hand cut, or a note that the whole
  sheet is meant (a crown card may want a cluster of nine sprays: n semiarid's aspen, blossom, broom, lobed and sage
  crowns are such, unjudged). Biggest first: Throne 39, Crops 44 (it picks cells by code: check how), Korona 15,
  Necanyons 15, Longsong 14, crater-drylands 12, ebadlands 10. Take one screenshot of each judged slot.
- [ ] **The inline pack writers that drop `cell`**: crater-drylands, ebadlands, ehighlands, shighlands, oidong (the Throne's passes it since 2026-11-02),
  Zeijani and Girder each keep a `matlib_pack()` copied from ebadlands that leaves `cell` out of the pack, so a slot
  given a `cell` in `materials.json` still shows the whole sheet. Nothing shows wrong today (their celled slots are cut
  by hand, or not swapped in: ebadlands' `litter`), but it is a trap. Pass `cell` (n semiarid's `build.py`, one line),
  or move them onto the shared `tools/textures/matlib_pack.py`, which keeps it. A page's hashes do not move unless a
  celled slot reaches the page.
- [ ] **Mark sheets in the library**: a `sheet: [3, 3]` (or the atlas's grid) in each sheet card's `meta.json` record,
  written by `tools/textures/cards.py`, so `pack.py` can warn when a build packs a sheet with no `cell` and no
  `"whole": true` saying it means it; `cell_audit.py` then reads the mark, not the source note's words.

## Biomes: the port plan's findings *(GODOT-PLAN.md, re-assessed Oct 2026)*

The nine biome kits are next in the audit order (`GODOT-PLAN.md` 3.3, step 2) and are what milestone M4 (a
first tile in Godot) needs. They start ahead: one core (`core/biome/`), one PRNG, a host reached only through
`BIO.init`, a placement pass (`TREES` records) apart from the draw pass in every kit, an exporter
(`BIO.export`), a probe and `--assert` in each, and pages that match `PORT-BASELINE.json`. The plan and the
order are in `biomes/WORLD.md` ("Against the port plan"); the contract is `biomes/GODOT.md`. Suggested order:
the audit, the shader kinds, tags and ids, the host, the reseeding event, then variants with opt-in heroes.

- **DONE 2026-10-03: the port audit for the ten kits** (tooling, no tag; the scoped hand pass, `GODOT-PLAN.md` 3.3; the text below is what was asked, kept for the record). One finding differs from it: `65-dress` is not a `BIO.grid` pass, it samples the host's shells (`BIO.upFaces` and the like) and puts; its note says so. nwbay has since moved onto the shared core (2026-10-03).
  *The tool part is done (2026-10-02): `PORT-INDEX.md` names the `biome` exporter for every kit on the shared core,
  (nwbay too, since 2026-10-03).* Correct the provisional tags in each
  `biomes/<kit>/PORT.md` and write the split lists into its Notes: `45-host-stage` holds `terrainH`, the water
  and the fields, which are data `core/terrain` replaces (note it "split", not plain host); `55-trees` is
  already a placement pass and a draw pass; `60-floor` and `65-dress` place and draw in one pass (`BIO.grid`
  then `BIO.put`); `85-host-tower` is a preview prop (a builder); `82-host-sky` becomes a `core/atmos` sky
  preset.
- **[G shader] One copy of each biome shader hook, in the core.** The iridescent bark `BIO.iridBarkMat` is
  done (2026-10-12): it was written in five kits (eastabyss, rift unguarded with different signatures;
  nhighlands, shighlands, xanadu guarded), so with several kits resident the last definer loaded won (a residency
  bug: eastabyss before xanadu gave xanadu's boles eastabyss's tints). It is now the `irid` kind in
  `core/biome/30-core-foliage.js`, one definition with Rift's signature and eastabyss's tints as the defaults;
  every kit's baked geometry and tints were proven unchanged. *Done 2026-10-25 (branch `claude/biome-rebuild`):* the
  two-tone gloss bark is `BIO.glossBarkMat` (nwlowlands, swlowlands), the impostor is `BIO.farMat({rule:'irid'|'gloss'})`
  (rift, swlowlands), nhighlands' hanging sway is `BIO.hangMat`, and swbay's and nwbay's phase-driven fauna body is
  `BIO.phaseAnimMat` (`35-core-anim.js`, which swbay and nwbay now list). The kits' names stay as one-line forwards. Proven
  by same-view screenshots before and after (the HTML changes, the pictures do not). Godot's set is now the seven
  shaders: leaf card, bark, iridescent bark, gloss bark, far impostor, hanging sway, fauna body (`anim` and `anim-phase`).
- **[G data] Tags and ids on what the kits place.** Only nhighlands (harvest) and swlowlands carry tags in kit
  data, and no species has its Köppen classes. Put class, species, biome, Köppen and harvest in the `BIO.def`
  options, and give every item, bucket and placement record a deterministic id in build order, so
  `BIO.export` carries them and `core/tags` (Phase 2) takes the kits as they are.
- **[G data] One fauna kit** (Travis's call, `biomes/README.md`): every biome's fauna and the settlements'
  creatures in one kit on `core/biome/35-core-anim.js`, tagged by biome (the item above), each animal's motion
  a function of time (`aP0`/`aP1` paths; the life layer section below). swbay's local `animMat` retires with it.
- **[web] The biome hosts as the first `core/host` customer** (Phase 1). The kits' host fragments
  (`host-stage`, `-sky`, `-build`, `-camera`, `-probe` in ten builds, `host-tower` in eight) are each their own
  version (`PORT-INDEX.md`, host-shell copies), but a kit reaches its host only through `BIO.init`, so these
  are the easiest builds to put on one shell. The stage's terrain, water and fields go to `core/terrain`;
  its DOM goes to the host. `BIO.download()` is split out (2026-10-03) into `core/biome/43-core-export-host.js` [web];
  it joins `core/host/` with the rest in Phase 1.
- **[G data] Placement records carry no LOD level.** Each kit picks a tree's level (hero, lite stand-in, far
  impostor: `T.lv`) as it places it, from the tree's distance to the showcase's LOD spine (`BIO.lodD`): the
  preview's camera baked into the data. Godot has no spine and needs every tree at every level. Placement
  writes level-free records; the draw pass picks the level in the preview; the export carries hero, stand-in
  and impostor as levels of one record (`biomes/GODOT.md`, "Not done yet").
- **[G data] One reseeding event for every kit.** `rng` in `core/biome/10-core-head.js` is mulberry32
  (integer: it ports bit for bit). `h3` is a `Math.sin` hash, and `vnoise`, `fbm` and so every field and zone
  rest on it, which a GDScript generator cannot reproduce. Do together, once: `h3` onto `core/rand` (Phase 2),
  placement seeded by cell (`biomes/WORLD.md`), the level-free records above, and each kit's `terrainH`
  closure baked to the `core/terrain` heightmap. Each of these moves every plant; together they cost one
  screenshot set, one `tools/port_baseline.py --write` and one gallery update, not four. Tune preset views
  after it, not before.
- **[G data] Trees as variants by default, hero trees opt-in (Travis, Oct 2026).** Trunks and branches are
  built unique per hero tree and merged into buckets; only leaf cards, floor and dress are instanced. Godot
  grows the flora at run time (`biomes/WORLD.md`), so unique trees everywhere would mean porting the tree
  builders to GDScript, which the plan rules out (a builder crosses over as its meshes). So: K baked variants
  per species and habit (12 to 24, say) exported as meshes, chosen by each record's seed, with per-instance
  scale, turn and tint; only placement is ported, and the golden test compares records, not meshes. The
  preview gains too: instanced variants instead of unique trees cut held triangles (rift holds 25.7M in 1,737
  meshes) and build time.
  - **Hero trees stay, as an opt-in** (`biomes/WORLD.md`, "Hero trees: an opt-in"). The hero builders are
    kept (each variant is one of their seeds). A record marked `hero` by a site or a hero zone is built unique,
    baked per tile as its own mesh and streamed by Godot, never regrown. First users: Mav's Refuge, whose
    architecture is built on its trees' `trunkR` (and Girder's hypertrees, the same builder), and
    hyperjungle's hero disc. A hero budget per tile; a preview switch between every tree a hero and heroes
    only where opted in.
  - Mav's Refuge's and Girder's `60-trees.js` carry a provisional host tag in their `PORT.md`; they are
    builders, and their trees cross over as meshes with the settlement.
- **[G data] `BIO.export` onto the shared vocabulary** (Phases 3 and 4). Material records onto `{family,
  colour, map, roughness, metal, emissive, doubleSided, alphaTest, hook}`, with `hook` naming a library shader
  (the kinds above); a `convention.colour` per table (the biome export is linear, the atmosphere's sRGB); then
  fold it into `core/export/` as the `krator-world` template. The canvas painters (3 to 9 per kit) bake to
  PNG, which the export already does. *Done 2026-10-13 (`core/export/README.md`, M4):* in the `krator-world`
  container each biome material carries the KMAT vocabulary (family, roughness, metal, specular, hook, lib, scale,
  tint) beside its own kind and options, and library maps travel by reference; `BIO.export` itself is unchanged.
  Open: `hook` still names the kit's kind, not a library shader (stage 2e).
- **[G native] Preview LOD: adopt `core/lod`, stop growing the kits' own.** The plan freezes runtime LOD as
  preview-only. A kit's per-chunk `BIO.range`/`minRange` is data (it becomes Godot's `visibility_range`) and
  stays; `BIO.lodTick` is preview machinery. `core/lod` already knows the biome sets (class `biome`,
  `minPx:0`) and no kit lists it: measure it on rift (clustered proxies for merged buckets, frustum-culled
  instance copies) before any more bespoke culling. The paused rift pass keeps its range data and profiling.

## Underground and interiors *(Menagerie: Moria)*

- **DONE as a registry: `core/walk/20-core-walk.js` (`KWALK`); no build writes to it yet.** **[G data] The carver registers walkable floors and blockers as it builds** (`src/moria/carve.js`).
  `room()` and `passage()` write `{rect,y}` or `{a,b,w}` floors and `[x0,x1,z0,z1,y0,y1]` blocks as they
  build. The walker, the minimap and click-to-go all read that one list, so they can never disagree with the
  geometry. Krator's walk solids (girder `83-walk.js`) and its geometry are kept separately. In Godot the
  same list becomes collision shapes and a navigation mesh source; export it next to the geometry.
- **[G data] Walls are built split round their openings**, not cut afterwards: each wall is pieces left of,
  below, above and right of each opening (`carve.js:28-36`). No CSG is needed, and no hidden faces. The
  geometry exports as it is.
- **[G native] Draw underground only when you are under ground** (`src/moria/deep.js:15-24`). Everything built
  after a marker goes into one group. That group is drawn only when the camera is below the terrain or near
  a gate, and the terrain is hidden while you are under. It saved a laptop from crashing. Screamers' vaults
  and the dam tunnels could use this. Godot: occluders and visibility ranges do this, but the group toggle is
  one line if wanted.
- **[G data] Fade to dark underground, and carry a lantern** (`deep.js:26-41`): ease a 0-to-1 "under" value.
  Scale the sun, hemisphere and ambient down from the values the day/night code just set, close the fog in to
  black, and move a camera lantern that already exists at intensity 0. Lights are never added or removed,
  because that recompiles every material. Export the "under" volumes and the curve; Godot drives its
  Environment the same way.
- **[G native] Three moving lights for a whole city** (`src/moria/realm.js:31-44`). There are a few point
  lights, moved four times a second to the nearest of a list of light spots. Hundreds of lamp heads are one
  InstancedMesh of unlit material. Godot's Forward+ renderer handles many lights; the pool still matters on the
  Mobile and Compatibility renderers. Export the light spots either way.
- **[G shader] Shafts of daylight without lights** (`src/moria/halls.js:163-172`): an additive open cone from
  the window to the floor, an additive pool on the floor, and a bright sky card behind the opening.
- **[G shader] "See inside": the mountain as glass** (`deep.js:46`): terrain at opacity 0.18 with depth write
  off. Hidden features (the Endless Stair) are drawn only in that mode.
- **[G native] Polished stone underground uses Phong** (per pixel) so lantern light runs in the walls. Lambert
  is per vertex and loses a small light on big planes. Godot shading is always per pixel.
- **[G data] One switch for lit and dark states** (`src/moria/city.js:259-262`): a whole city changes from
  inhabited to ruined by swapping colours and emissive intensity, never geometry. This fits Krator's ruins and
  inhabited variants. Export both palettes.
- **[G data] The generator checks that every hall is covered by rock** (`tools/make-moria.py:20`). This could
  be an assert in `verify.py` for carved builds; run on the export, it guards the Godot side too.

## Interiors *(Menagerie: the Backrooms, `src/backrooms/`)*

Krator's interiors planner (`kits/interiors/src/46-planner.js`) already splits a floor plate, cuts openings
and outputs walls, doors and a room graph, so the layout side is covered. What the Backrooms adds is about
making many rooms look lived-in cheaply.

- **[G data] Light baked into vertex colours** (`level.js:216-241`). Every surface is cut into a grid of about
  0.6 m. Each vertex adds up the ceiling panels within 7 m that it can see. Visibility is a 2D walk along the
  grid lines, so light goes through doorways and walls cast shadow. A direct term and a soft fill term are
  clamped to 1.7. The cost is nothing per frame and no real lights. Godot's LightmapGI cannot bake rooms
  generated at runtime, so export the colours as mesh `COLOR`. Use it for furnished rooms, with the catalog's
  lamps as sources.
- **[G shader] Per-lamp flicker without lights** (`level.js:176-188`, `:437`). Each vertex stores how much of
  its light comes from a flickering panel and that panel's phase (attribute `aF`). The shader dims by
  `share·(1−flick(t,phase))`, so the wall flickers with the lamp. Lamp state is on, dead or flickering.
- **[G data] Grime from world-space noise, not in the texture** (`textures.js:7-9`, `level.js:243-252`).
  Textures are one clean repeat at real size (wallpaper 1.2 × 3 m, a ceiling tile 1.2 × 0.6 m). Stains, damp
  creeping up walls and puddles go in vertex colours from fbm over world position, so no stain repeats.
  Stains tint brown rather than grey. This fits every Krator interior and ruin.
- **[G data] Room-variety rules as numbers, one generator per level** (`level.js:28-51`):
  - the chance two rooms merge, leaving columns where the wall would be;
  - partial walls that stop short;
  - one-door versus full-width openings;
  - weighted ceiling heights, with narrow halls more often low;
  - a lighting mode per room: full, alternate, dim or dark, with rates for dead and flickering panels;
  - lamp colour, ambient light and fog.
  Office, car park and pool hall are one generator with three presets. Worth adding to the interiors
  programmes as a `variety` block.
- **[G data] Streaming interior chunks from the seed** (already listed under Worlds): each chunk boundary
  forces one opening, so neighbours always connect.
- **[G shader] Pool caustics** (`level.js:199-213`): two crossed sine fields, `pow(|a+b|·0.6, 3)` for the
  bright lines. Ten lines; useful for baths, cisterns and fountains.
- **[G data] Procedural ambient sound** (`sound.js`): mains hum as a 120 Hz sawtooth through a band-pass, a
  60 Hz square, a high whine and hiss, all slowly modulated. Each level swaps the recipe. The parameters
  port to Godot's `AudioStreamGenerator`; the Web Audio code is [web].

## Props to harvest into the catalog *(Menagerie)*

Most Menagerie props are city-scale, one primitive each, so few are worth taking. The ones listed are pure
geometry merged per material, so they are **[G data]** unless marked otherwise. Convert each to the
`kits/furniture/SPEC.md` shape (`F.*` and palette keys, a declared size). Iziz's and Voth's props are
Krator's own already.

**Real gaps:**
- **Siege engines** (`src/middleearth/hosts.js`):
  - a counterweight trebuchet (`mkEngine`, :249) whose beam sits on a pivot group, so it can swing; it needs
    a sling and a windlass added;
  - a four-storey siege tower (:293) with braces, a hide front, wheels and a drawbridge;
  - a ram slung on chains under a wheeled gantry (:327, parametric length and radius).
  Suits Beast Riders, Voth and Republican. They are too big for furniture, so make a small siege kit or a
  `type:'engine'`. The pivot maps to a Godot AnimationPlayer.
- **Pressurised outpost modules** (`src/europa/details.js:54`, one recipe with a `kind`):
  - a hull on legs with domed ends, an airlock door, a window strip and an antenna; the lab version adds a
    radiator;
  - a domed tank;
  - a ribbed Quonset garage;
  - a steam-pipe run on trestles (:27).
  For Ancients sites, intact or ruined, and post-apoc. Low effort. (Its dishes duplicate
  `kits/ancients/src/86-dish.js`.)
- **Vehicles** (`src/arrakeen/machines.js`):
  - an ornithopter with hinged wings (:20);
  - a carryall whose grapples drop and whose suspensor bags fill (:46);
  - a tracked harvester (:73).
  Each is a factory returning a Group with `update()`. The silhouettes are recognisably Dune, so reshape them
  before taking them. For Ancients, post-apoc and the Iziz spaceport.
- **A shoji and tatami building kit** (`src/infinitycastle/kit.js`):
  - `room()` in ken modules (:74): tatami, fusuma, shoji, a veranda, a hipped roof and a paper lamp;
  - galleries, stairs and bridges;
  - sliding panels.
  It is already data-shaped (`B.box/quad/beam` by material name). The paper surfaces are canvas textures
  [web]; bake them to PNGs. For Republican's Korean strand or Xanadu.
- **Signage** [web for the text] (`src/fleshpit/signs.js:20,51`, `src/nightcity/neon.js:39,107`,
  `src/kowloon/life.js:132`): boards, backlit signs, blade signs, projecting signs on arms. Kowloon's window
  cages, AC units and pipe bundles (:105) suit post-apoc facades. Bake a PNG atlas of Krator strings in izani
  glyphs. Do not port neon.js's `BRAND` table, which holds real trademark names.

**Ideas for existing pieces:**
- **Guardian statue** (`src/moria/city.js:71`): a robed, bearded figure with an axe, scaled by height. A
  generic ruin statue.
- **Forges** (`src/moria/city.js:148`): take the hood and chimney, and the glowing pour channel. In Godot the
  coal and the pour need emissive materials.
- **Festival marquee** (`src/shire/party.js:26,35`): three peaks, a valance and trestle tables, plus
  pavilions. For Rustic.
- **A lofting toolkit for hull builders** (`src/starship/parts.js`: `lathe`, `tube` with cross-sections,
  `sweep`, `grille`): could help `kits/ringsea/src/42-rs-hull.js` and the Ancients.

Skip: the street furniture (one primitive each), Moria's headframe, carts, chests and well, the gondolas, and
the pumpjack. Krator's are better or the same.

## Shafts, caverns and organic interiors *(Menagerie: the Flesh Pit, `src/fleshpit/`)*

Krator has no vertical shaft, cavern network or organic interior. The eastern abyss paints its shelf wall on
a backdrop sphere, and `core/terrain/36-core-carve.js` only does overhangs. Candidates for a new
`core/terrain/37-core-shaft.js` beside carve, and for locus, eastabyss and the screamers' underground:

- **[G data] The shaft as a profile, with layers in data** (`organism.js:50-75`). `radiusAt(d)` interpolates
  radius per layer, adds cavity bulges and pinches at layer boundaries; `wallAt(d)` flares the mouth to meet
  the hole cut in the ground. Every other module places itself from these two functions. The profile could
  feed carve's `recessD`, so the heightfield opens over the shaft.
- **[G data] The shaft wall** (`organism.js:164-206`): rings of 72 vertices every 6 m. The radius is
  multiplied by wobble, wandering veins (`pow(max(cos),7)`), grooves and creases. Vertex colour darkens with
  depth. Pure array maths, so it becomes an `ArrayMesh`. Rock or a sinkhole with a different palette.
- **[G shader] A strata cut-face shader** (`section.js:91-176`). Depth below the local ground is warped by
  fbm into bands: soil, laminated rock with cracks, seams, then folded beds. Each bed has its own thickness,
  creases between folds, `fwidth`-faded fibre, a wet sheen along each fold crest, lens bodies the beds bow
  round, and beds sagging round the shaft. Every input is world position. With a rock palette it is a
  geology material for any cliff or cut face (`core/materials`). Krator's strata today are `sin` shelves
  (`settlements/highlands/src/73-hl-carve.js:217`).
- **[G native] Back faces only for interiors** (`organism.js:110-115`): walls drawn `BackSide` with faces wound
  outward. From inside you see the far wall; from outside the near wall vanishes, which is a free cutaway.
  Godot: `cull_front`.
- **[G shader] Fluid that fills a volume to a level** (`lungs.js:41-48`): a copy of the cavity mesh whose
  vertex shader clamps `y=min(y,uLevel)`. It is a flat-topped body that rises as `uLevel` animates. For
  flooding cisterns, basins and ruins.
- **[G data] Side tunnels from a small spec** (`tunnels.js:41-110`): `{d,a,r,len,bends,wander,drift,state}`
  makes a Catmull-Rom tube that drifts in plan and depth. A black cap at the far end makes the light die
  rather than the tunnel stop. The mouth gets a bulkhead, a grille, a ladder and a blinker. `state`
  (sealed, surveyed, worked) adds rails, a cart and work lamps. Godot: `Path3D`.
- **[G shader] + [G data] Breathing** (`organism.js:78-107`): a sine wave running down the axis pushes
  vertices radially in the vertex shader. The same function in JS drives the matching machinery (rams), so
  steel and wall stay in step. It is the injection technique `core/biome/30-core-foliage.js` already uses
  for sway.
- **[G shader] A pulse band running along a conduit** (`anatomy.js:30-46`): emissive
  `pow(max(0,sin(phase+y·k)),sharp)`, with a two-stroke heartbeat. For glowing conduits, ley lines and power
  cables (`core/materials`). See also City 17's climbing pulses below.
- **[G data] Lamps hung by who installed them** (`organism.js:131-141,893-906`): the colour names the owner
  (sodium, fluorescent, mercury vapour). Strings every 40 m, denser where people walk. All glows are one
  additive point cloud. Wall brightness scales with depth. An `underground` atmos preset.
- **[G data] Organic forms:**
  - brain-fold bulbs from crossed sine fields, with groove depth reused as colour (`springs.js:44-73`);
  - lobed lungs (`lungs.js:54-96`);
  - a branching tree steered to stay inside a volume (`lungs.js:104-152`), for roots, coral and cave growths
    (`core/biome` trees have no containment test);
  - wall growth whose density rises with depth, merged per material (`organism.js:226-279`).
- **[G data] Visitors:** queues that advance a slot every 5 s, and evacuation blended to the nearest exit with a
  per-person delay (`visitors.js:35-52,129-160`). Krator's crowds have neither. Creatures that climb the
  wall by riding `wallAt(d)` (`fauna.js:178`).

**City 17's climbing light pulses** (`src/city17/landmarks.js:104-115,163-167`) are not a shader. Each conduit
is a column of nine translucent unlit boxes, and the pulse is a separate bright box. Every frame its height
is `fract(time·speed + phase)` mapped onto 10–90% of the tower. It is pushed out from the axis by the tower's
own width at that height (`wid`, `dep`), so it hugs the taper. Its opacity breathes with a sine and with
night. **[G data]** as written: a pure function of time, which Godot can drive identically. The cheaper way
in both engines is the pulse-band shader above, **[G shader]**: one emissive band on the conduit material,
with no extra mesh.

## Small set pieces worth taking *(Menagerie)*

- **[web] → bake to PNG, or [G shader] A painted pine on gold leaf** (`src/infinitycastle/mats.js:92-122`,
  `fusuma()`). These are the sliding panels at the back of every room, including Muzan's lab. It is painted
  on a canvas:
  - gold leaf laid in 14 px squares, each a little different, with fine seams;
  - bands of cream cloud (suyari-gasumi) in rounded strips;
  - rows of wave arcs along the foot;
  - a pine drawn as a recursive branch: quadratic-curve limbs that narrow by 0.6 a step, with an ellipse of
    needles at each joint;
  - black lacquer frames and round pulls.
  It is painted across four panels so a run reads as one picture. The recursive pine is a small, reusable
  recipe for any painted screen, mural or banner (Xanadu, Republican). Bake it to a PNG for Godot, or keep
  the recipe as data and paint it at export.
- **[G data] + [G shader] A glowing floor sigil** (`src/infinitycastle/places.js:291-294,409-424`, Akaza's
  hall). A 1024² canvas is drawn with `shadowBlur` for the glow: rings, twelve needles with branch ticks that
  make it a snowflake as well, diamond points and a tick rim. It lies on a plane 3 cm over the floor with
  **additive blending and depth write off**, tinted cyan. Each frame its opacity breathes
  (`0.7+0.25·sin(1.3t)`) and it turns slowly (`0.05t`). A cyan point light and a glow sprite above make it
  light the room. Repurpose it for ritual circles, Ancients floor seals, portals and landing pads. In Godot:
  a `Decal` with emission, or an unshaded additive quad; the sigil could be drawn in a shader from polar
  coordinates.
- **[G shader] Horizon fire-glow behind the far range** (`src/minastirith/shadow.js:58-67,124`). It is one
  plane at 0.99 of the backdrop radius, a little north of east, facing the camera. It uses an additive
  shader (`One, One`) with no depth test, drawn just after the sky (`renderOrder -0.7`). The fragment is an
  elliptical Gaussian, `exp(-r²·9)` with y stretched 2.2×, in deep orange. Its strength breathes with two
  slow incommensurate sines (`0.55+0.15·sin(0.7t)+0.08·sin(3.1t)`). The same file lights the underside of
  the cloud deck red toward the fire (`:96`: `exp(-max(d.y,0)·7)·smoothstep(-0.2,0.8,d.x)`).
  - **For Krator's far volcano:** swbay's far-country volcano (`biomes/swbay/src/45-host-stage.js:212-252`)
    and Voth's baked volcano dome (`settlements/voth/src/21-sky.js:188+`). Put the glow on the volcano's
    bearing, raise it at night through `atm_night`, and tint the low sky and the base of the plume.
  - In Godot it is a quad in the sky layer, or the same Gaussian added in the sky shader on the volcano's
    direction, which is simpler.

## Fixes *(Menagerie runtime)*

- **[web]** Recover from a lost WebGL context: `preventDefault` on `webglcontextlost`, show a panel, restore.
  No Krator build does this (`src/core/shell.js:31-43`). One place for it is `gallery/krator-bar.js` `tune()`.
- **[web]** Isolate errors per subsystem in the frame loop. In Voth, `updateLife`, `skyAdvance` and the HUD
  sit outside the try (`settlements/voth/src/80-camera.js:303-319`), so one throw means it never draws again.
- **[web]** Isolate errors per pass in the build, too (`src/core/diag.js`, `section(name, fn)`: the error goes on
  screen under the pass's name and the next pass runs). In Krator a throw at the top level of one fragment stops
  every fragment after it, so a broken flora pass leaves a blank world; Locus's `window.onerror`
  (`settlements/locus/src/00-head.html:96`) reports it but does not carry on. The fragments share one scope, so
  wrap each pass's call (terrain, buildings, flora, life, dressing), not each file. Belongs in `core/host/`
  (`GODOT-PLAN.md`, `92-host-panel.js`) beside the loop's isolation above.
- **[web]** Input guards: clear held keys and pointers on blur and on hidden tabs; end a pointer when
  `buttons===0`; ignore keys while typing (`src/core/input.js`).
- **[web]** Leave a cut plane installed and park it at `constant=1e7`, instead of swapping `clippingPlanes`
  and recompiling (`settlements/yuni/src/76-doors.js:259`, `kits/interiors/src-walk/70-walk.js:213`).
- **[web]** Call `renderer.compile(scene,camera)` before hiding the loader.
- **[web]** Redraw the shadow map only when the target moves or the sun turns.
- **[G native]** Adaptive resolution (detail before pixels, remember a ratio that failed, hysteresis). Godot
  has resolution scaling built in; the controller logic would carry over if it is ever needed there.

## Rendering ideas *(Menagerie)*

- **[G shader]** Cloud shadows and rain darkening through one shared shader chunk (`src/core/env.js:102-118`).
  Godot: a shared `.gdshaderinc` over the `atm_*` globals; apply the cloud shade in `light()`.
- **[G shader]** Lit windows as an emissive texture for massed and distant facades
  (`src/engine/stages/03-blocks.js`).
- **[G shader]** Lamp schedules computed per instance on the GPU (`env.js:82,192-197`). This matches
  `core/atmos/GODOT.md`, which already puts hours in `INSTANCE_CUSTOM`.
- **[G native]** A dithered fade before LOD drops an object (`env.js:170-181`). Godot's visibility range has a
  dithered fade mode.
- **[G shader]** Fill a cut solid by drawing its back faces as flat hatching (`src/blame/mats.js:166-176`).
  Godot: `FRONT_FACING` in a `.gdshader`.
- **[G native]** A per-frame bounding sphere for movers, so off-screen herds and boats are culled. Godot: a
  MultiMesh `custom_aabb`.
- **[web]** One shared polygon-offset ladder. **[G data]** A shared mitred ribbon helper for roads, rivers and
  walls, whose output is plain geometry.

## Surfaces *(spiderbench, github.com/xikhar/spiderbench, read 2026-10-05; detail in `core/materials/PLAN.md`, "From spiderbench")*

- **[G shader]** Analytic coursing: ashlar and brick joints from UV math and a per-block hash, not a painted
  canvas. A `coursing` TEX kind, pilot on Voth's canton walls.
- **[G shader]** `breakup` gains `rough` and `grime`; grime samples one shared streak sheet (8 by 16 masks, each
  opening picks a cell by hash). One generated image; prompt to write in PLAN.md.
- **[G native]** A detail normal at close range: record field `detail`, Godot `detail_normal`; one shared
  `detail.*` library set.
- **[G data]** Any hash shared between placement code and a shader is written once in `core/` with GDScript and
  `.gdshader` twins and a comparison test.

## Worlds *(Menagerie)*

These are the best Godot candidates: generators whose output is data.

- **[G data]** One land-cover map per world, read by both the ground shader and plant placement
  (`tools/make-yellowstone.py:457-575`, `src/yellowstone/nature.js`). In Godot it is a splat texture for the
  terrain shader and the input to placement.
- **DONE: `KRELIEF.fields` in `core/terrain/38-core-relief.js`; no build uses it yet.** **[G data]** A warped-lattice field and hedgerow generator for the highlands and lowlands
  (`tools/make-shire.py:152-178`).
- **DONE: `KRELIEF.range`, `join` and `volcano`.** **[G data]** Mountain height functions: range walls, junctions that don't double up, volcano cones
  (`tools/make-mordor.py:84-181`).
- **[G shader]** Distant mountain ranges drawn at their true angular size as a backdrop
  (`src/minastirith/shadow.js`). A seamless open world may not want it, except for ranges beyond the map.
- **Data side DONE: `KRELIEF.river` (surface and slope per vertex); the foam shader is still to do.** **[G data] + [G shader]** River foam driven by slope (stored per vertex), and a water surface that never
  climbs downstream (`src/rivendell/water.js`, `src/isengard/isen.js`).
- **DONE in Girder (`settlements/girder/src/83-walk.js`):** the walker is a circle that slides round corners and along walls at any angle (closest-point push-out), and it rides the lift cages (the cage floor is a solid that moves with the cage, and a walker aboard sends the lift off). Girder's stair flights, which sloped the wrong way, are rebuilt with treads.
- **[G native]** Pull a buried camera back along its line of sight (`src/blame/main.js:115-142`): Godot has
  SpringArm3D. A circle walker with corner push-out (`src/backrooms/level.js:395-419`), and a lift you can
  ride: CharacterBody3D does both, platform motion included.
- **[G data]** Chunks generated from the seed alone, with doors forced at chunk edges
  (`src/backrooms/level.js`). This is the same tile-by-tile loading `biomes/WORLD.md` plans.
- **[G data]** Timed set pieces as pure functions of t, publishing signals on a bus (`src/fleshpit/incident.js`).
- **[G data] + [G shader]** Tides: one sea level that everything at the shore reads (`src/beachcity/details.js`,
  `ctx.sea`). Beach City's holds the tide (high water, half a metre lower twice a day by the clock, or held low or
  high by a button, easing rather than jumping), a swell of a few centimetres and the events' drain and surge; the
  water sheet, the surf lines, the boats and the swimmers all follow it, and ground below the waterline is
  coloured wet sand and sea bed. For Krator: `seaLevel(t)` as a pure function in `core/atmos` beside the wave
  field, driven by `core/clock`, with the build's shore lines, moorings and wet-ground mask reading it rather
  than a constant. Port, Ys and the Ring Sea are the first takers. In Godot it is one global shader parameter
  plus the same function in GDScript for anything that floats.

## Water *(audit of every wet surface and Halcyon, github.com/billpwchan/halcyon, read 2026-10-10; the plan is `core/atmos/WATER.md`)*

**Refactor-scale: it touches `core/atmos`, `core/terrain`, sixteen biome hosts and about thirty-five pages, so it goes
with `full-refactor`, not on `main` while the refactor is paused.** Thirty-nine builds draw water; five take the shared
wave field, the rest run ten different ripples or static materials, nine clocks never wrap, nothing but the Ring Sea's
hulls floats, and no water reflects the sky. `WATER.md` section 1 is the table.

- **Phases 0 and 1 started (2026-10-12): `core/water/` exists** (README, data and twins for the six kinds, the node test,
  open water on the CDLOD mesh with skylight and Jacobian foam); the Ring Sea kit and the geyser basin take it. Next: the
  rest of Phase 1's takers (WATER.md section 5), then the shore field.
- **[G data] + [G shader]** `core/water/`: one module with six kinds (open, shore, flow, fall, still, wet), each with
  a data side and a CPU twin (`heightAt`, `flowAt`, `seaLevel`), one clock (`atmWaveT`, whole cycles), skylight
  reflection and depth absorption. A build names its kinds and writes no water shader.
- **DONE for ringsea and geyser (2026-10-12), `core/water/50-core-water-draw.js`.** **[G native]** A CDLOD water mesh (Halcyon: instanced 17×17 nodes, 13 levels from 8 m): ends ringsea's swell
  fading past 600 m and Voth's 75 m rim cells. First, and independent of the wave model.
- **[G data]** A distance-to-shore field (jump-flood on the land mask) driving shoaling, a breaking lip, swash and wet
  sand. The one visible upgrade for every coast.
- **[G data] + [G shader]** One flow shader for every river ribbon: a flow field from `KRELIEF.river` (its slope is
  stored and unread), advected normals, foam from slope, convergence and bank distance. Falls arc; plunge pools churn.
- **DONE (2026-10-12, core/water open water).** **[G shader]** Foam as the Jacobian with a 1.8 s decay (the Ring Sea kit has the first half).
- **[web] now, [G shader] later** The FFT ocean as an opt-in second backend behind `atmos_waves` (three 256²
  cascades, deterministic seed, 76-mode CPU twin), for the worlds whose sea is the subject. After the above.
- **[web]** A 512² ripple sim for wakes, plunge pools and fountains.
- `W.wet` is computed by the weather and read by nothing: wet ground is the cheapest row.

## Lava *(Menagerie: the fire on Kharak, `src/homeworld/kharak.js:15-61`)*

Krator has no molten lava. swbay's flows are cold vertex colours (`biomes/swbay/src/45-host-stage.js:231-236`),
and its plume is a chain of spheres.

- **[G shader] A lava field shader.** *Done in part 2026-10-25 (branch `claude/biome-rebuild`): `core/atmos/fx/89-atmos-fx-lava.js`
  (`ATMOS.lavaMaterial`, `PRESETS.lava`), lifted from the Throne caldera's lake, an integer hash, the module clock, a `flow` drift
  and a `channel` mode; the caldera's lake and the tube's stream take it. Still open: the downslope flow map (one drift per
  surface today) and the emission output for bloom (it returns `hotK`; the three.js page writes colour only).* Kharak's fire is a single fragment shader, with no particles. Fire fronts
  are a thin band where a drifting fbm crosses 0.5. A finer front drifts the other way. Embers come from a
  high-frequency fbm, only on the burnt side. A `burn` 0..1 uniform blends the whole effect in. To make it lava:
  - sample world xz in metres, using a tiled 3D noise texture rather than `fract(sin())`, which loses
    precision at world scale;
  - drive the drift with a downslope flow map, blended in two phases, instead of one constant drift;
  - put fronts and embers in emission so they glow at night and bloom (Godot: WorldEnvironment glow);
  - put voronoi plates under the front band, so the cooling crust reads as plates and cracks;
  - drive it from `atm_time`, and ease `burn` per second, not per frame.
  A Godot sketch is about ten lines (`EMISSION` from the front band and the embers). It suits lava lakes and
  fields; channel flows need the flow map.
- **[G data]** The numbers become an atmos preset: `{kind:'lavafield', scale, flow, frontW, colours, burn}`.
- **[G native]** Sparks and steam: GPUParticles3D, with parameters taken from `src/core/dust.js:13-52` (drag,
  gravity, wind, life, alpha curve). The steam is atmos's existing `smoke` steam preset.

## Geothermal terrain *(Menagerie: Yellowstone, `src/yellowstone/landmarks.js`, `nature.js`)*

Krator has no geysers or hot springs. Combined with the lava field above and the land-cover sinter class
(Worlds), these would make a geothermal biome.

- **[G data] → [G shader] Hot-spring pools** (`landmarks.js:56-83,172-189`). The pool is painted rather than
  modelled, because what it is is colour.
  - The colour is a radial palette ramp from centre to rim. The blue centre is water too hot for life; each
    ring outward is the bacteria that can stand that temperature. There are five palettes (prismatic, blue,
    glory, emerald, opal).
  - Round the pool: a pale sinter apron fading at its edge, a lobed bacterial-mat band, runoff rays streaked
    outward, and a scalloped sinter lip.
  - It is laid as a flat disc at the highest ground under it (`topOf`), with polygon offset. A glossy
    low-opacity Phong skin on top reflects the sky, which is most of what a pool looks like.
  - Options: an optional crater wall, and steam vents scattered in proportion to the area.
  - About two thousand small springs are instanced coloured discs with a rim (`nature.js:254-267`).
  Today it is a canvas texture [web]. As data it is the palette stops, the pool fraction, the ray count and
  a seed, which make a short Godot shader: a ramp on radius, with the lobes and rays from angular noise.
  It also makes an atmos `hotspring` fx kind.
- **[G shader] Geyser eruptions, entirely on the GPU** (`landmarks.js:94-121`). Each drop is a point with a
  seed. Its height is a parabola solved in the vertex shader from `uTime`, for a column height `H`, so no
  per-frame work is needed. One `uAmp` strength sets how many drops are airborne and how high they go, so
  the same points serve pre-play splashing, the full column and the dying away. A `fountain` flag throws
  bursts at every height. A second point cloud makes the steam cloud that drifts downwind
  (`cloudPoints`, :122+); it is heavier on cold mornings and at night (:169).
- **DONE: `KSCHED.eruption` in `core/sched/20-core-sched.js`.** **[G data] The eruption schedule** (`landmarks.js:162-167`): `interval`, `duration` and `phase`, as a pure
  function of time. The strength ramps up over 3 s and holds; there are 50 s of splashing beforehand and
  40 s of fading cloud afterwards. Godot evaluates it identically.
- **[G data] Rimstone terraces** (`landmarks.js:186-215`): lobed extruded steps laid along the steepest
  downhill direction, in flights of three. Active steps are white and orange with blue pools and steam; dry
  ones are grey.
- **[G data]** A sinter cone (a lathe, :217) and mud pots (a stippled disc plus bubbling domes, :223).

## Effects: new core/atmos fx kinds *(Menagerie sci-fi scenes)*

Every Menagerie particle effect is stepped on the processor. Take the parameters, not the code: Godot's
GPUParticles3D, FogVolume and Decal read them directly.

- **[G data] → [G native] `jet`:** ballistic grains under gravity alone (`src/europa/grains.js:18-45`,
  `src/europa/ice.js:163-185`). It starts full, because each grain is placed at a random point along its arc
  (Godot: `preprocess`). Presets `plume` and `vent`, with g as a parameter.
- **[G data] → [G native] `dustburst` plus a `dust` weather mode:** velocity relaxes toward the wind with drag
  (`src/core/dust.js:13`). The Coriolis storm front (`src/arrakeen/events.js:81-96`) crosses at 110 m/s; as it
  passes, fog goes to ×90 and dust brown, the sun to ×0.15, with static flashes. Godot: a moving FogVolume
  plus Environment fog. `ATMOS.W` has no dust mode today.
- **[G data] → [G native] `burst`:** explosion and impact: a flash, a flat ring, sparks and a scar left on the
  ground (`src/homeworld/fleet.js:96-110`, `src/europa/events.js:107-121`). Godot: one-shot particles and a
  Decal. Krator has no explosions.
- **[G data] `exhaust`:** an engine glow disc plus a plume cone, with drive-state presets taken from Voyager's
  warp sequence (`src/voyager/ship.js:246-283`: idle, hot, flare). Trails: GPUParticles3D trails.
- **[G shader] `portal`:** counter-rotating spiral discs, opening as `sin^0.6` (`src/babylon5/station.js:735-760`).
- **[G native] `airbox`:** a haze box (`src/blame/city.js:113-124`); in Godot, a box FogVolume.
- **[G data] `sign`:** text, colour, size and pulse (`src/nightcity/neon.js`); in Godot, a `Label3D` with
  emission, its halo in `glow`.
- **[G data] An `events` export block:** a random-event scheduler with `every:[min,max]` and an `active()`
  gate (`src/core/happenings.js:19,73`).
- Sky module, not atmos, **[G shader]**:
  - drifting cloud bands on the gas giant, from the latitude-stretched, drifting fbm cloud shell
    (`src/homeworld/kharak.js:68-83`); the giant's rim already exists. No night-side city lights: it is a gas
    giant;
  - a galactic band in the star field (`kharak.js:92+`);
  - a rotating-habitat sky: an axial sun tube that dims rather than sets, with land overhead
    (`src/hab/world.js:40-63,357-368,539-560,622-650`).

## Life layer: motion as a function of time *(Menagerie ship behaviour)*

Voth's life layer is integrated state. Ships cycle docked, away, arriving and departing, with avoidance nudges
and departures picked at runtime (`settlements/voth/src/78c-life-ships.js`), so Godot cannot reproduce it from
the clock. The interiors walkers (`kits/interiors/API.md` §8) and the Ring Sea vessels (`rsWayPose`) are
already pure functions of t, and are the model.

- **Evaluator DONE: `KSCHED.timeline` and `KSCHED.slots`; moving Voth's ships onto it is still to do.** **[G data] Schedules as data:** `{route, period, phase, segments:[[dur, ease, from, to]...]}`, as for
  Homeworld's lifters and collector (`src/homeworld/fleet.js:135`: 14 s up, 6 s docked, 13 s down, offset per
  craft). Bake Voth's nav routes at build time, resolve slot conflicts offline, and drop the runtime
  avoidance and the random departures.
- **DONE: `KSCHED.formation`.** **[G data] Formations:** offsets in the leader's tangent frame (`fleet.js:130`, Babylon 5's diamond). Use
  them for coast-guard escorts and strider convoys.
- **DONE: `KSCHED.approach`.** **[G data] A queued harbour approach:** closing distance `9000(1-u)^1.6`, so ships slow as they arrive;
  lateral offsets merge into the lane, then a final alignment (`src/babylon5/station.js:624-700`).
- **[G data]** A closed-form launch from a rotating frame (Babylon 5), for habitats. Arrivals keyed to the
  schedule, spawning and despawning on it.
- **[G shader] Pose on the GPU:** once pose is a function of t, put phase and parameters in
  `INSTANCE_CUSTOM` and pose each instance in the vertex shader. No per-frame uploads, in three.js or Godot.
- **[G native]** Engine lights that stay a fixed size on screen: a MultiMesh of billboards with `fixed_size`.
- Avoid integrated pursuit (Homeworld's defenders) unless it is seeded and stepped at a fixed rate.

## Testing *(Menagerie)*

- **[web] A route walked by scripted input.** From OhMyGame's QA skill (WhiteTowerAI, GitHub, read 2026-10-10;
  the rest of it is an agent harness with nothing for Krator): "build success establishes compilation, not a
  playtest". Krator's verify covers build, logic and the screenshot; the missing kind is interaction. A verify step
  that sends the walker along a route by scripted keys and asserts the end position and an empty console, on the
  shared harness when `full-refactor` merges.
- **[G data]** Layout fingerprints compared with saved goldens, which can prove a refactor changed nothing in
  the world. Refuse an empty fingerprint. Taken over the export, the same fingerprint can check that the Godot
  import placed what three.js built.
- **[web]** Fail on WebGL and shader errors in the console.
- **[web]** Voth: set `_ready`, and replace the fixed sleeps with "N frames since ready".
- **[web]** `tools/test-all.py -j N`, running the `core/**/test-*.js` unit tests first; `build.py --check`
  for a stale `dist/`.
- **[web]** One shared `tools/harness.py` instead of 25 copies inside the `verify.py` files.
