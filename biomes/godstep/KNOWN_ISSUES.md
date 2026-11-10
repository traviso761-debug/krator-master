# biomes/godstep: known issues

- [x] **Station 1 verified on the GPU** (2026-11-09, `claude/cloud-kits-verify`): `verify.py --assert --all-views` passes on the Arc lane, 16 of 16
  ground units linking there (15 since 2026-11-10: re-run owed with the others).
- [ ] **Stations 2-5 (and station 1 at 15 units) GPU verify owed** (2026-11-10, a cloud session with no GPU): each passes `verify.py --assert`
  in software GL; `KRATOR_GL=gpu` with `harness.py lock`, `--assert --all-views`, on all five pages, is the local session's.
- [x] **The ground at 15 texture units** (2026-11-10): station 1 dropped its lichen-crust layer (the paint and the crust items carry it): 15 of
  15, three KGROUND layers; every station keeps to three layers with a map (`STN.kground`), and `verify.py` asserts `window._groundUnits`
  against 15. A fourth layer on any station needs one of them dropped or a shared sampler.
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

## Stations 2-5 (2026-11-10)

- [ ] **Station 1's passes run on every station** (stones, cushions, crusts, talus): on the wall they lay ~87k stones under the forest and on
  the rille ~89k stones on the plain (the rille's `godstep/ground` 8.15 M triangles against 7 M, the scene 9.8 M against 9 M: soft budgets,
  reported OVER). A station cannot thin them yet; the redlands keep them off its steppe by setting `path` in `coreFields`. Wanted: a
  station's density for station 1's passes (`STN.ground {stones, ...}`).
- [ ] **The rock faces read near-black at range** on the rille and the wall (station 1 the same); the wall's falls read as threads from its foot.
- [ ] **The rille**: `KRELIEF.tube` makes a tube 1.7 r high (40.8 m at r 24) while the record's bore is 28 m (KCAVERN's; its floor set from
  KRELIEF's); only the walked skylight has a cavern under it (the chain's other skylights are dark discs, its collapses heightfield pits);
  no tube mouth in the rille's head wall (the rille's floor is ~70 m under where the tube's would meet it); the moss along the stream reads
  too saturated; "The spring and the stalk fields" view wants re-aiming at the fields; the eye stands in the tube through a wrapper of
  `KHOST.take` (`98z-host-floor.js`): `src/99` should pass a station's `STATION_FLOOR`.
- [ ] **The hearths**: soft budgets over (`godstep/ground` 7.28 M against 7 M, the scene 9.38 M against 9 M: station 1's passes on the pit's
  floor and dish); the scoria's paint reads speckled close up in software GL (judge on a GPU); the rim view was blocked by the lip's crest
  until 2026-11-10 (now it stands on the crest with a checked sightline); the dark band at the dish's edge in the rim view is the far
  country's seam (as station 1's "far country's edge"); the hearth trees are the Hearths' `rim` dress, not a
  broad-fanned dress of the stair's own (the Hearths' plan asks for broad fans: a `HEARTH.DRESS` entry in `biomes/hearths` is that kit's).
- [ ] **The redlands**: the talus under the breakaways and mesas takes the kit's basalt palette (reads black, not laterite red); the
  sedesert's creosote is left out of its scrub and rim mixes on this page (its near tier failed core's one-LOD-key audit here, 2 of 61 tall
  cards: the sedesert kit's turn); the pan stands at ~856 m in a closed dish where the map can hold it, while on 5.1 the floor keeps falling
  SSW to ~825 m 12 km off; front 3 is compressed onto the map's west side (on the model a ~5 km ramp 25-35 km west), its step-3 plain over
  the model's step-4 floor out to ~30 km; the breakaways' face reads grey-brown (not judged on a GPU). Workarounds a shared change would
  remove: `STRATA.colorAt` wrapped for the far band (84 reads only the first stack), `SKY.draw` wrapped to run `MIRROR.update()` (no mirror
  hook in 99), `BIO.mask` wrapped with an exact-slope test during the sedesert's pass.
- [ ] **The wall**: on the model Rrivar Cistal and Guli Blaca leave north; the page draws the springs and Guli Blaca's falls down the wall's
  south face (the plan's station text); the forest's far form is the source kit's far blobs past ~170 m (core/biome `34` impostors not
  taken); not taken: a dry-season preset, `WATER.mirrorSwitch` (no stills), `KGEODE`, the laterite face texture. The shighlands pack is filed
  again under its kit's key `shigh` (`44q-host-shigh-pack.js`): build.py's `packs` should take a key.
- [ ] **Not yet on any station**: `KGEODE`'s aura geodes in the fronts' and rilles' flow tops (owed since station 1), the far LOD's
  `card.guyedstalk`, the gallery (the kit reaches `main` first).
