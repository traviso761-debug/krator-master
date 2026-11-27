# Stage 8: what each build's own docs ask of the all-builds rebuild (D, per build)

Read-only survey of `C:\Users\travi\Documents\krator-integration-2` at `claude/integration-4` cf7e849a2 (2026-11-23). Sources: every
build's `KNOWN_ISSUES.md`, `PLAN*.md`, `README.md`, `HANDOFF*.md`, Xanadu's `STACK-PLAN.md` / `BUILD-PLAN.md` / `BUILD-OUT.md` /
`HAMLETS-PLAN.md`, `GODOT-PLAN.md`, `godot/README.md`, `tools/check_stale_baseline.json` (not `check_stale.py`), `tools/checks_optin.json`,
and the materials.json files (grep for each delivered texture id). `TODO.md` "Ride along" (lines 76-464) is cited where a build's doc points
at it; it is not re-listed item by item here (the TODO agent has it).

**Tags.** `[rebuild]` rebuild only (sources already done, or the page is just behind). `[code]` a source change first. `[texture]` wire a
delivered set (materials.json slot, `pack.py`, judge in the demo kit). `[verify]` a check expected to change state (fail, warn or start
passing) and why. `[godot]` a Godot export or test. `[data]` a scale-model / region / bake change. `blocked:` what it waits on, else `no`.
"STALE" = recorded in `tools/check_stale_baseline.json` (the rebuild clears it).

**Global facts that touch many sections below**
- Switching checks 22-31 to `"*"` (`tools/checks_optin.json:2`, TODO.md:158) turns `samplers` (fail at 16, warn at 15), `minset`,
  `drawn-ground`, `recorded`, `names` on for every old build. Expect warnings on every page at 15 units (godstep, greatchasm, loom-chasms,
  firebliss glass, geyser, sedesert's stations) and failures where a program reaches 16 (greatchasm says "16 at most on any program",
  `biomes/greatchasm/KNOWN_ISSUES.md:21`; neouterwall "16 units or fewer", `biomes/neouterwall/PLAN.md:314`). Erewhon is not on the
  `samplers` list today; Blakhed is.
- The Tungang furniture and Fellgang catalog pieces left 42-44 build commands stale until "the joint all-builds rebuild":
  `kits/catalog/KNOWN_ISSUES.md:11-22` (same text `kits/interiors/KNOWN_ISSUES.md:10-21`, `kits/tungang/KNOWN_ISSUES.md:86-91,139-141`).
  Listed builds: settlements dhelv, girder, highlands (+roketstad), isle-demo (build.py and --accept), iziz, locus, longsong, mavs-refuge,
  mungo, noahs-regret, pinnacle-rock, screamers, span, verge, voth; kits ancients, ancients-interiors, ash-nomads, beast-riders,
  desert-nomads, eternian, islanders, lizardmen, mechs, metropolis, motor-vehicles, post-apoc, pylon, resources, scyvoi, talia, tungang,
  yeti, zeijani; biomes ancientsvalley, catch (fan, lake, oasis); openworld/isle-demo. `[rebuild]`, then `core/furnish/fingerprint.py`
  and `core/engine/fingerprint.py` (`HANDOFF-REBUILD.md:163-165`).
