# kits/construction: known issues

- [ ] The isle demo's lots draw the site in plain palette colours: it reads `10-cons-site.js` alone. Taking the library's
      maps is opt-in: load `src/20-cons-lib.js`, carry this kit's pack (`matlib_pack.fragment(kits/construction,
      'construction')`, without the `own` ground) and pass `mats: KCONS.libMats()` in `DRAW.lotWork`. Not done here
      (2026-11-09) so that the isle demo's pages do not move beyond the fragment's own changes (below).
- [ ] The 2026-11-09 polish changed `10-cons-site.js`, which `settlements/isle-demo/build.py` (`CITY_CONSTRUCT`) inlines,
      so `settlements/isle-demo/dist/isle-city.html` (and any page that inlines the fragment) moves bytes on its next
      rebuild. What changes on those lots: the ladder leans toward the building on the -x side (it leaned sideways on
      the +x side, its rungs across the lean, one foot in the air) and its rungs no longer thicken with its height; the
      transoms sit 7 cm under the ledgers (they shared their faces at the corners: z-fighting); the board walks rest on
      the ledgers (they touched them on an edge); the logs touch the ground (1 cm up) and the stone blocks' courses
      touch (1 cm gaps); the piles stand clear of the scaffold line (the logs crossed it); world-unit UVs (no change in
      plain colours). The bills the isle demo uses (timber, stone, mats) keep their pile kinds.
- [ ] The pole geometry is one unit tall, scaled to the scaffold's height, so its bark map stretches along it as the
      scaffold rises (up to about 8x at the eaves of a tall house). The grain runs along the pole, so it reads; a pole
      per lift would fix it.
- [ ] The sheet's stage f is read off the piece's own build order (core/city's keys): a piece whose footing phase holds
      most of its triangles (the Islanders' rumah on its piles: 69% at "footing") shows most of itself early. That is
      core/city's order (CONSTRUCT.foot), not this kit's.
- [ ] The sheet carries the three pieces' families only (`build.py` KEEP, read off the page 2026-11-09). A new row or another
      variant may draw a family left out: it then shows the kit's procedural look; add the family to KEEP.
- [ ] The sheet reads the isle demo's `bundles.py` and `58-isle-protos.js` in place (a kit page reading a settlement's
      files, as Longsong does) and the Iziz and Xanadu packs from the settlements' `tex/`: three backwards edges,
      allow-listed in `tools/dep_allowlist.json` with the reason in MODULARITY-PLAN.md (step 6). The fix: `isleFlatten`
      to core/city beside `constructMesh`, the ISK and IZV seals to their kits, the packs to the kits; then delete the lines.
