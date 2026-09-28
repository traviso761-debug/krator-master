# Highlands — known issues

Open items are `- [ ]` lines; build.py prints them.

- [ ] Vendored Ancients fragments `30-kit 36-decor 38-helpers2 54-mat-concrete 69-mat-salvage` were copied from `../iziz/src` and differ from `../ancients/src` (the drift Iziz already carries); re-vendor both kits together.
- [ ] `vnStairs` (vendored from Iziz) centres its run at `run/2` while treads span `steps*.32`, so the top treads can end inside the wall; `hnKryltso` inherits it (R-A works around it with `hnRAKryltso`).
- [ ] Steep `hnGable` roofs drop the eave low; dougong placed under such eaves disappear or poke through — packages put brackets on porches, loggias and galleries instead.
