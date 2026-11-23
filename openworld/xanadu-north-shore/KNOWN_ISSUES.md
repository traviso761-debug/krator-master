# openworld/xanadu-north-shore: known issues

- **No town at Phēr yet.** The town is step P3 (`settlements/pher`); until it is placed as a town footprint
  (`core/world` towns), the region shows Phēr's ring and roads round an empty shore.
- **Thalaba's countryside is not planned here.** Its site is the road's end only; its plan is `settlements/thalaba/PLAN.md`.
- **Godshearth's mouth and the Godthrone's flank have no kit.** 55 of the cut's px; they grow nothing.
- **The lake towns east of Phēr.** Māuṭh's ground is its page's (2026-11-23, `settlements/xanadu-lake` step L0:
  `core/world/bake_towns.py mouth`, R 1.4 km, band 600 m, its stream joined to no model river); its buildings are not drawn
  here yet (a town tile: `drawn: false`, as Phēr's). Ōlḍ-Thalaba and Ḍāiyar are sites with no ground of their own yet
  (`settlements/xanadu-lake/PLAN.md` step L1).
- **The headland and the point are records finer than the model's cells.** Their places are the plan's; the verify checks
  that they stand over the lake, not yet that the cove between them is sheltered water of the planned size.
