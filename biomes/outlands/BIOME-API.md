# biomes/outlands: the kit's surface

The Outlands kit (`OUTL`) on the biome core, shighlands' contract (its `BIOME-API.md`) with the colony pass added. The design is
`PLAN.md` section 4 (the colony rule, the owner, 2026-11-09).

## The pages

| Page | Build | What |
|---|---|---|
| `dist/outlands.html` | `python3 build.py` | station 1, **the Fog Wall**: one slope from the fog belt (3.5-4.4 km) down to the gem shoulder (2.3 km), the four colony types that live on it |

`verify.py dist/outlands.html --assert` checks it (the colony checks are `src/98-host-views.js`'s).

## The colony pass: `OUTLCOL` (`src/48-outl-colony.js`, [G data])

Plain maths on core/rand and core/space; the node test is `tests/test-colony.js` (`build.py` runs it first).

```js
const M=OUTLCOL.create({seed, box:[x0,z0,x1,z1], cell:220, p:.75, types:[{key, reach:[r0,r1], share}],
                        allow:(type,x,z)=>0|1|2, seamW:[2,8], warp:25, warpScale:1/180});
M.colonies            // [{id, n, i, j, type, x, z, age, R}]: one per cell by chance p, seeded on its type's core
M.at(x,z,out)         // {c, c2, level, d, u, gap, seam, ring}: the owner (least power distance d^2 - R^2), the runner-up,
                      // the distance to their border, whether the point is on the seam
M.seamWidth(a,b)      // the pair's seam width, 2-8 m, symmetric
M.records()           // the colonies as core/tags-ready records
```

`allow(type, x, z)` is the host's ground for each type: 2 the core (the colony feeds there; collectors, drinkers, breeders,
wardens, miners), 1 the reach (its cords only: the runners), 0 not. A territory is a weighted Voronoi clipped to that ground; old
colonies push their borders into young ones'.

## The kit: `OUTL`

| Name | What |
|---|---|
| `OUTL.TYPES`, `byType` | the nine colony types (PLAN.md section 4): forms by role, the fixed fourth role, reach, `station` (built on this page) |
| `OUTL.FORMS`, `byKey` | the station's forms: key, name, type, role, the items that draw it, `how`, tags (`colony`, `role`, Koppen, harvest) |
| `OUTL.SEAM` | the seam's own record (not a form) |
| `OUTL.allow(type, x, z)` | the station's ground for each type, from the host's fields (`fog`, `mast`, `dry`, `band`, `wadiX`) |
| `OUTL.colonyMap(R)` | the colony map alone (no drawing): the host's ground paints the seams from it |
| `OUTL.build({R, quality, pools})` | the colonies (records first) and every form by role; returns `{colonies, forms, seams}` |
| `OUTL.COLONY`, `PLACED`, `INST`, `SEAMS` | after the build: the map, the count per form, every form's `{key, role, type, colony, x, z, y}`, the seam crusts placed |
| `OUTL.formOfItem(item, label)` | the form an instanced item draws |

## What the host gives the kit

Fields through `BIO.field`: the biome core's names plus `fog` (the belt's cover), `seep`, `ore` (cached), `oreX` and `wadiX`
(exact: a copper bed is narrower than the cache's 18 m cell), `mast`, `dry`, `band`, `pit`, `butte`. The wadi pools by
`OUTL.build({pools})`.
