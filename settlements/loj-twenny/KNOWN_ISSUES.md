# Loj Twenny: known issues

- [ ] **Where the hold is** (`PLAN.md` section 1): built at the end of the 25 km branch (the owner's Line answer 3); the Tungang
  plan's older text puts it by the junction under the great shaft. Asked of the coordinating session 2026-11-11, unanswered.
- [ ] **Stand-in places**: the market in the platform's bays, the hold's stores, the Fixers' shop and the vein working are sim
  places at plan nodes with no def drawn: `tg_platform`, `tg_fixers_shop`, `tg_vein_working`, `tg_ore_store` are not built yet
  (`kits/tungang/PLAN.md` 3.2).
- [ ] **The shuttle's doors are drawn shut** (the vehicles kit's doors do not open: the riding session's note); the door lamps
  light green in the window and the walk frames open.
- [ ] **No riders from the sim yet**: the player rides; the people walk the hold, and the trade's carriers are timers, not the
  ride source (`SIM.trade({line})` is the next step).
- [ ] **The hall's lining** is the cavern's hewn rock in vertex colours: the Line's lining sets (`concrete.lining.segment`, owed:
  `core/materials/PROMPTS-NEEDED.md` section 41) are not on this page.
- [ ] **The Godot export** is not wired (core/export): the plan (`KCITY.cavern.exportPlan`), the light (`KCAVELIGHT.export`) and the
  motion (`SIM.rideExportMotion`) are each exportable.
- [ ] **Gallery.** A new settlement: it goes into the Krator Worlds gallery when it first reaches `main`.
