# Reed Lake — known issues

Open items are `- [ ]` lines; build.py prints them.

- [ ] No reclaimed-metal variants yet (the Highlands round-3 `88-hl-dress.js` pass is not vendored; the lake's only salvage is at the smithy).
- [ ] Boats and islands do not bob; only the water map moves (`94-rl-anim.js`).
- [ ] The reed beds round a pad are placed by angle from the pad centre, so a boat moored just off the landing can stand in reeds on a very irregular outline.
- [ ] Row labels overlap in the whole-kit overview (the label atlas is the vendored Highlands one; per-row views are clean).

## Level of detail (core/lod)

- [x] No LOD: `core/lod` now takes over both pages (README, "Level of detail"). The village is small: the overview
      drops from 223k to 72k triangles, close views by about 10%.