- New cultures waiting for `core/tags/52-core-tags-vocab.js` (none is in it today; checked by grep): coyote, qiblai, vent, kimr, glazier,
  shumari, dasri, hueru-kuran, spider-lake, ria, yonni, dzagh-vardzi, marr (marr has no opt-in vocab fragment at all), and `traveller`
  (Blakhed's camp rows, `settlements/blakhed/KNOWN_ISSUES.md:22`: check). Per-kit lines below; TODO.md:123, 303, 315, 322.
- ALL-BUILDS-REBUILD-PLAN (`settlements/ALL-BUILDS-REBUILD-PLAN.md:877-900`, TODO.md:93) adds a scale-model pass (Queue 1: four map
  surgeries, eight pin moves, nine missing pins) and stale cut/page-anchor syncs (Queue 2). It is a 2026-11-22 survey plan; its per-build
  rows are cited below as `[data]`, blocked on the owner's go and the scale-model session.

---

## settlements

### settlements/azure-dream
- STALE build.py. `[rebuild]` blocked: no.
- `qiblai` culture not in core/tags (PLAN.md:550). `[code]` core/tags fold. blocked: no.
- Re-bake (reads region data) on relief v2 (settlements/xanadu/STACK-PLAN.md:95,190). `[data]` blocked: `relief.micro: 2` decision.
- Fishers' hall and Hall of Fasting are other kits' stand-ins (KNOWN_ISSUES.md:12,54): not a rebuild item.
- Godot export AD8 (PLAN.md:607): `[godot]` after Stage 8 (XP4/XP5). blocked: Stage 8.

### settlements/blakhed
- Sampler risk: on the `samplers` opt-in list (`tools/checks_optin.json:6`); needs the `v3_arrays_three_maps` assembly (ISLE_ATLAS pattern,
  settlements/xanadu/STACK-PLAN.md:122-124) if it sits within 3 of 16. `[code]` + `[verify]` (samplers may fail at 16). blocked: XS0's
  per-page sampler measure (STACK-PLAN.md:184) / the stack's v3 assembly landing on this line.
- `traveller` / `traveller-kradz` / `fellgang-band` camp cultures (KNOWN_ISSUES.md:22): check they are vocabulary values. `[check]` no.
- Godot export, core/hazard, winter state (KNOWN_ISSUES.md:45-46): not Stage 8. Pin `441,1400` in the 5.1e22 pin batch
  (ALL-BUILDS-REBUILD-PLAN.md:894; KNOWN_ISSUES.md:27). `[data]` blocked: scale-model session.

### settlements/dalab
- STALE build.py. `[rebuild]`.
- `dalab.html` fails universal `instance-cap` (swlowlands/glossy 282,687 > 250,000, no capWhy) (KNOWN_ISSUES.md:170-173). `[verify]`
  expected FAIL; fix is a `capWhy` or thinner crowns: owner's call. blocked: owner.
- Vendor drift vs Vernacular 69b/69c, Iziz 91/93/75/76, Highlands 71/71b/73/74 (KNOWN_ISSUES.md:174-177; settlements/highlands/
  KNOWN_ISSUES.md:20-22): re-vendor read diff by diff. `[code]` optional. blocked: no.
- Frame turn `+45°` in WORLD_DATA.towns (ALL-BUILDS-REBUILD-PLAN.md:900); Dalab Delta map surgery (:881). `[data]` blocked: scale-model.

### settlements/dhelv
- STALE build.py; on the catalog list. `[rebuild]`.
- core/biome stemClump global leak fixed in core (e8df733d); page just needs the rebuild (KNOWN_ISSUES.md:30-36). `[rebuild]`.
- Behind core/simulation since ad9078315 (BUGS-2026-11-15.md:482-483). `[rebuild]`.
- Frame turn `+90°` (ALL-BUILDS-REBUILD-PLAN.md:900). `[data]` blocked: owner/scale-model.
- Godot P7 case is stand-ins (no cavern mesh, no interiors, SIM.step not ported) (KNOWN_ISSUES.md:99-103). `[godot]` re-export
  `verify.py --export ../../godot/data/dhelv` after the rebuild (godot/README.md:282); the rest not Stage 8.

### settlements/flashing-eye
- `qiblai` and `vent` not in core/tags (PLAN.md:509). `[code]` core/tags fold.
- Re-bake on relief v2 (STACK-PLAN.md:95,190); `drawn-ground`, `samplers` opted in. `[data]` blocked: relief v2 decision.
- Missing pin `881,1527.1` (ALL-BUILDS-REBUILD-PLAN.md:894). `[data]` blocked: scale-model.

### settlements/gihon
- `kits/xanadu/extra/` (88d, 88f, 88h) folds into the kit's src; its pending boxes go then (KNOWN_ISSUES.md:41,47). `[code]` (kit). no.
- Gold and opal: `MAT.xGold` plain tint, `MAT.xOpal` procedural stand-in (KNOWN_ISSUES.md:8; PLAN.md:226); sets `metal.gilt.leaf`,
  `inlay.opal` NOT in the library (checked). `[texture]` blocked: owner to generate (PROMPTS-NEEDED.md:396-404 section 68).
- Town wall slate is Kirstabal's stand-in (KNOWN_ISSUES.md:11); `wall.slate.coursed` delivered 2026-11-23 (core/materials/PLAN.md:2176).
  `[texture]` via kits/xanadu `xSlate`/`xSlateD`. no.
- `node bake_landing.js --check` fails when stale (README.md:51): re-run after the kit fold. `[verify]` no.
- Pin `955,1607 -> 955,1608` (ALL-BUILDS-REBUILD-PLAN.md:893). `[data]` blocked: scale-model.

### settlements/gila
- Lizardmen row passed by name until the all-builds rebuild (PLAN.md:42; `core/hamlet/lizardmen/23-hamlet-lizardmen.js`). `[code]` fold
  into `20-hamlet-cultures.js` if the owner wants it (reaches ~56 builds). blocked: owner.
- `vessel` class for `lz-barge` rides with the vessel rollout (core/simulation/LIZARDMEN-CENSUS.md:186-190; TODO.md:126). `[rebuild]`.

### settlements/girder
- STALE build.py; on the catalog list (build.py; build_hero.py is retired to archive/girder-hero). `[rebuild]`.

### settlements/highlands
- STALE build.py; on the catalog list (with roketstad). `[rebuild]`.
- Room kinds into `kits/interiors/src/30-programs.js` (KNOWN_ISSUES.md:15-18): source done (30-programs.js:54,58), pages wait. `[rebuild]`.
- Build's own pattern/band/tile families not wired (KNOWN_ISSUES.md:81). `[texture]` owner's eye. no.

### settlements/hook
- Takes the port probe's `userData.probePoints` change at its next rebuild (biomes/dambasins/KNOWN_ISSUES.md:27-31). `[rebuild]`.
- Frame turn `-9.2°` (ALL-BUILDS-REBUILD-PLAN.md:900). `[data]` blocked: scale-model/owner.

### settlements/isle-demo
- STALE build.py and build.py --accept; on the catalog list; fauna runtime pages (BUGS-2026-11-15.md:484-486). `[rebuild]`.
- `hamlet-clay-k` ships 0 by sea (integration session; the village: PLAN.md:1179, `tests/test-isle-hamlets.js:48`). `[code]` check the
  clay village's sea route in the sim (47h); `[verify]` the hamlets' "every load landed" proof may read 0 for it. blocked: no.
- Raw clay is a tinted stand-in (PLAN.md:1178); `earth.clay.raw` delivered 2026-11-12, not wired anywhere (grep). `[texture]` (also
  kits/islanders `IE_RAWCLAY`). no.
- 52b plume text change (biomes/geyser/KNOWN_ISSUES.md:125-127) and swbay builders (biomes/swbay/KNOWN_ISSUES.md:38-39). `[rebuild]`.
- `test-isle-*.js` need `dist/isle-city.plan.js` pulled from LFS (HANDOFF-REBUILD.md:157). `[verify]` blocked: `git lfs pull`.
- Godot: citizens capsules, canoes stand-in hulls (KNOWN_ISSUES.md:179). `[godot]` re-export world-isle-kautoa/valapo and isle sim.json
  (godot/README.md:283-284) after the rebuild. no.

### settlements/iziz
- STALE build.py; on the catalog list. `[rebuild]`.
- Page waits for the all-builds rebuild (biome copies re-vendored, KNOWN_ISSUES.md:486-492). `[rebuild]`.
- kits/ancients `52-sky-abc.js` changes re-vendored but not rebuilt into the kit page or the city; "rebuild kits/ancients too and check
  the baseline" (KNOWN_ISSUES.md:558-561). `[rebuild]` no.
- Overview draw calls 923 > 900 budget (KNOWN_ISSUES.md:489): `[verify]` warning, pre-existing.
- Godot: lib/glass not in library.gdshader (KNOWN_ISSUES.md:550); Iziz case not re-exported, move the case box when re-exported
  (GODOT-PLAN.md:630; core/export/README.md:305). `[godot]` no.

### settlements/jimjam
- STALE build.py. `[rebuild]`. Godot export is its P5 (PLAN.md:291): not Stage 8.

### settlements/kirstabal
- `87k-xa-lake-trades.js` folds into the kit's FILES; `88d`/`88f` extras; lake-rooms set `87k1` to kits/interiors/sets (KNOWN_ISSUES.md:7-9;
  kits/xanadu/README.md:115-120; TODO.md:119,153). `[code]` (kit). no.
- `fishingRow` into core/hamlet's row (KNOWN_ISSUES.md:24-27; TODO.md:140). `[code]` no.
- `vessel` class: other pages inlining core/tags rebuild (KNOWN_ISSUES.md:15). `[rebuild]`.
- Wall slate `xSlate`/`xSlateD` stand-in (KNOWN_ISSUES.md:52); `wall.slate.coursed` delivered 2026-11-23 (core/materials/PLAN.md:2176),
  not wired (grep). `[texture]` no.
- Re-bake on relief v2 (STACK-PLAN.md:88,190). `[data]` blocked: relief v2 decision.

### settlements/ledge
- `check_source_baseline.json` RAWTEX x4 key in `src/45-host-stage.js` is stale; shrinks at the next `--write-baseline` (KNOWN_ISSUES.md:52).
  `[code]` baseline rewrite. no.
- Loj Fower's `tg` set stand-ins until loj-twenny's branch merges (KNOWN_ISSUES.md:7-9). Not Stage 8. blocked: loj-twenny merge.
- riftrim station 1 still draws its own stand-in cliff where Ledge's face stands (KNOWN_ISSUES.md:13; PLAN.md:544). `[code]` riftrim.
  blocked: Ledge's hand-over (PLAN.md 9.10).
- Frame turn `180°` (ALL-BUILDS-REBUILD-PLAN.md:900). `[data]` blocked.

### settlements/lightwall
- STALE build.py. `[rebuild]`. Moonglass is a glazed-class candidate (STACK-PLAN.md:91,104). `[texture]` blocked: M1 packing pick.

### settlements/locus
- STALE build.py; on the catalog list. `[rebuild]`.
- `locus-kit.html`, `abyss-kit.html` fail universal `one-key-map` (P bound to step-back) (KNOWN_ISSUES.md:141-147). `[code]` move the
  sheet's step-back key off P (`src/98-start.js`), then rebuild. `[verify]` FAIL until then. no.

### settlements/loj-twenny
- The Line's station page is behind its sources (`88-host-station.js` `open` flag) (KNOWN_ISSUES.md:6-7). `[rebuild]` biomes/line.
- Godot export not wired (KNOWN_ISSUES.md:25-26). `[godot]` not Stage 8.
- Branch `claude/loj-twenny-059a5e` left 8 builds stale (BUGS-2026-11-15.md:465-466): check whether merged on this line. `[check]`.

### settlements/longsong
- STALE build.py; on the catalog list; behind kits/crops (TODO.md:351-352) and the fauna runtime (BUGS-2026-11-15.md:484-486). `[rebuild]`
  blocked: `core/charactermodels/dist/pieces/` is not built in this checkout (checked: missing). Without it the "people dressed" check /
  `dist/kchar/` sidecars cannot be remade (README.md:102-108). Build the charactermodels pieces first.
