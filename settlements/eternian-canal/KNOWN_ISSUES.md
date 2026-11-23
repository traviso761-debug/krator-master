# `settlements/eternian-canal` — Known Issues & Ride-Along Notes

1. **Canal works & canal vessels extracted to `kits/transit/` (`KCANAL` / `TR_VESSEL`):**
   - Reusable multi-pound canal `[G data]` kinematics, miter-lock scheduling, street-clip / `KMASK` canal masking, multi-culture canal works (`styles.eternian`, `republican`, `marr`, `dalab`, `voth`), and `'vessel'`-tagged canal hulls (`et_canal_barge`, `et_tow_scow`, `et_inspection_launch`) now live in `kits/transit/src/` and are read in place by `settlements/eternian-canal/build.py`.
2. **Promote typed canal-way strategies into `core/city/`:**
   - `KCANAL.SPECS` (`canal_trunk`, `canal_ward`, `canal_feeder`), `KCANAL.clipStreetWays`, `waterFront` lot detection, and bridge air-draft enforcement in `kits/transit/src/40-tr-canal.js` and `settlements/eternian-canal/src/42-ec-city.js` (`[G data]`) are ready for other canal settlements (*Fulcrum / Eternal City* `px 625, 725`, *Slussport*, Marr, Dalab) to consume directly from `kits/transit`.
3. **Human lock-keepers & towpath bargemen:**
   - Barges (`TRANSIT_COURSES`) and bronze miter gates (`EC_GATE_LEAVES`) animate deterministically on `KSCHED`; animated citizen crowds from `core/charactermodels` (`peoples.json` Eternian set) are deferred to the settlement-wide citizen crowd pass.
