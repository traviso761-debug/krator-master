# `kits/molu-che` — API Reference

## Kit Identity, Trades & Settlement Bundle (`src/26k-kit.js`, `src/72-mc-trades.js`, `kit_bundle.py`)

- `KIT`: `{ id: 'molu-che', pack: 'molu-che', culture: 'molu-che', faction: 'Molu-Che Fossorial Clans of Moleshelf', band: 'Moleshelf', frag: 'kits/molu-che' }`
- `MC_CLANS`: `{ dikengyuan, bonduwe }` — biological, political, and economic metadata for the Bench Pastoral/Craft Clans and the *Dīpü-Bōnduwe* Bonded Strong-Vault & Bypass Guilds.
- `DEFS`: 38 `defBuilding` entries (`19` with `tags.style === 'dikengyuan'`, seeds `8301..8319`, and `19` with `tags.style === 'bonduwe'`, seeds `8320..8338`), covering all 6 `(poor | middle | rich) x (dwelling-single | dwelling-multi)` residential cells in both styles plus `military` and `infrastructure` rosters.
- `MC_TRADES` / `mcTradeDefs(style)` (`[G data]`): all 44 Voth census trades mapped to `dikengyuan` and `bonduwe` `mc_*` building keys.
- `mcDims()`: returns `{ [key]: { cls, name, w, d, h, fw, fd, style, wealth, types, role, job, cut, variants } }` for `core/city` layout consumers.
- `kit_bundle.bundle(key='MCK')` (`kits/molu-che/kit_bundle.py`): seals the kit in one closure exposing `MCK.proto(key, v)`, `MCK.dims()`, `MCK.trades`, `MCK.tradeDefs(style)`, `MCK.clans`, and `MCK.errors`.

## Vertical-Stack Graphics (`src/27v-mc-vstack.js`, `src/91r-mc-roomlight.js`)

- **Stage 5 & `K1` (`27v-mc-vstack.js`):** Uniform-deduplicated `uKmSpec`, `uKmBreak` & sine-free 3D hash (`<= 28` compiled WebGL programs, `<= 12` active samplers), `KMAT_M1.GLSL_COMMON` `km1RoughAA` mip-variance specular AA (`mip-variance.json`), 6-step planar POM (`uPomDepth`, `< 18 m`) on `"height": true` families (`loess`, `rammed`, `limewash`, `dolomite`, `kilnbrick`, `basalt`, `paving`, `cobble`), and plot-base contact AO (`0.74 -> 1.00`) + concave mortar/pore cavity.
- **Stage 7 `KROOMLIGHT` (`91r-mc-roomlight.js`, `window._mcRoomLight`):** Builds a doorway/lunette room-light graph via `KROOMLIGHT.buildTable` over `CURREC.rooms` (blocking daylight in sealed `vault: true` *bōnduwe* strongrooms while attenuating portal daylight across *yaodong* chambers) and drives a 6-`PointLight` pool via `KROOMLIGHT.pickPool`.

## Sunken *Dikengyuan* & *Yaodong* Helpers (`src/40-mc-kit.js`, `src/42-mc-props.js`, `// prefix: mc`)

- **Sunken Courtyard & Vault Wings:** `mcBasePad`, `mcEntryRamp`, `mcStair`, `mcCourtyardStair`, `mcVaultWing`, `mcYaodongPortal`, `mcWindowLunette`, `mcCucuteniFrieze`, `mcWall`, `mcWallRing`, `mcSkywellRim`, `mcTerraceLink`, `mcArcadeColonnade`, `mcWaterPool`.
- **Steppe, *Talpathere* & Bypass Props:** `mcVentHood`, `mcSeismicStone`, `mcCisternWell`, `mcTalpathereStall`, `mcCaravanSled`, `mcSteelyardAssay`, `mcCapstanMill`, `mcDowndraftKiln`, `mcPortcullisGate`, `mcDryingMats`, `mcBanner`.
- **Walk, Ceiling & Room Utilities:** `mcNoCut`, `mcBelowGrade`, `mcTarget`, `mcRoom`, `mcFurnList`, `mcWallBlock`, `mcFloorSlab`, `mcCeilingSlab`, `mcStripWalk`.

## Verification Probe (`window._api`, `src/99-host-tz-mc.js`)

- `_api.doorsAudit()`, `_api.reachAudit()`, `_api.ceilingAudit()`, `_api.texturesAudit()`, `_api.zfightAudit()`, `_api.tradesAudit()`, `_api.vstackAudit()`, `_api.fingerprint()`, `_api.rebuild()`.