- Its XAK verify: draw-call OVER and one FAIL (the stale interiors bake) (settlements/xanadu/KNOWN_ISSUES.md:87; KNOWN_ISSUES.md:25).
  `[verify]` expected FAIL unless the interiors bake is rerun. no.
- Recut region onto 5.1 `(1228.88,1621.23)`, `+28.6°` (ALL-BUILDS-REBUILD-PLAN.md:899). `[data]` blocked: owner/scale-model.
- `peoples.json` lineages (core/region/CROOK-RIA-SCOPE.md:85-88; TODO.md:95) reach Longsong's 5 pages. `[rebuild]`.
- Godot: world-longsong re-export after the rebuild. `[godot]` no.

### settlements/mavs-refuge
- STALE build.py; on the catalog list. `[rebuild]`.
- `interiors-bake.json` stale: rerun `python3 bake_interiors.py` (KNOWN_ISSUES.md:28-29). `[code]` (a bake). no.
- `walk-and-reach` FAILS (86 apartment ground floors) (KNOWN_ISSUES.md:171-175). `[verify]` expected FAIL, not looked into.

### settlements/mungo
- STALE build.py; on the catalog list; behind core/simulation (BUGS-2026-11-15.md:482). `[rebuild]`.

### settlements/noahs-regret
- STALE build.py; on the catalog list. `[rebuild]`. Frame turn `+90°` (ALL-BUILDS-REBUILD-PLAN.md:900). `[data]` blocked.

### settlements/pher
- STALE build.py. Takes the kit's `extra/` pieces via kit.json `"external"`; drop them from `"external"` when they move to src
  (KNOWN_ISSUES.md:15-16; TODO.md:122). `[code]`.
- MINSET baselined until Xanadu's page re-vendors its biome core (KNOWN_ISSUES.md:8-11). `[code]` re-vendor, then shrink baseline.
- Re-bake (`bake_towns.py pher`) on relief v2 (STACK-PLAN.md:87,190). `[data]` blocked: relief v2 decision.
- PLAN.md:437: Erewhon's region cut square still px 790-820 (stale). `[data]` blocked: Erewhon re-seat.

### settlements/pinnacle-rock
- STALE build.py; on the catalog list; reads isle-demo's DRAW fragment in place, takes the colour fix (isle-demo KNOWN_ISSUES.md:62-63). `[rebuild]`.
- Recut region `(1027,681) -> (1007,686)`, re-derive KSTACKS foot, stamp into openworld/pinnacle (ALL-BUILDS-REBUILD-PLAN.md:898). `[data]` blocked.
- `port_baseline` CHANGED for pinnacle-rock (BUGS-2026-11-15.md:480-481). `[rebuild]` + baseline.

### settlements/qiblai
- STALE build.py. `qiblai` culture fold (PLAN.md:20). `[code]`.
- Godot export Q7g not started; old spike `godot/data/qiblai` to re-export on packFormat 2 at XP5 (KNOWN_ISSUES.md:82; STACK-PLAN.md:92).
  `[godot]` blocked: Stage 8 and Qāṭarāq's cut.

### settlements/reedlake
- STALE build.py. Pages behind their sources since the 2026-11-03 re-vendor (KNOWN_ISSUES.md:28-35). `[rebuild]`.
- 70/71/71b kept at pre-Slavic copies: re-vendor or read kits/highlands in place "on its next rebuild" (KNOWN_ISSUES.md:40-42). `[code]`
  owner's look. no.
- Own families not wired (KNOWN_ISSUES.md:52). `[texture]` low priority.

### settlements/screamers
- STALE build.py; on the catalog list. `[rebuild]`.

### settlements/shade
- STALE build.py; behind core/simulation (BUGS-2026-11-15.md:482); vendored fauna not re-exported (GODOT-PLAN.md:778-780). `[rebuild]`.
- sedesert flora not wired into the nomad kit's library (KNOWN_ISSUES.md:120). `[texture]` no.

### settlements/shumar
- `shumari` row opt-in `core/hamlet/shumari/25-hamlet-shumari.js` folds into `20-hamlet-cultures.js`; vocab fold (KNOWN_ISSUES.md:3;
  BUILD-OUT.md:209). `[code]` with kits/shumari. no.
- Stale road origin `(734,1182)` in `net51-gemini.json` / `roads-supplement-gemini.json` (PLAN.md:70,244). `[data]` scale-model. blocked.

### settlements/span
- STALE build.py; on the catalog list. `dalab` sockets pack: source done (`core/sockets/80-cultures.js:136`), page waits
  (KNOWN_ISSUES.md:16-19; TODO.md:393 is now stale text). `[rebuild]` + strike the TODO/KNOWN_ISSUES lines.

### settlements/strongwall
- Page pad at 738.6 m (README.md:35) must move to ~755 m on the edited model (integration session). `[code]` `targets/fort/89zs-sw-site.js`
  `swGround` re-derive, `fort-on-its-pad` / `on-the-model` checks then pass. blocked: the edited model on this line.
- Re-bake when Gōlḍ-Mārch is cut; M3 POM on rubble/ashlar (STACK-PLAN.md:93). After Stage 8.

### settlements/thalaba
- STALE build.py. Re-bake (north shore road) (STACK-PLAN.md:90). `[data]` blocked: relief v2.
- Godot export, gallery not yet (KNOWN_ISSUES.md:71). Not Stage 8.

### settlements/verge
- STALE build.py; on the catalog list; core/city takes. `[rebuild]` then `verify.py dist/verge.html --assert` (CLAUDE.md).
- Frame turn `-10°` (ALL-BUILDS-REBUILD-PLAN.md:900). `[data]` blocked.
- `[godot]` re-export `--export ../../godot/data/verge` (godot/README.md:281).

### settlements/viridian
- `qiblai` culture (PLAN.md:347). `[code]` core/tags. Re-bake on relief v2 (STACK-PLAN.md:95). `[data]` blocked. Godot V8 later.

### settlements/voth
- STALE build.py; on the catalog list; behind core/simulation; fauna runtime. `[rebuild]` then `verify.py dist/voth-city.html --assert`.
- Two known failures (embassies Hykkousoi, Iziz, Jimjam, Republic; Arena not walkable) (HANDOFF.md:27-29). `[verify]` expected FAIL.
- Five redone pattern sheets in the library only (HANDOFF.md:138; GODOT-PLAN.md "Before an export"). `[texture]` re-pack. no.

### settlements/xanadu (kit sheet `xanadu`, `scrap`, and `erewhon` targets)
- STALE build.py, --target erewhon/scrap/xanadu. `[rebuild]`.
- Marbles `xMarbleB`/`xMarbleW`/`xOpArt` packed, page shows them at its next rebuild: check scale and the black stone's gloss
  (KNOWN_ISSUES.md:17-19). `[rebuild]` + owner's look.
- Citadel: nine of eleven sets wired, page not rebuilt (KNOWN_ISSUES.md:23-32). `[rebuild]`, verify Xanadu and Erewhon.
- `xJaliC`: `patterns/xanadu/jali` is now in the library (checked) but `materials.json` still has `"owed"` (kits/xanadu/materials.json:700-703,
  same in settlements/xanadu). `[texture]` drop `owed`, key with `cards.py`, pack. no.
