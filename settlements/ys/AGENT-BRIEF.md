# Ys kit: brief for building agents (phase 2)

You are adding buildings to the **Hykkousoi kit** (`settlements/ys/`), a procedural Three.js set that builds into
one HTML page. Read this, then `API.md`, then DESIGN.md §4 (the vocabulary) and §7 (the interior rule). Look at
`refs/` (`refs/index.txt` says what each sheet holds) and at the mock: `python3 build.py && python3 verify.py
dist/mock.html --views "Mock — middle house,Mock — rich house,Mock — the L1 pod and its landing" --out /tmp/shots`.
Work only in the files your task names.

## 1. What a Hykkousoi building is

Grown, not assembled. Shell forms (conch, nautilus, barnacle colonies, urchin spires, scallop fans), porous skins
(round and oval openings with raised lips and dark reveals), bone-ribs, nacre on the rich and civic, lens domes on
the poor and middle, and accretion: a grown-on building roots into its host with a flared skirt and drips. Palette:
white, cream and ivory shell; sea-teal in glass and the nacre's shadow; coral and sea-green at rich; grey at poor.
**No box primitive anywhere in a Hykkousoi builder.** No plant is part of a building: leave planting spots.

The quality bar: recognisably its type at a glance, a silhouette distinct from its neighbours, depth in the shell
(lips proud of the surface, reveals through it, fillets where shells meet), nothing floating, nothing sunk, doors
2.1–2.4 m, stairs reaching their landings. Judge it at eye level, and judge the inside with the roof off.

## 2. How the code works

- `python3 build.py` concatenates `src/*` then `targets/<t>/*` in filename order into one `<script>`. Every
  top-level name is a global; prefix yours. `reseed(N+(o.v|0))` is the first statement of every builder.
- Register with `HYK.def({key,name,family,row,w,d,h,r,tags:{type:[...],wealth,lit},views?,build})`. `row` is one of
  `'Housing — poor' 'Housing — middle' 'Housing — rich' 'Grown-on housing' 'Shops' 'Grown-on shops' 'Hospitality'
  'Sacred' 'Markets' 'Civic' 'Harbour' 'Industry' 'Military' 'Agriculture' 'Spans'`; the sheet lays the rows out
  and makes `'<name> — front'`, `'<name> — eye level'` and `'<name> inside'` presets for you.
- Local frame: origin at the plot centre on the ground, **+z the front**, y up, metres. Never world coordinates.
- A **grown-on (G) builder** takes a host: `build(G,o)` with `o.host = {x,z,rAt(y),n}` resolved by the placer, and
  roots itself with `hykFlare`; `hykAccrete` in 64 is the pattern.
- The helpers are in `API.md`. Every opening through `hykDoor`/`hykWin`, every lamp through `hykLight`, every
  room through `hykRoom` + `hykSpot`, every inspector volume through `hykReg`.

## 3. Files, prefixes, seeds

| task | fragment(s) | prefix | seeds |
|---|---|---|---|
| A housing | `src/70-hyk-housing.js` | `hykHouse…` | 30300–30399 |
| B shops | `src/71-hyk-shops.js` | `hykShop…` | 30400–30499 |
| C hospitality, sacred, markets | `src/72-hyk-hospitality.js`, `73-hyk-sacred.js`, `79-hyk-markets.js` | `hykHosp… hykShrine… hykMarket…` | 30500–30599, 30950–30999 |
| D Amphitriton, Citadel | `src/74a-hyk-amphitriton.js`, `74b-hyk-citadel.js` | `hykAmph… hykCit…` | 30600–30649 |
| E Tides, Winds, Pharos | `src/74c-hyk-tides.js`, `74d-hyk-winds.js`, `74e-hyk-pharos.js` | `hykTide… hykWind… hykPharos…` | 30650–30699 |
| F spans, harbour, industry | `src/65-hyk-spans.js`, `75-hyk-harbour.js`, `76-hyk-industry.js` | `hykSpan… hykHarb… hykInd…` | 30200–30299, 30700–30799 |
| G military, agriculture | `src/77-hyk-military.js`, `78-hyk-agri.js` | `hykMil… hykAgri…` | 30800–30899 |
| H library, treasury, prison | `src/74f-hyk-civic-minor.js` | `hykLib… hykTreas… hykCell…` | 30900–30949 |
| I furniture | `src/66-hyk-furniture.js` | `hykFurn…` | 30250–30299 |

## 4. Build and verify (you can run all of it)

```
cd settlements/ys
python3 build.py                       # must print "syntax OK" for every target
python3 verify.py dist/kit.html --assert --views "<Name> — front,<Name> — eye level,<Name> inside" --out /tmp/ys-<you>
python3 verify.py dist/kit.html --cam=x,y,z,tx,ty,tz --cam-name close --out /tmp/ys-<you>
```
Software rendering is slow and other agents render at the same time: 2–6 views a run, `timeout 900`. If a run
dies with a null shader-info-log TypeError, re-run once. **Look at your screenshots** at the front, at eye level
and inside, and fix what you see. `--assert` must pass: a clean panel, the tag audit, every building a door,
every residence its spots, every spot inside its room. Write shots to `/tmp`, never into the repo.

## 5. When you finish

Commit only your fragment files to your worktree branch (no `dist/`, manifests, `VENDOR.json`, shots). Report:
the files, every key (key · name · w×d×h · triangles · rooms and spots), what you looked at, what is still
weak, and any shared-helper bug you worked around (do not edit `60–64`; report instead).
