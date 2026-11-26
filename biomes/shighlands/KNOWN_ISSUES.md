# Southern highlands — known issues

- [ ] **Some surfaces are still procedural.** The library now dresses the coilbark (`bark.wrung`), the groundsel and
      lobelia skirts (`bark.skirt`), the screw palm, the crown and moss cards, the granite, and three ground layers (moss,
      paramo grass, sphagnum): `materials.json`. Still the kit's own canvases: the trumpet's ribbing, the volute's rind,
      the tree fern's leaf scars, the ruffle-crown's bands, the fern and strap fronds, the begonia leaf, the daisies. Ask
      the owner before generating any (core/materials/PLAN.md, Southern highlands, has the delivered rows).
      2026-10-26: wired from the library (`materials.json`, `pack.py`; cut in `50`'s `libCell`): the floor's fern fronds
      (`card.fern.green`, the upright frond, flipped base-up), the screw palm's straps (`card.strap.pandan`, the straight strap),
      the daisies (`card.cupflower`), the trumpet's ribbing and the frill column (`bark.frill.ribbed`), the volute's rind
      (`bark.smooth`), the tree fern's scars (`bark.lepido`), all grey detail under the species' colours. Delivered 2026-10-26 and pre-wired: the
      ruffle-crown's and cereus's bands (`bark5`, family `bark.banded` = `bark.banded.ring`) and the escargot begonia's leaf
      (family `escargot` = `card.begonia.escargot`, the middle cell, full colour); awaiting the all-builds rebuild. The page grew ~0.8 MB (seven packed maps).
- [ ] **The Koppen classes are an estimate** (Cfb, Cwb, ET, BSk): the scale model's climate rasters were not read for
      this region.
      Stays open (2026-10-26): no local extract covers the southern highlands (`openworld/little-demo` is the east);
      surveying needs `tools/scale-model/extract_region.py` run on the scale model page for this region's polygon.
- [ ] **The cloud sea's edge** thins by the ground's clearance under the deck, sampled round the camera on a 160 grid
      (~33 m a cell, `PRESETS.clouddeck.clear`) plus this host's mist sprites; from low angles on the scarp the deck can
      still show a soft line where it meets the ground. The mist is not exported (core/atmos/README.md, port to-do).
      Stays open (2026-10-26, checked under the shared sky): 'Above the cloud sea' shows the thinned deck as a dark, mottled
      band with a hard line where it crosses the slope. Extra host mist sprites on the contact line were tried and dropped
      (one draw call each, +27 calls from afar, no visible gain). The fix is core/atmos's: a soft-depth fade in the deck's
      fragment shader (alpha by the scene depth behind it, as soft particles), or a finer clearance grid near the camera.
- [ ] **The deck's look is second-pass** (2026-10-06: billow noise in place of plane waves, which drew parallel lines):
      domes and creases from above, a frayed edge over the ground; still flatter than towering cumulus. Tune it in
      `PRESETS.clouddeck` only (octaves, puff, heap, gain, tilt, colours), then rerun `godot/tools/atmos_clouddeck.js`
      and `atmos_golden.js` so Godot follows (core/atmos/GODOT.md).
      Stays open (2026-10-26): `PRESETS.clouddeck` is core/atmos's and the shared sky rollout's; not this kit's files.
- [ ] **No fauna**: it goes to the one fauna kit (biomes/README.md).
- [ ] **No catalog fruit**: the screw palm's fruit and the cereus fruit are now tagged (`generic_fruit_pandan_keys`, `generic_fruit_cereus`,
      2026-10-25); the trumpet's water is a drink with no catalog piece, and the other edible parts (croziers, scroll tips, buds) have none (biomes/FRUIT.md).
      Stays open: needs catalog pieces, not this kit. Proposed (kits/catalog, 2026-10-26): a drink `generic_drink_trumpet_water`
      (a gourd of rain water), foods `generic_food_croziers` (a bundle of fiddleheads), `generic_food_scroll_tips`, `generic_food_frill_bud`
      and `generic_food_ruffle_hearts`, then set `fruit` in `SHIGH.HARVEST`.
- [ ] **Not in the open world**: `openworld/` has no southern highlands region yet; the kit's `fog` field must be
      bound by any world that wants the cloud forest (BIOME-API.md).
