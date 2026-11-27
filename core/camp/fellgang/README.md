# core/camp/fellgang: Traveller, Kradz and Fellgang band rows (opt-in)

`52-camp-fellgang.js` registers three `KCAMP.CULTURES` rows at load (`WEST-RIFT-SCOPE.md` sections 3b and 3d; `kits/tungang/PLAN.md` section 3.3):

- **`traveller`**: surface road Travellers (`fg-wagon` dwelling vardos, `fg-bender` and `fg-halt` sleeping pitches, `fg-tinsmith` work pitch, `fg-pens` hurdle pony paddocks; `horseshoe` default). Used by `settlements/blakhed` (`The Winterings`) and West Rift road halts / Line portal gaps.
- **`traveller-kradz`**: the Kradz dark-clan (`fg-wagon`, `fg-halt`, `fg-ropehouse` shaft riggers, `fg-tinsmith`, `fg-store`, `fg-pens`).
- **`fellgang-band`**: Fellgang and Wildcat war-camp / raiding band row (`band: [25, 60]`, `idle: [['raider', 0.65], ['hunter', 0.35]]`), compatible with `50-camp-outlaw.js` (`KCAMP.outlawCamp`, `KCAMP.lookout`).

**Why a subfolder.** Like `core/hamlet/fellgang/22-hamlet-fellgang.js`, keeping the West Rift rows opt-in leaves unrelated openworld and biome pages byte-identical unless a build lists `core/camp/fellgang/52-camp-fellgang.js`.

**Tests:** `node core/camp/test-camp.js` and `node core/camp/test-camp-outlaw.js`.

Plain data, `[G data]`: no three.js, no DOM.
