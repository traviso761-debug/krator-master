// ================================================================= DAM BASINS — the graveyard's flora, built (PLAN.md, D2)
// The n semiarid kit's trees and floor on the station's ground (91m-bio-45-db-init.js bound it): every tree built unique (no
// variants pool: that is the kit's own page's host), at three-fifths of the kit's quality over its 2.6 km window, then one bake.
// The kit's wind is the bed's prevailing one (DB.wind). window._flora reports what it placed; ?flora=0 none of it.
window._flora=null;
if(new URLSearchParams(location.search).get('flora')!=='0'){try{
 NSEMIARID.setWind(DB.wind);
 const t0=performance.now(),out=NSEMIARID.build({R:DB_FL.R-80,quality:.6});const b=BIO.bake();
 window._flora={trees:(NSEMIARID.TREES||[]).length,inst:b.inst,calls:b.calls,ms:Math.round(performance.now()-t0),counts:NSEMIARID.COUNTS||null,under:out.under||null};}
 catch(e){reportErr('flora: '+e.stack);}}
