# settlements/viridian: the Order of Viridian Thought's head monastery and tea and herb estate

The head monastery of Qiblai's green monastery, the Order of Viridian Thought, and its master tea and medicinal herb estate on
the Xanadu scarp at px 962,1562 (the owner, 2026-11-16). `PLAN.md` is the design and its open questions for the owner.
`SURVEY.md` is the site survey on the scale model; `survey_site.py` re-runs it. `KNOWN_ISSUES.md` lists what is owed.

The questions in `PLAN.md` section 13 are still open. Built so far (PLAN.md section 12a), taking the plan's recommended
answer where a question is open (section 12b):
- **V3**: the Order's own buildings as kit records, on a sheet beside the green monastery (`dist/viridian-sheet.html`);
- **V4, the data side**: the estate as records (terraces, hedge rows, herb beds), tested in node;
- **V6, a first pass**: the head house and its tea estate at 1:1 on the scale model's ground (`dist/viridian.html`).

## Build and verify

```
python3 tools/lfs_needs.py settlements/viridian --pull          # a fresh worktree: the texture packs
python3 tools/build.py settlements/viridian                     # both pages (or python3 build.py here)
KRATOR_GL=gpu python3 verify.py dist/viridian.html --assert --views "Overview,The head house"
KRATOR_GL=gpu python3 verify.py dist/viridian-sheet.html --assert --views "Opening,Overview"
node tests/test-vt-records.js                                   # the records headless: built, on their lots, seeds, dress
node tests/test-vt-estate.js                                    # the estate's records: terraces, hedges, beds
```

Both pages are targets on Xanadu's page, as the Qiblai kit's, the Azure Dream's and Kirstabal's are:
`settlements/xanadu/build.py --kit` takes this folder's `kit.json`, `src/` and `targets/`, with the Qiblai kit's fragments
read in place (`kit.json` "externalDirs") and its texture pack ("packFrom"). The estate's ground is the scale model's cut
round px 962,1562 (`region/data`, by `tools/scale-model/extract_region.py`; its inputs in `region/source`), decoded at every
build into `gen/39vt-world-data.js` (Pinnacle Rock's `tools/world_data.py`, read in place) and drawn through core/world's
fields (`core/world/41-world-fields.js`) on core/terrain's `KRELIEF` (`kit.json` "files", the estate's only).

## How it is made

| Fragment | What |
|---|---|
| `src/40-vt-estate.js` | `VTE`, `[G data]`: the three tea gardens as `KRELIEF.terraces` records (the Low Garden's two flanks, the High Garden), each held to its polygon and height band; the hedge rows traced along each tread as contours of the step coordinate (three rows to a tread); the herb beds of five places on three grounds, each crop from `kits/crops` (`CROPS.at`, `CROPS.pick`), rain-fed, the shade crops in the shade only. Seeds 34351-34361. The estate page draws the terraces and the hedges |
| `src/89qv-vt-works.js` | the tea works and the herb houses on the Qiblai kit's contract (`QB.def`), in the green spoke's dress (`QSPOKE[3]`; `VT_DRESS` flips white wash to green walls, PLAN.md question 6): the withering loft (3 variants), the rolling and firing hall, the sorting and packing house, the tasting room, the herb drying house, the still-room and dispensary, the curing house. Seeds 34201-34261 |
| `src/89qw-vt-estate.js` | the estate's pieces: the shade house, the log yard, the spring house, the dry garden's grange, the pluckers' shelter, the cloud hermitage (3 variants), a tea terrace sample (Low and High), the physic garden. Seeds 34271-34341 |
| `targets/estate/89z-rows.js` | the estate page: `window.CITY`, its title, `VT_SITE` (the origin the house's court at px 962,1562; the near box, the fine box, the flora's origins) |
| `targets/estate/89zva-vt-ground.js` | `[G data]`: the ground at 1:1 (`WORLD.H`), the gardens' terraces held to their ground's heights, the pads, `terrainH`, `vtPut`, the hedges' tracing, the flora's mask and fields |
| `targets/estate/89zvb-vt-site.js` | `[G data]`: the site (PLAN.md section 6 at 1:1): the bench and the head house, the buyers' court, the tea works, the herb houses, the lay lines, the physic garden, the grove, the spring house, the High Garden's shelter; the ways and the courts; the hedges traced once the pads are cut |
| `targets/estate/90va-vt-world.js` | the sky and the mist; the near ground (8 m, under the terraces) holed under the fine ground (2.5 m, every tread and riser), both wearing the Qiblai pack's sets through a zone mask and a colour canvas with every hedge row painted on it; the far ground |
| `targets/estate/90vb-vt-build.js` | the retaining faces; every place, chunk by chunk; the tea on the fine ground (one instanced mesh of clipped blocks); the Vale of Xanadu's flora |
| `targets/estate/91z-views.js` | the estate's views and budgets |
| `region/` | the scale model's cut (938-986 x 1538-1586 px, 500 m cells): `data/` from `extract_region.py`, `source/` its inputs (the regions collection with the cut's own polygon, `viridian-site`) |
| `targets/sheet/89z-rows.js` | the sheet's rows: the Order's three families at every variant, and Qiblai's green monastery (`qb_monastery` v3, with its tea touches) beside them |
| `targets/sheet/91z-views.js` | the views (`xaAutoViews`), the budgets |
| `verify.py` | Xanadu's verify plus, on the sheet, `viridian-laid` (every planned def at every variant, and the green monastery); on the estate, `estate-laid`, `bench-level`, `terraces-cut`, `tea-on-treads` |
| `tests/test-vt-records.js` | the records built headless on the Xanadu kit's bundle with the Qiblai kit (`kit_bundle.bundle(qiblai=True)`): every def at every variant on its lot within 0.3 m, every seed in 34200-34399, the green dress |
| `tests/test-vt-estate.js` | the estate's records on a stand-in ground: terraces held to their polygons and bands, every hedge on a tread, the rows where planned, deterministic, every bed rain-fed on its ground, the shade crops in the shade |

Seeds 34200-34399 are this settlement's, given by the Qiblai kit's session (2026-11-16).
