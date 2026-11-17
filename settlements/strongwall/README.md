# settlements/strongwall: Strongwall, the Master of Mines' fort

The Master of Mines' fort at the foot of the Gold March's scarp, where Kruk Gill comes out of its gorge (pin `sxan7r1sln`, px
912,1640, scale model 5.1e8; 250 people and the Golden Tears' 80 in the tune). `PLAN.md` is the site plan and the owner's answers;
it also specifies the Xanadui fort asset, built in `kits/xanadu` (`src/80f-xa-fort-data.js`, `src/80g-xa-fort.js`; steps F1-F4).
This page is its step S1: the march fort on the bench, as a target on Xanadu's page. `tempest/` is the House of the Tempest's
blueprint (another session's, section 3a).

## Build and verify

```
python3 ../../tools/build.py settlements/strongwall            # dist/strongwall.html (from the repo root: tools/build.py settlements/strongwall)
KRATOR_GL=gpu python3 verify.py dist/strongwall.html --assert --views "Overview,The Qiblai Gate,The keep and its chapel"
```

`build.py` writes `gen/69w-sw-ground.js` (the scale model's ground round the pin: a 4 km square at 20 m, from 2.6 km north of the
pin to 1.4 km south, and an 80 km square at 500 m, bicubic on `h.png`, and the model's rivers within it), then runs
`settlements/xanadu/build.py --kit settlements/strongwall`: the fort is a target on Xanadu's page, as Thalaba and Kirstabal are.
The Xanadui fort is read in place from `kits/xanadu` with the cores its ruined states take (`core/terrain/37c-core-rubble.js`,
`core/ruins`): `kit.json` `external`.

## How the page is made

| Fragment | What |
|---|---|
| `targets/fort/89z-rows.js` | `window.CITY`, the title, no sheet rows |
| `targets/fort/89zs-sw-site.js` | the site as data: the model's ground (`swModel`), the fort's place (XFORT's march plan turned half round, `SW`: its Qiblai Gate facing north down the bench, its gorge wall on the pin's row) and the pad it stands on (`swGround`: the lot levelled to the median of the model's ground there, eased back over 45 m) |
| `targets/fort/90q-sw-world.js` | the Krator sky and its light; the near ground (a 4 km square at 10 m, the kit's meadow under a colour per vertex: the bench, the scarp's foot, bare rock, the pad's beaten earth); the far land out to 40 km, coloured by height, slope and the rivers (a wadi's gravel, a river's water) |
| `targets/fort/90r-sw-fort.js` | the march fort (`xa_fort_march`, kept) at its place on the pad, baked; its walks on core/walk |
| `targets/fort/91z-views.js` | the views; the fort as one budget |
| `verify.py` | Xanadu's verify plus the fort's invariants: `strongwall-laid`, `on-the-model`, `fort-on-its-pad`, `fort-walks` |

**The ground is the model's.** At the pin the model gives 737.4 m (the merged model of 2026-11-16; the plan's survey read 755 m
on the model before it). The pad is at 738.6 m, with 4.4 m of cut and 5.4 m of fill. The scarp climbs from the model's next
cell, about 2 km south of the pin (1,072 m at 912,1642, 2,030 m at 912,1644); the cell between (688 m at 912,1641) is the slot's
head. At 2 km a pixel the model has no gorge: the fort's gorge wall stands at the pin on its pad, with the scarp behind it.

**Turned half round.** The plan's march fort has its Qiblai Gate at +z and its water gate in the gorge wall's east wing. Turned
so the Qiblai Gate faces north, the water gate stands in the west wing: where Kruk Gill comes down, from the south-west (its
bed in `rivers.json`: 910.7,1641.9 to 912.8,1639.9).

## What is not here yet

- **The open world** (S1's other half): Strongwall's site in `openworld/xanadu-oidong-highrift`, its ring, and the six watch posts
  at 1:1 with their lines of sight rechecked. The posts' pins wait in the scale-model session's queue (W0).
- **The gorge** at 1:1 (a carve of Kruk Gill's bed into the scarp), and Kruk Gill's water on core/water: the wadi is drawn dry.
- **The fort's interiors** (F4: `kits/xanadu/KNOWN_ISSUES.md`), people and life (S3), the raids (S4).
