# core/city/cavern: the cavern setting (`KCITY.cavern`)

The city builder's setting for places carved into rock: a graph of ways with heights, spaces on several levels, and sites
cut into the walls, laid as plain records keyed by stable ids. The plan, the records and what Dhelv's port will need are in
`PLAN.md`.

| File | Tag | What |
|---|---|---|
| `10-city-cavern.js` | [G data] | `KCITY.cavern`: the records, the rules (rock, headroom, frontage, grade, decks, daylight), the graph and wealth, ages, the frontage run, the walk graph, edits, the carve into KCAVERN records, the export and digest, and the line-hold strategy `lineHold` |
| `test-cavern.js`, `golden.json` | | `node core/city/cavern/test-cavern.js` (`--write` after a meant change) |

**Taking it.** List `core/rand/08-core-rand.js` and `core/space/20-core-space.js` before it, then
`core/city/cavern/10-city-cavern.js`. It makes `KCITY` when it is not on the page, so a build may take this file alone
(`settlements/loj-twenny` does). No existing build lists the folder, so it moved no page.

```js
const H = KCITY.cavern.lineHold({id, world, decks, spine, spaces, sidings, civic, fill, hub, reach, heart, worn, abandoned, edits});
KCITY.cavern.audit(H);                      // {ok, problems}: every rule
const P = KCITY.cavern.carve(H, {plan});    // KCAVERN records: for (const p of P) C[p.prim](p) before C.build()
const N = KCITY.cavern.nav(H);              // {nodes, edges}: SIM.nav.layer's shape (a site's door is a node named by its id)
KCITY.cavern.exportPlan(H);                 // {format: 'krator-cavern', version: 1, ...}
```
