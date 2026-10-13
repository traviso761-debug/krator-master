# core/host: the host shell

One interface for every page (ROADMAP.md section 10; GODOT-PLAN.md Phase 1, "one host shell"): the camera, the frame loop
and its world clock, the panel and the probe, written once and taken by every build instead of each build's own copy.
Streetlab's Voth city plan is the template: its viewer is **copied and generalised** here (its own files are not edited;
the Voth and simulation branch owns them, and Streetlab switches to `core/host` when that branch pauses).
`streetlab-sources.json` records the blob of every Streetlab file this was copied from, and `python3 core/host/sources.py`
says which have changed since (port those changes by hand, then `--write`).

Every file here is `[web]`: the host owns the DOM, the input, the frame loop and the drawing call, and is not ported to
Godot (the clock it owns is `core/clock`, which is). A build's other fragments reach the page only through what they hand
`KHOST.take`, and host code never reads a build's globals (`PLAN`, `SL`, `VOTH`, `VC`, `BIO`, a kit's `VIEWS`...).

| File | What | From |
|---|---|---|
| `90-host-camera.js` | `KHOST.camera`: orbit (drag), pan (right-drag), fly (W A S D, Q / E, Shift, Ctrl), zoom (wheel), walk (F) with the feet on the ground or on a `KWALK` floor and a ledge guard, the pin (double-click; G flies to it, F walks from it, Esc lifts it), click to inspect, the depth range (opt-in), `setView` | `kits/catalog/krator-asset-engine.js` 85-207, `streetlab/targets/voth-city/58-vc-tools.js` (the pin, the walker), `core/city/50-city-host-streets.js` 13-19 (the depth range), the biome kits' `90-host-camera.js` (the spherical orbit their presets are written in) |
| `91-host-loop.js` | `KHOST.take`, the frame loop, the world clock (`KCLOCK`), `KHOST.on` subscribers with per-subscriber error isolation, the `TICKS` / hour-ticks / `_frameHooks` shims, `window._ready` | the biome kits' loops; `streetlab/.../55-vc-host.js` `VC.dayNight` (the clock) and `98-start.js` (the loading flow) |
| `92-host-panel.js` | the bar (`#bar`: title, hint, `#ui` with the view select and the hidden preset buttons, layers, time controls, export, legend), `#stats`, the inspector `#insp`, the error panel `#errs`, the loading note, foldable panels remembered per browser, `?chrome=0` | `streetlab/.../00-head.html` and `55-vc-host.js` (`VC.ui`, `VC.panels`, `VC.clockUI`), the biome kits' heads |
| `94-host-polytool.js` | opt-in (`khost.SHELL+['94-host-polytool.js']`): the authoring tools, Inspect, Polygon and Path, as buttons in the inspector panel; clicks reach it through `KHOST.clickHooks`; the sky (`sky.objects()`) is never a corner; `window.POLYTOOL` | seven biome kits' identical `src/93-host-polytool.js` (from `settlements/screamers/src/93-polytool.js`); the seed of 94 marks |
| `95-host-probe.js` | `window._api` for `verify.py --assert`: `BUDGET`, `REG`, `regOccupancy`, `nanSweep`, `typeStats`, `setView`, `views`, `go`, plus the build's own fields | the biome kits' `91-host-probe.js` |
| `host.py` | the file list (`SHELL`) and `resolve(PATH)` for a `build.py` | |

**Planned** (ROADMAP.md section 10): 93 inspect (reads `KTAGS.page`), 94 marks (from the polytool), 96 picture menu and sheet, 97 minimap
(moved from `core/minimap/88a`), 98 edit modes (emit `core/edits` operations), 99 cutaway; `host.py` inlining a build's edits.

## The contract

A build makes its world, then makes one call from a fragment that sorts after the shell (the biome kits use
`src/99-host-take.js`):

```js
const H = KHOST.take({
  build: 'hyperjungle', title: '...', hint: '...',     // the localStorage key, the bar's title and its first line
  scene, camera, renderer,                             // the build's own (omitted: the host makes them)
  ground: terrainH,                                    // terrainH(x,z) or a KFIELD (its .h): the camera's floor, the pin, the walker
  floor, clear, clampCam, maxR, minR, eye, walk, walker, depth,   // camera options (below)
  registry: REG,                                       // [{name, x, y?, z, r, h}]: the inspector and the probe
  views: VIEWS, onView: name => {}, start: 'name',     // {name: [cx,cy,cz,tx,ty,tz]}; onView runs before a preset is set
  sky: {follow(camera) {}, hour(h) {}, objects() {}},  // kept on the eye each frame; hour(h) only if the sky has hours;
                                                       // objects(): what it is made of (a 'sky' layer, never a polygon corner)
  ticks: TICKS,                                        // [fn(dt, seconds)]: the biome kits' list, read live each frame
  hourTicks, frameHooks,                               // [fn(dt, hour)] (the life builds), [fn(nowMs)] (Streetlab's _frameHooks)
  draw: (scene, camera, dt) => {},                     // the build's own draw in place of renderer.render (a post pass)
  click: (x, y) => false,                              // the build takes a click first (true: taken; a click-to-light)
  clock: {hour: 12, running: false, scale: 1, speeds: [0, 1, 2, 4, 8]},
  layers: {name: {on, match(o) | objects() | set(on)}},
  inspect: hit => 'words',                             // the inspector's words for the first hit (default: registry name, label, position)
  stats: () => 'more lines',                           // added to the stats panel
  controls: [el | {button, on} | {select, on}],        // a build's own controls, after the view select in #ui
  keys: {n: e => {}},                                  // a build's own keys (they win over the camera's for that key)
  exporters: {biome: () => BIO.export()},              // an export button each: <build>.<name>.json
  legend: [['#c9a227', 'a lot']],
  budget: BUDGET, types: () => BIO.stats, regHas, probeSample,   // the probe (95)
  api: {hostChecks, hostNegatives, get totals() {...}, biome: () => ...},   // the build's own window._api fields
});
// H = {clock, camera, renderer, scene, ctl, cam, setView, go, err, on}
KHOST.on((dt, clock) => {...});          // a new subscriber: phase 'tick' (default), 'view' (after the camera), 'after'
```

