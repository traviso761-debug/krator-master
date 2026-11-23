# Stage 8: the ride-along list (verified against claude/integration-4 at cf7e849a2, 2026-11-23)

Read-only survey. Every status was checked against the line's code with grep and git, not taken from the docs. Reach counts come from
`python tools/reach.py <file>` on this checkout ("N cmds / M pages"). `vstack` means `freeze/vertical-stack-1123` (d636c78c4), which merges
before Stage 8. Status key: OPEN (nothing done), PARTLY (source landed, pages or a sub-step still owed), DONE (evidence cited).

"When" column:
- **pre-core**: a shared-file edit made before the core wave (before any page is rebuilt), so each page moves only once.
- **with build X**: done in that build's own turn.
- **post**: after the rebuild (baselines, fingerprints, ratchets written from rebuilt pages).

---

## Source 1: TODO.md, "Ride along with the next all-builds rebuild" (lines 76-462)

| id | item | files to edit (lines) | reaches | when | status + evidence | owner questions |
|---|---|---|---|---|---|---|
| T1 | Wire the Codex texture sets (11-12, 11-16/17, 11-23) | each build's `materials.json`, then `tools/textures/pack.py <build>`; demo-kit look | per build (the list at the end) | with each build | **OPEN**: 4 of 63 (11-12) wired in their target build, 0 of 13 (11-23), 0 of 21 (11-16/17). Details in "Texture wiring" below | Two sets were wired in a different build than their prompt named (`rock.gypsum.bedded` in Ledge, not the rift maze; `rock.hewn.drillmarked` in Ledge and Shelf, not Tungang). Wire them in the named build too? Do you judge each set in the demo kit, or should the rebuild session? |
| T2 | All-51-settlements (60-target) rebuild and continental-scope pass: re-anchor the cuts, frame turns, the systemic buildings | `settlements/ALL-BUILDS-REBUILD-PLAN.md` (933 lines) drives about 51 settlement folders | all settlements | its own wave, after the core wave | **OPEN** (a plan; nothing done) | It is a project in itself, not a ride-along. Inside Stage 8, or a Stage 9? |
| T3 | Wire the multi-kit fragments into settlement builds (`core/kits/10-core-kits.js`, `core/city/42-city-multikit.js`, `53-city-host-multikit.js`, `core/region/47s-region-styles.js`, `tools/kit_pack.py --sidecars`) | each settlement `build.py` `CITY_JS` / `CITY_DATA_JS` / `REGION_JS` | `10-core-kits.js` 0 cmds today; `42-city-multikit.js` only through a folder glob (pher, ancients `--target theodiga-today`) | with each settlement | **OPEN**: no `build.py` names any of them explicitly (only `tools/kit_pack.py`) | Which settlements are cosmopolitan (take the sidecars)? |
| T4 | Add `cflit_qbon`, `yonni`, `hush_kin` to `peoples.json`; `node core/charactermodels/test-rig.js`; `godot/tools/sync_core.py` | `core/charactermodels/data/peoples.json` | 1 cmd / 5 pages (Longsong) | with Longsong | **OPEN**: 0 matches | - |
| T5 | Ground shader locals `v1 v2 v3`, `r1 r2 r3` clash with three r128's env-map `#define`s: rename to `kgV1...`/`kgR1...`; drop the `#undef` guard | `core/terrain/43-core-ground.js:100` (`kgTri(... out vec2 v1, v2, v3)`) and the hex sampler; `core/terrain/host/39i-core-cavern-rock.js:29-30` | 299 cmds / 534 pages | pre-core, **after vstack merges** (vstack edits `43-core-ground.js`: the `kgA0` weight guards) | **OPEN**: no `kgV1`; guard still at 39i:29 | - |
| T6 | Catalog hem rule (`FURN_HEM`), `hung:`, decal pictures; engine `FURNISH_WALL` | sources are in: `core/catalog/krator-furniture-core.js:349-358, 556`, `core/engine/91f-furnish.js`; kits call it (islanders 42/62/66, lizardmen 50, scyvoi 46, isle-demo `bundles.py`) | catalog core 108 cmds / 452 pages; `91f-furnish.js` 34 / 129 | source done; pages in the core wave; then `pack.py kits/catalog` for the 10 decals | **PARTLY**: `claude/dreamy-turing-3902d7` is an ancestor of HEAD; no page rebuilt. The 10 decal pictures are delivered (`core/materials/patterns/xanadu/*`, `common/suzani-roundels*`) but `kits/catalog/tex/` has no `decal.*` file: run `pack.py kits/catalog` | `core/engine/fingerprint.py` and `core/furnish/fingerprint.py` will move on purpose (Islanders, Scyvoi, Lizardmen): read, then write |
| T7 | Xanadu opt-in pieces into `src/` (88c caravanserai, 88d lakecraft, 88e stall, 88f harbour, 88h mine-works; 69dz into `kits/interiors/sets/xanadu.js`); sheet rows; drop from `settlements/pher/kit.json` `"external"` | `kits/xanadu/extra/*` -> `kits/xanadu/src/`; `kits/interiors/sets/xanadu.js`; `settlements/pher/kit.json` | `kits/xanadu/xanadu.py` 27 cmds / 133 pages; `sets/xanadu.js` 67 / 367 | pre-core (kits wave, before the Xanadu pages) | **OPEN**: all still in `extra/` (src has none of 88c-h) | `extra/` also holds `88g-xa-works.js` and **two files numbered 88h** (`88h-xa-gihon.js`, `88h-xa-mine-works.js`): move 88g and the Gihon piece too? Renumber one 88h |
| T8 | Register culture `coyote` (`CULTURE_NAMES`, `test-tags.js` digest; `FURN_CULTURES` once the catalog file exists) | `core/tags/52-core-tags-vocab.js` (~line 38-45) | 407 cmds / 983 pages | pre-core (one vocab edit with T11, T22, T24, T27) | **OPEN**: no `'coyote'`; `kits/coyote/KNOWN_ISSUES.md:3` still open; no catalog culture file | - |
| T9 | `vessel` and `vehicle` classes: register Ring Sea, Xanadu lake craft, Motor Vehicles and Mechs through core/tags; engine walkable deck hooks for `cls === 'vessel'`; drop `class:'motor vehicle'` | `kits/ringsea/src/*` (no KTAGS call), `kits/xanadu/extra/88d,88f` (with T7), `core/engine/36s-stair.js`, `37-wk-rec.js`, `kits/motor-vehicles/krator-vehicles-*.js` (23 defs with `class: 'motor vehicle'`), `kits/mechs` | vocab 983 pages; ringsea 7 cmds / 52; motor vehicles 18 / 56; mechs 8 / 28 | vocab done; kits in the kits wave | **PARTLY**: classes in the vocab (52:74-78); lizardmen barges register; Ring Sea, vehicles, mechs and the engine hooks not (0 grep hits) | - |
| T10 | KSTRATA recipe `obsidian` for the Twins | `core/terrain/35-core-strata.js` | 217 cmds / 355 pages | pre-core | **PARTLY**: `obsidian-pancake` (with an `obsidian` kind) landed in e1cb09214 (35:294); the Twins still draw `tibasalt` (`biomes/twins/src/84-host-ground.js:67`, `99-host-take.js:43`) | Is `obsidian-pancake` the Twins' recipe, or a separate `obsidian`? |
| T11 | core/hamlet Xanadu row's fishing works into the row; `87k-xa-lake-trades.js` into `xanadu.py` FILES | `core/hamlet/20-hamlet-cultures.js:58-`; `settlements/kirstabal/src/42-ks-ring.js:30` (`fishingRow`); `kits/xanadu/xanadu.py` | 36 cmds / 159 pages | pre-core | **OPEN**: Kirstabal still builds `fishingRow` itself | Should every Xanadu page take the lake trades? |
| T12 | Fold `core/hamlet/xanadu/23-hamlet-xanadu-row.js` into `20-hamlet-cultures.js`; drop the subfolder | as named | 36 / 159 | pre-core, with T11 | **OPEN**: subfolder present | Does the shared row take the shrine and the mine head? (Turning them on moves every Xanadu village) |
| T13 | Lake trades' interior set to `kits/interiors/sets/xanadu-lake.js`; Kirstabal via `kit.json` "interiorSets" | `kits/xanadu/src/87k1-xa-lake-rooms.js` -> new set file | interiors sheet + Kirstabal | kits wave (`kits/interiors` before `ancients-interiors`) | **OPEN**: no `sets/xanadu-lake.js` | - |
| T14 | A new file in `tools/` stales eight builds | `tools/build.py` / `buildlib` | 8 builds | none (tools) | **DONE in tools**: `tools/build.py:75` writes `listed_by: 'code'` and `check_stale.py:157` trusts only those; manifests written before 11-15 still record `listings: ['tools']` (`kits/crops/build-inputs.json`), which the rebuild rewrites | - |
| T15 | Switch on checks 22-31 everywhere (`tools/checks_optin.json` lists to `"*"`), in seven steps | `tools/checks_optin.json`; see sub-rows C1-C7 | every build | post (step 1 needs `--all` done; then 2-7) | **OPEN**: lists hold 31/18/31/30/31 builds, none `"*"` | See C1-C7 |
| T16 | KHOOK clones re-run layers (tag the composed hook `__khst`, copy layers by name) | `core/shader/06-core-khook.js:72,81`; about 40 clone sites | 408 cmds / 1000 pages | pre-core | **OPEN**: no `__khst` | - |
| T17 | Ground shader inlines the eye twice: `K.EYE` and `kEye()` | `core/terrain/43-core-ground.js:199,223`, decl. near 333 | 299 / 534 | pre-core, with T5 | **OPEN**: 2 inline `viewMatrix[3].xyz*mat3(viewMatrix)`, 0 `kEye` | - |
| T18 | `BIO.alphaTex` `willReadFrequently` | `core/biome/30-core-foliage.js:112` and `:475` | 334 / 700 | pre-core | **PARTLY**: 112 done; 475 still `im.getContext('2d').getImageData` | - |
| T19 | Library-card mipmap fringes (fill texels under alpha 48 with the mean opaque colour) | `core/biome/20-core-kit.js` (`BIO.libSwap`, ~236-245), `core/materials/record/25-matlib-host.js:27` | 334 / 700 (and 25-matlib 409 / 1017) | pre-core | **OPEN**: no fill code | Overlaps vstack's B4 (`BIO.libSwap` alpha-fringe dilation): do it once |
| T20 | KKARST duplicate sink ids across levels | `core/terrain/39c-core-karst.js:184` (`'sink:'+si+','+sj`), `:207` | 26 / 26 | pre-core | **OPEN**: id has no level | - |
| T21 | The ISK error loop | `settlements/isle-demo/bundles.py:102` (`console.error('ISK: '+m)`), `core/engine/10-core.js:11` (re-entry guard) | engine 40 / 167; isle demo | pre-core | **OPEN** | - |
| T22 | In-page audits on the drawn ground (`KDRAWN.h`): water audit, cliff gate, attach audit | `core/water/ext/57-core-water-audit.js`, `core/biome/40-core-place.js` (`cliffOld`), `core/biome/20-core-kit.js` (`attachAudit`) | 228/400, 334/700 | pre-core | **OPEN**: 0 `KDRAWN` in all three | Overlaps vstack's B5 (`KDRAWN.h` audits) |
| T23 | core/host walker and pick underground (F on the floor below, stand, swept step, pin, inspector) | `core/host/90-host-camera.js`, `93-host-inspect.js` (done) | 388 cmds / 846 pages | core wave | **PARTLY**: source in (`feet.under`, `sweep` present); only the underground test page, the Hearths' camera station and Dhelv rebuilt | Then `core/walk/frame/95-walk-frame-host.js`'s own sweep can go (riding branch) |
| T24 | core/world: fold `41t-world-town-water.js` into 41 | `core/world/41-world-fields.js` (`buildTowns` 295, `W.water`), delete 41t | 41: 14 cmds / 93 pages; 41t 2 / 8 | core wave, **after vstack** (vstack rewrites 41: +466 lines) | **OPEN**: 41t present; vstack does not fold it | - |
| T25 | core/hamlet work camp: fold `core/hamlet/camp/26-hamlet-camp.js` into `30-hamlet-village.js`; pass `camp` through 48s; drop `xanadu-camp` | `core/hamlet/30-hamlet-village.js`, `core/world/48s-world-sites.js`, `openworld/oidong-highrift/src/48-world-site.js:23,27` | 36 / 159; 48s 6 / 26 | pre-core | **PARTLY**: the census side built opt-in (camp/26, its test); the fold and the 48s pass-through OPEN | - |
| T26 | Generic tent camp in the site planner (`KWCAMPS` into 48s/88s, `camps` with `kind: 'ring'|'halt'`; bake) | `core/world/48s-world-sites.js`, `88s-world-sites.js`; drop `openworld/xanadu-oidong-highrift/src/48t-world-camps.js`, `88t` | 6 / 26 | core wave, after vstack (vstack edits 48s and 88s) | **OPEN** | - |
| T27 | Tents kit sealed for another world (`kits/tents/tents_bundle.py`, like `XAK`) | new `kits/tents/tents_bundle.py`; 88t draws kit pieces | xanadu regions | kits wave | **OPEN**: no bundle | A Dalab dress for the Great Caravan, or keep `generic`? |
| T28 | A kit on several overlays (`k.overlay` a list); drop the iziz-cluster shim | `core/world/41-world-fields.js:100` (`k.overlay===...`; vstack line 225); `openworld/iziz-cluster/src/47-world-kits.js:30-33` | 14 / 93 | after vstack | **OPEN** (also in vstack) | - |
| T29 | Foliage guards' gaps: biome packs without `plants` | rerun `tools/textures/pack.py` for catch, crater-drylands, eastabyss, ebadlands, guilin, korona, necanyons, nwouterwall, rift, sedesert (+ bowl, mantis, steppe), swbay, swhighlands; Throne's own pack writer | those pages | with each biome | **PARTLY**: guards in core (`cardMute`, `insideOut`, segment audit); nsemiarid's pack has `plants`, the other 12 packs have 0 | - |
| T29b | nhighlands montane `lance` stems (151 of 207 > 0.15 m) | `biomes/nhighlands` lance clump | nhighlands montane | with nhighlands | **OPEN** (not checked by grep beyond the doc) | - |
| T29c | 14 crowns in `tools/check_cells_baseline.json` want stems measured | `card-bases.json`, `check_cells.py --fix` | ehighlands, nhighlands, rift | with each | **OPEN** (baselined) | - |
| T29d | Two proposed guards: albedo under soot; packed texture nothing samples | `BIO.guardChecks` (`core/biome/20-core-kit.js:714`) + negatives | 700 pages | pre-core | **OPEN**: no such checks | Write them now (they will fail pages for the first time)? |
| T30 | core/world `xanadu` style and palette; drop the region's `WORLD.ground` wrapper; re-bake `plan/sites.json` | `core/world/41-world-fields.js`; `openworld/xanadu-oidong-highrift/src/43-world-xoh.js:27-28` | 14 / 93 | after vstack | **PARTLY via vstack**: vstack's 41 has `'xanadu':['vale','xanadu']` and a `xanadu` palette (149) and `W.unstyled`; the wrapper is still in vstack's 43-world-xoh.js; re-bake owed | - |
| T31 | Fewer shader programs: key foliage on the hook's options, `KMAT.libKey` and world-UV numbers as uniforms | `core/biome/30-core-foliage.js:372` (`'biofol|'+kitKey`), `core/materials/record/25-matlib-host.js:75`, `core/materials/opt/69a-world-uv.js:20` | 700, 1017, 302 pages | pre-core | **OPEN** | Same work as vstack's B3 and K1: do it once, under one name |
| T32 | core/tags culture `qiblai` (and `NO_CATALOG`) | `core/tags/52-core-tags-vocab.js` | 983 pages | pre-core | **OPEN** | - |
| T33 | `BIO.attachAudit` point-to-segment for thin instanced items | `core/biome/20-core-kit.js:661-670` | 700 pages | core wave | **DONE in source**: `BIO.segDist` (618) used for instanced axes (670), 2026-11-15; pages take it at rebuild | - |
| T34 | core/tags culture `kimr`; drop the two lines in `kits/kimr/src/89-rows.js:7-9` | vocab + kimr | 983 pages | pre-core | **OPEN** | - |
| T35 | Opal Valley strata (`opal-rhyolite`, `opal-firetuff`) into `KSTRATA.RECIPES`; drop the kit's `KSTRATA.add` | `core/terrain/35-core-strata.js`; `biomes/opalvalley/src/40-biome-opal-sites.js:86`, `84-host-ground.js:18` | 217 / 355 | pre-core, with T10 | **OPEN** | Other kits add their own recipes at load too (arch, compasshills, doubledelta, drownlands, cut ...): fold them all? |
| T36 | Culture `glazier` into the vocabulary (`NO_CATALOG`); delete `core/tags/glazier/`; drop it from `kits/tungang/build.py:16,88-90` | as named | 983 pages | pre-core | **OPEN** | - |
| T37 | `WATER.drawFlow` program key leaves out its colours; drop arch's workaround | `core/water/51-core-water-kinds.js:85` (add `o.shallow`, `o.deep`, `o.color`); `biomes/arch/src/89w-host-water.js:19` | 329 cmds / 788 pages | pre-core, after vstack (vstack edits 51) | **OPEN** (not in vstack either) | - |
| T38 | Owed from the ccr-a96f22b6 merge: assembly (thalaba x2, pher MINSET + `_registered` clash; qiblai `_materials`; theodiga `_projectFire`/`onerror`; lightwall 7 clashes), stale (azure-dream walk clash, lightwall `89q5s` not deterministic, longsong), vendor (tungang `37-wk-rec.js`), views (ancients "The Pilgrims' Stair"), 41 `check_source` keys; not ratcheted: dep_graph for 6 builds, `test_bridges.py`, outposts test (8 places) | `settlements/thalaba/build.py` (0 hits for CORE_BIOME_MIN), `settlements/pher/build.py`, lightwall/qiblai builds, `kits/tungang/37-wk-rec.js`, `kits/ancients` view name, `openworld/outposts/tests/test-outposts.js` | those builds | with each build | **OPEN**: every key still in `tools/check_assembly_baseline.json`, `check_vendor_baseline.json`, `check_views_baseline.json`; dep_graph/bridges/outposts not run here | - |
| T39 | `kits/fauna/krator-fauna-xeno.js:26` `o.stock || 1`; drop its baseline key | line 26 | 42 cmds / 144 pages | pre-core | **OPEN**: still `kS = o.stock || 1`; key in baseline | - |
| T40 | Rebuild `settlements/longsong` (behind kits/crops; needs `core/charactermodels/dist/pieces/`) | none | 1 cmd / 5 pages | with Longsong, after charactermodels builds | **OPEN**: `settlements/longsong: STALE build.py` in `check_stale_baseline.json`; page 11-22, kits/crops 11-23 | Are the garment branch's 112 outfit pieces published now? |
| T41 | core/atmos mist colour (`atmFogMistC`, `heightFog.mist.colour`); drop siphon-pits' per-frame tint | `core/atmos/sky/89-atmos-j-fog.js` (`cM = fc`), `core/atmos/host/89-atmos-j-heightfog.js`; `biomes/siphon-pits/src/89b-host-steam.js` | 264 / 463 | pre-core | **OPEN**: 0 hits | - |
| T42 | Köppen vocabulary lacks Cwb, Dsc; then Ghaunt-Ox Cwb, Flenser-Hound Dsc | `kits/fauna/fauna-core.js:76`; `krator-fauna-xeno.js` | 42 / 144 | pre-core, with T39 | **OPEN** | - |
| T43 | Ice record has no `levelAt`; drop the polynya's line | `core/water/ext/54-core-water-kinds-ext.js` (or `ext/60:20` read `S.level`); `biomes/siphon-pits/stations/polynya/89wp-host-polynya.js` | 54: 71/91; 60: 206/346 | pre-core | **OPEN**: no `levelAt` in ext/54 | - |
| T44 | `KSHADOW.units` counts what the GPU links; move `samplersOf` to core, cap min(16, GL), drop copies | `core/shadow/host/12-core-shadow-host.js` (done: `units`, `maxUnits` 129); pasted `samplersOf` in 22 biome kits (arachnoids, arch, catch, compasshills, crook, cut, doubledelta, drownlands, galvanic, geyser, highrift, nhighlands, opalvalley, paintedhighlands, rheolith, ringisles, shighlands, siphon-pits, slabfields, spiderlake, swhighlands, throne) | those kits | with each biome; C5 replaces it | **PARTLY**: core done 11-09; about 15 kits still carry a full private copy (`THREE.ShaderLib[LIBOF...]`), the rest a one-line wrapper | - |
| T45 | Two `||` numeric defaults (`core/furnish/50-core-furnish.js:65`, `settlements/yuni/src/76-doors.js:180`) | - | - | - | **DONE**: 65 reads `rec.scale == null ? 1 : rec.scale`; 180 uses `d.y==null?0:d.y` etc. (daa7229f7). Delete the TODO entry | - |
| T46 | `core/engine/fingerprint.json` behind core/engine | `--write` after the engine kits' shots | 34-40 cmds | post | **PARTLY**: rewritten 2026-11-17 (3e6c9e134, after the 11-10 note); T6's `FURNISH_WALL` and T9's engine hooks will move Islanders, Scyvoi, Lizardmen again | - |
| T47 | Fauna runtime and bison table | - | - | - | **DONE** (taken by the second integration pass, HANDOFF-REBUILD.md line 90-92); entry still in TODO: delete it | - |
| T48 | `dalab` sockets culture pack | `core/sockets/80-cultures.js` | - | - | **DONE**: `key:'dalab'` present; taken by pass 2. Left: Span passes `culture:'dalab'` (`settlements/span/src/8at-host-place.js`) - check at Span's turn | - |
| T49 | Water breakup on by default | `core/water/ext/56-core-water-breakup.js:62` | - | - | **DONE**: `W.BREAKUP_AUTO=true`; entry still in TODO: delete it | - |
| T50 | Succulent columns' quality pass | - | - | - | **DONE** (struck through, 2026-11-09/10) | - |
| T51 | Doors and glass, what is left: open-world hamlets bake leaves shut; Locus 32 floors behind locked doors; Mav's 86 apartments unreached and the first-walk freeze; Yuni's 1.4 rad swing; Beast Riders' town copies draw leaves shut; isle demo export lacks doors | `kits/beast-riders/src/55-arch.js`, `56-levels.js`; `settlements/locus/src/66-locus-furnish.js`; `settlements/mavs-refuge/src/83-mr-walk.js`; `core/world` hamlets | those builds | with each build | **OPEN** (residuals; not tied to the shared rebuild) | Yuni's swing: keep 1.4 rad or move to 1.75? |
| T52 | Vertical-stack's flow foam without blocks (`wtrBreak`, `WATER.breakNoise`, `slopeV`, `slopeWin`) | `core/water/51-core-water-kinds.js` (arrives with vstack) | 329 cmds / 788 pages (TODO says 149 cmds) | core wave, after vstack | **OPEN on the line** (0 hits); **present in vstack** (3 hits; `claude/exciting-curie-1c0022` is in vstack); Godot twin port owed | - |

