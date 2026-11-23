# The Beacon: known issues

The page is a sheet on Xanadu's page (`build.py`, `targets/house/`). What it stands in for, and what it takes from the fort
asset (`kits/xanadu` 80f/80g, the Strongwall session's; this build does not edit them).

## The fort asset (kits/xanadu 80f-xa-fort-data.js, 80g-xa-fort.js): `beacon:'ancient'`

The Strongwall session folded the option into 80g (`583999842`, merged here); the page's shim on `xfKeep` is gone. The fort is
placed as `xa_fort_watch` with `{beacon:'ancient', lampAt:'beacon'}`, and 80g's `xfPlinth` draws the keep's place as the lamp's
plinth: the footing, three white storeys (3.3 + 4.5 + 4.5 m), the Chapel of the Beacon (4.5 m, yellow, saffron windows, gilt
corners, a 2.2 m gilt finial), the slewing ring and yoke at 18 m. No keep basket; a stone cable cover in the gate passage; when
ruined, the lamp head thrown down. It records the lamp's centre in `window._xaBeacons`, where the page seats its stand-in head
(`verify.py` lamp-on-its-plinth checks the record against the layout's figures).

Still the page's, or waiting:

- **The chapel's yellow** is 80g's `0xdcb048`, a shade off the gold spoke's wall (`QSPOKE[2].wall`, `0xd4b040`) that the order's
  own buildings wear. 80g offers to take the colour as an option if the two should match exactly.
- **The lamp head**, the **generator house** (the order's, in its lamp ward outside the gate) and **the plinth's rooms** are this
  build's.
- **The interiors set** (`xanadu-fort`): on a beacon fort the plinth's floors are this plan's sheet P (the switch room, the
  signal room, the Lamp Watch, the Chapel). The page keeps the interiors off until the set follows the option.
- **The states.** The page draws only `kept`. `damaged` (the plinth stands, the lamp dark, the cable cut at the gate) is not yet
  an option of 80g's.

## Stand-ins on this page

- **The lamp head** is a stand-in (`BC_LAMP` in `90r`): a white-metal drum with iron straps, cooling fins and a glazed face,
  drawn as live meshes so the lamp's night (`src/40-bc-lamp.js`) can turn it. **`anc_beacon_lamp` (B5) is kits/ancients' to
  build**; then the beam should come from 89n's `lhBeamGeo` rather than the page's two crossed quads.
- **The knoll** is overlaid from `ground/knoll-patch.json` (295 cells from the scale-model session's `d1c7d6682`, on
  `claude/gemini-trade-reconcile`) while that line is unmerged here. Once it is merged, the patch's cells equal the model's
  (`BC_GROUND.patched` reads 0) and the file can go.
- **The order's buildings** are stacks sized from the layout (`bc_block`: Qiblai's plinth, stack, windows, door and parapet roof
  in the gold spoke's colours). They have no interiors yet, and the Labrang is not yet the four-floor house of sheet L.
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
- **No Rim Post** on this page: it stands 17 km off on the middle volcano (`lamp.relays`), outside the near ground.
- **The ground** is the model at 2 km a pixel, bicubic, with the house's levels cut and filled into it. The knoll's faces, the
  saddle and the spur at 1:1 wait for the region (B7). The view "Over the Rift from above the fort" shows the problem: the
  spur falls gently for its first 4 km, so at dusk the Rift reads only as the far land's band on the horizon, not as a
  scarp under the lamp.
