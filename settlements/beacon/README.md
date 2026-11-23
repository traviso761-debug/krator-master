# The Beacon

The Order of the Beacon's head house and the Sultan's watch fort over the Rift, on the east shoulder (px 853,1540, the pin
`sbeacon00001`). The plan is `PLAN.md`, the blueprint `BLUEPRINT.md` (sheets in `floors/`), the open points `KNOWN_ISSUES.md`.

| File | What |
|---|---|
| `src/30-bc-layout.js`, `src/31-bc-rules.js` | the layout as data and its rules (`[G data]`): the one source the sheets and the page draw from |
| `src/40-bc-lamp.js` | the lamp's night on core/sched (`[G data]`) |
| `test-beacon.js`, `test-lamp.js` | node tests with negatives (`tools/ktest.js`) |
| `beacon_blueprint.py`, `layout_dump.js` | the sheets and the furniture manifest on the shared generator |
| `build.py`, `kit.json`, `targets/house/` | the page: a sheet on Xanadu's page (`settlements/xanadu/build.py --kit`), as Strongwall's |
| `ground/knoll-patch.json` | the restored knoll's cells, overlaid on the model while the scale-model line is unmerged here |
| `verify.py` | the page's checks on Xanadu's verify |

    python3 ../../tools/build.py settlements/beacon      # dist/beacon.html (?hour= sets the sky; default 18.4, the lamp lit)
    KRATOR_GL=gpu python3 verify.py dist/beacon.html --assert --views "Overview,The lamp and the fort gate"
    node test-beacon.js && node test-lamp.js
    python3 beacon_blueprint.py                           # floors/*.png and FURNITURE.md

The page reads the Xanadui fort (`kits/xanadu` 80f/80g) and the Qiblai kit (`kits/qiblai/src`) in place. It draws the lamp's
plinth through a shim on 80g's keep until the fort asset takes `beacon:'ancient'` (`KNOWN_ISSUES.md`).