- `wood.cedar.moorish` in library, no family (KNOWN_ISSUES.md:30-32). `[texture]` no.
- Five glaze families pending: `xMosC`, `xMosD`, `xBandC`, `xGiltC`, `xBandR` (integration session; STACK-PLAN.md:84,102-106).
  `[texture]` take the M1 `glazed` class into packing (xy8 normals). blocked: owner's pick of the stack's M1 packing (BUILD-PLAN.md:136-137)
  and XS1's class field / sidecar (STACK-PLAN.md:111-114). Gate 1: no height range demanded of the cut-out (`flat`) class's alpha
  (STACK-PLAN.md:107); check the packer does not put height in a cut-out's alpha.
- Erewhon re-seat `ER_WORLD` `px:805,py:1516` -> `841,1517` (`targets/erewhon/84-er-geo.js:88`; ALL-BUILDS-REBUILD-PLAN.md:897;
  STACK-PLAN.md:84), port `87-er-layout.js` onto KCITY. `[code]` blocked: its session (owed before Stage 8).
- Vendored foliage `leafMat` keyed on options, deliberate drift (KNOWN_ISSUES.md:146-150; TODO.md:289). `[code]` if the core fix lands.
- Own families not wired (KNOWN_ISSUES.md:118). `[texture]` low priority.
- Phase C list: extra/ into src, xanadu row fold, `qiblai` culture, core/world `xanadu` style, countryside sample out of opt-in,
  `relief.micro: 2`, the M1 packing, `test_all.py --nightly` (BUILD-PLAN.md:117-121; BUILD-OUT.md:218). `[code]` blocked: owner's picks.
- Godot XP1-XP6 after Stage 8 (STACK-PLAN.md:193-202). `[godot]` blocked: Stage 8 + re-seat.

### settlements/xanadu-lake
- Opt-in pieces read in place until folded (PLAN.md:94); each town's missing pieces draw stand-ins (`xa_ghat`, `xa_governor`, ...:
  e.g. `boatyard/PLAN.md:74`). `[code]` kit fold only; new pieces not Stage 8.
- Each town's `bake_towns.py` entry re-fitted on relief v2 (STACK-PLAN.md:67,86). `[data]` blocked: relief v2.

### settlements/xanadu-works
- `extra/88h-xa-mine-works.js` into the kit (TODO.md:120-121). `[code]`.
- `ground.dyeworks`, `ground.sulfur.crust` delivered 2026-11-23 for 88g, not wired (core/materials/PLAN.md:2177; grep). `[texture]` no.
- Run on SwiftShader only; GPU verify owed (KNOWN_ISSUES.md:10). `[verify]` first GPU run.

### settlements/ys
- STALE build.py. Port probe change (biomes/dambasins/KNOWN_ISSUES.md:30-31). `[rebuild]`.
- Kit sheet: Agent A's known failure, the conch house hall spots (HANDOFF.md:64). `[verify]` expected FAIL.
- Frame turn `-55°` (ALL-BUILDS-REBUILD-PLAN.md:900). `[data]` blocked.

### settlements/yuni
- STALE build.py. ORNUM `||0` defaults in `src/76-doors.js` (now lines 149, 243; TODO.md:374-377 says 180). `[code]` `x == null ? d : x`. no.
- Godot: world-yuni / yuni re-export after the rebuild. `[godot]`.

### Pin-only settlements (scale model 5.1e22, ALL-BUILDS-REBUILD-PLAN.md:885-894)
- almua, ardent, drum, qoold-lheek, shim, torus, zeydanin: pin relocations; beacon, devisers-camp, iridescent, eternian-canal (Shuāng-Zhá):
  missing pins. `[data]` blocked: the scale-model session's 5.1e22 edit.

---

## kits

### kits/ancient-transit
- STALE build.py; build after kits/motor-vehicles (BUGS-2026-11-15.md:467-468). `[rebuild]`. Overgrowth stand-in domes (KNOWN_ISSUES.md:19): not Stage 8.

### kits/ancients
- STALE build.py and targets arcpile, interiors, podium, sanctum, span, theodiga, theodiga-today. `[rebuild]`.
- Sky band fix (`pow(max(h,0.),.55)`) is in `src/90-scene.js:39` (checked); ~47 of the kit's 49 pages and in-place readers move
  (BUGS-2026-11-15.md:309-313). `[rebuild]`.
- `52-sky-abc.js` changes not rebuilt into the kit page (settlements/iziz/KNOWN_ISSUES.md:558-561). `[rebuild]`.
- `INDEX.md` not regenerated for theodiga 77a/77b (BUGS-2026-11-15.md:473-474). `[code]` `tools/make_index.py kits/ancients`.
- Sanctum / Heirs pieces: no Godot export check (KNOWN_ISSUES.md:1162,1185). `[godot]` not Stage 8.

### kits/ancients-interiors
- On the catalog list; reception recipe and frame fixes move pages at their next rebuild (KNOWN_ISSUES.md:9-17); reads
  `kits/interiors/dist/interiors-core.js` (build kits/interiors first, CLAUDE.md). `[rebuild]`.

### kits/beast-riders, kits/construction, kits/eastern-abyssal, kits/extraplanar, kits/highlands, kits/iziz-vernacular, kits/locus, kits/metropolis, kits/yuni
- STALE build.py each. `[rebuild]`. (beast-riders, metropolis also on the catalog list.)

### kits/catalog
- 42 build commands stale (KNOWN_ISSUES.md:11-22): see the global list. `[rebuild]`.
- Symbols: bundled worlds built before 2026-11-03 take the new symbols (KNOWN_ISSUES.md:3-5). `[rebuild]`.
- Bath fixtures permanent: every catalog/interiors page moves (KNOWN_ISSUES.md:26-30). `[rebuild]`.
- Arms not placed in any build yet (KNOWN_ISSUES.md:31; README.md:503). Not Stage 8 unless the owner asks.
- Hem rule and decal pictures (TODO.md:100-118; branch `claude/dreamy-turing-3902d7`): `[code]` 66 build commands move. blocked: that branch.
- Glazier catalog culture file owed (kits/tungang/KNOWN_ISSUES.md:105-109). `[code]` optional.

### kits/coyote
- Register `coyote` in core/tags (KNOWN_ISSUES.md:3-5; PLAN.md:252,293; TODO.md:123-125). `[code]`; `[verify]` `tags-vocabulary` then
  passes with no unknown. no.
- 2026-11-23 sets: `brick.mud.coursed`, `patterns/coyote/kilim|frieze|turquoise-mosaic`, `card.feather.ostrich` (core/materials/PLAN.md:2172;
  KNOWN_ISSUES.md:6; none in materials.json). `[texture]` no.
- C9 rewires biomes/greatchasm's sill onto the bundle (PLAN.md:175,253). Not Stage 8. blocked: C9.

### kits/dasri, kits/dzagh-vardzi, kits/hueru-kuran, kits/ria, kits/spider-lake, kits/yonni
- Culture registered page-locally (`dasri/src/52d-ds-tags.js`, `dzagh-vardzi/src/53a-dv-vocab.js`, `ria/src/70-ra-vocab.js`,
  `yonni/src/53a-yn-vocab.js`; hueru-kuran, spider-lake by verify allow-list) "until the next all-builds rebuild"
  (dasri KNOWN_ISSUES.md:3; hueru-kuran :5; spider-lake :5; ria :3). `[code]` fold into `52-core-tags-vocab.js`, drop the local fragments. no.

### kits/eternian
- On the catalog list. `[rebuild]`. `core/engine/fingerprint.json` rewrite after the engine kits' screenshots (TODO.md:379-381). `[code]`.
- `card.tracery.bronze` delivered, not wired (KNOWN_ISSUES.md:49-52): owner's eye pass. `[texture]` blocked: owner.

