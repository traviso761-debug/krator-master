# `settlements/floating-city` — Known Issues

- **Citizen Bodies**: Citizens use instanced low-poly markers (`src/70-fc-chars.js`) riding both fixed promenades and floating pontoon `wardGroups`; full skinned `core/charactermodels` crowds are deferred to the open-world integration pass.
- **Open-World Tile Streaming**: Built as a standalone `4.4 km × 4.4 km` `1:1` site page (`dist/floating-city.html`) with a `16 km` `KFAR` Ria Sound & East Bluff (`Suudme-Kuluuna`) horizon ring; streaming into `openworld/` follows `openworld/PLAN-SITES.md`.
