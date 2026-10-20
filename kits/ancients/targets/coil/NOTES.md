# The Coil — hand-back notes

Target `coil` (`dist/coil.html`). The Ancients' spiral live/work arcology, built for the Eternal State's capital
(`LORE.md` §6.19, `kits/eternian/PLAN.md` §7) in place of the proposed Plymouth. West (x = -1700): as the Ancients
built it. East (x = +1700): the Sanctum, as the True Heirs keep it (`kits/eternian/palace/BLUEPRINT.md`). One plan,
one seed: the same building.

## The fragments (all in this folder, so the kit's other 41 pages do not change)

| Fragment | Tag | What |
|---|---|---|
| `89z-rows.js` | [G data] | the site table: two rows, `coil` and `sanctum` |
| `8aq0-coil-plan.js` | [G data] | `COIL.plan()`: the podium, ridges, entrances, staircases, 27 arches and balconies, crown, as records with stable ids; `COIL.dressIntact()`: the Ancients' gardens and people; `COIL.apply()`: deltas by id |
| `8aq1-coil-sanctum.js` | [G data] | `COIL.sanctum()`: the Heirs' retrofit as deltas (the program of every gate and arch, onyx, tracery, heads, terminals, banners, wall, moat, pavilions, colossus). Moves to `kits/eternian` at its P0 |
| `8aq2-coil-skins.js` | [draw] | procedural skins (KRAND), materials, the faceted head, kit items |
| `8aq3-coil-draw.js` | [draw] | `buildCoil`, `buildCoilSanctum`: register every record in core/tags, then draw it |
| `91z-views.js` | [G data] | the presets, derived from `CO_SITE` |
| `test-coil.js` | | `node kits/ancients/targets/coil/test-coil.js` |

The target takes `core/rand` and `core/tags` (`build.py` `TAGS_TARGETS`). Seeds: `reseed(12100+d)` and `reseed(12110+d)`
claim the kit stream for the lint only; every placement draws from KRAND hashed by (seed, salt, index).

## The form

| | |
|---|---|
| volume | 45.3 Mm³ (Plymouth 45.8): podium tiers, drum and skirt, ridges, less the bays' recesses |
| podium | a filleted hexagram, 690 m point to point (`RT` 355, fillet 14), tiers 0-20-34-48 m at scales 1, .78, .56 toward the drum |
| drum | radius 208 m at 48 m (a concave 18 m skirt), 191 to 80 m from 48 m to 660 m (exponent 1.12); 192 segments by 4 m rows |
| ridges | six, on the points; stair (0.5 m risers) from 2 m at the point + 44 m to an 18 m landing at 152 m; half-width 36 (great) or 28 to 13 |
| entrances | three great arches on points 0, 2, 4 (south, north-west, north-east: a triangle), 56 m wide, spring 44 m, 16 m deep, a bronze door in the onyx; three small doors on 1, 3, 5, 16 m wide, spring 20 m |
| staircases | three, counterclockwise (toward -th) from the great arches, nine flights each, a sixth of a turn a flight; a flight rises .3 of the radius (38-62 m), 21-30 degrees, 0.5 m risers, 10 m wide |
| arches | 27 on the staircases + the 3 great = 30. Level j of staircase h on axis 2h - j; each level three arches at one height. 26-48 m wide (.27 of the radius), spring 12-40 m, held under the next arch up its axis; frame .16 of the radius, 3 m proud; balcony 10 m out, flat in front, the flights landing at its ends |
| crown | rim 14 m, 6 m thick; lantern r 24 m, 36 m; the Ancients' mast 70 m; the Heirs' colossus 44 m on a 5 m plinth on the south rim |

Holes are exact: a bay's sides are segment lines and its floor, spring and head are row lines (`COIL.bay`), and the
spandrels between the arch and that rectangle are filled by a fan.

## The checks

- `node kits/ancients/targets/coil/test-coil.js`: determinism, the volume within 3% of Plymouth's, thirty arches, the
  great three a triangle, every arch on the six axes, each level a triangle, 27 counterclockwise flights under 33
  degrees, every arch clearing the one above on its axis, deltas all landing on records, unique ids,
  finite positions, closed eyes, onyx in every hall of the State.
- `python3 verify.py dist/coil.html --assert --views "The Sanctum"`: clean (2026-10-20), 31 draw calls, 0.25 M triangles.
- In the page: `window._coilSite.tags` is the core/tags audit. Its only unknown is `culture:eternian`, until the
  Eternian kit's P0 registers the culture.

## Fixed for this page only (kit-wide, see KNOWN_ISSUES.md)

The sky shader is black below the horizon (`pow` of a negative in `90-scene.js`), drawn after the ground with no depth
write, and the far plane is 12 km: a wide shot of a 700 m figure showed a black band. `coDraw` patches the shader,
draws the sky first and sets the far plane to 30 km, on this page only.
