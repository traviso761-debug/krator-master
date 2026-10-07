# Krator biome kit — Xanadu: known issues

Read before changing anything here. `build.py` prints the open count.

## Open

- [ ] PUBLISH AFTER EVERY PASS. A claude.ai artifact is a separate copy of
      `dist/xanadu.html`; strip everything before `<title>` and the trailing
      `</body></html>` before publishing (00-head.html carries the page wrapper).
- [ ] BUDGET. The first build measured 42M triangles, all of them drawn from every camera:
      the LOD spine (ten origins over a 6.4 km map) put almost every tree inside a hero
      radius. Hero radii were cut by a quarter, the uplands thinned, and the core grew a
      RUNTIME LOD (BIOME-API.md): the scene now holds ~22.5M triangles (the hero trees'
      stand-ins included) and draws 3–14.5M at the preset views, in 100–460 draw calls.
      The probe's ceilings: 30M held, 14M drawn (tracked, not asserted by verify.py),
      600 calls. `XANADU.build({quality:.6})` (or `?q=.6`) and `BIO.LOD.scale` are the knobs.
- [ ] Runtime LOD costs draw calls: one mesh per item per chunk. The vale's densest views
      draw ~460 calls; on weak hardware lower `BIO.LOD.scale` or raise `BIO.LOD.chunk`.
      Chunks switch whole: at the edge of a range a chunk of hero trees becomes stand-ins at
      once (a visible pop at 1.5 km, softened by fog).
- [ ] THE MAP IS READ AT 44 m. Anything on the scale model smaller than a cell (a
      single escarpment line, a narrow spit) is lost or softened; the escarpments
      between the green slopes and the uplands are slopes here, not cliffs.
- [ ] The city is not here. The map's districts (markets, farms, the palace) are
      treated as the wild ground under them; a world that builds the city should
      clear its footprints through `mask` / `obstacles` and keep the fields.
- [ ] The cataract that drains the lake is paint (a notch and a spray plume at
      azimuth 112 on the sky); the lake's outlet is not geometry.
- [ ] The river's ribbon is a hand above the bed and reaches out to where the banks
      rise above that; on a very gentle floodplain its edge can float a few
      centimetres over the ground at grazing angles.
- [ ] The fountain is a host particle system (2600 points). It is not a biome
      concern and is skipped by the probe.
- [ ] Impostors are the hyperjungle's blob technique, one or three blobs by habit;
      the lotus trumpet's impostor is three pink-rimmed blobs, not cups.
- [ ] Flowers are two-tone through the iridescence hook (a second colour away from
      the sun and at grazing angles), not painted in two colours: seen face-on in
      full sun a painted orchid shows mostly its first colour.
- [ ] Only one test structure dresses (the dome ruin). `dress()` samples by triangle area within a shell: the core takes shells (`{geos, share}`: the roof, the walls, the ledges, each with its own share of the samples, `core/biome/40-core-place.js`), but this host's test structure still passes one list.
- [ ] No fauna yet.
- [x] **Put the biome fruit in the kit** (`biomes/FRUIT.md`, 2026-10-06): every species carries `tags.harvest`
      (`XANADU.HARVEST`, `HV()` as ebadlands), the floor's small plants too (`XANADU.PLANTS`); nine fruit name their
      catalog piece (`XANADU.FRUIT_KEYS`, drawn by `XANADU.FRUIT_ITEM`). New: striped olives on `whorlolive` (item
      `whorlolive`, 30 tris, near trees only, ~16k, ~0.49M tris) and lotus seed heads on the pads (`lotuspod`, 68 tris,
      ~200). The probe's "fruit tagged, catalogued and drawn" check and three negatives; the inspector shows the tag.
      `settlements/xanadu` vendors this kit and needs re-vendoring. The trees pass was already over its 19M class
      budget (soft) before this; the showcase total is now 29.8M of 30M, so further fruit needs a cut elsewhere.

## Done

- [x] The Vale's terrain from the scale model (class grid, escarpment cleanup, the island).
- [x] The sacred river traced off the map: gorge, cascades, monotone bed, its own water.
- [x] Thirty-three species (twenty-five unique, eight from the Rift ridge, altered), tagged.
- [x] Quality pass: no trees in the lake or the river, traveller's palm, Persian ironwood twigs, haze blossom, cushion domes, the uplands (cypress, strawberry tree, maquis, an upland LOD origin).
- [x] Fairy rings and hornbeam arches as placements, with the rings' lawns on the floor.
- [x] Runtime LOD (chunked bake, BIO.lodTick) with stand-in impostors for the hero trees.
- [x] Groves round glades on the vale (a grove field in the zones, flowers thick in the glades).
- [ ] (2026-10-06) The showcase takes the material library (materials.json, tex/, the 44 pack; BIO.libSwap after the MAT table): barks, rock, wood and the leaf, frond and ground-plant cards, brightness matched to the measured procedural maps; single-plant slots show one cell of their sheet. Slots not in materials.json stay procedural (the 2026-10-06 sweep lists them in core/materials/PLAN.md). verify --assert passes, before and after.
