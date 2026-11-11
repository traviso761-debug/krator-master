// ================================================================= DAM BASINS — the east bed's forest, built (PLAN.md, D2 for station 3)
// The hyperjungle's trees and floor on the station's ground (91m-bio-45-db-init.js bound it, its mask the bed's bands), no fauna (the
// fauna kit's, later), at half its quality (Korona takes .7 on its own floor; this window carries the hulks and the wall too), its
// heroes to 1.2 km; then one bake and its far trees' impostors. window._flora reports what it placed; ?flora=0 none of it.
window._flora=null;
if(new URLSearchParams(location.search).get('flora')!=='0'){try{
 const t0=performance.now(),out=HYPERJUNGLE.build({R:DB_FL.R-80,quality:.5,heroR:1200,fauna:false});const b=BIO.bake();
 if(BIO.bakeImpostors){try{BIO.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('impostors: '+e.stack);}}
 window._flora={trees:out.trees,hyper:out.hyper,inst:b.inst,calls:b.calls,ms:Math.round(performance.now()-t0)};}
 catch(e){reportErr('flora: '+e.stack);}}
