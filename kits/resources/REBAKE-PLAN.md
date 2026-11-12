# The geology rebake on scale model 5.1 (plan, 2026-11-03)

**Status (2026-11-03): done, R0-R6.** The owner took all five recommendations. One deviation, c: the database was pulled and diffed against the defaults first, as asked. It is still on the 4.23 canvas: every region and settlement equals the defaults moved by the legacy shift, except 3 regions and 2 settlements that 5.1 edited (NW outer wall, e badlands, the Loom Chasms; Farport, Flooded Tower). It lacks 5.1's 19 regions and 5 settlements. So the bake reads the defaults, which are the database plus 5.1. R2's and R3's measurements are in `GEOLOGY.md`. The isle demo's economy did not move (its five tests give the same stocks, routes, nav graph and plan; only the timings differ), and the hamlet test passes unchanged.

`data/geology.json` is still the **4.23 bake on the old canvas** (1549x1393, 4 km cells, world metres from the old
top-left). The model is 5.1 on 1821x1723. The carbonate and the other rocks were added to the old bake without moving any
node (`GEOLOGY.md`; `ROCK-PROPOSAL.md`). This rebake moves the bake onto 5.1 and moves the ores onto the new rocks.

## 1. What it reaches (checked 2026-11-03)

Fewer readers than `ROCK-PROPOSAL.md` first said: **the isle demo and `core/simulation` do not read the field yet.** The
hookup (`KHAMLET.village` taking `KRES.near`, the isle demo passing `RES_LEDGER.tradeGoods` to `SIM.trade`) was
requested but never made (`kits/resources/KNOWN_ISSUES.md`), so their stocks proof and `test-sim.js` are unaffected.

| Reader | What it takes | What the rebake changes there |
|---|---|---|
| `kits/resources` page | `geology.json` embedded (`45q-res-geodata.js`), `ledger.json` | rebuild, verify, the baseline entry |
| `kits/resources/tests/test-res.js` | fixed tiles in old px (`T0` 1100-1160 x 660-720, cells 360-380 x 270-290, the carbonate and rock checks) | move the tiles to 5.1 px (+272, +330), or to the frame chosen in 2a |
| `data/ledger.json` | written by `test-res.js --ledger` from the field and the polities | rewritten; every polity's catchment changes; the fairness audit (21 findings) is re-read |
| `kits/resources/godot/golden-field.json`, `kres_field.gd`, the Godot test copy (`godot/tests/resources/`) | written by `--ledger`; the GDScript twin | rewritten and re-synced (`godot/tools/sync_core.py`); the Godot test re-run on 4.7.2 |
| `core/hamlet/test-hamlet.js` | a mine test on the fixed tile 1100-1160 x 660-720 (old px) | move the tile; `KHAMLET.village` itself takes coordinates from its caller, so no code change |
| `biomes/gills/PLAN.md` | plans to read `RES_GEO` owner nodes | nothing yet |
| Docs: `GEOLOGY.md`, `API.md`, `README.md`, `ROCK-PROPOSAL.md`, `biomes/KARST-SITES-5.1.md` | the old canvas's numbers and frame | rewritten |

## 2. Decisions for the owner

| | Question | Recommended | Why |
|---|---|---|---|
| a | **The frame**: world metres from 5.1's top-left (`x = 5.1 px x 2000`), or kept on the old origin | **5.1's origin, with the field's lattice anchored to the old one** (section 3, R1) | every other tool (the stations map, `extract_region.py`, the open world) is on 5.1 px now; the anchor keeps every node whose rock did not change exactly where it is |
| b | **The cell**: 5.1's native 2 km, or the old 4 km | **4 km** (the 5.1 grid halved: 911 x 862) | the trial bake at 2 km wrote **14.6 MB** (now 3.2 MB): the Resources page would be ~15.4 MB of its 16 MB cap. And the bake's windows are counted in cells, so at 2 km every one halves (below) |
| c | **Regions and settlements**: the artifact's database (what 4.23 used) or the model's defaults (`51-region-store.js`: 118 regions; `60-settlements.js`: 119 settlements) | **the database**, pulled with ArtifactData, diffed against the defaults first | the database is where the owner edits; the defaults are a snapshot. If they agree, use either |
| d | **The ores onto the new rocks** in the same change | **yes** | one disruption, not two; the list is in R3 |
| e | **New node kinds**: nickel (Sudbury), marble, pozzolana (tuff), skarn tungsten | **nickel and marble now**; pozzolana and tungsten later | nickel and marble are what the lore already wants (the walls' ring; the brick cities' trim). Each kind needs a `RES_ORE` row (`42r-res-ore.js`: grade, works, look) and a node model |

## 3. Steps

**R0. Fix the bake for 5.1** (the trial bake on 2026-11-03 found these; `tools/scale-model/geology.py`):
- `load_page` reads a saved page only, and its version pattern is `scale model 4.x`. Make it take the model's data
  folder too (`smodel.page.load`, as the trial did) and read 5.x.
- 4 of 885 rivers have no `to` (`r_sg_vapora_bigga`, `r_mb_siphon_breach`, `r_hr_verdigris`, `r_hr_jokulhlaup`): take
  `to: {}` (a river that ends). 14 have no `width_m` (the bake already defaults it to 60).