A build without a piece of data loses only that feature: no `views`, no view select; no `registry`, the inspector names the
mesh and the probe has no volumes; no `sky.hour`, no hour slider; no `exporters`, no export row.

**The loop, per frame:** real seconds since the last frame (capped at 0.1) step the clock; the camera's keys move it; then
`ticks` as `fn(clock.dt, clock.t)`, `hourTicks` as `fn(clock.dt, clock.hour)`, `frameHooks` as `fn(clock.t*1000)`, and the
`KHOST.on` tick subscribers as `fn(clock.dt, clock)`; the camera is placed and clamped; `sky.follow(camera)` and the view
subscribers (a runtime LOD); the hidden layers are hidden; the draw; then the after subscribers and the panel. A subscriber
that throws is reported once to `#errs` with its stack and skipped from then on; the rest run. `window._ready` is set right
after the first frame, as the biome kits' loops did.

**The `TICKS` shim's second argument is motion time.** The biome kits' loops passed `performance.now()/1000`: seconds
since the page was opened, the build included. The host passes the clock's `t`, seconds of motion since its loop began,
so the pause and speed buttons and `?t=` reach every tick. A tick that animates by that absolute time (shighlands' mist
drift, swbay's and nwbay's birds) stands at another phase at a given moment than it did; with motion time frozen
(dt 0, t 0) the pages draw the same frame as before, which is how the adoptions were proven.

**The clock** is `core/clock`'s `KCLOCK` (`host.py` lists `20-core-clock.js` with the shell): motion time `t` (wind, fauna,
anything that eases) runs at the speed buttons' rate (pause, 1x to 8x); the world hour is held at `clock.hour` (12) unless
`?time=run` or the run button (shown when the sky takes an hour). Query: `?hour=7.5` (or `#hour=`), `?time=run`, `?t=12`
pins motion time (repeatable shots).

**The camera.** The orbit is the biome kits' spherical one (`theta` from +z about +y, `phi` from +y, `radius`), kept to the
bit, so every preset view is the same picture. The eye is kept `clear` metres (1.8) above `floor(x,z)` (default `ground`;
a kit with water passes the higher of the two), or a build's own `clampCam(position, target)`. Walking (F) stands the eye `eye`
(1.7 m) over the ground, or over the highest `KWALK` floor a step can reach with Streetlab's ledge guard when `walk` is a
`KWALK` registry. `depth: true` (or `{k, min, max}`) makes the near plane follow the camera's height above the ground,
as Streetlab's does; it is off by default, because a page whose pictures are proven keeps its near plane.

**The keys** (one keymap): W A S D move, Q / E down and up (Space up), Shift faster, Ctrl or Alt slower, F walk (from the pin
when there is one), G fly to the pin, Esc lift the pin. Mouse: drag orbit (walking: look), right-drag pan, wheel zoom
(walking: speed), click inspect, double-click drop the pin. A build's `keys` win for their key (record a clash in its
`KNOWN_ISSUES.md`). Alt+click is left to `tools/edits`. Nothing moves while an input has the focus.

**The chrome.** `#bar` top left, `#stats` top right, `#insp` bottom left, `#errs` bottom right (shown only with something in
it). Each panel folds to its title, remembered per browser and build (`localStorage['khost-panels:<build>']`, wrapped in
try/catch). `?chrome=0` hides every panel (a build's own element joins them with the class `khost-chrome`); `#errs` still
shows an error. `KHOST.chrome(on)` does the same from a script.

## The verify contracts kept

- `setView(cx,cy,cz,tx,ty,tz)` (`window._api.setView`, `KHOST.setView`): the same arithmetic as the biome kits'.
- the preset buttons: `#ui button` with the view's name, one per view, hidden; a build's controls (Day, Night, Erupt) are
  `#ui` buttons too, as before.
- `window._ready` after the first frame; `window._api` with the fields the kits' `verify.py` `ASSERT_JS` reads (`BUDGET`,
  `REG`, `regOccupancy`, `nanSweep`, `typeStats`, `totals`, `hostChecks`, `hostNegatives`, `views`, `setView`, and each kit's
  own); `window._registered`; `#errs`; the global `renderer` the build already declares (`STATS_JS` reads it).
