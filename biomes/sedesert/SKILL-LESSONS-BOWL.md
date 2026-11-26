## 5v. Stations over an existing kit: the Bowl, Mantis's pocket and the steppe (sedesert, Oct 2026)

*(Number at consolidation; written for `painting-to-3d-world/SKILL.md`.)*

The south-eastern desert (`biomes/sedesert`) had one page. The owner asked for its abyssal salt basin, the Bowl (a redraw of
the same kit under 1.83 atm, on the Dasht-e Lut model), then mid-review for a lush station at the oasis town Mantis ("a unique
Socotran-style monsoon forest"), then for the steppe half of the polygon with rare Earth plants, unusual landforms and alien
plants. Three stations were built in one session on one shared station code, while two other agents had the kit's shared
fragments open. What held up:

- **Build a station as an overlay on the kit, not a fork.** The station block in `build.py` is separate and additive (`--station
  <name>`; `stations/<name>/` files replace `src/`'s by name; `station.json` drops, adds core files and packs), so the kit's own
  page stays byte-identical (prove it: rebuild and compare the hash) and the other agents' work merges cleanly. Change the kit's
  species through data: a habit table (`SEDESERT.ABYSSAL`, `SEDESERT.STEPPE`: multipliers on height, bole and crown, applied by
  each pass's size hook to the record the kit's own builder draws), the passes (`SEDESERT.PASSES` replaced wholesale), new
  species pushed onto `SEDESERT.SPECIES` and drawn with the kit's exported tools (`SEDESERT.TOOLS`: fork tree, clumps, bark
  colours, registry). The pass machinery, the far impostors and the inspector take them for free.
- **The second station is where the shared code gets written.** The first station's stage held everything; the second needed
  the same land, water, ground, heat, sky and checks with another layout. Split at once into a shell, a layout (`45-host-stage`
  ending in a `STATION` options object plus a few hooks: `groundH`, `extraH`, `fieldsAt`, `FNAMES`, `SPINE`), the shared land
  (`46-host-land`: channels, bake, water, field cache, binding), per-station regions (`83`) and shared checks (`98`), and let a
  station inherit another's files (`"base"`). Every option defaults to the first station's behaviour (no lake, dry channels,
  ground layers, paint, habit key, channel reach), so a later station adds a flag, never an `if (station === ...)`.
- **A fragment shader has 16 texture units, and a layered ground hits it.** Nine library ground layers, the colour map, a detail
  map, a noise, the strata shader's own two and the sky's cloud shade: the second station added two green layers and the ground
  failed to compile, so it drew flat beige. The owner asked "would the ground really be this beige here?" before any check did.
  The fix: a station lists the layers it uses (`STATION.groundLayers`). Also watch for a uniform name two injected chunks both
  declare (`uNoise` clashed with the strata's: "types of uniform differ"); prefix yours. A compile error never reaches the error
  panel: read the console after every ground change.
- **Ground textures need tile variation and dithered blends.** The owner's review: "ground textures need dithering". Sample each
  library layer twice at offsets that change patch by patch (golden-ratio steps picked by a 48 m noise, `textureGrad` on WebGL2
  so the mip level does not jump at a patch edge), move each blend weight by a noise where it is mid-way and not at all at 0 or
  1 (ragged edges, not cross-fades), and add a quarter-step screen dither against banding.
- **Where two waters meet, carry the colour across.** A river ribbon ending at a lake's surface is a hard line. End the ribbon at
  the shoreline and bake a plume into the lake's tint field (the river's colour fanning out and fading over a few hundred metres)
  so the ribbon's end meets water of its own colour.
- **What the owner's review caught that the checks did not**: the beige ground (a shader failure), the hard river mouth, the
  candelabra columns' feet ("too polygonal": they were flat 8-sided cuts, and they stood beside their arms with their feet in the
  air; seat each column on its arm, round its foot, close its cap, and note the backport for every kit that shares the
  geometry), a fig crown drawn with a monstera card (look at a card sheet before wiring it), tall grass that read as a lawn (a
  monsoon savanna is grass to the knee: a dense tuft pass close by, the ground's grass layer beyond).
- **Pitfalls that cost a round each.** A host that calls `BIO.put` after the kit's `BIO.kitEnd` finds none of the kit's items:
  route it through a kit function (`SEDESERT.bed`). A biome fragment that loads before the one defining a helper must read it
  lazily (`SEDESERT.small` is the floor's). A channel narrower than two of the ground field's steps sits under its own bed: make
  it wider or the field finer. A merged mesh is counted by the probe at its box centre: give it `probePoints`. A station without
  a lake must leave the lake out of the bake's water boxes (a box a million metres off). Distances wanted in a field must be
  stamped that far (`chanReach`), or a "gallery forest" is ten metres wide. A dynamic mesh driven by a tick does not move in a
  hidden tab: a check on it is honest only on a page that draws. A fresh worktree's LFS pointers build a page of blank cards
  silently: `git lfs pull` every `tex/` a build reads before building it, and let verify's image check catch the rest.
- **Compress what a station cannot hold, and say so.** At true scale a 6 km station on the Bowl's shore holds only salt flat (the
  rim is 10 km, the flat 28). The owner chose to compress the rings into the station as a showcase; a far town at its true 50 km
  is under a pixel, so it is placed as the rings are and drawn looming (a mirage's real effect). Write the true distances into
  the docs and the known issues so the open world lays them out at scale.
- **What a future station build should do first.** Read the plan and the nearest finished station; ask the owner the open
  points in one batch (site, scale, light, what of a town to show, which rare or alien things to add) and keep building the parts
  that do not depend on the answers; pull the LFS sets and look at every card sheet you mean to wire; write the station block
  and prove the kit's own page unchanged; keep the page in the browser pane on the GPU while you work (one look per change) and
  run `verify.py --assert` under the shared GPU lock at the end, not as the loop.
