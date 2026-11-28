# `settlements/floating-city` — Runtime & Host API

## Page Globals (`[G data]` + `[web]`)

- `FC_SITE`: Deterministic Ria Sound `[635, 138]` bathymetry (`elevAt(x, z)`), `+38.0 m` woody trimline (`WOODY_TRIM_Y`), `+65.0 m` mainland residential refuge floor (`SAFE_DWELL_Y`), `WATERFALLS` (`2`), `CLIFF_HOISTS` (`4`), and `CHIME_WELL`.
- `FC_TIDE`: Wraps `WATER.tide` (`core/water/ext/63-core-water-tide.js`) and binds `KHAZ.TIDE.bench` + `4× KHAZ.TIDE.race` onto `KTAGS.page`.
- `FC_MEGA.plan()`: Returns plain `[G data]` structural records for `submarineCone`, `seaRing`, `sumeru`, `dykes`, `nagaWalks`, `salaPavilions`, and `zigguratPods`.
- `FC_CITY.buildPlans()`: Deterministic multi-kit layout (`KLK` `'suudme'` + `RIK` `'lower-ria'`/`'upper-ria'`) across `bluff`, `dykes`, and all `28` `pontoons`, plus `29` `bascules` and `walkGraph`.
- `window._api.setTideState(mode)`: Switches `'ebb' | 'slack' | 'flood' | 'surge' | 'drawdown' | 'clock'`, updating both water basins, all `28` pontoons, `29` bascules, miter-lock gates, moored `RINGSEA` vessels, and `KHAZ.TIDE`.
- `window._api.setSubmarineCut(on)`: Toggles the submarine cutaway plane (`C` key) exposing the `-12 m -> -90 m` Hydro-Dynamo Cone & `-62 m` Control Hall.
