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

- **Kept only.** The damaged and ruined states (step 2), the interiors (step 3) and the grounds and the crest (step 4: the
  muster court, drill court and range, the Maydan, the paddock, the hay barns, the terraces) are not drawn yet.
- **The barbican** is three walls with its opening on the south side (the bent entrance); the road up to it is not drawn.
- **The utse stands 8 m out of the inner front** (the blueprint's u -63..-41), so its east half stands on the outer ward's ground
  and its west half on the talus; its storeys are counted from the outer ground (the inner court's door is on its first floor).
- **Stalls are 2.2 m** (standing stalls): at the blueprint's 2.5 m the four stable ranges, kept clear of the corner drums, hold
  284 for the 292 war horses.
- **The ground baker** is `tools/scale_ground.py` (new, 2026-11-23); Strongwall's and Thalaba's `build.py` keep their own copies
  of the same bake (theirs to move over).
- **The open world** (step 5) waits on the vertical stack; the lookout `stempestlk01` and its relay are not on this page.
