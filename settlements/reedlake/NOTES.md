# Reed Lake — notes

## Round 1 (Sep 28 2026) — the kit

Brief from Travis: a "floating village" reed lake village kit — the same building types as the Highland Tribal
subset minus the hillside, plus a reed boat, five variants of reed island platforms, a fishing dock, a reed
weaver's workshop, a warehouse, and agricultural buildings. References: the Marsh Arab mudhif (reed-bundle arch
halls with lattice fronts and rows of bundle columns), the Uros islands of Titicaca (piled-totora islands, thatch
and cone huts, watchtowers), reed boats with animal prows.

Mid-round rulings (Travis): **remove the totems**, **get rid of the Tlingit (formline) patterns** — this is a
completely different culture; if patterns are needed, think **Andean**. Done: every totem became a banded reed
post (`hnRLPost`, woven bands, a tassel, a chakana disc and a pennant at doors and gates), every mural a hung
woven cloth (`hnRLCloth`, the awayo), every thunderbird finial a tied topknot with a chakana disc, and the painted
maps (bands, cloth, cone, shields, prow head) were redrawn in stepped diamonds, zigzags, step-frets and the
chakana in madder / ochre / black / white / indigo (`RAND`). The vendored carved vocabulary is present but unused.

Decisions:
* New repo `reedlake/` on the Highlands fragment contract, vendoring `10…73`, `91–93` from `../highlands/src`
  unchanged (`build.py --vendor-check`). Defs register through `HL.def` with branch `'tribal'` (so the vendored
  helpers stay out of the way — no mural fitting pass) but the culture tag is `reed-lake`; the showcase names the
  branch "Reed Lake".
* **The island is the ground.** Every builder stands on y = 0; the lake is at `RL.WATER = −0.45`. A def placed on
  its own gets a pad (`hnRLPad`: an irregular reed island round the plot, reed beds with a gap at the landing, two
  anchors); the composite islands place defs with `o.pad = false` through `hnSub`.
* Islands are plain meshes with their own UVs (`hnRLMesh`): four side layers (darker down toward the water), a top
  annulus (a lagoon when `o.inner` is given, with inner walls), a fringe of hanging reed ends, all in the scene's
  instanced fringe/reed items. ~2 k triangles for a big island.
* The mudhif (`hnRLMudhif`): superellipse arch profile (n = 2.4) along the hall's z axis; ribs are chains of
  bundle `beam()`s over a mat skin; purlins lashed over; each end a row of free-standing bundle columns with their
  tied tops above the roof line, matting to `hl` and open lattice above (`MAT.rlLattice`, alpha, own-UV mesh),
  a pointed doorway in the front. Small mudhif, family mudhif, warrior's hall and the great mudhif all use it.
* Boats (`hnRLBoat`): one own-UV mesh (lashing bands from the bundle map along the length, a lobe either side for
  the two bundles), rope hoops, the ends swept up into points, a painted puma head on the prow (1 or 2), a mat
  cabin, paddles, folk. Rafts and pontoon bridges are instanced bundles under a mat deck.
* Water: one plane at `RL.WATER` with a **periodic** ripple map (sums of whole-tile sinusoids — the first fbm map
  showed every 8 m seam) scrolled by `94-rl-anim.js`; distant reed beds at the lake's edges.
* The fishing dock is re-centred on its plot (pad at z = −8, the pier running out to +12) so the generated
  eye-level camera stands clear of the pier head.

Result: 29 defs (5 dwellings, 3 halls, 2 sacred/lookout, 4 work, 3 boats, 5 farm, 5 islands, the village),
~0.56 M scene triangles, ~120 draw calls on the opening view; the village 220 k triangles. Verified in
headless Chromium (`verify.py --assert`, every invariant green) and by eye at eye level.

## Round 2 (Oct 5 2026) — Reed's Local, and the interiors set

Brief (for the settlement Mungo, whose offshore district is a floating reed village): one new, large tavern in the
Reed style labelled **Reed's Local**, put in this kit rather than in a kit of Mungo's own, socketed into the interiors
and furniture systems; Reed culture had no interiors set, so one was started.

* `81-rl-tavern.js`: `rl_tavern`, family **Hospitality** (a new showcase row; families are rows in definition order, so
  it comes after the floating village). A great mudhif (L 28, span 11.5, crown 9.4, nine columns each end: the great
  mudhif's floor is 22 x 8.6) with a mat back; inside, a floor mat, the built-in mat benches along both walls (mud cores,
  mat tops, a bundle kerb, woven bolsters: the guests sit along the walls, as in a mudhif guest hall), the cook-fire on a
  mud slab with a tripod pot and a spit of fish, pennant strings across the arch, fire-cages on long ropes, woven cloths
  high on the back wall. A smaller mudhif joined at its right (L 12, span 6.4) is the kitchen, with a mat partition and a
  doorway to the store behind. A mat terrace with banded posts, braziers and fire-cages on poles; a thatch lean-to of
  beer jars and gourds behind the annex; fish rail and sheaves in the left yard.
* The landing: bundle pontoons under a mat deck, eucalyptus piles, a thatch gable (ridge along z) on six bundle posts,
  long bundle benches down both sides, braziers on mud at the front corners; two canoes tied along its sides and the
  great two-headed boat off its right corner. The def declares `landing: 6.5` (the deck reaches 6.5 m past the +z edge).
* The sign: `TEX.rlTavSign`, a woven board in `RAND` (madder field, black selvedges, white zigzags, stepped diamonds at
  the ends, REED'S LOCAL in black on an undyed panel), on a thin box so it reads the right way from both faces, hung on
  ropes under the landing's front gable. Its colours are in the map; the item is never tinted.
* Its own pad (`hnRLTavPad`): `hnRLPad`'s ellipse left the terrace's corners and the jar store over water, so the
  tavern's island is a superellipse (n 4, 15 x 20) with a light wobble; with `{pad:false}` it builds none.
* Structure only inside: the interiors set (`kits/interiors/sets/reedlake.js`) furnishes the hall (a tavern room
  around the bench and fire fixtures), the kitchen, the store and the landing (a second tavern room). New catalog
  pieces for it in `kits/catalog/krator-master-furniture-reedlake.js`: `reedlake_common_bar`, `_jar_rack` (a FOOD
  container), `_long_bench`, `_long_table`, and `reedlake_poor_sleeping_mat` (the lake's bed, for the huts).
* The interiors set covers all 29 defs (the 28 of round 1 and the tavern): 12 items (four dwellings, two halls, the
  shaman's house, the weaver's shed, the warehouse, the farmhouse, the granary and the tavern) and 17 skips with their
  reasons. The mudhif rooms are kept to where the arch is
  high enough (`archHalf` in the set file). The cone hut is skipped: inside its thatch it is 1.5 m high only within
  r 1.3, too small for a home (a wider cone or a mat drum under it would do).

Result: `rl_tavern` about 55 k triangles alone with its pad (class `small`, 91a-rl-budget.js); `verify.py --assert`
green; the sets page plans 18 rooms, 7 of 7 residences pass.
