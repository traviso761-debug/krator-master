# Krator biome kits — the contract (Oidong Valley edition)

The Oidong Valley kit (`OIDONG`) is built on the shared biome core exactly as `biomes/shighlands` and `biomes/sedesert`
are (`sedesert/BIOME-API.md` is the full contract: the host object, `waterH`, fields, `register`, `lod`, `windows`). This
file says what is different and what the kit exports.

## The region

The Oidong Valley east of the Vale of Xanadu (LORE.md 6.15): the History Monks' country, Longsong's site, reached by a hard
trek over the passes and, once reached, the safest ground on Krator. A chilly enclosed high valley at ~1600 m, ~1 atm, a
chain of still pools on its floor, a cataract at its head. Koppen Cfb, Dfb, BSk, Csa and ET (`OIDONG.KOPPEN`; from the
scale model's rasters, now read, give Cfb, BSk and Csa on the floor, D classes on the slopes, ET and EF above: `KNOWN_ISSUES.md`). SERENE before anything else (the owner, 2026-10-19): nothing here
stings, hunts or burns; the palette is pastel (the probe measures it) with one iridescent streak.

## The fields it reads

| field | from the world | how the kit uses it |
|---|---|---|
| `flat` | **new**: the pale gravel flats, 0..1 (an old lake bed's fans) | the raked flats: cloud pines leaning, peyote, stone-blooms, monk's sage, the standing stones; the ground shader rakes ripples there |
| `mist` | a cataract's spray, the valley's head | the chalice trees, tree-shade ferns, moss, moon caps |
| `wet` | rain and the pools' air | the moss woods where it is high, the meadows where it is middling, nothing much on the flats |
| `flow` | the stream | maples and bell-pod willows, iris and ferns |
| `upland`, `cold` | height above the floor, the cold | the terraces (cloud pines, tea, sky poppies), snow lotus where it is cold |
| `rock`, `slope` | bare rock, gradient | the crags; `cliff` (steep rock) zeroes every zone |
| (terrain, water) | `terrainH`, `waterH`, `mask`, `BIO.depth` | the pools: the giant lotuses stand IN the water (a `water` window, `BIO.depth` .5 to 9 m), the lotus, the lilies and the reeds in the shallows |

A world without `flat` or `mist` gets 0 everywhere (the core's default): no raked flats, no chalice trees. A first cut for the
flats is an ellipse per fan (`45-host-stage.js`, `fanAt`); for the mist, `smooth(560,120,distance to the fall)`.

## The zones (`OIDONG.zones(x,z)`)

| zone | reads | flora |
|---|---|---|
| `pool` | standing water | giant lotus (in the water); lotus pads, flowers and seed heads, iridescent lilies, reeds in the shallows |
| `shore` | the pools' margins | lotus trumpets, wisteria, bell-pod willows, cherries; reeds, iris, moss |
| `moss` | wet, in the shaded patches | maples, marble birches (in their groves), moss-ball trees, sacred figs, cherries, temple cedars, camphor laurels; moss mats and cushions, ferns, moon caps, ginseng, fallen wood, coin vines |
| `grove` | a patch field | where the marble birches gather |
| `meadow` | the open sunny floor | sacred figs, haze blossoms, cushion trees, cherries, wisteria; grass, box domes, sky poppies, tea |
| `flats` | `flat` | cloud pines leaning, moss-ball trees; peyote, stone-blooms, monk's sage, stones, the standing stones |
| `bamboo` | wet lower slopes, a patch field | jade bamboo; shoots, moss, ferns |
| `terrace` | upland | cloud pines, pagoda firs, temple cedars, bodhi; tea, sky poppies, grass, stones, snow lotus where it is cold |
| `mistZ` | `mist` | chalice trees, maples, marble birches; ferns, moss, moon caps, mossed boulders |
| `stream` | `flow` | maples, bell-pod willows; iris, ferns, moss, stones |
| `crag` | `rock` | cloud pines; nothing else |

Every zone is multiplied by `1 - cliff`. The floor's standing stones stand in groups of three, five or seven (never an even
number: the probe checks it) and are reported in `OIDONG.STONES` for the host's ground shader.

## The species (`OIDONG.SPECIES`, tagged)

| # | key | name | H (m) | holy | shared | alien | Koppen |
|---|---|---|---|---|---|---|---|
| 0 | giantlotus | Giant lotus | 5-11 | yes | | yes | Cfb |
| 1 | bodhi | Sacred fig | 14-26 | yes | | | Cfb |
| 2 | cherry | Cherry blossom | 6-12 | yes | | | Cfb Dfb |
| 3 | marblebirch | Marble birch | 18-34 | | | yes | Cfb |
| 4 | cloudpine | Cloud pine | 6-14 | | xanadu | | Cfb Dfb BSk Csa |
| 5 | topiary | Cushion tree | 6-12 | | xanadu | | Cfb Csa |
| 6 | hazeblossom | Haze blossom | 7-13 | | xanadu | | Cfb Csa |
| 7 | lotustrumpet | Lotus trumpet | 10-18 | yes | xanadu | yes | Cfb |
| 8 | wisteria | Wisteria tree | 6-11 | | xanadu | | Cfb Csa |
| 9 | chalice | Chalice tree | 16-30 | | | yes | Cfb |
| 10 | bellpod | Bell-pod willow | 4-8 | | | yes | Cfb |
| 11 | bamboo | Jade bamboo | 10-20 | | | | Cfb |
| 12 | mossball | Moss-ball tree | 7-13 | | | yes | Cfb |
| 13 | maple | Paper maple | 5-10 | | | | Cfb Dfb |
| 14 | cedar | Temple cedar | 18-34 | | | | Cfb Dfb |
| 15 | camphor | Camphor laurel | 12-22 | | | | Cfb |
| 16 | pagodafir | Pagoda fir | 14-28 | | | yes | Cfb Dfb ET |

Every species and floor plant carries `tags:{climate, aridity, abyssal, riparian, koppen, holy, shared, alien, harvest}`;
`harvest` names the wood, the edible parts, whether it is medicinal and the catalog fruit (`biomes/FRUIT.md`). The floor
plants (`OIDONG.PLANTS`) include the monks' physic and reagents: peyote, sky poppy, snow lotus, valley ginseng, monk's sage,
moon caps, rainbow brackets, the iridescent lily; `kits/crops` holds them as crop records (home `oidong`).

## What the kit exports

```js
OIDONG.build({R:2450, quality:1}) -> {trees, heroes, far, bySpecies, ..., under, tris}
OIDONG.zones(x,z)               // the zone weights a world can reuse for its own placement
OIDONG.canopyH(x,z)             // approximate canopy top
OIDONG.make(sp,x,y,z), OIDONG.grow(T,lv)   // one tree alone (biomes/WORLD.md: trees as variants)
OIDONG.SPECIES / OIDONG.PLANTS / OIDONG.HARVEST / OIDONG.PAL
OIDONG.STONES                   // the standing-stone groups the floor placed ({x,z,n,r})
OIDONG.nearestTree(sp,x,z,minH) // the nearest built hero of a species
```

The host's `lod` radii are the world's (`{hero:230, mid:560, far:2400, floor:[180,440]}` on the showcase); the kit builds hero
trees inside `hero`, mid-detail trees to `mid`, impostors to `far`.

## The library

`materials.json` maps the kit's slots onto library sets (every one reused): the cherry's, the pale and the whorled bark, the
moss and small-leaf cards, the granite and two ground layers (moss, park sand). Without the pack the kit runs on its
procedural canvases. The marble birch's bole is always the kit's own painting.
