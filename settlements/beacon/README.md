# The Beacon

The Order of the Beacon's head house and the Sultan's watch fort over the Rift, on the east shoulder (px 853,1540, the pin
`sbeacon00001`). The plan is `PLAN.md`, the blueprint `BLUEPRINT.md` (sheets in `floors/`), the open points `KNOWN_ISSUES.md`.

| File | What |
|---|---|
| `src/30-bc-layout.js`, `src/31-bc-rules.js` | the layout as data and its rules (`[G data]`): the one source the sheets and the page draw from |
| `src/40-bc-lamp.js` | the lamp's night on core/sched (`[G data]`) |
| `src/41-bc-life.js` | the house's walkers on core/sched (`[G data]`): the Lamp Watch, the kora, the novices' round |
| `src/42-bc-relay.js` | the signal line's relay posts (`[G data]`): the Rim Post's place, its answering light, the sight line with Earth's curve |
| `test-beacon.js`, `test-lamp.js`, `test-life.js`, `test-relay.js` | node tests with negatives (`tools/ktest.js`) |
| `beacon_blueprint.py`, `layout_dump.js` | the sheets and the furniture manifest on the shared generator |
| `build.py`, `kit.json`, `targets/house/` | the page: a sheet on Xanadu's page (`settlements/xanadu/build.py --kit`), as Strongwall's |
| `ground/knoll-patch.json` | the restored knoll's cells, overlaid on the model while the scale-model line is unmerged here |
| `verify.py` | the page's checks on Xanadu's verify |

    python3 ../../tools/build.py settlements/beacon      # dist/beacon.html (?hour= default 18.05, the lamp lit; ?day= default 200; ?day=110&hour=11.5 the oil carts at the pit)
    KRATOR_GL=gpu python3 verify.py dist/beacon.html --assert --views "Overview,The lamp and the fort gate"
    node test-beacon.js && node test-lamp.js && node test-life.js && node test-relay.js
    python3 beacon_blueprint.py                           # floors/*.png and FURNITURE.md

The page reads the Xanadui fort (`kits/xanadu` 80f/80g) and the Qiblai kit (`kits/qiblai/src`) in place. The fort is placed
with `beacon:'ancient'`: 80g draws the lamp's plinth in the keep's place and records the lamp's centre in `window._xaBeacons`,
and mounts there the Ancient lamp head (`kits/ancients/pieces/89p-anc-beacon-lamp.js`), which the page turns by the lamp's
night (`KNOWN_ISSUES.md`).
