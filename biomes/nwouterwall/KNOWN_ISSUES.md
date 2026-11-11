# nwouterwall — known issues

- [x] **Station 3's capital needs `kits/yeti` in the tree.** The owner asked station 3 to read `kits/yeti` now (2026-10-26). The
      kit is on its own branch (`claude/yeti-kit`) on its own vendored Scyvoi engine, so `yeti_bundle.py` wraps its engine and
      buildings in one closure (`KratorYeti`, the way `kits/post-apoc/apoc_bundle.py` does) and `stations/yeti/86y-host-yeti.js`
      lays out a piece of the capital: the High Chief's and the council's halls, the clan compound, family clusters, composite
      houses, domes, stores, caches, the works, the ice quarry at the lake's edge, the byre and the corral, a watch tower and a
      signal cairn (37 placements, 66 records, ~440k triangles; tested 2026-10-26 with the kit restored from its branch into the
      tree: no errors, every check passing). The committed page is built WITHOUT it (the kit is not on this branch, so a rebuild
      here must match): after the yeti branch merges, `python3 build.py --station yeti` draws the capital. Not taken from the kit:
      the catalog's furniture (FURNISH is a no-op: the interiors are not seen), the winter street and the samples; the sunk floors
      are not holed in the biome's ground.
      Fixed 2026-11-09 (the final rebuild, pair 11): `kits/yeti` is merged and reads its engine from `core/engine` now, so `present()`
      found no `27-mat.js` and the committed page was built without the capital. `yeti_bundle.py` takes each engine file from the kit's
      `src/` or `core/engine` (as the kit's build does), with `36o-open.js` (door leaves, on core/door: 10, 20, 30, 90, the leaves left
      shut, no key bound) and `36s-stair.js`; the shim's `buildWorld` calls `svOpenReset`/`svOpenFlush` as `core/engine/90-scene.js` does.
- [ ] **Procedural plants** (no card in the library): the snow birch, the woolly willow, caribou moss tufts (the ground's
      `ground.cladonia` carries the carpet), the felt star (edelweiss), the cloudberry's leaves, the moss campion's flowers.
      Prompts: `core/materials/PROMPTS-NEEDED.md` section 8 (`card.birch.dwarf`, `card.willow.woolly`, `card.edelweiss`,
      `card.cloudberry`, `card.cladonia`).
      Stays open (2026-10-26): textures owed.
- [x] **The stone pine wore `card.pine`**, a long-needled sprig. Now `card.pine.b`'s radial tuft (cell 1,1), tinted dark: the
      dense bunches of the Siberian stone pine read right from a few metres off. A true five-needle card would be closer still.
      Fixed 2026-10-26 (known issues pass).
- [x] **The fur larch and the stone pine were sparse, their foliage floating off the branches.** The larch's needles now hang
      from its branches as sprays (`larchspray`, the card's sprig on a hung quad, stem on the wood) every ~0.22 m along the outer
      four-fifths of 26-32 branches a near tree, alternating sides, 0.5-0.75 m each (a mid tree: 12-15 branches, sprays 0.75 m
      apart, three times the size); bare in winter. The stone pine is limbs now: 16-22 whorled branch tubes, each carrying seven
      to ten bunches from its inner fifth to a knot at the tip, cones among them, a dome over the leader. Station 1: ~1.54 M
      instances, ~11.3 M triangles (was ~1.1 M, ~9.8 M). Fixed 2026-10-26.
- [x] **The three crops drew goldroot, and the autumn larch drew its green cell.** `KMAT.textures` caches one texture per
      library sheet, so `BIO.libSwap`'s cell offset for the last slot of a sheet won on every slot of it (`card.crop.thule`:
      sweetroot, snow potato and goldroot all showed row 3; `card.larch`: gold showed the green row, tinted). The kit now gives
      each card slot with a cell its own clone, its image copied across when the sheet decodes (`50-biome-nwow-species.js`,
      after `libSwap`). The snow potato is also sunk to its rosette's foot (`G.tuft(.42)`), so its tuber stays underground.
      Fixed 2026-10-26.
