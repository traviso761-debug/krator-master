# settlements/tempest: known issues

## What the House needs from the fort asset (kits/xanadu 80f/80g: the owner of those files to add; not edited here)

- **`size:'monastery'`** is not in XFORT. The House is its own plan (`src/80t-tp-plan-data.js`) in XFORT's record shape, and
  80u composes 80g's builders as `xfDraw` does. Wanted: an entry that draws a plan handed in (`xfDrawPlan(P, G, o)`, `xfDraw`'s
  body on a plan instead of a size), so a host plan gets the damage states, the burnt gates, the guns and the walk record without
  80u repeating `xfDraw`'s composition.
- **A ward's height.** The inner ward stands on a 4 m talus; the builders draw at the def's ground, so the House is two defs (the
  inner one placed 4 m up). Wanted: a curtain's and a building's `y` (the plan carries `c.y` and `ward.y` already) honoured by
  `xfCurtain`, `xfTower`, `xfGate`, `xfWalks`, `xfRange`, `xfSmall`, and by `XFORT.walks` (its flights onto the utse block).
- **The utse.** `xfKeep` draws one door on its front at the ground; the utse also opens 4 m up on its back, onto the inner court
  (80u draws that door itself), and the inner gate's passage through its base is not drawn (the keep is solid). Wanted: a keep
  with a gate passage (`b.passage: {w, rise}`) and a door per face at a given height.
- **The interiors.** The set `xanadu-fort` writes its items from `XF_PLANS` (the three sizes) only. Wanted: an item from a
  host plan, so the House's ranges and the utse are furnished as the march fort's are (step 3).
- **The Storm Tower** is drawn as a plain square tower (`xfTower`, 24 m, 20 m high): its signal room's mirrors and the fire on
  its roof are not drawn (sheet T1, T2).

## On this page

- **The states (step 2)** are on their own sheet (`dist/tempest-states.html`): there the inner ward stands on the sheet's ground,
  not on its talus, and the violet monastery is not drawn (the Qiblai kit's `qb_monastery` has no damaged or ruined state). The
  House's own page draws it kept. A raid's breach and burnt gate are `XFORT.damage`'s choice by seed; the stable range whose roof
  burns is the House's own (80u), hashed the same way.
- **The breaches** are drawn by 80u as `xfDraw` draws them (its ragged courses), a copy until the fort asset's `xfDrawPlan`.
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
- **The inner ward** is reached from its own doors and stairs (its ground is the talus top): a walker cannot yet go from the
  outer ward to the inner through the utse, since the keep the fort asset draws has no gate passage (asked of 80g, above).
- **The crest (step 4)** is the near ground's colour and a few pieces on it: the terraces are bands of colour (no banks, no
  crops), the tea garden and the commons are colour only, the great tank's water is a dark surface (core/water is not on this
  page), the hives, butts, pells and targets are simple boxes and posts (the blueprint's NEW training pieces are not in the
  catalog). The near ground is 10 m a cell, so a 4 m track is drawn wider and softer than it is.
- **Not here yet**: life on the page (the companies at drill, the riders on the Maydan's track, the relay's mirrors), and the
  brow lookout and its relay, 14 km west (the open world, step 5: it waits on the vertical stack).
- **The barbican** is three walls with its opening on the south side (the bent entrance); the road up to it is not drawn.
- **The utse stands 8 m out of the inner front** (the blueprint's u -63..-41), so its east half stands on the outer ward's ground
  and its west half on the talus; its storeys are counted from the outer ground (the inner court's door is on its first floor).
- **Stalls are 2.2 m** (standing stalls): at the blueprint's 2.5 m the four stable ranges, kept clear of the corner drums, hold
  284 for the 292 war horses.
- **The ground baker** is `tools/scale_ground.py` (new, 2026-11-23); Strongwall's and Thalaba's `build.py` keep their own copies
  of the same bake (theirs to move over).
- **The open world** (step 5) waits on the vertical stack; the lookout `stempestlk01` and its relay are not on this page.
