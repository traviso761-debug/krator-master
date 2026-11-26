# Span

The ruined Ancient arcology in Pan Riba's canyon on the SW highlands' tableland, and Dalab's fort and trading post in it
(`LORE.md` §6.1). The plan, the owner's answers and the order of work: `PLAN.md`. The sheets: `floors/` (`span_blueprint.py`),
the size: `AREAS.md`, the gaps: `KNOWN_ISSUES.md`.

| File | What |
|---|---|
| `src/30-span-layout.js` | THE LAYOUT ([G data]): every part, way, link and cut by stable id in the canyon's frame. The one source: the page, the sheets and the test read it |
| `src/31-span-rules.js` | its rules ([G data]): `SPAN.checks`, the walk graph, the area, decay seeds, the frame, core/tags records, and `SPAN.groundAt` (the ground the layout needs: what the SW highlands station carves) |
| `test-span.js` | `node settlements/span/test-span.js`: every rule, each with a negative; seeds, frame, tags, `AREAS.md` |
| `span_blueprint.py`, `layout_dump.js` | the floorplan sheets and `AREAS.md` from the layout (on `settlements/voth/palace/blueprint.py`) |
| `build.py` | `dist/span.html`: the Ancients kit's runtime and Span's pieces (`kits/ancients/targets/span`) read in place, core/rand, space, tags, atmos (the shared sky), host FULL; the kit's texture pack beside it (`dist/span.tex.ancients.js`) |
| `verify.py` | `python3 verify.py dist/span.html --assert --all-views --out shots`: the page's checks and negatives, NaN, the inspector's volumes, the views |
| `src/45-host-stage.js` | the renderer, the lights, the stand-in ground (`SPAN.groundAt` meshed) |
| `src/8at-host-place.js` | every part drawn at its place and state by the builder its kind names |

```
python3 build.py                      # dist/span.html
node test-span.js                     # the layout's rules
python3 verify.py dist/span.html --assert --all-views --out shots
python3 span_blueprint.py             # floors/*.png and AREAS.md
```

A fresh worktree holds Git LFS pointers for `kits/ancients/tex/`: `git lfs pull --include="kits/ancients/tex/*"` before a build,
or every white panel renders black with a clean error panel.
