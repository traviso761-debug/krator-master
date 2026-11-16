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
- [ ] **Salphar's sulfur deposit has no resource record.** The authored lode (`lode:thalaba-sulfur`, px 841,1452, r 3 km) was
  sent to the resource-nodes session (claude/resource-nodes-7ec053), which is rewriting `kits/resources/data`; the message was
  not picked up when sent. The hamlet's `sulfur` focus needs no node, so nothing is broken meanwhile.
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
