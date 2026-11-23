# settlements/gihon: Gihon, the Lower Lake's garrison town

The town of 8,500 at the Opal River's mouth on the Lower Xanadu Lake's south shore (where Ōpal-Māuṭh stood), the Sultan's Mint
and the assessors' seat, the Golden Tears' home, with a walled forbidden city inside its walled square. `PLAN.md` is the site plan
and the owner's answers (2026-11-17 and 22); this folder is its steps G0-G3. Everything not from the owner or the lore is
*proposed* (PLAN.md says which).

## Build and verify

```
python3 tools/build.py settlements/gihon            # dist/gihon.html (build-inputs.json written)
python3 build.py --bake-model                       # rewrite src/39g-gh-model.js from the scale model
node test-gh-town.js                                # the town, the forbidden city, the ring, the Alph's hamlets, the Landing
KRATOR_GL=gpu python3 verify.py dist/gihon.html --assert --views "Overview,The forbidden city"
node ../../core/region/tests/test-xan-economy.js    # G1: Gihon in the Sultanate's economy (check 33)
```

The town is a target on Xanadu's page, as Kirstabal's is: `build.py` writes `gen/69g-kcity-bundle.js` (core/space, core/city and
core/hamlet with the Xanadu row by name, sealed in one closure) and `gen/69g2-gh-flora-bundle.js` (the Rift kit on today's
core/biome), then runs `settlements/xanadu/build.py --kit settlements/gihon`. The normal Xanadu kit draws it, with its opt-in
pieces read in place through `kit.json`: the lake trades (87k), the slate wall (87k2), the harbour and the white dress (extra/88f),
the lake craft (88d), the works and the customs house (88g), **Gihon's own pieces** (`kits/xanadu/extra/88h-xa-gihon.js`: the
Mint, the assessors' hall, the treasury, the temple's gold-and-opal dress, the violet dress), and **the Xanadui fort asset**
(80f/80g) for the forbidden city's wall. The ground's library sets are Kirstabal's pack, read in place (`packFrom`).

## How the town is made

| Fragment | Tag | What |
|---|---|---|
| `src/39g-gh-model.js` | [G data] | GENERATED (`--bake-model`): the scale model round Gihon, the Landing, the Alph and Strongwall, px 900..1004 x 1530..1645, heights over the lake (-1,685 m) and its water |
| `src/40-gh-ground.js` | [G data] | `GH_GROUND`: the frame (origin px 955.7,1607.9, the tune's place), the shore frame, the apron as designed (30 m a km) blended into the model past 4 km, the Opal River's valley and channel, the forbidden city's terrace (`setTerrace`), the two moats (`setMoats`) |
| `src/41-gh-town.js` | [G data] | `GH_TOWN.make`: core/city's irregular square (`KCITY.grid`, 1,060 m, eight cells, the slate wall and Chiang Mai's moat, four named gates), core/city's steps 6-11 in the blocks, twelve garden squares, the quarters outside the walls (a second instance); **the forbidden city**: a second `KCITY.grid` square in the four south-east cells, levelled on its terrace, its moat, its wall the fort asset's ward (`XFORT.plan` on the square's corners, raised to a royal wall, two gates), its pieces in its cells; the harbour, the river front and its quays, the customs house, the bridge over the Opal River |
| `src/42-gh-ring.js` | [G data] | `GH_RING.make`: Gihon's ring (four farming villages and a ranch, drawn) and the Alph's five hamlets (records for the region), on core/hamlet's Xanadu row by name |
| `src/43-gh-landing.js` | [G data] | `GH_LANDING.make` (G3): the Landing at the outlet, two core/city instances (a bank each), two stone piers out into the lake either side of the mouth, the barge berths, the transfer sheds and the portage road's head: records for the region, not drawn on this page |
| `targets/town/89zg-gh-site.js` | [draw] | the site on the page: `terrainH`, the records seated (Kirstabal's stance), the town wall's pieces, the forbidden city's wall def (`gh_fc_wall`, drawn with 80g's curtain, tower, gate, walk and stair), the flora's mask, the fields, the wetness |
| `targets/town/90g-gh-world.js` | [web] | the sky, four ground meshes on core/drawn (town 6 m, the river's valley 12 m, the country 50 m, the far field 500 m), the lake, the Opal River, the two moats (core/water) |
| `targets/town/90h-gh-build.js` | [web] | every record by VERN.place in 400 m chunks with runtime LOD, the street trees, the empty lots (kits/construction) |
| `targets/town/90i-gh-flora.js` | [web] | the Rift floor's flora (Kirstabal's 90m) over the mask |
| `targets/town/91z-views.js` | [G data] | the views and the budget |
| `test-gh-load.js`, `test-gh-town.js` | | the node tests (tools/ktest.js) |
| `verify.py` | | Xanadu's verify plus `gihon-laid`, `walled`, `forbidden-city`, `people`, `ring-laid`, `water` |

## On the open world

`openworld/xanadu-oidong-highrift` draws Gihon's site (2026-11-22): the site `sgihon000001` at the tune's place with its ring of
five, the Landing on both banks with its two piers, and the Alph's five (with Kirstabal's lake). The Landing's records reach the
region through `bake_landing.js`:

```
node bake_landing.js            # openworld/xanadu-oidong-highrift/src/47g-site-gihon-landing.js (GH_LANDING_LAID)
node bake_landing.js --check    # fails when the written file is stale (after a change to 43-gh-landing.js or the kit's boxes)
python3 ../../core/world/bake_sites.py xanadu-oidong-highrift   # then the region's plan, its page and its verify
```

## Not here yet

`KNOWN_ISSUES.md`.
