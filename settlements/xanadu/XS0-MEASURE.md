# XS0: Xanadu's pages measured for the vertical stack (2026-11-23)

`STACK-PLAN.md` section 9, row XS0. These are measurements only: no page, pack or baseline is changed. The raw data is
`XS0-MEASURE.json`, beside this file. The tools are in `xs0/`: `xs0_measure.py` (the browser half, on `tools/harness.py`),
`xs0_families.py` (the packs offline) and `xs0_report.py` (folds the runs into the JSON).

**State: partial.** 10 of the 20 Xanadu pages were measured in the cloud on software GL. The owner stopped the run so a local
session can finish it on the GPU lanes, where it goes much faster. Section 7 is the handoff.

## 1. How it was measured

- **Tree.** A local test branch off `origin/claude/vertical-stack` (65439b64), with `origin/claude/xanadu-plans-ad6ef4`
  (59cd2579) merged in. Generated files were taken as ours: dist pages, `build-inputs.json`, manifests, `PORT-BASELINE.json`.
  So were five non-generated files, none of which a measured page reads (TODO.md, core/PORT.md, openworld/pinnacle's
  build.py and KNOWN_ISSUES.md, openworld/oidong-highrift/plan/sites.json). Every measured page was rebuilt on that tree
  (`build.py --no-checks`). None of it was committed.
- **GL.** Software GL: ANGLE on SwiftShader (Vulkan), with no GPU in the container. **Sampler counts and byte sizes hold.
  Timings do not**, so none are reported. A driver can drop an unused sampler from a linked program, so a GPU might read
  a count lower, never higher. Section 7 asks for a GPU confirmation.
- **Samplers.** `harness.SAMPLERS_JS`, the read `tools/route_harness.py` takes: the sampler uniforms of every linked
  program. Each page is read four ways, and the worst program over the whole run is reported:
  1. as loaded;
  2. after `renderer.compile(scene, camera)`, which links every material in the scene graph whether in view or not;
  3. after each of up to 6 preset views, evenly spaced (`#ui` buttons on the kit pages, `_api.go(i)` on the regions);
  4. at the end of the run.

  Pages ran with `?shadow=1`, KSHADOW's switch, because S2 turns it on at the rebuild. The kit-target pages do not carry
  KSHADOW or KHORIZON yet, so the query does nothing there. The three regions carry both, and their shadows are already
  on as shipped: a second pass without the query read the same 7.
- **Video memory.** `harness.VRAM_JS`: RGBA8 plus mips for every texture on a scene material, plus the bytes of every
  unique geometry and instance buffer. This is an estimate. On the regions it is path dependent, because streamed tiles
  stay in memory: Oidong-Highrift went from 360 MB at its first view to 834 MB by its sixth. The worst reading is given.
- **Families.** The packs a page registers (`KMAT.packs`, `KMAT_SIDE`) are matched by data URL to the textures on scene
  materials:
  - **drawn**: one of the family's maps is bound to a material in the scene at a read.
  - **loaded only**: decoded but bound to no scene material, for example composited into an atlas, or on a mesh not in
    the scene at that time.
- **Classes.** Each family takes STACK-PLAN section 5's class (glazed, flat, relief) or cut-out. Cut-out means a card in
  the library's meta, or a material drawn with `alphaTest > 0`, marked `*`. A family section 5 does not name is
  **unclassed**, which is XS1's to assign. The stack's glazed rule (`specular >= 0.45` and `roughness < 0.35`) is
  evaluated on the packed roughness map's mean.
- **The 8-bit normal cost.** Each glazed or rule-hit family's library normal is re-encoded in memory with `pack.py`'s own
  encoder. The 6-bit encode reproduces today's bytes exactly, so the 8-bit delta is exact. Nothing is written.

## 2. The pages

Bytes are MiB against the 16 MiB cap (`buildlib.PAGE_CAP`; none of these builds has a `BUDGETS.json`). Samplers are the
worst linked program, with its sampler uniforms listed.

