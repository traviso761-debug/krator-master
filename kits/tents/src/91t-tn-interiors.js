// ================================================================= INTERIORS AND THE WALK: each world build's fresh state
// core/engine's furniture adapter (91f-furnish.js) makes a fresh catalog batch per world build (svfNewBatch); the Tents kit adds
// kits/interiors' runtime adapter over that batch (the rooms of kits/interiors/sets/tents.js are furnished into it: 46-tn-roles.js
// tnInterior), clears core/walk (the rooms' floors and walls go in as each tent is placed; the doors' blocks follow in
// svOpenFlush) and the kit's own audit lists (the stakes, the interiors).
const tnNewBatch0=svfNewBatch;
svfNewBatch=function(){tnNewBatch0();SVF.adapter=KratorInteriors.runtimeAdapter(KratorFurniture,SVF.batch);
 if(typeof KWALK!=='undefined')KWALK.clear();TN_STAKES.length=0;TN_INTERIORS.length=0;};
