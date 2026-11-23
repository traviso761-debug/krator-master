# Pinnacle: known issues

- [ ] **The lakes keep the model's 2 km masks.** The smoothing (2026-11-12, `core/world/README.md`, "Smoothing") took
      the staircases, the streaks and the straight river cuts out of the land. The cross-shaped lake west of the K'etsaal
      Baatar's mouth still has square shores: the land round it lies under its level, so only the mask draws it.

- [x] **No mesa in the world** (2026-11-16, relief P4): `src/43p-world-rock.js` pins the rock's KSTACKS bodies, made from
      `settlements/pinnacle-rock`'s layout as its stage makes them, into core/world's landform records; the world's ground
      stands up into them (their tops and walls) and the bands' camps are planned round them. The page draws the same records
      with their overhangs; the world's are a heightfield (no overhang).
- [ ] **The frame rate over the camps** (about 1 fps) is being worked in its own session (pinnacle-perf, 2026-11-10).
- [x] **The savage hyperjungle grew nothing** while the rock stood on the rim. Since the move of 2026-11-10 the
      hyperjungle is in the registry on that overlay (little-demo's pass table). The cut's two overlays (the savage
      hyperjungle and the NE rim) both grow now.
- [ ] **Pinnacle Rock's own page has not moved.** `settlements/pinnacle-rock` still reads its 4.21 cut round the old
      pixel (755,351 on the old canvas, 1027,681 on 5.1). The model's record and this region moved on 2026-11-10; the page
      moves when it is next rebuilt (recut its `region/` at 1007,686, and recheck its rock against the new ground).
- [ ] **The live scale model has not taken the move.** The record is changed in the model's source
      (`tools/scale-model/model/src/60-settlements.js`: the default and `SETT_MOVED['5.1e2']`), but the published artifact
      and its database still hold the old pixel. Republishing the model is the owner's call.
- [x] **The NE rim's ground was the default desert's** (red, shaped as a desert). Fixed 2026-11-09: `core/world`
      `BIOME_STYLE` gained a 'savanna' style for the three savannah rims, coloured from the kit's own `GROUND` palette.
      The plan was rebaked on the new land (the stale check caught the move).
- [x] **The frame was heavy** (2026-11-10 to 11-16, the performance pass). Over the threehorn camp (verify's view 2,
      120 m up) the frame drew 17.8 M triangles in 2,433 draw calls. The flora was not most of it: the camps were 12.7 M
      triangles and 2,093 calls (all nine drawn in full within 3,500 m; one thorn hedge run is ~9,700 triangles, and there
      are 2,177 hedge and rail pieces). The flora's mid level was 2.1 M and its far blob crowns 1.9 M. Three changes:
      - **The camps** (`core/world/88s-world-sites.js`): a camp's own pieces within 900 m (was 3,500); inside that, a thorn
        run is the kit's piece within 350 m of the camera and a ragged card past it, piece by piece. Past 900 m the massing:
        a dome a tent, a box a pen, a card a hedge or rail piece. The stand-ins' colours are converted from sRGB (they
        read pale). The check "every piece the kit's" looks up every camp's pieces, drawn or not.
      - **The far trees** (`core/world/84i-world-impostors.js`, opt-in; `src/47-world-kits.js` `impostor`): the
        hyperjungle's far level is the biome core's octahedral impostor, baked at load from its mid tree (6 species x 2
        variants, 4 s on the RTX), 2 triangles a tree: 4,383 far trees in 9 k triangles, was 1.9 M.
      - **The mid reach** (`src/47-world-kits.js`): the mid hands over to the impostor at 600 m (was 900-1500 m).

      Now: 2.9 M triangles and 843 draw calls at view 2. Measured with `tools/perf.py` (headless Chromium, 1280 x 800,
      pixel ratio 1), before and after in the same GPU lock:

      | view | RTX 5060 before | RTX 5060 after | Arc 140T before | Arc 140T after |
      |---|---|---|---|---|
      | 1 (2.5 km up) | 60 fps, GPU 3.4 ms | 60 fps, 3.0 ms | 10.4 fps, 19.8 ms | 60 fps, 12.0 ms |
      | 2 (the camp, 120 m up) | 60 fps, 7.2 ms | 60 fps, 2.9 ms | 10.5-12.4 fps, 35.3 ms | 30.6 fps, 23.4 ms |
      | ground (30 m up) | 9-60 fps, 6.3 ms | 58.5 fps, 2.6 ms | 21.0 fps, 32.6 ms | 42.6 fps, 22.9 ms |
      | walk (1.7 m) | 55-60 fps, 6.2 ms | 59.1 fps, 2.7 ms | 11.8-26.6 fps, 34-41 ms | 39.3 fps, 24.0 ms |
      | flying 150 m/s from view 2 | 29-40 fps | 49.2 fps | 16.3-24.8 fps | 36.8 fps |

      The fps is the page's own loop (vsync caps it at 60), GPU the world pass alone (the timer query). The numbers swing
      by up to 2x between runs while other work shares the machine; the "1 fps" first reported did not come back in
      headless runs, where the RTX held 60 fps at view 2 before the pass.
