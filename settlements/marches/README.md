# The Marches: the west and south watch forts (M1, M3)

The Marches (`Mārchiz`, P8, seat Erehwon) hold three forts of 150 against the Rift. This build draws the two that are this plan's,
**the west watch fort (`march.w`) and the south watch fort (`march.s`)**, on a sheet, from the Xanadui fort asset
(`kits/xanadu` `XFORT`, 80f; its drawing, 80g; the Strongwall session's). The third, the beacon fort (`march.e`), is
`settlements/beacon`'s. `PLAN.md` is the spec; `KNOWN_ISSUES.md` lists what the sheet leaves open and what the asset would need.

```
python3 ../../tools/build.py settlements/marches                 # dist/marches.html (from the repo root: python3 tools/build.py settlements/marches)
node tests/test-marches.js                                     # the records against the tune, the plan's rules, the states, the pins
python3 verify.py dist/marches.html --assert --all-views         # SwiftShader; on a GPU lane: KRATOR_GL=gpu
```

## What the sheet shows

A row per fort (the west fort in front, the south fort behind), a column per state (**kept**, **damaged**, **ruined**:
`XFORT.damage`, hashed from each fort's own seed, so the two fall differently). Each fort is `xa_fort_watch` (the asset's
`watch` size, 56 x 42 m, dress `march`): its curtains, four corner towers and the interval and gate towers, the iwan gate with its
gilt pavilion, the keep with the gilt chapel and **the beacon's fire basket** on its roof, **one gun on the gate tower**, the
barracks, stables, magazine, granary and cistern inside. Outside: **the road down** from the gate (`mr_road`), **a wayside shrine**
beside it (`mr_wayside_shrine`), **the stable yard**: the corral (`xa_corral`) and its cistern and trough (`mr_cistern`), and
**the relay post** (`xa_fort_post`, `XFORT.post()`), in the fort's state. The works stand with the kept and the damaged fort; the
ruined one keeps only its road and its post's ruin. Every damaged and ruined fort and post is watched by `core/ruins`
(`KRUINS.watch`): nothing floats, every wreck lies on its lowest points; the rubble is `KRUBBLE` heaps.

Flat ground: Mārchiz is cut after the vertical stack (the owner, 2026-11-22), so each ward is fitted to its knoll, the roads laid
and the relay posts sited by sight at M2.

## The records

Read in place, never copied: the forts' ids, names, px, people and state from `XAN_TUNE` (`core/region/data/xan-tune.js`,
`XAN_TUNE.valley`), the musketeers from `T.muskets` (`src/80n-mr-forts.js`, `MRF`). The garrison's split is proposed and sums to
the tune's 150: household 10, foot 88, horse 25, musketeers 10, gunners 5, the relay post's rota 12.

| | West watch fort | South watch fort |
|---|---|---|
| Id | `march.w` | `march.s` |
| px | 818,1531 | 843,1546 |
| People | 150 (10 musketeers) | 150 (10 musketeers) |
| State | kept | kept |

## M3: the pins for the scale-model queue (listed, not written)

Two records-only **fort** pins, polity the Sultanate, named as the tune names them (the proposed names Wesṭ-Wāch and Sāuth-Wāch wait
for the owner): **`smarchw0001`** (`march.w`, The west watch fort) at **818,1531** and **`smarchs0001`** (`march.s`, The south
watch fort) at **843,1546** (`MRF.pins()`). The relay posts are region site records at M2, not pins.

## Files

| File | What |
|---|---|
| `build.py` | the build: the tune under a numbered name (`gen/`, not committed), then Xanadu's `build.py --kit` |
| `kit.json` | the page: the target `forts`, the fort asset and core modules read in place |
| `src/80m-mr-works.js` | the outside works the kit lacks: the wayside shrine, the stable yard's cistern, the road |
| `src/80n-mr-forts.js` | `MRF`: the forts' records from the tune, the garrison, the pins `[G data]` |
| `targets/forts/89z-rows.js` | the sheet's sites: each fort in its three states with its works and post |
| `targets/forts/91u-mr-ruins.js` | the `core/ruins` watch and the page's record for the verify |
| `targets/forts/91v-mr-drawn.js` | the meadow registered with `core/drawn` |
| `targets/forts/91z-views.js` | the views and the budget |
| `tests/test-marches.js` | the node test (`tools/ktest.js`) |
| `verify.py` | Xanadu's verify with the forts' asserts |
