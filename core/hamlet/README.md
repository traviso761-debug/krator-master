# core/hamlet: small settlements (villages now, nomad camps later)

`PLAN.md` holds the plan (H0-H6) and the owner's answers. Everything here is `[G data]`: no three.js, no DOM; Godot runs
the same rules. Test: `node core/hamlet/test-hamlet.js` (each check has a negative; `--list` prints any wood phrase no
rule takes).

| Fragment | What |
|---|---|
| `10-hamlet-wood.js` | `KHAMLET.woodUse(text)`: a species' free-text `harvest.wood` as uses (timber, fuel, poles, thatch, fibre, craft, other); bracketed words are notes; `noFell` for a tree marked not to fell. `KHAMLET.woodWorks(text)`: the works it feeds (sawpit, kiln) |
| `12-hamlet-gather.js` | `KHAMLET.GATHER_KEYS` (pasture, fish, salt), `gatherCheck`, `gatherAt(api, x, z)`, `fieldCapacity(api, poly, cell)`: a biome kit's `gather` tag read without knowing its zone names |
| `20-hamlet-cultures.js` | `KHAMLET.CULTURES`: a row per building kit (the religious, civic, store and warehouse keys, houses by class, works by focus, the boxes of buildings the kit lacks). `islander_east` first; `xanadu` (settlements/xanadu's kit: Longsong's three valley villages, farming and ranch, its pens, corral and dairy pending) |
| `30-hamlet-village.js` | `KHAMLET.village(spec)` -> `{census, records, lanes, green, site, error?}`; its parts `census`, `program`, `siteFor` kept apart for other layouts |

**What a host does:** pass `dims(key)` (the kit's boxes, as `core/city`'s `kit.dims`) and `ground.ok(x, z)` (dry, not a
cliff, not too steep). Register the records in `core/tags` before drawing them. A record marked `pending` is a building
the kit does not have yet: draw a stand-in at its box.

**Read in place, never copied:** `core/rand` (`KRAND`), `core/space` (`KSPACE`), `core/city/33-city-strategies.js`
(`KCITY.prim`: `frontageRun`, `huntNear`). The resource rules are `kits/resources` (`42r-res-ore.js` for nodes,
`43r-res-fields.js` for fields); a biome kit's `gather` tag is its own (the isles: `biomes/ringisles/src/57-*`).