- No new `window._*` counters: `verify.py` prints every `window._*` value, so the host adds none.

## Streetlab onto core/host (for the Voth branch, when it pauses)

What Streetlab's city plan (`settlements/streetlab/targets/voth-city/`) calls today, and what it calls on the shell. Read-only
here: nothing in Streetlab was edited (the files and their blobs are in `streetlab-sources.json`).

| Streetlab today | core/host |
|---|---|
| the engine's `ctl` (`az`, `el`, `dist`, `target`, `walk`), `updateCamera()`, `window._setWalk` | `KHOST.cam.ctl` (`theta` = `az`, `phi` = pi/2 - `el`, `radius` = `dist`), `KHOST.cam.apply()` each frame, `KHOST.cam.walk(on)` |
| `HOST.setupStage`'s depth-range frame hook (`core/city/50-city-host-streets.js` 13-19) | `KHOST.take({depth: true})` |
| `VC.PIN`, `VC.pinDraw/pinGo/pinWalk`, the dblclick, G and F (58-vc-tools.js) | `KHOST.cam.pin`, `pinDraw/pinGo/pinWalk`; the keys are the host's |
| `VC.standY/standPick` on `KWALK`, the walker's frame hook with `TUNE.walk` | `KHOST.take({walk: KWALK, walker: TUNE.walk})`; `KHOST.cam.standY` |
| `VC.clock = KCLOCK.make(...)`, `VC.clockUI()`, `#clk`, `#clk-run`, `#clk-speeds`, `#clk-hour` | the loop's clock (`H.clock`), `KHOST.take({clock: TUNE.clock, sky: {hour: VC.applyHour}})`; the same ids |
| `(window._frameHooks = ...).push(fn(now))` | `KHOST.take({frameHooks: window._frameHooks})`, or `KHOST.on(fn(dt, clock))` |
| `VC.panels()` (`voth-city-panels` in localStorage) | every `.pnl` folds (`khost-panels:<build>`) |
| `#bar` layer buttons (`HOST.layers`, `#ly-*`) | `KHOST.take({layers: {name: {on, set(on)}}})` |
| `#legend` (`HOST.COL.lot`, `VC.ROLECOL`) | `KHOST.take({legend: [[colour, label]...]})` |
| `#export` (`SL.exportPlan()`) | `KHOST.take({exporters: {plan: () => SL.exportPlan()}})` |
| `#loading` and `vcGo` (98-start.js) | `KHOST.loading(text)`; `KHOST.take` clears it |
| `window._vc` (`ready`, `plan`, `log`, `stats`, `setStep`) | `KHOST.take({api: {...}})` adds them to `window._api`; `_ready` is the host's |
| `#stats` (`VC.stats()`), `#tip` and the inspector (`VC.describe`, `i`) | `KHOST.take({stats})` for lines; the hover tip and the step table wait for 93 inspect |
| marks, the editor, the cutaway, the paths view, the minimap | 94 marks, 98 edit modes, 99 cutaway, 97 minimap (ROADMAP.md section 10, steps 2 to 6) |

## Adopting it (a biome kit)

1. `build.py`: after `CORE_BIOME`, `sys.path.insert(0, <core/host>)`, `import host as khost`, `CORE_HOST = khost.SHELL`,
   `khost.resolve(PATH, CORE_HOST)`.
2. Delete `src/90-host-camera.js` and `src/91-host-probe.js` (a `src/` file with a shell file's name would override it).
3. Move the views, the inspector's words, the budgets and the kit's checks into `src/99-host-take.js`, ending in `KHOST.take`.
4. `00-head.html`: drop `#ui`, `#cap`, `#insp`, `#hud` and their styles; keep `#errs` (the stage fills it during the build,
   before the host loads).
5. Prove it: `verify.py --assert` the same as before, screenshots of two presets the same with `?chrome=0`, the smoke test,
   the baked geometry unchanged (`core/README.md`, "Proving a change").

**Used by** (2026-10-12) all sixteen biome kits: `biomes/hyperjungle`, `crater-drylands`, `eastabyss`, `ebadlands`,
`ehighlands`, `geyser`, `nhighlands`, `nwbay`, `nwlowlands`, `rift`, `sedesert`, `shighlands`, `swbay`, `swlowlands`,
`throne`, `xanadu`. The seven of them that had the polygon tool take `94-host-polytool.js`. The Throne is eleven pages
(station 1 from `src/99-host-take.js`, each of its ten stations from its own `stations/<name>/99-host-take.js`); the
caldera and the tube draw through `draw` (their `HEAT.render`), the tube keeps its own `clampCam`, and the five stations
with a weather select put it in `KHOST.ui` after the take. Next (ROADMAP.md section 10, step 2): Girder.
