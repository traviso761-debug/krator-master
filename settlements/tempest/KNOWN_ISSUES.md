# settlements/tempest: known issues

## From the fort asset (kits/xanadu 80f/80g: the House's five asks, delivered 2026-11-23 in 22e3e68c2; taken in step 4c)

- **`xfDrawPlan`** draws both wards from the House's plan (their curtains, towers, gates, ranges, walks, states and the walk
  audit's record); the page keeps the utse, the barbican (its bent entrance opens south, the fort asset's west) and the talus.
- **A ward's height** (`XFORT.recY`) is honoured by the fort asset, but the House stays two defs, the inner one placed on the
  talus top: a raised ward's buildings get no rooms within one def (the shared auto bodies match blocks in the builder's
  frame). So `TEMPEST.inner()` hands out the inner ward in its own frame (its y 0); the whole plan keeps y 4.
- **The utse** is the fort's keep with the inner gate's passage through its foot (`b.passage`: in at the muster court's
  ground, out 4 m up on the inner court, a core/walk strip through). The passage is not carved: its portals' dim backs stand
  for it, as the gatehouses' do.
- **The interiors** stay the House's own set (`xanadu-tempest`, src/80v: the sheets' programmes per storey); `xfIxHost`
  is not used.
- **The Storm Tower** is the fort asset's signal tower (its fire basket and four bronze corner mirrors); the page lights the
  fire by night and flashes the mirror that faces the brow by day (90qt).

## On this page

- **The states (step 2)** are on their own sheet (`dist/tempest-states.html`): there the inner ward stands on the sheet's ground,
  not on its talus, and the violet monastery is not drawn (the Qiblai kit's `qb_monastery` has no damaged or ruined state). The
  House's own page draws it kept. A raid's breach and burnt gate are `XFORT.damage`'s choice by seed; the stable range whose roof
  burns is the House's own (80u), hashed the same way.
- **The interiors (step 3)** furnish the House's own stacks by room kind from the catalog's Xanadu sets: the blueprint's NEW
  pieces (bow racks, arrow bins, bow forms, saddle racks, the Storm banner, the gonkhang's pillars, the oath stone:
  `settlements/strongwall/tempest/FURNITURE.md`) are not in the catalog yet, so the Sword Hall is furnished as an armoury and the
  stables as stables. The violet monastery's rooms (its cells, the dukhang, the gonkhang: sheets M1-MR) are the Qiblai kit's
  interiors, which its own city draws lazily (`settlements/qiblai` 90t); they are not wired here.
- **The stair alley.** Every range against the outer curtain stands 2.5 m further in than sheets T1 and T2 draw it: XFORT.walks
  climbs a curtain 2.5 m off its line, and a stair inside a hollow range was cut off from its walk.
- **The utse is a gate tower in the plan's records** (`kind:'gate'`, `utse:true`): so XFORT.walks climbs the wall's own tower
  beside it first and keeps no room for a flight up its 25 m (as a plain tower it left the walk piece beside it to a stair
  inside the utse, cut off once the utse is hollow). A raid's damage therefore never fells its top (XFORT.damage spares gate
  towers); a ruin still brings it down to a storey or two.
- **The inner ward** is reached from the muster court through the utse's passage (a core/walk strip), and from its own
  doors and stairs (its ground is the talus top).
- **The crest (step 4)** is the near ground's colour and a few pieces on it: the terraces are bands of colour (no banks, no
  crops), the tea garden and the commons are colour only, the great tank's water is a dark surface (core/water is not on this
  page), the hives, butts, pells and targets are simple boxes and posts (the blueprint's NEW training pieces are not in the
  catalog). The near ground is 10 m a cell, so a 4 m track is drawn wider and softer than it is.
- **Life (step 4b)** is what needs no people: the herds, the mirrors and the fires. The herds are kits/fauna's procedural horse and yak (the farm group, without its detail maps or its Meshy models): 474 stills instanced by coat and pose, a dozen alive; about 3.8 M triangles where the whole herd is in view (the showcase budget is 6 M). They change field at dusk and dawn without walking there. The mirror flashes one proposed code ("all quiet"); no reply is read off the brow. The fires burn by night (`?hour=21`; the page's default hour is a morning).
- **Not here yet**: the people (the riders, the companies at drill, the horse-archery track ridden, the herdsmen: core/charactermodels' figures and the riding work, on its own branch); the relay between the brow and the Storm Tower (step 5: on the model's ground no single site sees both ends, the best misses by 21 m, and the best pair misses by 4 m on its 500 m grid; it is sited at 1:1 on the world's ground).
- **The brow lookout** stands at its pin on the far land, a 500 m mesh in one colour by height: its ground reads bare, and it is seated by its lowest corner (about 2.5 m of fall across the post). Its own ground comes with the open world (step 5).
- **The barbican** is three walls with its opening on the south side (the bent entrance); the road up to it is not drawn.
- **The utse stands 8 m out of the inner front** (the blueprint's u -63..-41), so its east half stands on the outer ward's ground
  and its west half on the talus; its storeys are counted from the outer ground (the inner court's door is on its first floor).
- **Stalls are 2.2 m** (standing stalls): at the blueprint's 2.5 m the four stable ranges, kept clear of the corner drums, hold
  284 for the 292 war horses.
- **The ground baker** is `tools/scale_ground.py` (new, 2026-11-23); Strongwall's and Thalaba's `build.py` keep their own copies
  of the same bake (theirs to move over).
- **The open world** (step 5) waits on the vertical stack: the House on the world's ground at 1:1, the lookout re-seated there and its relay sited.
