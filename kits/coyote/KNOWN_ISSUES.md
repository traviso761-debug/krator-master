# kits/coyote: known issues

- [ ] **The culture `coyote` is not registered in `core/tags`** (the owner, 2026-11-16: it rides along with the next
  all-builds rebuild, `TODO.md`). Until then every record's `culture: 'coyote'` is an unknown value; `verify.py`'s
  `tags-vocabulary` passes only while that is the one unknown value, and says so.
- [ ] **Texture stand-ins** (`core/materials/PROMPTS-NEEDED.md` section 53): the mud brick draws `plaster.clay_block_wall`
  (family `brick`; no wall shows it bare yet: the walls are rendered); the rugs, the shrine friezes, the turquoise inlay and
  the ostrich plumes are not drawn yet (C2, C7, C8).
- [ ] **No birds yet**: the ostrich, the runner bird and the golden bird are not in `kits/fauna` (a subsession is trying
  Tripo for them, 2026-11-16). The pens and stage houses (C2, C4, C5) will stand empty until they land.
- [ ] **The walk-reach audit runs on a 0.2 m cell** (`src/99-host-tz-cy.js`): a steep ladder is a stack of rung floors
  (`KWALKBOX.ladder`) the flood climbs by stepping between neighbouring cells, and against a wall the walker's 0.25 m radius
  leaves too few 0.4 m cells to step between. The ladders lean at rise/run 2.4 (`CY.LEAN`).
- [ ] **The ear door** is the owner's to judge in practice (PLAN.md section 2).
- [ ] **The Valley village has a yard in its middle**: `KHAMLET.platform` lays a plaza and rings of rooms round it (the pueblo's
  pattern), and puts the sunk rooms in it; Catalhoyuk had no central plaza, only middens where houses had fallen. The layout
  is core/hamlet's; a Catalhoyuk packing (no plaza, open middens, storeys by age not by ring) would be an option there, asked
  of the owner before it is written.
- [ ] **On the sheet the sunk rooms stand in the ground** (`89-rows.js` places them 2.6 and 2.8 m down, as in the yard), so
  their painted interiors are hidden by the sheet's ground plane even in the cut-away; the village's are reached by the walk.
- [ ] **`check_assembly` baselines `MISSING KCITY.stance`** on the page (`tools/check_assembly_baseline.json`, as riftrim's Fowlers
  and Icecut stations do): `core/city/33-city-strategies.js` names `KCITY.stance` (in `core/city/15-city-ground.js`) only on a
  city tune's high-stance path, which `core/hamlet` never takes; the page reads 33 alone for `KCITY.prim`.
- [x] **Emerald and turquoise nodes** are in `kits/resources` since 2026-11-16 (`node-emerald-*`, `node-turquoise-*`, the field's
  families from `geology.py --gems`). The sheet's Peak alcove village still passes its node by hand (`resource: {kind: 'emerald',
  ...}`): it stands on no map; a host on the map lets `KHAMLET.resourceFor` take the nearest node.
- [ ] **Round walls are not walk blocks**: `cy_round_room`'s ring wall is a `sector()` and the corbelled store a `lathe()`, which
  the engine's box reader does not read; a walker could pass through them. Their floors and roofs are walk floors.
- [ ] **The Peak village's cliff is a stand-in** (`cyMound` ledge, back rock, overhang, ends, in `rock.tuff`): a host on the
  map draws its own cliff (`KCARVE`) and passes the alcove's line, depth and heights.
- [ ] **A tipi's cover is not a walk block** (a `lathe()`, which the engine's box reader does not read): a walker can pass through
  it anywhere, not only at the door. Its floor is a walk floor; the door flap is a real `core/door` leaf.
- [ ] **The camps' wind is the draft row's** (`[0.7071, 0.7071]`, as the Beast Riders' row has it): a host on the map passes the
  model's wind at the camp (`KCAMP.pitch` `wind`). The pens stand empty until the birds land in `kits/fauna`.
