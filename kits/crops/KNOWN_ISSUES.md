# kits/crops: known issues

- [ ] **Biome pressures are inferred.** Only ehighlands (0.6 atm), crater-drylands and geyser (1.9), and shighlands (~1.0) record one;
      the rest are set in `CROPS.BIOMES` with `atmNote: '?'`. Correct them against the scale model.
- [ ] **Zone aridity and warmth are read from the biome notes, not the maps.** A settlement's real site can differ; `CROPS.at` takes
      a point for that.
- [ ] **Biome-to-culture links in `DYES.md` are read from which settlement vendors which kit.** Check them (Hykkousoi in nwbay; the
      Highlands and Ys have no recorded colours).
- [ ] **No plaid pattern sheet.** `cloth.weave.twill` and `cloth.wool` are plain; `patterns/highlands/plaid` is not prompted.
- [ ] **No card for lakecake, rattle coffee, wingnut, fern-egg, ballmelon, scalefruit and lantern fruit** (they are drawn by their
      biome kits).
- [ ] **Wool, and every animal fibre and dye source's animals, are not tracked.**
- [ ] **Nothing reads the kit yet:** the isles' `crop-*` stands, Voth's food stores and the settlements' food recipes should call it.
- [ ] **The fungus crops' works** (`dark-beds`, `sealed-beds`) are names only: `kits/zeijani`'s `zj_farm_alecap` and `zj_lab` are the
      first works that should declare them.
- [ ] The root `INDEX.md` and `PORT-INDEX.md` do not list this kit yet (regenerate them with `tools/make_index.py` and
      `tools/audit_port.py` in a session that owns those files).
