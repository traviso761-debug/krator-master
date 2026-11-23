# core/interiors: the light inside rooms

| File | Tag | What |
|---|---|---|
| `10-core-roomlight.js` | `[G data]` | `KROOMLIGHT`: the room-graph daylight table (`buildTable`: windows, skylights and open doors light a room, each doorway passes on a share of it), the room-gated light pool (`pickPool`), the per-vertex corner AO (`vertexCornerAO`). No THREE, no DOM; Godot's twin is `godot/krator/kinteriors_light.gd`. Settlements/longsong reads it in place; `kits/interiors` bundles it ahead of its core (so every page with the interiors has it: `IX.roomLight`, `IX.lightPool`, `IX.exportInteriors`, the shells' corner AO) |
| `20-core-roomlight-host.js` | `[web]` | `KNLV`: the night light volume girder, yuni, locus and mavs-refuge pasted into their `45-kit.js` until 2026-11-23 (K4 of GRAPHICS-TERRAIN-PROPOSAL.md 12d), one copy: a stacked city's lamps baked into horizontal slabs of one atlas texture, the shader hook every material calls. Its shader text is the bytes each copy wrote, so the four pages draw what they drew. `KRLHOST`: the room table as a two-row texture (the twin of Godot's `room_light_tex`) and a hook that lights a room's surfaces from it in place of the sky's ambient |

Tests: `node core/interiors/test-roomlight.js` (the table, the pool, the AO, Longsong's rooms), `node core/interiors/test-roomlight-host.js`
(each build's pasted copy, read from git, against its section on `KNLV`: the same shader text and baked bytes; `KRLHOST` against
Godot's texture), `node kits/interiors/tests/test-roomlight.js` (the interiors kit on it).

A build takes `20-core-roomlight-host.js` by name (`paths.setdefault('20-core-roomlight-host.js', ...)` in its build.py) and
keeps its own numbers, lists and names: `var NLV = KNLV.create({...})`, then `nlvTex`, `NLV_U`, `nlvBake`, `applyNightGlow` as
aliases (settlements/girder/src/45-kit.js). Change the module and rebuild the four.
