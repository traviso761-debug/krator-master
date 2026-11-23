# kits/ancient-transit/opt: Opt-in Rift Line (`line` kind) fragments

Opt-in fragments from the Rift Line design (`biomes/line/PLAN.md`, `claude/loj-twenny-059a5e`), kept in `opt/` so `kits/ancient-transit/dist/` and `biomes/ancientsvalley/dist/` stay byte-identical until the Line branch merges:

- `40b-tr-line-compat.js`: adds `LINE_FORMS` / `RUIN.line`, `KTRANSIT.profile` `'given'` mode, and `KTRANSIT.draw.frames` / `lining` onto `KTRANSIT`.
- `43c-tr-line.js`: `KTRANSIT.line`, `KTRANSIT.lineWindow`, `KTRANSIT.lineCarveH`, `KTRANSIT.lineProfile` (`[G data]`).
- `56c-tr-draw-line.js`: `KTRANSIT.draw.line` (`[draw]`), preserving `KTRANSIT.draw.highway`'s deck-builder helper alongside the 4-track gallery, cutting, guideways, crossovers, doors, and station platforms.

Used by `settlements/nulab` (Step N6: Station 5, the lake viaduct, and the Nulab-Chimes tunnel portal).
