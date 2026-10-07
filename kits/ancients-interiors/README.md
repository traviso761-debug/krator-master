# Ancients interiors

The interiors of the Ancients' great ships, as a kit: backported from Noah's Regret (2026-10), where they were
first written for the arcology ship. It sits on `kits/interiors` (rooms, the placer, the audits) and the master
catalog (`kits/catalog`, its pieces), and adds what a ship needs that a town does not:

- **The ship's room kinds.** Sick bay, chart room, strongroom, armoury, brig, sail loft and laundry as
  `kits/interiors` programmes (`install()`): what each must hold and what it may take. With the arcology's own
  interior set (`kits/interiors/sets/noahs-regret.js`: crew quarters, bunkrooms, the mess) the placer furnishes
  every room of the ship.
- **The ship's rooms and cabins as shapes.** `SHIP_ROOMS` is the roll of a large vessel's working and officers'
  rooms; `shipRoom()` makes one a trapezoid (the frames are radial) with its door to the corridor and its glass on
  the hull; `cabin()` makes a cabin of a class width, furnished by who lives there (`CABIN_CULTURE`).
- **The halls as recipes.** A ship's big rooms are not left to the placer: a recipe sets the pieces out the way a
  ship would. Fourteen: the crew mess, the grand dining hall, the greenhouse, the engine room (its engines left to
  the host on reserved floor), the bridge, the officers' hall, the chart deck, the chain locker, the store hall,
  the drill hall, the gallery, the stern lounge, the plaza and the quay. Each works at any size (fit or skip) and
  is checked by `audit()`.
- **Two dresses.** A recipe names roles; the dress gives the pieces. `ancient` is the arcology as the Ancients fitted
  it (moulded benches, refectory runs, glass consoles, light rings, the deck fittings); `occupied` is the same halls
  as the pirates hold them (long tables, scrap benches, drop lamps, banners, market stalls on the plaza).

The Ancient deck and harbour fittings the recipes use (bollard, capstan, quay lamp standard, deck ventilator,
planting bed, plaza fountain, engine-room control stand, chain heap, stowed anchor) were backported to the master
catalog at the same time: the "Ancients kit extras" block of `kits/catalog/krator-master-furniture.js`.

## Files

| Path | What |
|---|---|
| `src/10-ai-core.js` | `KratorAncientsInteriors`: `install`, `SHIP_ROOMS`, `shipRoom`, `CABIN_CULTURE`, `CABIN_CLASSES`, `cabin` |
| `src/20-ai-dress.js` | the dresses: role → catalog key |
| `src/30-ai-recipes.js` | the hall recipes and `recipe()` |
| `src/40-ai-audit.js` | `audit()` |
| `src/70-ai-demo.js` | the demo sheet (not the kit) |
| `build.py` | builds `dist/ancients-interiors.html` and `dist/ancients-interiors-core.js` |
| `kit_bundle.py` | the core as text for another build |
| `verify.py` | the headless check |

## Build and verify

```
cd kits/ancients-interiors && python3 build.py
python3 verify.py dist/ancients-interiors.html --assert [--out shots] [--all]
```

`build.py` reads `kits/interiors`' core, its catalog adapter, its shell and cut-away views and its `noahs-regret`
set by path (nothing is copied), refuses duplicate or clashing top-level names, runs the port lint and
`node --check`, and loads the core in node on top of `kits/interiors`' core. The page loads the catalog by path
from `../../catalog`, like the interiors demo.

`verify.py --assert`: the core in node (`install` adds the seven programmes, once); every recipe in both dresses
builds and passes its audit, and every placement is drawn; every ship's room and cabin is furnished with its
programme met and passes `kits/interiors`' audit (inside, overlap, doors, clearance, reach).

## Who uses it

- **Noah's Regret** (`settlements/noahs-regret`): its build inlines `kit_bundle.bundle()` after the interiors
  bundle; its ship's rooms take their programmes from `install()` and its cabins their cultures from
  `CABIN_CULTURE`. Its halls are still placed by hand along the hull (`70-nr-interiors.js`): the recipes are the
  same layouts lifted out of the hull's coordinates, for the next Ancient ship.
