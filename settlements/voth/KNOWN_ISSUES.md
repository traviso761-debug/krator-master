# Voth — known issues

Open items start with `- [ ]` (build.py prints them after every build).

Collected on 2026-10-01 from Voth's own docs, source comments, baseline, agent
definitions, git history and sibling builds' KNOWN_ISSUES. Each item names its
source in brackets. Pitfalls that are lessons rather than defects stay in
`SUBAGENT.md` section 6.

## Simulation and life layer

- [ ] Citizens carry `race` and a null `socialClass`, but no faction, sub-faction or job, and `race` changes no behaviour. The root README asks every person for a faction, a sub-faction and a job. [root README "Life/simulation layer"; 78f-life-citizens.js header and line 632]
- [ ] `LIFE_HOUR_BEHAVIOR` (the per-hour schedule slot) is still 24 nulls and nothing reads it. Shopkeepers, workers and the fortress gate use their own fixed 6/18 hours instead. [78f-life-citizens.js:38; 82-daynight.js:6; baseline `_shopkeepers`, `_compoundWorkers`]
- [ ] `ATTRACTORS` is written in 30a-layout-districts.js but nothing reads it, so the crowd is not weighted by attractors as the life brief asks. [voth-life-layer-brief.md §4 and §6; grep: no reader outside 30a]
- [ ] There is no tier-3 GPU crowd. About 540 pedestrians plus shopkeepers run on the CPU, against the brief's 1000+ GPU tier. [voth-life-layer-brief.md §1 and §4; 78f-life-citizens.js:567]
- [ ] Width is not an attribute of graph edges: there is no `clearW` and no `_narrow`. Wide caravans are kept off the river bridges by a destination rule written into the code. [voth-life-layer-brief.md §5; 78i-life-trade.js:180]
- [ ] The life brief's acceptance diagnostics `_conflicts`, `_routeFail` and `_narrow` are not published. [voth-life-layer-brief.md §8; grep finds none in src]
- [ ] Pedestrians, ordinator squads, pilgrims and carts have no separation between groups. Runtime avoidance (`LIFE_AVOID_*`) covers canoes, ferries, ships and barges only. [voth-life-layer-brief.md §3; 78d-life-ferries-barges.js:901]
- [ ] Dhows are not in the avoidance arrays, so they neither dodge other traffic nor carry a night lantern (the boat lanterns read `LIFE_AVOID_X/Z`). [78e-life-dhows.js:34; 82-daynight.js:294-302]
- [ ] Vessels do not queue at a dock. Avoidance only nudges them sideways, and holding back for an occupied stop is "the next piece, not yet built". [78b-life-nav.js:595, :622]
- [ ] `lifeGroundY()` does not know every raised surface. Any population on a precinct with its own floor (the abbey, compound plinths) must be given that floor explicitly. [API.md; SUBAGENT.md §6 "Spatial tests"]
- [ ] The per-canton cap of 100 pedestrians on residential cantons is not enforced. Only the per-door cap and the global `LIFE_PED_N` limit them. [78f-life-citizens.js header]

## Placement and layout

- [ ] `_districtIntrusions` is 1: one town, compound or manor footprint stands inside a district polygon. The districts brief's acceptance check is zero. [baseline.json; voth-districts-brief.md §5; 69-district-content.js:466]
- [ ] The owner asked for mushroom farms "in the abbey compound". All three hand-picked spots are refused (`_mushroomFillAbbey` placed 0 of 3). [baseline.json; 71-industry.js:630-656]
- [ ] `footing().hi` takes the highest of nine samples. On real slope the low corner floats. The midpoint is a mitigation, and the real fix is ground sampling per element. [SUBAGENT.md §6 "Spatial tests"]
- [ ] Some shallow road crossings are culled, which leaves local dead ends (`_warrenDeadEnds` 146 in the baseline). [30c-roads.js:232-240; baseline.json]
- [ ] `CHINP` is the only complete tuning block. Other fragments keep their magic numbers inline. [API.md §9]
- [ ] Flora carries no biome or harvest tags, and buildings carry no culture or type tags. The root README asks for both. [root README, first paragraph; grep finds no tag fields in 65c-flora.js, 70-veg.js or `PLACED`]

## Rendering and performance

