// TARGET: fort — the fort's interiors ON by default (the owner, 2026-11-22: "wire in interiors"; PLAN.md step F4). The page is
// Xanadu's, whose interiors (settlements/xanadu/src/89y-xa-interiors.js) are off unless ?interiors=1: 89y reads KFURN.flags(false)
// as it loads, and wraps the kit's mass and opening helpers only when they are on. One fort is cheap to furnish, so this page asks
// for them by default, before 89y loads; ?interiors=0 turns them off. The fort's rooms are kits/xanadu 80g's set `xanadu-fort`.
{const f0=KFURN.flags;KFURN.flags=()=>f0(true);}
