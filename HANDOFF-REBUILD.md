# Handoff: the all-builds rebuild

## The second integration pass (2026-11-10, `claude/integration-2`; read first; not pushed)

One branch with every finished branch not yet on `origin/main` (the Ancient's Valley and the sessions still working left
out), ONE all-builds rebuild on this machine, the GPU verify on both lanes. Pushing is the coordinator's, after the owner reads this.

**Merged** (in order, on top of the kits round `ccr-55bd6ee1-p1si44` and its `-allbuilds` ride-alongs):
- local: `claude/quizzical-kirch-b98137` (snowBare, KSPELEO, the Oidong vent dose; with `claude/rift-hearths-cavern-b8baf6`:
  rift station 5 the gypsum maze, riftrim station 7 the Hearth field), `claude/swhighlands-rest-f8a7ee`, `claude/nsemiarid-scablands-3b022c`
  (and its later build-inputs commit), `claude/abyssal-savannah-rest-240d14`, `claude/openworld-sites-24defd` (core/world, the sites,
  Pinnacle Rock at its new spot), `claude/outpost-registry-6c40e9`, `claude/water-migration-merge` (core/audio and the Audio Lab, the
  cue picker inside it), `claude/garment-defects` (local, newer than origin's; through 35eb45f68), `claude/voth-citadel` (the
  Ordinators' citadel def, not placed), `claude/bold-keller-756e90` (GarmentCode notes);
- cloud: `origin/claude/twins-finish-cloud` (= `stoic-fermat-9kqllo`; carries `cloud-kits-verify`, `core-plan-features` and the six
  `ccr-*` kit branches: twins, godshearth, godstep 1, greenstep 1, outlands, W outer wall 1, the Firebliss plan, scale model 5.1
  edits 2-3), `origin/claude/godstep-finish-cloud`, `origin/claude/greenstep-finish-cloud`, `origin/claude/busy-keller-lstwje` (Nephtos),
  `origin/claude/dreamy-tesla-wzp8hw` (Verge takes 35-core-anim), `origin/claude/enterprise-starbases` (the Menagerie; insulation passes),
  `origin/ccr-55bd6ee1-p1si44-allbuilds` and `-hlxa` (their late commits);
- `origin/main` at 9cdbee13e (the textures delivered 2026-11-10);
- later the same day: `claude/cloud-gpu-lane-7e39d9` (the cloud GPU lanes `vast0`/`vast1`, `tools/CLOUD-LANE.md`; the machine is
  stopped, the lanes unused this pass) and `claude/fervent-meninsky-feaa80` (a `core/materials/PLAN.md` note, no page).
- last: `claude/stoic-boyd-3ba6cf` (scablands station 2's NW lowlands half, `highline-nw`, and nwlowlands' overlay fragment 57;
  its session finished it after this pass's brief was written): nwlowlands, nwlowlands-margins and highline-nw rebuilt here.

**Resolved by hand:** the generated files took one side and were rebuilt. `core/materials/PROMPTS-NEEDED.md` keeps every side's
sections, renumbered 43 (the gypsum maze), 44 (the Hearth field), 45 (raw clay), recounted 37. Nephtos's `busy-keller` was based
on an old main: HEAD's construction kit, isle verify and core/world paths kept, its shell and nacre piles ported as `KCONS` `slabs`.
The Audio Lab branch carried an older copy of the scale-model build: HEAD's 5.1 copy kept, and its raster LFS rules dropped from
`.gitattributes` (HEAD stores them as plain blobs). `.claude/launch.json` is the union.

**Triage of the older branches:** `claude/weapon-racks`, `claude/confluence-swhighlands`, `origin/claude/busy-maxwell-8uvk60`,
`origin/ccr-05259b8d-kuy4pm`, `claude/biome-lod-cells`, `claude/eloquent-swartz-7f7b41`, `claude/yeti-y5`: already in.
`claude/nonhuman-spike`, `claude/izv-bundle` and `claude/great-turing-3e145c` (core/world and `vernacular.py` replaced them),
`claude/sweet-bhabha-e3b98e` (its skill section 5v: the skill's "reference, not a log" rule since; `core/water/PRACTICE.md` holds it),
`origin/claude/yeti-kit` (older docs only): superseded. **Needs the owner:** `claude/hook-p1` (= its origin copy; contains
`silly-hawking-929a87` and `dreamy-wiles-23e50a`): real Hook P1-P3 work not in main, but its KLAND lifts the land rule out of
`41-world-fields.js`, which is now `core/world` that five builds read; and `claude/review-round-3` (contains `pelvis-tilt`,
`sleeve-cover`, `clothing-round-3`, `hand-props-3`, `limb-fixes-3`): the 2026-10-26 posture round 3, real and not superseded, but
its kit masks clash with the garment session's and need re-running in Blender from the local pieces: hand it to the garment work.
**Firebliss** (`claude/firebliss-80cc25`, asked in by the owner) was merged, built and verified, then reverted (9375e188a; **merged
again in the sweep below, its failures fixed**):
station 1 passes; east (the Weyt Warra's lahar volume) and mons (the crater hollow's gas volume) fail `registered-volumes-non-empty`;
glen runs the geyser kit's floor over the glen, three items past the cap with no `capWhy` (strap 301k, fern 402k, grass 303k).

**The outer walls** (`origin/claude/neouterwall-s1`, `origin/claude/seouterwall-s1`, asked in by the owner as whole kits) were merged, built and
verified, then reverted (b0fc0b069, d5fccd6f8; **the NE wall merged again in the sweep below, its failures fixed; the SE wall stays
out**). NE: cave (11 of 15 roof-cupola volumes empty), portal and shoulder (`export-profile`: no
tree buckets in the box) fail; badlands, garnet, steam and the main page pass. SE: ambertarn (`export-profile`) and gatetarn
(nwouterwall's stipa 293,954 past the instance cap, no `capWhy`) fail; coppertarn passes; the rest were stopped. The SE wall and
Godshearth both added `core/atmos/fx/89-atmos-fx-katabatic.js` with different `ATMOS.katabatic` APIs: at its next merge, give the SE
wall's gale its own file (`89-atmos-fx-gale.js`, `ATMOS.gale`), as was done here before the revert.
**The Ancient's Valley** (`claude/ancientsvalley-7f521c` at 54976e76b, with its children: the Yards, the Terraces, the Engines, smog, radiation,
local time, core/anomaly, core/ruins, the extraplanar hunters, the transit, the vehicles' ruins, the robots) merged on the owner's yes (2026-11-10).
Fixed on the way: its transit and extraplanar bundles read the catalog's engine from `core/catalog`; its metropolis test reads the reception
recipe from `src/`; `metal.scorched` packed for the vehicles' ruins. Its `core/atmos` sky, fog and height-fog changes move every biome page
(204 pages), all rebuilt and GPU-verified again (below), on the local lanes and the cloud lanes `vast0`/`vast1` together.
`origin/claude/rebuild-nwouterwall-cloud` adds nothing (already in).
**The sweep of 2026-11-11** (the owner: "merge in all ready but unmerged work on sibling branches"), merged:
- the valley's later commits (the overgrowth, the Terraces' vine mats) and its two stragglers (`claude/wizardly-cerf-605ac6`: the Yards' and
  Terraces' fx and their demo; `claude/mystifying-wescoff-d88527`: the lobbies);
- **Firebliss and the NE outer wall again**, their reverts undone: each session fixed what failed here (Firebliss: the hazard bands, the
  Glen's density; NE: the cave's drawn rock, the export boxes);
- `origin/claude/greatchasm` (the Great Chasm, five stations), `origin/claude/survey-checks` (checks 22-31, opt-in; the harness keeps the
  cloud-aware vendor check), riftrim stations 8 and 9 (`claude/rift-hearths-cavern-b8baf6`), W outer wall stations 2-4
  (`claude/wouterwall-finish-345445`), two more site regions (`claude/openworld-sites-24defd`: Xanadu-Oidong-High Rift, the Iziz cluster),
  the rest of the 2026-11-10 texture delivery (`ccr-55bd6ee1-p1si44-textures`, 22 sets; disjoint from main's six), the Golden Way
  (`origin/ccr-55bd6ee1-p1si44`), the scablands high line's hulks (`claude/pensive-leakey-341312`), garment-defects' later commits, the
  Tiers plan, the cloud lanes' verify-cache change, `origin/main`'s skill notes;
- PROMPTS-NEEDED: sections 46-50 are the Ancient Transit, Firebliss, the NE outer wall, the Great Chasm and the Tiers.
Left out: `claude/dreamy-davinci-30f3c1` (a scale-model edit made on an older model: it claims "edit 2" and its rasters conflict as
binaries; re-run it on the current model), `origin/claude/seouterwall-s1` (its failures here are not fixed), `claude/hungry-burnell-e6cad9`
(WIP), `claude/tungang-fellgang-kits-a56ece` (its session is working; a plan), `claude/ancient-transit-2600a6` (superseded by the valley's copy),
`claude/hook-p1` and `claude/review-round-3` (the owner's design calls, above).

**Retired:** Girder's hero page (the owner, 2026-11-10) to `archive/girder-hero` (its README); Styv's and Phil's models to
`core/charactermodels/donors` (the canonical bind pose); its gallery entry and baseline row gone.

**Built once:** `tools/build.py --all` (113 of 115; Longsong blocked, below) and every station through `--station`: `--all` had
built only each kit's default page, so about a hundred station pages were never rebuilt by it. `tools/test_all.py`
`extra_builds()` now lists every station folder (with or without a `station.json`; nine kits keep none: 17 more pages were rebuilt
and verified once that was found), skipping `baseOnly` folders, `common` and plan-only kits. Also the core demo pages.
Fixed on the way: the isle-demo world's Nephtos bundle (`bundles.py` reads the Ancients fragments Ys reads in place); the Twins'
fern and sedge cards held by their stems (`check_cells --fix`); `core/charactermodels/build.py --list-sources` (dep_graph) and the
Godot character data synced; Greenstep loamstep's oak view out of the crowns.

**Verified again after the sweep** (2026-11-11, the same arguments): the sweep's rebuild (262 commands, Longsong blocked) changed 290
pages; **277 pass on these bytes**, 212 of them on the cloud lanes (two vast.ai machines, six lanes: `vast0`-`vast1` on 2x RTX PRO 4000,
`vast2`-`vast5` on 4x RTX 4060 Ti), 36 RTX, 13 Arc, 15 cached passes, 1 with no renderer line; `PORT-BASELINE.json` rewritten for
those 277 only. The 13 left are the known failures listed below (guilin, Dalab, Mav's, Locus x3 with locus-plants now failing only the
key map, Yuni x3, Pinnacle Rock, Voth city, sockets-example) plus the isle demo's unchecked artifact copy. The cloud's first try of a
page often fails `page-errors` on "Unexpected identifier 'https'": the machine lacked an LFS file and ran its pointer; the lane sends the
file and reruns, and the rerun is the result. Dhelv fails `shader-errors` (99) on the 4060 Ti machine and passes on the local RTX: a
driver difference, not the page. sedesert's two animal views follow a moving animal and once stood 0.43 m from a boulder: they now take
the roomiest of 16 eyes round it (`99-host-take.js`, `eyeRoom`). Wall time about 2.25 h for 290 pages (the first pass: about 9 h for 350
on two local lanes); build times per command fell (659 s to 446 s summed over the 208 commands in both rebuilds).
`PORT-BASELINE.json` still holds 35 rows for pages no longer built here (`settlements/port/dist/*`, now `kits/port`; little-demo, archived;
`core/sockets/example`, now `kits/post-apoc`): a `--write --prune` once the tree is clean drops them.
After the sweep: fingerprints (engine, furnish) read `same`; Godot 4.7.2 37/37 (klava timed out once under the verify load and passes
alone in 114 s). `test_all.py --no-build` (210 steps) after these fixes: `check_insulation` read only core's source files, not its
texture library (1347 s to 34 s; a `host/site` probe in a core .js still fails it); Firebliss's and the NE cave's view names without an
apostrophe (pages rebuilt, re-verified); `core/atmos/fxdemo` reports its sources through `build_sources` (its stale page rebuilt and
verified); the Godot character kits synced; the transit furniture test reads `core/catalog/krator-furniture-core.js` (the merge kept
the valley's old path); `core/hamlet/test-hamlet.js` skips a kit whose `HV` is not the wood tag (Firebliss's `HV(use, ...)` for rocks);
the span preview (`swhighlands --station pillars --preview span`, missed by the rebuild list) rebuilt and verified on the Arc. Baselined as
deliberate, each read: the radiation pass's `CAMPOS` and `RAWTEX` x3 (a full ShaderMaterial; a depth texture and the encoded frame), the
vehicles' `2 / (s.n || 2)` (0 would divide by zero), the valley's creeper and mosshang cells (picked in code), the W wall's puyaspike
cut, riftrim's `KCITY.stance` (behind `TUNE.stance`, which riftrim never sets), engines' `EN_HEX.computeBoundingBox` (a three.js
method), iziz-cluster's five window clashes (Girder's and Mav's sources together, as `beast-riders.html` already carries). The
merged stations' eleven view names with an apostrophe renamed (rift maze x3, scablands highline and highline-nw, swhighlands span x2
and rainwall, abyssal-savannah belt x2 and its check, Erewhon's `Citadel — the court of the Treasurer`); the seven pages rebuilt and
passing (`--all-views`; Erewhon `--interiors`, 882 s on the Arc), their baseline rows rewritten. **Left failing, owed:** `core/hamlet`, the NE wall's "arrow shafts" (a craft rule in `10-hamlet-wood.js` reaches 54
pages); `core/audio/test-audio.js`, 68 clips in categories `categories.json` lacks (`sfx.interface`, `sfx.impact`, `music.motif`) and
5 clips without a source URL (two Drones pack beds, three user uploads), as `a1e202d37` committed them (the Audio Lab's call);
`check_stale` for Longsong (blocked, below).

**Verified on the GPU, first pass** (`KRATOR_GL=gpu`, `--assert`, plus `--all-views` on every biome and station page, `--interiors` on Erewhon):
350 pages run, **336 pass on these bytes (281 RTX, 54 Arc, 1 metropolis on the RTX lane whose verify prints no renderer line)**;
`PORT-BASELINE.json` rewritten for those 336 only. Still failing, rows left as they were, none from this pass's merges:
- known: guilin (frozen), Dalab's instance cap, Mav's walk-and-reach, Locus's three sheets and Yuni's three pages on the one key map
  (the not-yet-adopted list), yuni-plants' streamed doors, Pinnacle Rock's attach audit (1.87%, limit 1%);
- `settlements/voth/dist/voth-city.html`: two embassies of six drawn short (Dalab, Yuni) and the Arena canton's flight fails at
  a ledge (28.7 to 31.1 m). Nothing merged here touches Voth's layout or walks; the kits round's interiors and walk changes are the
  candidates. Owed to the city-layout work;
- `kits/post-apoc/sockets-example`: its demo def has no declared door (`front-door-not-default`); never checked before;
- the isle demo's `.artifact.html` copy: not checked, as before.

**Fingerprints:** `core/engine/fingerprint.py --write` (Islanders +7 records: the Isles' clay pit and camp shelters) and
`core/furnish/fingerprint.py --write` (the tile family's own mesh, the Highlands and Roketstad interiors, the food anchors).
**Godot 4.7.2:** all 37 headless tests pass.
**`test_all.py --no-build`:** every lint, ratchet and check passes after the fixes here (the Audio Lab's `||` defaults ratcheted; the
Twins' cards held by their stems; `core/charactermodels` `--list-sources`; the Godot character data synced; Xanadu's footprint test and
the outposts test fixed for this checkout); left failing: `core/audio/test-audio.js` (two catalogue checks, as its branch committed it)
and `check_stale` for Longsong (owed, below).
**Performance:** `PERF-PLAN.md` is the plan for the next all-builds rebuild, from this pass's numbers (`heaviest-pages-2026-11-10.md`)
and Gemini's second opinion (`OPTIMIZATION-PLAN-2026-11-10.md`), with the cloud lanes for its verify.

**Owed:** Longsong's rebuild (the garment branch's 112 new Xanadu and Order outfit pieces are published only in the garment
session's worktree: rebuild once they are; its page stays the allbuilds one, verified there); the Audio Lab's 147 `||` defaults and its
catalogue test's two failing checks (TODO.md); the gallery republish (a wide change: ask the owner); the cloud's `-goldenway` branch;
hook-p1, review-round-3, the SE outer wall and dreamy-davinci's model edit (above); Voth city's embassies and Arena flight (the
city-layout work); `PERF-PLAN.md`'s owner gates.

## Triage of the 14 parallel merges (2026-11-09, `ccr-55bd6ee1-p1si44-triage`)

`ccr-55bd6ee1-p1si44` (35e535bf) merges 14 agent branches, most "WIP (stopped before verification)", onto main's 2d530d40.
`python3 tools/test_all.py --no-build` on both, in a cloud container without the LFS objects fetched:
**main 16 failed, the merge 20.** The four new failures are fixed on this branch; the 16 shared ones were pre-existing.

| Failure | On main | Cause | Now |
|---|---|---|---|
| dependencies run one way | pass | ac9d82ff: the Yuni, Locus and Eastern Abyssal kit sheets read the engine in place from `settlements/yuni`, `settlements/locus` (step 4b); 6c04e275 left three stale Ys `vendored` lines | the three edges allow-listed as intended (like `kits/pylon -> settlements/iziz`), the stale lines deleted |
| Voth census tables | pass | 6c04e275 dropped Ys's copy of `76-port-chapterhouse.js` (read in place from Iziz) | `check_trades.py` `EXTRA_SRC`: Ys also looks in `settlements/iziz/src` |
| source lints (ORNUM x19) | pass | 7ef9dae8, edf152dd, 6e8a81da, b5b36165, ac9d82ff, 5d10c87b: `x \|\| <number>` defaults | rewritten as `x == null ? d : x` (no baseline entry) |
| vendored drift only shrinks | pass | 7ef9dae8 moved `37-wk-rec.js` to `core/engine` but left Eternian's identical copy; Yeti's own copy (it also walks `feature` records, its tunnels) now shadows core's | Eternian's deleted; Yeti's is declared adapted by ff7a2b36 (the Yeti session), so no baseline entry is left |
| `test_gpu_lanes.py` "its children are killed too" | fail | pre-existing: the container's PID 1 does not reap, the killed grandchild stays a zombie and `pid_alive` counted it | fixed: `pid_alive` counts state Z as dead |
| ten `isle-demo/tests/test-isle-*.js` | fail | pre-existing here: `dist/isle-city.plan.js` is an LFS pointer in this checkout (not the doors merge, not water breakup) | pass with `git lfs pull --include=settlements/isle-demo/dist/isle-city.plan.js` (see below) |
| `kits/interiors/tests/test-walk.js` | fail | pre-existing here: `dist/interiors-core.js` is an LFS pointer | passes once fetched |
| `core/terrain/test-lava.js`, `test-scarp.js` (golden) | fail | pre-existing: the goldens were written in the same commit as their modules (14e684a4) and nothing changed since; last-bit float differences on this machine's Node 22.23 | open: rewrite the goldens (`--write`) only on the machine that owns them |
| `core/water/test-gaps.js` "neutral by default" (draw.shore, draw.flow2 snapshots) | fail | pre-existing on main | open |
| `check_stale` | fail (kits/port UNRECORDED) | the merge: 104 over the baseline, expected before the all-builds rebuild | the rebuild |

Nothing was rebuilt and `PORT-BASELINE.json` is untouched. The ORNUM rewrites touch `core/engine/91i-interiors.js` and
`core/furnish/50-core-furnish.js`; they change behaviour only when a 0 is passed. When the all-builds rebuild runs, check
`python3 core/engine/fingerprint.py` and `python3 core/furnish/fingerprint.py` with it.

## Twins onto the core plan features (2026-11-10, `claude/twins-finish-cloud`)

`claude/core-plan-features-229d2a` (pushed by the owner's word) is merged in. The Twins stations' mud pots (`WATER.mudpot`), fumaroles'
steam (`WATER.fumarole`), breaking crusts (`KHAZ.ENV.crust`: the Red Cistern's blister crust, the Rime Twin's snow bridges and thin ice) and
night-pooling gas and cold (`KHAZ.ENV.nightGas`, `coldPool`, on `KHAZ.bindClock` and `KHAZ.bindWind`) now run on it; nothing kit-side is
left of those (`biomes/twins/KNOWN_ISSUES.md`). The thermal aprons, run-off, slope wind and ash plume on the same branch are not yet taken.

## Twins stations 2-6 (2026-11-10, `claude/twins-finish-cloud`, from `claude/cloud-kits-verify` 6546a3eee; a cloud session, no GPU)

**Built** (`biomes/twins`, `NOTES.md` has each): station 2 the Brazier (`dist/twins-brazier.html`: Oasis 3 on the col, KTHERM heat, core/water
springs, geysers and mud pots, the Hearths' pocket-hearths read in place, the Shrine of the Split Horn); 3 the Red Cistern (`twins-lavasump.html`:
the decoy tube on KCAVERN, a lava pond on `ATMOS.lavaMaterial`, the breaking crust and the night gas); 4 the Valley of the Iron Shroud
(`twins-shroudvale.html`: the box vale, the moraine, the -34 C sink, KGLACIER's seracs, the Guide's Needle); 5 the Rime Twin
(`twins-erebustwin.html`: the summit caldera, KGLACIER's ice towers and caves, tube 10's mouth, slush cauldrons); 6 Catch-Lookout Spring
(`twins-catchlookout.html`: `WATER.terraces` soaking basins, krummholz, the scarp and the Catch below). **Shared** (every Twins page, station 1's
included): the ground's station layers and `STN.shareLayers` (`84`), the station ground classes (`45c`, `50`), the oasis model and drawing
(`45a7`, `89c`), the oasis pass (`60`), the kit's new items, `build.py`'s `"kin"`. Each page passes `verify.py --assert` in software GL.
**Owed:** the GPU verify of all six (`KRATOR_GL=gpu`; station 1's page changed with the shared fragments) and then `PORT-BASELINE.json` for
`biomes/twins/dist/` (not rewritten here); the life layer; the rest in `biomes/twins/KNOWN_ISSUES.md`.

## Godstep finished in the cloud (2026-11-10, `claude/godstep-finish-cloud`, from `claude/cloud-kits-verify` 6546a3eee; not merged)

**Built**: Godstep's stations 2-5 (`biomes/godstep/PLAN.md`, each "Station N, as built"): `--station rille` (`KRELIEF.rille`, `tube`, `tubeRille`,
`KSTACKS` hornitos, a skylight walked into `KCAVERN`'s bore and the gathered caves, the spring's `WATER.flow` and the red stalk fields),
`--station hearths` (vent 77's pit on `KRELIEF.scarp`, `KTHERM`, the Hearths' `HEARTH.layout` and breath read in place, the two tube mouths in
`KCAVERN`, the older crater's lake and walled fields), `--station redlands` (front 3 on `KRELIEF.stair`, laterite breakaways, the salt playa on
`KBASIN` with the mirror switch off at load, the sedesert's shrubs read in place), `--station wall` (the north wall's `KRELIEF.stair`, Guli Blaca's
falls by `WATER.fallsOf`, the shighlands' forest read in place, the terraces). The shared hooks in `src/` (`STN.kground`, `STN.pack`,
`GROUND_HOLE`, `GSTEP.PASSES`, the red guyed stalk). **Every ground at 15 texture units**: station 1 dropped its lichen-crust layer (16 -> 15).
**Checks**: each page passes `verify.py --assert` in software GL; `check_core_use`, `check_port`, `test_all.py --no-build` (its result in the
branch's last commit message). **Owed**: the GPU verify (`KRATOR_GL=gpu`, `--assert --all-views`) on all five pages, `PORT-BASELINE.json` (not
rewritten here: godstep.html changed on purpose, four pages are new), `KNOWN_ISSUES.md`'s station items, the gallery when Godstep reaches `main`.

## Greenstep finished in the cloud (2026-11-09, `claude/greenstep-finish-cloud`, from `claude/cloud-kits-verify` 6546a3eee; a cloud session, no GPU)

- **Stations 1, 2, 4, 5 and 6** of `biomes/greenstep` built (`build.py --station gatestep|loamstep|rilleforge|cloudstep|headvent`, `--all` the
  six; `PLAN.md` "Stations 1, 2, 4, 5 and 6, as built"): the Gate-Step (riser 1 on `KRELIEF.stair`, the Gate Falls at a `KRELIEF.rille` gorge's
  head, the Gate Mere, the watch-towers' sites), the Loam-Step (the Great Veil from below, paddies on `core/mask`, a `KRELIEF.tube`'s pits and the
  tube barn's site), the Hollow Way (`KRELIEF.tube` + `tubeRille` + `KCAVERN`: the trench, a lava fall, the west portal, the great 90 m skylight,
  the rille-forges' site), the Cloud Bench (the upper Clodosriba's trench under three `KCAVERN` bridges between risers 4 and 3) and the Fissure
  Shield (`KRELIEF.volcano`, `KTHERM`'s warm ground, `WATER.spring`, the Headwall Falls). Kin read in place from swlowlands and shighlands.
- **Shared in the kit:** every ground at 15 texture units with the litter and the lichen back on shared samplers (`STATION.shareLayers`), checked
  under `--assert` (`window._groundUnits`: the linked program's active samplers; `KSHADOW.units` double-counts core/atmos's `atmRainOcc`);
  `core/mask` on every page; site anchors. **Station 3's page changed** (these shared parts): its GPU pass no longer covers its bytes.
- **Checks:** `verify.py --assert` on all six pages in software GL (SwiftShader); `tools/test_all.py --no-build`, `check_core_use`, `check_port`.
  **Owed:** the GPU verify of all six (`KRATOR_GL=gpu`, `--assert --all-views`); `PORT-BASELINE.json` was not rewritten (greenstep.html differs
  from it, the five new pages are not in it); the gallery when Greenstep reaches `main`. Not merged.

## The cloud kits merged and GPU-verified (2026-11-09, `claude/cloud-kits-verify`, from `claude/biome-rebuild` 0e2f6649d; not pushed)

**Merged** (sources; pages and the baseline rebuilt here): twins (`ccr-906e567d`), godshearth (`ccr-b9d1a178`), godstep and greenstep
(`ccr-f2b9901e`), outlands (`ccr-37c777fb`), firebliss (`ccr-661d8fa0`), wouterwall (`ccr-4715cb9c`). By hand: `biomes/outlands/PLAN.md` and
`biomes/wouterwall/PLAN.md` against main's 5.1 decisions (both kept); godshearth and firebliss each wrote a scale model "5.1 edit 2": Godshearth's
(earlier) keeps `edit_512.py`, Firebliss's is `edit_513.py` ("5.1 edit 3", reconcile key `krator.regMerged.5.1e3`), `vents.json` both.
**Shared files touched:** `core/atmos/fx/89-atmos-fx-katabatic.js` (new, godshearth only), `tools/scale-model/` (both edits; `test_smodel.py`
233 checks pass), `kits/resources` data (Firebliss's rebake; its page and copperglacier's three rebuild unchanged), `biomes/godthrone/tools/region.py`
(`--kit`), `tools/check_assembly_baseline.json` (godshearth's and wouterwall's known leafOn/leafQ entries, godshearth's geyser `_shadow` clash).
**GPU** (`KRATOR_GL=gpu` with `harness.py lock`: the lock alone runs SwiftShader): `--assert --all-views` passes on twins, godstep, greenstep,
wouterwall (Arc) and outlands, godshearth (RTX). **Fixed:** greenstep's ground at 17 samplers (three ground layers now), wouterwall's brook view
under the mid ground, the harvest.wood tags of greenstep and outlands (`core/hamlet`'s test). **Open:** godshearth logs a cross-context WebGL
delete under SwiftShader only; `kits/port` UNRECORDED and the isle-demo / interiors node tests fail in a fresh LFS-skipped checkout (pre-existing).
Firebliss is a plan and a model edit, no page. Gallery: five new biomes await the owner's publish.

## Godstep station 1 and Greenstep's first page (2026-11-09, branch `ccr-f2b9901e-grrx3e`, a cloud session with no GPU; merged above)

- **Godstep station 1, the stair** (`biomes/godstep/dist/godstep.html`; `biomes/godstep/PLAN.md` "Station 1, as built"): the kit's first page,
  on the owner's queue ("build station 1 of godstep"). A 719 m trap stair of 18 benches (`KRELIEF.stair`), four flows baked at build
  (`KLAVA.bakeLayers`, `src/flows.json`), tumuli (`KRELIEF.tumuli`), step 2's black sand and moss cones, the cairned way, late-winter snow.
  `verify.py --assert` passes in software GL only. Open (`KNOWN_ISSUES.md`): the front's beds from the bake are wired but no baked lobe
  reaches the lip; snow cover (16/16 texture units), aura geodes, mirror switch and the Godthrone's crusts not taken; the overview shows the map's square.
- **Greenstep** (`biomes/greenstep`, a new kit; the owner said "proceed" on its plan, 2026-11-09): its first page `dist/greenstep.html` is
  station 3's ground (`--station tallwalls` is the default): Terrace III, the Great Veil with the Clodosriba and the Western Rille falling
  side by side, the rilles' confluence, Terraces II and IV; swlowlands' and shighlands' trees read in place. **Tallwalls' fortress is not
  drawn**: the kit publishes its site (`site.tallwalls`) and its buildings are owed to a settlement build on `core/city`. `verify.py --assert`
  passes in software GL only; 11.6 MB page (the neighbours' packs taken whole: narrow them). Model 5.1's divergences from the plan are in its PLAN.md.
- **Owed:** GPU `--assert --all-views` on both pages; the gallery when they reach `main` (both are new biomes).

## The integration pass (2026-11-08 to 2026-11-09, `claude/integration-b91c04`; read first)

**Merged, in order:**
- origin/main, then busy-keller, with isle-demo's `verify.py` hand-merged (the shared `verify_page` plus the guild checks);
- the core/shadow texture-unit guard 6be96a8cd, then PR 20 bc7c50606;
- riftrim, godthrone, the ground catch-ups (east, west), throne-kground-wip and metropolis 6daa4e868.

**Then the work that landed while this pass ran:**
- the cloud turns for pairs 11-13 (catch, crater-drylands, k-guilin, nwouterwall, ehighlands, nhighlands, ringisles, shighlands) and hyperjungle J2-J6;
- the geyser and crater-drylands cloud sessions' fixes;
- fauna-meshy, the crystal-cavern work (KGEODE; hearths `--station hold`), and Gemini's map 5.1 round 3 with its Godshearth and Great Chasm plans;
- savannarim, folded into `biomes/abyssal-savannah` (stations serim, erim, north; `src/rim/`).

**Built once:** every build except the settlements, after `git lfs pull`; every station; Girder's hero page; interiors before ancients-interiors. Of the settlements only longsong (its interiors re-baked) and the isle demo (the sim work) were rebuilt.

**Checked:**
- The CPU checks: `tools/test_all.py` with the ratchets. The `check_source`, `check_vendor`, `check_cells` and `check_assembly` baselines were rewritten; the geyser stations' static `_shadow` clash is recorded as known.
- The GPU tier 1: `verify.py --assert` on 238 pages, every page passing.
- The GPU tier 2: `--all-views` on the 144 biome and new-station pages and the doors/stairs kits, every page passing.

The pages not checked:
- guilin, frozen (owner, 2026-11-09);
- the two charactermodels labs (their generated `pieces/` are local only);
- the post-apoc sockets example;
- the isle demo's `.artifact.html` copy.

**Fixed on the way:**
- Texture units: units over 16 on swhighlands, godthrone, the Throne (`samplersOf`) and ringisles high (`STATION.shareLayers`).
- Foliage held to its structure: sedesert, swbay, the rift and k-guilin.
- Instance caps declared: hyperjungle tallgrass 650k, the crater-drylands bloom 550k, nwouterwall, the ringisles high species.
- Core:
  - the Lambert `cameraPosition` fix in `core/terrain/43` and `core/biome/30`;
  - `KHOOK.EYE` and kwarp's `EYE` start on a new line;
  - `KSHADOW.units` counts `sampler3D`;
  - `W.colLin` decodes the water colours;
  - the KSTACKS centre fan.
- Kit-local load and check fixes:
  - geyser, crater-drylands, ehighlands, shighlands, nsemiarid;
  - the mechs' unarmed Catulus;
  - `_texPending` as a getter in motor-vehicles and fauna;
  - the interiors' verify modes.
- The ringisles high isle's forest load (79d1b015a): trees 41.1 M to 15.3 M, scene 52.1 M to 26.0 M.
- Tier 2's four camera and volume faults: the port kit's Panamax terraces radius (dambasins east), the sedesert and k-guilin cameras, and zeijani's eye-level views.

**The owner's decisions in this pass:**
- Settlements are rebuilt and verified individually later, except longsong and the isle demo; voth keeps its pre-swbay-fix page.
- Intentionally dense foliage declares `{cap, capWhy}` (a rule).
- The far impostors' gain is set per kit.
- `BIO.LOD`'s chunk stays at 1200 m.
- Copper Glacier's shadow casters are cut back to the corals.
- The gallery is republished once this merge is done.
- hyperjungle PLAN-LANDS section 14:
  - the rims are on abyssal-savannah;
  - Talia goes into the east rim, which the owner redraws;
  - answers 2-4, 6 and 7 are yes.

**Stale, owed with the settlements' own rebuilds:**
- every settlement page except longsong and the isle demo. The shared changes in this pass reach several of them: Hook through the port kit's Panamax fix, Dhelv through zeijani's `90-scene.js`, the Ancients-lineage and catalog pages through core;
- the `TODO.md` ride-alongs parked there:
  - the interiors' food anchors `['floor','wall']` (about 60 pages);
  - `regOccupancy`'s ground and far flags;
  - `KSHADOW.units` to count only what links: ringisles high reports "19 of 16" while every program links, so it skips its shadows and rain cover.

**The hash baseline** (`PORT-BASELINE.json`) is updated (`--update`) for 251 pages: every biome, kit, core, open-world, longsong and isle-demo page this pass rebuilt and checked.

These entries are left as they were:
- the settlements';
- the 32 old `settlements/port` sheets (now `kits/port`, whose `dist/` is git-ignored) and the retired little demo's 2;
- guilin (frozen);
- `kits/interiors/dist/interiors-sets.html`. Its `--sets --assert` fails on the parked food-anchor item: the girder dwelling holds no food container. That item rides with the settlement rebuild;
- the post-apoc sockets example, moved from `core/sockets/example` and not checked;
- the isle demo's `.artifact.html` copy.

**Not done here; they wait for the owner's word:** the push, the merge to main and the gallery republish.

## Owner's decisions, 2026-11-01 (read first)

- **Order:** finish the core pass (below), then the three-ground diagnosis, then pair 4. Pair 4 is free of the map; pair 5 on wait for map 5.1.
- **Map 5.1** (`gemini-loom-chasms`, Gemini's scale model) merges here after `tools/scale-model/HANDOFF-GEMINI-5.1.md` on that branch is done.
  `biomes/STATIONS-MAP-5.1.md` lists what it asks of each station. Godstep's plan is rewritten on 5.1 and settled (2026-11-03): five stations, three core items owed (below).
- **Map 5.1 is merged here** (538c814d1, Gemini's Round 2, 3e35e605f, 2026-11-02). Its checks passed; region cuts and the pages that read the model are not re-cut yet (`biomes/STATIONS-MAP-5.1.md`, "Regions needing a re-cut"). The old map is frozen.
- **The alien biome session's stations are in the queue** (the owner, 2026-11-02; plans merged here). Each is built with its host kit's turn: swlowlands 3 (the delta and Wing's floodplain, one station reading swbay in place), nhighlands 5 (the Footfall bogs), ringisles 3 (the lagoon), outlands 8 (the Mires, when that kit is built). The kits' own plans: `biomes/gills` (stations on godthrone, catch, xanadu), `biomes/hearths` (riftrim, oidong, the Stills at geyser's sites), `biomes/deeps`, `biomes/clifflung`. A turn reads its host's station list and these plans, and asks the owner only about what's still open in them.
- **Map 5.1 Round 3 is merged here** (68b6aa22b): frozen river names, the valley's seven basins and lake, the southern Inner Wall scarp. shighlands' stations need a re-survey (`biomes/STATIONS-MAP-5.1.md`).
- **The Deeps** (`biomes/deeps/PLAN.md`) is a late build, expansion-pack territory maybe (the owner, 2026-11-03): not in the queue.
- **`BIO.flareJoin` on every tree's limb joints where they show** (the owner, 2026-11-03): every future build and every rebuild turn takes it (`BACKPORT.md`'s universal set, "Limb joints"). Turns already merged take it at the close-out rebuild.
- **core/shadow (KSHADOW)** is on this branch (5b918f62c, from the metropolis test bed): the suns shadows, one view-following box. Pair 6 and the Throne take it (the owner, 2026-11-03); the Godthrone is not rebuilt yet.
- **Shadows are toggleable and OFF by default, in every build and rebuild** (the owner, 2026-11-03; it settles station 1's cost, +42 ms a frame on the Arc): `KSHADOW.attach` turns nothing on; the panel's `shadows` button, `?shadow=1` or `H.set(true)` does, and while off there is no shadow pass and no shadow variant. A page whose ground has no texture unit to spare for the map offers no switch (the Throne's isle and vents). `core/shadow/README.md`, "Off by default".
  Verified 2026-11-03 (the Throne's fourteen pages, oidong's three, xanadu's six, rebuilt with the switch), tiered as the parent session set it: off by default the pages draw what they drew, so `verify.py --assert` alone on 17 pages, the full `--all-views` on station 1, `oidong.html` and `xanadu.html` (all on the GPU lanes), the caldera, blast and delta on these bytes from the full pass before, and station 1 with the shadows switched on (KSHADOW.host.set(true): 183 programs compiled, the box following the view at 'From afar' and 'A wild Ranj tree', no GL or page errors); every page passed. The verifies leave the panel's switches (`id` ending `-btn`) out of their views.
- **NW bay gets limestone caverns, maybe as a new station, at its next rebuild** (the owner, 2026-11-03). nwbay's pair-1 turn is merged, so this rides with its next pass (the close-out rebuild or a station turn of its own). Take `KKARST` (`core/terrain/39c-core-karst.js`, e3c4ddfce) with `rock:'limestone'`, on site 1 of `biomes/KARST-SITES-5.1.md` (the Hykkousoi karst, shared with Ys and k-guilin): the plain's branchwork draining to the lake shore, the existing sinkhole and two flooded shafts given a cave under them, flooded passages as the water-breathers' roads, not hazards.
- **The same for swhighlands and the rift** (the owner, 2026-11-03): limestone or gypsum caverns, maybe a new station, at each build's next rebuild, with `KKARST` on `biomes/KARST-SITES-5.1.md`'s site 2 (swhighlands' ring folds: `rock:'limestone'`, branchwork with the river cave station 1 already has, the sinkhole chain, one old dry level, the springs where swlowlands' spring cypress stands) and site 3 (Cube's plateau, rift station 4: `rock:'gypsum'`, a dry two-storey maze in the rift fill, its springs at the foot of the scarp at station 2; the maze is linked to Cube, the Ancients' hub, and the rumoured lost Tungang lodge in the east: the owner approved it, 2026-11-03).
  - **swhighlands: done (2026-11-09, `claude/swhighlands-rest-f8a7ee`)**: station 7, the ridge karst (`--station caverns`), on site 2;
    stations 2 (the rain wall) and 3 (Span's tableland) built with it; station 5 (the fan coast) owed. The Cube link is site 3's (the rift).
- **The Hearth hold's hypogene chambers** (survey site 4; the owner, 2026-11-03): `KKARST` gets a proper rising-water (hypogene) mode in core first, so the hearths' warm chambers are not a maze stand-in.
- **New kits to add to the queue:** Copper Glacier, Siphon Pits, Loom-Chasms, Mid Basin, High Rift, the NE outer wall, Outland Gate.
- **The new north and west, except Copper Glacier, the NE outer wall and Outland Gate:** Gemini may do map work there, but no biome kits and no open world there for some time.
- **The tsunami reaches Farside.** Farport's old city moves to the near-shore plateau; the harbour stays below (the station review).
- **Added, not started:** `core/charactermodels/HANDOFF-GARMENT-DEFECTS.md`, `settlements/isle-demo/PLAN-ECONOMY.md`.

## Core pieces for the unbuilt plans (`claude/core-landforms-cloud`, 2026-11-03; not merged)

The 2026-11-03 audit of the unbuilt biome plans found most need nothing new in core. These are the pieces they did need. Each is
opt-in, and no page moves (`core/README.md`, "The unbuilt plans' pieces"). A kit takes its piece at its own build turn.

- **Landform kinds** (`core/terrain/38c-core-landforms.js`, `LANDFORMS.md`):
  - **wouterwall** takes `slump`, `runout`, `gully` and `terraces`;
  - **Mid Basin** takes `maar`, `relay` and `terraces`;
  - **loom-chasms** takes `terraces` (the Cradle);
  - **siphon-pits** takes `stepcut` (the graben and the pits) and `maar` (the pit floors).
- **Varied contacts** (`KSTRATA.vary` and `KSTRATA.drape`, `core/terrain/35c-core-strata-vary.js`; Godot twin `kstrata_vary.gd`): **Mid
  Basin** (its interbedded loess and tuff) and **wouterwall** (the loess mantle on the bench). The shaders still draw the flat column, so a
  page reads the varied rock on the CPU.
- **The season's copper flush and its Godot twin** (H7: `core/biome/30s-core-season-flush.js`, `core/clock/opt/21-core-clock-flush.js`,
  `godot/shaders/lib/season.gdshaderinc`):
  - the SE savannah rim's **rust miombo** (`hyperjungle` land `southeast`, on the savannah rims: `biomes/abyssal-savannah` station `serim`) takes the flush;
  - **Godstep's redlands** station reads the same species;
  - every kit on the monsoon season gets the Godot `season_dry` with it.
- **The `sound` record** (H9, `core/tags/opt/54-core-tags-sound.js`, twin `ksound.gd`):
  - **hyperjungle** takes `bamboo-howl` on its howl-bamboo groves (land `north`, station 3);
  - **outlandgate** takes `rib-flute` on station 3, the singing buttress;
  - **High Rift** takes `gjar-organ` on the Singing Gjár.

  There is no core/audio yet: the records are there for it and for Godot.
- **`KSPAN`** (`core/biome/45-core-span.js`), catenary spans: **spiderlake** takes it for its silk bridge-curtains, guys and reeling
  frames, and **loom-chasms** for its living cables across the rifts (`up` where a cable is buoyant).

## NEXT SESSION, START HERE (written 2026-10-27, usage ran out)

**State:** `claude/biome-rebuild` (worktree `C:/Users/travi/Documents/krator-biome-rebuild`, unpushed). origin/main is merged in
(ebfc29d9e; `LORE.md`'s sky rows kept from this branch: check them against main's). **Pairs 1-3 are merged** (eastabyss, nwbay,
swbay, hyperjungle, sedesert, necanyons), as are the Rift, the SW highlands, the Godthrone, KLAVA, the card fit and the foliage
guards (c63eacb4c), the water audit (ac251a770) and `CORE-IMPROVEMENTS.md`. necanyons finished (b792fcba6, 3dac639b8: the owner's notes, the foliage guards, all three pages pass). **The hyperjungle's
own items float under the attach audit** (bloom, ucard, ribbon, clump0-2: up to 7.9% of cards on necanyons' pages, capped there by
`guards.maxShare` in KNOWN_ISSUES): fix the hyperjungle's crown placement, then lower those caps.

**The core pass was stopped mid-way.** Each session committed its work to its own branch (`git branch --list 'claude/core-*'
'claude/water-core-pass'`); none is merged unless its report says so. Read each session's last report, then finish and merge each:
- `core-tools`: **merged here (2026-11-01).** `python3 tools/test_all.py --no-build` passes, 103 steps, with every check in it: `check_source` (new: trailing `//`, `|| <number>`, `cameraPosition`, bare GLSL splices, raw `texture2D`), `check_assembly` (finished; rule NEEDS on `tools/fragment_needs.json`, which declares the water modules' order; `tools/build.py` fails a page on it), `check_vendor`, `check_views`, `check_budgets`, `check_cells --ratchet`, `check_stale`, and `tools/tests/test_lints.py` (a negative for each rule, the LFS refusal, `pack.py`'s refusal, the baseline's NOT BUILT and `--write` guard, `reach.py`). `test_all`'s rebuild now runs through `tools/build.py`. A build's turn: rebuild with `tools/build.py`, commit `build-inputs.json`, then `python3 tools/check_stale.py --write-baseline` (and `check_assembly`'s) so the keys shrink. **Stale, not rewritten:** `check_stale` 88 keys (80 STALE, 4 UNRECORDED, NO-MANIFEST for Locus, Longsong, Pinnacle Rock and little-demo, deprecated); `port_baseline.py` 37 CHANGED, 23 NEW, 33 MISSING (32 Port pages gitignored, Locus' plants). The pairs and the close-out rebuild them. Locus' build rule is fixed, and Longsong and Pinnacle Rock read the moved `core/world/41-world-fields.js` (the same text as their pages): all three build, their pages left for their turn. **Open:** `core/world/80-world-sky.js:86`: a `//` swallows `giantRing.renderOrder=-9` and the rest of the line (TRAILING's one finding); `check_assembly`'s likely real findings are `BIO.impostor*` on ringisles, `CUT.drawCamp`/`planCamp` on nhighlands, `CANT.*` on isle-site, `KCITY.stance` on Ys, `KMAT` read before its script on Mungo; 40 view names with ':' stay baselined until the harness makes file names safe; `settlements/longsong/tests/test-sim.js` failed once in test_all (33 s), then passed twice, not diagnosed. `check_core_use` has 11 fixed findings to shrink with `--write-baseline`;
- `core-verify` **merged 2026-11-01**. Every browser verify is on `verify_page` (Yuni's two walks and core/charactermodels too; Voth's partial load stays on the harness by design). Added: `verify_page(routes=)`, `BIO.capReport` and `_api.seatSweeps` read as universal asserts when a page has them (`seat-sweeps`; core-biome and core-seat need no wiring, only a check that a page shows them), a `winding` report that never fails (item 15, in the harness so no page bytes move), and `harness.py sheet <page>` / `await V.sheet(out)`, every baked BIO item alone on a grid in its own scene. GPU (Arc, D3D11), pages rebuilt from current sources: nhighlands 4.82%, eastabyss 5.84%, Rift 7.44%, each failing only the foliage attach audit, universal asserts clean. **The committed nhighlands, eastabyss and Rift pages predate the foliage guards**, so a committed page passes where its rebuild fails; nhighlands and the Rift's audit failures are new to this list and belong to their biome turns. A real page with a broken shader fails `shader-errors` alone. Fixtures pass on SwiftShader and GPU. **Not done:** the ratchet baseline covers only ehighlands of 166 pages (each takes 2-6 min and holds the GPU lock; of the others only ebadlands has finished, clean). Until it is run, a page failing a universal assert fails its verify: run `KRATOR_GL=gpu python3 tools/harness.py ratchet --write --views auto <page>` page by page, with every build's `tex/` and page pulled, or an LFS pointer is recorded as a failure (geyser's was, and was removed). `test_all --no-build` here fails six node steps: the five `test-isle-*` and interiors' `test-walk`, on LFS pointers in this partial checkout (`Unexpected identifier 'https'`), not on this work. **Not run:** core/charactermodels' checks (its pieces are not in Git: `mpfb_male/anims: 404`, the conversion got as far as that), verify_heavy on Yuni, and sedesert's and the Throne's verifies since the `name` fix. The sheet blanks about a third of its cells under SwiftShader (programs fail to link); use the GPU. It shows the far version only where that is an item of its own.
- `core-seat` **merged 2026-11-02.** `KSEAT` (`core/terrain/38a-core-seat.js`), the probe sweeps (`core/host/95b-host-seat.js`), KSTACKS and KCARVE probe points; `verify_page` reads `_api.seatSweeps` as `seat-sweeps`. **swlowlands adopted it:** its plants stand on `drawnH`, the ground mesh's triangles, and the feet check fails 47 of 36,733 (26 floating, 21 buried, worst 2.29 m up, .97 m down, not traced) against 963 on `terrainH`. The 47 are `FEET_OWED` in `99-host-take.js`, in its `KNOWN_ISSUES.md` and in `tools/verify_ratchet.json`. The check leaves out 1,261 pieces held by something else (`HELD_ITEMS`, anything over .6 m inside an obstacle's footprint), so a float above .6 m on those isn't seen; a boulder has no foot; each item's tolerance is its own planting scatter, .3-.6 m. `KSEAT.tris` coarsens its buckets when a few huge faces would fill them. **The tower is not a seat surface:** with it marked verify stalled twice, but it stalled without it too, so that isn't proven. **Open, all named on the merged swlowlands (Arc, D3D11):** (1) **the page fails `shader-programs` and its error panel:** `KHOOK: layer "atmos-cloudshade-0.4": anchor #include <map_fragment> missing` on a MeshLambertMaterial. `core/biome/30-core-foliage.js:410` (the iridescent bark) replaces that include, so `core/atmos`'s cloudshade finds no anchor. The rebuild without this branch fails identically, and every page with that bark should too: rebuild one and check before pair 4. (2) The foliage attach audit fails, 7.24% (6.96% without KSEAT: predates it, up .28). (3) **The page's renderer dies at random on the GPU**, 7 of about 15 runs, at the invariants step or during a ratchet; the six stages of the seat checks run in 1-11 s each, so they are not it. Cause unknown. `harness.py` now exits 75 on a crash and gives the lock back; before, the evaluate waited for ever and held the lock, and some stalls still end with no crash event, so give a verify a `timeout` and retry. `check_assembly` reports NEEDS findings on pages built before core-shader when they are real files in a checkout; `test_all --no-build` otherwise passes, 114 steps. `check_assembly_baseline.json` gained swlowlands' `BIO.leafOn`/`leafQ`, an opt-in path of `BIO.clumpOn` it never calls. Found earlier: every ringed KSTACKS top has an open hole at its centre (in `TODO.md`'s ride-alongs);
- `core-crashes` **merged 2026-11-02.** Closes `core-seat`'s open items (1) and (3). **The shader failure:** the gloss bark (`BIO.glossBarkMat`) replaces `<map_fragment>` and `<color_fragment>`, so cloudShade threw inside the render loop and no flora drew. The wet now falls back to just before `<alphamap_fragment>`; a material that keeps `<map_fragment>` gets the text it always got. The bark reaches swlowlands, nwlowlands, cut, farside and ringisles (18 pages; only the first two call it directly). `node core/biome/test-hook-anchors.js` compiles 11 biome material kinds under cloudShade, snow, acid and fog on r128's real templates, and fails on the old layer; no other anchor is lost under those four layers (wetGround, horizon and the page's own layers aren't in the test). Swlowlands and nwlowlands are rebuilt and committed; on the Arc 140T each passes `shader-programs`, `shader-errors` and the error panel. Every other page reaches the changed files, so its text moves at its own turn; that is source text only.
  **The renderer deaths were the attach audit, and only verify runs it: a player cannot hit this.** `BIO.attachAudit` kept a live `[x,y,z,r,lod]` array and KSPACE entries for every structure point near its samples: V8's sampling profiler put about 3.5 GB of 4 GB allocated in `hostChecks` there. It runs three times in a verify (guardChecks, two negatives) on a heap limit of 4,192 MB. Past the limit the renderer dies with Chromium's OOM, `0xe0000008`, size 0, in the renderer process (read from four minidumps; commit free 12-16 GB, no TDR in the System log, no context loss on the Arc). It is not D3D11, not a long draw, not the driver, not machine memory. **The stalls are the same death:** the renderer goes, the browser and GPU process live on, no crash event fires, and the evaluate waits for ever on the lock (seen: a software-GL run, and the foliage session's audit run). KSEAT's rays were a small part, not the cause; they allocate nothing per ray now. **Fix:** the audit indexes its samples on KSPACE and each structure point updates the samples near it, with no list; same test, same order, so the same answer. `harness.py` polls the renderer's pid (`watch_renderer`) and exits 75 when it vanishes, killing the browser. **Numbers (Arc 140T, D3D11, `verify.py --assert`):** before, 2 of 6 died at the invariants; after, 0 of 15 before the merge and 0 of 3 after it, 36 s each, audit 803 of 11086 (7.24%) on all of them. Software GL at a 1,496 MB limit: the old audit died every time (3 of 3, with and without the KSEAT edit), the fixed one peaks at 480 MB. `hostChecks` peak on the old page, Arc: 2.2-2.8 GB at the step's end; fixed, under 0.5 GB (software GL). On the old audit eastabyss adds 1,250 MB; the committed nhighlands and Rift pages don't run it (they predate the guards), and the Rift loads at 1.2 GB, so its rebuild would have been worse than swlowlands.
  **The eastabyss timer crash did not reproduce and is not shown to be the same cause.** `EXT_disjoint_timer_query_webgl2` round `M.renderLive()`, 12 queries a view, 60 views; round the world with the mirror off, the same; round `renderLive` with resolution switching, 30 a view, 40 views: about 1,900 queries, no death, heap flat at about 350 MB, all on the Arc. The old bench's script isn't in the repo, so what it did differently is unknown. **Silent hooks:** of 111 replaces in the foliage, far and anim hooks across 23 material setups, 4 miss: the two lit-side lines of `animHook` on `MeshBasicMaterial`, which has no lighting, so it's harmless. None miss on a lit material. **Left:** the audit's own failures (the foliage session's); Chrome's GPU logs showed nothing of use because the renderer died first; `check_assembly` lists `BIO.leafOn` and `leafQ` for nwlowlands in its baseline, as for swlowlands.
- `core-biome` **merged 2026-11-01** (`core/biome/README.md`, "The placer's defaults" and "A tree's structure, and a crown held by it"; `test-grid.js`, `test-twigs.js`). In: per-cell `BIO.grid`, the cliff gate with `BIO.cliffCheck`, the 250k instance cap with `BIO.capReport` (`verify_page` reads it as `instance-cap`; seen working on nhighlands), bucket probe points, and, new and opt-in, `BIO.tree` (owner scope, restored on a throw), the structure log (`BIO.beam` and `BIO.tube` spans in a scope), `BIO.twigEnds`, `BIO.snapSeg` and `BIO.clumpOn`. **Pages:** none moves by draw: no kit opens a scope, no kit is on the cell form. The cap adds a console warning on a page over it, and bakes carry `probePoints`. Every page takes `core/biome`, so its text is behind its sources until its turn (`check_stale`: 0 over the baseline). No page is committed here. **nhighlands, rebuilt, GPU (Arc), `--assert --all-views`: fails two checks and nothing else**, each recorded in its `KNOWN_ISSUES.md` for pair 7, neither fixable from core: the attach audit (4.82%, the same as `core-verify` measured before this work) and `instance-cap` (`needle` 632,299, `frond` 595,481; counts that predate the cap). The 130 floor plants and 6 trees on rock faces stay until it moves onto the cell form.
  **Crowns at twig tips did not fix the hyperjungle: read this before its fix.** A trial on the rebuilt page (hero clumps moved onto their spans under r 1 m by `BIO.snapSeg`, not committed): 2,291 of 11,254 cards float before (20.36%), 2,288 after. Its hero crowns were not the floaters. What is left: `bloom` 556 of 805 (the kapok's flowers, jittered +-2.5 m off the twig end, far past a stem card's tolerance) and `clump0`, `clump2`, `clump5` (175, 233, 258), whose worst cases lie at the hero disc's edge. Those are probably saplings (`buildSapling`: past 760 m it draws no boughs at all, so its clumps have nothing to hold them; not traced card by card). So the fix there is the blooms on `snapSeg`, and saplings that either keep a bough or hold their clumps to the trunk. `clumpOn` can't help where no structure is drawn. The necanyons' `crown()` is a separate case and is untried.
  **Dropped (the owner, 2026-11-02):** per-plant card records. Adoption of the structure log by any kit;
- `core-foliage-attach` **merged 2026-11-02** (`core/biome/README.md`, "What held means, and the residual floaters"; `test-attach.js`, a test and a negative per class). Share of cards floating, before and after, GPU (Arc), `verify.py --assert`:

  | page | before | after | what floated |
  |---|---|---|---|
  | hyperjungle | 20.36% | .30% | far saplings' clumps (12,300 cards; `buildSapling` draws no boughs past 760 m), kapok flowers +-2.5 m off the twig (3,810), subtree crowns, flowers in shrubs, beards off the bole, false ones on the lathed boles |
  | hyperjungle-lake | 18.82% | .20% | the same; pads, flowers and meadow on the water (now `free`) |
  | hyperjungle-savanna | 10.45% | .31% | the same |
  | necanyons, benches, savanna | 7.88, 3.33, 1.17% | .25, .07, .25% | the hyperjungle's, read in place; the raised caps are gone, all three on the default 1% |
  | eastabyss, lakes | 5.84, 4.64% | .40, .56% | crowns jittered off their limbs, a stilt-wood with no boughs, pads and floating leaves |
  | swlowlands | 7.24% | .73% | flowers in foliage, the willow's veils, pads |

  **The classes:** (1) *the audit itself*: it measured to points on triangle edges 2 m apart, so a card on a lathed bole could read as floating; it now measures to the triangle (`BIO.triDist`) and an instanced item's radius, tolerances unchanged. On the hyperjungle it cleared frond and mossmat, about 3,600 of 34,027 floaters, some two points of its 20.36% (read from the item counts, not run alone); it can only lower a page, so the figures below are after it. A held card also answers to its own LOD tier, which cleared the savanna's false "one LOD key" failure (6.23%). (2) *a far tier drops the parent*: `BIO.holdTo`, no triangles (keeping one bough each would be about 277k triangles over 1,577 saplings: 7-sided rods, 28 each). (3) *jitter off a spot*: `BIO.holdTo` or `BIO.snapSeg`. (4) *no structure at all*: the stilt-wood now draws a rod per clump, up to about 120k triangles over 509 trees on eastabyss. (5) *a flower in a bush*: `{onLeaf:true}`, held inside a leaf card's body. (6) *on water*: `{free:true}`.
  **`onLeaf` is a new way to count as held, and three results lean on it:** without it hyperjungle reads 1.98%, necanyons 1.51%, swlowlands 4.46% (eastabyss .60%, lakes .57%). 2,932 of the hyperjungle's 3,132 flower floaters sat inside a shrub's leaf card; those plants have no bark to hold a flower, and a stem for each would be hundreds of thousands of triangles. It is opt-in by item and bounded by the card's body, with negatives. **The owner may want to judge it.**
  **Pages move, placement does not:** every fix keeps the kits' draws, so nothing else shifts. Committed: the nine above. A far sapling now reads as a pole with a tight crown, and eastabyss' crowns sit closer to their limbs: looked at on the GPU, not judged by the owner. **Species changed (keys and indices kept):** hyperjungle: all six saplings, kapok flowers, subtrees, bole beards; eastabyss: every clump crown, stilt-wood, beards, catkins; swlowlands: willow. `reach.py`: the hyperjungle's trees reach 11 build commands, 32 pages (necanyons, guilin, k-guilin, geyser, ringisles, the Throne...), eastabyss' 9 commands, 40 pages (abyssal-savannah, the isle demo...). Those move when rebuilt in their turns; `core/biome` changed, so `check_stale` keeps them.
  **Open:** `hyperjungle-savanna` fails `instance-cap` alone (`tallgrass` 555,500, no `capWhy`; predates this). Residual floaters not traced: the tower's dressing, bromeliads on perches, about 2 m off at worst.
  **The other biomes, for their turns** (rebuilt on the fixed audit, GPU; items as the audit names them; causes are read from item names, **not traced**; none of these pages is committed):

  | page | share | top items |
  |---|---|---|
  | ehighlands | 81.5% | bloom 55,612 of 56,315 |
  | nsemiarid | 81.1% | blade, glider, bloom, bead: few cards audited (10k) |
  | scablands (coulee) | 66.5% | blade, bloom, bead |
  | guilin, k-guilin | 32.0, 26.9% | oakleaf, osmleaf, camphorleaf (crowns; not the hyperjungle's items) |
  | abyssal-savannah | 28.4% | leaflet 35,463 of 52,120 |
  | ringisles | 24.0% | pompom 109,696 of 141,037, liana, epiphyte |
  | swbay | 17.9% | leaflet, bloom, prism, needle |
  | sedesert | 15.4% | bloom, feather, strap |
  | ebadlands | 14.2% | bloom, bunch |
  | nwbay | 10.7% | leaflet, bloom |
  | throne | 9.8% | needle, glossy |
  | rift | 6.8% | bloom, urchin, broad |
  | nwlowlands | 5.1% | bloom, pad; LOD key 3.09% |
  | nhighlands | 3.9% | needle, beard, spray |
  | oidong | 3.9% | darkneedle, raceme |
  | nwouterwall | 3.7% | larchspray |
  | cut | 2.4% | pad, bloom, veil; **LOD key 57.4%** |
  | korona | 1.8% | seepfern, carnmoss, staghorn |
  | geyser | .90% | passes; bloom, lily |
  | shighlands, swhighlands, farside, catch, godthrone | .01% or 0 | pass (godthrone audits no cards) |

  Most of these will be the same classes: `pad` and `lily` want `free`, a `bloom` over about 5% wants tracing for `onLeaf` or `snapSeg`, leaflet and needle crowns want `holdTo` onto their limbs. **Not measured:** crater-drylands and xanadu die on load when rebuilt from the merged sources (`giant is not defined`, `giantRing is not defined`), which is not this work's and needs its own look; dambasins builds but never reached ready here, on one try, not traced.
- `core-shader` **merged 2026-11-02** (`core/shader/README.md`). In: `khost.resolve` adds core/shader; every hand-listed build names it (the kits on the Scyvoi engine, Dhelv, Mungo, the Port line, the open worlds, Voth's `CORE_PLACE`, Verge, the Ancients, the sky demo), and `tools/fragment_needs.json` makes `tools/build.py` fail a page without it (`--all`: 90 of 91, the one failure the deprecated little-demo, whose `src/` moved). The rain-free `DETERMINISTIC` rule of 13 Ancients-line builds lists it. On KHOOK: the lava's plain draw, every core/water layer and replace, `BIO.lodFade`. New: `WATER.checkPrograms`, the universal assert `shader-programs` (harness), and `KHOOK.warp`, an empty slot for a later `core/anomaly` (the owner's request: no text, uniform or key until installed; not built).
  **Shader text did not move:** 134 of 134 shaders the node tests compile, the 54 atmos and terrain cases on the real r128 ShaderLib, the mirror and the plain lava, old tree against new. **Every page moves by bytes** (the two fragments, about 13 KB, and the edited sources) when its turn rebuilds it; none is committed here, so `check_stale` keeps them, with the three station keys eastabyss lakes, necanyons benches and savanna added to its baseline by hand. A committed page rebuilt from these sources is fine; an old committed page, once its LFS page is pulled, shows a NEEDS finding in `check_assembly` until its turn.
  **GPU (Arc):** eastabyss, rebuilt: shader-errors and shader-programs pass, and it fails only the foliage attach audit, 5.84%, as before. Ring Sea, rebuilt: passes. **Found on the way:** Ring Sea, Port, Hook and the Dam Basins took core/water 20 and 50 alone, and 50 has called 51's rain helpers since b4230fde6, so any rebuild of those pages died at render (`W.rainK is not a function`). They now take 22 and 51; their pages grow by that. Port, Hook and the Dam Basins were built, not verified.
  **The warp for the Bend (2026-11-02):** `core/shader/07-core-kwarp.js` (`KWARP`), opt-in, no build takes it, so no page moves; it needed no core/materials, core/biome or kit edits (`core/shader/README.md`, "The warp"). `warp_check.py` on rebuilt swlowlands, nwlowlands and the Ancients kit passes (60, 62, 71 programs bent). Left for the Bend: the sky's horizon, culling and LOD on unbent bounds, coarse meshes, shadows, normals.
  **Left, by name:** the foliage, far and anim hooks of core/biome stay their materials' own, on silent replaces: about 50, and a throw there needs a GPU sweep of every biome. Water colours stay as written (`WATER.colAsWritten`): decoding them would darken every page's water, so that is the owner's call and each page's turn. core/materials, core/furnish, core/city, core/charactermodels and the kits' hooks are not on KHOOK; they run under its layers. `KHOOK.warp` reaches only a material with a layer;
- water **merged 2026-11-02** (`claude/water-core-pass` and `claude/core-water-finish-a26d7d`; `core/water/README.md`, "The core pass" and "The water as fields"). In: the flow network, the shore from the ground, ribbon rows and breakup; **Godot parity** (item 9) ran for the first time and passes on 4.7.2: `godot/tests/water/core_pass_test.gd` and the six older water tests headless, and `core_pass_shaders.gd`, which compiles all eight water shaders on the RTX 5060 (a headless run compiles none); **ext/60**: `WATER.fields` / `fieldAt` / `fieldFns` (shore distance, depth, flow proximity from the water the eye sees) and `WATER.edgeAudit` (`plant-in-water`, `wet-short`, `wet-wide`), worked example `test-edge.js`; the water ext modules 58-shore, 59, 59b and 60 declared in `tools/fragment_needs.json`.
  **necanyons' creek:** a 4 m ground strip over the carve (about 40k triangles, `?creekstrip=0`) and a page check, `WATER.audit` on the creek. The check found the creek rising downstream by up to 4 m and up to 19 m under the savanna's talus, so the bed is now graded (`creekBed`) and the channel has one section (`creekGround`): 167, 461 and 352 findings went to 0. Moving the ground moves the placement along the creek. All three pages pass `--assert --all-views` (GPU, Arc).
  **eastabyss** was rebuilt on the merge (network + mirror switch): it fails only the foliage attach audit, 5.84% against its 1% limit, the figure `core-verify` measured before this work; it belongs to its turn.
  **Not done:** no biome reads the fields or runs `edgeAudit` yet, and the environmental-field contract itself is still unwritten in `core/biome/README.md`. A dark-stemmed palm clump stands at the creek's edge in the view "The creek" (`biomes/necanyons/KNOWN_ISSUES.md`: seen, not measured; `waterMask` holds a clump's centre, not its stems). Staged shore-grid bakes: skipped, no hitch measured. `core_pass_shaders.gd` proves they compile, not how they look: no Godot picture was judged.
  **Two traps for the next session:** a worktree cut from an old branch and merged forward keeps old files as CRLF on disk (`git ls-files --eol`, `i/lf w/crlf`), which gives false DRIFT in `check_vendor` and `sync_core --check` and CRLF pages: delete them and check them out again. And `check_assembly.py --write-baseline` and `check_stale.py --write-baseline` run in a tree of LFS pointers drop every unbuilt page's keys: add a rebuilt page's new keys by hand there (BIO.leafOn and leafQ on necanyons' and eastabyss' pages: `20-core-kit.js` reads them behind `o.leaf`, and neither page takes `31b`). `build.py`'s page write lacked `newline='\n'` in necanyons and eastabyss (fixed); 19 other biomes' `build.py` write the same way, so their pages come out CRLF on Windows.

- `core-additions` **merged 2026-11-02** (the new biomes' core pieces; `core/README.md`, "The new biomes' pieces"; `core/terrain/SCARP.md`; `core/biome/README.md`, "The breath", "The environmental fields"). All opt-in, each with a node test and negatives, no kit on any of them. In: `BIO.animHook` mode `breath` (`BIO.breathState(key)`, shapes bulge, stream, fold; `albedo`, `rough` with `BIO.animMat`'s `pbr`, `band`); `KTHERM` (`47-core-therm.js`, `ktherm.gd` on `golden-therm.json`, worst 2e-14 on Godot 4.7.2) with `ATMOS.snowBare(H.snowMask(...))`; `ATMOS.libration(t)` and `ATMOS.sunHidden(t, site)`, which `skyState` now draws from, with `sky_model.gd`'s `libration`, `sun_hidden` on `godot/tests/sky/golden.json`; `BIO.leanTo` `toward: {az, alt}`, `BIO.bearingYaw`; `KFAR.sprites`, `spriteMesh`, `itemsExport` (a `kind` slot for the metropolis's masses, not built); KSTACKS kind `chimney` with `form` pipe, bell, stalk, siphon, `KSTACKS.bore`; `KRELIEF.scarp`, `scarpProfile`, `scarpRock`, `golden-scarp.json` for Gemini's model side; the field contract, `BIO.ENV`, `BIO.env`, `envCheck`, `envInto` (`41-core-env.js`).
  **Decisions to know:** `sunHidden` takes a site, because an eclipse's hour moves with longitude; with none it reads `ATMOS.skySite` (`ATMOS.skyBiome` sets it), else Voth. `flow` stays 0..1 and the water's metres are `flowDist`: `WATER.fieldAt`'s `flow` must not reach `BIO.field('flow')`. Only shighlands has real scarp code: ehighlands', swhighlands' and sedesert's fit the form by their nearest forms (`SCARP.md`).
  **Proof nothing moved:** before and after on r128's real chunks: animHook, phase materials, skyState over 168 site-hours, `snowGLSL`, lean, every KSTACKS kind's mesh and queries, far grids, relief: identical. The 39 node tests of core/terrain, biome and atmos: no line lost. Pages move by source bytes when each turn rebuilds them, as for `core-shader`; none is committed here. **Not done or not judged:** no shot of any piece: 8 new programs link on SwiftShader, with no GL error, and nobody has looked at them. A fallen chimney's `at` reads the trunk only, so it takes one mouth. A chimney's mesh has no `KSTACKS.weather`/`contour` pass tried. The breath has no Godot shader yet. Gemini's sculpt is still to do.
- `core-gills-hearths` **merged 2026-11-03** (what the Gills and the Hearths still needed). In, each opt-in in a new file, so no page takes it (`tools/reach.py`: 0 pages): `KSTRATA.lamina` (`core/terrain/35b-core-lamina.js`, `host/35b-core-lamina-shade.js`, `LAMINA.md`, `test-lamina.js`): a pipe's day couplets, annual wet bands, glass and thin-years markers, `at` / `atPipe` / `depthOf` ("day 412,117 of this pipe"), a bake and `laminaColor(depth, px)` in GLSL (compiled on SwiftShader, equal to `L.shade` to the byte); `KHAZ` moving and pooling (`core/hazard/21-core-hazard-flow.js`, README "Moving and pooling", GODOT.md, `test-hazard-flow.js`): `move.pull` toward the core (`moveAt`, `drift`) and `shape.pool` (gas deadly on the floor, nothing `pool` m up), on `at`, `dose`, `doses`, `here`, `exposure` once loaded. **The owed pieces, paid the same day** (each opt-in in a new file, 0 pages reached): the breath's `turn` (`core/biome/35b-core-anim-turn.js`: a yaw on a second key, normals turned, for the Stills' sails), `ATMOS.smokeGroups` (`core/atmos/fx/89-atmos-fx-smokegroups.js`: one cloud a group with its own strength), `KSPELEO` (`core/terrain/39b-core-speleo.js`: riftrim's hold, gypsum chandeliers, stalactites, stalagmites, columns), `ATMOS.shimmer` (`core/atmos/fx/89-atmos-fx-shimmer.js`: the heat shimmer, a post pass for `o.draw`), `klamina.gd` (the lamina's Godot twin, exact on its golden). **Then the Cliff Lungs', Godstep's and the limestone caves' (same day; `core/README.md`, "The Cliff Lungs', Godstep's and the limestone caves' pieces"):** `KLAVA.bakeLayers` / `column` / `strata` (the flows into KSTRATA), `KRELIEF.tumuli` and `tubeRille` (inflation, the rille over a tube), `KCAVERN.pipe` (an edit of `39-core-cavern.js`: older meshes hash as before; Dhelv and Zeijani, the two builds that take it, move by its source bytes at their next rebuild and are not rebuilt here), `ATMOS.deckLevel` / `deckDay` / `provideDeck` (the deck's day and its air), `KFAR.streaks` (far lines), `KKARST` (a solution cave's plan: branchwork or maze, chambers, levels, keyholes, sumps, dolines, cenotes) and `KSPELEO.LIMESTONE`. **Nothing owed from the Gills', the Hearths', the Cliff Lungs' or Godstep's section 14.**

  **Taking it, the Gills** (`biomes/gills/PLAN.md` sections 6, 9, 11, 13). Fragments for every gills station: `core/terrain/35-core-strata.js`, `35b-core-lamina.js`, `37-core-stacks.js`, `38-core-relief.js`, `39-core-cavern.js`, `44-core-farfield.js` + `host/44-core-farfield-draw.js`, `host/35b-core-lamina-shade.js`; `core/biome/33-core-fungoid.js`, `35-core-anim.js`, `39-core-lean.js`; `core/hazard/20-core-hazard.js` + `21-core-hazard-flow.js`; `core/water/geyser/52` + `52b`, `ext/53` + `53b`, `ext/54` + `54b`.
  - **The breath, once:** `const B = t => GILLS.breath(ATMOS.libration(t))` (the kit's shaped function of `.phase` / `.nod`; out-breath 1). Each frame: `BIO.breathState('gills').value = B(t)`; the steam `ATMOS.smokeGroups({breath: {emitters: gillEmitters, k: 0}, steady: {emitters: candles}})` with `G.set('breath', B(t))`; `KFAR.spriteMesh(S, {k: uBreath})` with `uBreath.value = B(t)`; the mist wall's `fogPool` density times `B(t)`.
  - **A gill:** a stack of `KCAVERN.trench` records with inset polys, one per wall step (a trench is vertical, so the steps are the stack), `cell` 2 m for a gill a kilometre long (0.5 m is millions of cells); its throats `C.shaft` plus `C.opening({kind: 'well'})`.
  - **A pipe:** `KSTACKS.make({kind: 'chimney', form: 'pipe', H, r, mouths: 1 (Red) | 2-3 (White, fork .5-.7), flare: {from: .8, k: 1.35} (Red), lean, toward, state, ledges, ice: {from: 0} (the ladder), ground, seed: KRAND.hash(world, ix, iz, i)})`, its bore `KSTACKS.bore(B).shafts` into the cavern, drawn `KSTACKS.mesh(B, {bore: 'open'})`; one `KSTRATA.lamina({seed, H, country: 'red' | 'white', markers: [{kind: 'glass', age}, {kind: 'thin', age}]})` per variant, drawn by `KSTRATA.laminaShade(L, {THREE})` (`core/terrain/LAMINA.md`, Adopting it), read by the inspector with `L.atPipe(B, x, y, z)`.
  - **The hazards** (each a `core/tags` record before it is drawn): the throat's in-breath `{kind: 'grab', danger: .7, falloff: 'linear', shape: {type: 'cyl', r, h, y0: -d}, move: {speed: .5, pull: 1.2, to: [0, -d, 0]}, stateFn: 'GILLS.suck'}` with `KHAZ.STATES['GILLS.suck'] = (r, h, t) => { const k = 1 - B(t); return {state: k > 0 ? 'drawing' : 'still', k, on: k > 0}; }`; the sumps `{kind: 'gas', danger: 1, falloff: 'none', shape: {type: 'poly', pts, h: 4, pool: 2}}`; the candles `{kind: 'heat'}` steady; rotten lips `{kind: 'fall'}`; the maw `KHAZ.PREDATOR.lair(r, {fauna: ['throatmaw']})` on the in-breath. A walker: `KHAZ.drift(x, z, t, y)`.
  - **Pads, fringes, collars:** `BIO.animMat('gills:pad', {mode: 'breath', breath: {key: 'gills', shape: 'bulge', amp: .4}})`, the fringes `shape: 'stream'`, the collar's colour by `albedo` and `rough` with `pbr` (`core/biome/README.md`, "The breath").
  - **Pools and aprons:** `WATER.spring({kind: 'pool', temp, milky})` (its `thermal.steam` plan joins the breath's cloud), `WATER.terraces` for the travertine, `ext/54`'s `ice` and the `blood` look for the Red Gills' stained ice.
  - **xanadu `--station gills` (Alph's head, station 6):** the above in the White dress at the glacier's edge (the upper pipes in the `ice` dress), the xanadu kit's own fountain particles with their rate times `B(t)` (`biomes/xanadu/NOTES.md`), set at the breath's hour. **catch** stations 3-5 and **godthrone** stations 1-2 take the same calls.

  **Taking it, the Hearths** (`biomes/hearths/PLAN.md` sections 6, 9, 11, 13). Fragments: `core/terrain/47-core-therm.js`, `37-core-stacks.js`, `38-core-relief.js`, `42-core-frost.js` (and `39-core-cavern.js` for the hold); `core/biome/33-core-fungoid.js`, `35-core-anim.js`, `39-core-lean.js`; `core/atmos/fx/89-atmos-fx-snowcover.js`; `core/hazard/20` + `21`.
  - **The heat:** `const H = KTHERM.create({soil, vents: [{id, kind: 'point' | 'line', x, z, T, reach, decay}], world}), F = H.bake({box, cell: 8})`; place by `KTHERM.fieldAt(F, x, z)` (hearth 25-60 degC, ember 60-95, stoker 10-25) and the rings by `H.contour(25, {box})`; the snow `ATMOS.snowBare(H.snowMask({box, cell}))` before the materials compile; the record `H.export({box})`.
  - **The work:** `HEARTH.work(t, W, atm)` reads the hour and `ATMOS.sunHidden(t, site)` (the eclipse); each frame `BIO.breathState('hearths').value = work`. The fans `BIO.animMat('hearths:fan', {mode: 'breath', breath: {key: 'hearths', shape: 'fold', amp: 1.4}})`, the spindle's silver `albedo` on the same key.
  - **The stalks:** `BIO.leanTo(null, k, {toward: {az: 0, alt: 40}, u: KRAND.unit(KRAND.hash(seed, ix, iz, i))})` (north: the sun's mean bearing at 50 S), the fans `{toward: {alt: 90}}`; the dead `KSTACKS.make({kind: 'chimney', form: 'stalk', state: 'broken' | 'fallen', toward})` (the Cold Hearths' snapped ones `fallen`), collision from the record.
  - **The hazards:** fumaroles `{kind: 'heat', radiant: {reach: 6}}` steady; the pools `heat` and `drown`; the fissure lows `{kind: 'gas', shape: {..., pool: 1.5}, stateFn: 'HEARTH.still'}` (still nights); sulphide snow `{kind: 'poison', danger: .3}`; thin ground `{kind: 'sink', trigger: {by: 'weight'}}`; the stalker `KHAZ.PREDATOR.lair(r, {fauna: ['hearthstalker']})` at night.
  - **oidong `--station hearths` (the Cold Hearths, station 3):** one point vent, one disc 120 m across, the narrow-fan dress (many fine ribs, short stalks), snapped dead stalks, `KFROST` patterned ground round it, a clear winter night preset. **riftrim** stations 1, 2 and 4, **godstep** station 5 and **geyser** `--station stills` take the same calls (the Stills read `WATER.geyser`'s `S.state(t).phase` for the flinch and turn their sails with `breath.turn`, `core/biome/README.md` "The breath's turn"; the hold takes `KSPELEO` for its chandeliers; the heat shimmer is `ATMOS.shimmer` on the KTHERM bake, `core/atmos/README.md`).

**`tools/dep_graph.py` fails here** (a `test_all` step; reported 2026-10-27): `core/atmos/demo/build.py` takes `three.min.js` from
`kits/ancients` and `kits/ringsea` (move it to a shared place, or allow-list it in `tools/dep_allowlist.json` with a reason), and a
false positive `kits/ancients -> settlements/span` from a comment in `kits/ancients/build.py` (make the scanner skip comments, or
allow-list it). The probe-points, probe broad-phase and camera-guard entries in `TODO.md` are done (9e86c8dad): take them out.

**Merge origin/main again** for `MODULARITY-PLAN.md`'s "Status 2026-10-27" (a67c26b4c). In stage 2, add Iziz's
`settlements/iziz/src/81-sky.js` (16 kits vendor it) to `SKY-PLAN.md` section 9: each kit binds `ATMOS.skyBiome` from one host
fragment and drops the copy. Check that the Iziz palace's own camera guard (`95q-palace-cutlabels.js`) came out. The plan's shared
building engine is now named `core/engine`, not `core/kit`.

**ChatGPT's visual integration plan, reviewed 2026-10-28** (`C:/Users/travi/Documents/Codex/2026-10-28/referenced-chatgpt-conversation-this-is-an/outputs/BIOME-REBUILD-VISUAL-PLAN.md`):
- **Take:**
  - **an environmental-field contract**, a small core-pass item: one documented set of host fields with units (elevation, slope,
    wet, salt, flow proximity, shore distance and depth, cold, upland, exposed rock) in `core/biome/README.md`, each derived from
    terrain, shore, strata and scour data. Kits name these ad hoc today (`wet`, `salt`, `upland`, `flow`, `mist`...). Each turn maps
    its fields to the contract.
  - **a material channel audit:** check which packed maps `KGROUND` layers and the biome materials actually consume (normal,
    roughness) before claiming PBR; then a coverage matrix (surface, maps, consumers, gaps) beside `core/materials/PLAN.md`.
  - **three lines in every turn's checklist:** ground layers are driven by documented masks; strata and scour outputs feed placement
    (ledges, talus, bars), not only the height; wet ground and flora read the same shore distance as the water (`WATER.audit`).
- **Skip:**
  - its pilot-first sequence: the owner's pair order stands, and nine biomes are already done;
  - its shoreline and junction step: `core/water/PRACTICE.md`, `WATER.audit`, confluences and `claude/water-core-pass` cover it;
  - its budgets step: `GRAPHIC-LOAD.md`, `PERF.md`, and `BUDGETS.json` on `claude/core-tools-57240f` cover it;
- **Ground is the weak point** (the owner, 2026-10-28: "the ground nevertheless does remain a weakness, it tends to be 'okay' at
  best"). Having `KGROUND` in the universal set has not made the ground good. Make it a core-pass workstream of its own, with
  ChatGPT's step 2 (ground layered by ecology and landform) as its spine:
  1. **Diagnose first, on three ground types** (a forest floor: nhighlands; a rocky or eroded surface: sedesert or necanyons; a wet
     or salt margin: eastabyss or the Bowl). Take near, mid and far screenshots, and say what makes each read "okay": macro paint
     dominating; layers too few or too uniform; normal or roughness maps unread; tiling; no micro-relief; mesh too coarse for the
     shading; no debris; flat light on flat ground.
  2. **Then the core fixes the diagnosis names.** Likely candidates:
     - `KGROUND` reads each layer's normal and roughness;
     - the planned detail normal field (`PLAN.md` "From spiderbench", the `detail.*` sets);
     - triplanar sampling on steep ground;
     - anti-tiling macro variation;
     - layer weights from the environmental-field contract (wet darkening, salt bloom, scree under slopes, organic litter under
       canopy) and from strata colour on exposed rock;
     - a near-camera scatter of small debris and cover (pebbles, litter, twigs, low cover cards) on core instancing;
     - finer ground mesh near the camera.
  3. **Judge by eye with the owner**, on the three pages with switches for before and after, then add it to every turn's checklist.
  Budget it like the rest: measured, not assumed.
  **Done 2026-11-03 (core-ground; `core/terrain/GROUND.md` has the diagnosis, the channel audit and the shots).** The cause: no
  light reaches the ground's texture. KGROUND reads colour only, 262 of 276 ground slots are packed `mapOnly`, most grounds are
  Lambert (lit per vertex on 9-14 m cells), and the strata are a colour function. The fix, opt-in on `KGROUND.hook`: `relief` (a
  derivative bump from the layers' height, at no texture unit; cavity occlusion; `strata` bed relief, hard beds proud, on the core
  strata path), `tri` (side planes on the steep), `KGROUND.cavityMesh(mesh)` (the mesh's hollows, `relief.mesh`). Without them the
  shader is unchanged. Judge any page with `?kgrelief=1&kgtri=1` (`?kgrelief=2` doubles it); `tools/ground_shots.py` takes the
  same near, mid and far cameras with and without, with calls, triangles and GPU ms. The owner: "ground quality has definitely
  improved". Defaults are unchanged until the owner says otherwise. **Every turn's checklist gains: the ground judged with and
  without `?kgrelief=1`.**
  **Which builds take it at their turn** (each reads `43-core-ground.js` already, so each page is stale by its source text until
  rebuilt, recorded in `tools/check_stale_baseline.json`; adopting is `relief`, `tri` and `cavityMesh` in its ground's `KGROUND.hook`,
  `core/README.md` "Adopting KGROUND's relief"; judge first with `?kgrelief=1.5&kgtri=1`):
  - MeshStandard grounds under KGROUND, the full effect (`relief: {bump: .075, cavity: .8, mesh: 1}`, `cavityMesh` on the ground):
    **ebadlands** (+ canyons, montane, tundra, waste; and `strata: .45, strataW: 'vRock'`), **godthrone** (`strata`),
    **swlowlands** (+ delta, gorge; `strata`), **copperglacier** (+ icefield, pass), **nsemiarid**, **oidong** (+ hearths, passes),
    **xanadu** (+ gills). `tri: true` only where flanks are steep and near (ebadlands' canyon walls, the glacier's pass).
  - Lambert grounds, where the relief only scales the sun's share and shows little (measured on nhighlands and eastabyss): move the
    ground to MeshStandard first (the light per pixel; their `?kground=0` fallbacks may keep Lambert), then `relief` as above:
    **eastabyss** (+ lakes), **hyperjungle** (+ lake, savanna), **necanyons** (+ benches, savanna), **nhighlands**, **nwbay**,
    **nwlowlands** (+ margins; two hooks, ground and marl), **sedesert**, **swbay**, **swhighlands**.
  - Reading the file but with no KGROUND ground yet (they take KGROUND first, then the above): **scablands**. **throne: done 2026-11-03**
    (every station's ground but the tube's on `KGROUND.hook` through `THRONE.kgGround` and MeshStandard, `relief: {bump: .075, cavity: .8, mesh: 1}`, `cavityMesh`, `tri` on the cliff stations; `biomes/throne/PLAN.md`).
  - **Adopted 2026-11-04 (the west catch-up, branch `claude/ground-catchup-west-cloud`): swlowlands, nwlowlands, swbay, sedesert**,
    all eleven pages rebuilt (`tools/build.py`), `PORT-BASELINE.json` updated for them, their seven `check_stale` baseline entries
    dropped. Settings, each in its ground's `KGROUND.hook`, and `KGROUND.cavityMesh(m, {rings: [3, 18], depth: [.5, 4]})` on every
    ground mesh (the floor and each strip):
    - **swlowlands** (+ delta, gorge): already MeshStandard; `relief: {bump: .075, cavity: .8, mesh: 1, strata: .45, strataW: 'vGM.x'}`;
      `tri` on the gorge only (its stage's `groundTri`: the 620 m walls).
    - **nwlowlands** (+ margins): the ground (and the marl strip's material) Lambert -> MeshStandard (roughness .96); ground and margins
      hooks `relief: {bump: .075, cavity: .8, mesh: 1}`; the marl hook adds `strata: .45, strataW: 'vGL2.z'` and `tri` (the gorge's walls).
    - **swbay**: Lambert -> MeshStandard; `relief: {bump: .075, cavity: .8, mesh: 1}`; no `tri` (no flank steep and near).
    - **sedesert**: Lambert -> MeshStandard on the kit's ground (the vertex's sun share `vSun` now scales the direct light after
      `lights_fragment_end`, as `getShadowMask()*vSun` did) and on the Bowl's (`stations/bowl/84-host-ground.js`, read by the Bowl, Mantis
      and the steppe); `relief: {bump: .075, cavity: .8, mesh: 1, strata: .45}` with `strataW: 'vRock'` (kit) and `'vL2.y'` (the Bowl's
      yardangs); no `tri` (the layers lie on the flat; the steep faces' detail is `GROUND_TRI`'s already).
    - **Switches on every page:** `?kgrelief=0` the relief off (still MeshStandard); `?kgstd=0` the Lambert ground and no relief
      (nwlowlands, swbay, sedesert and the Bowl; their `?kground=0` keeps Lambert too). The page's own `relief` wins over
      `?kgrelief=1.5`; `?kgtri=1` still adds the side planes where the page set none.
    - **Fixed on the way:** sedesert's carve material (`MAT_CARVE`) runs the ground's composed hook, so the sky's cloud shade and height fog,
      added to each lit material, ran twice on its shader: the shade threw (on MeshStandard the page drew two calls; on Lambert, `?kgstd=0`, the error panel
      showed it too) and the fog's varyings were declared twice. Their names are held on the carve by empty layers, in both materials. swbay and sedesert list `31b-core-leafset.js` (`check_assembly`:
      `20-core-kit.js` calls `BIO.leafOn`).
    - **Checks:** `check_core_use` no new finding; `check_assembly`, `check_stale` 0 over; `test_all --no-build` fails only steps outside
      this pass (gpu lanes, test-lava and test-scarp goldens, the isle demo's missing `dist/isle-city.plan.js`, interiors test-walk).
      `verify.py --assert` in software GL (SwiftShader, 12-28 min a page) on all ten pages: error panel clean and no shader error on every
      one. swlowlands (all three) and nwlowlands (both) pass; swbay and the four sedesert pages fail only the core attach audit (foliage
      floating, 7-18%) and Mantis and the steppe the instance cap (grass, bunchgrass): not the ground, owed by those kits' own turns.
      **The GPU `--all-views` verify is the coordinator's.**
    - **Judged** (`tools/ground_shots.py` in SwiftShader, 960x540, no GPU timing; the audit shows bump, occlusion, mesh cavities, side
      planes and bed relief linked where set): the gorge's walls gain the most (each bed a lip and a shade line, the wall's foot and its
      hollows darker), but the near slope's bed lines alias into fine stripes and the valley-scale cavity darkens the whole lower wall:
      judge on the GPU, and lower `mesh` or the second ring's depth if it reads too dark. The plain's leaf litter and nwlowlands' lake shore
      gain a fine stony grain near the eye (in SwiftShader, without anisotropy, it reads partly as noise). MeshStandard alone makes
      nwlowlands' floor lighter and evener than Lambert's mottled per-vertex light: check it against the owner's "too uniformly bright".
      One swbay frame showed its litter washed out on MeshStandard; a direct load shows the litter as on Lambert (the frame caught the
      texture before it streamed). sedesert ("The wadi gorge"): the bed relief is left out by
      itself (the kit's strata are the legacy column, not the core path: the audit shows `beds: false`). The shaded wall's foot and its
      undercut go nearly black (the mesh cavity's mean is .23 on this floor, the highest of the four: in shade the sky is the only light and
      the occlusion takes most of it); the sunlit walls gain faceted shading. **Likely wrong as set: judge on the GPU, and try `mesh: .5`
      or `cavity: .55` here.** The Bowl ("The salt flat"): next to no change at any
      distance (MeshStandard a shade more saturated than Lambert; the flat crust has little height to bump, mesh cavity mean .06); its
      layers are procedural kinds with no map, so `kgtri` samples nothing, and its strata are the legacy column too (`beds: false`).
      Mantis and the steppe read the same ground and were verified, not shot.
  **Catch-up, the eastern and jungle kits (2026-11-04, cloud; branch `claude/ground-catchup-east-cloud`, not merged):** eastabyss
  (+ lakes), hyperjungle (+ lake, savanna), necanyons (+ benches, savanna), swhighlands (+ pillars, treeline, the pillars' Span
  preview): the KGROUND ground is MeshStandard (roughness .96; Lambert where there is no pack or on `?kground=0`) with
  `relief: {bump: .075, cavity: .8, mesh: 1}` (swhighlands `mesh: .7`); `?kgrelief=0` on these pages drops the relief for the
  before-and-after (once a page passes `relief`, `?kgrelief=1.5` changes nothing: the page's options win). Hollows: `cavityMesh` on
  eastabyss and hyperjungle; necanyons computes `KGROUND.cavity` on the whole coarse grid before its cells are cut and the fine
  patches read it bilinear (seamless); swhighlands bakes one 12 m field over the square that every ground piece and the cave hood
  read, at `depth: [1.5, 30]` (the core's 4 m valley depth turned the pillars' cliff foot black over a 200 m band). **No `tri`
  anywhere:** past its onset are 0% of the ground's vertices on eastabyss and hyperjungle, 2% on necanyons (the talus's top), 2-8%
  on swhighlands, where the strata colour paints over KGROUND's layers on that steep ground anyway. Species, keys and indices
  untouched; 13 pages rebuilt with `tools/build.py`. **Judged in software GL only** (`tools/ground_shots.py`, 960x540; the GPU
  verify is the coordinator's): eastabyss's salt crust gains the most (the cracks cut and shaded near and mid); necanyons and
  swhighlands read finer and a shade deeper in the hollows; hyperjungle's floor under the canopy changes little. What to look at on
  the GPU: the grounds read a little paler at grazing angles on MeshStandard; the hollows by necanyons' creek (its fine patches'
  cavity mean is .43-.49, against .10-.16 on the coarse floor); swhighlands' cliff feet. eastabyss's far camera falls on the lake
  (no far judgement). `verify.py --assert` in software GL passed on eastabyss, hyperjungle, necanyons, swhighlands and the pillars (one view each;
  the other eight pages loaded with no page error and their ground as above, not asserted). `PORT-BASELINE.json` not rewritten: after the GPU verify.
  **A core bug this found (for the coordinator; not fixed here):** three.js r128 uploads `cameraPosition` only to ShaderMaterial,
  Phong, Toon, Standard or an env-mapped material. On a **Lambert** ground, KGROUND's `kgD=length(kgWP-cameraPosition)` (and the
  sand glint's view vector) therefore measure from the world origin: the layers' distance scale coarsens with distance from
  (0, 0, 0), not from the camera. With only the material changed (new sources, Lambert against Standard), necanyons' litter near the
  camera drew about 10x too coarse and eastabyss's crack layer vanished into smears. This is probably much of why GROUND.md saw
  "next to nothing" on the Lambert grounds (nhighlands, eastabyss). Every Lambert KGROUND ground still has it (nhighlands, nwbay,
  nwlowlands, sedesert, swbay and the others in the list above): either the move to MeshStandard at each turn, or a core fix
  (KGROUND binds its own camera-position uniform, updated each frame, or derives the camera from `viewMatrix` in the shader) that would move every Lambert page.
  pinnacle-rock reads necanyons' `47-host-land.js` in place but has no KGROUND, so this pass changes nothing there (its ground stays
  Lambert); its committed page is behind its sources since 2026-10-20 for other reasons and was not rebuilt here.
- **Its water step, against `core/water/PRACTICE.md`:** most of it is covered (the audit, confluences, the network, the shore from
  the ground, breakup). Four points the practice lacks, to take:
  1. **The land side of the water edge:** `WATER.audit` checks water against ground only. Extend it, or a sibling check, so that
     plants keep clear of the water's surface and the wet-ground band follows the water's real edge, not the mask. Worked example:
     one shoreline and one junction with water, wet ground and plant edges matching. It pairs with the ground workstream.
  2. **Water as fields:** the shore distance, depth and flow proximity, exported (for example `WATER.fieldAt`) as entries of the
     environmental-field contract, so ground wetness and flora read the water's own numbers.
  3. **Staged shore-grid bakes** where a grid causes a load hitch: measure first.
  4. **The water ext modules' order** (55 after 22, 57 and its needs), declared to `core-tools`' `check_assembly`, so a build missing
     one fails at build time.
  Skip its "preserve advected ripples on rivers": the owner asked for breakup on rivers too (eastabyss, `WATER.breakupFlows`).

**Reflections: lessons from the Menagerie's Lake AtitlÃ¡n** (the owner, 2026-10-31; `host/WorldMenagerie/src/atitlan/waves.js` on
origin/main; settings in `data/cities/atitlan.json`, `waves`). Core water reflects only the sky (`A.skyEnv`), so hills and shore trees
never appear in a lake.
- **How AtitlÃ¡n does it:** a second camera mirrored in the water plane renders into a target at 35% of the screen's width and height,
  every 2nd frame, with shadow updates off and a clip plane at the waterline. Only non-instanced meshes over 30 m radius are drawn
  (on layer 1, rescanned every 2 s). The water mixes it in by Fresnel, capped at .92, with the UVs nudged by the wave slope, and rain
  dulls it.
- **Why it may not transfer as it stands:**
  - resolution only cuts fill, and `biomes/nhighlands/PERF.md` found our pages vertex-bound, so the cost is the ground's vertices;
  - AtitlÃ¡n's rule drops instanced meshes, which on a biome page means every tree, so forest shores would reflect bare ground;
  - it serves one water level, so rivers, terraces and second lakes stay on the sky reflection;
  - our sky is a separate background pass and must be drawn into the target too;
  - Godot has no built-in planar reflection: the twin needs a SubViewport mirror.
- **Tiers, cheapest first; stop at the first the owner accepts:**
  1. **Ridge reflection:** draw the sky model's ridge profiles, or a one-shot capture from the lake's centre, into the reflection
     lookup. No per-frame geometry, and it refreshes only when the hour changes much.
  2. **A static mirror:** the planar render above, done once and again on a slow timer, for still water with a nearly still camera.
  3. **A live mirror:** AtitlÃ¡n's method for the one largest still in view, drawing `KFAR`'s far field and the sky plus far impostors
     for trees, never hero meshes. Off underwater, off when the still fills little of the screen, off beyond a set distance.
- **The gate:** opt-in per surface with a `?mirror=0` switch. Measure on the Intel Arc 140T by `tools/perf_views.py`, on a lake view
  and on a view with no lake (it must cost nothing there), on a heavy page. Set the limit with the owner before tier 3 lands.
- **Cheap lessons, no mirror needed:** fade each wave by its pixel footprint (`wFoot`) so far water doesn't alias; sum waves of
  incommensurate lengths on golden-angle bearings over warped coordinates (compare with `WATER.breakup`); drop the glint's shininess
  in wind; let rain dull the reflection; tint shallows by exp(-depth/d) from a baked depth map; add a pale wet edge and surf strip at
  the waterline (it suits the ground workstream).

**The mirror prototype, measured 2026-10-31** (`core/water/ext/58-core-water-mirror.js`, opt-in; on eastabyss by `?mirror=off|probe|live`,
with no query nothing installs). Intel Arc 140T, 1280x720, GPU timer queries, minimum of 9 frames:

| View | World pass | Live mirror pass (35%) | At 25% | Mirror draws |
|---|---|---|---|---|
| The salt lake | ~15 ms | 2.2-2.6 ms | 2.0-2.1 ms | 32 calls, 0.86 M tris (world 199, 3.83 M) |
| Marsh pools | ~18 ms | 3.0-3.1 ms | 2.7-2.8 ms | 37 calls, 1.12 M tris (world 245, 5.21 M) |
| The east delta | ~16.5 ms | 2.9 ms | 2.7 ms | not read: the counter was fixed after this run |
| Salt flats (no lake in view) | ~3.4 ms | 1.15 ms | 1.1 ms | must be gated off |

- **Live mirror:** every 2nd frame that is about 1-1.5 ms a frame on the lake views, roughly 7-8% of the world pass. Dropping the
  resolution barely helps (as predicted: the cost is vertices). It compiles no new programs (oblique clip, the page's output encoding).
- **Probe:** a capture of about 20-27 ms GPU, 0.5-0.9 s wall on the main thread (a hitch: split it over six frames). After that a frame
  costs nothing the timers can separate from noise. The water's extra shader cost is also within noise (timings swing Â±25%).
- **Limits of this run:** the far-tree filter (`/^biome:far/`) matched nothing, so **no trees are in either tier yet**, and with them the
  live number will rise: find eastabyss' real far meshes and re-measure. The page **crashed** ("Target crashed") in all three bench
  runs after several views, cause unknown (it was not seen without the bench's mode switching): find out before adoption. The world's
  view timings on Marsh pools swung 17.7-27 ms while the bench ran. The look hasn't had the owner's pass: the bench pages are only
  on `?mirror=`. The probe shows a pale band at the near shore on Marsh pools (parallax radius or capture height).
- **Not done:** auto-off when no still is on screen, or the camera is far; one water level only; `KHOOK` adoption (`core-shader`); no
  Godot twin; no PORT row or node test.

**Every biome gets the switch; the mirror stays off at page load** (the owner, 2026-11-01: so the tri counts don't rise). `WATER.mirrorSwitch`
(`core/water/ext/58`) adds a "reflections" button that cycles off, probe, live, and builds nothing until first turned on (eastabyss: 199 calls,
3.83 M tris either way at the opening view). eastabyss has it. Each biome's turn with a large still adopts it (`BACKPORT.md` section 1,
`core/water/README.md`). `?mirror=probe` and `?mirror=live` still work. The capture now draws one face a frame into a second cube and
swaps it in, re-captures when the hour moves by 1, and includes the far trees (`biome:impTrees`, 16,974 instances). The soak: 93 view
changes in probe mode, no crash, geometry, texture and program counts flat; so the bench's crash is in the live tier or its
switching (not traced; trace it before any lake takes `live`). eastabyss' `--assert --all-views` fails only the foliage attach audit
(5.84% of cards, limit 1%), which predates the mirror (the guards landed after its turn); the error panel and console are clean.
Left: the near-shore pale band; adopting it per kit (a still's `center`, `radius` and `level`); one cube per lake; the Godot twin; a node
PORT row.

**The mirror's open issues, closed 2026-11-02** (`core/water/ext/58`; Arc 140T, eastabyss):
- **The crash is the bench, not the page.** It needs a loop of `EXT_disjoint_timer_query_webgl2` queries round `M.renderLive()`: "Target crashed" after 31 views, and again after 11. Without timers: 14 minutes live on the page's own loop (56 views, memory flat) and 48 views of resolution switching, no crash. Not run: timers with the mirror off, so whether the mirror matters to it is unknown; time a mirror pass with few queries.
- **Reflectionless trees:** a pass inherited the main camera's runtime LOD, so stand-ins near it were hidden and heroes aren't drawn. A pass now shows every stand-in and opens BIO's fade range. Trees under 7 m have no stand-in. Live pass 2.4-3.4 ms (2.0-2.9 at 25%), every 2nd frame: no measurable rise.
- **Water that reflected nothing:** the rivers' and forks' ribbons were not in `materials`. A page lists every surface near the mirror's level.
- **The pale probe:** the sphere must be the shoreline's distance (eastabyss 6000 -> 1500 m). It is better, not gone: one capture point can't hold a near shore. The live tier is the good picture; the probe is the cheap one.
- **`far`:** the live pass is skipped past that distance from `center` (eastabyss 4000 m).
- **Left:** one cube per lake, the Godot twin, a test of the stand-in pass (GPU shots only so far).

**ebadlands' turn (2026-11-02, pair 5; `biomes/ebadlands/PLAN-STATIONS.md`, "Core adoption"):** the transect stays the overview (B0 decided at the turn) and four stations are built on 5.1's survey: `waste` (BSh), `canyons` (the Grand Staircase), `montane` (a meadow, a burn, a cirque tarn), `tundra` (krummholz, patterned ground, a valley glacier). The land is split from the stage (`src/44w-host-land.js`, the land contract; `src/44v-host-landlib.js`); `src/35-core-strata.js` is gone (KSTRATA's `badland` and `canyon` recipes); `88-host-build.js` is `89z-host-build.js`. **Species for readers (eastabyss, the open world, Yuni): keys and indices unchanged;** `bloom` is `onLeaf`; floor blooms and tufts sit on the ground at their own spot (same draws); the moonflower column has the quality pass; the dressing's crusts are `crustf` (`BIO.fung.crust`) only where a page has core/biome 33. **The 16 texture units:** the strata (5) leave five library layers a ground: a page with KSTRATA, KHORIZON and the rain cover cannot take more (ANGLE on the Arc linked 15). **Fixed 2026-11-03 (the owner's stilt pods):** a page whose trees go through a nursery harvest (ebadlands' `86-host-variants.js`; `openworld/isle-demo`'s `84-world-nursery.js` the same) must expand items welded by `BIO.INDEX_ITEMS` before copying them: copied vertex by vertex they draw scrambled triangles, and the attach audit cannot see variant pools. Owed: sedesert's mesquite (wired, not read: its crowns float off their limbs), the Bowl's tamarisk, ebadlands' juniper to sedesert main and cottonwood to the Bowl (sedesert's next turn), Korona's rows (pair 9).

**swlowlands' turn (2026-11-02):** species changed for readers: none of keys 0-26 or their indices; new 27 `springcypress`, 28 `ribbonroot`; new `SWLOW.make`, `grow`, `veto`, `IMPOSTORS`; item `padbloom`; `bk.mottle` is `bark.plane`; the madrone's blooms sit lower in the crown; every tree's shape re-rolled once (per-tree reseed); `88-host-build.js` is `89z-host-build.js`. Owed: swbay's receiver rows (mangrove, coastoak); `biomes/swlowlands/PLAN-STATIONS.md`, "For the owner".

**The Throne's turn (pair 5, 2026-11-03; `biomes/throne/PLAN.md`, "Core adoption" and "New stations"):** all eleven pages rebuilt on the universal set (in `src/` fragments
no station overrides: `80`, `89x`, `89zz`, `98z`, `99-host-tz`; the build moved from `88` to `89z`, after the water), every attach audit at 0-0.0%; map 5.1's frontier
re-survey (its flank refitted), the caldera checked (a ~250 m pit in the model's floor is the owner's call), `tube_hot_05` recorded; three new stations, 12 the
lava delta, 13 the blast zone, 14 the lee's penitentes. **Species changed for readers** (ringisles, the Godthrone; `THRONE.SPECIES` keys and indices kept, 33):
crowns held on their wood (Ranj, ruff, ash pine's mid tier, great ruff, lehua and its pompoms, mangrove, elfin); limbs flared into their parents (`BIO.flareJoin`, on a page that lists `31j`); every page takes `KSHADOW` (`src/89zz`) but the isle and the vents, whose grounds read all 16 texture units (r128 puts the shadow map in every lit material); on station 1 they cost about +42 ms a frame on the Arc 140T (115-143 to 159-185 ms, wall clock; +30-38%), which it cannot afford: off by default since (the owner's decision above); a stalk under each great ruff; far trees are impostors
where `34-core-impostor.js` is on the page; new item `rafthair` (the snare raft's hairs, `free`); `drip` and `moss` cards `onLeaf`, hung inside half a cap; new
`THRONE.veto`, `THRONE.layGLSL`. **Core fixed on the way:** `cloudShade` on a Phong material (the glacier's ice threw at render), the lava's crust uniform (a cloned map
never decoded), the acid hook's rain-cover splice. **Found:** the caldera's Lambert ground reads `cameraPosition` (0) for its snow glints; the new stations' copies use `kEye`.
**Owed:** KFAR per station, the row's terrain (strata, KLAVA, pit chains) and ground kinds, the river-mouth plume on the frontier's and the isle's streams, ringisles'
pandanus (`biomes/throne/KNOWN_ISSUES.md`, "The final rebuild").

**High Rift, a new kit (2026-11-03, cloud; branch `claude/highrift-cloud`, not merged; `biomes/highrift/PLAN.md`, `KNOWN_ISSUES.md`):** scale model 5.1's
`rmvhighrift100` on Gemini's own design (`smodel/se_provinces.py`: its five zones, heights and lakes kept), five stations on one stage, each a 5.2 km ideal type
placed on the carved ground: **the Caldron and the Opaline Cataract** (`dist/highrift.html`, 5.1 px 1358,1661: the 2,580 m hot pool as `WATER.open` without surf or
breakers, the cataract as four `WATER.terraces` tiers and a tall fall, Brant-Fell Gill's flour as a moving plume (ext 61), the outlet's 13 rimstone pools, a geyser),
**the Mirror** (`-mirror`, 1430,1630: acid Lake Verdigris, a boiling patch over vent 89, the hematite fault mirror, acid springs; nhighlands' larch read in place by
`BIO.kin` as the rift larch, **off by default** (`?larch=1`: its crowns float 9.6% here, owed to nhighlands' turn)), **the Dorsal Wedge** (`-wedge`, 4,200 m tundra crest), **the Coulee** (`-coulee`: lava lobes, the Gill's outburst channel, vent 90's
geyser) and **the Singing Gjár** (`-gjar`: the 310 m master gjá with gin-clear water, ten singing fissures lined with bladed quartz; the singing as `HRIFT.SOUND` records
for a `core/audio` that does not exist yet). Every page takes the universal set (`31j` flareJoin, `WATER.mirrorSwitch` off at load, KSHADOW attached **off** at load:
`?shadow=1`, KSTRATA `rift` on every face, KGROUND, KFAR, KHORIZON, KTHERM on every vent) and reads **the Hearths and Oidong's high country in place**. Not taken:
KHOOK.warp (an empty slot), KKARST/KCAVERN (no caves, no carbonate). **Checks (no GPU):** `check_core_use` 0 findings; `verify.py --assert` (one view each) **OK on all five pages** on
software GL (SwiftShader; the kit's `KNOWN_ISSUES.md`, "What ran here"); `test_all --no-build`: the highrift findings fixed, the rest of its failures the base branch's
(the six LFS pointers, `test-lava`/`test-scarp` goldens, the Throne's three stale stations); **owed to the coordinator:** `verify.py --assert --all-views` on the GPU, the hash baseline,
KSCOUR on the Gill's bed, Lake Cinnabar's page. Look decisions for the owner: the plan's section 11.
**Copper Glacier, the new kit (2026-11-03; `biomes/copperglacier/PLAN.md`, `KNOWN_ISSUES.md`):** first, **`KGLACIER` is in core**
(`core/terrain/44g-core-glacier.js`, [G data], and `host/44h-core-glacier-draw.js`, `test-glacier.js`), lifted from the Throne's glacier station. The data half
holds the ice, the trough, the moraines and the pond basin, plus seracs, bergs, crevasses and caves on `KRAND.hash` per kind and index. The drawing half has the
serac and ice-tower items, the cave shells, the arch, the crevasse slots and the steam. The station takes both (station.json `"terrain"`, a new key in the
Throne's `build.py`) and keeps its own placement draws. A scene fingerprint (every mesh, instance, registered record and a terrain grid) reads 39 of 39 lines the
same before and after, so the page draws exactly what it drew; its hash moved for the code that moved, and its baseline entry is rewritten.

Then the kit. It is three pages on map 5.1 sites, one stage making each station's land from the numbers in its `44z-host-site.js`:
- `dist/copperglacier.html`, Copper Tarn (px 156,1150): a glacier calving into the turquoise tarn;
- `-pass`, the copper slope (px 320,1248, the skarn): a hanging glacier, its moraine pond, malachite and gossan, the nodes, copper flowers;
- `-icefield` (px 213,1225, 6.5 km): plateau ice, nunataks, the ice cliff, ice caves.

**The copper is read from `geology.json` at build time** (`res_site.js` writes `CG_RES` into the page), not invented. **The lore's porphyry is not in the data**: copper
is 50 on the gneiss and 240 only on the eastern pass's rift skarn. The kit follows the data, and that is for the owner (`PLAN.md` section 1). Ice caves only: there is
no soluble rock. Life: frost coral (the cold lineage, limbs on `BIO.flareJoin`), verdigris cushions, copper flowers on the copper ground, lichen, moss, sedge, snow
algae, and ice worms that glow at dusk.

The universal set is taken: KGROUND on documented masks, KFAR and KHORIZON, KFROST, still water with no surf or breakers, the stream's plume, `WATER.mirrorSwitch`
off at load, the shore's fields, and the shared sky at each site. KSHADOW is measured at +20-56% a frame on the Arc (station 1), so it is off at load (`?shadow=1`), for the owner. KSTRATA, KKARST and impostors are dropped, with reasons. The owner delivered
the kit's two sets the same day: `rock.gneiss.banded` (the walls of stations 2 and 3, the boulders everywhere) and `ice.glacier.verdigris` (the ice on the copper ground).
**Checks:** `verify.py --assert --all-views` passes on the GPU (RTX 5060 lane, D3D11) for all three pages: station 1 53 checks (9.7 M triangles, 25 calls), the pass 53 (14.8 M, 22), the icefield 50 (1.7 M, 16), attach audit 0.00%. `check_core_use`: no new finding. `test_all --no-build`: the only failures not this work's are interiors' test-walk and `check_assembly`'s NEEDS findings on the Godthrone's, Voth's and Span's committed pages (built before core-shader). The pages are in the hash baseline. **For the owner:** every station's look; the copper (data against lore); the shadows' cost.
**Then (same day):** KGROUND's relief taken on all three pages (`relief: {bump: .075, cavity: .8, mesh: 1}`, `KGROUND.cavityMesh`; `tri` on the pass; `?relief=0`, `?tri=0`). The owner's two notes: the ice caves sat on the ground like bubbles, so each now has a levelled pad, an apron of ice into the ground, a sunk foot and a lower, narrower mouth facing down the glacier (`KGLACIER.drawer`'s new opt-ins `apron`, `skirt`, `mouthTop`, `fine`, `uvWorld`, `caveFloor`; off by default, so the Throne's caves are unchanged); and the frost coral's limbs were blunt, so they now taper to a point. The pages were re-verified on the GPU, 53, 53 and 50 checks.


**The Godthrone's turn (2026-11-04, in the cloud, no GPU; branch `claude/rebuild-godthrone-cloud`, from `claude/biome-rebuild` at 0c4ad8f82 with
the ground relief 4fd72d64f; `biomes/godthrone/PLAN.md` sections 7a and 9b, `KNOWN_ISSUES.md`):** the owner widened it (relayed 2026-11-04) to every
planned station. **Ten pages:** stations 1, 1b and 2 rebuilt, and seven new `--station` pages on map 5.1 sites (7a has each px, height, air and class):
`orange` (the dry-cold line near Pluton: palagonite cliff with tafoni, knife-edged ridges, debris-covered ice, the endoliths in split stones),
`scarp` (the south-western basal escarpment, a 600 m wall of flows, colonnades below, ochre partings), `rim` (the SW Outer Wall's crest: core's
megabreccia under an overturned flap, slump scarps, a cirque with relic ice, pavement, sand-wedge polygons, ventifacts), `blood` (core water's
`WATER.underIceFall` out of the ice belt's cliff, the red pool, Qol Ḍrāi's `bloodriver` with 13k blades of riverweed), `gills` (the Red Gill,
`biomes/gills` station 1: one 1.6 km x 60 m x 300 m radial crack, 382 tall single-mouthed red pipes, the ferromanganese collars, the breath, KHAZ
pull and pool), `gills-ladder` (gills station 2's top rungs: iced pipes as fumarolic towers, frost jets with rime fans over the line), `tube`
(the Ilmenite Pillar Vault on `tube_god_n_12`, KCAVERN, 494 ilmenite columns, the cross-conduit leaving toward Godstep's pit at 52 degrees).
`blood` and `gills` share one frame, 11.3 km apart. A station's far country is map 5.1's own relief (`biomes/godthrone/tools/region.py`).
**The universal set:** KGROUND's relief on every page (`relief:{bump:.075,cavity:.8,mesh:1,strata:.45}`, `cavityMesh`; `?kgrelief=0` the old ground),
KSHADOW off at load (`?shadow=1`, not measured: no GPU), `rock.basalt.titanium` wired as the faces' and blocks' grain, the tuff aprons downwind
(`tibasalt-ash`, a kit recipe: flank, gills, blood, ladder), the megabreccia on the rim. Dropped with reasons (9b): flareJoin (no limbs),
mirrorSwitch (the only still is a 26 m pool), the plume (no river meets still water). Card cells: 0 faults. Textures newly wired: `rock.basalt.titanium`,
`mineral.crust.ferromanganese` (the Red collars), and the library's palagonite, tafoni, megabreccia, debris ice, rust ice, rust terrace, red riverweed,
pavement, lichen crust, columnar basalt, glacier ice (each page takes only its own: station.json "tex").
**Species changed for readers:** none renamed or reindexed; `GODT.SPECIES` is still empty. New items `splitstone`, `endolith`, `ventifact`;
`GODT.GROUND` and `groundAt` gain eight classes (0 on the old stations, so their draws are unchanged). **biomes/gills:** the Red dress is drawn by a
port of xanadu's `87-host-gills.js` (lifting it into `biomes/gills` is owed).
**Checks (software GL, SwiftShader, this container):** `verify.py --assert` with one or two views each passed on the summit, the wall, orange, scarp, rim, blood, the ladder and the tube; the last fixes (the flank's ash check sampled 96 faces against a floor of 100, now 40; one Red Gill side crack's throat volume caught no probe point, now widened) were built but not re-verified (the owner: stop verifying, 2026-11-09). The generic card negative is left out on pages with no cards (KNOWN_ISSUES). `check_core_use`: no new finding.
`test_all --no-build`: not run (stopped with the verifies). **For the coordinator:** `verify.py --assert --all-views` on the GPU for all ten pages, KSHADOW's cost,
the relief judged with and without `?kgrelief=0`, then the hash baseline for the pages (not rewritten here). **For the owner (look decisions):**
the rim's site and its flap's rock, the scarp drawn as a 600 m wall on a ~6 degree raster slope, the bloodfalls' rust rate, the Red pipes' height
(30-85 m), the ladder as its top rungs only, the vault's lamp-only light, and the bead sand's glints under the relief.

**Still water takes no breakers; river mouths take the plume (the owner, 2026-11-02, from swlowlands' delta; `BACKPORT.md` section 1 and 5):** a lake or a
sheltered arm drawn by `WATER.draw` passes `surf:false, breakers:false` (a shore grid's breakers drew white contour rings round islands). Fixed on swlowlands
and nwlowlands; ~~**owed at their turns:** the Throne's glacier (`stations/glacier/89w-host-water.js`, the Throne's turn is under way), the Catch's lake, the Cut,
k-guilin, xanadu~~ **done (checked 2026-11-08):** the Throne's glacier, the Cut, k-guilin and xanadu (its page and three stations) pass `breakers:false` in their
`89w-host-water.js`; the Catch's lake took it on 2026-11-08 (`stations/lake/45b-host-stage.js`). A river meeting a lake or the sea takes `core/water` ext/61's `tintFlow` (a moving plume). Also new in core: `BIO.bakeImpostors` counts only
visible frames (a page loaded in a hidden pane reported "textures not in after 180 s"); a plume's texture reads are at an explicit LOD (implicit gradients beside
the water's discards drew the sea black over land on ANGLE D3D11, seen only in the browser pane, not in headless verify).

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
  | 4 | swlowlands (**merged 2026-11-02:** stations `gorge`, `delta`), nwlowlands (**merged 2026-11-02**) | their exchanges together; nwlowlands vends to the Cut and Farside |
  | 5 | throne (**merged 2026-11-03:** all fourteen pages, stations 12-14 new; `biomes/throne/PLAN.md`, "Core adoption" and "New stations"), ebadlands (**merged 2026-11-02:** the overview and stations `waste`, `canyons`, `montane`, `tundra`) | the Throne vends to ringisles and the Godthrone; ebadlands borders sedesert and the Bowl |
  | 6 | xanadu (**merged 2026-11-03:** stations `cloud`, `descent`, `ranges`, `gills`, `floor`), oidong (**merged 2026-11-03:** stations `passes`, `hearths`) | their five shared species together |
  | 7 | geyser (**built 2026-11-03 and 2026-11-09 in a cloud session, `claude/rebuild-geyser-cloud`, for the coordinator's GPU verify:** the showcase, station `stills` and stations 2-5 `puna`, `basin`, `corona`, `ice`), nhighlands | geyser before ringisles |
  | 8 | ringisles (**built 2026-11-03 in a cloud session, `claude/rebuild-ringisles-cloud`, for the coordinator's GPU verify:** station 1, station 3 `lagoon` and (2026-11-09, unverified) station 2 `high`; built on geyser's 079716f3), abyssal-savannah | after all their sources |
  | 9 | korona (**merged 2026-11-04:** all six pages on the universal set; `biomes/korona/PLAN.md`, "Core adoption"), nsemiarid (**merged 2026-11-03:** the page, the scablands' coulee and the dam basins' port; station `high` waits for nhighlands' station 2) (the scablands and dam-basin overlays with it) | they border each other and the NW outer wall |
  | 10 | cut (**pushed 2026-11-04, cloud session, for the coordinator's GPU verify and merge:** `claude/rebuild-cut-cloud`, on nhighlands' pair-7 branch; the universal set, exchanges 5 and 6), farside (**turn on `claude/rebuild-farside-cloud`, 2026-11-04, not merged:** station 1 rebuilt for the tsunami and Farport's move; software GL only, the GPU run is the coordinator's) | both read nwlowlands |
  | 11 | nwouterwall, catch | the wall after its neighbours; the Catch after sedesert |
  | 12 | crater-drylands (both lands, N and S: one session, one kit folder), shighlands | after the hyperjungle, swbay and the SW highlands; the split into N and S is in its `PLAN-STATIONS.md` |
  | 13 | ehighlands, k-guilin (and guilin, if the owner wants its cards fixed) | k-guilin reads six kits |

  **nwlowlands' turn, merged 2026-11-02** (`biomes/nwlowlands/PLAN.md`, "Core adoption"): station 2 `margins` is built. `verify.py --assert --all-views` passes on the Arc for both pages (audit .57% and .17%, drawn 7.49M at worst). **Species changed for readers (keys, indices kept, 23 species):** every crown on `crownOn` is held to its limb by `BIO.holdTo`; needle cypress and the spire cedar's mid tier draw a rod to each crown spot; `needle`, `feather`, `ginkgo` and `blossom` are on stems, and `pad` is `free`, `bloom` `onLeaf`. Readers' pages move at their turns (the Cut, Farside, Korona, ringisles). Flagged off for readers (`NWLOW_LOOK`): seasons, back-light, root colour, the culm, the bracket, the lobes' skin. `check_cells --fix` can't see kits that `BIO.def` by forEach: stems were set by hand here, so swlowlands-like kits want checking. **Open:** `bluesycamore` and `pondcypress` grow none until swlowlands' `SWLOW.make` and `grow` merge; whichever kit merges second rebuilds nwlowlands and reads `_kin`.

  **oidong's turn, merged 2026-11-03** (`biomes/oidong/PLAN-STATIONS.md`, `KNOWN_ISSUES.md`): stations `passes` and `hearths` (the Cold Hearths, `biomes/hearths` read in place: KTHERM's bake places the field, `HEARTH.work` folds the fans on the breath, `ATMOS.snowBare` keeps the disc bare) are built beside the valley; every station re-surveyed on map 5.1. `verify.py --assert --all-views` passes on the Arc for all three pages (attach audit 0.77%, 11.5M drawn at worst on the valley, 0 cards on the stations). The universal set is in: `BIO.flareJoin` on limbs, still water without surf or breakers, `WATER.mirrorSwitch` off at load, KGROUND layers on documented masks (moss, forest, marble), KFAR and KHORIZON, `WATER.fieldAt`/`edgeAudit` reading the wet band. **core/shadow:** on the Arc the cost is within frame-to-frame noise (Mirror 68.5 ms on, 80.6 off; cataract 76.6 on, 65.6 off; the Mirror view +11 draw calls); `perf_views` crashes the tab here (the timer-query crash), so these are sync readPixels timings. **Species changed for readers (keys, indices kept):** the five shared with xanadu (cloud pine, cushion tree, haze blossom, lotus trumpet, wisteria) take `BIO.flareJoin` at limb joints in `limb()`; the wisteria's racemes are held by `BIO.holdTo` (card cell kept, the owner's rule); far trees are octahedral impostors; the cedar's and pagoda fir's mid tier draw limb rods. Audit 3.88% -> 0.77%. `cherry` is reachable by `OIDONG.make`/`grow`/`BIO.kitBuilder('oidong','cherry')` for xanadu; `tea` is a floor plant (`teabush`). **Open (the owner's eye):** the passes' and the Hearths' looks; the headwall drawn as ground mesh, not rock; `WATER.wetGround` over KGROUND draws black (R9 off, `?wet=1`); the mirror is one plane; `BIO.fung` and bamboo not moved onto; `ATMOS.shimmer` not taken (a post pass); the Hearths' patterned ground is the passes' KGROUND `polygon` layer, not `KFROST` (section 113's ask); KSTRATA dropped (granite and marble walls, no beds).
  **xanadu's turn, merged 2026-11-03** (`biomes/xanadu/PLAN-STATIONS.md`, `KNOWN_ISSUES.md`): five stations beside the Vale: `cloud` (the cloud slopes, oidong's tea and cherry taken), `descent` (map 5.1's south-eastern outlet: the cataract's step, its amphitheatre, Alph down to the floor), `ranges` (the high ranges, the Alph chasm head, the tarn and glacier), `gills` (Alph's head, the White Gills, on `biomes/gills`' shared life) and `floor` (the owner's ask: the hyperjungle by the easternmost rift lake, the Rift's own flora and tall Xanadu cousins competing). `verify.py --assert --all-views` passes on the Arc for all six pages; attach audit 0.80% Vale, 0.73% cloud, 0.75% descent, 0.01% ranges, 0.53% gills, 0.54% floor. The universal set is in: `BIO.flareJoin`, still water without surf or breakers, the river-mouth plume, `WATER.mirrorSwitch` off at load, KGROUND layers on documented masks (shore, pebble, gravel), KSTRATA ledges and talus feeding placement (87), the wet band and flora on `WATER.fieldAt`/`edgeAudit`, KFAR/KHORIZON, impostors, fog belt. **core/shadow:** +14% to +33% a synced frame on the Arc (render + readPixels; `perf_views` hung on its timer queries); `?shadowmap=2048` the knob. **Species changed for readers (keys, indices kept):** xanadu's copies of the five shared species (cloud pine, cushion tree, haze blossom, lotus trumpet, wisteria) and its own trees take `BIO.flareJoin` at limb joints, a per-tree reseed (each tree's shape re-rolled once), holds onto their limbs and mid-tier rods; the raceme is kept as it was (the owner's rule). The `rod` item carries a cap of 400k with its `capWhy`. **Owed (ratchets):** feet off the drawn ground on every page (`LAND.feetOwed`, `verify_ratchet.json`: Vale 239, cloud 1,060, descent 305, ranges 483, gills 691, floor 158), one cacao in the Vale's lake. **Open (the owner's eye):** every station's look; the floor's near crowns read coarse up close; the Gills' five textures are owed (`PROMPTS-NEEDED.md` 31); the shadows' cost.

  **ringisles' turn, built 2026-11-03 (cloud; not merged: the coordinator GPU-verifies and merges)** (`biomes/ringisles/PLAN-STATIONS.md`, "Core adoption" and
  "Station 3, built"; `KNOWN_ISSUES.md`, "The final rebuild"). **Built on geyser's `079716f3`** (`origin/claude/rebuild-geyser-cloud`, merged here; its WIP commit bf85a338
  first, and the pages rebuilt on 079716f3 are byte for byte the same): if geyser's branch moves again before it merges, rebuild ringisles' two pages after it (`python3 tools/build.py biomes/ringisles` and
  `--station lagoon`, `--station high`). The page reads eight kits in place; what changed is the page's own: `build.py` on the universal set's lists (31b, 31j, 32, 33, 34, 37,
  39, 41, 44 of core/biome; KSTRATA from core/terrain, not sedesert's src/ copy; KGROUND, KHORIZON; core/hazard; KSHADOW; height fog, rain cover, lightning;
  water ext 57, 58, 60; `khost.FULL`; `--station`; LF writes), so the borrowed kits' far trees are their octahedral impostors at last (`check_assembly`'s
  MISSING `BIO.impostor*` and `BIO.leafOn` are gone). KGROUND's sampler under the fourteen ground layers by `THRONE.layGLSL` (the Throne's way for a Lambert
  ground; `?kground=0`); `BIO.flareJoin` on the kit's branch limbs; the dressing's lianas and bromeliads put on the wood (`BIO.tree`'s structure log,
  `BIO.snapSeg`), the scrub thorn's and breadfruit's crowns held to their limbs; card cells by `--fix` (13 to 1, `bananaleaf` by design); the vent film's
  glint on `kEye()`; the reflections switch off at load. **KSHADOW, the rain cover and the ground's horizon are decided by the ground's texture units at load**
  (`89zz`, the Throne's `samplersOf`): the ground reads 16, so on the Arc all three are skipped (as on the Throne's isle; `window._shadow` says so), while
  SwiftShader (32 units) runs them: the cost on the GPU is therefore nil and was not measured. KFAR not taken (sea to 9 km). **Station 3, the lagoon**
  (`--station lagoon`, `dist/ringisles-lagoon.html`): the bank off the lee shore cut at 7.6 x 6.8 km (a rim with its pass, three motu, the fish camp, 140 patch
  reefs, the water on the rim's true bed so the swell breaks on it), its stage a fork of `src/45` and src/'s other fragments reading `STATION` knobs (none on
  station 1: its page moves only by those lines). **Station 2, the high isle** (`--station high`, `dist/ringisles-high.html`; added 2026-11-09 at the owner's ask, **not verified at all**: the owner
  said to hand it over without one; one software-GL load without the bake was clean): a 1 km eroded shield with five amphitheatre valleys, their
  streams, three tall falls (488-524 m) and the plumes at their mouths, the fog belt and the Throne's elfin tree in the cloud on the crest, `rift-volcanic`
  strata on the valley walls (`biomes/ringisles/PLAN-STATIONS.md`, "Station 2, built"). The page's Throne pack now keeps the elfin's bark and moss
  (every ringisles page's `ringisles.tex.throne.js` grows by them). **Attach audit:** 24.0% before; 4.07% on the
  first rebuilt page (software GL), with this kit's own floaters then fixed; the borrowed savanna trees' `leaflet` and `bloom` (the Rift's acacia, swbay's
  thorn and baobab: no structure near them) stay, so `guards.maxShare` is .016 with a KNOWN_ISSUES entry. **Verified, software GL only** (SwiftShader; `verify.py dist/ringisles.html --assert`, about 70 minutes): error panel clean, 777 calls,
  26.7 M triangles at the opening view; every invariant, host check and negative passes (34), the card guard, one LOD key a tree (.73%), the attach audit
  1.44% under its 1.6% cap (`leaflet` 79, `bloom` 41, `glossy` 5, `plume` 2); **fails** `export-profile` ("library textures still decoding after 180 s")
  and then the first screenshot timed out (10 minutes at 1280x800), so the harness's universal asserts (`shader-programs`, `shader-errors`, seats,
  instance cap) were **not reached**: the coordinator's GPU run owes them. **The lagoon** (`--station lagoon --assert`, 800x500, software GL): error
  panel clean, 256 calls, 17.0 M triangles, every check and negative passes, the attach audit .05% (4 of 7,345); `export-profile` failed on the island's
  box (open lagoon on this map): verify.py now takes a box per station (the north-east motu's), and **the re-run passes all of it, the universal
  asserts included** (shader-programs, shader-errors, textures-decoded, winding, instance-cap, the eyes). **Open on the lagoon:** a pale band walls off the
  far lagoon in 'The lagoon from above'; thinning the mist did not remove it; not traced (`KNOWN_ISSUES.md`: check with `?hfog=0` on the GPU). **For readers (the Throne, the hyperjungle, the open world), keys and indices kept:** ringisles'
  own trees' limbs flare where 31j is on the page; the scrub thorn's and breadfruit's crowns sit on their limbs (no draw moves); `RINGISLES.make/grow`
  serve `strandpandan` (3, owed to the Throne) and `breadfruit` (5, owed to the hyperjungle) on fragments 50, 52, 55, 70. **Found, not this turn's:**
  `core/terrain/test-lava.js` and `test-scarp.js` fail their goldens on this Linux container on the untouched branch tip; the Throne's blast, delta and penitentes stations stale on the branch tip.

  **geyser's turn, built 2026-11-03 (cloud; not merged: the coordinator GPU-verifies and merges)** (`biomes/geyser/PLAN-STATIONS.md`, "Core adoption" and
  "Station 6 of the Hearths: the Stills"; `KNOWN_ISSUES.md`, "The final rebuild"). **The page rebuilt from the merged sources died at render** (`W.wetChunk`: its
  `build.py` lacked `core/water/21-core-water-shore.js`): fixed. In: `build.py` on core lists with `--station`; `BIO.flareJoin` on the pandan's forks, the
  kanuka's limbs and the snags' stubs (guarded: a reader without 31j draws as before); the hyperjungle's far trees as octahedral impostors (34 on the page);
  KGROUND (the nine library surfaces, same weights and tints; the mats stay the kit's); KSTRATA's lamina column on the Stair's curtains (the row's "strata
  in the sinter terraces": travertine's daily couplets and wet-season bands); KFAR to 14 km and KHORIZON; KSHADOW (`?shadow=0`; **cost not measured**: no
  GPU); the creek's and the Stair's plume on the sea (ext/61); KHAZ hot-ground crusts round the springs, the fumaroles' gas, the mud pots; card cells by
  `--fix` (3 to 0). Dropped, with reasons in the plan: the mirror switch (the springs' discs have no anchor it can patch), KGROUND `polygon`, brine looks,
  karst vents. **Station `stills`** (`--station stills`, `dist/geyser-stills.html`; `biomes/hearths/PLAN.md` 7b, 11 item 6): `biomes/hearths/src` gains the
  Stills (`50`: `still`, `stillglass`, `sailcup`, `spraymat`, `HEARTH.stillParts`; new `57-biome-hearths-stills.js`: `HEARTH.stills`, `sailTurn`,
  `sailFold`), read in place with `core/biome/35b-core-anim-turn.js`: still trees ringing every boiling spring and geyser, their sails across the wind,
  turned toward edge-on to the sun by day, each geyser's ring folding on its warning and column. **Stations 2-5, built 2026-11-09** (the owner: "do 2-5";
  `biomes/geyser/PLAN-STATIONS.md`, "Stations 2-5 as built"): `puna` (the high desert, 5.1 px 1574,1642, 3.9 km), `basin` (the mountain forest,
  1454,1684, 3.2 km, lodgepole pine and bobby-sock stands), `corona` (a Korona trench floor at 2.03 atm, the field along a ring fault, a quilt of
  chemistries, taboo ground and gas), `ice` (a flank vent at 7.4 km melted into the ice: ice towers and caves on core/terrain's KGLACIER drawer), on
  one shared base (`stations/field/`, a site record per station); sites re-surveyed on map 5.1 (the plan's 4.23 sites went to the Hearths' hosts and
  the Loom-Chasm kit). Their cold plants are in a registry of their own (`geyserfield`), so the kit's species, keys and indices are unchanged for
  readers. **Core fixed on the way:** `WATER.plumeGLSL` (core/water/geyser `52b`) wrote `p.y--0.16` for a plume based under 0 (no compile): the
  readers of 52b (ringisles, the Throne's three, xanadu's two, the isle demo) move by that text at their turns. puna and basin open at 13:00: the
  owner's 11:00 is in the giant's eclipse at their longitudes (a decision for the owner). **Verified in software GL (SwiftShader), 2026-11-09:** `verify.py --assert`
  passes on all four (`geyser-puna` 0.46M triangles, `geyser-basin` 6.2M with ~19,000 lodgepoles, `geyser-corona` 5.5M, `geyser-ice` 0.44M; each run
  alone: two at once starved basin's texture decode past the harness's 120 s). The showcase and the Stills were not re-verified after this round's
  shared edits (guarded hooks in 84 and 99, the 52b text, the merged core): their pages moved by text. **No GPU run from this session (the owner,
  2026-11-09: the integration session takes it).** `test_all --no-build`: 140 steps, the failures none of this work's (the six LFS-pointer steps,
  `test-lava` and `test-scarp` golden files, `test_gpu_lanes`); `tools/check_views.py` learnt `"baseOnly": true` for a station folder that is a shared
  base (`stations/field/`), and `build.py` refuses to build one alone. **Verified in software GL only (SwiftShader, this container; no GPU):** `verify.py --assert` passes on `dist/geyser.html` (27.5 min; 110 draw calls, 4.95M triangles at the default camera; attach audit 0.98% of its 1% limit; export profile 9 of 9) and on `dist/geyser-stills.html` (124 draw calls, 5.58M triangles; 236 still trees, 1,178 sails, every Stills check and negative); `--all-views` was not run (a view shot takes ~7 min here). **Owed to the coordinator's GPU run:** `--assert --all-views` on both pages, KSHADOW's cost (`?shadow=0` against the default), and the look (`biomes/geyser/PLAN-STATIONS.md` lists the decisions for the owner). Also rebuilt: `oidong-hearths` (it reads `biomes/hearths/src/50`; its parts are unchanged, only text moved). `test_all --no-build`: 13 of 138 fail, none on this work once fixed: the six LFS-pointer steps, nwlowlands' two card cells, `test-lava` and `test-scarp` (golden files), and the Throne's three stale stations. **For readers (ringisles, the isle demo, the
  hyperjungle's lake station), keys and indices kept:** `55`'s limbs flare only where `31j` is on the page; `46` gains `GEYSER.hazard.crust`, `fumarole`,
  `mud` and `65` registers them (with a sulphur bead at each fumarole's mouth, hashed: no draw moves); `materials.json`'s `rosette` cell (the whole
  screwpine crown, not a quarter), `strap` (plain cell, base bottom) and `small` (stems) move the readers' packs. No reader page is rebuilt here.
  **abyssal-savannah's turn, pushed 2026-11-03, not merged** (pair 8, a cloud session: no GPU; `claude/rebuild-abyssal-cloud` from ffe594f9a; `biomes/abyssal-savannah/PLAN.md` section 11 "Core adoption", `KNOWN_ISSUES.md`): station 1 only (stations 2 and 3 are still planned). **Map 5.1:** the climb moved ~5 px east, so the site is px 1026,350 (old canvas, as the sky's frame: -638 m, Aw); the map's heights are unchanged, the far field runs west on 5.1's grade (`KFAR` to 36 km, the lake ~31 km west). The universal set is in: `BIO.flareJoin` on the heroes' boughs and roots, the crowns held (a 6-triangle `twig` rod from a plate's hub or a bough end to each hero clump, mid clumps `BIO.holdTo` at a stem card's reach, a bough into every plate), octahedral impostors for the far umbrella and tongue trees, KGROUND (four new library layers on documented masks: `ground.soil`, `ground.burn`, `ground.salt`, `ground.gravel`), `KSTRATA`'s canyon beds coloured on the caprock's faces on the CPU (no texture unit), KFAR and KHORIZON, `KSHADOW`, height fog, rain cover, the atmosphere's wind, breakup on the stream, `WATER.mirrorSwitch` on the pan (off at load), the water's fields (the wet band, `FIELD.wet`/`flow`, trees off the water by its own shore, `WATER.edgeAudit` in the host checks); `88-host-build.js` is `89z-host-build.js`, the ground is `80-host-ground.js`; the still water is `drawStill` (no shore grid, so no surf or breakers); `check_cells --fix` (leaflet and saltbush stems, the plate's one cell, the cycad frond's cell and `base: bottom`); `PORT.md` audited. Not taken: `KFIRE` (it would re-roll the whole burn mosaic: S6), mounds and seasons (station 2), the plume (no river meets a lake here).
  **Software GL, `verify.py --assert` (one view, 26 min a run; no `--all-views`):** passes, exit 0. Attach audit **28.39% -> 0.00%** (leaflet 991 of 1,447 floating before); edge audit clean; shader programs, page errors, textures, instance cap pass. **Triangles:** scene 8.65M -> 9.67M at the opening view (`OVER` the kit's 9M showcase budget: a warning), the tree pass 4.21M -> 5.22M of its 6M (the twigs and joints), 51 -> 52 calls. **Owed to the coordinator:** `KRATOR_GL=gpu verify.py --assert --all-views`, KSHADOW's cost (`?shadow=0` against the default), and whether the 9M budget is raised or the twigs thinned. **For readers (eastabyss's S5, the open world):** `ABSAV.SPECIES` keys and indices unchanged; one new item `twig`, defined last (every other item keeps its index); `ABSAV.grow(T, 0)` still draws the blobs for a caller (only the kit's own pass defers its far trees to the impostors); new flags `ABSAV.JOINTS`, `ABSAV.HOLD`, `ABSAV.IMPOSTORS`, `ABSAV.SHORE`. Three trees fewer (one tongue tree, one umbrella, one of eastabyss's at the stream's edge); nothing else placed moves. eastabyss's species come in as its pair 1 and foliage-attach turns left them. **For the owner's eye:** 5.1 is wetter than the plan (~1,240 mm at the foot, ~1,100 on the bench; the foot Aw, not Am); the plate shows one acacia sprig (a `card.umbrella.plate` prompt is in `PROMPTS-NEEDED.md` section 24); the ground's four layers, the caprock's beds and the far country have not been looked at on a GPU. **`test_all --no-build`:** 9 of 138 fail (`check_assembly` passes with this page's `BIO.leafOn`/`leafQ` keys added by hand, as eastabyss's): the six LFS-pointer tests, plus `core/terrain/test-lava.js` and `test-scarp.js` (their goldens, not this turn: no core file changed) and `check_stale`'s three Throne stations (`blast`, `delta`, `penitentes`: the Throne's `build.py` and `KNOWN_ISSUES.md` changed after their pages), all from the base branch.
  **nwbay's catch-up pass (2026-11-03, cloud, no GPU; branch `claude/nwbay-catchup-cloud`, not merged)** (`biomes/nwbay/PLAN.md`, "The catch-up pass"; `KNOWN_ISSUES.md`). **The caverns station** (`python3 build.py --station caverns` -> `dist/nwbay-caverns.html`; a station, not the main page, to keep its budget and its ground: the dolines move the plants over the cave): `KKARST` on `KARST-SITES-5.1.md` site 1's drowned bay call (level -25, table +1), 1,060 passages (1,052 sumps), 22 chambers, draining to a shore resurgence at stack 6's foot (`WATER.karstSpring`). The plain-to-lake-shore branchwork is k-guilin's: nwbay has no lake, so its branchwork drains to the bay's shore (for the owner). The tiankeng keeps its hole; its alcove facing the spring is the mouth of a passage spiralling down to an old river chamber under its floor, then a sump to the network. Each cenote gets a flooded chamber under its bed. 50 dolines on KRELIEF over dry land. Drawn through `KCAVERN` (1 m, lazy past the 460 showcase chunks) and `KSPELEO.LIMESTONE` (220 pieces). **Every drown record (1,074) carries `tags.road {for: ['water-breathers'], people: 'Hykkousoi'}` and `spares` on its hazard**, but `KHAZ.make` drops unknown fields: a core `spares`/`breathers` field is owed, and a limestone material in KCAVERN (it has basalt and tuff only; the station draws the library's karst limestone itself). **The rock (map 5.1):** `src/44n-host-geology.js` read from `geology.json` at an anchor of 5.1 px (757, 749), where the page's layout matches the data (KARST-SITES' (700, 800) reads no marble, tuff or node); `tests/test-geology.js` recomputes it. A white marble band (KGROUND `groundMarble`) at the page's volcanic contact and outcrops at the field's two marble nodes; ash soils (`groundAsh`) on the old flows only (the tuff reaches no limestone at the anchor); the 5 nodes in the box as tags records. Both textures are stand-ins: `PROMPTS-NEEDED.md` section 36. Map 5.1's stations list flags nothing for nwbay (the region's river is r243, the Stahr Rhyver). **The universal set:** `BIO.flareJoin` on limbs of .25 m and up, `BIO.holdTo` on blooms and the umbrella thorn's and prism gum's crown clumps, `bloom` `onLeaf`, all behind `NWBAY_LOOK` so **k-guilin does not move** (keys and indices kept; its page's text moves by source bytes at its turn; a scratch build passes); `WATER.mirrorSwitch` on the bay, off at load; the plume (`tintFlow`); breakers kept on the bay (a sea) with `?breakers=0` for the eye; `KSHADOW` attached and switched off at load (`H.off()`, no core change; `?shadow=1` or the panel). KWARP not taken (no Bend). **Fixed on the way:** the sinkholes' lip took KHOOK's composite hook (the page's standing `shader-programs` failure and a dead frame wherever a lip showed); nwbay's `verify.py` never ran `hostChecks`, so the core guards had never run on it; three card slots the current pack exposed (sword and strap `base: 'centre'`, no turn; bloom takes check_cells' cell as nwlowlands and xanadu did). **Verified (SwiftShader, `verify.py --assert`, no views):** main page passes, 15 min: attach audit 0.93% (was 8.56% with only the joints; leaflet 656 and bloom 224 floaters gone), shader-programs pass, 271 of 300 calls, **showcase 10.23 M of 10 M (OVER, a warning: the joints, ~0.5 M; `?joints=0` 9.73 M)**. The caverns station passes, 13.5 min: its seven checks (one system; a cave under the tiankeng and each cenote; 1,074 of 1,074 drown records roads, with a negative; dolines on dry land; the cave drawn: 186 chunks, 105 k triangles), attach audit .97%, shader-programs pass, the same showcase OVER. (Both runs were before a last edit that only rewrote three `x || n` defaults as `x == null ? n : x` for check_source.) `check_core_use` no new findings; `test_all --no-build`: 138 steps, 11 failed before the lint fixes, none of them nwbay's after: check_source's three ORNUM and check_assembly's `BIO.leafOn`/`leafQ` on nwbay's two pages (core/biome's opt-in leaf path nwbay never calls, baselined as swlowlands' and nwlowlands' were; nwbay's committed page was an LFS pointer before, so the check had never read it) are fixed or baselined. Left, not this pass's: the five `test-isle-*` and interiors' `test-walk` (LFS pointers, known), `core/terrain/test-lava.js` and `test-scarp.js` (golden-scarp.json), and the throne's three stale stations (`blast`, `delta`, `penitentes`). **Owed to the coordinator:** GPU `--assert --all-views` on both pages and the looks (`KNOWN_ISSUES.md`, the catch-up item).
  **nsemiarid's turn, merged 2026-11-03** (pair 9; `biomes/nsemiarid/PLAN.md` section 11, `KNOWN_ISSUES.md`; `biomes/scablands/PLAN.md` section 6): no new station (station 2, `high`, waits for nhighlands' station 2, as its plan says; map 5.1 asks nothing of this kit). `verify.py --assert --all-views` passes on the GPU for all three pages: nsemiarid (Arc; attach audit 0.00%, was 81.1%; 16.3 M triangles at worst), the scablands' coulee (Arc; 0.00%, was 66.5%), the dam basins' port (RTX lane). The universal set is in on the kit's two pages: `BIO.INDEX_ITEMS` and the LOD switches (`46-host-graphics.js`, its own fragment so the overlay's stage takes it; the floor sets no `BIO.range`, so the LOD options change nothing yet), the variants' far level on impostors (gain 2.4; ebadlands' stilt-pod expansion of welded items), KGROUND (the eight library layers on documented masks, kinds `clast` for the desert's pavement and `polygon` for the dry bed's mud cracks; the ground is Standard because KGROUND's distance scale reads `cameraPosition`, which r128 never uploads to Lambert), KFAR to 14 km and KHORIZON, height fog, the rain cover, the air's load with a dust-storm select, breakup, `WATER.mirrorSwitch` off at load (the salt lake; the coulee's plunge lake), the water as fields with the edge audit, `BIO.flareJoin` on the broadleaves' limbs, and KGROUND's relief (`relief: {bump: .075, cavity: .8, mesh: 1}`, `cavityMesh`; the scablands share the kit's KGROUND ground, so both pages take it; both re-verified with it on the GPU, `?kgrelief=0` without). **KSHADOW** is attached on `?shadow=1` only: the off-by-default switch was on the Throne's branch, not here, when this turn was built. **Fixed on the way, a regression on three pages:** core/atmos's weather writes `ATMOS.windScale` every tick, so a page's own wind setting (n semiarid's calm/breeze/high, the dam basins' stiff wind) never took, and their dust and gale checks failed on the committed pages; the setting is now a factor on the weather's wind (`NSWIND.k`/`jump`, `DB_WIND.k`/`apply`, re-applied after the weather's hook on the dam basins). Any other page that sets `ATMOS.windScale` itself and also binds the weather has the same bug. **Species changed (keys and indices kept; read only by this kit and its overlays):** the solid bodies (strider barrels, bead chains, sail columns, maces, horn pipes) are `BIO.barkMat`, not a still leaf material (`?bodies=leaf`); the glider seeds are `free`; the kiting sail blades are a new item `kite` (`free`, defined last); the drift's back-row tumblers stand at most half a metre up. **Not taken:** KSTRATA (the texture units; the coulee has `KSCOUR.strata`), wadis, `WATER.pan`, the brine look (the salt lake keeps its teal: the owner's call), seasons and KFIRE (station 2's), R9, snow, `BIO.fung`. **Geology 5.1 checked:** basalt 58% and evaporite 27% round the region, the site on basalt and the bed on evaporite, as the plan draws; karst site 10 not taken (low gain, no station on a notch). **The dam basins** take no universal set (the Ancient Port kit's page; its flora is D2): their wind fix and verify only. **Open (the owner's eye):** the ground on KGROUND, the far trees, the far field's pale horizon band from afar, the bodies drawn as wood. **The attach audit cannot see the variants' trees** (as on ebadlands).
  **korona's turn, merged 2026-11-04** (pair 9; `biomes/korona/PLAN.md`, "Core adoption"; `KNOWN_ISSUES.md`): all six pages (the tepui, the hollow, the basin, the trenches, the gorge, the hoar table) rebuilt on the universal set, every change in `src/`: `BIO.flareJoin` on the coin tree's limbs; octahedral impostors for the far lace fans (`?diet=0`); the 15 sheets the kit cuts by UV marked `"sheet": "geometry"` (`check_cells` 0, its baseline rows gone); height fog with a mist over the lowest water, the rain cover, the wind on the foliage, A2C; **the fog belt on the tepuis** (`ATMOS.fogBelt` on the highest body's windward walls; the hoar's on its lower wall only, none in the dry gorge; `?belt=0`); `WATER.mirrorSwitch` **off at load** on the basin's lake and the trenches' salt lake (each its own mesh now); **`KSHADOW` off by default, `?shadow=1`** (the owner, 2026-11-03); KGROUND for the floor's upper layers (`?kground=0`), KFAR to 9 km capped under the square's rim, KHORIZON; **KSTRATA's `tepui` beds on every wall** (`?strata=0`), `KSTACKS.contour` on stacks and spires, light `KSTACKS.weather` (the tables keep their faces: their plants are placed from the records); the water's ext 56/57/58/60 and the field contract. `88-host-build.js` is `89z-host-build.js`. The 5.1 rebake agrees (73% quartzite). `KHOOK.warp` not taken (no anomaly here). **Species for readers:** none read Korona's (`reach.py`); `KORONA.SPECIES` and `KORONA.PLANTS` keys and indices unchanged; new `KORONA.plant(key, x, y, z, o)` vends `frosttank`, `butterwort`, `cobralily`, `greatsundew` one at a time (the EXCHANGES rows; nothing here calls it). **Fixed on the way:** necanyons' seep curtains and ferns hung at a bed's outline, 6-30 m past the lip KSTACKS draws on a tepui's caps (`89z` seats them, `?seat=0`; the fix in necanyons' `57` is owed to its turn: 38 pages read it); Korona's staghorns seated on the drawn wall by ray (the gorge's 44 of 123 floated); the trenches lacked `31b`/`33` for nhighlands' species since the core pass (`G.disc` threw); KGROUND's distance on a Lambert ground read an eye of 0 (redirected to `kEye` here; **a core finding:** `core/terrain/43-core-ground.js` should use `kEye`, necanyons' floor has the same read). **Left out of the attach audit, owed to the vendors' turns:** ehighlands' `bloom` (hoar), sedesert's `bloom` (gorge, trenches), nhighlands' `needle` and `beard` (trenches), each failing on its own page (`window._auditOwed`, `?owed=0`). **Owed:** karst site 7 (waits on the trenches' 5.1 re-survey), the hoar table's `polygon` ground (wants KGROUND on the top's material), the receiver rows (bristlecone, caribou moss, ghost gum, sea buckthorn), wet ground (R9). **For the owner's eye:** the two banding systems on the walls, the fog belt's height, the far field, KGROUND's floor, the shadows. `verify.py --assert --all-views` passes on all six (RTX 5060, D3D11; round 7, 2026-11-04): attach audit 0.52% tepui, 0.20% hollow, 0.39% basin, 0.29% trenches, 0.84% gorge, 0.00% hoar; drawn 3.3-10.2M at worst (the hoar 10.2M).

  **nhighlands' turn (pair 7, 2026-11-03, a cloud session with no GPU; branch `claude/rebuild-nhighlands-cloud`, not merged)** (`biomes/nhighlands/PLAN-STATIONS.md`, "Core adoption (pair 7)" and "Station 5, as built"; `KNOWN_ISSUES.md`'s first item): `build.py` on the shared lists with `--station`; station 5 `bogs` is built (the Footfall plateau's raised bogs, string fen, ~390 pools as one `WATER.drawPools` mesh, a peat stream, the mire's `sink`/`drown` hazards; cotton-grass, cloudberry and the owed `card.cornlily` wired; `ground.sphagnum`, `ground.peat.black`); stations 2-4 are not (station 2 falls to the queue after the pairs, as this file allows). The universal set: `BIO.flareJoin` in `limb()`; `KSHADOW` on (the ground reads 11 texture units; **cost not measured: no GPU**); `WATER.mirrorSwitch` on the tarn, off at load; the trees on `WATER.fields`' shore (`NHL.SHORE`) and the edge audit; `check_cells --fix` (14 faults the old `pack.json` hid, seen once `pack.py` wrote the plant counts); the crater wall's **megabreccia** where the geology bake puts the `impact` province (KSTRATA on the crag pillars, a crag-scale copy of swhighlands' recipe; KGROUND `clast` on the steep; `?strata=0` the old granite). **Verified in software GL only** (`verify.py --assert`, two or three views; not `--all-views`): station 1 passes every check, attach audit 3.89% -> 0.58%, 30.85 M of the 32 M triangle budget (+.45 M of rods), the water's fields bake 8.6 s of load under SwiftShader; station 5 passes every check (its own: the mire open, 387 pools under their lips, 319 hazard records, the mire's plants drawn), attach audit 0.09%, 8.87 M triangles, 109-142 draw calls. **The coordinator should:** run `--assert --all-views` on both pages on the GPU, time `?shadow=0` against the default, and judge the megabreccia and the bogs. **Species changed for readers** (Roketstad, nwlowlands; keys and indices kept, `NHL.SPECIES` unchanged): limbs flared at their joints where a page lists `31j` (guarded); the conifers' arms draw their rod further (to 80% past 4 m) and from 1.4 m; beard lichen hangs from the rod's end; the candelabra's and curtains' sprays sit on their rods; the birch draws rods at mid range; the willow's, gnarled oak's, laurel's and serpentwood's mid-range leaves sit on the rod drawn; the great trumpet's bulbs hang from the funnel's underside; `needle` and `frond` declare caps. **No reader's placement moves:** every change keeps the draws, and `NHL.SHORE`, `NHL.STATION_PASSES` and `NHL.STATION_PLANT` are hooks only a page sets. The new flora stays gated off for Roketstad. Readers' pages (Roketstad, highlands, nwlowlands and its margins) build with syntax OK on these sources and move at their own turns.
  **riftrim, a new kit (the cloud session, 2026-11-03; branch `claude/riftrim-cloud` from ffe594f9a, not merged)** (`biomes/riftrim/PLAN.md`, "On scale model 5.1", the answers taken to section 12, and "Core adoption"; `KNOWN_ISSUES.md`): the rift rim's three biomes on one kit (`RRIM.biome('n' | 's' | 'w')`: the glass rim, the black rim, the veiled rim) and its six stations, every site re-placed on map 5.1 (the fifteen lakes at the shifted px and the same levels; Dalab's road re-run on the model: 528 km, the crest 9,645 m at 483,1236, the tunnel's south portal at 477,1245). Forked from ebadlands' host; the land a library of lakes (`44v rimLand`); 5 tree species and 18 floor plants of its own, written as kin of the Rift's (`lineage`; `RRIM.make`/`grow` exported for the Rift's station 3); the Rift's, the SW lowlands' and the S highlands' species read in place (`BIO.kin`, `87-host-kin.js`, the packs trimmed to the families the rows draw with: pages 7.4-9.1 MB). Pages: `dist/riftrim.html` (Ledge and the great lake), `-lakes`, `-ice`, `-gorge`, `-pass`, `-barrens`. The universal set is taken (KSHADOW attached and **off at load**: core's own switch not merged, so the handle's `off()`/`on()` and a panel select; `WATER.mirrorSwitch` off at load; `BIO.flareJoin`; KSTRATA's `rift` recipe; KGROUND, KHORIZON, KFAR; the cards at 0 faults; tall falls; no breakers on the stills). **Owed:** KCARVE mouths, `KSTACKS.contour` and KKARST on Ledge's cliff (karst site 6), the crossing's carved portal, the Hearths' three stations here, the tier cedar (its builder's pads float: the attach audit), three catalog fruit pieces, a `kits/crops` entry, the Godot twin. Checked in the cloud with no GPU: `check_core_use` 0 findings, `check_cells` 0 faults, the source lint, `check_stale` and `check_assembly` clean for it, `test_all --no-build` (its other failures are not this kit's), and `verify.py --assert` in SwiftShader on all six committed pages: every check passes (`KNOWN_ISSUES.md`, "Verified"). Three borrowed rows wait on their vendors' builders (the tier cedar, the monkey-puzzle, the beard tree: their crowns or flowers float). **For the coordinator:** the GPU `--assert --all-views` on the six pages, `IMP_GAIN` against the near crowns, and the owner's look pass (the look items in `KNOWN_ISSUES.md`). Not in the gallery yet (a new biome goes there when it reaches `main`).

  **farside's turn (pair 10), on `claude/rebuild-farside-cloud` (from ffe594f9a), not merged** (`biomes/farside/PLAN.md`, "Core adoption" and section 6; `KNOWN_ISSUES.md`, "The final rebuild"). A cloud session: **no GPU run.** **The tsunami and Farport (the owner, 2026-11-01):** station 1 (`dist/farside.html`) is re-drawn on map 5.1's `DATA.tsunami_farside`: Farport's old city on the near-shore plateau (5.1 px 294,588, 212 m; its site held clear and registered as a `landmark`, not drawn: a settlement build), the harbour below in Līng-Mā's drowned estuary (a still arm at 0 m with quays on both banks, two jetties, the dockyard's slip and the factory quarter's site), and between them the wave's ground: the scour bench (planed, salt-bleached bedrock to ~55 m), chevron ridges pointing inland with backwash chutes, a perched saline lagoon at 9 m, the bluff. The reach is shown three ways: the run-up line (100 m, red) and the bench's top (65 m, amber) as ribbons on the ground (panel layer "the tsunami's reach", `?tsunami=0`), five tsunami stones on the run-up line (works: Eternian furniture), and a trimline (kelp under 100 m at ~60% height). Two checks and three negatives: the city over the ceiling, the quays at the water, the stones on the line, no stand on the city's site, the harbour without breakers. The strand is re-sited (its 4.23 pixel reads 1,725 m on 5.1; now 5.1 px 293,573, 16 m); the front's pixel is 2,179 m (above its band: left, noted). **The universal set:** `BIO.flareJoin` on the snags' limbs (no draws moved); impostors for the native forest's far trees (gain 1.6); KGROUND for the seven ground layers with the `sand` kind on the sand (`?kground=0`); KFAR and KHORIZON (`?far=0`, `?hz=0`); **KSHADOW off at load**: core/shadow has no switch yet, so the page holds one (the panel's `shadows` button, `?shadow=1`); `WATER.mirrorSwitch` on the lagoon, off at load; the plume out of the harbour mouth (`?plume=0`); the sea keeps its surf and breakers, the harbour and the lagoon have none (the sea's shore grid stops at the mouth: `STAGE.sea.land`); height fog with a dawn sea mist, the fog belt over Yith's ridge (`?belt=0`), the rain cover, the flora in the wind and A2C (`89t-host-air.js`, every station). **nwlowlands read in place** as merged: its species changed for readers (holds, rods, stems, `pad` free, `bloom` onLeaf) reach the front and the fog belt with this rebuild; its look flags stay off. Card cells were already 0 faults; `ROCK-PROPOSAL.md` has no Farside row. **Species:** keys and indices kept; the land kelp's height takes the host's `trim` field (0 on every station but 1, so no other page's stands change); the snags' limbs are flared. **Checks run:** `check_core_use` (none new), `check_port` (clean; `70`'s `||` default fixed), `check_assembly` (the eight `BIO.leafOn`/`leafQ` keys baselined: nwlowlands' opt-in path, as swlowlands' and abyssal-savannah's), `test_all --no-build` (138 steps, 10 failed, none on this branch's files: `check_stale`'s three Throne stations, `core/terrain` `test-lava.js` and `test-scarp.js` goldens, the five `test-isle-*` and interiors' `test-walk` on LFS pointers; `core/` and `biomes/throne` are untouched here). **Software GL (SwiftShader), `verify.py --assert`, all four pages pass** (error panel clean, every host check and negative, every universal assert): station 1 with two views (attach audit 0.00%, the tsunami and harbour checks and their three negatives; **triangle budget OVER**, a warning: 21.4M scene against 16M, `farside/floor` 14.8M against 9M, drawn 10.8-11.9M at 86-93 calls: the bench's bare rock brings the strand's floor onto it, `KNOWN_ISSUES.md`), the strand (audit 0.00%), the front (0.59%: the wine weed and drapes on nwlowlands' trees), the fog belt (0.69%; the belt on). About 15-25 min a page; `--all-views` not run in software GL. **Owed: the GPU `verify.py --assert --all-views` on all four pages**, the shadows' cost (and a look with them on), the floor budget on station 1. **The owner's eye:** the compressed tsunami coast, the ribbons on by default, the city's empty site (a stand-in skyline or not), the seam where the harbour meets the sea, the strand left without the bench's ground. **Texture owed:** the scour bench's bedrock (`ground.bench`, `PROMPTS-NEEDED.md` section 14).
  **The Cut's turn (pair 10, 2026-11-04, a cloud session with no GPU; branch `claude/rebuild-cut-cloud`, not merged)** (`biomes/cut/PLAN.md`, "Core adoption (pair 10)"; `KNOWN_ISSUES.md`'s first section). **Built on `claude/rebuild-nhighlands-cloud`** (merged in as a fast-forward of cc7042b1): merge nhighlands first; if it changes before it merges, the Cut's wall and face (which read it) are rebuilt after. The universal set: the read-in kits' rebuilt species come in with `31b`, **`31j` (`BIO.flareJoin`)**, `33`, `34` (impostors), `41`, `44`; the hyperbamboo's culms on **`BIO.bamboo`** (vertex for vertex, `test-bamboo.js`); **KGROUND** layers (`?kground=0`), the far bowl on **KFAR** (`?kfar=0`), **KHORIZON** over the page and the whole bowl (`?horizon=0`), **KSTRATA** on the face: the bake puts the west lip in the `impact` province, so the polished section is the crater wall's megabreccia sawn flat (`rock.megabreccia` its grain; `?strata=0` the level beds); **KSHADOW attached off** (core has no off-at-load switch yet: `?shadow=1`; cost not timed); **KWARP attached off** (`?bend=1`: a faint travelling ripple along the field's axis, .45 m x s); the lake with **no surf or breakers**, **`WATER.mirrorSwitch`** off at load (lake, cistern, tarn), the creek's water (it had a bed and no water) and its **plume** into the lake (`?plume=0`), `WATER.fields`/`edgeAudit` as a host check; height fog (the dawn mist on the lake, a cloud band on the walls), rain cover, lightning, wet hollows. `check_cells`: 0 faults. **Exchanges:** 6 built (the great trumpet in the wall's ravine, nhighlands read in place on the wall for it alone: 8 kept, all in the ravine; no organ-pipe ranks, s is .2 there); 5 built thinly (the rowans past the face's lip stand at 66 km, in the plan's 64-72 km ring, and take the bowl's stuck fruit; inside the lip is all bare face, so none grow there, and they are few at 4.9 km); 1 and 2 wait for the crater drylands (pair 12). **Map 5.1:** the north sill 666 m, the face's lip 164 m lower (`41`'s lip table). **Fixed:** the sprays' LOD key (43% switched apart from their culms: the handoff's "LOD key 57.4%"), now 0.00%. **Verified in software GL only** (`verify.py --assert`, two or three views a page): station 1 passes every check (attach audit 0.56%, LOD key 0.00%, 9.14 M of 10.5 M triangles, 2,205 read-in trees none in the water, the horizon bake 2.1 s); the wall passes (attach .47%, LOD key .02%, 3.42 M, the great trumpets' check); the face passes (attach 0.00%, LOD key .04%, 5.15 M, the lichen never touching, exchange 5's check; the face's ground is kept out of KHORIZON: under it the crest past the lip went near black in software GL while the bake reads open sky there, open for the GPU run, `?horizon=all` to see it). `test_all --no-build`: 138 steps, the Cut's all pass; failing and not this turn's: `test-lava.js` and `test-scarp.js` (their goldens; `core/terrain` is untouched here), the isle demo's five tests (its `dist/` is not built in this checkout), the interiors test-walk (known), and `check_stale`'s three Throne stations (blast, delta, penitentes: stale on the base branch). **Readers:** nhighlands reads the Cut's `41`, `50`, `55` (all three changed: 5.1's lip, the culm on `BIO.bamboo` or `G.culm`, the spray tiers); nhighlands draws no groves, so its page moved by source only, and is rebuilt here (`nhighlands.html`; the bogs page does not read the Cut). **The coordinator should:** run `--assert --all-views` on the three pages on the GPU, time `?shadow=1`, and put the look list in `KNOWN_ISSUES.md` before the owner (the face's megabreccia, the mist and cloud band, the creek and plume, KFAR, the bend). **Texture owed:** `rock.megabreccia.polished` (`PROMPTS-NEEDED.md` 33).

  **The cloud kits' merge (2026-11-04; the coordinator's local GPU run, `claude/awesome-chaplygin-8e2c09`).** **Merged here, every page passing
  `verify.py --assert --all-views` on the GPU (arc and rtx lanes, `auto`):** `core-landforms` (no page moves), geyser (2 pages), nhighlands (2), ringisles
  (2), abyssal-savannah (1), High Rift (5), the Cut (3), farside (4). The paragraphs above that say "not merged" for these are now merged. The kit folders
  are the GPU-verified ones: rebuilt locally over every LFS texture (the cloud had built over pointers for the kits read in place), with fixes the GPU
  found: **geyser** decides KSHADOW last (`89zz-host-shadow.js`; the sea's weather took the ground to 16 units, so the shadow is skipped there);
  **High Rift** counts its ground's units (`samplersOf`): the Mirror keeps neither the rain cover nor the ground's horizon, the Caldron and the Coulee
  the rain cover only; **farside**'s cloud-forest works views stand over the canopy (the eye check); `tools/check_views.py` reads `function STATION_VIEWS(`
  and `STATION.views =`. Wired from the 2026-11-03 delivery: `rock.hematite.mirror` (High Rift); nwbay's two wait with nwbay. **KGROUND's relief** is on
  nhighlands (its ground now MeshStandard) and High Rift; geyser and ringisles stay Lambert at the Arc's 16 units; the Cut, farside and
  abyssal-savannah take it at their turns. The pages were built on the tip before Ancient's Valley, the metropolis, the Cave of Crystals and korona
  merged: `check_stale` may list them behind those sources by text (owner: no rebuild now). **Left on their branches (GPU failures, not merged):**
  `riftrim` (five stations fail `shader-programs`: the ground past 16 units in some view's mode; Ledge passes), the ground
  catch-ups `east` (hyperjungle-savanna `instance-cap`, swhighlands `shader-programs`) and `pair56` (xanadu-gills `shader-errors`); their fixes and
  relief wiring are on the coordinator's branch, unverified there. **Skipped, still WIP:** `rebuild-godthrone-cloud` (a WIP turn after the station-list
  plan), `ground-catchup-west-cloud` (WIP commit, no handoff).
  **Second round (2026-11-04, evening): nwbay's catch-up merged**, both pages passing on the GPU (the ash soil and white marble wired; its verify
  no longer takes core/shadow's panel switch for a view). Still out: riftrim's five stations, swhighlands and xanadu-gills (each compiles at load and
  overflows or errors only in a later view's mode: a texture-unit pass, not a small fix), hyperjungle-savanna (tallgrass 555,500 over its 250,000 cap,
  no capWhy: the owner's budget call), the west catch-up (its own paragraph: swbay and sedesert fail the attach audit and two pages the instance cap,
  owed by those kits' turns), godthrone (its turn paragraph is a draft with its results unfilled; ten pages, seven new stations).
  **nhighlands' turn (pair 7, 2026-11-03, a cloud session with no GPU; branch `claude/rebuild-nhighlands-cloud`, not merged)** (`biomes/nhighlands/PLAN-STATIONS.md`, "Core adoption (pair 7)" and "Station 5, as built"; `KNOWN_ISSUES.md`'s first item): `build.py` on the shared lists with `--station`; station 5 `bogs` is built (the Footfall plateau's raised bogs, string fen, ~390 pools as one `WATER.drawPools` mesh, a peat stream, the mire's `sink`/`drown` hazards; cotton-grass, cloudberry and the owed `card.cornlily` wired; `ground.sphagnum`, `ground.peat.black`); stations 2-4 are not (station 2 falls to the queue after the pairs, as this file allows). The universal set: `BIO.flareJoin` in `limb()`; `KSHADOW` on (the ground reads 11 texture units; **cost not measured: no GPU**); `WATER.mirrorSwitch` on the tarn, off at load; the trees on `WATER.fields`' shore (`NHL.SHORE`) and the edge audit; `check_cells --fix` (14 faults the old `pack.json` hid, seen once `pack.py` wrote the plant counts); the crater wall's **megabreccia** where the geology bake puts the `impact` province (KSTRATA on the crag pillars, a crag-scale copy of swhighlands' recipe; KGROUND `clast` on the steep; `?strata=0` the old granite). **Verified in software GL only** (`verify.py --assert`, two or three views; not `--all-views`): station 1 passes every check, attach audit 3.89% -> 0.58%, 30.85 M of the 32 M triangle budget (+.45 M of rods), the water's fields bake 8.6 s of load under SwiftShader; station 5 passes every check (its own: the mire open, 387 pools under their lips, 319 hazard records, the mire's plants drawn), attach audit 0.09%, 8.87 M triangles, 109-142 draw calls. **The coordinator should:** run `--assert --all-views` on both pages on the GPU, time `?shadow=0` against the default, and judge the megabreccia and the bogs. **Species changed for readers** (Roketstad, nwlowlands; keys and indices kept, `NHL.SPECIES` unchanged): limbs flared at their joints where a page lists `31j` (guarded); the conifers' arms draw their rod further (to 80% past 4 m) and from 1.4 m; beard lichen hangs from the rod's end; the candelabra's and curtains' sprays sit on their rods; the birch draws rods at mid range; the willow's, gnarled oak's, laurel's and serpentwood's mid-range leaves sit on the rod drawn; the great trumpet's bulbs hang from the funnel's underside; `needle` and `frond` declare caps. **No reader's placement moves:** every change keeps the draws, and `NHL.SHORE`, `NHL.STATION_PASSES` and `NHL.STATION_PLANT` are hooks only a page sets. The new flora stays gated off for Roketstad. Readers' pages (Roketstad, highlands, nwlowlands and its margins) build with syntax OK on these sources and move at their own turns.
  **nhighlands' stations 2-4 (2026-11-09, the same branch, a cloud session with no GPU; `origin/claude/biome-rebuild` merged in first)** (`biomes/nhighlands/PLAN-STATIONS.md`, "Stations 2-4, as built"; `KNOWN_ISSUES.md`'s first item): `--station montane` (2, Dsb/Csb, 5.1 px 610,710), `foothills` (3, Csa, 590,630), `alpine` (4, Dsc/ET, 610,810), on one shared land (`stations/montane/45-host-stage.js` driven by each station's `SITE`; `build.py` now takes a station `base` and neighbour kits, oidong's form). **Six new species** appended to `NHL.SPECIES` (31-36; every key and index before them kept): `copperpine`, `embergiant`, `whitefir`, `blackoak` (station 2) and `whitebark`, `foxtail` (station 4). **nsemiarid's station `high` takes kin of station 2's four** (its PLAN-STATIONS.md: whichever is built first sets the trees). Station 3 grows swlowlands' sprawl, coast and cork oaks, sycamore, manzanita and madrone in place (`SWLOW.make`/`grow`). Station 4 stands on the impact province: megabreccia on its cirque. **Corrected:** pair 7's four "owed" textures (`ground.peat.hag`, `card.dwarfbirch`, `card.sedge.fen`, `rock.megabreccia`) were in the library since 2026-10-26; they are wired (station 1's steep blocks, the bogs) and `PROMPTS-NEEDED.md` section 32 is withdrawn. **For readers** (Roketstad, nwlowlands; both build with syntax OK): the six new species are never placed by `NHL.buildTrees`' own passes, and the kit's new hooks (`NHL.STATION_PASSES`, `STATION_PLANT`, `STATION_LOGS`) are set only by a station's page, so no reader's placement moves. **Checked in software GL only** (`verify.py --assert`, two to five views each): station 2 OK (attach audit 0.32%; a park of one big tree per 42 m on the open slopes; 76 ember giants; 304 corn lilies), station 4 OK (0.00%; nothing over 4 m above the tree line; the tarn 136 m under its headwall), station 3 passed every check on the build before its last tuning (fewer cork oaks, logs off the grass); station 1 and the bogs were rebuilt for the wired textures and load clean. **The owner (2026-11-09): no GPU verify from this session; the integration session takes the pages as built.**
  **nsemiarid's turn, merged 2026-11-03** (pair 9; `biomes/nsemiarid/PLAN.md` section 11, `KNOWN_ISSUES.md`; `biomes/scablands/PLAN.md` section 6): no new station (station 2, `high`, waits for nhighlands' station 2, as its plan says; map 5.1 asks nothing of this kit). `verify.py --assert --all-views` passes on the GPU for all three pages: nsemiarid (Arc; attach audit 0.00%, was 81.1%; 16.3 M triangles at worst), the scablands' coulee (Arc; 0.00%, was 66.5%), the dam basins' port (RTX lane). The universal set is in on the kit's two pages: `BIO.INDEX_ITEMS` and the LOD switches (`46-host-graphics.js`, its own fragment so the overlay's stage takes it; the floor sets no `BIO.range`, so the LOD options change nothing yet), the variants' far level on impostors (gain 2.4; ebadlands' stilt-pod expansion of welded items), KGROUND (the eight library layers on documented masks, kinds `clast` for the desert's pavement and `polygon` for the dry bed's mud cracks; the ground is Standard because KGROUND's distance scale reads `cameraPosition`, which r128 never uploads to Lambert), KFAR to 14 km and KHORIZON, height fog, the rain cover, the air's load with a dust-storm select, breakup, `WATER.mirrorSwitch` off at load (the salt lake; the coulee's plunge lake), the water as fields with the edge audit, `BIO.flareJoin` on the broadleaves' limbs. **KSHADOW** is attached on `?shadow=1` only: the off-by-default switch was on the Throne's branch, not here, when this turn was built. **Fixed on the way, a regression on three pages:** core/atmos's weather writes `ATMOS.windScale` every tick, so a page's own wind setting (n semiarid's calm/breeze/high, the dam basins' stiff wind) never took, and their dust and gale checks failed on the committed pages; the setting is now a factor on the weather's wind (`NSWIND.k`/`jump`, `DB_WIND.k`/`apply`, re-applied after the weather's hook on the dam basins). Any other page that sets `ATMOS.windScale` itself and also binds the weather has the same bug. **Species changed (keys and indices kept; read only by this kit and its overlays):** the solid bodies (strider barrels, bead chains, sail columns, maces, horn pipes) are `BIO.barkMat`, not a still leaf material (`?bodies=leaf`); the glider seeds are `free`; the kiting sail blades are a new item `kite` (`free`, defined last); the drift's back-row tumblers stand at most half a metre up. **Not taken:** KSTRATA (the texture units; the coulee has `KSCOUR.strata`), wadis, `WATER.pan`, the brine look (the salt lake keeps its teal: the owner's call), seasons and KFIRE (station 2's), R9, snow, `BIO.fung`. **Geology 5.1 checked:** basalt 58% and evaporite 27% round the region, the site on basalt and the bed on evaporite, as the plan draws; karst site 10 not taken (low gain, no station on a notch). **The dam basins** take no universal set (the Ancient Port kit's page; its flora is D2): their wind fix and verify only. **Open (the owner's eye):** the ground on KGROUND, the far trees, the far field's pale horizon band from afar, the bodies drawn as wood. **The attach audit cannot see the variants' trees** (as on ebadlands).
  **nsemiarid's station 2 and the scablands' station 2 (2026-11-09, branch `claude/nsemiarid-scablands-3b022c`)** (`biomes/nsemiarid/PLAN-STATIONS.md`, "Station 2, as built"; `biomes/scablands/PLAN.md` section 7): `--station high` (the high country at 5.1 px 848,564, sedimentary: sandstone domes and a sandstone step on `KRELIEF.scarp`/`talus`, snowbeds, two tarns; nhighlands' station 2 trees as **kin** (`BIO.kin`, x.42-.7) and ebadlands' juniper, pinyon, aspen, Gambel oak and bristlecone **read in place**, `station.json` "kin" as nhighlands' form; the kit's own flora on the BSk bench) and the scablands' `--station highline` (the flood lake's high line over **n semiarid's** share, the NW lowlands half owed: KBASIN kind `flood`, KSCOUR's fan, the dam basins' `DBF` wrack read in place). Kit hooks, inert when unset (`STAGE_GROUND.layers`, `FAR_COLOR`, `NSEMIARID.ZONE_HOOK`, `keepClear`, `STATION_PLANT`, `STATION_GROW`), so station 1 and the coulee were rebuilt and re-verified. GPU `--assert --all-views` with `KRATOR_GL=gpu` under `harness.py lock --lane auto`. Then the owed items: `bladderpool` taken as its cousin, the pond bladderwort (nsemiarid `50`/`60`, on still fresh warm water: station 1's spring pool, the scablands' fresh water; checked on station 1); `buckthorn` still owed (no Korona station on the east lobe's shore yet); nhighlands' station ground families packed (they were named but never packed) and its montane, foothills and alpine pages rebuilt and GPU-verified. Still owed: the high line's NW lowlands half and its hulks.
  **The high line's NW lowlands half (2026-11-10, branch `claude/stoic-boyd-3ba6cf`, on top of `claude/nsemiarid-scablands-3b022c`)** (`biomes/scablands/PLAN.md` section 8; `biomes/nwlowlands/PLAN.md`, "The overlays' ground"; `biomes/nsemiarid/PLAN.md` section 8): NW lowlands' part, every hook inert when unset: `src/57-biome-nwlowlands-overlay.js`, a zone on `rock` (crag pines, tussock, saltbush on scoured ground; the kit's trees and floor off it) and a response to `bed`, `silt` and `yearsDry` (young forest of the kit's pioneers on the silt, each stand's height by its years dry), and `build.py`'s `build(overlay=...)` (n semiarid's form; the kit's pages assemble as before). `57` is read by nwlowlands' own two pages only (the Cut, Farside, Korona's basin, ringisles, the valley and metropolis read `50`/`55`/`60` by name, unchanged): their bytes changed by its text, so both were rebuilt and GPU re-verified. The scablands' `--station highline-nw` (`station.json` `"kit": "nwlowlands"`: `build.py` and `verify.py` hand it to that kit's build and harness): the same KBASIN flood lake at 834 m, its strandlines and the wrack band (station 2's `87w` and the dam basins' `DBF`, read in place) **among the young forest's trees**, a KSCOUR strait scoured through a spur (the rock zone), the coulee's erratics on its bars, a rain pond; the universal set (KGROUND with relief and a seventh layer, the overlay's `basalt`, on the scoured rock; KSHADOW off at load; core/rand, core/tags, core/water; KFAR and KHORIZON). GPU `--assert --all-views` with `KRATOR_GL=gpu` under `harness.py lock --lane auto` on the station and nwlowlands' two pages; their `PORT-BASELINE.json` rows only. `tools/check_source_baseline.json`: the station's ground shader's detail-map multiply recorded as RAWTEX, as the kit's own `45` is. Still owed: the hulks (both halves); the pass table and variants for nwlowlands; `nhighlands/tex/pack.json` (changed by the station-2 branch's owed-items commit) leaves nine pages that read it STALE in `check_stale` (nhighlands' four stations, cut face and wall, crater-drylands south, highrift mirror, korona trench): rebuild them with that branch.

  **Run them through without stopping** (the owner, 2026-10-27): "once done with each rebuild, proceed to next, then republish
  gallery". Start each pair when the one before merges; after the last, republish the gallery (`gallery/README.md`).
  **After the pairs and the gallery** (the owner, 2026-10-27: "build station 1 of godstep, station 2 of ehighlands, then station 2
  of nhighlands"): in that order, each as its own session. ehighlands' and nhighlands' turns (pairs 13 and 7) build their station 2
  (their `PLAN-STATIONS.md`) as part of the turn; if one did not, it is built here.
  Then (the owner, 2026-10-27: "add hyperjungle N and E savannah rim to queue"): **hyperjungle N** (`biomes/hyperjungle/PLAN-LANDS.md`
  section 3 and station 3, `-north`: Screamer wood, the howl bamboo, watchers, bone giants) and **the e savannah rim** (section 5.1:
  `biomes/savannarim`, a new kit on the savannah base of section 4, station 2 `-east` near Fridon; the owner, 2026-11-08: no new kit, now `biomes/abyssal-savannah` station `erim`). The rim is built after hyperjungle
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
entry, so the share can only fall. The practices behind this are in the painting-to-3d-world skill, `foliage-kit.md` Â§15.

### Still to write (core) before or during step 1

- **Owed to Godstep** (`biomes/godstep/PLAN.md`, "Core adoption"; taken by the owner, 2026-11-03), before the kit's D2:
  `KLAVA.column` and a `KSTRATA` option to take a baked column as its beds (a front's wall shows the plain's own flows; Godthrone
  station 2 reads it too); `KRELIEF` kind `rille`, keyed to a `KCAVERN` tube record (the trench where the roof fell, pits and
  skylights where it stands; the Throne's `tube_hot_05` and the Rift's `tube_rift_08` reuse it); `KRELIEF` kind `tumulus`
  (tumuli and pressure ridges along `KLAVA.bake`'s lobes).

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

- **The lock's heartbeat** (the owner, 2026-11-02; `CLAUDE.md`): check a GPU job every 30 minutes; no progress in 30 minutes means hung: stop it by PID and release the lock.
- **Two GPU lanes since 2026-11-03** (take it after you merge `claude/biome-rebuild`: your verifies then use the new harness):
  `arc` (the Intel iGPU, `C:/Users/travi/AppData/Local/Temp/claude/krator-verify-gpu.lock`, the lock older copies take) and
  `rtx` (the RTX 5060, `krator-verify-gpu-rtx.lock`). Run `KRATOR_GL=gpu python3 verify.py ... --assert` as before: the
  harness queues you first come first served on whichever lane frees first (`KRATOR_GPU_LANE=arc|rtx` to pin one; timing
  runs and `harness.py lock` stay on arc), kills a job that writes nothing for 25 minutes (exit 124 "STALLED": rerun it),
  and skips an `--assert` run that already passed on the same bytes ("cached pass"; `--no-cache` reruns). `python3
  tools/harness.py lanes` shows who holds and who waits. Never take a lock in bash; never remove a lock you did not take
  unless no process holds it (a dead holder stalled four agents for three hours on 2026-10-26). The SwiftShader lock is retired.
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
| little-demo | deprecated; its 17 world fragments live in `core/world/` (see `openworld/little-demo/DEPRECATED.md`). |
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
    `kits/port/src/91-probe.js`: port, Hook, Ys, the dam bed); then the dam bed's flotsam markers
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
  `little-demo` -> `core/world/` there first, then its content edits.
- **Hook**: missing `core/rand` and `core/tags` in `build.py` (`check_core_use`); it reads the Port kit's fragments and the scale
  model (`KLAND`); rebuild with `kits/port` and Ys's vendored copy.
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
