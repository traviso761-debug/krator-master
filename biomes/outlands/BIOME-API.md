# biomes/outlands: the kit's surface

The Outlands kit (`OUTL`) on the biome core, shighlands' contract (its `BIOME-API.md`) with the colony pass added; seven pages. The design is
`PLAN.md` section 4 (the colony rule, the owner, 2026-11-09).

## The pages

| Page | Build | What |
|---|---|---|
| `dist/outlands.html` | `python3 tools/build.py biomes/outlands` | station 1, **the Fog Wall**: one slope from the fog belt (3.5-4.4 km) down to the gem shoulder (2.3 km): veil, mast, copper, wadi |
| `dist/outlands-river.html` | `... --station river` | station 2, **the River**: the river's lower course to the 705 m lake under S2's wet walls: mast, river; the Valley tribe's fields |
| `dist/outlands-gems.html` | `... --station gems` | station 3, **the Gem Hills**: mesas, fins, the emerald and turquoise workings: copper, wadi, steppe |
| `dist/outlands-plains.html` | `... --station plains` | station 4, **the Plains of Runners**: the steppe's mosaic, inselbergs and tors, a salt pan: steppe, salt, wadi |
| `dist/outlands-nursery.html` | `... --station nursery` | station 5, **the Nursery Bench** (shared with `biomes/outlandgate`): nursery, steppe; the nests, the yardangs, the rim |
| `dist/outlands-house.html` | `... --station house` | station 7, **Trickster's House**: Arcoindian II (kits/ancients, read in place, ruined) and the House colony on it |
| `dist/outlands-mires.html` | `... --station mires` | station 8, **the Mires**: string bog, flark pools, palsas: mast (bog pines), river, rim |

`verify.py <page> --assert` checks each. Station 1's colony checks are `src/98-host-views.js`'s; the later stations' are
`stations/_shared/98-host-views.js`'s (the same rule for whatever types the station holds) plus each stage's own.

## A later station (`stations/<name>/`)

`station.json` names what it takes: `"use"` (the shared host fragments in `stations/_shared/`: the renderer and the field cache
(44z), the ground and its library layers (84), the rock bodies (84b), the far field (85), the sky (89), the air (89z), the water
(89zw), the build (89zx), the views and checks (98)), `"core"` (more core fragments by path: KSTACKS, KFROST, core/water's ext 54),
`"families"` (the pack's families on that page only), `"ancients"` (`{"builders": [...]}`: the Ancients kit read in place, its
clashing top-level names renamed in its fragments only). The station's own `45-host-stage.js` holds its land and one `STAGE`
record (its keys are listed at the head of `stations/_shared/44z-host-common.js`).

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
| `OUTL.TYPES`, `byType` | the nine colony types (PLAN.md section 4): forms by role, the fixed fourth role, reach, `station` (station 1's four) |
| `OUTL.FORMS`, `byKey` | every form (all nine types, 50 and 55) and the solitary decay layer: key, name, type (null: the decay layer), role, items, `how`, tags (`colony`, `role`, Koppen, harvest) |
| `OUTL.SEAM` | the seam's own record (not a form) |
| `OUTL.STATION_TYPES`, `SIZE`, `SHARE`, `REACH`, `CELL`, `SEEDS` | the page's colony types and the colony pass's options (the host sets them before the build; station 1's four by default) |
| `OUTL.allow(type, x, z)` | the ground for each type: a later station's zone fields `z_<type>` (over .5 core, over .15 reach); station 1's own rule from `fog`, `mast`, `dry`, `band`, `wadiX` |
| `OUTL.colonyMap(R)` | the colony map alone (no drawing): the host's ground paints the seams from it |
| `OUTL.build({R, quality, pools, decay})` | the colonies (records first) and every form of the page's types by role (60, then 62's `placeMore` for the five later types); with `decay`, the solitary decay layer (`buildDecay`); returns `{colonies, forms, seams, decay}` |
| `OUTL.COLONY`, `PLACED`, `INST`, `SEAMS` | after the build: the map, the count per form, every form's `{key, role, type, colony, x, z, y}`, the seam crusts placed |
| `OUTL.REGION_KOPPEN` | every class a form may be tagged with (the seven stations) |
| `OUTL.formOfItem(item, label)` | the form an instanced item draws |

## What the host gives the kit

Fields through `BIO.field`: the biome core's names plus `fog` (the belt's cover), `seep`, `ore` (cached), `oreX` and `wadiX`
(exact: a copper bed is narrower than the cache's 18 m cell), `mast`, `dry`, `band`, `pit`, `butte`. A later station adds its zone
fields (`z_<type>`) and what its roles read: `nest` (the nursery's nurses and drinkers), `shore` (a water's edge), `salt` (the pan),
`stone`, `near` (the carpets and the pool forms drawn near the eye only), `deadwood`, `carrion`, `dark` (the decay layer). A field the
host does not give reads 0. The wadi pools by `OUTL.build({pools})`.
