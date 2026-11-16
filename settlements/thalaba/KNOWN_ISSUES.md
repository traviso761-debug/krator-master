# settlements/thalaba: known issues

- [ ] **The Dalab mission's pieces run on procedural maps.** They are the Dalab set's own (the healers' hall, the granaries, a
  family compound: `settlements/dalab/src` 69d, 69e, 70, 71, 73 read in place, kit.json `external`), but Dalab's library pack
  (146 files) is not taken: the page is 11 MB and the pack would push it toward the cap. To do, if the owner wants the
  textures: a pack of only the families those three pieces use (`matlib_pack.fragment(..., exclude=...)`).
- [ ] **Thalaba's own pieces are local.** `tb_devisers` and `tb_calcarone` (`src/89t1-tb-pieces.js`, on the Xanadu kit's
  contract, shown on `dist/thalaba-pieces.html`) start here, as Qiblai's started in its kit; they go upstream into
  `kits/xanadu` once the owner has seen them. Until then the open world's Salphar draws its calcaroni as the hamlet row's
  pending boxes (`openworld/xanadu-oidong-highrift/src/48-world-site.js`, row `xanadu-sulfur`). Still owed of PLAN.md's list:
  the bridge's toll house (the region's bridge itself is core/world's, in the Xanadu kit's stone).
- [ ] **Salphar's sulfur deposit is recorded but not stamped.** `lode:thalaba-sulfur` (px 841,1452, r 3 km) is in
  `kits/resources/data/lodes.json` on the resource-nodes branch (claude/resource-nodes-7ec053, f568d34e9, 2026-11-16), not yet
  stamped on `geology.json`: stamping changes the geology 13 build commands read (62 pages), so it rides with the next bake or
  `--lodes` pass (logged in `kits/resources/KNOWN_ISSUES.md`). Until then a page that wants the node places it as an owner node,
  `KRES.nodesIn(tile, {owner: [{id: 'lode:thalaba-sulfur', kind: 'sulfur', grade: 'medium', x, z}]})`. Salphar's `sulfur`
  focus needs no node, so nothing waits on it.
- [ ] **The page's far land still has the old lake.** The Phēr road was re-routed (2026-11-16) on the re-made lake's heights
  (scale model 5.1 edit 7 re-run, 5f659c054 on claude/gemini-trade-reconcile, Phēr at 843,1491), but this branch's
  `tools/scale-model/model/data` is the old model, so `gen/69u-tb-ground.js` (and the region `xanadu-oidong-highrift`) draw the
  lake where it was. Rebuild both once the re-run reaches this branch: nothing in the town's plan changes (the bench and the
  town are outside the edit's box).
- [ ] **The people are estimates.** `TB_PEOPLE` in `targets/town/89zt-tb-site.js` gives each building a household; the town
  holds about 2,500 against the plan's 2,400 (`verify.py` reports it as a budget).
- [ ] **The springs are the plan's.** The spring line at the riser's foot is the owner's choice and the plan's reasoning (the
  river's water out of the mouth's gravels); the model carries no spring records.
- [ ] **The far land is one coarse mesh** (500 m cells, coloured by height and slope) beyond the near ground (the town and the
  riser to the gorge's mouth, 10.4 km north): the gorge's walls read as a pale snowy ridge in the haze; Gāḍz-Phōl is a white
  streak along the Āirã Siṭrīm's steep reach, not a core/water fall. The model's rivers there lie on the gorge's east flank,
  not in its trough (PLAN.md section 8).
- [ ] **The Siṭēps' banks are painted.** The terraces' treads are stepped into the ground (1.8 m a step, 30-40 m treads on the
  riser's 4-7 %), but the 20 m mesh smooths each riser into a ramp, so the banks are drawn on the ground's canvas as contour
  lines (marching squares on the same heights). No retaining walls as pieces yet.
- [ ] **The flora is the Vale of Xanadu's**, bound as its open vale (parkland, orchards) for the bench's Cfb at 1,500 m; the
  page's own sprinkling of figures is Xanadu's. Godshearth's Hearths are up in the caldera, not here.
- [ ] **Not yet:** interiors, the life layer on core/simulation, the Godot export, the gallery.
