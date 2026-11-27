# Skywatch — Known Issues (`settlements/skywatch`)

1. **Standalone `56 × 56 km` Scale Model 5.1 bake prior to streamed `core/world` region:**
   - Skywatch bakes a deterministic `29 × 29` (`56 × 56 km`) heightfield cut and `360°` horizon profile directly from `tools/scale-model/model/data/h.png` (`src/28-sw-model.js`) so its alpine saddle (`+3,745.5 m`), WNW crag (`+3,817.3 m`), and horizon sightlines match Scale Model 5.1 today. When a northern Jimjam–Sasquatch `openworld/<region>` tile set is extracted onto `core/world`, `SW_LAYOUT` (`[G data]`) can be mounted directly onto `WORLD.H`.
2. **Cutaway interiors on bespoke masonry landmarks:**
   - Highlands `rustic` and Republican buildings (`hl_rep_guild_astro`, `hl_rus_*`) expose full `ROOM()` furniture cutaway via `core/host`'s cutaway slider (`hlfUnits`), whereas Jimjam masonry shells (`JJ.place`) and solid basalt monuments (`sw_moot_monolith`, `sw_beacon_tower`) remain exterior architectural massing until `settlements/jimjam` gains `kits/interiors` floorplans.
