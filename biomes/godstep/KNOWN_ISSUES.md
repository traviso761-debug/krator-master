# biomes/godstep: known issues

- [ ] **Verified in software GL only** (2026-11-09, a cloud session with no GPU; the owner: no GPU verify from cloud sessions). Station 1
  passes `verify.py --assert` on SwiftShader with one or two views; `--all-views` and the GPU's triangle and draw-call measures are
  the integration session's.
- [ ] **The ground uses all 16 texture units** (`window._groundUnits`: 16 of 16 with four KGROUND layers: black sand, snow, moss, the
  crusts). A fifth layer (palagonite, soil) needs one of these dropped or the paint to carry it, as the palagonite and soil do now.
- [ ] **The front's beds from the bake (core's owed item 1) are wired but empty at station 1**: none of the head step's baked lobes
  reaches the lip in this layout, so `KLAVA.column` at the lip is empty and the front shows the stair's own flows (`KRELIEF.stair`'s
  `flowTops`, one formation a flow) under the head step's floor. A lobe that reaches the lip would add its flows on top.
- [ ] **Not taken at station 1 from the plan's adoption list** (each a later turn's, or the station's when it needs it): `ATMOS.snowCover`
  (the paint carries late winter's snow; the snow cover's own unit would pass 16), `KTHERM` and the `breath` mode (the head, station 3),
  `KCAVERN` and `KRELIEF.tubeRille` (the rille, station 2), `KSTACKS` (kipukas, hornitos: station 2), `40-core-basin` (step 4's salt
  playa, station 4), `42-core-frost`, `KGEODE` (the aura geodes: the fronts' and rilles' flow tops, owed), `WATER.mirrorSwitch` (the
  one water is a small iced pond), the Godthrone's crusts and endoliths read in place (the kit's own pioneers stand in at station 1).
- [ ] **The playa's pond is iced by colour**, not by `WATER.ice` (ext/54 not taken).
- [ ] **The far country's edge**: from the overview the map's square reads against the far mesh (the apron shows). Not judged on a GPU.
