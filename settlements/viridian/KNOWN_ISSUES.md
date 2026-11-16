# settlements/viridian: known issues

- **The owner's questions are open** (`PLAN.md` section 13). The site (question 1), the dress (6), the people (7), the
  hermitages (8) and the valley village (9) may change what is built. `VT_DRESS` in `src/89qv-vt-works.js` is the dress's
  one switch.
- **The page is not built** (steps V6-V8). The sheet shows the records. The estate's records (`src/40-vt-estate.js`) are
  tested in node on a stand-in ground, not drawn yet.
- **The physic garden is thin in `kits/crops`.** On the wet ground only three bed crops fit and are not shade crops:
  bell-pod, camphor and circle lichen. The Vale's wild medicinal plants (ginkgo, cloud pine, whorl olive, frost willow,
  silverscrub, beard tree) are biome tags, not crop records. That is question 5; a crops-kit change if the owner wants it.
- **No prayer-flag lines on the small records.** `xnPennants` (`kits/xanadu/src/72-xa-helpers.js`) draws its rope with
  `beam()`, which centres the geometry. `vRope` (`kits/iziz-vernacular/src/69b-vern-mat.js`) is a cylinder based at 0, so
  every pennant rope is drawn from the line's midpoint to half its length past its far end. This shows on every page that
  strings flags (Xanadu, Qiblai). The fix belongs to the kits' owners. Here `vtFlagPole` stands a column of flags on a pole
  instead.
- **The withering loft's lot is 28 m deep** for its variant 2, whose weighing yard stands in front; variants 0 and 1 use
  14 m of it.
