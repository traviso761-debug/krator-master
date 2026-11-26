# The scale-model edits `openworld/catch-bowl` is waiting on (queued 2026-11-24)

For the scale-model session. Each is the owner's decision of 2026-11-24 unless noted; `openworld/catch-bowl/PLAN.md`
section 11 is the same list with its sources, and section 12 has each answer in the owner's words. **None is applied
here**: this file is the queue, and `tools/scale-model/README.md` is how the model takes a record edit.

The region's `SITES.json` row and `BUDGETS.json` are written, and `python3 tools/scale-model/cut_site.py catch-bowl
--dry` accepts all sixteen sites and all six polygons. So **the cut is blocked on edits 1, 2 and 4 only** — 3, 5, 6 and
7 can ride later, and 5's two pins are carried as `"model": false` rows meanwhile.

> ## Read this before applying any of them: a new model is being made (2026-11-25)
>
> The owner: *"i am having gemini make a new model."* **Every edit below is written against scale model 5.1** — its
> pins, its ids, its heights, its 1821 x 1723 canvas and its `legacy_shift`. A new model may move a pin, reissue an id,
> or already have done what an edit here asks for.
>
> So, when the new model lands: **re-check this queue against it before applying anything**, edit by edit. Each one
> says what it is *for*, so the intent survives even where the numbers do not. Specifically — 1 may already be absent;
> 2's corrected px (1027,1258) is a thalweg reading that must be re-measured; 4's x 1056 line is where *5.1's* data
> breaks; 5's two pins may have landed; 6's and 7's are renames and types, which carry over as they are.
>
> The measurements themselves are re-runnable rather than re-derivable by hand: `openworld/catch-bowl/tools/survey.py`
> (nine sections: pins, polygons, floor, basins, routes, walls, seow, union, drift) and `tools/bridge_sites.py` both
> read whatever the model's `data/` holds, so they give the new figures in one run each. `PLAN.md` section 13 is the
> full account of what the new model touches.

| # | Edit | Why | Blocks the cut? |
|---|---|---|---|
| **1** | **Drop `sthetwins01`** ("The Twins", a fort at 1042,1525, polity "Twins Pass Wardenry") | Gemini's pin, dropped by the owner 2026-11-16 and confirmed 2026-11-24. It was dropped as `gem_twins_pass` in `SETT_DROPPED['5.1e14']` and re-added under the new id in the same batch | **yes**: the twins polygon is cut here, so the cut would place it |
| **2** | **Move `sbabalhawa01`** (Bab al-Hawa, the Godsgate) from **1028,1246** to about **1027,1258**, and record its height as **+3,590 m** | It is KEPT (the owner, 2026-11-24: "Agree keep both"), but the pin stands 1,205 m up the corridor's east wall while its own plan (`biomes/seouterwall/PLAN.md` 3.3) puts the sunken caravanserai apron on the pass floor. The Godsgate's thalweg at row 1258 is at px 1027 | **yes**: it is a site of the cut, and its square would take the wrong ground |
| **3** | **Keep `sz85a8i5js`** (Ranger HQ) and set its people to **500** | The owner, 2026-11-24. It was never put to them before; same provenance as 1 | no |
| **4** | **Apply `biomes/seouterwall/PLAN.md` step 6.1 to the Godsgate's frame (x 997-1056) and a ~25 km disc at each of the five tarns** (1016,1236 / 1064,1272 / 1134,1218 / 1208,1254 / 1288,1184), leaving all other ground as it is | The owner, 2026-11-24, answer A3: *"leave only east se outer wall high and airless."* Step 6.1 never landed, although 6.2 (the Godsgate) and 6.3 (the tarns) landed to the metre: the province reads 7,962 m median and 83 % over 6,500 m against its plan's 4,850 m and zero. The line is at x 1056 because that is where the data breaks (the median jumps 6,003 -> 7,281 m and the share over 8 km from 1 % to 33 %) | **yes**: it reshapes 153,000 km² the cut takes, so a cut made before it would have to be redone |
| **5** | **Land the two salt-works pins**: Salt al-Ban (`svhmyhf33w`, 1080,1428) and Solta (`s0zgu7u6yb`, 1169,1150) | Held in batch 5.1e10; `core/region/data/catch-tune.js` already declares Salt al-Ban | no: both are carried as `"model": false` rows with their own px |
| **6** | **Rename `sq11desertw7`** from "Izani-Dasri village (to be named)" to **Esper** | The owner, 2026-11-24 | no |
| **7** | **Type `scyeauyek7` (Parabola) as the Bowl arcology**, add the ruined **Parabola-Stair bore** to the network layer (proposed id `rift.bowl.parabola-stair`), and drop every trace of an Arcbeam-Stair one | The owner, 2026-11-24: *"parabola is the arcology now. There is no tunnel ti arcbeam but there is a highway"*, and *"there can be a (ruined) tunnel from stair to parabola, but not to arcbeam."* The docs are already renamed (below) | no |

## WITHDRAWN from this queue: Arcbeam's gorge (2026-11-25)

**This region no longer owes the model a gorge.** The owner moved Arcbeam out: *"sound great i agree"* to px
**1120,190**, in the arachnoid canyons 10 km off the Shell-Silkhead-Ria lifeline, 2,000 km from the Bowl. That site
already carries 332 m of trench at Arcbeam's own 4 km span with its rims level to 1-9 m on all four axes, so it needs
no carve of the kind this entry was queueing — only about 70 m of deepening, or a drop of Arcbeam's rims from 400 m to
330 m, and a 10 km bend in the road. `PLAN-SITES.md` section 7c (SETTLED) has the survey and the decision; the details
are deferred to a later session, and they belong to whichever region holds px 1120,190, not to this one.

**px 1016,1058 keeps its settlement**, as *"an arcology TBD of about 10k + hinterlands"* (the owner, same message). The
only thing the model owes it is a **name**, and the new model is expected to give one. Until then `SITES.json` reads
"An arcology TBD (the north road)" on Arcbeam's old id and `BOWL_TUNE` marks it `tbd:true`, with its 10,000 + 6,000, its
market and its place on the north road unchanged — those belong to the place, not to the name.

## What this session already did, so the queue need not

- **`openworld/SITES.json`**: the `catch-bowl` region row (six polygons, sixteen sites, `origin_px` [1233,1306]) and
  sixteen site rows, with `reach_km_by` where a site is cut by two regions (Bitta, Lasso, Ranger HQ).
- **`openworld/catch-bowl/BUDGETS.json`**: the page cap raised past 16 MB with the owner's sentence as its `why`.
- **The canon rename** (the owner's answer N), as a rename rather than a demolition now that the Parabola bore stands:
  `LORE.md` §4 (the Catch's bore, and Hub 01's three tiers of knowledge), `biomes/catch/PLAN.md` section 6,
  `biomes/seouterwall/PLAN.md` section 3.3 (a note at its head), `openworld/ANCIENT-NETWORK.md` section 8.8 (its drop
  narrowed) and `openworld/ANCIENT-ROADS.md`.
- **`biomes/catch`'s stale records** (the owner's answer F): `CATCH.OASES` moved onto the 5.1 pins, every oasis marked
  lived-in with its people and its keeper, Stair's 750 in place of "a couple of hundred". The four station pages are
  rebuilt and the hash baseline updated.

## Still owed, and not a map edit

- **The two Catch stations' re-siting** (`PLAN-TERRAIN.md` P2). Station 1 (the sand sea) and station 4 (the north fan)
  carry the 4.21 canvas's pixels, which now land on 4.9 km and 7.0 km of mountainside. Their **ground is synthetic**, so
  nothing is wrong with the pages themselves — but `STAGE.site` and `STAGE.ridges` were surveyed at those pixels, so the
  sky's walls are drawn at the wrong distances. Measured candidates for the new sites: **station 1 at px 1055,1386**
  (448 m, a 6 m/km slope, 86 m of relief in 12 km, 16 mm of rain — the floor's heart between Arfwai and the terminal
  lake) and **station 4 at px 1056,1366** (about 1,400 m, Kolli in the frame, the wall 3,530 m close on the north).
  Re-siting means re-surveying each station's ridge distances on every bearing and rebuilding both pages.
- **A GPU `--assert` verify** of the four rebuilt Catch pages. **All four verify headless on SwiftShader** (2026-11-24;
  no lane was reachable from that container): `catch.html`, `catch-oasis.html`, `catch-lake.html` and `catch-fan.html`
  each came back **13 PASS, 0 FAIL, verdict OK, exit 0**. So do not spend time re-running them headless; what is owed is
  a **lane run**, which you may as well take with your own rebuilds:
  `python3 tools/harness.py lock --lane auto -- python3 verify.py <page> --assert --all-views`, with `KRATOR_GL=gpu`.
- **Region 2's recut** without the 1,424 px of the `twins` polygon its site squares hold, and its
  `src/48k-world-tubes.js` retired to a pointer once the spec has moved here (`PLAN.md` section 3).
- **Two biome kits**, in a session of their own since 2026-11-24: `biomes/stalker-gate` (new) and `biomes/gills`
  finished (`PLAN.md` answer O).
