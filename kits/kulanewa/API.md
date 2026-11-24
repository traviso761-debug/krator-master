# `kits/kulanewa` — API Reference

## Kit Identity, Trades & Settlement Bundle (`src/26k-kit.js`, `src/72-kl-trades.js`, `kit_bundle.py`)

- `KIT`: `{ id: 'kulanewa', pack: 'kulanewa', culture: 'kulanewa', faction: 'The Kulanewa Free-Towns', band: 'Pak-Ma and Tong-Ma', frag: 'kits/kulanewa' }`
- `KL_FACTIONS`: `{ karum, ikki }` — political, economic, and emblematic metadata for the *Kārum* Ledger-Syndicates and *Kūla-Nā* Covenant-Communes.
- `DEFS`: 42 `defBuilding` entries (`21` with `tags.style === 'karum'`, seeds `8101..8121`, and `21` with `tags.style === 'ikki'`, seeds `8122..8142`), covering all 6 `(poor | middle | rich) x (dwelling-single | dwelling-multi)` residential cells in both styles plus `military` and `infrastructure` rosters.
- `KL_TRADES` / `klTradeDefs(style)` (`[G data]`): all 44 Voth census trades mapped to `karum` (`kl_karum_*`) and `ikki` (`kl_ikki_*`) building keys.
- `klDims()`: returns `{ [key]: { cls, name, w, d, h, fw, fd, style, wealth, types, role, job, cut, variants } }` for `core/city` layout consumers.
- `kit_bundle.bundle(key='KLK')` (`kits/kulanewa/kit_bundle.py`): seals the kit in one closure exposing `KLK.proto(key, v)`, `KLK.dims()`, `KLK.trades`, `KLK.tradeDefs(style)`, `KLK.factions`, and `KLK.errors`.

## Vertical-Stack Graphics (`src/27v-kl-vstack.js`, `src/91r-kl-roomlight.js`)

- **Stage 5 & `K1` (`27v-kl-vstack.js`):** Uniform-deduplicated `uKmSpec`, `uKmBreak` & sine-free 3D hash (`<= 28` compiled WebGL programs, `<= 12` active samplers), `KMAT_M1.GLSL_COMMON` `km1RoughAA` mip-variance specular AA (`mip-variance.json`), 6-step planar POM (`uPomDepth`, `< 18 m`) on `"height": true` masonry families (`kura`, `sootstone`, `kilnbrick`, `ashlar`, `paving`, `cobble`), and plot-base contact AO (`0.74 -> 1.00`) + concave mortar cavity.
- **Stage 7 `KROOMLIGHT` (`91r-kl-roomlight.js`, `window._klRoomLight`):** Builds a doorway/window room-light graph via `KROOMLIGHT.buildTable` over `CURREC.rooms` (recorded automatically by `klRoom`, `klWallRing`, and `klHoopedFrustum`) and drives a 6-`PointLight` portal-daylight & warm-lamp pool via `KROOMLIGHT.pickPool`.

## 4-Register Architectural Helpers (`src/40-kl-kit.js`, `src/42-kl-crowns.js`, `// prefix: kl`)

- **`AF3` Ground Register:** `klKuraPlinth`, `klUdatsuWall`, `klKiyomizuTrestle`, `klWaterChannel`, `klTimberBridge`, `klFireShutterWindow`.
- **`Style A` Mid-Register:** `klToranaDoor`, `klSanjhyaOriel`, `klDadoFrieze`, `klWall`, `klWallRing`, `klCedarPost`, `klTimberColonnade`, `klParapet`.
- **`AF4` Vertical Accent:** `klHoopedFrustum`, `klSkywalk`.
- **`AF1` Crown & Hydro:** `klNewarRoof`, `klBellCupola` (octagonal cast-bronze belfry, zero royal *Prasat* spires), `klMillWheel`, `klSteelyard`, `klDerrickCrane`, `klBanner`.
- **Walk, Ceiling & Room Utilities:** `klNoCut`, `klBelowGrade`, `klTarget`, `klRoom`, `klFurnList`, `klWallBlock`, `klFloorSlab`, `klFloorDisc`, `klCeilingSlab`, `klStripWalk`, `klStair`.

## Verification Probe (`window._api`, `src/99-host-tz-kl.js`)

- `_api.doorsAudit()`, `_api.reachAudit()`, `_api.ceilingAudit()`, `_api.texturesAudit()`, `_api.zfightAudit()`, `_api.tradesAudit()`, `_api.vstackAudit()`, `_api.fingerprint()`, `_api.rebuild()`.
