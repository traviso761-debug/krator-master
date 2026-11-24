# Krator: to do

A working list. Items marked *(Menagerie)* come from reading the World Menagerie embedded at
`host/WorldMenagerie/` (paths below are under it). Its code is read for ideas only: anything taken is
rewritten as a Krator fragment, never imported from `host/` (`tools/check_insulation.py`).

**Godot tags.** The repo-wide audit and port plan is `GODOT-PLAN.md`; it uses these tags. The plan (`biomes/WORLD.md`) is that three.js generates and previews, and Godot runs the open
world. The port works when **what** a thing is (data) is kept apart from **how** three.js draws it
(`biomes/GODOT.md`, `core/atmos/GODOT.md`). Each item is tagged:

- **[G data]** engine-neutral: an algorithm or data that crosses over through the exporters as it is. This is
  the most valuable kind; do these as data first, drawing second.
- **[G shader]** a shader trick that rewrites directly into a `.gdshader` (often through the global shader
  parameters `core/atmos/GODOT.md` already defines).
- **[G native]** Godot has this built in. Worth doing in three.js only for the preview; don't port it.
- **[web]** browser or three.js only. No Godot value.

Prefer items that are straightforward to port. **Godot order:** (1) the carver's floor and blocker list,
which becomes collision shapes and the navigation mesh source; (2) the land-cover map, which becomes the
terrain splat texture and the placement input; (3) the minimap drawn from exported data.

**Counts:** tags used: about 52 [G data], 27 [G shader], 17 [G native] and 18 [web] (some items carry two, and the legend above uses one of each).

## The Audio Lab's numeric defaults *(2026-11-10, the second integration pass)*

- **`|| <number>` in core/audio** (check_source ORNUM, 147 findings, recorded in `tools/check_source_baseline.json` when
  `claude/water-migration-merge` came in): `core/audio/tools/soundtrack_engine_code.js` (145, e.g. `vol: tr.vol || 0.85`, where a
  volume of 0 is a real mute), `core/audio/26-core-audio-music.js` line 550 (`scenario.frequency || 1.0`) and
  `core/audio/lab/serve_local.js` line 9. Write them `x == null ? d : x` with the audio work's next turn, run its node tests
  (`core/audio/test-*.js`) and let the ratchet shrink (`python3 tools/check_source.py --write-baseline`).
- **`node core/audio/test-audio.js` fails two checks as the branch committed it** (core/audio is byte-identical to
  `claude/water-migration-merge`): "every clip has a known category" (68 of the 1,007 clips name categories
  `data/categories.json` lacks: `sfx.interface`, `sfx.impact`, `music.motif`, `sfx.voice`, `mus.loop`, `sfx.env`) and "every clip has a
  source page and a creator". Add the categories (or map the clips onto existing ones) and fix the sources in the audio work's next turn.

## Left red by the second integration pass *(2026-11-11; HANDOFF-REBUILD.md)*

- **`tools/scale-model/tests/test_smodel.py`, two station heights from the NE outer wall's merge** (found 2026-11-12 by the scale-model
  re-run, failing on claude/integration-3 before it too): station-garnet is stated at 2,810 m (the Garnet-Mirror Tarn, `biomes/neouterwall`
  PLAN.md and NOTES.md) where the model's ground is 3,352 m, station-vitreous at 2,950 m where it is 4,004 m. The kit's pages stand on
  those heights, so the NE wall's session decides: restate them from the model, or carve the model's cauldron and hollow to them.

- **The NE wall's `HV('thatch, mats, arrow shafts', ...)`**: `core/hamlet/test-hamlet.js` cannot read "arrow shafts". Add it to the
  craft rule in `core/hamlet/10-hamlet-wood.js` with the next rebuild that takes core/hamlet (54 pages), or call it `poles` in the kit.

## With the next scale-model edit *(the owner, 2026-11-09)*

- ~~**Reroute the Ostrukh Riba south into Lake Ostrukh.**~~ **Done in scale model 5.1 edit 4** (`tools/scale-model/edit_514.py`, 2026-11-10, re-run on the merged model 2026-11-11): a travertine sill at 2,050 m closes the flagship maar's north breach, and the river runs 262 km south into Lake Ostrukh (1,850 m), 0.9 m³/s of the model's runoff. Reed, Nazar and Mungo's plans were corrected with 5.1 edit 3 (`biomes/loom-chasms`, `biomes/godshearth`).
- **Reroute the Ostrukh Riba south into Lake Ostrukh.** The owner agreed that the Slabfields' springs and Lake Ostrukh share one aquifer, fed by the Stalker Range's snow (`biomes/slabfields/PLAN.md`). Today the river runs north from the flagship pool (2,040 m) into Region 99 and ends at 334 m, although its note says it feeds the lake (1,850 m). A southern course needs a carve about 70-80 m deep; its highest point is 2,082 m at 1588,1392. Retrace the river downhill and fix its note. The scale-model edits session (`claude/dreamy-davinci-30f3c1`, edit 5.1.1 at f1d1501cf, artifact version 92) has the details. Held for the next map edit, not done alone.
- **Reed, Nazar and Mungo:** the biome plans' coordinates for them add the canvas shift twice (Reed really stands at 1277,676). Correct the plans when the next edit lands.
- ~~**Merge `Crook / Farside / Shroudhills` & apply `Ria Valley` hydrology, `22`-Canal Continental Network, and `4` `[D]` settlement-fit edits.**~~ **Done in scale model `5.1e22` + `5.1e23`** (`tools/scale-model/edit_522_ria_hydrology.py --in-place` & `tools/scale-model/edit_523_canals_and_settlements.py --in-place`, 2026-11-23):
  - `5.1e22` (`Sphere 27` exterior): `39` sinuous dendritic Ria & Shroudhills rivers (`sin = 1.29–1.51`) with stream-power valley erosion, `x ≈ 702` `"Iron Gates"` hogback sill & `4,210 m³/s` water-gap (`Heartland` `BSk`/`Csa` rain-shadow), `Farside` `55–96 km` seaward foreland (`Farport` at `(248, 585)` `+212 m` above `(243, 586)` harbour), `Crook` `4` drowned calderas + `18` gorge rivers (`9111–9128`), and `Sphere 27` polygons/pins.
  - `5.1e23` (`DATA.canals` / `canals.json` + interactive `Canals` layer + settlement fit): `22` engineered lock, boat-lift, summit-pound & polder canals (`3,171.1 km`, `203` locks) across Eternal State (`8`), Ria Civilization (`7`), Empire of Iziz (`2`), Hykkousoi League (`2`), and Kingdom of Voth (`3`); `4` disjoint `[D]` micro-surgeries (`Almua` spit + `r863 Dip Rivrh`, `The Beacon` `+868 m` knoll, `Dalab` `Wind Bruk` delta grading, `Locus` `r_locus_delta` scarp stream); `7` `[B]`/`[D]` pin relocations; and `13` newly registered settlement pins in `60-settlements.js`. (`359` checks pass in `test_smodel.py`; downstream `biomes/firebliss`, `settlements/strongwall` & `settlements/thalaba` ride along with the all-builds rebuild.)

## With the native-crop rule *(the owner, 2026-11-12; `openworld/TRADE-SCOPE.md` section 2.5)*

- **Rework the isle demo's crops.** Under the native-crop rule cacao is the Vale's, so the Ring Isles can no longer grow
  it (indigo, annatto and tobacco stay: the isles are in their homes). Change all of it to a crop native to the isles
  (clove, coffee, kava, sugar cane) or to cacao bought in:
  - Nephtos's cacao plantings (`settlements/isle-demo/src/15-isle-tune.js:663`);
  - **Kautoa's own cacao plantation and export** (`settlements/isle-demo/PLAN.md:515`, `:990`; `README.md:174`) and the
    advantage table;
  - the cacao in the traders' buy lists (`15-isle-tune.js:335`, `:346`). The stocks proof and `test-sim.js` move on
  purpose and are re-baselined. Do it when the rule lands in `kits/crops`, not before.

## Lacquerware for Xanadu and the Eternians *(the owner, 2026-11-12; `openworld/TRADE-SCOPE.md` section 7.6)*

- **Both make lacquerware; nothing builds it yet.** It needs:
  - a lacquer source in `kits/crops`: a lacquer tree native to the Vale and to the NW lowlands, or one each; the abyss's
    `abyss-lac` is an insect lac and stays the abyss's;
  - the lacquer workshop in `kits/xanadu` and in the Eternian kit;
  - the goods row and the recipe (sap to lacquer to lacquerware) in the sim's culture tables (`core/simulation`).

  `biomes/twins/PLAN.md:90` already has Xanadui lacquerware as caravan cargo.

## Post-merge graphics expansion: build out Xanadu on the Stages 3–7 stack *(the owner, 2026-11-22; `GRAPHICS-TERRAIN-PROPOSAL.md` §12c)*