- [x] **The ground's strata ran on every pixel** (2026-11-16, the second pass). The ground's fragment shader
      (`core/world/81-world-terrain.js`) read the strata (about nine dependent texture reads) everywhere and mixed them in
      by the rock's weight, mostly 0 over the jungle: 7-8 ms of the Arc 140T's frame at every view. Now it reads them only
      where that weight is over 0.004 (the colour moves by under half a percent below it; screenshots before and after
      differ only in the swaying leaves). The six regions that read the file were rebuilt; four passed `verify.py
      --assert` on the GPU and were committed; the isle demo's and the Xanadu-Oidong highrift's pages fail checks of their
      own (their hamlets and coast, the lake's islands: records merged on 2026-11-16 without a rebuild), so their committed
      pages were left as they were and take this when their owners rebuild them.
      The camps' pieces are built once at load (`core/world/88s-world-sites.js`), not when a camp first comes within 900 m.
      Measured with the branch's merges in (the villages, the corridors), before and after in one lock:

      | Arc 140T | before | after |
      |---|---|---|
      | view 2 (the camp, 120 m up) | GPU 20.9-23.0 ms | 17.2 ms |
      | view 2, flying 150 m/s | 40.5-43.4 fps, p95 55-62 ms, 6-10 frames over 100 ms | 51.3 fps, p95 33 ms, 3 |
      | ground (30 m up) | 43.2-49.4 fps, GPU 19.6-21.3 ms | 52.3 fps, 17.3 ms |
      | walking 6 m/s | 44.0-49.1 fps, p95 52-65 ms | 55.5 fps, p95 37 ms |

      The RTX 5060 holds 60 fps at every view and in every flight (GPU 3.0 to 2.5 ms at view 2).
- [ ] **The Arc 140T is still fill-bound.** ~17 ms at view 2: the mid crowns ~4.5 ms, the ground ~4 ms, the heroes and
      far impostors ~2 ms each. Half the pixel ratio halves the frame, and a laptop window at pixel ratio 1.5 draws 2.25x
      the pixels measured here. Next: a render scale (`core/world/45-world-host.js`), or cheaper mid crowns.
- [x] **A prototype grown on demand was a hitch** (fixed 2026-11-16, the third pass). The nursery grew each species'
      level the first time a tree of it came into reach, and the first tree of a kit paid for the kit's own setup: an
      eastern abyss mid tree stalled a flight 0.1-0.5 s the first time it reached the NE rim. Timed one by one
      (`tools/grow_times.py`) the region's 152 prototypes are 0.71 M triangles and grow in 0.3 s on a warm page, the
      slowest 41 ms: the stall was the kit's first use. `core/world/85p-world-pregrow.js` (opt-in, listed here) queues
      all of them at load behind the streaming's own requests; the curtain waits for them (0.8-1.7 s of nursery work
      in all, against 0.6-0.9 s before; the curtain lifted at the same time within the runs' spread). No flight grows
      one since. On the RTX 5060 the flight from view 2 at 150 m/s went from 3-6 frames over 100 ms (worst 178-423 ms)
      to 1 (worst 119-150 ms).
- [ ] **Terrain and floor chunks are the flight's remaining hitches.** One terrain chunk (`core/world/81`, 0.2-0.7 s)
      or floor chunk (`86`, once 1.8 s on the Arc 140T) built in a frame past its budget: `tools/perf.py --fly` prints
      the worst frame's steps. Both are shared by every region; splitting a chunk's build across frames is the fix.
- [ ] **The far canopy's look changed** with the impostors: from the blob crowns' rounded pastel greens to the kit's own
      crowns (purple, lime, rust, the ghostwood's white boles), with gaps to the dark floor. Their light is the kit's
      impostor look at gain 2.4 (`src/47-world-kits.js`). Awaiting the owner's eye.
- [ ] **Multi-second stalls** (3.3 s walking, once; 2.4 s in the terrain, 10.8 s in the nursery, once each in one run)
      did not come back in four later runs of the same flights with a CPU profile (`tools/perf.py --fly --profile`): most
      likely other work on the machine. Watch for them; the flight prints its worst frame's steps and the long tasks.
- [ ] **No grass.** The kit's floor (its thatch, bunchgrass and vain fronds) is not on the world's floor yet, so the
      parkland reads as bare gold ground between the trees.
- [ ] **The savannah kit's world adapter lives here** (`src/49-world-absav.js`), not in the kit. A new fragment in
      `biomes/abyssal-savannah/src` would change that kit's page, so it moves when that kit's session takes it.
- [ ] **The tents come through `settlements/isle-demo/bundles.py`** (`cat_bundle`). The Beast Riders kit should own its
      bundle (as `kits/xanadu` owns `XAK`). Until it does, this build reads the isle demo's bundler and its piece
      instancer (`58-isle-protos.js`) in place: a lateral dependency, allow-listed.
- [ ] **No floor patches.** `floor: null` for both kits, so the world's floor skips them.
- [ ] **Farmland is a reading, not a crop map.** The resources panel's farmland is warmth x water x flat x soil from the world's
      fields (core/world/49r-world-resources.js `farm`); it does not ask kits/crops what grows there (no climate-to-band
      mapper exists yet) and the scale model has no soil layer.
- [ ] **Proposals live in the browser until they are sent or exported.** `93-world-propose.js` keeps them in localStorage
      per region; clearing the site data loses unsent ones.
