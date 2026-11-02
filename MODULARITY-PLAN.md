# Modularity plan: move shared code off kits and settlements onto core

Part of the kits/settlement rebuild (ROADMAP.md stage 3 and section 10). Written 2026-10-26 from a scan of every
`build.py` (`tools/` has no script for it yet; step 0 adds one). Numbers are path references in build.py files, so
they show what a build *reads*, not what it calls at run time. Check each item against the fragment before moving it.

## Status 2026-10-27: what the biome rebuild changes

`claude/biome-rebuild` (worktree `krator-biome-rebuild`, unpushed; main merged in, 500 commits ahead at 650f48475) holds
work this plan depends on. `tools/dep_graph.py` on it: 86 modules, 957 edges (main: 76, 826), three edges not in the
allow-list (step 5 and step 0 below). What it means for the steps:

- **Step 1 has a target now.** The shared sky is built there: `core/atmos/sky/` (model, presets, shader) and
  `core/atmos/host/89-atmos-h-skyhost.js` / `89-atmos-i-skybiome.js` (`ATMOS.sky`, `ATMOS.skyBiome`), with every biome
  kit and station on it. Its plan (`core/atmos/SKY-PLAN.md` section 9) covers the painted domes (done) and Voth's
  `21-sky.js` lineage ("later") but **not Iziz's `81-sky.js` (`KratorSky`)**, which 16 kits still copy. Step 1 is that
  third lineage: the kits onto `ATMOS.skyBiome`, written as a row in SKY-PLAN.md section 9 by the session that owns it.
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
4. **Settlement-to-settlement chains.** Ancients -> Iziz -> Highlands -> Xanadu / Reed Lake / Ys / Mungo (Locus) /
   Verge, held together by vendored fragments (`70-vern-dwellings`, `88y-iziz-matlib`, `81-glow` from Locus,
   `70-biome-nhighlands` from Highlands). TODO.md already records the re-vendor sessions this costs.
5. **Biomes are already clean.** The 25 biome kits take the same 10 to 14 core modules and almost nothing else
   (`hyperjungle`, `necanyons`, `nsemiarid` are the only cross-biome reads). The biome kits are the model to copy.
6. **Backwards edges to fix:** `kits/beast-riders -> settlements/isle-demo`, `kits/ringsea -> settlements/reedlake`,
   `kits/post-apoc <-> core/sockets`, `core/materials -> biomes/sedesert, kits/ancients, kits/ringsea` (the
   vendored-drift notes in `core/README.md`), `biomes/ringisles` and `biomes/dambasins -> settlements/*`.

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
  `kits/ancients/build.py`; the kit does not read Span. Skip comment-only matches (a `#` comment line, and the part of
  a line after `#` outside a string), then drop any allow-list line that was only a comment.

**Step 1: the kits onto the shared sky (the 81-sky.js move).**
- Revised 2026-10-27: do not move `KratorSky` into core. The shared sky in `core/atmos/sky` (on the biome rebuild,
  above) replaces it: each kit binds `ATMOS.skyBiome` from one host fragment, as the biome kits do, with its site and
  light modes, and its copy of `81-sky.js` goes. The 16 kits: ash-nomads, catalog, desert-nomads, eternian, fauna,
  interiors, islanders, lizardmen, mechs, motor-vehicles, resources, scyvoi, yeti, zeijani (vendored), plus Pylon and
  Talia through Iziz's page. Iziz's own page moves with them or in SKY-PLAN's settlement step (S5).
- Delete each `VENDORED = {'81-sky.js': ...}` and its `--vendor-check` branch. Rebuild everything that takes it (the all-builds rebuild rule in CLAUDE.md) and
  take the TODO.md "ride along" items with it.
- Add `sky` to the `README.md` "CORE MODULES ARE NOT OPTIONAL" table and to `tools/check_core_use.py` so a build
  that skips it fails.
- Done when: no kit's `build.py` names `settlements/iziz`, and the kit -> iziz edges in `DEPS.json` drop to the
  `--kit` vassal builds only (Pylon and Talia, which are a documented contract).

**Step 2: `core/engine` (the Scyvoi engine) .**
- Promote the engine fragments Scyvoi, Islanders, Eternian, Lizardmen, Zeijani, the nomad kits and Resources share
  into `core/engine/`: scene, world, animation, host-take, material and geometry helpers. Kits keep their own
  definitions (`36-def`, the culture files, tents, buildings) and only read the engine from core.
