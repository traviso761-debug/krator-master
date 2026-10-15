# core/host: the host shell

One interface for every page (ROADMAP.md section 10; GODOT-PLAN.md Phase 1, "one host shell"): the camera, the frame loop
and its world clock, the panel and the probe, written once and taken by every build instead of each build's own copy.
Voth's city plan (`settlements/voth`, built in Streetlab until 2026-10-14) is the template: its viewer is **copied and
generalised** here (its own files are not edited; the Voth and simulation branch owns them, and Voth switches to
`core/host` when that branch pauses). `voth-sources.json` records the blob of every Voth file this was copied from, and `python3 core/host/sources.py`
says which have changed since (port those changes by hand, then `--write`).

Every file here is `[web]`: the host owns the DOM, the input, the frame loop and the drawing call, and is not ported to
Godot (the clock it owns is `core/clock`, which is). A build's other fragments reach the page only through what they hand
`KHOST.take`, and host code never reads a build's globals (`PLAN`, `SL`, `VOTH`, `VC`, `BIO`, a kit's `VIEWS`...).

| File | What | From |
|---|---|---|
| `90-host-camera.js` | `KHOST.camera`: orbit (drag), pan (right-drag), fly (W A S D, Q / E, Shift, Ctrl), zoom (wheel), walk (F) with the feet on the ground or on a `KWALK` floor and a ledge guard, the pin (double-click; G flies to it, F walks from it, Esc lifts it), click to inspect, the depth range (opt-in), `setView` | `kits/catalog/krator-asset-engine.js` 85-207, `settlements/voth/targets/voth-city/58-vc-tools.js` (the pin, the walker), `core/city/50-city-host-streets.js` 13-19 (the depth range), the biome kits' `90-host-camera.js` (the spherical orbit their presets are written in) |
| `91-host-loop.js` | `KHOST.take`, the frame loop, the world clock (`KCLOCK`), `KHOST.on` subscribers with per-subscriber error isolation, the `TICKS` / hour-ticks / `_frameHooks` shims, `window._ready` | the biome kits' loops; `settlements/voth/.../55-vc-host.js` `VC.dayNight` (the clock) and `98-start.js` (the loading flow) |
| `92-host-panel.js` | the bar (`#bar`: title, hint, `#ui` with the view select and the hidden preset buttons, layers, time controls, export, legend), `#stats`, the inspector `#insp`, the error panel `#errs`, the loading note, foldable panels remembered per browser, `?chrome=0` | `settlements/voth/.../00-head.html` and `55-vc-host.js` (`VC.ui`, `VC.panels`, `VC.clockUI`), the biome kits' heads |
| `94-host-polytool.js` | opt-in (`khost.SHELL+['94-host-polytool.js']`): the authoring tools, Inspect, Polygon and Path, as buttons in the inspector panel; clicks reach it through `KHOST.clickHooks`; the sky (`sky.objects()`) is never a corner; `window.POLYTOOL` | seven biome kits' identical `src/93-host-polytool.js` (from `settlements/screamers/src/93-polytool.js`); the seed of 94 marks |
| `95-host-probe.js` | `window._api` for `verify.py --assert`: `BUDGET`, `REG`, `regOccupancy`, `nanSweep`, `typeStats`, `setView`, `views`, `go`, plus the build's own fields | the biome kits' `91-host-probe.js` |
| `93-host-inspect.js` | the inspector, record-driven: the smallest core/tags record holding the point under the pointer (indexed in `core/space`), worded by `KTAGS.label` or the build's `o.inspect`; I for the hover tip, a click for the card, a mark round it; `KHOST.recordAt`, `KHOST.selected` | `55-vc-host.js` 413-501 (the tip on I), but reading core/tags, not a build's lots |
| `93-host-stocks.js` | **what things hold and the settlement's stocks, Voth's interface as the standard** (the owner, 2026-10-15): the inspector's contents (a place's store, what it makes from what, its household's food, what it sells; a container's place; a citizen's things) and the stocks panel (O): total, at the site, in transit, in storage, owned, change per day, days of cover, low / out / wanting, flows, the twelve holding most, a holder flown to; `KHOST.simHolds(SIM)` makes `o.holds` from core/simulation | `56e-vc-stocks-host.js`, `56d-vc-inspect-host.js` (`VC.thingsHTML`), `00-head.html` (the panel's look) |
| `94-host-marks.js` | marks: areas, lines and points, named, noted, measured, each point on the surface it was clicked (P); kept in the browser and saved to `<build>/marks.json` through `tools/edits/serve.py` | `57-vc-marks.js` |
| `96-host-pictures.js` | the picture menu: the build's palette as a grid with a filter and families, each picture drawn off screen two a frame | `58-vc-tools.js` 209-264 |
| `97-host-minimap.js` | the minimap (M) filled from the records and the ground's relief, through core/minimap's `KMAP` (the panel stays in `core/minimap/88a` while Voth reads that folder) | `core/minimap/88a` |
| `98-host-edit.js` | edit modes: select, place, plant, move, turn, remove (B; Delete, M, Q / E, Ctrl+Z), every edit a `core/edits` op previewed through the build's world adapter; an op the build can only apply when it is made is marked and applies on reload; save to `<build>/edits.json`, export, import, a draft per browser | `58-vc-tools.js` 137-378, `59-vc-flora-edit.js` |
| `99-host-cutaway.js` | the cutaway (X): five clipping planes on a unit's box above the storey cut, the storey bar (] [ PageUp PageDown, Shift + wheel); the planes are set on the first cut only | `56-vc-interiors-host.js` 222-318 |
| `host.py` | the file lists (`SHELL`, and `FULL`: the shell, 93 to 99, `core/edits`, `core/space`, `core/minimap`), `resolve(PATH)` for a `build.py`, and `edits_js(dir, build)`: a page's `edits.json` (or a newer browser draft) as `KHOST_EDITS` | |
| `example/` | the reference for the whole interface: a toy economy on core/simulation (its own test's world) in three.js, every piece above on it; `python3 build.py`, `python3 check.py` (14 checks, each with a negative) | |

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
  hourTicks, frameHooks,                               // [fn(dt, hour)] (the life builds), [fn(nowMs)] (Voth's _frameHooks)
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

## The whole interface (93 to 99; ROADMAP.md section 10, step 2 on)

A build takes `host.FULL` and hands the take more (`example/98-take.js` is the reference, Girder's `src/98-start.js` the first
settlement):

```js
KHOST.take({ ...,
  records: () => [...],                    // what the inspector, minimap and editor read (default KTAGS.page's records)
  inspect: (hit, hits, rec) => 'words',    // rec: the smallest record holding the hit (93), or null; null words: the label
  holds: KHOST.simHolds(SIM, {idOf(rec, hit), containerOf(rec), card(id), placeName(id), paused()}),   // 93-host-stocks.js
  palette: {items: [{key, name, family, cls?, tags?}], build(key) -> Object3D},                       // 96 pictures
  edits: {world: {find, add, move, set, remove}, log: KHOST_EDITS, deferred(op), template(item, at, ry), canEdit(rec),
          brushes: {modes: ['raise', 'lower', 'flatten', 'smooth'], r: [min, max, start], strength: {mode: start}}},  // 98
  cutaway: {units: [{id, name, x, z, ry?, w, d | r, levels: [{y, h, name?}]}], cutAt: 1.4, show?(unit, i)},          // 99
  minimap: true | {frame, size, relief, palette, title, draw(M)},                                                    // 97
  marks: false,                                                            // 94 is on unless a build turns it off
});
```

**What things hold, the standard** (Voth's 56e, the owner 2026-10-15). `o.holds` is read, never a build's globals: `contents(id)`
in `SIM.contents`'s shape (`core/simulation/SCHEMA.md`, "What things hold, and the stocks"), `stocks()` in `SIM.stocks`'s,
`holders(item, top)`, `whereIs(id)`, `placeAt(x, z, r)`, and a build's `idOf(rec, hit)` (which simulation ids a picked record
is: a lot's places, a clicked citizen) and `containerOf(rec)` (the place a chest or a stall belongs to: the simulation keeps
stock by place, not by piece). `KHOST.simHolds(SIM, extra)` builds it from core/simulation. The panel and the contents are
the ones Voth shows, in its words and colours: the states (at the site, in transit, in storage, owned), the change at one
midnight against the one before (`today` before a whole day), days of cover, low (amber) and out (red), the flows (made,
imported, exported, drawn from the stores, of it into households' stores, eaten at home, used up; an item's bought, issued,
worn out, broken), the twelve holding most, a click flying there. The panel reads on open, then every 4 s while the
simulated minute moves; paused, only by refresh. A build without an economy hands no `holds`: no panel, no contents.

**The editor's ops** are `core/edits`'s (ADD, MOVE, SET, REMOVE, targets by core/tags uid). The build owns how an op is
shown: the world adapter applies it live (a piece drawn on its own), or `deferred(op)` says it can only be applied as the
world is made (a piece merged into a batch), and the editor marks it; the build applies `KHOST_EDITS` as it builds (Girder:
`53-furnish.js gfVetoed` skips a moved or removed piece at draw, `98-start.js` applies the log once its interiors are
furnished). Save writes `<build>/edits.json` (POST `/__save` on `tools/edits/serve.py`); the next build inlines it
(`host.edits_js`, the fragment `39-host-edits.js`); a browser draft newer than the file wins until it is saved.

**The keys** of the whole interface: I hover tip, P marks, B editor (Delete, M, Q / E, Ctrl+Z, Esc; in ground mode ] [ the radius), X cutaway (] [), M
minimap, O stocks; with the camera's W A S D, Q / E, F, G, Esc. A build's own `keys` win for their key.

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
`clock.obj` adopts a clock the build already made (a `KCLOCK`: Voth's `VC.clock`) instead of making one; `clock.maxStep`
caps the clock's step a frame (default 0.1 s, the camera's cap; `Infinity` steps it by the real frame); `clock.onSet(h)`
is called when the hour slider moves it (the slider shows when `onSet` is given, or the sky takes an hour).

**The camera.** The orbit is the biome kits' spherical one (`theta` from +z about +y, `phi` from +y, `radius`), kept to the
bit, so every preset view is the same picture. The eye is kept `clear` metres (1.8) above `floor(x,z)` (default `ground`;
a kit with water passes the higher of the two), or a build's own `clampCam(position, target)`. Walking (F) stands the eye `eye`
(1.7 m) over the ground, or over the highest `KWALK` floor a step can reach with Voth's ledge guard when `walk` is a
`KWALK` registry. `depth: true` (or `{k, min, max}`) makes the near plane follow the camera's height above the ground,
as Voth's does; it is off by default, because a page whose pictures are proven keeps its near plane.

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

## Voth onto core/host (for the Voth branch, when it pauses)

**Step 6a (2026-10-15): the shell.** Voth takes 90 camera, 91 loop, 92 panel and 95 probe (`build.py` `CITY_JS`;
`targets/voth-city/97-vc-host-take.js`, `VC.hostTake`). The catalog engine stands down when `window.KRATOR_HOST` is set
(`kits/catalog/krator-asset-engine.js`: no input listeners or loop of its own, `updateCamera` is `KHOST.cam.apply()`,
`_setWalk` is `KHOST.cam.walk`); the engine's `ctl` reads and writes the host's (`az` = `theta`, `el` = pi/2 - `phi`,
`dist` = `radius`). The loop adopts `VC.clock` (`clock.obj`, `maxStep: Infinity`, the slider's `onSet` is `SIM.jump` and
`VC.applyHour`). Proof: the placement hash a1a7f008 and every layout check as before (the two failures predate it,
HANDOFF.md); the simulation's state hashes the same at load and after its first minute. The verify's simulated-day
statistics differ by under 0.01%: they depend on how long the page ran live before the check (the old page alone, run
at once or after 8 s: 11,359 or 8,127 decisions in the day), so a page whose load takes a different time reads
differently. **6b** (the rows below from the inspector on: 93, 94, 96, 98, 99, the stocks) is next.

What Voth's city plan (`settlements/voth/targets/voth-city/`) calls today, and what it calls on the shell. Read-only
here: nothing in Voth's targets was edited (the files and their blobs are in `voth-sources.json`).

| Voth today | core/host |
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
| `57-vc-marks.js` (`VC.MK`, p, `/save/voth-city-marks`) | 94 marks (P, `/__save` kind marks) |
| `58-vc-tools.js`'s editor (`VC.ED`, b, `/save/voth-city-edits`, undo as closures, deletions by position) | 98 edit modes over `o.edits.world`: `core/edits` ops by uid (the converter `KEDITS.fromStreetlab` reads the old file) |
| `58-vc-tools.js`'s picture grid (`VC.edGrid`, `VC.thumbsStart`) | 96 pictures over `o.palette` |
| `59-vc-flora-edit.js` | 98's plant mode (palette items with `cls: 'flora'`) and remove; Voth's per-tree hiding stays its world adapter's |
| `56-vc-interiors-host.js`'s cutaway (`VC.cutTo`, x, the bar) | 99 cutaway over `o.cutaway.units` (56b's cut of every building in view is not ported) |
| `56e-vc-stocks-host.js` (o, `VC.STK`), `56d`'s `VC.thingsHTML` | 93-host-stocks.js over `o.holds = KHOST.simHolds(SIM, {idOf: lot -> its 'ix.<unit>' places, containerOf: a furniture pick's place, card: VC.actorHTML})` |
| the paths view | not yet (Girder keeps its own `87-pathviz.js`) |

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
with a weather select put it in `KHOST.ui` after the take. **Girder** (2026-10-15, step 2) takes the whole interface (`FULL`): its camera, loop, panel and probe are the host's, its sites and
interior pieces core/tags records, with the inspector, marks, pictures (its catalog pieces; planters are flora), minimap,
editor (pieces drawn on their own; the page's own pieces moved or removed on reload) and cutaway (the four towers' thirty
storeys, the houses, the hall); `verify.py --assert` holds, the scene census at four views matches the old page's within
its own run-to-run noise (`settlements/girder/KNOWN_ISSUES.md`).

**Iziz and Highlands** (2026-10-15, step 3) take `FULL` without `core/space` (the hyperjungle's scatter takes its grid when the
module is on the page) and without `core/edits` (no editor world yet): their camera was already the host's convention (theta
from +z), so `src/92-camera.js` keeps only `ui`, `uiButton`, `setView` and the Labels button, and `src/99-start.js` is the take
(`FRAME_HOOKS` as before, `f(dt, ms)`, in a tick subscriber; the showcase sky after the camera). Iziz's records are its full
registry (`91t-iziz-tags.js`); Highlands adds its sites to the furniture's registry (`91h-hl-tags.js`). The vernacular sheet,
the city and the Highlands rows match the old pages' scene census exactly; Roketstad within its own run-to-run noise. The
builds that vendor that camera (Dalab, Xanadu, Reed Lake) keep the old one until step 5 (their `KNOWN_ISSUES.md`).

**Fauna mode and the ground brushes** (2026-10-15, step 4), first on **Sedesert** (the one build with a `KFIELD`): 98 gains a
*fauna* mode (palette items with `cls: 'life'`: Sedesert offers `kits/fauna`'s desert group, its own animals first; each put
down is drawn by `KratorFauna.build`, registered as a core/tags `life` record and animated by `KratorFauna.animate` on the
host's motion time) and a *ground* mode (`o.edits.brushes`): raise, lower, flatten, smooth, a radius and a strength, a ring
on the ground under the pointer; a click is a stroke and a held drag paints strokes (the camera's drag is held off). A stroke
is a `core/edits` ADD of `{class: 'feature', kind: 'ground', key: mode, at, r, strength}`; the build's world adapter applies it
with `core/terrain/31-core-field-brush.js` (`KFIELD.stroke`, [G data], `node core/terrain/test-brush.js`) and lifts its drawn
ground; undo, a move or a removal of a stroke replays the strokes left from a snapshot of the field as baked (strokes do not
commute). Proof on Sedesert: the scene census unchanged at four views; a deer placed, animated, re-seated by a stroke; a drag
of twelve moves nine strokes and no orbit; every stroke undone, the field equals the baked heights bit for bit. Next: step 5
(the rest), step 6 (Voth).
