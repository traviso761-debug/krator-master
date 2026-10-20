// TARGET: kept — two of the Ancients' bodies as the True Heirs keep them (kits/eternian/PLAN.md section 7, P5).
//
// The Eternal State's other seats: the Plymouth arcology (the residential mountain) and Arcoindian I (the cliff arcology), drawn
// intact and then KEPT by 8aq5-kept-pass.js: every glazed opening the Ancients' glass went from infilled with a bronze
// tracery grid over alabaster, the shell polished, the cyan strips alive on a seeded fraction of runs. The pass works on
// the bodies' materials, not their builders, so the Ancients kit is untouched (the owner chose Plymouth and Arcoindian I,
// 2026-10-20). Their own targets still show them intact and ruined.
const TITLE='The kept hosts — Plymouth and Arcoindian';
const GROUND_C=-1700;
const DECAYS=[0];
// Plymouth at x = -980 on z = 0 (732 x 524 m); Arcoindian's site runs z -1 320 to +960 about its origin, so it stands
// 3 400 m north
const ROWS={
 plymouth:{z:0,s:980,r:620},
 arcoindian:{z:-3400,s:1650,r:1100},
};
const RUINS=[];
const EXTRA_BUILDERS={plymouth:buildPlymouth,arcoindian:buildArcoindian};
