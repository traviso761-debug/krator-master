# XS0: Xanadu's pages measured for the vertical stack (2026-11-23)

`STACK-PLAN.md` section 9, row XS0. These are measurements only: no page, pack or baseline is changed. The raw data is
`XS0-MEASURE.json`, beside this file. The tools are in `xs0/`: `xs0_measure.py` (the browser half, on `tools/harness.py`),
`xs0_families.py` (the packs offline) and `xs0_report.py` (folds the runs into the JSON).

**State: complete.** All 22 Xanadu pages that build on the merged tree are measured on GPU lanes. The cloud run measured 10
of them on SwiftShader (`claude/xs0-measure` f339af03). This run measured the other 12 and measured the 10 again on a GPU.
Gihon is not measured: `claude/gihon-6258a4` is not merged into the integration line, so `settlements/gihon` has only
its `PLAN.md` (section 8).

**Headline.**
- **One page is at risk: Blakhed.** Its ground program links **12** samplers as shipped and **13** with a shadow on, which is
  within 3 of 16. With KHORIZON on its ground it would link 15, which is the harness's warning line. It is the one Xanadu page
  that should take the runtime array assembly (`v3_arrays_three_maps`) at Stage 8.
- **Next highest:** Kirstabal, Nulab and the Flashing Eye at 9, which is 10 with a shadow and 12 with KHORIZON.
- **The GPU agrees with SwiftShader** on every one of the 10 pages both runs measured, sampler for sampler. The Arc and the
  RTX also agree on every page.
- **8-bit glazed normals:** XS1's 13 glazed Xanadu families add 2.57 MB of base64 to the Xanadu pack. Qiblai's two add
  0.57 MB and Tungang's two add 0.49 MB. No page's HTML grows.
- **Pages near the 16 MiB cap:** Thalaba is at 86 %, Thalaba's pieces at 84 %, Kirstabal at 83 %, the Flashing Eye at
  81 % and the Azure Dream at 79-80 %. The largest sidecar is Blakhed's Tungang pack, at 14.14 MiB (88 %).
- **Biggest video-memory estimate:** Blakhed, at 1.10 GB.

## 1. How it was measured

- **Tree.** `claude/xs0-measure-local`, the stack's tip `origin/claude/vertical-stack` (d636c78c4), with three branches
  merged in this order:
  1. the local integration line `claude/openworld-sites-24defd` (2856e6e6a), the newest Xanadu work: Nulab, Blakhed and
     the 2026-11-22 merge round;
  2. `claude/xanadu-plans-ad6ef4` (59cd2579a);
  3. the cloud's `claude/xs0-measure` (f339af03), for its scripts.

  Conflicts were resolved as follows:
  - **Generated files** (dist pages, `build-inputs.json`, manifests): taken from the integration line, then rebuilt.
  - **Docs** (`TODO.md`, `core/PORT.md`, `openworld/pinnacle/KNOWN_ISSUES.md`, `core/materials/PROMPTS-NEEDED.md`'s
    count line): both sides kept.
  - **`openworld/pinnacle/build.py`:** both fragment additions kept (`85p-world-pregrow.js` and `88l-world-landforms.js`).
  - **`tools/scale-model/model/src/60-settlements.js`:** both sides' `SETT_MOVED` versions kept (`5.1e8`, `5.1e11`,
    `5.1e14`).

  None of those files is read by a measured page. Every page was rebuilt with `build.py --no-checks`. Nothing was
  committed except this report.
- **The Azure Dream** builds once two stale lines in its `kit.json` are patched locally (section 8). The patch is not
  committed.
- **GL.** `KRATOR_GL=gpu`, run through `harness.py lock`:
  - The six-view runs and the as-shipped runs took `--lane auto`. Both landed on the RTX 5060 (ANGLE D3D11), because another
    session held the Arc.
  - The shadow pass took `--lane arc`: the Intel Arc 140T (ANGLE D3D11), the lane that fails a program at 16. Viridian's
    shadow read is the exception, on the RTX (section 8).

  Every page's `renderer` is recorded in the JSON.
