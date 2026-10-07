# kits/zeijani: the Zeijani building kit (in progress: P2 of `PLAN.md`)

The Zeijani are the Throne's hidden cave people (the owner's name for them since 2026-10-07; they were first called
the Cthonians). See `biomes/throne/NOTES.md`, "Peoples of the island".

- They build cities in and around the lava tubes, with dwellings carved into the tuff as spires and underground
  galleries.
- Their settlements: one capital, Dhelv (a little smaller than Yuni, its place unknown to outsiders), three cave and
  tuff villages (Mungo's size) and scattered surface hamlets.
- Their arts: fungus medicine and alchemy, and the alecap, a purple mushroom brewed into beer. In some kiva ceremonies
  they burn Ranj, the Throne's spice, as incense.

**`PLAN.md` is the build plan** (the kit, the shared cavern module, the capital Dhelv and its walk-map test; the hand-off
prompt at the top; the progress log at the end). `refs/` holds the owner's reference board (30 images; `islander port.jpg`
is the Islanders', not theirs).

## Build and verify

```
cd kits/zeijani && python3 build.py                            # dist/zeijani.html (about 11 MB: the texture pack is inlined)
python3 verify.py dist/zeijani.html --assert                   # the gate: the kit's invariants and their negatives
python3 tools/textures/pack.py kits/zeijani                    # after editing materials.json (from the repo root)
python3 tools/node_in_chromium.py core/terrain/test-cavern.js  # the cavern module's node test (no node here)
```

On the page: **T** inspector, **C** cut-away (a carved def's rock is cut 2 m above each void's own floor, a dollhouse at every level, shafts whole; the ground over a carved or sunk def opens; a built def opens on the camera's side), **N**
night, **P** polygon tool, **F** walk: the walker stands on the `core/walk` floors the plans wrote (the sheet's ground, the
carved rooms, the stairs, the tubes) and is refused where no floor lies within a step or a block stands. `?only=key,key`,
`?mat=proc` (vertex colours only), `?t=` (pin the clock).

## How it is made

| Fragment | What |
|---|---|
| `10-core.js` | error panel, the PRNG (`reseed(N)`, mulberry32) and noise on `KRAND.h3` (no sin hashes), the ground hook, frame hooks |
| `27-mat.js` | the material keys over the library families (`materials.json` -> `tex/`): the carving rocks and their finishes, constructed and wooden surfaces, the culture's sheets; the palette (PLAN.md section 10); cloth, cut-away and flicker hooks |
| `30-geo.js` | the geometry engine (forked from Scyvoi's, from Post-Apoc's): buckets per material in world space |
| `36-def.js` | `defBuilding`, `place()`: every placement is a `core/tags` record before it is drawn |
| `37-zj-walk.js` | `zwItem`: a built def's interiors item to `core/walk` (each room's floor, its walls as blocks with gaps at its doors; a planned body's floors less their stairwells, walls and stairs) |
| `40-zj-cave.js` | the cavern host: a carved def declares its VOID PLAN in its own frame (`cvMass cvRoom cvTube cvHall cvStair cvShaft cvTrench cvMonolith cvDoor cvWell cvFixture`); `core/terrain/39-core-cavern.js` carves it, writes its floors to `core/walk`, and is meshed by chunk; the rock material blends the finishes and the tubes' Raufarholshellir colours |
| `41-zj-block.js` | the cavern test block (P2): a tuff block, a carved front, rooms, a skylight, a stair down to a lava tube |
| `42-zj-forms.js` | the forms (domes, drums, cones, ovals, stilts, stepped lintels, arches, columns, bands of the culture's sheets, niches, dovecote holes) and `zfFixtures`, which draws a carved plan's fixtures (bed shelves, hearths, benches, pillars, basins, the kiva's burner) |
| `43-zj-wood.js` | the wooden dwellings: three huts (one with a carved back room) and the round timber house |
| `44-zj-gallery.js` | the galleries of the poor: A the spine (three levels of cells, a hearth hall, a kiva, a cistern), B the well (a spiral stair down a light shaft) |
| `45-zj-estate.js` | the wealthy estates: A the columned hall (13 rooms off a pillared hall, a court under a light shaft), B the loggia (two storeys and a lower court, 12 rooms) |
| `46-zj-built.js` | the constructed houses: a domed tuff hut, three domes round a yard, a two-storey house with a roof terrace; `zbBody` draws a planned body (walls with their openings, slabs round the stairwells, stairs, partitions) |
| `47-zj-shops.js` | the shops: twelve trades, each in a carved front (a cut with a counter, shutters, the sign in a niche; a smithy's smoke shaft) and a constructed one (a planned tuff block, an awning, the sign on the parapet), made from the trades' items; signs and awnings are `core/sockets` (the zeijani pack) |
| `48-zj-sacred.js` | the kiva (sunk under the ground: `sunk` opens the ground over it in the cut-away; its ladder is a walk strip as steep as a walker climbs) and the funeral catacombs (a stair down to the chapel, corridors lined with bones, ossuaries, the Keeper's cell); the temple cut from one rock (Kailasa: a pit round the podium left standing, the sanctum under a pierced lattice dome, cloisters) |
| `49-zj-civic.js` | civic: the council (after Kailasa, cut down into the ground: a pit down a sunken lane, the council hall left standing with its pillared chamber and a tiered tower, the pavilion, bridges of rock, lamp pillars, cloisters); the cistern hall (a stepwell under the rock: terraces down to the water, pillars, a causeway to a platform); the portal (an arched tunnel through the rock with an ornate rim, a rolling stone door in its side channel, terraced dwellings on ledges); the town hall in a rock spire (council room, records, lookout; spiral stairs cut in the rock outside the rooms) |
| `81-sky.js` | the standard Krator sky, vendored (`--vendor-check`) |
| `89-rows.js` | the sheet's rows by family |
| `90-scene.js` | renderer, sky, ground, layout, `buildWorld()` |
| `91-probe.js` | `window._api`, `hostChecks()` and `hostNegatives()` |
| `91f-furnish.js`, `91n-night.js`, `93-anim.js` | catalog furniture (`core/furnish`), lamp halos and the light pool, the clock and smoke |
| `92-camera.js` | views, orbit, walk, inspector, polygon tool |

The cavern composes a carved def's plan in phases (`cvFromItem`): masses and pits, the rock left standing in them (monoliths), the rooms, then every other void (`phase` on a void overrides). Void kinds `floor` and `block` are walk entries only (a monolith's terrace, its sides).

`core/sockets` is on the page (`37-sockets.js`, `38-symbols.js`, `80-cultures.js`, read live): `place()` fills each def's sockets with the zeijani pack. The page supplies what the packs draw with (`canvasTex`, `decal`, the `cloth` and `iron` buckets, a `paint` colour; `plane4` takes the packs' four-corner form). Shop defs are generated from their items, so `build.py`'s seed rule knows a generated family: `seed: base+i` claims base..base+99.

The Zeijani's vocabulary lives in the shared modules (P1): the `zeijani` culture and its seven trades in `core/tags`, the
`zeijani` socket pack and its `spiralarch` emblem in `core/sockets`, the furniture in
`kits/catalog/krator-master-furniture-zeijani.js`, the room kinds (`kiva brewery lab cell ossuary cistern guardroom court`, and per trade `zjshop_<trade>`, `zjwork_<trade>`) in
`kits/interiors/sets/zeijani.js`.
