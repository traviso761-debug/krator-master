# kits/resources: known issues

`build.py` prints the open ones (`- [ ]`) after every build.

- [x] Ore sets (2026-10-18): coal, tar (ground.tar.seep), efflor (ground.efflorescence), malachite, quartz (rock.quartz.vein), cassiterite, galena, gossan, pegmatite are families in `materials.json`, full colour, no tint. `resK(set, fallback)` and `resC` in 44r draw each node's mineral face with its set where the page packs it, and a page without them (a building kit reading 44r in place, such as Islanders) keeps the old key and vertex colour. Still vertex colours: the loose rubble round a foot, tin's cassiterite grains, copper and iron's heaps, ore nuggets.
- [x] Sulfur is the library's `ground.sulphur` (2026-10-15): the mound, its crown and its crusts. A page without the family
      (a building kit reading 44r in place) draws them as tinted stone.
- [ ] **Oil has one derrick:** Locus's Geomancer pumpjack (`ind_pumpjack`, a catalog asset). The rule names it by key
      (`RES_ORE.works.derrick.keys`), and Locus's files are unchanged. The owner: no derrick for other cultures yet. A
      settlement on another culture can place oil nodes, but nothing works them.
- [ ] The pumpjack is drawn by Locus's catalog engine, not this one, so no sheet here shows a derrick working a seep.
- [ ] Nodes never run out (owner, 2026-10-15, for now). `resSource` would take a node's state if depletion comes back.
- [ ] Other resources are still drawn by the building kits' own yards (`kits/islanders` 43-is-yards.js) and could become
      nodes here the same way:
      - stone and clay pits;
      - salt pans;
      - timber stands.
- [ ] The engine is read in place from kits/scyvoi/src: a change there changes this page (port_baseline shows it).
- [ ] **Two nodes for the Catch** (the owner, 2026-10-23): **potash** and **alkali salts** (soda and its kin, borates and
      lithium folded in), the Catch's salt field (`biomes/catch/PLAN.md` section 6a). Add them when the Catch kit is built,
      no finer than these two.
- [ ] **Farside's alkali and lime come from its flora, not a node (2026-10-26):** the kelp kilns burn the land kelp to
      ash (potash and soda: the same two goods as the Catch's planned potash and alkali-salt nodes, `biomes/catch/PLAN.md`
      6a), and the lime kilns burn the spray coral to lime. They are crops in `kits/crops` (`kelp-ash`, `coral-lime`), not
      nodes; when the Catch adds its potash and alkali-salt nodes, a works rule that takes either a node or the crop would
      let Farside's glassmakers draw on both.
- [x] **Two nodes for the Catch** (the owner, 2026-10-23; added 2026-10-26 with `biomes/catch`): **potash** (`node-potash-*`)
      and **alkali salts** (`node-alkali-*`: soda and its kin, borates and lithium folded in), the library's `ground.salt.ochre` and
      `ground.soda.crust` on their crusts. kits/islanders reads 42r and 44r in place, so its page carries the six new defs (unplaced).