- Do it one kit at a time, Scyvoi first (its pages are the reference), and prove each with the hash baseline;
  expect to find drift between the Islanders fork and upstream, and decide each diff by reading it (as the
  Ancients re-vendor session did), not by overwriting.
- Done when: `kits/*` list `core/engine` and no kit lists another kit's `src/` for engine code.

**Step 3: break the catalog <-> Voth knot.**
- Move the catalog registries and the Voth-building sheet loader so the dependency is `settlements/voth ->
  kits/catalog` only. `kits/catalog/build.py` stops naming `settlements/voth/catalog`; Voth's catalog sheet reads
  the kit's output file instead.
- Split what `kits/catalog` offers into a data side (`core/catalog`: the SPEC shape, registries, asset engine)
  and the culture files (stay in the kit), the same split `core/furnish` made for placement.
- Done when: `kits/catalog` has no `settlements/*` edge.

**Step 4: settlement chains onto core (stage 3, with `core/city`).**
- For each shared Vernacular helper that two or more settlements vendor (`70-vern-dwellings`, `88y-iziz-matlib`,
  Locus's `81-glow`, Highlands' biome fragment): move it to the owning core module (`core/materials`,
  `core/atmos`, `core/biome`) or to the kit that owns the culture, then let the settlements take it by path.