- [x] **core/biome: `BIO.libSwap` shares one texture between the cells of one sheet** (above). Every kit with two slots on one
      sheet with different cells draws the last cell on both. The kit-side clone here is the workaround; the fix belongs in
      `core/biome/20-core-kit.js` (`one()`: clone `t` when `L.cell` is set, and copy the image on load), followed by a rebuild of
      every biome build.
      Fixed in core (`core/biome/20-core-kit.js` clones a card slot cut to a cell); the kit's clone in `50` is removed (pair 11, 2026-11-09).
- [ ] **Leng is a placeholder massing** (the owner: "a far silhouette"): a stepped ruin of boxes at the model's bearing and distance
      from station 1, its size a guess, no snow on it (it read as a cake). Tagged `placeholder`.
      Stays open (2026-10-26): until Leng has its own plan and build.
- [ ] **The mid ground (2.5-20 km) is the model's own country at ~4 km a cell**, bicubic, with ridged crags where the model is
      steep, painted by the near ground's shader from its height and aspect: no plants, no landforms, no water past the near box.
      Beyond 20 km the far land is the shared sky's ridges cast from the model (`region/far.py`).
      Stays open (2026-10-26): the open world's streaming is the real answer.
- [ ] **The Yeti Valley's lake** is drawn as one still surface over the model's water cells' box at the lake's level: it shows
      wherever the bicubic ground dips under the level, so its shore is the model's at ~4 km resolution, smoothed. Frozen in spring
      (`SITE.lakeIce`), open in summer and autumn (mid-March: before the freeze; PLAN.md: frozen seven or eight months).
      Stays open (2026-10-26): a shore drawn from the model's water raster at its own 2 km resolution would be truer.
- [x] **The aufeis was an opaque sheet with a hard rim.** Each vertex now carries KFROST's coverage (`aIce`) and the ice's
      material fades with it, one grid cell past the sheet, so the overflow ice thins out onto the gravel.
      Fixed 2026-10-26 (known issues pass).
- [x] **The stream drew in broken pieces**: its channel (4.5 m) was narrower than the baked ground's 10 m cells, so the cut was
      lost between grid points and the ribbon sank under the floor. The cut is now at least the grid's width; the stream's glare was
      toned down too (a narrow channel read as a white road).
      Fixed 2026-10-26 (known issues pass).
- [x] **The mid ground's woods were invisible** (the mid ground has no trees: a larch slope there showed only its litter). The
      shaded slopes past 2.5 km are now painted darker by their larch weight, so the forest-steppe's mosaic carries to 20 km.
      Fixed 2026-10-26 (known issues pass).
- [x] **core/atmos: `ATMOS.cloudShade` after `WATER.wetGround` recurses** (cloudShade chains a material's hook by reading and
      setting `onBeforeCompile`; wetGround's and snowOn's setters then call cloudShade's hook from inside themselves). The page
      binds the weather (and its wetGround) after the cloud shade and the snow last (`89s-host-sky.js`). A core fix: cloudShade
      should wrap through the same getter/setter as snowOn and wetGround.
      Fixed in core: cloudShade, wetGround, snowOn and heightFog all chain on KHOOK now ("any order"). The hooks run once in
      `89z-host-build.js` after the bake (pair 11, 2026-11-09).
- [x] **`core/atmos/host/89-atmos-e-weatherhost.js` (ATMOS.bindWeather)** was uncommitted in the biome rebuild when this kit was
      built. The rebuild committed it (7f174cae0, identical to the copy built against) and this branch merged the rebuild.
      Fixed 2026-10-26 (known issues pass).
- [ ] **The season is a build input**: the Season select reloads the page with `?season=`. The larch's colour, the flowers, the
      aufeis and the snow's base are read once.
      Stays open (2026-10-26): a live season would rebuild the flora's colours; not needed for a showcase.
- [ ] **No fauna**: the caribou, the musk oxen and the root voles are `kits/fauna`'s (PLAN.md section 0); the voles' caches are
      drawn (the vole is not).
      Stays open (2026-10-26): kits/fauna.

## The final rebuild (pair 11)

Built 2026-11-09 in a cloud session on `claude/integration-b91c04` (no GPU: CPU checks and software GL only; the coordinator runs the GPU
verify and merges). Branch `claude/rebuild-nwouterwall-cloud`. `PLAN.md`, "Core adoption", has the table of what was taken and what was not, and why.

**What changed** (every change in `src/`, `build.py` and `yeti_bundle.py`):
- `build.py` on the universal set: `build_sources` (`--list-sources`, the stations as variants), core/biome 31j, 34, 41; core/terrain 43
  KGROUND, 45 KHORIZON and its shade; core/shadow; height fog, the rain cover, lightning; water ext 56, 57, 58, 60. `khost.FULL`, `--station`
  and LF writes it had already. `88-host-build.js` is `89z-host-build.js` (after the water), and the clouds' shade, the weather, the snow on the
  scene (from `89s`), the rain cover, height fog, KHORIZON and KSHADOW (off; `?shadow=1`) run there once after the bake.
- The trees (`55`): `BIO.flareJoin` on the fur larch's and the stone pine's near limbs; a mid larch's branches drawn as one rod each (its sprays
  hung from branches that were not drawn); **octahedral impostors** for the far trees of all four species (one set, item `impTrees`, gain 2.4;
  `?diet=0` the old `far` blobs).
