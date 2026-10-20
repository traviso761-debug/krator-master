# kits/eternian: API

Units, frames, the def, `place()`, `FURNISH` and the probe are the Scyvoi kit's engine: read `kits/scyvoi/API.md`. The
culture tag is `eternian` (`KIT.culture`); the faction is `The Eternal State`. Every building carries a tier in
`tags.style`: `host`, `court`, `ministry`, `common` or `poor` (`ET_STYLES`; `verify.py --assert` `tier-styled`).

Units are metres; x east, y up, z south. A def's local frame: origin on the ground at its centre, **+z its front**.

## Fragments

| Fragment | Prefix | What |
|---|---|---|
| `26k-kit.js` | | `KIT`, `ET_STYLES`, `SV_LIB` (the library families P1 maps), `SV_TILE0`, `SV_CLOTH`, `SV_CUT`, `KIT_HAS(k)`, `SVPAL`, `P(k)` |
| `37-wk-rec.js` | wk | walk records: every box a building draws is a core/walk floor or block (from `kits/islanders`) |
| `28-et-mat.js` | | what the vendored `27-mat.js` does not know: the screens alpha-tested and two-sided, the onyx and alabaster glowing (their map as their emissive map) |
| `38-et-alt.js` | | **alternates**: `ET_ALTS` (`screen`: screen, screenB; `maze`: maze, mazeB, mazeC), the take per placed instance (a KRAND hash of the def's seed, variant and place; it wraps `place` and `emit`, the engine untouched); `etAltOf(key, mk, x, z, v)` |
| `40-et-kit.js` | et | the toolkit: `etWall(L, y0, h, mk, col, opens, o)`, `etWalls(w, d, y0, h, mk, col, {front, back, left, right})`, `etMask`, `etOculus`, `etStepHead`, `etFlutes`, `etParapet`, `etBlockScreen`, `etStair`, `etNoCut`, `etCutFloor`, `etFace`, `ET_T` |
| `41-et-profile.js` | et | the profile helpers: `etPierBundle({n, w, d, h0, step, mk, col, niches, spire})` -> `{top, spireTop, xs, tops}`; `etLancetPts`, `etLancetTop`, `etLancet(x, y, z, w, h, {light, tracery})`, `etLancets(x, y, z, {n, w, gap, h, step, oculus, light})`; `etTracery(x, y, z, w, h, {head: 'pointed' / 'stepped' / 'flat', mw, th})`; `etPatternBlock`; `etPoly` (an outline with UVs); `etBand(mk, x, y, z, L, h, col, aspect)`, `etMazeBand`, `etFrieze`, `etScreen`, `etBanner` |
| `45-et-samples.js` | et | the P1 test row: `et_sample_piers`, `et_sample_lancets`, `et_sample_screens`, `et_sample_block` (class `feature`, kind `sample`) |
| `50-et-dwell.js` | et | the dwellings: `et_canal_house` |
| `68-et-trades.js` | et | `ET_TRADES` (the 44 Voth census trades in the repo's shape, `tools/check_trades.py`: `keys`, `gap` (here 'to build in Pn: et_key'), `na`; `voth` the Voth building), `etDims(DEFS, FAMILIES)` (a city layout's `kit.dims`). [G data] |
| `89-rows.js` | | `FAMILIES`: the sheet's rows |
| the rest | | VENDORED from `kits/scyvoi/src` (the sky from `settlements/iziz`) |

## Openings (`etWall`)

`{x, w, h, y, door, shut, steel, head, mask, maskCol, leaf, lit, gap}`: `y` the sill (a door's is 0); a door gets a
timber leaf, a `door()` record and the household's mask over it (`mask: false` for none); a window gets a lime surround,
a sill, a stepped Deco head (`head: 'flat'` for none), its glass and louvred shutters (`shut: false` for none, `steel`
for Deco steel glazing: a dark pane behind an iron grid); `gap` is a plain opening (a bay opening off the room).
Openings whose spans overlap are stacked in one column, and the wall fills only between them.

## Rules for a new fragment

- A building fragment (`4x`-`7x`) starts `// prefix: et` and every top-level name starts with `et`. Every `defBuilding`
  has a unique numeric `seed:` (dwellings 7001-7099; the State 7100-7299; the court 7300-7399; trades 7400-7699;
  hydraulics and harbour 7700-7899; statuary 7900-7999).
- A def's `w d h` contain everything it draws (the verifier allows 1.6 m).
- Every building is `cls: 'building'` with `tags: {types: [...], wealth, style}`; `cut: true` with 4+ catalog pieces.
- Furniture is never drawn by the kit: catalog keys only (`eternian_common_*`; `generic_*`, `job_*`, `scrap_*`).
- A building that carries a census trade goes in its `ET_TRADES` row's `keys`, and the row's `gap` comes out (or says
  what is still missing: a row may be partly carried).
- Draw a sheet with alternates by its base key (`screen`, `maze`): the take is picked for you, per instance.
- Placement draws from the def's own seed and position (core/rand), never from how many draws came before it.
