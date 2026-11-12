# Strongbow today

The Ancients' cliff arcology on the Xanadu-Oidong scarp as it stands now: the Sultanate's town at its foot and in its lower Spine,
the elevator to the lip, the outcasts in the upper Spine, the Order in the tower. Read [PLAN.md](PLAN.md) first.

## Where things are

| | What |
|---|---|
| `PLAN.md` | the plan, with the owner's answers |
| `src/20-sb-census.js` | the trades census as records; `CENSUS.md` is written from it |
| `src/30-sb-layout.js` | the layout: parts, ways and lifts, read off the arcology's records (`kits/ancients/targets/strongbow`); `sbLayout()` builds it on first use |
| `src/31-sb-rules.js` | the layout's 15 rules and its area |
| `src/40-sb-town.js` | the town at the foot (SB3) on `core/city`: its site, ring roads and spokes, rules and fields; `SB_TOWN.make` gives its records |
| `src/8ax0-sb-reclaim.js` | the page's drawing of the reclamation (the lifts, bridges, rope ways, the bazaar, the balloon, the post at the lip; stand-ins for the foot's four scrap buildings where the kit is not on the page) |
| `src/8ax2-sb-cutaway.js` | the cutaway (the c key, the button, the views "Cutaway — the Spine / the tower / the foot"): the column cut on its axis by a KHOOK layer, a slab for every storey coloured by who holds it, and a legend of the people each holder houses |
| `src/8ax1-sb-town.js` | the page's drawing of the town and the foot's four scrap buildings (the serai, the plaza's gate, shrine and pavilion) with the scrap Xanadu set (`XAK`) |
| `floors/`, `AREAS.md` | the sheets and the area, drawn by `strongbow_blueprint.py` |
| the page | `kits/ancients/dist/strongbow-today.html`, the kit's target `strongbow-today`, which reads the arcology's fragments and these in place (`kits/ancients/build.py` `TARGET_READS`). core/city with the town plan (`SBCITY`) and the Xanadu kit with its scrap set (`XAK`) go on it sealed, each in its own closure (`build.py` `sb_city`, `sb_xak`): core/city's `clamp` and `segDist` are the kit's names too |

## Commands

```
node settlements/strongbow/test-census.js            # the census against the plan (--write rewrites CENSUS.md)
node settlements/strongbow/test-strongbow-town.js    # the layout's rules, each with a negative; AREAS.md current
node settlements/strongbow/test-sb-town.js           # the town on core/city: no overlap, off the streets and the foot, the rings' people, the farms
python3 settlements/strongbow/strongbow_blueprint.py # the sheets and AREAS.md
python3 tools/build.py kits/ancients --target strongbow-today
cd kits/ancients && python3 verify.py dist/strongbow-today.html --assert --all-views
```

## Level of detail

The town draws each building in three layers (`src/8ax1-sb-town.js`). Each layer is merged by material over the whole town, and
the town is cut into 120 m cells:
- **The big pieces** are those at least 1.5 m in radius: walls, roofs, domes and towers, 1.24M of the town's 5.94M triangles.
  They draw at every distance, and core/lod simplifies them far off, as it does any static mesh.
- **The skin** is the plain boxes: panel courses, paint and bronze bands, 2.63M triangles, which give a house its colours.
  It draws in the cells within 300 m of the eye.
- **The detail** is the rest: lamps, bulbs, rings, bottles, cables and finials, 2.07M triangles. It draws within 200 m.

The skin's and the detail's index holds only the cells in reach, rewritten when a cell comes into reach or leaves it; core/lod
leaves those meshes alone. Beyond 300 m a house loses its panel courses, which shows a little at the edge.

Measured 2026-11-12 in the browser pane, with core/lod on and its proxies built (before → after, triangles drawn; draw calls in brackets):

| View | Before | After |
|---|---|---|
| Strongbow today (the overview) | 0.88M (321) | 0.44M (96) |
| The town from above | 1.39M (312) | 0.58M (89) |
| The inner ring | 4.32M (338) | 2.75M (129) |
| The road spoke | 3.20M (340) | 1.66M (136) |
| The outer ring and the farms | 1.81M (315) | 0.68M (101) |

## Not yet

- **The foot's crops.** The fields are grain, fodder and fallow by turn, as a placeholder: what the foot grows is owed to its height
  and climate on the scarp (PLAN.md section 7).
- **The town's textures.** The scrap set draws its procedural maps here: the page carries the Ancients' library pack, not
  Xanadu's (`XAK.bind` needs the `xanadu` pack registered).
- **The sheets.** S0 does not yet draw the town's lots and streets.
- **Life (SB4).** It goes on `core/simulation`.
- **Placement in the open world.** That is `openworld/oidong-highrift`'s job.
