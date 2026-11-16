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
- [x] **Two nodes for the Catch** (the owner, 2026-10-23; added 2026-10-26 with `biomes/catch`): **potash** (`node-potash-*`)
      and **alkali salts** (`node-alkali-*`: soda and its kin, borates and lithium folded in), the library's `ground.salt.ochre` and
      `ground.soda.crust` on their crusts. kits/islanders reads 42r and 44r in place, so its page carries the six new defs (unplaced).
- [ ] **Farside's alkali and lime come from its flora, not a node (2026-10-26):** the kelp kilns burn the land kelp to
      ash (potash and soda: the same two goods as the Catch's planned potash and alkali-salt nodes, `biomes/catch/PLAN.md`
      6a), and the lime kilns burn the spray coral to lime. They are crops in `kits/crops` (`kelp-ash`, `coral-lime`), not
      nodes; when the Catch adds its potash and alkali-salt nodes, a works rule that takes either a node or the crop would
      let Farside's glassmakers draw on both.
- [ ] **The fairness audit's findings (2026-10-26, `data/ledger.json` `audit`):** 21; 25 since the 5.1 rebake and the ores on the new rocks (2026-11-03, `GEOLOGY.md`). "Yuni Emirate: Spindle Fan" shows twice: the map has two polities named Yuni Emirate (for the owner). The marble quarry's library set reads flat and pale at a distance (`rock.marble012`, full colour): a tint or a veinier set would help. Most are inland towns with no salt
      within a day's travel (30 km): the Lizardmen's five towns, four of Xanadu's, four of the Dalab's, Wildcat (Fellgangs);
      Jimjam's Serai has no stone in reach; the polities with no settlement (Coyote Kingdom, Painted Men, Tungang Union, Yeti
      Kingdom, Lesser Throne) are audited at their centroid and miss wood, water or salt there; Region 87's eleven towns reach
      every kind, so it imports nothing. They are the map's, not the code's: the owner may place salt springs (owner nodes by
      id), widen the day (`dayKm`), or accept that those towns buy their salt. `verify.py --assert` reports the count; it does
      not fail on it.
- [ ] **The rejection is coarse without the host's ground:** the baked mask is ~4 km a cell, so a page that passes no
      `ground(x, z)` drops only on whole cells of water or cliff. An open world passes its own heights.
- [ ] **The GDScript twin is not in godot/ yet** (`godot/kres_field.gd` here, proved against the JS and the bake on Godot
      4.7.2 in a scratch project: `GEOLOGY.md`, "Godot"): `godot/tools/sync_core.py` should copy it with its test and data.
- [ ] **Hookups requested, not made** (files this kit does not own): `core/hamlet` `KHAMLET.village` should take its
      resource from `KRES.near` when the spec names none; `core/simulation`'s trade takes `RES_LEDGER.tradeGoods` as
      `goods` (an input: no change to the trade is needed, but the isle demo's page must pass it).
- [ ] Stone and clay have prospectivity bytes but no node kind (the ledger reads them); salt pans stay RES_FIELD fields
      (biome `gather` tags), beside the rock salt nodes.
- [ ] **Gypsum and rock salt draw on vertex colours** (2026-10-26): the efflorescence set reads as dark marble on their slabs.
      Owed: a pale bedded gypsum crust with selenite (`ground.gypsum.crust`) and a cut rock-salt face (`rock.halite.cut`);
      their prompts are in `core/materials/PROMPTS-NEEDED.md`, section 32 (2026-10-26).
      2026-11-08: that section is pruned and its number reused; both sets are in `core/materials/library` now: what is owed is wiring them.
- [x] **potash, soda and marble never drew their sets** (found 2026-11-16): they were packed (`materials.json`, `tex/`) but missing
      from `SV_LIB` (`26k-kit.js`), and the engine makes a material only for an `SV_LIB` key, so their nodes drew the fallback
      (vertex colours). Added to `SV_LIB` with the mined goods' sets; the resources page's look of those three changes.
- [ ] **The mined goods' layers are written, not baked** (2026-11-16): `tools/scale-model/geology.py` `mined()` and its
      `--mined` pass give the ten kinds their layers (`GEOLOGY.md`, "The mined goods' kinds"), but `data/geology.json` does not
      carry them: baking them in reaches 13 build commands (62 pages), so it rides with the next bake, with
      `lode:thalaba-sulfur` and the ledger's rerun. Until then the node field places none of them: owner nodes only.
- [ ] **Four of the mined goods draw on vertex colours:** lodestone (`rock.magnetite`), opal
      (`rock.opal.matrix`), jade (`rock.serpentinite`, `stone.nephrite`) and amber (`rock.amber.blueearth`); prompts in
      `core/materials/PROMPTS-NEEDED.md` sections 46, 52 and 53.
- [ ] **Building kits do not see the mined goods' kinds:** kits/islanders, kits/construction and the isle demo read `42r` and
      `44r` in place, not `42s` and `44s`-`44u` (kept apart so their pages did not move). A works there that should take lodestone or
      peat needs those four fragments added to its build's list, and a rebuild.
- [ ] **No trade link yet:** each kind names the Gemini good it feeds (`RES_ORE.kinds[k].good`), but `46r-res-ledger.js` and
      core/simulation do not read it; Gemini's model is on its own branch and docs.
- [ ] **`lode:thalaba-sulfur` is recorded, not stamped** (2026-11-16, for the Thalaba session; the owner settled Thalaba's own
      small sulfur node, 30 t a year): it is in `data/lodes.json` but not on `data/geology.json`. Stamping
      (`python3 tools/scale-model/geology.py --lodes kits/resources/data/geology.json kits/resources/data/lodes.json`) changes the
      geology every open-world region, Copper Glacier and Firebliss read (13 build commands, 62 pages: `tools/reach.py`), so it
      rides with the next bake or the next all-builds rebuild. Until then Thalaba places it as an owner node.