- **Samplers.** `harness.SAMPLERS_JS` reads the sampler uniforms of every linked program, as `tools/route_harness.py` does.
  The worst program over the whole run is reported. Each page is read five ways:
  1. as loaded;
  2. after `renderer.compile(scene, camera)`, which links every material in the scene graph;
  3. after each of 6 preset views, evenly spaced;
  4. at the end of the run;
  5. **with a shadow on**, on the Arc (`XS0_FORCE_SHADOW=1`, new in `xs0_measure.py`). The read turns on the renderer's shadow
     map, the first directional light casting, and every mesh casting and receiving, then relinks.

  The fifth read answers the coordinator's point (c). KSHADOW is not in any kit page yet, so `?shadow=1` does nothing there:
  every kit page reports `kshadow: false` with the query. The forced read is therefore the count S2's shadow will meet,
  measured rather than projected. The regions carry KSHADOW and KHORIZON already, with a shadow cast as shipped.
- **As shipped.** One more read per page, with no query and one view (`noshadow.json`, `as_shipped` in the JSON).
- **Video memory.** `harness.VRAM_JS`: RGBA8 plus mips for every texture on a scene material, plus every unique geometry
  and instance buffer. This is an estimate, and on the regions it depends on the path taken (streamed tiles stay loaded).
  The worst reading is given.
- **Families.** The packs a page registers (`KMAT.packs`, `KMAT_SIDE`) are matched by data URL to the textures on scene
  materials. A family is **drawn** when one of its maps is bound to a scene material at a read.
  - **The ground layers are a blind spot.** Thalaba's `t*`, Kirstabal's `ks*`, Nulab's `nl*`, Blakhed's `bk*` and the
    Flashing Eye's `fe*` are decoded, then sampled by the ground program through textures the tracker does not match. They
    read as "loaded only". The ground program's own sampler names (section 2) show they are drawn.
- **Classes are XS1's.** They are the `"class"` field of each `materials.json` on `claude/xs1-classes` (366667904),
  read by `xs0_families.py` through `git show`. XS1's `card` is called cut-out here. STACK-PLAN section 5's class stays in the
  JSON as `class`, beside `xs1Class`. The stack's glazed rule is `specular >= 0.45` and roughness `< 0.35`, where roughness
  is the packed roughness map's grey mean.
- **The 8-bit normal cost.** Each glazed family's library normal (XS1-glazed, plan-glazed or a rule hit) is re-encoded in
  memory with `pack.py`'s own encoder. The 6-bit encode reproduces today's bytes, so the delta is exact.

## 2. The pages

Bytes are MiB against the 16 MiB cap (`buildlib.PAGE_CAP`). None of these builds has a `BUDGETS.json`. The sampler columns
are the worst linked program:
- **Shipped:** as loaded, then compiled, then over the views.
- **+shadow:** the Arc's read with a shadow on.

The program column lists the worst program's samplers with the shadow on. VRAM is the worst estimate over the six views, in
MB.

