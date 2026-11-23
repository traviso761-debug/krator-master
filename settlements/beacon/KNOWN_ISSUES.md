# The Beacon: known issues

The page is a sheet on Xanadu's page (`build.py`, `targets/house/`). What it stands in for, and what it takes from the fort
asset (`kits/xanadu` 80f/80g, the Strongwall session's; this build does not edit them).

## The fort asset (kits/xanadu 80f-xa-fort-data.js, 80g-xa-fort.js): `beacon:'ancient'`

The Strongwall session folded the option into 80g (`583999842`, merged here); the page's shim on `xfKeep` is gone. The fort is
placed as `xa_fort_watch` with `{beacon:'ancient'}`, and 80g's `xfPlinth` draws the keep's place as the lamp's plinth: the
footing, three white storeys (3.3 + 4.5 + 4.5 m), the Chapel of the Beacon (4.5 m, yellow, saffron windows, gilt corners, a
2.2 m gilt finial), the slewing ring and yoke on the parapet's cap. No keep basket; a stone cable cover in the gate passage;
when ruined, the lamp head thrown down. It records the lamp's centre in `window._xaBeacons` and mounts the Ancient lamp head
there (below); `verify.py` lamp-on-its-plinth checks the record against the layout's figures.

**The lamp head** is kits/ancients' `anc_beacon_lamp` (B5, `kits/ancients/pieces/89p-anc-beacon-lamp.js`, `4adea4d27`, on the
page through `kit.json` external). 80g mounts it on the yoke; the page holds it on the bearing `BEACON_LAMP.state` gives each
frame, its shutters on the signal book's flashes, its beam on the lamp's night (`90r`, `bcLampTick`; `verify.py`
lamp-head-follows). The page's stand-in head and beam are gone.

Still the page's, or waiting:

- **The chapel's yellow** matches the gold spoke's wall (`QSPOKE[2].wall`, `0xd4b040`), the owner's "match the gold"
  (2026-11-23): 80g's `XF_PLINTH.yellow` (`a7c180af3`, the Strongwall session's, merged here).
- **The generator house** (the order's, in its lamp ward outside the gate) and **the plinth's rooms** are this build's.
- **The interiors (B8, `targets/house/90w-bc-interiors.js`).** The plinth's four floors (sheet P: the switch room and cable
  vault, the signal room and log, the Lamp Watch, the Chapel of the Beacon) and every building of the order are planned and
  furnished on the page by kits/qiblai's `qnIxType`, not by 80g's `xanadu-fort` set, which skips a `beacon:'ancient'` fort.
  Compromises:
  - the plinth is battered (12 m at its foot, 9.75 m at the chapel), and a plan has one outline for every floor, so its rooms
    are planned 9.86 m square inside the narrowest storey; the doorway runs through the thicker wall below as a passage
    (jambs, a lintel, a threshold, the portal at the body's face);
  - the rooms follow the blueprint's programme by kind (kits/interiors' planner divides each floor), not the sheets' exact
    room outlines;
  - the pieces that make a room (the Register in the Hall of Lights, the switchboard and the lectern in the plinth, the engine
    set in the generator house, the lens bench in the workshop) are given as the only Xanadu pieces of their type there; the
    rest is the catalog's choice;
  - all fifteen interiors are built at load (about 3.5 s), not on demand as Qiblai's city builds its lots';
  - the fort's own buildings (the barracks, stables, magazine, granary) and the Yellow Monastery (a host's) have none here.
- **The states.** The page draws only `kept`. `damaged` (the plinth stands, the lamp dark, the cable cut at the gate) is not yet
  an option of 80g's.

## Stand-ins on this page

- **The knoll** is overlaid from `ground/knoll-patch.json` (295 cells from the scale-model session's `d1c7d6682`, on
  `claude/gemini-trade-reconcile`) while that line is unmerged here. Once it is merged, the patch's cells equal the model's
  (`BC_GROUND.patched` reads 0) and the file can go.
- **The order's buildings** are stacks sized from the layout (`bc_block`: Qiblai's plinth, stack, windows, door and parapet roof
  in the gold spoke's colours), with their interiors (above).
- **The outside parts (P2)** are drawn, with a few compromises:
  - the terraces are tiled with the kit's terraced-field piece (`xa_farm`), each tile footed on its own ground, so they read as
    separate fields rather than one stepped hillside;
  - the byres are a long shed beside the kit's farmstead and dairy, and the herd is not drawn;
  - the roads are ribbons on the 2 km-a-pixel ground, laid only as far as the layout's ways reach; the region's own ways are
    the open-world session's (B7).
- **The walkers (P3)** are stand-in figures (a robe, a head, a sash: `targets/house/90t-bc-life.js`) until core/charactermodels
  draws the order's monks. They walk the routes of `src/41-bc-life.js` on the ground; the Lamp Watch goes into the plinth at its
  door and is hidden there (no interiors), and the kora's resting monks stand in a row at the monastery's gate, in the watch's
  way for the few seconds it passes at 17:40.
- **The oil carts (P6)** are stand-ins too (a bed on two wheels, four oil jars, a box ox: `90t-bc-life.js`) until a kit has the
  Xanadui ox cart. They are seen only on their days (`?day=110` or `?day=290`, between about 10:55 and 13:05), and only on the
  last 287 m of the fort road the layout draws: their 240 km from the oil field is the open world's (B7). The lamp's draw is
  checked against the carts in `test-life.js` (pitYear); the sim does not move the oil yet.
- **The offices (P6)** walk only the Lamp School's six masters: the chapter lives in the Yellow Monastery's own ranges, and the
  monastery is a host's building with no interiors here, so its assembly is not drawn.
- **The Rim Post (P4)** stands 17 km off on the middle volcano's summit (`lamp.relays`, `targets/house/90u-bc-relay.js`) on the
  far land as drawn, a 500 m mesh: up close it is a plain grey slope, and the post's footing is fitted to that mesh, not to the
  summit at 1:1 (B7). The sight line to it is checked on the page's own ground and clears by about 20 m, against the layout's
  41 m on the 2 km grid: the closest point is the summit's own shoulder, just short of the post. The line on to the Eye Post
  (56 km east) is off the far land's square and is not drawn or checked on the page.
- **The ground** is the model at 2 km a pixel, bicubic, with the house's levels cut and filled into it. The knoll's faces, the
  saddle and the spur at 1:1 wait for the region (B7). The view "Over the Rift from above the fort" shows the problem: the
  spur falls gently for its first 4 km, so at dusk the Rift reads only as the far land's band on the horizon, not as a
  scarp under the lamp.
