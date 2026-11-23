# The Beacon: known issues

The page is the build's step 1, a sheet on Xanadu's page (`build.py`, `targets/house/`). What it stands in for, and what the
fort asset's owner should fold into `kits/xanadu` 80f/80g (the Strongwall session's; this build does not edit them).

## For the fort asset (kits/xanadu 80f-xa-fort-data.js, 80g-xa-fort.js): `beacon:'ancient'`

The page draws the lamp's plinth through a **shim**: `targets/house/90r-bc-house.js` replaces 80g's `xfKeep` while the Beacon's fort
is placed (`BC_PLINTH`), and draws `bcPlinth` in its stead. When 80g takes the option, delete the shim and place the fort with
`{beacon:'ancient'}`. What the option should do:

1. **The keep's place is the plinth.** On a watch fort with `o.beacon === 'ancient'`, `xfKeep` draws, on the keep's footprint
   (12 x 12 m, the keep's dressed footing):
   - three white storeys, 3.3 + 4.5 + 4.5 m over the 1.2 m footing;
   - the Chapel of the Beacon on top, 4.5 m in the gold spoke's yellow (`QSPOKE[2]`), its roof's corners gilt and a gilt finial.
     This is the fort's gilt chapel; the forts' gold rule still holds (the gate pavilion and the chapel).
   - on the roof, at 18 m, the lamp's slewing ring (2.6 m, 1.2 m high) and a yoke (2.8 m) carrying the lamp head, its centre at
     22 m.

   The figures are the layout's: `src/30-bc-layout.js` `draw.plinth`, `draw.mount`, `lamp.h`. `test-beacon.js` holds them to
   one another.
2. **The keep's fire basket goes** (`b.beacon`'s iron basket): the Ancient lamp replaces it.
3. **The cable's channel** enters under the fort's gate passage: a stone channel cover in the passage's paving (the page draws the
   channel outside the gate, `bc_cable`).
4. **The generator house is not in the fort** (this plan's change to Strongwall's 5.7): the order's Generator House stands in its
   lamp ward outside the gate, drawn by this page. Nothing for 80f.
5. **The interiors set** (`xanadu-fort`): the keep's item is a three-storey stack. On a beacon fort the plinth's floors are this
   plan's sheet P (the switch room, the signal room, the Lamp Watch, the Chapel). The page keeps the interiors off until the item
   follows the option.
6. **The states.** `damaged`: the plinth stands, the lamp dark, the cable cut at the gate. `ruined`: the shim gives way to 80g's
   own ruined keep (`o.ruined`), and the lamp head should lie wrecked on the plinth's talus, seated by its extents (core/ruins).
   The page draws only `kept`.

## Stand-ins on this page

- **The lamp head** is a stand-in (`BC_LAMP` in `90r`): a white-metal drum with iron straps, cooling fins and a glazed face,
  drawn as live meshes so the lamp's night (`src/40-bc-lamp.js`) can turn it. **`anc_beacon_lamp` (B5) is kits/ancients' to
  build**; then the beam should come from 89n's `lhBeamGeo` rather than the page's two crossed quads.
- **The knoll** is overlaid from `ground/knoll-patch.json` (295 cells from the scale-model session's `d1c7d6682`, on
  `claude/gemini-trade-reconcile`) while that line is unmerged here. Once it is merged, the patch's cells equal the model's
  (`BC_GROUND.patched` reads 0) and the file can go.
- **The order's buildings** are stacks sized from the layout (`bc_block`: Qiblai's plinth, stack, windows, door and parapet roof
  in the gold spoke's colours). They have no interiors yet, and the Labrang is not yet the four-floor house of sheet L.
- **No outside parts yet**: the terraces, byres, hives, tea garden, carters' yard and tank of sheet T0 are not drawn; the road
  and the fort road are not laid (the region's ways are the open-world session's).
- **No Rim Post** on this page: it stands 17 km off on the middle volcano (`lamp.relays`), outside the near ground.
- **The ground** is the model at 2 km a pixel, bicubic, with the house's levels cut and filled into it. The knoll's faces, the
  saddle and the spur at 1:1 wait for the region (B7). The view "Over the Rift from above the fort" shows the problem: the
  spur falls gently for its first 4 km, so at dusk the Rift reads only as the far land's band on the horizon, not as a
  scarp under the lamp.