### kits/fauna
- STALE build.py. Pages bundling the runtime not rebuilt after `M.skin` (PLAN-MESHY.md:453; BUGS-2026-11-15.md:484-486). `[rebuild]`.
- Köppen vocab lacks Cwb/Dsc; adding moves every fauna bundle (biomes/siphon-pits/KNOWN_ISSUES.md:69-70; TODO.md:360). `[code]`.
- ORNUM `o.stock || 1` in `krator-fauna-xeno.js:26` (TODO.md:348). `[code]`.
- `hide.sleek` re-pack before export (GODOT-PLAN.md:810; family is wired, check `pack.py --check`). `[texture]`.

### kits/interiors
- 42 stale commands (KNOWN_ISSUES.md:10-21). Food require `anchors:['floor','wall']` source done (KNOWN_ISSUES.md:29-37;
  `src/30-programs.js:87,99,103`), pages wait. `[rebuild]`; `--sets --assert` seed 2 failures left are kits/tents' (KNOWN_ISSUES.md:35-36).
- `87k1` lake rooms move into `kits/interiors/sets/` and `69dz` into `sets/xanadu.js` (kits/xanadu/README.md:117-120; TODO.md:121). `[code]`.

### kits/islanders
- On the catalog list. `[rebuild]`. Storyboard / gable-east-b re-pack before export (GODOT-PLAN.md:811). `[texture]` check packed.
- Raw clay `IE_RAWCLAY` stand-in; `earth.clay.raw` delivered (KNOWN_ISSUES.md:87). `[texture]` no.

### kits/kimr
- `kimr` added at load (`src/89-rows.js`): fold into core/tags, drop two lines (KNOWN_ISSUES.md:6-8; TODO.md:315). `[code]`.
- Nine delivered sets not wired, no materials.json (KNOWN_ISSUES.md:3-5; core/materials/PLAN.md:2213). `[texture]` no.

### kits/marr
- `culture:'marr'` (PLAN.md:53) is not in core/tags and has no local vocab fragment (checked). `[code]` register. `[verify]` tags-vocabulary.
- 2026-11-23 sets `stone.coral.colonial`, `patterns/marr/azulejo-maritime`, `iron-scrollwork` (core/materials/PLAN.md:2175). `[texture]`.

### kits/mechs, kits/motor-vehicles
- On the catalog list. `[rebuild]`. `vehicle` class rollout (TODO.md:126-135). `[code]`. Build motor-vehicles before ancient-transit.

### kits/port
- check_stale "kits/port UNRECORDED" (HANDOFF-REBUILD.md:161). `[rebuild]` and record. Probe change (dambasins KNOWN_ISSUES.md:27-31). `[rebuild]`.

### kits/post-apoc, kits/pylon, kits/resources, kits/scyvoi, kits/talia, kits/zeijani, kits/ash-nomads, kits/desert-nomads, kits/lizardmen
- On the catalog list. `[rebuild]`. Scyvoi/lizardmen/islanders hangings move on purpose with the hem rule (TODO.md:107-110). blocked: that branch.

### kits/qiblai
- STALE build.py; `qiblai` culture (KNOWN_ISSUES.md:3-5; TODO.md:303). `[code]`.
- `metal.gold.sheet.beaten`, `metal.copper.mantra` delivered, not wired (core/materials/PLAN.md:2215). `[texture]`.

### kits/ringsea
- `vessel` REG already `cls:'vessel'` (TODO.md:132-133). `[rebuild]`.

### kits/shumari
- Vocab `shumari` and hamlet row fold (KNOWN_ISSUES.md:3-12). `[code]`; verify allows `u == [] or ['culture:shumari']`, still passes.
- `stone.dome.mamluk`, `masonry.ablaq.basalt`, `stone.jali.blade` owed (KNOWN_ISSUES.md:16-20): not delivered. blocked: owner.

### kits/tents
- STALE build.py. Rebuild shows the army/ripstop covers: check both dresses (KNOWN_ISSUES.md:8-11). `[rebuild]`.
- Verified on SwiftShader only: GPU lane run (KNOWN_ISSUES.md:7). `[verify]`.

### kits/tungang
- STALE build.py. `glazier` into core/tags, delete `core/tags/glazier`, drop it from build.py and tungang_bundle.py (KNOWN_ISSUES.md:110-112;
  core/tags/glazier/README.md:12-14). `[code]`.
- `KCAVERN.rockMaterial` env-map guard: real fix renames `v1 v2 v3 r1 r2 r3` in `43-core-ground.js` (KNOWN_ISSUES.md:72-77; TODO.md:96-99). `[code]` 199 builds.
- Delivered not wired: `rock.hewn.drillmarked` (wired only in ledge/shelf), `organic.fungus.leather`, `patterns/fellgang/daub`,
  `patterns/glazier/cholet-front`, `patterns/tungang/loj-banner` (core/materials/PLAN.md:2188,2218; KNOWN_ISSUES.md:81-85,114-115). `[texture]`.
- `check_assembly` baseline key (KNOWN_ISSUES.md:97-99). Godot export T10 not wired (KNOWN_ISSUES.md:100). Not Stage 8.

### kits/xanadu
- STALE build.py. `extra/` (88c-88h, 69dz) into `src/`; sheet rows; every page and XAK change (README.md:36-39; TODO.md:119-122). `[code]`.
- `87k`, `87k1`, `87k2` opt-in files folded (README.md:115-121). `[code]`.
- Five glaze families and Gate 1, jali, `wood.cedar.moorish`, `ground.dyeworks`, `ground.sulfur.crust`, xGold/xOpal: see settlements/xanadu.
- Xanadu kit as `v2_two_maps_oct8` packs in Godot (STACK-PLAN.md:96,199). `[godot]` XP3 after Stage 8.

### kits/yeti
- `ground.snow.drift` pre-wired, "awaiting the all-builds rebuild to show" (KNOWN_ISSUES.md:13; wired in materials.json). `[rebuild]`, look.
- `khaayken` registered; on the catalog list. `[rebuild]`.

---

## biomes

### biomes/abyssal-savannah
- STALE (build.py + belt, bench, erim, north, serim). `[rebuild]`.
- Grass cards packed, pages not rebuilt: check the tufts' scale (KNOWN_ISSUES.md:81-83). `[rebuild]` + look.
- `card.leaf.miombo` in library, not wired (`D.miomboMat` still painted) (KNOWN_ISSUES.md:121-122). `[texture]`.
- KSHADOW cost unmeasured (KNOWN_ISSUES.md:55). `[verify]` GPU timing.

### biomes/ancientsvalley
- STALE (build.py, terraces, yards); on the catalog list. `[rebuild]`.
- `AV.kerbPlace` fix "with the Overlook's next rebuild, and its check with it" (KNOWN_ISSUES.md:212-216). `[code]` moves the Overlook's city. no.
- Software GL: shell bake programs fail to link; GPU lanes only (KNOWN_ISSUES.md:230-232). `[verify]` expected on SwiftShader.

### biomes/arch
- Stream colours: core `drawFlow` cache key fix parked; kit works round in 89w (KNOWN_ISSUES.md:22; TODO.md:326). `[code]` core/water, then drop the workaround.
- `rock.serpentinite`, `rock.peridotite.rind`, `mineral.travertine.brucite`, `rock.basalt.pillow`, `mineral.curtain` delivered, not wired
  (core/materials/PLAN.md:2203; KNOWN_ISSUES.md:26). `[texture]`.

### biomes/catch
- STALE (fan, lake, oasis); on the catalog list. `[rebuild]`. Built with no GPU (KNOWN_ISSUES.md:62). `[verify]` GPU.

