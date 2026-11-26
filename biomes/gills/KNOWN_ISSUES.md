# biomes/gills: known issues

## Open

- [ ] **A host that lengthens a pipe outruns the keep-clear.** `GILLS.life` spaces pipes on their own records (`KSPACE`), but the godthrone
      station stretches the Red form to 1.7 times its length afterwards, so its FALLEN pipes can still lie through a neighbour (standing ones
      shrink there, so they are safe; the catch station passes `gap: 3` to cover its 15 per cent). The clean fix is to move the two countries'
      form sizing into the kit (an `o.size` hook on `life`) so the keep-clear measures what is drawn; until then it is no worse than before,
      when there was no keep-clear at all.
- [ ] **How many History Monks?** `PLAN.md` section 9 keeps "a hermitage of two or three" in the White pipe field; the Catch bowl region's
      site record (`openworld/catch-bowl`, another session's branch) says **fifteen**. `GILLS.sites` publishes `cells: 2` and takes `monks` from
      its host (3 by the plan's default), so the two do not have to agree in code - but the owner should say which is canon.
- [ ] **No flame in core.** `PLAN.md` section 6 asks for the candles as "a flame mesh on core/atmos's fire chunk". There is no fire or flame
      chunk in `core/atmos` (its smoke kinds are chimney, steam and spray), and `core/biome/38-core-fire.js` is the burn-mosaic spread model
      (`[G data]`, no mesh), which section 13 rightly does not take. So the candle flame is the station's own additive mesh
      (`biomes/catch/stations/gills-candles/87-host-gills.js`), three crossed tongues on one shared uniform, dimmed by the hour. A steady-flame
      chunk in `core/atmos` is a fifth core proposal for the owner; until then every host that draws candles copies this mesh.
- [ ] **The candles flicker together.** One shared material's opacity carries the flicker, so every flame on the page pulses in step. Per-flame
      phase wants a vertex attribute (a `BIO.animMat` mode, or an instanced attribute), which is cheap but unwritten.
- [ ] **The drawing is in three hosts' copies now** (xanadu, godthrone, catch): lifting it into `biomes/gills` as one host fragment all three
      read is still owed, and is now worth more than it was at two.
- [ ] **`tests/test-gills.js` uses a local `ok`**, which `CLAUDE.md` forbids ("never a local `ok`") and `tools/ktest.js` refuses to start beside.
      The new `tests/test-gills-candles.js` is on `ktest`; migrating the older file is a small, separate job.
- [ ] **Not seen on the GPU.** The xanadu `--station gills` page was built and loaded on SwiftShader only (2026-11-03); its look (the laminae,
      the breath's motion, the steam, the lamps) has had no shot judged. The impostor programs fail to link under SwiftShader (known).
- [ ] **The gills' depth is compressed** to 38-86 m (a heightfield carve); the plan's 100-400 m slots wait for `KCAVERN` (NOTES.md).
- [ ] **Five texture sets owed** (NOTES.md, "Owed"); the collars, fringes and dew mat are flat colours meanwhile.
- [ ] **The host's floor clusters on the flank**: on xanadu's gills station 1,018 of 35,667 feet of the Vale's floor plants (scattered round a
      masked centre by the kit's own planters) stand up to 4.7 m off the drawn ground; recorded as `LAND.feetOwed` there, the kit's to fix.
- [ ] `form: 'radial'` (the Red Gills' swarm) is recorded but laid out as ring arcs: written with the godthrone stations.
