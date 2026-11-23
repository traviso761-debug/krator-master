// ================================================================= THE KHAAYKEN'S SCALE ON THE CATALOG (PLAN.md, the scale note; Y5)
// The Khaayken stand 1.15 times a human (YT_S), and so does what they make: the khaayken catalog culture file draws its pieces
// at their size already. Every other catalog piece placed in their rooms (the generic goods, the trades) is drawn YT_S times
// its catalog size through core/furnish's opt-in scale (cfg.scale, 50-core-furnish.js), so a pot or a sack is the size a
// Khaayken would make it. The war loot stays its own size: an Eternian chest in a Khaayken room is a human's chest.
SVF.cfg.scale=(key,A)=>A&&(A.culture==='khaayken'||A.culture==='eternian')?1:YT_S;
