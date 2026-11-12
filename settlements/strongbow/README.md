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

## Not yet

- **The foot's crops.** The fields are grain, fodder and fallow by turn, as a placeholder: what the foot grows is owed to its height
  and climate on the scarp (PLAN.md section 7).
- **The town's textures.** The scrap set draws its procedural maps here: the page carries the Ancients' library pack, not
  Xanadu's (`XAK.bind` needs the `xanadu` pack registered).
- **The sheets.** S0 does not yet draw the town's lots and streets.
- **Life (SB4).** It goes on `core/simulation`.
- **Placement in the open world.** That is `openworld/oidong-highrift`'s job.
