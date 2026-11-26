# Krator biome kits: the contract (rift rim edition)

The rift rim kit (`RRIM`) is built on the shared biome core as `biomes/ebadlands` is (its host was the starting point: the
station lands, the kin rows, the variants, the stage). `biomes/sedesert/BIOME-API.md` is the full contract (the host object,
`waterH`, fields, `register`, `lod`, `windows`, `BIO.strata`). This file says what differs and what the kit exports.

## Three biomes on one kit

`RRIM.biome('n' | 's' | 'w')` picks the rim the next build places (`PLAN.md` section 3):

| | `n` the glass rim | `s` the black rim | `w` the veiled rim |
|---|---|---|---|
| Shape | vertical: columns over still lakes | low: carpets, cushions, rosettes | hung and patched: veils in fog, planted stands |
| Own trees | frost frill, bell fir | lantern lobelia | mist frill, lobe larch |
| Own floor | glass cane, lenswort, starberry, algal domes, prism heath (teal-orange) | sun rosette, sailwort, cushion anemone, rimroot, iris lichen, snowblood, prism heath (rust-magenta) | mist cup, moor sponge, veil thread, prism heath (gold-magenta), Dalab's fields |
| Borrowed (read in place) | the Rift's beard tree, cloud tree-fern, monkey-puzzle; the S highlands' crozier | the Rift's giant groundsel, peak pine | the SW lowlands' tier cedar, cork oak, bay laurel, veil willow; the S highlands' coilbark, spiral aloe; the Rift's stone pine, fan tree |

A species carries `rim: {n, s, w}` (how much it belongs to each); `RRIM.rimK(S)` reads the page's. A species of another rim grows
nothing. The floor's planter is the rim's (`60`), and so is the prism heath's palette.

The borrowed species are never copied: a station's `station.json` names the kits (`build.py` slots their species and trees in their
own registries) and its `LAND.kin` names the rows; `87-host-kin.js` grows each with `BIO.kin` and the source kit's own builder.

## The fields it reads

| field | from the world | how the kit uses it |
|---|---|---|
| `cold` | 0 at +16 °C mean (the great lake's basin) .. 1 at -14 °C | the main axis: shore, montane, alpine, ice |
| `wet` | rain, the water's shore | the bogs, the lake shores, the shallows |
| `rock`, `slope` | bare rock, gradient | cliffs (nothing roots), boulder fields |
| `flow` | the water's shore (core/water's fields, 89z) | the lake zone |
| `barren` | the ice cap, the airless crest | nothing grows |
| `snow` | where snow lies | nothing roots on deep snow |
| `fog` | **this kit's**: the cloud belt the W rim lives in | the mist frills, the bogs, the veils on the boulders |
| `farm` | **this kit's**: Dalab's fields on the basin plain | the crops; the hedges of bay laurel round them |

`fog` and `farm` are 0 where a host does not bind them (`BIO.field`).

## The zones (`RRIM.zones(x,z)`)

| zone | reads | |
|---|---|---|
| `shore` | cold < ~.3 (over +7 °C) | the basin plain and the warm lower edges |
| `montane` | cold .24-.64 | the glass forest, the cloud belt, the S rim's krummholz |
| `alpine` | cold .54-.88 | the high meadow, the black barrens, the fellfield |
| `ice` | cold over .82, or barren | nothing |
| `lake` | the water's shore | sedge, glass canes, willows |
| `cliff` | steep bare rock | nothing (every zone times 1 - cliff) |
| `tree` | under the tree line | where a tree can stand |

## What it exports

`RRIM.SPECIES` (5 tree species, tagged, with `lineage`: the Rift species each descends from), `RRIM.PLANTS` (the floor's 18),
`RRIM.biome(r)`, `RRIM.build({R, quality, rim})`, `RRIM.buildTrees(R, q, {records})`, `RRIM.buildFloor(R, q)`, `RRIM.make(sp, x, y, z)`
and `RRIM.grow(T, lv)` (one tree alone: the variants, and `BIO.kin` from another kit), `RRIM.zones`, `RRIM.nearestTree`,
`RRIM.canopyH`, `RRIM.night(k)` (the lantern lobelias' glow), and the switches `RRIM.WINTER` (the bell firs' bells closed: the
winter seed), `RRIM.AUTUMN` (the lobe larches turned), `RRIM.WIND` (the wind the sailwort turns edge-on to).

## Pages

`python3 build.py` builds station 1 (`dist/riftrim.html`); `--station <name>` the others; `--all` every one. Each station's land is
`stations/<name>/44w-host-land.js` on `src/44v-host-landlib.js`'s `rimLand()`: its ground, lakes, river and falls, and its climate
from the scale model 5.1 numbers at its site (`PLAN.md`, "On scale model 5.1").