| Page | Page MiB | Sidecars: n, total MiB, largest | Shipped | +shadow | That program (with the shadow) | VRAM MB (tex / geom) |
|---|---|---|---:|---:|---|---|
| Erewhon and the citadel (`erewhon`) | 8.69 (54 %) | 3, 25.4, 13.86 (87 %) | 6 | 7 | uDetail, uLShore, uLPeb, uLGrav, uLMarb, map, directionalShadowMap | 475 (257 / 218) |
| Xanadu kit sheet (`xanadu`) | 8.50 (53 %) | 3, 25.4, 13.86 | 4 | 5 | map, emissiveMap, normalMap, roughnessMap, directionalShadowMap | 254 (198 / 56) |
| Phēr | 8.80 (55 %) | 2, 19.0, 13.86 | 5 | 6 | uDetail, uLShore, uLPeb, uLGrav, map, directionalShadowMap | 441 (269 / 172) |
| Kirstabal | **13.35 (83 %)** | 2, 19.0, 13.86 | **9** | **10** | tGrass, tDirt, tCobble, tFlag, tSand, tTill, tMA, tMB, map, directionalShadowMap | 732 (434 / 298) |
| Thalaba | **13.69 (86 %)** | 2, 19.0, 13.86 | 6 | 7 | tGrass, tDirt, tCobble, tField, tMask, map, directionalShadowMap | 435 (315 / 120) |
| Thalaba's pieces sheet | **13.37 (84 %)** | 2, 19.0, 13.86 | 3 | 4 | map, normalMap, roughnessMap, directionalShadowMap | 149 (148 / 1) |
| Lāiṭwāl | 3.91 (24 %) | 6, 37.8, 13.86 | 6 | 7 | tGrass, tDirt, tCobble, tFlag, tMask, map, directionalShadowMap | 544 (261 / 283) |
| Qiblai | 10.15 (63 %) | 3, 24.0, 13.86 | 6 | 7 | tGrass, tDirt, tCobble, tFlag, tMask, map, directionalShadowMap | 663 (288 / 375) |
| Strongwall (fort sheet) | 8.49 (53 %) | 2, 19.0, 13.86 | 3 | 4 | map, normalMap, roughnessMap, directionalShadowMap | 127 (110 / 18) |
| The Flashing Eye | **12.89 (81 %)** | 3, 26.5, 13.86 | **9** | **10** | tGrass, tDirt, tCobble, tFlag, tAsh, tSco, tCin, tCol, tMask, directionalShadowMap | 192 (124 / 67) |
| Viridian | 9.91 (62 %) | 3, 24.0, 13.86 | 6 | 7 | tGrass, tDirt, tCobble, tFlag, tMask, map, directionalShadowMap (shadow read on the RTX) | 558 (228 / 330) |
| Viridian sheet | 8.63 (54 %) | 3, 24.0, 13.86 | 3 | 4 | map, normalMap, roughnessMap, directionalShadowMap | 139 (134 / 4) |
| The Azure Dream (`isle`) | **12.74 (80 %)** | 3, 24.0, 13.86 | 6 | 7 | tGrass, tDirt, tCobble, tFlag, tMask, map, directionalShadowMap | 485 (242 / 243) |
| The Azure Dream, summit | **12.66 (79 %)** | 3, 24.0, 13.86 | 6 | 7 | (the same ground program) | 402 (246 / 156) |
| The Azure Dream, west end | **12.66 (79 %)** | 3, 24.0, 13.86 | 6 | 7 | (the same) | 353 (260 / 94) |
| The Azure Dream, north shore | **12.66 (79 %)** | 3, 24.0, 13.86 | 6 | 7 | (the same) | 358 (264 / 94) |
| The Azure Dream, east end | **12.66 (79 %)** | 3, 24.0, 13.86 | 6 | 7 | (the same) | 388 (260 / 128) |
| Nulab | 5.62 (35 %) | 7, 45.9, 13.86 | **9** | **10** | tGrass, tDirt, tEarth, tFlag, tSand, tTill, tMA, tMB, map, directionalShadowMap | 638 (484 / 154) |
| **Blakhed** | 4.69 (29 %) | 8, 54.3, **14.14 (88 %)** | **12** | **13** | tTurf, tDirt, tFlag, tTill, tPeat, tYard, tRuts, tShin, tMA, tMB, tMC, map, directionalShadowMap | **1102 (497 / 605)** |
| `xanadu-lake-shore` | 2.55 (16 %) | 1, 8.1, 8.12 (51 %) | 7 | 7 | uKHzA, uKHzB, uDetail, uSCol, uSNz, uSBed, directionalShadowMap | 429 (131 / 298) |
| `xanadu-north-shore` | 4.76 (30 %) | 1, 8.1, 8.12 | 7 | 7 | (the same ground program) | 434 (132 / 302) |
| `xanadu-oidong-highrift` | 10.66 (67 %) | 3, 10.2, 8.12 | 7 | 7 | (the same) | 834 (135 / 699) |

Notes on the table:
- **Ready and clean.** Every page reached its ready state with no page error and no GL error. Each read up to six views on
  the RTX; the Arc read each page loaded, compiled and with the shadow on.
- **Views available:** Erewhon 42, the sheet 460, Phēr 17, Kirstabal 23, Thalaba 13 (pieces 24), Lāiṭwāl 21, Qiblai 55,
  Strongwall 10, the Flashing Eye 11, Viridian 13 (sheet 29), the Azure Dream 20 / 11 / 6 / 6 / 6, Nulab 17, Blakhed 21,
  and the regions 33 / 30 / 217.
- **The xanadu-sheet** reads 3 as loaded and 4 once `renderer.compile` links its emissive programs.
- **The Azure Dream's** five pages share one build (`kit.json` targets).
- **Blakhed's largest sidecar** is `blakhed.tex.tungang.js`. The 13.86 MiB on every other page is `xanadu.tex.xanadu.js`.

### GPU against SwiftShader (the 10 pages both runs measured)

- **Samplers: identical on all ten.** The cloud's 4 / 5 / 6 / 6 / 3 / 9 / 3 / 7 / 7 / 7 are the RTX's numbers and the Arc's.
  No driver dropped a sampler.
- **VRAM:** within 0 to 11 %. Phēr reads 441 against 398, the lake shore 429 against 416 and the north shore 434 against
  450. The difference is in the regions' streamed tiles and in the newer tree.
