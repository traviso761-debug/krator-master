// ================================================================= THE IZIZ CLUSTER: the abyssal savannah kit in an open world
// [G data] core/world's flora (85-world-flora.js) reads a kit as {SPECIES, PASSES: [{sp, cell, accept(Z, x, z), opt}],
// zones, make, grow}, one entry per registry (the Ring Sea isles kit's RINGISLES.world() is the model). The savannah kit's
// own pass table (biomes/abyssal-savannah/src/55: ABSAV.PASSES) is its page's shape: `k` a species of its own, `ea` one of
// the eastern abyss's it borrows (EASTABYSS.make / grow, in that kit's registry), `scale(Z)` the borrow's size. This
// presents it as two entries:
//   ABSAV_WORLD.absav       its own five trees, the passes that name them, its zones, ABSAV.make / grow
//   ABSAV_WORLD.eastabyss   the eastern abyss's six species it borrows, their passes (the pass's scale as opt.size),
//                           the savannah's zones, EASTABYSS.make / grow (its own registry)
// Both grow where the savannah rims' overlays are: WORLD.kitW gives the eastabyss entry the savannah's weight (the world maps
// one kit to an overlay). The kit's own world fragment belongs in biomes/abyssal-savannah (as ringisles' 66); it lives
// here until that kit's session takes it (KNOWN_ISSUES.md), because a new fragment in its src/ would change its page.
// This is a copy of openworld/pinnacle/src/49-world-absav.js (the same kits): the two leave for the kit together.
var ABSAV_WORLD=(function(){'use strict';
const EA=typeof EASTABYSS!=='undefined'&&EASTABYSS.make&&EASTABYSS.grow?EASTABYSS:null;
const own=[],borrowed=[],EASP=[],EAI=[];
ABSAV.PASSES.forEach(P=>{const opt={pad:P.pad==null?3:P.pad,patch:P.patch,patchScale:P.patchScale};
 if(P.ea!=null){if(!EA)return;let i=EAI.indexOf(P.ea);if(i<0){i=EAI.length;EAI.push(P.ea);EASP.push(EA.SPECIES[P.ea]);}
  borrowed.push({sp:i,cell:P.cell,accept:(Z,x,z)=>P.accept(Z,x,z),opt:Object.assign(opt,{size:(T,Z)=>{T.H*=P.scale(Z);}})});}
 else own.push({sp:P.k,cell:P.cell,accept:(Z,x,z)=>P.accept(Z,x,z),opt});});
const absav={name:'abyssal-savannah',SPECIES:ABSAV.SPECIES,PASSES:own,zones:ABSAV.zones,make:ABSAV.make,grow:ABSAV.grow};
const eastabyss=EA?{name:'eastabyss',SPECIES:EASP,PASSES:borrowed,zones:ABSAV.zones,
 make:(sp,x,y,z)=>{const T=EA.make(EAI[sp],x,y,z);T._ea=EAI[sp];return T;},
 grow:(T,lv)=>{const sp=T.sp;T.sp=T._ea==null?EAI[sp]:T._ea;try{return EA.grow(T,lv);}finally{T.sp=sp;}}}:null;
/* the eastabyss entry takes the savannah's weight (47-world-kits.js lists the savannah first, then the eastern abyss) */
const kw=WORLD.kitW;WORLD.kitW=(k,x,z)=>kw(k===1?0:k,x,z);
return{absav,eastabyss,EAI};})();
