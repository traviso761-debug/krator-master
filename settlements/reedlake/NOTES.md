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
