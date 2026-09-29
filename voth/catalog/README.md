# Voth building catalog

Every building in Voth in one place: the structures the city generator
builds, the first-generation registry, and the new building types. They are
drawn on one orbitable, walkable sheet with an inspector and automatic LOD.

Open `index.html` from a local server rooted at `voth/`, because the page
loads `../three.min.js` and `../Claude outputs/`:

```
cd voth && python3 -m http.server 8000
# http://localhost:8000/catalog/index.html
#   ?src=voth-shops   ?fam=military   ?only=voth_tavern_b   ?lod=off|auto|0|1|2
```

## What is in it

| Source (registry file) | What |
|---|---|
| `registry/voth-housing.js` | `voth_house_poor` / `_middle` / `_rich`, 5 variants each |
| `registry/voth-manors.js` | `voth_manor` (Hlaalu, Velothi, Redoran/Mournhold) and `voth_clan_compound_b` (mudbrick yard, fortified, waterside), 3 each |
| `registry/voth-shops.js` | smithy, alchemist, clothier, trader/pawnbroker, scribe, enchanter, provisioner, potter/glassblower, 2 variants each |
| `registry/voth-taverns.js` | `voth_tavern_b`: harbour tavern, Hlaalu corner inn, Velothi cornerclub |
| `registry/voth-warehouses.js` | `voth_warehouse_b`: canal warehouse with hoist bay, bonded grain store |
| `registry/voth-civic.js` | school (Temple college, schoolhouse), generator (turbine hall, fumarole vent house), farmhouses (Velothi, chinampa, Hlaalu), governor's palace |
| `registry/voth-military.js` | garrison (Velothi fortress, harbour fort), barracks (Hlaalu, Velothi), mustering grounds, army camp |
| `../Claude outputs/krator-master-buildings-voth.js` | first-generation registry (13 entries) |
| `registry/voth-city-captured.js` + `.data.js` | **generated**: every structure the city builds, pulled from a live build (see below) |

## Structures pulled from the city

`capture/capture.py` builds an instrumented copy of the city from `../src/`
(the real `voth.html` is never touched), runs it headless, and records every
primitive each structure builder emits. That includes the ones that are hard
to find in the code: the Ordinator fortress on the Lighthouse canton, the
Palace and Temple architecture, every canton, span, causeway, landing and sea
stair, wall segments, gates and watchtowers, graves, tombs and the funerary
temple, taverns, mills (with their animated sails frozen at rest), the
monastery, town houses and compounds (with the facade pass that decorates
them joined back on), market stalls, farmsteads, and the life layer's ships,
barges and carts.

```
python3 capture/capture.py           # about a minute; rewrites the registry, data and inventory
python3 capture/capture.py --reuse   # re-export from the last run's cache
```

`CITY_INVENTORY.md` lists every captured entry with its source line in
`src/`, how many times the city builds it, and its size. It also lists what
was not captured, by fragment and by sampled call stack. About 98% of the
built fabric is captured. What is left out is vegetation and the chinampa
beds.

Captured entries are **reference geometry**, replayed from records. They
cannot be edited as parameters. To make a variation, copy the builder named
in the inventory from `src/` into a registry file as a new `ASSET`, using the
captured entry as the target to match. Each variant is one real call from
the city: the largest, then others spread down the size range.

## Colour

Palette hexes are sRGB. The city converts them before use
(`45-kit.js`: `setColorAt(...convertSRGBToLinear())`). The engine did not, so
every catalog render came out washed pale: basalt read as light grey and
copper roofs as mint. `lod.js` wraps `mat()` to convert (`KratorLOD.srgb`), so
catalog colours now match the city. The life-layer vessels carry the
city's own unconverted vertex colours, as they do in the city.

## LOD

`lod.js` wraps the engine's instance builder. Every building is merged into
1 to 4 vertex-coloured meshes, one per material family, and gets three levels
in a `THREE.LOD`:

| Level | Keeps | From distance |
|---|---|---|
| L0 | everything | 0 |
| L1 | parts at least 3.5% of the building's size (drops sills, lamps, trim, props) | 5.5 × size |
| L2 | masses at least 14% of size, in one mesh | 16 × size |

The thresholds are capped at part-size percentiles, so a level never comes
out empty. L1 and L2 also keep vertical supports (piles, stilts, columns)
that the size cut would otherwise drop, so decks never float. L2 drops
cloth (canopies, awnings, sails), whose thin posts are gone at that
distance. Switch distances use max(height, √(w·d)), so a 1 km causeway
switches at the distance a block would. Authors write nothing per building.
The one rule is to lay big masses as big primitives and put detail on top.
The whole catalog is 250 builds and 2.1 M triangles at L0. It draws in about
200 calls, and LOD brings what is on screen down to a fraction of that.

## Engine additions

These are in `../Claude outputs/krator-asset-engine.js`:
* `F.hipRoof(lx, ly, lz, w, h, d, ry, colour, family)` is a true hip roof
  with a ridge along the longer side. `F.pyrRoof` always met at one point
  and read as a stretched pyramid on any long building.
* `F.beam` now keeps its roll under rotation. Sloped slabs (roofs, canopies,
  tent sides) used to twist about their own axis when a building was
  placed at a heading that was not a multiple of 90°, by up to 1.46 m on the
  army camp. Output at 0° is unchanged.

## Tools

```
python3 shoot.py --audit [--src S]    # errors, declared vs measured size, tris per LOD level
python3 shoot.py KEY [--v N] [--lod]  # 2x2 sheet per variant (+ L0|L1|L2 strip) -> shots/
python3 shoot.py --src voth-shops     # every entry in one file
```

`BRIEF.md` is the builder brief the new entries were made to: the style
references, the hard rules (flat roofs used as living or storage space under
awnings, every side detailed, declared size = measured size), and the
look-and-fix loop.
