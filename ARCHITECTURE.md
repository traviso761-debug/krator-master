# World Menagerie: architecture review

Date: 2026-09-26. Covers every scene page, the shared engine, the other runtimes, Voth, the tools, the tests
and the server. Follows `AUDIT.md` (2026-09-16), which covered Iziz alone; items from it that are still open
are listed in §7. File:line references are as of this date.

> **Progress.** Phase 0 is done: tests wait for the page and run three at a time (about 1.5 min for the whole
> site), and every page has a golden or a load check. Phase 1 is done: Voth is a shell over `src/voth/stages/`
> built by `tools/build-page.py`, and matches the golden taken from the old page. `tools/build-voth.py` is now
> `tools/build-krator.py`. Phase 2 is done: `src/core/shell.js` (renderer, resize, context loss, buttons, the
> loop and its hooks, loading and hint, boot) and `src/core/hash.js` (merge-writes that keep other keys) are used
> by the engine, the starship page, Kyrene, the Backrooms and the City, and every city's `main.js` boots through
> `boot()`. Every page but Iziz now handles context loss, and no page's camera wipes `wire=`, `under=` or a
> page's own keys (the wire toggle now writes them). Iziz moves onto the shell in phase 5. Phase 4 is done
> except the stage modules: the engine names no city (Chicago's boulevard, expressway, trails, river tours,
> default view and day length are keys in its city file; the commuter-rail section is generic), the Flesh Pit's
> extras talk through one documented bus (`src/fleshpit/bus.js`), and the war both Middle-earth pages share lives
> in `src/middleearth/`. Turning the engine's stages into modules with named outputs is not done: they share
> 244 names across stage boundaries, several of them mutable (`hourCur`, `clockPaused`, the camera state), so
> it needs its own pass. Phase 3 is done: `src/core/input.js` holds the
> binding table signed off on 2026-09-26 (README, Controls) and the key and pointer trackers with their guards;
> the engine, the starship page, Kyrene, the Backrooms, the City and Babylon 5's interior use them, and every one
> turns the same way (`tools/probe.py --input` drags and checks). `src/core/cylinder.js` is the drum walker
> Kyrene and Babylon 5 share. `ctx.camFrame` is a stack (`ctx.pushCam`). The later phases are not started.

There is no physics engine as such. The nearest things are the flight model (`src/core/flight.js`, kinematic,
no stall), the Backrooms' circle-against-walls collision (`src/backrooms/level.js:409`), the City's
solid-volume test and camera un-burying (`src/blame/main.js:120-139`), and the camera controllers. They are
covered under §4.

## Verdict

The site has outgrown the way it was built. Every scene works, and each one was built well, but it was built
**by copying the previous one**. There are now **six runtimes**, and each has its own renderer setup, render
loop, controls, resize, hash format, button factory and test fingerprint:

- the shared engine
- Iziz
- the starship page
- Kyrene
- the Backrooms
- the City

A seventh, Voth, shares nothing but three.js and the menu. Fixes land in one runtime and not the others:
- The stuck-pointer and blur guards exist in the engine only.
- Context-loss handling exists in Iziz only.
- The hash writer in the City and the starship page drops `wire=`.

Recommendation: **do not rewrite scenes. Extract a common core underneath them, one concern at a time,**
behind the golden tests, which already cover 25 of the pages and prove each step changed nothing. Then bring
Voth into the site's shape by recovering its lost build step rather than by rewriting it. The order is in §8.

## 1. What each scene runs on

| Runtime | Pages | Size |
|---|---|---|
| Shared engine, `src/engine/` (12 stages concatenated into `build.js`) | chicago, portland, nyc, venice (OSM); city17, nightcity, megacity, dredd2012, mordor, minastirith, kowloon, rivendell, arrakeen, europa, fleshpit, yellowstone (generated) | 1,321 lines + ~20-line `main.js` per city + extras |
| Iziz's own staged build, `src/iziz/` (56 stages concatenated into `build.js`) | iziz, `?city=iziz-b` | 3,919 lines |
| `src/starship/page.js` | enterprise, voyager, ds9, babylon5 | 467 + ~20-line wrappers |
| Own renderer | kyrene (`src/hab/`), backrooms, the City (`src/blame/`) | 243 / 244 / 512 lines of `main.js` |
| Self-contained HTML | voth (1.8 MB), krator (built from `krator-source.html`), the Tongue, the front page | |

