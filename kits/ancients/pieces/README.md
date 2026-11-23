# kits/ancients/pieces: Ancient pieces other worlds read in place

A piece here is one self-contained fragment that needs **three.js and nothing else**: no Ancients kit helper, no page global.
So any page can read it in place, whatever kit the page is built on. It is not in `src/`, so the Ancients kit's own pages do
not take it, and adding one changes none of them.

| File | What | Read by |
|---|---|---|
| `89p-anc-beacon-lamp.js` | `ANC_BEACON_LAMP` (`anc_beacon_lamp`, the Beacon's B5, 2026-11-23): the Ancient lamp head, refurbished by the Xanadui. A white-metal drum 1.6 m across and 2.2 m long, a glazed face 1.4 m across, cooling fins, trunnions; iron straps, a cable gland and brass shutters. Its beam is two crossed additive quads, as the lighthouse's `lhBeamGeo` draws it. `make(o)` returns a lamp that slews, tilts, shutters and sweeps by itself; `set()` drives it from a page's schedule. `wreck(o)` is the head thrown down, seated at y 0 | `kits/xanadu` (`build.py` names it; `80g`'s `xfPlinth` mounts it on the beacon fort's yoke, and `xfLampWreck` lays its wreck), `settlements/beacon` (its page, through `kit.json` `external`) |

The file header has the full API. Colours are plain material colours. The library's Ancient metals are not on a Xanadu page,
so no texture is taken; a white-metal set for the lamp head would be a new texture.

Checked on the Xanadu kit sheet, where the beacon fort (`xa_fort_beacon`) stands in its three states: `kits/xanadu/verify.py
--assert` covers the walks and the ruins checks (the wreck seated). In node, the head's extents, the shutters hiding the beam,
and the wreck's lowest point at y 0.