- [ ] **The budget is the measured total, 18.5M triangles at q=1** (19.5M ceiling in `99-host-take.js`). The first build drew
      79M: the paramo's rosette trees were too many and their whorls too fine. The fixes, should it creep up again: fewer
      rosette trees (`PASSES`), the mid-distance copies of every spiral item (`SHIGH.it`), the detail radii in the host's
      `lod`. Shared trunk variants (a few templates instanced) would save memory, not drawn triangles.
      2026-10-26: 19.01M before the known-issues pass, 19.44M after it (the tussocks' bodies +0.21M, the bunchgrass +0.22M).
- [x] **The paramo's tussocks are mostly printed** (2026-10-26): each swirl tussock is now a hummock (a dome of dead thatch
      and a skirt of dead blades under its live swirl; 7 live blades near, 6 at mid distance, to pay for it), and the near
      band carries a bunchgrass sward between them (`bunch`, crossed `card.ichu` cards on a KRAND per-cell lattice, 36k
      at 6 triangles, `60-biome-shigh-floor.js`). The print stays for the distance.
- [x] **The streams are painted, not water** (2026-10-25): each ravine's stream is a `WATER.flow` along the ravine's floor line
      (`ravX`), its surface a running minimum of the floor so it only falls (`89zw-host-water.js`); the ground keeps a faint wet bank
      (the painted band lightened from .7 to .4). The tarn is a `WATER.still` with a gradient and the bog pools one `drawPools` mesh
      (the host's own `MAT_WATER` and discs are gone).

## Export profile: sections left out (2026-10-18)

EXPORT_PROFILE in verify.py leaves out: water (no core/water surface meets the box: the section reads empty). Add each back when the kit fills it.

2026-10-20: `atmos` is in the profile and fills (the build lists `89-atmos-8-export.js`). `water` stays out: the page binds no core/water (its water is the host's own MAT_WATER shader), so there is no surface for the section to export. 2026-10-20 (migration phase 0): the wave field and the sky's light (`89-atmos-a-waves.js`, `89-atmos-b-skylight.js`) are in its `CORE_ATMOS` now, ready for core/water; nothing is drawn by them.

2026-10-25 (migration phase 4): `water` is in `EXPORT_PROFILE`: the page draws the tarn and bog pools (`WATER.still`) and the ravine streams (`WATER.flow`) on core/water (`89zw-host-water.js`, after 89z binds ATMOS). The cloud deck stays core/atmos's.

## Open

- [ ] **The sky's landmarks (SKY-PLAN.md 4, layer 8; 2026-10-26).** The shared sky now draws the cloud sea to the north and the Throne's plume (preset.landmarks in 89-host-sky.js), where the notes above say they were not drawn. Built but not yet verified on the GPU page by page: that is folded into the biome rebuild's final rebuild and verify.

- [ ] **The shared sky (SKY-PLAN.md section 9, 2026-10-26): the look to judge.** The painted dome and the giant mesh are
      gone; `89s-host-sky.js` calls `ATMOS.skyBiome` (core/atmos) on the host clock: the page opens at 06:00 on game start's
      day (dawn), `#hour=13` is about the old fixed light. A true blue 1 atm column. Kept from the dome: the Throne far to
      the north (now at az 25, where the scale model puts it; the dome painted it at 8), the Inner Wall running east and
      west (one ridge in two lobes) and the warm lowland to the south. The cloud sea in the north beyond the real cloud deck
      and the Throne's plume are not drawn; 89z's cloud deck keeps its fixed sun. Draw calls at the default camera
      (verify.py --assert, GPU): 98 before, 95 after.


## The final rebuild (pair 12)

Built 2026-11-09 in a cloud session (`claude/rebuild-shighlands-cloud`, from `claude/integration-b91c04` b4edff31): **no GPU here**, so
the page was built and run through the CPU checks and one SwiftShader load only; `verify.py --assert --all-views` is the coordinator's.
No new station or feature (PLAN-STATIONS.md stays a plan; map 5.1's re-survey of the stations waits for them). Every change is in
`src/`, `build.py`, `materials.json` and `tex/pack.json`.

**What changed (the universal set, BACKPORT.md section 1 and the kit's row):**
- `build.py` on the core lists, nhighlands' shape: `--station` (none built), LF writes, `khost.FULL` (the polygon tool gives way to marks),
  the shared pack writer (`tools/textures/matlib_pack.py`), core/biome `31b` (the leaf set: `check_assembly`'s MISSING `BIO.leafOn`/`leafQ` gone),
  `31j`, `34`; core/terrain 43 KGROUND, 44 KFAR, 45 KHORIZON; core/shadow; core/atmos height fog, rain cover, lightning; core/water ext 56, 57, 58, 60.
- **Limb joints** (`55`, `joint()`): `BIO.flareJoin` on every near limb tube (coilbark, trumpet candelabra, volute, screw palm and
  groundsel forks). Side limbs start on their trunk's axis here, so they sink only .3 of the parent's radius and their collar reaches
  past the bark (`len` 3); forks at a trunk's top take the defaults. Mid-tier rods unchanged.
- **Octahedral impostors** for the far trees (lv 0): one set, ten species, item `impTrees`; `?diet=0` the old blobs (`SHIGH.IMPOSTORS=false`).
  Gain 2.6 (`IMP_GAIN` in `89zx`; `?impgain=`), as oidong and korona.
- **Each tree from its own seed** (`reseed(T.seed*7919+17)` before its builder, nhighlands' rule): every tree's form was re-rolled once;
  places, sizes, species and hands are unchanged.
- **Trees off the water** by its own surfaces (`WATER.fields`, `SHIGH.SHORE`, `offShore` in 55): a tree whose bole would stand in a ravine
  stream, the tarn or a bog pool is made (draws and keep-clear kept) but not drawn; `?fields=0` the old trees. New host check
  `the trees keep out of the water the eye sees` and its negative (a tree in the tarn).
- The build is `89zx-host-build.js` (it was `88`): after the water (89zw), which the fields read.
- **The ground on KGROUND** (`84`): the page's own hex tiling is gone; the four library layers (moss, wet soil, paramo grass, sphagnum) with the
  old weights and strengths, the macro tone and hue drift kept over them, KGROUND's relief (`bump .075, cavity .8, mesh 1`, `cavityMesh`).
  **The ground is MeshStandard now** (roughness .96; it was Lambert): `?kground=0` the old Lambert painted ground, `?kgrelief=0` no relief.
- **KFAR** (`85-host-far.js`): the stage's `landH` carried to 9 km, sunk 14 m under the square, coloured by the same zones (moss near the rim,
  paramo gold and olive, the dry side's ochre) and fading to the haze; north of the rim it lies under the cloud deck. `?far=0`.
  **KHORIZON** over the square and the far lattice, on the ground and (after the bake) the flora; `?hz=0`.
- **Air** (`89z`): `BIO.bindAtmosWind`, height fog (`?hfog=0`), **the fog belt on the scarp** (the row's ask: deck top -20 m to +440 m,
  windward from the north, `?belt=0`), the rain cover; A2C after the bake. R9 (wet ground) not taken (oidong's black-ground finding over KGROUND).
  **The rain wall is not taken** (no page takes `fx/89-atmos-fx-rainwall.js` yet, and its shader uses `uint`: WebGL2 only).
- **KSHADOW attached, off by default** (`?shadow=1` or the panel's button), behind the texture-unit guard (`window._shadow` says what was decided).
- **Water:** the breakup on the tarn and bog pools (`?breakup=0`); `WATER.mirrorSwitch` on the tarn, off at load (`?mirror=probe|live`).
- **Graphics switches** (`45`): `BIO.INDEX_ITEMS` (`?index=0`), `BIO.LOD.merge/minTris/fade/cull` (`?lodmerge=0`, `?lodfade=0`, `?lodcull=0`), and `lodTick` on the view.
- **Card cells** (`check_cells` 6 to 0, its baseline rows can go): the cells the code cuts are now the slots' own in `materials.json`
  (and the pack, as `pack.py` writes them; `libCell` reads `L.cell`): fern, strap, tussock, escargot and the groundsel's green leaf on the
  plant's measured box (a shave of a percent or two); **the daisy is the whole cupflower** (the card is one flower now: the old third-cell
  cut drew a fragment of it); the crown clumps (`leaf.small`, card.sage, a sheet of nine) are cut by `BIO.geo.cells` (`"sheet": "geometry"`):
  they drew the whole grid on every card.
- KSTRATA **not taken**: the tors are granite and the scarp is drawn as ground (no beds; oidong's call). Kin and seasons (the row's life
  column) not taken: a pass of their own, after the owner's look.

**Species changed for readers** (riftrim reads `50` and `55` through `SHIGH.make/grow`): keys and indices unchanged; near limbs flare where
31j is on the page (riftrim lists it); the crown clumps take one sage sprig a quad and the daisy is the whole flower where shigh's pack is on
the page; `grow` does not reseed per tree, so riftrim's trees keep their forms. `SHIGH.SHORE` unset there: every tree drawn as before. One
new item, `impTrees`, is defined only by `buildTrees` (not on riftrim's page). Riftrim's three pages are left for its turn (they move in
text when rebuilt).

**Checked here (CPU, SwiftShader; not the verify):** `tools/build.py` (syntax OK), `check_core_use`, `check_assembly` (shighlands' two
MISSING rows gone), `check_port`, `check_source` (none over; two keys shrank), `check_cells biomes/shighlands` (0; the library cards pulled
for it). One SwiftShader load at `?q=0.3`: error panel clean, no page or GL errors, every host check passes (attach audit 0.01%, one cereus
card), every negative fails, 8,995 trees (668 far, all ten far species baked as impostors), 49 bake calls, `window._shadow` attached and off
(the ground reads 14 texture units; 15 with the map: tight on the Arc's 16, so watch the guard there), the fog belt on, KHORIZON on 31
materials. No baseline was rewritten.

- [x] **The tarn lies mostly under its own ground, and there are no bog pools** (fixed 2026-11-09 with the re-stage below: the tarn is dug
      as a bowl, its level over its whole floor, and the pools are dug as dishes at KRAND spots in each bog: 20 pools) (found 2026-11-09, older than this turn, not fixed:
      it moves the land). `TARNL` is the lowest point of the tarn's rim less .4 m (1452.6 m), but the plateau climbs across it, so the
      ground at the tarn's centre stands at 1460.9 m: the water shows only on its downhill side (the field's shore is 110 m from the
      centre). `POOLS` comes out empty (`window._water.pools` 0): no bog hollow passes the pools' test, so `BOG_DRAW` draws nothing and
      the export's water is the tarn and the streams. The fix is the stage's (45): level the tarn's bowl (dig it to below its rim) and
      relax the pools' test, then look at it; every placement near them moves, so it is a turn of its own. The edge check's negative
      puts its tree at the water field's deepest node for this reason.

**What the GPU verify should look at:**
- That the page loads clean and every host check passes, the new edge check above all (screw palms and tree ferns stand by the streams).
- The ground: Lambert to Standard changes its light; the KGROUND layers against the old hex tiling; the relief. Compare `?kground=0`.
- The impostors' brightness against the near crowns (`?impgain=`); `?diet=0` for the old blobs.
- The fog belt's height and density on the scarp and from 'Above the cloud sea' (the deck's hard line, item 3 above, may read differently).
- KFAR's colours and its seam at the square's edge ('From afar'); the far field north of the rim must stay under the deck.
- KSHADOW: `window._shadow` (attached, not skipped?) and its cost with `?shadow=1`.
- The budget (19.5M ceiling in `99`): the flared joints add a few triangles a limb; the impostors replace the blobs (fewer).
- The joints' look on the coilbark and the volute (side limbs leaving the trunk's axis).

## Stations 2 and 3 (built 2026-11-09, the same cloud session; PLAN-STATIONS.md, "The re-survey on map 5.1" and "Built")

`python3 build.py --station conifers` (`dist/shighlands-conifers.html`) and `--station fellfield` (`dist/shighlands-fellfield.html`). Both run on
src/'s host through hooks that station 1 never sets (`STATION_PAINT`, `STATION_GL`, `STATION_KGL`, `STATION_GROUND_GLSL`, `STATION_TUFT` in 84,
`STATION_FARCOL` in 85, `STATION_MIRROR` in 89zx), a shared stage, atmosphere and take (`stations/common/`), and each station's land, plants,
sky and views. 55 and 60 now export their builders' tools (`SHIGH.B`, `SHIGH.TOOLS`, more of `SHIGH.small`); nothing they draw changed.
Families a station names are packed into its page only (`station.json` "families", `"own": true`; riftrim's copy of the pack leaves them out).

**Checked here (SwiftShader, full quality; not the verify):** both load clean, every host check passes and every negative fails.
Station 2: 21,261 trees (rope pine 6,474, helix fir 14,291, coil juniper 496; 3 species baked as impostors), 16.4 M triangles (19.5 M budget),
attach audit 0.23% (the cones). Station 3: no trees, 46k instances, 3.6 M triangles, 1,133 m of ice with 38 crevasses, 5,764 stones on 347
sorted-spiral cells.

- [x] **Both stations failed the GPU verify** (fixed 2026-11-09): the region record (`89zx`) was a band at the cloud deck
      (`CLOUD_Y-80`, 700 m), and a station's stage sets no deck, so on both stations it held nothing; it now spans the deck band
      widened to the ground's sampled height range over the disc (on a station, the ground's range alone). The helix fir's needle
      sprays (`nspruce`, 289,784 on station 2) were over the 250,000 instance cap: they declare `cap: 340000` with a `capWhy`
      (`stations/conifers/62`). The fellfield draws no merged mesh (no trees), so `verify.py` leaves `buckets` out of its export
      profile (`EXPORT_PROFILES`) instead of failing it. On the main page two bare tors' volumes were empty (the tors are the
      ground mesh's rock, which the probe skips): `84` adds one probe point a tor in the drawn rock (`userData.probePoints`).

- [x] **Station 1 no longer matches map 5.1** (re-staged 2026-11-09, the owner: "rebuild as band on the 3 km face and move paramo up the
      rim"; the next section) (the re-survey): its site is now the hyperjungle's floor (550 m, Af) under a ~3 km scarp whose
      top is a 3.5-3.9 km ET plateau; no 1.4 km rim over a cloud deck is left. The owner's call: keep the page as an ideal type with its old
      sky site, or rebuild its stage as a band of the 3 km face with the paramo moved up to the rim (PLAN-STATIONS.md).
- [ ] **The icefall is the host's own mesh** (`stations/fellfield/86-host-ice.js`): no core ice kind is approved. It is not core/water and not
      exported as water; its crevasses are cut into a 1.5 m grid, so they read best from tens of metres, not at the lip.
- [ ] **The sorted spirals' fines are the lichen crust** and the snail rosettes wear the groundsel sheet's silver leaf, though both sets are in the
      library since 2026-11-10 (`ground.fellfield.fines`: a family under `STATION_GL`'s x weight where `sorted` is high; `card.rosette.snail`: a
      leaf a cell on the `snail` whorl, `"cell"` or `"sheet": "geometry"`); the dwarf heath is the kit's plain lobe: one prompt owed
      (`core/materials/PROMPTS-NEEDED.md`, section 37).
- [ ] **No streams on either station** (the meltwater runs under the scree and the needles; a stream off the snout and the snowbeds is a later pass).
- [ ] **No snow lies on the stage by itself**: the snowbeds are painted and on KGROUND's snow layer; the weather's snow cover (fx snowcover) only
      adds snow while it snows (`snowBase` .25 / .45 for the season's old snow on lit materials).
- [ ] **For the GPU verify:** both stations' looks (the rope pine's three strands, the helix fir's stair, the cones' size, the snowbeds, the
      sorted spirals against their stones, the icefall's crevasses and its blue), the texture units (the ground reads 13), the triangle count on
      the Arc at station 2 (16.4 M), and `--all-views` on both.

## Station 1 re-staged on the 3 km face (2026-11-09)

`src/45-host-stage.js`: the face from the cloud deck (`CLOUD_Y` 1250 m, the north edge) to the rim (~3.5 km, `RIMH`, round z +700), its
drop quantised into benches ~150 m tall (forest shelves, bare-rock risers: the slope field's scale is now 1.0, `SLOPEK`, so a 30-degree tread
is forest ground and only the risers over ~40 degrees are rock); the ravines run down the face (`R.head` under the rim, `R.foot` in the deck);
the paramo, the tors, the bogs and the tarn on the plateau behind the rim (3.5-3.7 km); the fog band 750-1950 m above the deck (`FOG_BAND`:
the cloud forest to ~2.4 km, 5.1's Cfb band, the elfin forest above). The sky's site is old px 486,700 (5.1 px 758,1030), 1.15 atm. The
kit's code is unchanged (its zones read the fields); 84, 85, 89z, 89zw and 99 follow the new names (`DECK_Z`, `R.foot`, `FOG_BAND`).
Views added: 'Down the face', 'Up the face from the cloud'. Checked on SwiftShader at the default quality: clean, every host check passes,
every negative fails, 25,447 trees, 18.65 M triangles (19.5 M budget).

- [ ] **The face is ~1.4x steeper than the model's** (2.3 km in 3.5 km; 5.1 has ~3 km in ~6 km) so the band from the deck to the rim fits a
      5.2 km map. A wider map (R 3600) would hold the model's slope at about twice the trees: the owner's call.
- [ ] **The default quality is .76** (`89zx`; `?q=1` the full density, 24.7 M triangles): the face holds far more forest than the old
      plateau did. The stations set `STATION_Q` 1.
- [ ] **For the GPU verify:** the face's look (the benches' rock bands, the forest shelves, the ravines' streams down a 2 km drop: rapids,
      no falls drawn), the deck from the rim ('Above the cloud sea'), the fog belt's band (to 1.3 km above the deck), the far field north of the
      deck's edge, the impostors on the face, and that every pool and the tarn read as water.
