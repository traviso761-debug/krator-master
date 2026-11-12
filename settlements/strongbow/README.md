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
| `src/8ax0-sb-reclaim.js` | the page's drawing of the reclamation (the lifts, bridges, rope ways, the bazaar, the serai stand-in, the balloon, the post at the lip) |
| `floors/`, `AREAS.md` | the sheets and the area, drawn by `strongbow_blueprint.py` |
| the page | `kits/ancients/dist/strongbow-today.html`, the kit's target `strongbow-today`, which reads the arcology's fragments and these in place (`kits/ancients/build.py` `TARGET_READS`) |

## Commands

```
node settlements/strongbow/test-census.js            # the census against the plan (--write rewrites CENSUS.md)
node settlements/strongbow/test-strongbow-town.js    # the layout's rules, each with a negative; AREAS.md current
python3 settlements/strongbow/strongbow_blueprint.py # the sheets and AREAS.md
python3 tools/build.py kits/ancients --target strongbow-today
cd kits/ancients && python3 verify.py dist/strongbow-today.html --assert --all-views
```

## Not yet

- **The town's rings (SB3).** They go on `core/city` with the scrap Xanadu set (`claude/scrap-xanadu`, not yet merged here). The
  page shows the foot without them, and the serai, gate, shrine and pavilion on the plaza are stand-ins until then.
- **Life (SB4).** It goes on `core/simulation`.
- **Placement in the open world.** That is `openworld/oidong-highrift`'s job.
