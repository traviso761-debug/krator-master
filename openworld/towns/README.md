# openworld/towns: settlements' own ground for the open world

Each folder is one settlement page's ground, baked by `python3 core/world/bake_towns.py <town>` from the page's own code
(run read only in node; the page's files are not changed). A region that holds the town puts
`bake_towns.record(<town>, region_meta)` in its `WORLD_DATA.towns` and lists `core/world/41t-world-town-water.js` after
`41`, so the world takes the town's ground, water, river and shore at 1:1 (`core/world/README.md`, "A town's own ground";
`openworld/PLAN-VOTH.md` section 3, Layer 2).

| File | What |
|---|---|
| `ground.png` | the ground every `step` m over the page's square, 16-bit grey: h = h0 + (v - 32768) * s (`town.json` grid) |
| `water.png` | one byte a cell: 1 the page's water polygon, 2 the river's channel, 4 edited ground under the level joined to them, 3 a hollow apart, 0 land |
| `town.json` | the frame, footprint R and band, the level, the river (mouth first, a half-width a point) and the model river it joins, the shore trace and the points left out of the shore check, stats, source hashes |

**Voth** (`voth/`, 2026-11-11; R from 4.8 to 5.3 km on 2026-11-12): the frame ±5.4 km at 10 m, R 5.3 km (the lake's north
shore reaches 4.9 km from the pin), band 1.5 km, the river joining the Turm (r029, 'Turm Rivrh', which edit_513
re-routes into the bay). Its baked shore lies within 6.1 m of the page's trace (2.2 m on average, 700 points); the site's
edits move the shore at 108 trace points (the quays raised, the bay's south edge lowered) and the river's vale at 42,
which the check leaves out. Rebake after a change to `settlements/voth/src/10-core.js`, `15-shore.js`, the site
model's TERR or `site/voth-site.json` (`bake_towns.py voth --check` says when).

**The lake towns** (`mouth/`, 2026-11-23; `settlements/xanadu-lake`, step L0): their entries in `bake_towns.py` are generated
from each town's spec and its fit (`settlements/xanadu-lake/targets/town/89zl-xl-specs.js`, `89zm-xl-fit.js`: `lake_towns()`),
the page's `xlH(key, x, z)` sampled through its frame with `args: [key]`. **Māuṭh** (`mouth/`): the frame ±2.1 km at 10 m,
R 1.4 km, band 600 m, its stream the page's own (joined to no model river: the model has none there). The page's ground is
fitted to the region's (`tools/fit_lake_town.py mouth`), so at the footprint's edge and the band it is the region's (within
6 m: `settlements/xanadu-lake/tests/test-xl-site.js`). Rebake after a change to the town's spec, fit or `89zp-xl-site.js`
(`bake_towns.py mouth --check` says when). **Ōlḍ-Thalaba** (`old-thalaba/`) and **Ḍāiyar** (`dyer/`), step L1: the same frame,
R and band, no stream (no river in their records). **Qōqō** (`cocoa/`), **Nēṭ** (`net/`), **Malbari** (`mulberry/`), **Hāibh**
(`hive/`), step L2: the same, no stream.
