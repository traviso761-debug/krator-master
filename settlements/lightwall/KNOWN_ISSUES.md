# settlements/lightwall: known issues

## Done (2026-11-16, PLAN.md steps L2 and L3)

- The town's own page on Xanadu's (`build.py`, `kit.json`, `targets/town/`, `verify.py`): the bench town on core/city
  (frontage-courts with the Xanadu kit), the Glaziers' wall from the Tungang kit's `gz-*` set (the central quarter carved
  from the void plans with KCAVERN, the outer wall as fronts on whole rock), the lake, the north wall, the flora.
- The owner's answers of 2026-11-16 in `PLAN.md` (the writ, the footprint, this pass), its page design (section 8) and its
  Core adoption (section 9).

## Done (2026-11-16, the owner: "textures and the wall's look")

- **The Glaziers' fronts textured**: the Tungang kit's library pack (whitewash, hewn basalt, gilt, carpet, celadon, enamel,
  potch, carved timber, silk...) beside the page in `dist/lightwall.tex.tungang.js` (7.7 MB; `tungang_bundle.bundle(side=...)`,
  `tools/textures/matlib_pack.py write_sidecar`), so the page stays under the 16 MB cap (15.4 MB). Publish the file with the page.
- **The scarp's rock textured**: the bands, the carved quarter and the north wall take the library's `rock.rock_face` (Xanadu's own
  `xRock`, no new pack) through core/terrain's ground shader (`KGROUND.hook`: hex tiling, the distance scale, triplanar on the steep),
  tinted per vertex by the north fault's beds (`lwStrata`: basalt, rhyolite, tuff, warped by core/rand's value noise).
- **The bands' faces are rock**: between the fronts each band's face is a displaced grid (0.25 m out to 0.85 m in, flat behind every
  front, a worn lip at the ledge) in place of a slab; the north wall's mesh faces up (it was culled); the wall's foot is scree.

## Open

- [ ] **The furniture has no detail maps** (`kit.json` `furnitureTex: false`): the page holds about 15.4 MB of its 16; the
      interiors are L4, and their detail maps go beside the page with them.
- [ ] **The flora is the Vale of Xanadu's**, the page's own biome, as Qiblai's: Opal Valley's (`biomes/opalvalley`, on
      the sites branch) is owed, sealed as Qiblai seals the biome kits it wants.
- [ ] **The ground is the site's numbers, not the open world's**: the bench's profile, the wall's line and the north wall
      are functions of the scale model's numbers for the site (PLAN.md 1), not `core/world`'s heightfield. L5 puts the town on
      the open world.
- [ ] **The north wall is one mesh in beds** (the strata tint and the rock face, snow over 2,300 m): ridges, buttresses and
      gullies, and Opal Valley's own strata (`KSTRATA` with its recipes, `KFAR` past a few km) are owed. From far off the rock
      face's tile still shows as horizontal banding.
- [ ] **The bands are stepped blocks with rock faces**: their faces are rock (displaced, in beds, textured), but their ends and
      ledges are square. A cliff between the bands, and screes and ledges that wander, are the next step.
- [ ] **The lake is a plane** (Qiblai's river likewise): `core/water`'s still water and its shore are owed.
- [ ] **The carved quarter costs about 11 s to mesh** (KCAVERN at 0.5 m over 174 sites, about 1.3 M triangles). A smaller
      quarter (`LW.CARVE`) or the cavern meshed by chunk near the camera would cut it.
- [ ] **No interiors** (L4), no people (`core/charactermodels`), not in `XAN_TUNE` (L1), not on the open world (L5).
- [ ] **The Register's numbers are Latin digits** (the kit's: `kits/tungang/KNOWN_ISSUES.md`).
