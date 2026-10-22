# The dam basins (an overlay)

The drained beds of the north basin's two dam lakes: an **overlay**, which owns no ground and lies over the biomes that
are there (n semiarid; Korona on the east bed). `PLAN.md` is the plan; `biomes/nsemiarid/PLAN.md` sections 2, 3 and 5
are why it looks as it does.

## The build

```
git lfs pull --include="settlements/port/tex/*"    # the port kit's texture pack is in LFS
cd biomes/dambasins
python3 build.py                                   # every station: dist/<station>.html (+ its .tex.port.js sidecar)
python3 verify.py dist/port.html --assert --views "The old port from the bed,The moored hulks" --out shots/x
python3 build.py --vendor-check                    # the adapted copies of the port kit's fragments, against the kit's
```

The engine is the **Ancient Port kit** (`settlements/port`), read in place the way Hook reads it (`build.py` is Hook's,
adapted): its fragments, its core lists and its texture pack, plus core/rand and core/terrain's basin (`KBASIN`) and this
build's own fragments:

| fragment | what |
|---|---|
| `src/71-port-terrain.js` | an **adapted copy** of the kit's terrain: the bed's ground for the natural coast (`DB_NAT`), the bed's colours (`dbGroundTint`), and on a dry page no sea, no underwater fade, no port scrub |
| `src/80-db-bed.js` | the bed in the kit's frame (y = 0 is the old full level): the land, the old line, the ring, the fast-drain slope, the recession, on `KBASIN`; its colours |
| `src/81-db-hulks.js` | the hulks aground: every vessel's builder wrapped so its hull is pitched and listed to the ground under it and its keel buried in the silt (a pose folded into the kit's `kput` and the vessel's group; no kit file changes) |
| `src/89c-db-ground.js` | wraps every registered vessel, once they have all registered |
| `src/92-camera.js` | an **adapted copy** of the kit's camera: on a dry page its floor is the ground, not the sea |

Stations are targets: `targets/port` (station 1, the old port on the 900 m line). `verify.py` runs the kit's invariants
(imported) and the overlay's own: no sea, the decks on the old line, the ring under it, the bed falling to the sill, the
hulks aground, each with a negative.
