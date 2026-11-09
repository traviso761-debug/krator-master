# core/hamlet: small settlements (villages; nomad camps are `core/camp`)

`PLAN.md` holds the plan (H0-H6) and the owner's answers. Everything here is `[G data]`: no three.js, no DOM; Godot runs
the same rules. Test: `node core/hamlet/test-hamlet.js` (each check has a negative; `--list` prints any wood phrase no
rule takes); `test-hamlet-platform.js` and `test-hamlet-trade.js` hold 32 and 34, and prove that loading them moves no
village.

| Fragment | What |
|---|---|
| `10-hamlet-wood.js` | `KHAMLET.woodUse(text)`: a species' free-text `harvest.wood` as uses (timber, fuel, poles, thatch, fibre, craft, other); bracketed words are notes; `noFell` for a tree marked not to fell. `KHAMLET.woodWorks(text)`: the works it feeds (sawpit, kiln) |
| `12-hamlet-gather.js` | `KHAMLET.GATHER_KEYS` (pasture, fish, salt), `gatherCheck`, `gatherAt(api, x, z)`, `fieldCapacity(api, poly, cell)`: a biome kit's `gather` tag read without knowing its zone names |
| `20-hamlet-cultures.js` | `KHAMLET.CULTURES`: a row per building kit (the religious, civic, store and warehouse keys, houses by class, works by focus, the boxes of buildings the kit lacks). `islander_east` first; `xanadu` (settlements/xanadu's kit: Longsong's three valley villages, farming and ranch, its pens, corral and dairy pending) |
| `30-hamlet-village.js` | `KHAMLET.village(spec)` -> `{census, records, lanes, green, site, error?}`; its parts `census`, `program`, `siteFor` kept apart for other layouts |
| `32-hamlet-platform.js` | **Opt-in** (2026-11-09; no build lists it yet). `KHAMLET.platform(spec)`: a defended village on a plinth or mesa bench (`plinth {pts, top, foot}`) or under an overhang (`alcove {line, depth, floor, height, foot}`): stepped roomblocks round a plaza, no door at the ground, ladders (`{foot, top, from, to}` node ids), kivas, and the court, pen and works below. `KHAMLET.pendingRow(name)`: the row an unknown culture gets, every key pending; `KHAMLET.platformRow(row)` fills a village row's platform and trade keys. Test: `test-hamlet-platform.js` |
| `34-hamlet-trade.js` | **Opt-in** (2026-11-09). `KHAMLET.tradePost(spec)`: a post shared by two culture rows (`cultures [a, b]`, `links`, `line?`, `caravans`): a serai straddling the line with a stall per beast and a gate on each road, the market court on the line with its boundary stones, each half's census, houses, stores and cisterns in its own keys on its own side. The `trade` focus is its own (`KHAMLET.TRADE_FOCUS`), not in `KHAMLET.FOCI`. Needs 32. Test: `test-hamlet-trade.js` |

**What a host does:** pass `dims(key)` (the kit's boxes, as `core/city`'s `kit.dims`) and `ground.ok(x, z)` (dry, not a
cliff, not too steep). Register the records in `core/tags` before drawing them. A record marked `pending` is a building
the kit does not have yet: draw a stand-in at its box. A mine whose spec has no `resource` takes the nearest node of
`kits/resources`' field in its reach (`KHAMLET.resourceFor`: `spec.kres`, a loaded `RES_GEO.load(data)`, or the page's
`KRES`; `spec.ore` names the kind); `out.resource` says which node.

**Adopting the platform village** (the Labyrinth's Kimr pueblos; the Painted Men's cliff dwellings; Pinnacle Rock
may share it): list `32-hamlet-platform.js` after `30`, pass the plinth's outline and heights (or the alcove's back wall,
depth and clearance) with the village's spec, register `records` and `ladders` in core/tags, and draw stand-ins for
`pendingKeys` until the kit lands. A Kimr or Painted Men row names `platform {room, store, kiva, greatKiva, court, pen,
ladder, roomsPer, storeys, kivas}` beside the village fields; `cells` gives each roof's level for drawing the terraces.

**Adopting the trade post** (the Great Chasm's post on the sill; any border post): list `32` and `34` after `30`, pass
the two cultures, the two roads' links and the caravan's beasts. A culture with no row comes back `pending` (its keys
`<name>-...`); a row adds `trade {serai, stall, market, cistern, store}` to name its own. `line.stones` are the boundary
stones' points; `roads` the two roads out of the serai's gates.

**Read in place, never copied:** `core/rand` (`KRAND`), `core/space` (`KSPACE`), `core/city/33-city-strategies.js`
(`KCITY.prim`: `frontageRun`, `huntNear`). The resource rules are `kits/resources` (`42r-res-ore.js` for nodes,
`43r-res-fields.js` for fields); a biome kit's `gather` tag is its own (the isles: `biomes/ringisles/src/57-*`).
