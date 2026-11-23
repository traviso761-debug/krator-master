# `kits/dilihan` — Known Issues & Shared-Kit Boundaries

1. **Shared Vernacular & Hinterland Trades (`src/73d-dil-trades.js`):**
   - Because Dilihan is an Iziz vassal city built alongside `kits/iziz-vernacular` and `settlements/jimjam` (`VASSAL-KITS.md`), rural livestock/fungus/orchard slots (`vern_farmhouse`, `vern_byre`, `vern_pens`, `vern_fungus_shed`), downwind tanning (`vern_tannery`), municipal power (`vern_generator`), schools (`vern_school`, `jj_school`), NE skarn mining (`dl_skarn_adit`, `vern_mine`), and the Governor's Palace (`dl_gov_palace`) are carried by paired Vernacular/Jimjam/bespoke buildings in `settlements/dilihan` and recorded as `gap` notes in `DL_TRADES`.
2. **Solid Sheet Bodies:**
   - Like `kits/iziz-vernacular`'s standalone sheet (`VERN.interiors = false`), the kit sheet builds solid masonry bodies with locked `KDOOR` leaves and `KGLASS` / room-card windows; furnished interiors in `settlements/dilihan` live in the Governor's Palace and civic landmarks (`KFURN`).
