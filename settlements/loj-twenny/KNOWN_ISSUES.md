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
  ride source (`SIM.trade({line})` is the next step). The timer now keeps the drawn train's timetable (`LTS.LINE_RUN`, held to
  the ride source by the page's `mood` check), but its phase is its own: the trade's train and the drawn one need not stand at
  the platform at the same minute.
- [ ] **The mood's numbers are placeholders** (`LTS.NEEDS`, `MEALS`, `RULES`, `UNREST`: the isle demo's lines where the hold has
  none of its own). The miners run least happy (labour 1); a blight of the beds reaches grumbling in about twelve days and a
  refused demand in fourteen; nothing yet strikes in the crisis run, because the Fixers, first to the strike stage, work at a shop
  that makes nothing a strike can hold (a strike holds recipes).
- [ ] **Nobody is born, dies, comes or leaves**: the census is the beds. A hungry hold grumbles and demands, it does not shrink.
- [ ] **The Big Meeting is yearly**, so a run of weeks sees it once (day 1); the loj meeting is the weekly one that fills `voice`.
- [ ] **The station's lining** stands in with `concrete.ancient` until `concrete.lining.segment` comes (`core/materials/PROMPTS-NEEDED.md`
  section 41); the hold's own rooms are the cavern's hewn rock in vertex colours.
- [ ] **The Godot export** is not wired (core/export): the plan (`KCITY.cavern.exportPlan`), the light (`KCAVELIGHT.export`) and the
  motion (`SIM.rideExportMotion`) are each exportable.
- [ ] **Gallery.** A new settlement: it goes into the Krator Worlds gallery when it first reaches `main`.
- [x] **Fixed 2026-11-12** (the owner's look at the hall): the count wall's chalk now fits the steward's board, which hangs 1.1 m up
  over the desk instead of standing on the floor behind the dais; the chalk is in Tungang (`LTS.WALL`: MASH, GREYN, WAKS, UAR,
  PLAY', AHS; ANZ, TLOJ, ART and the stage, AWREET to SKAB); the furniture is textured (the catalog's detail maps); a
  double-click on a room stands the pin on its floor (`ltPick`: the host's own pick marched to the -60 m ground under the hold).