### Other TODO items that wait for the rebuild (outside the ride-along section)

| id | item | files | reaches | when | status | owner questions |
|---|---|---|---|---|---|---|
| O1 | Audio Lab `||` defaults (147) and its catalogue test (68 clips in missing categories, clips without sources) | `core/audio/tools/soundtrack_engine_code.js` (207 `|| n` matches; baseline 145), `core/audio/26-core-audio-music.js:550`, `core/audio/lab/serve_local.js:9`; `core/audio/data/categories.json` | audio lab, no page | any time (audio session) | **OPEN**: none of `sfx.interface`, `sfx.impact`, `music.motif`, `sfx.voice`, `mus.loop`, `sfx.env` in categories.json | The Audio Lab's call: add the categories or remap? |
| O2 | NE wall "arrow shafts" craft rule | `core/hamlet/10-hamlet-wood.js:19` | 36 / 159 | done; pages take it | **DONE in source**: `'arrow shaft'` in the craft rule (41781c2d6, the Marr commit); `indexOf` matches the plural. Delete the TODO entry | - |
| O3 | Scale-model station heights: garnet 2,810 m vs ground 3,352; vitreous 2,950 vs 4,004 | `biomes/neouterwall/region/station-garnet.json`, `station-vitreous.json` (`site.base`) | NE wall pages; `test_smodel.py` section 5 | before the scale-model test in the nightly | **OPEN**: bases still 2810.1 and 2950.1 | Restate from the model, or carve the model to them? |
| O4 | `edit_522`/`edit_523` downstream: firebliss, strongwall, thalaba ride along | rebuild only | 3 builds | with those builds | **OPEN** (rebuild) | - |
| O5 | "With the final biome rebuild": place the garrison's arms (`'arms'` in `FURN_CULTURES` + military rooms) | each build's `FURN_CULTURES`; `kits/interiors/sets/highlands.js`, `iziz.js`, `zeijani.js`; Iziz palace; `kits/eternian/src/61-et-defence.js` | catalog-taking builds | with each build | **PARTLY**: only the new builds take `'arms'` (dzagh-vardzi, shumari, yonni, shumar, urundashi) | In Stage 8, or the biome rebuild? |
| O6 | Old fungoid flora onto `BIO.fung` | `bracket()` copies left in eastabyss, hyperjungle, nwlowlands, rift, swlowlands `65-*-dress.js`, oidong 50/55; the Throne's `cap`, `capTube`, `bladders`; ringisles `crust`; rift/xanadu `stalk` | those biomes | with each biome | **PARTLY** (nhighlands, nwbay, swbay, ebadlands done) | - |
| O7 | Real doors and glass across the kits (Pylon's `pylDoorway`, Talia's arches, the other kits' dark voids) | as in TODO 477-490 | those kits | with each kit | **OPEN** | - |

### Culture ids patched at load, not in the TODO (found here)

`kits/dasri/src/52d-ds-tags.js` (`dasri`), `kits/ria/src/70-ra-vocab.js` (`ria`), `kits/yonni/src/53a-yn-vocab.js` (`yonni`) each push a culture into `KTAGS.VOCAB` at load, as kimr and glazier do. **OPEN**: fold all five (plus coyote and qiblai) into `core/tags/52-core-tags-vocab.js` in one edit (407 cmds / 983 pages), then drop the patches. Owner: confirm the display names ("Dasri", "Ria Dynasty", "Yonni Spear-Queens") and which have no catalog file (`NO_CATALOG`).

---

## Source 2: CORE-IMPROVEMENTS.md

### Items 22-31 (the opt-in checks), the switch-on (TODO step order)

| id | item | files | reaches | when | status + evidence | owner questions |
|---|---|---|---|---|---|---|
| C22 | `gpu-renderer` hard fail on a lane without `KRATOR_GL=gpu` | `tools/harness.py` | all verifies | - | **DONE**, on for every build | - |
| C23 | LFS pointers (`lfs_needs.py`) | `tools/lfs_needs.py` | - | step 1 | **DONE** (tool); use it per build in the fresh worktree | - |
| C24 | DOCS-ONLY in `check_stale` | `tools/check_stale.py` | - | - | **DONE** | - |
| C1 | Step 1: `tools/build.py --all` (+ stations, + the non-`build_dirs()` targets), then `check_stale.py --write-baseline` -> `{}` | - | all | first | **OPEN**: `tools/check_stale_baseline.json` has 237 keys (177 biomes, 31 settlements, 23 kits, 6 openworld) | - |
| C2 (item 30, `names`) | Rename the view names with an apostrophe (100) or a colon (39); rebuild those; `check_views --write-baseline`; `names: "*"` | the builds in `tools/check_views_baseline.json` (139 keys) | those builds | with each build, then post | **OPEN**: 31 builds opted in | - |
| C3 (item 25, `recorded`) | `buildlib.through_tools_build(__file__)` at the top of every `build.py`; `recorded: "*"` | 191 `build.py` files; 41 have it | all | pre-core (tools edit, no page moves) | **OPEN**: 150 to add | - |
| C4 (item 26, `minset`) | `minset: "*"`, extend MINSET pages from `buildlib.CORE_BIOME_MIN` | thalaba (2 pages), pher (6 MINSET keys in the assembly baseline) | biome-core pages | with each build | **OPEN**: 18 opted in | - |
| C5 (items 27-28, `samplers`, `drawn-ground`) | `"*"`, then `harness.py ratchet --write <page>` per rebuilt page on a GPU lane | `tools/verify_ratchet.json` | every verified page | post, on the GPU lanes | **OPEN**: 31/30 opted in. Replaces the pasted `samplersOf` (T44) | - |
| C6 (item 29) | Node tests onto `tools/ktest.js`; a `test_all` step running `ktest.shadows` ratcheted | 317 `test-*.js`: 80 on ktest, about 218 declare a local `ok` (e.g. `core/terrain/test-scarp.js:12`) | tests only | any time, as touched; the step post | **OPEN** | - |
| C7 (item 32 tools) | `check_source` kits' top-level keys: fix with those kits' rebuild, `--write-baseline` | 21 kit top-level keys in `tools/check_source_baseline.json` (645 keys total) | catalog, fauna, mechs, motor-vehicles | with those kits | **OPEN** | - |
| C31 | STALE PASS | `tools/harness.py` | - | - | **DONE**, on | - |

**Numbering clash:** `tools/checks_optin.json` also holds `water-mouths` ("item": 32) and `leaf-stems` ("item": 33) from the Crook/Ria merge (7 biomes each). CORE-IMPROVEMENTS.md's items 32 and 33 are other things (owed fixes; stale bases). Renumber the two checks, and decide whether the switch-on takes them to `"*"` too (owner).

### Other CORE-IMPROVEMENTS items marked for the rebuild

| id | item | status |
|---|---|---|
| CI-32 | the owed fixes | = TODO T16-T22 (rows above) |
| CI-43 | foliage guards in the fault's unit | **PARTLY**: point-to-segment and the stem tolerance done (T33); the transparency audit per card material **OPEN** |
| CI-52 | floors underground | = T23, **PARTLY** |
| CI-1, 6, 7, 8a, 9a, 10a, 11b, 15, 2d, 3c (2026-10-27 "with the rebuild") | probe sweeps, volumes, cliff default, KHOOK, KCOLOR, KDEPTH, winding, `verify_page`, count cap | Landed with the biome rebuild round (KHOOK, KSEAT `95b-host-seat.js`, `harness.verify_page` in use); not re-audited one by one here |

Items 33-61 (the 11-15 and 11-17 surveys) are tool check requests, not page moves. Snapshot: present in some form: 34 (AST in check_stale), 36 (`lfs_needs` in tools/build.py), 37 (`--from` in test_all), 39 (`settle` in 90-host-camera), 44 (`PROGRAMS_JS`), 50 (`check_prompts` named in test_all); not found: 33 `tools/base_check.py`, 35 `reach.py --staged`, 38 `--stations`, 41, 42 (in vstack: `W.unstyled`), 46 `tools/procs.py`, 47, 48, 49 `merge_generated.py`, 51 `KRAND.STRICT`, 53 `attrs`, 54, 56 `known_failures.json`, 58, 59, 60, 61. None blocks Stage 8; 56 and 57 would help run it.

---

## Source 3: HANDOFF-REBUILD.md, open items

| id | item | status + evidence | when | owner questions |
|---|---|---|---|---|
| H1 | Longsong rebuild (garment pieces) | **OPEN** = T40 | with Longsong | Are the pieces published? |
| H2 | Audio Lab defaults and catalogue test | **OPEN** = O1 | audio session | - |
| H3 | Gallery republish | **OPEN** | post | A wide change: yes or no? |
| H4 | `-goldenway` branch | **DONE**: `origin/ccr-55bd6ee1-p1si44-goldenway` is an ancestor of HEAD | - | - |
| H5 | `claude/hook-p1`, `claude/review-round-3`, `origin/claude/seouterwall-s1`, `claude/dreamy-davinci-30f3c1` | **OPEN**: none merged. dreamy-davinci's edit is superseded (edit 4 rerouted the Ostrukh Riba) | before Stage 8 or never | Hook P1-P3 (its KLAND vs core/world), review round 3 (to the garment work), the SE wall (its own katabatic file: `89-atmos-fx-gale.js`): in or out? |
| H6 | Voth city: two embassies short, the Arena canton's flight | **OPEN** (owed to the city-layout work) | with Voth | - |
| H7 | `PERF-PLAN.md` owner gates | **OPEN** | - | The gates themselves |
| H8 | `PORT-BASELINE.json` stale rows (`settlements/port/dist/*`, little-demo, `core/sockets/example`) | **OPEN**: 37 rows of 519 | post: `port_baseline.py --write --prune` on a clean tree | - |
| H9 | Known verify failures: guilin (frozen), Dalab's instance cap, Mav's walk-and-reach, Locus x3 and Yuni x3 on the key map, yuni-plants' streamed doors, Pinnacle Rock attach 1.87%, voth-city, `kits/post-apoc/sockets-example` front door | **OPEN** (not re-verified here) | with each build | Which may stay failing in Stage 8 (baselined), which must pass? |
| H10 | Placed settlements (isle demo `check_core_use` findings: `getImageData` in 88a/88t/98, a PRNG in 91, its own sky dome in 80; Hook's missing `core/rand`/`core/tags`) | **OPEN** per `tools/core_use_baseline.json` (not re-run) | with each | - |
| H11 | Decisions list (Mungo and Shade onto core/city; single-complex and cavern modes; mud pots; geyser export; Girder `furn.calls` 78; swlowlands brown squares) | **OPEN** | - | All the owner's |

---

## Source 5: what the vertical stack adds (merges before Stage 8)

`git diff cf7e849a2...freeze/vertical-stack-1123 -- TODO.md` adds 23 lines and changes no other ride-along file (CORE-IMPROVEMENTS.md, HANDOFF-REBUILD.md, PLAN.md, PROMPTS-archived.md and `checks_optin.json` are unchanged on that side; a two-dot diff shows deletions only because vstack lacks the line's later work).

| id | item | files | status | notes |
|---|---|---|---|---|
| V1 | `relief.micro: 2` in every `openworld/*/data/region.json`; re-bake tiles, `plan/sites.json`, resources; bake 40 km S1 horizon maps for every Godot export; `wrelief_test.gd`, `check_godot_exports.py` | region.json x every region | **OPEN** | First in vstack's order |
| V2 | Stage 5 M1 packing: Godot `packFormat: 2` (`v4_arrays_two_maps`, `v2_two_maps_oct8`); web `pack.py` keeps v1, promotes smooth materials to 8-bit `xy8`, `v3` arrays at runtime near the 16-sampler cap | `godot/tools/export_spike.py`, `tools/textures/pack.py`, `core/materials/record/27-matlib-m1.js` (new in vstack) | **OPEN** | Every `pack.py` run in T1 should happen after this lands, or packs are written twice |
| V3 | B1-B5 all-biome upgrades (backlight, crown AO, uniform-keyed foliage dedup, `INDEX_ITEMS`/A2C/LOD merge, `libSwap` fringe, `KDRAWN.h` audits, S6 tinting; split `.tex` sidecars for 10+ MB biomes) and K1-K5 all-kit upgrades (KMAT dedup, sine-free breakup hash, `mipVariance`, plot-base AO, `boxBevel`, `KROOMLIGHT`, 8-bit smooth catalog families, foot AO, shared `20-core-roomlight-host.js`, Godot library split; split sidecars first on ash-nomads, desert-nomads, voth-city, screamers, beast-riders, `krator-fauna.js`) | `core/biome`, `core/materials`, `core/engine`, `core/catalog`, `kits/interiors`, `godot/shaders/*` | **OPEN**: vstack changes no file in core/biome, core/engine, core/catalog, core/shader, core/host, core/tags, core/atmos | **Duplicates:** B3/K1 = T31; B4 fringe = T19; B5 = T22. Merge the rows |
| V4 | Merge, rebuild every reached page (including non-`build_dirs()` targets: swhighlands `--station pillars --preview span`, core/charactermodels, the 7 core demos, `openworld/network-proposal/testbed`, `tools/scale-model/model/build.py`, `godot/tools/sync_core.py`, `export_spike.py`), fingerprints, `route_harness.py`, Godot `stage7_interiors_test.gd`, baseline `--write --prune`, `test_all.py --nightly` green | - | **OPEN** | Also: fix `landshade.py` insulation (`--osm-json`); renumber the branch's `edit_517*.py` to `edit_519*.py` on main's edit-8 rasters |
| V5 | Flow foam without blocks | = T52 | **OPEN on the line, in vstack** | 329 cmds |
| V6 | Post-merge Xanadu graphics expansion (S1-S5, M1-M4, I1-I4) | Xanadu builds | **OPEN**, after Stage 8 is green | Not a ride-along: it waits for Stage 8 |

---

## Suggested order inside Stage 8

1. **Before the core wave (one edit per shared file, then the node tests):** the vocabulary (T8, T32, T34, T36, the dasri/ria/yonni/vessel follow-ups); `43-core-ground.js` (T5, T17) after vstack's edit; `06-core-khook.js` (T16); `30-core-foliage.js` / `20-core-kit.js` / `25-matlib-host.js` / `69a-world-uv.js` (T18, T19, T22, T29d, T31 = vstack B3/B4/B5/K1); `35-core-strata.js` (T10, T35); core/hamlet (T11, T12, T25); core/water (T37, T43, T52 via vstack); core/atmos (T41); kits/fauna (T39, T42); KKARST (T20); ISK (T21); C3 (`through_tools_build`, no page moves).
2. **Core wave:** core/host (T23), core/world after vstack (T24, T26, T28, T30), core/catalog hem rule pages (T6), producer kits (`kits/interiors` with T7's 69dz and T13, then `kits/ancients-interiors`), the kits with T7, T9, T27.
3. **With each build:** textures (T1, after V2), the 12 packs (T29), the view renames (C2), MINSET (C4), assembly/vendor/source keys (T38, C7), `samplersOf` copies (T44), Longsong (T40), fungoid and arms if taken (O5, O6).
4. **Post:** `check_stale --write-baseline` (C1), `checks_optin.json` to `"*"` (C2-C5), `harness.py ratchet --write` per page on the GPU lanes (C5), engine and furnish fingerprints (T6, T46), `port_baseline.py --write --prune` (H8), delete the DONE TODO entries (T45, T47, T49, O2).

---

## Texture wiring (set id -> build -> materials.json family)

Checked by an exact `"<id>"` match in every `materials.json` and `station.json` outside `dist/`. A note naming the set as "owed" does not count as wired.
None of the 11-16/17 or 11-23 sets is wired; of the 63 sets of 11-12, four are wired in their target build.

### Already wired (no work)
- `bark.tiered`, `card.shelfoak`, `rock.lichen.ledges` -> `biomes/tiers`
- `patterns/xanadu/jali` -> `kits/xanadu`, `settlements/xanadu`
- `rock.hematite.mirror` (named in the TODO) -> `biomes/highrift`
- Erewhon's hangings, portraits, suzani, easter panels -> `settlements/xanadu/citadel/materials.json` (and `kits/catalog` "decals": pack owed, T6)
- Wired elsewhere than their prompt said: `rock.gypsum.bedded` -> `settlements/ledge` `cliffWall` (prompt: `biomes/rift` maze, family `rock.gypsum`: **open**); `rock.hewn.drillmarked` -> `settlements/ledge`, `shelf` `faceDressed` (prompt: `kits/tungang`: **open**)

### 2026-11-12 batch (Codex), not wired
- `biomes/hyperjungle` (stations savage, north): `organic.comb.bee` (stand-in `organic.pod.honeycomb`), `card.arum.carrion` (modelled spathe), `bark.watcher`, `bark.bloodwood` (canvases in `src/57`), `bark.bamboo.bored` -> `howlculm`, `card.bamboo.leaf` -> `howlleaf`, `card.flower.hand`, `card.pod.skull` (modelled stand-ins: new families)
- `biomes/shighlands` station conifers: `card.heath.whorl` -> `dwarf` (`stations/conifers/62-biome-shigh-conifers.js`, `"sheet": "geometry"`)
- `biomes/rift` station maze: `rock.gypsum.bedded` -> new family `rock.gypsum` (+ `stations/maze/station.json` `own`, `84-host-rock.js` base layer)
- `biomes/riftrim` station hearths: `ground.warmsoil` -> new family `ground.warmsoil` (`GLW` in `src/45-host-stage.js`, `groundLayers` in place of `lenswort`)
- `kits/islanders`: `earth.clay.raw` -> new family `rawclay` (the clay pit, `IE_RAWCLAY`)
- `biomes/neouterwall`: `rock.skarn.banded` (KGROUND rock layer, cauldron walls; in place of `rock.megabreccia`), `rock.pseudotachylite.mirror` (station 4 mirror scarp; new layer)
- `biomes/greatchasm`: `ground.komatiite.pavement` -> replaces `ground.black` in the Deep's layers
- `biomes/arch`: `rock.serpentinite`, `rock.peridotite.rind`, `mineral.travertine.brucite` (in place of `ground.travertine.white`), `rock.basalt.pillow`, `mineral.curtain` (procedural stand-ins today; new families; pillow is for unbuilt stations sound and coast)
- `biomes/galvanic`: `ground.sulfide.oxidised` (strand mud, in place of `ground.brown_mud_02`), `rock.sphalerite` (mound faces; nothing cuts them yet)
- `biomes/opalvalley`: `ground.sinter.opaline` (the slot whose `_note` names it; today `ground.sinter`), `rock.opal.matrix` (risers' seams), `card.leaf.photonic` (leaf sprays)
- `biomes/siphon-pits`: `surface.fleece.machinewax` -> `fleece`; `ground.feltturf.siphon` -> `cloth.felt` and `felt`; `wax.machine` -> `gall`
- `biomes/line`: `concrete.lining.segment` -> `lining` (today `concrete.ancient`), `concrete.guideway` -> the guideways (today `concrete.board`), `concrete.lining.spalled`, `metal.door.blast`, `metal.plate.riveted.painted`, `mineral.quartz.smoky` (new families)
- `kits/tungang`: `concrete.lining.segment.bolted` (the Tungang lining slot), `rock.hewn.drillmarked`, `organic.fungus.leather`, `patterns/fellgang/daub`, `patterns/glazier/cholet-front`
- `kits/kimr` (**no `materials.json` yet**: the kit must adopt the library first): `hide.pachyderm`, `shell.glyptodont`, `earth.dung.stack`, `patterns/kimr/handprints`, `bowl-band`, `kilt-band`, `shield`, `mural`, `labyrinth`
- `biomes/labyrinth`: `card.birch.silver` -> `birchleaf` (then `check_cells.py biomes/labyrinth`), `surface.melon.rind` -> new `melon` family (+ `BIO.solidMat` in `src/50`)
- `biomes/clivobredos` (Cliff Lungs): `organic.lung.ring` (in place of `organic.pleat.skin`), `organic.comb.throat` (in place of `organic.tendril.banded`), `organic.husk.dry` (in place of `organic.lichen.plates`), `card.fallout.lawn`
- `kits/qiblai`: `metal.gold.sheet.beaten`, `metal.copper.mantra`
- `biomes/loom-chasms`: `organic.cable.ironsilica` -> `cable` and `shoot` (today `bark.cord.braided` tinted iron)
- `biomes/firebliss` and `biomes/korona`: `rock.rhyolite.flowbanded` (the pancake domes' wall, today `rock.basalt.flowbanded`)
- `biomes/outlands`: `organic.tube.waxy` (no slot named in the docs found here)

### 2026-11-16 and 11-17 batches (found at step 4 and the second prune), not wired
- `kits/ancient-transit`: `ground.asphalt.lanes`, `ground.ballast.rail`, `metal.rail.rusted`
- `biomes/galvanic`: `organic.reef.galvanic` (nearest today `mineral.crust.ferromanganese`)
- `biomes/arch`: `rock.hyaloclastite` (today `rock.palagonite`; stations sound and coast)
- `kits/qiblai`: `wall.mural.temple`, `ceiling.coffer.mandala`, `cloth.rug.temple`
- `kits/resources`: `rock.magnetite` (lodestone), `rock.amber.blueearth` (amber), `stone.nephrite` (jade); also `rock.opal.matrix`, `rock.serpentinite` reused (vertex colours today)
- `settlements/azure-dream` (**no `materials.json`**): `ceiling.night.stars` (stand-in in `src/89qa-ad-hall.js:29`), `cloth.blanket.azure`, `wall.mural.dream`
- `biomes/firebliss`: `ground.snow.ash` (a family under the snow layer on the ash-fall mask, `84-host-ground.js` `aAshfall`)
- `kits/xanadu` (the fort; Strongwall and Marches): `wall.rubble.limewash` -> `xFortWall`, `wood.gate.studded` -> `xGate`, `wall.limewash.scorched` -> `xScorch` (new families)
- `kits/tungang`: `glass.moonglass` (key `potch`), `patterns/tungang/crew-mosaic`, `loj-banner`, `loj-banner.b`, `loj-banner.c` (`enamel-signs` came out with steam locomotives: left out)

### 2026-11-23 batch (13), not wired
- `kits/coyote`: `brick.mud.coursed` -> `brick` (today `plaster.clay_block_wall`), `patterns/coyote/kilim`, `frieze`, `turquoise-mosaic`, `card.feather.ostrich` (a family with `"cell"`)
- `kits/marr`: `stone.coral.colonial` (the ashlar slot), `patterns/marr/azulejo-maritime` -> `maZellige` (replaces `patterns/common/zellige-blue`), `patterns/marr/iron-scrollwork` (cut-out balustrade)
- `settlements/kirstabal`: `wall.slate.coursed` -> `xSlate`, `xSlateD` (both families exist with a stand-in)
- `kits/xanadu` 88g works (opt-in, `extra/88g-xa-works.js`; `settlements/xanadu-works` has no `materials.json`): `ground.dyeworks`, `ground.sulfur.crust`
- `biomes/copperglacier` station 11: `rock.azurite`
- `biomes/ehighlands` stations 5 and 6: `card.beech.southern`

### Older deliveries still unwired (seen on the way)
- `biomes/hyperjungle` / `biomes/abyssal-savannah` rims (2026-11-10): `bark.palm.spined`, `bark.tualang`, `card.ghostpipe`, `card.leaf.miombo` (the rims' sets into `biomes/abyssal-savannah/materials.json`, `build.py` `RIM_PACK`); `ground.ironstone` is wired only in shroudhills and yonni
- `biomes/ringisles` lagoon: `ground.coral.rubble` -> a `ground.rubble` slot replacing `shingle` (in the library since 11-03)
- `patterns/xanadu/tapestry-pleasure-dome.b` (second take) and `patterns/easter/*.classic` (for Talia's museum): no build named

Not delivered (do not wait for them; PLAN.md 2179-2180 and 2234-2236): the Rift battery's `rock.sulfide.chimney`, `ground.brine.mud`;
Gihon's `metal.gilt.leaf`, `inlay.opal`; Shumar's `stone.dome.mamluk`, `masonry.ablaq.basalt`, `stone.jali.blade`, `card.apricot.whorl`;
`ground.flark.mud` and the Tungang murals. (PLAN.md's 11-12 "still owed" list is out of date: `rock.hematite.mirror` is wired in
highrift, and the Ancient Transit's three, `ground.snow.ash`, `organic.reef.galvanic` and `rock.hyaloclastite` came in the 11-16 batch.)
