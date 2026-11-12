# Loj Twenny: known issues

- [x] **Where the hold is**: settled by the owner 2026-11-11 (station 3, under the great shaft); rebuilt there. The Line's station
  page still names its branch "toward Loj Twenny (25 km east)" (`biomes/line/stations/station/48-line-window.js`): the Line session's
  to rename.
- [ ] **The Line's station page is behind its sources**: `biomes/line/stations/station/88-host-station.js` gained an opt-in `open` flag
  on a door (this page sets it); the Line's pages need their rebuild (already stale from the merges: the proposed rebuild session).
- [ ] **Stand-in places**: the market on the island, the hold's stores and the Fixers' shop (in the station's own rooms) and the vein working are sim
  places at plan nodes with no def drawn: `tg_platform`, `tg_fixers_shop`, `tg_vein_working`, `tg_ore_store` are not built yet
  (`kits/tungang/PLAN.md` 3.2).
- [ ] **The train's doors are drawn shut** (the vehicles kit's doors do not open: the riding session's note); the door lamps
  light green in the window and the walk frames open.
- [ ] **No riders from the sim yet**: the player rides; the people walk the hold, and the trade's carriers are timers, not the
  ride source (`SIM.trade({line})` is the next step).
- [ ] **The station's lining** stands in with `concrete.ancient` until `concrete.lining.segment` comes (`core/materials/PROMPTS-NEEDED.md`
  section 41); the hold's own rooms are the cavern's hewn rock in vertex colours.
- [ ] **The Godot export** is not wired (core/export): the plan (`KCITY.cavern.exportPlan`), the light (`KCAVELIGHT.export`) and the
  motion (`SIM.rideExportMotion`) are each exportable.
- [ ] **Gallery.** A new settlement: it goes into the Krator Worlds gallery when it first reaches `main`.
