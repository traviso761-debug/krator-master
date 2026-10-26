# Krator biome kit — Xanadu: known issues

Read before changing anything here. `build.py` prints the open count.

## Open

- [ ] **The sky's landmarks (SKY-PLAN.md 4, layer 8; 2026-10-26).** The shared sky now draws the cataract at az 112 and its spray (preset.landmarks in 89-host-sky.js), where the notes above say they were not drawn. Built but not yet verified on the GPU page by page: that is folded into the biome rebuild's final rebuild and verify.

- [ ] **The shared sky (SKY-PLAN.md section 9, 2026-10-26): the look to judge.** The painted dome and the giant mesh are
      gone; `89s-host-sky.js` calls `ATMOS.skyBiome` (core/atmos) on the host clock: the page opens at 06:00 on game start's
      day (dawn), `#hour=13` is about the old fixed light. Kept from the dome: the snow ranges round the Vale and the near
      walls, all dipping at the cataract (az 112) as the paint did (ridges with a notch); the cataract's white fall and its
      spray are not drawn (no landmark layer yet). Draw calls at the default camera (verify.py --assert, GPU): 128 before,
      127 after.

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
      2026-10-26 (the diversity pass): 29.78M held before, 29.05M after, with the breaker crown (615), braided cloud
      tree (377), hive lily (1628) and the enchanted grove (16 ember palms, 1 veil oak, ~175 floor plants) added. Room
      made by: the fruit/berry ball 36 -> 20 triangles (an icosahedron with smooth normals, ~118k balls, ~1.9M saved); no
      stand-in impostor past 1.2 km for plants under 5 m (`noStand`: pitaya, prickly pear, desert rose, barrel frill,
      silver scrub, hive lily; 9509 stand-ins, ~0.3M saved; they were sub-pixel there); the hive lily's own 600 m range.
      Drawn: 3.3-16.6M per view, worst draw calls 514 (Wisteria, was 499). The trees pass is 21.6M of its 19M soft class
      budget (22.3M before). Stays open: a record of the budget, not a defect.- [ ] Runtime LOD costs draw calls: one mesh per item per chunk. The vale's densest views
      draw ~460 calls; on weak hardware lower `BIO.LOD.scale` or raise `BIO.LOD.chunk`.
      Chunks switch whole: at the edge of a range a chunk of hero trees becomes stand-ins at
      once (a visible pop at 1.5 km, softened by fog).
      Stays open (2026-10-26): needs core. `BIO.lodTick` (`core/biome/40-core-place.js`) would fade a chunk over a band
      (a per-chunk `uLodFade` uniform dithered in the leaf and bark shaders) and could merge a chunk's small items into one
      mesh per material; this kit has nothing to change.
- [ ] THE MAP IS READ AT 44 m. Anything on the scale model smaller than a cell (a
      single escarpment line, a narrow spit) is lost or softened; the escarpments
      between the green slopes and the uplands are slopes here, not cliffs.
      Stays open (2026-10-26): the scale model's resolution (tools/scale-model), not this kit's.
- [ ] The city is not here. The map's districts (markets, farms, the palace) are
      treated as the wild ground under them; a world that builds the city should
      clear its footprints through `mask` / `obstacles` and keep the fields.
      Stays open (2026-10-26): by design; `settlements/xanadu` (Erewhon) is the world that builds the city.
- [ ] The cataract that drains the lake is paint (a notch and a spray plume at
      azimuth 112 on the sky); the lake's outlet is not geometry.
      Stays: the outlet lies off the map (no terrain there to hold a `WATER.fall`) and the sky is planned elsewhere (2026-10-25).
- [x] (2026-10-25: the ribbon is a `WATER.flow` with `depthBias` and a clipped margin, `89w-host-water.js`) The river's ribbon is a hand above the bed and reaches out to where the banks
      rise above that; on a very gentle floodplain its edge can float a few
      centimetres over the ground at grazing angles.
- [x] (2026-10-25: now a `WATER.geyser` of style 'fountain' drawn by `WATER.drawGeyser`, `89x-host-fountain.js`; the drops are core/rand hashes, no `Math.random`, no per-frame CPU) The fountain is a host particle system (2600 points). It is not a biome
      concern and is skipped by the probe.
