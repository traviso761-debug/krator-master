# The Labyrinth: known issues

- [x] **The flora is the Labyrinth's own** (2026-11-12, `src/50`-`70`, `LABY`; README.md, "The flora"). The NW lowlands stand-in
  (grass trees, banksias, she-oak) is gone: the mammoth steppe of PLAN.md section 3 on `core/biome`, one profile a station
  (`SITE.flora`). **Still open:**
  - the silver birch wears the summer row of `card.birch.dwarf` (round dwarf-birch leaves) and the wild melon's fruit is plain
    colour, until `card.birch.silver` and `surface.melon.rind` are delivered (`core/materials/PROMPTS-NEEDED.md` section 44);
  - the wild melon still has no name (PLAN.md section 3: TBD); the kit calls it "the sweet fall";
  - the birch and poplar crowns read thin from close by (a near crown is 30-60 cards); a fuller crown wants more twig spots, not
    bigger cards, to stay held;
  - the PLAN's other ground the animals make (trails, wallows, bone yards, rubbing rocks) waits for `kits/fauna`; dung is drawn.
- [x] **The core attach audit** (closed 2026-11-12): its floaters were the stand-in's grass-tree spike blooms (a false positive of
  `BIO.attachAudit` on long rods, still parked in `TODO.md`) and the stand-in's growth pass's blooms. The Labyrinth's own flora draws
  neither: its crowns are held by their limbs inside `BIO.tree` scopes, with measured `stems` on the crown cards, and the audit
  reads 0.00% floating on every station.
- [ ] **No animals yet.** The megafauna wait for `kits/fauna` (PLAN.md section 4); no herd, trail or wallow is drawn.
- [x] **The root mask let plants root under a beck** (2026-11-12, `src/45-host-stage.js`): on rocky ground (rock .35-.6) it returned
  its thinning before the water tests, so a steep bank's plants stood 1.1-1.4 m under the Paddocks' beck. The rock now only scales
  the result.
- [x] **Hazards** (2026-11-11, `src/89h-host-hazards.js`, core/hazard). 178 records:
  - **fall:** every stack's and knob's rim (a 6 m band of boxes along the top outline, so a top's middle is safe), the torn bridge ends, the Hall's broken upper slab and its sheared column;
  - **slip:** the Kimr's rope bridge;
  - **drown:** the pond and the river.

  A host check probes rim, middle and pond, with a negative control. **Still open:** a charge (a herd that runs, a Two-Snout's dropped rock) waits for `kits/fauna`'s herds (PLAN.md section 7, amendment 2).
- [x] **The Hall's materials "drew near-black"** (resolved 2026-11-11). Not a material fault: the kit's own materials, measured by
  readPixels on an 800 x 600 frame, give the Hall's face 53,57,59 against the floor's 124,117,75. The ruin palette (`MAT.ac*R`, the
  darkened instance colours) is toned for the kit sheet's brighter lights. The earlier "near-black" probe readings came from a
  1 x 1 drawing buffer: with the browser pane hidden the window is 0 x 0, so set `renderer.setSize(800,600,false)` before probing.
  `src/89g-host-gate.js` now only clones the kit's materials and lifts their colour 1.7x (`?lift=1` for the kit's own; 2.2x blew the sunlit cells white).
- [x] **The far walls are bedded** (2026-11-11, `src/85-host-far.js`). From 1,700 m up their colour takes KSTRATA's beds (the Rift's
  recipe with its red taken out, dipping east). **Still open:** the walls are the model's 2 km cells with noise spurs and gullies,
  so their shape is soft; their real relief waits for the open world's cut of this region.
- [x] **The knobs, the stacks and the Hall's decks are overgrown** (2026-11-11; the kit's own growth since 2026-11-12, `src/65`,
  `LABY.dress`): lichen plates on the walls, moss, grass, wormwood, cushions, juniper and dwarf birch on the ledges, a few young
  birches in the joints (not on the dry Mesas), `?dress=0` to leave them out. No hanging curtains: the steppe has none.
- [x] **The Hall read as a black block in the hero view** (2026-11-11). Two causes:
  - **The light:** at 11:00 the sun stands north-north-east here, so the old hero view from the south-west saw only shadowed faces.
    The hero now looks from the east-north-east; the old view is kept as "The Hall from the south bank".
  - **The palette:** the Ancients kit's ruin palette is toned for the kit sheet's brighter lights, so its colours are lifted 1.7x
    on this page (`?lift=`), except the stacks' rock.
- [ ] **Stations 2-4 (2026-11-11) share station 1's stand-ins:** no animals, no Kimr (the flora is the kit's own since
  2026-11-12: the Paddocks' tall steppe and gallery woods, the Mesas' dry steppe, the Pit Chain's cold profile with its cushions,
  lichens and the tarns' natives). **The walls are KRELIEF scarps** whose rim and height step are read off the model's 2 km
  cells by hand (`stations/<name>/44z-host-site.js`); the Paddocks' bastion faces south-west, so at 11:00 it stands in shadow.
- [ ] **The Kimr's pueblo** is on no station yet (station 3's plan wants one on a bench). `kits/kimr` has the example house on
  `core/pueblo`, but it draws through `core/engine`, whose globals clash with the Ancients runtime this page carries: it needs a sealed
  bundle for a world page (as `kits/xanadu/kit_bundle.py` seals XAK) before a station can place it. The Kimr keep away from the Hall,
  so station 1 never takes one (PLAN-GATE.md section 9).
