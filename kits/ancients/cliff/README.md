# kits/ancients/cliff: the Ancients' cliff city (KCLIFF)

The kit's cantilevered cliff city (`targets/shelf`, built 2026-09 as `targets/ledge`: pale slab layers stepping out of a cliff as an inverted ziggurat, the top
flush with the cliff top) as **records** and the builders that draw them, for any build that hangs one off its own cliff. Lifted from
Ledge (`settlements/ledge`) on 2026-11-22 when Shelf (`settlements/shelf`) took the same form; Ledge was proved unchanged (its layout,
area and census identical; every mesh on its page hashed the same before and after).

These files are **not** in `kits/ancients/src` (the kit's page concatenates that folder): a build reads them in place by path.

| File | Tag | What |
|---|---|---|
| `10-cliff-stack.js` | [G data] | `KCLIFF`: the stack's geometry (`layerY`, `widthAt`, `reachOf`, `deckBox`, `deckFloor`), the decks from a ruin table, largest-remainder shares, the area; the layout's shapes, overlap and walk graph. Node-tested by each build's test |
| `20-cliff-stack-draw.js` | [draw] | `KCLIFF.LB` (the box batch), `KCLIFF.mats`, `KCLIFF.drawShell`: every deck from its record and state, the hung pods and raking struts, the stubs and rebar, the pancaked wings, the face cores; `KCLIFF.night` (warm windows, lamps, the soffits' daylight out, on the host's clock) |
| `30-cliff-ground.js` | [draw] | `KCLIFF.rock` (KSTRATA beds and the library's grain; the Ancients' cut face in coursed blocks), `KCLIFF.ground` (a build's `groundAt` meshed near and far, sheer row pairs, KDRAWN) and `KCLIFF.road` (a road as a ribbon, switched back at its grade across the fall line, a cliff leg left as a cut ramp) |
| `40-cliff-town.js` | [draw] | `KCLIFF.drawTown`: each part to the builder its key names (the Dalab set, the Fellgang set, the Ancients' halls, a station's mouth, tg stand-ins, yards, the Travellers' wagons) |
| `50-cliff-wreck.js` | [draw] | `KCLIFF.drawWreck`: the KRUBBLE heaps (the Ancients' concrete or the cliff's own rock) and the prow's shards, seated |
| `cliff_blueprint.py` | | the sheets (site, zones, layers, the elevation, the section) and `AREAS.md` from a build's `layout_dump.js`, on `settlements/voth/palace/blueprint.py` |

**Taken by** `settlements/ledge` and `settlements/shelf` (their `build.py` lists the five fragments by path; their tests and dumps load
`10-cliff-stack.js`). After a change here: `node` both tests, rebuild both pages, GPU-verify both, and redraw both sets of sheets.
The old builder `src/89i-ledge.js` (the kit's sheet, `targets/shelf` since 2026-11-22) is untouched; it keeps its file name because every kit page carries it.