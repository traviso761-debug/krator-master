# openworld/xanadu-north-shore: known issues

- **No town at Phēr yet.** The town is step P3 (`settlements/pher`); until it is placed as a town footprint
  (`core/world` towns), the region shows Phēr's ring and roads round an empty shore.
- **Thalaba's countryside is not planned here.** Its site is the road's end only; its plan is `settlements/thalaba/PLAN.md`.
- **Godshearth's mouth and the Godthrone's flank have no kit.** 55 of the cut's px; they grow nothing.
- **The lake towns.** Seven lake towns' ground is their page's (2026-11-23, `settlements/xanadu-lake` steps L0 to L2:
  `core/world/bake_towns.py <key>`, R 1.4 km, band 600 m; Māuṭh's stream joined to no model river, the others with none):
  Māuṭh, Ōlḍ-Thalaba and Ḍāiyar east of Phēr, Qōqō, Nēṭ, Malbari and Hāibh west of it (step L2 added their sites and
  corridors, and the re-cut widened the box west to px 804; its origin is pinned at px 845,1479, SITES.json `origin_px`, so
  the world's relief, laid in the region's frame, and Phēr's ring and road keep their ground: the site plan is unchanged). Their buildings are not drawn here
  yet (a town tile: `drawn: false`, as Phēr's).
- **The headland and the point are records finer than the model's cells.** Their places are the plan's; the verify checks
  that they stand over the lake, not yet that the cove between them is sheltered water of the planned size.
