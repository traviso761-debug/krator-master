# biomes/springhollows — Fragment Index

Built via `python3 tools/build.py biomes/springhollows` (plus `--station shutin`, `--station fenestre`, `--station glade`) into `dist/springhollows[-<station>].html` + `dist/springhollows.tex.springhollows.js`.

| Fragment | Tag | Purpose |
|---|---|---|
| `src/00-head.html` | `[web]` | HTML page shell & r128 script tag |
| `src/15-springhollows-phys.js` | `[G data]` | `HOLLOW_PHYS` (`porphyryDikeAt`, `shutInFlowAt`, `mammothSpringAt`, `mvtCrystalAt`, `caveMouthGlowAt`, `ecocideScarAt`, `hazardSpec`) & `HOLLOW_SITES` |
| `src/22-springhollows-crops.js` | `[G data]` | `CROPS.BIOMES.springhollows` (`springrun`, `terrace`, `glade`, `cavern`) |
| `src/24-springhollows-fauna.js` | `[G data]` | `SPRINGHOLLOWS_FAUNA`: 6 species & 24h schedules |
| `stations/*/44z-host-site.js` | `[G data]` | Station selector (`spring`, `shutin`, `fenestre`, `glade`) |
| `src/45-host-stage.js` | `[web]` | Renderer, 4-station karst/porphyry heightfields, hydrology, `KSPACE`, `BIO.init` |
| `src/46-sh-vstack.js` | `[G shader]` | Native vertical-stack graphics (`BIO.INDEX_ITEMS`, `BIO.LOD`, `B4` card fringe dilation, `B2` base/crown AO, `S6` chromatic terrain tint, `M2` `km1RoughAA`) |
| `src/50-springhollows-species.js` | `[draw]` | `SPRINGHOLLOWS.SPECIES` (8 species), library PBR & card materials, `BIO.flareJoin` trees, octahedral impostors |
| `src/60-springhollows-place.js` | `[G data]` | Deterministic `KRAND.cell` placement across surface, twilight cave-mouths & dark caverns |
| `src/70-springhollows.js` | `[G data]` | Public `window.SPRINGHOLLOWS` kit seal |
| `src/84-host-ground.js` | `[draw]` | `KGROUND` (`<= 3` height-blended layers), `KSTRATA`, `KDRAWN`, walk-in `KKARST` + `KCAVERN` + `KCAVERN.cutLayer` + `KSPELEO.CALCITE`/`LIMESTONE` caverns |
| `src/85-host-far.js` | `[web]` | `KFAR` far horizon mesh & sampler-guarded `KHORIZON` occlusion |
| `src/86-host-works.js` | `[draw]` | `site:*` settlement reserves, `KHAZ` hazards & `?works=0` High-Ria cut-dolomite stelae |
| `src/88-host-place.js` | `[G data]` | `STATION_BUILD` entry point |
| `src/89-host-sky.js` | `[G native]` | `ATMOS.skyBiome` at exact Scale-Model `5.1` shifted `(px - 272, py - 330)` sky coordinates |
| `src/89a-host-atmos.js` | `[G shader]` | `ATMOS` wind, height fog, cave-mouth condensation mist & Station 3 volumetric fenestre sunbeam shaft |
| `src/89w-host-water.js` | `[draw]` | `WATER.still` sapphire boils/sumps, `WATER.flow` spring-runs & shut-in chutes, `WATER.mirrorSwitch` (off at load) |
| `src/89z-host-build.js` | `[web]` | `WATER.fields`, `BIO.bake()`, `SH_VSTACK.applyPostBake`, `BIO.setA2C`, `BIO.bakeImpostors`, `KSHADOW` (off at load) |
| `src/99-host-take.js` | `[draw]` | Punctuation-free `VIEWS`, UI controls, inspector `describe`, `hostChecks` & `KHOST.take` |
| `src/99-tail.html` | `[web]` | Closes `<script></body></html>` |