### biomes/clivobredos
- `card.fallout.lawn`, `organic.lung.ring`, `organic.comb.throat`, `organic.husk.dry` delivered (core/materials/PLAN.md:2214; KNOWN_ISSUES.md:12-13). `[texture]`.

### biomes/copperglacier
- STALE (build.py, icefield, pass). `[rebuild]`. `rock.azurite` delivered 2026-11-23, not wired (KNOWN_ISSUES.md:42; PLAN.md:2173). `[texture]`.
- GPU verify owed (PLAN.md:145). `[verify]`.

### biomes/crater-drylands
- STALE (build.py, edge, salt, south). `[rebuild]`.
- `instance-cap` still failing, `craterdry/bloom` 488,234 (KNOWN_ISSUES.md:140-141). `[verify]` expected FAIL: owner's budget call.

### biomes/cut, biomes/farside, biomes/godthrone, biomes/greenstep, biomes/highrift, biomes/k-guilin, biomes/nwouterwall, biomes/paintedhighlands, biomes/gills, biomes/godstep, biomes/neouterwall, biomes/loom-chasms, biomes/greatchasm, biomes/riftrim, biomes/galvanic, biomes/ehighlands
- Built and checked in software GL only: first GPU `verify.py --assert --all-views` is owed (cut KNOWN_ISSUES.md:7; farside :56; godthrone
  PLAN.md:20; greenstep KNOWN_ISSUES.md:3-5; highrift :8; k-guilin :45; nwouterwall :81; paintedhighlands :8; gills :5; godstep :5;
  neouterwall :7; loom-chasms :5,40; greatchasm :3; riftrim :3; galvanic :38; ehighlands :57). `[verify]` the rebuild's GPU pass is the first.
- STALE for those in check_stale_baseline (cut, farside, godthrone, greenstep, highrift, k-guilin, nwouterwall, godstep, neouterwall,
  greatchasm, riftrim, ehighlands). `[rebuild]`.

### biomes/dambasins
- The port/Hook/Ys pages take the probe change (KNOWN_ISSUES.md:27-31). `[rebuild]` those pages.

### biomes/eastabyss
- STALE (build.py, lakes). `[rebuild]`. Not re-exported to Godot with the BIO.dynamic movers (GODOT-PLAN.md:778-779). `[godot]`.

### biomes/ebadlands
- STALE (build.py, canyons, montane, tundra, waste). `[rebuild]`.
- `ksRelief` dashed contacts fix in `43-core-ground.js` reaches 439 pages: "for the all-builds rebuild" (KNOWN_ISSUES.md:150). `[code]` core/terrain.

### biomes/ehighlands
- `card.beech.southern` delivered 2026-11-23, not wired (core/materials/PLAN.md:2174). `[texture]`.

### biomes/firebliss
- STALE (build.py, east, glen, mons). `[rebuild]`. `rock.rhyolite.flowbanded` delivered, not wired (KNOWN_ISSUES.md:68; PLAN.md:2217). `[texture]` (also Korona).

### biomes/galvanic
- `acid` look into `W.LOOKS` only if a second kit wants it (PLAN.md:416-420). Not owed.
- `ground.sulfide.oxidised`, `rock.sphalerite` delivered, not wired (KNOWN_ISSUES.md:7,12; PLAN.md:2207). `[texture]`.

### biomes/geyser
- STALE (basin, corona, ice, puna, stills). 52b plume text moves the other takers (KNOWN_ISSUES.md:125-127). `[rebuild]`.
- `ground.travertine.white` re-pack before export (GODOT-PLAN.md:809). `[texture]` check packed.

### biomes/godshearth, biomes/hearths, biomes/korona, biomes/necanyons, biomes/nsemiarid (high), biomes/oidong, biomes/outlands, biomes/scablands (highline, highline-nw), biomes/wouterwall, biomes/hyperjungle (north, savage)
- STALE as recorded. `[rebuild]`. nsemiarid's column pass is done (KNOWN_ISSUES.md:6-9): rebuild only.
- oidong: `bark.carved.b` could alternate, not wired (KNOWN_ISSUES.md:27; HANDOFF-REBUILD.md:1224). `[texture]` optional.
- hyperjungle: `organic.comb.bee`, `bark.watcher`, `bark.bloodwood`, `bark.bamboo.bored`, `card.arum.carrion`, `card.bamboo.leaf`,
  `card.flower.hand`, `card.pod.skull` delivered, none in materials.json (core/materials/PLAN.md:2210; KNOWN_ISSUES.md:33,58). `[texture]`.
- outlands: `organic.tube.waxy` (PLAN.md:2219). `[texture]`. Godot export O9 later.
- hearths/godstep: `ground.warmsoil` ("the Hearth field", PLAN.md:2205) delivered, not wired: check which build. `[texture]`.

### biomes/labyrinth
- `card.birch.silver`, `surface.melon.rind` delivered, not wired (KNOWN_ISSUES.md:7). `[texture]`.
- Attach audit rod sampling parked (KNOWN_ISSUES.md:12-13; TODO.md:307). `[code]`.