Once the other collected sessions are merged into `main` and Stage 8's all-builds rebuild (below) is green, the next graphics & terrain expansion builds out **Xanadu** (`settlements/xanadu` / Erewhon, `kits/xanadu` & `XAK`, `biomes/xanadu`, `openworld/xanadu-lake-shore`, `openworld/xanadu-north-shore`, `openworld/xanadu-oidong-highrift`, `settlements/pher`, `settlements/kirstabal`) on the vertical-stack upgrades:
- **Terrain, Alpine Crags, `40 km` Horizon Light & 3D Grass (`S1`–`S5` + `alpine: 2`):** Land `core/world`'s lush `xanadu` biome style on `"relief": {"micro": 2, "alpine": 2}` (`WRELIEF` v2 Pythagorean-rotated arête peaks without negative collar moats, `WRELIEF.crags` strike/dip cliff buttresses & couloirs, and `WLAND.KINDS_V2` crest-gated `alpine`/`volcanic` `KSTACKS` gendarmes), export rugged cordillera chunks (`>= 2,400 m` relief) with `--alpine=2 --alpine-step=16`, bake `40 km` `S1` horizon & Dozier–Frew sky-visibility maps (`core/world/bake_horizon.py`), enable `S3` `32 m` sub-grid chunk normals, pack Xanadu's alpine/lake-shore/courtyard `S4` hex-tiled PBR ground `Texture2DArray`s (with `terrain.gdshader`'s unstretched `ZY`/`XY` wall-plane cliff granite, `px_3d` cliff AA, conjugate rock fractures, and `> 4,150 m` smoothed-couloir alpine snow), and tune `KratorWorldGrass` 3D grass swards across Xanadu's valleys, orchards, and lake margins.
- **Glazed Tile, Masonry & Lacquer Surfaces (`M1`–`M4`):** Apply `hemi-oct8` + `mipVariance` specular AA (`v4_arrays_two_maps` / `v2_two_maps_oct8` in Godot; `8-bit` `xy8` smooth-surface promotion + `v3` arrays on Web) to Xanadu's glazed domes, Persian/Turkish tilework, carved timber, and lacquerware so curved specular highlights show zero 6-bit banding; enable `M3` planar POM on hero ashlar/brick walls and `M4` concave cavity + base grounding.
- **Sultanate & Erewhon Interiors (`I1`–`I4`, Gate 5):** Export `interiors.json` v2 (`KROOMLIGHT.buildTable` + doorway `portals` + `vertexCornerAO`) for Erewhon and `kits/xanadu` interiors (`89y-xa-interiors.js`, `kits/interiors/sets/xanadu.js`), wire native Godot `KInteriorsLight` (`INDOOR_LAYER = 2` sun/sky mask, discrete room-table daylight/lamp bounce, room-gated `OmniLight3D` pool with 2 shadowed hero lamps, baked corner AO), and add a `xanadu` deterministic route + Gate 5 Sun-Leak Probe.

## Ride along with the next all-builds rebuild

- **The lake towns' room sets into kits/interiors** (2026-11-23, BUILD-PLAN A6): `kits/xanadu/extra/69dy-ix-lake-works.js` (the set
  `xanadu-lake-works`: the governor's house, the dye store, the loom hall, the saffron floor, the honey house, the net loft) and
  `kits/xanadu/src/87k1-xa-lake-rooms.js` join `kits/interiors/sets/xanadu.js` when their pieces join the kit's src/; every page
  that takes the Xanadu interiors gains them (only `settlements/xanadu-lake` and `settlements/kirstabal` read them in place now).
- **The countryside sample to the other Xanadu regions** (2026-11-23, BUILD-PLAN A9, HAMLETS-PLAN H2): `core/world/48v` and `88r`
  are opt-in (`WORLD_SAMPLE` in a region's `src/48-world-site.js`); only `xanadu-lake-shore` and `xanadu-north-shore` set it. The
  other province regions (HAMLETS-PLAN section 3's table) set theirs at the rebuild, and their pages then lay their samples.

- **The balanced basket into Voth, Mungo and Dhelv** (2026-11-12, `core/simulation/77-sim-6-items.js`, branch
  `claude/sim-s4-s7-fdaeba`). The change reaches `settlements/voth` (city and site), `settlements/mungo` and
  `settlements/dhelv`. Their committed pages were built on 2026-11-08, before core/biome's e983ec13d and e6543a3a9. Rebuilt
  now, they fail their GPU verifies on the biome side: Mungo's error panel has `ReferenceError: bk is not defined` at
  `BIO.geo.stemClump`; Voth's city fails on page errors, flora (swbay), embassies, the Arena canton not walkable, and the
  flora editor; Dhelv gave no result. Their pages were left as committed. Rebuild them with the biome rebuild. The basket
  itself is tested in node: `test-sim.js` (Dhelv's trace), the isle demo's 15 tests, Godot's isle books.
- **Wire the Codex sets of 2026-11-12** (the collection for main, 2026-11-22): `claude/textures-2026-11-12` put 63 sets in the library,
  none wired. Their prompts are in `core/materials/PROMPTS-archived.md` ("Delivered 2026-11-12" and "Delivered 2026-11-12 for prompts that
  lived on other branches"): High Rift's `rock.hematite.mirror`; Opal Valley's three; the Siphon Pits' three; the Rift line's five; five of
  the Tungang kit's (and the Glaziers' `cholet-front`); the Kimr's nine; the Labyrinth's flora's two; and the batch's own sections 37, 40, 41,
  43-45, 48-50 and parts of 51-52. Each build's `materials.json` slot, then `python3 tools/textures/pack.py <build>`, then judge it in
  the demo kit before it stands (memory: demo before commit); each build's KNOWN_ISSUES.md names its stand-ins.
  With them, the later deliveries, also unwired: the 2026-11-16 and 2026-11-17 batches' sets the step-4 merge found (`PROMPTS-archived.md`,
  the two "found at step 4" sections: the Xanadui fort's three, the Qiblai kit's five, the Azure Dream's three, the mined goods' three, the
  Cliff Lungs' four and the rest), and the 2026-11-23 batch's 13 (`core/materials/PLAN.md` "Delivered 2026-11-23": `kits/coyote` five,
  `kits/marr` three, `settlements/kirstabal` `wall.slate.coursed`, `kits/xanadu` 88g's two, `biomes/copperglacier` `rock.azurite`,
  `biomes/ehighlands` `card.beech.southern`).

**Taken by the second integration pass** (`claude/integration-2`, 2026-11-10 and 11; HANDOFF-REBUILD.md): the `dalab` sockets pack,
water breakup on by default, the catalog's `tile` detail family, the Highlands great-building room kinds in `30-programs.js`, the fauna
runtime and bison table, and the `tools/` listing staleness (every build rebuilt): all rebuilt and GPU-verified, items deleted.
- **Execute the All-51-Settlements (`60`-Target) Rebuild & Continental-Scope Quality Pass** (`2026-11-22`, `settlements/ALL-BUILDS-REBUILD-PLAN.md`): port remaining bespoke layouts onto `WORLD.H` + `KCITY`, re-anchor stale cuts (`Erewhon` `841,1517`, `Pinnacle Rock` `1007,686`, `Longsong` `1228.88,1621.23`), apply frame turns (`Verge` `-10°`, `Ys` `-55°`, `Dalab` `+45°`, `Hook` `-9.2°`, `Dhelv` `+90°`, `Noah's Regret` `+90°`, `Ledge` `180°`), and place the locked systemic buildings (`10` Mercenary Bourses, `19` Order Chapterhouses + hidden Whisper-Cell radios + *Tzintzun*'s lab at `Voth`, Geomancer Dual HQs & `Verge` `856 m` oil cableway, Colonization Crier/`styleBooks` halls, Prohibition/Thieves' smuggling cellars, and `Rulings #1–101` workshop I/O chains).
- **Wire multi-kit fragments & sidecars into settlement & regional builds** (2026-11-22, `core/region/MULTI-KIT-SCOPE.md` Phases 1–4, Rulings #99–101; held for the all-builds rebuild by owner's choice): include `core/kits/10-core-kits.js`, `core/city/42-city-multikit.js`, `core/city/53-city-host-multikit.js` (with `tools/kit_pack.py --sidecars` for cosmopolitan multi-kit pages) and `core/region/47s-region-styles.js` in settlement `CITY_JS` / `CITY_DATA_JS` / `REGION_JS` lists when rebuilding all settlements.
- **Add `Sphere 27` (`Crook` / `Shroudhills`) biological lineages to `peoples.json`** (`2026-11-22`, `core/region/CROOK-RIA-SCOPE.md` §3.1; held here because `core/charactermodels/data/peoples.json` reaches `settlements/longsong`'s 5 pages): add `"cflit_qbon"` (*cFlīt-qBōn* pelagic `25-min` free-dive lineage), `"yonni"` (*Sfīra-Kandētæ* reverse-dimorphic `90%`-twin Spear-Queens), and `"hush_kin"` (*Silent Vales* *Handspeak* sanctuary tribes) to `core/charactermodels/data/peoples.json`, run `node core/charactermodels/test-rig.js` and `python3 godot/tools/sync_core.py`, and rebuild `settlements/longsong` inside the all-builds pass.
- **The Orders' catalog pieces and kits/qiblai's interiors options** (2026-11-23, settlements/flashing-eye's interiors):
  `kits/catalog/krator-master-furniture-xanadu.js` takes the Flashing Eye's seven pieces (the heliograph, the fire basket, the Ember's
  hearth, the Book's lectern, the mirror bench, the crimson banner, the veil rack) beside the Beacon's eleven (its B8, 94ffe4aae,
  taken here verbatim so the two merge clean); `kits/qiblai/src/89q5s-qb-shells.js` `qnIxType` takes `prog.doors`, `prog.bulbs`
  and `prog.stair` (unused by every page but the Flashing Eye's, which behave as before). The catalog file reaches 57 build
  commands (`python3 tools/reach.py kits/catalog/krator-master-furniture-xanadu.js`), the shells six (Azure Dream, Lightwall,
  Qiblai's city, Viridian, kits/qiblai, the Flashing Eye); only kits/catalog and settlements/flashing-eye were rebuilt and
  GPU-verified with the change. The rest ride with the rebuild.
- **core/terrain's ground shader under an environment map** (2026-11-17, found on the Glaziers' sheet): `43-core-ground.js` names
  `kgTri`'s and the hex sampler's locals `v1 v2 v3` and `r1 r2 r3`, which three r128's `cube_uv_reflection_fragment` `#define`s as
  numbers whenever the scene or the material has an environment map (a skylight): the fragment fails ("'0.276' : syntax error").
  Rename them (`kgV1`..., `kgR1`...) and drop the `#undef` guard in `core/terrain/host/39i-core-cavern-rock.js`; 199 builds read it.
- **The catalog's hem rule and decal pictures** (2026-11-17, branch `claude/dreamy-turing-3902d7`, which also carries the unmerged
  `claude/citadel-furnishing-cb5e01`; the owner: "make sure wall hangings dont wind up near ground, this has been a recurring issue",
  and "fold into the all-build rebuild"). `core/catalog/krator-furniture-core.js`: `furnAnchorY` hangs a top-hung cloth with its hem
  `FURN_HEM` (1.1 m) up when the ceiling allows (wall art's lower edge too), a piece may say `hung: 'top' | 'eye' | false`, and
  `mkDecal` shows a delivered picture (`FURN_DECAL_IMG` / `KF_DECALS`, a key that is a texture id) over its painted stand-in; eight
  culture cloths take `hung: 'top'`, `br_h_hung_hide`'s hide is 1.6-2.0 m, and the kit's painted hanging (a hide in a frame of two poles)
  hangs instead of standing on the floor (the owner, 2026-11-17: "Raise it too"; every culture's `*_court_painted_hanging` moves).
  Hangings a kit places by hand take the same rule through the engine's new `FURNISH_WALL(key, x, floorY, z, ry, ceilY, o)`
  (`core/engine/91f-furnish.js`; a stub in `settlements/isle-demo/bundles.py`): the Islanders palace, gallery and shrine banners and
  painted hangings, `isFurnRoom`'s art and extras (the residence's banners), the Scyvoi chief's tapestries, the Lizardmen Interpreters'
  scroll. Those three kits' pages move: `python3 core/engine/fingerprint.py` will say so for them, on purpose. Not built yet. `python3 tools/reach.py core/catalog/krator-furniture-core.js`
  reaches 66 build commands: none is rebuilt on the branch, so every catalog-taking page moves in the rebuild. Then
  `python3 core/furnish/fingerprint.py` and `python3 core/engine/fingerprint.py` (hung cloths in furnished rooms move on purpose: read
  which, do not re-baseline blind), `kits/catalog` and `kits/interiors` `verify.py --assert` on a lane with `KRATOR_GL=gpu`, the
  hash baseline. Checked headless already: `node core/catalog/test-hangings.js` (every wall hanging of the catalog, 458 variants, hem
  at least 1 m in a room tall enough), `node core/tags/test-tags.js`, `node core/furnish/test-furnish.js`, the citadel census.
  The pictures: `kits/catalog/materials.json` "decals" lists the ten owed in `core/materials/PROMPTS-archived.md` section 57 (delivered); once one
  is delivered, `python3 tools/textures/pack.py kits/catalog` packs it and Erewhon (`furniture_bundle.bundle(..., decals=True)`) and
  the catalog's sheet show it (about 150 KB each inline).
- **Agreed 2026-11-24, source and tests first (`GODOT-LOOK-HANDOFF.md` says what this rebuild must do for it; `GODOT-LOOK-PLAN.md` section 13's table where each addition stands): the pages that take `core/engine`, `core/export`, `core/catalog` and `core/biome` are behind their sources and want this rebuild.** Built: a material's `side`, mirrored triangles, `closed`; in `core/engine` the chamfered box, out of true, a height field and the smoke and sill marks; in `core/catalog` the chamfered box and a grain axis; in `core/biome` wind stiffness and phase; each off until its `setForm()`. Still to write: baked occlusion and edge, the opening's mark, the Godot packs, an exporter that turns the forms on, and Godot's readers. The first note: eleven small export additions for the Godot look: a chamfered box on the box's own 24 vertices, three per-vertex fields (height above the plot, occlusion, edge), an opening's mark on its wall, out-of-true jitter, a furniture grain axis, wind stiffness and phase on plants, and Godot packs that keep colour and roughness; and three in the scene export that the back-face culling of 2026-11-23 turned up: a material's `side` (front, back or double), a mirrored mesh's triangles turned over when its matrix is baked, and `closed: true` on a closed solid; and one the air and the decals of 2026-11-24 need: where smoke rises and where a wall stains (a chimney's outlet, an opening's sill) as registry records. They touch `core/engine`, `core/catalog`, `core/biome`, `core/export` and `tools/textures/pack.py`, so they are cheap only inside this rebuild. The plan's steps 1 to 3 are built (its section 14.3), and 4, 6, 7 and 9, which are Godot-only (14.4); of step 5, the colour cards (P1) and the trunk's flare (P3) change the library and `core/biome` and so ride along too.
- **Graphics & Terrain Stage 8 (the stack's own list; `STAGE-8/PLAN.md` supersedes it: its corrections A C4-C12, and the owner's D1 puts B1-B5/K1-K5 in their own sessions before Stage 8) (`GRAPHICS-TERRAIN-PROPOSAL.md` §11 & §12c–12d; `INTEGRATION-AND-REMAINING-SURVEY.md`, `BIOME-REBUILD-SURVEY.md`, `KIT-REBUILD-SURVEY.md`, `STAGE-5-REPORT.md`, `STAGE-6-7-REPORT.md`, from `claude/vertical-stack`)** — run in this exact order once the other collected sessions merge:
  1. **Turn `relief.micro: 2` and `relief.alpine: 2` on across every open-world region:** Set `"relief": {"micro": 2, "alpine": 2}` in every `openworld/*/data/region.json` (merging into existing `relief` dicts on `oidong-highrift` & `pinnacle`), re-run the world-tile stream bake, re-bake each region's `plan/sites.json` and resources, export cordillera Godot cases with `--micro=2 --alpine=2 --alpine-step=16`, and bake `40 km` `S1` horizon + sky-visibility maps (`python3 core/world/bake_horizon.py <export_dir>`) for every Godot open-world export. Verify `wrelief_test.gd` v2 goldens (`peaks2`, `crags2`, `records_alpine2`, `land_alpine2`) and `python3 tools/check_godot_exports.py`.
  2. **Roll out the Stage 5 (`M1`) engine-split material packing (`STAGE-5-REPORT.md` §4):**
     - **Godot exports (`godot/tools/export_spike.py`, `packFormat: 2`):** Emit `v4_arrays_two_maps` (`hemi-oct8` normals + `mipVariance` in `pack.json`) for multi-layer ground/town atlases and `v2_two_maps_oct8` (`library.gdshader` `use_nrc = true`, `normal_enc = 1`) for standalone kits (`-33.3%` `BC7` VRAM, `2` samplers). Never pack height into alpha on `alphaTest > 0` cut-out cards (Gate 1).
     - **Web builds (`tools/textures/pack.py`):** Keep `v1` 3-map WebPs on inline HTML pages (preserving the `16 MB` page cap), promote smooth/glazed materials (`specular >= 0.45`, `roughness < 0.35`) to `8-bit` `xy8` normals, and build `v3_arrays_three_maps` at runtime (`ISLE_ATLAS` pattern) on pages approaching the 16-sampler WebGL2 cap. Verify Gate 1 (`pack.py`) and Gate 3 (`m1_slice_test.gd` / `tools/textures/m1_slice.py --web`).
  3. **Land the shared all-biome (`B1`–`B5`, `540` pages) and all-kit (`K1`–`K5`, up to `758` pages) core upgrades (`GRAPHICS-TERRAIN-PROPOSAL.md` §12d):**
     - **All-biome (`core/biome`, `godot/shaders/foliage.gdshader` — individualized 64-biome checklist in `BIOME-REBUILD-SURVEY.md`):** `B1` normal-gated leaf backlight (`M5`); `B2` baked crown self-occlusion in `_COLOR` + `0.35 m` trunk/rock base AO (`M4`/`M5`); `B3` uniform-keyed foliage/irid-bark shader deduplication (`50–90 -> 3–6` programs); `B4` default-on `BIO.INDEX_ITEMS`, `BIO.setA2C`, station `LOD.merge`/`cull`, and `BIO.libSwap` `willReadFrequently` alpha-fringe dilation; `B5` `KDRAWN.h` audits + `S6` chromatic crease/lift/aspect tinting; plus split `.tex` sidecars on `biomes/xanadu` (`12.07 MB` inline `xanadu-floor.html`) and `10+ MB` inline biomes before `8-bit` normal promotion per `BIOME-REBUILD-SURVEY.md`.
     - **All-kit (`core/materials`, `core/engine`, `core/catalog`, `kits/interiors`, `godot/shaders/library.gdshader` — individualized per-kit checklist in `KIT-REBUILD-SURVEY.md`):** `K1` uniform-keyed `KMAT` specular/breakup/world-UV dedup + sine-free breakup hash + `pack.json` `mipVariance` specular AA (`M2`); `K2` `core/engine` plot-base AO, hero `boxBevel()`, and universal `KROOMLIGHT` (`I1`–`I4`) wired into `91i-interiors.js` & `kits/interiors`; `K3` `8-bit`/`hemi-oct8` promotion on smooth catalog families (`lacquer`, `ceramic`, `gold`, `metal`, `nacre`, `obsidian`, `tile`) + batched `0.18 m` foot-contact AO in `KF.batch`; `K4` shared `20-core-roomlight-host.js` replacing pasted `nlvTex` copies; `K5` split Godot `library.gdshader` (strictly opaque — Early-Z & vertex-only shadows) from `library_cutout.gdshader`; plus **split sidecars first** on `ash-nomads` (`95%` cap), `desert-nomads` (`98%` cap), `voth-city` (`94%` cap), `screamers` (`87%` cap), `beast-riders`, and `krator-fauna.js` (`94%` cap) per `KIT-REBUILD-SURVEY.md` & `INTEGRATION-AND-REMAINING-SURVEY.md`.
  4. **Merge, rebuild all reached pages (including non-`build_dirs()` targets) & verify nightly gates (`INTEGRATION-AND-REMAINING-SURVEY.md` Part II):** Fix `landshade.py` insulation (`--osm-json`), resolve `origin/main` scale-model conflict by renumbering branch `edit_517*.py` -> `edit_519*.py` on top of `main`'s edit-8 rasters, sweep parked items below, build producer kits (`kits/interiors` before `kits/ancients-interiors`), run `python3 tools/build.py --all` **plus** the explicit non-`build_dirs()` targets (`biomes/swhighlands --station pillars --preview span`, `core/charactermodels`, the 7 `core/*` demos, `openworld/network-proposal/testbed`, `tools/scale-model/model/build.py`, `godot/tools/sync_core.py`, and `godot/tools/export_spike.py`); verify `core/engine/fingerprint.py`, `core/furnish/fingerprint.py`, `tools/route_harness.py`, and Godot `stage7_interiors_test.gd` on `arc`/`rtx`; update `PORT-BASELINE.json` (`--write --prune`) only for verified pages; finish with `python3 tools/test_all.py --nightly` green on Web and Godot 4.7.2.
- **Eleven Xanadu furniture pieces for the Order of the Beacon** (2026-11-23, `claude/beacon-monastery-d509f5`; settlements/beacon B8):
  `kits/catalog/krator-master-furniture-xanadu.js` gains the switchboard, cable drum, signal lectern, signal mirror, Register of
  Lights, gold banner, relic lamp, engine set, lens bench, hour drum and reader's seat, and two palette colours. The catalog's page
  and the Beacon are rebuilt and verified; every other page that bundles the catalog (`python3 tools/reach.py
  kits/catalog/krator-master-furniture-xanadu.js`: 49 builds) is behind until the rebuild. The pieces are appended to the file;
  a Xanadu room whose kind and piece type they match may now take one, so furnished pages' hashes will move.
- **Stage 8: switch the per-page packs on** (2026-11-23, `settlements/xanadu/XS1-CLASSES.md` "Fixes after XS0"): after the re-pack, re-record each Xanadu page's lists (`python3 tools/textures/page_pack.py record <page> --queries ?interiors=1` on a GPU lane, into `settlements/xanadu/page-packs.json`), then make `--page-packs` the default in `settlements/xanadu/build.py` (its `'--page-packs' in sys.argv` test) and rebuild every page built on Xanadu's page; publish each page's renamed sidecars (`<page>.tex.<key>.js`) with it.
- **Stage 8: glaze the five pattern sheets** (the owner, 2026-11-23: "Glaze at Stage 8"; `settlements/xanadu/XS1-CLASSES.md` "Fixes after XS0"): `xMosC`, `xMosD`, `xBandC`, `xGiltC` and `xBandR` (in `kits/xanadu` and `settlements/xanadu`) stay classed flat until then. At Stage 8 lower their roughness below 0.35 (their materials or their packed roughness maps; packed means now 0.381, 0.354, 0.423, 0.558, 0.809), re-pack, rerun `python3 tools/textures/mclass.py --measure`, class them glazed in both `materials.json` (they then derive glazed and take 8-bit normals, +119 to +198 KB each), and drop their entries from `core/materials/classes/m1-classes.json` "pending" (`test-class.js` fails until both are done).
- **The Xanadu kit's opt-in pieces into `src/`** (2026-11-16, `kits/xanadu/README.md` "Opt-in pieces"): `extra/88c-xa-caravanserai.js`,
  `extra/88d-xa-lakecraft.js`, `extra/88e-xa-stall.js` and `extra/88f-xa-harbour.js` (2026-11-17, Kirstabal's harbour), `extra/88l-xa-mine-works.js`
  (2026-11-23, the stamp mill and the sorting shed: `settlements/xanadu-works` takes it) into `kits/xanadu/src/`, `extra/69dz-ix-xanadu-extra.js`'s item into `kits/interiors/sets/xanadu.js`;
  the kit's sheet takes rows for them; `settlements/pher/kit.json` drops them from `"external"`. Every page of the kit (and `XAK`) changes.
- **Register the `coyote` culture** (the owner, 2026-11-16, `kits/coyote/PLAN.md` sections 7 and 12): `'coyote': 'Coyote Men'` in
  `core/tags/52-core-tags-vocab.js` `CULTURE_NAMES` (and `test-tags.js`'s digest), with the catalog's `coyote` culture file in
  `FURN_CULTURES` once the kit's C8 has written it. Until then `kits/coyote`'s `tags-vocabulary` assert fails (its `KNOWN_ISSUES.md`).
- **core/tags' `vessel` and `vehicle` classes** (2026-11-17, the owner: "make sure boats are properly tagged as ships, see ring sea
  vessels", "we should add a vehicle tag as well", "barges and boats need to take the vessels tag which will be fully implemented in
  next all build rebuild"; ride along by the owner's choice): `core/tags/52-core-tags-vocab.js` has them (ids
  `ves_`, `veh_`; keys `propulsion`, `hull`, `crew`, `drive`, `seats`, `fuel`; the vessels' and vehicles' types), and
  `kits/lizardmen`'s `lz-barge` (`settlements/komodo`, `settlements/basilisk/basilisk_plan.json`) already registers as
  `class: 'vessel'` (`ves_*`), but every older page
  that inlines core/tags is behind it (`tools/check_stale_baseline.json` records them). The rebuild clears them. With it: the Ring Sea
  (`kits/ringsea`, its REG already says `cls:'vessel'`), Xanadu's lake craft (`extra/88d-xa-lakecraft.js` / `88f-xa-harbour.js`),
  `core/engine`'s walkable deck/stair hooks (`36s-stair.js` / `37-wk-rec.js` for `cls === 'vessel'`), the Motor Vehicles kit and the
  Mechs register through core/tags as `vessel` and `vehicle` (the vehicles' own `class:'motor vehicle'` tag is a core/tags problem key:
  drop it for the class).
- **The Qiblai kit's cell range and college range** (2026-11-23, `settlements/opal-ford/src/89q8-of-order-pieces.js`): `of_cell_range`
  and `of_college_range` (`_m`, `_s`) are written on the kit's contract for Ōpal-Phōrḍ's Iridescent house only; move them into
  `kits/qiblai/src/89q3-qb-sacred.js` (as `qb_cell_range`, `qb_college_range`, the keys renamed in opal-ford's `89zp` and its test)
  and rebuild every page that takes the kit (Qiblai's, Lightwall's, Ōpal-Phōrḍ's).
- **The Iridescent Order's five furniture pieces into the catalog** (2026-11-23, `settlements/opal-ford/iridescent/FURNITURE.md`, NEW):
  the prism stand, the moonglass screen, the colour-chart rack, the lens-grinding wheel and the Order's banner are Ōpal-Phōrḍ's own
  props (`targets/town/90s-of-interiors.js` `ofPropMesh`) until they are catalog pieces in `kits/catalog/krator-master-furniture-xanadu.js`
  (it reaches 61 builds); then the hall's programme can furnish with them and the page's props go.
- **core/hamlet: a village whose link is on its own green** (2026-11-23, `openworld/xanadu-lake-shore`, HAMLETS-PLAN.md 3d):
  `KHAMLET.village` takes its frame from `spec.link - spec.site`; KSITES passes the site as the link, so a village laid at its site's
  own point (`near: [0, 0]`) gets a zero frame (`ux = uz = 0`), every lane collapses onto the green and its houses fail as "could not
  place: N houses", which reads like bad ground. The Lake Shore's two west villages pass `link` in their spec meanwhile. Fall back to
  `[1, 0]` when the link is nearer than the green in `core/hamlet/30-hamlet-village.js` (or in KSITES), or report it as its own error.
- **core/hamlet's Xanadu row: its fishing works** (2026-11-16, `settlements/kirstabal`): `KS_RING.fishingRow` (`src/42-ks-ring.js`) passes
  `KHAMLET.CULTURES.xanadu` with `works.fishing` (`xa_boatshed`, `xa_fish_racks`), `focusJobs.fishing` 90, `reach.fishing` 260, `landing`
  (`xa_quay`) and the racks' pending box; move them into the row itself (`core/hamlet/20-hamlet-cultures.js` reaches ten builds) and
  `kits/xanadu/src/87k-xa-lake-trades.js` into `xanadu.py` FILES (if every Xanadu page should have the lake's trades), then let
  Kirstabal pass the row by name.
- **core/hamlet's Xanadu row passed by name folds into the row** (2026-11-17, `settlements/xanadu/BUILD-OUT.md` wave 0.2):
  `core/hamlet/xanadu/23-hamlet-xanadu-row.js` (`KHAMLET.xanaduRow(opts)`: fishing as Kirstabal's `fishingRow` has it, the foci
  orchard, tea, saffron, estate, placer, pottery and quarry, the wayside shrine, the mine head, the reeling house, `shallows`, the
  `camp` overrides) folds into `20-hamlet-cultures.js` then, and the subfolder goes. This takes the fishing item above with it.
  Decide whether the shared row takes the shrine and the mine head (they move every Xanadu village: the switch with them off moves
  none, `node core/hamlet/test-hamlet-xanadu-row.js`); give `KHAMLET.census` the camp option from the row's `camp` and drop
  `openworld/oidong-highrift`'s `xanadu-camp` row (the work-camp item below). Its new keys are pending until
  `kits/xanadu/extra/88g-xa-works.js` is in the kit's `src/`.
- **The lake's trades' interior set** (2026-11-16, `settlements/kirstabal` K5): `kits/xanadu/src/87k1-xa-lake-rooms.js` adds the set
  `xanadu-lake` at run time; move it to `kits/interiors/sets/xanadu-lake.js` (the interiors sheet inlines every set, so it stales
  `kits/interiors`'s sets page: rebuild and `verify.py --sets --assert` it) and let Kirstabal take it through kit.json "interiorSets".
- **Any new file in `tools/` stales eight builds** (kits/catalog, crops, interiors, mechs, motor-vehicles, port; settlements/isle-demo,
  longsong record `tools/` as a listing input, likely Python's importer reading it): a rebuild clears it; worth a fix in `build_sources`.
- **Switch on checks 22-31 everywhere** (the survey of 2026-11-11, CORE-IMPROVEMENTS.md items 22-31; landed opt-in on
  `claude/survey-checks` with no page moved). Items 22 (lane without `KRATOR_GL=gpu`), 24 (DOCS-ONLY) and 31 (STALE PASS) are on
  already. The rest is `tools/checks_optin.json`; set each check's `"builds"` to `"*"` in this order, inside the rebuild:
  1. Pull and rebuild everything through `tools/build.py --all` (`python3 tools/lfs_needs.py <build> --pull` per build in a fresh
     worktree), so every `build-inputs.json` is current; then `python3 tools/check_stale.py --write-baseline` (it should be `{}`).
  2. `names`: rename the 99 view names holding an apostrophe and the 40 holding a colon (`python3 tools/check_views.py --list`),
     rebuild those builds, `check_views.py --write-baseline` (it shrinks), then `"*"`: `tools/build.py` fails any new one.
  3. `recorded`: add `buildlib.through_tools_build(__file__)` at the top of every `build.py` (the template is `tools/new_build/`),
     then `"*"`: a plain run of a build that lacks it is refused by `tools/check_port.py` (dep_graph and check_vendor pass
     `KRATOR_ALLOW_PLAIN_BUILD=1`).
  4. `minset`: `"*"`, then `python3 tools/check_assembly.py`; extend each MINSET page's list from `buildlib.CORE_BIOME_MIN`
     (`CORE_BIOME = buildlib.CORE_BIOME_MIN + [...]`) rather than baselining it; `--write-baseline` only for a page that cannot take
     one, with the why in its KNOWN_ISSUES.md.
  5. `samplers` and `drawn-ground`: `"*"`, then on the GPU lane (`KRATOR_GL=gpu`), per rebuilt page, `python3 tools/harness.py
     ratchet --write <page>` records the pages over 16 samplers or with an eye under the drawn ground in `tools/verify_ratchet.json`;
     fix them at each page's own turn. The sampler count replaces the Throne's `samplersOf` (the KSHADOW row above).
  6. Node tests: move each test's own `ok` onto `tools/ktest.js` as it is next touched (`core/terrain/test-scarp.js` passes a
     negative as a third argument to its own `ok`); then add a `test_all.py` step that runs `ktest.shadows` over every `test-*.js`,
     ratcheted, so no new test declares an `ok`.
  7. `check_source` now reads kits' top-level files: 19 keys were added to its baseline (catalog, fauna, mechs, motor-vehicles);
     fix them with those kits' rebuild and rerun `--write-baseline` (it shrinks).
  Write each baseline only from pages rebuilt and checked in that pass, never over a page you did not build.

- **The owed fixes the survey found** (2026-11-11, CORE-IMPROVEMENTS.md item 32; each moves the pages that take the file):
  - KHOOK clones re-run layers (`core/shader/06-core-khook.js:72,81`): about 40 sites do `c=m.clone(); c.onBeforeCompile=m.onBeforeCompile`,
    which stores m's composed hook as the clone's page hook, so each layer runs twice ("Vertex shader is not compiled"). Tag the
    composed hook with its state (`st.hook.__khst=st`); in the setter and in `state()`, when the value is another material's
    composed hook take that state's page as the page and copy its layers by name (`K.copy`), never the composite as a page.
  - `core/terrain/43-core-ground.js:199,223` inlines the eye as `-(viewMatrix[3].xyz*mat3(viewMatrix))` twice: put `K.EYE`
    (`#ifndef KHOOK_EYE`) in front of the kground layer's fragment declarations (about line 333) and call `kEye()` in both.
  - `BIO.alphaTex` (`core/biome/30-core-foliage.js:110`): `c.getContext('2d',{willReadFrequently:true})` (about 1 s a card now);
    the same at line 473 where that canvas's context is first made.
  - Library-card mipmap fringes (`core/biome/20-core-kit.js:242-245`, `BIO.libSwap`; the image lands raw in
    `core/materials/record/25-matlib-host.js:27`): when a `flipY:false` card decodes, draw it to a `willReadFrequently` canvas and
    fill the texels under alpha 48 with the mean opaque colour, as `alphaTex` does (`30-core-foliage.js:112-114`), once per cached sheet.
  - KKARST duplicate sink ids across branch levels (`core/terrain/39c-core-karst.js:184`): `id:'sink:'+lv+':'+si+','+sj` (the node
    ids already carry the level); the shaft and doline ids follow; add `s.level` to the radius hash at line 207.
  - The ISK error loop (`settlements/isle-demo/bundles.py:101` and `:173`): `reportErr` logs `console.error('ISK: '+m)`, which
    `core/engine/10-core.js:11`'s wrapper matches again (`/shader|WebGLProgram|GL_INVALID/`) until the stack overflows. Log with the
    saved `console.error` or `console.warn` there, and give the wrapper a re-entry guard.
  - The in-page audits on the drawn ground (item 28): the water audit (`core/water/ext/57-core-water-audit.js`), the cliff gate
    (`core/biome/40-core-place.js`, `cliffOld`) and the attach audit's ground (`core/biome/20-core-kit.js:609`, `BIO.attachAudit`)
    read `KDRAWN.h` when the page lists `core/drawn/10-core-drawn.js` and registers its ground; cameras stand on it.
  - Already done before the survey closed (no row needed): `kits/fauna/src/90-sheet.js`'s `_texPending` is a getter (15ca3363);
    hyperjungle's harvest-wood phrases parse (`node core/hamlet/test-hamlet.js` passes).
- **core/host's walker and pick underground** (2026-11-15, BUGS-2026-11-15.md C5-C8; branch `claude/host-walker-underground-main`):
  `core/host/90-host-camera.js` and `93-host-inspect.js` are edited; rebuilt so far only the underground test page
  (`core/host/underground`), the Hearths' camera station and Dhelv. `tools/reach.py core/host/90-host-camera.js` gives the rest (545
  pages on 2026-11-15); each grows by about 7 KB. What it changes, so a verify that moves can be read:
  - **F** stands on the floor under the eye (`KHOST.feet.under`: a KWALK floor at or below the camera, or the ground where it is not
    over the head), no longer the highest floor at x, z. On a surface page the same answer unless the camera was under a raised floor.
  - **The stand** no longer lifts a walker to a ground more than the walker's height over its feet (a roof: the surface over a tunnel,
    a cellar under the terrain); with no floor under it, the ground as before.
  - **The swept step**: a key step over 0.3 m is walked in 0.1 m samples against the walk blocks (`walker.sweep`; 0 turns it off).
    Normal walking at 60 fps (0.15 m a frame) is not swept; a sprint or a slow frame stops at a wall instead of being pushed through.
    `core/walk/frame/95-walk-frame-host.js`'s own sweep (riding, on `claude/clever-rhodes-cb3fec`) is then redundant and can go.
  - **The pin**: the ground's hit stays the pin where the scene draws something near it (every surface page with a terrain mesh: no
    change); where nothing is drawn there (a constant fallback ground, Loj Twenny's -60) or the camera is under the ground, the first
    mesh under the pointer, on the floor under it, or no pin. `o.pickScene: false` keeps the old pick. A double-click now raycasts the
    scene once (meshes only; instanced crowds over 2000 skipped).
  - **The inspector** skips hits on hidden parents and on points a cut's clipping planes cut away (`C.drawn`; 99-host-section's
    `KHOST.section.clipped` for its planes), and hits on rock KCAVERN's rock cut has opened (`KCAVERN.cut.discards` on the hit's
    own floor).
  - Leaving a walk (F off) puts the orbit's target 6 m over the floor under the walker, not over `ground()`.
  Checks: `node core/host/test-feet.js`, `python3 core/host/underground/check.py` (the C5-C8 checks with their negatives).
- **core/world: fold 41t into 41** (2026-11-11, PLAN-VOTH V2): `core/world/41t-world-town-water.js` wraps WORLD's water calls
  (`lakeWater`, `riverWater`, `water`, `waterBodies`, `waterBodyAt`, `riverLines`) and `init` from outside, because 41 reaches eight
  builds. At the next all-builds rebuild, take a town's water into 41 itself: `buildTowns` reads `drawn`, `water`, `river`;
  `W.water` calls the wrapped `riverWater` (today it calls 41's local one, so 41t replaces `W.water` too); the joined river's cut
  happens in `buildChannels`. `node core/world/test-town-water.js` must pass unchanged.
- **core/water: the flow's foam without blocks** (2026-11-16, the owner: "work on blocky ripple pattern; core update will be
  applied more broadly at next all-builds rebuild"). COMMITTED on `claude/exciting-curie-1c0022` (relief P3): `drawFlow`'s
  breakup is gradient noise (`wtrBreak`, twin `WATER.breakNoise`), and the ribbon shades by the slope over 24 m (`slopeV`,
  `PRESETS.flow.slopeWin`). Rebuilt and GPU-verified so far only in the eight pages `core/world/41` reaches (the open-world
  regions, Longsong, the isle demo's two city pages); every other page that draws core/water (`tools/reach.py
  core/water/51-core-water-kinds.js`: 149 build commands) is stale until the next all-builds rebuild takes it. Port both to the
  Godot twin (`KWater.ribbon`'s slope, the breakup in its flow shader).
- **core/hamlet: a work camp** (2026-11-11, the oidong-highrift region's Vein Camp; the owner: "mostly miners"). A camp's people
  are nearly all at work (no families), so `openworld/oidong-highrift/src/48-world-site.js` defines a row of its own,
  `KHAMLET.CULTURES['xanadu-camp']` (the `xanadu` row with workShare .9, household 4, a cookhouse, store and tally house for
  services). Give `KHAMLET.census` a `camp` option (or a row's `camp` overrides, taken when `spec.camp`) and pass it through
  `core/world/48s-world-sites.js` from a hamlet's spec, then drop that row. core/hamlet reaches 56 pages (`tools/reach.py`).
  The overrides exist since 2026-11-17 as `KHAMLET.xanaduRow().camp`, and `xanaduRow({camp: true})` is the row a region can pass
  today (`core/hamlet/xanadu/`; with `shrine` and `mineHead` false it lays the Vein Camp unchanged). **The census side is built,
  opt-in** (2026-11-23, `settlements/xanadu/WORKS-PLAN.md` W1): `core/hamlet/camp/26-hamlet-camp.js` wraps `KHAMLET.census` and
  `KHAMLET.village` (`spec.camp`: the row's overrides; `spec.share`: one record over several camps; a spec with neither goes to the
  old functions bit for bit), tested by `core/hamlet/test-hamlet-camp.js` (run by `test-hamlet.js`); `settlements/xanadu-works`
  takes it. At the next all-builds rebuild fold it into `30-hamlet-village.js`, pass `camp` through 48s, drop `xanadu-camp`.
- **core/world: a generic tent camp in the site planner** (2026-11-23, WORKS-PLAN.md W2): `KSITES.plan` (48s) pitches only the
  Beast Riders' camps (`kit.programs(tribe)`, culture `beast-rider`), so the Golden Tears' camp (`stearscamp01`) and the Great
  Caravan's halt at Erehwon are planned region-locally at load (`openworld/xanadu-oidong-highrift/src/48t-world-camps.js`, drawn by
  88t; the Lake Shore reads both in place) and are not in `plan/sites.json`. Fold `KWCAMPS` into 48s/88s (a SITE_SPEC `camps` entry
  with `kind: 'ring' | 'halt'`), bake them, and draw them with the Tents kit once it is sealed for another world (next item).
- **The Tents kit for another world** (2026-11-23): no `tents_bundle.py` yet, so the regions draw the tents as their forms' massing
  in their dress's colours (88t). Seal it as `XAK` is (`kits/xanadu/kit_bundle.py`) and let 88t draw the kit's own pieces near.
  The kit has no Dalab dress: the Great Caravan's tents fall back to `generic` (the record says so).

- **core/world: a kit on several biome overlays** (2026-11-11, the Iziz cluster's open-world region): `core/world/41-world-fields.js`
  matches a `WORLD_KITS` entry's `overlay` to one biome name (`k.overlay===name`). Let it take a list (`Array.isArray(k.overlay)?
  k.overlay.indexOf(name)>=0:...`), then drop the shim in `openworld/iziz-cluster/src/47-world-kits.js` (`WORLD_KITS.findIndex`, which
  tries each name of a list). It moves every page that reads core/world (the isle demo's two city pages, Longsong, Pinnacle Rock and the
  open-world regions) without changing what they draw.

- **The foliage guards' gaps closed** (2026-11-15, `core/biome/20-core-kit.js`, `tools/textures/check_cells.py`; the owner asked why
  ehighlands' cut-up beech, unattached fir needles and black fumarole passed the guards). Committed on `claude/objective-gagarin-623fb5`;
  only ehighlands' six pages are rebuilt on it. Every biome page takes them at its rebuild, and some will start failing their verify:
  - *The card guard refuses ONE plant cut into cells* (`plants 1` with `BIO.geo.cells` or `"sheet": "geometry"`). Measured on rift
    jungle and nhighlands montane: none. `check_cells.py` reports the same as `ONE CUT`: none outside ehighlands (fixed).
  - *"Library cards described by the page's pack" fails a page whose pack has no `plants`* (`BIO.cardMute`): the card guard has been
    judging none of those slots. Fifteen biome packs predate `plants` and will fail until `python3 tools/textures/pack.py <build>`
    reruns (it needs the library sets: `git lfs pull --include="core/materials/library/..."`): catch, crater-drylands, eastabyss,
    ebadlands, guilin, korona, necanyons, nsemiarid, nwouterwall, rift, sedesert (and its stations bowl, mantis, steppe), swbay,
    swhighlands. nsemiarid and the Throne write their pages' packs with their own code, as ehighlands did: check they copy `cell`,
    `base`, `stems`, `rise`, `plants`, `anchor`, `sheet` (or call `tools/textures/matlib_pack.py`). Once the packs say what each card
    is, the card guard may refuse some of their slots for the first time.
  - *The attach audit measures rods point to segment* (it sampled every 2 m): rift jungle 4 of 14,576 floating before and after;
    nhighlands montane unchanged for centred cards. *Stem-held crowns must sit within 0.15 m of a structure*: nhighlands montane's
    `lance` (card.prismgum, hanging, stems) has 151 of 207 stems more than 0.15 m off a twig, 35 more than 0.5 m (some with no
    structure near at all), which takes that page from 0.32% to 1.45% floating, over the 1% limit: hang each lance clump from its
    twig end as the ehighlands fir does (the clump's origin on the rod's axis).
  - *`BIO.insideOut` fails a mesh wound toward the ground*: none on rift jungle or nhighlands montane; the ehighlands vent cones were it.
  - *`check_cells.py` reads every geometry an expression names*: `BIO.geo.cells(BIO.geo.clump())` is a crown cut into cells, which it
    read as `cells` alone, so it never asked such a crown for its stems (the fir's needles). Fourteen crowns of sprigs centred on their
    twigs, written into `tools/check_cells_baseline.json` as known: ehighlands `laurel`, `epi`; nhighlands `birch`, `larch`, `maple`,
    `needle`, `pinnate`, `small`; rift `broadcloud`, `croton`, `leaflet`, `lobeleaf`, `needle`, `spray`. Each wants its sprigs' stems
    measured (by hand in `card-bases.json` where the automatic pick is wrong, as card.spruce's was) and `check_cells.py --fix`.
  - *Two more gaps, proposed, not written* (2026-11-15, the geyser/Godthrone looks session, `claude/geyser-godthrone-looks-793e2e`, which
    fixed both in its kits with station checks): (1) **albedo under soot**: the geyser Stills' sails (`biomes/hearths` 57, `ssail*`) were
    tinted sRGB 0x161618 (0.8% linear albedo) on an unmapped Lambert and drew as solid black cut-outs; fail a lit baked item with no map
    and no emissive whose instance colour x vertex colour is under ~0.02-0.03 linear luminance (negative: 0x161618). (2) **a packed
    texture nothing samples**: Godthrone station 9 packs `rockColumns` (station.json "tex") but the vault's lamp ShaderMaterial had only
    a flat uniform; fail a family the page's pack adds that no live material's map or uniform takes. Both belong beside
    `BIO.insideOut` in `BIO.guardChecks`, each with its negative.
- **core/world: a `xanadu` style** (2026-11-11, the owner: "Xanadu should be lush where moisture allows"). `41-world-fields.js`
  `BIOME_STYLE` has no entry for the 'xanadu' overlay, so it takes `desert`: the red sandstone palette and desert shaping (terraces .75
  at 55 m steps). Add a `xanadu` style and palette (green by wetness, as `openworld/xanadu-oidong-highrift/src/43-world-xoh.js`'s
  `WORLD.ground` wrapper does now; shaping nearer `highland`), then drop that wrapper. The shaping changes `WORLD.H`, so the region's
  `plan/sites.json` re-bakes. Same reach as the item above.
- **Fewer shader programs: key a hook's program on what its text holds, and pass its numbers as uniforms** (2026-11-11, the
  Xanadu load-time pass; measured on Erewhon, RTX 5060: 97 programs, about 58 ms each to compile under ANGLE/D3D11, the
  largest single load cost). Three places compile one program per value of a number written into the shader's text:
  - `core/biome/30-core-foliage.js` `leafMat` keys its program on the species (`'biofol|'+BIO.kitKey(key)`), though
    `foliageHook`'s text varies only with `aN`, `irid`, `axis`, `swayW` and `swayA`. Erewhon's vendored copy keys on those
    options already (`settlements/xanadu/src/86-bio-30-core-foliage.js`, its KNOWN_ISSUES): 97 to 91 programs there, the
    same text.
  - `core/materials/record/25-matlib-host.js` `KMAT.libKey`: one program per specular and breakup value (`|lib0.3|bu0.45_0.1_5`);
    about 30 of Erewhon's 49 Standard programs differ only in these.
  - `core/materials/opt/69a-world-uv.js`: one program per world-UV scale (`vUv=uv*_sw*0.5000`), about 15 more.
  Writing the numbers as uniforms (set per material in `onBeforeCompile`) and keying on the text alone would compile each kind
  once. The first is behaviour-identical; the uniforms change no value either, but every page that reads these files changes
  bytes (`tools/reach.py`: 558 and 151 pages), so it rides with the next all-builds rebuild.

- **core/tags: the culture `qiblai`** (2026-11-11, `kits/qiblai`): the Qiblai kit tags its buildings `culture:'qiblai'` (the owner's
  brief), which `core/tags/52-core-tags-vocab.js` does not list yet, so the kit's page counts it as an unknown value in `T.audit()`
  (counted, never thrown). Add `'qiblai': 'Qiblai'` to `CULTURE_NAMES` and `'qiblai'` to `NO_CATALOG` (it has no catalog culture file:
  its interiors take the Xanadu pieces), as Pylon and Talia were added on 2026-11-03. It moves every page that takes core/tags.
- **`BIO.attachAudit` measures a thin instanced item at points, not to its segment** (2026-11-11, found on the Labyrinth's station 1):
  `core/biome/20-core-kit.js:646-650` samples an instanced structure (a rod, a beam) at points CELL/4 (2 m) apart along its axis, less its
  radius, not point-to-segment as `core/biome/README.md` ("What held means") says. A card beside the middle of a long thin rod reads as
  floating. The case: the NW lowlands grass trees' flower-spike blooms (`biomes/nwlowlands/src/55-biome-nwlowlands-trees.js`,
  `B.grasstree`), 0.1 m off a 2.5-4.5 m rod, read 0.85-0.89 m off against a 0.57 m tolerance. It put `biomes/labyrinth` at 1.30%
  (90 of 930 blooms) while that read the NW lowlands in place (no longer: its own flora, 2026-11-12, draws no grass trees). The fix: for each near sample, the distance to
  the segment A-B less r (query KSPACE round the segment's box), and a case in `core/biome/test-attach.js` (a card beside a rod's
  middle holds; lifted off it, floats). It moves every biome page (the owner's call). Do not split the rods in a kit to pass the audit.
- **core/tags: the culture `kimr`** (2026-11-11, `kits/kimr`): add `'kimr'` to `CULTURES` and `'kimr': 'Kimr'` to `CULTURE_NAMES` in
  `core/tags/52-core-tags-vocab.js` (every page carries the vocabulary). Until then `kits/kimr/src/89-rows.js` adds it to its own page at
  load; drop those two lines when the vocabulary has it.

- **Opal Valley's strata recipes into `KSTRATA`'s own table** (2026-11-11, `biomes/opalvalley`): `opal-rhyolite` and `opal-firetuff` are
  data in `biomes/opalvalley/src/40-biome-opal-sites.js` (`OPAL_STRATA`), handed to `KSTRATA.add` by its ground; written into
  `core/terrain/35-core-strata.js`'s `RECIPES` they change every page that loads it, so they ride along. Then drop the kit's `KSTRATA.add`.
- **The culture id `glazier` into the core vocabulary** (2026-11-16, the Glaziers' set in `kits/tungang`): it is added opt-in by
  `core/tags/glazier/52g-tags-glazier.js`, which only the Tungang kit loads. Move `'glazier': 'Glaziers'` into `CULTURE_NAMES` in
  `core/tags/52-core-tags-vocab.js` (and `NO_CATALOG` until a Glazier catalog culture file exists), delete `core/tags/glazier/`,
  and drop it from `kits/tungang/build.py`. It moves every page that takes core/tags.

- **Owed from the merge of `ccr-a96f22b6-0hy616` into main (2026-11-18)**, each checked against this line before the merge (a
  worktree at a4ac64ebc builds the same findings), so none is the merge's own; the ratcheted lints' new keys baselined with this entry:
  - `check_assembly`: `settlements/thalaba` (both pages) and `settlements/pher` miss `buildlib.CORE_BIOME_MIN`'s `31b-core-leafset.js`
    and `34-core-impostor.js` (both opted into `minset`) and clash on `window._registered` with core/host; `settlements/qiblai` clashes
    on `window._materials` (two material libraries); `kits/ancients --target theodiga-today` clashes on `_projectFire` and `onerror`.
    `settlements/lightwall`'s committed page (its build fails: below) clashes on `KMAT`, `KratorFurniture`, `ROOM`, `_registered`,
    `_texPending`, `furnishRoom` and `onerror`.
  - `check_stale`: `settlements/azure-dream` ("external fragment 20-core-walk.js clashes with a fragment already in the order"),
    `settlements/lightwall` (BUILD RULES FAILED: `kits/qiblai/src/89q5s-qb-shells.js` is generative with no builder and no reseed(N);
    list it in DETERMINISTIC or give it a builder), `settlements/longsong` (KCHAR pieces: build where core/charactermodels is built).
  - `check_vendor`: `kits/tungang` drift in `37-wk-rec.js`. `check_views`: `kits/ancients` "The Pilgrims' Stair" (no apostrophe).
  - `check_source`: 41 keys (`|| number` defaults in kits/fauna, kits/mechs, kits/catalog's hykkousoi and scyvoi files, core/audio,
    core/coast, core/region; RAWTEX in swhighlands', abyssal-savannah's, greatchasm's and scablands' station stages, core/atmos fx).
  - Not ratcheted, failing on this line before the merge: the dependency graph (`--list-sources` fails for azure-dream, kirstabal,
    lightwall, pher, qiblai, thalaba), `tools/tests/test_bridges.py`, `openworld/outposts/tests/test-outposts.js` (eight places moved
    since the cut: Flooded Tower, Mav's Refuge, Mungo, Pinnacle Rock, Reed, Shade, Verge, Jimjam).
- **`kits/fauna/krator-fauna-xeno.js` line 26: `o.stock || 1`** (2026-11-16, the merge of `claude/siphon-pits-biome`; `check_source` ORNUM,
  baselined at the merge): write `o.stock == null ? 1 : o.stock`. The file reaches 30 build commands and 109 pages (`python3 tools/reach.py
  kits/fauna/krator-fauna-xeno.js`), so it rides along; then drop its key from `tools/check_source_baseline.json`.
- **Rebuild `settlements/longsong`** (2026-11-16): its page is behind `kits/crops` since the merge of the Siphon Pits and the painted
  highlands, and it can only be rebuilt where `core/charactermodels/dist/pieces/` is built (KCHAR PIECES MISSING in a cloud checkout).
- **core/atmos: a mist colour of its own** (2026-11-11, biomes/siphon-pits; the owner: it rides the next all-biomes rebuild). The height fog's
  mist takes the fog colour (`core/atmos/sky/89-atmos-j-fog.js`: `cM = fc`, in the shader text and its CPU twin). Add a uniform `atmFogMistC`,
  compiled only on a page that asks for it (as the belt is) and set from a `mist.colour` in `heightFog` (`core/atmos/host/89-atmos-j-heightfog.js`), so the Siphon Pits' deck reads amber from below without
  the page tinting the fog colour each frame. Then drop siphon-pits' per-frame tint (`src/89b-host-steam.js`, `deckView`) and give its lid
  the mist colour, which also cures the pale-cream lid seen from the rim (its `KNOWN_ISSUES.md`). The chunk's text is in every biome
  page, so it moves every biome page.

- **kits/fauna: the Köppen vocabulary lacks Cwb and Dsc** (2026-11-11, biomes/siphon-pits): `FAUNA_VOCAB.koppen` in `kits/fauna/fauna-core.js`.
  Region 98's hexapods (`krator-fauna-xeno.js`) carry their nearest classes (Cfb, Dfb) meanwhile. Add the two, then give the Ghaunt-Ox Cwb and
  the Flenser-Hound Dsc. It moves every page that bundles kits/fauna.
- **core/water: the ice record has no `levelAt`** (2026-11-16, biomes/siphon-pits station 14): `WATER.fields` (`ext/60`, `levelAt`) reads
  `S.levelAt(0)` from every surface but a flow or a still, and `WATER.ice` (`ext/54`) makes none, so a page with ice and water fields throws
  unless it adds one (siphon-pits' `stations/polynya/89wp-host-polynya.js` does). Give ext/54's ice `S.levelAt=()=>S.level` (or let ext/60 read `S.level`), then
  drop the page's line. It moves every page that lists ext/54 or ext/60.

- **`KSHADOW.units` counts what the GPU links** (2026-11-09, found by the Throne's fix): `core/shadow/host/12-core-shadow-host.js` counts
  declared samplers (some are never read and the GPU drops them), misses `scene.environment` on standard materials, and judges against the
  renderer's own limit (32 in SwiftShader, so shadows turn on where the GPU cannot link them). The Throne's `samplersOf`
  (`biomes/throne/src/89zz-host-core.js`) does all three right since 2026-11-09: move that into core, cap at min(16, GL), and drop the copies.
  It moves every KSHADOW page.

- **Two `||` numeric defaults left for the rebuild** (2026-11-10, test_all's source lint; not changed, because each moves pages):
  `core/furnish/50-core-furnish.js` line 65 `rec.scale || 1` (reaches 34 builds, 186 pages: `python3 tools/reach.py`) and
  `settlements/yuni/src/76-doors.js` line 180 `d.y||0`, `d.yaw||0`, `d.w||0.9`, `d.h||2.05` (Yuni's seven pages). Write them
  `x == null ? d : x` with the all-builds rebuild, then `python3 core/furnish/fingerprint.py`. (The other new ones, Highlands'
  `89y-hl-furnish.js`, Xanadu's `89y-xa-interiors.js` and the Vernacular's `69e6-vern-autobody.js`, are the interiors session's.)
- **`core/engine/fingerprint.json` is behind core/engine** (2026-11-10): Eternian's page differs from it with or without its old
  `src/37-wk-rec.js` (the triangles by material move), so the change came with the 2026-11-09 engine merges (interiors, walk
  records); rewrite it (`--write`) with the all-builds rebuild, after the engine kits' screenshots.

Fixes to shared code that reach every build (or most of them), parked until a change that rebuilds them all anyway comes
along: do them in that change, rebuild once, rewrite the baseline once. Take an item out when it is done.

- **The fauna runtime and the bison's size table** (2026-11-01, `kits/fauna/PLAN-MESHY.md`): the runtime gained `M.mats`, fitted
  anchors and `userData.anchorOn`, `krator-fauna-farm.js` the bison's variant 3 size, and the catalog a Bowl mantis and new model variants of the
  ant and the staghorn (a page without models draws those variants procedurally; check a page that picks a staghorn's variant at random). Since then: skinned model variants (`M.skin`, `rig/pack_skinned.py`, 2026-11-10: the giant bat's), family models (`spider#gilded`, `rig/family.py`), six new entries and model variants on four more, all with procedural fallbacks: the variant counts of those entries changed, so a page that draws a variant at random will draw them. The pages that bundle the kit (Voth,
  isle-demo, ash-nomads, desert-nomads, islanders, lizardmen, scyvoi, ringisles, sedesert and its stations, longsong) were not
  rebuilt: none takes a model that uses them, and on `claude/biome-rebuild` those pages were already behind their sources by
  far more than this (Voth 96 KB, the isle plan 52 KB). `settlements/longsong` does not build at all there: its `build.py` reads
  `openworld/little-demo/src/41-world-fields.js`, which d848c1577 moved to the isle demo.
- **A `dalab` culture pack for the Post-Apoc kit's sockets** (sources done, awaiting the all-builds rebuild; 2026-10-27, `settlements/span`): one `mkCulture({key:'dalab', ...})`
  in `core/sockets/80-cultures.js` (red ochre field `#a8382a`, earth edge, the God's single eye as the symbol, a new entry in
  `38-symbols.js`), so the barricade, the arena and anything Dalab raises from salvage fly its red. `mkCulture` draws from the
  shared stream at load (`jc`, `rr`), so the pack reaches every build that takes core/sockets (the catalog, post-apoc,
  ringsea, zeijani, dhelv, jimjam, longsong, screamers by its bundle): rebuild them with it; then Span passes `culture:'dalab'`
  for the Line and the arena (`src/8at-host-place.js`).
- **Water breakup on by default** (sources done, awaiting the all-builds rebuild; the owner, 2026-10-27, `core/water/PRACTICE.md` section 2 item 5): every lake, pool and river drawn
  from a few sines glints in stripes or a herringbone; `core/water/ext/56-core-water-breakup.js` breaks it up. Today it is opt-in
  (`WATER.breakupAll()`, `WATER.breakupFlows()`, or `WATER.BREAKUP_AUTO = true` before the water is drawn; eastabyss takes it). The flip:
  list `ext/56` in every build that takes core/water (the pooled `settlements/`/`kits/` lists and each biome's `CORE_WATER`), set
  `W.BREAKUP_AUTO=true` as the default in ext/56, rebuild them all, rewrite the baseline once, and look at a lake, a pool and a river
  in a few of them (the eastabyss look). `node core/water/test-breakup.js` and `test-gaps.js` say what moves. **2026-11-08:** left out of
  the core pass of the integration rebuild: 25 of the 43 builds that take core/water (by `51-core-water-kinds.js` in their `build.py`) do
  not list ext/56, and those lists are the builds' own files; the default flip alone would turn it on only in the 18 that do.

- ~~**Backport the succulent columns' quality pass**~~ **DONE 2026-11-09** (nsemiarid: `columnGeo` in `50-biome-nsemiarid-species.js`,
  the sail candelabra's arms seated in `60-biome-nsemiarid-floor.js`, 48 to 80 triangles a column, `column` 774,096 to 1,290,160
  triangles over 16,127 instances, `verify.py --assert` OK, page rebuilt and committed 2026-11-10; its page and the pages that read it,
  scablands' coulee and dambasins' graveyard, east and port, rebuilt: `biomes/nsemiarid/KNOWN_ISSUES.md`. The Throne has no succulent
  column: its `column` is the vent coral, a 12-sided ribbed lathe planted in the ground and closed at the top, and its brimstone
  candelabra's arms are one tube with the cup on the tip, so nothing to port. Shade reads sedesert in place since 2026-11-03, so its
  page had the pass before this work: 80 and 36 triangles a column, 3,508,729 scene triangles, before and after; rebuilt 2026-11-10, OK.) The entry as it was (the owner, 2026-10-26; done in `biomes/sedesert` on `claude/bowl-station-e15b2d`):
  `columnGeo`'s profiles start at a narrow, rounded foot with a closed cap and per-row normals (`50-biome-sedesert-species.js`:
  `G.column` 80 triangles, `G.columnLo` 36), `columnTree` seats every column on its arm (spots three to a segment along each arm,
  the column within the arm's radius, its foot sunk a third of a radius: they stood up to 1.6 radii plus 1.5 m off, feet in the
  air) and the arms are 7- and 9-sided tubes (`55-biome-sedesert-trees.js`). The same column geometry is in `biomes/ebadlands`,
  `biomes/nsemiarid` and `biomes/throne` (their `50-*-species.js`, and their trees fragment where it has a column tree) and
  vendored in `settlements/shade` (`src/50-biome-sedesert-species.js`: re-vendor). Port them in the final rebuild; it moves those
  pages' hashes and their per-type triangle counts (the hero column doubles). **2026-11-02:** ebadlands' moonflower column is ported (its turn); nsemiarid, the Throne and Shade are left.

- **Doors and glass: what is left** (the pass of 2026-11-03/04 put every building kit on `core/door`: KDOOR records with stable ids,
  the door kinds and leaf styles, KGLASS panes over the room card, E and the tip; each kit's KNOWN_ISSUES.md has its counts).
  - ~~Verge and the isle demo take the Vernacular's openings (69e5) but host no doors: their leaves are drawn shut and never
    open (no KDOORHOST tick, no E, no walk blocks). Give each page the host (`90-core-door-host.js`, as Highlands' `95-hl-doors.js`).~~
    Done (2026-11-09): Verge (`settlements/verge/src/95-verge-doors.js`: posed, the tick, E, walk blocks; its Vernacular bodies hollow
    with the interiors on); the isle demo's city page (`settlements/isle-demo/src/63-isle-doors.js`: each near Vernacular lot's doors
    registered in the world under the lot's id, the leaves posed, the tick, E at the view's target; no walk blocks, the page has no
    core/walk, and the kit locks the doors of its solid bodies). Left: the open world's hamlets still bake their leaves shut.
  - ~~`kits/interiors`: `50-shell.js` should register its own leaves in KDOOR (a kind and style, `KDOORHOST.object` or `posed`)
    and its glass in KGLASS (`kits/ancients-interiors/src/75-ai-doors.js` matches the shell's leaves by order meanwhile), and
    `IX.walk` should register a `ROOM()` shell's floor, walls and doors in core/walk so a sheet can run `KWALK.reach`.~~
    Done (2026-11-09): `IX.walk.room`; Ancients-interiors' sheet reaches 48 of 48 rooms with the doors open, 0 shut.
  - ~~Highlands and Xanadu: every body is solid (no 69e hollow walls), so every door is locked; Roketstad's `?interiors=1`
    unlocks the doors whose sill meets a furnished room, which still open onto the box's face. Hollow walls for the furnished defs.~~
    Done (2026-11-09, with `?interiors=1`): the Vernacular's auto bodies (`kits/iziz-vernacular/src/69e6-vern-autobody.js`) draw a
    furnished def's matching blocks hollow, its doors unlocked into the rooms; Xanadu has its interior set
    (`kits/interiors/sets/xanadu.js`; the citadel's defs skipped: the citadel sessions build them); the Hall of the Republic and the Fortress
    are planned room by room (`kits/highlands/hall/`, `kits/highlands/fortress/`). What is left: the kits' KNOWN_ISSUES.md.
    Finished and verified 2026-11-10 (the audit, `verify.py --interiors`: every floor of the Hall and the Fortress reached; the
    furniture textured): what is left is in `settlements/highlands/KNOWN_ISSUES.md` and `settlements/xanadu/KNOWN_ISSUES.md`.
  - Locus with `?interiors=1`: 32 floors are reached only through a locked door (the interiors kit's entrance is not the
    building's `F.door`). **2026-11-09: tried, not fixed.** `66-locus-furnish.js` `locfDoorsIn` now also unlocks the placement's
    door nearest each planned street door, but `LDOOR.reach()` still reads 146 starts, 390 of 510 floors reached (422 with every
    door open), as before: it unlocked nothing more. Find why (the planned doors' `at` and `floors[].y` against the placement's
    KDOOR records) before trusting it (`settlements/locus/KNOWN_ISSUES.md`).
  - ~~Mav's Refuge has no core/walk: its 1,883 operable doors block nothing, and it has no reachability audit.~~ Done
    (2026-11-09): `src/83-mr-walk.js` (the units' plans in core/walk, the doors' blocks, `MRWALK.reach`); decks and bridges not yet.
    Open: the audit leaves 86 apartments' ground floors unreached, and the first walk freezes the page (KNOWN_ISSUES.md).
  - ~~Yuni: the streamed interiors' room doors are not KDOOR records, and its own leaves swing 1.4 rad, not KDOOR's 1.75.~~
    Done (2026-11-09): KDOOR records while live, pruned by id. The swing stays 1.4 rad, recorded on each record (`R.swing`) so the
    export gives what the page draws; whether to move it to 1.75 is the owner's call (`settlements/yuni/KNOWN_ISSUES.md`).
  - Beast Riders (`kits/beast-riders`): its town copies draw Girder's and Mav's leaves shut and their walls whole (fallbacks in
    their `55-arch.js` / `56-levels.js`); the faithful port bundles `54-openings.js`, the glass of `81-glow.js` and core/door.
  - ~~Detail the plain leaves lost: the ger's brass bands, the vardo's scrolls, Pylon's and Talia's pulls (a leaf style with
    hardware, or a socket on the leaf).~~ Done (2026-11-09): `KDOORLEAF` hardware styles (`banded`, `scrolled`, `+pull`, `+ring`).
  - The arcologies' painted windows (canvas glazing, Crescent, Monolith, Hill, ...) stay painted: real panes would be tens
    of thousands of instances a building.
  - ~~Godot: the exports meet new materials (`kglass:*`, `kglass:room-lit`, the leaf meshes) and KDOOR's `export()` (kinds,
    pairs, styles); the importer should take the records and build the leaves (`godot/README.md`).~~ Done (2026-11-09):
    `godot/krator/kdoor.gd`; `godot/tests/door/door_test.gd` passes on 4.7.2. The isle demo's export does not carry its doors yet.

## With the final biome rebuild *(the owner, 2026-10-26)*
- **Place the garrison's arms** (the owner, 2026-10-22: not before a round that rebuilds the builds anyway, such as
  placing towns in the open world or adding a new core module). `kits/catalog/krator-master-furniture-arms.js` gives all
  30 catalog cultures a weapon rack (`<prefix>_<tier>_weapon_rack`, wall) and an armour stand (`_armour_stand`, floor)
  for `armoury`, `barracks`, `guardroom` and `watch` rooms (`kits/catalog/README.md`, "The garrison's arms"); no build
  bundles them yet. Per build: add `'arms'` to its `FURN_CULTURES` (the list it passes to `furniture_bundle.bundle`), then
  place the pair in its military rooms: the interiors sets' `armoury` rooms (`kits/interiors/sets/highlands.js`,
  `iziz.js`), Zeijani's `guardroom` program (`sets/zeijani.js` asks for types `rack`/`weapon`, so it finds them once
  bundled), the Iziz palace (`pal_armoury`, `pal_guard`), the Eternian fort's armoury and barracks
  (`kits/eternian/src/61-et-defence.js` draws its glaive racks as geometry; the Eternians' armour stand is in the file),
  and each settlement's barracks, gatehouses, forts and war camps in its furnish lists. Rebuild each page, run its
  `verify.py --assert`, then `tools/port_baseline.py`.

- **Real doors and glass across the kits** (the owner, 2026-10-20; for the next wide sweep over the building kits).
  Iziz's `settlements/iziz/src/69e5-iziz-openings.js` (2026-10-19) wraps the Vernacular's `vnDoor`, `vnWin` and `vnStrip`:
  a shut leaf registered in `IZDOOR` instead of a dark recess, see-through glass instead of an opaque plate, and the
  `vnPlate`, `vnHole`, `vnOpening` and `IZ_ROOMC` the vernacular fragments now call. Where it stands:
  - Iziz, Pylon and Talia build on Iziz's own fragment order (`--kit`), so they take 69e5 and `95j-iziz-doors.js`
    (walk blocks for shut leaves, the E key in `99-start.js`). Talia's branch (`claude/vassal-kits`) predates 69e5:
    rebuild and verify Talia when it merges main.
  - Verge (`build.py` `izv_files`, 2026-10-20) and the isle demo (`bundles.py` `izv_files`, c135f802a) take 69e5 only:
    their doors are drawn shut and never open, and a shut leaf blocks no walker. Ys vendors pre-69e5 copies of 70 and 71
    and takes none of it.
  - The kits' own doorway shapes cut a hole (`vnHole`) but hang no leaf: Pylon's `pylDoorway` (`69q-pyl-helpers.js`),
    Talia's arches (`69u-tal-helpers.js`). Give them a leaf in `IZDOOR`.
  - The other building kits (Ancients, Islanders, Lizardmen, the nomads, Scyvoi, Zeijani, Eternian ...) still draw
    doorways as dark voids and windows as opaque plates. Take them onto the door module below, not onto 69e5's wrappers.

Work parked for the coming rebuild of every biome kit: do it there, rebuild each page once, rewrite each baseline once and on
purpose. Take an item out when it is done.

- **Rebuild the old fungoid flora on `BIO.fung`** (the owner, 2026-10-26). `core/biome/33-core-fungoid.js` (planned in
  `biomes/outlands/PLAN.md` section 12, C2: `cap`, `bracket`, `bladder`, `pod`, `stalk`, `fringe`, `comb`, `tube`, `crust`)
  replaces the copies each kit carries: `bracket()` in the swbay, nwbay, rift and hyperjungle `65-*-dress.js`; the Throne's
  `cap`, `capTube` (`throne/src/55-biome-throne-trees.js`) and `bladders` (its floor file); swbay's `capTop`
  (`swbay/src/55-biome-swbay-trees.js`); nhighlands' `mushrooms`/`discStalks`; the `crust` in ebadlands and ringisles; the
  hyperjungle's `fungi`; the `stalk` in rift and xanadu trees. Each kit switches to the core parts, its own copy goes, and
  its page is checked by eye against the old one before the baseline is rewritten (the shapes will move a little). Needs
  the fragment built first (the Outlands' phase O3); the kits that read those fragments in place (Korona's stations, the
  Throne's) follow automatically.
  **2026-10-26:** the fragment is written (`core/biome/33-core-fungoid.js`, `test-fungoid.js`, core/biome README "Fungoid parts")
  and nhighlands' mushroom and disc stalk are on it; the rest of the list is still to switch. **2026-10-27:** nwbay's bracket is
  on `BIO.fung.bracket` (its page only, `?fung=0` the old dome; `biomes/nwbay/PLAN.md`). **2026-10-27:** swbay's mushroom, parasol, bracket and the cap-tree's `capTop` are on `BIO.fung` (its page only, `?fung=0`; `biomes/swbay/PLAN.md`). **2026-11-02:** ebadlands' dressing crusts are on `BIO.fung.crust` (its pages, `?fung=0`; `biomes/ebadlands/PLAN-STATIONS.md`).

## Port: next *(the ordered critical path; GODOT-PLAN.md, amended 2026-10-02)*

The one ordered list of Godot port work. The plans hold the why: `GODOT-PLAN.md` (phases, rules, milestones),
`biomes/WORLD.md` (the biome order), `core/materials/PLAN.md` (the library), `core/simulation/PLAN.md` (the sim),
`settlements/ys/GODOT.md` (Ys). When one of them changes the order, change it here in the same commit.

1. **DONE 2026-10-02:** the audit tool sees the shared exporters; Iziz's and Dalab's city build passes retagged;
   the minimap split into data and host (port lint 16 warnings to 2); the Voth lineage in the hash baseline;
   `core/rand` with golden vectors and its GDScript twin; Ys's city takes it.
2. **The Godot spike** (GODOT-PLAN.md Phase 7, "The spike"). **Underway 2026-10-05:** `godot/` holds the project,
   five exports (hyperjungle and rift tiles, Girder and Iziz as glTF, Iziz's atmosphere, Yuni's records) and their
   importers; `krand_test.gd` passes in Godot 4.5; the first gap list is in GODOT-PLAN.md ("The spike: first findings").
   Open: the look on Travis's machine in Forward+ (`godot/CHECKLIST.md`), the editor's glTF import, and the route
   Travis's friend used for the Voth kit (ask what it was).
3. **The Ancients re-vendor session** (`settlements/iziz/KNOWN_ISSUES.md`): Ancients to Iziz to Highlands to Xanadu
   and Reed Lake, and Jimjam, with `--assert`, screenshots and a new baseline. It gates Iziz's audit and its
   material work (M5).
   **DONE 2026-10-13** (on `full-refactor`). The Ancients fragments were already current down the chain (the 2026-10-06
   re-vendor holds: Iziz 35, Highlands 13, Jimjam all match); the session cleared the chain's other drift, each copy's
   diff read: Iziz's four `core/biome` copies were only behind (re-vendored, `--vendor-bio`); Xanadu's and Reed Lake's
   `91-probe.js` were behind Highlands (re-vendored; the new line is inert without `HLF`); Highlands' `91-probe.js` and
   Reed Lake's `73-hl-carve.js` (pre-catalog furniture; Reed Lake has no `FURNISH`) are kept on purpose and named in a
   new `ADAPTED` set in their build.py. Nothing was fixed upstream in `kits/ancients`. `verify --assert` before and
   after: identical on Iziz's city, Xanadu, Erewhon and Reed Lake (each build's KNOWN_ISSUES.md); Iziz's verify.py runs
   again (stage 0b had taken its `GL_ERR`). Every chain build's `--vendor-check` shows only recorded ADAPTED drift.
   Open: the baseline rewrite for the five changed pages (Iziz's `iziz.html`, Xanadu's `xanadu.html` and `erewhon.html`,
   Reed Lake's two) when the pages are committed; the composing `useGroupXF` (Iziz's 69c) is still not in
   `kits/ancients`' 50-registry.js (Jimjam's open item); Dalab and Ys, outside this chain, keep their non-Ancients drift.
4. **The scoped hand pass** (GODOT-PLAN.md 3.3). **DONE 2026-10-03: the ten biome kits** (tags, split notes, Notes paragraphs; `BIO.download()` split into `core/biome/43-core-export-host.js`, port lint 2 warnings to 1), **and Girder and Voth** (their `PORT.md`: tags and notes for every fragment over 10 KB, split notes, the Notes paragraph of PRNG, noise, `terrainH` and palette copies). **Iziz DONE 2026-10-05** (its `PORT.md`: tags corrected by reading the code, split notes on 90a, 90b, 90c, 85 and the mask readers, the own-copies Notes; Voth's `68-props.js` split note added). Still to do: Ys. Other builds
   keep provisional tags until a port session touches them.
5. **The biome reseeding event** (biomes/WORLD.md, Order 6): `KRAND` hash and noise, cell seeding, level-free
   records and a baked heightmap in one change, one screenshot set, one baseline rewrite. Brings `core/terrain`'s
   field with one kit as its first consumer. Needs the spike's findings on terrain.
6. **Ys's P3 placement pass** on `KRAND` (settlements/ys/GODOT.md item 4), as two data passes and one draw pass. **First pass
   DONE 2026-10-05** (`88-city-place.js` records, `88b-city-draw.js`): open are the bridge graph, the host types and the
   foreign sets (settlements/ys/KNOWN_ISSUES.md). ~~The Ancients chain re-vendored into Ys~~: **done 2026-11-09**, Ys reads
   the chain in place (every vendored fragment but its 18 adapted copies, with the Vernacular's 69e5, the Highlands kit's
   71c and core/door; settlements/ys/KNOWN_ISSUES.md).
7. **The Girder pilot** (core/materials/PLAN.md). **Material half DONE 2026-10-03:** `core/materials/record/` (`KMAT`,
   `TEX.def`, adapters), `tools/textures/pack.py`, Girder on the library (`?mat=proc` for the old look). Open: the
   four texture gaps (leafy, web, ghostwood, prism gum) and the owner's look review. **Iziz, the second pilot, DONE 2026-10-13**
   (its city materials on the library, every KMAT record naming its hook; two gaps with prompts: `settlements/iziz/KNOWN_ISSUES.md`). **`core/furnish` DONE 2026-10-05:**
   Girder, Mav's Refuge, Locus, Highlands and Post-Apoc place through it, fingerprints unchanged (`core/furnish/README.md`).
   **`core/tags` steps 1 and 2 DONE 2026-10-05:** the registry, vocabulary, label, node test and uid twin; Yuni on it,
   its records arriving in Godot as node metadata (`core/tags/README.md`). Steps 3 and 4 DONE the same day: core/furnish's five
   builds register their furniture (fingerprints unchanged); Iziz's `REG` and Voth's `PLACED` are read in. Next: the biome kits, with the
   reseeding event (`core/tags/PROPOSAL.md`).
8. **`core/mask` DONE 2026-10-05** (Iziz, Dalab, Erewhon, Roketstad place from it; Voth since 2026-10-08; `core/mask/README.md`). Next: Iziz's export
   on the `KRATOR_EXPORT` shape (M5). **M5 DONE 2026-10-13** (`core/export/README.md`, "Iziz"; `godot/tests/export/iziz_test.gd`).
9. **The host shell, narrowed**: the biome kits and one settlement per lineage; the rest when next touched.

**Normal maps after the JPEG switch** *(found 2026-10-06; off the critical path, nothing is broken today)*. The library's
normal maps became `normal.jpg` (JPEG q95, 4:4:4) in `9b46d9e`. Godot does not read the library yet: `godot/krator/kmat.gd`
loads each build's `tex/` pack, which is WebP. What is left:
- **40 sets still on `normal.png`**: the ones added on main after the switch (the eastern badlands' and Ys's sets among them;
  `git grep -l '"normalMap": "normal.png"' -- 'core/materials/**/meta.json'`). Convert them the same way (Pillow,
  `quality=95, subsampling=0`) and point their `meta.json` at `normal.jpg`, so the library has one format.
- **`kmat.gd`'s `_tex()` reads only WebP and PNG** (`load_png_from_buffer` for anything not `.webp`). Add a
  `load_jpg_from_buffer` branch before Godot reads library sets directly, as `GODOT-PLAN.md` plans.
- **Packed normals are lossy WebP, which is always 4:2:0** (`tools/textures/pack.py`, `webp(..., 92, 'RGB')`): X and Y
  live in red and green, so the pack halves their resolution, a bigger loss than the JPEG switch avoided. Write packed
  normals as lossless WebP or PNG.
- **Re-packing moves the baseline.** A build that re-runs `pack.py` on a converted set gets very slightly different
  normals (decoded from the JPEG), so its `PORT-BASELINE.json` hash changes with nothing to see. Re-pack Girder, Iziz,
  Ys, Yuni, Mechs and Motor Vehicles in one change with one baseline rewrite, after the packed-normal format above.
- `core/materials/record/23-mat-record.js:59` still names `normal.png` in its convention string; change it in that
  same change, since it alters Girder's built page.

## Features

- **Open-world terrain: terraces only where they belong, roughness that follows the ground** *(the owner, 2026-11-12:
  "a lot of the terrain seems to follow simple contour lines and produces a terracing effect we don't usually want";
  parked for later)*. The cause is not mainly the scale model's 2 km pixels but the mesa pass in
  `core/world/41-world-fields.js` `H()` (the `S.terr` block, about line 326): it snaps the height to fixed 30-80 m steps
  at 25-75 % strength in the desert, badland, korona, savanna, highland, dryland and abyss styles wherever the relief is
  40-4,200 m, so every hillside there gets flat treads along its contours. The plan:
  - terraces only on bare, flat-bedded rock: gate the pass by a rock or strata mask (the style's `rock`, `KSTRATA` where a
    region has it) times patch noise, and let each step's level wander with position so treads do not follow contours;
  - roughness that answers slope, rock and drainage: stronger on steep and rocky ground, ridged erosion detail running
    downslope (rills down a face, not round bumps), calm on floodplains and farmland; every wavelength under 2 km, so the
    scale model cannot see it (the `rough` passes at 420, 90 and 13 m read only the style and the local relief today);
  - the scale model's own staircases are the other half, already built: `WSMOOTH` (`core/world/40-world-smooth.js`) on
    `claude/exciting-curie-1c0022`, opt-in per region (Pinnacle and Oidong-High Rift so far). It changes the river carve
    in `41`, not `H()`'s detail lines, so the two merge cleanly; turn it on for the other regions once it is merged;
  - a node test with a negative (a contour-terraced slope fails it), then rebuild and GPU-verify every page `41` reaches
    (`python3 tools/reach.py core/world/41-world-fields.js`: the open-world regions, Longsong, Pinnacle Rock, the
    isle-demo settlement pages).
- **Revisit taxes when the economy is more fleshed out** *(the owner, 2026-11-03)*. For now money is taxed only by an
  excise on imports and exports (core/simulation/PLAN-MONEY.md, M5). Wage, sales, land or poll taxes, tolls on the roads
  and harbour dues wait until wages, prices and the player's towns run: decide then which each nation levies, and who
  the taxes pay (soldiers, officials, the watch). The tribute player settlements owe a nation (same plan) is separate.
- **DONE (first batch): `core/minimap/88-core-minimap.js` (`KMAP`), in Voth.** **Minimap** *(Menagerie: `src/moria/walk.js:130-149`)* **[G data]**. A 2D canvas panel, drawn from data
  rather than from the rendered scene. A base layer is painted once into an offscreen canvas: every walkable
  floor, sorted by height so upper levels cover lower, coloured by level, with labels. Each update (at most
  4 Hz, only while the panel is open) copies the base layer and draws the viewer's dot and view wedge.
  Hovering names the floor under the pointer; clicking walks there.
  - For Krator: a shared `core/` fragment that paints from each build's `PLACED` list (footprint, rotation,
    tag) plus hill shading sampled from `terrainH()`, and water. Colour by tag, click to fly or walk.
    Start with Voth, whose `PLACED` list is already exposed (`settlements/voth/src/85-probe.js:73`).
  - Godot: the same records drawn in a `Control._draw()`, almost line for line. Better still, bake the base
    layer to a PNG at export time and ship it with the tile.
  - Optional: a one-time overhead orthographic bake to a texture as the background, for the painted look.
    Hide the sky, fog and inspector helpers during the bake.

## Viewers, interaction and effects *(the owner, 2026-10-07; raised during the Zeijani kit, not started)*

- ~~**Doors that open.**~~ Done (2026-11-03/04): `core/door` (KDOOR's kinds: swing, slide, lift, tilt, fold, iris, hatch,
  pairs, double-acting, sprung; KDOORLEAF's styles; KDOORHOST's E and tip) in every building kit. What is left is under
  "Doors and glass: what is left" above.
- **One walk mode and one set of controls in every viewer.** Implement walk (first person on the `core/walk`
  floors, steps and slopes, collision with its blocks) everywhere, and standardise the UI and the keys across all
  builds and kit sheets: the same buttons, names and shortcuts (inspector, cut-away, night, polygon tool, walk).
  The Zeijani kit's page (`kits/zeijani/src/92-camera.js`) is one reference (retired 2026-10-18: the kit's sheet and Dhelv
  are on core/host, whose `90-host-camera.js` carries those controls; `kits/zeijani/README.md`, "The engine"). **[web]**
  *Under way (2026-11-09, branch `ccr-55bd6ee1-p1si44-walk`).* The one key map and the one walk mode are
  `core/host/92k-host-keys.js` (`khost.KEYS`; `core/host/README.md`, "The one key map" and "The one walk mode"): a build
  names its controls by id (`KHOST.standard({std: {night, cutaway, door, interiors, shadows}})`) and gets the same button,
  words and key; the walker is sub-stepped (it went through thin walls), `window._walk` lets `tools/harness.py walk`
  drive any page, and every `verify.py` checks `one-key-map` and `walk` (a raised floor stood on, a wall that stops the
  walker) on a page that takes it. A build is **adopted** when its page takes `khost.KEYS`, its controls go through `std`
  and its `--assert` passes both checks.
  - [x] core/engine and every kit on it (`kengine.HOST`, `CORE_DIRS` with `core/walk/box`), each `--assert` passing: Scyvoi,
        Ash Nomads, Desert Nomads, Islanders, Lizardmen, Resources, Post-Apoc (moved onto core/host), Eternian (with interiors:
        `?interiors=1` 58 buildings, 172 rooms, 1021 pieces, no errors), Yeti; Tents (build.py only; its own
        `interiors-reachable` fails, as on the page before: the Tents session's verify was being rewritten)
  - [x] build.py `khost.KEYS`, controls through `std`, `--assert` passing: Construction, Zeijani (its C became X; Night, Door,
        Shadows), Necanyons (N), Verge (E), Span, Girder (E), Reed Lake, Shade, Jimjam, Screamers, Iziz (city and Vernacular: E),
        Ys (city: N; kit), Longsong (its interiors re-baked on the merged kit), Locus and Mungo (E; they read one take)
  - [x] adopted, the key map and the walk passing, the build's own checks failing as on the page before this work:
        Guilin (fruit drawn; foliage attach 31.96%), Pinnacle Rock (N; foliage attach 1.87%), Dalab (swlowlands/glossy
        282,687 instances over the 250,000 cap with no `capWhy`, since it reads the biome in place)
  - [ ] Mav's Refuge (E; the key map and the walk pass): `walk-and-reach` could never read `MRWALK` (the page's script is
        scoped; now `window.MRWALK`, 2026-11-10). Its first real run fails: 370 of 2373 floors unreached from the doors of 1480
        units (284 units with no unlocked door), most of them the stores' floors (`mix.3.store.floor.0`, ...): the interiors'
        stores are not entered from their units' doors (src/57a-interiors.js, 83-mr-walk.js)
  - [ ] Yuni: E is the key map's Door, but F is Yuni's own walker (`DOORS.walk`) and the page hands the host no `KWALK`:
        port Yuni's walker onto core/walk (Locus, Mungo, Girder and Mav's Refuge share the Yuni engine; theirs are on the host)
  - [ ] not yet: the biome kits but Guilin and Necanyons (`khost.KEYS` in `build.py`, the take's Night through `std`;
        Geyser and Godthrone have Day / Night buttons of their own, so N wants a std entry with no button: a 92k option);
        crater-drylands binds L to its fire tool (the polygon tool's key: `keysCheck` reports it); Metropolis (its X);
        Dhelv (its C and N; the Zeijani session); Highlands, Xanadu (the interiors session), Noah's Regret (C and T: record the
        clash), Voth's city target, the isle demo; the sheets with their own camera (kits/ancients, kits/port and
        biomes/dambasins's copy, kits/ringsea, the catalog engine's pages) move onto core/host first. Then `KEYS` joins
        `khost.SHELL` at an all-builds rebuild.
  - [ ] the merges of claude/dreamy-tesla-wzp8hw and ccr-55bd6ee1-p1si44 (2026-11-10) change `core/host/95-host-probe.js` and
        `core/biome`: every core/host and biome page not rebuilt since is behind its sources until the all-builds rebuild
  - [ ] tents and round bodies drawn from cylinders and cones register nothing in `core/walk` (the nomads' tents, Tents):
        the walker walks through their cloth (`core/engine/README.md`, "Controls and walk")
- **Interiors in every building kit that has them, with a cut-away.** Integrate `kits/interiors` (its sets, the
  furniture placer through `core/furnish`) into every building kit whose buildings have a corresponding interior
  set, each with a cut-away that opens them. **[G data]** for the plans.
  - [x] Done once in `core/engine` (`91i-interiors.js`; `core/engine/README.md`, "Interiors", 2026-11-09): a kit names its sets in
        `build.py` (`kengine.interiors([...])`); X opens the building nearest the view storey by storey (the host's cut-away),
        `?interiors=1` / U plans and furnishes every building with an item through `core/furnish`, rooms and pieces in core/tags,
        floors and walls in `core/walk`. Wired: Eternian (checked: 58 buildings, 172 rooms, 1021 pieces, no errors);
        Post-Apoc takes its units for the cut-away.
  - [ ] the other sets belong to kits on other engines (Highlands, Iziz, Talia, Pylon, Reed Lake, Yuni, Locus, the Eastern
        Abyssal, the Beast Riders; Zeijani and Noah's Regret on their forks): each wires its own, or moves onto core/engine
- **One flame and heat-haze effect.** Look at `biomes/crater-drylands` and `biomes/throne` (the caldera) and make a
  standard flame plus heat-shimmer effect shared by every build (fires, braziers, burners, lamps, lava). **[G shader]**
- **Water: an audit and one best solution.** Audit the water effects across the builds and settle on the
  best-looking one that appears to run downhill under gravity, leaves no gaps, fills where it should (basins,
  channels, pools) and stays out of where it should not (no water through floors, walls or banks). **[G shader]**
  for the surface, **[G data]** for where it fills.

## Card sheets shown whole *(2026-10-23)*

Most library cards are sheets (three by three plants, or an atlas of pieces). A page shows ONE of them when the slot in
its `materials.json` names a `cell` (the pack carries it; `BIO.libSwap` and n semiarid's `libCard` window the texture
to it) or when the page cuts it by hand (`libCell(..., CELL(i, j))`, or the geometry's UVs: Korona's `cellUV`). Miss
both and every instance shows the whole sheet: n semiarid's steppe grass read as "a sheet of 9" and its maple keys flew
as a sheet (the owner, 2026-10-23; fixed: its inline pack writer dropped `cell`). Korona's punji-pit lids show the whole
`card.litter` atlas (`biomes/korona/KNOWN_ISSUES.md`). The library does not mark a card as a sheet, which is why nothing
caught it.

`python3 tools/textures/cell_audit.py [--list] [<build>]` lists, per build, the slots that take a sheet card with no
`cell` (215 in 25 builds today) and how the build writes its pack. Each slot is a candidate, not a bug: open the page's
code and see whether it cuts that slot by hand.

- [ ] **Audit every candidate slot**, build by build, and give each a `cell` or a hand cut, or a note that the whole
  sheet is meant (a crown card may want a cluster of nine sprays: n semiarid's aspen, blossom, broom, lobed and sage
  crowns are such, unjudged). Biggest first: Throne 39, Crops 44 (it picks cells by code: check how), Korona 15,
  Necanyons 15, Longsong 14, crater-drylands 12, ebadlands 10. Take one screenshot of each judged slot.
- [ ] **The inline pack writers that drop `cell`**: crater-drylands, ebadlands, ehighlands, shighlands, oidong (the Throne's passes it since 2026-11-02),
  Zeijani and Girder each keep a `matlib_pack()` copied from ebadlands that leaves `cell` out of the pack, so a slot
  given a `cell` in `materials.json` still shows the whole sheet. Nothing shows wrong today (their celled slots are cut
  by hand, or not swapped in: ebadlands' `litter`), but it is a trap. Pass `cell` (n semiarid's `build.py`, one line),
  or move them onto the shared `tools/textures/matlib_pack.py`, which keeps it. A page's hashes do not move unless a
  celled slot reaches the page.
- [ ] **Mark sheets in the library**: a `sheet: [3, 3]` (or the atlas's grid) in each sheet card's `meta.json` record,
  written by `tools/textures/cards.py`, so `pack.py` can warn when a build packs a sheet with no `cell` and no
  `"whole": true` saying it means it; `cell_audit.py` then reads the mark, not the source note's words.

## Biomes: the port plan's findings *(GODOT-PLAN.md, re-assessed Oct 2026)*

The nine biome kits are next in the audit order (`GODOT-PLAN.md` 3.3, step 2) and are what milestone M4 (a
first tile in Godot) needs. They start ahead: one core (`core/biome/`), one PRNG, a host reached only through
`BIO.init`, a placement pass (`TREES` records) apart from the draw pass in every kit, an exporter
(`BIO.export`), a probe and `--assert` in each, and pages that match `PORT-BASELINE.json`. The plan and the
order are in `biomes/WORLD.md` ("Against the port plan"); the contract is `biomes/GODOT.md`. Suggested order:
the audit, the shader kinds, tags and ids, the host, the reseeding event, then variants with opt-in heroes.

- **DONE 2026-10-03: the port audit for the ten kits** (tooling, no tag; the scoped hand pass, `GODOT-PLAN.md` 3.3; the text below is what was asked, kept for the record). One finding differs from it: `65-dress` is not a `BIO.grid` pass, it samples the host's shells (`BIO.upFaces` and the like) and puts; its note says so. nwbay has since moved onto the shared core (2026-10-03).
  *The tool part is done (2026-10-02): `PORT-INDEX.md` names the `biome` exporter for every kit on the shared core,
  (nwbay too, since 2026-10-03).* Correct the provisional tags in each
  `biomes/<kit>/PORT.md` and write the split lists into its Notes: `45-host-stage` holds `terrainH`, the water
  and the fields, which are data `core/terrain` replaces (note it "split", not plain host); `55-trees` is
  already a placement pass and a draw pass; `60-floor` and `65-dress` place and draw in one pass (`BIO.grid`
  then `BIO.put`); `85-host-tower` is a preview prop (a builder); `82-host-sky` becomes a `core/atmos` sky
  preset.
- **[G shader] One copy of each biome shader hook, in the core.** The iridescent bark `BIO.iridBarkMat` is
  done (2026-10-12): it was written in five kits (eastabyss, rift unguarded with different signatures;
  nhighlands, shighlands, xanadu guarded), so with several kits resident the last definer loaded won (a residency
  bug: eastabyss before xanadu gave xanadu's boles eastabyss's tints). It is now the `irid` kind in
  `core/biome/30-core-foliage.js`, one definition with Rift's signature and eastabyss's tints as the defaults;
  every kit's baked geometry and tints were proven unchanged. *Done 2026-10-25 (branch `claude/biome-rebuild`):* the
  two-tone gloss bark is `BIO.glossBarkMat` (nwlowlands, swlowlands), the impostor is `BIO.farMat({rule:'irid'|'gloss'})`
  (rift, swlowlands), nhighlands' hanging sway is `BIO.hangMat`, and swbay's and nwbay's phase-driven fauna body is
  `BIO.phaseAnimMat` (`35-core-anim.js`, which swbay and nwbay now list). The kits' names stay as one-line forwards. Proven
  by same-view screenshots before and after (the HTML changes, the pictures do not). Godot's set is now the seven
  shaders: leaf card, bark, iridescent bark, gloss bark, far impostor, hanging sway, fauna body (`anim` and `anim-phase`).
- **[G data] Tags and ids on what the kits place.** Only nhighlands (harvest) and swlowlands carry tags in kit
  data, and no species has its Köppen classes. Put class, species, biome, Köppen and harvest in the `BIO.def`
  options, and give every item, bucket and placement record a deterministic id in build order, so
  `BIO.export` carries them and `core/tags` (Phase 2) takes the kits as they are.
- **[G data] One fauna kit** (Travis's call, `biomes/README.md`): every biome's fauna and the settlements'
  creatures in one kit on `core/biome/35-core-anim.js`, tagged by biome (the item above), each animal's motion
  a function of time (`aP0`/`aP1` paths; the life layer section below). swbay's local `animMat` retires with it.
- **[web] The biome hosts as the first `core/host` customer** (Phase 1). The kits' host fragments
  (`host-stage`, `-sky`, `-build`, `-camera`, `-probe` in ten builds, `host-tower` in eight) are each their own
  version (`PORT-INDEX.md`, host-shell copies), but a kit reaches its host only through `BIO.init`, so these
  are the easiest builds to put on one shell. The stage's terrain, water and fields go to `core/terrain`;
  its DOM goes to the host. `BIO.download()` is split out (2026-10-03) into `core/biome/43-core-export-host.js` [web];
  it joins `core/host/` with the rest in Phase 1.
- **[G data] Placement records carry no LOD level.** Each kit picks a tree's level (hero, lite stand-in, far
  impostor: `T.lv`) as it places it, from the tree's distance to the showcase's LOD spine (`BIO.lodD`): the
  preview's camera baked into the data. Godot has no spine and needs every tree at every level. Placement
  writes level-free records; the draw pass picks the level in the preview; the export carries hero, stand-in
  and impostor as levels of one record (`biomes/GODOT.md`, "Not done yet").
- **[G data] One reseeding event for every kit.** `rng` in `core/biome/10-core-head.js` is mulberry32
  (integer: it ports bit for bit). `h3` is a `Math.sin` hash, and `vnoise`, `fbm` and so every field and zone
  rest on it, which a GDScript generator cannot reproduce. Do together, once: `h3` onto `core/rand` (Phase 2),
  placement seeded by cell (`biomes/WORLD.md`), the level-free records above, and each kit's `terrainH`
  closure baked to the `core/terrain` heightmap. Each of these moves every plant; together they cost one
  screenshot set, one `tools/port_baseline.py --write` and one gallery update, not four. Tune preset views
  after it, not before.
- **[G data] Trees as variants by default, hero trees opt-in (Travis, Oct 2026).** Trunks and branches are
  built unique per hero tree and merged into buckets; only leaf cards, floor and dress are instanced. Godot
  grows the flora at run time (`biomes/WORLD.md`), so unique trees everywhere would mean porting the tree
  builders to GDScript, which the plan rules out (a builder crosses over as its meshes). So: K baked variants
  per species and habit (12 to 24, say) exported as meshes, chosen by each record's seed, with per-instance
  scale, turn and tint; only placement is ported, and the golden test compares records, not meshes. The
  preview gains too: instanced variants instead of unique trees cut held triangles (rift holds 25.7M in 1,737
  meshes) and build time.
  - **Hero trees stay, as an opt-in** (`biomes/WORLD.md`, "Hero trees: an opt-in"). The hero builders are
    kept (each variant is one of their seeds). A record marked `hero` by a site or a hero zone is built unique,
    baked per tile as its own mesh and streamed by Godot, never regrown. First users: Mav's Refuge, whose
    architecture is built on its trees' `trunkR` (and Girder's hypertrees, the same builder), and
    hyperjungle's hero disc. A hero budget per tile; a preview switch between every tree a hero and heroes
    only where opted in.
  - Mav's Refuge's and Girder's `60-trees.js` carry a provisional host tag in their `PORT.md`; they are
    builders, and their trees cross over as meshes with the settlement.
- **[G data] `BIO.export` onto the shared vocabulary** (Phases 3 and 4). Material records onto `{family,
  colour, map, roughness, metal, emissive, doubleSided, alphaTest, hook}`, with `hook` naming a library shader
  (the kinds above); a `convention.colour` per table (the biome export is linear, the atmosphere's sRGB); then
  fold it into `core/export/` as the `krator-world` template. The canvas painters (3 to 9 per kit) bake to
  PNG, which the export already does. *Done 2026-10-13 (`core/export/README.md`, M4):* in the `krator-world`
  container each biome material carries the KMAT vocabulary (family, roughness, metal, specular, hook, lib, scale,
  tint) beside its own kind and options, and library maps travel by reference; `BIO.export` itself is unchanged.
  Open: `hook` still names the kit's kind, not a library shader (stage 2e).
- **[G native] Preview LOD: adopt `core/lod`, stop growing the kits' own.** The plan freezes runtime LOD as
  preview-only. A kit's per-chunk `BIO.range`/`minRange` is data (it becomes Godot's `visibility_range`) and
  stays; `BIO.lodTick` is preview machinery. `core/lod` already knows the biome sets (class `biome`,
  `minPx:0`) and no kit lists it: measure it on rift (clustered proxies for merged buckets, frustum-culled
  instance copies) before any more bespoke culling. The paused rift pass keeps its range data and profiling.

## Underground and interiors *(Menagerie: Moria)*

- **DONE as a registry: `core/walk/20-core-walk.js` (`KWALK`); no build writes to it yet.** **[G data] The carver registers walkable floors and blockers as it builds** (`src/moria/carve.js`).
  `room()` and `passage()` write `{rect,y}` or `{a,b,w}` floors and `[x0,x1,z0,z1,y0,y1]` blocks as they
  build. The walker, the minimap and click-to-go all read that one list, so they can never disagree with the
  geometry. Krator's walk solids (girder `83-walk.js`) and its geometry are kept separately. In Godot the
  same list becomes collision shapes and a navigation mesh source; export it next to the geometry.
- **[G data] Walls are built split round their openings**, not cut afterwards: each wall is pieces left of,
  below, above and right of each opening (`carve.js:28-36`). No CSG is needed, and no hidden faces. The
  geometry exports as it is.
- **[G native] Draw underground only when you are under ground** (`src/moria/deep.js:15-24`). Everything built
  after a marker goes into one group. That group is drawn only when the camera is below the terrain or near
  a gate, and the terrain is hidden while you are under. It saved a laptop from crashing. Screamers' vaults
  and the dam tunnels could use this. Godot: occluders and visibility ranges do this, but the group toggle is
  one line if wanted.
- **[G data] Fade to dark underground, and carry a lantern** (`deep.js:26-41`): ease a 0-to-1 "under" value.
  Scale the sun, hemisphere and ambient down from the values the day/night code just set, close the fog in to
  black, and move a camera lantern that already exists at intensity 0. Lights are never added or removed,
  because that recompiles every material. Export the "under" volumes and the curve; Godot drives its
  Environment the same way.
- **[G native] Three moving lights for a whole city** (`src/moria/realm.js:31-44`). There are a few point
  lights, moved four times a second to the nearest of a list of light spots. Hundreds of lamp heads are one
  InstancedMesh of unlit material. Godot's Forward+ renderer handles many lights; the pool still matters on the
  Mobile and Compatibility renderers. Export the light spots either way.
- **[G shader] Shafts of daylight without lights** (`src/moria/halls.js:163-172`): an additive open cone from
  the window to the floor, an additive pool on the floor, and a bright sky card behind the opening.
- **[G shader] "See inside": the mountain as glass** (`deep.js:46`): terrain at opacity 0.18 with depth write
  off. Hidden features (the Endless Stair) are drawn only in that mode.
- **[G native] Polished stone underground uses Phong** (per pixel) so lantern light runs in the walls. Lambert
  is per vertex and loses a small light on big planes. Godot shading is always per pixel.
- **[G data] One switch for lit and dark states** (`src/moria/city.js:259-262`): a whole city changes from
  inhabited to ruined by swapping colours and emissive intensity, never geometry. This fits Krator's ruins and
  inhabited variants. Export both palettes.
- **[G data] The generator checks that every hall is covered by rock** (`tools/make-moria.py:20`). This could
  be an assert in `verify.py` for carved builds; run on the export, it guards the Godot side too.

## Interiors *(Menagerie: the Backrooms, `src/backrooms/`)*

Krator's interiors planner (`kits/interiors/src/46-planner.js`) already splits a floor plate, cuts openings
and outputs walls, doors and a room graph, so the layout side is covered. What the Backrooms adds is about
making many rooms look lived-in cheaply.

- **[G data] Light baked into vertex colours** (`level.js:216-241`). Every surface is cut into a grid of about
  0.6 m. Each vertex adds up the ceiling panels within 7 m that it can see. Visibility is a 2D walk along the
  grid lines, so light goes through doorways and walls cast shadow. A direct term and a soft fill term are
  clamped to 1.7. The cost is nothing per frame and no real lights. Godot's LightmapGI cannot bake rooms
  generated at runtime, so export the colours as mesh `COLOR`. Use it for furnished rooms, with the catalog's
  lamps as sources.
- **[G shader] Per-lamp flicker without lights** (`level.js:176-188`, `:437`). Each vertex stores how much of
  its light comes from a flickering panel and that panel's phase (attribute `aF`). The shader dims by
  `share·(1−flick(t,phase))`, so the wall flickers with the lamp. Lamp state is on, dead or flickering.
- **[G data] Grime from world-space noise, not in the texture** (`textures.js:7-9`, `level.js:243-252`).
  Textures are one clean repeat at real size (wallpaper 1.2 × 3 m, a ceiling tile 1.2 × 0.6 m). Stains, damp
  creeping up walls and puddles go in vertex colours from fbm over world position, so no stain repeats.
  Stains tint brown rather than grey. This fits every Krator interior and ruin.
- **[G data] Room-variety rules as numbers, one generator per level** (`level.js:28-51`):
  - the chance two rooms merge, leaving columns where the wall would be;
  - partial walls that stop short;
  - one-door versus full-width openings;
  - weighted ceiling heights, with narrow halls more often low;
  - a lighting mode per room: full, alternate, dim or dark, with rates for dead and flickering panels;
  - lamp colour, ambient light and fog.
  Office, car park and pool hall are one generator with three presets. Worth adding to the interiors
  programmes as a `variety` block.
- **[G data] Streaming interior chunks from the seed** (already listed under Worlds): each chunk boundary
  forces one opening, so neighbours always connect.
- **[G shader] Pool caustics** (`level.js:199-213`): two crossed sine fields, `pow(|a+b|·0.6, 3)` for the
  bright lines. Ten lines; useful for baths, cisterns and fountains.
- **[G data] Procedural ambient sound** (`sound.js`): mains hum as a 120 Hz sawtooth through a band-pass, a
  60 Hz square, a high whine and hiss, all slowly modulated. Each level swaps the recipe. The parameters
  port to Godot's `AudioStreamGenerator`; the Web Audio code is [web].

## Props to harvest into the catalog *(Menagerie)*

Most Menagerie props are city-scale, one primitive each, so few are worth taking. The ones listed are pure
geometry merged per material, so they are **[G data]** unless marked otherwise. Convert each to the
`kits/furniture/SPEC.md` shape (`F.*` and palette keys, a declared size). Iziz's and Voth's props are
Krator's own already.

**Real gaps:**
- **Siege engines** (`src/middleearth/hosts.js`):
  - a counterweight trebuchet (`mkEngine`, :249) whose beam sits on a pivot group, so it can swing; it needs
    a sling and a windlass added;
  - a four-storey siege tower (:293) with braces, a hide front, wheels and a drawbridge;
  - a ram slung on chains under a wheeled gantry (:327, parametric length and radius).
  Suits Beast Riders, Voth and Republican. They are too big for furniture, so make a small siege kit or a
  `type:'engine'`. The pivot maps to a Godot AnimationPlayer.
- **Pressurised outpost modules** (`src/europa/details.js:54`, one recipe with a `kind`):
  - a hull on legs with domed ends, an airlock door, a window strip and an antenna; the lab version adds a
    radiator;
  - a domed tank;
  - a ribbed Quonset garage;
  - a steam-pipe run on trestles (:27).
  For Ancients sites, intact or ruined, and post-apoc. Low effort. (Its dishes duplicate
  `kits/ancients/src/86-dish.js`.)
- **Vehicles** (`src/arrakeen/machines.js`):
  - an ornithopter with hinged wings (:20);
  - a carryall whose grapples drop and whose suspensor bags fill (:46);
  - a tracked harvester (:73).
  Each is a factory returning a Group with `update()`. The silhouettes are recognisably Dune, so reshape them
  before taking them. For Ancients, post-apoc and the Iziz spaceport.
- **A shoji and tatami building kit** (`src/infinitycastle/kit.js`):
  - `room()` in ken modules (:74): tatami, fusuma, shoji, a veranda, a hipped roof and a paper lamp;
  - galleries, stairs and bridges;
  - sliding panels.
  It is already data-shaped (`B.box/quad/beam` by material name). The paper surfaces are canvas textures
  [web]; bake them to PNGs. For Republican's Korean strand or Xanadu.
- **Signage** [web for the text] (`src/fleshpit/signs.js:20,51`, `src/nightcity/neon.js:39,107`,
  `src/kowloon/life.js:132`): boards, backlit signs, blade signs, projecting signs on arms. Kowloon's window
  cages, AC units and pipe bundles (:105) suit post-apoc facades. Bake a PNG atlas of Krator strings in izani
  glyphs. Do not port neon.js's `BRAND` table, which holds real trademark names.

**Ideas for existing pieces:**
- **Guardian statue** (`src/moria/city.js:71`): a robed, bearded figure with an axe, scaled by height. A
  generic ruin statue.
- **Forges** (`src/moria/city.js:148`): take the hood and chimney, and the glowing pour channel. In Godot the
  coal and the pour need emissive materials.
- **Festival marquee** (`src/shire/party.js:26,35`): three peaks, a valance and trestle tables, plus
  pavilions. For Rustic.
- **A lofting toolkit for hull builders** (`src/starship/parts.js`: `lathe`, `tube` with cross-sections,
  `sweep`, `grille`): could help `kits/ringsea/src/42-rs-hull.js` and the Ancients.

Skip: the street furniture (one primitive each), Moria's headframe, carts, chests and well, the gondolas, and
the pumpjack. Krator's are better or the same.

## Shafts, caverns and organic interiors *(Menagerie: the Flesh Pit, `src/fleshpit/`)*

Krator has no vertical shaft, cavern network or organic interior. The eastern abyss paints its shelf wall on
a backdrop sphere, and `core/terrain/36-core-carve.js` only does overhangs. Candidates for a new
`core/terrain/37-core-shaft.js` beside carve, and for locus, eastabyss and the screamers' underground:

- **[G data] The shaft as a profile, with layers in data** (`organism.js:50-75`). `radiusAt(d)` interpolates
  radius per layer, adds cavity bulges and pinches at layer boundaries; `wallAt(d)` flares the mouth to meet
  the hole cut in the ground. Every other module places itself from these two functions. The profile could
  feed carve's `recessD`, so the heightfield opens over the shaft.
- **[G data] The shaft wall** (`organism.js:164-206`): rings of 72 vertices every 6 m. The radius is
  multiplied by wobble, wandering veins (`pow(max(cos),7)`), grooves and creases. Vertex colour darkens with
  depth. Pure array maths, so it becomes an `ArrayMesh`. Rock or a sinkhole with a different palette.
- **[G shader] A strata cut-face shader** (`section.js:91-176`). Depth below the local ground is warped by
  fbm into bands: soil, laminated rock with cracks, seams, then folded beds. Each bed has its own thickness,
  creases between folds, `fwidth`-faded fibre, a wet sheen along each fold crest, lens bodies the beds bow
  round, and beds sagging round the shaft. Every input is world position. With a rock palette it is a
  geology material for any cliff or cut face (`core/materials`). Krator's strata today are `sin` shelves
  (`settlements/highlands/src/73-hl-carve.js:217`).
- **[G native] Back faces only for interiors** (`organism.js:110-115`): walls drawn `BackSide` with faces wound
  outward. From inside you see the far wall; from outside the near wall vanishes, which is a free cutaway.
  Godot: `cull_front`.
- **[G shader] Fluid that fills a volume to a level** (`lungs.js:41-48`): a copy of the cavity mesh whose
  vertex shader clamps `y=min(y,uLevel)`. It is a flat-topped body that rises as `uLevel` animates. For
  flooding cisterns, basins and ruins.
- **[G data] Side tunnels from a small spec** (`tunnels.js:41-110`): `{d,a,r,len,bends,wander,drift,state}`
  makes a Catmull-Rom tube that drifts in plan and depth. A black cap at the far end makes the light die
  rather than the tunnel stop. The mouth gets a bulkhead, a grille, a ladder and a blinker. `state`
  (sealed, surveyed, worked) adds rails, a cart and work lamps. Godot: `Path3D`.
- **[G shader] + [G data] Breathing** (`organism.js:78-107`): a sine wave running down the axis pushes
  vertices radially in the vertex shader. The same function in JS drives the matching machinery (rams), so
  steel and wall stay in step. It is the injection technique `core/biome/30-core-foliage.js` already uses
  for sway.
- **[G shader] A pulse band running along a conduit** (`anatomy.js:30-46`): emissive
  `pow(max(0,sin(phase+y·k)),sharp)`, with a two-stroke heartbeat. For glowing conduits, ley lines and power
  cables (`core/materials`). See also City 17's climbing pulses below.
- **[G data] Lamps hung by who installed them** (`organism.js:131-141,893-906`): the colour names the owner
  (sodium, fluorescent, mercury vapour). Strings every 40 m, denser where people walk. All glows are one
  additive point cloud. Wall brightness scales with depth. An `underground` atmos preset.
- **[G data] Organic forms:**
  - brain-fold bulbs from crossed sine fields, with groove depth reused as colour (`springs.js:44-73`);
  - lobed lungs (`lungs.js:54-96`);
  - a branching tree steered to stay inside a volume (`lungs.js:104-152`), for roots, coral and cave growths
    (`core/biome` trees have no containment test);
  - wall growth whose density rises with depth, merged per material (`organism.js:226-279`).
- **[G data] Visitors:** queues that advance a slot every 5 s, and evacuation blended to the nearest exit with a
  per-person delay (`visitors.js:35-52,129-160`). Krator's crowds have neither. Creatures that climb the
  wall by riding `wallAt(d)` (`fauna.js:178`).

**City 17's climbing light pulses** (`src/city17/landmarks.js:104-115,163-167`) are not a shader. Each conduit
is a column of nine translucent unlit boxes, and the pulse is a separate bright box. Every frame its height
is `fract(time·speed + phase)` mapped onto 10–90% of the tower. It is pushed out from the axis by the tower's
own width at that height (`wid`, `dep`), so it hugs the taper. Its opacity breathes with a sine and with
night. **[G data]** as written: a pure function of time, which Godot can drive identically. The cheaper way
in both engines is the pulse-band shader above, **[G shader]**: one emissive band on the conduit material,
with no extra mesh.

## Small set pieces worth taking *(Menagerie)*

- **[web] → bake to PNG, or [G shader] A painted pine on gold leaf** (`src/infinitycastle/mats.js:92-122`,
  `fusuma()`). These are the sliding panels at the back of every room, including Muzan's lab. It is painted
  on a canvas:
  - gold leaf laid in 14 px squares, each a little different, with fine seams;
  - bands of cream cloud (suyari-gasumi) in rounded strips;
  - rows of wave arcs along the foot;
  - a pine drawn as a recursive branch: quadratic-curve limbs that narrow by 0.6 a step, with an ellipse of
    needles at each joint;
  - black lacquer frames and round pulls.
  It is painted across four panels so a run reads as one picture. The recursive pine is a small, reusable
  recipe for any painted screen, mural or banner (Xanadu, Republican). Bake it to a PNG for Godot, or keep
  the recipe as data and paint it at export.
- **[G data] + [G shader] A glowing floor sigil** (`src/infinitycastle/places.js:291-294,409-424`, Akaza's
  hall). A 1024² canvas is drawn with `shadowBlur` for the glow: rings, twelve needles with branch ticks that
  make it a snowflake as well, diamond points and a tick rim. It lies on a plane 3 cm over the floor with
  **additive blending and depth write off**, tinted cyan. Each frame its opacity breathes
  (`0.7+0.25·sin(1.3t)`) and it turns slowly (`0.05t`). A cyan point light and a glow sprite above make it
  light the room. Repurpose it for ritual circles, Ancients floor seals, portals and landing pads. In Godot:
  a `Decal` with emission, or an unshaded additive quad; the sigil could be drawn in a shader from polar
  coordinates.
- **[G shader] Horizon fire-glow behind the far range** (`src/minastirith/shadow.js:58-67,124`). It is one
  plane at 0.99 of the backdrop radius, a little north of east, facing the camera. It uses an additive
  shader (`One, One`) with no depth test, drawn just after the sky (`renderOrder -0.7`). The fragment is an
  elliptical Gaussian, `exp(-r²·9)` with y stretched 2.2×, in deep orange. Its strength breathes with two
  slow incommensurate sines (`0.55+0.15·sin(0.7t)+0.08·sin(3.1t)`). The same file lights the underside of
  the cloud deck red toward the fire (`:96`: `exp(-max(d.y,0)·7)·smoothstep(-0.2,0.8,d.x)`).
  - **For Krator's far volcano:** swbay's far-country volcano (`biomes/swbay/src/45-host-stage.js:212-252`)
    and Voth's baked volcano dome (`settlements/voth/src/21-sky.js:188+`). Put the glow on the volcano's
    bearing, raise it at night through `atm_night`, and tint the low sky and the base of the plume.
  - In Godot it is a quad in the sky layer, or the same Gaussian added in the sky shader on the volcano's
    direction, which is simpler.

## Fixes *(Menagerie runtime)*

- **[web]** Recover from a lost WebGL context: `preventDefault` on `webglcontextlost`, show a panel, restore.
  No Krator build does this (`src/core/shell.js:31-43`). One place for it is `gallery/krator-bar.js` `tune()`.
- **[web]** Isolate errors per subsystem in the frame loop. In Voth, `updateLife`, `skyAdvance` and the HUD
  sit outside the try (`settlements/voth/src/80-camera.js:303-319`), so one throw means it never draws again.
- **[web]** Isolate errors per pass in the build, too (`src/core/diag.js`, `section(name, fn)`: the error goes on
  screen under the pass's name and the next pass runs). In Krator a throw at the top level of one fragment stops
  every fragment after it, so a broken flora pass leaves a blank world; Locus's `window.onerror`
  (`settlements/locus/src/00-head.html:96`) reports it but does not carry on. The fragments share one scope, so
  wrap each pass's call (terrain, buildings, flora, life, dressing), not each file. Belongs in `core/host/`
  (`GODOT-PLAN.md`, `92-host-panel.js`) beside the loop's isolation above.
- **[web]** Input guards: clear held keys and pointers on blur and on hidden tabs; end a pointer when
  `buttons===0`; ignore keys while typing (`src/core/input.js`).
- **[web]** Leave a cut plane installed and park it at `constant=1e7`, instead of swapping `clippingPlanes`
  and recompiling (`settlements/yuni/src/76-doors.js:259`, `kits/interiors/src-walk/70-walk.js:213`).
- **[web]** Call `renderer.compile(scene,camera)` before hiding the loader.
- **[web]** Redraw the shadow map only when the target moves or the sun turns.
- **[G native]** Adaptive resolution (detail before pixels, remember a ratio that failed, hysteresis). Godot
  has resolution scaling built in; the controller logic would carry over if it is ever needed there.

## Rendering ideas *(Menagerie)*

- **[G shader]** Cloud shadows and rain darkening through one shared shader chunk (`src/core/env.js:102-118`).
  Godot: a shared `.gdshaderinc` over the `atm_*` globals; apply the cloud shade in `light()`.
- **[G shader]** Lit windows as an emissive texture for massed and distant facades
  (`src/engine/stages/03-blocks.js`).
- **[G shader]** Lamp schedules computed per instance on the GPU (`env.js:82,192-197`). This matches
  `core/atmos/GODOT.md`, which already puts hours in `INSTANCE_CUSTOM`.
- **[G native]** A dithered fade before LOD drops an object (`env.js:170-181`). Godot's visibility range has a
  dithered fade mode.
- **[G shader]** Fill a cut solid by drawing its back faces as flat hatching (`src/blame/mats.js:166-176`).
  Godot: `FRONT_FACING` in a `.gdshader`.
- **[G native]** A per-frame bounding sphere for movers, so off-screen herds and boats are culled. Godot: a
  MultiMesh `custom_aabb`.
- **[web]** One shared polygon-offset ladder. **[G data]** A shared mitred ribbon helper for roads, rivers and
  walls, whose output is plain geometry.

## Surfaces *(spiderbench, github.com/xikhar/spiderbench, read 2026-10-05; detail in `core/materials/PLAN.md`, "From spiderbench")*

- **[G shader]** Analytic coursing: ashlar and brick joints from UV math and a per-block hash, not a painted
  canvas. A `coursing` TEX kind, pilot on Voth's canton walls.
- **[G shader]** `breakup` gains `rough` and `grime`; grime samples one shared streak sheet (8 by 16 masks, each
  opening picks a cell by hash). One generated image; prompt to write in PLAN.md.
- **[G native]** A detail normal at close range: record field `detail`, Godot `detail_normal`; one shared
  `detail.*` library set.
- **[G data]** Any hash shared between placement code and a shader is written once in `core/` with GDScript and
  `.gdshader` twins and a comparison test.

## Worlds *(Menagerie)*

These are the best Godot candidates: generators whose output is data.

- **[G data]** One land-cover map per world, read by both the ground shader and plant placement
  (`tools/make-yellowstone.py:457-575`, `src/yellowstone/nature.js`). In Godot it is a splat texture for the
  terrain shader and the input to placement.
- **DONE: `KRELIEF.fields` in `core/terrain/38-core-relief.js`; no build uses it yet.** **[G data]** A warped-lattice field and hedgerow generator for the highlands and lowlands
  (`tools/make-shire.py:152-178`).
- **DONE: `KRELIEF.range`, `join` and `volcano`.** **[G data]** Mountain height functions: range walls, junctions that don't double up, volcano cones
  (`tools/make-mordor.py:84-181`).
- **[G shader]** Distant mountain ranges drawn at their true angular size as a backdrop
  (`src/minastirith/shadow.js`). A seamless open world may not want it, except for ranges beyond the map.
- **Data side DONE: `KRELIEF.river` (surface and slope per vertex); the foam shader is still to do.** **[G data] + [G shader]** River foam driven by slope (stored per vertex), and a water surface that never
  climbs downstream (`src/rivendell/water.js`, `src/isengard/isen.js`).
- **DONE in Girder (`settlements/girder/src/83-walk.js`):** the walker is a circle that slides round corners and along walls at any angle (closest-point push-out), and it rides the lift cages (the cage floor is a solid that moves with the cage, and a walker aboard sends the lift off). Girder's stair flights, which sloped the wrong way, are rebuilt with treads.
- **[G native]** Pull a buried camera back along its line of sight (`src/blame/main.js:115-142`): Godot has
  SpringArm3D. A circle walker with corner push-out (`src/backrooms/level.js:395-419`), and a lift you can
  ride: CharacterBody3D does both, platform motion included.
- **[G data]** Chunks generated from the seed alone, with doors forced at chunk edges
  (`src/backrooms/level.js`). This is the same tile-by-tile loading `biomes/WORLD.md` plans.
- **[G data]** Timed set pieces as pure functions of t, publishing signals on a bus (`src/fleshpit/incident.js`).
- **[G data] + [G shader]** Tides: one sea level that everything at the shore reads (`src/beachcity/details.js`,
  `ctx.sea`). Beach City's holds the tide (high water, half a metre lower twice a day by the clock, or held low or
  high by a button, easing rather than jumping), a swell of a few centimetres and the events' drain and surge; the
  water sheet, the surf lines, the boats and the swimmers all follow it, and ground below the waterline is
  coloured wet sand and sea bed. For Krator: `seaLevel(t)` as a pure function in `core/atmos` beside the wave
  field, driven by `core/clock`, with the build's shore lines, moorings and wet-ground mask reading it rather
  than a constant. Port, Ys and the Ring Sea are the first takers. In Godot it is one global shader parameter
  plus the same function in GDScript for anything that floats.

## Water *(audit of every wet surface and Halcyon, github.com/billpwchan/halcyon, read 2026-10-10; the plan is `core/atmos/WATER.md`)*

**Refactor-scale: it touches `core/atmos`, `core/terrain`, sixteen biome hosts and about thirty-five pages, so it goes
with `full-refactor`, not on `main` while the refactor is paused.** Thirty-nine builds draw water; five take the shared
wave field, the rest run ten different ripples or static materials, nine clocks never wrap, nothing but the Ring Sea's
hulls floats, and no water reflects the sky. `WATER.md` section 1 is the table.

- **Phases 0 and 1 started (2026-10-12): `core/water/` exists** (README, data and twins for the six kinds, the node test,
  open water on the CDLOD mesh with skylight and Jacobian foam); the Ring Sea kit and the geyser basin take it. Next: the
  rest of Phase 1's takers (WATER.md section 5), then the shore field.
- **[G data] + [G shader]** `core/water/`: one module with six kinds (open, shore, flow, fall, still, wet), each with
  a data side and a CPU twin (`heightAt`, `flowAt`, `seaLevel`), one clock (`atmWaveT`, whole cycles), skylight
  reflection and depth absorption. A build names its kinds and writes no water shader.
- **DONE for ringsea and geyser (2026-10-12), `core/water/50-core-water-draw.js`.** **[G native]** A CDLOD water mesh (Halcyon: instanced 17×17 nodes, 13 levels from 8 m): ends ringsea's swell
  fading past 600 m and Voth's 75 m rim cells. First, and independent of the wave model.
- **[G data]** A distance-to-shore field (jump-flood on the land mask) driving shoaling, a breaking lip, swash and wet
  sand. The one visible upgrade for every coast.
- **[G data] + [G shader]** One flow shader for every river ribbon: a flow field from `KRELIEF.river` (its slope is
  stored and unread), advected normals, foam from slope, convergence and bank distance. Falls arc; plunge pools churn.
- **DONE (2026-10-12, core/water open water).** **[G shader]** Foam as the Jacobian with a 1.8 s decay (the Ring Sea kit has the first half).
- **[web] now, [G shader] later** The FFT ocean as an opt-in second backend behind `atmos_waves` (three 256²
  cascades, deterministic seed, 76-mode CPU twin), for the worlds whose sea is the subject. After the above.
- **[web]** A 512² ripple sim for wakes, plunge pools and fountains.
- `W.wet` is computed by the weather and read by nothing: wet ground is the cheapest row.

## Lava *(Menagerie: the fire on Kharak, `src/homeworld/kharak.js:15-61`)*

Krator has no molten lava. swbay's flows are cold vertex colours (`biomes/swbay/src/45-host-stage.js:231-236`),
and its plume is a chain of spheres.

- **[G shader] A lava field shader.** *Done in part 2026-10-25 (branch `claude/biome-rebuild`): `core/atmos/fx/89-atmos-fx-lava.js`
  (`ATMOS.lavaMaterial`, `PRESETS.lava`), lifted from the Throne caldera's lake, an integer hash, the module clock, a `flow` drift
  and a `channel` mode; the caldera's lake and the tube's stream take it. Still open: the downslope flow map (one drift per
  surface today) and the emission output for bloom (it returns `hotK`; the three.js page writes colour only).* Kharak's fire is a single fragment shader, with no particles. Fire fronts
  are a thin band where a drifting fbm crosses 0.5. A finer front drifts the other way. Embers come from a
  high-frequency fbm, only on the burnt side. A `burn` 0..1 uniform blends the whole effect in. To make it lava:
  - sample world xz in metres, using a tiled 3D noise texture rather than `fract(sin())`, which loses
    precision at world scale;
  - drive the drift with a downslope flow map, blended in two phases, instead of one constant drift;
  - put fronts and embers in emission so they glow at night and bloom (Godot: WorldEnvironment glow);
  - put voronoi plates under the front band, so the cooling crust reads as plates and cracks;
  - drive it from `atm_time`, and ease `burn` per second, not per frame.
  A Godot sketch is about ten lines (`EMISSION` from the front band and the embers). It suits lava lakes and
  fields; channel flows need the flow map.
- **[G data]** The numbers become an atmos preset: `{kind:'lavafield', scale, flow, frontW, colours, burn}`.
- **[G native]** Sparks and steam: GPUParticles3D, with parameters taken from `src/core/dust.js:13-52` (drag,
  gravity, wind, life, alpha curve). The steam is atmos's existing `smoke` steam preset.

## Geothermal terrain *(Menagerie: Yellowstone, `src/yellowstone/landmarks.js`, `nature.js`)*

Krator has no geysers or hot springs. Combined with the lava field above and the land-cover sinter class
(Worlds), these would make a geothermal biome.

- **[G data] → [G shader] Hot-spring pools** (`landmarks.js:56-83,172-189`). The pool is painted rather than
  modelled, because what it is is colour.
  - The colour is a radial palette ramp from centre to rim. The blue centre is water too hot for life; each
    ring outward is the bacteria that can stand that temperature. There are five palettes (prismatic, blue,
    glory, emerald, opal).
  - Round the pool: a pale sinter apron fading at its edge, a lobed bacterial-mat band, runoff rays streaked
    outward, and a scalloped sinter lip.
  - It is laid as a flat disc at the highest ground under it (`topOf`), with polygon offset. A glossy
    low-opacity Phong skin on top reflects the sky, which is most of what a pool looks like.
  - Options: an optional crater wall, and steam vents scattered in proportion to the area.
  - About two thousand small springs are instanced coloured discs with a rim (`nature.js:254-267`).
  Today it is a canvas texture [web]. As data it is the palette stops, the pool fraction, the ray count and
  a seed, which make a short Godot shader: a ramp on radius, with the lobes and rays from angular noise.
  It also makes an atmos `hotspring` fx kind.
- **[G shader] Geyser eruptions, entirely on the GPU** (`landmarks.js:94-121`). Each drop is a point with a
  seed. Its height is a parabola solved in the vertex shader from `uTime`, for a column height `H`, so no
  per-frame work is needed. One `uAmp` strength sets how many drops are airborne and how high they go, so
  the same points serve pre-play splashing, the full column and the dying away. A `fountain` flag throws
  bursts at every height. A second point cloud makes the steam cloud that drifts downwind
  (`cloudPoints`, :122+); it is heavier on cold mornings and at night (:169).
- **DONE: `KSCHED.eruption` in `core/sched/20-core-sched.js`.** **[G data] The eruption schedule** (`landmarks.js:162-167`): `interval`, `duration` and `phase`, as a pure
  function of time. The strength ramps up over 3 s and holds; there are 50 s of splashing beforehand and
  40 s of fading cloud afterwards. Godot evaluates it identically.
- **[G data] Rimstone terraces** (`landmarks.js:186-215`): lobed extruded steps laid along the steepest
  downhill direction, in flights of three. Active steps are white and orange with blue pools and steam; dry
  ones are grey.
- **[G data]** A sinter cone (a lathe, :217) and mud pots (a stippled disc plus bubbling domes, :223).

## Effects: new core/atmos fx kinds *(Menagerie sci-fi scenes)*

Every Menagerie particle effect is stepped on the processor. Take the parameters, not the code: Godot's
GPUParticles3D, FogVolume and Decal read them directly.

- **[G data] → [G native] `jet`:** ballistic grains under gravity alone (`src/europa/grains.js:18-45`,
  `src/europa/ice.js:163-185`). It starts full, because each grain is placed at a random point along its arc
  (Godot: `preprocess`). Presets `plume` and `vent`, with g as a parameter.
- **[G data] → [G native] `dustburst` plus a `dust` weather mode:** velocity relaxes toward the wind with drag
  (`src/core/dust.js:13`). The Coriolis storm front (`src/arrakeen/events.js:81-96`) crosses at 110 m/s; as it
  passes, fog goes to ×90 and dust brown, the sun to ×0.15, with static flashes. Godot: a moving FogVolume
  plus Environment fog. `ATMOS.W` has no dust mode today.
- **[G data] → [G native] `burst`:** explosion and impact: a flash, a flat ring, sparks and a scar left on the
  ground (`src/homeworld/fleet.js:96-110`, `src/europa/events.js:107-121`). Godot: one-shot particles and a
  Decal. Krator has no explosions.
- **[G data] `exhaust`:** an engine glow disc plus a plume cone, with drive-state presets taken from Voyager's
  warp sequence (`src/voyager/ship.js:246-283`: idle, hot, flare). Trails: GPUParticles3D trails.
- **[G shader] `portal`:** counter-rotating spiral discs, opening as `sin^0.6` (`src/babylon5/station.js:735-760`).
- **[G native] `airbox`:** a haze box (`src/blame/city.js:113-124`); in Godot, a box FogVolume.
- **[G data] `sign`:** text, colour, size and pulse (`src/nightcity/neon.js`); in Godot, a `Label3D` with
  emission, its halo in `glow`.
- **[G data] An `events` export block:** a random-event scheduler with `every:[min,max]` and an `active()`
  gate (`src/core/happenings.js:19,73`).
- Sky module, not atmos, **[G shader]**:
  - drifting cloud bands on the gas giant, from the latitude-stretched, drifting fbm cloud shell
    (`src/homeworld/kharak.js:68-83`); the giant's rim already exists. No night-side city lights: it is a gas
    giant;
  - a galactic band in the star field (`kharak.js:92+`);
  - a rotating-habitat sky: an axial sun tube that dims rather than sets, with land overhead
    (`src/hab/world.js:40-63,357-368,539-560,622-650`).

## Life layer: motion as a function of time *(Menagerie ship behaviour)*

Voth's life layer is integrated state. Ships cycle docked, away, arriving and departing, with avoidance nudges
and departures picked at runtime (`settlements/voth/src/78c-life-ships.js`), so Godot cannot reproduce it from
the clock. The interiors walkers (`kits/interiors/API.md` §8) and the Ring Sea vessels (`rsWayPose`) are
already pure functions of t, and are the model.

- **Evaluator DONE: `KSCHED.timeline` and `KSCHED.slots`; moving Voth's ships onto it is still to do.** **[G data] Schedules as data:** `{route, period, phase, segments:[[dur, ease, from, to]...]}`, as for
  Homeworld's lifters and collector (`src/homeworld/fleet.js:135`: 14 s up, 6 s docked, 13 s down, offset per
  craft). Bake Voth's nav routes at build time, resolve slot conflicts offline, and drop the runtime
  avoidance and the random departures.
- **DONE: `KSCHED.formation`.** **[G data] Formations:** offsets in the leader's tangent frame (`fleet.js:130`, Babylon 5's diamond). Use
  them for coast-guard escorts and strider convoys.
- **DONE: `KSCHED.approach`.** **[G data] A queued harbour approach:** closing distance `9000(1-u)^1.6`, so ships slow as they arrive;
  lateral offsets merge into the lane, then a final alignment (`src/babylon5/station.js:624-700`).
- **[G data]** A closed-form launch from a rotating frame (Babylon 5), for habitats. Arrivals keyed to the
  schedule, spawning and despawning on it.
- **[G shader] Pose on the GPU:** once pose is a function of t, put phase and parameters in
  `INSTANCE_CUSTOM` and pose each instance in the vertex shader. No per-frame uploads, in three.js or Godot.
- **[G native]** Engine lights that stay a fixed size on screen: a MultiMesh of billboards with `fixed_size`.
- Avoid integrated pursuit (Homeworld's defenders) unless it is seeded and stepped at a fixed rate.

## Testing *(Menagerie)*

- **[web] A route walked by scripted input.** From OhMyGame's QA skill (WhiteTowerAI, GitHub, read 2026-10-10;
  the rest of it is an agent harness with nothing for Krator): "build success establishes compilation, not a
  playtest". Krator's verify covers build, logic and the screenshot; the missing kind is interaction. A verify step
  that sends the walker along a route by scripted keys and asserts the end position and an empty console, on the
  shared harness when `full-refactor` merges.
- **[G data]** Layout fingerprints compared with saved goldens, which can prove a refactor changed nothing in
  the world. Refuse an empty fingerprint. Taken over the export, the same fingerprint can check that the Godot
  import placed what three.js built.
- **[web]** Fail on WebGL and shader errors in the console.
- **[web]** Voth: set `_ready`, and replace the fixed sleeps with "N frames since ready".
- **[web]** `tools/test-all.py -j N`, running the `core/**/test-*.js` unit tests first; `build.py --check`
  for a stale `dist/`.
- **[web]** One shared `tools/harness.py` instead of 25 copies inside the `verify.py` files.
