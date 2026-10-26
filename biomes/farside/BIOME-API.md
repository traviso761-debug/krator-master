# Krator biome kits — the contract (Farside edition)

The contract every kit keeps (`biomes/swbay/BIOME-API.md` is the long form): a set of fragments `50..70-biome-farside-*.js` on the
shared core (`core/biome`), its own registry (`BIO.kit('farside')` .. `BIO.kitEnd(FARSIDE)`), nothing named from a world's
engine (`build.py` greps for it). The host gives the core a binding and calls `FARSIDE.build`, then `BIO.bake()`.

## What the host provides (`BIO.init`)

The usual binding (`THREE`, `scene`, `terrainH`, `waterH`, `mask`, `obstacles`, `ticks`, `seed`, `origin`, `center`, `register`,
`eye`, `tags: 'farside'`), and these **fields** (each `(x, z) -> 0..1`):

| field | what | read by |
|---|---|---|
| `spray` | the salt the onshore wind carries: 1 at the surf, fading inland | the zones; the blades lie flatter in it; the kelp is wind-cut short in it |
| `invade` | the sea's flora's share of the ground (1 the kelp coast, 0 the land's own) | the kelp coast zone |
| `front` | the dead belt where the spray fades | the snags, the kelp seedlings, the wine weed and wrack on the dead |
| `native` | where the land's forest stands | the host's mask for `biomes/nwlowlands`; the cloud and lee zones |
| `sand`, `coral`, `rock` | the strand's beach and dunes, the spray coral's terraces and reefs, the surf rocks | eelgrass, windrows, coral thickets, sea palms; the kelp keeps off all three |
| `strand` | the wrack line | the wrack heaps |
| `graze`, `burn` | the goats' cropping, the front's burned strips | the kelp thins; the floor is cropped |
| `fog` | the sea fog and the fog belt | the fog sponges on bark and rock |
| `outrider` | the first wine weed in the native forest | the dressing of the native trees |

and `BIO.host.farside = {wind: [x, z], coastD, station}`: the onshore wind's direction (the blades stream down it).

## What the kit exports

```js
FARSIDE.build({R, quality}) -> {stands, snags, heroes, far, stipes, bladders, blades, floor:{...}, dressDead:{...}}
FARSIDE.dress(trees, {salt, quality})   // hang the sea's weed on trees another kit placed: [{x, z, y0, H, rb, crownR}]
FARSIDE.zones(x, z)                     // {spray, inv, front, nat, fog, sand, coral, rock, graze, burn, strand, kelpcoast, cloud, lee, ...}
FARSIDE.kgrid(salt, cell, accept, fn, opt)   // the kit's core/rand grid, for a host that places with the same rule
FARSIDE.SPECIES                         // the nine (tagged, with harvest and the crop each yield is filed as)
FARSIDE.DEAD                            // the dead native tree at the front (drawn here)
FARSIDE.FAUNA_PLACEHOLDERS              // the animals of PLAN.md section 5, data only (kits/fauna builds them later)
FARSIDE.STANDS                          // the stands' records: {key, x, z, y0, H, n, form, seed, lv}
FARSIDE.LOD                             // the runtime LOD ranges: tree 1100, floor 420, floorMid 900, dress 900
FARSIDE.speciesOfItem(item), FARSIDE.byKey, FARSIDE.PAL, FARSIDE.MAT, FARSIDE.canopyH(x, z)
```

## Placement (core/rand)

Every candidate is one cell of a jittered grid drawn from `KRAND.stream(KRAND.cell(seed of the pass, ix, iz))`, and every
stand, clump or dressed tree is built from its own `KRAND.hash` seed: a tile built alone draws what it draws in a full build,
and a new pass moves nothing in another. The kit's keep-clear between stands is a `core/space` grid.

## Tags

Every species carries `tags: {climate, aridity, abyssal, riparian, zone, harvest}`; `harvest` is `{wood, edible, uses, crop,
notes, fruit}` (no fruit: what is eaten here is weed, filed as crops in `kits/crops`: `kelp`, `wineweed`, `sea-lettuce`;
the materials `kelp-ash`, `coral-lime`, `eelgrass`). The works the host draws are core/tags `furniture` records of the
culture `eternian` (`86-host-works.js`).