| Page | Page bytes | Sidecars | Worst samplers | That program's samplers | VRAM est. MB (tex / geom) | Programs | Views |
|---|---|---|---:|---|---|---:|---|
| Xanadu kit sheet (`xanadu` target) | 8.41 (53 %) | 2, 19.0 MiB, largest 13.86 (87 %) | 4 | map, emissiveMap, normalMap, roughnessMap | 254 (198 / 56) | 175 | 6 of 460 |
| Phēr | 8.58 (54 %) | 2, 19.0 MiB, largest 13.86 (87 %) | 5 | uDetail, uLShore, uLPeb, uLGrav, map | 398 (241 / 158) | 96 | 6 of 16 |
| Thalaba | **13.60 (85 %)** | 2, 19.0 MiB, largest 13.86 (87 %) | 6 | tGrass, tDirt, tCobble, tField, tMask, map | 435 (315 / 120) | 78 | 6 of 13 |
| Lāiṭwāl | 3.68 (23 %) | 6, 37.8 MiB, largest 13.86 (87 %) | 6 | tGrass, tDirt, tCobble, tFlag, tMask, map | 543 (261 / 282) | 130 | 3 of 21 (the trial run) |
| Strongwall (fort sheet) | 8.40 (52 %) | 2, 19.0 MiB, largest 13.86 (87 %) | 3 | map, normalMap, roughnessMap | 127 (110 / 18) | 22 | 6 of 10 |
| The Flashing Eye | **12.79 (80 %)** | 3, 26.5 MiB, largest 13.86 (87 %) | **9** | tGrass, tDirt, tCobble, tFlag, tAsh, tSco, tCin, tCol, tMask | 192 (124 / 67) | 56 | 6 of 11 |
| Viridian sheet | 8.54 (53 %) | 3, 24.0 MiB, largest 13.86 (87 %) | 3 | map, normalMap, roughnessMap | 139 (134 / 4) | 35 | 6 of 29 |
| `xanadu-lake-shore` | 2.55 (16 %) | 1, 8.12 (51 %) | 7 | uKHzA, uKHzB, uDetail, uSCol, uSNz, uSBed, directionalShadowMap | 416 (131 / 284) | 64 | 6 of 33 |
| `xanadu-north-shore` | 4.69 (29 %) | 1, 8.12 (51 %) | 7 | (the same ground program) | 450 (133 / 317) | 62 | 6 of 29 |
| `xanadu-oidong-highrift` | 10.66 (67 %) | 3, 10.2 MiB, largest 8.12 (51 %) | 7 | (the same ground program) | 834 (135 / 699) | 82 | 6 of 217 |

**Not yet measured**, though each was built here without error: Erewhon and the citadel (`erewhon` target, 8.60 MiB, 54 %),
Kirstabal (**13.26 MiB, 83 %**), Qiblai (10.07 MiB, 63 %), Viridian (9.82 MiB, 61 %), Thalaba's pieces sheet (13.28 MiB,
83 %), and the Azure Dream's five pages (12.57 to 12.62 MiB, 79 %). Their byte sizes are measured; their samplers, VRAM and
families are not.

**Not measurable here:**
- The newest Xanadu merges, which are not on GitHub yet: Nulab, Blakhed, the Lizardmen, Gihon. The plans branch has
  folders for Gihon, Nulab and Blakhed, but none has a `build.py`.
- `settlements/xanadu-lake` (Māuṭh is in progress, with no build yet), the Beacon (no page) and the Marches (no `build.py`
  on this tree).
- Out of scope: `biomes/xanadu`'s stations, the `kits/xanadu` and `kits/qiblai` bundles, and the scrap sheet.

### Families each page draws, by class

The Xanadu pack's families are named bare; the others carry their pack's name. `*` means drawn with `alphaTest 0.5`
(cut-out as drawn).

