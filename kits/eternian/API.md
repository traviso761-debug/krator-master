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
| `40-et-kit.js` | et | the toolkit: `etWall(L, y0, h, mk, col, opens, o)`, `etWalls(w, d, y0, h, mk, col, {front, back, left, right})`, `etMask`, `etOculus`, `etStepHead`, `etFlutes`, `etParapet`, `etBlockScreen`, `etStair`, `etNoCut`, `etCutFloor`, `etFace`, `ET_T` |
| `50-et-dwell.js` | et | the dwellings: `et_canal_house` |
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
- Placement draws from the def's own seed and position (core/rand), never from how many draws came before it.
