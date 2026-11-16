# settlements/lightwall: known issues

## Done (2026-11-16, PLAN.md steps L2 and L3)

- The town's own page on Xanadu's (`build.py`, `kit.json`, `targets/town/`, `verify.py`): the bench town on core/city
  (frontage-courts with the Xanadu kit), the Glaziers' wall from the Tungang kit's `gz-*` set (the central quarter carved
  from the void plans with KCAVERN, the outer wall as fronts on whole rock), the lake, the north wall, the flora.
- The owner's answers of 2026-11-16 in `PLAN.md` (the writ, the footprint, this pass), its page design (section 8) and its
  Core adoption (section 9).

## Open

- [ ] **The Glaziers' fronts are in vertex colour.** The page cap (16 MB): Xanadu's page with the Qiblai kit's pack is
      already about 15 MB, and the Tungang kit's texture pack (whitewash, hewn basalt, gilt, carpet, celadon...) is 7.5 MB more,
      so `build.py` seals TG with `tex=False`. Owed: the pack beside the page (a sidecar, as Xanadu's own pack is), or the
      gz families in a lean pack.
- [ ] **The furniture has no detail maps** (`kit.json` `furnitureTex: false`), for the same cap; the interiors are L4.
- [ ] **The carved rock has no texture** (KCAVERN's vertex colour, as on the kit sheet: `kits/tungang/KNOWN_ISSUES.md`). The
      bands' plain rock takes the kit's `hewn` map when TG has one (none with `tex=False`).
- [ ] **The flora is the Vale of Xanadu's**, the page's own biome, as Qiblai's: Opal Valley's (`biomes/opalvalley`, on
      the sites branch) is owed, sealed as Qiblai seals the biome kits it wants.
- [ ] **The ground is the site's numbers, not the open world's**: the bench's profile, the wall's line and the north wall
      are functions of the scale model's numbers for the site (PLAN.md 1), not `core/world`'s heightfield. L5 puts the town on
      the open world.
- [ ] **The north wall is a plain mass** (one rock colour by height, snow over 2,300 m): a far field with strata, ridges and
      shading (`core/terrain`'s `KFAR`, `KSTRATA` with Opal Valley's recipes) is owed; so is a cliff face between the bands that
      reads as rock rather than as stepped blocks.
- [ ] **The lake is a plane** (Qiblai's river likewise): `core/water`'s still water and its shore are owed.
- [ ] **The carved quarter costs about 11 s to mesh** (KCAVERN at 0.5 m over 174 sites, about 1.3 M triangles). A smaller
      quarter (`LW.CARVE`) or the cavern meshed by chunk near the camera would cut it.
- [ ] **No interiors** (L4), no people (`core/charactermodels`), not in `XAN_TUNE` (L1), not on the open world (L5).
- [ ] **The Register's numbers are Latin digits** (the kit's: `kits/tungang/KNOWN_ISSUES.md`).
