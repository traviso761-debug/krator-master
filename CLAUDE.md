# Krator — notes for Claude

Krator is a set of procedural Three.js worlds (settlements, building kits,
biomes). Each one is built from numbered `src/` fragments by its own `build.py`
into a single self-contained HTML file.

Read `README.md` first: it holds the design rules for every build (tagging,
modularity, the inspector and polygon tools, the standard skybox). `INDEX.md`
says which build holds what.

## Working rules (the roadmap's stages 0 to 2, merged into `main` 2026-10-14)

Three evaluations of the repo produced a roadmap (`ROADMAP.md`, and the owner's "Krator Roadmap" doc). Its stages 0
to 2 ran on the branch `full-refactor` and are merged; stage 3 (one interface for every settlement, `ROADMAP.md`
section 10) and the city-layout module (`core/city/PLAN.md`) are next. Every session follows these rules.

**Check before you push.** `python3 tools/test_all.py` runs the port lint, the insulation check, the encoding lint,
every node test under `core/`, a rebuild of every build and the hash baseline (`--no-build` skips the rebuilds;
`--nightly` adds `verify.py --assert` on the critical builds and the Godot tests), plus the ratcheted lints (`tools/ratchet.py`: each fails only on
what is new): `check_assembly` (clashes, order and missing fragments on the built pages; `tools/fragment_needs.json` declares a shared fragment's
needs), `check_source` (trailing `//`, `|| <number>`, shader text), `check_vendor`, `check_views`, `check_cells --ratchet`, `check_stale`, with `check_budgets`
hard. **Build with `python3 tools/build.py <build>`**: the same build, plus the LFS refusal, the page cap, the fragment needs and its
`build-inputs.json`; `python3 tools/reach.py <file>` says which pages a shared file reaches before you change it. CI runs it on every push
(`.github/workflows/`); the nightly job runs on `main`. A `verify.py` takes the shared harness (`tools/harness.py`:
the Chromium launcher, the local three.js, `smoke`, `walk`, `export`); do not paste a launcher into one. Every
`build*.py` imports `tools/build_sources.py` and calls `report()` before its first write, so `--list-sources` prints
what it reads; `tools/dep_graph.py` builds `DEPS.json` from those lists (a new build copies the pattern from the
nearest one; one without it falls back to the comment-counting text scan). Built pages,
bundles and texture packs are in Git LFS (`.gitattributes`): a checkout needs `git lfs`.

**Two GPU lanes, a queue, a watchdog and a verify cache** (owner, 2026-11-02 and 2026-11-03; `tools/harness.py`, its docstring). `arc` is the Intel Arc 140T (`krator-verify-gpu.lock`, the lock older harness copies take); `rtx` is the RTX 5060 (`krator-verify-gpu-rtx.lock`; Chromium gets `--force_high_performance_gpu`, and the `gpu-renderer` assert checks the vendor). Pick with `KRATOR_GPU_LANE=arc|rtx|auto`: unset, a verify takes `auto` (whichever lane frees first) and a timing run (`--timing`, `perf_views.py`, `ground_shots`, `harness.py lock`) takes `arc`, so numbers stay comparable; a Godot GPU run takes `harness.py lock --lane rtx -- godot ...` (Godot picks the RTX by default; `--headless` tests use no GPU). Waiters queue first come first served (`python3 tools/harness.py lanes` shows holders and queues); do not take a lock in bash. A `verify.py` re-runs itself under the stall watchdog, as `harness.py lock` runs its command: no output and no file in `--out` for 25 minutes (`KRATOR_GPU_STALL_MIN`) kills the job's process tree, releases the lock and exits 124 "STALLED": rerun it. While the job progresses the owner file is touched each minute. An `--assert` verify that passed on the same bytes (page, every file it loaded, verify.py, harness, arguments) prints "cached pass" and is skipped: `--no-cache` reruns, failures are never cached. **The heartbeat rule still holds for a holder without the watchdog** (an older harness copy, a bash holder): check a GPU job every 30 minutes: the process is alive and its output or page has moved since the last check. A job with no progress in 30 minutes is hung: stop it by PID and release the lock, then rerun or report it; this needs no one's permission. A session waiting on the lock may do the same to another holder's job after confirming the same way, and tells that session. Stop by PID or script name only, never by a match on the session id, and never stop a job that is merely slow but still moving.

**Who works where.** No separate economy session runs any more (owner, 2026-10-18): `core/simulation/` is edited
on `main` like any other core module, and **the isle demo (`settlements/isle-demo`) is the test case the economy is
tuned on as it is built** (two towns of one polity trading by sea; `settlements/isle-demo/PLAN.md` sections 5 and 7).
A change to `core/simulation` keeps Voth's stocks proof, `test-sim.js` and the baseline unchanged unless the change is
meant to move them. The city-layout module work owns `core/city/` and Voth's layout fragments (`15`, `30`-`35`); keep
out of its files, or ask.

**Rebuild what a shared change reaches.** On 2026-10-08, 29 committed pages and the hash baseline were behind
their sources because a change to `core/` was rebuilt into one build only. After editing anything under `core/`,
`kits/catalog/` or a kit other builds vendor, rebuild every build that takes it and commit those pages too. The
Throne's stations (`python3 build.py --station <name>` in `biomes/throne`) and Girder's hero page (`build_hero.py`)
are separate build commands; `kits/interiors` builds before `kits/ancients-interiors` (which loads its
`dist/interiors-core.js`). Then `python3 tools/port_baseline.py`; rewrite the baseline only for pages you changed
on purpose and checked. A change that rebuilds every build (or most of them) takes the items parked in `TODO.md`, "Ride along with the
next all-builds rebuild", with it.

**Write code that is the same on every machine and in Godot.**
- Every text-mode `open()` in a build.py names `encoding='utf-8'` (and `newline='\n'` when writing).
- A path written into a page or a manifest uses `/`, never `os.sep` (`os.path.relpath(...).replace(os.sep, '/')`):
  Verge's page differed between Windows and Linux builds because of this.
- New placement draws from `core/rand` (`KRAND`): a tile or cell is seeded from a hash of (world, cell, index,
  salt), never from how many draws came before it, and never from a `Math.sin` hash.
- Placement never reads canvas pixels (`getImageData`): use `core/mask` (`KMASK.canvas`). GPU and CPU canvases
  disagree.
- A numeric default is `x == null ? d : x`, not `x || d` (0 is a real seed, scale and renderOrder).
- Everything placed is registered in `core/tags` before it is drawn; a builder draws a record, it does not decide
  where things go.
- Do not copy infrastructure into a build (camera, probe, PRNG, noise, terrainH, sky, verify harness): take the
  `core/` module, or ask before writing a new one. `GODOT-PLAN.md` section 6 has the full list.
  **This is checked, and it is the rule that gets dropped mid-session:** `README.md` "CORE MODULES ARE NOT OPTIONAL" has the table of
  what to take for what, and `tools/check_core_use.py` (a `test_all.py` step) fails a build that skips a module its kind needs or
  writes its own PRNG, noise, `getImageData`, water shader or sky dome. Start a new build from the nearest finished one, write its
  `Core adoption` section in `PLAN.md` first, and run the check before calling it done.
- A city's placement (streets, lots, infill) goes on `core/city` (`core/city/README.md`, "Porting a settlement"),
  not a new bespoke pass. Do not write another spatial hash or occupancy grid: use `core/space` (`KSPACE`), which the biome core
  already takes and `core/city` is moving onto (`core/city/PLAN.md`).
- **Voth is the city plan on `core/city`** (`settlements/voth`; owner, 2026-10-09; built in `settlements/streetlab` until
  2026-10-14). The first Voth's page is retired (`archive/voth-first`); its `src/` stays in `settlements/voth` as Voth's
  source library, which the build runs or lifts by name: port from it, do not add features to it.
- `core/city` will become the NPC-placement and quest-building tool and, later, the player's settlement builder, so
  it will run in Godot: keep its data side free of three.js and the DOM, its records keyed by stable ids, its edits
  kept as deltas by id, and its rules (overlap, frontage, slope) as plain functions on records.

**Fixed on the way (do not reintroduce).** `BIO.iridBarkMat` is one core material kind (`core/biome/30-core-foliage.js`).
The catalog furniture batch keeps indices when a build asks (`KF.batch({indexed:true})`, `KFURN.useBatch(...,
{indexed:true})`; every furnished build does): do not write new code that depends on triangle soup. Normal maps from
`tools/textures/pack.py` are lossless. Placement on `core/mask`, never `getImageData`, in every build ported so far.

**Godot is 4.7.2** (the owner's version). Every Godot test passes on it; the Dhelv navigation test (branch
`claude/zeijani`) fails on 4.5. Run `godot --headless --path godot --import` once in a fresh checkout before a
`--script` test, so the class names register.

## Layout

| Path | What |
|---|---|
| `settlements/<name>/` | one world per folder: `src/`, `build.py`, `verify.py`, docs, `dist/` |
| `kits/ancients/` | the Ancients building kit and its per-site targets |
| `kits/port/` | the Ancient Port kit (`settlements/port` until 2026-11-03): the Ancient Port segments and vessels (a sibling of `kits/ancients`), which will build Hook and may be reused on other coasts. Call it the Ancient Port kit |
| `kits/ringsea/` | the Ring Sea watercraft kit: 31 vessels, one fragment each |
| `kits/catalog/` | master catalog: 1696 furniture pieces in the furniture SPEC shape, one file per culture (plus generic containers, food, drink, supplies and biome fruit). Verified: `build.py`, `verify.py --assert` |
| `kits/interiors/` | `ROOM()` and the furniture placer (engine-neutral, ported from Yuni), a catalog adapter, outline view and cut-away: a verified demo. Read `API.md` |
| `kits/ancients-interiors/` | the Ancients' ship interiors (backported from Noah's Regret) on `kits/interiors`: the ship's room kinds, ship's rooms and cabins, fourteen hall recipes in two dresses, each audited; bundled as `KratorAncientsInteriors` (`kit_bundle.bundle()`). Verified: `build.py`, `verify.py --assert`. Read `API.md` |
| `kits/furniture/` | scaffolding only: read `SPEC.md` |
| `kits/motor-vehicles/` | the Motor Vehicles kit: a `VEHICLE` registry on the catalog core, one file per culture (geomancer, republic, iziz, eastabyss, post-apoc: a buggy, an eight-wheeled crawler, a six-wheeler, a caravan truck, a tracked hab), bundled for any world as `KratorVehicles` (`vehicle_bundle.bundle()`), textured from the library as detail maps (`materials.json`, `tex/`). Verified: `build.py`, `verify.py --assert` |
| `kits/mechs/` | the Mechs kit: skinned, animated walkers (leg IK with planted feet, idle / walk / attack clips with fire and impact events, a z-fighting audit) on the catalog core and the motor-vehicles frame, bundled as `KratorMechs`; one file per mech (Iziz: seventeen walkers, from a hound-sized drone to a walking siege tower, the Castra in two variants; the Stalkers of the Catch: two, man-sized and sleek). Verified: `build.py`, `verify.py --assert`. Read `README.md`, `API.md` |
| `kits/metropolis/` | the metropolis test bed (`biomes/ancientsvalley/PLAN-ANOMALIES.md` section 13): sixteen Ancient towers designed for the range tiers, two built with audited interiors; `KSHELL`, the baked shell (polar and box heightfields, a prototype of `core/shell`). Read `PLAN.md`, `README.md` |
| `kits/iziz-vernacular/` | the Iziz Vernacular (from `settlements/iziz/src`, 2026-11-03): the settlers' houses, trades, civic, works, farms, guilds and frontier as `VERN.def` records on the `vn*` helpers, drawing through the Ancients core. Iziz, Pylon and Talia read it in place; Verge and the isle demo bundle it (`IZV`); Highlands, Dalab and Ys check their copies against it. Its sheet is still Iziz's `vernacular` target. Read `README.md` |
| `kits/highlands/` | the Highlands kit (from `settlements/highlands/src`, 2026-11-03): the Republican, Rustic and Tribal sets on a shared foundation (textures, materials, motifs, helpers, carving, frame, dress, trades table, furniture glue); `highlands.py` gives one culture's files (`culture_files('rustic')`). Highlands reads it in place (its sheet and Roketstad); Reed Lake, Dalab and Ys check their copies against it. Read `README.md` |
| `kits/xanadu/` | the Xanadu kit (from `settlements/xanadu/src`, 2026-11-03): the southern Sultanate's buildings (Tibetan massing, Indian, Turkish and Persian detail), and `kit_bundle.py` sealing them as `XAK` for another world (Longsong's villages). Xanadu reads it in place (its sheet and Erewhon). Read `README.md` |
| `kits/locus/`, `kits/eastern-abyssal/` | the Locus kit (the Geomancers' oil town's buildings, `64-locus-*`) and the Eastern Abyssal kit (`65-abyss-*`), from `settlements/locus/src` (2026-11-03), each with its notes and known issues. Both draw through Locus's fork of the Yuni engine, beside the Yuni kit's buildings. Locus reads them in place (its `locus-kit.html` and `abyss-kit.html` are their sheets), Mungo by name, Verge in `YKIT`. Read each `README.md` |
| `kits/yuni/` | the Yuni kit (from `settlements/yuni/src`, 2026-11-03): Yuni's Sahel-and-Gaudi buildings, poor to rich houses, the Emir's palace, the trades, the Order's civic buildings, park and library (`55`-`59c`, `ASSET` records through the frame `F`). They draw through the Yuni engine, which stays in each world that forked it (Yuni, Locus, Girder, Mav's Refuge: not a core module, MODULARITY-PLAN.md step 4b). Yuni reads it in place, Locus on its own frame (and through it Mungo and Verge's `YKIT`). Read `README.md` |
| `kits/pylon/` | the Pylon kit (culture `pylon`): Iziz's vassal arcology city round the ruined Monolith, post-Cataclysm buildings imitating the Ancients in white render and Iziz orange. Written on the Iziz Vernacular contract and built on its page (`settlements/iziz/build.py --kit`; the Vernacular stands beside it: the mixed street). Read `PLAN.md`; the contract shared with the Vernacular and `kits/talia` is `settlements/iziz/VASSAL-KITS.md` |
| `kits/islanders/` | the Islanders kit (catalog culture `islander`): the Ring Sea Islanders in two styles, the West (rumah: horned saddle roofs on piles) and Kautoa (Sumba: spire roofs over thatch skirts), poor to rich houses, civic, trade, harbour and defence buildings, Kautoa's palace; a building for every Voth census trade in both sets, mines; scrap on the poor; forked from the Scyvoi engine (vendored). Verified: `build.py`, `verify.py --assert`. Read `API.md` |
| `kits/beast-riders/` | the Beast Riders kit (catalog culture `beast-rider`): the mounts' buildings (raptor stable, great byre, rookery tower) as catalog ASSETs with the library's detail maps, beside Girder's and Mav's Refuge's buildings from the catalog (lossy copies until the faithful port: its `KNOWN_ISSUES.md`); the catalog's inspector, hover and polygon tools. Verified: `build.py`, `verify.py --assert`. Read `README.md` |
| `kits/resources/` | the Resources kit: world content that belongs to no culture. So far the resource nodes (iron, copper, gold, tin, silver, rare earth, coal, sulfur, saltpeter, oil; three grades) that works draw on by the nearest-node rule (a mine; oil a derrick: Locus's pumpjack), the grade setting the yield. Runs on the Scyvoi engine read in place; building kits read its fragments in place. Verified: `build.py`, `verify.py --assert` |
| `kits/construction/` | the Construction kit (`KCONS`): a building site generic to every culture (the cleared plot, the bill's materials piled, the scaffold rising with the walls), drawn round a settlement's own kit piece, which core/city's `KCITY.constructMesh` (`core/city/54-city-host-construct.js`) reveals in build order (footing, frame before infill, roof last) without the kit's code changed. Read in place; the isle demo's empty lots use it. Read `README.md`, `API.md` |
| `kits/crops/` | the Crops kit: world content that belongs to no culture or biome. 123 crops (grain, pulse, tuber, nut, oil, vegetable, greens, mushroom, fruit, berry, spice, herb, sweetener, beverage, and fibre, dye, reagent and fuel) in 25 buckets, each a range on warmth, air pressure and aridity; the biome kits are zones on those axes, so a settlement calls `CROPS.forBiome`, `CROPS.at`, `CROPS.pick` or `CROPS.palette` for what its place could plausibly grow, irrigated or not, what a recipe's bucket may be, and which dyes and plaids it can make. Dark-grown fungus crops (alecap, pale fungi, the mat, glow mushroom) take a works, not a climate. Plain data and pure functions (`[G data]`); read the fragments in place. Verified: `build.py`, `tests/test-crops.js`, `verify.py --assert`. Read `PLAN.md`, `API.md` |
| `biomes/<name>/` | flora and fauna kits on the shared biome core |
| `openworld/<region>/` | a region of the scale model at 1:1, streamed, with the biome kits' flora: `isle-demo` (the Ring Sea isles; the first, `little-demo`, is retired to `archive/`). Its data comes from `tools/scale-model/extract_region.py` |
| `core/materials/` | material fragments shared by the Ancients-lineage builds (`core/README.md`) |
| `core/terrain/` | carve patches (overhangs on a heightfield), opt-in by any build through `CORE_TERRAIN` in its `build.py` |
| `core/catalog/` | the catalog's engine (from `kits/catalog`, 2026-11-03): the furniture core, the page engine, the furniture kit, runtime, detail maps, the inspector. A build names its files as before and resolves each through `catalog.py` (`kcat.path`): an engine name to `core/catalog`, `krator-symbols.js` to `core/sockets/38-symbols.js`, a culture file to `kits/catalog`. Pages that load it at run time are served from the repo root |
| `core/engine/` | the building-kit engine (from `kits/scyvoi`, 2026-11-02): merged geometry by material key, `defBuilding` and its records, the sheet's scene, the host hand-over. Scyvoi, the nomads, Eternian, Islanders, Lizardmen, Yeti and Resources read it by path; a kit's own tables are its `31-alt-takes.js`. After changing it, rebuild those kits and run `python3 core/engine/fingerprint.py` (every page must read `same`). Zeijani and Noah's Regret still run forks of it |
| `core/furnish/` | the furniture placement pass (`KFURN`) Girder, Mav's Refuge, Locus, Highlands and Post-Apoc share; `fingerprint.py` proves a change moved no piece (`core/furnish/README.md`) |
| `core/charactermodels/` | a core module that is also a build of its own (`CORE_BUILDS` in the index tools): the characters every settlement's citizens are to be drawn from. The Cosmetic Lab (character editor, NPC crowds) and the Animation Lab (every clip on six bodies, with review marks): MakeHuman (MPFB2) bodies with morphing face, build and ancestry, library clothes, hair and beards that follow, skin and hair tint, and peoples (`data/peoples.json`) for drawing a culture's strangers; body mods any body can wear (a second pair of arms, flesh or cybernetic, on lower-arm joints every skeleton has; rib gills: `tools/mods.py`) and the Giants, the Dalab's and the Free Giants (`tools/giant.py`); Godot twin (`godot/krator/character/`, behind). Read `README.md`. Roadmap: its README, "A core module: where it goes next", and GODOT-PLAN.md Phase 5 |
| `core/city/` | the city builder and its infill (steps 6-12: civic, avenue lots, main streets, side streets, alleys, the infill of the blocks) as plain records, and their drawing. Voth's city plan (`settlements/voth`) and Verge's two levels (`settlements/verge`) are on it. **Every settlement should eventually be ported to it** (`core/city/README.md`, "Porting a settlement") |
| `core/hamlet/` | small settlements: resource villages (salt, mining, lumber, ranching) and fishing and farming villages, at most 500 people, placed with the resources they work (`KHAMLET.village`); fields from the biome kits' `gather` tag, timber from the trees' `harvest.wood`. Nomad camps are `core/camp`. Plain records (`[G data]`). Read `README.md`, `PLAN.md` |
| `core/camp/` | `KCAMP` (`PLAN.md`, owner's answers 2026-10-26; `README.md`): built so far the census and the ring/horseshoe pitch (`node core/camp/test-camp.js`) and the first camp, a Raptor band in the isle demo's east jungle (`openworld/isle-demo` 48k/88k, on the sim). Planned: the bands that move (nomad bands of 40-70 with their beasts, leaders' camps, the Beast Riders' bands and their seasonal homes, the flyers' canopy camps in trees) and the ventures (raids with balance caps, caravans as land `SIM.trade` carriers, expeditions, later armies); camp formations and pitch/strike as plain records; a world tick under the sim's levels; the record kinds go in `core/simulation/SCHEMA.md`. House names: `tools/names/izani.py` |
| `godot/` | the Godot project (the port spike): importers for each export, shaders, `data/` exports made by `godot/tools/export_spike.py` (`godot/README.md`) |
| `gallery/` | the shareable gallery page and the script that publishes it |
| `host/` | the LAN site server: the gallery plus the World Menagerie's pages (`host/README.md`). The Menagerie is embedded at `host/WorldMenagerie/` as a git subtree. Core never references it: `tools/check_insulation.py` |
| `archive/` | old scratch and exported snippets. Do not build from it |
| `painting-to-3d-world.skill` | a zip. Read `painting-to-3d-world/SKILL.md` inside it before starting a new build or a large expansion |
| `.claude/skills/character-modeling/` | lessons from building the character kit: pipeline choice, the bug catalogue by area (`references/pitfalls.md`), tool setup. Read it before work on `core/charactermodels`. `character-modeling.skill` is the same, zipped for upload: update the folder with what a session learns and rebuild the zip (`README.md`, "Skills") |

## Keep token use down

These files are big and generated. **Do not open or grep them:**
`dist/`, `voth.html`, `yuni*.html`, `.syntax*.js`, `.origin.html`,
`three.min.js`, `*.zip`, `shots/`, `archive/`, `host/site/`, `host/menagerie/`,
`godot/data/` (the spike's exports; `.ignore` keeps it out of searches), `host/WorldMenagerie/` (the Menagerie's own source: work on it only when asked; `.ignore` keeps it out of repo-wide searches, so name the path to search it).
Pass `--glob '!**/dist/**'` (or search a `src/` folder) when using Grep.

- **Edit only in `src/` and `targets/`.** The HTML is rebuilt from them.
- **Start at the build's `INDEX.md`,** which lists each fragment, its sections and
  size. Then read the build's `README.md`, `API.md` and `KNOWN_ISSUES.md` as needed.
- **Never read a fragment over ~30 KB whole.** Find the section with
  `grep -n '^/\* ====' <file>`, then read that range with an offset and limit.
- **Change code with targeted edits.** Do not regenerate a fragment to change part of it.
- **Take one screenshot per meaningful change,** not one per tweak.

## Textures (the material library)

`core/materials/library/` and `core/materials/patterns/` hold the shared texture sets (`albedo.jpg`, `normal.jpg`, `roughness.png`, `meta.json`,
about 3 MB each); `core/materials/PLAN.md` says what each is, and `core/materials/demo/` builds the page that shows them. The images are
binary, so searches skip them. **Open an image only when the task is graphics or performance** (judging a surface, a render run, a texture budget),
and then open the few you need, not a folder. Never read every `meta.json`; read `PLAN.md` first.

**A build adopts the library** through `<build>/materials.json` and `python3 tools/textures/pack.py <build>`, which writes
`<build>/tex/` (commit it); the code is `core/materials/record/` (`KMAT`, `TEX`). Girder is the worked example.

**The images are in Git LFS** (`core/materials/**/*.png` and `*.jpg`, about 570 MB). A clone for non-graphics work can skip them:
`GIT_LFS_SKIP_SMUDGE=1 git clone <url>` leaves small pointer files, and `git lfs pull --include="core/materials/library/<set>/*"` fetches only the sets a task needs.
History was cleaned on 2026-10-05 (old built pages, screenshots and past image versions were dropped); the pre-cleanup history lives in the
owner's `krator-before-cleanup.bundle` and in the other branches on the remote, which were left on the old history.

**If a surface has no good texture, ask the owner to find one or generate one.** Name the gap and, for a generated image, give the prompt
(`core/materials/PLAN.md`, "Prompts for generated sources" has the template and per-culture rows). Do not paper over a missing texture with a
procedural stand-in without saying so.

**`core/materials/PROMPTS-NEEDED.md` is the one list of what is owed:** every texture still to source or generate, with its
paste-ready prompt; add a new gap there, and delete its entry when the set is delivered.

## Edit requests from the browser

The owner can Alt+click a spot in any world served by `python3 tools/edits/serve.py` and leave a note.
"Apply the pending edits" means: `python3 tools/edits/pending.py`, make each change in `src/`, rebuild, verify,
then `pending.py --done <id>`. See `tools/edits/README.md`.

## Build and verify

```
cd settlements/<name> && python3 build.py            # or kits/ancients, biomes/<kit>
python3 verify.py <built html> --assert ...           # see that build's README
```

Every build is deterministic. After a refactor, rebuild and run
`python3 tools/port_baseline.py`: it compares every built page with `PORT-BASELINE.json`.
Identical hashes prove nothing changed.

**The Godot port.** `GODOT-PLAN.md` is the plan. Each build's `PORT.md` tags its fragments
(`tools/audit_port.py` writes it; keep its Tag and Note cells current when you split or move a
fragment). `build.py` runs `tools/check_port.py` first: a fragment tagged `[G data]` must not touch
the browser. New browser-side code goes in the host fragments, not in data or builder fragments.

## Publishing

Update and republish the Krator Worlds gallery automatically only when a brand new
settlement, kit or biome goes to `main` (see the end of `README.md` and `gallery/README.md`).
A fix to one settlement or biome republishes only that build's files. A wider change
(several builds, shared `core/`): ask the user whether to update the gallery.

## Shared and vendored code

- `core/materials/` holds one copy of the material fragments the Ancients-lineage
  builds share. Those builds' `build.py` read them from there. Edit them there,
  and rebuild every build that lists them.
- `core/furnish/` is one shared copy too: after changing it, run `node core/furnish/test-furnish.js`, rebuild the five
  builds that take it, and `python3 core/furnish/fingerprint.py` (every page must read `same`).
- `core/city/` is one shared copy too: a build lists its fragments by path (`settlements/voth/build.py` and
  `settlements/verge/build.py` `CITY_JS`). After changing it, rebuild and verify every build that takes it (Voth:
  `verify.py dist/voth-city.html --assert`; Verge: `verify.py dist/verge.html --assert`) and run `node core/city/test-city.js`.
- `core/terrain/36-core-carve.js` is one shared copy too: a build lists it in `CORE_TERRAIN`.
  Edit it there, run `node core/terrain/test-carve.js`, and rebuild every build that lists it.
- Other shared fragments are **vendored**: each build keeps its own copy, and
  `python3 build.py --vendor-check` reports drift from the upstream. Some drift is
  deliberate and recorded in that build's `KNOWN_ISSUES.md`. Fix upstream, then
  re-vendor. Do not silently re-sync a drifted file.