**Where the engine came from.** It was not forked from Iziz: it was written for Chicago (`46ae588`), moved
into `src/engine/` (`8c54c1d`), and **copies Iziz's patterns by hand**. Its own comments say so ("as on the
Iziz page", `engine/build.js:1292`). So there are two independent copies of the same runtime, and they have
already diverged:
- **Iziz only:** context-loss handling, `raisedAt` hysteresis in the adaptive resolution.
- **Engine only:** `DETAIL.k`, `camFrame`, flight, the `quality` knob.
- **Everyone but Iziz:** `core/wire.js`. Iziz keeps its own wireframe (stage 52).

## 2. Findings, ranked by impact

### 2.1 Six copies of the runtime *(high)*

These are the same concern written separately in each runtime:

| Concern | Copies | Evidence |
|---|---|---|
| Renderer creation, pixel-ratio cap | 6 | caps of 1.5 / 1.5 / 1.8 / 1.8 / 1.6 / 1.75 (`engine/01-scene.js:4`, `iziz/build.js:135`, `starship/page.js:264`, `hab/main.js:64`, `backrooms/main.js:48`, `blame/main.js:75`) |
| Render loop, per-hook try/catch, boot (`rAF → setTimeout(30) → build().catch`) | 6 | identical text in hab:242, backrooms:243, blame:511, starship:249 |
| Adaptive resolution | 2 | `engine/07-ui.js:128` copied from `iziz/build.js:3911`, now different |
| `mkBtn` | 5 | identical except that two call `stopPropagation` |
| Resize | 6 | |
| Orbit/pointer/pinch/keys controller | 6 | behaviour differs, see §2.2 |
| Hash state | 6 formats | engine `#v=px..tz`, starship `#v=az,el,d`; `#view=` is a name in hab and starship but an index in the City; `at=` has 3 fields in the Backrooms and 7 in the City |
| `mergeParts` | 4 | `engine/04-landmarks.js:17`, `starship/parts.js:380`, `hab/main.js:38`, `babylon5/station.js:301` |
| Golden fingerprint `lotList` | 4 schemas | plus a legacy fallback in `probe.py:37-51` |
| Walking on a cylinder | 2 | hab `main.js:128-145` (axis X) and B5 `station.js:468-493` (axis Y): the same maths |

Only `core/diag`, `core/menagerie` and `core/wire` are genuinely shared, and they are the model to follow.

### 2.2 The same gesture does different things on different pages *(high, user-facing)*

- **Orbit direction** is reversed between the engine (`+=`) and hab, the City and starship (`-=`).
- **Drag rate:** 0.004 on some pages, 0.005 on others.
- **Pan:** right-drag or Shift in starship and the City; not possible at all in hab.
- **Touch:** hab has no pinch; starship has a second set of pointer listeners for its pinch.
- **Stuck-drag guard** (`buttons===0`): missing in the City.
- **The same key means different things:**
  - G is god's-eye view in the Backrooms and fly in the City.
  - F flips the section in the City and is free-fly in the Flesh Pit.
  - Shift runs in the Backrooms, the City and B5, and does nothing in hab or the engine.
- **Typing guard** (ignoring keys while an input has focus): missing in hab and in B5's interior.
- **Context loss:** no runtime except Iziz handles `webglcontextlost`, yet `enterprise.html` contains a
  `#lost` panel that nothing ever shows.

### 2.3 Stage concatenation makes one scope *(high, structural)*

`tools/build-page.py` joins 12 (engine) or 56 (Iziz) files into one `async function build()`. Consequences:
- A stage's interface is every name defined before it.
- Filename order is the only contract.
- No stage can be tested alone.
- Stack traces point at the generated file.
- `API` grows as the stages run, so an extra sees what happened to exist when it was called.
- The generated `build.js` files are committed. `sitectl check` regenerates them silently, and nothing runs
  `--check`.

