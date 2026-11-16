# Modularity plan: move shared code off kits and settlements onto core

Part of the kits/settlement rebuild (ROADMAP.md stage 3 and section 10). Written 2026-10-26 from a scan of every
`build.py` (`tools/` has no script for it yet; step 0 adds one). Numbers are path references in build.py files, so
they show what a build *reads*, not what it calls at run time. Check each item against the fragment before moving it.

## Status 2026-10-27: what the biome rebuild changes

`claude/biome-rebuild` (worktree `krator-biome-rebuild`, unpushed; main merged in, 500 commits ahead at 650f48475) holds
work this plan depends on. `tools/dep_graph.py` on it: 86 modules, 957 edges (main: 76, 826), three edges not in the
allow-list (step 5 and step 0 below). What it means for the steps:

- **The shared sky is built there:** `core/atmos/sky/` (model, presets, shader) and
  `core/atmos/host/89-atmos-h-skyhost.js` / `89-atmos-i-skybiome.js` (`ATMOS.sky`, `ATMOS.skyBiome`), with every biome
  kit and station on it. Its plan (`core/atmos/SKY-PLAN.md` section 9) covers the painted domes (done) and Voth's
  `21-sky.js` lineage ("later") but not Iziz's `81-sky.js` (`KratorSky`). Step 1 no longer waits for it (revised
  2026-11-02: the kits' sky is a placeholder, moved into `core/atmos/placeholder`; step 1 below). When the branch lands,
  check that its `core/atmos/sky/` and this repo's `core/atmos/placeholder/` sit side by side, and that no kit on it
  re-vendors `81-sky.js`.
- **Three ride-alongs are done there** (9e86c8dad, "Stage 0 of the biome rebuild"): the probe points, the probe's broad
  phase and the camera's pointer-capture guard. Their `TODO.md` entries come out when the branch lands.
- **"kit" is taken.** The rebuild calls `core/biome` 20/34/35 (LOD, impostors, animation) its "kit" workstream, and a
  worktree `krator-core-kit` (`claude/core-kit`) exists. Step 2's module is renamed `core/engine` to keep them apart.
- **New modules on the branch:** biomes abyssal-savannah, catch, cut, farside, godthrone, k-guilin, nwouterwall,
  swhighlands; `settlements/span`; `core/hazard` and `core/camp`. The new biomes read only biomes and kits (allowed),
  so the biomes stay the model to copy.

## Goal

A change to a kit or a settlement touches that build only. Anything two or more builds read lives in `core/`, with
a test and a README, and builds take it by path (never a vendored copy). Dependencies run one way:

    settlements  ->  kits / biomes  ->  core

No kit reads a settlement. No core module reads a kit or settlement (`tools/check_insulation.py` already guards
`host/`; extend it).

## What the scan found

1. **The standard sky is the biggest single leak.** `81-sky.js` (`KratorSky`) lives in `settlements/iziz/src` and
   is vendored or read in place by about 14 kits (scyvoi, islanders, eternian, lizardmen, zeijani, desert-nomads,
   ash-nomads, resources, catalog, interiors, fauna, motor-vehicles, mechs, plus the `--vendor-check` drift
   reports; 16 with `kits/yeti` by 2026-10-27). That one file is why 26 builds point at `settlements/iziz`. On main,
   `core/atmos` has the skylight, water waves and cloud deck but no sky dome; the biome rebuild adds one (Status, above).
2. **Kits read other kits' engines.** The Scyvoi engine (`10-core`, `26k-kit`, `27-mat`, `30-geo`, `36-def`,
   `90-scene`, `92-world`, `93-anim`, `99-host-take`) is read in place by five kits and vendored (forked) into
   Islanders. Eight kits depend on `kits/scyvoi` and `kits/islanders` is itself depended on by crops, resources,
   eternian and lizardmen. A fix to the engine reaches all of them.
3. **`kits/catalog` is the other hub** (30 dependents) and its registries live in `settlements/voth/catalog`, so
   the catalog depends on a settlement and a settlement on the catalog (`kits/catalog <-> settlements/voth`).
   *Corrected 2026-11-03 (step 3): there is no knot in code. The catalog's registries are in the kit; Voth's own
   registries are in Voth; the kit -> Voth edge was the scanner reading a comment in `kits/catalog/build.py`.*
4. **Settlement-to-settlement chains.** Ancients -> Iziz -> Highlands -> Xanadu / Reed Lake / Ys / Mungo (Locus) /
   Verge, held together by vendored fragments (`70-vern-dwellings`, `88y-iziz-matlib`, `81-glow` from Locus,
   `70-biome-nhighlands` from Highlands). TODO.md already records the re-vendor sessions this costs.
5. **Biomes are already clean.** The 25 biome kits take the same 10 to 14 core modules and almost nothing else
   (`hyperjungle`, `necanyons`, `nsemiarid` are the only cross-biome reads). The biome kits are the model to copy.
6. **Backwards edges to fix:** `kits/beast-riders -> settlements/isle-demo`, `kits/ringsea -> settlements/reedlake`,
   `kits/post-apoc <-> core/sockets`, `core/materials -> biomes/sedesert, kits/ancients, kits/ringsea` (the
   vendored-drift notes in `core/README.md`), `biomes/ringisles` and `biomes/dambasins -> settlements/*`.
   **Added 2026-11-09 (allow-listed, to fix):** `kits/construction -> settlements/isle-demo, settlements/iziz,
   settlements/xanadu`. The Construction kit's sheet draws three cultures' houses going up, and the only sealed bundles of
   the Islanders kit and the Iziz Vernacular (ISK, IZV) and the kit-piece flattener (`isleFlatten`) live in the isle demo
   (`bundles.py`, `src/58-isle-protos.js`), IZV takes Iziz's `88y-iziz-matlib.js`, and the Iziz and Xanadu texture packs are
   still the settlements' `tex/`. The fix: `isleFlatten` to core/city beside `constructMesh`, the ISK and IZV seals to
   `kits/islanders` and `kits/iziz-vernacular`, the packs to the kits (`kits/construction/KNOWN_ISSUES.md`).

## Plan, in order (each step is its own commit and leaves every hash baseline unchanged unless stated)

**Step 0: make the problem measurable (small).**
- Add `tools/dep_graph.py` (the scan used for this plan, plus fragment-level reads from `build.py` lists) that
  writes `DEPS.json` and fails `test_all.py` when a *new* backwards edge appears (kit -> settlement, core -> kit
  or settlement, biome -> settlement). Start with the current list as an allow-list so nothing breaks; each step
  below removes entries from it.
- Done when: `DEPS.json` is checked in and the allow-list is the only way a backwards edge can exist.
  **Done 2026-10-26** (1a5f9402d, b5c7f5084 on main).
