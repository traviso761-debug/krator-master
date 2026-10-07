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

On the page: **T** inspector, **C** cut-away (a carved def's rock opens on the camera's side, showing its plan), **N**
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
| `40-zj-cave.js` | the cavern host: a carved def declares its VOID PLAN in its own frame (`cvMass cvRoom cvTube cvHall cvStair cvShaft cvTrench cvMonolith cvDoor cvWell cvFixture`); `core/terrain/39-core-cavern.js` carves it, writes its floors to `core/walk`, and is meshed by chunk; the rock material blends the finishes and the tubes' Raufarholshellir colours |
| `41-zj-block.js` | the cavern test block (P2): a tuff block, a carved front, rooms, a skylight, a stair down to a lava tube |
| `81-sky.js` | the standard Krator sky, vendored (`--vendor-check`) |
| `89-rows.js` | the sheet's rows by family |
| `90-scene.js` | renderer, sky, ground, layout, `buildWorld()` |
| `91-probe.js` | `window._api`, `hostChecks()` and `hostNegatives()` |
| `91f-furnish.js`, `91n-night.js`, `93-anim.js` | catalog furniture (`core/furnish`), lamp halos and the light pool, the clock and smoke |
| `92-camera.js` | views, orbit, walk, inspector, polygon tool |

The Zeijani's vocabulary lives in the shared modules (P1): the `zeijani` culture and its seven trades in `core/tags`, the
`zeijani` socket pack and its `spiralarch` emblem in `core/sockets`, the furniture in
`kits/catalog/krator-master-furniture-zeijani.js`, the room kinds (`kiva brewery lab cell ossuary cistern guardroom`) in
`kits/interiors/sets/zeijani.js`.
