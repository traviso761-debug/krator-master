# biomes/highrift: known issues

First pass, built in the cloud on 2026-11-03 (branch `claude/highrift-cloud`). **No GPU here**: the pages were loaded in headless
Chromium on software GL (SwiftShader) only; the coordinator runs `verify.py --assert --all-views` on the GPU before merging.

## Open

- [ ] **GPU verify owed** on all five pages (`verify.py dist/highrift*.html --assert --all-views`), and the hash baseline entries after it.
- [x] **The fault mirror's texture** (`rock.hematite.mirror`, delivered 2026-11-03, `core/materials/PLAN.md` "Delivered 2026-11-03"): wired
      at the merge as the `mirror` layer's family (roughness 0.22 kept); the procedural hematite tint draws only with `?kground=0`. Its look is the owner's.
- [ ] **`KSCOUR` on the Gill's bed** (station `coulee`): the channel, its bars and its stream bed are the stage's own carve; KSCOUR's potholes,
      dry falls and current ripples are owed. Aufeis (the Gill's winter ice) is not drawn.
- [ ] **The sound is data only** (`HRIFT.SOUND`, the page's "export sound"): there is no `core/audio`. The owner's call whether to write one
      now or wait for the Godot port (`PLAN.md` section 11, item 7).
- [ ] **Lake Cinnabar** (3,120 m, the red lake) has no page (`PLAN.md` sections 3 and 11).
- [ ] **No impostors**: the Mirror's rift larch grows heroes, mid and far tiers from nhighlands' builder; `BIO.bakeImpostors` runs on the page but
      no impostor set is declared for the larch yet (the far trees are the builder's own far tier).
- [ ] **The pages are ~5-6 MB**: the Oidong pack (21 families) rides along for `OIDONG.buildHigh`'s few items. Trim the kin's family list to what
      buildHigh draws once its items' slots are known.
- [ ] **The gjá's beck**: Verdigris Beck rises in the master gjá's floor water; its first reach out of the gjá is not drawn as a flow.
- [ ] **nhighlands is being rebuilt (pair 7) while this kit reads its larch in place**: re-check the Mirror's larch after that turn merges (the
      attach audit, `BIO.flareJoin` on its limbs).
- [ ] The card fit for `tussock` (`card.ichu`) and `heath` (`card.steamcomb`) is `check_cells.py --fix`'s stems proposal, not reviewed by eye.

## Decisions taken in the first pass (for the owner's look pass)

`PLAN.md` section 11.