- **Page bytes** are 0.07 to 0.23 MiB larger than the cloud's: this tree has the integration line's 2026-11-22 work.
- **The Arc against the RTX:** the same count on every page the Arc read (21 of 22), before and after the shadow.
- **Shadows:** forcing a shadow on adds exactly +1 (`directionalShadowMap`) to the worst program of every kit page. On the
  regions it adds 0, because their 7 already includes it.

## 3. Pages at risk on samplers

The harness warns at 15 and fails at 16 (`harness.SAMPLER_FAIL`, `SAMPLER_WARN`). "At risk" here means within 3 of 16,
that is 13 or more. The projection is the measured shadowed count plus KHORIZON's +2 (`uKHzA`, `uKHzB`) on a page whose
ground would take it at the re-bake. S4 on the web adds no samplers (`GRAPHICS-TERRAIN-PROPOSAL.md` 12).

| Page | Shipped | With S2's shadow (measured) | + KHORIZON on its ground (projected) |
|---|---:|---:|---:|
| **Blakhed** | 12 | **13**, at risk | **15**, the warning line |
| Kirstabal, Nulab, the Flashing Eye | 9 | 10 | 12 |
| Thalaba, Lāiṭwāl, Qiblai, Viridian, the Azure Dream (5), Erewhon | 6 | 7 | 9 |
| The three regions | 7 | 7 (in) | 7 (in) |
| Phēr | 5 | 6 | 8 |
| The sheets, Strongwall, Thalaba's pieces | 3-4 | 4-5 | (no ground) |

**Blakhed** is the one page the brief's line catches. Its ground blends eight layers (`tTurf` to `tShin`) through three
masks (`tMA`, `tMB`, `tMC`) plus the base `map`: one sampler per layer. In `STAGE-5-REPORT.md`'s terms that is exactly the
case `v3_arrays_three_maps` exists for. The eight layers go into one `Texture2DArray` (WebGL2: three r128's
`DataTexture2DArray`), the program falls to 6 with a shadow or 8 with KHORIZON, and the download does not change. It
should take the runtime array assembly at Stage 8 whatever its classes, as XS1 section 5 (c) says. Kirstabal, Nulab and the
Flashing Eye share the pattern with six to eight layers. At a projected 12 they have room, but a ninth layer or a second mask
would put them where Blakhed is. They are the next three to move to the array if one is built.

## 4. Families each page draws, by XS1's class

The Xanadu pack's families are named bare; the others carry their pack's name.
- `*` marks a family drawn with `alphaTest > 0`: cut-out as drawn, though XS1 classes it otherwise.
- "none" means XS1 gave the pack no class: Dalab's, the Ancient Transit's, the catalog's furniture maps, Oidong's, and
  Nulab's and Blakhed's own ground sets, which XS1 predates.
- The ground layers (section 1) are not listed. XS1 classes Kirstabal's and Thalaba's as relief; Nulab's and Blakhed's are
  unclassed.

