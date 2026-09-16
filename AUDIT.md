# City of Iziz: architecture audit

> **Outcome (same day).** Everything in §6 and steps 1–5 of §7 is done, plus a second data-driven city
> (`?city=iziz-b`) and a second engine page (`chicago.html`). See the README for the new layout. What is
> **not** done, on purpose: the three.js version bump (needs a visual re-tune of every light and
> material, §3.7), the light-count reduction (§2.5, look-sensitive), the atlas shrink (§2.6) and
> wrapping the UI tail in `section()` (§3.2). Line numbers below refer to the single-file page as it
> was; the same code now lives in `src/iziz/stages/`.

Date: 2026-09-16. Covers `server.py`/`sitectl`/`site.toml`, `iziz.html` (the city model), and
`The-Izani-Tongue_2.html`. Line numbers refer to `iziz.html` as of this date (4232 lines, 467 KB).

## Verdict

The city page is a well-crafted single-file program: deterministic, staged loading with yielding,
per-section error isolation, adaptive resolution, accessible UI. It is also at the practical limit of
the single-file shape. Everything (about 4100 lines, 559 top-level constants, 205 functions) lives
inside one `async function build()` closure, sections talk to each other through 104 `window._*`
globals, content (lexicon, lore, city parameters, views) is embedded in code, and the same lexicon is
maintained by hand in two files that have already drifted.

Recommendation: **do not rewrite**. Do the four cheap rendering fixes first (a day's work, roughly
20–40 % of GPU frame time back), put the project under version control, then split the file into
ES modules and data files in the incremental order in §7. The existing server already supports the
folder mounts that the split needs; no bundler is required.

The single biggest risk today is not performance. It is that the whole project is one hand-edited
467 KB file with no version control and no backups.

## 1. Measurements

Taken on this machine (Adreno X1-45 GPU) in headless Firefox, 1366×682 CSS px, default seed, after
40 s of running.

| Metric | Value | Note |
|---|---|---|
| Draw calls / frame | 493 | |
| Triangles / frame | 1.95 M | terrain alone is 259 k |
| Shader programs | 145 | includes shadow-pass variants |
| Scene objects | 911 | 217 InstancedMesh, 450 Mesh, 13 Points |
| Instance slots allocated / used | 192 k / 86 k | 45 % unused, ~5 MB of matrices |
| Objects with frustum culling off | 233 | every instanced set and every particle system |
| Textures on GPU | 33 | ~38 MB est. + 64 MB shadow map |
| Adaptive resolution settled at | 0.7 | started at 1.5; the GPU could not hold 45 fps above 0.7 |
| Frame time at 0.7 | 17 ms p50, 19 ms p95 | vsync-locked at 60 |
| City build time | 0.84 s | 37 stages; largest: terrain+streets+landmarks 403 ms, stairs 115 ms |
| Page transfer | 467 KB + 1.08 MB PNG | 159 KB if gzipped; the PNG would be ~100 KB as JPEG/WebP |

The resolution drop is the key number: on this hardware the page is GPU-bound and buys its 60 fps by
rendering at half the pixels. The causes are in §2.

## 2. Rendering: findings ranked by payoff

Effort: S = under an hour, M = an afternoon, L = a day or more.

### 2.1 Shadow pass (S, biggest win)

`renderer.shadowMap.type=PCFSoftShadowMap` with a 4096² map (L423, L441). The shadow section
(L3494–3498) sets `castShadow` on every opaque lit mesh unless it is marked `noShadow`. Jungle trunks,
tiers, blobs and fronds (L1781–1784, ~40 k instance slots) are not marked, so they are submitted to the
shadow pass every time although they sit outside the ±260 shadow box. Because culling is off (§2.2)
they cannot be skipped. `shadowsDue()` (L4215) redraws the map every other frame while idle and every
frame while the orbit target moves (pan, walk, follow, tour).

Fix: 2048² map, `PCFShadowMap`, mark the jungle sets and moss `noShadow`, and only redraw when the
target has moved more than ~0.5 units or every third frame. Expected: 20–40 % of GPU frame time and
48 MB of GPU memory. Risk: slightly softer contact shadows.

### 2.2 Frustum culling disabled on every instanced mesh (M)

