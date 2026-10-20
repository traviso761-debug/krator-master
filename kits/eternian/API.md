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
| `40-et-kit.js` | et | the toolkit: `etWall(L, y0, h, mk, col, opens, o)`, `etWalls(w, d, y0, h, mk, col, {front, back, left, right})`, `etOculus`, `etStepHead`, `etFlutes`, `etParapet`, `etBlockScreen`, `etStair`, `etNoCut`, `etCutFloor`, `etFace`, `ET_T`, `ET_WATER` |
| `41-et-profile.js` | et | the profile helpers: `etPierBundle({n, w, d, h0, step, mk, col, niches, spire})` -> `{top, spireTop, xs, tops}`; `etLancetPts`, `etLancetTop`, `etLancet(x, y, z, w, h, {light, tracery})`, `etLancets(x, y, z, {n, w, gap, h, step, oculus, light})`; `etTracery(x, y, z, w, h, {head: 'pointed' / 'stepped' / 'flat', mw, th})`; `etPatternBlock`; `etPoly` (an outline with UVs); `etBand(mk, x, y, z, L, h, col, aspect)`, `etMazeBand`, `etFrieze`, `etScreen`, `etBanner` |
| `42-et-head.js` | et | **the head generator** [G data]: `etHeadParams(seed, {long, broad, aged, soft, eyes, headdress, mask, neck})` (a KRAND seed; `eyes` 'closed' by default or 'open'; `headdress` 'step' / 'fan' / 'ring' / 'none'); `etHeadGeo(p)` -> `{pos, uv, eyes}` (a non-indexed triangle list: chin at y 0, a neck to -0.16 unless `neck: false`, crown at 1, face toward +z); `etFigureGeo({pose, seed, eyes, headdress})` (1 tall; pose 'stand' / 'seat' / 'lintel' / 'folded'); the triangle helpers `etTri`, `etQuad`, `etGBox`, `etGBeam`, `etGFrustum`. Read in place by `kits/ancients` (the Sanctum target) |
| `43-et-statue.js` | et | **the statuary**: `etHead(x, y, z, h, {metal, eyes, headdress, veiled, seed, plinth, ry})` (neck's foot at y); `etFigure(x, y, z, h, {pose, metal, eyes, plinth, ry})`; `etMask(x, y, z, s, 'terracotta' / 'lead')` (centred, facing +z); `etSeedAt(x, y, z, salt)` (a KRAND hash of the world position); `etEmitGeo`; `etMetalCol`; `ET_METALS`. Each pushes `{kind, metal, eyes, veiled, pose}` onto the building record's `heads` (the `closed-eyes` assert) |
| `45-et-samples.js` | et | the test rows: P1's `et_sample_piers` (a head in every niche), `et_sample_lancets`, `et_sample_screens`, `et_sample_block`; P2's `et_sample_heads` (fifty by rank), `et_sample_figures` (the four poses), `et_sample_masks` (class `feature`, kind `sample`) |
| `44-et-roof.js` | et | **the roofs**: `etSheet(mk, p0, p1, p2, th, col)` (a slab with metre UVs), `etPoly2`; `etGable(w, d, y, h, {mk, col, ov, gov, th, ribs, gables, wallMk, wallCol, cap})` (ridge along x); `etHip(w, d, y, h, {mk, col, ov, under, cap, flare, ribs})`; `etPent(w, d, y0, y1, {mk, col, ov, gov, ribs})` (high at the back) and `etPentFill`; `etOgee(R, y, h, {mk: 'gilt' / 'scale', col, finial})` (octagonal fish-scale, flat faces to the axes: `ET_OCT0`) |
| `46-et-civic-kit.js` | et | **the civic toolkit**: `etHex(R)` (corners at multiples of 60 degrees, a face toward +z), `ET_HEX_AP`, `etHexFaces(ap, fn(k, ph))` (a frame per face, +z outward, face 1 the front); `etCivicDoor(x, z, w, h, {metal})` (bronze leaves, two ancestors in the lintel pose, the lintel); `etTubeHead(x, z, h, {top})`; `etPipeRun(a, b, {r, posts})`; `etFaceScreen(x, y, z, w, h, cell)` and `ET_FACE_CALM` (the terminal sheet's cells, the deranged one left out) |
| `50-et-dwell.js` | et | the canal house and the poor: `et_canal_house`, `et_reed_house`, `et_block_hut`, `et_canal_row` |
| `54-et-dwell-hex.js` | et | the hexagonal houses: `et_hex_hut` (poor), `et_hex_house` (middle), `et_hex_villa` (rich, in its walled garden) |
| `51-et-dwell-mid.js` | et | the middle tier: `et_court_house`, `et_corner_turret` |
| `52-et-dwell-rich.js` | et | the rich: `et_merchant_house`, `et_official_villa` (household service) |
| `53-et-court.js` | et | the court over water: `et_heir_pavilion` (v: 0 gilt, 1 bronze, 2 gunmetal roof), `et_heir_gallery`; `etOct(R)`, `ET_ROOF_TAKES` |
| `70-et-canal.js` | et | the canal street: `et_canal`, `et_bridge`, `et_canal_street` (`ET_STREET`: its two rows of dwellings, placed as nested records at `ET_QUAY`); `ET_CANAL_W` |
| `68-et-trades.js` | et | `ET_TRADES` (the 44 Voth census trades in the repo's shape, `tools/check_trades.py`: `keys`, `gap` (here 'to build in Pn: et_key'), `na`; `voth` the Voth building), `etDims(DEFS, FAMILIES)` (a city layout's `kit.dims`). [G data] |
| `64-et-trade-kit.js` | et | **the trade generator**: `etTrade({plan: 'rect' (w, d) / 'hex' (R), storeys, sh, G, mk, upMk, shop, mask, roof: 'gable' / 'hip' / 'pent' / 'flat' / 'pyramid' / 'ogee', roofMk, roofH, chimney: [x, z], sign: [x, z], steel, poor, furn, extra(F)})` -> `F {G, H, top, w, d, R, ap, sh}`; rect furniture `[key, x, z, ry, storey]`, hex `[key, face, inset, storey]` (face 1 the door's); `etBottleKiln(x, z, r, h)`, `etDryRack(x, z, L, mk, col)`, `ET_SH` |
| `65-et-works.js` | et | the works: `et_kiln` and `et_tile_works` (hexagonal), `et_porcelain`, `et_paper_mill`, `et_printer` |
| `66-et-trades.js` | et | the census trades: `et_bakehouse`, `et_weaver`, `et_brewhouse`, `et_smithy`, `et_shophouse`, `et_inn` (v 1 hexagonal: `etHexV`), `et_butcher`, `et_tannery`, and the hexagonal `et_tea_house`, `et_healer`, `et_market_hall`, `et_granary`, `et_warehouse`; `et_mushroom_cellar` |
| `67-et-land.js` | et | the land: `et_farmstead` (hexagonal), `et_paddy`, `et_tea_garden`, `et_mine`, `et_quarry`, `et_stock_pens`; `etField` |
| `71-et-harbour.js` | et | hydraulics and harbour: `et_lock`, `et_reservoir_wall`, `et_spillway` (record `spill: {lip, foot, width}`), `et_canal_landing`, `et_ferry_landing`, `et_fish_landing`, `et_quay`, `et_dock`, `et_lighthouse` (hexagonal), `et_factory_quarter` |
| `91d-et-water.js` | | the host side of the spillway: the falling sheet from each `spill` record, its streaks running; browser only |
| `60-et-state.js` | et | the State: `et_ministry`, `et_registry`, `et_examination_hall` (hexagonal), `et_customs_house` |
| `61-et-defence.js` | et | the wall: `et_gate`, `et_wall`, `et_wall_tower` (v 1: the frontier's, blind), `et_barracks` |
| `62-et-machine.js` | et | the machine layer: `et_clock` (record `clock`: `{dial, normal, radius, track, figureH, period, figures: [{metal, seed}]}` in world coordinates), `et_tube_station` (hexagonal; `etHexPut`), `et_tube_pipe`, `et_talking_head` (record `voice: {face, deranged}`), `et_relic_hall` |
| `63-et-faith.js` | et | the ancestors: `et_ancestor_gallery`, `et_shrine_niche`, `et_withdrawal_house`, `et_mask_house`, `et_historians_house` |
| `91c-et-clock.js` | | the host side of the Clock: draws each `clock` record's figures and hands and runs them (`ET_CLOCKS`); browser only |
| `89-rows.js` | | `FAMILIES`: the sheet's rows |
| the rest | | VENDORED from `kits/scyvoi/src` (the sky from `settlements/iziz`) |

## Openings (`etWall`)

`{x, w, h, y, door, shut, steel, head, mask, maskMetal, leaf, lit, gap}`: `y` the sill (a door's is 0); a door gets a
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
