# nwouterwall — known issues

- [ ] **Station 3's capital needs `kits/yeti` in the tree.** The owner asked station 3 to read `kits/yeti` now (2026-10-26). The
      kit is on its own branch (`claude/yeti-kit`) on its own vendored Scyvoi engine, so `yeti_bundle.py` wraps its engine and
      buildings in one closure (`KratorYeti`, the way `kits/post-apoc/apoc_bundle.py` does) and `stations/yeti/86y-host-yeti.js`
      lays out a piece of the capital: the High Chief's and the council's halls, the clan compound, family clusters, composite
      houses, domes, stores, caches, the works, the ice quarry at the lake's edge, the byre and the corral, a watch tower and a
      signal cairn (37 placements, 66 records, ~440k triangles; tested 2026-10-26 with the kit restored from its branch into the
      tree: no errors, every check passing). The committed page is built WITHOUT it (the kit is not on this branch, so a rebuild
      here must match): after the yeti branch merges, `python3 build.py --station yeti` draws the capital. Not taken from the kit:
      the catalog's furniture (FURNISH is a no-op: the interiors are not seen), the winter street and the samples; the sunk floors
      are not holed in the biome's ground.
      Stays open (2026-10-26): merge order (kits/yeti's branch), then rebuild station 3.
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
- [ ] **core/biome: `BIO.libSwap` shares one texture between the cells of one sheet** (above). Every kit with two slots on one
      sheet with different cells draws the last cell on both. The kit-side clone here is the workaround; the fix belongs in
      `core/biome/20-core-kit.js` (`one()`: clone `t` when `L.cell` is set, and copy the image on load), followed by a rebuild of
      every biome build.
      Stays open (2026-10-26): a core change, reported to the starting session.
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
- [ ] **core/atmos: `ATMOS.cloudShade` after `WATER.wetGround` recurses** (cloudShade chains a material's hook by reading and
      setting `onBeforeCompile`; wetGround's and snowOn's setters then call cloudShade's hook from inside themselves). The page
      binds the weather (and its wetGround) after the cloud shade and the snow last (`89s-host-sky.js`). A core fix: cloudShade
      should wrap through the same getter/setter as snowOn and wetGround.
      Stays open (2026-10-26): core/atmos/host/89-atmos-h-skyhost.js is the sky session's; still unfixed on the rebuild (checked
      2026-10-26 after the merge), noted in the side sessions' shared notes.
- [x] **`core/atmos/host/89-atmos-e-weatherhost.js` (ATMOS.bindWeather)** was uncommitted in the biome rebuild when this kit was
      built. The rebuild committed it (7f174cae0, identical to the copy built against) and this branch merged the rebuild.
      Fixed 2026-10-26 (known issues pass).
- [ ] **The season is a build input**: the Season select reloads the page with `?season=`. The larch's colour, the flowers, the
      aufeis and the snow's base are read once.
      Stays open (2026-10-26): a live season would rebuild the flora's colours; not needed for a showcase.
- [ ] **No fauna**: the caribou, the musk oxen and the root voles are `kits/fauna`'s (PLAN.md section 0); the voles' caches are
      drawn (the vole is not).
      Stays open (2026-10-26): kits/fauna.