- Order: Locus glow -> `core/atmos`; matlib -> `core/materials`; Vernacular helpers -> `kits/ancients` (they are
  the Ancients' contract, `settlements/iziz/VASSAL-KITS.md`); `70-biome-nhighlands` -> `biomes/nhighlands`
  (already there; Highlands should take it from the biome, not the other way round).
- Keep out of `core/city/` and Voth's layout fragments (`15`, `30` to `35`); the city-layout work owns those.
- Done when: the settlement -> settlement edges in `DEPS.json` are only content links (Voth/Locus lore, the isle
  demo's two towns), not code.

**Step 5: fix the remaining backwards edges.**
- `core/materials` stops naming `biomes/sedesert`, `kits/ancients`, `kits/ringsea` (move the three fragments into
  `core/materials`, finish the drift decisions in `core/README.md`).
- `kits/beast-riders` and `kits/ringsea` stop reading `isle-demo` and `reedlake`; `biomes/ringisles` and
  `biomes/dambasins` stop reading `settlements/*` (their data goes in `openworld/` or the kit itself).
- `kits/post-apoc <-> core/sockets`: the kit takes the sockets module, the module does not name the kit.
- `core/atmos -> kits/ancients, kits/ringsea` (on the biome rebuild): `core/atmos/demo/build.py` looks for
  `three.min.js` in those two kits. Take it from one shared place instead (the harness's local three.js,
  `tools/harness.py`), as every core demo should.

**Step 6: keep it modular.**
- `tools/check_core_use.py` already blocks bespoke PRNG, noise, sky and water. Add: a build may not list another
  build's `src/` (only `core/`, its own kit, or a kit it declares in `PLAN.md` "Core adoption"), and a
  `--vendor-check` entry is an error unless the file is in a short documented list.
- New kits start from the nearest finished one *and* the `core/engine` engine; they never fork an engine.

## Order of work and cost

| Step | Reaches | Risk | Rebuilds |
|---|---|---|---|
| 0 graph check | none | none | none |
| 1 sky | 16 kits + iziz | low (the sky is built; one host fragment a kit) | all builds that draw a sky |
| 2 kit engine | 8 to 10 kits | medium (forks have drifted) | those kits and what bundles them |
| 2b core/door | Iziz, Pylon, Talia, Verge, isle demo, the building kits | medium (new module) | those builds |
| 3 catalog / Voth | catalog, Voth, 30 dependents | medium | catalog dependents |
| 4 settlement chains | ~10 settlements | highest (Ancients chain) | the chain |
| 5 backwards edges | 6 builds | low | those builds |
| 6 guard rails | CI only | none | none |

Run steps 1 to 3 on one branch with one all-builds rebuild (CLAUDE.md "Rebuild what a shared change reaches") and
`python3 tools/port_baseline.py` after each; step 4 waits for the Ancients re-vendor chain to be quiet.

## Ride-alongs (parked work that lands with these steps)

Found 2026-10-26 in `TODO.md`, ROADMAP.md stage 3 and GODOT-PLAN.md's hot-spot table. Do each in the step named,
rebuild once, rewrite the baseline once; then take the item out of `TODO.md` in the same commit.

**With step 1 (the sky, and the all-builds rebuild it brings).** `TODO.md`, "Ride along with the next all-builds rebuild":
- ~~The probes read a merged mesh's own sample points; a broad phase for `regOccupancy` on `core/space`; guard the
  camera's pointer capture.~~ **Done on the biome rebuild** (9e86c8dad). When it lands: check the Iziz palace page's
  own guard (`settlements/iziz/targets/palace/95q-palace-cutlabels.js`) came out, and take the three out of `TODO.md`.
- The culture symbols: `kits/catalog` reads `core/sockets/38-symbols.js` by path and its copy
  `kits/catalog/krator-symbols.js` goes (the TODO asked for a re-vendor; reading in place removes the vendored file).
- `core/hamlet/20-hamlet-cultures.js`: reword the `xanadu` row's comment (the kit has pens, corral and dairy now).
- ROADMAP.md stage 3, "the sky preset moves to `core/atmos`": the same change as step 1.

**Step 2b (new): `core/door`, opening doors as a core module, beside `core/walk`.** `TODO.md`, "Opening doors as a
core module", "Real doors and glass across the kits", and "Doors that open" (Viewers):
- Lift `IZDOOR` (`settlements/iziz/src/69e5-iziz-openings.js`) and `95j-iziz-doors.js` into `core/door`: leaves as
  plain records keyed by stable ids (hinge, width, swing, state, locked), `open` / `close` / `toggle` / `nearest` as
  plain functions, walk blocks in `KWALK`, the drawing and the key on the host side, so it runs in Godot.
- Verge (`izv_files`) and the isle demo (`bundles.py` `izv_files`) take `core/door` instead of Iziz's 69e5, which
  removes those settlement -> Iziz edges and makes their doors open.
- Pylon's `pylDoorway` and Talia's arches hang a leaf in it; the other building kits (Ancients, Islanders, Lizardmen,
  the nomads, Scyvoi, Zeijani, Eternian) draw doors and glass through it, not through 69e5's wrappers.

**With step 2 (`core/engine`).**
- One walk mode and one set of controls in every viewer (`TODO.md`, Viewers): the engine takes `core/host` and
  `core/walk` and carries no camera of its own (`kits/zeijani/src/92-camera.js` is the reference for the controls).
  GODOT-PLAN.md counts `camera.js` copied in 16 builds, `probe.js` in 15, `stats.js` in 10.
- Interiors in every building kit that has them, with a cut-away (`TODO.md`, Viewers): done once in `core/engine`
  through `kits/interiors` and `core/furnish`, not once per kit.

**With step 3 (catalog / Voth).** The symbols item above if step 1 has not taken it.

**With step 4 (the settlement chains).**
- `useGroupXF` (Iziz's `69c`) into `kits/ancients`' `50-registry.js` (Jimjam's open item) before the chain stops
  vendoring.
- Ys reads the Ancients chain by path instead of its pre-69e5 copies of `70` and `71` (`TODO.md`, Port: next, item 6).
- The open baseline rewrite from the Ancients re-vendor session (Iziz's `iziz.html`, Xanadu's `xanadu.html` and
  `erewhon.html`, Reed Lake's two pages), once, here.
- Settlements that vendor a biome read it by path: Dalab (swlowlands), Shade (sedesert), and Iziz's and Ys's old
  hyperjungle and nwbay fauna copies (GODOT-PLAN.md, the fauna note).

**With step 5 (backwards edges).** Nothing parked beyond the plan's own list.

**Not ride-alongs.** The fungoid flora on `BIO.fung` waits for the final biome rebuild (owner, 2026-10-26); the
normal-map re-pack moves only six baselines on purpose; flame and heat haze and the water audit are features, not
dependency moves.

## Not decided (owner)

- ~~Whether the sky is `core/sky` or an opt-in subfolder of `core/atmos`.~~ Settled by the build: `core/atmos/sky`.
- Whether `core/engine` is one module or split (scene/world vs. animation vs. materials).
- Whether the Pylon and Talia `--kit` builds (which build *inside* Iziz's page by design) stay as the one
  allowed kit -> settlement edge.
- Whether to take the step 1 gallery republish with the rebuild (CLAUDE.md "Publishing": ask).

## Caveats

The scan matched path strings in `build.py` only. It does not see reads inside fragments, dynamic paths, or
`verify.py`/tooling, and it counts a path in a comment. Step 0 replaces it with a proper tool before anything moves.
`tools/dep_graph.py` keeps the first two limits and, until step 0's follow-up, the third.
