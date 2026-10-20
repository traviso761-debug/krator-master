// ================================================================= HOST — the town's plan (P3a), made before the kits build
// PRT (54-pr-town.js) on this page's rock and roost plan, with the Beast Riders' buildings' declared sizes (CAT.dims, the
// bundle build.py makes): every lot and landmark registered in core/tags (the biome core's registry) before anything is
// drawn (89c draws the records). The trades the town carries are counted against the kit's census table (BR_TRADES).
const TOWN=(function(){try{const t0=performance.now();
 const T=PRT.plan({K:KSTACKS,rock:ROCK,mesa:MESA_B,PR,roost:ROOST,dims:(k,v)=>CAT.dims(k,v),tags:BIO.tagReg(),seed:null});
 T.ms=Math.round(performance.now()-t0);T.trades=PRT.trades(CAT.TRADES,T.lots);return T;}
 catch(e){reportErr('town plan: '+(e&&e.stack||e));return null;}})();
_mark('townplan');
