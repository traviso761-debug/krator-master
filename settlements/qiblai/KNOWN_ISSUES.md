# settlements/qiblai: known issues

- [ ] **The people by ring are off the plan's table** (estimated per building, `QC_PEOPLE` in `targets/city/89zq-qc-site.js`):
  about 11,800 against ~12,000, but not by ring: the clergy ring holds ~3,600 (plan 2,400: its blocks fill with colleges), the
  kora ~1,450 (plan 3,000: the hostels and halls count only their staff); the lay rings ~6,350 (plan 6,000) since the fade took
  more gardens (84 garden blocks, 72 courtyards). `verify.py` reports it as a budget. To calibrate with the owner: the people
  a building holds, the fade's table (`QC_GARDEN`, `QC_COURT`), the infill's gaps. The Xanadu kit's share of the lay houses is
  28.6 % (the owner: 33 %): the courtyards clear more of its larger houses than of Qiblai's rows.
- [ ] **The meditation gardens' flora: no gaps left, three notes** (`targets/city/90p-qc-flora.js`, `window._gardensFlora`:
  182 plants, `gaps` empty, 2026-11-12). The crimson tree is Opal Valley's fire-opal breaker crown (garnet to harlequin orange,
  not a pure crimson); the low plants (the Rift Rim's cushion anemone, the Vale's reeds, Opal Valley's prism fern and opal
  pads) are drawn from those kits' registered items by a copy of their floor passes' few lines (`QC_FL_PUT`), since their
  planters are not exported: if a kit renames an item, its plant is missing (`gaps: 'missing put.<name>'`). High Rift's plants
  place only as its whole grid (HRIFT.buildRift) and are not drawn on. Opal Valley is merged in from
  `claude/opalvalley-biome` (not on main yet).
- [ ] **The flora is a stand-in.** Xanadu's page carries the Vale of Xanadu biome (ginkgo, cloud pine, flame cypress, cacao...),
  bound here with the city's own mask (the country, the gardens, the odd yard tree) and a wet, lowland climate; the site's Af
  lowland biome kit is still to bind (PLAN.md Q7b). The country's plants thin out far from the LOD origins.
- [ ] **The walk-in rooms build when the camera comes** (`targets/city/90t-qc-interiors.js`): the council chamber takes ~0.5 s, the
  assembly hall ~0.1-1.3 s, the sanctum ~0.3 s, the hostel ~0.1 s on the main thread, a hitch the first time each is reached. The
  furnisher (kits/interiors) is brittle at these rooms' size, found 2026-11-15: on its 0.2 m grid the council chamber's aisle, at the
  Hall of the Decree's very place, sealed the room and nothing fitted (shifted a few metres it furnished); a fixture 0.5 m from
  another closed the gap on one side of a symmetric room; a required piece with no fit re-furnishes the room up to 51 times (minutes
  in a 1,000 m2 hall). The city therefore takes the default grid, caps the candidates (`perType` 3) and the passes (2, 4 backtracks),
  keeps a metre between fixtures, and furnishes the sanctum as an antechamber (its shrine is the altar). To report to kits/interiors.
- [ ] **The lots' interiors are guessed from the drawing** (`targets/city/90u-qc-lot-interiors.js`, kits/qiblai `89q5s`): the
  shell is the biggest storey stack (or ground block) a builder raised from the ground, with the stacks raised on it as its upper
  storeys (at most four); its street door is the middle of that block's front, which is not always the drawn door's place (a
  Xanadu tenement's shop arches, a corner house); the stair (or, in the smallest houses, a ladder) is the planner's, not the
  drawing's; the doors stay the kit's locked doors, so a room is reached by flying in. Storeys on terraces set back from the
  main block (`qnTerraces`) keep no interior.
- [ ] **The rooms' fancy surfaces are owed** (core/materials/PROMPTS-NEEDED.md section 43): the painted murals, the mandala ceiling
  coffers, the temple rug, the beaten gold; today the library's wash, lacquer, wool rug and hammered gold stand in.
- [ ] **The river is a ribbon.** Nahr ash-Shalalat is a flat water plane in a cut channel; its cataracts as core/water flow, and
  the ground from the open world's cut (`cut_site.py`), are still to do (PLAN.md Q7b). The country is a gentle plane.
- [ ] **The inner gates sit on the upper terrace** with an ashlar block under them; the avenue's climb through each gate is the
  ground's slope, not a stair (`qb_terrace_stair`, PLAN.md Q7a, is not built yet).
- [ ] **The page names its build `erewhon`** in core/host and core/tags' registry when `window.CITY` is set (Xanadu's
  `99-start.js`, `91t-xanadu-tags.js`); the city pre-makes `KTAGS.page` as `qiblai`, but the host's label stays Erewhon's until
  Xanadu's page takes a name from its target.
- [ ] **Life (Q7e), the open world (Q7f), the Godot export and the gallery (Q7g)** are not started.
