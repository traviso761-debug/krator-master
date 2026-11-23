# Stage 8: the two surveys' bugs, verified against the line (C)

Checked 2026-11-23 on `claude/integration-4` at cf7e849a2 (read-only), against `freeze/vertical-stack-1123` (61 commits
past the line; merge base 52f478695) for each file a bug names. Sources: Survey 3 (`wisdom3/BUGS-draft.md`, items 1-91 and
the 11-23 addenda XS0, XS1, XS2, A1, A7, A8, Strongbow) and Survey 2 (`BUGS-2026-11-15.md`, C/T/K/S/B/H/A/G ids).
Ids: `S3-n` (Survey 3 item n), `S3-XS1a` etc. (addenda, in order), Survey 2 ids as given. A bug in both surveys is listed
once, under the first id, with the other id in brackets.

Status: **OPEN** (evidence given), **FIXED-L** (fixed on the line), **FIXED-S** (fixed on the stack, arrives with the
merge), **CANNOT TELL** (why), **DEFER**, **OWNER**. Reach: build commands from `tools/reach.py <file> --commands` on the
line's build-inputs.json (the stack adds more for core/world).

Lints run here (read-only): `check_source` 0 over baseline (4 keys shrank); `check_vendor` 0 over; `check_views` **7 over**;
`check_core_use` **7 new** (kits/marr, settlements/marr: not in either survey); `check_assembly` 0 over, but most pages here are
LFS pointers (NOT BUILT), so it proves nothing about clashes; `check_stale` 182 over (expected: the line is behind).
Node: `core/hamlet/test-hamlet.js` 1 FAIL, `core/audio/test-audio.js` 2 FAIL.

## Counts

Counts are by entry. One entry can merge duplicate ids, and a part-fixed bug counts as OPEN.