L3542: `scene.traverse(o=>{if(o.isInstancedMesh)o.frustumCulled=false;})`, plus per-set
`frustumCulled=false` on all particle systems and moving sets. The reason is sound (r128 culls an
InstancedMesh by its base geometry's bounds, not its instances), but the effect is that all 217
instanced draws and all 13 particle draws are issued every frame whatever the camera looks at,
including in the shadow pass.

Fix: after build, compute a bounding sphere per static InstancedMesh from its instance matrices and set
`geometry.boundingSphere` on a per-mesh clone; for the largest sets (boxes 9000, window strips 16000,
cornices 6000, roofBits 7000, fronds 16000, stairs 24000) split into 4–8 angular sectors at build time so
the culling has something to reject. Keep moving sets unculled. Expected: 30–60 % fewer vertices when
looking at part of the city (street level, walking, touring). Risk: wrong bounds pop objects out.

### 2.3 Shaders compile after the loading screen is removed (S)

`#loading` is removed at L4220 and `animate()` starts at L4227 in the same task; no `renderer.compile()`
anywhere. All 145 programs compile inside the first `render()`, so the user sees the loading text
vanish and then a 0.5–3 s freeze on integrated GPUs. Display modes also compile lazily: `clayFor`
(L3664) and `buildWire` (L3647) create their materials on first toggle, so the first switch hitches; the
painting-print material compiles when `image.png` arrives (L2571).

Fix: a final `await stage('shaders')` that calls `renderer.compile(scene,camera)` and pre-creates the
clay and wire materials before removing `#loading`. Expected: the freeze moves behind the loading text.

### 2.4 Point-sprite fill rate (S)

Mist (420 sprites up to 400 px each), fog bank (700 up to 420 px), glow and smoke (L3362–3414,
L3499–3523) are additive quads, never culled, and drawn whenever their intensity is above ~0.05. At
dawn or in fog that is several full-screen overdraws per frame, which is exactly where an integrated
GPU suffers. Fix: skip the draw below 0.06 intensity, cap `gl_PointSize` at ~200, halve the count when
the pixel ratio is below 1.

### 2.5 Light count in every lit shader (M–L)

Roughly 16 PointLights and 11–13 SpotLights exist from load (floods, braziers, port, freighter cab,
concert, masts, forest and gate spots; L2371–3203). r128's Lambert shader evaluates every one of them
per vertex, including on the 130 k-vertex terrain, even at intensity 0. Cut to a handful of real lights
and fake the rest with emissive/glow (the code already has `MOAT_POOLS`/`BOAT_POOLS` custom pools).
Never toggle a light's `visible` at runtime: changing the light count recompiles every program.

### 2.6 Smaller items

- HUD text, time slider and label are written to the DOM every frame (L3054, L3062). Throttle to
  ~5 Hz and skip if unchanged. (S)
- Instance buffers are allocated at capacity and never trimmed; `buildWire` (L3650) duplicates them
  at full capacity again. Slice to `count*16` after build. (S–M, ~5–8 MB)
- Pigeons call `updateMatrixWorld(true)` three times per bird per frame (L2619–2620), ~210 matrix
  recomputes a frame. Compose the matrix directly. (S)
- The Izani script atlas is 2048² (~22 MB) for 320 text quads (L299). 1024² or packing only used
  regions saves ~16 MB. The ground colour and mask canvases are read back with `getImageData` four
  separate times (L520, 532, 1861, 2800): read once and share. (M)
- Terrain is a 360×360 plane (259 k triangles) always drawn at full detail. A coarser mesh outside
  the walls, or a 2-level split, would halve it. (M)
- Per-frame instance uploads (townsfolk 340×2, soldiers ~90, crowd 160×2, lanterns 120, birds 48×3,
  caravans ~220, fireworks 5000 during a show) re-upload the whole buffer each frame; none use
  `updateRange`. Fine at today's counts, worth doing before the population grows. (M)

Verified as fine: no per-frame allocations of THREE objects in any of the 47 animation hooks; no
raycasting per frame; no timers or listeners leaking; audio does zero work when off; adaptive
resolution and WebGL context-loss recovery already exist.

## 3. Code architecture

### 3.1 One closure, one file

- Only six things are at script scope (L98–110). Everything else, including the render loop, is inside
  `build()` (L114–4228). Nothing is importable, testable outside a browser, or reusable by the Tongue
  page.
- Sections communicate through **104 `window._*` globals** because `section(name, fn)` closures cannot
  export constants. About 40 are write-only debug handles. Readers use optional chaining
  (`window._bridgeY?`, `(window._wellPos||[])`), which doubles as the failure-tolerance protocol.
- Temporal coupling exists: `festF` is defined at L3289 but called from hooks registered at L1878; it
  works only because hooks run after build finishes. `SEWER` is an empty object at L834 filled at
  L1312 and read at L3703 and L3797.

### 3.2 Error isolation is only partial

`section()` guards 37 blocks (2319 lines). **1799 lines are unguarded**, including everything from the
RNG to phase 2 (L111–1106) and everything from the sky to the render loop (L3541–4228). A throw
anywhere in those rejects `build()`, and because `animate()` is inside `build()`, **no frame is ever
rendered**: the user sees a black page with a red stack trace. A UI bug should not be able to black
out the city.

### 3.3 Determinism is fragile

The seed feeds one Park–Miller stream (`rnd()`, L124) consumed in file order: noise permutation → terrain
canvas → detailing → **phase 1 lots (L890)** → relax → phase 2 → spaceport → tents → vegetation →
people → … → textures → sky. Adding a single `rnd()` call anywhere before L890 changes every
building in every seed; adding one later re-rolls everything after it. The comment at L137 ("so the
seeded layout above never shifts") only protects against the second stream `xr`, whose consumers shift
each other the same way. `rnd()` is also called per frame in townsfolk hooks (L1921–1923), so the
stream state is not a pure build-time artefact. Saved-view links (`#v=…`) survive this; the city they
show does not.

### 3.4 Content is embedded in code

| Content | Where | Shape |
|---|---|---|
| Izani inscriptions `E` (52 entries) | L2873–2925 | text mixed with render spec (`style, aspect, px, bg, color`) |
| `LEX_WORDS` (~90 rows), `LORE`, `CANON`, `IZNAME` | L3906–3998 | pure data |
| City parameters `WORLD … STATUES`, `GATES` | L318–334 | pure data |
| `DISTRICTS`, `VIEWS`, `CONST` (constellations), `ART`, `HASH_OK` | L745, 3783, 3604, 2557, 3854 | pure data (`VIEWS` needs a "ground+N" convention) |
| Schedules: gates 22–06, festival every 3rd day, bells, weather plan, light curves | L433–437, 2553, 3114, 3289–3295, 4152 | numbers in code |
| Street network | L468–540 | hand-written list of `disc()`/`road()` calls |

None of it can be edited without editing the 467 KB program.

### 3.5 Two sources of truth for the Izani language

`The-Izani-Tongue_2.html` has no script; its 34 (of 106) glyph SVGs were baked from the stroke table
`G` (L263–271) that lives only in `iziz.html`. The "City lexicon" table (Tongue L110) duplicates
`LEX_WORDS` with different wording, and Tongue L190/194 paraphrase `LORE[1]`/`LORE[6]` with divergent
sentences. Every new word must be added twice and drawn twice.

### 3.6 The city has no data model

State is spread over `lots` (decorated in place: `l.ivy`, `l.poster`, `l.artPrint`…), a flat `doors`
array, **two 2D canvases read back with `getImageData` as the only representation of streets and
plazas** (there is no street graph), `SEWER/LAKE/RIVER/DOCKROAD`, `window._wallSegs`, the A* grid in
`window._patrol.NAV`, `STAIRS`, `glowPts`, and `scene.userData.gateDoors`. Lot placement and relaxation
cannot run outside a browser because they sample the canvas.

### 3.7 Dependencies

Only three.js r128 (2021) from cdnjs, so the page needs internet even on the LAN. No hard-deprecated
APIs are used, but an upgrade is not free: 17 `onBeforeCompile` string replacements on shader chunks
whose contents changed in r15x, and r152+ colour management / r155 lighting changes would require
re-tuning all 138 Lambert materials, 22 canvas textures and every light intensity. Modern three.js is
ES-module only, so the upgrade coincides naturally with the module split (§7).

### 3.8 What is already good

Real `<button>`s, `aria-*` maintained in 23 places, focus management, Escape closes panels,
`prefers-reduced-motion` honoured for lightning and camera flights (not yet for particles or the
day/night clock), pointer-event pinch/pan, context-loss recovery, staged loading with progress text,
per-stage timing table under `?debug`, hash-encoded view state with validation, try/catch around every
localStorage access.

### 3.9 Testability

116 of the 205 functions touch no THREE/DOM at all. Worth unit tests once extracted: `rnd/rr/pick`,
`vn/fbm`, `hash3/mkRng`, `wallR/polar/angDiff`, `roadD/riverD/trailD`, `terrainH`, the schedule curves,
`obbAxes/mtv` (lot relaxation), `claimFace`, `bodyOf`, `loc`, `stateToHash`/`readHash`, and the Izani
`letters/layout` (the `draw` function needs only a Canvas2D context). The street mask blocks testing of
lot placement until streets are rasterised into a typed array instead of a canvas.

## 4. Server (`server.py`, `sitectl`, `site.toml`)

Fit for a LAN with a few viewers. Gaps, in order of relevance:

| Issue | Evidence | Effect | Fix |
|---|---|---|---|
| No conditional requests | `If-Modified-Since` → 200, full body | every reload re-downloads 467 KB + 1.08 MB despite `Last-Modified` | honour `If-Modified-Since`/`If-None-Match`, return 304 (S) |
| No compression | `Accept-Encoding: gzip` ignored | 467 KB where 159 KB would do | gzip text types when the client accepts it (S) |
| HTTP/1.0 responses | `HTTP/1.0 200 OK`, one TCP connection per request | slower page with many assets once modules/data files exist | set `protocol_version="HTTP/1.1"` on the handler (S; keep-alive then works with `Content-Length`, which is already sent) |
| No `Range` support | `Range: bytes=0-99` → 200 full file | PDF viewers and video seek won't work | `SimpleHTTPRequestHandler` doesn't do it either; add 206 handling if PDFs are served (M) |
| Plain HTTP, no auth | by design | fine on the LAN; never port-forward | document (done) |
| Single process, threads | `ThreadingHTTPServer` | fine for tens of clients | none |
| `image.png` is 1.08 MB | 768×707 RGB PNG | slowest asset on the page | re-encode as JPEG/WebP (~100 KB), keep PNG as source (S) |

Good: allowlisted routes, mounts that cannot escape their folder, config check before start, SIGHUP
reload that keeps the old config on error, `sitectl` refuses `sudo`, journald logging.

## 5. Project hygiene

- **No version control.** One 467 KB file, edited by hand and by tools, with no history. The backup of
  the pre-painting version is in a session temp folder that will be deleted.
- No tests, no lint, no formatter. Sections are recognisable only by `// ----` comment headers.
- The service starts at login, not boot (`loginctl enable-linger` still pending).

## 6. Quick wins (do these first, in this order)

1. `git init`, commit everything, and add a `.gitignore` for scratch files. (10 minutes)
2. Shadow pass: 2048², `PCFShadowMap`, `noShadow` on jungle sets, throttled redraw. (§2.1)
3. Precompile shaders and pre-create clay/wire materials before removing `#loading`. (§2.3)
4. Sprite fill-rate caps. (§2.4)
5. Throttle HUD/slider DOM writes. (§2.6)
6. Server: HTTP/1.1, gzip, 304s. Re-encode `image.png`. (§4)

Expected result of 2–5 together: the adaptive resolution should settle near 1.0–1.5 instead of 0.7 on
this machine, i.e. a visibly sharper picture at the same frame rate, and no freeze after the loading
text. Each is independent and can be verified with the `?debug` timing table and `window._res.cur`.

## 7. Overhaul: target architecture and migration

### Target layout

ES modules served by the existing server (add `[[mount]]`s for `/src`, `/data`, `/css`, `/vendor`).
No bundler.

```
CityofIziz/
  index.html              shell: <link css>, the 11 empty containers, <script type="module" src="/src/main.js">
  tongue.html             renders glyphs and tables live from /src/izani + /data/lexicon.json
  css/iziz.css
  vendor/three/           pinned local copy (works offline on the LAN) + import map
  data/
    lexicon.json          {key:{lines,means,parts}} + LEX_WORDS + LORE + CANON
    inscriptions.json     per key: {style,aspect,px,bg,color} and placement (IZNAME)
    cities/iziz.json      WORLD…STATUES, GATES, DISTRICTS, VIEWS, CONST, ART, schedules, street primitives
  src/
    core/   diag.js  rng.js  env.js
    izani/  glyphs.js (pure)  draw.js (Canvas2D)  atlas.js (THREE)
    city/   params.js terrain.js streets.js landmarks.js lots.js buildings.js walls.js sewer.js river.js lake.js docks.js spaceport.js …
    life/   townsfolk.js soldiers.js nav.js boats.js caravans.js carts.js birds.js
    fx/     weather.js particles.js glow.js sky.js textures.js lighting.js
    ui/     panels.js views.js display.js card.js lexicon.js hash.js settings.js sound.js
    main.js   ctx = createCity(params, seed); for (stage of STAGES) await runStage(stage, ctx); startLoop(ctx)
  tests/    node --test over core/, izani/glyphs, terrain, lots, schedules, hash; golden lot fingerprints
```

Design points:

- **One `ctx` object replaces the closure and `window._*`**: `ctx.{seed, rng, params, terrain, streets,
  lots, doors, scene, mats, animHooks, glow, hour}`. Each stage exports `run(ctx)` and publishes to
  `ctx.<name>`; readers keep today's optional-chaining contract, so failure isolation is preserved and
  `runStage` keeps `section()`'s try/catch and `stage()`'s yield. The render loop lives outside the
  build so a build failure still renders whatever was built.
- **Seed stability**: `ctx.rng.stream('lots')` = `mkRng(hash(seed,'lots'))` per stage, so a new call in
  one stage cannot shift another. Keep one `rng.legacy` LCG for the chain that must stay in order
  (perm → terrain canvas → detailing → phase 1 → relax → phase 2) so existing seeds keep their
  buildings; move only later consumers to named streams (re-rolls decoration once, never buildings).
  Before touching anything, record a golden fingerprint (hash of `lots[i].{x,z,kind,h}` and `doors`
  for seeds 1337, 42, 7) and assert it in tests after every step.
- **Multiple cities** = another `data/cities/<name>.json` plus a route; the code path is identical.
- **One Izani source**: `tongue.html` imports `izani/glyphs.js` + `draw.js` and `lexicon.json` and
  renders its tables and SVGs live, replacing the baked SVGs and the drifting duplicate tables.

### Migration steps (site works after each)

| Step | What | Effort | Guard |
|---|---|---|---|
| 1 | `git init`; mounts for `/css /src /data /vendor`; move CSS out; copy three r128 into `vendor/`; dump golden lot fingerprints for three seeds via `?debug` (`window._lots`) | S | fingerprint file exists |
| 2 | Extract `E`, `LEX_WORDS`, `LORE`, `CANON`, `IZNAME`, `DISTRICTS`, `CONST`, `VIEWS`, `ART`, `STATUES`, city params into `data/*.json`; `build()` starts with `await fetch()`. Regenerate the Tongue tables from `lexicon.json` with a small script | M | fingerprint unchanged |
| 3 | Move dependency-free seams to ES modules: `core/diag`, `core/rng`, `izani/*`, `core/env`. Switch the page to `<script type="module">` (top-level `await` lets `build()` stay). Tongue page renders glyphs live | M | fingerprint unchanged (RNG byte-identical) |
| 4 | Split `build()` into stage modules over `ctx`, section by section in file order; `window._foo=` → `ctx.foo=`. Do the UI tail (L3627–4228) first, it already depends only on `DISPLAY/ctl/VIEWS`; then terrain → phase 2; then the 37 sections. Move the render loop out of the build | L | fingerprint after each batch |
| 5 | Named RNG streams (keep `legacy` for the building chain); `node --test` for rng, noise, `wallR`, `terrainH`, `mtv/claimFace/bodyOf`, schedules, hash round-trip, Izani layout. Rasterise streets into a typed array so lot placement runs headless | M | tests green |
| 6 | Second city JSON + route to prove the data path. Then bump three.js via the import map, re-verify the 17 `onBeforeCompile` chunk names, set `colorSpace` on the 22 canvas textures, re-tune lights. Keep r128 until step 5 is green so layout and rendering regressions never overlap | L | visual comparison per seed |

Do the quick wins (§6) before step 4; they are one-line changes today and would have to be redone
inside modules otherwise.

## Appendix: how the measurements were taken

A copy of `iziz.html` with a small probe after the three.js `<script>` tag (wrapping
`THREE.WebGLRenderer` to capture `renderer.info`, frame intervals and `LOAD.times`) was served on a test
port and loaded in `firefox --headless`; the probe reported back with an image request after 40 s. The
server checks used `curl` with `If-Modified-Since`, `Range` and `Accept-Encoding` headers against the
live service. Nothing in the project was modified by the audit.
