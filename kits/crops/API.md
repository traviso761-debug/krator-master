# kits/crops: API

All on `globalThis.CROPS` (the fragments `10-crop-core.js`, `20-crop-records.js`, `22-crop-material.js`, `40-crop-query.js`).

## Data

- `CROPS.WARMTH`, `.ATM`, `.ARID`: the ordered band names. A range is `[lo, hi]` as indices.
- `CROPS.BUCKETS`: `{bucket: {group, what}}`.
- `CROPS.BIOMES`: `{biome: {atm, atmNote?, zones: {zone: {warmth, arid, wet?, salt?, heated?, atm?}}}}`.
- `CROPS.LIST`, `CROPS.BY_ID`: the records. A record: `id, name, bucket, also[], form, grown, warmth, arid, atm, reach, water,
  needs, home[], homeOnly, stores[], yield, card, src, colour, node, works, hazard, note` (`20-crop-records.js` says what each is).
- `CROPS.CARDS`: `{cardId: dataURL}`, in the built page only.

## Queries

A result is `{crop, how, zone}`. `how` is `wild`, `rain`, `irrigated`, `bed`, `node`, `trade` (best first, `CROPS.HOW_RANK`).
`opts`: `works` (`['dark-beds', 'sealed-beds']`), `nodes` (`['iron', 'copper', 'sulfur', 'oil']`), `trade` (dye ids it imports).

| Call | Returns |
|---|---|
| `CROPS.forBiome(biome, opts)` | every crop that fits any zone of the biome, best fit each |
| `CROPS.at({warmth, atm, arid, wet?, salt?, heated?}, opts)` | the same for a point on the axes (names or indices) |
| `CROPS.inBucket(results, name, asGroup)` | the results in a bucket, or a group when `asGroup` |
| `CROPS.pick(results, name, {seed, salt, prefer, asGroup, rainOnly})` | one result, or null: a preferred crop that fits, else a seeded draw (`KRAND`) among those that need no trade |
| `CROPS.palette(biome, opts)` | `{colours, sources}`: dye colour families the biome has; `opts.grow` adds what it could grow |
| `CROPS.canPlaid(biome, opts)` | three colour families or more, and cloth (wool is assumed unless `opts.wool === false`) |
| `CROPS.isBucket(c, b)`, `CROPS.isGroup(c, g)` | a crop's bucket or `also` matches |

Picks are deterministic: the same results, name, `seed` and `salt` give the same crop, on every machine and in Godot.

## Reading it from a build

List `kits/crops/src/10-crop-core.js`, `20-crop-records.js`, `22-crop-material.js`, `40-crop-query.js` and `core/rand/08-core-rand.js`
(in that order) in the build, as `kits/islanders/build.py` lists `RESOURCES`. Do not copy them.
