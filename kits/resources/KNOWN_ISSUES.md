# kits/resources: known issues

`build.py` prints the open ones (`- [ ]`) after every build.

- [ ] The veins, seams, pools and grains are vertex colours on simple shapes. The library has no ore or mineral sets, so
      the prompts are in `core/materials/PROMPTS-NEEDED.md` (section 1, "The Resources kit", added 2026-10-15):
      - `rock.coal`;
      - `ground.tar.seep`;
      - `ground.efflorescence` (saltpeter);
      - `rock.malachite` (copper);
      - `rock.quartz.vein` (gold);
      - `rock.cassiterite` (tin);
      - `rock.galena` (silver).

      Section 3 holds two more to check first: `rock.gossan` (iron; `rock.basalt.oxidised` may do) and `rock.pegmatite`
      (rare earth; `rock.granite.tor` may do). Each lands as a family in `materials.json`, and the node draws that face with
      its key in place of `plain`.
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
