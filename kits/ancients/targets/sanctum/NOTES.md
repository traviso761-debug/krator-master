# The Sanctum — hand-back notes

Target `sanctum` (`dist/sanctum.html`). The Eternal State's capital arcology (`LORE.md` §6.19, `kits/eternian/PLAN.md`
§7), as the True Heirs keep it, in **the owner's form of 2026-10-22**. The spiral drum that was the Sanctum before is a
separate arcology now, the Podium (`targets/podium`).

## The form (the owner's brief, from the bottom)

| | |
|---|---|
| podium | a hexagon, corner radius 400 m (800 m across), six storeys (30 m); corners at 0 + 60k degrees |
| gates | one in the middle of each face: a hexagonal opening flat on the ground, 28 m wide, 24 m tall, in a gold and a stone ring; a passage lined in onyx through to the atrium; a gold face 17 m tall (the front's 20) on the roof over it; the State's banners either side |
| atria | behind each gate, a hexagonal court open to the sky (corner radius 34 m, centre 300 m out), a pool and an ancestor on a plinth (gold at the front, bronze else). They lie outside the solid's plan, so they get the sky |
| stalk | a hexagon a sixth of the podium's width (corner radius 66.7 m), nine storeys from the podium's roof (30 to 75 m) |
| solid | a hexagon two thirds of the podium's width (corner radius 266.7 m), turned 30 degrees so its corners stand over the gates; 36 m fillets; 48 storeys (75 to 315 m), most of the mass. Its faces: a balcony band every 30 m, nine great onyx lancets a face between bands, in a dark reveal with bronze bars, on the Heirs' wall skin |
| wells | six hexagonal light wells through the solid, on its face normals 150 m out (corner radius 34 m), walled in the skin |
| roof | a garden (628 trees with the podium's, a ring path round the tower, spokes to the corners), a tapering central tower (48 to 30 m, 80 m tall, a bronze hexagonal roof to 425 m), six smaller towers at the corners |
| mass | 52.7 Mm³ from the plan: between Plymouth (45.8) and Hexahedron (two pyramids of 480 and 320 m on a 1 km triangle, about 85) |

## The fragments

| Fragment | Tag | What |
|---|---|---|
| `89z-rows.js` | [G data] | the site table: one row, `sanctum` |
| `8ar0-sanctum-plan.js` | [G data] | `SANCTUM.plan()`: every part as a record with a stable id; the outline, the membership tests and the volume as plain functions; the garden's trees from KRAND hashed by (seed, salt, node) |
| `8ar3-sanctum-draw.js` | [draw] | `buildSanctum`: register every record in core/tags (`KTAGS.sanctum`), then draw it: merge-buffer quads per material, kit instances for the small things |
| `91z-views.js` | [G data] | the presets, derived from `SCN_SITE` |
| `test-sanctum.js` | | `node kits/ancients/targets/sanctum/test-sanctum.js`: the brief as checks |

It reads in place (`build.py` `TARGET_READS`) the Eternian kit's head generator (`kits/eternian/src/42-et-head.js`) and the
Podium's skins and materials (`targets/podium/8aq2-podium-skins.js`: `MAT.sn*`, the faceted heads `snHead*`), and takes
`core/rand` and `core/tags` (`TAGS_TARGETS`).

## The checks

- `node kits/ancients/targets/sanctum/test-sanctum.js`: 20 checks (determinism, the volume, the proportions, the solid's
  corners over the gates, atria open to the sky, wells inside the solid, towers clear of wells, trees clear of wells and
  atria, unique ids).
- `python3 verify.py dist/sanctum.html --assert --views "The Sanctum"`: OK (2026-10-22), 76 k triangles of the 'mega'
  guide's 700 k, 21 draw calls.