| Page | Glazed | Flat | Relief | Cut-out | Unclassed |
|---|---|---|---|---|---|
| Xanadu kit sheet | xBTile, xBandC, xMarbleW, xMosC, xMosD | corrugate, plaster, verdigris, white, xSun\*, xValance\*, xWash | stone, xRubble | (xSun, xValance) | cloth, icefloor, icewall, shingle, tarp, thatch, wood, woodV, xEarth, xPenbey, xRock, xTiles |
| Phēr | **11**: xBandC, xBandR, xGiltC, xHaft, xMarW, xMarbleW, xMosC, xMosD, xMuqT, xPietra, xZel | corrugate, plaster, white, xSun\*, xValance\*, xWash | stone, xRubble, xSandR | (xSun, xValance) | cloth, shingle, tarp, thatch, wood, woodV, xEarth, xPenbey, xRock, xTiles, xYes |
| Thalaba | xBandC, xMosC, xMosD | corrugate, plaster, white, xSun\*, xValance\*, xWash | stone, xRubble | (xSun, xValance) | cloth, shingle, tarp, thatch, wood, woodV, xEarth, xPenbey, xRock, xTiles; Dalab's dMural6, dRammed, dRelief, dReliefCh (Dalab's pack, not classed) |
| Lāiṭwāl | qiblai:qLacq, xBandC, xMosC, xMosD | qiblai:qGilt, tungang:enamel, gilt, iron, plate, corrugate, plaster, white, xSun\*, xValance\*, xWash | qiblai:qAshlar, tungang:stone, stone, xRubble | (xSun, xValance) | qiblai:qRug; tungang: carpet, carved, **celadon**, cord, hewn, potch, silk, wash; cloth, shingle, tarp, thatch, wood, woodV, xEarth, xPenbey, xTiles |
| Strongwall | none | plaster, xSun\*, xValance\*, xWash | stone, xRubble | (xSun, xValance) | wood, woodV, xEarth, xPenbey, xTiles |
| The Flashing Eye | qiblai:qLacq | plaster, xValance\*, xWash | qiblai:qAshlar, stone | (xValance) | cloth, wood, woodV, xEarth, xPenbey |
| Viridian sheet | qiblai:qLacq | qiblai:qGilt, corrugate, plaster, verdigris, xValance\*, xWash | qiblai:qAshlar, stone | (xValance) | cloth, tarp, thatch, wood, woodV, xEarth, xPenbey |
| Lake shore | xBandC | corrugate, plaster, white, xSun\*, xValance\*, xWash | stone, xRubble | (xSun, xValance) | cloth, tarp, thatch, wood, woodV, xEarth, xPenbey, xTiles |
| North shore | xBandC, xMosD | (as the lake shore) | stone, xRubble | (xSun, xValance) | (as the lake shore) |
| Oidong-Highrift | xBandC, xMosD | (as the lake shore) | stone, xRubble | oidong: cherrybloom, heart, leaf.moss, leaf.small | oidong: bark.cedar, bark.cherry, bark.smooth, bark.whorled; then as the lake shore |

Every page also loads families it does not bind to a scene material directly (12 to 36 per page; listed per page in
the JSON under `families`, with `drawn: false, decoded: true`). The catalog furniture's detail maps on Lāiṭwāl are
among them.

## 3. Pages at risk on samplers

**No page measured is within 3 of 16.** The worst is the Flashing Eye at 9: its ground program blends nine terrain
textures. Every other page is at 7 or below.

These are the stack's additions at the rebuild, on the web:
- **KSHADOW on every page (S2):** +1 on each lit program (`directionalShadowMap`). The regions already have it: their
  7 includes it.
- **KHORIZON (S1)** wherever a page's ground takes it: +2 (`uKHzA`, `uKHzB`). The regions already have it. A kit page
  that is re-baked onto region data (section 4: Phēr, Kirstabal, Thalaba, Viridian, the Azure Dream, the Flashing Eye,
  later Erewhon) takes it only if its own ground is hooked.
- **S4 on the web is `KGROUND`'s two fixes only** (`GRAPHICS-TERRAIN-PROPOSAL.md` 12): no new samplers. The layer arrays
  are Godot's.

Projected worst after Stage 8:

| Page | Today | + KSHADOW | + KHORIZON on its ground | Projected |
|---|---:|---:|---:|---:|
| The Flashing Eye | 9 | +1 | +2 | **12**, one under the line |
| Thalaba, Lāiṭwāl | 6 | +1 | +2 | 9 |
| Phēr | 5 | +1 | +2 | 8 |
| The three regions | 7 | (in) | (in) | 7 |
| The sheets, Strongwall | 3-4 | +1 | (none) | 4-5 |