- **Follow-up (found 2026-10-27):** the scanner counts a path in a comment. On the rebuild branch it reports
  `kits/ancients -> settlements/span` from the text `settlements/span PLAN.md SP2` in a comment in
  `kits/ancients/build.py`; the kit does not read Span. It also misses the paths a build composes in code
  (`for d in ('rand', 'tags'): os.path.join(ROOT, 'core', d)`), seeing them only when a comment happens to list them.
  Stripping comments (`check_core_use.code_only()`, tried 2026-11-03 and reverted) fell from 826 edges to 540 and lost real ones.
  **Done 2026-11-03: the graph comes from what each build loads.** Every `build*.py` (78 of them) imports
  `tools/build_sources.py` and supports `--list-sources`: it prints every repo file the build reads (the fragments it
  resolves, the Python it imports, a delegated build.py, and with `\tvendored` the upstreams its `--vendor-check`
  compares), and exits before its first write. An audit hook records the reads, and refuses a write or a subprocess,
  so a list can not build anything. `report()` runs the build's own `vendor_check` to find the upstreams, `variants()` runs
  biomes/throne's and biomes/korona's `--station` pages, and per-target builds (Iziz, Ancients, the Ancients-lineage
  settlements) report the union of their targets. A read made by another module's helper (a bundle, `isle-demo/bundles.py
  kcity_bundle`) counts as the build's. `tools/dep_graph.py` runs the lists (about 7 s, in parallel) and falls back to the
  text scan only for a build without `--list-sources` (none today; `DEPS.json` "listed" / "scanned" says which).
  `DEPS.json` "vendored" names the 45 edges that exist only through a vendored copy.
  Result against the 826-edge `DEPS.json`: 873 edges, 87 lost, 134 gained. Each lost edge, by kind:
  - comments (67): `core/furnish` in 20 biome kits ("the way the core/furnish builds take them"), `core/edits` and
    `core/space` in 11 and 7 settlements ("Not core/edits", "less core/space"), `core/water` in 6 biomes ("core/water
    draws here in a later phase"), the Scyvoi-lineage notes ("Forked from kits/scyvoi, as kits/eternian and kits/islanders
    were", "as kits/islanders reads kits/resources", "vendored from kits/scyvoi") in yeti, eternian, crops, resources,
    lizardmen and zeijani, `settlements/girder` and `mavs-refuge -> kits/beast-riders`
    ("for kits/beast-riders" beside `PORTS_DIR`), `settlements/iziz -> kits/pylon, kits/talia` (the `--kit` comment),
    `settlements/iziz` in Screamers, `biomes/ringisles -> openworld/isle-demo, settlements/isle-demo`, `biomes/dambasins
    -> settlements/hook, biomes/nsemiarid`, `biomes/nsemiarid -> biomes/scablands`, `settlements/highlands -> biomes/geyser`,
    `settlements/longsong -> biomes/sedesert`, `kits/beast-riders ->
    settlements/isle-demo`, `kits/catalog -> settlements/voth`, `openworld/isle-demo -> openworld/little-demo`.
  - an empty opt-in list (16): `CORE_T` names core/terrain in 16 biome kits whose `CORE_TERRAIN` is `[]`.
  - code that loads nothing (4): Reedlake's `UPSTREAM` keeps `kits/ancients` and `settlements/iziz` entries its
    `vendor_check` never uses (it compares Highlands only); `core/materials/demo`'s `find_three()` takes the first
    `three.min.js` it finds (Ring Sea's), so its `kits/ancients` and `biomes/sedesert` candidates are never read.
  None of the three named as lost by the code_only() try is lost the way it looked: `kits/eternian -> kits/scyvoi` is
  composed code (`os.path.join(ROOT, 'kits', 'scyvoi', 'src', f)` for its vendored engine), now a "vendored" edge;
  Iziz's `--kit` and Girder's `PORTS_DIR` mentions are comments, and the reads run the other way: `kits/pylon` and
  `kits/talia -> settlements/iziz` (their build hands over to Iziz's) and `kits/beast-riders -> settlements/girder,
  settlements/mavs-refuge` (`towns.py` seals both towns' `src/` into the kit's page).
  The gains are the composed and delegated reads: Dhelv's 11 core modules, the biome-to-biome reads (Korona's six, the
  Ring Isles' five, the Throne's Hyperjungle, Little Demo's two kits), the Throne's stations' `core/water`, Pylon's and
  Talia's whole Iziz page, the towns sealed by `towns.py` (Beast Riders, the isle demo, Pinnacle Rock), Voth's
  `foreign.py` (Dalab, Jimjam, Ys, the Ring Sea), Mechs' `vehicles-core.js`, `core/clock` and `core/minimap` from the
  host shell lists, and the core modules the scablands overlay takes through N Semiarid's `build()`.
  Allow-list: seven lines deleted (the comment-only and never-read edges above); two added, `kits/beast-riders ->
  settlements/girder` and `-> settlements/mavs-refuge`, real reads the scan never saw (step 5).
  Found on the way: `settlements/pinnacle-rock`, `settlements/longsong` and `openworld/little-demo` name
  `openworld/little-demo/src/41-world-fields.js`, which moved to `core/world/` (d848c157), so they
  do not build; their lists report the path they name. `settlements/yuni/build_fragments.py` fails its own build rules.
  (Fixed by the session `claude/great-hopper-7f0rbq`: both read the fields from the isle demo, little-demo is archived,
  `build_fragments.py` is gone; merged into this branch 2026-11-03.)
  **Merged 2026-11-03 onto steps 1 to 5:** 917 edges, every one of the 76 builds listed (none scanned); the allow-list
  is the four real backwards reads left (step 5). The step 5 scanner rule (backwards edges only from code) is gone with
  the text scan; `KIT_FOLDERS` (the Ancient Port kit is a kit) stays, and `THIRD_PARTY` drops reads of a pinned
  `three.min.js` (all 19 tracked copies are the same bytes), which `tools/harness.py` `local_three` serves core demos
  from `kits/ancients`.

**Step 1: the placeholder sky into core (the 81-sky.js move).** **Done 2026-11-02** for the kits and Iziz.
- Revised 2026-11-02 (owner): a kit's sky is a placeholder. A kit's pieces go into the open world at a site, and that
  site's sky lights them there; no kit bundle carries the sky (checked: the vehicle, mech, fauna, interiors and furniture
  bundles). So the kits do not need the shared sky. What step 1 fixes is the dependency, not the look: `81-sky.js` lived
  in `settlements/iziz/src`, 13 kits vendored it and one read it in place, so every kit pointed at a settlement and every
  copy was a `--vendor-check` line that could drift.
- The move: `81-sky.js` (`KratorSky`) and the `h3()` it reads (`80-sky-hash.js`, from `kits/catalog/src`) went
  **unchanged** to `core/atmos/placeholder/`, with `placeholder.py` (the file list and paths, as `core/host/host.py`) and a
  README. Every kit and Iziz read them by path; their `src/` copies (19 files) and `VENDORED` entries are gone. The names
  keep their place in each build's filename order, so no byte moved: every page, sidecar and build manifest of the 17
  builds (76 files, Pylon and Talia through Iziz) and of Noah's Regret, and the five kit bundles, came out identical
  to the build before the move. No all-builds rebuild, so no ride-alongs went with it (they wait for the next one).
- Taken: kits ash-nomads, catalog, desert-nomads, eternian, fauna, interiors, islanders, lizardmen, mechs, motor-vehicles,
  resources, scyvoi, yeti, zeijani; `settlements/iziz` (Pylon, Talia); `settlements/noahs-regret` (it has the kits'
  `sources()`, so it came along).
- Guard rails: `tools/check_core_use.py` has a `sky-copy` rule (a `KratorSky` declared in a build's own files); the
  README table has a row for it; a kit's `--vendor-check` reports a `src/` copy as a shadow.
- **Left for step 4** (baselined as `sky-copy` findings): Dalab, Jimjam, Xanadu and Ys keep their copies, and their
  `--vendor-check` now compares them with `core/atmos/placeholder` (all identical); Highlands' Roketstad has its own fork
  (`targets/roketstad/81-rk-sky.js`). Each reads the core file by path when its chain is ported.
- The kits keep the placeholder (owner, 2026-11-03): they do not move onto `ATMOS.skyBiome` when the biome rebuild lands.
- Done: no kit's `build.py` names `settlements/iziz` except Pylon and Talia (the `--kit` contract). `DEPS.json`: 826 ->
  821 edges; the allow-list's backwards edges 27 -> 13.

**Step 2: `core/engine` (the Scyvoi engine).** **Done 2026-11-03** for the kits that vendored it (2a: 85d5bda3; 2b).
- 2a moved the engine (`10-core`, `27-mat`, `30-geo`, `36-def`, `90-scene`, `91f-furnish`, `91n-night`, `92-world`,
  `93-anim`, `99-host-take`, `99-tail.html`) unchanged from `kits/scyvoi/src` to `core/engine/` (`engine.py`, the file list;
  README). Scyvoi, Ash and Desert Nomads, Eternian, Islanders, Lizardmen, Yeti and Resources read it by path; 56 identical
  copies went. No byte moved (29 outputs of nine builds identical to the build before).
- 2b decided the drift by reading it. It was one feature added to each fork: per-building alternative materials
  (`MAT_ALT`, a table `MAT_VAR` per kit: the nomads, Islanders, Lizardmen, Noah's Regret), the Islanders' alternative gable
  sheets (`GABLE_ALT`), the Islanders' windows and door heights in the records, and `walk: KWALK` for the host. All of it
  is in `core/engine` now with empty tables; each kit fills its own in `src/31-alt-takes.js`; 11 drifted copies went
  (Noah's Regret's `30-geo.js` among them). Proof: `core/engine/fingerprint.py` (the registry's records, every drawn
  object's material key, world matrix and vertex data, the clock pinned) is the same on all nine pages before and after,
  and it does see a change (emptying the Islanders' table moves 10 materials' triangle counts).
- Changes that are not in the fingerprint: every kit's records now carry `doors` and `windows` (Islanders' already did);
  `door()` keeps a height; the host gets `KWALK` on every page that takes `core/walk`, so Eternian's and Yeti's walkers
  now collide with their buildings (the step's ride-along, half done: Scyvoi, the nomads and Resources do not take
  `core/walk`). `verify.py --assert`: Eternian and Scyvoi pass; Yeti fails only `tags-vocabulary` (`khaayken`, its
  KNOWN_ISSUES.md; it fails the same before).
- **Not yet on it:** `kits/zeijani` (its own fork: most files differ; its `92-camera.js`, the controls' reference, was retired
  for core/host on 2026-10-18, `kits/zeijani/README.md` "The engine", status 2026-11-09) and
  `settlements/noahs-regret` (its own fork of everything but `30-geo.js`). Each is a port with its own fingerprint.
- **Open, the owner's:** `core/engine/10-core.js` writes its own mulberry32, a `Math.sin` hash and a value noise (the
  check no longer counts them: it reads builds, not core; 18 baseline entries moved with the file). Yeti's `10-core.js`
  is the engine's on `core/rand` (the same stream, KRAND's portable hash and noise) and stays a Yeti override; taking it
  upstream changes every kit's draws and so every building ("moving rubble", GODOT-PLAN.md section 7), with screenshots.
- The isle demo's Islanders bundle (`settlements/isle-demo/bundles.py`) takes the engine from `core/engine`; its text
  changes in path labels and the order of the alternative tables, not in code. Its pages were already behind their
  sources (the isle demo does not build whole in a checkout without Girder's textures) and wait for the all-builds rebuild.

The plan as written before the step:
- Promote the engine fragments Scyvoi, Islanders, Eternian, Lizardmen, Zeijani, the nomad kits and Resources share
  into `core/engine/`: scene, world, animation, host-take, material and geometry helpers. Kits keep their own
  definitions (`36-def`, the culture files, tents, buildings) and only read the engine from core.
- Do it one kit at a time, Scyvoi first (its pages are the reference), and prove each with the hash baseline;
  expect to find drift between the Islanders fork and upstream, and decide each diff by reading it (as the
  Ancients re-vendor session did), not by overwriting.
- Done when: `kits/*` list `core/engine` and no kit lists another kit's `src/` for engine code.

**Step 3: break the catalog <-> Voth knot.** **Done 2026-11-03: there was no knot in code; the core/catalog split done too.**
- Checked in code, not comments (`check_core_use.code_only` over every `kits/catalog/*.py`; the JS files' `settlements/`
  strings are `source:` provenance fields and comments): `kits/catalog` reads no settlement. Its registries are its own
  top-level files (one per culture, plus `krator-master-buildings-voth.js`, Voth's first-generation buildings, a culture
  file). `settlements/voth/catalog/registry/` holds Voth's own building registries, read by Voth. Voth's sheet
  (`settlements/voth/catalog/index.html`) and `settlements/voth/build.py` read the kit: the allowed direction. The edge
  was two comments in `kits/catalog/build.py` that say so; reworded, the allow-list line is gone (13 -> 12 backwards
  edges), and `kits/catalog` reads only `core/atmos` and `core/sockets`.
- **The split, done 2026-11-03 (owner: "agree with your step 3 proposal"; 945e2dae).** The engine
  (`krator-furniture-core.js`, `krator-asset-engine.js`, `krator-furniture-kit.js`, `-runtime.js`, `-detail.js`, `inspector.js`)
  moved unchanged to `core/catalog/`, with `catalog.py` (a catalog name -> its file: the engine there, a culture file in
  the kit), `files.json` and `catalog-files.js` (the same lookup for node tools). Every reader resolves names through it:
  the catalog's build, bundle, verify and segment test, fauna, mechs, motor-vehicles, interiors and Ancients Interiors
  (their runtime script tags; their `verify.py` serve the repo root), Beast Riders, Voth (its build, its static catalog
  sheet), the isle demo, Pinnacle Rock, `core/tags`' test, the texture audit.
- Proof against a build of every reader before the move: catalog, fauna and the interiors cores identical, every other
  page different only in path labels and script tags; the interiors pages, their sets sheet and Ancients Interiors pass
  `verify.py --assert` from the repo root; Voth's catalog sheet loads with no 404. Committed: the pages that were current
  (interiors, interiors-sets, ancients-interiors, motor-vehicles and its bundle, voth-site) with their baseline entries.
  The stale ones (beast-riders, interiors-walk, mechs, voth-city) are self-contained, keep working, and take the new
  labels at the all-builds rebuild (`TODO.md`, "Ride along").
- `core/tags` -> `kits/catalog` (below, step 5) went with it: the vocabulary's source is `core/catalog/krator-furniture-core.js`,
  so the copy and its check are core -> core.
- Found on the way: `core/tags/52-core-tags-vocab.js` copies the catalog's vocabulary and `core/tags/test-tags.js` checked it
  against the kit (core -> kit, not in `DEPS.json`, which reads only build.py). Fixed by the split.
- The culture symbols ride-along, done (3d39ba47): `kits/catalog/krator-symbols.js` (a copy of `core/sockets/38-symbols.js`,
  behind it: no Order scroll, Xanadu's wheel for its lotus) is gone, and the name resolves to `core/sockets`. A content change
  on purpose; the three pages that load it at run time are committed and pass their gates, the bundled ones take it at the
  all-builds rebuild.

The plan as written before the step:
- Move the catalog registries and the Voth-building sheet loader so the dependency is `settlements/voth ->
  kits/catalog` only. `kits/catalog/build.py` stops naming `settlements/voth/catalog`; Voth's catalog sheet reads
  the kit's output file instead.
- Split what `kits/catalog` offers into a data side (`core/catalog`: the SPEC shape, registries, asset engine)
  and the culture files (stay in the kit), the same split `core/furnish` made for placement.
- Done when: `kits/catalog` has no `settlements/*` edge.

**Step 4: the culture kits out of the settlement folders.** Rewritten 2026-11-03 (owner): the settlements will be rebuilt
on the open world, an involved process of its own, so this step does not port a settlement's layout, sites or page. It
lifts out what the open-world rebuild will need, the culture building kits that live inside settlement folders, and
leaves each settlement folder as its layout and page, building as it does today until the open world replaces it.
- **What moves:** a culture's building code (its materials, helpers, defs and builders: most of a settlement's 60-89
  fragments: Iziz 47 of 79, Highlands 32 of 50, Xanadu 38 of 55, Locus 43 of 66) to `kits/<culture>/`, and the shared
  infrastructure among them to `core/` (the material library bindings, `88y-*-matlib`, to `core/materials`; Locus's
  `81-glow` to `core/atmos`). Settlements, and the kits built on them, read the kit by path.
- **What stays:** each settlement's site, layout, targets, sheet rows and host fragments. No work on them here:
  no `core/city` port, no layout pass.
- **How:** the files move unchanged and keep their names, so every page keeps its filename order and rebuilds
  byte-identical (the engine and catalog moves' proof). A copy a settlement vendors is checked against the kit from then
  on; reading the kit in place instead is the settlement's own port, with the open world.
- **Order, down the chain:** (1) the **Iziz Vernacular** -> `kits/iziz-vernacular` (the most dependents: Iziz, Pylon and
  Talia on its page, Verge and the isle demo bundling it, Highlands, Xanadu, Reed Lake, Dalab and Ys vendoring its
  materials and helpers). Not `kits/ancients`, as this step first said: Pylon and Talia are written on the Vernacular's
  contract (`settlements/iziz/VASSAL-KITS.md`), which sits on the Ancients core but is Iziz's culture. The kit also holds
  the one Vernacular bundle list the contract asks for (Verge's and the isle demo's copies have drifted). (2) Highlands'
  Republican, Rustic and Tribal sets. (3) Xanadu's Sultanate set. (4) Locus's Eastern Abyssal set. (5) The rest as they
  come up. `70-biome-nhighlands` -> `biomes/nhighlands` (already there; Highlands takes it from the biome).
- **(1) The Iziz Vernacular, done 2026-11-03:** its 17 fragments (`69b`-`69f`, `70`-`74z`) moved unchanged to
  `kits/iziz-vernacular/src` (`vernacular.py`, the file list; README; `PORT.md` with Iziz's tags). Iziz reads them in place
  (Pylon and Talia through its page), Verge's and the isle demo's `IZV` bundles and the isle demo's size reader take them
  from the kit, and Highlands', Dalab's and Ys's `--vendor-check` compares their copies with it (Highlands identical; Dalab's
  and Ys's drift as it did against Iziz). Proof: Iziz's seven pages, Pylon's and Talia's, 32 outputs in all, byte-identical
  to the build before; Verge's page and both `IZV` bundles differ only in the moved files' path labels. Next for the kit:
  ~~a `build.py` of its own~~ (done 2026-11-09 on a core shell, see the kits' own sheets under (4b)), and `88y-iziz-matlib` with the matlib item.
  **One bundle list, done 2026-11-03:** `vernacular.py bundle_files()` (the Ancients core from `kits/ancients` and
  `core/materials`, the foundation, every building fragment); Verge and the isle demo take it, plus the funicular and `88y`
  respectively. The isle demo's bundle changes only in nine core labels; Verge's gains the five building fragments it lacked
  (`71a`-`c`, `73b`, `73c`: definitions only, it places none of them), and `verify.py --assert` reads the same before and
  after (every check; the camera's 483 calls and 8 rooms planned on a rerun of both pages: the first run of the old page
  had caught the interiors queue one room further on).
  The kit's trades table (`74z`) names two buildings of Iziz's foreign quarter (the Voth embassy, the Order's chapterhouse:
  Iziz's `75-port-embassy.js`, `76-port-chapterhouse.js`, which Dalab and Ys vendor too), so `tools/check_trades.py --all` looks
  their keys up in Iziz's `src/` (`EXTRA_SRC`) until those foreign-quarter sets have a kit of their own.
  Then (2), Highlands' sets.
- **(2) Highlands' sets, done 2026-11-03:** the 29 fragments (the foundation `70`-`73b`, `88`, `89`, `89y`, `94`; Republican `74`-`79f`;
  Rustic `80`-`81b`; Tribal `84`-`85b`) moved unchanged to `kits/highlands/src`, one kit with the three sets named in
  `highlands.py` (`SETS`, `culture_files()`), since all three stand on one foundation. Highlands reads it in place (its sheet
  and Roketstad); Reed Lake's, Dalab's and Ys's `--vendor-check` compares their copies with it (Reed Lake identical but its
  adapted `73-hl-carve`; Dalab and Ys drift as before). Highlands' nine outputs byte-identical to the build before;
  `HL_TRADES` passes as the kit's. Next: (3) Xanadu.
- **(3) Xanadu, done 2026-11-03:** the 23 fragments (foundation `70`-`72`, `88`, `89`; buildings `74`-`87c`) and `kit_bundle.py`
  moved unchanged to `kits/xanadu`; the bundle takes the Ancients core from `kits/ancients` and `69b`/`69c` from the Vernacular kit
  (Xanadu's copies were byte-identical), so it reads no settlement. Xanadu reads the kit in place; Longsong takes `XAK` from
  the kit (its 39 files the same; only path labels and the header's path change). Xanadu's six outputs byte-identical;
  `XA_TRADES` passes as the kit's. Left with the matlib item: Xanadu's texture pack, which Longsong also reads. Next: (4) Locus.
- **(4) Locus's two kits, done 2026-11-03:** the Locus kit (`64-locus-*`, 8 files) to `kits/locus` and the Eastern Abyssal kit
  (`65-abyss-*`, 10 files) to `kits/eastern-abyssal`, each with its NOTES and KNOWN_ISSUES (Locus's `LOCUS-KIT-*` and
  `ABYSS-KIT-*`). Locus reads them in place, Mungo by name (its fork of the Locus engine), Verge in `YKIT`. Locus's four pages
  and Mungo's page byte-identical; Verge's differs only in the kits' path labels; Mungo's manifest records the files' new
  origin. Locus's census (`LO_TRADES`) names the kits' buildings, so `tools/check_trades.py` looks there for it.
- **(4b) The Yuni kit, done 2026-11-03; the Yuni engine stays where it is.** The survey (Locus's engine files against Yuni's,
  Mungo's, Girder's, Mav's Refuge's and Voth's library) found two things this step's first wording missed:
  - **The buildings' upstream is Yuni, not Locus.** Yuni's `55`-`59c` are the newer copies: since Locus forked them, Yuni gave
    its buildings tagged doors and openings and interior masses (`F.door`, `F.opening`, `F.mass`, on Yuni's `51-fixtures.js` and
    `53-assets.js`) and fixed the mat rack. So Yuni's eight files moved unchanged to `kits/yuni/src` (`yunikit.py`, README,
    `PORT.md` with Yuni's tags) and Yuni reads them in place: its five outputs (the city, the sheet, the plants, the texture
    sidecar, the manifest) byte-identical to the build before. Locus's copies stay Locus's, checked against the kit
    (`build.py --vendor-check`: `56`, `57`, `58`, `59`, `59c` drift, recorded in Locus's `KNOWN_ISSUES.md`); Mungo and Verge's
    `YKIT` read Locus's copies as before, so their pages do not move. Yuni's census (`YU_TRADES`) looks its keys up in the kit
    (`tools/check_trades.py` `EXTRA_SRC`).
  - **There is no one Yuni engine to extract.** Every world in the lineage forked it: Locus's `10-core.js` opens "LOCUS (forked
    from Yuni's core)", 98 lines of the lineage's own PRNG, noise and geometry helpers followed by Locus's world (the hill, the
    river and delta, the canal), and `50-structure.js` holds each world's massing (Yuni's butte and wall, Locus's bridges).
    Against Locus, Yuni's copies of `05`, `10`, `20`, `45`, `47`, `50` and `53` differ by 110 to 330 lines each, Girder's and
    Mav's Refuge's by 150 to 400, Voth's library's by 300 to 840. Unlike the Scyvoi engine (one engine, small drift), a shared
    copy would have to be a new engine merged from six forks, and its PRNG and noise are what core already gives
    (`core/rand`, `core/noise`); Yuni keeps them only by the owner's exception (GODOT-PLAN.md, Phase 2 item 1). So no
    `core/yuni-engine`: the lineage converges by porting each world onto core (rand, noise, tags, catalog, host) as it is
    rebuilt on the open world, and the buildings, which are the reusable part, are a kit already.
  - **Locus takes the kit, done 2026-11-03** (owner): not by taking Yuni's frame (its fixtures registry, door script and
    interiors planner would re-fork the engine into Locus) but by giving Locus's frame the three calls the kit makes that it
    lacked (`F.opening` registers a door point as `F.door` does, `F.mass` draws nothing, `F.doorIds` kept in step). Locus reads
    `kits/yuni` in place; Mungo and Verge's `YKIT` with it. The pages move by what Yuni changed in the buildings (the poor
    shack's frame and height, the mat rack). Their working doors come with core/door's pass.
  - Left:
    Verge's `YKIT` reading Locus's world core (`10-core`, `50-structure`), which goes when Verge is rebuilt on the open world.
  - **The three kits' own sheets, done 2026-11-09:** `kits/yuni/dist/yuni.html`, `kits/locus/dist/locus.html` and
    `kits/eastern-abyssal/dist/eastern-abyssal.html`, each with its `build.py` and `verify.py --assert` (every asset and variant
    builds and is registered, the core/tags vocabulary, the doors as KDOOR records, the library textures, the engine read in
    place). The split: the engine is read in place from the world whose fork the kit was written on (Yuni's `settlements/yuni/src`
    for kits/yuni; Locus's `settlements/locus/src`, with its `66-locus-furnish` and `95-locus-doors`, for the other two), never
    copied; the page shell is core's (core/host, core/walk, core/door, core/atmos/placeholder, core/tags, core/rand,
    core/materials/record, core/furnish on Locus's fork); the sheet's own layout, labels, emit and take are one shell for the three,
    `kits/yuni/targets/sheet` (`kits/yuni/sheetbuild.py`, `sheetverify.py`). The library packs are the towns' (their palettes own
    the families), read in place. Where it is not clean (each kit's README, "Its own sheet"): Yuni's `50-structure.js` reads
    `BRIDGES` at load (the sheet gives the empty list); Yuni's doors are bound in the city's `76-doors.js` with its interiors
    planner, so the shell binds them itself and the Yuni sheet has no interiors; Locus's fork registers buildings with no types
    (the sheet copies the assets'), and the kits' cultures `abyssal-desert` and `geomancer` are not in core/tags' vocabulary (an
    owner's decision, KNOWN_ISSUES.md). The towns' sheet targets (`yuni-assets.html`, `locus-kit.html`, `abyss-kit.html`) still
    build, and Yuni's, Locus's, Mungo's and Verge's 30 outputs are byte-identical to the build before. The reads of the engine in place are the
    three backwards edges `tools/dep_allowlist.json` lists for this step (`kits/yuni -> settlements/yuni`, `kits/locus` and
    `kits/eastern-abyssal -> settlements/locus`); they go when the engine has a home outside the towns.
  - **The Vernacular-contract kits' own sheets, done 2026-11-09:** `kits/iziz-vernacular/dist/iziz-vernacular.html`,
    `kits/highlands/dist/highlands.html` and `kits/xanadu/dist/xanadu.html`, each with its `build.py` (`tools/build_sources.py`
    `report()`; `python3 tools/build.py kits/<kit>`) and `verify.py --assert` on `tools/harness.py` (every def placed, built and
    registered, no empty volume, no NaN, the core/tags vocabulary, the doors as KDOOR records with core/walk blocks, the kit's
    library pack, the Voth census: the Vernacular's table in the page, Highlands' and Xanadu's through `tools/check_trades.py`).
    One sheet for the three, `kits/iziz-vernacular/sheet.py` and `sheet_verify.py`: the shell in `src/*-vsheet-*`, the Ancients
    core read in place from `kits/ancients/src`, core/rand, core/tags, core/walk, core/door (and its host), core/host,
    core/atmos/placeholder, core/materials; each kit's rows, library bind and tags in its `targets/sheet/`, its own pack
    (`materials.json` -> `tex/`). No settlement is read. The bodies are solid and every door locked; a `?interiors=1` mode goes in
    each kit's `targets/sheet/` when the kits' interiors land (the hook is there: KDOOR records, core/walk, core/door's host,
    `KDOOR.clearDoorways`; the `doors` assert then relaxes to "locked unless a room is behind it"). The settlements' own sheet
    targets (Iziz's `vernacular`, Highlands' `highlands`, Xanadu's `xanadu`) stay. All six kit sheets (with Yuni's, Locus's and
    the Eastern Abyssal's) pass `--assert` headless on SwiftShader and `tools/check_core_use.py`. The settlements read none of the
    sheets' files (their `build-inputs.json`; Verge, which lists the Vernacular's `src/`, rebuilds byte-identical with the
    `*-vsheet-*` files moved away). Their pages do differ from `PORT-BASELINE.json`, from core changes merged since the
    baseline (core/door, core/furnish, core/host's probe, the Vernacular's `69e5`, the biome packs), not from this step: the
    baseline waits for the all-builds rebuild.
- Keep out of `core/city/` and Voth's layout fragments (`15`, `30` to `35`); the city-layout work owns those.
- Done when: no settlement holds another culture's building code, and the settlement -> settlement edges in `DEPS.json`
  are only content links (lore, the isle demo's two towns).

**Step 5: fix the remaining backwards edges.** **Done 2026-11-03:** the allow-list is down to four real reads (12 -> 4):
Pylon and Talia -> Iziz, and Beast Riders -> Girder and Mav's Refuge (below).
- **The scanner:** the graph comes from what each build reads (step 0's follow-up, merged in). Before that landed,
  step 5 counted a backwards edge only from code; with real reads the rule is not needed. Five entries were
  a docstring or comment citing another build: Dam Basins -> Hook ("adapted from settlements/hook/build.py"), Ring Isles ->
  both isle demos (their PLAN.md and build.py named as models), Beast Riders -> the isle demo (a note on how it bundles the kit).
- **The Ancient Port kit is a kit:** `settlements/port` was classed as one (`KIT_FOLDERS`; CLAUDE.md "a kit, not a settlement"),
  so Dam Basins reading it is a biome reading a kit. **Moved to `kits/port` 2026-11-03** (owner): the folder, the baseline's
  32 keys, `geometry.json`, the core-use baseline, Hook's, Ys's and Dam Basins' paths, the gallery's sources (its page ids
  are unchanged) and the docs; `KIT_FOLDERS` is empty.
- **`core/materials` -> Sedesert, Ancients, Ring Sea:** only `core/materials/demo/build.py` looking for a three.js r128; it takes
  the harness's (`tools/harness.py` `local_three`) now. The five copies in the repo are byte-identical, so the page is unchanged.
  (The drift notes in `core/README.md` are about material fragments settlements vendor: step 4, the matlib.)
- **`core/sockets` -> Post-Apoc:** the socket sheet built on Post-Apoc's engine, so it is the kit's now:
  `kits/post-apoc/sockets-example/` (byte-identical page; the baseline, `geometry.json` and `GEOMETRY.md` re-keyed). It still
  does not draw whole (`kits/zeijani/KNOWN_ISSUES.md`: Post-Apoc's geometry calls `KMAT`), as before.
- **Ring Sea -> Reed Lake:** four of the copies (`10-core`, `12-stats`, `30-kit`, `99-tail`) are the Ancients kit's, which
  Reed Lake vendors too; Ring Sea checks them against `kits/ancients` now (kit -> kit). `10-core.js` drifts by upstream's frame
  hook, re-vendored with the all-builds rebuild (`TODO.md`: Voth and the isle demo bundle it). The viewer shell (`00-head`,
  `92-camera`, `93-labels`, `verify.py`, `jscheck.py`, all deliberately drifted) is the kit's own until its host port onto
  `core/host` and the harness (`kits/ringsea/KNOWN_ISSUES.md`), as Scyvoi's was.
- **Beast Riders -> Girder, Mav's Refuge** (found by the listed graph): `kits/beast-riders/towns.py` seals both towns' engines and
  builders (their `src/`) into the kit's page, the faithful port its `KNOWN_ISSUES.md` describes; the towns' fragments it needs
  move to the kit or to core. Open.
- **Pylon and Talia -> Iziz** stay: they build inside Iziz's page by design (`settlements/iziz/VASSAL-KITS.md`), the open
  question below.
- On the biome rebuild only (not on this branch): `core/atmos/demo/build.py` looks for three.js in Ancients and Ring Sea;
  it takes `harness.local_three` when that branch lands, as the materials demo does now.

**Step 6: keep it modular.** **Done 2026-11-03** (the checks; the lists shrink as the work below removes edges).
- `tools/check_core_use.py` already blocks bespoke PRNG, noise, sky and water.
- `tools/dep_graph.py` (a `test_all.py` step) now checks two more lists in `tools/dep_allowlist.json` as it checks the
  backwards edges (a new entry fails, a gone one is reported stale):
  - **`lateral`**, a settlement or open-world region reading another (31 today). What should stay are content links
    (the isle demo's two towns and its region, Longsong's and Pinnacle Rock's neighbours); the code reads go as their
    shared files reach a kit or core (Mungo and Verge -> Locus, Verge -> Iziz, Voth -> Dalab, Jimjam, Ys).
    Added 2026-11-09 (openworld/PLAN-SITES.md):
    - `settlements/isle-demo -> settlements/ys` and `openworld/isle-demo -> settlements/ys`: busy-keller's Nephtos, the
      Hykkousoi colony, reads Ys's free-standing pieces and pack in place (`settlements/isle-demo/bundles.py` HYKB). This
      is a code read, and goes when the Hykkousoi buildings are a kit.
    - `openworld/pinnacle -> settlements/isle-demo`, `-> settlements/girder` and `-> settlements/mavs-refuge`: the first
      site's camps take the Beast Riders' tents through the isle demo's `cat_bundle` and its piece instancer
      (`58-isle-protos.js`), which seal Girder's and Mav's Refuge's towns, as `openworld/isle-demo` does. These are code
      reads, and go when `kits/beast-riders` owns its bundle and the instancer moves to core/world
      (`openworld/pinnacle/KNOWN_ISSUES.md`).
    - `openworld/xanadu-oidong-highrift -> settlements/xanadu` and `-> settlements/isle-demo` (2026-11-10): the
      second region's villages draw the Xanadu building kit with the library pack that is still settlements/xanadu's
      (`kits/xanadu/kit_bundle.py`'s note), and flatten its pieces with the isle demo's `isleFlatten`, as Longsong does
      (both allow-listed for Longsong). These go when `kits/xanadu` owns its pack and the flattener moves to core/world.
    - `openworld/iziz-cluster -> settlements/isle-demo`, `-> settlements/girder`, `-> settlements/mavs-refuge` and
      `-> settlements/iziz` (2026-11-11): the third region's camps take the tents as Pinnacle's do (`cat_bundle`, which seals
      Girder's and Mav's Refuge's towns), and Talia's villages draw the Iziz Vernacular through the isle demo's `izv_bundle`
      (the Vernacular with Iziz's Ancients core) and Iziz's library pack, through the same instancer, as `openworld/isle-demo`
      does. These go when the kits own their bundles and packs and the instancer moves to core/world.
  - **`vendored`**, every module -> upstream pair a build keeps copies of and checks with `--vendor-check` (38 today,
    counting pairs a build also reads, which DEPS.json's "vendored" leaves out). A new copy is an error: read the
    upstream in place, or record here why it must drift. The rule is per pair, not per file (a per-file list would
    run to hundreds of lines and be rewritten by every re-vendor).
  The plan's first wording ("a build may not list another build's `src/`") is the lateral list plus the backwards one:
  a settlement reading a kit or core is the order the plan wants.
- **A copy is checked against its upstream, once** (2026-11-03): Reed Lake and Xanadu compared the Ancients core and the
  Vernacular's `69b`/`69c` with Highlands' copies of them, and Jimjam compared the Ancients core with Iziz's copies as well as
  with `kits/ancients`. Reed Lake and Xanadu now compare each copy with its home (`kits/ancients` and `core/materials`,
  `kits/iziz-vernacular`, Xanadu's sky with `core/atmos/placeholder`) and only the viewer shell (`91`-`93`, Highlands'
  own, its probe adapted on purpose) with Highlands'; Jimjam drops the Iziz comparison. Same verdicts (all identical, Reed
  Lake's `73-hl-carve` adapted); the vendored list trades Jimjam -> Iziz (and its lateral edge) for Reed Lake and Xanadu
  -> `kits/ancients`, `kits/iziz-vernacular`: the same copies, named by their real upstream.
- New kits start from the nearest finished one *and* the `core/engine` engine; they never fork an engine (not checked:
  a fork is copies, which the vendored list catches only when the build checks them).

## Order of work and cost

| Step | Reaches | Risk | Rebuilds |
|---|---|---|---|
| 0 graph check | none | none | none |
| 1 sky | 14 kits + iziz (+ Noah's Regret) | done 2026-11-02 | none (no byte moved) |
| 2 kit engine | 8 kits + Noah's Regret's geometry | done 2026-11-03 | none committed (proof: fingerprints) |
| 2b core/door | Iziz, Pylon, Talia, Verge, isle demo, the building kits | module done 2026-11-03; the kits' pass under way | those builds |
| 3 catalog / Voth | the catalog's build.py comments; then the engine to core/catalog | done 2026-11-03 | the current runtime-loading pages |
| 4 culture kits out of settlements | the Vernacular first, then Highlands, Xanadu, Locus | low per kit (files move unchanged) | none (byte-identical) |
| 5 backwards edges | the scanner, 3 builds' lookups, the sockets sheet's folder | done 2026-11-03 | none (byte-identical) |
| 6 guard rails | CI only | done 2026-11-03 | none |

Run steps 2 to 3 on one branch with one all-builds rebuild (CLAUDE.md "Rebuild what a shared change reaches") and
`python3 tools/port_baseline.py` after each; step 4 waits for the Ancients re-vendor chain to be quiet.

**Found on 2026-11-02: committed pages are behind their sources.** Rebuilding the 17 builds of step 1 *before* the
move gave 20 pages that differ from `PORT-BASELINE.json` (every Scyvoi-engine kit, the catalog, mechs, resources,
interiors-walk, Iziz's seven, Pylon, Talia; the first difference in Scyvoi is the catalog's biome fruit, which has grown
since the pages were built). Step 1 left them as they were (its proof is before-and-after, not against the baseline).
They are the next all-builds rebuild's to commit, with a screenshot check and a baseline rewrite.

## Ride-alongs (parked work that lands with these steps)

Found 2026-10-26 in `TODO.md`, ROADMAP.md stage 3 and GODOT-PLAN.md's hot-spot table. Do each in the step named,
rebuild once, rewrite the baseline once; then take the item out of `TODO.md` in the same commit.

**With the next all-builds rebuild** (they were step 1's; step 1 moved no byte, so it brought no rebuild: the first of
steps 2 and 3 to move pages takes them, with the stale pages above). `TODO.md`, "Ride along with the next all-builds rebuild":
- ~~The probes read a merged mesh's own sample points; a broad phase for `regOccupancy` on `core/space`; guard the
  camera's pointer capture.~~ **Done on the biome rebuild** (9e86c8dad), and in `main`: core/host's probe has the sample points
  and the KSPACE broad phase, its camera the guarded capture; the Iziz palace page's own guard is gone and `TODO.md` has no entries
  for them (checked 2026-11-09).
- ~~The culture symbols: `kits/catalog` reads `core/sockets/38-symbols.js` by path and its copy goes.~~ Done in step 3
  (3d39ba47); the bundled pages take the new symbols in the rebuild (`TODO.md`'s first ride-along).
- ~~`core/hamlet/20-hamlet-cultures.js`: reword the `xanadu` row's comment (the kit has pens, corral and dairy now).~~ Done (9445d626).
- ROADMAP.md stage 3, "the sky preset moves to `core/atmos`": the kits' half is step 1 (done, as a placeholder); the
  settlements' half is SKY-PLAN's S5 and step 4.

**Step 2b (new): `core/door`, opening doors as a core module, beside `core/walk`.** **Module done 2026-11-03** (owner:
"implement real glass" with it): `core/door` is `KDOOR` (records by stable id, open/close/toggle/nearest, the swing, walk
blocks, save deltas, export), `KGLASS` (the glass kinds as data and one material each) and `KDOORHOST` (posing, tick, the E
key); `node core/door/test-door.js`. The Vernacular's `IZDOOR` draws on it: Iziz's city page has the same 1875 doors, 6394
walk blocks, doorway clearing and door check as before, and the same leaf matrices after opening and shutting 25 doors.
`KWALK.reach` (core/walk) is the reachability audit. **The pass over the kits** (the owner, 2026-11-03: every kit's black
voids replaced with true doors and windows, settlement kits first, then the Ancient structures and the arcologies; every
layout audited with `KWALK.reach` so every interior region and built floor is reachable) runs kit family by kit family:
the `core/engine` kits with Islanders' and Zeijani's forks; Highlands and Xanadu; then the Yuni lineage, the Beast
Riders' towns, Pylon and Talia, Post-Apoc; then `kits/ancients`, `kits/port` and the arcologies. `TODO.md`, "Opening doors as a
core module", "Real doors and glass across the kits", and "Doors that open" (Viewers):
- Lift `IZDOOR` (`settlements/iziz/src/69e5-iziz-openings.js`) and `95j-iziz-doors.js` into `core/door`: leaves as
  plain records keyed by stable ids (hinge, width, swing, state, locked), `open` / `close` / `toggle` / `nearest` as
  plain functions, walk blocks in `KWALK`, the drawing and the key on the host side, so it runs in Godot.
- Verge (`izv_files`) and the isle demo (`bundles.py` `izv_files`) take `core/door` instead of Iziz's 69e5, which
  removes those settlement -> Iziz edges and makes their doors open.
- Pylon's `pylDoorway` and Talia's arches hang a leaf in it; the other building kits (Ancients, Islanders, Lizardmen,
  the nomads, Scyvoi, Zeijani, Eternian) draw doors and glass through it, not through 69e5's wrappers.

**With step 2 (`core/engine`).** Half of the first is done (the host gets `KWALK` where the page takes `core/walk`); the
rest waits for Zeijani's port onto the engine, whose controls are the reference.
- One walk mode and one set of controls in every viewer (`TODO.md`, Viewers): the engine takes `core/host` and
  `core/walk` and carries no camera of its own (`kits/zeijani/src/92-camera.js` was the reference for the controls; core/host's
  `90-host-camera.js` carries them since 2026-10-18).
  GODOT-PLAN.md counts `camera.js` copied in 16 builds, `probe.js` in 15, `stats.js` in 10.
- Interiors in every building kit that has them, with a cut-away (`TODO.md`, Viewers): done once in `core/engine`
  through `kits/interiors` and `core/furnish`, not once per kit.

**With step 3 (catalog / Voth).** The symbols item: done in step 3 (3d39ba47).

**With step 4 (the settlement chains).**
- ~~`useGroupXF` (Iziz's `69c`) into `kits/ancients`' `50-registry.js`~~: done (it is in `50-registry.js`; checked 2026-11-03).
- ~~Ys reads the Ancients chain by path instead of its pre-69e5 copies of `70` and `71` (`TODO.md`, Port: next, item 6).~~
  **Done 2026-11-09:** every vendored fragment but the 18 adapted copies is read in place (`settlements/ys/build.py` `INPLACE`;
  51 src/ copies gone), with the Vernacular's `69e5`, the Highlands kit's `71c` and `core/door` (10, 20, 30) on the city page;
  `settlements/voth/foreign.py` reads Ys's Treasury files where Ys does (`settlements/ys/KNOWN_ISSUES.md`).
- ~~The open baseline rewrite from the Ancients re-vendor session~~: done (the five pages' entries match the committed
  pages; checked 2026-11-03).
- The chain's re-vendors since that session, done 2026-11-03: Xanadu's `69-mat-salvage.js` and Reed Lake's `69-mat-salvage.js`,
  `71-hl-mat.js` and `71b-hl-motif.js` from Highlands (upstream's `patchOpening`, paving and frieze materials, folk murals).
  Their pages wait for the all-builds rebuild: they were already behind their sources (`core/water`, `core/tags`, the
  library packs) before it. Iziz's seven biome copies (`--vendor-bio`), with `core/biome/36-core-walker.js` the fauna now
  needs: done, verified (`settlements/iziz/KNOWN_ISSUES.md`). The Ancients chain is quiet: step 4 can start.
- Settlements that vendor a biome read it by path: Dalab (swlowlands), Shade (sedesert), and Iziz's and Ys's old
  hyperjungle and nwbay fauna copies (GODOT-PLAN.md, the fauna note).
  **Iziz done 2026-11-03:** its twelve copies were the biome closure-wrapped by `bio_wrap` and matched upstream, so the
  city wraps the biome as it reads it and the copies are gone (`iziz.html`, sidecars and manifest byte-identical; Iziz's
  two vendored pairs off the allow-list). ~~**Dalab, Shade and Ys left**~~: **done 2026-11-03** (each build's KNOWN_ISSUES.md: Dalab
  reads core/biome's four and swlowlands' five in place, Shade sedesert's and core/biome's, Ys core/biome's and nwbay's; no
  biome copy is left in any src/, and no biome pair is on the allow-list). Their pages were rebuilt and checked again on
  2026-11-10 (`verify.py --assert` on SwiftShader, one screenshot each; the results in their KNOWN_ISSUES.md): Shade OK; Ys OK
  once its in-place biome took the core/biome fragments nwbay needs (31j-35: the city page had thrown in the bay's fauna since
  the read in place); Dalab's set OK, its city failing only the newer `instance-cap` rule (swlowlands' glossy crowns, open).

**With step 5 (backwards edges).** Nothing parked beyond the plan's own list.

**Not ride-alongs.** The fungoid flora on `BIO.fung` waits for the final biome rebuild (owner, 2026-10-26); the
normal-map re-pack moves only six baselines on purpose; flame and heat haze and the water audit are features, not
dependency moves.

## Not decided (owner)

- ~~Whether the sky is `core/sky` or an opt-in subfolder of `core/atmos`.~~ Settled by the build: `core/atmos/sky`.
- Whether `core/engine` is one module or split (scene/world vs. animation vs. materials). One module for now
  (2026-11-03, `engine.py` lists the files); splitting it moves no byte.
- Whether `core/engine/10-core.js` moves onto `core/rand` (Yeti's version): every kit's buildings change (step 2).
- ~~Whether to split the catalog's engine into `core/catalog`.~~ Yes (owner, 2026-11-03): done in step 3.
- ~~Whether the Pylon and Talia `--kit` builds (which build *inside* Iziz's page by design) stay as the one
  allowed kit -> settlement edge.~~ Yes (owner, 2026-11-03): they build in Iziz's page; their two backwards edges stay
  allow-listed.
- ~~Whether to take the step 1 gallery republish with the rebuild.~~ Moot: step 1 changed no page. Ask with the next
  all-builds rebuild (CLAUDE.md "Publishing").
- ~~Whether a kit's viewer should ever move from the placeholder onto `ATMOS.skyBiome`.~~ Keep the placeholder for the
  kits (owner, 2026-11-03).

## Caveats

The scan matched path strings in `build.py` only. It does not see reads inside fragments, dynamic paths, or
`verify.py`/tooling, and it counts a path in a comment. Step 0 replaces it with a proper tool before anything moves.
Since step 0's follow-up `tools/dep_graph.py` takes what each build reads (`--list-sources`), which sees dynamic paths
and skips comments; it still does not see a fragment that loads another at run time, or `verify.py` and tooling.
