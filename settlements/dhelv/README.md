# Dhelv, the capital of the Zeijani

The Zeijani's underground city under a young lava flow on the Throne's flank: an outpost in a kipuka, a 2 km outer tube to a rolling
stone door, a braid of tubes climbing to the hub (a bottle-shaped great hall under a light well), three satellite wells, the cistern
hall and the funeral catacombs. Its buildings are the Zeijani kit's (`kits/zeijani`); the plan is `kits/zeijani/PLAN.md` (section 12
is this layout; section 14 the phases).

**State (2026-10-07): P4, the layout as data.** The page (P5), the ramblers (P6) and the Godot case (P7) are to come; there is no
`build.py` yet.

| Path | What |
|---|---|
| `src/41-dhelv-layout.js` | the layout as data `[G data]` (no THREE, no DOM): `DH` (below) |
| `tests/test-layout.js` | the layout's checks, each with a negative control; a golden digest of every node and site |
| `tests/plan-svg.js` | draws the layout as a plan: `layout-plan.svg` |
| `layout-plan.svg` | the plan, for tuning by eye (hover a line or a footprint for its id, height and grade) |

```
python3 tools/node_in_chromium.py settlements/dhelv/tests/test-layout.js                    # no node on the owner's machine
python3 tools/node_in_chromium.py settlements/dhelv/tests/test-layout.js --write --write    # rewrite the golden digest
python3 tools/node_in_chromium.py settlements/dhelv/tests/plan-svg.js --write               # redraw layout-plan.svg
```

## `DH`

x east, z south, y up, metres; the hub's square is y 0, and the flank rises east (`DH.surfaceY`).

- `HALL`: the hub. Its square is an ellipse 280 by 200 m; the light well's pool (18 m) at its middle; a ledge 10 m up round the
  north and east walls; four mouths (the braid comes in at the west).
- `PITS`: the three satellite wells: centre, radius, floor and depth.
- `NODES`, `EDGES`: the public ways. An edge has a `kind` (`tube`, `braid`, `ramp`, `stair`, `ledge`, `square`, `street`, `door`,
  `secret`), a width and a `zone`: `outer` (where foreigners may go), `inner`, or `secret` (the scouts' ways to the surface).
  The rolling stone door is the one `door` edge (`door: 'stonedoor'`).
- `SITES`: every placed def: `{key, district, x, z, ry, y, at}`. `at: 'wall'` stands the foot of a carved def's front on the hall's
  or a pit's wall (or the outpost's cliff), facing in; `'floor'` stands a def on a floor; `'ground'` places a carved def by
  itself (the cistern, the catacombs, the stores).
- `FOOT`: each key's footprint as the kit declares it (`w`, `d`, and whether the def stands on the foot of its front). The test
  reads the kit's sources and fails if one differs.
- `DISTRICTS`: the hub, the three wells, the cistern, the catacombs and the outpost, each with its anchor node, its graph distance
  from the square, its wealth (`wealthAt(distance)`: 0.9 at the square falling to 0.15 at the outpost) and the list it must hold.
- `RULES`: the numbers the checks hold the layout to (PLAN.md section 12's ranges).

## The checks (`tests/test-layout.js`)

| Check | Its negative control |
|---|---|
| the graph is connected from the outpost's gate | the portal's tunnel cut |
| every edge within its kind's grade (a ramp 15%, a stair 75%) | the processional way dropped 40 m at a step |
| the outer tube 1.8 to 2.2 km, climbing 1 to 3%, 8 to 12 m wide | a 5% stretch |
| the braid climbs 30 to 40 m over 400 to 600 m; tubes cross at two levels or more, at least 6 m apart, never at one | the ledge's west tunnel brought down to the braid's level |
| every way under at least 4 m of rock (outside the hall, the pits and the kipuka) | the outer tube raised 60 m |
| the square holds its list with room to walk: inside its edge, 3 m apart, half of it free, the lanes to the four mouths open, the stalls in the daylight; the wall's sites on the wall, facing in, clear of the mouths | the guard headquarters pushed into a shop; the kiva set in the west lane |
| every site is a kit def, its footprint the def's | the temple 8 m too narrow |
| each district holds its list; the wells 250 to 450 m out, 60 to 90 m across, 25 to 40 m deep; the cistern within 250 m; the catacombs 600 to 1,200 m out and 40 to 80 m down; the caravanserai on the stream | the south well without its smithy; the outpost without its caravanserai; the catacombs 320 m out |
| wealth falls with the distance from the square: the districts' wealth by the rule, and their homes' mean wealth never rising outward | an estate in the east well |
| the foreigners' zone ends at the stone door: the outer ways reach it and nothing past it, and the door is the only way on | a side passage round the stone door |
| the outpost's sites apart (the palisade's runs join end to end); the cliff's sites on the cliff, facing west | the barracks moved onto the timber house |
| the layout matches its golden digest | |
