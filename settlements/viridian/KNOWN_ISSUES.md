# settlements/viridian: known issues

- **The owner's questions are open** (`PLAN.md` section 13). The site (question 1), the dress (6), the people (7), the
  hermitages (8) and the valley village (9) may change what is built. `VT_DRESS` in `src/89qv-vt-works.js` is the dress's
  one switch.
- **The estate page is a first pass** (V6). It has no interiors (V5), no people or plucking day (core/sched), no Godot
  export and no open-world site (V8). The dry garden's grange (6 km off) and the valley village (10 km down the
  valley) stand beyond the page (V7). The cloud hermitages are on it.
- **The bench is a pad, not a landform.** It stands 25-29 m over the ground at its west edge, and a 25 m ashlar face holds
  it. That reads as a dzong's platform, but the plan's `lf_viridian_bench` (V1, through the scale-model session's queue)
  would shape the slope itself.
- **core/world's own benches.** The 1:1 ground here is stepped: 25 m scarplets every 300-400 m, its detail style for this
  relief. The tea terraces cut over them, so a scarplet becomes a flight of steep treads.
- **The stream and the rills are not water.** The spring house stands at the hollow's head, but the spring line and its
  stream (question 3) are not on core/water yet. The rills drawn are the physic garden's and the terrace sample's boxes.
- **The tea is drawn whole only on the fine ground.** That is 149,461 blocks round the house and the Low Garden's nearest
  treads. Beyond it the near ground carries the rows painted at about 1 m a pixel, and its 8 m cells lie under the terraces
  (smooth), so the treads read only on the fine ground. Where the two meet, the near ground's edge sinks 0.8 m under the fine
  ground's.
- **The estate's overview is near its budget's edge.** It draws 15.1M of 16M triangles: the Vale's flora at 0.55 of its
  quality (trees 7.4M, the floor 6.3M) and the 149k tea blocks. The next pass gives the flora a level of detail by distance,
  not one quality for the whole disc.
- **The tea's own texture is owed.** `foliage.tea.clipped` (`core/materials/PROMPTS-NEEDED.md` section 57). Until it
  arrives the tea's blocks wear the Qiblai pack's grass in three greens. With it come `fibre.cane` (the trays),
  `ground.terrace.field` and `ground.redsoil` (the treads), and `card.crop.tea`, packed from `materials.json`.
- **The physic garden was thin in `kits/crops`.** Fixed: the Vale's six wild medicinal plants are records now
  (`kits/crops/src/24-crop-vale-wild.js`, opt-in), and the physic garden grows eight crops.
- **No prayer-flag lines on the small records.** `xnPennants` (`kits/xanadu/src/72-xa-helpers.js`) draws its rope with
  `beam()`, which centres the geometry. `vRope` (`kits/iziz-vernacular/src/69b-vern-mat.js`) is a cylinder based at 0, so
  every pennant rope is drawn from the line's midpoint to half its length past its far end. This shows on every page that
  strings flags (Xanadu, Qiblai). The fix belongs to the kits' owners. Here `vtFlagPole` stands a column of flags on a pole
  instead.
- **The withering loft's lot is 28 m deep** for its variant 2, whose weighing yard stands in front; variants 0 and 1 use
  14 m of it.
