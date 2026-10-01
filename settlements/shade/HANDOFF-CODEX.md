# Handoff: the Shade building kit (for Codex)

You are adding the buildings to an existing, verified world. The ground, water,
flora, places and life data are done and checked; do not redesign them.

## Read first (in this order)

1. `CLAUDE.md` (repo root): working rules. Edit only `src/`; never open `dist/` or `three.min.js`.
2. `README.md` (repo root): tagging and modularity rules for every build.
3. `settlements/shade/README.md`, `API.md` (the contract), `KNOWN_ISSUES.md`, `DESIGN.md` (the architecture).

## The loop (run it; do not reason about whether it would pass)

```
cd settlements/shade
python3 build.py --vendor-check                        # must say "syntax OK" and "identical"
python3 verify.py dist/shade.html --assert --out /tmp/shots            # ~3-5 min under software GL
python3 verify.py dist/shade.html --views "The carved face,The market and the Khan" --out /tmp/shots
```

`verify.py` needs `pip install playwright` and a Chromium (set `PW_CHROME` if Playwright
cannot find one). It exits non-zero if the error panel is dirty or any check fails.
**Look at the screenshots** after every change that adds geometry: every bug in this
build so far was found in a screenshot or by a check, never by reading the code.

## The task

Four building families, as **standalone builders** in new fragments
`src/77-kit-nomad-*.js` (the 10..79 range is grep-checked by `build.py`: a builder there
cannot touch `PLACES`, `SWB.`, `LIFE.`, `POOL.` or `BASIN.`, and must not read
`terrainH`, `scene` or any other host global). Each returns a `THREE.Group`, base at
y = 0, front facing +z, with `userData = {kind:'building', name, culture:'eastern-nomad',
types:[...], footprint:[[x,z],...]}` (types from the README's list):

| Builder | Goes into (place id) | Notes |
|---|---|---|
| `buildPetraFacade({width,height,depth,seed})` | `petra`, `shrine` (kind `wall`) | classical columns, pediment, doorways, carved IN: its back plane is z = 0 and sits against the sheer face; rooms are recesses, not boxes stuck on |
| `buildFairyChimney({height,radius,seed})` | `switchback_gate`, `canyon_watch`, beside the switchback's hairpins | a tufa cone with a cap stone, doors and windows cut into it |
| `buildPuebloBlock({w,d,storeys,seed})` | `pueblo`, round `khan` | stepped adobe, flat roofs, projecting vigas, ladders between terraces |
| `buildHairclothTent({w,d,seed})` | `tents` | a black Bedouin tent: low ridge, guy ropes, an open side |

Plus the Khan itself (an open court with arcades) in `khan`.

Then ONE placement fragment, `src/87b-host-buildings.js` (runs before `88-host-build.js`):
- place each family inside its place's polygon only (the places are already flat, dry
  and kept free of flora; `wall` places have a `facade` line and an outward `face`);
- set each building's base to `terrainH` at its footprint's lowest corner;
- for each building: `OBSTACLES.push({x,z,r,y0,y1})` and
  `REGISTER({name,cls:'building',x,z,y,r,h,tags:{culture,types}})`;
- block each footprint in the walkable grid (`LIFE.NAV`) is NOT possible from 87b
  (the grid is built in 84): add a `NAV_BLOCK` list in 44, read it in 84, and keep
  `life: every place reachable` passing (doors must stay reachable).

## Add checks for your work (with negatives)

`91-host-probe.js` shows the pattern: each check is a function of its input, and
`shadeNegatives()` feeds it a broken one that MUST fail. Add at least:
- every building's footprint lies inside its place's polygon;
- no two buildings' footprints overlap;
- every `wall` building's back is within 0.5 m of the face (sample `terrainH` behind it);
- each family placed at least once, counted by family (`window._buildings`).

A check that passes its negative cannot fail: `verify.py` fails the run for it.

## Do not

- touch the vendored fragments (`build.py --vendor-check` must stay clean);
- move a place to fit a building without rerunning the whole `--assert`;
- loosen a check's threshold to make it pass: fix the geometry, or tell the user why not;
- commit `dist/` changes without rebuilding from `src/` first.

When done: update `KNOWN_ISSUES.md` (strike the NO BUILDINGS item, add what you
learned), `NOTES.md` (lessons), rerun `python3 tools/make_index.py`, and report the
`--assert` output and the screenshots.
