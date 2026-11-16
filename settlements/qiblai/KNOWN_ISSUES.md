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
  storeys (at most four); the stair (or, in the smallest houses, a ladder) is the planner's, not the drawing's. Storeys on
  terraces set back from the main block (`qnTerraces`) keep no interior. The street door is the drawn one (2026-11-16) on every
  lot: a door record up to 1.3 m in front of the wall (the manor's iwan) or, for the Xanadu merchant's konak, which draws its
  way in as an arch with two plain timber leaves ajar (no door record), the arch's place (`QB_IX_ARCH`).
- [ ] **Walking in is through solid bodies made to look hollow** (2026-11-16): the kit's buildings are solid, so a street doorway
  shows its room through a depth-only pane (`QB_IX_PORTAL`: the room drawn first, at renderOrder -2, the pane at -1, the body
  after). Something drawn after the body and behind the pane (a citizen in the doorway, a leaf swung inward) is hidden there;
  the door leaves are drawn early for that reason. The walker collides only with the interiors' walls, the doors and the
  monasteries' and the temple's floors: the rest of the city is still walked through, as before.
- [ ] **A plan whose rooms miss a required piece is planned again** (up to three seeds, 90u): with the street door where the
  builder drew it, a bedroom can come out too tight for its chest; no type misses one today (41 types, 2026-11-16).
- [ ] **The rooms' fancy surfaces are owed** (core/materials/PROMPTS-NEEDED.md section 43): the painted murals, the mandala ceiling
  coffers, the temple rug, the beaten gold; today the library's wash, lacquer, wool rug and hammered gold stand in.
- [ ] **The river is a ribbon.** Nahr ash-Shalalat is a flat water plane in a cut channel; its cataracts as core/water flow, and
  the ground from the open world's cut (`cut_site.py`), are still to do (PLAN.md Q7b). The country is a gentle plane.
- [ ] **Every building has its interior now (2026-11-16), with these limits:** the shrines' chapels are seen through their window,
  not walked into (2.2 by 1.8 m); the chortens and the kora's arcades are solid or open, with nothing inside. Every city gate goes both ways
  (2026-11-16, the owner: "make gates go both ways"): a terrace stair (`qb_terrace_stair`) runs down its lower side, 2 m to 6 m
  at the inner rings and 7 to 35 m from the outer wall to the country (the outer stairs are long: the 35 m one runs about 107 m, landings every
  3 m of rise), out along the avenue; they stand on solid ashlar, not fitted to anything already there. The wheel houses, the
  great wheel and the monasteries' and markets' courts are floors to the walker; the rest of the open ground is the terrain.
- [ ] **The oilfield and the mission are drawn by Verge's YKIT bundle** (gen/69y-ykit-bundle.js, made by Verge's own build
  function; 2026-11-16): the Locus builders' small catalog props (lanterns, jars, the pieces Verge's furniture glue places
  through core/furnish, in the yuni, abyss and post-apocalyptic cultures the page's catalog bundle does not carry) are left
  out (`furnishAt`, `FURNISH` answer null in the bundle). Their interiors (2026-11-16) are the interiors kit's own sets
  (sets/locus.js, sets/yuni-town.js) for 30 buildings, plus a room each for the mission's school and bathhouse (no set item);
  the bell tower, the gatehouse, the tanks, racks and pumpjacks hold none; a few middle stilt houses' kitchens find no hearth
  that fits (the verify allows 8 rooms short). The night glow (YKIT.glow) is not baked. The pumpjacks nod (Locus's 76-locus-anim.js, in the bundle as YKIT.anim, since the second
  pass). The page's size: the Qiblai pack is written beside the page (kit.json `packSide`, `xanadu.tex.qiblai.js`, 5.2 MB),
  so the page is 10.3 MB of its 16 MB cap; the artifact takes that file too.
- [ ] **The town's electric light** (90v; the owner, relayed 2026-11-16: "Qiblai will be electrified along all major avenues and
  in buildings except in poor areas ... just enough to use the cut of oil they get from Yuni"): the Prismarchy's generator
  house by the south road feeds a pole line up the south gate's stair and along the four major avenues (a lamp on every pole,
  one hung across the street at every other, the wire strung through each gate's arch), and along the kora's outer side; the
  lots' rooms with a wealth of 0.5 or more and every great room have ceiling bulbs (the poor's houses and the monks' quarters
  none). One pool of eight point lights follows the eye (the count fixed, so nothing recompiles): the room bulbs within 30 m,
  day and night (a room's own counts nearest: the indoor glow, warm over 9 m), and by night the street lamps (warm, 24 m;
  `?hour=21` opens the city by night); the rest stay bright bulbs. The lights pass through walls (no shadows). How the wire reaches each avenue from the feed is not drawn (each
  avenue's run starts at its outer end). In Godot (godot/tests/qiblai/lamps_test.gd; the spike's qiblai case) the street
  lamps and the room bulbs of the eleven lit houses the export places come through as krator-lamps, lit at run time by the
  same pool (krator/lamp_pool.gd, KratorLampPool: eight lights to the nearest lit, by the Atmos clock's hours); the wires (a
  line set) do not come through, a white sky piece of the page's lands near the region's camera, and a room's inner walls
  were not seen in a render from inside (export gaps).
- [ ] **Life (Q7e) is in, without the banners** (2026-11-16, `targets/city/91l-qc-life.js`): 1,436 people on Verge's rigs (read in
  place from `settlements/verge/src/77-verge-rigs.js`, procedural, no assets) and a caravan of six camels; the prayer wheels turn.
  Open: the Rainbow Temple's banners do not move yet (they are merged into the kit's batches); the people are not
  core/charactermodels' figures (those need megabytes of pieces: the page is at 10.3 MB of 16); no one prostrates on the kora;
  the walkers are drawn but not on core/simulation (no needs, no homes); the kit's old static figures (`xnFolk`: a cylinder and a
  ball) still stand at some doors and look poor beside the rigs; a walker can brush a monastery's gate flight where it juts into
  the street.
- [ ] **The open world (Q7f), the Godot export and the gallery (Q7g)** are not started.
