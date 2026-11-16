# settlements/viridian: the Order of Viridian Thought's head monastery and tea and herb estate

The head monastery of Qiblai's green monastery, the Order of Viridian Thought, and its master tea and medicinal herb estate on
the Xanadu scarp at px 962,1562 (the owner, 2026-11-16). `PLAN.md` is the design and its open questions for the owner.
`SURVEY.md` is the site survey on the scale model; `survey_site.py` re-runs it. `KNOWN_ISSUES.md` lists what is owed.

The questions in `PLAN.md` section 13 are still open. The steps built so far are the ones those questions do not block
(PLAN.md section 12):
- **V3**: the Order's own buildings as kit records, on a sheet beside the green monastery;
- **V4, the data side**: the estate as records (terraces, hedge rows, herb beds), tested in node.

## Build and verify

```
python3 tools/lfs_needs.py settlements/viridian --pull          # a fresh worktree: the texture packs
python3 tools/build.py settlements/viridian                     # dist/viridian-sheet.html (or python3 build.py here)
KRATOR_GL=gpu python3 verify.py dist/viridian-sheet.html --assert --views "Opening,Overview"
node tests/test-vt-records.js                                   # the records headless: built, on their lots, seeds, dress
node tests/test-vt-estate.js                                    # the estate's records: terraces, hedges, beds
```

The sheet is a target on Xanadu's page, as the Qiblai kit's and the Azure Dream's are: `settlements/xanadu/build.py --kit`
takes this folder's `kit.json`, `src/` and `targets/`, with the Qiblai kit's fragments read in place (`kit.json`
"externalDirs") and its texture pack ("packFrom").

## How it is made

| Fragment | What |
|---|---|
| `src/40-vt-estate.js` | `VTE`, `[G data]`: the three tea gardens as `KRELIEF.terraces` records (the Low Garden's two flanks, the High Garden), each held to its polygon and height band; the hedge rows traced along each tread as contours of the step coordinate (three rows to a tread); the herb beds of five places on three grounds, each crop from `kits/crops` (`CROPS.at`, `CROPS.pick`), rain-fed, the shade crops in the shade only. Seeds 34351-34361. Not drawn yet: the page (V6) draws it |
| `src/89qv-vt-works.js` | the tea works and the herb houses on the Qiblai kit's contract (`QB.def`), in the green spoke's dress (`QSPOKE[3]`; `VT_DRESS` flips white wash to green walls, PLAN.md question 6): the withering loft (3 variants), the rolling and firing hall, the sorting and packing house, the tasting room, the herb drying house, the still-room and dispensary, the curing house. Seeds 34201-34261 |
| `src/89qw-vt-estate.js` | the estate's pieces: the shade house, the log yard, the spring house, the dry garden's grange, the pluckers' shelter, the cloud hermitage (3 variants), a tea terrace sample (Low and High), the physic garden. Seeds 34271-34341 |
| `targets/sheet/89z-rows.js` | the sheet's rows: the Order's three families at every variant, and Qiblai's green monastery (`qb_monastery` v3, with its tea touches) beside them |
| `targets/sheet/91z-views.js` | the views (`xaAutoViews`), the budgets |
| `verify.py` | Xanadu's verify plus `viridian-laid` (every planned def on the sheet at every variant, and the green monastery) |
| `tests/test-vt-records.js` | the records built headless on the Xanadu kit's bundle with the Qiblai kit (`kit_bundle.bundle(qiblai=True)`): every def at every variant on its lot within 0.3 m, every seed in 34200-34399, the green dress |
| `tests/test-vt-estate.js` | the estate's records on a stand-in ground: terraces held to their polygons and bands, every hedge on a tread, the rows where planned, deterministic, every bed rain-fed on its ground, the shade crops in the shade |

Seeds 34200-34399 are this settlement's, given by the Qiblai kit's session (2026-11-16).
