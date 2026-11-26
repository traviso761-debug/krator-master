# Known Issues (`kits/cascade`)

None open.

- Resolved during initial build (2026-11-24):
  - Non-overlapping `KDRAWN.grid` border patches around the `4 m` inner canal grid so coarse outer terrain triangles never bridge over the `-3.2 m` canal trenches.
  - Camera-independent `AV.ensureRecords('refurbished')` registers all 1,090 rooms across all 14 decks at boot while spawning Three.js interior geometry on demand (`X` storey cutaway or `C` vertical cross-section) to stay well within frame draw-call and triangle budgets.
