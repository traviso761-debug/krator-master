# openworld/outposts: port audit

*Written by hand: `tools/audit_port.py` tags builds, and this folder is shared open-world data, not a build. Keep the row
current when a fragment is added; `tools/check_port.py openworld/outposts` (a `tools/test_all.py` step) lints it.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` · `[G native]` · `[web]` host code · `[draw]` a three.js builder.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/10-outposts-registry.js` | 23.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the player's settlements (KOUTPOST): records, the op log, the founding rule, refs across to the NPC world, candidates; reads KRAND and KSPACE; GDScript twin to come (PLAN.md section 11) |