- The ground (`47`): KGROUND for the six layers over the dithered steppe base (`?kground=0` the old mix), and the **`polygon` kind**: sorted
  circles (3 m) on the frozen flats wherever 44s's KFROST polygons' `where` holds (`aW2.w`, which was 0). The eye is redirected to `kEye` on this
  Lambert ground as Korona did. `?kgrelief=1` shows the relief (not on by default: untimed).
- `99`: `WATER.mirrorSwitch` on the largest open still, off at load (stations 2 and 3; station 1 has none). `89a`: `BIO.bindAtmosWind`; A2C after the bake.
- `50`: the kit's per-cell texture clone is gone (the core does it now).
- Station 3: the Yeti capital is drawn (`yeti_bundle.py` reads the engine from `core/engine`, with core/door's four files: the leaves stay shut).

**Checked here (software GL, SwiftShader; `harness.py smoke` and a probe):** all three pages load with an empty error panel, no page or GL
errors. Station 1: 36 calls and 12.0 M triangles at the opening view (was 11.25 M: the rods and the joints). KGROUND on with its seven layers,
KHORIZON (26 / 48 / 14 materials), rain cover and height fog on, 0 card faults. **The attach audit is 0.00% on all three** (station 1: 11,610
cards; taiga 11,236; yeti 9,600), was 3.7% (`larchspray`). `check_core_use`, `check_assembly`, `check_port`, `check_source`: nothing new.
`check_cells` 0 faults for this kit. **Not run:** `verify.py` (the coordinator's).

**Species for readers** (the Yeti kit reads this biome through station 3; nothing else reads `NWOW`, `reach.py`): `NWOW.SPECIES` keys and
indices unchanged; every placement draw unchanged (each tree reseeds from its own seed; the joints and rods take no random numbers). New: the
item `impTrees` in the kit's registry; `NWOW.IMPOSTORS` (false: the blobs), `NWOW.JOINS` (false: plain tubes). `NWOW.pyc`, `canopyH`,
`clearings`, `TREES` as they were.

**For the GPU verify:** `verify.py --assert --all-views` on the three pages (`--station taiga`, `--station yeti`); the impostors' look and gain
against the near larch (`?impgain=`), and that they bake (`window` has no flag: the impostor item draws its trees blank until the bake);
KGROUND's floor (`?kground=0` for the old look), the sorted circles' size and contrast on the frozen flats (station 2 has the most); KHORIZON at a
low sun (`?hz=0`); height fog's mist over the alases at dawn (`?hfog=0`); KSHADOW's cost (`?shadow=1`); the reflections on stations 2 and 3
(the alases at another level than the chosen still share its plane); station 3's capital (first draw on the merged kit: its doors, stairs, and
whether the sunk floors still want holing in the ground).

- [ ] **The pair-11 turn's GPU verify** (above). Stays open (2026-11-09): the coordinator's run.
- [x] **core/terrain/43-core-ground.js reads the eye uniform r128 leaves at 0 on Lambert** (Korona's finding): this page redirects it to `kEye`
      as Korona does. Stays open (2026-11-09): a core fix (`kEye` in place of the uniform) for whoever owns core/terrain.
      2026-11-08: closed by the core fix of 2026-11-08: `43-core-ground.js` and `30-core-foliage.js` take the eye from `viewMatrix`.
