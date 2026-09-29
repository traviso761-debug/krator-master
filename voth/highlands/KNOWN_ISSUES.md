# Highlands — known issues

Open items are `- [ ]` lines; build.py prints them.

- [ ] Vendored Ancients fragments `30-kit 36-decor 38-helpers2 54-mat-concrete 69-mat-salvage` were copied from `../iziz/src` and differ from `../ancients/src` (the drift Iziz already carries); re-vendor both kits together.
- [x] `vnStairs` (vendored from Iziz) centres its run at `run/2` while treads span `steps*.32`, so the top treads can end inside the wall; `hnKryltso` inherits it (R-A works around it with `hnRAKryltso`). — round 10: `vnStairs` is self-consistent (its run IS `steps*.32`, centred on z); the fault was `hnKryltso` sizing its run as `rise*1.3`. It now takes the treads' own run, foot at `run`, top at the wall. Vendored file untouched.
- [x] Steep `hnGable` roofs drop the eave low; dougong placed under such eaves disappear or poke through — packages put brackets on porches, loggias and galleries instead. — closed round 10: the frame (73b) lifts every storey roof by its bracket height (`hlLift`) and places the sets in `hlFrameFlush`, so storey eaves carry their dougong; the remaining explicit `hnDougong` calls are all on galleries, porches or curved roofs.