### biomes/line
- Pages behind sources (the station's `open` flag; merges) (settlements/loj-twenny/KNOWN_ISSUES.md:6-7). `[rebuild]`.
- Six Rift-line sets delivered, not wired (`concrete.lining.segment`, `concrete.guideway`, `metal.plate.riveted.painted`, ...)
  (KNOWN_ISSUES.md:10-12; PLAN.md:55; core/materials/PLAN.md:2212). `[texture]`.

### biomes/loom-chasms
- `organic.cable.ironsilica` delivered, not wired (KNOWN_ISSUES.md:75-76). `[texture]`.

### biomes/greatchasm
- `ground.komatiite.pavement` delivered, not wired (KNOWN_ISSUES.md:72). `[texture]`.
- Ground at 15 units, some program at 16 (KNOWN_ISSUES.md:21): `[verify]` `samplers` FAIL when the opt-in goes to "*".

### biomes/neouterwall
- `rock.skarn.banded`, `rock.pseudotachylite.mirror` delivered, not wired (KNOWN_ISSUES.md:12,16; core/materials/PLAN.md:2206). `[texture]`.

### biomes/nhighlands
- STALE (build.py, alpine, bogs, foothills, montane). `[rebuild]`. `card.epiphyte.garden` not in materials.json (HANDOFF-REBUILD.md:1223). `[texture]`.
- Godot world-nhighlands re-export after the rebuild. `[godot]`.

### biomes/nwbay
- STALE (build.py, caverns). Limestone caverns "at its next rebuild" (PLAN.md:47-50): done on its catch-up branch, so `[rebuild]`.
  Not re-exported to Godot (GODOT-PLAN.md:779). `[godot]`.

### biomes/nwlowlands, biomes/swlowlands
- STALE. Budget lines ride along (swlowlands 12M -> 15M, nwlowlands ~9.6M -> ~12.6M) (HANDOFF-REBUILD.md:1382). `[code]`.
- swlowlands: swbay's receiver rows (mangrove, coastoak) not wired, "want a swbay rebuild" (KNOWN_ISSUES.md:205). `[code]`.

### biomes/opalvalley
- STALE build.py. KSTRATA opal recipes into core `RECIPES`, drop the kit's `KSTRATA.add` (KNOWN_ISSUES.md:28-29; TODO.md:319). `[code]` all pages on 35.
- `ground.sinter.opaline`, `rock.opal.matrix`, `card.leaf.photonic` delivered, not wired (KNOWN_ISSUES.md:6-11). `[texture]`.
- `r682`'s stale `to` (KNOWN_ISSUES.md:23). `[data]` scale model.

### biomes/rheolith
- Host stations' baselines untouched "until each host station's ride-along pass" (PLAN.md:25,444-447). `[code]` per-host adoption: owner's call.

### biomes/rift
- STALE (build.py, highland, jungle, maze, plateau, savannah). `[rebuild]`. `rock.gypsum.bedded` delivered (wired only in ledge),
  owed here (KNOWN_ISSUES.md:100). `[texture]`. Godot `rift` case re-export. `[godot]`.

### biomes/ringisles
- STALE (build.py, high, lagoon). `stone.geode.druze` not taken (HANDOFF-REBUILD.md:1222; not in materials.json). `[texture]`.

### biomes/sedesert
- STALE (build.py, bowl, mantis, steppe). `55` readers (shade, verge, catch x4, eastabyss x2, korona gorge/trench, ringisles x2, isle demo)
  not rebuilt (KNOWN_ISSUES.md:28-29). `[rebuild]`. The Bowl at 15 of 16 units (`rainCover:false`) (KNOWN_ISSUES.md:24-27): `[verify]` samplers warns.
- Godot world-sedesert, world-sedesert-falls (M4 must-pass) re-export. `[godot]`.

### biomes/shighlands
- STALE (conifers, fellfield). `bark.banded.ring`, `card.begonia.escargot` pre-wired, awaiting the rebuild (KNOWN_ISSUES.md:11-13). `[rebuild]`.
- `card.heath.whorl` delivered, not wired (core/materials/PLAN.md:2211). `[texture]`.

### biomes/siphon-pits
- Mist colour of its own (`atmFogMistC`) in core/atmos (KNOWN_ISSUES.md:15-19; TODO.md:353). `[code]` every biome page.
- Fauna Köppen Cwb/Dsc (KNOWN_ISSUES.md:69-70). `[code]` kits/fauna.
- Three sets delivered, not wired (KNOWN_ISSUES.md:5; PLAN.md:2221). `[texture]`.

### biomes/slabfields
- `ground.travertine.white`, lake marl, `ground.lava.crust` into the kit's pack move station 1's page: ride-along (KNOWN_ISSUES.md:24-26,41-42). `[texture]`.

### biomes/swbay
- Builders' attach fix: Voth, ringisles, swlowlands, isle demo change at their next rebuild (KNOWN_ISSUES.md:38-39). `[rebuild]`.

### biomes/swhighlands
- STALE (build.py, caverns, coast, pillars, pillars --preview span, rainwall, span, treeline). `[rebuild]`.

### biomes/throne
- Rebuilt 2026-11-02; HANDOFF-FLORA-REPORT.md:51 found stale pages on main then: check the station pages against check_stale. `[check]`.

### biomes/tiers
- Three sets now in the library (checked) but `materials.json` still has them under `owed` (KNOWN_ISSUES.md:5-11: set `lib` to the owed id,
  `check_cells.py --fix`, `pack.py`, `tools/build.py biomes/tiers --stations`). `[texture]` no.
- Village/camp stand-ins until kits/coyote's bundle (KNOWN_ISSUES.md:46,119). blocked: coyote C9. GPU verify owed (biomes/README.md:46).

### biomes/twins
- STALE (build.py and six stations). KSTRATA `obsidian` recipe owed to core (KNOWN_ISSUES.md:8-10; TODO.md:137). `[code]` all pages on 35.

### biomes/xanadu
- STALE (build.py, cloud, descent, floor, gills, ranges). Stage 8 (KGROUND) only (STACK-PLAN.md:97); `xanadu-floor` at 79% of its cap. `[rebuild]`.

---

## openworld

### openworld/isle-demo
- STALE build.py; on the catalog list; reads settlements/isle-demo's DRAW in place (KNOWN_ISSUES.md:62-63 there). `[rebuild]`.
- Headless SwiftShader verify fails on this machine (KNOWN_ISSUES.md:95-102). `[verify]` GPU lane only.

### openworld/iziz-cluster
- STALE build.py. Overlay list in `core/world/41-world-fields.js`, then drop the shim in `47` (KNOWN_ISSUES.md:22; PLAN.md:41; TODO.md:248). `[code]`.

### openworld/oidong-highrift
- STALE build.py. Godot M7/M8/M9 case `world-oidong-highrift`: re-export and rerun `oidong_world_test.gd` after the rebuild (GODOT-PLAN.md:935-937). `[godot]`.

### openworld/pinnacle
- STALE build.py. Takes Pinnacle Rock's recut stamp (ALL-BUILDS-REBUILD-PLAN.md:898). `[data]` blocked.

### openworld/xanadu-lake-shore, openworld/xanadu-north-shore
- `relief.micro: 2`; streams, sites, resources re-baked; lake towns' `bake_towns.py` entries re-fitted (STACK-PLAN.md:67-68,189-190). `[data]`
  blocked: the owner's word on the relief bias (BUILD-PLAN.md:106,129-130: v2's mean bias fails its gate). north-shore STALE.
- XP1 / XP4 Godot exports after Stage 8 (STACK-PLAN.md:197,200). `[godot]` blocked: Stage 8.

### openworld/xanadu-oidong-highrift
- STALE build.py. Small-islands check: `lf_pleasure_dome_isle` must sit within 10 m of the Erewhon page's island (`verify.py:88-90`); the model
  moved it to ~841,1507.6 (`tools/scale-model/tests/test_smodel.py:681`) while Erewhon is still at 805. `[verify]` expected FAIL until the region
  recut and Erewhon's re-seat. blocked: region recut.
- core/world `xanadu` style (KNOWN_ISSUES.md:42-45; TODO.md:284). `[code]`.
- Gihon's customs house and the 88g works keys draw when `extra/` folds (KNOWN_ISSUES.md:31-33). `[code]` kit.
- Landing river dry; Alph hamlets `road:false` (KNOWN_ISSUES.md:21-30). `[data]` blocked: scale-model queue, then rebake.
- 8.5 MB `tex.xanadu.js` sidecar could grow 5-7 MB with glazed families (STACK-PLAN.md:116-120). `[verify]` budgets: promote only within hero distance.
- `relief.micro: 2` and re-bakes (STACK-PLAN.md:69). `[data]` blocked: relief decision. Tubes not in Godot (KNOWN_ISSUES.md:18).

---

## core

### core/atmos
- Mist colour (siphon-pits) (TODO.md:353). SKY-PLAN steps ride one all-builds rebuild each (SKY-PLAN.md:374). `[code]`.

### core/biome
- stemClump leak fixed (e8df733d): pages behind. `BIO.geo.ribbon` default flip parked for the all-builds rebuild (BACKPORT.md:100). `[code]`.
- Fewer shader programs (TODO.md:289-301). `[code]`.

### core/catalog, core/furnish, core/engine
- Hem rule / decals (TODO.md:100-118). Run `core/furnish/fingerprint.py`, `core/engine/fingerprint.py`; rewrite `core/engine/fingerprint.json`
  (TODO.md:379-381). `[code]`.

### core/charactermodels
- `dist/pieces/` not built in this checkout: Longsong's dressed check and `dist/kchar/` sidecars need it (settlements/longsong/README.md:106-107). blocked.
- `peoples.json` Sphere 27 lineages (CROOK-RIA-SCOPE.md:85-88). `[code]` reaches Longsong's 5 pages.
- Godot `kchar_test.gd`: one known failure (the giant on the ladder) (HANDOFF-GARMENT-DEFECTS.md:116). `[godot]` expected.

### core/drawn
- Water audit, cliff gate, attach audit take core/drawn at the next all-builds rebuild (README.md:17). `[code]`.

