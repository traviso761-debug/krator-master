# biomes/highrift: known issues

First pass, built in the cloud on 2026-11-03 (branch `claude/highrift-cloud`). **No GPU here**: the pages were loaded in headless
Chromium on software GL (SwiftShader) only; the coordinator runs `verify.py --assert --all-views` on the GPU before merging.

## Open

- [ ] **GPU verify owed** on all five pages (`verify.py dist/highrift*.html --assert --all-views`), and the hash baseline entries after it.
- [x] **The fault mirror's texture** (`rock.hematite.mirror`, delivered 2026-11-03, `core/materials/PLAN.md` "Delivered 2026-11-03"): wired
      at the merge as the `mirror` layer's family (roughness 0.22 kept); the procedural hematite tint draws only with `?kground=0`. Its look is the owner's.
- [ ] **`KSCOUR` on the Gill's bed** (station `coulee`): the channel, its bars and its stream bed are the stage's own carve; KSCOUR's potholes,
      dry falls and current ripples are owed. Aufeis (the Gill's winter ice) is not drawn.
- [ ] **The ground's texture units** (the GPU verify, 2026-11-04): the Mirror's ground passed SwiftShader's 32 units but not the 16 both GPU lanes allow.
      85 now counts them (`samplersOf`, `window._units`) and, in the Throne's order, gives the rain cover a unit only where it fits beside the snow and
      the weather's 4, then the horizon on the ground only where its 2 fit too: the Mirror has neither on its ground, the Caldron and the Coulee the rain
      cover but no ground horizon (the flora keep the horizon everywhere). The count is of declared samplers, so it errs safe: an exact count
      (active samplers after the compile) would give some stations their ground horizon back.
- [ ] **The sound is data only** (`HRIFT.SOUND`, the page's "export sound"): there is no `core/audio`. The owner's call whether to write one
      now or wait for the Godot port (`PLAN.md` section 11, item 7).
- [ ] **Lake Cinnabar** (3,120 m, the red lake) has no page (`PLAN.md` sections 3 and 11).
- [ ] **No impostors**: the Mirror's rift larch grows heroes, mid and far tiers from nhighlands' builder; `BIO.bakeImpostors` runs on the page but
      no impostor set is declared for the larch yet (the far trees are the builder's own far tier).
- [ ] **The pages are ~5-6 MB**: the Oidong pack (21 families) rides along for `OIDONG.buildHigh`'s few items. Trim the kin's family list to what
      buildHigh draws once its items' slots are known.
- [ ] **The gjá's beck**: Verdigris Beck rises in the master gjá's floor water; its first reach out of the gjá is not drawn as a flow.
- [ ] **The Mirror's rift larch is off by default (`?larch=1`)**: nhighlands' builder, read in place by `BIO.kin`, set 462 of 4808 larch cards
      off their limbs (9.6%, limit 1%; software GL, 2026-11-03). Grow it by default once nhighlands' turn (pair 7, under way) holds its crowns
      (`BIO.holdTo`), then re-run the attach audit. Until then the region has no tree on its pages.
- [ ] The card fit for `tussock` (`card.ichu`) and `heath` (`card.steamcomb`) is `check_cells.py --fix`'s stems proposal, not reviewed by eye.

## What ran here (software GL, SwiftShader, 2026-11-03)

`verify.py <page> --assert --views <one view>` on every page: **all five OK** (the Caldron, `--views "The Caldron and the cataract"`, 3.1M
triangles, 41 calls; the Mirror, "The fans under the fault", 4.1M; the Wedge, "The crest", 4.1M; the Coulee, "The Gill's channel", 8.7M; the
Gjár, "A singing fissure", 8.1M of the 10M showcase budget). Stations 1 and 5 were verified before the last two fixes, which touch only the
other stations' code paths (their pages' bytes moved). Not run: `--all-views`, the GPU, the hash baseline.

## Decisions taken in the first pass (for the owner's look pass)

`PLAN.md` section 11.
