# openworld/xanadu-lake-shore: known issues

- **No town at Erehwon here.** The city is settlements/xanadu's Erewhon page; until it is placed as a town footprint
  (`core/world` towns), the region shows Erehwon's ring and roads round an empty shore.
- **Erehwon's farm-1 has no ground.** Its spot (bearing 70, 8 km) is out on the lake as edit 7 re-made it; the planner
  finds no dry ground within 3 km, so five of the ring's six villages are laid. The spec is xanadu-oidong-highrift's,
  copied: move the village in both regions together, or not at all.
- **The shore towns and the isles have no plan.** Their squares hold the shore's ground for the towns on `core/city`
  and the isles' hamlets (settlements/xanadu/BUILD-OUT.md, section 1c).
- **No roads between the shore towns.** The corridors give them ground; the links wait for the towns.
- **The long isle's south half is in the cut** (Erehwon's 30 km square reaches it). It is not a site here; its page is
  settlements/azure-dream.

- **The Great Caravan's halt (2026-11-23, settlements/xanadu/WORKS-PLAN.md W2).** Planned at load by
  `openworld/xanadu-oidong-highrift/src/48t-world-camps.js` from `WORLD_CAMPS` (src/48-world-site.js), drawn by its 88t: its
  tents are massing (no Tents kit bundle for another world), the caravan's Dalab dress falls back to the generic canvas, and the
  halt stands only in its windows (year days 311-325 and 107-121, *proposed*): the page's default day 0 (year day 259) shows it
  struck, so `?day=52` (year day 311) shows it pitched.
