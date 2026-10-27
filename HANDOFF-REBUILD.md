# Handoff: the all-builds rebuild

## NEXT SESSION, START HERE (written 2026-10-27, usage ran out)

**State:** `claude/biome-rebuild` (worktree `C:/Users/travi/Documents/krator-biome-rebuild`, unpushed). origin/main is merged in
(ebfc29d9e; `LORE.md`'s sky rows kept from this branch: check them against main's). **Pairs 1-3 are merged** (eastabyss, nwbay,
swbay, hyperjungle, sedesert, necanyons), as are the Rift, the SW highlands, the Godthrone, KLAVA, the card fit and the foliage
guards (c63eacb4c), the water audit (ac251a770) and `CORE-IMPROVEMENTS.md`. necanyons left uncommitted rebuilt pages in this
worktree (`biomes/necanyons/dist/*.html`): commit them if its re-verify passed, or rebuild.

**The core pass was stopped mid-way.** Each session committed its work to its own branch (`git branch --list 'claude/core-*'
'claude/water-core-pass'`); none is merged unless its report says so. Read each session's last report, then finish and merge each:
- `core-tools`: tool checks and lints, `CORE-IMPROVEMENTS` step 1, plus `check_cells --strict` in `test_all`;
- `core-verify` (WIP 32a8df085 on `claude/core-verify-5c22d0`): `verify_page` with the universal asserts, the harness's GPU lock and PID kills, `harness.py lock`/`ratchet`, 48 template verifies converted, and negative fixtures (`tools/tests/test_verify_page.py`). nhighlands passed on the GPU except a false shader positive, fixed but not re-tested. Left: 29 one-off verifies (its agents' later edits may be uncommitted in its worktree), the eastabyss/Rift and broken-shader runs, the ratchet baseline, the item sheet and winding sweep, wiring core-biome's `BIO.capReport` and core-seat's `seatSweeps`, the merge;
- `core-seat` (WIP 15788f6fe on `claude/core-seat-324f0b`): `KSEAT` (`core/terrain/38a-core-seat.js`), the probe sweeps (`core/host/95b-host-seat.js`), and KSTACKS/KCARVE probe points, with tests, `SEAT.md`, and lints clean. Left: swlowlands' adoption has a syntax error in `99-host-take.js` (apostrophes in two check names), unbuilt and unverified; then the merge. core-verify's note names the file `47`: it is `38a`. Also found: every ringed KSTACKS top has an open hole at its centre (in `TODO.md`'s ride-alongs);
- `core-biome` (WIP 69802c265 on `claude/core-biome-db6709`; done: per-cell `BIO.grid` opt-in, the cliff gate with `cliffCheck`, a 250k instance cap with `capReport`, and bucket probe points; nhighlands' placement is unchanged on the GPU; left: merge c63eacb4c into it, nhighlands verify, `test_all`, and its cap fields to core-verify; found: nhighlands' needle (632k) and frond (595k) are over the cap, and about 130 floor plants and 6 trees sit on rock faces). Planned there: the cliff default, `BIO.grid` cells, the count cap, `BIO.beam` segments with `clumpOn` (crowns at twig tips),
  `BIO.tree` owner scope, and per-plant card records;
- `core-shader` (WIP e0a9e7a34 on `claude/core-shader-654624`): `core/shader` (`KHOOK`, `KCOLOR`, tests pass) is adopted in core/atmos (byte-identical on 54 snapshots) and core/terrain 43-45. Left: the lava draw (46), the core/water draw with `checkPrograms` and colour space, `khost.resolve` adding core/shader plus `build.py` lines for 7 non-khost builds, READMEs, a GPU-verified page, core/biome after `core-biome`. **Don't merge it before `khost.resolve` lands: pages then fail with "core/shader is not on this page".** Its scratchpad `snap.js` compares old and new shader text;
- water (`claude/water-core-pass`, ddd76b906): the flow network, the shore from the ground, ribbon rows and breakup are done and
  tested; eastabyss on the network verified (341d48a55, 26 views). Left: Godot parity (WIP ddd76b906, its Godot test never run), the merge, and necanyons' creek (a fine ground strip, then verify all three pages; handed to the water session).

**Then:** resume the pairs from pair 4 (the table under "How step 3 runs"), then the gallery republish, then the queue under
"After the pairs and the gallery". The texture wiring follow-ups are listed under "Textures delivered 2026-10-27". Start sessions
only from the owner's own message: the app refuses starts from session reports.

## START HERE: the final rebuild (handoff of 2026-10-26)

**For the session that runs the final rebuild.** Everything below this section is the earlier plan and its record; this
section is the state as of 2026-10-26 and the job. Read it, then "Stage 1, final" further down (the approved lists in its
sections 2, 4a, 4b and 4c), `CLAUDE.md` and `README.md`.

### Where things are

- **Branch `claude/biome-rebuild`**, worktree `C:/Users/travi/Documents/krator-biome-rebuild` (cut from origin/main; origin/main
  last merged in at d72ba6dba). **Not pushed.** Push it (or merge it to main) only when the owner says so. Big pages make pushes
  time out: raise `http.postBuffer` first.
- **All the session's work is merged into it**, each piece reviewed and its tests rerun after the merge:
  - water on core/water in every biome; known-issues passes on every built biome (ringisles, shighlands and the rest);
  - the shared sky (every biome kit and station, with the landmark layer) and `ATMOS.bindWeather` in every biome;
  - the new biomes: Farside, the NW outer wall, the Cut, the Catch, the Bowl/Mantis/steppe (sedesert stations), k-guilin (the
    Hykkousoi hinterlands; `biomes/guilin` is frozen as an Earth reference), the abyssal savannah (station 1);
  - the seven core workstreams (each module's README has an "Adopting it" section with the exact build.py lines and calls):
    - **kit** (core/biome 20/35/34): B6 animMat defaults (on), B4 lathe rep (hyperjungle uses it), B1/B2 LOD merge, minTris,
      per-pass chunks, dithered cross-fade (opt-in: `BIO.LOD.merge/minTris/fade`, `BIO.chunk`), B5 per-instance labels,
      R6 octahedral impostors (`34-core-impostor.js`, opt-in);
    - **foliage** (core/biome 30/31/31b): B3 per-species second bark colour (`aC2`, `glossBarkMat({c2})`), B9 spin, X4 the
      core dither (`31-core-dither.js`), R5 floor from the ground (`BIO.setGround`), R7 alpha-to-coverage (`BIO.setA2C`),
      R8 one wind field (`BIO.bindAtmosWind`), back-light, the `BIO.FADE` hook, R13 leaves on stems (`31b-core-leafset.js`:
      `BIO.leafStem/leafOn/leafAlong`, `clump({stem:true})`). With nothing asked, every shader is byte-identical to before;
    - **atmos** (core/atmos, core/host): the cloudShade recursion and X2 fixed (on), X3 hour slider (on), R1 height fog and
      R10 rain occlusion (opt-in), lightning (opt-in), snow cover's `lee`, `ATMOS.shaderHook`, `bindWeather` in every biome;
    - **terrain** (core/terrain): X6 gridded stack tops, `KSTACKS.surface({drawn:true})`, R4 `KGROUND` (43), R2 `KHORIZON`
      (45 + host), R3 `KFAR` (44 + host); all opt-in;
    - **water** (core/water): W1 curtain sides and chutes, W2 spray by drop, W3 falls on their face, W4 per-pool gradients
      (the one default change), W5 `rideGLSL`/`rideOn`, R9 wetness, puddles (`WATER.hollows`) and rain rings, W6 geyser
      plumes; Godot twins and tests;
    - **hazard**: the `hazard` key in core/tags (on: the tags export digest moved on purpose), `core/hazard` (KHAZ), one clock
      (`KTRAPS.cycle`), the hazards overlay and inspector line, walk zones, the export adapter;
    - **resources**: the geology bake (`tools/scale-model/geology.py` -> `kits/resources/data/geology.json`), `KRES` node
      field, placers and ringed evaporites, the ledger and fairness audit, the GDScript twin.
- **Textures:** five drops of 2026-10-26 are in the library (`core/materials/PLAN.md`, "Delivered 2026-10-26"); **2 prompts are
  owed** (`card.cornlily`, optional `metal.enamel.scoured`; `PROMPTS-NEEDED.md`). Pre-wired (packed, pages not rebuilt):
  oidong's carved bark, Mantis's fig, the abyssal savannah's thatch and litter, the NW outer wall's shrub and flower cards,
  the Yeti kit's drift snow, the southern highlands' banded bark and begonia, Korona's redone black quartzite and peat.
- **Research and plans:** `biomes/DETAIL-RESEARCH.md`, `HEIGHT-RESEARCH.md`, `WEATHER-RESEARCH.md`, `HAZARD-RESEARCH.md`,
  `kits/resources/PLACEMENT-RESEARCH.md`, `biomes/STATIONS-SURVEY.md` (28 planned stations at the old biomes).
- **Built pages are stale.** Most committed `dist/` pages predate the core merges (several merges took one side of a page
  conflict on purpose). Every page is rebuilt in the final rebuild; trust no committed page until it is rebuilt and verified.

### The job, in the owner's order (section 4c below)

1. **nhighlands first, the test bed**: rebuild it taking every old and new core module (R1-R10, R13, B1-B5, W1/W2/W4, KGROUND,
   KHORIZON, KFAR, snow, weather, `BIO.fung` once written, the Cut's exchanges), its unwired textures and its ride-alongs.
   Full `verify.py --assert --all-views` on the GPU, then a look pass with the owner.
2. **An optimization pass on nhighlands**, then **a Godot spike of it**, then **the graphic-load assessment** (texture arrays
   or atlases, material merging, KTX2/Basis and VRAM compression, size caps, HLOD): write a recommendation before the rest.
3. **The Throne's vents** (hazards, snow, weather), **the NW outer wall**, **the rift** (graphic load again), **then every other
   biome and station**, one by one, each taking every module, its textures and its ride-alongs, verified on the GPU.
4. **Then the planned kits as core tests**: the SW highlands (BIO.fung in earnest; unblocks the lowland flora exchanges), the
   Godthrone, Godstep valley.
5. **Then stages 2 and 3 below** (kits and settlements), including every page that reads a changed biome (section 5 below
   lists the readers) and every settlement that takes core/atmos, core/host (92-host-panel), core/tags or core/biome.
6. **Close out:** `tools/check_core_use.py --write-baseline` (it shrinks), `tools/port_baseline.py --update` for checked pages
   only, `tools/test_all.py`, the gallery republish (ask the owner: it is a wider change).

**Paused after pair 3 for a core pass** (the owner, 2026-10-27: "pause pair 4 and implement core fixes"; "then wait for the
cutout session's foliage changes, then rebuild the core modules thoroughly"). Pairs 1-3 are merged. Before pair 4:
1. **Wait for the card audit's foliage changes** (`claude/eloquent-swartz-7f7b41`: its five root causes of floating foliage,
   missing branches and badly cut cards) to merge here.
2. **Then the core pass**, from three sources:
   - `CORE-IMPROVEMENTS.md` (the recurring-issues audit: 21 classes, its "Order of work" steps 1 and 2);
   - `core/water/PRACTICE.md` (the water audit; `WATER.audit` and ground placement are already in, ac251a770; still to do: the
     flow network, the shore from the ground, breakup by default, program checks, colour space, ribbon resolution, Godot parity);
   - the card audit's foliage core changes, if any are left after its merge.
   It runs as sessions split by files, each merging here with its tests.
3. **Then pair 4 resumes** (swlowlands, nwlowlands), with every turn after it on the new core. The turns already done (pairs 1-3,
   the Rift, SW highlands, the Godthrone, nhighlands) pick the core pass up at their next rebuild: the all-builds rebuild at close-out.

**How step 3 runs** (the owner, 2026-10-27, relayed by the card-audit session):
- **Each biome's full rebuild turn is its own session, at most TWO at a time**, so the one GPU is not burdened more than it is.
- **Wait to start them until SW highlands station 4 and the Godthrone are merged into `claude/biome-rebuild`**, so their
  innovations go in too (and KLAVA, `claude/klava`, if it is merged by then).
- **A full turn:**
  - every new shader, plant and core module, by each module's "Adopting it" lines;
  - the biome's `BACKPORT.md` row and its `PLAN-STATIONS.md` stations;
  - its unwired textures, ride-alongs and exchanges;
  - its card slots by `check_cells.py --fix` (except xanadu's raceme and `card.flower.bloom`: "its card cells" below);
  - then `verify.py --assert --all-views` on the GPU and a merge into `claude/biome-rebuild`.
- **The 16 builds with card faults on core geometry** (the card audit, 2026-10-27): eastabyss, xanadu, swlowlands, nwbay,
  nwlowlands, swbay, hyperjungle, ringisles, nhighlands, sedesert, necanyons, abyssal-savannah, guilin, k-guilin, geyser, oidong.
  No slot is applied and no page is rebuilt yet. guilin is frozen as an Earth reference: ask the owner whether its cards are
  fixed anyway.
- **The order: vendors first** (the owner, 2026-10-27: "starting with biomes that need to vend plants or cousins to each
  other"). Read-in-place and kin sources, from the builds' `build.py` and the plans:
  - hyperjungle vends to geyser, guilin, k-guilin, necanyons and ringisles, and takes cousins from eastabyss;
  - eastabyss vends to abyssal-savannah, ringisles and the hyperjungle;
  - swbay vends to nwbay (nwbay is its fork), oidong, ringisles and k-guilin, and nwbay to k-guilin (`EXCHANGES.md`'s correction);
  - sedesert vends to ringisles and the Catch, necanyons to guilin, guilin to k-guilin, and geyser to ringisles;
  - xanadu and oidong share five species, and the two lowlands exchange flora: each of those pairs runs together.

  **Every biome, not only the 16** (the owner approved, 2026-10-27): the 13 kits without core-geometry card faults still take a full
  turn (catch, crater-drylands, cut, dambasins, ebadlands, ehighlands, farside, korona, nsemiarid, nwouterwall, scablands,
  shighlands, throne). The Rift, the SW highlands and the Godthrone are already rebuilt on the current core. The Bowl, Mantis
  and the steppe go with sedesert's turn.

  | Pair | Builds | Why here |
  |---|---|---|
  | 1 | eastabyss, nwbay | pure vendors |
  | 2 | hyperjungle, swbay | the largest vendor; swbay after nwbay |
  | 3 | sedesert (the Bowl, Mantis, the steppe), necanyons | the Catch's and ringisles' source; necanyons before guilin |
  | 4 | swlowlands, nwlowlands | their exchanges together; nwlowlands vends to the Cut and Farside |
  | 5 | throne, ebadlands | the Throne vends to ringisles and the Godthrone; ebadlands borders sedesert and the Bowl |
  | 6 | xanadu, oidong | their five shared species together |
  | 7 | geyser, nhighlands | geyser before ringisles |
  | 8 | ringisles, abyssal-savannah | after all their sources |
  | 9 | korona, nsemiarid (the scablands and dam-basin overlays with it) | they border each other and the NW outer wall |
  | 10 | cut, farside | both read nwlowlands |
  | 11 | nwouterwall, catch | the wall after its neighbours; the Catch after sedesert |
  | 12 | crater-drylands (both lands, N and S: one session, one kit folder), shighlands | after the hyperjungle, swbay and the SW highlands; the split into N and S is in its `PLAN-STATIONS.md` |
  | 13 | ehighlands, k-guilin (and guilin, if the owner wants its cards fixed) | k-guilin reads six kits |

  **Run them through without stopping** (the owner, 2026-10-27): "once done with each rebuild, proceed to next, then republish
  gallery". Start each pair when the one before merges; after the last, republish the gallery (`gallery/README.md`).
  **After the pairs and the gallery** (the owner, 2026-10-27: "build station 1 of godstep, station 2 of ehighlands, then station 2
  of nhighlands"): in that order, each as its own session. ehighlands' and nhighlands' turns (pairs 13 and 7) build their station 2
  (their `PLAN-STATIONS.md`) as part of the turn; if one did not, it is built here.
  Then (the owner, 2026-10-27: "add hyperjungle N and E savannah rim to queue"): **hyperjungle N** (`biomes/hyperjungle/PLAN-LANDS.md`
  section 3 and station 3, `-north`: Screamer wood, the howl bamboo, watchers, bone giants) and **the e savannah rim** (section 5.1:
  `biomes/savannarim`, a new kit on the savannah base of section 4, station 2 `-east` near Fridon). The rim is built after hyperjungle
  N, as two sessions at most at once. The hyperjungle's turn in pair 2 rebuilds its built page and its `PLAN-STATIONS.md` stations,
  not the lands plan: the savage land, the rims and the rest of PLAN-LANDS stay for later turns the owner names.
  Then (the owner, 2026-10-27: "after these, w outer wall 1, then finish sw highlands"): **the W outer wall's station 1**, the loess
  tablelands (`biomes/wouterwall/PLAN.md` section 7, a new kit: `dist/wouterwall.html`), then **the SW highlands' remaining
  stations**: 2, the rain wall and the landslide lake (`-rainwall`); 3, Span's tableland and canyon (`-span`, with `settlements/span`);
  5, the fan coast (`-fancoast`). Stations 1, 4 and 6 are built; the flora for 2, 3 and 5 is in (7ee5bc4ca).
  **Textures delivered 2026-10-27 (9b621bc70), to wire.** Turns still to come take them in their turn. These went to turns
  already done, so each gets a repack follow-up after pair 3, one at a time on the GPU:
  - eastabyss: `card.clubmoss.sprig` in its `clubmoss` slot (the id `card.clubmoss` was taken), and optionally `card.palm.costa`
    for `fan`;
  - the hyperjungle's lake station: `card.lily.victoria` (the `skylily` slot) and `card.palm.costa` (the moriche; three leaves in
    the middle row of a 3x3 frame, v .333-.667);
  - swhighlands: `ground.turf.native` and `card.turf.native`;
  - the Godthrone: `rock.basalt.titanium`.
  nhighlands takes `card.cornlily` in its own turn (pair 7). The other sets are not biome turns: the Lizardmen skins and eyes, the
  resource nodes' gypsum and halite, acid rain's etched metal and stone, the Lozenge's terrace field, the Stalkers' scoured
  enamel, and `KSTACKS` mound's termite earth.
  Each turn also takes its rows of `EXCHANGES.md` (neighbour species exchanges: its index lists the sections naming each kit).

  A vendor's session states in its merge which of its species changed (keys, indices kept), so the readers' sessions take
  them as they are.

### Progress on step 1 (2026-10-26, the session that picked this up)

- **`BIO.fung` is written**: `core/biome/33-core-fungoid.js` (nine parts and four layouts), `test-fungoid.js`, core/biome
  README "Fungoid parts". nhighlands' mushroom and disc stalk are on it; the other kits' copies (TODO.md) switch as each is rebuilt.
- **A core bug fixed on the way:** the LOD cross-fade (`BIO.LOD.fade`) read `cameraPosition`, which r128 never uploads to a
  Lambert material, so every chunk beyond one range of the origin dithered out. It now takes the eye from the view matrix
  (`20-core-kit.js`). nwlowlands' and swbay's committed pages still carry the bug until they are rebuilt.
- **`BIO.beam`** takes BIO.put's `extra` (a per-instance label).
- **nhighlands took:** the fungoid parts, the LOD merge, `minTris` 1500 and the cross-fade (B1/B2; `?lodmerge=0`, `?lodfade=0`),
  the four floor pairs merged by label (B5), W1/W2 (the curtains' margin, the ribbon's chutes, spray by drop), R9 (wet ground,
  puddles from `WATER.hollows`, rain rings on every water), and the Cut's exchanges 7 and 8 (circle lichen on the pillars and
  crags, ring reeds at the tarn and the stream's pools, the warp off: `87-host-cut.js`, two new planners in `biomes/cut`).
  It already had R1, R5, R7, R8, R10, R13, KGROUND, KHORIZON, KFAR, the weather and the shared sky from the pilots.
- **Still to do on nhighlands before the look pass:** B3 two-tone bark (`c2`) if the owner wants it there (no unwired set is
  owed to it: `card.broadleaf.cloud` and `card.epiphyte.garden` are the eastern highlands', `meta.json` "reuse"); then the
  owner's look pass, and steps 2-3 (optimization, the Godot spike, the graphic-load assessment). nhighlands has no hazards,
  so R11 stays with the Throne's vents.

### Step 2 (2026-10-26): the optimization pass and the Godot spike are done

`biomes/nhighlands/PERF.md` has the numbers. In short: the page is vertex-bound on the integrated GPU (Chrome uses the Intel
Arc 140T; Godot picks the RTX 5060 unless given `--gpu-index 1`), the instanced cards are most of the frame, and welding item
geometry (`BIO.INDEX_ITEMS`, new in core/biome, on in nhighlands) saved 17-18%. The Godot spike (`world-nhighlands`, 400 m,
committed; `world-nhighlands-wide`, 2.4 km, regenerated by the command in PERF.md) runs the page's views at 30-43 ms on the
same Intel GPU (three.js: 34-63 ms) and 6-9 ms on the RTX, drawing nearly the whole tile at every pose. `tools/harness.py
export` now pulls its result in slices (a 1 M-instance export went from over 25 minutes to 95 s). **Step 3, the graphic-load
assessment, is next**: PERF.md's "Levers not taken here" and the spike's findings are its starting list.

### The owner's look pass on nhighlands, round 1 (2026-10-26)

Fixed on nhighlands: the whole-sheet cards (below); the broadleaf builders' floating leaf masses (the mid-range tree's masses hung
on the curved bough its straight rod stands for, and the crown's top mass floated up to 10 m over the boughs: `onRod`, `tipY`);
the conifers' thin tops (a mass round the bole at every upper tier, two masses at the tip); the trumpets' funnels growing through
each other (`fitFunnel`, `funnelBlock`: funnels shrink to clear a neighbour, a colony stem is cut down or grown so its funnel
nests under or over one it cannot clear; about 10% of pairs still touch, mostly the great trumpet's fixed heads, now buds);
the tarn hanging over its downhill slope (a moraine dam in `terrainH`) and its shine; tree feet on slopes (a skirt ring under
the flare, `bole`); textures for the disc stalk's cap (`organic.cap.glossy`, a planar uv: `BIO.fung.cap({uv:'planar'})`) and the
red-stem fan (`organic.pleat.skin`). **Shared changes, reaching every page that takes them (all rebuilt in this rebuild):**
- `core/atmos/sky/89-atmos-e-skymodel.js`: **the giant's axis is Krator's pole** (`giant.axis:'equator'`, the new default; `'sky'`
  the old 23-degree canon): the sun lights it along its rings, within its declination all year (`test-sky.js`). Every page on
  the shared sky shows the ring on the celestial equator's slant instead of near-level.
- `core/atmos/fx/89-atmos-fx-raincover.js`: the shelter margin 1.2 -> 3 m (the floor's ferns read as a roof: a dry rectangle of
  light followed the camera in the rain); swbay and the Throne's glacier take it too.
- `core/biome/30-core-foliage.js` `BIO.geo.cells` (new); `33-core-fungoid.js` the cap's planar uv (new). No page moves by these.
- `core/water/51-core-water-kinds.js`: `drawFall({lipK})` (opt-in; nhighlands .85): a curtain solid at its lip (at the old 45% it
  read as bare ground from above). Round 2 on nhighlands also: the ground grid's vertices snapped onto the stream's and the tarn's
  edges (`84-host-ground.js`: the sawtooth shoreline), smooth-shaded and textured lantern pods and bell-bulbs.

### Owed in core: the impostor bake is ~4x too dark (found on nhighlands, 2026-10-26)

Measured on nhighlands' lowlands view without fog: the hero leaf cards average (59, 48, 64), the octahedral impostors
only (5, 11, 2) as baked; the colour atlas itself averages (7, 11, 4). The capture (`core/biome/34-core-impostor.js`, `capture`)
renders the crowns under a flat white ambient without the kit's leaf shader hooks (ground tint, back-light, the cards' own lift), so
the baked albedo is far below what the page draws. nhighlands compensates with `BIO.impostorLook({gain:3.6, wrap:1})` (new: a page-wide
gain and light wrap on every impostor, defaults 1 and 0 = unchanged). **The proper fix** is a capture that renders the albedo through
the kit's own materials (or applies their hooks), so every biome's impostors match without a per-page gain; then nhighlands' gain
goes back toward 1. swbay (the other adopter) has the same darkness.

### The core module sessions (started 2026-10-26, after merging `claude/hyperjungle-lands`)

The owner asked for the hyperjungle lands plan's core gaps (`biomes/hyperjungle/PLAN-LANDS.md` section 11, H1-H10) and the other
core work this rebuild needs to be written in parallel, one session per group, each on its own branch cut from
`claude/biome-rebuild` (merged back here when each reports): **H1+H2** reach and kin (`core-reach-kin`), **H3+H4** fire and the
lean toward the giant (`core-fire-lean`), **H5** bamboo (`core-bamboo`; the owner: **k-guilin takes a bamboo variant too**), **H7**
seasons and `wetGround` on `ATMOS.shaderHook` (`core-seasons`), **H6+H8** 480 m trees and fauna by land (`core-tall-fauna`),
**H10** termite mounds (`core-mounds`), **the export split by `lod.ranges` with Godot's per-instance cull and VRAM compression**
(`export-godot-cull`), and **the known failures and small requests** (`rebuild-fixes`). H9 (sound) is "later" in the plan.
**The owner (2026-10-26): no exhaustive verifies of every build a core change reaches**: each build is rebuilt and verified once,
one by one, when all the core modules are in.

**The scale model** (the owner, 2026-10-26): the crater drylands are two biome polygons, **`crater drylands N`**
(`rmuqlfgh1u6d8`) and **`crater drylands S`** (`rmuqlgonah5tp`), the same ids the Cut's exchanges (north only) and the
hyperjungle lands plan's southern patch already use. `tools/scale-model/extract_region.py` `KITS` and `biomes/WORLD.md` take the
names at the crater drylands' rebuild.

### Step 3 (2026-10-26): the graphic-load assessment is written

`GRAPHIC-LOAD.md`. The scheme it recommends, in order: welding (done) and **per-instance range culling** in core/biome's LOD fade
(prototyped: -5% to -28% a view; a third to a half of the instanced triangles were drawn past their own range); **the far band's
diet** decided with the owner on nhighlands (the far floor band shortened, octahedral impostors for crowns past ~600-800 m); the
export split by `lod.ranges` with Godot culling per instance; Godot importing textures VRAM-compressed; not now: texture arrays,
material merging, new size caps. **Waiting on the owner** before the per-instance cull and the far band are built.

### Pages load at day (the owner, 2026-10-26)

`ATMOS.SKY.viewHour` (11, `core/atmos/sky/89-atmos-e-skymodel.js`) is the hour a page loads at; `startHour` (6, sunrise) stays
the game's start. Every host that read `SKY.startHour` for its clock now reads `viewHour` (47 source files: the biome kits, the
Korona and Throne stations, the core sky hosts). **Only nhighlands is rebuilt**; the owner (2026-10-26): change the sources now,
verify each build when its turn in the rebuild comes. Each build's verify views keep their own day/dawn/night modes.

### Every build in the rebuild: its card cells (the owner, 2026-10-26; corrected 2026-10-27)

The owner caught cut-out cards "loading as a sheet rather than discretely" (2026-10-26), then "these imposters improperly
split the cutout textures. this seems to keep happening" (2026-10-27: the Rift's station 3, fern fronds floating loose round a
tree-fern's trunk). **The 2026-10-26 rule here was wrong for fronds and strands, and spread the bug**: it said a single-plant
image "loses its cell" and is drawn whole. But `BIO.geo.frond` and `BIO.geo.ribbon` draw their texture **once a segment**,
along v from the stem (frond) or hung end (ribbon) at v 0, and a clump's tripod shows its image upside down. A whole library
fern on a four-segment frond is four small upside-down ferns end to end: floating fronds. A whole vine on a ribbon is four
stacked vines; a bush on a clump stands on its head. nhighlands, "done" under the old rule, still has it (fern, lady, beard,
under).

**The fix (core/biome, 2026-10-27).** A card geometry that holds its plant by one end declares that end
(`geo.userData.card`: frond, ribbon, hang, clump), and a slot names where its plant attaches in the image: `"base"` (bottom,
top, left, right, centre), with `"cell"` the plant's **tight alpha box** (not a third of the sheet). `BIO.def` then turns the
geometry's uv so the two ends meet, and spans the plant once down a frond or ribbon (`20-core-kit.js`, "A LIBRARY CARD ON ITS
GEOMETRY'S AXES"; `core/biome/test-cards.js`). A slot with no `base` draws exactly as before. A kit's own geometry can declare
its end too (the Rift's groundsel heads: `G.rosetteUV` with `userData.card = {base: 'left'}`).

**Per build, at its rebuild turn:**
1. `python3 tools/textures/check_cells.py <build>`: each card slot against the plants in its image (tight boxes, the grid or
   uneven boxes; bases from the image's `meta.json` anchor, or `core/materials/library/card-bases.json` for a sheet) and the
   geometry its BIO.def line draws it on. Faults: WHOLE SHEET, CELL CUTS (a fragment of its plant), CELL OFF GRID, LOOSE
   (margins round a plant held by one end), NO BASE (a frond, ribbon, hang or clump with no base: the floating fronds), BASE
   WRONG, BASE UNKNOWN (add the sheet's base to card-bases.json, by eye), NO STEM (a crown on BIO.geo.clump: its sprigs
   are to be held by their stems at the twig and run out along their long axes, `"stems"`; the owner's rule, 2026-10-27,
   replacing the centred tripod and the `"sheet": "geometry"` cells for crowns). Each comes with the cut it proposes.
2. `python3 tools/textures/card_probe.py <build>`: the slot drawn on its geometry as the page draws it (core/biome itself, in
   node), left as it is, right as proposed. **Look at it**: a sheet whose plants overlap can be read wrong (`--plants card.x`).
   **Approved by the owner (2026-10-27), for every build's turn:** apply `check_cells.py`'s proposals on core geometry
   (frond, ribbon, hang, clump: the crown stems from the 3D renders, the fronds, strands and bushes), with two exceptions:
   **xanadu's `raceme` stays as it is** (the old look is better) and **`card.flower.bloom`'s proposals are wrong** (its rows
   touch; leave the cell). The bases and stems the owner saw are in `core/materials/library/card-bases.json`.
3. `check_cells.py <build> --fix [--slots=a,b]` writes the proposals you accept; a crown's WHOLE SHEET still takes
   `"sheet": "geometry"` and `BIO.geo.cells(...)` in the code (three sprigs a card at .6; `about:'origin'` for a stem spray).
4. `python3 tools/textures/pack.py <build>`, rebuild, look at the items in the page; `card_probe.py <build> --before <rev>`
   shows what changed.

On 2026-10-27 the check found 386 faults in 32 of the 71 materials.json (215 whole sheets, 74 no base, 59 cells cutting their
plant); 173 of them on core geometry (frond, ribbon, hang, clump) in 16 builds: eastabyss and xanadu 22, swlowlands 20, nwbay
and nwlowlands 19, swbay 14, hyperjungle 13, ringisles 11, nhighlands 10, necanyons and sedesert 6, abyssal-savannah, guilin
and k-guilin 3, geyser and oidong 1. Their probe sheets are in the
session notes (`card-probes/<build>.png`). Builds whose code draws cards without BIO.def (crops, the settlements) show "-" for
geometry: only their cells are checked. The Rift is fixed (its seven, the understorey clump, the groundsel heads). At
close-out, add `check_cells.py --strict` to `tools/test_all.py`.

### Backporting the new modules to the existing biomes (the owner, 2026-10-26)

**`BACKPORT.md`** maps the new core modules and shaders onto every existing biome and station: the universal set every rebuilt
biome takes (section 1) and a row per biome (section 2: terrain kinds and strata, ground shader kinds, air, water extensions,
life, hazards). Each biome's session takes its row at its turn in the rebuild, checks it against the kit's plan and the scale
model, puts look changes behind a switch, and verifies once.

### New stations for the old kits, second pass (the owner, 2026-10-26)

Six more kits have a `PLAN-STATIONS.md`, surveyed on the live model (4.23) with `tools/scale-model/survey_biomes.py`:
nsemiarid, nwlowlands, crater-drylands, xanadu, geyser and ringisles (`biomes/WORLD.md`, "New stations for the old
kits"). The owner settled two points: **Korona's plume is active** (geyser fields in its trenches: the geyser kit's
`corona` station; `korona/NOTES.md`), and the cone on **Xanadu's south-eastern wall** holds an ice field (`ice`). Each
station is built at its kit's turn in the rebuild, with its `BACKPORT.md` row.

### Every build in the rebuild: the foliage guards (the owner, 2026-10-27)

Cut-out cards drawn wrong, foliage floating and branches without leaves kept coming back build after build, each fixed
locally and repeated in the next. Three guards now catch them in every page, and every verify that runs `hostChecks` runs
them (`core/host/95-host-probe.js` appends them; `core/biome/test-guards.js`):
1. **The card guard** (`20-core-kit.js`, `BIO.def`): the core refuses, through the error panel, a sheet of plants drawn whole
   (no cell, no stems, no cut by `BIO.geo.cells`, `"sheet": "geometry"` or the kit's own uv), a library plant on a frond,
   ribbon or hang with no `base`, and a crown on the clump with neither `stems` nor `base`. It knows what each image is from
   the pack (`plants`, `anchor`: `tools/textures/pack.py` writes them now), so a build is checked from its first re-pack.
2. **The attachment audit** (`BIO.attachAudit`, host check "foliage held by its structure"): every leaf and hanging card more
   than 2 m above the build's ground (and not reaching down to it) must start within a quarter of its size (a centred tripod:
   six tenths) plus half a metre of bark, a rod, rock, a wall or water. Over 1% floating fails, naming the items and the
   worst places. Negative controls: every card lifted 6 m must fail.
3. **One LOD key per tree** (host check "a tree's cards switch with their structure"): a held card must share its
   structure's chunk and never reach further than it. And the core now gives every chunk mesh the height range of all the
   meshes in its chunk (`_lodShareBox`; `BIO.LOD.ownBox` for the old per-mesh box), so a tree's bark and leaves switch at one
   distance and are culled together.

**Calibration** (necanyons, rebuilt with the guards on 2026-10-27, not committed): the card guard found the two whole bloom
sheets (`bloom`, `wort`); the audit found **2,863 of 8,448 cards floating (34%)**, among them 1,496 of 1,585 flametip sprigs.
Its crowns were given stems at its turn, but `crown()` still puts each clump at a point in the crown's volume, not at a twig
tip, so the stems start in the air (one sprig 8 m above its tree, in a probe view). The LOD check passes (2 of 5,585).
**Expect most biomes to fail the audit at first**: it measures what the owner has been seeing.

**At each build's turn, when a guard fails:** fix the placement, not the threshold: put each clump, sprig, frond and flower at
a recorded branch point or twig tip (`crownOn`, `BIO.leafOn`, a leader under any crown top), give the card slots their cell,
base or stems (`check_cells.py`), and keep leaves on the same LOD key and range as their boughs (set `BIO.owner` to the tree's
foot for every part of a tree). An item that floats by design (rafts on water, seed fluff) is defined with `{free: true}`. A
build that cannot fix it all in its turn sets `KHOST.take({guards: {maxShare: <its share now>}})` with a `KNOWN_ISSUES.md`
entry, so the share can only fall. The practices behind this are in the painting-to-3d-world skill, `foliage-kit.md` §15.

### Still to write (core) before or during step 1

- ~~**`BIO.fung`**~~ written (above); the old kits' fungoid parts switch as each is rebuilt (hyperjungle's `fungi`, the `stalk`
  in rift and xanadu, the rest TODO lists).
- **The workstreams' open requests** (files they did not own):
  - core/export (`07-core-export.js`, `42-core-export.js`): split a record by `userData.lod.ranges` and export `instLabels`
    (kit); a real `hazards` section (hazard). Until then a Godot port draws a merged mesh's near layer to its longest range.
  - core/water: route `WATER.wetGround` through `ATMOS.shaderHook` (atmos). **Done 2026-10-26** (branch `claude/core-seasons-b0917b`; `core/water/README.md`, "Seasonal still water and wetGround on shaderHook").
  - core/biome: per-instance AO/crowding from `KSPACE` counts at placement (foliage, research item 5); `khzShadow` in the
    leaf hooks or keep `KHORIZON.shadeScene` per page (terrain); optionally `ATMOS.windGLSL()` (atmos).
  - `tools/textures/pack.py`: a height channel (the `disp` extras) for KGROUND's `h:{from:'a'}` (terrain).
  - core/hamlet `KHAMLET.village`: take `KRES.near(...)` when a spec has no resource (resources); the isle demo passes
    `RES_LEDGER.tradeGoods(...)` to `SIM.trade`.
  - `godot/tools/sync_core.py`: copy `kits/resources/godot/kres_field.gd` with its test and vectors; GODOT-PLAN.md: a pointer
    to `core/hazard/GODOT.md`; the Godot water importer does not yet draw gradients, chutes, riding, puddles, rings, plumes.
  - Prompts to add: `ground.gypsum.crust`, `rock.halite.cut` (resources).
- **Known failures to fix:** core/hamlet's tag parse error from nsemiarid and nwouterwall (seen in test_all); Longsong's
  `test-sim.js`; Verge's layout test (both seen in test_all runs; check whether they fail on this branch); swbay's rain
  occlusion depth pass throws inside three (`isInterleavedBufferAttribute` of null; it retries, then turns the map off).
- **Per-biome ride-alongs noted on the way:** eastabyss line 163 of `75-biome-eastabyss-fauna.js` can go (BIO.dynamic tags it);
  ~~nhighlands' four floor pairs merge by `{label}`~~ (done); k-guilin passes `{drawn:true}` to `KSTACKS.surface`; guilin's osmanthus
  needs `libCol` before `card.osmanthus` (but guilin is frozen: only if the owner asks); ringisles takes `stone.geode.druze`;
  ehighlands, nhighlands, swlowlands and nwlowlands take their new sets (`card.broadleaf.cloud`, `card.epiphyte.garden`,
  `bark.plane`, `rock.marl.blue`); oidong could alternate `bark.carved.b`; the Cut's species exchanges (section 3a);
  swlowlands' spring cypress and ribbon-root, nwlowlands' marl gorge (section 3); the 21 fairness findings in
  `kits/resources/data/ledger.json` are for the owner.
- **Looks waiting on the owner** (section 4 below, plus): the octahedral far trees (darker, thinner crowns than the blobs),
  R13's sprays fanning along the boughs, necanyons' puddles on its Lambert floor (KGROUND's Standard ground should fix them),
  the geyser plumes' density, the hazards overlay's brightness, the punji pit's lip flecks, xanadu's breaker crown (another
  look pass), the swbay temple at 156 m, the far-country and fog changes on the pilots.

### Practical rules (learned this session)

- **One GPU lock**: `C:/Users/travi/AppData/Local/Temp/claude/krator-verify-gpu.lock`, `KRATOR_GL=gpu`. Take it, run, release
  in ONE bash call; give the wait a timeout and report instead of hanging; never remove a lock you did not take unless no
  process holds it (a dead holder stalled four agents for three hours on 2026-10-26). The SwiftShader lock is retired.
- **Span's lessons** (the Span arcology session, 2026-10-27; the full twenty in the side-session notes,
  `span-build-lessons.md`):
  - A fresh worktree holds LFS pointers: a page builds black without an error. Pull the build's `tex/` and library sets first,
    and compare the sidecars' sizes after.
  - In a worktree `port_baseline.py` reads every pointer page as CHANGED: `--update` only your own pages. `audit_port.py`
    rewrites ~80 `PORT.md` files: revert the others with `git -c core.autocrlf=false checkout`.
  - Prefer an opt-in companion fragment to editing a shared core one (`37-core-stacks.js` is in ~13 builds; one added function
    means rebuilding them all). Example: `KSTACKS.contour` in `core/terrain/37b-core-stacks-contour.js` (pillar profile, joints,
    crown, split; on `claude/admiring-rhodes-76b8cd`, cd01ba192, unpushed).
  - core/host: `userData.probePoints` is a flat x,y,z array, and a merged mesh needs `userData.host=true`, or the
    inspector-volume check fails.
  - Fragment order: a build that sorts by name loads `host/35-core-strata-shade.js` before `35-core-strata.js` (key it `35z`);
    a KMAT pack fragment (88x) loads after the host stage, so read `KMAT.packed` lazily in `onBeforeCompile`.
  - Anything hung on a KSTACKS wall follows the drawn mesh, interpolated between its rows (they stand metres apart); stairs
    round a tower are an even helix on a smoothed radius, never a square plan's corners.
- **From the hyperjungle's turn (2026-10-27, 13d147109):**
  - a narrow channel on a coarse ground mesh draws in slivers: make the mesh cells finer than the channel (its 34 m brook took
    ~21 m cells) and cut the drawn ground to the bed inside the channel's plant-free strip;
  - a still over near-flat ground flickers with the camera (depth ties): give the water `depthBias` (`[-1.5,-6]` there) and sit
    the far field's floor under the low-water level;
  - eastabyss's seal-tree builder (B[14] in `src/55`) has an opt-in `S.crown`; abyssal-savannah reads that builder in place, so
    its turn (pair 8) rebuilds on it.
- **Stage files by name.** `git add biomes` swept other agents' unfinished work into a merge commit once.
- **Never kill processes by matching a session id or scratchpad path**: claude.exe carries it. Kill exact PIDs.
- Agents working in parallel take their own git worktree and branch (`git worktree add ../krator-<x> -b claude/<x>
  refs/heads/claude/biome-rebuild`); a fresh worktree needs `git lfs pull --include=` for the textures a page uses.
- Merging a branch onto a worktree with other agents' uncommitted edits: save their diff as a patch, check the files out, merge,
  commit, then reapply the patch to the working tree only (`git apply --reject`), fixing rejected hunks by hand.


For the next session. The sources are merged and pushed (`origin/main` e1d57696e, which contains the branch
`claude/water-migration-merge`: 5 work commits, the merge of 415 upstream commits, the core-use check). **Almost nothing has
been rebuilt since the merge**, so the committed pages and `PORT-BASELINE.json` are upstream's, stale against the merged
sources. The job is to rebuild in this order, verifying as you go:

1. **Biomes** (every `biomes/*`, then the Throne stations).
2. **Settlement kits and object kits** (`kits/*`, `core/charactermodels`, the settlements that are not placed on the map).
3. **Settlements placed on the open world**: Pinnacle Rock, the isle demo (settlement and open-world page), Hook, Longsong.

The audits behind this plan are in `AUDITS.md` (an index of every audit in the repo, the KNOWN_ISSUES batches and what is
left, and the per-biome water and atmos scope).

Do not start with a blanket `python3 tools/test_all.py` rebuild: build one stage, verify it, rewrite the baseline for the pages
of that stage, commit, then the next stage.

## What is in main now

| Area | State |
|---|---|
| `core/water` gap closers | Written, node tests pass (`test-water.js`, `test-gaps.js`, `geyser/test-geyser.js`; `godot/tests/water/gaps_test.gd` added, **not run**). **No taker has been rebuilt against them and none of the biome workarounds is retired.** The agent that was finishing this died on the weekly limit (resets Oct 25, 8 pm Chicago) before the rebuild. |
| `core/water` options (all default to today's output) | per-flow `rapids`; per-point flow width; depth bias for a flow at an open surface's level; `surf:false`/`surfDepth`; per-body tint (tint, mask-region blend, still-pool gradient); `pick:true` (raycast and probe); `fallsOf` returns the chute foot, merged-falls draw; `WATER.terraces` (stepped river: `core/water/ext/53-*`); `seeds:'edge'` and a windowed shore bake; order-independent `WATER.wetGround`; `drawFlow({spray})`. API and the closed gaps are in `core/water/README.md`. |
| geyser and spring kind | `core/water/geyser/` (opt-in subfolder): `WATER.spring`, `WATER.geyser`, `WATER.drawSpring/drawGeyser`. `biomes/geyser` is on it; `openworld/isle-demo/build.py` lists it. Throne 4 and 8, station 1's pools and the isle demo's vents still use their own. |
| atmos host binding | `core/atmos/host/89-atmos-c-hostbind.js` (`ATMOS.bindHost`) and a `src/89a-host-atmos.js` in every older biome and Throne station (hour 13, nhighlands follows `LIGHT_MODE`). Throne station 1's triangle ceiling is 22M (was 20M; draw calls still over 140). |
| water on `core/water` (phases 2 and 3) | hyperjungle, nhighlands, ebadlands, sedesert, swbay, swlowlands, nwlowlands, rift, eastabyss, Throne kipuka, savanna and frontier, geyser, ringisles. Each has `src/89w-host-*.js`. |
| `core/tags` | 24 cultures (Jimjam and Dalab are `VOCAB.noCatalog`; Eternians upstream). |
| catalog | 12 new fruit pieces (62 in all with the north-east canyons'), bundler adds `generic-goods` with `generic-fruit`. |
| Girder | nav graph walkable (`nav-walkable` assert), furniture budget 78 calls, trades table pulled in (`tools/check_trades.py`). |
| little-demo | deprecated; its 17 world fragments live in `openworld/isle-demo/src/world/` (see `openworld/little-demo/DEPRECATED.md`). |
| `tools/check_core_use.py` | a `test_all.py` step; see "The core-use check" below. |

## Stage 1: biomes

Order: core first, then the biomes, then Throne.

1. **Finish `core/water`.** `node core/water/test-water.js`, `test-gaps.js`, `geyser/test-geyser.js`, `godot/tools/water_gaps_golden.js`,
   and the Godot test `res://tests/water/gaps_test.gd` (Godot 4.7.2: `C:/Users/travi/Downloads/Godot_v4.7.2-stable_win64_console.exe`,
   `--headless --path godot --import` once first). Editing a top-level `core/water` fragment changes **every** build that pools the
   folder (settlements and kits take all numbered files): rebuild them all, compare calls and triangles per named camera with the
   pre-change numbers (record them first), and rewrite only the baseline entries you verified.
2. **Adopt the options** in the pages already migrated, removing the workarounds recorded in each `KNOWN_ISSUES.md` and under
   "Open gaps" in `core/water/README.md`: the global rapids preset set by hyperjungle/nhighlands/kipuka/frontier/swbay/swlowlands;
   the second masked open surface used for tint in swlowlands/nwlowlands/rift/eastabyss; flat 10 m flows in frontier; invisible pick
   discs in savanna/ringisles; the white surf band clamp at 1.4 m in rift/eastabyss; falls re-deriving the chute foot in swbay.
3. **Phase 4 water** (hard ones, now with the options): nwbay (stepped river: `WATER.terraces`; 276 of 300 draw calls, add at
   most 24), Throne 4 (isle: sea, lagoon, creek, fall, springs, geysers), 5 (falls), 8 (vents, mud pots), 9 (glacier lake and
   braids), 1 (hot pools and acid lake as `WATER.spring`/`still` only: it is at its triangle ceiling, no CDLOD), geyser's creek and
   terrace pools, shighlands streams (a stream line must be derived from the ravine records), oidong (70 m cataract, the drop is
   untested in `drawFall`), xanadu (lake, fall, fountain jet), ehighlands (bog pools; the frozen tarn stays local: no ice kind),
   crater-drylands (the seep; the fire lift waits for a fire design). Keep `waterH` and `terrainH` unchanged in every biome.
4. **New upstream biomes**: korona (6 stations), necanyons, nsemiarid, guilin, dambasins, scablands. Korona, necanyons, nsemiarid and
   guilin already list `CORE_ATMOS` and `CORE_WATER`; dambasins lists one of each; scablands lists neither. None has the host
   binding or the new options. `tools/check_core_use.py --list` shows their gaps (necanyons has a `MAT_WATER`, nsemiarid its own sky
   dome, korona a `fract(sin())` hash). Scablands and dambasins are overlays on the n semiarid and Ancient Port kits read in
   place: check whether the modules arrive through the kit before treating "MISSING" as real.
5. **Biome-side ride-alongs** (`TODO.md`, "Card sheets shown whole", 2026-10-23): give the eight inline `matlib_pack()` writers
   (crater-drylands, ebadlands, ehighlands, shighlands, oidong, Throne, Zeijani, Girder) the `cell` key or move them onto
   `tools/textures/matlib_pack.py`; audit the 215 sheet slots (`python3 tools/textures/cell_audit.py`; biggest: Throne 39, Crops
   44, Korona 15, Necanyons 15, Longsong 14, crater-drylands 12, ebadlands 10); mark sheets in the library meta. Put the
   `core/host` fixes in the same rebuild (below).
6. **Planned shaders** (`TODO.md`: Rendering ideas, Lava, Geothermal, Effects). Not part of the rebuild; sequence after it:
   one shared flame and heat-haze effect (crater-drylands, Throne caldera), a lava field shader (Throne caldera and tube), cloud
   shadows through one shared chunk, the `jet`/`dustburst`/`burst` fx kinds. Hot-spring ramps are already `WATER.spring`.

## Stage 1, final: consolidate, then rebuild every biome (2026-10-26)

The owner (2026-10-26): "let the subagent sessions finish up, then consolidate, synthesize, and rebuild all biomes again", with
the plans committed to main that day folded in. Stage 1's items above are done on `claude/biome-rebuild` (water on core/water in
every biome; known-issues passes; the owner's three texture drops in the library). What is left, in order:

**1. Let the running work land** (each reviewed and committed separately; none merged without the owner's word):
- Agents in the worktree: Korona (the buried-pitcher punji pit), necanyons, geyser, the Throne (water in every station's export
  profile), nwbay design, swbay's waterfall risers, the Xanadu and Oidong diversity passes, the abyssal savannah
  (`biomes/abyssal-savannah`, a new kit), ebadlands' brimstone reeds on `card.reedbrim` (built, verify pending).
- Sessions on their own branches, to merge into `claude/biome-rebuild` when the owner says so: the shared sky rollout
  (`claude/sky-plan-200841`; S1 swbay already merged), the Cut, the NW outer wall (its station 3 draws the Yeti capital only
  with `kits/yeti`, branch `claude/yeti-kit`), the Catch, Farside, the Bowl (sedesert station 2), k-guilin (the Hykkousoi
  hinterlands; `biomes/guilin` is frozen as an Earth reference). Merge order: the sky first (it touches every biome's sky
  fragments), then the new biomes (new folders; `kits/crops`, `kits/resources`, `PROMPTS-NEEDED.md` and
  `painting-to-3d-world.skill` are the shared files to watch).

**2. Core changes, one approval** (each proposed by a biome agent; none made yet; each needs every taker rebuilt):

| Change | Where | Fixes |
|---|---|---|
| **A bug in every textured biome:** `BIO.libSwap` sets a card's cell offset on the texture `KMAT.textures` caches once per sheet, so every slot cut from one sheet draws the LAST slot's cell. Fix: clone the texture when `L.cell` is set (copy the image when it loads) | `core/biome/20-core-kit.js` (`libSwap`), `core/materials/record` | found by the NW outer wall (its three crops all drew goldroot; it works around it in the kit). Every biome with two slots on one sheet is affected: rebuild them all after |
| `cloudShade` recursion | core/atmos (the shared sky) | reported by the NW outer wall; for the sky rollout to fix before its merge |
| LOD meshes keyed by chunk with instances sorted by range (`lodTick` sets counts), or a per-material merge plus `minTris`, or a per-pass chunk size | `core/biome/20-core-kit.js` (`bake`, `_lodEntry`, `_lodKey`, `lodTick`) | the runtime-LOD draw-call cost in nwlowlands, swlowlands, swbay, rift (hero sub-chunks or a dithered cross-fade for the pop at 1.2 km) |
| A per-vertex second bark colour (`aC2`) | `BIO.glossBarkMat` (`core/biome/30-core-foliage.js`) | two-tone bark shared per bucket (both lowlands) |
| `BIO.lathe` `rep` as a function of the ring | `core/biome/20-core-kit.js` | seams where bole sections change repeat (hyperjungle and its takers) |
| Per-instance inspect labels (`BIO.put` `extra.label` to the bake, `93-host-inspect` by `instanceId`) | core/biome, core/host | lets floor item pairs merge (nhighlands: 4 calls per near chunk) |
| `BIO.dynamic` sets `userData.kit`; a runtime `BIO.range` | core/biome | eastabyss's export tags and far ring |
| `BIO.animMat` reads a flap rate of 0 as 6 (`x || d`) | `core/biome/35-core-anim.js` | a default bug (sedesert passes 1e-9) |
| A `spin` option in `foliageHook` | `core/biome/30-core-foliage.js` | nsemiarid's trumpets did it host-side |
| An ice kind; per-flow foam; a shoaling limit; flow junctions; a flow holding a level over a rising bed; `drawPools` gradient; a fall that follows a sloped face; spray scaled to the drop; `WATER.rideGLSL` for instanced floaters | `core/water` | ehighlands, nsemiarid, ringisles, eastabyss, oidong, rift, eastabyss's pads |
| The water export section filtered to the test box | `core/export` adapter, or each verify's box | water cannot join a profile whose 300 m box holds none (shighlands, ehighlands) |
| `ATMOS.sky` overwrites the weather's fog unless given `weather:`; swbay-template pages have no hour slider without `clock.onSet`; the ground dither copied in two biomes | core/atmos, core/host | Farside's notes |

**3a. Species exchanges agreed for this rebuild (after the shared sky is merged).** The Cut (`biomes/cut/PLAN.md` section 12,
owner 2026-10-26): crater drylands -> the Cut (tree aloe, parasol pine); the Cut -> crater drylands (rankgrass, the measure
melon, whose three sizes breed true outside the bowl: a crater-drylands home for it in `kits/crops`), **the drylands' northern
region only** (`rmuqlfgh1u6d8`, north and west of the Throne where the crater mouth opens; a mask of that region on the drylands
side; the southern region `rmuqlgonah5tp` neither sends nor takes them); nhighlands -> the Cut
(rowan, great trumpet); the Cut -> nhighlands (circle lichen, ring reeds). Each species stays in its home kit and the neighbour
reads it in place under a mask. The Cut-side lists are in `biomes/cut`; the crater-drylands and nhighlands reads are to do.
The NW outer wall's crossings (`biomes/nwouterwall/ECOTONES.md`) stay a proposal: its station 4, the Wall foot, is for a future
session.

**3. From main's plans (c984cef0f, 47c645159).** The flora exchanges (`biomes/swbay`, `swlowlands`, `nwlowlands` `PLAN-FLORA.md`)
wait on species from two kits not yet built (`biomes/swhighlands`, `biomes/wouterwall`), so they are not part of this rebuild.
What can ride along now: the budget lines (swlowlands' ceiling 12M -> 15M, nwlowlands ~9.6M -> ~12.6M, `KNOWN_ISSUES.md`);
swlowlands' own derived species (the spring cypress at the clear springs, the ribbon-root tree in the swamp: its own builders);
nwlowlands' blue-grey marl gorge (a `core/terrain` carve along the `rip` streams at the wall's foot). The four new kits'
24 texture prompts are in `PROMPTS-NEEDED.md` sections 20-23.

**4. The owner's looks to judge** (shots in the session scratchpad, folders named in each commit): nwlowlands' Inner Wall range;
nhighlands' fireweed, lichen floor and floating-forest trees; nsemiarid's poplar crowns, soda crust, dew garden; eastabyss's
thinner shallows and pad bob; swbay's 156 m temple and taller canopy, and its caps/gills/shelves (they clip too: the fix
flattens the warts); hyperjungle's terracotta ironbark; rift's fractal fins and new waterfalls; swlowlands' salt marsh;
the LOD trade (fewer calls for more triangles) in nwlowlands, swlowlands, swbay.

**4a. The research picks, for one approval (2026-10-26).** Five reports: `biomes/DETAIL-RESEARCH.md`, `HEIGHT-RESEARCH.md`,
`WEATHER-RESEARCH.md`, `HAZARD-RESEARCH.md`, `kits/resources/PLACEMENT-RESEARCH.md`. Their top picks, merged (two reports
proposed the same height fog, two the same wind field):

| # | Feature | From | Where | Cost |
|---|---|---|---|---|
| R1 | Height fog with sky and sun in-scatter, valley mist pooling, a cloud band at mid-height, drifting with the gusts (replaces `FogExp2`) | height 1+4, weather 4 | `core/atmos` (one fog chunk), with the sky-fog fix above | 0 draws, ~20 ops/pixel |
| R2 | Horizon-map terrain shadows and sky visibility (a ~1 s bake per page) | height 2 | `core/terrain/43-core-horizon.js` | 2-4 MB, 3 reads/pixel |
| R3 | A shared far-field ring (`KFAR`, nwlowlands' range made core; optional height exaggeration, curvature drop) | height 3 | `core/terrain/44-core-farfield.js` | 0.1-0.3M tris, 1-3 draws |
| R4 | One core ground shader: height-blended layers, hex tiling, distance scale (ends the per-biome ground copies; lifts the dither) | detail 1 | `core/terrain/43-core-ground.js` (rename one of R2/R4) | 0 draws, ~3 reads/layer |
| R5 | Floor cover takes the ground's colour at its root and fades into it past its band | detail 2 | `core/biome/30-core-foliage.js` | 1 read/vertex |
| R6 | Octahedral impostors for far trees (in place of blobs) | detail 3 | `core/biome/33-core-impostor.js` | 2 tris/tree, 1-4 MB/species |
| R7 | Alpha-to-coverage on leaf and grass cards with MSAA | detail 4 | `leafMat` | free |
| R8 | One wind field: foliage, grass and water chop read ATMOS's travelling gusts | detail 7, weather 5 | `core/biome/30-core-foliage.js` | 1 noise/vertex |
| R9 | Wetness and puddles in hollows, rain rings on puddles and water | weather 1+2 | `core/water/51-core-water-kinds.js` | shader only, mask <1 MB |
| R10 | A rain occlusion map (dry under canopies and roofs; snow and drips read it too) | weather 3 | `core/atmos/89-atmos-4-weather.js` | 1 small depth pass every ~20 m |
| R13 | Leaves attach to branches by the stem (owner, 2026-10-26): cards pivot at their stem anchor (the library card's `anchor`), a `BIO.leafOn`/`leafAlong` helper places them along a twig with phyllotaxy, droop and sunward bias, an opt-in orientation on the clump/crown builders, then each kit opts in during its rebuild | owner | core/biome (the foliage workstream) | 0 draws; placement moves only where a kit opts in |
| R11 | The hazard key and `KHAZ` queries, the hazard overlay and inspector, one clock for cyclic hazards, navigation costs in the walk export | hazard 1-4 | `core/tags`, new `core/hazard`, `core/walk` | records only |
| R12 | Geology provinces baked on the scale model, a cell-hashed node field, river-carried placers and ringed salt basins, a polity scarcity ledger | resources 1-4 | `tools/scale-model/geology.py`, `kits/resources` | offline bake |

R1-R3 and R10 land after the shared sky merges (they read its `air` preset and hook the same materials). R4 and R6 are the
large ones; R6 fits the LOD rework (core change B1). R11 and R12 add data, not looks: no page should change except where a
kit registers hazards or nodes.

**4b. From main (d72ba6dba, merged as 3c0ddf35a).** `TODO.md`, "Rebuild the old fungoid flora on `BIO.fung`" (the owner,
2026-10-26): `core/biome/33-core-fungoid.js` (spec in `biomes/outlands/PLAN.md`) is to be written and the old kits' fungoid
parts (the hyperjungle's `fungi`, the `stalk` in rift and xanadu, and the rest that TODO lists) switched to it in this rebuild.
The Yeti kit (Y1-Y4) is in; its section 11 ("the shared culture rebuild") waits on two more kits. The kit workstream's
impostor fragment is `34-core-impostor.js` so as not to clash.

**4c. The order (the owner, 2026-10-26).** First the new core modules and the infrastructure fixes (the seven workstreams,
merged with their tests and pilots). Then the biome pages one by one, each taking every old and new core module, its unwired
textures (the pre-wired sets of the fourth drop) and its ride-alongs. **The test bed is `biomes/nhighlands`** (it exercises
R1-R10, R13, B1-B5, W1/W2/W4, snow, weather, BIO.fung, the Cut's exchanges). After nhighlands is rebuilt:
1. **An optimization pass on it**: draw calls and triangles per view against its budget (32M held), the floor bands, shader
   cost of the new chunks on an integrated GPU, page size and texture memory (the packs, the impostor atlases, the horizon maps).
2. **A Godot spike of it**: export it (`tools/harness.py export`, core/export's profile) and bring it up in the Godot project
   (`godot/`, 4.7.2; the importers and shaders the port spike has, `GODOT-PLAN.md`), with MultiMesh for the instanced flora,
   then measure draw calls, GPU time and memory there.
3. **Assess ways to cut the graphic load, both engines**: merging textures (a texture array or atlas per bucket: the isle
   demo's M7 texture arrays are prior art, `settlements/isle-demo/PLAN.md`), material merging so more items share a draw,
   GPU-compressed textures (KTX2/Basis in three.js, VRAM-compressed imports in Godot), mip and size caps per family, HLOD for the
   far field, and what the octahedral impostors and the LOD rework already bought. Write the findings and a recommendation
   before the remaining biomes are rebuilt, so they take the chosen scheme.
Then, in the owner's order (2026-10-26): **the Throne's vents station** (the test bed for hazards, snow and weather: the hazard
key and overlay, the cyclic vents and pools, ash and snow weather, wet ground and rain occlusion), **then the NW outer wall**
(cold-climate snow cover, nhighlands read in place, the Yeti capital once `kits/yeti` is in), **then the rift** (the heaviest
page: 25.7M held, up to 587 calls; a second measurement of the graphic-load scheme chosen in step 3, to confirm or tune its
gains), **then the rest** of the built biomes. After them, three planned kits are built as the next core tests (the owner,
2026-10-26): **the SW highlands** (`biomes/swhighlands/PLAN.md`: BIO.fung in earnest, falls on sloped faces, the rain wall, the
landslide lake, the pillar-rim tableland, R13; it also unblocks the swbay and swlowlands flora exchanges), **then the
Godthrone** (`biomes/godthrone/PLAN.md`: height fog and sky thinning to the airless rim, lava and vent hazards, the bloodfalls
and blood river, the megabreccia crest on the core ground shader), **then Godstep valley** (`biomes/godstep/PLAN.md`: the god's
stair of lava steps, rilles, colonnades, black sand; the case for a core strata/landform module).

**5. The rebuild.** Rebuild every biome and station (`python3 build.py`; Throne and Korona `--station`), verify each with
`KRATOR_GL=gpu verify.py --assert --all-views` on the one GPU lock, `python3 tools/check_core_use.py --write-baseline` (it should
shrink), `tools/port_baseline.py --update` only for pages checked, `tools/test_all.py`. Then everything a shared change reached:
the hyperjungle's readers (geyser, guilin, korona, necanyons, ringisles, the Throne incl. kipuka and frontier, Dhelv, Highlands,
Iziz, Pinnacle Rock, Screamers, the Lizardmen, openworld isle-demo and little-demo), sedesert's readers (ringisles, korona's gorge,
little-demo, isle-demo), eastabyss's (isle-demo, Locus, Mungo, Verge), swbay's species (Voth's gardens), nwbay's species (k-guilin reads its 50/55/56 and tex pack), `core/terrain`'s carve
(Shade), nsemiarid's overlay (scablands), oidong (Longsong), necanyons (Pinnacle Rock). Then stages 2 and 3 below.

## Stage 2: kits and the unplaced settlements

- Rebuild every kit and settlement that bundles the catalog, `core/water`, `core/atmos`, `core/tags` or `core/host`: the pooled-folder
  builds are listed by `grep -l "os.listdir(d)" settlements/*/build.py kits/*/build.py` (dhelv, girder, highlands, locus, mavs-refuge,
  mungo, noahs-regret, shade, yuni, ash-nomads, crops, desert-nomads, islanders, lizardmen, post-apoc, resources, scyvoi, zeijani, plus
  others that list the fragments by name: iziz, pylon, talia, verge, ys, port, reedlake, xanadu, jimjam, dalab).
  `kits/interiors` builds before `kits/ancients-interiors`, which loads its `dist/interiors-core.js` (CLAUDE.md).
- **The ride-along fixes** (`TODO.md`, "Ride along with the next all-builds rebuild": do them in this change, rebuild once, rewrite the
  baseline once):
  - the probes read `userData.probePoints` (`core/host/95-host-probe.js` `_probePoints`, 24 builds, and the Ancient Port kit's
    `settlements/port/src/91-probe.js`: port, Hook, Ys, the dam bed); then the dam bed's flotsam markers
    (`biomes/dambasins/src/52-db-flotsam.js`) and the scablands' erratics (`biomes/scablands/src/87-host-erratics.js`) set it and
    drop their hidden markers;
  - guard `setPointerCapture` in `core/host/90-host-camera.js` (138 builds); remove the Iziz palace page-only guard
    (`settlements/iziz/targets/palace/95q-palace-cutlabels.js`);
  - re-vendor the catalog symbols (`kits/catalog/krator-symbols.js` from `core/sockets/38-symbols.js`: lotus, scroll);
  - reword the `core/hamlet` `xanadu` row comment;
  - doors as a core module and real doors and glass across the kits are later (a design task), do not fold them in.
- **Settlements not placed on the map are left alone** apart from that rebuild: no biome-file updates, no water or sky work, until they
  are built on the map. Mungo and Shade take `core/simulation` but not `core/city`; the owner says both could take `core/city`
  (do it when they are placed or when convenient). Dhelv (split into caves) cannot yet: `core/city` needs a **cavern setting**
  (the Tungang holds will need it too). Longsong ties into the sim already (`40d-ls-sim.js`, `SIM.pose`) and takes only one
  `core/city` fragment (33) and the relief fragment of `core/terrain`: it needs a **single-complex mode** in `core/city` (a
  pre-planned footprint as the one lot) and then moves onto the module. Both are core/city features, not started.
- Open from the nightly: `settlements/girder` and `walk settlements/girder` end on SwiftShader's `reading 'trim'` error panel only
  (all invariants pass); the same page fails on a clean HEAD build and is clean on a real GPU. Run it on the Linux CI image
  before spending time on it. Iziz, pylon and talia end FAILED on `CONTEXT_LOST_WEBGL` only. `world-yuni` json grew 12% in the
  export report (over the 10% tolerance). `interiors` pages are about 4 KB smaller than their baseline entries
  (another session's `kits/interiors` edits: find out before rewriting them).

## Stage 3: the placed settlements

Pinnacle Rock, the isle demo, Hook and Longsong have sites on the world map with their biome data and are **rebuilt whenever the
biome files change**; this stage comes last, after the biomes and kits they read are settled.

- **Isle demo** (both pages): `openworld/isle-demo` lists the geyser fragments by explicit path; the open-world verify fails here on a
  known SwiftShader error (`ATMOS.skylight` `reading 'trim'`, identical before and after), so check on a real GPU (the in-app
  browser: `preview_start`, GPU loads in ~15 s). Fix its `check_core_use` findings: `getImageData` in `88a-world-atlas.js`,
  `88t-world-towns.js`, `world/98-world-start.js` (use `core/mask`), a PRNG in `world/91-world-probe.js` and its own sky dome in
  `world/80-world-sky.js` (the `core/atmos` host binding); settlement page: `getImageData` in `98-isle-start.js`. One dry spring
  pool at vent 1's spouter showed no spout in the browser check: look at it. Another session (Isle demo P7b, worktree
  `.claude/worktrees/inspiring-swanson-212800`, unpushed) edits the same files: replay the 17 `git mv` renames of
  `little-demo` -> `openworld/isle-demo/src/world/` there first, then its content edits.
- **Hook**: missing `core/rand` and `core/tags` in `build.py` (`check_core_use`); it reads the Port kit's fragments and the scale
  model (`KLAND`); rebuild with `settlements/port` and Ys's vendored copy.
- **Pinnacle Rock**: no findings; rebuild and verify.
- **Longsong**: no findings; its biome is the Oidong valley. Rebuild and verify; the core/city single-complex mode is separate.
- The gallery: `gallery/build_gallery.py` labels little-demo deprecated; republish only after the owner's yes (the Throne, Korona and
  the north basin's three biomes were published 2026-10-20 and 2026-10-23).

## The core-use check

`python3 tools/check_core_use.py` (a `test_all.py` step; README "CORE MODULES ARE NOT OPTIONAL"). It reads each `build.py`'s code (not
comments) for the core modules its kind needs (biomes: biome, rand, tags, host, atmos, water; settlements and kits: rand, tags; a
settlement that takes `core/simulation` must take `core/city`) and each build's own fragments for a PRNG, a `fract(sin())` hash,
a value noise, `getImageData`, `MAT_WATER =` or a sky dome. It compares with `tools/core_use_baseline.json` (252 findings today:
debt, not a pass). Exceptions in the script: `NOT_APPLICABLE`, `PLACED` (the four above: the sky and water rules apply), `SINGLE_COMPLEX`
(Longsong) and `CAVERN` (Dhelv). `--list` shows everything; `--write-baseline` accepts today's findings (only to shrink the file after
fixing, or for a deliberate exception: say why). Aim: the baseline reaches `{}`.

## Practical notes for whoever runs this

- **Agents**: the weekly limit stopped subagents on 2026-10-21; it resets Oct 25, 8 pm Chicago. Subagents of this session's kind
  (Sonnet, general-purpose) did the water migration well when each had one biome set and a written brief; give each the pooled-folder
  rule, the verify lock and the baseline rule below.
- **Pooled folders**: builds in `settlements/` and `kits/` take **every numbered `*.js`** at the top of `core/water`, `core/atmos`,
  `core/tags`, `core/walk`, `core/lod`, `core/rand`, `core/furnish`. A new top-level fragment there changes all of them and fails their
  "generative fragment does not open with reseed(N)" rule. Put opt-in code in a subfolder (`core/water/geyser`, `core/water/ext`,
  `core/atmos/host`) and list it by explicit path from the builds that want it.
- **Verify lock**: headless Chromium crashes if two `verify.py` run at once. Take it with `mkdir C:/Users/travi/AppData/Local/Temp/claude/krator-verify.lock`
  (retry every 20 s) and `rmdir` after; never hold it while building. A SwiftShader `reading 'trim'` error panel and
  `CONTEXT_LOST_WEBGL` are known flakes: rerun once alone.
- **Baseline**: never `tools/port_baseline.py --write` while other sessions have uncommitted work; edit only the entries of pages you
  rebuilt and verified (text replacement of bytes and sha256 with the tool's `read_lf`/`sha`). After a full rebuild of a stage,
  `--write` is fine **if the tree holds only your work**. As of this note 36 pages differ.
- **Do not run `tools/audit_port.py` or `make_index.py` for one build**: they ignore the argument and rewrite every `PORT.md`/`INDEX.md`
  (three sessions did it by accident; the `PORT.md` churn in the merge came from this). Restore with `git checkout` the ones you did not mean.
- **Windows**: `README.md`/`.js` mix CRLF and LF; `open(..., encoding='utf-8', newline='')` and edit single lines. Heredoc backslashes
  break regexes: use the Edit tool or `chr(92)`. The auto-mode classifier denied one long chained `git add`/`commit` command; single
  steps went through. `git lfs` is needed for built pages; `http.postBuffer` is 500 MB here.
- **Godot** 4.7.2 at `C:/Users/travi/Downloads/Godot_v4.7.2-stable_win64_console.exe`; `tools/test_all.py` skips Godot unless `GODOT` is set.
  `atmos_test.gd` fails on two EOL-only differences in `godot/shaders/atmos_{waves,clouddeck}.gdshaderinc` on this Windows checkout (a
  regenerate changes only line endings: `node godot/tools/atmos_waves.js`).
- **Local files**: `.claude/launch.json` holds 16 local preview servers (many point at deleted sibling worktrees) as an uncommitted
  edit; three untracked originals (`CORE-ADOPTION.md`, `biomes/korona/NOTES.md`, `core/charactermodels/HANDOFF-CLOTHING.md`) were moved
  to the 2026-10-23 session's scratchpad because upstream had its own; `.agents/`, `.codex/`, `AGENTS.md`, `head_readme.md`
  are untracked tool leftovers, not part of this.

## Decisions waiting for the owner

- Gallery: republish for the water/atmos changes? (CLAUDE.md: a shared change is the owner's call.)
- Mungo and Shade onto `core/city`; the core/city **single-complex** and **cavern** modes (Longsong, Dhelv, the Tungang holds).
- Mud pots as a water kind; extending `extentOf` in the shared export adapter with a geyser branch; widening Geyser's verify box so
  the sea is required too.
- Girder: the `furn.calls` ceiling is re-baselined to 78 (a catalog low-detail variant could bring it back down).
- The brown ground squares through swlowlands' water (KI:43) need ground work, not water work.