The harness's own lines are a warning at 15 and a failure at 16; ANGLE on the Arc fails a program at 16
(`harness.SAMPLER_FAIL`).

**Watch these:**
- **The Flashing Eye**, at a projected 12. It is the one page where the `v3_arrays_three_maps` runtime assembly is
  worth having ready: its terrain layers into one array.
- **The ten unmeasured pages.** Kirstabal, Qiblai and Erewhon are the likeliest to carry a terrain blend like the
  Flashing Eye's.

## 4. What it means for M1 packing

- **The web stays on `v1` (three maps).** No measured page needs the array assembly to fit 16 samplers, and the
  Flashing Eye is the only candidate (section 3). Two-map packing (`v2`, `v4`) is Godot's: on the web it would grow
  every sidecar by 75-111 % (`STAGE-5-REPORT.md` 4) with no sampler problem to solve.
- **Video memory.** On the kit pages, textures dominate (110 to 315 MB est.). On the regions, geometry dominates (284 to
  699 MB), so packing barely moves their totals. 8-bit normals change no video memory (the same RGBA8 upload). The
  Godot exports' `-33 %` BC7 saving applies to the texture share only: Thalaba's 315 MB of textures would come to about
  210 MB in RGBA8 terms.
- **Every kit page ships the whole Xanadu pack**, the same 48 families in `xanadu.tex.xanadu.js` (13.86 MiB, 87 % of a
  cap) and `xanadu.tex.xanadu-2.js` (5.16 MiB), whatever it draws. The lake shore draws one glazed family but carries
  all of them. The proposed rule of promoting a glazed family "only where drawn within hero distance" therefore needs a
  per-page pack: the pack is per build today, and the regions take their own 8.12 MiB subset.

## 5. The web's 8-bit glazed normals

The cost is exact (section 1). It grows only the normal map: `+59 %` to `+104 %` per family, which is +91 to +222 KB
raw, or about ×4/3 of that as base64 in a sidecar.

| Pack | Family | Library | Roughness (packed mean) | Section 5 | Rule | Normal today (xy6) | xy8 | Δ |
|---|---|---|---:|---|---|---:|---:|---:|
| xanadu | xBTile | tile.bath.lens | 0.240 | glazed | yes | 219 KB | 380 KB | +161 KB |
| xanadu | xMosC | patterns/common/mosaic-star-lapis | **0.381** | glazed | **no** | 181 KB | 330 KB | +149 KB |
| xanadu | xMosD | patterns/common/mosaic-arabesque-lapis | **0.354** | glazed | **no** | 235 KB | 394 KB | +159 KB |
| xanadu | xBandC | patterns/common/frieze-star-maroon | **0.423** | glazed | **no** | 128 KB | 247 KB | +119 KB |
| xanadu | xZel | patterns/xanadu/zellige-star | 0.301 | glazed | yes | 259 KB | 435 KB | +176 KB |
| xanadu | xHaft | patterns/xanadu/haft-rangi | 0.308 | glazed | yes | 310 KB | 517 KB | +207 KB |
| xanadu | xGiltC | patterns/xanadu/mughal-gilt-ceiling | **0.558** | glazed | **no** | 294 KB | 492 KB | +198 KB |
| xanadu | xMuqT | tile.muqarnas.turquoise | 0.303 | glazed | yes | 343 KB | 545 KB | +202 KB |
| xanadu | xBandR | patterns/xanadu/peacock-band | **0.809** | glazed | **no** | 153 KB | 314 KB | +160 KB |
| xanadu | xPietra | stone.pietra-dura | 0.286 | glazed | yes | 193 KB | 334 KB | +141 KB |
| xanadu | xMarW | stone.marble.calacatta | 0.231 | glazed | yes | 158 KB | 298 KB | +140 KB |
| xanadu | xMarK | stone.marble.black | 0.104 | glazed | yes | 108 KB | 199 KB | +91 KB |
| xanadu | **icewall** | ice.clear | 0.272 | (none) | **yes** | 351 KB | 571 KB | +219 KB |
| qiblai, flashing-eye | qLacq | wood.lacquer | 0.313 | glazed | yes | 286 KB | 492 KB | +206 KB |
| tungang | **celadon** | ceramic.celadon.crackle | 0.233 | (none) | **yes** | 157 KB | 300 KB | +143 KB |
| tungang | **ice** | ice.clear | 0.192 | (none) | **yes** | 351 KB | 571 KB | +219 KB |
| tungang | **gilt** | metal.gold | 0.345 | flat (a metal) | **yes** | 372 KB | 595 KB | +223 KB |