- 10 river ids are integers (the N and W expansion's `9101`...), the rest strings: the tributary order sorts by id and
  fails. Sort by `str(id)` (the ids stay as the model has them).
- **Windows in km, not cells.** `relief` (5x5 cells, ~20 km), `volc_share` (51 cells, ~100 km), the oil's smoothing
  (11 cells, ~44 km), the basin margin's dilation (3 cells), `MELT_CELLS`, `GRANITE_BLOCK` and the rings' radii are
  counted in cells. On a 2 km grid each halves (the trial: **the stone byte moved by over 20 on 69% of the land**, from
  that alone). Write each as km over `CELL_KM`, which also makes decision b reversible.
- A `--cell` option (default 4 km): sample the model's grid at every second pixel, as the 4.23 page's half-resolution
  grid was.

**R1. The frame and the lattice anchor** (`45r-res-field.js`, `kres_field.gd`, the bake's `lode_nodes`):
- `grid.fullW/fullH` become 1821x1723, and world metres run from 5.1's origin.
- Add `field.anchor: [544000, 660000]` (the legacy shift in metres). A candidate's cell is `floor((x - anchor) / cell)`,
  so the same place gets the same cell index, hash and id as on the old frame. **A node only moves where its family's
  byte changed** (its keep rule `hash < p`), not because the frame did. The GDScript twin takes the same field, and
  `golden-field.json` tests it.
- Readers that pass an `origin` (an open-world region's centre pixel, `GEOLOGY.md` "A world that places nodes") pass
  5.1 px from now on.

**R2. Bake 5.1 with today's rules, and measure.** Before any ore moves, so the diff is the map's change alone. The trial
(2 km, cell-count windows, the defaults' regions) gave, over the old area: 79.7% of land cells keep their province; the
ore bytes changed by over 20 on 14-17% of the land (iron 16.7, copper 14.2, gold 14.1, tin 13.7), saltpeter 19.8, wood
12.7, water 18.5; 5,040 cells flipped between land and water; gold placers 915 to 763, tin 1,012 to 901 (5.1's rivers).
Expect smaller ore numbers once the windows are in km. Record the real numbers in `GEOLOGY.md`.

**R3. The ores onto the new rocks** (`geology.py` `f[...]`, from the new provinces and layers):

| Ore | Today | After |
|---|---|---|
| copper | volcanic 210, rift 120, crystalline 50, sedimentary 10 | + **native copper on basalt** (Keweenaw: ~120 on the basalt province), + skarn copper (the `skarn` layer x .6) |
| tin | crystalline 180, rift 50, volcanic 20 | **granite 200**, gneiss (crystalline) 60, impact 40 (granite only, as Earth's tin) |
| iron | crystalline 160, margins 140, ... | + skarn iron (the `skarn` layer x .7), impact 120 (the walls' breccia) |
| gold | volcanic 140, crystalline 110, rift 90 | + impact 90 (the Witwatersrand's gold survived inside the Vredefort impact structure) |
| rare-earth | rift 190, crystalline 140 | granite 160, gneiss 100 (unchanged on the rift's carbonatites) |
| nickel (new) | none | the `nickel` layer as its byte (220 at the melt sheet's margin) |
| marble (new) | none | the `marble` layer |
| stone | relief and hard rock | + basalt, granite, quartzite and impact as hard rock (columnar basalt and granite: the best building stone) |

The new kinds take `FIELD` cells: nickel 5,000 m (rare), marble 3,000 m.

**R4. Regenerate:** `node kits/resources/tests/test-res.js --ledger` (rewrites `ledger.json` and `godot/golden-field.json`,
then checks both). Move the fixed tiles in `test-res.js` and `core/hamlet/test-hamlet.js` onto the new frame. Run
`godot/tools/sync_core.py`, then the Godot field test on 4.7.2 (`--import` once). Read the fairness audit's new findings:
settlements on the walls' nickel ring (Voth, Spirladunon, Torus, Pylon) gain a mine, and towns that lost a basic in
the move show up there.

**R5. Rebuild and prove:** `python3 tools/build.py kits/resources`, `verify.py dist/resources.html --assert` (one GPU job:
the lock and its heartbeat), `tools/port_baseline.py --update kits/resources/dist/resources.html`,
`python3 tools/test_all.py --no-build`.

**R6. Docs:** `GEOLOGY.md` (format: the new grid, the anchor, the windows in km, the rebake command on 5.1), `API.md`,
`README.md`, `ROCK-PROPOSAL.md` (the ores moved), `KNOWN_ISSUES.md` (the audit), and `biomes/KARST-SITES-5.1.md` (its
coordinates note).

## 4. Risks

- **The field's density.** A 4 km cell on the bigger canvas is ~785,000 cells (now 539,000). Node counts grow by the
  new land (the N and W expansion, the SE regions): the gold lodes went 105,271 to 116,159 and tin 209,664 to 236,832
  in the trial, as expected.
- **The anchor is a new field in the format.** A reader that ignores it places nodes on the new origin's lattice: every
  node re-rolls. The JS, the GDScript twin and the bake must take it in one change, and `golden-field.json` proves they agree.
- **The isle demo and the hamlets' economy hookup** is still owed. Doing it after the rebake means its baseline is set
  once, on the new field. Doing it before means setting it twice.
- **The page cap.** At 2 km the page would be ~15.4 MB of 16 MB, which is why 4 km is recommended. At 4 km it stays near 5 MB.

## 5. Size of the work

R0 to R2 are one session (the bake's code and a measured bake). R3 and R4 are one session (the ore rules, two new
kinds, the ledger and the Godot twin). R5 and R6 ride with them. It touches only `tools/scale-model/geology.py`,
`kits/resources/`, the two Godot copies and the hamlet test. No biome or settlement page changes, because none reads
the field at build time.