- [ ] No LOD: the city draws all ~4.27 M triangles and ~118 k instances at full detail at every distance, and the baked buckets set `frustumCulled = false`. Only `catalog/` has LOD (`lod.js`). [baseline.json; 45-kit.js:473; catalog/README.md; the same gap is open in yuni and iziz]
- [x] Night at 21:00 is too bright under the gas giant. Mav's Refuge and Girder report this with sky and day/night code forked from Voth's. [mavs-refuge and girder KNOWN_ISSUES; 82-daynight.js:54-80] 2026-10-01: checked in a Voth night frame: the city read as late dusk and the bay was the brightest thing in it. The owner's night floors (HEMI_NIGHT_I/AMB_NIGHT_I 0.16/0.11, which the lamp gains in 45-kit.js are tuned against) stay. Planetshine fill 0.13/0.07 -> 0.05/0.02; the giant's key 0.30 -> 0.15 x phase (SKY_SHINE_KEY, 21-sky); DN_SHINE_NL_CUT 0.28 -> 0.08 so lamps and windows stay the main light; the night hemisphere lerps to a cool sea-mist blue-grey (0x56698a) over dark brackish mud (0x27241f). The water shader was lit at full day strength around the clock: it now takes `uBodyK` (body colour x 0.30 at night) and `uSpecCol` (glitter follows the key's colour and strength, so the giant lays a dim cool path on the bay), both 1 / the original warm white by day (75-terrain, 82-daynight). Eclipse twilight is unchanged (that fill never rode on planetshine here). 21:00 under a full giant: hemi 0.312 -> 0.226, ambient 0.215 -> 0.162, key 0.370 -> 0.185, nightK 0.72 -> 0.92. Noon unchanged. No draw calls or counters added.
- [ ] The inspector names the asset and its type, but not the classification and tags the root README asks for (biome, culture, building vs flora vs furniture vs life). [root README "DEV TOOLS"; 86-inspect.js]
- [ ] The terrain is a static 400×400 heightfield (~47 units a cell at the quarry belt) and cannot be carved. Pits and cuts must be built up as landform. [SUBAGENT.md §6 "Rendering architecture"]
- [ ] The volcano was too dark and contrasty and its plume too heavy. The owner flagged this, and 20-stage.js records two or more softening passes, but no sign-off is recorded. [.claude/agents/voth-atmosphere.md; 20-stage.js:336-372]

## Tooling and docs

- [ ] `verify.py` fails falsely about one run in seven (`Cannot read properties of null (reading 'trim')` in three.js `acquireProgram` under SwiftShader). Re-run it, and treat the failure as real only if every run fails. [SUBAGENT.md §6 "The harness"]
- [ ] `verify.py` cannot see errors that only fire on interaction, such as UI buttons that call retired globals. [SUBAGENT.md §6 "The harness"]
- [ ] Headless runs use SwiftShader, which forgives undefined GLSL that real GPUs turn to NaN. Clamp anything fed to `pow`, `sqrt`, `asin`, `acos` or a divide. [SUBAGENT.md §6 "The harness"]
- [ ] The draw-call count is a sample from one frame that varies by 1–2 as moving populations leave the frustum (73 in the baseline, against a ceiling of 84). [API.md §6; SUBAGENT.md §6]
- [ ] The agent definitions are stale. voth-facade and voth-texture name a "Clan quarter" preset that 80-camera.js removed (it is now "Clan village"), and `verify.py` prints "view failed" for it. voth-atmosphere still says "No day/night cycle" and lists only 20-stage.js, but the sky and the clock are now in 21-sky.js and 82-daynight.js. [.claude/agents/voth-*.md; 80-camera.js:58]
- [ ] `catalog/CITY_INVENTORY.md` cites source lines in fragments that no longer exist (`65-facade.js:2429`, `50-cantons.js:3812`, ...), because they were split in 767869c. Rerun `catalog/capture/capture.py`. [catalog/CITY_INVENTORY.md; git 767869c]
- [ ] The comment at 65d-canton-structures.js:30 says a 45-kit.js bug makes every cloth instance invisible. That bug has since been fixed (the `uWindTime` declaration in `applyClothSway`). Correct the comment the next time that fragment is edited. [65d-canton-structures.js:30; 45-kit.js:116-128]
- [ ] Two copies of Voth exist. The World Menagerie's recovered port (`host/WorldMenagerie/src/voth/`) is a separate copy with its comments stripped, and fixes made here do not reach it. It is not served (host/README.md). [git 9f4bf5a, b6b08dc; host/README.md]

## Checked and not shared

- [x] World-UV program cache key: Voth is not affected by the `69b-vern-mat` / `vWorldUV` bug (xanadu KNOWN_ISSUES). `emitBuckets()` sets `customProgramCacheKey` to include the UV scale and the sway and night-light variants (45-kit.js:455), and the sky and ship materials set their own keys.
- [x] Voth vendors no shared fragments and reads nothing from `core/`, so `build.py` has no `--vendor-check`. Mav's Refuge, Girder, Yuni and Locus fork *from* Voth (21-sky.js, 82-daynight.js). Their local changes, such as Mav's below-horizon fog blend and later twilight, are deliberate drift and are not upstream fixes.
- [x] PASS5.md, all four changes have landed: the Lighthouse canton replaces the islet and the shoal chain is gone (30c-roads.js:887), solid reclaimed causeways skip stepping-stones, the lesser south-west compounds are in (30c-roads.js:861, 60-land.js:962), and the warren extends east (30b-mainland-shore.js:32).
- [x] Districts brief: districts, `districtAt`, the market and garden cantons, `CPIERS`, the exotic park species (`_exotic`), and the funerary district with graves, tombs and temple are all built.
- [x] Loader race ("BUILD is not defined", where the loading screen never cleared): fixed in 3e30d95 and 079529b.
- [x] Cloth sway made banners invisible, and swayed only on x: fixed in 45-kit.js `applyClothSway`.
- [x] Ordinator, caravan, taxi, boat and strider-car night lanterns are tracked (82-daynight.js:288-305). The comment at 82-daynight.js:150 that calls them out of scope is stale.