- [ ] Impostors are the hyperjungle's blob technique, one or three blobs by habit;
      the lotus trumpet's impostor is three pink-rimmed blobs, not cups.
      2026-10-26: the lotus trumpet's part is fixed: its three blobs are CUPS now (`blob(..., cup)` in 55: the upper half
      pressed into a dish, green inside, the pink fringe at the rim, green under it; same triangles; not yet judged in a
      close shot of a far lotus). New habits: 'wave'
      (the breaker crown: one blob thrown forward over the lean). Stays open: the far canopy is still blobs, not baked
      cards; a card impostor (an octahedral atlas rendered from each species' hero) is a core/biome feature
      (`core/biome/40-core-place.js`, a `BIO.impostorAtlas(species, builder)` beside the blob path), not this kit's.
- [ ] Flowers are two-tone through the iridescence hook (a second colour away from
      the sun and at grazing angles), not painted in two colours: seen face-on in
      full sun a painted orchid shows mostly its first colour.
      Stays open (2026-10-26): needs core. `BIO.leafMat` (`core/biome/30-core-foliage.js`) would take an option `paint2:
      true` that mixes `aC2` in by a mask channel of the card (the texture's blue channel, or a second mask map) as well as
      by the view angle; the kit's flower cards would then paint their throat/edge mask. Not editable from this kit.
- [x] (2026-10-26: `buildTestDome` hands six shells, podium, columns, architrave, drum, dome and rubble, each `{geos, share}`
      (`85-host-dome.js`); the drawn mesh is unchanged) Only one test structure dresses (the dome ruin). `dress()` samples by triangle area within a shell: the core takes shells (`{geos, share}`: the roof, the walls, the ledges, each with its own share of the samples, `core/biome/40-core-place.js`), but this host's test structure still passes one list.
      Still one test structure: a second one is a world's job (`settlements/xanadu` dresses Erewhon's).
- [ ] No fauna yet.
- [x] **Put the biome fruit in the kit** (`biomes/FRUIT.md`, 2026-10-06): every species carries `tags.harvest`
      (`XANADU.HARVEST`, `HV()` as ebadlands), the floor's small plants too (`XANADU.PLANTS`); nine fruit name their
      catalog piece (`XANADU.FRUIT_KEYS`, drawn by `XANADU.FRUIT_ITEM`). New: striped olives on `whorlolive` (item
      `whorlolive`, 30 tris, near trees only, ~16k, ~0.49M tris) and lotus seed heads on the pads (`lotuspod`, 68 tris,
      ~200). The probe's "fruit tagged, catalogued and drawn" check and three negatives; the inspector shows the tag.
      `settlements/xanadu` vendors this kit and needs re-vendoring. The trees pass was already over its 19M class
      budget (soft) before this; the showcase total is now 29.8M of 30M, so further fruit needs a cut elsewhere.

- [x] (2026-10-26) **No canvas is read back.** `check_core_use` named two `getImageData` calls: neither was placement (the
      whorled bark map read its own grey fill back before writing every pixel; the trees took the mean colour of each
      procedural bark map and the rock map by reading the canvas). The bark map now writes a fresh `createImageData`;
      the means are the measured constants (`BARKMEAN`, `ROCKMEAN` in 55), so GPU and CPU canvases and Godot tint alike.
      Nothing here is placed from a raster, so `core/mask` is not needed. Also `XANADU.build` reads `opt.R==null`, not `||`.

## Done

- [x] The Vale's terrain from the scale model (class grid, escarpment cleanup, the island).
- [x] The sacred river traced off the map: gorge, cascades, monotone bed, its own water.
- [x] Thirty-three species (twenty-five unique, eight from the Rift ridge, altered), tagged.
- [x] Quality pass: no trees in the lake or the river, traveller's palm, Persian ironwood twigs, haze blossom, cushion domes, the uplands (cypress, strawberry tree, maquis, an upland LOD origin).
- [x] Fairy rings and hornbeam arches as placements, with the rings' lawns on the floor.
- [x] Runtime LOD (chunked bake, BIO.lodTick) with stand-in impostors for the hero trees.
- [x] Groves round glades on the vale (a grove field in the zones, flowers thick in the glades).
- [x] (2026-10-06) The showcase takes the material library (materials.json, tex/, the 44 pack; BIO.libSwap after the MAT table): barks, rock, wood and the leaf, frond and ground-plant cards, brightness matched to the measured procedural maps; single-plant slots show one cell of their sheet. Slots not in materials.json stay procedural (the 2026-10-06 sweep lists them in core/materials/PLAN.md). verify --assert passes, before and after.

## Export profile: sections left out (2026-10-18)

EXPORT_PROFILE in verify.py leaves out: atmos (the page has no core/atmos export: the section reads empty; sedesert fills it with 89-atmos-8-export.js); water (no core/water surface meets the box: the section reads empty). Add each back when the kit fills it.

2026-10-20: `atmos` is now bound and in the profile (migration phase 0: `89a-host-atmos.js` calls `ATMOS.bindHost`, build.py lists core/atmos's core, presets, export, waves and skylight plus `core/atmos/host/89-atmos-c-hostbind.js`; the binding alone draws nothing, and the page's own sky, fog, sun and water are unchanged). `water` waits for its phase: no core/water surface is drawn here yet.

2026-10-20: checked, nothing to wire. This page binds neither core/atmos nor core/water (its water, where it has any, is the host's own MAT_WATER shader), so there is nothing for the two sections to export and both stay out of the profile. The shared pieces are in place for the day it does: core/export's adapters (`09`) fill `atmos` from `ATMOS.export` and `water` from `WATER.surfaces`, and a kit that binds core/atmos lists `89-atmos-8-export.js` in its `CORE_ATMOS` and adds `atmos` to `EXPORT_PROFILE` (geyser, ringisles, sedesert, the Throne's stations).

2026-10-25: `water` is in the profile now (migration phase 4): the lake is a `WATER.open` (shore grid, tint field for the pale shoals), the sacred river a `WATER.flow` with `WATER.fall` for the two chasm cascades, the fountain a `WATER.geyser` drawn by `WATER.drawGeyser` (`src/89w-host-water.js`, `src/89x-host-fountain.js`; core/water listed in `build.py`). The painted cataract on the sky stays paint (no terrain at the outlet).