### 2.4 The seams between engine and cities are single slots and an untyped bus *(medium)*

- **`ctx.camFrame` holds one controller.** `flight.js:97-113` saves and restores it by hand, and
  `fleshpit/camera.js:65` overwrites it. This works only because the Flesh Pit has no flight.
- **`window._iz` does four jobs at once:** config, test output, console bus and a message bus between extras.
  The Flesh Pit's extras pass about 15 `ctx.pit*` fields between each other (`incident.js:174-228`,
  `section.js:215` → `camera.js:249`).
- **One city imports another:** `src/minastirith/main.js:7` imports `../mordor/hosts.js`.
- **The shared engine knows Chicago:**
  - Michigan planters (`05a-streetscape.js:49`)
  - `metraTrains` (`05-el.js:79`)
  - the default view "Skyline from the lake" (`07-ui.js:100`)
  - falling back to `chicago` (`00-start.js:4`)
  - Chicago's sun curve (`01-scene.js:34`)
- **Async extras escape `section()`,** which is synchronous, so a failure surfaces as a stray "promise" error.

### 2.5 Motion is re-written per city *(medium)*

People, boats and carts that follow a path are re-implemented in seven `life.js`/`hosts.js`/`visitors.js`
files (110-600 lines each). There is no shared polyline sampler or instanced-mover. Walkers are separate too:
the Backrooms, Iziz's WALK mode and the City's fly mode each have their own keys and none of the others'
collision.

### 2.6 Voth is a build output with its source lost *(high for Voth)*

`voth.html` is one 33,185-line `function BUILD()`, machine-concatenated from about 30 fragment files by a
`build.py` that is not in the repo. The comments name them: `05-palette.js` … `78-life.js` …
`87-pathviz.js`, plus `SUBAGENT.md` and `API.md`. There are 97 `reseed()` fragment heads. It was written by a
multi-agent process elsewhere and committed as one blob (`5a4c0ce`).

**Its contents:**
- 53% comments (973 KB)
- about 850 KB of code: 640 functions, 989 top-level `var`s, 141 `window._*` globals
- five separate `requestAnimationFrame` loops
- its own CSS, error box and theme

**What it shares with the site:** `vendor/three` and `installMenagerie({standalone:true})`. Nothing else: no
`core/diag` loading stages, no hash state, no data file, no test.

**What it is:** a 3D procedural city of stone cantons on water, with a life layer, day/night and weather.
It is set on the same world as the Krator primer (the same gas giant, sky and Sea of Voth), but the two share
no data.

**Confusions around it:**
- `tools/build-voth.py` builds `krator.html`, not Voth.
- README:47 and :423 still describe `voth.html` as the Krator source.

### 2.7 Repository and pipeline *(medium)*

- **Generated data is committed and rewritten.** `data/cities` is 71 MB. `dredd2012-osm.json` is 16 MB and
  `mordor-osm.json` has six revisions in history. The store is 63 MB of loose objects, with no packs.
- **Generated or hand-edited, and nothing says which:**
  - `make-yellowstone.py` rewrites `yellowstone.json`, the config, from scratch, losing any hand edits.
  - Every other `<city>.json` is hand-edited and never read by its generator.
- **The `make-*.py` generators are copy-paste.** `q` is copied 11 times; `flat`, `rect`, `smoothstep` and
  `simplify` 8-9 times each. `make-yellowstone.py` re-implements fetching and simplification.
- **The `/data` mount serves `data/osm/raw/`** (561 MB) to the LAN.
- **`server.py`:**
  - reads the whole file on every gzip-cache hit (`:215`)
  - evicts its cache first-in-first-out
  - sends the same ETag for the gzip and plain bodies

### 2.8 Tests *(medium)*

**What they check:**
- The goldens compare only `lotHash`, which is layout.
- `doors` is null in every golden but Iziz's.
- The `seed` field is wrong in five goldens, but nothing reads it.

**How they run:**
- A fixed 12-second wait instead of a "build finished" signal, so heavy pages (dredd2012 has 145k lots) can
  fail falsely.
