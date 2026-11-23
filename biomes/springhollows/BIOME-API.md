# biomes/springhollows — API & Host Contract (`Sikwīngi-Khālōyi`)

**Springhollows** (`rmvyiyw8ucd1y` on Scale Model `5.1`, `56,684 km²`, `+996..+2,525 m`, `1.41–1.17 atm`, `100% Cfa`, `100% carbonate`, `limestone = 255`, `zinc = 90`) is the dissected cherty-dolomite karst and purple-red rhyolite porphyry shut-in plateau of eastern `Ria Valley`.

## 1. Pure `[G data]` Modules

### `HOLLOW_PHYS` (`src/15-springhollows-phys.js`)
Engine-neutral functions with zero `THREE`, zero `DOM`, and deterministic `KRAND` hashing:
- `HOLLOW_PHYS.pressureAtElev(elevM) -> number` — barometric pressure (`1.41 atm` at `+996 m`, `1.33 atm` at `+1,480 m`).
- `HOLLOW_PHYS.porphyryDikeAt(x, z, site) -> {inDike, signedDistM, centerDistM, dikeStrikeRad, rockHardness01, strataKind}` — lateral contact between flat-lying soluble `'carbonate-shelf'` cream cherty dolostone (`0.42`) and strike-aligned insoluble purple-red `'porphyry-dike'` ribs (`0.96`).
- `HOLLOW_PHYS.shutInFlowAt({qM3s, inDike, signedDistM, baseSlope}) -> {channelWidthM, depthM, velMs, froude, whitewater01, liftBypassReq}` — `9109` `Chīng-Mā` continuity & Manning/Froude constriction (`>= 65 m` calm dolomite reaches `Fr < 0.35` pinching to `<= 24 m` supercritical porphyry chutes `Fr > 1.15`, `liftBypassReq === true`).
- `HOLLOW_PHYS.mammothSpringAt({headDropM, conduitAreaM2, spiderSeepShare01, airTempC}) -> {qSpringM3s, tempC, caMgPpm, sapphireDepthM, mistPlume01}` — first-magnitude artesian resurgence hydraulics (`12–34 m³/s` at constant `+17.5..+21.5 °C`).
- `HOLLOW_PHYS.mvtCrystalAt({dikeDistM, spiderSeepShare01, depthBelowTableM, gKrator}) -> {speleoPreset, maxBeamLenM, celestineShare01, galenaZinc01}` — `0.75 g` (`g = 7.4 m/s²`) Mississippi-Valley-Type (`MVT`) `KSPELEO.CALCITE` crystal window (`14.0–14.5 m` pale-blue `SrSO4` celestine megabeams + honey calcite druse + `zinc = 90` galena-sphalerite ore).
- `HOLLOW_PHYS.caveMouthGlowAt({skyOpenness01, springHumidity01, isNight}) -> {tufaAccretionMmYr, bryoCover01, biolumRadiance01}` — confines `tufabryum` to humid twilight cave brows (`0.04 <= skyOpenness01 <= 0.42`), glowing `495 nm` cyan-jade at dusk/night.
- `HOLLOW_PHYS.ecocideScarAt(x, z, site) -> {inBleachBelt, yearsPostCataclysm, hardpan01, stranglerFront01}` — Ancient defoliant bleach-belt hardpan swath & marginal `stranglervine` recovery front.
- `HOLLOW_PHYS.hazardSpec(key)` — validated `KHAZ.make` records for `'shutin'`, `'fenestre'`, `'sump'`, and `'crystal'`.

### `SPRINGHOLLOWS_CROPS` (`src/22-springhollows-crops.js`)
Registers `CROPS.BIOMES.springhollows` across `springrun`, `terrace`, `glade`, and `cavern` (`97` compatible crops with `dark-beds`, including `saffron`, `whorl-olive`, `rice`, `wild-rice`, `acorn`, `tea`, `mulberry`, `alecap`, and `glow-mushroom`).

### `SPRINGHOLLOWS_FAUNA` (`src/24-springhollows-fauna.js`)
Registers 6 native karst & shut-in species (`alabastercraw`, `springhellbender`, `fenestregnat`, `porphyrylizard`, `shutinkingfisher`, `chinkapingrouse`) with `stateAt(key, hour24)` and `forStation(stationId)`.

## 2. Kit & Station Pages (`BIO.kit('springhollows')`)

- `SPRINGHOLLOWS.SPECIES` (`8` species): `springcypress`, `chinkapinoak`, `porphyrypine`, `redbudkarst`, `tufabryum`, `calaminefern`, `springsponge`, `stranglervine`.
- `SPRINGHOLLOWS.placeAll(opt)` — deterministic cell-seeded placement (`src/60-springhollows-place.js`).
- **4 Built Stations (`dist/springhollows*.html` + shared `dist/springhollows.tex.springhollows.js` sidecar):**
  1. `spring` (`dist/springhollows.html`) — `(1144, 168)` `cav_ozarks_resurgence` `24 m` cave mouth, sapphire boil, bald-cypress knees & `tufabryum` curtains.
  2. `shutin` (`dist/springhollows-shutin.html`) — `(1224, 158)` `Chīng-Mā` purple-red rhyolite porphyry shut-in gorge & `site:high-ria-boatlift`.
  3. `fenestre` (`dist/springhollows-fenestre.html`) — `(1212, 174)` collapsed `18 m` sinkhole skylight & walk-in `KSPELEO.CALCITE` `10–14 m` celestine/calcite/onyx cavern.
  4. `glade` (`dist/springhollows-glade.html`) — `(1176, 184)` cherty-dolomite & porphyry glade, `saffron`/`whorl-olive` terraces, onyx chert-bridge hollow & Ancient bleach-scar.