**Totals.**
- **The Xanadu pack:** section 5's twelve glazed families with a normal map add **1.90 MB raw, about 2.5 MiB as
  base64**. With `icewall` as well, 2.12 MB raw (about 2.8 MiB). That is less than the plan's 5-7 MB estimate, which
  priced the two-map packing, not the v1 normal alone. The pack goes from 19.0 to about 21.5 MiB.
  `matlib_pack.py` splits a sidecar by family at 15,000,000 bytes (`PART_LIMIT`), so the growth fills `-2` and does not
  meet a cap. It is download and decode on every kit page, and on every region in proportion to the subset each carries.
- **The page files are not touched** while packs stay in sidecars. Only an `--inline-packs` build would carry the
  growth into the page, and Thalaba (85 %), Kirstabal (83 %), the Flashing Eye (80 %) and the Azure Dream (79 %) have no
  room for it.
- **Phēr** draws 11 of the glazed families: the hero-distance rule would promote most of the pack there anyway.

**For XS1, the class table.** The plan's list and the stack's rule disagree on nine families:
- **Five plan-glazed families fail the rule**: xMosC, xMosD, xBandC, xGiltC, xBandR. Their packed roughness is 0.35 to
  0.81, because the pattern sheets carry the grout and the ground in the same map. Section 5 says to flag them by name.
  They are flagged here, and their looks are unchanged.
- **Four rule hits are not on the plan's list:** xanadu:icewall, tungang:ice (both ice.clear), tungang:celadon (a
  celadon, so plainly glazed) and tungang:gilt. The plan's flat class takes "the metals", so gilt is classed flat (a
  metal) but passes the glazed rule: XS1 decides which class wins.
- **xMarbleB and xMarbleW are map-only** (`mapOnly`: vein maps read by `78b-xa-pattern.js`). They have no normal map to
  promote. Their class is moot on the web.
- **No Xanadu pack carries `roof.tile.celadon`, `tile.hex.ceramic` or `wood.lacquer.crimson`,** nor any moonglass
  family. Those section 5 entries match nothing yet: Lāiṭwāl's moonglass is not a library family.
- **xSun and xValance** are pattern sheets, so section 5 classes them flat. They are drawn with `alphaTest 0.5`, so
  they are cut-outs as drawn: Gate 1's "height never overwrites cut-out alpha" applies to them.
- **Unclassed in the Xanadu pack (19):** wood, woodV, thatch, shingle, cloth, concrete, concreteR, paving, timber,
  tarp, rubbleK, xEarth, xTiles, xRock, xPenbey, icewall, icefloor, xYes, xMarble. **In Qiblai's (7):** qGrass, qDirt,
  qCobble, qFlag, qMarble, qPlank, qRug. Most of Tungang's are unclassed too. The per-family rows (rule, roughness,
  bytes, class) are in the JSON under `families`.

## 6. Build notes found on the way

- **The Azure Dream does not build** on `origin/claude/xanadu-plans-ad6ef4` as committed, independent of this merge.
  `kit.json` has two stale lines:
  - it lists `core/walk/20-core-walk.js` as external, which Xanadu's base build already takes ("external fragment
    20-core-walk.js clashes");
  - it names `openworld/isle-demo/src/world/41-world-fields.js`, which moved to `core/world/41-world-fields.js` on
    2026-11-09.

  To measure, both were patched locally (not committed): the duplicate line dropped and the path moved to
  `core/world/41-world-fields.js`. The owner or the Azure Dream session should make that fix in the build.
- Thalaba, Strongwall and `xanadu-north-shore` need `scipy` (`ground_fragment`, `bake_towns.py`). A fresh environment
  without it fails those three builds.