### core/export, core/water
- Pans and ice get an extent and probes in the tiler: "waits for the all-builds rebuild" (core/water/README.md:576-578). `[code]`.
- `drawFlow` cache key (TODO.md:326); breakup by default is source-done (TODO.md:399 now stale text; PRACTICE.md:54). `[code]`/`[rebuild]`.
- `test-gaps.js` "neutral by default" fails pre-existing (HANDOFF-REBUILD.md:160). `[verify]` expected.

### core/hamlet, core/camp
- Fold `xanadu/23-hamlet-xanadu-row.js` (README.md:43-46; xanadu/README.md:6-7), `shumari/25-hamlet-shumari.js` (shumari/README.md:7),
  Kirstabal's fishingRow (TODO.md:140), the work camp (TODO.md:228) into `20-hamlet-cultures.js`; lizardmen row optional (gila PLAN.md:42). `[code]` ~56 builds.

### core/host
- `KEYS` joins `SHELL` at an all-builds rebuild (README.md:31,206). `[code]`. Walker/pick underground (TODO.md:203). `[code]`.
- A file added under core/host marks ~90 builds stale (README.md:23): keep new host files out of it.

### core/materials
- 2026-11-12 (63 sets) and 2026-11-23 (13 sets) deliveries: "None is wired yet: each build takes its slot at the all-builds rebuild"
  (PLAN.md:2163-2177,2190-2222; TODO.md:78-88). `[texture]` per build above. `ground.paddy.wet`, `metal.gilt.leaf`, `inlay.opal` are NOT in the library.
- `patterns/common/grime-streaks` not wired anywhere (GODOT-PLAN.md:812). Not Stage 8.

### core/region
- MULTI-KIT-SCOPE fragments and sidecars held for the all-builds rebuild (TODO.md:94). `[code]` blocked: owner.

### core/simulation
- `vessel`/`vehicle` rollout (LIZARDMEN-CENSUS.md:186-190; TODO.md:126). `[code]`. Dhelv, Mungo, Shade, Voth, core examples behind (BUGS-2026-11-15.md:482).

### core/tags
- Cultures to fold (see the global list) and `vessel`/`vehicle` already in the vocab (TODO.md:128): every page inlining core/tags moves. `[code]`.

### core/terrain
- Ground shader env-map rename (TODO.md:96-99); `ksRelief` (ebadlands); KSTRATA `obsidian` (twins) and opal recipes (opalvalley). `[code]`.
- `test-lava.js`, `test-scarp.js` goldens fail on float last bits (HANDOFF-REBUILD.md:159). `[verify]` expected; rewrite only on the owning machine.

### core/world
- Fold `41t`/`41l` into `41` (README.md:109-110; TODO.md:223); overlay list (TODO.md:248); `xanadu` style (TODO.md:284); site planner
  tent camp (TODO.md:239); the xanadu village change "lands with the all-builds rebuild" (settlements/xanadu/HAMLETS-PLAN.md:103-104). `[code]`.

### repo: .codex/hooks.json
- SessionStart hook runs `C:\Users\travi\Documents\krator-master\.claude\worktrees\eager-babbage-31ce37\.codex\hooks\session-start.sh`
  (`.codex/hooks.json:8`); `.codex/hooks/session-start.sh` exists in the repo. `[code]` make it repo-relative. blocked: confirm Codex runs
  hook commands from the repo root.

### tools/scale-model
- `test_smodel.py`: 2 known failures (NE outer wall station bases) (settlements/azure-dream/PLAN.md:150). `[verify]` expected.

---

## godot

- Every `godot/data` case whose page moves goes stale with the rebuild: characters, dhelv, girder, hyperjungle, isle, iziz, kits, qiblai, rift,
  sedesert, sky, strongbow, verge, world-eternian, world-isle-kautoa, world-isle-valapo, world-iziz, world-lod, world-longsong, world-nhighlands,
  world-oidong-highrift, world-pylon, world-sedesert, world-sedesert-falls, world-talia, world-yuni, yuni (directory list). `[godot]` re-export
  (`godot/tools/export_spike.py`, `tools/harness.py export`, the verify `--export` cases: godot/README.md:255-285), then the nightly Godot tests.
  The must-pass set: sedesert tile, Iziz district, isle demo towns (GODOT-PLAN.md:939). blocked: the pages rebuilt; Longsong's on charactermodels pieces.
- Re-packs before an export: geyser `ground.travertine.white`, fauna `hide.sleek`, islanders storyboard/gable (GODOT-PLAN.md:802-814). Families
  wired in materials.json; check `pack.py --check`.
- Not re-exported with BIO.dynamic: eastabyss, Shade, nwbay (GODOT-PLAN.md:778-780).
- Xanadu in Godot is XP1-XP6 after Stage 8 (STACK-PLAN.md:193-202, section 7); `tools/check_godot_exports.py` is named there but does not exist on
  this line (checked). blocked: Stage 8, Erewhon re-seat, the stack branch.
- Exports owed but not Stage 8: loj-twenny, kits/tungang T10, settlements/qiblai Q7g, thalaba, blakhed, azure-dream AD8, viridian V8,
  jimjam P5, shumar, kits/yeti Y7, kits/coyote C9, biomes/line L6, biomes/outlands O9, biomes/tiers T6, kits/ancients Sanctum/Heirs.

---

## Known verify failures the rebuild should NOT try to fix (pre-existing, owner-accepted or owner's call)

1. settlements/voth `voth-city`: two known failures, the embassies (Hykkousoi, Iziz, Jimjam, Republic) and the Arena not walkable (HANDOFF.md:27-29).
2. settlements/longsong (XAK): draw-call OVER and one FAIL, the stale interiors bake (settlements/xanadu/KNOWN_ISSUES.md:87).
3. settlements/xanadu sheet: the biome's triangle budget OVER (KNOWN_ISSUES.md:85); iziz Overview 923 > 900 draw calls (iziz KNOWN_ISSUES.md:489): warnings.
4. settlements/dalab: `instance-cap` swlowlands/glossy (KNOWN_ISSUES.md:170): owner's call.
5. biomes/crater-drylands: `instance-cap` craterdry/bloom (KNOWN_ISSUES.md:140): owner's budget call.
6. settlements/mavs-refuge: `walk-and-reach` 86 floors (KNOWN_ISSUES.md:171).
7. settlements/ys kit sheet: conch house hall spots (HANDOFF.md:64).
8. settlements/locus sheets: `one-key-map` (KNOWN_ISSUES.md:143): a small fix exists; leave unless the rebuild takes it.
9. biomes/ancientsvalley on software GL: shell bake link failures; GPU lanes pass (KNOWN_ISSUES.md:230).
10. openworld/isle-demo headless SwiftShader verify fails on this machine (KNOWN_ISSUES.md:95).
11. openworld/xanadu-oidong-highrift small-islands check while Erewhon sits at 805 (verify.py:88-90): waits on the recut.
12. kits/interiors `--sets --assert` residence failures from kits/tents' WIP set (KNOWN_ISSUES.md:35-36); `xa_workshop` counter
    (settlements/xanadu/citadel/PLEASURE-DOME.md:107).
13. core/charactermodels Godot `kchar_test.gd`: the giant on the ladder (HANDOFF-GARMENT-DEFECTS.md:116).
14. tools/scale-model `test_smodel.py`: 2 failures, NE outer wall station bases (azure-dream PLAN.md:150).
15. test_all pre-existing: `core/terrain/test-lava.js`, `test-scarp.js` goldens; `core/water/test-gaps.js` "neutral by default"
    (HANDOFF-REBUILD.md:159-160); isle-demo and kits/interiors node tests need LFS pulls (:157-158).
16. biomes/godthrone: the generic card negative cannot fail on a page with no cards (KNOWN_ISSUES.md:95): a check gap, not a page fault.
