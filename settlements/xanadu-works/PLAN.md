# Xanadu's works sheet: the plan

`settlements/xanadu/WORKS-PLAN.md` is the spec (sections 1, 2, 5 and 7). This sheet is its step W3; W1 (core/hamlet's camp census,
the stamp mill and the sorting shed) came with it; W4 (the camps on their regions' ground, the ore road and the ferry) waits
for the vertical stack.

## Core adoption

| Need | Module | How |
|---|---|---|
| The camps | `core/hamlet` (`KHAMLET.village`), `core/hamlet/xanadu/23` (`xanaduRow`, the `mine`, `mill`, `diggings`, `landing` foci), `core/hamlet/camp/26` (the camp census, `spec.share`) | sealed in `gen/69w-works-core.js` |
| Overlap and the frontage | `core/space`, `core/city/33-city-strategies.js` (`KCITY.prim`) | sealed with core/hamlet (Xanadu's page keeps core/space out of its global scope) |
| The records | `core/region/data/xan-tune.js` (`XAN_TUNE.valley`) | sealed, read in place at every build |
| Placement seeds | `core/rand` (`KRAND`) | through Xanadu's build; every camp's seed a hash of the sheet's seed and the record's id |
| Registration | `core/tags` (REG through Xanadu's 91t; the Glaziers' id `core/tags/glazier/52g`) | every placement before it is drawn |
| The heaps | `core/terrain/37c-core-rubble.js` (`KRUBBLE`) | kit.json external |
| The drawn ground | `core/drawn` (`KDRAWN.grid`) | kit.json files |
| The Glaziers' houses | `kits/tungang` (`tungang_bundle.py`, `TG.gz.draw`) | `gen/69w2-tungang-bundle.js`, its maps beside the page |
| Sky, camera, probe, host | `core/host`, KratorSky | through Xanadu's page |

No PRNG, noise, terrain, water shader or sky of its own; no `getImageData`.