- The committed page sizes in `STACK-PLAN.md` section 4 are behind the merged tree. For example, Erewhon is 8.60 MiB
  here, not 6.2 MB, and `xanadu-oidong-highrift` is 10.66 MiB, not 8.9 MB.

## 7. Handoff: finish XS0 in a local session (GPU lanes)

Goal: the ten unmeasured pages, and a GPU confirmation of the sampler counts. Then this report and the JSON are
rewritten from a full run, on this branch (`claude/xs0-measure`).

1. **The tree.**
   ```
   git fetch origin claude/vertical-stack claude/xanadu-plans-ad6ef4 claude/xs0-measure
   git checkout -b xs0-test origin/claude/vertical-stack
   git merge --no-edit origin/claude/xanadu-plans-ad6ef4
   ```
   - Take ours on every conflict (`git checkout --ours -- <file>` for each `git diff --name-only --diff-filter=U`).
     They are generated files, plus the five files listed in section 1, none of which a measured page reads.
   - Copy `settlements/xanadu/xs0/` in from `origin/claude/xs0-measure`
     (`git checkout origin/claude/xs0-measure -- settlements/xanadu/xs0`).
2. **Inputs.**
   - Run `python3 tools/lfs_needs.py <build> --pull` for each build in step 4.
   - `pip install scipy`.
   - Patch `settlements/azure-dream/kit.json` locally as in section 6, and do not commit it.
3. **Libraries for the offline half.** `git lfs pull --include` the library sets in the section 5 table
   (`core/materials/library/<set>/*`, `core/materials/patterns/<culture>/<name>/*`). Then run
   `python3 settlements/xanadu/xs0/xs0_families.py <work>/fam.json --xy8`.
4. **Build** (`cd <dir> && python3 build.py --no-checks`; add `--target erewhon`, then `--target xanadu`, for
   `settlements/xanadu`):
   - settlements: xanadu, pher, kirstabal, thalaba, lightwall, qiblai, strongwall, flashing-eye, viridian, azure-dream;
   - openworld: xanadu-lake-shore, xanadu-north-shore, xanadu-oidong-highrift.
5. **Measure on a lane.** Take the Arc: it is the lane that fails at 16, and the timing default. One worker per lane;
   the queue serialises the rest.
   ```
   KRATOR_GL=gpu XS0_VIEWS=6 XS0_QUERY=?shadow=1 python3 tools/harness.py lock --lane arc -- python3 settlements/xanadu/xs0/xs0_measure.py <work>/g1.json erewhon kirstabal qiblai viridian thalaba-pieces azure-dream azure-dream-summit azure-dream-west-end azure-dream-north-shore azure-dream-east-end
   ```
   - Then the ten measured here, to confirm them on the GPU: xanadu-sheet pher thalaba lightwall strongwall flashing-eye
     viridian-sheet xanadu-lake-shore xanadu-north-shore xanadu-oidong-highrift.
   - The harness's first line must name the Arc (`gpu-renderer`), not SwiftShader. The watchdog and the heartbeat rule
     apply (CLAUDE.md).
   - Optional: the `rtx` lane on the Flashing Eye and Erewhon, for a second driver's count.
6. **Fold and write.**
   - Run `python3 settlements/xanadu/xs0/xs0_report.py settlements/xanadu/XS0-MEASURE.json <work>`. It prints one line
     per page. A `noshadow.json` run (`XS0_QUERY=`, `XS0_VIEWS=1`) adds an `as_shipped` read to the regions.
   - Update sections 2-5 here. Section 3's question is whether any page is at 13 or above, and the Flashing Eye's 9
     confirmed or not.
   - Commit only `settlements/xanadu/XS0-MEASURE.md`, `XS0-MEASURE.json` and `xs0/`, with `python3 tools/commit.py -F msg.txt`.
   - Push `claude/xs0-measure`.
   - Change no pages, and write no baselines.

**What the cloud run cost:** about 5 to 21 minutes a page on SwiftShader at six views (the Oidong-Highrift region: 21 minutes).
Three workers on four cores did 10 pages in about 2 hours.
