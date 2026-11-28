# Known Issues — `settlements/battered-port/`

- Citizens are rendered via lightweight instanced multi-part cohorts driven by `SIM.pose` and `core/charactermodels/data/peoples.json` skin/outfit palettes until `core/charactermodels` lands its low-VRAM settlement crowd batcher.
- Scale-model world pin attachment (`(435, 259)` / `(472, 259)`) remains deferred to a dedicated scale-model pass (`PLAN.md` §1.2).
