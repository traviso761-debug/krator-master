# kits/highlands: known issues

- [x] (2026-11-21) **Full Voth census trade coverage for the Slavic / Carpathian / Novgorodian `rustic` Highland set (`src/81c-rus-trades.js`, `src/81d-rus-water.js`, `src/89-hl-trades.js`).**
      Added 33 `hl_rus_*` craft, food, hospitality, civic, sacred, *ostrog* defence, agricultural, and highland lake/fjord/riverfront buildings (`80-rus-dwell.js` and `81-rus-village.js` kept untouched so vendored copies in `settlements/dalab` and `settlements/reedlake` incur zero vendor drift). `HL_TRADES` now carries 41 of 44 Voth census trades across `republican` and `rustic` with **0 gaps and 0 partial rows**, leaving `na` only on the 3 non-highland tropical/arthropod rows (`chinampa growers`, `beetle herders`, `elephant bug handlers and station hands`).
- [x] (2026-11-19) **Painted Men (`tribal`) separated into standalone `kits/painted-men/`.**
      `kits/highlands` holds purely the `republican` and `rustic` sets with Slavic / Rus' / Carpathian woodcarving, *rospis'*, *nalichniki*, *prichelina*, *okhlupen'*, and solar *rozetka* / *kolovrat* motifs.

See `settlements/highlands/KNOWN_ISSUES.md` for settlement-level notes on Roketstad's terrain doors and `?interiors=1` hollow-wall reachability.
