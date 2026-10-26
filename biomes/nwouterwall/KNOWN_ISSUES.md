# nwouterwall — known issues

- [ ] **Station 3 without the Yeti's domes on this branch.** The owner asked station 3 to read `kits/yeti` now (2026-10-26). The kit
      is on its own branch (`claude/yeti-kit`), on its own vendored Scyvoi engine (kdef/kput, its materials core, the catalog's
      furniture): it cannot be concatenated into a biome page, it has to be wrapped in a closure with a `build(sites)` API, as
      `kits/post-apoc/apoc_bundle.py` does. Until that bundle exists and the kit is in the tree, station 3 shows the capital's
      country (the fields, the channel, the lake, the larch, the spur) without its halls.
      Stays open (2026-10-26): needs kits/yeti merged and a yeti bundle (kits/yeti's own, or a reader here).
- [ ] **Procedural plants** (no card in the library): the snow birch, the woolly willow, caribou moss tufts (the ground's
      `ground.cladonia` carries the carpet), the felt star (edelweiss), the cloudberry's leaves, the moss campion's flowers.
      Prompts: `core/materials/PROMPTS-NEEDED.md` section 8 (`card.birch.dwarf`, `card.willow.woolly`, `card.edelweiss`,
      `card.cloudberry`, `card.cladonia`).
      Stays open (2026-10-26): textures owed.
- [ ] **The stone pine wears `card.pine`**, a long-needled sprig (the Siberian stone pine's needles are short, in fives); tinted
      dark. Reads right from a few metres off, wrong up close.
      Stays open (2026-10-26): a `card.pine.stone` would fix it (not yet prompted: low priority).
- [ ] **The fur larch's needles read leafy up close.** `card.larch`'s cells are sprigs ~30 cm long; a hero tree's tufts are drawn
      at 0.6-0.95 m (the mid trees' at 1.2-1.7 m), so from under a tree the tufts read as broad leaves. Smaller and more numerous
      tufts cost instances (station 1 draws ~0.9 M).
      Stays open (2026-10-26): look pass.
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
- [ ] **The aufeis is an opaque sheet**: KFROST's coverage decides its outline (the sheet's own triangles only), no fade at its
      rim. From the valley's walls it reads as white patches on the floor; up close as glossy blue-white ice on the gravel.
      Stays open (2026-10-26): look pass (a rim fade in the ice's material).
- [ ] **core/atmos: `ATMOS.cloudShade` after `WATER.wetGround` recurses** (cloudShade chains a material's hook by reading and
      setting `onBeforeCompile`; wetGround's and snowOn's setters then call cloudShade's hook from inside themselves). The page
      binds the weather (and its wetGround) after the cloud shade and the snow last (`89s-host-sky.js`). A core fix: cloudShade
      should wrap through the same getter/setter as snowOn and wetGround.
      Stays open (2026-10-26): core/atmos/host/89-atmos-h-skyhost.js, reported to the rebuild session.
- [ ] **`core/atmos/host/89-atmos-e-weatherhost.js` (ATMOS.bindWeather)** was uncommitted in the biome rebuild when this kit was
      built; this branch builds against a copy of it and does not commit it. The page needs the rebuild branch's commit of it.
      Stays open (2026-10-26): merge order (the rebuild commits the weather host).
- [ ] **The season is a build input**: the Season select reloads the page with `?season=`. The larch's colour, the flowers, the
      aufeis and the snow's base are read once.
      Stays open (2026-10-26): a live season would rebuild the flora's colours; not needed for a showcase.
- [ ] **No fauna**: the caribou, the musk oxen and the root voles are `kits/fauna`'s (PLAN.md section 0); the voles' caches are
      drawn (the vole is not).
      Stays open (2026-10-26): kits/fauna.
