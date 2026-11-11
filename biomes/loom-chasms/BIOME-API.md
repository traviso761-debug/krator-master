# biomes/loom-chasms: the kit's surface (`LOOM`)

The Loom-Chasms' own kit is the region's invention, the **cable spinner** (`PLAN.md` section 4), and the slots' wall plants. The mesa
top's ground cover is the Great Chasm kit's (`GCH`), read in place. A builder draws a record; the host decides where.

| Name | What |
|---|---|
| `LOOM.drawCable(rec)` | draws one cable from its record: `{id, a, b (the anchors [x,y,z], on the drawn rock), na, nb (the walls' normals there), stage 'grown' \| 'shoot', seed, r, slack}`; a grown cable a KSPAN catenary of segments with its beard and its two anchor tubers, a shoot arching up (`KSPAN.solve(.., {up: true})`) with its bladders. Returns `{S (the span), n (segments), beards, bladders, r, tension (KSPAN.tension: N at the anchors, grown only)}` |
| `LOOM.drawCurtain(rec)` | draws a wall curtain hung from its top: `{id, p (on the drawn wall), n (the wall's normal), h, w, seed}`; returns the sheets drawn |
| `LOOM.SPAN` | the spinner's numbers: grown radius 7.5-20 cm, shoot 2-3.5 cm, slack, the canopy's band (80-150 m over a slot's floor), the beard's and bladders' spacing, the cable's density (a third iron-silica fibre) |
| `LOOM.PLANTS` | `cablespinner`, `beardmoss`, `curtain`: name, tags (climate, aridity, abyssal, riparian, Koppen, harvest), the items that draw each |
| `LOOM.plantOfItem(item)` | the record an instanced item belongs to (the inspector) |
| `LOOM.KOPPEN`, `LOOM.BARREN` | the polygon's classes by area, and the ones nothing grows in |

Items: `cable`, `shoot` (unit cylinders along +y, stretched along a span's segment), `bladder`, `tuber`, `beard` (hanging cards),
`curtain` (a sheet hung against a wall). Materials from `materials.json` (`bark.cord.braided`, `organic.flesh.cells`, `organic.pleat.skin`,
`card.beard`, `card.moss.hanging`); procedural fallbacks without the pack.

## The host's side (station 3)

`src/45d-host-drawn.js`: `drawnH(x, z)` and `drawnRay(o, d, far)`, the ground as drawn (its own triangles), the ray bucketed by the
ground's cells. `stations/loom/86-host-slot.js` finds the anchors with it, solves each span before it is a record (a span through the
drawn rock is not grown), registers every cable in core/tags, then calls the builders.