| Status | Entries (about) |
|---|---|
| OPEN | 100: shared core 26, shared kits 25, tools/tests 31, single builds 20 (one is new: Marr's core_use) |
| FIXED-L (fixed on the line) | 50 (section 5) |
| FIXED-S (fixed on the stack) | 1 (S2-C9); one more depends on it (S3-XS2f needs roomlight-fixes merged after the stack) |
| CANNOT TELL | 29 (section 8 and four in section 4) |
| DEFER (too big, or not a rebuild task) | 26 (section 7) |
| OWNER (needs the owner's decision) | 13 questions, covering about 25 ids (section 6) |

---

## 1. Shared core: fix these BEFORE the shared core wave. They set the rebuild order

The waves: (a) merge the stack, (b) these core edits, (c) one rebuild of everything they reach. Each line gives the reach to
rebuild after.

### core/tags (reaches 407 commands: every page)
- **S2-C18** OPEN. `core/tags/52-core-tags-vocab.js:49` CULTURES (CULTURE_NAMES) has no `qiblai` or `kimr`, so `T.audit()`
  counts them unknown and `tags-vocabulary` fails. Fix: add both names, then drop Kimr's 8x push of its culture. Every page. Core wave.

### core/terrain (KGROUND: 299 commands)
- **S3-54** (TODO.md:96) OPEN on the line and the stack (the stack's 43 still has 19 hits). `core/terrain/43-core-ground.js:78,80`:
  the `kgTri` and hex-sampler locals `r1 r2 r3` and `v1 v2 v3` match three r128's `cube_uv_reflection_fragment` defines, so on a
  material with an env map the shader fails and the mesh vanishes. Fix: rename them `kgR1..`/`kgV1..` and delete the `#undef`
  guard at `core/terrain/host/39i-core-cavern-rock.js:29-30`. Reaches 299 commands. Core wave, after the stack merge (the stack edits 43 too: A0).
- **S3-88b** OPEN. `core/terrain/37c-core-rubble.js:116` KRUBBLE.mesh returns `idx: new Uint32Array`; r128's `setIndex()` keeps a
  typed array raw (no BufferAttribute) and the draw throws. Fix: return a plain array, or wrap it in a BufferAttribute. 14 commands. Core wave.
- **S2-C20** OPEN. `core/terrain/39b-core-speleo.js:60-61`: the beam's march `t+=.5` returns `len:t`, which can pass `L0`
  (`len[1]`) by 0.5 m. Fix: `len:Math.min(t,L0)`. 36 commands. Core wave (cosmetic, but it rides along).
- **S3-17** OPEN (doc only). `core/terrain/host/39h-core-cavern-cut.js:18`: the header says `discards(y, ownFloor, x, z)`, but the
  code at :41 is `(x,y,z,own)`. Fix the comment. No page changes.

### core/biome (286 commands)
- **S3-46** OPEN. `core/biome/34-core-impostor.js:117,124`: `readLights()` runs once at bake. It ticks only when `BIO.host.ticks`
  exists, so on other pages the far impostors draw black (sun 0). Fix it in core: when there are no host ticks, read the lights
  again on the first rendered frame (an `onBeforeRender` on the impostor set), and default the capture to
  `impostorLook({gain:3.6,wrap:1})`. That makes the page-by-page audit unnecessary. 286 commands. Core wave.
- S2-C1, C2, C3, C4: FIXED-L (`20-core-kit.js:618-670` measures point to segment, `:629` gives twigs STOL, `:127-129` has the
  cells rule, `:694` adds `BIO.insideOut`). S3-69: FIXED-L (swbay and sedesert guard `BIO.variantPool` and `BIO.impostor`;
  Voth's BIO_CORE has 35).

### core/minimap (289 commands)
- **S2-C19** OPEN. `core/minimap/88-core-minimap.js:52-55`: `fromWalk` treats every non-rect floor as a strip (`fl.a`), so a KWALK
  poly floor (every KCAVERN room) throws. Fix: draw `fl.kind==='poly'` as a polygon and drop 88b's walkBands workaround. 289. Core wave.

### core/catalog (88 commands)
- **S3-72** OPEN. There is no lamp cap in `core/catalog/krator-furniture-runtime.js` (`:65` collects every PointLight from
  `F.lamp`, `krator-furniture-core.js:1040`). 185 lit lamps hang a page. Fix: move the nearest-N cap (24) the sheet and
  beast-riders keep locally into the runtime. 88 commands. Core wave.
- S3-89 (the hem rule, decal pictures): FIXED-L (claude/dreamy-turing-3902d7 merged).

### core/engine (41 commands; run `core/engine/fingerprint.py` after, since pages move on purpose)
- **S3-84a** OPEN (code unchanged since the report). `core/engine/30-geo.js:153` `lathe()`: a profile that closes on r=0 with a long
  last segment shades a black cap. Fix: give the pole ring the axis normal, or insert a ring near the axis. 41. Core wave.
- **S2-C23** OPEN. `core/engine/27-mat.js:45` `ANIMU.uWind` (float) collides with the sky's `vec2 uWind`
  (`core/atmos/sky/89-atmos-g-sky.js:66`): "Types of uniform 'uWind' differ" when both load unsealed. Fix: rename the engine's to
  `uAnimWind` everywhere it is read. 41. Core wave.
- **S2-C24** OPEN. `core/engine/91f-furnish.js:24`: `if(PLACE_DRY)return null`, so a host-drawn building gets no furniture unless
  its kit queues and flushes a batch itself. Fix: queue dry FURNISH calls and flush them in the host take. 34. Core wave if taken, else defer.
- **S3-84b** OPEN (doc). A kit host file named `99-host-<kit>.js` sorts before `99-host-take.js` and loses its probe fields. Fix:
  write the naming rule (`99-host-take` last; kits use `98x-`) in core/host's README. No page changes.

### core/world (14 commands on the line; the stack adds its relief pages)
- **S3-55** OPEN on the line and the stack (stack :758). `core/world/41-world-fields.js:412-414`: `W.at` returns the shared `A`,
  so the next call overwrites the last result. Fix: `fieldsFrom(x,z,h,..,PP,{})` (a copy), keeping `W.atShared` for hot loops;
  audit the callers. Every region and site check. Core wave, after the stack merge.
- **S3-59** OPEN. `core/world/85-world-flora.js:18` `MARGIN=64`, but a tree jitters up to a cell (165 m), so the spacing fails
  across tile edges. The fix is on claude/pinnacle-corridors 67b3ac12e (WIP; not on the line or the stack). Merge or port it. 7 commands.
- **S3-60** OPEN. `core/world/88s-world-sites.js:70-77`: a hamlet record whose key its kit lacks draws as a massing box (only a
  `note`) and never reaches `S.missing` (`:132`, `:157`), so "every piece the kit's" passes. Fix: push `r.key` to S.missing when
  `!kit`. 6. Note: the stack's 48s is an older copy (it lacks the line's `laid`/`ways` and adds `recordOk`). Merge it file by file.
- **S3-26** OPEN. No `openworld/*/verify.py` calls `hostNegatives()` (core/world/91), on the line or the stack. Fix: call it from
  each region's verify and require every negative to fail. Verify only, with the region builds.
- **S3-43** OPEN. `core/world/bake_sites.py:21-24` DIMS_SOURCES reads every `kits/xanadu/src/*.js`, the opt-in ones (87k, 87s-87v)
  included, so the plan hash differs from the page's. Fix: take `kits/xanadu/xanadu.py` FILES. Then re-bake every region's
  `plan/sites.json` (S3-74 rides along). Before the open-world wave.
- **S3-A1a** OPEN. `core/world/bake_towns.py:155-158` `src_hash` hashes its own text, so any edit to the tool reads every town bake
  (Voth, Phēr) STALE. Fix: hash the inputs plus a `BAKE_VERSION` constant. Before the re-bakes.
- **S3-77** OPEN/OWNER (see section 6). `core/world/41l-world-landforms.js:43` KINDS={island,islet,stack,shoal}: pancake_dome
  (Firebliss's obsidian domes), secondary_crater_bay and lf_se_tharn_crater are skipped (`:100`).
- **S3-40a** OPEN (cosmetic). `core/world/bake_towns.py:319` prints "bed at most nan" when `bedMax` is None. Fix: print "none".
- S3-51: FIXED-L (`bake_sites.py:43-46,142` coasts opt-in). S2-C9: **FIXED-S** (4fd9ca23e: BIOME_GROUND covers every overlay, and a
  missing style fails instead of falling back to desert; the line still has `||'desert'` at `41-world-fields.js:99`).

### core/region (2-3 commands)
- **S3-87a** OPEN. `core/region/50-region-valley.js:124` `every = Ls.every == null ? 1 : Ls.every`, so `every:0` gives
  `(n-1)%0 = NaN` and every passage kills. Fix: `Ls.every > 0 ? Ls.every : 1`. 2 commands.
- **S3-87b** OPEN (cosmetic). `50-region-valley.js:152-156` stores road raids at the generic `S.raids` (the Lizardmen use
  `S.raiding`, `52-region-raid.js:38`). Fix: rename to `S.roadRaids` and update its readers.
- **S2-C15** OPEN. `core/region/40-region-sim.js:87` reads `ISLE_DIMS` unguarded and `:172` calls `RH.simTrade()` unguarded, so a
  non-isle host breaks. Fix: `typeof ISLE_DIMS!=='undefined'` and a `simTrade` default. 3.
- S3-49: FIXED-L (no `|| <n>` left in 50-region-valley.js; its baselined key shrank). S3-50: FIXED-L (test-outposts reports moved
  places, `openworld/outposts/tests/test-outposts.js:34-44`, and does not fail on them).

### core/interiors (on the stack only)
- **S3-XS2f** OPEN on the stack. KROOMLIGHT (`core/interiors/10-core-roomlight.js` on the stack: `:66` the skylight's fixed .66
  flag, `:159` pickPool drops windows past 26 m, doors always open, windows with no aperture). It is fixed on
  origin/claude/roomlight-fixes (39f52a5b), which is in neither the line nor the stack. Merge it right after the stack.
- **S3-XS2c** OPEN. Godot `pick_pool` disagrees with the JS (window energy 1.25 vs 1.35, the night factor, max windows =
  max_lights/2). Fix in the Godot twin with the roomlight merge.

### core/water, core/host, core/hamlet
- **S3-A1e** OPEN (minor). `core/water/50-core-water-draw.js:3` requires `ATMOS.init` before `WATER.draw`, and a `--kit` page that
  skips it throws "reading 'scene'". Fix: a clear error, or a default scene.
- **S3-2** partly FIXED-L: "arrow shafts" now parses (`core/hamlet/10-hamlet-wood.js:10`). OPEN: `test-hamlet.js` still fails on
  compasshills (padding, bast) and crook (fiber/padding, instrument). Fix: add rules to `10-hamlet-wood.js:10-20` (36 commands), or
  retag the two biomes. Core wave.
- S2-C5, C6, C8: FIXED-L (`core/host/90-host-camera.js:43` floorBelow, `:46,99` the swept step, `:20` `C.drawn`).

---

## 2. Shared kits: fix before their kit wave (each reaches many pages)

### kits/xanadu (72-xa-helpers.js: 27 commands, the Xanadu family, Longsong, the three xanadu regions)
- **S3-30 / S3-82** OPEN. `kits/xanadu/src/72-xa-helpers.js:226` xnPennants calls `vBeam(a,b,..,'vRope')`; vBeam is `beam()`
  (`kits/iziz-vernacular/src/69c-vern-helpers.js:58`), which centres on the midpoint, but `vRope` is based
  (`69b-vern-mat.js:156` `translate(0,.5,0)`). So every flag rope overshoots its far end by L/2 (also qnFlags, extra/88f, the 87k
  fish racks). Fix: kdef a centred `xRopeC` and use it for every beam-drawn rope; drop 88g's xwLine workaround. Kit wave.
- **S2-K11** OPEN. `72-xa-helpers.js:270` xnPool: the slab is 0.35 tall, but the water's top is at y+0.28, so pads vanish. Fix: water at
  `y+.37`, or the slab 0.25. Kit wave.
- **S3-62** OPEN (part fixed). `72:265-266`: xaPlant's 'tight'/'crowded' now suppresses the fallback (`86b-xa-plants.js:22-32`), but
  when `XANADU.treeAt` is absent at build (the biome loads after the gardens) the cone or box still draws. Fix: queue the plant
  until BIO.host is ready, or return 'pending'. Kit wave.
- **S3-83a** OPEN. `kits/xanadu/src/89-xa-trades.js:9-13` still lists gaps that 88g fills (shrine, dyer/weaver, mine head,
  quarry). Fix: move 88g's into src/ and clear the gaps. With kits/xanadu.
- **S3-A7c** OPEN. Xanadu's page omits kits/xanadu 80f/80g (the forts) unless a kit.json names them, so `xa_fort_post` silently
  becomes a stand-in. Fix: list them in FILES, or fail on a stand-in.
- **S3-XS1b** OPEN. `kits/xanadu/tex/pack.json` and `settlements/xanadu/tex/pack.json` have no jali entry (0 hits), though both
  materials.json name `patterns/xanadu/jali` (delivered 11-12). Fix: rerun `tools/textures/pack.py` for both (+170 KB xJaliC).
  With the Xanadu builds.
- **S3-A1c** OPEN (with the Xanadu family). The market hall at "the square's head + 12 m" lands on the first contour street
  (Māuṭh too). Phēr's tests check only houses; add a civic-vs-ways check.

### kits/iziz-vernacular (69c: 24 commands)
- **S3-78** OPEN. `kits/iziz-vernacular/src/69c-vern-helpers.js:22` vnReg has no `y0`, so a builder that draws below its origin
  registers a short (empty) volume. It is fixed only for qb_terrace_stair (claude/zealous-allen-0cd44d 4f1f45adf). Fix: an
  optional y0 argument. Kit wave.

### kits/interiors (src: 68 commands; sets/xanadu.js: 67)
- **S3-57** OPEN. `kits/interiors/src/49b-walk.js:130,149` register door blocks before the pending entry flights are checked
  (`:168-177`), so every raised body is listed "elevated" and the walker cannot climb in. Fix: check the flights first, or skip
  door blocks in the flight test.
- **S3-58** OPEN. `kits/interiors/src/46-planner.js:163` the stair search walks only `L0.innerF`, so a storey smaller than the one
  below never gets a stair. Fix: also try L1.innerF edges inside L0.
- **S3-70b** OPEN. `kits/interiors/src/20-rooms.js:84-86` drops a fixture's key, variant, seed and y. Fix: pass unknown fields through.
- **S3-70c** OPEN. `kits/interiors/src/45-placer.js:453-470`: the optional groups ignore `roles`, though REQUIRE honours them at `:432`.
  Fix: filter by roles the same way.
- **S3-70a** OPEN (sheet page only). `kits/interiors/src-sets/00-head.html:66-87` loads a fixed culture list (no eternian, scyvoi or
  others), so those sets run on fallbacks. Fix: generate the list from kits/catalog.
- **S3-45** OPEN (unchanged since the report; a runtime check). `kits/interiors/sets/xanadu.js:84-91` xa_rich_b and xa_rich_c: their
  plan doors are never cut (planDoors 0), so the upper house and the konak are sealed with `?interiors=1`. Fix: put the doors on the
  builder's block faces, or have vaPlanDoors look outward for an inset body. With kits/xanadu.
- **S3-89c** OPEN. The interiors sets verify grows past 20 GB over three seeds. Fix: dispose per reseed in kits/interiors' verify.py.

### kits/ancients (90-scene.js: 10 commands, covering all 48+ targets and the pages that read the kit in place)
- **S3-29** OPEN. `kits/ancients/src/90-scene.js:5` camera far 12000; the `:37-40` sky (radius 9000, depthWrite false) has no
  renderOrder, so a high view shows horizon colour past it. Fix: far 30000, `sky.renderOrder=-1`, and delete the per-target
  patches (`targets/arcpile/8at1:32-33`, `podium/8aq3:50-51`, `sanctum/8ar3:43-44`, `strongbow/8aw2:12-13`, `gatearc/8av1:30-31`).
  Parabola's skyMat pow patch can go too. Kit wave. (S2-K1, `pow(max(h,0.))`, is FIXED-L at `:39`.)
- **S3-10b** OPEN. check_views: `kits/ancients/targets/strongbow/91z-views.js` "The Order's crown" is new over the baseline
  ("The Pilgrims' Stair" is baselined). Rename at the rebuild.

### kits/catalog (pieces: every catalog page)
- **S3-89a** OPEN. 45 older pieces have coplanar overlapping parts (z-fight). List them with `node settlements/xanadu/citadel/furnish_census.js --brief`
  and offset the trims by 1 cm.
- **S3-89e** OPEN. The `B.banner` fringe draws 5 cm below y 0. **S3-89f** OPEN: `kits/islanders/src/66-ip-palace.js:205` hangs a 2.45 m
  banner in a 2.2 m room.

### kits/fauna, kits/resources, kits/crops, kits/tungang
- **S3-37a** OPEN. `kits/fauna/tests/test-models.js:191` `--candidate` always passes `variant: 0`. **S3-37b** OPEN:
  `tools/lfs_needs.py` lacks `core/materials/library/wing.dragonfly` for `kits/fauna/rig/patch_models.py:21`. S3-37c: FIXED-L
  (claude/coyote-birds merged).
- **S3-38** OPEN. `kits/resources/tests/test-res.js:9-11` loads 42r but not `42s-res-ore-mined.js`, so data/ledger.json misses the
  ten mined-goods kinds. Tests only.
- **S3-39** OPEN. `kits/crops/verify.py:49` takes no `--out`.
- **S3-14** OPEN, baselined. `kits/tungang/src/37-wk-rec.js` still drifts from core/engine (+7 −17;
  `tools/check_vendor_baseline.json:7`). Fix: re-sync, or record why in `kits/tungang/KNOWN_ISSUES.md`. S2-K6: FIXED-L
  (`80-fg-host.js:39` converts u8). S3-71 (tungang materials): leather009 FIXED-L; whether `f_wood`=wood.carved is right is in section 6.

---

## 3. Tools and tests: no page rebuild. Fix them before the rebuild so its checks are honest

### settlements/xanadu build and verify (the Xanadu family's tooling)
- **S3-6 / S3-A8c / S3-91a** OPEN. `settlements/xanadu/build.py:383-387` opens every fragment's path in `--list-sources` mode, and
  the kit builds' gen/ files are untracked (kirstabal 69k/69k2, flashing-eye 39fe, strongwall 69w, viridian 39vt, and the 69x
  kcity bundles), so dep_graph and test_all's "dependencies run one way" fail with FileNotFoundError. Fix: when `BSRC.LISTING`,
  record the path and skip the read (or have each kit build.py call write_gen while listing).
- **S3-8 / S3-A8b** OPEN. `settlements/xanadu/verify.py:144` passes `here=settlements/xanadu`, so a `--kit` page's checks_optin
  (and BUDGETS) key off Xanadu. Fix: `here=KIT dir` when the page is under a kit's dist/.
- **S3-33** OPEN. `settlements/xanadu/verify.py:264` cuts `--eval` output at 3,000 characters. Fix: an `--eval-out <file>`.
- **S3-75b** OPEN. `settlements/xanadu/build.py:514-517`: `subprocess.run(..., text=True)` has no encoding, and `print(r.stdout+r.stderr)`
  can crash on cp1252 and hide the syntax error. Fix: `encoding='utf-8', errors='replace'`.
- **S3-86b** OPEN. `settlements/xanadu/build.py:244` RE_DECL_MULTI reads `const f=(r)=>{const c=..,s=..}` as top-level declarations.
  Fix: anchor at brace depth 0 (the jsscan lexer).
- **S3-79b** OPEN (doc). The column-0 name scan trips on IIFE-wrapped externals unless they are listed "scoped". Fix: skip IIFE
  files, or say so in the kit.json comment at `build.py:170-178`.
- S3-A8a (renamed externals): FIXED-L (`build.py:174,356-358`, the [path, name] pair). S3-56 (sidePacks, `_hostPending`): FIXED-L
  (`build.py:403-405`, `tools/harness.py:125-127`).

### tools/test_all.py and the node tests
- S3-1 / S2-T4: FIXED-L (`test_all.py:207-224` catches the timeout; `:227-233,351` console_safe).
- **S3-A8g** OPEN. `tools/test_all.py:286-306`: check_assembly and check_stale run after every node test, and test-catch.js takes
  25+ min, so a 30-min cap never reaches them. Fix: run the page lints first with `--no-build`.
- **S3-3 / S2-A1** OPEN. `core/audio/test-audio.js`: 2 FAIL (a clip with no source page or creator; an unknown category). Fix: complete
  the catalogue rows and categories.json.
- **S3-4** OPEN. `tools/tests/test_bridges.py:91` lists `xanadu-oidong-highrift` as a region with no bridges, but its plan has
  them (sites.json has `bridges`). Fix: drop it from the tuple.
- **S3-61** OPEN. `tools/tests/test_bridges.py:35-41`: underDecks counts a deck station on the river's natural bank (H == Hland) as
  buried. Fix: skip `w <= Hland + .2`.
- **S3-5 / S2-T20** OPEN. `tools/scale-model/tests/test_smodel.py:41-43`: `check()` asserts, so the first failure (station-garnet:
  `biomes/neouterwall/region/station-garnet.json` still states 2810.1 m) stops the later sections. Fix: count and continue; re-export
  the neouterwall station bases on the current model (the 5.1e20 merge moved the ground).
- **S3-48 / S3-68** OPEN. `core/region/tests/test-east-rift.js:59` and `test-xan-economy.js:89` require `secs<240` wall time, which
  fails under load. Fix: measure `process.cpuUsage()`.
- **S3-A7f** OPEN. `tools/ktest.js` counts `.ok(` as a call site (`ground.ok(x,z)`), and `core/hamlet/test-hamlet.js:10` keeps a local
  `ok`, so ktest cannot load there. Fix: match `T.ok(` only, and port test-hamlet to ktest.
- **S3-XS1e** OPEN. test-catch.js takes 15-25 CPU-min. Fix: mark it nightly.
- S3-11 / S2-T5: FIXED-L (`test_all.py:375-385` SKIPs a test whose input is an LFS pointer or uncommitted).

### the lints
- **S3-10** OPEN. check_views is 7 over the baseline: biomes/loom-chasms ×5 ("A box canyon's head", "A cable's anchor", "The Cradle's
  fans (west)", "The Cradle's fans from the step", "The salt-cutters' camp"), kits/ancients "The Order's crown", kits/marr "Om de
  Landarnaz – Courtesans' Quarter". Opalvalley's are gone (FIXED-L). Fix: rename (no apostrophes or colons).
- **NEW (no survey)** OPEN. check_core_use has 7 new findings: kits/marr MISSING core/rand, core/tags, OWN getImageData
  (`targets/city/85-city-paint.js` ×3, `90a-city-world.js`), sin-hash (`90a-city-world.js`); settlements/marr MISSING core/rand,
  core/tags. Fix with Marr's build.
- **S3-88a / S2-T11** OPEN (code unchanged since 11-11; it cannot be shown here because the pages are pointers). check_assembly
  CLASH misreads `window.X =` inside a bundle's own Proxy closure (tungang, XAK, KMK; theodiga-today `_projectFire`/onerror, qiblai
  `_materials`, strongwall and thalaba `_registered`). Fix: skip window writes in closures that shadow `window`.
- **S3-34** OPEN. `core/city/33-city-strategies.js:140` calls `KCITY.stance` (15) unguarded, and `tools/fragment_needs.json` has no
  entry for it. Fix: declare 33 → 15 in fragment_needs.json (tools only, no page changes).
- **S3-86d** OPEN. `tools/fragment_needs.json` lacks dalab 71c and 74 → `86-bio-45-init.js`. Add them.
- **S2-T15** OPEN. Each biome `build.py` FORBID check (e.g. `biomes/rift/build.py:58,178`) matches raw substrings: "BRIDGES" in a
  comment saying "FOOTBRIDGES". Fix: match whole words outside comments (jsscan).
- S3-9 / S3-49 / S3-91b / S3-A8e (check_source): FIXED-L (0 over baseline). S2-T12: FIXED-L (no stale baselined findings).

### index, port and texture tools
- **S3-12a** OPEN. `tools/make_index.py:253,305` write INDEX.md with no `newline='\n'` (CRLF on Windows). Fix: add it.
  S3-12b (audit_port CRLF, F.at): FIXED-L (`audit_port.py:278,346,53-57`). **S3-12c** OPEN: `audit_port.py:55-56` counts any `box(`
  or `tbox(` as geometry, so a [G data] file that defines helpers with those names is tagged [draw]. Fix: skip calls to functions the
  file defines itself. S3-75a (make_index rewrites every index): FIXED-L (`:278-287` writes only the named builds; `--root` reads the
  others with `write=False`). **S3-A8d** CANNOT TELL: the blanked descriptions (Thalaba's); rerun make_index on one build and diff.
- **S3-16** OPEN (doc). `tools/build.py:24` still says a plain build "does not see the LFS pointers it reads"; matlib_pack refuses
  them now.
- **S3-81b** OPEN. `tools/build.py` has no `--list-sources` case, so `tools/build.py <b> --list-sources` rewrites build-inputs.json.
  Fix: pass straight through, recording nothing.
- **S3-XS1f** OPEN (line and stack). Neither `tools/textures/pack.py` nor `matlib_pack.py` reads materials.json `"class"`. Fix: wire
  it (about 4 lines, XS1-CLASSES.md s4). Then re-pack.
- **S3-89d** OPEN. `tools/textures/process.py:112`: raise `ImageFile.MAXBLOCK` for busy paintings.
- **S3-89g** OPEN. `.gitattributes:37-42` sends `tex/*.webp` to LFS only one folder down, so `biomes/*/stations/*/tex/` is not LFS
  (sedesert's bowl, mantis and steppe packs). Fix: add `biomes/*/stations/*/tex/*.webp` (and kits'). Before the rebuild writes them.
- **S3-XS2e** OPEN. `tools/lfs_needs.py` misses Longsong's `dist/kchar` (52 files, 59 MB) and `core/charactermodels/dist`.
- **S3-81a** OPEN. `.codex/hooks.json` (tracked) runs the session-start hook from
  `...krator-master\.claude\worktrees\eager-babbage-31ce37\.codex\hooks\session-start.sh`, an absolute path to one worktree. Fix:
  make it repo-relative (check that Codex accepts it), or untrack it.
- **S3-XS1c** OPEN. Strongwall's and Thalaba's builds import scipy (`settlements/strongwall/build.py:44`,
  `settlements/thalaba/build.py:62`), which no requirements file declares. Declare it, or drop it.
- **S3-SBb** OPEN (note). `tools/commit.py`'s staged-text check over a 3,400-file merge runs over 10 min (WinError 1455). For the
  rebuild's commits: `check_text --files` on the hand-resolved files, then `commit.py --no-check`.
- S3-15 / S2-T7: FIXED-L (kits/port reads DOCS-ONLY, no UNRECORDED). S3-13: FIXED-L (the Godot character data is byte-identical).
  S3-A8f (the duplicate PORT-BASELINE key): FIXED-L (no duplicate keys). S2-T1, T2, T3 (a note), T5, T7, T9 (part), T13, T16,
  T17, T18, T19: FIXED-L (e41b77477, claude/tools-fixes-1115; T4, T5, T7, T13, T16 and T17 spot-checked in the code). S3-85b (the
  harness lost-context report): FIXED-L (2464b3253 is in the line).

---

## 4. With their own build (one build each; fix in that build's turn of the rebuild)

- **S3-18** OPEN. 15 biome `tex/pack.json` lack `"plants"` (0 hits): catch, crater-drylands, eastabyss, ebadlands, guilin, korona,
  necanyons, nwouterwall, rift, sedesert (+ stations bowl, mantis, steppe), swbay, swhighlands (nsemiarid has it: 14). BIO.cardMute
  (`core/biome/20-core-kit.js:257,717`) fails them. Fix: rerun `tools/textures/pack.py` per build, before that build's rebuild, and
  check that nsemiarid's and throne's own pack writers copy cell, base, stems, rise, plants, anchor and sheet.
- **S3-20** OPEN (baselined in `tools/check_cells_baseline.json`). 14 sprig crowns cut into cells with no stem: ehighlands laurel,
  epi; nhighlands birch, larch, maple, needle, pinnate, small; rift broadcloud, croton, leaflet, lobeleaf, needle, spray. Fix: stems
  in card-bases.json, `check_cells --fix`, re-pack.
- **S3-19** CANNOT TELL (a GPU stem check; the source has not changed since: `biomes/nhighlands/src/50-...-species.js:519`
  `BIO.def('lance',BIO.geo.clump()...)`). The nhighlands 'lance' clumps hang off their twigs. Fix: hang each clump's origin on its
  twig axis.
- **S3-21** OPEN. ehighlands trees (`biomes/ehighlands/src/55-biome-ehigh-trees.js:31` `Y=BIO.terrainH`), boulders and floor
  (`60-...-floor.js:21`) still place on terrainH. Only 60's slabs use `EHIGH.groundAt` (`84-host-ground.js:167`). Fix: `Y=EHIGH.groundAt||BIO.terrainH`.
- **S3-22** OPEN. `biomes/necanyons/src/57-biome-necanyons-carnivores.js:70-73` seats carnmoss and seepfern on the analytic KSTACKS
  outline (`K.footR`). There is no `NECANYONS.wallAt` hook. Fix: add one, filled by a host from its drawn mesh. Reaches necanyons,
  korona, pinnacle-rock. **S3-23 / S2-S2** CANNOT TELL: Pinnacle Rock's page workaround (`settlements/pinnacle-rock/src/88-host-build.js:16-34`
  SEEP_ON_ROCK) is on the line, but a rebuild was reported at 1.87%; it needs a GPU verify after the rebuild.
- **S3-24, S3-25, S3-A8h, S3-XS2a** OPEN (stale pages; the rebuild fixes them). godshearth, longsong, strongwall, erewhon, xanadu and
  xanadu-scrap are STALE in check_stale.
- **S3-27** OPEN. `openworld/isle-demo/verify.py:292` ready_js does not wait for `_api.ready()` (it is read only later, at `:317`).
  Fix: add `&&_api.ready()`. The hamlet checks (clay ground, quay, lane ends, canoe line) and the Arc context loss are CANNOT TELL
  without a GPU run; re-seat the records after the coast.
- **S3-28 / S3-44 / S3-A7h** OPEN. `openworld/xanadu-oidong-highrift/verify.py:80-91` "the lake's small islands" checks every
  landform, `lf_pher_headland` (a headland) included, with no kind filter. lf_pleasure_dome_isle is dry 131-261 m off (A7, 11-23).
  Fix: skip non-island kinds, and re-seat the dome isle's record. **S3-74** CANNOT TELL: oidong-highrift `plan/sites.json` (the
  stack touches 2 lines of it). Re-bake at the rebuild.
- **S3-32 / S2-S5** OPEN. `settlements/xanadu/src/86-bio-*` lacks 31b and 34 (the vendored core/biome predates them), and
  `src/99-start.js:8-14` `KHOST.take` passes no `registry`, so towns clash on `window._registered`. Fix: re-vendor and pass `registry:REG`.
- **S3-31 / S3-A7d** OPEN. `settlements/xanadu/src/91-probe.js:7-16` `_probePoints` ignores `userData.probePoints`, so merged builders
  read "empty". Fix: push each object's probePoints, as core/host's probe does.
- **S3-35** OWNER (section 6). `kits/xanadu/targets/sheet/89z-rows.js:11` budget 6.0 M tris against a measured 6.71 M.
- **S3-63, S3-XS2b** OPEN (Erewhon data; with settlements/xanadu). Pinned plots leave free tiles disconnected; the Temple and the
  Envoys have no outward door; the kitchens' street door faces away; a palace door opens 13 m up; the Court Temple's doors are not in
  KDOOR; the Sultan's tower Ramp and the palace service stair are dark by day; the Court Temple prayer hall has no opening.
- **S3-64 / S2-S6 / S3-A7j** OPEN. Longsong: 113 kit.json pieces have no dist/kchar sidecar ("KCHAR PIECES MISSING"; 203 ls-scholar-*
  undressed). Build the charactermodels pieces before Longsong in Stage 8. **S3-XS2d** OPEN: `settlements/longsong/build.py:163-164`
  keys the interiors bake by sha1 of the whole text of 40c and 57a, so a comment edit makes it stale (642 rooms furnished live).
  Fix: hash the records, not the text.
- **S3-67** OPEN. `settlements/voth/palace/blueprint.py:877-879` draws outlines before the rooms (`:892-897`), so a room hides them.
  Fix: draw the outlines after the rooms. Reaches every blueprint (Voth, Iziz, Longsong, Erewhon, Tempest, Beacon). Sheets only.
  (6292e8980, the axis note, is merged.)
- **S3-86c** OPEN. `settlements/kirstabal/build.py:97,104-116`: the FLORA_CORE closure has no core/space, so `40-core-place.js:141`
  falls back to its O(n²) scan. Fix: add SPACE plus `var KSPACE=window.KSPACE`. Same for Blakhed's riftrim trees.
- **S3-52** CANNOT TELL. Strongbow-today is in `TAGS_TARGETS` (`kits/ancients/build.py:119`); the stack's 82ca2f515 binds
  `KTAGS.page` in the region export. Check the export names records after the merge.
- **S3-73a** OPEN (unchanged). `biomes/line/stations/hotdoor/98v-host-views.js:9` "The cleft shrine": the eye is 0.79 m from the
  tunnel line. Move it about 1 m. **S3-73b** OPEN: PORT-BASELINE still holds 32 `settlements/port/` pages (moved to kits/port).
  Rewrite the baseline once at the end.
- **S2-B4** OPEN (cosmetic). `biomes/line/stations/station/44z-host-site.js` still says "25 km east" toward Loj Twenny.
- **S2-B6** OPEN. `biomes/ringisles/src/89f-host-fauna.js:10` places animals with `reseed(8801)` and rr/ri, not KRAND by cell. Fix:
  seed by cell. That moves the page, so baseline it on purpose.
- **S2-B2** OPEN (latent). `biomes/nwlowlands/src/60-biome-nwlowlands-floor.js:115` `bluebells(x+rr(-2,2), y, ...)` keeps the parent's y.
- **S2-G1, S2-G2** OPEN. `kits/desert-nomads/dist/desert-nomads.html` is 16.97 MB and `settlements/voth/dist/voth-city.html` 19.75 MB,
  both over the 16 MiB artifact cap. See section 6.

---

## 5. Fixed already (no action; listed so they aren't fixed twice)

FIXED-L: S3-1, S3-2 (arrow shafts part), S3-7 (0a4008f0b), S3-9, S3-11, S3-12b, S3-13, S3-15, S3-37c, S3-49, S3-50, S3-51,
S3-56, S3-69, S3-75a, S3-85b, S3-89 (hem rule), S3-A8a, S3-A8e, S3-A8f, S3-XS1a / S3-XS0a (azure-dream 20-core-walk external),
S3-47 (march.e, march.s: 6f9c33143, 23e782dbc merged), S3-71 (leather009); S2-C1, C2, C3, C4, C5, C6, C8, C25, T1, T2, T4,
T5, T7, T12, T13, T16, T17, T18, T19, K1, K2 (`kits/ancients/src/91-probe.js:98` views getter), K3 (the LFS refusal), K6,
S4 (`99-start.js:9` CITY_BUILD), B3 (`biomes/labyrinth/build.py:75` takes 31b), S9 (not live), and the azure-dream `--interiors`
flag (`verify.py:154`). FIXED-S: S2-C9.

---

## 6. Needs the owner's decision

1. **core/simulation economy** (S3-80a `77-sim-3-actors.js:80-92` choose() sends workers to any WORK (no default to a.work);
   S3-80b `77-sim-6-economy.js:143-147` a mess meal draws the most-stocked food, not the diet; S3-80c `:255-265` economyStop sends
   a carrier home empty when its best good is out; S3-80d `77-sim-6-money.js:117` prices labour from all staff hours; S2-C13
   `77-sim-6-unrest.js:96-100` a strike holds only recipes; S2-C14 `77-sim-6-population.js:15-21` beds dealt by role can house
   children alone). All OPEN, each reaching about 15 SIM commands. CLAUDE.md requires Voth's stocks proof, test-sim.js and the
   baseline to stay unchanged unless the change is meant to move them. Fix them in Stage 8 and re-tune on the isle demo?
2. **core/city alleys** (S3-86a): with TUNE.exact, step-12 alleys can graze earlier lots (worked round on claude/nulab-07cbd8). core/city
   belongs to the city-layout work. Fix it in core/city during the rebuild (47 commands)?
3. **WebGL context-loss recovery** (S3-76a, TODO.md:695): no `webglcontextlost` handler anywhere in core. Add one to core/host (388
   commands) in this rebuild, or defer?
4. **Economy data**: S3-36, arms and powder never reach Erehwon (`core/region/data/xan-tune.js:213-216` gate.dalab `in` is salt, iron,
   wine, pearls): add them, or add a road expect? S3-47, what should march.w (`:424`, 818,1531) see? S3-90, Gila still plans 275 t
   of salt out (`settlements/gila/src/88-gl-records.js:119`) against Skink's ~137 t, and PLAN-LIZARDMEN's distance to the south fort is wrong.
5. **Docs and lore** (S3-65): STATIONS-MAP-5.1 Siphon Pits px, shade/DESIGN.md:8, LORE.md:1069/1014/166/442, shim/PLAN.md:106.
   **Data gaps** (S3-66): hearth wax and stoke crop records; eastabyss marsh warmth 4 (`kits/crops/src/10-crop-core.js:46`), so the
   abyss has no farmland; `tools/scale-model/geology.py:79` RUIN_REGIONS lacks "ancient's valley"; SETT_TYPES lacks town and fort.
6. **The Xanadu sheet budget** (S3-35): raise it to 7 M, or split rows?
7. **xnFolk** (S3-79a, `72-xa-helpers.js:268`): skip the static figures on pages with a life layer, or swap them for RIGS?
   And should the Qiblai `life` check (`settlements/qiblai/verify.py:61`) put the camera on the kora and require shown > 0?
8. **FAUNALANDS** (S2-K9, `kits/fauna/fauna-lands.js:62-67`): longcrawler, wingclaw and nightwing are named "by the plan, not drawn".
   Map them to draught-millipede, giant-archaeopteryx and giant-bat, or keep them as plan-only names?
9. **Landform kinds** (S3-77): draw pancake_dome (Firebliss's domes) and the crater bays at 1:1, or mark them raster-only?
10. **Pages over the 16 MiB cap**: desert-nomads 16.97 MB, voth-city 19.75 MB, and the scale model at 20.96 MB (S3-40b). Split
    them, raise BUDGETS, or keep them out of the gallery? Also the gallery (S2-G3): republish and re-split after the rebuild?
11. **Texture classes** (S3-XS0d): xMosC, xMosD, xBandC, xGiltC and xBandR fail rough<0.35; icewall and Tungang ice/celadon/gilt
    are missing; xSun and xValance are classed flat but drawn alphaTest 0.5. Which wins, the class table or the rule?
12. **core/hazard duplicates** (S2-C21): rockburst, inrush and seal are in both `core/hazard/22-core-hazard-tunnel.js` and
    `22-core-hazard-bore.js`. Which stays?
13. Tungang `f_wood` = `wood.carved` (S3-71, `kits/tungang/materials.json:37`): intended?

## 7. Too big for the rebuild: defer

S2-C10 (far rivers break into specks: terrain LOD), S2-C11 (lakes keep the 2 km masks; the stack's relief and core/coast may
change it), S2-C12 (KRAND.hash floors strings and folds seed XOR the first value, `core/rand/08-core-rand.js:31-33`; changing it
moves every page; the stack only adds gnoise; use KRAND.child), S2-C16 (pueblo hatches), S2-C22 (the engine's two-renderer
dispose; worked round by a reload), S2-K4 (transit crossing pins), S2-K5 (the Line's car doors), S2-K7 (Tungang round walls as
boxes), S2-K10 (fauna rigs, Godot skin import, membrane gate), S2-S3 (Pinnacle's 5.1 recut stall), S2-S7 (the isle economy's
emptied mine), S2-S8 (the Godot isle export skips the hamlets), S2-S10 (Strongbow walk gaps), S2-H1 to H4 (garments: not a page
rebuild), S2-T22 (geometry_report), S3-41 (Dhelv on the cloud lanes), S3-42 (card.beech.southern owed), S3-53 (Godot road-walk
hitches: profile on a quiet machine), S3-XS0c (per-page Xanadu packs: 13.86 + 5.16 MiB on every kit page; its own project),
S3-A7a (WORKS-PLAN s3 px and the region recut: in the scale-model re-run), S3-A7b (KSITES.plan hard-codes 'beast-rider',
`core/world/48s-world-sites.js:61-62`), S3-A7e (townW counts what clearHook clears), S3-76b (the Ancient's Valley reeds on dry
ground) and S3-76c (the cloud copy-back), S3-A1b (extract_region's origin_px pin as the default: needs every region's recut), S2-C24
(if it is not taken in the core wave).

## 8. Cannot tell here (needs a GPU run, a built page, or a file not on the line)

S2-C7 (the pin on a constant fallback ground), S2-C17 (LOD in the pane only), S2-T6 (test_gpu_lanes stall), S2-T8 (station
kits through tools/build.py), S2-T14 (check_port on tool scripts), S2-T21 (route51.py is not in tools/), S2-T23 (playwright under
node 24), S2-K8 (Kimr hides' uTime), S2-K12 (post-apoc sockets door), S2-K13 (`reach:false` fixtures), S2-S1 (Voth City's verify:
embassies, the Arena flight, the flora editor), S2-B1 (NW lowlands curtain flowers), S2-B5 (the valley's creeper speckle), S2-B7
(Firebliss empty volumes and capWhy: no capWhy found in biomes/firebliss), S3-19, S3-23, S3-27 (hamlet checks, Arc context),
S3-52, S3-74, S3-85a (the low-albedo and unsampled-tex guards: not in harness.py; they may be in the guard session's branch),
S3-91c (`extract_region.py:1294`, the bench reach: the 5.1e20 merge moved the code), S3-A1d (core/ruins misnames hovering
pieces), S3-A1f (WORLD.Hbare with minWave>0 drops the coast's shaping, `41-world-fields.js:355`), S3-A8d, S3-XS0e (KSHADOW off by
default, so the sampler counts understate: a note).

---

## 9. Rules the rebuild must follow (from TIPS-PITFALLS-draft.md)

- Branch from the integration tip, never the stale local main: `git merge-base --is-ancestor` first.
- Low memory: `GIT_LFS_SKIP_SMUDGE=1 git checkout -f -b <new> <tip>`, then `tools/lfs_needs.py <build> --pull` only what a build
  reads. Never `git stash` in this repo: it turned a dist page back into a pointer. `git add` clears an LFS-pull "M" with an empty diff.
- Verify to a log file, not a pipe. Use `KRATOR_GL=gpu` and look for "harness: on the arc lane". An exit 75 or EPIPE after the
  asserts passed means rerun, not fail. Prove a failure predates the change with the old page and `--no-cache`.
- A rebuild pulls in other people's unbuilt source changes: compare each page's size delta against your own change.
- Keep the RNG stream: draw everything, then skip the put; new layers go last on their own reseed.
- Merges: the stack's core/world/48s, 41 and 85 differ from the line on both sides; merge file by file, never take one side of a
  folder. Dry-run with `git merge-tree --write-tree --name-only`; grep seeds and kind names across branches.
- Big merges: `check_text --files` on the hand-resolved files, then `tools/commit.py --no-check` (the full staged check takes over 10 min).
- New kinds and layers go in new fragments, not edits to shared ones; run `tools/reach.py` right before baking.
- Vertex-coloured MeshStandardMaterial needs `convertSRGBToLinear()`. Seat ruins on the lowest ground under their corners. Don't
  pass big generated JS on a command line (E2BIG). Use the Edit tool and `-F` files in PowerShell, not here-strings.
- Silent fallbacks hide gaps: make a missing entry an error and draw it magenta (S3-60, S3-62 and S3-A7c are this kind).
