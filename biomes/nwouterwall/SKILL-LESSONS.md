## 5v. A cold biome on the scale model: seasons, frozen ground, and a texture bug that hid as a bad card (the NW outer wall, Oct 2026)

The NW outer wall (`biomes/nwouterwall`) is the Yeti's high country. It covers fur-larch forest-steppe, permafrost taiga,
tundra and fellfield above 4 km, and it holds the Three Gifts' crops and Leng on the horizon. It was built as three stations
on one `src/`: Leng's forest-steppe, the larch taiga, and the Yeti Valley. Its ground is cut from the scale model (4.22).
The owner reviewed it live in three rounds. What held up, and what the review caught:

- **Put the station on the model, then add only its own relief.** A station's `SITE.relief(x,z)` is metres over the model's
  height at its pixel (page y = 0 there). The model is gentle at 4 km a cell, so the valley, its gullies and its terrace are
  the station's own. Everything past the near box is the model's country, bicubic, painted by the near ground's shader from
  height and aspect. Beyond 20 km it is the shared sky's ridges, cast from the model (`region/far.py`). The mid ground has no
  trees, so paint its forest weight into the ground shader (shaded slopes darker by larch weight), or the mosaic stops at
  2.5 km.
- **Give every station every season on the picker, from the first build.** The owner opened in autumn with a Season select,
  then asked for winter on every station. Each seasonal table keyed by season (`SITE.snow`, the aufeis `cover`, `lakeIce`,
  the palettes, `LARCH_K`, the flowers' months, the sky's snowline and ridge colours, the take's checks) needs an entry for
  all four. A missing key reads as `undefined` and plants nothing, or plants everything. Write the four-season table once
  and check that every station's `?season=winter` loads.
- **Frozen ground is a core module, and only what is drawn is registered.** Aufeis, ice-wedge polygons, solifluction lobes,
  alases, pingos and rock glaciers are `core/terrain/42-core-frost.js` (`KFROST`). The station gives each one `where(x,z)`
  and the season's cover. Register only the aufeis patches that are drawn, each with probe points: empty registered
  volumes fail the probe. Fade a sheet's material by KFROST's per-vertex coverage, or overflow ice ends in a hard rim.
- **A channel narrower than the ground grid disappears.** A 4.5 m stream cut into 10 m baked cells was lost between the
  grid points, and the ribbon sank in pieces. Cut at least the grid's width (`max(w*2.2, step*1.7)`). Tone the narrow
  channel's glare too: at `envMapIntensity` .55 the sky turned it into a white road.
- **Foliage hangs from wood, at its true scale.** The owner's note was "sparse, foliage not connected to branches". The
  larch's tufts were clumps scattered round each branch. Now they are sprays on a hung quad (stem at y=0, the card's sprig
  hanging, swaying by `-position.y`), placed at points along the branch's own curve (the same `u` the tube is drawn with)
  and alternating sides. The stone pine became whorled limbs with bunches from the inner fifth to a knot at the tip. Size a
  spray so the card's tufts read near their true few centimetres: at 1 m a 22 cm tuft reads as a broad leaf. Then measure
  the instance count per LOD level: near trees took most of the 4 M extra triangles, and mid trees got fewer, larger sprays.
- **When a card looks wrong, read the map's offset in the page before writing a new prompt.** "The snow potato needs a
  better texture" turned out to be the goldroot. `KMAT.textures` caches one texture per library sheet, so
  `BIO.libSwap`'s `cell` offset for a sheet's last slot won on every slot of it. All three crops drew row 3, and the autumn
  larch drew the green row under a gold tint. The fix is a clone per cell slot, with the image copied when the sheet
  decodes. A clone made before the load never gets the image: the larches went bare until it was copied across. Check in
  the console: `NWOW.MAT.crop.potato.map.offset` plus the texture's `uuid` across slots.
- **Dither the ground from the first build.** Korona (5t) already learned it, and the owner asked again here. The
  hex-cell bomb (three corners, cubed weights, two scales mixed by noise) goes on every layer. Layer edges are noise
  thresholds (`smoothstep(n-.12, n+.12, w)`), not weight fades, so the steppe breaks into the needle litter the way real
  ground does.
- **Hook order on a material is a trap.** `ATMOS.cloudShade` chains by reading and setting `onBeforeCompile`, while
  `WATER.wetGround` and `snowOn` wrap through a getter and setter, so cloud shade applied after them recurses forever. Bind
  the cloud shade first, then the weather (and its wetGround), then the snow last. The core fix is reported, not made
  in the kit.
- **A kit on another branch: bundle it, build without it, say so.** Station 3 reads `kits/yeti`, which lives on its own
  branch with a vendored engine. `yeti_bundle.py` wraps engine and buildings in one closure (`KratorYeti`), like
  `apoc_bundle.py`, and the build draws the capital only when the kit is in the tree. The committed page is built without
  it, so a rebuild on the branch matches. Test once with the kit restored, then log the merge order in `KNOWN_ISSUES.md`.
- **Crops come from `kits/crops`, and the biome gets an entry there.** The Thule package (sweetvetch, Eskimo potato,
  roseroot as sweetroot, snow potato, goldroot) is records with climate ranges, plus a `nwouterwall` biome entry, so
  `CROPS.forBiome` answers for the page. A crop card with its root drawn is sunk to the plant's foot (`G.tuft(sunk)`, the
  quad scaled `h/(1-sunk)`), so the root stays underground.
- **Negative controls must be able to fail on the station they run on.** A "no crops" negative on a station that has no
  crops passes vacuously. Make each negative station-aware: skip it, or pick a feature that station draws.
- **Verify on a shared GPU.** Run `PYTHONUNBUFFERED=1 python -u verify.py`, or a timeout loses the buffered output. A `:`
  in a view's name breaks its screenshot path. The browser pane and verify contend for the GPU, so park the pane first.
  Other sessions hold dev ports, so give `launch.json` a free one and do not commit it.
- **A placeholder massing gets no snow.** Leng is boxes at the model's bearing and distance. With snow on its steps it read
  as a cake, so tag it `placeholder` and keep it plain.
- **Before planting an ecotone, make look-alikes one species.** The neighbours already carried three of this kit's plants
  under other names on the same cards (silverthorn = nsemiarid's buckthorn, plumegrass = its drill grass, the larch beard =
  nwlowlands' hanging moss). Alias them to one record first, then decide which related species cross each border by
  climate envelope (`ECOTONES.md`).