- Ports are derived from the seed, and `minastirith-3019` and `mordor-3019` collide.
- All 25 goldens run in series, which takes about 7-8 minutes.
- `probe.py` regenerates `build.js` as a side effect.

**What has no test:** backrooms, `iziz-b`, voth, krator, the Tongue and the front page.

## 3. What is good and should be kept

- Deterministic, seeded worlds with golden fingerprints: the thing that makes refactoring safe.
- `core/diag` (per-section error isolation, staged loading with notes) and `core/menagerie`, both used
  everywhere.
- Data-driven cities (`data/cities/*.json`), with the engine as a consumer of data rather than of code.
- The engine's extension points (`ctx.models`, `ctx.extras`, `API.onUI`). They are the right idea; they need
  a stable contract, not replacing.
- `server.py`: small, atomic reload, correct path containment.

## 4. Motion, collision and cameras: what a shared layer would look like

All the controllers fit one interface:

```
controller = { state, update(dt, input, world), apply(camera), toHash(), fromHash(params) }
world      = { solidAt?(p), collide?(p, r), floorAt?(x, z), ceilAt?(x, z) }
```

| Controller | Used by today | Collision it would take |
|---|---|---|
| `orbit` | engine, starship, the City | `unbury` against `solidAt` (the City's), optional |
| `walk` (first person, planar) | Backrooms, Iziz WALK | `collide` (Backrooms' circle against walls), `floorAt` / `ceilAt` |
| `cylinderWalk({axis, R, spin})` | Kyrene, B5 interior | `floorAt` as relief on the hull |
| `fly` | the City's fly, the Flesh Pit's free mode | refuses moves into `solidAt` |
| `aircraft` | `core/flight.js` | `groundH` / `roofAt` (already) |

A **controller stack** replaces `ctx.camFrame`: flight pushes, the Flesh Pit descent pushes, and leaving pops.
Keys come from one binding table with page overrides, so G, F and Shift mean one thing site-wide.

Agents get `core/agents.js`, a polyline sampler plus an instanced mover, which the seven life files and the
City's lifts and Builders can share.

## 5. Target structure

```
src/core/
  diag.js rng.js data.js menagerie.js wire.js          (as now)
  shell.js       boot, renderer (options: pixelCap, logDepth, clipping), resize, context loss,
                 error-isolated loop with animHooks and adaptive resolution, loading-overlay removal,
                 hint timer, HUD, mkBtn, views panel, card, wire + menagerie in one call
  hash.js        URLSearchParams read; throttled merge-write that keeps other keys; per-page key registry
  input.js       pointers, pinch, stuck-button guard, blur/visibility clearing, keys with modifier and
                 typing guards, one binding table
  controllers/   orbit.js walk.js cylinder.js fly.js aircraft.js (flight.js moves here); stack.js
  geom.js        mergeParts, ribbon, box/group helpers
  agents.js      polyline sampler, instanced movers
  layout.js      one lotList schema; every runtime calls it (never name a script "fingerprint": content blockers drop it)
src/engine/     explicit stage modules (export function ground(api) → named outputs) on core/shell;
                Chicago specifics move to data/cities/chicago.json or src/chicago/
src/iziz/       keeps its world-generation stages; its renderer, loop, wire, hash and controls come from core
src/voth/       see §6
tools/lib/      geom.py, osm.py, out.py, shared by the make-*.py generators
```

## 6. Voth: bringing it into the site's shape

The source is lost, so recover it rather than rewrite it:

1. **Freeze it first.** Add `window._iz.lotList` or equivalent from Voth's own `window._stats` / `_dbg` and a
   golden, `tests/golden/voth-<seed>.json`, before touching a line. Without it nothing can be proven.
2. **Recover the build (mechanical, no behaviour change).**
   - Split `BUILD()` along its fragment banners into `src/voth/stages/05-palette.js … 87-pathviz.js`.
   - Lift the CSS to `css/voth.css`.
   - Make `voth.html` a normal shell.
   - Generate the body with the same `tools/build-page.py` the engine and Iziz use; Voth becomes its third
     client.
   - The golden must not move.
3. **Join the site.**
   - Staged loading with `core/diag`, which means `BUILD` becomes async and yields between stages. The draw
     order does not change, so the golden should hold.
   - `installErrorHandlers`, the standard `#ui` / `#views` / `#card` / `#timebar` shell and `css/iziz.css`
     theming.
   - Hash state for the camera and view.
   - Replace its five `requestAnimationFrame` loops with animHooks on one loop.
4. **Move content to data.** `PAL`, `BUDGET`, world and sky constants, cantons, spans, causeways, the
   hand-placed polygons and `VIEWS` go to `data/cities/voth.json`, about 20 KB.
5. **Later, optionally:** shed the 970 KB of process commentary that points at files that do not exist; turn
   its orbit camera into `controllers/orbit`; give it the Krator lore from shared data instead of restated
   constants.

Alongside: rename `tools/build-voth.py` → `tools/build-krator.py`, and fix README:47/:423.

## 7. Still open from AUDIT.md

- three.js is still r128. The bump needs a visual re-tune of every page and should come after the core
  extraction, so that it is done once.
- The UI tail of Iziz is still outside `section()`, so an exception there means no frame renders.
- Named RNG streams for Iziz. Townsfolk still draw from the layout stream every frame.
- Streets rasterised to a typed array (two `getImageData` calls remain).
- The light-count reduction and the atlas shrink.

## 8. Plan

Each phase is a separate commit, must pass `./sitectl test` unchanged, and is independent enough to stop after.

| # | Phase | What | Risk | Size |
|---|---|---|---|---|
| 0 | **Safety net** | `window._buildDone` + probe polls for it (ceiling = `--wait`); free ports; run goldens 3 at a time; goldens for backrooms and `iziz-b`; a "loads without errors" check for voth, krator, the Tongue and the front page; `build-page.py --check` in `sitectl test`; `git gc` | none | S |
| 1 | **Voth freeze + recover** | §6 steps 1-2. Voth becomes a stage page like the others; nothing visible changes | low | M |
| 2 | **core/shell + core/hash** | Extract from the City and Kyrene first, then starship and the Backrooms, then the engine, then Iziz. Fixes context loss everywhere and stops hashes dropping `wire=` | low-med | M |
| 3 | **core/input + controllers + stack** | One binding table, consistent orbit direction and drag rate, pinch everywhere, the cylinder walker shared by Kyrene and B5, `camFrame` becomes a stack | **med**: this is the one users will notice; the table of bindings needs your sign-off | L |
| 4 | **Engine cleanup** | Chicago specifics to data; explicit stage modules with named outputs instead of one scope; the Flesh Pit's `ctx.pit*` onto a typed bus; Minas Tirith stops importing Mordor | med | L |
| 5 | **Iziz onto core** | Its renderer, loop, wire, hash and controls from core; world stages stay; `section()` round the UI tail; named RNG streams (moves Iziz's goldens once, deliberately) | med | L |
| 6 | **Voth joins the site** | §6 steps 3-4 | med | M |
| 7 | **Tools and repo** | `tools/lib/`; mark generated files; decide on committed `*-osm.json` (gitignore + regenerate, or LFS); server small fixes; keep `data/osm/raw` off the LAN mount | low | M |
| 8 | **three.js upgrade** | Once, on the shared core | med | M |

## 9. Decisions needed

1. **Voth's comment prose** (970 KB of the multi-agent process's notes): keep it as history, or strip it in
   phase 1?
2. **Controls:** one site-wide binding table (phase 3) will change what some keys and drags do on some pages.
   Which page's feel is canonical? The recommendation is the engine's orbit direction and the City's
   Shift/pan/pinch.
3. **Generated data in git:** stop committing `*-osm.json` (smaller repo; OSM cities then need their raw cache
   to rebuild), move it to LFS, or keep it and just `git gc`?
4. **Uncommitted work:** babylon5, backrooms, blame, yellowstone and the fleshpit changes are untracked or
   modified. They should be committed before phase 0 so that every phase starts from a clean tree.
