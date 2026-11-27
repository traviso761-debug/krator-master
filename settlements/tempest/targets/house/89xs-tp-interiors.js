// TARGET: house — the House's interiors ON by default (PLAN.md step 3), as Strongwall's page has its fort's: the page is Xanadu's,
// whose interiors (settlements/xanadu/src/89y-xa-interiors.js) are off unless ?interiors=1 (89y reads KFURN.flags(false) as it
// loads); one House is cheap enough to furnish, so this page asks for them before 89y loads; ?interiors=0 turns them off. The
// rooms are the set `xanadu-tempest` (src/80v-tp-interiors.js).
{const f0=KFURN.flags;KFURN.flags=()=>f0(true);}