| Page | Glazed | Relief | Flat | Cut-out / none |
|---|---|---|---|---|
| Erewhon | **13**: xBTile, xBandC, xBandR, xGiltC, xHaft, xMarK, xMarW, xMosC, xMosD, xMuqT, xPietra, xTiles, xZel | shingle, stone, thatch, wood, xEarth, xRock, xRubble, xSandR, xYes | cloth, corrugate, icefloor, **icewall**, plaster, tarp, verdigris, white, woodV, xMarbleW, xPenbey, xSun\*, xValance\*, xWash | |
| Xanadu kit sheet | xBTile, xBandC, xMosC, xMosD, xTiles | shingle, stone, thatch, wood, xEarth, xRock, xRubble | (as Erewhon's, with icewall) | |
| Phēr | **11**: xBandC, xBandR, xGiltC, xHaft, xMarW, xMosC, xMosD, xMuqT, xPietra, xTiles, xZel | stone, thatch, wood, xEarth, xRock, xRubble, xSandR, xYes | cloth, corrugate, plaster, tarp, white, woodV, xMarbleW, xPenbey, xSun\*, xValance\*, xWash | |
| Kirstabal | xBTile, xBandC, xMosC, xMosD, xTiles | kirstabal: xSlate, xSlateD; shingle, stone, thatch, wood, xEarth, xRock, xRubble | cloth, corrugate, plaster, tarp, white, woodV, xPenbey, xSun\*, xValance\*, xWash | |
| Thalaba | xBandC, xMosC, xMosD, xTiles | shingle, stone, thatch, wood, xEarth, xRock, xRubble | (as Kirstabal's) | none: dalab: dMural6, dRammed, dRelief, dReliefCh |
| Thalaba's pieces | xTiles | shingle, stone, thatch, wood, xEarth, xRock, xRubble | cloth, plaster, tarp, woodV, xPenbey, xValance\*, xWash | none: dalab: dMural3, dMural4, dMural6, dRammed, dRelief, dReliefCh |
| Lāiṭwāl | qiblai: qGilt, qLacq; tungang: celadon, gilt; xBandC, xMosC, xMosD, xTiles | qiblai: qAshlar; tungang: carved, hewn, potch, stone; shingle, stone, thatch, wood, xEarth, xRubble | qiblai: qRug; tungang: carpet, cord, enamel, iron, plate, silk, wash; cloth, corrugate, plaster, tarp, white, woodV, xPenbey, xSun\*, xValance\*, xWash | |
| Qiblai | qiblai: qGilt, qLacq; xBandC, xTiles | qiblai: qAshlar, qMarble, qPlank; stone, thatch, wood, xEarth, xRock, xRubble | qiblai: qRug; cloth, corrugate, plaster, tarp, white, woodV, xPenbey, xSun\*, xValance\*, xWash | |
| Strongwall | xTiles | stone, wood, xEarth, xRubble | plaster, woodV, xPenbey, xSun\*, xValance\*, xWash | |
| The Flashing Eye | qiblai: qLacq | qiblai: qAshlar; stone, wood, xEarth | cloth, plaster, woodV, xPenbey, xValance\*, xWash | |
| Viridian | qiblai: qGilt, qLacq; xBandC, xTiles | qiblai: qAshlar, qGrass; stone, thatch, wood, xEarth, xRubble | qiblai: qRug; cloth, corrugate, plaster, tarp, verdigris, white, woodV, xPenbey, xSun\*, xValance\*, xWash | |
| Viridian sheet | qiblai: qGilt, qLacq | qiblai: qAshlar; stone, thatch, wood, xEarth | cloth, corrugate, plaster, tarp, verdigris, woodV, xPenbey, xValance\*, xWash | |
| The Azure Dream (`isle`) | qiblai: qGilt, qLacq; xBandC, xTiles | qiblai: qAshlar, qMarble, qPlank; stone, thatch, wood, xEarth, xRubble | cloth, plaster, tarp, white, woodV, xPenbey, xSun\*, xValance\*, xWash | |
| Its summit | qiblai: qGilt, qLacq; xBandC, xTiles | qiblai: qAshlar; stone, wood, xEarth | qiblai: qRug; cloth, plaster, tarp, woodV, xPenbey, xValance\*, xWash | |
| Its west end, north shore, east end | qiblai: qGilt, qLacq; xTiles | qiblai: qAshlar, qMarble; stone, thatch, wood, xEarth, xRubble | cloth, corrugate, plaster, tarp, (white), woodV, xPenbey, (xSun\*), xValance\*, xWash | |
| Nulab | **none** | tungang: pole, stone, turf, wood; shingle, stone, thatch, timber, wood, xEarth, xRubble | tungang: cord, plate, rope, rust; cloth, corrugate, plaster, tarp, white, woodV | none: ancient-transit (7: asphalt, concrete, corrugated, paint, rubble, rust, steel); dalab (21, dBanner\*) |
| Blakhed | xBandC, xTiles | tungang: pole, stone, turf, wood; shingle, stone, thatch, timber, wood, xEarth, xRubble | tungang: cord, fur, hide, horn, **ice**, iron, paint, plate, rope, rust, scrap, skull, straw, tin, tyre; cloth, corrugate, **icewall**, plaster, tarp, white, woodV, xPenbey, xSun\*, xValance\*, xWash | none: catalog-furniture (16); dalab (15) |
| Lake shore | xBandC, xTiles | stone, thatch, wood, xEarth, xRubble | cloth, corrugate, plaster, tarp, white, woodV, xPenbey, xSun\*, xValance\*, xWash | |
| North shore, Oidong-Highrift | xBandC, xMosD, xTiles | (as the lake shore) | (as the lake shore) | Oidong-Highrift, none: oidong bark.cedar, bark.cherry, bark.smooth, bark.whorled; cherrybloom\*, heart\*, leaf.moss\*, leaf.small\* |

Every page also decodes families it binds to no scene material: 2 to 36 per page, listed in the JSON with
`drawn: false, decoded: true`. Among them are the whole `xanadu-bio` pack (41 families) on Nulab, Blakhed and Lāiṭwāl, and
every ground layer.

## 5. What it means for M1 packing

- **The web stays on `v1` (three maps), with one exception: Blakhed's ground takes the array assembly.**
  - No other page needs the array to fit 16 samplers.
  - Two-map packing (`v2`, `v4`) is Godot's. On the web it grows every sidecar by 75-111 % (`STAGE-5-REPORT.md` 4) with no
    sampler problem to solve.
  - `v3_arrays_three_maps` costs no download (`3,255 KB`, the same as `v1`), so it can be done on Blakhed's ground alone.
    Kirstabal, Nulab and the Flashing Eye can follow on the same code.
- **Video memory.**
  - On the kit pages, textures are 110 to 497 MB of the estimate. Nulab (484) and Blakhed (497) are the largest: they
    bind Dalab's, Tungang's and the Ancient Transit's packs beside Xanadu's.
  - On the regions and the big towns, geometry is the larger share: Oidong-Highrift 699 MB, Blakhed 605, Qiblai 375 and
    Viridian 330.
  - Blakhed's 1.10 GB total is the largest Xanadu reading, above the 888 MB `STAGE-1-ROUTE-REPORT.md` measured on the
    Ancient's Valley. On the Arc that memory is shared with the system. It is Blakhed's second reason to
    be first in line.
  - 8-bit normals change no video memory: the upload is the same RGBA8. Godot's `-33 %` BC7 saving applies to the texture
    share only.
- **Every kit page ships the whole Xanadu pack.** The same 48 families travel in `xanadu.tex.xanadu.js` (13.86 MiB) and
  `-2.js` (5.16 MiB), whatever the page draws:
  - **Nulab draws none of the 13 glazed Xanadu families** (section 4), and the Flashing Eye none either (its one glazed
    family is Qiblai's `qLacq`).
  - **Strongwall and Thalaba's pieces** draw only `xTiles`.

  XS1 already says promotion is per pack, not per page, and these measurements bear it out. A per-page choice would need a
  per-page Xanadu pack, which is a pack-splitting question for Stage 8, not a class question.
- **Erewhon** carries a third sidecar, `xanadu.tex.xanadu-pics.js` (6.34 MiB: the citadel's pictures), for 25.4 MiB in all.

## 6. The web's 8-bit glazed normals ("glazed families only")

The cost is exact (section 1). Only the normal map grows: +57 % (`xTiles`) to +104 % (`xBandR`) per family.

| Pack | XS1-glazed families with a normal map | Adds, raw | Adds, base64 | Its carriers |
|---|---|---:|---:|---|
| Xanadu | 13: xHaft 207 KB, xMuqT 202, xGiltC 197, xZel 175, xBTile 160, xBandR 160, xMosD 159, xMosC 148, xPietra 141, xMarW 139, xBandC 118, xMarK 90, xTiles 22 | 1.93 MB | **2.57 MB** | `xanadu.tex.xanadu.js` + `-2.js` beside every kit page above; the regions' subset |
| Qiblai | qGilt 222, qLacq 206 | 0.43 MB | **0.57 MB** | `xanadu.tex.qiblai.js` (5.0 MiB): Qiblai, Viridian, the Azure Dream, Lāiṭwāl |
| The Flashing Eye's own copy | qGilt, qLacq (the same) | 0.43 MB | **0.57 MB** | its `xanadu.tex.qiblai.js` (7.46 MiB) |
| Tungang | gilt 222, celadon 142 | 0.37 MB | **0.49 MB** | `lightwall.tex.tungang.js` (7.38 MiB) |

- **This matches XS1's section 5 to the kilobyte:** 2.57 / 0.57 / 0.49 MB. The cloud run's 2.5 MiB for the plan's twelve
  families plus `xTiles` comes to the same.
- **No page's HTML moves:** every glazed family travels in a sidecar, and every carrier stays under its cap. The Xanadu pack
  goes from 19.0 to about 21.5 MiB in two parts (`matlib_pack.py` splits at 15,000,000 bytes).
- **It costs download only:**
  - +2.57 MB on every kit page on Xanadu's page;
  - +3.14 MB on Qiblai, Viridian, the Azure Dream and the Flashing Eye, which carry Qiblai's pack as well;
  - +3.63 MB on Lāiṭwāl, which carries Tungang's too.
- **Only an `--inline-packs` build** would carry the growth into the page. Thalaba (86 %), Kirstabal (83 %) and the Flashing
  Eye (81 %) have no room for it.
- **Phēr and Erewhon** draw 11 and all 13 of the Xanadu glazed families. "Glazed families only" is the right scope there:
  they are what M1 exists for.

## 7. Where XS1's classes and the drawn pages disagree

1. **`icewall` is drawn on Erewhon, the Xanadu kit sheet and Blakhed.** XS1 says only the scrap target and the Fellgang set
   draw `icewall` and Tungang's `ice` (Blakhed is the one that draws Tungang's `ice`).
   - Both pass the stack's glazed rule (roughness 0.27 and 0.19) and stay flat in XS1.
   - If the owner promotes them, `icewall` adds 0.29 MB to the Xanadu pack.
   - Tungang's `ice` adds 0.29 MB to Blakhed's Tungang pack. Its first part, `blakhed.tex.tungang.js`, is already
     14.14 MiB (88 %), just under `matlib_pack.py`'s 15,000,000-byte part limit (89.4 % of the cap). The growth would push a
     family into `-2.js`, not over the cap.
2. **`xSun` and `xValance` are drawn with `alphaTest 0.5` on 16 and 21 pages.** XS1 classes them flat, not card. Gate 1's
   "height never overwrites cut-out alpha" must hold for them all the same: their packed alpha carries the cut.
   - Dalab's `dBanner` is the same case on Nulab, and Oidong's four leaf and blossom cards on Oidong-Highrift.
   - Both of those packs are unclassed.
3. **Nine glazed-by-name families fail the rule as packed.** `xMosC` 0.381, `xMosD` 0.354, `xBandC` 0.423, `xGiltC`
   0.558, `xBandR` 0.809 and `qGilt` 0.411 are as XS1 has them. One reading disagrees:
   - **`xTiles` reads 0.876 here** (the packed roughness map's grey mean) against XS1's 0.375.
   - XS1's figure is likely the family's roughness after `roughLift`, not the packed map.
   - Either way it stays glazed by name. Its 8-bit cost is the smallest (22 KB).
4. **Metals.** XS1 makes `qGilt` and Tungang's `gilt` (both `metal.gold`) glazed. The plan's section 5 put metals in flat.
   - The pages draw both: `qGilt` on 9 pages, `gilt` on Lāiṭwāl.
   - XS1's choice is what costs the 0.57 and 0.49 MB above, and it is the owner's call.
5. **Unclassed packs drawn on the merged tree.** XS1 predates some of them and never classed the rest. Stage 8's
   `pack.py` raises on a family with no class (`mclass.settings`, XS1 section 4), so these need classes before Stage 8
   packs them:
   - Dalab's pack: up to 21 families drawn, on Nulab, Blakhed, Thalaba and Thalaba's pieces.
   - The Ancient Transit's: 7, on Nulab.
   - The catalog's furniture detail maps: 16 drawn, on Blakhed (Lāiṭwāl loads them).
   - Oidong's: 8, on Oidong-Highrift.
   - Nulab's and Blakhed's own ground sets: 6 and 8, the layers of the two highest-sampler programs.
   - The Flashing Eye's own pack registers as `qiblai` on its page, so its `fe*` ground layers match nothing in `kits/qiblai`.
     XS1 classes them relief in `settlements/flashing-eye`.
6. **The three map-only marbles.** `xMarbleW` is bound on Erewhon, Phēr and the sheet as the vein map `78b-xa-pattern.js`
   reads, not lit. XS1's flat holds.
7. **Samplers: no disagreement.** A class changes bits, not maps, as XS1 5 (b) says: no class moves a sampler count above.
   Blakhed is the one page XS1 5 (c) asked about, and it takes the array assembly whatever its classes.

## 8. Build notes and what is not measured

- **The Azure Dream** builds once two stale lines in its `kit.json` are patched (not committed). On the integration line as
  merged:
  - it lists `core/walk/20-core-walk.js` as an external, which Xanadu's base build already takes ("external fragment
    20-core-walk.js clashes");
  - it names `openworld/isle-demo/src/world/41-world-fields.js`, which moved to `core/world/41-world-fields.js`.

  Patched, all five pages build and load cleanly. The owner or the Azure Dream session should make the fix in the build.
- **Strongwall, Thalaba and `xanadu-north-shore`** need `scipy`. It was installed here.
- **Memory.** Free memory on this machine ran from 100 MB to 3 GB while other sessions worked.
  - The first `xs0_families.py --xy8` run died with a WebP `encoding error 1` (out of memory) and passed on the retry.
  - Viridian's shadow read on the Arc timed out loading (900 s). It was re-run on the RTX, because two other sessions' jobs
    were queued on the Arc. The RTX and the Arc agree on every other page.
- **Not measured:**
  - **Gihon:** `claude/gihon-6258a4` (8942a2fc1) is not merged into the integration line, and `settlements/gihon` has only
    its `PLAN.md` here. It should be measured once it merges, with `xs0_measure.py`'s `PAGES` given its page.
  - **`settlements/xanadu-lake` (Māuṭh), the Marches and the Beacon** have no `build.py` on this tree.
  - **`xanadu-scrap`** (the scrap target), `biomes/xanadu`'s stations and the `kits/xanadu` and `kits/qiblai` bundles are
    out of scope, as in the cloud run.
- **Merge conflicts** between the stack and the integration line are listed in section 1. On the plans branch there was only
  `PROMPTS-NEEDED.md`'s count line. They are recorded here for the Stage 8 merge, which meets them for real.

## 9. Run

```
python tools/lfs_needs.py <build> --pull          # each build in section 2
git lfs pull --include="core/materials/library/<set>/*,core/materials/patterns/<culture>/<name>/*"   # the glazed sets
python settlements/xanadu/xs0/xs0_families.py <work>/fam.json --xy8
cd <build> && python build.py --no-checks         # settlements/xanadu: --target erewhon, then --target xanadu
# on a lane, each run through the harness queue:
KRATOR_GL=gpu XS0_VIEWS=6 XS0_QUERY=?shadow=1 python tools/harness.py lock --lane auto -- python settlements/xanadu/xs0/xs0_measure.py <work>/g1.json <ids>
KRATOR_GL=gpu XS0_VIEWS=1 XS0_QUERY= python tools/harness.py lock --lane auto -- python settlements/xanadu/xs0/xs0_measure.py <work>/noshadow.json <ids>
KRATOR_GL=gpu XS0_VIEWS=0 XS0_FORCE_SHADOW=1 python tools/harness.py lock --lane arc -- python settlements/xanadu/xs0/xs0_measure.py <work>/fs.json <ids>
python settlements/xanadu/xs0/xs0_report.py settlements/xanadu/XS0-MEASURE.json <work>
```

On the GPU a page takes 7 to 160 s at six views (Oidong-Highrift is the longest). The full set of runs took about an hour,
most of it waiting for a lane.

## 10. The supplement: phase A's pages built after XS0 (2026-11-23)

Six pages built after this run (BUILD-PLAN A6, A7, A8, A11; Gihon merged since), measured the same way on the Arc lane
(`xs0_measure.py` with `PAGE_QUERY` for the lake towns' page: Wībhar, the largest town with works, with and without its rooms),
the same six views. Raw results are not folded into `XS0-MEASURE.json` (its families pass was not rerun); the numbers:

| Page | Linked samplers (max) | VRAM estimate | Page of 16 MiB | Largest sidecar of 16 MiB |
|---|---|---|---|---|
| `settlements/xanadu-lake` (`?town=weaver`) | 5 | 280 MB | 70.0 % | 88.1 % (`xanadu.tex.xanadu.js`) |
| the same, `&interiors=1` | 5 | 666 MB | 70.0 % | 88.1 % |
| `settlements/opal-ford` | 5 | 390 MB | **87.6 %** | 86.6 % |
| `settlements/marches` | 3 | 122 MB | 52.2 % | 86.6 % |
| `settlements/xanadu-works` | 3 | 197 MB | 55.0 % | 86.6 % |
| `settlements/gihon` | **9** | **943 MB** | 83.8 % | 86.6 % |

- **No new page at risk on samplers.** Gihon is the highest at 9, Kirstabal's and Nulab's line (section 3): 10 with a
  shadow, 12 with KHORIZON. The lake towns, Ōpal-Phōrḍ, the Marches and the works sheet stay at 3 to 5.
- **Video memory:** Gihon at 943 MB is the second largest after Blakhed's 1.10 GB. The lake towns' rooms (`?interiors=1`)
  more than double the page's estimate (280 to 666 MB): the furnished batches of 459 buildings.
- **Bytes:** Ōpal-Phōrḍ's page is at 87.6 % of the cap, beside Thalaba's 86 %; every one of these pages carries the kit's
  shared texture sidecar at 86.6 to 88.1 %. Nothing over; Ōpal-Phōrḍ joins the near-cap list for Stage 8's packing.
