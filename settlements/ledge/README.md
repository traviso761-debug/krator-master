# Ledge

The Realm of Dalab's half-ruined Ancient arcology on the West Rift's great lake (`LORE.md` §6.1), scale model 5.1 px 437,1330: 42
slab layers cantilevered off a 1,265 m face as an inverted ziggurat, Dalab's and the Fellgangs' towns on the head (1,562 m) and at the
foot (312 m), Loj Fower's Tungangs on the middle decks round the Line's station, the great lifts in the rock between. The plan, the
owner's answers and what was assumed: `PLAN.md` (section 9 is what is built). The size: `AREAS.md`. The sheets: `floors/`. The gaps:
`KNOWN_ISSUES.md`.

| File | What |
|---|---|
| `src/30-ledge-layout.js` | THE LAYOUT ([G data]): every deck (layer x wing, its state and holder), part, lift, way, wreck heap and link by stable id. The one source: the page, the sheets and the test read it |
| `src/31-ledge-rules.js` | its rules ([G data]): `LEDGE.groundAt` (the ground the page draws), the decks' geometry, `LEDGE.area`, `LEDGE.census`, the walk graph and the strike, the Line's length, `LEDGE.checks`, seeds, `LEDGE.tags` |
| `test-ledge.js` | `node settlements/ledge/test-ledge.js`: every check with a negative (`tools/ktest.js`), the ground's marks, seeds, tags, `AREAS.md` |
| `ledge_blueprint.py`, `layout_dump.js` | the sheets (`floors/`: the site, the head, five layers, the foot, the elevation from the lake, the section through the cliff) and `AREAS.md`, on `settlements/voth/palace/blueprint.py` |
| `build.py` | `dist/ledge.html`: the Ancients kit's runtime and materials, the Dalab set and the Fellgang set (`TG`) read in place, core/rand, drawn, tags, ruins, terrain (KSTRATA, KRUBBLE), water, atmos, host FULL; the library packs in sidecars |
| `verify.py` | `KRATOR_GL=gpu python3 verify.py dist/ledge.html --assert --all-views --out shots`: the page's checks and negatives, NaN, the inspector's volumes, the universal asserts (ruins, samplers, the eye on the drawn ground), the views |
| `src/45-host-stage.js` | the renderer, the lights, the ground (`LEDGE.groundAt` meshed near and far; KSTRATA's rift beds and the library's grain) |
| `src/8l0`-`8lc` | the tags, the shell, the towns and the Ancients' halls, the wreck and the ruin watches: calls to `kits/ancients/cliff` (`KCLIFF`, lifted from here on 2026-11-22 for Shelf) |
| `src/89z`, `89zw` | the shared sky at Ledge's place and the great lake on core/water |
| `src/99-host-take.js` | the views and the checks handed to `KHOST.take` |

```
python3 tools/build.py settlements/ledge          # dist/ledge.html
node settlements/ledge/test-ledge.js               # the layout's rules
python3 settlements/ledge/ledge_blueprint.py       # floors/*.png and AREAS.md
KRATOR_GL=gpu python3 verify.py dist/ledge.html --assert --all-views --out shots   # from settlements/ledge
```

A fresh worktree holds Git LFS pointers: `python3 tools/lfs_needs.py settlements/ledge --pull` before a build (the Ancients', Dalab's,
the Tungang kit's and Ledge's own `tex/`, and the four library sets in `materials.json`).
